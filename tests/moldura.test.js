// moldura.test.js (F0.6/F0.6b) — MATRIZ de enquadramento em navegador REAL.
//
// Por que Chromium e não jsdom: o jsdom não faz layout, então getBoundingClientRect()
// é sempre 0 — não dá para medir o RECT lá. E foi o RECT que achou dois bugs (palco
// cortado à direita; barra com a energia errada). Aqui medimos o rect real contra a
// viewport, em vários tamanhos, com e sem safe-area lateral.
//
// F0.6b: a suíte NÃO recopia a fórmula. Ela CHAMA calcularEnquadramento (a regra) e
// compara com o que o navegador REALMENTE aplicou (escala do transform + largura da
// caixa). A spec dos números está em tests/enquadramento.test.js.
//
// Browser: usa o Chromium pré-provisionado (/opt/pw-browsers) quando existe; no CI,
// `npx playwright install chromium` resolve o browser e o launch acha sozinho.

const { chromium } = require('playwright');
const { calcularEnquadramento } = require('../src/enquadramento.js');
const fs = require('fs');
const path = require('path');

// paisagem de celulares/tablets reais + um grande (proporção diferente)
const TAMANHOS = [
  [667, 375], [726, 312], [740, 360], [800, 360], [844, 390],
  [892, 412], [915, 412], [926, 428], [1180, 820],
];
// retrato: deve mostrar o "gire o aparelho" e esconder o palco, sem quebrar nada
const RETRATOS = [[360, 740], [412, 915]];
const SAFE = 48;   // faixa de safe-area lateral simulada (notch/gestos)
const EPS = 0.6;
// Piso de LEGIBILIDADE (substitui o antigo piso de ESCALA 0,80 — ver DECISOES.md).
// O que protege a leitura é o TAMANHO FINAL do texto em px FÍSICOS, não a proporção
// do palco: menorTextoDesign × escala × DPR. Renderizamos de verdade em DPR 2 e 3
// (o real dos aparelhos de hoje) e cobramos o piso — CRAVADO, não mais reportado.
const MENOR_TEXTO_DESIGN = 8; // menor texto do jogo no palco, px de design (shell.html
                              // .skill__cost.gratis span / .effect__turns). Spec: enquadramento.test.js
const PISO_FISICO = 11;       // px físicos mínimos para leitura confortável em celular
const DPRS = [2, 3];          // DPR real dos aparelhos de hoje (não só 1)

function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try {
    const base = '/opt/pw-browsers';
    const dir = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().pop();
    if (dir) { const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; }
  } catch (e) { /* não pré-provisionado — deixa o playwright resolver */ }
  return undefined;
}

let falhas = 0;
function ok(cond, msg) { if (!cond) { falhas++; console.log('  XX ' + msg); } }

(async () => {
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  const page = await (await browser.newContext()).newPage();
  await page.goto('file://' + distAbs, { waitUntil: 'load' });

  // == §261 PORTÃO DAS FONTES REAIS: antes de QUALQUER medição visual, prova que Cinzel/Rajdhani
  // LOCAIS estão ativas — não o fallback. O sandbox nunca alcançou o Google (§260), então por
  // §238..§259 TODA medição de encaixe rodou contra o serif/sans, mais estreito, e aprovou uma
  // tipografia que o jogo nunca teve. Se as fontes reais não carregarem, a suíte QUEBRA ALTO aqui
  // em vez de medir errado em silêncio. Babá: troque a fonte por serif e este portão cai. ==
  await page.setViewportSize({ width: 800, height: 360 });
  const fonteGate = await page.evaluate(async () => {
    try { await document.fonts.ready; } catch (e) {}
    const cv = document.createElement('canvas'), cx = cv.getContext('2d');
    const s = 'Alianças, conflitos e oportunidades';
    const wC = (cx.font = '900 26px Cinzel', Math.round(cx.measureText(s).width));
    const wS = (cx.font = '900 26px serif', Math.round(cx.measureText(s).width));
    return { cinzel: document.fonts.check('900 26px Cinzel'), raj: document.fonts.check('700 12px Rajdhani'), wC, wS };
  });
  const fontesReais = fonteGate.cinzel && fonteGate.raj && fonteGate.wC > 500 && fonteGate.wC !== fonteGate.wS;
  ok(fontesReais, `§261: as FONTES REAIS (Cinzel/Rajdhani locais) têm de estar ativas antes de medir (Cinzel ${fonteGate.wC}px, serif ${fonteGate.wS}px, check ${fonteGate.cinzel}/${fonteGate.raj})`);
  if (!fontesReais) {
    console.error('\n!! PORTÃO DAS FONTES FALHOU: o ambiente está medindo no FALLBACK, não em Cinzel/Rajdhani.');
    console.error('   Toda asserção visual abaixo seria FALSA. Abortando alto (§261).');
    console.log('\n>>> ' + falhas + ' FALHA(S)');
    await browser.close();
    process.exit(1);
  }
  console.log(`== §261 portão OK: Cinzel ${fonteGate.wC}px ≠ serif ${fonteGate.wS}px — fontes reais ativas ==`);

  async function medir(w, h, safe) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate((s) => {
      const id = 'safeinject';
      const old = document.getElementById(id); if (old) old.remove();
      if (s) {
        const el = document.createElement('style'); el.id = id;
        el.textContent = '#safeprobe{padding-left:' + s + 'px;padding-right:' + s + 'px}';
        document.head.appendChild(el);
      }
      dispatchEvent(new Event('resize'));
    }, safe ? SAFE : 0);
    return await page.evaluate(() => {
      const st = document.getElementById('stage');
      const r = st.getBoundingClientRect();
      const de = document.documentElement;
      const m = (st.style.transform.match(/scale\(([0-9.]+)\)/) || [])[1];
      return {
        L: r.left, T: r.top, R: r.right, B: r.bottom, W: innerWidth, H: innerHeight,
        scale: +(+m).toFixed(4), boxW: parseFloat(getComputedStyle(st).width),
        sw: de.scrollWidth, sh: de.scrollHeight, cw: de.clientWidth, ch: de.clientHeight,
      };
    });
  }

  console.log('== matriz: o jogo aplica o que a regra manda, dentro da viewport ==');
  for (const [w, h] of TAMANHOS) {
    for (const safe of [false, true]) {
      const r = await medir(w, h, safe);
      const rot = (w + 'x' + h) + (safe ? ' safe48' : '');
      const larguraUtil = r.W - (safe ? 2 * SAFE : 0), alturaUtil = r.H;
      const esperado = calcularEnquadramento({ larguraUtil, alturaUtil });
      // 1) o jogo aplicou a ESCALA que a regra manda (não uma cópia da fórmula)
      ok(Math.abs(r.scale - esperado.escala) < 0.002, `${rot}: escala aplicada ${r.scale} != regra ${esperado.escala.toFixed(4)}`);
      // 2) o jogo aplicou a LARGURA DE DESIGN que a regra manda
      ok(Math.abs(r.boxW - esperado.larguraDesign) < 1, `${rot}: largura aplicada ${Math.round(r.boxW)} != regra ${Math.round(esperado.larguraDesign)}`);
      // 3) o palco não extrapola a viewport
      ok(r.L >= -EPS && r.T >= -EPS && r.R <= r.W + EPS && r.B <= r.H + EPS,
        `${rot}: palco EXTRAPOLA (L${Math.round(r.L)} T${Math.round(r.T)} R${Math.round(r.R)} B${Math.round(r.B)} em ${r.W}x${r.H})`);
      // 4) a página não rola
      ok(r.sw <= r.cw && r.sh <= r.ch, `${rot}: página ROLA (${r.sw}x${r.sh} vs ${r.cw}x${r.ch})`);
      // 5) com safe-area, respeita a faixa lateral
      if (safe) ok(r.L >= SAFE - EPS && r.R <= r.W - SAFE + EPS, `${rot}: invade safe-area (L${Math.round(r.L)} R${Math.round(r.R)})`);
      // 6) tarja ZERO em pelo menos um eixo (largura fluida cobre um dos dois)
      const cheioH = (r.R - r.L) >= larguraUtil - EPS, cheioV = (r.B - r.T) >= alturaUtil - EPS;
      ok(cheioH || cheioV, `${rot}: sobra tarja nos DOIS eixos (largura ${Math.round(r.R - r.L)}/${larguraUtil}, altura ${Math.round(r.B - r.T)}/${alturaUtil})`);
    }
  }

  // §329: obsoleto — a geometria de batalha §214/§257 (fileiras .brow/.brow__tiles, rodapé .footer, ficha 90,
  // faixa do HUD acima das fileiras) foi refeita: o campo agora é posicionamento ABSOLUTO em #baselayer.bt, sem
  // fileiras nem rodapé. A seção de medição geométrica dessas fileiras foi removida junto com o layout que media.

  // §329: obsoleto — a MOLDURA §239 (.brow__unit unindo retrato+habilidades, inimigo "fora" dela, ficha colada,
  // posição imóvel entre turnos) não existe mais: retrato, vida, efeitos e habilidades viraram irmãos absolutos.
  // A ênfase por turno (turno-eu/turno-eles no #baselayer) PERMANECE e segue coberta em render_sweep.test.js.

  // == §220: DETALHE do deus — arte quadrada (sem corte feio), nome não coberto, skill ≥76, texto sem rolar ==
  console.log('== geometria (§220): detalhe do deus — arte, nome, toque das skills, texto ==');
  {
    await page.setViewportSize({ width: 926, height: 428 });
    const g = await page.evaluate(() => {
      // §284-ajuste2: a maior descrição vem de data/deuses (GODS), a MESMA fonte que a tela agora lê.
      let best = { len: 0 };
      for (const k in GODS) { const gg = GODS[k];
        (gg.ab || []).forEach(a => { if (a.desc && a.desc.length > best.len) best = { len: a.desc.length, k, s: a.slot }; });
        if (gg.passiva && gg.passiva.desc && gg.passiva.desc.length > best.len) best = { len: gg.passiva.desc.length, k, s: 'passiva' };
      }
      perfil.deuses[best.k] = perfil.deuses[best.k] || { obtidoEm: Date.now() };
      ir('deus', { key: best.k }, { substituir: true }); render(); deusSel = best.s; render();
      const R = el => el.getBoundingClientRect();
      const art = R(document.querySelector('.dart')), nome = R(document.querySelector('.dart__nome'));
      const kit = R(document.querySelector('.dkit'));
      const sk = [...document.querySelectorAll('.dsk')].map(R);
      const txt = document.querySelector('.ddet');   // §284-ajuste2: a casca .ddet é o contêiner de rolagem do detalhe
      return {
        artW: art.width, artH: art.height, artB: art.bottom,
        nomeTop: nome.top, kitTop: kit.top,            // o nome (na arte, esq) não pode ser coberto pelo kit (col, dir)
        nomeDentroDaArte: nome.left >= art.left - 0.6 && nome.right <= art.right + 0.6,
        skMin: Math.min(...sk.map(s => Math.min(s.width, s.height))),
        txtScroll: txt.scrollHeight, txtClient: txt.clientHeight, len: best.len,
      };
    });
    ok(Math.abs(g.artW - g.artH) <= 3, `a arte é ~quadrada (não corta feio): ${Math.round(g.artW)}x${Math.round(g.artH)}`);
    ok(g.nomeDentroDaArte, 'o nome fica dentro da arte (à esquerda), longe da coluna de chips/tag');
    ok(g.skMin >= 76, `o toque de cada skill é >=76px (menor lado ${Math.round(g.skMin)})`);
    ok(g.txtScroll <= g.txtClient + 1, `a maior descrição (${g.len} chars) cai no detalhe sem rolar (${g.txtScroll}/${g.txtClient})`);
    console.log(`  arte ${Math.round(g.artW)}x${Math.round(g.artH)} · skill toque ${Math.round(g.skMin)}px · maior texto ${g.len} chars sem rolar`);
    await page.evaluate(() => { ir('home', {}, { substituir: true }); render(); });
  }

  console.log('== retrato: mostra "gire o aparelho", esconde o palco ==');
  for (const [w, h] of RETRATOS) {
    const vis = await (async () => {
      await page.setViewportSize({ width: w, height: h });
      await page.evaluate(() => dispatchEvent(new Event('resize')));
      return page.evaluate(() => ({
        rot: getComputedStyle(document.getElementById('rot')).display,
        vp: getComputedStyle(document.getElementById('viewport')).display,
      }));
    })();
    ok(vis.rot !== 'none', `${w}x${h} retrato: aviso de girar deveria aparecer (display ${vis.rot})`);
    ok(vis.vp === 'none', `${w}x${h} retrato: palco deveria estar oculto (display ${vis.vp})`);
  }

  // == legibilidade: menor texto físico >= piso, RENDERIZADO em DPR 2 e 3 ==
  // Substitui o antigo piso de escala. Criamos um contexto por DPR (deviceScaleFactor),
  // medimos a escala REALMENTE aplicada e cobramos menorTextoDesign × escala × DPR >=
  // PISO_FISICO. A escala é independente do DPR (layout em px CSS) — medir nos dois prova
  // isso e computa o tamanho físico do texto de verdade, não por fórmula recopiada.
  console.log(`== legibilidade: menor texto físico >= ${PISO_FISICO}px (menor design ${MENOR_TEXTO_DESIGN}px, DPR ${DPRS.join(' e ')}) ==`);
  for (const dpr of DPRS) {
    const ctx = await browser.newContext({ deviceScaleFactor: dpr });
    const pg = await ctx.newPage();
    await pg.goto('file://' + distAbs, { waitUntil: 'load' });
    console.log(`  -- DPR ${dpr} --`);
    for (const [w, h] of TAMANHOS) {
      await pg.setViewportSize({ width: w, height: h });
      await pg.evaluate(() => dispatchEvent(new Event('resize')));
      const escala = await pg.evaluate(() => {
        const st = document.getElementById('stage');
        return +((st.style.transform.match(/scale\(([0-9.]+)\)/) || [])[1]);
      });
      const fisico = MENOR_TEXTO_DESIGN * escala * dpr;
      ok(fisico >= PISO_FISICO,
        `${w}x${h} @DPR${dpr}: menor texto ${fisico.toFixed(1)}px < piso ${PISO_FISICO}px (escala ${escala.toFixed(3)})`);
      console.log(`    ${(w + 'x' + h).padEnd(9)} escala ${escala.toFixed(3)}  texto ${fisico.toFixed(1)}px${fisico < PISO_FISICO ? '  XX < ' + PISO_FISICO : ''}`);
    }
    await ctx.close();
  }

  // §329: obsoleto — a medição de SATURAÇÃO dos três níveis de disco §238 (classes nv-pronto/nv-indispon/nv-recuo
  // no .skill--habilidade) foi removida: §329 refez o disco (.bt-skill__disc) e os estados viraram is-ready/
  // is-cooldown/is-off, sem os três níveis de arte medidos por pixel aqui.

  // §329: obsoleto — a hierarquia "retrato > ficha" §258/§214 (retrato .brow__ally/.brow__enemy .portrait, ficha
  // .brow__tiles .skill 90×90, barra .hp sobre a arte, faixa de etiquetas .fxtags abaixo da vida dentro do .board)
  // não existe mais: §329 posiciona retrato, vida e habilidades em absoluto (.bt-portrait/.bt-hp/.bt-skill/.bt-eff).

  // == §260: FONTES LOCAIS — o jogo publicado NÃO faz requisição a domínio externo; a tipografia é
  // verdadeira SEM REDE (Cinzel/Rajdhani locais, não o fallback serif). ==
  console.log('== §260 fontes locais: zero requisição externa + Cinzel/Rajdhani resolvem sem rede ==');
  {
    const html = fs.readFileSync(distAbs, 'utf8');
    // GUARDA 1: nenhum domínio externo de fonte/terceiro no HTML publicado (babá: re-adicione o link do Google e cai)
    ok(!/fonts\.googleapis\.com|fonts\.gstatic\.com|googleapis|gstatic/i.test(html), 'nenhuma referência a Google Fonts no dist');
    const linksExternos = (html.match(/<link[^>]+href=["']https?:\/\/[^"']+/gi) || []);
    ok(linksExternos.length === 0, `nenhum <link> a domínio externo (achei: ${linksExternos.slice(0,2).join(' ')})`);
    // GUARDA 2: as fontes locais existem no dist e o @font-face aponta para elas (babá: apague um woff2 e cai)
    const distFontes = path.join(path.dirname(distAbs), 'fonts');
    const woff2 = fs.existsSync(distFontes) ? fs.readdirSync(distFontes).filter(f => f.endsWith('.woff2')) : [];
    ok(woff2.length === 8, `os 8 woff2 locais no dist/fonts (há ${woff2.length})`);
    ok(/@font-face\{[^}]*font-family:\s*["']Cinzel["'][^}]*url\(fonts\/cinzel-latin\.woff2\)/i.test(html.replace(/\s+/g,' ')) ||
       /url\(fonts\/cinzel-latin\.woff2\)/.test(html), 'o @font-face aponta para fonts/cinzel-latin.woff2 local');
    ok(/url\(fonts\/rajdhani-700-latin\.woff2\)/.test(html), 'o @font-face aponta para as Rajdhani locais');

    // GUARDA 3: SEM REDE, as famílias resolvem em Cinzel/Rajdhani (não no fallback). Bloqueia todo http(s).
    const nctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 800, height: 360 } });
    let httpHits = 0;
    await nctx.route('**/*', r => { if (/^https?:\/\//i.test(r.request().url())) { httpHits++; return r.abort(); } return r.continue(); });
    const npg = await nctx.newPage();
    await npg.goto('file://' + distAbs, { waitUntil: 'load' });
    await npg.evaluate(() => { ir('campanha', {}, { substituir: true }); render(); });
    await npg.waitForTimeout(1000);
    const f = await npg.evaluate(async () => {
      try { await document.fonts.ready; } catch (e) {}
      const cv = document.createElement('canvas'), cx = cv.getContext('2d');
      const s = 'Alianças, conflitos e oportunidades';
      const wC = (cx.font = '900 26px Cinzel', Math.round(cx.measureText(s).width));
      const wS = (cx.font = '900 26px serif', Math.round(cx.measureText(s).width));
      return { cinzel: document.fonts.check('900 26px Cinzel'), raj: document.fonts.check('700 12px Rajdhani'), wC, wS };
    });
    ok(httpHits === 0, `SEM REDE: zero requisições http(s) na carga (tentou ${httpHits})`);
    ok(f.cinzel && f.raj, 'Cinzel e Rajdhani resolvem sem rede (fonts.check)');
    ok(f.wC !== f.wS && f.wC > 500, `a arte é DE FATO Cinzel, não o fallback serif (Cinzel ${f.wC}px ≠ serif ${f.wS}px)`);   // babá: se cair no serif, wC==wS
    console.log(`  0 req http · Cinzel ${f.wC}px (serif seria ${f.wS}px) · 8 woff2 locais · nenhum link externo`);

    // §260 layout SEM REDE (contra a Cinzel REAL, não o fallback): nenhum nome de ato CORTA (§259: corte=defeito),
    // a legenda começa abaixo do cabeçalho de 51px e o texto da história cabe. (2 nomes longos QUEBRAM em 2 linhas
    // e isso é aceito pelo §259 desde que caibam — o que estas asserções garantem.)
    const capsN = await npg.evaluate(() => CAMPS().map(c => c.atos.length));
    const problemas = [];
    for (let ci = 0; ci < capsN.length; ci++) for (let ai = 0; ai < capsN[ci]; ai++) {
      const r = await npg.evaluate(({ ci, ai }) => {
        campCapIdx = ci; campAtoIdx = ai; render();
        const esc = ultimaEscala || 1, R = el => el.getBoundingClientRect();
        const nome = document.querySelector('.camp__nome'), leg = document.querySelector('.camp__legenda'),
          arte = document.querySelector('.camp__arte'), txt = document.querySelector('.camp__texto');
        const nr = R(nome), lr = R(leg), ar = R(arte), tr = R(txt);
        return { id: nome.textContent, corta: nome.scrollWidth > nome.clientWidth + 1,
          legTop: Math.round((lr.top - ar.top) / esc), txtCabe: tr.bottom <= ar.bottom + 1 };
      }, { ci, ai });
      if (r.corta) problemas.push(`${r.id} (corta na horizontal)`);
      if (r.legTop < 51) problemas.push(`${r.id} (legenda cruza o cabeçalho: ${r.legTop}<51)`);
      if (!r.txtCabe) problemas.push(`${r.id} (texto da história estoura)`);
    }
    ok(problemas.length === 0, `os 13 nomes: nenhum corta, legenda abaixo de 51px, texto cabe (problemas: ${problemas.join('; ')})`);
    console.log(`  layout sem rede: 13 nomes sem corte, legenda>51, texto cabe (2 longos em 2 linhas, cabem)`);
    await nctx.close();
  }

  // == §262 GUARDAS BABÁ (fontes REAIS, sem rede, largura de design MÍNIMA 780 = pior caso de encaixe) ==
  // C1: dica-mecânica INTEIRA nos 6 atos-aula (o line-clamp não elide). C2: o 3º card de inimigo fica
  // DENTRO do painel (era falso-positivo do §261: medição por clientWidth). C3: os 12 nomes CURTOS do
  // bestiário cabem nas duas caixas apertadas (briefing e retrato). C4: o apelido de 16ch não corta na
  // vertical (Cinzel alta + line-height). Roda contra o servidor de fontes local (woff2), rede bloqueada.
  {
    const g = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 780, height: 428 } });
    await g.route('**/*', r => { if (/^https?:\/\//i.test(r.request().url())) return r.abort(); return r.continue(); });
    const gp = await g.newPage();
    await gp.goto('file://' + distAbs, { waitUntil: 'load' });
    for (let i = 0; i < 30; i++) { const on = await gp.evaluate(async () => { try { await document.fonts.load('900 26px Cinzel'); await document.fonts.ready; } catch (e) {} return document.fonts.check('900 26px Cinzel'); }); if (on) break; await gp.waitForTimeout(200); }

    // -- C1: 6 dicas-aula inteiras (Prólogo cap 0, atos 1..6) --
    console.log('== §262 C1: dica-mecânica inteira nos 6 atos-aula (design 780) ==');
    for (let ai = 1; ai <= 6; ai++) {
      const r = await gp.evaluate((ai) => {
        campCapIdx = 0; campAtoIdx = ai; campSwap = {}; campVistaAto = null; ir('campanha', {}, { substituir: true }); render();
        const d = document.querySelector('.camp__mecdica'), brief = document.querySelector('.camp__brief'), cta = document.querySelector('.camp__cta');
        const br = brief.getBoundingClientRect(), cr = cta.getBoundingClientRect();
        return { id: CAMPS()[0].atos[ai].id, dicaCorta: d.scrollHeight > d.clientHeight + 0.5, briefEstoura: brief.scrollHeight > brief.clientHeight + 0.5, ctaDentro: cr.bottom <= br.bottom + 0.5 };
      }, ai);
      ok(!r.dicaCorta, `§262 C1: ${r.id} — a dica corta (line-clamp elidiu)`);
      ok(!r.briefEstoura, `§262 C1: ${r.id} — o painel do briefing estoura`);
      ok(r.ctaDentro, `§262 C1: ${r.id} — o botão CONTINUAR saiu do painel`);
    }

    // -- C2: o último card de inimigo (3 inimigos) fica dentro do content-box do painel (sonda, não clientWidth) --
    console.log('== §262 C2: 3º card de inimigo dentro do painel ==');
    const c2 = await gp.evaluate(() => {
      campCapIdx = 0; campAtoIdx = 4; campSwap = {}; campVistaAto = null; ir('campanha', {}, { substituir: true }); render();
      const brief = document.querySelector('.camp__brief'), cs = getComputedStyle(brief);
      const probe = document.createElement('div'); probe.style.cssText = 'width:100%;height:1px'; brief.insertBefore(probe, brief.firstChild);
      const contentR = probe.getBoundingClientRect().right; brief.removeChild(probe);
      const cards = [...document.querySelectorAll('.camp__inims .cinim')];
      const esc = ultimaEscala || 1;
      return { n: cards.length, folgaDir: +((contentR - cards[cards.length - 1].getBoundingClientRect().right) / esc).toFixed(2) };
    });
    ok(c2.n === 3 && c2.folgaDir >= -0.5, `§262 C2: o 3º card estoura o painel (folga à direita ${c2.folgaDir}px, esperado >= -0.5)`);

    // -- C3: os 12 nomes CURTOS do bestiário cabem nas duas caixas apertadas; e o render usa `curto` --
    console.log('== §262 C3: nomes curtos do bestiário nas caixas apertadas ==');
    const c3 = await gp.evaluate(() => {
      // caixa briefing (cinim__nome) — mede a largura interna real num ato de 3 inimigos
      campCapIdx = 0; campAtoIdx = 4; render();
      const cinim = document.querySelector('.camp__inims .cinim__nome'); const cCin = getComputedStyle(cinim);
      const boxCin = cinim.clientWidth, fontCin = cCin.fontWeight + ' ' + cCin.fontSize + ' ' + cCin.fontFamily.split(',')[0].replace(/['"]/g, '');
      // §329: obsoleto — o retrato de batalha não tem mais caixa de NOME (.portrait__nome); o nome é lido no painel/centro.
      // Resta a caixa apertada do BRIEFING (campanha), que §329 não mexeu.
      const curtos = BESTIARIO_DADOS.map(b => ({ key: b.key, curto: b.curto || b.nome, temCurto: !!b.curto }));
      const cv = document.createElement('canvas'), cx = cv.getContext('2d');
      const larg = (t, f, ls) => { cx.font = f; try { cx.letterSpacing = ls || 'normal'; } catch (e) {} return cx.measureText(t).width; };
      const cortaCin = curtos.filter(c => larg(c.curto, fontCin, 'normal') > boxCin).map(c => c.key);
      const semCurto = curtos.filter(c => !c.temCurto).map(c => c.key);
      return { total: curtos.length, boxCin, cortaCin, semCurto };
    });
    ok(c3.total === 12 && c3.semCurto.length === 0, `§262 C3: bestiário sem campo 'curto' em: ${c3.semCurto.join(', ')}`);
    ok(c3.cortaCin.length === 0, `§262 C3: nome curto corta no BRIEFING (${c3.boxCin}px): ${c3.cortaCin.join(', ')}`);
    // §329: obsoleto — a caixa de nome no RETRATO de batalha (.portrait__nome) sumiu; a asserção de corte no retrato foi removida.

    // -- C4: apelido de 16ch não corta na vertical (a barra de identidade, Cinzel alta) --
    console.log('== §262 C4: apelido sem corte vertical ==');
    const c4 = await gp.evaluate(() => {
      // §329: a barra de identidade da batalha usa .bt-name__nick (antes .prof__nick).
      st = novoEstado(['zeus', 'ogum', 'tyr'], ['sobek', 'brigid', 'ganesha'], 1, 0);
      prova = null; campanha = null; provaFim = null; campanhaFim = null; vsCPU = true; IA_LADO = 1;
      ir('batalha', {}, { substituir: true }); try { pararRelogio(); } catch (e) {} render();
      const e = document.querySelector('.bt-name__nick'); if (!e) return { ausente: true };
      const h0 = e.clientHeight;                       // altura com o nick curto (1 linha)
      e.textContent = 'ÁÇÃOJOGADORÍSSÍM';              // 16ch, maiúsculas altas + acentos
      const h1 = e.clientHeight;                       // §329: deve seguir 1 linha (não quebra/cresce)
      const cs = getComputedStyle(e);
      // §329: o nick trunca HORIZONTALMENTE por ellipsis (1 linha nowrap), nunca quebra nem corta na vertical.
      return { cresceu: h1 > h0 + 0.5, h0, h1, nowrap: cs.whiteSpace === 'nowrap', ellipsis: cs.textOverflow === 'ellipsis' };
    });
    ok(!c4.ausente && !c4.cresceu && c4.nowrap && c4.ellipsis,
      `§262 C4 (§329): o apelido de 16ch fica em 1 linha (ellipsis horizontal), sem quebrar/cortar na vertical (h ${c4 && c4.h0}→${c4 && c4.h1}, nowrap ${c4 && c4.nowrap}, ellipsis ${c4 && c4.ellipsis})`);
    await g.close();
  }

  // == §266 INFORMAÇÃO DOS MODIFICADORES: o P acende quando age, o chip mostra a magnitude, o talo cabe ==
  {
    const g = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 820, height: 428 } });
    await g.route('**/*', r => { if (/^https?:\/\//i.test(r.request().url())) return r.abort(); return r.continue(); });
    const gp = await g.newPage();
    await gp.goto('file://' + distAbs, { waitUntil: 'load' });
    for (let i = 0; i < 30; i++) { const on = await gp.evaluate(async () => { try { await document.fonts.load('900 26px Cinzel'); await document.fonts.ready; } catch (e) {} return document.fonts.check('900 26px Cinzel'); }); if (on) break; await gp.waitForTimeout(200); }

    // GUARDA 1 — a passiva AGINDO (Brígida aura no time) acende o P dos AFETADOS; a INATIVA fica apagada.
    console.log('== §266: P acende quando a passiva age (aura legível a partir do afetado) ==');
    const p1 = await gp.evaluate(() => {
      st = montarProvacao({ aliados: ['brigid', 'apolo', 'tyr'], inimigos: ['ghoul', 'silfo', 'quimera'], montar: { seed: 3, comeca: 0 } });
      prova = null; provaFim = null; campanha = null; vsCPU = true; try { pararRelogio(); } catch (e) {} armado = null; alvos = []; escolhidos = []; painelRecolhido = false; ir('batalha', {}, { substituir: true }); render();
      // §329: o "P" é .bt-portrait__pas, no retrato aliado (.bt-portrait--ally) / inimigo (.bt-portrait--foe).
      const ally = [...document.querySelectorAll('.bt-portrait--ally .bt-portrait__pas')].map(b => b.classList.contains('pas--on'));
      const foe = [...document.querySelectorAll('.bt-portrait--foe .bt-portrait__pas')].map(b => b.classList.contains('pas--on'));
      return { ally, foe };
    });
    ok(p1.ally.length === 3 && p1.ally.every(Boolean), `§266: sob a aura da Brígida os 3 P aliados ACENDEM (${JSON.stringify(p1.ally)})`);
    ok(p1.foe.every(x => !x), `§266: o P do inimigo (aura não o alcança) fica APAGADO — agindo é distinguível de parado (${JSON.stringify(p1.foe)})`);

    // GUARDA 2 — a aura é legível a partir do deus AFETADO: tocar o P do aliado mostra o valor E a fonte (no painel §329).
    const p2 = await gp.evaluate(() => { const ps = [...document.querySelectorAll('.bt-portrait--ally [data-pas]')]; if (ps[1]) ps[1].click();
      const t = document.querySelector('.bt-panel__desc') || document.querySelector('.bt-panel'); return t ? t.textContent.replace(/\s+/g, ' ') : ''; });
    ok(/\+1/.test(p2) && /Brigid/i.test(p2), `§266: a leitura do aliado AFETADO traz o +1 e a FONTE (Brígida, §324 P3): "${p2.slice(0, 60)}"`);

    // GUARDA 3 (§329) — o modificador numérico carrega a magnitude: no TÍTULO do ícone de efeito e no PAINEL ao tocar.
    // (§329: o ícone .bt-eff mostra os TURNOS no badge; a magnitude vive no título e no painel de inspeção.)
    console.log('== §329: a magnitude do efeito é legível (vulnerável +8, redução −5) ==');
    const p3 = await gp.evaluate(() => {
      st = montarProvacao({ aliados: ['zeus', 'nuwa', 'tyr'], inimigos: ['ghoul', 'silfo', 'quimera'], montar: { seed: 3, comeca: 0 } });
      prova = null; provaFim = null; campanha = null; vsCPU = true; try { pararRelogio(); } catch (e) {} armado = null; alvos = []; painelRecolhido = false;
      st.lados[1].units[0].efeitos = [{ type: 'vulneravel', v: 8, dur: 2 }, { type: 'dmgReduction', v: 5, dur: 2 }]; ir('batalha', {}, { substituir: true }); render();
      const foeUid = st.lados[1].units[0].uid;
      const effs = [...document.querySelectorAll(`.bt-eff[data-eff^="${foeUid}|"]`)];
      const titles = effs.map(e => e.getAttribute('title') || '');
      const vuln = effs.find(e => /vulner/i.test(e.getAttribute('title') || ''));
      if (vuln) vuln.click();   // tocar o efeito abre a inspeção no painel
      const painel = document.querySelector('.bt-panel'); const ptxt = painel ? painel.textContent.replace(/\s+/g, ' ') : '';
      return { nChips: effs.length, titles, ptxt };
    });
    ok(p3.titles.some(t => /\+8/.test(t)), `§329: o ícone de VULNERÁVEL carrega a magnitude +8 no título (títulos: ${JSON.stringify(p3.titles)})`);
    ok(/\+8/.test(p3.ptxt), `§329: tocar o efeito mostra a magnitude +8 no painel ("${p3.ptxt.slice(0, 80)}")`);
    ok(p3.titles.filter(t => /[+−]\d/.test(t)).length >= 2, `§329: os ícones numéricos carregam o número (${JSON.stringify(p3.titles)})`);

    // GUARDA 4 (§330) — a zona de efeitos é uma GRADE 2×3: até 6 efeitos aparecem todos (sem "+N") e a grade não
    // estoura na horizontal nem na vertical; com 7+ o excedente colapsa no "+N" (5 ícones + "+N" = 6 células).
    const medeGrade = async (efeitos) => gp.evaluate((efeitos) => {
      const u = st.lados[1].units[1]; u.efeitos = efeitos; render();
      const foeUid = u.uid;
      const effs = [...document.querySelectorAll(`.bt-eff[data-eff^="${foeUid}|"]`)];
      const grid = effs.length ? effs[0].closest('.bt-eff-grid') : null;
      const rb = grid ? grid.getBoundingClientRect() : null;
      const vw = document.documentElement.clientWidth;
      return { fora: rb ? (rb.left < -0.5 || rb.right > vw + 0.5) : true, n: effs.length, temMais: effs.some(e => e.classList.contains('bt-eff--mais')) };
    }, efeitos);
    const p4 = await medeGrade([{ type: 'dmgUp', v: 8, dur: 3 }, { type: 'dmgReduction', v: 5, dur: 2 }, { type: 'adormecido', dur: 2 }, { type: 'regen', v: 6, dur: 2 }, { type: 'invulneravel', dur: 1 }, { type: 'dmgDown', v: 4, dur: 2 }]);
    ok(!p4.fora, `§330: a grade com 6 efeitos não sai da tela na horizontal (${p4.n} ícones)`);
    ok(p4.n === 6 && !p4.temMais, `§330: 6 efeitos → 6 ícones na grade 2×3, sem "+N" (${p4.n} ícones, +N ${p4.temMais})`);
    const p4b = await medeGrade([{ type: 'dmgUp', v: 8, dur: 3 }, { type: 'dmgReduction', v: 5, dur: 2 }, { type: 'adormecido', dur: 2 }, { type: 'regen', v: 6, dur: 2 }, { type: 'invulneravel', dur: 1 }, { type: 'dmgDown', v: 4, dur: 2 }, { type: 'vulneravel', v: 3, dur: 2 }]);
    ok(!p4b.fora && p4b.n === 6 && p4b.temMais, `§330: 7 efeitos → 5 ícones + "+N" (${p4b.n} células, +N ${p4b.temMais})`);

    // GUARDA 5 (§267) — a redução do defensor com `contra` só acende quando o golpe MIRADO casa (simetria).
    console.log('== §267: redução com contra acende só quando o golpe mirado casa ==');
    const p5 = await gp.evaluate(() => {
      st = montarProvacao({ aliados: ['zeus', 'tyr', 'ares'], inimigos: ['sobek', 'ghoul', 'silfo'], montar: { seed: 3, comeca: 0 } });
      prova = null; provaFim = null; campanha = null; vsCPU = true; try { pararRelogio(); } catch (e) {} ELEMS.forEach(e => st.lados[0].orbs[e] = 6);
      armado = null; alvos = []; escolhidos = []; ir('batalha', {}, { substituir: true });
      const u = st.lados[0].units[0];
      armar(u.uid, 'basico'); render();
      const onBasico = document.querySelector('.bt-portrait--foe .bt-portrait__pas').classList.contains('pas--on');
      armado = null; alvos = []; armar(u.uid, 'habilidade'); render();
      const onHab = document.querySelector('.bt-portrait--foe .bt-portrait__pas').classList.contains('pas--on');
      return { onBasico, onHab };
    });
    ok(p5.onBasico, '§267: sobek (contra=básico) ACENDE quando o atacante arma um BÁSICO (casa)');
    ok(!p5.onHab, '§267: sobek NÃO acende quando o atacante arma uma HABILIDADE (não casa — o indicador não engana)');
    await g.close();
  }

  // == §278 DOMÍNIOS: a PÍLULA de progresso NUNCA quebra em 2 linhas, nos QUATRO estados, no piso 780. ==
  // Foi o defeito que o §278 introduziu (cartão de 172→134) e é do tipo que volta sozinho na próxima
  // mudança de largura. Semeamos os quatro estados no PIOR caso (nível 40/40) e medimos a altura real de
  // cada pílula contra a de UMA linha (auto-calibrada pela mais curta) — fontes reais, rede bloqueada.
  console.log('== §278: nenhuma pílula de progresso quebra em 2 linhas (4 estados, nível 40/40, piso 780) ==');
  {
    const g = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 780, height: 428 } });
    await g.route('**/*', r => { if (/^https?:\/\//i.test(r.request().url())) return r.abort(); return r.continue(); });
    const gp = await g.newPage();
    await gp.goto('file://' + distAbs, { waitUntil: 'load' });
    for (let i = 0; i < 30; i++) { const on = await gp.evaluate(async () => { try { await document.fonts.load('700 10px Cinzel'); await document.fonts.ready; } catch (e) {} return document.fonts.check('900 26px Cinzel'); }); if (on) break; await gp.waitForTimeout(200); }
    // semeia os 4 estados no pior caso (40/40) nas cinco culturas
    await gp.evaluate(() => {
      const cur = domSemanaChave(), ant = domChaveSemanaAnterior();
      const V = [120, 120, 120], run = e => Object.assign({ nivel: 1, vida: V, bonus: 0 }, e);
      const cs = Object.keys(DOMINIOS);
      let p = novoPerfil(0, 0);
      // ativo 40/40 · rec batido 40/40 (▲) · rec não-batido 40/40 · e dois "Não iniciado"
      p = definirRunDominio(p, cs[0], run({ status: 'ativo', nivel: 40, profundidade: 39, semana: cur }));
      p = definirRunDominio(p, cs[1], run({ status: 'concluida', nivel: 38, profundidade: 38, semana: ant }));
      p = definirRunDominio(p, cs[1], run({ status: 'concluida', nivel: 40, profundidade: 40, semana: cur }));
      p = definirRunDominio(p, cs[2], run({ status: 'concluida', nivel: 40, profundidade: 40, semana: cur }));
      perfil = p;
      ir('dominios', {}, { substituir: true }); render();
    });
    const prog = await gp.evaluate(() => {
      const els = [...document.querySelectorAll('.domcard__prog')];
      const hs = els.map(e => e.offsetHeight);
      const textos = els.map(e => e.textContent.replace(/\s+/g, ' ').trim());
      const uma = Math.min(...hs);   // a pílula mais curta é 1 linha (auto-calibra)
      return { hs, textos, uma };
    });
    const quebrou = prog.hs.filter(h => h > prog.uma + 3).length;
    ok(quebrou === 0, `§278: ${quebrou} pílula(s) quebram em 2 linhas a 780 (alturas ${JSON.stringify(prog.hs)}, textos ${JSON.stringify(prog.textos)})`);
    // e confirma que os quatro estados de fato apareceram (senão o guarda não provou nada)
    const estados = prog.textos.join(' | ');
    ok(/Em corrida 40\/40/.test(estados) && /Nível 40\/40 ▲/.test(estados) && /Nível 40\/40(?! ▲)/.test(estados) && /Não iniciado/.test(estados),
      `§278: os quatro estados apareceram no piso (recorde/batido/corrida/não-iniciado) — veio: ${estados}`);
    console.log(`  pílulas a 780: 1 linha=${prog.uma}px · alturas ${JSON.stringify(prog.hs)} · estados: ${estados}`);
    await g.close();
  }

  await browser.close();
  console.log(falhas === 0 ? '\n>>> MOLDURA OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

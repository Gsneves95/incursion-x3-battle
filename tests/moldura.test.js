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

  // == geometria da batalha (§214/§257): a última fileira NUNCA cruza o rodapé e a ficha
  // (círculo 90 aberto; cresce a 96 RECOLHIDO) NUNCA estoura a fileira. Medido em
  // navegador REAL a 926×428 (o palco de referência), com rect real, aberto e recolhido. ==
  console.log('== geometria (§214): fileira não cruza o rodapé; tile recolhido não estoura a fileira ==');
  {
    await page.setViewportSize({ width: 926, height: 428 });
    await page.evaluate(() => {
      vsCPU = false; st = novoEstado(['iara', 'zeus', 'ogum'], ['sobek', 'brigid', 'ganesha'], 1, 0); st.ativo = 0;
      ELEMS.forEach(e => st.lados[0].orbs[e] = 3);
      prova = null; campanha = null; provaFim = null; campanhaFim = null; painelRecolhido = false; peekKit = null;
      ir('batalha', {}, { substituir: true }); pararRelogio(); render();
    });
    const geo = async () => page.evaluate(() => {
      const rows = [...document.querySelectorAll('.brow')];
      const last = rows[rows.length - 1].getBoundingClientRect();
      const ft = document.querySelector('.footer').getBoundingClientRect();
      const r0 = rows[0].getBoundingClientRect();
      const tile = rows[0].querySelector('.brow__tiles .skill');
      const tr = tile ? tile.getBoundingClientRect() : null;
      return { lastB: last.bottom, ftT: ft.top, rowT: r0.top, rowB: r0.bottom,
        tileT: tr ? tr.top : null, tileB: tr ? tr.bottom : null, tileW: tr ? tr.width : null };
    });
    const a = await geo();
    ok(a.lastB <= a.ftT + EPS, `aberto: última fileira (${Math.round(a.lastB)}) cruza o rodapé (${Math.round(a.ftT)})`);
    ok(a.tileB <= a.rowB + EPS && a.tileT >= a.rowT - EPS,
      `aberto: tile estoura a fileira (tile ${Math.round(a.tileT)}..${Math.round(a.tileB)} vs fileira ${Math.round(a.rowT)}..${Math.round(a.rowB)})`);
    // RECOLHIDO: os tiles crescem, mas não podem cruzar o rodapé nem estourar a fileira
    await page.evaluate(() => { painelRecolhido = true; render(); });
    const c = await geo();
    ok(c.lastB <= c.ftT + EPS, `recolhido: última fileira (${Math.round(c.lastB)}) cruza o rodapé (${Math.round(c.ftT)})`);
    ok(c.tileB <= c.rowB + EPS && c.tileT >= c.rowT - EPS,
      `recolhido: tile estoura a fileira (tile ${Math.round(c.tileT)}..${Math.round(c.tileB)} vs fileira ${Math.round(c.rowT)}..${Math.round(c.rowB)})`);
    ok(c.tileW > a.tileW, `recolhido: os tiles deveriam crescer (${Math.round(a.tileW)}→${Math.round(c.tileW)}px)`);
    console.log(`  aberto: fila≤rodapé (${Math.round(a.lastB)}≤${Math.round(a.ftT)}) · recolhido: tile ${Math.round(a.tileW)}→${Math.round(c.tileW)}px, fila≤rodapé (${Math.round(c.lastB)}≤${Math.round(c.ftT)})`);

    // §207/§214: numa Provação (com HUD), a faixa do HUD termina ANTES das fileiras — medido de verdade.
    const hud = await page.evaluate(() => {
      prova = PROVACOES.find(x => x.key === 'durga'); provaFim = null; campanha = null; painelRecolhido = false;
      st = montarProvacao(prova); vsCPU = false; pararRelogio(); ir('batalha', {}, { substituir: true }); render();
      const ph = document.querySelector('.phud').getBoundingClientRect();
      const rows = [...document.querySelectorAll('.brow')];
      const r0 = rows[0].getBoundingClientRect();
      const last = rows[rows.length - 1].getBoundingClientRect();
      const ft = document.querySelector('.footer').getBoundingClientRect();
      return { phB: ph.bottom, rowT: r0.top, lastB: last.bottom, ftT: ft.top };
    });
    ok(hud.phB <= hud.rowT + EPS, `HUD: a faixa (${Math.round(hud.phB)}) cruza as fileiras (${Math.round(hud.rowT)})`);
    ok(hud.lastB <= hud.ftT + EPS, `HUD: a última fileira (${Math.round(hud.lastB)}) cruza o rodapé (${Math.round(hud.ftT)})`);
    console.log(`  com HUD: faixa≤fileiras (${Math.round(hud.phB)}≤${Math.round(hud.rowT)}), fila≤rodapé (${Math.round(hud.lastB)}≤${Math.round(hud.ftT)})`);
    await page.evaluate(() => { prova = null; painelRecolhido = false; ir('home', {}, { substituir: true }); render(); });
  }

  // == §239: MOLDURA (item 5) + ênfase que NÃO move (item 4). A placa (.brow__unit) passa por baixo do
  // retrato E das 4 habilidades, unindo-os; o retrato SOBREPÕE a borda de cima da placa (fica por cima).
  // As habilidades COLAM no retrato (esquerda), com respiro largo antes do inimigo (não centralizadas).
  // GUARDA PERMANENTE: a POSIÇÃO das habilidades é IDÊNTICA na minha vez e na do oponente. ==
  console.log('== geometria (§239): moldura sob o retrato + habilidades coladas + posição imóvel entre turnos ==');
  {
    await page.setViewportSize({ width: 926, height: 428 });
    // limpa a safe-area injetada pela matriz (senão o padding lateral desloca as posições absolutas)
    await page.evaluate(() => { const s = document.getElementById('safeinject'); if (s) s.remove(); dispatchEvent(new Event('resize')); });
    const medirFila = () => page.evaluate(() => {
      const R = el => el.getBoundingClientRect();
      const brow = document.querySelector('.brow');
      const unit = brow.querySelector('.brow__unit');
      const ur = R(unit);
      const cs = getComputedStyle(unit, '::before');
      const insetT = parseFloat(cs.top) || 0, insetB = parseFloat(cs.bottom) || 0;
      const por = R(brow.querySelector('.brow__ally .portrait'));
      const tiles = [...brow.querySelectorAll('.brow__tiles .skill')].map(R);
      const enemy = R(brow.querySelector('.brow__enemy .portrait'));
      const rows = document.querySelector('.rows').getBoundingClientRect();
      return {
        unitL: ur.left, unitR: ur.right, plateT: ur.top + insetT, plateB: ur.bottom - insetB,
        porL: por.left, porR: por.right, porT: por.top, porB: por.bottom,
        t0L: tiles[0].left, tLastR: tiles[tiles.length - 1].right, nTiles: tiles.length,
        enemyL: enemy.left, enemyR: enemy.right, rowsR: rows.right,
      };
    });
    const posBattle = (ativo) => page.evaluate((ativo) => {
      vsCPU = true; IA_LADO = 1; st = novoEstado(['iara', 'zeus', 'ogum'], ['sobek', 'brigid', 'ganesha'], 1, 0); st.ativo = ativo;
      ELEMS.forEach(e => st.lados[0].orbs[e] = 6);
      prova = null; campanha = null; provaFim = null; campanhaFim = null; painelRecolhido = false; peekKit = null;
      ir('batalha', {}, { substituir: true }); pararRelogio(); render();
    }, ativo);

    await posBattle(0);                 // minha vez (eu = lado 0, CPU = lado 1)
    const meu = await medirFila();
    const gap = meu.t0L - meu.porR;      // vão entre o retrato e o 1º tile (colados = pequeno)
    const respiro = meu.enemyL - meu.tLastR;   // vão até o inimigo (grande, à direita)
    // moldura passa por baixo do retrato E das habilidades (une os dois)
    ok(meu.unitL <= meu.porL + EPS, `moldura começa antes do retrato (unit ${Math.round(meu.unitL)} <= retrato ${Math.round(meu.porL)})`);
    ok(meu.unitR >= meu.tLastR - EPS, `moldura passa atrás da última habilidade (unit ${Math.round(meu.unitR)} >= tile ${Math.round(meu.tLastR)})`);
    // o retrato SOBREPÕE a borda de cima da placa — fica POR CIMA dela
    ok(meu.porT < meu.plateT - EPS, `o retrato sobrepõe a borda de cima da placa (retrato ${Math.round(meu.porT)} acima de ${Math.round(meu.plateT)})`);
    // habilidades COLADAS ao retrato (esquerda), NÃO centralizadas: respiro >> gap
    ok(gap >= 0 && gap <= 24, `as habilidades colam no retrato (vão ${Math.round(gap)}px <= 24)`);
    ok(respiro > gap + 30, `há respiro largo antes do inimigo, não centralizado (respiro ${Math.round(respiro)} >> vão ${Math.round(gap)})`);
    ok(meu.tLastR <= 770, `§257: as 4 fichas (círculo 90) terminam por volta de ~764, com respiro até o inimigo (terminaram em ${Math.round(meu.tLastR)} <= 770)`);
    ok(meu.enemyL > meu.tLastR + 30, `o inimigo continua à direita, sem colidir (inimigo ${Math.round(meu.enemyL)} > tiles ${Math.round(meu.tLastR)})`);
    console.log(`  moldura ${Math.round(meu.unitL)}..${Math.round(meu.unitR)} sob retrato ${Math.round(meu.porL)}..${Math.round(meu.porR)} + tiles →${Math.round(meu.tLastR)} · retrato pop ${Math.round(meu.plateT - meu.porT)}px acima da placa · vão ${Math.round(gap)} « respiro ${Math.round(respiro)}`);

    await posBattle(1);                 // vez do oponente — a ÊNFASE muda, a POSIÇÃO não
    const dele = await medirFila();
    const imovel = ['porL', 'porR', 'porT', 'porB', 't0L', 'tLastR', 'unitL', 'unitR', 'enemyL', 'enemyR']
      .every(k => Math.abs(meu[k] - dele[k]) < EPS);
    ok(imovel, `GUARDA PERMANENTE: nada se move entre turnos (minha vez vs vez dele: ` +
      ['porL', 't0L', 'tLastR', 'enemyL'].map(k => `${k} ${Math.round(meu[k])}/${Math.round(dele[k])}`).join(', ') + ')');
    // e a ênfase INVERTE: o baselayer marca de quem é a vez (a luz segue a classe, não o layout)
    const classes = await page.evaluate(() => document.getElementById('baselayer').className);
    ok(/turno-eles/.test(classes), `no turno do oponente o baselayer marca turno-eles (veio "${classes}")`);
    await posBattle(0);
    const c0 = await page.evaluate(() => document.getElementById('baselayer').className);
    ok(/turno-eu/.test(c0), `na minha vez o baselayer marca turno-eu (veio "${c0}")`);
    console.log(`  posição imóvel entre turnos (item 4) · ênfase por classe: turno-eu ⇄ turno-eles`);
    await page.evaluate(() => { ir('home', {}, { substituir: true }); render(); });
  }

  // == §220: DETALHE do deus — arte quadrada (sem corte feio), nome não coberto, skill ≥76, texto sem rolar ==
  console.log('== geometria (§220): detalhe do deus — arte, nome, toque das skills, texto ==');
  {
    await page.setViewportSize({ width: 926, height: 428 });
    const g = await page.evaluate(() => {
      // o deus de MAIOR descrição de kit, garantido na coleção, com essa skill selecionada
      let best = { len: 0 };
      for (const k in CKIT) for (const s of ['basico', 'habilidade', 'milagre', 'passiva']) {
        const d = CKIT[k][s]; if (d && d.efeito && d.efeito.length > best.len) best = { len: d.efeito.length, k, s };
      }
      perfil.deuses[best.k] = perfil.deuses[best.k] || { obtidoEm: Date.now() };
      ir('deus', { key: best.k }, { substituir: true }); render(); deusSel = best.s; render();
      const R = el => el.getBoundingClientRect();
      const art = R(document.querySelector('.dart')), nome = R(document.querySelector('.dart__nome'));
      const kit = R(document.querySelector('.dkit'));
      const sk = [...document.querySelectorAll('.dsk')].map(R);
      const txt = document.querySelector('.ddet__txt');
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

  // == §238 REVISA §211: TRÊS níveis de estado na ARTE, distinguíveis E reconhecíveis ==
  // O §211 travava "arte nunca apagada" (sat >= 30, sem filtro). Certo na DIREÇÃO, errado na INTENSIDADE:
  // o dono, no celular, não distinguia o que podia usar. Agora a arte PESA o estado em três níveis —
  // pronto > indisponível > recuo — mas nenhum apaga o deus. O guarda foi REVISADO (não apagado): mede o
  // pixel real e cobra (a) a ORDEM (pronto mais saturado que indisponível, que é mais que recuo) e
  // (b) o PISO de reconhecimento — todos acima do grayscale antigo (~18), que era o que apagava.
  // Motivo do número: medido no aparelho (DPR 2), pronto ~55 · indisponível ~37 · recuo ~28; o piso 22
  // fica acima do apagado ~18 e abaixo do recuo, e as margens separam os três sem ambiguidade.
  const PISO_RECONHECE = 22;   // §238: abaixo disto a arte "apaga" (o grayscale do §211 dava ~18)
  console.log(`== §238 discos: três níveis distinguíveis, todos reconhecíveis (sat >= ${PISO_RECONHECE}) ==`);
  {
    const dctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 926, height: 428 } });
    const dpg = await dctx.newPage();
    await dpg.goto('file://' + distAbs, { waitUntil: 'load' });
    await dpg.evaluate(() => {
      vsCPU = false; st = novoEstado(['iara', 'zeus', 'ogum'], ['sobek', 'brigid', 'ganesha'], 1, 0); st.ativo = 0;
      ELEMS.forEach(e => st.lados[0].orbs[e] = 6);
      prova = null; campanha = null; provaFim = null; campanhaFim = null;
      ir('batalha', {}, { substituir: true }); pararRelogio(); render();
    });
    await dpg.waitForFunction(() => { const im = document.querySelector('.skill--habilidade .skill__disc .slot__art'); return im && im.complete && im.naturalWidth > 0; }, { timeout: 6000 }).catch(() => {});
    async function satDoNivel(nv) {
      await dpg.evaluate((nv) => {
        const sk = document.querySelector('.skill--habilidade');
        sk.classList.remove('nv-pronto', 'nv-indispon', 'nv-recuo'); sk.classList.add(nv);
      }, nv);
      await dpg.waitForTimeout(180);
      const disc = await dpg.$('.skill--habilidade .skill__disc');
      const buf = await disc.screenshot();
      return await dpg.evaluate(async (url) => {
        const img = new Image(); img.src = url; await img.decode();
        const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
        const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
        const d = cx.getImageData(0, 0, cv.width, cv.height).data;
        const W = cv.width, Hh = cv.height, cxp = W / 2, cyp = Hh / 2, rad = Math.min(W, Hh) * 0.46;
        let ss = 0, n = 0;
        for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
          const dx = x - cxp, dy = y - cyp; if (dx * dx + dy * dy > rad * rad) continue;
          const i = (y * W + x) * 4, r = d[i] / 255, g = d[i + 1] / 255, bb = d[i + 2] / 255;
          const mx = Math.max(r, g, bb), mn = Math.min(r, g, bb); ss += mx === 0 ? 0 : (mx - mn) / mx; n++;
        }
        return Math.round(ss / n * 100);
      }, 'data:image/png;base64,' + buf.toString('base64'));
    }
    const pronto = await satDoNivel('nv-pronto');
    const indispon = await satDoNivel('nv-indispon');
    const recuo = await satDoNivel('nv-recuo');
    console.log(`  ANTES→DEPOIS (§211→§238):  pronto ${pronto}  >  indisponível ${indispon}  >  recuo ${recuo}   (piso reconhece ${PISO_RECONHECE})`);
    ok(pronto >= 45, `pronto: arte cheia (sat ${pronto} >= 45)`);
    ok(pronto - indispon >= 8, `indisponível é NITIDAMENTE mais fraco que pronto (${indispon} vs ${pronto})`);
    ok(indispon - recuo >= 4, `recuo é mais fraco que indisponível (${recuo} vs ${indispon})`);
    ok(recuo >= PISO_RECONHECE, `recuo AINDA reconhecível (sat ${recuo} >= ${PISO_RECONHECE}, acima do apagado ~18)`);
    ok(indispon >= PISO_RECONHECE, `indisponível reconhecível (sat ${indispon} >= ${PISO_RECONHECE})`);
    await dctx.close();
  }

  // == §258: retrato > ficha (§214 restaurada, crescendo o retrato) · aliado=inimigo · vida OPACA
  // sobre a arte (legibilidade não muda) · faixa de efeitos cabe com os 6 do pior caso ==
  console.log('== §258 retrato: hierarquia restaurada + simetria + vida opaca sobre a arte + efeitos cabem ==');
  {
    const rctx = await browser.newContext({ deviceScaleFactor: 3, viewport: { width: 926, height: 428 } });
    const rpg = await rctx.newPage();
    await rpg.goto('file://' + distAbs, { waitUntil: 'load' });
    await rpg.evaluate(() => {
      vsCPU = false; st = novoEstado(['iara', 'zeus', 'ogum'], ['sobek', 'brigid', 'ganesha'], 1, 0); st.ativo = 0;
      ELEMS.forEach(e => st.lados[0].orbs[e] = 6);
      prova = null; campanha = null; provaFim = null; campanhaFim = null; painelRecolhido = false;
      ir('batalha', {}, { substituir: true }); pararRelogio(); render();
    });
    // GUARDA hierarquia (§214): retrato MAIOR que a ficha nas duas dimensões; e aliado = inimigo (simetria)
    const dim = await rpg.evaluate(() => {
      const R = el => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
      return { por: R(document.querySelector('.brow__ally .portrait')), sk: R(document.querySelector('.brow__tiles .skill')), foe: R(document.querySelector('.brow__enemy .portrait')) };
    });
    ok(dim.por.w > dim.sk.w && dim.por.h > dim.sk.h, `§214: retrato ${dim.por.w}×${dim.por.h} > ficha ${dim.sk.w}×${dim.sk.h} nas duas dimensões`);
    ok(dim.por.w === dim.foe.w && dim.por.h === dim.foe.h, `simetria: retrato aliado = inimigo (${dim.por.w}×${dim.por.h} vs ${dim.foe.w}×${dim.foe.h})`);

    // GUARDA vida OPACA: força a arte do retrato a BRANCO (pior caso) e prova que a barra não deixa a arte
    // vazar — o rótulo lê contra o preenchimento, não contra a arte, então a legibilidade não piora (§258).
    await rpg.evaluate(() => {
      document.querySelectorAll('.up--ally .portrait .slot').forEach(e => e.style.background = '#fff');
      document.querySelectorAll('.up--ally .portrait .slot img').forEach(e => e.style.filter = 'brightness(4)');
    });
    await rpg.waitForTimeout(150);
    const hpEl = await rpg.$('.up--ally .hp');
    const hbuf = await hpEl.screenshot();
    const hp = await rpg.evaluate(async (url) => {
      const img = new Image(); img.src = url; await img.decode();
      const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
      const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
      const d = cx.getImageData(0, 0, cv.width, cv.height).data; const W = cv.width, H = cv.height;
      const L = (r, g, b) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      let maxL = 0, cornerMax = 0;   // canto = base esquerda, longe do texto central
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; const l = L(d[i], d[i + 1], d[i + 2]);
        if (l > maxL) maxL = l;
        if (x < W * 0.18 && y > H * 0.5 && l > cornerMax) cornerMax = l; }
      return { maxL: +maxL.toFixed(3), cornerL: +cornerMax.toFixed(3) };
    }, 'data:image/png;base64,' + hbuf.toString('base64'));
    ok(hp.cornerL < 0.5, `vida OPACA: com a arte BRANCA por trás, o canto da barra segue escuro (L ${hp.cornerL} < 0.5) — a arte não vaza`);
    ok(hp.maxL > 0.85, `o rótulo de vida tem texto claro visível sobre a barra (L ${hp.maxL} > 0.85)`);
    console.log(`  vida: canto L ${hp.cornerL} (arte branca não vaza) · texto L ${hp.maxL} · contraste do rótulo contra o preenchimento (não a arte)`);

    // GUARDA efeitos: 6 no pior caso (FX_MAX=5 + "+N") cabem DENTRO do retrato
    const fx = await rpg.evaluate(() => {
      const u = st.lados[0].units[0]; u.efeitos = [];
      u.dots = ['Queimadura', 'Veneno', 'Sangria', 'Corrosão', 'Praga', 'Gangrena'].map(n => ({ nome: n, dur: 2, dano: 5 }));
      render();
      const por = document.querySelector('.up--ally .portrait').getBoundingClientRect();
      const eff = document.querySelector('.up--ally .effects').getBoundingClientRect();
      const chips = document.querySelectorAll('.up--ally .effects .effect, .up--ally .effects .fxmore').length;
      const temMais = !!document.querySelector('.up--ally .effects .fxmore');
      return { dentro: eff.left >= por.left - 1 && eff.right <= por.right + 1 && eff.top >= por.top - 1 && eff.bottom <= por.bottom + 1, chips, temMais, FXMAX: (typeof FX_MAX !== 'undefined' ? FX_MAX : 5) };
    });
    ok(fx.dentro, 'a faixa de efeitos cabe DENTRO do retrato (não estoura)');
    ok(fx.chips <= fx.FXMAX && fx.temMais, `6 efeitos: a faixa mostra FX_MAX com o "+N" (${fx.chips} chips <= ${fx.FXMAX}, com +N)`);
    console.log(`  efeitos: ${fx.chips} chips (cap FX_MAX ${fx.FXMAX} + "+N") dentro do retrato`);
    await rctx.close();
  }

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

  await browser.close();
  console.log(falhas === 0 ? '\n>>> MOLDURA OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

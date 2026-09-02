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

  // == geometria da batalha (§214): a última fileira NUNCA cruza o rodapé e o tile
  // (mesmo RECOLHIDO, quando cresce de 78→~100px) NUNCA estoura a fileira. Medido em
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

  // == discos de habilidade: a ARTE fica em COR e legível em TODO estado (sat >= piso) ==
  // A régua da regra do dono "tudo visível": o estado vive na MOLDURA (anel/número/ícone),
  // a identidade na ARTE. Mede a saturação real do pixel do disco em cada estado; nenhum
  // pode desaturar a arte (o grayscale antigo do is-off levava a sat a ~18). Não pode voltar
  // em silêncio: aplica cada CLASSE de estado no mesmo disco de deus e cobra o piso.
  const PISO_SAT = 30;
  console.log(`== discos: arte em cor em todo estado (saturação >= ${PISO_SAT}) ==`);
  {
    // DPR 2 (o real dos celulares): é onde o grayscale antigo levava a arte a ~18 de sat.
    // Medir aqui dá margem limpa — arte em cor ~55, grayscale ~18, piso 30 separa os dois.
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
    const estados = [['disponível', []], ['sem energia', ['is-off']], ['em recarga', ['is-cooldown']], ['travada', ['is-locked']], ['sem alvo', ['is-notarget']]];
    for (const [nome, classes] of estados) {
      // filtro COMPUTADO do disco (e do <img> da arte): nenhum estado pode desaturar
      // (grayscale) nem escurecer a arte (brightness < ~0.85). Determinístico — pega o
      // grayscale antigo mesmo quando o pixel médio ainda parece alto.
      await dpg.evaluate((cs) => {
        const sk = document.querySelector('.skill--habilidade');
        sk.classList.remove('is-off', 'is-cooldown', 'is-locked', 'is-notarget', 'is-ready');
        if (cs.length === 0) sk.classList.add('is-ready'); else cs.forEach(c => sk.classList.add(c));
        const cd = sk.querySelector('.skill__cd'); if (cd && cs.includes('is-cooldown')) cd.textContent = '2';
      }, classes);
      await dpg.waitForTimeout(200);   // deixa a transição de .14s assentar antes de ler filtro/pixel
      const filt = await dpg.evaluate(() => {
        const disc = document.querySelector('.skill--habilidade .skill__disc');
        const art = disc.querySelector('.slot__art');
        return [getComputedStyle(disc).filter, art ? getComputedStyle(art).filter : 'none'].join(' | ');
      });
      const cinza = /grayscale\(\s*(0?\.[1-9]|[1-9])/.test(filt);   // grayscale > 0
      const escuro = (filt.match(/brightness\(\s*([0-9.]+)/g) || []).some(m => parseFloat(m.replace(/brightness\(\s*/, '')) < 0.85);
      ok(!cinza, `disco "${nome}": tem grayscale na arte (filtro: ${filt})`);
      ok(!escuro, `disco "${nome}": tem brightness < 0.85 na arte (filtro: ${filt})`);
      const disc = await dpg.$('.skill--habilidade .skill__disc');
      const buf = await disc.screenshot();
      const sat = await dpg.evaluate(async (url) => {
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
      ok(sat >= PISO_SAT, `disco "${nome}": saturação ${sat} < piso ${PISO_SAT} — a arte apagou (grayscale/scrim?)`);
      console.log(`  ${nome.padEnd(13)} sat ${sat}${sat < PISO_SAT ? '  XX < ' + PISO_SAT : ''}`);
    }
    await dctx.close();
  }

  await browser.close();
  console.log(falhas === 0 ? '\n>>> MOLDURA OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

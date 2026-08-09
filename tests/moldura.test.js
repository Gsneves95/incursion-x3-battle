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
const PISO = 0.80; // piso de escala em celular — REPORTADO, não cravado (ver escopo p/ o dono)

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
  const linhas = [];
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
      if (!safe) linhas.push({ rot: w + 'x' + h, escala: r.scale, larg: Math.round(r.boxW), h });
    }
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

  // RELATÓRIO da escala por tamanho (sem safe). O piso de 0,80 é REPORTADO, não
  // cravado: em altura < 342px (ex.: 726×312 na janela) a escala física não alcança
  // 0,80 com altura de design 428 — em TELA CHEIA o mesmo aparelho sobe. Escopo do
  // piso é decisão do dono; aqui só trago o número.
  console.log('  escala por tamanho (paisagem):');
  const abaixo = linhas.filter(l => l.escala < PISO);
  linhas.forEach(l => console.log(`    ${l.rot.padEnd(9)} escala ${l.escala.toFixed(3)}  design ${l.larg}${l.escala < PISO ? '  ⚠ < ' + PISO + ' (altura ' + l.h + 'px)' : ''}`));
  if (abaixo.length) console.log(`  ⚠ ${abaixo.length} tamanho(s) abaixo de ${PISO} — todos por altura < 342px (cobertos por tela cheia). Escopo do piso: decisão do dono.`);

  await browser.close();
  console.log(falhas === 0 ? '\n>>> MOLDURA OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

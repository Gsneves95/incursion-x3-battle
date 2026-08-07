// moldura.test.js (F0.6 passo 4) — MATRIZ de enquadramento em navegador REAL.
//
// Por que Chromium e não jsdom: o jsdom não faz layout, então
// getBoundingClientRect() é sempre 0 — não dá para medir o RECT lá. E foi o RECT
// que achou o bug do passo 2 (o palco extrapolava à direita com a escala "certa").
// Um teste que olhasse só a escala teria dito "tudo ok" com o jogo cortado. Então
// aqui medimos o rect real, contra a viewport, em vários tamanhos, com e sem a
// faixa de safe-area lateral. FALHA se o palco extrapolar em qualquer combinação.
//
// Browser: usa o Chromium pré-provisionado (/opt/pw-browsers) quando existe; no CI,
// `npx playwright install chromium` resolve o browser e o launch acha sozinho.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// tamanhos: paisagem de celulares/tablets reais + um grande (proporção diferente)
const TAMANHOS = [
  [667, 375], [726, 312], [740, 360], [800, 360], [844, 390],
  [892, 412], [915, 412], [926, 428], [1180, 820],
];
const SAFE = 48;   // faixa de safe-area lateral simulada (notch/gestos)
const EPS = 0.5;

function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try {
    const base = '/opt/pw-browsers';
    const dir = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().pop();
    if (dir) {
      const bin = path.join(base, dir, 'chrome-linux', 'chrome');
      if (fs.existsSync(bin)) return bin;
    }
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
        scale: +(+m).toFixed(4), sw: de.scrollWidth, sh: de.scrollHeight,
        cw: de.clientWidth, ch: de.clientHeight,
      };
    });
  }

  console.log('== matriz de enquadramento: rect dentro da viewport, sem rolagem ==');
  for (const [w, h] of TAMANHOS) {
    for (const safe of [false, true]) {
      const r = await medir(w, h, safe);
      const rot = (w + 'x' + h) + (safe ? ' safe48' : '');
      // 1) o palco não pode extrapolar a viewport visível
      ok(r.L >= -EPS && r.T >= -EPS && r.R <= r.W + EPS && r.B <= r.H + EPS,
        `${rot}: palco EXTRAPOLA a viewport (L${Math.round(r.L)} T${Math.round(r.T)} R${Math.round(r.R)} B${Math.round(r.B)} em ${r.W}x${r.H})`);
      // 2) a página não pode rolar (nada empurra a caixa para fora)
      ok(r.sw <= r.cw && r.sh <= r.ch,
        `${rot}: página ROLA (scroll ${r.sw}x${r.sh} vs client ${r.cw}x${r.ch})`);
      // 3) com safe-area, o palco tem de respeitar a faixa lateral
      if (safe) ok(r.L >= SAFE - EPS && r.R <= r.W - SAFE + EPS,
        `${rot}: palco invade a safe-area lateral (L${Math.round(r.L)} R${Math.round(r.R)}, faixa ${SAFE})`);
      // 4) a escala tem de ser a de "caber" (min das duas razões, descontada a safe)
      const esp = +Math.min((r.W - (safe ? 2 * SAFE : 0)) / 926, r.H / 428).toFixed(4);
      ok(Math.abs(r.scale - esp) < 0.002, `${rot}: escala ${r.scale} != esperada ${esp}`);
    }
  }

  await browser.close();
  console.log(falhas === 0 ? '\n>>> MOLDURA OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

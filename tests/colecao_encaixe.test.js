// colecao_encaixe.test.js (§292 → §307 → §358) — FOLGA da Coleção em navegador REAL. A sobreposição SAIU (§358): o
// que resta medir aqui é o NOME na GRADE (cartão) — que usa clamp de 2 linhas e não pode PERDER tinta além de um piso.
// (A legibilidade/toque/rolagem das três telas é provada por tests/acessibilidade_telas.test.js.) jsdom não serve
// (não faz layout → rect 0). Medimos o tamanho NATURAL (clone solto) e a folga, nos 100 deuses, no celular (780) e cheio (1846).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try {
    const base = '/opt/pw-browsers';
    const dir = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().pop();
    if (dir) { const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; }
  } catch (e) { /* deixa o playwright resolver */ }
  return undefined;
}

const GRADE_CAP = 12;   // nome na grade (clamp 2 linhas): perda de tinta tolerada em px reais
let falhas = 0;
const ok = (c, m) => { if (!c) { falhas++; console.log('  XX ' + m); } };

(async () => {
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true, args: ['--no-sandbox'] });
  for (const [W, H] of [[780, 360], [1846, 852]]) {
    const page = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
    await page.goto('file://' + distAbs, { waitUntil: 'load' });
    const r = await page.evaluate(() => {
      perfil.deuses = {}; ROSTER.forEach((e, i) => { if (i % 2 === 0) perfil.deuses[e.key] = { obtidoEm: Date.now(), copias: 1 }; });
      colF = { busca: '', cultura: '', classe: '', funcao: '', elem: '', status: '', raridade: '', ordem: 'nome' };
      ir('colecao', {}, { substituir: true }); render();
      const g = document.getElementById('gsplash'); if (g) g.remove();
      // nome no cartão: clamp 2 linhas — mede a perda vertical de tinta (altura natural além do clamp)
      const nat = el => { const c = el.cloneNode(true), s = c.style; s.cssText = getComputedStyle(el).cssText; s.position = 'absolute'; s.left = '-99999px'; s.height = 'auto'; s.maxHeight = 'none'; s.webkitLineClamp = 'unset'; s.overflow = 'visible'; s.width = el.clientWidth + 'px'; document.body.appendChild(c); const h = c.getBoundingClientRect().height; c.remove(); return h; };
      let pior = 0, piorK = '', sob = false;
      const nomes = [...document.querySelectorAll('#col2grade .col2c__n')];
      nomes.forEach(el => { const perda = Math.round(nat(el) - el.clientHeight); if (perda > pior) { pior = perda; piorK = (el.textContent || '').slice(0, 14); } });
      // a grade não deve transbordar horizontalmente (os cartões reflui em colunas, não corta)
      const gr = document.getElementById('col2grade');
      sob = gr.scrollWidth > gr.clientWidth + 2;
      return { pior, piorK, cards: nomes.length, sobX: sob, colGrade: !!document.querySelector('.col2__grade') && !document.querySelector('.col2__painel') };
    });
    ok(r.colGrade, `@${W}×${H}: grade em tela cheia (sem painel lateral)`);
    ok(r.cards > 0, `@${W}×${H}: a grade tem cartões (${r.cards})`);
    ok(r.pior <= GRADE_CAP, `@${W}×${H}: o pior nome da grade perde ${r.pior}px (≤ ${GRADE_CAP}) — "${r.piorK}"`);
    ok(!r.sobX, `@${W}×${H}: a grade não transborda na horizontal (reflui em colunas)`);
    console.log(`  @${W}×${H}: cartões ${r.cards} · pior nome +${r.pior}px (${r.piorK}) · overflowX ${r.sobX}`);
    await page.close();
  }
  await browser.close();
  console.log(falhas === 0 ? '\n>>> COLEÇÃO-ENCAIXE §358 OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e.stack || e.message || e); process.exit(1); });

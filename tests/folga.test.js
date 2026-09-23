// folga.test.js (§307) — GUARDA de FOLGA para as telas que cortavam EM SILÊNCIO e não tinham guarda nenhuma:
// os DOMÍNIOS (nome por reticência) e a CAMPANHA (nome do nó por line-clamp). Reticência e clamp NÃO transbordam
// (overflow:hidden) — o texto some sem que scrollHeight/scrollWidth acusem. A única forma de ver "quanto se perde"
// é medir o tamanho NATURAL (clone solto) e subtrair do box. NÃO proíbe o corte (a reticência é decisão tomada,
// §277) — MEDE quanto some e QUEBRA se piorar além do que existe hoje. Hoje: "Amaterasu" perde 33px nos Domínios,
// "A Incursão" perde ~1 linha (10px) no nó da campanha. Se amanhã cortar mais, esta guarda avisa. Chromium (layout real).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try {
    const base = '/opt/pw-browsers';
    const dir = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().pop();
    if (dir) { const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; }
  } catch (e) {}
  return undefined;
}

// CAPS §307 (px de design) — teto de CORTE tolerado (não de folga). Justificativa no docs/folga-telas.md / DECISOES §307.
const DOM_CAP  = 45;   // Domínios: hoje "Amaterasu" corta 33px; teto 45 (folga 12) — quebra se um nome sumir > 45px
const CAMP_CAP = 18;   // Campanha: hoje "A Incursão" corta ~10px (1 linha); teto 18 — quebra se um nome perder ~2 linhas

const HELP = `
window.__natH=(el)=>{const c=el.cloneNode(true);const s=c.style;s.cssText=getComputedStyle(el).cssText;s.position='absolute';s.left='-99999px';s.top='0';s.height='auto';s.maxHeight='none';s.overflow='visible';s.webkitLineClamp='unset';s.display=getComputedStyle(el).display.includes('box')?'block':getComputedStyle(el).display;s.width=el.clientWidth+'px';document.body.appendChild(c);const h=c.getBoundingClientRect().height;c.remove();return h;};
window.__natW=(el)=>{const c=el.cloneNode(true);const s=c.style;s.cssText=getComputedStyle(el).cssText;s.position='absolute';s.left='-99999px';s.top='0';s.width='auto';s.maxWidth='none';s.overflow='visible';s.whiteSpace='nowrap';document.body.appendChild(c);const w=c.getBoundingClientRect().width;c.remove();return w;};
`;

let falhas = 0;
const ok = (c, m) => { if (!c) { falhas++; console.log('  XX ' + m); } };

(async () => {
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  const page = await (await browser.newContext()).newPage();
  await page.goto('file://' + distAbs, { waitUntil: 'load' });
  await page.addScriptTag({ content: HELP });

  console.log(`== §307: DOMÍNIOS — o corte por reticência dos nomes não passa de ${DOM_CAP}px (mede o que some) ==`);
  for (const W of [780, 951]) {
    await page.setViewportSize({ width: W, height: 428 });
    const r = await page.evaluate(() => {
      perfil = novoPerfil(0, 0); ir('dominios', {}, { substituir: true }); render();
      let cutMax = 0, pior = '', cortados = 0, total = 0;
      for (const el of document.querySelectorAll('*')) {
        if (el.children.length || !el.textContent.trim()) continue;   // só folhas de texto
        const cs = getComputedStyle(el);
        if (cs.whiteSpace !== 'nowrap' || cs.overflow === 'visible') continue;   // só as que cortam com reticência
        total++;
        const cut = Math.max(0, window.__natW(el) - el.clientWidth);
        if (cut > 2) cortados++;   // > 2px = corte real (ignora ruído sub-pixel/padding)
        if (cut > cutMax) { cutMax = cut; pior = el.textContent.slice(0, 24); }
      }
      return { cutMax: Math.round(cutMax), pior, cortados, total, larg: (typeof ultimaLarguraDesign !== 'undefined' ? ultimaLarguraDesign : innerWidth) };
    });
    ok(r.cutMax <= DOM_CAP, `design ${r.larg}: o pior corte nos Domínios (${r.cutMax}px, "${r.pior}") não pode passar de ${DOM_CAP}px`);
    console.log(`  design ${r.larg}: ${r.cortados}/${r.total} textos com reticência · pior corte ${r.cutMax}px ("${r.pior}")`);
  }

  console.log(`== §307: CAMPANHA — o corte por line-clamp do nome do nó não passa de ${CAMP_CAP}px (mede o que some) ==`);
  for (const W of [780, 951]) {
    await page.setViewportSize({ width: W, height: 428 });
    const r = await page.evaluate(() => {
      perfil = novoPerfil(0, 0); ir('campanha', {}, { substituir: true }); render();
      const ns = [...document.querySelectorAll('.cnode__nome')];
      let cutMax = 0, pior = '', clampados = 0;
      for (const el of ns) {
        const cut = Math.max(0, window.__natH(el) - el.clientHeight);
        if (cut > 1) clampados++;
        if (cut > cutMax) { cutMax = cut; pior = el.textContent; }
      }
      return { n: ns.length, cutMax: Math.round(cutMax), pior, clampados, larg: (typeof ultimaLarguraDesign !== 'undefined' ? ultimaLarguraDesign : innerWidth) };
    });
    ok(r.n > 0, `design ${r.larg}: a trilha da campanha tem nós (${r.n})`);
    ok(r.cutMax <= CAMP_CAP, `design ${r.larg}: o pior corte no nó (${r.cutMax}px, "${r.pior}") não pode passar de ${CAMP_CAP}px`);
    console.log(`  design ${r.larg}: ${r.clampados}/${r.n} nós clampados · pior corte ${r.cutMax}px ("${r.pior}")`);
  }

  await browser.close();
  console.log(falhas === 0 ? '\n>>> FOLGA OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})();

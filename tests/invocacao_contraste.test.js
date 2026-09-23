// §304e — GUARDA DE LEITURA da barra de pity sobre a arte do destaque. Decisão do dono: a figura ENTRA ~34px na
// faixa da barra (§304d) — tolerado porque a máscara (§304c) dissolve o rodapé. Mas isso vale para ESTA arte; outro
// deus, com outro recorte, pode ter ROSTO ou MÃO onde o Zeus tem pedra. Esta guarda NÃO mede a distância — mede a
// LEITURA: o texto "SS GARANTIDO", o número e o "?" têm de continuar legíveis COM A ARTE POR CIMA. Mede o contraste
// WCAG do texto contra o FUNDO COMPOSTO (chip .74 + arte desvanecida), no dist real (Chromium), nas duas escalas.
// Babá: quando um banner novo entrar e a arte bater na barra deixando-a ilegível, ESTE teste quebra antes do jogador ver.
//
// Método: esconde o texto (visibility:hidden, mantém o layout), fotografa a CAIXA de cada rótulo → o que sobra é o fundo
// composto sob ele; pega o pixel MAIS CLARO (pior caso p/ texto claro) e calcula o contraste contra a cor real do texto.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
function acharChrome() { const b = '/opt/pw-browsers'; const d = fs.readdirSync(b).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); return path.join(b, d, 'chrome-linux', 'chrome'); }
const dist = 'file://' + path.join(__dirname, '..', 'dist', 'incursion.html');
const LIMIAR = 4.5;   // WCAG AA p/ texto normal (a barra é 11–12px). Atual mede ~8–16; o limiar é o piso, não a meta.
function L(r, g, b) { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function contraste(a, b) { const hi = Math.max(a, b), lo = Math.min(a, b); return (hi + 0.05) / (lo + 0.05); }

let falhas = 0; const ok = (c, m) => { if (!c) { console.log('  XX ' + m); falhas++; } else console.log('  ok ' + m); };

(async () => {
  const b = await chromium.launch({ executablePath: acharChrome(), headless: true, args: ['--no-sandbox'] });
  const dec = await (await b.newContext()).newPage(); await dec.goto('about:blank');
  console.log('== §304e: a barra de pity continua legível SOBRE a arte do destaque (contraste ≥ ' + LIMIAR + ') ==');
  for (const [W, H] of [[780, 640], [951, 640]]) {
    const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })).newPage();
    await p.goto(dist, { waitUntil: 'load' });
    // com o deus em destaque e um pity no meio (barra parcialmente cheia — o pior p/ o número sobre o fill)
    await p.evaluate(() => { ir('invocacao', {}, { substituir: true }); INV.montar(); perfil.invocacao.desdeUltimoSS = 30; INV.montar(); });
    await p.waitForTimeout(250);
    const els = await p.evaluate(() => { const g = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, color: getComputedStyle(e).color }; }; return { 'SS GARANTIDO': g('.iv-pity__lbl'), 'número': g('.iv-pity__num'), '?': g('.iv-pity__q') }; });
    ok(els['SS GARANTIDO'] && els['número'] && els['?'], `${W}: a barra e seus três elementos existem`);
    await p.evaluate(() => { ['.iv-pity__lbl', '.iv-pity__num', '.iv-pity__q'].forEach(s => { const e = document.querySelector(s); if (e) e.style.visibility = 'hidden'; }); });
    await p.waitForTimeout(100);
    for (const [nome, el] of Object.entries(els)) {
      if (!el) continue;
      const buf = await p.screenshot({ clip: { x: el.x, y: el.y, width: Math.max(1, el.w), height: Math.max(1, el.h) } });
      const uri = 'data:image/png;base64,' + buf.toString('base64');
      const bg = await dec.evaluate(async (u) => { const img = new Image(); img.src = u; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); const px = x.getImageData(0, 0, c.width, c.height).data; let mx = 0; const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; for (let i = 0; i < px.length; i += 4) { const l = 0.2126 * f(px[i]) + 0.7152 * f(px[i + 1]) + 0.0722 * f(px[i + 2]); if (l > mx) mx = l; } return mx; }, uri);
      const m = el.color.match(/\d+/g).map(Number); const razao = contraste(L(m[0], m[1], m[2]), bg);
      ok(razao >= LIMIAR, `${W}: "${nome}" lê sobre a arte — contraste ${razao.toFixed(2)} (≥ ${LIMIAR})`);
    }
    await p.close();
  }
  await b.close();
  console.log('');
  console.log(falhas === 0 ? '>>> INVOCAÇÃO-CONTRASTE OK' : `>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e.message || e); process.exit(1); });

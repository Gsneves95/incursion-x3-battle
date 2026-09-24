// §311 — GUARDA DE LEITURA dos rótulos do MAPA sobre a arte real (WCAG ≥ 4,5, o mesmo piso do §304e).
// O problema que originou o §311: "DOMÍNIOS" sumia no clarão do portal e "· em breve" da Loja no telhado iluminado; os
// outros sete liam por SORTE (caíram sobre partes escuras). O conserto é o FUNDO ESCURO radial atrás de cada ilha
// (.ilha::before), com bordas desvanecendo até transparente. Esta guarda mede o contraste do NOME e do CONTADOR de CADA
// UM DOS NOVE contra o fundo COMPOSTO (arte + o radial), nas QUATRO larguras (780, 893, 1075, 1200; 893 = o app do dono).
// Babá: se a arte trocar por uma mais clara, ou o radial encolher/clarear, ou um rótulo voltar a uma cor escura, ISTO
// quebra antes de o jogador ver o texto sumir.
//
// Método (§304e/§281): esconde o TEXTO (visibility:hidden, mantém o layout) e fotografa a CAIXA de cada rótulo → o que
// sobra é o fundo composto sob ele; pega o pixel MAIS CLARO (pior caso p/ texto claro) e calcula o contraste contra a cor
// real do texto. É um PISO PESSIMISTA (ignora a sombra/aura do próprio texto, que só ajuda) — a captura é o veredito.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
function acharChrome() { const b = '/opt/pw-browsers'; const d = fs.readdirSync(b).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); return path.join(b, d, 'chrome-linux', 'chrome'); }
const dist = 'file://' + path.join(__dirname, '..', 'dist', 'incursion.html');
const LIMIAR = 4.5;   // WCAG AA p/ texto normal (§304e). O piso, não a meta — os rótulos medem bem acima.
function L(r, g, b) { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function contraste(a, b) { const hi = Math.max(a, b), lo = Math.min(a, b); return (hi + 0.05) / (lo + 0.05); }

let falhas = 0, pior = 99, piorQ = '';
const ok = (c, m) => { if (!c) { console.log('  XX ' + m); falhas++; } };

(async () => {
  const b = await chromium.launch({ executablePath: acharChrome(), headless: true, args: ['--no-sandbox'] });
  const dec = await (await b.newContext()).newPage(); await dec.goto('about:blank');
  console.log('== §311: os 9 nomes + contadores do mapa leem SOBRE a arte (contraste ≥ ' + LIMIAR + ') nas 4 larguras ==');
  for (const W of [780, 893, 1075, 1200]) {
    const p = await (await b.newContext({ viewport: { width: W, height: 428 }, deviceScaleFactor: 2 })).newPage();
    await p.goto(dist, { waitUntil: 'load' });
    await p.evaluate(() => { perfil = novoPerfil(0, 0); ir('home', {}, { substituir: true }); render(); });
    await p.waitForTimeout(180);
    // por ilha: nome + contador/tag (rect + cor)
    const items = await p.evaluate(() => {
      const out = [];
      for (const il of document.querySelectorAll('.ilha')) {
        const dest = il.dataset.dest || (il.querySelector('.ilha__nome') && il.querySelector('.ilha__nome').textContent) || '?';
        const parts = [];
        const push = (sel, tipo) => { const e = il.querySelector(sel); if (e) { const r = e.getBoundingClientRect(); if (r.width > 0 && r.height > 0) parts.push({ tipo, x: r.x, y: r.y, w: r.width, h: r.height, color: getComputedStyle(e).color }); } };
        push('.ilha__nome', 'nome');
        push('.ilha__cont', 'contador'); push('.ilha__campnum', 'campnum'); push('.ilha__camptxt', 'camptxt'); push('.ilha__breveTag', 'em-breve');
        out.push({ dest, parts });
      }
      return out;
    });
    ok(items.length === 9, `${W}: as 9 ilhas existem (achei ${items.length})`);
    // esconde TODO o texto do mapa (mantém layout) → a caixa mostra só o fundo composto (arte + radial .ilha::before)
    await p.evaluate(() => { document.querySelectorAll('.ilha__nome,.ilha__cont,.ilha__campnum,.ilha__camptxt,.ilha__breveTag').forEach(e => e.style.visibility = 'hidden'); });
    await p.waitForTimeout(80);
    let piorLarg = 99, piorLargQ = '';
    for (const it of items) {
      for (const pt of it.parts) {
        const buf = await p.screenshot({ clip: { x: pt.x, y: pt.y, width: Math.max(1, pt.w), height: Math.max(1, pt.h) } });
        const uri = 'data:image/png;base64,' + buf.toString('base64');
        const bg = await dec.evaluate(async (u) => { const img = new Image(); img.src = u; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); const px = x.getImageData(0, 0, c.width, c.height).data; let mx = 0; const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; for (let i = 0; i < px.length; i += 4) { const l = 0.2126 * f(px[i]) + 0.7152 * f(px[i + 1]) + 0.0722 * f(px[i + 2]); if (l > mx) mx = l; } return mx; }, uri);
        const m = pt.color.match(/\d+/g).map(Number); const razao = contraste(L(m[0], m[1], m[2]), bg);
        ok(razao >= LIMIAR, `${W}: ${it.dest}.${pt.tipo} lê sobre a arte — contraste ${razao.toFixed(2)} (≥ ${LIMIAR})`);
        if (razao < piorLarg) { piorLarg = razao; piorLargQ = `${it.dest}.${pt.tipo}`; }
        if (razao < pior) { pior = razao; piorQ = `${it.dest}.${pt.tipo}@${W}`; }
      }
    }
    console.log(`  ${W}: pior rótulo ${piorLarg.toFixed(2)} em ${piorLargQ}`);
    await p.close();
  }
  await b.close();
  console.log(`\n  pior de todos: ${pior.toFixed(2)} em ${piorQ} (piso ${LIMIAR})`);
  console.log(falhas === 0 ? '>>> MAPA-CONTRASTE OK' : `>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e.message || e); process.exit(1); });

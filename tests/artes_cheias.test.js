// §353b — TODA arte de habilidade é CHEIA: o recorte circular (disco §332/§334) foi aposentado. Prova no Chromium que o
// CANTO INTERNO de um botão com uma das artes antes marcadas "disco" (ex.: skill-ares-habilidade) mostra PIXELS DA ARTE,
// não o fundo escuro — ou seja, a arte vai até o canto do botão (sem círculo que corte os cantos). Também confere que
// nenhum lugar (batalha, ficha, montador, Coleção) aplica clip-path circular numa arte de habilidade.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const sharp = require('sharp');
function acharChromium() { try { const base = '/opt/pw-browsers'; const d = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); if (d) { const b = path.join(base, d, 'chrome-linux', 'chrome'); if (fs.existsSync(b)) return b; } } catch (e) {} return undefined; }
let falhas = 0; const ok = (c, m) => { if (!c) { falhas++; console.log('  ✗ FALHA: ' + m); } else console.log('  ✓ ' + m); };

(async () => {
  const distAbs = 'file://' + path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1846, height: 852 } })).newPage();
  await page.goto(distAbs, { waitUntil: 'load' });

  console.log('== §353b — arte de habilidade CHEIA no canto do botão (sem recorte circular) ==');
  // ficha da Atena (uma das 29 que o §353 marcava disco por FUNDO CLARO — §334): a Passiva tem cantos claros, então o
  // antigo recorte circular deixaria os cantos ESCUROS; a arte cheia preenche. Mede o botão da Passiva.
  const DEUS = 'atena';
  const r = await page.evaluate(async (DEUS) => {
    perfil.deuses[DEUS] = perfil.deuses[DEUS] || { obtidoEm: Date.now(), copias: 1 };
    ir('deus', { key: DEUS }, { substituir: true }); render();
    const g = document.getElementById('gsplash'); if (g) g.remove();
    const btn = [...document.querySelectorAll('.dsk[data-deussel]')].find(b => b.dataset.deussel === 'passiva');
    const art = btn && btn.querySelector('img.slot__art');
    if (!art) return { erro: 'sem img.slot__art na passiva' };
    await (art.decode ? art.decode().catch(() => {}) : Promise.resolve());
    const box = btn.querySelector('.dsk__art') || btn;
    const rb = box.getBoundingClientRect(), ra = art.getBoundingClientRect();
    const cs = getComputedStyle(art);
    // a arte cobre os 4 cantos da caixa do botão? (sem círculo que deixe canto escuro)
    const cobre = ra.left <= rb.left + 1 && ra.top <= rb.top + 1 && ra.right >= rb.right - 1 && ra.bottom >= rb.bottom - 1;
    return { cobre, clip: cs.clipPath || cs.webkitClipPath, nat: (art.naturalWidth || 0) };
  }, DEUS);
  ok(!r.erro, 'a ficha da Atena tem a arte da Passiva (' + (r.erro || 'ok') + ')');
  if (!r.erro) {
    ok(r.nat > 0, `a arte carregou (naturalWidth ${r.nat})`);
    ok(r.cobre, 'a arte cobre os 4 cantos do botão (sem círculo que corte os cantos)');
    ok(r.clip === 'none', `o botão da arte não tem clip-path circular (clip-path: ${r.clip})`);
    // PIXEL REAL do CANTO INTERNO do botão: screenshot do elemento + sharp (evita o taint do canvas em file://)
    const buf = await page.locator('.dsk[data-deussel="passiva"] .dsk__art').first().screenshot();
    const { data, info } = await sharp(buf).resize(100, 100, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const at = (x, y) => { const o = (y * 100 + x) * info.channels; return [data[o], data[o + 1], data[o + 2]]; };
    const luma = p => Math.round(0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]);
    // amostra logo DENTRO do arredondamento do botão (~15%): aqui o antigo DISCO (círculo ~47%) deixava o fundo escuro;
    // a arte CHEIA preenche. Fundo escuro do botão (#0C1020) tem luma ~16.
    const cantos = [at(15, 15), at(84, 15), at(15, 84), at(84, 84)];
    const claros = cantos.filter(p => luma(p) > 40).length;
    ok(claros >= 3, `o canto interno do botão mostra pixels da arte (não o fundo escuro): ${cantos.map(luma).join('/')} luma`);
  }

  // nenhuma arte de habilidade com clip circular em NENHUMA tela (batalha/montador/Coleção)
  const telas = await page.evaluate(() => {
    const vis = {};
    const varre = () => [...document.querySelectorAll('img.slot__art, .slot__art--disco')].some(el => {
      const cs = getComputedStyle(el); const cp = (cs.clipPath || cs.webkitClipPath || '');
      return /circle/i.test(cp) || el.classList.contains('slot__art--disco');
    });
    perfil.deuses.ares = perfil.deuses.ares || { obtidoEm: Date.now(), copias: 1 };
    perfil.deuses.atena = perfil.deuses.atena || { obtidoEm: Date.now(), copias: 1 };
    st = montarProvacao({ aliados: ['ares', 'atena', 'zeus'], inimigos: ['sobek', 'brigid', 'ganesha'], montar: { seed: 1, comeca: 0 } });
    prova = null; campanha = null; provaFim = null; campanhaFim = null; ir('batalha', {}, { substituir: true }); try { pararRelogio(); } catch (e) {} render();
    vis.batalha = varre();
    ir('selecao', { novo: true }, { substituir: true }); render(); vis.montador = varre();
    ir('colecao', {}, { substituir: true }); render(); colAbrirVer('ares'); vis.colecao = varre();
    return vis;
  });
  ok(!telas.batalha, 'batalha: nenhuma arte de habilidade recortada em círculo');
  ok(!telas.montador, 'montador: nenhuma arte de habilidade recortada em círculo');
  ok(!telas.colecao, 'Coleção: nenhuma arte de habilidade recortada em círculo');

  await browser.close();
  console.log(falhas === 0 ? '\n>>> ARTES-CHEIAS §353b OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e.stack || e.message || e); process.exit(1); });

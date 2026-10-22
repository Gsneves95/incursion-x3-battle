// colecao_sinergia.test.js (§294) — a SINERGIA na Coleção: painel lateral (3 parceiros + cabeçalho, ordem de
// prioridade, faixa global, solista honesto) e o "+N ›" que abre a lista completa como MODO da sobreposição.
// Navegador REAL (Chromium), medido no piso 780 E na folga 951 (a lição do §291: as duas larguras, todos os deuses).
// jsdom não serve p/ o corte (não faz layout). As guardas são as do dono (§294):
//   1) no máximo 3 parceiros no painel, com cabeçalho;   2) a ordem de prioridade é respeitada (laço antes de anti);
//   3) quem tem >3 mostra "+N" e ele abre a lista COMPLETA;   4) o solista mostra a linha, não um vão vazio;
//   5) NENHUM nome/mecânica corta a 780 (nem a 951), nos 100 deuses;   6) "Ver detalhes" continua alcançável (§210).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const S = require('../data/sinergia.json');

function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try {
    const base = '/opt/pw-browsers';
    const dir = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().pop();
    if (dir) { const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; }
  } catch (e) { /* deixa o playwright resolver */ }
  return undefined;
}

let falhas = 0;
const ok = (c, m) => { if (!c) { falhas++; console.log('  XX ' + m); } };

// ---------- guardas de DADO (baratas, sem navegador): a fonte que a tela lê ----------
(function dados() {
  console.log('== §294 dado: prioridade ordenada, aura=2, solistas honestos ==');
  let desordenados = 0, solistas = 0;
  for (const k of Object.keys(S.fichas)) {
    const ps = S.fichas[k].parceiros;
    for (let i = 1; i < ps.length; i++) if (ps[i].prioridade < ps[i - 1].prioridade) desordenados++;
    if (S.fichas[k].solista) { solistas++; ok(ps.length === 0 && !S.fichas[k].suporte, `solista ${k} não devia ter parceiro/suporte`); }
    for (const p of ps) ok(p.curto && p.motivo, `${k}→${p.para}: curto/motivo vazio`);
  }
  ok(desordenados === 0, `${desordenados} fichas com parceiros fora da ordem de prioridade`);
  ok(S.auraDoadores.length === 2, `auraDoadores deviam ser 2 (Brigid/Mímir), são ${S.auraDoadores.length}`);
  ok(solistas === 22, `solistas deviam ser 22, são ${solistas}`);
  // mnevis: laço vem antes de fase/elemento e o anti fica FORA do top-3
  const mn = S.fichas.mnevis.parceiros;
  ok(mn[0].familia === 'laço', `mnevis: 1º parceiro devia ser laço, é ${mn[0].familia}`);
  ok(!mn.slice(0, 3).some(p => p.familia === 'fase-anti'), 'mnevis: a anti-sinergia não devia estar no top-3');
})();

(async () => {
  // §358: a SINERGIA agora é a ABA da FICHA (a sobreposição saiu). Prova no navegador (780×360): o solista mostra a
  // linha honesta; um deus com muitos parceiros mostra os que cabem + "+N parceiros" (SEM rolar); e NENHUMA ficha com
  // a aba SINERGIA transborda o canvas 360, nos 100 deuses. (Os px de legibilidade/toque: acessibilidade_telas.)
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true, args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 })).newPage();
  await page.goto('file://' + distAbs, { waitUntil: 'load' });
  const r = await page.evaluate(() => {
    perfil.deuses = {}; ROSTER.forEach(e => perfil.deuses[e.key] = { obtidoEm: Date.now(), copias: 1 });
    contaAtual = { perfil, niveis: {}, pontos: {} };
    function sin(k) {
      fichaAba = 'sinergia'; deusSelKey = null; ir('deus', { key: k }, { substituir: true }); render();
      const g = document.getElementById('gsplash'); if (g) g.remove();
      const fix = document.getElementById('deusfix'), fb = fix.getBoundingClientRect(), esc = fb.height / 360;
      const bot = el => el ? Math.round((el.getBoundingClientRect().bottom - fb.top) / esc) : 0;
      let botMax = 0;
      [...fix.querySelectorAll('.dsx-col > *'), ...fix.querySelectorAll('.dsx-sin > *'), ...fix.querySelectorAll('.dsx-sin__lista > *')].forEach(el => { const b = bot(el); if (b > botMax) botMax = b; });
      const mais = fix.querySelector('.dsx-sin__mais');
      return { pars: fix.querySelectorAll('.dsx-sin__par').length, mais: mais ? mais.textContent : null, solo: !!fix.querySelector('.dsx-sin__solo'), faixa: !!fix.querySelector('.dsx-sin__faixa'), botMax };
    }
    const over = [];
    ROSTER.forEach(e => { const s = sin(e.key); if (s.botMax > 360) over.push(e.key + ':' + s.botMax); });
    return { zeus: sin('zeus'), odin: sin('odin'), over: over.slice(0, 8), overN: over.length };
  });
  ok(r.zeus.solo, 'zeus (solista): a aba SINERGIA mostra a linha "funciona sozinho"');
  ok(r.zeus.faixa, 'zeus: a faixa global (aura "Mímir e Brigid reforçam o time") aparece');
  ok(r.odin.pars > 0 && /\+\d+ parceiro/.test(r.odin.mais || ''), `odin (15 parceiros): mostra alguns + "+N parceiros" (tem ${r.odin.pars} + "${r.odin.mais}")`);
  ok(r.overN === 0, `nenhuma ficha/SINERGIA transborda o canvas 360 nos 100 deuses (${r.overN}: ${r.over.join(', ')})`);
  console.log(`  ficha/SINERGIA: zeus solista+faixa · odin ${r.odin.pars}+"${r.odin.mais}" · transbordos ${r.overN}/100`);
  await browser.close();
  console.log(falhas === 0 ? '\n>>> COLEÇÃO-SINERGIA §358 OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})();

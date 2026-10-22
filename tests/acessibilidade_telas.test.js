// §358 — ACESSIBILIDADE das três telas consertadas (Coleção, Ficha, Níveis), medida pela MESMA ferramenta da
// auditoria §357 (tools/auditoria_medida.js), no viewport de referência 780×360. EXIGE a=0, b=0, c=0, d=0 em TODOS
// os estados: nenhum texto < 12px (corpo) / < 11px (rótulo), nenhum toque < 40×40, NENHUMA rolagem fora da lista
// branca, NENHUM corte (reticência em info importante / estouro do viewport). Falha a suíte se alguma regressão voltar.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { medirNaPagina, CFG } = require('../tools/auditoria_medida.js');

function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try { const base = '/opt/pw-browsers'; const d = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); const b = path.join(base, d, 'chrome-linux', 'chrome'); if (fs.existsSync(b)) return b; } catch (e) {}
  return undefined;
}
let falhas = 0;
const ok = (c, m) => { if (!c) { falhas++; console.log('  XX ' + m); } else console.log('  ok ' + m); };
const distAbs = 'file://' + path.resolve(__dirname, '..', 'dist', 'incursion.html');

// perfil base: roster possuído + níveis/pontos do zeus (p/ a ficha/níveis mostrarem conteúdo real).
const BASE = `try{
  perfil.deuses={}; ROSTER.slice(0,60).forEach(e=>perfil.deuses[e.key]={copias:2,obtidoEm:Date.now()});
  contaAtual={nick:'Herói',perfil,niveis:{zeus:{basico:2,habilidade:4,milagre:1}},pontos:{zeus:9},ranque:{pontos:1200},missoes:{ativa:null,progresso:{},liberados:[]}};
}catch(e){}`;

const ESTADOS = {
  'Coleção — sem filtro': `colF={busca:'',cultura:'',classe:'',funcao:'',elem:'',status:'',raridade:'',ordem:'recentes'};ir('colecao',{},{substituir:true});render();`,
  'Coleção — com filtro': `colF={busca:'',cultura:'',classe:'',funcao:'Controlador',elem:'Aurora',status:'tem',raridade:'',ordem:'nome'};ir('colecao',{},{substituir:true});render();`,
  'Ficha — possuída': `fichaAba='habilidades';deusSel='milagre';deusSelKey=null;ir('deus',{key:'zeus'},{substituir:true});render();`,
  // §358b: a PASSIVA mostra o texto completo (não só "não gasta a ação") — deus com passiva longa (Anúbis, possuído).
  'Ficha — passiva (texto completo)': `perfil.deuses.anubis={copias:1,obtidoEm:Date.now()};fichaAba='habilidades';deusSel='passiva';deusSelKey=null;ir('deus',{key:'anubis'},{substituir:true});render();`,
  'Ficha — SINERGIA aberta': `fichaAba='sinergia';deusSelKey=null;ir('deus',{key:'zeus'},{substituir:true});render();`,
  // pior caso de missão: o deus com o requisito de Provação mais longo, NÃO possuído.
  'Ficha — não possuída (pior missão)': `(function(){var best={len:0,k:'anubis'};try{for(var kk in MISSOES.missoes){var t=reqMissaoTexto(kk)||'';if(t.length>best.len)best={len:t.length,k:kk};}}catch(e){}delete perfil.deuses[best.k];fichaAba='habilidades';deusSelKey=null;ir('deus',{key:best.k},{substituir:true});render();})();`,
  // NÍVEIS — 4 estados: (1) pode subir + máximo juntos; (2) sem pontos (FALTAM); (3) confirmando; (4) sem conexão.
  'Níveis — pode subir / máximo': `contaAtual.pontos={zeus:9};contaAtual.niveis={zeus:{basico:2,habilidade:4,milagre:1}};nlConfirm=null;nlPendente=false;nlMsg=null;nlSelKey=null;ir('niveis',{key:'zeus'},{substituir:true});render();`,
  'Níveis — sem pontos (FALTAM)': `contaAtual.pontos={zeus:0};contaAtual.niveis={zeus:{basico:2,habilidade:2,milagre:1}};nlConfirm=null;nlPendente=false;nlMsg=null;nlSelKey=null;ir('niveis',{key:'zeus'},{substituir:true});render();`,
  'Níveis — confirmando': `contaAtual.pontos={zeus:9};contaAtual.niveis={zeus:{basico:2,habilidade:2,milagre:1}};nlSelKey='zeus';nlConfirm='basico';nlPendente=false;nlMsg=null;ir('niveis',{key:'zeus'},{substituir:true});render();`,
  'Níveis — sem conexão': `contaAtual=null;nlConfirm=null;nlPendente=false;nlMsg=null;nlSelKey=null;ir('niveis',{key:'zeus'},{substituir:true});render();`,
};

(async () => {
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true, args: ['--no-sandbox'] });
  console.log('== §358 — acessibilidade das três telas (780×360, a=b=c=d=0) ==');
  for (const [nome, setup] of Object.entries(ESTADOS)) {
    const ctx = await browser.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(distAbs, { waitUntil: 'load' });
    const err = await page.evaluate(([b, s]) => { try { eval(b); eval(s); } catch (e) { return String(e && e.message || e); } const g = document.getElementById('gsplash'); if (g) g.remove(); return null; }, [BASE, setup]);
    if (err) { ok(false, `${nome}: setup quebrou — ${err}`); await ctx.close(); continue; }
    const r = await page.evaluate(medirNaPagina, CFG);
    const det = s => s.slice(0, 4).map(x => x.sel + (x.px ? ' ' + x.px + 'px' : x.w ? ' ' + x.w + '×' + x.h : '') + (x.txt ? ' "' + x.txt.slice(0, 18) + '"' : '')).join(' | ');
    ok(r.a.length === 0, `${nome}: texto ≥12/11px (a=${r.a.length})` + (r.a.length ? ' → ' + det(r.a) : ''));
    ok(r.b.length === 0, `${nome}: toque ≥40×40 (b=${r.b.length})` + (r.b.length ? ' → ' + det(r.b) : ''));
    ok(r.c.length === 0, `${nome}: sem rolagem proibida (c=${r.c.length})` + (r.c.length ? ' → ' + r.c.map(x => x.sel).join(', ') : ''));
    ok(r.d.length === 0, `${nome}: sem corte (d=${r.d.length})` + (r.d.length ? ' → ' + det(r.d) : ''));
    await ctx.close();
  }
  await browser.close();
  if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) de acessibilidade §358`); process.exit(1); }
  console.log('\n>>> ACESSIBILIDADE §358 OK — Coleção/Ficha/Níveis cumprem o padrão §357 em todos os estados.');
  process.exit(0);
})().catch(e => { console.error(e.stack || e.message || e); process.exit(1); });

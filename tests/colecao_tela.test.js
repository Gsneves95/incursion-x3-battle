// §358 — A TELA DE PERSONAGENS (Coleção) refeita: SEM painel lateral e SEM sobreposição. O resumo de raridade é UMA
// linha no cabeçalho ("N/100 · SS n/t · S n/t · A n/t"); a GRADE ocupa a tela toda (os filtros do §346b seguem); tocar
// num cartão abre a FICHA (rota 'deus'), não mais a sobreposição. Runtime em jsdom (ESTRUTURA/ESTADO); os PIXELS
// (legibilidade/toque/rolagem) são provados por tests/acessibilidade_telas.test.js (a ferramenta da auditoria §357).
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };

const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
const vc = new VirtualConsole();
let err = null;
vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/', virtualConsole: vc });
const w = dom.window, d = w.document;
const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
const txt = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
const clk = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));

console.log('== §358 — TELA DE PERSONAGENS (Coleção: grade cheia, tocar abre a ficha) ==');
w.eval(`
  (function(){ var ks=ROSTER.map(e=>e.key); perfil.deuses={};
    ks.forEach((k,i)=>{ if(i%2===0) perfil.deuses[k]={copias:1+(i%3),obtidoEm:Date.now()-i*1e6}; });
    perfil.moedas={essencia:12480,gema:340}; perfil.provacoes={}; })();
  colF={busca:'',cultura:'',classe:'',funcao:'',elem:'',status:'',raridade:'',ordem:'recentes'};
  ir('colecao',{},{substituir:true}); render();
`);
ok(!err, 'a tela renderiza sem quebrar (' + (err || 'ok') + ')');

// ---- 1. SEM painel lateral e SEM sobreposição ----
console.log('\n== 1. sem painel lateral, sem sobreposição ==');
ok(!$('.col2__painel') && !$('.col2p'), 'o painel lateral (col2__painel/col2p) NÃO existe mais');
ok(!$('#col2ov') && w.eval("typeof colAbrirVer==='undefined'"), 'a sobreposição (col2ov/colAbrirVer) foi removida');

// ---- 2. resumo de raridade numa linha do cabeçalho ----
console.log('\n== 2. resumo de raridade numa linha do cabeçalho ==');
{
  const r = txt($('.col2res'));
  ok(/50\/100/.test(r), 'o resumo traz possuídos/total (50/100) → ' + r);
  ok(/SS\s*\d+\/16/.test(r) && /S\s*\d+\/31/.test(r) && /A\s*\d+\/53/.test(r), 'o resumo traz SS/S/A n/total na mesma linha');
  ok($$('.col2res .col2res__r').length === 3, 'três bandas (SS/S/A) no resumo');
}

// ---- 3. a GRADE ocupa a tela (é o centro) e tem os 100 ----
console.log('\n== 3. a grade cheia com os 100 ==');
{
  ok(w.eval('ROSTER.length') === 100, 'o acervo é de 100 deuses');
  ok($$('#col2grade .col2c[data-deus]').length === 100, 'a grade mostra os 100 cartões (sem filtro)');
  ok(/100 deuses/.test(txt($('#col2conta'))), 'o contador diz "100 deuses"');
}

// ---- 4. tocar num cartão abre a FICHA daquele deus (não a sobreposição) ----
console.log('\n== 4. tocar num cartão abre a FICHA ==');
{
  const card = $('#col2grade .col2c[data-deus]');
  const k = card.dataset.deus;
  clk(card);
  ok(w.eval("rotaAtual()") === 'deus', 'tocar no cartão vai para a rota "deus" (a ficha)');
  ok(w.eval("(paramsAtuais()||{}).key") === k, 'a ficha é a do deus tocado (' + k + ')');
  ok(!$('#col2ov'), 'NENHUMA sobreposição foi aberta');
}

// ---- 5. os filtros do §346b seguem (elemento, função, status, raridade, busca, mais, ordenar) ----
console.log('\n== 5. os filtros seguem ==');
{
  w.eval("ir('colecao',{},{substituir:true}); render();");
  ok($$('[data-colelem]').length === w.eval('ELEMS.length'), 'orbes de ELEMENTO');
  ok($$('[data-colfunc]').length === w.eval('COL_FUNCOES.length'), 'pílulas de FUNÇÃO');
  ok($$('[data-colstatus]').length === 3 && $$('[data-colrar]').length === 4, 'pílulas de status (3) e raridade (4)');
  ok(!!$('#col2busca') && !!$('#col2mfabre') && !!$('select[data-filtro="ordem"]'), 'busca + "Mais" + Ordenar');
  ok(!$('.col2c__rar--B') && $$('[data-colrar]').map(b => b.dataset.colrar).filter(Boolean).join(',') === 'SS,S,A', 'nenhuma banda B; filtro só SS/S/A');
  const antes = $$('#col2grade .col2c').length;
  w.eval("colF.raridade='SS'; colAtualizarGrade();");
  const dep = $$('#col2grade .col2c').length;
  ok(dep === 16 && dep < antes, `filtrar SS reduz a grade a 16 (veio ${dep})`);
}

if (falhas) { console.log(`\n== ${passes} ok, ${falhas} FALHAS ==`); process.exit(1); }
console.log(`\n== COLEÇÃO §358 OK (${passes}) ==`);
process.exit(0);

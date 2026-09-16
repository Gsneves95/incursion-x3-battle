// §282/§284 — A TELA DE PERSONAGENS (Coleção). §282 criou o reskin (grade filtrável + painel-leitor);
// §284 remodelou o painel: abre em REPOUSO (sem seleção), o painel mostra identidade+posse+MAESTRIA (sem
// kit), e o kit COMPLETO vai para uma SOBREPOSIÇÃO (não rota) que o fundo fecha. Runtime da tela em jsdom
// (§202: o que se constrói tem de aparecer sem quebrar). Medição de PIXELS (colunas/rolagem) vive no
// navegador real (a verificação Chromium do §284); aqui é ESTRUTURA/ESTADO.
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

console.log('== §282/§284 — TELA DE PERSONAGENS (Coleção) ==');

// seed: metade possuídos + maestria variada (zeus Adepto; ares Mestre) para exercitar o painel de maestria.
w.eval(`
  (function(){ var ks=ROSTER.map(e=>e.key); perfil.deuses={};
    ks.forEach((k,i)=>{ if(i%2===0) perfil.deuses[k]={copias:1+(i%3),favorito:false,obtidoEm:Date.now()-i*1e6}; });
    perfil.moedas={essencia:12480,gema:340};
    perfil.maestria={ zeus:{vitorias:22,milagre:false}, ares:{vitorias:30,milagre:true} }; perfil.provacoes={}; })();
  colF={busca:'',cultura:'',classe:'',funcao:'',status:'',raridade:'',ordem:'recentes'};
  ir('colecao',{},{substituir:true}); render();
`);
ok(!err, 'a tela renderiza sem quebrar (' + (err || 'ok') + ')');

// ---- 1. §284: abre em REPOUSO — nenhum deus selecionado, o painel não mostra personagem. ----
console.log('\n== 1. abre em REPOUSO (nenhum deus selecionado) ==');
{
  ok(w.eval('colSel') === null, 'colSel === null ao abrir');
  ok(!!$('#col2painel .col2p--repouso'), 'o painel está em repouso');
  ok(!$('#col2painel .col2p__nome'), 'o painel NÃO mostra nome de personagem');
  ok(/^\d+\/100$/.test(txt($('.col2r__big'))), 'o repouso mostra o progresso possuídos/100 → ' + txt($('.col2r__big')));
  ok($$('#col2painel .col2r__rar').length === 3, 'o repouso mostra a quebra por raridade (3 bandas)');
  ok(/toque/i.test(txt($('.col2r__dica'))), 'o repouso convida a tocar num personagem');
}

// ---- 2. contador possuídos/100 (não /300) ----
console.log('\n== 2. contador possuídos/100 (não /300) ==');
{
  ok(w.eval('ROSTER.length') === 100, 'o acervo é de 100 deuses');
  ok(/\/\s*100\b/.test(txt($('.col2__moeda--pos'))) && !/\/\s*300\b/.test($('.col2__topo').innerHTML), 'o 3º contador do topo é .../100, nunca /300');
}

// ---- 3. só três bandas SS/S/A — nenhum "B" ----
console.log('\n== 3. só SS/S/A (nenhum B) ==');
{
  const rars = w.eval('ROSTER.map(e=>raridadeDe(e.key))');
  ok(rars.every(r => r === 'SS' || r === 'S' || r === 'A'), 'toda raridade ∈ {SS,S,A}');
  const conta = rars.reduce((a, r) => (a[r] = (a[r] || 0) + 1, a), {});
  ok(conta.SS === 16 && conta.S === 31 && conta.A === 53, `distribuição 16/31/53 (${conta.SS}/${conta.S}/${conta.A})`);
  ok(!$('.col2c__rar--B') && $$('select[data-filtro="raridade"] option').map(o => o.value).filter(Boolean).join(',') === 'SS,S,A', 'nenhuma banda B; filtro só SS/S/A');
}

// ---- 4. cada filtro reduz a grade ----
console.log('\n== 4. cada filtro reduz a grade ==');
{
  const base = w.eval('colecaoFiltrada().length'); ok(base === 100, 'sem filtro, os 100 aparecem');
  const medir = (campo, val) => w.eval(`colF.busca='';colF.cultura='';colF.classe='';colF.funcao='';colF.status='';colF.raridade=''; colF['${campo}']=${JSON.stringify(val)}; colecaoFiltrada().length`);
  ok(medir('busca', 'zeus') < base && medir('busca', 'zeus') >= 1, 'BUSCA reduz');
  ok(medir('cultura', 'Grega') < base, 'CULTURA reduz');
  ok(medir('classe', 'Físico') < base, 'CLASSE reduz');
  ok(medir('funcao', 'Suporte') < base, 'FUNÇÃO reduz');
  ok(medir('status', 'nao') < base, 'STATUS reduz');
  ok(medir('raridade', 'SS') < base, 'RARIDADE reduz');
  w.eval("colF.busca='';colF.cultura='';colF.classe='';colF.funcao='';colF.status='';colF.raridade=''; colAtualizarGrade();");
}

// ---- 5. §284: tocar num deus abre o painel (identidade + posse + MAESTRIA, SEM kit); o × fecha → repouso. ----
console.log('\n== 5. painel: identidade + posse + maestria; SEM kit; fecha no × ==');
{
  w.eval("colSelecionar('zeus')");
  const p = $('#col2painel');
  ok(txt(p.querySelector('.col2p__nome')) === 'Zeus', 'painel mostra Zeus');
  ok(txt(p.querySelector('.col2p__arq')) === 'Nuker de área', 'mostra o arquétipo');
  ok(p.querySelectorAll('.col2p__ident .col2p__tag').length === 4, 'identidade: 4 tags (cultura/elemento/classe/função)');
  ok(/Possu[íi]do/.test(txt(p.querySelector('.col2p__posse'))), 'mostra posse (Possuído · N cópias)');
  ok(!p.querySelector('.col2k__row'), 'o painel NÃO mostra habilidade nenhuma (o kit foi para a sobreposição)');
  ok(!!p.querySelector('.col2m'), 'o painel mostra a MAESTRIA');
  ok(/ADEPTO/i.test(txt(p.querySelector('.col2m__posto'))) && /22\/30/.test(txt(p.querySelector('.col2m__prox'))), 'maestria do modelo real: Adepto · 22/30 p/ Mestre');
  // fechar no × → repouso
  ok(!!p.querySelector('#col2fechar'), 'o painel tem × para fechar');
  w.eval("document.querySelector('#col2fechar').click()");
  ok(w.eval('colSel') === null && !!$('#col2painel .col2p--repouso'), 'o × volta ao repouso (colSel null)');
  // tocar no cartão já-selecionado também desseleciona
  w.eval("colSelecionar('zeus')"); ok(w.eval('colSel') === 'zeus', 'seleciona zeus de novo');
}

// ---- 6. MAESTRIA aparece no painel e em NENHUM outro lugar da Coleção. ----
console.log('\n== 6. maestria só no painel (nada na grade) ==');
{
  ok(!!$('#col2painel .col2m'), 'maestria no painel');
  ok($$('#col2grade .col2m, #col2grade .col2c--mestre').length === 0, 'NENHUM indicador de maestria na grade (sem col2m/col2c--mestre)');
  ok(!$('.col2c--mestre'), 'a moldura de Mestre não existe mais na grade');
}

// ---- 7. §284: VER DETALHES abre a SOBREPOSIÇÃO (kit completo); fundo fecha; Android-back fecha; seleção preservada. ----
console.log('\n== 7. sobreposição: 4 habilidades, fundo fecha, back fecha, seleção preservada ==');
{
  w.eval("colSelecionar('zeus'); document.querySelector('.col2p__ver').click()");
  const ov = $('#col2ov');
  ok(!!ov, 'VER DETALHES abre a sobreposição');
  ok(ov.querySelectorAll('.col2k__row').length === 4, 'a sobreposição mostra as QUATRO habilidades');
  ok(!ov.querySelector('.col2m'), 'a sobreposição NÃO repete a maestria');
  ok($('#baselayer').hasAttribute('inert'), 'o #baselayer fica inerte (INV 16 / §210)');
  ok(w.eval('colVer') === 'zeus', 'colVer registra a sobreposição (p/ o voltar do Android)');
  // tocar no FUNDO fecha (clique no próprio #col2ov)
  w.eval("(function(){ var ov=document.querySelector('#col2ov'); ov.dispatchEvent(new window.MouseEvent('click',{bubbles:true})); })()");
  ok(!$('#col2ov') && w.eval('colVer') === null, 'tocar no fundo fecha a sobreposição');
  ok(w.eval('colSel') === 'zeus' && !$('#baselayer').hasAttribute('inert'), 'seleção preservada (Zeus) e base volta a ser interativa');
  // voltar do Android fecha a sobreposição ANTES de sair da tela
  w.eval("colAbrirVer('zeus'); voltarNativo();");
  ok(!$('#col2ov') && w.eval("rotaAtual()") === 'colecao', 'o voltar do Android fecha a sobreposição sem sair da Coleção');
  // rolagem preservada: colFecharVer não toca na grade (mesmo nó) → scrollTop sobrevive
  w.eval("(function(){ var g=document.querySelector('#col2grade'); g.scrollTop=80; colAbrirVer('zeus'); colFecharVer(); })()");
  ok(w.eval("document.querySelector('#col2grade').scrollTop") === 80, 'a grade não é re-renderizada ao fechar → rolagem preservada (scrollTop 80)');
}

// ---- 8. possuído × não-possuído inequívocos (§216) ----
console.log('\n== 8. possuído × não-possuído ==');
{
  const kTem = w.eval("ROSTER.map(e=>e.key).find(temDeus)"), kNao = w.eval("ROSTER.map(e=>e.key).find(k=>!temDeus(k))");
  w.eval("colF.busca='';colF.cultura='';colF.classe='';colF.funcao='';colF.status='';colF.raridade=''; colAtualizarGrade();");
  ok($(`.col2c[data-deus="${kTem}"]`).classList.contains('col2c--tem'), 'possuído: col2c--tem');
  ok($(`.col2c[data-deus="${kNao}"]`).classList.contains('col2c--falta'), 'não-possuído: col2c--falta');
  w.eval(`colSelecionar(${JSON.stringify(kNao)})`);
  ok($('#col2painel .col2p').classList.contains('col2p--falta') && /N[ãa]o possu[íi]do/.test(txt($('#col2painel .col2p__posse'))), 'painel de não-possuído: falta + "Não possuído"');
}

// ---- 9. sem 404 de arte (§213) ----
console.log('\n== 9. sem 404 de arte (§213) ==');
{
  w.eval("colSelecionar(null); colF.busca='';colF.cultura='';colF.classe='';colF.funcao='';colF.status='';colF.raridade=''; colAtualizarGrade();");
  const artes = new Set(w.eval('Object.values(IMG)'));
  ok($$('#col2grade .col2c__art img').every(im => artes.has(im.getAttribute('src'))), 'todo <img> da grade referencia arte confirmada em IMG');
}

console.log(`\n${falhas ? '✗ ' + falhas + ' FALHA(S)' : '✓ tudo verde'} · ${passes} asserções`);
process.exit(falhas ? 1 : 0);

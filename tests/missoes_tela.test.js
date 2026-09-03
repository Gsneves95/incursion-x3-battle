// FASE 6 / §234 — A TELA DAS MISSÕES: o mapa da coleção. Quatro seções, o contador AO VIVO (do
// servidor), o motivo mitológico visível em TODA travada, o toque ≥76px, o estado sem servidor
// honesto, e o elo com o detalhe do deus nos dois sentidos. Runtime da tela em jsdom (§202: o que se
// constrói tem de aparecer na tela sem quebrar).
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

console.log('== FASE 6 / TELA DAS MISSÕES ==');

// os dados da árvore chegaram ao cliente (injetados na build)
ok(w.eval("typeof MISSOES==='object' && Object.keys(MISSOES.missoes).length===91"), 'as 91 missões estão no cliente (MISSOES injetado na build)');

// ---- 1. SEM SERVIDOR: mensagem honesta, sem zero forjado; e as histórias ficam legíveis ----
console.log('\n== 1. sem servidor: estado honesto (não mostra zero) + os motivos legíveis ==');
err = null;
w.eval("contaAtual=null; ir('provacoes',{},{substituir:true}); render();");
ok(!err, 'a tela renderiza offline sem quebrar');
ok(/conecte/i.test(txt($('.moff__msg'))) && /pvp/i.test(txt($('.moff__msg'))), 'diz honestamente: as missões contam no PvP, conecte para ver o progresso');
ok($$('.mtile--progresso, .mtile--disponivel, .mtile--concluida').length === 0, 'offline NÃO desenha seções de progresso (nada de zero forjado)');
ok($$('.mcat').length === 91 && txt($('.mcat__m')).length > 0, 'as 91 histórias (motivos) ficam legíveis mesmo offline');

// ---- 2. ONLINE: as QUATRO seções, na ordem ----
console.log('\n== 2. online: as quatro seções na ordem ==');
err = null;
// saci CONQUISTADO; Brasileira 5 (iara em progresso, companheiro cuca inicial); Africana 0 (exu disponível);
// hades TRAVADO (companheiro cerberus não possuído). Progresso e posse vêm do SERVIDOR (contaAtual).
w.eval("contaAtual={ perfil:{deuses:{saci:{copias:1}}}, missoes:{ vitoriasPanteaoPvP:{Brasileira:5}, sequenciaPvP:{}, liberados:['saci'] } }; ir('provacoes',{},{substituir:true}); render();");
ok(!err, 'a tela renderiza online sem quebrar');
const secs = $$('.msec__cab h2').map(h => txt(h));
ok(secs.length === 4 && /progresso/i.test(secs[0]) && /dispon/i.test(secs[1]) && /travad/i.test(secs[2]) && /conquist/i.test(secs[3]),
  'quatro seções na ordem: Em progresso · Disponíveis · Travadas · Conquistados (' + secs.join(' | ') + ')');

// ---- 3. o CONTADOR AO VIVO na seção Em progresso ----
console.log('\n== 3. o contador ao vivo (do servidor) ==');
ok($$('.mtile--progresso').length >= 1, 'há missão em progresso');
const prog = txt($('.mtile--progresso .mtile__req'));
ok(/\d+\/\d+\s*vitórias/i.test(prog), 'a missão em progresso mostra o contador ao vivo "X/Y vitórias …" (' + prog + ')');
ok(/\d+\/\d+\s*seguidas com/i.test(prog), 'e as "seguidas com o companheiro" quando a missão as pede');

// ---- 4. TRAVADAS: mostram QUAL companheiro falta + o motivo mitológico (guarda permanente) ----
console.log('\n== 4. travadas: falta QUAL + o motivo mitológico (guarda) ==');
ok($$('.mtile--travada').length >= 1, 'há missões travadas (falta o companheiro)');
ok(/precisa de/i.test(txt($('.mtile--travada .mtrava__falta'))), 'a travada diz QUAL companheiro falta ("precisa de …")');
const semMotivo = $$('.mtile--travada').filter(t => !txt(t.querySelector('.mtrava__motivo')));
ok(semMotivo.length === 0, 'GUARDA: TODA travada carrega o motivo mitológico (0 sem motivo)');

// ---- 5. CONQUISTADOS + toque ≥76px ----
console.log('\n== 5. conquistados + alvo de toque ≥76px ==');
ok($$('.mtile--concluida').length === 1 && /saci/i.test(txt($('.mtile--concluida .mtile__nome'))), 'o deus conquistado (saci) aparece em Conquistados');
ok(parseFloat(w.getComputedStyle($('.mtile')).minHeight) >= 76, 'o tile de missão tem alvo de toque ≥76px (tem ' + w.getComputedStyle($('.mtile')).minHeight + ')');

// ---- 6. ELO com o detalhe do deus, nos DOIS sentidos ----
console.log('\n== 6. o elo com o detalhe do deus, nos dois sentidos ==');
// missão -> deus
w.eval("[...document.querySelectorAll('.mtile[data-deus]')].find(b=>b.dataset.deus==='hades').click();");
ok(w.eval("rotaAtual()==='deus' && paramsAtuais().key==='hades'"), 'da missão (hades travado) vai-se ao detalhe do deus');
// no detalhe, o bloco COMO CONSEGUIR mostra a MISSÃO com o motivo, e leva de volta ao mapa
ok(/precisa|vitórias|com /i.test(txt($('.dcomo__via--miss'))) || txt($('.dcomo__via--miss')).length > 0, 'o detalhe do deus mostra a via MISSÃO (com o requisito)');
ok(txt($('.dcomo__motivo')).length > 0, 'e o motivo mitológico aparece no detalhe do deus');
// deus -> missão
w.eval("document.querySelector('[data-vermissao]').click();");
ok(w.eval("rotaAtual()==='provacoes'"), 'do detalhe do deus volta-se ao mapa das Missões (elo nos dois sentidos)');

console.log(`\n== TELA DAS MISSÕES: ${passes} ok, ${falhas} falhas ==`);
if (falhas) process.exit(1);

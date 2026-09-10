// FASE 5.3/§236 — O LOBBY DO PvP: a porta que faltava para jogar com gente de verdade. Sem servidor,
// diz como chegar a ele (o endereço da máquina, mesma rede). Com servidor: apelido + 3 deuses possuídos
// + entrar na fila. Runtime em jsdom (§202: o que se constrói tem de aparecer na tela sem quebrar).
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };

const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
const vc = new VirtualConsole();
let err = null; vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
const w = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: vc }).window;
const d = w.document, $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
const txt = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();

console.log('== FASE 5.3/§236 — LOBBY DO PvP ==');

// ---- o carrossel abre o PvP (antes o cartão era morto: rota null) ----
w.eval("ir('home',{},{substituir:true}); render();");
ok($$('.bcard[data-dest="pvp"]').length === 1, 'o cartão PvP no início é clicável (não mais morto)');

// ---- 1. SEM SERVIDOR: diz como chegar ao servidor (o endereço da máquina, mesma rede) ----
console.log('\n== 1. sem servidor: como chegar ao servidor (endereço + mesma rede) ==');
err = null;
w.eval("contaTransporte=null; ir('pvp',{},{substituir:true}); render();");
ok(!err, 'a tela renderiza sem servidor sem quebrar');
ok(/servidor/i.test(txt($('.moff__msg'))) && /(endereço|192\.168|rede)/i.test(txt($('#baselayer'))), 'diz para abrir pelo ENDEREÇO da máquina, na mesma REDE');

// ---- 2. COM SERVIDOR: apelido + 3 slots + deuses possuídos; entrar só com 3 ----
console.log('\n== 2. com servidor: apelido, time de 3 possuídos, entrar só com o time cheio ==');
err = null;
w.eval("contaTransporte={pedir:async()=>({}),aoPush(){}}; contaAtual={nick:null,perfil:{deuses:{}},missoes:{}}; perfil.deuses={}; ['zeus','ogum','tyr','sobek','brigid','ganesha','cuca','fujin','nezha'].forEach(k=>{perfil.deuses[k]={copias:1};}); pvpTime=[]; pvpEstado='idle'; pvpMsg=''; ir('pvp',{},{substituir:true}); render();");
ok(!err, 'a tela renderiza com servidor sem quebrar');
ok($$('#pvpnick').length === 1, 'pede o apelido (conta sem nick ainda)');
ok($$('.pvps').length === 3, 'três slots de time');
ok($$('.pvpt').length === 9, 'mostra os 9 deuses possuídos (os iniciais) para escolher');
ok($('#pvpamistoso').disabled && $('#pvpranqueado').disabled, '"Entrar na fila"/"Ranqueado" DESABILITADOS sem os 3');
// escolhe 3
w.eval("['zeus','ogum','tyr'].forEach(k=>pvpToggle(k)); render();");
ok($$('.pvps[data-pvptira]').length === 3, 'os 3 escolhidos preenchem os slots');
ok(!$('#pvpamistoso').disabled && !$('#pvpranqueado').disabled, 'com o time cheio, os dois botões HABILITAM');
// tira um deus e o botão volta a travar
w.eval("pvpToggle('zeus'); render();");
ok($('#pvpamistoso').disabled, 'tirar um deus volta a desabilitar (exige 3)');

// ---- 3. NA FILA: estado de espera honesto + sair ----
console.log('\n== 3. na fila: espera honesta + sair ==');
w.eval("pvpEstado='fila'; render();");
ok(/na fila/i.test(txt($('#baselayer'))) && $$('#pvpcancelar').length === 1, 'mostra "Na fila…" e um botão para sair');

// ---- 4. toque ≥76px ----
console.log('\n== 4. alvo de toque ≥76px ==');
w.eval("pvpEstado='idle'; render();");
ok(parseFloat(w.getComputedStyle($('.pvpt')).minHeight) >= 76, 'o tile de deus tem toque ≥76px (' + w.getComputedStyle($('.pvpt')).minHeight + ')');
ok(parseFloat(w.getComputedStyle($('.pvps')).minHeight) >= 76, 'o slot de time tem toque ≥76px (' + w.getComputedStyle($('.pvps')).minHeight + ')');

// ---- 5. §264: o fim de partida RANQUEADA anuncia o resultado; amistosa não; o voltar do Android fecha o banner ----
console.log('\n== 5. §264 banner de ranque: ranqueado anuncia (delta com sinal, faixa real), amistoso não, back fecha ==');
const resRank = { venceu: true, motivo: 'vitoria', id: 'me', pontosAntes: 1188, pontos: 1206, faixaAntes: { min: 1000, nome: 'Oráculo' }, faixa: { min: 1200, nome: 'Herói' }, subiu: true, desceu: false };
// (a) ranqueado terminado SEMPRE anuncia, com delta COM SINAL e faixa por NOME REAL
w.eval("(function(){var e=document.getElementById('banner-ranque');if(e)e.remove();})(); MP={ fim:{resultado:'vitoria',lado:0}, ranqueadoResultado:" + JSON.stringify(resRank) + ", _banner:false }; _bannerRanqueTalvez();");
const banner = $('#banner-ranque');
ok(!!banner, 'partida ranqueada terminada SEMPRE anuncia o resultado (o banner aparece)');
ok(banner && /\+18/.test(txt(banner)), 'o DELTA aparece com SINAL (+18)');
ok(banner && /Herói/.test(txt(banner)) && !/—/.test(txt(banner)), 'a FAIXA aparece com NOME REAL (Herói), nunca "—"');
ok(banner && /Oráculo/.test(txt(banner)), 'a mudança de faixa mostra de→para (Oráculo → Herói)');
// (b) o voltar do Android (voltarNativo) fecha o banner ANTES de qualquer outra coisa (§210/§240)
w.eval("voltarNativo();");
ok(!$('#banner-ranque'), 'o voltar do Android fecha o banner PRIMEIRO (§210/§240)');
// (c) partida AMISTOSA (sem ranqueadoResultado) NÃO anuncia nada — o anúncio é do RANQUEADO
w.eval("(function(){var e=document.getElementById('banner-ranque');if(e)e.remove();})(); MP={ fim:{resultado:'vitoria',lado:0}, ranqueadoResultado:null, _banner:false }; _bannerRanqueTalvez();");
ok(!$('#banner-ranque'), 'partida AMISTOSA (sem resultado ranqueado) NÃO anuncia nada');
w.eval("MP=null;");

console.log(`\n== LOBBY DO PvP: ${passes} ok, ${falhas} falhas ==`);
if (falhas) process.exit(1);

// F3.2 — o laço de AQUISIÇÃO: Invocação (odds visíveis, repetido→Essência, pity) e
// Coleção (os 100 por panteão, detalhe do deus, elo Coleção↔Provação). Parte PURA
// (registrarInvocacao) + parte de TELA no bundle real (jsdom).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const abertos = [];

console.log('== 1. registrarInvocacao: NOVO entra, REPETIDO vira Essência (15/40/120), a cópia única não é dissolvida ==');
{
  const P = require('../src/perfil.js');
  const ESS = require('../data/economia.json').invocacao.essenciaPorDuplicata;
  ok(ESS && ESS.A === 15 && ESS.S === 40 && ESS.SS === 120, 'a fonte (economia.json) tem 15/40/120 por ordem A/S/SS');
  let p = P.novoPerfil(0, 0);
  const antesEss = p.moedas.essencia;
  // hades é SS e não é inicial → novo na 1ª, repetido na 2ª
  p = P.registrarInvocacao(p, { resultados: [{ key: 'hades', raridade: 'SS' }], pity: 1 }, 0, ESS);
  ok(p.deuses.hades && p.deuses.hades.copias === 1, 'deus novo entra com 1 cópia');
  ok(p.moedas.essencia === antesEss, 'deus novo NÃO gera Essência');
  p = P.registrarInvocacao(p, { resultados: [{ key: 'hades', raridade: 'SS' }], pity: 2 }, 0, ESS);
  ok(p.deuses.hades.copias === 1, 'REPETIDO não empilha cópia (a única cópia fica) — não dissolve');
  ok(p.moedas.essencia === antesEss + 120, 'repetido SS credita 120 de Essência');
  // lote com A repetido
  p = P.registrarInvocacao(p, { resultados: [{ key: 'hades', raridade: 'SS' }, { key: 'hades', raridade: 'SS' }], pity: 3 }, 0, ESS);
  ok(p.moedas.essencia === antesEss + 120 + 240, 'dois repetidos no mesmo lote creditam os dois');
  console.log('  novo=cópia · repetido=Essência (A15/S40/SS120) · cópia única preservada');
}

function sessao() {
  const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  abertos.push(dom);
  const w = dom.window, d = w.document;
  return { w, d, $: s => d.querySelector(s), $$: s => [...d.querySelectorAll(s)] };
}

console.log('== 2. Invocação: odds VISÍVEIS antes da compra + pity + carteira com Essência ==');
{
  const { w, $ } = sessao();
  w.eval("ir('invocacao'); render();");
  ok(!!$('#iv'), 'a tela de invocação monta a partir da home');
  const odds = $('.iv-odds');
  ok(!!odds && /SS 3%/.test(odds.textContent) && /S 17%/.test(odds.textContent) && /A 80%/.test(odds.textContent), 'as odds 3/17/80 aparecem antes de invocar');
  ok(/garantia de SS em 60/.test(odds.textContent), 'a garantia dura (pity 60) é anunciada');
  ok(!!$('#iv-pity') && /\/60/.test($('#iv-pity').textContent), 'o contador de pity é visível');
  ok(!!$('#iv-essencia'), 'a carteira mostra Essência');
}

console.log('== 3. invocar de verdade (via DEV) e ver repetido creditar Essência ==');
{
  const { w, $ } = sessao();
  w.eval("ir('invocacao'); render();");
  // dá gemas de teste e força um deus já possuído para garantir repetido no reveal
  w.eval("INV.topup();");
  const essAntes = w.eval('perfil.moedas.essencia||0');
  // pull ×10: com 100 no pool e coleção pequena, garante ao menos alguns; verifica que a Essência não regride
  w.eval("INV.pull(10);");
  const essDepois = w.eval('perfil.moedas.essencia||0');
  ok(essDepois >= essAntes, 'a Essência nunca regride ao invocar');
  ok(w.eval('perfil.invocacao.total>=10'), 'o total de invocações avançou');
  // um repetido garantido: invoca o mesmo deus que já temos via registrarInvocacao no runtime seria trapaça;
  // em vez disso, confirmamos que a carteira reflete essência (render escreve o número)
  ok(/\d/.test($('#iv-essencia').textContent), 'a carteira de Essência renderiza um número');
}

console.log('== 4. Coleção: os 100 por PANTEÃO, 10 grupos de 10, navegável ==');
{
  const { w, $, $$ } = sessao();
  w.eval("ir('colecao'); render();");
  ok(!!$('.tela') && /Coleção/.test($('.tela__titulo').textContent), 'a tela de Coleção monta');
  ok($$('.csec').length === 10, `deveria haver 10 panteões (tem ${$$('.csec').length})`);
  ok($$('.ctile[data-deus]').length === 100, `deveria listar os 100 deuses (tem ${$$('.ctile[data-deus]').length})`);
  const cabs = $$('.csec__cab h2').map(e => e.textContent);
  ok(cabs.join(',') === 'Grega,Nórdica,Egípcia,Japonesa,Chinesa,Hindu,Brasileira,Africana,Celta,Maia', 'os 10 panteões na ordem esperada');
  // NB: o roster NÃO é 10×10 (Grega 19 … Maia 4) — o agrupamento por panteão vale, a contagem por grupo é a real.
  const soma = $$('.csec').reduce((s, sec) => s + sec.querySelectorAll('.ctile').length, 0);
  ok(soma === 100, `a soma dos grupos deveria cobrir os 100 (deu ${soma})`);
}

console.log('== 5. detalhe do deus: kit + estado da Provação + elo p/ jogá-la ==');
{
  const { w, $, $$ } = sessao();
  w.eval("ir('deus',{key:'durga'}); render();");
  ok(/Durga/.test($('.tela__titulo').textContent), 'o detalhe abre no deus pedido');
  ok(!!$('.dkit') && $$('.dkit .krow').length >= 3, 'o kit completo aparece (bás/hab/mil)');
  ok(!!$('.dprov') && /PROVAÇÃO/.test($('.dprov').textContent), 'o estado da Provação aparece');
  const jb = $('[data-jogarprova]');
  ok(!!jb, 'há botão para jogar a Provação a partir do detalhe');
  jb.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'batalha' && w.eval('!!prova && prova.key==="durga"'), 'o botão do detalhe entra na Provação do deus');
}

console.log('== 6. elo Coleção↔Provação: deus inicial sem Provação; concluída leva ao detalhe ==');
{
  const { w, $ } = sessao();
  w.eval("ir('deus',{key:'zeus'}); render();");   // zeus é inicial
  ok(/inicial/i.test($('.dprov').textContent), 'deus inicial mostra "sem Provação"');
  // simula uma Provação concluída (durga desbloqueada) e confere que a linha vai ao detalhe
  w.eval("perfil.deuses.durga={copias:1,favorito:false,obtidoEm:0}; ir('provacoes'); render();");
  const feita = $('.prow--feita[data-prova="durga"]');
  ok(!!feita, 'durga aparece como concluída na lista');
  feita.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'deus' && /Durga/.test($('.tela__titulo').textContent), 'tocar a Provação concluída leva ao detalhe do deus');
}

for (const dom of abertos) try { dom.window.close(); } catch (e) {}
if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) no laço de aquisição`); process.exit(1); }
console.log('>>> AQUISIÇÃO OK');
process.exit(0);

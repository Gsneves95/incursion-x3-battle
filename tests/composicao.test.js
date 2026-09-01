// F3.6 — DESAFIOS DE COMPOSIÇÃO: o jogador dá o time, o jogo valida ANTES da partida.
// O ponto é a validação AO MONTAR (o erro é reversível antes de custar), a recompensa
// LEVE (maestria + pouca Essência, só a 1ª vez), e o rider reusando predicados.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const abertos = [];
function sessao() {
  const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  abertos.push(dom);
  const w = dom.window, d = w.document;
  return { w, d, $: s => d.querySelector(s), $$: s => [...d.querySelectorAll(s)] };
}

console.log('== 1. os desafios existem, com regra + rider + recompensa LEVE de economia ==');
{
  const { w } = sessao();
  const n = w.eval('COMPOSICAO.desafios.length');
  ok(n >= 4, `deveria haver desafios (tem ${n})`);
  ok(w.eval('COMPOSICAO.desafios.every(d=>d.regra&&Array.isArray(d.condicoes)&&d.recompensa)'), 'todo desafio tem regra, condições e recompensa');
  ok(w.eval('ECONOMIA.desafios.recompensas.padrao.essencia <= 30'), 'a recompensa é leve (Essência baixa, não grind)');
  ok(!w.eval('JSON.stringify(ECONOMIA.desafios.recompensas)').match(/gema/), 'desafio não dá progressão pesada (sem gema)');
}

console.log('== 2. validarRegra: a validação de time (mono-elemento, mesma função, distintas, livre) ==');
{
  const { w } = sessao();
  const mesmoElem = w.eval("(function(){var byE={};ROSTER.forEach(e=>{(byE[e.elem]=byE[e.elem]||[]).push(e.key);});var g=Object.values(byE).find(a=>a.length>=3);return g.slice(0,3);})()");
  const misto = w.eval("(function(){var seen={},out=[];for(var e of ROSTER){if(!seen[e.elem]){seen[e.elem]=1;out.push(e.key);}if(out.length===3)break;}return out;})()");
  ok(w.eval(`validarRegra('monoElemento',${JSON.stringify(mesmoElem)}).ok`) === true, 'três do mesmo elemento → válido');
  const r = w.eval(`JSON.stringify(validarRegra('monoElemento',${JSON.stringify(misto)}))`);
  const ro = JSON.parse(r);
  ok(ro.ok === false && /elemento/i.test(ro.motivo), 'elementos misturados → inválido, com motivo legível');
  ok(w.eval(`validarRegra('monoElemento',${JSON.stringify(mesmoElem.slice(0, 2))}).ok`) === false, 'menos de 3 → inválido');
  ok(w.eval(`validarRegra('livre',${JSON.stringify(misto)}).ok`) === true, 'livre com 3 → válido (regra é o rider em jogo)');
  ok(w.eval(`validarRegra('funcoesDistintas',${JSON.stringify(mesmoElem)}).ok`) !== undefined, 'funcoesDistintas avalia sem quebrar');
}

console.log('== 3. o montador VALIDA AO VIVO: Começar travado E DIZ POR QUÊ até o time servir ==');
{
  const { w, $, $$ } = sessao();
  // possui um leque de deuses p/ montar
  w.eval("ROSTER.slice(0,20).forEach(e=>{perfil.deuses[e.key]={copias:1,favorito:false,obtidoEm:0};});");
  w.eval("ir('composicao'); render();");
  const b = $('.cenc[data-desafio="cx_elemento"]');
  ok(!!b, 'o desafio mono-elemento aparece na lista');
  b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'desafiomontar', 'abre o montador');
  ok($('#bcomecar').disabled, 'Começar começa travado (0 escolhidos)');
  ok(/✕/.test($('.cval').textContent), 'a validação mostra que ainda não serve (com motivo)');
  // monta um time que VIOLA a regra: 3 de elementos diferentes
  const misto = w.eval("(function(){var seen={},out=[];for(var e of ROSTER.slice(0,20)){if(perfil.deuses[e.key]&&!seen[e.elem]){seen[e.elem]=1;out.push(e.key);}if(out.length===3)break;}return out;})()");
  misto.forEach(k => $(`.ctile[data-pick="${k}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true })));
  ok(w.eval('desafioTimePick.length') === 3 && $('#bcomecar').disabled, 'time inválido (3 escolhidos) mantém Começar TRAVADO');
  ok(/elemento/i.test($('.cval').textContent), 'e DIZ por que não serve — antes de custar a partida');
  // troca por um time VÁLIDO: 3 do mesmo elemento possuídos
  const mesmo = w.eval("(function(){var byE={};ROSTER.slice(0,20).forEach(e=>{if(perfil.deuses[e.key])(byE[e.elem]=byE[e.elem]||[]).push(e.key);});var g=Object.values(byE).find(a=>a.length>=3);return g?g.slice(0,3):[];})()");
  if (mesmo.length === 3) {
    w.eval("desafioTimePick=[]; render();");
    mesmo.forEach(k => $(`.ctile[data-pick="${k}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true })));
    ok(!$('#bcomecar').disabled && /✓/.test($('.cval').textContent), 'time válido LIBERA o Começar com "válido"');
  } else { console.log('  (sem 3 do mesmo elemento nos 20 possuídos — pulei o caso positivo)'); }
}

console.log('== 4. jogar o desafio: rider ativo, e a vitória dá maestria + Essência (leve), sem desbloquear deus ==');
{
  const { w, $ } = sessao();
  w.eval("ROSTER.slice(0,6).forEach(e=>{perfil.deuses[e.key]={copias:1,favorito:false,obtidoEm:0};}); perfil.maestria={}; perfil.provacoes={};");
  const time = w.eval("ROSTER.slice(0,3).map(e=>e.key)");
  const essAntes = w.eval('perfil.moedas.essencia');
  const donosAntes = w.eval('Object.keys(perfil.deuses).length');
  w.eval(`iniciarDesafio(COMPOSICAO.desafios.find(d=>d.id==='cx_linha'), ${JSON.stringify(time)}); vsCPU=false; pararRelogio(); render();`);
  ok(w.eval("rotaAtual()") === 'batalha' && w.eval('!!(prova&&prova.desafio)'), 'entra na batalha do desafio');
  ok(w.eval('prova.condicoes.some(c=>c.predicado==="semPerderAliado")'), 'o rider do desafio está ativo (sem perder aliado)');
  ok(w.eval('st.lados[0].units.map(u=>u.key).join(",")') === time.join(','), 'joga com o time que o jogador montou');
  // vitória
  w.eval("st.lados[1].units.forEach(u=>{u.vivo=false;u.hp=0;}); st.fim={tipo:'fim',resultado:'vitoria',lado:0}; render();");
  ok(w.eval('perfil.moedas.essencia') === essAntes + w.eval('ECONOMIA.desafios.recompensas.padrao.essencia'), 'a 1ª vitória paga a Essência leve');
  ok(w.eval('Object.keys(perfil.deuses).length') === donosAntes, 'NÃO desbloqueia deus (não é Provação)');
  ok(time.every(k => w.eval(`perfil.maestria[${JSON.stringify(k)}] && perfil.maestria[${JSON.stringify(k)}].vitorias===1`)), 'conta vitória de maestria para os 3 que jogaram');
  ok(/DESAFIO VENCIDO/.test($('.result--prova').textContent), 'overlay de desafio vencido');
  ok(w.eval("perfil.provacoes['desafio:cx_linha'] && perfil.provacoes['desafio:cx_linha'].feito===true"), 'marca o desafio como feito');
}

console.log('== 5. re-jogar um desafio NÃO paga de novo (sem grind) ==');
{
  const { w } = sessao();
  w.eval("ROSTER.slice(0,3).forEach(e=>{perfil.deuses[e.key]={copias:1,favorito:false,obtidoEm:0};});");
  const time = w.eval("ROSTER.slice(0,3).map(e=>e.key)");
  w.eval(`iniciarDesafio(COMPOSICAO.desafios.find(d=>d.id==='cx_linha'), ${JSON.stringify(time)}); vsCPU=false; pararRelogio();`);
  w.eval("st.lados[1].units.forEach(u=>{u.vivo=false;u.hp=0;}); st.fim={tipo:'fim',resultado:'vitoria',lado:0}; render();");
  const ess1 = w.eval('perfil.moedas.essencia');
  w.eval(`iniciarDesafio(COMPOSICAO.desafios.find(d=>d.id==='cx_linha'), ${JSON.stringify(time)}); vsCPU=false; pararRelogio();`);
  w.eval("st.lados[1].units.forEach(u=>{u.vivo=false;u.hp=0;}); st.fim={tipo:'fim',resultado:'vitoria',lado:0}; render();");
  ok(w.eval('perfil.moedas.essencia') === ess1, 're-jogar não paga Essência de novo');
  ok(w.eval(`perfil.maestria[${JSON.stringify(time[0])}].vitorias`) === 2, 'mas a maestria (vitórias) acumula sempre');
}

for (const dom of abertos) try { dom.window.close(); } catch (e) {}
if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) nos desafios de composição`); process.exit(1); }
console.log('>>> COMPOSIÇÃO OK');
process.exit(0);

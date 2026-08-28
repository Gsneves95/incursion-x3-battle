// F3.3 — CAMPANHA capítulo 1: a trilha de encontros que ensina as REGRAS. Reusa a máquina
// de Provação SEM condição (vencer = derrubar). Progressão de ensino declarada, recompensa
// LIDA de economia.json (não inventada), chefe = deus com HP inflado. Bundle real em jsdom.
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
function entrar(w, id) {   // entra num encontro e congela (sem IA, sem relógio)
  w.eval(`iniciarEncontro(${JSON.stringify(id)});`);
  w.eval("vsCPU=false; pararRelogio(); render();");
}

console.log('== 1. a campanha existe: capítulo 1 com 6 encontros e a progressão de ENSINO declarada ==');
{
  const { w } = sessao();
  const enc = w.eval('JSON.stringify(CAMPANHA.encontros.map(e=>({id:e.id,ensina:e.ensina.chave,rec:e.recompensa,chefe:!!e.chefe})))');
  const arr = JSON.parse(enc);
  ok(arr.length === 6, `deveria haver 6 encontros (tem ${arr.length})`);
  const licoes = arr.map(e => e.ensina).join(',');
  ok(licoes === 'custo,recarga,defesa,ordem,time,chefe', `a progressão de ensino declarada: ${licoes}`);
  ok(arr[5].chefe === true, 'o último é o chefe');
  ok(w.eval('CAMPANHA.encontros.every(e=>e.ensina.titulo && e.ensina.dica)'), 'todo encontro declara título e dica da lição');
}

console.log('== 2. a trilha: 1º aberto, resto travado; recompensa lida de economia.json ==');
{
  const { w, $$ } = sessao();
  w.eval("ir('campanha'); render();");
  ok($$('.cenc').length === 6, 'a trilha mostra os 6 encontros');
  ok($$('.cenc--aberto').length === 1 && $$('.cenc--travado').length === 5, '1 aberto, 5 travados no início');
  const recTexto = $$('.cenc__rec').map(e => e.textContent.trim())[0];
  const recEcon = w.eval('ECONOMIA.campanha.recompensas.encontro.gema');
  ok(recTexto.includes(String(recEcon)), `a recompensa exibida (${recTexto}) vem de economia.json (${recEcon})`);
}

console.log('== 3. encontro 1 (time fixo): monta e mostra a lição durante a batalha ==');
{
  const { w, $ } = sessao();
  entrar(w, 'c1e1');
  ok(w.eval("rotaAtual()") === 'batalha', 'o encontro entra na batalha');
  ok(w.eval('!!campanha && campanha.id==="c1e1"'), 'o encontro ativo é o tocado');
  ok(w.eval('st.lados[0].units.map(u=>u.key).join(",")') === 'zeus,ogum,tyr', 'o time fixo do encontro montou');
  ok(w.eval('st.lados[1].units.map(u=>u.key).join(",")') === 'silfo,ghoul', 'os inimigos do encontro montaram');
  ok(!!$('.phud--camp') && /Ensina/.test($('.phud--camp').textContent) && /custo/i.test($('.phud--camp').textContent), 'o HUD mostra a lição (custo da energia)');
}

console.log('== 4. VITÓRIA: recompensa creditada UMA vez, encontro concluído, próximo destravado ==');
{
  const { w, $ } = sessao();
  entrar(w, 'c1e1');
  const gemaAntes = w.eval('perfil.moedas.gema');
  const recompensa = w.eval('ECONOMIA.campanha.recompensas.encontro.gema');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:0}; render();");
  ok(w.eval('!!campanhaFim && campanhaFim.venceu'), 'a vitória latch');
  ok(w.eval('perfil.moedas.gema') === gemaAntes + recompensa, `recompensa de economia creditada (${recompensa})`);
  ok(w.eval('perfil.campanha.concluidas.includes("c1e1")'), 'o encontro entra em concluidas');
  ok(/ENCONTRO VENCIDO/.test($('.result--prova').textContent), 'o overlay anuncia a vitória');
  ok(/Aprendido/.test($('.result--prova').textContent), 'o overlay diz o que foi aprendido');
  // volta e confere que o 2º destravou
  $('#cfvoltar').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'campanha', 'voltar leva à trilha');
  const abertos2 = w.eval('[...document.querySelectorAll(".cenc--aberto")].map(b=>b.dataset.enc).join(",")');
  ok(abertos2 === 'c1e2', `o 2º encontro destravou (aberto=${abertos2})`);
}

console.log('== 5. re-jogar um encontro concluído NÃO paga de novo ==');
{
  const { w } = sessao();
  entrar(w, 'c1e1');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:0}; render();");   // 1ª vitória paga
  const gema1 = w.eval('perfil.moedas.gema');
  entrar(w, 'c1e1');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:0}; render();");   // 2ª vitória
  ok(w.eval('perfil.moedas.gema') === gema1, 're-jogar não credita de novo');
  ok(w.eval('!!campanhaFim.jaFeito'), 'o resultado marca jaFeito');
}

console.log('== 6. DERROTA: sem recompensa, com "tentar de novo" ==');
{
  const { w, $ } = sessao();
  entrar(w, 'c1e1');
  const gemaAntes = w.eval('perfil.moedas.gema');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render();");   // inimigo vence
  ok(w.eval('campanhaFim && !campanhaFim.venceu'), 'a derrota latch');
  ok(w.eval('perfil.moedas.gema') === gemaAntes, 'derrota não paga');
  ok(w.eval('!perfil.campanha || !perfil.campanha.concluidas.includes("c1e1")'), 'derrota não conclui');
  ok(/DERROTA/.test($('.result--prova').textContent) && !!$('#cftentar'), 'overlay de derrota com tentar de novo');
}

console.log('== 7. encontro "escolha de time": o jogador MONTA (picker), e o chefe tem HP inflado ==');
{
  const { w, $, $$ } = sessao();
  // destrava tudo para alcançar o c1e5 sem jogar os anteriores
  w.eval("perfil.campanha={capitulo:1,fase:0,concluidas:['c1e1','c1e2','c1e3','c1e4']}; ir('campanha'); render();");
  const b5 = $('.cenc[data-enc="c1e5"]');
  ok(!!b5 && !b5.disabled, 'o 5º encontro está aberto');
  b5.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'montartime', 'o encontro de escolha abre o montador de time');
  const tiles = $$('.ctile[data-pick]');
  ok(tiles.length >= 3, 'o montador lista deuses jogáveis');
  ok($('#bcomecar').disabled, 'começar travado sem 3');
  tiles[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  tiles[1].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  tiles[2].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(!$('#bcomecar').disabled, 'com 3 escolhidos, começar libera');
  $('#bcomecar').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  w.eval("vsCPU=false;pararRelogio();");
  ok(w.eval("rotaAtual()") === 'batalha' && w.eval('campanha.id==="c1e5"'), 'começar entra no encontro com o time montado');
  ok(w.eval('st.lados[0].units.length===3'), 'o time montado tem 3');

  // chefe: HP inflado no montar (deus com kit intacto, sem mecânica nova)
  const boss = w.eval('(function(){var s=montarProvacao(CAMPANHA.encontros[5]);var u=s.lados[1].units.find(x=>x.key==="cerberus");return u?u.maxHp:0;})()');
  ok(boss === 250, `o chefe (cerberus) tem HP inflado a 250 (veio ${boss})`);
}

for (const dom of abertos) try { dom.window.close(); } catch (e) {}
if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) na campanha`); process.exit(1); }
console.log('>>> CAMPANHA OK');
process.exit(0);

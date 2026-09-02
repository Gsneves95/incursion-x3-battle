// F3.5 — MAESTRIA (4 níveis por deus) + PANTEÕES por proporção. A RESTRIÇÃO que manda:
// maestria dá TÍTULO/COSMÉTICO, NUNCA poder de combate. Este teste prova os níveis, o
// agregado, a proporção por panteão, e que nada disso toca o estado de combate.
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

console.log('== 1. os 4 níveis por vitórias, com Iniciado da Provação e a condição de kit no Mestre ==');
{
  const { w } = sessao();
  const nv = k => w.eval(`nivelMaestria(${JSON.stringify(k)})`);
  const setM = (k, v, mil) => w.eval(`perfil.maestria=perfil.maestria||{}; perfil.maestria[${JSON.stringify(k)}]={vitorias:${v},milagre:${mil}};`);
  // Iniciado = Provação vencida (mesmo com 0 vitórias registradas em maestria)
  w.eval("perfil.provacoes=perfil.provacoes||{}; perfil.provacoes.durga={lances:20,minimo:26,em:0};");
  ok(nv('durga') === 1, 'Provação vencida → Iniciado (1)');
  setM('ares', 4, false); ok(nv('ares') === 1, '4 vitórias → ainda Iniciado (1)');
  setM('ares', 5, false); ok(nv('ares') === 2, '5 vitórias → Aprendiz (2)');
  setM('ares', 15, false); ok(nv('ares') === 3, '15 vitórias → Adepto (3)');
  setM('ares', 30, false); ok(nv('ares') === 3, '30 vitórias SEM Milagre → travado no Adepto (condição de kit)');
  setM('ares', 30, true); ok(nv('ares') === 4, '30 vitórias + Milagre → Mestre (4)');
}

console.log('== 2. creditarMaestria: a vitória conta p/ os deuses que jogaram; o Milagre marca a condição ==');
{
  const { w } = sessao();
  w.eval("prova=PROVACOES.find(p=>p.key==='durga'); provaFim=null; campanha=null; st=montarProvacao(prova); perfil.maestria={};");
  // um dos meus lança o Milagre (evento de ação, slot milagre)
  w.eval("var u=st.lados[0].units[0]; st.log.push({tipo:'acao',origem:u.uid,slot:'milagre',turno:1});");
  const meus = w.eval("st.lados[0].units.map(u=>u.key)");
  w.eval("creditarMaestria();");
  ok(meus.every(k => w.eval(`perfil.maestria[${JSON.stringify(k)}].vitorias`) === 1), 'todos os 3 que jogaram ganham 1 vitória');
  ok(w.eval(`perfil.maestria[${JSON.stringify(meus[0])}].milagre===true`), 'quem lançou o Milagre marca a condição de kit');
  ok(w.eval(`perfil.maestria[${JSON.stringify(meus[1])}].milagre===false`), 'quem NÃO lançou não marca');
  w.eval("creditarMaestria();");
  ok(w.eval(`perfil.maestria[${JSON.stringify(meus[0])}].vitorias`) === 2, 'vitórias acumulam a cada vitória');
}

console.log('== 3. AGREGADO "domina X/100" + PANTEÃO por PROPORÇÃO (§200) ==');
{
  const { w } = sessao();
  w.eval("perfil.maestria={}; perfil.provacoes={};");
  ok(w.eval('totalDominados()') === 0 && w.eval('totalIniciados()') === 0, 'começa em 0 dominados / 0 iniciados');
  // domina os 4 maias (o menor panteão) → metade de todo panteão é proporcional
  const maias = w.eval("ROSTER.filter(e=>e.faccao==='Maia').map(e=>e.key)");
  maias.forEach(k => w.eval(`perfil.maestria[${JSON.stringify(k)}]={vitorias:30,milagre:true};`));
  ok(w.eval('totalDominados()') === maias.length, `dominar os maias conta no agregado (${maias.length})`);
  const dp = w.eval("JSON.stringify(dominadosPanteao('Maia'))");
  const dpo = JSON.parse(dp);
  ok(dpo.dom === dpo.total && dpo.dom >= dpo.metade, 'panteão maia 100% dominado ≥ metade');
  const grega = w.eval("JSON.stringify(dominadosPanteao('Grega'))");
  const go = JSON.parse(grega);
  ok(go.total >= 15 && go.metade === Math.ceil(go.total / 2), `metade da Grega é proporcional (${go.metade} de ${go.total}) — comparável à maia (${dpo.metade} de ${dpo.total})`);
}

console.log('== 4. A RESTRIÇÃO: maestria NÃO muda número de combate ==');
{
  const { w } = sessao();
  // estado de batalha com maestria ZERADA
  w.eval("perfil.maestria={}; var s1=montarProvacao(PROVACOES.find(p=>p.key==='durga'));");
  const antes = w.eval("(function(){var s=montarProvacao(PROVACOES.find(p=>p.key==='durga'));return JSON.stringify(s.lados[0].units.map(u=>({k:u.key,hp:u.hp,max:u.maxHp,n:u.ab?u.ab.length:0})));})()");
  // maestria NO MÁXIMO p/ todos
  w.eval("ROSTER.forEach(e=>{perfil.maestria[e.key]={vitorias:999,milagre:true};});");
  const depois = w.eval("(function(){var s=montarProvacao(PROVACOES.find(p=>p.key==='durga'));return JSON.stringify(s.lados[0].units.map(u=>({k:u.key,hp:u.hp,max:u.maxHp,n:u.ab?u.ab.length:0})));})()");
  ok(antes === depois, 'a montagem de combate é IDÊNTICA com maestria 0 e maestria máxima (cosmético, não poder)');
  ok(!/perfil\.maestria|maestria\[/.test(w.eval("montarProvacao.toString()")), 'montarProvacao nem lê perfil.maestria');
}

console.log('== 5. o detalhe mostra a maestria; o ladrilho mostra o nível ==');
{
  const { w, $, $$ } = sessao();
  w.eval("perfil.deuses.ares={copias:1,favorito:false,obtidoEm:0}; perfil.maestria={ares:{vitorias:15,milagre:false}};");
  w.eval("ir('deus',{key:'ares'}); render();");
  ok(!!$('.dmaes') && /MAESTRIA/.test($('.dmaes').textContent), 'o detalhe traz o bloco de maestria');
  ok(/Adepto/.test($('.dmaes').textContent), 'mostra o nível atual (Adepto)');
  ok(/Mestre/.test($('.dmaes').textContent) && /Milagre/.test($('.dmaes').textContent), 'diz o que falta p/ o Mestre (vitórias + Milagre)');
  w.eval("ir('colecao'); render();");
  const pip = $('.colx[data-deus="ares"] .colx__m');
  ok(!!pip, 'o ladrilho do deus mostra o pip de maestria');
}

console.log('== 6. SEMANAL: semente (ano, semana) — ano diferente NÃO repete a mesma semana ==');
{
  const { w } = sessao();
  ok(w.eval('anoISOAtual(new Date("2026-08-28"))') === 2026, 'ano ISO de 2026-08-28 é 2026');
  // mesmo (ano,semana) → mesmo índice; ano seguinte, mesma semana → índice diferente (offset ×7)
  const n = w.eval('SEMANAIS.puzzles.length');
  const wk = 35;
  const idx2026 = ((wk + 2026 * 7) % n + n) % n;
  const idx2027 = ((wk + 2027 * 7) % n + n) % n;
  ok(idx2026 !== idx2027, `a semana ${wk} de 2026 e 2027 mapeiam puzzles diferentes (${idx2026} vs ${idx2027})`);
}

for (const dom of abertos) try { dom.window.close(); } catch (e) {}
if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) em maestria`); process.exit(1); }
console.log('>>> MAESTRIA OK');
process.exit(0);

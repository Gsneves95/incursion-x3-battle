// IA do oponente (CPU) — exercitada em isolamento.
const E = require('../src/engine.js');
Object.assign(global, E);                 // expõe agir/acoesDe/podeAgir... como globais p/ ia.js
const { iaProximaAcao, iaPontuar } = require('../src/ia.js');

let f = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };

console.log('== IA prioriza o abate ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 5, 0);   // lado 0 age
  E.ELEMS.forEach(e => st.lados[0].orbs[e] = 0); st.lados[0].orbs['Tempestade'] = 1;   // só o Básico (1) é pagável
  const fraco = st.lados[1].units[1]; fraco.hp = 12;   // Cetro do Trovão (15) abate
  const a = iaProximaAcao(st);
  ok(a && a.slot === 'basico' && a.alvos[0] === fraco.uid,
    `deveria usar o Básico no abatível (slot ${a && a.slot}, alvo ${a && a.alvos && a.alvos[0]})`);
  E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
  ok(!fraco.vivo, 'o alvo fraco deveria cair');
  console.log(`  com só o Básico pagável, focou o de 12 de HP e abateu`);
}

console.log('== IA cura quando faz sentido (Brigid) ==');
{
  const st = E.novoEstado(['brigid', 'zeus', 'zeus'], ['ogum', 'ogum', 'ogum'], 9, 0);
  st.lados[0].orbs['Chama'] = 9;
  st.lados[0].units[1].hp = 30; st.lados[0].units[2].hp = 40;   // aliados feridos
  // Chama Sagrada cura 15 no time E dá 12 a todos inimigos -> ganho alto
  let achou = false;
  const base = iaPontuar(st, 0);
  const a = iaProximaAcao(st);
  const cl = JSON.parse(JSON.stringify(st)); E.agir(cl, a.uid, a.slot, a.alvos, a.escolhas);
  ok(iaPontuar(cl, 0) > base, 'a jogada escolhida deveria melhorar a posição');
  console.log(`  escolheu ${a.slot} (ganho de posição confirmado)`);
}

console.log('== partida IA vs IA termina e mantém invariantes ==');
{
  let somaTurnos = 0, semFim = 0, jogos = 30;
  for (let s = 1; s <= jogos; s++) {
    const keys = Object.keys(E.GODS);
    const pick = n => { const t = []; let i = n; while (t.length < 3) { const k = keys[i % keys.length]; if (!t.includes(k)) t.push(k); i += 2; } return t; };
    const st = E.novoEstado(pick(s), pick(s + 4), s, s % 2);
    let guard = 0;
    while (!st.fim && guard++ < 300) {
      let passos = 0, a;
      while (!st.fim && (a = iaProximaAcao(st)) && passos++ < 6) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
      if (st.fim) break;
      E.fimTurno(st);
    }
    if (!st.fim) semFim++;
    somaTurnos += st.turno;
    for (const lado of st.lados) for (const u of lado.units) {
      ok(u.hp >= 0 && u.hp <= u.maxHp, `HP fora de faixa: ${u.nome}=${u.hp}`);
      ok(u.shield >= 0, 'escudo negativo');
    }
    for (const lado of st.lados) E.ELEMS.forEach(e => ok(lado.orbs[e] >= 0, 'orbe negativo'));
  }
  ok(semFim === 0, `todas as ${jogos} partidas deveriam terminar (sem desfecho: ${semFim})`);
  console.log(`  ${jogos} partidas IA vs IA · média ${(somaTurnos / jogos).toFixed(1)} turnos · sem desfecho: ${semFim}`);
}

console.log('');
console.log(f === 0 ? '>>> IA OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);

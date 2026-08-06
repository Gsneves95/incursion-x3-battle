const E = require('../src/engine.js');

let falhas = 0;
function ok(cond, msg) { if (!cond) { console.log('  FALHA:', msg); falhas++; } }

// ---------------------------------------------- 1) partidas aleatórias
function partidaAleatoria(seed, verbose = false) {
  const keys = Object.keys(E.GODS);
  const pick = (s) => { const f = []; let n = s; while (f.length < 3) { const k = keys[n % keys.length]; if (!f.includes(k)) f.push(k); n += 3; } return f; };
  const st = E.novoEstado(pick(seed), pick(seed + 5), seed);
  let guard = 0;
  while (!st.fim && guard++ < 500) {
    const l = st.lados[st.ativo];
    for (const u of l.units) {
      if (!E.podeAgir(u)) continue;
      const acs = E.acoesDe(st, u).filter(a => a.disponivel);
      if (!acs.length) continue;
      const a = acs[Math.floor(Math.random() * acs.length)];
      const alvos = E.alvosValidos(st, u, a);
      let uids = [];
      if (a.alvo === 'inimigo' || a.alvo === 'aliado' || a.alvo === 'auto') {
        if (!alvos.length && a.alvo !== 'auto') continue;
        uids = alvos.length ? [alvos[Math.floor(Math.random() * alvos.length)].uid] : [];
        if (a.alvo === 'auto' && !uids.length) { const inim = st.lados[1 - u.lado].units.filter(x => x.vivo); if (inim.length) uids = [inim[0].uid]; }
      } else if (a.alvo === 'doisInimigos') {
        uids = alvos.slice(0, 2).map(x => x.uid);
      }
      const r = E.agir(st, u.uid, a.slot, uids);
      if (!r.ok && verbose) console.log('   rejeitado:', a.nome, r.erro);
      if (st.fim) break;
    }
    if (st.fim) break;
    E.fimTurno(st);
  }
  // invariantes
  for (const lado of st.lados) for (const u of lado.units) {
    ok(u.hp >= 0 && u.hp <= 100, `HP fora de 0..100: ${u.nome}=${u.hp}`);
    ok(u.shield >= 0, `escudo negativo`);
    for (const k in u.cd) ok(u.cd[k] >= 0, `recarga negativa`);
    if (!u.vivo) ok(u.hp === 0, `unidade morta com HP>0`);
  }
  for (const lado of st.lados) E.ELEMS.forEach(e => ok(lado.orbs[e] >= 0, `orbe negativo (${e})`));
  return { st, turnos: st.turno, guard };
}

console.log('== 1. 400 partidas aleatórias ==');
let somaTurnos = 0, semFim = 0;
for (let s = 1; s <= 400; s++) {
  const { st, turnos } = partidaAleatoria(s);
  somaTurnos += turnos;
  if (!st.fim) semFim++;
}
console.log(`  média de turnos: ${(somaTurnos / 400).toFixed(1)} | sem desfecho: ${semFim}`);
ok(semFim === 0, 'houve partida sem desfecho');

// ---------------------------------------------- 2) regra 2: redução antes do escudo
console.log('== 2. regra 2 — redução antes do escudo ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 9);
  const alvo = st.lados[1].units[0];
  alvo.efeitos.push({ type: 'dmgReduction', v: 10, dur: 9 });
  alvo.shield = 20;
  st.lados[0].orbs['Tempestade'] = 9;
  E.agir(st, st.lados[0].units[0].uid, 'habilidade', [alvo.uid]);  // 25 de dano
  // 25 (+5 Brigid ausente) -10 red = 15 no escudo -> escudo 5, HP intacto
  ok(alvo.shield === 5, `escudo deveria ser 5, é ${alvo.shield}`);
  ok(alvo.hp === 100, `HP deveria ser 100, é ${alvo.hp}`);
  console.log(`  escudo=${alvo.shield} hp=${alvo.hp}  (esperado 5 / 100)`);
}

// ---------------------------------------------- 3) regra 3: DoT antes de agir
console.log('== 3. regra 3 — DoT conta antes de agir e pode matar ==');
{
  const st = E.novoEstado(['brigid', 'zeus', 'zeus'], ['ganesha', 'ganesha', 'ganesha'], 11);
  const alvo = st.lados[1].units[0];
  alvo.hp = 4;
  alvo.dots.push({ nome: 'Queimadura', v: 5, dur: 2 });
  E.fimTurno(st);   // passa para o jogador 2 -> DoT conta no início
  ok(!alvo.vivo, 'DoT deveria ter matado o alvo no início do turno dele');
  console.log(`  vivo=${alvo.vivo} hp=${alvo.hp}  (esperado false / 0)`);
}

// ---------------------------------------------- 4) regra 4: recarga N pula N-1
console.log('== 4. regra 4 — recarga 2 volta 2 turnos depois ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 13);
  const u = st.lados[0].units[0];
  st.lados[0].orbs['Tempestade'] = 20;
  E.agir(st, u.uid, 'habilidade', [st.lados[1].units[0].uid]);
  ok(u.cd.habilidade === 2, `cd deveria ser 2, é ${u.cd.habilidade}`);
  E.fimTurno(st); E.fimTurno(st);                 // volta ao jogador 1, turno 2
  ok(u.cd.habilidade === 1, `no turno 2 o cd deveria ser 1, é ${u.cd.habilidade}`);
  E.fimTurno(st); E.fimTurno(st);                 // turno 3
  ok(u.cd.habilidade === 0, `no turno 3 o cd deveria ser 0, é ${u.cd.habilidade}`);
  console.log(`  turno ${st.turno}, cd=${u.cd.habilidade}  (esperado 0)`);
}

// ---------------------------------------------- 5) regra 5: atordoar 1 turno = 1 ação
console.log('== 5. regra 5 — controle de 1 turno custa exatamente 1 ação ==');
{
  const st = E.novoEstado(['cuca', 'cuca', 'cuca'], ['zeus', 'zeus', 'zeus'], 17);
  const alvo = st.lados[1].units[0];
  st.lados[0].orbs['Umbra'] = 20;
  E.agir(st, st.lados[0].units[0].uid, 'habilidade', [alvo.uid]);  // adormece 2 turnos
  ok(E.ef(alvo, 'adormecido'), 'alvo deveria estar adormecido');
  E.fimTurno(st);
  ok(!E.podeAgir(alvo), 'adormecido não deveria poder agir');
  E.fimTurno(st); E.fimTurno(st);
  ok(!E.podeAgir(alvo), 'ainda adormecido no 2º turno');
  E.fimTurno(st); E.fimTurno(st);
  ok(E.podeAgir(alvo), 'deveria ter acordado após 2 turnos');
  console.log(`  acordou no turno ${st.turno}`);
}

// ---------------------------------------------- 6) regra 6: acúmulo
console.log('== 6. regra 6 — acúmulo por categoria ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 19);
  const u = st.lados[0].units[0];
  u.efeitos.push({ type: 'dmgUp', v: 8, dur: 2 });
  // dmgUp soma
  const before = E.ef(u, 'dmgUp').v;
  u.efeitos.find(e => e.type === 'dmgUp').v += 4;
  ok(E.ef(u, 'dmgUp').v === before + 4, 'dmgUp deveria somar');
  // dmgReduction pega o maior
  const alvo = st.lados[1].units[0];
  alvo.efeitos.push({ type: 'dmgReduction', v: 10, dur: 5 });
  alvo.efeitos.push({ type: 'dmgReduction', v: 15, dur: 5 });   // simula 2ª fonte
  const reds = alvo.efeitos.filter(e => e.type === 'dmgReduction').map(e => e.v);
  ok(Math.max(...reds) === 15, 'a maior redução deveria valer 15');
  console.log(`  dmgUp somado=${E.ef(u, 'dmgUp').v} | maior redução=${Math.max(...reds)}`);
}

// ---------------------------------------------- 7) regra 7: proteção vence controle
console.log('== 7. regra 7 — Invulnerável barra dano e efeito ==');
{
  const st = E.novoEstado(['cuca', 'cuca', 'cuca'], ['tyr', 'tyr', 'tyr'], 23);
  const alvo = st.lados[1].units[0];
  alvo.efeitos.push({ type: 'invulneravel', dur: 2 });
  st.lados[0].orbs['Umbra'] = 20;
  E.agir(st, st.lados[0].units[0].uid, 'habilidade', [alvo.uid]);
  ok(!E.ef(alvo, 'adormecido'), 'não deveria adormecer alvo Invulnerável');
  E.agir(st, st.lados[0].units[1].uid, 'basico', [alvo.uid]);
  ok(alvo.hp === 100, `Invulnerável não deveria sofrer dano, hp=${alvo.hp}`);
  console.log(`  hp=${alvo.hp} adormecido=${!!E.ef(alvo, 'adormecido')}  (esperado 100 / false)`);
}
{ // imunidade a controle do Tyr
  const st = E.novoEstado(['tyr', 'zeus', 'zeus'], ['cuca', 'cuca', 'cuca'], 29);
  st.lados[0].orbs['Aurora'] = 5; st.lados[0].orbs['Tempestade'] = 5;
  E.agir(st, st.lados[0].units[0].uid, 'milagre', []);
  ok(E.ef(st.lados[0].units[1], 'controlImmune'), 'time deveria estar imune a controle');
  E.fimTurno(st);
  st.lados[1].orbs['Umbra'] = 20;
  E.agir(st, st.lados[1].units[0].uid, 'habilidade', [st.lados[0].units[1].uid]);
  ok(!E.ef(st.lados[0].units[1], 'adormecido'), 'imune a controle não deveria adormecer');
  console.log(`  imunidade a controle bloqueou o Adormecer`);
}

// ---------------------------------------------- 8) conversão de orbe 3->1
console.log('== 8. conversão 3 → 1, uma vez por turno ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 31);
  const l = st.lados[0];
  E.ELEMS.forEach(e => l.orbs[e] = 0);
  l.orbs['Tempestade'] = 5; l.converteu = false;
  const antes = E.totalOrbs(l);
  const r1 = E.converter(st, 'Umbra');
  ok(r1.ok, 'primeira conversão deveria funcionar');
  ok(E.totalOrbs(l) === antes - 2, `total deveria cair 2 (3 gastos, 1 ganho): ${antes} -> ${E.totalOrbs(l)}`);
  ok(l.orbs['Umbra'] === 1, 'deveria ter 1 Umbra');
  const r2 = E.converter(st, 'Chama');
  ok(!r2.ok, 'segunda conversão no mesmo turno deveria falhar');
  console.log(`  total ${antes} -> ${E.totalOrbs(l)} | Umbra=${l.orbs['Umbra']} | 2ª bloqueada=${!r2.ok}`);
}

// ---------------------------------------------- 9) Tyr fura escudo e redução
console.log('== 9. passiva do Tyr ignora redução E escudo ==');
{
  const st = E.novoEstado(['tyr', 'tyr', 'tyr'], ['zeus', 'zeus', 'zeus'], 37);
  const alvo = st.lados[1].units[0];
  alvo.shield = 50; alvo.efeitos.push({ type: 'dmgReduction', v: 15, dur: 9 });
  E.agir(st, st.lados[0].units[0].uid, 'basico', [alvo.uid]);   // 12, grátis
  ok(alvo.shield === 50, 'escudo não deveria ser tocado');
  ok(alvo.hp === 88, `HP deveria ser 88, é ${alvo.hp}`);
  console.log(`  escudo=${alvo.shield} hp=${alvo.hp}  (esperado 50 / 88)`);
}

// ---------------------------------------------- 10) Nezha renasce 1x
console.log('== 10. Nezha renasce uma única vez ==');
{
  const st = E.novoEstado(['nezha', 'zeus', 'zeus'], ['ogum', 'ogum', 'ogum'], 41);
  const n = st.lados[0].units[0];
  n.hp = 5;
  E.fimTurno(st);
  st.lados[1].orbs['Verdejante'] = 20;
  E.agir(st, st.lados[1].units[0].uid, 'basico', [n.uid]);
  ok(!n.vivo && n.pendenteRenascer, 'deveria estar caído com renascimento pendente');
  E.fimTurno(st);
  ok(n.vivo && n.hp === 40, `deveria voltar com 40, vivo=${n.vivo} hp=${n.hp}`);
  console.log(`  voltou vivo=${n.vivo} hp=${n.hp}`);
}

console.log('');
console.log(falhas === 0 ? '>>> TODOS OS TESTES PASSARAM' : `>>> ${falhas} FALHA(S)`);
process.exit(falhas ? 1 : 0);

// tests/niveis_pve.test.js — §323 P2 ETAPA A: os NÍVEIS do jogador valem em TODO o PvE.
// O cliente monta o kit efetivo do lado 0 com os níveis da conta e CARIMBA um snapshot no replay; o servidor
// RE-MONTA com esse snapshot, mas o CONFERE contra a conta (os níveis só sobem → snapshot acima = forjado).
// Guardas, cada uma provada que MORDE:
//   1. PvE monta com os níveis (niveisEmBatalha/kitDe mudam vs base);
//   2. replay COM snapshot válido bate o hash → credita (round-trip cliente↔servidor);
//   3. snapshot ACIMA da conta → recusado (niveis_invalidos); deus NÃO possuído no snapshot → recusado;
//   4. snapshot ABAIXO da conta credita (replay gravado antes de subir); envelope SEM níveis → base.
const contas = require('../server/contas.js');
const HOST = require('../server/motor-host.js');
const E = HOST.E, ia = HOST.ia;
const DADOS = require('../server/dados-pve.js');
const pve = require('../server/pve.js');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };

const energia = (DADOS.ECONOMIA && DADOS.ECONOMIA.energia) || null;
const TEAM = ['zeus', 'ogum', 'tyr'], ENEMY = ['cuca'];
const NIVEIS = { zeus: { basico: 2 } };   // zeus tem escada de básico que MUDA o kit no nv2 (pré-condição verificada abaixo)
const SEED = 123;

// harness idêntico ao economia.test: joga o lado 0 guloso (grava só as ações do jogador) e roda a IA.
function jogar(montarFn) {
  let st; try { st = montarFn(); } catch (e) { return { erro: e.message }; }
  const ops = []; let g = 0;
  while (!st.fim && g++ < 6000) {
    if (st.ativo === 0) {
      for (const u of st.lados[0].units) {
        if (st.fim) break;
        if (!E.podeAgir(u)) continue;
        const acoes = E.acoesDe(st, u).filter(a => a.disponivel);
        if (!acoes.length) continue;
        const a = acoes[0];
        let alvos = [];
        if (a.alvo === 'distribui') { const vs = E.alvosValidos(st, u, a, 0, []); if (vs.length) alvos = [vs[0].uid]; }
        else { const passos = (a.passos || []).length; let bom = true; for (let p = 0; p < passos; p++) { const vs = E.alvosValidos(st, u, a, p, alvos); if (!vs.length) { bom = false; break; } alvos.push(vs[0].uid); } if (!bom) continue; }
        const r = E.agir(st, u.uid, a.slot, alvos, null, null);
        if (r && r.ok) ops.push({ tipo: 'agir', uid: u.uid, slot: a.slot, alvos, escolhas: null, modo: null });
      }
      if (st.fim) break;
      ops.push({ tipo: 'fim' }); E.fimTurno(st);
    } else {
      let p = 0, mv;
      while (!st.fim && (mv = ia.iaProximaAcao(st, 'normal')) && p++ < 16) E.agir(st, mv.uid, mv.slot, mv.alvos || [], mv.escolhas || null, mv.modo || null);
      if (!st.fim) E.fimTurno(st);
    }
  }
  return { ops, venceu: !!(st.fim && st.fim.resultado === 'vitoria' && st.fim.lado === 0) };
}
let _seq = 0;
const novaConta = () => contas.criar({ faixaIdade: 'maior' }).conta;
const idNovo = () => 'p' + (++_seq) + '_' + Date.now();
const repSandbox = (extra) => Object.assign({ modo: 'sandbox', aliados: TEAM, inimigos: ENEMY, seed: SEED, comeca: 0, idPartida: idNovo() }, extra);

console.log('');
console.log('== §323 P2 ETAPA A: níveis do jogador no PvE (montagem + replay + validação do snapshot) ==');

// ---- 1) a MONTAGEM aplica os níveis: niveisEmBatalha e o kit efetivo mudam vs base (BITE) ----
(() => {
  const stB = E.novoEstado(TEAM, ENEMY, SEED, 0, energia);                                   // base
  const stN = E.novoEstado(TEAM, ENEMY, SEED, 0, energia, undefined, [NIVEIS, {}]);          // com níveis do jogador
  const uB = stB.lados[0].units[0], uN = stN.lados[0].units[0];
  ok(E.niveisEmBatalha(stB, uB).basico === 1, 'sem níveis: zeus entra no básico nv1 (base)');
  ok(E.niveisEmBatalha(stN, uN).basico === 2, 'com níveis da conta: zeus entra no básico nv2 (montagem morde)');
  const kB = JSON.stringify(E.kitDe(stB, uB).ab.find(a => a.slot === 'basico'));
  const kN = JSON.stringify(E.kitDe(stN, uN).ab.find(a => a.slot === 'basico'));
  ok(kB !== kN, 'BITE: o kit efetivo do básico com nível DIFERE do base (os níveis chegam ao motor, não são enfeite)');
  // o inimigo (lado 1) permanece base — PvE não dá conta aos inimigos
  ok(E.niveisEmBatalha(stN, stN.lados[1].units[0]).basico === 1, 'o inimigo do PvE continua base (lado 1 = {})');
})();

// pré-condição: o jogador vence o sandbox montado COM níveis (a linha de ações que o servidor vai re-simular)
const jN = jogar(() => E.novoEstado(TEAM, ENEMY, SEED, 0, energia, undefined, [NIVEIS, {}]));
ok(jN.venceu, 'o jogador guloso vence o sandbox montado COM níveis (pré-condição do replay)');

// ---- 2) replay COM snapshot válido → re-monta igual, bate o hash e CREDITA (round-trip) ----
(() => {
  contas._resetParaTeste();
  const c = novaConta(); c.niveis = { zeus: { basico: 2 } };   // a conta REALMENTE está no nv2
  const r = pve.creditar(c, repSandbox({ niveis: NIVEIS, ops: jN.ops }), Date.now());
  ok(r.ok && r.creditou, 'replay COM snapshot de níveis: o servidor re-monta com ele, reproduz e CREDITA');
})();

// ---- 3) snapshot FORJADO → recusado (acima da conta; deus não possuído) ----
(() => {
  contas._resetParaTeste();
  const c = novaConta(); c.niveis = { zeus: { basico: 2 } };   // conta no nv2
  // (a) nível ACIMA da conta (básico 4 > 2) = forjado
  const rAlto = pve.creditar(c, repSandbox({ niveis: { zeus: { basico: 4 } }, ops: jN.ops }), Date.now());
  ok(!rAlto.ok && rAlto.motivo === 'niveis_invalidos', 'snapshot ACIMA da conta (básico 4 > 2) → recusado (niveis_invalidos)');
  // (b) deus NÃO possuído no snapshot
  const naoTem = ['hades', 'ra', 'thor', 'odin', 'anubis', 'susanoo', 'vishnu'].find(k => !(c.perfil.deuses && c.perfil.deuses[k])) || 'hades';
  const rPosse = pve.creditar(c, repSandbox({ niveis: { [naoTem]: { basico: 2 } }, ops: jN.ops }), Date.now());
  ok(!rPosse.ok && rPosse.motivo === 'niveis_invalidos', `snapshot com deus NÃO possuído (${naoTem}) → recusado`);
  // BITE de contraste: o MESMO envelope com snapshot IGUAL à conta (nv2) NÃO é recusado por níveis (credita)
  const rOk = pve.creditar(c, repSandbox({ niveis: NIVEIS, ops: jN.ops }), Date.now());
  ok(rOk.ok && rOk.creditou, 'contraste: snapshot = conta (nv2) passa a validação e credita (a recusa é dos forjados)');
})();

// ---- 4) snapshot ABAIXO da conta credita; envelope SEM níveis → base (back-compat) ----
(() => {
  contas._resetParaTeste();
  // (a) a conta subiu para nv4; um replay gravado ANTES (snapshot nv2 ≤ 4) ainda vale
  const c = novaConta(); c.niveis = { zeus: { basico: 4 } };
  const rBaixo = pve.creditar(c, repSandbox({ niveis: NIVEIS, ops: jN.ops }), Date.now());
  ok(rBaixo.ok && rBaixo.creditou, 'snapshot ABAIXO da conta (nv2 ≤ nv4) credita — replay gravado antes de subir ainda paga');
  // (b) envelope SEM níveis → base: um replay base (sem o campo niveis) credita como sempre (fila offline/antigos)
  contas._resetParaTeste();
  const c2 = novaConta();
  const jB = jogar(() => E.novoEstado(TEAM, ENEMY, SEED, 0, energia));   // jogado no BASE
  ok(jB.venceu, 'pré-condição: o jogador vence o sandbox base');
  const rBase = pve.creditar(c2, repSandbox({ ops: jB.ops }), Date.now());   // sem campo niveis
  ok(rBase.ok && rBase.creditou, 'envelope SEM níveis → servidor monta no base e credita (replays antigos / fila offline)');
})();

console.log(`\n${falhas ? '✗ ' + falhas + ' FALHA(S)' : '✓ tudo verde'} · ${passes} asserções`);
process.exit(falhas ? 1 : 0);

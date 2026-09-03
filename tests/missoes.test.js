'use strict';
// FASE 6 / §229 — MISSÕES: o contador no SERVIDOR conta SÓ PvP; os feitos lidos do log; a árvore sem
// ciclo e com todos alcançáveis; as 8 cadeias; 91 missões nomeando uma habilidade; e a GUARDA — o
// cliente NÃO forja progresso (nem por mensagem, nem por desconexão, nem por partida inacabada; idempotente).

const assert = require('assert');
const path = require('path');
const contas = require('../server/contas.js');
const salas = require('../server/salas.js');
const missoes = require('../server/missoes.js');
const gerador = require('../tools/gerar_missoes.js');
const FAM = require('../src/missoes_familias.js');
const E = require('../src/engine.js');
const { iaProximaAcao } = require('../src/ia.js');

let passes = 0;
function ok(c, m) { assert.ok(c, m); console.log('  ✓ ' + m); passes++; }
function eq(a, b, m) { assert.strictEqual(a, b, m + ` (esperado ${b}, veio ${a})`); console.log('  ✓ ' + m); passes++; }

// utilitário: cria uma conta com deuses dados (simula a posse — gacha/liberação anterior).
function novaConta(deuses) {
  const r = contas.criar({ faixaIdade: 'maior' });
  const c = r.conta;
  for (const k of deuses) contas._darDeus(c.token, k);
  return c;
}
// sala PvP falsa com um st (fim + log) montado à mão — o registrar só lê st.fim/turno/log e time0/1.
function salaFake(idA, idB, time0, time1, st, modo = 'pvp') {
  return { P: { st }, modo, ranqueado: false, registrado: false, pontuado: false, resultado: null,
    time0: time0.slice(), time1: time1.slice(),
    participantes: [{ contaId: idA }, { contaId: idB }] };
}

console.log('== FASE 6 / MISSÕES ==');

// ---------------------------------------------------------------------------
// 1. A ÁRVORE: 91 missões, sem ciclo, todos alcançáveis, as 8 cadeias, cada uma nomeia uma habilidade.
// ---------------------------------------------------------------------------
console.log('\n== 1. a árvore (varredura §202): sem ciclo · todos alcançáveis · 8 cadeias · habilidade nomeada ==');
{
  const doc = gerador.gerar();
  const v = gerador.validar(doc);
  ok(v.ok, 'a árvore VALIDA por varredura: ' + (v.ok ? 'sem ciclo, todos alcançáveis' : v.erros.join('; ')));
  eq(Object.keys(doc.missoes).length, 91, '91 missões (não-iniciais)');
  eq(v.alcancados, 91, 'os 91 são alcançáveis a partir dos 9 iniciais');

  // contagem por raridade real (SS 15 · S 30 · A 46 nos não-iniciais)
  const cnt = { A: 0, S: 0, SS: 0 };
  for (const k in doc.missoes) cnt[doc.missoes[k].raridade]++;
  ok(cnt.A === 46 && cnt.S === 30 && cnt.SS === 15, `raridade real: A ${cnt.A} · S ${cnt.S} · SS ${cnt.SS}`);

  // as 8 cadeias à mão (X destrava-se por Y): a passiva nomeia o parceiro em 5 das 7 + Odin especial.
  const esperado = { perseu: 'medusa', isis: 'osiris', mnevis: 'ra', raijin: 'fujin', inari: 'kitsune', change: 'houyi', hanuman: 'sunwukong' };
  for (const [alvo, parceiro] of Object.entries(esperado)) {
    const m = doc.missoes[alvo];
    ok(m && m.chain && m.prereq[0] === parceiro, `cadeia ${alvo} → ${parceiro} (à mão)`);
  }
  ok(doc.missoes.odin.especial && doc.missoes.odin.especial.nordicos >= 2, 'cadeia odin → 2+ Nórdicos no time (especial)');

  // cada missão nomeia UMA habilidade do PRÓPRIO deus, e a família vem dos DADOS (não do tema).
  let semHab = 0;
  for (const k in doc.missoes) { const m = doc.missoes[k]; if (!m.feito.habilidade || !m.feito.metrica) semHab++; }
  eq(semHab, 0, 'as 91 missões nomeiam a habilidade-assinatura do próprio deus');
  // exemplo do dono: curar com Apolo ≠ curar com outro — a habilidade é a de Apolo, derivada do kit.
  ok(doc.missoes.apolo.familia === 'cura' && /Cura|Alvorada|Canção/i.test(doc.missoes.apolo.feito.habilidade), 'Apolo: feito de CURA com habilidade nomeada do próprio kit');

  // os portões leem faixa por CHAVE de data/ranqueado.json (§226), não literal.
  for (const k in doc.missoes) { const m = doc.missoes[k]; if (m.raridade === 'S') eq(m.gate, 'iniciado', k + ' (S) portão Iniciado'); }
  ok(doc.missoes.zeus === undefined, 'os 9 iniciais NÃO têm missão (já nascem com o jogador)');
}

// ---------------------------------------------------------------------------
// 2. MEDIR O FEITO do log (atribuição por lado ativo; resolve o espelho).
// ---------------------------------------------------------------------------
console.log('\n== 2. medir o feito do st.log (as fontes que o motor JÁ emite) · atribuição por lado ==');
{
  const t0 = ['apolo', 'zeus', 'ogum'];     // apolo = cura
  const t1 = ['hades', 'fenrir', 'ares'];   // hades = roubo-de-orbe; fenrir = execução
  const log = [
    { tipo: 'turno', lado: 0 },
    { tipo: 'acao', origem: 'apolo', slot: 'milagre' },
    { tipo: 'cura', alvo: 'zeus', valor: 25 },
    { tipo: 'acao', origem: 'zeus', slot: 'basico' },
    { tipo: 'dano', origem: 'zeus', alvo: 'fenrir', valor: 20 },
    { tipo: 'turno', lado: 1 },
    { tipo: 'acao', origem: 'hades', slot: 'milagre' },
    { tipo: 'dano', origem: 'hades', alvo: 'zeus', valor: 40 },
    { tipo: 'orbe', lado: 1, valor: 1, ganhouLado: 1 },
    { tipo: 'queda', alvo: 'zeus', execucao: true, matador: 'hades' },
  ];
  const med = missoes.medir({ log }, t0, t1);
  eq(med[0].curaFeita, 25, 'lado 0: curaFeita = 25 (o milagre de Apolo)');
  eq(med[0].danoDireto, 20, 'lado 0: danoDireto = 20');
  eq(med[1].danoDireto, 40, 'lado 1: danoDireto = 40');
  eq(med[1].orbesRoubados, 1, 'lado 1: orbesRoubados = 1 (ganhouLado)');
  eq(med[1].execucoes, 1, 'lado 1: execucoes = 1 (queda por execução, matador do lado 1)');

  // ESPELHO: apolo nos DOIS times; a cura vai ao lado ATIVO no momento (não pela key ambígua).
  const eA = ['apolo', 'zeus', 'ogum'], eB = ['apolo', 'hades', 'ares'];
  const logE = [
    { tipo: 'turno', lado: 0 }, { tipo: 'acao', origem: 'apolo', slot: 'milagre' }, { tipo: 'cura', alvo: 'apolo', valor: 30 },
    { tipo: 'turno', lado: 1 }, { tipo: 'acao', origem: 'apolo', slot: 'milagre' }, { tipo: 'cura', alvo: 'apolo', valor: 10 },
  ];
  const medE = missoes.medir({ log: logE }, eA, eB);
  eq(medE[0].curaFeita, 30, 'espelho: cura do turno do lado 0 → lado 0 (30)');
  eq(medE[1].curaFeita, 10, 'espelho: cura do turno do lado 1 → lado 1 (10)');
}

// ---------------------------------------------------------------------------
// 3. REGISTRAR PvP no ledger: vitórias/sequência (reset na derrota)/pares/feitos. Só PvP.
// ---------------------------------------------------------------------------
console.log('\n== 3. o contador no servidor: vitórias · sequência (reset na derrota) · pares · feitos ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['apolo', 'zeus', 'ogum']);
  const B = novaConta(['hades', 'fenrir', 'ares']);
  const st = { turno: 5, fim: { lado: 0 }, log: [
    { tipo: 'turno', lado: 0 }, { tipo: 'acao', origem: 'apolo', slot: 'milagre' }, { tipo: 'cura', alvo: 'zeus', valor: 40 },
  ] };
  const sala = salaFake(A.id, B.id, ['apolo', 'zeus', 'ogum'], ['hades', 'fenrir', 'ares'], st);
  missoes.registrarPvP(sala);

  const la = contas._garantirMissoes(contas._contaPorId(A.id));
  const lb = contas._garantirMissoes(contas._contaPorId(B.id));
  eq(la.vitoriasPvP.apolo, 1, 'vencedor: vitoriasPvP[apolo] = 1');
  eq(la.sequenciaPvP.zeus, 1, 'vencedor: sequenciaPvP[zeus] = 1');
  eq(la.feitos.apolo, 40, 'vencedor: feitos[apolo] = 40 (cura acumulada)');
  eq(la.paresPvP['apolo+zeus'], 1, 'vencedor: paresPvP[apolo+zeus] = 1 (para as cadeias)');
  eq(lb.vitoriasPvP.hades || 0, 0, 'perdedor: sem vitória');

  // sequência RESETA na derrota: A vence de novo (seq 2), depois PERDE (seq 0).
  missoes.registrarPvP(salaFake(A.id, B.id, ['apolo', 'zeus', 'ogum'], ['hades', 'fenrir', 'ares'], { turno: 3, fim: { lado: 0 }, log: [] }));
  eq(contas._garantirMissoes(contas._contaPorId(A.id)).sequenciaPvP.zeus, 2, 'sequência sobe para 2');
  missoes.registrarPvP(salaFake(A.id, B.id, ['apolo', 'zeus', 'ogum'], ['hades', 'fenrir', 'ares'], { turno: 3, fim: { lado: 1 }, log: [] }));
  eq(contas._garantirMissoes(contas._contaPorId(A.id)).sequenciaPvP.zeus, 0, 'sequência RESETA para 0 na derrota');
  eq(contas._garantirMissoes(contas._contaPorId(B.id)).sequenciaPvP.hades, 1, 'o outro lado sobe a sequência ao vencer');
}

// ---------------------------------------------------------------------------
// 4. SÓ PvP: uma partida PvE NÃO toca o contador de missão (a maestria é que conta CPU — §215/§228).
// ---------------------------------------------------------------------------
console.log('\n== 4. conta SÓ PvP (PvE não credita missão — a maestria, cosmética, é que conta CPU) ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['apolo', 'zeus', 'ogum']);
  const B = novaConta(['hades', 'fenrir', 'ares']);
  const st = { turno: 4, fim: { lado: 0 }, log: [{ tipo: 'turno', lado: 0 }, { tipo: 'acao', origem: 'apolo', slot: 'milagre' }, { tipo: 'cura', alvo: 'zeus', valor: 99 }] };
  const salaPvE = salaFake(A.id, B.id, ['apolo', 'zeus', 'ogum'], ['hades', 'fenrir', 'ares'], st, 'pve');
  salas.finalizarPartida(salaPvE);   // caminho real: só chama registrarPvP se modo==='pvp'
  eq(Object.keys(contas._garantirMissoes(contas._contaPorId(A.id)).vitoriasPvP).length, 0, 'PvE: ZERO vitória de missão registrada');
  eq(Object.keys(contas._garantirMissoes(contas._contaPorId(A.id)).feitos).length, 0, 'PvE: ZERO feito acumulado');
}

// ---------------------------------------------------------------------------
// 5. LIBERAR um deus: prereq + vitórias + feito → a missão cumpre (progressão, do servidor).
// ---------------------------------------------------------------------------
console.log('\n== 5. liberar um deus: prereq (inicial) + vitórias PvP + o feito → missão cumprida ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  // escolhe um alvo A-camada-1 cujo prereq seja um inicial e cujo feito seja de CURA (mensurável no log).
  const doc = missoes.DOC;
  let alvo = null;
  for (const k of Object.keys(doc.missoes)) {
    const m = doc.missoes[k];
    if (m.raridade === 'A' && m.camada === 1 && !m.chain && m.feito.metrica === 'curaFeita' && doc.iniciais.includes(m.prereq[0])) { alvo = k; break; }
  }
  ok(alvo, 'achei um alvo A-camada-1 de cura com prereq inicial: ' + alvo);
  const m = doc.missoes[alvo];
  const inicial = m.prereq[0];
  const A = novaConta([inicial, alvo, 'zeus']);   // possui o inicial e TRIALA o alvo (feito do próprio deus)
  const B = novaConta(['hades', 'fenrir', 'ares']);
  // vence m.vitorias vezes com [inicial, alvo], acumulando a cura do alvo até o alvo do feito.
  const curaPorPartida = Math.ceil(m.feito.alvo / m.vitorias) + 5;
  for (let i = 0; i < m.vitorias; i++) {
    const log = [{ tipo: 'turno', lado: 0 }, { tipo: 'acao', origem: alvo, slot: m.feito.slot === 'passiva' ? 'milagre' : m.feito.slot }, { tipo: 'cura', alvo: inicial, valor: curaPorPartida }];
    missoes.registrarPvP(salaFake(A.id, B.id, [inicial, alvo, 'zeus'], ['hades', 'fenrir', 'ares'], { turno: 3, fim: { lado: 0 }, log }));
  }
  const la = contas._garantirMissoes(contas._contaPorId(A.id));
  ok(la.vitoriasPvP[inicial] >= m.vitorias, `venceu ${m.vitorias}+ PvP com o inicial ${inicial}`);
  ok(la.feitos[alvo] >= m.feito.alvo, `feito de ${alvo} atingiu o alvo (${la.feitos[alvo]} ≥ ${m.feito.alvo})`);
  ok(la.liberados[alvo], `MISSÃO CUMPRIDA: ${alvo} LIBERADO (progressão, marcada pelo servidor)`);
}

// ---------------------------------------------------------------------------
// 6. A GUARDA — o cliente NÃO forja progresso (§226 repetido para a missão).
// ---------------------------------------------------------------------------
console.log('\n== 6. a GUARDA: o cliente não forja missão (mensagem · inacabada · desconexão · idempotência) ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['apolo', 'zeus', 'ogum']);
  const B = novaConta(['hades', 'fenrir', 'ares']);

  // (a) MENSAGEM FORJADA: salvarPerfil NÃO carrega missão. Um perfil com missoes:{...} forjado é
  //     ignorado — o contador de missão não está no perfil do cliente, vive na conta (servidor).
  contas.salvarPerfil(A.token, Object.assign({}, contas.porToken(A.token).perfil, { missoes: { liberados: { zeus: true, hades: true } } }));
  const pubA = contas.missoesPublicas(contas._contaPorId(A.id));
  eq(pubA.liberados.length, 0, 'mensagem forjada (perfil.missoes) IGNORADA — nada liberado');

  // (b) PARTIDA INACABADA (st.fim null): registrarPvP não credita NADA.
  const inacabada = salaFake(A.id, B.id, ['apolo', 'zeus', 'ogum'], ['hades', 'fenrir', 'ares'], { turno: 2, fim: null, log: [{ tipo: 'cura', alvo: 'zeus', valor: 999 }] });
  eq(missoes.registrarPvP(inacabada), null, 'partida inacabada não entra no registrar (retorna null)');
  eq(Object.keys(contas._garantirMissoes(contas._contaPorId(A.id)).feitos).length, 0, 'inacabada: ZERO feito creditado');

  // (c) DESCONEXÃO = ABANDONO = DERROTA: quem abandona (lado perdedor) tem a sequência RESETADA e NÃO
  //     ganha vitória. Abandonar nunca credita progresso de missão (dominado por jogar, como §226).
  // primeiro uma vitória para B ter sequência, depois B abandona (perde) e a sequência cai.
  missoes.registrarPvP(salaFake(A.id, B.id, ['apolo', 'zeus', 'ogum'], ['hades', 'fenrir', 'ares'], { turno: 3, fim: { lado: 1 }, log: [] }));
  eq(contas._garantirMissoes(contas._contaPorId(B.id)).sequenciaPvP.hades, 1, 'B tinha sequência 1');
  missoes.registrarPvP(salaFake(A.id, B.id, ['apolo', 'zeus', 'ogum'], ['hades', 'fenrir', 'ares'], { turno: 3, fim: { lado: 0, motivo: 'abandono' } , log: [] }));
  eq(contas._garantirMissoes(contas._contaPorId(B.id)).sequenciaPvP.hades, 0, 'abandono = derrota: a sequência de quem abandonou RESETA (não credita)');
  eq(contas._garantirMissoes(contas._contaPorId(B.id)).vitoriasPvP.hades, 1, 'abandono NÃO soma vitória ao abandonador');

  // (d) IDEMPOTÊNCIA: finalizarPartida chamada 2× conta UMA vez (o flag registrado, como o pontuado).
  contas._resetParaTeste(); salas._limparTudo();
  const C = novaConta(['apolo', 'zeus', 'ogum']);
  const D = novaConta(['hades', 'fenrir', 'ares']);
  const st = { turno: 3, fim: { lado: 0 }, log: [{ tipo: 'turno', lado: 0 }, { tipo: 'acao', origem: 'apolo', slot: 'milagre' }, { tipo: 'cura', alvo: 'zeus', valor: 30 }] };
  const sala = salaFake(C.id, D.id, ['apolo', 'zeus', 'ogum'], ['hades', 'fenrir', 'ares'], st);
  salas.finalizarPartida(sala); salas.finalizarPartida(sala); salas.finalizarPartida(sala);
  eq(contas._garantirMissoes(contas._contaPorId(C.id)).vitoriasPvP.apolo, 1, 'idempotente: 3× finalizarPartida = 1 vitória');
  eq(contas._garantirMissoes(contas._contaPorId(C.id)).feitos.apolo, 30, 'idempotente: feito creditado UMA vez (30, não 90)');
}

// ---------------------------------------------------------------------------
// 7. Realismo: uma partida de MOTOR de verdade produz feitos mensuráveis (o leitor lê o log real).
// ---------------------------------------------------------------------------
console.log('\n== 7. realismo: partida de motor real → feitos mensuráveis pelo mesmo leitor ==');
{
  const A = ['apolo', 'poseidon', 'ares'], B = ['hades', 'fenrir', 'zeus'];
  const st = E.novoEstado(A, B, 42, 0);
  let guard = 0;
  while (!st.fim && guard++ < 400) { let p = 0, a; while (!st.fim && (a = iaProximaAcao(st)) && p++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas); if (st.fim) break; E.fimTurno(st); }
  ok(st.fim, 'a partida de motor terminou');
  const med = missoes.medir(st, A, B);
  const totalDano = (med[0].danoDireto || 0) + (med[1].danoDireto || 0);
  ok(totalDano > 0, `o leitor mediu dano real das duas partes (${totalDano})`);
}

console.log(`\n== MISSÕES OK — ${passes} asserções ==`);

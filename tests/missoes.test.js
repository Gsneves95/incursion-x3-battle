'use strict';
// FASE 6 / §230-§231 — MISSÕES: as 91 com os REQUISITOS DO DONO (vínculo temático), o requisito =
// VOLUME por panteão + SEGUIDAS com o companheiro (nunca com o deus a liberar), a árvore revalidada por
// varredura CONTRA OS DADOS (sem ciclo, todos alcançáveis), o caso Maia confirmado, e a GUARDA — o
// cliente não forja progresso.

const assert = require('assert');
const contas = require('../server/contas.js');
const salas = require('../server/salas.js');
const missoes = require('../server/missoes.js');
const gerador = require('../tools/gerar_missoes.js');
const req = require('../data/missoes_requisitos.json');
const E = require('../src/engine.js');
const { iaProximaAcao } = require('../src/ia.js');

let passes = 0;
function ok(c, m) { assert.ok(c, m); console.log('  ✓ ' + m); passes++; }
function eq(a, b, m) { assert.strictEqual(a, b, m + ` (esperado ${b}, veio ${a})`); console.log('  ✓ ' + m); passes++; }

function novaConta(deuses) { const r = contas.criar({ faixaIdade: 'maior' }); const c = r.conta; for (const k of deuses) contas._darDeus(c.token, k); return c; }
function salaFake(idA, idB, time0, time1, st, modo = 'pvp') {
  return { P: { st }, modo, ranqueado: false, registrado: false, pontuado: false, resultado: null,
    time0: time0.slice(), time1: time1.slice(), participantes: [{ contaId: idA }, { contaId: idB }] };
}
function vitoria(idA, idB, t0, t1, ladoVenc) { missoes.registrarPvP(salaFake(idA, idB, t0, t1, { turno: 3, fim: { lado: ladoVenc }, log: [] })); }

console.log('== FASE 6 / MISSÕES (§230: volume + companheiro temático) ==');

// ---------------------------------------------------------------------------
// 1. A ÁRVORE revalidada por VARREDURA contra os DADOS do repositório (§202).
// ---------------------------------------------------------------------------
console.log('\n== 1. a árvore por varredura contra os dados: sem ciclo · todos alcançáveis · caso Maia ==');
{
  const doc = gerador.gerar();
  const v = gerador.validar(doc);
  ok(v.ok, 'VALIDA por varredura: ' + (v.ok ? 'sem ciclo, 91 alcançáveis, Maia fecha' : v.erros.join('; ')));
  eq(Object.keys(doc.missoes).length, 91, '91 missões');
  eq(v.alcancados, 91, 'os 91 alcançáveis a partir dos 9 iniciais');
  ok(v.maiaCross, 'caso MAIA confirmado (itzamná exige Egípcia+ra; os outros 3 Maias descem dele)');

  const cnt = { A: 0, S: 0, SS: 0 }; let comComp = 0;
  for (const k in doc.missoes) { cnt[doc.missoes[k].raridade]++; if (doc.missoes[k].companheiro) comComp++; }
  ok(cnt.A === 46 && cnt.S === 30 && cnt.SS === 15, `raridade real: A ${cnt.A} · S ${cnt.S} · SS ${cnt.SS}`);
  eq(comComp, 83, '83 têm companheiro; 8 são só volume (portões de entrada)');

  // os requisitos vêm do ARQUIVO DO DONO, não da mecânica: panteão + companheiro + motivo por deus.
  let semMotivo = 0, foraArquivo = 0;
  const noArquivo = new Map(req.map(r => [r.deus, r]));
  for (const k in doc.missoes) {
    const m = doc.missoes[k], r = noArquivo.get(k);
    if (!r) { foraArquivo++; continue; }
    if (m.panteao !== r.panteao || (m.companheiro || null) !== (r.companheiro || null)) foraArquivo++;
    if (!m.motivo) semMotivo++;
  }
  eq(foraArquivo, 0, 'as 91 batem com o arquivo do dono (panteão + companheiro)');
  eq(semMotivo, 0, 'cada missão carrega o motivo mitológico (do dono)');

  // os VOLUMES vêm da raridade real (do dono): SS 40+5 · S 20+3 · A 15(+comp).
  const it = doc.missoes.itzamna;
  ok(it.raridade === 'SS' && it.vitoriasPanteao === 40 && it.seguidasCompanheiro === 5, 'SS: 40 vitórias + 5 seguidas (itzamná)');
  const isis = doc.missoes.isis; ok(isis.vitoriasPanteao === 20 && isis.seguidasCompanheiro === 3, 'S: 20 vitórias + 3 seguidas (ísis)');
  const hades = doc.missoes.hades; ok(hades.raridade === 'SS' && hades.companheiro === 'cerberus', 'Hades (SS) exige o companheiro cerberus');
  const cerb = doc.missoes.cerberus; ok(cerb.raridade === 'A' && cerb.vitoriasPanteao === 15 && cerb.seguidasCompanheiro === 0 && !cerb.companheiro, 'A só-volume: cerberus 15, sem companheiro (portão Grego)');

  // os 3 cruzamentos temáticos (panteão exigido ≠ facção real): itzamná por NECESSIDADE, kraken/exu por tema.
  ok(doc.panteaoDe.itzamna === 'Maia' && it.panteao === 'Egípcia', 'itzamná: facção real Maia, exige Egípcia (o cruzamento estrutural)');
  ok(doc.panteaoDe.kraken === 'Nórdica' && doc.missoes.kraken.panteao === 'Grega', 'kraken: facção Nórdica, exige Grega (companheiro poseidon resolve)');
}

// ---------------------------------------------------------------------------
// 2. O VOLUME por panteão: uma vitória conta para CADA panteão do time vencedor.
// ---------------------------------------------------------------------------
console.log('\n== 2. o volume: vitória conta por panteão presente no time · sequência reseta na derrota ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['zeus', 'tyr', 'sobek']);   // Grega, Nórdica, Egípcia
  const B = novaConta(['nezha', 'cuca', 'ganesha']);
  vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 0);
  const la = contas._garantirMissoes(contas._contaPorId(A.id));
  eq(la.vitoriasPanteaoPvP['Grega'], 1, 'vitória credita Grega (zeus)');
  eq(la.vitoriasPanteaoPvP['Nórdica'], 1, 'a MESMA vitória credita Nórdica (tyr)');
  eq(la.vitoriasPanteaoPvP['Egípcia'], 1, 'e Egípcia (sobek) — um por panteão do time');
  eq(la.sequenciaPvP['zeus'], 1, 'sequência do companheiro sobe (zeus)');
  // derrota reseta a sequência de quem jogou
  vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 1);
  eq(contas._garantirMissoes(contas._contaPorId(A.id)).sequenciaPvP['zeus'], 0, 'derrota RESETA a sequência (para as "seguidas")');
  eq(contas._garantirMissoes(contas._contaPorId(A.id)).vitoriasPanteaoPvP['Grega'], 1, 'a derrota NÃO soma volume');
}

// ---------------------------------------------------------------------------
// 3. LIBERAR um deus A: companheiro (inicial) possuído + volume do panteão → cumprida.
// ---------------------------------------------------------------------------
console.log('\n== 3. liberar um A (saci): companheiro inicial (cuca) + 15 vitórias Brasileira ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const alvo = missoes.DOC.missoes.saci;
  ok(alvo && alvo.companheiro === 'cuca' && alvo.panteao === 'Brasileira' && alvo.vitoriasPanteao === 15, 'saci: companheiro cuca (inicial), 15 Brasileira');
  const A = novaConta(['cuca', 'zeus', 'ogum']);   // possui cuca (inicial)
  const B = novaConta(['nezha', 'tyr', 'sobek']);
  for (let i = 0; i < 15; i++) vitoria(A.id, B.id, ['cuca', 'zeus', 'ogum'], ['nezha', 'tyr', 'sobek'], 0);
  const la = contas._garantirMissoes(contas._contaPorId(A.id));
  eq(la.vitoriasPanteaoPvP['Brasileira'], 15, '15 vitórias com o panteão Brasileira (cuca no time)');
  ok(la.liberados['saci'], 'MISSÃO CUMPRIDA: saci LIBERADO (volume + companheiro, do servidor)');
  ok(!la.liberados['iara'], 'iara (S, 20+3) ainda NÃO — o volume é maior');
}

// ---------------------------------------------------------------------------
// 4. O CASO MAIA em cascata (ponto-fixo): itzamná (cruzado) → chaac/kukulkan → ahpuch.
// ---------------------------------------------------------------------------
console.log('\n== 4. o caso Maia em cascata: itzamná (Egípcia+ra) → chaac/kukulkan → ahpuch (ponto-fixo) ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const c = novaConta(['sobek', 'zeus', 'ogum']);
  const led = contas._garantirMissoes(contas._contaPorId(c.id));
  // semeia o ledger no limiar: ra já liberado; volume Egípcia e Maia atingidos; seguidas de ra/itzamná/chaac.
  led.liberados['ra'] = true;
  led.vitoriasPanteaoPvP['Egípcia'] = 40; led.vitoriasPanteaoPvP['Maia'] = 20;
  led.sequenciaPvP['ra'] = 5; led.sequenciaPvP['itzamna'] = 3; led.sequenciaPvP['chaac'] = 3;
  missoes._liberarCumpridas(contas._contaPorId(c.id));
  const L = contas._garantirMissoes(contas._contaPorId(c.id));
  ok(L.liberados['itzamna'], 'itzamná LIBERADO (Egípcia 40 + ra + 5 seguidas) — o cruzamento abre a mitologia Maia');
  ok(L.liberados['chaac'], 'chaac LIBERADO na MESMA passagem (Maia 20 + itzamná recém-liberado + 3 seguidas)');
  ok(L.liberados['kukulkan'], 'kukulkan LIBERADO (companheiro itzamná)');
  ok(L.liberados['ahpuch'], 'ahpuch LIBERADO (companheiro chaac, também recém-liberado) — cascata por ponto-fixo');
}

// ---------------------------------------------------------------------------
// 5. SÓ PvP: uma partida PvE NÃO toca o contador de missão (§228: a maestria é que conta CPU).
// ---------------------------------------------------------------------------
console.log('\n== 5. conta SÓ PvP (PvE não credita missão) ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['zeus', 'tyr', 'sobek']);
  const B = novaConta(['nezha', 'cuca', 'ganesha']);
  const salaPvE = salaFake(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], { turno: 3, fim: { lado: 0 }, log: [] }, 'pve');
  salas.finalizarPartida(salaPvE);
  eq(Object.keys(contas._garantirMissoes(contas._contaPorId(A.id)).vitoriasPanteaoPvP).length, 0, 'PvE: ZERO volume de missão creditado');
}

// ---------------------------------------------------------------------------
// 6. A GUARDA — o cliente não forja progresso (§226/§230).
// ---------------------------------------------------------------------------
console.log('\n== 6. a GUARDA: mensagem forjada · inacabada · desconexão · idempotência ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['zeus', 'tyr', 'sobek']);
  const B = novaConta(['nezha', 'cuca', 'ganesha']);

  // (a) mensagem forjada: o contador de missão não está no perfil; salvarPerfil com missoes:{...} é ignorado.
  contas.salvarPerfil(A.token, Object.assign({}, contas.porToken(A.token).perfil, { missoes: { liberados: { hades: true } } }));
  eq(contas.missoesPublicas(contas._contaPorId(A.id)).liberados.length, 0, 'perfil forjado IGNORADO — nada liberado');

  // (b) partida inacabada: registrarPvP retorna null e não credita.
  eq(missoes.registrarPvP(salaFake(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], { turno: 2, fim: null, log: [] })), null, 'inacabada não entra (retorna null)');
  eq(Object.keys(contas._garantirMissoes(contas._contaPorId(A.id)).vitoriasPanteaoPvP).length, 0, 'inacabada: ZERO volume');

  // (c) desconexão = abandono = derrota: o abandonador tem a sequência resetada e não ganha volume.
  vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 1);   // B ganha, sequência sobe
  eq(contas._garantirMissoes(contas._contaPorId(B.id)).sequenciaPvP['nezha'], 1, 'B tinha sequência 1');
  const volAntes = contas._garantirMissoes(contas._contaPorId(B.id)).vitoriasPanteaoPvP['Chinesa'];   // 1
  missoes.registrarPvP(salaFake(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], { turno: 3, fim: { lado: 0, motivo: 'abandono' }, log: [] }));
  eq(contas._garantirMissoes(contas._contaPorId(B.id)).sequenciaPvP['nezha'], 0, 'abandono = derrota: a sequência de quem abandonou RESETA');
  eq(contas._garantirMissoes(contas._contaPorId(B.id)).vitoriasPanteaoPvP['Chinesa'], volAntes, 'abandono NÃO credita volume ao abandonador (fica em ' + volAntes + ')');

  // (d) idempotência: finalizarPartida 3× credita UMA vez (flag registrado).
  contas._resetParaTeste(); salas._limparTudo();
  const C = novaConta(['zeus', 'tyr', 'sobek']);
  const D = novaConta(['nezha', 'cuca', 'ganesha']);
  const sala = salaFake(C.id, D.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], { turno: 3, fim: { lado: 0 }, log: [] });
  salas.finalizarPartida(sala); salas.finalizarPartida(sala); salas.finalizarPartida(sala);
  eq(contas._garantirMissoes(contas._contaPorId(C.id)).vitoriasPanteaoPvP['Grega'], 1, 'idempotente: 3× finalizar = 1 vitória de volume');
}

// ---------------------------------------------------------------------------
// 7. O leitor de FEITOS segue vivo (maestria, §230) — mede do log real de uma partida de motor.
// ---------------------------------------------------------------------------
console.log('\n== 7. o leitor de feitos segue para maestria (fora do gate) — mede do log real ==');
{
  const A = ['apolo', 'poseidon', 'ares'], B = ['hades', 'fenrir', 'zeus'];
  const st = E.novoEstado(A, B, 42, 0);
  let guard = 0;
  while (!st.fim && guard++ < 400) { let p = 0, a; while (!st.fim && (a = iaProximaAcao(st)) && p++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas); if (st.fim) break; E.fimTurno(st); }
  ok(st.fim, 'a partida de motor terminou');
  const med = missoes.medir(st, A, B);
  ok(((med[0].danoDireto || 0) + (med[1].danoDireto || 0)) > 0, 'o leitor de feitos ainda mede do log real (maestria)');
}

console.log(`\n== MISSÕES OK — ${passes} asserções ==`);

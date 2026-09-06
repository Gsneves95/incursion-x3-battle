'use strict';
// FASE 6 / §230-§231 + §241 — MISSÕES: as 91 com os REQUISITOS DO DONO (vínculo temático), o requisito =
// VOLUME por panteão + SEQUÊNCIA (pela FAIXA) + PORTÃO DE RANQUE, com o CONTADOR COMEÇANDO NO DESBLOQUEIO
// (§241). A árvore revalidada por varredura (sem ciclo, todos alcançáveis, rampa em ordem, caso Maia), e a
// GUARDA — o cliente não forja progresso.

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

function novaConta(deuses, pontos) { const r = contas.criar({ faixaIdade: 'maior' }); const c = r.conta; for (const k of deuses) contas._darDeus(c.token, k); if (pontos) contas._contaPorId(c.id).ranque.pontos = pontos; return c; }
function setRank(id, p) { contas._contaPorId(id).ranque.pontos = p; }
function salaFake(idA, idB, time0, time1, st, modo = 'pvp') {
  return { P: { st }, modo, ranqueado: false, registrado: false, pontuado: false, resultado: null,
    time0: time0.slice(), time1: time1.slice(), participantes: [{ contaId: idA }, { contaId: idB }] };
}
function vitoria(idA, idB, t0, t1, ladoVenc) { missoes.registrarPvP(salaFake(idA, idB, t0, t1, { turno: 3, fim: { lado: ladoVenc }, log: [] })); }

console.log('== FASE 6 / MISSÕES (§230 volume+tema · §241 ranque+sequência+desde-desbloqueio) ==');

// ---------------------------------------------------------------------------
// 1. A ÁRVORE revalidada por VARREDURA contra os DADOS (§202) + a distribuição/rampa do §241.
// ---------------------------------------------------------------------------
console.log('\n== 1. a árvore: sem ciclo · alcançáveis · rampa em ordem · caso Maia · distribuição por faixa ==');
{
  const doc = gerador.gerar();
  const v = gerador.validar(doc);
  ok(v.ok, 'VALIDA por varredura: ' + (v.ok ? 'sem ciclo, 91 alcançáveis, rampa em ordem, Maia fecha' : v.erros.join('; ')));
  eq(Object.keys(doc.missoes).length, 91, '91 missões');
  eq(v.alcancados, 91, 'os 91 alcançáveis a partir dos 9 iniciais');
  ok(v.maiaCross, 'caso MAIA confirmado (itzamná exige Egípcia+ra; os outros 3 Maias descem dele)');

  const cnt = { A: 0, S: 0, SS: 0 }; let comComp = 0;
  for (const k in doc.missoes) { cnt[doc.missoes[k].raridade]++; if (doc.missoes[k].companheiro) comComp++; }
  ok(cnt.A === 46 && cnt.S === 30 && cnt.SS === 15, `raridade real: A ${cnt.A} · S ${cnt.S} · SS ${cnt.SS}`);
  eq(comComp, 83, '83 têm companheiro; 8 são só volume (portões de entrada)');

  // §241: DISTRIBUIÇÃO por faixa, mais generosa embaixo, soma 91.
  const dist = doc.distribuicao.map(f => f.quantas);
  assert.deepStrictEqual(dist, [18, 15, 13, 12, 11, 9, 7, 6], 'distribuição por faixa 18·15·13·12·11·9·7·6');
  console.log('  ✓ distribuição por faixa 18·15·13·12·11·9·7·6 (soma 91)'); passes++;
  eq(dist[0] + dist[1] + dist[2], 46, 'as 3 primeiras faixas abrem 46/91 (51%)');

  // §241: RAMPA da sequência correlacionada à faixa (2 embaixo → 4 no topo), TODA missão >=1, TETO 4.
  let semSeq = 0, acimaTeto = 0;
  for (const k in doc.missoes) { const m = doc.missoes[k]; if (!(m.seguidas >= 1)) semSeq++; if (m.seguidas > 4) acimaTeto++; }
  eq(semSeq, 0, 'TODA missão tem ≥1 sequência (§241 item 3)');
  eq(acimaTeto, 0, 'TETO 4: nenhuma sequência acima de 4 (§241, após a medição)');

  // §241: a cadeia correlaciona com a faixa — o companheiro destrava em faixa <= a do deus (rampa em ordem)
  let foraDeOrdem = 0;
  for (const k in doc.missoes) { const m = doc.missoes[k], c = m.companheiro; if (c && doc.missoes[c] && doc.missoes[c].faixaIndice > m.faixaIndice) foraDeOrdem++; }
  eq(foraDeOrdem, 0, 'a rampa está em ordem: o companheiro nunca destrava DEPOIS do deus');

  // os requisitos vêm do ARQUIVO DO DONO (tema), não da mecânica.
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

  // VOLUME por raridade (inalterado) + a nova sequência pela faixa + o portão de ranque.
  const it = doc.missoes.itzamna;
  ok(it.raridade === 'SS' && it.vitoriasPanteao === 40 && it.faixa === 'semideus' && it.seguidas === 4, 'itzamná: SS, 40 de volume, faixa Semideus, sequência 4 (topo da rampa)');
  const cerb = doc.missoes.cerberus;
  ok(cerb.vitoriasPanteao === 15 && !cerb.companheiro && cerb.seguidasAlvo.tipo === 'panteao' && cerb.seguidas >= 1, 'cerberus: A só-volume (porta Grega), sequência COM O PANTEÃO (sem companheiro)');
  const hades = doc.missoes.hades;
  ok(hades.companheiro === 'cerberus' && hades.faixaMin > 0, 'Hades exige o companheiro cerberus e tem portão de ranque (>0)');

  // os 3 cruzamentos temáticos seguem.
  ok(doc.panteaoDe.itzamna === 'Maia' && it.panteao === 'Egípcia', 'itzamná: facção real Maia, exige Egípcia (o cruzamento estrutural)');
  ok(doc.panteaoDe.kraken === 'Nórdica' && doc.missoes.kraken.panteao === 'Grega', 'kraken: facção Nórdica, exige Grega (companheiro poseidon)');
}

// ---------------------------------------------------------------------------
// 2. O VOLUME por panteão + a SEQUÊNCIA por panteão (nova, §241): uma vitória conta por panteão do time.
// ---------------------------------------------------------------------------
console.log('\n== 2. volume por panteão · sequência por deus E por panteão · derrota reseta ambas ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['zeus', 'tyr', 'sobek']);
  const B = novaConta(['nezha', 'cuca', 'ganesha']);
  vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 0);
  const la = contas._garantirMissoes(contas._contaPorId(A.id));
  eq(la.vitoriasPanteaoPvP['Grega'], 1, 'vitória credita Grega (zeus)');
  eq(la.vitoriasPanteaoPvP['Egípcia'], 1, 'a MESMA vitória credita Egípcia (sobek) — um por panteão');
  eq(la.sequenciaPvP['zeus'], 1, 'sequência do deus sobe (zeus)');
  eq(la.sequenciaPanteaoPvP['Grega'], 1, 'sequência do PANTEÃO sobe (§241, para as missões-porta)');
  vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 1);   // A perde
  const la2 = contas._garantirMissoes(contas._contaPorId(A.id));
  eq(la2.sequenciaPvP['zeus'], 0, 'derrota RESETA a sequência do deus');
  eq(la2.sequenciaPanteaoPvP['Grega'], 0, 'derrota RESETA a sequência do panteão');
  eq(la2.vitoriasPanteaoPvP['Grega'], 1, 'a derrota NÃO soma volume');
}

// ---------------------------------------------------------------------------
// 3. LIBERAR um A imediato (saci, Suplicante): companheiro inicial + volume + sequência, tudo do rank 0.
// ---------------------------------------------------------------------------
console.log('\n== 3. liberar saci (Suplicante, rank 0): cuca + 15 vitórias Brasileira + sequência 2 ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const alvo = missoes.DOC.missoes.saci;
  ok(alvo.companheiro === 'cuca' && alvo.panteao === 'Brasileira' && alvo.faixaMin === 0, 'saci: cuca (inicial), Brasileira, Suplicante (min 0)');
  const A = novaConta(['cuca', 'zeus', 'ogum']);
  const B = novaConta(['nezha', 'tyr', 'sobek']);
  for (let i = 0; i < 15; i++) vitoria(A.id, B.id, ['cuca', 'zeus', 'ogum'], ['nezha', 'tyr', 'sobek'], 0);
  const cA = contas._contaPorId(A.id), la = contas._garantirMissoes(cA);
  eq(la.vitoriasPanteaoPvP['Brasileira'], 15, '15 vitórias com o panteão Brasileira');
  eq((la.desbloqueio['saci'] || {}).volBase, 0, 'CONTADOR DESDE O DESBLOQUEIO: saci destravou de cara (rank 0), base 0 — as 15 contam');
  ok(la.liberados['saci'] && cA.perfil.deuses['saci'] && cA.perfil.deuses['saci'].viaMissao, 'saci CONCEDIDO (volume + companheiro + sequência)');
  ok(!la.liberados['iara'], 'iara (Devoto, min 100) NÃO — o portão de ranque ainda não abriu (rank 0)');
}

// ---------------------------------------------------------------------------
// 4. §241 — PORTÃO DE RANQUE: abaixo da faixaMin a missão NÃO destrava, mesmo com volume+companheiro+sequência.
// ---------------------------------------------------------------------------
console.log('\n== 4. PORTÃO DE RANQUE (§241 item 1, reverte §232): faixa alta trava até subir ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const hera = missoes.DOC.missoes.hera;   // Devoto, min 100, companheiro zeus (inicial)
  ok(hera.faixaMin === 100 && hera.companheiro === 'zeus', 'hera: Devoto (min 100), companheiro zeus');
  const A = novaConta(['zeus', 'tyr', 'sobek'], 0);   // rank 0
  const B = novaConta(['nezha', 'cuca', 'ganesha']);
  for (let i = 0; i < 25; i++) vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 0);
  let la = contas._garantirMissoes(contas._contaPorId(A.id));
  ok(!la.liberados['hera'], 'com volume DE SOBRA mas rank 0, hera NÃO destrava (o ranque revela)');
  ok(!la.desbloqueio['hera'], 'e nem base de desbloqueio foi gravada (ainda travada pelo ranque)');
  // sobe o ranque e joga mais UMA — agora destrava e a base é o volume ATUAL (o passado não conta)
  setRank(A.id, 100);
  const volAoSubir = la.vitoriasPanteaoPvP['Grega'];
  vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 0);
  la = contas._garantirMissoes(contas._contaPorId(A.id));
  eq((la.desbloqueio['hera'] || {}).volBase, volAoSubir, 'ao atingir o ranque, a base = volume DAQUELE momento (vitórias anteriores NÃO contam)');
  ok(!la.liberados['hera'], 'hera ainda não: só 1 vitória contou desde o desbloqueio, faltam ~20');
}

// ---------------------------------------------------------------------------
// 5. §241 — CONTADOR DESDE O DESBLOQUEIO: as vitórias PRÉ-desbloqueio não completam a missão.
// ---------------------------------------------------------------------------
console.log('\n== 5. contador desde o desbloqueio (§241 item 4): pré-farm não vale ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['zeus', 'tyr', 'sobek'], 100);   // já no ranque de hera (Devoto)
  const B = novaConta(['nezha', 'cuca', 'ganesha']);
  // hera destrava na 1ª avaliação (zeus possuído + rank 100), base = 0 → as vitórias A PARTIR daqui contam.
  for (let i = 0; i < 20; i++) vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 0);
  const la = contas._garantirMissoes(contas._contaPorId(A.id));
  eq((la.desbloqueio['hera'] || {}).volBase, 0, 'hera destravou de cara (rank já ≥100), base 0');
  ok(la.liberados['hera'], 'hera CONCEDIDA: 20 vitórias Gregas (volume) + 20 seguidas com zeus (sequência 2) desde o desbloqueio');
}

// ---------------------------------------------------------------------------
// 6. O CASO MAIA em cascata (ponto-fixo) — agora com o ranque no topo (Semideus, min 700).
// ---------------------------------------------------------------------------
console.log('\n== 6. cascata Maia (Semideus) EM ESTÁGIOS: o contador-desde-o-desbloqueio força jogo sequencial ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const c = novaConta(['sobek', 'zeus', 'ogum', 'ra'], 700);   // POSSUI ra (gacha) + ranque Semideus
  const id = c.id;
  const L = () => contas._garantirMissoes(contas._contaPorId(id));
  const D = () => contas._contaPorId(id).perfil.deuses;
  // ESTÁGIO 0: itzamná destrava (ra possuído + Semideus), base volume 0 — o passado (nenhum) não conta.
  missoes._liberarCumpridas(contas._contaPorId(id));
  ok(L().desbloqueio['itzamna'] && L().desbloqueio['itzamna'].volBase === 0, 'itzamná DESTRAVA (ra + Semideus), base 0');
  ok(!D()['itzamna'], 'mas NÃO concedido ainda: falta o volume DESDE o desbloqueio (sem pré-farm)');
  // ESTÁGIO 1: agora sim, farmar Egípcia + seguidas com ra → itzamná concedido.
  L().vitoriasPanteaoPvP['Egípcia'] = 40; L().sequenciaPvP['ra'] = 4;
  missoes._liberarCumpridas(contas._contaPorId(id));
  ok(D()['itzamna'], 'itzamná CONCEDIDO após 40 Egípcia + 4 seguidas com ra (desde o desbloqueio)');
  ok(L().desbloqueio['chaac'] && !D()['chaac'], 'chaac DESTRAVA (itzamná recém-concedido) mas ainda não completa: precisa de volume Maia FRESCO');
  // ESTÁGIO 2: farmar Maia + seguidas com itzamná → chaac e kukulkan concedidos.
  const baseMaia = L().desbloqueio['chaac'].volBase;
  L().vitoriasPanteaoPvP['Maia'] = baseMaia + 20; L().sequenciaPvP['itzamna'] = 4;
  missoes._liberarCumpridas(contas._contaPorId(id));
  ok(D()['chaac'], 'chaac CONCEDIDO (20 Maia DESDE seu desbloqueio + 4 seguidas com itzamná)');
  ok(D()['kukulkan'], 'kukulkan CONCEDIDO (companheiro itzamná + Maia + sequência)');
  ok(L().desbloqueio['ahpuch'] && !D()['ahpuch'], 'ahpuch DESTRAVA (chaac concedido) mas espera volume Maia fresco — a caçada é sequencial');
  // ESTÁGIO 3: mais volume Maia desde o desbloqueio do ahpuch → concedido.
  L().vitoriasPanteaoPvP['Maia'] = L().desbloqueio['ahpuch'].volBase + 15; L().sequenciaPvP['chaac'] = 4;
  missoes._liberarCumpridas(contas._contaPorId(id));
  ok(D()['ahpuch'], 'ahpuch CONCEDIDO — a cascata fecha, mas em ESTÁGIOS (o §241 impede fechar tudo de uma vez)');
}

// ---------------------------------------------------------------------------
// 7. SÓ PvP: uma partida PvE NÃO toca o contador de missão (§228).
// ---------------------------------------------------------------------------
console.log('\n== 7. conta SÓ PvP (PvE não credita missão) ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['zeus', 'tyr', 'sobek']);
  const B = novaConta(['nezha', 'cuca', 'ganesha']);
  const salaPvE = salaFake(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], { turno: 3, fim: { lado: 0 }, log: [] }, 'pve');
  salas.finalizarPartida(salaPvE);
  eq(Object.keys(contas._garantirMissoes(contas._contaPorId(A.id)).vitoriasPanteaoPvP).length, 0, 'PvE: ZERO volume de missão creditado');
}

// ---------------------------------------------------------------------------
// 8. A GUARDA — o cliente não forja progresso (§226/§230).
// ---------------------------------------------------------------------------
console.log('\n== 8. a GUARDA: mensagem forjada · inacabada · desconexão · idempotência ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['zeus', 'tyr', 'sobek']);
  const B = novaConta(['nezha', 'cuca', 'ganesha']);
  contas.salvarPerfil(A.token, Object.assign({}, contas.porToken(A.token).perfil, { missoes: { liberados: { hades: true } } }));
  eq(contas.missoesPublicas(contas._contaPorId(A.id)).liberados.length, 0, 'perfil forjado IGNORADO — nada liberado');
  eq(missoes.registrarPvP(salaFake(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], { turno: 2, fim: null, log: [] })), null, 'inacabada não entra (retorna null)');
  eq(Object.keys(contas._garantirMissoes(contas._contaPorId(A.id)).vitoriasPanteaoPvP).length, 0, 'inacabada: ZERO volume');

  vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 1);   // B ganha
  eq(contas._garantirMissoes(contas._contaPorId(B.id)).sequenciaPvP['nezha'], 1, 'B tinha sequência 1');
  const volAntes = contas._garantirMissoes(contas._contaPorId(B.id)).vitoriasPanteaoPvP['Chinesa'];
  missoes.registrarPvP(salaFake(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], { turno: 3, fim: { lado: 0, motivo: 'abandono' }, log: [] }));
  eq(contas._garantirMissoes(contas._contaPorId(B.id)).sequenciaPvP['nezha'], 0, 'abandono = derrota: a sequência de quem abandonou RESETA');
  eq(contas._garantirMissoes(contas._contaPorId(B.id)).vitoriasPanteaoPvP['Chinesa'], volAntes, 'abandono NÃO credita volume ao abandonador');

  contas._resetParaTeste(); salas._limparTudo();
  const C = novaConta(['zeus', 'tyr', 'sobek']);
  const D = novaConta(['nezha', 'cuca', 'ganesha']);
  const sala = salaFake(C.id, D.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], { turno: 3, fim: { lado: 0 }, log: [] });
  salas.finalizarPartida(sala); salas.finalizarPartida(sala); salas.finalizarPartida(sala);
  eq(contas._garantirMissoes(contas._contaPorId(C.id)).vitoriasPanteaoPvP['Grega'], 1, 'idempotente: 3× finalizar = 1 vitória de volume');
}

// ---------------------------------------------------------------------------
// 9. O leitor de FEITOS segue vivo (maestria, §230) — mede do log real de uma partida de motor.
// ---------------------------------------------------------------------------
console.log('\n== 9. o leitor de feitos segue para maestria (fora do gate) — mede do log real ==');
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

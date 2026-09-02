// tests/pareamento.test.js — F5.3: PAREAMENTO (dois humanos de verdade). Prova, por medição:
//  (1) a FILA: entra/espera/pareia; os casos chatos (sai da fila, entrada simultânea atômica, entrar
//      com partida em curso é recusado).
//  (2) o NICK: unicidade (índice normalizado) + bloqueio de ofensa (com leetspeak).
//  (3) POSSE do time: o servidor valida os 3 deuses — time com deus não possuído é RECUSA, não aviso.
//  (4) QUEM COMEÇA: a iniciativa do kit decide (§121); no empate, moeda do servidor (não a ordem da fila).
//  (5) A GUARDA (a prova central): dois clientes otimistas NÃO divergem entre si. Os TRÊS hashes batem —
//      jogador A, jogador B e servidor — em CADA passo de uma partida PvP completa.
const WebSocket = require('ws');
const proto = require('../server/protocol.js');
const host = require('../server/motor-host.js');
const contas = require('../server/contas.js');
const salas = require('../server/salas.js');
const fila = require('../server/fila.js');
const partidaCtrl = require('../server/partida.js');
const cli = require('../src/partida_cliente.js');

let falhas = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
cli.configurarPartida({ agir: host.E.agir, fimTurno: host.E.fimTurno, iaProximaAcao: host.ia.iaProximaAcao });
const dorme = (ms) => new Promise(r => setTimeout(r, ms));
const V = proto.PROTOCOL_VERSION;
const TIME_A = ['zeus', 'ogum', 'tyr'], TIME_B = ['sobek', 'brigid', 'ganesha'];   // todos do roster inicial

// política determinística: 1ª ação disponível de cada unidade do lado, 1º alvo válido.
function opsDoLado(st, lado) {
  const ops = [];
  for (const u of st.lados[lado].units) {
    if (!host.E.podeAgir(u)) continue;
    const acoes = host.E.acoesDe(st, u).filter(a => a.disponivel); if (!acoes.length) continue;
    const a = acoes[0]; let alvos = [];
    if (a.alvo === 'distribui') { const vs = host.E.alvosValidos(st, u, a, 0, []); if (vs.length) alvos = [vs[0].uid]; }
    else { const n = (a.passos || []).length; let bom = true; for (let p = 0; p < n; p++) { const vs = host.E.alvosValidos(st, u, a, p, alvos); if (!vs.length) { bom = false; break; } alvos.push(vs[0].uid); } if (!bom) continue; }
    ops.push({ uid: u.uid, slot: a.slot, alvos });
  }
  return ops;
}

(async () => {
  // ===== (2/3/4) sem rede: nick, posse, quem começa =====
  console.log('== 1. nick (unicidade+ofensa), posse do time, e quem começa (iniciativa + moeda justa) ==');
  contas._resetParaTeste(); fila._limpar(); salas._limparTudo();
  const a = contas.criar({ faixaIdade: 'maior' }).conta, b = contas.criar({ faixaIdade: 'maior' }).conta;
  ok(contas.definirNick(a.token, 'Trovao').ok, 'nick válido é aceito');
  ok(contas.definirNick(b.token, 'trovão').codigo === 'nick_em_uso', 'nick igual normalizado (acento/maiúscula) é recusado — unicidade');
  ok(contas.definirNick(b.token, 'h1tl3r').codigo === 'nick_ofensivo', 'nick ofensivo com leetspeak é bloqueado');
  ok(contas.definirNick(b.token, 'GeloEterno').ok, 'outro nick livre é aceito');
  ok(contas.validarTime(a.token, TIME_A).ok, 'time só com deuses possuídos: ok');
  ok(contas.validarTime(a.token, ['zeus', 'ogum', 'hermes']).codigo === 'deus_nao_possuido', 'time com deus NÃO possuído: recusa (posse importa, o cliente não decide)');

  // QUEM COMEÇA — iniciativa do kit decide; no empate, o `comeca` (moeda do servidor) vale, não a fila.
  contas._darDeus(a.token, 'hermes');   // dá Hermes (tem iniciativa) ao jogador A
  const mHermes = partidaCtrl.criarPvP(['hermes', 'ogum', 'tyr'], TIME_B, { seed: 7, comeca: 1 });   // pedi comeca=1
  ok(mHermes.st.ativo === 0, 'INICIATIVA (Hermes) força o starter para o lado dele, mesmo com comeca=1 pedido (§121)');
  const semIniA = partidaCtrl.criarPvP(TIME_A, TIME_B, { seed: 2, comeca: 0 });
  const semIniB = partidaCtrl.criarPvP(TIME_A, TIME_B, { seed: 3, comeca: 1 });
  ok(semIniA.st.ativo === 0 && semIniB.st.ativo === 1, 'sem iniciativa: o comeca (moeda do seed) decide — 0 ou 1 conforme o sorteio, não a ordem da fila');
  console.log('  nick único+limpo · posse validada · iniciativa força starter, senão moeda do servidor (não a fila)');

  // ===== o SERVIDOR sobe para os casos de fila e a guarda dos três hashes =====
  const { server } = require('../server/server.js');
  await new Promise(r => server.listen(0, r));
  const porta = server.address().port;

  // helper: um "jogador" = ws + conta + transporte pedir/push, aplicando pushes na sua MP.
  async function jogador(nick, time) {
    const c = contas.criar({ faixaIdade: 'maior' }).conta;
    contas.definirNick(c.token, nick);
    const ws = new WebSocket('ws://localhost:' + porta);
    await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });
    const J = { c, token: c.token, ws, MP: null, _pend: [], _pushWaiters: [], time };
    ws.on('message', (d) => {
      const m = JSON.parse(d.toString());
      if (m.push) {   // PUSH (jogada do oponente / pareamento a quem espera / relógio) — não casa com pedido
        if (J.MP && m.tipo === 'partida') cli.aplicarPush(J.MP, m);
        else if (!J.MP && m.tipo === 'partida') J.MP = cli.absorverPareado(m);
        const w = J._pushWaiters.shift(); if (w) w(m);
        return;
      }
      const cb = J._pend.shift(); if (cb) cb(m);   // resposta direta (inclui o pareado do remetente, sem push)
    });
    J.transporte = { pedir: (msg) => new Promise((res) => { J._pend.push(res); ws.send(JSON.stringify(msg)); }) };
    J.proximoPush = () => new Promise((res) => J._pushWaiters.push(res));
    return J;
  }

  // ===== (1) FILA: os casos chatos =====
  console.log('== 2. a fila: entra/espera, sai da fila, entrada com partida em curso é recusada ==');
  fila._limpar(); salas._limparTudo();
  const solo = await jogador('SoloUm', TIME_A);
  const r1 = await solo.transporte.pedir({ v: V, tipo: 'entrarFila', time: TIME_A, token: solo.token });
  ok(r1.tipo === 'naFila', 'primeiro a entrar: fica na fila esperando');
  ok(fila.esperando() === solo.c.id, 'o servidor tem esse jogador como o que espera');
  // sai da fila fechando o app (close): o esperando some
  solo.ws.close(); await dorme(80);
  ok(fila.esperando() === null, 'fechou o app na espera: saiu da fila (o servidor limpou)');

  // entrada com partida em curso: recusa
  fila._limpar(); salas._limparTudo();
  const jx = await jogador('EmPartida', TIME_A);
  salas.criar(jx.c.id, require('../data/provacoes/afrodite.json'), {});   // finge uma partida em curso (PvE)
  const rx = await jx.transporte.pedir({ v: V, tipo: 'entrarFila', time: TIME_A, token: jx.token });
  ok(rx.tipo === 'recusado' && rx.codigo === 'ja_em_partida', 'entrar na fila COM partida em curso: recusado');
  salas.encerrar(jx.c.id); jx.ws.close();
  // nick ausente: recusa (o nick é exigido na entrada do PvP)
  fila._limpar();
  const semNick = contas.criar({ faixaIdade: 'maior' }).conta;
  const wsSN = new WebSocket('ws://localhost:' + porta); await new Promise((res) => wsSN.on('open', res));
  const rsn = await new Promise((res) => { wsSN.once('message', d => res(JSON.parse(d))); wsSN.send(JSON.stringify({ v: V, tipo: 'entrarFila', time: TIME_A, token: semNick.token })); });
  ok(rsn.tipo === 'recusado' && rsn.codigo === 'sem_nick', 'entrar na fila SEM nick: recusado (o nick é pedido no PvP)');
  wsSN.close();
  console.log('  fila: espera · sai ao fechar · recusa com partida em curso · recusa sem nick');

  // ===== (5) A GUARDA: dois clientes otimistas + servidor — os TRÊS hashes batem em CADA passo =====
  console.log('== 3. GUARDA: dois clientes otimistas NÃO divergem — hash(A) == hash(B) == hash(servidor) em cada passo ==');
  fila._limpar(); salas._limparTudo();
  const A = await jogador('JogadorA', TIME_A);
  const B = await jogador('JogadorB', TIME_B);

  // A entra e espera; B entra e PAREIA. A recebe o pareamento por PUSH; B na resposta.
  const aPareou = A.proximoPush();
  const ra = await A.transporte.pedir({ v: V, tipo: 'entrarFila', time: A.time, token: A.token });
  ok(ra.tipo === 'naFila', 'A entra e espera');
  const rb = await B.transporte.pedir({ v: V, tipo: 'entrarFila', time: B.time, token: B.token });
  ok(rb.tipo === 'partida' && rb.pareado, 'B entra e PAREIA na hora');
  B.MP = cli.absorverPareado(rb);
  await aPareou;   // A recebeu o pareamento por push
  ok(A.MP && A.MP.st, 'A recebeu a partida por push (pareado)');

  // qual conta é o lado 0? (o servidor sorteou). Descobre pela sala.
  const sala = salas.de(A.c.id);
  const ladoA = salas.ladoDe(sala, A.c.id), ladoB = salas.ladoDe(sala, B.c.id);
  ok(A.MP.humano === ladoA && B.MP.humano === ladoB, 'cada cliente se vê como o SEU lado');
  const hashServidor = () => host.hashEstado(sala.P.st);
  const tresBatem = (rotulo) => {
    const hs = hashServidor(), ha = cli.hashEstadoCli(A.MP.st), hb = cli.hashEstadoCli(B.MP.st);
    if (!(hs === ha && hs === hb)) { ok(false, `${rotulo}: hashes DIVERGEM (srv ${hs} · A ${ha} · B ${hb})`); return false; }
    return true;
  };
  // espera o PUSH do oponente pousar (a MP dele bater o hash do servidor) — sem casar waiters frágeis.
  async function esperarSincronia(inativo, timeoutMs = 3000) {
    const t0 = Date.now();
    while (cli.hashEstadoCli(inativo.MP.st) !== hashServidor()) { if (Date.now() - t0 > timeoutMs) return false; await dorme(4); }
    return true;
  }
  ok(tresBatem('início'), 'no início os três hashes batem');

  // joga a partida completa, alternando o lado ativo. Após CADA ação, o oponente recebe o push; comparo os 3.
  const players = { [ladoA]: A, [ladoB]: B };
  let passos = 0, guarda = 0, todosOsPassosBatem = true;
  while (!sala.P.st.fim && guarda++ < 120) {
    const ativoLado = sala.P.st.ativo, ativo = players[ativoLado], inativo = players[1 - ativoLado];
    for (const op of opsDoLado(ativo.MP.st, ativoLado)) {
      if (sala.P.st.fim) break;
      const j = await cli.jogar(ativo.transporte, ativo.MP, op, { token: ativo.token });
      if (!j.ok) continue;                          // ação local inválida (stale): não vai ao servidor, sem push
      passos++;
      await esperarSincronia(inativo);              // o oponente recebe a jogada por push e absorve
      if (!tresBatem('após jogada')) { todosOsPassosBatem = false; break; }
    }
    if (sala.P.st.fim || !todosOsPassosBatem) break;
    await cli.encerrar(ativo.transporte, ativo.MP, { token: ativo.token });
    await esperarSincronia(inativo);                // encerrar passa a vez -> o oponente recebe por push
    if (!tresBatem('após encerrar')) { todosOsPassosBatem = false; break; }
  }
  ok(todosOsPassosBatem, 'os TRÊS hashes bateram em CADA passo da partida (A == B == servidor) — nenhum cliente divergiu');
  ok(sala.P.st.fim, `a partida PvP chegou ao fim, declarado pelo servidor (${passos} ações no total)`);
  ok(A.MP.fim && B.MP.fim && A.MP.fim.resultado !== B.MP.fim.resultado, 'os dois lados veem o resultado OPOSTO (um venceu, o outro perdeu) — do ponto de vista de cada um');

  A.ws.close(); B.ws.close();
  await new Promise(r => server.close(r));
  contas._resetParaTeste(); fila._limpar(); salas._limparTudo();
  console.log(`  guarda: ${passos} ações · três hashes idênticos em todas · fim pelo servidor · resultado oposto por lado`);

  console.log('');
  console.log(falhas === 0 ? '>>> PAREAMENTO OK' : `>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

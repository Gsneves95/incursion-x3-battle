// tests/servidor.test.js — F5.0: a FUNDAÇÃO e a PROVA.
// (1) o MESMO motor roda no servidor (require src/engine.js) e no cliente (o engine EMBUTIDO no dist),
//     e prova estado IDÊNTICO por hash em CADA passo — não só no fim (divergência no meio que se
//     cancela no fim é pior que a visível). Usa a montagem de um Pergaminho (caminho determinístico).
// (2) mede o tamanho do estado serializado (F5.4 reenvia o estado inteiro na reconexão).
// (3) o protocolo é VERSIONADO: versão incompatível = recusa clara, nunca silenciosa.
// (4) o servidor de verdade sobe, abre WebSocket, e devolve o estado autoritativo + hash.
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const WebSocket = require('ws');
const host = require('../server/motor-host.js');
const proto = require('../server/protocol.js');

let falhas = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const prov = require('../data/provacoes/afrodite.json');   // montagem de Pergaminho (carimbada pelo solucionador)

(async () => {
  // ===== (1) PROVA DE ESTADO IDÊNTICO, passo a passo =====
  console.log('== 1. o mesmo motor: servidor (require) == cliente (dist), hash em CADA passo ==');
  // roteiro determinístico gerado UMA vez (motor do servidor); depois REPRODUZIDO nos dois motores
  const ops = host.gerarRoteiro(host.montar(prov), { maxTurnos: 40 });
  const srv = host.reproduzir(() => host.montar(prov), ops);   // estados serializados no MOTOR DO SERVIDOR

  // o MOTOR DO CLIENTE é o engine embutido no dist — carrega em jsdom e reproduz o MESMO roteiro
  const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'incursion.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true });
  const w = dom.window;
  const cli = w.eval('(' + function (prov, ops) {
    const st = montarProvacao(prov);
    const passos = [JSON.stringify(st)];
    for (const op of ops) {
      if (op.tipo === 'fim') fimTurno(st);
      else agir(st, op.uid, op.slot, op.alvos, op.escolhas, op.modo);
      passos.push(JSON.stringify(st));
    }
    return passos;
  }.toString() + ')(' + JSON.stringify(prov) + ',' + JSON.stringify(ops) + ')');
  dom.window.close();

  ok(srv.length === cli.length && srv.length > 1, `mesmo número de passos (srv ${srv.length}, cli ${cli.length})`);
  let divergiu = -1;
  const n = Math.min(srv.length, cli.length);
  for (let i = 0; i < n; i++) {
    if (host.canon(JSON.parse(srv[i])) !== host.canon(JSON.parse(cli[i]))) { divergiu = i; break; }
  }
  ok(divergiu < 0, divergiu < 0 ? '' :
    `DIVERGE no passo ${divergiu}: servidor ${host.hashStr(host.canon(JSON.parse(srv[divergiu])))} != cliente ${host.hashStr(host.canon(JSON.parse(cli[divergiu])))}`);
  const hInit = host.hashStr(host.canon(JSON.parse(srv[0])));
  const hFim = host.hashStr(host.canon(JSON.parse(srv[srv.length - 1])));
  console.log(`  ${srv.length} passos (${ops.length} ações) · montagem ${hInit} · final ${hFim} · IDÊNTICO servidor==cliente em todos`);

  // ===== (2) TAMANHO do estado serializado =====
  console.log('== 2. tamanho do estado (F5.4 reenvia o estado inteiro na reconexão) ==');
  const fim = JSON.parse(srv[srv.length - 1]);
  const comLog = host.tamanhoBytes(fim);
  const semLog = Buffer.byteLength(JSON.stringify(Object.assign({}, fim, { log: [] })), 'utf8');
  ok(semLog < 6 * 1024, `o estado do jogo (sem log) é pequeno: ${(semLog / 1024).toFixed(1)} KB`);
  ok(comLog < 20 * 1024, `o estado com log inteiro cabe folgado numa mensagem: ${(comLog / 1024).toFixed(1)} KB`);
  console.log(`  turno ${fim.turno} · estado ${(semLog / 1024).toFixed(1)} KB + log(${fim.log.length}) = ${(comLog / 1024).toFixed(1)} KB total · reenvio inteiro trivial a ~0,2 msg/s`);

  // ===== (3) PROTOCOLO versionado =====
  console.log('== 3. protocolo versionado: incompatível = recusa clara, nunca silenciosa ==');
  ok(proto.checarVersao({ v: proto.PROTOCOL_VERSION, tipo: 'ola' }).ok, 'a versão atual é aceita');
  const bad = proto.checarVersao({ v: proto.PROTOCOL_VERSION + 1, tipo: 'ola' });
  ok(!bad.ok && bad.codigo === 'versao_incompativel' && /incompat/i.test(bad.erro), 'versão diferente: recusa com motivo claro');
  ok(!proto.checarVersao({ tipo: 'ola' }).ok, 'mensagem SEM versão é recusada (nunca passa silenciosa)');
  console.log(`  servidor v${proto.PROTOCOL_VERSION} · aceita v${proto.PROTOCOL_VERSION} · recusa v${proto.PROTOCOL_VERSION + 1} e sem-versão`);

  // ===== (4) o SERVIDOR de verdade: sobe, WebSocket, estado autoritativo + hash =====
  console.log('== 4. o servidor sobe, abre WebSocket, e devolve o estado autoritativo por hash ==');
  const { server } = require('../server/server.js');
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const ws = new WebSocket('ws://localhost:' + port);
  await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });
  // pergunta/resposta sequencial (a taxa é ~0,2 msg/s; nada de tempo real)
  const pede = (msg) => new Promise((res) => { ws.once('message', (d) => res(JSON.parse(d.toString()))); ws.send(JSON.stringify(msg)); });

  const recusa = await pede({ v: proto.PROTOCOL_VERSION + 1, tipo: 'ola' });
  ok(recusa.tipo === 'recusado' && recusa.codigo === 'versao_incompativel', 'cliente de versão errada é RECUSADO pelo servidor');
  const ola = await pede({ v: proto.PROTOCOL_VERSION, tipo: 'ola' });
  ok(ola.tipo === 'ola' && ola.motor === 'autoritativo', 'handshake ok: o servidor se diz autoritativo');
  const est0 = await pede({ v: proto.PROTOCOL_VERSION, tipo: 'montar', pergaminho: prov });
  ok(est0.tipo === 'estado' && est0.hash === hInit, `a montagem no servidor bate o hash da referência (${est0.hash})`);
  // reproduz as primeiras ações VIA WEBSOCKET e confere que o hash autoritativo bate a referência passo a passo
  let passo = 1, batendo = true;
  for (const op of ops.slice(0, 12)) {
    const msg = op.tipo === 'fim' ? { v: proto.PROTOCOL_VERSION, tipo: 'fim' }
      : { v: proto.PROTOCOL_VERSION, tipo: 'agir', uid: op.uid, slot: op.slot, alvos: op.alvos, escolhas: op.escolhas, modo: op.modo };
    const r = await pede(msg);
    const ref = host.hashStr(host.canon(JSON.parse(srv[passo])));
    if (!(r.tipo === 'estado' && r.hash === ref)) { batendo = false; ok(false, `passo ${passo} via WS: ${r.hash || r.tipo} != referência ${ref}`); break; }
    passo++;
  }
  if (batendo) ok(true, '');
  console.log(`  WS: recusa versão errada · handshake · montar+${passo - 1} ações, hash autoritativo == referência em cada passo`);
  ws.close();
  await new Promise(r => server.close(r));

  console.log('');
  console.log(falhas === 0 ? '>>> SERVIDOR OK' : `>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

// tests/partida.test.js — F5.2: a PARTIDA rodando no SERVIDOR. Prova, por medição:
//  (1) o CONTROLADOR (server/partida.js): uma ação por vez validada, o servidor dirige a IA e é dono
//      do fim; ação inválida recusada com motivo; relógio do servidor (auto-passa; 3 perdidos = abandono).
//  (2) o CLIENTE (src/partida_cliente.js): hash byte-idêntico ao do servidor; interface OTIMISTA que
//      bate sempre (divergiu:false); DIVERGÊNCIA forçada é corrigida pelo servidor e fica VISÍVEL no
//      log; ação recusada pelo servidor é DESFEITA.
//  (3) INTEGRAÇÃO por WebSocket: uma PARTIDA COMPLETA contra o servidor — cada ação validada, o
//      cliente prevê e o servidor confirma (hash bate em cada passo), o SERVIDOR declara o fim; e o
//      relógio do servidor EMPURRA o estouro (auto-passa) sem o cliente pedir.
const WebSocket = require('ws');
const proto = require('../server/protocol.js');
const host = require('../server/motor-host.js');
const contas = require('../server/contas.js');
const partidaCtrl = require('../server/partida.js');
const cli = require('../src/partida_cliente.js');
const prov = require('../data/provacoes/afrodite.json');

let falhas = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };

// o cliente usa o motor por global (como no build); nos testes, injeto do motor-host.
cli.configurarPartida({ agir: host.E.agir, fimTurno: host.E.fimTurno, iaProximaAcao: host.ia.iaProximaAcao });

// política determinística do humano: 1ª ação disponível de cada unidade no 1º alvo válido.
function acoesDoHumano(st, lado) {
  const ops = [];
  for (const u of st.lados[lado].units) {
    if (!host.E.podeAgir(u)) continue;
    const acoes = host.E.acoesDe(st, u).filter(a => a.disponivel);
    if (!acoes.length) continue;
    const a = acoes[0];
    let alvos = [];
    if (a.alvo === 'distribui') { const vs = host.E.alvosValidos(st, u, a, 0, []); if (vs.length) alvos = [vs[0].uid]; }
    else { const n = (a.passos || []).length; let bom = true; for (let p = 0; p < n; p++) { const vs = host.E.alvosValidos(st, u, a, p, alvos); if (!vs.length) { bom = false; break; } alvos.push(vs[0].uid); } if (!bom) continue; }
    ops.push({ uid: u.uid, slot: a.slot, alvos });
  }
  return ops;
}

(async () => {
  // ===== (1) o CONTROLADOR =====
  console.log('== 1. o controlador: ação validada uma por vez, servidor dirige a IA e é dono do fim ==');
  let P = partidaCtrl.criar(prov, { agora: 0 });
  ok(P.st.ativo === P.humano && P.fim === null, 'a partida começa no turno do humano, sem fim declarado');
  // ação de unidade que não é minha / slot inválido: recusa CLARA
  ok(partidaCtrl.agir(P, { uid: P.st.lados[P.cpu].units[0].uid, slot: 'basico', alvos: [] }, { agora: 0 }).codigo === 'unidade_invalida', 'agir com unidade do oponente: recusado');
  ok(partidaCtrl.agir(P, { uid: P.st.lados[P.humano].units[0].uid, slot: 'inexistente', alvos: [] }, { agora: 0 }).codigo === 'acao_invalida', 'agir com slot inválido: recusado com motivo');
  // partida completa dirigida pelo controlador; o FIM só vem do servidor
  let now = 0, guarda = 0, fimVia = null;
  while (!P.fim && guarda++ < 100) {
    for (const op of acoesDoHumano(P.st, P.humano)) { if (P.fim) break; partidaCtrl.agir(P, op, { agora: now }); }
    if (P.fim) { fimVia = 'agir'; break; }
    now += 3000;
    const e = partidaCtrl.encerrarTurno(P, { agora: now });
    ok(e.ok && Array.isArray(e.cpuOps), 'encerrar devolve as ações da IA do oponente (o cliente as desenha)');
    if (P.fim) { fimVia = 'encerrar'; break; }
  }
  ok(P.fim && (P.fim.resultado === 'vitoria' || P.fim.resultado === 'derrota'), `o SERVIDOR declarou o fim (${P.fim && P.fim.resultado}, via ${fimVia})`);
  // agir depois do fim: recusado
  ok(partidaCtrl.agir(P, acoesDoHumano(P.st, P.humano)[0] || { uid: 'x', slot: 'basico' }, { agora: now }).codigo === 'partida_encerrada', 'agir após o fim: recusado');

  // RELÓGIO do servidor: sem agir, o turno passa (auto-passa); 3 turnos perdidos consecutivos = abandono
  let Q = partidaCtrl.criar(prov, { agora: 0, limiteMs: 1000 });
  const e1 = partidaCtrl.estourarTempo(Q, { agora: 2000 });
  ok(e1.autopassou && !e1.abandono && Q.ociosos[0] === 1, 'tempo esgotado sem agir: o turno PASSA (não é morte instantânea)');
  const e2 = partidaCtrl.estourarTempo(Q, { agora: 4000 });
  const e3 = partidaCtrl.estourarTempo(Q, { agora: 6000 });
  ok(e3.abandono && Q.fim && Q.fim.motivo === 'abandono' && Q.fim.resultado === 'derrota', '3 turnos perdidos consecutivos: derrota por ABANDONO (declarada pelo servidor)');
  // turno em que o humano AGIU não conta como perdido
  let R = partidaCtrl.criar(prov, { agora: 0, limiteMs: 1000 });
  partidaCtrl.agir(R, acoesDoHumano(R.st, R.humano)[0], { agora: 100 });
  const eR = partidaCtrl.estourarTempo(R, { agora: 2000 });
  ok(eR.autopassou && R.ociosos[0] === 0, 'turno em que o humano agiu não conta como perdido (anti-idle é justo)');
  console.log(`  controlador: ação validada · fim ${P.fim.resultado} pelo servidor · relógio auto-passa · abandono aos ${partidaCtrl.MAX_ABANDONO}`);

  // ===== (2) o CLIENTE: hash idêntico, otimista bate, divergência corrigida e visível, recusa desfeita =====
  console.log('== 2. o cliente: hash idêntico ao servidor · otimista bate · divergência corrigida e VISÍVEL · recusa desfeita ==');
  // hash byte-idêntico ao do servidor (senão toda comparação mente)
  const stTeste = host.montar(prov);
  ok(cli.hashEstadoCli(stTeste) === host.hashEstado(stTeste), 'o hash do cliente é byte-idêntico ao do servidor (mesmo estado -> mesmo hash)');

  // um transporte-DUBLE que fala com o controlador real (isola a lógica do cliente da rede)
  function transporteControlador() {
    let PP = null;
    return {
      _P: () => PP,
      pedir: async (msg) => {
        if (msg.tipo === 'novaPartida') { PP = partidaCtrl.criar(prov, { agora: Date.now() }); return Object.assign({ v: 1, tipo: 'partida' }, partidaCtrl.estado(PP, Date.now())); }
        if (msg.tipo === 'jogar') { const r = partidaCtrl.agir(PP, { uid: msg.uid, slot: msg.slot, alvos: msg.alvos, escolhas: msg.escolhas, modo: msg.modo }, { agora: Date.now() }); return r.ok ? Object.assign({ v: 1, tipo: 'partida' }, partidaCtrl.estado(PP, Date.now())) : { v: 1, tipo: 'recusado', codigo: r.codigo, erro: r.erro }; }
        if (msg.tipo === 'encerrar') { const r = partidaCtrl.encerrarTurno(PP, { agora: Date.now() }); return Object.assign({ v: 1, tipo: 'partida', cpuOps: r.cpuOps || [] }, partidaCtrl.estado(PP, Date.now())); }
        return { v: 1, tipo: 'erro' };
      },
    };
  }
  const T = transporteControlador();
  let MP = await cli.novaPartida(T, prov, {});
  ok(MP.st && MP.turnoDe === MP.humano && !MP.fim, 'cliente: nova partida desenhável, sem fim (só o servidor decide)');
  // jogar OTIMISTA: como o motor é o mesmo, o servidor confirma e NÃO diverge
  const op0 = acoesDoHumano(MP.st, MP.humano)[0];
  const j0 = await cli.jogar(T, MP, op0, {});
  ok(j0.ok && j0.divergiu === false, 'jogada otimista: o servidor confirma e o hash BATE (divergiu:false)');

  // DIVERGÊNCIA forçada: um servidor-duble que devolve um estado DIFERENTE (hp adulterado) + o hash
  // desse estado. O cliente deve CORRIGIR pelo estado do servidor e LOGAR a divergência (visível).
  function transporteAdultera() {
    return { pedir: async (msg) => {
      if (msg.tipo === 'novaPartida') { const st = host.montar(prov); return Object.assign({ v: 1, tipo: 'partida' }, snapDe(st)); }
      if (msg.tipo === 'jogar') {
        // o servidor "de verdade" aplicaria e devolveria X; aqui devolvo X com um HP trocado (divergência).
        const st = host.montar(prov); host.E.agir(st, msg.uid, msg.slot, msg.alvos || [], null, null);
        st.lados[1].units[0].hp = st.lados[1].units[0].hp - 7;   // adultera: força hash != local
        return Object.assign({ v: 1, tipo: 'partida' }, snapDe(st));
      }
      return { v: 1, tipo: 'erro' };
    } };
  }
  function snapDe(st) { return { estado: JSON.parse(host.serializar(st)), hash: host.hashEstado(st), turnoDe: st.ativo, humano: 0, deadline: 0, agora: 0, restanteMs: 0, fim: null }; }
  const TA = transporteAdultera();
  let MPA = await cli.novaPartida(TA, prov, {});
  const opA = acoesDoHumano(MPA.st, MPA.humano)[0];
  const jA = await cli.jogar(TA, MPA, opA, {});
  ok(jA.ok && jA.divergiu === true, 'divergência detectada (hash local != servidor)');
  const logDiv = (MPA.avisos || []).filter(l => /divergência corrigida pelo servidor/.test(l.msg));
  ok(logDiv.length === 1, 'a divergência é VISÍVEL nos avisos (corrigida pelo servidor) — nunca silenciosa');
  ok(cli.hashEstadoCli(MPA.st) === jA.hashServidor, 'o cliente se CORRIGIU para o estado do servidor (a verdade)');

  // RECUSA: o servidor recusa uma ação que o cliente já aplicou otimista -> DESFAZ + loga
  function transporteRecusa() {
    let PP = null;
    return { pedir: async (msg) => {
      if (msg.tipo === 'novaPartida') { PP = partidaCtrl.criar(prov, { agora: 0 }); return Object.assign({ v: 1, tipo: 'partida' }, partidaCtrl.estado(PP, 0)); }
      if (msg.tipo === 'jogar') return { v: 1, tipo: 'recusado', codigo: 'acao_invalida', erro: 'o servidor disse não' };
      return { v: 1, tipo: 'erro' };
    } };
  }
  const TR = transporteRecusa();
  let MPR = await cli.novaPartida(TR, prov, {});
  const antesHash = cli.hashEstadoCli(MPR.st);
  const opR = acoesDoHumano(MPR.st, MPR.humano)[0];
  const jR = await cli.jogar(TR, MPR, opR, {});
  ok(!jR.ok && jR.recusado, 'ação recusada pelo servidor: o cliente reconhece a recusa');
  ok(cli.hashEstadoCli(MPR.st) === antesHash, 'a ação otimista foi DESFEITA (estado voltou ao de antes)');
  ok((MPR.avisos || []).some(l => /recusada pelo servidor/.test(l.msg)), 'a recusa fica VISÍVEL nos avisos');
  console.log('  cliente: hash idêntico · otimista bate · divergência corrigida+visível · recusa desfeita');

  // ===== (3) INTEGRAÇÃO por WebSocket: partida completa contra o servidor + relógio que empurra =====
  console.log('== 3. integração WS: partida COMPLETA contra o servidor (hash bate em cada passo) + push do relógio ==');
  contas._resetParaTeste();
  const { server } = require('../server/server.js');
  await new Promise(r => server.listen(0, r));
  const porta = server.address().port;
  const ws = new WebSocket('ws://localhost:' + porta);
  await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });
  const V = proto.PROTOCOL_VERSION;
  // fila de resposta + captador de PUSH (mensagem 'partida' com push:true)
  const respFila = []; let pushRecebido = null;
  ws.on('message', (d) => { const m = JSON.parse(d.toString()); if (m.push) { pushRecebido = m; return; } const cb = respFila.shift(); if (cb) cb(m); });
  const transWS = { pedir: (msg) => new Promise((res) => { respFila.push(res); ws.send(JSON.stringify(msg)); }) };

  const cr = await new Promise((res) => { respFila.push(res); ws.send(JSON.stringify({ v: V, tipo: 'criarConta', faixaIdade: 'maior' })); });
  const token = cr.token;
  ok(cr.tipo === 'conta' && token, 'conta criada para autenticar a partida');

  let W = await cli.novaPartida(transWS, prov, { token });
  ok(W.st && !W.fim, 'nova partida via WS, sem fim declarado');
  let passos = 0, divergencias = 0, gg = 0, fimServidor = false;
  while (!W.fim && gg++ < 100) {
    for (const op of acoesDoHumano(W.st, W.humano)) {
      if (W.fim) break;
      const j = await cli.jogar(transWS, W, op, { token });
      if (j.ok) { passos++; if (j.divergiu) divergencias++; }
      if (W.fim) break;
    }
    if (W.fim) { fimServidor = true; break; }
    const e = await cli.encerrar(transWS, W, { token });
    if (e.divergiu) divergencias++;
    if (W.fim) { fimServidor = true; break; }
  }
  ok(fimServidor && W.fim, `partida COMPLETA: o servidor declarou ${W.fim && W.fim.resultado} após ${passos} ações do humano`);
  ok(divergencias === 0, `interface otimista: o cliente previu e o servidor confirmou em CADA passo (0 divergências reais)`);

  // RELÓGIO do servidor por WS: nova partida com limite curto, sem agir -> o servidor EMPURRA o estouro
  const W2 = await cli.novaPartida(transWS, prov, { token, limiteMs: 300 });
  ok(W2 && !W2.fim, 'nova partida com relógio curto');
  await new Promise(r => setTimeout(r, 700));   // espera o relógio do SERVIDOR disparar sozinho
  ok(pushRecebido && pushRecebido.tipo === 'partida' && pushRecebido.push && pushRecebido.autopassou, 'o servidor EMPURROU o estouro do relógio (turno passou) sem o cliente pedir');
  cli.aplicarPush(W2, pushRecebido);
  ok((W2.avisos || []).some(l => /tempo esgotado/.test(l.msg)), 'o estouro do relógio fica VISÍVEL nos avisos do cliente');

  ws.close();
  await new Promise(r => server.close(r));
  contas._resetParaTeste();
  console.log(`  WS: partida completa (${passos} ações, 0 divergências, fim ${W.fim.resultado} pelo servidor) · relógio do servidor empurrou o estouro`);

  console.log('');
  console.log(falhas === 0 ? '>>> PARTIDA OK' : `>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

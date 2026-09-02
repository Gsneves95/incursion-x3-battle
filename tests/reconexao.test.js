// tests/reconexao.test.js — F5.4: RECONEXÃO. A partida pertence à CONTA, não à conexão. Prova, por
// medição, as quatro garantias e a GUARDA:
//  (1) a partida vive na conta (server/salas.js): cai a conexão, a partida (e o relógio) seguem; uma
//      conexão nova com o MESMO token retoma o ESTADO INTEIRO.
//  (2) o RELÓGIO NÃO PARA: o tempo corre na ausência; 3 turnos ociosos = abandono, declarado pelo
//      servidor mesmo com NINGUÉM conectado.
//  (3) a RETOMADA é LEITURA PURA: não muda o estado, não zera o relógio, não avança turno.
//  (4) GUARDA (a prova central): reconectar NUNCA dá vantagem — cair-e-voltar produz EXATAMENTE o
//      mesmo estado que ficar (equivalência por hash). Não há caminho em que sair seja melhor.
//  (5) o estado que volta é o INTEIRO (~11 KB, medido na F5.0), sem delta nem replay.
const WebSocket = require('ws');
const proto = require('../server/protocol.js');
const host = require('../server/motor-host.js');
const contas = require('../server/contas.js');
const partidaCtrl = require('../server/partida.js');
const salas = require('../server/salas.js');
const prov = require('../data/provacoes/afrodite.json');

let falhas = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const hash = (P) => host.hashEstado(P.st);
const fakeWs = () => ({ readyState: 1, enviados: [], send(s) { this.enviados.push(s); } });
const dorme = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  // ===== (1) a partida vive na CONTA; a retomada é LEITURA PURA (não muda nada) =====
  console.log('== 1. a partida vive na conta · a conexão cai e ela segue · a retomada é leitura pura ==');
  salas._limparTudo();
  const sala = salas.criar('conta-A', prov, { limiteMs: 60000, ws: fakeWs() });
  const hAntes = hash(sala.P), deadAntes = sala.P.deadline, perdAntes = sala.P.turnosPerdidos, turnoAntes = sala.P.st.turno;

  // a conexão cai — a sala CONTINUA existindo (a partida é da conta, não do socket)
  salas.desanexar('conta-A', sala.ws);
  ok(salas.existe('conta-A'), 'a conexão caiu, mas a partida da conta CONTINUA no servidor');
  ok(sala.P.deadline === deadAntes, 'cair NÃO mexe no relógio (deadline intacto)');

  // uma conexão nova retoma: LEITURA PURA — anexa e devolve o estado, sem tocar em nada
  const ws2 = fakeWs();
  salas.anexar('conta-A', ws2);
  const snap = salas.snapshot(sala, { retomada: true });
  ok(hash(sala.P) === hAntes, 'retomar NÃO muda o estado (hash idêntico ao de antes)');
  ok(sala.P.deadline === deadAntes, 'retomar NÃO zera o relógio (deadline idêntico)');
  ok(sala.P.turnosPerdidos === perdAntes && sala.P.st.turno === turnoAntes, 'retomar NÃO avança turno nem conta ausência como abandono');
  ok(snap.estado && snap.hash === hAntes && snap.turnoDe === sala.P.st.ativo, 'a retomada devolve o ESTADO INTEIRO autoritativo + hash');
  console.log(`  partida na conta · cai e segue · retomar é leitura pura (hash ${hAntes} antes==depois, deadline intacto)`);

  // ===== (2) o RELÓGIO NÃO PARA — corre na ausência, e o abandono dispara sem ninguém conectado =====
  console.log('== 2. o relógio corre na AUSÊNCIA (sem conexão): turno passa, e 3 ociosos = abandono ==');
  salas._limparTudo();
  // sem ws desde o início (ninguém "olhando"): o relógio ainda tem de correr
  const salaB = salas.criar('conta-B', prov, { limiteMs: 220 });
  salas.desanexar('conta-B', salaB.ws);   // garante socket ausente
  const turnoInic = salaB.P.st.turno;
  await dorme(300);   // > 1 janela: um turno DEVE ter passado sozinho
  ok(salaB.P.turnosPerdidos >= 1, 'o relógio correu SEM ninguém conectado (turno perdido na ausência)');
  await dorme(520);   // + 2 janelas: chega aos 3 ociosos
  ok(salaB.P.fim && salaB.P.fim.motivo === 'abandono' && salaB.P.fim.resultado === 'derrota', 'abandono por ociosidade DECLARADO pelo servidor, mesmo desconectado');
  salas.pararRelogio('conta-B');
  console.log(`  ausente: turno passou sozinho · 3 ociosos → abandono (derrota) sem conexão · o relógio é do servidor`);

  // ===== (3+4) GUARDA: FICAR == CAIR-E-VOLTAR. Reconectar não dá vantagem (equivalência por hash) =====
  console.log('== 3. GUARDA: ficar conectado == cair-e-voltar — mesmo estado por hash (nenhuma vantagem) ==');
  // controlador puro (tempo por parâmetro, determinístico): a evolução da partida NÃO olha para a
  // conexão — estourarTempo(P, {agora}) nunca recebe o socket. Duas partidas idênticas, as MESMAS
  // chamadas de relógio: quem "ficou" e quem "caiu e voltou" terminam byte-a-byte iguais.
  const Pfica = partidaCtrl.criar(prov, { agora: 0, limiteMs: 1000 });
  const Pcai  = partidaCtrl.criar(prov, { agora: 0, limiteMs: 1000 });
  for (let k = 1; k <= 2; k++) {   // dois turnos ociosos, nos mesmos instantes
    partidaCtrl.estourarTempo(Pfica, { agora: k * 1001 });
    partidaCtrl.estourarTempo(Pcai,  { agora: k * 1001 });   // "caiu": nenhuma diferença — o socket não entra na conta
  }
  ok(hash(Pfica) === hash(Pcai), 'cair-e-voltar produz o MESMO estado que ficar (hash idêntico) — zero vantagem');
  ok(Pfica.turnosPerdidos === Pcai.turnosPerdidos && Pfica.deadline === Pcai.deadline, 'mesmo relógio e mesma contagem de abandono nos dois');

  // e no REGISTRO real (timers de verdade): uma sala com socket, outra sem — após a MESMA janela, iguais
  salas._limparTudo();
  const sConn = salas.criar('c-conn', prov, { limiteMs: 240, ws: fakeWs() });   // "ficou" (socket vivo)
  const sDrop = salas.criar('c-drop', prov, { limiteMs: 240, ws: fakeWs() });
  const wsConn = sConn.ws, wsDrop = sDrop.ws;
  salas.desanexar('c-drop', sDrop.ws);                                          // "caiu" (socket ausente)
  await dorme(320);   // uma janela passa para as duas
  ok(hash(sConn.P) === hash(sDrop.P), 'no registro real: sala conectada e sala caída evoluem IDÊNTICAS');
  ok(sConn.P.turnosPerdidos === 1 && sDrop.P.turnosPerdidos === 1, 'o turno perdido conta igual, conectado ou não');
  ok(wsConn.enviados.length >= 1 && wsDrop.enviados.length === 0, 'só a sala CONECTADA recebeu push; a caída guarda o estado para o retorno (mas evoluiu igual)');
  salas.pararRelogio('c-conn'); salas.pararRelogio('c-drop');
  console.log(`  ficar==cair (controlador e registro): hash idêntico, mesmo relógio, mesmo abandono · reconectar não adianta nada`);

  // ===== (5) INTEGRAÇÃO por WebSocket: reconexão real de ponta a ponta, e o tamanho do reenvio =====
  console.log('== 4. WebSocket: cai a conexão, reabre com o token, RETOMA o estado inteiro (~11 KB) ==');
  salas._limparTudo(); contas._resetParaTeste();
  const { server } = require('../server/server.js');
  await new Promise(r => server.listen(0, r));
  const porta = server.address().port;
  const V = proto.PROTOCOL_VERSION;
  const abrir = async () => { const w = new WebSocket('ws://localhost:' + porta); await new Promise((res, rej) => { w.on('open', res); w.on('error', rej); }); return w; };
  const pedeEm = (w, msg) => new Promise((res) => { w.once('message', (d) => res(JSON.parse(d.toString()))); w.send(JSON.stringify(msg)); });

  // conta + partida na conexão 1
  const w1 = await abrir();
  const conta = await pedeEm(w1, { v: V, tipo: 'criarConta', faixaIdade: 'maior' });
  const token = conta.token;
  const p1 = await pedeEm(w1, { v: V, tipo: 'novaPartida', pergaminhoKey: 'afrodite', token });
  ok(p1.tipo === 'partida' && !p1.fim, 'conexão 1: partida iniciada');
  const hashInicial = p1.hash, deadlineInicial = p1.deadline;

  // a conexão 1 CAI (troca de app no Android)
  w1.close(); await dorme(60);

  // conexão 2 com o MESMO token: RETOMA
  const w2 = await abrir();
  const rt = await pedeEm(w2, { v: V, tipo: 'retomar', token });
  ok(rt.tipo === 'partida' && rt.retomada === true, 'conexão 2 (mesmo token): RETOMA a partida em curso');
  ok(rt.hash === hashInicial, 'a retomada devolve o MESMO estado (nada se perdeu, nada mudou)');
  ok(rt.deadline === deadlineInicial, 'o relógio NÃO foi zerado ao reconectar (deadline idêntico) — sem vantagem');
  ok(rt.restanteMs <= p1.restanteMs, 'o tempo restante só DIMINUIU (o relógio correu durante a queda)');
  const bytes = Buffer.byteLength(JSON.stringify(rt.estado), 'utf8');
  ok(bytes < 20 * 1024, `o estado inteiro que volta é pequeno: ${(bytes / 1024).toFixed(1)} KB (sem delta, sem replay)`);

  // a retomada permite AGIR (a partida continua de onde parou)
  const opsHumano = [];
  for (const u of rt.estado.lados[0].units) {
    if (!host.E.podeAgir(u)) continue;
    const acoes = host.E.acoesDe(rt.estado, u).filter(a => a.disponivel); if (!acoes.length) continue;
    opsHumano.push({ uid: u.uid, slot: acoes[0].slot }); break;
  }
  if (opsHumano.length) {
    const jog = await pedeEm(w2, { v: V, tipo: 'jogar', uid: opsHumano[0].uid, slot: opsHumano[0].slot, alvos: [], token });
    ok(jog.tipo === 'partida' || jog.tipo === 'recusado', 'depois de retomar, a partida SEGUE jogável na conexão nova');
  }

  // conexão 2 cai e o relógio curto leva ao ABANDONO na ausência; conexão 3 vê o forfeit
  const p3 = await pedeEm(w2, { v: V, tipo: 'novaPartida', pergaminhoKey: 'afrodite', token, limiteMs: 220 });
  ok(p3.tipo === 'partida', 'nova partida com relógio curto para exercitar o abandono na ausência');
  w2.close();
  await dorme(900);   // 3+ janelas sem ninguém conectado
  const w3 = await abrir();
  const rt3 = await pedeEm(w3, { v: V, tipo: 'retomar', token });
  ok(rt3.tipo === 'partida' && rt3.fim && rt3.fim.motivo === 'abandono', 'conexão 3: a partida foi PERDIDA por abandono enquanto ninguém estava conectado (o servidor decidiu)');
  w3.close();
  await new Promise(r => server.close(r));
  salas._limparTudo(); contas._resetParaTeste();
  console.log(`  WS: cai → retoma o estado inteiro (${(bytes / 1024).toFixed(1)} KB), relógio não zera, tempo só diminuiu · abandono na ausência visto na volta`);

  console.log('');
  console.log(falhas === 0 ? '>>> RECONEXÃO OK' : `>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

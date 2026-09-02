// tests/ranqueado.test.js — F5.5: RANQUEADO. Pontos, faixas, temporadas. Prova, por medição, e com o
// rigor da equivalência da F5.4: onde trapacear poderia compensar, PROVA que não existe o caminho.
//  (1) PONTOS/FAIXAS são do SERVIDOR: o cliente nunca soma ponto nem declara faixa.
//  (2) FILA CIENTE DE FAIXA: pareia pontos próximos; a janela ABRE com a espera; o Semideus solitário
//      acaba pareado (janela sem teto), não espera para sempre.
//  (3) ABANDONO custa como DERROTA, e o exploit ("sair da partida perdida") está FECHADO — abandonar
//      nunca é melhor que perder jogando.
//  (4) A GUARDA: nenhum caminho onde o cliente influencie ponto — mensagem forjada, desconexão, ou
//      partida que não terminou.
//  (5) TEMPORADA: reinício suave (ninguém a zero; faixa alta desce mais) + recompensa COSMÉTICA (não moeda).
//  (6) RATIO no perfil: exibido, não classifica.
const WebSocket = require('ws');
const proto = require('../server/protocol.js');
const host = require('../server/motor-host.js');
const contas = require('../server/contas.js');
const salas = require('../server/salas.js');
const fila = require('../server/fila.js');
const RANQ = require('../data/ranqueado.json');

let falhas = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const V = proto.PROTOCOL_VERSION;
const fakeWs = () => ({ readyState: 1, enviados: [], send(s) { this.enviados.push(s); } });
const dorme = (ms) => new Promise(r => setTimeout(r, ms));
const TIME_A = ['zeus', 'ogum', 'tyr'], TIME_B = ['sobek', 'brigid', 'ganesha'];
function opsDoLado(st, lado) { const o = []; for (const u of st.lados[lado].units) { if (!host.E.podeAgir(u)) continue; const as = host.E.acoesDe(st, u).filter(a => a.disponivel); if (!as.length) continue; const a = as[0]; let al = []; if (a.alvo === 'distribui') { const vs = host.E.alvosValidos(st, u, a, 0, []); if (vs.length) al = [vs[0].uid]; } else { const n = (a.passos || []).length; let bom = true; for (let p = 0; p < n; p++) { const vs = host.E.alvosValidos(st, u, a, p, al); if (!vs.length) { bom = false; break; } al.push(vs[0].uid); } if (!bom) continue; } o.push({ uid: u.uid, slot: a.slot, alvos: al }); } return o; }

(async () => {
  // ===== (1/3/5/6) sem rede: pontos, faixas, abandono, temporada, ratio =====
  console.log('== 1. pontos/faixas do servidor · abandono = derrota · temporada suave · ratio ==');
  contas._resetParaTeste(); fila._limpar(); salas._limparTudo();
  ok(contas.faixaDe(0).chave === RANQ.faixas[0].chave && contas.faixaDe(9999).chave === RANQ.faixas[RANQ.faixas.length - 1].chave, 'faixaDe: 0 -> primeira faixa, muito alto -> última');
  const a = contas.criar({ faixaIdade: 'maior' }).conta, b = contas.criar({ faixaIdade: 'maior' }).conta;
  const r = contas.aplicarResultadoRanqueado(a.id, b.id, 'normal');
  ok(r.vencedor.pontos === RANQ.pontos.vitoria && r.vencedor.subiu !== undefined, `vitória credita ${RANQ.pontos.vitoria} pontos (servidor)`);
  ok(r.perdedor.pontos === Math.max(RANQ.pontos.piso, RANQ.pontos.derrota), 'derrota debita, mas nunca abaixo do PISO (Suplicante 0 não fica negativo)');

  // ABANDONO = DERROTA: mesmo delta. Exploit fechado (ver abaixo, prova de dominância).
  contas._setPontos(b.token, 300);   // b com pontos para perder de verdade
  const antesB = contas._contaPorId(b.id).ranque.pontos;
  const rab = contas.aplicarResultadoRanqueado(a.id, b.id, 'abandono');
  ok((rab.perdedor.pontos - antesB) === RANQ.pontos.derrota, 'ABANDONO aplica exatamente o delta de DERROTA (não custa menos)');

  // PROVA DE DOMINÂNCIA (o exploit): abandonar dá a derrota COM CERTEZA; jogar até o fim dá, no melhor
  // caso, a VITÓRIA. delta(vitória) > delta(derrota), então abandonar nunca é melhor que jogar — é
  // estritamente pior ou igual. Não existe caminho onde sair da partida perdida ganhe ponto.
  ok(RANQ.pontos.vitoria > RANQ.pontos.derrota, 'delta(vitória) > delta(derrota): jogar até o fim DOMINA abandonar (o exploit não existe)');

  // TEMPORADA: reinício suave — faixa alta desce MAIS (absoluto), ninguém a zero; cosmético, não moeda.
  contas._resetParaTeste();
  const alto = contas.criar({ faixaIdade: 'maior' }).conta, baixo = contas.criar({ faixaIdade: 'maior' }).conta;
  contas._setPontos(alto.token, 800); contas._setPontos(baixo.token, 100);
  const gemaAntes = contas._contaPorId(alto.id).perfil.moedas.gema;
  contas.reiniciarTemporada();
  const rAlto = contas._contaPorId(alto.id).ranque, rBaixo = contas._contaPorId(baixo.id).ranque;
  ok(rAlto.pontos === Math.round(800 * RANQ.temporada.compressao) && rBaixo.pontos === Math.round(100 * RANQ.temporada.compressao), 'reinício suave: pontosNovos = pontosVelhos * compressão');
  ok((800 - rAlto.pontos) > (100 - rBaixo.pontos), 'a faixa ALTA desce MAIS em pontos absolutos');
  ok(rAlto.pontos > 0 && rBaixo.pontos > 0, 'NINGUÉM volta a zero (quem tinha pontos guarda parte)');
  ok(rAlto.cosmeticos.length === 1 && rAlto.cosmeticos[0].faixa && contas._contaPorId(alto.id).perfil.moedas.gema === gemaAntes, 'recompensa de fim de temporada é COSMÉTICO da faixa — a moeda (gema) NÃO mudou');
  ok(rAlto.temporada === 2, 'a temporada avançou');

  // RATIO exibido (não classifica): projeção pública traz vitórias/derrotas + fração.
  const pub = contas.publica(contas._contaPorId(alto.id));
  ok(pub.ranque.ratio && typeof pub.ranque.ratio.vitorias === 'number' && typeof pub.ranque.ratio.derrotas === 'number', 'o perfil competitivo EXIBE o ratio (vitórias/derrotas)');
  ok(pub.ranque.faixa && pub.ranque.pontos !== undefined, 'quem classifica é o PONTO/FAIXA (o ratio é só estatística ao lado)');
  console.log('  pontos/faixas do servidor · abandono=derrota (dominado por jogar) · temporada suave · cosmético não-moeda · ratio exibido');

  // ===== (2) FILA CIENTE DE FAIXA: janela que abre, e o Semideus solitário =====
  console.log('== 2. fila por faixa: pareia próximos · a janela abre com a espera · o Semideus solitário acaba pareado ==');
  contas._resetParaTeste(); fila._limpar(); salas._limparTudo();
  const janela0 = fila._janela(0), janela10s = fila._janela(10000);
  ok(janela0 === RANQ.fila.janelaBase && janela10s > janela0, `janela(0)=${janela0} e cresce com a espera (janela(10s)=${janela10s})`);

  // dois PRÓXIMOS (Δ pequeno) pareiam na hora
  function jog(nick, pts, time) { const c = contas.criar({ faixaIdade: 'maior' }).conta; contas.definirNick(c.token, nick); contas._setPontos(c.token, pts); return { c, token: c.token, ws: fakeWs(), time }; }
  const p1 = jog('Perto1', 150, TIME_A), p2 = jog('Perto2', 170, TIME_B);
  ok(fila.entrarRanqueada(p1.ws, p1.token, p1.time, 0).estado === 'na_fila', 'o 1º próximo entra e espera');
  ok(fila.entrarRanqueada(p2.ws, p2.token, p2.time, 100).estado === 'pareado', 'o 2º próximo (Δ20) PAREIA na hora (dentro da janela base)');

  // dois DISTANTES: NÃO pareiam na hora; pareiam quando a janela abre (tick com tempo avançado)
  fila._limpar(); salas._limparTudo();
  const semideus = jog('SemideusSo', 800, TIME_A), suplicante = jog('SuplicanteSo', 0, TIME_B);
  ok(fila.entrarRanqueada(semideus.ws, semideus.token, semideus.time, 0).estado === 'na_fila', 'Semideus entra sozinho (às 3h)');
  ok(fila.entrarRanqueada(suplicante.ws, suplicante.token, suplicante.time, 500).estado === 'na_fila', 'Suplicante entra: Δ800 > janela ainda -> os dois esperam (não força par ruim cedo)');
  // avança o tempo: a janela do Semideus (esperando desde 0) abre até cobrir 800 -> o tick pareia
  const tCobre = 0 + (800 - RANQ.fila.janelaBase) / RANQ.fila.janelaPorSegundo * 1000 + 1000;
  fila._rodarTickTeste(tCobre);
  ok(salas.existe(semideus.c.id) && salas.existe(suplicante.c.id), 'a janela abriu até cobrir a distância: o Semideus solitário PAREOU (não espera para sempre)');
  ok(semideus.ws.enviados.length >= 1 && suplicante.ws.enviados.length >= 1, 'os dois receberam a partida por push (o tick pareou, ninguém pediu na hora)');
  salas._limparTudo(); fila._limpar();
  console.log(`  janela(0)=${janela0} abre com a espera · próximos pareiam já · o Semideus solitário pareia quando a janela cobre (não espera pra sempre)`);

  // ===== (3/4) WS: partida ranqueada de verdade, ponto no fim, e a GUARDA (cliente não influencia) =====
  console.log('== 3. WS: partida ranqueada credita ponto no FIM (servidor) · cliente NÃO influencia (forja/desconexão/inacabada) ==');
  contas._resetParaTeste(); fila._limpar(); salas._limparTudo();
  const { server } = require('../server/server.js');
  await new Promise(r => server.listen(0, r));
  const porta = server.address().port;
  async function jogadorWS(nick, time) {
    const c = contas.criar({ faixaIdade: 'maior' }).conta; contas.definirNick(c.token, nick);
    const ws = new WebSocket('ws://localhost:' + porta); await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });
    const J = { c, token: c.token, ws, MP: null, _pend: [] };
    ws.on('message', (d) => { const m = JSON.parse(d.toString()); if (m.push) { if (m.tipo === 'partida') { if (!J.MP) J.MP = { st: null }; J.MP.st = m.estado; J.MP.humano = m.humano; J.MP.fim = m.fim; if (m.ranqueadoResultado) J.ultimoResultado = m.ranqueadoResultado; } return; } const cb = J._pend.shift(); if (cb) cb(m); });
    J.pedir = (msg) => new Promise((res) => { J._pend.push(res); ws.send(JSON.stringify(msg)); });
    return J;
  }
  const A = await jogadorWS('RankA', TIME_A), B = await jogadorWS('RankB', TIME_B);
  const pontosDe = (id) => contas._contaPorId(id).ranque.pontos;
  const pAntes = pontosDe(A.c.id), pAntesB = pontosDe(B.c.id);

  // GUARDA (partida inacabada): antes de qualquer fim, nenhum ponto mudou.
  const ra = await A.pedir({ v: V, tipo: 'entrarFilaRanqueada', time: TIME_A, token: A.token });
  const rb = await B.pedir({ v: V, tipo: 'entrarFilaRanqueada', time: TIME_B, token: B.token });
  ok(ra.tipo === 'naFila' && rb.tipo === 'partida' && rb.ranqueado, 'pareamento ranqueado por WS');
  A.MP = { st: rb.estado ? null : null };   // A recebeu por push
  await dorme(50);
  ok(pontosDe(A.c.id) === pAntes && pontosDe(B.c.id) === pAntesB, 'GUARDA: partida em curso (não terminou) NÃO credita ponto nenhum');

  // GUARDA (mensagem forjada): mandar um campo `pontos`/`ranque` forjado num `jogar` não muda nada.
  const sala = salas.de(A.c.id);
  const ladoA = salas.ladoDe(sala, A.c.id), ladoB = salas.ladoDe(sala, B.c.id);
  const players = { [ladoA]: A, [ladoB]: B };
  const ativoLado0 = sala.P.st.ativo;
  const forja = await players[ativoLado0].pedir({ v: V, tipo: 'jogar', uid: sala.P.st.lados[ativoLado0].units[0].uid, slot: 'defesa', alvos: [], pontos: 999999, ranque: { pontos: 999999 }, token: players[ativoLado0].token });
  ok(forja.tipo === 'partida', 'a jogada com campos forjados é aceita como jogada…');
  ok(pontosDe(A.c.id) === pAntes && pontosDe(B.c.id) === pAntesB, '…mas os campos forjados (pontos/ranque) são IGNORADOS — nada de ponto (só o fim credita)');

  // joga a partida ranqueada até o fim, alternando o lado ativo (política determinística).
  let guarda = 0;
  while (!sala.P.st.fim && guarda++ < 120) {
    const ativoLado = sala.P.st.ativo, ativo = players[ativoLado];
    for (const op of opsDoLado(sala.P.st, ativoLado)) { if (sala.P.st.fim) break; await ativo.pedir({ v: V, tipo: 'jogar', uid: op.uid, slot: op.slot, alvos: op.alvos, token: ativo.token }); }
    if (sala.P.st.fim) break;
    await ativo.pedir({ v: V, tipo: 'encerrar', token: ativo.token });
  }
  ok(sala.P.st.fim, 'a partida ranqueada terminou (pelo servidor)');
  const venc = sala.P.st.fim.lado, idVenc = sala.participantes[venc].contaId, idPerd = sala.participantes[1 - venc].contaId;
  ok(pontosDe(idVenc) > (idVenc === A.c.id ? pAntes : pAntesB), 'o VENCEDOR ganhou pontos (creditados pelo servidor no fim)');
  ok(contas._contaPorId(idVenc).ranque.vitorias === 1 && contas._contaPorId(idPerd).ranque.derrotas === 1, 'o ratio (vitórias/derrotas) foi atualizado nos dois');

  // GUARDA (idempotência): a partida já pontuou — não há como pontuar de novo.
  const sala2 = salas.de(idVenc);
  const rep = salas.talvezPontuar(sala2);
  ok(rep === null, 'GUARDA: pontuar de novo a mesma partida NÃO faz nada (idempotente)');

  // GUARDA (desconexão): quem CAI perde por abandono (§223) — desconectar não dá ponto nem evita a derrota.
  contas._resetParaTeste(); fila._limpar(); salas._limparTudo();
  const C = await jogadorWS('CaiC', TIME_A), D = await jogadorWS('FicaD', TIME_B);
  // pareia com relógio curto para o abandono disparar rápido
  contas._setPontos(C.token, 300); contas._setPontos(D.token, 300);   // ambos com pontos para perder de verdade
  const salaCD = salas.criarPvP({ contaId: C.c.id, ws: C.ws, time: TIME_A }, { contaId: D.c.id, ws: D.ws, time: TIME_B }, { seed: 1, comeca: 0, ranqueado: true, limiteMs: 150 });
  const pC = pontosDe(C.c.id), pD = pontosDe(D.c.id);
  // o lado que ABRE (st.ativo) desconecta e nunca age. Em PvP os dois estão ociosos, mas quem ABRE
  // acumula ociosidade primeiro -> é o primeiro a bater 3 -> derrota por abandono.
  const abre = salaCD.P.st.ativo;
  const quemCai = abre === salas.ladoDe(salaCD, C.c.id) ? C : D;
  quemCai.ws.close();
  for (let i = 0; i < 30 && !salaCD.P.st.fim; i++) await dorme(100);   // espera o relógio correr (≈5 janelas de 150ms)
  ok(salaCD.P.st.fim && salaCD.P.st.fim.motivo === 'abandono', 'quem caiu foi derrotado por ABANDONO (o relógio correu na ausência, §224)');
  ok(salaCD.pontuado, 'a partida ranqueada foi pontuada no abandono (pelo servidor, sem ninguém pedir)');
  const caiu = quemCai.c.id, ficou = quemCai === C ? D.c.id : C.c.id;
  ok(pontosDe(caiu) < (caiu === C.c.id ? pC : pD) && pontosDe(ficou) > (ficou === C.c.id ? pC : pD), 'GUARDA: desconectar PERDE pontos (abandono=derrota) e o outro GANHA — cair não evita nem melhora nada');

  try { A.ws.close(); B.ws.close(); D.ws.close(); } catch (e) {}
  salas._limparTudo(); fila._limpar();
  await new Promise(r => server.close(r));
  contas._resetParaTeste(); fila._limpar(); salas._limparTudo();
  console.log('  WS: ponto no fim pelo servidor · forja ignorada · inacabada não credita · idempotente · desconexão = derrota por abandono');

  console.log('');
  console.log(falhas === 0 ? '>>> RANQUEADO OK' : `>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

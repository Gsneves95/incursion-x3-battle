// tests/telemetria.test.js — F5 (§22): TELEMETRIA. Prova, por medição:
//  (1) mede o que a lista pede, e NADA além: vitória/uso por deus, uso por slot (nunca-usadas),
//      duração, abandono.
//  (2) NADA identifica o jogador — nem a conta anônima entra (LGPD por desenho, §221).
//  (3) AGREGADO, não evento: contadores, não fluxo de ação.
//  (4) há um JEITO DE LER (relatorio) — inclusive a lista de nunca-usadas (o elo Fase 4).
//  (5) só PvP (a partida contra a IA não conta) e o abandono é contado.
const WebSocket = require('ws');
const proto = require('../server/protocol.js');
const host = require('../server/motor-host.js');
const contas = require('../server/contas.js');
const salas = require('../server/salas.js');
const telemetria = require('../server/telemetria.js');

let falhas = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const V = proto.PROTOCOL_VERSION;
const dorme = (ms) => new Promise(r => setTimeout(r, ms));
const TIME_A = ['zeus', 'ogum', 'tyr'], TIME_B = ['sobek', 'brigid', 'ganesha'];
function opsDoLado(st, lado) { const o = []; for (const u of st.lados[lado].units) { if (!host.E.podeAgir(u)) continue; const as = host.E.acoesDe(st, u).filter(a => a.disponivel); if (!as.length) continue; const a = as[0]; let al = []; if (a.alvo === 'distribui') { const vs = host.E.alvosValidos(st, u, a, 0, []); if (vs.length) al = [vs[0].uid]; } else { const n = (a.passos || []).length; let bom = true; for (let p = 0; p < n; p++) { const vs = host.E.alvosValidos(st, u, a, p, al); if (!vs.length) { bom = false; break; } al.push(vs[0].uid); } if (!bom) continue; } o.push({ uid: u.uid, slot: a.slot, alvos: al }); } return o; }

(async () => {
  // ===== (1) mede o que a lista pede · (4) o relatório lê · nunca-usadas =====
  console.log('== 1. os contadores medem: vitória/uso por deus, uso por slot (nunca-usadas), duração, abandono ==');
  telemetria._reset();
  // 3 partidas: zeus vence 2 de 2 que jogou; sobek perde as 2; brigid joga 1 e vence
  telemetria.partida({ time0: ['zeus', 'ogum', 'tyr'], time1: ['sobek', 'brigid', 'ganesha'], vencedor: 0, turnos: 8, abandono: false });
  telemetria.partida({ time0: ['zeus', 'ogum', 'tyr'], time1: ['sobek', 'cuca', 'fujin'], vencedor: 0, turnos: 12, abandono: false });
  telemetria.partida({ time0: ['sobek', 'brigid', 'ganesha'], time1: ['nezha', 'cuca', 'fujin'], vencedor: 0, turnos: 40, abandono: true });
  telemetria.acao('zeus', 'basico'); telemetria.acao('zeus', 'basico'); telemetria.acao('zeus', 'habilidade');
  telemetria.acao('ogum', 'milagre');

  const cat = [
    { key: 'zeus', ab: [{ slot: 'basico', nome: 'Raio' }, { slot: 'habilidade', nome: 'Tempestade' }, { slot: 'milagre', nome: 'Olimpo' }] },
    { key: 'ogum', ab: [{ slot: 'basico', nome: 'Lâmina' }, { slot: 'habilidade', nome: 'Forja' }, { slot: 'milagre', nome: 'Guerra' }] },
  ];
  const r = telemetria.relatorio(cat);
  ok(r.partidas === 3, 'conta as partidas');
  ok(r.taxaAbandono === +(1 / 3).toFixed(3) && r.abandonos === 1, 'conta o abandono (1 de 3)');
  ok(r.duracaoMedia === +((8 + 12 + 40) / 3).toFixed(1), 'duração média em turnos');
  ok(r.duracao['06-10'] === 1 && r.duracao['11-15'] === 1 && r.duracao['36-40'] === 1, 'histograma de duração por faixa de 5 turnos');
  const zeus = r.porDeus.find(d => d.deus === 'zeus');
  ok(zeus.jogou === 2 && zeus.venceu === 2 && zeus.taxaVitoria === 1, 'taxa de VITÓRIA por deus (zeus 2/2)');
  const sobek = r.porDeus.find(d => d.deus === 'sobek');
  ok(sobek.jogou === 3 && sobek.venceu === 1, 'uso e vitória por deus (sobek jogou 3, venceu 1)');
  ok(typeof zeus.taxaUso === 'number', 'taxa de USO por deus (revela slot morto: deus que ninguém escolhe)');
  // NUNCA-USADAS: zeus:milagre, ogum:basico, ogum:habilidade nunca foram registrados
  const nu = new Set(r.nuncaUsadas.map(s => s.deus + ':' + s.slot));
  ok(nu.has('zeus:milagre') && nu.has('ogum:basico') && nu.has('ogum:habilidade'), 'lista de NUNCA-USADAS (habilidade do catálogo com 0 uso) — o que a Fase 4 quer');
  ok(!nu.has('zeus:basico') && !nu.has('zeus:habilidade'), 'as usadas NÃO aparecem em nunca-usadas');
  console.log('  vitória/uso por deus · uso por slot · nunca-usadas · duração · abandono — tudo medido');

  // ===== (2) NADA de jogador · (3) AGREGADO, não evento =====
  console.log('== 2. LGPD por desenho: nada identifica o jogador · agregado, não evento ==');
  const snap = telemetria.snapshot();
  const chaves = Object.keys(snap).sort().join(',');
  ok(chaves === 'abandonos,deuses,duracao,partidas,slots,turnosTotal', 'o dado é SÓ contadores (partidas/abandonos/turnos/duração/deuses/slots) — nada mais');
  // nenhuma chave de deus/slot parece id de conta (id = 32 hex); nenhum campo é lista de eventos
  const idLike = /^[0-9a-f]{32}$/;
  const semId = Object.keys(snap.deuses).every(k => !idLike.test(k)) && Object.keys(snap.slots).every(k => !idLike.test(k));
  ok(semId, 'nenhuma chave é id de conta — a telemetria não sabe QUEM jogou, só O QUE (deus/habilidade)');
  const soContadores = typeof snap.partidas === 'number' && Object.values(snap.deuses).every(d => typeof d.jogou === 'number' && typeof d.venceu === 'number') && Object.values(snap.slots).every(v => typeof v === 'number');
  ok(soContadores, 'AGREGADO: cada campo é um CONTADOR (número), não um fluxo de evento (sem timestamp, sem linha por ação)');
  console.log('  sem id de jogador · só contadores · nada a vazar');

  // ===== (5) só PvP registra; a partida contra a IA (PvE) NÃO; e a partida real conta certo =====
  console.log('== 3. WS: uma partida PvP registra (com vencedor/turnos/deuses certos); PvE não registra ==');
  telemetria._reset(); contas._resetParaTeste(); salas._limparTudo();
  const { server } = require('../server/server.js');
  await new Promise(r2 => server.listen(0, r2));
  const porta = server.address().port;

  // PvE (contra a IA) NÃO deve registrar
  const wsPve = new WebSocket('ws://localhost:' + porta); await new Promise((res, rej) => { wsPve.on('open', res); wsPve.on('error', rej); });
  const pede = (w, msg) => new Promise((res) => { w.once('message', d => res(JSON.parse(d.toString()))); w.send(JSON.stringify(msg)); });
  const cpve = await pede(wsPve, { v: V, tipo: 'criarConta', faixaIdade: 'maior' });
  await pede(wsPve, { v: V, tipo: 'novaPartida', pergaminhoKey: 'afrodite', token: cpve.token });
  // joga o PvE até o fim
  { const salaPve = salas.de(cpve.conta.id); let g = 0; while (!salaPve.P.st.fim && g++ < 100) { for (const op of opsDoLado(salaPve.P.st, 0)) { if (salaPve.P.st.fim) break; await pede(wsPve, { v: V, tipo: 'jogar', uid: op.uid, slot: op.slot, alvos: op.alvos, token: cpve.token }); } if (salaPve.P.st.fim) break; await pede(wsPve, { v: V, tipo: 'encerrar', token: cpve.token }); } }
  ok(telemetria.snapshot().partidas === 0, 'partida contra a IA (PvE) NÃO é registrada (só a escolha do jogador interessa)');
  wsPve.close();

  // PvP: dois jogadores, uma partida completa -> registra exatamente uma
  async function jogadorWS(nick, time) { const c = contas.criar({ faixaIdade: 'maior' }).conta; contas.definirNick(c.token, nick); const ws = new WebSocket('ws://localhost:' + porta); await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); }); const J = { c, token: c.token, ws, _pend: [] }; ws.on('message', (d) => { const m = JSON.parse(d.toString()); if (m.push) return; const cb = J._pend.shift(); if (cb) cb(m); }); J.pedir = (msg) => new Promise((res) => { J._pend.push(res); ws.send(JSON.stringify(msg)); }); return J; }
  const A = await jogadorWS('TelA', TIME_A), B = await jogadorWS('TelB', TIME_B);
  await A.pedir({ v: V, tipo: 'entrarFila', time: TIME_A, token: A.token });
  await B.pedir({ v: V, tipo: 'entrarFila', time: TIME_B, token: B.token });
  const sala = salas.de(A.c.id);
  const players = {}; players[salas.ladoDe(sala, A.c.id)] = A; players[salas.ladoDe(sala, B.c.id)] = B;
  let g = 0; while (!sala.P.st.fim && g++ < 120) { const at = sala.P.st.ativo, jog = players[at]; for (const op of opsDoLado(sala.P.st, at)) { if (sala.P.st.fim) break; await jog.pedir({ v: V, tipo: 'jogar', uid: op.uid, slot: op.slot, alvos: op.alvos, token: jog.token }); } if (sala.P.st.fim) break; await jog.pedir({ v: V, tipo: 'encerrar', token: jog.token }); }
  await dorme(50);
  const s2 = telemetria.snapshot();
  ok(s2.partidas === 1, 'a partida PvP registrou EXATAMENTE uma (não por ação, não duplicada)');
  ok(s2.deuses['zeus'] && s2.deuses['sobek'], 'os deuses dos dois times foram contados');
  ok(Object.keys(s2.slots).length >= 1, 'as habilidades usadas na partida PvP foram contadas por slot');
  const vencedorLado = sala.P.st.fim.lado;
  const timeVenc = vencedorLado === 0 ? TIME_A : TIME_B;
  ok(timeVenc.every(k => s2.deuses[k].venceu === 1), 'os deuses do lado VENCEDOR contam a vitória (o servidor sabe quem venceu)');

  A.ws.close(); B.ws.close();
  await new Promise(r2 => server.close(r2));
  telemetria._reset(); contas._resetParaTeste(); salas._limparTudo();
  console.log('  WS: PvE não registra · PvP registra uma · deuses/slots/vencedor certos');

  console.log('');
  console.log(falhas === 0 ? '>>> TELEMETRIA OK' : `>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

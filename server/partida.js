// server/partida.js — F5.1/F5.2: a PARTIDA rodando no SERVIDOR. O servidor é o dono da partida:
// valida cada ação contra o estado autoritativo, aplica, e devolve. O cliente NUNCA declara
// resultado — vitória, derrota e fim de turno são daqui. O oponente (F5.2) é a IA rodando no
// servidor: testa o protocolo inteiro sem depender do pareamento (F5.3).
//
// PURO O BASTANTE PARA TESTAR SEM WebSocket: o tempo entra por parametro (`agora`), a IA e o motor
// vem do motor-host (o MESMO src/engine.js do cliente). O server.js so amarra isto ao socket e ao
// relogio de verdade (setTimeout). Assim a regra de partida se prova em Node, sem rede nem relogio real.
const path = require('path');
const host = require('./motor-host.js');
const E = host.E, ia = host.ia;

const LIMITE_MS = 60000;   // relogio do turno: 60s (o mesmo TURNO_SEG do cliente). Do servidor agora.
const MAX_ABANDONO = 3;    // turnos consecutivos PERDIDOS (sem agir) = derrota por abandono (anti-idle do ranqueado).

// resultado do ponto de vista do HUMANO (lado 0). st.fim.lado = lado VENCEDOR (view.js).
function _resultadoHumano(st, humano) {
  if (!st.fim) return null;
  return { resultado: st.fim.lado === humano ? 'vitoria' : 'derrota', ladoVencedor: st.fim.lado, motivo: st.fim.motivo || null };
}

// REDE DE SEGURANÇA de fim: o motor declara vitória quando um lado é varrido, MAS só nos pontos em
// que roda `checarFim` (dentro de agir/matar/início de turno). Um lado varrido por efeito de INÍCIO
// de turno para o qual o controle VOLTA (fica ocioso, sem ação) pode não passar por esses pontos e a
// partida travaria. O servidor é o dono do fim: aplico a MESMA regra do motor (todos !vivo e sem
// renascer pendente = o outro lado venceu) para nunca deixar uma partida sem vencedor. Não sobrescreve
// um fim já declarado (respeita motivo/tempo/execução).
function _garantirFim(st) {
  if (st.fim) return;
  for (let i = 0; i < 2; i++) {
    if (st.lados[i].units.every(u => !u.vivo && !u.pendenteRenascer)) { st.fim = { tipo: 'fim', resultado: 'vitoria', lado: 1 - i }; return; }
  }
}

// criar(pergaminho, {agora, limiteMs, humano}) -> P (a partida autoritativa).
function criar(pergaminho, opts = {}) {
  const agora = typeof opts.agora === 'number' ? opts.agora : Date.now();
  const limiteMs = typeof opts.limiteMs === 'number' ? opts.limiteMs : LIMITE_MS;
  const humano = typeof opts.humano === 'number' ? opts.humano : 0;   // o humano e o lado 0; a IA e o outro
  const st = host.montar(pergaminho);
  const P = {
    st, humano, cpu: 1 - humano, limiteMs,
    deadline: agora + limiteMs,     // relogio ABSOLUTO do servidor (o cliente desenha o que sobra)
    agiuNesteTurno: false,          // o humano agiu neste turno? (turno com acao nao conta como perdido)
    turnosPerdidos: 0,              // turnos consecutivos SEM agir (para o abandono)
    fim: _resultadoHumano(st, humano),
  };
  return P;
}

// snapshot do que sai para o cliente: estado autoritativo + hash + de quem e o turno + relogio + fim.
function estado(P, agora) {
  const now = typeof agora === 'number' ? agora : Date.now();
  return {
    estado: JSON.parse(host.serializar(P.st)),
    hash: host.hashEstado(P.st),
    turnoDe: P.st.ativo,            // de quem e a vez (o cliente so age se for o humano)
    humano: P.humano,
    deadline: P.deadline,           // instante-limite absoluto (ms do servidor)
    agora: now,                     // 'agora' do servidor, para o cliente medir o offset do relogio
    restanteMs: Math.max(0, P.deadline - now),
    fim: P.fim,                     // null enquanto joga; {resultado,...} quando acabou. SO o servidor decide.
  };
}

// AGIR: uma acao do HUMANO, validada contra o estado autoritativo. NAO encerra o turno (o humano
// pode agir com varias unidades e so entao encerrar). Recusa clara; nunca aplica "na duvida".
// op: {uid, slot, alvos, escolhas, modo}. Retorna {ok} | {ok:false, codigo, erro}.
function agir(P, op, opts = {}) {
  if (P.fim) return { ok: false, codigo: 'partida_encerrada', erro: 'a partida ja acabou' };
  if (P.st.ativo !== P.humano) return { ok: false, codigo: 'nao_e_seu_turno', erro: 'nao e a sua vez (o turno e do oponente)' };
  const u = (P.st.lados[P.humano].units || []).find(x => x.uid === (op && op.uid));
  if (!u) return { ok: false, codigo: 'unidade_invalida', erro: 'unidade nao e sua ou nao existe' };
  // TRANSACIONAL: uma acao recusada NUNCA pode corromper o estado autoritativo. Fotografo antes;
  // se o motor recusar (mesmo apos tocar o estado), restauro. O servidor e a verdade — tem de ser limpo.
  const antes = host.serializar(P.st);
  const r = E.agir(P.st, op.uid, op.slot, op.alvos || [], op.escolhas || null, op.modo || null);
  if (!r || !r.ok) { P.st = JSON.parse(antes); return { ok: false, codigo: 'acao_invalida', erro: (r && r.erro) || 'acao invalida' }; }
  P.agiuNesteTurno = true;
  P.fim = _resultadoHumano(P.st, P.humano);   // agir pode encerrar a partida (execucao, ultimo abate)
  return { ok: true, encerrou: !!P.fim };
}

// ENCERRAR o turno do humano (voluntario): fecha o turno, roda a IA do oponente ate a vez voltar,
// e rearma o relogio. Retorna as acoes da IA (para o cliente DESENHAR o que o oponente fez) + fim.
function encerrarTurno(P, opts = {}) {
  const agora = typeof opts.agora === 'number' ? opts.agora : Date.now();
  if (P.fim) return { ok: false, codigo: 'partida_encerrada', erro: 'a partida ja acabou' };
  if (P.st.ativo !== P.humano) return { ok: false, codigo: 'nao_e_seu_turno', erro: 'nao e a sua vez' };
  return _fecharEDirigir(P, agora, false);
}

// ESTOURAR o tempo (o relogio do servidor disparou; o humano nao encerrou). O turno PASSA
// automaticamente (nao e morte instantanea — um turno perdido ja e penalidade tatica real). Turnos
// consecutivos SEM nenhuma acao = abandono (derrota). Turno em que o humano agiu nao conta como perdido.
function estourarTempo(P, opts = {}) {
  const agora = typeof opts.agora === 'number' ? opts.agora : Date.now();
  if (P.fim) return { ok: false, codigo: 'partida_encerrada', erro: 'a partida ja acabou' };
  if (P.st.ativo !== P.humano) return { ok: false, codigo: 'nao_e_seu_turno', erro: 'o relogio so corre no turno do humano' };
  if (!P.agiuNesteTurno) {
    P.turnosPerdidos += 1;
    if (P.turnosPerdidos >= MAX_ABANDONO) {
      // ABANDONO: o servidor declara a derrota (reusa a maquina de fim do motor). O cliente so desenha.
      P.st.fim = { tipo: 'fim', resultado: 'vitoria', lado: P.cpu, motivo: 'abandono' };
      P.fim = _resultadoHumano(P.st, P.humano);
      return { ok: true, abandono: true, turnosPerdidos: P.turnosPerdidos, cpuOps: [], fim: P.fim };
    }
  }
  const r = _fecharEDirigir(P, agora, true);
  return Object.assign({ autopassou: true, turnosPerdidos: P.turnosPerdidos }, r);
}

// fecha o turno do humano e DIRIGE a IA do oponente ate a vez voltar (ou a partida acabar). Espelha
// o cliente local (passoIA + encerrarTurno): fimTurno(humano) -> [laco da IA] -> fimTurno(oponente).
function _fecharEDirigir(P, agora, foiTempo) {
  const st = P.st;
  E.fimTurno(st);                       // encerra o turno do humano -> vez do oponente
  const cpuOps = [];
  let guarda = 0;
  while (!st.fim && st.ativo === P.cpu && guarda++ < 200) {
    const mv = ia.iaProximaAcao(st, 'normal');
    if (!mv) { E.fimTurno(st); break; }   // IA sem mais acao: encerra o turno dela -> volta ao humano
    const r = E.agir(st, mv.uid, mv.slot, mv.alvos || [], mv.escolhas || null, mv.modo || null);
    if (r && r.ok) cpuOps.push({ uid: mv.uid, slot: mv.slot, alvos: mv.alvos || [] });
    else { E.fimTurno(st); break; }       // salvaguarda: IA propos acao invalida (nao deveria) -> nao trava
  }
  // novo turno do humano: rearma o relogio e zera o "agiu neste turno"
  _garantirFim(st);   // rede de seguranca: lado varrido no fluxo acima que o motor nao carimbou
  P.deadline = agora + P.limiteMs;
  P.agiuNesteTurno = false;
  P.fim = _resultadoHumano(st, P.humano);
  return { ok: true, cpuOps, fim: P.fim };
}

module.exports = { LIMITE_MS, MAX_ABANDONO, criar, estado, agir, encerrarTurno, estourarTempo };

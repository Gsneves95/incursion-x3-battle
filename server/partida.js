// server/partida.js — a PARTIDA rodando no SERVIDOR. O servidor é o dono: valida cada ação contra o
// estado autoritativo, aplica, e devolve. O cliente NUNCA declara resultado.
//   - PvE (F5.2): o oponente é a IA rodando no servidor. O `encerrar` do humano dirige a IA até a vez voltar.
//   - PvP (F5.3): DOIS humanos. Nenhuma IA — o `encerrar` só passa o turno para o outro humano. Cada
//     lado só age no SEU turno; a posse do time é validada antes (contas.validarTime), não aqui.
// LADO-CÊNTRICO: tudo é por LADO (0/1). `ociosos`/`agiu` são por lado (o abandono é de cada jogador).
// PURO O BASTANTE PARA TESTAR SEM WebSocket: o tempo entra por parâmetro (`agora`).
const path = require('path');
const host = require('./motor-host.js');
const E = host.E, ia = host.ia;

const LIMITE_MS = 60000;   // relógio do turno: 60s. Do servidor (§223).
const MAX_ABANDONO = 3;    // turnos consecutivos ociosos (sem agir) = derrota por abandono (anti-idle).

// resultado do ponto de vista de UM lado. st.fim.lado = lado VENCEDOR (view.js).
function _resultado(st, lado) {
  if (!st.fim) return null;
  return { resultado: st.fim.lado === lado ? 'vitoria' : (st.fim.resultado === 'empate' ? 'empate' : 'derrota'), ladoVencedor: st.fim.lado, motivo: st.fim.motivo || null };
}
// REDE DE SEGURANÇA de fim (§223): lado varrido por efeito de início de turno para o qual o controle
// volta pode não passar pelo `checarFim` do motor. O servidor aplica a MESMA regra para nunca travar.
function _garantirFim(st) {
  if (st.fim) return;
  for (let i = 0; i < 2; i++) {
    if (st.lados[i].units.every(u => !u.vivo && !u.pendenteRenascer)) { st.fim = { tipo: 'fim', resultado: 'vitoria', lado: 1 - i }; return; }
  }
}
function _base(st, agora, limiteMs, modo) {
  return {
    st, modo, humano: 0, cpu: 1, limiteMs,
    deadline: agora + limiteMs,     // relógio ABSOLUTO do servidor (§224: não zera na reconexão)
    agiu: [false, false],           // por lado: agiu neste turno? (turno com ação não conta como ocioso)
    ociosos: [0, 0],                // por lado: turnos consecutivos SEM agir (abandono)
    fim: _resultado(st, 0),         // POV do lado 0 (o snapshot recomputa por destinatário)
  };
}

// PvE: nasce de um pergaminho carimbado; o lado 1 é a IA.
function criar(pergaminho, opts = {}) {
  const agora = typeof opts.agora === 'number' ? opts.agora : Date.now();
  const limiteMs = typeof opts.limiteMs === 'number' ? opts.limiteMs : LIMITE_MS;
  return _base(host.montar(pergaminho), agora, limiteMs, 'pve');
}
// PvP: nasce de DOIS times de 3. `comeca` = quem abre (a regra de iniciativa do motor sobrepõe, §121);
// `seed` fixa o sorteio de energia. Ambos entram por quem cria (o servidor escolhe, justo — não o cliente).
function criarPvP(time0, time1, opts = {}) {
  const agora = typeof opts.agora === 'number' ? opts.agora : Date.now();
  const limiteMs = typeof opts.limiteMs === 'number' ? opts.limiteMs : LIMITE_MS;
  const seed = (typeof opts.seed === 'number') ? opts.seed : 1;
  const comeca = (opts.comeca === 1) ? 1 : 0;
  const st = host.montar({ aliados: time0, inimigos: time1, montar: { seed, comeca }, condicoes: [] });
  const P = _base(st, agora, limiteMs, 'pvp');
  P.abre = st.starter;   // quem o motor decidiu que abre (iniciativa OU o comeca sorteado)
  return P;
}

// snapshot para UM destinatário (o lado que ele controla). O `fim` e o `humano` são do PONTO DE VISTA
// dele; assim os dois jogadores de um PvP recebem o mesmo estado, cada um se vendo como o seu lado.
function estado(P, agora, ladoRecipiente) {
  const now = typeof agora === 'number' ? agora : Date.now();
  const lado = (ladoRecipiente === 1) ? 1 : 0;
  return {
    estado: JSON.parse(host.serializar(P.st)),
    hash: host.hashEstado(P.st),
    turnoDe: P.st.ativo,
    humano: lado,                   // "você é este lado" (PvE: sempre 0)
    modo: P.modo,
    deadline: P.deadline,
    agora: now,
    restanteMs: Math.max(0, P.deadline - now),
    fim: _resultado(P.st, lado),    // vitória/derrota do ponto de vista DELE
  };
}

// AGIR: uma ação de um lado, validada. `lado` é de quem age (o servidor sabe pela conta; nunca confia
// no cliente). Só age no SEU turno e com a SUA unidade. Transacional: recusa não corrompe o estado.
function agir(P, op, opts = {}) {
  const lado = (typeof opts.lado === 'number') ? opts.lado : P.humano;
  if (P.st.fim) return { ok: false, codigo: 'partida_encerrada', erro: 'a partida ja acabou' };
  if (P.st.ativo !== lado) return { ok: false, codigo: 'nao_e_seu_turno', erro: 'nao e a sua vez (o turno e do oponente)' };
  const u = (P.st.lados[lado].units || []).find(x => x.uid === (op && op.uid));
  if (!u) return { ok: false, codigo: 'unidade_invalida', erro: 'unidade nao e sua ou nao existe' };
  const antes = host.serializar(P.st);
  const r = E.agir(P.st, op.uid, op.slot, op.alvos || [], op.escolhas || null, op.modo || null);
  if (!r || !r.ok) { P.st = JSON.parse(antes); return { ok: false, codigo: 'acao_invalida', erro: (r && r.erro) || 'acao invalida' }; }
  P.agiu[lado] = true;
  P.fim = _resultado(P.st, 0);
  return { ok: true, encerrou: !!P.st.fim };
}

// ENCERRAR o turno de um lado (voluntário). PvE: dirige a IA até a vez voltar. PvP: só passa o turno.
function encerrarTurno(P, opts = {}) {
  const agora = typeof opts.agora === 'number' ? opts.agora : Date.now();
  const lado = (typeof opts.lado === 'number') ? opts.lado : P.humano;
  if (P.st.fim) return { ok: false, codigo: 'partida_encerrada', erro: 'a partida ja acabou' };
  if (P.st.ativo !== lado) return { ok: false, codigo: 'nao_e_seu_turno', erro: 'nao e a sua vez' };
  return _passarTurno(P, agora);
}

// ESTOURAR o tempo (o relógio do servidor disparou no turno de st.ativo). O turno PASSA (não é morte);
// turnos consecutivos SEM agir = abandono daquele lado (o OUTRO vence). Turno em que agiu não conta.
function estourarTempo(P, opts = {}) {
  const agora = typeof opts.agora === 'number' ? opts.agora : Date.now();
  if (P.st.fim) return { ok: false, codigo: 'partida_encerrada', erro: 'a partida ja acabou' };
  const ativo = P.st.ativo;
  if (!P.agiu[ativo]) {
    P.ociosos[ativo] += 1;
    if (P.ociosos[ativo] >= MAX_ABANDONO) {
      P.st.fim = { tipo: 'fim', resultado: 'vitoria', lado: 1 - ativo, motivo: 'abandono' };
      P.fim = _resultado(P.st, 0);
      return { ok: true, abandono: true, ladoAbandonou: ativo, turnosPerdidos: P.ociosos[ativo], cpuOps: [], fim: P.fim };
    }
  }
  const r = _passarTurno(P, agora);
  return Object.assign({ autopassou: true, turnosPerdidos: P.ociosos[ativo] }, r);
}

// passa o turno do lado ativo. PvE: fimTurno(humano) -> laço da IA -> fimTurno(IA) (a vez volta ao humano).
// PvP: fimTurno só (a vez vai ao outro humano). Depois: rede de fim, rearma o relógio, zera o "agiu" do novo ativo.
function _passarTurno(P, agora) {
  const st = P.st;
  const cpuOps = [];
  E.fimTurno(st);   // encerra o turno de quem estava ativo
  if (P.modo === 'pve') {
    let guarda = 0;
    while (!st.fim && st.ativo === P.cpu && guarda++ < 200) {
      const mv = ia.iaProximaAcao(st, 'normal');
      if (!mv) { E.fimTurno(st); break; }
      const r = E.agir(st, mv.uid, mv.slot, mv.alvos || [], mv.escolhas || null, mv.modo || null);
      if (r && r.ok) cpuOps.push({ uid: mv.uid, slot: mv.slot, alvos: mv.alvos || [] });
      else { E.fimTurno(st); break; }
    }
  }
  _garantirFim(st);
  P.deadline = agora + P.limiteMs;
  P.agiu[st.ativo] = false;   // o novo lado ativo começa "sem ter agido"
  P.fim = _resultado(st, 0);
  return { ok: true, cpuOps, fim: P.fim };
}

module.exports = { LIMITE_MS, MAX_ABANDONO, criar, criarPvP, estado, agir, encerrarTurno, estourarTempo };

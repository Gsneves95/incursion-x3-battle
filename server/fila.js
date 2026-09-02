// server/fila.js — F5.3: a FILA de pareamento. Um jogador entra, espera, e o servidor junta dois.
// Simples: no máximo UM esperando (fila de 1). Quando outro entra, PAREIA.
//
// OS CASOS CHATOS, resolvidos:
//  - o jogador sai da fila (fecha o app na espera): o `close` da conexão chama sair() → o esperando some.
//    E na hora de parear, confiro que o esperando ainda está VIVO (readyState) e não entrou noutra partida.
//  - dois entram "ao mesmo tempo" e o pareamento corre: Node é SINGLE-THREAD — entrar() roda inteiro,
//    sem await no meio, antes de o próximo entrar() começar. A corrida não existe: o 1º enfileira, o 2º
//    pareia. Atômico por construção (não por sorte).
//  - um entra na fila TENDO partida em curso: recusa 'ja_em_partida' (salas.existe) — não pode.
//
// QUEM COMEÇA (justo): a regra de KIT do motor decide primeiro — iniciativa (Hermes/Exu) força o starter
// (§121). Quando ela não decide (nenhum ou ambos os lados têm), vale um `comeca` de MOEDA do servidor
// (bit do seed sorteado por crypto) — NUNCA a ordem da fila. Nem jogador controla o seed; é auditável.
const crypto = require('crypto');
const contas = require('./contas.js');
const salas = require('./salas.js');

let _espera = null;   // { contaId, ws, token, time } — o único jogador esperando (ou null)

// entrar(ws, token, time) -> { ok, estado:'na_fila'|'pareado', sala?, oponente? } | { ok:false, codigo, erro }
function entrar(ws, token, time) {
  const conta = contas.porToken(token);
  if (!conta) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  if (!conta.nick) return { ok: false, codigo: 'sem_nick', erro: 'defina um nick antes de entrar no PvP' };
  if (salas.existe(conta.id)) return { ok: false, codigo: 'ja_em_partida', erro: 'você já está em uma partida — termine ou saia dela antes' };
  const vt = contas.validarTime(token, time);   // POSSE: o servidor valida os 3 deuses (o cliente não é confiável)
  if (!vt.ok) return vt;

  // o mesmo jogador reentrando na fila: atualiza (não duplica)
  if (_espera && _espera.contaId === conta.id) { _espera.ws = ws; _espera.time = time; _espera.token = token; return { ok: true, estado: 'na_fila' }; }

  // há alguém esperando, VIVO e livre? PAREIA.
  if (_espera && _espera.ws && _espera.ws.readyState === 1 && !salas.existe(_espera.contaId)) {
    const outro = _espera; _espera = null;
    const seed = crypto.randomBytes(4).readUInt32BE(0);   // sorteio do servidor (energia + moeda de quem começa)
    const comeca = seed & 1;                              // MOEDA justa: bit do seed; a iniciativa do motor sobrepõe (§121)
    const sala = salas.criarPvP(
      { contaId: outro.contaId, ws: outro.ws, time: outro.time },
      { contaId: conta.id, ws, time },
      { seed, comeca },
    );
    return { ok: true, estado: 'pareado', sala, oponente: outro };
  }

  // ninguém livre esperando (ou o que estava esperando caiu): este vira o que espera.
  _espera = { contaId: conta.id, ws, token, time };
  return { ok: true, estado: 'na_fila' };
}

function sair(contaId) { let saiu = false; if (_espera && _espera.contaId === contaId) { _espera = null; saiu = true; } if (sairRanqueada(contaId)) saiu = true; return saiu; }
function esperando() { return _espera ? _espera.contaId : null; }   // introspecção p/ teste
function _limpar() { _espera = null; _filaR = []; if (_tickR) { clearInterval(_tickR); _tickR = null; } }

// ============================================================
// F5.5 — FILA RANQUEADA: CIENTE DE FAIXA. Pareia pontos PRÓXIMOS; a tolerância ABRE conforme a espera
// cresce, para o jogador de faixa alta não ficar sozinho. Caso extremo (Semideus às 3h): a janela
// cresce SEM TETO — em ~10s cobre a escala inteira e ele pareia com QUEM ESTIVER, em vez de esperar
// para sempre. Vários podem esperar (não é fila de 1): um TICK casa quem já espera quando as janelas
// crescem o bastante, mesmo sem nova entrada.
// ============================================================
let _filaR = [];      // [{ contaId, ws, time, pontos, entrouEm }]
let _tickR = null;

function _janela(esperaMs) { const f = contas.RANQ.fila || {}; return (f.janelaBase || 0) + (f.janelaPorSegundo || 0) * (esperaMs / 1000); }
function _compat(a, b, agora) { const w = Math.max(_janela(agora - a.entrouEm), _janela(agora - b.entrouEm)); return Math.abs(a.pontos - b.pontos) <= w; }
function _vivoLivre(e) { return e.ws && e.ws.readyState === 1 && !salas.existe(e.contaId); }
function _removerR(contaId) { _filaR = _filaR.filter(e => e.contaId !== contaId); }
function sairRanqueada(contaId) { const antes = _filaR.length; _removerR(contaId); return _filaR.length !== antes; }

function _parearR(a, b) {
  const seed = crypto.randomBytes(4).readUInt32BE(0);
  return salas.criarPvP({ contaId: a.contaId, ws: a.ws, time: a.time }, { contaId: b.contaId, ws: b.ws, time: b.time }, { seed, comeca: seed & 1, ranqueado: true });
}

// entrarRanqueada(ws, token, time, agora) -> { ok, estado:'na_fila'|'pareado', sala?, oponente? } | recusa
function entrarRanqueada(ws, token, time, agora) {
  agora = typeof agora === 'number' ? agora : Date.now();
  const conta = contas.porToken(token);
  if (!conta) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  if (!conta.nick) return { ok: false, codigo: 'sem_nick', erro: 'defina um nick antes de entrar no ranqueado' };
  if (salas.existe(conta.id)) return { ok: false, codigo: 'ja_em_partida', erro: 'você já está em uma partida' };
  const vt = contas.validarTime(token, time); if (!vt.ok) return vt;
  const pontos = contas.ranquePublico(conta).pontos;
  const entry = { contaId: conta.id, ws, time, pontos, entrouEm: agora };
  const ja = _filaR.findIndex(e => e.contaId === conta.id);
  if (ja >= 0) { _filaR[ja] = entry; return { ok: true, estado: 'na_fila' }; }   // reentrada: atualiza (não duplica)
  // casa com o MAIS PRÓXIMO compatível já esperando (janela do que espera há mais tempo)
  let melhor = null, dMin = Infinity;
  for (const e of _filaR) { if (!_vivoLivre(e)) continue; if (_compat(entry, e, agora)) { const d = Math.abs(entry.pontos - e.pontos); if (d < dMin) { dMin = d; melhor = e; } } }
  if (melhor) { _removerR(melhor.contaId); return { ok: true, estado: 'pareado', sala: _parearR(melhor, entry), oponente: melhor }; }
  _filaR.push(entry); _garantirTick();
  return { ok: true, estado: 'na_fila' };
}

// TICK: casa quem já espera quando as janelas crescem o bastante (sem depender de nova entrada). É o
// que garante que o Semideus solitário acaba pareado — a janela dele abre até cobrir alguém.
function _garantirTick() { if (_tickR) return; _tickR = setInterval(() => _rodarTick(Date.now()), 1000); if (_tickR.unref) _tickR.unref(); }
function _rodarTick(agora) {
  _filaR = _filaR.filter(_vivoLivre);   // limpa mortos/já-em-partida
  _filaR.sort((a, b) => a.entrouEm - b.entrouEm);   // quem espera há mais tempo primeiro (janela maior)
  for (let i = 0; i < _filaR.length; i++) for (let j = i + 1; j < _filaR.length; j++) {
    if (_compat(_filaR[i], _filaR[j], agora)) {
      const a = _filaR[i], b = _filaR[j]; _removerR(a.contaId); _removerR(b.contaId);
      const sala = _parearR(a, b);
      salas.empurrarTodos(sala, { push: true, pareado: true, ranqueado: true });   // ambos por push (ninguém pediu agora)
      return _rodarTick(agora);   // a lista mudou: recomeça
    }
  }
  if (!_filaR.length && _tickR) { clearInterval(_tickR); _tickR = null; }
}
function _naFilaRanqueada() { return _filaR.map(e => e.contaId); }   // introspecção p/ teste
function _rodarTickTeste(agora) { _rodarTick(agora); }

module.exports = { entrar, sair, esperando, entrarRanqueada, sairRanqueada, _naFilaRanqueada, _rodarTickTeste, _janela, _limpar };

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

function sair(contaId) { if (_espera && _espera.contaId === contaId) { _espera = null; return true; } return false; }
function esperando() { return _espera ? _espera.contaId : null; }   // introspecção p/ teste
function _limpar() { _espera = null; }

module.exports = { entrar, sair, esperando, _limpar };

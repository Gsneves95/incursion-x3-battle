'use strict';
// FASE 6 / §230-§231 — O CONTADOR DA MISSÃO, no SERVIDOR (ao lado do ranque). Conta SÓ PvP (§228).
// Aplicado UMA vez no fim da partida PvP, lido do st.log AUTORITATIVO — o cliente NÃO manda progresso.
//
// O REQUISITO (§230, correção do dono): VOLUME por PANTEÃO + SEGUIDAS com o COMPANHEIRO temático — tudo
// com deuses que o jogador JÁ TEM (nunca com o deus a liberar). O contador de vitórias por panteão e a
// sequência por companheiro resolvem o desbloqueio; o feito-por-habilidade saiu do caminho crítico.
//
// O LEDGER (por conta, em contas): vitoriasPanteaoPvP[panteão] (o volume — conta a vitória por CADA
// panteão presente no time vencedor), sequenciaPvP[deus] (reset na derrota — para as "seguidas com o
// companheiro"), vitoriasPvP[deus] e feitos[deus] (MAESTRIA/futuro, §230, fora do gate), liberados[deus].
//
// O FEITO (medir) segue lido do log como a Fase 2 lê — mas agora serve à MAESTRIA, não ao desbloqueio.
// Atribuição por VARREDURA do log pelo LADO ATIVO (turno.lado) + ATOR (acao.origem/slot): o proativo vai
// ao lado ativo, o reativo (reflexo/intercepta/absorve) ao lado que DEFENDE — resolve o espelho.

const fs = require('fs');
const path = require('path');
const FAM = require('../src/missoes_familias.js');
const contas = require('./contas.js');

const DOC = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'missoes.json'), 'utf8')); } catch (e) { return { versao: 0, iniciais: [], panteaoDe: {}, missoes: {} }; } })();
const GODS = FAM._carregarDeuses();

// tipos de efeito que TIRAM O TURNO (controle) e fx que ARRANCAM vantagem (remove-buff) — espelham o
// classificador; usados na atribuição por INTENÇÃO (o motor não loga a aplicação do status, §186).
const EFF_CONTROLE = new Set(['atordoado', 'lockSkill', 'selado', 'medo', 'adormecido', 'taunt', 'agarrar', 'pacificado', 'torpor', 'silenceClass', 'submerso', 'passeForcado']);
const T_CONTROLE = new Set(['dominar', 'passeForcado', 'suspendeBuffs', 'aceleraLivro']);
const T_REMOVE = new Set(['stripBuffs', 'stripOne', 'stripDef', 'destroyShield', 'realoca', 'suspendeBuffs']);

function _abDe(godKey, slot) { const g = GODS[godKey]; return g && (g.ab || []).find(a => a.slot === slot); }
function _fxPlana(ab) { const out = []; const w = (fx) => { if (!fx) return; out.push(fx); (fx.entao || []).forEach(w); (fx.senao || []).forEach(w); (fx.agenda || []).forEach(w); }; for (const fx of (ab.fx || [])) w(fx); return out; }
function _contaControle(ab) { let n = 0; for (const fx of _fxPlana(ab)) { if (T_CONTROLE.has(fx.t)) n++; if (fx.eff && EFF_CONTROLE.has(fx.eff.type)) n++; } return n; }
function _contaRemove(ab) { let n = 0; for (const fx of _fxPlana(ab)) if (T_REMOVE.has(fx.t)) n++; return n; }

// -------- MEDIR OS FEITOS de uma partida (pura, lê st) → { 0:{metrica:valor,…}, 1:{…} } por lado --------
// st = estado FINAL autoritativo (partidaCtrl). time0/time1 = as keys escolhidas por lado.
function medir(st, time0, time1) {
  const teamL = [new Set(time0), new Set(time1)];
  const acc = [ {}, {} ];
  const add = (L, m, v) => { if (v) acc[L][m] = (acc[L][m] || 0) + v; };
  // ladoDe por key SEM espelho; no espelho, null (a key está nos dois) → cai p/ o lado ativo.
  const ladoDeKey = (k) => { const a = teamL[0].has(k), b = teamL[1].has(k); if (a && !b) return 0; if (b && !a) return 1; return null; };

  let ladoAtivo = 0, ator = null, atorSlot = null;
  // pré-agrupa dano por (turno|origem) p/ distinguir ÁREA (≥2 alvos distintos num golpe) do golpe único.
  const grpDano = {};
  for (const e of st.log) if (e.tipo === 'dano' && e.valor > 0 && !e.reflexo && !e.devolvido) { const k = e.turno + '|' + e.origem; (grpDano[k] = grpDano[k] || new Set()).add(e.alvo); }

  for (const e of st.log) {
    if (e.tipo === 'turno') { ladoAtivo = (e.lado === 0 || e.lado === 1) ? e.lado : ladoAtivo; ator = null; atorSlot = null; if (e.campo) add(ladoAtivo, 'turnosCampo', 1); continue; }
    if (e.tipo === 'acao') {
      ator = e.origem; atorSlot = e.slot;
      const L = ladoDeKey(ator); const lado = (L == null) ? ladoAtivo : L;
      const ab = _abDe(ator, atorSlot);
      if (ab) { add(lado, 'controlesAplicados', _contaControle(ab)); add(lado, 'buffsRemovidos', _contaRemove(ab)); }
      continue;
    }
    if (e.tipo === 'cura' && e.valor > 0) { const L = ladoDeKey(e.alvo); add(L == null ? ladoAtivo : L, 'curaFeita', e.valor); continue; }
    if (e.tipo === 'dano' && e.valor > 0) {
      if (e.reflexo) { const L = ladoDeKey(e.origem); add(L == null ? 1 - ladoAtivo : L, 'danoRefletido', e.valor); continue; }
      const Lo = ladoDeKey(e.origem); const lado = (Lo == null) ? ladoAtivo : Lo;
      add(lado, 'danoDireto', e.valor);
      const g = grpDano[e.turno + '|' + e.origem]; if (g && g.size >= 2) add(lado, 'danoArea', e.valor);
      // absorvido/soak: quem SEGUROU foi o alvo (defende) → lado do alvo
      if (e.absorvido || e.soak) { const La = ladoDeKey(e.alvo); add(La == null ? 1 - ladoAtivo : La, 'danoAbsorvido', (e.absorvido || 0) + (e.soak || 0)); }
      continue;
    }
    if (e.tipo === 'armazenado' && e.valor > 0) { const L = ladoDeKey(e.alvo); add(L == null ? ladoAtivo : L, 'danoAbsorvido', e.valor); continue; }
    if (e.tipo === 'dot' && e.valor > 0) { const La = ladoDeKey(e.alvo); const inimigoDe = (La == null) ? 1 - ladoAtivo : 1 - La; add(inimigoDe, 'danoDot', e.valor); continue; }
    if (e.tipo === 'contador' && e.valor > 0) { const L = ladoDeKey(e.origem); add(L == null ? ladoAtivo : L, 'contadoresGanhos', e.valor); continue; }
    if (e.tipo === 'orbe' && e.valor > 0 && (e.ganhouLado === 0 || e.ganhouLado === 1)) { add(e.ganhouLado, 'orbesRoubados', e.valor); continue; }
    if (e.tipo === 'queda' && e.execucao && e.matador) { const L = ladoDeKey(e.matador); add(L == null ? ladoAtivo : L, 'execucoes', 1); continue; }
    if (e.tipo === 'revive' && e.valor > 0) { const L = ladoDeKey(e.alvo); add(L == null ? ladoAtivo : L, 'revives', 1); continue; }
    if (e.tipo === 'efeito' && (e.efeito === 'intercepta' || e.efeito === 'redirect')) { const L = ladoDeKey(e.origem); add(L == null ? 1 - ladoAtivo : L, 'interceptacoes', 1); continue; }
    if (e.tipo === 'bloqueio' && e.motivo === 'nao_revive') { const L = ladoDeKey(e.alvo); const inimigoDe = (L == null) ? 1 - ladoAtivo : 1 - L; add(inimigoDe, 'revivesNegados', 1); continue; }
  }
  return acc;
}

// -------- avaliar se a missão de um deus está CUMPRIDA, dado o ledger (§230: VOLUME + COMPANHEIRO,
// tudo com deuses que o jogador JÁ TEM; nada de feito no gate, nada de portão de faixa) --------
// ctx.possui(k) = o jogador TEM o deus k (inicial, gacha ou missão já cumprida). "JÁ TEM" (§230) é
// POSSE (perfil.deuses), não só liberação — um Cérbero vindo da Invocação também abre o Hades.
function missaoCumprida(m, led, ctx) {
  // 1) COMPANHEIRO (temático) POSSUÍDO — só se chega ao Hades pelo Cérbero.
  if (m.companheiro && !ctx.possui(m.companheiro)) return false;
  // 2) VOLUME: vitórias PvP com o PANTEÃO EXIGIDO (conta uma vitória por panteão presente no time).
  if (((led.vitoriasPanteaoPvP || {})[m.panteao] || 0) < (m.vitoriasPanteao || 0)) return false;
  // 3) SEGUIDAS com o companheiro (só S/SS têm >0): sequência de vitórias com o companheiro no time.
  if (m.seguidasCompanheiro && m.companheiro) { if (((led.sequenciaPvP || {})[m.companheiro] || 0) < m.seguidasCompanheiro) return false; }
  return true;
}

// -------- REGISTRAR o fim de UMA partida PvP no ledger das duas contas (a ÚNICA porta que mexe no
// contador de missão, e é do SERVIDOR). Chamada por salas.finalizarPartida, UMA vez (flag no chamador).
// Lê o st AUTORITATIVO: vencedor por st.fim.lado (o cliente não diz). O cliente não manda progresso —
// nem por mensagem, nem por desconexão (abandono = derrota, o log fecha), nem por partida inacabada
// (sem st.fim, nem entra aqui). --------
function _garante(led) {
  led.vitoriasPanteaoPvP = led.vitoriasPanteaoPvP || {};
  led.vitoriasPvP = led.vitoriasPvP || {}; led.sequenciaPvP = led.sequenciaPvP || {};
  led.paresPvP = led.paresPvP || {}; led.feitos = led.feitos || {}; led.liberados = led.liberados || {};
  return led;
}
function _parKey(a, b) { return [a, b].sort().join('+'); }
// o panteão de MEMBRESIA de uma key (facção real normalizada) — do doc gerado, com fallback local.
function _panteaoDe(k) { return (DOC.panteaoDe && DOC.panteaoDe[k]) || (GODS[k] && (GODS[k].faccao === 'Olímpica' ? 'Grega' : GODS[k].faccao)) || null; }

function registrarPvP(sala) {
  const st = sala && sala.P && sala.P.st;
  if (!st || !st.fim) return null;                       // inacabada: nada
  const venc = (st.fim.lado === 0 || st.fim.lado === 1) ? st.fim.lado : null;
  const time = [sala.time0.slice(), sala.time1.slice()];
  const feitosPorLado = medir(st, sala.time0, sala.time1);   // MAESTRIA (§230), fora do gate

  const ids = [sala.participantes[0].contaId, sala.participantes[1].contaId];
  const projecoes = [];
  for (let L = 0; L < 2; L++) {
    const c = contas._contaPorId(ids[L]); if (!c) { projecoes.push(null); continue; }
    const led = _garante(contas._garantirMissoes(c));
    const meu = time[L], venceu = (venc === L), perdeu = (venc === (1 - L));
    // 1) VOLUME: em VITÓRIA, conta uma vitória por CADA panteão presente no time (o requisito é
    //    "vitórias com o panteão"). vitórias/sequência por deus também (sequência = "seguidas").
    for (const k of meu) {
      if (venceu) { led.vitoriasPvP[k] = (led.vitoriasPvP[k] || 0) + 1; led.sequenciaPvP[k] = (led.sequenciaPvP[k] || 0) + 1; }
      else if (perdeu) { led.sequenciaPvP[k] = 0; }        // empate técnico não zera nem soma
    }
    if (venceu) { const pants = new Set(meu.map(_panteaoDe).filter(Boolean)); for (const p of pants) led.vitoriasPanteaoPvP[p] = (led.vitoriasPanteaoPvP[p] || 0) + 1; }
    // 2) pares (registro histórico; não é mais o gate — §230) e feitos (MAESTRIA): acumulam sempre.
    if (venceu) for (let i = 0; i < meu.length; i++) for (let j = i + 1; j < meu.length; j++) { const pk = _parKey(meu[i], meu[j]); led.paresPvP[pk] = (led.paresPvP[pk] || 0) + 1; }
    for (const k of meu) { const fam = FAM.assinatura(GODS[k]); const v = (feitosPorLado[L] || {})[fam.metrica] || 0; if (v) led.feitos[k] = (led.feitos[k] || 0) + v; }
    projecoes.push({ id: c.id, venceu });
  }
  // 3) liberar as missões cumpridas (progressão) — reavaliação por ponto-fixo, idempotente
  for (let L = 0; L < 2; L++) { const c = contas._contaPorId(ids[L]); if (c) _liberarCumpridas(c); }
  contas._salvar();
  return { vencedor: venc, projecoes };
}

// reavalia TODAS as missões da conta, LIBERA (concede o deus) as cumpridas e marca o histórico.
// LIBERAR = CONCEDER (§230: "a missão libera deus") — o deus entra em perfil.deuses; é o que o jogador
// passa a TER e a poder escalar. PONTO-FIXO: conceder um deus (que vira companheiro de outro) pode
// habilitar o próximo na MESMA passagem — é o que faz o encadeamento Maia (itzamná → chaac/kukulkan →
// ahpuch) fechar. Idempotente: quem já possui (gacha/inicial/missão) é pulado; progressão só cresce.
function _liberarCumpridas(c, agora) {
  const led = _garante(contas._garantirMissoes(c));
  if (!c.perfil) c.perfil = {};
  const deuses = c.perfil.deuses = c.perfil.deuses || {};
  const possui = (k) => DOC.iniciais.includes(k) || !!deuses[k];
  const ctx = { iniciais: DOC.iniciais, possui };
  const quando = typeof agora === 'number' ? agora : Date.now();
  let mudou = true;
  while (mudou) {
    mudou = false;
    for (const k of Object.keys(DOC.missoes)) {
      if (deuses[k]) continue;   // já possuído (gacha/missão anterior): nada a conceder
      if (missaoCumprida(DOC.missoes[k], led, ctx)) {
        deuses[k] = { copias: 1, favorito: false, obtidoEm: quando, viaMissao: true };   // CONCEDE o deus
        led.liberados[k] = true;                                                          // histórico da missão
        mudou = true;
      }
    }
  }
  return led;
}

module.exports = { DOC, medir, missaoCumprida, registrarPvP, _liberarCumpridas, GODS };

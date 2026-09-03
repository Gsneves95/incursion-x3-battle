'use strict';
// FASE 6 / §229 — O CONTADOR DA MISSÃO, no SERVIDOR (ao lado do ranque). Conta SÓ PvP (§228). Aplicado
// UMA vez no fim da partida PvP, lido do st.log AUTORITATIVO — o cliente NÃO manda progresso.
//
// O LEDGER (por conta, em contas): vitoriasPvP[deus], sequenciaPvP[deus] (reset na derrota), paresPvP
// [par] (cadeias), feitos[deus] (o acumulador-assinatura), liberados[deus] (a missão cumprida).
//
// O FEITO é lido do log como a Fase 2 lê (§Fase 2): as fontes que o motor JÁ emite (dano/cura/dot/
// contador/orbe/queda/revive/efeito). Aqui contam ENTRE partidas, não dentro. Atribuição por VARREDURA
// do log seguindo o LADO ATIVO (turno.lado) e o ATOR (acao.origem/slot): o proativo (dano/cura/…) vai
// ao lado ativo; o reativo (reflexo/intercepta/absorve) ao lado que DEFENDE. Resolve o espelho (mesma
// key nos dois times): a key não basta, o lado-ativo-no-momento decide.

const fs = require('fs');
const path = require('path');
const FAM = require('../src/missoes_familias.js');
const contas = require('./contas.js');

const DOC = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'missoes.json'), 'utf8')); } catch (e) { return { versao: 0, gate: {}, iniciais: [], missoes: {} }; } })();
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

// -------- avaliar se a missão de um deus está CUMPRIDA, dado o ledger + a faixa da conta --------
function _faixaOrdemChave(chave, RANQ) { const fx = (RANQ && RANQ.faixas) || []; return fx.findIndex(f => f.chave === chave); }
// portão: a faixa da conta tem de estar em ordem >= a faixa-chave do portão (lida de data/ranqueado.json).
function _passaPortao(m, faixaChaveConta, RANQ) {
  if (!m.gate) return true;
  const need = _faixaOrdemChave(m.gate, RANQ), have = _faixaOrdemChave(faixaChaveConta, RANQ);
  return have >= 0 && need >= 0 && have >= need;
}

function missaoCumprida(m, led, ctx) {
  // 1) prereq: todos os prereqs liberados (ou iniciais). Odin: 2+ Nórdicos POSSUÍDOS.
  const temDeus = (k) => ctx.iniciais.includes(k) || (led.liberados && led.liberados[k]);
  if (m.especial && m.especial.nordicos) {
    if ((ctx.nordicosPossuidos || 0) < m.especial.nordicos) return false;
  } else {
    for (const p of (m.prereq || [])) if (!temDeus(p)) return false;
  }
  // 2) vitórias com um dos prereqs (ou, p/ S/SS sem prereq-deus, com o próprio caminho): usamos as
  //    vitórias acumuladas com QUALQUER prereq. Cadeia por par: paresPvP[par].
  const alvoVit = m.vitorias || 0;
  let vit = 0;
  if (m.chain && m.especial && m.especial.nordicos) vit = Math.max(0, ...Object.keys(led.vitoriasPvP || {}).filter(k => GODS[k] && GODS[k].faccao === 'Nórdica').map(k => led.vitoriasPvP[k] || 0));
  else if (m.prereq && m.prereq.length) vit = Math.max(0, ...m.prereq.map(p => (led.vitoriasPvP || {})[p] || 0));
  else vit = Math.max(0, ...Object.values(led.vitoriasPvP || {}));
  if (vit < alvoVit) return false;
  // 3) seguidas (SS): sequência com um prereq
  if (m.seguidas) { const seq = m.prereq && m.prereq.length ? Math.max(0, ...m.prereq.map(p => (led.sequenciaPvP || {})[p] || 0)) : Math.max(0, ...Object.values(led.sequenciaPvP || {})); if (seq < m.seguidas) return false; }
  // 4) portão de faixa
  if (!_passaPortao(m, ctx.faixaChave, ctx.RANQ)) return false;
  // 5) o FEITO: o acumulador da assinatura do deus atingiu o alvo
  const fe = m.feito; if (fe && fe.alvo != null) { if (((led.feitos || {})[m.key] || 0) < fe.alvo) return false; }
  return true;
}

// -------- REGISTRAR o fim de UMA partida PvP no ledger das duas contas (a ÚNICA porta que mexe no
// contador de missão, e é do SERVIDOR). Chamada por salas.finalizarPartida, UMA vez (flag no chamador).
// Lê o st AUTORITATIVO: vencedor por st.fim.lado (o cliente não diz). O cliente não manda progresso —
// nem por mensagem, nem por desconexão (abandono = derrota, o log fecha), nem por partida inacabada
// (sem st.fim, nem entra aqui). --------
function _garante(led) {
  led.vitoriasPvP = led.vitoriasPvP || {}; led.sequenciaPvP = led.sequenciaPvP || {};
  led.paresPvP = led.paresPvP || {}; led.feitos = led.feitos || {}; led.liberados = led.liberados || {};
  return led;
}
function _parKey(a, b) { return [a, b].sort().join('+'); }

function registrarPvP(sala) {
  const st = sala && sala.P && sala.P.st;
  if (!st || !st.fim) return null;                       // inacabada: nada
  const venc = (st.fim.lado === 0 || st.fim.lado === 1) ? st.fim.lado : null;
  const time = [sala.time0.slice(), sala.time1.slice()];
  const feitosPorLado = medir(st, sala.time0, sala.time1);
  const RANQ = contas.RANQ;

  const ids = [sala.participantes[0].contaId, sala.participantes[1].contaId];
  const projecoes = [];
  for (let L = 0; L < 2; L++) {
    const c = contas._contaPorId(ids[L]); if (!c) { projecoes.push(null); continue; }
    const led = _garante(contas._garantirMissoes(c));
    const meu = time[L], venceu = (venc === L), perdeu = (venc === (1 - L));
    // 1) vitórias / sequência (reset na derrota) por deus fielded
    for (const k of meu) {
      if (venceu) { led.vitoriasPvP[k] = (led.vitoriasPvP[k] || 0) + 1; led.sequenciaPvP[k] = (led.sequenciaPvP[k] || 0) + 1; }
      else if (perdeu) { led.sequenciaPvP[k] = 0; }        // empate técnico não zera nem soma
    }
    // 2) pares (cadeias) — só em vitória
    if (venceu) for (let i = 0; i < meu.length; i++) for (let j = i + 1; j < meu.length; j++) { const pk = _parKey(meu[i], meu[j]); led.paresPvP[pk] = (led.paresPvP[pk] || 0) + 1; }
    // 3) feitos: acumula a métrica-assinatura de CADA deus fielded (vitória OU derrota — o feito é
    //    esforço, não resultado). feito[k] soma o total do LADO na métrica da assinatura de k.
    for (const k of meu) { const fam = FAM.assinatura(GODS[k]); const v = (feitosPorLado[L] || {})[fam.metrica] || 0; if (v) led.feitos[k] = (led.feitos[k] || 0) + v; }
    projecoes.push({ id: c.id, venceu, feitos: feitosPorLado[L] || {} });
  }
  // 4) liberar as missões cumpridas (progressão) — reavaliação completa, idempotente
  for (let L = 0; L < 2; L++) { const c = contas._contaPorId(ids[L]); if (c) _liberarCumpridas(c, RANQ); }
  contas._salvar();
  return { vencedor: venc, projecoes };
}

// reavalia TODAS as missões da conta e marca liberadas as cumpridas (idempotente; progressão só cresce).
function _liberarCumpridas(c, RANQ) {
  const led = _garante(contas._garantirMissoes(c));
  const faixa = contas.faixaDe(c.ranque ? c.ranque.pontos : 0);
  const nordicosPossuidos = Object.keys((c.perfil && c.perfil.deuses) || {}).filter(k => GODS[k] && GODS[k].faccao === 'Nórdica').length;
  const ctx = { iniciais: DOC.iniciais, faixaChave: faixa.chave, RANQ, nordicosPossuidos };
  let mudou = true;
  while (mudou) {   // ponto-fixo: liberar um deus pode habilitar o prereq de outro na mesma partida
    mudou = false;
    for (const k of Object.keys(DOC.missoes)) {
      if (led.liberados[k]) continue;
      if (missaoCumprida(DOC.missoes[k], led, ctx)) { led.liberados[k] = true; mudou = true; }
    }
  }
  return led;
}

module.exports = { DOC, medir, missaoCumprida, registrarPvP, _liberarCumpridas, _passaPortao, GODS };

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
// §241 — as TRÊS TRAVAS: (1) RANQUE revela: a conta precisa ter atingido a faixaMin da missão. (2) CADEIA
// ordena: o companheiro temático possuído. (3) SEQUÊNCIA prova habilidade. E o CONTADOR COMEÇA NO
// DESBLOQUEIO (item 4): volume e sequência contam a PARTIR da base guardada em led.desbloqueio[deus] —
// vitórias anteriores ao desbloqueio NÃO contam. ctx.pontos = c.ranque.pontos (o servidor classifica).
function _desbloqueada(m, led, ctx) {
  if (m.companheiro && !ctx.possui(m.companheiro)) return false;          // cadeia
  if ((ctx.pontos || 0) < (m.faixaMin || 0)) return false;               // ranque
  return true;
}
function missaoCumprida(m, led, ctx) {
  if (!_desbloqueada(m, led, ctx)) return false;
  const base = (led.desbloqueio || {})[m.deus] || { volBase: 0, seqBase: 0 };
  // 2) VOLUME (desde o desbloqueio): vitórias com o PANTEÃO exigido, menos o que já havia ao desbloquear.
  const vol = ((led.vitoriasPanteaoPvP || {})[m.panteao] || 0) - (base.volBase || 0);
  if (vol < (m.vitoriasPanteao || 0)) return false;
  // 3) SEQUÊNCIA (desde o desbloqueio): toda missão tem >=1; alvo = companheiro OU panteão (§241).
  const req = _seguidasReq(m);
  if (req > 0) {
    const cur = _seqAtual(m, led);
    const seqBase = (cur < (base.seqBase || 0)) ? 0 : (base.seqBase || 0);   // reset após o desbloqueio conta do zero
    if ((cur - seqBase) < req) return false;
  }
  return true;
}
// §241 — grava a BASE do contador quando a missão DESTRAVA (companheiro + ranque), e normaliza a base da
// sequência se houve derrota (reset) depois do desbloqueio. Idempotente: só grava a base uma vez.
function _reavaliarDesbloqueios(led, ctx, quando) {
  for (const k of Object.keys(DOC.missoes)) {
    const m = DOC.missoes[k];
    if (!_desbloqueada(m, led, ctx)) continue;
    if (!led.desbloqueio[k]) {
      led.desbloqueio[k] = { em: quando, volBase: (led.vitoriasPanteaoPvP[m.panteao] || 0), seqBase: _seqAtual(m, led) };
    } else {
      const cur = _seqAtual(m, led);
      if (cur < (led.desbloqueio[k].seqBase || 0)) led.desbloqueio[k].seqBase = 0;   // um reset zera a base: a nova sequência conta inteira
    }
  }
}

// -------- REGISTRAR o fim de UMA partida PvP no ledger das duas contas (a ÚNICA porta que mexe no
// contador de missão, e é do SERVIDOR). Chamada por salas.finalizarPartida, UMA vez (flag no chamador).
// Lê o st AUTORITATIVO: vencedor por st.fim.lado (o cliente não diz). O cliente não manda progresso —
// nem por mensagem, nem por desconexão (abandono = derrota, o log fecha), nem por partida inacabada
// (sem st.fim, nem entra aqui). --------
function _garante(led) {
  led.vitoriasPanteaoPvP = led.vitoriasPanteaoPvP || {};
  led.vitoriasPvP = led.vitoriasPvP || {}; led.sequenciaPvP = led.sequenciaPvP || {};
  led.sequenciaPanteaoPvP = led.sequenciaPanteaoPvP || {};   // §241: sequência por PANTEÃO (missões sem companheiro)
  led.desbloqueio = led.desbloqueio || {};                   // §241: {deus:{em,volBase,seqBase}} — contador desde o desbloqueio
  led.paresPvP = led.paresPvP || {}; led.feitos = led.feitos || {}; led.liberados = led.liberados || {};
  return led;
}
// §241 — o ALVO da sequência de uma missão: o companheiro, ou (sem companheiro, as 8 portas) o PANTEÃO.
function _alvoSeq(m) { return m.seguidasAlvo || (m.companheiro ? { tipo: 'companheiro', chave: m.companheiro } : { tipo: 'panteao', chave: m.panteao }); }
function _seqAtual(m, led) { const a = _alvoSeq(m); return (a.tipo === 'companheiro' ? (led.sequenciaPvP[a.chave] || 0) : (led.sequenciaPanteaoPvP[a.chave] || 0)); }
function _seguidasReq(m) { return (typeof m.seguidas === 'number') ? m.seguidas : (m.seguidasCompanheiro || 0); }
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
    // §241: grava as bases de desbloqueio ANTES de creditar esta partida — assim uma missão já destravada
    // (companheiro possuído + ranque atingido, ex.: as imediatas na Suplicante) conta ESTA vitória, e a base
    // fica no estado PRÉ-partida (o ranque desta partida só é aplicado DEPOIS, em salas.finalizarPartida).
    {
      const deuses = (c.perfil && c.perfil.deuses) || {};
      const ctxPre = { iniciais: DOC.iniciais, possui: k => DOC.iniciais.includes(k) || !!deuses[k], pontos: (c.ranque && c.ranque.pontos) || 0 };
      _reavaliarDesbloqueios(led, ctxPre, Date.now());
    }
    const meu = time[L], venceu = (venc === L), perdeu = (venc === (1 - L));
    // 1) VOLUME: em VITÓRIA, conta uma vitória por CADA panteão presente no time (o requisito é
    //    "vitórias com o panteão"). vitórias/sequência por deus também (sequência = "seguidas").
    const pantsMeu = new Set(meu.map(_panteaoDe).filter(Boolean));
    for (const k of meu) {
      if (venceu) { led.vitoriasPvP[k] = (led.vitoriasPvP[k] || 0) + 1; led.sequenciaPvP[k] = (led.sequenciaPvP[k] || 0) + 1; }
      else if (perdeu) { led.sequenciaPvP[k] = 0; }        // empate técnico não zera nem soma
    }
    if (venceu) {
      for (const p of pantsMeu) { led.vitoriasPanteaoPvP[p] = (led.vitoriasPanteaoPvP[p] || 0) + 1; led.sequenciaPanteaoPvP[p] = (led.sequenciaPanteaoPvP[p] || 0) + 1; }
    } else if (perdeu) {
      for (const p of pantsMeu) led.sequenciaPanteaoPvP[p] = 0;   // §241: derrota zera a sequência do panteão
    }
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
  const pontos = (c.ranque && typeof c.ranque.pontos === 'number') ? c.ranque.pontos : 0;   // §241: RANQUE revela
  const ctx = { iniciais: DOC.iniciais, possui, pontos };
  const quando = typeof agora === 'number' ? agora : Date.now();
  // §241: grava as bases de desbloqueio (o contador começa aqui) ANTES de avaliar conclusão.
  _reavaliarDesbloqueios(led, ctx, quando);
  let mudou = true;
  while (mudou) {
    mudou = false;
    for (const k of Object.keys(DOC.missoes)) {
      if (deuses[k]) continue;   // já possuído (gacha/missão anterior): nada a conceder
      if (missaoCumprida(DOC.missoes[k], led, ctx)) {
        deuses[k] = { copias: 1, favorito: false, obtidoEm: quando, viaMissao: true };   // CONCEDE o deus
        led.liberados[k] = true;                                                          // histórico da missão
        mudou = true;
        _reavaliarDesbloqueios(led, ctx, quando);   // conceder um deus pode DESTRAVAR o próximo (base = agora)
      }
    }
  }
  return led;
}

module.exports = { DOC, medir, missaoCumprida, registrarPvP, _liberarCumpridas, _reavaliarDesbloqueios, _garante, GODS };

'use strict';
// FASE 6 / §313-§314 — O PROGRESSO DAS PROVAÇÕES, no SERVIDOR (ao lado do ranque). Conta SÓ PvP (§228).
// Aplicado UMA vez no fim da partida PvP, lido do st AUTORITATIVO — o cliente NÃO manda progresso.
//
// O REQUISITO (§313): cada Provação é uma LISTA DE OBJETIVOS (data/missoes.json, campo `objetivos`).
// UMA Provação ATIVA por vez (§314, slots em data/provacoes_slots.json → DOC.slotsGratis). SÓ a ativa
// conta; a que sai fica PAUSADA (progresso e sequências CONGELAM). Progresso por objetivo, "desde a
// ativação", em led.progresso[deus].obj[i]. Cumprir a ativa CONCEDE o deus e ESVAZIA o slot.
//
// O LEDGER (por conta, em contas.missoes): { ativa, progresso:{deus:{ativadaEm,obj:[…]}}, liberados }.
// Os contadores compartilhados do §241 (vitoriasPanteaoPvP/sequenciaPvP/…) saíram — sem consumidor
// após os objetivos (§95/§303). A regra de contagem está em _avancar (abaixo).
//
// O FEITO (medir) segue lido do log como a Fase 2 lê — serve à MAESTRIA (§230), fora do gate de Provação.
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

// ============================================================================
// §313/§314 — O MODELO DE OBJETIVOS, UMA PROVAÇÃO ATIVA POR VEZ.
// Cada Provação é uma LISTA DE OBJETIVOS (data/missoes.json, campo `objetivos`). Progresso POR OBJETIVO,
// gravado na conta em led.progresso[deus].obj[i], contado "desde a ATIVAÇÃO". SÓ a Provação ATIVA conta.
// REGRA DE CONTAGEM (§314, decisão do dono):
//   - Uma VITÓRIA com a ativa avança TODOS os objetivos dela que a partida cumpre (sobreposição DENTRO da
//     mesma Provação é intencional; ENTRE Provações não existe, porque só a ativa conta).
//   - Sequências ("s","sp","c"): uma vitória que NÃO cumpre não soma nem zera; QUALQUER derrota com a ativa
//     zera TODAS as sequências dela. Abandono = derrota (chega como st.fim.lado do oponente).
//   - Volume ("v","j","p") e amplitude ("a"): só crescem em vitória; derrota não mexe. Empate não faz nada.
//   - PAUSADA (led.ativa !== deus): nada conta nem zera; o progresso (e as sequências) CONGELA.
// ============================================================================

// o panteão de MEMBRESIA de uma key (facção real normalizada) — do doc gerado, com fallback local.
function _panteaoDe(k) { return (DOC.panteaoDe && DOC.panteaoDe[k]) || (GODS[k] && (GODS[k].faccao === 'Olímpica' ? 'Grega' : GODS[k].faccao)) || null; }
// POSSE (§230): o jogador TEM o deus (inicial, gacha ou Provação já conquistada).
function _possui(c, k) { const d = (c.perfil && c.perfil.deuses) || {}; return DOC.iniciais.includes(k) || !!d[k]; }

// estado inicial de UM objetivo (zerado) — a forma espelha o tipo.
function _objZero(o) {
  if (o.tipo === 's' || o.tipo === 'sp') return { seq: 0 };
  if (o.tipo === 'c') return { seqA: 0, seqB: 0 };
  if (o.tipo === 'a') return { pant: [] };
  return { vol: 0 };   // v, j, p
}
function _progInicial(deus, quando) { return { ativadaEm: quando, obj: (DOC.missoes[deus].objetivos || []).map(_objZero) }; }

// UM objetivo está cumprido dado o seu estado?
function _objCumprido(o, e) {
  if (o.tipo === 's' || o.tipo === 'sp') return (e.seq || 0) >= o.k;
  if (o.tipo === 'c') return (e.seqA || 0) >= o.k && (e.seqB || 0) >= o.k;
  if (o.tipo === 'a') return ((e.pant || []).length) >= o.n;
  return (e.vol || 0) >= o.n;   // v, j, p
}
function _provacaoCumprida(deus, prog) {
  const objs = DOC.missoes[deus].objetivos || [];
  return objs.every((o, i) => _objCumprido(o, (prog.obj || [])[i] || _objZero(o)));
}

// AVANÇA o progresso da ATIVA após uma partida. meu = o time (3 keys) DESTE lado; venceu/perdeu do lado.
function _avancar(deus, prog, meu, venceu, perdeu) {
  const objs = DOC.missoes[deus].objetivos || [];
  const time = new Set(meu);
  const temPanteao = (P) => meu.some(g => _panteaoDe(g) === P);
  const pantsMeu = [...new Set(meu.map(_panteaoDe).filter(Boolean))];
  objs.forEach((o, i) => {
    const e = prog.obj[i] || (prog.obj[i] = _objZero(o));
    switch (o.tipo) {
      case 's':  if (venceu) { if (time.has(o.alvo)) e.seq++; } else if (perdeu) e.seq = 0; break;
      case 'sp': if (venceu) { if (temPanteao(o.panteao)) e.seq++; } else if (perdeu) e.seq = 0; break;
      case 'c':  if (venceu) { if (time.has(o.lista[0])) e.seqA++; if (time.has(o.lista[1])) e.seqB++; } else if (perdeu) { e.seqA = 0; e.seqB = 0; } break;
      case 'v':  if (venceu && o.lista.some(g => time.has(g))) e.vol = Math.min(o.n, (e.vol || 0) + 1); break;
      case 'j':  if (venceu && o.lista.every(g => time.has(g))) e.vol = Math.min(o.n, (e.vol || 0) + 1); break;
      case 'p':  if (venceu && temPanteao(o.panteao)) e.vol = Math.min(o.n, (e.vol || 0) + 1); break;
      case 'a':  if (venceu) { const novo = pantsMeu.find(P => !(e.pant || []).includes(P)); if (novo && (e.pant || []).length < o.n) e.pant.push(novo); } break;
    }
  });
}

// CONCEDE o deus (LIBERAR = CONCEDER, §230): entra em perfil.deuses; marca o histórico.
function _conceder(c, deus, quando) {
  if (!c.perfil) c.perfil = {};
  const d = c.perfil.deuses = c.perfil.deuses || {};
  if (!d[deus]) d[deus] = { copias: 1, favorito: false, obtidoEm: quando, viaMissao: true };
  const led = contas._garantirMissoes(c);
  led.liberados[deus] = true;
}

// DISPONÍVEL PARA ATIVAR (§314): ranque atingido + os NOMES OBRIGATÓRIOS possuídos (o de "s", "j" e "c",
// e ≥1 de cada lista "v"). "p"/"sp"/"a" NÃO travam a ativação (grinda-se depois). Retorna o que falta.
function disponivelParaAtivar(c, deus) {
  const m = DOC.missoes[deus];
  if (!m) return { ok: false, codigo: 'provacao_desconhecida', erro: 'Provação desconhecida' };
  const pontos = (c.ranque && typeof c.ranque.pontos === 'number') ? c.ranque.pontos : 0;
  const rankOk = pontos >= (m.faixaMin || 0);
  const faltamNomes = [];
  for (const o of (m.objetivos || [])) {
    if (o.tipo === 's') { if (!_possui(c, o.alvo)) faltamNomes.push(o.alvo); }
    else if (o.tipo === 'j' || o.tipo === 'c') { for (const g of o.lista) if (!_possui(c, g)) faltamNomes.push(g); }
    else if (o.tipo === 'v') { if (!o.lista.some(g => _possui(c, g))) faltamNomes.push(o.lista[0]); }   // ≥1 da lista
  }
  const ok = rankOk && faltamNomes.length === 0;
  return { ok, rankOk, faixaMin: m.faixaMin || 0, faixaNome: m.faixaNome, faltamNomes,
    codigo: ok ? undefined : (!rankOk ? 'ranque' : 'nomes'),
    erro: ok ? undefined : (!rankOk ? `exige ranque ${m.faixaNome}` : `falta possuir: ${[...new Set(faltamNomes)].join(', ')}`) };
}

// ESTADO de uma Provação para a conta: conquistada · ativa · pausada · disponivel · travada.
function estadoProvacao(c, deus) {
  if (_possui(c, deus)) return 'conquistada';
  const led = contas._garantirMissoes(c);
  if (led.ativa === deus) return 'ativa';
  if (led.progresso[deus]) return 'pausada';
  return disponivelParaAtivar(c, deus).ok ? 'disponivel' : 'travada';
}

// ATIVAR (ou TROCAR): põe `deus` na ÚNICA vaga ativa. A que sai fica PAUSADA (o progresso guardado
// CONGELA, não zera). Retomar uma pausada continua de onde parou (o progresso já existe). Servidor
// autoritativo: valida disponibilidade e posse; o cliente só PEDE. Idempotente se já é a ativa.
function ativarProvacao(c, deus, agora) {
  const led = contas._garantirMissoes(c);
  const m = DOC.missoes[deus];
  if (!m) return { ok: false, codigo: 'provacao_desconhecida', erro: 'Provação desconhecida' };
  if (_possui(c, deus)) return { ok: false, codigo: 'ja_conquistada', erro: 'você já conquistou este deus' };
  const disp = disponivelParaAtivar(c, deus);
  if (!disp.ok && led.ativa !== deus && !led.progresso[deus]) return { ok: false, codigo: disp.codigo, erro: disp.erro };
  const quando = typeof agora === 'number' ? agora : Date.now();
  led.ativa = deus;                                        // a anterior vira PAUSADA só por não ser mais a ativa
  if (!led.progresso[deus]) led.progresso[deus] = _progInicial(deus, quando);   // fresca; se pausada, retoma o guardado
  contas._salvar();
  return { ok: true, ativa: deus };
}

// -------- REGISTRAR o fim de UMA partida PvP (a ÚNICA porta que mexe no progresso, e é do SERVIDOR).
// Chamada por salas.finalizarPartida, UMA vez. Lê o st AUTORITATIVO: vencedor por st.fim.lado. SÓ a
// Provação ATIVA de cada conta avança/zera; as pausadas e as sem-ativa não são tocadas. --------
function registrarPvP(sala) {
  const st = sala && sala.P && sala.P.st;
  if (!st || !st.fim) return null;                       // inacabada: nada
  const venc = (st.fim.lado === 0 || st.fim.lado === 1) ? st.fim.lado : null;
  const time = [sala.time0.slice(), sala.time1.slice()];
  const ids = [sala.participantes[0].contaId, sala.participantes[1].contaId];
  const quando = Date.now();
  const projecoes = [];
  for (let L = 0; L < 2; L++) {
    const c = contas._contaPorId(ids[L]); if (!c) { projecoes.push(null); continue; }
    const led = contas._garantirMissoes(c);
    const venceu = (venc === L), perdeu = (venc === (1 - L));
    let conquistou = null;
    if (led.ativa && led.progresso[led.ativa] && !_possui(c, led.ativa)) {   // SÓ a ativa conta
      const deus = led.ativa;
      _avancar(deus, led.progresso[deus], time[L], venceu, perdeu);
      if (_provacaoCumprida(deus, led.progresso[deus])) {                    // cumpriu → concede e ESVAZIA o slot
        _conceder(c, deus, quando);
        delete led.progresso[deus];
        led.ativa = null;                                                    // não ativa outra sozinho (§314)
        conquistou = deus;
      }
    }
    projecoes.push({ id: c.id, venceu, conquistou });
  }
  contas._salvar();
  return { vencedor: venc, projecoes };
}

module.exports = { DOC, medir, registrarPvP, ativarProvacao, disponivelParaAtivar, estadoProvacao,
  _provacaoCumprida, _avancar, _objCumprido, _progInicial, _possui, _panteaoDe, GODS };

// server/pve.js — §318 F2 E2: PvE PAGO POR REPLAY. A economia é do SERVIDOR.
//
// O cliente NÃO credita mais recompensa de PvE. Ele GRAVA a partida (a montagem do modo + as ações do
// JOGADOR, na ordem) e, ao vencer, ENVIA o replay. O servidor RE-SIMULA com o MESMO motor determinístico
// (src/engine.js, importado — uma fonte de verdade) e só credita se o resultado bater. Duas garantias:
//   1. A DIFICULDADE é do DADO: os inimigos, a semente e a inflação de chefe vêm de server/dados-pve.js
//      (os mesmos JSON da build), NUNCA do envelope. Um forjador não declara inimigos fracos.
//   2. A IA é do SERVIDOR: no turno da IA o servidor roda a MESMA ia.js determinística ('normal') — o
//      cliente só manda as ações DELE. Uma sequência de jogador que não vence de verdade não paga.
//
// Idempotência (fila offline reenvia): cada replay traz um `idPartida`; um id já creditado não paga de
// novo. Portões de recompensa (1ª vez, 1×/semana, teto diário/por-corrida) vivem em conta.pve — NUNCA no
// perfil (que o cliente escreve), então não se forjam.
const path = require('path');
const HOST = require('./motor-host');            // { E, ia, PROV, aplicar, ... } — já põe o motor no globalThis
const E = HOST.E, ia = HOST.ia, PROV = HOST.PROV;
const DOM = require(path.join(__dirname, '..', 'src', 'dominios.js'));   // usa novoEstado do global (posto por motor-host)
const DADOS = require('./dados-pve.js');
const ECON = DADOS.ECONOMIA;

const MODOS = ['campanha', 'semanal', 'sandbox', 'desafio', 'dominio'];
const CAP_CREDITOS = 500;                          // anel de idPartida (dedupe de reenvio da fila offline)
const _clone = x => JSON.parse(JSON.stringify(x));

// ---- RELÓGIO DO SERVIDOR: data (AAAA-MM-DD) e semana ISO — os mesmos algoritmos do cliente (home.js) ----
function _diaISO(ms) { return new Date(ms).toISOString().slice(0, 10); }
function _quintaISO(ms) {
  const t = new Date(ms);
  const u = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()));
  const dia = u.getUTCDay() || 7;
  u.setUTCDate(u.getUTCDate() + 4 - dia);
  return u;
}
function _semanaISO(ms) { const u = _quintaISO(ms); const ini = new Date(Date.UTC(u.getUTCFullYear(), 0, 1)); return Math.ceil((((u - ini) / 86400000) + 1) / 7); }
function _anoISO(ms) { return _quintaISO(ms).getUTCFullYear(); }
function _chaveSemana(ms) { return _anoISO(ms) + 'W' + _semanaISO(ms); }

// ---- ledger do servidor (nasce/migra vazio; nunca no perfil) ----
function garantirPve(conta) {
  if (!conta.pve || typeof conta.pve !== 'object') conta.pve = {};
  const p = conta.pve;
  if (!Array.isArray(p.creditos)) p.creditos = [];
  if (!Array.isArray(p.campanhaPagos)) p.campanhaPagos = [];
  if (!Array.isArray(p.semanalPagos)) p.semanalPagos = [];
  if (!Array.isArray(p.desafioPagos)) p.desafioPagos = [];
  if (!p.essenciaDia || typeof p.essenciaDia !== 'object') p.essenciaDia = { dia: '', total: 0 };
  if (!p.dominioRun || typeof p.dominioRun !== 'object') p.dominioRun = { id: '', essencia: 0 };
  if (!p.sandbox || typeof p.sandbox !== 'object') p.sandbox = { dia: '', vitorias: 0 };
  if (!p.pvpDia || typeof p.pvpDia !== 'object') p.pvpDia = { dia: '', vitorias: 0 };
  return p;
}

function _possui(conta, key) { return !!(conta.perfil && conta.perfil.deuses && conta.perfil.deuses[key]); }
function _timeValido(conta, time) {
  if (!Array.isArray(time) || time.length !== 3) return false;
  if (new Set(time).size !== 3) return false;
  return time.every(k => typeof k === 'string' && _possui(conta, k));
}

// ============================================================
// RE-SIMULAÇÃO (aprovação B): o servidor consome as ações do JOGADOR nos turnos dele e RODA a IA nos
// turnos dela. Determinístico: mesma montagem + mesmas ações do jogador → mesmo resultado que o cliente viu.
// ============================================================
function _dispatch(st, op) {
  if (!op || typeof op !== 'object') return { ok: false, erro: 'op vazia' };
  switch (op.tipo) {
    case 'fim': E.fimTurno(st); return { ok: true };
    case 'agir': return E.agir(st, op.uid, op.slot, op.alvos || [], op.escolhas || null, op.modo || null);
    case 'converter': { const r = E.converter(st, op.para); return r || { ok: false, erro: 'converter recusou' }; }
    case 'alocarLivre': { const r = E.alocarLivre(st, op.plano || {}); return r || { ok: false, erro: 'alocarLivre recusou' }; }
    default: return { ok: false, erro: 'op desconhecida: ' + op.tipo };
  }
}

// re-simula. montarFn() → st inicial. jogadorOps = ações do JOGADOR (agir/converter/alocarLivre/fim), na
// ordem. ladoJog = lado do jogador (0). Devolve { ok, venceu, turnos, motivo? }.
function _reproduzir(montarFn, jogadorOps, ladoJog) {
  let st;
  try { st = montarFn(); } catch (e) { return { ok: false, motivo: 'montagem_falhou: ' + (e && e.message) }; }
  if (!st) return { ok: false, motivo: 'montagem_nula' };
  const iaLado = 1 - ladoJog;
  let i = 0, guarda = 0;
  while (!st.fim && guarda++ < 6000) {
    if (st.ativo === ladoJog) {
      if (i >= jogadorOps.length) return { ok: false, motivo: 'ops_incompletos' };   // o jogador não terminou a partida
      const op = jogadorOps[i++];
      if (op && op.tipo === 'fim') { E.fimTurno(st); }
      else { const r = _dispatch(st, op); if (!r || !r.ok) return { ok: false, motivo: 'op_jogador_ilegal: ' + (op && op.tipo) + ' · ' + ((r && r.erro) || '') }; }
    } else {
      let p = 0, mv;
      while (!st.fim && (mv = ia.iaProximaAcao(st, 'normal')) && p++ < 16) {
        E.agir(st, mv.uid, mv.slot, mv.alvos || [], mv.escolhas || null, mv.modo || null);
      }
      if (!st.fim) E.fimTurno(st);
    }
  }
  if (!st.fim) return { ok: false, motivo: 'sem_fim' };
  // sobra de ações do jogador depois do fim = replay forjado/inconsistente
  if (i < jogadorOps.length) return { ok: false, motivo: 'ops_apos_fim' };
  const venceu = !!(st.fim.resultado === 'vitoria' && st.fim.lado === ladoJog);
  return { ok: true, venceu, turnos: st.turno };
}

// ============================================================
// MONTAGEM AUTORITATIVA por modo. Devolve { montar, erro?, chave, gate } — chave = identidade do modo
// (atoId/semana/desafioId/...) para os portões. Nenhuma dificuldade vem do cliente.
// ============================================================
function _montarCampanha(conta, r) {
  const ato = DADOS.campanhaAto(r.atoId);
  if (!ato) return { erro: 'campanha_ato_desconhecido' };
  // resolve o time: fixos vêm do DADO; livres (ou aliados null) vêm do cliente, validados por posse.
  let aliados;
  if (ato.aliados == null) {
    aliados = r.aliados;
    if (!_timeValido(conta, aliados)) return { erro: 'time_invalido' };
  } else {
    const cli = Array.isArray(r.aliados) ? r.aliados : [];
    aliados = ato.aliados.map((slot, idx) => {
      if (typeof slot === 'string') return slot;                       // teaching: fixo
      if (slot && slot.travado) return slot.deus;                      // travado: fixo
      return (slot && cli[idx]) || (slot && slot.deus);                // livre: do cliente
    });
    // todo aliado tem de ser possuído (os iniciais/starters sempre são)
    for (const k of aliados) if (!_possui(conta, k)) return { erro: 'aliado_nao_possuido: ' + k };
    if (new Set(aliados).size !== aliados.length) return { erro: 'time_repetido' };
  }
  const prov = { aliados, inimigos: ato.inimigos, montar: ato.montar || {} };
  return { montar: () => PROV.montarProvacao(prov), chave: r.atoId, recompensaKey: ato.recompensa };
}

function _montarSemanal(conta, r, agora) {
  const pool = (DADOS.SEMANAIS && DADOS.SEMANAIS.puzzles) || [];
  if (!pool.length) return { erro: 'sem_semanais' };
  const wk = _semanaISO(agora), ano = _anoISO(agora);
  const idx = (((wk + ano * 7) % pool.length) + pool.length) % pool.length;
  const raw = pool[idx];
  const prov = { aliados: raw.aliados, inimigos: raw.inimigos, montar: raw.montar || {} };
  return { montar: () => PROV.montarProvacao(prov), chave: ano + 'W' + wk };
}

function _montarDesafio(conta, r) {
  const dsf = DADOS.desafioComp(r.desafioId);
  if (!dsf) return { erro: 'desafio_desconhecido' };
  if (!_timeValido(conta, r.aliados)) return { erro: 'time_invalido' };   // §318: posse validada; a REGRA de composição segue no cliente (recompensa é leve/tetada)
  const prov = { aliados: r.aliados, inimigos: dsf.inimigos, montar: dsf.montar || {} };
  return { montar: () => PROV.montarProvacao(prov), chave: r.desafioId };
}

function _montarSandbox(conta, r) {
  const pT = r.aliados, eT = r.inimigos;
  if (!_timeValido(conta, pT)) return { erro: 'time_invalido' };         // o jogador tem de POSSUIR o próprio time
  if (!Array.isArray(eT) || eT.length < 1 || eT.length > 3) return { erro: 'inimigos_invalidos' };
  const seed = (typeof r.seed === 'number') ? r.seed : 1;
  const comeca = (r.comeca === 1) ? 1 : 0;
  const energia = (ECON && ECON.energia) || null;                        // sandbox usa a energia da economia (selecao.js)
  return { montar: () => E.novoEstado(pT, eT, seed, comeca, energia), chave: 'sandbox' };
}

function _montarDominio(conta, r) {
  const lad = DADOS.dominioLadder(r.cultura);
  if (!lad) return { erro: 'dominio_cultura_desconhecida' };
  const semanaIdx = (r.run && typeof r.run.semanaIdx === 'number') ? r.run.semanaIdx : 0;
  const escada = DOM.domEscadaSemana(lad, semanaIdx);
  if (!escada) return { erro: 'dominio_semana_invalida' };
  const totalNiveis = (escada.niveis || []).length;
  const nivel = r.run && r.run.nivel;
  if (!(nivel >= 1 && nivel <= totalNiveis)) return { erro: 'dominio_nivel_invalido' };
  // saneia a corrida que o cliente traz (bounds — só pode PIORAR, nunca criar vantagem além do teto)
  const run = {
    nivel,
    bonus: Math.max(0, Math.min(DOM.DOM_TETO_BONUS, (r.run && r.run.bonus) || 0)),
    vida: (r.run && Array.isArray(r.run.vida)) ? r.run.vida.slice(0, 3).map(c => ({ hp: Math.max(0, (c && c.hp) || 0), vivo: !!(c && c.vivo) })) : [{ hp: 999, vivo: true }, { hp: 999, vivo: true }, { hp: 999, vivo: true }],
    reviveGasto: (r.run && Array.isArray(r.run.reviveGasto)) ? r.run.reviveGasto.filter(k => typeof k === 'string') : [],
  };
  const seed = (nivel * 7919) >>> 0 || 1;
  return { montar: () => DOM.domMontarBatalha(run, escada, { seed }), chave: (r.runId || '') + ':' + nivel, runId: r.runId || '', nivel };
}

function _montarPara(conta, r, agora) {
  switch (r.modo) {
    case 'campanha': return _montarCampanha(conta, r);
    case 'semanal': return _montarSemanal(conta, r, agora);
    case 'desafio': return _montarDesafio(conta, r);
    case 'sandbox': return _montarSandbox(conta, r);
    case 'dominio': return _montarDominio(conta, r);
    default: return { erro: 'modo_desconhecido' };
  }
}

// ---- só verifica (não credita). Útil p/ teste/medição. ----
function verificar(conta, r, agora) {
  if (!r || MODOS.indexOf(r.modo) < 0) return { ok: false, motivo: 'modo_invalido' };
  if (!Array.isArray(r.ops)) return { ok: false, motivo: 'ops_ausentes' };
  const m = _montarPara(conta, r, agora);
  if (m.erro) return { ok: false, motivo: m.erro };
  const res = _reproduzir(m.montar, r.ops, 0);
  return Object.assign({ chave: m.chave, recompensaKey: m.recompensaKey, runId: m.runId, nivel: m.nivel }, res);
}

// ---- crédito de Essência sujeito ao TETO DIÁRIO (produtores repetíveis). Devolve o quanto CABE. ----
function _essenciaCapada(pve, valor, dia) {
  if (pve.essenciaDia.dia !== dia) pve.essenciaDia = { dia, total: 0 };
  const teto = (ECON.tetoDiarioEssencia && ECON.tetoDiarioEssencia.valor) || 0;
  const cabe = Math.max(0, teto - pve.essenciaDia.total);
  const dar = Math.min(valor, cabe);
  pve.essenciaDia.total += dar;
  return dar;
}
function _addMoeda(conta, moeda, v) {
  if (v <= 0) return 0;
  conta.perfil.moedas = Object.assign({ gema: 0, essencia: 0 }, conta.perfil.moedas);
  conta.perfil.moedas[moeda] = (conta.perfil.moedas[moeda] || 0) + v;
  return v;
}

// ============================================================
// CREDITAR: verifica + aplica a recompensa do modo com todos os portões. Muta conta (perfil.moedas + pve).
// Devolve { ok, creditou, motivo?, modo, recompensa:{gema,essencia}, saldo:{gema,essencia} }.
// ============================================================
function creditar(conta, r, agora) {
  agora = (typeof agora === 'number') ? agora : Date.now();
  const pve = garantirPve(conta);
  const dia = _diaISO(agora);
  const nada = extra => Object.assign({ ok: true, creditou: false, modo: r && r.modo, recompensa: { gema: 0, essencia: 0 }, saldo: _saldo(conta) }, extra || {});

  const v = verificar(conta, r, agora);
  if (!v.ok) return { ok: false, creditou: false, motivo: v.motivo, modo: r && r.modo, saldo: _saldo(conta) };
  if (!v.venceu) return nada({ motivo: 'derrota' });

  // dedupe de reenvio (fila offline): id já creditado não paga de novo
  const id = r.idPartida;
  if (id && pve.creditos.indexOf(id) >= 0) return nada({ motivo: 'duplicado' });

  let gema = 0, essencia = 0, motivo = '';
  if (r.modo === 'campanha') {
    if (pve.campanhaPagos.indexOf(v.chave) >= 0) { motivo = 'ja_pago'; }
    else {
      const rec = (ECON.campanha && ECON.campanha.recompensas && ECON.campanha.recompensas[v.recompensaKey]) || {};
      gema = _addMoeda(conta, 'gema', rec.gema || 0);
      essencia = _addMoeda(conta, 'essencia', rec.essencia || 0);   // 1ª vez, finita — NÃO entra no teto diário
      pve.campanhaPagos.push(v.chave);
    }
  } else if (r.modo === 'semanal') {
    if (pve.semanalPagos.indexOf(v.chave) >= 0) { motivo = 'ja_pago_semana'; }
    else {
      const rec = (ECON.semanal && ECON.semanal.recompensa) || {};
      gema = _addMoeda(conta, 'gema', rec.gema || 0);
      pve.semanalPagos.push(v.chave);
      if (pve.semanalPagos.length > 60) pve.semanalPagos.shift();
    }
  } else if (r.modo === 'desafio') {
    const primeiro = pve.desafioPagos.indexOf(v.chave) < 0;
    if (primeiro) {
      const rec = (ECON.desafios && ECON.desafios.recompensas && ECON.desafios.recompensas.padrao) || {};
      essencia = _addMoeda(conta, 'essencia', rec.essencia || 0);     // 1ª vez, finita — sem teto
      pve.desafioPagos.push(v.chave);
    } else {
      const rec = (ECON.desafios && ECON.desafios.recompensas && ECON.desafios.recompensas.repeticao) || {};
      essencia = _addMoeda(conta, 'essencia', _essenciaCapada(pve, rec.essencia || 0, dia));   // repetido: TETADO
    }
  } else if (r.modo === 'dominio') {
    // teto POR CORRIDA (reseta quando o runId muda) + teto DIÁRIO
    if (pve.dominioRun.id !== (v.runId || '')) pve.dominioRun = { id: v.runId || '', essencia: 0 };
    const tetoRun = (ECON.dominios && ECON.dominios.tetoRunEssencia) || 0;
    const cabeRun = Math.max(0, tetoRun - pve.dominioRun.essencia);
    const rec = (ECON.dominios && ECON.dominios.recompensas && ECON.dominios.recompensas.porNivel) || {};
    const pedido = Math.min(rec.essencia || 0, cabeRun);
    const dado = _essenciaCapada(pve, pedido, dia);
    essencia = _addMoeda(conta, 'essencia', dado);
    pve.dominioRun.essencia += dado;
  } else if (r.modo === 'sandbox') {
    if (pve.sandbox.dia !== dia) pve.sandbox = { dia, vitorias: 0 };
    const teto = (ECON.sandbox && ECON.sandbox.tetoDia) || 0;
    if (pve.sandbox.vitorias >= teto) { motivo = 'teto_sandbox'; }
    else {
      const rec = (ECON.sandbox && ECON.sandbox.recompensas && ECON.sandbox.recompensas.vitoria) || {};
      gema = _addMoeda(conta, 'gema', rec.gema || 0);
      pve.sandbox.vitorias += 1;
    }
  }

  const creditou = (gema > 0 || essencia > 0);
  if (creditou && id) { pve.creditos.push(id); if (pve.creditos.length > CAP_CREDITOS) pve.creditos.shift(); }
  return { ok: true, creditou, motivo: creditou ? '' : (motivo || 'sem_recompensa'), modo: r.modo, recompensa: { gema, essencia }, saldo: _saldo(conta) };
}

function _saldo(conta) {
  const m = (conta.perfil && conta.perfil.moedas) || {};
  return { gema: m.gema || 0, essencia: m.essencia || 0 };
}

// ---- §318 F2 — RENDA DE GEMA por VITÓRIA de PvP (ranqueado e casual). Chamado no finalizarPartida do
// servidor (o vencedor e o nº de rodadas são do st autoritativo; o cliente não informa nada). Teto diário
// no relógio do SERVIDOR + piso de rodadas (anti-farm). Muta conta.perfil.moedas + conta.pve.pvpDia. ----
function creditarPvP(conta, rodadas, agora) {
  agora = (typeof agora === 'number') ? agora : Date.now();
  const pve = garantirPve(conta);
  const dia = _diaISO(agora);
  const cfg = ECON.pvp || {};
  const minR = cfg.minRodadas || 0, teto = cfg.tetoDia || 0, val = (cfg.vitoria && cfg.vitoria.gema) || 0;
  if (pve.pvpDia.dia !== dia) pve.pvpDia = { dia, vitorias: 0 };
  if ((rodadas || 0) < minR) return { ok: true, creditou: false, gema: 0, vitoriasHoje: pve.pvpDia.vitorias, teto, motivo: 'partida_curta', saldo: _saldo(conta) };
  if (pve.pvpDia.vitorias >= teto) return { ok: true, creditou: false, gema: 0, vitoriasHoje: pve.pvpDia.vitorias, teto, motivo: 'teto_diario', saldo: _saldo(conta) };
  const gema = _addMoeda(conta, 'gema', val);
  pve.pvpDia.vitorias += 1;
  return { ok: true, creditou: true, gema, vitoriasHoje: pve.pvpDia.vitorias, teto, motivo: '', saldo: _saldo(conta) };
}

// ---- processa um LOTE (a fila offline do cliente): credita cada replay, na ordem. ----
function creditarLote(conta, replays, agora) {
  agora = (typeof agora === 'number') ? agora : Date.now();
  const resultados = [];
  for (const r of (replays || [])) resultados.push(creditar(conta, r, agora));
  return { ok: true, resultados, saldo: _saldo(conta) };
}

module.exports = { garantirPve, verificar, creditar, creditarLote, creditarPvP, MODOS, _chaveSemana, _diaISO };

// Persistência — camada SEPARADA das funções puras do perfil. Duas chaves, uma por
// DONO: o perfil (estado) e o histórico (log que cresce). Se o histórico corromper
// ou sumir, o perfil sobrevive. Usa `localStorage`, `novoPerfil`/`migrar`/
// `problemaDeForma` (globais no build; injetados no teste) e, se houver, `ROSTER`.
const CHAVE_PERFIL = 'incursion:perfil';
const CHAVE_HIST   = 'incursion:historico';
const HIST_MAX     = 200;

function _rosterKeys(opts) {
  if (opts && opts.rosterKeys) return opts.rosterKeys;
  if (typeof ROSTER !== 'undefined') return new Set(ROSTER.map(e => e.key));
  return null;   // sem roster disponível: não valida a existência da chave de deus
}

// Valor do grant inicial: entra por opts (testes) ou vem da economia (ECONOMIA global no
// build). NUNCA um literal aqui — a fonte é data/economia.json → grantInicial.gema (1500).
function _grant(opts) {
  if (opts && typeof opts.grantGema === 'number') return opts.grantGema;
  if (typeof ECONOMIA !== 'undefined' && ECONOMIA && ECONOMIA.grantInicial && typeof ECONOMIA.grantInicial.gema === 'number')
    return ECONOMIA.grantInicial.gema;
  return 0;
}

// Traduz um `evento` de criação/migração em ENTRADA de histórico. Puro. Tipos distintos
// para o dono poder responder "por que esse jogador tem 1500 do nada": grant inicial,
// grant de migração (perfil pré-v2), ou recriação (perfil novo após corrupção/reset).
function entradaDeEvento(ev) {
  if (!ev) return null;
  if (ev.tipo === 'recriacao') return { tipo: 'recriacao', causa: ev.causa, moeda: 'gema', valor: ev.valor };
  return { tipo: 'grant', motivo: ev.motivo, de: ev.de, moeda: 'gema', valor: ev.valor };
}

// carregar() -> { perfil, motivo, evento }. READ-ONLY: lê, migra em memória e descreve o
// que aconteceu em `evento` (grant inicial / migração / recriação), mas NÃO grava nem
// loga — quem persiste e escreve o histórico é iniciar()/a borda. `motivo` != null quando
// caiu para novoPerfil(); `evento` != null quando o saldo nasceu ou foi backfillado.
function carregar(opts = {}) {
  const agora = opts.agora || 0;
  const grant = _grant(opts);
  const rk = _rosterKeys(opts);
  let bruto = null;
  try { bruto = localStorage.getItem(CHAVE_PERFIL); }
  catch (e) { return { perfil: novoPerfil(agora, grant), motivo: 'localStorage inacessível (' + ((e && e.message) || e) + ')', evento: { tipo: 'grant', motivo: 'inicial', valor: grant } }; }
  if (bruto == null) return { perfil: novoPerfil(agora, grant), motivo: null, evento: { tipo: 'grant', motivo: 'inicial', valor: grant } };   // vazio: perfil novo
  let p;
  try { p = JSON.parse(bruto); } catch (e) { return { perfil: novoPerfil(agora, grant), motivo: 'JSON inválido', evento: { tipo: 'recriacao', causa: 'JSON inválido', valor: grant } }; }
  const versaoAntes = (typeof p.versao === 'number') ? p.versao : 0;
  p = migrar(p, grant);                            // caminho normal exercita a migração (backfill do grant em v<2)
  const prob = problemaDeForma(p, rk);
  if (prob) return { perfil: novoPerfil(agora, grant), motivo: 'forma inválida: ' + prob, evento: { tipo: 'recriacao', causa: prob, valor: grant } };
  const evento = versaoAntes < VERSAO_PERFIL ? { tipo: 'grant', motivo: 'migracao-v' + VERSAO_PERFIL, de: versaoAntes, valor: grant } : null;
  return { perfil: p, motivo: null, evento };
}

// iniciar() — orquestra o boot: carrega e, se um grant/recriação/migração aconteceu,
// PERSISTE o perfil e escreve a entrada de histórico UMA vez. A idempotência é da versão
// (migrar() num v2 não credita de novo), mas persistir aqui evita re-migrar a cada boot.
// Devolve o que carregar() devolve + `salvou` ({ok,erro}) quando houve gravação.
function iniciar(opts = {}) {
  const r = carregar(opts);
  if (r.evento) {
    const ent = entradaDeEvento(r.evento);
    if (ent) registrarHistorico(ent);
    r.salvou = salvar(r.perfil);
  }
  return r;
}

// salvar() NÃO é silencioso: devolve {ok} e, no erro (cota estourada, aba privada
// do iOS que lança direto), {ok:false, erro} para o chamador avisar o jogador.
function salvar(perfil) {
  try { localStorage.setItem(CHAVE_PERFIL, JSON.stringify(perfil)); return { ok: true }; }
  catch (e) { return { ok: false, erro: (e && e.message) || String(e) }; }
}

function apagar() {
  try { localStorage.removeItem(CHAVE_PERFIL); localStorage.removeItem(CHAVE_HIST); return { ok: true }; }
  catch (e) { return { ok: false, erro: (e && e.message) || String(e) }; }
}

// Histórico: chave própria, escrita independente do perfil, teto de 200.
function registrarHistorico(entrada) {
  try {
    let h = [];
    const b = localStorage.getItem(CHAVE_HIST);
    if (b) { try { const j = JSON.parse(b); if (Array.isArray(j)) h = j; } catch (e) { /* histórico ruim -> recomeça, perfil intacto */ } }
    h.push(entrada);
    if (h.length > HIST_MAX) h = h.slice(h.length - HIST_MAX);
    localStorage.setItem(CHAVE_HIST, JSON.stringify(h));
    return { ok: true };
  } catch (e) { return { ok: false, erro: (e && e.message) || String(e) }; }
}
function carregarHistorico() {
  try { const b = localStorage.getItem(CHAVE_HIST); if (!b) return []; const j = JSON.parse(b); return Array.isArray(j) ? j : []; }
  catch (e) { return []; }
}

if (typeof module !== 'undefined') module.exports = { CHAVE_PERFIL, CHAVE_HIST, HIST_MAX, carregar, iniciar, entradaDeEvento, salvar, apagar, registrarHistorico, carregarHistorico };

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

// carregar() -> { perfil, motivo }. motivo != null quando caiu para novoPerfil()
// (o chamador avisa/loga). SEMPRE passa por migrar(), mesmo sem trabalho.
function carregar(opts = {}) {
  const agora = opts.agora || 0;
  const rk = _rosterKeys(opts);
  let bruto = null;
  try { bruto = localStorage.getItem(CHAVE_PERFIL); }
  catch (e) { return { perfil: novoPerfil(agora), motivo: 'localStorage inacessível (' + ((e && e.message) || e) + ')' }; }
  if (bruto == null) return { perfil: novoPerfil(agora), motivo: null };   // vazio: perfil novo, sem alarme
  let p;
  try { p = JSON.parse(bruto); } catch (e) { return { perfil: novoPerfil(agora), motivo: 'JSON inválido' }; }
  p = migrar(p);                                   // caminho normal exercita a migração
  const prob = problemaDeForma(p, rk);
  if (prob) return { perfil: novoPerfil(agora), motivo: 'forma inválida: ' + prob };
  return { perfil: p, motivo: null };
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

if (typeof module !== 'undefined') module.exports = { CHAVE_PERFIL, CHAVE_HIST, HIST_MAX, carregar, salvar, apagar, registrarHistorico, carregarHistorico };

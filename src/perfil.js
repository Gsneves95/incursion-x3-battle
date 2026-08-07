// Estado do jogador: modelo + funções PURAS (recebem perfil, devolvem perfil novo,
// nunca mutam o argumento — padrão do motor). Sem DOM, sem localStorage: a
// persistência é do armazenamento.js. Sem Date.now() aqui: o instante entra por
// parâmetro (`agora`), para as funções ficarem determinísticas/testáveis.
// O HISTÓRICO NÃO mora no perfil (cresce e é reescrito a cada salvar) — vive em
// chave própria, cuidada pelo armazenamento.js. Uma chave por DONO.
const VERSAO_PERFIL = 1;
const INICIAIS = ['zeus','ogum','tyr','sobek','brigid','ganesha','cuca','fujin','nezha']; // DECISOES §4
const MAX_TIMES = 5;

const _clone = p => JSON.parse(JSON.stringify(p));

function novoPerfil(agora = 0) {
  const deuses = {};
  for (const k of INICIAIS) deuses[k] = { copias: 1, favorito: false, obtidoEm: agora };
  return {
    versao: VERSAO_PERFIL,
    deuses,
    times: [],
    moedas: { gema: 0, essencia: 0 },
    provacoes: {},
    campanha: { capitulo: 0, fase: 0, concluidas: [] },
    invocacao: { total: 0, desdeUltimoSS: 0 },   // pity; a F0.4b liga isto ao gacha
  };
}

function adicionarDeus(perfil, key, agora = 0) {
  const p = _clone(perfil);
  if (p.deuses[key]) p.deuses[key].copias++;
  else p.deuses[key] = { copias: 1, favorito: false, obtidoEm: agora };
  return p;
}
function marcarFavorito(perfil, key, valor) {
  const p = _clone(perfil);
  if (p.deuses[key]) p.deuses[key].favorito = !!valor;
  return p;
}
function salvarTime(perfil, time) {
  const p = _clone(perfil);
  if (time.id != null) {
    const i = p.times.findIndex(t => t.id === time.id);
    if (i >= 0) { p.times[i] = _clone(time); return p; }   // edição de time existente
  }
  if (p.times.length >= MAX_TIMES) throw new Error(`limite de ${MAX_TIMES} times atingido`);
  const id = p.times.reduce((m, t) => Math.max(m, t.id || 0), 0) + 1;
  p.times.push(Object.assign(_clone(time), { id }));
  return p;
}
function removerTime(perfil, id) {
  const p = _clone(perfil);
  p.times = p.times.filter(t => t.id !== id);
  return p;
}
function creditar(perfil, moeda, valor) {
  const p = _clone(perfil);
  p.moedas[moeda] = (p.moedas[moeda] || 0) + valor;
  return p;
}
function debitar(perfil, moeda, valor) {
  const p = _clone(perfil);
  const atual = p.moedas[moeda] || 0;
  if (valor > atual) throw new Error(`saldo insuficiente de ${moeda}: tem ${atual}, pediu ${valor}`);
  p.moedas[moeda] = atual - valor;   // nunca fica negativo
  return p;
}
function concluirProvacao(perfil, key, turnos, agora = 0) {
  const p = _clone(perfil);
  const j = p.provacoes[key];
  if (!j) p.provacoes[key] = { concluida: true, turnos, dataPrimeira: agora };
  else { j.concluida = true; if (turnos < j.turnos) j.turnos = turnos; }   // guarda o melhor tempo
  return p;
}

// Aplica o resultado de uma invocação ao perfil. QUEM MUTA O PERFIL VIVE AQUI —
// invocacao.js é dono do sorteio/taxas/pity e COMPÕE chamando isto, para os
// invariantes do perfil serem impostos e testados num lugar só. `resultado` vem do
// sorteio (puro): { resultados:[{key,raridade}], p5 } — p5 é o pity de saída.
function registrarInvocacao(perfil, resultado, agora = 0) {
  const p = _clone(perfil);
  const res = resultado.resultados || [];
  for (const r of res) {
    if (p.deuses[r.key]) p.deuses[r.key].copias++;
    else p.deuses[r.key] = { copias: 1, favorito: false, obtidoEm: agora };
  }
  p.invocacao.total += res.length;
  if (typeof resultado.p5 === 'number') p.invocacao.desdeUltimoSS = resultado.p5;
  return p;
}

// Migração: SEMPRE chamada no carregar(), mesmo sem trabalho, para o caminho ser
// exercitado. v0 -> v1 é a primeira versão numerada; ainda não converte dados, mas
// a estrutura existe para a v2 não nascer sem caminho.
function migrar(p) {
  if (!p || typeof p !== 'object') return p;   // deixa a validação derrubar
  let q = p;
  if (typeof q.versao !== 'number' || q.versao < 1) q = Object.assign({}, q, { versao: 1 });
  return q;
}

// Validação de FORMA (não só JSON.parse). Dado corrompido em geral é JSON válido
// com formato errado. Devolve a descrição do 1º problema, ou null se ok.
function problemaDeForma(p, rosterKeys) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return 'perfil não é objeto';
  if (typeof p.versao !== 'number') return 'versao ausente ou não-numérica';
  if (!p.deuses || typeof p.deuses !== 'object' || Array.isArray(p.deuses)) return 'deuses não é objeto';
  for (const k of Object.keys(p.deuses)) {
    if (rosterKeys && !rosterKeys.has(k)) return 'deus fora do roster: ' + k;
    const d = p.deuses[k];
    if (!d || typeof d.copias !== 'number' || d.copias < 1) return 'cópias inválidas em ' + k;
  }
  if (!Array.isArray(p.times)) return 'times não é array';
  if (p.times.length > MAX_TIMES) return 'times acima do limite';
  for (const t of p.times) {
    if (!t || !Array.isArray(t.deuses)) return 'time sem deuses[]';
    if (t.deuses.length > 3) return 'time com mais de 3 deuses';
  }
  if (!p.moedas || typeof p.moedas !== 'object') return 'moedas ausente';
  for (const m of ['gema', 'essencia']) {
    const v = p.moedas[m];
    if (typeof v !== 'number' || v < 0 || !isFinite(v)) return 'moeda inválida: ' + m;
  }
  if (!p.invocacao || typeof p.invocacao.total !== 'number' || typeof p.invocacao.desdeUltimoSS !== 'number') return 'invocacao inválida';
  if (!p.provacoes || typeof p.provacoes !== 'object') return 'provacoes ausente';
  if (!p.campanha || typeof p.campanha !== 'object') return 'campanha ausente';
  return null;
}
function ehPerfilValido(p, rosterKeys) { return problemaDeForma(p, rosterKeys) === null; }

if (typeof module !== 'undefined') module.exports = {
  VERSAO_PERFIL, INICIAIS, MAX_TIMES,
  novoPerfil, adicionarDeus, marcarFavorito, salvarTime, removerTime,
  creditar, debitar, concluirProvacao, registrarInvocacao, migrar, problemaDeForma, ehPerfilValido,
};

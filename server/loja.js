// server/loja.js — §370: a LOJA é do SERVIDOR. Funções PURAS sobre `conta` (como invocacao.js/pve.js): elas
// mutam a conta e devolvem o resultado; a ATOMICIDADE (persistência), a IDEMPOTÊNCIA (reservarRecibo do §354) e a
// verificação de pagamento (server/pagamento.js) ficam no WRAPPER em contas.js. O cliente NUNCA soma — pede e desenha.
//
// FONTE ÚNICA de valores: data/economia.json → bloco "loja". Nenhum literal de loja aqui (só chaves/estrutura).
// O "dia" e a "semana" viram em UTC (a mesma regra do Desafio da Semana).
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
function ler(rel) { return JSON.parse(fs.readFileSync(path.join(RAIZ, rel), 'utf8')); }

const ECON = ler('data/economia.json');
const LOJA = ECON.loja || {};
const RARIDADE = ler('data/raridades.json');
// base de vagas de Provação (§314): a fonte é data/missoes.json (que o gerador copia de provacoes_slots.json).
const SLOTS_GRATIS = (function () { try { return ler('data/missoes.json').slotsGratis || 1; } catch (e) { return 1; } })();

const _invoc = require('./invocacao.js');

// lista ORDENADA dos deuses de raridade S — a rotação do Deus da Semana indexa nela (determinística).
const DEUSES_S = Object.keys(RARIDADE).filter(k => RARIDADE[k] === 'S').sort();
// a faixa (índice de ranque) de cada deus, para conceder o deus da semana pela mesma conversão da Invocação.
const FAIXA_DEUS = _invoc.FAIXA_DEUS;

const MS_DIA = 86400000;
function diaUTC(ms) { return Math.floor((typeof ms === 'number' ? ms : Date.now()) / MS_DIA); }   // nº do dia UTC
// semana ANCORADA na segunda 00:00 UTC. 1970-01-01 é quinta; a segunda-base cai 3 dias antes → (dia+3)/7.
function semanaUTC(ms) { return Math.floor((diaUTC(ms) + 3) / 7); }

// ---- estrutura do ledger de loja na conta (nasce vazio; nunca no perfil que o cliente escreve) ----
function garantir(conta) {
  _invoc.garantir(conta);   // gacha/pontos/bilhetes
  if (!conta.loja || typeof conta.loja !== 'object') conta.loja = {};
  const L = conta.loja;
  if (!L.pacotesComprados || typeof L.pacotesComprados !== 'object') L.pacotesComprados = {};
  if (typeof L.vagasProvacaoExtra !== 'number' || L.vagasProvacaoExtra < 0) L.vagasProvacaoExtra = 0;
  if (L.passe !== null && typeof L.passe !== 'object') L.passe = null;
  if (L.deusSemana && typeof L.deusSemana !== 'object') L.deusSemana = null;
  if (L.anunciosDia && typeof L.anunciosDia !== 'object') L.anunciosDia = null;
  if (L.reviverRun && typeof L.reviverRun !== 'object') L.reviverRun = null;
  return conta;
}
function _addMoeda(conta, moeda, v) {
  if (!conta.perfil) conta.perfil = {};
  conta.perfil.moedas = Object.assign({ gema: 0, essencia: 0 }, conta.perfil.moedas);
  conta.perfil.moedas[moeda] = (conta.perfil.moedas[moeda] || 0) + v;
}
function _saldo(conta) { const m = (conta.perfil && conta.perfil.moedas) || {}; return { gema: m.gema || 0, essencia: m.essencia || 0 }; }

// ============================================================ PACOTES DE GEMA ============================================================
function _pacote(id) { return (LOJA.pacotesGema || []).find(p => p.id === id) || null; }
// 1ª compra de cada pacote vem em DOBRO (marcado por conta). A idempotência por recibo (repetir o MESMO idCompra
// não credita de novo) é do wrapper; aqui a regra é "primeira vez DESTE pacote".
function comprarPacote(conta, pacoteId, agora) {
  garantir(conta);
  const p = _pacote(pacoteId);
  if (!p) return { ok: false, codigo: 'pacote_desconhecido', erro: 'pacote desconhecido' };
  const primeira = !conta.loja.pacotesComprados[pacoteId];
  const emDobro = primeira && LOJA.primeiraCompraEmDobro !== false;
  const gemas = (p.gemas || 0) * (emDobro ? 2 : 1);
  _addMoeda(conta, 'gema', gemas);
  conta.loja.pacotesComprados[pacoteId] = true;
  return { ok: true, pacoteId, gemas, emDobro, reais: p.reais, saldo: _saldo(conta) };
}

// ============================================================ PASSE MENSAL ============================================================
const PASSE = LOJA.passe || { dias: 30, diaComum: { gema: 150 }, marcos: {}, diaFinal: { dia: 30, ss: true }, recomprarAtivo: 'recusar' };
function diaIndexPasse(passe, agora) { return diaUTC(agora) - passe.inicioDia + 1; }   // 1..dias
function passeAtivo(conta, agora) {
  const p = conta.loja && conta.loja.passe;
  if (!p) return false;
  const di = diaIndexPasse(p, agora);
  return di >= 1 && di <= (PASSE.dias || 30);
}
// a recompensa do dia `di` (1..30). O dia final é o SS (marcado ss:true); os marcos e os comuns dão gema/bilhetes.
function _recompensaDia(di) {
  if (PASSE.diaFinal && di === PASSE.diaFinal.dia) return { ss: true };
  const m = (PASSE.marcos || {})[String(di)];
  return m || PASSE.diaComum || { gema: 0 };
}
function comprarPasse(conta, agora) {
  garantir(conta);
  if (passeAtivo(conta, agora)) {
    // DECISÃO §370: recomprar com o passe ATIVO é RECUSADO (não empilha 30 dias). Claro pro jogador e sem abuso.
    if ((PASSE.recomprarAtivo || 'recusar') === 'recusar') return { ok: false, codigo: 'passe_ativo', erro: 'o passe já está ativo' };
  }
  conta.loja.passe = { inicioDia: diaUTC(agora), compradoEm: (typeof agora === 'number' ? agora : Date.now()), resgatados: {} };
  return { ok: true, passe: estadoPasse(conta, agora) };
}
// RESGATE do dia de HOJE, uma vez por dia. Dia passado sem resgate é PERDIDO (não se recupera). Dia 30 → SS.
function resgatarPasse(conta, agora, rng) {
  garantir(conta);
  const p = conta.loja.passe;
  if (!p) return { ok: false, codigo: 'sem_passe', erro: 'você não tem passe ativo' };
  const di = diaIndexPasse(p, agora);
  if (di < 1 || di > (PASSE.dias || 30)) return { ok: false, codigo: 'passe_expirado', erro: 'o passe não está no período' };
  if (p.resgatados[di]) return { ok: false, codigo: 'ja_resgatado_hoje', erro: 'o resgate de hoje já foi feito' };
  const rec = _recompensaDia(di);
  const premio = { dia: di };
  if (rec.ss) {
    const ss = _invoc.sortearSSPasse(conta, rng, agora);   // mesma regra da Invocação (faixa ≤ jogador, inédito)
    premio.ss = ss;
  } else {
    if (rec.gema) { _addMoeda(conta, 'gema', rec.gema); premio.gema = rec.gema; }
    if (rec.bilhetes) { conta.bilhetes += rec.bilhetes; premio.bilhetes = rec.bilhetes; }
  }
  p.resgatados[di] = true;
  return { ok: true, premio, saldo: _saldo(conta), bilhetes: conta.bilhetes };
}
// ESTADO do calendário p/ o cliente desenhar: por dia → resgatado | perdido | hoje | futuro (+ a recompensa).
function estadoPasse(conta, agora) {
  garantir(conta);
  const p = conta.loja.passe;
  if (!p) return { ativo: false, dias: [] };
  const hoje = diaIndexPasse(p, agora);
  const dias = [];
  for (let d = 1; d <= (PASSE.dias || 30); d++) {
    let estado;
    if (p.resgatados[d]) estado = 'resgatado';
    else if (d < hoje) estado = 'perdido';
    else if (d === hoje) estado = 'hoje';
    else estado = 'futuro';
    dias.push({ dia: d, estado, recompensa: _recompensaDia(d) });
  }
  return { ativo: passeAtivo(conta, agora), diaAtual: hoje, dias };
}

// ============================================================ DEUS DA SEMANA ============================================================
const DS = LOJA.deusSemana || { raridade: 'S', janelaRepeticaoSemanas: 12, marcasParaGanhar: 5, marcasPorDia: 1, marcasPorDiaPasse: 2, compraDireta: { gema: 1800 } };
// ROTAÇÃO determinística: um deus S indexado pela semana absoluta. |DEUSES_S| (31) > janela (12) ⇒ nunca repete
// na janela, e a mesma semana dá o mesmo deus para todos (sem estado no servidor).
function deusDaSemana(agora) {
  if (!DEUSES_S.length) return null;
  return DEUSES_S[semanaUTC(agora) % DEUSES_S.length];
}
function _ledgerDS(conta, agora) {
  const sem = semanaUTC(agora);
  let d = conta.loja.deusSemana;
  if (!d || d.semana !== sem) { d = { semana: sem, marcas: 0, marcadoDia: null, dado: false }; conta.loja.deusSemana = d; }
  return d;
}
function _concederDeus(conta, key, agora) {
  // concede o deus (1ª cópia fica) ou vira pontos de duplicata — a MESMA conversão da Invocação.
  return _invoc.aplicarResultado(conta, { key, raridade: RARIDADE[key] || DS.raridade, faixa: FAIXA_DEUS[key] || 0 }, agora);
}
// MARCAR (via anúncio): 1 marca/dia (2 com o passe), uma ação por dia. 5 marcas na semana → ganha o deus.
function marcarDeusSemana(conta, agora) {
  garantir(conta);
  const d = _ledgerDS(conta, agora);
  if (d.dado) return { ok: false, codigo: 'ja_ganho', erro: 'o deus da semana já foi obtido' };
  if (d.marcadoDia === diaUTC(agora)) return { ok: false, codigo: 'ja_marcou_hoje', erro: 'a marca de hoje já foi feita' };
  const inc = passeAtivo(conta, agora) ? (DS.marcasPorDiaPasse || 2) : (DS.marcasPorDia || 1);
  d.marcas = Math.min(DS.marcasParaGanhar || 5, d.marcas + inc);
  d.marcadoDia = diaUTC(agora);
  const out = { ok: true, deus: deusDaSemana(agora), marcas: d.marcas, meta: DS.marcasParaGanhar || 5, marcasAdd: inc };
  if (d.marcas >= (DS.marcasParaGanhar || 5)) { d.dado = true; out.concedido = _concederDeus(conta, deusDaSemana(agora), agora); }
  return out;
}
// COMPRA DIRETA do deus da semana por gema (1.800). Concede na hora (ou pontos, se já tem).
function comprarDeusSemana(conta, agora) {
  garantir(conta);
  const d = _ledgerDS(conta, agora);
  const custo = (DS.compraDireta && DS.compraDireta.gema) || 0;
  if (_saldo(conta).gema < custo) return { ok: false, codigo: 'gemas_insuficientes', erro: 'gemas insuficientes', custo };
  _addMoeda(conta, 'gema', -custo);
  const key = deusDaSemana(agora);
  const concedido = _concederDeus(conta, key, agora);
  d.dado = true;   // já é dono; marcas futuras viram pontos
  return { ok: true, deus: key, concedido, custo, saldo: _saldo(conta) };
}

// ============================================================ ANÚNCIOS (teto 8/dia + limite por tipo) ============================================================
const ADS = LOJA.anuncios || { tetoDia: 8, tipos: {} };
function _anunciosDia(conta, agora) {
  const dia = diaUTC(agora);
  let a = conta.loja.anunciosDia;
  if (!a || a.dia !== dia) { a = { dia, total: 0, porTipo: {} }; conta.loja.anunciosDia = a; }
  return a;
}
// quanto já foi usado hoje (p/ a tela) + o teto.
function usoAnuncios(conta, agora) {
  garantir(conta);
  const a = _anunciosDia(conta, agora);
  return { total: a.total, teto: ADS.tetoDia || 8, porTipo: Object.assign({}, a.porTipo) };
}
// aplica o crédito de UM anúncio (já verificado/ liberado pelo wrapper). `extra`: { escolha?, deus?, runId? }.
function creditarAnuncio(conta, tipo, agora, extra) {
  garantir(conta);
  extra = extra || {};
  const cfg = (ADS.tipos || {})[tipo];
  if (!cfg) return { ok: false, codigo: 'anuncio_desconhecido', erro: 'tipo de anúncio desconhecido' };
  const a = _anunciosDia(conta, agora);
  if (a.total >= (ADS.tetoDia || 8)) return { ok: false, codigo: 'teto_diario', erro: 'teto de anúncios do dia atingido', teto: ADS.tetoDia || 8 };
  // limite por tipo: por DIA (limiteDia) ou por CORRIDA (reviverExtra).
  if (typeof cfg.limiteDia === 'number') {
    if ((a.porTipo[tipo] || 0) >= cfg.limiteDia) return { ok: false, codigo: 'limite_tipo', erro: 'limite do dia para este anúncio', limite: cfg.limiteDia };
  }
  if (typeof cfg.limiteCorrida === 'number') {
    const runId = extra.runId || null;
    const rr = conta.loja.reviverRun;
    const usados = (rr && rr.runId === runId) ? (rr.usados || 0) : 0;
    if (usados >= cfg.limiteCorrida) return { ok: false, codigo: 'limite_corrida', erro: 'limite por corrida para este anúncio', limite: cfg.limiteCorrida };
  }

  // aplica a recompensa por tipo
  const premio = { tipo };
  if (tipo === 'invocacaoGratis') {
    // invocação grátis = 1 sorteio, SEM gastar gema, CONTANDO para o pity 60 (mesma mecânica da paga).
    const estado = { pity: conta.gacha.pity };
    const o = _invoc.sortearUm(estado, _invoc.faixaDoJogador(conta), Math.random, null);
    conta.gacha.pity = estado.pity;
    premio.invocacao = _invoc.aplicarResultado(conta, o, agora);
    premio.pity = conta.gacha.pity;
  } else if (tipo === 'marcaDeusSemana') {
    const m = marcarDeusSemana(conta, agora);
    if (!m.ok) return m;   // já marcou hoje / já ganhou — não consome o teto
    premio.deusSemana = m;
  } else if (tipo === 'ofertaDia') {
    const escolha = extra.escolha === 'essencia' ? 'essencia' : 'gema';
    const v = escolha === 'essencia' ? (cfg.essencia || 0) : (cfg.gema || 0);
    _addMoeda(conta, escolha, v);
    premio.escolha = escolha; premio.valor = v;
  } else if (tipo === 'acelerarRecarga') {
    // −N h na recarga do Desafio por deus (§318b-3). Precisa do deus; só reduz se há recarga pendente.
    const deus = extra.deus;
    const des = (conta.perfil && conta.perfil.desafios) || {};
    const d = deus && des[deus];
    if (!d || !d.recargaAte || d.recargaAte <= (typeof agora === 'number' ? agora : Date.now())) return { ok: false, codigo: 'sem_recarga', erro: 'não há recarga a acelerar neste deus' };
    d.recargaAte -= (cfg.horas || 4) * 3600 * 1000;
    premio.deus = deus; premio.horas = cfg.horas || 4; premio.recargaAte = d.recargaAte;
  } else if (tipo === 'dobrarSemanal' || tipo === 'dobrarDominio' || tipo === 'reviverExtra') {
    // EFEITOS que um MODO consome depois (dobrar a recompensa / +1 reviver). §370 registra o direito do dia/corrida
    // (o teto/limite já foi validado acima); a aplicação dentro do Desafio da Semana / Domínio entra com as telas (§371+).
    const dia = diaUTC(agora);
    conta.loja.bonusDia = (conta.loja.bonusDia && conta.loja.bonusDia.dia === dia) ? conta.loja.bonusDia : { dia, flags: {} };
    conta.loja.bonusDia.flags[tipo] = (conta.loja.bonusDia.flags[tipo] || 0) + 1;
    premio.registrado = true;
  }

  // contabiliza o uso (teto global + por tipo/corrida) só quando a recompensa foi aplicada
  a.total += 1;
  a.porTipo[tipo] = (a.porTipo[tipo] || 0) + 1;
  if (typeof cfg.limiteCorrida === 'number') {
    const runId = extra.runId || null;
    const rr = conta.loja.reviverRun;
    conta.loja.reviverRun = (rr && rr.runId === runId) ? { runId, usados: (rr.usados || 0) + 1 } : { runId, usados: 1 };
  }
  return { ok: true, premio, uso: { total: a.total, teto: ADS.tetoDia || 8 }, saldo: _saldo(conta) };
}

// ============================================================ VAGA EXTRA DE PROVAÇÃO ============================================================
// total de vagas de Provação da conta = base do §314 (slotsGratis) + extras compradas (até maxExtra).
function vagasProvacao(conta) { garantir(conta); return SLOTS_GRATIS + (conta.loja.vagasProvacaoExtra || 0); }
function comprarVagaProvacao(conta) {
  garantir(conta);
  const cfg = LOJA.vagaProvacao || { gema: 500, maxExtra: 2 };
  if ((conta.loja.vagasProvacaoExtra || 0) >= (cfg.maxExtra || 2)) return { ok: false, codigo: 'max_vagas', erro: 'você já tem o máximo de vagas extras', maxExtra: cfg.maxExtra || 2 };
  if (_saldo(conta).gema < (cfg.gema || 0)) return { ok: false, codigo: 'gemas_insuficientes', erro: 'gemas insuficientes', custo: cfg.gema || 0 };
  _addMoeda(conta, 'gema', -(cfg.gema || 0));
  conta.loja.vagasProvacaoExtra = (conta.loja.vagasProvacaoExtra || 0) + 1;
  return { ok: true, vagasExtra: conta.loja.vagasProvacaoExtra, vagas: vagasProvacao(conta), custo: cfg.gema || 0, saldo: _saldo(conta) };
}

// ============================================================ LEITURA (estado da loja p/ o cliente desenhar) ============================================================
function estadoLoja(conta, agora) {
  garantir(conta);
  const pacotes = (LOJA.pacotesGema || []).map(p => ({ id: p.id, reais: p.reais, gemas: p.gemas, primeira: !conta.loja.pacotesComprados[p.id], emDobro: !conta.loja.pacotesComprados[p.id] && LOJA.primeiraCompraEmDobro !== false }));
  const dsKey = deusDaSemana(agora);
  const dsLed = _ledgerDS(conta, agora);
  return {
    saldo: _saldo(conta),
    bilhetes: conta.bilhetes || 0,
    pacotes,
    passe: estadoPasse(conta, agora),
    deusSemana: { deus: dsKey, raridade: RARIDADE[dsKey] || DS.raridade, marcas: dsLed.marcas, meta: DS.marcasParaGanhar || 5, dado: dsLed.dado, compraDireta: (DS.compraDireta && DS.compraDireta.gema) || null },
    anuncios: usoAnuncios(conta, agora),
    vagasProvacao: vagasProvacao(conta),
  };
}

module.exports = {
  garantir, diaUTC, semanaUTC,
  comprarPacote, _pacote,
  comprarPasse, resgatarPasse, estadoPasse, passeAtivo, diaIndexPasse,
  deusDaSemana, marcarDeusSemana, comprarDeusSemana, DEUSES_S,
  creditarAnuncio, usoAnuncios,
  comprarVagaProvacao, vagasProvacao,
  estadoLoja,
};

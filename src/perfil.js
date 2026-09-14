// Estado do jogador: modelo + funções PURAS (recebem perfil, devolvem perfil novo,
// nunca mutam o argumento — padrão do motor). Sem DOM, sem localStorage: a
// persistência é do armazenamento.js. Sem Date.now() aqui: o instante entra por
// parâmetro (`agora`), para as funções ficarem determinísticas/testáveis.
// O HISTÓRICO NÃO mora no perfil (cresce e é reescrito a cada salvar) — vive em
// chave própria, cuidada pelo armazenamento.js. Uma chave por DONO.
const VERSAO_PERFIL = 6;   // v2: grant inicial (1500); v3: `sandbox` (F4); v4: `dominios` run-scoped (§273); v5: `dominios` por-domínio (§274); v6: recorde por-domínio vira SEMANAL — {run, melhorSempre, semanas:{<AAAA-Www>:prof}} (§275, ciclo semanal + melhor de sempre)
const INICIAIS = ['zeus','ogum','tyr','sobek','brigid','ganesha','cuca','fujin','nezha']; // DECISOES §4
const MAX_TIMES = 5;

const _clone = p => JSON.parse(JSON.stringify(p));

// grantGema é o grant inicial (data/economia.json → grantInicial.gema = 1500). Entra por
// PARÂMETRO, não por leitura de global: a função continua pura e testável, e a borda
// (armazenamento/view, que veem ECONOMIA) é quem escolhe o valor. Default 0 = sem grant
// (usado pelos testes puros). O grant é EVENTO DE CRIAÇÃO — a entrada de histórico é
// escrita pela borda; aqui só nasce o saldo.
function novoPerfil(agora = 0, grantGema = 0) {
  const deuses = {};
  for (const k of INICIAIS) deuses[k] = { copias: 1, favorito: false, obtidoEm: agora };
  return {
    versao: VERSAO_PERFIL,
    deuses,
    times: [],
    moedas: { gema: grantGema, essencia: 0 },
    provacoes: {},
    campanha: { capitulo: 0, fase: 0, concluidas: [], escolhas: {} },   // §268: escolhas[atoId]=opcaoId (ato de escolha)
    maestria: {},   // F3.5: por deus {vitorias, milagre} — só TÍTULO/COSMÉTICO, nunca poder de combate
    desafios: {},   // §245: por deus {ativo, recargaAte} — desafio POR DEUS comprado com Essência (dá maestria)
    invocacao: { total: 0, desdeUltimoSS: 0 },   // pity; a F0.4b liga isto ao gacha
    sandbox: { dia: '', vitorias: 0 },   // F4: teto diário da Batalha CPU (sandbox), reset por DATA
    dominios: { porDominio: {} },   // §274: um Domínio POR CULTURA, INDEPENDENTE — { porDominio: { <cultura>: { run:{...}|null, recorde:N } } }. RUN-SCOPED (a run zera com a corrida); `recorde` = nível mais fundo já alcançado naquele Domínio (progresso pessoal local, não placar). NÃO fere o invariante 3: nada toca deuses/kit/HP-base; correr no Olimpo não mexe em Asgard.
  };
}

// §274/§275 — DOMÍNIOS: guarda (ou zera) a corrida de UM Domínio (por cultura, independente) E
// registra o recorde. Puro: recebe perfil + chave de cultura (minúscula) + a run (objeto de
// src/dominios.js) ou null para ENCERRAR. Atualiza dois recordes a partir de run.profundidade:
//   - `melhorSempre`: o mais fundo de todos os tempos — NUNCA regride, NUNCA zera.
//   - `semanas[run.semana]`: o mais fundo DAQUELA semana (mapa por chave "AAAA-Www").
// CLOCK-ROBUSTO (§275): grava sempre por MAX numa CHAVE — relógio errado/viagem de fuso só muda a
// chave gravada, nunca apaga (não há "virada" destrutiva; a virada é só o mapa passar a ler outra
// chave). O mapa é limitado às ~12 semanas mais recentes (descarta a MAIS VELHA, nunca a atual/anterior).
// É a única porta de escrita; a borda (home) muta a run e chama isto + salvar().
function definirRunDominio(perfil, cultura, run) {
  const p = _clone(perfil);
  if (!p.dominios || typeof p.dominios !== 'object' || !p.dominios.porDominio) p.dominios = { porDominio: {} };
  const c = String(cultura).toLowerCase();
  const antes = p.dominios.porDominio[c] || {};
  const semanas = (antes.semanas && typeof antes.semanas === 'object') ? { ...antes.semanas } : {};
  const prof = run && typeof run.profundidade === 'number' ? run.profundidade : 0;
  if (run && run.semana) semanas[run.semana] = Math.max(semanas[run.semana] || 0, prof);   // recorde DA SEMANA (por chave), por MAX
  // limita a ~12 semanas: descarta as chaves mais VELHAS (ordem lexicográfica de "AAAA-Www" = cronológica)
  const chaves = Object.keys(semanas).sort();
  while (chaves.length > 12) delete semanas[chaves.shift()];
  p.dominios.porDominio[c] = {
    run: run ? JSON.parse(JSON.stringify(run)) : null,
    melhorSempre: Math.max(antes.melhorSempre || 0, prof),   // MELHOR DE SEMPRE — nunca regride
    semanas,
  };
  return p;
}

// F4 — SANDBOX (Batalha CPU): credita a recompensa simbólica de UMA vitória contra a
// CPU, com TETO diário e reset por DATA. Puro (recebe perfil + hoje + valores, devolve
// perfil novo). `hoje` = string de data (AAAA-MM-DD) — entra por parâmetro, sem Date aqui.
// Estourou o teto do dia → não credita (creditou:false). Dia mudou → zera e credita.
function creditarSandbox(perfil, hoje, gemaPorVitoria, teto) {
  const p = _clone(perfil);
  if (!p.sandbox || typeof p.sandbox !== 'object') p.sandbox = { dia: '', vitorias: 0 };
  if (p.sandbox.dia !== hoje) p.sandbox = { dia: hoje, vitorias: 0 };   // reset diário por data
  if (p.sandbox.vitorias >= teto) return { perfil: p, creditou: false, gema: 0, vitoriasHoje: p.sandbox.vitorias, teto };
  p.sandbox.vitorias += 1;
  p.moedas = Object.assign({ gema: 0, essencia: 0 }, p.moedas);
  p.moedas.gema += gemaPorVitoria;
  return { perfil: p, creditou: true, gema: gemaPorVitoria, vitoriasHoje: p.sandbox.vitorias, teto };
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
// Crédito de TESTE (afordância de protótipo, botão DEV). Credita de verdade E MARCA o
// perfil como contaminado (p.dev): a nota do dado ("grantTeste nunca entra no perfil
// real") é honrada no que importa — nenhum perfil de jogador recebe 30.000 sem que se
// saiba. O rótulo fica no perfil, o indicador aparece na tela, e a entrada de histórico
// (tipo próprio, escrita pela borda) nunca se confunde com transação de jogo.
function creditarDev(perfil, moeda, valor, agora = 0) {
  const p = _clone(perfil);
  p.moedas[moeda] = (p.moedas[moeda] || 0) + valor;
  if (!p.dev) p.dev = { creditosTeste: 0, primeiroEm: agora };
  p.dev.creditosTeste += valor;
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
// sorteio (puro): { resultados:[{key,raridade}], pity } — pity é o contador de saída.
// `essenciaPorRaridade` (F3.2): tabela {A,S,SS} vinda da borda (invocacao.js lê data/economia.json).
// Com ela, REPETIDO VIRA ESSÊNCIA — invocar um deus já na coleção credita Essência em vez de empilhar
// cópia, e a ÚNICA/PRIMEIRA cópia nunca é dissolvida (o `else` que adiciona só roda quando o deus falta).
// Sem a tabela (testes puros antigos, migração), mantém o empilhar-cópia de antes — comportamento intacto.
function registrarInvocacao(perfil, resultado, agora = 0, essenciaPorRaridade = null) {
  const p = _clone(perfil);
  const res = resultado.resultados || [];
  for (const r of res) {
    if (p.deuses[r.key]) {
      if (essenciaPorRaridade && essenciaPorRaridade[r.raridade] != null) {
        p.moedas.essencia = (p.moedas.essencia || 0) + essenciaPorRaridade[r.raridade];   // dup → Essência; a cópia mantida não é tocada
      } else {
        p.deuses[r.key].copias++;
      }
    } else {
      p.deuses[r.key] = { copias: 1, favorito: false, obtidoEm: agora };
    }
  }
  p.invocacao.total += res.length;
  if (typeof resultado.pity === 'number') p.invocacao.desdeUltimoSS = resultado.pity;
  return p;
}

// Migração: SEMPRE chamada no carregar(), mesmo sem trabalho, para o caminho ser
// exercitado. v<2 -> v2 é o primeiro trabalho REAL da migração: credita o grant
// inicial retroativo. Todo perfil anterior à v2 nasceu com a carteira FANTASMA (custo
// de invocação era ficção, ninguém jamais recebeu as 1500), então dar o grant uma vez
// a esses perfis é correto e SEGURO. A subida de versão trava a repetição: rodar
// migrar() de novo num v2 não credita outra vez — é a "presença de versão", não
// `gema || 1500`, que separa "nunca recebeu" (v<2) de "gastou tudo" (v2, gema 0).
function migrar(p, grantGema = 0) {
  if (!p || typeof p !== 'object') return p;   // deixa a validação derrubar
  const v = (typeof p.versao === 'number') ? p.versao : 0;
  if (v >= VERSAO_PERFIL) return p;            // já migrado: NADA a fazer (idempotente)
  const q = Object.assign({}, p);
  // v<2 → v2: grant inicial retroativo (uma vez; só quem nasceu antes da carteira real).
  // GATED em v<2: um perfil v2 subindo p/ v3 NÃO recebe o grant de novo.
  if (v < 2) {
    q.moedas = Object.assign({ gema: 0, essencia: 0 }, p.moedas);
    q.moedas.gema = (typeof q.moedas.gema === 'number' ? q.moedas.gema : 0) + grantGema;
  }
  // v<3 → v3: campo `sandbox` (teto diário da Batalha CPU). Backfill VAZIO — sem crédito.
  if (v < 3 && (!q.sandbox || typeof q.sandbox !== 'object')) q.sandbox = { dia: '', vitorias: 0 };
  // v<4 → v4: campo `dominios` (§273). Backfill VAZIO (run: null) — corrida nenhuma em curso.
  if (v < 4 && (!q.dominios || typeof q.dominios !== 'object')) q.dominios = { run: null };
  // v<5 → v5 (§274): `dominios` vira POR-DOMÍNIO. A run única do v4 (só existia Grega) migra para
  // porDominio.grega, preservando o recorde. Sem run: porDominio vazio.
  if (v < 5) {
    const old = (q.dominios && 'run' in q.dominios) ? q.dominios.run : null;
    q.dominios = { porDominio: {} };
    if (old && old.cultura) q.dominios.porDominio[String(old.cultura).toLowerCase()] = { run: old, recorde: old.profundidade || 0 };
  }
  // v<6 → v6 (§275): o `recorde` por-domínio vira `melhorSempre` (não zera) + `semanas` (recorde
  // semanal por chave, vazio). NÃO perde o recorde acumulado. Clona por-domínio para não mutar.
  if (v < 6) {
    const pd = (q.dominios && q.dominios.porDominio) || {};
    const novo = {};
    for (const c of Object.keys(pd)) { const e = pd[c] || {}; novo[c] = { run: e.run || null, melhorSempre: e.melhorSempre || e.recorde || 0, semanas: (e.semanas && typeof e.semanas === 'object') ? e.semanas : {} }; }
    q.dominios = { porDominio: novo };
  }
  q.versao = VERSAO_PERFIL;
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
  // dev é OPCIONAL (só existe em perfil contaminado por crédito de teste). Se presente,
  // valida a forma — assim corrupção nesse campo cai para novoPerfil como qualquer outra.
  if ('dev' in p) {
    const dv = p.dev;
    if (!dv || typeof dv !== 'object' || typeof dv.creditosTeste !== 'number' || dv.creditosTeste < 0) return 'dev inválido';
  }
  // §274/§275: `dominios` é OPCIONAL (backfill v6). Se presente: { porDominio: {} }; cada entrada é
  // { run: null|corrida, melhorSempre: número, semanas: {<chave>: número} }. Corrupção aqui cai para
  // novoPerfil como qualquer outra — o progresso de Domínio é sacrificável (local, run-scoped/semanal).
  if ('dominios' in p) {
    const dm = p.dominios;
    if (!dm || typeof dm !== 'object' || !dm.porDominio || typeof dm.porDominio !== 'object') return 'dominios inválido';
    for (const c of Object.keys(dm.porDominio)) {
      const e = dm.porDominio[c];
      if (!e || typeof e !== 'object' || typeof e.melhorSempre !== 'number' || !e.semanas || typeof e.semanas !== 'object') return 'dominios.porDominio inválido em ' + c;
      for (const wk of Object.keys(e.semanas)) if (typeof e.semanas[wk] !== 'number') return 'dominios.semanas inválido em ' + c;
      if (e.run !== null && e.run !== undefined) {
        const r = e.run;
        if (typeof r !== 'object' || typeof r.nivel !== 'number' || !Array.isArray(r.vida) || typeof r.bonus !== 'number') return 'dominios.run inválido em ' + c;
      }
    }
  }
  return null;
}
function ehPerfilValido(p, rosterKeys) { return problemaDeForma(p, rosterKeys) === null; }

if (typeof module !== 'undefined') module.exports = {
  VERSAO_PERFIL, INICIAIS, MAX_TIMES,
  novoPerfil, adicionarDeus, marcarFavorito, salvarTime, removerTime,
  creditar, debitar, creditarDev, concluirProvacao, registrarInvocacao, creditarSandbox, definirRunDominio, migrar, problemaDeForma, ehPerfilValido,
};

// server/contas.js — F5.1: o CADASTRO AUTORITATIVO de contas. O servidor é a fonte da verdade
// (§221): a conta NASCE aqui, o perfil vive aqui, o token é emitido aqui. O cliente só guarda o
// token e desenha o que o servidor devolve.
//
// CONTA ANÔNIMA: não é "conta de convidado que depois vira real" — é A conta desde o primeiro
// segundo, só sem dado pessoal. Nada de e-mail, nome ou senha. A identidade é um TOKEN opaco
// (segredo, fica no aparelho) e um id público. O jogador nunca vê uma tela de login.
//
// FAIXA DE IDADE (Lei 15.211): guardamos a FAIXA ('menor' | 'maior'), NUNCA a data de nascimento.
// Menor de 18 não pode ter aleatoriedade paga. Perguntamos e registramos; se o jogador mentir, o
// dever de perguntar já foi cumprido. Menos dado pessoal guardado = menos risco de LGPD.
//
// RANQUE começa SEMPRE em zero (§221-d), inclusive para o perfil de desenvolvimento migrado.
//
// EXCLUSÃO é de verdade: a linha inteira some do cadastro (não é marcação de 'apagado'). Ver excluir().
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const E = require(path.join(__dirname, '..', 'src', 'perfil.js'));
// grant inicial de gema: a fonte é data/economia.json (a mesma que o cliente usa). NUNCA um literal.
const ECON = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'economia.json'), 'utf8'));
const GRANT_GEMA = (ECON && ECON.grantInicial && typeof ECON.grantInicial.gema === 'number') ? ECON.grantInicial.gema : 0;

const FAIXAS = ['menor', 'maior'];   // menor de 18 | 18 ou mais. Só a faixa, nunca a data.
// §318b — o diretório de dados aceita override por env (INCURSION_DADOS_DIR) para o teste e2e rodar num
// arquivo descartável, sem tocar os dados reais do jogador. Sem a env, o caminho de sempre.
const DIR = process.env.INCURSION_DADOS_DIR ? path.resolve(process.env.INCURSION_DADOS_DIR) : path.join(__dirname, 'dados');
const ARQ = path.join(DIR, 'contas.json');

// F5.3 — NICK: curadoria de palavra ofensiva versionada em data/ (§222: o que precisa mudar sem
// revisão de loja vive no servidor). Some do cliente; atualiza sem publicar app novo.
const BLOQUEIO = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'nick_bloqueio.json'), 'utf8')); } catch (e) { return { substrings: [], exatas: [] }; } })();
const NICK_MIN = 3, NICK_MAX = 16;
// RANQUEADO (F5.5): tudo vem de data/ranqueado.json (versionado, do dono). Nenhum literal de ranque aqui.
const RANQ = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'ranqueado.json'), 'utf8')); } catch (e) { return { faixas: [{ chave: 'suplicante', nome: 'Suplicante', min: 0 }], pontos: { vitoria: 0, derrota: 0, piso: 0 }, fila: { janelaBase: 0, janelaPorSegundo: 0 }, temporada: { compressao: 1 } }; } })();

// ---- §354: PERSISTÊNCIA pela CAMADA ÚNICA (server/armazenamento.js). Arquivo por padrão (dev/testes, custo zero);
// Postgres quando há DATABASE_URL (produção, sobrevive a deploy). O Map em memória é o cache de trabalho DESTE processo
// (leituras rápidas e atômicas — Node é single-thread); a durabilidade é write-through pela camada. contas.js só fala
// com a camada, nunca com o fs direto para o cadastro. ----
const armazenamento = require('./armazenamento.js');
let _store = armazenamento.criar({ dir: DIR });
const ehPg = () => _store.tipo === 'postgres';
// §354 — TESTE: troca a camada (ex.: pg-mem) e recarrega o cadastro do banco (simula reinício do servidor no mesmo
// banco). Só para a suíte rodar o servidor contra Postgres local sem tocar o Neon. Em produção, _store vem do boot.
async function _usarArmazenamentoTeste(store) { _store = store; _contas = new Map(); _carregado = false; _idxNick = null; await inicializar(); }
let _contas = new Map();   // token -> conta
let _carregado = false;

function _carregar() {
  if (_carregado) return;
  if (ehPg()) { _carregado = true; return; }   // Postgres: o Map é carregado no inicializar() assíncrono (boot)
  _carregado = true;
  for (const c of _store.carregarContasSync()) if (c && c.token) _contas.set(c.token, c);   // arquivo: carga preguiçosa sync
}
// BOOT assíncrono — server.js chama ANTES de aceitar conexões: conecta/migra, carrega o cadastro do banco, importa 1× se vazio.
async function inicializar() {
  await _store.pronto();
  if (ehPg()) { _contas = new Map(); for (const c of await _store.carregarContas()) if (c && c.token) _contas.set(c.token, c); }
  _carregado = true;
  return { armazenamento: _store.tipo };
}
async function drenar() { if (_store.drenar) await _store.drenar(); }
function _persistirC(c) { if (!c || !c.token) return; if (ehPg()) _store.agendarSalvar(c); else _store.salvarContaSync(c); }
// persiste UMA conta (quando `c` é dado) ou o conjunto inteiro (operação em lote). No arquivo, qualquer caso reescreve
// o arquivo (comportamento de sempre); no Postgres, `_persistir(c)` faz upsert só da conta `c` (barato).
function _persistir(c) { if (c) { _persistirC(c); return; } for (const x of _contas.values()) _persistirC(x); }
function _remover(token) { _contas.delete(token); if (ehPg()) _store.agendarRemover(token); else _store.removerContaSync(token); }

function _novoId() { return crypto.randomBytes(16).toString('hex'); }        // id público, opaco
function _novoToken() { return crypto.randomBytes(32).toString('base64url'); } // segredo do aparelho

// RANQUE zero, sempre (§221-d). pontos = classificador (SÓ o servidor mexe). vitorias/derrotas = o
// ratio EXIBIDO (estatística, nunca classifica). pico = maior pontuação da temporada (recompensa
// cosmética). cosmeticos = faixas conquistadas em temporadas passadas (status, não moeda).
function _ranqueZero() { return { pontos: 0, vitorias: 0, derrotas: 0, pico: 0, temporada: 1, cosmeticos: [] }; }

// PROVAÇÕES (§313/§314): o PROGRESSO, ao lado do ranque e SEPARADO da maestria (§215, local/cosmética).
// Só o servidor mexe (a Provação cumprida CONCEDE o deus). Conta SÓ PvP. Nasce vazio.
//   - `ativa`: a ÚNICA Provação ativa (deusKey), ou null (§314; nº de vagas = DOC.slotsGratis, hoje 1).
//   - `progresso`: {deus:{ativadaEm, obj:[…estado por objetivo…]}} — a ativa E as PAUSADAS (a pausada
//     guarda o progresso congelado). O formato de cada estado espelha o tipo do objetivo (server/missoes.js).
//   - `liberados`: {deus:true} — histórico das Provações conquistadas.
// Os contadores compartilhados do §241 (vitoriasPanteaoPvP/sequenciaPvP/sequenciaPanteaoPvP/vitoriasPvP/
// paresPvP/feitos/desbloqueio) SAÍRAM — sem consumidor após o modelo de objetivos (§95/§303). A migração
// abaixo os descarta (a posse dos deuses vive em perfil.deuses, não se perde; §314: o deploy zera contas).
function _missoesZero() { return { ativa: null, progresso: {}, liberados: {} }; }
function _garantirMissoes(c) {
  if (!c.missoes || typeof c.missoes !== 'object') c.missoes = _missoesZero();
  const m = c.missoes;
  if (typeof m.ativa === 'undefined') m.ativa = null;
  if (!m.progresso || typeof m.progresso !== 'object') m.progresso = {};
  if (!m.liberados || typeof m.liberados !== 'object') m.liberados = {};
  // §314 — MIGRAÇÃO: descarta os contadores legados do §241 (órfãos após os objetivos).
  for (const k of ['vitoriasPanteaoPvP', 'vitoriasPvP', 'sequenciaPvP', 'sequenciaPanteaoPvP', 'paresPvP', 'feitos', 'desbloqueio']) if (k in m) delete m[k];
  return m;
}
// projeção p/ o cliente DESENHAR (o servidor é autoritativo): a ativa + o progresso por objetivo + os
// deuses conquistados. O nº de vagas (slotsGratis) o cliente lê do próprio missoes.json (DOC), não daqui.
function missoesPublicas(c) {
  const m = _garantirMissoes(c);
  return { ativa: m.ativa || null, progresso: m.progresso, liberados: Object.keys(m.liberados).filter(k => m.liberados[k]) };
}

// ============================================================
// §318 — NÍVEIS DE HABILIDADE. O servidor é AUTORITATIVO (o cliente nunca informa nível). O nível
// vive na CONTA (paralelo a ranque/missões), não no perfil sincronizado — combate público, ambos os
// lados veem. Formato: c.niveis = { deusKey: { basico, habilidade, milagre } }, cada 1–4, default 1.
// FASE 0: SEM UI e SEM economia (subir nível é a Fase 2); o portão definirNivel já existe e recusa
// nível fora de 1–4 (a babá o prova). Nasce vazio {} = tudo no nível 1.
// ============================================================
const NIVEIS_SLOTS = ['basico', 'habilidade', 'milagre'];   // a PASSIVA está fora (§318)
const NIVEL_MIN = 1, NIVEL_MAX = 4;
function _niveisZero() { return {}; }
function _garantirNiveis(c) { if (!c.niveis || typeof c.niveis !== 'object') c.niveis = _niveisZero(); return c.niveis; }
// níveis EFETIVOS de um deus na conta (default 1 em cada slot; clamp defensivo 1–4).
function _niveisDeDeus(c, key) {
  const raw = (c && c.niveis && c.niveis[key]) || {};
  const out = {};
  for (const s of NIVEIS_SLOTS) { const n = raw[s]; out[s] = (typeof n === 'number' && n >= NIVEL_MIN && n <= NIVEL_MAX) ? (n | 0) : 1; }
  return out;
}
// mapa { deusKey: {basico,habilidade,milagre} } dos 3 deuses de um TIME — alimenta o montador
// autoritativo (o servidor monta os kits efetivos dos dois lados) E a projeção pública ao oponente.
function _niveisDeTime(c, time) { const m = {}; for (const k of (time || [])) m[k] = _niveisDeDeus(c, k); return m; }
// AUTORITATIVO: os níveis do MEU time (por token), para o servidor montar o kit efetivo do meu lado.
function niveisDoTime(token, time) { _carregar(); const c = _contas.get(token); return c ? _niveisDeTime(c, time) : _niveisDeTime(null, time); }
// PÚBLICO: os níveis dos deuses do time adversário que o oponente recebe para DESENHAR (tudo público).
function niveisPublicos(c, time) { return _niveisDeTime(c, time); }
// PORTÃO de escrita (Fase 2 gastará cópias aqui). FASE 0: sem UI, mas o portão já recusa fora de 1–4.
// token, deus, slot, nivel -> { ok, niveis } | { ok:false, codigo, erro }.
function definirNivel(token, deus, slot, nivel) {
  _carregar();
  const c = _contas.get(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  if (!NIVEIS_SLOTS.includes(slot)) return { ok: false, codigo: 'slot_invalido', erro: `slot inválido "${slot}" (só ${NIVEIS_SLOTS.join('/')} — a passiva não sobe)` };
  if (!Number.isInteger(nivel) || nivel < NIVEL_MIN || nivel > NIVEL_MAX) return { ok: false, codigo: 'nivel_invalido', erro: `nível fora de ${NIVEL_MIN}–${NIVEL_MAX}` };
  if (!possui(token, deus)) return { ok: false, codigo: 'deus_nao_possuido', erro: `você não possui: ${deus}` };
  const nv = _garantirNiveis(c);
  nv[deus] = Object.assign(_niveisDeDeus(c, deus), { [slot]: nivel });
  _persistir(c);
  return { ok: true, niveis: nv[deus] };
}

// FAIXA a partir dos pontos — SÓ o servidor decide (o cliente nunca classifica). A faixa mais alta
// cujo `min` <= pontos.
function faixaDe(pontos) {
  const p = Math.max(0, pontos | 0);
  let f = RANQ.faixas[0];
  for (const x of RANQ.faixas) if (p >= x.min) f = x;
  return f;
}
// o ratio EXIBIDO: vitórias/derrotas + a fração. NÃO classifica (os pontos classificam); o jogador vê.
function ratioDe(rq) {
  const v = (rq && rq.vitorias) || 0, d = (rq && rq.derrotas) || 0, t = v + d;
  return { vitorias: v, derrotas: d, total: t, fracao: t ? +(v / t).toFixed(3) : null };
}
function _contaPorId(id) { _carregar(); for (const c of _contas.values()) if (c.id === id) return c; return null; }
function _garantirRanque(c) { if (!c.ranque || typeof c.ranque.pontos !== 'number' || !Array.isArray(c.ranque.cosmeticos)) c.ranque = _ranqueZero(); if (typeof c.ranque.vitorias !== 'number') c.ranque.vitorias = 0; if (typeof c.ranque.derrotas !== 'number') c.ranque.derrotas = 0; if (typeof c.ranque.pico !== 'number') c.ranque.pico = c.ranque.pontos || 0; }

// APLICAR O RESULTADO DE UMA PARTIDA RANQUEADA — a ÚNICA porta que muda pontos, e ela é do SERVIDOR.
// O cliente NUNCA chega aqui: não há mensagem que some ponto. vencedorId/perdedorId vêm da sala
// (o servidor sabe quem venceu por st.fim.lado, não o cliente). motivo 'abandono' aplica a MESMA
// derrota que perder jogando (§223) — abandonar nunca custa menos. Idempotência é do chamador (sala.pontuado).
function aplicarResultadoRanqueado(vencedorId, perdedorId, motivo) {
  _carregar();
  const V = _contaPorId(vencedorId), D = _contaPorId(perdedorId);
  if (!V || !D) return { ok: false, codigo: 'conta_ausente' };
  _garantirRanque(V); _garantirRanque(D);
  const piso = RANQ.pontos.piso || 0;
  const antesV = V.ranque.pontos, antesD = D.ranque.pontos;
  V.ranque.pontos = Math.max(piso, antesV + (RANQ.pontos.vitoria || 0));
  D.ranque.pontos = Math.max(piso, antesD + (RANQ.pontos.derrota || 0));   // abandono = derrota (mesmo delta)
  V.ranque.vitorias += 1; D.ranque.derrotas += 1;                          // ratio exibido
  V.ranque.pico = Math.max(V.ranque.pico || 0, V.ranque.pontos);           // pico da temporada (cosmético)
  D.ranque.pico = Math.max(D.ranque.pico || 0, D.ranque.pontos);
  _persistir(V); _persistir(D);
  const proj = (c, antes) => ({ id: c.id, pontosAntes: antes, pontos: c.ranque.pontos, faixaAntes: faixaDe(antes), faixa: faixaDe(c.ranque.pontos), subiu: faixaDe(c.ranque.pontos).min > faixaDe(antes).min, desceu: faixaDe(c.ranque.pontos).min < faixaDe(antes).min });
  return { ok: true, motivo: motivo || null, vencedor: proj(V, antesV), perdedor: proj(D, antesD) };
}

// REINÍCIO DE TEMPORADA — reinício SUAVE (ninguém a zero; faixa alta desce mais). Antes de reiniciar,
// concede o COSMÉTICO da faixa de PICO da temporada (status, não moeda). Depois comprime os pontos.
function reiniciarTemporada() {
  _carregar();
  const comp = RANQ.temporada.compressao, piso = RANQ.pontos.piso || 0;
  let n = 0;
  for (const c of _contas.values()) {
    _garantirRanque(c);
    const faixaPico = faixaDe(c.ranque.pico || c.ranque.pontos);
    c.ranque.cosmeticos.push({ temporada: c.ranque.temporada, faixa: faixaPico.chave, nome: faixaPico.nome });
    c.ranque.pontos = Math.max(piso, Math.round(c.ranque.pontos * comp));   // reinício suave
    c.ranque.pico = c.ranque.pontos;
    c.ranque.temporada = (c.ranque.temporada || 1) + 1;
    n++;
  }
  _persistir();
  return { ok: true, contas: n };
}

// projeção do RANQUE para o cliente DESENHAR (faixa + ratio já calculados pelo servidor).
function ranquePublico(c) { _garantirRanque(c); return { pontos: c.ranque.pontos, faixa: faixaDe(c.ranque.pontos), temporada: c.ranque.temporada, ratio: ratioDe(c.ranque), cosmeticos: c.ranque.cosmeticos }; }

// ---- CRIAR: a conta nasce no servidor. Anônima, com faixa, ranque zero, perfil novo OU migrado. ----
// { faixaIdade, perfil? , agora? } -> { ok, conta } | { ok:false, codigo, erro }
//   - faixaIdade: 'menor' | 'maior' (obrigatória — a lei exige ter perguntado)
//   - perfil: SÓ para a migração única do perfil de desenvolvimento do dono. Ausente => nasce fresco
//             via novoPerfil (jogador novo NUNCA migra: nasce no servidor). O ranque é IGNORADO do
//             perfil que chega — o ranque não mora no perfil, começa em zero aqui.
function criar({ faixaIdade, perfil, agora } = {}) {
  _carregar();
  if (!FAIXAS.includes(faixaIdade)) return { ok: false, codigo: 'faixa_invalida', erro: `faixa de idade obrigatória e deve ser uma de ${FAIXAS.join('/')}` };
  const quando = typeof agora === 'number' ? agora : Date.now();
  const perfilConta = perfil ? _clone(perfil) : E.novoPerfil(quando, GRANT_GEMA);
  const conta = {
    id: _novoId(),
    token: _novoToken(),
    faixaIdade,                 // 'menor' | 'maior' — nunca a data
    nick: null,                 // reservado: vem só no PvP (F5.3). Ver planoDoNick().
    ranque: _ranqueZero(),      // §221-d: sempre zero, inclusive no perfil migrado
    missoes: _missoesZero(),    // F6/§228: contador de missão (progressão), só o servidor mexe, só PvP
    niveis: _niveisZero(),      // §318: níveis de habilidade por deus, só o servidor mexe. Nasce vazio = tudo nv1
    perfil: perfilConta,
    criadaEm: quando,
  };
  _contas.set(conta.token, conta);
  _persistir(conta);
  return { ok: true, conta };
}

// ---- ENTRAR: reabrir a MESMA conta pelo token guardado no aparelho. ----
// token -> { ok, conta } | { ok:false, codigo, erro }. Token desconhecido = recusa clara.
function entrar(token) {
  _carregar();
  if (!token || typeof token !== 'string') return { ok: false, codigo: 'sem_token', erro: 'falta o token da conta' };
  const c = _contas.get(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token não corresponde a nenhuma conta (foi excluída ou é de outro aparelho)' };
  return { ok: true, conta: c };
}

// ---- porToken: autenticação de UMA mensagem (o servidor exige token após o handshake). ----
// Não emite recusa formatada; só devolve a conta ou null. Quem chama monta a recusa.
function porToken(token) { _carregar(); return (token && _contas.get(token)) || null; }

// ---- EXCLUIR: exclusão DE VERDADE. A linha inteira some do cadastro e do arquivo. ----
// Não é marcação de 'apagado': depois disto o token não corresponde a nada, e o aparelho volta
// ao estado de primeira abertura. O QUE APAGA: tudo — id, token, faixa, ranque, nick, perfil,
// data de criação. O QUE PRESERVA: NADA. Não há dado pessoal a reter (conta anônima) nem
// obrigação legal de guardar; guardar qualquer coisa contradiria "exclusão de verdade".
// token -> { ok, apagou } | { ok:false, codigo, erro }
function excluir(token) {
  _carregar();
  if (!token || typeof token !== 'string') return { ok: false, codigo: 'sem_token', erro: 'falta o token da conta' };
  if (!_contas.has(token)) return { ok: false, codigo: 'token_invalido', erro: 'token não corresponde a nenhuma conta' };
  const c = _contas.get(token);
  if (c && c.nick && _idxNick) _idxNick.delete(normalizarNick(c.nick));   // libera o nick para outra conta
  _remover(token);
  return { ok: true, apagou: true };
}

// ============================================================
// F5.3 — NICK. Pedido na ENTRADA do PvP (não na 1ª abertura — atrito só onde serve).
// UNICIDADE por ÍNDICE sobre o nick NORMALIZADO, com reserva ATÔMICA no servidor (quem grava
// primeiro leva; o segundo recebe recusa). Node é single-thread: definirNick roda inteiro sem
// interrupção, então a reserva é atômica por construção. PALAVRA OFENSIVA: lista versionada +
// desfaz leetspeak antes de comparar (0->o, 3->e, 1->i, 4->a, 5->s, 7->t, @->a, $->s).
// ============================================================
function _semAcento(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
// normalização de EXIBIÇÃO->CHAVE: minúsculas, sem acento, espaços das pontas fora, espaços internos colapsados.
function normalizarNick(nick) { return _semAcento(String(nick || '').trim().toLowerCase()).replace(/\s+/g, ' '); }
// desfaz leetspeak (para 'n4z1' cair em 'nazi'); só para a checagem de bloqueio, não para a unicidade.
function _deLeet(s) { return s.replace(/0/g, 'o').replace(/3/g, 'e').replace(/1/g, 'i').replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't').replace(/@/g, 'a').replace(/\$/g, 's'); }
function _ofensivo(norm) {
  const alvo = _deLeet(norm).replace(/\s+/g, '');   // sem espaços: 's e u b o s t a' não escapa
  if ((BLOQUEIO.exatas || []).some(w => alvo === _deLeet(normalizarNick(w)).replace(/\s+/g, ''))) return true;
  return (BLOQUEIO.substrings || []).some(w => alvo.includes(_deLeet(normalizarNick(w)).replace(/\s+/g, '')));
}
// índice de unicidade: nickNormalizado -> id da conta. Construído sob demanda a partir do cadastro.
let _idxNick = null;
function _indice() {
  if (_idxNick) return _idxNick;
  _carregar();
  _idxNick = new Map();
  for (const c of _contas.values()) if (c.nick) _idxNick.set(normalizarNick(c.nick), c.id);
  return _idxNick;
}
// nickDisponivel: forma válida + não ofensivo + não em uso (por OUTRA conta). excetoId = a própria conta.
function nickDisponivel(nick, exetoId) {
  const norm = normalizarNick(nick);
  if (norm.length < NICK_MIN || norm.length > NICK_MAX) return { ok: false, codigo: 'nick_invalido', erro: `o nick tem de ter de ${NICK_MIN} a ${NICK_MAX} caracteres` };
  if (!/^[a-z0-9 ]+$/.test(norm)) return { ok: false, codigo: 'nick_invalido', erro: 'o nick só pode ter letras, números e espaço' };
  if (_ofensivo(norm)) return { ok: false, codigo: 'nick_ofensivo', erro: 'esse nick não é permitido' };
  const dono = _indice().get(norm);
  if (dono && dono !== exetoId) return { ok: false, codigo: 'nick_em_uso', erro: 'esse nick já está em uso — escolha outro' };
  return { ok: true, norm };
}
// definirNick: reserva ATÔMICA. token -> { ok, nick } | { ok:false, codigo, erro }.
function definirNick(token, nick) {
  _carregar();
  const c = _contas.get(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  const d = nickDisponivel(nick, c.id);
  if (!d.ok) return d;
  // libera o normalizado antigo da conta (se trocou de nick) e grava o novo
  if (c.nick) _indice().delete(normalizarNick(c.nick));
  c.nick = String(nick).trim().replace(/\s+/g, ' ');   // guarda a forma de EXIBIÇÃO (com acento/maiúsculas)
  _indice().set(d.norm, c.id);
  _persistir(c);
  return { ok: true, nick: c.nick };
}

// ---- POSSE (F5.3): o servidor valida que a conta POSSUI um deus. É a 1ª vez que a posse importa de
// verdade — o cliente NÃO pode ser confiado. Time com deus não possuído é RECUSA, não aviso.
function possui(token, key) { _carregar(); const c = _contas.get(token); return !!(c && c.perfil && c.perfil.deuses && c.perfil.deuses[key]); }
// valida um TIME de 3: existência, tamanho, sem repetição, e posse de cada um.
function validarTime(token, time) {
  _carregar();
  const c = _contas.get(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  if (!Array.isArray(time) || time.length !== 3) return { ok: false, codigo: 'time_invalido', erro: 'o time tem de ter exatamente 3 deuses' };
  if (new Set(time).size !== 3) return { ok: false, codigo: 'time_invalido', erro: 'sem deuses repetidos no time' };
  const faltam = time.filter(k => !possui(token, k));
  if (faltam.length) return { ok: false, codigo: 'deus_nao_possuido', erro: `você não possui: ${faltam.join(', ')}` };
  return { ok: true };
}

// ---- projeções: o que sai para o CLIENTE. O token NUNCA vaza numa consulta. ----
// paraDono: o que o próprio jogador recebe para desenhar sua conta (sem o token — já está no
// aparelho; e reenviá-lo à toa é vazá-lo em log/rede). Inclui o perfil (ele precisa dele).
function paraDono(c) {
  if (!c) return null;
  _garantirNiveis(c);
  return { id: c.id, faixaIdade: c.faixaIdade, nick: c.nick, ranque: ranquePublico(c), missoes: missoesPublicas(c), niveis: c.niveis, pontos: c.pontos || {}, pity: (c.gacha && c.gacha.pity) || 0, bilhetes: c.bilhetes || 0, vagasProvacao: _loja.vagasProvacao(c), perfil: c.perfil, criadaEm: c.criadaEm };
}
// publica: o que OUTRO jogador poderá ver (perfil competitivo). Sem token, sem perfil, sem faixa etária.
// Inclui nick + faixa (do servidor) + ratio EXIBIDO (não classifica; o jogador quer ver).
function publica(c) { if (!c) return null; return { id: c.id, nick: c.nick, ranque: ranquePublico(c) }; }

// ---- salvar o perfil de uma conta autenticada. ----
// §318 F2 E1 — A ECONOMIA É DO SERVIDOR. salvarPerfil NÃO grava mais o blob do cliente verbatim: aceita
// só os campos LOCAIS (desenho / preferência / progresso local); MOEDAS e a POSSE de deuses (ownership +
// copias) ficam SEMPRE as do servidor. Pontos e níveis nem moram no perfil (vivem na conta: c.niveis/
// c.pontos), então são imunes por construção. Assim um cliente que manda +99999 gemas, um deus novo ou
// copias:50 não muda NADA na conta — o crédito de economia passa a vir só das portas do servidor (invocação,
// replay do PvE). A única coisa do cliente DENTRO de deuses que sobrevive é a preferência `favorito`.
// §318b-3 — 'desafios' SAIU da lista branca: o estado do desafio (ativo + recarga) é AUTORITATIVO do servidor
// (débito de Essência + recarga de 8h, geridos por comprarPergaminho/fecharDesafio). O cliente lê, não grava —
// antes ele gravava o desafio (whitelisted) e gastava a Essência localmente (que o salvarPerfil nem aceitava):
// o defeito do §318b-3. Maestria segue local/cosmética.
const PERFIL_LOCAIS = ['versao', 'times', 'maestria', 'campanha', 'dominios', 'sandbox', 'invocacao', 'provacoes'];
function _mesclarPerfilLocal(base, cli) {
  const out = _clone(base || {});
  cli = cli || {};
  for (const campo of PERFIL_LOCAIS) if (cli[campo] !== undefined) out[campo] = _clone(cli[campo]);
  out.moedas = _clone((base && base.moedas) || { gema: 0, essencia: 0 });   // AUTORITATIVO: nunca do cliente
  out.deuses = {};                                                          // AUTORITATIVO: posse + copias do servidor
  const bd = (base && base.deuses) || {};
  for (const k in bd) { out.deuses[k] = _clone(bd[k]); const cd = cli.deuses && cli.deuses[k]; if (cd && typeof cd.favorito === 'boolean') out.deuses[k].favorito = cd.favorito; }   // só a preferência
  return out;
}
function salvarPerfil(token, perfil) {
  _carregar();
  const c = _contas.get(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  c.perfil = _mesclarPerfilLocal(c.perfil, perfil);
  _persistir(c);
  return { ok: true };
}

// §318 F2 E2 — CRÉDITO DE PvE POR REPLAY. contas é a dona da persistência: recebe um replay (ou o LOTE da
// fila offline do cliente), delega a VERIFICAÇÃO e o crédito ao módulo `pve` (re-simulação determinística
// no motor autoritativo) e persiste. O ledger de recompensa (pve.*) vive na CONTA, nunca no perfil que o
// cliente escreve — por isso teto/1ª-vez/1×-semana/dedupe não se forjam. Devolve a conta atualizada para
// o cliente redesenhar o saldo (a economia é do servidor: o cliente lê daqui, não credita local).
const _pve = require('./pve.js');
function creditarPve(token, replays, agora) {
  _carregar();
  const c = _contas.get(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  const lote = Array.isArray(replays) ? replays : (replays ? [replays] : []);
  const r = _pve.creditarLote(c, lote, agora);
  _persistir(c);
  return { ok: true, resultados: r.resultados, saldo: r.saldo, conta: paraDono(c) };
}

// §318 F2 E3 — INVOCAÇÃO e CÓPIAS no servidor. O cliente só PEDE; o sorteio, o débito de gema e a conversão
// (posse/pontos/essência) rodam aqui, autoritativos. Devolve a conta atualizada para o cliente redesenhar.
const _invoc = require('./invocacao.js');
const _loja = require('./loja.js');
const _pagamento = require('./pagamento.js');
function invocar(token, opts, agora) {
  _carregar();
  const c = _contas.get(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  const r = _invoc.invocar(c, opts || {}, agora);
  if (r.ok) _persistir(c);
  return Object.assign({}, r, { conta: paraDono(c) });
}
function subirNivel(token, deus, slot) {
  _carregar();
  const c = _contas.get(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  const r = _invoc.subirNivel(c, deus, slot);
  if (r.ok) _persistir(c);
  return Object.assign({}, r, { conta: paraDono(c) });
}
function comprarPergaminho(token, deus) {
  _carregar();
  const c = _contas.get(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  const r = _invoc.comprarPergaminho(c, deus, Date.now());
  if (r.ok) _persistir(c);
  return Object.assign({}, r, { conta: paraDono(c) });
}
// §318b-3 — encerrar a tentativa do desafio (cumpriu/desistiu) no servidor: zera o `ativo` (a recarga foi
// fixada na compra). A maestria, ao cumprir, é do cliente (cosmética).
function fecharDesafio(token, deus, cumpriu) {
  _carregar();
  const c = _contas.get(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  const r = _invoc.fecharDesafio(c, deus, cumpriu);
  if (r.ok) _persistir(c);
  return Object.assign({}, r, { conta: paraDono(c) });
}
// ============================================================================================
// §370 — LOJA. Wrappers AUTORITATIVOS: cada compra/crédito é ATÔMICO (muta a conta no Map e persiste write-through,
// Node single-thread) e IDEMPOTENTE (reservarRecibo do §354: o MESMO id não paga de novo). Verificação de pagamento/
// anúncio num ÚNICO lugar (server/pagamento.js). O cliente nunca soma. A regra de negócio pura vive em server/loja.js.
//
// IDEMPOTÊNCIA: a chave de recibo dedupe o reenvio/retry de UMA tentativa (semântica de idempotency-key). Uma NOVA
// tentativa do jogador (ex.: após "gemas insuficientes") usa um id NOVO — o id gasto numa falha não a bloqueia.
// Em compra de DINHEIRO verificamos o pagamento ANTES de reservar (não se queima recibo num pagamento recusado).
function _lojaConta(token) { _carregar(); return _contas.get(token) || null; }

// PACOTE DE GEMA (dinheiro). confirmacao = { simulado:true } no modo de teste (LOJA_SIMULADA=1).
async function comprarPacote(token, pacoteId, idCompra, confirmacao) {
  const c = _lojaConta(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  const pg = _pagamento.verificarCompra(confirmacao);
  if (!pg.ok) return { ok: false, codigo: pg.codigo, erro: pg.erro };
  if (!(await reservarRecibo('pacote:' + idCompra))) return { ok: true, duplicado: true, saldo: _invoc_saldo(c), conta: paraDono(c) };
  const r = _loja.comprarPacote(c, pacoteId, Date.now());
  if (r.ok) _persistir(c);
  return Object.assign({}, r, { conta: paraDono(c) });
}
// PASSE MENSAL (dinheiro).
async function comprarPasse(token, idCompra, confirmacao, agora) {
  const c = _lojaConta(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  const pg = _pagamento.verificarCompra(confirmacao);
  if (!pg.ok) return { ok: false, codigo: pg.codigo, erro: pg.erro };
  if (!(await reservarRecibo('passe:' + idCompra))) return { ok: true, duplicado: true, passe: _loja.estadoPasse(c, agora), conta: paraDono(c) };
  const r = _loja.comprarPasse(c, agora);
  if (r.ok) _persistir(c);
  return Object.assign({}, r, { conta: paraDono(c) });
}
// RESGATE do dia do passe — sem dinheiro, idempotente por dia (resgatados[dia]); sem recibo.
function resgatarPasse(token, agora, rng) {
  const c = _lojaConta(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  const r = _loja.resgatarPasse(c, agora, rng);
  if (r.ok) _persistir(c);
  return Object.assign({}, r, { conta: paraDono(c) });
}
// COMPRA DIRETA do Deus da Semana (GEMA, não dinheiro) — recibo só p/ dedupe de reenvio.
async function comprarDeusSemana(token, idCompra, agora) {
  const c = _lojaConta(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  if (!(await reservarRecibo('deussemana:' + idCompra))) return { ok: true, duplicado: true, conta: paraDono(c) };
  const r = _loja.comprarDeusSemana(c, agora);
  if (r.ok) _persistir(c);
  return Object.assign({}, r, { conta: paraDono(c) });
}
// MARCA via recarga diária (sem anúncio): usada quando o passe credita sem assistir, ou pela via do anúncio.
// ANÚNCIO: liberado por (passe ativo → credita SEM assistir) OU (confirmação de anúncio verificada). id único por crédito.
async function creditarAnuncio(token, tipo, id, confirmacao, extra, agora) {
  const c = _lojaConta(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  const liberado = _loja.passeAtivo(c, agora) || _pagamento.verificarAnuncio(confirmacao).ok;
  if (!liberado) return { ok: false, codigo: 'pagamento_indisponivel', erro: 'pagamento indisponível' };
  if (!(await reservarRecibo('anuncio:' + id))) return { ok: true, duplicado: true, conta: paraDono(c) };
  const r = _loja.creditarAnuncio(c, tipo, agora, extra || {});
  if (r.ok) _persistir(c);
  return Object.assign({}, r, { conta: paraDono(c) });
}
// VAGA EXTRA DE PROVAÇÃO (GEMA) — recibo p/ dedupe.
async function comprarVagaProvacao(token, idCompra) {
  const c = _lojaConta(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  if (!(await reservarRecibo('vagaprov:' + idCompra))) return { ok: true, duplicado: true, vagas: _loja.vagasProvacao(c), conta: paraDono(c) };
  const r = _loja.comprarVagaProvacao(c);
  if (r.ok) _persistir(c);
  return Object.assign({}, r, { conta: paraDono(c) });
}
// LEITURA do estado da loja (saldo, pacotes, calendário do passe, deus da semana, anúncios do dia, vagas).
function estadoLoja(token, agora) {
  const c = _lojaConta(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  return { ok: true, loja: _loja.estadoLoja(c, agora), conta: paraDono(c) };
}
function _invoc_saldo(c) { const m = (c.perfil && c.perfil.moedas) || {}; return { gema: m.gema || 0, essencia: m.essencia || 0 }; }

// §318 F2 — RENDA DE GEMA por vitória de PvP. Chamado por server/salas.js no fim da partida (por ID de
// conta, não token — a partida é keyed por conta). Persiste e devolve o resultado p/ o snapshot mostrar.
function creditarPvPVitoria(idVenc, rodadas, agora) {
  _carregar();
  const c = _contaPorId(idVenc);
  if (!c) return null;
  const r = _pve.creditarPvP(c, rodadas, agora);
  _persistir(c);
  return Object.assign({ contaId: idVenc }, r);
}
function devCredito(token) {
  _carregar();
  const c = _contas.get(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  const r = _invoc.devCredito(c);
  if (r.ok) _persistir(c);
  return Object.assign({}, r, { conta: paraDono(c) });
}
// tabela de CHANCES da faixa atual do jogador (para a tela da invocação, §318 F2 E4). SÓ leitura.
function chancesInvocacao(token) {
  _carregar();
  const c = _contas.get(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  const f = _invoc.faixaDoJogador(c);
  return { ok: true, faixa: f, faixaNome: (RANQ.faixas[f] && RANQ.faixas[f].nome) || '', faixaNomes: (RANQ.faixas || []).map(x => x.nome), linhaFaixa: _invoc.linhaFaixa(f), raridade: (ECON.invocacao && ECON.invocacao.taxas) || null, pity: (c.gacha && c.gacha.pity) || 0 };
}

// ---- PLANO DO NICK (F5.3, quando o PvP chegar). Documentado aqui para não se perder. ----
// O campo já existe (nick:null). Quando for pedido:
//  - UNICIDADE: índice único por nick_normalizado (minúsculas, sem acento, sem espaços nas pontas).
//    Reserva atômica no servidor (o servidor é autoritativo): quem grava primeiro leva; o segundo
//    recebe recusa 'nick_em_uso' e escolhe outro. Nada de unicidade no cliente (dá corrida).
//  - PALAVRA OFENSIVA: lista de bloqueio no servidor + checagem de leetspeak/substituição (0->o,
//    3->e, etc.) sobre o nick normalizado. Recusa 'nick_ofensivo' com motivo. Curadoria é do dono,
//    versionada em data/ — some do cliente, para poder atualizar sem publicar app novo.
//  - Até lá o nick fica null e não bloqueia nada; o PvP é que vai exigi-lo.
function planoDoNick() {
  return { unicidade: 'índice único por nick normalizado, reserva atômica no servidor', ofensa: 'lista de bloqueio + leetspeak no servidor, curadoria versionada em data/' };
}

// ---- utilitários de teste/manutenção ----
function _clone(x) { return JSON.parse(JSON.stringify(x)); }
function _total() { _carregar(); return _contas.size; }
function _resetParaTeste() { _contas = new Map(); _carregado = true; _idxNick = null; if (_store._resetSync) _store._resetSync(); else try { fs.rmSync(ARQ, { force: true }); } catch (e) {} }
// §354 — verificação em produção (sem segredo): {armazenamento, banco, contas}. Dispara o "acordar" do banco também.
async function saude() { try { const s = await _store.saude(); return s; } catch (e) { return { armazenamento: _store.tipo, banco: 'fora', contas: null }; } }
function acordarBanco() { try { if (_store.acordar) _store.acordar(); } catch (e) {} }
// §354 — RECIBO de prêmio (anti-duplicação pelo banco): true só na 1ª vez. Guarda em memória/arquivo quando sem banco.
async function reservarRecibo(chave) { return _store.reservarRecibo(chave); }
function _existeToken(token) { _carregar(); return _contas.has(token); }
// atalho de teste: dá um deus à conta (a posse importa no PvP; os testes montam times possuídos).
function _darDeus(token, key) { _carregar(); const c = _contas.get(token); if (c) { c.perfil.deuses[key] = c.perfil.deuses[key] || { copias: 1 }; } }
// atalho de teste: crava pontos de ranque numa conta (por token) — para exercitar a fila por faixa.
function _setPontos(token, n) { _carregar(); const c = _contas.get(token); if (c) { _garantirRanque(c); c.ranque.pontos = n; c.ranque.pico = Math.max(c.ranque.pico, n); } }

module.exports = {
  FAIXAS, GRANT_GEMA, ARQ, NICK_MIN, NICK_MAX, RANQ,
  criar, entrar, porToken, excluir, paraDono, publica, salvarPerfil, creditarPve, planoDoNick,
  invocar, subirNivel, comprarPergaminho, fecharDesafio, devCredito, chancesInvocacao, creditarPvPVitoria,
  comprarPacote, comprarPasse, resgatarPasse, comprarDeusSemana, creditarAnuncio, comprarVagaProvacao, estadoLoja,   // §370 Loja
  normalizarNick, nickDisponivel, definirNick, possui, validarTime,
  faixaDe, ratioDe, ranquePublico, aplicarResultadoRanqueado, reiniciarTemporada, _contaPorId,
  _garantirMissoes, missoesPublicas, _salvar: _persistir,
  NIVEIS_SLOTS, _garantirNiveis, niveisDoTime, niveisPublicos, definirNivel,   // §318
  inicializar, drenar, saude, acordarBanco, reservarRecibo, _usarArmazenamentoTeste,   // §354 persistência
  _total, _resetParaTeste, _existeToken, _darDeus, _setPontos,
};

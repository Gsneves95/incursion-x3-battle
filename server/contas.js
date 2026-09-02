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
const DIR = path.join(__dirname, 'dados');
const ARQ = path.join(DIR, 'contas.json');

// F5.3 — NICK: curadoria de palavra ofensiva versionada em data/ (§222: o que precisa mudar sem
// revisão de loja vive no servidor). Some do cliente; atualiza sem publicar app novo.
const BLOQUEIO = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'nick_bloqueio.json'), 'utf8')); } catch (e) { return { substrings: [], exatas: [] }; } })();
const NICK_MIN = 3, NICK_MAX = 16;

// ---- persistência simples em arquivo (dev, custo zero). Map em memória + write-through. ----
// server/dados/ é gitignored: são dados de jogador, não código.
let _contas = new Map();   // token -> conta
let _carregado = false;

function _garantirDir() { try { fs.mkdirSync(DIR, { recursive: true }); } catch (e) { /* já existe */ } }
function _carregar() {
  if (_carregado) return;
  _carregado = true;
  try {
    const b = fs.readFileSync(ARQ, 'utf8');
    const arr = JSON.parse(b);
    if (Array.isArray(arr)) for (const c of arr) if (c && c.token) _contas.set(c.token, c);
  } catch (e) { /* arquivo ainda não existe: cadastro vazio */ }
}
function _persistir() {
  _garantirDir();
  const arr = Array.from(_contas.values());
  fs.writeFileSync(ARQ, JSON.stringify(arr), 'utf8');
}

function _novoId() { return crypto.randomBytes(16).toString('hex'); }        // id público, opaco
function _novoToken() { return crypto.randomBytes(32).toString('base64url'); } // segredo do aparelho

// RANQUE zero, sempre. Uma função só para deixar o invariante §221-d num lugar único.
function _ranqueZero() { return { pontos: 0, nivel: 0, temporada: null }; }

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
    perfil: perfilConta,
    criadaEm: quando,
  };
  _contas.set(conta.token, conta);
  _persistir();
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
  _contas.delete(token);
  _persistir();
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
  _persistir();
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
  return { id: c.id, faixaIdade: c.faixaIdade, nick: c.nick, ranque: c.ranque, perfil: c.perfil, criadaEm: c.criadaEm };
}
// publica: o que OUTRO jogador poderá ver no PvP/ranqueado (F5.3+). Sem token, sem perfil, sem faixa.
function publica(c) { if (!c) return null; return { id: c.id, nick: c.nick, ranque: c.ranque }; }

// ---- salvar o perfil de uma conta autenticada (o servidor é autoritativo sobre o perfil). ----
function salvarPerfil(token, perfil) {
  _carregar();
  const c = _contas.get(token);
  if (!c) return { ok: false, codigo: 'token_invalido', erro: 'token inválido' };
  c.perfil = _clone(perfil);
  _persistir();
  return { ok: true };
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
function _resetParaTeste() { _contas = new Map(); _carregado = true; _idxNick = null; try { fs.rmSync(ARQ, { force: true }); } catch (e) {} }
function _existeToken(token) { _carregar(); return _contas.has(token); }
// atalho de teste: dá um deus à conta (a posse importa no PvP; os testes montam times possuídos).
function _darDeus(token, key) { _carregar(); const c = _contas.get(token); if (c) { c.perfil.deuses[key] = c.perfil.deuses[key] || { copias: 1 }; } }

module.exports = {
  FAIXAS, GRANT_GEMA, ARQ, NICK_MIN, NICK_MAX,
  criar, entrar, porToken, excluir, paraDono, publica, salvarPerfil, planoDoNick,
  normalizarNick, nickDisponivel, definirNick, possui, validarTime,
  _total, _resetParaTeste, _existeToken, _darDeus,
};

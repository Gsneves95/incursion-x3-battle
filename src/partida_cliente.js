// src/partida_cliente.js — F5.2: a PARTIDA no cliente. O servidor é o dono; o cliente DESENHA.
// A pureza do motor (§221) permite INTERFACE OTIMISTA: o cliente aplica a ação localmente e desenha
// na hora; o servidor confirma. Como o motor é determinístico, a confirmação deve SEMPRE bater.
//
// E SE DIVERGIR? Divergência não deveria existir — mas se existir, o cliente se CORRIGE pelo servidor
// (o servidor é a verdade) e isso fica VISÍVEL no log. Divergência silenciosa é o pior bug num jogo
// com ranque; aqui ela grita. O cliente NUNCA declara resultado: vitória/derrota/fim de turno chegam
// do servidor.
//
// TRANSPORTE injetável (WebSocket no app; duble nos testes). Motor por GLOBAL (como no build) com
// fallback injetável para o Node testar.

// hash canônico: DEVE ser byte-idêntico ao do servidor (server/motor-host.js). Um teste crava a
// igualdade (mesmo estado -> mesmo hash nos dois lados); se divergisse, toda comparação mentiria.
function _canon(x) {
  if (x === null || typeof x !== 'object') return JSON.stringify(x);
  if (Array.isArray(x)) return '[' + x.map(_canon).join(',') + ']';
  return '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + _canon(x[k])).join(',') + '}';
}
function _hash(s) {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return ('00000000' + h.toString(16)).slice(-8);
}
function hashEstadoCli(st) { return _hash(_canon(st)); }

// motor: usa os globais do build (agir, fimTurno, iaProximaAcao) com fallback injetável p/ teste.
let _deps = null;
function configurarPartida(deps) { _deps = deps || null; }
function _fn(nome) {
  if (_deps && typeof _deps[nome] === 'function') return _deps[nome];
  if (typeof globalThis !== 'undefined' && typeof globalThis[nome] === 'function') return globalThis[nome];
  throw new Error('partida_cliente: função do motor ausente: ' + nome);
}

const PROTO_VERSAO = 1;   // igual a src/conta.js / server/protocol.js
function _env(tipo, dados) { return Object.assign({ v: PROTO_VERSAO, tipo }, dados || {}); }
function _tokenMsg(t) { return t ? { token: t } : {}; }

// aplica o snapshot autoritativo do servidor à minha partida (substitui o estado desenhado).
function _absorver(MP, snap) {
  MP.st = snap.estado;
  MP.turnoDe = snap.turnoDe;
  MP.humano = snap.humano;
  MP.deadline = snap.deadline;
  MP.agora = snap.agora;
  MP.restanteMs = snap.restanteMs;
  MP.fim = snap.fim || null;   // SÓ o servidor decide o fim
  return MP;
}
// AVISO do cliente (divergência corrigida, recusa, tempo esgotado): canal SEPARADO do st.log. O
// st.log é ESTADO AUTORITATIVO e entra no hash — sujá-lo com anotação local do cliente faria todo
// hash seguinte divergir do servidor para sempre (o pior: divergência que se PROPAGA). A UI desenha
// st.log + MP.avisos juntos; só o servidor escreve no st.log.
function _aviso(MP, msg) { if (!Array.isArray(MP.avisos)) MP.avisos = []; MP.avisos.push({ turno: (MP.st && MP.st.turno) || 0, msg }); }

// rede de segurança de fim: MESMA regra do servidor (server/partida.js _garantirFim). Um lado varrido
// (todos !vivo, sem renascer pendente) = o outro venceu. A previsão do cliente tem de aplicar o mesmo,
// senão o hash local divergiria do servidor num fim por varredura de início de turno.
function _garantirFimCli(st) {
  if (!st || st.fim) return;
  for (let i = 0; i < 2; i++) {
    if (st.lados[i].units.every(u => !u.vivo && !u.pendenteRenascer)) { st.fim = { tipo: 'fim', resultado: 'vitoria', lado: 1 - i }; return; }
  }
}

// NOVA partida contra o servidor. Retorna a partida-cliente (MP) já desenhável.
async function novaPartida(transporte, pergaminho, opts = {}) {
  const extra = {};
  // pergaminho pode ser a MONTAGEM (objeto) ou só a CHAVE (string) — o servidor carrega a autoritativa.
  if (typeof pergaminho === 'string') extra.pergaminhoKey = pergaminho; else extra.pergaminho = pergaminho;
  if (typeof opts.limiteMs === 'number') extra.limiteMs = opts.limiteMs;   // afinar/testar o relógio (cliente real não manda)
  const r = await transporte.pedir(_env('novaPartida', Object.assign(extra, _tokenMsg(opts.token))));
  if (!r || r.tipo !== 'partida') return { erro: (r && r.erro) || 'não foi possível iniciar a partida', codigo: r && r.codigo };
  return _absorver({ st: null, avisos: [] }, r);
}

// RETOMAR (F5.4): a conexão nova pergunta se a conta tem partida em curso. Se sim, recebe o ESTADO
// INTEIRO (o servidor é a verdade — nada de reconstruir do lado do cliente) e volta à batalha. LEITURA
// PURA no servidor: não avança turno, não zera relógio. `desdeLog` marca o que mudou na ausência.
async function retomar(transporte, opts = {}) {
  const r = await transporte.pedir(_env('retomar', _tokenMsg(opts.token)));
  if (!r) return { fase: 'erro', erro: 'sem resposta' };
  if (r.tipo === 'semPartida') return { fase: 'semPartida' };
  if (r.tipo !== 'partida') return { fase: 'erro', erro: r.erro, codigo: r.codigo };
  const MP = _absorver({ st: null, avisos: [] }, r);
  MP.retomada = true;
  MP.desdeLog = (typeof r.desdeLog === 'number') ? r.desdeLog : 0;
  const perdeu = MP.st && Array.isArray(MP.st.log) && MP.desdeLog < MP.st.log.length;
  _aviso(MP, perdeu ? '↩ partida retomada — veja o que aconteceu enquanto você esteve fora' : '↩ partida retomada');
  return { fase: 'retomada', MP };
}

// JOGAR uma ação: OTIMISTA (aplica local e já desenha) + confirmação do servidor.
//  - servidor RECUSA  -> desfaz a ação otimista (volta ao estado de antes) e loga o motivo. VISÍVEL.
//  - servidor CONFIRMA -> compara o hash local com o do servidor:
//      igual    -> mantém o que já desenhou (o caso normal, sempre).
//      diferente-> substitui pelo estado do servidor e LOGA a divergência corrigida. VISÍVEL.
async function jogar(transporte, MP, op, opts = {}) {
  const antes = JSON.stringify(MP.st);   // para desfazer se o servidor recusar
  const r = _fn('agir')(MP.st, op.uid, op.slot, op.alvos || [], op.escolhas || null, op.modo || null);
  if (!r || !r.ok) {
    // o próprio motor local recusou: nem manda ao servidor (mesma regra dos dois lados). Restaura
    // (caso o motor tenha tocado o estado antes de falhar) e avisa — sem sujar o st.log autoritativo.
    MP.st = JSON.parse(antes);
    _aviso(MP, '✗ ' + ((r && r.erro) || 'ação inválida'));
    return { ok: false, local: true };
  }
  const hashLocal = hashEstadoCli(MP.st);   // otimista: já desenhado pelo chamador após isto

  const resp = await transporte.pedir(_env('jogar', Object.assign({ uid: op.uid, slot: op.slot, alvos: op.alvos, escolhas: op.escolhas, modo: op.modo }, _tokenMsg(opts.token))));
  if (!resp || resp.tipo === 'recusado' || resp.tipo === 'erro') {
    // o servidor recusou o que o cliente já aplicou: DESFAZ (o servidor é a verdade) e mostra por quê.
    MP.st = JSON.parse(antes);
    _aviso(MP, '✗ ação recusada pelo servidor: ' + ((resp && resp.erro) || 'motivo desconhecido'));
    return { ok: false, recusado: true, codigo: resp && resp.codigo };
  }
  if (resp.tipo !== 'partida') return { ok: false, erro: 'resposta inesperada: ' + resp.tipo };

  if (resp.hash === hashLocal) {
    // confirmou e bateu (o caso normal): mantém o desenho local, só atualiza relógio/turno/fim.
    MP.turnoDe = resp.turnoDe; MP.deadline = resp.deadline; MP.agora = resp.agora; MP.restanteMs = resp.restanteMs; MP.fim = resp.fim || null;
    return { ok: true, divergiu: false };
  }
  // DIVERGÊNCIA (não deveria acontecer): corrige pelo servidor e grita no log.
  const antesHash = hashLocal;
  _absorver(MP, resp);
  _aviso(MP, `⚠ divergência corrigida pelo servidor (cliente ${antesHash} ≠ servidor ${resp.hash})`);
  return { ok: true, divergiu: true, hashLocal: antesHash, hashServidor: resp.hash };
}

// ENCERRAR o turno: OTIMISTA de ponta a ponta — o cliente prevê o próprio fim de turno E a jogada
// inteira da IA do oponente (a pureza permite: mesmo motor, mesma IA, determinístico) e desenha; o
// servidor confirma. Diverge -> corrige e loga. É a demonstração mais forte da interface otimista.
async function encerrar(transporte, MP, opts = {}) {
  const humano = MP.humano;
  // previsão local: fimTurno(humano) -> laço da IA -> fimTurno(oponente) (espelha o servidor)
  _fn('fimTurno')(MP.st);
  let guarda = 0;
  while (!MP.st.fim && MP.st.ativo !== humano && guarda++ < 200) {
    const mv = _fn('iaProximaAcao')(MP.st, 'normal');
    if (!mv) { _fn('fimTurno')(MP.st); break; }
    const r = _fn('agir')(MP.st, mv.uid, mv.slot, mv.alvos || [], mv.escolhas || null, mv.modo || null);
    if (!r || !r.ok) { _fn('fimTurno')(MP.st); break; }
  }
  _garantirFimCli(MP.st);   // MESMA rede de segurança do servidor (server/partida.js) — mantém o hash em lockstep
  const hashLocal = hashEstadoCli(MP.st);

  const resp = await transporte.pedir(_env('encerrar', _tokenMsg(opts.token)));
  if (!resp || resp.tipo !== 'partida') {
    if (resp && resp.tipo === 'recusado') { _aviso(MP, '✗ fim de turno recusado: ' + (resp.erro || '')); return { ok: false, recusado: true, codigo: resp.codigo }; }
    return { ok: false, erro: (resp && resp.erro) || 'sem resposta do servidor' };
  }
  if (resp.hash === hashLocal) {
    MP.turnoDe = resp.turnoDe; MP.deadline = resp.deadline; MP.agora = resp.agora; MP.restanteMs = resp.restanteMs; MP.fim = resp.fim || null;
    return { ok: true, divergiu: false, cpuOps: resp.cpuOps || [] };
  }
  const antesHash = hashLocal;
  _absorver(MP, resp);
  _aviso(MP, `⚠ divergência corrigida pelo servidor (cliente ${antesHash} ≠ servidor ${resp.hash})`);
  return { ok: true, divergiu: true, cpuOps: resp.cpuOps || [], hashLocal: antesHash, hashServidor: resp.hash };
}

// PUSH do servidor (o relógio estourou): o servidor empurrou um novo estado sem eu pedir. Absorve e
// mostra o que aconteceu (turno passou por tempo, ou abandono). O cliente só desenha.
function aplicarPush(MP, msg) {
  if (!msg || msg.tipo !== 'partida') return MP;
  _absorver(MP, msg);
  if (msg.abandono) _aviso(MP, '⏱ tempo esgotado — derrota por abandono (o servidor encerrou)');
  else if (msg.autopassou) _aviso(MP, '⏱ tempo esgotado — seu turno passou');
  return MP;
}

// Handle de NAMESPACE para o resto do bundle (evita colisão de nomes genéricos como `jogar`/`encerrar`
// no escopo único concatenado). No build isto vira um global; a view/turno chamam PARTIDA_CLI.jogar(...).
const PARTIDA_CLI = { hashEstadoCli, configurarPartida, novaPartida, retomar, jogar, encerrar, aplicarPush };

if (typeof module !== 'undefined') module.exports = {
  hashEstadoCli, configurarPartida, novaPartida, retomar, jogar, encerrar, aplicarPush,
};

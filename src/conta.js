// src/conta.js — F5.1: a CONTA no cliente. O jogador NUNCA vê login. O aparelho guarda um token
// opaco; o servidor é a fonte da verdade. Este módulo é a borda: fala com o servidor por um
// TRANSPORTE injetável (WebSocket no app; um duble nos testes — o jsdom não tem WebSocket), guarda
// o token no localStorage, e conduz a máquina de estados de abertura/criação/exclusão.
//
// DORMENTE SEM SERVIDOR: se não há transporte (aberto por file://, ou servidor fora do ar), o app
// roda 100% local como sempre — nenhuma tela de login, nenhuma trava. A conta só entra em cena
// quando há servidor. É isso que mantém as 28 suítes e o modo offline intactos.
//
// A versão do protocolo é declarada aqui também (o cliente tem a SUA versão): incompatível com o
// servidor = recusa clara. DEVE casar com server/protocol.js.
const PROTO_VERSAO_CLIENTE = 1;
const CHAVE_TOKEN  = 'incursion:token';
const CHAVE_MIGROU = 'incursion:conta-migrou';   // marca que o perfil de dev já migrou (migra UMA vez)

// ---- token no aparelho (persiste ao fechar/reabrir; é o que reabre a MESMA conta) ----
function lerToken() { try { return localStorage.getItem(CHAVE_TOKEN) || null; } catch (e) { return null; } }
function guardarToken(t) { try { localStorage.setItem(CHAVE_TOKEN, t); return true; } catch (e) { return false; } }
function apagarToken() { try { localStorage.removeItem(CHAVE_TOKEN); } catch (e) {} }

// Havia perfil no disco ANTES do sistema de contas rodar? (chamar no boot, ANTES de iniciar()).
// É o que separa o perfil de DESENVOLVIMENTO do dono (progresso real a migrar UMA vez) de uma
// instalação NOVA (nasce no servidor, nunca migra). Sem token + com perfil pré-existente + sem
// marca de migração = é o perfil do dono a carregar.
function perfilPreexistente(chavePerfil) {
  try { return localStorage.getItem(chavePerfil || 'incursion:perfil') != null; } catch (e) { return false; }
}
function jaMigrou() { try { return localStorage.getItem(CHAVE_MIGROU) != null; } catch (e) { return false; } }
function marcarMigrou() { try { localStorage.setItem(CHAVE_MIGROU, '1'); } catch (e) {} }

// ---- envelope versionado + pedir (request/response sequencial; a taxa é ~0,2 msg/s) ----
function envelope(tipo, dados) { return Object.assign({ v: PROTO_VERSAO_CLIENTE, tipo }, dados || {}); }

// iniciarConta(transporte, { tinhaPerfil, perfilLocal }) -> Promise<resultado>.
// resultado.fase:
//   'offline'        — sem transporte/servidor: app roda local, sem conta (dormente)
//   'perguntarFaixa' — servidor ok, sem conta: a UI deve mostrar o age-gate (nunca um login)
//   'entrou'         — token válido: reabriu a MESMA conta (resultado.conta)
async function iniciarConta(transporte, opts = {}) {
  if (!transporte) return { fase: 'offline', motivo: 'sem transporte' };
  let ola;
  try { ola = await transporte.pedir(envelope('ola')); }
  catch (e) { return { fase: 'offline', motivo: 'servidor inacessível: ' + ((e && e.message) || e) }; }
  if (!ola || ola.tipo !== 'ola') {
    if (ola && ola.tipo === 'recusado') return { fase: 'offline', motivo: ola.erro, recusado: true };
    return { fase: 'offline', motivo: 'handshake falhou' };
  }
  const token = lerToken();
  if (token) {
    const r = await transporte.pedir(envelope('entrar', { token }));
    if (r && r.tipo === 'conta') return { fase: 'entrou', conta: r.conta };
    // token não vale mais (conta excluída, ou outro aparelho): esquece e trata como 1ª abertura
    apagarToken();
  }
  return { fase: 'perguntarFaixa' };
}

// criarConta(transporte, { faixaIdade, tinhaPerfil, perfilLocal }) -> Promise<resultado>.
// Cria a conta anônima EM SILÊNCIO (o jogador só respondeu a faixa). Migra o perfil de dev UMA vez.
async function criarConta(transporte, opts = {}) {
  const faixaIdade = opts.faixaIdade;
  const dados = { faixaIdade };
  // migração única: só o perfil de DEV pré-existente, e só se ainda não migrou. Jogador novo nasce
  // no servidor (sem perfil no pedido). O RANQUE começa zero de qualquer forma (o servidor força).
  const migra = opts.tinhaPerfil && !jaMigrou() && opts.perfilLocal;
  if (migra) dados.perfil = opts.perfilLocal;
  const r = await transporte.pedir(envelope('criarConta', dados));
  if (!r || r.tipo !== 'conta') return { fase: 'erro', codigo: (r && r.codigo) || 'falhou', erro: (r && r.erro) || 'não foi possível criar a conta' };
  guardarToken(r.token);
  if (migra) marcarMigrou();
  return { fase: 'entrou', conta: r.conta, migrou: !!migra };
}

// excluir(transporte) -> Promise<resultado>. Exclusão DE VERDADE no servidor + o aparelho volta à
// primeira abertura (token apagado; o perfil local também é apagado pela borda, ver view).
async function excluir(transporte) {
  const token = lerToken();
  if (!token) { apagarToken(); return { fase: 'excluida', semConta: true }; }
  let r = null;
  try { r = await transporte.pedir(envelope('excluirConta', { token })); } catch (e) {}
  apagarToken();
  try { localStorage.removeItem(CHAVE_MIGROU); } catch (e) {}
  if (r && r.tipo === 'contaExcluida') return { fase: 'excluida', apagou: true };
  // mesmo se o servidor não confirmou (offline), o aparelho já não tem mais o token: volta ao início
  return { fase: 'excluida', apagou: false, motivo: (r && r.erro) || 'sem confirmação do servidor' };
}

// ---- TRANSPORTE WebSocket para o app. Resolve null se não se aplica (file://) — deixando o app
// dormente. Faz pergunta/resposta sequencial (nada de tempo real). Timeout curto para não travar
// a abertura se o servidor estiver fora. ----
function criarTransporteWS(url, opts = {}) {
  return new Promise((resolve) => {
    if (typeof WebSocket === 'undefined') return resolve(null);
    let alvo = url;
    if (!alvo) {
      try {
        const loc = (typeof location !== 'undefined') ? location : null;
        if (!loc || !/^https?:$/.test(loc.protocol)) return resolve(null);   // file:// -> dormente
        alvo = (loc.protocol === 'https:' ? 'wss://' : 'ws://') + loc.host;
      } catch (e) { return resolve(null); }
    }
    let ws;
    try { ws = new WebSocket(alvo); } catch (e) { return resolve(null); }
    const prazo = setTimeout(() => { try { ws.close(); } catch (e) {} resolve(null); }, opts.timeout || 2500);
    ws.onerror = () => { clearTimeout(prazo); resolve(null); };
    ws.onopen = () => {
      clearTimeout(prazo);
      const fila = [];
      ws.onmessage = (ev) => { const cb = fila.shift(); if (cb) { try { cb(JSON.parse(ev.data)); } catch (e) { cb(null); } } };
      resolve({
        pedir: (msg) => new Promise((res) => { fila.push(res); try { ws.send(JSON.stringify(msg)); } catch (e) { fila.pop(); res(null); } }),
        fechar: () => { try { ws.close(); } catch (e) {} },
      });
    };
  });
}

if (typeof module !== 'undefined') module.exports = {
  PROTO_VERSAO_CLIENTE, CHAVE_TOKEN, CHAVE_MIGROU,
  lerToken, guardarToken, apagarToken, perfilPreexistente, jaMigrou, marcarMigrou,
  envelope, iniciarConta, criarConta, excluir, criarTransporteWS,
};

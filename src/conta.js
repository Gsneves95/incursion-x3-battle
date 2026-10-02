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
    // token não vale mais (conta excluída, OUTRO aparelho, ou §274/§318 F2 E4: um DEPLOY zerou as contas de
    // teste no disco efêmero do Render). Esquece e trata como 1ª abertura, MAS sinaliza `recomecou` p/ o aviso honesto.
    apagarToken();
    return { fase: 'perguntarFaixa', recomecou: true };
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

// ---- TRANSPORTE WebSocket para o app. Resolve null se não se aplica (file:// / sem WebSocket / o
// servidor não respondeu na 1ª abertura) — deixando o app dormente. Depois de aberto, é AUTO-CURATIVO:
//
// §318b (defeito do dono: invocar não fazia NADA) — a versão antiga casava resposta↔pedido por ORDEM
// (FIFO) e NÃO tinha nem tempo limite nem tratamento de queda. No celular a WebSocket morre em silêncio
// (2º plano, troca de rede, o Render ocioso fecha o socket): o `pedir` pendente ficava PENDURADO para
// sempre, o `S._invocando` travava em true e todo toque seguinte era engolido — sem resultado, sem aviso.
// Agora: cada pedido leva um `rid` e a resposta devolve o MESMO rid (correlação, não ordem); cada pedido
// tem TEMPO LIMITE (estourou → resolve com {tipo:'semResposta',codigo:'sem_conexao'}, nunca pendura); a
// QUEDA do socket (onclose/onerror) resolve TODOS os pendentes com o mesmo sentinela; e o `pedir` RELIGA
// o socket sozinho quando ele caiu. Resposta sem rid → cai no mais antigo (compat. retro). Um pedido
// anterior sem resposta JAMAIS trava os seguintes (cada um tem seu próprio rid + prazo).
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
    const PRAZO_PEDIDO = opts.pedidoTimeout || 12000;   // teto por pedido (religa/avisa, nunca pendura)
    const SEM = { tipo: 'semResposta', codigo: 'sem_conexao', erro: 'sem conexão com o servidor' };
    let ws = null, seq = 0, _onPush = null, resolvido = false;
    const pend = new Map();     // rid -> { res, timer }
    const ordem = [];           // rids na ordem de envio (fallback p/ resposta sem rid)

    function soltar(rid, valor) {
      const p = pend.get(rid); if (!p) return;
      clearTimeout(p.timer); pend.delete(rid);
      const i = ordem.indexOf(rid); if (i >= 0) ordem.splice(i, 1);
      try { p.res(valor); } catch (e) {}
    }
    function soltarTodos(valor) { for (const rid of [...ordem]) soltar(rid, valor); }

    function conectar() {
      if (ws && (ws.readyState === 0 || ws.readyState === 1)) return;   // já conectando/aberto
      let s; try { s = new WebSocket(alvo); } catch (e) { ws = null; return; }
      ws = s;   // handlers presos a ESTE socket (s): um socket velho fechando não mexe no novo (religar rápido)
      s.onopen = () => { if (!resolvido) { resolvido = true; clearTimeout(prazoAbrir); resolve(api); } };
      s.onmessage = (ev) => {
        let m = null; try { m = JSON.parse(ev.data); } catch (e) {}
        if (m && m.push) { if (_onPush) _onPush(m); return; }   // não-solicitada (relógio/PvP): nunca casa pedido
        if (m && m.rid != null && pend.has(m.rid)) return soltar(m.rid, m);
        if (ordem.length) return soltar(ordem[0], m);           // resposta sem rid → o mais antigo (compat.)
      };
      s.onerror = () => { /* o onclose limpa; evita resolver null após já aberto */ };
      s.onclose = () => { if (ws === s) { ws = null; soltarTodos(SEM); } };   // só a queda do socket ATUAL solta pendentes
    }

    // 1ª abertura: se não abrir no prazo, o app fica DORMENTE (resolve null) — contrato preservado
    // (file://, servidor fora no boot). Depois de aberto uma vez, quedas são auto-curadas.
    const prazoAbrir = setTimeout(() => { if (!resolvido) { resolvido = true; try { if (ws) ws.close(); } catch (e) {} resolve(null); } }, opts.timeout || 2500);

    const api = {
      pedir: (msg) => new Promise((res) => {
        const rid = ++seq; try { msg.rid = rid; } catch (e) {}
        const timer = setTimeout(() => soltar(rid, SEM), PRAZO_PEDIDO);
        pend.set(rid, { res, timer }); ordem.push(rid);
        if (!ws || ws.readyState > 1) conectar();   // socket caiu: religa p/ este e os próximos
        try {
          if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
          else if (ws && ws.readyState === 0) ws.addEventListener('open', () => { try { if (pend.has(rid)) ws.send(JSON.stringify(msg)); } catch (e) {} }, { once: true });
          // sem socket: o timer resolve sem_conexao; a próxima chamada tenta reconectar
        } catch (e) { soltar(rid, SEM); }
      }),
      aoPush: (cb) => { _onPush = cb; },
      fechar: () => { try { if (ws) ws.close(); } catch (e) {} },
      // §318b-2 — RECONEXÃO PROATIVA: o app chama religar() ao voltar ao foco (no celular o socket cai sempre
      // no 2º plano). Idempotente: se já está aberto/conectando, no-op; se caiu, reergue ANTES do 1º toque.
      religar: () => { conectar(); },
      estaViva: () => !!ws && ws.readyState === 1,
    };

    conectar();
  });
}

if (typeof module !== 'undefined') module.exports = {
  PROTO_VERSAO_CLIENTE, CHAVE_TOKEN, CHAVE_MIGROU,
  lerToken, guardarToken, apagarToken, perfilPreexistente, jaMigrou, marcarMigrou,
  envelope, iniciarConta, criarConta, excluir, criarTransporteWS,
};

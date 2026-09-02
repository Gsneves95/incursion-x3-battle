// server/server.js — F5.0: o SERVIDOR LOCAL mínimo (dev, custo zero — sem provedor, sem deploy).
// Só o suficiente: serve o dist, abre um WebSocket, e roda o MOTOR AUTORITATIVO (importado, não copiado).
// Subir:  npm run serve       (builda o dist e sobe)   ·   ou:  node server/server.js
// Abre em http://localhost:8788  (PORT=... para trocar a porta).
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const proto = require('./protocol.js');
const host = require('./motor-host.js');
const contas = require('./contas.js');
const partidaCtrl = require('./partida.js');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 8788;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.js': 'text/javascript' };

// estático mínimo: / -> dist/incursion.html ; /skills|/banners|/icon... -> web/ ; sem path traversal.
function servirEstatico(req, res) {
  let rel = decodeURIComponent((req.url.split('?')[0]) || '/');
  if (rel === '/' || rel === '/index.html') return enviar(res, path.join(ROOT, 'dist', 'incursion.html'));
  rel = rel.replace(/^\/+/, '');
  if (rel.includes('..')) { res.writeHead(400); return res.end('caminho inválido'); }
  // assets do jogo moram em web/ (skills, banners, ícones, manifest); o html os referencia por caminho relativo
  const alvo = path.join(ROOT, 'web', rel);
  if (fs.existsSync(alvo) && fs.statSync(alvo).isFile()) return enviar(res, alvo);
  res.writeHead(404); res.end('não encontrado');
}
function enviar(res, arquivo) {
  fs.readFile(arquivo, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('não encontrado'); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream' });
    res.end(buf);
  });
}

const server = http.createServer(servirEstatico);
const wss = new WebSocketServer({ server });

// Uma conexão = uma sessão de partida autoritativa.
//  - `partida` (F5.0): estado cru para o ARNÊS de determinismo (montar/agir/fim aplicam a op exata,
//    sem dirigir a IA — é a prova de estado idêntico passo a passo, servidor==cliente).
//  - `P` (F5.2): a PARTIDA de verdade — o servidor valida cada ação, dirige a IA do oponente, é dono
//    do fim e do relógio (setTimeout). O cliente desenha o que volta e NUNCA declara resultado.
wss.on('connection', (ws) => {
  let partida = null;         // F5.0: arnês de determinismo
  let P = null;               // F5.2: a partida autoritativa (server/partida.js)
  let relogioTimer = null;    // F5.2: o relógio do turno é do SERVIDOR
  const responder = (tipo, dados) => ws.send(JSON.stringify(proto.envelope(tipo, dados)));
  const snapshot = () => ({ estado: JSON.parse(host.serializar(partida)), hash: host.hashEstado(partida), bytes: host.tamanhoBytes(partida) });

  // O RELÓGIO no servidor: arma um disparo no fim do turno do humano. Ao estourar, o servidor
  // aplica a regra (turno passa; 3 turnos perdidos = abandono) e EMPURRA o novo estado (push:true).
  function pararRelogio() { if (relogioTimer) { clearTimeout(relogioTimer); relogioTimer = null; } }
  function armarRelogio() {
    pararRelogio();
    if (!P || P.fim || P.st.ativo !== P.humano) return;   // só corre no turno do humano
    const ms = Math.max(0, P.deadline - Date.now());
    relogioTimer = setTimeout(() => {
      relogioTimer = null;
      if (!P || P.fim) return;
      const r = partidaCtrl.estourarTempo(P, { agora: Date.now() });
      // empurra o estado autoritativo sem o cliente ter pedido — o relógio é do servidor
      responder('partida', Object.assign(partidaCtrl.estado(P, Date.now()), { push: true, autopassou: !!r.autopassou, abandono: !!r.abandono, cpuOps: r.cpuOps || [] }));
      armarRelogio();   // rearma se voltou ao humano e a partida não acabou
    }, ms);
  }

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch (e) { return responder('erro', { erro: 'JSON inválido' }); }
    // 1ª coisa SEMPRE: a versão do protocolo. Incompatível = recusa clara, nunca silenciosa.
    const vc = proto.checarVersao(msg);
    if (!vc.ok) return responder('recusado', { codigo: vc.codigo, erro: vc.erro });
    // 2ª: depois do handshake, TODA mensagem de jogo leva token. Sem token válido = recusa clara.
    const tc = proto.checarToken(msg);
    if (!tc.ok) return responder('recusado', { codigo: tc.codigo, erro: tc.erro });
    if (proto.exigeToken(msg.tipo)) {
      const conta = contas.porToken(msg.token);
      if (!conta) return responder('recusado', { codigo: 'token_invalido', erro: 'token não corresponde a nenhuma conta — reabra o aplicativo' });
      ws._conta = conta;   // autenticada nesta mensagem
    }

    switch (msg.tipo) {
      case 'ola':
        return responder('ola', { servidor: 'incursion-f5', motor: 'autoritativo', versao: proto.PROTOCOL_VERSION });

      // ---- F5.1: CONTAS. Anônima na criação, faixa obrigatória, token de volta, exclusão de verdade. ----
      case 'criarConta': {
        const r = contas.criar({ faixaIdade: msg.faixaIdade, perfil: msg.perfil || null });
        if (!r.ok) return responder('recusado', { codigo: r.codigo, erro: r.erro });
        // ÚNICA vez que o token viaja de volta: o aparelho o guarda para reabrir a mesma conta.
        return responder('conta', { token: r.conta.token, conta: contas.paraDono(r.conta) });
      }
      case 'entrar': {
        const r = contas.entrar(msg.token);
        if (!r.ok) return responder('recusado', { codigo: r.codigo, erro: r.erro });
        return responder('conta', { conta: contas.paraDono(r.conta) });   // token NÃO reenviado (já está no aparelho)
      }
      case 'excluirConta': {
        const r = contas.excluir(msg.token);
        if (!r.ok) return responder('recusado', { codigo: r.codigo, erro: r.erro });
        ws._conta = null;
        return responder('contaExcluida', { apagou: true });   // o aparelho apaga o token e volta à 1ª abertura
      }
      case 'salvarPerfil': {
        if (!msg.perfil) return responder('erro', { erro: 'falta o perfil' });
        const r = contas.salvarPerfil(msg.token, msg.perfil);
        if (!r.ok) return responder('recusado', { codigo: r.codigo, erro: r.erro });
        return responder('perfilSalvo', { ok: true });
      }
      case 'montar':
        if (!msg.pergaminho) return responder('erro', { erro: 'falta o pergaminho' });
        partida = host.montar(msg.pergaminho);
        return responder('estado', snapshot());
      case 'agir':
      case 'fim': {
        if (!partida) return responder('erro', { erro: 'sem partida montada' });
        const op = msg.tipo === 'fim' ? { tipo: 'fim' } : { tipo: 'agir', uid: msg.uid, slot: msg.slot, alvos: msg.alvos, escolhas: msg.escolhas, modo: msg.modo };
        const r = host.aplicar(partida, op);
        if (op.tipo === 'agir' && (!r || !r.ok)) return responder('recusado', { codigo: 'acao_invalida', erro: (r && r.erro) || 'ação inválida' });
        return responder('estado', snapshot());   // o SERVIDOR devolve o estado autoritativo + hash; o cliente só desenha
      }

      // ---- F5.2: a PARTIDA de verdade (servidor dirige a IA, é dono do fim e do relógio) ----
      case 'novaPartida': {
        // o cliente manda a MONTAGEM (pergaminho) OU só a CHAVE — e o servidor carrega a montagem
        // AUTORITATIVA de data/provacoes (o cliente não injeta a montagem numa partida de verdade).
        let perg = msg.pergaminho;
        if (!perg && typeof msg.pergaminhoKey === 'string') {
          try { perg = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'provacoes', path.basename(msg.pergaminhoKey) + '.json'), 'utf8')); }
          catch (e) { return responder('erro', { erro: 'pergaminho desconhecido: ' + msg.pergaminhoKey }); }
        }
        if (!perg) return responder('erro', { erro: 'falta o pergaminho' });
        // limiteMs é opcional e CLAMPADO [200ms, 120s]: o cliente real não manda (usa o padrão 60s);
        // serve para afinar/testar o relógio sem confiar num valor de cliente.
        const lim = (typeof msg.limiteMs === 'number') ? Math.max(200, Math.min(120000, msg.limiteMs)) : undefined;
        P = partidaCtrl.criar(perg, { agora: Date.now(), limiteMs: lim });
        armarRelogio();
        return responder('partida', partidaCtrl.estado(P, Date.now()));
      }
      case 'jogar': {   // uma ação do humano, validada contra o estado autoritativo
        if (!P) return responder('erro', { erro: 'sem partida' });
        const r = partidaCtrl.agir(P, { uid: msg.uid, slot: msg.slot, alvos: msg.alvos, escolhas: msg.escolhas, modo: msg.modo }, { agora: Date.now() });
        if (!r.ok) return responder('recusado', { codigo: r.codigo, erro: r.erro });   // ação inválida = recusa clara, nunca "na dúvida"
        if (P.fim) pararRelogio();
        return responder('partida', partidaCtrl.estado(P, Date.now()));
      }
      case 'encerrar': {   // fim do turno do humano: o servidor roda a IA e devolve o que ela fez
        if (!P) return responder('erro', { erro: 'sem partida' });
        const r = partidaCtrl.encerrarTurno(P, { agora: Date.now() });
        if (!r.ok) return responder('recusado', { codigo: r.codigo, erro: r.erro });
        armarRelogio();   // rearma para o novo turno do humano (ou fica parado se acabou)
        return responder('partida', Object.assign(partidaCtrl.estado(P, Date.now()), { cpuOps: r.cpuOps || [] }));
      }
      default:
        return responder('erro', { erro: 'tipo desconhecido: ' + msg.tipo });
    }
  });
  ws.on('close', pararRelogio);   // não deixa o relógio do servidor rodando para uma conexão morta
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[incursion F5.0] servidor local em http://localhost:${PORT}  (WebSocket no mesmo endereço)`);
    console.log(`  motor: autoritativo, importado de src/engine.js (não copiado) · protocolo v${proto.PROTOCOL_VERSION}`);
  });
}
module.exports = { server, wss, PORT };

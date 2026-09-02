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

// Uma conexão = uma sessão de partida autoritativa (F5.0: sem conta, sem pareamento — só a fundação).
wss.on('connection', (ws) => {
  let partida = null;
  const responder = (tipo, dados) => ws.send(JSON.stringify(proto.envelope(tipo, dados)));
  const snapshot = () => ({ estado: JSON.parse(host.serializar(partida)), hash: host.hashEstado(partida), bytes: host.tamanhoBytes(partida) });

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
      default:
        return responder('erro', { erro: 'tipo desconhecido: ' + msg.tipo });
    }
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[incursion F5.0] servidor local em http://localhost:${PORT}  (WebSocket no mesmo endereço)`);
    console.log(`  motor: autoritativo, importado de src/engine.js (não copiado) · protocolo v${proto.PROTOCOL_VERSION}`);
  });
}
module.exports = { server, wss, PORT };

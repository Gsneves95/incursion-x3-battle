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
const salas = require('./salas.js');

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

// Uma conexão fala por UMA conta, mas a PARTIDA não é da conexão — é da CONTA (F5.4, server/salas.js).
//  - `partida` (F5.0): estado cru para o ARNÊS de determinismo (montar/agir/fim aplicam a op exata,
//    sem dirigir a IA — é a prova de estado idêntico passo a passo, servidor==cliente).
//  - a PARTIDA de verdade (F5.2/F5.4) vive em `salas`, keyed pelo id da conta, e o relógio corre lá
//    (independente de conexão). O cliente desenha o que volta e NUNCA declara resultado.
wss.on('connection', (ws) => {
  let partida = null;         // F5.0: arnês de determinismo (per-conexão, sem estado de conta)
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

      // ---- F5.2/F5.4: a PARTIDA de verdade — vive na CONTA (salas), o servidor dirige a IA/fim/relógio ----
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
        const sala = salas.criar(ws._conta.id, perg, { limiteMs: lim, ws });   // keyed pela CONTA
        ws._contaSala = ws._conta.id;   // para desanexar no close
        return responder('partida', salas.snapshot(sala));
      }
      case 'retomar': {   // F5.4: reconexão — a conta tem partida em curso? Devolve o ESTADO INTEIRO.
        const sala = salas.de(ws._conta.id);
        if (!sala) return responder('semPartida', {});   // nada a retomar (o cliente segue normal)
        salas.anexar(ws._conta.id, ws);   // LEITURA PURA: anexa o socket, NÃO toca no estado/relógio/deadline
        ws._contaSala = ws._conta.id;
        // desdeLog marca o que o cliente perdeu na ausência (o painel §214 desenha o log; sem replay animado)
        return responder('partida', salas.snapshot(sala, { retomada: true }));
      }
      case 'jogar': {   // uma ação do humano, validada contra o estado autoritativo
        const sala = salas.de(ws._conta.id);
        if (!sala) return responder('erro', { erro: 'sem partida' });
        salas.anexar(ws._conta.id, ws); ws._contaSala = ws._conta.id;
        const r = partidaCtrl.agir(sala.P, { uid: msg.uid, slot: msg.slot, alvos: msg.alvos, escolhas: msg.escolhas, modo: msg.modo }, { agora: Date.now() });
        if (!r.ok) return responder('recusado', { codigo: r.codigo, erro: r.erro });   // ação inválida = recusa clara, nunca "na dúvida"
        if (sala.P.fim) salas.pararRelogio(ws._conta.id);
        return responder('partida', salas.snapshot(sala));
      }
      case 'encerrar': {   // fim do turno do humano: o servidor roda a IA e devolve o que ela fez
        const sala = salas.de(ws._conta.id);
        if (!sala) return responder('erro', { erro: 'sem partida' });
        salas.anexar(ws._conta.id, ws); ws._contaSala = ws._conta.id;
        const r = partidaCtrl.encerrarTurno(sala.P, { agora: Date.now() });
        if (!r.ok) return responder('recusado', { codigo: r.codigo, erro: r.erro });
        salas.rearmar(ws._conta.id);   // rearma para o novo turno do humano (ou fica parado se acabou)
        return responder('partida', salas.snapshot(sala, { cpuOps: r.cpuOps || [] }));
      }
      default:
        return responder('erro', { erro: 'tipo desconhecido: ' + msg.tipo });
    }
  });
  // F5.4: a conexão caiu — só DESANEXA. O relógio SEGUE correndo no servidor (sua vez é sua vez,
  // olhando ou não); a partida espera o retomar. Sem parar nada: é o que impede a queda de virar fuga.
  ws.on('close', () => { if (ws._contaSala) salas.desanexar(ws._contaSala, ws); });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[incursion F5.0] servidor local em http://localhost:${PORT}  (WebSocket no mesmo endereço)`);
    console.log(`  motor: autoritativo, importado de src/engine.js (não copiado) · protocolo v${proto.PROTOCOL_VERSION}`);
  });
}
module.exports = { server, wss, PORT };

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
const fila = require('./fila.js');
const telemetria = require('./telemetria.js');

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

      // ---- F5.3: NICK + FILA de pareamento (PvP) ----
      case 'definirNick': {
        const r = contas.definirNick(msg.token, msg.nick);
        if (!r.ok) return responder('recusado', { codigo: r.codigo, erro: r.erro });
        return responder('nick', { nick: r.nick });
      }
      case 'entrarFila': {
        const r = fila.entrar(ws, msg.token, msg.time);   // valida nick + POSSE do time + não estar já em partida
        if (!r.ok) return responder('recusado', { codigo: r.codigo, erro: r.erro });
        if (r.estado === 'na_fila') return responder('naFila', {});
        // PAREADO: marca os dois sockets (para o close desanexar) e entrega o estado inicial da partida.
        for (const p of r.sala.participantes) if (p.ws) p.ws._contaSala = p.contaId;
        salas.empurrarOutro(r.sala, ws._conta.id, { push: true, pareado: true });   // ao oponente: push
        return responder('partida', Object.assign(salas.snapshotPara(r.sala, ws._conta.id), { pareado: true }));   // ao remetente: resposta
      }
      case 'entrarFilaRanqueada': {   // F5.5: fila CIENTE DE FAIXA (pareia pontos próximos; janela abre com a espera)
        const r = fila.entrarRanqueada(ws, msg.token, msg.time, Date.now());
        if (!r.ok) return responder('recusado', { codigo: r.codigo, erro: r.erro });
        if (r.estado === 'na_fila') return responder('naFila', { ranqueado: true });
        for (const p of r.sala.participantes) if (p.ws) p.ws._contaSala = p.contaId;
        salas.empurrarOutro(r.sala, ws._conta.id, { push: true, pareado: true, ranqueado: true });
        return responder('partida', Object.assign(salas.snapshotPara(r.sala, ws._conta.id), { pareado: true, ranqueado: true }));
      }
      case 'sairFila': {
        fila.sair(ws._conta.id);
        return responder('saiuFila', {});
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
        return responder('partida', salas.snapshotPara(sala, ws._conta.id, { retomada: true }));
      }
      case 'jogar': {   // uma ação de um lado, validada. O servidor determina o LADO pela conta (nunca confia no cliente).
        const sala = salas.de(ws._conta.id);
        if (!sala) return responder('erro', { erro: 'sem partida' });
        salas.anexar(ws._conta.id, ws); ws._contaSala = ws._conta.id;
        const lado = salas.ladoDe(sala, ws._conta.id);
        const uAntes = (sala.P.st.lados[lado].units || []).find(x => x.uid === msg.uid);   // a unidade que age (antes de aplicar)
        const r = partidaCtrl.agir(sala.P, { uid: msg.uid, slot: msg.slot, alvos: msg.alvos, escolhas: msg.escolhas, modo: msg.modo }, { agora: Date.now(), lado });
        if (!r.ok) return responder('recusado', { codigo: r.codigo, erro: r.erro });   // ação inválida = recusa clara, nunca "na dúvida"
        if (sala.modo === 'pvp' && uAntes) telemetria.acao(uAntes.key, msg.slot);   // §22: uso de habilidade (agregado, sem jogador)
        if (sala.P.st.fim) { salas.pararRelogio(ws._conta.id); salas.finalizarPartida(sala); }   // F5.5: ponto no fim (uma vez, pelo servidor)
        salas.empurrarOutro(sala, ws._conta.id, { push: true });   // PvP: o oponente vê a jogada (no PvE, no-op)
        return responder('partida', salas.snapshotPara(sala, ws._conta.id));
      }
      case 'encerrar': {   // fim do turno: PvE dirige a IA; PvP passa para o outro humano
        const sala = salas.de(ws._conta.id);
        if (!sala) return responder('erro', { erro: 'sem partida' });
        salas.anexar(ws._conta.id, ws); ws._contaSala = ws._conta.id;
        const lado = salas.ladoDe(sala, ws._conta.id);
        const r = partidaCtrl.encerrarTurno(sala.P, { agora: Date.now(), lado });
        if (!r.ok) return responder('recusado', { codigo: r.codigo, erro: r.erro });
        if (sala.P.st.fim) salas.finalizarPartida(sala);   // F5.5: encerrar pode fechar a partida (último abate)
        salas.rearmar(ws._conta.id);   // rearma o relógio para o novo lado ativo (ou fica parado se acabou)
        salas.empurrarOutro(sala, ws._conta.id, { push: true, cpuOps: r.cpuOps || [] });   // PvP: agora é a vez do oponente
        return responder('partida', salas.snapshotPara(sala, ws._conta.id, { cpuOps: r.cpuOps || [] }));
      }
      default:
        return responder('erro', { erro: 'tipo desconhecido: ' + msg.tipo });
    }
  });
  // F5.4: a conexão caiu — só DESANEXA da partida (o relógio SEGUE correndo; sua vez é sua vez, olhando
  // ou não). E SAI DA FILA se estava esperando (§F5.3: fechar o app na espera te tira da fila).
  ws.on('close', () => {
    if (ws._contaSala) salas.desanexar(ws._contaSala, ws);
    if (ws._conta) fila.sair(ws._conta.id);
  });
});

// §236: os endereços IPv4 da REDE LOCAL desta máquina (para outros aparelhos na mesma Wi-Fi chegarem).
// Filtra internas (127.x) e de link-local (169.254.x). Sem dependência: usa os.networkInterfaces().
function enderecosLAN() {
  const os = require('os');
  const out = [];
  const ifaces = os.networkInterfaces();
  for (const nome of Object.keys(ifaces)) for (const i of (ifaces[nome] || [])) {
    if (i.family === 'IPv4' && !i.internal && !/^169\.254\./.test(i.address)) out.push(i.address);
  }
  return out;
}

if (require.main === module) {
  // HOST=0.0.0.0 (padrão) escuta em TODAS as interfaces → acessível na REDE LOCAL (necessário para
  // testar em celulares, §236). Para travar só no próprio computador: HOST=127.0.0.1 npm run serve.
  const HOST = process.env.HOST || '0.0.0.0';
  server.listen(PORT, HOST, () => {
    const lan = enderecosLAN();
    console.log(`\n[incursion] servidor no ar · protocolo v${proto.PROTOCOL_VERSION} · motor autoritativo (src/engine.js)`);
    console.log(`  neste computador:   http://localhost:${PORT}`);
    if (lan.length) {
      console.log(`\n  NOS CELULARES (mesma rede Wi-Fi), abra o navegador e digite:`);
      for (const ip of lan) console.log(`      http://${ip}:${PORT}`);
      console.log(`  (o WebSocket usa o MESMO endereço — o cliente acha o servidor sozinho.)`);
    } else {
      console.log(`  (nenhum endereço de rede local encontrado — o computador está conectado ao Wi-Fi?)`);
    }
    if (HOST !== '0.0.0.0') console.log(`  [HOST=${HOST}] escutando SÓ neste computador — outros aparelhos NÃO alcançam.`);
    console.log('');
  });
}
module.exports = { server, wss, PORT, enderecosLAN };

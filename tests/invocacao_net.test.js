// §318b — DEFEITO do dono: na invocação, apertar os botões não fazia NADA. Causa: o transporte
// (src/conta.js) casava resposta↔pedido por ORDEM (FIFO), sem tempo limite e sem tratar a QUEDA do
// socket; no celular a WebSocket morre em silêncio e o `pedir` ficava pendurado → S._invocando travava
// em true → todo toque seguinte era engolido. Este teste prova as guardas do conserto:
//   PARTE 1 (unidade do transporte, com WebSocket de mentira): correlação por rid (resposta fora de
//     ordem casa o pedido certo); um pedido ANTERIOR sem resposta NÃO trava o seguinte; tempo limite
//     resolve `sem_conexao` (nunca pendura); a queda do socket solta os pendentes; o pedir RELIGA.
//   PARTE 2 (servidor REAL em processo): invocar com gemas → resultado; sem gemas → recusa clara;
//     servidor morto → `sem_conexao` no tempo limite. Cada guarda MORDE.
const path = require('path');
const assert = require('assert');
const cp = require('child_process');
const fs = require('fs');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------- PARTE 1: transporte com WebSocket de mentira ----------
class FakeWS {
  constructor(url) { this.url = url; this.readyState = 0; this.sent = []; this._open = []; FakeWS.instances.push(this); FakeWS.last = this; }
  send(s) { if (this.readyState !== 1) throw new Error('send em socket não aberto'); this.sent.push(JSON.parse(s)); }
  addEventListener(ev, cb) { if (ev === 'open') { if (this.readyState === 1) cb(); else this._open.push(cb); } }
  close() { if (this.readyState >= 2) return; this.readyState = 3; if (this.onclose) this.onclose(); }
  fireOpen() { this.readyState = 1; if (this.onopen) this.onopen(); this._open.splice(0).forEach(cb => { try { cb(); } catch (e) {} }); }
  fireMsg(obj) { if (this.onmessage) this.onmessage({ data: JSON.stringify(obj) }); }
}
FakeWS.instances = []; FakeWS.last = null;

async function parte1() {
  console.log('== PARTE 1 — transporte: correlação por rid + tempo limite + queda + religar ==');
  global.WebSocket = FakeWS;
  delete require.cache[require.resolve('../src/conta.js')];
  const { criarTransporteWS } = require('../src/conta.js');
  const txP = criarTransporteWS('ws://fake', { timeout: 2000, pedidoTimeout: 150 });
  FakeWS.last.fireOpen();
  const tx = await txP;
  ok(!!tx && typeof tx.pedir === 'function', 'o transporte abre e expõe pedir');
  let ws = FakeWS.last;

  // A) correlação: respostas FORA DE ORDEM casam o pedido certo (o FIFO antigo trocaria).
  const r1 = tx.pedir({ v: 1, tipo: 'A' }), r2 = tx.pedir({ v: 1, tipo: 'B' });
  const rid1 = ws.sent[0].rid, rid2 = ws.sent[1].rid;
  ok(rid1 != null && rid2 != null && rid1 !== rid2, 'cada pedido leva um rid único');
  ws.fireMsg({ v: 1, tipo: 'respB', rid: rid2 });   // B responde primeiro
  ws.fireMsg({ v: 1, tipo: 'respA', rid: rid1 });
  const a = await r1, b = await r2;
  ok(a.tipo === 'respA' && b.tipo === 'respB', 'correlação por rid: resposta fora de ordem casa o pedido certo');

  // B) um pedido ANTERIOR sem resposta NÃO trava o seguinte.
  const stuck = tx.pedir({ v: 1, tipo: 'NUNCA' });
  const good = tx.pedir({ v: 1, tipo: 'BOM' });
  const ridGood = ws.sent[ws.sent.length - 1].rid;
  ws.fireMsg({ v: 1, tipo: 'okBom', rid: ridGood });
  ok((await good).tipo === 'okBom', 'um pedido anterior SEM resposta não trava o seguinte (resolve na hora)');
  ok((await stuck).codigo === 'sem_conexao', 'o pedido sem resposta estoura no tempo limite (sem_conexao), nunca pendura');

  // C) QUEDA do socket solta todos os pendentes (nada fica pendurado).
  const pc = tx.pedir({ v: 1, tipo: 'CAI' });
  ws.close();
  ok((await pc).codigo === 'sem_conexao', 'a queda do socket (onclose) resolve os pendentes com sem_conexao');

  // D/E) o pedir RELIGA o socket caído, envia o enfileirado ao reabrir e casa a resposta.
  const pz = tx.pedir({ v: 1, tipo: 'Z' });
  const ws2 = FakeWS.last;
  ok(ws2 !== ws, 'após a queda, o pedir cria um novo socket (religa sozinho)');
  ws2.fireOpen();
  ok(ws2.sent.length === 1 && ws2.sent[0].tipo === 'Z', 'o pedido enfileirado sai quando o socket reabre');
  ws2.fireMsg({ v: 1, tipo: 'okZ', rid: ws2.sent[0].rid });
  ok((await pz).tipo === 'okZ', 'após religar, a resposta casa e resolve');

  // F) tempo limite num socket ABERTO que não responde.
  const pt = tx.pedir({ v: 1, tipo: 'MUDO' });
  ok((await pt).codigo === 'sem_conexao', 'socket aberto que não responde → tempo limite resolve sem_conexao');
}

// ---------- PARTE 2: servidor REAL em processo ----------
function esperarServidor(child) {
  return new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error('servidor não subiu a tempo')), 15000);
    const onData = (d) => { if (/servidor no ar/.test(d.toString())) { clearTimeout(to); child.stdout.off('data', onData); resolve(); } };
    child.stdout.on('data', onData);
    child.stderr.on('data', (d) => { /* ruído do boot */ });
    child.on('exit', (c) => { clearTimeout(to); reject(new Error('servidor saiu no boot (code ' + c + ')')); });
  });
}

async function parte2() {
  console.log('\n== PARTE 2 — servidor REAL em processo: invocar / sem gemas / servidor morto ==');
  const PORT = 8900 + Math.floor(Math.random() * 90);
  const dados = path.join(require('os').tmpdir(), 'inc-net-' + process.pid + '-' + Date.now());
  const child = cp.spawn(process.execPath, [path.join(__dirname, '..', 'server', 'server.js')],
    { env: Object.assign({}, process.env, { PORT: String(PORT), HOST: '127.0.0.1', INCURSION_DADOS_DIR: dados }), stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await esperarServidor(child);
    global.WebSocket = require('ws');
    delete require.cache[require.resolve('../src/conta.js')];
    const { criarTransporteWS } = require('../src/conta.js');
    const tx = await criarTransporteWS('ws://127.0.0.1:' + PORT, { timeout: 4000, pedidoTimeout: 3000 });
    ok(!!tx, 'conecta ao servidor real');

    const rc = await tx.pedir({ v: 1, tipo: 'criarConta', faixaIdade: 'maior' });
    ok(rc && rc.tipo === 'conta' && rc.token, 'criarConta devolve token + conta');
    const token = rc.token;
    ok(rc.conta && rc.conta.perfil && rc.conta.perfil.moedas && rc.conta.perfil.moedas.gema > 0, 'a conta nasce com gemas do servidor (grant inicial) — a barra lê daqui');

    // invocar com gemas → resultado (saldo autoritativo volta).
    const inv = await tx.pedir({ v: 1, tipo: 'invocar', token, pacote: false });
    ok(inv && inv.tipo === 'invocado' && Array.isArray(inv.resultados) && inv.resultados.length === 1, 'invocar ×1 com gemas → resultado (1 carta)');
    ok(inv.saldo && typeof inv.saldo.gema === 'number', 'a resposta traz o SALDO do servidor (a barra mostra sempre o servidor)');

    // esgotar as gemas → recusa CLARA (gemas_insuficientes), nunca silêncio.
    let recusa = null;
    for (let i = 0; i < 40 && !recusa; i++) {
      const r = await tx.pedir({ v: 1, tipo: 'invocar', token, pacote: true });
      if (r && r.tipo === 'recusado') recusa = r;
      else if (!(r && r.tipo === 'invocado')) { recusa = r; break; }   // qualquer não-invocado encerra
    }
    ok(recusa && recusa.tipo === 'recusado' && (recusa.codigo === 'gemas_insuficientes'), 'sem gemas → recusa clara "gemas_insuficientes" (o cliente mostra a mensagem)');

    // servidor MORTO → o próximo pedido resolve sem_conexao no tempo limite (jamais pendura).
    child.kill('SIGKILL');
    await sleep(200);
    const t0 = Date.now();
    const morto = await tx.pedir({ v: 1, tipo: 'invocar', token, pacote: false });
    ok(morto && (morto.tipo === 'semResposta' || morto.codigo === 'sem_conexao'), 'servidor morto → sem_conexao (nunca pendura)');
    ok(Date.now() - t0 <= 3500, 'a resposta de sem_conexao chega dentro do tempo limite');
    try { tx.fechar(); } catch (e) {}
  } finally {
    try { child.kill('SIGKILL'); } catch (e) {}
    try { fs.rmSync(dados, { recursive: true, force: true }); } catch (e) {}
  }
}

(async () => {
  try {
    await parte1();
    await parte2();
  } catch (e) { console.log('  ✗ ERRO: ' + (e && e.message || e)); falhas++; }
  console.log(`\n${falhas ? '✗ ' + falhas + ' FALHA(S)' : '✓ tudo verde'} · ${passes} asserções`);
  process.exit(falhas ? 1 : 0);
})();

// §237 — a classe de bug dos §209/§236 (funciona local, quebra publicado): o servidor do Render é HTTPS,
// então o WebSocket TEM de ser WSS, não WS. O cliente usa location.host para achar o servidor — este
// teste PROVA que ele também adapta o PROTOCOLO: https → wss, http → ws. Se alguém fixar 'ws://', quebra.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };
const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');

// carrega o dist numa origem dada, planta um WebSocket-espião que captura a URL, e devolve o que o
// cliente TENTOU abrir. jsdom não traz WebSocket — sem o espião, criarTransporteWS retorna null cedo.
function urlDoTransporte(origem) {
  const vc = new VirtualConsole();
  const w = new JSDOM(html, { runScripts: 'dangerously', url: origem, virtualConsole: vc }).window;
  let capturada = null;
  w.WebSocket = function (u) { capturada = u; this.close = () => {}; };   // espião (síncrono no construtor)
  w.eval('criarTransporteWS()');   // usa location.host + protocolo; constrói o WebSocket → captura a URL
  return capturada;
}

console.log('== §237 — o cliente adapta o PROTOCOLO do WebSocket à origem (wss em produção) ==');

const httpU = urlDoTransporte('http://192.168.0.15:8788/');
ok(/^ws:\/\//.test(httpU), 'origem http:// → ws:// (local, como hoje) — ' + httpU);
ok(/192\.168\.0\.15:8788$/.test(httpU), 'usa o MESMO host da página (location.host), não um fixo');

const httpsU = urlDoTransporte('https://incursion-servidor.onrender.com/');
ok(/^wss:\/\//.test(httpsU), 'origem https:// → WSS:// (Render/produção) — NÃO quebra publicado — ' + httpsU);
ok(/incursion-servidor\.onrender\.com$/.test(httpsU), 'e aponta para o host público, sem porta fixa');

console.log(`\n== WSS OK — ${passes} asserções ==`);
if (falhas) process.exit(1);

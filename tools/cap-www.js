// tools/cap-www.js — monta a PASTA WEB (www/) que o Capacitor empacota no app nativo.
//
// MODELO SERVIDOR-APONTADO (§240, decisão do dono): o APK NÃO embute o jogo. O jogo é servido pelo
// Render e o app carrega de lá (o `server.url` no capacitor.config.json). Assim, publicar o servidor
// já atualiza o app — "instala uma vez, ajusta cem vezes". (A versão que embute o jogo e roda offline
// é a de LOJA, no fim; não é agora.)
//
// Por isso www/ é MÍNIMO: o Capacitor exige um `webDir` com um index.html, mas ele NÃO é a tela que
// abre (o `server.url` tem prioridade). Este index é só uma REDE DE SEGURANÇA — uma tela escura de
// "carregando", no lugar de um branco, caso o app algum dia caia no arquivo local. Sem jogo, sem os
// ~6,6 MB de assets: o APK fica pequeno.
//
// É determinístico: apaga www/ e remonta do zero. Roda em Mac/Windows/Linux (só usa fs).
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const www = path.join(raiz, 'www');
const cfg = path.join(raiz, 'capacitor.config.json');

// o endereço do servidor vem do capacitor.config.json (LUGAR ÚNICO). O fallback local só o mostra
// como texto e oferece "tentar de novo" — não tem como forçar o WebView nativo a re-navegar sozinho.
let servidor = '(o endereço do servidor)';
try { servidor = (JSON.parse(fs.readFileSync(cfg, 'utf8')).server || {}).url || servidor; } catch (e) {}

// remonta do zero para não deixar lixo de uma versão anterior
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });

// index.html mínimo, autocontido (sem refs externas): tela escura de carregando = "não é app quebrado".
const fallback = `<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<title>INCURSION</title>
<style>
  html,body{height:100%;margin:0;background:#0a0812;color:#e7bd74;
    font-family:-apple-system,Segoe UI,Roboto,sans-serif;-webkit-touch-callout:none}
  .wrap{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:24px}
  .spin{width:44px;height:44px;border-radius:50%;border:3px solid rgba(231,189,116,.25);border-top-color:#e7bd74;animation:g 1s linear infinite}
  @keyframes g{to{transform:rotate(360deg)}}
  h1{font-family:'Cinzel',serif;font-size:20px;letter-spacing:.14em;margin:0;color:#ffe9ad}
  p{font-size:13px;color:#8b83b8;max-width:320px;line-height:1.5;margin:0}
  a{color:#e7bd74}
</style></head>
<body><div class="wrap">
  <div class="spin"></div>
  <h1>INCURSION</h1>
  <p>Conectando ao servidor. Se ele estava dormindo, a primeira vez leva ~30&nbsp;segundos.</p>
  <p style="font-size:11px;color:#5a5480">Servidor: ${servidor}</p>
</div></body></html>`;

fs.writeFileSync(path.join(www, 'index.html'), fallback);

const bytes = Buffer.byteLength(fallback);
console.log(`www/ montado (modelo SERVIDOR-APONTADO): só index.html de segurança (${bytes} bytes).`);
console.log(`o app carrega o JOGO de: ${servidor}  (server.url no capacitor.config.json)`);
console.log('nada de jogo/assets embutidos — publicar o servidor atualiza o app.');

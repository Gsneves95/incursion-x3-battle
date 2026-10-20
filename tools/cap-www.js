// tools/cap-www.js — monta a PASTA WEB (www/) que o Capacitor empacota no app nativo.
//
// §341 — LANÇADOR LOCAL. Antes (§240) www/ era só uma rede de segurança e o app abria direto a URL do Render
// (server.url). Agora o app abre PRIMEIRO este lançador local (sem server.url; a navegação p/ o Render fica em
// server.allowNavigation): ele mostra a tela de carregamento do próprio jogo (arte + nome + barra), faz ping no
// servidor (que dorme no plano grátis, ~50s p/ acordar) e só então navega para o jogo. Assim NÃO se vê mais a
// página de espera do Render. O jogo continua vindo do servidor — publicar o servidor atualiza o app.
//
// www/ empacota: index.html (o lançador), fundo.webp (a arte) e cinzel.woff2 (a fonte) — tudo LOCAL, para a tela
// aparecer sem depender do servidor (nem fonte, nem imagem, nem script). É determinístico: apaga www/ e remonta.
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const www = path.join(raiz, 'www');
const cfgPath = path.join(raiz, 'capacitor.config.json');

// o endereço do servidor vem do capacitor.config.json (LUGAR ÚNICO): server.allowNavigation[0] é o host do Render.
let host = 'incursion-servidor.onrender.com';
try { const c = JSON.parse(fs.readFileSync(cfgPath, 'utf8')); const nav = (c.server || {}).allowNavigation; if (Array.isArray(nav) && nav[0]) host = nav[0]; } catch (e) {}
const jogoUrl = /^https?:\/\//.test(host) ? host : ('https://' + host);
let ver = '0.0.0';
try { ver = JSON.parse(fs.readFileSync(path.join(raiz, 'package.json'), 'utf8')).version || ver; } catch (e) {}

// remonta do zero para não deixar lixo de uma versão anterior
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });

// 1) o LANÇADOR: lê o fonte versionado e injeta a URL do jogo + a versão do app
const lancador = fs.readFileSync(path.join(raiz, 'web', 'carregamento', 'lancador.html'), 'utf8')
  .split('__JOGO_URL__').join(jogoUrl)
  .split('__APP_VER__').join(ver);
fs.writeFileSync(path.join(www, 'index.html'), lancador);

// 2) a ARTE de fundo (mesma do jogo) e 3) a FONTE Cinzel — LOCAIS, ao lado do index
fs.copyFileSync(path.join(raiz, 'web', 'carregamento', 'fundo.webp'), path.join(www, 'fundo.webp'));
fs.copyFileSync(path.join(raiz, 'web', 'fonts', 'cinzel-latin.woff2'), path.join(www, 'cinzel.woff2'));

const kb = f => Math.round(fs.statSync(path.join(www, f)).size / 1024);
console.log(`www/ montado (LANÇADOR local §341): index.html (${kb('index.html')} kB) + fundo.webp (${kb('fundo.webp')} kB) + cinzel.woff2 (${kb('cinzel.woff2')} kB).`);
console.log(`o lançador faz ping e navega para o JOGO em: ${jogoUrl}  (allowNavigation no capacitor.config.json)`);
console.log('tudo local: a tela de carregamento aparece sem depender do servidor.');

// tools/cap-www.js — monta a PASTA WEB (www/) que o Capacitor empacota no app nativo.
// O jogo é UM html (dist/incursion.html) + os assets em web/ (skills, banners, ícones,
// manifest). O Capacitor precisa de UMA pasta com index.html na raiz e os assets ao lado,
// então aqui a gente copia:
//   dist/incursion.html  -> www/index.html     (o WebView abre index.html por padrão)
//   web/*                -> www/*              (skills/, banners/, ícones, manifest)
// É determinístico: apaga www/ e remonta do zero. Roda em Mac/Windows/Linux (só usa fs).
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const dist = path.join(raiz, 'dist', 'incursion.html');
const web = path.join(raiz, 'web');
const www = path.join(raiz, 'www');

if (!fs.existsSync(dist)) {
  console.error('ERRO: dist/incursion.html não existe. Rode "npm run build" antes (ele gera o dist).');
  process.exit(1);
}
if (!fs.existsSync(web)) {
  console.error('ERRO: a pasta web/ (skills, banners, ícones) não foi encontrada.');
  process.exit(1);
}

// remonta do zero para não deixar lixo de uma versão anterior
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });

// 1) o app: incursion.html vira index.html (o nome que o WebView carrega sozinho)
fs.copyFileSync(dist, path.join(www, 'index.html'));

// 2) os assets: tudo de web/ ao lado do index (os caminhos no html são relativos: skills/x.webp)
for (const nome of fs.readdirSync(web)) {
  fs.cpSync(path.join(web, nome), path.join(www, nome), { recursive: true });
}

// relatório com o tamanho real do que vai para o app
function bytes(p) {
  let t = 0;
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    const f = path.join(p, e.name);
    t += e.isDirectory() ? bytes(f) : fs.statSync(f).size;
  }
  return t;
}
const total = bytes(www);
console.log(`www/ montado: index.html + ${fs.readdirSync(web).length} itens de web/`);
console.log(`payload web = ${total} bytes (${(total / 1048576).toFixed(2)} MB) — é o que o Capacitor empacota`);

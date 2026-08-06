// Concatena motor + dados + visão + casca num único HTML que abre sem servidor.
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const ler = p => fs.readFileSync(path.join(raiz, p), 'utf8');

const motor  = ler('src/engine.js').split("if (typeof module !== 'undefined')")[0];
const roster = ler('src/roster_data.js');
const visao  = ler('src/view.js');
const casca  = ler('src/shell.html');

const saida = casca
  .replace('/*__ENGINE__*/', roster + '\n' + motor)
  .replace('/*__VIEW__*/', visao);

if (saida.includes('__ENGINE__') || saida.includes('__VIEW__')) {
  console.error('ERRO: marcador de injeção não substituído'); process.exit(1);
}
fs.mkdirSync(path.join(raiz, 'dist'), { recursive: true });
fs.writeFileSync(path.join(raiz, 'dist/incursion.html'), saida);
console.log('dist/incursion.html —', (saida.length / 1024 / 1024).toFixed(2), 'MB');

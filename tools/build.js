// Concatena motor + dados + visão + casca num único HTML que abre sem servidor.
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const ler = p => fs.readFileSync(path.join(raiz, p), 'utf8');

const motor  = ler('src/engine.js').split("if (typeof module !== 'undefined')")[0];
const roster = ler('src/roster_data.js');
const rotas  = ler('src/rotas.js').split("if (typeof module !== 'undefined')")[0];
const visao  = ler('src/view.js');
const invoc  = ler('src/invocacao.js');
const ia     = ler('src/ia.js').split("if (typeof module !== 'undefined')")[0];
const raridades = ler('data/raridades.json').trim();
const kits   = ler('data/kits.json').trim();
const casca  = ler('src/shell.html');

// carimbo de versão do build (hora da geração), pra saber na tela se é a versão nova
const build = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

const saida = casca
  .replace('/*__ENGINE__*/', roster + '\n' + motor + '\nconst KITS=' + kits + ';')
  .replace('/*__VIEW__*/', rotas + '\n' + visao + '\nconst RARIDADE=' + raridades + ';\n' + invoc + '\n' + ia)
  .replace('/*__BUILD__*/', build);

if (saida.includes('__ENGINE__') || saida.includes('__VIEW__')) {
  console.error('ERRO: marcador de injeção não substituído'); process.exit(1);
}
fs.mkdirSync(path.join(raiz, 'dist'), { recursive: true });
fs.writeFileSync(path.join(raiz, 'dist/incursion.html'), saida);
console.log('dist/incursion.html —', (saida.length / 1024 / 1024).toFixed(2), 'MB');

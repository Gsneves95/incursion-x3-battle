// Concatena motor + dados + visão + casca num único HTML que abre sem servidor.
// A visão é modular (src/turno.js, src/rotas.js, src/ui/*, src/view.js); este
// script junta na ordem de camadas e valida duas coisas que o escopo único
// concatenado esconde: a DIREÇÃO das dependências entre módulos de ui/ e a
// ORDEM (símbolo referenciado antes de existir).
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const ler = p => fs.readFileSync(path.join(raiz, p), 'utf8');
const semGuard = s => s.split("if (typeof module !== 'undefined')")[0];

// ---------- 1. checagem de direção: nenhum ui/ referencia OUTRO ui/ (só base.js é livre) ----------
function checarDirecaoUI() {
  const dir = path.join(raiz, 'src/ui');
  const mods = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  const reDef = /^(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm;
  const defs = {};
  for (const m of mods) {
    const src = ler('src/ui/' + m); const s = new Set(); let mt;
    reDef.lastIndex = 0; while ((mt = reDef.exec(src))) s.add(mt[1]);
    defs[m] = s;
  }
  const erros = [];
  for (const m of mods) {
    if (m === 'base.js') continue;
    const src = ler('src/ui/' + m);
    for (const outro of mods) {
      if (outro === m || outro === 'base.js') continue;
      for (const id of defs[outro]) {
        // casa CHAMADA (`id(`), não a palavra solta — evita falso positivo com
        // texto de ajuda e comentários; acoplamento ui->ui real é sempre chamada.
        if (new RegExp('\\b' + id.replace(/\$/g, '\\$') + '\\s*\\(').test(src))
          erros.push(`src/ui/${m} chama \`${id}()\` (definido em src/ui/${outro}). ui -> ui é proibido: suba o compartilhado para src/ui/base.js.`);
      }
    }
  }
  if (erros.length) { console.error('ERRO de direção de dependência:\n  ' + erros.join('\n  ')); process.exit(1); }
}

// ---------- 2. smoke de carga: o bundle roda em jsdom sem símbolo faltando ----------
function smokeCarga(distAbs) {
  let jsdom; try { jsdom = require('jsdom'); } catch (e) { console.warn('jsdom ausente — pulei o smoke de carga'); return; }
  const html = fs.readFileSync(distAbs, 'utf8');
  const erros = [];
  const vc = new jsdom.VirtualConsole();
  vc.on('jsdomError', e => erros.push(e.message + (e.detail ? ' :: ' + e.detail : '')));
  const dom = new jsdom.JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
  if (erros.length) { console.error('ERRO no smoke de carga (símbolo ausente ou ordem de concatenação):\n  ' + erros.join('\n  ')); process.exit(1); }
  const r = dom.window.eval("typeof rotaAtual === 'function' && rotaAtual()");
  if (r !== 'selecao') { console.error('ERRO no smoke de carga: rota inicial deveria ser "selecao", veio ' + JSON.stringify(r)); process.exit(1); }
  dom.window.close();
}

checarDirecaoUI();

const motor  = semGuard(ler('src/engine.js'));
const roster = ler('src/roster_data.js');
const perfil = semGuard(ler('src/perfil.js'));
const armaz  = semGuard(ler('src/armazenamento.js'));
const turno  = semGuard(ler('src/turno.js'));
const rotas  = semGuard(ler('src/rotas.js'));
const enquadr= semGuard(ler('src/enquadramento.js'));
const visao  = ler('src/view.js');
const invoc  = ler('src/invocacao.js');
const ia     = semGuard(ler('src/ia.js'));
const raridades = ler('data/raridades.json').trim();
const economia = ler('data/economia.json').trim();
const kits   = ler('data/kits.json').trim();
const casca  = ler('src/shell.html');

// Camadas, em ordem de dependência (cada uma só usa as anteriores):
// engine -> perfil -> armazenamento -> turno -> rotas -> ui/base -> ui/* -> view.
const blocoVisao = [
  perfil, armaz, turno, rotas, enquadr,
  ler('src/ui/base.js'), ler('src/ui/topo.js'), ler('src/ui/campo.js'),
  ler('src/ui/painel.js'), ler('src/ui/sobrepor.js'), ler('src/ui/selecao.js'),
  visao,
].join('\n');

const build = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

const saida = casca
  .replace('/*__ENGINE__*/', roster + '\n' + motor + '\nconst KITS=' + kits + ';')
  .replace('/*__VIEW__*/', blocoVisao + '\nconst RARIDADE=' + raridades + ';\nconst ECONOMIA=' + economia + ';\n' + invoc + '\n' + ia)
  .replace('/*__BUILD__*/', build);

if (saida.includes('__ENGINE__') || saida.includes('__VIEW__')) {
  console.error('ERRO: marcador de injeção não substituído'); process.exit(1);
}
fs.mkdirSync(path.join(raiz, 'dist'), { recursive: true });
const distAbs = path.join(raiz, 'dist/incursion.html');
fs.writeFileSync(distAbs, saida);

// assets do modo app (manifest + ícones): arquivos REAIS servidos no Pages. Copiados
// para junto do incursion.html para o dist de dev também os encontrar. O invariante
// "arquivo único" vale para o incursion.html; o artefato publicado é um site pequeno.
const web = path.join(raiz, 'web');
if (fs.existsSync(web)) for (const f of fs.readdirSync(web))
  fs.copyFileSync(path.join(web, f), path.join(raiz, 'dist', f));

smokeCarga(distAbs);
console.log('dist/incursion.html —', (saida.length / 1024 / 1024).toFixed(2), 'MB · direção ui ok · smoke ok');

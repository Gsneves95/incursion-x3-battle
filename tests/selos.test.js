// §303 — SELOS DE RARIDADE: a arte é de MOMENTO, não de LISTA. O ornamento do dono vai SÓ para a REVELAÇÃO da
// invocação (grande, cerimonial); os selos PEQUENOS (grade, resumo, painel, sobreposição, seleção, rota-deus)
// seguem letra-só, MESMO com os 3 webp presentes. Motivo medido (§301+§303): nenhum selo in-page passa de 40px
// (17–35 no aparelho) e a <40px a arte vira confete — a letra de hoje LÊ MELHOR. Recusada por LEITURA, não por gosto.
//
// Esta guarda protege a decisão contra uma sessão futura "completar a troca" achando que ficou pela metade:
//   - a composição pequena do §301 (classe-raiz .selo-arte + fundo url(selos/…) nos selos pequenos) NÃO existe mais;
//   - com os 3 arquivos presentes (SELOS_ARTE=1), a grade continua mostrando a LETRA, sem classe-raiz nem imagem;
//   - os selos são arte EXTERNA (nunca base64), o pacote não incha.
// A guarda da REVELAÇÃO (usa a arte quando existe, SVG quando não; sem letra dupla) vive em tests/invocacao.test.js.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let f = 0;
const ok = (c, m) => { if (!c) { f++; console.log('  XX ' + m); } else console.log('  ok ' + m); };

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'dist/incursion.html'), 'utf8');
const shell = fs.readFileSync(path.join(raiz, 'src/shell.html'), 'utf8');
const viewjs = fs.readFileSync(path.join(raiz, 'src/view.js'), 'utf8');

console.log('== manifesto: a build ANOTA se os TRÊS existem (agora gatilho da REVELAÇÃO, não dos selos pequenos) ==');
{
  const m = html.match(/const SELOS_ARTE=([01])/);
  ok(m, 'SELOS_ARTE está injetado no dist');
  const temPasta = ['ss', 's', 'a'].every(r => fs.existsSync(path.join(raiz, 'web', 'selos', 'seal-' + r + '.webp')));
  ok(m && Number(m[1]) === (temPasta ? 1 : 0), `SELOS_ARTE=${m && m[1]} casa com a presença dos 3 arquivos (${temPasta ? 'presentes' : 'ausentes'})`);
}

console.log('\n== §303: a composição PEQUENA do §301 foi REMOVIDA (não fica dormente) ==');
{
  // a classe-raiz .selo-arte não é mais colocada no boot, e não há regra de selo pequeno com fundo url(selos/…)
  ok(!/classList\.add\('selo-arte'\)/.test(viewjs), 'view.js NÃO acende mais a classe-raiz .selo-arte');
  ok(!/\.selo-arte\s*[.#,{]/.test(shell), 'shell.html NÃO tem mais nenhuma REGRA .selo-arte (composição pequena removida)');
  ok(!/col2c__rar[^\n]*url\(selos\//.test(shell) && !/col2p__rar[^\n]*url\(selos\//.test(shell),
    'nenhum selo PEQUENO recebe fundo url(selos/…)');
  // a única referência a selos/seal- no projeto é a REVELAÇÃO (invocacao.js), como href externo
  const inv = fs.readFileSync(path.join(raiz, 'src/invocacao.js'), 'utf8');
  ok(/href="selos\/seal-\$\{rarKey\}\.webp"/.test(inv), 'a arte de selo só aparece na revelação (invocacao.js), como href externo');
}

console.log('\n== INVARIANTE: os 3 selos são externos, nunca base64 (pacote não incha) ==');
{
  const inv = fs.readFileSync(path.join(raiz, 'src/invocacao.js'), 'utf8');
  const linhasSelo = (shell + '\n' + inv).split('\n').filter(l => /seal-|selos\//.test(l));
  ok(linhasSelo.length > 0 && linhasSelo.every(l => !/data:/i.test(l)), 'nenhuma linha de selo usa data:/base64');
  ok(/selos\/seal-(ss|s|a)\.webp/.test(html) || /selos\/seal-\$/.test(html), 'os selos aparecem como caminho externo no dist');
}

console.log('\n== runtime: com os 3 arquivos presentes, os SELOS PEQUENOS ficam LETRA (como hoje) ==');
{
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  const w = dom.window, d = w.document;
  ok(w.eval('typeof SELOS_ARTE!=="undefined" && SELOS_ARTE === 1'), 'SELOS_ARTE=1 (os 3 arquivos existem)');
  ok(!d.documentElement.classList.contains('selo-arte'), 'a raiz NÃO tem .selo-arte, mesmo com os arquivos presentes');
  w.eval("Object.keys(GODS).forEach(k=>{perfil.deuses[k]=perfil.deuses[k]||{obtidoEm:Date.now(),copias:1}}); ir('colecao',{},{substituir:true}); if(typeof colSel!=='undefined')colSel=null; render();");
  const selos = [...d.querySelectorAll('.col2c__rar')];
  ok(selos.length > 0, `a grade renderizou selos (${selos.length})`);
  ok(selos.length > 0 && selos.every(s => /^(SS|S|A)$/.test(s.textContent.trim())), 'todo selo da grade é a LETRA (texto SS/S/A)');
  ok(selos.every(s => !s.querySelector('img,image')), 'nenhuma arte de selo entrou na grade (letra-só, como hoje)');
  w.close();
}

console.log('');
console.log(f === 0 ? '>>> SELOS OK' : `>>> ${f} FALHA(S)`);
if (f) process.exit(1);

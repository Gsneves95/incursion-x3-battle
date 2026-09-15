// §279 — REGRA DO PROJETO: nenhum nome de arquivo de asset em web/ tem caractere fora do ASCII.
// O motivo (decisão do dono, aprendida quase do jeito difícil no §279): um nome acentuado (a) tem duas
// formas Unicode — composta (NFC) e decomposta (NFD, a do macOS) — que parecem iguais e não casam, e
// (b) servido por HTTP passa por URL-encoding que varia entre navegador, WebView do Android e o Render.
// Nome ASCII faz a classe inteira do defeito DEIXAR de existir. Babá: renomeie um asset com acento e cai.
const fs = require('fs');
const path = require('path');

let falhas = 0;
function ok(cond, msg) { if (!cond) { falhas++; console.log('  XX ' + msg); } }

const raizWeb = path.join(__dirname, '..', 'web');
const forance = [];   // nomes com caractere fora do ASCII
function varrer(dir) {
  for (const nome of fs.readdirSync(dir)) {
    const full = path.join(dir, nome);
    // testa o NOME do arquivo/pasta (não o caminho): qualquer codepoint > 127 é proibido
    if ([...nome].some(ch => ch.codePointAt(0) > 127)) forance.push(path.relative(raizWeb, full));
    if (fs.statSync(full).isDirectory()) varrer(full);
  }
}

console.log('== §279: nenhum nome de asset em web/ fora do ASCII ==');
if (fs.existsSync(raizWeb)) {
  varrer(raizWeb);
  ok(forance.length === 0, `web/ tem asset(s) com nome fora do ASCII: ${forance.join(', ')}`);
  console.log(`  web/ varrido — ${forance.length === 0 ? 'todos os nomes ASCII' : forance.length + ' fora do ASCII'}`);
} else {
  ok(false, 'a pasta web/ não existe');
}

console.log(falhas === 0 ? '\n>>> ASSETS OK' : `\n>>> ${falhas} FALHA(S)`);
if (falhas) process.exit(1);

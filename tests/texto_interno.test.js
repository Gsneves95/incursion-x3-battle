// texto_interno.test.js (§295-cont) — NENHUM texto EXIBIDO contém referência interna de decisão: "§" seguido de
// dígito. Duas vezes o § vazou para a interface — "(§245)" no nota do ★ Mestre e "(§96)" no motivo da sinergia — a
// mesma família do "INERTE neste protótipo" que o §286 achou no Fujin: referência de bastidor no texto do jogador.
// Duas ocorrências são padrão; esta guarda fecha a classe.
//
// O § é LEGÍTIMO em dois lugares que o jogador NÃO lê: comentários de código e campos internos de dado (convenção
// §283: campo interno começa com "_" — _fonte, _seedNota, _pendencias, _nota). A guarda cobre os dois canais de texto
// exibido: (1) DADO — todo valor-string de data/**/*.json cuja CHAVE (em qualquer nível) não começa com "_";
// (2) CÓDIGO — src/**/*.js e src/shell.html DEPOIS de tirar os comentários (o que sobra é string literal / HTML, que
// pode virar innerHTML). Não é DOM-walk (mais fiel, porém lento e teria de navegar toda tela com dado representativo);
// é a fonte do texto, que é onde se escreve — barato e determinístico. Custo: a convenção "_ = interno" tem de valer
// (por isso missoes.nota virou missoes._nota); um campo interno novo sem "_" daria falso-positivo (é o lembrete certo).
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const REF = /§\s*\d/;   // "§" seguido de dígito (com ou sem espaço)

let falhas = 0;
const ok = (c, m) => { if (!c) { falhas++; console.log('  XX ' + m); } };
const achados = [];

// ---------- (1) DADO: valores-string sob chaves NÃO-internas (não começam com "_") ----------
function walkData(node, keyPath, arquivo) {
  if (typeof node === 'string') { if (REF.test(node)) achados.push(`${arquivo} :: ${keyPath} :: "${node.slice(0, 60)}…"`); return; }
  if (Array.isArray(node)) { node.forEach((v, i) => walkData(v, keyPath + '[' + i + ']', arquivo)); return; }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      if (k.startsWith('_')) continue;   // campo interno (convenção §283) — não é texto exibido
      walkData(node[k], keyPath ? keyPath + '.' + k : k, arquivo);
    }
  }
}
function varrerDataDir(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) varrerDataDir(p);
    else if (e.name.endsWith('.json')) {
      let j; try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (err) { ok(false, `${p}: JSON inválido (${err.message})`); continue; }
      walkData(j, '', path.relative(raiz, p));
    }
  }
}
varrerDataDir(path.join(raiz, 'data'));

// ---------- (2) CÓDIGO: src/**/*.js + src/shell.html, SEM comentários ----------
function semComentarios(txt) {
  return txt
    .replace(/\/\*[\s\S]*?\*\//g, ' ')          // blocos /* ... */ (cobre CSS e JS)
    .split('\n').map(l => { const i = l.indexOf('//'); return i >= 0 ? l.slice(0, i) : l; }).join('\n');  // // até o fim da linha
}
function varrerCodeDir(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) varrerCodeDir(p);
    else if (e.name.endsWith('.js') || e.name.endsWith('.html')) {
      const bruto = fs.readFileSync(p, 'utf8');
      semComentarios(bruto).split('\n').forEach((linha, n) => {
        if (REF.test(linha)) achados.push(`${path.relative(raiz, p)}:${n + 1} (fora de comentário) :: ${linha.trim().slice(0, 70)}`);
      });
    }
  }
}
varrerCodeDir(path.join(raiz, 'src'));

console.log('== §295-cont: nenhum texto EXIBIDO contém "§<dígito>" (dado sob chave não-"_" + código sem comentário) ==');
ok(achados.length === 0, `${achados.length} referência(s) interna(s) "§<dígito>" em texto exibido:\n    ` + achados.join('\n    '));

// prova que a guarda MORDE: um § injetado num valor exibido é pego
(() => {
  const antes = achados.length;
  const amostra = [];
  walkData({ desc: 'texto qualquer (§999) exibido' }, '', 'PROVA');
  // walkData empurra em `achados`; desfaz o efeito colateral e checa
  const pegou = achados.length > antes;
  while (achados.length > antes) achados.pop();
  ok(pegou, 'a guarda deveria pegar um "§999" injetado num campo exibido (prova de que morde)');
})();

console.log(falhas === 0 ? '\n>>> TEXTO-INTERNO OK' : `\n>>> ${falhas} FALHA(S)`);
process.exit(falhas ? 1 : 0);

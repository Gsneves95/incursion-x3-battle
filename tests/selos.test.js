// §301 — SELOS DE RARIDADE, composição (a arte vira MOLDURA, a letra fica POR CIMA). Guardas-babá,
// declarando o ESPAÇO DE ESTADOS que o dono fixou (§295) e percorrendo-o inteiro:
//
//   ESTADO A — SEM ornamento (SELOS_ARTE=0, o de hoje): a classe-raiz `selo-arte` NÃO entra, nenhum
//              url(selos/...) é requisitado (sem 404), e cada selo fica EXATAMENTE como hoje — a letra
//              (SS/S/A) continua desenhada como TEXTO em todos os lugares. Nada de arte trocando a letra.
//   ESTADO B — COM ornamento (SELOS_ARTE=1): a classe-raiz entra UMA vez no boot; os selos emoldurados
//              (grade, resumo, painel, sobreposição) ganham a arte de FUNDO e a letra ganha contorno —
//              legível sobre o borrão dourado (gold-on-gold cru foi medido em 1,00:1, §301). A letra
//              continua TEXTO, nas duas escalas (o contorno é invariante de escala — não some a 780 nem a 951).
//   INVARIANTE — o pacote NÃO cresce: os três webp são EXTERNOS (url(selos/...)), nunca base64/data: no
//              incursion.html; o navegador baixa 3 e reusa em 100 cartões.
//
// Babá: apague o prefixo `.selo-arte` de uma regra do ornamento (vaza para o estado de hoje) e cai; troque
// url(selos/...) por um data: (embute no HTML) e cai; tire o contorno da letra composta e cai; faça o boot
// pôr `selo-arte` sem checar SELOS_ARTE (404 no estado de hoje) e cai.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let f = 0;
const ok = (c, m) => { if (!c) { f++; console.log('  XX ' + m); } else console.log('  ok ' + m); };

const distPath = path.join(__dirname, '../dist/incursion.html');
const html = fs.readFileSync(distPath, 'utf8');
const shell = fs.readFileSync(path.join(__dirname, '../src/shell.html'), 'utf8');

// ---------------------------------------------------------------------------
console.log('== manifesto: a build ANOTA se os TRÊS ornamentos existem ==');
{
  const m = html.match(/const SELOS_ARTE=([01])/);
  ok(m, 'SELOS_ARTE está injetado no dist');
  // web/selos/ ainda não existe (o dono manda as artes depois) → o manifesto tem de ser 0
  const temPasta = ['ss', 's', 'a'].every(r =>
    fs.existsSync(path.join(__dirname, '..', 'web', 'selos', 'seal-' + r + '.webp')));
  ok(m && Number(m[1]) === (temPasta ? 1 : 0),
    `SELOS_ARTE=${m && m[1]} casa com a presença dos arquivos (web/selos: ${temPasta ? 'presente' : 'ausente'})`);
}

// ---------------------------------------------------------------------------
console.log('\n== INVARIANTE: o pacote não cresce — arte EXTERNA, nunca base64 ==');
{
  // os três ornamentos são referenciados por url(selos/...) relativo (a build copia web/ → dist/)
  ['ss', 's', 'a'].forEach(r =>
    ok(shell.includes(`url(selos/seal-${r}.webp)`), `o CSS aponta url(selos/seal-${r}.webp) (externo)`));
  // e NENHUM selo embutido como data:/base64 — o projeto tem outras artes em data: (retratos), mas o SELO
  // é externo por regra (§298/§289). Guarda precisa: nenhuma linha que fala de selo carrega um data: URI.
  const linhasSelo = shell.split('\n').filter(l => /seal-|selo-arte|--seal/.test(l));
  ok(linhasSelo.length > 0 && linhasSelo.every(l => !/data:/i.test(l)),
    'nenhuma regra de selo usa data:/base64 (arte externa, o incursion.html não incha com os selos)');
  // e a string "selos/seal-" aparece só como caminho externo no dist
  const refs = (html.match(/selos\/seal-(ss|s|a)\.webp/g) || []).length;
  ok(refs >= 3, `os três selos aparecem como caminho externo no dist (${refs} refs)`);
}

// ---------------------------------------------------------------------------
console.log('\n== ESTADO B (CSS): o ornamento é FUNDO e a letra ganha contorno — só sob .selo-arte ==');
{
  // toda regra de ornamento tem de estar ATRÁS da classe-raiz — senão vaza para o estado de hoje
  const linhasOrn = shell.split('\n').filter(l => /url\(selos\/seal-/.test(l));
  ok(linhasOrn.length >= 3, 'há regras de ornamento no CSS');
  ok(linhasOrn.every(l => l.includes('.selo-arte')), 'TODA regra url(selos/...) está prefixada por .selo-arte');
  // o bloco de composição (fundo + contorno) também é gated e traz o contorno (text-shadow) e a letra clara
  const blocoComp = shell.match(/\.selo-arte \.col2c__rar,[^}]*background-image:var\(--seal[^}]*\}/);
  ok(blocoComp, 'existe o bloco de composição .selo-arte (fundo por var(--seal))');
  if (blocoComp) {
    ok(/text-shadow:[^;]*#0/i.test(blocoComp[0]), 'a letra composta ganha CONTORNO escuro (text-shadow) — não some no gold-on-gold');
    ok(/color:#f6edda/i.test(blocoComp[0]), 'a letra composta é clara (lê sobre realce E sombra do ornamento)');
    ok(/background-size:contain/i.test(blocoComp[0]), 'o brasão 512² aparece INTEIRO e centrado (contain, não cover — a caixa não é quadrada)');
    ok(/background-color:transparent/i.test(blocoComp[0]), 'o fora-do-brasão é transparente (o recorte do preto vê o cartão)');
  }
  // os frameless/minúsculos ficam FORA do ornamento (medição §301): a barra 3px das Missões e a rota-deus
  ok(!/\.selo-arte[^\n]*\.mtile__rar[^\n]*url\(selos/.test(shell), 'a barra de 3px das Missões NÃO recebe ornamento (não cabe)');
  ok(!/\.selo-arte[^\n]*\.dtop__rar[^\n]*url\(selos/.test(shell), 'a letra da rota-deus NÃO recebe ornamento (frameless, ~10px)');
}

// ---------------------------------------------------------------------------
// runtime: o boot só acende `selo-arte` quando SELOS_ARTE=1 (senão fica o de hoje, sem 404)
function abrir(html2) {
  const vc = new VirtualConsole();
  let err = null; vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
  const dom = new JSDOM(html2, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/', virtualConsole: vc });
  return { dom, w: dom.window, err: () => err };
}
// leva a janela até a GRADE da coleção (onde vive o selo .col2c__rar), com todos os deuses obtidos
function abrirNaGrade(html2) {
  const r = abrir(html2);
  try {
    r.w.eval("Object.keys(GODS).forEach(k=>{perfil.deuses[k]=perfil.deuses[k]||{obtidoEm:Date.now(),copias:1}}); ir('colecao',{},{substituir:true}); if(typeof colSel!=='undefined')colSel=null; render();");
  } catch (e) { /* o erro aparece via jsdomError/err() */ }
  return r;
}

console.log('\n== ESTADO A (runtime): SELOS_ARTE=0 → sem classe-raiz, sem requisição de selos/ ==');
{
  const html0 = html.replace(/const SELOS_ARTE=[01]/, 'const SELOS_ARTE=0');
  const { w, err } = abrirNaGrade(html0);
  ok(!w.document.documentElement.classList.contains('selo-arte'), 'a raiz NÃO tem `selo-arte` (cai no selo de hoje)');
  // a letra continua sendo TEXTO nos selos da grade (nada de <img> trocando a letra)
  const selos = [...w.document.querySelectorAll('.col2c__rar')];
  ok(selos.length > 0, `a grade renderizou selos (${selos.length})`);
  ok(selos.length > 0 && selos.every(s => /^(SS|S|A)$/.test(s.textContent.trim())), 'todo selo da grade mostra a LETRA como texto (SS/S/A)');
  ok(selos.every(s => !s.querySelector('img')), 'nenhum selo trocou a letra por <img> (composição, não troca)');
  ok(!err(), 'sem erro de jsdom no estado de hoje' + (err() ? ': ' + err() : ''));
  w.close();
}

console.log('\n== ESTADO B (runtime): SELOS_ARTE=1 → classe-raiz acesa UMA vez ==');
{
  const html1 = html.replace(/const SELOS_ARTE=[01]/, 'const SELOS_ARTE=1');
  const { w, err } = abrirNaGrade(html1);
  ok(w.document.documentElement.classList.contains('selo-arte'), 'a raiz ganha `selo-arte` quando os três existem');
  // a letra CONTINUA texto (composição, não troca) — a arte é só o fundo
  const selos = [...w.document.querySelectorAll('.col2c__rar')];
  ok(selos.length > 0 && selos.every(s => /^(SS|S|A)$/.test(s.textContent.trim())), 'com ornamento, a letra segue TEXTO por cima (SS/S/A)');
  ok(selos.every(s => !s.querySelector('img')), 'a arte é FUNDO (CSS), não um <img> no lugar da letra');
  ok(!err(), 'sem erro de jsdom com ornamento' + (err() ? ': ' + err() : ''));
  w.close();
}

console.log('');
console.log(f === 0 ? '>>> SELOS OK' : `>>> ${f} FALHA(S)`);
if (f) process.exit(1);

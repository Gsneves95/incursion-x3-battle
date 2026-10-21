// §352 — GUIA VISUAL / FOLHA DE COMPONENTES. Garante que o DOCUMENTO (docs/guia-visual.md) e a FOLHA viva
// (renderGuia, rota 'guia') NÃO DIVERGEM: o conjunto de componentes listado no doc é exatamente o renderizado na folha,
// cada tile tem conteúdo real, e a folha monta na tela fixa. É uma página de DEV — não altera nenhuma tela do jogo.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };

// 1) ids do DOCUMENTO: dentro do bloco "<!-- COMPONENTES" até o próximo cabeçalho "## ".
const md = fs.readFileSync(path.join(__dirname, '../docs/guia-visual.md'), 'utf8');
ok(/##\s*Componentes/.test(md), 'o guia tem a seção Componentes');
const ini = md.indexOf('<!-- COMPONENTES');
const resto = md.slice(ini);
const fim = resto.indexOf('\n## ');
const bloco = fim >= 0 ? resto.slice(0, fim) : resto;
const docIds = (bloco.match(/^- `([a-z0-9-]+)`/gm) || []).map(l => l.replace(/^- `/, '').replace(/`$/, ''));
ok(docIds.length >= 10, `o documento lista ${docIds.length} componentes`);

// 2) ids da FOLHA viva (renderGuia): os data-comp dos tiles.
const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
const vc = new VirtualConsole(); let err = null;
vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/', virtualConsole: vc });
const w = dom.window, d = w.document;
const $$ = s => [...d.querySelectorAll(s)];
w.eval("ir('guia',{},{substituir:true}); render();");
ok(!err, 'a folha monta sem quebrar (' + (err || 'ok') + ')');
ok(!!d.querySelector('#guiafix.guia2, .guia2 #guiafix'), 'monta na tela fixa (#guiafix dentro de .guia2)');
const folhaIds = $$('#guiagrade [data-comp]').map(e => e.dataset.comp);

// 3) o documento e a folha cobrem EXATAMENTE o mesmo conjunto (nenhum dos lados diverge).
const dset = new Set(docIds), fset = new Set(folhaIds);
const soNoDoc = docIds.filter(x => !fset.has(x));
const soNaFolha = folhaIds.filter(x => !dset.has(x));
ok(soNoDoc.length === 0, `todo componente do documento aparece na folha (faltam: ${soNoDoc.join(',') || 'nenhum'})`);
ok(soNaFolha.length === 0, `todo componente da folha está no documento (sobram: ${soNaFolha.join(',') || 'nenhum'})`);
ok(folhaIds.length === new Set(folhaIds).size, 'nenhum data-comp duplicado na folha');

// 4) a constante GUIA_COMPONENTES do código bate com os dois (fonte única da lista).
const codeIds = w.eval("GUIA_COMPONENTES");
ok(codeIds.length === folhaIds.length && codeIds.every(x => fset.has(x)), 'GUIA_COMPONENTES == os tiles renderizados');

// 5) cada tile tem demo com conteúdo real (não vazio).
let vazios = [];
$$('#guiagrade [data-comp]').forEach(t => { const demo = t.querySelector('.guia-tile__demo'); if (!demo || demo.innerHTML.trim().length < 5) vazios.push(t.dataset.comp); });
ok(vazios.length === 0, `cada componente tem demo real (vazios: ${vazios.join(',') || 'nenhum'})`);

// 6) prova pontual de que os componentes vieram das FUNÇÕES/CSS reais (amostra)
ok(!!d.querySelector('[data-comp="card-montador"] .dm-card'), 'card-montador usa .dm-card real (_montCardHTML)');
ok(!!d.querySelector('[data-comp="trilha-niveis"] .nlp'), 'trilha-niveis usa .nlp real (nlPainelHTML)');
ok(!!d.querySelector('[data-comp="icone-pontos"] .nltop__ic'), 'icone-pontos usa o selo real (_pontoIcSVG)');
ok(!!d.querySelector('[data-comp="orbe"] img.orbe'), 'orbe usa orbe() real (<img class="orbe">)');
ok(!!d.querySelector('[data-comp="confirmacao-inline"] .nlp__conf'), 'confirmacao-inline usa .nlp__conf real');

if (falhas) { console.log(`\n== ${passes} ok, ${falhas} FALHAS ==`); process.exit(1); }
console.log(`\n== GUIA/FOLHA §352 OK (${passes}) — documento e folha em sincronia ==`);
process.exit(0);

// §282 — A TELA DE PERSONAGENS (Coleção refeita): PAINEL-LEITOR-DE-KIT + GRADE filtrável.
// Guardas-babá do reskin: o mockup do dono trazia TRÊS MENTIRAS que este jogo não sustenta, e um punhado
// de invariantes que o painel/grade têm de honrar. Runtime da tela em jsdom (§202: o que se constrói tem de
// aparecer sem quebrar). Medição de PIXELS (colunas, corte) mora no navegador real — aqui é ESTRUTURA/LÓGICA.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };

const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
const vc = new VirtualConsole();
let err = null;
vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/', virtualConsole: vc });
const w = dom.window, d = w.document;
const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
const txt = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();

console.log('== §282 — TELA DE PERSONAGENS (Coleção) ==');

// seed: metade possuídos (para ter os dois estados na tela), moedas conhecidas.
w.eval(`
  (function(){ var ks=ROSTER.map(e=>e.key); perfil.deuses={};
    ks.forEach((k,i)=>{ if(i%2===0) perfil.deuses[k]={copias:1+(i%3),favorito:false,obtidoEm:Date.now()-i*1e6}; });
    perfil.moedas={essencia:12480,gema:340}; })();
  colSel=null; colF={busca:'',cultura:'',classe:'',funcao:'',status:'',raridade:'',ordem:'recentes'};
  ir('colecao',{},{substituir:true}); render();
`);
ok(!err, 'a tela renderiza sem quebrar (' + (err || 'ok') + ')');
ok(!!$('.col2'), 'a casca .col2 existe');

// ---- 1. MENTIRA #1 do mockup: "Nv. 40/40" + barra + atributos. NADA disso existe (invariante #3). ----
console.log('\n== 1. sem nível/atributos/barra (o painel é LEITOR-DE-KIT, não ficha de RPG) ==');
{
  // pattern-match no TEXTO renderizado (textContent), não no innerHTML — o base64 das artes tem lixo aleatório.
  const painel = $('.col2__painel'), ptext = txt(painel);
  ok(!$('progress') && !$('.col2p__prog') && !$('[class*="barra-nivel"]'), 'nenhuma barra de progresso/nível no painel');
  ok(!/Nv\.?\s*\d/.test(ptext) && !/N[íi]vel\s*\d/.test(ptext) && !/\bLv\.?\s*\d/i.test(ptext), 'nenhum texto de NÍVEL (Nv. 40/40)');
  ok(!/\/\s*40\b/.test(ptext), 'nenhum "/40" (o teto de nível inventado pelo mockup)');
  // os rótulos de atributo do mockup, em caixa alta, NÃO aparecem como linhas de status
  ok(!/\bATAQUE\b/.test(ptext) && !/\bDEFESA\b/.test(ptext) && !/\bVELOCIDADE\b/.test(ptext), 'nenhum rótulo de atributo (ATAQUE/DEFESA/VELOCIDADE)');
  // e o painel de fato traz o KIT (a razão de existir)
  ok($$('.col2p__kit .col2k__row').length === 4, 'o painel traz as 4 linhas do kit (básico/habilidade/milagre/passiva)');
}

// ---- 2. MENTIRA #2: contador "195/300". É possuídos/100 (são 100 deuses, não 300). ----
console.log('\n== 2. contador é possuídos/100 (não /300) ==');
{
  ok(w.eval('ROSTER.length') === 100, 'o acervo é de 100 deuses');
  const pos = $('.col2__moeda--pos');
  ok(pos && /\/\s*100\b/.test(txt(pos)), 'o 3º contador do topo mostra .../100 → ' + txt(pos));
  ok(!/\/\s*300\b/.test($('.col2__topo').innerHTML), 'em lugar nenhum aparece /300');
  const donos = w.eval('ROSTER.map(e=>e.key).filter(temDeus).length');
  ok(txt(pos).replace(/\s/g,'').includes(String(donos) + '/100'), `o numerador é o nº real de possuídos (${donos})`);
}

// ---- 3. MENTIRA #3: banda de raridade "B". Só existem SS/S/A. ----
console.log('\n== 3. só três bandas: SS/S/A — nenhum "B" ==');
{
  const rars = w.eval('ROSTER.map(e=>raridadeDe(e.key))');
  const set = [...new Set(rars)].sort().join(',');
  ok(rars.every(r => r === 'SS' || r === 'S' || r === 'A'), 'toda raridade ∈ {SS,S,A} (achado: ' + set + ')');
  ok(!$('.col2c__rar--B') && !$('.col2p__rar--B'), 'nenhuma banda "B" no DOM');
  const conta = rars.reduce((a, r) => (a[r] = (a[r] || 0) + 1, a), {});
  ok(conta.SS === 16 && conta.S === 31 && conta.A === 53, `a distribuição bate o dado: SS ${conta.SS} · S ${conta.S} · A ${conta.A}`);
  // as opções do filtro de raridade também só oferecem SS/S/A
  const opRar = $$('select[data-filtro="raridade"] option').map(o => o.value).filter(Boolean);
  ok(opRar.join(',') === 'SS,S,A', 'o seletor de raridade oferece só SS/S/A');
}

// ---- 4. CADA FILTRO REDUZ a grade DE VERDADE (busca, cultura, classe, função, status, raridade). ----
console.log('\n== 4. cada filtro reduz a grade (nenhum é decorativo) ==');
{
  const base = w.eval('colecaoFiltrada().length');
  ok(base === 100, 'sem filtro, os 100 aparecem');
  const conta = expr => w.eval(`(function(){ var g=Object.assign({},colF); ${expr}; var n=colecaoFiltrada.call(null); return n.length; })()`);
  // aplica cada filtro isolado via colF e mede
  const medir = (campo, val) => w.eval(`colF.busca='';colF.cultura='';colF.classe='';colF.funcao='';colF.status='';colF.raridade=''; colF['${campo}']=${JSON.stringify(val)}; colecaoFiltrada().length`);
  ok(medir('busca', 'zeus') < base && medir('busca', 'zeus') >= 1, 'BUSCA "zeus" reduz');
  ok(medir('cultura', 'Grega') < base && medir('cultura', 'Grega') > 0, 'CULTURA Grega reduz');
  ok(medir('classe', 'Físico') < base && medir('classe', 'Físico') > 0, 'CLASSE Físico reduz');
  ok(medir('funcao', 'Suporte') < base && medir('funcao', 'Suporte') > 0, 'FUNÇÃO Suporte reduz');
  ok(medir('status', 'nao') < base && medir('status', 'nao') > 0, 'STATUS não-possuídos reduz');
  ok(medir('raridade', 'SS') < base && medir('raridade', 'SS') > 0, 'RARIDADE SS reduz');
  // e a grade DESENHADA acompanha (aplica cultura e re-renderiza a grade)
  w.eval("colF.busca='';colF.cultura='Maia';colF.classe='';colF.funcao='';colF.status='';colF.raridade=''; colAtualizarGrade();");
  ok($$('#col2grade .col2c').length === w.eval("colecaoFiltrada().length"), 'a grade DESENHADA tem exatamente os cartões do filtro');
  w.eval("colF.cultura=''; colAtualizarGrade();");
}

// ---- 5. o painel mostra o KIT COMPLETO: 4 entradas, com CUSTO (bolinhas) e RECARGA nas 3 ações. ----
console.log('\n== 5. painel = kit completo (custo + recarga nas 3 ações + passiva) ==');
{
  // escolhe um possuído com kit de 3 ações
  const k = w.eval("ROSTER.map(e=>e.key).find(k=>temDeus(k)&&GODS[k]&&(GODS[k].ab||[]).length>=3)");
  w.eval(`colSelecionar(${JSON.stringify(k)})`);
  const painel = $('#col2painel');
  const rots = [...painel.querySelectorAll('.col2k__rot')].map(e => txt(e));
  ok(rots.join(',') === 'BÁSICO,HABILIDADE,MILAGRE,PASSIVA', 'as 4 linhas na ordem: ' + rots.join(' · '));
  const acoes = [...painel.querySelectorAll('.col2k__row')].slice(0, 3);
  ok(acoes.every(r => r.querySelector('.cost')), 'as 3 ações mostram o CUSTO (bolinhas de pipsDetalhe)');
  ok(acoes.every(r => /recarga|sem recarga/.test(txt(r.querySelector('.col2k__cd')))), 'as 3 ações mostram a RECARGA');
  ok(/passiva/i.test(txt(painel.querySelector('.col2k__row:last-child'))), 'a 4ª linha é a PASSIVA (não gasta ação)');
  // identidade: 4 tags (facção/elemento/classe/função) + o ARQUÉTIPO como legenda sob o nome (§282(b/c):
  // agora existe em data/deuses, espelhado do kits.json e guardado pelo checar_cadeia).
  ok(painel.querySelectorAll('.col2p__ident .col2p__tag').length === 4, 'identidade: 4 tags (facção, elemento, classe, função)');
  const arqEl = painel.querySelector('.col2p__arq');
  ok(!!arqEl && txt(arqEl) === (w.eval(`(GODS[${JSON.stringify(k)}]||{}).arquetipo`) || ''), 'o ARQUÉTIPO aparece como subtítulo, batendo o dado (' + txt(arqEl) + ')');
  ok(!!painel.querySelector('.col2p__ver'), 'o botão VER DETALHES leva ao ecrã cheio do deus');
  // §282-item2: o kit rola; a névoa+chevron avisa que há mais abaixo, e o botão é IRMÃO EM FLUXO depois do
  // kit (nunca position:absolute sobre ele) — então não tapa a última linha. (o toggle da névoa e o "não
  // tapa" com números reais vivem na verificação Chromium; aqui a ESTRUTURA que os garante.)
  const kitwrap = painel.querySelector('.col2p__kitwrap');
  ok(!!kitwrap && !!kitwrap.querySelector('.col2p__kit') && !!kitwrap.querySelector('.col2p__fade'), 'o kit rolável tem a névoa-aviso (col2p__fade) no rodapé');
  const filhos = [...painel.querySelector('.col2p').children];
  ok(filhos.indexOf(kitwrap) < filhos.indexOf(painel.querySelector('.col2p__ver')), 'o botão vem DEPOIS do kit no fluxo (irmão, não sobreposto)');
}

// ---- 6. POSSUÍDO × NÃO-POSSUÍDO inequívocos (a linguagem do §216: dourado × apagado). ----
console.log('\n== 6. possuído × não-possuído distinguíveis (tratamento do §216) ==');
{
  const kTem = w.eval("ROSTER.map(e=>e.key).find(temDeus)");
  const kNao = w.eval("ROSTER.map(e=>e.key).find(k=>!temDeus(k))");
  w.eval("colF.busca='';colF.cultura='';colF.classe='';colF.funcao='';colF.status='';colF.raridade=''; colAtualizarGrade();");
  const cTem = $(`.col2c[data-deus="${kTem}"]`), cNao = $(`.col2c[data-deus="${kNao}"]`);
  ok(cTem && cTem.classList.contains('col2c--tem'), 'cartão possuído tem .col2c--tem (moldura dourada)');
  ok(cNao && cNao.classList.contains('col2c--falta'), 'cartão não-possuído tem .col2c--falta (apagado)');
  w.eval(`colSelecionar(${JSON.stringify(kNao)})`);
  ok($('#col2painel .col2p').classList.contains('col2p--falta'), 'painel de não-possuído usa .col2p--falta');
  ok(/N[ãa]o possu[íi]do/.test(txt($('#col2painel .col2p__posse'))), 'e diz "Não possuído"');
  w.eval(`colSelecionar(${JSON.stringify(kTem)})`);
  ok(/Possu[íi]do/.test(txt($('#col2painel .col2p__posse'))), 'painel de possuído diz "Possuído · N cópias"');
}

// ---- 7. NENHUMA arte ausente vira <img> 404 (§213): <img> só para deus com arte confirmada (IMG). ----
console.log('\n== 7. sem 404 de arte (§213: <img> só quando a arte existe) ==');
{
  w.eval("colF.busca='';colF.cultura='';colF.classe='';colF.funcao='';colF.status='';colF.raridade=''; colAtualizarGrade();");
  const artes = new Set(w.eval('Object.values(IMG)'));
  const imgs = $$('#col2grade .col2c__art img');
  ok(imgs.every(im => artes.has(im.getAttribute('src'))), `todo <img> da grade referencia arte confirmada em IMG (${imgs.length} imgs)`);
  // deus sem arte confirmada → cartão com monograma, ZERO <img>
  const semArte = w.eval("ROSTER.map(e=>e.key).find(k=>!IMG[k])");
  if (semArte) {
    const c = $(`.col2c[data-deus="${semArte}"]`);
    ok(c && !c.querySelector('img') && !!c.querySelector('.slot__glyph'), `deus sem arte (${semArte}) mostra monograma, sem <img>`);
  } else {
    ok(true, 'todos os 100 deuses têm arte confirmada (nenhum caso de reserva a exercer)');
  }
}

console.log(`\n${falhas ? '✗ ' + falhas + ' FALHA(S)' : '✓ tudo verde'} · ${passes} asserções`);
process.exit(falhas ? 1 : 0);

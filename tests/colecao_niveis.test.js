// §358 — "NADA SE PERDEU": a sobreposição da Coleção (kit + níveis) SAIU; tudo o que ela mostrava agora vive na FICHA
// (rota 'deus') ou nos NÍVEIS (rota 'niveis'). Este teste (jsdom) prova o CAMINHO novo e a cobertura:
//   1) tocar num cartão da Coleção abre a FICHA daquele deus;
//   2) as setas ‹ › andam na lista FILTRADA de onde se veio (e na lista sem filtro quando se vem de fora);
//   3) a SINERGIA aparece na ficha (aba) — a mesma lista que a sobreposição mostrava;
//   4) cada item da antiga sobreposição tem um lar: Possuído·cópias, arquétipo, setas, SINERGIA, KIT, SUBIR.
// (Parte B histórica: nenhum texto visível de PvE usa "Provação" — os RITOS.)
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };
const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
const html = fs.readFileSync(distAbs, 'utf8');

(function parte1(){
  const vc = new VirtualConsole(); let err = null; vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
  const w = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: vc }).window;
  const d = w.document, $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
  const txt = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
  const clk = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));

  console.log('== §358 — nada se perdeu: a sobreposição virou FICHA + NÍVEIS ==');
  w.eval(`perfil.deuses={}; ROSTER.forEach(e=>perfil.deuses[e.key]={copias:2,obtidoEm:Date.now()});
    contaAtual={perfil,niveis:{},pontos:{}};
    colF={busca:'',cultura:'',classe:'',funcao:'',elem:'',status:'',raridade:'',ordem:'nome'};
    ir('colecao',{},{substituir:true}); render();`);
  ok(!err, 'render ok (' + (err || 'ok') + ')');

  // 1) tocar num cartão abre a FICHA daquele deus
  const lista = w.eval('colecaoFiltrada()');
  const card = $('#col2grade .col2c[data-deus]');
  const k0 = card.dataset.deus;
  clk(card);
  ok(w.eval("rotaAtual()") === 'deus' && w.eval("(paramsAtuais()||{}).key") === k0, '1) tocar no cartão abre a ficha do deus tocado');
  ok(!$('#col2ov'), '1) nenhuma sobreposição foi aberta');

  // 2) as setas ‹ › andam na lista FILTRADA (ordem 'nome'): o próximo é o vizinho na lista
  {
    const idx = lista.indexOf(k0);
    ok(!$('#dsxprev') || $('#dsxprev').disabled, '2) no 1º da lista a seta ‹ fica desabilitada');
    const nx = $('#dsxnext'); ok(!!nx && !nx.disabled, '2) a seta › existe e está ativa');
    clk(nx);
    ok(w.eval("(paramsAtuais()||{}).key") === lista[idx + 1], '2) › vai para o PRÓXIMO da lista filtrada (' + lista[idx + 1] + ')');
    clk($('#dsxprev'));
    ok(w.eval("(paramsAtuais()||{}).key") === lista[idx], '2) ‹ volta para o anterior (mesma lista)');
  }

  // 3) a SINERGIA aparece na ficha (aba) — para um deus COM parceiros, a lista; e troca de volta p/ habilidades
  {
    // acha um deus com parceiros
    const comPar = w.eval("Object.keys(SINERGIA.fichas).find(k=>(SINERGIA.fichas[k].parceiros||[]).length>0)");
    w.eval(`fichaAba='habilidades';deusSelKey=null;ir('deus',{key:${JSON.stringify(comPar)}},{substituir:true});render();`);
    ok($$('.dsx-tab[data-ficha-aba]').length === 2 && /SINERGIA/.test(txt($('[data-ficha-aba="sinergia"]'))), '3) a ficha tem a aba SINERGIA');
    clk($('[data-ficha-aba="sinergia"]'));
    ok(!!$('.dsx-sin') && ($$('.dsx-sin__par').length > 0 || !!$('.dsx-sin__solo') || !!$('.dsx-sin__faixa')), '3) a aba SINERGIA mostra a lista/faixa de sinergia');
    clk($('[data-ficha-aba="habilidades"]'));
    ok(!!$('.dsx-hab__btns') && !$('.dsx-sin'), '3) voltar para HABILIDADES mostra o kit de novo');
  }

  // 4) cobertura: cada coisa da antiga sobreposição tem um lar
  {
    w.eval("fichaAba='habilidades';deusSelKey=null;ir('deus',{key:'zeus'},{substituir:true});render();");
    ok(/Possuído/.test(txt($('.dsx-art__posse'))) && /cópia/.test(txt($('.dsx-art__posse'))), '4) "Possuído · N cópias" → ficha (arte)');
    ok(!!$('.dsx-art__arq'), '4) o arquétipo → ficha (arte)');
    ok(!!$('#dsxprev') && !!$('#dsxnext'), '4) as setas ‹ › → ficha');
    ok($$('.dsx-hab__btns .dsk').length === 5, '4) o KIT (5 habilidades) → ficha');
    const sb = $('.dsxb--subir[data-irniveis="zeus"]'); ok(!!sb, '4) "SUBIR HABILIDADES" → ficha');
    clk(sb);
    ok(w.eval("rotaAtual()") === 'niveis' && $$('.nlx-dir .nlp').length === 4, '4) SUBIR leva aos NÍVEIS (os 4 cartões: +Defesa)');
    ok(/Pontos de/.test(txt($('.nltop__ptn'))), '4) os pontos do deus seguem nos níveis');
  }

  // B) PvE não usa "Provação" no texto visível (RITOS) — guarda histórica
  {
    w.eval("ir('colecao',{},{substituir:true}); render();");
    ok(!/Provaç|Provacao/i.test(txt($('#colfix')) || ''), 'B) a Coleção não escreve "Provação" (são RITOS no PvE)');
  }

  if (falhas) { console.log(`\n== ${passes} ok, ${falhas} FALHAS ==`); process.exit(1); }
  console.log(`\n== §358 NADA SE PERDEU OK (${passes}) ==`);
  process.exit(0);
})();

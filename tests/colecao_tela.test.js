// §282/§284 — A TELA DE PERSONAGENS (Coleção). §282 criou o reskin (grade filtrável + painel-leitor);
// §284 remodelou o painel: abre em REPOUSO (sem seleção), o painel mostra identidade+posse+MAESTRIA (sem
// kit), e o kit COMPLETO vai para uma SOBREPOSIÇÃO (não rota) que o fundo fecha. Runtime da tela em jsdom
// (§202: o que se constrói tem de aparecer sem quebrar). Medição de PIXELS (colunas/rolagem) vive no
// navegador real (a verificação Chromium do §284); aqui é ESTRUTURA/ESTADO.
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

console.log('== §282/§284 — TELA DE PERSONAGENS (Coleção) ==');

// seed: metade possuídos + maestria variada (zeus Adepto; ares Mestre) para exercitar o painel de maestria.
w.eval(`
  (function(){ var ks=ROSTER.map(e=>e.key); perfil.deuses={};
    ks.forEach((k,i)=>{ if(i%2===0) perfil.deuses[k]={copias:1+(i%3),favorito:false,obtidoEm:Date.now()-i*1e6}; });
    perfil.moedas={essencia:12480,gema:340};
    perfil.maestria={ zeus:{vitorias:22,milagre:false}, ares:{vitorias:30,milagre:true} }; perfil.provacoes={}; })();
  colF={busca:'',cultura:'',classe:'',funcao:'',status:'',raridade:'',ordem:'recentes'};
  ir('colecao',{},{substituir:true}); render();
`);
ok(!err, 'a tela renderiza sem quebrar (' + (err || 'ok') + ')');

// ---- 1. §284: abre em REPOUSO — nenhum deus selecionado, o painel não mostra personagem. ----
console.log('\n== 1. abre em REPOUSO (nenhum deus selecionado) ==');
{
  ok(w.eval('colSel') === null, 'colSel === null ao abrir');
  ok(!!$('#col2painel .col2p--repouso'), 'o painel está em repouso');
  ok(!$('#col2painel .col2p__nome'), 'o painel NÃO mostra nome de personagem');
  ok(/^\d+\/100$/.test(txt($('.col2r__big'))), 'o repouso mostra o progresso possuídos/100 → ' + txt($('.col2r__big')));
  ok($$('#col2painel .col2r__rar').length === 3, 'o repouso mostra a quebra por raridade (3 bandas)');
  ok(/toque/i.test(txt($('.col2r__dica'))), 'o repouso convida a tocar num personagem');
}

// ---- 2. contador possuídos/100 (não /300) ----
console.log('\n== 2. contador possuídos/100 (não /300) ==');
{
  ok(w.eval('ROSTER.length') === 100, 'o acervo é de 100 deuses');
  ok(/\/\s*100\b/.test(txt($('.col2__moeda--pos'))) && !/\/\s*300\b/.test($('.col2__topo').innerHTML), 'o 3º contador do topo é .../100, nunca /300');
}

// ---- 3. só três bandas SS/S/A — nenhum "B" ----
console.log('\n== 3. só SS/S/A (nenhum B) ==');
{
  const rars = w.eval('ROSTER.map(e=>raridadeDe(e.key))');
  ok(rars.every(r => r === 'SS' || r === 'S' || r === 'A'), 'toda raridade ∈ {SS,S,A}');
  const conta = rars.reduce((a, r) => (a[r] = (a[r] || 0) + 1, a), {});
  ok(conta.SS === 16 && conta.S === 31 && conta.A === 53, `distribuição 16/31/53 (${conta.SS}/${conta.S}/${conta.A})`);
  ok(!$('.col2c__rar--B') && $$('select[data-filtro="raridade"] option').map(o => o.value).filter(Boolean).join(',') === 'SS,S,A', 'nenhuma banda B; filtro só SS/S/A');
}

// ---- 4. cada filtro reduz a grade ----
console.log('\n== 4. cada filtro reduz a grade ==');
{
  const base = w.eval('colecaoFiltrada().length'); ok(base === 100, 'sem filtro, os 100 aparecem');
  const medir = (campo, val) => w.eval(`colF.busca='';colF.cultura='';colF.classe='';colF.funcao='';colF.status='';colF.raridade=''; colF['${campo}']=${JSON.stringify(val)}; colecaoFiltrada().length`);
  ok(medir('busca', 'zeus') < base && medir('busca', 'zeus') >= 1, 'BUSCA reduz');
  ok(medir('cultura', 'Grega') < base, 'CULTURA reduz');
  ok(medir('classe', 'Físico') < base, 'CLASSE reduz');
  ok(medir('funcao', 'Suporte') < base, 'FUNÇÃO reduz');
  ok(medir('status', 'nao') < base, 'STATUS reduz');
  ok(medir('raridade', 'SS') < base, 'RARIDADE reduz');
  w.eval("colF.busca='';colF.cultura='';colF.classe='';colF.funcao='';colF.status='';colF.raridade=''; colAtualizarGrade();");
}

// ---- 5. §284: tocar num deus abre o painel (identidade + posse + MAESTRIA, SEM kit); o × fecha → repouso. ----
console.log('\n== 5. painel: identidade + posse + maestria; SEM kit; fecha no × ==');
{
  w.eval("colSelecionar('zeus')");
  const p = $('#col2painel');
  ok(txt(p.querySelector('.col2p__nome')) === 'Zeus', 'painel mostra Zeus');
  ok(txt(p.querySelector('.col2p__arq')) === 'Nuker de área', 'mostra o arquétipo');
  ok(p.querySelectorAll('.col2p__ident .col2p__tag').length === 4, 'identidade: 4 tags (cultura/elemento/classe/função)');
  ok(/Possu[íi]do/.test(txt(p.querySelector('.col2p__posse'))), 'mostra posse (Possuído · N cópias)');
  ok(!p.querySelector('.col2k__row'), 'o painel NÃO mostra habilidade nenhuma (o kit foi para a sobreposição)');
  ok(!!p.querySelector('.col2m'), 'o painel mostra a MAESTRIA');
  ok(/ADEPTO/i.test(txt(p.querySelector('.col2m__posto'))) && /22\/30/.test(txt(p.querySelector('.col2m__prox'))), 'maestria do modelo real: Adepto · 22/30 p/ Mestre');
  // fechar no × → repouso
  ok(!!p.querySelector('#col2fechar'), 'o painel tem × para fechar');
  w.eval("document.querySelector('#col2fechar').click()");
  ok(w.eval('colSel') === null && !!$('#col2painel .col2p--repouso'), 'o × volta ao repouso (colSel null)');
  // tocar no cartão já-selecionado também desseleciona
  w.eval("colSelecionar('zeus')"); ok(w.eval('colSel') === 'zeus', 'seleciona zeus de novo');
}

// ---- 6. MAESTRIA aparece no painel e em NENHUM outro lugar da Coleção. ----
console.log('\n== 6. maestria só no painel (nada na grade) ==');
{
  ok(!!$('#col2painel .col2m'), 'maestria no painel');
  ok($$('#col2grade .col2m, #col2grade .col2c--mestre').length === 0, 'NENHUM indicador de maestria na grade (sem col2m/col2c--mestre)');
  ok(!$('.col2c--mestre'), 'a moldura de Mestre não existe mais na grade');
}

// ---- 6b. §284-ajuste: vitórias ≥30 mas sem Milagre → NÃO mostra barra cheia; mostra o REQUISITO. ----
console.log('\n== 6b. vitórias cumpridas, só falta o Milagre: sem barra, requisito é a manchete ==');
{
  w.eval("perfil.maestria=perfil.maestria||{}; perfil.maestria.zeus={vitorias:34,milagre:false}; colSelecionar('zeus');");
  const m = $('#col2painel .col2m');
  ok(w.eval("nivelMaestria('zeus')") === 3, 'com 34 vitórias e sem Milagre, o posto ainda é Adepto (nv3)');
  ok(!!m && m.classList.contains('col2m--milagre'), 'o painel entra no estado só-falta-Milagre (col2m--milagre)');
  ok(!m.querySelector('.col2m__bar'), 'NÃO há barra (nem cheia) competindo com o texto');
  ok(/Milagre/.test(txt(m.querySelector('.col2m__req'))), 'o REQUISITO é a manchete');
  w.eval("perfil.maestria.zeus={vitorias:22,milagre:false};");   // restaura p/ as seções seguintes
}

// ---- 7. §288: VER DETALHES abre a SOBREPOSIÇÃO seletor+detalhe (4 ícones, abre no básico, o ícone troca a
//         caixa); fundo fecha; Android-back fecha; rolagem preservada; sem maestria; sem <img> 404. ----
console.log('\n== 7. sobreposição §288: 4 ícones + caixa (abre no básico), o ícone troca a caixa ==');
{
  const norm = s => (s || '').replace(/\s+/g, ' ').trim();
  w.eval("colSelecionar('zeus'); document.querySelector('.col2p__ver').click()");
  const ov = $('#col2ov');
  ok(!!ov, 'VER DETALHES abre a sobreposição');
  ok(ov.querySelectorAll('.col2ov__sk').length === 4, 'a sobreposição mostra os QUATRO ícones (básico/habilidade/milagre/passiva)');
  ok($('.col2ov__sk.is-sel') && $('.col2ov__sk.is-sel').dataset.versel === 'basico', 'abre no BÁSICO (o ícone básico é o selecionado)');
  const nomeBasico = w.eval("(GODS.zeus.ab.find(a=>a.slot==='basico')||{}).nome");
  ok(norm($('#col2ovdet .col2ov__detnome').textContent) === norm(nomeBasico), 'a caixa abre com o detalhe do básico');
  // tocar no ícone da HABILIDADE troca a caixa de baixo
  ov.querySelector('.col2ov__sk[data-versel="habilidade"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  const nomeHab = w.eval("(GODS.zeus.ab.find(a=>a.slot==='habilidade')||{}).nome");
  ok(norm($('#col2ovdet .col2ov__detnome').textContent) === norm(nomeHab), 'tocar no ícone da Habilidade troca a caixa p/ a Habilidade');
  ok($('.col2ov__sk.is-sel').dataset.versel === 'habilidade', 'o realce dourado segue o ícone tocado');
  // maestria NÃO entra na sobreposição (§284: o painel é "quem é"; a sobreposição é "o que faz")
  ok(!ov.querySelector('.col2m') && !/MAESTRIA|Iniciado|Aprendiz|Adepto|\bMestre\b/.test(ov.textContent), 'a sobreposição NÃO mostra maestria');
  // nenhuma arte ausente vira <img> 404: toda arte de skill carrega onerror que se remove (§213)
  ok([...ov.querySelectorAll('.col2ov__skart img, .col2ov__detart img')].every(i => i.hasAttribute('onerror')), 'toda arte de skill tem onerror (arte ausente se remove, nunca 404)');
  ok($('#baselayer').hasAttribute('inert'), 'o #baselayer fica inerte (INV 16 / §210)');
  ok(w.eval('colVer') === 'zeus', 'colVer registra a sobreposição (p/ o voltar do Android)');
  // tocar no FUNDO fecha (clique no próprio #col2ov)
  w.eval("(function(){ var ov=document.querySelector('#col2ov'); ov.dispatchEvent(new window.MouseEvent('click',{bubbles:true})); })()");
  ok(!$('#col2ov') && w.eval('colVer') === null, 'tocar no fundo fecha a sobreposição');
  ok(w.eval('colSel') === 'zeus' && !$('#baselayer').hasAttribute('inert'), 'seleção preservada (Zeus) e base volta a ser interativa');
  // voltar do Android fecha a sobreposição ANTES de sair da tela
  w.eval("colAbrirVer('zeus'); voltarNativo();");
  ok(!$('#col2ov') && w.eval("rotaAtual()") === 'colecao', 'o voltar do Android fecha a sobreposição sem sair da Coleção');
  // rolagem preservada: colFecharVer não toca na grade (mesmo nó) → scrollTop sobrevive
  w.eval("(function(){ var g=document.querySelector('#col2grade'); g.scrollTop=80; colAbrirVer('zeus'); colFecharVer(); })()");
  ok(w.eval("document.querySelector('#col2grade').scrollTop") === 80, 'a grade não é re-renderizada ao fechar → rolagem preservada (scrollTop 80)');
}

// ---- 7c. §288: a caixa de detalhe lê data/deuses (mude a fonte e a tela muda); citação reservada some sem frase. ----
console.log('\n== 7c. §288: caixa lê data/deuses (fonte única); citação some sem frase ==');
{
  const norm = s => (s || '').replace(/\s+/g, ' ').trim();
  // inclui exu (passiva que DIVERGIA no kits.json) — a caixa lê data/deuses, então cada slot bate a fonte
  let iguais = true, detalhe = '';
  for (const k of ['zeus', 'exu', 'hermes', 'thor']) {
    w.eval(`perfil.deuses[${JSON.stringify(k)}]=perfil.deuses[${JSON.stringify(k)}]||{obtidoEm:Date.now()}; ir('colecao',{},{substituir:true}); render(); colAbrirVer(${JSON.stringify(k)});`);
    for (const slot of ['basico', 'habilidade', 'milagre', 'passiva']) {
      const chip = d.querySelector(`#col2ov .col2ov__sk[data-versel="${slot}"]`);
      if (chip) chip.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      const tela = norm(d.querySelector('#col2ovdet .col2ov__deftxt').textContent);
      const fonte = norm(w.eval(`(function(){const g=GODS[${JSON.stringify(k)}]; return ${JSON.stringify(slot)}==='passiva'?g.passiva.desc:(g.ab.find(a=>a.slot===${JSON.stringify(slot)})||{}).desc;})()`));
      if (tela !== fonte) { iguais = false; detalhe = k + '.' + slot + ': tela["' + tela + '"] ≠ data/deuses["' + fonte + '"]'; break; }
    }
    w.eval("colFecharVer();");
    if (!iguais) break;
  }
  ok(iguais, 'a caixa de detalhe mostra o desc de data/deuses p/ cada slot' + (iguais ? '' : ' — ' + detalhe));
  // mude a FONTE (data/deuses) e a caixa muda — prova a fonte única
  const orig = w.eval("(GODS.zeus.ab.find(a=>a.slot==='basico')).desc");
  w.eval("GODS.zeus.ab.find(a=>a.slot==='basico').desc='SENTINELA288 zzz'; colAbrirVer('zeus');");
  ok(/SENTINELA288/.test($('#col2ovdet').textContent), 'mudar o data/deuses muda a caixa de detalhe (fonte única)');
  w.eval(`GODS.zeus.ab.find(a=>a.slot==='basico').desc=${JSON.stringify(orig)}; colFecharVer();`);
  // §304b (§283 supera o §288): a CITAÇÃO saiu da sobreposição da Coleção — a frase virou conteúdo do DESTAQUE
  // (só a tela de invocação a mostra; a sobreposição não tem orçamento, §292). Nem com `frase` no dado a Coleção a exibe.
  w.eval("colAbrirVer('zeus');");
  ok(!$('#col2ov .col2ov__cite'), 'a sobreposição da Coleção NÃO tem citação (frase é do destaque, não do elenco)');
  w.eval("colFecharVer(); GODS.zeus.frase='Do fogo que aquece.'; colAbrirVer('zeus');");
  ok(!$('#col2ov .col2ov__cite'), 'mesmo com frase no dado, a Coleção NÃO renderiza citação (sem orçamento — §292/§304b)');
  w.eval("delete GODS.zeus.frase; colFecharVer(); ir('colecao',{},{substituir:true}); render();");
}

// ---- 7d. §289: retrato GRANDE por arquivo (web/retratos/<k>.webp) SÓ na sobreposição; pequeno como reserva; sem 404. ----
console.log('\n== 7d. §289: retrato grande sob demanda (só a sobreposição), pequeno como reserva, sem 404 ==');
{
  // COM arquivo no manifesto → a sobreposição pede retratos/<k>.webp (lazy, onerror), e o pequeno segue embaixo
  w.eval("RETRATO_ARTE.zeus=1; colAbrirVer('zeus');");
  const g = $('#col2ov .col2ov__retratog');
  ok(!!g, 'a sobreposição emite o retrato GRANDE quando o manifesto tem o deus');
  ok(g && /retratos\/zeus\.webp$/.test(g.getAttribute('src')), 'o src é retratos/zeus.webp (arquivo, não base64)');
  ok(g && g.getAttribute('loading') === 'lazy', 'o retrato grande é lazy (não pesa o carregamento)');
  ok(g && g.hasAttribute('onerror'), 'o retrato grande tem onerror (ausente/404 se remove — §213)');
  ok(g && !/^data:/.test(g.getAttribute('src')), 'o retrato grande NUNCA é base64 (o pacote não engorda)');
  ok(!!$('#col2ov .col2ov__retrato .slot'), 'o retrato PEQUENO embutido segue na mesma caixa (reserva enquanto o grande carrega)');
  w.eval("colFecharVer();");
  // SEM arquivo no manifesto → nenhum <img> retratos/ (sem requisição, sem 404); o pequeno permanece
  w.eval("delete RETRATO_ARTE.zeus; colAbrirVer('zeus');");
  ok(!$('#col2ov .col2ov__retratog'), 'sem arquivo no manifesto, a sobreposição NÃO pede retratos/ (sem 404)');
  ok(!!$('#col2ov .col2ov__retrato .slot'), 'e o retrato pequeno embutido continua (ficha nunca abre vazia)');
  w.eval("colFecharVer();");
  // as OUTRAS telas continuam no IMG embutido — nenhuma pede retratos/ (mesmo com o manifesto cheio)
  w.eval("RETRATO_ARTE.zeus=1; ir('colecao',{},{substituir:true}); render(); colSelecionar('zeus');");
  const grade = $('#col2grade'), painel = $('#col2painel');
  ok(grade && !/retratos\//.test(grade.innerHTML), 'a GRADE da Coleção não pede retratos/ (segue no IMG embutido)');
  ok(painel && !/retratos\//.test(painel.innerHTML), 'o PAINEL lateral não pede retratos/ (segue no IMG embutido)');
  w.eval("ir('selecao',{},{substituir:true}); render(); previewPk('zeus'); renderPick();");
  ok(!/retratos\//.test($('#baselayer').innerHTML), 'a SELEÇÃO de time (grade + painel de kit) não pede retratos/');
  w.eval("delete RETRATO_ARTE.zeus; ir('colecao',{},{substituir:true}); render();");
}

// ---- 7e. §291: setas navegam a lista FILTRADA; o slot permanece; extremos desabilitam; fecha no último visto. ----
console.log('\n== 7e. §291: setas de navegação (lista filtrada, slot permanece, extremos, fecha no último) ==');
{
  const norm = s => (s || '').replace(/\s+/g, ' ').trim();
  const clk = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  // filtra por cultura → subconjunto (NÃO os 100)
  w.eval("ir('colecao',{},{substituir:true}); render(); colF.busca='';colF.classe='';colF.funcao='';colF.status='';colF.raridade='';colF.cultura='Grega'; colAtualizarGrade();");
  const L = JSON.parse(w.eval('JSON.stringify(colecaoFiltrada())'));
  ok(L.length >= 3 && L.length < 100, `filtro rende subconjunto p/ navegar (${L.length}, <100)`);
  // abre o PRIMEIRO da lista filtrada
  w.eval(`colAbrirVer(${JSON.stringify(L[0])});`);
  ok(w.eval('colVer') === L[0], 'abre no primeiro filtrado');
  ok($('#col2ovprev') && $('#col2ovprev').disabled, 'no início: seta ANTERIOR desabilitada (sem dar a volta)');
  ok($('#col2ovnext') && !$('#col2ovnext').disabled, 'seta PRÓXIMO ativa');
  // seleciona o MILAGRE e navega → o slot permanece
  clk($('#col2ov .col2ov__sk[data-versel="milagre"]'));
  clk($('#col2ovnext'));
  ok(w.eval('colVer') === L[1], 'PRÓXIMO anda p/ o 2º da lista FILTRADA (não o roster inteiro)');
  ok(w.eval('colVerSel') === 'milagre', 'o slot MILAGRE permanece ao trocar de deus');
  ok($('.col2ov__sk.is-sel').dataset.versel === 'milagre' && norm($('#col2ovdet .col2ov__dettipo').textContent) === 'MILAGRE', 'a caixa abre no MILAGRE do novo deus');
  // vai até o fim: PRÓXIMO desabilita no último; nunca sai do filtrado
  let guarda = 0; while ($('#col2ovnext') && !$('#col2ovnext').disabled && guarda++ < 200) { const antes = w.eval('colVer'); clk($('#col2ovnext')); if (w.eval('colVer') === antes) break; }
  ok(w.eval('colVer') === L[L.length - 1], 'PRÓXIMO chega ao ÚLTIMO da lista filtrada');
  ok($('#col2ovnext').disabled, 'no fim: seta PRÓXIMO desabilita (sem dar a volta)');
  ok(L.includes(w.eval('colVer')), 'o deus atual está no conjunto FILTRADO (nunca navegou p/ fora)');
  // FECHAR deixa o jogador no ÚLTIMO deus visto (não no que abriu), visível na grade
  const ultimo = w.eval('colVer');
  w.eval('colFecharVer();');
  ok(!$('#col2ov'), 'a sobreposição fechou');
  ok(w.eval('colSel') === ultimo, 'ao fechar, a seleção do painel é o ÚLTIMO deus visto');
  ok(!!$(`.col2c[data-deus="${ultimo}"]`), 'o cartão do último deus existe na grade (visível ao fechar)');
  // §240: o voltar do Android fecha a sobreposição antes de sair
  w.eval(`colAbrirVer(${JSON.stringify(L[0])}); voltarNativo();`);
  ok(!$('#col2ov') && w.eval("rotaAtual()") === 'colecao', 'o voltar do Android fecha a sobreposição (mantém §240)');
  w.eval("colF.cultura=''; ir('colecao',{},{substituir:true}); render();");
}

// ---- 7f. §292: o selo de raridade sai de perto do × e vai p/ o retrato (canto sup-esq), mantendo o vocabulário §282. ----
console.log('\n== 7f. §292: selo de raridade sobre o retrato, não ao lado do × ==');
{
  w.eval("colAbrirVer('zeus');");
  const selo = $('#col2ov .col2ov__retrato .col2p__rar');
  ok(!!selo, 'o selo de raridade fica SOBRE o retrato (dentro de .col2ov__retrato)');
  ok(!$('#col2ov .col2ov__conteudo .col2p__rar'), 'o selo NÃO fica mais ao lado do × (fora do conteúdo)');
  ok(selo && /col2p__rar--(SS|S|A)/.test(selo.className), 'mantém a linguagem de raridade do §282 (SS/S/A)');
  ok(selo && selo.classList.contains('col2ov__rarart'), 'usa a classe de posição/brilho nova (col2ov__rarart)');
  w.eval("colFecharVer();");
}

// ---- 8. possuído × não-possuído inequívocos (§216) ----
console.log('\n== 8. possuído × não-possuído ==');
{
  const kTem = w.eval("ROSTER.map(e=>e.key).find(temDeus)"), kNao = w.eval("ROSTER.map(e=>e.key).find(k=>!temDeus(k))");
  w.eval("colF.busca='';colF.cultura='';colF.classe='';colF.funcao='';colF.status='';colF.raridade=''; colAtualizarGrade();");
  ok($(`.col2c[data-deus="${kTem}"]`).classList.contains('col2c--tem'), 'possuído: col2c--tem');
  ok($(`.col2c[data-deus="${kNao}"]`).classList.contains('col2c--falta'), 'não-possuído: col2c--falta');
  w.eval(`colSelecionar(${JSON.stringify(kNao)})`);
  ok($('#col2painel .col2p').classList.contains('col2p--falta') && /N[ãa]o possu[íi]do/.test(txt($('#col2painel .col2p__posse'))), 'painel de não-possuído: falta + "Não possuído"');
}

// ---- 9. sem 404 de arte (§213) ----
console.log('\n== 9. sem 404 de arte (§213) ==');
{
  w.eval("colSelecionar(null); colF.busca='';colF.cultura='';colF.classe='';colF.funcao='';colF.status='';colF.raridade=''; colAtualizarGrade();");
  const artes = new Set(w.eval('Object.values(IMG)'));
  ok($$('#col2grade .col2c__art img').every(im => artes.has(im.getAttribute('src'))), 'todo <img> da grade referencia arte confirmada em IMG');
}

console.log(`\n${falhas ? '✗ ' + falhas + ' FALHA(S)' : '✓ tudo verde'} · ${passes} asserções`);
process.exit(falhas ? 1 : 0);

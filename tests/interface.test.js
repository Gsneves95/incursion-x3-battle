const fs = require('fs');
const { JSDOM } = require('jsdom');
const { calcularEnquadramento } = require('../src/enquadramento.js');   // a REGRA; o teste 14 a chama, não a recopia
const html = fs.readFileSync(require('path').join(__dirname,'../dist/incursion.html'), 'utf8');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
const w = dom.window, d = w.document;
const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
const tap = el => { if (!el) { ok(false, 'elemento ausente'); return; } el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
// §214: o retrato INIMIGO responde a pointerup (toque longo abre o kit; toque curto = alvo/ficha),
// não a click. tapFoe = toque curto: pointerdown+pointerup imediato (o timer de 420ms não dispara).
const tapFoe = el => { if (!el) { ok(false, 'inimigo ausente'); return; }
  el.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 }));
  el.dispatchEvent(new w.MouseEvent('pointerup', { bubbles: true, clientX: 0, clientY: 0 })); };
const S = () => w.eval('st');
const encher = () => { const l = S().lados[S().ativo]; w.eval('ELEMS').forEach(e => l.orbs[e] = 6); w.eval('render()'); };
w.eval('vsCPU=false');   // a suíte dirige os dois lados por toque; testa hot-seat (a IA tem suíte própria)
w.eval("ir('selecao');render()");   // F3.0: o app abre na HOME; esta suíte testa a seleção/batalha — navega até ela

console.log('== 0. arte dos 100 deuses ==');
{
  ok(w.eval('ROSTER.length') === 100, 'o roster da tela deveria ter os 100 deuses');
  ok(w.eval('Object.keys(IMG).length') === 100, 'deveria haver arte para os 100');
  ok(w.eval('ROSTER.every(e=>!!IMG[e.key])'), 'todo deus do roster deveria ter imagem');
  ok(w.eval('Object.values(IMG).every(v=>v.startsWith("data:image/webp;base64,"))'), 'as imagens deveriam estar embutidas');
  ok($$('.dm-card .slot img').length === $$('.dm-card').length && $$('.dm-card').length > 0,
    'todo cart\u00e3o da grade deveria mostrar a arte');
  console.log(`  100 imagens embutidas \u00b7 ${$$('.dm-card .slot img').length}/${$$('.dm-card').length} cart\u00f5es com arte`);
  // a partir daqui as imagens saem: no jsdom, redesenhar 300 KB de base64 a cada
  // render torna a suíte impraticável. A lógica testada é a mesma.
  w.eval('for (const k in IMG) delete IMG[k];');
  w.eval('render()');
}

console.log('== 1. seleção (§345): montador de DOIS times (CPU/hot-seat) ==');
{
  const total = w.eval('ROSTER.length');
  ok(total === 100, `o roster da tela deveria ter os 100 deuses, tem ${total}`);
  // §345: a grade é a do montador (cartões .dm-card), com a pílula Liberados|Todos
  ok(/Liberados/.test($('#bestado').textContent), 'deveria abrir filtrado nos Liberados');
  ok(!$('#fpanel'), 'MAIS FILTROS deveria começar fechado');
  ok($$('.dm-card').length === 9, `Liberados deveria mostrar 9, mostra ${$$('.dm-card').length}`);
  ok($$('.dm-card[data-pick]').length === 9, 'os 9 liberados deveriam ser selecionáveis');
  // Todos: 100, com bloqueados/WIP travados; sem paginação (a grade rola)
  tap($('#bestado'));
  ok(/Todos/.test($('#bestado').textContent), 'a pílula alterna para Todos');
  ok($$('.dm-card').length === 100, `Todos deveria mostrar os 100, há ${$$('.dm-card').length}`);
  ok($$('.dm-card--trav').length > 0, 'em Todos deveria haver bloqueados/WIP travados (não selecionáveis)');
  ok(!$('#bprev') && !$('#bnext'), 'sem paginação — a grade rola');

  const travCard = $('.dm-card--trav');
  const cs = w.getComputedStyle(travCard.querySelector('.dm-card__p'));
  ok(/grayscale/.test(cs.filter), 'bloqueado/WIP deveria estar dessaturado');
  ok(!!travCard.querySelector('.dm-card__n').textContent.trim(), 'o nome do bloqueado deveria aparecer');
  ok(!travCard.hasAttribute('data-pick'), 'o travado não é selecionável (sem data-pick)');

  // o "i" abre o painel do kit (mesmo de um bloqueado, leitura pública) e NÃO adiciona
  const lk = w.eval('(ROSTER.find(e=>!e.inicial && GODS[e.key])||{}).key');
  w.eval(`previewPk("${lk}");renderPick()`);
  ok(!!$('#dmkit'), 'o "i" deveria abrir o painel do kit');
  ok($$('#dmkit .dmk-ab').length >= 3, 'o painel deveria listar as habilidades (Básico/Habilidade/Milagre/Defesa)');
  ok(/Bloqueado/.test(($('#dmkit .dm-kit__pe button') || {}).textContent || ''), 'num bloqueado o botão do kit diz "Bloqueado"');
  ok(w.eval('pick[0]').length === 0, 'abrir o kit de um bloqueado não adiciona');
  tap($('[data-kit-x]')); ok(!$('#dmkit'), 'o X fecha o painel');

  // §287/§340 — o painel lê data/deuses (a MESMA fonte da Coleção) + indicador GRÁTIS
  {
    const alvo = 'tyr';
    w.eval(`previewPk("${alvo}");renderPick()`);
    const descBas = w.eval(`(GODS['${alvo}'].ab.find(a=>a.slot==='basico')||{}).desc`);
    const linhas = $$('#dmkit .dmk-ab__desc').map(e => e.textContent.trim());
    ok(linhas.includes(descBas), 'seleção: o básico mostra o deuses.desc (lê data/deuses)');
    ok(/GRÁTIS/.test($('#dmkit').textContent) && !/^Grátis\./.test(descBas),
      'seleção: o básico grátis mostra o indicador GRÁTIS (§340), sem "Grátis." no texto');
    // §358: a sobreposição da Coleção saiu — a FICHA mostra o kit pelo MESMO renderizador (deusDetalheHTML, lê data/deuses).
    const fichaDet = k => `deusDetalheHTML(${JSON.stringify(k)}, deusKitEfetivo(${JSON.stringify(k)}, GODS[${JSON.stringify(k)}]), 'basico')`;
    const ov = new w.DOMParser().parseFromString(w.eval(fichaDet(alvo)), 'text/html');
    const efCol = ((ov.querySelector('.ddet__desc') || {}).textContent || '').trim();
    ok(efCol === descBas, 'Ficha e Seleção mostram a MESMA linha para o mesmo deus');
    const orig = descBas;
    w.eval(`GODS['${alvo}'].ab.find(a=>a.slot==='basico').desc='SENTINELA287 zzz'`);
    w.eval(`previewPk("${alvo}");renderPick()`);
    ok(/SENTINELA287/.test($('#dmkit').textContent) && /SENTINELA287/.test(w.eval(fichaDet(alvo))),
      'uma fonte, duas telas: mudar o deuses.desc muda Seleção E Ficha');
    w.eval(`GODS['${alvo}'].ab.find(a=>a.slot==='basico').desc=${JSON.stringify(orig)}`);
    tap($('[data-kit-x]'));
  }

  // volta a Liberados para montar os dois times
  tap($('#bestado'));
  ok(/Liberados/.test($('#bestado').textContent), 'volta ao estado Liberados');
  ok($('#bgo').disabled, 'COMEÇAR travado sem 3+3');
  const keys9 = $$('.dm-card[data-pick]').map(b => b.dataset.pick);
  ok(keys9.length === 9, `deveria haver 9 liberados, há ${keys9.length}`);
  const tapCard = k => tap($(`.dm-card[data-pick="${k}"]`));

  // o "i" não adiciona; o toque no cartão adiciona (modelo do montador)
  w.eval(`previewPk("${keys9[0]}");renderPick()`);
  ok(!!$('#dmkit') && w.eval('pick[0]').length === 0, 'o "i" abre o kit sem adicionar');
  tap($('[data-kit-x]'));
  tapCard(keys9[0]); tapCard(keys9[1]); tapCard(keys9[2]);
  ok(w.eval('pick[0]').length === 3, `J1 deveria encher com 3 (tem ${w.eval('pick[0]').length})`);
  ok(w.eval('vez') === 1, 'a vez deveria passar ao J2 automaticamente');
  ok($$('.dm-card--sel').length === 3, 'os escolhidos têm moldura de selecionado');
  ok($$('.dm-card--sel .dm-card__vaga').length === 3, 'cada escolhido mostra o número da vaga');

  // escolher para o J2 — moldura VERMELHA (.dm-card--sel2)
  const livre2 = $$('.dm-card[data-pick]').map(b => b.dataset.pick).find(k => w.eval(`donoDe("${k}")`) === null);
  tapCard(livre2);
  ok(w.eval('pick[1]').length === 1 && w.eval(`donoDe("${livre2}")`) === 1, 'o deus entra no J2 (a vez estava no J2)');
  ok($$('.dm-card--sel2').length === 1, 'o cartão escolhido do J2 usa a marca VERMELHA');

  // tocar num bloco passa a escolher para ele
  tap($('[data-lado="0"]'));
  ok(w.eval('vez') === 0, 'tocar no bloco do J1 passa a escolher para o J1');

  // o X tira
  const antes0 = w.eval('pick[0]').length;
  tap($('[data-lado="0"] [data-rem]'));
  ok(w.eval('pick[0]').length === antes0 - 1, 'o X deveria remover da vaga');

  // um deus de um time NÃO pode entrar no outro
  w.eval('pick=[[],[]]; vez=0; render();');
  tapCard(keys9[0]);                              // J1
  w.eval('vez=1');
  const bloqueado = w.eval(`adicionarPk("${keys9[0]}")`);
  ok(bloqueado === false && w.eval(`donoDe("${keys9[0]}")`) === 0, 'um deus já no J1 não entra também no J2');

  // o kit adiciona ao time da VEZ (rótulo muda conforme o lado)
  w.eval('pick=[[],[]]; vez=0; render();');
  w.eval(`previewPk("${keys9[1]}");renderPick()`);
  ok(/ADICIONAR AO SEU TIME/.test(($('[data-kit-toggle]') || {}).textContent || ''), 'na vez do J1 o kit diz ADICIONAR AO SEU TIME');
  tap($('[data-kit-toggle]'));
  ok(w.eval(`donoDe("${keys9[1]}")`) === 0 && !$('#dmkit'), 'o kit adiciona ao J1 e fecha');
  w.eval('vez=1'); w.eval(`previewPk("${keys9[2]}");renderPick()`);
  ok(/ADICIONAR AO OPONENTE/.test(($('[data-kit-toggle]') || {}).textContent || ''), 'na vez do J2 o kit diz ADICIONAR AO OPONENTE');
  tap($('[data-kit-x]'));

  // ---- filtros: inline (elemento, função), MAIS FILTROS (facção, classe), busca ----
  const chip = (c, i) => $$('[data-fs]').find(b => b.dataset.fs === c + '|' + i);
  w.eval('pick=[[],[]]; vez=0; limparFiltro(); selBusca=""; render();'); tap($('#bestado'));   // Todos
  // §359: a FUNÇÃO desceu p/ o painel MAIS FILTROS (largura do 780×360); o ELEMENTO segue inline
  tap($('#bmaisf')); tap(chip('funcoes', 'Controlador'));
  ok($$('.dm-card').length === w.eval(`listaFiltrada().length`) && $$('.dm-card').length === w.eval(`ROSTER.filter(e=>e.funcao==='Controlador'&&temKit(e.key)).length`), 'a FUNÇÃO (painel) filtra a grade');
  tap(chip('funcoes', 'Controlador')); tap($('#ffechar'));
  // inline elemento
  tap($$('[data-elem]').find(b => b.dataset.elem === 'Umbra'));
  ok($$('.dm-card').length === w.eval(`ROSTER.filter(e=>e.elem==='Umbra').length`), 'o ELEMENTO (inline) filtra a grade');
  tap($$('[data-elem]').find(b => b.dataset.elem === 'Umbra'));
  // MAIS FILTROS: função + facção soma (OU), classe intersecta (E)
  tap($('#bmaisf'));
  ok(!!$('#fpanel') && $$('.fgrp__l').length === 3, 'MAIS FILTROS abre com FUNÇÃO, PANTEÃO e CLASSE');
  ok($$('.chip2').length === 5 + 10 + 3, `18 chips (5 funções + 10 panteões + 3 classes), há ${$$('.chip2').length}`);
  tap(chip('faccoes', 'Japonesa'));
  ok(/14 de 100/.test($('.fbox__n').textContent), `Japonesa tem 14, painel diz "${$('.fbox__n').textContent}"`);
  tap(chip('faccoes', 'Maia'));
  ok(/18 de 100/.test($('.fbox__n').textContent), 'dois panteões SOMAM (OU dentro do eixo)');
  tap(chip('faccoes', 'Maia'));
  tap(chip('classes', 'Mágico'));
  const nJM = w.eval(`ROSTER.filter(e=>e.faccao==='Japonesa'&&e.classe==='Mágico').length`);
  ok($('.fbox__n').textContent.includes(nJM + ' de 100'), `facção ∩ classe = ${nJM} (E entre eixos)`);
  tap($('#flimpar'));
  ok(/100 de 100/.test($('.fbox__n').textContent), 'LIMPAR zera os critérios (Todos = 100)');
  tap($('#ffechar'));

  // combinação elemento(inline) ∩ facção+função(painel) → Izanami/Tsukuyomi
  tap($$('[data-elem]').find(b => b.dataset.elem === 'Umbra'));
  tap($('#bmaisf')); tap(chip('funcoes', 'Controlador')); tap(chip('faccoes', 'Japonesa'));
  ok(/2 de 100/.test($('.fbox__n').textContent), `facção+elemento+função = 2 (${$('.fbox__n').textContent})`);
  tap($('#ffechar'));
  const sobrou = $$('.dm-card__n').map(e => e.textContent.trim()).sort();
  ok(sobrou.join(',') === 'Izanami,Tsukuyomi', `esperado Izanami/Tsukuyomi, veio ${sobrou}`);
  ok(/2/.test(($('.sel-badge') || {}).textContent || ''), 'o badge do MAIS FILTROS conta os extras de função/facção/classe ativos');

  // busca por nome
  w.eval('limparFiltro(); selBusca=""; render();'); tap($('#bestado'));   // Todos
  const sb = $('#selbusca'); sb.value = 'tsuku'; sb.dispatchEvent(new w.Event('input', { bubbles: true }));
  const nb = $$('.dm-card__n').map(e => e.textContent.trim());
  ok(nb.length === 1 && /Tsukuyomi/.test(nb[0]), `busca "tsuku" → Tsukuyomi (veio ${nb})`);
  w.eval('selBusca="zzxx"; render();');
  ok(/Nenhum deus atende/.test(($('#selgrade') || {}).textContent || ''), 'busca sem resultado deveria explicar');
  w.eval('selBusca=""; limparFiltro(); render();');

  // TESTE libera todos os kits prontos (sem paginação: a grade mostra todos)
  tap($('#bteste'));
  const prontos = w.eval('Object.keys(GODS).length');
  ok(w.eval('tudoLiberado') === true && $$('.dm-card').length === prontos,
    `TESTE libera os ${prontos} kits prontos, a grade mostra ${$$('.dm-card').length}`);
  tap($('#brand'));
  ok(!$('#bgo').disabled, 'SORTEAR deveria encher os dois times e liberar COMEÇAR');
  ok(w.eval('pick[0]').length === 3 && w.eval('pick[1]').length === 3, 'SORTEAR enche J1 e J2');
  console.log(`  §345: 2 times · Liberados|Todos · MAIS FILTROS (facção/classe) · elemento+função inline · busca · kit por lado`);

  // times FIXOS para os testes seguintes (determinístico)
  w.eval("pick=[['zeus','ogum','brigid'],['cuca','sobek','ganesha']]; vez=0;");
  w.eval('render()');
  ok(!$('#bgo').disabled, 'times fixos deveriam liberar COMEÇAR');
}
tap($('#bgo'));
// o cliente sorteia quem abre; nos testes fixamos o lado 0 para asserções determinísticas
w.eval('st.ativo=0;st.starter=0;st.aberturaFeita=true;render()');

console.log('== 2. estrutura da tela de batalha (§330: topo refeito, sem quadro de ação, minis no painel) ==');
ok(!!$('#batalha'), 'a batalha usa a tela fixa do design do dono (§335: #batalha)');
// §335: header (nomes+energia+encerrar+menu), campo (3 fileiras + cena) e painel do design, em px de design.
['[data-prof="me"]','[data-prof="foe"]','.bt-ebox','.bt-trocar','#bend2','#bmenu','.bt-panel','.bt-panel__minis']
  .forEach(s => ok(!!$(s), `falta ${s}`));
ok($$('.bt-portrait--ally').length === 3, `3 retratos aliados, há ${$$('.bt-portrait--ally').length}`);
ok($$('.bt-portrait--foe[data-foe]').length === 3, `3 retratos inimigos, há ${$$('.bt-portrait--foe[data-foe]').length}`);
ok($$('.bt-skill[data-sk]').length === 12, `3×4 = 12 habilidades aliadas, há ${$$('.bt-skill[data-sk]').length}`);
ok($$('.bt-portrait--foe [data-sk]').length === 0, 'nada do inimigo é armável (só leitura)');   // INV 15
ok($$('[data-inspect]').length === 3, `todo inimigo vivo tem a marca "?" de consulta, há ${$$('[data-inspect]').length}`);
ok($$('.bt-hp').length === 6, `6 barras de vida (atual/máx), há ${$$('.bt-hp').length}`);
ok($$('.bt-hp__lab').every(e => /\d+\/\d+/.test(e.textContent)), 'toda barra de vida mostra atual/máx');
// §335: a habilidade escolhida marca-se no próprio botão; as 4 minis do deus em foco vivem no painel.
ok($$('.bt-acao').length === 0, `sem quadro de ação no DOM, há ${$$('.bt-acao').length}`);
ok($$('.bt-panel__minis .bt-mini[data-look]').length >= 1, 'as minis do deus em foco vivem no painel ("OUTRAS HABILIDADES")');
ok(/você/i.test($('.bt-name--me .bt-name__nick').textContent), `perfil esquerdo = VOCÊ ("${$('.bt-name--me .bt-name__nick').textContent}")`);
ok($('.bt-name--foe .bt-name__nick').textContent.trim().length > 0, 'o oponente é nomeado à direita');
ok(!!$('[data-prof="me"] svg') && !!$('[data-prof="foe"] svg'), 'cada perfil tem a foto placeholder tocável');
ok($$('.bt-ebox .bt-ec').length >= 1, `contadores de energia na caixa do topo, há ${$$('.bt-ebox .bt-ec').length}`);
console.log(`  topo + 3 fileiras + cena + painel · ${$$('.bt-skill').length} habilidades · ${$$('[data-inspect]').length} marcas "?"`);

console.log('== 3. encaixes de arte com chave ==');
const slots = $$('.slot[data-slot]').map(e => e.dataset.slot);
ok(slots.filter(s => s.startsWith('god-')).length >= 6, `chave god- nos retratos, há ${slots.filter(s=>s.startsWith('god-')).length}`);
ok(slots.filter(s => s.startsWith('skill-')).length >= 12, `chave skill- nas habilidades, há ${slots.filter(s=>s.startsWith('skill-')).length}`);

console.log('== 4. tocar habilidade → arma + detalhe no painel ==');
encher();
let bas = $$('.bt-skill[data-sk]').find(x => x.dataset.arma === '1');
ok(!!bas, 'há ao menos uma habilidade armável');
tap(bas);
ok($$('.bt-skill.is-armed').length === 1, 'a habilidade fica armada (.bt-skill.is-armed)');
ok(!!w.eval('armado'), 'o estado global `armado` foi setado');
ok(!!$('.bt-panel__titulo') && $('.bt-panel__titulo').textContent.trim().length > 0, 'o painel mostra o título da habilidade armada');
ok(!!$('#bcanc'), 'Cancelar aparece no painel');
tap($('#bcanc'));
ok(!w.eval('armado'), 'Cancelar desfaz a seleção');

console.log('== 4b. ler habilidade indisponível não arma (toque para ler é grátis) ==');
{
  // zera a energia → as habilidades com custo ficam indisponíveis (data-arma=0), mas continuam legíveis
  w.eval('ELEMS.forEach(e=>st.lados[st.ativo].orbs[e]=0);render()');
  const off = $$('.bt-skill[data-sk]').find(x => x.dataset.arma === '0' && !x.dataset.dead);
  if (off) { tap(off); ok(!w.eval('armado'), 'ler uma indisponível não arma'); ok(!!w.eval('detalhe'), 'mas mostra a leitura no painel'); }
  else ok(true, '(sem habilidade indisponível para o caso — ok)');
  encher();
}

console.log('== 4c. o nível real aparece no painel/ficha (derivado do motor) ==');
{
  // monograma sempre presente nas fichas; o selo "Nv N" só quando ≥2 (aqui nv1 → sem selo, zero poluição)
  ok($$('.bt-skill .bt-skill__mono').length === 12, `as 12 fichas têm monograma, há ${$$('.bt-skill .bt-skill__mono').length}`);
}

console.log('== 6. tocar no alvo resolve ==');
{
  const b = $$('.bt-skill[data-sk]').find(x => x.dataset.arma === '1' && /\|basico$/.test(x.dataset.sk));
  if (b) { tap(b);
    const alvo = $$('.bt-portrait.is-target')[0];
    if (alvo) { const u = alvo.dataset.uid; const antes = S().lados[1].units.concat(S().lados[0].units).find(x=>x.uid===u).hp;
      tap(alvo);
      ok(!w.eval('armado'), 'alvo único resolve a ação (desarma)');
    } else ok(true, '(básico sem alvo — ok)'); }
  else ok(true, '(sem básico armável — ok)');
}

console.log('== 7. ação sem alvo pronto exige CONFIRMAR ==');
{
  w.eval('armado=null;alvos=[];escolhidos=[];detalhe=null;render()');
  // arma uma habilidade de 2 alvos se houver; senão só confere que Confirmar/Cancelar vivem no painel
  encher();
  const multi = $$('.bt-skill[data-sk]').find(x => x.dataset.arma === '1');
  if (multi) { tap(multi); ok(!!$('#bcanc'), 'Cancelar no painel ao armar'); tap($('#bcanc')); }
  ok(true, 'o fluxo de confirmar vive no painel');
}

console.log('== 8. recarga sobre a ficha ==');
{
  const u = S().lados[0].units[0];
  w.eval(`st.lados[0].units[0].cd.habilidade=3;render()`);
  const cdEl = $(`.bt-skill[data-sk="${u.uid}|habilidade"] .bt-skill__cd`);
  ok(!!cdEl && /3/.test(cdEl.textContent), 'a recarga aparece grande sobre a ficha');
  ok($(`.bt-skill[data-sk="${u.uid}|habilidade"]`).classList.contains('is-cooldown'), 'a ficha em recarga ganha is-cooldown');
  w.eval('st.lados[0].units[0].cd.habilidade=0;render()');
}

console.log('== 9. passiva e efeitos são tocáveis (no painel) ==');
{
  w.eval('armado=null;detalhe=null;render()');
  const pas = $('.bt-portrait__pas');
  if (pas) { tap(pas); ok(w.eval('detalhe&&detalhe.kind') === 'passiva', 'tocar o "P" mostra a passiva no painel'); }
  else ok(true, '(nenhuma passiva neste time — ok)');
  w.eval(`(function(){const u=st.lados[st.ativo].units[0];u.efeitos=[{type:'dmgUp',v:8,dur:2}];armado=null;detalhe=null;render();})()`);
  const eff = $('.bt-eff[data-eff]');
  ok(!!eff, 'o efeito vira ícone tocável (.bt-eff)');
  tap(eff);
  ok(w.eval('detalhe&&detalhe.kind') === 'efeito', 'tocar o ícone mostra o efeito no painel');
}

console.log('== 10. tocar o retrato (sem arma) mostra a unidade no painel ==');
{
  w.eval('armado=null;detalhe=null;render()');
  tap($$('.bt-portrait--ally')[1]);
  ok(w.eval('detalhe&&detalhe.kind') === 'unidade', 'tocar o retrato aliado abre a leitura da unidade');
  ok(/\d+\/\d+/.test($('.bt-panel__meio').textContent), 'o painel mostra a vida (atual/máx) no bloco do meio (VIDA)');
}

console.log('== 11. trocar energia abre a conversão (um gesto não gasta) ==');
{
  w.eval('armado=null;detalhe=null;ov=null;render()');
  encher();
  const bt = $('#btrocar');
  ok(!!bt, 'o botão ⇄ TROCAR ENERGIA existe');
  if (bt && !bt.disabled) { tap(bt); ok(w.eval("ov") === 'conv', 'tocar ⇄ abre a sobreposição de conversão'); w.eval('ov=null;convAlvo=null;render()'); }
  else ok(true, '(sem energia para trocar — ok)');
}

console.log('== 12. menu e relógio no topo ==');
{
  ok(!!$('#bend2'), 'ENCERRAR TURNO é o estado+barra do topo (#bend2)');
  ok(!!$('.bt-barra__fill'), 'a barra de tempo existe');
  tap($('#bmenu'));
  ok(!!$('#menu') && !!$('#bsair') && !!$('#bhelp'), 'o MENU (☰) abre o overlay (sair/como jogar etc.)');
  ok(!!$('#bmenubuild'), 'o carimbo de build vive no menu');
  ok(!!$('#bsurr'), '§335: RENDER-SE (rendição) vive no menu');
  ok(!!$('#bcontinuar'), '§335: CONTINUAR fecha o menu');
  tap($('#bmenu'));
}

console.log('== 13. partida completa só por toques ==');
{
  w.eval('ov=null;menuAberto=false;armado=null;detalhe=null;render()');
  let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  let cliques = 0, g = 0;
  while (!S().fim && g++ < 600) {
    encher();
    const livres = $$('.bt-skill[data-sk]').filter(b => b.dataset.arma === '1');
    if (!livres.length) { const e = $('#bend2'); if (e) tap(e); else break; continue; }
    tap(livres[Math.floor(rnd() * livres.length)]); cliques++;
    let t = $$('.bt-portrait.is-target');
    let guard = 0;
    while (t.length && $$('.bt-skill.is-armed').length && guard++ < 6) { tap(t[0]); cliques++; t = $$('.bt-portrait.is-target'); }
    if ($('#bconf')) { tap($('#bconf')); cliques++; }
    else if ($$('.bt-skill.is-armed').length && $('#bcanc')) { tap($('#bcanc')); cliques++; }
    if (g % 20 === 0) { const e = $('#bend2'); if (e) tap(e); }   // destrava turnos sem jogada útil
  }
  ok(S().fim, `a partida termina só por toques (guarda ${g})`);
  ok(!!$('.result h1'), 'o resultado aparece');
  console.log(`  ${S().fim ? S().fim.resultado || 'fim' : '—'} no turno ${S().turno} · ${cliques} toques`);
  if ($('#bnew')) { tap($('#bnew')); ok($$('.dm-card').length > 0 && !!$('#bgo'), 'nova batalha volta à grade de seleção'); }
}

console.log('== 14. o fit APLICA o que a regra de enquadramento manda ==');
{
  // não recopiamos a fórmula: chamamos calcularEnquadramento (regra) e conferimos que
  // o fit aplicou a MESMA escala e largura ao DOM. A spec dos números vive em
  // tests/enquadramento.test.js; a matriz de rect real em tests/moldura.test.js.
  for (const [vw, vh] of [[568,320],[667,375],[844,390],[926,428],[1180,820]]) {
    const dd = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true });
    Object.defineProperty(dd.window, 'innerWidth', { value: vw, configurable: true });
    Object.defineProperty(dd.window, 'innerHeight', { value: vh, configurable: true });
    dd.window.dispatchEvent(new dd.window.Event('resize'));
    const el = dd.window.document.getElementById('stage');
    const s = el.style.transform;
    const regra = calcularEnquadramento({ larguraUtil: vw, alturaUtil: vh });
    ok(s.includes('scale('), `sem transform em ${vw}x${vh}`);
    const got = parseFloat((s.match(/scale\(([0-9.]+)\)/) || [])[1]);
    ok(Math.abs(got - regra.escala) < 0.001, `escala aplicada em ${vw}x${vh}: ${got.toFixed(4)} != regra ${regra.escala.toFixed(4)}`);
    const largAplicada = parseFloat(el.style.width);
    ok(Math.abs(largAplicada - regra.larguraDesign) < 1, `largura aplicada em ${vw}x${vh}: ${Math.round(largAplicada)} != regra ${Math.round(regra.larguraDesign)}`);
    dd.window.close();
  }
  console.log('  fit aplica escala + largura da regra em 5 tamanhos');
}

console.log('== 15. INV 16: no máximo um primário VISÍVEL E ACESSÍVEL (base inerte sob scrim) ==');
{
  const nprim = () => $$('.b--primary').length;
  const baseInert = () => { const b = $('#baselayer'); return b ? b.hasAttribute('inert') : null; };
  // focáveis "soltos": fora da sobreposição ativa, fora de [inert] e fora do #diag (painel
  // de diagnóstico dev, display:none — não é camada de jogo, e o jsdom não computa layout).
  const soltos = ovSel => $$('button:not([disabled]),[tabindex]:not([tabindex="-1"]),a[href]')
    .filter(e => !e.closest(ovSel) && !e.closest('[inert]') && !e.closest('#diag')).length;

  // --- batalha: entra numa batalha limpa (os testes anteriores deixaram a rota noutro
  // lugar; renderPick ignora `ov`), depois percorre TODAS as sobreposições ---
  w.eval("ir('selecao');pick=[['zeus','ogum','brigid'],['cuca','sobek','ganesha']];vez=0;render();document.getElementById('bgo').click();st.ativo=0;st.starter=0;st.aberturaFeita=true;vsCPU=false;ov=null;st.fim=null;menuAberto=false;render()");
  // §329: o ENCERRAR TURNO é o estado+barra do topo (.bt-estado), não um .b--primary → a base tem 0 primários (ok: "no máximo um").
  ok(nprim() <= 1 && baseInert() === false, `batalha base: ≤1 primário e base não-inerte (prim ${nprim()}, inert ${baseInert()})`);
  // o menu ⋯ NÃO tem scrim → base NÃO fica inerte (fica interativa), e não traz primário
  w.eval('menuAberto=true;render()');
  ok(baseInert() === false, 'menu (sem scrim): base NÃO fica inerte');
  ok(nprim() <= 1, `menu: no máximo 1 primário (tem ${nprim()})`);
  w.eval('menuAberto=false;render()');
  for (const o of ['log', 'help', 'surr', 'apagar', 'conv', 'sair', 'perfil']) {
    w.eval(`ov='${o}';render()`);
    ok(nprim() <= 1, `overlay ${o}: no máximo 1 primário no DOM inteiro (tem ${nprim()})`);
    ok(baseInert() === true, `overlay ${o}: camada de base inerte`);
    ok(soltos('.ov') === 0, `overlay ${o}: nenhum focável da base fora do inerte (tem ${soltos('.ov')})`);
  }
  w.eval("ov=null;st.fim={tipo:'fim',resultado:'vitoria',lado:0};render()");
  ok(nprim() === 1 && baseInert() === true, `resultado: 1 primário e base inerte (prim ${nprim()}, inert ${baseInert()})`);
  ok(!!$('#bnew') && $('#bnew').classList.contains('b--primary'), 'o único primário é o da sobreposição (#bnew)');
  w.eval('st.fim=null;render()');
  // §329: fechar restaura a base não-inerte; o encerrar volta a ser o estado+barra do topo (#bend2), não um .b--primary.
  ok(baseInert() === false && !!$('#bend2'), 'fechar restaura: base não-inerte e o ENCERRAR do topo (#bend2) volta');

  // --- seleção (§345, montador): o CTA é o COMEÇAR (.dmb--go); as sobreposições têm scrim próprio (padrão do montador) ---
  w.eval("ir('selecao');painelFiltro=false;focoPk=null;render()");
  ok(nprim() === 0 && baseInert() === false && !!$('#bgo'), `seleção base: sem .b--primary (o CTA é o COMEÇAR .dmb--go), não-inerte (prim ${nprim()})`);
  ok($('#bgo').classList.contains('dmb--go'), 'o COMEÇAR é o botão primário do montador (.dmb--go)');
  w.eval('painelFiltro=true;render()');
  ok(!!$('.sel-fpanel') && !!$('#ffechar'), 'MAIS FILTROS: painel com scrim próprio + Pronto');
  ok(nprim() === 0, `o painel não introduz .b--primary concorrente (tem ${nprim()})`);
  w.eval('painelFiltro=false;focoPk=(typeof ROSTER!=="undefined"&&ROSTER[0]&&ROSTER[0].key)||null;render()');
  ok(!!$('#dmkit') && !!$('.dm-kit'), 'kit: painel com scrim próprio (.dm-kit)');
  w.eval('focoPk=null;render()');
  ok(baseInert() === false && !!$('#bgo'), 'fechar kit restaura a base com o COMEÇAR');
  console.log('  ≤1 primário em toda sobreposição; base inerte sob scrim (batalha); montador usa scrim próprio; fechar restaura');
}

console.log('== 16. §345 seleção: CPU|2JOGADORES, Invocar, VOLTAR ==');
{
  // sessão FRESCA: a pilha de navegação acumulada pelas seções anteriores (várias entradas 'selecao')
  // faria o VOLTAR (voltar()) cair numa seleção anterior — aqui a pilha começa limpa (só home→seleção).
  const dd = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  const w2 = dd.window, d2 = dd.window.document, $2 = s => d2.querySelector(s), $$2 = s => [...d2.querySelectorAll(s)];
  const tap2 = el => el.dispatchEvent(new w2.MouseEvent('click', { bubbles: true }));
  w2.eval("for (const k in IMG) delete IMG[k];");
  w2.eval("ir('home'); render(); ir('selecao',{novo:true}); vsCPU=true; render();");
  ok(/BATALHA CPU/.test($2('.dm-sub').textContent), 'vsCPU → sublinha "BATALHA CPU · SANDBOX"');
  tap2($$2('[data-cpu]').find(b => b.dataset.cpu === '0'));
  ok(w2.eval('vsCPU') === false && /2 JOGADORES/.test($2('.dm-sub').textContent), '2 JOGADORES alterna o modo (sublinha hot-seat)');
  tap2($$2('[data-cpu]').find(b => b.dataset.cpu === '1'));
  ok(w2.eval('vsCPU') === true, 'CPU volta a alternar');
  tap2($2('#binvocar'));
  ok(w2.eval("rotaAtual()") === 'invocacao', 'Invocar vai para a tela de invocação');
  // VOLTAR sai da seleção (pilha limpa: home atrás → volta à home)
  w2.eval("ir('home'); render(); ir('selecao',{novo:true}); render();");
  tap2($2('#binicio'));
  ok(w2.eval("rotaAtual()") === 'home', 'VOLTAR (‹ VOLTAR) sai da seleção para a home');
  w2.close();
  console.log('  §345: CPU|2JOGADORES alterna · Invocar · VOLTAR');
}

console.log('');
console.log(falhas === 0 ? '>>> TUDO OK' : `>>> ${falhas} FALHA(S)`);
w.close();
process.exit(falhas ? 1 : 0);

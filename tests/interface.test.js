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
const S = () => w.eval('st');
const encher = () => { const l = S().lados[S().ativo]; w.eval('ELEMS').forEach(e => l.orbs[e] = 6); w.eval('render()'); };
w.eval('vsCPU=false');   // a suíte dirige os dois lados por toque; testa hot-seat (a IA tem suíte própria)

console.log('== 0. arte dos 100 deuses ==');
{
  ok(w.eval('ROSTER.length') === 100, 'o roster da tela deveria ter os 100 deuses');
  ok(w.eval('Object.keys(IMG).length') === 100, 'deveria haver arte para os 100');
  ok(w.eval('ROSTER.every(e=>!!IMG[e.key])'), 'todo deus do roster deveria ter imagem');
  ok(w.eval('Object.values(IMG).every(v=>v.startsWith("data:image/webp;base64,"))'), 'as imagens deveriam estar embutidas');
  ok($$('.pk .slot img').length === $$('.pk').length && $$('.pk').length > 0,
    'todo ladrilho da grade deveria mostrar a arte');
  console.log(`  100 imagens embutidas \u00b7 ${$$('.pk .slot img').length}/${$$('.pk').length} ladrilhos com arte`);
  // a partir daqui as imagens saem: no jsdom, redesenhar 300 KB de base64 a cada
  // render torna a suíte impraticável. A lógica testada é a mesma.
  w.eval('for (const k in IMG) delete IMG[k];');
  w.eval('render()');
}

console.log('== 1. seleção: grade de coleção ==');
{
  const total = w.eval('ROSTER.length');
  ok(total === 100, `o roster da tela deveria ter os 100 deuses, tem ${total}`);
  ok(/liberados/i.test($('#bfiltro').textContent), 'deveria abrir filtrado nos liberados');
  ok(!$('#fpanel'), 'o painel de filtro deveria começar fechado');
  ok($$('.pk').length === 9, `filtrado nos liberados deveria mostrar 9, mostra ${$$('.pk').length}`);
  ok($$('.pk.livre').length === 9, 'os 9 deveriam estar em cor');

  // TODOS: 30 por página, 4 páginas — agora via painel
  tap($('#bfiltro'));
  ok(!!$('#fpanel'), 'FILTRO deveria abrir o painel');
  ok($$('.fgrp__l').length === 5, `5 eixos de filtro, há ${$$('.fgrp__l').length}`);
  ok($$('.chip2').length === 3 + 10 + 6 + 5 + 3, `27 opções, há ${$$('.chip2').length}`);
  ok(/9 de 100/.test($('.fbox__n').textContent), 'painel deveria mostrar quantos resultam');
  tap($$('[data-fe]')[1]);
  ok(/100 de 100/.test($('.fbox__n').textContent), 'ao escolher Todos deveria contar 100');
  tap($('#ffechar'));
  ok(!$('#fpanel'), 'PRONTO deveria fechar o painel');
  ok(/todos/i.test($('#bfiltro').textContent), 'o botão deveria refletir o estado escolhido');
  ok($$('.pk').length === 30, `30 por página, há ${$$('.pk').length}`);
  ok(/PÁG 1\/4/.test($('.fpage').textContent), `4 páginas para 100, diz "${$('.fpage').textContent}"`);
  ok($$('.pk.trancado').length > 0, 'deveria haver bloqueados na visão TODOS');
  ok($('#bprev').disabled, 'seta anterior desabilitada na página 1');
  tap($('#bnext')); tap($('#bnext')); tap($('#bnext'));
  ok(/PÁG 4\/4/.test($('.fpage').textContent), 'deveria chegar à página 4');
  ok($$('.pk').length === 10, `última página com 10, há ${$$('.pk').length}`);
  ok($('#bnext').disabled, 'seta seguinte desabilitada na última');
  while (!$('#bprev').disabled) tap($('#bprev'));

  const cs = w.getComputedStyle($('.pk.trancado .pk__p'));
  ok(/grayscale/.test(cs.filter), 'bloqueado deveria estar dessaturado');
  ok(parseFloat(cs.opacity) >= 0.4, `bloqueado deve continuar visível (opacidade ${cs.opacity})`);
  ok(!!$('.pk.trancado .pk__n').textContent.trim(), 'o nome do bloqueado deveria aparecer');
  ok(!!$('.pk.trancado .pk__lock'), 'deveria haver marca de cadeado');

  // 1 TOQUE em QUALQUER deus (inclusive bloqueado) abre o painel do kit — não adiciona
  const lk = $('.pk.trancado').dataset.k;
  w.eval(`previewPk("${lk}");renderPick()`);
  ok(!!$('#kpanel'), 'tocar num deus deveria abrir o painel do kit');
  ok($$('#kpanel .krow').length >= 4, 'o painel deveria listar Básico/Habilidade/Milagre/Passiva');
  ok(/BLOQUEADO/.test($('.finfo').textContent), 'deveria explicar que está bloqueado');
  ok(/Rito|Provação|Ordália/.test($('.finfo').textContent), 'deveria citar a Provação/Ordália');
  ok(/dificuldade \d/.test($('.finfo').textContent), 'deveria dizer a dificuldade');
  ok(/Bloqueado/.test($('#kpanel').textContent), 'o kit é leitura pública mesmo bloqueado');
  ok(w.eval('pick[0]').length === 0, 'abrir o kit de um bloqueado não adiciona');
  tap($('#kitclose')); ok(!$('#kpanel'), 'Fechar deveria fechar o painel');

  // volta ao filtro de liberados para montar time
  tap($('#bfiltro')); tap($$('[data-fe]')[0]); tap($('#ffechar'));
  ok(/liberados/i.test($('#bfiltro').textContent), 'deveria voltar ao estado Liberados');
  ok($('#bgo').disabled, 'começar travado sem 3+3');
  const keys9 = $$('.pk.livre').map(b => b.dataset.k);
  ok(keys9.length === 9, `deveria haver 9 liberados, há ${keys9.length}`);
  const limpaTap = () => w.eval('if(_tapT){clearTimeout(_tapT);}_tapT=null;_tapK=null;');
  const dtapK = k => { limpaTap(); const b = $(`.pk[data-k="${k}"]`); tap(b); tap(b); };   // 2 toques = commit

  // 1 toque só NÃO adiciona (é leitura); 2 toques adicionam
  limpaTap(); tap($(`.pk[data-k="${keys9[0]}"]`));
  ok(w.eval('pick[0]').length === 0, 'um toque só não adiciona (abre o kit)');
  dtapK(keys9[0]); dtapK(keys9[1]); dtapK(keys9[2]);
  ok(w.eval('pick[0]').length === 3, `J1 deveria ter 3 por duplo-toque (tem ${w.eval('pick[0]').length})`);
  ok(w.eval('vez') === 1, 'a vez deveria passar ao J2 automaticamente');
  ok($$('.pk.on .pk__mark').length === 3, 'os escolhidos deveriam ter marcador do jogador');

  // duplo-toque num deus JÁ no time o remove
  dtapK(keys9[0]);
  ok(w.eval('pick[0]').length === 2, `duplo-toque num escolhido deveria remover (tem ${w.eval('pick[0]').length})`);

  // o botão Adicionar do painel também comita (caminho explícito/acessível)
  w.eval(`previewPk("${keys9[0]}");renderPick()`);
  tap($('#kitadd'));
  ok(w.eval(`pick.flat().includes("${keys9[0]}")`), 'o botão Adicionar do painel deveria recolocar o deus');
  ok(!$('#kpanel'), 'adicionar pelo painel fecha o painel');
  limpaTap();

  // critérios combináveis: OU dentro do eixo, E entre eixos
  tap($('#bfiltro'));
  tap($$('[data-fe]')[1]);                      // estado: Todos
  const chip = (c, i) => $$('[data-fs]').find(b => b.dataset.fs === c + '|' + i);
  tap(chip('faccoes', 'Japonesa'));
  ok(/14 de 100/.test($('.fbox__n').textContent), `Japonesa tem 14, painel diz "${$('.fbox__n').textContent}"`);
  tap(chip('faccoes', 'Maia'));
  ok(/18 de 100/.test($('.fbox__n').textContent), 'dois panteões deveriam SOMAR (OU dentro do eixo)');
  tap(chip('faccoes', 'Maia'));
  tap(chip('elems', 'Umbra'));
  ok(/4 de 100/.test($('.fbox__n').textContent), 'eixos diferentes deveriam INTERSECTAR (E entre eixos)');
  tap(chip('funcoes', 'Controlador'));
  ok(/2 de 100/.test($('.fbox__n').textContent), 'três eixos combinados deveriam reduzir a 2');
  tap($('#ffechar'));
  ok($$('.pk').length === 2, 'a grade deveria refletir o filtro combinado');
  const sobrou = $$('.pk .pk__n').map(e => e.textContent.trim()).sort();
  ok(sobrou.join(',') === 'Izanami,Tsukuyomi', `esperado Izanami/Tsukuyomi, veio ${sobrou}`);
  ok(/3/.test($('.fbtn__badge').textContent), 'o botão deveria mostrar quantos critérios extras estão ativos');

  // combinação sem resultado avisa em vez de mostrar grade vazia
  tap($('#bfiltro'));
  tap(chip('faccoes', 'Japonesa')); tap(chip('elems', 'Umbra')); tap(chip('funcoes', 'Controlador'));
  tap(chip('faccoes', 'Celta')); tap(chip('elems', 'Chama')); tap(chip('funcoes', 'Guardião'));
  ok(/0 de 100/.test($('.fbox__n').textContent), 'combinação impossível deveria contar 0');
  tap($('#ffechar'));
  ok(/Nenhum deus atende/.test($('.grid').textContent), 'grade vazia deveria explicar');

  // LIMPAR volta ao padrão
  tap($('#bfiltro')); tap($('#flimpar'));
  ok(/9 de 100/.test($('.fbox__n').textContent), 'LIMPAR deveria voltar a Liberados sem critérios');
  tap($('#ffechar'));
  ok(!$('.fbtn__badge'), 'sem critérios extras não deveria haver contador no botão');

  tap($('#bteste'));
  // TESTE libera todos os kits prontos; a 1ª página mostra até POR_PAG (paginação — a lista cresce p/ 100).
  const prontos = w.eval('Object.keys(GODS).length'), porPag = w.eval('POR_PAG');
  ok($$('.pk').length === Math.min(prontos, porPag),
    `1ª página deveria mostrar min(${prontos} prontos, ${porPag}/pág), mostrou ${$$('.pk').length}`);
  tap($('#brand'));
  ok(!$('#bgo').disabled, 'sorteio deveria liberar COMEÇAR');
  console.log(`  100 no roster \u00b7 30/página em 4 páginas \u00b7 9 em cor \u00b7 arte em todos \u00b7 filtro por facção`);

  // times FIXOS para os testes seguintes: sorteio deixava as asserções instáveis
  // (um time podia cair sem habilidade de dano com alvo inimigo, ou repetir elemento)
  w.eval("pick=[['zeus','ogum','brigid'],['cuca','sobek','ganesha']]; vez=0;");
  w.eval('render()');
  ok(!$('#bgo').disabled, 'times fixos deveriam liberar COMEÇAR');
}
tap($('#bgo'));
// o cliente sorteia quem abre; nos testes fixamos o lado 0 para asserções determinísticas
w.eval('st.ativo=0;st.starter=0;st.aberturaFeita=true;render()');

console.log('== 2. estrutura da tela de batalha (design base) ==');
const req = ['.stage__bg','.stage__scrim','.topbar','.timer','.timer__fill','.timer__label',
  '.energy','.team--ally','.team--enemy','.footer','.detail','.detail__icon',
  '.detail__name','.detail__text','.detail__classes','.detail__head','.detail__cd',
  '.endturn','.endturn__l1','.endturn__hint'];
req.forEach(s => ok(!!$(s), `falta ${s}`));
ok($$('.team--ally .unit').length === 3, `3 unidades aliadas, há ${$$('.team--ally .unit').length}`);
ok($$('.team--enemy .unit--enemy').length === 3, `3 unidades inimigas, há ${$$('.team--enemy .unit--enemy').length}`);
ok($$('.team--ally .skills .skill').length === 12, `3\u00d74 = 12 slots aliados, há ${$$('.team--ally .skills .skill').length}`);
ok($$('.skill').length === 12, `agora só o time aliado tem ladrilhos, há ${$$('.skill').length}`);
ok(!$('.skills--foe') && !$('.foecd'), 'a exibição permanente das habilidades inimigas deveria ter saído');
ok($$('.team--enemy .foetab').length === 3, '1 alça por unidade inimiga');
ok($$('.foepanel').length === 0, 'as abas devem começar TODAS FECHADAS');
ok($$('.team--enemy [data-sk]').length === 0, 'nada do lado inimigo pode ser armável');
ok($$('.team--enemy .effects').length === 3, 'efeitos do inimigo ficam no retrato dele');
ok($$('.team--enemy .portrait .effects').length === 3, 'a faixa de efeitos deve estar DENTRO do retrato inimigo');
ok($$('.energy__pill').length >= 1 && $$('.energy__pill').length <= 6,
  `energia deveria mostrar só os tipos relevantes (1 a 6), há ${$$('.energy__pill').length}`);
ok($$('.portrait .portrait__x').length === 6, 'todo retrato precisa do X de derrota');
console.log(`  topo + 2 times + rodapé, ${$$('.skill').length} ladrilhos + ${$$('.foetab').length} alças, ${$$('.energy__pill').length} pílulas`);

console.log('== 3. encaixes de arte com chave ==');
const slots = $$('.slot[data-slot]').map(e => e.dataset.slot);
const temGod = slots.filter(s => s.startsWith('god-')).length;
const temSkill = slots.filter(s => s.startsWith('skill-')).length;
ok(temGod >= 6, `deveria haver chave god- para os 6 retratos, há ${temGod}`);
ok(temSkill >= 12, `deveria haver chave skill- nos 12 slots, há ${temSkill}`);
ok(slots.includes('player-1-avatar') && slots.includes('player-2-avatar'), 'faltam avatares dos jogadores');
console.log(`  ${slots.length} encaixes: ${temGod} retratos, ${temSkill} habilidades, avatares, detalhe`);

console.log('== 4. tocar habilidade → detalhe + arma + alvos ==');
encher();
// procura uma habilidade COM custo que peça alvo inimigo
let bas = null;
for (const b of $$('.team--ally .skill[data-sk]').filter(x => !x.disabled && x.querySelector('.skill__cost i'))) {
  const key = b.dataset.sk;
  tap(b);
  if ($$('.team--enemy .portrait.is-target').length > 0) { bas = $$('.skill').find(x => x.dataset.sk === key); break; }
  tap($$('.skill').find(x => x.dataset.sk === key));   // cancela e tenta a próxima
}
ok(!!bas, 'deveria haver uma habilidade com custo que peça alvo');
ok($$('.skill.is-armed').length === 1, 'habilidade deveria ficar armada');
ok(!!$('.detail__name').textContent.trim(), 'detalhe deveria mostrar o nome');
ok($('.detail__text').textContent.length > 10, 'detalhe deveria mostrar a descrição');
ok(!!$('.cost'), 'detalhe deveria mostrar as pílulas de custo');
ok($$('.detail__cd').some(e => /RECARGA/.test(e.textContent)), 'detalhe deveria mostrar recarga');
ok(!$('.detail .cost__none'), 'habilidade com custo não deveria dizer SEM CUSTO');
ok($$('.team--enemy .portrait.is-target').length > 0, 'inimigos deveriam pulsar como alvo');
ok(!!$('.b--wait'), 'deveria haver o aviso de escolher alvo no painel');
ok(/toque|alvo/i.test($('.b--wait').textContent), `aviso inesperado: "${$('.b--wait').textContent}"`);
ok($('.b--wait').disabled, 'o aviso não deve ser clicável');
ok(!$('#bconf'), 'CONFIRMAR não deve aparecer quando a habilidade precisa de alvo');
console.log(`  "${$('.detail__name').textContent}" \u00b7 ${$$('.portrait.is-target').length} alvos`);

console.log('== 4b. aba do inimigo: abre, consulta, fecha ==');
{
  const hpTodos = () => w.eval('st').lados.flatMap(l=>l.units).map(u=>u.hp).join(',');
  const antes = hpTodos();
  const abas = $$('.foetab');

  tap(abas[1]);                                   // abre a 2ª unidade
  ok($$('.foepanel').length === 1, `deveria abrir exatamente 1 painel, abriu ${$$('.foepanel').length}`);
  ok($$('.foepanel .foesk').length === 4, '4 habilidades no painel');
  ok($$('.foetab.open').length === 1, 'só a alça tocada fica marcada como aberta');
  ok($$('.foesk--uni').length === 1, 'a Defesa deveria estar tracejada no painel');

  tap($$('.foetab')[2]);                          // abre outra: a anterior fecha
  ok($$('.foepanel').length === 1, 'só uma aba por vez');

  const alvoPainel = $('.foesk');
  tap(alvoPainel);
  ok($$('.skill.is-armed').length === 0, 'consultar não pode armar nada');
  ok(hpTodos() === antes, 'consultar não pode alterar o estado');
  ok(/CONSULTA/.test($('.detail__classes').textContent), 'detalhe deveria marcar como consulta');
  ok($$('.detail__cd').some(e=>/PRONTA/.test(e.textContent)), 'detalhe deveria dizer a recarga');
  console.log(`  "${$('.detail__name').textContent}" \u2014 ${$('.detail__cd').textContent}`);

  tap($$('.foetab')[2]);
  ok($$('.foepanel').length === 0, 'tocar a alça de novo deveria fechar');

  // ponto verde quando a Defesa do inimigo está em recarga
  const st2 = w.eval('st');
  st2.lados[1 - st2.ativo].units[0].cd.defesa = 3;
  w.eval('render()');
  ok($$('.foetab__dot').length === 1, 'a alça deveria avisar que a Defesa dele está em recarga');
  st2.lados[1 - st2.ativo].units[0].cd.defesa = 0; w.eval('render()');
  ok($$('.foetab__dot').length === 0, 'sem recarga, sem aviso');

  // fecha ao virar o turno
  tap($$('.foetab')[0]);
  ok($$('.foepanel').length === 1, 'reabre para testar o fechamento automático');
  tap($('#bend'));
  ok($$('.foepanel').length === 0, 'a aba deveria fechar ao virar o turno');
  console.log('  abre 1 por vez \u00b7 fecha no toque \u00b7 fecha no fim do turno \u00b7 aviso de Defesa');
}

console.log('== 4c. hierarquia visual e legibilidade ==');
{
  const nomes = $$('.team--ally .skill .skill__mono').map(e => e.textContent.trim());
  ok(nomes.length === 12, `12 ladrilhos deveriam ter monograma, há ${nomes.length}`);
  ok(nomes.every(n => n.length <= 3 && n.length >= 2), 'monograma deveria ter 2 ou 3 letras');
  const porUnidade = [0,1,2].map(i => nomes.slice(i*4,i*4+4));
  porUnidade.forEach((g,i) => ok(new Set(g).size === 4,
    `as 4 habilidades da unidade ${i+1} deveriam ter monogramas distintos: ${g.join('/')}`));
  ok(!$('.skill__name'), 'a parede de texto no ladrilho deveria ter saído');
  ok(!$('.skill__tag'), 'o rótulo redundante de slot deveria ter saído');
  const pW = parseFloat(w.getComputedStyle($('.foetab')).width);
  const sW = parseFloat(w.getComputedStyle($('.team--ally .skill')).width);
  ok(pW <= sW / 4, `alça inimiga (${pW}px) deveria ser bem menor que o ladrilho aliado (${sW}px)`);
  const contFoe = w.getComputedStyle($('.team--ally .skills'));
  ok(contFoe.borderTopWidth === '0px' || contFoe.borderTopWidth === '' || contFoe.borderTopStyle === 'none' || contFoe.borderTopStyle === '',
    'o contêiner de habilidades não deveria ter borda (aninhamento de bordas)');
  console.log(`  monogramas ${nomes.slice(0,4).join('/')} \u00b7 alça inimiga ${pW}px vs ladrilho ${sW}px \u00b7 contêiner sem borda`);
}

console.log('== 4b2. habilidade em formato redondo ==');
{
  const cs = s => w.getComputedStyle($(s));
  // o alvo de toque continua quadrado: o dedo não perde os 21% do círculo
  ok(parseFloat(cs('.skill').width) >= 74, `botão deveria ter 74px+ de lado, tem ${cs('.skill').width}`);
  ok(cs('.skill').borderWidth === '0px', 'a borda saiu do botão e foi para o disco');
  // o disco é o que fica redondo
  ok(cs('.skill__disc').borderRadius === '50%', 'o disco deveria ser um círculo');
  ok(cs('.skill__cd').borderRadius === '50%', 'a máscara de recarga deveria acompanhar o círculo');
  ok(cs('.skill__lock').borderRadius === '50%', 'a máscara de trava também');
  ok($$('.skill .slot--round').length === $$('.skill').length,
    'todo encaixe de habilidade deveria enquadrar a arte no centro (formato redondo)');

  // anel = elemento; espessura = tier
  const um = $$('.team--ally .unit')[0].querySelectorAll('.skill');
  const larg = [...um].map(b => w.getComputedStyle(b.querySelector('.skill__disc')).borderWidth);
  ok(larg[0] === '1px' && larg[1] === '2px' && larg[2] === '2px',
    `espessura deveria crescer do Básico para Milagre: ${larg}`);
  ok(w.getComputedStyle(um[3].querySelector('.skill__disc')).borderStyle === 'dashed',
    'a Defesa deveria manter o anel tracejado');
  ok([...um].every(b => /border-color/.test(b.querySelector('.skill__disc').getAttribute('style'))),
    'o anel deveria receber a cor do elemento');
  ok(!$('.skill__el'), 'a barra reta do elemento na base deveria ter saído (não cabe num círculo)');

  // custo virou selo pendurado na base, fora do canto que o círculo não tem
  const sc = cs('.skill__cost');
  ok(sc.position === 'absolute' && parseFloat(sc.bottom) <= 0, 'o selo de custo deveria pender da base');
  ok(w.getComputedStyle($('.skill__cost i')).borderRadius === '50%', 'as pílulas deveriam ser redondas também');
  const semCusto = $$('.team--ally .skill').filter(b => !b.querySelector('.skill__cost i'));
  ok(semCusto.length === 0 || semCusto.every(b => b.querySelector('.skill__cost.gratis')),
    'habilidade sem custo deveria exibir o selo GRÁTIS');

  console.log(`  toque ${cs('.skill').width} quadrado \u00b7 disco 50% \u00b7 anel ${larg.join('/')} por tier \u00b7 selo de custo na base`);
}

console.log('== 4c2. contagem de objetos e ruído ==');
{
  const objetos = $$('.skill, .portrait, .hp, .effect, .energy__pill, .btn, .endturn, .dbtn, .topx button, .foetab').length;
  ok(!$('.skill__el'), 'sem barra de elemento: o anel do disco faz esse papel');
  ok(objetos < 55, `objetos visuais deveriam ficar abaixo de 55, há ${objetos}`);
  const areaAliada = $$('.team--ally .skill').reduce((s,e)=>{const c=w.getComputedStyle(e);
    return s + parseFloat(c.width)*parseFloat(c.height);},0);
  const areaInimiga = $$('.foetab').reduce((s,e)=>{const c=w.getComputedStyle(e);
    return s + parseFloat(c.width)*(parseFloat(c.height)||40);},0);
  ok(areaInimiga < areaAliada * 0.06,
    `em repouso, o lado inimigo deveria ocupar <6% da área aliada (é ${Math.round(areaInimiga/areaAliada*100)}%)`);
  const pills = $$('.energy__pill').length;
  ok(pills <= 6, `energia deveria mostrar só o que importa, há ${pills} pílulas`);
  ok(!/\u03a3/.test($('.energy').textContent), 'o total \u03a3 era redundante e deveria ter saído');
  ok(!$('.player__rank'), 'a linha "3 de pé \u00b7 N energia" duplicava o que a tela já mostra');
  ok(!/\/100/.test($('.hp__label').textContent), 'o "/100" era redundante — todos têm 100 de máximo');
  ok($$('.team--ally .effects').length === 3, 'efeitos deveriam viver dentro do retrato, 1 faixa por unidade');
  ok($$('.team--ally .portrait .effects').length === 3, 'a faixa de efeitos deveria estar DENTRO do retrato');
  console.log(`  ${objetos} objetos em repouso \u00b7 ${pills} pílulas \u00b7 lado inimigo = ${Math.round(areaInimiga/areaAliada*100)}% da área aliada`);
}

console.log('== 4d. pílula vermelha marca a energia que falta ==');
{
  const l0 = S().lados[S().ativo];
  w.eval('ELEMS').forEach(e => l0.orbs[e] = 0); w.eval('render()');
  const faltando = $$('.team--ally .skill__cost i.miss').length;
  ok(faltando > 0, 'sem energia, as pílulas de custo deveriam ficar marcadas em falta');
  const off = $$('.team--ally .skill.is-off').length;
  ok(off > 0, 'habilidades impagáveis deveriam estar em estado is-off');
  console.log(`  ${faltando} pílulas em falta \u00b7 ${off} habilidades apagadas`);
  encher();
}

console.log('== 5. energia a gastar acende no topo ==');
encher();
let armavel = null;
for (const b of $$('.team--ally .skill[data-sk]').filter(x => !x.disabled && x.querySelector('.skill__cost i'))) {
  const key = b.dataset.sk;
  tap(b);
  if ($$('.team--enemy .portrait.is-target').length > 0) { armavel = key; break; }
  tap($$('.skill').find(x => x.dataset.sk === key));
}
ok(!!armavel, 'deveria haver habilidade com custo que peça alvo inimigo');
ok($$('.energy__pill.spend').length > 0, 'pílulas de energia a gastar deveriam destacar');
console.log(`  ${$$('.energy__pill.spend').length} tipo(s) destacado(s)`);

console.log('== 6. tocar no alvo resolve ==');
const foto = () => S().lados[1 - S().ativo].units
  .map(u => u.hp + ':' + u.efeitos.length + ':' + u.dots.length).join(',');
const antes = foto();
const nlog = S().log.length;
tap($('.team--enemy .portrait.is-target'));
ok($$('.skill.is-armed').length === 0, 'deveria desarmar');
ok(S().log.length > nlog, 'a ação deveria gerar registro');
ok(foto() !== antes, 'a ação deveria alterar o estado do inimigo (vida ou efeito)');
console.log(`  ${w.eval('narrar(st.log[st.log.length-1])')}`);

console.log('== 7. ação sem alvo exige o botão CONFIRMAR ==');
encher();
const def = $$('.team--ally .skill[data-sk]').find(b => !b.disabled && b.dataset.sk.endsWith('|defesa'));
ok(!!def, 'Defesa deveria estar disponível');
const hpA = S().lados[S().ativo].units.map(u => u.hp).join(',');
tap(def);
ok(!!$('#bconf'), 'CONFIRMAR deveria aparecer no painel de detalhe');
ok(!!$('#bcanc'), 'CANCELAR deveria aparecer no painel de detalhe');
ok(!/CONFIRMAR/.test($('.endturn').textContent), 'ENCERRAR TURNO não deve mudar de função');
tap($('#bcanc'));
ok($$('.skill.is-armed').length === 0, 'cancelar deveria desarmar');
ok(S().lados[S().ativo].units.map(u => u.hp).join(',') === hpA, 'cancelar não altera estado');
tap(def); tap($('#bconf'));
ok($$('.skill.is-armed').length === 0, 'confirmar deveria resolver');
console.log('  armar \u2192 confirmar/cancelar; nada resolve por acidente');

console.log('== 8. recarga sobre o ícone ==');
{
  const u = S().lados[S().ativo].units[0]; u.cd.milagre = 3; w.eval('render()');
  const cds = $$('.team--ally .skill.is-cooldown');
  ok(cds.length > 0, 'deveria haver slot em recarga');
  ok(cds.some(c => c.querySelector('.skill__cd').textContent.trim() === '3'), 'número 3 deveria aparecer');
  console.log(`  ${cds.length} em recarga com número visível`);
}

console.log('== 9. passiva e efeitos são tocáveis ==');
tap($('.portrait__pas'));
ok($$('.detail__cd').some(e => /PASSIVA|INERTE/.test(e.textContent)), 'detalhe deveria identificar a passiva');
console.log(`  passiva: "${$('.detail__name').textContent}"`);
{
  const u = S().lados[S().ativo].units[0];
  u.efeitos.push({ type: 'dmgUp', v: 8, dur: 2 });
  u.dots.push({ nome: 'queimadura', v: 5, dur: 2 });   // DoT é CHAVE; a UI resolve p/ "Queimadura"
  w.eval('render()');
  ok($$('.effect').length >= 2, 'ícones de efeito deveriam aparecer');
  tap($('[data-ef]'));
  ok($$('.detail__cd').some(e => /TURNO|PERMANENTE/.test(e.textContent)), 'detalhe do efeito deveria mostrar duração');
  tap($('[data-dot]'));
  ok(/QUEIMADURA/.test($('.detail__name').textContent), 'detalhe do dano contínuo');
  console.log(`  ${$$('.effect').length} ícones, todos abrem explicação`);
}

console.log('== 10. retrato abre a ficha da unidade ==');
tap($$('.team--ally .portrait')[1]);
ok($('.detail__name').textContent.length > 1, 'ficha deveria abrir no painel');
ok($$('.detail__cd').some(e => /\d+\/120/.test(e.textContent)), 'ficha deveria mostrar vida');
console.log(`  ficha: "${$('.detail__name').textContent}" \u2014 ${$('.detail__cd').textContent}`);

console.log('== 11. troca de energia em popup ==');
{
  const l = S().lados[S().ativo];
  w.eval('ELEMS').forEach(e => l.orbs[e] = 0);
  l.orbs[l.units[0].elem] = 6; l.converteu = false; w.eval('render()');
  const t1 = w.eval('totalOrbs(st.lados[st.ativo])');

  ok(!!$('#btrocar') && !$('#btrocar').disabled, 'deveria haver um botão Trocar habilitado');
  tap($('#btrocar'));
  ok(!!$('#ovconv'), 'deveria abrir o popup de troca');
  ok($$('.copt').length === 6, `deveria listar os 6 elementos, listou ${$$('.copt').length}`);
  const alcancaveis = w.eval(
    'new Set(st.lados[st.ativo].units.filter(u=>u.vivo).map(u=>u.elem).concat(' +
    'ELEMS.filter(e=>st.lados[st.ativo].orbs[e]>0))).size');
  ok($$('.copt:not([disabled])').length === alcancaveis,
    `deveriam estar ativos os ${alcancaveis} elementos alcançáveis, estão ${$$('.copt:not([disabled])').length}`);
  ok(alcancaveis >= 1 && alcancaveis <= 6, 'um time alcança de 1 a 6 elementos');
  ok($('#ctok').disabled, 'confirmar deveria estar travado antes de escolher o destino');
  ok(w.eval('totalOrbs(st.lados[st.ativo])') === t1, 'abrir o popup não deveria gastar nada');

  // escolher o destino mostra a troca
  const alvo = $$('.copt').find(b => !b.disabled && !b.classList.contains('on'));
  tap(alvo);
  ok($$('.copt.on').length === 1, 'exatamente um destino selecionado');
  ok(!!$('.ctrade'), 'deveria mostrar o resumo da troca');
  ok(/gasta 3/.test($('.ctrade').textContent), 'resumo deveria dizer quanto sai');
  ok($$('.ctrade__p').length === 4, `3 que saem + 1 que entra = 4 pastilhas, há ${$$('.ctrade__p').length}`);
  ok(!$('#ctok').disabled, 'confirmar deveria liberar');

  // cancelar não gasta
  tap($('#ctcanc'));
  ok(!$('#ovconv'), 'cancelar deveria fechar');
  ok(w.eval('totalOrbs(st.lados[st.ativo])') === t1, 'cancelar não deveria gastar nada');

  // confirmar paga exatamente 3 e devolve 1
  tap($('#btrocar'));
  tap($$('.copt').find(b => !b.disabled));
  tap($('#ctok'));
  const t2 = w.eval('totalOrbs(st.lados[st.ativo])');
  ok(!$('#ovconv'), 'confirmar deveria fechar o popup');
  ok(t2 === t1 - 2, `${w.eval('CONV_CUSTO')}\u21921 deveria reduzir 2 no total (${t1}\u2192${t2})`);
  w.eval('ELEMS').forEach(e => ok(S().lados[S().ativo].orbs[e] >= 0, 'orbe negativo'));
  ok($('#btrocar').disabled, 'segunda troca no mesmo turno deveria estar bloqueada');

  // o cronômetro NÃO pausa com o popup aberto
  l.converteu = false; w.eval('relogio=40'); w.eval('render()');
  tap($('#btrocar'));
  ok(!!$('#ovconv'), 'popup aberto');
  ok(!/st\.fim\|\|ov/.test(w.eval('String(iniciarRelogio)')),
    'a guarda do cronômetro não deveria mais pausar por sobreposição');
  tap($('#ctcanc'));
  console.log(`  popup: 6 opções, ${alcancaveis} alcançáveis \u00b7 total ${t1} \u2192 ${t2} \u00b7 relógio não pausa`);
}

console.log('== 12. sistema de botões, menu e relógio ==');
{
  const cs = s => w.getComputedStyle($(s));
  // hierarquia: um único primário por tela
  ok($$('.b--primary').length === 1, `deveria haver 1 botão primário, há ${$$('.b--primary').length}`);
  ok($('#bend').classList.contains('b--primary'), 'o primário deveria ser ENCERRAR TURNO');
  // raio único em todas as placas
  const raios = [...new Set($$('.b').map(b => cs2(b).borderRadius))];
  function cs2(el){ return w.getComputedStyle(el); }
  ok(raios.length === 1 && raios[0] === '3px', `raio deveria ser único (3px), veio ${raios}`);
  // render-se não fica exposto: mora no menu
  ok(!$('#bsurr'), 'render-se não deveria ficar solto na tela');
  ok(!$('.topx'), 'a caixa flutuante que sobrepunha o topo deveria ter saído');
  ok(!$('.sidebtns'), 'os botões soltos do rodapé deveriam ter saído');
  tap($('#bmenu'));
  ok(!!$('#menu'), 'o menu deveria abrir');
  ok(!!$('#bsurr') && !!$('#bhelp'), 'menu deveria conter render-se e como jogar');
  ok(parseFloat(cs('#menu').zIndex) > 10, 'o menu deveria ficar acima do conteúdo');
  tap($('#bmenu'));
  ok(!$('#menu'), 'tocar de novo deveria fechar o menu');

  // registro pelo ícone
  tap($('#blog')); ok(!!$('#logscroll'), 'registro deveria abrir'); ok($$('.log__row').length > 0, 'registro com linhas');
  tap($('#bclose')); ok(!$('#logscroll'), 'registro deveria fechar');

  // rendição atrás de duas confirmações
  tap($('#bmenu')); tap($('#bsurr'));
  ok(/RENDER/.test($('.result h1').textContent), 'confirmação de rendição');
  tap($('#bclose')); ok(!$('.result'), 'voltar cancela a rendição');
  console.log('  1 primário \u00b7 raio único 3px \u00b7 render-se em menu com confirmação');
}
ok(/TURNO \d+(\/40)? \u00b7 JOGADOR \d \u00b7 \d:\d\d/.test($('.timer__label').textContent), `rótulo do relógio inesperado: "${$('.timer__label').textContent}"`);
{ const st4 = S(); const salvo = st4.turno; st4.turno = 33; w.eval('render()');
  ok(/33\/40/.test($('.timer__label').textContent), 'a partir do turno 30 deveria avisar do empate técnico');
  st4.turno = salvo; w.eval('render()'); }
console.log(`  ${$('.timer__label').textContent}`);

console.log('== 11b. seleção de 2 alvos na interface ==');
{
  // times fixos por CHAVE (idioma robusto à paginação — a grade cresce p/ 100 e navegar por nome quebra: ver §71)
  w.eval("ir('selecao');pick=[['thor','hera','zeus'],['ogum','tyr','cuca']];vez=1;tudoLiberado=true;render()");
  const jogaveis = w.eval("ROSTER.filter(e=>!!GODS[e.key]).map(e=>e.nome)");
  ok(jogaveis.includes('Thor') && jogaveis.includes('Hera'), 'Thor e Hera deveriam estar jogáveis');
  tap($('#bgo'));
  w.eval('st.ativo=0;st.starter=0;st.aberturaFeita=true;render()');   // fixa o lado 0 (starter é sorteado)
  const l = S().lados[S().ativo];
  w.eval('ELEMS').forEach(e => l.orbs[e] = 9); w.eval('render()');

  // --- Thor: 2 inimigos, valores diferentes ---
  const thor = l.units.find(u => u.nome === 'Thor');
  tap($$('.skill').find(b => b.dataset.sk === thor.uid + '|habilidade'));
  ok(!!$('.b--wait'), 'deveria pedir alvo');
  ok(/1\/2/.test($('.b--wait').textContent), `deveria indicar Alvo 1/2, diz "${$('.b--wait').textContent}"`);
  ok(/inimigo/i.test($('.b--wait').textContent), 'deveria dizer que o alvo é inimigo');
  const alvosT = $$('.team--enemy .portrait.is-target');
  ok(alvosT.length === 3, `3 inimigos disponíveis, há ${alvosT.length}`);
  const uid1 = alvosT[0].dataset.uid, uid2 = alvosT[1].dataset.uid;
  tap(alvosT[0]);
  ok($$('.portrait.is-picked').length === 1, 'o 1º alvo deveria ficar marcado');
  ok(/2\/2/.test($('.b--wait').textContent), 'deveria avançar para Alvo 2/2');
  ok(!$$('.portrait.is-target').some(e => e.dataset.uid === uid1), 'o já escolhido não deveria seguir selecionável');
  tap($$('.team--enemy .portrait.is-target').find(e => e.dataset.uid === uid2));
  const o = S().lados[1 - S().ativo].units;
  const d1 = 120 - o.find(u => u.uid === uid1).hp, d2 = 120 - o.find(u => u.uid === uid2).hp;
  ok(d1 > d2, `o 1º alvo deveria levar mais dano (${d1} vs ${d2})`);
  console.log(`  Thor: alvo 1 \u2212${d1} \u00b7 alvo 2 \u2212${d2}`);

  // --- Hera: 2 aliados ---
  const hera = S().lados[S().ativo].units.find(u => u.nome === 'Hera');
  tap($$('.skill').find(b => b.dataset.sk === hera.uid + '|habilidade'));
  ok(/aliado/i.test($('.b--wait').textContent), 'deveria pedir aliado, não inimigo');
  const aliados = $$('.team--ally .portrait.is-target');
  ok(aliados.length === 3, `3 aliados selecionáveis, há ${aliados.length}`);
  ok($$('.team--enemy .portrait.is-target').length === 0, 'nenhum inimigo deveria estar selecionável');
  const a1 = aliados[1].dataset.uid, a2 = aliados[2].dataset.uid;
  tap(aliados[1]); tap($$('.team--ally .portrait.is-target').find(e => e.dataset.uid === a2));
  const un = S().lados[S().ativo].units;
  ok(!!w.eval(`ef(st.lados[st.ativo].units.find(u=>u.uid==='${a1}'),'dmgUp')`), '1º aliado deveria receber o buff');
  ok(!!w.eval(`ef(st.lados[st.ativo].units.find(u=>u.uid==='${a2}'),'dmgUp')`), '2º aliado deveria receber o buff');
  console.log('  Hera: buff aplicado nos 2 aliados escolhidos');

  // --- classe da habilidade aparece no painel ---
  const cuca = S().lados[1 - S().ativo].units.find(u => u.nome === 'Cuca');
  if (cuca) {
    tap($$('.foetab')[S().lados[1 - S().ativo].units.indexOf(cuca)]);
    const mental = $$('.foesk').find((_, i) => i === 1);
    if (mental) { tap(mental);
      ok(/MENTAL|MÁGICO|FÍSICO|AFLIÇÃO/.test($('.detail__classes').textContent),
        `painel deveria mostrar a classe da habilidade: "${$('.detail__classes').textContent}"`); }
  }
  console.log('  classe por habilidade visível no painel');
}

console.log('== 12b. COMO JOGAR e render-se fora do rodapé ==');
{
  tap($('#bmenu'));
  ok(!!$('#bhelp'), 'COMO JOGAR deveria estar no menu de utilidades');
  tap($('#bhelp'));
  ok(/COMO JOGAR/.test($('.ovh h2').textContent), 'painel de ajuda deveria abrir');
  ok($('.ovb').textContent.length > 400, 'ajuda deveria explicar as regras');
  tap($('#bclose'));
  ok(!$('.footer #bsurr') && !$('.topbar #bsurr'), 'render-se não deveria ficar exposto em topo nem rodapé');
  console.log('  ajuda e render-se dentro do menu de utilidades');
}

console.log('== 13. partida completa só por toques ==');
{
  let seed = 12345;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  let cliques = 0, g = 0;
  while (!S().fim && g++ < 500) {
    const livres = $$('.team--ally .skill[data-sk]').filter(b => !b.disabled);
    if (!livres.length) { tap($('#bend')); continue; }
    tap(livres[Math.floor(rnd() * livres.length)]); cliques++;
    let t = $$('.portrait.is-target');
    while (t.length && $$('.skill.is-armed').length) { tap(t[0]); cliques++; t = $$('.portrait.is-target'); }
    if ($('#bconf')) { tap($('#bconf')); cliques++; }
    else if ($$('.skill.is-armed').length && $('#bcanc')) { tap($('#bcanc')); cliques++; }
  }
  ok(S().fim, `deveria terminar (guarda ${g})`);
  ok(!!$('.result h1'), 'deveria mostrar o resultado');
  console.log(`  ${S().fim} no turno ${S().turno} \u00b7 ${cliques} toques`);
  tap($('#bnew'));
  ok($$('.pk').length > 0 && !!$('#bgo') && !!$('.grid'), 'nova batalha volta à grade de seleção');
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

console.log('== 13. INV 16: no máximo um primário VISÍVEL E ACESSÍVEL (base inerte sob scrim) ==');
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
  ok(nprim() === 1 && baseInert() === false, `batalha base: 1 primário e base não-inerte (prim ${nprim()}, inert ${baseInert()})`);
  // o menu ⋯ NÃO tem scrim → base NÃO fica inerte (fica interativa), e não traz primário
  w.eval('menuAberto=true;render()');
  ok(baseInert() === false, 'menu (sem scrim): base NÃO fica inerte');
  ok(nprim() <= 1, `menu: no máximo 1 primário (tem ${nprim()})`);
  w.eval('menuAberto=false;render()');
  for (const o of ['log', 'help', 'surr', 'apagar', 'conv', 'livre']) {
    w.eval(`ov='${o}';render()`);
    ok(nprim() <= 1, `overlay ${o}: no máximo 1 primário no DOM inteiro (tem ${nprim()})`);
    ok(baseInert() === true, `overlay ${o}: camada de base inerte`);
    ok(soltos('.ov') === 0, `overlay ${o}: nenhum focável da base fora do inerte (tem ${soltos('.ov')})`);
  }
  w.eval("ov=null;st.fim={tipo:'fim',resultado:'vitoria',lado:0};render()");
  ok(nprim() === 1 && baseInert() === true, `resultado: 1 primário e base inerte (prim ${nprim()}, inert ${baseInert()})`);
  ok(!!$('#bnew') && $('#bnew').classList.contains('b--primary'), 'o único primário é o da sobreposição (#bnew)');
  w.eval('st.fim=null;render()');
  ok(baseInert() === false && !!$('#bend') && $('#bend').classList.contains('b--primary'), 'fechar restaura: base não-inerte e #bend volta a primário');

  // --- seleção: filtro e kit ---
  w.eval("ir('selecao');painelFiltro=false;focoPk=null;render()");
  ok(nprim() === 1 && baseInert() === false, `seleção base: 1 primário e não-inerte (prim ${nprim()}, inert ${baseInert()})`);
  w.eval('painelFiltro=true;render()');
  ok(nprim() === 1 && baseInert() === true && soltos('.fpanel') === 0, 'filtro: 1 primário (o #ffechar), base inerte, sem focável solto');
  ok(!!$('#ffechar') && $('#ffechar').classList.contains('b--primary'), 'o primário do filtro é o #ffechar');
  ok(!!$('#bgo') && !$('#bgo').classList.contains('b--primary'), 'o #bgo da base foi rebaixado');
  w.eval('painelFiltro=false;focoPk=(typeof ROSTER!=="undefined"&&ROSTER[0]&&ROSTER[0].key)||null;render()');
  ok(nprim() <= 1 && baseInert() === true && soltos('.kpanel') === 0, `kit: <=1 primário, base inerte, sem focável solto (prim ${nprim()})`);
  w.eval('focoPk=null;render()');
  ok(baseInert() === false && !!$('#bgo') && $('#bgo').classList.contains('b--primary'), 'fechar kit restaura: base não-inerte e #bgo volta a primário');
  console.log('  ≤1 primário em toda sobreposição; base inerte sob scrim; menu (sem scrim) não inerta; fechar restaura');
}

console.log('');
console.log(falhas === 0 ? '>>> TUDO OK' : `>>> ${falhas} FALHA(S)`);
w.close();
process.exit(falhas ? 1 : 0);

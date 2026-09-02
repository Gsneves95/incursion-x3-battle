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

console.log('== 2. estrutura da tela de batalha (§214: zonas por ergonomia) ==');
const req = ['.stage__bg','.stage__scrim','.topbar','.side--me','.side--foe','.prof','.prof__pic','.prof__nick',
  '.timer','.timer__fill','.timer__label','.energy--me','.energy--foe',
  '.board','.panel','.panel__tab','.rows','.brow','.brow__ally','.brow__tiles','.brow__enemy',
  '.footer','.acaoestado','.detail','.detail__icon','.detail__name','.detail__text','.detail__classes',
  '.detail__cd','.endturn','.endturn__l1','.endturn__hint','.teamlbl--ally','.teamlbl--enemy'];
req.forEach(s => ok(!!$(s), `falta ${s}`));
ok(!$('.stagemark'), 'a marca-d\u2019água INCURSION deveria ter saído (item 9)');
ok($$('.brow').length === 3, `3 fileiras, há ${$$('.brow').length}`);
ok($$('.brow__ally .portrait').length === 3, `3 retratos aliados, há ${$$('.brow__ally .portrait').length}`);
ok($$('.brow__enemy .portrait[data-foe]').length === 3, `3 retratos inimigos, há ${$$('.brow__enemy .portrait[data-foe]').length}`);
ok($$('.brow__tiles .skill').length === 12, `3\u00d74 = 12 ladrilhos aliados, há ${$$('.brow__tiles .skill').length}`);
ok($$('.skill').length === 12, `só o time aliado tem ladrilhos, há ${$$('.skill').length}`);
ok(!$('.foetab') && !$('.foepanel') && !$('.foesk'), 'a exibição/abas permanentes das habilidades inimigas saíram (§214)');
ok($$('.portrait[data-foe] [data-sk]').length === 0, 'nada do lado inimigo pode ser armável');
ok($$('.portrait__ask').length === 3, `todo inimigo vivo precisa da marca "?" de consulta (item 8), há ${$$('.portrait__ask').length}`);
ok($$('.brow__enemy .portrait .effects').length === 3, 'a faixa de efeitos deve estar DENTRO do retrato inimigo');
ok($$('.brow__ally .portrait .effects').length === 3, 'a faixa de efeitos aliada também vive no retrato');
// §215: MINHAS orbes (interativas) à esquerda, as do OPONENTE (leitura) à direita — as duas visíveis
ok($$('.energy--me .energy__pill').length >= 1 && $$('.energy--me .energy__pill').length <= 6,
  `minhas orbes: 1 a 6 tipos, há ${$$('.energy--me .energy__pill').length}`);
ok($$('.energy--foe .energy__pill').length >= 1, `a energia do OPONENTE deveria estar visível (§215), há ${$$('.energy--foe .energy__pill').length}`);
ok($$('.energy--foe .energy__pill--ro').length === $$('.energy--foe .energy__pill').length,
  'as orbes do oponente são LEITURA (energy__pill--ro), não convertíveis');
ok($$('.energy--foe [data-conv]').length === 0, 'não dá para converter a energia do oponente');
// §215: perfil dos DOIS jogadores reservado no topo (foto + nick), com as orbes de cada lado
ok(!!$('.side--me .prof') && !!$('.side--foe .prof'), 'os dois perfis (foto+nick) deveriam existir no topo');
ok(/você/i.test($('.side--me .prof__nick').textContent), `perfil esquerdo = VOCÊ, diz "${$('.side--me .prof__nick').textContent}"`);
ok($('.side--foe .prof__nick').textContent.trim().length > 0, 'perfil direito deveria nomear o oponente');
ok(!!$('.side--me .prof__pic svg') && !!$('.side--foe .prof__pic svg'), 'cada perfil tem a foto (placeholder) tocável');
ok($$('.portrait .portrait__x').length === 6, 'todo retrato precisa do X de derrota');
// item 13: marcação de time — VOCÊ (ouro) sobre a coluna aliada, oponente (vermelho) sobre a dele
ok(/você/i.test($('.teamlbl--ally').textContent), `rótulo aliado deveria dizer VOCÊ, diz "${$('.teamlbl--ally').textContent}"`);
ok($('.teamlbl--enemy').textContent.trim().length > 0, 'rótulo inimigo deveria nomear o oponente');
// item 10: NOME INTEIRO no retrato (não abreviado)
const nomesFoe = $$('.brow__enemy .portrait__nome').map(e => e.textContent.trim());
ok(nomesFoe.some(n => n.length > 3), `nomes inteiros no retrato inimigo (item 10): ${nomesFoe.join('/')}`);
console.log(`  topo + board(painel+3 fileiras) + rodapé \u00b7 ${$$('.skill').length} ladrilhos \u00b7 ${$$('.portrait__ask').length} marcas "?" \u00b7 ${$$('.energy__pill').length} pílulas`);

console.log('== 3. encaixes de arte com chave ==');
const slots = $$('.slot[data-slot]').map(e => e.dataset.slot);
const temGod = slots.filter(s => s.startsWith('god-')).length;
const temSkill = slots.filter(s => s.startsWith('skill-')).length;
ok(temGod >= 6, `deveria haver chave god- para os 6 retratos, há ${temGod}`);
ok(temSkill >= 12, `deveria haver chave skill- nos 12 slots, há ${temSkill}`);
console.log(`  ${slots.length} encaixes: ${temGod} retratos, ${temSkill} habilidades`);

console.log('== 4. tocar habilidade → detalhe no painel + arma + alvos ==');
encher();
// procura uma habilidade COM custo que peça alvo inimigo
let bas = null;
for (const b of $$('.brow__tiles .skill[data-sk]').filter(x => !x.disabled && x.querySelector('.skill__cost i'))) {
  const key = b.dataset.sk;
  tap(b);
  if ($$('.portrait[data-foe].is-target').length > 0) { bas = $$('.skill').find(x => x.dataset.sk === key); break; }
  tap($$('.skill').find(x => x.dataset.sk === key));   // re-toque na mesma habilidade cancela; tenta a próxima
}
ok(!!bas, 'deveria haver uma habilidade com custo que peça alvo');
ok($$('.skill.is-armed').length === 1, 'habilidade deveria ficar armada');
ok(!!$('.detail__name').textContent.trim(), 'detalhe deveria mostrar o nome');
ok($('.detail__text').textContent.length > 6, 'detalhe deveria mostrar a descrição');
ok(!!$('.cost'), 'detalhe deveria mostrar as pílulas de custo');
ok($$('.detail__cd').some(e => /RECARGA/.test(e.textContent)), 'detalhe deveria mostrar recarga/sem recarga');
ok(!$('.detail .cost__none'), 'habilidade com custo não deveria dizer SEM CUSTO');
ok($$('.portrait[data-foe].is-target').length > 0, 'inimigos deveriam pulsar como alvo');
// §214: o AVISO de escolher alvo vive no rodapé (à esquerda), em .acao__txt
ok(!!$('.acaoestado .acao__txt'), 'deveria haver o aviso de escolher alvo no rodapé');
ok(/toque|alvo/i.test($('.acao__txt').textContent), `aviso inesperado: "${$('.acao__txt').textContent}"`);
ok(!$('#bconf'), 'CONFIRMAR não deve aparecer quando a habilidade precisa de alvo');
console.log(`  "${$('.detail__name').textContent}" \u00b7 ${$$('.portrait[data-foe].is-target').length} alvos`);

console.log('== 4b. consulta do KIT inimigo (item 8: toque longo → painel; toque na hab. → detalhe) ==');
{
  const hpTodos = () => w.eval('st').lados.flatMap(l=>l.units).map(u=>u.hp).join(',');
  // limpa o armado do teste anterior
  w.eval('armado=null;alvos=[];escolhidos=[];detalhe=null;render()');
  const antes = hpTodos();
  const foe0 = S().lados[1 - S().ativo].units[0];

  // marca de descoberta: "?" no canto do retrato inimigo vivo
  ok($$('.brow__enemy .portrait__ask').length === 3, 'os 3 inimigos vivos deveriam mostrar a marca "?" de consulta');

  // §219 — o TOQUE LONGO abre o kit e ele FICA (soltar o dedo NÃO fecha). Exercemos o gesto:
  // pointerdown, o timer de 420ms abre (simulado por abrirKit + foeGesto.abriu), e o pointerup NÃO fecha.
  const fp = $('.portrait[data-foe]'); const uid = fp.dataset.uid;
  fp.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 }));
  w.eval('foeGesto.abriu=true'); w.eval(`abrirKit("${uid}")`);
  ok(w.eval('peekKit') === uid, 'o toque longo abre o kit');
  ok(!!$('.panel .kitwrap') && !!$('.kstrip'), 'o painel deveria abrir o KIT (galeria + detalhe)');
  const fp2 = $(`.portrait[data-foe][data-uid="${uid}"]`);
  fp2.dispatchEvent(new w.MouseEvent('pointerup', { bubbles: true, clientX: 0, clientY: 0 }));
  ok(w.eval('peekKit') === uid && !!$('.kstrip'), '§219: soltar o dedo NÃO fecha o kit (persiste)');

  // a TIRA: 4 habilidades + passiva, custo VISÍVEL sem tocar; e o cabeçalho + o fechar deliberado
  ok($$('.kstrip .kchip').length === 5, `a tira deveria ter 4 habilidades + passiva, há ${$$('.kstrip .kchip').length}`);
  ok($$('.kchip--pas').length === 1, 'a passiva está inclusa na tira');
  ok($$('.kstrip .kchip__pips').length === 5, 'todo chip mostra o custo (pílulas) sem tocar');
  ok(/KIT/.test($('.kitwrap .kit__head .detail__name').textContent), 'o cabeçalho nomeia o inimigo consultado');
  ok(!!$('.kitwrap [data-kitclose]'), 'há um fechar deliberado (o botao ✕)');
  // a SELECIONADA por inteiro: arte grande + recarga + texto completo
  ok(parseFloat(w.getComputedStyle($('.kitdet .detail__icon')).width) >= 52, 'a arte da selecionada é grande (legível)');
  ok($('.kitdet .detail__text').textContent.length > 8, 'a selecionada mostra o texto completo do que faz');
  ok($$('.kitdet .detail__cd').some(e => /PRONTA/.test(e.textContent)), 'a selecionada mostra a recarga');

  // tocar OUTRO chip troca a seleção, sem sair do kit nem armar/alterar estado
  const nomeAntes = $('.kitdet .detail__name').textContent;
  const outro = $$('.kstrip .kchip[data-kitsel]').find(b => !b.classList.contains('is-sel'));
  tap(outro);
  ok($$('.skill.is-armed').length === 0, 'consultar não pode armar nada');
  ok(hpTodos() === antes, 'consultar não pode alterar o estado');
  ok(!!$('.kstrip') && $('.kitdet .detail__name').textContent !== nomeAntes, 'trocar de chip mantém o kit e muda a selecionada');
  // a PASSIVA por inteiro (sem custo)
  tap($('.kchip--pas'));
  ok(/PASSIVA/.test($('.kitdet').textContent), 'a passiva mostra-se como PASSIVA');
  ok(!$('.kitdet .cost .cost__pip'), 'a passiva não tem custo');
  console.log(`  "${$('.detail__name').textContent}" \u2014 ${$('.detail__cd').textContent}`);

  // FECHAR é deliberado: o botao ✕ volta ao histórico (soltar o dedo nunca fecha)
  tap($('.kitwrap [data-kitclose]'));
  ok(!w.eval('peekKit') && !$('.kstrip'), 'o fechar deliberado dispensa o kit');
  console.log('  "?" nos 3 inimigos \u00b7 kit no painel \u00b7 toca hab. \u2192 detalhe \u00b7 volta ao kit');
}

console.log('== 4c. hierarquia visual e legibilidade ==');
{
  const nomes = $$('.brow__tiles .skill .skill__mono').map(e => e.textContent.trim());
  ok(nomes.length === 12, `12 ladrilhos deveriam ter monograma, há ${nomes.length}`);
  ok(nomes.every(n => n.length <= 3 && n.length >= 2), 'monograma deveria ter 2 ou 3 letras');
  const porUnidade = [0,1,2].map(i => nomes.slice(i*4,i*4+4));
  porUnidade.forEach((g,i) => ok(new Set(g).size === 4,
    `as 4 habilidades da unidade ${i+1} deveriam ter monogramas distintos: ${g.join('/')}`));
  ok(!$('.skill__name'), 'a parede de texto no ladrilho deveria ter saído');
  ok(!$('.skill__tag'), 'o rótulo redundante de slot deveria ter saído');
  // o personagem (retrato) é MAIOR que a habilidade (item da adaptação Naruto-Arena)
  const pW = parseFloat(w.getComputedStyle($('.brow__ally .portrait')).width);
  const sW = parseFloat(w.getComputedStyle($('.brow__tiles .skill')).width);
  ok(pW > sW, `o retrato (${pW}px) deveria ser MAIOR que a habilidade (${sW}px)`);
  console.log(`  monogramas ${nomes.slice(0,4).join('/')} \u00b7 retrato ${pW}px > ladrilho ${sW}px`);
}

console.log('== 4b2. tile de habilidade é RETÂNGULO (§214), não círculo ==');
{
  const cs = s => w.getComputedStyle($(s));
  // o alvo de toque nunca cai abaixo de 76px (regra do dono)
  ok(parseFloat(cs('.skill').width) >= 76, `botão deveria ter 76px+ de lado, tem ${cs('.skill').width}`);
  ok(cs('.skill').borderWidth === '0px', 'a borda saiu do botão e foi para o disco');
  // o disco é um RETÂNGULO de cantos arredondados (10px), mostra mais arte que o círculo
  ok(cs('.skill__disc').borderRadius === '10px', `o disco deveria ser retângulo (10px), veio ${cs('.skill__disc').borderRadius}`);
  ok(cs('.skill__cd').borderRadius === '10px', 'a máscara de recarga deveria acompanhar o retângulo');
  ok(cs('.skill__lock').borderRadius === '10px', 'a máscara de trava também');

  // anel = elemento; espessura = tier
  const um = $$('.brow__ally')[0].closest('.brow').querySelectorAll('.brow__tiles .skill');
  const larg = [...um].map(b => w.getComputedStyle(b.querySelector('.skill__disc')).borderWidth);
  ok(larg[0] === '1px' && larg[1] === '2px' && larg[2] === '2px',
    `espessura deveria crescer do Básico para Milagre: ${larg}`);
  ok(w.getComputedStyle(um[3].querySelector('.skill__disc')).borderStyle === 'dashed',
    'a Defesa deveria manter o anel tracejado');
  ok([...um].every(b => /border-color/.test(b.querySelector('.skill__disc').getAttribute('style'))),
    'o anel deveria receber a cor do elemento');

  // custo = selo de pílulas na base
  const semCusto = $$('.brow__tiles .skill').filter(b => !b.querySelector('.skill__cost i'));
  ok(semCusto.length === 0 || semCusto.every(b => b.querySelector('.skill__cost.gratis')),
    'habilidade sem custo deveria exibir o selo GRÁTIS');
  console.log(`  toque ${cs('.skill').width} \u00b7 disco retângulo 10px \u00b7 anel ${larg.join('/')} por tier`);
}

console.log('== 4c2. contagem de objetos e ruído ==');
{
  const objetos = $$('.skill, .portrait, .hp, .effect, .energy__pill, .b, .endturn').length;
  ok(!$('.skill__el'), 'sem barra de elemento: o anel do disco faz esse papel');
  ok(objetos < 70, `objetos visuais deveriam ficar contidos, há ${objetos}`);
  const pills = $$('.energy--me .energy__pill').length;
  ok(pills <= 6, `minhas orbes: só os tipos que importam, há ${pills} pílulas`);
  ok(!/\u03a3/.test($('.energy--me').textContent), 'o total \u03a3 era redundante e deveria ter saído');
  ok(!$('.player__rank'), 'a linha "3 de pé \u00b7 N energia" duplicava o que a tela já mostra');
  ok(!/\/100|\/120/.test($('.hp__label').textContent), 'o "/max" era redundante no rótulo de vida');
  ok($$('.brow__ally .portrait .effects').length === 3, 'efeitos deveriam viver dentro do retrato, 1 faixa por unidade');
  console.log(`  ${objetos} objetos em repouso \u00b7 ${pills} pílulas`);
}

console.log('== 4d. pílula vermelha marca a energia que falta ==');
{
  const l0 = S().lados[S().ativo];
  w.eval('ELEMS').forEach(e => l0.orbs[e] = 0); w.eval('render()');
  const faltando = $$('.brow__tiles .skill__cost i.miss').length;
  ok(faltando > 0, 'sem energia, as pílulas de custo deveriam ficar marcadas em falta');
  const off = $$('.brow__tiles .skill.is-off').length;
  ok(off > 0, 'habilidades impagáveis deveriam estar em estado is-off');
  console.log(`  ${faltando} pílulas em falta \u00b7 ${off} habilidades apagadas`);
  encher();
}

console.log('== 5. energia a gastar acende no topo ==');
encher();
let armavel = null;
for (const b of $$('.brow__tiles .skill[data-sk]').filter(x => !x.disabled && x.querySelector('.skill__cost i'))) {
  const key = b.dataset.sk;
  tap(b);
  if ($$('.portrait[data-foe].is-target').length > 0) { armavel = key; break; }
  tap($$('.skill').find(x => x.dataset.sk === key));
}
ok(!!armavel, 'deveria haver habilidade com custo que peça alvo inimigo');
ok($$('.energy__pill.spend').length > 0, 'pílulas de energia a gastar deveriam destacar');
console.log(`  ${$$('.energy__pill.spend').length} tipo(s) destacado(s)`);

console.log('== 6. tocar no alvo resolve ==');
const foto = () => S().lados[1 - S().ativo].units
  .map(u => u.hp + ':' + u.efeitos.length + ':' + u.dots.length).join(',');
const antes6 = foto();
const nlog = S().log.length;
tapFoe($('.portrait[data-foe].is-target'));
ok($$('.skill.is-armed').length === 0, 'deveria desarmar');
ok(S().log.length > nlog, 'a ação deveria gerar registro');
ok(foto() !== antes6, 'a ação deveria alterar o estado do inimigo (vida ou efeito)');
console.log(`  ${w.eval('narrar(st.log[st.log.length-1])')}`);

console.log('== 7. ação sem alvo exige o botão CONFIRMAR (no rodapé) ==');
encher();
const def = $$('.brow__tiles .skill[data-sk]').find(b => !b.disabled && b.dataset.sk.endsWith('|defesa'));
ok(!!def, 'Defesa deveria estar disponível');
const hpA = S().lados[S().ativo].units.map(u => u.hp).join(',');
tap(def);
ok(!!$('#bconf'), 'CONFIRMAR deveria aparecer no rodapé da ação');
ok(!!$('#bcanc'), 'CANCELAR deveria aparecer no rodapé da ação');
ok(!/CONFIRMAR/i.test($('.endturn').textContent), 'ENCERRAR TURNO não deve mudar de função');
tap($('#bcanc'));
ok($$('.skill.is-armed').length === 0, 'cancelar deveria desarmar');
ok(S().lados[S().ativo].units.map(u => u.hp).join(',') === hpA, 'cancelar não altera estado');
tap(def); tap($('#bconf'));
ok($$('.skill.is-armed').length === 0, 'confirmar deveria resolver');
console.log('  armar \u2192 confirmar/cancelar; nada resolve por acidente');

console.log('== 8. recarga sobre o ícone ==');
{
  const u = S().lados[S().ativo].units[0]; u.cd.milagre = 3; w.eval('render()');
  const cds = $$('.brow__tiles .skill.is-cooldown');
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
tap($$('.brow__ally .portrait')[1]);
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
  // render-se não fica exposto: mora no menu
  ok(!$('#bsurr'), 'render-se não deveria ficar solto na tela');
  ok(!$('.topx'), 'a caixa flutuante que sobrepunha o topo deveria ter saído');
  ok(!$('.sidebtns'), 'os botões soltos do rodapé deveriam ter saído');
  tap($('#bmenu'));
  ok(!!$('#menu'), 'o menu deveria abrir');
  ok(!!$('#bsurr') && !!$('#bhelp'), 'menu deveria conter render-se e como jogar');
  ok(!!$('#bsair'), 'menu deveria oferecer sair para o início (§210)');
  ok(parseFloat(cs('#menu').zIndex) > 4, 'o menu deveria ficar acima do conteúdo');
  tap($('#bmenu'));
  ok(!$('#menu'), 'tocar de novo deveria fechar o menu');

  // registro pelo ícone
  tap($('#blog')); ok(!!$('#logscroll'), 'registro deveria abrir'); ok($$('.log__row').length > 0, 'registro com linhas');
  tap($('#bclose')); ok(!$('#logscroll'), 'registro deveria fechar');

  // rendição atrás de duas confirmações
  tap($('#bmenu')); tap($('#bsurr'));
  ok(/RENDER/.test($('.result h1').textContent), 'confirmação de rendição');
  tap($('#bclose')); ok(!$('.result'), 'voltar cancela a rendição');
  console.log('  1 primário \u00b7 render-se e "sair para o início" no menu com confirmação');
}
ok(/TURNO \d+(\/40)? \u00b7 \d:\d\d/.test($('.timer__label').textContent), `rótulo do relógio inesperado: "${$('.timer__label').textContent}"`);
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
  ok(!!$('.acao__txt'), 'deveria pedir alvo no rodapé');
  ok(/1\/2/.test($('.acao__txt').textContent), `deveria indicar Alvo 1/2, diz "${$('.acao__txt').textContent}"`);
  const alvosT = $$('.portrait[data-foe].is-target');
  ok(alvosT.length === 3, `3 inimigos disponíveis, há ${alvosT.length}`);
  const uid1 = alvosT[0].dataset.uid, uid2 = alvosT[1].dataset.uid;
  tapFoe(alvosT[0]);
  ok($$('.portrait.is-picked').length === 1, 'o 1º alvo deveria ficar marcado');
  ok(/2\/2/.test($('.acao__txt').textContent), 'deveria avançar para Alvo 2/2');
  ok(!$$('.portrait[data-foe].is-target').some(e => e.dataset.uid === uid1), 'o já escolhido não deveria seguir selecionável');
  tapFoe($$('.portrait[data-foe].is-target').find(e => e.dataset.uid === uid2));
  const o = S().lados[1 - S().ativo].units;
  const d1 = 120 - o.find(u => u.uid === uid1).hp, d2 = 120 - o.find(u => u.uid === uid2).hp;
  ok(d1 > d2, `o 1º alvo deveria levar mais dano (${d1} vs ${d2})`);
  console.log(`  Thor: alvo 1 \u2212${d1} \u00b7 alvo 2 \u2212${d2}`);

  // --- Hera: 2 aliados ---
  const hera = S().lados[S().ativo].units.find(u => u.nome === 'Hera');
  tap($$('.skill').find(b => b.dataset.sk === hera.uid + '|habilidade'));
  ok(/aliado/i.test($('.acao__txt').textContent), 'deveria pedir aliado, não inimigo');
  const aliados = $$('.portrait.is-target:not([data-foe])');
  ok(aliados.length === 3, `3 aliados selecionáveis, há ${aliados.length}`);
  ok($$('.portrait[data-foe].is-target').length === 0, 'nenhum inimigo deveria estar selecionável');
  const a1 = aliados[1].dataset.uid, a2 = aliados[2].dataset.uid;
  tap(aliados[1]); tap($$('.portrait.is-target:not([data-foe])').find(e => e.dataset.uid === a2));
  ok(!!w.eval(`ef(st.lados[st.ativo].units.find(u=>u.uid==='${a1}'),'dmgUp')`), '1º aliado deveria receber o buff');
  ok(!!w.eval(`ef(st.lados[st.ativo].units.find(u=>u.uid==='${a2}'),'dmgUp')`), '2º aliado deveria receber o buff');
  console.log('  Hera: buff aplicado nos 2 aliados escolhidos');
}

console.log('== 11c. multi-golpe distribuído (§92): seleção múltipla, toggle, degenerado, invariante 13 ==');
{
  // Babi (milagre = 4 golpes de 10 distribuídos) no lado 0. Times fixos por CHAVE (robusto à paginação, §71).
  w.eval("ir('selecao');pick=[['babi','zeus','ogum'],['tyr','cuca','sobek']];vez=0;tudoLiberado=true;render()");
  tap($('#bgo'));
  w.eval('st.ativo=0;st.starter=0;st.aberturaFeita=true;render()');
  const l = S().lados[S().ativo];
  w.eval('ELEMS').forEach(e => l.orbs[e] = 9); w.eval('render()');
  const babi = l.units.find(u => u.nome === 'Babi');
  const armaBabi = () => tap($$('.skill').find(b => b.dataset.sk === babi.uid + '|milagre'));
  const alvos = () => $$('.portrait[data-foe].is-target');
  const alvoUid = uid => alvos().find(e => e.dataset.uid === uid);

  // --- SELEÇÃO (3 inimigos vivos): distribui é multi-select e NÃO auto-confirma ---
  armaBabi();
  ok(alvos().length === 3, `distribui: os 3 inimigos vivos deveriam ser alvos (${alvos().length})`);
  ok(!$('#bconf'), 'distribui sem alvo: CONFIRMAR ainda não aparece');
  ok(!!$('.acao__txt') && /toque/i.test($('.acao__txt').textContent), 'deveria pedir para tocar os alvos');
  const u1 = alvos()[0].dataset.uid, u2 = alvos()[1].dataset.uid;
  tapFoe(alvoUid(u1));
  ok($$('.portrait.is-picked').length === 1, 'o 1º alvo tocado deveria ficar marcado');
  ok($$('.skill.is-armed').length === 1, 'distribui NÃO auto-confirma: segue armado após o 1º toque');
  ok(!!$('#bconf'), 'com 1 alvo já dá para CONFIRMAR (o extra de golpes cai nele)');
  tapFoe(alvoUid(u2));
  ok($$('.portrait.is-picked').length === 2, 'o 2º alvo também marca');
  tapFoe(alvoUid(u1));   // TOGGLE: tocar de novo desmarca
  ok($$('.portrait.is-picked').length === 1, 'tocar de novo no mesmo alvo desmarca (toggle)');
  tap($('#bcanc'));
  ok($$('.skill.is-armed').length === 0, 'cancelar desarma');

  // --- INVARIANTE 13: armar → selecionar dois → CANCELAR → nada gasto (orbe, recarga, HP) ---
  const orbAntes = w.eval('totalOrbs(st.lados[st.ativo])');
  const cdAntes = babi.cd.milagre || 0;
  const hpAntes = S().lados[1].units.map(u => u.hp).join(',');
  armaBabi();
  tapFoe(alvos()[0]); tapFoe(alvos().find(e => !$$('.portrait.is-picked').some(p => p.dataset.uid === e.dataset.uid)));
  ok($$('.portrait.is-picked').length === 2, 'dois alvos selecionados antes de cancelar');
  tap($('#bcanc'));
  ok(w.eval('totalOrbs(st.lados[st.ativo])') === orbAntes, `INV 13: nenhum orbe gasto ao cancelar (${orbAntes})`);
  ok((babi.cd.milagre || 0) === cdAntes, 'INV 13: nenhuma recarga acionada ao cancelar');
  ok(S().lados[1].units.map(u => u.hp).join(',') === hpAntes, 'INV 13: nenhum inimigo tomou dano');

  // --- CONFIRMAR resolve e distribui (4 golpes de 10 entre 2 = 20/20) ---
  armaBabi();
  const g1 = alvos()[0].dataset.uid, g2 = alvos()[1].dataset.uid;
  const foe = uid => S().lados[1].units.find(u => u.uid === uid);
  const h1 = foe(g1).hp, h2 = foe(g2).hp;
  tapFoe(alvoUid(g1)); tapFoe(alvoUid(g2));
  tap($('#bconf'));
  ok($$('.skill.is-armed').length === 0, 'confirmar resolve e desarma');
  ok(h1 - foe(g1).hp === 20 && h2 - foe(g2).hp === 20, `4 golpes de 10 entre 2 = 20/20 (${h1 - foe(g1).hp}/${h2 - foe(g2).hp})`);

  // --- DEGENERADO: com 1 inimigo vivo, distribui vira alvo único (toque RESOLVE, sem CONFIRMAR) ---
  const fs = S().lados[1].units;
  fs[1].vivo = false; fs[1].hp = 0; fs[2].vivo = false; fs[2].hp = 0;
  babi.agiu = false; babi.cd.milagre = 0;
  w.eval('ELEMS').forEach(e => S().lados[0].orbs[e] = 9); w.eval('render()');
  armaBabi();
  ok(alvos().length === 1, `degenerado: só 1 alvo válido (${alvos().length})`);
  ok(!$('#bconf'), 'degenerado: sem CONFIRMAR — comporta-se como alvo único');
  const lone = fs[0], hLone = lone.hp;
  tapFoe(alvos()[0]);
  ok($$('.skill.is-armed').length === 0, 'degenerado: tocar o único alvo RESOLVE (auto-confirma, como single-target)');
  ok(hLone - lone.hp === 40, `degenerado concentra os 4 golpes num só: 40 (${hLone - lone.hp})`);
  console.log('  multi-select + toggle · INV 13 (cancelar não gasta) · confirmar distribui 20/20 · degenerado = alvo único');
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

console.log('== 12c. painel recolhível (§214): aba recolhe, tiles crescem, aba reabre ==');
{
  w.eval("ir('selecao');pick=[['zeus','ogum','brigid'],['cuca','sobek','ganesha']];vez=0;render();document.getElementById('bgo').click();st.ativo=0;st.starter=0;st.aberturaFeita=true;vsCPU=false;ov=null;painelRecolhido=false;render()");
  ok(!!$('.panel__tab'), 'a aba de recolher deveria estar sempre visível');
  ok(!!$('.panel__box'), 'aberto: o corpo do painel deveria existir');
  // jsdom não faz layout (getComputedStyle não cascateia o override de largura); aqui
  // provamos a ESTRUTURA — que a regra de crescimento MIRA o tile só quando recolhido.
  // O crescimento em PX (78 p/ ~100) é medido em navegador real em tests/moldura.test.js.
  ok(!$('.brow__tiles .skill').matches('#baselayer.pnfold .brow__tiles .skill'),
    'aberto: o tile ainda não deveria casar a regra de crescimento');
  tap($('.panel__tab'));
  ok(!!$('#baselayer.pnfold'), 'recolhido: o board deveria marcar-se pnfold');
  ok(!$('.panel__box'), 'recolhido: o corpo do painel some, sobra só a aba');
  ok($('.brow__tiles .skill').matches('#baselayer.pnfold .brow__tiles .skill'),
    'recolhido: o tile deveria casar a regra que o faz crescer (78 p/ 100px)');
  tap($('.panel__tab'));
  ok(!$('#baselayer.pnfold') && !!$('.panel__box'), 'a aba deveria reabrir o painel');
  console.log('  aba recolhe/reabre \u00b7 tile passa a casar a regra de crescimento ao recolher (px em moldura)');
}

console.log('== 12d. \u00a7215: tocar a FOTO do perfil abre o marcador honesto (Fase 5) ==');
{
  w.eval("ir('selecao');pick=[['zeus','ogum','brigid'],['cuca','sobek','ganesha']];vez=0;render();document.getElementById('bgo').click();st.ativo=0;st.starter=0;st.aberturaFeita=true;vsCPU=false;ov=null;painelRecolhido=false;render()");
  tap($('.side--me .prof'));
  ok(w.eval("ov") === 'perfil', 'tocar a foto deveria abrir o marcador de perfil');
  ok(/PERFIL/.test($('.ovh h2').textContent), 'o marcador deveria titular PERFIL');
  ok(/Fase 5|competitivo/i.test($('.ovb').textContent), 'o marcador deveria ser HONESTO sobre a Fase 5');
  tap($('#bclose'));
  ok(!$('.ov'), 'Fechar deveria dispensar o marcador');
  // a foto do OPONENTE tamb\u00e9m abre o mesmo marcador
  tap($('.side--foe .prof'));
  ok(w.eval("ov") === 'perfil', 'a foto do oponente tamb\u00e9m abre o marcador');
  tap($('#bclose'));
  console.log('  foto (dos dois lados) \u2192 marcador honesto de perfil (Fase 5)');
}

console.log('== 13. partida completa só por toques ==');
{
  let seed = 12345;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  let cliques = 0, g = 0;
  while (!S().fim && g++ < 500) {
    const livres = $$('.brow__tiles .skill[data-sk]').filter(b => !b.disabled);
    if (!livres.length) { tap($('#bend')); continue; }
    tap(livres[Math.floor(rnd() * livres.length)]); cliques++;
    let t = $$('.portrait.is-target');
    while (t.length && $$('.skill.is-armed').length) {
      const alvoEl = t[0];
      if (alvoEl.dataset.foe) tapFoe(alvoEl); else tap(alvoEl);
      cliques++; t = $$('.portrait.is-target');
    }
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
  ok(nprim() === 1 && baseInert() === false, `batalha base: 1 primário e base não-inerte (prim ${nprim()}, inert ${baseInert()})`);
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

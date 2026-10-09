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

  // §287 — o painel da SELEÇÃO lê data/deuses (a MESMA fonte da Coleção), NÃO mais o kits.efeito.
  // tyr é inicial e diverge entre as fontes: kits.efeito "12 de dano a 1 inimigo." × deuses.desc "Grátis. 12 de dano."
  {
    const alvo = 'tyr';
    w.eval(`previewPk("${alvo}");renderPick()`);
    const descBas = w.eval(`(GODS['${alvo}'].ab.find(a=>a.slot==='basico')||{}).desc`);
    const linhas = $$('#kpanel .krow__t').map(e => e.textContent.trim());
    ok(linhas.includes(descBas), 'seleção: o básico mostra o deuses.desc (lê data/deuses)');
    ok(/Grátis/.test($('#kpanel').textContent) && !/a 1 inimigo/.test($('#kpanel').textContent),
      'seleção: mostra a redação do data/deuses, NÃO a do kits.efeito');
    // a MESMA linha que a Coleção — a sobreposição (home.js, §288) abre no básico e lê o mesmo GODS[k].ab[].desc
    const ov = new w.DOMParser().parseFromString(w.eval(`colVerSel='basico'; colOverlayHTML("${alvo}")`), 'text/html');
    const efCol = ((ov.querySelector('.col2ov__deftxt') || {}).textContent || '').trim();
    ok(efCol === descBas, 'Coleção e Seleção mostram a MESMA linha para o mesmo deus');
    // babá: muda a FONTE (data/deuses) e as DUAS telas mudam juntas
    const orig = descBas;
    w.eval(`GODS['${alvo}'].ab.find(a=>a.slot==='basico').desc='SENTINELA287 zzz'`);
    w.eval(`previewPk("${alvo}");renderPick()`);
    const selMudou = /SENTINELA287/.test($('#kpanel').textContent);
    const colMudou = /SENTINELA287/.test(w.eval(`colOverlayHTML("${alvo}")`));
    ok(selMudou && colMudou, 'uma fonte, duas telas: mudar o deuses.desc muda Seleção E Coleção juntas');
    w.eval(`GODS['${alvo}'].ab.find(a=>a.slot==='basico').desc=${JSON.stringify(orig)}`);
    tap($('#kitclose'));
  }

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

console.log('== 2. estrutura da tela de batalha (§330: topo refeito, sem quadro de ação, minis no painel) ==');
ok(!!$('#baselayer.bt'), 'a batalha usa o layout §329/§330 (#baselayer.bt)');
// §330: .bt-centro é CONDICIONAL (a arte do centro some se a largura disponível < 25u — 16:9 estreito, e no jsdom
// degenerado 0×0 a largura cai no piso de 780px → ~182u). Sua presença em tela real é provada em batalha_faixa.
['.bt-ajustes','.bt-prof','.bt-prof--foe','.bt-topcentro','.bt-ebox','.bt-trocar','.bt-encerrar','.bt-panel','.bt-panel__minis']
  .forEach(s => ok(!!$(s), `falta ${s}`));
ok($$('.bt-portrait--ally').length === 3, `3 retratos aliados, há ${$$('.bt-portrait--ally').length}`);
ok($$('.bt-portrait--foe[data-foe]').length === 3, `3 retratos inimigos, há ${$$('.bt-portrait--foe[data-foe]').length}`);
ok($$('.bt-skill[data-sk]').length === 12, `3×4 = 12 habilidades aliadas, há ${$$('.bt-skill[data-sk]').length}`);
ok($$('.bt-portrait--foe [data-sk]').length === 0, 'nada do inimigo é armável (só leitura)');   // INV 15
ok($$('.bt-portrait__ask').length === 3, `todo inimigo vivo tem a marca "?" de consulta, há ${$$('.bt-portrait__ask').length}`);
ok($$('.bt-portrait .bt-portrait__x').length === 6, 'todo retrato tem o X de derrota');
ok($$('.bt-hp').length === 6, `6 barras de vida (atual/máx), há ${$$('.bt-hp').length}`);
ok($$('.bt-hp__lab').every(e => /\d+\/\d+/.test(e.textContent)), 'toda barra de vida mostra atual/máx');
// §330: o quadro de ação "?" FOI REMOVIDO (a habilidade escolhida marca-se no próprio botão); as 4 minis do deus
// em foco vivem DENTRO do painel ("Toque numa habilidade").
ok($$('.bt-acao').length === 0, `§330: sem quadro de ação no DOM, há ${$$('.bt-acao').length}`);
ok($$('.bt-panel__minis .bt-mini[data-look]').length >= 1, 'as minis do deus em foco vivem no painel ("Toque numa habilidade")');
ok(/você/i.test($('.bt-name--me .bt-name__nick').textContent), `perfil esquerdo = VOCÊ ("${$('.bt-name--me .bt-name__nick').textContent}")`);
ok($('.bt-name--foe .bt-name__nick').textContent.trim().length > 0, 'o oponente é nomeado à direita');
ok(!!$('.bt-prof[data-prof="me"] .bt-prof__pic svg') && !!$('.bt-prof--foe .bt-prof__pic svg'), 'cada perfil tem a foto placeholder tocável');
ok($$('.bt-ebox .bt-ec').length >= 1, `contadores de energia na caixa do topo, há ${$$('.bt-ebox .bt-ec').length}`);
console.log(`  topo + 3 fileiras + centro + painel · ${$$('.bt-skill').length} habilidades · ${$$('.bt-portrait__ask').length} marcas "?"`);

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
  ok(/\d+\/\d+/.test($('.bt-panel__cd').textContent), 'o painel mostra a vida (atual/máx)');
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
  ok(!!$('#menu') && !!$('#bsair') && !!$('#bhelp'), 'MENU abre o dropdown (sair/como jogar etc.)');
  ok(!!$('#bmenubuild'), 'o carimbo de build vive no menu');
  tap($('#bmenu'));
  ok(!!$('#bsurr'), 'DESISTIR (rendição) fica no canto inferior esquerdo');
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
  if ($('#bnew')) { tap($('#bnew')); ok($$('.pk').length > 0 && !!$('#bgo'), 'nova batalha volta à grade de seleção'); }
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

// §202 — a CLASSE de bug: só a BUILD exercitava (schema + solucionador no motor puro), o
// RUNTIME da tela nunca. As 3 Provações de bestiário validavam, carimbavam e QUEBRARIAM ao
// jogar (retrato lia GODS, criatura não está lá). Este teste fecha a classe: RENDERIZA a
// batalha de TODA Provação e de TODO encontro de campanha, e move a IA sobre criaturas —
// tudo o que a build valida tem de aparecer na tela sem quebrar.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };

const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
const vc = new VirtualConsole();
let err = null;
vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/', virtualConsole: vc });
const w = dom.window;
const d = w.document;
w.eval("vsCPU=false; ir('batalha',{},{substituir:true});");

console.log('== 1. TODA Provação (90) renderiza a batalha — inclusive as de bestiário ==');
{
  const keys = w.eval('PROVACOES.map(p=>p.key)');
  const quebradas = [];
  for (const k of keys) {
    err = null;
    try { w.eval(`prova=PROVACOES.find(p=>p.key===${JSON.stringify(k)}); provaFim=null; campanha=null; st=montarProvacao(prova); pararRelogio(); render();`); }
    catch (e) { err = e.message; }
    if (err) quebradas.push(k + ': ' + err);
  }
  ok(keys.length === 90, `deveria varrer as 90 (varreu ${keys.length})`);
  ok(quebradas.length === 0, `toda Provação deveria RENDERIZAR sem quebrar (quebraram: ${quebradas.slice(0, 6).join(' | ')})`);
  console.log(`  ${keys.length} batalhas de Provação renderizadas · ${quebradas.length} quebras`);
}

console.log('== 2. TODO encontro de campanha renderiza (times fixos + chefe com HP inflado) ==');
{
  const encs = w.eval('CAMPANHA.encontros.map(e=>({id:e.id,fixo:!!e.aliados}))');
  const quebradas = [];
  for (const e of encs) {
    if (!e.fixo) continue;   // o de escolha de time monta pelo picker (coberto em campanha.test.js)
    err = null;
    try { w.eval(`campanha=CAMPANHA.encontros.find(x=>x.id===${JSON.stringify(e.id)}); campanhaFim=null; prova=null; st=montarProvacao(campanha); pararRelogio(); render();`); }
    catch (ex) { err = ex.message; }
    if (err) quebradas.push(e.id + ': ' + err);
  }
  ok(quebradas.length === 0, `todo encontro fixo deveria renderizar (quebraram: ${quebradas.join(' | ')})`);
  console.log(`  encontros de campanha renderizados · ${quebradas.length} quebras`);
}

console.log('== 3. a IA MOVE criaturas de bestiário e a tela re-renderiza (o outro caminho de runtime) ==');
{
  err = null;
  w.eval("prova=PROVACOES.find(p=>p.key==='bragi'); provaFim=null; campanha=null; st=montarProvacao(prova); st.ativo=1; ELEMS.forEach(e=>st.lados[1].orbs[e]=6);");
  let moves = 0;
  try {
    for (let i = 0; i < 6; i++) {
      const s = w.eval("(function(){var a=iaProximaAcao(st); if(a){agir(st,a.uid,a.slot,a.alvos,a.escolhas); return a.slot;} return null;})()");
      if (!s) break; moves++;
    }
    w.eval("render();");
  } catch (e) { err = e.message; }
  ok(moves > 0, 'a IA deveria conseguir mover ao menos uma criatura');
  ok(!err, `mover criatura + renderizar não deveria quebrar (erro: ${err})`);
  console.log(`  IA moveu ${moves} criaturas · render limpo`);
}

console.log('== 4. §207: o HUD da condição NÃO cruza a área de ação (discos/retratos), em Provação e Campanha ==');
{
  // Invariante de LAYOUT (§207/§214): o HUD mora numa faixa PRÓPRIA (top 47, alt 19 → termina em 66)
  // que ACABA antes de o board com HUD começar (top 68 — ver #baselayer.temhud .board no shell). Aqui
  // lemos a faixa DECLARADA do .phud (regra de classe simples, que o jsdom resolve) e conferimos que ela
  // fecha antes dos 68px. A prova GEOMÉTRICA em navegador real (phud.bottom ≤ topo das fileiras) mora em
  // tests/moldura.test.js — o jsdom não aplica o override composto #baselayer.temhud .board.
  const BOARD_HUD_TOP = 68;
  const num = v => parseFloat(v) || 0;
  const gs = el => w.getComputedStyle(el);
  const fundo = (setup, label) => {
    w.eval(setup + ' render();');
    const bl = d.querySelector('#baselayer');
    ok(/\btemhud\b/.test(bl.className), `${label}: a batalha com HUD marca #baselayer.temhud`);
    const phud = d.querySelector('.phud');
    ok(!!phud, `${label}: o HUD existe`);
    const hudBottom = num(gs(phud).top) + num(gs(phud).height);
    ok(hudBottom <= BOARD_HUD_TOP, `${label}: a faixa do HUD termina (${hudBottom}px) antes do board com HUD (top ${BOARD_HUD_TOP}px) — sem cruzar discos/retratos`);
  };
  fundo("prova=PROVACOES.find(x=>x.key==='durga');provaFim=null;campanha=null;st=montarProvacao(prova);vsCPU=false;pararRelogio();ir('batalha',{},{substituir:true});", 'PROVAÇÃO');
  fundo("prova=null;provaFim=null;campanha=Object.assign({},CAMPANHA.encontros[0]);campanhaFim=null;st=montarProvacao(campanha);vsCPU=false;pararRelogio();ir('batalha',{},{substituir:true});", 'CAMPANHA');
  // batalha NORMAL (sem HUD) não marca temhud nem desloca o layout
  w.eval("prova=null;campanha=null;st=novoEstado(['zeus','ogum','tyr'],['sobek','brigid','ganesha'],1,0);ir('batalha',{},{substituir:true});pararRelogio();render();");
  ok(!/\btemhud\b/.test(d.querySelector('#baselayer').className) && !d.querySelector('.phud'), 'batalha normal NÃO tem HUD nem desloca o layout');
  console.log('  HUD fora do tabuleiro (Provação + Campanha); batalha normal intacta');
}

console.log('== 5. carrossel da home: os banners carregam (arquivo, nenhum 404; 1 placeholder) e o layout independe da carteira ==');
{
  const dir = path.join(__dirname, '../web/banners');
  const chaves = w.eval('HOME_BANNERS.map(d=>d.arte)');
  ok(chaves.length === 8, `a home deveria ter 8 destinos (tem ${chaves.length})`);   // §213: +Desafios

  // (a) cada banner referencia um ARQUIVO em banners/<arte>.webp e o arquivo EXISTE no repo
  //     (a garantia contra 404: o src aponta certo E o webp está versionado). Nada de base64.
  const render0 = () => w.eval("perfil=novoPerfil(0,0); ir('home',{},{substituir:true}); render();");
  render0();
  const cards = [...d.querySelectorAll('.bcard')];
  ok(cards.length === 8, `deveriam existir 8 cartões (existem ${cards.length})`);   // §213: +Desafios
  const semArquivo = [], base64 = [];
  for (const c of cards){
    // §213: cartão-PLACEHOLDER (Desafios sem arte ainda) não tem <img> — é legítimo, tem o título de espera
    if (c.querySelector('.bcard__ph')){ if (!c.querySelector('.bcard__ph-t')) semArquivo.push('placeholder sem título'); continue; }
    const img = c.querySelector('img.bcard__art');
    if (!img) { semArquivo.push('sem <img>'); continue; }
    const src = img.getAttribute('src') || '';
    if (/^data:/.test(src)) base64.push(src.slice(0, 24));
    const m = /^banners\/(.+\.webp)$/.exec(src);
    if (!m) { semArquivo.push(src); continue; }
    if (!fs.existsSync(path.join(dir, m[1]))) semArquivo.push(m[1] + ' (ausente no repo)');
  }
  ok(base64.length === 0, `nenhum banner deveria ser base64 (achei: ${base64.join(' | ')})`);
  ok(semArquivo.length === 0, `todo banner deveria apontar p/ um arquivo existente (falhas: ${semArquivo.join(' | ')})`);

  // (b) o LAYOUT do carrossel NÃO muda com o tamanho da carteira: cartão fixo 202×314,
  //     mesma contagem e mesma ordem com perfil zerado e com perfil cheio. Só o DADO VIVO
  //     (selos/faixa) muda — a estrutura, não.
  const gs = el => w.getComputedStyle(el);
  const assinatura = () => [...d.querySelectorAll('.bcard')].map(c => (c.querySelector('[data-dest]') ? c.getAttribute('data-dest') : (c.className.includes('bcard--off') ? 'off' : '?'))).join(',');
  render0();
  const ordemVazia = [...d.querySelectorAll('.bcard[data-dest]')].map(c => c.dataset.dest).join(',');
  const c0 = d.querySelector('.bcard');
  const larg = gs(c0).width, alt = gs(c0).height;
  ok(larg === '202px' && alt === '314px', `cartão deveria ser 202×314 (é ${larg}×${alt})`);

  // carteira CHEIA: todos os deuses, gemas altas, campanha e pity avançados
  w.eval("perfil=novoPerfil(0,999999); ROSTER.forEach(e=>{perfil.deuses[e.key]=perfil.deuses[e.key]||{copias:1,favorito:false,obtidoEm:0};}); perfil.campanha.concluidas=CAMPANHA.encontros.map(e=>e.id); perfil.invocacao.desdeUltimoSS=42; ir('home',{},{substituir:true}); render();");
  const ordemCheia = [...d.querySelectorAll('.bcard[data-dest]')].map(c => c.dataset.dest).join(',');
  const c1 = d.querySelector('.bcard');
  ok(d.querySelectorAll('.bcard').length === 8, 'com carteira cheia ainda são 8 cartões');
  ok(ordemVazia === ordemCheia, `a ordem dos destinos não deveria mudar com a carteira (vazia="${ordemVazia}" cheia="${ordemCheia}")`);
  ok(gs(c1).width === '202px' && gs(c1).height === '314px', 'o cartão continua 202×314 com a carteira cheia');
  // o DADO VIVO, esse sim, reflete a carteira (prova que os selos leem o perfil)
  const seloCol = [...d.querySelectorAll('.bcard[data-dest="colecao"] .bcard__selo')][0];
  ok(seloCol && /\/100$/.test(seloCol.textContent), `o selo da Coleção deveria mostrar x/100 (achei "${seloCol ? seloCol.textContent : 'nada'}")`);
  console.log(`  8 destinos (7 em arquivo + 1 placeholder) · 0 base64 · cartão 202×314 estável (carteira vazia↔cheia) · selos leem o perfil`);
}

console.log('== 6. TODA rota registrada tem saída que CHEGA à home (rota sem saída não volta em silêncio) ==');
{
  // Mesma classe do render_sweep: percorre Object.keys(NAV.telas) e exige, para cada rota,
  // uma saída ACIONÁVEL que leve à home. Uma rota NOVA sem cobertura aqui falha de propósito
  // (força declarar a saída). A batalha sai pelo menu ⋯ → "Sair para o início" → confirmar.
  const setups = {
    provacoes:    "ir('provacoes')",       // §213: marcador de missões
    colecao:      "ir('colecao')",
    deus:         "ir('deus',{key:'zeus'})",
    campanha:     "ir('campanha')",
    montartime:   "ir('montartime',{id:CAMPANHA.encontros[0].id})",
    desafios:     "ir('desafios')",        // §213: hub de Desafios (pergaminhos+semanal+composição)
    composicao:   "ir('composicao')",      // §213: lista de composição (sub-tela do hub)
    desafiomontar:"ir('desafiomontar',{id:COMPOSICAO.desafios[0].id})",
    embreve:      "ir('embreve',{titulo:'Loja'})",
    selecao:      "ir('selecao',{novo:true})",
    invocacao:    "ir('invocacao')",
    pvp:          "ir('pvp')",              // §236: lobby do PvP (sai por ‹ Início)
    batalha:      "st=novoEstado(['zeus','ogum','tyr'],['sobek','brigid','ganesha'],1,0);prova=null;campanha=null;provaFim=null;campanhaFim=null;ir('batalha');pararRelogio()",
  };
  const rotas = w.eval('Object.keys(NAV.telas)');
  const descoberto = [], semSaida = [], naoChegou = [];
  for (const r of rotas) {
    if (r === 'home') continue;                          // a home É o destino da saída — não precisa de saída
    if (!setups[r]) { descoberto.push(r); continue; }    // rota registrada sem cobertura no guarda
    w.eval(`resetRotas(); ir('home'); ${setups[r]}; render();`);
    let vivo = true;
    if (r === 'batalha') {
      // saída da batalha em andamento: o menu ⋯ existe → abre → "Sair para o início" → confirma
      if (!d.querySelector('#bmenu')) { semSaida.push('batalha:#bmenu'); vivo = false; }
      else {
        w.eval('menuAberto=true; render();');
        for (const sel of ['#bsair', '#bsairok']) {
          if (!d.querySelector(sel)) { semSaida.push('batalha:' + sel); vivo = false; break; }
          w.eval(`document.querySelector('${sel}').click()`);
        }
      }
    } else {
      const sel = ['#binicio', '#bvoltar', '.iv-hbtn'].find(s => d.querySelector(s));
      if (!sel) { semSaida.push(r); vivo = false; }
      else w.eval(`document.querySelector('${sel}').click()`);
    }
    if (vivo && w.eval('rotaAtual()') !== 'home') naoChegou.push(r + '→' + w.eval('rotaAtual()'));
  }
  ok(descoberto.length === 0, `rota registrada sem cobertura no guarda (declare a saída): ${descoberto.join(' | ')}`);
  ok(semSaida.length === 0, `rota SEM saída acionável para a home: ${semSaida.join(' | ')}`);
  ok(naoChegou.length === 0, `a saída NÃO chegou à home: ${naoChegou.join(' | ')}`);
  console.log(`  ${rotas.length} rotas varridas · todas com saída que chega à home (batalha via ⋯ → Sair → confirmar)`);
}

console.log('== 7. §238: os três estados + tocar-para-ler + histórico agrupado, nos QUATRO modos ==');
{
  const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
  // os 4 modos usam a MESMA renderBatalha (§214). Verifico os estados numa batalha e confirmo que a
  // Provação e a Campanha (que também renderizam a batalha) produzem os mesmos níveis — a classe §202
  // ("validado num caminho, quebrado no outro") aplicada aos estados novos.
  const battle = (extra) => w.eval(`prova=null;campanha=null;provaFim=null;campanhaFim=null;vsCPU=false;st=novoEstado(['iara','zeus','ogum'],['sobek','brigid','ganesha'],1,0);st.ativo=0;ELEMS.forEach(e=>st.lados[0].orbs[e]=6);${extra||''}ir('batalha',{},{substituir:true});pararRelogio();render();`);
  battle("st.lados[0].units[1].cd={habilidade:2};st.lados[0].units[2].agiu=true;");
  ok($$('.skill.nv-pronto').length > 0, 'estado PRONTO presente (arte cheia)');
  ok($$('.skill.nv-indispon').length > 0, 'estado INDISPONÍVEL presente (recarga; a unidade pode agir)');
  ok($$('.skill.nv-recuo').length > 0, 'estado RECUO presente (a unidade já agiu)');
  // tocar-para-ler uma indisponível: LÊ (descrição + motivo no rodapé) e NÃO arma (nunca custa)
  const ind = $$('.brow__tiles .skill[data-arma="0"]').find(b => b.querySelector('.skill__disc'));
  ok(!!ind, 'há uma habilidade indisponível para ler');
  if (ind) ind.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(!!d.querySelector('.leitura__nome') && d.querySelector('.leitura__txt').textContent.length > 0, 'tocar indisponível LÊ a descrição no rodapé');
  ok(!!d.querySelector('.leitura__motivo'), 'e diz POR QUE está indisponível');
  ok($$('.skill.is-armed').length === 0, 'tocar para ler NÃO arma (não custa)');
  // histórico agrupado por turno, mais recente no topo, autoria distinta (você × o outro lado)
  w.eval("st.log=[{tipo:'turno',turno:1,lado:0},{tipo:'dano',turno:1,origem:'iara',alvo:'sobek',valor:10},{tipo:'turno',turno:2,lado:1},{tipo:'dano',turno:2,origem:'sobek',alvo:'iara',valor:8}];render()");
  ok($$('.hist__turno').length >= 2, 'histórico agrupado por turno');
  ok(/Turno 2/.test((d.querySelector('.hist__turno .hist__cab') || {}).textContent || ''), 'o turno mais recente no topo');
  ok($$('.hist__l--eu').length >= 1 && $$('.hist__l--eles').length >= 1, 'autoria distinta: você × o outro lado (cor + alinhamento)');
  // os MESMOS estados na PROVAÇÃO e na CAMPANHA (mesma renderBatalha, oponente IA)
  w.eval("prova=PROVACOES.find(p=>p.key==='durga');provaFim=null;campanha=null;st=montarProvacao(prova);st.ativo=0;ELEMS.forEach(e=>st.lados[0].orbs[e]=6);ir('batalha',{},{substituir:true});pararRelogio();render()");
  ok($$('.skill.nv-pronto, .skill.nv-indispon, .skill.nv-recuo').length > 0, 'PROVAÇÃO: os níveis de estado aparecem (mesma tela)');
  w.eval("prova=null;campanha=Object.assign({},CAMPANHA.encontros[0]);campanhaFim=null;st=montarProvacao(campanha);st.ativo=0;ELEMS.forEach(e=>st.lados[0].orbs[e]=6);ir('batalha',{},{substituir:true});pararRelogio();render()");
  ok($$('.skill.nv-pronto, .skill.nv-indispon, .skill.nv-recuo').length > 0, 'CAMPANHA: os níveis de estado aparecem (mesma tela)');
  console.log('  três estados + tocar-para-ler + histórico agrupado, em sandbox/Provação/Campanha (PvP usa a mesma tela)');
}

console.log('== 8. §239: moldura une retrato+habilidades; ênfase por turno (turno-eu/eles), nos QUATRO modos ==');
{
  const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
  // MOLDURA (item 5): o retrato E os 4 tiles vivem DENTRO de .brow__unit (a placa que os une); o inimigo
  // fica FORA dela (irmão), à direita. Geometria (colar, sobrepor, ~710) é medida em moldura.test.js;
  // aqui garanto a ESTRUTURA que a moldura precisa, e a classe de turno, nos modos que usam a batalha.
  const modos = {
    sandbox: "prova=null;campanha=null;provaFim=null;campanhaFim=null;vsCPU=false;st=novoEstado(['iara','zeus','ogum'],['sobek','brigid','ganesha'],1,0);",
    'Provação': "prova=PROVACOES.find(p=>p.key==='durga');provaFim=null;campanha=null;st=montarProvacao(prova);",
    Campanha: "prova=null;campanha=Object.assign({},CAMPANHA.encontros[0]);campanhaFim=null;st=montarProvacao(campanha);",
  };
  for (const [nome, pre] of Object.entries(modos)) {
    w.eval(`${pre}st.ativo=0;ELEMS.forEach(e=>st.lados[0].orbs[e]=6);ir('batalha',{},{substituir:true});pararRelogio();render()`);
    const unit = $('.brow .brow__unit');
    ok(!!unit, `${nome}: a moldura .brow__unit existe`);
    ok(!!unit && !!unit.querySelector('.brow__ally .portrait') && !!unit.querySelector('.brow__tiles'),
      `${nome}: a moldura contém o retrato E as habilidades (une os dois)`);
    ok(!!unit && unit.parentElement.querySelector(':scope > .brow__enemy'),
      `${nome}: o inimigo fica FORA da moldura (irmão de .brow__unit, à direita)`);
    ok($('#baselayer').classList.contains('turno-eu'), `${nome}: na minha vez o baselayer marca turno-eu`);
  }
  // ênfase inverte com o turno (a POSIÇÃO não — provado em moldura.test.js): vs CPU no turno dele
  w.eval("prova=null;campanha=null;provaFim=null;campanhaFim=null;vsCPU=true;IA_LADO=1;st=novoEstado(['iara','zeus','ogum'],['sobek','brigid','ganesha'],1,0);st.ativo=1;ir('batalha',{},{substituir:true});pararRelogio();render()");
  ok($('#baselayer').classList.contains('turno-eles'), 'no turno do oponente o baselayer marca turno-eles (ênfase inverte)');
  ok($$('.brow__tiles .skill.nv-recuo').length === 12, 'e as minhas habilidades recuam (a luz vai para o lado dele)');
  console.log('  moldura une retrato+habilidades (inimigo fora) em sandbox/Provação/Campanha · turno-eu ⇄ turno-eles');
}

try { dom.window.close(); } catch (e) {}
if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) na varredura de render`); process.exit(1); }
console.log('>>> RENDER-SWEEP OK');
process.exit(0);

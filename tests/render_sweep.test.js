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

console.log('== 1. TODA Provação (100, §245: acervo completo) renderiza a batalha — inclusive as de bestiário ==');
{
  const keys = w.eval('PROVACOES.map(p=>p.key)');
  const quebradas = [];
  for (const k of keys) {
    err = null;
    try { w.eval(`prova=PROVACOES.find(p=>p.key===${JSON.stringify(k)}); provaFim=null; campanha=null; st=montarProvacao(prova); pararRelogio(); render();`); }
    catch (e) { err = e.message; }
    if (err) quebradas.push(k + ': ' + err);
  }
  ok(keys.length === 100, `deveria varrer as 100 (varreu ${keys.length})`);
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

console.log('== 4. §330: o HUD de modo SAIU da batalha — o modo vai p/ a sublinha do nome e o prazo p/ a linha do ENCERRAR ==');
{
  // §330: não há mais faixa de HUD (.phud) nem a classe temhud. O que o HUD mostrava foi para:
  //   - modo + progresso → sublinha do nome do jogador (.bt-name--me .bt-name__sub);
  //   - número do turno + prazo → a linha do botão ENCERRAR (.bt-encerrar__linha).
  const fundo = (setup, rotulo, label) => {
    w.eval(setup + ' render();');
    const bl = d.querySelector('#baselayer');
    ok(!/\btemhud\b/.test(bl.className), `${label}: a batalha não marca mais #baselayer.temhud`);
    ok(!d.querySelector('.phud'), `${label}: não há mais a faixa de HUD (.phud)`);
    const sub = d.querySelector('.bt-name--me .bt-name__sub');
    ok(!!sub && new RegExp(rotulo, 'i').test(sub.textContent), `${label}: o modo aparece na sublinha do nome ("${sub ? sub.textContent.trim() : ''}")`);
  };
  fundo("prova=PROVACOES.find(x=>x.key==='durga');provaFim=null;campanha=null;dominio=null;st=montarProvacao(prova);vsCPU=false;pararRelogio();ir('batalha',{},{substituir:true});", 'RITO', 'PROVAÇÃO');
  // o prazo (T/N) foi para a linha do ENCERRAR
  const lin = d.querySelector('.bt-encerrar__linha');
  ok(!!lin && /Turno\s*1\s*\/\s*14/.test(lin.textContent.replace(/\s+/g,' ')), `PROVAÇÃO: a linha do ENCERRAR mostra o prazo ("${lin ? lin.textContent.trim() : ''}")`);
  fundo("prova=null;provaFim=null;campanha=Object.assign({},CAMPANHA.encontros[0]);campanhaFim=null;dominio=null;st=montarProvacao(campanha);vsCPU=false;pararRelogio();ir('batalha',{},{substituir:true});", 'CAMPANHA', 'CAMPANHA');
  // batalha NORMAL (sem modo): sublinha = SANDBOX, sem phud/temhud
  w.eval("prova=null;campanha=null;dominio=null;st=novoEstado(['zeus','ogum','tyr'],['sobek','brigid','ganesha'],1,0);ir('batalha',{},{substituir:true});pararRelogio();render();");
  ok(!/\btemhud\b/.test(d.querySelector('#baselayer').className) && !d.querySelector('.phud'), 'batalha normal NÃO tem HUD nem desloca o layout');
  console.log('  modo na sublinha do nome · prazo na linha do ENCERRAR · sem .phud/.temhud');
}

console.log('== 5. MAPA da home (§306/§326): os 9 ícones carregam (arquivo, nenhum 404), 1 "em breve" (só Loja) não abre, e o layout independe da carteira ==');
{
  const dirIc = path.join(__dirname, '../web/mapa');
  ok(w.eval('MAPA_ARTE') === 1, 'a arte do mapa (web/banners/mapa.webp) deveria estar versionada → MAPA_ARTE=1');
  ok(fs.existsSync(path.join(__dirname, '../web/banners/mapa.webp')), 'web/banners/mapa.webp existe no repo (contra 404)');

  const render0 = () => w.eval("perfil=novoPerfil(0,0); ir('home',{},{substituir:true}); render();");
  render0();
  ok(!!d.querySelector('.mapa'), 'com MAPA_ARTE=1, render() desenha o MAPA (não o carrossel)');
  ok(!d.querySelector('.hscroll'), 'o carrossel (.hscroll) NÃO aparece no mapa (§306: o carrossel saiu)');
  const ilhas = [...d.querySelectorAll('.ilha')];
  ok(ilhas.length === 9, `o mapa deveria ter 9 ilhas (tem ${ilhas.length})`);   // §306: 9 destinos

  // (a) o FUNDO e cada ÍCONE referenciam ARQUIVO existente no repo (contra 404); nada de base64.
  const artSrc = d.querySelector('.mapa__art').getAttribute('src') || '';
  ok(artSrc === 'banners/mapa.webp', `a arte do mapa deveria apontar banners/mapa.webp (é "${artSrc}")`);
  const semArquivo = [], base64 = [];
  let comIcone = 0;
  for (const im of [...d.querySelectorAll('img.ilha__ic')]){
    const src = im.getAttribute('src') || '';
    if (/^data:/.test(src)) base64.push(src.slice(0, 24));
    const m = /^mapa\/(.+\.webp)$/.exec(src);
    if (!m) { semArquivo.push(src || 'sem src'); continue; }
    if (!fs.existsSync(path.join(dirIc, m[1]))) { semArquivo.push(m[1] + ' (ausente no repo)'); continue; }
    comIcone++;
  }
  ok(base64.length === 0, `nenhum ícone deveria ser base64 (achei: ${base64.join(' | ')})`);
  ok(semArquivo.length === 0, `todo ícone deveria apontar p/ um arquivo existente (falhas: ${semArquivo.join(' | ')})`);
  ok(comIcone === 9, `os 9 ícones deveriam ter arquivo em web/mapa/ (tem ${comIcone})`);

  // (b) §326: só a Loja fica "em breve" (<div> sem data-dest), com a tag "em breve" e SEM vermelho/erro.
  //     Os outros 8 (Domínios incluído, destravado no §326) navegam.
  const breve = [...d.querySelectorAll('.ilha--breve')];
  const breveChaves = breve.map(x => x.querySelector('.ilha__nome').textContent).sort().join(',');
  ok(breveChaves === 'Loja', `só a Loja deveria ser "em breve" (achei: ${breveChaves}) — §326 destravou Domínios`);
  ok(breve.every(x => x.tagName === 'DIV' && !x.hasAttribute('data-dest')), 'a ilha "em breve" é <div> sem data-dest (não foca, não navega)');
  ok(breve.every(x => !!x.querySelector('.ilha__breveTag')), 'a "em breve" mostra a tag · em breve');
  const vermelho = breve.filter(x => { const c = w.getComputedStyle(x.querySelector('.ilha__breveTag')).color || ''; return /rgb\(2\d\d,\s*[0-5]?\d,/.test(c) || /red|crimson/i.test(c); });
  ok(vermelho.length === 0, 'a tag "em breve" NUNCA é vermelha (§306: indisponível, não defeito)');
  const navegaveis = [...d.querySelectorAll('.ilha[data-dest]')].map(x => x.dataset.dest).sort().join(',');
  ok(navegaveis === 'campanha,colecao,desafios,dominios,invocacao,provacoes,pvp,treino', `os 8 destinos vivos deveriam navegar (achei: ${navegaveis})`);

  // (c) o LAYOUT do mapa NÃO muda com o tamanho da carteira: mesmas 9 ilhas, mesmas posições
  //     (left/top em % da arte). Só o DADO VIVO (contadores) muda — a estrutura, não.
  const posicoes = () => [...d.querySelectorAll('.ilha')].map(x => `${x.dataset.dest||x.querySelector('.ilha__nome').textContent}@${x.style.left},${x.style.top}`).join('|');
  const posVazia = posicoes();
  // carteira CHEIA: todos os deuses, gemas altas, campanha e pity avançados
  w.eval("perfil=novoPerfil(0,999999); ROSTER.forEach(e=>{perfil.deuses[e.key]=perfil.deuses[e.key]||{copias:1,favorito:false,obtidoEm:0};}); perfil.campanha.concluidas=CAMPANHA.encontros.map(e=>e.id); perfil.invocacao.desdeUltimoSS=42; ir('home',{},{substituir:true}); render();");
  ok(d.querySelectorAll('.ilha').length === 9, 'com carteira cheia ainda são 9 ilhas');
  ok(posVazia === posicoes(), 'as posições das ilhas não mudam com a carteira (âncoras em % da arte, §306)');
  // o DADO VIVO, esse sim, reflete a carteira (prova que os contadores leem o perfil)
  const contCol = d.querySelector('.ilha[data-dest="colecao"] .ilha__cont');
  ok(contCol && /\/100$/.test(contCol.textContent), `o contador da Coleção deveria mostrar x/100 (achei "${contCol ? contCol.textContent : 'nada'}")`);
  console.log(`  9 ilhas (9 ícones em arquivo) · 0 base64 · 1 "em breve" inerte (só Loja) · posições estáveis (carteira vazia↔cheia) · contadores leem o perfil`);

  // (d) FALLBACK §306: sem a arte do mapa, a home cai no CARROSSEL de hoje (sem 404, pacote não cresce).
  //     Como MAPA_ART é const, exercemos a FUNÇÃO de fallback direto (o galho que renderHome escolhe quando falta a arte).
  const dirB = path.join(__dirname, '../web/banners');
  w.eval("perfil=novoPerfil(0,0); ir('home',{},{substituir:true}); renderHomeCarrossel();");
  const cards = [...d.querySelectorAll('.bcard')];
  ok(cards.length === 9, `o fallback (carrossel) deveria ter 9 cartões (tem ${cards.length})`);
  const fbBase64 = [], fbSemArq = []; let fbPh = 0;
  for (const c of cards){
    if (c.querySelector('.bcard__ph')){ fbPh++; continue; }
    const img = c.querySelector('img.bcard__art'); const src = img ? (img.getAttribute('src') || '') : '';
    if (/^data:/.test(src)) fbBase64.push(src.slice(0,24));
    const m = /^banners\/(.+\.webp)$/.exec(src);
    if (!m || !fs.existsSync(path.join(dirB, m[1]))) fbSemArq.push(src || 'sem <img>');
  }
  ok(fbBase64.length === 0, `o fallback não usa base64 (achei: ${fbBase64.join(' | ')})`);
  ok(fbSemArq.length === 0, `todo banner do fallback aponta p/ arquivo existente (falhas: ${fbSemArq.join(' | ')})`);
  ok(fbPh === 1, `no fallback só Domínios é placeholder (§274) — achei ${fbPh}`);
  console.log('  fallback do carrossel intacto: 9 cartões, 0 base64, Domínios placeholder, sem 404');
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
    niveis:       "ir('niveis',{key:'zeus'})",   // §319c: tela de NÍVEIS (rota própria; sai por ‹ <Nome> → ficha → home)
    campanha:     "ir('campanha')",
    dominios:     "ir('dominios')",        // §274: tela de SELEÇÃO dos Domínios — sai por ‹ Início
    dominio:      "ir('dominio',{cultura:'grega'})",   // §274: HUB de um Domínio — sai por ‹ Voltar
    montartime:   "ir('montartime',{id:CAMPANHA.encontros[0].id})",
    dominiomontar:"ir('dominiomontar',{cultura:'grega'})",   // §325: MONTAR TIME — sai por ‹ Voltar ao HUB, e o hub à home (duas etapas)
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
    } else if (r === 'dominiomontar') {
      // §325: MONTAR TIME sai para o HUB do Domínio, e o hub sai para a home — duas etapas.
      if (!d.querySelector('#bvoltar')) { semSaida.push('dominiomontar:#bvoltar'); vivo = false; }
      else {
        w.eval("document.querySelector('#bvoltar').click()");   // montar → hub
        if (w.eval("rotaAtual()") !== 'dominio') { naoChegou.push('dominiomontar→' + w.eval('rotaAtual()') + ' (esperava o hub)'); vivo = false; }
        else if (!d.querySelector('#bvoltar')) { semSaida.push('dominiomontar:hub#bvoltar'); vivo = false; }
        else w.eval("document.querySelector('#bvoltar').click()");   // hub → home
      }
    } else if (r === 'niveis') {
      // §319c: a tela de NÍVEIS sai para a FICHA do deus ('deus'), e a ficha sai para a home — duas etapas.
      if (!d.querySelector('#bvoltar')) { semSaida.push('niveis:#bvoltar'); vivo = false; }
      else {
        w.eval("document.querySelector('#bvoltar').click()");   // niveis → ficha
        if (w.eval("rotaAtual()") !== 'deus') { naoChegou.push('niveis→' + w.eval('rotaAtual()') + ' (esperava a ficha)'); vivo = false; }
        else if (!d.querySelector('#bvoltar')) { semSaida.push('niveis:ficha#bvoltar'); vivo = false; }
        else w.eval("document.querySelector('#bvoltar').click()");   // ficha → home
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
  // §329: os três estados §238 agora são classes do botão (.bt-skill): is-ready (pronta), is-cooldown (recarga),
  // e o RECUO (a unidade já agiu) marca o RETRATO (.bt-portrait--ally.acted) — o layout refez a hierarquia.
  ok($$('.bt-skill.is-ready').length > 0, 'estado PRONTO presente (habilidade disponível)');
  ok($$('.bt-skill.is-cooldown').length > 0, 'estado INDISPONÍVEL presente (recarga; a unidade pode agir)');
  ok($$('.bt-portrait--ally.acted').length > 0, 'estado RECUO presente (a unidade já agiu — retrato marcado)');
  // tocar-para-ler uma indisponível: LÊ (descrição + motivo no painel de baixo) e NÃO arma (nunca custa)
  const ind = $$('.bt-skill[data-arma="0"]').find(b => b.querySelector('.bt-skill__disc'));
  ok(!!ind, 'há uma habilidade indisponível para ler');
  if (ind) ind.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(!!d.querySelector('.bt-panel__titulo') && d.querySelector('.bt-panel__desc').textContent.length > 0, 'tocar indisponível LÊ a descrição no painel de baixo');
  ok(!!d.querySelector('.bt-panel__motivo'), 'e diz POR QUE está indisponível');
  ok($$('.bt-skill.is-armed').length === 0, 'tocar para ler NÃO arma (não custa)');
  // §299: o histórico agrupado (§238) mudou de casa — o painel lateral saiu, agora vive no ≡ REGISTRO.
  // Continua agrupado por turno, mais recente no topo, autoria distinta (você × o outro lado).
  w.eval("st.log=[{tipo:'turno',turno:1,lado:0},{tipo:'dano',turno:1,origem:'iara',alvo:'sobek',valor:10},{tipo:'turno',turno:2,lado:1},{tipo:'dano',turno:2,origem:'sobek',alvo:'iara',valor:8}];ov='log';render()");
  ok($$('.hist__turno').length >= 2, 'histórico agrupado por turno (no ≡ REGISTRO)');
  ok(/Turno 2/.test((d.querySelector('.hist__turno .hist__cab') || {}).textContent || ''), 'o turno mais recente no topo');
  ok($$('.hist__l--eu').length >= 1 && $$('.hist__l--eles').length >= 1, 'autoria distinta: você × o outro lado (cor + alinhamento)');
  // os MESMOS estados na PROVAÇÃO e na CAMPANHA (mesma renderBatalha, oponente IA)
  w.eval("prova=PROVACOES.find(p=>p.key==='durga');provaFim=null;campanha=null;st=montarProvacao(prova);st.ativo=0;ELEMS.forEach(e=>st.lados[0].orbs[e]=6);ir('batalha',{},{substituir:true});pararRelogio();render()");
  ok($$('.bt-skill.is-ready, .bt-skill.is-cooldown, .bt-skill.is-off').length > 0, 'PROVAÇÃO: os estados das habilidades aparecem (mesma tela)');
  w.eval("prova=null;campanha=Object.assign({},CAMPANHA.encontros[0]);campanhaFim=null;st=montarProvacao(campanha);st.ativo=0;ELEMS.forEach(e=>st.lados[0].orbs[e]=6);ir('batalha',{},{substituir:true});pararRelogio();render()");
  ok($$('.bt-skill.is-ready, .bt-skill.is-cooldown, .bt-skill.is-off').length > 0, 'CAMPANHA: os estados das habilidades aparecem (mesma tela)');
  console.log('  três estados + tocar-para-ler + histórico agrupado, em sandbox/Provação/Campanha (PvP usa a mesma tela)');
}

console.log('== 8. §329: campo com retratos + habilidades do jogador e inimigo; ênfase por turno (turno-eu/eles), nos QUATRO modos ==');
{
  const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
  // §329: obsoleto — a moldura .brow__unit que unia retrato+habilidades (e o inimigo "fora" dela) foi refeita.
  // Agora retrato, vida, efeitos e habilidades são IRMÃOS absolutos em #baselayer.bt. Aqui garanto a ESTRUTURA do
  // campo (3 retratos do jogador + 12 habilidades + 3 retratos do inimigo) e a classe de turno, nos modos de batalha.
  const modos = {
    sandbox: "prova=null;campanha=null;provaFim=null;campanhaFim=null;vsCPU=false;st=novoEstado(['iara','zeus','ogum'],['sobek','brigid','ganesha'],1,0);",
    'Provação': "prova=PROVACOES.find(p=>p.key==='durga');provaFim=null;campanha=null;st=montarProvacao(prova);",
    Campanha: "prova=null;campanha=Object.assign({},CAMPANHA.encontros[0]);campanhaFim=null;st=montarProvacao(campanha);",
  };
  for (const [nome, pre] of Object.entries(modos)) {
    w.eval(`${pre}st.ativo=0;ELEMS.forEach(e=>st.lados[0].orbs[e]=6);ir('batalha',{},{substituir:true});pararRelogio();render()`);
    const nAliados = w.eval('st.lados[0].units.length'), nInimigos = w.eval('st.lados[1].units.length');
    ok($$('.bt-portrait--ally').length === nAliados, `${nome}: os ${nAliados} retratos do jogador renderizam`);
    ok($$('.bt-skill').length === nAliados * 4, `${nome}: as habilidades do jogador renderizam (4 por retrato)`);
    ok($$('.bt-portrait--foe').length === nInimigos, `${nome}: os ${nInimigos} retratos do inimigo renderizam (lado oposto)`);
    ok($('#baselayer').classList.contains('turno-eu'), `${nome}: na minha vez o baselayer marca turno-eu`);
  }
  // ênfase inverte com o turno (a POSIÇÃO não — provado em moldura.test.js): vs CPU no turno dele
  w.eval("prova=null;campanha=null;provaFim=null;campanhaFim=null;vsCPU=true;IA_LADO=1;st=novoEstado(['iara','zeus','ogum'],['sobek','brigid','ganesha'],1,0);st.ativo=1;ir('batalha',{},{substituir:true});pararRelogio();render()");
  ok($('#baselayer').classList.contains('turno-eles'), 'no turno do oponente o baselayer marca turno-eles (ênfase inverte)');
  ok($$('.bt-skill[data-dead="1"]').length === 12, 'e as minhas habilidades ficam mortas (não respondem) no turno dele');
  console.log('  campo com retratos+habilidades (jogador e inimigo) em sandbox/Provação/Campanha · turno-eu ⇄ turno-eles');
}

try { dom.window.close(); } catch (e) {}
if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) na varredura de render`); process.exit(1); }
console.log('>>> RENDER-SWEEP OK');
process.exit(0);

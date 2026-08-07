// ui/selecao.js — grade de coleção, filtro combinável, montagem de time, kit.
const POR_PAG=30;
const RMAP={}; ROSTER.forEach(e=>RMAP[e.key]=e);
const KITMAP={}; if(typeof KITS!=='undefined')KITS.forEach(k=>KITMAP[k.key]=k);   // kit de design dos 100
const temKit=k=>!!GODS[k];
let pagina=0, filtro=0, tocado=null, vez=0, tudoLiberado=false;   // abre em LIBERADOS
let focoPk=null;   // deus com o painel de kit aberto na seleção
const FACCOES=['Grega','Nórdica','Egípcia','Japonesa','Chinesa','Hindu','Brasileira','Africana','Celta','Maia'];
const FUNCOES=['Atacante','Guardião','Suporte','Controlador','Manipulador'];
const CLASSES_G=['Físico','Mágico','Híbrido'];
const ESTADOS=[['liberados','Liberados'],['todos','Todos'],['bloqueados','Bloqueados']];
let F={estado:'liberados',faccoes:new Set(),elems:new Set(),funcoes:new Set(),classes:new Set()};
let painelFiltro=false;
function eixosAtivos(){return F.faccoes.size+F.elems.size+F.funcoes.size+F.classes.size;}
function limparFiltro(){F={estado:'liberados',faccoes:new Set(),elems:new Set(),funcoes:new Set(),classes:new Set()};}

function liberado(k){return tudoLiberado?temKit(k):!!RMAP[k].inicial;}
function jogavel(k){return liberado(k)&&temKit(k);}
function listaFiltrada(){
  return ROSTER.filter(e=>{
    if(F.estado==='liberados'&&!liberado(e.key))return false;
    if(F.estado==='bloqueados'&&liberado(e.key))return false;
    if(F.faccoes.size&&!F.faccoes.has(e.faccao))return false;
    if(F.elems.size&&!F.elems.has(e.elem))return false;
    if(F.funcoes.size&&!F.funcoes.has(e.funcao))return false;
    if(F.classes.size&&!F.classes.has(e.classe))return false;
    return true;
  }).map(e=>e.key);
}
function donoDe(k){return pick[0].includes(k)?0:pick[1].includes(k)?1:null;}

function tileHTML(k){
  const g=RMAP[k], liv=liberado(k), kit=temKit(k), dono=donoDe(k);
  const cls=['pk'];
  if(k===focoPk)cls.push('foco');
  if(liv&&kit)cls.push('livre'); else cls.push('trancado');
  if(liv&&!kit)cls.push('semkit');
  if(dono===0)cls.push('on'); if(dono===1)cls.push('on2');
  return `<button class="${cls.join(' ')}" data-k="${k}" title="${H(g.nome)}">
    <span class="pk__p">${slot('god-'+k,ini(g.nome),liv?COR(g.elem):'#8d84ad',24)}</span>
    <span class="pk__el" style="background:${COR(g.elem)}"></span>
    ${liv?(kit?'':'<span class="pk__wip">WIP</span>'):'<span class="pk__lock">\u26bf</span>'}
    ${dono!==null?`<span class="pk__mark">${dono+1}</span>`:''}
    <span class="pk__n">${H(g.nome)}</span>
  </button>`;
}

function infoHTML(){
  if(!tocado)return F.estado==='liberados'&&!eixosAtivos()
    ? `Seus ${ROSTER.map(e=>e.key).filter(liberado).length} deuses liberados. Abra o FILTRO e escolha "Todos" para ver os ${ROSTER.length} do roster \u2014 os bloqueados mostram como desbloquear.`
    : `Toque num deus para ver quem é. Os apagados estão bloqueados \u2014 desbloqueie pela Provação ou por invocação.`;
  const g=RMAP[tocado], liv=liberado(tocado), kit=temKit(tocado), dono=donoDe(tocado);
  const base=`<b>${H(g.nome.toUpperCase())}</b> \u00b7 ${H(g.faccao)} \u00b7 ${H(ELAB[g.elem])} \u00b7 ${H(g.classe)} \u00b7 ${H(g.funcao)}`;
  if(!liv){
    const p=g.prov;
    return base+` \u2014 <i>BLOQUEADO.</i> ${p?`${H(p.nivel)} "${H(p.nome)}" (dificuldade ${p.dif}${p.req&&p.req!=='\u2014'?', requisito: '+H(p.req):''}): ${H(p.cond)}`:'Desbloqueie pela Provação dele ou por invocação.'}`;
  }
  if(!kit)return base+` \u2014 <i>kit ainda não implementado no protótipo.</i> ${GODS_FEITOS} de 100 prontos.`;
  if(dono!==null&&dono!==vez)return base+` \u2014 <i>já escolhido pelo Jogador ${dono+1}.</i>`;
  return base+` \u2014 ${H(GODS[tocado].passiva.nome)}: ${H(GODS[tocado].passiva.desc)}`;
}
const GODS_FEITOS=Object.keys(GODS).length;

function painelFiltroHTML(){
  if(!painelFiltro)return '';
  const n=listaFiltrada().length;
  const grupo=(rot,chips)=>`<div class="fgrp"><span class="fgrp__l">${rot}</span>
    <div class="fgrp__c">${chips}</div></div>`;
  const chipEstado=ESTADOS.map(([v2,rot])=>{
    const c=ROSTER.filter(e=>v2==='todos'||(v2==='liberados'?liberado(e.key):!liberado(e.key))).length;
    return `<button class="chip2 ${F.estado===v2?'on':''}" data-fe="${v2}">${rot}
      <span class="chip2__n">${c}</span></button>`;}).join('');
  const chipSet=(campo,itens,cor)=>itens.map(it=>{
    const c=ROSTER.filter(e=>e[campo==='faccoes'?'faccao':campo==='elems'?'elem':campo==='funcoes'?'funcao':'classe']===it).length;
    return `<button class="chip2 ${F[campo].has(it)?'on':''}" data-fs="${campo}|${it}">
      ${cor?`<span class="chip2__d" style="background:${COR(it)}"></span>`:''}${H(it)}
      <span class="chip2__n">${c}</span></button>`;}).join('');
  return `<div class="fpanel" id="fpanel"><div class="fbox">
    <div class="fbox__h"><h2>FILTRAR</h2>
      <span class="fbox__n"><b>${n}</b> de ${ROSTER.length} deuses</span>
      <span class="push">
        <button class="b b--quiet b--md" id="flimpar">Limpar</button>
        <button class="b b--primary b--md" id="ffechar">Pronto</button></span></div>
    <div class="fbox__b">
      ${grupo('ESTADO',chipEstado)}
      ${grupo('PANTEÃO',chipSet('faccoes',FACCOES,false))}
      ${grupo('ELEMENTO',chipSet('elems',ELEMS,true))}
      ${grupo('FUNÇÃO',chipSet('funcoes',FUNCOES,false))}
      ${grupo('CLASSE',chipSet('classes',CLASSES_G,false))}
    </div></div></div>`;
}

/* ---- painel do kit (1 toque em qualquer deus, inclusive bloqueado) ---- */
function painelKitHTML(){
  if(!focoPk)return '';
  const k=focoPk, g=RMAP[k], kit=KITMAP[k], liv=liberado(k), jog=jogavel(k), dono=donoDe(k);
  const rar=(typeof RARIDADE!=='undefined'&&RARIDADE[k])||'';
  const linha=(rot,a)=>a?`<div class="krow"><div class="krow__h"><span class="krow__rot">${rot}</span><b>${H(a.nome)}</b>
      <span class="krow__meta">${pipsDetalhe(custoParaCost(a.custo))}${a.recarga?`<span class="krow__cd">recarga ${a.recarga}</span>`:''}</span></div>
      <div class="krow__t">${H(a.efeito)}</div></div>`:'';
  let acao;
  if(dono!==null) acao=`<button class="b b--danger b--md" id="kitdel">Remover (J${dono+1})</button>`;
  else if(!liv) acao=`<button class="b b--quiet b--md" disabled>Bloqueado</button>`;
  else if(!jog) acao=`<button class="b b--quiet b--md" disabled>Kit em produção</button>`;
  else if(pick[0].length>=3&&pick[1].length>=3) acao=`<button class="b b--quiet b--md" disabled>Times cheios</button>`;
  else acao=`<button class="b b--primary b--md" id="kitadd">Adicionar (J${(pick[vez].length<3?vez:1-vez)+1})</button>`;
  return `<div class="kpanel" id="kpanel"><div class="kbox">
    <div class="kbox__h">
      <span class="kbox__p">${slot('god-'+k,ini(g.nome),liv?COR(g.elem):'#8d84ad',30)}</span>
      <div class="kbox__id"><h2>${H(g.nome)}${rar?` <span class="kbox__rar">${H(rar)}</span>`:''}</h2>
        <span class="kbox__sub">${H(g.faccao)} · ${H(ELAB[g.elem])} · ${H(g.classe)} · ${H(g.funcao)}</span></div>
      <span class="push">${acao}<button class="b b--quiet b--md" id="kitclose">Fechar</button></span></div>
    <div class="kbox__b">
      ${kit?`${linha('BÁS',kit.basico)}${linha('HAB',kit.habilidade)}${linha('MIL',kit.milagre)}
        ${kit.passiva?`<div class="krow krow--pas"><div class="krow__h"><span class="krow__rot">PAS</span><b>${H(kit.passiva.nome)}</b></div><div class="krow__t">${H(kit.passiva.efeito)}</div></div>`:''}`
      :`<div class="krow"><div class="krow__t">Kit em produção.</div></div>`}
      ${!liv?`<div class="kbox__lock">⚿ Bloqueado — desbloqueie pela Provação ou por invocação. O kit é leitura pública mesmo assim.</div>`:''}
    </div></div></div>`;
}
function adicionarPk(k){
  if(!jogavel(k)||donoDe(k)!==null)return false;
  if(pick[vez].length>=3){ if(pick[1-vez].length<3)vez=1-vez; else return false; }
  if(pick[vez].length<3)pick[vez].push(k);
  if(pick[vez].length===3&&pick[1-vez].length<3)vez=1-vez;
  return true;
}
function removerPk(k){ const p=donoDe(k); if(p===null)return false; pick[p]=pick[p].filter(x=>x!==k); vez=p; return true; }
function commitPk(k){ tocado=k; if(donoDe(k)!==null)removerPk(k); else adicionarPk(k); focoPk=null; }
function previewPk(k){ tocado=k; focoPk=k; }
// timer para distinguir 1 toque (ler kit) de 2 toques (adicionar/remover)
let _tapT=null,_tapK=null;
function toqueDeus(k){
  if(_tapK===k&&_tapT){ clearTimeout(_tapT);_tapT=null;_tapK=null; commitPk(k); renderPick(); return; }
  if(_tapT)clearTimeout(_tapT);
  _tapK=k; _tapT=setTimeout(()=>{ _tapT=null;_tapK=null; previewPk(k); renderPick(); },260);
}
// arrastar um deus até um slot de time o adiciona àquele jogador
function ligarArraste(b,k){
  let x0,y0,ghost=null,drag=false;
  b.addEventListener('pointerdown',e=>{
    if(!jogavel(k)||donoDe(k)!==null)return;   // só arrasta quem dá pra adicionar
    x0=e.clientX;y0=e.clientY;drag=false;
    b.setPointerCapture&&b.setPointerCapture(e.pointerId);
    const mv=ev=>{
      if(!drag&&Math.hypot(ev.clientX-x0,ev.clientY-y0)>8){
        drag=true;if(_tapT){clearTimeout(_tapT);_tapT=null;_tapK=null;}
        ghost=document.createElement('div');ghost.className='pkghost';
        ghost.innerHTML=slot('god-'+k,ini(RMAP[k].nome),COR(RMAP[k].elem),24);
        stage.appendChild(ghost);
        stage.querySelectorAll('.tslot').forEach(t=>t.classList.add('drop'));
      }
      if(drag&&ghost){const r=stage.getBoundingClientRect();
        ghost.style.left=(ev.clientX-r.left)+'px';ghost.style.top=(ev.clientY-r.top)+'px';}
    };
    const up=ev=>{
      b.removeEventListener('pointermove',mv);b.removeEventListener('pointerup',up);
      if(drag){
        b._arrastou=true;
        if(ghost)ghost.remove();
        const el=document.elementFromPoint(ev.clientX,ev.clientY);
        const alvo=el&&el.closest?el.closest('.tslot'):null;
        if(alvo&&alvo.dataset.p!==undefined){ const p=+alvo.dataset.p;
          if(donoDe(k)===null&&pick[p].length<3)pick[p].push(k); }
        renderPick();
      }
    };
    b.addEventListener('pointermove',mv);b.addEventListener('pointerup',up);
  });
}

/* ---------- tela de seleção: render + eventos ---------- */
// aoEntrar da rota 'selecao': se veio pedindo recomeço (novo), zera a grade e os
// times. Fica aqui (dono da seleção) em vez de o resultado da batalha mexer nisto.
function aoEntrarSelecao(params){
  if(params&&params.novo){ pick=[[],[]];vez=0;pagina=0;tocado=null;painelFiltro=false;focoPk=null; }
}

function renderPick(){
  const lista=listaFiltrada();
  const pags=Math.max(1,Math.ceil(lista.length/POR_PAG));
  if(pagina>=pags)pagina=pags-1;
  const fatia=lista.slice(pagina*POR_PAG,(pagina+1)*POR_PAG);
  const totalLiv=ROSTER.map(e=>e.key).filter(liberado).length;
  const pronto=pick[0].length===3&&pick[1].length===3;

  const slotsTime=p=>`<div class="tslot ${p===1?'p2':''} ${vez===p?'act':''}" data-p="${p}">
    <span class="tslot__l">J${p+1}</span>
    ${[0,1,2].map(i=>{const k=pick[p][i];
      return `<span class="tchip ${k?'full':''}" data-tira="${p}|${i}">${
        k?slot('god-'+k,ini(GODS[k].nome),COR(GODS[k].elem),13):''}</span>`;}).join('')}
  </div>`;

  stage.innerHTML=`<div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="stagemark">INCURSION</div>
  <div class="sel">
    <div class="selhead">
      <span class="selbrand">INCURSION</span>
      <span class="selturn">${pronto?'<b>TIMES PRONTOS</b>':`JOGADOR <b>${vez+1}</b> escolhe · <b>${pick[vez].length}/3</b>`}</span>
      <div class="teams">${slotsTime(0)}${slotsTime(1)}</div>
      <button class="b b--primary b--md" id="bgo" ${pronto?'':'disabled'}>Começar</button>
    </div>
    <div class="selbody">
      <button class="b b--quiet arrow" id="bprev" ${pagina===0?'disabled':''}>‹</button>
      <div class="grid">${fatia.length?fatia.map(tileHTML).join('')
        :'<span style="grid-column:1/-1;text-align:center;color:var(--ink-mute);font-weight:600">Nenhum deus atende a esses critérios.</span>'}</div>
      <button class="b b--quiet arrow" id="bnext" ${pagina>=pags-1?'disabled':''}>›</button>
    </div>
    <div class="selfoot">
      <button class="b b--quiet b--sm" id="bfiltro">Filtro: ${H(ESTADOS.find(e=>e[0]===F.estado)[1])}${
        eixosAtivos()?`<span class="fbtn__badge">${eixosAtivos()}</span>`:''}</button>
      <button class="b b--quiet b--sm" id="brand">Sortear</button>
      <span class="finfo">${infoHTML()}</span>
      <span class="fpage">${totalLiv}/${ROSTER.length} LIBERADOS · PÁG ${pagina+1}/${pags}</span>
      <button class="b ${vsCPU?'b--sec':'b--quiet'} b--sm" id="bcpu" title="quem controla o Jogador 2">${vsCPU?'Oponente: CPU':'Oponente: 2 jogadores'}</button>
      <button class="b ${tudoLiberado?'b--sec':'b--quiet'} b--sm" id="bteste" title="afordância de protótipo">${tudoLiberado?'Teste: on':'Teste'}</button>
      <button class="b b--quiet b--sm" id="binvocar" title="tela de invocação (gacha)">✦ Invocar</button>
    </div>
  </div>
  ${painelFiltroHTML()}
  ${painelKitHTML()}`;

  ligarSelecao();
  fit();
}

function ligarSelecao(){
  const q=s=>stage.querySelector(s), qq=s=>[...stage.querySelectorAll(s)];
  // 1 toque = ler o kit · 2 toques = adicionar/remover · arrastar = soltar no slot
  qq('.pk').forEach(b=>{
    b.onclick=()=>{ if(b._arrastou){b._arrastou=false;return;} toqueDeus(b.dataset.k); };
    ligarArraste(b,b.dataset.k);
  });
  qq('[data-tira]').forEach(el=>el.onclick=()=>{
    const [p,i]=el.dataset.tira.split('|').map(Number);
    if(pick[p][i])toqueDeus(pick[p][i]);
  });
  // painel do kit
  const kp=q('#kpanel');
  if(kp){
    kp.onclick=ev=>{ if(ev.target===kp){focoPk=null;renderPick();} };
    const ka=q('#kitadd'); if(ka)ka.onclick=()=>{adicionarPk(focoPk);focoPk=null;renderPick();};
    const kd=q('#kitdel'); if(kd)kd.onclick=()=>{removerPk(focoPk);focoPk=null;renderPick();};
    q('#kitclose').onclick=()=>{focoPk=null;renderPick();};
  }
  q('#bprev').onclick=()=>{pagina--;renderPick();};
  q('#bnext').onclick=()=>{pagina++;renderPick();};
  q('#bfiltro').onclick=()=>{painelFiltro=true;renderPick();};
  const fp=q('#fpanel');
  if(fp){
    fp.onclick=ev=>{if(ev.target===fp){painelFiltro=false;renderPick();}};
    qq('[data-fe]').forEach(b=>b.onclick=()=>{F.estado=b.dataset.fe;pagina=0;renderPick();});
    qq('[data-fs]').forEach(b=>b.onclick=()=>{
      const [campo,it]=b.dataset.fs.split('|');
      F[campo].has(it)?F[campo].delete(it):F[campo].add(it);
      pagina=0;renderPick();});
    q('#flimpar').onclick=()=>{limparFiltro();pagina=0;renderPick();};
    q('#ffechar').onclick=()=>{painelFiltro=false;renderPick();};
  }
  q('#bteste').onclick=()=>{tudoLiberado=!tudoLiberado;pagina=0;
    if(!tudoLiberado)pick=pick.map(p=>p.filter(jogavel));
    renderPick();};
  q('#binvocar').onclick=()=>{ir('invocacao');render();};
  { const bc=q('#bcpu'); if(bc)bc.onclick=()=>{vsCPU=!vsCPU;renderPick();}; }
  q('#brand').onclick=()=>{
    const pool=ROSTER.map(e=>e.key).filter(jogavel);
    for(const p of[0,1]){const c=[...pool].filter(k=>!pick[1-p].includes(k));pick[p]=[];
      while(pick[p].length<3&&c.length)pick[p].push(c.splice(Math.floor(Math.random()*c.length),1)[0]);}
    vez=0;renderPick();};
  q('#bgo').onclick=()=>{
    if(!(pick[0].length===3&&pick[1].length===3))return;
    st=novoEstado(pick[0],pick[1],Math.floor(Math.random()*1e6),Math.floor(Math.random()*2));
    // batalha SUBSTITUI a seleção na pilha (não empilha): "voltar" não pode
    // abandonar a partida. aoSair(selecao) limpa a sobreposição; aoEntrar(batalha)
    // inicia o relógio — por isso não há mais limpeza nem iniciarRelogio aqui.
    ir('batalha',{},{substituir:true});render();};
}

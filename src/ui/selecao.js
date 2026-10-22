// ui/selecao.js — BATALHA CPU / HOT-SEAT: monta DOIS times (J1 e J2) na GRADE do montador (§342/§344).
// §345: reusa a base do montador (cartões `_montCardHTML`, painel de kit `_montKitPanelHTML`, classes `dm-*`) com
// um cfg de DOIS lados — J1 (dourado) e J2 (vermelho). Tela fixa 1846×852 (como as telas de montar), sem conta/build.
// F4: esta tela É o SANDBOX declarado (Batalha CPU). Recompensa/teto vêm de economia.json.
const SB_ECON=(typeof ECONOMIA!=='undefined'&&ECONOMIA.sandbox)?ECONOMIA.sandbox:{};
const SB_GEMA=(SB_ECON.recompensas&&SB_ECON.recompensas.vitoria&&SB_ECON.recompensas.vitoria.gema)||0;
const SB_TETO=SB_ECON.tetoDia||0;
const RMAP={}; ROSTER.forEach(e=>RMAP[e.key]=e);
const temKit=k=>!!GODS[k];
let tudoLiberado=false, vez=0;   // abre em LIBERADOS; vez = time que escolhe agora
let focoPk=null;                 // deus com o painel de kit aberto
let selBusca='';                 // §345: busca por nome na grade (como o montador)
const FACCOES=['Grega','Nórdica','Egípcia','Japonesa','Chinesa','Hindu','Brasileira','Africana','Celta','Maia'];
const CLASSES_G=['Físico','Mágico','Híbrido'];
// §345/§359: o estado vira uma PÍLULA "Liberados | Todos". ELEMENTO fica inline (orbes). FUNÇÃO, Facção e Classe vão p/
// "MAIS FILTROS" (§359: a largura do 780×360 não comporta orbes+5 funções+busca+mais numa só grade — a função desceu
// p/ o painel, sem perder o filtro). Mantém-se o modelo de Sets (multi) já existente.
let F={estado:'liberados',faccoes:new Set(),elems:new Set(),funcoes:new Set(),classes:new Set()};
let painelFiltro=false;   // o painel "MAIS FILTROS" (função + facção + classe)
const _selNorm=s=>(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function eixosExtras(){return F.funcoes.size+F.faccoes.size+F.classes.size;}   // função/facção/classe contam p/ o badge do "MAIS FILTROS"
function limparFiltro(){F={estado:'liberados',faccoes:new Set(),elems:new Set(),funcoes:new Set(),classes:new Set()};}

function liberado(k){return tudoLiberado?temKit(k):!!RMAP[k].inicial;}
function jogavel(k){return liberado(k)&&temKit(k);}
function listaFiltrada(){
  const q=_selNorm(selBusca);
  return ROSTER.filter(e=>{
    if(F.estado==='liberados'&&!liberado(e.key))return false;
    if(F.faccoes.size&&!F.faccoes.has(e.faccao))return false;
    if(F.elems.size&&!F.elems.has(e.elem))return false;
    if(F.funcoes.size&&!F.funcoes.has(e.funcao))return false;
    if(F.classes.size&&!F.classes.has(e.classe))return false;
    if(q&&!_selNorm(e.nome).includes(q))return false;
    return true;
  }).map(e=>e.key);
}
function donoDe(k){return pick[0].includes(k)?0:pick[1].includes(k)?1:null;}

// ---- montagem dos dois times (lógica preservada do original) ----
function adicionarPk(k){
  if(!jogavel(k)||donoDe(k)!==null)return false;
  if(pick[vez].length>=3){ if(pick[1-vez].length<3)vez=1-vez; else return false; }
  if(pick[vez].length<3)pick[vez].push(k);
  if(pick[vez].length===3&&pick[1-vez].length<3)vez=1-vez;   // time completou → a vez passa sozinha ao outro
  return true;
}
function removerPk(k){ const p=donoDe(k); if(p===null)return false; pick[p]=pick[p].filter(x=>x!==k); vez=p; return true; }
function commitPk(k){ if(donoDe(k)!==null)removerPk(k); else adicionarPk(k); focoPk=null; }   // toque no cartão = entra/sai
function previewPk(k){ focoPk=k; }   // "i" = abre o kit

// ---- cfg de DOIS lados para a base do montador ----
function _cfgSel(){
  return {
    selNum:k=>{ const p=donoDe(k); return p===null?0:pick[p].indexOf(k)+1; },   // nº da vaga dentro do time
    selLado:k=>donoDe(k),                                                        // 0 = J1 (dourado) · 1 = J2 (vermelho)
    cardTravado:k=>{ if(donoDe(k)!==null)return null;                            // já escolhido → removível (não trava)
      if(jogavel(k))return null;
      if(!liberado(k))return {txt:'⚿',cinza:true};                          // bloqueado
      return {txt:'WIP'};                                                        // liberado sem kit
    },
    kitLabel:k=>{ const dono=donoDe(k);
      if(dono!==null)return {txt:'TIRAR'};
      if(!liberado(k))return {txt:'Bloqueado',disabled:true};
      if(!temKit(k))return {txt:'Kit em produção',disabled:true};
      if(pick[0].length>=3&&pick[1].length>=3)return {txt:'Times cheios',disabled:true};
      const destino=pick[vez].length<3?vez:1-vez;
      return {txt:destino===0?'ADICIONAR AO SEU TIME':'ADICIONAR AO OPONENTE'};
    },
  };
}

/* ---------- vagas da coluna esquerda (J1 e J2) ---------- */
function vagaSelHTML(p,i){
  const k=pick[p][i], n=i+1;
  if(!k) return `<div class="sel-vaga sel-vaga--vazia"><span class="sel-vaga__num">${n}</span><span class="sel-vaga__add">+</span></div>`;
  const g=RMAP[k]||{nome:k,elem:'Umbra',funcao:''};
  // §359: cada vaga é um CHIP vertical (retrato + nome), 3 numa linha; a vaga inteira é o alvo de remover (toque ≥40×40).
  return `<button class="sel-vaga" data-rem="${p}|${k}" aria-label="remover ${H(g.nome)}"><span class="sel-vaga__num">${n}</span>
    <span class="sel-vaga__p">${slot('god-'+k,ini(g.nome),COR(g.elem),30)}</span>
    <b class="sel-vaga__n">${H(g.nome)}</b>
  </button>`;
}
function timeBlocoHTML(p){
  const tit=p===0?'SEU TIME':'OPONENTE';
  const who=p===1?`<span class="sel-time__who">${vsCPU?'CPU':'JOGADOR 2'}</span>`:'';
  return `<div class="sel-time${vez===p?' is-vez':''}${p===1?' sel-time--op':''}" data-lado="${p}">
    <div class="sel-time__cab"><h2 class="sel-time__t">${tit}</h2>${who}<span class="sel-time__c">${pick[p].length}/3</span></div>
    <div class="sel-time__lista">${[0,1,2].map(i=>vagaSelHTML(p,i)).join('')}</div>
  </div>`;
}
function motivoSel(){
  // §359: curto (o rodapé da seleção é estreito no 780×360) — "Faltam N · oponente|seu time"
  const f0=3-pick[0].length, f1=3-pick[1].length;
  if(f0<=0&&f1<=0)return '';
  if(vez===1&&f1>0)return `Faltam ${f1} · oponente`;
  if(vez===0&&f0>0)return `Faltam ${f0} · seu time`;
  return f1>0?`Faltam ${f1} · oponente`:`Faltam ${f0} · seu time`;
}

/* ---------- grade "SEUS DEUSES" (a mesma do montador) ---------- */
function gradeSelHTML(cfg){
  const lista=listaFiltrada();
  const elemChips=ELEMS.map(e=>`<button class="dm-orbe${F.elems.has(e)?' is-on':''}" data-elem="${e}" aria-label="${ELAB[e]}">${orbe(e,30)}</button>`).join('');
  const funcChips=FUNCOES_VOCAB.map(f=>`<button class="dm-chip${F.funcoes.has(f)?' is-on':''}" data-func="${f}">${H(f)}</button>`).join('');
  const cards=lista.length?lista.map(k=>_montCardHTML(k,cfg)).join(''):'<p class="dm-vazio">Nenhum deus atende a esses critérios.</p>';
  const estadoTxt=F.estado==='liberados'?'Liberados':'Todos';
  return `<section class="dm-dir">
    <div class="dm-dir__cab">
      <div class="dm-filtros">
        <div class="dm-filtros__l">
          <h2 class="dm-dir__t">SEUS DEUSES</h2>
          <button class="dm-chip sel-pill${F.estado==='todos'?' sel-pill--todos':''}" id="bestado" data-estado="1">${estadoTxt}</button>
          <span class="dm-orbes">${elemChips}</span>
        </div>
        <div class="dm-filtros__l">
          <span class="dm-busca__w"><input class="dm-busca" id="selbusca" placeholder="Buscar deus" value="${H(selBusca)}"></span>
          <button class="dm-chip" id="bmaisf" data-maisf="1">Mais filtros${eixosExtras()?`<span class="sel-badge">${eixosExtras()}</span>`:''}</button>
          <span class="dm-conta">${lista.length} deuses</span>
        </div>
      </div>
    </div>
    <div class="dm-grade" id="selgrade">${cards}</div>
  </section>`;
}
function painelMaisFiltrosHTML(){
  if(!painelFiltro)return '';
  const n=listaFiltrada().length;
  const grupo=(rot,chips)=>`<div class="fgrp"><span class="fgrp__l">${rot}</span><div class="fgrp__c">${chips}</div></div>`;
  const _ff={faccoes:'faccao',classes:'classe',funcoes:'funcao'};
  const chipSet=(campo,itens)=>itens.map(it=>{
    const c=ROSTER.filter(e=>e[_ff[campo]]===it).length;
    return `<button class="chip2 ${F[campo].has(it)?'on':''}" data-fs="${campo}|${it}">${H(it)}<span class="chip2__n">${c}</span></button>`;}).join('');
  return `<div class="sel-fpanel" id="fpanel"><div class="fbox sel-fbox">
    <div class="fbox__h"><h2>MAIS FILTROS</h2>
      <span class="fbox__n"><b>${n}</b> de ${ROSTER.length} deuses</span>
      <span class="push">
        <button class="dmb dmb--quietbig" id="flimpar">Limpar</button>
        <button class="dmb dmb--go" id="ffechar">Pronto</button></span></div>
    <div class="fbox__b">
      ${grupo('FUNÇÃO',chipSet('funcoes',FUNCOES_VOCAB))}
      ${grupo('PANTEÃO',chipSet('faccoes',FACCOES))}
      ${grupo('CLASSE',chipSet('classes',CLASSES_G))}
    </div></div></div>`;
}

// aoEntrar da rota 'selecao': se veio pedindo recomeço (novo), zera a grade e os times.
function aoEntrarSelecao(params){
  if(params&&params.novo){ pick=[[],[]];vez=0;selBusca='';painelFiltro=false;focoPk=null;limparFiltro(); }
}

function renderPick(){
  const cfg=_cfgSel();
  const pronto=pick[0].length===3&&pick[1].length===3;
  const sub=vsCPU?'BATALHA CPU · SANDBOX':'2 JOGADORES · MESMO APARELHO';
  const info=vsCPU
    ? `A vitória rende <b>${SB_GEMA}</b> 💎 · teto ${SB_TETO}/dia · não avança ranque`
    : `Dois jogadores no mesmo aparelho · sem ranque`;
  const mv=motivoSel();
  stage.innerHTML=`<div id="baselayer" class="dm2"><div id="dommontar" class="dm--sel">
    <button class="dmb dmb--voltar" id="binicio" data-voltar="1">‹ VOLTAR</button>
    <div class="dm-cabid"><h1 class="dm-titulo cin">MONTE OS TIMES</h1><span class="dm-sub">${sub}</span></div>
    <section class="sel-times">
      ${timeBlocoHTML(0)}
      ${timeBlocoHTML(1)}
      <div class="sel-ops">
        <div class="sel-seg" role="tablist">
          <button class="sel-seg__b${vsCPU?' is-on':''}" id="bcpu" data-cpu="1">OPONENTE: CPU</button>
          <button class="sel-seg__b${!vsCPU?' is-on':''}" data-cpu="0">2 JOGADORES</button>
        </div>
        <button class="dmb dmb--quietbig sel-sortear" id="brand">🎲 SORTEAR</button>
        <p class="sel-info">${info}</p>
      </div>
    </section>
    ${gradeSelHTML(cfg)}
    <div class="dm-rodape sel-rodape">
      <span class="sel-mini-wrap">
        <button class="dmb sel-mini" id="binvocar">✦ Invocar</button>
        <button class="dmb sel-mini${tudoLiberado?' is-on':''}" id="bteste">${tudoLiberado?'Teste: on':'Teste'}</button>
      </span>
      ${pronto?'':`<span class="dm-motivo">ⓘ ${H(mv)}</span>`}
      <button class="dmb dmb--go dmb--comecar" id="bgo" ${pronto?'':'disabled'}>COMEÇAR</button>
    </div>
    ${painelMaisFiltrosHTML()}
    ${focoPk?_montKitPanelHTML(focoPk,cfg):''}
  </div></div>`;
  ligarSelecao(cfg);
  fit();
}

function ligarSelecao(cfg){
  const q=s=>stage.querySelector(s), qq=s=>[...stage.querySelectorAll(s)];
  // cartões: toque entra/sai; o "i" abre o kit
  qq('.dm-card[data-pick]').forEach(b=>b.onclick=()=>{ commitPk(b.dataset.pick); renderPick(); });
  qq('.dm-card__i[data-info]').forEach(el=>el.onclick=ev=>{ ev.stopPropagation(); previewPk(el.dataset.info); renderPick(); });
  // tocar num BLOCO passa a escolher para ele
  qq('[data-lado]').forEach(b=>b.onclick=ev=>{ if(ev.target.closest('.sel-vaga[data-rem]'))return; vez=+b.dataset.lado; renderPick(); });
  qq('.sel-vaga[data-rem]').forEach(b=>b.onclick=ev=>{ ev.stopPropagation(); const [p,k]=b.dataset.rem.split('|'); if(donoDe(k)!==null){removerPk(k);renderPick();} });
  // filtros inline
  const be=q('#bestado'); if(be)be.onclick=()=>{ F.estado=F.estado==='liberados'?'todos':'liberados'; renderPick(); };
  qq('[data-elem]').forEach(b=>b.onclick=()=>{ const e=b.dataset.elem; F.elems.has(e)?F.elems.delete(e):F.elems.add(e); renderPick(); });
  qq('[data-func]').forEach(b=>b.onclick=()=>{ const f=b.dataset.func; F.funcoes.has(f)?F.funcoes.delete(f):F.funcoes.add(f); renderPick(); });
  const bu=q('#selbusca'); if(bu)bu.oninput=()=>{ selBusca=bu.value; const g=q('#selgrade'); const lista=listaFiltrada();
    if(g)g.innerHTML=lista.length?lista.map(k=>_montCardHTML(k,cfg)).join(''):'<p class="dm-vazio">Nenhum deus atende a esses critérios.</p>';
    const c=q('.dm-conta'); if(c)c.textContent=lista.length+' deuses';
    g&&[...g.querySelectorAll('.dm-card[data-pick]')].forEach(b=>b.onclick=()=>{commitPk(b.dataset.pick);renderPick();});
    g&&[...g.querySelectorAll('.dm-card__i[data-info]')].forEach(el=>el.onclick=ev=>{ev.stopPropagation();previewPk(el.dataset.info);renderPick();}); };
  // "MAIS FILTROS" (facção + classe)
  const bmf=q('#bmaisf'); if(bmf)bmf.onclick=()=>{ painelFiltro=true; renderPick(); };
  const fp=q('#fpanel');
  if(fp){
    fp.onclick=ev=>{ if(ev.target===fp){painelFiltro=false;renderPick();} };
    qq('[data-fs]').forEach(b=>b.onclick=()=>{ const [campo,it]=b.dataset.fs.split('|');
      F[campo].has(it)?F[campo].delete(it):F[campo].add(it); renderPick(); });
    q('#flimpar').onclick=()=>{ F.faccoes.clear();F.classes.clear();F.elems.clear();F.funcoes.clear(); renderPick(); };
    q('#ffechar').onclick=()=>{ painelFiltro=false; renderPick(); };
  }
  // painel do kit (reusa o do montador)
  const kx=q('[data-kit-x]'); if(kx)kx.onclick=()=>{ focoPk=null; renderPick(); };
  const kit=q('#dmkit'); if(kit)kit.onclick=ev=>{ if(ev.target===kit){focoPk=null;renderPick();} };
  qq('[data-kit-toggle]').forEach(b=>b.onclick=()=>{ commitPk(b.dataset.kitToggle); renderPick(); });
  // rodapé e opções
  { const bi=q('#binicio'); if(bi)bi.onclick=()=>{ if(!voltar())ir('home',{},{substituir:true}); render(); }; }
  qq('[data-cpu]').forEach(b=>b.onclick=()=>{ vsCPU=(b.dataset.cpu==='1'); renderPick(); });
  q('#brand').onclick=()=>{
    const pool=ROSTER.map(e=>e.key).filter(jogavel);
    for(const p of[0,1]){const c=[...pool].filter(k=>!pick[1-p].includes(k));pick[p]=[];
      while(pick[p].length<3&&c.length)pick[p].push(c.splice(Math.floor(Math.random()*c.length),1)[0]);}
    vez=0;renderPick();};
  q('#bteste').onclick=()=>{ tudoLiberado=!tudoLiberado;
    if(!tudoLiberado)pick=pick.map(p=>p.filter(jogavel));
    renderPick();};
  q('#binvocar').onclick=()=>{ir('invocacao');render();};
  q('#bgo').onclick=()=>{
    if(!(pick[0].length===3&&pick[1].length===3))return;
    prova=null; campanha=null;   // batalha de seleção não é Provação nem encontro de campanha
    const _seed=Math.floor(Math.random()*1e6), _comeca=Math.floor(Math.random()*2);
    // §323 P2: no sandbox vs CPU (PvE) os níveis do jogador valem no lado 0. Hot-seat (2 humanos) fica no base.
    const _nvSb=(vsCPU && typeof niveisTimeLocal==='function')?niveisTimeLocal(pick[0]):null;
    if(typeof definirNiveisBatalha==='function') definirNiveisBatalha(_nvSb);
    st=novoEstado(pick[0],pick[1],_seed,_comeca,
      (typeof ECONOMIA!=='undefined'&&ECONOMIA.energia)||null, undefined, _nvSb?[_nvSb,{}]:null);
    // §318 F2 E2: sandbox vs CPU é fonte de Gema (tetada no servidor) — grava o replay com a montagem exata.
    if(typeof REPLAY!=='undefined'){ if(vsCPU) REPLAY.iniciar({modo:'sandbox',aliados:pick[0].slice(),inimigos:pick[1].slice(),seed:_seed,comeca:_comeca}); else REPLAY.descartar(); }
    if(typeof definirIaVersao==='function') definirIaVersao(vsCPU?iaVersaoDeModo('sandbox'):1);   // §322 P3
    ir('batalha',{},{substituir:true});render();};
}

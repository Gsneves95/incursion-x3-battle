// ui/topo.js — barra superior (§215): ESPAÇO RESERVADO para o perfil dos DOIS jogadores.
// De cada lado: FOTO + NICK (+ RANQUE, que chega no PvP/Fase 5) e as ORBES daquele lado.
// A energia do OPONENTE é informação de JOGO (prever o Milagre dele), não decoração — voltou.
// Centro: relógio + os botões de menu. Tocar numa foto abre um marcador honesto (Fase 5).
// Perspectiva fixa (F0.7): eu = ladoExibido; o oponente é o outro lado.

// avatar genérico (silhueta): placeholder de FOTO até o perfil online existir (Fase 5).
const AVATAR_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12.6a4.3 4.3 0 1 0 0-8.6 4.3 4.3 0 0 0 0 8.6Zm0 1.7c-3.7 0-7.4 1.9-7.4 4.6V21h14.8v-2.1c0-2.7-3.7-4.6-7.4-4.6Z"/></svg>';

// pílulas de energia de um lado. `meu`=true no meu lado (converte por toque, realça gasto);
// no lado do oponente é LEITURA (sem toque, sem realce) — só mostrar quanto ele tem.
function pilulasEnergia(lado, meu, plano){
  const proprios=new Set(lado.units.filter(u=>u.vivo).map(u=>u.elem));
  const mostrar=ELEMS.filter(e=>proprios.has(e)||lado.orbs[e]>0||(meu&&plano&&plano[e]>0));
  if(!mostrar.length) return '';
  return mostrar.map(e=>{
    const n=lado.orbs[e], g=meu&&plano&&plano[e]>0;
    if(!meu) return `<span class="energy__pill energy__pill--ro ${n===0?'zero':''}" title="${ELAB[e]}">
      <span class="energy__dot" style="background:${COR(e)}"></span><span class="energy__n">${n}</span></span>`;
    return `<button class="energy__pill ${g?'spend':''} ${n===0?'zero':''} ${convAlvo===e?'target':''}"
      data-conv="${e}" title="${ELAB[e]}">
      <span class="energy__dot" style="background:${COR(e)}"></span><span class="energy__n">${n}</span></button>`;
  }).join('');
}

// perfil (foto + nick + ranque). Reservado para o online (Fase 5): a foto e o nick são
// placeholder; o ranque é "—" até existir conta. `foe`=true no oponente (aro/nome vermelho).
function perfilChip(nome, foe){
  return `<button class="prof ${foe?'prof--foe':''}" data-prof="${foe?'foe':'me'}" title="Perfil do jogador (Fase 5)">
    <span class="prof__pic">${AVATAR_SVG}</span>
    <span class="prof__id"><b class="prof__nick">${H(nome)}</b><span class="prof__rank">—</span></span>
  </button>`;
}

function topoHTML(){
  const eu=ladoExibido();
  const l=st.lados[eu], o=st.lados[1-eu];
  let plano=null;
  if(armado){const u=l.units.find(x=>x.uid===armado.uid);
    const a=acoesDe(st,u).find(x=>x.slot===armado.slot); if(a)plano=planoPag(l,a.cost);}
  else if(convAlvo)plano=planoConversao(l,convAlvo);
  const mm=Math.floor(relogio/60), ss=String(relogio%60).padStart(2,'0');
  return `<header class="topbar">
    <div class="side side--me">
      ${perfilChip('Você', false)}
      <div class="energy energy--me">${pilulasEnergia(l,true,plano)}</div>
      <button class="b b--sec b--sm b--icon" id="btrocar" ${!ehMeuTurno()||l.converteu||totalOrbs(l)<CONV_CUSTO?'disabled':''}
        title="Trocar ${CONV_CUSTO} energias por 1 da sua escolha">⇄</button>
    </div>
    <div class="topmid">
      <div class="timer ${relogio<=10?'low':''}">
        <div class="timer__fill" style="width:${Math.round(relogio/TURNO_SEG*100)}%"></div>
        <div class="timer__label">TURNO ${st.turno}${st.turno>=30?'/40':''} · ${mm}:${ss}</div>
      </div>
      <div class="tools">
        <button class="b b--quiet b--icon" id="blog" title="Registro">≡</button>
        <button class="b b--quiet b--icon" id="bmenu" title="Mais">⋯</button>
      </div>
    </div>
    <div class="side side--foe">
      <div class="energy energy--foe">${pilulasEnergia(o,false,null)}</div>
      ${perfilChip(rotuloLado(1-eu), true)}
    </div>
  </header>
  ${menuAberto?`<div class="menu" id="menu">
    <button class="b b--quiet b--md" id="bhelp">Como jogar</button>
    <button class="b b--quiet b--md" id="bfull">${estaTelaCheia()?'Sair da tela cheia':'Tela cheia'}</button>
    <button class="b b--quiet b--md" id="bsair">Sair para o início</button>
    <button class="b b--danger b--md" id="bsurr">Render-se</button>
    <button class="b b--danger b--md" id="bapagar">Apagar dados</button>
  </div>`:''}`;
}

/* ---------- eventos da barra superior (energia, trocar, perfil, registro, menu) ---------- */
function ligarTopo(){
  const q=s=>stage.querySelector(s);
  stage.querySelectorAll('[data-conv]').forEach(b=>b.onclick=()=>{
    if(!ehMeuTurno())return;   // sem converter no turno do oponente (a barra é só leitura)
    const l0=st.lados[st.ativo];
    if(l0.converteu||totalOrbs(l0)<CONV_CUSTO)return;
    ov='conv';convAlvo=b.dataset.conv;
    armado=null;alvos=[];escolhidos=[];detalhe=null;peekKit=null;menuAberto=false;render();});
  const bt=q('#btrocar'); if(bt&&!bt.disabled)bt.onclick=()=>{
    ov='conv';convAlvo=null;armado=null;alvos=[];escolhidos=[];detalhe=null;peekKit=null;menuAberto=false;render();};
  // FOTO do perfil (dos dois lados): marcador honesto — o perfil de verdade é Fase 5 (online).
  stage.querySelectorAll('[data-prof]').forEach(b=>b.onclick=()=>{ov='perfil';menuAberto=false;render();});
  const bl=q('#blog'); if(bl)bl.onclick=()=>{ov=ov==='log'?null:'log';menuAberto=false;render();};
  const bm=q('#bmenu'); if(bm)bm.onclick=()=>{menuAberto=!menuAberto;render();};
  const bh=q('#bhelp'); if(bh)bh.onclick=()=>{ov='help';menuAberto=false;render();};
  const bf=q('#bfull'); if(bf)bf.onclick=()=>{alternarTelaCheia();menuAberto=false;render();};
  const bx=q('#bsair'); if(bx)bx.onclick=()=>{ov='sair';menuAberto=false;render();};   // sair da partida p/ a home (com confirmação)
  const bs=q('#bsurr'); if(bs)bs.onclick=()=>{ov='surr';menuAberto=false;render();};
  const ba=q('#bapagar'); if(ba)ba.onclick=()=>{ov='apagar';menuAberto=false;render();};
  // fechar o menu ao tocar fora, sem acumular ouvintes a cada render
  if(menuAberto){
    const mm=q('#menu');
    stage.onclick=ev=>{
      if(mm&&!mm.contains(ev.target)&&!(ev.target.closest&&ev.target.closest('#bmenu'))){
        stage.onclick=null;menuAberto=false;render();}
    };
  } else stage.onclick=null;
}

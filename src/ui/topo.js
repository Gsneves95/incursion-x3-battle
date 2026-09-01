// ui/topo.js — barra superior ENXUTA (§214): turno + relógio, energia (minhas orbes), e os
// três botões de menu. Os rótulos de time (Você/oponente) moram sobre as COLUNAS, não aqui.
function topoHTML(){
  const l=st.lados[ladoExibido()];
  let plano=null;
  if(armado){const u=l.units.find(x=>x.uid===armado.uid);
    const a=acoesDe(st,u).find(x=>x.slot===armado.slot); if(a)plano=planoPag(l,a.cost);}
  else if(convAlvo)plano=planoConversao(l,convAlvo);
  const proprios=new Set(l.units.filter(u=>u.vivo).map(u=>u.elem));
  const mostrar=ELEMS.filter(e=>proprios.has(e)||l.orbs[e]>0||(plano&&plano[e]>0));
  const pills=mostrar.map(e=>{
    const n=l.orbs[e],g=plano&&plano[e]>0;
    return `<button class="energy__pill ${g?'spend':''} ${n===0?'zero':''} ${convAlvo===e?'target':''}"
      data-conv="${e}" title="${ELAB[e]}">
      <span class="energy__dot" style="background:${COR(e)}"></span><span class="energy__n">${n}</span></button>`;
  }).join('');
  const mm=Math.floor(relogio/60), ss=String(relogio%60).padStart(2,'0');
  return `<header class="topbar">
    <div class="turnbox">
      <div class="timer ${relogio<=10?'low':''}">
        <div class="timer__fill" style="width:${Math.round(relogio/TURNO_SEG*100)}%"></div>
        <div class="timer__label">TURNO ${st.turno}${st.turno>=30?'/40':''} · ${mm}:${ss}</div>
      </div>
    </div>
    <div class="energy">${pills}
      <button class="b b--sec b--sm" id="btrocar" ${!ehMeuTurno()||l.converteu||totalOrbs(l)<CONV_CUSTO?'disabled':''}
        title="Trocar ${CONV_CUSTO} energias por 1 da sua escolha">⇄ Trocar</button>
    </div>
    <div class="tools">
      <button class="b b--quiet b--icon" id="blog" title="Registro">≡</button>
      <button class="b b--quiet b--icon" id="bmenu" title="Mais">⋯</button>
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

/* ---------- eventos da barra superior (energia, trocar, registro, menu) ---------- */
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

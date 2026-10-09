// ui/topo.js — §329: a BARRA SUPERIOR À RISCA da referência + o CANTO INFERIOR ESQUERDO (DESISTIR/MENU/SOM).
// Posições em u de data/layout_batalha.json (LAYOUT_BATALHA). O texto de estado + a barra de tempo são o BOTÃO
// de ENCERRAR TURNO (fluxo de hoje: energia livre etc.). Energia e ⇄ TROCAR no centro. Perspectiva fixa (F0.7).

const AVATAR_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12.6a4.3 4.3 0 1 0 0-8.6 4.3 4.3 0 0 0 0 8.6Zm0 1.7c-3.7 0-7.4 1.9-7.4 4.6V21h14.8v-2.1c0-2.7-3.7-4.6-7.4-4.6Z"/></svg>';

function _LBT(){ return (typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA&&LAYOUT_BATALHA.topo)||{}; }
// §329b: a 2ª linha do nome mostra o MODO (ou o ranque no PvP). Para o jogador cai em SANDBOX; p/ a CPU, OPONENTE.
function _modoRotulo(){
  if(typeof prova!=='undefined'&&prova) return 'RITO';
  if(typeof campanha!=='undefined'&&campanha) return 'CAMPANHA';
  if(typeof dominio!=='undefined'&&dominio){ const c=dominio.cultura||(dominio.run&&dominio.run.cultura)||''; return 'DOMÍNIO'+(c?' · '+String(c).toUpperCase():''); }
  return '';
}
function _subJogador(){ const m=_modoRotulo(); if(m) return m;
  if(typeof MP!=='undefined'&&MP){ const r=(typeof contaAtual!=='undefined'&&contaAtual&&(contaAtual.ranque||contaAtual.rank))||''; return r?String(r).toUpperCase():'PvP'; }
  return 'SANDBOX'; }
function _subOponente(){ return _modoRotulo() || 'OPONENTE'; }
// contadores de energia do MEU lado: quadradinho colorido + ×N por tipo presente, e o total no fim.
function btEnergiaHTML(l){
  const proprios=new Set(l.units.filter(u=>u.vivo).map(u=>u.elem));
  const mostrar=ELEMS.filter(e=>proprios.has(e)||l.orbs[e]>0);
  const total=ELEMS.reduce((s,e)=>s+l.orbs[e],0);
  const cel=e=>`<span class="bt-ec" title="${ELAB[e]}"><span class="bt-ec__dot" style="background:${COR(e)}"></span>×${l.orbs[e]}</span>`;
  return mostrar.map(cel).join('')+`<span class="bt-ec"><span class="bt-ec__dot bt-ec__dot--tot">Σ</span>×${total}</span>`;
}
function topoHTML(){
  const T=_LBT(); const eu=ladoExibido();
  const l=st.lados[eu], o=st.lados[1-eu];
  const meu=ehMeuTurno();
  const aj=T.ajustes||{x:1.5,y:1.5,size:4};
  const jg=T.jogador||{nomeFimX:37.5,avatar:{x:39,y:2.4,size:9}};
  const op=T.oponente||{nomeIniDir:37.5,avatar:{dir:39,y:2.4,size:9}};
  const es=T.estado||{y:[3,6]}, ba=T.barra||{w:34,h:2,y:[5.6,7.5]}, en=T.energia||{y:[9.2,11.3]}, tr=T.trocar||{y:[12,14]};
  const mm=Math.floor(relogio/60), ss=String(relogio%60).padStart(2,'0');
  const pct=Math.max(0,Math.min(100,Math.round(relogio/TURNO_SEG*100)));
  const hud = (prova||campanha||dominio) ? `<span class="bt-estado__hud">T${st.turno}${st.turno>=30?'/40':''}</span>` : '';
  const estadoTxt = meu ? 'Seu turno — Encerrar' : 'Turno do oponente…';
  const prontas=l.units.filter(u=>podeAgir(u)).length;
  const cx='left:50%;transform:translateX(-50%)';
  return `
  <button class="bt-ajustes" id="bajustes" title="Menu" style="left:${U(aj.x)};top:${U(aj.y)};width:${U(aj.size)};height:${U(aj.size)}">
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 7h12M17 7h4M3 17h4M9 17h12M14 3v8M8 13v8"/><circle cx="15.5" cy="7" r="2"/><circle cx="8.5" cy="17" r="2"/></svg>
  </button>
  <div class="bt-name bt-name--me" style="left:${U(aj.x+aj.size+1)};right:calc(100% - ${U(jg.nomeFimX)});top:${U(aj.y)};height:${U(jg.avatar.size)}">
    <span class="bt-name__nick" style="font-size:${U(3.2)}">${H('Você')}</span>
    <span class="bt-name__sub" style="font-size:${U(2)}">${H(_subJogador())}</span>
  </div>
  <button class="bt-prof" data-prof="me" title="Perfil" style="left:${U(jg.avatar.x)};top:${U(jg.avatar.y)};width:${U(jg.avatar.size)};height:${U(jg.avatar.size)}">
    <span class="bt-prof__pic" style="width:100%;height:100%">${AVATAR_SVG}</span>
  </button>
  <button class="bt-prof bt-prof--foe" data-prof="foe" title="Perfil" style="right:${U(op.avatar.dir)};top:${U(op.avatar.y)};width:${U(op.avatar.size)};height:${U(op.avatar.size)}">
    <span class="bt-prof__pic" style="width:100%;height:100%">${AVATAR_SVG}</span>
  </button>
  <div class="bt-name bt-name--foe" style="left:calc(100% - ${U(op.nomeIniDir)});right:${U(aj.x)};top:${U(op.avatar.y)};height:${U(op.avatar.size)}">
    <span class="bt-name__nick" style="font-size:${U(3.2)}">${H(rotuloLado(1-eu))}</span>
    <span class="bt-name__sub" style="font-size:${U(2)}">${H(_subOponente())}</span>
  </div>
  <button class="bt-estado" id="bend2" ${meu?'':'disabled'} style="${cx};top:${U(es.y[0])};height:${U(en.y[0]-es.y[0]-0.3)};width:${U(ba.w+8)}">
    <span class="bt-estado__l" style="position:absolute;top:0;${cx};font-size:${U(2.1)};white-space:nowrap">${H(estadoTxt)}${hud}</span>
    <span class="bt-barra" style="${cx};top:${U(ba.y[0]-es.y[0])};width:${U(ba.w)};height:${U(ba.h)}"><span class="bt-barra__fill" style="width:${pct}%"></span></span>
    <span style="position:absolute;top:${U(ba.y[1]-es.y[0]+0.2)};${cx};white-space:nowrap;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:${U(1.4)};color:var(--ink-dim);text-transform:none">${meu?(l.dividaLivre>0?`escolher ${l.dividaLivre} energia livre`:(prontas?prontas+' a agir':'todas agiram')):'aguarde'} · ${mm}:${ss}</span>
  </button>
  <div class="bt-energia" style="${cx};top:${U(en.y[0])};height:${U(en.y[1]-en.y[0])};font-size:${U(2.1)}">${btEnergiaHTML(l)}</div>
  <button class="bt-trocar" id="btrocar" ${(!meu||l.converteu||totalOrbs(l)<CONV_CUSTO)?'disabled':''} title="Trocar ${CONV_CUSTO} energias por 1"
    style="${cx};top:${U(tr.y[0])};height:${U(tr.y[1]-tr.y[0])};font-size:${U(1.9)}">⇄ Trocar energia</button>
  ${cantoInfHTML()}
  ${menuAberto?menuDropHTML():''}`;
}

// CANTO INFERIOR ESQUERDO: DESISTIR, MENU, SOM, e um espaço de arte decorativo ATRÁS (sem cobrir toque).
function cantoInfHTML(){
  const L=(typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA&&LAYOUT_BATALHA.cantoInferior)||{};
  const ds=L.desistir||{x:[5,29],y:[77.8,83]}, me=L.menu||{x:[5,29],y:[85,90.4]}, so=L.som||{x:[5,29],y:[92.8,96.9]}, ar=L.arte||{x:[22,48],y:[75,100]};
  const box=(o)=>`left:${U(o.x[0])};top:${U(o.y[0])};width:${U(o.x[1]-o.x[0])};height:${U(o.y[1]-o.y[0])}`;
  // §329b: arte do canto é FIXA (Nezha), independente do deus em foco — até o dono gerar web/banners/batalha_canto.webp.
  const cantoSrc=(typeof CANTO_ARTE!=='undefined'&&CANTO_ARTE)?'banners/batalha_canto.webp'
    :((typeof IMG!=='undefined'&&IMG['nezha'])?IMG['nezha']:'');
  return `
  <div class="bt-corner-art" style="${box(ar)}">${cantoSrc?`<img class="bt-corner-art__img" src="${H(cantoSrc)}" alt="" onerror="this.style.display='none'">`:''}</div>
  <button class="bt-cbtn bt-cbtn--danger" id="bsurr" style="${box(ds)};font-size:${U(2.2)}">Desistir</button>
  <button class="bt-cbtn" id="bmenu" style="${box(me)};font-size:${U(2.2)}">Menu</button>
  <div class="bt-som" style="${box(so)};font-size:${U(2)}">🔊<input type="range" min="0" max="100" value="80" aria-label="Volume"></div>`;
}
function menuDropHTML(){
  const L=(typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA&&LAYOUT_BATALHA.cantoInferior)||{};
  const me=L.menu||{x:[5,29],y:[85,90.4]};
  return `<div class="menu bt-menu" id="menu" style="position:absolute;left:${U(me.x[0])};bottom:${U(100-me.y[0]+1)};z-index:30;min-width:${U(30)}">
    <button class="b b--quiet b--md" id="bhelp">Como jogar</button>
    <button class="b b--quiet b--md" id="blog">Registro</button>
    <button class="b b--quiet b--md" id="bfull">${estaTelaCheia()?'Sair da tela cheia':'Tela cheia'}</button>
    ${(typeof contaAtual!=='undefined'&&contaAtual)?`<button class="b b--quiet b--md" id="bconta">Sua conta</button>`:''}
    <button class="b b--quiet b--md" id="bsair">Sair para o início</button>
    <button class="b b--danger b--md" id="bapagar">Apagar dados</button>
    <div class="menu__build" id="bmenubuild" title="toque 3× para diagnóstico">${H(buildStr())}</div>
  </div>`;
}

/* ---------- eventos da barra superior + canto inferior ---------- */
function ligarTopo(){
  const q=s=>stage.querySelector(s);
  stage.querySelectorAll('[data-prof]').forEach(b=>b.onclick=()=>{ov='perfil';menuAberto=false;render();});
  const bt=q('#btrocar'); if(bt&&!bt.disabled)bt.onclick=()=>{ ov='conv';convAlvo=null;armado=null;alvos=[];escolhidos=[];detalhe=null;peekKit=null;menuAberto=false;render(); };
  const be=q('#bend2'); if(be&&!be.disabled)be.onclick=()=>encerrarTurno();
  const baj=q('#bajustes'); if(baj)baj.onclick=ev=>{ev.stopPropagation();menuAberto=!menuAberto;render();};
  const bm=q('#bmenu'); if(bm)bm.onclick=ev=>{ev.stopPropagation();menuAberto=!menuAberto;render();};
  const bs=q('#bsurr'); if(bs)bs.onclick=()=>{ov='surr';menuAberto=false;render();};
  const bh=q('#bhelp'); if(bh)bh.onclick=()=>{ov='help';menuAberto=false;render();};
  const bl=q('#blog'); if(bl)bl.onclick=()=>{ov=ov==='log'?null:'log';menuAberto=false;render();};
  const bf=q('#bfull'); if(bf)bf.onclick=()=>{alternarTelaCheia();menuAberto=false;render();};
  const bx=q('#bsair'); if(bx)bx.onclick=()=>{ov='sair';menuAberto=false;render();};
  const ba=q('#bapagar'); if(ba)ba.onclick=()=>{ov='apagar';menuAberto=false;render();};
  const bc=q('#bconta'); if(bc)bc.onclick=ev=>{ev.stopPropagation();menuAberto=false;render();if(typeof montarPainelConta==='function')montarPainelConta();};
  const bb=q('#bmenubuild'); if(bb){ let n=0,t; bb.onclick=ev=>{ev.stopPropagation(); clearTimeout(t); if(++n>=3){n=0; const el=document.getElementById('diag'); if(el){el.classList.toggle('on'); if(typeof renderDiag==='function')renderDiag();}} t=setTimeout(()=>n=0,600);};}
  if(menuAberto){
    const mm=q('#menu');
    stage.onclick=ev=>{ if(mm&&!mm.contains(ev.target)&&!(ev.target.closest&&(ev.target.closest('#bmenu')||ev.target.closest('#bajustes')))){ stage.onclick=null;menuAberto=false;render(); } };
  } else stage.onclick=null;
}

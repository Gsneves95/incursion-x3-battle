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
// §330: a sublinha do jogador mostra o MODO + progresso (calculado em view.js, passado p/ cá); senão ranque PvP ou SANDBOX.
function _subJogador(modoSub){ if(modoSub) return modoSub;
  if(typeof MP!=='undefined'&&MP){ const r=(typeof contaAtual!=='undefined'&&contaAtual&&(contaAtual.ranque||contaAtual.rank))||''; return r?String(r).toUpperCase():'PvP'; }
  return 'SANDBOX'; }
function _subOponente(){ return (typeof MP!=='undefined'&&MP) ? 'PvP' : 'OPONENTE'; }
// §330: contadores de energia — orbe colorido (en.orb) + ×N (fonte en.fonte) por tipo presente, e o total Σ no fim.
function btEnergiaHTML(l, en){
  en=en||{orb:3.6};
  const proprios=new Set(l.units.filter(u=>u.vivo).map(u=>u.elem));
  const mostrar=ELEMS.filter(e=>proprios.has(e)||l.orbs[e]>0);
  const total=ELEMS.reduce((s,e)=>s+l.orbs[e],0);
  const dot=`width:${U(en.orb||3.6)};height:${U(en.orb||3.6)}`;
  const cel=e=>`<span class="bt-ec" title="${ELAB[e]}"><span class="bt-ec__dot" style="background:${COR(e)};${dot}"></span>×${l.orbs[e]}</span>`;
  return mostrar.map(cel).join('')+`<span class="bt-ec bt-ec--tot"><span class="bt-ec__dot bt-ec__dot--tot">Σ</span>×${total}</span>`;
}
// §330: número de turnos do prazo (RITO/CAMPANHA), p/ a linha "Turno N/Prazo"; null se não houver prazo.
function _prazoN(){
  const src=(typeof prova!=='undefined'&&prova)?prova:((typeof campanha!=='undefined'&&campanha)?campanha:null);
  if(!src||!src.condicoes) return null;
  const dl=src.condicoes.find(c=>c.predicado==='deadline'); return dl?dl.turnos:null;
}
function topoHTML(modoSub){
  const T=_LBT(); const eu=ladoExibido();
  const l=st.lados[eu], o=st.lados[1-eu];
  const meu=ehMeuTurno();
  const aj=T.ajustes||{x:1.5,y:1.3,size:4};
  const jg=T.jogador||{nomeFimX:40,avatar:{x:41,y:1.3,size:8}};
  const op=T.oponente||{nomeIniDir:40,avatar:{dir:41,y:1.3,size:8}};
  const ce=T.centro||{y:0.8,h:10.4,gap:2};
  const en=T.energia||{orb:3.6,fonte:2.6,trocar:4.5};
  const et=T.encerrar||{w:30,h:6,fonte:2.6,barra:1.2,linha:1.9};
  const mm=Math.floor(relogio/60), ss=String(relogio%60).padStart(2,'0');
  const pct=Math.max(0,Math.min(100,Math.round(relogio/TURNO_SEG*100)));
  const prontas=l.units.filter(u=>podeAgir(u)).length;
  // §330: linha única "Turno N[/Prazo][ · faltam R] · <estado> · m:ss" (o número do turno sai do HUD de modo).
  const N=_prazoN();
  let restam=''; if(N!=null&&(prova||campanha)){ const r=Math.max(0,N-st.turno+1); restam = r===0?' · esgotado':r===1?' · último':(' · faltam '+r); }
  const estadoCurto = meu ? (l.dividaLivre>0?`escolher ${l.dividaLivre} livre`:(prontas?`${prontas} a agir`:'todas agiram')) : 'aguarde';
  const linha = `Turno ${st.turno}${N!=null?'/'+N:''}${restam} · ${estadoCurto} · ${mm}:${ss}`;
  const estadoTxt = meu ? 'ENCERRAR TURNO' : 'TURNO DO OPONENTE…';
  const trocarDisab = (!meu||l.converteu||totalOrbs(l)<CONV_CUSTO);
  // CAIXA de energias (orbes + Σ) com o ⇄ TROCAR na ponta; à direita, o botão ENCERRAR TURNO com barra e a linha.
  const ebox = `<div class="bt-ebox" style="height:${U(en.trocar+1.8)};font-size:${U(en.fonte)}">
    ${btEnergiaHTML(l, en)}
    <button class="bt-trocar" id="btrocar" ${trocarDisab?'disabled':''} title="Trocar ${CONV_CUSTO} energias por 1" style="height:${U(en.trocar)};font-size:${U(Math.max(2.2,en.fonte-0.4))}">⇄ Trocar</button>
  </div>`;
  const endwrap = `<div class="bt-endwrap" style="gap:${U(0.5)}">
    <button class="bt-encerrar" id="bend2" ${meu?'':'disabled'} style="width:${U(et.w)};height:${U(et.h)};font-size:${U(et.fonte)}">${H(estadoTxt)}</button>
    <span class="bt-encerrar__barra" style="width:${U(et.w)};height:${U(et.barra)}"><span class="bt-barra__fill" style="width:${pct}%"></span></span>
    <span class="bt-encerrar__linha" style="font-size:${U(et.linha)}">${H(linha)}</span>
  </div>`;
  return `
  <button class="bt-ajustes" id="bajustes" title="Menu" style="left:${U(aj.x)};top:${U(aj.y)};width:${U(aj.size)};height:${U(aj.size)}">
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 7h12M17 7h4M3 17h4M9 17h12M14 3v8M8 13v8"/><circle cx="15.5" cy="7" r="2"/><circle cx="8.5" cy="17" r="2"/></svg>
  </button>
  <div class="bt-name bt-name--me" style="left:${U(aj.x+aj.size+1)};right:calc(100% - ${U(jg.nomeFimX)});top:${U(aj.y)};height:${U(jg.avatar.size)}">
    <span class="bt-name__nick" style="font-size:${U(2.7)}">${H('Você')}</span>
    <span class="bt-name__sub" style="font-size:${U(1.9)}">${H(_subJogador(modoSub))}</span>
  </div>
  <button class="bt-prof" data-prof="me" title="Perfil" style="left:${U(jg.avatar.x)};top:${U(jg.avatar.y)};width:${U(jg.avatar.size)};height:${U(jg.avatar.size)}">
    <span class="bt-prof__pic" style="width:100%;height:100%">${AVATAR_SVG}</span>
  </button>
  <button class="bt-prof bt-prof--foe" data-prof="foe" title="Perfil" style="right:${U(op.avatar.dir)};top:${U(op.avatar.y)};width:${U(op.avatar.size)};height:${U(op.avatar.size)}">
    <span class="bt-prof__pic" style="width:100%;height:100%">${AVATAR_SVG}</span>
  </button>
  <div class="bt-name bt-name--foe" style="left:calc(100% - ${U(op.nomeIniDir)});right:${U(aj.x)};top:${U(op.avatar.y)};height:${U(op.avatar.size)}">
    <span class="bt-name__nick" style="font-size:${U(2.7)}">${H(rotuloLado(1-eu))}</span>
    <span class="bt-name__sub" style="font-size:${U(1.9)}">${H(_subOponente())}</span>
  </div>
  <div class="bt-topcentro" style="left:50%;transform:translateX(-50%);top:${U(ce.y)};height:${U(ce.h)};gap:${U(ce.gap)}">${ebox}${endwrap}</div>
  ${cantoInfHTML()}
  ${menuAberto?menuDropHTML():''}`;
}

// CANTO INFERIOR ESQUERDO: DESISTIR, MENU, SOM. §330: a arte do canto SAIU (invadia a 3ª fileira).
function cantoInfHTML(){
  const L=(typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA&&LAYOUT_BATALHA.cantoInferior)||{};
  const ds=L.desistir||{x:[4,40],y:[84,88.5]}, me=L.menu||{x:[4,40],y:[89.5,94]}, so=L.som||{x:[4,40],y:[95,98.5]};
  const box=(o)=>`left:${U(o.x[0])};top:${U(o.y[0])};width:${U(o.x[1]-o.x[0])};height:${U(o.y[1]-o.y[0])}`;
  return `
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
  // §330: em 16:9 ESTREITO, se a linha central encostar num avatar, esconde as IMAGENS de avatar (os nomes ficam) —
  // nunca sobrepõe; os números de energia nunca encolhem abaixo de 2,2u (fixo no JSON).
  try{ const base=document.getElementById('baselayer'); const tc=q('.bt-topcentro');
    if(base&&tc){ base.classList.remove('bt-topaperto'); const rc=tc.getBoundingClientRect();
      const bate=[...stage.querySelectorAll('.bt-prof')].some(p=>{const r=p.getBoundingClientRect(); return r.width>1 && !(rc.right<=r.left+0.5||rc.left>=r.right-0.5);});
      if(bate) base.classList.add('bt-topaperto'); } }catch(e){}
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

// ui/topo.js — §335: a BARRA SUPERIOR do design do dono (Claude Design), em PX de design (tela fixa 1846×852).
// PlayerHeader (avatar+nome+sub) · EnergyCounter (quadrados + Σ + ⇄ TROCAR) · TurnControl (ENCERRAR + barra + linha) ·
// BattleMenuButton (☰) · OpponentHeader. O menu (☰) abre o OVERLAY central (CONTINUAR / SOM / utilidades / RENDER-SE).
// Os botões DESISTIR/MENU/som do canto e o botão de ajustes do canto SAÍRAM (tudo foi para o menu).

const AVATAR_SVG='<svg viewBox="0 0 24 24" aria-hidden="true" style="width:72%;height:72%;color:#C9A44C"><path fill="currentColor" d="M12 12.6a4.3 4.3 0 1 0 0-8.6 4.3 4.3 0 0 0 0 8.6Zm0 1.7c-3.7 0-7.4 1.9-7.4 4.6V21h14.8v-2.1c0-2.7-3.7-4.6-7.4-4.6Z"/></svg>';
// §335b: o AVATAR do topo mostra o RETRATO do 1º deus do lado (jogador/CPU). Se a arte faltar (ou no fallback), volta
// ao ícone genérico (fallbackSvg). No PvP não há avatar de perfil guardado, então o 1º deus do time serve igual.
function _avatarInner(unidade, fallbackSvg){
  const key=unidade&&unidade.key;
  const tem=key&&(typeof RETRATO_ARTE!=='undefined'&&RETRATO_ARTE&&RETRATO_ARTE[key]);
  if(tem) return `<img src="retratos/${H(key)}.webp" alt="" style="width:100%;height:100%;object-fit:cover;object-position:50% 18%" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span style="display:none;width:100%;height:100%;align-items:center;justify-content:center">${fallbackSvg}</span>`;
  return fallbackSvg;
}

function _LBT(){ return (typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA)||{}; }
// §330/§333: a sublinha do jogador mostra o MODO + progresso curto (calculado em view.js); senão ranque PvP ou SANDBOX.
function _subJogador(modoSub){ if(modoSub) return modoSub;
  if(typeof MP!=='undefined'&&MP){ const r=(typeof contaAtual!=='undefined'&&contaAtual&&(contaAtual.ranque||contaAtual.rank))||''; return r?String(r).toUpperCase():'PvP'; }
  return 'SANDBOX'; }
function _subOponente(){ return (typeof MP!=='undefined'&&MP) ? 'PvP' : 'OPONENTE'; }
// número de turnos do prazo (RITO/CAMPANHA), p/ a linha "Turno N/Prazo"; null se não houver prazo.
function _prazoN(){
  const src=(typeof prova!=='undefined'&&prova)?prova:((typeof campanha!=='undefined'&&campanha)?campanha:null);
  if(!src||!src.condicoes) return null;
  const dl=src.condicoes.find(c=>c.predicado==='deadline'); return dl?dl.turnos:null;
}
// §335: quadrados de energia (um por elemento presente, cor do elemento) + ×N, e o Σ total.
function btEnergiaHTML(l, en){
  const q=en.quad||26;
  const proprios=new Set(l.units.filter(u=>u.vivo).map(u=>u.elem));
  const mostrar=ELEMS.filter(e=>proprios.has(e)||l.orbs[e]>0);
  const total=ELEMS.reduce((s,e)=>s+l.orbs[e],0);
  const cel=e=>`<div class="bt-ec" style="display:flex;align-items:center;gap:7px"><div title="${ELAB[e]}" style="width:${q}px;height:${q}px;border-radius:4px;background:${COR(e)};box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 -2px 0 rgba(0,0,0,.25)"></div><span style="font-size:${en.xN||21}px;font-weight:600;color:#F2F4F8">x${l.orbs[e]}</span></div>`;
  const sigma=`<div style="display:flex;align-items:center;gap:4px"><span class="cin" style="font-weight:700;font-size:${en.sigma||24}px;color:#F0B43C;line-height:1">Σ</span><span style="font-size:${en.xN||21}px;font-weight:600;color:#F2F4F8">x${total}</span></div>`;
  return mostrar.map(cel).join('')+sigma;
}
function topoHTML(modoSub){
  const L=_LBT(), Hd=L.header||{}, cor=L.cor||{}, eu=ladoExibido();
  const l=st.lados[eu], o=st.lados[1-eu], meu=ehMeuTurno();
  const jg=Hd.jogador||{left:66,top:19,gap:18,avatar:58,nome:25,sub:18};
  const en=Hd.energia||{left:590,top:26,w:388,h:50,quad:26,xN:21,sigma:24,trocarH:34};
  const tc=Hd.turno||{left:1000,top:4,w:307,btnH:52,btnFonte:23,barra:9,linha:18};
  const mb=Hd.menuBtn||{left:1328,top:18,size:46};
  const op=Hd.oponente||{left:1562,top:19,gap:16,avatar:58,nome:25,sub:18};
  const mm=Math.floor(relogio/60), ss=String(relogio%60).padStart(2,'0');
  const pct=Math.max(0,Math.min(100,Math.round(relogio/TURNO_SEG*100)));
  const prontas=l.units.filter(u=>podeAgir(u)).length;
  const N=_prazoN(); let restam=''; if(N!=null&&(prova||campanha)){ const r=Math.max(0,N-st.turno+1); restam=r===0?' · esgotado':r===1?' · último':(' · faltam '+r); }
  const estadoCurto = meu ? (l.dividaLivre>0?`escolher ${l.dividaLivre} livre`:(prontas?`${prontas} a agir`:'todas agiram')) : 'oponente';
  const linha = `Turno ${st.turno}${N!=null?'/'+N:''}${restam} · ${estadoCurto} · ${mm}:${ss}`;
  const estadoTxt = meu ? 'ENCERRAR TURNO' : 'TURNO DO OPONENTE';
  const trocarDisab = (!meu||l.converteu||totalOrbs(l)<CONV_CUSTO);
  const endBg = meu ? 'linear-gradient(180deg,#FBE29A 0%,#E9C25A 45%,#C9962F 100%)' : 'linear-gradient(180deg,#8C7A55,#5E4F33)';

  const player=`<div class="bt-name bt-name--me" style="position:absolute;left:${jg.left}px;top:${jg.top}px;display:flex;align-items:center;gap:${jg.gap}px">
    <button class="b5-hover" data-prof="me" title="Perfil" style="width:${jg.avatar}px;height:${jg.avatar}px;flex:none;border-radius:3px;overflow:hidden;border:0;padding:0;display:flex;align-items:center;justify-content:center;background:#0C1020;box-shadow:0 0 0 1.5px #C9A44C,0 0 0 3px rgba(0,0,0,.6);cursor:pointer">${_avatarInner(l.units[0],AVATAR_SVG)}</button>
    <div style="display:flex;flex-direction:column;gap:2px">
      <div class="cin bt-name__nick" style="font-weight:700;font-size:${jg.nome}px;line-height:1.1;color:#F0B43C;letter-spacing:.02em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:440px">VOCÊ</div>
      <div class="bt-name__sub" style="font-size:${jg.sub}px;font-weight:600;line-height:1.1;color:#E8ECF4;letter-spacing:.02em;white-space:nowrap">${H(_subJogador(modoSub))}</div>
    </div></div>`;

  const energia=`<div class="bt-ebox" style="position:absolute;left:${en.left}px;top:${en.top}px;width:${en.w}px;height:${en.h}px;box-sizing:border-box;overflow:hidden;display:flex;align-items:center;gap:14px;padding:0 10px 0 12px;border-radius:7px;background:linear-gradient(180deg,rgba(12,16,30,.92),rgba(5,8,16,.92));box-shadow:inset 0 0 0 1px rgba(201,164,76,.75)">
    ${btEnergiaHTML(l,en)}
    <button class="b5-hover bt-trocar" id="btrocar" ${trocarDisab?'disabled':''} title="Trocar ${CONV_CUSTO} energias por 1" style="margin-left:auto;height:${en.trocarH||34}px;padding:0 12px;display:flex;align-items:center;gap:6px;border-radius:5px;border:0;background:none;box-shadow:inset 0 0 0 1px rgba(201,164,76,.9);cursor:pointer;opacity:${trocarDisab?.5:1}">
      <span style="font-size:20px;font-weight:700;color:#F0B43C;line-height:1">⇄</span><span style="font-size:20px;font-weight:700;letter-spacing:.04em;color:#F0B43C">TROCAR</span></button></div>`;

  const turno=`<div style="position:absolute;left:${tc.left}px;top:${tc.top}px;width:${tc.w}px;display:flex;flex-direction:column;align-items:stretch;gap:6px">
    <button class="b5-end" id="bend2" ${meu?'':'disabled'} style="height:${tc.btnH}px;display:flex;align-items:center;justify-content:center;border:0;border-radius:4px;cursor:${meu?'pointer':'default'};background:${endBg};box-shadow:inset 0 0 0 1px rgba(255,236,170,.7),inset 0 2px 0 rgba(255,250,225,.6),0 4px 14px rgba(0,0,0,.6);opacity:${meu?1:.7}">
      <span class="cin" style="font-weight:700;font-size:${tc.btnFonte}px;letter-spacing:.03em;color:#2A1A04">${H(estadoTxt)}</span></button>
    <div style="position:relative;height:${tc.barra}px;border-radius:5px;background:#120A0C;box-shadow:inset 0 0 0 1px rgba(201,164,76,.55)">
      <div class="bt-barra__fill" style="position:absolute;left:1px;top:1px;bottom:1px;width:calc(${pct}% - 2px);border-radius:4px;background:linear-gradient(90deg,#B3161E 0%,#E0332B 45%,#F09A2A 80%,#F6D36A 100%)"></div></div>
    <div class="bt-encerrar__linha" style="text-align:center;font-size:${tc.linha}px;font-weight:600;color:#EEF1F6;letter-spacing:.01em">${H(linha)}</div></div>`;

  const menuBtn=`<button class="b5-hover" id="bmenu" title="Menu" style="position:absolute;left:${mb.left}px;top:${mb.top}px;width:${mb.size}px;height:${mb.size}px;border:0;border-radius:6px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;background:rgba(8,11,22,.8);box-shadow:inset 0 0 0 1px rgba(201,164,76,.6)">
    <span style="width:22px;height:2.5px;border-radius:2px;background:#E6C77A"></span><span style="width:22px;height:2.5px;border-radius:2px;background:#E6C77A"></span><span style="width:22px;height:2.5px;border-radius:2px;background:#E6C77A"></span></button>`;

  const opp=`<div class="bt-name bt-name--foe" style="position:absolute;left:${op.left}px;top:${op.top}px;display:flex;align-items:center;gap:${op.gap}px">
    <button class="b5-hover" data-prof="foe" title="Perfil" style="width:${op.avatar}px;height:${op.avatar}px;flex:none;border-radius:3px;overflow:hidden;border:0;padding:0;display:flex;align-items:center;justify-content:center;background:#0C1020;box-shadow:0 0 0 1.5px #C9343C,0 0 0 3px rgba(0,0,0,.6);cursor:pointer">${_avatarInner(o.units[0],'<svg viewBox="0 0 24 24" aria-hidden="true" style="width:72%;height:72%;color:#C9343C"><path fill="currentColor" d="M12 12.6a4.3 4.3 0 1 0 0-8.6 4.3 4.3 0 0 0 0 8.6Zm0 1.7c-3.7 0-7.4 1.9-7.4 4.6V21h14.8v-2.1c0-2.7-3.7-4.6-7.4-4.6Z"/></svg>')}</button>
    <div style="display:flex;flex-direction:column;gap:2px">
      <div class="cin bt-name__nick" style="font-weight:700;font-size:${op.nome}px;line-height:1.1;color:#E8343C;letter-spacing:.02em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px">${H(rotuloLado(1-eu))}</div>
      <div class="bt-name__sub" style="font-size:${op.sub}px;font-weight:600;line-height:1.1;color:#E8ECF4;letter-spacing:.02em">${H(_subOponente())}</div>
    </div></div>`;

  return `<header style="position:absolute;left:0;right:0;top:0;height:${Hd.h||96}px">${player}${energia}${turno}${menuBtn}${opp}</header>${menuAberto?menuOverlayHTML():''}`;
}

// §335: MENU central (overlay). CONTINUAR · SOM (volume dourado) · utilidades (conta/build/ajuda/registro/tela cheia/
// apagar/sair) · RENDER-SE (borda vermelha, pede confirmação). Substitui o dropdown e o canto inferior esquerdo.
function menuOverlayHTML(){
  const M=(_LBT().menu)||{w:420,itemH:58,titulo:26,item:20};
  const temConta=(typeof contaAtual!=='undefined'&&contaAtual);
  const item=(id,label,ring,color)=>`<button class="b5-menuitem cin" id="${id}" style="height:${M.itemH}px;display:flex;align-items:center;justify-content:center;border:0;border-radius:4px;cursor:pointer;background:none;box-shadow:inset 0 0 0 1px ${ring||'rgba(201,164,76,.5)'};font-weight:700;font-size:${M.item}px;color:${color||'#E4E8F0'}">${H(label)}</button>`;
  const som=`<div style="height:${M.itemH}px;display:flex;align-items:center;gap:12px;padding:0 16px;border-radius:4px;box-shadow:inset 0 0 0 1px rgba(201,164,76,.5)">
    <span style="font-size:20px">🔊</span><span class="cin" style="font-weight:700;font-size:${M.item}px;color:#E4E8F0">SOM</span>
    <input class="b5-range" type="range" min="0" max="100" value="80" aria-label="Volume" style="flex:1"></div>`;
  return `<div id="b5menu" style="position:absolute;inset:0;z-index:20;background:rgba(2,3,8,.7);display:flex;align-items:center;justify-content:center">
    <div id="menu" style="width:${M.w}px;padding:30px 34px;box-sizing:border-box;display:flex;flex-direction:column;gap:14px;border-radius:8px;background:linear-gradient(180deg,#0E1324,#070A14);box-shadow:inset 0 0 0 1px rgba(201,164,76,.8),0 20px 60px rgba(0,0,0,.7)">
      <div class="cin" style="font-weight:700;font-size:${M.titulo}px;color:#F0B43C;text-align:center;margin-bottom:6px">MENU</div>
      ${item('bcontinuar','CONTINUAR','rgba(201,164,76,.8)','#F4F1EA')}
      ${som}
      ${item('bhelp','COMO JOGAR')}
      ${item('blog','REGISTRO')}
      ${item('bfull',estaTelaCheia()?'SAIR DA TELA CHEIA':'TELA CHEIA')}
      ${temConta?item('bconta','SUA CONTA'):''}
      ${item('bapagar','APAGAR DADOS')}
      ${item('bsair','SAIR PARA O INÍCIO')}
      ${item('bsurr','RENDER-SE','rgba(232,52,60,.7)','#FF8A8F')}
      <div id="bmenubuild" title="toque 3× para diagnóstico" style="text-align:center;font-size:13px;color:#6b6480;cursor:pointer">${H(buildStr())}</div>
    </div></div>`;
}

/* ---------- eventos da barra superior + menu ---------- */
function ligarTopo(){
  const q=s=>stage.querySelector(s);
  stage.querySelectorAll('[data-prof]').forEach(b=>b.onclick=()=>{ov='perfil';menuAberto=false;render();});
  const bt=q('#btrocar'); if(bt&&!bt.disabled)bt.onclick=()=>{ ov='conv';convAlvo=null;armado=null;alvos=[];escolhidos=[];detalhe=null;peekKit=null;menuAberto=false;render(); };
  // §331: ENCERRAR sem agir → pede confirmação; senão encerra direto.
  const be=q('#bend2'); if(be&&!be.disabled)be.onclick=()=>{ if(deveConfirmarEncerrar()){ ov='confirmEnc'; menuAberto=false; render(); } else encerrarTurno(); };
  const bm=q('#bmenu'); if(bm)bm.onclick=ev=>{ev.stopPropagation();menuAberto=!menuAberto;render();};
  // itens do menu overlay
  const bco=q('#bcontinuar'); if(bco)bco.onclick=()=>{menuAberto=false;render();};
  const bs=q('#bsurr'); if(bs)bs.onclick=()=>{ov='surr';menuAberto=false;render();};
  const bh=q('#bhelp'); if(bh)bh.onclick=()=>{ov='help';menuAberto=false;render();};
  const bl=q('#blog'); if(bl)bl.onclick=()=>{ov=ov==='log'?null:'log';menuAberto=false;render();};
  const bf=q('#bfull'); if(bf)bf.onclick=()=>{alternarTelaCheia();menuAberto=false;render();};
  const bx=q('#bsair'); if(bx)bx.onclick=()=>{ov='sair';menuAberto=false;render();};
  const ba=q('#bapagar'); if(ba)ba.onclick=()=>{ov='apagar';menuAberto=false;render();};
  const bc=q('#bconta'); if(bc)bc.onclick=ev=>{ev.stopPropagation();menuAberto=false;render();if(typeof montarPainelConta==='function')montarPainelConta();};
  const bb=q('#bmenubuild'); if(bb){ let n=0,t; bb.onclick=ev=>{ev.stopPropagation(); clearTimeout(t); if(++n>=3){n=0; const el=document.getElementById('diag'); if(el){el.classList.toggle('on'); if(typeof renderDiag==='function')renderDiag();}} t=setTimeout(()=>n=0,600);};}
  // fechar o overlay tocando fora do cartão
  const mo=q('#b5menu'); if(mo)mo.onclick=ev=>{ if(ev.target===mo){ menuAberto=false; render(); } };
}

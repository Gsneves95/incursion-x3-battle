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
// §336b: medidor de texto (canvas) p/ dimensionar a caixa de energia sem estourar; cai p/ estimativa se o canvas faltar.
// IMPORTANTE: no jsdom o getContext LANÇA "Not implemented" e suja o console virtual (um teste acusa isso), então nem
// tentamos lá — detecta o jsdom pelo userAgent e usa a estimativa. No navegador real mede de verdade.
let _emc=null;
function _canvasMedivel(){
  try{ if(typeof document==='undefined'||!document.createElement) return false;
    if(typeof navigator!=='undefined' && navigator.userAgent && /jsdom|node\.js/i.test(navigator.userAgent)) return false;
    return true; }catch(e){ return false; }
}
function _medeTxt(txt, font, px){
  try{ if(_emc===null){ _emc = _canvasMedivel() ? (document.createElement('canvas').getContext('2d')) : false; }
    if(_emc){ _emc.font=font; const w=_emc.measureText(txt).width; if(w>0) return w; } }catch(e){ _emc=false; }
  return (txt?String(txt).length:0)*px*0.56;   // estimativa (char×fator)
}
// §335: a REGRA de quais tipos aparecem — os ELEMENTOS DO TIME (vivos) ∪ qualquer tipo com quantidade > 0.
function _tiposEnergia(l){
  const proprios=new Set(l.units.filter(u=>u.vivo).map(u=>u.elem));
  return ELEMS.filter(e=>proprios.has(e)||l.orbs[e]>0);
}
// §336b: largura do conteúdo da caixa p/ um tamanho S={q,f,s,g,ig}. Σ e ⇄ TROCAR SEMPRE contam (nunca somem/cortam).
function _larguraEnergia(l, tipos, total, S, comLabel){
  const padd=16;                                   // padding 8 (esq) + 8 (dir)
  let cells=0; for(const e of tipos) cells += S.q + S.ig + _medeTxt('x'+l.orbs[e], `${S.f}px Rajdhani, sans-serif`, S.f) + 2;
  const sigma = _medeTxt('Σ', `700 ${S.s}px Cinzel, serif`, S.s) + 4 + _medeTxt(''+total, `${S.f}px Rajdhani, sans-serif`, S.f) + 2;
  // §362: ⇄ TROCAR — com rótulo (fonte 12) quando cabe; só o ícone ⇄ (toque ≥40) quando aperta.
  const trocar = comLabel ? (14 + _medeTxt('⇄', '700 14px Rajdhani, sans-serif', 14) + 5 + _medeTxt('TROCAR', '700 12px Rajdhani, sans-serif', 12) + 8)
                          : (40);   // botão ícone-só mínimo 40 de toque
  const gaps = (tipos.length + 2 - 1) * S.g;        // células + Σ + TROCAR
  return Math.ceil(padd + cells + sigma + trocar + gaps + 8);
}
// §336b: fim (px) do bloco do NOME do jogador — avatar + maior das duas linhas (nick capado em 440 como no CSS).
function _fimNomeJogador(jg, modoSub){
  const nick=_medeTxt('VOCÊ', `700 ${jg.nome}px Cinzel, serif`, jg.nome);
  const sub =_medeTxt(_subJogador(modoSub), `600 ${jg.sub}px Rajdhani, sans-serif`, jg.sub);
  const txt=Math.max(Math.min(nick,120), Math.min(sub,92));   // §362: nick ≤120, sub ≤92 (cabe a caixa de energia de 6 tipos)
  return jg.left + jg.avatar + jg.gap + txt;
}
// §336b: geometria da caixa de energia — borda DIREITA fixa (não encosta no ENCERRAR), cresce p/ a esquerda até 24px do
// fim do nome; se não couber, encolhe os quadrados (26→20) e a fonte (21→17). Com ≤3 tipos fica igual ao HTML (388@590).
function _geoEnergia(l, en, jg, modoSub){
  const tipos=_tiposEnergia(l), total=ELEMS.reduce((s,e)=>s+l.orbs[e],0);
  const rightEdge=en.left+en.w;                     // borda direita fixa
  const leftMin=_fimNomeJogador(jg, modoSub)+12;    // limite esquerdo (12 do fim do nome)
  const Wmax=Math.max(en.w, rightEdge-leftMin);     // nunca menor que o tamanho base
  // §362: tamanhos no canvas 780 — xN sempre ≥12 (eixo a); quadrados 16→13.
  const SIZES=[{q:16,f:12,s:13,g:5,ig:3},{q:15,f:12,s:13,g:4,ig:2},{q:14,f:12,s:12,g:4,ig:2},{q:13,f:12,s:12,g:3,ig:2}];
  // cabe no tamanho base COM o rótulo "TROCAR"? então fica no base.
  if(_larguraEnergia(l,tipos,total,SIZES[0],true) <= en.w) return { left:en.left, width:en.w, S:SIZES[0], label:true };
  // senão, cresce p/ a esquerda (borda direita fixa) ainda com rótulo, encolhendo os quadrados.
  let S=SIZES[0], w=_larguraEnergia(l,tipos,total,S,true);
  for(const cand of SIZES){ S=cand; w=_larguraEnergia(l,tipos,total,cand,true); if(w<=Wmax) break; }
  if(w<=Wmax){ const width=Math.min(Math.max(w,en.w),Wmax); return { left:rightEdge-width, width, S, label:true }; }
  // nem no menor cabe com rótulo → TROCAR só o ícone ⇄ (toque ≥40 garantido no botão).
  for(const cand of SIZES){ S=cand; w=_larguraEnergia(l,tipos,total,cand,false); if(w<=Wmax) break; }
  const width=Math.min(Math.max(w,en.w),Wmax);
  return { left:rightEdge-width, width, S, label:false };
}
// §335/§336b: quadrados de energia (um por tipo mostrado, cor do elemento) + ×N e o Σ total, no tamanho S.
function btEnergiaHTML(l, S){
  const tipos=_tiposEnergia(l);
  const total=ELEMS.reduce((s,e)=>s+l.orbs[e],0);
  const cel=e=>`<div class="bt-ec" title="${ELAB[e]}" style="flex:none;display:flex;align-items:center;gap:${S.ig}px">${orbe(e,S.q)}<span style="font-size:${S.f}px;font-weight:600;color:#F2F4F8">x${l.orbs[e]}</span></div>`;
  const sigma=`<div class="bt-esigma" style="flex:none;display:flex;align-items:center;gap:4px"><span class="cin" style="font-weight:700;font-size:${S.s}px;color:#F0B43C;line-height:1">Σ</span><span style="font-size:${S.f}px;font-weight:600;color:#F2F4F8">${total}</span></div>`;
  return tipos.map(cel).join('')+sigma;
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
      <div class="cin bt-name__nick" style="font-weight:700;font-size:${jg.nome}px;line-height:1.1;color:#F0B43C;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px">Você</div>
      <div class="bt-name__sub" style="font-size:${jg.sub}px;font-weight:600;line-height:1.1;color:#E8ECF4;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:92px">${H(_subJogador(modoSub))}</div>
    </div></div>`;

  const geo=_geoEnergia(l, en, jg, modoSub);
  const energia=`<div class="bt-ebox" style="position:absolute;left:${geo.left}px;top:${en.top}px;width:${geo.width}px;height:${en.h}px;box-sizing:border-box;overflow:visible;display:flex;align-items:center;gap:${geo.S.g}px;padding:0 10px 0 12px;border-radius:7px;background:linear-gradient(180deg,rgba(12,16,30,.92),rgba(5,8,16,.92));box-shadow:inset 0 0 0 1px rgba(201,164,76,.75)">
    ${btEnergiaHTML(l,geo.S)}
    <button class="b5-hover bt-trocar" id="btrocar" ${trocarDisab?'disabled':''} title="Trocar ${CONV_CUSTO} energias por 1" style="flex:none;margin-left:auto;min-width:${en.trocarH||40}px;height:${en.trocarH||40}px;padding:0 ${geo.label?8:0}px;display:flex;align-items:center;justify-content:center;gap:5px;border-radius:5px;border:0;background:none;box-shadow:inset 0 0 0 1px rgba(201,164,76,.9);cursor:pointer;opacity:${trocarDisab?.5:1}">
      <span style="font-size:14px;font-weight:700;color:#F0B43C;line-height:1">⇄</span>${geo.label?`<span style="font-size:12px;font-weight:700;letter-spacing:.03em;color:#F0B43C">TROCAR</span>`:''}</button></div>`;

  const turno=`<div style="position:absolute;left:${tc.left}px;top:${tc.top}px;width:${tc.w}px;display:flex;flex-direction:column;align-items:stretch;gap:2px">
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
      <div class="cin bt-name__nick" style="font-weight:700;font-size:${op.nome}px;line-height:1.1;color:#E8343C;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px">${H(rotuloLado(1-eu))}</div>
      <div class="bt-name__sub" style="font-size:${op.sub}px;font-weight:600;line-height:1.1;color:#E8ECF4;letter-spacing:.02em">${H(_subOponente())}</div>
    </div></div>`;

  return `<header style="position:absolute;left:0;right:0;top:0;height:${Hd.h||96}px">${player}${energia}${turno}${menuBtn}${opp}</header>${menuAberto?menuOverlayHTML():''}`;
}

// §335: MENU central (overlay). CONTINUAR · SOM (volume dourado) · utilidades (conta/build/ajuda/registro/tela cheia/
// apagar/sair) · RENDER-SE (borda vermelha, pede confirmação). Substitui o dropdown e o canto inferior esquerdo.
function menuOverlayHTML(){
  const M=(_LBT().menu)||{w:320,itemH:40,titulo:16,item:13};
  const temConta=(typeof contaAtual!=='undefined'&&contaAtual);
  const item=(id,label,ring,color)=>`<button class="b5-menuitem cin" id="${id}" style="height:${M.itemH}px;padding:0 8px;display:flex;align-items:center;justify-content:center;border:0;border-radius:4px;cursor:pointer;background:none;box-shadow:inset 0 0 0 1px ${ring||'rgba(201,164,76,.5)'};font-weight:700;font-size:${M.item}px;color:${color||'#E4E8F0'};white-space:nowrap">${H(label)}</button>`;
  const som=`<div style="height:${M.itemH}px;display:flex;align-items:center;gap:8px;padding:0 10px;border-radius:4px;box-shadow:inset 0 0 0 1px rgba(201,164,76,.5)">
    <span style="font-size:14px">🔊</span><span class="cin" style="font-weight:700;font-size:${M.item}px;color:#E4E8F0">SOM</span>
    <input class="b5-range" type="range" min="0" max="100" value="80" aria-label="Volume" style="flex:1;height:${M.itemH}px"></div>`;
  // §362: no canvas 780×360 o menu usa 2 colunas nas utilidades (cabe sem rolar nos 360 de altura).
  return `<div id="b5menu" style="position:absolute;inset:0;z-index:20;background:rgba(2,3,8,.7);display:flex;align-items:center;justify-content:center">
    <div id="menu" style="width:${M.w}px;padding:12px 14px;box-sizing:border-box;display:flex;flex-direction:column;gap:7px;border-radius:8px;background:linear-gradient(180deg,#0E1324,#070A14);box-shadow:inset 0 0 0 1px rgba(201,164,76,.8),0 20px 60px rgba(0,0,0,.7)">
      <div class="cin" style="font-weight:700;font-size:${M.titulo}px;color:#F0B43C;text-align:center">MENU</div>
      ${item('bcontinuar','CONTINUAR','rgba(201,164,76,.8)','#F4F1EA')}
      ${som}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
        ${item('bhelp','COMO JOGAR')}
        ${item('blog','REGISTRO')}
        ${item('bfull',estaTelaCheia()?'SAIR TELA CHEIA':'TELA CHEIA')}
        ${temConta?item('bconta','SUA CONTA'):'<span></span>'}
        ${item('bapagar','APAGAR DADOS')}
        ${item('bsair','Sair p/ o início')}
      </div>
      ${item('bsurr','RENDER-SE','rgba(232,52,60,.7)','#FF8A8F')}
      <div id="bmenubuild" title="toque 3× para diagnóstico" style="min-height:40px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:12px;color:#6b6480;cursor:pointer">${H(buildStr())}</div>
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

// ui/painel.js — painel de detalhe do rodapé e os botões da ação.
function detalheHTML(){
  if(detalhe){
    return `<div class="detail">
      <div class="detail__icon ${detalhe.redondo?'detail__icon--skill':''}"
        ${detalhe.redondo?`style="border-color:${detalhe.cor||'#3a3358'}"`:''}>${
        slot(detalhe.chave||'detail',detalhe.glifo||'',detalhe.cor,20,detalhe.redondo)}</div>
      <div class="detail__body">
        <div class="detail__head"><div class="detail__name">${H(detalhe.nome)}</div>
          ${detalhe.pips||''}${detalhe.meta?`<div class="detail__sep"></div><div class="detail__cd">${H(detalhe.meta)}</div>`:''}</div>
        <div class="detail__text">${realce(detalhe.texto)}</div>
        <div class="detail__classes">${H(detalhe.classes||'')}</div>
      </div></div>`;
  }
  if(armado){
    const u=st.lados[st.ativo].units.find(x=>x.uid===armado.uid);
    const a=acoesDe(st,u).find(x=>x.slot===armado.slot);
    const modo=a.alterna?(u.modo===0?' \u2014 ANEL':' \u2014 MANTO'):'';
    const falta=faltamAlvos();
    const passoAtual=armado.passos[escolhidos.length];
    return `<div class="detail">
      <div class="detail__icon detail__icon--skill" style="border-color:${a.slot==='defesa'?'var(--ink-mute)':COR(u.elem)}">${
        slot('skill-'+u.key+'-'+a.slot,mono(a),a.slot==='defesa'?'var(--ink-dim)':COR(u.elem),16,true)}</div>
      <div class="detail__body">
        <div class="detail__head"><div class="detail__name">${H(a.nome)}${modo}</div>
          ${pipsDetalhe(a.cost)}<div class="detail__sep"></div>
          <div class="detail__cd">${H(u.nome.toUpperCase())} \u00b7 ${a.cd?'RECARGA '+a.cd:'SEM RECARGA'}</div></div>
        <div class="detail__text">${H(a.desc)}</div>
        <div class="detail__classes">${classesTxt(u,a)}</div>
      </div>
      <div class="detail__act">
        ${falta>0
          ? `<button class="b b--wait" disabled>${
              armado.passos.length>1
                ? `<span>Alvo ${escolhidos.length+1}/${armado.passos.length}</span><span class="b__sub">${passoAtual==='aliado'?'aliado':'inimigo'}</span>`
                : `<span>${passoAtual==='aliado'?'Toque o aliado':'Toque o alvo'}</span>`}</button>`
          : `<button class="b b--ok b--md" id="bconf">Confirmar</button>`}
        <button class="b b--quiet b--md" id="bcanc">Cancelar</button>
      </div></div>`;
  }
  // RESUMO DO TURNO (F0.7): ao voltar para o meu turno, o que o oponente fez \u2014
  // compacto, dispens\u00e1vel, some ao 1\u00ba toque (ver ligarCampo). S\u00f3 quando h\u00e1 resumo.
  if(resumoTurno&&resumoTurno.length){
    const linhas=resumoTurno.map(r=>r.msg)
      .filter(m=>!/^\s*[\u2014-]?\s*Turno \d+/.test(m)&&!/^Abertura:/.test(m))
      .slice(-3).map(m=>traduzirRotulos(m));
    const quem=rotuloLado(1-ladoExibido()).toUpperCase();
    return `<div class="detail detail--resumo">
      <div class="detail__icon">${slot('detail','\u21ba','var(--gold-soft)',20)}</div>
      <div class="detail__body">
        <div class="detail__head"><div class="detail__name">RESUMO \u00b7 ${H(quem)}</div>
          <div class="detail__sep"></div><div class="detail__cd">TURNO ${st.turno}</div></div>
        <div class="detail__text detail__log">${linhas.map(m=>H(m)).join('<br>')||'sem a\u00e7\u00f5es'}</div>
        <div class="detail__classes">TOQUE EM QUALQUER COISA PARA DISPENSAR</div>
      </div></div>`;
  }
  const ult=st.log.slice(-2).reverse();
  return `<div class="detail">
    <div class="detail__icon">${slot('detail','\u2637','var(--ink-mute)',20)}</div>
    <div class="detail__body">
      <div class="detail__head"><div class="detail__name">ÚLTIMOS EVENTOS</div>
        <div class="detail__sep"></div><div class="detail__cd">TURNO ${st.turno}</div></div>
      <div class="detail__text detail__log">${ult.map(r=>`<b>${r.turno}</b>${H(traduzirRotulos(r.msg))}`).join('<br>')||'\u2014'}</div>
      <div class="detail__classes">TOQUE NUMA HABILIDADE PARA VER O QUE ELA FAZ \u00b7 NO RETRATO PARA A FICHA DA UNIDADE</div>
    </div></div>`;
}

/* ---------- eventos do painel de rodapé (ação primária e do detalhe) ---------- */
function ligarPainel(){
  const q=s=>stage.querySelector(s);
  const bcf=q('#bconf'); if(bcf)bcf.onclick=()=>confirmar();
  const bcn=q('#bcanc'); if(bcn)bcn.onclick=()=>{
    armado=null;alvos=[];escolhidos=[];detalhe=null;render();};
  const be=q('#bend'); if(be)be.onclick=()=>encerrarTurno();
}

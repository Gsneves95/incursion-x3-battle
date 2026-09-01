// ui/painel.js — o PAINEL de leitura à esquerda (§214) e o estado da ação no rodapé.
// O painel tem 4 estados de conteúdo (+ histórico) e RECOLHE por uma aba na borda esquerda.
// Prioridade: ação armada (habilidade SUA) > detalhe tocado (inimiga / passiva / efeito / ficha)
// > kit inimigo consultado (toque longo) > resumo do turno do oponente > histórico.

function painelHTML(){
  return `<aside class="panel">
    <button class="panel__tab" title="${painelRecolhido?'abrir leitura':'recolher leitura'}">${painelRecolhido?'›':'‹'}</button>
    ${painelRecolhido?'':`<div class="panel__box"><div class="panel__body">${painelConteudoHTML()}</div></div>`}
  </aside>`;
}

function painelConteudoHTML(){
  if(armado) return detalheHabilidadeArmada();     // estado 2: habilidade SUA (arte/nome/custo/recarga/o que faz)
  if(detalhe) return detalheCard(detalhe);          // estados 3 (inimiga) / 4 (passiva) / efeito / ficha
  if(peekKit!=null) return kitHTML(peekKit);        // KIT do inimigo (toque longo)
  if(resumoTurno&&resumoTurno.length) return resumoHTML();
  return historicoHTML();                           // estado 1: só o histórico
}

// card genérico de detalhe (estados 2/3/4 e ficha/efeito): ícone + nome + custo/recarga + texto + classes.
function detalheCard(d){
  return `<div class="detail ${d.consulta?'detail--consulta':''}">
    ${d.deKit?`<button class="b b--quiet b--sm kit__back" data-kitback="1">‹ kit</button>`:''}
    <div class="detail__top">
      <div class="detail__icon ${d.redondo?'detail__icon--skill':''}" ${d.redondo?`style="border-color:${d.cor||'#3a3358'}"`:''}>${
        slot(d.chave||'detail',d.glifo||'',d.cor,20,d.redondo)}</div>
      <div class="detail__id">
        <div class="detail__name">${H(d.nome)}</div>
        <div class="detail__meta">${d.pips||''}${d.meta?`<span class="detail__cd">${H(d.meta)}</span>`:''}</div>
      </div>
    </div>
    <div class="detail__text">${realce(d.texto||'')}</div>
    ${d.classes?`<div class="detail__classes">${H(d.classes)}</div>`:''}
  </div>`;
}

function detalheHabilidadeArmada(){
  const u=st.lados[st.ativo].units.find(x=>x.uid===armado.uid);
  const a=u&&acoesDe(st,u).find(x=>x.slot===armado.slot);
  if(!a) return historicoHTML();
  const modo=a.alterna?(u.modo===0?' — ANEL':' — MANTO'):'';
  return detalheCard({nome:a.nome.toUpperCase()+modo,chave:'skill-'+u.key+'-'+a.slot,glifo:mono(a),
    cor:a.slot==='defesa'?'var(--ink-mute)':COR(u.elem),redondo:true,
    pips:pipsDetalhe(a.cost), meta:(a.cd?'RECARGA '+a.cd:'SEM RECARGA'),
    texto:a.desc, classes:classesTxt(u,a)});
}

// KIT do inimigo consultado: as 4 habilidades + passiva, cada uma tocável para o detalhe (estado 3).
function kitHTML(uid){
  const u=todas().find(x=>x.uid===uid); if(!u) return historicoHTML();
  const g=_catPartida()[u.key]||{};
  const rows=acoesDe(st,u).map(a=>{
    const cd=u.cd[a.slot]||0;
    return `<button class="kit__row" data-kitab="${u.uid}|${a.slot}">
      <div class="kit__disc">${slot('skill-'+u.key+'-'+a.slot,'',null,0,true)}</div>
      <div class="kit__id"><div class="kit__nome">${H(a.nome)}</div>
        <div class="kit__meta">${H(a.slot.toUpperCase())}${cd?' · RECARGA '+cd:''}</div></div>
    </button>`;}).join('');
  const pas=g.passiva?`<button class="kit__row" data-pas="${u.uid}">
      <div class="kit__disc" style="display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-weight:900;color:${COR(u.elem)}">P</div>
      <div class="kit__id"><div class="kit__nome">${H(g.passiva.nome)}</div><div class="kit__meta">PASSIVA</div></div>
    </button>`:'';
  return `<div class="detail detail--consulta">
    <div class="detail__top"><div class="detail__id">
      <div class="detail__name">${H(u.nome)}</div>
      <div class="detail__meta"><span class="detail__cd">KIT — CONSULTA · toque p/ detalhe</span></div></div></div>
    <div class="kit">${rows}${pas}</div>
  </div>`;
}

function historicoHTML(){
  const ult=st.log.slice(-6).reverse();
  return `<div class="detail">
    <div class="detail__top"><div class="detail__icon">${slot('detail','☷','var(--ink-mute)',20)}</div>
      <div class="detail__id"><div class="detail__name">ÚLTIMOS EVENTOS</div>
        <div class="detail__meta"><span class="detail__cd">TURNO ${st.turno}</span></div></div></div>
    <div class="detail__text detail__log">${ult.map(r=>`<b>${r.turno}</b>${H(narrar(r))}`).join('<br>')||'—'}</div>
    <div class="detail__classes">Toque uma habilidade p/ ver o que faz · segure um inimigo p/ ler o kit dele</div>
  </div>`;
}
function resumoHTML(){
  const linhas=resumoTurno.filter(r=>r.tipo!=='turno'&&r.tipo!=='abertura').slice(-5).map(r=>narrar(r));
  const quem=rotuloLado(1-ladoExibido()).toUpperCase();
  return `<div class="detail detail--resumo">
    <div class="detail__top"><div class="detail__icon">${slot('detail','↺','var(--gold-soft)',20)}</div>
      <div class="detail__id"><div class="detail__name">RESUMO · ${H(quem)}</div>
        <div class="detail__meta"><span class="detail__cd">TURNO ${st.turno}</span></div></div></div>
    <div class="detail__text detail__log">${linhas.map(m=>H(m)).join('<br>')||'sem ações'}</div>
    <div class="detail__classes">TOQUE EM QUALQUER COISA PARA DISPENSAR</div>
  </div>`;
}

// RODAPÉ (esquerda): o estado da AÇÃO. Confirmar/Cancelar vivem aqui (à esquerda do ENCERRAR).
function acaoRodapeHTML(){
  if(armado){
    const u=st.lados[st.ativo].units.find(x=>x.uid===armado.uid);
    const a=u&&acoesDe(st,u).find(x=>x.slot===armado.slot);
    const nome=a?H(a.nome):'Habilidade';
    const falta=faltamAlvos();
    let txt;
    if(armado.distribui) txt = escolhidos.length
      ? `<b>${nome}</b> armado · ${escolhidos.length} alvo${escolhidos.length>1?'s':''} · reparte`
      : `<b>${nome}</b> armado · toque os inimigos a repartir`;
    else if(falta>0){ const passo=armado.passos[escolhidos.length];
      const quem=passo==='aliado'?'o aliado':'o inimigo';
      txt = armado.passos.length>1
        ? `<b>${nome}</b> armado · toque ${quem} ${escolhidos.length+1}/${armado.passos.length}`
        : `<b>${nome}</b> armado · toque ${quem}`; }
    else txt=`<b>${nome}</b> pronto · confirme`;
    const podeConf = armado.distribui ? escolhidos.length>0 : falta<=0;
    return `<span class="acao__txt">${txt}</span>
      <span class="acao__act">
        ${podeConf?`<button class="b b--ok b--sm" id="bconf">Confirmar</button>`:''}
        <button class="b b--quiet b--sm" id="bcanc">Cancelar</button>
      </span>`;
  }
  const l=st.lados[st.ativo];
  if(ehMeuTurno()){
    if((l.dividaLivre||0)>0) return `<span class="acao__txt">Ao encerrar, escolha <b>${l.dividaLivre}</b> energia livre</span>`;
    return `<span class="acao__txt">Toque uma habilidade para agir · segure um inimigo para ler o kit</span>`;
  }
  return `<span class="acao__txt">Vez de ${H(rotuloLado(st.ativo))} — aguarde</span>`;
}

/* ---------- eventos do painel/rodapé (ação primária) ---------- */
function ligarPainel(){
  const q=s=>stage.querySelector(s);
  const bcf=q('#bconf'); if(bcf)bcf.onclick=()=>confirmar();
  const bcn=q('#bcanc'); if(bcn)bcn.onclick=()=>{ armado=null;alvos=[];escolhidos=[];detalhe=null;render(); };
  const be=q('#bend'); if(be)be.onclick=()=>encerrarTurno();
}

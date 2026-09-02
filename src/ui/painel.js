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

// custo do inimigo em pílulas pequenas (para o CHIP): só mostra o que a habilidade custa — sem
// realce de "falta" (a energia é dele, não minha; aqui é leitura pura).
function pipsKitMini(cost){
  const out=[];
  for(const k in cost){ if(k==='livre')continue;
    for(let i=0;i<cost[k];i++)out.push(`<i class="kpip" style="background:${COR(k)}"></i>`);}
  for(let i=0;i<(cost.livre||0);i++)out.push(`<i class="kpip kpip--free"></i>`);
  return out.length?`<span class="kchip__pips">${out.join('')}</span>`:'';
}

// KIT do inimigo (§219): GALERIA + DETALHE no mesmo painel. Em cima, a TIRA com as 4 habilidades +
// a passiva — arte reconhecível, custo e recarga VISÍVEIS sem tocar. Embaixo, a SELECIONADA por
// inteiro: nome, custo, recarga e o TEXTO completo com espaço. Tocar um chip troca a seleção; o kit
// PERSISTE (soltar o dedo não fecha) e o ✕ é o fechar deliberado.
function kitHTML(uid){
  const u=todas().find(x=>x.uid===uid); if(!u) return historicoHTML();
  const g=_catPartida()[u.key]||{};
  const acoes=acoesDe(st,u);
  const slots=acoes.map(a=>a.slot).concat(g.passiva?['passiva']:[]);
  const sel = kitSel && slots.includes(kitSel) ? kitSel : slots[0];
  const chips=acoes.map(a=>{
    const cd=u.cd[a.slot]||0;
    return `<button class="kchip ${a.slot===sel?'is-sel':''}" data-kitsel="${uid}|${a.slot}" title="${H(a.nome)}">
      <span class="kchip__art">${slot('skill-'+u.key+'-'+a.slot,'',null,0,true)}
        ${cd?`<span class="kchip__cd">↻${cd}</span>`:''}</span>
      ${pipsKitMini(a.cost)}</button>`;
  }).join('');
  const chipPas=g.passiva?`<button class="kchip kchip--pas ${sel==='passiva'?'is-sel':''}" data-kitsel="${uid}|passiva" title="${H(g.passiva.nome)}">
      <span class="kchip__art kchip__art--pas" style="color:${COR(u.elem)}">P</span>
      <span class="kchip__pips"><span class="kchip__paslbl">PAS</span></span></button>`:'';
  // GALERIA + DETALHE: a SELECIONADA em cima com arte GRANDE (legível) + texto completo; a tira das
  // 5 embaixo, para trocar de habilidade sem sair do kit (o kit persiste; o ✕ é o fechar).
  return `<div class="detail detail--consulta kitwrap">
    <div class="kit__head">
      <div class="detail__name">${H(u.nome)} · KIT</div>
      <button class="b b--quiet b--icon kit__x" data-kitclose="1" title="fechar o kit">✕</button>
    </div>
    ${kitDetalheHTML(u,g,sel)}
    <div class="kstrip">${chips}${chipPas}</div>
  </div>`;
}
// o corpo do kit: a habilidade SELECIONADA por inteiro — arte GRANDE (56px, reconhecível), custo,
// recarga e o TEXTO completo com espaço. A passiva entra aqui também (sem custo/recarga).
function kitDetalheHTML(u,g,sel){
  if(sel==='passiva'&&g.passiva){
    return `<div class="kitdet">
      <div class="detail__top">
        <div class="detail__icon detail__icon--skill kitdet__pas" style="border-color:${COR(u.elem)};color:${COR(u.elem)}">P</div>
        <div class="detail__id"><div class="detail__name">${H(g.passiva.nome)}</div>
          <div class="detail__meta"><span class="detail__cd">PASSIVA${g.passiva.inerte?' · INERTE':''}</span></div></div>
      </div>
      <div class="detail__text">${realce(g.passiva.desc||'')}</div>
      <div class="detail__classes">SEMPRE ATIVA · NÃO GASTA A AÇÃO · NÃO PODE SER SILENCIADA</div>
    </div>`;
  }
  const a=acoesDe(st,u).find(x=>x.slot===sel); if(!a) return '';
  const cd=u.cd[sel]||0;
  return `<div class="kitdet">
    <div class="detail__top">
      <div class="detail__icon detail__icon--skill" style="border-color:${COR(u.elem)}">${slot('skill-'+u.key+'-'+sel,'',null,0,true)}</div>
      <div class="detail__id"><div class="detail__name">${H(a.nome)}</div>
        <div class="detail__meta">${pipsDetalhe(a.cost)}<span class="detail__cd">${cd?'PRONTA EM '+cd+' TURNO(S)':'PRONTA AGORA'}</span></div></div>
    </div>
    <div class="detail__text">${realce(a.desc||'')}</div>
    <div class="detail__classes">${H(classesTxt(u,a))} · INIMIGA</div>
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

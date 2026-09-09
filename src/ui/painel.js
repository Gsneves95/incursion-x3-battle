// ui/painel.js — a LATERAL do histórico (§256) e a LEITURA no rodapé.
// §256: a leitura tem UM endereço, o RODAPÉ. A lateral esquerda guarda SÓ o histórico (SEMPRE) e
// RECOLHE por uma aba na borda. A prioridade da leitura vive toda no rodapé (`acaoRodapeHTML`):
// ação armada (habilidade SUA) > kit do inimigo (toque longo §214) > resumo do turno do oponente >
// detalhe tocado (inimiga / passiva / efeito / ficha) > dica.

function painelHTML(){
  return `<aside class="panel">
    <button class="panel__tab" title="${painelRecolhido?'abrir leitura':'recolher leitura'}">${painelRecolhido?'›':'‹'}</button>
    ${painelRecolhido?'':`<div class="panel__box"><div class="panel__body">${painelConteudoHTML()}</div></div>`}
  </aside>`;
}

// §256: a LATERAL é SÓ o histórico, SEMPRE — nunca troca de conteúdo. Toda leitura (habilidade, efeito,
// KIT do inimigo, resumo do turno) mora num endereço ÚNICO: o rodapé (acaoRodapeHTML). O painel não vira
// sobreposição: o processo do oponente é oculto na resolução (F0.7), e o LOG é o único canal de "por que
// perdi 45 de vida" — informação que precisa de um toque para aparecer é informação que some.
function painelConteudoHTML(){
  return historicoHTML();
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

// §238 (item 2): o HISTÓRICO LEGÍVEL — agrupado POR TURNO (o mais recente no topo), cronológico dentro
// do turno, e a AUTORIA visualmente distinta (você × o OUTRO LADO — vale nos 4 modos: na Provação e na
// Campanha o "outro lado" é a IA, não um jogador). Autoria pela varredura do log: o lado ATIVO (turno.lado)
// no momento; reativos (reflexo/intercepta/contra-ataque) pertencem ao lado que DEFENDE.
function historicoHTML(){
  const eu=ladoExibido();
  let ativo=0; const marc=[];
  for(const r of st.log){
    if(r.tipo==='turno'){ if(r.lado===0||r.lado===1) ativo=r.lado; continue; }
    if(r.tipo==='abertura') continue;
    const txt=narrar(r); if(!txt) continue;
    const reativo = r.reflexo || r.efeito==='intercepta' || r.efeito==='contraAtaca' || r.efeito==='refleteDano';
    marc.push({ turno:r.turno, lado: reativo ? 1-ativo : ativo, txt });
  }
  const porTurno=new Map();
  for(const m of marc){ if(!porTurno.has(m.turno)) porTurno.set(m.turno,[]); porTurno.get(m.turno).push(m); }
  const turnos=[...porTurno.keys()].sort((a,b)=>b-a);   // mais recente no topo
  const blocos=turnos.map(t=>{
    const linhas=porTurno.get(t).map(m=>`<div class="hist__l hist__l--${m.lado===eu?'eu':'eles'}">${H(m.txt)}</div>`).join('');
    return `<div class="hist__turno"><div class="hist__cab">Turno ${t}</div>${linhas}</div>`;
  }).join('') || `<div class="hist__vazio">A batalha ainda não tem eventos.</div>`;
  return `<div class="detail hist">
    <div class="detail__top"><div class="detail__icon">${slot('detail','☷','var(--ink-mute)',20)}</div>
      <div class="detail__id"><div class="detail__name">HISTÓRICO</div>
        <div class="detail__meta"><span class="detail__cd">TURNO ${st.turno}</span></div></div></div>
    <div class="hist__rol">${blocos}</div>
    <div class="detail__classes"><span class="hist__leg hist__leg--eu">você</span> · <span class="hist__leg hist__leg--eles">${H(rotuloLado(1-eu))}</span></div>
  </div>`;
}

// RODAPÉ (§238 item 2) — a LEITURA transitória: o que a habilidade faz, custo e recarga aparecem AQUI
// (não mais na lateral). ALTURA FIXA (`.leitura`) para NÃO pular: descrição quando há habilidade em foco
// (armada OU tocada-para-ler), dica de ação quando não há. Confirmar/Cancelar vivem aqui, à esquerda do ENCERRAR.
function leituraCardHTML(d, statusHTML, acoesHTML){
  return `<div class="leitura">
    <div class="leitura__icon ${d.redondo?'is-skill':''}"${d.cor?` style="border-color:${d.cor}"`:''}>${slot(d.chave||'detail',d.glifo||'',d.cor,18,d.redondo)}</div>
    <div class="leitura__corpo">
      <div class="leitura__cab"><b class="leitura__nome">${H(d.nome)}</b>${d.pips||''}${d.meta?`<span class="leitura__cd">${H(d.meta)}</span>`:''}</div>
      <div class="leitura__txt">${realce(d.texto||'')}</div>
      ${statusHTML||''}
      ${d.motivo?`<div class="leitura__motivo">⊘ ${H(d.motivo)}</div>`:''}
    </div>
    ${acoesHTML?`<div class="acao__act">${acoesHTML}</div>`:''}
  </div>`;
}
function acaoRodapeHTML(){
  if(armado){
    const u=st.lados[st.ativo].units.find(x=>x.uid===armado.uid);
    const a=u&&acoesDe(st,u).find(x=>x.slot===armado.slot);
    if(a){
      const nome=H(a.nome);
      const falta=faltamAlvos();
      let txt;
      if(armado.distribui) txt = escolhidos.length
        ? `${escolhidos.length} alvo${escolhidos.length>1?'s':''} · reparte`
        : `toque os inimigos a repartir`;
      else if(falta>0){ const passo=armado.passos[escolhidos.length];
        const quem=passo==='aliado'?'o aliado':'o inimigo';
        txt = armado.passos.length>1 ? `toque ${quem} ${escolhidos.length+1}/${armado.passos.length}` : `toque ${quem}`; }
      else txt=`pronto · confirme`;
      const podeConf = armado.distribui ? escolhidos.length>0 : falta<=0;
      const modo=a.alterna?(u.modo===0?' — ANEL':' — MANTO'):'';
      const acoes=`${podeConf?`<button class="b b--ok b--sm" id="bconf">Confirmar</button>`:''}<button class="b b--quiet b--sm" id="bcanc">Cancelar</button>`;
      return leituraCardHTML(
        { nome:a.nome.toUpperCase()+modo, chave:'skill-'+u.key+'-'+a.slot, glifo:mono(a), redondo:true,
          cor:a.slot==='defesa'?'var(--ink-mute)':COR(u.elem), pips:pipsDetalhe(a.cost), meta:(a.cd?'RECARGA '+a.cd:'SEM RECARGA'), texto:a.desc },
        `<div class="leitura__status">▸ ${txt}</div>`, acoes);
    }
  }
  if(peekKit!=null){ const k=kitRodapeHTML(peekKit); if(k) return k; }   // §256: KIT do inimigo no RODAPÉ (toque longo) — persiste até outra leitura
  if(resumoTurno&&resumoTurno.length) return resumoRodapeHTML();          // §256: resumo do turno do oponente também desce
  if(detalhe) return leituraCardHTML(detalhe, '', '');   // §238: qualquer LEITURA (habilidade tocada, efeito, passiva, ficha)
  const l=st.lados[st.ativo];
  let dica;
  if(ehMeuTurno()){
    dica=(l.dividaLivre||0)>0
      ? `Ao encerrar, escolha <b>${l.dividaLivre}</b> energia livre`
      : `Toque uma habilidade para <b>agir</b> · toque uma indisponível para <b>ler</b> · segure um inimigo para o kit`;
  } else dica=`Vez de ${H(rotuloLado(st.ativo))} — aguarde`;
  return `<div class="leitura leitura--dica"><span class="acao__txt">${dica}</span></div>`;
}

// §256: o KIT do inimigo no RODAPÉ. Mesma matéria do §219 (arte da selecionada + custo + recarga + texto
// completo + a tira de chips para trocar de habilidade), mas no endereço ÚNICO da leitura. Reusa o card
// `.leitura` (a descrição já rola em `.leitura__txt`, max-height 44 — não estoura os 86px do rodapé) e os
// `.kchip` do §219. PERSISTE: fica até outra leitura tomar o lugar (o ✕ é o fechar deliberado). O "qual
// dos três inimigos" é o que foi tocado longo (peekKit = uid); segurar outro troca; tocar um chip troca a
// habilidade dentro daquele inimigo.
function kitRodapeHTML(uid){
  const u=todas().find(x=>x.uid===uid); if(!u) return null;
  const g=_catPartida()[u.key]||{};
  const acoes=acoesDe(st,u);
  const slots=acoes.map(a=>a.slot).concat(g.passiva?['passiva']:[]);
  const sel = kitSel && slots.includes(kitSel) ? kitSel : slots[0];
  const chips=acoes.map(a=>{
    const cd=u.cd[a.slot]||0;
    return `<button class="kchip ${a.slot===sel?'is-sel':''}" data-kitsel="${uid}|${a.slot}" title="${H(a.nome)}">
      <span class="kchip__art">${slot('skill-'+u.key+'-'+a.slot,'',null,0,true)}${cd?`<span class="kchip__cd">↻${cd}</span>`:''}</span>
      ${pipsKitMini(a.cost)}</button>`;
  }).join('');
  const chipPas=g.passiva?`<button class="kchip kchip--pas ${sel==='passiva'?'is-sel':''}" data-kitsel="${uid}|passiva" title="${H(g.passiva.nome)}">
      <span class="kchip__art kchip__art--pas" style="color:${COR(u.elem)}">P</span>
      <span class="kchip__pips"><span class="kchip__paslbl">PAS</span></span></button>`:'';
  // o CARD da selecionada (habilidade ou passiva), no mesmo formato de leitura
  let d;
  if(sel==='passiva'&&g.passiva){
    d={nome:(u.nome+' · '+g.passiva.nome).toUpperCase(),chave:'god-'+u.key,glifo:'P',cor:COR(u.elem),
       meta:'PASSIVA'+(g.passiva.inerte?' · INERTE':''),texto:g.passiva.desc};
  }else{
    const a=acoes.find(x=>x.slot===sel)||acoes[0]; const cd=u.cd[a.slot]||0;
    d={nome:(u.nome+' · '+a.nome).toUpperCase(),chave:'skill-'+u.key+'-'+a.slot,glifo:mono(a),redondo:true,
       cor:a.slot==='defesa'?'var(--ink-mute)':COR(u.elem),pips:pipsDetalhe(a.cost),
       meta:(cd?'PRONTA EM '+cd+' TURNO(S)':'PRONTA AGORA'),texto:a.desc};
  }
  const strip=`<div class="leitura__kstrip">${chips}${chipPas}</div>
    <button class="b b--quiet b--icon kit__x" data-kitclose="1" title="fechar o kit">✕</button>`;
  return leituraCardHTML(Object.assign({consulta:true},d), '<div class="leitura__status leitura__status--kit">KIT INIMIGO · segure outro para trocar</div>', strip);
}
// §256: o resumo do turno do oponente, no rodapé (era painel). Card de leitura com as últimas ações.
function resumoRodapeHTML(){
  const linhas=resumoTurno.filter(r=>r.tipo!=='turno'&&r.tipo!=='abertura').slice(-5).map(r=>narrar(r)).filter(Boolean);
  const quem=rotuloLado(1-ladoExibido()).toUpperCase();
  return leituraCardHTML(
    {nome:'RESUMO · '+quem,chave:'detail',glifo:'↺',cor:'var(--gold-soft)',meta:'TURNO '+st.turno,
     texto:linhas.join('  ·  ')||'sem ações'},
    '<div class="leitura__status">toque em qualquer coisa para dispensar</div>','');
}

/* ---------- eventos do painel/rodapé (ação primária) ---------- */
function ligarPainel(){
  const q=s=>stage.querySelector(s);
  const bcf=q('#bconf'); if(bcf)bcf.onclick=()=>confirmar();
  const bcn=q('#bcanc'); if(bcn)bcn.onclick=()=>{ armado=null;alvos=[];escolhidos=[];detalhe=null;render(); };
  const be=q('#bend'); if(be)be.onclick=()=>encerrarTurno();
}

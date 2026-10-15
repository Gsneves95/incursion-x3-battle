// ui/painel.js — §333b: o PAINEL DE BAIXO seguindo os MODELOS do dono. Ordem: [IMAGEM][CONTEÚDO] | [CUSTO/RECARGA] |
// [DIREITA]. As barras "|" são divisores verticais finos dourados. A DIREITA é 4 miniaturas (situação PERSONAGEM:
// retrato, habilidade lida, efeito, resumo) OU o botão CANCELAR (quando há habilidade ARMADA). As miniaturas são
// SEMPRE do DONO do conteúdo (donoUid, §333). Tamanhos/fontes vêm de LAYOUT_BATALHA.painel.

const TIPO_SLOT = { basico:'BÁSICO', habilidade:'HABILIDADE', milagre:'MILAGRE', defesa:'DEFESA' };
// categoria do efeito → rótulo da pílula + cor (as mesmas cores das bordas de efeito em campo)
const CAT_PILL = { bom:{txt:'BOM',cor:'#6fe6a0'}, ruim:{txt:'RUIM',cor:'#ff6b86'},
  controle:{txt:'CONTROLE',cor:'#b98bff'}, defesa:{txt:'DEFESA',cor:'#6fb6ff'} };

// bolinhas de custo (tamanho em u; a livre em cinza). Sem custo → "livre".
function _custoPips(cost, szU){
  const sz=szU||3;
  if(!cost || !Object.keys(cost).length) return `<span class="bt-panel__livre">livre</span>`;
  const out=[];
  for(const k in cost){ if(k==='livre')continue; for(let i=0;i<cost[k];i++) out.push(`<i style="width:${U(sz)};height:${U(sz)};background:${COR(k)}"></i>`); }
  for(let i=0;i<(cost.livre||0);i++) out.push(`<i class="free" style="width:${U(sz)};height:${U(sz)}"></i>`);
  return out.length ? `<span class="bt-panel__pips">${out.join('')}</span>` : `<span class="bt-panel__livre">livre</span>`;
}
// valor da célula RECARGA: "4 · pronta" (pronta em VERDE) / "4 · pronta em 2" (em DOURADO).
function _recargaHTML(cd, cdNow){
  if(!cd) return `<span class="bt-panel__livre">—</span>`;
  return cdNow>0 ? `${cd} · <span class="bt-panel__ouro">pronta em ${cdNow}</span>`
                 : `${cd} · <span class="bt-panel__verde">pronta</span>`;
}

// o DEUS em foco (replicado aqui p/ não cruzar ui→ui; `todas`/`_catPartida` são globais isentos).
function _focoGod(){
  const u=(typeof foco!=='undefined'&&foco)?todas().find(x=>x.uid===foco):null;
  if(u&&u.vivo) return u;
  const eu=ladoExibido(); const lado=ehMeuTurno()?st.lados[eu]:st.lados[1-eu];
  return lado.units.find(x=>x.vivo)||st.lados[eu].units.find(x=>x.vivo)||st.lados[eu].units[0];
}

// pílulas (etiquetas) de uma HABILIDADE: TIPO (cor da energia) · classe · alvo · NV N.
function _etqSkill(slotName, tf, nv, cor){
  const parts=(tf||'').split(' · ');
  const etq=[{txt:(TIPO_SLOT[slotName]||slotName.toUpperCase()), cor}];
  if(parts[0]) etq.push({txt:parts[0]});
  if(parts[1]) etq.push({txt:parts[1]});
  etq.push({txt:'NV '+(nv||1)});
  return etq;
}

// MIRA (só quando ARMADA): instrução de alvo que se adapta ao tipo de alvo. `pronto` → o bloco confirma ao toque.
function _miraPainel(a){
  const falta=(typeof faltamAlvos==='function')?faltamAlvos():0;
  if(armado && armado.distribui){
    const n=escolhidos.length;
    return { titulo: n?`Confirmar · ${n} alvo${n>1?'s':''}`:'Toque os inimigos a repartir',
      sub: n?'Toque para repartir o dano entre os escolhidos.':'Toque os inimigos para repartir o dano.', pronto:n>0 };
  }
  if(falta>0){
    const passo=armado.passos[escolhidos.length];
    let quem, quemSub;
    if(passo==='aliado' && alvos.length===1 && alvos[0] && alvos[0].uid===armado.uid){ quem='em si mesmo'; quemSub='a si mesmo'; }
    else if(passo==='aliado'){ quem='o aliado'; quemSub='um aliado'; }
    else { quem='o inimigo'; quemSub='um inimigo'; }
    const multi = armado.passos.length>1 ? ` ${escolhidos.length+1}/${armado.passos.length}` : '';
    return { titulo:`Toque ${quem}${multi}`, sub:`Selecione ${quemSub} para usar esta habilidade.`, pronto:false };
  }
  return { titulo:'Toque para confirmar', sub:'Toque para confirmar o uso desta habilidade.', pronto:true };
}

/* ---------- MODELOS (quem é o dono; que pílulas; que bloco do meio; que direita) ---------- */
// base de uma HABILIDADE (compartilhada por ARMADA e LIDA). A direita padrão são as minis do dono.
function _modeloSkill(u, a, nv, cdNow){
  const cor=a.slot==='defesa'?'var(--ink-mute)':COR(u.elem);
  const modo=a.alterna?(u.modo===0?' — ANEL':' — MANTO'):'';
  return { tipo:'skill', chave:'skill-'+u.key+'-'+a.slot, mono:mono(a), redondo:true, cor,
    titulo:a.nome+modo, nv, desc:a.desc, etiquetas:_etqSkill(a.slot, classesTxt(u,a), nv, cor), donoUid:u.uid,
    meio:[{rotulo:'CUSTO', pips:a.cost||{}}, {rotulo:'RECARGA', html:_recargaHTML(a.cd||0, cdNow)}],
    dir:{modo:'minis', selSlot:a.slot} };
}
function _modeloPainel(){
  if(armado){
    const u=st.lados[st.ativo].units.find(x=>x.uid===armado.uid);
    const a=u&&acoesDe(st,u).find(x=>x.slot===armado.slot);
    if(a){
      const nv=(typeof nivelSlotEmBatalha==='function')?nivelSlotEmBatalha(st,u,armado.slot):1;
      const cdNow=u.cd[armado.slot]||0;
      const m=_modeloSkill(u, a, nv, cdNow);
      m.armado=true; m.mira=_miraPainel(a);
      m.dir={ modo:'cancelar', recarga:`Recarga ${a.cd||0} · ${cdNow>0?('pronta em '+cdNow):'pronta'}` };
      return m;
    }
  }
  if(typeof detalhe!=='undefined' && detalhe) return _modeloDetalhe(detalhe);
  if(typeof resumoTurno!=='undefined' && resumoTurno && resumoTurno.length){
    const linhas=resumoTurno.filter(r=>r.tipo!=='turno'&&r.tipo!=='abertura').slice(-5).map(r=>narrar(r)).filter(Boolean);
    const acoes=resumoTurno.filter(r=>r.tipo==='acao'&&r.origem);
    let key=acoes.length?acoes[acoes.length-1].origem:null;
    if(!key && typeof ARTE_TURNO!=='undefined' && ARTE_TURNO) key=ARTE_TURNO.oponente;
    if(!key){ const lo=st.lados[1-ladoExibido()]; const u0=lo&&(lo.units.find(x=>x.vivo)||lo.units[0]); key=u0&&u0.key; }
    const un=key&&typeof todas==='function'?todas().find(x=>x.key===key):null;
    const cor=un?COR(un.elem):'var(--gold-soft)';
    return { tipo:'resumo', chave:key?('god-'+key):'detail', cor, titulo:'RESUMO · '+rotuloLado(1-ladoExibido()).toUpperCase(),
      desc:linhas.join('  ·  ')||'sem ações', donoUid:un?un.uid:null,
      dir: un?{modo:'minis', selSlot:null}:null };
  }
  return _unidadeModeloFoco();
}
function _modeloDetalhe(d){
  if(d.kind==='skill'){
    const slotName=(d.chave||'').split('-').pop();
    const cor=d.cor;
    return { tipo:'skill', chave:d.chave, mono:d.mono, redondo:true, cor, titulo:d.nome, nv:d.nv,
      desc:d.desc, motivo:d.motivo, etiquetas:_etqSkill(slotName, d.tf, d.nv, cor), donoUid:d.uid,
      meio:[{rotulo:'CUSTO', pips:d.cost||{}}, {rotulo:'RECARGA', html:_recargaHTML(d.cd||0, d.cdNow||0)}],
      dir:{modo:'minis', selSlot:slotName} };
  }
  if(d.kind==='unidade'){
    const sub=(d.sub||'').split(' · ');
    const etq=[{txt:'PASSIVA', cor:d.cor}];
    if(sub[0]) etq.push({txt:sub[0]});
    if(sub[1]) etq.push({txt:sub[1]});
    return { tipo:'deus', chave:d.chave, cor:d.cor, titulo:d.nome, donoUid:d.uid,
      desc:(d.passivaNome?`Passiva — ${d.passivaNome}: ${d.passivaDesc}`:'Sem passiva.'), etiquetas:etq,
      meio:[{rotulo:'VIDA', valor:`${d.hp}/${d.maxHp}${d.shield?' ◧'+d.shield:''}`}, {rotulo:'ELEMENTO', valor:(sub[1]||'')}],
      dir:{modo:'minis', selSlot:null} };
  }
  if(d.kind==='efeito'){
    const cp=CAT_PILL[d.cat]||{txt:(d.cat||'EFEITO').toUpperCase(), cor:'var(--gold-soft)'};
    const durTxt=(d.dur!=null)?`${d.dur} turno${d.dur>1?'s':''}`:'permanente';
    return { tipo:'efeito', emoji:d.icone, cor:d.cor, titulo:(d.nome+(d.num?' '+d.num:'')), donoUid:d.uid,
      desc:d.desc, etiquetas:[{txt:cp.txt, cor:cp.cor}, {txt:(d.dur!=null)?`${d.dur} TURNO${d.dur>1?'S':''}`:'PERMANENTE'}],
      meio:[{rotulo:'TURNOS', valor:durTxt}, {rotulo:'APLICADO POR', valor:(d.aplicadoPor||'—')}],
      dir:{modo:'minis', selSlot:null} };
  }
  if(d.kind==='passiva'){
    return { tipo:'passiva', chave:d.chave, cor:d.cor, titulo:d.nome, donoUid:d.uid,
      desc:d.desc, etiquetas:[{txt:'PASSIVA', cor:d.cor}], dir:{modo:'minis', selSlot:null} };
  }
  return _unidadeModeloFoco();
}
function _unidadeModeloFoco(){
  const u=_focoGod(); if(!u) return { titulo:'', desc:'' };
  const cat=(typeof _catPartida==='function')?_catPartida():(typeof GODS!=='undefined'?GODS:{});
  const g=cat[u.key]||{};
  const elem=(ELAB[u.elem]||u.elem);
  const etq=[{txt:'PASSIVA', cor:COR(u.elem)}];
  const funcao=(u.funcao||g.funcao||''); if(funcao) etq.push({txt:funcao.toUpperCase()});
  etq.push({txt:elem});
  return { tipo:'deus', chave:'god-'+u.key, cor:COR(u.elem), titulo:(u.nome||''), donoUid:u.uid,
    desc:(g.passiva?`Passiva — ${g.passiva.nome}: ${g.passiva.desc}`:'Sem passiva.'), etiquetas:etq,
    meio:[{rotulo:'VIDA', valor:`${u.hp}/${u.maxHp}${u.shield?' ◧'+u.shield:''}`}, {rotulo:'ELEMENTO', valor:elem}],
    dir:{modo:'minis', selSlot:null} };
}

/* ---------- RENDER ---------- */
// BLOCO do meio (CUSTO/RECARGA ou VIDA/ELEMENTO ou TURNOS/APLICADO POR) + MIRA quando armada. Vem com o seu divisor.
function _meioHTML(m, L, F){
  if(!m.meio || !m.meio.length) return '';
  const cel=c=>`<div class="bt-panel__cel"><span class="bt-panel__rotulo" style="font-size:${U(F.rotulo||1.8)}">${H(c.rotulo||'')}</span>`
    +`<span class="bt-panel__celval" style="font-size:${U(F.dado||2.6)}">${c.pips?_custoPips(c.pips, F.pip||3):(c.html||`<span class="bt-panel__valor">${H(c.valor||'')}</span>`)}</span></div>`;
  const cels=m.meio.map(cel).join('<div class="bt-panel__sepvm"></div>');
  let mira='';
  if(m.armado && m.mira){
    mira=`<div class="bt-panel__seph"></div>
      <div class="bt-panel__mira"${m.mira.pronto?' id="bconf" role="button" tabindex="0"':''}>
        <div class="bt-panel__miratop"><span class="bt-panel__miraico" style="font-size:${U(F.miraIcone||3.4)}">◎</span><span class="bt-panel__miratit" style="font-size:${U(F.miraTit||2.4)}">${H(m.mira.titulo)}</span></div>
        <div class="bt-panel__mirasub" style="font-size:${U(F.miraSub||1.8)}">${H(m.mira.sub)}</div>
      </div>`;
  }
  return `<div class="bt-panel__sepv"></div><div class="bt-panel__meio ${m.armado?'is-armado':''}" style="width:${U(L.meio||30)}"><div class="bt-panel__meiocels">${cels}</div>${mira}</div>`;
}
// COLUNA da DIREITA: miniaturas do dono OU o botão CANCELAR. Vem com o seu divisor.
function _dirHTML(m, L, F){
  if(!m.dir) return '';
  if(m.dir.modo==='cancelar'){
    const w=L.cancelW||26, h=L.cancelH||9;
    return `<div class="bt-panel__sepv"></div><div class="bt-panel__dir bt-panel__cancelwrap" style="width:${U(w)}">`
      +`<button class="bt-cancel" id="bcanc" style="height:${U(h)}"><span class="bt-cancel__t">CANCELAR</span><span class="bt-cancel__r">${H(m.dir.recarga||'')}</span></button></div>`;
  }
  const sz=L.mini||7.5, gap=L.gapMini||1.5, w=4*sz+3*gap;
  const minis=_painelMinis(m, L, F, sz, gap, w);
  return minis ? `<div class="bt-panel__sepv"></div>${minis}` : '';
}
// §333 REGRA (a): as 4 miniaturas são SEMPRE do DONO do conteúdo (donoUid). A mostrada vem destacada (moldura dourada).
function _painelMinis(m, L, F, sz, gap, w){
  const uid=m.donoUid;
  const u=uid&&typeof todas==='function'?todas().find(x=>x.uid===uid):null;
  if(!u || !u.vivo) return '';
  const selSlot=m.dir&&m.dir.selSlot;
  const lab=(m.tipo==='skill')?'OUTRAS HABILIDADES':'HABILIDADES';
  const minis=acoesDe(st,u).map(a=>{
    const anel=a.slot==='defesa'?'var(--ink-mute)':COR(u.elem);
    const sel=selSlot&&a.slot===selSlot;
    return `<button class="bt-mini ${sel?'is-sel':''}" data-look="${u.uid}|${a.slot}" title="${H(a.nome)}"
      style="width:${U(sz)};height:${U(sz)};border-color:${anel}"><span class="bt-mini__mono" style="color:${anel}">${H(mono(a))}</span>${slot('skill-'+u.key+'-'+a.slot,'',null,0,true)}</button>`;
  }).join('');
  return `<div class="bt-panel__dir bt-panel__minis" style="width:${U(w)}"><span class="bt-panel__minilab" style="font-size:${U(F.minilab||1.8)}">${H(lab)}</span><div class="bt-panel__minirow" style="gap:${U(gap)}">${minis}</div></div>`;
}
// o PAINEL de baixo (view.js injeta o `style` de posição em u). §333b: grade [imagem][conteúdo] | [meio] | [direita].
function painelBaixoHTML(styleStr){
  const m=_modeloPainel();
  const L=(typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA&&LAYOUT_BATALHA.painel)||{img:15};
  const F=L.fonte||{};
  const imgSz=L.img||15; const imgStyle=`width:${U(imgSz)};height:${U(imgSz)}`;
  let img;
  if(m.emoji) img=`<div class="bt-panel__img" style="${imgStyle};display:flex;align-items:center;justify-content:center;font-size:${U(7)}${m.cor?';border-color:'+m.cor:''}">${m.emoji}</div>`;
  else {
    const ehSkill=/^skill-/.test(m.chave||'');
    const fb=ehSkill&&m.mono?`<span class="bt-panel__mono" style="color:${m.cor||'var(--ink-dim)'}">${H(m.mono)}</span>`:'';
    img=`<div class="bt-panel__img" style="${imgStyle}${m.cor?';border-color:'+m.cor:''}">${slot(m.chave||'detail','',m.cor,0,m.redondo)}${fb}</div>`;
  }
  const tags=(m.etiquetas&&m.etiquetas.length)
    ? `<div class="bt-panel__tags">${m.etiquetas.map(e=>`<span class="bt-pill${e.cor?' bt-pill--cor':''}" style="font-size:${U(F.pilula||2)}${e.cor?';--pc:'+e.cor:''}">${H(e.txt)}</span>`).join('')}</div>`
    : '';
  const gap=L.gapCol||2, pad=L.pad||1.5;
  return `<div class="bt-panel" style="${styleStr};gap:${U(gap)};padding:${U(pad)}">
    ${img}
    <div class="bt-panel__conteudo">
      <div class="bt-panel__titulo" style="font-size:${U(F.titulo||3.4)}">${H(m.titulo||'')}</div>
      ${tags}
      <div class="bt-panel__desc" style="font-size:${U(F.corpo||2.6)}">${realce(m.desc||'')}${m.motivo?`<div class="bt-panel__motivo">⊘ ${H(m.motivo)}</div>`:''}</div>
    </div>
    ${_meioHTML(m,L,F)}
    ${_dirHTML(m,L,F)}
  </div>`;
}

// §333b: encaixe fino. O TÍTULO encolhe até tituloMin p/ caber em 1 linha sem "…". A DESCRIÇÃO não encolhe: rola
// dentro da coluna 2. Em 16:9 ESTREITO (coluna 2 < 38u) some o rótulo das minis e, se preciso, elas encolhem p/ 6u.
function _ajustarPainel(){
  const panel=stage.querySelector('.bt-panel'); if(!panel) return;
  const L=(typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA.painel)||{};
  const F=L.fonte||{};
  const base=document.getElementById('baselayer');
  const u1=base?(parseFloat(getComputedStyle(base).getPropertyValue('--u'))||4.28):4.28;
  const esc=(typeof ultimaEscala!=='undefined'&&ultimaEscala)||1;
  const tit=panel.querySelector('.bt-panel__titulo');
  if(tit){ const floor=(F.tituloMin||2.8)*u1; let fs=parseFloat(getComputedStyle(tit).fontSize)||14, g=0;
    while(tit.scrollWidth>tit.clientWidth+1 && fs>floor && g++<40){ fs-=0.5; tit.style.fontSize=fs+'px'; } }
  const col2=panel.querySelector('.bt-panel__conteudo');
  if(col2){ const w=col2.getBoundingClientRect().width;
    const estreito = w>0 && (w/esc) < 38*u1;
    panel.classList.toggle('bt-panel--estreito', estreito);
    if(estreito){ const mm=(L.miniMin||6)*u1; panel.querySelectorAll('.bt-panel__minirow .bt-mini').forEach(b=>{ b.style.width=mm+'px'; b.style.height=mm+'px'; }); }
  }
}

/* ---------- eventos do painel (confirmar na mira / cancelar na direita / encerrar) ---------- */
function ligarPainel(){
  const q=s=>stage.querySelector(s);
  const bcf=q('#bconf'); if(bcf){ bcf.onclick=()=>confirmar(); bcf.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); confirmar(); } }; }
  // §333b: CANCELAR desarma e VOLTA à leitura (situação 2) daquela habilidade. Reconstrói o `detalhe` de leitura aqui
  // (só com helpers de base.js/motor) — a leitura de campo.js é ui→ui proibida, então repetimos o mínimo.
  const bcn=q('#bcanc'); if(bcn)bcn.onclick=()=>{ const a=armado; armado=null;alvos=[];escolhidos=[]; detalhe=null;
    if(a){ const u=st.lados[st.ativo].units.find(x=>x.uid===a.uid); const ac=u&&acoesDe(st,u).find(x=>x.slot===a.slot);
      if(u&&ac){ const nv=(typeof nivelSlotEmBatalha==='function')?nivelSlotEmBatalha(st,u,a.slot):1; if(typeof foco!=='undefined') foco=u.uid;
        detalhe={kind:'skill', uid:u.uid, nome:ac.nome, nv, chave:'skill-'+u.key+'-'+ac.slot, mono:mono(ac),
          cor:ac.slot==='defesa'?'var(--ink-mute)':COR(u.elem), desc:ac.desc, cost:ac.cost, cd:ac.cd, cdNow:(u.cd[a.slot]||0), tf:classesTxt(u,ac), motivo:''}; } }
    render(); };
  const be=q('#bend'); if(be)be.onclick=()=>encerrarTurno();
  try{ _ajustarPainel(); }catch(e){}
}

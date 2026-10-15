// ui/painel.js — §329/§329b: o PAINEL DE BAIXO À RISCA da referência (imagem à esquerda, título vermelho,
// descrição com palavras-chave coloridas, CUSTO no canto sup. direito, Tipo·Função embaixo-esq, RECARGA embaixo-dir).
// O conteúdo segue o toque; em repouso mostra o DEUS EM FOCO (nunca vazio). Tamanhos de fonte vêm de
// LAYOUT_BATALHA.painel.fonte; se o corpo não couber, encolhe até o mínimo e então rola (_ajustarPainel).

// §333: RECARGA curta p/ a coluna de dados ("4 turnos · pronta" / "pronta em 2").
function _recargaCurto(cd, cdNow){ if(!cd) return 'sem recarga'; return cdNow>0 ? `pronta em ${cdNow}` : `${cd} turno${cd>1?'s':''} · pronta`; }
// bolinhas de custo (só as bolinhas; o rótulo "CUSTO" vem na coluna de dados).
function _custoPips(cost){
  if(!cost) return `<span class="bt-panel__valor" style="text-transform:none">livre</span>`;
  const out=[]; for(const k in cost){ if(k==='livre')continue; for(let i=0;i<cost[k];i++) out.push(`<i style="background:${COR(k)}"></i>`); }
  for(let i=0;i<(cost.livre||0);i++) out.push(`<i class="free"></i>`);
  return out.length ? `<span class="bt-panel__pips">${out.join('')}</span>` : `<span class="bt-panel__valor" style="text-transform:none">livre</span>`;
}

// o DEUS em foco (replicado aqui p/ não cruzar ui→ui; `todas`/`_catPartida` são globais isentos).
function _focoGod(){
  const u=(typeof foco!=='undefined'&&foco)?todas().find(x=>x.uid===foco):null;
  if(u&&u.vivo) return u;
  const eu=ladoExibido(); const lado=ehMeuTurno()?st.lados[eu]:st.lados[1-eu];
  return lado.units.find(x=>x.vivo)||st.lados[eu].units.find(x=>x.vivo)||st.lados[eu].units[0];
}
function _unidadeModeloFoco(){
  const u=_focoGod(); if(!u) return { titulo:'', desc:'' };
  const cat=(typeof _catPartida==='function')?_catPartida():(typeof GODS!=='undefined'?GODS:{});
  const g=cat[u.key]||{};
  return { chave:'god-'+u.key, cor:COR(u.elem), titulo:(u.nome||'').toUpperCase(), donoUid:u.uid,
    desc:(g.passiva?`Passiva — ${g.passiva.nome}: ${g.passiva.desc}`:'Sem passiva.'),
    rodape:(u.funcao||g.funcao||'')+' · '+(ELAB[u.elem]||u.elem),
    dados:[{label:'VIDA', valor:`${u.hp}/${u.maxHp}${u.shield?' ◧'+u.shield:''}`}] };
}

// §333: MODELO unificado do painel (grade de colunas). Cada situação diz QUEM é o DONO do conteúdo (donoUid) — as
// miniaturas da coluna 5 são SEMPRE do dono, nunca do "deus em foco".
function _modeloPainel(){
  if(armado){
    const u=st.lados[st.ativo].units.find(x=>x.uid===armado.uid);
    const a=u&&acoesDe(st,u).find(x=>x.slot===armado.slot);
    if(a){
      const nv=(typeof nivelSlotEmBatalha==='function')?nivelSlotEmBatalha(st,u,armado.slot):1;
      const falta=faltamAlvos();
      let hint;
      if(armado.distribui) hint = escolhidos.length ? `${escolhidos.length} alvo${escolhidos.length>1?'s':''} · reparte` : 'Toque os inimigos a repartir';
      else if(falta>0){ const passo=armado.passos[escolhidos.length]; const quem=passo==='aliado'?'o aliado':'o inimigo';
        hint = armado.passos.length>1 ? `Toque ${quem} ${escolhidos.length+1}/${armado.passos.length}` : `Toque ${quem}`; }
      else hint='Pronto · confirme';
      const podeConf = armado.distribui ? escolhidos.length>0 : falta<=0;
      const modo=a.alterna?(u.modo===0?' — ANEL':' — MANTO'):'';
      return { chave:'skill-'+u.key+'-'+a.slot, mono:mono(a), cor:a.slot==='defesa'?'var(--ink-mute)':COR(u.elem), redondo:true,
        titulo:(a.nome+modo).toUpperCase(), nv, desc:a.desc, rodape:classesTxt(u,a), donoUid:u.uid,
        dados:[{label:'CUSTO', custo:a.cost}, {label:'RECARGA', valor:_recargaCurto(a.cd, u.cd[armado.slot]||0)}],
        acao:{ status:hint, act:`${podeConf?`<button class="b b--ok b--sm" id="bconf">Confirmar</button>`:''}<button class="b b--quiet b--sm" id="bcanc">Cancelar</button>` } };
    }
  }
  if(typeof detalhe!=='undefined' && detalhe) return _modeloDetalhe(detalhe);
  if(typeof resumoTurno!=='undefined' && resumoTurno && resumoTurno.length) {
    const linhas=resumoTurno.filter(r=>r.tipo!=='turno'&&r.tipo!=='abertura').slice(-5).map(r=>narrar(r)).filter(Boolean);
    // §332: imagem NUNCA vazia — deus que agiu por último (senão 1º do resumo; senão arte de turno do oponente; senão 1ª do oponente).
    const acoes=resumoTurno.filter(r=>r.tipo==='acao'&&r.origem);
    let key = acoes.length ? acoes[acoes.length-1].origem : null;
    if(!key && typeof ARTE_TURNO!=='undefined' && ARTE_TURNO) key = ARTE_TURNO.oponente;
    if(!key){ const lo=st.lados[1-ladoExibido()]; const u0=lo&&(lo.units.find(x=>x.vivo)||lo.units[0]); key=u0&&u0.key; }
    const un = key && typeof todas==='function' ? todas().find(x=>x.key===key) : null;
    const cor = un ? COR(un.elem) : 'var(--gold-soft)';
    return { chave: key?('god-'+key):'detail', cor, titulo:'RESUMO · '+rotuloLado(1-ladoExibido()).toUpperCase(),
      desc:linhas.join('  ·  ')||'sem ações', donoUid: un?un.uid:null };
  }
  // em repouso o painel NUNCA fica vazio — mostra o deus em foco (retrato + passiva).
  return _unidadeModeloFoco();
}
function _modeloDetalhe(d){
  if(d.kind==='skill') return { chave:d.chave, mono:d.mono, cor:d.cor, redondo:true, titulo:d.nome.toUpperCase(), nv:d.nv,
    desc:d.desc, rodape:d.tf, motivo:d.motivo, donoUid:d.uid,
    dados:[{label:'CUSTO', custo:d.cost}, {label:'RECARGA', valor:_recargaCurto(d.cd, d.cdNow)}] };
  if(d.kind==='unidade') return { chave:d.chave, cor:d.cor, titulo:d.nome.toUpperCase(), donoUid:d.uid,
    desc:(d.passivaNome?`Passiva — ${d.passivaNome}: ${d.passivaDesc}`:'Sem passiva.'),
    rodape:d.sub, dados:[{label:'VIDA', valor:`${d.hp}/${d.maxHp}${d.shield?' ◧'+d.shield:''}`}] };
  if(d.kind==='efeito') return { emoji:d.icone, cor:d.cor, titulo:(d.nome+(d.num?' '+d.num:'')).toUpperCase(), donoUid:d.uid,
    desc:d.desc, rodape:'',
    dados:[{label:'TURNOS', valor:(d.dur!=null? `${d.dur} turno${d.dur>1?'s':''}` : 'permanente')+(d.aplicadoPor?` · aplicado por ${d.aplicadoPor}`:'')}] };
  if(d.kind==='passiva') return { chave:d.chave, cor:d.cor, titulo:d.nome.toUpperCase(), donoUid:d.uid,
    desc:d.desc, rodape:'NÃO GASTA A AÇÃO · NÃO SILENCIÁVEL'+(d.inerte?' · INERTE':''),
    dados:[{label:'PASSIVA', valor:(d.dono||'').toUpperCase()}] };
  return _unidadeModeloFoco();
}
// coluna 3 — DADOS (CUSTO+bolinhas / RECARGA / VIDA / TURNOS). Vazia → a coluna some (a 2 cresce).
function _dadosHTML(m, L, F){
  if(!m.dados || !m.dados.length) return '';
  const blocos=m.dados.map(d=>{
    const val = ('custo' in d) ? _custoPips(d.custo) : `<span class="bt-panel__valor">${H(d.valor||'')}</span>`;
    return `<div class="bt-panel__dado"><span class="bt-panel__rotulo" style="font-size:${U(F.rotulo||1.7)}">${H(d.label||'')}</span><span class="bt-panel__dadoval" style="font-size:${U(F.dado||1.9)}">${val}</span></div>`;
  }).join('');
  return `<div class="bt-panel__dados" style="width:${U(L.dados||22)}">${blocos}</div>`;
}
// coluna 4 — AÇÃO (só com habilidade ARMADA): instrução em cima, Confirmar/Cancelar embaixo.
function _acaoHTML(m, L, F){
  if(!m.acao) return '';
  return `<div class="bt-panel__acao" style="width:${U(L.acao||17)}">
    <div class="bt-panel__acaohint" style="font-size:${U(F.acao||1.9)}">▸ ${H(m.acao.status||'')}</div>
    <div class="bt-panel__acaobtns">${m.acao.act||''}</div></div>`;
}
// o PAINEL de baixo (view.js injeta o `style` de posição em u). §333: GRADE de colunas lado a lado, sem absolutos.
function painelBaixoHTML(styleStr){
  const m=_modeloPainel();
  const L=(typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA&&LAYOUT_BATALHA.painel)||{img:12};
  const F=L.fonte||{titulo:3,corpo:2.5,corpoMin:2.3,rodape:1.9,rotulo:1.7,dado:1.9,acao:1.9};
  const imgStyle=`width:${U(L.img||12)};height:${U(L.img||12)}`;
  let img;
  if(m.emoji) img=`<div class="bt-panel__img" style="${imgStyle};display:flex;align-items:center;justify-content:center;font-size:${U(7)}">${m.emoji}</div>`;
  else {
    const ehSkill=/^skill-/.test(m.chave||'');
    const fallback = ehSkill && m.mono ? `<span class="bt-panel__mono" style="color:${m.cor||'var(--ink-dim)'}">${H(m.mono)}</span>` : '';
    img=`<div class="bt-panel__img" style="${imgStyle}${m.cor?';border-color:'+m.cor:''}">${slot(m.chave||'detail','',m.cor,0,m.redondo)}${fallback}</div>`;
  }
  const gap=L.gapCol||1.5, pad=L.pad||1;
  return `<div class="bt-panel" style="${styleStr};gap:${U(gap)};padding:${U(pad)};--fs-corpo:${U(F.corpo)};--fs-min:${U(F.corpoMin||2.3)}">
    ${img}
    <div class="bt-panel__conteudo">
      <div class="bt-panel__titulo" style="font-size:${U(F.titulo)}">${H(m.titulo||'')}${m.nv>1?`<span class="bt-panel__nv">Nv ${m.nv}</span>`:''}</div>
      <div class="bt-panel__desc" style="font-size:${U(F.corpo)}">${realce(m.desc||'')}${m.motivo?`<div class="bt-panel__motivo">⊘ ${H(m.motivo)}</div>`:''}</div>
      ${m.rodape?`<div class="bt-panel__rodape" style="font-size:${U(F.rodape)}">${H(m.rodape)}</div>`:''}
    </div>
    ${_dadosHTML(m,L,F)}
    ${_acaoHTML(m,L,F)}
    ${_painelMinis(L,m)}
  </div>`;
}
// §333 REGRA (a): coluna 5 — as 4 miniaturas são SEMPRE do DONO do conteúdo do painel (donoUid), com a habilidade
// mostrada destacada (moldura dourada). O clique [data-look] é religado pelo campo, que varre o stage inteiro.
function _painelMinis(L, m){
  const uid = m && m.donoUid;
  const u = uid && typeof todas==='function' ? todas().find(x=>x.uid===uid) : null;
  if(!u || !u.vivo) return '';
  const sz=(L&&L.mini)||5.5;
  const selSlot = (m.chave && /^skill-/.test(m.chave)) ? m.chave.split('-').pop() : null;
  const minis=acoesDe(st,u).map(a=>{
    const anel=a.slot==='defesa'?'var(--ink-mute)':COR(u.elem);
    const sel = selSlot && a.slot===selSlot;
    return `<button class="bt-mini ${sel?'is-sel':''}" data-look="${u.uid}|${a.slot}" title="${H(a.nome)}"
      style="width:${U(sz)};height:${U(sz)};border-color:${anel}"><span class="bt-mini__mono" style="color:${anel}">${H(mono(a))}</span>${slot('skill-'+u.key+'-'+a.slot,'',null,0,true)}</button>`;
  }).join('');
  return `<div class="bt-panel__minis" style="width:${U((L&&L.minis)||27)}"><span class="bt-panel__minilab">Habilidades de ${H(u.nome)}</span><div class="bt-panel__minirow">${minis}</div></div>`;
}

// §333: encaixe fino do painel. O TÍTULO encolhe até tituloMin (2,4u) p/ caber em 1 linha sem "…". A DESCRIÇÃO
// não encolhe: rola dentro da coluna 2 (overflow-y). Em 16:9 ESTREITO (coluna 2 < 40u) colapsa p/ caber (classe
// .bt-panel--estreito: some o rótulo das minis, dados viram linha). Roda no navegador (layout real); jsdom é no-op.
function _ajustarPainel(){
  const panel=stage.querySelector('.bt-panel'); if(!panel) return;
  const F=(typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA.painel&&LAYOUT_BATALHA.painel.fonte)||{};
  const base=document.getElementById('baselayer');
  const u1=base?(parseFloat(getComputedStyle(base).getPropertyValue('--u'))||4.28):4.28;
  const esc=(typeof ultimaEscala!=='undefined'&&ultimaEscala)||1;
  const tit=panel.querySelector('.bt-panel__titulo');
  if(tit){ const floor=(F.tituloMin||2.4)*u1; let fs=parseFloat(getComputedStyle(tit).fontSize)||14, g=0;
    while(tit.scrollWidth>tit.clientWidth+1 && fs>floor && g++<40){ fs-=0.5; tit.style.fontSize=fs+'px'; } }
  const col2=panel.querySelector('.bt-panel__conteudo');
  if(col2){ const w=col2.getBoundingClientRect().width; if(w>0) panel.classList.toggle('bt-panel--estreito', (w/esc) < 40*u1); }
}

/* ---------- eventos do painel (confirmar/cancelar/encerrar) ---------- */
function ligarPainel(){
  const q=s=>stage.querySelector(s);
  const bcf=q('#bconf'); if(bcf)bcf.onclick=()=>confirmar();
  const bcn=q('#bcanc'); if(bcn)bcn.onclick=()=>{ armado=null;alvos=[];escolhidos=[];detalhe=null;render(); };
  const be=q('#bend'); if(be)be.onclick=()=>encerrarTurno();
  try{ _ajustarPainel(); }catch(e){}
}

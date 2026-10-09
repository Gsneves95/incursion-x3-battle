// ui/painel.js — §329/§329b: o PAINEL DE BAIXO À RISCA da referência (imagem à esquerda, título vermelho,
// descrição com palavras-chave coloridas, CUSTO no canto sup. direito, Tipo·Função embaixo-esq, RECARGA embaixo-dir).
// O conteúdo segue o toque; em repouso mostra o DEUS EM FOCO (nunca vazio). Tamanhos de fonte vêm de
// LAYOUT_BATALHA.painel.fonte; se o corpo não couber, encolhe até o mínimo e então rola (_ajustarPainel).

function btCustoHTML(cost){
  const out=[]; if(cost){ for(const k in cost){ if(k==='livre')continue; for(let i=0;i<cost[k];i++) out.push(`<i style="background:${COR(k)}"></i>`); }
    for(let i=0;i<(cost.livre||0);i++) out.push(`<i class="free"></i>`); }
  return `<div class="bt-panel__custo">Custo:${out.length?' '+out.join(''):' <span style="text-transform:none">livre</span>'}</div>`;
}
function _recargaTxt(cd, cdNow){ if(!cd) return 'Sem recarga'; return cdNow>0 ? `Recarga ${cd} · pronta em ${cdNow}` : `Recarga ${cd} · pronta`; }

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
  return { chave:'god-'+u.key, cor:COR(u.elem), titulo:(u.nome||'').toUpperCase(),
    desc:(g.passiva?`Passiva — ${g.passiva.nome}: ${g.passiva.desc}`:'Sem passiva.'),
    tf:(u.funcao||g.funcao||'')+' · '+(ELAB[u.elem]||u.elem), cd:`Vida ${u.hp}/${u.maxHp}${u.shield?' ◧'+u.shield:''}` };
}

// MODELO do painel conforme o estado de interação.
function _modeloPainel(){
  const l=st.lados[st.ativo];
  if(armado){
    const u=st.lados[st.ativo].units.find(x=>x.uid===armado.uid);
    const a=u&&acoesDe(st,u).find(x=>x.slot===armado.slot);
    if(a){
      const nv=(typeof nivelSlotEmBatalha==='function')?nivelSlotEmBatalha(st,u,armado.slot):1;
      const falta=faltamAlvos();
      let hint;
      if(armado.distribui) hint = escolhidos.length ? `${escolhidos.length} alvo${escolhidos.length>1?'s':''} · reparte` : 'toque os inimigos a repartir';
      else if(falta>0){ const passo=armado.passos[escolhidos.length]; const quem=passo==='aliado'?'o aliado':'o inimigo';
        hint = armado.passos.length>1 ? `toque ${quem} ${escolhidos.length+1}/${armado.passos.length}` : `toque ${quem}`; }
      else hint='pronto · confirme';
      const podeConf = armado.distribui ? escolhidos.length>0 : falta<=0;
      const modo=a.alterna?(u.modo===0?' — ANEL':' — MANTO'):'';
      return { chave:'skill-'+u.key+'-'+a.slot, mono:mono(a), cor:a.slot==='defesa'?'var(--ink-mute)':COR(u.elem), redondo:true,
        titulo:(a.nome+modo).toUpperCase(), nv, status:'▸ '+hint, desc:a.desc, custo:a.cost, tf:classesTxt(u,a), cd:_recargaTxt(a.cd, u.cd[armado.slot]||0),
        act:`${podeConf?`<button class="b b--ok b--sm" id="bconf">Confirmar</button>`:''}<button class="b b--quiet b--sm" id="bcanc">Cancelar</button>` };
    }
  }
  if(typeof detalhe!=='undefined' && detalhe) return _modeloDetalhe(detalhe);
  if(typeof resumoTurno!=='undefined' && resumoTurno && resumoTurno.length) {
    const linhas=resumoTurno.filter(r=>r.tipo!=='turno'&&r.tipo!=='abertura').slice(-5).map(r=>narrar(r)).filter(Boolean);
    return { chave:'detail', titulo:'RESUMO · '+rotuloLado(1-ladoExibido()).toUpperCase(), desc:linhas.join('  ·  ')||'sem ações', cd:'Turno '+st.turno };
  }
  // §329b: em repouso o painel NUNCA fica vazio — mostra o deus em foco (retrato + passiva), no lugar da citação.
  return _unidadeModeloFoco();
}
function _modeloDetalhe(d){
  if(d.kind==='skill') return { chave:d.chave, mono:d.mono, cor:d.cor, redondo:true, titulo:d.nome.toUpperCase(), nv:d.nv,
    desc:d.desc, custo:d.cost, tf:d.tf, cd:_recargaTxt(d.cd, d.cdNow), motivo:d.motivo };
  if(d.kind==='unidade') return { chave:d.chave, cor:d.cor, titulo:d.nome.toUpperCase(),
    desc:(d.passivaNome?`Passiva — ${d.passivaNome}: ${d.passivaDesc}`:'Sem passiva.'),
    tf:d.sub, cd:`Vida ${d.hp}/${d.maxHp}${d.shield?' ◧'+d.shield:''}` };
  if(d.kind==='efeito') return { emoji:d.icone, cor:d.cor, titulo:(d.nome+(d.num?' '+d.num:'')).toUpperCase(),
    desc:d.desc, tf:'em '+d.dono, cd:(d.dur!=null? d.dur+' turno'+(d.dur>1?'s':'') : 'permanente') };
  if(d.kind==='passiva') return { chave:d.chave, cor:d.cor, titulo:d.nome.toUpperCase(),
    desc:d.desc, tf:'NÃO GASTA A AÇÃO · NÃO SILENCIÁVEL'+(d.inerte?' · INERTE':''), cd:d.dono.toUpperCase()+' · PASSIVA' };
  return _unidadeModeloFoco();
}
// o PAINEL de baixo (view.js injeta o `style` de posição em u).
function painelBaixoHTML(styleStr){
  const m=_modeloPainel();
  const L=(typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA&&LAYOUT_BATALHA.painel)||{img:13.6};
  const F=L.fonte||{titulo:3.4,corpo:2.8,corpoMin:2.4,rodape:2.2};
  const imgStyle=`width:${U(L.img||13.6)};height:${U(L.img||13.6)}`;
  // imagem: efeito = emoji; habilidade = arte (com monograma de reserva quando a arte falta); deus = retrato embutido.
  let img;
  if(m.emoji) img=`<div class="bt-panel__img" style="${imgStyle};display:flex;align-items:center;justify-content:center;font-size:${U(7)}">${m.emoji}</div>`;
  else {
    const ehSkill=/^skill-/.test(m.chave||'');
    const fallback = ehSkill && m.mono ? `<span class="bt-panel__mono" style="color:${m.cor||'var(--ink-dim)'}">${H(m.mono)}</span>` : '';
    img=`<div class="bt-panel__img" style="${imgStyle}${m.cor?';border-color:'+m.cor:''}">${slot(m.chave||'detail','',m.cor,0,m.redondo)}${fallback}</div>`;
  }
  return `<div class="bt-panel" style="${styleStr};--fs-corpo:${U(F.corpo)};--fs-min:${U(F.corpoMin)}">
    ${img}
    <div class="bt-panel__body">
      ${m.custo!==undefined?btCustoHTML(m.custo):''}
      <div class="bt-panel__titulo" style="font-size:${U(F.titulo)}">${H(m.titulo||'')}${m.nv>1?`<span class="bt-panel__nv">Nv ${m.nv}</span>`:''}</div>
      <div class="bt-panel__desc" style="font-size:${U(F.corpo)}">${m.status?`<span style="color:var(--gold-text);font-weight:700">${H(m.status)}</span>  `:''}${realce(m.desc||'')}${m.motivo?`<div class="bt-panel__motivo">⊘ ${H(m.motivo)}</div>`:''}</div>
      <div class="bt-panel__rodape" style="font-size:${U(F.rodape)}"><span class="bt-panel__tf">${H(m.tf||'')}</span><span class="bt-panel__cd">${H(m.cd||'')}</span></div>
      ${m.act?`<div class="bt-panel__act">${m.act}</div>`:''}
    </div>
    ${_painelMinis(L)}
  </div>`;
}
// §330: a caixa "Toque numa habilidade" vive DENTRO do painel, na ponta direita — as 4 minis do deus em FOCO
// (leitura; vê o kit do oponente). O clique [data-look] é religado pelo campo, que varre o stage inteiro.
function _painelMinis(L){
  const u=_focoGod(); if(!u||!u.vivo) return '';
  const sz=(L&&L.mini)||5.5;
  const minis=acoesDe(st,u).map(a=>{
    const anel=a.slot==='defesa'?'var(--ink-mute)':COR(u.elem);
    const sel=typeof detalhe!=='undefined'&&detalhe&&detalhe.kind==='skill'&&detalhe.chave==='skill-'+u.key+'-'+a.slot;
    return `<button class="bt-mini ${sel?'is-sel':''}" data-look="${u.uid}|${a.slot}" title="${H(a.nome)}"
      style="width:${U(sz)};height:${U(sz)};border-color:${anel}"><span class="bt-mini__mono" style="color:${anel}">${H(mono(a))}</span>${slot('skill-'+u.key+'-'+a.slot,'',null,0,true)}</button>`;
  }).join('');
  return `<div class="bt-panel__minis"><span class="bt-panel__minilab">Toque numa habilidade</span><div class="bt-panel__minirow">${minis}</div></div>`;
}

// §329b: encaixe fino do painel — encolhe título/função até caber na LARGURA; encolhe o corpo até o mínimo e,
// se ainda não couber, deixa ROLAR (nunca corta). Roda no navegador (layout real); em jsdom é no-op.
function _ajustarPainel(){
  const desc=stage.querySelector('.bt-panel__desc');
  const minPx = desc ? parseFloat(getComputedStyle(desc.closest('.bt-panel')).getPropertyValue('--fs-min'))||10 : 10;
  const shrinkW=(sel,floor)=>{ const el=stage.querySelector(sel); if(!el) return; let fs=parseFloat(getComputedStyle(el).fontSize)||14, g=0;
    while(el.scrollWidth>el.clientWidth+1 && fs>floor && g++<60){ fs-=0.5; el.style.fontSize=fs+'px'; } };
  shrinkW('.bt-panel__titulo', Math.max(10, minPx)); shrinkW('.bt-panel__tf', Math.max(8, minPx-2));
  if(desc){ let fs=parseFloat(getComputedStyle(desc).fontSize)||14, g=0;
    while(desc.scrollHeight>desc.clientHeight+1 && fs>minPx && g++<60){ fs-=0.5; desc.style.fontSize=fs+'px'; } }
}

/* ---------- eventos do painel (confirmar/cancelar/encerrar) ---------- */
function ligarPainel(){
  const q=s=>stage.querySelector(s);
  const bcf=q('#bconf'); if(bcf)bcf.onclick=()=>confirmar();
  const bcn=q('#bcanc'); if(bcn)bcn.onclick=()=>{ armado=null;alvos=[];escolhidos=[];detalhe=null;render(); };
  const be=q('#bend'); if(be)be.onclick=()=>encerrarTurno();
  try{ _ajustarPainel(); }catch(e){}
}

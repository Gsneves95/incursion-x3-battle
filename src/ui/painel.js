// ui/painel.js — §329: o PAINEL DE BAIXO À RISCA da referência (imagem à esquerda, título vermelho, descrição
// com palavras-chave coloridas, CUSTO no canto sup. direito, Tipo·Função embaixo-esq, RECARGA embaixo-dir).
// O conteúdo segue o toque: habilidade (minha, armada) · retrato (nome/função/vida/passiva) · ícone de efeito ·
// leitura de habilidade (inclusive do OPONENTE pela caixa de minis). Posições vêm de LAYOUT_BATALHA (view.js posiciona).

// CUSTO em bolinhas (sem realce de falta — leitura pura); "SEM CUSTO" quando não há.
function btCustoHTML(cost){
  const out=[]; if(cost){ for(const k in cost){ if(k==='livre')continue; for(let i=0;i<cost[k];i++) out.push(`<i style="background:${COR(k)}"></i>`); }
    for(let i=0;i<(cost.livre||0);i++) out.push(`<i class="free"></i>`); }
  return `<div class="bt-panel__custo">Custo:${out.length?' '+out.join(''):' <span style="text-transform:none">livre</span>'}</div>`;
}
function _recargaTxt(cd, cdNow){ if(!cd) return 'Sem recarga'; return cdNow>0 ? `Recarga ${cd} · pronta em ${cdNow}` : `Recarga ${cd} · pronta`; }

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
      return { chave:'skill-'+u.key+'-'+a.slot, cor:a.slot==='defesa'?'var(--ink-mute)':COR(u.elem), redondo:true,
        titulo:(a.nome+modo).toUpperCase(), nv, status:'▸ '+hint, desc:a.desc, custo:a.cost, tf:classesTxt(u,a), cd:_recargaTxt(a.cd, u.cd[armado.slot]||0),
        act:`${podeConf?`<button class="b b--ok b--sm" id="bconf">Confirmar</button>`:''}<button class="b b--quiet b--sm" id="bcanc">Cancelar</button>` };
    }
  }
  if(typeof detalhe!=='undefined' && detalhe) return _modeloDetalhe(detalhe);
  if(typeof resumoTurno!=='undefined' && resumoTurno && resumoTurno.length) {
    const linhas=resumoTurno.filter(r=>r.tipo!=='turno'&&r.tipo!=='abertura').slice(-5).map(r=>narrar(r)).filter(Boolean);
    return { chave:'detail', titulo:'RESUMO · '+rotuloLado(1-ladoExibido()).toUpperCase(), desc:linhas.join('  ·  ')||'sem ações', cd:'Turno '+st.turno };
  }
  if(ehMeuTurno() && (l.dividaLivre||0)>0) return { dica:`Ao encerrar, escolha ${l.dividaLivre} energia livre` };
  if(!ehMeuTurno()) return { dica:`Vez de ${rotuloLado(st.ativo)} — aguarde` };
  const cite=(typeof BATALHA_TXT!=='undefined'&&BATALHA_TXT&&BATALHA_TXT.citacao)?BATALHA_TXT.citacao:'';
  return { cite };
}
function _modeloDetalhe(d){
  if(d.kind==='skill') return { chave:d.chave, cor:d.cor, redondo:true, titulo:d.nome.toUpperCase(), nv:d.nv,
    desc:d.desc, custo:d.cost, tf:d.tf, cd:_recargaTxt(d.cd, d.cdNow), motivo:d.motivo };
  if(d.kind==='unidade') return { chave:d.chave, cor:d.cor, titulo:d.nome.toUpperCase(),
    desc:(d.passivaNome?`Passiva — ${d.passivaNome}: ${d.passivaDesc}`:'Sem passiva.'),
    tf:d.sub, cd:`Vida ${d.hp}/${d.maxHp}${d.shield?' ◧'+d.shield:''}` };
  if(d.kind==='efeito') return { emoji:d.icone, cor:d.cor, titulo:(d.nome+(d.num?' '+d.num:'')).toUpperCase(),
    desc:d.desc, tf:'em '+d.dono, cd:(d.dur!=null? d.dur+' turno'+(d.dur>1?'s':'') : 'permanente') };
  if(d.kind==='passiva') return { chave:d.chave, cor:d.cor, titulo:d.nome.toUpperCase(),
    desc:d.desc, tf:'NÃO GASTA A AÇÃO · NÃO SILENCIÁVEL'+(d.inerte?' · INERTE':''), cd:d.dono.toUpperCase()+' · PASSIVA' };
  return { dica:'' };
}
// o PAINEL de baixo (view.js injeta o `style` de posição em u).
function painelBaixoHTML(styleStr){
  const m=_modeloPainel();
  const L=(typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA&&LAYOUT_BATALHA.painel)||{img:13.6};
  const imgStyle=`width:${U(L.img||13.6)};height:${U(L.img||13.6)}`;
  if(m.dica!=null || m.cite!=null){
    const txt = m.cite!=null ? `<span style="font-style:italic;color:var(--gold-soft)">${H(m.cite)}</span>` : `<b>${H(m.dica)}</b>`;
    return `<div class="bt-panel" style="${styleStr}"><div class="bt-panel__img" style="${imgStyle}"></div>
      <div class="bt-panel__body"><div class="bt-panel__desc" style="display:flex;align-items:center;height:100%">${txt}</div></div></div>`;
  }
  const img = m.emoji
    ? `<div class="bt-panel__img" style="${imgStyle};display:flex;align-items:center;justify-content:center;font-size:${U(7)}">${m.emoji}</div>`
    : `<div class="bt-panel__img" style="${imgStyle}${m.cor?';border-color:'+m.cor:''}">${slot(m.chave||'detail','',m.cor,0,m.redondo)}</div>`;
  return `<div class="bt-panel" style="${styleStr}">
    ${img}
    <div class="bt-panel__body">
      ${m.custo!==undefined?btCustoHTML(m.custo):''}
      <div class="bt-panel__titulo">${H(m.titulo||'')}${m.nv>1?`<span class="bt-panel__nv">Nv ${m.nv}</span>`:''}</div>
      <div class="bt-panel__desc">${m.status?`<span style="color:var(--gold-text);font-weight:700">${H(m.status)}</span>  `:''}${realce(m.desc||'')}${m.motivo?`<div class="bt-panel__motivo">⊘ ${H(m.motivo)}</div>`:''}</div>
      <div class="bt-panel__rodape"><span class="bt-panel__tf">${H(m.tf||'')}</span><span class="bt-panel__cd">${H(m.cd||'')}</span></div>
      ${m.act?`<div class="bt-panel__act">${m.act}</div>`:''}
    </div>
  </div>`;
}

/* ---------- eventos do painel (confirmar/cancelar/encerrar) ---------- */
function ligarPainel(){
  const q=s=>stage.querySelector(s);
  const bcf=q('#bconf'); if(bcf)bcf.onclick=()=>confirmar();
  const bcn=q('#bcanc'); if(bcn)bcn.onclick=()=>{ armado=null;alvos=[];escolhidos=[];detalhe=null;render(); };
  const be=q('#bend'); if(be)be.onclick=()=>encerrarTurno();
}

// ui/painel.js — §335: o BattleDetailPanel do design do dono (Claude Design), em PX de design (tela fixa 1846×852).
// Grade 840 | 564 | resto: [IMAGEM+TÍTULO+PÍLULAS+DESCRIÇÃO] | [CUSTO/RECARGA + mira de instrução] | [CANCELAR ou
// OUTRAS HABILIDADES]. O CONTEÚDO por situação é o do §333b (deus / habilidade lida / armada / efeito / resumo);
// as miniaturas são SEMPRE do DONO do conteúdo (donoUid, §333). O painel nunca fica vazio (§329b).

const TIPO_SLOT = { basico:'BÁSICO', habilidade:'HABILIDADE', milagre:'MILAGRE', defesa:'DEFESA' };
const CAT_PILL = { bom:{txt:'BOM',cor:'#6fe6a0'}, ruim:{txt:'RUIM',cor:'#ff6b86'},
  controle:{txt:'CONTROLE',cor:'#b98bff'}, defesa:{txt:'DEFESA',cor:'#6fb6ff'} };
function _P(){ return (typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA&&LAYOUT_BATALHA.painel)||{}; }
function _PC(){ return (typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA&&LAYOUT_BATALHA.cor)||{}; }

// bolinhas de custo (tamanho em px; livre em cinza). §340: custo vazio → "Grátis"
// (verde-pronta #4BE38A, Rajdhani negrito, ~fonte do valor da RECARGA ao lado) no lugar das orbes.
function _custoPips(cost, sz){
  sz=sz||27;
  const gratis=`<span style="font-size:${Math.round(sz*1.1)}px;font-weight:700;letter-spacing:.03em;color:#4BE38A">Grátis</span>`;
  if(!cost || !Object.keys(cost).length) return gratis;
  const out=[];
  for(const k in cost){ if(k==='livre')continue; for(let i=0;i<cost[k];i++) out.push(orbe(k,sz)); }
  for(let i=0;i<(cost.livre||0);i++) out.push(orbe('livre',sz));
  return out.length ? `<div style="display:flex;gap:10px">${out.join('')}</div>` : gratis;
}

// o DEUS em foco (replicado aqui p/ não cruzar ui→ui; `todas`/`_catPartida` são globais isentos).
function _focoGod(){
  const u=(typeof foco!=='undefined'&&foco)?todas().find(x=>x.uid===foco):null;
  if(u&&u.vivo) return u;
  const eu=ladoExibido(); const lado=ehMeuTurno()?st.lados[eu]:st.lados[1-eu];
  return lado.units.find(x=>x.vivo)||st.lados[eu].units.find(x=>x.vivo)||st.lados[eu].units[0];
}
// pílulas de uma HABILIDADE: TIPO (cor da energia) · classe · alvo · NV N (sempre por último).
function _etqSkill(slotName, tf, nv, cor){
  const parts=(tf||'').split(' · ');
  const etq=[{txt:(TIPO_SLOT[slotName]||slotName.toUpperCase()), cor}];
  if(parts[0]) etq.push({txt:parts[0]});
  if(parts[1]) etq.push({txt:parts[1]});
  etq.push({txt:'NV '+(nv||1)});
  return etq;
}
// INSTRUÇÃO de alvo (adapta como no HTML). o={alvo,passos,cdNow,disponivel,motivo,alvoNome}.
function _instSkill(o){
  if(o.cdNow>0) return {title:'Em recarga', sub:'Disponível em '+o.cdNow+' turno(s).', color:'#9AA4B8'};
  if(!o.disponivel && o.motivo==='sem_energia') return {title:'Energia insuficiente', sub:'Troque ou acumule energia para usar.', color:'#E8343C'};
  if(o.alvoNome) return {title:'Alvo: '+o.alvoNome, sub:'Ação marcada para este turno.', color:'#4BE38A'};
  if(o.alvo==='todosInimigos') return {title:'Todos os inimigos', sub:'Toque qualquer inimigo para confirmar.', color:'#F0B43C'};
  const p=(o.passos&&o.passos[0])||'';
  if(p==='aliado') return {title:'Toque um aliado', sub:'Selecione um aliado para usar esta habilidade.', color:'#F0B43C'};
  if(!p) return {title:'Toque para confirmar', sub:'Use esta habilidade neste turno.', color:'#F0B43C'};
  return {title:'Toque um inimigo', sub:'Selecione um inimigo para usar esta habilidade.', color:'#F0B43C'};
}

/* ---------- MODELOS (reaproveitam o §333b; meio = 2 células; inst = instrução; dir = cancelar | minis) ---------- */
function _dadosSkill(u, a, nv, cdNow, armadoFlag){
  const cor=a.slot==='defesa'?'#D6DAE2':COR(u.elem);
  const modo=a.alterna?(u.modo===0?' — ANEL':' — MANTO'):'';
  const alvoNome = (armadoFlag && typeof escolhidos!=='undefined' && escolhidos.length)
    ? (todas().find(x=>x.uid===escolhidos[0])||{}).nome : '';
  return { tipo:'skill', chave:'skill-'+u.key+'-'+a.slot, mono:mono(a), redondo:false, cor,
    titulo:(a.nome+modo),
    tituloCor: a.slot==='milagre'?'#E8343C':a.slot==='defesa'?'#D6DAE2':'#F0B43C',
    nv, desc:a.desc, etiquetas:_etqSkill(a.slot, classesTxt(u,a), nv, cor), donoUid:u.uid,
    meio:[{rotulo:'CUSTO', pips:a.cost||{}}, {rotulo:'RECARGA', num:String(a.cd||0), state:(cdNow>0?('· '+cdNow+' turno(s)'):'· pronta'), stateCor:(cdNow>0?'#E8343C':'#4BE38A')}],
    inst:_instSkill({alvo:a.alvo, passos:a.passos, cdNow, disponivel:a.disponivel, motivo:a.motivo, alvoNome}) };
}
function _modeloPainel(){
  if(armado){
    const u=st.lados[st.ativo].units.find(x=>x.uid===armado.uid);
    const a=u&&acoesDe(st,u).find(x=>x.slot===armado.slot);
    if(a){
      const nv=(typeof nivelSlotEmBatalha==='function')?nivelSlotEmBatalha(st,u,armado.slot):1;
      const cdNow=u.cd[armado.slot]||0;
      const m=_dadosSkill(u, a, nv, cdNow, true);
      m.armado=true; m.dir={ modo:'cancelar' };
      // §336: a instrução vira CONFIRMAR clicável quando a ação está pronta p/ disparar (área, sem-alvo, si-mesmo, auto,
      // ou distribui com ≥1 escolhido). Restaura o caminho do #bconf de antes do §335 (o toque no alvo também confirma).
      const pronto=(typeof faltamAlvos==='function')?(faltamAlvos()<=0):false;
      if(pronto){ m.prontoConfirmar=true;
        if(armado.distribui){ const n=(typeof escolhidos!=='undefined'?escolhidos.length:0); m.inst={title:`Confirmar · ${n} alvo${n>1?'s':''}`, sub:'Toque aqui para repartir o dano entre os escolhidos.', color:'#4BE38A'}; }
        else if(armado.aoe==='aliados'){ m.inst={title:'Todos os aliados', sub:'Toque qualquer aliado (ou aqui) para confirmar.', color:'#F0B43C'}; }
        else if(armado.aoe==='inimigos'){ m.inst={title:'Todos os inimigos', sub:'Toque qualquer inimigo (ou aqui) para confirmar.', color:'#F0B43C'}; }
        else { m.inst={title:'Confirmar', sub:'Toque aqui para usar esta habilidade.', color:'#4BE38A'}; }
      } else if(armado.distribui){ m.inst={title:'Repartir o dano', sub:'Toque os inimigos para escolher quem recebe.', color:'#F0B43C'}; }
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
    return { tipo:'resumo', chave:key?('god-'+key):'detail', cor:'#C9A44C', tituloCor:'#9AA4B8',
      titulo:'RESUMO · '+rotuloLado(1-ladoExibido()).toUpperCase(), desc:linhas.join('  ·  ')||'sem ações',
      donoUid:un?un.uid:null, inst:{title:'Resumo do turno', sub:'Toque para continuar.', color:'#F0B43C'},
      dir: un?{modo:'minis', selSlot:null}:null };
  }
  return _unidadeModeloFoco();
}
function _modeloDetalhe(d){
  if(d.kind==='skill'){
    const slotName=(d.chave||'').split('-').pop();
    const u=todas().find(x=>x.uid===d.uid);
    const a=u&&acoesDe(st,u).find(x=>x.slot===slotName);
    const cor=d.cor;
    const inst = a ? _instSkill({alvo:a.alvo, passos:a.passos, cdNow:(d.cdNow||0), disponivel:a.disponivel, motivo:a.motivo})
                   : {title:'Toque um inimigo', sub:'Selecione um alvo para usar esta habilidade.', color:'#F0B43C'};
    return { tipo:'skill', chave:d.chave, mono:d.mono, redondo:false, cor,
      titulo:(d.nome||''), tituloCor: slotName==='milagre'?'#E8343C':slotName==='defesa'?'#D6DAE2':'#F0B43C',
      nv:d.nv, desc:d.desc, motivo:d.motivo, etiquetas:_etqSkill(slotName, d.tf, d.nv, cor), donoUid:d.uid,
      meio:[{rotulo:'CUSTO', pips:d.cost||{}}, {rotulo:'RECARGA', num:String(d.cd||0), state:((d.cdNow||0)>0?('· '+d.cdNow+' turno(s)'):'· pronta'), stateCor:((d.cdNow||0)>0?'#E8343C':'#4BE38A')}],
      inst, dir:{modo:'minis', selSlot:slotName} };
  }
  if(d.kind==='unidade'){
    const sub=(d.sub||'').split(' · ');
    const aliado = st.lados[ladoExibido()].units.some(x=>x.uid===d.uid);
    const etq=[{txt:aliado?'ALIADO':'INIMIGO', cor:aliado?'#C9A44C':'#E5384A'}];
    if(sub[0]) etq.push({txt:sub[0]});
    if(sub[1]) etq.push({txt:sub[1]});
    return { tipo:'deus', chave:d.chave, cor:aliado?'#C9A44C':'#C9343C', tituloCor:aliado?'#F0B43C':'#E8343C',
      titulo:(d.nome||''), donoUid:d.uid,
      desc:(d.passivaNome?`Passiva — ${d.passivaNome}: ${d.passivaDesc}`:'Sem passiva.'), etiquetas:etq,
      meio:[{rotulo:'VIDA', valor:`${d.hp}/${d.maxHp}${d.shield?' ◧'+d.shield:''}`}, {rotulo:'ELEMENTO', valor:(sub[1]||'')}],
      inst:{title:'Toque uma habilidade', sub:aliado?'Escolha uma ação para este deus.':'Veja as habilidades ao lado.', color:'#F0B43C'},
      dir:{modo:'minis', selSlot:null} };
  }
  if(d.kind==='efeito'){
    const cp=CAT_PILL[d.cat]||{txt:(d.cat||'EFEITO').toUpperCase(), cor:'#C9A44C'};
    const durTxt=(d.dur!=null)?`${d.dur} turno${d.dur>1?'s':''}`:'permanente';
    return { tipo:'efeito', emoji:d.icone, cor:d.cor, tituloCor:'#F0B43C', titulo:(d.nome+(d.num?' '+d.num:'')), donoUid:d.uid,
      desc:d.desc, etiquetas:[{txt:cp.txt, cor:cp.cor}, {txt:(d.dur!=null)?`${d.dur} TURNO${d.dur>1?'S':''}`:'PERMANENTE'}],
      meio:[{rotulo:'TURNOS', valor:durTxt}, {rotulo:'APLICADO POR', valor:(d.aplicadoPor||'—')}],
      inst:{title:'Efeito ativo', sub:'Toque uma habilidade para agir.', color:'#F0B43C'}, dir:{modo:'minis', selSlot:null} };
  }
  if(d.kind==='passiva'){
    return { tipo:'passiva', chave:d.chave, cor:d.cor, tituloCor:'#F0B43C', titulo:(d.nome||''), donoUid:d.uid,
      desc:d.desc, etiquetas:[{txt:'PASSIVA', cor:d.cor}], inst:{title:'Passiva', sub:'Não gasta a ação.', color:'#F0B43C'}, dir:{modo:'minis', selSlot:null} };
  }
  return _unidadeModeloFoco();
}
function _unidadeModeloFoco(){
  const u=_focoGod(); if(!u) return { titulo:'', desc:'' };
  const cat=(typeof _catPartida==='function')?_catPartida():(typeof GODS!=='undefined'?GODS:{});
  const g=cat[u.key]||{};
  const elem=(ELAB[u.elem]||u.elem);
  const aliado = st.lados[ladoExibido()].units.some(x=>x.uid===u.uid);
  const etq=[{txt:aliado?'ALIADO':'INIMIGO', cor:aliado?'#C9A44C':'#E5384A'}];
  const funcao=(u.funcao||g.funcao||''); if(funcao) etq.push({txt:funcao.toUpperCase()});
  etq.push({txt:elem});
  return { tipo:'deus', chave:'god-'+u.key, cor:aliado?'#C9A44C':'#C9343C', tituloCor:aliado?'#F0B43C':'#E8343C',
    titulo:(u.nome||''), donoUid:u.uid,
    desc:(g.passiva?`Passiva — ${g.passiva.nome}: ${g.passiva.desc}`:'Sem passiva.'), etiquetas:etq,
    meio:[{rotulo:'VIDA', valor:`${u.hp}/${u.maxHp}${u.shield?' ◧'+u.shield:''}`}, {rotulo:'ELEMENTO', valor:elem}],
    inst:{title:'Toque uma habilidade', sub:aliado?'Escolha uma ação para este deus.':'Veja as habilidades ao lado.', color:'#F0B43C'},
    dir:{modo:'minis', selSlot:null} };
}

/* ---------- RENDER (§335: px de design) ---------- */
function _pilulasHTML(m, P){
  if(!m.etiquetas||!m.etiquetas.length) return '';
  const h=P.pilulaH||32, fs=P.pilula||19;
  // §335b: a 1ª pílula (tipo) vem no acento da energia — FUNDO na cor (acento ~20% alfa, = +33 do HTML), borda no acento,
  // texto claro. Como COR() devolve var(--elem-…), usa color-mix p/ o alfa (append "33" num var() é CSS inválido = sem fundo).
  const pil=e=>{ const st=e.cor?`background:color-mix(in srgb, ${e.cor} 20%, transparent);box-shadow:inset 0 0 0 1px ${e.cor};color:#F2ECFF`
    :`background:transparent;box-shadow:inset 0 0 0 1px rgba(201,164,76,.6);color:#E4E8F0`;
    return `<div style="height:${h}px;padding:0 18px;display:flex;align-items:center;border-radius:3px;${st};font-size:${fs}px;font-weight:600;letter-spacing:.04em;white-space:nowrap">${H(e.txt)}</div>`; };
  return `<div style="display:flex;gap:18px;flex-wrap:wrap">${m.etiquetas.map(pil).join('')}</div>`;
}
// COLUNA 1 — imagem + título + pílulas + descrição
function _col1HTML(m, P){
  const img=P.img||134, acc=m.cor||'#C9A44C';
  let imgInner;
  if(m.emoji) imgInner=`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${Math.round(img*0.5)}px">${m.emoji}</div>`;
  else imgInner=slot(m.chave||'detail','',acc,0,m.redondo);
  return `<div style="display:flex;align-items:center;gap:24px;padding:0 24px 0 16px;min-width:0">
    <div class="bt-panel__img" style="position:relative;width:${img}px;height:${img}px;flex:none;border-radius:4px;overflow:hidden;background:#0A0E1C;box-shadow:0 0 0 1px rgba(0,0,0,.6)">${imgInner}<div style="position:absolute;inset:0;border-radius:4px;box-shadow:inset 0 0 0 2px ${acc};pointer-events:none"></div></div>
    <div style="display:flex;flex-direction:column;gap:10px;min-width:0">
      <div class="cin bt-panel__titulo" style="font-weight:700;font-size:${P.titulo||27}px;line-height:1.1;letter-spacing:.02em;color:${m.tituloCor||'#F0B43C'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${H(m.titulo||'')}</div>
      ${_pilulasHTML(m,P)}
      <div class="bt-panel__desc" style="font-size:${P.desc||21}px;font-weight:500;line-height:1.3;color:#E4E8F0;max-width:610px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${realce(m.desc||'')}${m.motivo?`<span class="bt-panel__motivo" style="color:#ff9db4"> ⊘ ${H(m.motivo)}</span>`:''}</div>
    </div></div>`;
}
// COLUNA 2 — células (CUSTO/RECARGA ou VIDA/ELEMENTO ...) + linha dourada + instrução com a mira
function _col2HTML(m, P){
  const cells=m.meio||[];
  const cel=(c)=>{ let val;
    if(c.pips) val=_custoPips(c.pips, P.pip||27);
    else if(c.num!=null) val=`<div style="font-size:${P.recargaNum||30}px;font-weight:600;line-height:1.1;color:#C9CED8">${H(c.num)} <span style="color:${c.stateCor||'#C9CED8'}">${H(c.state||'')}</span></div>`;
    else val=`<div style="font-size:${P.recargaNum||30}px;font-weight:600;color:#F2F4F8;line-height:1">${H(c.valor||'')}</div>`;
    return `<div style="display:flex;flex-direction:column;gap:6px;min-width:0"><div style="font-size:${P.rotulo||19}px;font-weight:600;letter-spacing:.06em;color:#C9CED8">${H(c.rotulo||'')}</div>${val}</div>`; };
  const topo = cells.length ? `<div style="display:grid;grid-template-columns:216px minmax(0,1fr);height:76px">
      <div style="padding-left:44px;padding-top:2px">${cel(cells[0])}</div>
      <div style="padding-left:40px;padding-top:2px;border-left:1px solid rgba(201,164,76,.5);margin-bottom:6px">${cells[1]?cel(cells[1]):''}</div>
    </div>` : `<div style="height:20px"></div>`;
  const hr = cells.length ? `<div style="position:absolute;left:256px;right:42px;top:86px;height:1px;background:linear-gradient(90deg,rgba(201,164,76,.85),rgba(201,164,76,.35))"></div>` : '';
  const inst=m.inst||{title:'',sub:'',color:'#F0B43C'}; const ic=inst.color||'#F0B43C'; const sz=P.instIcone||44;
  const mira=`<div style="position:relative;width:${sz}px;height:${sz}px;flex:none">
    <div style="position:absolute;inset:4px;border-radius:50%;box-shadow:inset 0 0 0 3px ${ic}"></div>
    <span style="position:absolute;left:50%;top:0;width:3px;height:12px;margin-left:-1.5px;background:${ic}"></span>
    <span style="position:absolute;left:50%;bottom:0;width:3px;height:12px;margin-left:-1.5px;background:${ic}"></span>
    <span style="position:absolute;top:50%;left:0;height:3px;width:12px;margin-top:-1.5px;background:${ic}"></span>
    <span style="position:absolute;top:50%;right:0;height:3px;width:12px;margin-top:-1.5px;background:${ic}"></span></div>`;
  const conf=m.prontoConfirmar?' id="bconf" role="button" tabindex="0"':'';
  const instr=`<div class="bt-panel__mira"${conf} style="display:flex;align-items:center;gap:20px;padding-left:36px;padding-top:12px;${m.prontoConfirmar?'cursor:pointer':''}">
    ${mira}<div style="display:flex;flex-direction:column;gap:2px;min-width:0">
      <div class="bt-panel__miratit" style="font-size:${P.instTit||22}px;font-weight:600;color:${ic}">${H(inst.title||'')}</div>
      <div style="font-size:${P.instSub||18}px;font-weight:500;color:#D5DAE4">${H(inst.sub||'')}</div></div></div>`;
  return `<div class="bt-panel__meio" style="position:relative;display:grid;grid-template-rows:76px minmax(0,1fr);border-left:1px solid rgba(201,164,76,.5);margin:16px 0">${topo}${hr}${instr}</div>`;
}
// COLUNA 3 — CANCELAR (armada) ou OUTRAS HABILIDADES / HABILIDADES (miniaturas do dono)
function _col3HTML(m, P){
  if(!m.dir) return `<div style="border-left:1px solid rgba(201,164,76,.5);margin:16px 0"></div>`;
  if(m.dir.modo==='cancelar'){
    const w=P.cancelW||274, h=P.cancelH||80;
    return `<div style="display:flex;align-items:center;justify-content:center;border-left:1px solid rgba(201,164,76,.5);margin:16px 0">
      <button class="b5-cancel bt-cancel" id="bcanc" style="width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;border:0;border-radius:4px;cursor:pointer;background:linear-gradient(180deg,#0C1020,#05070E);box-shadow:inset 0 0 0 2px #C9A44C,inset 0 0 0 4px rgba(0,0,0,.5)">
        <span class="cin" style="font-weight:700;font-size:${P.cancelFonte||23}px;letter-spacing:.04em;color:#F4F1EA">CANCELAR</span></button></div>`;
  }
  return `<div style="display:flex;align-items:center;border-left:1px solid rgba(201,164,76,.5);margin:16px 0">${_painelMinis(m,P)}</div>`;
}
// miniaturas do DONO do conteúdo (donoUid, §333). A mostrada vem destacada (moldura dourada). ~70px p/ caber.
function _painelMinis(m, P){
  const uid=m.donoUid;
  const u=uid&&typeof todas==='function'?todas().find(x=>x.uid===uid):null;
  if(!u || !u.vivo) return '';
  const selSlot=m.dir&&m.dir.selSlot, sz=P.mini||70;
  const lab=(m.tipo==='skill')?'OUTRAS HABILIDADES':'HABILIDADES';
  const minis=acoesDe(st,u).map(a=>{
    const anel=a.slot==='defesa'?'#D6DAE2':COR(u.elem);
    const sel=selSlot&&a.slot===selSlot;
    const sombra = sel?`inset 0 0 0 2px #FFE7A0,0 0 0 2px #C9A44C,0 0 14px rgba(240,180,60,.7)`:`inset 0 0 0 1.5px ${anel}`;
    return `<div class="b5-skill bt-mini ${sel?'is-sel':''}" data-look="${u.uid}|${a.slot}" title="${H(a.nome)}" style="position:relative;width:${sz}px;height:${sz}px;border-radius:4px;overflow:hidden;cursor:pointer;background:#0A0E1C;box-shadow:${sombra}">
      ${slot('skill-'+u.key+'-'+a.slot,'',null,0,false)}
      <span class="b5-mono cin" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:17px;color:${anel};pointer-events:none">${H(mono(a))}</span></div>`;
  }).join('');
  return `<div class="bt-panel__minis" style="display:flex;flex-direction:column;gap:10px;padding:0 16px;min-width:0">
    <div class="cin bt-panel__minilab" style="font-size:${P.rotulo||18}px;font-weight:700;letter-spacing:.05em;color:#F0B43C">${H(lab)}</div>
    <div style="display:flex;gap:12px">${minis}</div></div>`;
}
// o PAINEL de baixo (grade 840 | 564 | resto). view.js injeta nada — tudo em px de design.
function painelBaixoHTML(){
  const m=_modeloPainel(), P=_P();
  return `<section class="b5-painel bt-panel" style="position:absolute;left:${P.left||58}px;top:${P.top||640}px;width:${P.w||1732}px;height:${P.h||166}px;box-sizing:border-box;overflow:hidden;display:grid;grid-template-columns:${(P.cols&&P.cols.info)||840}px ${(P.cols&&P.cols.meio)||564}px minmax(0,1fr);grid-template-rows:${P.h||166}px;border-radius:6px;background:linear-gradient(180deg,rgba(10,13,26,.96),rgba(5,7,15,.96));box-shadow:inset 0 0 0 1px rgba(201,164,76,.78),0 -6px 24px rgba(0,0,0,.5)">
    ${_col1HTML(m,P)}${_col2HTML(m,P)}${_col3HTML(m,P)}
  </section>`;
}

/* ---------- eventos do painel ---------- */
function ligarPainel(){
  const q=s=>stage.querySelector(s);
  // §333b: CANCELAR desarma e VOLTA à leitura (situação 2) daquela habilidade (sem chamar campo.js — ui→ui).
  const bcn=q('#bcanc'); if(bcn)bcn.onclick=()=>{ const a=armado; armado=null;alvos=[];escolhidos=[]; detalhe=null;
    if(a){ const u=st.lados[st.ativo].units.find(x=>x.uid===a.uid); const ac=u&&acoesDe(st,u).find(x=>x.slot===a.slot);
      if(u&&ac){ const nv=(typeof nivelSlotEmBatalha==='function')?nivelSlotEmBatalha(st,u,a.slot):1; if(typeof foco!=='undefined') foco=u.uid;
        detalhe={kind:'skill', uid:u.uid, nome:ac.nome, nv, chave:'skill-'+u.key+'-'+ac.slot, mono:mono(ac),
          cor:ac.slot==='defesa'?'#D6DAE2':COR(u.elem), desc:ac.desc, cost:ac.cost, cd:ac.cd, cdNow:(u.cd[a.slot]||0), tf:classesTxt(u,ac), motivo:''}; } }
    render(); };
  // §336: a instrução (mira) CONFIRMA quando a ação está pronta (área/sem-alvo/si-mesmo/auto/distribui) — restaura o #bconf.
  const bcf=q('#bconf'); if(bcf){ bcf.onclick=()=>{ if(typeof confirmar==='function') confirmar(); };
    bcf.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); if(typeof confirmar==='function') confirmar(); } }; }
  const be=q('#bend'); if(be)be.onclick=()=>encerrarTurno();
}

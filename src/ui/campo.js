// ui/campo.js — §329: o CAMPO de batalha À RISCA da referência do dono. As POSIÇÕES vêm de
// data/layout_batalha.json (LAYOUT_BATALHA), em u (1% da altura do palco); o CSS cuida da aparência.
// Lado do jogador ancora à ESQUERDA, inimigo à DIREITA, e o ESPAÇO DE ARTE do centro preenche o vão.
// A LÓGICA e os DADOS (efeitos, níveis, recarga, passiva) são os do §328 — só o layout mudou.

// §266 — a passiva SE ANUNCIA quando age. O motor (infoPassiva) diz o que modifica AGORA; a UI acende o "P".
function _armadoCtx(){
  if(typeof armado==='undefined' || !armado) return null;
  const al=(typeof alvos!=='undefined'&&alvos)?alvos.map(x=>x.uid):[];
  let golpe=null;
  try{ const u=todas().find(x=>x.uid===armado.uid); const a=u&&acoesDe(st,u).find(x=>x.slot===armado.slot);
    if(a) golpe={slot:a.slot, classe:a.classe, elem:u.elem, unico:al.length===1}; }catch(e){}
  return { uid:armado.uid, alvos:al, golpe };
}
function infoPassivaUI(u){
  if(typeof st==='undefined'||!st||typeof infoPassiva!=='function') return { propria:[], recebidas:[] };
  try{ return infoPassiva(st, u, _armadoCtx()); }catch(e){ return { propria:[], recebidas:[] }; }
}
function passivaAcesa(u){ const i=infoPassivaUI(u); return i.propria.length>0 || i.recebidas.length>0; }
function rotuloPassivaItem(it){
  if(it.gat==='bonusDano') return '+'+it.v+' de dano'+(it.alvo?' (neste alvo)':'');
  if(it.gat==='reducao') return '−'+it.v+' de dano recebido';
  if(it.gat==='vulnerabilidade') return '+'+it.v+' de dano recebido';
  if(it.gat==='danoIrredutivel') return 'fura '+(it.fura||[]).map(x=>x==='reducao'?'redução':'escudo').join(' e ');
  if(it.gat==='amplificaDot') return '+'+it.v+' por tique de '+(it.nome||'dano contínuo');
  return '';
}
// §328 — ETIQUETAS/efeitos LEGÍVEIS. Lê data/status_visual.json (STATUS_VISUAL). Reusado pelos ícones e pelo painel.
function _svDe(key){ return (typeof STATUS_VISUAL!=='undefined'&&STATUS_VISUAL&&STATUS_VISUAL[key])||null; }
const _TAG_PLAIN=['queimadura','veneno','sangramento','tormento','maldicao','marcaMorte','shield'];
function _numTag(sv,key,v){
  if(!sv) return '';
  if(sv.num==='acumulo') return '×'+v;
  if(sv.num==='valor'){
    if(v==null) return '';
    if(key==='dmgDown'||key==='dmgReduction') return '−'+Math.abs(v);
    if(_TAG_PLAIN.includes(key)) return ''+v;
    return '+'+v;
  }
  return '';
}
// lista ORDENADA de efeitos de uma unidade (controle → ruim → defesa → bom). Cada item:
// {key, nome, icone, num, dur (null=permanente), cat, desc}. Usada pelos ícones de efeito E pelo painel.
function tagsDe(u){
  const out=[];
  const push=(key,v,dur)=>{ const sv=_svDe(key); if(!sv) return; out.push({key,nome:sv.nome,icone:sv.icone,num:_numTag(sv,key,v),dur,cat:sv.cat,desc:sv.desc}); };
  if(u.shield>0) push('shield',u.shield,null);
  for(const e of (u.efeitos||[])){ if(e.type==='shield') continue; push(e.type, e.v, (e.dur>90?null:e.dur)); }
  for(const d of (u.dots||[])) push(d.nome, d.v, (d.dur>90?null:d.dur));
  for(const k in (u.contadores||{})){ const c=u.contadores[k]; if(c>0) push(k,c,null); }
  const ord={controle:0,ruim:1,defesa:2,bom:3};
  out.sort((a,b)=>((ord[a.cat]==null?9:ord[a.cat])-(ord[b.cat]==null?9:ord[b.cat])));
  return out;
}
const BT_EFF_MAX=3;   // ícones de efeito mostrados por unidade; o resto vira "+N" (toque abre o painel)

/* ---------- geometria: atalhos de LAYOUT_BATALHA ---------- */
function _LB(){ return (typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA)||{}; }
// right em u a partir da borda direita → CSS right
function _centroDir(){ const L=_LB(); const im=L.inimigo||{}; const re=im.retrato||{dir:7,size:13.6}; const ef=im.efeitos||{size:3.75,gap:0.7};
  return (re.dir||7)+(re.size||13.6)+BT_EFF_MAX*((ef.size||3.75)+(ef.gap||0.7))+1; }

/* ---------- barra de vida ---------- */
function _hpCls(u){ if(!u.vivo) return 'bt-hp dead'; const p=u.hp/u.maxHp*100; if(p<25) return 'bt-hp low'; if(p<50) return 'bt-hp warn'; return 'bt-hp'; }
function btHp(u, styleStr){
  const pct=Math.max(0,Math.min(100,u.hp/u.maxHp*100));
  return `<div class="${_hpCls(u)}" style="${styleStr}">
    ${u.vivo?`<div class="bt-hp__fill" style="width:${pct}%"></div>`:''}
    ${u.shield?`<div class="bt-hp__sh" style="width:${Math.min(100,u.shield/u.maxHp*100)}%"></div>`:''}
    <div class="bt-hp__lab">${u.hp}/${u.maxHp}${u.shield?' ◧'+u.shield:''}</div>
  </div>`;
}
/* ---------- indicador de níveis (reusa o motor: niveisEmBatalha) ---------- */
function btNiv(u){
  if(typeof niveisEmBatalha!=='function'||typeof st==='undefined'||!st) return '';
  let nv; try{ nv=niveisEmBatalha(st,u); }catch(e){ return ''; }
  if(!(nv.basico>1||nv.habilidade>1||nv.milagre>1)) return '';
  const c=(n)=>`<span class="${n>1?'pniv__c--up':''}">${n}</span>`;
  return `<div class="bt-portrait__niv">${c(nv.basico)}${c(nv.habilidade)}${c(nv.milagre)}</div>`;
}
/* ---------- ícones de efeito (acima da faixa / à esquerda do inimigo) ---------- */
function btEfeitos(u, inimigo, topU){
  const tags=u.vivo?tagsDe(u):[]; if(!tags.length) return '';
  const L=_LB(); const ef=(inimigo?(_LB().inimigo||{}).efeitos:(_LB().jogador||{}).efeitos)||{size:3.75,gap:0.7};
  const size=ef.size||3.75, gap=ef.gap||0.7;
  const vis = tags.length<=BT_EFF_MAX ? tags : tags.slice(0, BT_EFF_MAX-1);
  const resto = tags.length - vis.length;
  const cel=(t,i)=>`<button class="bt-eff bt-eff--${t.cat}" data-eff="${u.uid}|${i}" title="${H(t.nome)}${t.num?' '+H(t.num):''}"
      style="width:${U(size)};height:${U(size)}">${t.icone}${t.dur!=null?`<span class="bt-eff__t">${t.dur}</span>`:(t.num?`<span class="bt-eff__t">${H(t.num)}</span>`:'')}</button>`;
  let cels=vis.map(cel).join('');
  if(resto>0) cels+=`<button class="bt-eff bt-eff--mais" data-eff="${u.uid}|0" style="width:${U(size)};height:${U(size)}"><span class="bt-eff__mais">+${resto}</span></button>`;
  const base=`position:absolute;top:${U(topU)};gap:${U(gap)};display:inline-flex`;
  if(inimigo){ const re=(L.inimigo||{}).retrato||{dir:7,size:13.6};
    return `<div class="bt-eff-row" style="${base};right:${U((re.dir||7)+(re.size||13.6)+gap)};flex-direction:row-reverse">${cels}</div>`; }
  const j=(L.jogador||{}).efeitos||{x0:19.8};
  return `<div class="bt-eff-row" style="${base};left:${U(j.x0||19.8)};flex-direction:row">${cels}</div>`;
}
/* ---------- retrato do ALIADO + vida + efeitos + faixa de habilidades ---------- */
function btUnidadeAliada(u, topU, meu){
  const L=_LB(); const J=L.jogador||{}; const re=J.retrato||{x:5.1,size:13.6}; const vi=J.vida||{h:2.7};
  const alvo=alvos.some(x=>x.uid===u.uid), jaEsc=escolhidos.includes(u.uid);
  const g=_catPartida()[u.key]||{};
  const pcls=['bt-portrait','bt-portrait--ally'];
  if(!u.vivo)pcls.push('is-down'); if(alvo)pcls.push('is-target'); if(jaEsc)pcls.push('is-picked');
  if(u.vivo&&!podeAgir(u))pcls.push('acted');
  const pStyle=`left:${U(re.x)};top:${U(topU)};width:${U(re.size)};height:${U(re.size)}`;
  const portrait=`<div class="${pcls.join(' ')}" data-uid="${u.uid}"${alvo?' data-target="1"':''} style="${pStyle}">
    ${slot('god-'+u.key, ini(u.nome), COR(u.elem), 26)}
    <span class="bt-portrait__el" style="background:${COR(u.elem)}"></span>
    ${g.passiva?`<button class="bt-portrait__pas ${g.passiva.inerte?'inert':''} ${passivaAcesa(u)?'pas--on':''}" data-pas="${u.uid}">P</button>`:''}
    ${u.vivo?btNiv(u):''}
    <div class="bt-portrait__x"></div>
  </div>`;
  const hp=btHp(u, `left:${U(re.x)};top:${U(topU+re.size)};width:${U(re.size)};height:${U(vi.h)}`);
  const efeitos=btEfeitos(u,false,topU);
  const faixa=btFaixa(u, topU, meu);
  return portrait+hp+efeitos+faixa;
}
/* ---------- faixa de habilidades (jogador) ---------- */
function btFaixa(u, topU, meu){
  const L=_LB(); const J=L.jogador||{};
  const fx = meu ? (J.faixa||{x0:18.4,x1:85,h:13.6,dyTopo:4.1})
                 : Object.assign({}, J.faixa, (L.jogadorTurnoOponente||{}).faixa);
  const q = meu ? (J.quadros||{}) : Object.assign({}, J.quadros, (L.jogadorTurnoOponente||{}).quadros);
  const x0=fx.x0, x1=fx.x1, h=J.faixa.h, dyTopo=J.faixa.dyTopo, size=q.size, relTop=q.dyTopo-dyTopo;
  const faixaStyle=`left:${U(x0)};top:${U(topU+dyTopo)};width:${U(x1-x0)};height:${U(h)}`;
  let inner='';
  // QUADRO DE AÇÃO (só no meu turno): a habilidade escolhida p/ este deus, ou "?" — tocar desfaz.
  if(meu){
    const armEste = armado && armado.uid===u.uid;
    const a = armEste ? acoesDe(st,u).find(x=>x.slot===armado.slot) : null;
    const anel = a ? (a.slot==='defesa'?'var(--ink-mute)':COR(u.elem)) : 'var(--ink-mute)';
    inner += `<button class="bt-acao" data-acao="${u.uid}" style="left:${U(q.acao-x0)};top:${U(relTop)};width:${U(size)};height:${U(size)}">`
      + (a ? `<span class="bt-skill__disc" style="border-color:${anel}">${slot('skill-'+u.key+'-'+a.slot,'',null,0,true)}<span class="bt-skill__mono" style="color:${anel}">${H(mono(a))}</span></span>`
           : `<span class="bt-acao__q">?</span>`)
      + `</button>`;
  }
  // os 4 quadrados
  for(const a of acoesDe(st,u)){
    inner += btSkill(u, a, q[a.slot]-x0, relTop, size, meu);
  }
  return `<div class="bt-faixa" style="${faixaStyle}">${inner}</div>`;
}
function btSkill(u, a, relX, relTop, size, meu){
  const cd=u.cd[a.slot]||0;
  const ativa=meu&&podeAgir(u)&&ehMeuTurno();
  const clicavel=a.disponivel&&ativa;
  const arm=armado&&armado.uid===u.uid&&armado.slot===a.slot;
  const cls=['bt-skill','bt-skill--'+a.slot];
  if(clicavel)cls.push('is-ready'); if(cd>0)cls.push('is-cooldown');
  if(!clicavel)cls.push('is-off'); if(arm)cls.push('is-armed');
  const anel=a.slot==='defesa'?'var(--ink-mute)':COR(u.elem);
  const nvSk=(typeof nivelSlotEmBatalha==='function')?nivelSlotEmBatalha(st,u,a.slot):1;
  // no turno do oponente as habilidades ficam APAGADAS e NÃO RESPONDEM (data-dead=1 → ligarCampo não as liga);
  // a leitura do kit (inclusive do oponente) é pela caixa de minis. data-arma=0 quando indisponível no meu turno.
  return `<button class="${cls.join(' ')}" data-sk="${u.uid}|${a.slot}" data-arma="${clicavel?1:0}"${meu?'':' data-dead="1"'}
      style="left:${U(relX)};top:${U(relTop)};width:${U(size)};height:${U(size)};--anel:${anel}">
    <span class="bt-skill__disc" style="border-color:${anel}">
      ${slot('skill-'+u.key+'-'+a.slot,'',null,0,true)}
      <span class="bt-skill__mono" style="color:${anel}">${H(mono(a))}</span>
    </span>
    <span class="bt-skill__cd">${cd||''}</span>
    ${nvSk>1?`<span class="bt-skill__nv">Nv ${nvSk}</span>`:''}
  </button>`;
}
/* ---------- retrato do INIMIGO + vida + efeitos ---------- */
function btUnidadeInimiga(u, topU){
  const L=_LB(); const im=L.inimigo||{}; const re=im.retrato||{dir:7,size:13.6}; const vi=im.vida||{h:2.7};
  const alvo=alvos.some(x=>x.uid===u.uid), jaEsc=escolhidos.includes(u.uid);
  const g=_catPartida()[u.key]||{};
  const pcls=['bt-portrait','bt-portrait--foe'];
  if(!u.vivo)pcls.push('is-down'); if(alvo)pcls.push('is-target'); if(jaEsc)pcls.push('is-picked');
  const pStyle=`right:${U(re.dir)};top:${U(topU)};width:${U(re.size)};height:${U(re.size)}`;
  const portrait=`<div class="${pcls.join(' ')}" data-uid="${u.uid}" data-foe="1"${alvo?' data-target="1"':''} style="${pStyle}">
    ${slot('god-'+u.key, ini(u.nome), COR(u.elem), 26)}
    <span class="bt-portrait__el" style="background:${COR(u.elem)}"></span>
    ${g.passiva?`<button class="bt-portrait__pas ${g.passiva.inerte?'inert':''} ${passivaAcesa(u)?'pas--on':''}" data-pas="${u.uid}">P</button>`:''}
    ${u.vivo?`<span class="bt-portrait__ask" title="toque para inspecionar">?</span>`:''}
    ${u.vivo?btNiv(u):''}
    <div class="bt-portrait__x"></div>
  </div>`;
  const hp=btHp(u, `right:${U(re.dir)};top:${U(topU+re.size)};width:${U(re.size)};height:${U(vi.h)}`);
  const efeitos=btEfeitos(u,true,topU);
  return portrait+hp+efeitos;
}
/* ---------- espaço de arte do centro (deus em foco) ---------- */
function unidadeFoco(){
  const f = (typeof foco!=='undefined'&&foco)?todas().find(x=>x.uid===foco):null;
  if(f&&f.vivo) return f;
  const eu=ladoExibido();
  const lado = ehMeuTurno()? st.lados[eu] : st.lados[1-eu];
  return (lado.units.find(x=>x.vivo)) || st.lados[eu].units.find(x=>x.vivo) || st.lados[eu].units[0];
}
function btCentroHTML(){
  const u=unidadeFoco(); if(!u) return '';
  const L=_LB(); const c=L.centro||{x0:85,y:[15,78]};
  const topU=c.y[0], botU=100-c.y[1];
  return `<div class="bt-centro" style="left:${U(c.x0)};right:${U(_centroDir())};top:${U(topU)};bottom:${U(botU)}">
    ${slot('god-'+u.key, ini(u.nome), COR(u.elem), 64)}
  </div>`;
}
/* ---------- caixa "Toque numa habilidade": as 4 minis do deus em FOCO (leitura; vê o kit do OPONENTE) ---------- */
function habMiniHTML(){
  const u=unidadeFoco(); if(!u||!u.vivo) return '';
  const L=_LB(); const hm=L.habMini||{iniDir:48,fimDir:25,y:[72.6,77.5],size:4.3};
  const box=`position:absolute;left:calc(100% - ${U(hm.iniDir)});right:${U(hm.fimDir)};top:${U(hm.y[0])};height:${U(hm.y[1]-hm.y[0])}`;
  const minis=acoesDe(st,u).map(a=>{
    const anel=a.slot==='defesa'?'var(--ink-mute)':COR(u.elem);
    const sel=typeof detalhe!=='undefined'&&detalhe&&detalhe.kind==='skill'&&detalhe.chave==='skill-'+u.key+'-'+a.slot;
    return `<button class="bt-mini ${sel?'is-sel':''}" data-look="${u.uid}|${a.slot}" title="${H(a.nome)}"
      style="width:${U(hm.size)};height:${U(hm.size)};border-color:${anel}">${slot('skill-'+u.key+'-'+a.slot,'',null,0,true)}</button>`;
  }).join('');
  return `<div class="bt-habmini" style="${box}">
    <span class="bt-habmini__lab">Toque numa habilidade</span>
    <div class="bt-habmini__row">${minis}</div>
  </div>`;
}

/* ---------- composição do campo ---------- */
function campoHTML(l,o){
  const meu=ehMeuTurno();
  const tops=(_LB().fileiras||{}).tops||[12,33.4,54.9];
  let html='';
  for(let i=0;i<3;i++){
    const a=l.units[i], e=o.units[i], top=tops[i];
    if(a) html+=btUnidadeAliada(a, top, meu);
    if(e) html+=btUnidadeInimiga(e, top);
  }
  html+=btCentroHTML();
  html+=habMiniHTML();
  return html;
}

/* ---------- LEITURA de habilidade (sem armar) e motivos ---------- */
function motivoIndisponivel(u,a){
  const cd=u.cd[a.slot]||0;
  if(cd>0) return 'Em recarga — pronta em '+cd+' turno'+(cd===1?'':'s');
  if(!podeAgir(u)) return 'Esta unidade já agiu neste turno';
  if(!ehMeuTurno()) return 'Não é a sua vez';
  if(a.disponivel) return '';
  if(a.motivo==='sem_energia') return 'Falta energia para o custo';
  if(a.motivo==='sem_alvo') return 'Sem alvo válido agora';
  return 'Travada (Selado / Silêncio, ou uso único já gasto)';
}
// §329: a LEITURA agora mora toda no PAINEL de baixo (painel.js) via o `detalhe`. Aqui só montamos o `detalhe`.
function lerHabilidade(uid,slot){
  const u=todas().find(x=>x.uid===uid); if(!u)return;
  const a=acoesDe(st,u).find(x=>x.slot===slot); if(!a)return;
  const nv=(typeof nivelSlotEmBatalha==='function')?nivelSlotEmBatalha(st,u,slot):1;
  if(typeof foco!=='undefined') foco=uid;
  detalhe={kind:'skill', nome:a.nome, nv:nv, chave:'skill-'+u.key+'-'+a.slot, cor:a.slot==='defesa'?'var(--ink-mute)':COR(u.elem),
    desc:a.desc, cost:a.cost, cd:a.cd, cdNow:(u.cd[slot]||0), tf:classesTxt(u,a),
    motivo: a.disponivel ? '' : motivoIndisponivel(u,a)};
  armado=null; alvos=[]; escolhidos=[]; render();
}
// §329: tocar um RETRATO (sem habilidade armada) → painel com nome, função·elemento, vida e passiva.
function infoUnidade(uid){
  const u=todas().find(x=>x.uid===uid); if(!u)return;
  const g=_catPartida()[u.key]||{};
  if(typeof foco!=='undefined') foco=uid;
  detalhe={kind:'unidade', uid:u.uid, nome:u.nome, chave:'god-'+u.key, cor:COR(u.elem),
    sub:(u.funcao||g.funcao||'')+' · '+(ELAB[u.elem]||u.elem), hp:u.hp, maxHp:u.maxHp, shield:u.shield,
    passivaNome:g.passiva?g.passiva.nome:'', passivaDesc:g.passiva?g.passiva.desc:'', inerte:g.passiva&&g.passiva.inerte};
  armado=null; alvos=[]; escolhidos=[]; peekKit=null; render();
}
// §329: tocar um ÍCONE de efeito → painel com nome, descrição, turnos e (quando o motor souber) quem aplicou.
function infoEfeito(uid, idx){
  const u=todas().find(x=>x.uid===uid); if(!u)return;
  const tags=tagsDe(u); const t=tags[idx]||tags[0]; if(!t)return;
  if(typeof foco!=='undefined') foco=uid;
  detalhe={kind:'efeito', nome:t.nome, cor:COR(u.elem), icone:t.icone, cat:t.cat, num:t.num, desc:t.desc,
    dur:t.dur, dono:u.nome};
  armado=null; alvos=[]; escolhidos=[]; peekKit=null; render();
}

/* ---------- eventos do campo ---------- */
function ligarCampo(){
  // habilidade (aliado): data-arma=1 arma; 0 só lê.
  stage.querySelectorAll('.bt-skill').forEach(b=>{
    if(b.dataset.dead==='1') return;   // turno do oponente: as habilidades do jogador não respondem
    b.onclick=()=>{ const[uid,slot]=b.dataset.sk.split('|');
      if(b.dataset.arma==='1'){ armar(uid,slot); } else lerHabilidade(uid,slot); };});
  // QUADRO DE AÇÃO: tocar desfaz a escolha (cancela o armado deste deus).
  stage.querySelectorAll('[data-acao]').forEach(b=>b.onclick=()=>{ armado=null;alvos=[];escolhidos=[];detalhe=null;render(); });
  // retrato (aliado ou inimigo): com habilidade armada e sendo ALVO → escolhe alvo; senão → inspeção no painel.
  stage.querySelectorAll('.bt-portrait').forEach(el=>{
    el.onclick=ev=>{ ev.stopPropagation(); const uid=el.dataset.uid;
      if(armado && el.dataset.target){ alvo(uid); }
      else if(!armado){ infoUnidade(uid); } };});
  // passiva: mostra o que ela faz agora (com valor e fonte) no painel.
  stage.querySelectorAll('[data-pas]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const u=todas().find(x=>x.uid===b.dataset.pas),g=_catPartida()[u.key]||{};
    if(!g.passiva)return;
    const info=infoPassivaUI(u); const linhas=[];
    for(const it of info.propria) linhas.push(rotuloPassivaItem(it));
    for(const it of info.recebidas) linhas.push(rotuloPassivaItem(it)+' — de '+H(it.fonteNome));
    const agora = linhas.length ? ('AGINDO AGORA: '+linhas.join(' · ')) : 'PARADA AGORA (a condição não vale no momento)';
    if(typeof foco!=='undefined') foco=u.uid;
    detalhe={kind:'passiva', nome:g.passiva.nome, cor:COR(u.elem), chave:'god-'+u.key,
      dono:u.nome, inerte:g.passiva.inerte, desc:agora+'\n'+g.passiva.desc};
    armado=null;alvos=[];escolhidos=[];peekKit=null;render();});
  // ícone de efeito: detalhe do efeito no painel.
  stage.querySelectorAll('[data-eff]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const[uid,idx]=b.dataset.eff.split('|'); infoEfeito(uid, +idx);});
  // caixa de minis (deus em foco): LEITURA de habilidade (inclusive do oponente — nunca arma, §15).
  stage.querySelectorAll('[data-look]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const[uid,slot]=b.dataset.look.split('|'); lerHabilidade(uid,slot);});
  if(resumoTurno) stage.addEventListener('pointerdown',()=>{ resumoTurno=null; },{once:true,capture:true});
}

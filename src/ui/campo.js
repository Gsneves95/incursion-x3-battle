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
const BT_EFF_MAX=6;   // §330: ícones de efeito por unidade (grade 2×3); do 6º em diante o último vira "+N"

/* ---------- geometria: atalhos de LAYOUT_BATALHA ---------- */
function _LB(){ return (typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA)||{}; }
// §330: largura (u) da grade de efeitos (cols×size + (cols-1)·gap)
function _gridEfLarg(ef){ const cols=ef.cols||2, size=ef.size||6.5, gap=ef.gap||0.7; return cols*size+(cols-1)*gap; }
// right em u a partir da borda direita até onde a arte do centro pode ir: retrato + zona de efeitos do inimigo + folga
function _centroDir(){ const L=_LB(); const im=L.inimigo||{}; const re=im.retrato||{dir:4,size:19}; const ef=im.efeitos||{size:6.5,gap:0.7,cols:2};
  const folga=(L.centro&&L.centro.folga)||1;
  return (re.dir||4)+(re.size||19)+_gridEfLarg(ef)+folga; }
// §330: largura (u) do palco em design, a partir do último fit — p/ decidir se a arte do centro cabe
function _largPalcoU(){ const px=(typeof ultimaLarguraDesign!=='undefined'&&ultimaLarguraDesign)||926; return px/4.28; }

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
/* ---------- ícones de efeito — §330: grade 2×3 DENTRO da faixa (jogador) / à esquerda do inimigo ---------- */
function btEfeitos(u, inimigo, topU){
  const tags=u.vivo?tagsDe(u):[]; if(!tags.length) return '';
  const L=_LB(); const ef=(inimigo?(L.inimigo||{}).efeitos:(L.jogador||{}).efeitos)||{size:6.5,gap:0.7,cols:2};
  const size=ef.size||6.5, gap=ef.gap||0.7, cols=ef.cols||2;
  const vis = tags.length<=BT_EFF_MAX ? tags : tags.slice(0, BT_EFF_MAX-1);
  const resto = tags.length - vis.length;
  const cel=(t,i)=>`<button class="bt-eff bt-eff--${t.cat}" data-eff="${u.uid}|${i}" title="${H(t.nome)}${t.num?' '+H(t.num):''}"
      style="width:${U(size)};height:${U(size)}">${t.icone}${t.dur!=null?`<span class="bt-eff__t">${t.dur}</span>`:(t.num?`<span class="bt-eff__t">${H(t.num)}</span>`:'')}</button>`;
  let cels=vis.map(cel).join('');
  if(resto>0) cels+=`<button class="bt-eff bt-eff--mais" data-eff="${u.uid}|0" style="width:${U(size)};height:${U(size)}"><span class="bt-eff__mais">+${resto}</span></button>`;
  const base=`position:absolute;top:${U(topU+0.5)};display:grid;grid-template-columns:repeat(${cols},${U(size)});gap:${U(gap)};grid-auto-rows:${U(size)}`;
  if(inimigo){ const re=(L.inimigo||{}).retrato||{dir:4,size:19};
    return `<div class="bt-eff-grid" style="${base};right:${U((re.dir||4)+(re.size||19))}">${cels}</div>`; }
  const j=(L.jogador||{}).efeitos||{x0:110.5};
  return `<div class="bt-eff-grid" style="${base};left:${U(j.x0||110.5)}">${cels}</div>`;
}
/* ---------- retrato do ALIADO + vida + efeitos + faixa de habilidades ---------- */
function btUnidadeAliada(u, topU, meu){
  const L=_LB(); const J=L.jogador||{}; const re=J.retrato||{x:4,size:19}; const vi=J.vida||{h:2.7,dy:0.3};
  const alvo=alvos.some(x=>x.uid===u.uid), jaEsc=escolhidos.includes(u.uid);
  const g=_catPartida()[u.key]||{};
  const pcls=['bt-portrait','bt-portrait--ally'];
  if(!u.vivo)pcls.push('is-down'); if(alvo)pcls.push('is-target'); if(jaEsc)pcls.push('is-picked');
  if(u.vivo&&!podeAgir(u))pcls.push('acted');
  const pStyle=`left:${U(re.x)};top:${U(topU)};width:${U(re.size)};height:${U(re.size)}`;   // §330: retrato no TOPO da fileira
  const portrait=`<div class="${pcls.join(' ')}" data-uid="${u.uid}"${alvo?' data-target="1"':''} style="${pStyle}">
    ${slot('god-'+u.key, ini(u.nome), COR(u.elem), 26)}
    <span class="bt-portrait__el" style="background:${COR(u.elem)}"></span>
    ${g.passiva?`<button class="bt-portrait__pas ${g.passiva.inerte?'inert':''} ${passivaAcesa(u)?'pas--on':''}" data-pas="${u.uid}">P</button>`:''}
    ${u.vivo?btNiv(u):''}
    <div class="bt-portrait__x"></div>
  </div>`;
  const hp=btHp(u, `left:${U(re.x)};top:${U(topU+re.size+(vi.dy||0))};width:${U(re.size)};height:${U(vi.h)}`);
  const efeitos=btEfeitos(u,false,topU);
  const faixa=btFaixa(u, topU, meu);
  return portrait+hp+efeitos+faixa;
}
/* ---------- faixa de habilidades (jogador) — §330: SEM quadro de ação; mesma geometria nos dois turnos
   (no turno do oponente os 4 botões ficam apagados e sem toque, data-dead). ---------- */
function btFaixa(u, topU, meu){
  const L=_LB(); const J=L.jogador||{};
  const fx=J.faixa||{x0:24.5,x1:126,h:22,dyTopo:0};
  const q=J.quadros||{};
  const x0=fx.x0, x1=fx.x1, h=fx.h, dyTopo=fx.dyTopo||0, size=q.size, relTop=(q.dyTopo||0)-dyTopo;
  const faixaStyle=`left:${U(x0)};top:${U(topU+dyTopo)};width:${U(x1-x0)};height:${U(h)}`;
  let inner='';
  for(const a of acoesDe(st,u)){
    inner += btSkill(u, a, q[a.slot]-x0, relTop, size, meu);
  }
  return `<div class="bt-faixa" style="${faixaStyle}">${inner}</div>`;
}
/* ---------- §330: bolinhas de CUSTO sobre o botão (uma por energia, na cor do tipo; livre = neutra) ---------- */
function btCustoPips(cost){
  if(!cost) return '';
  const L=_LB(); const sz=(L.custoPip&&L.custoPip.size)||2.2;
  const pips=[];
  for(const k in cost){ if(k==='livre')continue; for(let i=0;i<cost[k];i++) pips.push(`<i style="background:${COR(k)}"></i>`); }
  for(let i=0;i<(cost.livre||0);i++) pips.push(`<i class="free"></i>`);
  if(!pips.length) return '';
  return `<span class="bt-skill__pips" style="--pip:${U(sz)}">${pips.join('')}</span>`;
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
    ${btCustoPips(a.cost)}
    <span class="bt-skill__sel" aria-hidden="true">✓</span>
    <span class="bt-skill__cd">${cd||''}</span>
    ${nvSk>1?`<span class="bt-skill__nv">Nv ${nvSk}</span>`:''}
  </button>`;
}
/* ---------- retrato do INIMIGO + vida + efeitos ---------- */
function btUnidadeInimiga(u, topU){
  const L=_LB(); const im=L.inimigo||{}; const re=im.retrato||{dir:4,size:19}; const vi=im.vida||{h:2.7,dy:0.3};
  const alvo=alvos.some(x=>x.uid===u.uid), jaEsc=escolhidos.includes(u.uid);
  const g=_catPartida()[u.key]||{};
  const pcls=['bt-portrait','bt-portrait--foe'];
  if(!u.vivo)pcls.push('is-down'); if(alvo)pcls.push('is-target'); if(jaEsc)pcls.push('is-picked');
  const pStyle=`right:${U(re.dir)};top:${U(topU)};width:${U(re.size)};height:${U(re.size)}`;   // §330: retrato no topo
  const portrait=`<div class="${pcls.join(' ')}" data-uid="${u.uid}" data-foe="1"${alvo?' data-target="1"':''} style="${pStyle}">
    ${slot('god-'+u.key, ini(u.nome), COR(u.elem), 26)}
    <span class="bt-portrait__el" style="background:${COR(u.elem)}"></span>
    ${g.passiva?`<button class="bt-portrait__pas ${g.passiva.inerte?'inert':''} ${passivaAcesa(u)?'pas--on':''}" data-pas="${u.uid}">P</button>`:''}
    ${u.vivo?`<span class="bt-portrait__ask" title="toque para inspecionar">?</span>`:''}
    ${u.vivo?btNiv(u):''}
    <div class="bt-portrait__x"></div>
  </div>`;
  const hp=btHp(u, `right:${U(re.dir)};top:${U(topU+re.size+(vi.dy||0))};width:${U(re.size)};height:${U(vi.h)}`);
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
// a FONTE de arte de um deus p/ o espaço do centro: corpo inteiro (web/corpo) > bestiário (web/bestiario) >
// retrato embutido (IMG). Nunca amplia além do nativo (CSS contain + max-width/height); o retrato é a reserva.
function _artePersonagem(key){
  if(typeof CORPO_ARTE!=='undefined'&&CORPO_ARTE&&CORPO_ARTE[key]) return 'corpo/'+key+'.webp';
  if(typeof IMG!=='undefined'&&IMG[key]) return IMG[key];
  if(typeof BESTIARIO_ARTE!=='undefined'&&BESTIARIO_ARTE&&BESTIARIO_ARTE[key]) return 'bestiario/'+key+'.webp';
  return '';
}
// §330: a arte do centro é FIXA por TURNO (data/arte_turno.json), não segue mais o deus em foco.
// web/banners/turno_meu.webp / turno_oponente.webp quando existir (TURNO_ARTE); senão o retrato embutido do deus
// nomeado, com a máscara do §329b e sem ampliar. Some se a largura disponível < centro.minW (16:9 estreito).
function _arteTurnoSrc(){
  const meu=ehMeuTurno();
  const flags=(typeof TURNO_ARTE!=='undefined'&&TURNO_ARTE)||{};
  const cfg=(typeof ARTE_TURNO!=='undefined'&&ARTE_TURNO)||{meu:'',oponente:''};
  if(meu && flags.meu) return 'banners/turno_meu.webp';
  if(!meu && flags.oponente) return 'banners/turno_oponente.webp';
  const key = meu ? cfg.meu : cfg.oponente;
  if(typeof IMG!=='undefined'&&IMG[key]) return IMG[key];
  if(typeof CORPO_ARTE!=='undefined'&&CORPO_ARTE&&CORPO_ARTE[key]) return 'corpo/'+key+'.webp';
  if(typeof BESTIARIO_ARTE!=='undefined'&&BESTIARIO_ARTE&&BESTIARIO_ARTE[key]) return 'bestiario/'+key+'.webp';
  return '';
}
function btCentroHTML(){
  const L=_LB(); const c=L.centro||{x0:128,y:[13,82],minW:25};
  const dir=_centroDir();
  const larg=_largPalcoU()-c.x0-dir;   // largura disponível p/ a arte, em u
  if(larg < (c.minW||25)) return '';   // 16:9 estreito: a arte some (nunca espreme/sobrepõe)
  const topU=c.y[0], botU=100-c.y[1];
  const src=_arteTurnoSrc();
  if(!src) return '';
  return `<div class="bt-centro" style="left:${U(c.x0)};right:${U(dir)};top:${U(topU)};bottom:${U(botU)}"><img class="bt-centro__corpo" src="${H(src)}" alt="" onerror="this.style.display='none'"></div>`;
}

/* ---------- composição do campo ---------- */
function campoHTML(l,o){
  const meu=ehMeuTurno();
  const tops=(_LB().fileiras||{}).tops||[13,36.5,60];
  let html='';
  for(let i=0;i<3;i++){
    const a=l.units[i], e=o.units[i], top=tops[i];
    if(a) html+=btUnidadeAliada(a, top, meu);
    if(e) html+=btUnidadeInimiga(e, top);
  }
  html+=btCentroHTML();
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
  detalhe={kind:'skill', nome:a.nome, nv:nv, chave:'skill-'+u.key+'-'+a.slot, mono:mono(a), cor:a.slot==='defesa'?'var(--ink-mute)':COR(u.elem),
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
  // §330: sem quadro de ação — a habilidade armada se marca no próprio botão (moldura + ✓); tocar nela de novo desfaz
  // (armar() já alterna). O fluxo de alvo não muda.
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

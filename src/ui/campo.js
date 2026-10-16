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
/* ---------- §335: atalhos e cores do LAYOUT (tela fixa 1846×852, px de design) ---------- */
function _LB(){ return (typeof LAYOUT_BATALHA!=='undefined'&&LAYOUT_BATALHA)||{}; }
function _C(){ return _LB().campo||{}; }
function _COR(){ return _LB().cor||{}; }
const FX_COR={ bom:{bg:'linear-gradient(180deg,#3CD873,#169447)',ring:'rgba(160,255,190,.8)'},
  ruim:{bg:'linear-gradient(180deg,#FF4A4A,#B5141E)',ring:'rgba(255,160,160,.8)'},
  controle:{bg:'linear-gradient(180deg,#9A6BFF,#5A2FC8)',ring:'rgba(200,170,255,.8)'},
  defesa:{bg:'linear-gradient(180deg,#3E8BFF,#1C56C8)',ring:'rgba(150,200,255,.8)'} };
const HP_GRAD='linear-gradient(180deg,#5BEA8C,#22A855 60%,#1C8A47)';

/* ---------- barra de vida DENTRO do retrato (design: left4 right4 bottom4 h20) ---------- */
function btHp(u){
  const C=_C(), v=C.vida||{h:20,dy:4,fonte:16};
  const pct=Math.max(0,Math.min(100,u.hp/u.maxHp*100));
  const fill = u.vivo?`<div style="position:absolute;left:0;top:0;bottom:0;width:${pct}%;background:${HP_GRAD}"></div>`:'';
  const sh = u.shield?`<div style="position:absolute;top:0;right:0;height:100%;width:${Math.min(100,u.shield/u.maxHp*100)}%;background:#9fd8ff;opacity:.55"></div>`:'';
  return `<div class="bt-hp" style="position:absolute;left:${v.dy}px;right:${v.dy}px;bottom:${v.dy}px;height:${v.h}px;border-radius:3px;overflow:hidden;background:#0B1A10;box-shadow:inset 0 0 0 1px rgba(0,0,0,.6);pointer-events:none">
    ${fill}${sh}
    <div class="bt-hp__lab" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${v.fonte}px;color:#F4FFF6;text-shadow:0 1px 2px rgba(0,0,0,.8)">${u.hp}/${u.maxHp}${u.shield?' ◧'+u.shield:''}</div>
  </div>`;
}
/* ---------- indicador de níveis (reusa o motor; §320) — discreto, no canto do retrato ---------- */
function btNiv(u){
  if(typeof niveisEmBatalha!=='function'||typeof st==='undefined'||!st) return '';
  let nv; try{ nv=niveisEmBatalha(st,u); }catch(e){ return ''; }
  if(!(nv.basico>1||nv.habilidade>1||nv.milagre>1)) return '';
  const c=(n)=>`<span style="color:${n>1?'#F0DC9A':'#8f88b0'}">${n}</span>`;
  return `<div class="b5-niv bt-portrait__niv cin" style="position:absolute;left:5px;bottom:28px;display:flex;gap:3px;padding:1px 5px;border-radius:4px;background:rgba(6,5,16,.78);font-weight:800;font-size:15px;line-height:1.3;pointer-events:none">${c(nv.basico)}${c(nv.habilidade)}${c(nv.milagre)}</div>`;
}
/* ---------- ícones de efeito (design: box 24 na cor da categoria + número 19 ao lado; até 3, resto "+N") ---------- */
function btEfeitos(u){
  const tags=u.vivo?tagsDe(u):[]; const C=_C(), ef=C.efeitos||{size:24,gap:8,valor:19,max:3};
  if(!tags.length) return `<div style="height:${ef.size}px"></div>`;
  const vis = tags.length<=ef.max ? tags : tags.slice(0, ef.max-1);
  const resto = tags.length - vis.length;
  const cel=(t,i)=>{ const fc=FX_COR[t.cat]||FX_COR.bom;
    return `<button class="bt-eff bt-eff--${t.cat}" data-eff="${u.uid}|${i}" title="${H(t.nome)}${t.num?' '+H(t.num):''}" style="display:flex;align-items:center;gap:3px;border:0;background:none;padding:0;cursor:pointer">
      <span style="display:flex;align-items:center;justify-content:center;width:${ef.size}px;height:${ef.size}px;border-radius:4px;background:${fc.bg};box-shadow:inset 0 0 0 1px ${fc.ring};font-size:${Math.round(ef.size*0.62)}px">${t.icone}</span>
      ${t.num?`<span style="font-size:${ef.valor}px;font-weight:600;color:#F2F4F8">${H(t.num)}</span>`:(t.dur!=null?`<span style="font-size:${ef.valor}px;font-weight:600;color:#F2F4F8">${t.dur}</span>`:'')}
    </button>`; };
  let cels=vis.map(cel).join('');
  if(resto>0) cels+=`<button class="bt-eff bt-eff--mais" data-eff="${u.uid}|0" style="display:flex;align-items:center;justify-content:center;min-width:${ef.size}px;height:${ef.size}px;border:0;background:none;font-size:${ef.valor}px;font-weight:700;color:#cfc8ea;cursor:pointer">+${resto}</button>`;
  return `<div class="bt-eff-grid" style="height:${ef.size}px;display:flex;align-items:center;gap:${ef.gap}px">${cels}</div>`;
}
/* ---------- selo "P" dourado (aliado e inimigo) ---------- */
function _seloP(u, g, lado){
  const C=_C(), sz=C.selo||26, aceso=passivaAcesa(u);
  const base=`position:absolute;${lado}:5px;top:5px;width:${sz}px;height:${sz}px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${C.seloFonte||17}px`;
  const bg = aceso?'background:linear-gradient(180deg,#F6D985,#C99A35);color:#2A1A04;box-shadow:0 1px 3px rgba(0,0,0,.6),0 0 8px rgba(240,180,60,.8)'
                 :'background:linear-gradient(180deg,#F6D985,#C99A35);color:#2A1A04;box-shadow:0 1px 3px rgba(0,0,0,.6)';
  return `<button class="cin bt-portrait__pas ${aceso?'pas--on':''}" data-pas="${u.uid}" style="${base};${bg};border:0;cursor:pointer">P</button>`;
}
/* ---------- retrato do ALIADO + efeitos + 4 habilidades ---------- */
function btUnidadeAliada(u, meu){
  const C=_C(), cor=_COR(), g=_catPartida()[u.key]||{};
  const alvo=alvos.some(x=>x.uid===u.uid);
  const insp = (typeof detalhe!=='undefined'&&detalhe&&detalhe.kind==='unidade'&&detalhe.uid===u.uid);
  const sombra = alvo ? '0 0 0 2px #7ff0a5,0 0 16px rgba(127,240,165,.5)' : insp ? '0 0 0 2px #F6D985,0 0 18px rgba(240,180,60,.55)' : '0 0 0 1.5px '+(cor.gold||'#C9A44C')+',0 0 0 3px rgba(0,0,0,.5)';
  const sz=C.retrato||140;
  const x=(u.vivo?'':'filter:grayscale(1) brightness(.5);');
  const cls=['bt-portrait','bt-portrait--ally']; if(alvo)cls.push('is-target'); if(u.vivo&&!podeAgir(u))cls.push('acted');
  const portrait=`<div class="${cls.join(' ')}" data-uid="${u.uid}"${alvo?' data-target="1"':''} style="position:relative;width:${sz}px;height:${sz}px;border-radius:3px;overflow:hidden;cursor:pointer;background:#0C1020;box-shadow:${sombra};${x}">
    ${slot('god-'+u.key, ini(u.nome), COR(u.elem), 40)}
    ${g.passiva?_seloP(u,g,'right'):''}
    ${u.vivo?btNiv(u):''}
    ${btHp(u)}
  </div>`;
  const col=`<div style="display:flex;flex-direction:column;gap:4px;width:${sz}px;flex:none">${portrait}${btEfeitos(u)}</div>`;
  const skills=`<div style="display:flex;gap:${C.skill.gap}px;margin-top:${C.skill.mtop}px">${acoesDe(st,u).map(a=>btSkill(u,a,meu)).join('')}</div>`;
  return `<div style="display:flex;align-items:center;gap:18px;height:${C.fileira.h}px">${col}${skills}</div>`;
}
/* ---------- bolinhas de CUSTO (pílula escura embaixo do botão; design: pips 14) ---------- */
function btCustoPips(cost){
  const C=_C(), p=C.skill.pip||14;
  const pips=[];
  if(cost){ for(const k in cost){ if(k==='livre')continue; for(let i=0;i<cost[k];i++) pips.push(orbe(k,p)); }
    for(let i=0;i<(cost.livre||0);i++) pips.push(orbe('livre',p)); }
  if(!pips.length) return '';
  return `<div style="position:absolute;left:50%;bottom:4px;transform:translateX(-50%);height:${C.skill.pipPill||22}px;padding:0 6px;display:flex;align-items:center;gap:4px;border-radius:11px;background:rgba(4,6,12,.85);pointer-events:none">${pips.join('')}</div>`;
}
/* ---------- botão de habilidade 108×108 (arte cheia/disco §332/§334; cd; usada; custo; ✓ armada) ---------- */
function btSkill(u, a, meu){
  const C=_C(), cor=_COR(), sz=C.skill.size||108;
  const cd=u.cd[a.slot]||0;
  const clicavel=a.disponivel&&meu&&podeAgir(u)&&ehMeuTurno();
  const arm=armado&&armado.uid===u.uid&&armado.slot===a.slot;
  const anel=a.slot==='defesa'?'#D6DAE2':COR(u.elem);
  // §336: no MEU turno a INUSÁVEL (sem energia / recarga / impedido / morto → !clicavel) fica APAGADA (dessaturada e
  // escura, sem o brilho do acento); a USÁVEL mantém as cores e a moldura/brilho do acento (§335). No turno do oponente,
  // tudo fica levemente dessaturado (como antes). O estado recalcula a cada render (gastar energia apaga as que zeraram).
  const sombra = arm ? 'inset 0 0 0 2px #FFE7A0,0 0 0 2px '+(cor.gold||'#C9A44C')+',0 0 22px rgba(240,180,60,.75)'
                     : (meu&&!clicavel) ? 'inset 0 0 0 1.5px rgba(86,92,110,.55)'
                     : 'inset 0 0 0 1.5px '+anel+',0 0 10px '+anel+'55';
  const filtro = !meu ? 'saturate(.5) brightness(.75)'
               : clicavel ? 'none'
               : 'grayscale(.85) brightness(.55)';
  const nvSk=(typeof nivelSlotEmBatalha==='function')?nivelSlotEmBatalha(st,u,a.slot):1;
  const cdOv = cd>0 ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:radial-gradient(50% 50% at 50% 46%,rgba(0,0,0,.82) 0%,rgba(0,0,0,.55) 70%,rgba(0,0,0,.4) 100%);pointer-events:none"><span class="cin bt-skill__cd" style="font-weight:700;font-size:${C.skill.cdFonte||46}px;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.9)">${cd}</span></div>` : '';
  const armSel = arm ? `<span class="cin bt-skill__sel" style="position:absolute;right:5px;top:5px;width:30px;height:30px;border-radius:50%;background:#C9A44C;color:#2A1A04;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:19px;box-shadow:0 1px 4px rgba(0,0,0,.6)">✓</span>` : '';
  const nvBadge = nvSk>1 ? `<span class="b5-sknv bt-skill__nv cin" style="position:absolute;left:5px;top:5px;padding:0 6px;border-radius:4px;background:rgba(6,5,16,.82);color:#F0DC9A;font-weight:700;font-size:15px;line-height:1.4">Nv ${nvSk}</span>` : '';
  const cls=['b5-skill','bt-skill']; if(clicavel)cls.push('is-ready'); if(cd>0)cls.push('is-cooldown'); if(!clicavel)cls.push('is-off'); if(arm)cls.push('is-armed');
  return `<div class="${cls.join(' ')}" data-sk="${u.uid}|${a.slot}" data-arma="${clicavel?1:0}"${meu?'':' data-dead="1"'} style="position:relative;width:${sz}px;height:${sz}px;border-radius:4px;overflow:hidden;cursor:pointer;background:#0A0E1C;box-shadow:${sombra};filter:${filtro}">
    <span class="bt-skill__disc" style="position:absolute;inset:0">${slot('skill-'+u.key+'-'+a.slot,'',null,0,false)}</span>
    <span class="b5-mono bt-skill__mono cin" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:26px;color:${anel};pointer-events:none">${H(mono(a))}</span>
    ${cdOv}${btCustoPips(a.cost)}${armSel}${nvBadge}
  </div>`;
}
/* ---------- retrato do INIMIGO (? à esquerda, selo P à direita, mira quando alvo) + efeitos ---------- */
function btUnidadeInimiga(u){
  const C=_C(), cor=_COR(), g=_catPartida()[u.key]||{}, sz=C.retrato||140;
  const alvo=alvos.some(x=>x.uid===u.uid), jaEsc=escolhidos.includes(u.uid);
  const insp=(typeof detalhe!=='undefined'&&detalhe&&detalhe.kind==='unidade'&&detalhe.uid===u.uid);
  const temArmado=(typeof armado!=='undefined'&&armado);
  const sombra = jaEsc ? '0 0 0 2px #FF4A4A,0 0 22px rgba(255,74,74,.6)'
    : insp ? '0 0 0 2px #F6D985,0 0 18px rgba(240,180,60,.5)'
    : (temArmado&&alvo) ? '0 0 0 1.5px #E5384A,0 0 12px rgba(229,56,74,.5)'
    : '0 0 0 1.5px #C9343C,0 0 0 3px rgba(0,0,0,.5)';
  const x=(u.vivo?'':'filter:grayscale(1) brightness(.5);');
  const mira = jaEsc ? `<div class="b5-mira" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:radial-gradient(50% 50% at 50% 46%,rgba(224,52,60,.28),rgba(224,52,60,0) 70%);pointer-events:none">
      <div style="position:relative;width:${C.mira.size||54}px;height:${C.mira.size||54}px;border-radius:50%;box-shadow:inset 0 0 0 3px #FF4A4A,0 0 14px rgba(255,74,74,.8)">
        <span style="position:absolute;left:50%;top:-8px;width:3px;height:16px;margin-left:-1.5px;background:#FF4A4A"></span>
        <span style="position:absolute;left:50%;bottom:-8px;width:3px;height:16px;margin-left:-1.5px;background:#FF4A4A"></span>
        <span style="position:absolute;top:50%;left:-8px;height:3px;width:16px;margin-top:-1.5px;background:#FF4A4A"></span>
        <span style="position:absolute;top:50%;right:-8px;height:3px;width:16px;margin-top:-1.5px;background:#FF4A4A"></span>
      </div></div>` : '';
  const cls=['bt-portrait','bt-portrait--foe']; if(jaEsc||alvo)cls.push('is-target');
  const portrait=`<div class="${cls.join(' ')}" data-uid="${u.uid}" data-foe="1"${alvo?' data-target="1"':''} style="position:relative;width:${sz}px;height:${sz}px;border-radius:3px;overflow:hidden;cursor:pointer;background:#0C1020;box-shadow:${sombra};${x}">
    ${slot('god-'+u.key, ini(u.nome), COR(u.elem), 40)}
    ${u.vivo?`<span data-inspect="${u.uid}" style="position:absolute;left:5px;top:5px;width:${C.selo||26}px;height:${C.selo||26}px;border-radius:3px;display:flex;align-items:center;justify-content:center;background:#05070E;box-shadow:inset 0 0 0 1px rgba(255,255,255,.7);font-size:19px;font-weight:700;color:#fff;cursor:pointer">?</span>`:''}
    ${g.passiva?_seloP(u,g,'right'):''}
    ${u.vivo?btNiv(u):''}
    ${mira}
    ${btHp(u)}
  </div>`;
  return `<div style="display:flex;flex-direction:column;gap:4px;width:${sz}px;height:${C.fileira.h}px">${portrait}${btEfeitos(u)}</div>`;
}
/* ---------- deus em foco (compat: usado por outros pontos) ---------- */
function unidadeFoco(){
  const f = (typeof foco!=='undefined'&&foco)?todas().find(x=>x.uid===foco):null;
  if(f&&f.vivo) return f;
  const eu=ladoExibido();
  const lado = ehMeuTurno()? st.lados[eu] : st.lados[1-eu];
  return (lado.units.find(x=>x.vivo)) || st.lados[eu].units.find(x=>x.vivo) || st.lados[eu].units[0];
}
// §335: arte LARGA da cena por TURNO: web/cena/turno_*.webp (CENA_ARTE) senão o RETRATO do deus de arte_turno.json.
function _cenaSrc(){
  const meu=ehMeuTurno();
  const cena=(typeof CENA_ARTE!=='undefined'&&CENA_ARTE)||{};
  const cfg=(typeof ARTE_TURNO!=='undefined'&&ARTE_TURNO)||{meu:'',oponente:''};
  if(meu && cena.meu) return 'cena/turno_meu.webp';
  if(!meu && cena.oponente) return 'cena/turno_oponente.webp';
  const key = meu ? cfg.meu : cfg.oponente;
  if(typeof RETRATO_ARTE!=='undefined'&&RETRATO_ARTE&&RETRATO_ARTE[key]) return 'retratos/'+key+'.webp';
  if(typeof CORPO_ARTE!=='undefined'&&CORPO_ARTE&&CORPO_ARTE[key]) return 'corpo/'+key+'.webp';
  if(typeof IMG!=='undefined'&&IMG[key]) return IMG[key];
  return '';
}
// §335: a CENA central (arte em cover sangrando p/ os lados, máscara horizontal) + o ANÚNCIO DE TURNO (sol + linhas).
function btCenaHTML(){
  const C=_C(), cor=_COR(), meu=ehMeuTurno();
  const cn=C.cena||{left:-60,right:-40,mask:[14,86],anuncioTop:266,titulo:48,sub:22,ornato:[190,92],linha:560};
  const acento = meu ? (cor.acentoMeu||'#E9B949') : (cor.acentoOpo||'#D8434A');
  const acentoTxt = meu ? (cor.acentoMeuTexto||'#F2BE48') : (cor.acentoOpoTexto||'#E8545B');
  const glow = meu ? (cor.acentoMeuGlow||'rgba(240,180,60,.6)') : (cor.acentoOpoGlow||'rgba(216,67,74,.55)');
  const titulo = meu ? 'SEU TURNO' : 'TURNO DO OPONENTE';
  const sub = meu ? 'Escolha uma habilidade e selecione um alvo.' : 'Aguarde a ação do oponente.';
  const src=_cenaSrc();
  // §335b: a arte LARGA (cena/turno_*.webp) fica em cover CENTRADO (como no HTML). No FALLBACK de retrato (quadrado), o
  // cover centrado cortava o ROSTO — ancora o recorte no terço de cima para mostrar o rosto inteiro (Nezha/Ah Puch).
  const larga = /^cena\//.test(src);
  const objPos = larga ? '50% 50%' : '50% 12%';
  const art = src ? `<div class="b5-art" style="position:absolute;left:${cn.left}px;right:${cn.right}px;top:0;bottom:0;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 ${cn.mask[0]}%,#000 ${cn.mask[1]}%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 ${cn.mask[0]}%,#000 ${cn.mask[1]}%,transparent 100%)">
      <img src="${H(src)}" alt="" style="object-position:${objPos}" onerror="this.style.display='none'">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,6,14,.55) 0%,rgba(4,6,14,0) 16%,rgba(4,6,14,0) 70%,rgba(4,6,14,.6) 100%);pointer-events:none"></div>
    </div>` : '';
  const [ow,oh]=cn.ornato; const lw=cn.linha;
  const ornato=`<div style="position:relative;width:${ow}px;height:${oh}px;filter:drop-shadow(0 0 10px ${glow})">
    <span style="position:absolute;left:94px;top:4px;width:2px;height:22px;border-radius:1px;background:${acento}"></span>
    <span style="position:absolute;left:73px;top:11px;width:2px;height:22px;border-radius:1px;background:${acento};transform:rotate(-22deg)"></span>
    <span style="position:absolute;left:115px;top:11px;width:2px;height:22px;border-radius:1px;background:${acento};transform:rotate(22deg)"></span>
    <span style="position:absolute;left:56px;top:25px;width:2px;height:20px;border-radius:1px;background:${acento};transform:rotate(-45deg)"></span>
    <span style="position:absolute;left:132px;top:25px;width:2px;height:20px;border-radius:1px;background:${acento};transform:rotate(45deg)"></span>
    <span style="position:absolute;left:60px;top:37px;width:70px;height:35px;border-radius:35px 35px 0 0;background:${acento}"></span>
    <span style="position:absolute;left:70px;top:47px;width:50px;height:25px;box-sizing:border-box;border-radius:25px 25px 0 0;border:2px solid rgba(42,26,4,.55);border-bottom:0"></span>
    <span style="position:absolute;left:6px;top:75px;width:52px;height:2px;background:${acento}"></span>
    <span style="position:absolute;left:132px;top:75px;width:52px;height:2px;background:${acento}"></span>
    <span style="position:absolute;left:20px;top:85px;width:150px;height:1.5px;background:${acento};opacity:.9"></span>
  </div>`;
  const linha=(mt)=>`<div style="width:${lw}px;height:1px;margin-top:${mt}px;background:linear-gradient(90deg,rgba(0,0,0,0),${acento} 30%,${acento} 70%,rgba(0,0,0,0))"></div>`;
  const anuncio=`<div style="position:absolute;left:0;right:0;top:${cn.anuncioTop}px;display:flex;flex-direction:column;align-items:center;pointer-events:none">
    ${ornato}
    ${linha(-4)}
    <div class="cin" style="margin-top:14px;font-weight:700;font-size:${cn.titulo}px;line-height:1.1;letter-spacing:.03em;color:${acentoTxt};text-shadow:0 3px 0 rgba(40,24,4,.85),0 6px 24px rgba(0,0,0,.9)">${titulo}</div>
    <div style="margin-top:8px;font-size:${cn.sub}px;font-weight:600;color:#F2F4F8;text-shadow:0 2px 10px rgba(0,0,0,.95)">${sub}</div>
    ${linha(22)}
    <div style="width:10px;height:10px;margin-top:-5px;transform:rotate(45deg);box-shadow:inset 0 0 0 1.5px ${acento};background:#070A14"></div>
  </div>`;
  return `<div style="position:relative;overflow:visible">${art}${anuncio}</div>`;
}

/* ---------- composição do campo (grade 676 | 1fr | 172) ---------- */
function campoHTML(l,o){
  const meu=ehMeuTurno(), C=_C(), cor=_COR();
  const col1=`<div style="display:flex;flex-direction:column;justify-content:center;gap:${C.fileira.gap}px;padding-left:10px;position:relative;z-index:2">${[0,1,2].map(i=>l.units[i]?btUnidadeAliada(l.units[i],meu):'').join('')}</div>`;
  const col3=`<div style="display:flex;flex-direction:column;justify-content:center;align-items:flex-end;gap:${C.fileira.gap}px;padding-right:10px;position:relative;z-index:2">${[0,1,2].map(i=>o.units[i]?btUnidadeInimiga(o.units[i]):'').join('')}</div>`;
  return `<section class="b5-campo" style="position:absolute;left:${C.left}px;top:${C.top}px;width:${C.w}px;height:${C.h}px;box-sizing:border-box;display:grid;grid-template-columns:${C.cols.aliados}px minmax(0,1fr) ${C.cols.inimigos}px;border-radius:6px;background:rgba(6,9,18,.55);box-shadow:inset 0 0 0 1px rgba(201,164,76,.18)">
    ${col1}${btCenaHTML()}${col3}
  </section>`;
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
  detalhe={kind:'skill', uid:u.uid, nome:a.nome, nv:nv, chave:'skill-'+u.key+'-'+a.slot, mono:mono(a), cor:a.slot==='defesa'?'var(--ink-mute)':COR(u.elem),
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
  // §333: quem APLICOU o efeito (e.origem), quando o motor souber — vira "aplicado por X" nos dados do painel.
  let aplicadoPor='';
  const raw=(u.efeitos||[]).find(e=>e.type===t.key) || (u.dots||[]).find(d=>d.nome===t.key);
  if(raw && raw.origem){ const o=todas().find(x=>x.uid===raw.origem); if(o && o.uid!==u.uid) aplicadoPor=o.nome; }
  detalhe={kind:'efeito', uid:u.uid, nome:t.nome, cor:COR(u.elem), icone:t.icone, cat:t.cat, num:t.num, desc:t.desc,
    dur:t.dur, dono:u.nome, aplicadoPor};
  armado=null; alvos=[]; escolhidos=[]; peekKit=null; render();
}

/* ---------- eventos do campo ---------- */
function ligarCampo(){
  // habilidade (aliado): data-arma=1 arma; 0 só lê. (§335: seleção por data-sk, independente da classe visual.)
  stage.querySelectorAll('[data-sk]').forEach(b=>{
    if(b.dataset.dead==='1') return;   // turno do oponente: as habilidades do jogador não respondem
    b.onclick=()=>{ const[uid,slot]=b.dataset.sk.split('|');
      if(b.dataset.arma==='1'){ armar(uid,slot); } else lerHabilidade(uid,slot); };});
  // retrato (aliado ou inimigo): com habilidade armada e sendo ALVO → escolhe alvo; senão → inspeção no painel.
  stage.querySelectorAll('[data-uid]').forEach(el=>{
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
    detalhe={kind:'passiva', uid:u.uid, nome:g.passiva.nome, cor:COR(u.elem), chave:'god-'+u.key,
      dono:u.nome, inerte:g.passiva.inerte, desc:agora+'\n'+g.passiva.desc};
    armado=null;alvos=[];escolhidos=[];peekKit=null;render();});
  // ícone de efeito: detalhe do efeito no painel.
  stage.querySelectorAll('[data-eff]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const[uid,idx]=b.dataset.eff.split('|'); infoEfeito(uid, +idx);});
  // §335: o "?" do inimigo INSPECIONA (mesmo com habilidade armada).
  stage.querySelectorAll('[data-inspect]').forEach(b=>b.onclick=ev=>{ev.stopPropagation(); infoUnidade(b.dataset.inspect);});
  // caixa de minis (deus em foco): LEITURA de habilidade (inclusive do oponente — nunca arma, §15).
  stage.querySelectorAll('[data-look]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const[uid,slot]=b.dataset.look.split('|'); lerHabilidade(uid,slot);});
  if(resumoTurno) stage.addEventListener('pointerdown',()=>{ resumoTurno=null; },{once:true,capture:true});
}

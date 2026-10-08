// ui/campo.js — as bandas da fileira (§214): retrato (nome inteiro + vida + efeitos), os 4 tiles
// de habilidade, a ficha da unidade, e a consulta do KIT inimigo por TOQUE LONGO no retrato.

// §266 — a passiva SE ANUNCIA quando age. O motor (infoPassiva) diz o que está modificando AGORA; a UI
// só acende o "P" e mostra o valor/fonte. `armado`/`alvos` são globais da sessão (view.js): quando o
// jogador arma um golpe, passamos o alvo candidato p/ as passivas SÓ-ALVO acenderem no alvo que casa (§266).
function _armadoCtx(){
  if(typeof armado==='undefined' || !armado) return null;
  const al=(typeof alvos!=='undefined'&&alvos)?alvos.map(x=>x.uid):[];
  // §267: descreve o GOLPE mirado (slot/classe/elem/alcance) — a redução do defensor com `contra` só
  // acende quando ESTE golpe casa o filtro. classe/elem vêm da ação armada; unico = mira de alvo único.
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
// rótulo legível de um item ativo da passiva (com o VALOR — a tese: explicar o número sem tocar)
function rotuloPassivaItem(it){
  if(it.gat==='bonusDano') return '+'+it.v+' de dano'+(it.alvo?' (neste alvo)':'');
  if(it.gat==='reducao') return '−'+it.v+' de dano recebido';
  if(it.gat==='vulnerabilidade') return '+'+it.v+' de dano recebido';
  if(it.gat==='danoIrredutivel') return 'fura '+(it.fura||[]).map(x=>x==='reducao'?'redução':'escudo').join(' e ');
  if(it.gat==='amplificaDot') return '+'+it.v+' por tique de '+(it.nome||'dano contínuo');
  return '';
}
// §328 — ETIQUETAS de efeito LEGÍVEIS (nome escrito, nunca só ícone). Lê data/status_visual.json (STATUS_VISUAL,
// injetado na build), que tem UMA entrada por tipo que o motor pode pôr numa unidade (portão de build garante).
function _svDe(key){ return (typeof STATUS_VISUAL!=='undefined'&&STATUS_VISUAL&&STATUS_VISUAL[key])||null; }
// o NÚMERO exibido na etiqueta (valor assinado / acúmulo ×N / nenhum), conforme o campo `num` do dado.
const _TAG_PLAIN=['queimadura','veneno','sangramento','tormento','maldicao','marcaMorte','shield'];   // valor cru (sem sinal)
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
// lista ORDENADA de etiquetas de uma unidade: controle → ruim → defesa → bom (o perigo primeiro). Reúne
// u.efeitos (buff/debuff), u.dots (dano contínuo), u.contadores (acúmulos) e u.shield (Defesa). Cada item:
// {key, nome, icone, num, dur (null=permanente, sem selinho), cat}. Usada pela faixa do retrato E pelo quadro.
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
// §328: as etiquetas são EMPILHADAS (1 por linha, nome INTEIRO legível) sob a barra de vida. A banda do retrato
// só comporta ~3 linhas (board 306/3 = 102px de design/fileira, retrato 58 + 3 linhas), então mostramos ATÉ 3
// etiquetas e o resto vira "+N" (toque abre o quadro, que lista TODAS com descrição). O "+N" conta como uma célula.
const FXTAGS_MAX=3;
// uma ETIQUETA: [ícone] Nome [valor/acúmulo não-truncável] + selinho redondo de TURNOS (só se não for permanente).
function _pillHTML(u,t){
  return `<span class="fxtag fxtag--${t.cat}" data-insp="${u.uid}" title="${H(t.nome)}${t.num?' '+H(t.num):''}">`
    +`<span class="fxtag__i" aria-hidden="true">${t.icone}</span>`
    +`<span class="fxtag__n">${H(t.nome)}</span>`
    +`${t.num?`<span class="fxtag__v">${H(t.num)}</span>`:''}`
    +`${t.dur!=null?`<span class="fxtag__t">${t.dur}</span>`:''}</span>`;
}
function fxtagsHTML(u){
  const tags=tagsDe(u); if(!tags.length) return '';
  // cabem no máximo FXTAGS_MAX células: se houver mais etiquetas, a última célula é o "+N".
  const vis = tags.length<=FXTAGS_MAX ? tags : tags.slice(0, FXTAGS_MAX-1);
  const resto = tags.length - vis.length;
  const mais = resto>0 ? `<span class="fxtag fxtag--mais" data-insp="${u.uid}">+${resto}</span>` : '';
  return vis.map(t=>_pillHTML(u,t)).join('')+mais;
}

// §320 — INDICADOR de níveis das 3 habilidades no retrato (aliado E inimigo). Deriva do kitDe (o que o
// MOTOR usa) por niveisEmBatalha: o número mostrado É o nível que o motor aplicou (valor público). Todo nv1
// → NADA (zero poluição no caso comum: PvE, novatos). Pequeno, dourado apagado, sem brilho. "3·1·4".
function nivBatalhaHTML(u){
  if(typeof niveisEmBatalha!=='function'||typeof st==='undefined'||!st) return '';
  let nv; try{ nv=niveisEmBatalha(st,u); }catch(e){ return ''; }
  if(!(nv.basico>1||nv.habilidade>1||nv.milagre>1)) return '';
  const cel=(n,lab)=>`<span class="pniv__c${n>1?' pniv__c--up':''}" title="${lab} nível ${n}">${n}</span>`;
  return `<div class="portrait__niv" aria-label="níveis de habilidade">${cel(nv.basico,'Básico')}${cel(nv.habilidade,'Habilidade')}${cel(nv.milagre,'Milagre')}</div>`;
}

/* ---------- retrato (§214): 88 de largura, nome INTEIRO, aro ouro (aliado) x vermelho (inimigo) ---------- */
function retrato(u,inimigo){
  const pct=Math.max(0,Math.min(100,u.hp/u.maxHp*100));
  const g=_catPartida()[u.key]||{};   // catalogo DA PARTIDA (deuses U bestiario): criatura PvE nao esta em GODS
  const alvo=alvos.some(x=>x.uid===u.uid);
  const jaEscolhido=escolhidos.includes(u.uid);
  const cls=['portrait'];
  if(!u.vivo)cls.push('is-down');
  if(alvo)cls.push('is-target');
  if(jaEscolhido)cls.push('is-picked');
  if(hpAnt[u.uid]!==undefined&&hpAnt[u.uid]>u.hp)cls.push('hit');
  const hpcls=['hp']; if(!u.vivo)hpcls.push('hp--empty'); else if(u.hp<=40)hpcls.push('hp--warn');
  const upcls=['unit__portrait', inimigo?'up--enemy':'up--ally'];
  if(u.vivo&&!inimigo&&!podeAgir(u))upcls.push('acted');   // "ja agiu" esmaece o retrato (nao a arte dos tiles)
  // §258: nome e barra de vida SOBREPÕEM a arte (dentro de .portrait), não mais empilhados abaixo —
  // assim o retrato cresceu para 94×94 (maior que a ficha) cabendo na banda de 98px.
  return `<div class="${upcls.join(' ')}">
    <div class="${cls.join(' ')}" data-uid="${u.uid}" ${alvo?'data-target="1"':''} ${inimigo?'data-foe="1"':''}>
      ${slot('god-'+u.key, ini(u.nome), COR(u.elem), 30)}
      <span class="portrait__elem" style="background:${COR(u.elem)}"></span>
      ${g.passiva?`<button class="portrait__pas ${g.passiva.inerte?'inert':''} ${passivaAcesa(u)?'pas--on':''}" data-pas="${u.uid}">P</button>`:''}
      ${inimigo&&u.vivo?`<span class="portrait__ask" title="segure para ver o kit">?</span>`:''}
      ${u.vivo?nivBatalhaHTML(u):''}
      <div class="portrait__nome" title="${H(u.nome)}">${H(metaComb(u.key).curto)}</div>
      <div class="${hpcls.join(' ')}">
        ${u.vivo?`<div class="hp__fill" style="width:${pct}%"></div>`:''}
        ${u.shield?`<div class="hp__shield" style="width:${Math.min(100,u.shield/u.maxHp*100)}%"></div>`:''}
        <div class="hp__label">${u.hp}${u.shield?' ◧'+u.shield:''}</div>
      </div>
      <div class="portrait__x"></div>
    </div>
    <div class="fxtags fxtags--${inimigo?'enemy':'ally'}">${u.vivo?fxtagsHTML(u):''}</div>
  </div>`;
}

/* ---------- fileira (§214): aliado (retrato + 4 tiles) x inimigo (retrato) da mesma posicao ---------- */
function filaHTML(a, e){
  // times ASSIMÉTRICOS (campanha: 3×1, 3×2, 0×3): uma banda pode não ter unidade — desenha vazia,
  // mantendo a coluna alinhada por posição sem quebrar em u.hp de unidade indefinida.
  // §239: aliado + habilidades vivem numa MOLDURA (.brow__unit) — uma placa que passa por baixo do
  // retrato e se estende atrás dos 4 tiles, unindo-os ("este deus e o que ele pode fazer"). As
  // habilidades COLAM no retrato (esquerda, sem centralizar). O inimigo fica FORA da moldura, à direita
  // (§214 o pôs lá para o polegar). A posição não muda com o turno — só a ênfase (item 4).
  // §299: a FAIXA de efeitos subiu — ACIMA das fichas (aliado) e ACIMA do retrato (inimigo), fora do
  // retrato (§258 volta a ser só a arte). A linha tem altura fixa e o conteúdo é ancorado embaixo, então a
  // faixa ocupa o espaço ACIMA sem empurrar a ficha nem mudar a moldura (§239) — sem pulo.
  // §328: as etiquetas de efeito agora vivem ABAIXO da barra de vida (dentro do retrato, ambos os lados) —
  // a faixa acima das fichas (§299) saiu. O retrato (ally/enemy) já emite a sua fileira de etiquetas.
  return `<div class="brow">
    <div class="brow__unit">
      <div class="brow__ally">${a?retrato(a,false):''}</div>
      <div class="brow__tilecol">
        <div class="brow__tiles">${a?tilesHTML(a):''}</div>
      </div>
    </div>
    <div class="brow__enemy">
      ${e?retrato(e,true):''}
    </div>
  </div>`;
}
function tilesHTML(u){
  if(!u.vivo)return '';
  const acs=acoesDe(st,u);
  const ativa=podeAgir(u)&&ehMeuTurno();   // a UNIDADE ainda pode agir neste turno?
  return acs.map(a=>{
    const cd=u.cd[a.slot]||0;
    const semOrbe=!a.disponivel&&cd===0&&a.motivo==='sem_energia';
    const semAlvo=!a.disponivel&&cd===0&&a.motivo==='sem_alvo';
    const travada=!a.disponivel&&cd===0&&!semOrbe&&!semAlvo;   // Selado/Silencio/1x-ja-usada
    const arm=armado&&armado.uid===u.uid&&armado.slot===a.slot;
    const clicavel=a.disponivel&&ativa;
    // §238: TRÊS NÍVEIS de leitura na ARTE (revisa §211). pronto = arte cheia + anel aceso;
    // indisponível = arte esmaecida mas RECONHECÍVEL (a unidade pode agir, esta habilidade não);
    // recuo = a unidade INTEIRA já agiu / não é a vez — o nível mais fraco.
    const nivel = clicavel ? 'pronto' : (ativa ? 'indispon' : 'recuo');
    const cls=['skill','nv-'+nivel]; if(a.universal)cls.push('skill--uni');
    if(clicavel)cls.push('is-ready');   // anel aceso só quando dá para agir
    if(cd>0)cls.push('is-cooldown');
    if(travada)cls.push('is-locked');
    if(semAlvo)cls.push('is-notarget');
    if(!clicavel)cls.push('is-off');    // mono/aro apagados (a arte é esmaecida pelo nv-*)
    if(arm)cls.push('is-armed');
    cls.push('skill--'+a.slot);
    const anel=a.slot==='defesa'?'var(--ink-mute)':COR(u.elem);
    // §320: o NÍVEL da habilidade num canto do tile (discreto, dourado apagado). Só quando ≥2 (nv1 e
    // habilidade SEM escada → nada: zero poluição). Deriva do kitDe (bate com o motor).
    const nvSk=(typeof nivelSlotEmBatalha==='function')?nivelSlotEmBatalha(st,u,a.slot):1;
    // TODA habilidade é TOCÁVEL PARA LER (§238): nunca `disabled`. data-arma=1 arma; 0 só lê (mostra o
    // que faz + POR QUE está indisponível, no rodapé). Ler nunca custa nada (invariante do projeto).
    return `<button class="${cls.join(' ')}" data-sk="${u.uid}|${a.slot}" data-arma="${clicavel?1:0}">
      <span class="skill__disc" style="border-color:${anel};--anel:${anel}">
        ${slot('skill-'+u.key+'-'+a.slot,'',null,0,true)}
        <span class="skill__mono" style="color:${anel}">${H(mono(a))}</span>
        <span class="skill__cd">${cd||''}</span>
        <span class="skill__lock">⊘</span>
        <span class="skill__na">∅</span>
        ${nvSk>1?`<span class="skill__nv">Nv ${nvSk}</span>`:''}
      </span>
      ${pipsMini(a.cost, st.lados[u.lado].orbs)}
    </button>`;
  }).join('');
}
// §238: por que uma habilidade está indisponível — texto curto para o rodapé de leitura.
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
function ficha(u){
  const g=_catPartida()[u.key]||{},lin=[];
  if(g.passiva)lin.push(`${g.passiva.nome}: ${g.passiva.desc}`);
  for(const e of u.efeitos){const s=SYM[e.type];if(s)lin.push(`${s[2]}${e.v?' '+e.v:''} (${e.dur>90?'permanente':e.dur+'t'})`);}
  for(const d of u.dots)lin.push(`${rotuloEfeito(d.nome)} ${d.v}/t (${d.dur}t)`);
  for(const k of['habilidade','milagre','defesa'])if(u.cd[k]>0)lin.push(`${k} em recarga ${u.cd[k]}t`);
  if(u.shield)lin.push(`escudo ${u.shield}`);
  detalhe={nome:u.nome.toUpperCase(),chave:'god-'+u.key,glifo:ini(u.nome),cor:COR(u.elem),
    meta:`${u.hp}/${u.maxHp} · ${ELAB[u.elem]}`,
    texto:lin.join('  ·  '),
    classes:`${u.classe} · ${u.funcao} · ${u.faccao||g.faccao||'PvE'}`.toUpperCase()};
  peekKit=null; armado=null;alvos=[];escolhidos=[];render();
}

/* ---------- §328: QUADRO DE INSPEÇÃO (abre ao tocar um retrato/etiqueta sem habilidade armada) ----------
   Leitura PURA: não gasta ação, não muda o estado nem para o cronômetro. Mostra retrato, nome, função·elemento,
   vida, passiva, as 4 miniaturas (com o Nv REAL desta partida) e os efeitos ativos com descrição. Vem com a
   Habilidade selecionada. Fecha por ✕, toque fora ou voltar do Android. Reusa o quadrado das habilidades. */
function abrirInspec(uid){ if(!todas().find(x=>x.uid===uid)) return; inspec=uid; inspecSlot='habilidade'; peekKit=null; detalhe=null; armado=null; alvos=[]; escolhidos=[]; render(); }
function fecharInspec(){ inspec=null; render(); }
const _ROT_SLOT={ basico:'Básico', habilidade:'Habilidade', milagre:'Milagre', defesa:'Defesa' };
function quadroInspecaoHTML(){
  const u=inspec&&todas().find(x=>x.uid===inspec); if(!u) return '';
  const g=_catPartida()[u.key]||{};
  const acoes=acoesDe(st,u); const porSlot={}; acoes.forEach(a=>porSlot[a.slot]=a);
  const ordem=['basico','habilidade','milagre','defesa'].filter(s=>porSlot[s]);
  const sel = porSlot[inspecSlot]?inspecSlot:(ordem.includes('habilidade')?'habilidade':ordem[0]);
  const nivSlot=s=>{ try{ return (typeof nivelSlotEmBatalha==='function')?nivelSlotEmBatalha(st,u,s):1; }catch(e){ return 1; } };
  const mini=s=>{ const a=porSlot[s]; const nv=nivSlot(s); const anel=s==='defesa'?'var(--ink-mute)':COR(u.elem);
    return `<button class="inspmini ${s===sel?'is-sel':''}" data-inspslot="${s}">
      <span class="inspmini__disc" style="border-color:${anel}">
        ${slot('skill-'+u.key+'-'+s,'',null,0,true)}<span class="inspmini__mono" style="color:${anel}">${H(mono(a))}</span>
        ${nv>1?`<span class="inspmini__nv">Nv ${nv}</span>`:''}
      </span>
      <span class="inspmini__lab">${_ROT_SLOT[s]||H(s)}</span>
    </button>`; };
  const a=porSlot[sel]; const cd=u.cd[sel]||0;
  const recarga = a.cd ? (cd>0?`Recarga ${a.cd} · pronta em ${cd} turno${cd>1?'s':''}`:`Recarga ${a.cd} · pronta`) : 'Sem recarga';
  const detSel=`<div class="inspdet">
    <div class="inspdet__cab"><b>${H(a.nome)}</b>${pipsDetalhe(a.cost)}<span class="inspdet__cd">${H(recarga)}</span></div>
    <div class="inspdet__txt">${realce(a.desc||'')}</div>
  </div>`;
  const tags=tagsDe(u);
  const efAtivos = tags.length
    ? `<div class="inspef">${tags.map(t=>`<div class="inspef__l inspef__l--${t.cat}"><span class="inspef__i" aria-hidden="true">${t.icone}</span><b class="inspef__n">${H(t.nome)}${t.num?' '+H(t.num):''}</b><span class="inspef__t">${t.dur!=null?t.dur+'t':'perm.'}</span><span class="inspef__d">${H(t.desc||'')}</span></div>`).join('')}</div>`
    : `<div class="inspef inspef--vazio">Sem efeitos ativos.</div>`;
  const pas = g.passiva?`<div class="insppas"><b>Passiva — ${H(g.passiva.nome)}:</b> ${H(g.passiva.desc)}</div>`:'';
  return `<div class="inspecao" data-insproot="1">
    <div class="inspbox" role="dialog" aria-label="Inspeção de ${H(u.nome)}">
      <button class="inspx" data-inspx="1" aria-label="Fechar">✕</button>
      <div class="inspcab">
        <div class="inspcab__p">${slot('god-'+u.key,ini(u.nome),COR(u.elem),26)}<span class="inspcab__el" style="background:${COR(u.elem)}"></span></div>
        <div class="inspcab__id">
          <div class="inspcab__nome">${H(u.nome)}</div>
          <div class="inspcab__sub">${H(u.funcao)} · ${H(ELAB[u.elem]||u.elem)}</div>
        </div>
        <div class="inspcab__hp">${u.hp}/${u.maxHp}${u.shield?' ◧'+u.shield:''}</div>
      </div>
      ${pas}
      <div class="inspminis">${ordem.map(mini).join('')}</div>
      ${detSel}
      <div class="inspef__tit">Efeitos ativos</div>
      ${efAtivos}
    </div>
  </div>`;
}

/* ---------- eventos do campo (tiles, alvo, retrato, toque longo do inimigo, passiva, efeitos) ---------- */
function ligarCampo(){
  // TILES de habilidade (aliado): data-arma=1 ARMA; 0 só LÊ (§238 item 3 — tocar para ler nunca custa).
  stage.querySelectorAll('.skill').forEach(b=>{
    b.onclick=()=>{ const[uid,slot]=b.dataset.sk.split('|');
      if(b.dataset.arma==='1'){ peekKit=null; armar(uid,slot); }
      else lerHabilidade(uid,slot); };});
  // ALVO aliado (cura/buff): retrato aliado marcado como alvo — toque escolhe
  stage.querySelectorAll('.portrait[data-target]:not([data-foe])').forEach(el=>el.onclick=()=>alvo(el.dataset.uid));
  // §328: retrato aliado comum (sem habilidade armada) ABRE o QUADRO DE INSPEÇÃO. Com habilidade armada, o
  // toque é escolher alvo (os aliados-alvo têm o handler acima); aliado que não é alvo não abre o quadro.
  stage.querySelectorAll('.portrait:not([data-foe]):not([data-target])').forEach(el=>{
    el.onclick=ev=>{ev.stopPropagation(); if(!armado) abrirInspec(el.dataset.uid);};});
  // retrato INIMIGO: TOQUE LONGO abre o kit; toque curto = alvo (se for) ou ficha (§214 item 8)
  stage.querySelectorAll('.portrait[data-foe]').forEach(el=>ligarFoe(el));
  // §299: o painel lateral saiu — não há mais aba de recolher. O histórico é o ≡ REGISTRO do topo.
  // KIT consultado (§219): tocar um CHIP seleciona a habilidade — o detalhe (custo/recarga/texto)
  // aparece embaixo, no MESMO painel, sem sair do kit. A seleção persiste no kitSel.
  stage.querySelectorAll('[data-kitsel]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const[,slotk]=b.dataset.kitsel.split('|'); kitSel=slotk; render();});
  // fechar o kit é DELIBERADO (§219): o ✕ do painel volta ao histórico. Soltar o dedo nunca fecha.
  const kx=stage.querySelector('[data-kitclose]'); if(kx)kx.onclick=ev=>{ev.stopPropagation(); peekKit=null;kitSel=null; render();};
  // passiva (aliada ou inimiga): estado 4 do painel
  stage.querySelectorAll('[data-pas]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const u=todas().find(x=>x.uid===b.dataset.pas),g=_catPartida()[u.key]||{};
    if(!g.passiva)return;
    // §266: LÊ o que a passiva está fazendo AGORA (antes de limpar o armado abaixo) — com o VALOR e a FONTE.
    const info=infoPassivaUI(u);
    const linhas=[];
    for(const it of info.propria) linhas.push(rotuloPassivaItem(it));
    for(const it of info.recebidas) linhas.push(rotuloPassivaItem(it)+' — de '+H(it.fonteNome));
    const agora = linhas.length ? ('AGINDO AGORA: '+linhas.join(' · ')) : 'PARADA AGORA (a condição não vale no momento)';
    detalhe={nome:g.passiva.nome.toUpperCase(),chave:'god-'+u.key,glifo:'P',cor:COR(u.elem),
      meta:u.nome.toUpperCase()+' · PASSIVA'+(g.passiva.inerte?' · INERTE':''),
      texto:agora+'\n'+g.passiva.desc,classes:'NÃO GASTA A AÇÃO · NÃO PODE SER SILENCIADA', passiva:true};
    peekKit=null; armado=null;alvos=[];escolhidos=[];render();});
  stage.querySelectorAll('[data-ficha]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const u=todas().find(x=>x.uid===b.dataset.ficha); if(u)ficha(u);});
  // §328: tocar uma ETIQUETA de efeito (ou o "+N") abre o QUADRO DE INSPEÇÃO da unidade (sem habilidade armada).
  stage.querySelectorAll('[data-insp]').forEach(b=>b.onclick=ev=>{ev.stopPropagation(); if(!armado) abrirInspec(b.dataset.insp);});
  // §328: QUADRO DE INSPEÇÃO — trocar a miniatura selecionada, fechar no ✕ e fechar ao tocar FORA da caixa.
  stage.querySelectorAll('[data-inspslot]').forEach(b=>b.onclick=ev=>{ev.stopPropagation(); inspecSlot=b.dataset.inspslot; render();});
  const ix=stage.querySelector('[data-inspx]'); if(ix)ix.onclick=ev=>{ev.stopPropagation(); fecharInspec();};
  const iroot=stage.querySelector('[data-insproot]'); if(iroot)iroot.onclick=ev=>{ if(ev.target===iroot) fecharInspec(); };
  // resumo do turno (F0.7): some ao PRIMEIRO toque em qualquer coisa.
  if(resumoTurno) stage.addEventListener('pointerdown',()=>{ resumoTurno=null; },{once:true,capture:true});
}
// §238 (item 3) — LER uma habilidade SUA sem armar: o rodapé mostra o que ela faz, custo, recarga e,
// se estiver indisponível, POR QUÊ. Ler é sempre grátis; não arma, não gasta, não escolhe alvo.
function lerHabilidade(uid,slot){
  const u=todas().find(x=>x.uid===uid); if(!u)return;
  const a=acoesDe(st,u).find(x=>x.slot===slot); if(!a)return;
  detalhe={nome:a.nome.toUpperCase(),chave:'skill-'+u.key+'-'+a.slot,glifo:mono(a),
    cor:a.slot==='defesa'?'var(--ink-mute)':COR(u.elem),redondo:true,
    pips:pipsDetalhe(a.cost), meta:(a.cd?'RECARGA '+a.cd:'SEM RECARGA'),
    texto:a.desc, classes:classesTxt(u,a),
    motivo: a.disponivel ? '' : motivoIndisponivel(u,a)};
  peekKit=null; armado=null; alvos=[]; escolhidos=[]; render();
}
// abre o KIT do inimigo no painel e o mantém aberto (§219: soltar o dedo NÃO fecha).
function abrirKit(uid){ peekKit=uid; kitSel=null; detalhe=null; armado=null;alvos=[];escolhidos=[]; render(); }

// TOQUE LONGO no retrato inimigo: abre o kit e ele FICA (item 8 / §219). O estado do gesto vive
// em MÓDULO (foeGesto), não no closure — porque abrir() chama render(), que troca o DOM no meio do
// toque; o pointerup do dedo levantado cai no elemento NOVO, e antes disso lia longo=false e fechava
// com a ficha. Agora qualquer pointerup (velho ou novo) vê foeGesto.abriu e NÃO faz o toque curto.
// Limiar de movimento (10px) cancela se arrastar. Toque CURTO: alvo (se armando) ou ficha da unidade.
function ligarFoe(el){
  const uid=el.dataset.uid;
  el.addEventListener('pointerdown',e=>{
    foeGesto={uid, t:Date.now(), x:e.clientX, y:e.clientY, moved:false, abriu:false};
    clearTimeout(foeTimer);
    foeTimer=setTimeout(()=>{ if(foeGesto&&foeGesto.uid===uid&&!foeGesto.moved){ foeGesto.abriu=true; abrirKit(uid); } }, 420);
  });
  el.addEventListener('pointermove',e=>{
    if(foeGesto&&(Math.abs(e.clientX-foeGesto.x)>10||Math.abs(e.clientY-foeGesto.y)>10)){ foeGesto.moved=true; clearTimeout(foeTimer); }
  });
  el.addEventListener('pointerup',()=>{
    clearTimeout(foeTimer);
    const g=foeGesto; foeGesto=null;
    if(!g||g.uid!==uid) return;
    if(g.abriu) return;                    // o toque longo já abriu o kit — soltar não fecha nada
    if(g.moved) return;                    // arrastou — gesto cancelado
    if(Date.now()-g.t>=420) return;        // segurou o bastante (o timer pode não ter disparado) — já é consulta
    if(el.dataset.target){ alvo(uid); }    // toque curto com arma em curso: escolhe alvo (§328: NÃO abre o quadro)
    else if(!armado){ abrirInspec(uid); }   // §328: toque curto solto (sem arma) → QUADRO DE INSPEÇÃO
  });
  el.addEventListener('pointercancel',()=>{ clearTimeout(foeTimer); foeGesto=null; });
  el.addEventListener('pointerleave',()=>{ clearTimeout(foeTimer); });   // leave não zera foeGesto: o up decide
}

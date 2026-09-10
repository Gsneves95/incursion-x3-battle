// ui/campo.js — as bandas da fileira (§214): retrato (nome inteiro + vida + efeitos), os 4 tiles
// de habilidade, a ficha da unidade, e a consulta do KIT inimigo por TOQUE LONGO no retrato.

// §266 — a passiva SE ANUNCIA quando age. O motor (infoPassiva) diz o que está modificando AGORA; a UI
// só acende o "P" e mostra o valor/fonte. `armado`/`alvos` são globais da sessão (view.js): quando o
// jogador arma um golpe, passamos o alvo candidato p/ as passivas SÓ-ALVO acenderem no alvo que casa (§266).
function _armadoCtx(){
  if(typeof armado==='undefined' || !armado) return null;
  const al=(typeof alvos!=='undefined'&&alvos)?alvos.map(x=>x.uid):[];
  return { uid:armado.uid, alvos:al };
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
// §266 — a MAGNITUDE numérica de um efeito (o número que muda o dano). null = efeito sem número (atordoado…).
// adormecido é +8 FIXO (regra do motor, não um campo `v`); o dono pediu esse explicitamente.
function magEfeito(e){
  if(e.type==='dmgUp'||e.type==='vulneravel'||e.type==='regen') return e.v!=null?('+'+e.v):null;
  if(e.type==='dmgDown'||e.type==='dmgReduction') return e.v!=null?('−'+e.v):null;
  if(e.type==='adormecido') return '+8';
  return null;
}
function efeitosHTML(u){
  const itens=[];
  for(const e of u.efeitos){const s=SYM[e.type]; if(!s)continue; itens.push({s,mag:magEfeito(e),dur:e.dur>90?'∞':e.dur,key:e.type});}
  for(const d of u.dots) itens.push({s:['✹','dot',H(d.nome)],mag:null,dur:d.dur,key:d.nome,dot:true});
  // ADAPTATIVO (§266): com ≤3 efeitos os chips crescem e mostram o NÚMERO; com 4+ colapsam pro chip de 14px
  // + turnos (o número volta pro toque) — assim o pior caso de 6 continua cabendo no talo de 92px.
  const largo = itens.length<=3;
  const chip=(it)=>{
    const attr = it.dot?`data-dot="${u.uid}|${it.s[2]}"`:`data-ef="${u.uid}|${it.key}"`;
    if(largo && it.mag) return `<button class="effect effect--${it.s[1]} effect--mag" ${attr}><span class="effect__g">${it.s[0]}</span><span class="effect__v">${it.mag}</span><span class="effect__turns effect__turns--in">${it.dur}</span></button>`;
    return `<button class="effect effect--${it.s[1]}" ${attr}><div class="slot" data-slot="effect-${it.dot?'dot':it.key}"><span class="effect__g">${it.s[0]}</span></div><div class="effect__turns">${it.dur}</div></button>`;
  };
  if(itens.length>FX_MAX) return itens.slice(0,FX_MAX-1).map(chip).join('')+`<span class="fxmore" data-ficha="${u.uid}">+${itens.length-FX_MAX+1}</span>`;
  return itens.map(chip).join('');
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
      <div class="portrait__nome" title="${H(u.nome)}">${H(metaComb(u.key).curto)}</div>
      <div class="effects">${u.vivo?efeitosHTML(u):''}</div>
      <div class="${hpcls.join(' ')}">
        ${u.vivo?`<div class="hp__fill" style="width:${pct}%"></div>`:''}
        ${u.shield?`<div class="hp__shield" style="width:${Math.min(100,u.shield/u.maxHp*100)}%"></div>`:''}
        <div class="hp__label">${u.hp}${u.shield?' ◧'+u.shield:''}</div>
      </div>
      <div class="portrait__x"></div>
    </div></div>`;
}

/* ---------- fileira (§214): aliado (retrato + 4 tiles) x inimigo (retrato) da mesma posicao ---------- */
function filaHTML(a, e){
  // times ASSIMÉTRICOS (campanha: 3×1, 3×2, 0×3): uma banda pode não ter unidade — desenha vazia,
  // mantendo a coluna alinhada por posição sem quebrar em u.hp de unidade indefinida.
  // §239: aliado + habilidades vivem numa MOLDURA (.brow__unit) — uma placa que passa por baixo do
  // retrato e se estende atrás dos 4 tiles, unindo-os ("este deus e o que ele pode fazer"). As
  // habilidades COLAM no retrato (esquerda, sem centralizar). O inimigo fica FORA da moldura, à direita
  // (§214 o pôs lá para o polegar). A posição não muda com o turno — só a ênfase (item 4).
  return `<div class="brow">
    <div class="brow__unit">
      <div class="brow__ally">${a?retrato(a,false):''}</div>
      <div class="brow__tiles">${a?tilesHTML(a):''}</div>
    </div>
    <div class="brow__enemy">${e?retrato(e,true):''}</div>
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
    // TODA habilidade é TOCÁVEL PARA LER (§238): nunca `disabled`. data-arma=1 arma; 0 só lê (mostra o
    // que faz + POR QUE está indisponível, no rodapé). Ler nunca custa nada (invariante do projeto).
    return `<button class="${cls.join(' ')}" data-sk="${u.uid}|${a.slot}" data-arma="${clicavel?1:0}">
      <span class="skill__disc" style="border-color:${anel};--anel:${anel}">
        ${slot('skill-'+u.key+'-'+a.slot,'',null,0,true)}
        <span class="skill__mono" style="color:${anel}">${H(mono(a))}</span>
        <span class="skill__cd">${cd||''}</span>
        <span class="skill__lock">⊘</span>
        <span class="skill__na">∅</span>
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

/* ---------- eventos do campo (tiles, alvo, retrato, toque longo do inimigo, passiva, efeitos) ---------- */
function ligarCampo(){
  // TILES de habilidade (aliado): data-arma=1 ARMA; 0 só LÊ (§238 item 3 — tocar para ler nunca custa).
  stage.querySelectorAll('.skill').forEach(b=>{
    b.onclick=()=>{ const[uid,slot]=b.dataset.sk.split('|');
      if(b.dataset.arma==='1'){ peekKit=null; armar(uid,slot); }
      else lerHabilidade(uid,slot); };});
  // ALVO aliado (cura/buff): retrato aliado marcado como alvo — toque escolhe
  stage.querySelectorAll('.portrait[data-target]:not([data-foe])').forEach(el=>el.onclick=()=>alvo(el.dataset.uid));
  // retrato aliado comum: ficha da unidade
  stage.querySelectorAll('.portrait:not([data-foe]):not([data-target])').forEach(el=>{
    el.onclick=ev=>{ev.stopPropagation();const u=todas().find(x=>x.uid===el.dataset.uid); if(u)ficha(u);};});
  // retrato INIMIGO: TOQUE LONGO abre o kit; toque curto = alvo (se for) ou ficha (§214 item 8)
  stage.querySelectorAll('.portrait[data-foe]').forEach(el=>ligarFoe(el));
  // aba de RECOLHER o painel (sempre visivel)
  const tab=stage.querySelector('.panel__tab'); if(tab)tab.onclick=()=>{ painelRecolhido=!painelRecolhido; render(); };
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
  stage.querySelectorAll('[data-ef]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const[uid,tp]=b.dataset.ef.split('|');const u=todas().find(x=>x.uid===uid);
    const e=u.efeitos.find(x=>x.type===tp),s=SYM[tp];
    detalhe={nome:s[2].toUpperCase(),chave:'effect-'+tp,glifo:s[0],
      meta:u.nome.toUpperCase()+' · '+(e.dur>90?'PERMANENTE':e.dur+' TURNO(S)')+(e.v?' · VALOR '+e.v:''),
      texto:s[3],classes:'AS DURAÇÕES DESCONTAM NO FIM DO TURNO DE QUEM CARREGA O EFEITO'};
    peekKit=null; render();});
  stage.querySelectorAll('[data-dot]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const[uid,nm]=b.dataset.dot.split('|');const u=todas().find(x=>x.uid===uid);
    const d=u.dots.find(x=>x.nome===nm);
    detalhe={nome:rotuloEfeito(d.nome).toUpperCase(),chave:'effect-dot',glifo:'✹',
      meta:u.nome.toUpperCase()+' · '+d.v+'/TURNO · '+d.dur+' TURNO(S)',
      texto:'Dano contínuo. Conta no início do turno de quem sofre, ANTES de ele agir — pode matar sem que a unidade jogue.',
      classes:'DANO PURO · IGNORA REDUÇÃO E ESCUDO · ATRAVESSA INVULNERABILIDADE'};
    peekKit=null; render();});
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
    if(el.dataset.target){ alvo(uid); }    // toque curto com arma em curso: escolhe alvo
    else { const u=todas().find(x=>x.uid===uid); if(u)ficha(u); }   // toque curto solto: ficha
  });
  el.addEventListener('pointercancel',()=>{ clearTimeout(foeTimer); foeGesto=null; });
  el.addEventListener('pointerleave',()=>{ clearTimeout(foeTimer); });   // leave não zera foeGesto: o up decide
}

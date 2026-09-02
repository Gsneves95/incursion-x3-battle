// ui/campo.js — as bandas da fileira (§214): retrato (nome inteiro + vida + efeitos), os 4 tiles
// de habilidade, a ficha da unidade, e a consulta do KIT inimigo por TOQUE LONGO no retrato.
function efeitosHTML(u){
  const out=[];
  for(const e of u.efeitos){const s=SYM[e.type]; if(!s)continue;
    out.push(`<button class="effect effect--${s[1]}" data-ef="${u.uid}|${e.type}">
      <div class="slot" data-slot="effect-${e.type}"><span class="effect__g">${s[0]}</span></div>
      <div class="effect__turns">${e.dur>90?'∞':e.dur}</div></button>`);}
  for(const d of u.dots)
    out.push(`<button class="effect effect--dot" data-dot="${u.uid}|${H(d.nome)}">
      <div class="slot" data-slot="effect-dot"><span class="effect__g">✹</span></div>
      <div class="effect__turns">${d.dur}</div></button>`);
  if(out.length>FX_MAX)
    return out.slice(0,FX_MAX-1).join('')+`<span class="fxmore" data-ficha="${u.uid}">+${out.length-FX_MAX+1}</span>`;
  return out.join('');
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
  return `<div class="${upcls.join(' ')}">
    <div class="${cls.join(' ')}" data-uid="${u.uid}" ${alvo?'data-target="1"':''} ${inimigo?'data-foe="1"':''}>
      ${slot('god-'+u.key, ini(u.nome), COR(u.elem), 30)}
      <span class="portrait__elem" style="background:${COR(u.elem)}"></span>
      ${g.passiva?`<button class="portrait__pas ${g.passiva.inerte?'inert':''}" data-pas="${u.uid}">P</button>`:''}
      ${inimigo&&u.vivo?`<span class="portrait__ask" title="segure para ver o kit">?</span>`:''}
      <div class="effects">${u.vivo?efeitosHTML(u):''}</div>
      <div class="portrait__x"></div>
    </div>
    <div class="portrait__nome" title="${H(u.nome)}">${H(u.nome)}</div>
    <div class="${hpcls.join(' ')}">
      ${u.vivo?`<div class="hp__fill" style="width:${pct}%"></div>`:''}
      ${u.shield?`<div class="hp__shield" style="width:${Math.min(100,u.shield/u.maxHp*100)}%"></div>`:''}
      <div class="hp__label">${u.hp}${u.shield?' ◧'+u.shield:''}</div>
    </div></div>`;
}

/* ---------- fileira (§214): aliado (retrato + 4 tiles) x inimigo (retrato) da mesma posicao ---------- */
function filaHTML(a, e){
  // times ASSIMÉTRICOS (campanha: 3×1, 3×2, 0×3): uma banda pode não ter unidade — desenha vazia,
  // mantendo a coluna alinhada por posição sem quebrar em u.hp de unidade indefinida.
  return `<div class="brow">
    <div class="brow__ally">${a?retrato(a,false):''}</div>
    <div class="brow__tiles">${a?tilesHTML(a):''}</div>
    <div class="brow__enemy">${e?retrato(e,true):''}</div>
  </div>`;
}
function tilesHTML(u){
  if(!u.vivo)return '';
  const acs=acoesDe(st,u);
  return acs.map(a=>{
    const cd=u.cd[a.slot]||0;
    const semOrbe=!a.disponivel&&cd===0&&a.motivo==='sem_energia';
    const semAlvo=!a.disponivel&&cd===0&&a.motivo==='sem_alvo';
    const travada=!a.disponivel&&cd===0&&!semOrbe&&!semAlvo;   // Selado/Silencio/1x-ja-usada
    const arm=armado&&armado.uid===u.uid&&armado.slot===a.slot;
    const clicavel=a.disponivel&&podeAgir(u)&&ehMeuTurno();
    const cls=['skill']; if(a.universal)cls.push('skill--uni');
    if(clicavel)cls.push('is-ready');   // DISPONIBILIDADE = glow do anel (nao filtro na arte, §211)
    if(cd>0)cls.push('is-cooldown');
    if(travada)cls.push('is-locked');
    if(semAlvo)cls.push('is-notarget');
    if(semOrbe||!podeAgir(u)||!ehMeuTurno())cls.push('is-off');
    if(arm)cls.push('is-armed');
    cls.push('skill--'+a.slot);
    const anel=a.slot==='defesa'?'var(--ink-mute)':COR(u.elem);
    return `<button class="${cls.join(' ')}" data-sk="${u.uid}|${a.slot}" ${clicavel?'':'disabled'}>
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
  // TILES de habilidade (aliado): armar. Ao armar, some a consulta de kit.
  stage.querySelectorAll('.skill').forEach(b=>{if(b.disabled)return;
    b.onclick=()=>{peekKit=null; const[uid,slot]=b.dataset.sk.split('|');armar(uid,slot);};});
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
    detalhe={nome:g.passiva.nome.toUpperCase(),chave:'god-'+u.key,glifo:'P',cor:COR(u.elem),
      meta:u.nome.toUpperCase()+' · PASSIVA'+(g.passiva.inerte?' · INERTE':''),
      texto:g.passiva.desc,classes:'SEMPRE ATIVA · NÃO GASTA A AÇÃO · NÃO PODE SER SILENCIADA', passiva:true};
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

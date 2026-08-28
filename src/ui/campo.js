// ui/campo.js — as 3 bandas: retrato, vida, efeitos, discos, aba do inimigo, ficha.
function efeitosHTML(u){
  const out=[];
  for(const e of u.efeitos){const s=SYM[e.type]; if(!s)continue;
    out.push(`<button class="effect effect--${s[1]}" data-ef="${u.uid}|${e.type}">
      <div class="slot" data-slot="effect-${e.type}"><span class="effect__g">${s[0]}</span></div>
      <div class="effect__turns">${e.dur>90?'\u221e':e.dur}</div></button>`);}
  for(const d of u.dots)
    out.push(`<button class="effect effect--dot" data-dot="${u.uid}|${H(d.nome)}">
      <div class="slot" data-slot="effect-dot"><span class="effect__g">\u2739</span></div>
      <div class="effect__turns">${d.dur}</div></button>`);
  if(out.length>FX_MAX)
    return out.slice(0,FX_MAX-1).join('')+`<span class="fxmore" data-ficha="${u.uid}">+${out.length-FX_MAX+1}</span>`;
  return out.join('');
}

/* ---------- retrato ---------- */
function retrato(u,inimigo){
  const pct=Math.max(0,Math.min(100,u.hp/u.maxHp*100));
  const g=_catPartida()[u.key]||{};   // catálogo DA PARTIDA (deuses ∪ bestiário): criatura PvE não está em GODS
  const alvo=alvos.some(x=>x.uid===u.uid);
  const jaEscolhido=escolhidos.includes(u.uid);
  const cls=['portrait'];
  if(!u.vivo)cls.push('is-down');
  if(alvo)cls.push('is-target');
  if(jaEscolhido)cls.push('is-picked');

  if(hpAnt[u.uid]!==undefined&&hpAnt[u.uid]>u.hp)cls.push('hit');
  const hpcls=['hp']; if(!u.vivo)hpcls.push('hp--empty'); else if(u.hp<=40)hpcls.push('hp--warn');
  return `<div class="unit__portrait">
    <div class="${cls.join(' ')}" data-uid="${u.uid}" ${alvo?'data-target="1"':''}>
      ${slot('god-'+u.key, ini(u.nome), COR(u.elem), 30)}
      <span class="portrait__elem" style="background:${COR(u.elem)}"></span>
      ${g.passiva?`<button class="portrait__pas ${g.passiva.inerte?'inert':''}" data-pas="${u.uid}">P</button>`:''}
      <div class="effects">${u.vivo?efeitosHTML(u):''}</div>
      <div class="portrait__x"></div>
    </div>
    <div class="${hpcls.join(' ')}">
      ${u.vivo?`<div class="hp__fill" style="width:${pct}%"></div>`:''}
      ${u.shield?`<div class="hp__shield" style="width:${Math.min(100,u.shield/u.maxHp*100)}%"></div>`:''}
      <div class="hp__label">${u.hp}${u.shield?' \u25e7'+u.shield:''}</div>
    </div></div>`;
}

/* ---------- fileira de habilidades ---------- */
function foeAba(u){
  if(!u.vivo)return '';
  // no turno do oponente a aba dele FECHA e não abre (é assistir à digitação alheia);
  // no MEU turno ela é consultável — ler as habilidades dele é base da leitura do jogo.
  const aberta=abaFoe===u.uid&&ehMeuTurno();
  const acs=acoesDe(st,u);
  // dica de leitura: a Defesa dele em recarga significa janela de abate aberta
  const defPronta=(u.cd.defesa||0)===0;
  const painel=aberta?`<div class="foepanel">
      <span class="foepanel__lbl">consulta</span>
      ${acs.map(a=>{
        const cd=u.cd[a.slot]||0;
        return `<button class="foesk ${a.universal?'foesk--uni':''}" data-look="${u.uid}|${a.slot}"
          style="border-color:${a.slot==='defesa'?'var(--ink-mute)':COR(u.elem)}">
          ${slot('skill-'+u.key+'-'+a.slot,'',null,0,true)}
          <div class="foesk__mono" style="color:${a.slot==='defesa'?'var(--ink-dim)':COR(u.elem)}">${H(mono(a))}</div>
          <div class="foesk__cost">${foePips(a.cost)}</div>
          ${cd?`<div class="foesk__cd">${cd}</div>`:''}
        </button>`;}).join('')}
    </div>`:'';
  return painel+`<button class="foetab ${aberta?'open':''}" data-aba="${u.uid}"
    title="${aberta?'fechar':'ver'} habilidades de ${H(u.nome)}">${aberta?'\u203a':'\u2039'}
    ${!aberta&&!defPronta?'<span class="foetab__dot"></span>':''}</button>`;
}
function foePips(cost){
  const out=[];
  for(const k in cost){for(let i=0;i<cost[k];i++)
    out.push(k==='livre'?'<i class="free"></i>':`<i style="background:${COR(k)}"></i>`);}
  return out.join('');
}
function habilidades(u){
  if(!u.vivo)return `<div class="skills skills--empty"></div>`;
  const acs=acoesDe(st,u);
  return `<div class="skills">`
    +acs.map(a=>{
    const cd=u.cd[a.slot]||0;
    const semOrbe=!a.disponivel&&cd===0&&a.motivo==='sem_energia';
    const travada=!a.disponivel&&cd===0&&!semOrbe;
    const arm=armado&&armado.uid===u.uid&&armado.slot===a.slot;
    // modo espectador (F0.7): no turno do oponente meus discos ficam apagados e sem toque
    const clicavel=a.disponivel&&podeAgir(u)&&ehMeuTurno();
    const cls=['skill']; if(a.universal)cls.push('skill--uni');
    if(cd>0)cls.push('is-cooldown');
    if(travada)cls.push('is-locked');
    if(semOrbe||!podeAgir(u)||!ehMeuTurno())cls.push('is-off');
    if(arm)cls.push('is-armed');
    cls.push('skill--'+a.slot);
    const anel=a.slot==='defesa'?'var(--ink-mute)':COR(u.elem);
    return `<button class="${cls.join(' ')}" data-sk="${u.uid}|${a.slot}" ${clicavel?'':'disabled'}>
      <span class="skill__disc" style="border-color:${anel}">
        ${slot('skill-'+u.key+'-'+a.slot,'',null,0,true)}
        <span class="skill__mono" style="color:${anel}">${H(mono(a))}</span>
        <span class="skill__cd">${cd||''}</span>
        <span class="skill__lock">\u2298</span>
      </span>
      ${pipsMini(a.cost, st.lados[u.lado].orbs)}
    </button>`;
  }).join('')+`</div>`;
}
function ficha(u){
  const g=_catPartida()[u.key]||{},lin=[];
  if(g.passiva)lin.push(`${g.passiva.nome}: ${g.passiva.desc}`);
  for(const e of u.efeitos){const s=SYM[e.type];if(s)lin.push(`${s[2]}${e.v?' '+e.v:''} (${e.dur>90?'permanente':e.dur+'t'})`);}
  for(const d of u.dots)lin.push(`${rotuloEfeito(d.nome)} ${d.v}/t (${d.dur}t)`);
  for(const k of['habilidade','milagre','defesa'])if(u.cd[k]>0)lin.push(`${k} em recarga ${u.cd[k]}t`);
  if(u.shield)lin.push(`escudo ${u.shield}`);
  detalhe={nome:u.nome.toUpperCase(),chave:'god-'+u.key,glifo:ini(u.nome),cor:COR(u.elem),
    meta:`${u.hp}/${u.maxHp} \u00b7 ${ELAB[u.elem]}`,
    texto:lin.join('  \u00b7  '),
    classes:`${u.classe} \u00b7 ${u.funcao} \u00b7 ${u.faccao||g.faccao||'PvE'}`.toUpperCase()};
  armado=null;alvos=[];escolhidos=[];render();
}

/* ---------- eventos do campo (discos, aba/consulta do inimigo, retrato, passiva, efeitos) ---------- */
function ligarCampo(){
  stage.querySelectorAll('.skill').forEach(b=>{if(b.disabled)return;
    b.onclick=()=>{const[uid,slot]=b.dataset.sk.split('|');armar(uid,slot);};});
  stage.querySelectorAll('[data-aba]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    if(!ehMeuTurno())return;   // a aba do oponente não abre no turno dele
    abaFoe=abaFoe===b.dataset.aba?null:b.dataset.aba; render();});
  stage.querySelectorAll('[data-look]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const[uid,slotk]=b.dataset.look.split('|');
    const u=todas().find(x=>x.uid===uid);
    const a=acoesDe(st,u).find(x=>x.slot===slotk); if(!a)return;
    const cd=u.cd[slotk]||0;
    peek=b.dataset.look;
    detalhe={nome:a.nome.toUpperCase(),chave:'skill-'+u.key+'-'+slotk,glifo:mono(a),cor:COR(u.elem),redondo:true,
      pips:pipsDetalhe(a.cost),
      meta:u.nome.toUpperCase()+' · '+(cd?'PRONTA EM '+cd+' TURNO(S)':'PRONTA AGORA'),
      texto:a.desc,classes:classesTxt(u,a)+' · INIMIGA — CONSULTA'};
    armado=null;alvos=[];escolhidos=[];render();});
  stage.querySelectorAll('[data-target]').forEach(el=>el.onclick=()=>alvo(el.dataset.uid));
  stage.querySelectorAll('.portrait').forEach(el=>{
    if(el.dataset.target)return;
    el.onclick=ev=>{ev.stopPropagation();
      const u=todas().find(x=>x.uid===el.dataset.uid); if(u)ficha(u);};});
  stage.querySelectorAll('[data-ficha]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const u=todas().find(x=>x.uid===b.dataset.ficha); if(u)ficha(u);});
  stage.querySelectorAll('[data-pas]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const u=todas().find(x=>x.uid===b.dataset.pas),g=_catPartida()[u.key]||{};
    if(!g.passiva)return;
    detalhe={nome:g.passiva.nome.toUpperCase(),chave:'god-'+u.key,glifo:'P',cor:COR(u.elem),
      meta:u.nome.toUpperCase()+' · PASSIVA'+(g.passiva.inerte?' · INERTE':''),
      texto:g.passiva.desc,classes:'SEMPRE ATIVA · NÃO GASTA A AÇÃO · NÃO PODE SER SILENCIADA'};
    armado=null;alvos=[];escolhidos=[];render();});
  stage.querySelectorAll('[data-ef]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const[uid,tp]=b.dataset.ef.split('|');const u=todas().find(x=>x.uid===uid);
    const e=u.efeitos.find(x=>x.type===tp),s=SYM[tp];
    detalhe={nome:s[2].toUpperCase(),chave:'effect-'+tp,glifo:s[0],
      meta:u.nome.toUpperCase()+' · '+(e.dur>90?'PERMANENTE':e.dur+' TURNO(S)')+(e.v?' · VALOR '+e.v:''),
      texto:s[3],classes:'AS DURAÇÕES DESCONTAM NO FIM DO TURNO DE QUEM CARREGA O EFEITO'};
    render();});
  stage.querySelectorAll('[data-dot]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const[uid,nm]=b.dataset.dot.split('|');const u=todas().find(x=>x.uid===uid);
    const d=u.dots.find(x=>x.nome===nm);
    detalhe={nome:rotuloEfeito(d.nome).toUpperCase(),chave:'effect-dot',glifo:'✹',
      meta:u.nome.toUpperCase()+' · '+d.v+'/TURNO · '+d.dur+' TURNO(S)',
      texto:'Dano contínuo. Conta no início do turno de quem sofre, ANTES de ele agir — pode matar sem que a unidade jogue.',
      classes:'DANO PURO · IGNORA REDUÇÃO E ESCUDO · ATRAVESSA INVULNERABILIDADE'};
    render();});
  // resumo do turno (F0.7): some ao PRIMEIRO toque em qualquer coisa. Só armo o
  // ouvinte quando há resumo à mostra; captura antes do handler do alvo, que então
  // redesenha já sem o resumo.
  if(resumoTurno) stage.addEventListener('pointerdown',()=>{ resumoTurno=null; },{once:true,capture:true});
}

/* ===================================================================
   CAMADA DE VISÃO — desenha a tela de batalha a partir do estado.
   Nada aqui altera regras; toda mutação passa pelo motor.
   =================================================================== */
const EVAR = {Tempestade:'--e-Tempestade',Umbra:'--e-Umbra','Maré':'--e-Mare',
  Aurora:'--e-Aurora',Chama:'--e-Chama',Verdejante:'--e-Verdejante'};
const COR = k => `var(${EVAR[k]})`;
const ELAB = {Tempestade:'TEMPESTADE',Umbra:'UMBRA','Maré':'MARÉ',Aurora:'AURORA',Chama:'CHAMA',Verdejante:'VERDEJANTE'};
const SLOTLAB = {basico:'básico',habilidade:'habilidade',milagre:'milagre',defesa:'defesa'};
const GLIFO = {basico:'I',habilidade:'II',milagre:'III',defesa:'\u25c7'};

const SYM = {
  atordoado:['\u2715','debuff','Atordoado','A unidade perde a ação inteira. Ainda gera energia.'],
  adormecido:['Z','debuff','Adormecido','Perde a ação, recebe +8 de dano e não gera energia. Acorda ao sofrer dano de Habilidade ou Milagre — Básico e dano contínuo não acordam.'],
  submerso:['\u2248','debuff','Submerso','Fora do combate: não age, não pode ser alvo, não sofre dano contínuo e não gera energia.'],
  taunt:['\u25ce','debuff','Provocado','Só pode atacar quem provocou. Se o provocador ficar Invulnerável, o efeito é suspenso.'],
  silenceClass:['\u2298','debuff','Classe travada','As habilidades da classe indicada ficam indisponíveis. Básico e Defesa continuam liberados.'],
  lockSkill:['\u229f','debuff','Habilidade travada','A entrada indicada fica indisponível. Não é silêncio — as outras seguem liberadas.'],
  dmgDown:['\u25bc','debuff','Dano reduzido','Reduz o dano que esta unidade CAUSA. Soma com outros do mesmo tipo.'],
  encharcado:['\u224b','debuff','Encharcado','Recebe +5 de dano de Maré e Tempestade, e serve de gatilho: vários kits têm bônus contra Encharcados.'],
  noHeal:['\u2296','debuff','Sem cura','Bloqueia cura e regeneração.'],
  dmgUp:['\u25b2','buff','Dano aumentado','Aumenta o dano que esta unidade CAUSA. Soma com outros do mesmo tipo.'],
  dmgReduction:['\u2b13','buff','Redução de dano','Subtrai um valor fixo de cada golpe, aplicado ANTES do escudo. Não soma com outra redução — vale a maior.'],
  invulneravel:['\u25c8','buff','Invulnerável','Imune a dano novo e a efeitos novos. Continua podendo ser alvo. Dano contínuo já aplicado ainda conta.'],
  controlImmune:['\u229b','buff','Imune a controle','Ignora atordoar, adormecer, provocar, silenciar, submergir e dominar.'],
  regen:['+','buff','Regeneração','Cura no início do turno. Não soma com outra regeneração — vale a maior.'],
};

const TURNO_SEG = 60;
let st=null, tela='pick', pick=[[],[]], armado=null, alvos=[], escolhidos=[],
    ov=null, detalhe=null, hpAnt={}, relogio=TURNO_SEG, tick=null, peek=null, abaFoe=null, convAlvo=null, menuAberto=false;

const stage = document.getElementById('stage');
const H = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- escala do canvas fixo ---------- */
function fit(){
  const s = Math.min(innerWidth/926, innerHeight/428);
  stage.style.transform = 'scale('+s+')';
}
addEventListener('resize',fit); addEventListener('orientationchange',fit);

/* ---------- encaixes de arte ---------- */
function slot(chave,glifo,cor,tam,redondo){
  const m=/^god-(.+)$/.exec(chave);
  const arte=m&&IMG[m[1]];
  return `<div class="slot${redondo?' slot--round':''}" data-slot="${H(chave)}">`+
    (arte?`<img src="${arte}" alt="">`
     :(glifo?`<span class="slot__glyph" style="font-size:${tam||16}px;color:${cor||'var(--ink-dim)'}">${H(glifo)}</span>`:''))+
    `</div>`;
}
const ini = n => n.replace(/[^A-Za-zÀ-ÿ]/g,'').slice(0,2).toUpperCase();
const MONO_FIXO={defesa:'DEF'};
function mono(a){
  if(MONO_FIXO[a.slot])return MONO_FIXO[a.slot];
  const p=a.nome.split(/[\s\u2014-]+/).filter(x=>x.length>2);
  if(p.length>=2)return (p[0][0]+p[1][0]+(p[2]?p[2][0]:p[1][1])).toUpperCase();
  return a.nome.replace(/[^A-Za-zÀ-ÿ]/g,'').slice(0,3).toUpperCase();
}

/* ---------- custo ---------- */
function planoPag(l,cost){
  const o={...l.orbs},p={}; ELEMS.forEach(e=>p[e]=0);
  const es={...cost}; let lv=es.livre||0; delete es.livre;
  for(const k in es){p[k]+=es[k];o[k]-=es[k];}
  while(lv>0){const a=ELEMS.slice().sort((x,y)=>o[y]-o[x])[0]; if(!a||o[a]<=0)break; p[a]++;o[a]--;lv--;}
  return p;
}
function pipsMini(cost,orbs){
  const out=[]; const disp=orbs?{...orbs}:null;
  let sobra=disp?ELEMS.reduce((a,e)=>a+disp[e],0):0;
  for(const k in cost){ if(k==='livre')continue;
    for(let i=0;i<cost[k];i++){
      const paga=!disp||disp[k]>0; if(disp&&paga){disp[k]--;sobra--;}
      out.push(`<i class="${paga?'':'miss'}" style="background:${COR(k)}"></i>`);}}
  for(let i=0;i<(cost.livre||0);i++){
    const paga=!disp||sobra>0; if(disp&&paga)sobra--;
    out.push(`<i class="free ${paga?'':'miss'}"></i>`);}
  return out.length?`<div class="skill__cost">${out.join('')}</div>`
    :`<div class="skill__cost gratis"><span>GRÁTIS</span></div>`;
}
function pipsDetalhe(cost){
  const out=[];
  for(const k in cost){for(let i=0;i<cost[k];i++)
    out.push(k==='livre'?'<span class="cost__pip cost__pip--empty"></span>'
      :`<span class="cost__pip" style="background:${COR(k)}"></span>`);}
  return out.length?`<div class="cost">${out.join('')}</div>`
    :`<div class="cost"><span class="cost__none">SEM CUSTO</span></div>`;
}
const ALVO_TXT={'':'sem alvo',inimigo:'alvo único','2inimigos':'dois inimigos',
  aliado:'1 aliado','2aliados':'dois aliados','aliado+inimigo':'aliado e inimigo',
  todosInimigos:'área'};
function classesTxt(u,a){
  const t=[a.classe||u.classe];
  const ps=(a.passos||[]).join('+');
  t.push(ALVO_TXT[ps==='inimigo+inimigo'?'2inimigos':ps==='aliado+aliado'?'2aliados':ps]
    || (a.alvo==='todosInimigos'?'área':ps||'sem alvo'));
  if(a.slot==='milagre')t.push('milagre');
  if(a.slot==='defesa')t.push('universal');
  return t.join(' \u00b7 ').toUpperCase();
}

/* ---------- efeitos ---------- */
const FX_MAX=5;
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
  const g=GODS[u.key];
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
      <button class="portrait__pas ${g.passiva.inerte?'inert':''}" data-pas="${u.uid}">P</button>
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
  const aberta=abaFoe===u.uid;
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
    const semOrbe=!a.disponivel&&cd===0&&/orbes/.test(a.motivo||'');
    const travada=!a.disponivel&&cd===0&&!semOrbe;
    const arm=armado&&armado.uid===u.uid&&armado.slot===a.slot;
    const clicavel=a.disponivel&&podeAgir(u);
    const cls=['skill']; if(a.universal)cls.push('skill--uni');
    if(cd>0)cls.push('is-cooldown');
    if(travada)cls.push('is-locked');
    if(semOrbe||!podeAgir(u))cls.push('is-off');
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

/* ---------- painel de detalhe ---------- */
function detalheHTML(){
  if(detalhe){
    return `<div class="detail">
      <div class="detail__icon ${detalhe.redondo?'detail__icon--skill':''}"
        ${detalhe.redondo?`style="border-color:${detalhe.cor||'#3a3358'}"`:''}>${
        slot(detalhe.chave||'detail',detalhe.glifo||'',detalhe.cor,20,detalhe.redondo)}</div>
      <div class="detail__body">
        <div class="detail__head"><div class="detail__name">${H(detalhe.nome)}</div>
          ${detalhe.pips||''}${detalhe.meta?`<div class="detail__sep"></div><div class="detail__cd">${H(detalhe.meta)}</div>`:''}</div>
        <div class="detail__text">${H(detalhe.texto)}</div>
        <div class="detail__classes">${H(detalhe.classes||'')}</div>
      </div></div>`;
  }
  if(armado){
    const u=st.lados[st.ativo].units.find(x=>x.uid===armado.uid);
    const a=acoesDe(st,u).find(x=>x.slot===armado.slot);
    const modo=a.alterna?(u.modo===0?' \u2014 ANEL':' \u2014 MANTO'):'';
    const falta=faltamAlvos();
    const passoAtual=armado.passos[escolhidos.length];
    return `<div class="detail">
      <div class="detail__icon detail__icon--skill" style="border-color:${a.slot==='defesa'?'var(--ink-mute)':COR(u.elem)}">${
        slot('skill-'+u.key+'-'+a.slot,mono(a),a.slot==='defesa'?'var(--ink-dim)':COR(u.elem),16,true)}</div>
      <div class="detail__body">
        <div class="detail__head"><div class="detail__name">${H(a.nome)}${modo}</div>
          ${pipsDetalhe(a.cost)}<div class="detail__sep"></div>
          <div class="detail__cd">${H(u.nome.toUpperCase())} \u00b7 ${a.cd?'RECARGA '+a.cd:'SEM RECARGA'}</div></div>
        <div class="detail__text">${H(a.desc)}</div>
        <div class="detail__classes">${classesTxt(u,a)}</div>
      </div>
      <div class="detail__act">
        ${falta>0
          ? `<button class="b b--wait" disabled>${
              armado.passos.length>1
                ? `<span>Alvo ${escolhidos.length+1}/${armado.passos.length}</span><span class="b__sub">${passoAtual==='aliado'?'aliado':'inimigo'}</span>`
                : `<span>${passoAtual==='aliado'?'Toque o aliado':'Toque o alvo'}</span>`}</button>`
          : `<button class="b b--ok b--md" id="bconf">Confirmar</button>`}
        <button class="b b--quiet b--md" id="bcanc">Cancelar</button>
      </div></div>`;
  }
  const ult=st.log.slice(-2).reverse();
  return `<div class="detail">
    <div class="detail__icon">${slot('detail','\u2637','var(--ink-mute)',20)}</div>
    <div class="detail__body">
      <div class="detail__head"><div class="detail__name">ÚLTIMOS EVENTOS</div>
        <div class="detail__sep"></div><div class="detail__cd">TURNO ${st.turno}</div></div>
      <div class="detail__text detail__log">${ult.map(r=>`<b>${r.turno}</b>${H(r.msg)}`).join('<br>')||'\u2014'}</div>
      <div class="detail__classes">TOQUE NUMA HABILIDADE PARA VER O QUE ELA FAZ \u00b7 NO RETRATO PARA A FICHA DA UNIDADE</div>
    </div></div>`;
}

/* ---------- topo ---------- */
function topoHTML(){
  const l=st.lados[st.ativo];
  let plano=null;
  if(armado){const u=l.units.find(x=>x.uid===armado.uid);
    const a=acoesDe(st,u).find(x=>x.slot===armado.slot); if(a)plano=planoPag(l,a.cost);}
  else if(convAlvo)plano=planoConversao(l,convAlvo);
  const proprios=new Set(l.units.filter(u=>u.vivo).map(u=>u.elem));
  const mostrar=ELEMS.filter(e=>proprios.has(e)||l.orbs[e]>0||(plano&&plano[e]>0));
  const pills=mostrar.map(e=>{
    const n=l.orbs[e],g=plano&&plano[e]>0;
    return `<button class="energy__pill ${g?'spend':''} ${n===0?'zero':''} ${convAlvo===e?'target':''}"
      data-conv="${e}" title="${ELAB[e]}">
      <span class="energy__dot" style="background:${COR(e)}"></span><span class="energy__n">${n}</span></button>`;
  }).join('');
  const mm=Math.floor(relogio/60), ss=String(relogio%60).padStart(2,'0');
  const jog=p=>`<div class="player ${p==='enemy'?'player--enemy':''} ${(p==='enemy')===(st.ativo===0)?'':'dim'}">
      ${p==='enemy'?'':`<div class="player__avatar">${slot('player-1-avatar','I',null,14)}</div>`}
      <div class="player__meta">
        <div class="player__name">${p==='enemy'?'JOGADOR 2':'JOGADOR 1'}</div>
      </div>
      ${p==='enemy'?`<div class="player__avatar">${slot('player-2-avatar','K',null,14)}</div>`:''}
    </div>`;
  return `<header class="topbar">
    ${jog('ally')}
    <div class="turnbox">
      <div class="timer ${relogio<=10?'low':''}">
        <div class="timer__fill" style="width:${Math.round(relogio/TURNO_SEG*100)}%"></div>
        <div class="timer__label">TURNO ${st.turno}${st.turno>=30?'/40':''} \u00b7 JOGADOR ${st.ativo+1} \u00b7 ${mm}:${ss}</div>
      </div>
      <div class="energy">${pills}
        <button class="b b--sec b--sm" id="btrocar" ${l.converteu||totalOrbs(l)<CONV_CUSTO?'disabled':''}
          title="Trocar ${CONV_CUSTO} energias por 1 da sua escolha">\u21c4 Trocar</button>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:9px">
      ${jog('enemy')}
      <div class="tools">
        <button class="b b--quiet b--icon" id="blog" title="Registro">\u2261</button>
        <button class="b b--quiet b--icon" id="bmenu" title="Mais">\u22ef</button>
      </div>
    </div>
  </header>
  ${menuAberto?`<div class="menu" id="menu">
    <button class="b b--quiet b--md" id="bhelp">Como jogar</button>
    <button class="b b--danger b--md" id="bsurr">Render-se</button>
  </div>`:''}`;
}

/* ---------- render ---------- */
function render(){
  if(tela==='pick'){renderPick();return;}
  const l=st.lados[st.ativo], o=st.lados[1-st.ativo];
  const prontas=l.units.filter(u=>podeAgir(u)).length;

  stage.innerHTML = `<div class="stage__bg"></div><div class="stage__scrim"></div>
  ${topoHTML()}
  <div class="stagemark">INCURSION</div>
  <section class="team team--ally">${l.units.map(u=>`
    <article class="unit ${u.vivo&&!podeAgir(u)?'acted':''}">${retrato(u,false)}${habilidades(u)}
    </article>`).join('')}</section>
  <section class="team team--enemy">${o.units.map(u=>`
    <article class="unit--enemy">${foeAba(u)}${retrato(u,true)}</article>`).join('')}</section>
  <footer class="footer">
    ${detalheHTML()}
    <button class="b b--primary b--lg endturn" id="bend">
      <span class="endturn__l1">Encerrar turno</span>
      <span class="endturn__hint">${prontas?prontas+(prontas>1?' unidades a agir':' unidade a agir'):'todas agiram'}</span>
    </button>
  </footer>
  ${overlayHTML()}`;

  hpAnt={}; todas().forEach(u=>hpAnt[u.uid]=u.hp);
  if(peek){const el=stage.querySelector(`[data-look="${peek}"]`); if(el)el.classList.add('peek'); peek=null;}
  ligar(); fit();
}

function trocaHTML(){
  const l=st.lados[st.ativo];
  const g=convAlvo?planoConversao(l,convAlvo):null;
  const proprios=new Set(l.units.filter(u=>u.vivo).map(u=>u.elem));
  const opts=ELEMS.map(e=>{
    const alcanca=proprios.has(e)||l.orbs[e]>0;
    return `<button class="copt ${convAlvo===e?'on':''}" data-ct="${e}" ${alcanca?'':'disabled'}
      title="${alcanca?'':'nenhum deus seu usa este elemento'}">
      <span class="copt__d" style="background:${COR(e)}"></span>
      <span class="copt__n">${H(ELAB[e])}</span>
      <span class="copt__q">${l.orbs[e]}</span></button>`;}).join('');
  const troca=g?`<div class="ctrade">
      <span class="ctrade__g">${ELEMS.filter(e=>g[e]>0).map(e=>
        Array(g[e]).fill(`<i class="ctrade__p" style="background:${COR(e)}"></i>`).join('')).join('')}</span>
      <span class="ctrade__t">gasta ${CONV_CUSTO}</span>
      <span class="ctrade__a">\u2192</span>
      <span class="ctrade__t">recebe 1</span>
      <span class="ctrade__g"><i class="ctrade__p" style="background:${COR(convAlvo)}"></i></span>
    </div>`:'';
  return `<div class="ov" id="ovconv"><div class="cbox">
    <div class="cbox__h"><h2>Trocar energia</h2>
      <span>${CONV_CUSTO} quaisquer \u2192 1 \u00b7 uma vez por turno</span></div>
    <div class="cbox__b">
      <div class="cbox__lbl">O que você quer receber?</div>
      <div class="cgrid">${opts}</div>
      ${troca}
    </div>
    ${convAlvo?'':`<div class="cnote">A taxa é ruim de propósito: é saída de emergência para sorteio azarado, não engrenagem do turno. O cronômetro do turno continua correndo.</div>`}
    <div class="cbox__f">
      <button class="b b--quiet b--md" id="ctcanc">Cancelar</button>
      <button class="b b--ok b--md" id="ctok" ${g?'':'disabled'}>Confirmar troca</button>
    </div></div></div>`;
}

function overlayHTML(){
  if(ov==='conv')return trocaHTML();
  if(st.fim){
    return `<div class="ov"><div class="ovbox"><div class="result">
      <h1>${H(st.fim)}</h1><p>ENCERROU NO TURNO ${st.turno}</p>
      <button class="b b--primary b--lg" id="bnew">Nova batalha</button></div></div></div>`;
  }
  if(ov==='log'){
    return `<div class="ov"><div class="ovbox"><div class="ovh"><h2>REGISTRO</h2>
      <span class="sub">${st.log.length} EVENTOS</span>
      <span class="push"><button class="b b--quiet b--md" id="bclose">Fechar</button></span></div>
      <div class="ovb" id="logscroll">${st.log.slice(-200).map(r=>
        `<div class="log__row ${/caiu|vence|Turno|Empate|renasceu/.test(r.msg)?'hi':''}"><b>${r.turno}</b><span>${H(r.msg)}</span></div>`
      ).join('')}</div></div></div>`;
  }
  if(ov==='help'){
    return `<div class="ov"><div class="ovbox"><div class="ovh"><h2>COMO JOGAR</h2>
      <span class="sub">3V3 \u00b7 120 DE VIDA \u00b7 TURNOS ALTERNADOS</span>
      <span class="push"><button class="b b--quiet b--md" id="bclose">Fechar</button></span></div>
      <div class="ovb" style="font-size:13px;font-weight:600;line-height:1.5">
      <p style="margin:0 0 9px"><b style="color:var(--gold-text)">TURNO</b> \u2014 cada uma das suas 3 unidades faz UMA ação por turno: uma das 3 habilidades ou a Defesa. Elas resolvem uma por vez, na ordem que você escolher — e a ordem importa, porque o estado atualiza entre elas.</p>
      <p style="margin:0 0 9px"><b style="color:var(--gold-text)">ENERGIA</b> \u2014 existem 6 elementos no jogo, mas um time de 3 deuses gera no máximo 3 tipos: você recebe 1 energia por unidade viva por turno, sorteada entre os elementos do seu próprio time. Por isso o topo mostra só os tipos que te interessam — as habilidades de um deus custam o elemento dele ou energia livre, então guardar tipo alheio não serviria de nada. Perder uma unidade é perder economia, não só dano.</p>
      <p style="margin:0 0 9px"><b style="color:var(--gold-text)">CONVERSÃO</b> \u2014 toque numa pílula de energia para converter ${CONV_CUSTO} quaisquer em 1 do tipo escolhido, uma vez por turno, sem gastar a ação. A taxa é ruim de propósito: é saída de emergência para sorteio azarado, não engrenagem do turno.</p>
      <p style="margin:0 0 9px"><b style="color:var(--gold-text)">TOCAR NÃO GASTA</b> \u2014 o primeiro toque numa habilidade só mostra o que ela faz e a arma. O gasto só acontece quando você toca no alvo ou em CONFIRMAR. Pílula de custo com contorno vermelho é energia que você ainda não tem.</p>
      <p style="margin:0 0 9px"><b style="color:var(--gold-text)">DEFESA</b> \u2014 toda unidade tem. Custa 1 energia livre, recarga 4, e deixa a unidade Invulnerável por 1 turno. Gasta a ação. Dano contínuo já aplicado atravessa a Invulnerabilidade.</p>
      <p style="margin:0 0 9px"><b style="color:var(--gold-text)">EFEITOS</b> \u2014 a faixa na base de cada retrato mostra os buffs, debuffs e danos contínuos ativos naquela unidade, com o número de turnos restantes. Vale para os dois times. Toque em qualquer ícone para ler o que ele faz; toque no "P" para a passiva do deus e no retrato para a ficha completa.</p>
      <p style="margin:0 0 9px"><b style="color:var(--gold-text)">ESPIAR O INIMIGO</b> \u2014 cada unidade inimiga tem uma alça estreita ao lado do retrato. Toque para abrir as 4 habilidades dela e ver o que fazem e quantos turnos faltam de recarga. Abre uma por vez e fecha ao virar o turno. Um ponto verde na alça avisa que a Defesa daquela unidade está em recarga — ou seja, ela não pode ficar Invulnerável neste turno.</p>
      <p style="margin:0"><b style="color:var(--gold-text)">VITÓRIA</b> \u2014 derrube as 3 unidades inimigas. Se ninguém fechar até o turno 40, ganha quem tiver mais vida somada — a partir do turno 30 o relógio passa a mostrar "TURNO N/40" para avisar. Cada turno tem 60 segundos; se acabar, ele encerra sozinho.</p>
      </div></div></div>`;
  }
  if(ov==='surr'){
    return `<div class="ov"><div class="ovbox"><div class="result">
      <h1>RENDER-SE?</h1><p>O JOGADOR ${st.ativo+1} PERDE A BATALHA</p>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="b b--quiet b--md" id="bclose">Voltar</button>
        <button class="b b--danger b--md" id="bsurrok">Confirmar rendição</button></div></div></div></div>`;
  }
  return '';
}

/* ---------- SELEÇÃO / COLEÇÃO ---------- */
const POR_PAG=30;
const RMAP={}; ROSTER.forEach(e=>RMAP[e.key]=e);
const temKit=k=>!!GODS[k];
let pagina=0, filtro=0, tocado=null, vez=0, tudoLiberado=false;   // abre em LIBERADOS
const FACCOES=['Grega','Nórdica','Egípcia','Japonesa','Chinesa','Hindu','Brasileira','Africana','Celta','Maia'];
const FUNCOES=['Atacante','Guardião','Suporte','Controlador','Manipulador'];
const CLASSES_G=['Físico','Mágico','Híbrido'];
const ESTADOS=[['liberados','Liberados'],['todos','Todos'],['bloqueados','Bloqueados']];
let F={estado:'liberados',faccoes:new Set(),elems:new Set(),funcoes:new Set(),classes:new Set()};
let painelFiltro=false;
function eixosAtivos(){return F.faccoes.size+F.elems.size+F.funcoes.size+F.classes.size;}
function limparFiltro(){F={estado:'liberados',faccoes:new Set(),elems:new Set(),funcoes:new Set(),classes:new Set()};}

function liberado(k){return tudoLiberado?temKit(k):!!RMAP[k].inicial;}
function jogavel(k){return liberado(k)&&temKit(k);}
function listaFiltrada(){
  return ROSTER.filter(e=>{
    if(F.estado==='liberados'&&!liberado(e.key))return false;
    if(F.estado==='bloqueados'&&liberado(e.key))return false;
    if(F.faccoes.size&&!F.faccoes.has(e.faccao))return false;
    if(F.elems.size&&!F.elems.has(e.elem))return false;
    if(F.funcoes.size&&!F.funcoes.has(e.funcao))return false;
    if(F.classes.size&&!F.classes.has(e.classe))return false;
    return true;
  }).map(e=>e.key);
}
function donoDe(k){return pick[0].includes(k)?0:pick[1].includes(k)?1:null;}

function tileHTML(k){
  const g=RMAP[k], liv=liberado(k), kit=temKit(k), dono=donoDe(k);
  const cls=['pk'];
  if(liv&&kit)cls.push('livre'); else cls.push('trancado');
  if(liv&&!kit)cls.push('semkit');
  if(dono===0)cls.push('on'); if(dono===1)cls.push('on2');
  return `<button class="${cls.join(' ')}" data-k="${k}" title="${H(g.nome)}">
    <span class="pk__p">${slot('god-'+k,ini(g.nome),liv?COR(g.elem):'#8d84ad',24)}</span>
    <span class="pk__el" style="background:${COR(g.elem)}"></span>
    ${liv?(kit?'':'<span class="pk__wip">WIP</span>'):'<span class="pk__lock">\u26bf</span>'}
    ${dono!==null?`<span class="pk__mark">${dono+1}</span>`:''}
    <span class="pk__n">${H(g.nome)}</span>
  </button>`;
}

function infoHTML(){
  if(!tocado)return F.estado==='liberados'&&!eixosAtivos()
    ? `Seus ${ROSTER.map(e=>e.key).filter(liberado).length} deuses liberados. Abra o FILTRO e escolha "Todos" para ver os ${ROSTER.length} do roster \u2014 os bloqueados mostram como desbloquear.`
    : `Toque num deus para ver quem é. Os apagados estão bloqueados \u2014 desbloqueie pela Provação ou por invocação.`;
  const g=RMAP[tocado], liv=liberado(tocado), kit=temKit(tocado), dono=donoDe(tocado);
  const base=`<b>${H(g.nome.toUpperCase())}</b> \u00b7 ${H(g.faccao)} \u00b7 ${H(ELAB[g.elem])} \u00b7 ${H(g.classe)} \u00b7 ${H(g.funcao)}`;
  if(!liv){
    const p=g.prov;
    return base+` \u2014 <i>BLOQUEADO.</i> ${p?`${H(p.nivel)} "${H(p.nome)}" (dificuldade ${p.dif}${p.req&&p.req!=='\u2014'?', requisito: '+H(p.req):''}): ${H(p.cond)}`:'Desbloqueie pela Provação dele ou por invocação.'}`;
  }
  if(!kit)return base+` \u2014 <i>kit ainda não implementado no protótipo.</i> ${GODS_FEITOS} de 100 prontos.`;
  if(dono!==null&&dono!==vez)return base+` \u2014 <i>já escolhido pelo Jogador ${dono+1}.</i>`;
  return base+` \u2014 ${H(GODS[tocado].passiva.nome)}: ${H(GODS[tocado].passiva.desc)}`;
}
const GODS_FEITOS=Object.keys(GODS).length;

function painelFiltroHTML(){
  if(!painelFiltro)return '';
  const n=listaFiltrada().length;
  const grupo=(rot,chips)=>`<div class="fgrp"><span class="fgrp__l">${rot}</span>
    <div class="fgrp__c">${chips}</div></div>`;
  const chipEstado=ESTADOS.map(([v2,rot])=>{
    const c=ROSTER.filter(e=>v2==='todos'||(v2==='liberados'?liberado(e.key):!liberado(e.key))).length;
    return `<button class="chip2 ${F.estado===v2?'on':''}" data-fe="${v2}">${rot}
      <span class="chip2__n">${c}</span></button>`;}).join('');
  const chipSet=(campo,itens,cor)=>itens.map(it=>{
    const c=ROSTER.filter(e=>e[campo==='faccoes'?'faccao':campo==='elems'?'elem':campo==='funcoes'?'funcao':'classe']===it).length;
    return `<button class="chip2 ${F[campo].has(it)?'on':''}" data-fs="${campo}|${it}">
      ${cor?`<span class="chip2__d" style="background:${COR(it)}"></span>`:''}${H(it)}
      <span class="chip2__n">${c}</span></button>`;}).join('');
  return `<div class="fpanel" id="fpanel"><div class="fbox">
    <div class="fbox__h"><h2>FILTRAR</h2>
      <span class="fbox__n"><b>${n}</b> de ${ROSTER.length} deuses</span>
      <span class="push">
        <button class="b b--quiet b--md" id="flimpar">Limpar</button>
        <button class="b b--primary b--md" id="ffechar">Pronto</button></span></div>
    <div class="fbox__b">
      ${grupo('ESTADO',chipEstado)}
      ${grupo('PANTEÃO',chipSet('faccoes',FACCOES,false))}
      ${grupo('ELEMENTO',chipSet('elems',ELEMS,true))}
      ${grupo('FUNÇÃO',chipSet('funcoes',FUNCOES,false))}
      ${grupo('CLASSE',chipSet('classes',CLASSES_G,false))}
    </div></div></div>`;
}

function renderPick(){
  const lista=listaFiltrada();
  const pags=Math.max(1,Math.ceil(lista.length/POR_PAG));
  if(pagina>=pags)pagina=pags-1;
  const fatia=lista.slice(pagina*POR_PAG,(pagina+1)*POR_PAG);
  const totalLiv=ROSTER.map(e=>e.key).filter(liberado).length;
  const pronto=pick[0].length===3&&pick[1].length===3;

  const slotsTime=p=>`<div class="tslot ${p===1?'p2':''} ${vez===p?'act':''}">
    <span class="tslot__l">J${p+1}</span>
    ${[0,1,2].map(i=>{const k=pick[p][i];
      return `<span class="tchip ${k?'full':''}" data-tira="${p}|${i}">${
        k?slot('god-'+k,ini(GODS[k].nome),COR(GODS[k].elem),13):''}</span>`;}).join('')}
  </div>`;

  stage.innerHTML=`<div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="stagemark">INCURSION</div>
  <div class="sel">
    <div class="selhead">
      <span class="selbrand">INCURSION</span>
      <span class="selturn">${pronto?'<b>TIMES PRONTOS</b>':`JOGADOR <b>${vez+1}</b> escolhe \u00b7 <b>${pick[vez].length}/3</b>`}</span>
      <div class="teams">${slotsTime(0)}${slotsTime(1)}</div>
      <button class="b b--primary b--md" id="bgo" ${pronto?'':'disabled'}>Começar</button>
    </div>
    <div class="selbody">
      <button class="b b--quiet arrow" id="bprev" ${pagina===0?'disabled':''}>\u2039</button>
      <div class="grid">${fatia.length?fatia.map(tileHTML).join('')
        :'<span style="grid-column:1/-1;text-align:center;color:var(--ink-mute);font-weight:600">Nenhum deus atende a esses critérios.</span>'}</div>
      <button class="b b--quiet arrow" id="bnext" ${pagina>=pags-1?'disabled':''}>\u203a</button>
    </div>
    <div class="selfoot">
      <button class="b b--quiet b--sm" id="bfiltro">Filtro: ${H(ESTADOS.find(e=>e[0]===F.estado)[1])}${
        eixosAtivos()?`<span class="fbtn__badge">${eixosAtivos()}</span>`:''}</button>
      <button class="b b--quiet b--sm" id="brand">Sortear</button>
      <span class="finfo">${infoHTML()}</span>
      <span class="fpage">${totalLiv}/${ROSTER.length} LIBERADOS \u00b7 PÁG ${pagina+1}/${pags}</span>
      <button class="b ${tudoLiberado?'b--sec':'b--quiet'} b--sm" id="bteste" title="afordância de protótipo">${tudoLiberado?'Teste: on':'Teste'}</button>
    </div>
  </div>
  ${painelFiltroHTML()}`;

  const q=s=>stage.querySelector(s), qq=s=>[...stage.querySelectorAll(s)];
  qq('.pk').forEach(b=>b.onclick=()=>{
    const k=b.dataset.k; tocado=k;
    if(!jogavel(k)){renderPick();return;}
    const dono=donoDe(k);
    if(dono===vez){pick[vez]=pick[vez].filter(x=>x!==k);renderPick();return;}
    if(dono!==null){renderPick();return;}
    if(pick[vez].length>=3){
      if(pick[1-vez].length<3){vez=1-vez;}
      else{renderPick();return;}
    }
    if(pick[vez].length<3)pick[vez].push(k);
    if(pick[vez].length===3&&pick[1-vez].length<3)vez=1-vez;
    renderPick();});
  qq('[data-tira]').forEach(el=>el.onclick=()=>{
    const [p,i]=el.dataset.tira.split('|').map(Number);
    vez=p;
    if(pick[p][i]){tocado=pick[p][i];pick[p].splice(i,1);}
    renderPick();});
  q('#bprev').onclick=()=>{pagina--;renderPick();};
  q('#bnext').onclick=()=>{pagina++;renderPick();};
  q('#bfiltro').onclick=()=>{painelFiltro=true;renderPick();};
  const fp=q('#fpanel');
  if(fp){
    fp.onclick=ev=>{if(ev.target===fp){painelFiltro=false;renderPick();}};
    qq('[data-fe]').forEach(b=>b.onclick=()=>{F.estado=b.dataset.fe;pagina=0;renderPick();});
    qq('[data-fs]').forEach(b=>b.onclick=()=>{
      const [campo,it]=b.dataset.fs.split('|');
      F[campo].has(it)?F[campo].delete(it):F[campo].add(it);
      pagina=0;renderPick();});
    q('#flimpar').onclick=()=>{limparFiltro();pagina=0;renderPick();};
    q('#ffechar').onclick=()=>{painelFiltro=false;renderPick();};
  }
  q('#bteste').onclick=()=>{tudoLiberado=!tudoLiberado;pagina=0;
    if(!tudoLiberado)pick=pick.map(p=>p.filter(jogavel));
    renderPick();};
  q('#brand').onclick=()=>{
    const pool=ROSTER.map(e=>e.key).filter(jogavel);
    for(const p of[0,1]){const c=[...pool].filter(k=>!pick[1-p].includes(k));pick[p]=[];
      while(pick[p].length<3&&c.length)pick[p].push(c.splice(Math.floor(Math.random()*c.length),1)[0]);}
    vez=0;renderPick();};
  q('#bgo').onclick=()=>{
    if(!(pick[0].length===3&&pick[1].length===3))return;
    st=novoEstado(pick[0],pick[1],Math.floor(Math.random()*1e6));
    tela='batalha';armado=null;alvos=[];escolhidos=[];detalhe=null;abaFoe=null;convAlvo=null;
    iniciarRelogio();render();};
  fit();
}

/* ---------- relógio de turno ---------- */
function iniciarRelogio(){
  relogio=TURNO_SEG;
  if(tick)clearInterval(tick);
  tick=setInterval(()=>{
    // o cronômetro NÃO pausa por sobreposição: pausar seria explorável
    if(tela!=='batalha'||st.fim){return;}
    relogio--;
    if(relogio<=0){encerrarTurno();return;}
    const t=stage.querySelector('.timer'); const f=stage.querySelector('.timer__fill');
    const lb=stage.querySelector('.timer__label');
    if(f)f.style.width=Math.round(relogio/TURNO_SEG*100)+'%';
    if(t)t.classList.toggle('low',relogio<=10);
    if(lb)lb.textContent=`TURNO ${st.turno}${st.turno>=30?'/40':''} \u00b7 JOGADOR ${st.ativo+1} \u00b7 0:${String(relogio).padStart(2,'0')}`;
  },1000);
}

/* ---------- eventos ---------- */
function todas(){return st.lados.flatMap(l=>l.units);}
function ligar(){
  const q=s=>stage.querySelector(s);
  stage.querySelectorAll('.skill').forEach(b=>{if(b.disabled)return;
    b.onclick=()=>{const[uid,slot]=b.dataset.sk.split('|');armar(uid,slot);};});
  stage.querySelectorAll('[data-aba]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    abaFoe=abaFoe===b.dataset.aba?null:b.dataset.aba; render();});
  stage.querySelectorAll('[data-look]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const[uid,slotk]=b.dataset.look.split('|');
    const u=todas().find(x=>x.uid===uid);
    const a=acoesDe(st,u).find(x=>x.slot===slotk); if(!a)return;
    const cd=u.cd[slotk]||0;
    peek=b.dataset.look;
    detalhe={nome:a.nome.toUpperCase(),chave:'skill-'+u.key+'-'+slotk,glifo:mono(a),cor:COR(u.elem),redondo:true,
      pips:pipsDetalhe(a.cost),
      meta:u.nome.toUpperCase()+' \u00b7 '+(cd?'PRONTA EM '+cd+' TURNO(S)':'PRONTA AGORA'),
      texto:a.desc,classes:classesTxt(u,a)+' \u00b7 INIMIGA \u2014 CONSULTA'};
    armado=null;alvos=[];escolhidos=[];render();});
  stage.querySelectorAll('[data-target]').forEach(el=>el.onclick=()=>alvo(el.dataset.uid));
  stage.querySelectorAll('.portrait').forEach(el=>{
    if(el.dataset.target)return;
    el.onclick=ev=>{ev.stopPropagation();
      const u=todas().find(x=>x.uid===el.dataset.uid); if(u)ficha(u);};});
  stage.querySelectorAll('[data-ficha]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const u=todas().find(x=>x.uid===b.dataset.ficha); if(u)ficha(u);});
  stage.querySelectorAll('[data-pas]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const u=todas().find(x=>x.uid===b.dataset.pas),g=GODS[u.key];
    detalhe={nome:g.passiva.nome.toUpperCase(),chave:'god-'+u.key,glifo:'P',cor:COR(u.elem),
      meta:u.nome.toUpperCase()+' \u00b7 PASSIVA'+(g.passiva.inerte?' \u00b7 INERTE':''),
      texto:g.passiva.desc,classes:'SEMPRE ATIVA \u00b7 NÃO GASTA A AÇÃO \u00b7 NÃO PODE SER SILENCIADA'};
    armado=null;alvos=[];escolhidos=[];render();});
  stage.querySelectorAll('[data-ef]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const[uid,tp]=b.dataset.ef.split('|');const u=todas().find(x=>x.uid===uid);
    const e=u.efeitos.find(x=>x.type===tp),s=SYM[tp];
    detalhe={nome:s[2].toUpperCase(),chave:'effect-'+tp,glifo:s[0],
      meta:u.nome.toUpperCase()+' \u00b7 '+(e.dur>90?'PERMANENTE':e.dur+' TURNO(S)')+(e.v?' \u00b7 VALOR '+e.v:''),
      texto:s[3],classes:'AS DURAÇÕES DESCONTAM NO FIM DO TURNO DE QUEM CARREGA O EFEITO'};
    render();});
  stage.querySelectorAll('[data-dot]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();
    const[uid,nm]=b.dataset.dot.split('|');const u=todas().find(x=>x.uid===uid);
    const d=u.dots.find(x=>x.nome===nm);
    detalhe={nome:d.nome.toUpperCase(),chave:'effect-dot',glifo:'\u2739',
      meta:u.nome.toUpperCase()+' \u00b7 '+d.v+'/TURNO \u00b7 '+d.dur+' TURNO(S)',
      texto:'Dano contínuo. Conta no início do turno de quem sofre, ANTES de ele agir — pode matar sem que a unidade jogue.',
      classes:'DANO PURO \u00b7 IGNORA REDUÇÃO E ESCUDO \u00b7 ATRAVESSA INVULNERABILIDADE'};
    render();});
  stage.querySelectorAll('[data-conv]').forEach(b=>b.onclick=()=>{
    const l0=st.lados[st.ativo];
    if(l0.converteu||totalOrbs(l0)<CONV_CUSTO)return;
    ov='conv';convAlvo=b.dataset.conv;
    armado=null;alvos=[];escolhidos=[];detalhe=null;menuAberto=false;render();});
  stage.querySelectorAll('[data-ct]').forEach(b=>{if(b.disabled)return;
    b.onclick=()=>{convAlvo=convAlvo===b.dataset.ct?null:b.dataset.ct;render();};});
  const cc=q('#ctcanc'); if(cc)cc.onclick=()=>{ov=null;convAlvo=null;render();};
  const co=q('#ctok'); if(co&&!co.disabled)co.onclick=()=>{
    const r=converter(st,convAlvo);
    if(!r.ok)st.log.push({turno:st.turno,msg:'\u2717 '+r.erro});
    ov=null;convAlvo=null;render();};
  const oc=q('#ovconv'); if(oc)oc.onclick=ev=>{if(ev.target===oc){ov=null;convAlvo=null;render();}};
  const bl=q('#blog'); if(bl)bl.onclick=()=>{ov=ov==='log'?null:'log';menuAberto=false;render();};
  const bm=q('#bmenu'); if(bm)bm.onclick=()=>{menuAberto=!menuAberto;render();};
  const bh=q('#bhelp'); if(bh)bh.onclick=()=>{ov='help';menuAberto=false;render();};
  const bt=q('#btrocar'); if(bt&&!bt.disabled)bt.onclick=()=>{
    ov='conv';convAlvo=null;armado=null;alvos=[];escolhidos=[];detalhe=null;menuAberto=false;render();};
  const bcf=q('#bconf'); if(bcf)bcf.onclick=()=>confirmar();
  const bcn=q('#bcanc'); if(bcn)bcn.onclick=()=>{
    armado=null;alvos=[];escolhidos=[];detalhe=null;render();};
  const bs=q('#bsurr'); if(bs)bs.onclick=()=>{ov='surr';menuAberto=false;render();};
  const bc=q('#bclose'); if(bc)bc.onclick=()=>{ov=null;render();};
  // fechar o menu ao tocar fora, sem acumular ouvintes a cada render
  if(menuAberto){
    const mm=q('#menu');
    stage.onclick=ev=>{
      if(mm&&!mm.contains(ev.target)&&!(ev.target.closest&&ev.target.closest('#bmenu'))){
        stage.onclick=null;menuAberto=false;render();}
    };
  } else stage.onclick=null;
  const bso=q('#bsurrok'); if(bso)bso.onclick=()=>{
    st.fim=`JOGADOR ${2-st.ativo} VENCE`; st.log.push({turno:st.turno,msg:`Jogador ${st.ativo+1} rendeu-se.`});
    ov=null;render();};
  const bn=q('#bnew'); if(bn)bn.onclick=()=>{
    tela='pick';pick=[[],[]];vez=0;pagina=0;tocado=null;painelFiltro=false;
    if(tick)clearInterval(tick);render();};
  const be=q('#bend'); if(be)be.onclick=()=>encerrarTurno();
  const ls=q('#logscroll'); if(ls)ls.scrollTop=ls.scrollHeight;
}

function encerrarTurno(){
  fimTurno(st); armado=null;alvos=[];escolhidos=[];detalhe=null;abaFoe=null;convAlvo=null;
  ov=null;menuAberto=false;
  relogio=TURNO_SEG; render();
}

function armar(uid,slot){
  detalhe=null;menuAberto=false;
  if(armado&&armado.uid===uid&&armado.slot===slot){armado=null;alvos=[];escolhidos=[];render();return;}
  const u=st.lados[st.ativo].units.find(x=>x.uid===uid);
  const a=acoesDe(st,u).find(x=>x.slot===slot);
  if(!a||!a.disponivel||!podeAgir(u))return;
  escolhidos=[];
  armado={uid,slot,passos:(a.passos||[]).slice()};
  atualizarAlvos();
  render();
}
// candidatos do passo atual; se o passo ficou sem ninguem, encurta a exigencia
function atualizarAlvos(){
  alvos=[];
  if(!armado)return;
  const u=st.lados[st.ativo].units.find(x=>x.uid===armado.uid);
  if(!u)return;
  const a=acoesDe(st,u).find(x=>x.slot===armado.slot);
  if(!a)return;
  const i=escolhidos.length;
  if(i>=armado.passos.length)return;
  const c=alvosValidos(st,u,a,i,escolhidos);
  if(!c.length){armado.passos=armado.passos.slice(0,i);return;}
  alvos=c;
}
function faltamAlvos(){return armado?armado.passos.length-escolhidos.length:0;}
function alvo(uid){
  if(!armado||faltamAlvos()<=0)return;
  if(!alvos.some(x=>x.uid===uid))return;
  escolhidos.push(uid);
  atualizarAlvos();
  if(faltamAlvos()<=0)confirmar(); else render();
}
function confirmar(){
  if(!armado)return;
  const u=st.lados[st.ativo].units.find(x=>x.uid===armado.uid);
  const a=acoesDe(st,u).find(x=>x.slot===armado.slot);
  if(!a||!a.disponivel){armado=null;alvos=[];escolhidos=[];render();return;}
  const r=agir(st,armado.uid,a.slot,[...escolhidos]);
  if(!r.ok)st.log.push({turno:st.turno,msg:'\u2717 '+r.erro});
  armado=null;alvos=[];escolhidos=[];detalhe=null;render();
}
function ficha(u){
  const g=GODS[u.key],lin=[];
  lin.push(`${g.passiva.nome}: ${g.passiva.desc}`);
  for(const e of u.efeitos){const s=SYM[e.type];if(s)lin.push(`${s[2]}${e.v?' '+e.v:''} (${e.dur>90?'permanente':e.dur+'t'})`);}
  for(const d of u.dots)lin.push(`${d.nome} ${d.v}/t (${d.dur}t)`);
  for(const k of['habilidade','milagre','defesa'])if(u.cd[k]>0)lin.push(`${k} em recarga ${u.cd[k]}t`);
  if(u.shield)lin.push(`escudo ${u.shield}`);
  detalhe={nome:u.nome.toUpperCase(),chave:'god-'+u.key,glifo:ini(u.nome),cor:COR(u.elem),
    meta:`${u.hp}/${u.maxHp} \u00b7 ${ELAB[u.elem]}`,
    texto:lin.join('  \u00b7  '),
    classes:`${u.classe} \u00b7 ${u.funcao} \u00b7 ${u.faccao||GODS[u.key].faccao}`.toUpperCase()};
  armado=null;alvos=[];escolhidos=[];render();
}

render();

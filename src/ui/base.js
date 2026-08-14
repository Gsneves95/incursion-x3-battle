// ui/base.js — helpers e constantes compartilhados. É o ÚNICO módulo de ui
// que os outros podem usar. Sem dependência de outro ui/.
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

// mapa CHAVE -> nome exibível dos danos contínuos. O motor emite o DoT como CHAVE
// (efeito:'queimadura'), nunca como nome (docs/eventos.md A); a tradução mora aqui,
// compartilhada por narrar.js (registro) e campo.js (faixa de efeitos). Cresce com os DoTs.
const NOMES_DOT = { queimadura: 'Queimadura', veneno: 'Veneno', sangramento: 'Sangramento', tormento: 'Tormento' };
// CHAVE de efeito -> rótulo humano. DoT pelo mapa acima; buff/debuff pelo rótulo do SYM;
// senão devolve a própria chave (fica legível e nunca some). Único lugar de tradução de chave.
function rotuloEfeito(k) { return NOMES_DOT[k] || (SYM[k] && SYM[k][2]) || k; }
// CHAVE de contador -> nome exibível. O motor emite o contador como CHAVE no campo `efeito` do
// evento `contador` (mesmo campo polimórfico do DoT/fase, desambiguado por `tipo`); a resolução é
// SEPARADA do rotuloEfeito (contador ≠ efeito), então chave coincidente não cruza. Cresce com os kits.
const NOMES_CONTADOR = {
  discoSolar: 'Disco Solar', atadura: 'Atadura', cauda: 'Cauda',
  combo: 'Combo', podridao: 'Podridão', maldicao: 'Maldição de Yomi',
};
function nomeContador(k) { return NOMES_CONTADOR[k] || k; }
// tipos de evento que marcam MARCO no registro (recebem realce): virada de turno,
// queda, renascimento. Substitui o regex que casava as strings prontas (caiu/Turno/…).
const LOG_MARCO = new Set(['turno', 'queda', 'revive', 'passiva', 'fim']);

const stage = document.getElementById('stage');
const H = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// realça palavras-chave por categoria no painel de descrição (estilo Naruto-Arena).
// Vocabulários disjuntos entre categorias -> substituição sequencial não duplo-envolve.
const KW=[
  ['ctrl',/(atordoa\w*|atordoad\w*|adormec\w*|silencia\w*|silenciad\w*|provoca\w*|provocad\w*|submerg\w*|submers\w*|domina\w*|dominad\w*|petrifica\w*|selad\w*|\bselo\b|controle)/gi],
  ['dot', /(queimadura|veneno|envenena\w*|podridão|encharcad\w*|dano contínuo|maldição|sangramento)/gi],
  ['def', /(invulner\w*|inalvej\w*|redução de dano|redução|defesa destrutível|escudo|imune\w*|imunidade|regenera\w*|vida extra)/gi],
  ['neg', /(não pode ser (?:contra-atacad[oa]|reflet\w+|intercept\w+|reduzid[oa]|absorvid[oa]|curad[oa]|revivid[oa]|evitad[oa]|atingid[oa])|ignora [\wçãéíó]+|dano puro|perfurante)/gi],
];
function realce(s){ let t=H(s); KW.forEach(([c,re])=>{t=t.replace(re,m=>`<span class="kw kw--${c}">${m}</span>`);}); return t; }

/* ---------- rótulo de lado por MODO de partida (F0.7) ----------
   Perspectiva fixa: o texto fala de VOCÊ e do OPONENTE, não de "Jogador N" — exceto
   em hot-seat, onde os dois são humanos na mesma tela e o número é a única distinção.
   O rótulo sai do MODO (modoPartida em turno.js), não do lado. */
function rotuloLado(lado){
  if(modoPartida()==='hotseat') return 'Jogador '+(lado+1);
  if(lado===ladoExibido()) return 'Você';
  return modoPartida()==='cpu' ? 'CPU' : 'Oponente';
}
// (F1.0b) O remendo `traduzirRotulos` morreu: o motor não emite mais texto de interface,
// emite EVENTOS estruturados (docs/eventos.md) e `narrar()` (ui/narrar.js) traduz na hora
// de exibir — resolvendo `lado` por `rotuloLado`, sem regex por cima de string pronta.
// mini-pips da energia de um lado (contexto no topo): um pip por orbe, colorido por
// elemento — deixa "ele paga um Milagre?" legível sem somar número nenhum.
function miniPips(l){
  const out=[];
  ELEMS.forEach(e=>{ for(let i=0;i<l.orbs[e];i++) out.push(`<i style="background:${COR(e)}"></i>`); });
  return `<span class="nrgmini">${out.join('')||'<i class="nrgmini__zero"></i>'}</span>`;
}

/* ---------- enquadramento: altura fixa (428), largura fluida (F0.6b) ---------- */
let ultimaEscala = 1, ultimaLarguraDesign = 926;   // expostas para o painel de diagnóstico
// Área útil num LUGAR SÓ: visualViewport quando existe (reporta a viewport visual
// real), innerWidth/Height como reserva. Desconta as safe areas — que, sendo zero
// no aparelho testado, não descontam nada (o innerWidth já exclui a barra de
// navegação do Android; somar de novo seria desconto duplo).
function areaUtil(){
  const vv = window.visualViewport;
  const w = (vv && vv.width)  || innerWidth;
  const h = (vv && vv.height) || innerHeight;
  return { w: Math.max(1, w - envPx('Left') - envPx('Right')),
           h: Math.max(1, h - envPx('Top') - envPx('Bottom')) };
}
function fit(){
  const u = areaUtil();
  // a REGRA vive em calcularEnquadramento (src/enquadramento.js); aqui só APLICA.
  const { escala, larguraDesign } = calcularEnquadramento({ larguraUtil: u.w, alturaUtil: u.h });
  ultimaEscala = escala; ultimaLarguraDesign = larguraDesign;
  // altura fica 428 (CSS var); largura é aplicada por JS — o CSS não sabe o valor.
  stage.style.width = larguraDesign + 'px';
  // translate ANTES do scale, transform-origin no centro: centraliza sem depender
  // da caixa de layout (que o scale não encolhe — era a causa do corte à direita).
  stage.style.transform = 'translate(-50%,-50%) scale('+escala+')';
  renderDiag();
}
// refit em toda mudança de viewport; + um refit atrasado após girar, porque o
// Android reporta dimensão velha logo depois do orientationchange.
addEventListener('resize', fit);
addEventListener('orientationchange', () => { fit(); setTimeout(fit, 250); });
if (window.visualViewport) {
  visualViewport.addEventListener('resize', fit);
  visualViewport.addEventListener('scroll', fit);
}

/* ---------- diagnóstico de enquadramento (F0.6, passo 1) ----------
   Painel temporário: MEDIR antes de corrigir. Oculto no jogo normal; abre por
   ?diag na URL ou por 3 toques no carimbo de build (canto inferior esquerdo). */
function envPx(lado){ const p=document.getElementById('safeprobe'); if(!p)return 0;
  return Math.round(parseFloat(getComputedStyle(p)['padding'+lado])||0); }
function diagInfo(){
  const vv = window.visualViewport, de = document.documentElement;
  return [
    ['inner',   innerWidth+' × '+innerHeight],
    ['visualV', vv ? Math.round(vv.width)+' × '+Math.round(vv.height)+'  scale '+vv.scale.toFixed(2)+'  offTop '+Math.round(vv.offsetTop) : '(indisponível)'],
    ['screen',  screen.width+' × '+screen.height+'   dpr '+devicePixelRatio],
    ['orient',  (screen.orientation&&screen.orientation.type) || (typeof orientation!=='undefined'? orientation+'°' : '?')],
    ['safe px', 'T'+envPx('Top')+' R'+envPx('Right')+' B'+envPx('Bottom')+' L'+envPx('Left')],
    ['fit',     'escala '+ultimaEscala.toFixed(4)+'  design '+Math.round(ultimaLarguraDesign)+'×428  palco '+Math.round(ultimaLarguraDesign*ultimaEscala)+' × '+Math.round(428*ultimaEscala)],
    ['rect',    (()=>{ const r=stage.getBoundingClientRect();
                  return 'L'+Math.round(r.left)+' T'+Math.round(r.top)+' R'+Math.round(r.right)+' B'+Math.round(r.bottom)+
                    ((r.left<-0.5||r.top<-0.5||r.right>innerWidth+0.5||r.bottom>innerHeight+0.5)?'  ⚠ EXTRAPOLA':'  ok'); })()],
    ['rola?',   'W '+de.scrollWidth+' vs '+de.clientWidth+' → '+(de.scrollWidth>de.clientWidth)+
                ' · H '+de.scrollHeight+' vs '+de.clientHeight+' → '+(de.scrollHeight>de.clientHeight)],
  ];
}
function renderDiag(){ const el=document.getElementById('diag'); if(!el||!el.classList.contains('on'))return;
  const txt=document.getElementById('diagtext')||el;
  txt.textContent = diagInfo().map(([k,v])=>k.padEnd(8)+v).join('\n'); }
function ligarDiag(){
  const el=document.getElementById('diag'); if(!el)return;
  if(/diag/i.test(location.search)||/diag/i.test(location.hash)) el.classList.add('on');
  renderDiag();
  const x=document.getElementById('diagx');           // ✕ é a ÚNICA parte clicável do painel
  if(x)x.addEventListener('click',()=>{ el.classList.remove('on'); });
  const b=document.getElementById('build');
  if(b){ let n=0,t; b.style.pointerEvents='auto'; b.style.cursor='pointer';
    b.addEventListener('pointerdown',()=>{ clearTimeout(t);
      if(++n>=3){ n=0; el.classList.toggle('on'); renderDiag(); }
      t=setTimeout(()=>n=0,600); }); }
  addEventListener('resize',renderDiag); addEventListener('orientationchange',renderDiag);
  if(window.visualViewport){ visualViewport.addEventListener('resize',renderDiag);
    visualViewport.addEventListener('scroll',renderDiag); }
}

/* ---------- modo app (F0.6, passo 3) ----------
   Tela cheia ganha ~15% de escala no aparelho (a barra do navegador come 74×48px).
   requestFullscreen só vale APÓS um gesto — por isso a oferta mora no 1º toque; se o
   navegador recusar, o jogo segue normal. O manifest é ARQUIVO REAL servido no Pages
   (link estático no <head>): blob: quebra a instalação (start_url inválido, provado por
   CDP). O invariante "arquivo único" vale para o dist de dev, não para o artefato
   publicado — ver CLAUDE.md. */
function estaTelaCheia(){ return !!(document.fullscreenElement || document.webkitFullscreenElement); }
function pedirTelaCheia(){
  const de=document.documentElement, fn=de.requestFullscreen||de.webkitRequestFullscreen;
  if(!fn)return Promise.reject();
  try{ return Promise.resolve(fn.call(de)); }catch(e){ return Promise.reject(e); }
}
function sairTelaCheia(){
  const fn=document.exitFullscreen||document.webkitExitFullscreen;
  if(fn)try{ fn.call(document); }catch(e){}
}
function alternarTelaCheia(){ if(estaTelaCheia())sairTelaCheia(); else pedirTelaCheia().catch(()=>{}); }

// oferta de tela cheia: no MÁXIMO uma vez por sessão. Se o jogador recusar (o
// pedido falha, ou ele sai logo pelo gesto), não insistimos a cada toque — a
// próxima oferta é só na sessão seguinte (recarga). Hoje a memória é de sessão
// (esta variável); quando a F3 ligar o perfil, migra para lá para lembrar entre
// sessões. NÃO oferecemos se já está em tela cheia (app instalado).
let telaCheiaOfertada=false;
function ligarModoApp(){
  // o manifest é um arquivo real (link estático no <head>) — não se gera aqui.
  const oferta=()=>{ if(telaCheiaOfertada)return; telaCheiaOfertada=true;
    removeEventListener('pointerdown',oferta,true);
    if(!estaTelaCheia())pedirTelaCheia().catch(()=>{}); };
  addEventListener('pointerdown',oferta,true);
  // a viewport muda ao entrar/sair da tela cheia -> reenquadrar (com refit atrasado)
  document.addEventListener('fullscreenchange',()=>{ fit(); setTimeout(fit,150); });
  document.addEventListener('webkitfullscreenchange',()=>{ fit(); setTimeout(fit,150); });
}

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
// converte a string de custo do kits.json ("2 Tempestade + 1 livre") em {Tempestade:2, livre:1}
function custoParaCost(str){
  const cost={};
  if(!str||str==='—'||/grátis/i.test(str))return cost;
  str.split('+').forEach(p=>{
    const m=p.trim().match(/^(\d+)\s+(.+)$/); if(!m)return;
    const n=+m[1], nome=m[2].trim();
    if(/^livres?$/i.test(nome))cost.livre=(cost.livre||0)+n;
    else{const el=ELEMS.find(e=>e.toLowerCase()===nome.toLowerCase()); if(el)cost[el]=(cost[el]||0)+n;}
  });
  return cost;
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
function todas(){return st.lados.flatMap(l=>l.units);}

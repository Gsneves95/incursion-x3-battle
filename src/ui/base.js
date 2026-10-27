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
// §337 — ORBE de elemento (runa de vidro, web/orbes/orbe_<elem>.svg). `orbe()` devolve um <img> no TAMANHO px (halo p/
// ≥14, transbordando via margem negativa; _min p/ <14). `orbeBg()` é o estilo de FUNDO (orbe _min em contain) p/ trocar
// um dot de COR LISA mantendo o tamanho/forma do CSS. `apagado` = custo não pago (opacidade/saturação baixas, como antes).
const _ORBE_KEY = {Tempestade:'tempestade',Umbra:'umbra','Maré':'mare',Mare:'mare',Aurora:'aurora',Chama:'chama',Verdejante:'verdejante',livre:'livre',Livre:'livre'};
function _orbeKey(e){ return _ORBE_KEY[e] || String(e||'').toLowerCase(); }
// §337b: ?v=<versão do build> fura o cache de 1 dia — o celular podia ter guardado a orbe com o Content-Type errado
// (antes de o server ganhar '.svg'). O servidor ignora a query ao achar o arquivo (split('?')).
function _orbeVer(){ return (typeof ORBE_VER!=='undefined'&&ORBE_VER)?('?v='+ORBE_VER):''; }
function orbe(e, px, opts){ opts=opts||{}; const k=_orbeKey(e), v=_orbeVer();
  const dim = opts.apagado ? 'opacity:.4;filter:saturate(.35) brightness(.85);' : '';
  if(px < 14) return `<img class="orbe orbe--min" src="orbes/orbe_${k}_min.svg${v}" alt="" style="width:${px}px;height:${px}px;display:block;${dim}">`;
  const full=Math.round(px*128/80), m=Math.round((full-px)/2);   // corpo = px; halo transborda (margem negativa = não empurra)
  return `<img class="orbe orbe--halo" src="orbes/orbe_${k}.svg${v}" alt="" style="width:${full}px;height:${full}px;display:block;margin:-${m}px;${dim}">`;
}
function orbeBg(e){ const k=_orbeKey(e); return `background:url(orbes/orbe_${k}_min.svg${_orbeVer()}) center/contain no-repeat`; }
// §318b-2 — FONTE ÚNICA das moedas da CONTA: a barra de moedas (gema/Essência) lê SEMPRE do servidor
// (contaAtual), nunca do perfil local — o perfil era o "26.100 fantasma" que sobrevivia desconectado/pós-wipe.
// `online:false` quando não há conta autoritativa; `fmtMoeda` então mostra "—" em vez de inventar um número.
// §318b-3 — a última exceção caiu: os DESAFIOS agora GASTAM Essência no SERVIDOR (comprarPergaminho) e a tela
//  deles também lê daqui. NÃO há mais leitor/gastador local de moeda — toda barra de CONTA passa por aqui.
function moedaServidor(){
  const ca = (typeof contaAtual !== 'undefined') ? contaAtual : null;
  const m = ca && ca.perfil && ca.perfil.moedas;
  return { online: !!m, gema: m ? (m.gema || 0) : 0, essencia: m ? (m.essencia || 0) : 0 };
}
function fmtMoeda(online, v){ return online ? Number(v || 0).toLocaleString('pt-BR') : '—'; }
// §323 P2 — o mapa de níveis do TIME do jogador (da conta) para MONTAR o kit efetivo no PvE e para o
// SNAPSHOT do replay (o servidor re-monta com ele, conferindo ≤ conta). Só inclui o deus com algum nível
// > 1 → quando nada subiu, devolve null (montagem = catálogo base, byte-idêntica a hoje; regressão zero).
// Compartilhado (home.js e selecao.js o usam) — por isso vive aqui, no único ui que outros ui podem chamar.
function niveisTimeLocal(time){
  const base = (typeof contaAtual !== 'undefined' && contaAtual && contaAtual.niveis) || {};
  const m = {}; let tem = false;
  for (const k of (time || [])) {
    const n = k && base[k];
    if (n && ['basico','habilidade','milagre'].some(s => (n[s] || 1) > 1)) { m[k] = n; tem = true; }
  }
  return tem ? m : null;
}
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
  vulneravel:['\u2295','debuff','Vulner\u00e1vel','Recebe +N de dano de cada golpe (o N aparece no chip), somado ANTES da redu\u00e7\u00e3o e do escudo. Some ao ser limpo.'],   // \u00a7266: antes SEM s\u00edmbolo \u2014 o debuff "+N de dano recebido" era invis\u00edvel na tela
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
// meta de combatente (deus OU criatura do bestiário) por chave — nome/curto/elemento.
// Vive aqui (base) porque o briefing (home.js) e o campo de batalha (campo.js) usam:
// ui→ui é proibido, então o compartilhado sobe. §262: `curto` = nome de 1 palavra
// (só bestiário) para as caixas apertadas; sem ele, cai no nome inteiro.
function metaComb(k){
  const g = HRM[k]; if (g) return { nome: g.nome, curto: g.nome, elem: g.elem };
  const b = (typeof BESTIARIO_DADOS !== 'undefined' ? BESTIARIO_DADOS : []).find(x => x.key === k);
  if (b) return { nome: b.nome, curto: b.curto || b.nome, elem: b.elemento };
  return { nome: k, curto: k, elem: 'Umbra' };
}
// tipos de evento que marcam MARCO no registro (recebem realce): virada de turno,
// queda, renascimento. Substitui o regex que casava as strings prontas (caiu/Turno/…).
const LOG_MARCO = new Set(['turno', 'queda', 'revive', 'passiva', 'fim']);

const stage = document.getElementById('stage');
const H = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// §329 — u = 1% da altura do palco (1u = 4.28px de design). As POSIÇÕES do layout de batalha vêm de
// data/layout_batalha.json em u; U(n) devolve o CSS calc() correspondente. Fonte única da conversão.
function U(n){ return 'calc(var(--u) * ' + (Math.round((+n||0)*1000)/1000) + ')'; }
// realça palavras-chave por categoria no painel de descrição (estilo Naruto-Arena).
// Vocabulários disjuntos entre categorias -> substituição sequencial não duplo-envolve.
// §342b: `\w` do JS NÃO inclui letras acentuadas — "invulner\w*" parava em "invulner" e deixava "ável" sem cor.
// Troca por uma classe de letras latinas (`_L`) para a flexão acentuada entrar no destaque, e por lookarounds de
// LIMITE DE PALAVRA (`_B0`/`_B1`) para nenhum destaque começar ou terminar no meio de uma palavra.
const _L='A-Za-zÀ-ÿ', _B0='(?<!['+_L+'])', _B1='(?!['+_L+'])';
const KW=[
  ['ctrl',new RegExp(_B0+'(atordoa['+_L+']*|adormec['+_L+']*|silencia['+_L+']*|silenciad['+_L+']*|provoca['+_L+']*|provocad['+_L+']*|submerg['+_L+']*|submers['+_L+']*|domina['+_L+']*|dominad['+_L+']*|petrifica['+_L+']*|selad['+_L+']*|selo|controle)'+_B1,'gi')],
  ['dot', new RegExp(_B0+'(queimadura|veneno|envenena['+_L+']*|podridão|encharcad['+_L+']*|dano contínuo|maldição|sangramento)'+_B1,'gi')],
  ['def', new RegExp(_B0+'(invulner['+_L+']*|inalvej['+_L+']*|redução de dano|redução|defesa destrutível|escudo|imune['+_L+']*|imunidade|regenera['+_L+']*|vida extra)'+_B1,'gi')],
  ['neg', new RegExp(_B0+'(não pode ser (?:contra-atacad[oa]|reflet['+_L+']+|intercept['+_L+']+|reduzid[oa]|absorvid[oa]|curad[oa]|revivid[oa]|evitad[oa]|atingid[oa])|ignora ['+_L+']+|dano puro|perfurante)'+_B1,'gi')],
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
// §299: o HISTÓRICO (agrupado por turno, autoria distinta — §238) subiu para a FUNDAÇÃO (base.js): o painel
// lateral saiu e o histórico passou a ser chamado pelo ≡ REGISTRO (sobrepor.js). ui->ui é proibido, base é livre.
// §238 (item 2): o HISTÓRICO LEGÍVEL — agrupado POR TURNO (o mais recente no topo), cronológico dentro
// do turno, e a AUTORIA visualmente distinta (você × o OUTRO LADO — vale nos 4 modos: na Provação e na
// Campanha o "outro lado" é a IA, não um jogador). Autoria pela varredura do log: o lado ATIVO (turno.lado)
// no momento; reativos (reflexo/intercepta/contra-ataque) pertencem ao lado que DEFENDE.
function historicoHTML(){
  const eu=ladoExibido();
  let ativo=0; const marc=[];
  for(const r of st.log){
    if(r.tipo==='turno'){ if(r.lado===0||r.lado===1) ativo=r.lado; continue; }
    if(r.tipo==='abertura') continue;
    const txt=narrar(r); if(!txt) continue;
    const reativo = r.reflexo || r.efeito==='intercepta' || r.efeito==='contraAtaca' || r.efeito==='refleteDano';
    marc.push({ turno:r.turno, lado: reativo ? 1-ativo : ativo, txt });
  }
  const porTurno=new Map();
  for(const m of marc){ if(!porTurno.has(m.turno)) porTurno.set(m.turno,[]); porTurno.get(m.turno).push(m); }
  const turnos=[...porTurno.keys()].sort((a,b)=>b-a);   // mais recente no topo
  const blocos=turnos.map(t=>{
    const linhas=porTurno.get(t).map(m=>`<div class="hist__l hist__l--${m.lado===eu?'eu':'eles'}">${H(m.txt)}</div>`).join('');
    return `<div class="hist__turno"><div class="hist__cab">Turno ${t}</div>${linhas}</div>`;
  }).join('') || `<div class="hist__vazio">A batalha ainda não tem eventos.</div>`;
  return `<div class="detail hist">
    <div class="detail__top"><div class="detail__icon">${slot('detail','☷','var(--ink-mute)',20)}</div>
      <div class="detail__id"><div class="detail__name">HISTÓRICO</div>
        <div class="detail__meta"><span class="detail__cd">TURNO ${st.turno}</span></div></div></div>
    <div class="hist__rol">${blocos}</div>
    <div class="detail__classes"><span class="hist__leg hist__leg--eu">você</span> · <span class="hist__leg hist__leg--eles">${H(rotuloLado(1-eu))}</span></div>
  </div>`;
}

// mini-pips da energia de um lado (contexto no topo): um pip por orbe, colorido por
// elemento — deixa "ele paga um Milagre?" legível sem somar número nenhum.
function miniPips(l){
  const out=[];
  ELEMS.forEach(e=>{ for(let i=0;i<l.orbs[e];i++) out.push(`<i style="${orbeBg(e)}"></i>`); });
  return `<span class="nrgmini">${out.join('')||'<i class="nrgmini__zero"></i>'}</span>`;
}

/* ---------- enquadramento: altura fixa (428), largura fluida (F0.6b) ---------- */
let ultimaEscala = 1, ultimaLarguraDesign = 926, ultimaEscalaBatalha = 1;   // expostas para o painel de diagnóstico
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
  // §335: a BATALHA usa uma TELA FIXA de 1846×852 (design do dono) escalada por min(w/1846,h/852), centrada, com a
  // canvas (#03050B) nas sobras — substitui o sistema de 'u' só na batalha. O #stage vira a moldura da canvas (sem
  // borda/arredondado) e o #batalha se escala sozinho dentro dele.
  const emBatalha = (typeof rotaAtual === 'function' && rotaAtual() === 'batalha') && document.getElementById('batalha');
  // §339: a tela DESAFIOS também é uma TELA FIXA de 1846×852 escalada (igual à batalha §335); só a grade de deuses rola
  // por dentro. `#desafios` é a canvas; o `#stage` vira a moldura (fundo #03050B nas sobras).
  const emDesafios = (typeof rotaAtual === 'function' && rotaAtual() === 'desafios') && document.getElementById('desafios');
  // §342/§344: as telas de MONTAR TIME (Domínio, Campanha, Composição, PvP) são a mesma TELA FIXA de 1846×852 escalada.
  const _rM = (typeof rotaAtual === 'function') && rotaAtual();
  const emMontar = (_rM === 'dominiomontar' || _rM === 'montartime' || _rM === 'desafiomontar' || _rM === 'pvp' || _rM === 'selecao') && document.getElementById('dommontar');   // §345: a Batalha CPU/hot-seat usa o mesmo montador
  // §348: o HUB do Domínio é a mesma TELA FIXA de 1846×852 escalada (igual à batalha/desafios/montador).
  const emDomHub = (_rM === 'dominio') && document.getElementById('domhub');
  // §349: a tela PROVAÇÕES também é a TELA FIXA de 1846×852 escalada.
  const emProv = (_rM === 'provacoes') && document.getElementById('provfix');
  // §350: a FICHA do deus ('deus') e os NÍVEIS ('niveis') também são a TELA FIXA de 1846×852 escalada.
  const emDeus = (_rM === 'deus') && document.getElementById('deusfix');
  const emNiveis = (_rM === 'niveis') && document.getElementById('nlfix');
  // §351: a LISTA de DESAFIOS DE COMPOSIÇÃO ('composicao') também é a TELA FIXA de 1846×852 escalada (visual §339).
  const emCompos = (_rM === 'composicao') && document.getElementById('compfix');
  // §352: a FOLHA DE COMPONENTES ('guia', dev). §367: migrou da TELA FIXA de 1846×852 para o canvas PEQUENO de 780×360.
  const emGuia = (_rM === 'guia') && document.getElementById('guiafix');
  // §346b: a COLEÇÃO vira uma TELA FIXA escalada (como batalha/montador): enche a tela. O design é 1100×508 (MESMA
  // proporção 2.166 da batalha 1846×852), onde o CSS atual da Coleção já cabe — e escalado garante os filtros em 2
  // linhas e 2+ fileiras de cartões em qualquer tamanho (780 e 1846 têm a mesma proporção → escala uniforme).
  const emColecao = (_rM === 'colecao') && document.getElementById('colfix');
  // §364: a CAMPANHA (renderCampanha) também passa ao canvas PEQUENO de 780×360 (como §358–§363b).
  const emCampanha = (_rM === 'campanha') && document.getElementById('campfix');
  // §365: HUB do Domínio e SELEÇÃO dos 5 Domínios passam ao canvas PEQUENO de 780×360 (como §358–§364).
  const emDominios = (_rM === 'dominios') && document.getElementById('domselfix');
  // §367: as ÚLTIMAS telas também passam ao canvas PEQUENO de 780×360 — INVOCAÇÃO, HOME (o mapa), o marcador EM BREVE
  // (Loja) e a FOLHA DO GUIA (que deixa o canvas de 1846×852 e adota o mesmo padrão: px de design = px real).
  const emInvocacao = (_rM === 'invocacao') && document.getElementById('invfix');
  const emHome = (_rM === 'home') && document.getElementById('homefix');
  const emEmbreve = (_rM === 'embreve') && document.getElementById('embrevefix');
  // §358: Coleção, FICHA e NÍVEIS usam um canvas PEQUENO de 780×360 (= o celular) — assim os px de design SÃO os
  // px reais no 780×360 e cumprem o padrão §357 sem escala contra; nas telas maiores o fit() escala p/ cima.
  // §359: os MONTADORES (Domínio/Campanha/Composição/PvP/Batalha CPU) passam ao canvas PEQUENO de 780×360 (como §358):
  // o px de design é o px REAL no 780×360 e cumpre o §357 direto; nas telas maiores o fit() escala p/ cima.
  // §360: DESAFIOS (renderProvacoes) e COMPOSIÇÃO (renderDesafios) também passam ao canvas PEQUENO de 780×360.
  const fixaPeq = emColecao || emDeus || emNiveis || emMontar || emDesafios || emCompos || emProv || emBatalha || emCampanha || emDomHub || emDominios || emInvocacao || emHome || emEmbreve || emGuia;
  const fixa = false;   // §367: nada usa mais o canvas de 1846×852 (a guia migrou para 780×360)
  try{ stage.classList.toggle('bt2', !!emBatalha); stage.classList.toggle('df2', !!emDesafios); stage.classList.toggle('dm2', !!emMontar); stage.classList.toggle('dh2', !!emDomHub); stage.classList.toggle('pv2fix', !!emProv); stage.classList.toggle('deusfix2', !!emDeus); stage.classList.toggle('nlfix2', !!emNiveis); stage.classList.toggle('cmp2', !!emCompos); stage.classList.toggle('guia2', !!emGuia); stage.classList.toggle('col2fix', !!emColecao); stage.classList.toggle('campfix2', !!emCampanha); stage.classList.toggle('domsel2', !!emDominios); stage.classList.toggle('inv2', !!emInvocacao); stage.classList.toggle('home2', !!emHome); stage.classList.toggle('embreve2', !!emEmbreve);
    document.body.classList.toggle('emdesafios', !!emDesafios); document.body.classList.toggle('emmontar', !!emMontar); document.body.classList.toggle('emdomhub', !!emDomHub); document.body.classList.toggle('emprov', !!emProv); document.body.classList.toggle('emdeus', !!emDeus); document.body.classList.toggle('emniveis', !!emNiveis); document.body.classList.toggle('emcompos', !!emCompos); document.body.classList.toggle('emguia', !!emGuia); document.body.classList.toggle('emcolecao', !!emColecao); document.body.classList.toggle('emcampanha', !!emCampanha); document.body.classList.toggle('emdominios', !!emDominios); document.body.classList.toggle('eminvocacao', !!emInvocacao); document.body.classList.toggle('emhomefix', !!emHome); document.body.classList.toggle('emembreve', !!emEmbreve); }catch(e){}   // §339/§342/§346b/§348/§349/§350/§351/§352/§364/§367: carimbo build + botão conta somem destas telas (vivem na home/menu)
  if(fixaPeq && !fixa){
    const alvo = emColecao || emDeus || emNiveis || emMontar || emDesafios || emCompos || emProv || emBatalha || emCampanha || emDomHub || emDominios || emInvocacao || emHome || emEmbreve || emGuia;
    const CW = 780, CH = 360, s = Math.min(u.w / CW, u.h / CH);   // §358: canvas = o celular
    ultimaEscala = s; ultimaLarguraDesign = CW; if(emBatalha) ultimaEscalaBatalha = s;   // §362: batalha no canvas 780×360
    stage.style.width = u.w + 'px'; stage.style.height = u.h + 'px';
    stage.style.transform = 'translate(-50%,-50%)';
    alvo.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
    renderDiag();
    return;
  }
  if(fixa){
    const s = Math.min(u.w / 1846, u.h / 852);
    ultimaEscala = s; ultimaEscalaBatalha = s; ultimaLarguraDesign = 1846;
    stage.style.width = u.w + 'px'; stage.style.height = u.h + 'px';
    stage.style.transform = 'translate(-50%,-50%)';
    fixa.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
    renderDiag();
    return;
  }
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
// §308c (removido no §309): as linhas de DOM do mapa eram temporárias — serviram para provar no aparelho que a trava
// pega (razão 1,780, pos absolute, css 762×428). O sintoma real era a FAIXA PRETA no gutter, não corte; ver §309.
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
    ...diagMapa(),
  ];
}
function renderDiag(){ const el=document.getElementById('diag'); if(!el||!el.classList.contains('on'))return;
  const txt=document.getElementById('diagtext')||el;
  txt.textContent = diagInfo().map(([k,v])=>k.padEnd(8)+v).join('\n'); }
// §328: o carimbo de build como TEXTO (para o menu ⋯ da batalha). Lê o #build injetado na build; "—" se ausente.
function buildStr(){ try{ const b=document.getElementById('build'); return (b&&b.textContent&&b.textContent.trim())||'—'; }catch(e){ return '—'; } }
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
// §355: cor da ENERGIA de uma habilidade = a cor (HEX) da orbe de custo DOMINANTE (a que tem mais pips); livre/sem custo →
// cinza-claro neutro. Usada pela MOLDURA fina da arte de habilidade (slot('skill-...')). Pura (sem dep. de home.js).
// HEX (não var()) p/ o slot poder derivar a versão a 55% em rgba — sem color-mix (não suportado em toda WebView antiga).
const EHEX = { Aurora:'#ffc94a', Tempestade:'#9fd8ff', Verdejante:'#58d68d', Chama:'#ff5c8a', Umbra:'#a06bff', 'Maré':'#4ad3c7' };
function corEnergia(cost){
  if(!cost) return '#C8CEDA';
  let best=null,n=0;
  for(const k in cost){ if(k==='livre')continue; const v=cost[k]||0; if(v>n){n=v;best=k;} }
  return best?(EHEX[best]||'#C8CEDA'):'#C8CEDA';
}
function _skRGBA(hex,a){ const h=String(hex).replace('#',''); const n=parseInt(h.length===3?h.replace(/(.)/g,'$1$1'):h,16); return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')'; }
function slot(chave,glifo,cor,tam,redondo,energia){
  const m=/^god-(.+)$/.exec(chave);
  const arteGod=m&&IMG[m[1]];
  // arte de habilidade (F1.7): ARQUIVO em web/skills/skill-<deus>-<slot>.webp (não base64 — 401 imagens embutidas
  // inflariam o bundle de ~1.4MB p/ ~7MB). A chave BATE o nome do arquivo. A Defesa é arte ÚNICA compartilhada
  // (skill-defesa.webp), não uma por deus. Se a arte não existir (deus futuro), onerror remove o <img> e o
  // monograma-irmão reaparece (o :has do CSS o esconde só enquanto a arte está presente).
  const ehSkill=/^skill-/.test(chave);
  const arq=ehSkill?(/-defesa$/.test(chave)?'skill-defesa':chave):null;
  // §254: arte de BESTIÁRIO por ARQUIVO (web/bestiario/<chave>.webp), pela MESMA razão das habilidades.
  // Só emite <img> quando a build confirmou o arquivo (BESTIARIO_ARTE) — nunca um <img> 404 (§213); o
  // monograma segue como reserva (o `:has` do CSS o esconde só enquanto a arte está presente).
  const bestKey=(m&&!arteGod&&typeof BESTIARIO_ARTE!=='undefined'&&BESTIARIO_ARTE[m[1]])?m[1]:null;
  const glifoHtml=glifo?`<span class="slot__glyph" style="font-size:${tam||16}px;color:${cor||'var(--ink-dim)'}">${H(glifo)}</span>`:'';
  let inner='';
  if(arteGod)inner=`<img src="${arteGod}" alt="">`;
  else if(bestKey)inner=`<img class="slot__art" src="bestiario/${H(bestKey)}.webp" alt="" loading="lazy" onerror="this.remove()">`+glifoHtml;
  else if(ehSkill){
    // §353b: TODA arte de habilidade é CHEIA — preenche o botão (object-fit cover, no arredondamento do próprio botão).
    // O recorte circular (disco, §332/§334) foi aposentado: as artes do dono são quadradas e cheias, e o clip cortava
    // os cantos da arte. O monograma segue como reserva (o onerror remove o <img> e o `:has` do CSS o reexibe).
    inner=`<img class="slot__art slot__art--cheia" src="skills/${H(arq)}.webp" alt="" loading="lazy" onerror="this.remove()">`;
  }
  else inner=glifoHtml;
  // §355: arte de habilidade ganha a MOLDURA fina na cor da energia (classe slot--sk + var --sk-en); o CSS desenha a
  // moldura (energia @55%) + o filete escuro por dentro, sobre a arte, sem mudar o tamanho/posição do botão.
  const _en = energia||'#C8CEDA';
  const skAttr = ehSkill ? ` slot--sk" style="--sk-en:${_en};--sk-en55:${_skRGBA(_en,.55)}` : '';
  return `<div class="slot${redondo?' slot--round':''}${skAttr}" data-slot="${H(chave)}">`+inner+`</div>`;
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
      out.push(`<i class="${paga?'':'miss'}" style="${orbeBg(k)}"></i>`);}}
  for(let i=0;i<(cost.livre||0);i++){
    const paga=!disp||sobra>0; if(disp&&paga)sobra--;
    out.push(`<i class="free ${paga?'':'miss'}" style="${orbeBg('livre')}"></i>`);}
  return out.length?`<div class="skill__cost">${out.join('')}</div>`
    :`<div class="skill__cost gratis"><span>GRÁTIS</span></div>`;
}
function pipsDetalhe(cost){
  const out=[];
  for(const k in cost){for(let i=0;i<cost[k];i++)
    out.push(k==='livre'?`<span class="cost__pip cost__pip--empty" style="${orbeBg('livre')}"></span>`
      :`<span class="cost__pip" style="${orbeBg(k)}"></span>`);}
  return out.length?`<div class="cost">${out.join('')}</div>`
    :`<div class="cost"><span class="cost__none cost__gratis">GRÁTIS</span></div>`;   // §340: custo vazio → "GRÁTIS" (verde), não mais "SEM CUSTO"
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

/* ---------- §342/§344/§345 — base do montador (cartão + painel de kit) reusada por home.js e selecao.js ----------
   Vive na FUNDAÇÃO (base.js) para os dois ui/ poderem chamá-la. Depende de helpers de conta (niveisDeExibicao,
   deusKitEfetivo, nlNivel) definidos em home.js — base.js é a origem isenta na checagem de direção da build. */
function _montCardHTML(k, cfg){
  const g = HRM[k] || { nome: k, elem: 'Umbra', funcao: '' };
  const num = cfg.selNum ? cfg.selNum(k) : (cfg.pick.indexOf(k) + 1);   // §344: nº da vaga (0 = não escolhido)
  const on = num > 0, nvmax = _montNivelMax(k);
  const off = !on && cfg._off && cfg._off[k];   // §344 (Composição): viola a regra → apagado, não selecionável
  const lado = (on && cfg.selLado) ? cfg.selLado(k) : 0;   // §345: lado 1 (oponente) = moldura/número VERMELHOS
  const trav = cfg.cardTravado && cfg.cardTravado(k);   // §345: na visão "Todos", deus bloqueado/WIP não entra (cadeado/WIP)
  const selCls = on ? (lado === 1 ? ' dm-card--sel dm-card--sel2' : ' dm-card--sel') : '';
  const sel = !off && !trav;   // selecionável?
  return `<button class="dm-card${selCls}${off ? ' dm-card--off' : ''}${trav ? ' dm-card--trav' : ''}"${sel ? ` data-pick="${k}"` : ''}>
    <span class="dm-card__p">${slot('god-' + k, ini(g.nome), (trav && trav.cinza) ? '#8d84ad' : COR(g.elem), 34)}</span>
    <span class="dm-card__grad"></span>
    <span class="dm-card__i" data-info="${k}" role="button" aria-label="kit">i</span>
    ${on ? `<span class="dm-card__vaga">${num}</span>` : ''}
    ${off ? `<span class="dm-card__off">${H(off)}</span>` : ''}
    ${trav && trav.txt ? `<span class="dm-card__trav">${H(trav.txt)}</span>` : ''}
    <span class="dm-card__id"><b class="dm-card__n">${H(g.nome)}</b><span class="dm-card__meta">${orbe(g.elem, 14)}<span class="dm-card__f">${H(g.funcao || '')}</span>${nvmax > 1 ? `<span class="dm-card__nv">· Nv ${nvmax}</span>` : ''}</span></span>
  </button>`;
}
function _montKitPanelHTML(k, cfg){
  const g = (typeof GODS !== 'undefined' && GODS[k]) || null;
  const hg = HRM[k] || { nome: k, elem: 'Umbra', funcao: '' };
  if (!g) {   // §345: deus sem kit (WIP) — na seleção "Todos" o "i" ainda abre, mostrando só o cabeçalho + aviso
    const lblw = cfg.kitLabel ? cfg.kitLabel(k) : { txt: 'Kit em produção', disabled: true };
    return `<div class="dm-kit" id="dmkit"><div class="dm-kit__card">
      <div class="dm-kit__cab">
        <span class="dm-kit__p">${slot('god-' + k, ini(hg.nome), COR(hg.elem), 40)}</span>
        <div class="dm-kit__id"><h2 class="cin dm-kit__nome">${H(hg.nome)}</h2><span class="dm-kit__meta">${orbe(hg.elem, 16)}<span class="dm-kit__f">${H(hg.funcao || '')}</span></span></div>
        <button class="dm-kit__x" data-kit-x="1" aria-label="Fechar">✕</button>
      </div>
      <div class="dm-kit__scroll"><div class="dmk-pas"><span class="dmk-pas__d">Kit em produção no protótipo.</span></div></div>
      <div class="dm-kit__pe"><button class="dmb dmb--go" disabled>${H(lblw.txt)}</button></div>
    </div></div>`;
  }
  const eg = deusKitEfetivo(k, g);
  const linha = ([sl, lab]) => {
    const a = sl === 'defesa' ? (typeof DEFESA !== 'undefined' ? DEFESA : null) : (eg.ab || []).find(x => x.slot === sl);
    if (!a) return '';
    const nv = sl === 'defesa' ? 1 : nlNivel(k, sl);   // §342b: nível REAL da conta, sempre visível ao lado do tipo
    return `<div class="dmk-ab">
      <span class="dmk-ab__art">${slot('skill-' + k + '-' + sl, '', null, 0, false, corEnergia(a.cost))}</span>
      <div class="dmk-ab__body">
        <div class="dmk-ab__top"><b class="dmk-ab__n">${H(a.nome)}</b><span class="dmk-ab__tag">${lab}</span><span class="dmk-ab__nv">Nv ${nv}</span></div>
        <div class="dmk-ab__meta">${_montCustoHTML(a.cost, 16)}<span class="dmk-ab__cd">${a.cd ? 'recarga ' + a.cd : 'sem recarga'}</span></div>
        <div class="dmk-ab__desc">${realce(a.desc || '')}</div>
      </div></div>`;
  };
  const lbl = cfg.kitLabel ? cfg.kitLabel(k) : _montKitLabelPadrao(k, cfg);   // §344: o rótulo/ação do botão vem do cfg
  const acao = lbl.disabled ? `<button class="dmb dmb--go" disabled>${H(lbl.txt)}</button>`
    : `<button class="dmb dmb--go" data-kit-toggle="${k}">${H(lbl.txt)}</button>`;
  // §342b: cabeçalho e botão FIXOS; a lista de habilidades (+ passiva) rola por dentro → o painel inteiro cabe nos 852.
  return `<div class="dm-kit" id="dmkit"><div class="dm-kit__card">
    <div class="dm-kit__cab">
      <span class="dm-kit__p">${slot('god-' + k, ini(hg.nome), COR(hg.elem), 40)}</span>
      <div class="dm-kit__id"><h2 class="cin dm-kit__nome">${H(hg.nome)}</h2><span class="dm-kit__meta">${orbe(hg.elem, 16)}<span class="dm-kit__f">${H(hg.funcao || '')}</span></span></div>
      <button class="dm-kit__x" data-kit-x="1" aria-label="Fechar">✕</button>
    </div>
    <div class="dm-kit__scroll">
      ${g.passiva ? `<div class="dmk-pas"><span class="dmk-pas__t">PASSIVA · ${H(g.passiva.nome)}</span><span class="dmk-pas__d">${realce(g.passiva.desc || '')}</span></div>` : ''}
      <div class="dm-kit__abs">${[['basico', 'BÁSICO'], ['habilidade', 'HABILIDADE'], ['milagre', 'MILAGRE'], ['defesa', 'DEFESA']].map(linha).join('')}</div>
    </div>
    <div class="dm-kit__pe">${acao}</div>
  </div></div>`;
}

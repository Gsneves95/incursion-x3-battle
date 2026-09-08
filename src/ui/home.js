// ui/home.js — a TELA INICIAL (hub) e a LISTA DE PROVAÇÕES (F3.0).
// O jogo é APLICATIVO de celular em paisagem. A home é um CARROSSEL HORIZONTAL de 7
// banners ilustrados (arquivo em web/banners/, servido como os discos de web/skills/ —
// nunca base64). A ARTE já traz título e subtítulo; o HTML NÃO repete texto — só
// acrescenta o DADO VIVO, e só onde ele muda. Alvo de toque = o cartão inteiro
// (202×314, muito acima dos 76px do invariante); nada de hover — o selecionado se
// marca por CONTORNO. O risco do gesto (rolar ≠ abrir) mora no ligarHome: um limiar
// de ~10px separa arrastar (rola) de tocar (abre).

/* ---------- metadados de exibição (ROSTER tem os 100, inclusive sem kit) ---------- */
const HRM = {}; ROSTER.forEach(e => HRM[e.key] = e);

// Os 8 destinos, na ordem do carrossel (§213). `arte` = arquivo em web/banners/<arte>.webp;
// `placeholder:true` desenha um cartão de espera (fundo escuro + título em ouro, padrão da
// série) até a arte chegar. `rota` nula = cartão sem navegação (PvP, Fase 5). Loja cai no
// marcador "em breve"; Batalha CPU liga na seleção→sandbox. PROVAÇÕES aponta para o marcador
// de MISSÕES (que chegam no PvP); DESAFIOS aponta para o hub de pergaminhos+semanal+composição.
const HOME_BANNERS = [
  { chave: 'campanha',    arte: 'campanha',    rotulo: 'Campanha',    rota: 'campanha' },
  { chave: 'provacoes',   arte: 'provacoes',   rotulo: 'Provações',   rota: 'provacoes' },
  { chave: 'desafios',    arte: 'desafios',    rotulo: 'Desafios',    rota: 'desafios' },
  { chave: 'invocacao',   arte: 'invocacao',   rotulo: 'Invocação',   rota: 'invocacao' },
  { chave: 'colecao',     arte: 'colecao',     rotulo: 'Coleção',     rota: 'colecao' },
  { chave: 'loja',        arte: 'loja',        rotulo: 'Loja',        rota: 'embreve', titulo: 'Loja' },
  { chave: 'batalha-cpu', arte: 'batalha-cpu', rotulo: 'Batalha CPU', rota: 'selecao', params: { novo: true } },
  { chave: 'pvp',         arte: 'batalha-pvp', rotulo: 'PvP',         rota: 'pvp' },
];

// numeral romano do capítulo (1→I); pequeno o bastante para o Capítulo 1 e além.
function romanoCap(n){ return ['','I','II','III','IV','V','VI','VII','VIII','IX','X'][n] || ('' + n); }

// nº de Provações que a lista mostra — 90 (não 91, não 63): o global PROVACOES é
// injetado na build a partir de data/provacoes/*.json (um arquivo por deus carimbado).
function totalProvacoes(){ return (typeof PROVACOES !== 'undefined') ? PROVACOES.length : 0; }

// O DADO VIVO por cima da arte — SÓ onde muda, e nunca sobre o título (que mora na
// base da arte): os selos vão no TOPO; a faixa da Campanha ocupa o rodapé que a arte
// deixou limpo de propósito. Loja e Batalha CPU não têm dado vivo; o PvP leva o selo
// "Fase 5". Zero reescrita de título — a arte já diz o nome.
function bannerVivoHTML(d){
  if (d.chave === 'campanha'){
    const cap = (typeof CAMPANHA !== 'undefined' && CAMPANHA && CAMPANHA.capitulo) || 1;
    const reg = (typeof CAMPANHA !== 'undefined' && CAMPANHA && CAMPANHA.regiao) || '';
    const total = (typeof CAMPANHA !== 'undefined' && CAMPANHA && CAMPANHA.encontros) ? CAMPANHA.encontros.length : 0;
    const feitos = (perfil && perfil.campanha && Array.isArray(perfil.campanha.concluidas)) ? perfil.campanha.concluidas.length : 0;
    const pct = total ? Math.round(feitos / total * 100) : 0;
    return `<div class="bcard__faixa">
      <div class="bcard__faixatop"><span>Capítulo ${H(romanoCap(cap))}${reg ? ' · ' + H(reg) : ''}</span><span class="bcard__prog">${feitos}/${total}</span></div>
      <div class="bcard__barra"><i style="width:${pct}%"></i></div>
    </div>`;
  }
  const selo = t => `<span class="bcard__selo">${H(t)}</span>`;
  if (d.chave === 'provacoes'){   // MISSÕES (§234): conquistados/total quando online; senão o total do mapa.
    const total = (typeof MISSOES !== 'undefined' && MISSOES.missoes) ? Object.keys(MISSOES.missoes).length : 0;
    if (!total) return selo('Missões');
    const lib = (contaAtual && contaAtual.missoes && Array.isArray(contaAtual.missoes.liberados)) ? contaAtual.missoes.liberados.length : null;
    return selo(lib != null ? `${lib}/${total}` : `${total}`);
  }
  if (d.chave === 'desafios') return selo(`${acervoPergaminhos().length}`);   // acervo de pergaminhos (63), não as 90 do dado
  if (d.chave === 'invocacao'){
    const p = (perfil && perfil.invocacao) ? (perfil.invocacao.desdeUltimoSS || 0) : 0;
    const duro = (typeof ECONOMIA !== 'undefined' && ECONOMIA.invocacao && ECONOMIA.invocacao.pity) ? ECONOMIA.invocacao.pity.duro : 0;
    return duro ? selo(`${p}/${duro}`) : '';
  }
  if (d.chave === 'colecao'){
    const donos = (perfil && perfil.deuses) ? Object.keys(perfil.deuses).length : 0;
    const total = (typeof ROSTER !== 'undefined') ? ROSTER.length : 100;
    return selo(`${donos}/${total}`);
  }
  if (d.chave === 'pvp') return '';   // §236: PvP está vivo (precisa do servidor; o lobby explica)
  return '';
}

function bannerCardHTML(d){
  const off = !d.rota;
  const tag = off ? 'div' : 'button';                 // sem rota = não navega, não foca
  const attr = off ? '' : ` data-dest="${H(d.chave)}"`;
  const cls = ['bcard']; if (off) cls.push('bcard--off');   // §250: `bcard--pvp` (o cinza "Fase 5") saiu — o PvP tem funcionalidade (lobby §236, pareamento §225, ranqueado §226, servidor §237); marcador de indisponível num cartão com rota viva lê como travado
  // PLACEHOLDER (§213): destino sem arte ainda (Desafios) desenha um cartão de espera no padrão
  // da série — fundo escuro + título em ouro — SEM pedir um arquivo que dá 404. Quando a arte
  // chegar, tira-se `placeholder` do destino e volta a ser <img>.
  const arte = d.placeholder
    ? `<div class="bcard__ph"><span class="bcard__ph-orn">◈</span><span class="bcard__ph-sub">Em breve</span><span class="bcard__ph-t">${H(d.rotulo)}</span></div>`
    // <img> ARQUIVO (nunca base64) + fallback: se a arte não carregar, onerror remove o <img>
    // e o rótulo-reserva reaparece (o :has do CSS o esconde só enquanto há arte).
    : `<img class="bcard__art" src="banners/${H(d.arte)}.webp" alt="${H(d.rotulo)}" loading="lazy" onerror="this.remove()">
    <span class="bcard__fallback">${H(d.rotulo)}</span>`;
  return `<${tag} class="${cls.join(' ')}"${attr}>
    ${arte}
    ${bannerVivoHTML(d)}
  </${tag}>`;
}

function renderHome(){
  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="stagemark">INCURSION</div>
  <div class="home">
    <header class="home__cab">
      <h1 class="home__marca">INCURSION</h1>
      <span class="home__sub">x3 Battle · investida tática 3 contra 3</span>
    </header>
    <div class="hscroll"><nav class="htrack">${HOME_BANNERS.map(bannerCardHTML).join('')}</nav></div>
  </div>
  </div>`;
  ligarHome();
  fit();
}

function ligarHome(){
  // ROLAR ≠ ABRIR: o carrossel rola por arraste nativo (overflow-x). O perigo é o toque
  // disparar o destino ao fim de uma rolagem. Guarda por LIMIAR: se o dedo andou mais que
  // ~10px entre o pressionar e o soltar, foi rolagem — o clique seguinte não navega.
  const sc = stage.querySelector('.hscroll');
  let bx = 0, by = 0, arrastou = false;
  if (sc){
    sc.addEventListener('pointerdown', e => { bx = e.clientX; by = e.clientY; arrastou = false; });
    sc.addEventListener('pointermove', e => { if (Math.abs(e.clientX - bx) > 10 || Math.abs(e.clientY - by) > 10) arrastou = true; });
  }
  [...stage.querySelectorAll('.bcard[data-dest]')].forEach(b => {
    b.onclick = () => {
      if (arrastou) return;                            // arrastou = rolagem, não abre
      const d = HOME_BANNERS.find(x => x.chave === b.dataset.dest);
      if (!d || !d.rota) return;
      if (d.rota === 'embreve') ir('embreve', { titulo: d.titulo });
      else ir(d.rota, d.params || {});
      render();
    };
  });
}

/* ---------- marcador genérico "em breve" (Campanha, Invocação, Coleção) ---------- */
// Um só render para os três: o destino existe na navegação (a home fica navegável nos
// cinco), mas a tela é um marcador honesto — nada de invocação, loja ou coleção ainda.
function renderEmBreve(){
  const p = paramsAtuais();
  const titulo = (p && p.titulo) || 'Em breve';
  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="stagemark">INCURSION</div>
  <div class="tela">
    <header class="tela__cab">
      <button class="b b--quiet b--md" id="bvoltar">‹ Início</button>
      <h1 class="tela__titulo">${H(titulo)}</h1>
      <span class="tela__espaco"></span>
    </header>
    <div class="tela__vazio">
      <span class="tela__vazioic">◈</span>
      <p class="tela__vaziomsg">${H(titulo)} chega numa fase adiante.<br>Por ora, a jornada é pelos Desafios.</p>
    </div>
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  fit();
}

/* ================= MISSÕES (F6/§234) — a TELA: o MAPA DA COLEÇÃO ==================
// Responde três perguntas: o que eu tenho, o que falta, e o que faço para conseguir. Quatro seções
// nesta ordem: EM PROGRESSO (contador ao vivo) · DISPONÍVEIS (companheiro na mão, volume não) ·
// TRAVADAS (falta o companheiro — MOSTRA qual + o motivo mitológico) · CONCLUÍDAS (histórico).
// O PROGRESSO vem do SERVIDOR (§228): contaAtual.missoes + contaAtual.perfil.deuses. Sem servidor
// não há progresso — a tela DIZ isso honestamente em vez de mostrar zero. */

// adjetivo do panteão concordando com "vitórias" (feminino plural). Para "12/40 vitórias gregas".
const PANT_ADJ = { 'Grega': 'gregas', 'Nórdica': 'nórdicas', 'Egípcia': 'egípcias', 'Japonesa': 'japonesas', 'Chinesa': 'chinesas', 'Hindu': 'hindus', 'Brasileira': 'brasileiras', 'Africana': 'africanas', 'Celta': 'celtas', 'Maia': 'maias' };
function nomeM(k){ return (typeof MISSOES !== 'undefined' && MISSOES.missoes[k] && MISSOES.missoes[k].nome) || (HRM[k] && HRM[k].nome) || k; }
function missoesDisponivel(){ return typeof MISSOES !== 'undefined' && MISSOES.missoes && Object.keys(MISSOES.missoes).length > 0; }

// §241 — a FAIXA atual do jogador (do servidor; o cliente NUNCA classifica ranque). Índice na escala.
function _temDeus(k){ const owned = (contaAtual && contaAtual.perfil && contaAtual.perfil.deuses) || {}; return (MISSOES.iniciais || []).includes(k) || !!owned[k]; }
function faixaAtualIdx(){
  const faixas = MISSOES.faixas || [];
  const ch = contaAtual && contaAtual.ranque && contaAtual.ranque.faixa && contaAtual.ranque.faixa.chave;
  const i = faixas.findIndex(f => f.chave === ch);
  return i >= 0 ? i : 0;
}
// PROGRESSO desde o desbloqueio (§241): volume e sequência descontam a BASE gravada no servidor.
function _progVol(k){
  const m = MISSOES.missoes[k], led = (contaAtual && contaAtual.missoes) || {};
  const base = ((led.desbloqueio || {})[k] || {}).volBase || 0;
  const cur = (led.vitoriasPanteaoPvP || {})[m.panteao] || 0;
  return { v: Math.max(0, cur - base), n: m.vitoriasPanteao || 0 };
}
function _progSeq(k){
  const m = MISSOES.missoes[k], led = (contaAtual && contaAtual.missoes) || {};
  const alvo = m.seguidasAlvo || (m.companheiro ? { tipo: 'companheiro', chave: m.companheiro } : { tipo: 'panteao', chave: m.panteao });
  const cur = alvo.tipo === 'companheiro' ? ((led.sequenciaPvP || {})[alvo.chave] || 0) : ((led.sequenciaPanteaoPvP || {})[alvo.chave] || 0);
  const base = ((led.desbloqueio || {})[k] || {}).seqBase || 0;
  const eff = (cur < base) ? cur : (cur - base);
  return { s: Math.max(0, eff), n: m.seguidas || 0, tipo: alvo.tipo, alvoNome: alvo.tipo === 'companheiro' ? nomeM(alvo.chave) : alvo.chave };
}
// ESTADO funcional de uma missão dentro de uma faixa (aberta ou não pelo ranque).
function estadoMissao(k, faixaAberta){
  if (_temDeus(k)) return 'concluida';
  if (!faixaAberta) return 'ranque';                          // §241: travada pelo PORTÃO DE RANQUE
  const m = MISSOES.missoes[k];
  if (m.companheiro && !_temDeus(m.companheiro)) return 'travada';   // falta o companheiro (cadeia)
  const pv = _progVol(k), ps = _progSeq(k);
  return (pv.v === 0 && ps.s === 0) ? 'disponivel' : 'progresso';
}
function contarConquistados(){ return Object.keys(MISSOES.missoes).filter(_temDeus).length; }

// os "requisitos ao vivo" (o contador do servidor, DESDE o desbloqueio): "12/40 vitórias gregas · 2/3 seguidas com Cérbero".
function reqAoVivoHTML(k){
  const m = MISSOES.missoes[k];
  const pv = _progVol(k), ps = _progSeq(k);
  const adj = PANT_ADJ[m.panteao] || H(m.panteao);
  let s = `<span class="mreq__v"><b>${Math.min(pv.v, pv.n)}</b>/${pv.n} vitórias ${adj}</span>`;
  if (ps.n){
    const alvo = ps.tipo === 'companheiro' ? ('com ' + H(ps.alvoNome)) : (adj);
    s += `<span class="mreq__s"><b>${Math.min(ps.s, ps.n)}</b>/${ps.n} seguidas ${alvo}</span>`;
  }
  return s;
}

// TILE de missão: retrato + versalete (linguagem da Fase 4). `estado` muda a cauda e a moldura.
function tileMissaoHTML(k, estado){
  const m = MISSOES.missoes[k];
  const g = HRM[k] || { nome: nomeM(k), elem: 'Umbra' };
  const rar = raridadeDe(k);
  const cor = (estado === 'travada' || estado === 'ranque') ? '#6a6390' : COR(g.elem);
  let cauda;
  if (estado === 'progresso') cauda = `<span class="mtile__req">${reqAoVivoHTML(k)}</span>`;
  else if (estado === 'disponivel') cauda = `<span class="mtile__req"><span class="mreq__v"><b>0</b>/${m.vitoriasPanteao} vitórias ${PANT_ADJ[m.panteao] || H(m.panteao)}</span><span class="mreq__pronto">${m.companheiro ? H(nomeM(m.companheiro)) + ' na mão ✓' : 'pronto para começar'}</span></span>`;
  else if (estado === 'travada') cauda = `<span class="mtile__trava"><span class="mtrava__falta">precisa de <b>${H(nomeM(m.companheiro))}</b></span><span class="mtrava__motivo">${H(m.motivo)}</span></span>`;
  else if (estado === 'ranque') cauda = `<span class="mtile__trava"><span class="mtrava__falta">abre em <b>${H(m.faixaNome)}</b></span><span class="mtrava__motivo">${H(m.motivo)}</span></span>`;
  else cauda = `<span class="mtile__feito">✓ conquistado</span>`;
  return `<button class="mtile mtile--${estado}" data-deus="${k}" title="${H(g.nome)}">
    <span class="mtile__rar rar--${rar}"></span>
    <span class="mtile__art">${slot('god-' + k, ini(g.nome), cor, 34)}</span>
    <span class="mtile__body">
      <span class="mtile__nome">${H(g.nome)}</span>
      ${cauda}
    </span>
  </button>`;
}

// §241 item 5 — AGRUPA POR FAIXA: uma seção por faixa, com quantas ela libera e o status de ranque
// ("aberta N/N" ou "falta subir X faixas"). Ver o que espera nas faixas de cima faz querer subir.
function faixasMissaoHTML(){
  const faixas = MISSOES.faixas || [];
  const atual = faixaAtualIdx();
  const porFaixa = faixas.map(() => []);
  for (const k of Object.keys(MISSOES.missoes)){ const fi = MISSOES.missoes[k].faixaIndice; if (fi >= 0 && fi < porFaixa.length) porFaixa[fi].push(k); }
  const ord = arr => arr.sort((a,b)=> (raridadeDe(b)+'').localeCompare(raridadeDe(a)) || nomeM(a).localeCompare(nomeM(b)));
  return faixas.map((f, fi) => {
    const arr = ord(porFaixa[fi]);
    const aberta = fi <= atual;
    const feitos = arr.filter(_temDeus).length;
    const faltam = fi - atual;
    const status = aberta
      ? `<span class="mfx__ok">${feitos}/${arr.length} conquistados</span>`
      : `<span class="mfx__lock">falta subir ${faltam} faixa${faltam > 1 ? 's' : ''}</span>`;
    const tiles = arr.map(k => tileMissaoHTML(k, estadoMissao(k, aberta))).join('');
    return `<section class="msec msec--faixa ${aberta ? 'mfx--aberta' : 'mfx--lock'}">
      <div class="msec__cab mfx__cab">
        <h2>${H(f.nome)}</h2>
        <span class="mfx__n">${arr.length} Provaç${arr.length === 1 ? 'ão' : 'ões'}</span>
        ${status}
      </div>
      <div class="mgrid">${tiles}</div>
    </section>`;
  }).join('');
}

// SEM SERVIDOR: o progresso vive no servidor (§228). Não mostra zero — diz a verdade e ainda deixa
// LER as histórias (os 91 motivos foram escritos para serem lidos), como catálogo sem contador.
function missoesOfflineHTML(){
  const cat = Object.keys(MISSOES.missoes).sort((a,b)=> nomeM(a).localeCompare(nomeM(b))).map(k => {
    const m = MISSOES.missoes[k];
    const alvo = m.companheiro ? `precisa de <b>${H(nomeM(m.companheiro))}</b>` : `volume ${H(m.panteao)}`;
    return `<button class="mcat" data-deus="${k}" title="${H(nomeM(k))}">
      <span class="mcat__art">${slot('god-' + k, ini(nomeM(k)), '#6a6390', 26)}</span>
      <span class="mcat__b"><span class="mcat__n">${H(nomeM(k))}</span><span class="mcat__f">${alvo}</span><span class="mcat__m">${H(m.motivo)}</span></span>
    </button>`;
  }).join('');
  return `<div class="moff">
    <span class="moff__ic">◈</span>
    <p class="moff__msg">As missões contam no <b>PvP</b>. <b>Conecte</b> para ver seu progresso — o contador vive no servidor.</p>
  </div>
  <div class="msec__cab msec__cab--cat"><h2>As histórias</h2><span class="msec__n">${Object.keys(MISSOES.missoes).length}</span></div>
  <div class="mcatgrid">${cat}</div>`;
}

function renderMissoes(){
  const online = !!contaAtual;
  let corpo;
  if (!missoesDisponivel()){
    corpo = `<div class="tela__vazio"><span class="tela__vazioic">◈</span><p class="tela__vaziomsg">O mapa das missões chega com os dados.</p></div>`;
  } else if (!online){
    corpo = `<div class="tela__rol">${missoesOfflineHTML()}</div>`;
  } else {
    // §241 item 5: o mapa da coleção AGRUPADO POR FAIXA (o ranque revela). Cada faixa diz quantas libera
    // e o status ("aberta N/N" ou "falta subir X faixas"); os tiles trazem o estado funcional (§234).
    const atual = (MISSOES.faixas || [])[faixaAtualIdx()];
    const cabRanque = atual ? `<p class="mfx__voce">Você está em <b>${H(atual.nome)}</b> — suba de ranque no PvP para revelar as faixas de cima.</p>` : '';
    corpo = `<div class="tela__rol">${cabRanque}${faixasMissaoHTML()}</div>`;
  }
  const cont = online && missoesDisponivel() ? `<span class="tela__cont">${contarConquistados()}/${Object.keys(MISSOES.missoes).length}</span>` : `<span class="tela__espaco"></span>`;
  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="stagemark">INCURSION</div>
  <div class="tela">
    <header class="tela__cab">
      <button class="b b--quiet b--md" id="bvoltar">‹ Início</button>
      <h1 class="tela__titulo">Missões</h1>
      ${cont}
    </header>
    ${corpo}
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  // ELO com o detalhe do deus (§220): da missão vai-se ao deus.
  [...stage.querySelectorAll('.mtile[data-deus], .mcat[data-deus]')].forEach(b => {
    b.onclick = () => { ir('deus', { key: b.dataset.deus }); render(); };
  });
  // AO VIVO: se online, re-busca a conta do servidor UMA vez ao abrir (progresso fresco), sem laço.
  if (online && typeof refrescarConta === 'function') refrescarConta();
  fit();
}

/* ================= PvP — o LOBBY (F5.3/§236): apelido + time de 3 + entrar na fila ==================
// O PvP precisa do SERVIDOR (a partida é dele, §223). Sem transporte (aberto por file:// ou sem conexão),
// a tela DIZ como chegar ao servidor — abrir pelo endereço da máquina, na mesma rede. Com servidor: o
// jogador põe o apelido (uma vez), monta 3 deuses que POSSUI (o servidor valida a posse), e entra na
// fila (amistoso ou ranqueado). O pareamento chega por PUSH e a batalha começa (view.js/aoPushGlobal). */
let pvpTime = [], pvpEstado = 'idle', pvpMsg = '';   // idle | fila
function pvpReset(){ pvpTime = []; pvpEstado = 'idle'; pvpMsg = ''; }
function pvpJogavel(k){ return temDeus(k) && typeof GODS !== 'undefined' && !!GODS[k]; }
function pvpToggle(k){ const i = pvpTime.indexOf(k); if (i >= 0) pvpTime.splice(i, 1); else if (pvpTime.length < 3) pvpTime.push(k); }

async function pvpEntrar(ranqueado){
  if (pvpEstado === 'fila') return;
  const temNick = !!(contaAtual && contaAtual.nick);
  const nickEl = stage.querySelector('#pvpnick');
  const nick = temNick ? contaAtual.nick : (nickEl ? nickEl.value.trim() : '');
  if (!temNick && (!nick || nick.length < 3)) { pvpMsg = 'Escolha um apelido (ao menos 3 letras).'; render(); return; }
  if (pvpTime.length !== 3) { pvpMsg = 'Escolha 3 deuses para o seu time.'; render(); return; }
  pvpEstado = 'fila'; pvpMsg = ''; render();
  const fn = ranqueado ? (typeof iniciarRanqueado === 'function' ? iniciarRanqueado : null) : (typeof iniciarPvP === 'function' ? iniciarPvP : null);
  if (!fn) { pvpEstado = 'idle'; pvpMsg = 'PvP indisponível.'; render(); return; }
  const r = await fn(temNick ? null : nick, pvpTime.slice());
  if (r && r.erro) { pvpEstado = 'idle'; pvpMsg = r.erro; render(); return; }
  if (!temNick && nick && contaAtual) contaAtual.nick = nick;   // o servidor confirmou o nick em definirNick
  if (r && r.fase === 'pareado') return;   // entrarPvPBatalha já navegou para a batalha
  // na_fila: fica aguardando o PUSH de pareamento (aoPushGlobal → entrarPvPBatalha)
}

function pvpSlotHTML(i){
  const k = pvpTime[i];
  if (!k) return `<div class="pvps pvps--vazio"><span>${i + 1}</span></div>`;
  const g = HRM[k] || { nome: k, elem: 'Umbra' };
  return `<button class="pvps" data-pvptira="${k}" title="${H(g.nome)}">
    <span class="pvps__art">${slot('god-' + k, ini(g.nome), COR(g.elem), 30)}</span>
    <span class="pvps__n">${H(g.nome)}</span></button>`;
}
function pvpTileHTML(k){
  const g = HRM[k] || { nome: k, elem: 'Umbra' };
  const sel = pvpTime.includes(k);
  return `<button class="pvpt ${sel ? 'is-sel' : ''}" data-pvpsel="${k}" title="${H(g.nome)}">
    <span class="pvpt__art">${slot('god-' + k, ini(g.nome), COR(g.elem), 26)}</span>
    <span class="pvpt__n">${H(g.nome)}</span>${sel ? '<span class="pvpt__ck">✓</span>' : ''}</button>`;
}

function renderPvP(){
  const online = !!(typeof contaTransporte !== 'undefined' && contaTransporte);
  let corpo;
  if (!online){
    corpo = `<div class="tela__rol"><div class="moff">
      <span class="moff__ic">◈</span>
      <div><p class="moff__msg"><b>O PvP precisa do servidor.</b> Abra o jogo pelo <b>endereço da máquina</b> que roda o servidor — algo como <b>http://192.168.x.x:8788</b> — no navegador do celular, na <b>mesma rede Wi-Fi</b>.</p>
      <p class="moff__msg" style="margin-top:6px">Quem roda o servidor vê o endereço exato ao ligá-lo.</p></div>
    </div></div>`;
  } else if (!contaAtual){
    corpo = `<div class="tela__vazio"><span class="tela__vazioic">◈</span><p class="tela__vaziomsg">Conta ainda não criada — reabra o aplicativo.</p></div>`;
  } else if (pvpEstado === 'fila'){
    corpo = `<div class="tela__vazio"><span class="tela__vazioic pvpfila__ic">◈</span>
      <p class="tela__vaziomsg"><b>Na fila…</b> aguardando um oponente entrar.<br>Deixe esta tela aberta; a batalha começa sozinha ao parear.</p>
      <button class="b b--quiet b--md" id="pvpcancelar">Sair da fila</button></div>`;
  } else {
    const jogaveis = ROSTER.map(e => e.key).filter(pvpJogavel).sort((a, b) => nomeM(a).localeCompare(nomeM(b)));
    const temNick = !!contaAtual.nick;
    const nickBloco = temNick
      ? `<div class="pvpnick pvpnick--fixo">apelido <b>${H(contaAtual.nick)}</b></div>`
      : `<div class="pvpnick"><label>Seu apelido<input id="pvpnick" maxlength="16" placeholder="3 a 16 letras" autocomplete="off"></label></div>`;
    const pronto = pvpTime.length === 3;
    corpo = `<div class="tela__rol">
      ${nickBloco}
      <div class="pvpsel__cab"><h2>Seu time</h2><span class="msec__n">${pvpTime.length}/3</span></div>
      <div class="pvpslots">${[0, 1, 2].map(pvpSlotHTML).join('')}</div>
      ${pvpMsg ? `<p class="pvperro">${H(pvpMsg)}</p>` : ''}
      <div class="pvpbtns">
        <button class="b b--primary b--md" id="pvpamistoso" ${pronto ? '' : 'disabled'}>Entrar na fila</button>
        <button class="b b--sec b--md" id="pvpranqueado" ${pronto ? '' : 'disabled'}>Ranqueado</button>
      </div>
      <div class="pvpsel__cab"><h2>Seus deuses</h2><span class="msec__n">${jogaveis.length}</span></div>
      <div class="pvpgrid">${jogaveis.map(pvpTileHTML).join('')}</div>
    </div>`;
  }
  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="stagemark">INCURSION</div>
  <div class="tela">
    <header class="tela__cab">
      <button class="b b--quiet b--md" id="bvoltar">‹ Início</button>
      <h1 class="tela__titulo">PvP</h1>
      <span class="tela__espaco"></span>
    </header>
    ${corpo}
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  stage.querySelectorAll('[data-pvpsel]').forEach(b => b.onclick = () => { pvpToggle(b.dataset.pvpsel); pvpMsg = ''; render(); });
  stage.querySelectorAll('[data-pvptira]').forEach(b => b.onclick = () => { pvpToggle(b.dataset.pvptira); render(); });
  const ba = stage.querySelector('#pvpamistoso'); if (ba) ba.onclick = () => pvpEntrar(false);
  const br = stage.querySelector('#pvpranqueado'); if (br) br.onclick = () => pvpEntrar(true);
  const bc = stage.querySelector('#pvpcancelar'); if (bc) bc.onclick = () => { pvpReset(); ir('home', {}, { substituir: true }); render(); };
  fit();
}

/* ---------- acervo dos PERGAMINHOS (F4/§212) ----------
// As 90 Provações migraram para o ACERVO de Pergaminhos: desafios de perícia validados pelo
// solucionador (carimbo + nós medidos + montagem). As 27 GENÉRICAS ficam no dado (histórico)
// mas SAEM do acervo jogável — existiam só p/ dar rota de aquisição aos 28 sem puzzle viável,
// e aquisição virou gacha-only (§212). Vencer um Pergaminho NÃO libera deus (coleção = só
// gacha) — credita maestria (cosmética) e grava o placar. A FAIXA de dificuldade DERIVA dos
// nós que o solucionador já mediu (injetada no slim pelo build): Fácil/Médio/Difícil/Épico. */
const NIVEL_ORDEM = { 'Rito': 0, 'Provação': 1, 'Ordália': 2 };
function nivelPeso(n){ return (n in NIVEL_ORDEM) ? NIVEL_ORDEM[n] : 1; }
const FAIXA_ORDEM = { 'Fácil': 0, 'Médio': 1, 'Difícil': 2, 'Épico': 3 };
function faixaPeso(f){ return (f in FAIXA_ORDEM) ? FAIXA_ORDEM[f] : 1; }
function faixaClasse(f){ return ({ 'Fácil': 'facil', 'Médio': 'medio', 'Difícil': 'dificil', 'Épico': 'epico' })[f] || 'medio'; }
// o acervo JOGÁVEL = as 63 (genéricas fora); o dado PROVACOES mantém as 90 (histórico).
function acervoPergaminhos(){ return ((typeof PROVACOES !== 'undefined') ? PROVACOES : []).filter(p => !p.generica); }
function pergaminhoVencido(k){ return !!(perfil && perfil.provacoes && perfil.provacoes[k] && perfil.provacoes[k].lances != null); }

// dono = o jogador JÁ TEM o deus. Provação de deus que já se tem fica como CONCLUÍDA
// (decisão de produto: some da fila do que falta, mas não da lista — o jogador vê o
// que já conquistou), agrupada ABAIXO das disponíveis. Sem localStorage aqui: o perfil
// global já está carregado no boot.
function temDeus(k){ return !!(perfil && perfil.deuses && perfil.deuses[k]); }

function pipsDif(n){
  let s = '';
  for (let i = 1; i <= 3; i++) s += `<i class="${i <= n ? 'on' : ''}"></i>`;
  return `<span class="prow__dif" title="dificuldade ${n}">${s}</span>`;
}

function linhaProvHTML(p){
  const g = HRM[p.key] || { nome: p.key, elem: 'Umbra', faccao: '' };
  const rec = (perfil && perfil.provacoes && perfil.provacoes[p.key]) ? perfil.provacoes[p.key] : null;
  const venc = !!(rec && rec.lances != null);
  const cls = ['prow']; if (venc) cls.push('prow--feita');
  const selo = venc
    ? `<span class="prow__selo">✓ vencido · ${rec.lances} lance${rec.lances === 1 ? '' : 's'}</span>`
    : '';
  return `<li class="prowli"><button class="${cls.join(' ')}" data-prova="${p.key}">
    <span class="prow__p">${slot('god-' + p.key, ini(g.nome), COR(g.elem), 22)}</span>
    <span class="prow__el" style="background:${COR(g.elem)}"></span>
    <span class="prow__id">
      <span class="prow__deus">${H(g.nome)}${selo}</span>
      <span class="prow__tit">${H(p.titulo || '')}${g.faccao ? ` · ${H(g.faccao)}` : ''}</span>
    </span>
    <span class="prow__meta">
      <span class="prow__faixa faixa--${faixaClasse(p.faixa)}">${H(p.faixa || '—')}</span>
      <span class="prow__seta">${venc ? '↻' : '▷'}</span>
    </span>
  </button></li>`;
}

// §245 — a TELA "Desafios": o DESAFIO DA SEMANA (dá Gema), os Desafios de Composição, e os DESAFIOS POR
// DEUS (comprados com Essência → maestria; a moldura sai no Mestre). Só de deus que você TEM.
let desafioDesistindo = null;   // deus com a desistência em confirmação (inline, sem modal)
// UMA linha de desafio por deus, com a ação conforme o estado (comprar / jogar+desistir / recarga / mestre).
function desafioRowHTML(k){
  const g = HRM[k] || { nome: k, elem: 'Umbra' };
  const nv = nivelMaestria(k), v = maestriaDe(k).vitorias || 0, alvo = MAESTRIA_LIMIAR.mestre;
  const e = desafioEstado(k), cfg = DESAFIO_CFG();
  let acao;
  if (nv === 4) acao = `<span class="dsf__mestre" title="dominado — a moldura saiu">★ Mestre</span>`;
  else if (desafioDesistindo === k) acao = `<span class="dsf__conf">desistir?<button class="b b--danger b--sm" data-desiste-ok="${k}">Sim</button><button class="b b--quiet b--sm" data-desiste-no="1">Não</button></span>`;
  else if (e.estado === 'ativo') acao = `<span class="dsf__acts"><button class="b b--primary b--sm" data-jogar="${k}">Jogar</button><button class="b b--quiet b--sm" data-desistir="${k}">Desistir</button></span>`;
  else if (e.estado === 'recarga') acao = `<span class="dsf__recarga" title="recarga após cumprir/desistir (8h)">↻ ${fmtRecarga(e.restaMs)}</span>`;
  else { const pc = podeComprarDesafio(k); acao = `<button class="b b--sec b--sm" data-comprar="${k}" ${pc.ok ? '' : 'disabled'} title="${pc.ok ? 'pilote ' + H(g.nome) + ' até vencer' : H(pc.motivo)}">Comprar ${cfg.custoEssencia} ✦</button>`; }
  return `<li class="dsfli"><div class="dsf dsf--m${nv}">
    <span class="dsf__p">${slot('god-' + k, ini(g.nome), COR(g.elem), 22)}</span>
    <span class="dsf__el" style="background:${COR(g.elem)}"></span>
    <span class="dsf__id">
      <span class="dsf__n">${H(g.nome)}</span>
      <span class="dsf__maes m--${nv}">${MAESTRIA_NOME[nv]} · <b>${Math.min(v, alvo)}</b>/${alvo} p/ Mestre</span>
    </span>
    <span class="dsf__pe">${acao}</span>
  </div></li>`;
}
function renderProvacoes(){
  const meus = (perfil && perfil.deuses) ? Object.keys(perfil.deuses) : [];
  const cfg = DESAFIO_CFG();
  // ordem: em andamento/recarga primeiro, depois compráveis (mais perto do Mestre à frente), Mestres no fim.
  const rank = k => { const nv = nivelMaestria(k); if (nv === 4) return 4; const e = desafioEstado(k); return e.estado === 'ativo' ? 0 : e.estado === 'recarga' ? 1 : 2; };
  const ord = meus.slice().sort((a, b) => rank(a) - rank(b)
    || (maestriaDe(b).vitorias || 0) - (maestriaDe(a).vitorias || 0)
    || ((HRM[a] && HRM[a].nome) || a).localeCompare((HRM[b] && HRM[b].nome) || b, 'pt'));
  const mestres = meus.filter(k => nivelMaestria(k) === 4).length;
  const ess = (perfil && perfil.moedas && perfil.moedas.essencia) || 0;

  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="tela">
    <header class="tela__cab">
      <button class="b b--quiet b--md" id="bvoltar">‹ Início</button>
      <h1 class="tela__titulo">Desafios</h1>
      <span class="tela__cont">${mestres}/${meus.length} ★</span>
    </header>
    <div class="tela__rol" id="provrol">
      ${bannerSemanalHTML()}
      <button class="pdesafios" data-desafios="1"><span>⚔ Desafios de Composição</span><span class="pdesafios__go">›</span></button>
      <div class="psec__cab psec__cab--acervo"><h2>DESAFIOS POR DEUS</h2><span class="psec__n">${cfg.custoEssencia} ✦ · você tem ${ess}</span></div>
      <p class="psec__nota">Escolha um deus que você tem, compre com Essência e pilote-o até vencer: cada desafio dá <b>${cfg.maestriaPorVitoria}</b> de maestria (a <b>moldura</b> sai no Mestre). Um por deus por vez; quantos deuses quiser ao mesmo tempo. Perdeu? Repete de graça. Recarga de ${cfg.recargaHoras}h ao cumprir ou desistir.</p>
      <ul class="dsflist">${ord.map(desafioRowHTML).join('')}</ul>
    </div>
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  const bs = stage.querySelector('.psem[data-semanal]');
  if (bs) bs.onclick = () => iniciarSemanal();
  const bd = stage.querySelector('.pdesafios[data-desafios]');
  if (bd) bd.onclick = () => { ir('composicao'); render(); };
  // COMPRAR → paga e já entra na batalha (perdeu, volta e o "Jogar" repete de graça).
  [...stage.querySelectorAll('[data-comprar]')].forEach(b => b.onclick = () => { const k = b.dataset.comprar; const r = comprarDesafio(k); if (r.ok) iniciarDesafioDeus(k); else render(); });
  [...stage.querySelectorAll('[data-jogar]')].forEach(b => b.onclick = () => iniciarDesafioDeus(b.dataset.jogar));
  [...stage.querySelectorAll('[data-desistir]')].forEach(b => b.onclick = () => { desafioDesistindo = b.dataset.desistir; render(); });
  [...stage.querySelectorAll('[data-desiste-ok]')].forEach(b => b.onclick = () => { desistirDesafio(b.dataset.desisteOk); desafioDesistindo = null; render(); });
  [...stage.querySelectorAll('[data-desiste-no]')].forEach(b => b.onclick = () => { desafioDesistindo = null; render(); });
  fit();
}

// ===================================================================
// F3.1 — O LAÇO: lista → batalha → avaliação → desbloqueio.
// A Provação MONTA o estado (aliados/inimigos/montar), joga como batalha normal
// (a CPU move os inimigos), e a cada render avaliarProvacao decide. A condição fica
// VISÍVEL durante (o HUD), e a DERROTA é legível em três finais: HP, prazo, condição.
// O estado da sessão (prova/provaFim/provaLances) mora em view.js, ao lado de `st`.
// ===================================================================

const SLOT_ROT = { basico: 'o Básico', habilidade: 'a Habilidade', milagre: 'o Milagre', defesa: 'a Defesa' };
const OP_ROT = { '>=': '≥', '<=': '≤', '>': '>', '<': '<', '==': '=' };
const FONTE_ROT = {
  danoAbsorvido: 'dano absorvido', danoRefletido: 'dano refletido', danoArmazenado: 'dano armazenado',
  danoDevolvido: 'dano devolvido', danoBonus: 'dano bônus', contador: 'contador', contadorLado: 'contador do time',
  buffsRoubados: 'buffs roubados', orbesRoubados: 'energia roubada', orbesGuardados: 'energia guardada', curaAcumulada: 'cura',
};
function nomeDoDeus(k){ return (HRM[k] && HRM[k].nome) || k; }
function ctxProva(p){
  const lados = { 0: new Set(p.aliados), 1: new Set(p.inimigos) };
  return { ladoDe: k => lados[0].has(k) ? 0 : lados[1].has(k) ? 1 : undefined };
}
function alvoDe(c){ return c.quantos != null ? c.quantos : c.limiar != null ? c.limiar : null; }

// texto imperativo por predicado (só os USADOS nas 90 + fallback). `conta:true` = tem progresso X/N.
function descreverCondicao(c){
  const est = e => rotuloEfeito(e);
  switch (c.predicado) {
    case 'deadline':          return { texto: `Vença em até ${c.turnos} turnos` };
    case 'semPerderAliado':   return { texto: c.quem ? `Mantenha ${nomeDoDeus(c.quem)} de pé` : (c.exceto ? `Não perca aliados (exceto ${nomeDoDeus(c.exceto)})` : 'Não perca nenhum aliado') };
    case 'protegeDe':         return { texto: c.quem ? `Proteja ${nomeDoDeus(c.quem)} de dano` : 'Proteja os aliados de dano' };
    case 'semDebuffEmAliado': return { texto: 'Não deixe debuff em nenhum aliado' };
    case 'semPerderOrbe':     return { texto: 'Não perca energia para o inimigo' };
    case 'naoReviveInimigo':  return { texto: 'Não deixe nenhum inimigo reviver' };
    case 'protegeHpMax':      return { texto: 'Não perca vida máxima permanente' };
    case 'hpTetoSelf':        return { texto: `Não cure ${nomeDoDeus(c.quem)} acima de ${c.teto}` };
    case 'hpNoFim':           return { texto: `Termine com ${nomeDoDeus(c.quem)} ${OP_ROT[c.op] || c.op} ${c.v} de vida` };
    case 'tetoDeGasto':       return { texto: `Vença gastando no máx. ${c.limiar} de energia própria` };
    case 'proibirSlotProprio':return { texto: `Nunca use ${SLOT_ROT[c.slot] || c.slot}` };
    case 'negarAcaoInimigo':  return { texto: `Impeça o inimigo de usar ${SLOT_ROT[c.slot] || c.slot}${c.max ? ` mais de ${c.max}×` : ''}` };
    case 'buffNoAbate':       return { texto: `Vença com ${est(c.buff)} ativo${c.quem ? ` em ${nomeDoDeus(c.quem)}` : ''}` };
    case 'limparBuffsAntesDeAbate': return { texto: 'Remova todo buff inimigo antes do 1º abate' };
    case 'tituloCaido':       return { texto: `Vença com ${nomeDoDeus(c.quem)} caído` };
    case 'acumulo':           return { texto: `Acumule ${c.limiar} de ${FONTE_ROT[c.fonte] || c.fonte}`, conta: true };
    case 'maximoNumEvento':   return { texto: `Roube ${c.limiar} de ${FONTE_ROT[c.fonte] || c.fonte} de uma vez`, conta: true };
    case 'abatePorExecucao':  return { texto: `Execute ${c.quantos} inimigo${c.quantos === 1 ? '' : 's'}`, conta: true };
    case 'abatePeloProprioLado': return { texto: `Faça o inimigo matar ${c.quantos} dos seus`, conta: true };
    case 'reviveAliado':      return { texto: `Reviva ${c.quantos} aliado${c.quantos === 1 ? '' : 's'}`, conta: true };
    case 'morteEmEstado':     return { texto: c.quantos != null ? `Derrube ${c.quantos} inimigo(s) sob ${est(c.estado)}` : `Cada inimigo deve cair sob ${est(c.estado)}`, conta: c.quantos != null };
    case 'morteComContador':  return { texto: c.quantos != null ? `Derrube ${c.quantos} com ${c.limiar} de ${nomeContador(c.contador)}` : `Cada inimigo cai com ${c.limiar} de ${nomeContador(c.contador)}`, conta: c.quantos != null };
    case 'estadoTurnos':      return { texto: `Mantenha ${H2(c.campo)} por ${c.limiar} turnos`, conta: true };
    case 'statusTurnos':      return { texto: `Mantenha um inimigo em ${est(c.status)} por ${c.limiar} turnos`, conta: true };
    case 'efeitoEmNInimigos': return { texto: `Aplique ${est(c.efeito)} em ${c.limiar != null ? c.limiar : 'todos os'} inimigo(s)`, conta: true };
    case 'stripBuffsInimigo': return { texto: `Remova ${c.quantos} buffs de um inimigo num golpe`, conta: true };
    default:                  return { texto: c.predicado };
  }
}
function H2(s){ return String(s == null ? '' : s); }

// estado + progresso de uma condição, para o HUD (mesma leitura do avaliarProvacao).
function estadoCondicao(c){
  const def = PREDICADOS[c.predicado];
  if (!def || !def.aval) return { estado: 'pendente', texto: descreverCondicao(c).texto, prog: '' };
  const ctx = ctxProva(prova);
  const estado = def.aval(st, c, ctx);
  const d = descreverCondicao(c);
  let prog = '';
  if (d.conta && def.chave) { const alvo = alvoDe(c); const n = def.chave(st, c, ctx); if (alvo != null) prog = `${n}/${alvo}`; }
  return { estado, texto: d.texto, prog };
}

/* ---------- HUD: a condição VISÍVEL durante a partida ----------
   UMA LINHA na FAIXA SUPERIOR (área de estado), FORA do tabuleiro: prazo + estado da
   condição. O texto longo TRUNCA (os chips têm overflow); a versão completa vive na
   tela de resultado/na linha da Provação, onde já cabe. Nunca sobre os discos/retratos. */
function provaHUD(){
  if (!prova) return '';
  const dl = prova.condicoes.find(c => c.predicado === 'deadline');
  const N = dl ? dl.turnos : null;
  const restam = N != null ? Math.max(0, N - st.turno + 1) : null;
  const perigo = restam != null && restam <= 2;
  const extras = prova.condicoes.filter(c => c.predicado !== 'deadline').map(c => {
    const s = estadoCondicao(c);
    const cls = s.estado === 'falha' ? 'quebrada' : s.estado === 'ok' ? 'cumprida' : 'andamento';
    const marca = s.estado === 'falha' ? '✕' : s.estado === 'ok' ? '✓' : '•';
    return `<span class="phud__chip phud__chip--${cls}"><i>${marca}</i>${H(s.texto)}${s.prog ? ` <b>${H(s.prog)}</b>` : ''}</span>`;
  }).join('');
  return `<div class="phud" aria-hidden="true">
    <span class="phud__prazo ${perigo ? 'perigo' : ''}">T<b>${st.turno}</b>${N != null ? '/' + N : ''}${restam != null ? ` · ${restam === 1 ? 'último' : restam === 0 ? 'esgotado' : 'faltam ' + restam}` : ''}</span>
    ${extras ? `<span class="phud__chips">${extras}</span>` : ''}
  </div>`;
}

/* ---------- avaliação + latch + desbloqueio (chamada por renderBatalha) ---------- */
function classificarFim(r){
  if (r.resultado === 'vitoria') return 'vitoria';
  if (/base/.test(r.motivo || '')) return 'hp';
  if (r.motivo === 'deadline') return 'prazo';
  return 'condicao';
}
function atualizarProva(){
  if (!prova || provaFim) return;
  const r = avaliarProvacao(st, prova);
  if (r.resultado === 'andamento') return;
  provaFim = { resultado: r.resultado, categoria: classificarFim(r), motivo: r.motivo, lances: provaLances, minimo: prova.minimo, jaTinha: false };
  pararRelogio();
  if (r.resultado === 'vitoria') aplicarDesbloqueioProva(prova);
  else if (!st.fim) st.fim = { tipo: 'fim', resultado: 'vitoria', lado: 1 };   // congela o motor quando a condição quebrou com a luta ainda em curso
}
function aplicarDesbloqueioProva(p){
  if (!perfil) return;
  // §245 — DESAFIO POR DEUS (pago): +maestria ao DEUS-TÍTULO (+milagre), recarga começa; sem moeda, NÃO
  // avança Provação nem placar. NÃO usa o creditarMaestria genérico (que daria +1 aos deuses de suporte):
  // o desafio é do título, e é o que faz a conta "10 desafios → moldura" fechar no deus escolhido.
  if (p.desafioDeus) {
    cumprirDesafioDeus(p.desafioDeus);
    provaFim.desafioDeus = p.desafioDeus;
    provaFim.maestriaGanha = DESAFIO_CFG().maestriaPorVitoria;
    provaFim.virouMestre = nivelMaestria(p.desafioDeus) === 4;
    return;
  }
  creditarMaestria();   // F3.5: a vitória conta p/ a maestria dos deuses que jogaram (só contador, sem poder)
  if (!perfil.provacoes) perfil.provacoes = {};
  if (p.desafio) {
    // DESAFIO DE COMPOSIÇÃO (F3.6): sem desbloqueio de deus. Recompensa LEVE (Essência) só na 1ª vitória.
    const jaFeito = !!perfil.provacoes[p.scoreKey];
    if (!jaFeito && p.recompensaEss) perfil = creditar(perfil, 'essencia', p.recompensaEss);
    perfil.provacoes[p.scoreKey] = { feito: true, em: Date.now() };
    provaFim.jaFeito = jaFeito;
    provaFim.recompensaEss = jaFeito ? 0 : (p.recompensaEss || 0);
    const rd = salvar(perfil);
    if (rd && !rd.ok && st) st.log.push({ turno: st.turno, msg: '⚠ vitória, mas a gravação falhou: ' + rd.erro });
    return;
  }
  if (p.semanal) {
    // §245 — DESAFIO DA SEMANA: dá GEMA (recurso de invocação; ajuda a colecionar) na 1ª vitória da semana,
    // + maestria (acima) + placar. Grátis, expira por semana (o scoreKey traz ano+semana).
    const jaFeito = !!perfil.provacoes[p.scoreKey];
    const gema = ((typeof ECONOMIA !== 'undefined' && ECONOMIA.semanal && ECONOMIA.semanal.recompensa && ECONOMIA.semanal.recompensa.gema)) || 0;
    if (!jaFeito && gema) perfil = creditar(perfil, 'gema', gema);
    provaFim.recompensaGema = jaFeito ? 0 : gema;
    const antesS = perfil.provacoes[p.scoreKey];
    const recorde = !antesS || antesS.lances == null || provaLances < antesS.lances;
    if (recorde) perfil.provacoes[p.scoreKey] = { lances: provaLances, minimo: p.minimo, em: Date.now(), feito: true };
    provaFim.recorde = recorde;
    const rs = salvar(perfil);
    if (rs && !rs.ok && st) st.log.push({ turno: st.turno, msg: '⚠ vitória, mas a gravação falhou: ' + rs.erro });
    return;
  }
  // PERGAMINHO legado (jogo direto sem compra) — maestria + placar. O hub agora só entra pago; isto sobra
  // como rede para qualquer caminho antigo.
  const sk = p.scoreKey || p.key;
  const antes = perfil.provacoes[sk];
  if (!antes || provaLances < antes.lances) perfil.provacoes[sk] = { lances: provaLances, minimo: p.minimo, em: Date.now() };
  provaFim.recorde = !antes || provaLances < antes.lances;
  const res = salvar(perfil);
  if (res && !res.ok && st) st.log.push({ turno: st.turno, msg: '⚠ vitória, mas a gravação falhou: ' + res.erro });
}

/* ---------- overlay de fim: três derrotas distintas + vitória com placar ---------- */
function motivoHumano(motivo){
  const pred = String(motivo || '').split(':')[0];
  const c = prova.condicoes.find(x => x.predicado === pred);
  if (c) { const t = descreverCondicao(c).texto; return 'Faltou: ' + t.charAt(0).toLowerCase() + t.slice(1) + '.'; }
  return 'A condição da Provação não foi cumprida.';
}
function provaResultadoOverlay(){
  if (!prova || !provaFim) return '';
  const f = provaFim, venceu = f.resultado === 'vitoria';
  const ehDesafio = !!prova.desafio;       // composição (F3.6)
  const ehPago = !!prova.desafioDeus;      // §245: desafio POR DEUS (pago → maestria)
  const nome = nomeDoDeus(prova.key);
  let titulo, msg, cls;
  if (venceu && ehPago) {
    titulo = 'DESAFIO CUMPRIDO'; cls = 'venceu';
    msg = `+${f.maestriaGanha} de maestria de ${nome}.` + (f.virouMestre ? ' ★ MESTRE — a moldura saiu!' : '');
  } else if (venceu && ehDesafio) {
    titulo = 'DESAFIO VENCIDO'; cls = 'venceu';
    msg = f.recompensaEss ? `Composição provada. +${f.recompensaEss} ✦ de Essência.` : 'Composição provada — Essência já recebida antes.';
  } else if (venceu && prova.semanal) {
    titulo = 'DESAFIO DA SEMANA VENCIDO'; cls = 'venceu';
    msg = f.recompensaGema ? `+${f.recompensaGema} de Gema. Maestria avançada.` : 'A Gema desta semana já veio. Maestria avançada.';
  } else if (venceu) {
    titulo = 'PERGAMINHO VENCIDO'; cls = 'venceu';
    msg = f.recorde ? 'Perícia provada. Maestria avançada e novo recorde.' : 'Perícia provada. Maestria avançada.';
  }
  else if (f.categoria === 'hp') { titulo = 'DERROTA'; cls = 'hp'; msg = 'Seus deuses tombaram em campo.'; }
  else if (f.categoria === 'prazo') { titulo = 'PRAZO ESGOTADO'; cls = 'prazo'; msg = 'O limite de turnos passou antes da vitória.'; }
  else { titulo = 'CONDIÇÃO QUEBRADA'; cls = 'cond'; msg = motivoHumano(f.motivo); }
  // §245: o desafio pago perdido "fica até vencer" — o rodapé lembra que repetir é de graça.
  if (!venceu && ehPago) msg += ' O desafio fica — repetir é de graça.';
  const placar = (venceu && !ehDesafio && !ehPago && f.minimo != null)
    ? `<div class="result__placar"><span>Vencido em <b>${f.lances}</b> lance${f.lances === 1 ? '' : 's'}</span><span class="result__min">melhor conhecido: ${f.minimo}</span>${f.lances <= f.minimo ? '<span class="result__rec">✦ no ritmo do ótimo</span>' : ''}</div>`
    : '';
  const selo = ehPago ? `Desafio · ${H(nome)}` : ehDesafio ? 'Desafio de composição' : prova.semanal ? 'Desafio da Semana' : `Pergaminho · ${H(prova.faixa || prova.nivel)}`;
  return `<div class="ov"><div class="ovbox"><div class="result result--prova result--${cls}">
    <span class="result__selo">${selo}</span>
    <h1>${titulo}</h1>
    <p class="result__prova">${H(prova.titulo)}</p>
    <p class="result__msg">${H(msg)}</p>
    ${placar}
    <div class="result__acoes">
      <button class="b b--quiet b--md" id="pfvoltar">${ehDesafio ? 'Voltar aos desafios' : 'Voltar aos Desafios'}</button>
      ${venceu ? '' : '<button class="b b--primary b--md" id="pftentar">Tentar de novo</button>'}
    </div>
  </div></div></div>`;
}
function ligarProvaFim(){
  const q = s => stage.querySelector(s);
  const ehDesafio = !!(prova && prova.desafio);
  const ehPago = !!(prova && prova.desafioDeus);
  const destino = ehDesafio ? 'composicao' : 'desafios';   // pago/semanal/pergaminho voltam ao hub 'desafios'
  // §245: voltar de um desafio pago PERDIDO NÃO desiste — o desafio fica ATIVO (repetir é de graça).
  const v = q('#pfvoltar'); if (v) v.onclick = () => { sairProva(); ir(destino, {}, { substituir: true }); render(); };
  const dsfId = prova && prova.desafioId, pkey = prova && prova.key, pagoK = prova && prova.desafioDeus, ehSemanal = !!(prova && prova.semanal);
  const t = q('#pftentar'); if (t) t.onclick = () => {
    if (ehDesafio) { desafioTimePick = []; sairProva(); ir('desafiomontar', { id: dsfId }); render(); }
    else if (ehPago) iniciarDesafioDeus(pagoK);        // repete de graça (fica ativo)
    else if (ehSemanal) iniciarSemanal();
    else iniciarProva(pkey);
  };
}
function sairProva(){ prova = null; provaFim = null; provaLances = 0; }

/* ---------- entrada: montar e começar a Provação ---------- */
function iniciarProva(key){
  const p = (typeof PROVACOES !== 'undefined') ? PROVACOES.find(x => x.key === key) : null;
  if (!p) return;
  campanha = null; campanhaFim = null;   // não é encontro de campanha
  prova = p; provaFim = null; provaLances = 0;
  st = montarProvacao(p);
  vsCPU = true;   // os inimigos da Provação são a CPU (o jogador controla o lado 0)
  ir('batalha', {}, { substituir: true });
  render();
}

// ===================================================================
// §245 — DESAFIOS POR DEUS: os pergaminhos viram desafios COMPRADOS com Essência que dão MAESTRIA do deus
// (a MOLDURA sai no Mestre, §204 limiar 30 — sistema que já existe). AS 9 REGRAS, cada uma com o motivo:
//  1. UM por deus por vez (não estoca).  2. VÁRIOS deuses ao mesmo tempo, sem teto (pagou; a Essência limita).
//  3. NÃO expira (comprou, é dele).  4. Perdeu a batalha? Repete de graça (fica ATIVO até vencer).
//  5. Pode DESISTIR (sem reembolso, recarga começa).  6. Recarga começa ao CUMPRIR ou DESISTIR, nunca na compra.
//  7. Recarga de 8h (3/dia por deus).  8. SÓ de deus que você TEM.  9. NÃO avança a Provação (é puzzle, não PvP).
// ===================================================================
function DESAFIO_CFG(){ return (typeof ECONOMIA !== 'undefined' && ECONOMIA.pergaminhos) || { custoEssencia: 30, maestriaPorVitoria: 3, recargaHoras: 8 }; }
function _desafios(){ if (perfil && !perfil.desafios) perfil.desafios = {}; return (perfil && perfil.desafios) || {}; }
function provacaoDe(k){ return acervoPergaminhos().find(p => p.key === k) || null; }
function desafioEstado(k){
  const d = _desafios()[k], agora = Date.now();
  if (!d) return { estado: 'disponivel' };
  if (d.ativo) return { estado: 'ativo' };
  if (d.recargaAte && d.recargaAte > agora) return { estado: 'recarga', restaMs: d.recargaAte - agora };
  return { estado: 'disponivel' };
}
function podeComprarDesafio(k){
  if (!temDeus(k)) return { ok: false, motivo: 'você não tem este deus' };            // REGRA 8
  if (nivelMaestria(k) === 4) return { ok: false, motivo: 'já é Mestre' };             // nada a ganhar (a moldura já saiu)
  if (!provacaoDe(k)) return { ok: false, motivo: 'desafio a caminho' };               // cobertura (não deve ocorrer: 100%)
  const e = desafioEstado(k);
  if (e.estado === 'ativo') return { ok: false, motivo: 'já em andamento' };           // REGRA 1
  if (e.estado === 'recarga') return { ok: false, motivo: 'em recarga' };              // REGRA 6/7
  const custo = DESAFIO_CFG().custoEssencia;
  if ((perfil.moedas.essencia || 0) < custo) return { ok: false, motivo: 'Essência insuficiente' };
  return { ok: true, custo };
}
function comprarDesafio(k){
  const p = podeComprarDesafio(k); if (!p.ok) return p;
  perfil = debitar(perfil, 'essencia', p.custo);   // paga (clone com a Essência descontada)
  if (!perfil.desafios) perfil.desafios = {};
  perfil.desafios[k] = { ativo: true, recargaAte: 0 };   // vira ATIVO — recarga NÃO começa na compra (REGRA 6)
  salvar(perfil);
  return { ok: true };
}
function desistirDesafio(k){
  const d = _desafios()[k]; if (!d || !d.ativo) return;
  const rec = DESAFIO_CFG().recargaHoras * 3600 * 1000;
  perfil.desafios[k] = { ativo: false, recargaAte: Date.now() + rec };   // REGRA 5: sem reembolso, recarga começa
  salvar(perfil);
}
// vitória num desafio por deus: +maestria ao DEUS-TÍTULO (+milagre), recarga começa. Sem moeda (já pagou).
function cumprirDesafioDeus(k){
  if (!perfil.maestria) perfil.maestria = {};
  const m = perfil.maestria[k] || (perfil.maestria[k] = { vitorias: 0, milagre: false });
  m.vitorias = (m.vitorias || 0) + DESAFIO_CFG().maestriaPorVitoria;   // +3 (10 desafios → 30 = Mestre)
  m.milagre = true;   // o desafio desenhado (pilotar o deus até vencer) É a prova de kit do Mestre
  if (!perfil.desafios) perfil.desafios = {};
  const rec = DESAFIO_CFG().recargaHoras * 3600 * 1000;
  perfil.desafios[k] = { ativo: false, recargaAte: Date.now() + rec };   // REGRA 6: recarga começa ao cumprir
  salvar(perfil);
}
// inicia a batalha do desafio por deus (o pergaminho do deus), marcada como paga (§245).
function iniciarDesafioDeus(k){
  const p = provacaoDe(k); if (!p) return;
  campanha = null; campanhaFim = null;
  prova = Object.assign({}, p, { desafioDeus: k });   // flag: desafio POR DEUS pago (dá maestria, não avança nada)
  provaFim = null; provaLances = 0;
  st = montarProvacao(prova);
  vsCPU = true;
  ir('batalha', {}, { substituir: true });
  render();
}
function fmtRecarga(ms){
  const min = Math.max(0, Math.round(ms / 60000));
  if (min >= 60) { const h = Math.floor(min / 60), m = min % 60; return h + 'h' + (m ? ' ' + m + 'm' : ''); }
  return min + 'm';
}

// ===================================================================
// F3.2 — COLEÇÃO (os 100 por PANTEÃO) + DETALHE do deus, e o elo Coleção↔Provação.
// A Provação desbloqueia num lugar que agora EXISTE: a Coleção. O detalhe do deus mostra
// kit, arte e o estado da Provação dele — e leva a jogá-la; a Provação vencida leva a ver
// o deus. O agrupamento por panteão (10×10) já prepara o sistema de panteões do fim de jogo.
// ===================================================================

const PANTEOES = ['Grega', 'Nórdica', 'Egípcia', 'Japonesa', 'Chinesa', 'Hindu', 'Brasileira', 'Africana', 'Celta', 'Maia'];
const CKIT = {}; if (typeof KITS !== 'undefined') KITS.forEach(k => CKIT[k.key] = k);
const RAR_ROT = { SS: 'SS', S: 'S', A: 'A' };
function raridadeDe(k){ return (typeof RARIDADE !== 'undefined' && RARIDADE[k]) || 'A'; }
function temKitHome(k){ return typeof GODS !== 'undefined' && !!GODS[k]; }
function provDe(k){ return (typeof PROVACOES !== 'undefined') ? PROVACOES.find(p => p.key === k) : null; }

// TILE da COLEÇÃO (§216): a vitrine — arte GRANDE (moldura dourada quem tem, cinza quem falta),
// nome e selos numa faixa ABAIXO da arte (nada cobrindo a ilustração). Classe própria (.colx) para
// não mexer nas grades de MONTAR TIME, que continuam pequenas e funcionais (.ctile).
function tileColecaoHTML(k){
  const g = HRM[k] || { nome: k, elem: 'Umbra' };
  const tem = temDeus(k);
  const rar = raridadeDe(k);
  const nv = tem ? nivelMaestria(k) : 0;
  const badge = tem
    ? (nv > 0 ? `<span class="colx__m m--${nv}" title="${MAESTRIA_NOME[nv]}">${nv === 4 ? '★' : nv}</span>` : '')
    : `<span class="colx__lock" title="ainda não conquistado">⚿</span>`;
  // §245: a MOLDURA do MESTRE — uma borda ornamentada (cosmético, variação de borda) que marca o domínio.
  const mestre = tem && nv === 4 ? ' colx--mestre' : '';
  return `<button class="colx ${tem ? 'colx--tem' : 'colx--falta'}${mestre}" data-deus="${k}" title="${H(g.nome)}${nv === 4 ? ' · Mestre' : ''}">
    <span class="colx__rar rar--${rar}"></span>
    <span class="colx__art">${slot('god-' + k, ini(g.nome), tem ? COR(g.elem) : '#6a6390', 30)}</span>
    <span class="colx__foot">
      <span class="colx__el" style="background:${tem ? COR(g.elem) : '#4a4470'}"></span>
      <span class="colx__n">${H(g.nome)}</span>
      <span class="colx__badge">${badge}</span>
    </span>
  </button>`;
}

function renderColecao(){
  const porFaccao = {};
  ROSTER.forEach(e => { (porFaccao[e.faccao] = porFaccao[e.faccao] || []).push(e.key); });
  const donos = perfil && perfil.deuses ? Object.keys(perfil.deuses).length : 0;
  const grupos = PANTEOES.filter(f => porFaccao[f]).map(f => {
    const ks = porFaccao[f]; const tem = ks.filter(temDeus).length;
    // PANTEÃO por PROPORÇÃO (§200): dominados X/N, com o marco em METADE (comparável entre 19 e 4).
    const d = dominadosPanteao(f);
    const frac = d.total ? Math.round(d.dom / d.total * 100) : 0;
    const meia = d.dom >= d.metade && d.metade > 0;
    return `<div class="csec">
      <div class="csec__cab"><h2>${H(f)}</h2><span class="csec__n">${tem}/${ks.length}</span>
        <span class="csec__maes ${meia ? 'meia' : ''}" title="dominados (Mestre) — marco em metade">dominados ${d.dom}/${d.total}${meia ? ' · metade ✓' : ''}</span></div>
      <div class="colgrid">${ks.map(tileColecaoHTML).join('')}</div>
    </div>`;
  }).join('');
  const dom = totalDominados(), inic = totalIniciados();
  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="tela">
    <header class="tela__cab">
      <button class="b b--quiet b--md" id="bvoltar">‹ Início</button>
      <h1 class="tela__titulo">Coleção</h1>
      <span class="tela__cont">${donos}/${ROSTER.length}</span>
    </header>
    <div class="cmaescab">domina <b>${dom}</b>/${ROSTER.length} · iniciado em <b>${inic}</b></div>
    <div class="tela__rol">${grupos}</div>
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  [...stage.querySelectorAll('.colx[data-deus]')].forEach(b => {
    b.onclick = () => { ir('deus', { key: b.dataset.deus }); render(); };
  });
  fit();
}

/* ---------- detalhe do deus: kit + arte + estado da Provação, com o elo p/ jogá-la ---------- */
function linhaKitHTML(rot, a){
  if (!a) return '';
  return `<div class="krow"><div class="krow__h"><span class="krow__rot">${rot}</span><b>${H(a.nome)}</b>
    <span class="krow__meta">${pipsDetalhe(custoParaCost(a.custo))}${a.recarga ? `<span class="krow__cd">recarga ${a.recarga}</span>` : ''}</span></div>
    <div class="krow__t">${H(a.efeito)}</div></div>`;
}
function provacaoDetalheHTML(k){
  const g = HRM[k] || {};
  if (g.inicial) return `<div class="dprov"><span class="dprov__rot">PERGAMINHO</span><p class="dprov__none">Deus inicial — vem com você, sem pergaminho.</p></div>`;
  const p = provDe(k);
  // genérica = fora do acervo jogável (§212): existe no dado como histórico, mas não se joga.
  if (!p || p.generica) return `<div class="dprov"><span class="dprov__rot">PERGAMINHO</span><p class="dprov__none">Sem pergaminho no acervo para este deus.</p></div>`;
  const rec = perfil && perfil.provacoes && perfil.provacoes[k];
  const estado = rec && rec.lances != null
    ? `<span class="dprov__feita">✓ Vencido em ${rec.lances} lance${rec.lances === 1 ? '' : 's'}${rec.minimo != null ? ` · mínimo ${rec.minimo}` : ''}</span>`
    : `<span class="dprov__aberta">No acervo</span>`;
  return `<div class="dprov">
    <span class="dprov__rot">PERGAMINHO</span>
    <div class="dprov__linha">
      <span class="dprov__faixa faixa--${faixaClasse(p.faixa)}">${H(p.faixa || '—')}</span>
      <span class="dprov__tit">${H(p.titulo)}</span>
    </div>
    <div class="dprov__pe">${estado}
      <button class="b b--primary b--sm" data-jogarprova="${k}">${rec && rec.lances != null ? 'Jogar de novo' : 'Jogar Pergaminho'}</button>
    </div>
  </div>`;
}
// §220 — DETALHE do deus refeito (Mobile Legends invertido: arte à ESQUERDA porque o que se TOCA
// (skills) vai à direita, coerente com o §214). deusSel = skill selecionada; abre na PASSIVA (ela
// define o deus e é o que menos se pensaria em tocar). deusSelKey reseta a seleção ao trocar de deus.
let deusSel = 'passiva', deusSelKey = null;

// COMO CONSEGUIR (substitui a maestria quando NÃO se possui o deus): maestria zero não é informação;
// a rota de aquisição é. Duas vias: INVOCAÇÃO (gacha) e MISSÃO (§234). O ELO com a tela de Missões
// (§220): daqui dá para VER a missão do deus — o botão leva ao mapa, e lá o deus leva de volta aqui.
function comoConseguirHTML(k, rar){
  const m = (typeof MISSOES !== 'undefined' && MISSOES.missoes) ? MISSOES.missoes[k] : null;
  const missaoVia = m
    ? `<button class="dcomo__via dcomo__via--miss" data-vermissao="1"><b>Missão</b><span>${H(reqMissaoTexto(k))}</span><span class="dcomo__motivo">${H(m.motivo)}</span></button>`
    : `<div class="dcomo__via"><b>Missão</b><span>este deus não tem missão (inicial)</span></div>`;
  return `<div class="dcomo">
    <span class="dcomo__rot">COMO CONSEGUIR</span>
    <div class="dcomo__vias">
      <div class="dcomo__via"><b>Invocação</b><span>na roleta · raridade ${H(RAR_ROT[rar] || rar)}</span></div>
      ${missaoVia}
    </div>
  </div>`;
}
// texto curto do requisito de missão (para o detalhe do deus): "40 vitórias gregas + 5 seguidas com Cérbero".
function reqMissaoTexto(k){
  const m = MISSOES.missoes[k]; if (!m) return '';
  const adj = PANT_ADJ[m.panteao] || m.panteao;
  let s = `${m.vitoriasPanteao} vitórias ${adj}`;
  // §241: sequência (companheiro OU panteão) + o portão de ranque, tudo desde o desbloqueio.
  const seg = m.seguidas || m.seguidasCompanheiro || 0;
  const alvo = m.seguidasAlvo || (m.companheiro ? { tipo: 'companheiro', chave: m.companheiro } : { tipo: 'panteao', chave: m.panteao });
  if (seg) s += ` + ${seg} seguidas ${alvo.tipo === 'companheiro' ? 'com ' + nomeM(alvo.chave) : adj}`;
  else if (m.companheiro) s += ` · com ${nomeM(m.companheiro)}`;
  if (m.faixaNome && (m.faixaMin || 0) > 0) s += ` · abre em ${m.faixaNome}`;
  return s;
}

// as 4 skills que DEFINEM o deus na Coleção (a Defesa é universal e fica fora): cada uma tem arte.
function deusSkills(kit){
  return [
    { slot: 'basico',     tipo: 'BÁSICO',     d: kit && kit.basico },
    { slot: 'habilidade', tipo: 'HABILIDADE', d: kit && kit.habilidade },
    { slot: 'milagre',    tipo: 'MILAGRE',    d: kit && kit.milagre },
    { slot: 'passiva',    tipo: 'PASSIVA',    d: kit && kit.passiva },
  ];
}
// chip de skill no kit (arte + nome + tipo, sem descrição — só isso de cara)
function deusKitChipHTML(k, s, sel){
  const nome = s.d ? s.d.nome : '—';
  return `<button class="dsk ${s.slot === sel ? 'is-sel' : ''}" data-deussel="${s.slot}" ${s.d ? '' : 'disabled'} title="${H(nome)}">
    <span class="dsk__art">${slot('skill-' + k + '-' + s.slot, '', null, 0, true)}</span>
    <span class="dsk__nome">${H(nome)}</span>
    <span class="dsk__tipo">${s.tipo}</span>
  </button>`;
}
// DETALHE da skill selecionada: nome, custo (bolinhas), recarga em turnos, e o texto completo.
function deusDetalheHTML(k, kit, sel){
  const s = deusSkills(kit).find(x => x.slot === sel) || deusSkills(kit).find(x => x.d);
  if (!s || !s.d) return `<div class="ddet"><div class="ddet__txt">Kit em produção.</div></div>`;
  const d = s.d, passiva = s.slot === 'passiva';
  const pips = passiva ? '' : pipsDetalhe(custoParaCost(d.custo));
  const meta = passiva ? 'PASSIVA · não gasta a ação'
    : `${d.recarga ? 'recarga ' + d.recarga + ' turno' + (d.recarga === 1 ? '' : 's') : 'sem recarga'}`;
  return `<div class="ddet">
    <div class="ddet__cab"><b class="ddet__nome">${H(d.nome)}</b><span class="ddet__tipo">${s.tipo}</span></div>
    <div class="ddet__meta">${pips}<span class="ddet__cd">${H(meta)}</span></div>
    <div class="ddet__txt">${realce(d.efeito || '')}</div>
  </div>`;
}
function renderDeusDetalhe(){
  const k = (paramsAtuais() || {}).key;
  const g = HRM[k] || { nome: k, elem: 'Umbra', faccao: '', classe: '', funcao: '' };
  const kit = CKIT[k];
  const tem = temDeus(k);
  const rar = raridadeDe(k);
  if (deusSelKey !== k) { deusSel = 'passiva'; deusSelKey = k; }   // abre na PASSIVA (decisão do dono)
  stage.innerHTML = `<div id="baselayer" class="deus ${tem ? '' : 'deus--falta'}">
  <div class="stage__bg"></div><div class="stage__scrim"></div>
  <header class="dtop">
    <button class="b b--quiet b--md" id="bvoltar">‹ Voltar</button>
    <span class="dtop__rar rar--${rar}">${RAR_ROT[rar] || rar}</span>
  </header>
  <div class="dbody">
    <div class="dart">
      ${slot('god-' + k, ini(g.nome), tem ? COR(g.elem) : '#6a6390', 64)}
      ${tem ? '' : '<span class="dart__tag">VOCÊ NÃO POSSUI</span>'}
      <div class="dart__nome">${H(g.nome)}</div>
    </div>
    <div class="dcol">
      <div class="dchips">
        <span class="dchip">${H(g.faccao)}</span>
        <span class="dchip dchip--el" style="--c:${COR(g.elem)}">${H(ELAB[g.elem] || g.elem)}</span>
        <span class="dchip">${H(g.classe)}</span>
        <span class="dchip">${H(g.funcao)}</span>
      </div>
      ${tem ? maestriaDetalheHTML(k) : comoConseguirHTML(k, rar)}
      <div class="dkit">${deusSkills(kit).map(s => deusKitChipHTML(k, s, deusSel)).join('')}</div>
      ${deusDetalheHTML(k, kit, deusSel)}
    </div>
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  stage.querySelectorAll('[data-deussel]').forEach(b => { if (b.disabled) return;
    b.onclick = () => { deusSel = b.dataset.deussel; render(); }; });
  // ELO com a tela de Missões (§234): do detalhe do deus vai-se ao mapa das missões.
  const vm = stage.querySelector('[data-vermissao]');
  if (vm) vm.onclick = () => { ir('provacoes'); render(); };
  fit();
}

// ===================================================================
// F3.3 — CAMPANHA (Capítulo 1): a única tela que ensina as REGRAS.
// As Provações ensinam os deuses; nada ensinava custo, recarga, a Defesa universal,
// a ordem de resolução e a escolha de time. O capítulo é uma sequência de encontros
// que reusa a MÁQUINA DE PROVAÇÃO (montar estado + time inimigo) SEM condição especial:
// vencer = derrubar os inimigos. A progressão de ENSINO é o ponto, não a dificuldade.
// A recompensa vem de data/economia.json; o chefe é deus do roster com HP inflado no montar.
// ===================================================================

let campTimePick = [];   // seleção do encontro "escolha de time"

function campEncontros(){ return (typeof CAMPANHA !== 'undefined' && CAMPANHA && CAMPANHA.encontros) ? CAMPANHA.encontros : []; }
function encFeito(id){ return !!(perfil && perfil.campanha && Array.isArray(perfil.campanha.concluidas) && perfil.campanha.concluidas.includes(id)); }
// estado de um encontro na trilha: 'feito' | 'aberto' (o 1º não-feito) | 'travado'.
function encEstado(enc, i, encs){
  if (encFeito(enc.id)) return 'feito';
  const anteriorPendente = encs.slice(0, i).some(e => !encFeito(e.id));
  return anteriorPendente ? 'travado' : 'aberto';
}
function recompensaDe(chave){
  const r = (typeof ECONOMIA !== 'undefined' && ECONOMIA.campanha && ECONOMIA.campanha.recompensas) ? ECONOMIA.campanha.recompensas[chave] : null;
  return r || null;
}
function recompensaTexto(r){
  if (!r) return '';
  const parts = [];
  if (r.gema) parts.push(`${r.gema} 💎`);
  if (r.essencia) parts.push(`${r.essencia} ✦`);
  return parts.join(' · ');
}

function cardEncontroHTML(enc, estado){
  const r = recompensaDe(enc.recompensa);
  const bloq = estado === 'travado';
  return `<button class="cenc cenc--${estado}" data-enc="${enc.id}" ${bloq ? 'disabled' : ''}>
    <span class="cenc__ic">${enc.chefe ? '☠' : estado === 'feito' ? '✓' : bloq ? '⚿' : '▶'}</span>
    <span class="cenc__id">
      <span class="cenc__nome">${H(enc.nome)}${enc.chefe ? ' <span class="cenc__chefe">CHEFE</span>' : ''}</span>
      <span class="cenc__ensina">Ensina: ${H(enc.ensina.titulo)}</span>
    </span>
    <span class="cenc__pe">
      <span class="cenc__rec">${recompensaTexto(r)}</span>
      <span class="cenc__estado">${estado === 'feito' ? 'concluído' : bloq ? 'travado' : 'jogar'}</span>
    </span>
  </button>`;
}

// ===================================================================
// §252 — CAMPANHA NARRATIVA (O Trono do Uno). A lista SAIU: cada capítulo é uma
// história FASEADA em atos. O ato tem TIPO: `batalha` abre a luta; `historia` é
// arte+texto+Continuar. Capítulo = ARQUIVO (data/campanha/ → CAMPANHAS), para que
// capítulo novo seja dado e não código. Palco 951×428, orçamento 48/316/64.
// ===================================================================
let campCapIdx = null, campAtoIdx = null;   // capítulo/ato em foco
let campSwap = {}, campVistaAto = null;       // trocas do slot emprestado (por índice), reset ao trocar de ato
let campPicker = null;                        // slot idx cujo seletor de troca está aberto (null = fechado)

function CAMPS(){ return (typeof CAMPANHAS !== 'undefined' && CAMPANHAS && CAMPANHAS.capitulos) ? CAMPANHAS.capitulos : []; }
function atoFeito(id){ return !!(perfil && perfil.campanha && Array.isArray(perfil.campanha.concluidas) && perfil.campanha.concluidas.includes(id)); }
function capCompleto(cap){ return (cap.atos || []).every(a => atoFeito(a.id)); }
function capDesbloqueado(capIdx){ const caps = CAMPS(); if (capIdx <= 0) return true; return capCompleto(caps[capIdx - 1]); }
// estado de um ato na trilha: 'feito' | 'aberto' (jogável agora ou revisitável) | 'travado'.
function atoEstado(capIdx, i){
  const atos = CAMPS()[capIdx].atos || [];
  if (atoFeito(atos[i].id)) return 'feito';
  if (!capDesbloqueado(capIdx)) return 'travado';
  return (i === 0 || atoFeito(atos[i - 1].id)) ? 'aberto' : 'travado';
}
function capAtualIdx(){ const caps = CAMPS(); for (let c = 0; c < caps.length; c++) if (!capCompleto(caps[c])) return c; return Math.max(0, caps.length - 1); }
function atoAtualIdx(capIdx){ const atos = CAMPS()[capIdx].atos || []; for (let i = 0; i < atos.length; i++) if (!atoFeito(atos[i].id)) return i; return Math.max(0, atos.length - 1); }
// aliados de um ato → 3 slots {deus,travado}. null = 3 emprestados vazios (o jogador monta, Prólogo VI);
// [string] = time fixo do Prólogo (tudo travado); [{deus,travado}] = Cap 1 (cena + emprestado).
function slotsDoAto(ato){
  if (ato.aliados == null) return [0, 1, 2].map(() => ({ deus: null, travado: false }));
  return ato.aliados.map(a => typeof a === 'string' ? { deus: a, travado: true } : { deus: a.deus, travado: !!a.travado });
}
function metaComb(k){
  const g = HRM[k]; if (g) return { nome: g.nome, elem: g.elem };
  const b = (typeof BESTIARIO_DADOS !== 'undefined' ? BESTIARIO_DADOS : []).find(x => x.key === k);
  if (b) return { nome: b.nome, elem: b.elemento };
  return { nome: k, elem: 'Umbra' };
}
function timeDoAto(ato){ return slotsDoAto(ato).map((s, i) => (campSwap[i] || s.deus)); }
function timeProntoAto(ato){ return timeDoAto(ato).filter(Boolean).length === 3; }

// §253: retrato de aliado. travado=cadeado (a cena, sem troca); emprestado=⇄ (abre o seletor).
function cslotHTML(s, i){
  const key = campSwap[i] || s.deus;
  if (!key) return `<button class="cslot cslot--vazio" data-empr="${i}"><span class="cslot__p">+</span><span class="cslot__nome">escolher</span></button>`;
  const m = metaComb(key);
  if (s.travado) return `<div class="cslot cslot--trav"><span class="cslot__p">${slot('god-' + key, ini(m.nome), COR(m.elem), 20)}</span><span class="cslot__badge cslot__lock">⚿</span><span class="cslot__nome">${H(m.nome)}</span></div>`;
  return `<button class="cslot cslot--empr" data-empr="${i}"><span class="cslot__p">${slot('god-' + key, ini(m.nome), COR(m.elem), 20)}</span><span class="cslot__badge cslot__swap">⇄</span><span class="cslot__nome">${H(m.nome)}</span></button>`;
}
function cinimHTML(k){ const m = metaComb(k); return `<div class="cinim"><span class="cinim__p">${slot('god-' + k, ini(m.nome), COR(m.elem), 20)}</span><span class="cinim__nome">${H(m.nome)}</span></div>`; }

function renderCampanha(){
  const caps = CAMPS();
  if (!caps.length) {   // sem dado da campanha nova — mensagem honesta, com saída (§210)
    stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div><div class="tela"><header class="tela__cab"><button class="b b--quiet b--md" id="bvoltar">‹ Início</button><h1 class="tela__titulo">Campanha</h1></header><div class="tela__rol"><p class="result__msg">A campanha ainda não foi carregada.</p></div></div></div>`;
    const v0 = stage.querySelector('#bvoltar'); if (v0) v0.onclick = () => { ir('home', {}, { substituir: true }); render(); };
    fit(); return;
  }
  if (campCapIdx == null || campCapIdx >= caps.length) campCapIdx = capAtualIdx();
  const cap = caps[campCapIdx];
  const atos = cap.atos || [];
  if (campAtoIdx == null || campAtoIdx >= atos.length) campAtoIdx = atoAtualIdx(campCapIdx);
  const ato = atos[campAtoIdx];
  if (campVistaAto !== ato.id) { campSwap = {}; campVistaAto = ato.id; }   // troca de ato zera os empréstimos

  const feitosCap = atos.filter(a => atoFeito(a.id)).length;
  const ehBatalha = ato.tipo === 'batalha';
  const eyebrow = cap.numero === 0 ? 'PRÓLOGO' : 'CAPÍTULO ' + numeroRomano(cap.numero);
  const capTit = (cap.nome.split('—')[1] || cap.nome).trim();
  const numAtoLabel = (cap.numero === 0 ? 'TRECHO ' : 'ATO ') + ato.numeral;
  const arteFile = 'banners/campanha/' + H(ato.arte) + '.webp';

  // navegação de capítulo: só para capítulos desbloqueados
  const temPrev = campCapIdx > 0 && capDesbloqueado(campCapIdx - 1);
  const temNext = campCapIdx < caps.length - 1 && capDesbloqueado(campCapIdx + 1);

  // ESQUERDA — arte (§213: <img> só se o arquivo existe; senão placeholder, nunca 404), dois véus, legenda.
  const arteInner = ato._arteOk
    ? `<img class="camp__arteimg" src="${arteFile}" alt="" loading="lazy" onerror="this.remove()">`
    : `<div class="camp__artefallback"><span class="camp__phorn">◈</span></div>`;
  const esquerda = `<div class="camp__arte">${arteInner}
    <div class="camp__veu1"></div><div class="camp__veu2"></div>
    <div class="camp__legenda">
      <span class="camp__num">${H(numAtoLabel)}</span>
      <h2 class="camp__nome">${H(ato.nome)}</h2>
      <span class="camp__filete"></span>
      <p class="camp__texto">${H(ato.texto || '')}</p>
    </div>
  </div>`;

  // DIREITA — painel de briefing (batalha) ou história
  let brief;
  if (ehBatalha) {
    const slots = slotsDoAto(ato);
    const en = ato.ensina;
    const r = recompensaDe(ato.recompensa);
    const jaFeito = atoFeito(ato.id);
    const nInim = (ato.inimigos || []).length;
    const mec = en ? `<div class="camp__mec">
        <span class="camp__mecico">⚡</span>
        <div class="camp__mectxt"><div class="camp__mectoprow"><b class="camp__mectit">${H(en.titulo)}</b><span class="camp__mecselo">Nova mecânica</span></div><span class="camp__mecdica">${H(en.dica)}</span></div>
      </div>` : '';
    const ladrilho = (v, un, feita) => `<span class="crec ${feita ? 'crec--feita' : ''}"><b class="crec__v">${v}</b><span class="crec__u">${un}</span></span>`;
    const rec = `<div class="camp__rec">
      <div class="camp__reccab"><span class="camp__lbl camp__lbl--rec">Recompensas</span>${jaFeito ? '<span class="camp__coletada">✓ coletada</span>' : ''}</div>
      <div class="camp__recchips">
        ${r && r.gema ? ladrilho(r.gema, 'GEMAS', jaFeito) : ''}
        ${r && r.essencia ? ladrilho(r.essencia, 'ESSÊNCIA', jaFeito) : ''}
      </div></div>`;
    const pronto = timeProntoAto(ato);
    brief = `<div class="camp__brief">
      <div class="camp__elencos">
        <div class="camp__col">
          <span class="camp__lbl camp__lbl--voce">Você jogará com</span>
          <div class="camp__slots">${slots.map((s, i) => cslotHTML(s, i)).join('')}</div>
        </div>
        <div class="camp__col">
          <span class="camp__lbl camp__lbl--inim">Enfrentará <span class="camp__form">${nInim} VS 3</span></span>
          <div class="camp__inims">${(ato.inimigos || []).map(cinimHTML).join('')}</div>
        </div>
      </div>
      <div class="camp__divisor"></div>
      ${mec}${rec}
      <button class="camp__cta" id="campcta" ${pronto ? '' : 'disabled'}><span class="camp__ctaseta"></span>${pronto ? 'Continuar história' : `Escolha seu time (${timeDoAto(ato).filter(Boolean).length}/3)`}</button>
    </div>`;
  } else {
    brief = `<div class="camp__brief camp__brief--hist">
      <div class="camp__historn">✦</div>
      <p class="camp__histnota">Um trecho da história.</p>
      <button class="camp__cta" id="campcta"><span class="camp__ctaseta"></span>Continuar</button>
    </div>`;
  }

  // RODAPÉ — trilha: linha-guia com progresso + nós (vencido/atual/travado), navegação.
  const totalNos = atos.length;
  const fillPct = totalNos > 1 ? ((campAtoIdx) / (totalNos - 1)) * 82 : 0;
  const nos = atos.map((a, i) => {
    const est = atoEstado(campCapIdx, i);
    const atual = i === campAtoIdx;
    const ic = est === 'feito' ? '✓' : (i + 1);
    return `<button class="cnode cnode--${est} ${atual ? 'cnode--atual' : ''}" data-ato="${i}" ${est === 'travado' ? 'disabled' : ''}>
      <span class="cnode__d">${est === 'travado' ? '<span class="cnode__lock">⚿</span>' : `<span class="cnode__num">${ic}</span>`}</span>
      <span class="cnode__nome">${H(a.nome)}</span></button>`;
  }).join('');

  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="camp ${ehBatalha ? '' : 'camp--historia'}">
    ${esquerda}
    <header class="camp__cab">
      <button class="camp__inicio" id="bvoltar"><span class="camp__chev"></span>Início</button>
      <span class="camp__filetev"></span>
      <h1 class="camp__logo">Campanha</h1>
    </header>
    <div class="camp__capbox"><div class="camp__capinner">
      ${temPrev ? '<button class="camp__capnav" id="capprev">‹</button>' : ''}
      <div class="camp__capid"><span class="camp__capeye">${H(eyebrow)}</span><span class="camp__captit">${H(capTit)}</span><span class="camp__capep">“${H(cap.epigrafe || '')}”</span></div>
      <span class="camp__prog"><b>${String(feitosCap).padStart(2, '0')}</b><span class="camp__progt">/ ${String(totalNos).padStart(2, '0')}</span></span>
      ${temNext ? '<button class="camp__capnav" id="capnext">›</button>' : ''}
    </div></div>
    ${brief}
    <div class="camp__pe">
      <div class="camp__guia"><span class="camp__guiafill" style="width:${fillPct.toFixed(1)}%"></span></div>
      <div class="camp__nos">${nos}</div>
    </div>
  </div>
  ${campPicker != null ? campPickerHTML() : ''}
  </div>`;

  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  const bp = stage.querySelector('#capprev'); if (bp) bp.onclick = () => { campCapIdx--; campAtoIdx = atoAtualIdx(campCapIdx); campSwap = {}; campVistaAto = null; render(); };
  const bn = stage.querySelector('#capnext'); if (bn) bn.onclick = () => { campCapIdx++; campAtoIdx = atoAtualIdx(campCapIdx); campSwap = {}; campVistaAto = null; render(); };
  [...stage.querySelectorAll('.cnode[data-ato]')].forEach(b => { if (b.disabled) return; b.onclick = () => { campAtoIdx = +b.dataset.ato; render(); }; });
  [...stage.querySelectorAll('.cslot[data-empr]')].forEach(b => { b.onclick = () => { campPicker = +b.dataset.empr; render(); }; });
  const cta = stage.querySelector('#campcta');
  if (cta && !cta.disabled) cta.onclick = () => { if (ehBatalha) iniciarAto(cap, ato); else avancarHistoria(); };
  ligarCampPicker();
  fit();
}

function numeroRomano(n){ return ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || String(n); }

// seletor de troca do slot emprestado: os deuses que o jogador TEM (com kit). Sem saída morta (§210):
// se não tem nenhum, a mensagem explica e ele joga com o emprestado default.
function campPickerHTML(){
  const jogaveis = ROSTER.map(e => e.key).filter(k => temDeus(k) && temKitHome(k));
  const grid = jogaveis.length
    ? jogaveis.map(k => { const g = HRM[k]; return `<button class="ctile ctile--tem" data-troca="${k}"><span class="ctile__p">${slot('god-' + k, ini(g.nome), COR(g.elem), 20)}</span><span class="ctile__el" style="background:${COR(g.elem)}"></span><span class="ctile__n">${H(g.nome)}</span></button>`; }).join('')
    : `<p class="result__msg">Você ainda não tem deuses seus — jogará com o emprestado.</p>`;
  return `<div class="ov" id="campickerov"><div class="ovbox"><div class="ov__cab"><h2>Trocar o deus emprestado</h2><button class="b b--quiet b--md" id="pickx">Fechar</button></div>
    <div class="cgrid cgrid--pick">${grid}</div></div></div>`;
}
function ligarCampPicker(){
  const ov = stage.querySelector('#campickerov'); if (!ov) return;
  const x = stage.querySelector('#pickx'); if (x) x.onclick = () => { campPicker = null; render(); };
  [...stage.querySelectorAll('.ctile[data-troca]')].forEach(b => { b.onclick = () => { campSwap[campPicker] = b.dataset.troca; campPicker = null; render(); }; });
}

// entrada de uma batalha: monta o time (travado + emprestado resolvido) e reusa a máquina de Provação.
function iniciarAto(cap, ato){
  const time = timeDoAto(ato).filter(Boolean);
  if (time.length !== 3) return;
  prova = null; provaFim = null;
  campanha = Object.assign({}, ato, { aliados: time, _capNome: cap.nome, _capIdx: campCapIdx });
  campanhaFim = null;
  st = montarProvacao(campanha);
  vsCPU = true;
  ir('batalha', {}, { substituir: true });
  render();
}
// ato de história: não abre luta, não paga — só marca e avança (§252: historia não paga).
function avancarHistoria(){
  const cap = CAMPS()[campCapIdx], ato = cap.atos[campAtoIdx];
  if (!atoFeito(ato.id)) {
    if (!perfil.campanha) perfil.campanha = { capitulo: 0, fase: 0, concluidas: [] };
    if (!Array.isArray(perfil.campanha.concluidas)) perfil.campanha.concluidas = [];
    perfil.campanha.concluidas.push(ato.id);
    const res = salvar(perfil); if (res && !res.ok) {/* silencioso: história não tem estado crítico */}
  }
  const prox = proximoAtoRef(campCapIdx, campAtoIdx);
  if (prox) { campCapIdx = prox.cap; campAtoIdx = prox.ato; campSwap = {}; campVistaAto = null; }
  render();
}
// referência do próximo ato (dentro do capítulo, ou o 1º do próximo capítulo).
function proximoAtoRef(capIdx, atoIdx){
  const caps = CAMPS(); const atos = caps[capIdx].atos || [];
  if (atoIdx + 1 < atos.length) return { cap: capIdx, ato: atoIdx + 1 };
  if (capIdx + 1 < caps.length) return { cap: capIdx + 1, ato: 0 };
  return null;
}

// entrada de um encontro: time fixo → briefing→batalha; time nulo → o jogador MONTA (ensina a escolha).
function iniciarEncontro(id){
  const enc = campEncontros().find(e => e.id === id);
  if (!enc) return;
  if (enc.aliados == null) { campTimePick = []; ir('montartime', { id }); render(); return; }
  iniciarEncontroComTime(enc, enc.aliados);
}
function iniciarEncontroComTime(enc, time){
  prova = null; provaFim = null;               // não é Provação
  campanha = Object.assign({}, enc, { aliados: time });
  campanhaFim = null;
  st = montarProvacao(campanha);               // reusa a máquina: só usa aliados/inimigos/montar
  vsCPU = true;
  ir('batalha', {}, { substituir: true });
  render();
}

/* ---------- montar time (o encontro "escolha de time") ---------- */
function renderMontarTime(){
  const id = (paramsAtuais() || {}).id;
  const enc = campEncontros().find(e => e.id === id) || {};
  const jogaveis = ROSTER.map(e => e.key).filter(k => temDeus(k) && temKitHome(k));
  const tile = k => {
    const g = HRM[k] || { nome: k, elem: 'Umbra' };
    const on = campTimePick.includes(k);
    return `<button class="ctile ctile--tem ${on ? 'ctile--sel' : ''}" data-pick="${k}">
      <span class="ctile__p">${slot('god-' + k, ini(g.nome), COR(g.elem), 20)}</span>
      <span class="ctile__el" style="background:${COR(g.elem)}"></span>
      ${on ? `<span class="ctile__mark">${campTimePick.indexOf(k) + 1}</span>` : ''}
      <span class="ctile__n">${H(g.nome)}</span>
    </button>`;
  };
  const pronto = campTimePick.length === 3;
  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="tela">
    <header class="tela__cab">
      <button class="b b--quiet b--md" id="bvoltar">‹ Voltar</button>
      <h1 class="tela__titulo">Monte seu time</h1>
      <span class="tela__cont">${campTimePick.length}/3</span>
    </header>
    <div class="tela__rol">
      <div class="ccap"><h2>${H(enc.nome || '')}</h2><p>${H((enc.ensina && enc.ensina.dica) || '')}</p></div>
      <div class="cgrid">${jogaveis.map(tile).join('')}</div>
    </div>
    <div class="cmontarpe">
      <button class="b b--primary b--lg" id="bcomecar" ${pronto ? '' : 'disabled'}>Começar${pronto ? '' : ` (${campTimePick.length}/3)`}</button>
    </div>
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('campanha', {}, { substituir: true }); render(); };
  [...stage.querySelectorAll('.ctile[data-pick]')].forEach(b => {
    b.onclick = () => {
      const k = b.dataset.pick, j = campTimePick.indexOf(k);
      if (j >= 0) campTimePick.splice(j, 1); else if (campTimePick.length < 3) campTimePick.push(k);
      render();
    };
  });
  const bc = stage.querySelector('#bcomecar');
  if (bc && pronto) bc.onclick = () => { const enc2 = campEncontros().find(e => e.id === id); iniciarEncontroComTime(enc2, campTimePick.slice()); };
  fit();
}

/* ---------- HUD do encontro (a lição visível durante) ---------- */
function campanhaHUD(){
  if (!campanha) return '';
  const en = campanha.ensina || {};
  const dl = (campanha.condicoes || []).find(c => c.predicado === 'deadline');
  const N = dl ? dl.turnos : null;
  // UMA LINHA na faixa: turno + a LIÇÃO curta. A dica longa vive no cartão do encontro (onde já cabe).
  // §252: batalhas do Cap 1 não têm `ensina` (as regras foram no Prólogo) — sem chip de lição, só o turno.
  return `<div class="phud phud--camp" aria-hidden="true">
    <span class="phud__prazo">T<b>${st.turno}</b>${N ? '/' + N : ''}</span>
    ${en.titulo ? `<span class="phud__chips"><span class="phud__chip phud__chip--andamento"><i>◆</i>Ensina: ${H(en.titulo)}</span></span>` : ''}
  </div>`;
}

/* ---------- resultado do encontro: vitória com recompensa, derrota com repetir ---------- */
function atualizarCampanha(){
  if (!campanha || campanhaFim || !st.fim) return;
  const venceu = st.fim.resultado === 'vitoria' && st.fim.lado === 0;
  campanhaFim = { venceu, recompensa: null, jaFeito: false };
  pararRelogio();
  if (venceu) { creditarMaestria(); concluirEncontro(campanha); }   // F3.5: encontro vencido conta p/ maestria
}
// F4 — SANDBOX (Batalha CPU): ao FIM de uma batalha PLANA (sem prova/campanha) contra a CPU,
// se o humano (lado 0) venceu, credita a recompensa simbólica com TETO diário. Latch em st
// (fresco a cada partida — sem global a resetar). Empate/derrota/hotseat: st._sandbox=null.
// NÃO avança missão nem ranque (não existem ainda); pode avançar maestria (cosmética, §212).
function atualizarSandbox(){
  if (!st || !st.fim || st._sandbox !== undefined) return;   // uma vez por partida
  if (!vsCPU || st.fim.resultado !== 'vitoria' || st.fim.lado !== 0) { st._sandbox = null; return; }
  creditarMaestria();   // sandbox pode avançar maestria (cosmética) — decisão do dono
  const econ = (typeof ECONOMIA !== 'undefined' && ECONOMIA.sandbox) ? ECONOMIA.sandbox : null;
  const gemaV = (econ && econ.recompensas && econ.recompensas.vitoria) ? (econ.recompensas.vitoria.gema || 0) : 0;
  const teto = econ ? (econ.tetoDia || 0) : 0;
  const hoje = new Date().toISOString().slice(0, 10);   // borda impura: data local do dispositivo
  const r = creditarSandbox(perfil, hoje, gemaV, teto);
  perfil = r.perfil;
  st._sandbox = { creditou: r.creditou, gema: r.gema, vitoriasHoje: r.vitoriasHoje, teto: r.teto };
  const res = salvar(perfil);
  if (res && !res.ok && st) st.log.push({ turno: st.turno, msg: '⚠ vitória, mas a gravação falhou: ' + res.erro });
}
function concluirEncontro(enc){
  if (!perfil) return;
  if (!perfil.campanha) perfil.campanha = { capitulo: 0, fase: 0, concluidas: [] };
  if (!Array.isArray(perfil.campanha.concluidas)) perfil.campanha.concluidas = [];
  const jaFeito = perfil.campanha.concluidas.includes(enc.id);
  const r = recompensaDe(enc.recompensa) || {};
  if (!jaFeito) {
    if (r.gema) perfil = creditar(perfil, 'gema', r.gema);
    if (r.essencia) perfil = creditar(perfil, 'essencia', r.essencia);
    if (!perfil.campanha) perfil.campanha = { capitulo: 0, fase: 0, concluidas: [] };
    if (!Array.isArray(perfil.campanha.concluidas)) perfil.campanha.concluidas = [];
    perfil.campanha.concluidas.push(enc.id);
    perfil.campanha.capitulo = Math.max(perfil.campanha.capitulo || 0, (typeof CAMPANHA !== 'undefined' && CAMPANHA) ? CAMPANHA.capitulo : 1);
    const res = salvar(perfil);
    if (res && !res.ok && st) st.log.push({ turno: st.turno, msg: '⚠ vitória, mas a gravação falhou: ' + res.erro });
  }
  campanhaFim.jaFeito = jaFeito;
  campanhaFim.recompensa = jaFeito ? null : r;   // re-jogar não paga de novo
}
// próximo ATO depois de vencer a batalha atual (dentro do capítulo ou o 1º do próximo).
function proximoAtoDepois(){
  if (!campanha || campanha._capIdx == null) return null;
  const capIdx = campanha._capIdx;
  const atos = CAMPS()[capIdx] ? CAMPS()[capIdx].atos : [];
  const i = atos.findIndex(a => a.id === campanha.id);
  return i < 0 ? null : proximoAtoRef(capIdx, i);
}
function campanhaResultadoOverlay(){
  if (!campanha || !campanhaFim) return '';
  const f = campanhaFim, venceu = f.venceu;
  const prox = venceu ? proximoAtoDepois() : null;
  let placar = '';
  if (venceu) {
    placar = f.recompensa && recompensaTexto(f.recompensa)
      ? `<div class="result__placar"><span>Recompensa</span><b>${H(recompensaTexto(f.recompensa))}</b></div>`
      : (f.jaFeito ? '<p class="result__msg">Ato já vencido — sem nova recompensa.</p>' : '');
  }
  const ens = (campanha.ensina || {}).titulo;
  return `<div class="ov"><div class="ovbox"><div class="result result--prova result--${venceu ? 'venceu' : 'hp'}">
    <span class="result__selo">${H(campanha._capNome || 'Campanha')}</span>
    <h1>${venceu ? 'ATO CONCLUÍDO' : 'DERROTA'}</h1>
    <p class="result__prova">${H(campanha.nome || '')}</p>
    <p class="result__msg">${venceu ? (ens ? H('Aprendido: ' + ens) : 'A história avança.') : 'Seus deuses tombaram — o ato fica; repita quando quiser.'}</p>
    ${placar}
    <div class="result__acoes">
      <button class="b b--quiet b--md" id="cfvoltar">Voltar à campanha</button>
      ${venceu
        ? (prox ? '<button class="b b--primary b--md" id="cfprox">Próximo ato</button>' : '')
        : '<button class="b b--primary b--md" id="cftentar">Tentar de novo</button>'}
    </div>
  </div></div></div>`;
}
function ligarCampanhaFim(){
  const q = s => stage.querySelector(s);
  const v = q('#cfvoltar'); if (v) v.onclick = () => { sairCampanha(); ir('campanha', {}, { substituir: true }); render(); };
  const t = q('#cftentar'); if (t) t.onclick = () => { campanhaFim = null; st = montarProvacao(campanha); ir('batalha', {}, { substituir: true }); render(); };
  const p = q('#cfprox'); if (p) { const prox = proximoAtoDepois(); p.onclick = () => { sairCampanha(); if (prox) { campCapIdx = prox.cap; campAtoIdx = prox.ato; campSwap = {}; campVistaAto = null; } ir('campanha', {}, { substituir: true }); render(); }; }
}
function sairCampanha(){ campanha = null; campanhaFim = null; }

// ===================================================================
// F3.4 — PROVAÇÃO SEMANAL: o motor de puzzles da Fase 2 como GERADOR perpétuo.
// A semente é o número da SEMANA ISO — todo jogador recebe o mesmo puzzle, offline,
// determinístico. O pool (data/semanais.json) foi PRÉ-GERADO e provado VENCÍVEL pelo
// solucionador (tools/gerar_semanais.js), com os filtros da Fase 2 (rider de sobrevivência
// + time-curador §196, sem simultaneidade §193). Reusa TODA a máquina de Provação (F3.1):
// mesmo HUD, mesmo laço de avaliação, mesmo PLACAR de lances contra o mínimo do solucionador.
// ===================================================================

// A "quinta desta semana" resolve semana E ano ISO 8601 de uma vez (a semana pertence ao ano da quinta).
function quintaISO(d){
  const t = new Date(d || Date.now());
  const u = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()));
  const dia = u.getUTCDay() || 7;               // segunda=1 … domingo=7
  u.setUTCDate(u.getUTCDate() + 4 - dia);        // quinta desta semana
  return u;
}
// número da semana ISO 8601 (semente do puzzle). Determinístico por data — sem servidor.
function semanaISOAtual(d){
  const u = quintaISO(d);
  const inicioAno = new Date(Date.UTC(u.getUTCFullYear(), 0, 1));
  return Math.ceil((((u - inicioAno) / 86400000) + 1) / 7);
}
function anoISOAtual(d){ return quintaISO(d).getUTCFullYear(); }
function provaSemanalAtual(){
  const pool = (typeof SEMANAIS !== 'undefined' && SEMANAIS && SEMANAIS.puzzles) ? SEMANAIS.puzzles : [];
  if (!pool.length) return null;
  const wk = semanaISOAtual(), ano = anoISOAtual();
  // SEMENTE = (ano, semana): o ano roda o alinhamento em ×7 (coprimo de 52) → 52 puzzles distintos por
  // ano E a mesma semana do calendário NÃO repete o puzzle no ano seguinte (não repete em silêncio).
  const idx = (((wk + ano * 7) % pool.length) + pool.length) % pool.length;
  const raw = pool[idx];
  const g = HRM[raw.key] || { nome: raw.key };
  const dl = (raw.condicoes.find(c => c.predicado === 'deadline') || {}).turnos;
  return Object.assign({}, raw, {
    titulo: 'Desafio de ' + g.nome,
    nivel: 'Semanal',
    dificuldade: raw.minimo >= 22 ? 3 : raw.minimo >= 15 ? 2 : 1,
    semanal: true, semanaISO: wk, anoISO: ano, deadline: dl,
    scoreKey: 'semanal:' + ano + 'W' + wk,   // ano no placar: a mesma semana de anos diferentes não colide
  });
}
function iniciarSemanal(){
  const p = provaSemanalAtual();
  if (!p) return;
  campanha = null; campanhaFim = null;
  prova = p; provaFim = null; provaLances = 0;
  st = montarProvacao(p);
  vsCPU = true;
  ir('batalha', {}, { substituir: true });
  render();
}
// banner no topo da lista de Provações (a semanal é uma Provação em destaque, não um 6º destino).
function bannerSemanalHTML(){
  const p = provaSemanalAtual();
  if (!p) return '';
  const g = HRM[p.key] || { nome: p.key, elem: 'Umbra' };
  const feito = !!(perfil && perfil.provacoes && perfil.provacoes[p.scoreKey]);
  const inimigos = (p.inimigos || []).map(k => (HRM[k] && HRM[k].nome) || k).join(' · ');
  const gema = ((typeof ECONOMIA !== 'undefined' && ECONOMIA.semanal && ECONOMIA.semanal.recompensa && ECONOMIA.semanal.recompensa.gema)) || 0;
  return `<button class="psem" data-semanal="1">
    <span class="psem__p">${slot('god-' + p.key, ini(g.nome), COR(g.elem), 24)}</span>
    <span class="psem__id">
      <span class="psem__rot">DESAFIO DA SEMANA <b>#${p.semanaISO}</b></span>
      <span class="psem__tit">${H(p.titulo)} — mantenha ${H(g.nome)} de pé em ${p.deadline} turnos</span>
      <span class="psem__foe">contra ${H(inimigos)}</span>
    </span>
    <span class="psem__pe">
      <span class="psem__rec">${feito ? '✓ Gema recebida' : (gema ? `${gema} de Gema` : 'grátis')}</span>
      <span class="psem__go">▷</span>
    </span>
  </button>`;
}

// ===================================================================
// F3.5 — MAESTRIA (4 níveis por deus) e PANTEÕES (por PROPORÇÃO, §200).
// RESTRIÇÃO QUE MANDA (dono): maestria dá TÍTULO e COSMÉTICO, NUNCA poder de combate.
// Tudo aqui é contador de perfil + exibição — nada toca `st`, kit, dano ou HP.
// Iniciado = a Provação do deus (90 saem de graça); os outros três por VITÓRIAS
// acumuladas, com a CONDIÇÃO DE KIT no Mestre (ter vencido usando o Milagre do deus —
// a assinatura do kit, universal e sem autorar 100 feitos).
// ===================================================================

const MAESTRIA_LIMIAR = { aprendiz: 5, adepto: 15, mestre: 30 };
const MAESTRIA_NOME = { 0: '—', 1: 'Iniciado', 2: 'Aprendiz', 3: 'Adepto', 4: 'Mestre' };
function maestriaDe(key){ return (perfil && perfil.maestria && perfil.maestria[key]) || { vitorias: 0, milagre: false }; }
function provacaoVencida(key){ return !!(perfil && perfil.provacoes && perfil.provacoes[key]); }
function nivelMaestria(key){
  const m = maestriaDe(key), v = m.vitorias || 0;
  const iniciado = provacaoVencida(key) || v >= 1;   // 90 Iniciados vêm das 90 Provações; iniciais chegam por 1 vitória
  if (v >= MAESTRIA_LIMIAR.mestre && m.milagre) return 4;
  if (v >= MAESTRIA_LIMIAR.adepto) return 3;
  if (v >= MAESTRIA_LIMIAR.aprendiz) return 2;
  if (iniciado) return 1;
  return 0;
}
// contadores AGREGADOS (a cauda longa que não acaba)
function contarMaestria(pred){ return (typeof ROSTER !== 'undefined') ? ROSTER.filter(e => pred(e.key)).length : 0; }
function totalDominados(){ return contarMaestria(k => nivelMaestria(k) === 4); }     // "domina X dos 100" = Mestres
function totalIniciados(){ return contarMaestria(k => nivelMaestria(k) >= 1); }
// PROPORÇÃO por panteão (§200): fração DOMINADA — comparável entre 19 gregos e 4 maias.
function dominadosPanteao(faccao){
  const ks = ROSTER.filter(e => e.faccao === faccao).map(e => e.key);
  const dom = ks.filter(k => nivelMaestria(k) === 4).length;
  return { dom, total: ks.length, metade: Math.ceil(ks.length / 2) };
}

// CREDITA a vitória à maestria dos deuses que jogaram (lado 0). SÓ contador — sem efeito de combate.
// A CONDIÇÃO DE KIT (Mestre): venceu tendo lançado o Milagre do próprio deus nesta partida.
function creditarMaestria(){
  if (!perfil || !st) return;
  if (!perfil.maestria) perfil.maestria = {};
  const lancouMilagre = new Set(st.log.filter(e => e.tipo === 'acao' && e.slot === 'milagre').map(e => e.origem));
  for (const u of st.lados[0].units) {
    const k = u.key;
    const m = perfil.maestria[k] || (perfil.maestria[k] = { vitorias: 0, milagre: false });
    m.vitorias = (m.vitorias || 0) + 1;
    if (lancouMilagre.has(u.uid)) m.milagre = true;
  }
}

// bloco de maestria no detalhe do deus: os 4 níveis, o atual, progresso e a condição de kit.
function maestriaDetalheHTML(key){
  const m = maestriaDe(key), v = m.vitorias || 0, nv = nivelMaestria(key);
  const trilha = [1, 2, 3, 4].map(n => {
    const atingido = nv >= n;
    return `<span class="mtier ${atingido ? 'on' : ''} ${nv === n ? 'cur' : ''}">${MAESTRIA_NOME[n]}</span>`;
  }).join('<span class="mtier__sep">›</span>');
  let prox = '';
  if (nv === 0) prox = provacaoVencida(key) ? '' : 'Vença o Pergaminho (ou 1 batalha) para o Iniciado.';
  else if (nv === 1) prox = `Aprendiz em ${Math.max(0, MAESTRIA_LIMIAR.aprendiz - v)} vitória(s).`;
  else if (nv === 2) prox = `Adepto em ${Math.max(0, MAESTRIA_LIMIAR.adepto - v)} vitória(s).`;
  else if (nv === 3) prox = `Mestre: ${Math.max(0, MAESTRIA_LIMIAR.mestre - v)} vitória(s)${m.milagre ? '' : ' + vencer usando o Milagre dele'}.`;
  else prox = 'Mestre — nível máximo.';
  return `<div class="dmaes">
    <span class="dmaes__rot">MAESTRIA</span>
    <div class="dmaes__trilha">${trilha}</div>
    <div class="dmaes__pe">
      <span class="dmaes__v">${v} vitória${v === 1 ? '' : 's'}${m.milagre ? ' · Milagre ✓' : ''}</span>
      <span class="dmaes__prox">${H(prox)}</span>
    </div>
  </div>`;
}
function pipMaestria(key){
  const nv = nivelMaestria(key);
  if (nv === 0) return '';
  return `<span class="ctile__m m--${nv}" title="${MAESTRIA_NOME[nv]}">${nv === 4 ? '★' : nv}</span>`;
}

// ===================================================================
// F3.6 — DESAFIOS DE COMPOSIÇÃO: o INVERSO da Provação. O jogador dá o TIME e o jogo
// testa se ele sabe montar. A REGRA de time é validada AO MONTAR (não ao perder) — o
// mesmo princípio do "tocar nunca gasta": o erro é reversível antes de custar. O rider em
// jogo reusa predicados; a recompensa é LEVE de propósito (maestria + um pouco de Essência)
// — o valor é o quebra-cabeça, não o grind. Reusa a máquina de Provação (flag `desafio`).
// ===================================================================

let desafioTimePick = [];

function desafios(){ return (typeof COMPOSICAO !== 'undefined' && COMPOSICAO && COMPOSICAO.desafios) ? COMPOSICAO.desafios : []; }
function desafioFeito(id){ return !!(perfil && perfil.provacoes && perfil.provacoes['desafio:' + id]); }
function recompensaDesafio(chave){
  const r = (typeof ECONOMIA !== 'undefined' && ECONOMIA.desafios && ECONOMIA.desafios.recompensas) ? ECONOMIA.desafios.recompensas[chave] : null;
  return r || {};
}
// VALIDAÇÃO DE TIME (o novo): devolve {ok, motivo}. `livre` = sem regra de composição (o rider é em jogo).
function validarRegra(regraId, keys){
  const gs = keys.map(k => HRM[k]).filter(Boolean);
  if (keys.length < 3) return { ok: false, motivo: `Escolha ${3 - keys.length} deus(es)` };
  const el = new Set(gs.map(g => g.elem)), fu = new Set(gs.map(g => g.funcao)), pa = new Set(gs.map(g => g.faccao));
  switch (regraId) {
    case 'monoElemento':    return el.size === 1 ? { ok: true } : { ok: false, motivo: 'Precisam ser do MESMO elemento' };
    case 'mesmaFuncao':     return fu.size === 1 ? { ok: true } : { ok: false, motivo: 'Precisam ser da MESMA função' };
    case 'monoPanteao':     return pa.size === 1 ? { ok: true } : { ok: false, motivo: 'Precisam ser do MESMO panteão' };
    case 'funcoesDistintas':return fu.size === 3 ? { ok: true } : { ok: false, motivo: 'Precisam ser três funções DIFERENTES' };
    default:                return { ok: true };   // 'livre'
  }
}

function cardDesafioHTML(dsf){
  const feito = desafioFeito(dsf.id);
  const r = recompensaDesafio(dsf.recompensa);
  const rid = dsf.regra === 'livre' ? 'Time livre' : 'Regra de time';
  return `<button class="cenc cenc--${feito ? 'feito' : 'aberto'}" data-desafio="${dsf.id}">
    <span class="cenc__ic">${feito ? '✓' : '◆'}</span>
    <span class="cenc__id">
      <span class="cenc__nome">${H(dsf.nome)}</span>
      <span class="cenc__ensina">${H(dsf.regraTexto)}</span>
    </span>
    <span class="cenc__pe">
      <span class="cenc__rec">${r.essencia ? `${r.essencia} ✦` : ''}${feito ? ' <span class="cenc__feitosel">✓</span>' : ''}</span>
      <span class="cenc__estado">${feito ? 'vencido' : rid}</span>
    </span>
  </button>`;
}
function renderDesafios(){
  const lista = desafios();
  const feitos = lista.filter(d => desafioFeito(d.id)).length;
  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="tela">
    <header class="tela__cab">
      <button class="b b--quiet b--md" id="bvoltar">‹ Provações</button>
      <h1 class="tela__titulo">Desafios de Composição</h1>
      <span class="tela__cont">${feitos}/${lista.length}</span>
    </header>
    <div class="tela__rol">
      <div class="ccap"><h2>Você monta o time; o jogo testa se sabe montá-lo.</h2><p>Cada desafio impõe uma regra de composição. A recompensa é leve — o valor é o quebra-cabeça.</p></div>
      <div class="clista">${lista.map(cardDesafioHTML).join('')}</div>
    </div>
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('desafios', {}, { substituir: true }); render(); };   // §213: volta ao hub
  [...stage.querySelectorAll('.cenc[data-desafio]')].forEach(b => {
    b.onclick = () => { desafioTimePick = []; ir('desafiomontar', { id: b.dataset.desafio }); render(); };
  });
  fit();
}

// montador COM validação AO VIVO da regra: Começar fica travado E DIZ POR QUÊ até o time servir.
function renderDesafioMontar(){
  const id = (paramsAtuais() || {}).id;
  const dsf = desafios().find(d => d.id === id) || {};
  const jogaveis = ROSTER.map(e => e.key).filter(k => temDeus(k) && temKitHome(k));
  const val = validarRegra(dsf.regra, desafioTimePick);
  const tile = k => {
    const g = HRM[k] || { nome: k, elem: 'Umbra' };
    const on = desafioTimePick.includes(k);
    return `<button class="ctile ctile--tem ${on ? 'ctile--sel' : ''}" data-pick="${k}" title="${H(g.nome)}">
      <span class="ctile__p">${slot('god-' + k, ini(g.nome), COR(g.elem), 20)}</span>
      <span class="ctile__el" style="background:${COR(g.elem)}"></span>
      ${on ? `<span class="ctile__mark">${desafioTimePick.indexOf(k) + 1}</span>` : ''}
      <span class="ctile__n">${H(g.nome)}</span>
    </button>`;
  };
  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="tela">
    <header class="tela__cab">
      <button class="b b--quiet b--md" id="bvoltar">‹ Voltar</button>
      <h1 class="tela__titulo">${H(dsf.nome || '')}</h1>
      <span class="tela__cont">${desafioTimePick.length}/3</span>
    </header>
    <div class="tela__rol">
      <div class="ccap"><h2>${H(dsf.regraTexto || '')}</h2></div>
      <div class="cgrid">${jogaveis.map(tile).join('')}</div>
    </div>
    <div class="cmontarpe">
      <span class="cval ${val.ok ? 'ok' : 'nao'}">${val.ok ? '✓ time válido' : '✕ ' + H(val.motivo)}</span>
      <button class="b b--primary b--lg" id="bcomecar" ${val.ok ? '' : 'disabled'}>Começar</button>
    </div>
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('composicao', {}, { substituir: true }); render(); };   // §213: volta à lista de composição
  [...stage.querySelectorAll('.ctile[data-pick]')].forEach(b => {
    b.onclick = () => {
      const k = b.dataset.pick, j = desafioTimePick.indexOf(k);
      if (j >= 0) desafioTimePick.splice(j, 1); else if (desafioTimePick.length < 3) desafioTimePick.push(k);
      render();
    };
  });
  const bc = stage.querySelector('#bcomecar');
  if (bc && val.ok) bc.onclick = () => iniciarDesafio(dsf, desafioTimePick.slice());
  fit();
}

function iniciarDesafio(dsf, time){
  campanha = null; campanhaFim = null;
  const cam = (dsf.condicoes.find(c => c.predicado === 'deadline') || {}).turnos;
  prova = {
    key: time[0], titulo: dsf.nome, nivel: 'Desafio', dificuldade: 2,
    aliados: time, inimigos: dsf.inimigos, montar: dsf.montar || {}, condicoes: dsf.condicoes,
    minimo: null, desafio: true, desafioId: dsf.id, regraTexto: dsf.regraTexto,
    scoreKey: 'desafio:' + dsf.id, recompensaEss: (recompensaDesafio(dsf.recompensa).essencia || 0),
  };
  provaFim = null; provaLances = 0;
  st = montarProvacao(prova);
  vsCPU = true;
  ir('batalha', {}, { substituir: true });
  render();
}

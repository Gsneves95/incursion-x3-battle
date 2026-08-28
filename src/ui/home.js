// ui/home.js — a TELA INICIAL (hub) e a LISTA DE PROVAÇÕES (F3.0).
// O jogo é APLICATIVO de celular em paisagem: a home NÃO rola (cabe inteira no
// palco 428 de altura), alvos de toque grandes (≥76px), e nada de hover como
// afordância — o estado do destino é dito por TEXTO no próprio cartão.
//
// Cinco destinos: Campanha, Provações, Invocação, Coleção, PvP. Nesta fase só a
// Provações FUNCIONA (lista os 90); os outros três abrem um marcador "em breve" e o
// PvP é INDISPONÍVEL (chega na Fase 5) — cartão morto, sem navegação.

/* ---------- metadados de exibição (ROSTER tem os 100, inclusive sem kit) ---------- */
const HRM = {}; ROSTER.forEach(e => HRM[e.key] = e);

// Os cinco caminhos da home. `rota` nula = cartão indisponível (PvP, Fase 5). Os três
// "em breve" caem todos no mesmo marcador, parametrizado pelo título — nenhum motor novo.
const HOME_DESTINOS = [
  { chave: 'campanha',  rotulo: 'Campanha',  glifo: '⚔', rota: 'embreve',   nota: 'Em breve' },
  { chave: 'provacoes', rotulo: 'Provações', glifo: '◈', rota: 'provacoes', destaque: true },
  { chave: 'invocacao', rotulo: 'Invocação', glifo: '✦', rota: 'embreve',   nota: 'Em breve' },
  { chave: 'colecao',   rotulo: 'Coleção',   glifo: '▤', rota: 'embreve',   nota: 'Em breve' },
  { chave: 'pvp',       rotulo: 'PvP',       glifo: '★', rota: null,        nota: 'Indisponível · Fase 5' },
];

// nº de Provações que a lista mostra — 90 (não 91, não 63): o global PROVACOES é
// injetado na build a partir de data/provacoes/*.json (um arquivo por deus carimbado).
function totalProvacoes(){ return (typeof PROVACOES !== 'undefined') ? PROVACOES.length : 0; }

function tileHomeHTML(d){
  const indisponivel = !d.rota;
  const nota = d.chave === 'provacoes'
    ? `${totalProvacoes()} provações`
    : (d.nota || '');
  const cls = ['htile'];
  if (d.destaque) cls.push('htile--destaque');
  if (indisponivel) cls.push('htile--off');
  // cartão indisponível é <div> (não navega, não foca); os demais são <button>.
  const tag = indisponivel ? 'div' : 'button';
  const attr = indisponivel ? '' : ` data-dest="${d.chave}"`;
  return `<${tag} class="${cls.join(' ')}"${attr}>
    <span class="htile__ic">${d.glifo}</span>
    <span class="htile__rot">${H(d.rotulo)}</span>
    <span class="htile__nota">${H(nota)}</span>
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
    <nav class="home__grade">${HOME_DESTINOS.map(tileHomeHTML).join('')}</nav>
  </div>
  </div>`;
  ligarHome();
  fit();
}

function ligarHome(){
  [...stage.querySelectorAll('.htile[data-dest]')].forEach(b => {
    b.onclick = () => {
      const d = HOME_DESTINOS.find(x => x.chave === b.dataset.dest);
      if (!d || !d.rota) return;
      if (d.rota === 'embreve') ir('embreve', { titulo: d.rotulo });
      else ir(d.rota);
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
      <p class="tela__vaziomsg">${H(titulo)} chega numa fase adiante.<br>Por ora, a jornada é pelas Provações.</p>
    </div>
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  fit();
}

/* ---------- lista de Provações ---------- */
// NÍVEL vem do CARIMBO (o `nivel` do arquivo por-deus, corrigido pela medição na F2),
// NUNCA do catálogo em prosa (§185: 36/90 divergiam). O flag `generica` NÃO aparece: o
// jogador não deve sentir Provação de segunda classe — as 27 rotas parecem iguais às 63.
const NIVEL_ORDEM = { 'Rito': 0, 'Provação': 1, 'Ordália': 2 };
function nivelPeso(n){ return (n in NIVEL_ORDEM) ? NIVEL_ORDEM[n] : 1; }

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

function linhaProvHTML(p, concluida){
  const g = HRM[p.key] || { nome: p.key, elem: 'Umbra', faccao: '' };
  const cls = ['prow']; if (concluida) cls.push('prow--feita');
  return `<li class="${cls.join(' ')}">
    <span class="prow__p">${slot('god-' + p.key, ini(g.nome), COR(g.elem), 22)}</span>
    <span class="prow__el" style="background:${COR(g.elem)}"></span>
    <span class="prow__id">
      <span class="prow__deus">${H(g.nome)}${concluida ? '<span class="prow__selo">✓ conquistado</span>' : ''}</span>
      <span class="prow__tit">${H(p.titulo || '')}${g.faccao ? ` · ${H(g.faccao)}` : ''}</span>
    </span>
    <span class="prow__meta">
      <span class="prow__niv niv--${nivelPeso(p.nivel)}">${H(p.nivel || '')}</span>
      ${pipsDif(p.dificuldade || 1)}
    </span>
  </li>`;
}

function ordenar(lista){
  return lista.slice().sort((a, b) =>
    nivelPeso(a.nivel) - nivelPeso(b.nivel) ||
    (a.dificuldade || 1) - (b.dificuldade || 1) ||
    ((HRM[a.key] && HRM[a.key].nome) || a.key).localeCompare((HRM[b.key] && HRM[b.key].nome) || b.key, 'pt'));
}

function renderProvacoes(){
  const todas = (typeof PROVACOES !== 'undefined') ? PROVACOES : [];
  const disp = ordenar(todas.filter(p => !temDeus(p.key)));
  const feitas = ordenar(todas.filter(p => temDeus(p.key)));

  const secao = (rot, arr, feita) => `
    <div class="psec__cab"><h2>${rot}</h2><span class="psec__n">${arr.length}</span></div>
    ${arr.length
      ? `<ul class="plist">${arr.map(p => linhaProvHTML(p, feita)).join('')}</ul>`
      : `<p class="psec__vazio">${feita ? 'Nenhuma conquistada ainda — vença uma Provação para trazer o deus à sua coleção.' : 'Nenhuma disponível.'}</p>`}`;

  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="tela">
    <header class="tela__cab">
      <button class="b b--quiet b--md" id="bvoltar">‹ Início</button>
      <h1 class="tela__titulo">Provações</h1>
      <span class="tela__cont">${todas.length}</span>
    </header>
    <div class="tela__rol" id="provrol">
      ${secao('DISPONÍVEIS', disp, false)}
      ${feitas.length ? secao('CONCLUÍDAS', feitas, true) : ''}
    </div>
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  fit();
}

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
  { chave: 'dominios',    arte: 'dominios',    rotulo: 'Domínios',    rota: 'dominios', placeholder: true },   // §274: placeholder do §213 até a ILUSTRAÇÃO definitiva (web/banners/dominios.webp) — o cartão programático saltava ao lado das 8 artes
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

// §306 — A HOME É UM MAPA ESTÁTICO (o carrossel saiu). renderHome despacha: com a arte do
// mapa (MAPA_ARTE) e o dado de posições (MAPA), desenha o mapa; SEM a arte, cai no carrossel
// de hoje (fallback honesto, sem 404, sem pacote crescido). O carrossel fica INTEIRO abaixo.
function renderHome(){
  if (typeof MAPA !== 'undefined' && MAPA && MAPA.ilhas && typeof MAPA_ARTE !== 'undefined' && MAPA_ARTE) renderHomeMapa();
  else renderHomeCarrossel();
}

/* ================= §306/§310 — O MAPA ================= */
// §310: a arte nova (2400×999, 2,40) PREENCHE o palco (cover) — a caixa tem a altura do palco (428) e a
// largura natural da arte (~1028px), centrada; o overflow corta as laterais quando o palco é mais estreito
// (piso 780 → -24%). ANTES (§306) a caixa era travada em 1,78 (762×428) e o gutter mostrava o fundo escuro.
// Os ícones ancoram em % DA ARTE (data/mapa.json); as posições foram recalculadas p/ a arte nova (§310).

// medidor de largura de texto REAL (fontes locais §260), para o corte da Campanha se aplicar
// sozinho quando a região estourar. Usa um <span> oculto (offsetWidth) — NÃO canvas: em jsdom o
// canvas emite "not implemented" (quebra o smoke) e o offsetWidth simplesmente devolve 0 → null →
// mantém a forma cheia. Num navegador real dá a largura em px de design (mesma métrica do §305b).
function _larguraTexto(txt, font){
  try {
    let el = _larguraTexto._el;
    if (!el || !el.isConnected){
      el = _larguraTexto._el = document.createElement('span');
      el.style.cssText = 'position:absolute;left:-9999px;top:-9999px;white-space:nowrap;visibility:hidden;pointer-events:none';
      (document.body || document.documentElement).appendChild(el);
    }
    el.style.font = font;
    el.textContent = txt;
    const w = el.offsetWidth || (el.getBoundingClientRect && el.getBoundingClientRect().width) || 0;
    return (w && w > 0) ? w : null;
  } catch (e) { return null; }
}

// perfil no lugar do NÍVEL (§305: não existe nível de conta). Apelido + faixa de RANQUE; sem
// barra de nível, sem envelope, sem sino. Online: nick + faixa do servidor. Offline: só o apelido local.
function mapaPerfilHTML(){
  const online = !!(typeof contaAtual !== 'undefined' && contaAtual && contaAtual.nick);
  const nome = online ? contaAtual.nick : 'Jogador';
  const faixa = (online && contaAtual.ranque && contaAtual.ranque.faixa && contaAtual.ranque.faixa.nome) ? contaAtual.ranque.faixa.nome : '';
  return `<button class="mperfil" data-prof="me" title="Perfil do jogador">
    <span class="mperfil__pic">${typeof AVATAR_SVG !== 'undefined' ? AVATAR_SVG : ''}</span>
    <span class="mperfil__id"><b class="mperfil__nick">${H(nome)}</b>${faixa ? `<span class="mperfil__faixa">${H(faixa)}</span>` : ''}</span>
  </button>`;
}

// moeda no formato que o jogo já usa (§305: toLocaleString('pt-BR'), sem "K"). Gema (💎) + Essência (◈).
function mapaMoedasHTML(){
  // §318b-2 — do SERVIDOR (moedaServidor), "—" desconectado. Nunca o saldo local fantasma.
  const m = moedaServidor();
  return `<div class="mmoedas">
    <span class="mmoeda"><span class="mmoeda__ic mmoeda__ic--gema">💎</span><b>${fmtMoeda(m.online, m.gema)}</b></span>
    <span class="mmoeda"><span class="mmoeda__ic mmoeda__ic--ess">◈</span><b>${fmtMoeda(m.online, m.essencia)}</b></span>
  </div>`;
}

// CAMPANHA — o único contador longo (§305b): "Capítulo I · Grécia" (71px) na forma cheia enquanto
// a região couber; corta SOZINHO se estourar ~80px ("Cap. I · reg" → "Cap. I"). Retorna também a barra.
function mapaCampanhaDado(){
  const cap = (typeof CAMPANHA !== 'undefined' && CAMPANHA && CAMPANHA.capitulo) || 1;
  const reg = (typeof CAMPANHA !== 'undefined' && CAMPANHA && CAMPANHA.regiao) || '';
  const total = (typeof CAMPANHA !== 'undefined' && CAMPANHA && CAMPANHA.encontros) ? CAMPANHA.encontros.length : 0;
  const feitos = (typeof perfil !== 'undefined' && perfil && perfil.campanha && Array.isArray(perfil.campanha.concluidas)) ? perfil.campanha.concluidas.length : 0;
  const pct = total ? Math.round(feitos / total * 100) : 0;
  const rom = romanoCap(cap);
  const cheia = `Capítulo ${rom}${reg ? ' · ' + reg : ''}`;
  const media = `Cap. ${rom}${reg ? ' · ' + reg : ''}`;
  const curta = `Cap. ${rom}`;
  const CAP = 80, font = "600 10px 'Rajdhani',sans-serif";
  let texto = cheia;
  const w = _larguraTexto(cheia, font);
  if (w != null && w > CAP) texto = ((_larguraTexto(media, font) || 0) > CAP) ? curta : media;
  return { texto, pct, prog: `${feitos}/${total}` };
}

// o DADO VIVO de uma ilha — os MESMOS números do carrossel de hoje (§305b: 5 contadores),
// lidos do estado, nunca escritos no código. Retorna o HTML do contador (ou '' quando a ilha não tem).
function mapaContadorHTML(chave){
  if (chave === 'campanha'){
    const c = mapaCampanhaDado();
    return `<span class="ilha__cont ilha__cont--camp"><span class="ilha__camptxt">${H(c.texto)}</span><span class="ilha__campnum">${H(c.prog)}</span></span>
      <span class="ilha__barra"><i style="width:${c.pct}%"></i></span>`;
  }
  const num = t => `<span class="ilha__cont">${H(t)}</span>`;
  if (chave === 'provacoes'){
    const total = (typeof MISSOES !== 'undefined' && MISSOES.missoes) ? Object.keys(MISSOES.missoes).length : 0;
    if (!total) return '';
    const lib = (typeof contaAtual !== 'undefined' && contaAtual && contaAtual.missoes && Array.isArray(contaAtual.missoes.liberados)) ? contaAtual.missoes.liberados.length : null;
    return num(lib != null ? `${lib}/${total}` : `${total}`);
  }
  if (chave === 'desafios') return num(`${acervoPergaminhos().length}`);
  if (chave === 'invocacao'){
    const p = (typeof perfil !== 'undefined' && perfil && perfil.invocacao) ? (perfil.invocacao.desdeUltimoSS || 0) : 0;
    const duro = (typeof ECONOMIA !== 'undefined' && ECONOMIA.invocacao && ECONOMIA.invocacao.pity) ? ECONOMIA.invocacao.pity.duro : 0;
    return duro ? num(`${p}/${duro}`) : '';
  }
  if (chave === 'colecao'){
    const donos = (typeof perfil !== 'undefined' && perfil && perfil.deuses) ? Object.keys(perfil.deuses).length : 0;
    const total = (typeof ROSTER !== 'undefined') ? ROSTER.length : 100;
    return num(`${donos}/${total}`);
  }
  return '';
}

// UMA ilha: ícone (arquivo web/mapa/<chave>.webp; ausente → rótulo-reserva, sem 404) + nome + contador.
// emBreve (§306: Domínios, Loja): ícone a ~50% + tag "em breve" apagada, NUNCA vermelho, NÃO navega.
function ilhaHTML(i){
  const temIcone = (typeof MAPA_ICONES !== 'undefined' && MAPA_ICONES && MAPA_ICONES[i.chave]);
  const off = !!i.emBreve;
  const tag = off ? 'div' : 'button';
  const attr = off ? '' : ` data-dest="${H(i.chave)}"`;
  const cls = ['ilha']; if (off) cls.push('ilha--breve'); if (!temIcone) cls.push('ilha--semarte');
  // §311c: fundo escuro atrás do rótulo é LEVE por padrão (a sombra do texto carrega); as ilhas sobre arte CLARA
  // (data: `fundoForte`) mantêm o fundo firme, onde o pixel claro estoura o piso 4,5. É dado, art-coupled (rever se a arte mudar).
  if (i.fundoForte) cls.push('ilha--fundoforte');
  const icone = temIcone
    ? `<img class="ilha__ic" src="mapa/${H(i.chave)}.webp" alt="${H(i.rotulo)}" loading="lazy" onerror="this.remove();this.closest('.ilha').classList.add('ilha--semarte')">`
    : '';
  const rodape = off
    ? `<span class="ilha__breveTag">· em breve</span>`
    : mapaContadorHTML(i.chave);
  return `<${tag} class="${cls.join(' ')}"${attr} style="left:${i.x}%;top:${i.y}%">
    ${icone}<span class="ilha__reserva">◈</span>
    <span class="ilha__nome">${H(i.rotulo)}</span>
    ${rodape}
  </${tag}>`;
}

function renderHomeMapa(){
  const ilhas = MAPA.ilhas.map(ilhaHTML).join('');
  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="mapa">
    <img class="mapa__fundo" src="banners/mapa.webp" alt="" aria-hidden="true" onerror="this.remove()">
    <header class="mapa__topo">
      ${mapaPerfilHTML()}
      ${mapaMoedasHTML()}
    </header>
    <div class="mapa__caixa">
      <img class="mapa__art" src="banners/mapa.webp" alt="Mapa de INCURSION" onerror="this.remove()">
      <div class="mapa__scrim" aria-hidden="true"></div>
      ${ilhas}
    </div>
  </div>
  </div>`;
  ligarHomeMapa();
  fit();
}

function ligarHomeMapa(){
  // O mapa NÃO rola (lugares fixos): toque simples abre. Domínios e Loja (em breve) são <div>
  // sem data-dest — não focam, não navegam. Cada ilha viva abre a SUA rota (§306: 9 destinos).
  [...stage.querySelectorAll('.ilha[data-dest]')].forEach(b => {
    b.onclick = () => {
      const i = MAPA.ilhas.find(x => x.chave === b.dataset.dest);
      if (!i || i.emBreve || !i.rota) return;
      if (i.rota === 'embreve') ir('embreve', { titulo: i.titulo || i.rotulo });
      else ir(i.rota, i.params || {});
      render();
    };
  });
}

/* ================= o CARROSSEL (fallback §306: só quando a arte do mapa falta) ================= */
function renderHomeCarrossel(){
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
  ligarHomeCarrossel();
  fit();
}

function ligarHomeCarrossel(){
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
function contarConquistados(){ return Object.keys(MISSOES.missoes).filter(_temDeus).length; }
// §316 — adjetivo SINGULAR do panteão ("qualquer grego"), para os objetivos "p"/"sp" (o PANT_ADJ é plural).
const PANT_ADJ_SING = { 'Grega': 'grego', 'Nórdica': 'nórdico', 'Egípcia': 'egípcio', 'Japonesa': 'japonês', 'Chinesa': 'chinês', 'Hindu': 'hindu', 'Brasileira': 'brasileiro', 'Africana': 'africano', 'Celta': 'celta', 'Maia': 'maia' };
function _adjS(p){ return PANT_ADJ_SING[p] || H(p); }

// §314 — DISPONÍVEL PARA ATIVAR: ranque atingido + os NOMES OBRIGATÓRIOS possuídos (o de "s","j","c" e ≥1
// de cada lista "v"). "p"/"sp"/"a" NÃO travam. Espelha server/missoes.js.disponivelParaAtivar (o servidor
// é autoritativo; isto é só para desenhar). Retorna { ok, rankOk, faltam:[nomes] }.
function provDisponivel(k){
  const m = MISSOES.missoes[k];
  const pts = (contaAtual && contaAtual.ranque && typeof contaAtual.ranque.pontos === 'number') ? contaAtual.ranque.pontos : 0;
  const rankOk = pts >= (m.faixaMin || 0);
  const faltam = [];
  for (const o of (m.objetivos || [])){
    if (o.tipo === 's'){ if (!_temDeus(o.alvo)) faltam.push(o.alvo); }
    else if (o.tipo === 'j' || o.tipo === 'c'){ for (const g of o.lista) if (!_temDeus(g)) faltam.push(g); }
    else if (o.tipo === 'v'){ if (!o.lista.some(g => _temDeus(g))) faltam.push(o.lista[0]); }
  }
  return { ok: rankOk && faltam.length === 0, rankOk, faltam: [...new Set(faltam)] };
}
// §314 — ESTADO de uma Provação (espaço de estados §295): conquistada · ativa · pausada · disponivel · travada.
function estadoProv(k){
  if (_temDeus(k)) return 'conquistada';
  const mm = (contaAtual && contaAtual.missoes) || {};
  if (mm.ativa === k) return 'ativa';
  if (mm.progresso && mm.progresso[k]) return 'pausada';
  return provDisponivel(k).ok ? 'disponivel' : 'travada';
}
function _progObj(k){ const mm = (contaAtual && contaAtual.missoes) || {}; return (mm.progresso && mm.progresso[k]) || null; }
function _estadoObj(k, i){ const p = _progObj(k); return (p && p.obj && p.obj[i]) || {}; }

// ============================ §316 — OBJETIVOS: ícone por tipo, texto, widget de progresso ============================
// Ícones (SVG inline, currentColor): s corrente · v espadas cruzadas · j elos ligados · c corrente dupla ·
// p louro+coluna · sp corrente+louro · a emblemas em leque.
function _obIc(t){
  const S = (inner) => `<svg class="obic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  if (t === 's')  return S('<rect x="3" y="8.5" width="10" height="7" rx="3.5"/><rect x="11" y="8.5" width="10" height="7" rx="3.5"/>');
  if (t === 'v')  return S('<path d="M4 4l13 13M6 20l14-14"/><path d="M3 6l3-2M21 6l-3-2"/>');
  if (t === 'j')  return S('<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>');
  if (t === 'c')  return S('<rect x="2" y="9" width="8" height="6" rx="3"/><rect x="8" y="9" width="8" height="6" rx="3"/><rect x="14" y="9" width="8" height="6" rx="3"/>');
  if (t === 'p')  return S('<rect x="10" y="6" width="4" height="13"/><path d="M8 7C4 11 6 16 8 18M16 7c4 4 2 9 0 11"/>');
  if (t === 'sp') return S('<rect x="8" y="9" width="9" height="6" rx="3"/><path d="M6 8C3 11 4 15 6 17"/>');
  if (t === 'a')  return S('<path d="M12 5l2 3-2 3-2-3z" fill="currentColor" stroke="none"/><path d="M6 8l1.6 2.4L6 12.8 4.4 10.4z" fill="currentColor" stroke="none"/><path d="M18 8l1.6 2.4L18 12.8l-1.6-2.4z" fill="currentColor" stroke="none"/>');
  return '';
}
// junta uma lista de nomes com o "ou" só no último ("Zeus, Ogum ou Tyr"; "Zeus ou Brigid"; "Zeus").
function _juntarOu(partes){ if (partes.length <= 1) return partes[0] || ''; if (partes.length === 2) return partes[0] + ' ou ' + partes[1]; return partes.slice(0, -1).join(', ') + ' ou ' + partes[partes.length - 1]; }
// TEXTO do objetivo (nomes em <b>; se `mark`, os nomes NÃO possuídos ficam em cinza+cadeado — só na expansão travada).
function _obTexto(o, mark){
  const nm = (g) => (mark && !_temDeus(g)) ? `<span class="lk">${H(nomeM(g))} 🔒</span>` : `<b>${H(nomeM(g))}</b>`;
  if (o.tipo === 's')  return `${o.k} seguidas com ${nm(o.alvo)}`;
  if (o.tipo === 'sp') return `${o.k} seguidas com qualquer <b>${_adjS(o.panteao)}</b>`;
  if (o.tipo === 'c')  return `${o.k} seguidas com ${nm(o.lista[0])} e com ${nm(o.lista[1])}`;
  if (o.tipo === 'v')  return `${o.n} vitórias com ${_juntarOu(o.lista.map(nm))}`;
  if (o.tipo === 'j')  return `${o.n} vitórias com ${nm(o.lista[0])} e ${nm(o.lista[1])}`;
  if (o.tipo === 'p')  return `${o.n} vitórias com qualquer <b>${_adjS(o.panteao)}</b>`;
  if (o.tipo === 'a')  return `${o.n} panteões diferentes`;
  return '';
}
function _obMeta(o){ return (o.tipo === 's' || o.tipo === 'sp' || o.tipo === 'c') ? o.k : o.n; }
function _obDone(o, e, conq){
  if (conq) return true;
  if (o.tipo === 's' || o.tipo === 'sp') return (e.seq || 0) >= o.k;
  if (o.tipo === 'c') return (e.seqA || 0) >= o.k && (e.seqB || 0) >= o.k;
  if (o.tipo === 'a') return ((e.pant || []).length) >= o.n;
  return (e.vol || 0) >= o.n;
}
// widgets: pontos (s/sp), pontos-duplos (c), barra (v/j/p), emblemas (a).
function _dots(x, y){ let s = ''; for (let i = 0; i < y; i++) s += `<i class="dot${i < x ? ' on' : ''}"></i>`; return `<span class="dots">${s}</span>`; }
function _emblems(x, y){ let s = ''; for (let i = 0; i < y; i++) s += `<i class="emb${i < x ? ' on' : ''}"></i>`; return `<span class="embs">${s}</span>`; }
function _bar(x, y){ const pct = y ? Math.min(100, Math.round(x / y * 100)) : 0; return `<span class="obar"><i style="width:${pct}%"></i></span>`; }
// o widget completo (com o x/y ou o ✓), dado o objetivo e seu estado.
function _obWidget(o, e, conq){
  if (_obDone(o, e, conq)) return `<span class="ob__ok">✓</span>`;
  if (o.tipo === 's' || o.tipo === 'sp'){ const x = Math.min(e.seq || 0, o.k); return `${_dots(x, o.k)}<span class="xy">${x}/${o.k}</span>`; }
  if (o.tipo === 'c'){ const a = Math.min(e.seqA || 0, o.k), b = Math.min(e.seqB || 0, o.k); return `<span class="dupla">${_dots(a, o.k)}${_dots(b, o.k)}</span>`; }
  if (o.tipo === 'a'){ const x = Math.min((e.pant || []).length, o.n); return `${_emblems(x, o.n)}<span class="xy">${x}/${o.n}</span>`; }
  const x = Math.min(e.vol || 0, o.n); return `${_bar(x, o.n)}<span class="xy">${x}/${o.n}</span>`;
}
// uma LINHA de objetivo (painel): ícone · texto · widget. `mini` reduz para a expansão da lista.
function _obLinhaHTML(k, o, i, opts){
  opts = opts || {};
  const conq = !!opts.conq;
  const e = _estadoObj(k, i);
  const dir = opts.meta ? `<span class="ob__meta">${_obMeta(o)}</span>` : `<span class="ob__p">${_obWidget(o, e, conq)}</span>`;
  const done = _obDone(o, e, conq);
  // §349: `check` → marcação (caixa ✓ verde quando cumprido), no lugar do ícone de tipo (painel de Provações).
  const mark = opts.check ? `<span class="ob__ck${done ? ' is-on' : ''}">${done ? '✓' : ''}</span>` : `<span class="ob__ic">${_obIc(o.tipo)}</span>`;
  return `<div class="ob${opts.mini ? ' ob--mini' : ''}${done ? ' ob--done' : ''}">${mark}<span class="ob__t">${_obTexto(o, !!opts.mark)}</span>${dir}</div>`;
}
// progresso MÉDIO de uma pausada (cada objetivo limitado à sua meta) — o "· 55%" da linha.
function _pausadaPct(k){
  const m = MISSOES.missoes[k]; const objs = m.objetivos || []; if (!objs.length) return 0;
  let soma = 0;
  objs.forEach((o, i) => { const e = _estadoObj(k, i); const meta = _obMeta(o);
    let x = (o.tipo === 's' || o.tipo === 'sp') ? (e.seq || 0) : (o.tipo === 'c') ? ((Math.min(e.seqA || 0, o.k) + Math.min(e.seqB || 0, o.k)) / 2) : (o.tipo === 'a') ? ((e.pant || []).length) : (e.vol || 0);
    soma += Math.min(1, meta ? x / meta : 0); });
  return Math.round(soma / objs.length * 100);
}

// ============================ §316 — PAINEL FIXO "PROVAÇÃO ATIVA" (o único com moldura acesa) ============================
function _seloHTML(rar){ return `<span class="selo selo--${rar}">${rar}</span>`; }
// §349 — PAINEL ESQUERDO: PROVAÇÃO ATIVA (padrão) ou PRÉVIA (quando um cartão foi tocado). Mesmo conteúdo;
// muda o rótulo, o rodapé (Trocar+vagas × botão de estado + "‹ Voltar à ativa") e a confirmação de troca inline.
function _paVazioHTML(){
  return `<div class="pa pa--vazio">
    <div class="pa__rot">Provação ativa</div>
    <div class="pa__vazio"><span class="pa__med pa__med--off">${slot('vazio', '◈', '#4a4570', 40)}</span>
    <p class="pa__vaziomsg">Nenhuma Provação ativa — <b>escolha uma na lista</b>.</p></div>
  </div>`;
}
function painelProvHTML(){
  const mm = (contaAtual && contaAtual.missoes) || {};
  const ativa = mm.ativa;
  const previa = (provPrevia && MISSOES.missoes[provPrevia]) ? provPrevia : null;
  const k = previa || ativa;
  if (!k) return _paVazioHTML();
  const ehPrevia = !!previa;
  // §349: o MESMO estado de exibição do cartão (travada só acima do ranque) → o botão do painel bate com o da grade.
  const estado = _dispEstadoProv(k, MISSOES.missoes[k].faixaIndice, faixaAtualIdx());
  const m = MISSOES.missoes[k], g = HRM[k] || { nome: nomeM(k), elem: 'Umbra' }, rar = raridadeDe(k);
  const objs = (m.objetivos || []).map((o, i) => _obLinhaHTML(k, o, i, { check: true, conq: estado === 'conquistada' })).join('');
  let foot;
  if (ehPrevia){
    const temOutra = ativa && ativa !== k, conf = provTrocaConfirm === k;
    let botao = '';
    if (provPendente === k) botao = `<button class="pvb pvb--go" disabled>…</button>`;
    else if (!conf){
      if (estado === 'disponivel') botao = `<button class="pvb pvb--go" data-ativar="${k}" data-troca="${temOutra ? 1 : 0}">ATIVAR</button>`;
      else if (estado === 'pausada') botao = `<button class="pvb pvb--go" data-ativar="${k}" data-troca="${temOutra ? 1 : 0}">RETOMAR</button>`;
    }
    const voltar = ativa ? `<button class="pvb pvb--quiet" data-voltarativa="1">‹ Voltar à ativa</button>` : '';
    const confBox = conf ? `<div class="pa__conf">Trocar? O progresso de <b>${H(nomeM(ativa))}</b> fica pausado.<span class="pa__confb"><button class="pvb pvb--go" data-troca-ok="${k}">SIM</button><button class="pvb pvb--quiet" data-troca-no="1">NÃO</button></span></div>` : '';
    foot = `${confBox}<div class="pa__foot">${voltar}${botao}</div>`;
  } else {
    const n = MISSOES.slotsGratis || 1;
    foot = `<div class="pa__foot"><button class="pvb pvb--quiet" id="btrocar">Trocar Provação</button><span class="pa__footdiv"></span><span class="pa__slot">${n} vaga${n > 1 ? 's' : ''} ativa${n > 1 ? 's' : ''} · mais vagas na Loja</span></div>`;
  }
  return `<div class="pa${ehPrevia ? ' pa--previa' : ''}" data-estado="${estado}" data-deus="${k}">
    <div class="pa__rot">${ehPrevia ? 'Prévia' : 'Provação ativa'}</div>
    <div class="pa__head">
      <span class="pa__med" data-abrir="${k}">${slot('god-' + k, ini(g.nome), COR(g.elem), 46)}</span>
      <div class="pa__id">
        <div class="pa__nome">${H(g.nome)} ${_seloHTML(rar)}</div>
        <div class="pa__sub">${H(m.panteao)} · ranque ${H(m.faixaNome)}</div>
        <div class="pa__div"></div>
        <div class="pa__motivo">${H(m.motivo)}</div>
      </div>
    </div>
    <div class="pa__objsrot">Objetivos</div>
    <div class="pa__objs">${objs}</div>
    ${foot}
  </div>`;
}

// ============================ §316 — BARRA DE RANQUE (topo direito): faixa + barra até a próxima ============================
function ranqueHTML(){
  const faixas = MISSOES.faixas || [];
  const rq = (contaAtual && contaAtual.ranque) || {};
  const pts = typeof rq.pontos === 'number' ? rq.pontos : 0;
  const ch = rq.faixa && rq.faixa.chave; let ci = faixas.findIndex(f => f.chave === ch); if (ci < 0) ci = 0;
  const cur = faixas[ci] || { nome: '—', min: 0 }, prox = faixas[ci + 1];
  const helm = '<svg class="rq__helm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 12a8 8 0 0116 0v3a2 2 0 01-2 2h-2l-1 3H7l-1-3H4z"/><path d="M12 4v8M4 12h16"/></svg>';
  if (!prox) return `<span class="rq">${helm}<span class="rq__id"><span class="rq__f">${H(cur.nome)}</span><span class="rq__max">faixa máxima</span></span></span>`;
  const pct = prox.min ? Math.max(0, Math.min(100, Math.round(pts / prox.min * 100))) : 0;
  return `<span class="rq">${helm}<span class="rq__id"><span class="rq__f">${H(cur.nome)}</span><span class="rq__bar"><i style="width:${pct}%"></i></span><span class="rq__t">${pts}/${prox.min} até ${H(prox.nome)}</span></span></span>`;
}

// ============================ §349 — GRADE (coluna direita, rola): agrupada por faixa, cartões do montador ============================
// o ESTADO de EXIBIÇÃO do cartão: travada só nas faixas ACIMA da atual; o resto conquistada/ativa/pausada/disponível.
function _dispEstadoProv(k, fi, cur){
  const mm = (contaAtual && contaAtual.missoes) || {};
  if (_temDeus(k)) return 'conquistada';
  if (mm.ativa === k) return 'ativa';
  if (mm.progresso && mm.progresso[k]) return 'pausada';
  return fi > cur ? 'travada' : 'disponivel';
}
function _provNorm(s){ return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
// contagens globais p/ as pílulas (reais, do dado) + conquistados/total.
function _provContagens(){
  const cur = faixaAtualIdx();
  const c = { todas: 0, disponiveis: 0, pausadas: 0, conquistadas: 0, total: 0 };
  for (const k in MISSOES.missoes){ c.total++;
    const e = _dispEstadoProv(k, MISSOES.missoes[k].faixaIndice, cur);
    if (e === 'conquistada') c.conquistadas++;
    else if (e === 'pausada') c.pausadas++;
    else if (e === 'disponivel') c.disponiveis++;
    if (e !== 'travada') c.todas++;   // "Todas" = alcançáveis (as acima do ranque ficam travadas, fora da contagem)
  }
  return c;
}
function _provMatchFiltro(e){
  if (provFiltro === 'todas') return true;
  if (provFiltro === 'disponiveis') return e === 'disponivel';
  if (provFiltro === 'pausadas') return e === 'pausada';
  if (provFiltro === 'conquistadas') return e === 'conquistada';
  return true;
}
// CARTÃO no visual do montador (retrato cheio + degradê + NOME + orbe + selo de raridade), com o estado da Provação.
function provCardHTML(k, estado){
  const g = HRM[k] || { nome: nomeM(k), elem: 'Umbra' }, rar = raridadeDe(k), trav = estado === 'travada';
  const mm = (contaAtual && contaAtual.missoes) || {}, temOutra = mm.ativa && mm.ativa !== k;
  let acao = '';
  if (provPendente === k) acao = `<span class="pvc__btn pvc__btn--wait">…</span>`;
  else if (estado === 'disponivel') acao = `<button class="pvc__btn" data-ativar="${k}" data-troca="${temOutra ? 1 : 0}">ATIVAR</button>`;
  else if (estado === 'pausada') acao = `<button class="pvc__btn pvc__btn--quiet" data-ativar="${k}" data-troca="${temOutra ? 1 : 0}">RETOMAR</button>`;
  else if (estado === 'ativa') acao = `<span class="pvc__flag pvc__flag--ativa">Ativa</span>`;
  else if (estado === 'conquistada') acao = `<span class="pvc__flag pvc__flag--conq">✓ Conquistado</span>`;
  else if (trav) acao = `<span class="pvc__rank">Ranque ${H(MISSOES.missoes[k].faixaNome)}</span>`;
  return `<div class="pvc pvc--${estado}" data-deus="${k}">
    <button class="pvc__tap" data-carta="${k}" aria-label="${H(g.nome)}"></button>
    <span class="pvc__art">${slot('god-' + k, ini(g.nome), trav ? '#6a6390' : COR(g.elem), 40)}</span>
    <span class="pvc__grad"></span>
    <span class="selo pvc__selo selo--${rar}">${rar}</span>
    ${estado === 'pausada' ? `<span class="pvc__pausa">Pausada · ${_pausadaPct(k)}%</span>` : ''}
    ${trav ? `<span class="pvc__lock">🔒</span>` : ''}
    <span class="pvc__foot"><b class="pvc__n">${H(g.nome)}</b><span class="pvc__meta">${orbe(g.elem, 18)}</span><span class="pvc__act">${acao}</span></span>
  </div>`;
}
function gradeProvacoesHTML(){
  const pts = (contaAtual && contaAtual.ranque && typeof contaAtual.ranque.pontos === 'number') ? contaAtual.ranque.pontos : 0;
  const cur = faixaAtualIdx();
  const rarRank = { SS: 2, S: 1, A: 0 };
  const q = _provNorm(provBusca.trim());
  const expandeTudo = provFiltro !== 'todas' || q !== '';   // §349: filtrar/buscar abre todas as faixas (as acima ficam travadas)
  const porFaixa = {};
  for (const k in MISSOES.missoes){ const fi = MISSOES.missoes[k].faixaIndice; (porFaixa[fi] = porFaixa[fi] || []).push(k); }
  let html = '';
  (MISSOES.faixas || []).forEach((f, fi) => {
    const todos = (porFaixa[fi] || []).sort((a, b) => ((rarRank[MISSOES.missoes[b].raridade] || 0) - (rarRank[MISSOES.missoes[a].raridade] || 0)) || nomeM(a).localeCompare(nomeM(b)));
    const vis = todos.filter(k => { const e = _dispEstadoProv(k, fi, cur); return _provMatchFiltro(e) && (!q || _provNorm(nomeM(k)).includes(q)); });
    const grade = ks => `<div class="pv2-cards">${ks.map(k => provCardHTML(k, _dispEstadoProv(k, fi, cur))).join('')}</div>`;
    if (expandeTudo){
      if (!vis.length) return;
      html += `<div class="pv2-fx"><span class="pv2-fx__n">${H(f.nome)}</span><span class="pv2-fx__c">(${vis.length})</span><span class="pv2-fx__ln"></span></div>` + grade(vis);
    } else if (fi <= cur){
      html += `<div class="pv2-fx"><span class="pv2-fx__n">${H(f.nome)}</span><span class="pv2-fx__c">(${todos.length})</span><span class="pv2-fx__ln"></span></div>` + grade(todos);
    } else {
      const aberta = faixasEspiadas.has(fi), faltam = Math.max(0, (f.min || 0) - pts);
      html += `<button class="pv2-fx pv2-fx--fechada${aberta ? ' is-open' : ''}" data-fxespiar="${fi}"><span class="pv2-fx__n">${H(f.nome)}</span><span class="pv2-fx__falta">(faltam ${faltam} pontos)</span><span class="pv2-fx__seta${aberta ? ' is-open' : ''}" aria-hidden="true">⌄</span></button>`;
      if (aberta) html += grade(todos);
    }
  });
  return html || `<p class="pv2-vazio">Nenhuma Provação com esse filtro.</p>`;
}

// SEM SERVIDOR: o progresso vive no servidor (§228). Diz a verdade e deixa LER as histórias + os objetivos.
function provacoesOfflineHTML(){
  const cat = Object.keys(MISSOES.missoes).sort((a,b)=> nomeM(a).localeCompare(nomeM(b))).map(k => {
    const m = MISSOES.missoes[k];
    return `<button class="mcat" data-abrir="${k}" title="${H(nomeM(k))}">
      <span class="mcat__art">${slot('god-' + k, ini(nomeM(k)), '#6a6390', 26)}</span>
      <span class="mcat__b"><span class="mcat__n">${H(nomeM(k))}</span><span class="mcat__f">${(m.objetivos||[]).length} objetivos · ranque ${H(m.faixaNome)}</span><span class="mcat__m">${H(m.motivo)}</span></span>
    </button>`;
  }).join('');
  return `<div class="moff">
    <span class="moff__ic">◈</span>
    <p class="moff__msg">As Provações contam no <b>PvP</b>. <b>Conecte</b> para ativar uma e ver seu progresso — ele vive no servidor.</p>
  </div>
  <div class="msec__cab msec__cab--cat"><h2>As histórias</h2><span class="msec__n">${Object.keys(MISSOES.missoes).length}</span></div>
  <div class="mcatgrid">${cat}</div>`;
}

let provTrocaConfirm = null;   // §314/§316: deus com a troca em confirmação inline (sem modal)
let provPrevia = null;         // §349: deus em PRÉVIA no painel esquerdo (null = mostra a ativa)
let provPendente = null;       // §316: deus com a ativação em voo (botão "…", sem toque duplo)
let provFiltro = 'todas';      // §349: pílula de filtro (todas/disponiveis/pausadas/conquistadas)
let provBusca = '';            // §349: busca por nome (ignora acentos)
const faixasEspiadas = new Set();   // §316: faixas ACIMA da atual abertas para espiar
async function _pedirAtivar(k){
  if (provPendente) return;              // já há uma em voo — sem toque duplo
  provTrocaConfirm = null; provPendente = k; render();   // mostra "…"
  try { if (typeof ativarProvacaoServidor === 'function'){ const r = await ativarProvacaoServidor(k); if (r && r.erro && typeof toast === 'function') toast(r.erro); } }
  finally { provPendente = null; render(); }
}
// §349: as pílulas de filtro (contagem real do dado).
function _provPillsHTML(){
  const c = _provContagens();
  const pill = (f, rot, n) => `<button class="pv2-pill${provFiltro === f ? ' is-on' : ''}" data-filtro="${f}">${rot} <b>${n}</b></button>`;
  return pill('todas', 'Todas', c.todas) + pill('disponiveis', 'Disponíveis', c.disponiveis) + pill('pausadas', 'Pausadas', c.pausadas) + pill('conquistadas', 'Conquistadas', c.conquistadas);
}
function renderMissoes(){
  const online = !!contaAtual;
  const temDados = missoesDisponivel();
  const ranque = online && temDados ? ranqueHTML() : '';
  let corpo;
  if (!temDados){
    corpo = `<div class="pv2-vaziotela"><span class="pv2-vaziotela__ic">◈</span><p>O mapa das Provações chega com os dados.</p></div>`;
  } else if (!online){
    corpo = `<div class="pv2-off">${provacoesOfflineHTML()}</div>`;
  } else {
    const c = _provContagens();
    corpo = `<aside class="pv2-esq">${painelProvHTML()}</aside>
    <section class="pv2-dir">
      <h2 class="pv2-dir__t cin">DEUSES PARA DESBLOQUEAR</h2>
      <div class="pv2-filtros">
        <div class="pv2-pills">${_provPillsHTML()}</div>
        <label class="pv2-busca"><i>⌕</i><input id="provbusca" type="text" placeholder="Buscar deus" value="${H(provBusca)}" autocomplete="off"></label>
        <span class="pv2-conta">${c.conquistadas} de ${c.total} conquistados</span>
      </div>
      <div class="pv2-grade" id="provgrade">${gradeProvacoesHTML()}</div>
    </section>`;
  }
  stage.innerHTML = `<div id="baselayer" class="pv2"><div id="provfix">
    <header class="pv2-cab">
      <button class="pvb pvb--voltar" id="bvoltar">‹ INÍCIO</button>
      <h1 class="pv2-titulo cin">PROVAÇÕES</h1>
      <div class="pv2-rq">${ranque}</div>
    </header>
    ${corpo}
  </div></div>`;
  const q = s => stage.querySelector(s), qq = s => [...stage.querySelectorAll(s)];
  const v = q('#bvoltar'); if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  // ELO com o deus (§220): o retrato do painel e o catálogo offline abrem a ficha.
  qq('[data-abrir]').forEach(b => { b.onclick = (ev) => { ev.stopPropagation(); ir('deus', { key: b.dataset.abrir }); render(); }; });
  // §349: tocar num cartão → PRÉVIA no painel (sem confirmar nada); "‹ Voltar à ativa" volta.
  qq('[data-carta]').forEach(b => { b.onclick = () => { provPrevia = b.dataset.carta; provTrocaConfirm = null; render(); }; });
  const va = q('[data-voltarativa]'); if (va) va.onclick = () => { provPrevia = null; provTrocaConfirm = null; render(); };
  // FAIXA fechada (acima da atual): tocar espia (cartões travados).
  qq('[data-fxespiar]').forEach(b => { b.onclick = () => { const fi = +b.dataset.fxespiar; if (faixasEspiadas.has(fi)) faixasEspiadas.delete(fi); else faixasEspiadas.add(fi); render(); }; });
  // FILTROS + BUSCA.
  qq('[data-filtro]').forEach(b => { b.onclick = () => { provFiltro = b.dataset.filtro; render(); }; });
  const bu = q('#provbusca'); if (bu) bu.oninput = () => { provBusca = bu.value; const g = q('#provgrade'); if (g) g.innerHTML = gradeProvacoesHTML(); _ligarGradeProv(); };
  // TROCAR PROVAÇÃO (painel ativa): leva às disponíveis — mostra a prévia da 1ª disponível/pausada.
  const bt = q('#btrocar'); if (bt) bt.onclick = () => {
    let alvo = null; const cur = faixaAtualIdx();
    for (const k in MISSOES.missoes){ const e = _dispEstadoProv(k, MISSOES.missoes[k].faixaIndice, cur); if (e === 'disponivel'){ alvo = k; break; } }
    if (!alvo) for (const k in MISSOES.missoes){ const e = _dispEstadoProv(k, MISSOES.missoes[k].faixaIndice, cur); if (e === 'pausada'){ alvo = k; break; } }
    if (alvo){ provPrevia = alvo; render(); }
  };
  _ligarGradeProv();
  if (online && typeof refrescarConta === 'function') refrescarConta();
  fit();
}
// liga os botões de ATIVAR/RETOMAR e confirmação (grade + painel) — re-chamado quando só a grade re-renderiza (busca).
function _ligarGradeProv(){
  const qq = s => [...stage.querySelectorAll(s)];
  qq('[data-ativar]').forEach(b => { b.onclick = (ev) => { ev.stopPropagation();
    if (provPendente) return;
    const k = b.dataset.ativar;
    if (b.dataset.troca === '1'){ provPrevia = k; provTrocaConfirm = k; render(); } else { _pedirAtivar(k); }
  }; });
  qq('[data-troca-ok]').forEach(b => { b.onclick = (ev) => { ev.stopPropagation(); _pedirAtivar(b.dataset.trocaOk); }; });
  qq('[data-troca-no]').forEach(b => { b.onclick = (ev) => { ev.stopPropagation(); provTrocaConfirm = null; render(); }; });
}

/* ================= PvP — o LOBBY (F5.3/§236): apelido + time de 3 + entrar na fila ==================
// O PvP precisa do SERVIDOR (a partida é dele, §223). Sem transporte (aberto por file:// ou sem conexão),
// a tela DIZ como chegar ao servidor — abrir pelo endereço da máquina, na mesma rede. Com servidor: o
// jogador põe o apelido (uma vez), monta 3 deuses que POSSUI (o servidor valida a posse), e entra na
// fila (amistoso ou ranqueado). O pareamento chega por PUSH e a batalha começa (view.js/aoPushGlobal). */
let pvpTime = [], pvpEstado = 'idle', pvpMsg = '';   // idle | fila
let pvpRanqueado = false, pvpFilaInicio = 0, _pvpFilaTimer = 0;   // §344: modo escolhido (amistosa/ranqueada) + relógio da fila
let pvpUltimoTime = [];   // §344: último time usado no PvP (persistido localmente)
try { pvpUltimoTime = JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem('pvpUltimo')) || '[]') || []; } catch (e) { pvpUltimoTime = []; }
function pvpReset(){ pvpTime = []; pvpEstado = 'idle'; pvpMsg = ''; if (_pvpFilaTimer) { try { clearInterval(_pvpFilaTimer); } catch (e) {} _pvpFilaTimer = 0; } }
function pvpJogavel(k){ return temDeus(k) && typeof GODS !== 'undefined' && !!GODS[k]; }
function pvpToggle(k){ const i = pvpTime.indexOf(k); if (i >= 0) pvpTime.splice(i, 1); else if (pvpTime.length < 3) pvpTime.push(k); }
function _pvpUltimoOk(){ return pvpUltimoTime.length === 3 && pvpUltimoTime.every(pvpJogavel); }

async function pvpEntrar(ranqueado){
  if (pvpEstado === 'fila') return;
  const temNick = !!(contaAtual && contaAtual.nick);
  const nickEl = stage.querySelector('#pvpnick');
  const nick = temNick ? contaAtual.nick : (nickEl ? nickEl.value.trim() : '');
  if (!temNick && (!nick || nick.length < 3)) { pvpMsg = 'Escolha um apelido (ao menos 3 letras).'; render(); return; }
  if (pvpTime.length !== 3) { pvpMsg = 'Escolha 3 deuses para o seu time.'; render(); return; }
  pvpUltimoTime = pvpTime.slice(); try { if (typeof localStorage !== 'undefined') localStorage.setItem('pvpUltimo', JSON.stringify(pvpUltimoTime)); } catch (e) {}   // §344: guarda o último time
  pvpEstado = 'fila'; pvpMsg = ''; pvpFilaInicio = Date.now(); render();
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

function _pvpFmtFila(){ const s = Math.max(0, Math.round((Date.now() - (pvpFilaInicio || Date.now())) / 1000)); const m = Math.floor(s / 60); return (m ? m + 'min ' : '') + (s % 60) + 's'; }
function _pvpContextoHTML(){
  const temNick = !!(contaAtual && contaAtual.nick);
  const nickBloco = temNick
    ? `<div class="dm-pvp__nick">Apelido <b>${H(contaAtual.nick)}</b></div>`
    : `<div class="dm-pvp__nick"><span class="dm-pvp__nicklab">Seu apelido</span><input id="pvpnick" class="dm-pvp__nickin" maxlength="16" placeholder="3 a 16 letras" autocomplete="off"></div>`;
  const seg = `<div class="dm-seg">
    <button class="dm-seg__b${!pvpRanqueado ? ' is-on' : ''}" data-pvpmodo="0">AMISTOSA</button>
    <button class="dm-seg__b${pvpRanqueado ? ' is-on' : ''}" data-pvpmodo="1">RANQUEADA</button></div>
    <p class="dm-pvp__modolinha">${pvpRanqueado ? 'Vale pontos de ranque.' : 'Treino: não mexe no ranque.'}</p>`;
  const rq = contaAtual && contaAtual.ranque;
  const ranqueHTML = (rq && typeof rq.pontos === 'number') ? `<div class="dm-pvp__ranque">Ranque <b>${rq.pontos}</b> pts</div>` : '';
  // §359: sem o título (já está na sublinha do cabeçalho), reveal em 1 linha, e o "Usar último time" entra aqui
  // (o bloco SEU TIME fica só com as 3 vagas, p/ tudo caber nos 360 do canvas).
  return `${nickBloco}${seg}${ranqueHTML}
    ${pvpMsg ? `<p class="dm-erro">⊘ ${H(pvpMsg)}</p>` : ''}
    <button class="dm-usarultimo" id="pvpultimo" ${_pvpUltimoOk() ? '' : 'disabled'}>↺ Usar último time</button>`;
}
function renderPvP(){
  const online = !!(typeof contaTransporte !== 'undefined' && contaTransporte);
  if (!online || !contaAtual){   // SEM SERVIDOR / SEM CONTA → tela mínima
    const msg = !online
      ? `<b>O PvP precisa do servidor.</b> Abra o jogo pelo endereço da máquina que roda o servidor (ex.: http://192.168.x.x:8788), na mesma rede Wi-Fi. Quem roda o servidor vê o endereço ao ligá-lo.`
      : `Conta ainda não criada — reabra o aplicativo.`;
    stage.innerHTML = `<div id="baselayer" class="dm2"><div id="dommontar">
      <button class="dmb dmb--voltar" id="bvoltar" data-voltar="1">‹ VOLTAR</button>
      <div class="dm-cabid"><h1 class="dm-titulo cin">PVP</h1><span class="dm-sub">PVP ONLINE</span></div>
      <div class="dm-aviso"><span class="dm-aviso__ic">◈</span><p>${msg}</p></div>
    </div></div>`;
    const v = stage.querySelector('#bvoltar'); if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
    fit(); return;
  }
  const naFila = pvpEstado === 'fila';
  const cfg = {
    id: 'pvp', pick: pvpTime, klass: 'dm--pvp',
    titulo: 'MONTE SEU TIME',
    sublinha: 'PVP ONLINE',
    contextoHTML: _pvpContextoHTML(),
    vagas: [{ tipo: 'livre' }, { tipo: 'livre' }, { tipo: 'livre' }],
    validar: (t) => { const n = t.filter(Boolean).length; return { ok: n === 3, motivo: n === 3 ? '' : `Escolha mais ${3 - n} deus${3 - n > 1 ? 'es' : ''}.` }; },
    textoBotao: 'ENTRAR NA FILA',
    aoComecar: () => pvpEntrar(pvpRanqueado),
    aoVoltar: () => { montKitAberto = null; if (!voltar()) ir('home', {}, { substituir: true }); render(); },
    gradeTravada: naFila, semRodape: naFila,
    overlayHTML: naFila ? `<div class="dm-fila" id="dmfila"><div class="dm-fila__card">
        <span class="dm-fila__ic">◈</span>
        <h2 class="dm-fila__t">PROCURANDO OPONENTE…</h2>
        <p class="dm-fila__modo">${pvpRanqueado ? 'Ranqueada' : 'Amistosa'} · <span id="pvpfilatempo">${_pvpFmtFila()}</span></p>
        <button class="dmb dmb--quietbig" id="pvpsair">SAIR DA FILA</button>
      </div></div>` : '',
    aoLigar: ({ q, qq }) => {
      qq('[data-pvpmodo]').forEach(b => b.onclick = () => { pvpRanqueado = b.dataset.pvpmodo === '1'; render(); });
      const ul = q('#pvpultimo'); if (ul && _pvpUltimoOk()) ul.onclick = () => { pvpTime.length = 0; pvpUltimoTime.forEach(k => pvpTime.push(k)); pvpMsg = ''; render(); };
      const sr = q('#pvpsair'); if (sr) sr.onclick = () => { pvpReset(); ir('home', {}, { substituir: true }); render(); };
      if (naFila) { if (_pvpFilaTimer) { try { clearInterval(_pvpFilaTimer); } catch (e) {} }
        _pvpFilaTimer = setInterval(() => { const el = document.getElementById('pvpfilatempo'); if (el) el.textContent = _pvpFmtFila(); else { try { clearInterval(_pvpFilaTimer); } catch (e) {} _pvpFilaTimer = 0; } }, 1000); }
      else if (_pvpFilaTimer) { try { clearInterval(_pvpFilaTimer); } catch (e) {} _pvpFilaTimer = 0; }
    },
  };
  stage.innerHTML = montadorTimeHTML(cfg);
  ligarMontadorTime(cfg);
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

// ===================================================================
// §339 — TELA DESAFIOS no modelo do dono: TELA FIXA de 1846×852 escalada (fit() §335), só a grade de deuses rola.
// Todo o comportamento de hoje se mantém (os handlers de compra/jogar/desistir/semanal/composição não mudam).
// ===================================================================
let desafioDesistindo = null;   // deus com a desistência em confirmação (inline, sem modal)
let desafioFiltro = 'todos';    // filtro lembrado enquanto o app está aberto (§339-5)
let desafioOrdem = 'padrao';    // 'padrao' | 'nome' | 'maestria'
let desafioAjuda = false;       // painel "?" aberto
let _dfRecargaTimer = null;     // re-render periódico p/ o contador de recarga andar sem sair da tela

// §339: tempo até a VIRADA DA SEMANA. A semana ISO vira na SEGUNDA 00:00 UTC (provaSemanalAtual usa getUTC*/Date.UTC).
function _msAteViradaSemana(){
  const agora = new Date();
  const dia = agora.getUTCDay() || 7;                         // segunda=1 … domingo=7
  const prox = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate() + (8 - dia), 0, 0, 0, 0));
  return Math.max(0, prox.getTime() - agora.getTime());
}
function fmtPrazoSemana(ms){
  const h = Math.floor(ms / 3600000), d = Math.floor(h / 24);
  if (d >= 1) return d + 'd ' + (h - d * 24) + 'h';
  if (h >= 1) return h + 'h ' + Math.floor((ms % 3600000) / 60000) + 'm';
  return Math.max(1, Math.floor(ms / 60000)) + 'm';
}
// §339-7: AVISO (toast) no visual do modelo — fundo escuro, linha/ícone vermelho, X p/ fechar; some sozinho.
function toast(msg){
  try{
    const host = document.getElementById('desafios') || stage; if (!host) return;
    const t = document.createElement('div'); t.className = 'df-toast';
    t.innerHTML = `<span class="df-toast__ic">!</span><span class="df-toast__msg"></span><button class="df-toast__x" aria-label="fechar">✕</button>`;
    t.querySelector('.df-toast__msg').textContent = String(msg || '');
    const fechar = () => { try{ t.remove(); }catch(e){} };
    t.querySelector('.df-toast__x').onclick = fechar;
    host.appendChild(t); setTimeout(fechar, 4000);
  }catch(e){}
}

// categoria do deus p/ filtro/ordem: mestre | ativo | recarga | disponivel
function _dfCat(k){ if (nivelMaestria(k) === 4) return 'mestre'; const e = desafioEstado(k); return e.estado === 'ativo' ? 'ativo' : e.estado === 'recarga' ? 'recarga' : 'disponivel'; }
function _dfContagens(meus){
  const c = { todos: meus.length, disp: 0, andamento: 0, recarga: 0, mestres: 0 };
  for (const k of meus){ const cat = _dfCat(k); if (cat === 'disponivel') c.disp++; else if (cat === 'ativo') c.andamento++; else if (cat === 'recarga') c.recarga++; else c.mestres++; }
  return c;
}
function _dfOrdenar(meus){
  const nome = k => (HRM[k] && HRM[k].nome) || k;
  if (desafioOrdem === 'nome') return meus.slice().sort((a, b) => nome(a).localeCompare(nome(b), 'pt'));
  if (desafioOrdem === 'maestria') return meus.slice().sort((a, b) => nivelMaestria(b) - nivelMaestria(a) || (maestriaDe(b).vitorias || 0) - (maestriaDe(a).vitorias || 0) || nome(a).localeCompare(nome(b), 'pt'));
  // padrão: em andamento → recarga → disponíveis (mais perto do Mestre à frente) → Mestres
  const rank = k => { const cat = _dfCat(k); return cat === 'ativo' ? 0 : cat === 'recarga' ? 1 : cat === 'disponivel' ? 2 : 4; };
  return meus.slice().sort((a, b) => rank(a) - rank(b) || (maestriaDe(b).vitorias || 0) - (maestriaDe(a).vitorias || 0) || nome(a).localeCompare(nome(b), 'pt'));
}
const _ORDEM_ROT = { padrao: 'Padrão', nome: 'Nome', maestria: 'Maestria' };

// §339-6: um CARTÃO horizontal por deus, com a ação conforme o estado (a–g).
function _dfCardHTML(k){
  const g = HRM[k] || { nome: k, elem: 'Umbra' };
  const nv = nivelMaestria(k), v = maestriaDe(k).vitorias || 0, alvo = MAESTRIA_LIMIAR.mestre, cfg = DESAFIO_CFG();
  const e = desafioEstado(k);
  const frac = Math.max(0, Math.min(1, Math.min(v, alvo) / alvo));
  const mestre = nv === 4;
  const retr = `<span class="df-card__p${mestre ? ' df-card__p--mestre' : ''}">${slot('god-' + k, ini(g.nome), COR(g.elem), 40)}</span>`;
  const marcas = [5, 15, 30].map(m => `<span class="df-bar__mk" style="left:${(m / alvo) * 100}%"></span>`).join('');
  const rotulos = [5, 15, 30].map(m => `<span style="position:absolute;left:${(m / alvo) * 100}%;transform:translateX(-50%)">${m}</span>`).join('');
  const barra = `<span class="df-bar"><span class="df-bar__fill" style="width:${frac * 100}%"></span>${marcas}</span><span class="df-bar__lab">${rotulos}</span>`;
  let acao;
  if (mestre) acao = `<span class="df-card__mestre">★ Mestre<small>Moldura conquistada</small></span>`;
  else if (desafioComprando === k) acao = `<span class="df-card__comprando"><i class="df-spin"></i>Comprando…</span>`;
  else if (desafioDesistindo === k) acao = `<span class="df-card__conf"><span class="df-card__conftxt">Desistir? A Essência não volta.</span><span class="df-card__confbs"><button class="dfb dfb--danger" data-desiste-ok="${k}">SIM</button><button class="dfb dfb--quiet" data-desiste-no="1">NÃO</button></span></span>`;
  else if (e.estado === 'ativo') acao = `<span class="df-card__acts"><button class="dfb dfb--primary" data-jogar="${k}">JOGAR</button><button class="dfb dfb--quiet" data-desistir="${k}">Desistir</button></span>`;
  else if (e.estado === 'recarga') acao = `<span class="df-card__recarga">⟳ Em recarga<small data-recarga="${k}">${fmtRecarga(e.restaMs)}</small></span>`;
  else { const pc = podeComprarDesafio(k);
    acao = pc.ok ? `<button class="dfb dfb--buy" data-comprar="${k}">COMPRAR ${cfg.custoEssencia} ✦</button>`
      : `<span class="df-card__trava"><span class="df-card__motivo">${H(pc.motivo)}</span><button class="dfb dfb--ghost" data-ondeganhar="1">⌂ Onde ganhar Essência?</button></span>`; }
  return `<div class="df-card df-card--m${nv}" data-godcard="${k}">
    ${retr}
    <span class="df-card__id">
      <span class="df-card__top"><b class="df-card__n">${H(g.nome)}</b>${orbe(g.elem, 22)}</span>
      <span class="df-card__maes">${MAESTRIA_NOME[nv]} <span class="df-card__dot">◆</span> ${Math.min(v, alvo)}/${alvo}</span>
      ${barra}
    </span>
    <span class="df-card__pe">${acao}</span>
  </div>`;
}

function renderProvacoes(){
  const meus = (perfil && perfil.deuses) ? Object.keys(perfil.deuses) : [];
  const cfg = DESAFIO_CFG();
  const mestres = meus.filter(k => nivelMaestria(k) === 4).length;
  const _mo = moedaServidor();
  const essTxt = fmtMoeda(_mo.online, _mo.essencia);
  const cont = _dfContagens(meus);
  // filtro → ordem
  const porFiltro = { todos: () => true, disp: k => _dfCat(k) === 'disponivel', andamento: k => _dfCat(k) === 'ativo', recarga: k => _dfCat(k) === 'recarga', mestres: k => _dfCat(k) === 'mestre' };
  const lista = _dfOrdenar(meus.filter(porFiltro[desafioFiltro] || porFiltro.todos));

  // --- DESAFIO DA SEMANA (dados do jogo; visual do modelo) ---
  const ps = provaSemanalAtual();
  let bannerHTML = '';
  if (ps){
    const gs = HRM[ps.key] || { nome: ps.key, elem: 'Umbra' };
    const feito = !!(perfil && perfil.provacoes && perfil.provacoes[ps.scoreKey]);
    const gema = ((typeof ECONOMIA !== 'undefined' && ECONOMIA.semanal && ECONOMIA.semanal.recompensa && ECONOMIA.semanal.recompensa.gema)) || 0;
    const minis = (ps.inimigos || []).slice(0, 3).map(ik => { const ig = HRM[ik] || { nome: ik, elem: 'Umbra' };
      return `<span class="df-sem__foe"><span class="df-sem__foep">${slot('god-' + ik, ini(ig.nome), COR(ig.elem), 18)}</span><span class="df-sem__foen">${H(ig.nome)}</span></span>`; }).join('');
    bannerHTML = `<section class="df-sem psem" data-semanal="1">
      <span class="df-sem__art">${slot('god-' + ps.key, ini(gs.nome), COR(gs.elem), 48)}</span>
      <span class="df-sem__id">
        <span class="df-sem__rot">DESAFIO DA SEMANA <b>#${ps.semanaISO}</b></span>
        <span class="df-sem__tit cin">DESAFIO DE ${H((gs.nome || '').toUpperCase())}</span>
        <span class="df-sem__obj">Mantenha ${H(gs.nome)} de pé em ${ps.deadline} turnos.</span>
      </span>
      <span class="df-sem__foes"><span class="df-sem__contra">Contra:</span>${minis}</span>
      <span class="df-sem__rec">
        <span class="df-sem__reclab">RECOMPENSA</span>
        <span class="df-sem__recval">${feito ? '✓ Gema recebida' : (gema ? `<span class="df-gem">◈</span> ${gema} de Gema` : 'grátis')}</span>
        <span class="df-sem__prazo">⌛ Termina em <b>${fmtPrazoSemana(_msAteViradaSemana())}</b></span>
      </span>
      <button class="dfb dfb--jogar" data-semanal-jogar="1">JOGAR</button>
    </section>`;
  }

  // --- barra de regras: §360 — ÍCONES CURTOS (valores de DESAFIO_CFG) + "?" p/ o texto completo (cabe numa linha no 780) ---
  const regras = `<div class="df-regras">
    <span title="Custa ${cfg.custoEssencia} ✦ de Essência"><span class="df-gem">◈</span> ${cfg.custoEssencia}✦</span>
    <span title="+${cfg.maestriaPorVitoria} de maestria por vitória (Mestre aos ${MAESTRIA_LIMIAR.mestre})">⟲ +${cfg.maestriaPorVitoria}</span>
    <span title="Recarga de ${cfg.recargaHoras} h após comprar">↻ ${cfg.recargaHoras}h</span>
    <span title="Perdeu? Repete de graça">∞ grátis</span>
    <span title="Um desafio por deus de cada vez">⧉ 1/deus</span>
    <button class="df-regras__q" data-ajuda="1" aria-label="ajuda">?</button>
  </div>`;

  // --- filtros + ordenar ---
  const chip = (id, rot, n) => `<button class="df-chip${desafioFiltro === id ? ' is-on' : ''}" data-filtro="${id}">${rot} <b>(${n})</b></button>`;
  const filtros = `<div class="df-filtros">
    <span class="df-chips">${chip('todos', 'Todos', cont.todos)}${chip('disp', 'Disponíveis', cont.disp)}${chip('andamento', 'Em andamento', cont.andamento)}${chip('recarga', 'Recarga', cont.recarga)}${chip('mestres', 'Mestres', cont.mestres)}</span>
    <button class="df-ordenar" data-ordenar="1">Ordenar: <b>${_ORDEM_ROT[desafioOrdem]}</b> ▾</button>
  </div>`;

  // --- composição ---
  const ds = (typeof desafios === 'function') ? desafios() : [];
  const feitos = ds.filter(d => desafioFeito(d.id)).length;
  const compFrac = ds.length ? feitos / ds.length : 0;
  const compos = `<button class="df-compos" data-compos="1">
    <span class="df-compos__ic">⚔</span>
    <span class="df-compos__id"><b>DESAFIOS DE COMPOSIÇÃO</b><small>Complete formações específicas e ganhe recompensas extras.</small></span>
    <span class="df-compos__prog"><span class="df-compos__n">${feitos} de ${ds.length} cumpridos</span><span class="df-compos__bar"><span style="width:${compFrac * 100}%"></span></span></span>
    <span class="df-compos__go">›</span>
  </button>`;

  const essCard = _mo.online
    ? `<span class="df-ess"><span class="df-ess__lab"><span class="df-gem">◈</span> Essência ✦</span><b class="df-ess__v" data-ess>${essTxt}</b></span>`
    : `<span class="df-ess df-ess--off"><span class="df-ess__lab">Essência ✦</span><b class="df-ess__v" data-ess>—</b><span class="df-ess__sem">⊘ Sem conexão</span></span>`;

  stage.innerHTML = `<div id="baselayer" class="df2"><div id="desafios">
    <header class="df-cab">
      <button class="dfb dfb--voltar" id="bvoltar" data-voltar="1">‹ INÍCIO</button>
      <h1 class="df-titulo cin">DESAFIOS</h1>
      <span class="df-cab__cards">${essCard}<span class="df-mestres"><span class="df-mestres__lab">★ Mestres</span><b data-mestres>${mestres}/${meus.length}</b></span></span>
    </header>
    ${bannerHTML}
    ${compos}
    ${regras}
    ${filtros}
    <div class="df-grade" id="dfgrade">${lista.length ? lista.map(_dfCardHTML).join('') : '<p class="df-vazio">Nenhum deus neste filtro.</p>'}</div>
    ${desafioAjuda ? _dfAjudaHTML(cfg) : ''}
  </div></div>`;

  // --- wiring (todos os handlers de hoje) ---
  const q = s => stage.querySelector(s), qq = s => [...stage.querySelectorAll(s)];
  const bv = q('[data-voltar]'); if (bv) bv.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  const bsem = q('[data-semanal-jogar]'); if (bsem) bsem.onclick = () => iniciarSemanal();
  const bc = q('[data-compos]'); if (bc) bc.onclick = () => { ir('composicao'); render(); };
  qq('[data-filtro]').forEach(b => b.onclick = () => { desafioFiltro = b.dataset.filtro; desafioDesistindo = null; render(); });
  const bo = q('[data-ordenar]'); if (bo) bo.onclick = () => { const seq = ['padrao', 'nome', 'maestria']; desafioOrdem = seq[(seq.indexOf(desafioOrdem) + 1) % seq.length]; render(); };
  qq('[data-comprar]').forEach(b => b.onclick = () => comprarDesafioEIniciar(b.dataset.comprar));
  qq('[data-jogar]').forEach(b => b.onclick = () => iniciarDesafioDeus(b.dataset.jogar));
  qq('[data-desistir]').forEach(b => b.onclick = () => { desafioDesistindo = b.dataset.desistir; render(); });
  qq('[data-desiste-ok]').forEach(b => b.onclick = () => { desistirDesafio(b.dataset.desisteOk); desafioDesistindo = null; render(); });
  qq('[data-desiste-no]').forEach(b => b.onclick = () => { desafioDesistindo = null; render(); });
  qq('[data-ondeganhar]').forEach(b => b.onclick = () => { ir('dominios'); render(); });
  const bq = q('[data-ajuda]'); if (bq) bq.onclick = () => { desafioAjuda = true; render(); };
  const bqf = q('[data-ajuda-fechar]'); if (bqf) bqf.onclick = () => { desafioAjuda = false; render(); };
  const ov = q('#df-ajuda'); if (ov) ov.onclick = (ev) => { if (ev.target === ov) { desafioAjuda = false; render(); } };

  // contador de recarga anda sem sair da tela
  if (_dfRecargaTimer) { clearTimeout(_dfRecargaTimer); _dfRecargaTimer = null; }
  if (meus.some(k => _dfCat(k) === 'recarga')) _dfRecargaTimer = setTimeout(() => { if (typeof rotaAtual === 'function' && rotaAtual() === 'desafios') render(); }, 30000);
  fit();
}
// §339-4: o painel "?" — a explicação completa (o texto de hoje + as duas notas). Fecha com X, toque fora, voltar Android.
function _dfAjudaHTML(cfg){
  return `<div class="df-ajuda" id="df-ajuda"><div class="df-ajuda__card">
    <div class="df-ajuda__cab"><h2 class="cin">Como funcionam os Desafios</h2><button class="df-ajuda__x" data-ajuda-fechar="1" aria-label="fechar">✕</button></div>
    <p>Escolha um deus que você tem, compre com Essência e pilote-o até vencer: cada desafio dá <b>${cfg.maestriaPorVitoria}</b> de maestria (a <b>moldura</b> sai no Mestre). Um por deus por vez; quantos deuses quiser ao mesmo tempo. Perdeu? Repete de graça. Recarga de ${cfg.recargaHoras}h ao cumprir ou desistir.</p>
    <p>Desistir <b>não devolve a Essência</b>.</p>
    <p>Você pode ter <b>vários deuses em desafio ao mesmo tempo</b>.</p>
  </div></div>`;
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
  else { if (typeof REPLAY !== 'undefined') REPLAY.descartar();   // §318 F2 E2: derrota/condição quebrada → não envia replay
    if (!st.fim) st.fim = { tipo: 'fim', resultado: 'vitoria', lado: 1 }; }   // congela o motor quando a condição quebrou com a luta ainda em curso
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
    // §318 F2 E2 — a economia é do SERVIDOR: NÃO credita Essência local. Marca o feito (UI) e ENVIA o replay;
    // o servidor credita a 1ª vitória (20) e as repetidas (8, tetadas). O saldo volta do servidor.
    const jaFeito = !!perfil.provacoes[p.scoreKey];
    perfil.provacoes[p.scoreKey] = { feito: true, em: Date.now() };
    provaFim.jaFeito = jaFeito;
    provaFim.recompensaEss = jaFeito ? 0 : (p.recompensaEss || 0);   // exibição do valor da 1ª vez
    const rd = salvar(perfil);
    if (rd && !rd.ok && st) st.log.push({ turno: st.turno, msg: '⚠ vitória, mas a gravação local falhou: ' + rd.erro });
    if (typeof REPLAY !== 'undefined') REPLAY.concluir();
    return;
  }
  if (p.semanal) {
    // §245 — DESAFIO DA SEMANA: dá GEMA (recurso de invocação; ajuda a colecionar) na 1ª vitória da semana,
    // + maestria (acima) + placar. Grátis, expira por semana (o scoreKey traz ano+semana).
    // §318 F2 E2 — a economia é do SERVIDOR: NÃO credita Gema local. Marca o recorde/feito (UI) e ENVIA o
    // replay; o servidor credita 150 na 1ª vitória da SUA semana (relógio dele). O saldo volta do servidor.
    const jaFeito = !!perfil.provacoes[p.scoreKey];
    const gema = ((typeof ECONOMIA !== 'undefined' && ECONOMIA.semanal && ECONOMIA.semanal.recompensa && ECONOMIA.semanal.recompensa.gema)) || 0;
    provaFim.recompensaGema = jaFeito ? 0 : gema;   // exibição do valor da 1ª vez da semana
    const antesS = perfil.provacoes[p.scoreKey];
    const recorde = !antesS || antesS.lances == null || provaLances < antesS.lances;
    if (recorde) perfil.provacoes[p.scoreKey] = { lances: provaLances, minimo: p.minimo, em: Date.now(), feito: true };
    provaFim.recorde = recorde;
    const rs = salvar(perfil);
    if (rs && !rs.ok && st) st.log.push({ turno: st.turno, msg: '⚠ vitória, mas a gravação local falhou: ' + rs.erro });
    if (typeof REPLAY !== 'undefined') REPLAY.concluir();
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
  return 'A condição do Rito não foi cumprida.';
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
    titulo = 'RITO VENCIDO'; cls = 'venceu';
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
  const selo = ehPago ? `Desafio · ${H(nome)}` : ehDesafio ? 'Desafio de composição' : prova.semanal ? 'Desafio da Semana' : `Rito · ${H(prova.faixa || prova.nivel)}`;
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
  st = montarPvEComNiveis(p, p.aliados);   // §323 P2: níveis do jogador no PvE
  vsCPU = true;   // os inimigos da Provação são a CPU (o jogador controla o lado 0)
  if (typeof definirIaVersao === 'function') definirIaVersao(iaVersaoDeModo('rito'));   // §322 P3: Rito usa a versão do modo
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
// §318b-3 — o estado do desafio (ativo + recarga) é do SERVIDOR (conta.perfil.desafios): o cliente LÊ, não grava.
// A compra debita Essência e fixa a recarga no servidor (comprarPergaminho); fechar zera o `ativo` (fecharDesafio).
function _desafios(){ return (typeof contaAtual !== 'undefined' && contaAtual && contaAtual.perfil && contaAtual.perfil.desafios) || {}; }
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
  // §318b-3 — a Essência é do SERVIDOR (moedaServidor): desconectado não dá para comprar; saldo insuficiente idem.
  const mo = (typeof moedaServidor === 'function') ? moedaServidor() : { online: false, essencia: 0 };
  if (!mo.online) return { ok: false, motivo: 'sem conexão com o servidor' };
  if (mo.essencia < custo) return { ok: false, motivo: 'Essência insuficiente' };
  return { ok: true, custo };
}
// §318b-3 — COMPRAR é do SERVIDOR: débito de Essência + recarga de 8h autoritativos (não há mais gasto local).
// Sem toque em silêncio: trava o botão, pede, e ao voltar inicia a batalha (ok) ou mostra a recusa curta.
let desafioComprando = null;   // deus com a compra em voo (evita toque duplo)
async function comprarDesafioEIniciar(k){
  if (desafioComprando) return;
  const p = podeComprarDesafio(k); if (!p.ok) { if (typeof toast === 'function') toast(p.motivo); return; }
  desafioComprando = k; render();
  let r = null;
  try { if (typeof comprarPergaminhoServidor === 'function') r = await comprarPergaminhoServidor(k); else r = { codigo: 'sem_conexao' }; }
  catch (e) { r = { codigo: 'sem_conexao' }; }
  desafioComprando = null;
  if (r && r.ok) { iniciarDesafioDeus(k); return; }
  const cod = r && r.codigo;
  if (typeof toast === 'function') toast(
    cod === 'essencia_insuficiente' ? 'Essência insuficiente.'
    : cod === 'desafio_recarga' ? 'Em recarga — tente mais tarde.'
    : cod === 'desafio_ativo' ? 'Desafio já em andamento.'
    : cod === 'sem_conexao' ? 'Sem conexão com o servidor. Tente de novo.'
    : 'Não foi possível comprar o desafio.');
  render();
}
// §318b-3 — desistir: sem reembolso; a recarga já corre desde a COMPRA (servidor). Só zeramos o `ativo` no
// servidor (fecharDesafio). Tolerante a offline: o `ativo` fica e o jogador reencerra ao voltar.
function desistirDesafio(k){
  const d = _desafios()[k]; if (!d || !d.ativo) return;
  if (typeof fecharDesafioServidor === 'function') { try { Promise.resolve(fecharDesafioServidor(k, false)).then(() => { if (typeof render === 'function') render(); }).catch(() => {}); } catch (e) {} }
}
// vitória num desafio por deus: +maestria ao DEUS-TÍTULO (local/cosmética, §215). O ESTADO (ativo→false; a
// recarga foi fixada na compra, §318b-3) é do SERVIDOR — fecharDesafio(cumpriu). Sem moeda (já pagou na compra).
function cumprirDesafioDeus(k){
  if (!perfil.maestria) perfil.maestria = {};
  const m = perfil.maestria[k] || (perfil.maestria[k] = { vitorias: 0, milagre: false });
  m.vitorias = (m.vitorias || 0) + DESAFIO_CFG().maestriaPorVitoria;   // +3 (10 desafios → 30 = Mestre)
  m.milagre = true;   // o desafio desenhado (pilotar o deus até vencer) É a prova de kit do Mestre
  salvar(perfil);
  if (typeof fecharDesafioServidor === 'function') { try { Promise.resolve(fecharDesafioServidor(k, true)).then(() => { if (typeof render === 'function') render(); }).catch(() => {}); } catch (e) {} }
}
// inicia a batalha do desafio por deus (o pergaminho do deus), marcada como paga (§245).
function iniciarDesafioDeus(k){
  const p = provacaoDe(k); if (!p) return;
  campanha = null; campanhaFim = null;
  prova = Object.assign({}, p, { desafioDeus: k });   // flag: desafio POR DEUS pago (dá maestria, não avança nada)
  provaFim = null; provaLances = 0;
  st = montarPvEComNiveis(prova, prova.aliados);   // §323 P2
  if (typeof REPLAY !== 'undefined') REPLAY.descartar();   // §318 F2 E2: desafio POR DEUS não é fonte de moeda (é maestria) — não grava replay
  vsCPU = true;
  if (typeof definirIaVersao === 'function') definirIaVersao(iaVersaoDeModo('desafioDeus'));   // §322 P3
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
// §285: o CKIT foi APAGADO. Ele era o híbrido kits.json+data/deuses que alimentava o TEXTO das telas de kit; o
// §284-ajuste2 fez as três telas (sobreposição/rota/campanha) lerem data/deuses direto (via GODS), e o CKIT
// ficou produtor sem consumidor (§95 ao contrário). A ESTRUTURA (nome/custo/recarga) segue guardada pela CADEIA
// direto no kits.json↔data/deuses (checar_cadeia); nada aqui precisava intermediar.
const RAR_ROT = { SS: 'SS', S: 'S', A: 'A' };
function raridadeDe(k){ return (typeof RARIDADE !== 'undefined' && RARIDADE[k]) || 'A'; }
function temKitHome(k){ return typeof GODS !== 'undefined' && !!GODS[k]; }
function provDe(k){ return (typeof PROVACOES !== 'undefined') ? PROVACOES.find(p => p.key === k) : null; }

// ===================================================================
// §282 — COLEÇÃO refeita (mockup do dono): PAINEL-LEITOR-DE-KIT à esquerda + GRADE filtrável à direita.
// Lê IDENTIDADE e KIT de data/deuses (via GODS, a fonte do motor — §280), nunca de kits.json. O painel
// substitui o "Nv/atributos" do mockup (proibidos pelo invariante #3) pelo que a Coleção existe para
// ensinar: o kit COMPLETO (básico/habilidade/milagre/passiva, cada um com nome/custo/recarga/efeito).
// ===================================================================
const COL_CLASSES = ['Mágico', 'Físico', 'Híbrido'];                                    // campo `classe` (3)
const COL_FUNCOES = ['Atacante', 'Suporte', 'Controlador', 'Guardião', 'Manipulador']; // campo `funcao` (5)
// dois eixos que o mockup colapsou em "Classe": CLASSE (tipo de combate) e FUNÇÃO (papel). Apresentados
// como DOIS seletores distintos e rotulados — não poluem porque cada um é curto e diz o que filtra.
let colSel = null;   // deus selecionado no painel (null = repouso; §284: começa nulo, o jogador não escolheu)
let colVer = null;   // §358: a sobreposição da Coleção SAIU (view.js ainda lê colVer no voltar do Android; fica sempre null)
let fichaLista = null;   // §358: a lista por onde as setas ‹ › da FICHA navegam (a grade filtrada de onde se veio; null = lista da Coleção sem filtro)
let fichaAba = 'habilidades';   // §358: aba da ficha — 'habilidades' | 'sinergia'
let colF = { busca: '', cultura: '', classe: '', funcao: '', elem: '', status: '', raridade: '', ordem: 'recentes' };   // §346: + filtro de ELEMENTO (grade do montador)
let colMaisAberto = false;   // §346b: painel "MAIS FILTROS" (cultura + classe), fora da tela principal
function colExtrasAtivos(){ return (colF.cultura ? 1 : 0) + (colF.classe ? 1 : 0); }   // §346b: filtros no "MAIS FILTROS"
// §346b: o painel "MAIS FILTROS" — CULTURA + CLASSE em chips com contagem (modelo do §345). Único por eixo (toggle).
function colMaisFiltrosHTML(){
  if (!colMaisAberto) return '';
  const n = colecaoFiltrada().length;
  const chip = (campo, val, rot) => { const c = ROSTER.filter(e => (colG(e.key)[campo === 'cultura' ? 'faccao' : 'classe']) === val).length;
    return `<button class="chip2 ${colF[campo] === val ? 'on' : ''}" data-colmf="${campo}|${H(val)}">${H(rot)}<span class="chip2__n">${c}</span></button>`; };
  const grupo = (rot, chips) => `<div class="fgrp"><span class="fgrp__l">${rot}</span><div class="fgrp__c">${chips}</div></div>`;
  return `<div class="col2mf" id="col2mf"><div class="fbox col2mf__box">
    <div class="fbox__h"><h2>MAIS FILTROS</h2><span class="fbox__n"><b>${n}</b> de ${ROSTER.length} deuses</span>
      <span class="push"><button class="col2mf__b col2mf__b--quiet" id="col2mflimpar">Limpar</button><button class="col2mf__b col2mf__b--go" id="col2mfok">Pronto</button></span></div>
    <div class="fbox__b">
      ${grupo('PANTEÃO', PANTEOES.map(f => chip('cultura', f, f)).join(''))}
      ${grupo('CLASSE', COL_CLASSES.map(c => chip('classe', c, c)).join(''))}
    </div></div></div>`;
}

function colG(k){ return (typeof GODS !== 'undefined' && GODS[k]) || HRM[k] || {}; }
function colNome(k){ return (HRM[k] && HRM[k].nome) || colG(k).nome || k; }
function colObtido(k){ return (perfil && perfil.deuses && perfil.deuses[k] && perfil.deuses[k].obtidoEm) || 0; }
function colCopias(k){ return (perfil && perfil.deuses && perfil.deuses[k] && perfil.deuses[k].copias) || 0; }

// os 100, filtrados+ordenados pelos filtros ativos. Cada filtro REDUZ de verdade (guarda babá).
function colecaoFiltrada(){
  let ks = ROSTER.map(e => e.key);
  const f = colF, q = f.busca.trim().toLowerCase();
  if (q) ks = ks.filter(k => colNome(k).toLowerCase().includes(q));
  if (f.cultura) ks = ks.filter(k => (colG(k).faccao) === f.cultura);
  if (f.classe) ks = ks.filter(k => (colG(k).classe) === f.classe);
  if (f.funcao) ks = ks.filter(k => (colG(k).funcao) === f.funcao);
  if (f.elem) ks = ks.filter(k => (colG(k).elem) === f.elem);   // §346: filtro de elemento (combina com os demais)
  if (f.status) ks = ks.filter(k => f.status === 'tem' ? temDeus(k) : !temDeus(k));
  if (f.raridade) ks = ks.filter(k => raridadeDe(k) === f.raridade);
  if (f.ordem === 'nome') ks.sort((a, b) => colNome(a).localeCompare(colNome(b)));
  else ks.sort((a, b) => (colObtido(b) - colObtido(a)) || colNome(a).localeCompare(colNome(b)));   // Mais recentes (obtidoEm)
  return ks;
}

// ÍCONE DE CULTURA no escudo: MONOGRAMA de 2 letras (brasão). Símbolo exótico (Ω/ᚱ/☥/⛩/天) NÃO é coberto
// por Rajdhani (Latino+Devanagari) → cai no fallback do sistema e vira tofu no WebView (a lição do §277/§260);
// e num escudo de 20px a 10px a letra lê melhor que o símbolo. Monograma é a disciplina segura e uniforme.
const COL_CULT_MON = { 'Grega': 'GR', 'Nórdica': 'NÓ', 'Egípcia': 'EG', 'Japonesa': 'JP', 'Chinesa': 'CH', 'Hindu': 'HI', 'Brasileira': 'BR', 'Africana': 'AF', 'Celta': 'CE', 'Maia': 'MA' };
function colCultMon(f){ return COL_CULT_MON[f] || String(f || '').slice(0, 2).toUpperCase(); }

// CARTÃO da grade: canto chanfrado, faixa de raridade em HEXÁGONO, escudo de cultura, arte de retrato por
// arquivo — §213, nunca 404 —, nome + cultura embaixo. Possuído × não-possuído pelo tratamento do §216
// (dourado × apagado). Selecionado ganha realce.
function colCardHTML(k){
  const g = colG(k), tem = temDeus(k), rar = raridadeDe(k), sel = k === colSel;
  // §284: o cartão NÃO carrega indicador de maestria (nem a moldura de Mestre). A maestria mora SÓ no painel
  // (o §282 tirou o pip da grade por duplicação; o §284 traz o posto+barra ao painel e ali fica). O cartão é
  // só raridade + cultura + retrato + nome/cultura + estado possuído/falta.
  // §319b: selo de NÍVEL PAGÁVEL (▲ dourado) num canto livre — só quando há próximo nível a pagar agora.
  const subir = nlTemPagavel(k) ? '<span class="col2c__subir" title="Há nível para subir">▲</span>' : '';
  // §346: o cartão ganha o VISUAL do montador (retrato cheio + degradê + nome + orbe do elemento + função).
  // Mantém as marcas da Coleção: selo de raridade, monograma de cultura, ▲ de nível pagável, apagado se não-possuído.
  return `<button class="col2c ${tem ? 'col2c--tem' : 'col2c--falta'}${sel ? ' is-sel' : ''}" data-deus="${H(k)}" title="${H(colNome(k))} · ${H(g.faccao || '')}">
    <span class="col2c__art">${slot('god-' + k, ini(colNome(k)), tem ? COR(g.elem) : '#6a6390', 34)}</span>
    <span class="col2c__grad"></span>
    <span class="col2c__rar col2c__rar--${rar}">${rar}</span>
    <span class="col2c__cult" title="${H(g.faccao || '')}">${H(colCultMon(g.faccao))}</span>
    ${subir}
    <span class="col2c__foot"><b class="col2c__n">${H(colNome(k))}</b><span class="col2c__meta">${tem ? orbe(g.elem, 16) : ''}<span class="col2c__f">${H(g.funcao || '')}</span></span></span>
  </button>`;
}

// §284-ajuste2 — O RENDERIZADOR ÚNICO de linha de kit, do jogo inteiro. Lê UMA fonte: um item de `g.ab`
// (data/deuses) ou `g.passiva`, com {nome, cost, cd, desc}. Chamado pela SOBREPOSIÇÃO da Coleção, pelo
// detalhe da ROTA 'deus' (Missões) e pela revelação de kit da CAMPANHA — cada tela mantém a própria casca,
// mas a LINHA é esta. Mude aqui e as três mudam juntas (senão a duplicação — que já virou 4 catálogos — volta).
function kitLinhaHTML(rot, a, passiva){
  if (!a) return `<div class="col2k__row col2k__row--vazio"><span class="col2k__rot">${rot}</span><span class="col2k__nv">—</span></div>`;
  const meta = passiva
    ? '<span class="col2k__cd">passiva · não gasta a ação</span>'
    : `${pipsDetalhe(a.cost || {})}<span class="col2k__cd">${a.cd ? 'recarga ' + a.cd : 'sem recarga'}</span>`;
  return `<div class="col2k__row">
    <div class="col2k__top"><span class="col2k__rot">${rot}</span><b class="col2k__nome">${H(a.nome || '—')}</b></div>
    <div class="col2k__meta">${meta}</div>
    <div class="col2k__ef">${realce(a.desc || '')}</div>
  </div>`;
}


// §358 — SINERGIA (helpers de dado, reusados pela FICHA): derivados do fx (data/sinergia.json → SINERGIA).
const SIN = (typeof SINERGIA !== 'undefined' && SINERGIA) ? SINERGIA : { fichas: {}, auraDoadores: [] };
function sinFicha(k){ return (SIN.fichas && SIN.fichas[k]) || null; }
function sinElem(k){ const g = colG(k); return g ? g.elem : null; }
// texto da faixa de aura na ficha de k (exclui o próprio; concorda o verbo): "Brigid e Mímir reforçam o time"
function sinAuraTexto(k){
  const ds = (SIN.auraDoadores || []).filter(d => d.deus !== k);
  if (!ds.length) return '';
  const nomes = ds.map(d => d.nome);
  const lista = nomes.length > 1 ? nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1] : nomes[0];
  return lista + (nomes.length > 1 ? ' reforçam' : ' reforça') + ' o time';
}
// §358 — a SINERGIA na FICHA (aba SINERGIA): a MESMA lista que a sobreposição mostrava (faixa global + parceiros
// com motivo inteiro, ou solista/suporte). Sem rolagem: cabe na área do kit (os parceiros são poucos por deus).
function fichaSinergiaHTML(k){
  const f = sinFicha(k), aura = sinAuraTexto(k);
  const supSelf = f && f.suporte ? `você ${f.suporte}` : '';
  const faixaTxt = [aura, supSelf].filter(Boolean).join(' · ');
  const faixa = faixaTxt ? `<p class="dsx-sin__faixa"><i>⬡</i>${H(faixaTxt)}</p>` : '';
  let corpo;
  if (f && f.parceiros && f.parceiros.length){
    // §358: SEM rolar — mostra os parceiros de maior prioridade que cabem (motivo inteiro); o resto vira "+N mais".
    // (A ordem já vem por prioridade: laço > combo > facção > …; cf. colecao_sinergia.) O time completo age na batalha.
    const CAP = 2, mostra = f.parceiros.slice(0, CAP), resto = f.parceiros.length - mostra.length;
    corpo = mostra.map(p => `<div class="dsx-sin__par dsx-sin__par--${p.familia === 'fase-anti' ? 'anti' : p.familia}">
      <span class="dsx-sin__art">${slot('god-' + p.para, ini(p.nome), COR(sinElem(p.para)), 34)}</span>
      <div class="dsx-sin__txt"><div class="dsx-sin__cab"><b class="dsx-sin__nome">${H(p.nome)}</b><span class="dsx-sin__fam">${H(p.familia)}</span></div><p class="dsx-sin__mot" data-clamp="ok">${H(p.motivo)}</p></div>
    </div>`).join('');
    if (resto > 0) corpo += `<p class="dsx-sin__mais">+${resto} parceiro${resto === 1 ? '' : 's'} — agem no time, em batalha</p>`;
  } else if (!f || f.solista){
    corpo = `<p class="dsx-sin__solo">Sem sinergia específica — funciona sozinho.</p>`;
  } else {
    corpo = '';   // só suporte/aura: a faixa já diz tudo
  }
  return `<div class="dsx-sin">${faixa}<div class="dsx-sin__lista">${corpo}</div></div>`;
}

// §358 — resumo de raridade do acervo (uma linha discreta no cabeçalho da Coleção).
function colResumoRaridade(){
  const ks = ROSTER.map(e => e.key), donos = ks.filter(temDeus).length;
  const por = { SS: { t: 0, n: 0 }, S: { t: 0, n: 0 }, A: { t: 0, n: 0 } };
  ks.forEach(k => { const r = raridadeDe(k); if (por[r]) { por[r].t++; if (temDeus(k)) por[r].n++; } });
  return { donos, total: ROSTER.length, por };
}

// §358 — a Coleção: cabeçalho (título + resumo de raridade numa linha) + filtros (§346b) + GRADE em tela cheia.
// SEM painel lateral e SEM sobreposição: tocar num cartão abre a FICHA (rota 'deus'). A grade é LISTA — pode rolar.
function renderColecao(){
  colSel = null; colVer = null;
  const R = colResumoRaridade();
  const resumo = `<span class="col2res__big"><b>${R.donos}</b>/${R.total}</span>`
    + ['SS', 'S', 'A'].map(r => `<span class="col2res__r"><span class="col2res__rl col2p__rar--${r}">${r}</span>${R.por[r].n}/${R.por[r].t}</span>`).join('');
  const mo = moedaServidor();
  const semEF = !colF.elem && !colF.funcao;
  const orbesEl = ELEMS.map(e => `<button class="col2forbe${colF.elem === e ? ' is-on' : ''}" data-colelem="${H(e)}" aria-label="${H((typeof ELAB !== 'undefined' && ELAB[e]) || e)}">${orbe(e, 26)}</button>`).join('');
  const chipsFn = COL_FUNCOES.map(f => `<button class="col2fchip${colF.funcao === f ? ' is-on' : ''}" data-colfunc="${H(f)}">${H(f)}</button>`).join('');
  const pill = (attr, val, atual, txt) => `<button class="col2pill${atual === val ? ' is-on' : ''}" data-${attr}="${H(val)}">${txt}</button>`;
  const pillsStatus = pill('colstatus', '', colF.status, 'Todos') + pill('colstatus', 'tem', colF.status, 'Tenho') + pill('colstatus', 'nao', colF.status, 'Faltam');
  const pillsRar = pill('colrar', '', colF.raridade, 'Todas') + pill('colrar', 'SS', colF.raridade, 'SS') + pill('colrar', 'S', colF.raridade, 'S') + pill('colrar', 'A', colF.raridade, 'A');
  const nExtra = colExtrasAtivos();
  const btMais = `<button class="col2fchip col2mf__abre${nExtra ? ' is-on' : ''}" id="col2mfabre" data-colmfabre="1">Mais${nExtra ? ' · ' + nExtra : ''}</button>`;
  const btOrd = `<label class="col2__sel col2__sel--ord"><select data-filtro="ordem" aria-label="Ordenar"><option value="recentes"${colF.ordem === 'recentes' ? ' selected' : ''}>Recentes</option><option value="nome"${colF.ordem === 'nome' ? ' selected' : ''}>Nome A–Z</option></select></label>`;
  stage.innerHTML = `<div id="baselayer" class="col2fix"><div id="colfix" class="col2">
    <header class="col2__topo">
      <button class="col2__voltar" id="bvoltar" aria-label="Voltar"><i class="dsel__seta"></i></button>
      <h1 class="col2__titulo cin">Personagens</h1>
      <div class="col2res" id="col2res">${resumo}</div>
      <div class="col2__moedas">
        <span class="col2__moeda"><i class="col2__mic col2__mic--ess">◈</i><b>${fmtMoeda(mo.online, mo.essencia)}</b></span>
        <span class="col2__moeda"><i class="col2__mic col2__mic--gem">◆</i><b>${fmtMoeda(mo.online, mo.gema)}</b></span>
      </div>
    </header>
    <div class="col2__filtros">
      <button class="col2fchip col2fchip--todos${semEF ? ' is-on' : ''}" data-coltodos="1">Todos</button>
      <span class="col2forbes">${orbesEl}</span>
      <span class="col2ffuncs">${chipsFn}</span>
    </div>
    <div class="col2__pills">
      <label class="col2__busca"><i>⌕</i><input type="text" id="col2busca" placeholder="Buscar…" value="${H(colF.busca)}" autocomplete="off"></label>
      <span class="col2pill__grp">${pillsStatus}</span>
      <span class="col2pill__grp">${pillsRar}</span>
      ${btMais}${btOrd}
      <span class="col2__conta" id="col2conta"></span>
    </div>
    <div class="col2__grade" id="col2grade"></div>
    ${colMaisFiltrosHTML()}
  </div></div>`;
  const q = s => stage.querySelector(s), qq = s => [...stage.querySelectorAll(s)];
  const v = q('#bvoltar'); if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  const busca = q('#col2busca'); if (busca) busca.oninput = () => { colF.busca = busca.value; colAtualizarGrade(); };
  qq('select[data-filtro]').forEach(s => s.onchange = () => { colF[s.dataset.filtro] = s.value; colAtualizarGrade(); });
  const abre = q('#col2mfabre'); if (abre) abre.onclick = () => { colMaisAberto = !colMaisAberto; colReabrir(); };
  const mfok = q('#col2mfok'); if (mfok) mfok.onclick = () => { colMaisAberto = false; colReabrir(); };
  const mfov = q('#col2mf'); if (mfov) mfov.onclick = ev => { if (ev.target === mfov) { colMaisAberto = false; colReabrir(); } };
  const mflimpar = q('#col2mflimpar'); if (mflimpar) mflimpar.onclick = () => { colF.cultura = ''; colF.classe = ''; colReabrir(); };
  qq('[data-colmf]').forEach(b => b.onclick = () => { const [campo, val] = b.dataset.colmf.split('|'); colF[campo] = (colF[campo] === val ? '' : val); colReabrir(); });
  const marcarTodos = () => { const bt = q('[data-coltodos]'); if (bt) bt.classList.toggle('is-on', !colF.elem && !colF.funcao); };
  qq('[data-colelem]').forEach(b => b.onclick = () => { const e = b.dataset.colelem; colF.elem = (colF.elem === e ? '' : e);
    qq('[data-colelem]').forEach(x => x.classList.toggle('is-on', !!colF.elem && x.dataset.colelem === colF.elem)); marcarTodos(); colAtualizarGrade(); });
  qq('[data-colfunc]').forEach(b => b.onclick = () => { const f = b.dataset.colfunc; colF.funcao = (colF.funcao === f ? '' : f);
    qq('[data-colfunc]').forEach(x => x.classList.toggle('is-on', !!colF.funcao && x.dataset.colfunc === colF.funcao)); marcarTodos(); colAtualizarGrade(); });
  const bt = q('[data-coltodos]'); if (bt) bt.onclick = () => { colF.elem = ''; colF.funcao = '';
    qq('[data-colelem]').forEach(x => x.classList.remove('is-on')); qq('[data-colfunc]').forEach(x => x.classList.remove('is-on')); bt.classList.add('is-on'); colAtualizarGrade(); };
  qq('[data-colstatus]').forEach(b => b.onclick = () => { colF.status = b.dataset.colstatus; qq('[data-colstatus]').forEach(x => x.classList.toggle('is-on', x === b)); colAtualizarGrade(); });
  qq('[data-colrar]').forEach(b => b.onclick = () => { colF.raridade = b.dataset.colrar; qq('[data-colrar]').forEach(x => x.classList.toggle('is-on', x === b)); colAtualizarGrade(); });
  colAtualizarGrade();
  fit();
}
// re-preenche SÓ a grade + contador (sem tocar na barra → a busca não perde o foco). §358: tocar abre a FICHA.
function colAtualizarGrade(){
  const grade = stage.querySelector('#col2grade'); if (!grade) return;
  const ks = colecaoFiltrada();
  grade.innerHTML = ks.length ? ks.map(colCardHTML).join('') : '<p class="col2__vazio">Nenhum personagem com esses filtros.</p>';
  const cont = stage.querySelector('#col2conta'); if (cont) cont.textContent = ks.length + ' deuses';
  // §358: o cartão abre a FICHA do deus (rota 'deus'); as setas da ficha andam na lista FILTRADA de agora.
  [...grade.querySelectorAll('.col2c[data-deus]')].forEach(b => b.onclick = () => { fichaLista = colecaoFiltrada(); ir('deus', { key: b.dataset.deus }); render(); });
}
// §346b: re-render da Coleção (os filtros de "MAIS FILTROS" redesenham a tela). §358: sem seleção de painel a restaurar.
function colReabrir(){ renderColecao(); }


/* ---------- detalhe do deus: kit + arte + estado da Provação, com o elo p/ jogá-la ---------- */
// (§284-ajuste2: linhaKitHTML/deusDetalheHTML foram substituídos pelo renderizador único kitLinhaHTML, que lê
// data/deuses; deusSkills passou a ler g.ab. §285: o CKIT foi APAGADO — a fonte é data/deuses direto.)
function provacaoDetalheHTML(k){
  const g = HRM[k] || {};
  if (g.inicial) return `<div class="dprov"><span class="dprov__rot">RITO</span><p class="dprov__none">Deus inicial — vem com você, sem rito.</p></div>`;
  const p = provDe(k);
  // genérica = fora do acervo jogável (§212): existe no dado como histórico, mas não se joga.
  if (!p || p.generica) return `<div class="dprov"><span class="dprov__rot">RITO</span><p class="dprov__none">Sem rito no acervo para este deus.</p></div>`;
  const rec = perfil && perfil.provacoes && perfil.provacoes[k];
  const estado = rec && rec.lances != null
    ? `<span class="dprov__feita">✓ Vencido em ${rec.lances} lance${rec.lances === 1 ? '' : 's'}${rec.minimo != null ? ` · mínimo ${rec.minimo}` : ''}</span>`
    : `<span class="dprov__aberta">No acervo</span>`;
  return `<div class="dprov">
    <span class="dprov__rot">RITO</span>
    <div class="dprov__linha">
      <span class="dprov__faixa faixa--${faixaClasse(p.faixa)}">${H(p.faixa || '—')}</span>
      <span class="dprov__tit">${H(p.titulo)}</span>
    </div>
    <div class="dprov__pe">${estado}
      <button class="b b--primary b--sm" data-jogarprova="${k}">${rec && rec.lances != null ? 'Jogar de novo' : 'Jogar Rito'}</button>
    </div>
  </div>`;
}
// §220 — DETALHE do deus refeito (Mobile Legends invertido: arte à ESQUERDA porque o que se TOCA
// (skills) vai à direita, coerente com o §214). deusSel = skill selecionada; abre na PASSIVA (ela
// define o deus e é o que menos se pensaria em tocar). deusSelKey reseta a seleção ao trocar de deus.
let deusSel = 'passiva', deusSelKey = null;
// §319 FASE 4 — a tela de NÍVEIS: confirmação inline por painel (§245, sem modal). nlConfirm = slot com a
// confirmação aberta (só um por vez); nlPendente trava o toque duplo enquanto o servidor responde; nlMsg =
// {slot,texto} com a recusa curta do servidor. Resetam ao trocar de deus (ver renderDeusDetalhe).
let nlConfirm = null, nlPendente = false, nlMsg = null, nlSelKey = null;   // §319c: chave da tela de NÍVEIS (decoupla da ficha)

// COMO CONSEGUIR (substitui a maestria quando NÃO se possui o deus): maestria zero não é informação;
// a rota de aquisição é. Duas vias: INVOCAÇÃO (gacha) e MISSÃO (§234). O ELO com a tela de Missões
// (§220): daqui dá para VER a missão do deus — o botão leva ao mapa, e lá o deus leva de volta aqui.
function comoConseguirHTML(k, rar){
  const m = (typeof MISSOES !== 'undefined' && MISSOES.missoes) ? MISSOES.missoes[k] : null;
  // §350c: compacto — Invocação e Missão LADO A LADO; o requisito da missão em 2 linhas no máximo (clamp) + o atalho
  // "ver Provação ›". Mais baixo que antes, p/ o DETALHE da habilidade caber inteiro mesmo neste estado.
  const missaoVia = m
    ? `<button class="dcomo__via dcomo__via--miss" data-vermissao="1"><b>Missão</b><span class="dcomo__mtxt" data-clamp="ok">${H(reqMissaoTexto(k))}</span><span class="dcomo__atalho">ver Provação ›</span></button>`
    : `<div class="dcomo__via"><b>Missão</b><span class="dcomo__mtxt" data-clamp="ok">este deus não tem missão (inicial)</span></div>`;
  return `<div class="dcomo">
    <span class="dcomo__rot">COMO CONSEGUIR</span>
    <div class="dcomo__vias">
      <div class="dcomo__via"><b>Invocação</b><span class="dcomo__mtxt" data-clamp="ok">na roleta · raridade ${H(RAR_ROT[rar] || rar)}</span></div>
      ${missaoVia}
    </div>
  </div>`;
}
// texto curto do requisito de Provação (§314, para o detalhe do deus): resume a LISTA DE OBJETIVOS.
// Texto PLANO (o chamador embrulha em H()): "3 objetivos: 2 seguidas com Zeus · 8 vitórias com Zeus/Ganesha
// · 8 vitórias no panteão · abre em Devoto".
function reqMissaoTexto(k){
  const m = MISSOES.missoes[k]; if (!m) return '';
  const adj = (p) => PANT_ADJ[p] || p;
  const rot = (o) => {
    if (o.tipo === 's') return `${o.k} seguidas com ${nomeM(o.alvo)}`;
    if (o.tipo === 'sp') return `${o.k} seguidas no panteão ${adj(o.panteao)}`;
    if (o.tipo === 'c') return `${o.k} seguidas com ${nomeM(o.lista[0])} e com ${nomeM(o.lista[1])}`;
    if (o.tipo === 'v') return `${o.n} vitórias com ${o.lista.map(nomeM).join('/')}`;
    if (o.tipo === 'j') return `${o.n} vitórias com ${nomeM(o.lista[0])} e ${nomeM(o.lista[1])}`;
    if (o.tipo === 'p') return `${o.n} vitórias no panteão ${adj(o.panteao)}`;
    if (o.tipo === 'a') return `${o.n} panteões diferentes`;
    return '';
  };
  const objs = (m.objetivos || []);
  let s = `${objs.length} objetivos: ${objs.map(rot).join(' · ')}`;
  if (m.faixaNome && (m.faixaMin || 0) > 0) s += ` · abre em ${m.faixaNome}`;
  return s;
}

// as 4 skills que DEFINEM o deus na Coleção (a Defesa é universal e fica fora): cada uma tem arte.
// §318: os níveis do jogador para EXIBIR o kit efetivo na tela de detalhe (o texto mostra o número
// atual). Vêm da conta (autoritativa, do servidor). null/ausente → kit base (nv1). FASE 0: tudo nv1.
function niveisDeExibicao(k){ return (typeof contaAtual !== 'undefined' && contaAtual && contaAtual.niveis && contaAtual.niveis[k]) || null; }
// §323 P2: niveisTimeLocal vive em ui/base.js (compartilhado com selecao.js — ui não chama ui).
// monta a Provação aplicando os níveis do jogador (lado 0) e carimba o snapshot da batalha (replay).
// Não MUTA o dado compartilhado (clona com Object.assign). nv null → base.
function montarPvEComNiveis(prov, time){
  const nv = niveisTimeLocal(time);
  if (typeof definirNiveisBatalha === 'function') definirNiveisBatalha(nv);
  return montarProvacao(nv ? Object.assign({}, prov, { niveis: [nv, {}] }) : prov);
}
// aplica kitEfetivo quando disponível (bundle) — passa TODA leitura de kit da tela de detalhe pela
// função-de-um-ponto-só do motor. Sem níveis (FASE 0) o kit efetivo é DEEP-EQUAL ao base (regressão zero).
function deusKitEfetivo(k, g){ return (typeof kitEfetivo === 'function' && g && g.ab) ? kitEfetivo(g, niveisDeExibicao(k)) : g; }
// §284-ajuste2: lê de data/deuses (g.ab / g.passiva) — a MESMA fonte da sobreposição. `a` é o item cru.
function deusSkills(g){
  const ab = {}; (g && g.ab || []).forEach(x => ab[x.slot] = x);
  return [
    { slot: 'basico',     tipo: 'BÁSICO',     a: ab.basico },
    { slot: 'habilidade', tipo: 'HABILIDADE', a: ab.habilidade },
    { slot: 'milagre',    tipo: 'MILAGRE',    a: ab.milagre },
    { slot: 'passiva',    tipo: 'PASSIVA',    a: g && g.passiva },
  ];
}
// §350 — as 5 skills da FICHA (Passiva + Básico/Habilidade/Milagre + Defesa universal). A Defesa (DEFESA, engine)
// é universal; a Passiva vem de g.passiva. Usada pelos botões e pelo detalhe.
const FICHA_ROT = { passiva: 'Passiva', basico: 'Básico', habilidade: 'Habilidade', milagre: 'Milagre', defesa: 'Defesa' };
const FICHA_TIPO = { passiva: 'PASSIVA', basico: 'BÁSICO', habilidade: 'HABILIDADE', milagre: 'MILAGRE', defesa: 'DEFESA' };
const FICHA_COR = { passiva: '#58d6c0', basico: '#6fb1ff', habilidade: '#b48ce0', milagre: '#F0D79A', defesa: '#9db4d8' };
function _fichaSkills(gmEf){
  const ab = {}; (gmEf && gmEf.ab || []).forEach(x => ab[x.slot] = x);
  return [
    { slot: 'passiva', a: gmEf && gmEf.passiva },
    { slot: 'basico', a: ab.basico },
    { slot: 'habilidade', a: ab.habilidade },
    { slot: 'milagre', a: ab.milagre },
    { slot: 'defesa', a: (typeof DEFESA !== 'undefined' ? DEFESA : null) },
  ];
}
// §350c: o selo "Nv" só nas habilidades COM escada (nlSemEscada === false). Passiva e Defesa (e qualquer slot sem
// degraus) não têm nível → sem selo.
function _fichaNv(k, sl, ab){ if (sl === 'passiva' || nlSemEscada(ab)) return null; return nlNivel(k, sl); }
function _fichaAlvo(a){
  const M = { inimigo: 'Alvo único', '2inimigos': 'Dois inimigos', todosInimigos: 'Todos inimigos', aliado: 'Um aliado', '2aliados': 'Dois aliados', distribui: 'Distribui', auto: 'Em si', nenhum: 'Em si' };
  return M[a.alvo] || '';
}
function _fichaBtnHTML(k, s, sel){
  const nv = _fichaNv(k, s.slot, s.a);
  return `<button class="dsk${s.slot === sel ? ' is-sel' : ''}" data-deussel="${s.slot}" ${s.a ? '' : 'disabled'} title="${H(FICHA_ROT[s.slot])}">
    <span class="dsk__art">${slot('skill-' + k + '-' + s.slot, '', null, 0, false)}</span>
    ${nv != null ? `<span class="dsk__nv">Nv ${nv}</span>` : ''}
    <span class="dsk__nome">${H(FICHA_ROT[s.slot])}</span>
  </button>`;
}
// DETALHE da skill selecionada (§350): ícone + título Cinzel + pílulas (tipo na cor da energia · classe · alvo · NV) +
// custo em orbes/GRÁTIS e recarga + descrição. Lê o kit efetivo (§318).
function deusDetalheHTML(k, gmEf, sel){
  const sks = _fichaSkills(gmEf);
  const s = sks.find(x => x.slot === sel && x.a) || sks.find(x => x.a);
  if (!s || !s.a) return `<div class="ddet ddet--vazio">Kit em produção.</div>`;
  const a = s.a, pas = s.slot === 'passiva', g = (typeof GODS !== 'undefined' && GODS[k]) || HRM[k] || {};
  const nv = _fichaNv(k, s.slot, s.a);
  const pills = [
    `<span class="ddet__pill ddet__pill--tipo" style="--c:${FICHA_COR[s.slot]}">${FICHA_TIPO[s.slot]}</span>`,
    g.classe ? `<span class="ddet__pill">${H(g.classe)}</span>` : '',
    (!pas && _fichaAlvo(a)) ? `<span class="ddet__pill">${H(_fichaAlvo(a))}</span>` : '',
    nv != null ? `<span class="ddet__pill">NV ${nv}</span>` : '',
  ].filter(Boolean).join('');
  const meta = pas
    ? `<span class="ddet__pas">Passiva · não gasta a ação</span>`
    : `<span class="ddet__cost">${_montCustoHTML(a.cost)}<span class="ddet__clab">Custo</span></span><span class="ddet__cd"><i>⟲</i> Recarga ${a.cd || 0}</span>`;
  return `<div class="ddet">
    <div class="ddet__head">
      <span class="ddet__art">${slot('skill-' + k + '-' + s.slot, '', null, 0, false)}</span>
      <div class="ddet__id"><h2 class="ddet__tit cin">${H(a.nome || '—')}</h2><div class="ddet__pills">${pills}</div></div>
    </div>
    <div class="ddet__meta">${meta}</div>
    <p class="ddet__desc">${realce(a.desc || '')}</p>
  </div>`;
}
// §319c — FICHA do deus RESTAURADA (rota 'deus', como era ANTES do §319): arte à esquerda + coluna de
// identidade (chips), maestria (ou "como conseguir" se não possui), seletor de kit e detalhe da skill (abre na
// PASSIVA). A tela de NÍVEIS virou rota própria ('niveis'); o elo daqui é o botão "SUBIR HABILIDADES ›":
// dourado CHEIO (b--primary) quando há um próximo nível PAGÁVEL agora, de CONTORNO (b--sec) quando não há — mas
// abre do mesmo jeito (ver as escadas) — e PRESENTE também para deus não possuído (a tela de níveis mostra
// "Você ainda não tem este deus"). Nada de leitor de moeda/conteúdo novo: a casca é a de antes + um elo.
// §350 — ícones em SVG das etiquetas (panteão=louro, classe=losango mágico, função=espadas).
function _fichaIc(tipo){
  if (tipo === 'pant') return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 20C5 18 3 14 3 9M15 20c4-2 6-6 6-11"/><path d="M9 20c-2-1-3-4-3-7M15 20c2-1 3-4 3-7"/></svg>`;
  if (tipo === 'classe') return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l3 6-3 6-3-6z" opacity=".9"/><path d="M12 15l2 3-2 3-2-3z"/></svg>`;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 4l13 13M6 20L20 6"/><path d="M3 6l3-2M21 6l-3-2"/></svg>`;
}
// §358 — estado de navegação das setas ‹ › da FICHA: andam na lista FILTRADA de onde se veio (a grade da Coleção),
// ou — se veio de outro lugar — na lista da Coleção SEM filtro (a ordem canônica do ROSTER).
function fichaNavEstado(k){
  const lista = (fichaLista && fichaLista.indexOf(k) >= 0) ? fichaLista : ROSTER.map(e => e.key);
  const idx = lista.indexOf(k);
  return { lista, idx, temPrev: idx > 0, temNext: idx >= 0 && idx < lista.length - 1 };
}
function fichaIr(k, delta){
  const e = fichaNavEstado(k); if (e.idx < 0) return;
  const alvo = e.lista[e.idx + delta]; if (!alvo) return;
  ir('deus', { key: alvo }, { substituir: true }); render();
}
function renderDeusDetalhe(){
  const k = (paramsAtuais() || {}).key;
  const g = HRM[k] || { nome: k, elem: 'Umbra', faccao: '', classe: '', funcao: '' };
  const gm = (typeof GODS !== 'undefined' && GODS[k]) || g;   // metadados/kit do data/deuses
  const gmEf = deusKitEfetivo(k, gm);   // §318: kit EXIBIDO pelo kitEfetivo (nv atual)
  const tem = temDeus(k), rar = raridadeDe(k), pagavel = nlTemPagavel(k);
  if (deusSelKey !== k) { deusSel = 'passiva'; deusSelKey = k; }   // abre na PASSIVA
  const nav = fichaNavEstado(k);
  const cop = colCopias(k), pts = nlPontos(k);
  // §358: a posse ("Possuído · N cópias · N pontos") mora na ARTE (identidade), liberando a coluna direita p/ o detalhe.
  const posse = tem
    ? `<div class="dsx-art__posse dsx-art__posse--tem">Possuído · ${cop} cópia${cop === 1 ? '' : 's'} · ${pts} ponto${pts === 1 ? '' : 's'}</div>`
    : `<div class="dsx-art__posse dsx-art__posse--nao">Não possuído</div>`;
  const artImg = (typeof RETRATO_ARTE !== 'undefined' && RETRATO_ARTE[k]) ? `<img class="dsx-art__img" src="retratos/${H(k)}.webp" alt="" loading="lazy" onerror="this.remove()">` : '';
  const arq = gm.arquetipo ? `<div class="dsx-art__arq" data-clamp="ok">${H(gm.arquetipo)}</div>` : '';
  // §358: aba HABILIDADES | SINERGIA acima do bloco de habilidades (a sinergia mostra o que a sobreposição mostrava).
  const corpo = fichaAba === 'sinergia'
    ? fichaSinergiaHTML(k)
    : `<div class="dsx-hab"><div class="dsx-hab__btns">${_fichaSkills(gmEf).map(s => _fichaBtnHTML(k, s, deusSel)).join('')}</div></div>
       ${deusDetalheHTML(k, gmEf, deusSel)}`;
  stage.innerHTML = `<div id="baselayer" class="deusfix2"><div id="deusfix" class="${tem ? '' : 'deusfix--falta'}">
    <div class="dsx-art">
      <span class="dsx-art__mono">${slot('god-' + k, ini(g.nome), tem ? COR(g.elem) : '#6a6390', 72)}${artImg}</span>
      <div class="dsx-art__veu"></div>
      <button class="dsxb dsxb--voltar" id="bvoltar">‹ Voltar</button>
      ${tem ? '' : '<span class="dsx-art__tag">VOCÊ NÃO POSSUI</span>'}
      <div class="dsx-art__id">
        <div class="dsx-art__nome cin">${H(g.nome)}</div>
        ${posse}
        ${arq}
      </div>
    </div>
    <button class="dsx-nav dsx-nav--prev" id="dsxprev" aria-label="Anterior" ${nav.temPrev ? '' : 'disabled'}><i></i></button>
    <button class="dsx-nav dsx-nav--next" id="dsxnext" aria-label="Próximo" ${nav.temNext ? '' : 'disabled'}><i></i></button>
    <section class="dsx-col">
      <header class="dsx-cab">
        <span class="dsx-rar rar--${rar}">${RAR_ROT[rar] || rar}</span>
        <button class="dsxb dsxb--subir${pagavel ? ' is-pag' : ''}" data-irniveis="${H(k)}">SUBIR HABILIDADES ›${pagavel ? '<i class="dsx-dot"></i>' : ''}</button>
      </header>
      <div class="dsx-tags">
        <span class="dsx-tag"><i class="dsx-tag__ic">${_fichaIc('pant')}</i>${H(gm.faccao)}</span>
        <span class="dsx-tag">${orbe(gm.elem, 22)}${H(ELAB[gm.elem] || gm.elem)}</span>
        <span class="dsx-tag"><i class="dsx-tag__ic">${_fichaIc('classe')}</i>${H(gm.classe)}</span>
        <span class="dsx-tag"><i class="dsx-tag__ic">${_fichaIc('func')}</i>${H(gm.funcao)}</span>
      </div>
      ${tem ? maestriaDetalheHTML(k) : comoConseguirHTML(k, rar)}
      <div class="dsx-tabs">
        <button class="dsx-tab${fichaAba === 'habilidades' ? ' is-on' : ''}" data-ficha-aba="habilidades">HABILIDADES</button>
        <button class="dsx-tab${fichaAba === 'sinergia' ? ' is-on' : ''}" data-ficha-aba="sinergia">SINERGIA</button>
      </div>
      <div class="dsx-corpo">${corpo}</div>
    </section>
  </div></div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  const bp = stage.querySelector('#dsxprev'); if (bp && !bp.disabled) bp.onclick = () => fichaIr(k, -1);
  const bn = stage.querySelector('#dsxnext'); if (bn && !bn.disabled) bn.onclick = () => fichaIr(k, 1);
  stage.querySelectorAll('[data-ficha-aba]').forEach(b => b.onclick = () => { fichaAba = b.dataset.fichaAba; render(); });
  stage.querySelectorAll('[data-deussel]').forEach(b => { if (b.disabled) return;
    b.onclick = () => { deusSel = b.dataset.deussel; render(); }; });
  const sb = stage.querySelector('[data-irniveis]'); if (sb) sb.onclick = () => { ir('niveis', { key: k }); render(); };
  const vm = stage.querySelector('[data-vermissao]'); if (vm) vm.onclick = () => { ir('provacoes'); render(); };
  fit();
}
// ===================================================================
// §319 FASE 4 — A TELA DOS NÍVEIS DE HABILIDADE (ref. aprovada pelo dono). §319c: é a rota PRÓPRIA 'niveis'
// (renderNiveis), alcançada pelo botão "SUBIR HABILIDADES ›" da ficha e pelo "Subir níveis ›" da Coleção.
// Coluna esquerda = identidade + PASSIVA (sem níveis) + rodapé "X de Y"; coluna direita
// = os 3 painéis das habilidades ativas (básico/habilidade/milagre), cada um com os marcadores de nível, o
// "Atual" e o "Próximo" (SÓ o que muda), e o botão SUBIR. O servidor (subirNivel) é AUTORITATIVO (pontos,
// topo por slot, trava de liberação); isto é TELA — nada do que o jogador vê é inventado aqui, tudo deriva
// do data/deuses (escadas), do kitEfetivo (texto no nível) e da economia.json (custo em pontos).
// ===================================================================
function NL_ECON(){ return (typeof ECONOMIA !== 'undefined' && ECONOMIA.invocacao) || {}; }
function nlCustoNivel(alvo){ const c = NL_ECON().custoNivel || {}; return c[String(alvo)] || 0; }   // pontos p/ chegar AO nível
function nlPontosPorCopia(rar){ const p = NL_ECON().pontosPorDuplicata || {}; return p[rar] || 0; }
function nlNivel(k, sl){ const n = niveisDeExibicao(k); return (n && n[sl]) || 1; }                   // nível atual do slot (conta; 1 default)
function nlPontos(k){ return (typeof contaAtual !== 'undefined' && contaAtual && contaAtual.pontos && contaAtual.pontos[k]) || 0; }
function nlAb(gm, sl){ return (gm && gm.ab || []).find(a => a.slot === sl) || null; }
// SEM ESCADA: sem niveis (ou vazio) OU marcado semEscada (f'/h'). Não sobe. O motivo técnico do dado (que
// cita medidas internas) NUNCA aparece na tela — a cópia é genérica.
function nlSemEscada(ab){ return !ab || !Array.isArray(ab.niveis) || ab.niveis.length === 0 || ab.semEscada === true; }
// TOPO real do slot: sem escada → 1; senão 1 + nº de degraus (escada curta pára antes do 4 — §318 j').
function nlTopo(ab){ return nlSemEscada(ab) ? 1 : 1 + ab.niveis.length; }
// "X de Y": X = soma dos níveis atuais das 3 ativas; Y = soma dos TOPOS REAIS (conta escada curta e sem-escada).
function nlResumo(k, gm){
  let x = 0, y = 0;
  for (const sl of ['basico', 'habilidade', 'milagre']){
    const ab = nlAb(gm, sl), topo = nlTopo(ab);
    x += nlSemEscada(ab) ? 1 : Math.min(nlNivel(k, sl), topo);
    y += topo;
  }
  return { x, y };
}
// §319b — o deus TEM pelo menos um próximo nível PAGÁVEL agora? (possui + tem pontos + algum slot com escada
// abaixo do topo cujo custo cabe nos pontos). Alimenta o selo da grade e o botão dourado "Subir níveis" — só
// acende quando há de fato o que pagar; sem pontos ou tudo no máximo, fica apagado (leva a "Ver detalhes").
function nlTemPagavel(k){
  if (!temDeus(k)) return false;
  const gm = (typeof GODS !== 'undefined' && GODS[k]); if (!gm) return false;
  const pts = nlPontos(k); if (pts <= 0) return false;
  for (const sl of ['basico', 'habilidade', 'milagre']){
    const ab = nlAb(gm, sl); if (nlSemEscada(ab)) continue;
    const topo = nlTopo(ab), cur = Math.min(nlNivel(k, sl), topo);
    if (cur < topo && nlCustoNivel(cur + 1) <= pts) return true;
  }
  return false;
}
// até onde os PONTOS alcançam a partir do nível atual (marcadores "pode" — mostra o alcance, não só o próximo).
function nlAlcance(k, ab, cur){
  let pts = nlPontos(k), lvl = cur; const topo = nlTopo(ab);
  while (lvl < topo){ const c = nlCustoNivel(lvl + 1); if (c <= pts){ pts -= c; lvl++; } else break; }
  return lvl;
}
// a habilidade EFETIVA num nível arbitrário do slot (clona o deus e aplica a escada — §318 kitEfetivo).
function nlAbEf(gm, sl, nivel){
  if (typeof kitEfetivo !== 'function') return nlAb(gm, sl);
  const nv = {}; nv[sl] = nivel;
  const kit = kitEfetivo(gm, nv);
  return (kit.ab || []).find(a => a.slot === sl) || nlAb(gm, sl);
}
// "nova parte" = as orações do desc do nível cur+1 que NÃO estão no desc do nível cur (derivada do texto, não
// escrita à mão). É o que se mostra num SALTO (efeito novo, duração que muda a redação).
function nlNovaParte(gm, sl, cur){
  const a = nlAbEf(gm, sl, cur), b = nlAbEf(gm, sl, cur + 1);
  const split = s => (s || '').split(/[;.]/).map(x => x.trim()).filter(Boolean);
  const antes = new Set(split(a.desc));
  return split(b.desc).filter(cl => !antes.has(cl)).join('; ');
}
// "Próximo" = SÓ o que muda no degrau cur→cur+1, derivado do `muda` (caminho) + o texto do próximo nível:
// número (16 → 17) · Recarga 4 → 3 · Custo 2 → 1 <orbe> · Novo: <nova parte>. Nada escrito por deus.
function nlProxFrags(gm, sl, cur){
  const ab = nlAb(gm, sl);
  const degrau = (ab && ab.niveis || []).find(x => x && x.nv === cur + 1);
  if (!degrau) return [];
  const frags = []; let novoFeito = false;
  for (const m of (degrau.muda || [])){
    const c = m.caminho || '';
    if (/(^|\.)cd$/.test(c)) frags.push({ t: 'recarga', txt: `Recarga ${m.de} → ${m.para}` });
    else if (/^cost\./.test(c)){ const orb = c.slice(5); frags.push({ t: 'custo', txt: `Custo ${m.de} → ${m.para} ${orb === 'livre' ? 'livre' : orb}` }); }
    else if (/(\.v|\.hp|\.eff\.v)$/.test(c) || /\.posicional\[\d+\]$/.test(c)) frags.push({ t: 'num', txt: `${m.de} → ${m.para}` });
    else if (!novoFeito){ const nova = nlNovaParte(gm, sl, cur); if (nova){ frags.push({ t: 'novo', txt: 'Novo: ' + nova }); novoFeito = true; } }
  }
  const visto = new Set();
  return frags.filter(f => { const key = f.t + f.txt; if (visto.has(key)) return false; visto.add(key); return true; });
}
// tradução curta das recusas do servidor (subirNivel) p/ uma linha no painel.
function nlMotivoTexto(cod){
  switch (cod){
    case 'pontos_insuficientes': return 'Pontos insuficientes.';
    case 'nivel_maximo':         return 'Este slot já está no nível máximo.';
    case 'niveis_nao_liberados': return 'Os níveis deste deus ainda não foram liberados.';
    case 'nivel_inexistente':    return 'Este nível não existe para esta habilidade.';
    case 'nao_possui':           return 'Você ainda não tem este deus.';
    case 'slot_invalido':        return 'Habilidade inválida.';
    default:                     return 'Sem conexão com o servidor.';
  }
}

// §350b — ÍCONE PRÓPRIO dos PONTOS de deus: um SELO DOURADO com o símbolo de CÓPIA (dois quadros sobrepostos),
// distinto das moedas (Essência = gema azul ◈, Gema = roxa). Diz "cópias repetidas viram pontos". O MESMO ícone no
// topo dos Níveis, na sobreposição da Coleção e nos botões de subir.
function _pontoIcSVG(cls, st){
  return `<svg class="${cls || ''}"${st ? ` style="${st}"` : ''} viewBox="0 0 24 24" aria-hidden="true">`
    + `<path d="M12 1.6l9.2 5.2v10.4L12 22.4 2.8 17.2V6.8z" fill="#E9C25A" stroke="#7a5a16" stroke-width="1.1" stroke-linejoin="round"/>`
    + `<rect x="7" y="6.4" width="7.2" height="8.6" rx="1.4" fill="none" stroke="#5a3d0a" stroke-width="1.5"/>`
    + `<rect x="9.8" y="9" width="7.2" height="8.6" rx="1.4" fill="#FBE29A" stroke="#5a3d0a" stroke-width="1.5"/></svg>`;
}
const _nlbPtIc = () => _pontoIcSVG('nlb__pt', 'width:1.05em;height:1.05em;vertical-align:-.16em;display:inline-block;margin-right:.1em');
// §350b — concordância: "1 PONTO" / "N PONTOS" (e minúsculo p/ a frase da confirmação).
function _ptLabel(n, baixa){ const w = (n === 1 ? 'ponto' : 'pontos'); return `${n} ${baixa ? w : w.toUpperCase()}`; }
// §350b — no PRÓXIMO, destaca em dourado TODA palavra/número que MUDA em relação ao AGORA. A comparação é por
// PALAVRAS, via LCS (maior subsequência comum): o que não está na subsequência comum (números trocados, trecho novo
// inteiro) sai realçado; a pontuação de ponta é ignorada no casamento (ex.: "inimigo." = "inimigo;").
function _nlRealceDiff(agora, prox){
  const toks = s => String(s).match(/\s+|\S+/g) || [];              // palavras E espaços como tokens
  const norm = t => t.toLowerCase().replace(/^[^0-9a-zà-ú]+|[^0-9a-zà-ú]+$/gi, '');  // tira pontuação das pontas
  const A = toks(agora).filter(t => /\S/.test(t)).map(norm);        // palavras do AGORA
  const Pt = toks(prox);                                            // PRÓXIMO (com espaços)
  const Pw = Pt.filter(t => /\S/.test(t)).map(norm);               // palavras do PRÓXIMO
  const n = A.length, m = Pw.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    dp[i][j] = (A[i] === Pw[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const keep = new Set(); let i = 0, j = 0;
  while (i < n && j < m) {                                          // reconstrói o LCS: j's iguais NÃO realçam
    if (A[i] === Pw[j]) { keep.add(j); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
  }
  let jj = -1;
  return Pt.map(t => { if (!/\S/.test(t)) return t; jj++; return keep.has(jj) ? H(t) : `<b class="nl-hi">${H(t)}</b>`; }).join('');
}
function _nlLaurelSVG(){ return `<svg viewBox="0 0 120 44" aria-hidden="true"><g fill="none" stroke="#E9C25A" stroke-width="2.5" stroke-linecap="round"><path d="M34 38C18 36 9 28 7 14M34 38c-10-3-16-10-18-20M34 38c-6-4-10-9-11-16"/><path d="M86 38c16-2 25-10 27-24M86 38c10-3 16-10 18-20M86 38c6-4 10-9 11-16"/></g></svg>`; }
// um CARTÃO de habilidade (§350): cabeçalho (ícone·tipo·nome·Nv N de TOPO + bolinhas) · AGORA | PRÓXIMO · ação por estado.
function nlPainelHTML(k, gm, gmEf, sl, tipo, tem, online){
  const ab = (sl === 'defesa') ? (typeof DEFESA !== 'undefined' ? DEFESA : null) : nlAb(gm, sl);
  const abEf = (sl === 'defesa') ? ab : (nlAb(gmEf, sl) || ab);
  if (!ab) return '';
  const sem = nlSemEscada(ab), topo = nlTopo(ab);
  const cur = sem ? (sl === 'defesa' ? 1 : Math.min(nlNivel(k, sl), topo)) : Math.min(nlNivel(k, sl), topo);
  // cabeçalho: tipo + nome + (Nv N de TOPO + bolinhas, só quando TEM escada — §350)
  let pins = '';
  if (!sem){ const alc = (tem && online) ? nlAlcance(k, ab, cur) : cur;
    for (let i = 1; i <= topo; i++){ const cls = i <= cur ? 'on' : (i <= alc ? 'pode' : ''); pins += `<i class="nlpin ${cls}"></i>`; } }
  const nvbox = sem ? '' : `<div class="nlp__nvbox"><span class="nlp__nv">Nv ${cur} de ${topo}</span><span class="nlp__pins">${pins}</span></div>`;
  const cab = `<div class="nlp__cab">
      <span class="nlp__art">${slot('skill-' + k + '-' + sl, '', null, 0, false)}</span>
      <div class="nlp__id"><b class="nlp__tipo cin">${tipo}</b><span class="nlp__nome">${H(ab.nome || '—')}</span></div>${nvbox}
    </div>`;
  // §350b: a habilidade SEM níveis (ex.: Defesa) rotula "EFEITO", não "AGORA (Nv 1)".
  const agora = `<div class="nlp__cell"><span class="nlp__coll">${sem ? 'EFEITO' : `AGORA (Nv ${cur})`}</span><p class="nlp__txt">${realce(abEf.desc || '')}</p></div>`;
  let dir = '', acao = '';
  if (sem){
    acao = `<button class="nlb nlb--off" disabled>Esta habilidade não tem níveis.</button>`;
  } else if (cur >= topo){
    dir = `<div class="nlp__maxbox"><span class="nlp__maxic">${_nlLaurelSVG()}</span><span class="nlp__maxt">NÍVEL MÁXIMO<br>ALCANÇADO</span></div>`;
  } else {
    const descProx = (nlAbEf(gm, sl, cur + 1) || {}).desc || '';
    dir = `<div class="nlp__cell nlp__cell--px"><span class="nlp__coll nlp__coll--px">PRÓXIMO (Nv ${cur + 1})</span><p class="nlp__txt">${_nlRealceDiff(abEf.desc || '', descProx)}</p></div>`;
    const custo = nlCustoNivel(cur + 1), pts = nlPontos(k), falta = custo - pts;
    if (!tem){ acao = `<button class="nlb nlb--off" disabled>Você precisa ter o deus</button>`; }
    else if (nlConfirm === sl){
      acao = `<div class="nlp__conf"><span class="nlp__confq">Subir para Nv ${cur + 1} por ${_ptLabel(custo, true)}?</span><span class="nlp__confb"><button class="nlb nlb--go" data-subir-ok="${sl}" ${nlPendente ? 'disabled' : ''}>${nlPendente ? '…' : 'CONFIRMAR'}</button><button class="nlb nlb--quiet" data-subir-no="${sl}" ${nlPendente ? 'disabled' : ''}>CANCELAR</button></span></div>`;
    } else if (!online){ acao = `<button class="nlb nlb--off" disabled>Sem conexão com o servidor</button>`; }
    else { acao = pts >= custo
      // §358b: rótulo em 2 linhas centradas (não 4): "SUBIR P/ NV 3" + "◆ 2 pontos" (cabe no cartão estreito).
      ? `<button class="nlb nlb--go nlb--2l" data-subir="${sl}"><b>SUBIR P/ NV ${cur + 1}</b><span>${_nlbPtIc()}${_ptLabel(custo, true)}</span></button>`
      : `<button class="nlb nlb--off nlb--2l" disabled><b>${falta === 1 ? 'FALTA' : 'FALTAM'}</b><span>${_nlbPtIc()}${_ptLabel(falta, true)}</span></button>`; }   // §360: singular quando falta 1
  }
  const msg = (nlMsg && nlMsg.slot === sl) ? `<p class="nlp__erro">${H(nlMsg.texto)}</p>` : '';
  return `<div class="nlp nlp--${sem ? 'sem' : 'esc'}${nlConfirm === sl ? ' nlp--conf' : ''}" data-slot="${sl}">${cab}
    <div class="nlp__cols">${agora}${dir}</div>${acao ? `<div class="nlp__pe">${acao}</div>` : ''}${msg}</div>`;
}

async function _nlConfirmar(k, sl){
  if (nlPendente) return;                 // o servidor é a verdade — um pedido por vez (sem toque duplo)
  nlPendente = true; nlMsg = null; render();
  let r = null;
  try { if (typeof subirNivelServidor === 'function') r = await subirNivelServidor(k, sl); else r = { erro: 'sem servidor', codigo: 'sem_conexao' }; }
  catch (e) { r = { erro: (e && e.message) || 'falha', codigo: 'sem_conexao' }; }
  nlPendente = false; nlConfirm = null;
  nlMsg = (r && r.ok) ? null : { slot: sl, texto: nlMotivoTexto(r && r.codigo) };
  render();
}

// §321 — COMPONENTES reusáveis da visão de NÍVEIS. A tela §319 (rota 'niveis') E a sobreposição da Coleção
// (§321) os usam — "extrair em componente, não duplicar". Cada um lê o MESMO estado (contaAtual.niveis/pontos).
function nlTopoPtsHTML(k, g, tem){
  const pts = nlPontos(k);
  // §350b: ÍCONE PRÓPRIO de pontos (selo dourado com símbolo de cópia), distinto da gema azul da Essência.
  const ic = _pontoIcSVG('nltop__ic');
  return tem
    ? `<div class="nltop__pts">${ic}<span class="nltop__id"><span class="nltop__ptn">Pontos de ${H(g.nome)}: <b>${pts}</b></span>
       <span class="nltop__cop">cópias repetidas viram pontos</span></span></div>`
    : `<div class="nltop__pts nltop__pts--falta">${ic}<span class="nltop__ptn">Você ainda não tem este deus</span></div>`;
}
function nlPaineisHTML(k, gm, gmEf, tem, online){
  // §350: 4 cartões em grade 2×2 — a Defesa (universal, sem escada) entra como o 4º.
  return [['basico', 'BÁSICO'], ['habilidade', 'HABILIDADE'], ['milagre', 'MILAGRE'], ['defesa', 'DEFESA']]
    .map(([sl, tipo]) => nlPainelHTML(k, gm, gmEf, sl, tipo, tem, online)).join('');
}
// §358: nlRodapeHTML e colNiveisCorpoHTML (a visão de níveis DENTRO da sobreposição da Coleção) foram REMOVIDOS
// junto com a sobreposição — a tela de NÍVEIS (renderNiveis) é o único lugar de subir habilidade.

// §319c — a tela de NÍVEIS é ROTA PRÓPRIA ('niveis'); a rota 'deus' voltou a ser a FICHA (renderDeusDetalhe,
// restaurada). O "‹" daqui volta para a FICHA do deus (‹ <Nome>), não para a Coleção.
function renderNiveis(){
  const k = (paramsAtuais() || {}).key;
  const g = HRM[k] || { nome: k, elem: 'Umbra', faccao: '', classe: '', funcao: '' };
  // §271: os METADADOS vêm do data/deuses (a fonte do MOTOR). O roster (HRM) segue para nome/retrato.
  const gm = (typeof GODS !== 'undefined' && GODS[k]) || g;
  const gmEf = deusKitEfetivo(k, gm);     // §318: o kit EXIBIDO (Atual/custo/recarga) passa pelo kitEfetivo
  const tem = temDeus(k);
  const online = (typeof contaAtual !== 'undefined' && !!contaAtual);
  const rar = raridadeDe(k);
  if (nlSelKey !== k) { nlSelKey = k; nlConfirm = null; nlPendente = false; nlMsg = null; }   // troca de deus: zera a confirmação/erro
  const passiva = gm.passiva || g.passiva || null;
  const topoInfo = nlTopoPtsHTML(k, g, tem);           // §321: componente compartilhado com a sobreposição
  const painel = nlPaineisHTML(k, gm, gmEf, tem, online);
  const artImg = (typeof RETRATO_ARTE !== 'undefined' && RETRATO_ARTE[k]) ? `<img class="nlmed__g" src="retratos/${H(k)}.webp" alt="" loading="lazy" onerror="this.remove()">` : '';
  stage.innerHTML = `<div id="baselayer" class="nlfix2"><div id="nlfix" class="${tem ? '' : 'nlfix--falta'}">
    <header class="nlx-cab">
      <button class="dsxb dsxb--voltar" id="bvoltar">‹ ${H(g.nome)}</button>
      <h1 class="nlx-titulo cin">NÍVEIS DE HABILIDADE</h1>
      <div class="nlx-pts">${topoInfo}</div>
    </header>
    <aside class="nlx-esq">
      <div class="nlmed">${slot('god-' + k, ini(g.nome), tem ? COR(g.elem) : '#6a6390', 72)}${artImg}${tem ? '' : '<span class="nlmed__tag">NÃO POSSUI</span>'}
        <div class="nlmed__nome cin">${H(g.nome)}</div></div>
      <div class="nlid">
        <span class="nlid__rar rar--${rar}">${RAR_ROT[rar] || rar}</span>
        <span class="nlid__sub"><i class="nlid__ic">${_fichaIc('pant')}</i>${H(gm.faccao)} · ${orbe(gm.elem, 20)}${H(ELAB[gm.elem] || gm.elem)}</span>
      </div>
      ${passiva ? `<div class="nlpas">
        <span class="nlpas__rot">PASSIVA</span>
        <div class="nlpas__row"><span class="nlpas__art">${slot('skill-' + k + '-passiva', '', null, 0, false)}</span>
          <div class="nlpas__id"><b class="nlpas__nome">${H(passiva.nome || '—')}</b><p class="nlpas__txt">${realce(passiva.desc || '')}</p></div></div>
        <p class="nlpas__nota">A passiva não tem níveis.</p>
      </div>` : ''}
    </aside>
    <section class="nlx-dir">${painel}</section>
  </div></div>`;
  const v = stage.querySelector('#bvoltar');
  // §319c: o "‹" volta SEMPRE para a FICHA do deus. Se a ficha já está logo abaixo na pilha (veio da ficha →
  // SUBIR), desempilha (voltar); se veio direto (Coleção → "Subir níveis"), SUBSTITUI o topo pela ficha — assim
  // o "‹" da ficha depois volta à origem real (Coleção/home), sem empilhar deus/niveis em laço.
  if (v) v.onclick = () => {
    const abaixo = (typeof NAV !== 'undefined' && NAV.pilha.length >= 2) ? NAV.pilha[NAV.pilha.length - 2] : null;
    if (abaixo && abaixo.rota === 'deus' && abaixo.params && abaixo.params.key === k) voltar();
    else ir('deus', { key: k }, { substituir: true });
    render();
  };
  stage.querySelectorAll('[data-subir]').forEach(b => { b.onclick = () => { nlConfirm = b.dataset.subir; nlMsg = null; render(); }; });
  stage.querySelectorAll('[data-subir-no]').forEach(b => { b.onclick = () => { if (nlPendente) return; nlConfirm = null; render(); }; });
  stage.querySelectorAll('[data-subir-ok]').forEach(b => { b.onclick = () => _nlConfirmar(k, b.dataset.subirOk); });
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
let campEscolhaSel = null;                    // §268: opção selecionada num ato de escolha (antes de confirmar)
let campKitRev = null;                        // §268: chave do inimigo cujo kit revelado está aberto (overlay)

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
  let slots;
  if (ato.aliados == null) slots = [0, 1, 2].map(() => ({ deus: null, travado: false }));
  else slots = ato.aliados.map(a => typeof a === 'string' ? { deus: a, travado: true } : { deus: a.deus, travado: !!a.travado });
  // §268: consequência `emprestado` de um ato de escolha SEMEIA o default do 1º slot emprestado
  // (não trava — o jogador ainda troca; campSwap vence). Os aliados no DADO ficam intactos.
  const empr = emprestadoDaConsequencia(ato.id);
  if (empr) { const i = slots.findIndex(s => !s.travado); if (i >= 0) slots[i] = { deus: empr, travado: false, consequente: true }; }
  return slots;
}
function timeDoAto(ato){ return slotsDoAto(ato).map((s, i) => (campSwap[i] || s.deus)); }
// §268 — a CONSEQUÊNCIA no ato-alvo: varre os atos de escolha que apontam para `atoId` e, se o jogador
// já escolheu, resolve o resultado (certa|errada, ou o id da opção quando não há resposta certa) e
// devolve {efeito, revelacao}. Vocabulário fechado: emprestado|orbes|kitRevelado (a build recusa o resto).
function consequenciasNoAto(atoId){
  const esc = (perfil && perfil.campanha && perfil.campanha.escolhas) || {};
  const out = [];
  for (const cap of CAMPS()) for (const a of (cap.atos || [])) {
    if (a.tipo !== 'escolha' || a.alvo !== atoId) continue;
    const escolhido = esc[a.id]; if (escolhido == null) continue;
    const res = (a.certa != null) ? (escolhido === a.certa ? 'certa' : 'errada') : escolhido;
    out.push({ origem: a.id, res, efeito: (a.efeito && a.efeito[res]) || {}, revelacao: (a.revelacao && a.revelacao[res]) || null });
  }
  return out;
}
function emprestadoDaConsequencia(atoId){ for (const c of consequenciasNoAto(atoId)) if (c.efeito.emprestado) return c.efeito.emprestado; return null; }
function kitReveladoDaConsequencia(atoId){ const ks = []; for (const c of consequenciasNoAto(atoId)) if (c.efeito.kitRevelado) ks.push(c.efeito.kitRevelado); return ks; }
function revelacoesNoAto(atoId){ return consequenciasNoAto(atoId).map(c => c.revelacao).filter(Boolean); }
function escolhaFeita(atoId){ const esc = (perfil && perfil.campanha && perfil.campanha.escolhas) || {}; return esc[atoId]; }
function timeProntoAto(ato){ return timeDoAto(ato).filter(Boolean).length === 3; }

// §253: retrato de aliado. travado=cadeado (a cena, sem troca); emprestado=⇄ (abre o seletor).
function cslotHTML(s, i){
  const key = campSwap[i] || s.deus;
  if (!key) return `<button class="cslot cslot--vazio" data-empr="${i}"><span class="cslot__p">+</span><span class="cslot__nome">escolher</span></button>`;
  const m = metaComb(key);
  if (s.travado) return `<div class="cslot cslot--trav"><span class="cslot__p">${slot('god-' + key, ini(m.nome), COR(m.elem), 20)}</span><span class="cslot__badge cslot__lock">⚿</span><span class="cslot__nome">${H(m.nome)}</span></div>`;
  return `<button class="cslot cslot--empr" data-empr="${i}"><span class="cslot__p">${slot('god-' + key, ini(m.nome), COR(m.elem), 20)}</span><span class="cslot__badge cslot__swap">⇄</span><span class="cslot__nome">${H(m.nome)}</span></button>`;
}
// §262: a caixa cinim__nome (~51px) corta 7 de 12 nomes completos → mostra o `curto` (título = nome inteiro no hover).
function cinimHTML(k){ const m = metaComb(k); return `<div class="cinim" title="${H(m.nome)}"><span class="cinim__p">${slot('god-' + k, ini(m.nome), COR(m.elem), 20)}</span><span class="cinim__nome">${H(m.curto)}</span></div>`; }

// §268 — opção de um ato de escolha: disco de retrato quando a opção é personagem (`deus`), rótulo e PISTA.
// A pista é a evidência que o texto já deu; NÃO pode cortar (medida com fontes reais, §261). Estados:
// selecionada (antes de confirmar), escolhida (o ato já foi jogado — trava, sem volta), disponível.
function copcaoHTML(o, sel, feito){
  const escolhido = feito;                      // id da opção que o jogador confirmou (ou undefined)
  const marcada = escolhido != null ? o.id === escolhido : o.id === sel;
  const disco = o.deus
    ? slot('god-' + o.deus, ini(metaComb(o.deus).nome), COR(metaComb(o.deus).elem), 20)
    : `<span class="copc__mono">${H(ini(o.rotulo))}</span>`;
  const cls = ['copc', marcada ? 'copc--sel' : '', escolhido != null ? 'copc--trava' : ''].filter(Boolean).join(' ');
  return `<button class="${cls}" data-opc="${H(o.id)}" ${escolhido != null ? 'disabled' : ''}>
    <span class="copc__disco">${disco}</span>
    <span class="copc__corpo"><span class="copc__rot">${H(o.rotulo)}</span>${o.pista ? `<span class="copc__pista">${H(o.pista)}</span>` : ''}</span>
    <span class="copc__mark">${marcada ? '●' : '○'}</span>
  </button>`;
}
// §268 — kit revelado de um inimigo (consequência `kitRevelado`): um CHIP no briefing que abre o kit
// inteiro num overlay. O painel do ato tem altura fixa (290px, §262) — o kit não cabe inline sem
// cortar; o overlay mostra as 4 skills sem limite e o chip deixa claro que a leitura foi recompensada.
function kitRevChipHTML(k){ const m = metaComb(k);
  return `<button class="camp__kitchip" data-kitrev="${H(k)}"><span class="camp__kitchipp">${slot('god-' + k, ini(m.nome), COR(m.elem), 20)}</span>
    <span class="camp__kitchiptxt"><b>Kit revelado</b><span>${H(m.nome)} — ver as 4 habilidades</span></span><span class="camp__kitchipseta">›</span></button>`;
}
function campKitRevHTML(k){
  // §284-ajuste2: pela MESMA linha (kitLinhaHTML) e MESMA fonte (data/deuses via GODS) da sobreposição e da rota.
  const g = (typeof GODS !== 'undefined' && GODS[k]) || null; const m = metaComb(k);
  const rots = { basico: 'Básico', habilidade: 'Habilidade', milagre: 'Milagre', passiva: 'Passiva' };
  const linhas = deusSkills(g).filter(s => s.a).map(s => kitLinhaHTML(rots[s.slot] || s.tipo, s.a, s.slot === 'passiva')).join('');
  return `<div class="ov" id="campkitrevov"><div class="ovbox"><div class="ov__cab"><h2>Kit revelado — ${H(m.nome)}</h2><button class="b b--quiet b--md" id="kitrevx">Fechar</button></div>
    <div class="camp__kitrevlist">${linhas}</div></div></div>`;
}

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
  if (campVistaAto !== ato.id) { campSwap = {}; campEscolhaSel = null; campVistaAto = ato.id; }   // troca de ato zera empréstimos e seleção

  const feitosCap = atos.filter(a => atoFeito(a.id)).length;
  const ehBatalha = ato.tipo === 'batalha';
  const ehEscolha = ato.tipo === 'escolha';
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
    // §268: a CONSEQUÊNCIA de escolhas anteriores cai AQUI — a linha de revelação (o jogador liga a
    // linha ao efeito sozinho) e o kit revelado do inimigo. O empréstimo já entrou no slot (slotsDoAto).
    const revs = revelacoesNoAto(ato.id);
    const revBloco = revs.length ? `<div class="camp__revel">${revs.map(t => `<p class="camp__revell">“${H(t)}”</p>`).join('')}</div>` : '';
    const kitRevBloco = kitReveladoDaConsequencia(ato.id).map(kitRevChipHTML).join('');
    // §269: com DUAS leituras certas (2 revelações + 2 kits) o conteúdo passa dos 290px — o miolo ROLA
    // e a CTA fica ANCORADA embaixo (nunca sai de vista). Sem consequência, nada rola: idêntico ao de antes.
    brief = `<div class="camp__brief">
      <div class="camp__briefrol">
        ${revBloco}
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
        ${kitRevBloco}
        <div class="camp__divisor"></div>
        ${mec}${rec}
      </div>
      <button class="camp__cta" id="campcta" ${pronto ? '' : 'disabled'}><span class="camp__ctaseta"></span>${pronto ? (jaFeito ? 'Rejogar' : 'Jogar') : `Escolha seu time (${timeDoAto(ato).filter(Boolean).length}/3)`}</button>
    </div>`;
  } else if (ehEscolha) {
    // §268 — TELA DA ESCOLHA: pergunta + opções (retrato quando é personagem + pista que não corta).
    // Escolher seleciona; CONFIRMAR grava e avança — sem volta. O resultado NÃO se revela aqui (cai no alvo).
    const escolhido = escolhaFeita(ato.id);            // já jogado? mostra a opção travada
    const feito = atoFeito(ato.id);
    const podeConfirmar = escolhido != null || campEscolhaSel != null;
    const ctaLabel = escolhido != null ? 'Continuar' : 'Confirmar escolha';
    // §356: pergunta + opções no .camp__briefrol (rola se transbordar); a CTA fica FORA, ancorada embaixo.
    brief = `<div class="camp__brief camp__brief--escolha">
      <div class="camp__briefrol">
        <div class="camp__perg">${H(ato.pergunta)}</div>
        <div class="camp__opcoes">${(ato.opcoes || []).map(o => copcaoHTML(o, campEscolhaSel, escolhido)).join('')}</div>
      </div>
      <button class="camp__cta" id="campcta" ${podeConfirmar ? '' : 'disabled'}><span class="camp__ctaseta"></span>${ctaLabel}</button>
    </div>`;
    void feito;
  } else {
    // §356: miolo no .camp__briefrol (rola se transbordar); a CTA "Continuar" fica FORA, ancorada embaixo.
    brief = `<div class="camp__brief camp__brief--hist">
      <div class="camp__briefrol">
        <div class="camp__historn">✦</div>
        <p class="camp__histnota">Um trecho da história.</p>
      </div>
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
    // §268: o losango do nó distingue os TRÊS tipos de ato — batalha (losango cheio, o default),
    // história (anel vazado) e escolha (bifurcação ‹). Sem rótulo escrito (o nó é pequeno); o SINAL
    // é a forma. `cnode--t-<tipo>` carrega a classe e um data-attr para o teste medir.
    const tipo = a.tipo || 'batalha';
    return `<button class="cnode cnode--${est} cnode--t-${tipo} ${atual ? 'cnode--atual' : ''}" data-ato="${i}" data-tipo="${tipo}" ${est === 'travado' ? 'disabled' : ''}>
      <span class="cnode__d">${est === 'travado' ? '<span class="cnode__lock">⚿</span>' : `<span class="cnode__num">${ic}</span>`}</span>
      <span class="cnode__nome">${H(a.nome)}</span></button>`;
  }).join('');

  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="camp ${ehBatalha ? '' : ehEscolha ? 'camp--escolha' : 'camp--historia'}">
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
  ${campKitRev != null ? campKitRevHTML(campKitRev) : ''}
  </div>`;

  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  const bp = stage.querySelector('#capprev'); if (bp) bp.onclick = () => { campCapIdx--; campAtoIdx = atoAtualIdx(campCapIdx); campSwap = {}; campVistaAto = null; render(); };
  const bn = stage.querySelector('#capnext'); if (bn) bn.onclick = () => { campCapIdx++; campAtoIdx = atoAtualIdx(campCapIdx); campSwap = {}; campVistaAto = null; render(); };
  [...stage.querySelectorAll('.cnode[data-ato]')].forEach(b => { if (b.disabled) return; b.onclick = () => { campAtoIdx = +b.dataset.ato; render(); }; });
  [...stage.querySelectorAll('.cslot[data-empr]')].forEach(b => { b.onclick = () => { campPicker = +b.dataset.empr; render(); }; });
  [...stage.querySelectorAll('.copc[data-opc]')].forEach(b => { b.onclick = () => { campEscolhaSel = b.dataset.opc; render(); }; });   // §268: seleciona (não confirma)
  [...stage.querySelectorAll('[data-kitrev]')].forEach(b => { b.onclick = () => { campKitRev = b.dataset.kitrev; render(); }; });     // §268: abre o kit revelado
  const kx = stage.querySelector('#kitrevx'); if (kx) kx.onclick = () => { campKitRev = null; render(); };
  const cta = stage.querySelector('#campcta');
  if (cta && !cta.disabled) cta.onclick = () => {
    if (ehBatalha) iniciarAto(cap, ato);
    else if (ehEscolha) avancarEscolha(cap, ato);
    else avancarHistoria();
  };
  fit();
  if (campPicker != null) _campTrocaMontar(); else _campTrocaFechar();   // §344: o seletor de troca usa a grade do montador (painel por cima)
}

function numeroRomano(n){ return ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || String(n); }

// seletor de troca do slot emprestado: os deuses que o jogador TEM (com kit). Sem saída morta (§210):
// se não tem nenhum, a mensagem explica e ele joga com o emprestado default.
// §344: o seletor de TROCA do deus emprestado usa a MESMA grade do montador, num painel por cima da campanha.
// Vive num host no #viewport (FORA do #stage, que é escalado para o design fluido da campanha) e se escala a 1846
// por conta própria — reusa _montGradeSecHTML/_montLigarGrade. Fecha e grava campSwap[campPicker].
function _campTrocaFechar(){ const h = document.getElementById('dmtroca-host'); if (h) h.remove(); try { document.body.classList.remove('emmontar'); } catch (e) {} }
function _campTrocaMontar(){
  const vp = document.getElementById('viewport') || document.body;
  let host = document.getElementById('dmtroca-host');
  if (!host) { host = document.createElement('div'); host.id = 'dmtroca-host'; vp.appendChild(host); }
  const trocar = k => { campSwap[campPicker] = k; campPicker = null; montKitAberto = null; _campTrocaFechar(); render(); };
  const gcfg = { pick: [], selNum: () => 0, _off: {}, gradeFull: true,
    onTap: trocar, kitLabel: k => ({ txt: 'ESCOLHER ' + ((HRM[k] || {}).nome || '').toUpperCase() }), onKitAcao: trocar };
  host.innerHTML = `<div class="dm-troca-ov" id="dmtrocaov"><div id="dommontar" class="dm-troca">
    <button class="dm-troca-x" id="dmtrocax" data-troca-x="1" aria-label="Fechar sem trocar">✕</button>
    <div class="dm-cabid"><h1 class="dm-titulo cin">TROCAR O DEUS EMPRESTADO</h1><span class="dm-sub">Escolha um deus seu para esta vaga</span></div>
    ${_montGradeSecHTML(gcfg)}
    ${montKitAberto ? _montKitPanelHTML(montKitAberto, gcfg) : ''}
  </div></div>`;
  try { document.body.classList.add('emmontar'); } catch (e) {}
  const inner = host.querySelector('#dommontar'); if (inner) { const s = Math.min((window.innerWidth || 780) / 780, (window.innerHeight || 360) / 360); inner.style.transform = 'translate(-50%,-50%) scale(' + s + ')'; }   // §359: canvas 780×360
  _montLigarGrade(host, gcfg);
  const x = host.querySelector('[data-troca-x]'); if (x) x.onclick = () => { campPicker = null; montKitAberto = null; _campTrocaFechar(); render(); };
  const ov = host.querySelector('#dmtrocaov'); if (ov) ov.onclick = ev => { if (ev.target === ov) { campPicker = null; montKitAberto = null; _campTrocaFechar(); render(); } };
}

// entrada de uma batalha: monta o time (travado + emprestado resolvido) e reusa a máquina de Provação.
function iniciarAto(cap, ato){
  const time = timeDoAto(ato).filter(Boolean);
  if (time.length !== 3) return;
  prova = null; provaFim = null;
  campanha = Object.assign({}, ato, { aliados: time, _capNome: cap.nome, _capIdx: campCapIdx, _atoIdx: campAtoIdx });   // §333: _atoIdx p/ a linha curta "CAMPANHA · CAP. N · ATO <roman>"
  campanhaFim = null;
  st = montarPvEComNiveis(campanha, time);   // §323 P2
  if (typeof REPLAY !== 'undefined') REPLAY.iniciar({ modo: 'campanha', atoId: ato.id, aliados: time });   // §318 F2 E2
  if (typeof definirIaVersao === 'function') definirIaVersao(iaVersaoDeModo('campanha'));   // §322 P3
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
// §268 — ato de ESCOLHA: grava a opção (se ainda não gravada), marca visto e avança. NÃO abre luta,
// NÃO paga. A opção confirmada é definitiva (sem volta); revisitar o ato mostra a escolha travada.
function avancarEscolha(cap, ato){
  if (!perfil.campanha) perfil.campanha = { capitulo: 0, fase: 0, concluidas: [], escolhas: {} };
  if (!Array.isArray(perfil.campanha.concluidas)) perfil.campanha.concluidas = [];
  if (!perfil.campanha.escolhas || typeof perfil.campanha.escolhas !== 'object') perfil.campanha.escolhas = {};
  if (perfil.campanha.escolhas[ato.id] == null && campEscolhaSel != null) perfil.campanha.escolhas[ato.id] = campEscolhaSel;
  if (!atoFeito(ato.id) && perfil.campanha.escolhas[ato.id] != null) {
    perfil.campanha.concluidas.push(ato.id);
    const res = salvar(perfil); if (res && !res.ok) {/* silencioso: escolha grava em concluidas/escolhas, sem estado crítico */}
  }
  campEscolhaSel = null;
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
  st = montarPvEComNiveis(campanha, time);     // §323 P2 (reusa a máquina: só usa aliados/inimigos/montar)
  if (typeof REPLAY !== 'undefined') REPLAY.iniciar({ modo: 'campanha', atoId: enc.id, aliados: time });   // §318 F2 E2
  if (typeof definirIaVersao === 'function') definirIaVersao(iaVersaoDeModo('campanha'));   // §322 P3
  vsCPU = true;
  ir('batalha', {}, { substituir: true });
  render();
}

/* ---------- montar time (o encontro "escolha de time") ---------- */
// §344: contexto de ENCONTRO (nome + dica + inimigos em miniaturas) — Campanha e (variação) Composição.
function _encContextoHTML(enc, rot){
  const inim = enc.inimigos || [];
  const mini = k => { const m = (typeof metaComb === 'function') ? metaComb(k) : (HRM[k] || { nome: k, elem: 'Umbra' });   // §344: bestiário usa o nome CURTO
    return `<span class="dm-ini"><span class="dm-ini__p">${slot('god-' + k, ini(m.nome || k), COR(m.elem), 18)}</span><span class="dm-ini__n">${H(m.curto || m.nome || k)}</span></span>`; };
  return `<h2 class="dm-ctx__t cin">${H(enc.nome || '')}</h2>
    ${enc.ensina && enc.ensina.dica ? `<p class="dm-ctx__dica">${H(enc.ensina.dica)}</p>` : ''}
    ${inim.length ? `<div class="dm-ctx__rot">${H(rot || 'INIMIGOS DO ENCONTRO')}</div>
      <div class="dm-ctx__inis">${inim.slice(0, 4).map(mini).join('')}${inim.length > 4 ? `<span class="dm-ini dm-ini--mais"><span class="dm-ini__p dm-ini__p--mais">+${inim.length - 4}</span></span>` : ''}</div>` : ''}`;
}
function renderMontarTime(){
  const id = (paramsAtuais() || {}).id;
  const enc = campEncontros().find(e => e.id === id) || {};
  const m = /c(\d+)e(\d+)/.exec(id || ''), cap = m ? +m[1] : 1, ato = m ? +m[2] : 1;
  const cfg = {
    id: 'campanha', pick: campTimePick,
    titulo: 'MONTE SEU TIME',
    sublinha: `CAMPANHA · CAP. ${cap} · ATO ${romanoCap(ato)}`,
    contextoHTML: _encContextoHTML(enc),
    vagas: [{ tipo: 'livre' }, { tipo: 'livre' }, { tipo: 'livre' }],
    validar: (t) => { const n = t.filter(Boolean).length; return { ok: n === 3, motivo: n === 3 ? '' : `Escolha mais ${3 - n} deus${3 - n > 1 ? 'es' : ''}.` }; },
    textoBotao: 'COMEÇAR',
    aoComecar: (t) => { const enc2 = campEncontros().find(e => e.id === id); iniciarEncontroComTime(enc2, t.slice()); },
    aoVoltar: () => { montKitAberto = null; if (!voltar()) ir('campanha', {}, { substituir: true }); render(); },
  };
  stage.innerHTML = montadorTimeHTML(cfg);
  ligarMontadorTime(cfg);
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
  else if (typeof REPLAY !== 'undefined') REPLAY.descartar();   // §318 F2 E2: derrota não envia replay
}
// F4 — SANDBOX (Batalha CPU): ao FIM de uma batalha PLANA (sem prova/campanha) contra a CPU,
// se o humano (lado 0) venceu, credita a recompensa simbólica com TETO diário. Latch em st
// (fresco a cada partida — sem global a resetar). Empate/derrota/hotseat: st._sandbox=null.
// NÃO avança missão nem ranque (não existem ainda); pode avançar maestria (cosmética, §212).
function atualizarSandbox(){
  if (!st || !st.fim || st._sandbox !== undefined) return;   // uma vez por partida
  if (!vsCPU || st.fim.resultado !== 'vitoria' || st.fim.lado !== 0) { st._sandbox = null; if (typeof REPLAY !== 'undefined') REPLAY.descartar(); return; }
  creditarMaestria();   // sandbox pode avançar maestria (cosmética) — decisão do dono
  const econ = (typeof ECONOMIA !== 'undefined' && ECONOMIA.sandbox) ? ECONOMIA.sandbox : null;
  const gemaV = (econ && econ.recompensas && econ.recompensas.vitoria) ? (econ.recompensas.vitoria.gema || 0) : 0;
  const teto = econ ? (econ.tetoDia || 0) : 0;
  // §318 F2 E2 — a economia é do SERVIDOR: NÃO credita Gema local. Envia o replay; o servidor credita (teto
  // 5/dia no relógio DELE) e devolve o saldo. `enviado` marca a exibição do overlay (recompensa em confirmação).
  st._sandbox = { creditou: false, gema: gemaV, vitoriasHoje: null, teto: teto, enviado: true };
  const res = salvar(perfil);   // persiste só a maestria cosmética (borda local)
  if (res && !res.ok && st) st.log.push({ turno: st.turno, msg: '⚠ vitória, mas a gravação local falhou: ' + res.erro });
  if (typeof REPLAY !== 'undefined') REPLAY.concluir();
}
function concluirEncontro(enc){
  if (!perfil) return;
  if (!perfil.campanha) perfil.campanha = { capitulo: 0, fase: 0, concluidas: [] };
  if (!Array.isArray(perfil.campanha.concluidas)) perfil.campanha.concluidas = [];
  const jaFeito = perfil.campanha.concluidas.includes(enc.id);
  const r = recompensaDe(enc.recompensa) || {};
  // §318 F2 E2 — a economia é do SERVIDOR: NÃO credita moeda local. Marca o progresso (UI) e ENVIA o replay;
  // o servidor re-simula e credita só a 1ª vitória de cada encontro. O saldo volta do servidor (pveCreditado).
  if (!jaFeito) {
    perfil.campanha.concluidas.push(enc.id);
    perfil.campanha.capitulo = Math.max(perfil.campanha.capitulo || 0, (typeof CAMPANHA !== 'undefined' && CAMPANHA) ? CAMPANHA.capitulo : 1);
    const res = salvar(perfil);
    if (res && !res.ok && st) st.log.push({ turno: st.turno, msg: '⚠ vitória, mas a gravação local falhou: ' + res.erro });
  }
  if (typeof REPLAY !== 'undefined') REPLAY.concluir();   // envia o replay (crédito autoritativo no servidor)
  campanhaFim.jaFeito = jaFeito;
  campanhaFim.recompensa = jaFeito ? null : r;   // exibição: o valor que o servidor confirma na 1ª vez (re-jogar não paga)
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
      ${venceu
        ? `<button class="b b--quiet b--md" id="cfvoltar">Voltar à campanha</button>${prox ? '<button class="b b--primary b--md" id="cfprox">Próximo ato</button>' : ''}`
        : `<button class="b b--quiet b--md" id="cfvoltarato">Voltar ao ato</button><button class="b b--primary b--md" id="cftentar">Tentar de novo</button>`}
    </div>
  </div></div></div>`;
}
function ligarCampanhaFim(){
  const q = s => stage.querySelector(s);
  const v = q('#cfvoltar'); if (v) v.onclick = () => { sairCampanha(); ir('campanha', {}, { substituir: true }); render(); };
  // §255: "Tentar de novo" remonta a MESMA semente e o MESMO time (campanha.aliados já traz a troca do
  // jogador). Semente estável de propósito — o ato é um quebra-cabeça que se aprende, não se rola de novo.
  const t = q('#cftentar'); if (t) t.onclick = () => { campanhaFim = null; st = montarPvEComNiveis(campanha, campanha && campanha.aliados); if (typeof definirIaVersao === 'function') definirIaVersao(iaVersaoDeModo('campanha')); ir('batalha', {}, { substituir: true }); render(); };
  // §255: "Voltar ao ato" — volta à tela do ato PERDIDO como ato ATUAL, SEM resetar campSwap/campVistaAto,
  // então o time que o jogador montou sobrevive e segue trocável (a promessa do §252 vale na derrota).
  const vt = q('#cfvoltarato'); if (vt) vt.onclick = () => voltarAoAto();
  const p = q('#cfprox'); if (p) { const prox = proximoAtoDepois(); p.onclick = () => { sairCampanha(); if (prox) { campCapIdx = prox.cap; campAtoIdx = prox.ato; campSwap = {}; campVistaAto = null; } ir('campanha', {}, { substituir: true }); render(); }; }
}
// §255: volta da sobreposição de fim de ato para a TELA DO ATO, com o ato como ATUAL e a troca do
// jogador preservada (não mexe em campSwap/campVistaAto). Usado pelo botão "Voltar ao ato" E pelo
// VOLTAR do Android (§240) — a sobreposição fecha para o ato, nunca fecha o app no meio da campanha.
function voltarAoAto(){
  if (!campanha) { sairCampanha(); ir('campanha', {}, { substituir: true }); render(); return; }
  const ci = campanha._capIdx, id = campanha.id;
  const ai = (CAMPS()[ci] ? CAMPS()[ci].atos : []).findIndex(a => a.id === id);
  sairCampanha();
  if (ci != null && ai >= 0) { campCapIdx = ci; campAtoIdx = ai; }   // NÃO mexe em campSwap nem campVistaAto → a troca persiste
  ir('campanha', {}, { substituir: true }); render();
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
  st = montarPvEComNiveis(p, p.aliados);   // §323 P2
  if (typeof REPLAY !== 'undefined') REPLAY.iniciar({ modo: 'semanal' });   // §318 F2 E2 (o servidor escolhe o puzzle pela SUA semana)
  if (typeof definirIaVersao === 'function') definirIaVersao(iaVersaoDeModo('semanal'));   // §322 P3
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
// §350 — MAESTRIA no visual do dono: posto · v/30, barra dourada com marcas em 5/15/30, nota "Mestre aos 30".
function maestriaDetalheHTML(key){
  const m = maestriaDe(key), v = m.vitorias || 0, nv = nivelMaestria(key);
  const alvo = MAESTRIA_LIMIAR.mestre;   // 30
  const posto = (nv >= 1) ? MAESTRIA_NOME[nv] : 'Noviço';
  const pct = Math.max(0, Math.min(100, Math.round(v / alvo * 100)));
  const marcas = [MAESTRIA_LIMIAR.aprendiz, MAESTRIA_LIMIAR.adepto, MAESTRIA_LIMIAR.mestre]
    .map(x => `<span class="dmaes__mk" style="left:${(x / alvo * 100).toFixed(2)}%"><i></i><em>${x}</em></span>`).join('');
  return `<div class="dmaes">
    <div class="dmaes__top"><span class="dmaes__rot">MAESTRIA</span><span class="dmaes__hint">Mestre aos ${alvo} = moldura dourada no retrato</span></div>
    <div class="dmaes__nv">${H(posto)} · <b>${Math.min(v, alvo)}/${alvo}</b>${m.milagre ? ' · Milagre ✓' : ''}</div>
    <div class="dmaes__rail"><i class="dmaes__fill" style="width:${pct}%"></i>${marcas}</div>
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

// §351 — ÍCONE da regra de composição (SVG simples, dourado): uma orbe (mesmo elemento), três iguais (mesma função),
// um templo (mesmo panteão), três formas diferentes (funções distintas), uma estrela (livre).
function _cmpIcSVG(regra){
  const C = '#C9A44C';
  switch (regra){
    case 'monoElemento':    return `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="12" fill="${C}" opacity=".85"/><circle cx="24" cy="24" r="12" fill="none" stroke="#F0D79A" stroke-width="2.4"/><circle cx="20" cy="20" r="3.5" fill="#FBE29A" opacity=".8"/></svg>`;
    case 'mesmaFuncao':     return `<svg viewBox="0 0 48 48" fill="${C}" aria-hidden="true"><circle cx="12" cy="24" r="6.5"/><circle cx="24" cy="24" r="6.5"/><circle cx="36" cy="24" r="6.5"/></svg>`;
    case 'monoPanteao':     return `<svg viewBox="0 0 48 48" fill="none" stroke="${C}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 18l16-9 16 9"/><path d="M12 18v18M24 18v18M36 18v18"/><path d="M7 38h34"/></svg>`;
    case 'funcoesDistintas':return `<svg viewBox="0 0 48 48" fill="${C}" aria-hidden="true"><circle cx="11" cy="27" r="6.5"/><rect x="18" y="20.5" width="13" height="13" rx="1.5"/><path d="M40 18l6.5 15h-13z"/></svg>`;
    default:                return `<svg viewBox="0 0 48 48" fill="none" stroke="${C}" stroke-width="3" stroke-linejoin="round" aria-hidden="true"><path d="M24 7l5.2 11.2L41 19.6l-8.5 8.1L34.6 40 24 33.9 13.4 40l2.1-12.3L7 19.6l11.8-1.4z" fill="${C}" fill-opacity=".15"/></svg>`;
  }
}
// §351 — miniaturas dos INIMIGOS (nomes do bestiário via metaComb, nome CURTO, sem quebrar palavra — §344b): até 4 + "+N".
function _cmpFoesHTML(inim){
  const list = inim || []; if (!list.length) return '';
  const show = list.slice(0, 4), extra = list.length - show.length;
  const minis = show.map(k => { const m = metaComb(k);
    return `<span class="cmp-foe" title="${H(m.nome)}"><span class="cmp-foe__p">${slot('god-' + k, ini(m.nome), COR(m.elem), 20)}</span><span class="cmp-foe__n" data-clamp="ok">${H(m.curto || m.nome)}</span></span>`; }).join('');
  const more = extra > 0 ? `<span class="cmp-foe cmp-foe--more">+${extra}</span>` : '';
  return `<div class="cmp-card__foes"><span class="cmp-card__foeslab">Inimigos</span><span class="cmp-foes">${minis}${more}</span></div>`;
}
function cardDesafioHTML(dsf){
  const feito = desafioFeito(dsf.id);
  const r = recompensaDesafio(dsf.recompensa);
  const acao = feito
    ? `<button class="cmpb cmpb--quiet" data-desafio="${dsf.id}">JOGAR DE NOVO</button>`
    : `<button class="cmpb cmpb--primary" data-desafio="${dsf.id}">JOGAR</button>`;
  return `<div class="cmp-card${feito ? ' cmp-card--feito' : ''}" data-card="${dsf.id}">
    ${feito ? '<span class="cmp-card__selo" aria-hidden="true">✓</span>' : ''}
    <div class="cmp-card__top">
      <span class="cmp-card__ic">${_cmpIcSVG(dsf.regra)}</span>
      <div class="cmp-card__id"><b class="cmp-card__n cin">${H(dsf.nome)}</b><span class="cmp-card__regra">${H(dsf.regraTexto || '')}</span></div>
    </div>
    ${_cmpFoesHTML(dsf.inimigos)}
    <div class="cmp-card__pe">
      <span class="cmp-card__left">${r.essencia ? `<span class="cmp-card__rec">${r.essencia} ✦</span>` : ''}${feito ? '<span class="cmp-card__won">✓ Vencido</span>' : ''}</span>
      ${acao}
    </div>
  </div>`;
}
function renderDesafios(){
  const lista = desafios();
  const feitos = lista.filter(d => desafioFeito(d.id)).length;
  const pct = lista.length ? Math.round(feitos / lista.length * 100) : 0;
  stage.innerHTML = `<div id="baselayer" class="cmp2"><div id="compfix">
    <header class="cmp-cab">
      <button class="cmpb cmpb--voltar" id="bvoltar">‹ DESAFIOS</button>
      <h1 class="cmp-titulo cin">DESAFIOS DE COMPOSIÇÃO</h1>
      <span class="cmp-prog">
        <span class="cmp-prog__n">${feitos} de ${lista.length} cumpridos</span>
        <span class="cmp-prog__bar"><i style="width:${pct}%"></i></span>
      </span>
    </header>
    <p class="cmp-intro">Você monta o time; o jogo testa se sabe montá-lo. A recompensa é leve — o valor é o quebra-cabeça.</p>
    <div class="cmp-grade" id="cmpgrade">${lista.map(cardDesafioHTML).join('')}</div>
  </div></div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('desafios', {}, { substituir: true }); render(); };   // §213: volta ao hub
  [...stage.querySelectorAll('[data-desafio]')].forEach(b => {
    b.onclick = () => { desafioTimePick = []; ir('desafiomontar', { id: b.dataset.desafio }); render(); };
  });
  fit();
}

// ===================================================================
// §352 — GUIA VISUAL / FOLHA DE COMPONENTES (rota interna 'guia', NÃO ligada a nenhuma tela do jogo).
// Renderiza cada componente do padrão (docs/guia-visual.md) com o CSS e as FUNÇÕES REAIS do jogo, em cada estado,
// na tela fixa 1846×852. Página de desenvolvimento: existe para o documento e a folha não divergirem (prova §352).
// Cada "tile" leva data-comp="<id>"; a prova confere que todo id listado no documento aparece aqui, e vice-versa.
// Os seletores com escopo de tela (#dommontar/#desafios/#compfix/#deusfix/#nlfix) valem via ancestrais display:contents.
// ===================================================================
const GUIA_COMPONENTES = [
  'botao-primario', 'botao-secundario', 'pilula', 'card-montador', 'painel', 'orbe', 'selo-raridade',
  'selo-nivel', 'gratis', 'barra-progresso', 'barra-vida', 'aviso-toast', 'confirmacao-inline',
  'estado-vazio', 'icone-pontos', 'trilha-niveis',
];
function _guiaTile(id, label, sel, demo, grande){
  return `<section class="guia-tile${grande ? ' guia-tile--g' : ''}" data-comp="${id}">
    <div class="guia-tile__h"><span class="guia-tile__lab">${H(label)}</span><code class="guia-tile__sel">${H(sel)}</code></div>
    <div class="guia-tile__demo">${demo}</div>
  </section>`;
}
function renderGuia(){
  const G = (typeof GODS !== 'undefined' && GODS) || {};
  const efz = (typeof deusKitEfetivo === 'function' && G.zeus) ? deusKitEfetivo('zeus', G.zeus) : (G.zeus || null);
  const T = [];
  T.push(_guiaTile('botao-primario', 'Botão primário (dourado)', '.cmpb--primary / .b--primary',
    `<button class="cmpb cmpb--primary">JOGAR</button>`));
  T.push(_guiaTile('botao-secundario', 'Botão secundário', '.cmpb--quiet / .b--sec',
    `<button class="cmpb cmpb--quiet">JOGAR DE NOVO</button>`));
  T.push(_guiaTile('pilula', 'Pílula / filtro (normal · selecionada)', '.df-chip · .df-chip.is-on',
    `<span class="df-chip">Todas <b>6</b></span> <span class="df-chip is-on">Conquistadas <b>2</b></span>`));
  T.push(_guiaTile('selo-raridade', 'Selo de raridade', '.dsx-rar.rar--SS|S|A',
    `<span class="dsx-rar rar--SS">SS</span> <span class="dsx-rar rar--S">S</span> <span class="dsx-rar rar--A">A</span>`));
  T.push(_guiaTile('selo-nivel', 'Selo de nível "Nv N"', '.dsk__nv (só habilidade com escada)',
    `<span class="guia-dsk" style="position:relative;display:inline-block;width:120px;height:92px;border-radius:14px;background:#0C1020;box-shadow:inset 0 0 0 1.5px rgba(201,164,76,.3)"><span class="dsk__nv">Nv 3</span></span>`));
  T.push(_guiaTile('gratis', 'Custo GRÁTIS', '.dmk-ab__gratis / .cost__gratis',
    `<span class="ddet__cost">${(typeof _montCustoHTML === 'function') ? _montCustoHTML({}) : '<span class="dmk-ab__gratis">GRÁTIS</span>'}</span>`));
  T.push(_guiaTile('orbe', 'Orbe de elemento (halo ≥14 · _min <14)', 'orbe(elem, px)',
    (typeof orbe === 'function'
      ? `<span class="guia-orbes">${['Chama', 'Tempestade', 'Verdejante', 'Aurora', 'Umbra', 'Maré', 'livre'].map(e => orbe(e, 40)).join('')}</span>
         <span class="guia-orbes" style="margin-top:14px">${['Chama', 'Tempestade', 'Verdejante'].map(e => orbe(e, 12)).join('')} <small style="color:#7d78a0;font-size:18px">_min &lt;14px</small></span>`
      : '')));
  T.push(_guiaTile('icone-pontos', 'Ícone de pontos (selo dourado de cópia)', '_pontoIcSVG() · nltop__ic',
    (typeof nlTopoPtsHTML === 'function') ? nlTopoPtsHTML('zeus', { nome: 'Zeus' }, true) : ''));
  T.push(_guiaTile('barra-progresso', 'Barra de progresso', '.cmp-prog__bar / .dmaes__rail',
    `<span class="cmp-prog__bar" style="width:320px"><i style="width:62%"></i></span>`));
  T.push(_guiaTile('barra-vida', 'Barra de vida', '.hp / .hp__fill (verde ok · âmbar baixo)',
    `<div class="hp" style="position:relative;width:240px;height:22px;border-radius:5px;overflow:hidden"><div class="hp__fill" style="width:62%"></div><div class="hp__label" style="font-size:14px">62/100</div></div>
     <div class="hp hp--warn" style="position:relative;width:240px;height:22px;border-radius:5px;overflow:hidden;margin-top:12px"><div class="hp__fill" style="width:24%"></div><div class="hp__label" style="font-size:14px">24/100</div></div>`));
  T.push(_guiaTile('aviso-toast', 'Aviso (toast)', 'toast() → .df-toast',
    `<span class="df-toast" style="position:static;transform:none;display:inline-flex"><span class="df-toast__ic">!</span><span class="df-toast__msg">Sem conexão com o servidor.</span><button class="df-toast__x" aria-label="fechar">✕</button></span>`));
  T.push(_guiaTile('estado-vazio', 'Estado vazio', '.df-vazio / .dm-vazio',
    `<p class="df-vazio" style="position:static">Nenhum deus neste filtro.</p>`));
  T.push(_guiaTile('painel', 'Painel / bloco (ex.: Maestria)', '.dmaes / bloco com rótulo',
    (typeof maestriaDetalheHTML === 'function') ? maestriaDetalheHTML('zeus') : '', true));
  T.push(_guiaTile('confirmacao-inline', 'Confirmação inline (no cartão)', '.nlp__conf',
    `<div class="nlp__conf"><span class="nlp__confq">Subir para Nv 2 por 1 ponto?</span><span class="nlp__confb"><button class="nlb nlb--go">CONFIRMAR</button><button class="nlb nlb--quiet">CANCELAR</button></span></div>`, true));
  T.push(_guiaTile('card-montador', 'Cartão de deus do montador (estados)', '_montCardHTML(k, cfg)',
    (typeof _montCardHTML === 'function')
      ? `<div class="guia-cards">${_montCardHTML('zeus', { pick: [] })}${_montCardHTML('ogum', { pick: ['ogum'], selNum: k => k === 'ogum' ? 1 : 0 })}${_montCardHTML('tyr', { pick: [], _off: { tyr: 'Outro elemento' } })}</div>`
      : '', true));
  T.push(_guiaTile('trilha-niveis', 'Trilha de níveis (cartão de habilidade)', 'nlPainelHTML(...) · .nlp',
    (typeof nlPainelHTML === 'function' && efz) ? nlPainelHTML('zeus', G.zeus, efz, 'milagre', 'MILAGRE', true, true) : '', true));

  stage.innerHTML = `<div id="baselayer" class="guia2"><div id="guiafix">
    <header class="guia-cab">
      <button class="cmpb cmpb--voltar" id="bvoltar">‹ VOLTAR</button>
      <h1 class="guia-titulo cin">GUIA VISUAL · FOLHA DE COMPONENTES</h1>
      <span class="guia-sub">componentes reais do INCURSION</span>
    </header>
    <div class="guia-grade" id="guiagrade">
      <span id="dommontar" style="display:contents"><span id="desafios" style="display:contents"><span id="compfix" style="display:contents"><span id="deusfix" style="display:contents"><span id="nlfix" style="display:contents">
        ${T.join('')}
      </span></span></span></span></span>
    </div>
  </div></div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  fit();
}

// §344: quais deuses VIOLAM a regra dado o pick atual → cartão apagado + motivo curto, não selecionável.
function _regraPorDeus(regra, pick){
  const off = {}; if (!pick.length || regra === 'livre') return off;
  const ps = pick.map(k => HRM[k]).filter(Boolean);
  const checa = {
    monoElemento: g => g.elem !== ps[0].elem ? 'Outro elemento' : null,
    mesmaFuncao: g => g.funcao !== ps[0].funcao ? 'Outra função' : null,
    monoPanteao: g => g.faccao !== ps[0].faccao ? 'Outro panteão' : null,
    funcoesDistintas: g => ps.some(p => p.funcao === g.funcao) ? 'Função repetida' : null,
  }[regra];
  if (!checa) return off;
  _montJogaveis().forEach(k => { if (pick.includes(k)) return; const g = HRM[k]; if (!g) return; const mv = checa(g); if (mv) off[k] = mv; });
  return off;
}
function _desafioContextoHTML(dsf){
  const v = validarRegra(dsf.regra, desafioTimePick.filter(Boolean));
  const inim = dsf.inimigos || [];
  const mini = k => { const m = (typeof metaComb === 'function') ? metaComb(k) : (HRM[k] || { nome: k, elem: 'Umbra' });
    return `<span class="dm-ini"><span class="dm-ini__p">${slot('god-' + k, ini(m.nome || k), COR(m.elem), 18)}</span><span class="dm-ini__n">${H(m.curto || m.nome || k)}</span></span>`; };
  return `<h2 class="dm-ctx__t cin">${H(dsf.nome || '')}</h2>
    <p class="dm-ctx__dica">${H(dsf.regraTexto || '')}</p>
    <div class="dm-ctx__val ${v.ok ? 'ok' : 'nao'}">${v.ok ? '✓ Time válido' : '✕ ' + H(v.motivo || '')}</div>
    ${inim.length ? `<div class="dm-ctx__rot">INIMIGOS</div><div class="dm-ctx__inis">${inim.slice(0, 4).map(mini).join('')}${inim.length > 4 ? `<span class="dm-ini dm-ini--mais"><span class="dm-ini__p dm-ini__p--mais">+${inim.length - 4}</span></span>` : ''}</div>` : ''}`;
}
// montador COM validação AO VIVO da regra: Começar travado e DIZ POR QUÊ; cartões que violam ficam apagados.
function renderDesafioMontar(){
  const id = (paramsAtuais() || {}).id;
  const dsf = desafios().find(d => d.id === id) || {};
  const cfg = {
    id: 'composicao', pick: desafioTimePick,
    titulo: dsf.nome || 'DESAFIO',
    sublinha: 'COMPOSIÇÃO · ' + (dsf.regraTexto || ''),
    contextoHTML: _desafioContextoHTML(dsf),
    vagas: [{ tipo: 'livre' }, { tipo: 'livre' }, { tipo: 'livre' }],
    validar: (t) => { const v = validarRegra(dsf.regra, t.filter(Boolean)); return { ok: v.ok, motivo: v.motivo || '', porDeus: _regraPorDeus(dsf.regra, desafioTimePick) }; },
    textoBotao: 'COMEÇAR',
    aoComecar: (t) => iniciarDesafio(dsf, t.slice()),
    aoVoltar: () => { montKitAberto = null; if (!voltar()) ir('composicao', {}, { substituir: true }); render(); },
  };
  stage.innerHTML = montadorTimeHTML(cfg);
  ligarMontadorTime(cfg);
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
  st = montarPvEComNiveis(prova, time);   // §323 P2
  if (typeof REPLAY !== 'undefined') REPLAY.iniciar({ modo: 'desafio', desafioId: dsf.id, aliados: time });   // §318 F2 E2
  if (typeof definirIaVersao === 'function') definirIaVersao(iaVersaoDeModo('composicao'));   // §322 P3: desafio de composição
  vsCPU = true;
  ir('batalha', {}, { substituir: true });
  render();
}

// ===================================================================
// §273/§274 — DOMÍNIOS: a CORRIDA jogável. Fatia 2: CINCO Domínios (um por
// cultura) + a TELA DE SELEÇÃO. Cada Domínio é uma ESCADA medida
// (data/dominios/<cultura>.json); a corrida (vida carrega, chefe a cada 10,
// prêmio) e o PROGRESSO (recorde = nível mais fundo) são POR DOMÍNIO e
// INDEPENDENTES (perfil.dominios.porDominio[<cultura>]). Correr no Olimpo não
// mexe em Asgard. Run-scoped → não fere o invariante 3. SEM placar/servidor/
// rotação/recompensa: só a corrida (o placar tem portão de medição no §274).
// A LÓGICA mora em src/dominios.js; a batalha reusa renderBatalha.
// ===================================================================
function dominioLadders(){ return (typeof DOMINIOS !== 'undefined' && DOMINIOS) ? Object.values(DOMINIOS) : []; }
function dominioPorCultura(c){ return (typeof DOMINIOS !== 'undefined' && DOMINIOS) ? DOMINIOS[String(c).toLowerCase()] : null; }
function dominioProg(c){ const pd = perfil && perfil.dominios && perfil.dominios.porDominio; return (pd && pd[String(c).toLowerCase()]) || { run: null, melhorSempre: 0, semanas: {} }; }
function dominioRun(c){ return dominioProg(c).run || null; }
function dominioMelhor(c){ return dominioProg(c).melhorSempre || 0; }           // §275: melhor de sempre (não zera)
function recSemanaDominio(c, chave){ return (dominioProg(c).semanas || {})[chave] || 0; }   // recorde de UMA semana
// §275: a semana de HOJE para esta escada (índice da escada + chave desta e da anterior). Do RELÓGIO do aparelho.
function semanaInfo(lad){ const d = new Date(); return { idx: domIndiceSemana(lad, d), chave: domSemanaChave(d), chaveAnt: domChaveSemanaAnterior(d) }; }
function domTotalNiveis(lad){ const s = (lad.semanas && lad.semanas[0]) ? lad.semanas[0].niveis : lad.niveis; return (s || []).length; }
function domNomeDeus(k){ return (HRM[k] && HRM[k].nome) || (typeof GODS !== 'undefined' && GODS[k] && GODS[k].nome) || k; }
// §277-ajustes: nome CURTO do deus no cartão (só quando o dado o traz — "Sun Wukong"→"Wukong"). Nomes
// sem forma curta graciosa ficam inteiros e cortam com reticência (a caixa é ~46px no piso 780). Só o
// CARTÃO usa isto; frases (ex.: prêmio Reviver) seguem com o nome inteiro.
function domNomeDeusCartao(lad, k){ return (lad && lad.curtos && lad.curtos[k]) || domNomeDeus(k); }
function salvarRunDominio(cultura, run){ perfil = definirRunDominio(perfil, cultura, run); const r = salvar(perfil); if (r && !r.ok && st) st.log.push({ turno: st.turno, msg: '⚠ corrida salva falhou: ' + r.erro }); return r; }

// retrato pequeno de um deus do trio, com a vida atual (ou CAÍDO). vida null = só o retrato.
function dominioFichaHTML(k, vida){
  const nome = domNomeDeus(k), morto = vida && !vida.vivo;
  const hp = vida ? Math.max(0, Math.round(vida.hp)) : 0, maxHp = (typeof GODS !== 'undefined' && GODS[k] && GODS[k].hp) || 120;
  return `<div class="domficha${morto ? ' domficha--morto' : ''}">
    ${slot('god-' + k, ini(nome), '#b9a94a', 22, true)}
    <span class="domficha__nome">${H(nome)}</span>
    ${vida ? `<span class="domficha__hp">${morto ? 'caído' : hp + '/' + maxHp}</span>` : ''}
  </div>`;
}

/* ---------- TELA DE ESCOLHA (rota 'dominios'): os cinco Domínios ---------- */
function temArteDom(nome){ return typeof DOMINIOS_ARTE !== 'undefined' && DOMINIOS_ARTE && !!DOMINIOS_ARTE[nome]; }
// §279 — NOME DE ARQUIVO de asset é ASCII PURO (decisão do dono; convenção do projeto — bestiário/campanha
// já são ASCII). A CHAVE da cultura continua acentuada no DADO (`Egípcia`, `Nórdica`); a tradução p/ o nome
// de arquivo tira o acento. Função reutilizável (as 5 próximas culturas vêm depois; a Céltica pode ter
// acento): tira diacríticos por NFD. Motivo de ser ASCII e não só normalizar: (1) nome sem acento faz a
// classe do bug DEIXAR de existir (não há forma decomposta de letra sem acento); (2) servido por HTTP, um
// nome acentuado ainda passa por URL-encoding que varia entre navegador, WebView do Android e o Render.
function semAcento(s){ return String(s).normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function domArteArquivo(prefixo, cultura){ return prefixo + '-' + semAcento(String(cultura).toLowerCase()); }
// §277 — MONOGRAMA de emblema em LATINO (duas maiúsculas). Motivo medido: o §260 subsetou a Cinzel em
// LATINO + LATINO ESTENDIDO; os glifos "bonitos" (ΟΛ ☥ ⛩ 天 ᛟ) do §276 estão FORA do subset → caem na
// fonte do sistema e viram quadradinho no Android. Duas maiúsculas latinas (iniciais do Domínio) estão
// cobertas. Enquanto o arquivo `emblema-<c>.webp` não existe, é este monograma que aparece — nunca 404.
const DOM_EMB_MONO = { grega: 'OL', egípcia: 'DU', duat: 'DU', chinesa: 'CE', japonesa: 'TK', nórdica: 'AS' };
function embMonoDom(c, cultura){ return DOM_EMB_MONO[c] || (cultura || c).slice(0, 2).toUpperCase(); }
// nome do Domínio em DUAS linhas ("Domínio" / "do Olimpo"), como o mockup — quebra no 1º espaço.
function domNomeDuasLinhas(nome){ const i = String(nome).indexOf(' '); return i < 0 ? [nome, ''] : [nome.slice(0, i), nome.slice(i + 1)]; }

// §277 — cartão-PÔSTER de um Domínio (reskin do mockup do dono): cantos chanfrados, moldura+brilho por
// cultura, emblema-anel meio-para-fora, nome dourado em duas linhas, retratos com chanfro, botão em bisel.
// Arte por ARQUIVO (só emite <img> se a build achou o arquivo — ausência = placeholder do §213, nunca 404).
// Mantém class `domcard`+`data-cultura`+`domcard__prog` (os guardas leem isso). Progresso (§275) volta
// ENTRE a frase e o botão. A paleta vem da classe `dcard--<c>` (CSS), o que faz os cinco parecerem 5 lugares.
function dominioPosterHTML(lad){
  const c = String(lad.cultura).toLowerCase(), total = domTotalNiveis(lad);
  const run = dominioRun(c), sem = semanaInfo(lad);
  const recSem = recSemanaDominio(c, sem.chave), recAnt = recSemanaDominio(c, sem.chaveAnt);
  const emCorrida = run && run.status === 'ativo';
  const batido = recAnt > 0 && recSem > recAnt;
  // §278-ajustes: rótulo CURTO (mede ≤118px no piso 780, uma linha) — "Semana ·" e "· nível" eram andaime;
  // ficam o número e o SINAL de estado (ícone+cor+palavra de estado). "Não iniciado" convida (termo da
  // referência do dono), no lugar de "sem marca" que soava a boletim. Guarda babá: nenhuma pílula quebra.
  const prog = emCorrida
    ? `<div class="domcard__prog domcard__prog--ativo"><i>▸</i>Em corrida ${run.nivel}/${total}</div>`
    : (recSem > 0
      ? `<div class="domcard__prog domcard__prog--rec">Nível ${recSem}/${total}${batido ? ' <i class="domcard__sup">▲</i>' : ''}</div>`
      : `<div class="domcard__prog domcard__prog--novo">Não iniciado</div>`);
  // §281: UMA linha de progresso. A pílula já carrega o número/estado; a 2ª linha só existe quando diz algo
  // que a pílula NÃO diz — o recorde ANTERIOR a bater (único caso que se justifica). "1ª semana — sem marca"
  // era redundante com "Não iniciado"/com a própria pílula: sai.
  const anterior = recAnt > 0 ? `<span class="dcard__ant">anterior a bater · nível ${recAnt}</span>` : '';
  const trio = lad.trio.map(k => `<span class="dcard__deus">${slot('god-' + k, ini(domNomeDeus(k)), '#b9a94a', 15, true)}<i>${H(domNomeDeusCartao(lad, k))}</i></span>`).join('');
  const embArq = domArteArquivo('emblema', lad.cultura), artArq = domArteArquivo('dominio', lad.cultura);   // §279: ASCII
  const emb = temArteDom(embArq)
    ? `<img src="banners/dominios/${embArq}.webp" alt="">`
    : `<span class="dcard__embmono">${H(embMonoDom(c, lad.cultura))}</span>`;
  const arte = temArteDom(artArq) ? `<img class="dcard__art" src="banners/dominios/${artArq}.webp" alt="">` : '<div class="dcard__ph"></div>';
  const [nome1, nome2] = domNomeDuasLinhas(lad.nome);
  return `<button class="domcard dcard dcard--${H(c)}" data-cultura="${H(c)}">
    <div class="dcard__poster">
      ${arte}
      <div class="dcard__artveil"></div>
      <div class="dcard__scrim"></div>
      <div class="dcard__corpo">
        <span class="dcard__cult">${H(lad.cultura)}</span>
        <span class="dcard__nome"><span>${H(nome1)}</span>${nome2 ? '<span>' + H(nome2) + '</span>' : ''}</span>
        <span class="dcard__frase">${H(lad.frase || '')}</span>
        <div class="dcard__prog2">${prog}${anterior}</div>
        <span class="dcard__deuses">${trio}</span>
        <span class="dcard__entrar">ENTRAR <b>›</b></span>
      </div>
    </div>
    <span class="dcard__emblema"><span class="dcard__emblema-in">${emb}</span></span>
  </button>`;
}

/* ---------- TELA DE ESCOLHA (rota 'dominios'): cinco pôsteres (§277 — reskin do mockup) ---------- */
function renderDominios(){
  const lads = dominioLadders();
  const cards = lads.map(dominioPosterHTML).join('');
  const temFundo = temArteDom('dominios-fundo');
  stage.innerHTML = `<div id="baselayer" class="dsel">
    <div class="stage__bg"></div>
    ${temFundo ? '<img class="dsel__fundo" src="banners/dominios/dominios-fundo.webp" alt="">' : ''}
    <div class="dsel__scrim"></div>
    <header class="dsel__cab">
      <button class="dsel__voltar" id="binicio" aria-label="Voltar"><i class="dsel__seta"></i></button>
      <div class="dsel__tit">
        <div class="dsel__titlinha"><h1 class="dsel__titulo">Domínios</h1><button class="dsel__ajuda" id="dajuda" aria-label="Como funciona">?</button></div>
        <span class="dsel__sub">ESCOLHA UM DOMÍNIO · ENFRENTE BATALHAS · ALCANCE O TOPO</span>
      </div>
      <button class="dsel__hist" id="dhist"><span class="dsel__hist-t">Seu histórico</span><span class="dsel__hist-s">seus recordes por Domínio</span></button>
    </header>
    <div class="dsel__cards">${cards || '<p class="domsec__msg">Nenhum Domínio carregado.</p>'}</div>
    ${dominioMarcaBaterHTML()}
  </div>`;
  const q = s => stage.querySelector(s);
  const b = q('#binicio'); if (b) b.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  const h = q('#dhist'); if (h) h.onclick = () => abrirHistoricoDominios();
  const hh = q('#dhistver'); if (hh) hh.onclick = () => abrirHistoricoDominios();   // atalho do painel esquerdo do rodapé
  const aj = q('#dajuda'); if (aj) aj.onclick = () => abrirAjudaDominios();
  [...stage.querySelectorAll('.domcard')].forEach(btn => { btn.onclick = () => { ir('dominio', { cultura: btn.getAttribute('data-cultura') }); render(); }; });
  fit();
}

// §277 — o "?" do cabeçalho: uma explicação HONESTA do modo (sem promessa de placar comparativo/recompensa).
function abrirAjudaDominios(){
  const velho = stage.querySelector('#dajudaov'); if (velho) velho.remove();
  const ov = document.createElement('div'); ov.id = 'dajudaov'; ov.className = 'ov';
  ov.innerHTML = `<div class="ovbox dhist" style="max-width:460px">
    <div class="dhist__topo"><h2>Como funciona</h2><button class="b b--quiet b--md" id="dajudax">Fechar</button></div>
    <p class="dhist__nota">Cada Domínio é uma ESCADA de batalhas 3×3 que muda toda semana. Você desce o quanto conseguir numa corrida; a vida carrega entre os níveis e a cada 10 vem um chefe. O placar é SÓ SEU: você compete com o seu próprio recorde da semana passada e com o seu melhor de sempre — guardado só neste aparelho, sem comparação com outros jogadores e sem recompensa.</p>
  </div>`;
  stage.querySelector('#baselayer').appendChild(ov);
  ov.onclick = e => { if (e.target === ov) ov.remove(); };
  const x = ov.querySelector('#dajudax'); if (x) x.onclick = () => ov.remove();
}

// §277 — o RODAPÉ: dois painéis chanfrados (a "verdade" no lugar das mentiras do mockup — §274/§275).
// ESQUERDA = seu melhor desempenho, com um atalho VER HISTÓRICO. DIREITA = A MARCA A BATER (o recorde da
// semana passada do seu melhor Domínio + o melhor de sempre). SEM recompensa, SEM baú, SEM "top 10", SEM
// placar comparativo entre jogadores — é o próprio jogador contra o próprio recorde.
function dominioMarcaBaterHTML(){
  const lads = dominioLadders();
  let melhorLad = null, melhorVal = -1;
  for (const lad of lads){ const m = dominioMelhor(String(lad.cultura).toLowerCase()); if (m > melhorVal){ melhorVal = m; melhorLad = lad; } }
  const esqVazio = !melhorLad || melhorVal <= 0;
  const esq = esqVazio
    ? `<div class="dsel__pain dsel__pain--esq dsel__pain--vazia">
         <div class="dsel__pain-bloco"><span class="dsel__pain-rot">Seu melhor desempenho</span><span class="dsel__pain-val">Ainda sem marca — escolha um Domínio e comece.</span></div>
         <button class="dsel__pain-btn" id="dhistver">Ver histórico</button>
       </div>`
    : (() => {
        const nomeCurto = H(melhorLad.nome.replace(/^Domínio d[eoa]s? /i, ''));
        return `<div class="dsel__pain dsel__pain--esq">
          <div class="dsel__pain-bloco"><span class="dsel__pain-rot">Seu melhor desempenho</span><span class="dsel__pain-val"><b>${nomeCurto}</b> · melhor de sempre <b class="dsel__pain-num">nível ${melhorVal}</b></span></div>
          <button class="dsel__pain-btn" id="dhistver">Ver histórico</button>
        </div>`;
      })();
  let dir;
  if (esqVazio){
    dir = `<div class="dsel__pain dsel__pain--dir dsel__pain--vazia">
      <div class="dsel__pain-bloco"><span class="dsel__pain-rot">A marca a bater esta semana</span><span class="dsel__pain-val">A cada semana, uma escada nova para bater a sua marca.</span></div>
    </div>`;
  } else {
    const c = String(melhorLad.cultura).toLowerCase(), sem = semanaInfo(melhorLad);
    const recAnt = recSemanaDominio(c, sem.chaveAnt);
    dir = `<div class="dsel__pain dsel__pain--dir">
      <div class="dsel__pain-bloco"><span class="dsel__pain-rot">A marca a bater esta semana</span><span class="dsel__pain-val">${recAnt > 0 ? '<b class="dsel__pain-num">nível ' + recAnt + '</b> <i>(recorde da semana passada)</i>' : '<b class="dsel__pain-num">1ª semana</b> <i>— ainda sem marca anterior</i>'}</span></div>
    </div>`;
  }
  return `<div class="dsel__rodape">${esq}${dir}</div>`;
}

// §276 — SEU HISTÓRICO: os recordes semanais por Domínio que o perfil já guarda (nada comparativo).
// Overlay simples dentro do palco, com saída clara (Fechar / clicar fora) — §210.
function abrirHistoricoDominios(){
  const velho = stage.querySelector('#dhistov'); if (velho) velho.remove();
  const lads = dominioLadders();
  const linhas = lads.map(lad => {
    const c = String(lad.cultura).toLowerCase(), melhor = dominioMelhor(c), semanas = (dominioProg(c).semanas) || {};
    const chaves = Object.keys(semanas).sort().reverse();
    const cells = chaves.length
      ? chaves.map(k => `<span class="dhist__wk"><i>${H(k)}</i> nível ${semanas[k]}</span>`).join('')
      : '<span class="dhist__vazio">sem corrida ainda</span>';
    return `<div class="dhist__linha">
      <div class="dhist__cab"><b>${H(lad.nome)}</b><span>melhor de sempre: ${melhor > 0 ? 'nível ' + melhor : '—'}</span></div>
      <div class="dhist__semanas">${cells}</div>
    </div>`;
  }).join('');
  const ov = document.createElement('div'); ov.id = 'dhistov'; ov.className = 'ov';
  ov.innerHTML = `<div class="ovbox dhist">
    <div class="dhist__topo"><h2>Seu histórico</h2><button class="b b--quiet b--md" id="dhistx">Fechar</button></div>
    <p class="dhist__nota">Recordes semanais por Domínio, guardados só neste aparelho. Sem comparação com outros jogadores.</p>
    <div class="dhist__lista">${linhas}</div>
  </div>`;
  stage.querySelector('#baselayer').appendChild(ov);
  ov.onclick = e => { if (e.target === ov) ov.remove(); };
  const x = ov.querySelector('#dhistx'); if (x) x.onclick = () => ov.remove();
}

/* ---------- HUB / ENTRADA de UM Domínio (rota 'dominio', params.cultura) ---------- */
/* ===================== §348 — HUB DO DOMÍNIO (renderDominioHub) no modelo do dono =====================
   Tela fixa 1846×852 escalada (§339/§342): cabeçalho + trilha de 40 degraus + 3 colunas (SEU TIME · o meio
   por estado · recordes/chefe final). Estados: nova corrida · em andamento · chefe vencido · encerrada ·
   conquistada. Alvos de toque ≥72px; corpo ≥20px; "build"/"conta" somem (classe emdomhub). */
// inimigos de UM nível da escada da SEMANA (confere com o que a corrida de fato joga — domEscadaSemana/domDefNivel).
function domInimigosNivel(lad, weekIdx, nivel){
  const esc = domEscadaSemana(lad, weekIdx || 0);
  const def = (esc.niveis || [])[nivel - 1];
  return (def && def.inimigos) || [];
}
// uma UNIDADE do time (coluna esquerda): retrato + nome + orbe/função + barra de vida grande (verde/amarela/vermelha) ou CAÍDO.
function _domHubUnHTML(k, vida){
  const g = HRM[k] || { nome: k, elem: 'Umbra', funcao: '' };
  const max = (typeof GODS !== 'undefined' && GODS[k] && GODS[k].hp) || 120;
  const vivo = vida ? !!vida.vivo : true;
  const hp = vivo ? (vida ? Math.max(0, Math.round(vida.hp)) : max) : 0;
  const frac = Math.max(0, Math.min(1, hp / max));
  const cor = frac > 0.5 ? '#58D68D' : frac > 0.25 ? '#E9C25A' : '#E0545B';   // §348: verde >50% · amarela até 25% · vermelha abaixo
  return `<div class="dh-un${vivo ? '' : ' dh-un--caido'}" data-un="${H(k)}">
    <div class="dh-un__p">${slot('god-' + k, ini(g.nome), COR(g.elem), 32, false)}</div>
    <div class="dh-un__id">
      <b class="dh-un__n">${H(g.nome)}</b>
      <div class="dh-un__meta">${orbe(g.elem, 22)}<span class="dh-un__f">${H(g.funcao || '')}</span>
        ${vivo ? `<span class="dh-un__hp">${hp}<span>/${max}</span></span>` : `<span class="dh-un__hp dh-un__hp--caido">CAÍDO</span>`}</div>
      <div class="dh-un__bar"><i style="width:${Math.round(frac * 100)}%;background:${cor}"></i></div>
    </div>
  </div>`;
}
// trilha dourada de N degraus: vencidos cheios, ATUAL com marcador brilhante maior, futuros apagados; coroa nos chefes;
// número só no 1, nos chefes e no atual.
function _domHubTrilhaHTML(total, cleared, atual){
  const nos = [];
  for (let n = 1; n <= total; n++){
    const chefe = (n % DOM_FAIXA === 0), done = n <= cleared, cur = (atual > 0 && n === atual);
    const left = total > 1 ? ((n - 1) / (total - 1) * 100) : 50;
    const mostraNum = (n === 1 || chefe || cur);
    const cls = `dh-no${done ? ' is-done' : ''}${cur ? ' is-cur' : ''}${chefe ? ' dh-no--chefe' : ''}`;
    nos.push(`<span class="${cls}" style="left:${left.toFixed(3)}%" data-no="${n}">${chefe ? '<i class="dh-no__coroa">♛</i>' : ''}<i class="dh-no__p"></i>${mostraNum ? `<i class="dh-no__n">${n}</i>` : ''}</span>`);
  }
  const goldTo = atual > 0 ? atual : cleared;
  const goldFrac = total > 1 ? Math.max(0, (goldTo - 1) / (total - 1) * 100) : 0;
  return `<div class="dh-rail"><i class="dh-rail__linha"></i><i class="dh-rail__on" style="width:${goldFrac.toFixed(3)}%"></i>${nos.join('')}</div>`;
}
// inimigo do próximo nível (coluna do meio): retrato + nome + orbe; se é chefe, rótulo CHEFE + moldura vermelha.
function _domHubFoeHTML(k, chefe){
  const g = HRM[k] || { nome: k, elem: 'Umbra' };
  return `<div class="dh-foe${chefe ? ' dh-foe--chefe' : ''}" data-foe="${H(k)}">
    <div class="dh-foe__p">${slot('god-' + k, ini(g.nome), COR(g.elem), 28, false)}${chefe ? '<span class="dh-foe__tag">CHEFE</span>' : ''}</div>
    <div class="dh-foe__n">${H(g.nome)}</div>
    <div class="dh-foe__meta">${orbe(g.elem, 24)}</div>
  </div>`;
}
// trilha do BÔNUS de dano (0% → +teto, marcas de +10%), com preenchimento até o bônus atual.
function _domHubBonusHTML(bonus, teto){
  const steps = Math.max(1, Math.round(teto / DOM_PASSO_BONUS));
  const frac = teto > 0 ? Math.max(0, Math.min(1, bonus / teto)) : 0;
  const marks = [];
  for (let i = 0; i <= steps; i++){ const f = i / steps;
    marks.push(`<span class="dh-bon__mk" style="left:${(f * 100).toFixed(2)}%"><i></i><em>${i === 0 ? '0%' : '+' + Math.round(f * teto * 100) + '%'}</em></span>`); }
  return `<div class="dh-bon">
    <div class="dh-bon__top"><span>Bônus de dano</span><b>+${Math.round(bonus * 100)}%</b></div>
    <div class="dh-bon__rail"><i class="dh-bon__fill" style="width:${(frac * 100).toFixed(2)}%"></i><i class="dh-bon__knob" style="left:${(frac * 100).toFixed(2)}%"></i>${marks.join('')}</div>
  </div>`;
}
// ícones em SVG dos prêmios (cruz de cura · asas com ankh · espada com seta p/ cima).
function _domPremioIcon(tipo){
  if (tipo === 'cura') return `<svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="22" fill="none" stroke="#58D68D" stroke-width="3"/><path d="M28 16v24 M16 28h24" stroke="#58D68D" stroke-width="5" stroke-linecap="round"/></svg>`;
  if (tipo === 'reviver') return `<svg viewBox="0 0 56 56" aria-hidden="true"><g fill="none" stroke="#E9C25A" stroke-width="3" stroke-linecap="round"><ellipse cx="28" cy="18" rx="7" ry="9"/><path d="M28 27v20 M18 35h20"/><path d="M15 30c-7 2-11 6-12 12 7-1 11-4 14-8 M41 30c7 2 11 6 12 12-7-1-11-4-14-8"/></g></svg>`;
  return `<svg viewBox="0 0 56 56" aria-hidden="true"><g fill="none" stroke="#E0545B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M28 10l6 9-6 4-6-4z" fill="#E0545B"/><path d="M28 23v21 M22 39h12"/></g><g fill="none" stroke="#E9C25A" stroke-width="3" stroke-linecap="round"><path d="M42 24v-8 M38 20l4-4 4 4"/></g></svg>`;
}
function _domHubPremioCard(tipo, titulo, sub){
  return `<button class="dompremio dh-premio" data-premio="${tipo}"><span class="dh-premio__ic">${_domPremioIcon(tipo)}</span><span class="dh-premio__t">${H(titulo)}</span><span class="dh-premio__s">${H(sub)}</span></button>`;
}
function _domCoroaSVG(){ return `<svg viewBox="0 0 170 60" class="dh-crownsvg" aria-hidden="true"><g fill="none" stroke="#C9A44C" stroke-width="2.5" stroke-linecap="round"><path d="M40 50c-16-3-27-13-31-27 M130 50c16-3 27-13 31-27"/></g><g fill="#E9C25A"><path d="M55 44l-9-24 18 13 21-21 21 21 18-13-9 24z"/><circle cx="46" cy="18" r="4"/><circle cx="85" cy="9" r="5"/><circle cx="124" cy="18" r="4"/></g></svg>`; }

function renderDominioHub(){
  const cultura = ((paramsAtuais() || {}).cultura) || (dominio && dominio.cultura);
  const lad = dominioPorCultura(cultura);
  if (!lad){
    stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div><div class="tela"><header class="tela__cab"><button class="b b--quiet b--md" id="bvoltar">‹ Voltar</button><h1 class="tela__titulo">Domínio</h1><span class="tela__espaco"></span></header><div class="tela__vazio"><span class="tela__vazioic">◈</span><p class="tela__vaziomsg">Este Domínio não foi carregado.</p></div></div></div>`;
    const b = stage.querySelector('#bvoltar'); if (b) b.onclick = () => { if (!voltar()) ir('dominios', {}, { substituir: true }); render(); };
    fit(); return;
  }
  const c = String(lad.cultura).toLowerCase();
  const run = dominioRun(c), sem = semanaInfo(lad), total = domTotalNiveis(lad);
  const recSem = recSemanaDominio(c, sem.chave), recAnt = recSemanaDominio(c, sem.chaveAnt), melhor = dominioMelhor(c);
  const semNum = parseInt(String(sem.chave).split('W')[1] || '0', 10) || 0;

  // estado único da corrida → governa o cabeçalho, a trilha e a coluna do meio.
  let estado;
  if (run && run.status === 'ativo' && run.aguardandoPremio) estado = 'premio';
  else if (run && run.status === 'ativo') estado = 'andamento';
  else if (run && run.status === 'morto') estado = 'morto';
  else if (run && run.status === 'completo') estado = 'completo';
  else estado = 'nova';
  const prof = run ? (run.profundidade || 0) : 0;

  // ---- cabeçalho: sublinha por estado (SEM anotação interna — §348) ----
  const subMap = {
    nova: `NOVA CORRIDA · SEMANA ${semNum}`,
    andamento: `CORRIDA EM ANDAMENTO · SEMANA ${semNum}`,
    premio: `CORRIDA EM ANDAMENTO · SEMANA ${semNum}`,
    morto: `CORRIDA ENCERRADA`,
    completo: `DOMÍNIO CONQUISTADO`,
  };
  const artArq = domArteArquivo('dominio', lad.cultura);
  const arteHTML = temArteDom(artArq) ? `<img class="dh-arte__img" src="banners/dominios/${artArq}.webp" alt="">` : '';

  // ---- trilha: vencidos/atual por estado ----
  let cleared = 0, atual = 0;
  if (estado === 'completo'){ cleared = total; atual = 0; }
  else if (estado === 'morto'){ cleared = prof; atual = 0; }
  else if (estado === 'premio' || estado === 'andamento'){ cleared = prof; atual = run.nivel; }
  else { cleared = 0; atual = 1; }   // nova
  let cap;
  if (estado === 'premio') cap = `Chefe vencido no nível ${prof} · escolha uma recompensa para a corrida.`;
  else if (estado === 'andamento') cap = `Nível ${run.nivel} de ${total} · próximo chefe no nível ${Math.ceil(run.nivel / DOM_FAIXA) * DOM_FAIXA}`;
  else if (estado === 'morto') cap = `Corrida encerrada no nível ${prof} de ${total}.`;
  else if (estado === 'completo') cap = `Domínio conquistado · ${total} de ${total} níveis.`;
  else cap = `Nível 1 de ${total} · próximo chefe no nível ${DOM_FAIXA}`;

  // ---- coluna esquerda: SEU TIME ----
  const mostraLock = (estado === 'andamento' || estado === 'premio');
  let timeHTML;
  if (estado === 'nova'){
    timeHTML = [1, 2, 3].map(n => `<div class="dh-un dh-un--vazia"><div class="dh-un__p dh-un__p--vazia">+</div><div class="dh-un__id"><b class="dh-un__n">Vaga ${n}</b><span class="dh-un__hint">Você monta o time ao começar</span></div></div>`).join('');
  } else {
    timeHTML = (run.time || []).map((k, i) => _domHubUnHTML(k, run.vida ? run.vida[i] : null)).join('');
  }
  const bonusHTML = (estado === 'nova') ? '' : _domHubBonusHTML(run.bonus || 0, lad.tetoBonusDano || DOM_TETO_BONUS);

  // ---- coluna do meio: por estado ----
  let meio = '';
  if (estado === 'andamento'){
    const nivel = run.nivel, chefe = domEhChefe(nivel);
    const foes = domInimigosNivel(lad, run.semanaIdx || 0, nivel).map(k => _domHubFoeHTML(k, chefe)).join('');
    meio = `<h2 class="dh-meio__t cin">PRÓXIMO NÍVEL — ${nivel}</h2>
      <div class="dh-foes">${foes}</div>
      <div class="dh-meio__sep"></div>
      <p class="dh-meio__nota">A vida carrega entre os níveis. A cada chefe vencido,<br>você escolhe uma recompensa.</p>
      <button class="dhb dhb--go" id="ddescer">DESCER AO NÍVEL ${nivel} ›</button>`;
  } else if (estado === 'premio'){
    const opc = domPremiosDisponiveis(run), caido = run.vida.findIndex(x => !x.vivo);
    const bonusPct = Math.round((run.bonus || 0) * 100), tetoPct = Math.round((lad.tetoBonusDano || DOM_TETO_BONUS) * 100);
    const cards = [];
    if (opc.includes('cura')) cards.push(_domHubPremioCard('cura', 'CURA TOTAL', 'Todos os deuses vivos voltam à vida cheia.'));
    if (opc.includes('reviver')){ const rk = (run.time || [])[caido]; const rhp = Math.min((GODS[rk] && GODS[rk].hp) || 120, DOM_HP_REVIVER);
      cards.push(_domHubPremioCard('reviver', 'REVIVER', `${domNomeDeus(rk)} volta com ${rhp} de vida.`)); }   // §348: run.time (TIME do jogador, §325), não lad.trio
    if (opc.includes('bonus')) cards.push(_domHubPremioCard('bonus', 'BÔNUS DE DANO', `+${Math.round(DOM_PASSO_BONUS * 100)}% de dano (agora +${bonusPct}%, teto +${tetoPct}%).`));
    meio = `<div class="dh-crown">${_domCoroaSVG()}</div>
      <h2 class="dh-meio__t cin">CHEFE VENCIDO — NÍVEL ${prof}</h2>
      <p class="dh-meio__sub">Escolha uma recompensa para a corrida.</p>
      <div class="dh-premios">${cards.join('')}</div>`;
  } else if (estado === 'nova'){
    const foes = domInimigosNivel(lad, sem.idx, 1).map(k => _domHubFoeHTML(k, domEhChefe(1))).join('');
    meio = `<h2 class="dh-meio__t cin">PRIMEIRO NÍVEL</h2>
      <div class="dh-foes">${foes}</div>
      <div class="dh-meio__sep"></div>
      <p class="dh-meio__nota">A vida carrega entre os níveis. A cada chefe vencido,<br>você escolhe uma recompensa.</p>
      <button class="dhb dhb--go" id="dentrar">MONTAR TIME E COMEÇAR ›</button>`;
  } else if (estado === 'morto'){
    meio = `<div class="dh-selo dh-selo--morto">CORRIDA ENCERRADA</div>
      <p class="dh-meio__msg">Seus deuses tombaram no <b>nível ${prof}</b>. A corrida zera — a vida, o bônus e a rede voltam do começo. O recorde fica.</p>
      <button class="dhb dhb--go" id="dnova">NOVA CORRIDA</button>`;
  } else {
    meio = `<div class="dh-selo dh-selo--venceu">DOMÍNIO CONQUISTADO</div>
      <p class="dh-meio__msg">Você desceu os ${total} níveis do ${H(lad.nome)} desta semana. Uma nova corrida recomeça do topo.</p>
      <button class="dhb dhb--go" id="dnova">NOVA CORRIDA</button>`;
  }

  // ---- coluna direita: recordes + chefe final ----
  const recVal = (v, alt) => v > 0 ? `<small>nível</small> ${v}` : (alt || '—');
  const recordesHTML = `<div class="dh-rec"><span class="dh-rec__l">Recorde desta semana</span><b class="dh-rec__v">${recVal(recSem)}</b></div>
    <div class="dh-rec"><span class="dh-rec__l">Marca a bater (semana anterior)</span><b class="dh-rec__v">${recVal(recAnt, '— 1ª semana')}</b></div>
    <div class="dh-rec"><span class="dh-rec__l">Melhor de sempre</span><b class="dh-rec__v">${recVal(melhor)}</b></div>`;
  const chefeFinalHTML = lad.trio.map(k => { const g = HRM[k] || { nome: k, elem: 'Umbra' };
    return `<div class="dh-cf" data-chefe="${H(k)}"><div class="dh-cf__p">${slot('god-' + k, ini(g.nome), COR(g.elem), 26, false)}</div><div class="dh-cf__n">${H(g.nome)}</div><div class="dh-cf__meta">${orbe(g.elem, 22)}</div></div>`; }).join('');

  stage.innerHTML = `<div id="baselayer" class="dh2"><div id="domhub" data-estado="${estado}">
    <div class="dh-arte">${arteHTML}<div class="dh-arte__veu"></div></div>
    <header class="dh-cab">
      <button class="dhb dhb--voltar" id="bvoltar">‹ VOLTAR</button>
      <div class="dh-tit"><h1 class="dh-titulo cin">${H(lad.nome)}</h1><span class="dh-sub">${H(subMap[estado])}</span></div>
      <button class="dhb dh-ajuda" id="dajuda" aria-label="Ajuda">?</button>
    </header>
    <div class="dh-trilha">${_domHubTrilhaHTML(total, cleared, atual)}<div class="dh-trilha__cap">${H(cap)}</div></div>
    <section class="dh-col dh-col--time">
      <div class="dh-col__cab"><h2 class="dh-col__t cin">SEU TIME</h2>${mostraLock ? '<span class="dh-lock"><i>🔒</i>Travado nesta corrida</span>' : ''}</div>
      <div class="dh-uns">${timeHTML}</div>
      ${bonusHTML}
    </section>
    <section class="dh-col dh-col--meio"><div class="dh-meio dh-meio--${estado}">${meio}</div></section>
    <section class="dh-col dh-col--dir">
      <div class="dh-box"><h2 class="dh-box__t cin">SEUS RECORDES</h2>${recordesHTML}</div>
      <div class="dh-box dh-box--cf"><h2 class="dh-box__t cin">CHEFE FINAL</h2><div class="dh-cfs">${chefeFinalHTML}</div></div>
    </section>
  </div></div>`;

  const q = s => stage.querySelector(s);
  const b = q('#bvoltar'); if (b) b.onclick = () => { if (!voltar()) ir('dominios', {}, { substituir: true }); render(); };
  const aj = q('#dajuda'); if (aj) aj.onclick = () => abrirAjudaDominios();
  // §325: MONTAR TIME é transitório (substitui o hub na pilha) — o "voltar" do Android volta à SELEÇÃO sem hub duplicado.
  const en = q('#dentrar'); if (en) en.onclick = () => { domTimePick = []; ir('dominiomontar', { cultura: c }, { substituir: true }); render(); };
  const nv = q('#dnova'); if (nv) nv.onclick = () => { domTimePick = []; ir('dominiomontar', { cultura: c }, { substituir: true }); render(); };
  const de = q('#ddescer'); if (de) de.onclick = () => descerDominio(c);
  [...stage.querySelectorAll('.dompremio')].forEach(btn => { btn.onclick = () => escolherPremioDominio(c, btn.getAttribute('data-premio')); });
  fit();
}

/* ---------- lançar a batalha de um nível (por cultura, na ESCADA DA SEMANA) ---------- */
function iniciarCorridaDominio(cultura, time){
  const lad = dominioPorCultura(cultura); if (!lad) return;
  const c = String(cultura).toLowerCase(), sem = semanaInfo(lad);
  if (!(Array.isArray(time) && time.length === 3)) { domTimePick = []; ir('dominiomontar', { cultura: c }, { substituir: true }); render(); return; }   // §325: sem time montado → volta ao montador
  // §325: a corrida carrega A SUA semana (índice + chave), a MARCA a bater (recorde da semana anterior) e o
  // TIME que o jogador montou (travado pela corrida, regra B).
  const run = domNovaCorrida(lad, sem.idx, sem.chave, recSemanaDominio(c, sem.chaveAnt), time.slice());
  run.id = 'dom_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);   // §318 F2 E2: id da corrida (teto de Essência POR CORRIDA no servidor)
  salvarRunDominio(c, run);
  iniciarNivelDominio(c);
}
/* ===================== §342 — MONTADOR DE TIME (base reaproveitável) =====================
   1ª de 5 telas de montar time. A BASE (montadorTimeHTML + ligarMontadorTime) desenha a grade de
   SEUS DEUSES (filtros+busca), as 3 vagas, o painel de kit e o rodapé; o que muda por modo vem do cfg.
   Só o DOMÍNIO usa agora (Campanha/Composição/PvP/Batalha CPU seguem iguais). Tela fixa 1846×852 (§335/§339). */
let montFiltroElem = null, montFiltroFunc = null, montBusca = '', montKitAberto = null, montDica = false;
const _montNorm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function _montNivelMax(k){ const n = niveisDeExibicao(k); if (!n) return 1; let mx = 1; for (const s in n) if (n[s] > mx) mx = n[s]; return mx; }
function _montJogaveis(){ return ROSTER.map(e => e.key).filter(k => temDeus(k) && temKitHome(k)); }
function _montFiltrados(ks){ const q = _montNorm(montBusca);
  return ks.filter(k => { const g = HRM[k] || {};
    if (montFiltroElem && g.elem !== montFiltroElem) return false;
    if (montFiltroFunc && g.funcao !== montFiltroFunc) return false;
    if (q && !_montNorm(g.nome).includes(q)) return false;
    return true; }); }
// time resolvido na ORDEM das vagas (vaga livre puxa do pick; travada/emprestada traz o deus fixo)
function _montTime(cfg){ let pi = 0; return cfg.vagas.map(v => v.tipo === 'livre' ? (cfg.pick[pi++] || null) : (v.deus || null)); }
function _montFreeCount(cfg){ return cfg.vagas.filter(v => v.tipo === 'livre').length; }

// §345: _montCardHTML e _montKitPanelHTML foram para src/ui/base.js (a FUNDAÇÃO), para a seleção (outro ui/) poder reusá-los.
function _montVagaHTML(i, k, v){
  const n = i + 1;
  if (!k) return `<div class="dm-vaga dm-vaga--vazia"><span class="dm-vaga__num">${n}</span><span class="dm-vaga__add">+</span><span class="dm-vaga__txt">Escolha um deus</span></div>`;
  const g = HRM[k] || { nome: k, elem: 'Umbra', funcao: '' }, trav = v.tipo === 'travada';
  return `<div class="dm-vaga"><span class="dm-vaga__num">${n}</span>
    <span class="dm-vaga__p">${slot('god-' + k, ini(g.nome), COR(g.elem), 24)}</span>
    <span class="dm-vaga__id"><b class="dm-vaga__n">${H(g.nome)}</b><span class="dm-vaga__meta">${orbe(g.elem, 16)}</span></span>
    ${trav ? `<span class="dm-vaga__lock">🔒</span>` : `<button class="dm-vaga__x" data-rem="${k}" aria-label="remover">✕</button>`}
  </div>`;
}
// rótulo padrão do botão do kit (montador de 3 vagas): ESCOLHER / TIRAR DO TIME / Time cheio
function _montKitLabelPadrao(k, cfg){
  const on = cfg.pick.indexOf(k) >= 0, cheio = cfg.pick.length >= _montFreeCount(cfg) && !on;
  if (on) return { txt: 'TIRAR DO TIME' };
  if (cheio) return { txt: 'Time cheio', disabled: true };
  return { txt: 'ESCOLHER ' + ((HRM[k] || {}).nome || '').toUpperCase() };
}
// §345: _montKitPanelHTML foi para src/ui/base.js (a FUNDAÇÃO).
// §342b: CUSTO do kit em ORBES (§337, ≥22px) ou "GRÁTIS" (§340) — como o painel da batalha, não os pontinhos.
function _montCustoHTML(cost, px){
  cost = cost || {}; px = px || 24; const out = [];
  for (const kk in cost) { if (kk === 'livre') continue; for (let i = 0; i < cost[kk]; i++) out.push(orbe(kk, px)); }
  for (let i = 0; i < (cost.livre || 0); i++) out.push(orbe('livre', px));
  return out.length ? `<span class="dmk-ab__orbs">${out.join('')}</span>` : `<span class="dmk-ab__gratis">GRÁTIS</span>`;
}
// §344: a GRADE (filtros + busca + contagem + cartões) extraída — reusada pelo montador e pelo seletor de troca.
function _montGradeSecHTML(cfg){
  const lista = _montFiltrados(_montJogaveis());
  const elemChips = ELEMS.map(e => `<button class="dm-orbe${montFiltroElem === e ? ' is-on' : ''}" data-elem="${e}" aria-label="${ELAB[e]}">${orbe(e, 30)}</button>`).join('');
  const funcChips = FUNCOES_VOCAB.map(f => `<button class="dm-chip${montFiltroFunc === f ? ' is-on' : ''}" data-func="${f}">${H(f)}</button>`).join('');
  const cards = lista.length ? lista.map(k => _montCardHTML(k, cfg)).join('') : '<p class="dm-vazio">Nenhum deus neste filtro.</p>';
  return `<section class="dm-dir${cfg.gradeFull ? ' dm-dir--full' : ''}">
    <div class="dm-dir__cab">
      <div class="dm-filtros">
        <div class="dm-filtros__l">
          <h2 class="dm-dir__t">SEUS DEUSES</h2>
          <button class="dm-chip dm-chip--todos${(!montFiltroElem && !montFiltroFunc) ? ' is-on' : ''}" data-todos="1">Todos</button>
          <span class="dm-orbes">${elemChips}</span>
          <span class="dm-conta">${lista.length} deuses</span>
        </div>
        <div class="dm-filtros__l">
          <span class="dm-funcs">${funcChips}</span>
          <span class="dm-busca__w"><input class="dm-busca" id="dmbusca" placeholder="Buscar" value="${H(montBusca)}"></span>
        </div>
      </div>
    </div>
    <div class="dm-grade${cfg.gradeTravada ? ' dm-grade--travada' : ''}" id="dmgrade">${cards}</div>
  </section>`;
}
// comportamento PADRÃO do toque/kit (montador de 3 vagas); o cfg pode sobrescrever (ex.: a troca do emprestado).
function _montTapPadrao(cfg){ const freeN = _montFreeCount(cfg); return k => { const j = cfg.pick.indexOf(k); montDica = false;
  if (j >= 0) cfg.pick.splice(j, 1); else if (cfg.pick.length < freeN) cfg.pick.push(k); else montDica = true; render(); }; }
function _montKitAcaoPadrao(cfg){ const freeN = _montFreeCount(cfg); return k => { const j = cfg.pick.indexOf(k);
  if (j >= 0) cfg.pick.splice(j, 1); else if (cfg.pick.length < freeN) cfg.pick.push(k); montKitAberto = null; montDica = false; render(); }; }
// liga a GRADE dentro de `root` (stage no montador; o host no seletor de troca).
function _montLigarGrade(root, cfg){
  const q = s => root.querySelector(s), qq = s => [...root.querySelectorAll(s)];
  const onTap = cfg.onTap || _montTapPadrao(cfg);
  const wireCards = () => { if (!cfg.gradeTravada) [...root.querySelectorAll('.dm-card[data-pick]')].forEach(b => b.onclick = () => onTap(b.dataset.pick));
    [...root.querySelectorAll('.dm-card__i[data-info]')].forEach(el => el.onclick = ev => { ev.stopPropagation(); montDica = false; montKitAberto = el.dataset.info; render(); }); };
  wireCards();
  const bt = q('[data-todos]'); if (bt) bt.onclick = () => { montFiltroElem = null; montFiltroFunc = null; render(); };
  qq('[data-elem]').forEach(b => b.onclick = () => { montFiltroElem = (montFiltroElem === b.dataset.elem) ? null : b.dataset.elem; render(); });
  qq('[data-func]').forEach(b => b.onclick = () => { montFiltroFunc = (montFiltroFunc === b.dataset.func) ? null : b.dataset.func; render(); });
  const bu = q('#dmbusca'); if (bu) bu.oninput = () => { montBusca = bu.value; const g = q('#dmgrade'); const lista = _montFiltrados(_montJogaveis());
    if (g) g.innerHTML = lista.length ? lista.map(k => _montCardHTML(k, cfg)).join('') : '<p class="dm-vazio">Nenhum deus neste filtro.</p>';
    const c = q('.dm-conta'); if (c) c.textContent = lista.length + ' deuses'; wireCards(); };   // re-liga sem re-render (preserva o foco da busca)
  // painel de kit
  const kx = q('[data-kit-x]'); if (kx) kx.onclick = () => { montKitAberto = null; render(); };
  const kit = q('#dmkit'); if (kit) kit.onclick = ev => { if (ev.target === kit) { montKitAberto = null; render(); } };
  const onKit = cfg.onKitAcao || _montKitAcaoPadrao(cfg);
  qq('[data-kit-toggle]').forEach(b => b.onclick = () => onKit(b.dataset.kitToggle));
}
// §344b: nome da miniatura (inimigos do contexto) nunca quebra no MEIO da palavra. Com uma só linha,
// encolhe a fonte de 20px até 16px; se ainda não couber, aí sim quebra — mas só entre palavras.
function _montAjustarNomes(root){
  const nodes = (root || document).querySelectorAll('.dm-ini__n');
  nodes.forEach(n => {
    if (getComputedStyle(n).display === 'none') return;   // §359: nome de inimigo oculto (miniatura só com retrato) — não reexibir
    n.style.whiteSpace = 'nowrap'; n.style.display = 'block'; n.style.webkitLineClamp = '';
    let fs = 20; n.style.fontSize = fs + 'px';
    while (n.scrollWidth > n.clientWidth && fs > 16) { fs -= 1; n.style.fontSize = fs + 'px'; }
    if (n.scrollWidth > n.clientWidth) {   // nem a 16px coube numa linha → deixa quebrar entre palavras (2 linhas)
      n.style.whiteSpace = 'normal'; n.style.display = '-webkit-box'; n.style.webkitLineClamp = '2';
    }
  });
}
function montadorTimeHTML(cfg){
  const time = _montTime(cfg), v = cfg.validar(time);
  cfg._off = v.porDeus || {};   // §344: cartões que violam a regra (Composição)
  const vagasHTML = cfg.vagas.map((vg, i) => _montVagaHTML(i, time[i], vg)).join('');
  return `<div id="baselayer" class="dm2"><div id="dommontar"${cfg.klass ? ` class="${cfg.klass}"` : ''}>
    <button class="dmb dmb--voltar" id="bvoltar" data-voltar="1">‹ VOLTAR</button>
    <div class="dm-cabid"><h1 class="dm-titulo cin">${H(cfg.titulo)}</h1><span class="dm-sub">${H(cfg.sublinha)}</span></div>
    <section class="dm-ctx">${cfg.contextoHTML}</section>
    <section class="dm-time">
      <div class="dm-time__cab"><h2 class="dm-time__t">SEU TIME</h2>${cfg.timeAcaoHTML || ''}</div>
      <div class="dm-time__lista">${vagasHTML}</div>
    </section>
    ${_montGradeSecHTML(cfg)}
    ${cfg.semRodape ? '' : `<div class="dm-rodape">
      ${v.ok ? '' : `<span class="dm-motivo">ⓘ ${H(v.motivo)}</span>`}
      <button class="dmb dmb--go dmb--comecar" id="bcomecar" ${v.ok ? '' : 'disabled'}>${H(cfg.textoBotao)}</button>
    </div>`}
    ${montDica ? `<div class="dm-dica" id="dmdica">Tire um deus para trocar</div>` : ''}
    ${cfg.overlayHTML || ''}
    ${montKitAberto ? _montKitPanelHTML(montKitAberto, cfg) : ''}
  </div></div>`;
}
function ligarMontadorTime(cfg){
  const q = s => stage.querySelector(s), qq = s => [...stage.querySelectorAll(s)];
  const bv = q('[data-voltar]'); if (bv) bv.onclick = () => cfg.aoVoltar();
  qq('.dm-vaga__x[data-rem]').forEach(b => b.onclick = () => { const j = cfg.pick.indexOf(b.dataset.rem); if (j >= 0) cfg.pick.splice(j, 1); montDica = false; render(); });
  _montLigarGrade(stage, cfg);
  const time = _montTime(cfg), v = cfg.validar(time);
  const bc = q('#bcomecar'); if (bc && v.ok) bc.onclick = () => cfg.aoComecar(_montTime(cfg));
  if (cfg.aoLigar) cfg.aoLigar({ q, qq });   // §344: fiação extra por modo (segmentado, apelido, usar último, sair da fila)
  fit();
  _montAjustarNomes(stage);   // §344b: ajusta os nomes das miniaturas (sem quebrar palavra)
}

// §342b: o nome CURTO do Domínio ("Domínio do Olimpo" → "Olimpo"; "de Asgard"→"Asgard"; "dos Céus"→"Céus").
function _domNomeCurto(lad){ return String((lad && lad.nome) || '').replace(/^Dom[íi]nio\s+d[eoa]s?\s+/i, '') || String((lad && lad.cultura) || ''); }

/* contexto do DOMÍNIO (bloco esquerdo): inimigos da cultura (≤4 + "+N"), chefe final, aviso de trava */
function _domContextoHTML(lad){
  const trio = lad.trio || [];
  const culturaGods = ROSTER.filter(e => e.faccao === lad.cultura).map(e => e.key);
  const inimigos = culturaGods.filter(k => !trio.includes(k));
  const mostra = inimigos.slice(0, 4), resto = inimigos.length - mostra.length;
  const mini = k => { const g = HRM[k] || { nome: k, elem: 'Umbra' };
    return `<span class="dm-ini"><span class="dm-ini__p">${slot('god-' + k, ini(g.nome), COR(g.elem), 18)}</span><span class="dm-ini__n">${H(g.nome)}</span></span>`; };
  const chefe = k => { const g = HRM[k] || { nome: k, elem: 'Umbra' };
    return `<span class="dm-chefe"><span class="dm-chefe__p">${slot('god-' + k, ini(g.nome), COR(g.elem), 22)}</span><span class="dm-chefe__n">${H(g.nome)}</span></span>`; };
  return `<h2 class="dm-ctx__t cin">${H(lad.nome)}</h2>
    <div class="dm-ctx__trava"><span class="dm-ctx__lock">🔒</span> Time travado na corrida.</div>
    <div class="dm-ctx__rot">INIMIGOS DESTE DOMÍNIO</div>
    <div class="dm-ctx__inis">${mostra.map(mini).join('')}${resto > 0 ? `<span class="dm-ini dm-ini--mais"><span class="dm-ini__p dm-ini__p--mais">+${resto}</span></span>` : ''}</div>
    <div class="dm-ctx__rot">CHEFE FINAL</div>
    <div class="dm-ctx__chefes">${trio.map(chefe).join('')}</div>`;
}

/* ---------- §325/§342: MONTAR TIME antes da corrida (rota 'dominiomontar', params.cultura) ----------
   Monta 3 deuses SEUS (starters sempre possuídos → nenhuma corrida é impossível). O time TRAVA pela corrida.
   §342: usa o montador de time genérico; só o Domínio o usa por ora. */
function renderDominioMontarTime(){
  const c = String(((paramsAtuais() || {}).cultura) || '').toLowerCase();
  const lad = dominioPorCultura(c);
  if (!lad){ sairDominio(); ir('dominios', {}, { substituir: true }); render(); return; }
  const total = domTotalNiveis(lad) || 40;
  const cfg = {
    id: 'dominio', cultura: c, pick: domTimePick,
    titulo: 'MONTE SEU TIME',
    sublinha: `DOMÍNIO · ${_domNomeCurto(lad).toUpperCase()} · NÍVEL 1/${total}`,   // §342b: o NOME do Domínio (Olimpo, Asgard, Duat…), não a cultura
    contextoHTML: _domContextoHTML(lad),
    vagas: [{ tipo: 'livre' }, { tipo: 'livre' }, { tipo: 'livre' }],
    validar: (t) => { const n = t.filter(Boolean).length; return { ok: n === 3, motivo: n === 3 ? '' : `Escolha mais ${3 - n} deus${3 - n > 1 ? 'es' : ''}.`, porDeus: {} }; },
    textoBotao: 'COMEÇAR CORRIDA',
    aoComecar: (t) => iniciarCorridaDominio(c, t.slice()),
    aoVoltar: () => { montKitAberto = null; ir('dominio', { cultura: c }, { substituir: true }); render(); },   // §325: Voltar → HUB
  };
  stage.innerHTML = montadorTimeHTML(cfg);
  ligarMontadorTime(cfg);
}

function descerDominio(cultura){ iniciarNivelDominio(cultura); }
function iniciarNivelDominio(cultura){
  const c = String(cultura).toLowerCase(), lad = dominioPorCultura(c), run = dominioRun(c);
  if (!lad || !run || run.status !== 'ativo' || run.aguardandoPremio){ sairDominio(); ir('dominio', { cultura: c }, { substituir: true }); render(); return; }
  const escada = domEscadaSemana(lad, run.semanaIdx || 0);   // a corrida roda NA SUA escada semanal (virada de semana é invisível)
  dominio = { ladder: lad, cultura: c, escada };
  dominioFim = null;
  prova = null; provaFim = null; provaLances = 0; campanha = null; campanhaFim = null;
  vsCPU = true;
  const timeRun = (run.time && run.time.length === 3) ? run.time : escada.trio;   // §325: níveis/replay do TIME do jogador
  const nvDom = niveisTimeLocal(timeRun);   // §323 P2: níveis do jogador no SEU time (não no trio inimigo)
  if (typeof definirNiveisBatalha === 'function') definirNiveisBatalha(nvDom);
  st = domMontarBatalha(run, escada, { seed: (run.nivel * 7919) >>> 0 || 1, niveis: nvDom ? [nvDom, {}] : null });
  if (typeof REPLAY !== 'undefined') REPLAY.iniciar({ modo: 'dominio', cultura: c, runId: run.id || '', run: { nivel: run.nivel, bonus: run.bonus, semanaIdx: run.semanaIdx, time: (run.time || []).slice(), vida: JSON.parse(JSON.stringify(run.vida || [])), reviveGasto: (run.reviveGasto || []).slice() } });   // §318 F2 E2 + §325 P4: estado da corrida ANTES do nível (inclui o TIME p/ a re-simulação do servidor)
  if (typeof definirIaVersao === 'function') definirIaVersao(iaVersaoDeModo('dominio'));   // §322 P3: Domínios usam v2 (sem solução fixa)
  ir('batalha', {}, { substituir: true });
  render();
}
function escolherPremioDominio(cultura, tipo){
  const c = String(cultura).toLowerCase(), lad = dominioPorCultura(c), run = dominioRun(c);
  if (!lad || !run || !run.aguardandoPremio) return;
  domAplicarPremio(run, lad, tipo);
  salvarRunDominio(c, run);
  render();   // o hub re-renderiza: agora mostra "Descer ao nível N+1"
}

/* ---------- HUD do nível (faixa durante a batalha) ---------- */
function dominioHUD(){
  if (!dominio) return '';
  const run = dominioRun(dominio.cultura); if (!run) return '';
  const total = (dominio.escada && dominio.escada.niveis.length) || domTotalNiveis(dominio.ladder), chefe = domEhChefe(run.nivel);
  const bonusPct = Math.round((run.bonus || 0) * 100);
  const marca = run.marcaAnterior || 0;
  return `<div class="phud phud--dom" aria-hidden="true">
    <span class="phud__prazo">T<b>${st.turno}</b></span>
    <span class="phud__chips">
      <span class="phud__chip ${chefe ? 'phud__chip--falha' : 'phud__chip--andamento'}"><i>${chefe ? '☠' : '◆'}</i>${chefe ? 'CHEFE' : 'Nível'} ${run.nivel}/${total}</span>
      ${marca ? `<span class="phud__chip ${run.superou ? 'phud__chip--ok' : ''}"><i>▲</i>marca ${marca}</span>` : ''}
      ${bonusPct ? `<span class="phud__chip phud__chip--ok"><i>⚔</i>+${bonusPct}%</span>` : ''}
    </span>
  </div>`;
}

/* ---------- reconciliador: fim de nível ---------- */
function atualizarDominio(){
  if (!dominio || dominioFim || !st.fim) return;
  const c = dominio.cultura, run = dominioRun(c);
  if (!run){ dominioFim = { venceu: false, nivel: 0, profundidade: 0 }; pararRelogio(); return; }
  const nivelJogado = run.nivel;
  const r = domResolverBatalha(run, dominio.escada, st);   // muta a corrida (carrega vida, marca rede gasta, avança/aguarda prêmio, detecta superação)
  dominioFim = { venceu: r.venceu, chefe: r.chefe, completou: r.completou, superou: !!r.superou, nivel: nivelJogado, profundidade: run.profundidade, marca: run.marcaAnterior || 0 };
  pararRelogio();
  salvarRunDominio(c, run);   // PERSISTE por-domínio: recorde da semana + melhor de sempre, a cada nível — nunca se perde ao sair da tela
  // §318 F2 E2: nível LIMPO → envia o replay (o servidor credita Essência por nível, tetado por corrida/dia); derrota → descarta.
  if (typeof REPLAY !== 'undefined') { if (r.venceu) REPLAY.concluir(); else REPLAY.descartar(); }
}

/* ---------- sobreposição de resultado ---------- */
function dominioResultadoOverlay(){
  if (!dominio || !dominioFim) return '';
  const f = dominioFim, lad = dominio.ladder, run = dominioRun(dominio.cultura);
  const total = (dominio.escada && dominio.escada.niveis.length) || domTotalNiveis(lad);
  const timeRun = (run && run.time && run.time.length === 3) ? run.time : (run ? lad.trio : null);   // §325: a vida final é do TIME do jogador
  const vidaHTML = run ? `<div class="domtrio domtrio--result">${timeRun.map((k, i) => dominioFichaHTML(k, run.vida[i])).join('')}</div>` : '';
  let selo, titulo, msg, acoes, cls = f.venceu ? 'venceu' : 'hp';
  if (f.completou){
    selo = H(lad.nome); titulo = 'DOMÍNIO CONQUISTADO'; msg = 'Você desceu os ' + total + ' níveis da semana. A corrida se encerra no topo.';
    acoes = '<button class="b b--primary b--md" id="dfhub">Voltar ao Domínio</button>';
  } else if (!f.venceu){
    selo = 'Nível ' + f.nivel; titulo = 'DERROTA'; msg = 'A corrida termina no nível ' + f.profundidade + '. O recorde fica; recomece quando quiser.';
    acoes = '<button class="b b--primary b--md" id="dfhub">Voltar ao Domínio</button>';
  } else if (f.chefe){   // chefe vencido com prêmio a escolher
    selo = 'Chefe · nível ' + f.nivel; titulo = 'CHEFE VENCIDO'; msg = 'Reivindique a recompensa da corrida antes de descer.';
    acoes = '<button class="b b--primary b--md" id="dfpremio">Reivindicar recompensa ›</button>';
  } else {   // nível comum vencido
    selo = 'Nível ' + f.nivel; titulo = 'NÍVEL VENCIDO'; msg = 'A vida carrega para o próximo nível (cura parcial aplicada).';
    acoes = '<button class="b b--primary b--md" id="dfprox">Próximo nível ›</button>';
  }
  // §275: o INSTANTE da superação — bateu a marca da semana passada AGORA (o único momento comemorável).
  // Reusa a linguagem do banner de ranque (caixa dourada centrada). Substitui o selo/título do nível.
  if (f.superou){
    cls = 'superou';
    selo = '▲ MARCA SUPERADA';
    titulo = 'RECORDE ANTERIOR SUPERADO';
    msg = 'Nível ' + f.profundidade + ' — você passou a marca da semana passada (nível ' + f.marca + '). Continue: cada nível a mais é recorde novo.';
  }
  return `<div class="ov"><div class="ovbox"><div class="result result--prova result--${cls}">
    <span class="result__selo">${selo}</span>
    <h1>${titulo}</h1>
    <p class="result__msg">${msg}</p>
    ${vidaHTML}
    <div class="result__acoes">${acoes}</div>
  </div></div></div>`;
}
function ligarDominioFim(){
  const q = s => stage.querySelector(s);
  const hub = q('#dfhub'); if (hub) hub.onclick = () => sairParaHubDominio();
  const pr = q('#dfpremio'); if (pr) pr.onclick = () => sairParaHubDominio();   // vai ao hub para escolher o prêmio (§240: a escolha vive no hub, com saída)
  const px = q('#dfprox'); if (px) px.onclick = () => iniciarNivelDominio(dominio.cultura);
}
function sairDominio(){ dominio = null; dominioFim = null; }
function sairParaHubDominio(){ const c = dominio && dominio.cultura; sairDominio(); ir('dominio', { cultura: c }, { substituir: true }); render(); }

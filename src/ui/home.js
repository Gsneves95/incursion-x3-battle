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
  { chave: 'desafios',    arte: 'desafios',    rotulo: 'Desafios',    rota: 'desafios', placeholder: true },
  { chave: 'invocacao',   arte: 'invocacao',   rotulo: 'Invocação',   rota: 'invocacao' },
  { chave: 'colecao',     arte: 'colecao',     rotulo: 'Coleção',     rota: 'colecao' },
  { chave: 'loja',        arte: 'loja',        rotulo: 'Loja',        rota: 'embreve', titulo: 'Loja' },
  { chave: 'batalha-cpu', arte: 'batalha-cpu', rotulo: 'Batalha CPU', rota: 'selecao', params: { novo: true } },
  { chave: 'pvp',         arte: 'batalha-pvp', rotulo: 'PvP',         rota: null },
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
  if (d.chave === 'provacoes') return selo('Fase 5');   // Provações = MISSÕES, que chegam no PvP (§213)
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
  if (d.chave === 'pvp') return selo('Fase 5');
  return '';
}

function bannerCardHTML(d){
  const off = !d.rota;
  const tag = off ? 'div' : 'button';                 // sem rota = não navega, não foca
  const attr = off ? '' : ` data-dest="${H(d.chave)}"`;
  const cls = ['bcard']; if (off) cls.push('bcard--off'); if (d.chave === 'pvp') cls.push('bcard--pvp');
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

/* ---------- marcador de MISSÕES (§213) — a rota "Provações" HOJE ----------
// As Provações voltam como MISSÕES de longo prazo contadas em PvP; até a Fase 5 chegar, esta
// tela é um marcador HONESTO — NÃO aponta para os Desafios (o banner que promete liberar deus
// não pode desembocar na tela de perícia). Separar as rotas agora resolve a incoerência sem
// esperar a F6. */
function renderMissoes(){
  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="stagemark">INCURSION</div>
  <div class="tela">
    <header class="tela__cab">
      <button class="b b--quiet b--md" id="bvoltar">‹ Início</button>
      <h1 class="tela__titulo">Provações</h1>
      <span class="tela__espaco"></span>
    </header>
    <div class="tela__vazio">
      <span class="tela__vazioic">◈</span>
      <p class="tela__vaziomsg">As <b>Provações</b> voltam como <b>missões</b> de longo prazo — "20 vitórias com Zeus libera o próximo deus" — contadas no <b>PvP</b>.<br>Chegam com a <b>Fase 5</b>. Por ora, a perícia se prova nos <b>Desafios</b>.</p>
    </div>
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
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

// A TELA "Desafios" (F4/§212): a Provação da Semana, os Desafios de Composição e o acervo de
// PERGAMINHOS (63, genéricas fora), agrupado por FAIXA de dificuldade (dos nós medidos).
function renderProvacoes(){
  const acervo = acervoPergaminhos();
  const porFaixa = ['Fácil', 'Médio', 'Difícil', 'Épico'].map(f => ({
    f,
    itens: acervo.filter(p => p.faixa === f)
      .sort((a, b) => ((HRM[a.key] && HRM[a.key].nome) || a.key).localeCompare((HRM[b.key] && HRM[b.key].nome) || b.key, 'pt')),
  })).filter(s => s.itens.length);

  const secaoFaixa = s => `
    <div class="psec__cab"><h2 class="psec__faixa faixa--${faixaClasse(s.f)}">${s.f}</h2><span class="psec__n">${s.itens.length}</span></div>
    <ul class="plist">${s.itens.map(linhaProvHTML).join('')}</ul>`;

  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="tela">
    <header class="tela__cab">
      <button class="b b--quiet b--md" id="bvoltar">‹ Início</button>
      <h1 class="tela__titulo">Desafios</h1>
      <span class="tela__cont">${acervo.length}</span>
    </header>
    <div class="tela__rol" id="provrol">
      ${bannerSemanalHTML()}
      <button class="pdesafios" data-desafios="1"><span>⚔ Desafios de Composição</span><span class="pdesafios__go">›</span></button>
      <div class="psec__cab psec__cab--acervo"><h2>PERGAMINHOS</h2><span class="psec__n">${acervo.length}</span></div>
      <p class="psec__nota">Desafios de perícia validados. Vencer avança a maestria e grava o placar — a coleção vem pela Invocação.</p>
      ${porFaixa.map(secaoFaixa).join('')}
    </div>
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  const bs = stage.querySelector('.psem[data-semanal]');
  if (bs) bs.onclick = () => iniciarSemanal();
  const bd = stage.querySelector('.pdesafios[data-desafios]');
  if (bd) bd.onclick = () => { ir('composicao'); render(); };
  [...stage.querySelectorAll('.prow[data-prova]')].forEach(b => {
    // pergaminho é desafio de perícia: sempre jogável (independe de ter o deus).
    b.onclick = () => iniciarProva(b.dataset.prova);
  });
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
  creditarMaestria();   // F3.5: a vitória conta p/ a maestria dos deuses que jogaram (só contador, sem poder)
  if (!perfil.provacoes) perfil.provacoes = {};
  if (p.desafio) {
    // DESAFIO (F3.6): sem desbloqueio de deus. Recompensa LEVE (Essência) só na 1ª vitória — o resto é maestria.
    const jaFeito = !!perfil.provacoes[p.scoreKey];
    if (!jaFeito && p.recompensaEss) perfil = creditar(perfil, 'essencia', p.recompensaEss);
    perfil.provacoes[p.scoreKey] = { feito: true, em: Date.now() };
    provaFim.jaFeito = jaFeito;
    provaFim.recompensaEss = jaFeito ? 0 : (p.recompensaEss || 0);
    const rd = salvar(perfil);
    if (rd && !rd.ok && st) st.log.push({ turno: st.turno, msg: '⚠ vitória, mas a gravação falhou: ' + rd.erro });
    return;
  }
  // PERGAMINHO (F4/§212): vencer NÃO libera deus — a coleção anda só pela Invocação. A maestria
  // (creditada acima, cosmética) e o PLACAR de lances são a recompensa. Só grava se melhorou o
  // recorde. scoreKey separa a semanal ('semanal:AAAAW##') da Provação regular do mesmo deus.
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
  const ehDesafio = !!prova.desafio;
  const nome = nomeDoDeus(prova.key);
  let titulo, msg, cls;
  if (venceu && ehDesafio) {
    titulo = 'DESAFIO VENCIDO'; cls = 'venceu';
    msg = f.recompensaEss ? `Composição provada. +${f.recompensaEss} ✦ de Essência.` : 'Composição provada — Essência já recebida antes.';
  } else if (venceu) {
    // PERGAMINHO (F4/§212): sem desbloqueio — perícia provada, maestria + placar. A semanal
    // mantém a identidade "Provação da Semana" (o dono a listou assim).
    titulo = prova.semanal ? 'PROVAÇÃO SEMANAL VENCIDA' : 'PERGAMINHO VENCIDO'; cls = 'venceu';
    msg = f.recorde ? 'Perícia provada. Maestria avançada e novo recorde de placar.' : 'Perícia provada. Maestria avançada — placar mantido.';
  }
  else if (f.categoria === 'hp') { titulo = 'DERROTA'; cls = 'hp'; msg = 'Seus deuses tombaram em campo.'; }
  else if (f.categoria === 'prazo') { titulo = 'PRAZO ESGOTADO'; cls = 'prazo'; msg = 'O limite de turnos passou antes da vitória.'; }
  else { titulo = 'CONDIÇÃO QUEBRADA'; cls = 'cond'; msg = motivoHumano(f.motivo); }
  const placar = (venceu && !ehDesafio && f.minimo != null)
    ? `<div class="result__placar"><span>Vencido em <b>${f.lances}</b> lance${f.lances === 1 ? '' : 's'}</span><span class="result__min">melhor conhecido: ${f.minimo}</span>${f.lances <= f.minimo ? '<span class="result__rec">✦ no ritmo do ótimo</span>' : ''}</div>`
    : '';
  const selo = ehDesafio ? 'Desafio de composição' : `Pergaminho · ${H(prova.faixa || prova.nivel)}`;
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
  const destino = ehDesafio ? 'composicao' : 'desafios';   // §213: pergaminho volta ao hub 'desafios'; composição à sua lista 'composicao'
  const v = q('#pfvoltar'); if (v) v.onclick = () => { sairProva(); ir(destino, {}, { substituir: true }); render(); };
  const dsfId = prova && prova.desafioId, pkey = prova && prova.key;
  const t = q('#pftentar'); if (t) t.onclick = () => { if (ehDesafio) { desafioTimePick = []; sairProva(); ir('desafiomontar', { id: dsfId }); render(); } else iniciarProva(pkey); };
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

function tileColecaoHTML(k){
  const g = HRM[k] || { nome: k, elem: 'Umbra' };
  const tem = temDeus(k);
  const cls = ['ctile']; cls.push(tem ? 'ctile--tem' : 'ctile--falta');
  const rar = raridadeDe(k);
  return `<button class="${cls.join(' ')}" data-deus="${k}" title="${H(g.nome)}">
    <span class="ctile__p">${slot('god-' + k, ini(g.nome), tem ? COR(g.elem) : '#6a6390', 20)}</span>
    <span class="ctile__el" style="background:${COR(g.elem)}"></span>
    <span class="ctile__rar rar--${rar}">${RAR_ROT[rar] || rar}</span>
    ${tem ? pipMaestria(k) : '<span class="ctile__lock">⚿</span>'}
    <span class="ctile__n">${H(g.nome)}</span>
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
      <div class="cgrid">${ks.map(tileColecaoHTML).join('')}</div>
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
  [...stage.querySelectorAll('.ctile[data-deus]')].forEach(b => {
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
function renderDeusDetalhe(){
  const k = (paramsAtuais() || {}).key;
  const g = HRM[k] || { nome: k, elem: 'Umbra', faccao: '', classe: '', funcao: '' };
  const kit = CKIT[k];
  const tem = temDeus(k);
  const rar = raridadeDe(k);
  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="tela">
    <header class="tela__cab">
      <button class="b b--quiet b--md" id="bvoltar">‹ Voltar</button>
      <h1 class="tela__titulo">${H(g.nome)}</h1>
      <span class="dcab__rar rar--${rar}">${RAR_ROT[rar] || rar}</span>
    </header>
    <div class="tela__rol">
      <div class="dhead">
        <div class="dhead__art">${slot('god-' + k, ini(g.nome), tem ? COR(g.elem) : '#6a6390', 40)}</div>
        <div class="dhead__id">
          <span class="dhead__sub">${H(g.faccao)} · ${H(ELAB[g.elem] || g.elem)} · ${H(g.classe)} · ${H(g.funcao)}</span>
          <span class="dhead__estado ${tem ? 'tem' : 'falta'}">${tem ? '✓ Na coleção' : '⚿ Ainda não conquistado'}</span>
        </div>
      </div>
      ${maestriaDetalheHTML(k)}
      ${provacaoDetalheHTML(k)}
      <div class="dkit">
        ${kit ? `${linhaKitHTML('BÁS', kit.basico)}${linhaKitHTML('HAB', kit.habilidade)}${linhaKitHTML('MIL', kit.milagre)}
          ${kit.passiva ? `<div class="krow krow--pas"><div class="krow__h"><span class="krow__rot">PAS</span><b>${H(kit.passiva.nome)}</b></div><div class="krow__t">${H(kit.passiva.efeito)}</div></div>` : ''}`
          : '<div class="krow"><div class="krow__t">Kit em produção.</div></div>'}
      </div>
    </div>
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  const jb = stage.querySelector('[data-jogarprova]');
  if (jb) jb.onclick = () => iniciarProva(jb.dataset.jogarprova);
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

function renderCampanha(){
  const encs = campEncontros();
  const feitos = encs.filter(e => encFeito(e.id)).length;
  const cap = (typeof CAMPANHA !== 'undefined' && CAMPANHA) ? CAMPANHA : { nome: 'Campanha', subtitulo: '' };
  stage.innerHTML = `<div id="baselayer"><div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="tela">
    <header class="tela__cab">
      <button class="b b--quiet b--md" id="bvoltar">‹ Início</button>
      <h1 class="tela__titulo">Campanha</h1>
      <span class="tela__cont">${feitos}/${encs.length}</span>
    </header>
    <div class="tela__rol">
      <div class="ccap"><h2>${H(cap.nome)}</h2><p>${H(cap.subtitulo || '')}</p></div>
      <div class="clista">${encs.map((e, i) => cardEncontroHTML(e, encEstado(e, i, encs))).join('')}</div>
    </div>
  </div>
  </div>`;
  const v = stage.querySelector('#bvoltar');
  if (v) v.onclick = () => { if (!voltar()) ir('home', {}, { substituir: true }); render(); };
  [...stage.querySelectorAll('.cenc[data-enc]')].forEach(b => {
    if (b.disabled) return;
    b.onclick = () => iniciarEncontro(b.dataset.enc);
  });
  fit();
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
  return `<div class="phud phud--camp" aria-hidden="true">
    <span class="phud__prazo">T<b>${st.turno}</b>${N ? '/' + N : ''}</span>
    <span class="phud__chips"><span class="phud__chip phud__chip--andamento"><i>◆</i>Ensina: ${H(en.titulo || '')}</span></span>
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
function proximoEncontro(id){
  const encs = campEncontros(); const i = encs.findIndex(e => e.id === id);
  return (i >= 0 && i + 1 < encs.length) ? encs[i + 1] : null;
}
function campanhaResultadoOverlay(){
  if (!campanha || !campanhaFim) return '';
  const f = campanhaFim, venceu = f.venceu;
  const prox = venceu ? proximoEncontro(campanha.id) : null;
  let placar = '';
  if (venceu) {
    placar = f.recompensa && recompensaTexto(f.recompensa)
      ? `<div class="result__placar"><span>Recompensa</span><b>${H(recompensaTexto(f.recompensa))}</b></div>`
      : (f.jaFeito ? '<p class="result__msg">Encontro já vencido — sem nova recompensa.</p>' : '');
  }
  return `<div class="ov"><div class="ovbox"><div class="result result--prova result--${venceu ? 'venceu' : 'hp'}">
    <span class="result__selo">${H((typeof CAMPANHA !== 'undefined' && CAMPANHA) ? CAMPANHA.nome : 'Campanha')}</span>
    <h1>${venceu ? 'ENCONTRO VENCIDO' : 'DERROTA'}</h1>
    <p class="result__prova">${H(campanha.nome || '')}</p>
    <p class="result__msg">${venceu ? H('Aprendido: ' + ((campanha.ensina || {}).titulo || '')) : 'Seus deuses tombaram — tente de novo.'}</p>
    ${placar}
    <div class="result__acoes">
      <button class="b b--quiet b--md" id="cfvoltar">Voltar à campanha</button>
      ${venceu
        ? (prox ? '<button class="b b--primary b--md" id="cfprox">Próximo encontro</button>' : '')
        : '<button class="b b--primary b--md" id="cftentar">Tentar de novo</button>'}
    </div>
  </div></div></div>`;
}
function ligarCampanhaFim(){
  const q = s => stage.querySelector(s);
  const v = q('#cfvoltar'); if (v) v.onclick = () => { sairCampanha(); ir('campanha', {}, { substituir: true }); render(); };
  const t = q('#cftentar'); if (t) t.onclick = () => { const e = campanha; iniciarEncontroComTime(e, e.aliados); };
  const p = q('#cfprox'); if (p) { const prox = proximoEncontro(campanha.id); p.onclick = () => { sairCampanha(); iniciarEncontro(prox.id); }; }
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
  const rec = (perfil && perfil.provacoes && perfil.provacoes[p.scoreKey]) || null;
  const inimigos = (p.inimigos || []).map(k => (HRM[k] && HRM[k].nome) || k).join(' · ');
  return `<button class="psem" data-semanal="1">
    <span class="psem__p">${slot('god-' + p.key, ini(g.nome), COR(g.elem), 24)}</span>
    <span class="psem__id">
      <span class="psem__rot">PROVAÇÃO DA SEMANA <b>#${p.semanaISO}</b></span>
      <span class="psem__tit">${H(p.titulo)} — mantenha ${H(g.nome)} de pé em ${p.deadline} turnos</span>
      <span class="psem__foe">contra ${H(inimigos)}</span>
    </span>
    <span class="psem__pe">
      <span class="psem__rec">${rec ? `recorde ${rec.lances} lance${rec.lances === 1 ? '' : 's'}` : 'não jogada'}</span>
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

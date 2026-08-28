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
  const rec = (concluida && perfil && perfil.provacoes && perfil.provacoes[p.key]) ? perfil.provacoes[p.key] : null;
  const selo = concluida
    ? `<span class="prow__selo">✓ conquistado${rec && rec.lances != null ? ` · ${rec.lances} lance${rec.lances === 1 ? '' : 's'}` : ''}</span>`
    : '';
  return `<li class="prowli"><button class="${cls.join(' ')}" data-prova="${p.key}">
    <span class="prow__p">${slot('god-' + p.key, ini(g.nome), COR(g.elem), 22)}</span>
    <span class="prow__el" style="background:${COR(g.elem)}"></span>
    <span class="prow__id">
      <span class="prow__deus">${H(g.nome)}${selo}</span>
      <span class="prow__tit">${H(p.titulo || '')}${g.faccao ? ` · ${H(g.faccao)}` : ''}</span>
    </span>
    <span class="prow__meta">
      <span class="prow__niv niv--${nivelPeso(p.nivel)}">${H(p.nivel || '')}</span>
      ${pipsDif(p.dificuldade || 1)}
      <span class="prow__seta">${concluida ? '↻' : '▷'}</span>
    </span>
  </button></li>`;
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
  [...stage.querySelectorAll('.prow[data-prova]')].forEach(b => {
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

/* ---------- HUD: a condição VISÍVEL durante a partida ---------- */
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
    <div class="phud__linha">
      <span class="phud__tit">${H(prova.titulo)}</span>
      <span class="phud__prazo ${perigo ? 'perigo' : ''}">Turno <b>${st.turno}</b>${N != null ? ` / ${N}` : ''}${restam != null ? ` · ${restam === 1 ? 'último turno' : restam === 0 ? 'prazo esgotado' : 'faltam ' + restam}` : ''}</span>
    </div>
    ${extras ? `<div class="phud__chips">${extras}</div>` : ''}
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
  provaFim.jaTinha = !!(perfil.deuses && perfil.deuses[p.key]);
  perfil = adicionarDeus(perfil, p.key, Date.now());
  if (!perfil.provacoes) perfil.provacoes = {};
  const antes = perfil.provacoes[p.key];
  if (!antes || provaLances < antes.lances) perfil.provacoes[p.key] = { lances: provaLances, minimo: p.minimo, em: Date.now() };
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
  const f = provaFim, venceu = f.resultado === 'vitoria', nome = nomeDoDeus(prova.key);
  let titulo, msg, cls;
  if (venceu) { titulo = 'PROVAÇÃO VENCIDA'; cls = 'venceu'; msg = f.jaTinha ? `${nome} já estava na sua coleção — resultado registrado.` : `${nome} entra na sua coleção.`; }
  else if (f.categoria === 'hp') { titulo = 'DERROTA'; cls = 'hp'; msg = 'Seus deuses tombaram em campo.'; }
  else if (f.categoria === 'prazo') { titulo = 'PRAZO ESGOTADO'; cls = 'prazo'; msg = 'O limite de turnos passou antes da vitória.'; }
  else { titulo = 'CONDIÇÃO QUEBRADA'; cls = 'cond'; msg = motivoHumano(f.motivo); }
  const placar = venceu && f.minimo != null
    ? `<div class="result__placar"><span>Concluída em <b>${f.lances}</b> lance${f.lances === 1 ? '' : 's'}</span><span class="result__min">melhor conhecido: ${f.minimo}</span>${f.lances <= f.minimo ? '<span class="result__rec">✦ no ritmo do ótimo</span>' : ''}</div>`
    : '';
  return `<div class="ov"><div class="ovbox"><div class="result result--prova result--${cls}">
    <span class="result__selo">${H(prova.nivel)} · dificuldade ${prova.dificuldade}</span>
    <h1>${titulo}</h1>
    <p class="result__prova">${H(prova.titulo)}</p>
    <p class="result__msg">${H(msg)}</p>
    ${placar}
    <div class="result__acoes">
      <button class="b b--quiet b--md" id="pfvoltar">Voltar às Provações</button>
      ${venceu ? '' : '<button class="b b--primary b--md" id="pftentar">Tentar de novo</button>'}
    </div>
  </div></div></div>`;
}
function ligarProvaFim(){
  const q = s => stage.querySelector(s);
  const v = q('#pfvoltar'); if (v) v.onclick = () => { sairProva(); ir('provacoes', {}, { substituir: true }); render(); };
  const t = q('#pftentar'); if (t) t.onclick = () => { iniciarProva(prova.key); };
}
function sairProva(){ prova = null; provaFim = null; provaLances = 0; }

/* ---------- entrada: montar e começar a Provação ---------- */
function iniciarProva(key){
  const p = (typeof PROVACOES !== 'undefined') ? PROVACOES.find(x => x.key === key) : null;
  if (!p) return;
  prova = p; provaFim = null; provaLances = 0;
  st = montarProvacao(p);
  vsCPU = true;   // os inimigos da Provação são a CPU (o jogador controla o lado 0)
  ir('batalha', {}, { substituir: true });
  render();
}

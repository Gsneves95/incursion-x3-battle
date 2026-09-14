// ===================================================================
// DOMÍNIOS (§273) — a CORRIDA: sequência de batalhas 3v3 contra uma ESCADA
// MEDIDA de inimigos. Vida CARREGA entre níveis com cura parcial; chefe a cada
// 10 níveis; vencido o chefe, um PRÊMIO (cura / reviver / bônus de dano).
//
// MODELO DE ESTADO (a medição da fase 1 fixou isto):
//   cada nível é um novoEstado FRESCO. RESETAM: recarga, efeitos, contadores e o
//   "1× por partida" de PICO (Terceiro Olho e afins — pico de kit, um por nível).
//   CARREGAM: a vida, o bônus da corrida, e a REDE de ressurreição já gasta
//   (revive/vidaExtra/auto-renascimento passam a valer 1× por CORRIDA, via o flag
//   reviveGastoCorrida no motor — rede que se remonta a cada nível não é rede).
//   Passivas de ABERTURA disparam por nível, como sempre (identidade de kit).
//
// A ESCADA é DADO (data/dominios/<cultura>.json), gerada e MEDIDA fora do jogo
// (tools/gerar_dominios.js). Escada nova = arquivo novo, nunca código novo. A
// dificuldade por dano do inimigo sobe por FAIXA de 10; o sorteio SAIU (a medição
// mostrou que com vida cheia o melhor trio ainda perde 6% dos sorteios — loteria).
//
// Módulo PURO (roda na build, no gerador e no browser): sem DOM, sem localStorage,
// sem Date. A UI (home.js) monta o st, a vida carrega no reconciliador, o prêmio é
// escolhido; a persistência (perfil.dominios.run) mora no perfil, não aqui.
// ===================================================================

const DOM_TETO_BONUS = 0.5;    // teto do bônus de dano acumulado (a medição: +100% vira passeio)
const DOM_PASSO_BONUS = 0.1;   // cada prêmio de BÔNUS soma +10% (cinco escolhas até o teto)
const DOM_FAIXA = 10;          // níveis por faixa; múltiplo de 10 = CHEFE
const DOM_HP_REVIVER = 60;     // vida com que um caído volta pelo prêmio REVIVER (metade)

function _domGods() {   // dual: global no bundle, require em Node (como catalogoProvacao)
  return (typeof GODS !== 'undefined') ? GODS : require('./catalogo.js').GODS;
}
function _domHpBase(gods, key) { const g = gods[key]; return (g && g.hp) || 120; }
function domEhChefe(n) { return n % DOM_FAIXA === 0; }

// ---- scaler de DANO no kit (só multiplica dmg; controle/efeitos intocados) ----
// Mesma régua do gerador e do runtime: um kit escalado é o MESMO objeto que a
// escada mediu. Recursa em entao/senao/agenda/faz (dano condicional também sobe).
function domEscalarFx(fx, mul) {
  for (const e of (fx || [])) {
    if (!e || typeof e !== 'object') continue;
    if (e.t === 'dmg') {
      if (typeof e.v === 'number') e.v = Math.round(e.v * mul);
      if (Array.isArray(e.posicional)) e.posicional = e.posicional.map(x => Math.round(x * mul));
      for (const kk of ['seEncharcado', 'seAdormecido', 'seDia']) if (typeof e[kk] === 'number') e[kk] = Math.round(e[kk] * mul);
    }
    for (const kk of ['entao', 'senao', 'agenda', 'faz']) if (Array.isArray(e[kk])) domEscalarFx(e[kk], mul);
  }
}
function domEscalarKit(kit, mul) {
  if (mul === 1) return kit;
  const g = JSON.parse(JSON.stringify(kit));
  (g.ab || []).forEach(a => domEscalarFx(a.fx, mul));
  return g;
}
// catálogo de UM nível: trio do jogador com +bônus de dano; inimigos com o danoMult
// da faixa. Só as chaves em jogo mudam; o resto do catálogo segue de referência (o
// motor lê por chave, então basta cobrir as 6 unidades — cobrimos tudo por segurança).
function domCatalogoNivel(base, trioKeys, bonus, inimigos, danoMult) {
  const gods = base || _domGods();
  const cat = {};
  for (const k in gods) cat[k] = gods[k];
  const pMul = 1 + (bonus || 0);
  if (pMul !== 1) for (const k of trioKeys) if (gods[k]) cat[k] = domEscalarKit(gods[k], pMul);
  if (danoMult !== 1) for (const k of (inimigos || [])) if (gods[k] && !trioKeys.includes(k)) cat[k] = domEscalarKit(gods[k], danoMult);
  return cat;
}

// ---- CICLO SEMANAL (§275): a semana SEM servidor, robusta a relógio errado ----
// A semana é a ISO-8601 do RELÓGIO DO APARELHO (como as Provações semanais). A CHAVE é
// "AAAA-Www"; o ÍNDICE absoluto (ano*53+semana) incrementa +1 a cada semana ISO (inclusive na
// virada de ano) e serve para escolher a escada (semanas[indice % N]). Relógio errado/viagem de
// fuso só MUDA a chave/índice — NUNCA apaga dado, porque os recordes vivem num MAPA por chave
// (perfil, §275) e o melhor-de-sempre só cresce; e a corrida em andamento carrega a SUA semana e
// termina na SUA escada, então a virada é invisível para ela. Pior caso: jogar o mapa de outra
// semana. Puro, sem Date interno — a data entra por parâmetro (a borda passa new Date()).
function _domQuintaISO(d) {   // a quinta-feira desta semana resolve semana E ano ISO de uma vez
  const u = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dia = u.getUTCDay() || 7;
  u.setUTCDate(u.getUTCDate() + 4 - dia);
  return u;
}
function domSemanaISO(d) { const u = _domQuintaISO(d); const ini = new Date(Date.UTC(u.getUTCFullYear(), 0, 1)); return Math.ceil((((u - ini) / 86400000) + 1) / 7); }
function domAnoISO(d) { return _domQuintaISO(d).getUTCFullYear(); }
function domSemanaChave(d) { d = d || new Date(); return domAnoISO(d) + '-W' + String(domSemanaISO(d)).padStart(2, '0'); }
function domSemanaAbsoluta(d) { d = d || new Date(); return domAnoISO(d) * 53 + domSemanaISO(d); }   // +1 por semana ISO (monotônico, inclusive na virada de ano)
function domIndiceSemana(ladder, d) { const n = (ladder.semanas || []).length || 1; return ((domSemanaAbsoluta(d) % n) + n) % n; }
function domChaveSemanaAnterior(d) { d = d || new Date(); return domSemanaChave(new Date(d.getTime() - 7 * 86400000)); }

// vista PLANA de UMA semana da escada (o que as funções de corrida consomem: .niveis + trio/cura/teto).
function domEscadaSemana(ladder, weekIndex) {
  const sem = (ladder.semanas || [])[weekIndex] || (ladder.semanas || [])[0] || { niveis: ladder.niveis || [] };
  return { cultura: ladder.cultura, trio: ladder.trio, curaPorNivel: ladder.curaPorNivel, tetoBonusDano: ladder.tetoBonusDano, faixa: ladder.faixa, niveis: sem.niveis };
}

// ---- a CORRIDA (estado run-scoped; zera com a corrida — não fere o invariante 3) ----
// weekIndex/weekChave/marcaAnterior são do CICLO SEMANAL (§275): a corrida carrega a SUA semana
// (termina na sua escada mesmo se a semana virar) e a MARCA a bater (recorde da semana anterior,
// capturada no início — a superação dela é o instante comemorável). Opcionais: fora do ciclo (gerador
// medindo piso) a corrida roda na semana 0 sem marca.
function domNovaCorrida(ladder, weekIndex, weekChave, marcaAnterior) {
  const gods = _domGods();
  const trio = ladder.trio;
  return {
    cultura: ladder.cultura,
    semanaIdx: weekIndex || 0,          // índice da escada semanal desta corrida
    semana: weekChave || '',            // chave "AAAA-Www" — a corrida pertence a esta semana
    marcaAnterior: marcaAnterior || 0,  // recorde da semana anterior (a marca a bater)
    superou: false,                     // já anunciou a superação da marca nesta corrida?
    nivel: 1,
    vida: trio.map(k => ({ hp: _domHpBase(gods, k), vivo: true })),   // [{hp,vivo}] por SLOT do trio
    bonus: 0,                 // bônus de dano acumulado (0..DOM_TETO_BONUS)
    reviveGasto: [],          // chaves do trio cuja rede de ressurreição já foi usada
    profundidade: 0,          // nível mais fundo LIMPO
    status: 'ativo',          // 'ativo' | 'morto' | 'completo'
    aguardandoPremio: false,  // venceu um chefe e ainda não escolheu o prêmio
  };
}

function domDefNivel(ladder, n) { return (ladder.niveis || [])[n - 1] || null; }

// monta o st de um nível: novoEstado FRESCO + vida que carrega + rede gasta + catálogo escalado.
function domMontarBatalha(run, ladder, opc = {}) {
  const gods = opc.gods || _domGods();
  const trio = ladder.trio;
  const def = domDefNivel(ladder, run.nivel);
  if (!def) return null;
  const seed = (opc.seed != null) ? opc.seed : ((run.nivel * 7919) >>> 0) || 1;
  const cat = domCatalogoNivel(gods, trio, run.bonus, def.inimigos, def.danoMult || 1);
  const st = novoEstado(trio, def.inimigos, seed, 0, null, cat);   // comeca=0: o jogador abre
  st.lados[0].units.forEach((u, i) => {
    const c = run.vida[i];
    if (c && c.vivo) { u.hp = Math.min(u.maxHp, c.hp); }
    else { u.hp = 0; u.vivo = false; }
    if (run.reviveGasto.includes(trio[i])) u.reviveGastoCorrida = true;   // §273: a rede deste deus já foi gasta na corrida
  });
  return st;
}

// vida final do lado do jogador (lida ao fim da batalha, para carregar).
function domVidaFinal(st) { return st.lados[0].units.map(u => ({ hp: u.hp, vivo: u.vivo })); }
// chaves do trio que RESSUSCITARAM nesta batalha (a rede foi usada) — evento 'revive' no log.
function domRevivesNaBatalha(st, trioKeys) {
  const set = new Set();
  for (const ev of (st.log || [])) if (ev && ev.tipo === 'revive' && trioKeys.includes(ev.alvo)) set.add(ev.alvo);
  return [...set];
}

// resolve o fim de um nível: muta a corrida. Devolve {venceu, chefe, morreu, completou}.
function domResolverBatalha(run, ladder, st) {
  const trio = ladder.trio;
  const venceu = !!(st.fim && st.fim.resultado === 'vitoria' && st.fim.lado === 0);
  const chefe = domEhChefe(run.nivel);
  if (!venceu) { run.status = 'morto'; return { venceu: false, chefe, morreu: true, completou: false }; }
  // venceu: a rede gasta CARREGA; a vida final CARREGA
  for (const k of domRevivesNaBatalha(st, trio)) if (!run.reviveGasto.includes(k)) run.reviveGasto.push(k);
  run.vida = domVidaFinal(st);
  run.profundidade = run.nivel;
  // §275: superou a MARCA (recorde da semana anterior) AGORA? (só há marca a bater se marcaAnterior>0)
  const superou = !run.superou && (run.marcaAnterior || 0) > 0 && run.profundidade > run.marcaAnterior;
  if (superou) run.superou = true;
  // chefe vencido COM próximo nível → escolhe prêmio (portão). Chefe FINAL → não há prêmio a gastar: completa.
  if (chefe && run.nivel < (ladder.niveis || []).length) { run.aguardandoPremio = true; return { venceu: true, chefe: true, morreu: false, completou: false, superou }; }
  const completou = domAvancar(run, ladder);
  return { venceu: true, chefe, morreu: false, completou, superou };
}

// avança um nível: cura parcial nos vivos (menos ao ENTRAR no 1º, que não existe aqui —
// só avançamos DEPOIS de vencer). Devolve true se a escada acabou (corrida COMPLETA).
function domAvancar(run, ladder) {
  run.nivel += 1;
  if (run.nivel > (ladder.niveis || []).length) { run.status = 'completo'; return true; }
  domCurarParcial(run, ladder);
  return false;
}
function domCurarParcial(run, ladder) {
  const gods = _domGods(), trio = ladder.trio, cura = ladder.curaPorNivel || 0;
  run.vida = run.vida.map((c, i) => c.vivo ? { hp: Math.min(_domHpBase(gods, trio[i]), c.hp + cura), vivo: true } : c);
}

// ---- prêmios do chefe (opção que não faz nada é armadilha — §252: some) ----
function domPremiosDisponiveis(run) {
  const lista = ['cura'];                                     // CURA é o piso: sempre disponível (cura cheia, nunca prejudica)
  if (run.vida.some(c => !c.vivo)) lista.push('reviver');     // REVIVER só quando há CAÍDO (§252)
  if ((run.bonus || 0) < DOM_TETO_BONUS - 1e-9) lista.push('bonus');   // BÔNUS só abaixo do teto (+50%)
  return lista;
}
// aplica o prêmio e AVANÇA (o prêmio é o portão para o próximo nível). alvo: índice do slot caído (reviver).
function domAplicarPremio(run, ladder, tipo, alvo) {
  const gods = _domGods(), trio = ladder.trio;
  if (tipo === 'cura') run.vida = run.vida.map((c, i) => c.vivo ? { hp: _domHpBase(gods, trio[i]), vivo: true } : c);
  else if (tipo === 'reviver') {
    let i = (typeof alvo === 'number') ? alvo : trio.indexOf(alvo);
    if (i < 0 || run.vida[i].vivo) i = run.vida.findIndex(c => !c.vivo);   // 1º caído se não especificado
    if (i >= 0) run.vida[i] = { hp: Math.min(_domHpBase(gods, trio[i]), DOM_HP_REVIVER), vivo: true };
  } else if (tipo === 'bonus') run.bonus = Math.min(DOM_TETO_BONUS, (run.bonus || 0) + DOM_PASSO_BONUS);
  run.aguardandoPremio = false;
  return domAvancar(run, ladder);
}

// ---- validação de FORMA da escada (chamada na BUILD; falha alto, não em runtime) ----
function _domValidarNiveis(rot, niveis, trio, catalogoKeys, tol, erros) {
  if (!Array.isArray(niveis) || !niveis.length) { erros.push(`${rot}: sem niveis`); return; }
  let anterior = -Infinity;
  niveis.forEach((lv, idx) => {
    const n = idx + 1;
    if (lv.n !== n) erros.push(`${rot}/n${n}: campo n=${lv.n} fora de ordem`);
    if (!Array.isArray(lv.inimigos) || lv.inimigos.length !== 3) erros.push(`${rot}/n${n}: precisa de 3 inimigos (tem ${lv.inimigos ? lv.inimigos.length : 0})`);
    for (const k of (lv.inimigos || [])) {
      if (!catalogoKeys.has(k)) erros.push(`${rot}/n${n}: inimigo "${k}" fora do catálogo`);
      if ((trio || []).includes(k)) erros.push(`${rot}/n${n}: inimigo "${k}" é do próprio trio`);
    }
    if (domEhChefe(n) !== !!lv.chefe) erros.push(`${rot}/n${n}: chefe=${!!lv.chefe} mas nível ${domEhChefe(n) ? 'é' : 'não é'} múltiplo de ${DOM_FAIXA}`);
    if (typeof lv.dificuldade !== 'number') erros.push(`${rot}/n${n}: dificuldade medida ausente`);
    else { if (lv.dificuldade < anterior - tol) erros.push(`${rot}/n${n}: dificuldade ${lv.dificuldade.toFixed(2)} CAI abaixo do anterior ${anterior.toFixed(2)} (tol ${tol}) — a escada tem de ser monotônica`); anterior = Math.max(anterior, lv.dificuldade); }
  });
}
function domValidarLadder(ladder, catalogoKeys) {
  const erros = [];
  const nome = (ladder && ladder.cultura) || '(sem cultura)';
  if (!ladder || typeof ladder !== 'object') return [`${nome}: não é objeto`];
  if (!Array.isArray(ladder.trio) || ladder.trio.length !== 3) erros.push(`${nome}: trio precisa de 3 deuses (tem ${ladder.trio ? ladder.trio.length : 0})`);
  for (const k of (ladder.trio || [])) if (!catalogoKeys.has(k)) erros.push(`${nome}: trio "${k}" fora do catálogo`);
  if (!(ladder.tetoBonusDano <= DOM_TETO_BONUS + 1e-9)) erros.push(`${nome}: tetoBonusDano ${ladder.tetoBonusDano} passa do teto ${DOM_TETO_BONUS}`);
  const tol = (typeof ladder.tolMonotonia === 'number') ? ladder.tolMonotonia : 0.06;   // tolerância de ruído da régua (medida)
  // §275: CICLO SEMANAL — uma escada por semana em `semanas[]`; cada semana é monotônica.
  if (Array.isArray(ladder.semanas)) {
    if (!ladder.semanas.length) erros.push(`${nome}: semanas vazio`);
    ladder.semanas.forEach((s, w) => _domValidarNiveis(`${nome}/s${w + 1}`, s && s.niveis, ladder.trio, catalogoKeys, tol, erros));
  } else {
    _domValidarNiveis(nome, ladder.niveis, ladder.trio, catalogoKeys, tol, erros);   // compat: escada de semana única (fatia 1/2)
  }
  return erros;
}

if (typeof module !== 'undefined') {
  module.exports = {
    DOM_TETO_BONUS, DOM_PASSO_BONUS, DOM_FAIXA, DOM_HP_REVIVER,
    domEhChefe, domEscalarFx, domEscalarKit, domCatalogoNivel,
    domSemanaChave, domSemanaAbsoluta, domIndiceSemana, domChaveSemanaAnterior, domEscadaSemana,
    domNovaCorrida, domDefNivel, domMontarBatalha, domVidaFinal, domRevivesNaBatalha,
    domResolverBatalha, domAvancar, domCurarParcial,
    domPremiosDisponiveis, domAplicarPremio, domValidarLadder,
  };
}

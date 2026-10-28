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
const DOM_TITULARES = 3;       // §368: o campo tem 3 VAGAS (titulares na ordem das vagas)
const DOM_RESERVAS = 2;        // §368: + 2 RESERVAS ordenados; a corrida monta 5 deuses (3 + 2)

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
// §325: catálogos POR LADO. O jogador (lado 0) traz um TIME LIVRE — pode incluir um deus da cultura do
// Domínio que também é INIMIGO. Um deus nos dois lados precisa de kits DIFERENTES (bônus do jogador ×
// danoMult do inimigo); por isso dois catálogos. novoEstado([catJog, catIni]) lê cada lado pelo seu.
function domCatalogosPorLado(base, timeKeys, bonus, inimigos, danoMult) {
  const gods = base || _domGods();
  const catJog = {}, catIni = {};
  for (const k in gods) { catJog[k] = gods[k]; catIni[k] = gods[k]; }
  const pMul = 1 + (bonus || 0);
  if (pMul !== 1) for (const k of (timeKeys || [])) if (gods[k]) catJog[k] = domEscalarKit(gods[k], pMul);
  if (danoMult !== 1) for (const k of (inimigos || [])) if (gods[k]) catIni[k] = domEscalarKit(gods[k], danoMult);
  return [catJog, catIni];
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
  return { cultura: ladder.cultura, trio: ladder.trio, curaPorNivel: ladder.curaPorNivel, fatorDano: ladder.fatorDano, tetoBonusDano: ladder.tetoBonusDano, faixa: ladder.faixa, niveis: sem.niveis };
}

// ---- a CORRIDA (estado run-scoped; zera com a corrida — não fere o invariante 3) ----
// weekIndex/weekChave/marcaAnterior são do CICLO SEMANAL (§275): a corrida carrega a SUA semana
// (termina na sua escada mesmo se a semana virar) e a MARCA a bater (recorde da semana anterior,
// capturada no início — a superação dela é o instante comemorável). Opcionais: fora do ciclo (gerador
// medindo piso) a corrida roda na semana 0 sem marca.
// §325: `time` = o TIME LIVRE que o jogador montou (3 chaves). Grava-se em run.time e TRAVA pela corrida
// (regra B); retomar usa o time gravado. Fallback para ladder.trio (o trio icônico da cultura) só p/ chamadas
// antigas sem time — no runtime a UI sempre passa o time montado (com empréstimo da campanha).
// §368: `time` = 5 deuses (3 TITULARES na ordem das vagas + 2 RESERVAS ordenados). O CAMPO tem 3 vagas
// (run.campo = índices no time); começa nos 3 titulares. Quando a vaga de um caído abre, o primeiro reserva
// VIVO entra nela (domSubstituirReservas). A corrida só ACABA quando os 5 estão caídos. Fallback p/ 3 deuses
// (chamadas antigas / gerador sem reserva) e p/ ladder.trio (sem time) — aí não há reserva e acaba com 3.
function domNovaCorrida(ladder, weekIndex, weekChave, marcaAnterior, time) {
  const gods = _domGods();
  const equipe = (Array.isArray(time) && time.length >= 3) ? time.slice(0, DOM_TITULARES + DOM_RESERVAS) : (ladder.trio || []).slice();
  return {
    cultura: ladder.cultura,
    time: equipe,                       // §325/§368: TIME do jogador — 3 titulares + 2 reservas (travado pela corrida, regra B)
    campo: equipe.slice(0, DOM_TITULARES).map((_, i) => i),   // §368: índices (no time) dos deuses NAS 3 VAGAS; começa [0,1,2]
    semanaIdx: weekIndex || 0,          // índice da escada semanal desta corrida
    semana: weekChave || '',            // chave "AAAA-Www" — a corrida pertence a esta semana
    marcaAnterior: marcaAnterior || 0,  // recorde da semana anterior (a marca a bater)
    superou: false,                     // já anunciou a superação da marca nesta corrida?
    nivel: 1,
    vida: equipe.map(k => ({ hp: _domHpBase(gods, k), vivo: true })),   // [{hp,vivo}] por SLOT do time (5)
    bonus: 0,                 // bônus de dano acumulado (0..DOM_TETO_BONUS)
    reviveGasto: [],          // chaves do time cuja rede de ressurreição já foi usada
    profundidade: 0,          // nível mais fundo LIMPO
    status: 'ativo',          // 'ativo' | 'morto' | 'completo'
    aguardandoPremio: false,  // venceu um chefe e ainda não escolheu o prêmio
  };
}
// as 3 chaves NO CAMPO (a partir de run.campo); fallback para os 3 primeiros do time.
function domCampoKeys(run, ladder) {
  const time = (run.time && run.time.length >= 3) ? run.time : (ladder && ladder.trio) || [];
  const campo = (Array.isArray(run.campo) && run.campo.length) ? run.campo : time.slice(0, DOM_TITULARES).map((_, i) => i);
  return campo.map(i => time[i]);
}

function domDefNivel(ladder, n) { return (ladder.niveis || [])[n - 1] || null; }

// monta o st de um nível: novoEstado FRESCO + vida que carrega + rede gasta + catálogo escalado.
function domMontarBatalha(run, ladder, opc = {}) {
  const gods = opc.gods || _domGods();
  const time = (run.time && run.time.length >= 3) ? run.time : ladder.trio;     // §325/§368: TIME do jogador
  const campo = (Array.isArray(run.campo) && run.campo.length) ? run.campo : time.slice(0, DOM_TITULARES).map((_, i) => i);
  const fieldKeys = campo.map(i => time[i]);   // §368: as 3 chaves NAS VAGAS (titular ou reserva que assumiu)
  const def = domDefNivel(ladder, run.nivel);
  if (!def) return null;
  const seed = (opc.seed != null) ? opc.seed : ((run.nivel * 7919) >>> 0) || 1;
  // §325: catálogos POR LADO (o time pode conter um deus da cultura que também é inimigo — kits distintos).
  // §368b: o dano do inimigo = danoMult da faixa × fatorDano (fator UNIFORME da escada, escolha do dono = 0,45).
  // A forma da rampa (1.00/1.05/1.10/1.15) se mantém; o fatorDano só a multiplica. Lido do DADO — trocar o número afina.
  const fdano = (ladder.fatorDano != null) ? ladder.fatorDano : 1;
  const cats = domCatalogosPorLado(gods, fieldKeys, run.bonus, def.inimigos, (def.danoMult || 1) * fdano);
  // §323 P2: níveis do jogador (lado 0). opc.niveis = [ mapaLado0, {} ] | null (mapa por CHAVE — vale p/ quem está
  // no campo, inclusive um reserva que entrou). Aplica sobre o catálogo JÁ escalado da corrida; null → base.
  const st = novoEstado(fieldKeys, def.inimigos, seed, 0, null, cats, opc.niveis || null);   // comeca=0: o jogador abre
  st.lados[0].units.forEach((u, j) => {
    const idx = campo[j];
    const c = run.vida[idx];
    if (c && c.vivo) { u.hp = Math.min(u.maxHp, c.hp); }   // vida CARREGA; reserva entra com a vida que tem (cheio)
    else { u.hp = 0; u.vivo = false; }                     // vaga do caído sem reserva p/ assumir → unidade morta
    if (run.reviveGasto.includes(time[idx])) u.reviveGastoCorrida = true;   // §273: a rede deste deus já foi gasta na corrida
  });
  return st;
}

// vida final do lado do jogador (lida ao fim da batalha, para carregar).
function domVidaFinal(st) { return st.lados[0].units.map(u => ({ hp: u.hp, vivo: u.vivo })); }
// §368: grava a vida dos 3 do CAMPO de volta no run.vida (nos índices do time que estavam nas vagas).
function domGravarVida(run, st) {
  const campo = (Array.isArray(run.campo) && run.campo.length) ? run.campo : run.vida.map((_, i) => i).slice(0, DOM_TITULARES);
  st.lados[0].units.forEach((u, j) => { const idx = campo[j]; if (idx != null && run.vida[idx]) run.vida[idx] = { hp: Math.max(0, Math.round(u.hp)), vivo: !!u.vivo }; });
}
// §368: para cada VAGA cujo ocupante está caído, o primeiro RESERVA vivo FORA do campo (menor índice = a ordem
// se mantém) assume a vaga. Chamado ao avançar (começo do próximo nível) e após uma derrota com reserva vivo.
function domSubstituirReservas(run) {
  const campo = run.campo; if (!Array.isArray(campo)) return;
  for (let j = 0; j < campo.length; j++) {
    const occ = run.vida[campo[j]];
    if (occ && occ.vivo) continue;                         // vaga ocupada por deus vivo — nada a fazer
    const naField = new Set(campo);                        // quem já está no campo (recomputado — campo muda ao substituir)
    let repl = -1;
    for (let i = 0; i < run.time.length; i++) { if (naField.has(i)) continue; const v = run.vida[i]; if (v && v.vivo) { repl = i; break; } }
    if (repl >= 0) campo[j] = repl;                        // o reserva vivo entra na vaga do caído
  }
}
// chaves do trio que RESSUSCITARAM nesta batalha (a rede foi usada) — evento 'revive' no log.
function domRevivesNaBatalha(st, trioKeys) {
  const set = new Set();
  for (const ev of (st.log || [])) if (ev && ev.tipo === 'revive' && trioKeys.includes(ev.alvo)) set.add(ev.alvo);
  return [...set];
}

// resolve o fim de um nível: muta a corrida. Devolve {venceu, chefe, morreu, completou}.
function domResolverBatalha(run, ladder, st) {
  const fieldKeys = domCampoKeys(run, ladder);   // §368: as chaves que estavam NAS VAGAS (titular ou reserva)
  const venceu = !!(st.fim && st.fim.resultado === 'vitoria' && st.fim.lado === 0);
  const chefe = domEhChefe(run.nivel);
  // a vida final dos 3 do campo CARREGA (gravada por vaga); a rede gasta CARREGA
  domGravarVida(run, st);
  for (const k of domRevivesNaBatalha(st, fieldKeys)) if (!run.reviveGasto.includes(k)) run.reviveGasto.push(k);
  if (!venceu) {
    // §368: derrota NÃO encerra a corrida se ainda há RESERVA vivo — o reserva assume a vaga e o nível é REFEITO.
    // A corrida só ACABA quando os 5 estão caídos.
    domSubstituirReservas(run);
    if (run.vida.some(c => c && c.vivo)) return { venceu: false, chefe, morreu: false, retomar: true };
    run.status = 'morto';
    return { venceu: false, chefe, morreu: true, completou: false };
  }
  run.profundidade = run.nivel;
  // §275: superou a MARCA (recorde da semana anterior) AGORA? (só há marca a bater se marcaAnterior>0)
  const superou = !run.superou && (run.marcaAnterior || 0) > 0 && run.profundidade > run.marcaAnterior;
  if (superou) run.superou = true;
  // chefe vencido COM próximo nível → escolhe prêmio (portão). Chefe FINAL → não há prêmio a gastar: completa.
  if (chefe && run.nivel < (ladder.niveis || []).length) { run.aguardandoPremio = true; return { venceu: true, chefe: true, morreu: false, completou: false, superou }; }
  const completou = domAvancar(run, ladder);
  return { venceu: true, chefe, morreu: false, completou, superou };
}

// avança um nível: cura parcial nos vivos + o reserva assume a vaga do caído (começo do próximo nível).
// Só avançamos DEPOIS de vencer. Devolve true se a escada acabou (corrida COMPLETA).
function domAvancar(run, ladder) {
  run.nivel += 1;
  if (run.nivel > (ladder.niveis || []).length) { run.status = 'completo'; return true; }
  domCurarParcial(run, ladder);       // §368: cura ANTES de substituir (o reserva entra cheio de qualquer modo)
  domSubstituirReservas(run);         // §368: o primeiro reserva vivo entra na vaga do titular caído
  return false;
}
// §368: cada vivo (titular OU reserva) recupera uma FRAÇÃO da vida MÁXIMA (ladder.curaPorNivel, 0..1).
function domCurarParcial(run, ladder) {
  const gods = _domGods(), time = (run.time && run.time.length >= 3) ? run.time : ladder.trio, fr = ladder.curaPorNivel || 0;
  run.vida = run.vida.map((c, i) => {
    if (!c || !c.vivo) return c;
    const mx = _domHpBase(gods, time[i]);
    return { hp: Math.min(mx, c.hp + Math.round(mx * fr)), vivo: true };
  });
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
  const gods = _domGods(), time = (run.time && run.time.length >= 3) ? run.time : ladder.trio;
  if (tipo === 'cura') run.vida = run.vida.map((c, i) => c && c.vivo ? { hp: _domHpBase(gods, time[i]), vivo: true } : c);
  else if (tipo === 'reviver') {
    // §368: REVIVER escolhe QUALQUER caído dos 5 (alvo = índice no time, ou chave). domAvancar→domSubstituirReservas
    // coloca o revivido numa vaga vazia; se o campo estiver cheio, ele fica de reserva.
    let i = (typeof alvo === 'number') ? alvo : time.indexOf(alvo);
    if (i < 0 || i >= run.vida.length || (run.vida[i] && run.vida[i].vivo)) i = run.vida.findIndex(c => c && !c.vivo);   // 1º caído se inválido/não especificado
    if (i >= 0) run.vida[i] = { hp: Math.min(_domHpBase(gods, time[i]), DOM_HP_REVIVER), vivo: true };
  } else if (tipo === 'bonus') run.bonus = Math.min(DOM_TETO_BONUS, (run.bonus || 0) + DOM_PASSO_BONUS);
  run.aguardandoPremio = false;
  return domAvancar(run, ladder);
}

// ---- validação de FORMA da escada (chamada na BUILD; falha alto, não em runtime) ----
function _domValidarNiveis(rot, niveis, cultura, catalogoKeys, tol, erros) {
  if (!Array.isArray(niveis) || !niveis.length) { erros.push(`${rot}: sem niveis`); return; }
  const gods = _domGods();
  let anterior = -Infinity;
  niveis.forEach((lv, idx) => {
    const n = idx + 1;
    if (lv.n !== n) erros.push(`${rot}/n${n}: campo n=${lv.n} fora de ordem`);
    if (!Array.isArray(lv.inimigos) || lv.inimigos.length !== 3) erros.push(`${rot}/n${n}: precisa de 3 inimigos (tem ${lv.inimigos ? lv.inimigos.length : 0})`);
    for (const k of (lv.inimigos || [])) {
      if (!catalogoKeys.has(k)) erros.push(`${rot}/n${n}: inimigo "${k}" fora do catálogo`);
      // §325 P1: TODO inimigo de um Domínio é da CULTURA do Domínio (comuns e chefes). Falha o build.
      else if (cultura && gods[k] && gods[k].faccao !== cultura) erros.push(`${rot}/n${n}: inimigo "${k}" é da facção "${gods[k].faccao}" ≠ cultura "${cultura}" [P1 cultura]`);
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
  // §325: `trio` agora é o TRIO ICÔNICO INIMIGO da cultura (o chefe final, mostrado no cartão), não o jogador.
  const gods = _domGods();
  if (!Array.isArray(ladder.trio) || ladder.trio.length !== 3) erros.push(`${nome}: trio precisa de 3 deuses (tem ${ladder.trio ? ladder.trio.length : 0})`);
  for (const k of (ladder.trio || [])) {
    if (!catalogoKeys.has(k)) erros.push(`${nome}: trio "${k}" fora do catálogo`);
    else if (ladder.cultura && gods[k] && gods[k].faccao !== ladder.cultura) erros.push(`${nome}: trio icônico "${k}" não é da cultura "${ladder.cultura}" [P1 cultura]`);
  }
  if (!(ladder.tetoBonusDano <= DOM_TETO_BONUS + 1e-9)) erros.push(`${nome}: tetoBonusDano ${ladder.tetoBonusDano} passa do teto ${DOM_TETO_BONUS}`);
  // §368: curaPorNivel é uma FRAÇÃO da vida máxima (0..1), não mais um valor absoluto de HP.
  if (ladder.curaPorNivel != null && !(ladder.curaPorNivel >= 0 && ladder.curaPorNivel <= 1)) erros.push(`${nome}: curaPorNivel ${ladder.curaPorNivel} fora de 0..1 (fracao da vida maxima)`);
  // §368b: fatorDano = fator uniforme sobre a rampa de dano (0,45 = escolha do dono). Deve ser > 0 e razoavel (<= 2).
  if (ladder.fatorDano != null && !(ladder.fatorDano > 0 && ladder.fatorDano <= 2)) erros.push(`${nome}: fatorDano ${ladder.fatorDano} fora de (0,2]`);
  // §325 F: a régua é um CONJUNTO FIXO de times de referência (regua.times). Validação de FORMA (sem simular):
  // a viabilidade de fato (nv1 vencível pelo mais barato) é o portão P3, medido em tools/dominio_p3_guard.js.
  const times = ladder.regua && ladder.regua.times;
  if (!Array.isArray(times) || !times.length) erros.push(`${nome}: regua.times ausente ou vazio [regua]`);
  else times.forEach((t, i) => {
    if (!Array.isArray(t) || t.length !== 3 || new Set(t).size !== 3) erros.push(`${nome}: regua.times[${i}] precisa de 3 deuses distintos`);
    else for (const k of t) if (!catalogoKeys.has(k)) erros.push(`${nome}: regua.times[${i}] deus "${k}" fora do catálogo`);
  });
  const tol = (typeof ladder.tolMonotonia === 'number') ? ladder.tolMonotonia : 0.06;   // tolerância de ruído da régua (medida)
  // §275: CICLO SEMANAL — uma escada por semana em `semanas[]`; cada semana é monotônica.
  // §325 P1: cada nível valida que o inimigo é da CULTURA (passa ladder.cultura ao validador de níveis).
  if (Array.isArray(ladder.semanas)) {
    if (!ladder.semanas.length) erros.push(`${nome}: semanas vazio`);
    ladder.semanas.forEach((s, w) => _domValidarNiveis(`${nome}/s${w + 1}`, s && s.niveis, ladder.cultura, catalogoKeys, tol, erros));
  } else {
    _domValidarNiveis(nome, ladder.niveis, ladder.cultura, catalogoKeys, tol, erros);   // compat: escada de semana única (fatia 1/2)
  }
  return erros;
}

if (typeof module !== 'undefined') {
  module.exports = {
    DOM_TETO_BONUS, DOM_PASSO_BONUS, DOM_FAIXA, DOM_HP_REVIVER, DOM_TITULARES, DOM_RESERVAS,
    domEhChefe, domEscalarFx, domEscalarKit, domCatalogoNivel, domCatalogosPorLado,
    domSemanaChave, domSemanaAbsoluta, domIndiceSemana, domChaveSemanaAnterior, domEscadaSemana,
    domNovaCorrida, domCampoKeys, domDefNivel, domMontarBatalha, domVidaFinal, domGravarVida, domRevivesNaBatalha,
    domResolverBatalha, domAvancar, domCurarParcial, domSubstituirReservas,
    domPremiosDisponiveis, domAplicarPremio, domValidarLadder,
  };
}

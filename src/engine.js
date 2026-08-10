// ===================================================================
// INCURSION — ESTILO NA :: motor de regras
// Função pura: (estado, ação) -> novo estado. Sem UI, sem rede.
// Implementa as 7 regras da aba "Resolução".
// ===================================================================

const ELEMS = ['Tempestade', 'Umbra', 'Maré', 'Aurora', 'Chama', 'Verdejante'];

// Classe pertence à HABILIDADE, não ao deus (como no Naruto-Arena).
// É o que faz "trava as Físicas dele" acertar parte do kit e não tudo.
// Regra de atribuição: carga primária manda.
//   controle (atordoar/dormir/provocar/silenciar/submergir/dominar) -> Mental
//   dano contínuo como identidade                                   -> Aflição
//   resto                                                           -> Tipo do deus (Físico/Mágico)
// A Defesa universal é 'Universal' e nenhum silêncio a alcança.
const CLASSES = ['Físico', 'Mágico', 'Mental', 'Aflição'];

// Alguns kits alternam de modo e trocam de classe com ele (Nezha).
function classeDe(st, u, a) {
  if (a.classePorModo) return a.classePorModo[u.modo] || a.classePorModo[0];
  return a.classe || kitDe(st, u).classe;   // kit vem do catálogo da partida (st.catId), não de GODS global
}

// ---- especificação de alvos ----
// 'nenhum' | 'inimigo' | 'aliado' | 'todosInimigos' | '2inimigos' | '2aliados' | 'aliado+inimigo'
const PASSOS = {
  nenhum: [], todosInimigos: [],
  inimigo: ['inimigo'], aliado: ['aliado'],
  '2inimigos': ['inimigo', 'inimigo'], '2aliados': ['aliado', 'aliado'],
  'aliado+inimigo': ['aliado', 'inimigo'],
};
function passosDe(u, a) {
  if (a.alterna) return u.modo === 0 ? ['inimigo'] : [];
  return (PASSOS[a.alvo] || []).slice();
}

// ---------------------------------------------------------------- RNG
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------- DEUSES
// Os KITS dos deuses NÃO moram mais aqui — são dados, um arquivo por deus em
// data/deuses/<key>.json, montados no catálogo por src/catalogo.js. O motor RECEBE
// o catálogo (via novoEstado) e ASSA o kit em cada unidade (u.kit); a resolução lê
// u.kit, nunca um GODS global. Assim o motor não possui dados e o estado é auto-contido
// (o seed determina a partida inteira mesmo se um kit for rebalanceado — ver DECISOES §24).

const DEFESA = {
  slot: 'defesa', nome: 'Defesa', cost: { livre: 1 }, cd: 4, alvo: 'nenhum', universal: true,
  desc: 'Ação universal. Invulnerável por 1 turno (DoT já aplicado continua a contar). Gasta a ação.',
  fx: [{ t: 'apply', eff: { type: 'invulneravel', dur: 1 }, escopo: 'self' }],
};

const CONTROLES = ['atordoado', 'adormecido', 'submerso', 'taunt', 'silenceClass', 'lockSkill', 'dominado'];
const DEBUFFS = [...CONTROLES, 'dmgDown', 'encharcado', 'noHeal', 'livro'];
const BUFFS_DEF = ['dmgReduction', 'shield', 'invulneravel', 'controlImmune', 'vinculo'];
const BUFFS = [...BUFFS_DEF, 'dmgUp', 'regen', 'intercepta', 'contraAtaca', 'armazenaDano'];

// VOCABULÁRIO DO MOTOR — fonte ÚNICA do que o motor sabe executar. O validador de kits
// (tools/valida_kit.js) LÊ isto, então o schema não pode divergir do que o motor faz.
// TIPOS_FX é também a lista que o motor usa para RECUSAR em runtime um fx.t desconhecido
// (ver aplicarFx): efeito com typo não passa em silêncio. Ao ensinar o motor um fx.t novo,
// some-o aqui (e um fxKey novo, se o efeito ler um campo novo) — mesma disciplina de "primitiva antes do deus".
const TIPOS_FX = [
  'dmg', 'heal', 'dot', 'apply', 'contador', 'vidaExtra', 'revive', 'destroyShield',
  'stripDef', 'stripBuffs', 'stripOne', 'cleanse', 'shield', 'selfHp', 'intercepta',
  'armazenaDano', 'invocar', 'copiar', 'fase', 'atordoaMenorHp', 'vinculo', 'cdShift', 'orbGain',
];
const VOCAB = {
  classes: CLASSES,                              // classe de habilidade
  elementos: ELEMS,
  custo: [...ELEMS, 'livre'],                    // chaves válidas em cost{}
  alvos: [...Object.keys(PASSOS), 'auto'],       // valores válidos de ability.alvo
  fx: TIPOS_FX,                                  // valores válidos de fx.t
  efeitos: [...new Set([...DEBUFFS, ...BUFFS])], // valores válidos de eff.type (t:'apply')
  // campos que o motor LÊ num fx (danoBase + aplicarFx). Um fx com campo fora disto é typo.
  fxKeys: [
    't', 'v', 'kind', 'eff', 'escopo', 'nome', 'dur', 'idx', 'n', 'lado', 'max', 'hp',
    'tipo', 'provoca', 'contra', 'contraAtaca', 'protege', 'fonte', 'alvo', 'consomeContador',
    'porContador', 'porContadorCampo', 'porAliadoCaido', 'porInimigoCaido', 'curaMetade',
    'seEncharcado', 'seAdormecido', 'seDia', 'seNoite', 'seAliadoJaAgiu',
  ],
};

// ------------------------------------------------------------- ESTADO
// Catálogo ATIVO por padrão: no browser é o global GODS (montado por catalogo.js a partir
// de data/deuses); no Node é o export de catalogo.js (o MESMO objeto que os testes mutam
// como E.GODS). novoEstado recebe o catálogo — este é só o default.
function catalogoAtivo() {
  if (typeof GODS !== 'undefined') return GODS;
  if (typeof require !== 'undefined') return require('./catalogo.js').GODS;
  return {};
}

// REGISTRO DE CATÁLOGOS POR CHAVE. Um SNAPSHOT congelado por catálogo distinto, indexado por
// `st.catId` (string curta que SOBREVIVE ao JSON.stringify). A resolução lê o kit por chave
// (kitDe), NÃO do estado. Por quê assim, e não as alternativas:
//  - assar o kit em cada unidade: a IA clona o estado por JSON.stringify a cada nó da busca, e
//    assar dobrava o clone (ia.test 600→1040ms);
//  - `_CAT` em nível de módulo: quebraria com DUAS partidas coexistindo (novoEstado(B) sobrescreve
//    o catálogo de A, e agir(A) leria o de B) — a arena da F1.4 cria milhares de estados;
//  - WeakMap: o clone por JSON.stringify não estaria nele.
// Com o registro por chave, várias partidas coexistem: cada st lê o SEU catálogo por catId, e os
// clones da IA carregam só o catId (sem custo de clone). Congelado no início → rebalancear no meio
// não altera a partida em andamento (o seed determina a partida inteira). (DECISOES §24.)
const CATALOGOS = {};
function _hashCat(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function registrarCatalogo(catalogo) {
  const id = 'c' + _hashCat(JSON.stringify(catalogo));   // por CONTEÚDO: catálogos iguais reusam o snapshot (arena não vaza registro)
  if (!CATALOGOS[id]) CATALOGOS[id] = Object.freeze(Object.assign({}, catalogo));
  return id;
}
function kitDe(st, u) { return (CATALOGOS[st.catId] || catalogoAtivo())[u.key]; }

function novaUnidade(key, idx, lado, catalogo) {
  const g = catalogo[key];
  return {
    uid: `${lado}-${idx}`, key, nome: g.nome, elem: g.elem, classe: g.classe, funcao: g.funcao,
    hp: 120, maxHp: 120, vivo: true, agiu: false,
    cd: { habilidade: 0, milagre: 0, defesa: 0 },
    efeitos: [], dots: [], shield: 0,
    // --- primitivas ---
    contadores: {},      // contadores acumuláveis nomeados: { 'Disco Solar': 3, Atadura: 2 }
    vidaExtra: null,     // Vida Extra pendente: { hp } — revive no ato ao cair
    naoRevive: false,    // marcado ao morrer sob Atadura/Podridão/Livro
    usos: {},            // habilidades "1× por partida" já gastas: { milagre: true }
    modo: 0, renasceu: false, lado,
  };
}

// `comeca` = lado que abre a partida (0 ou 1). Default 0 para determinismo dos
// testes/replays; o CLIENTE sorteia (Math.random) e passa o valor — o motor
// permanece puro. Quem abre recebe só 1 energia (abertura 1/3, estilo NA).
// `catalogo` é RECEBIDO (o motor não possui os dados). Default = catálogo ativo, para os
// testes que chamam com chaves e mutam E.GODS seguirem valendo sem edição.
function novoEstado(timeA, timeB, seed = 1, comeca = 0, energia = null, catalogo = catalogoAtivo()) {
  const catId = registrarCatalogo(catalogo);   // snapshot congelado, indexado por chave (ver acima)
  const st = {
    turno: 1, ativo: comeca, starter: comeca, aberturaFeita: false,
    catId,                    // chave do catálogo desta partida (sobrevive ao clone da IA)
    seed, rngN: 0, log: [], fim: null,
    energia,                  // config de geração de energia (data/economia.json). null = fallback (ver sortearElemento)
    fase: null, faseDur: 0,   // estado global Dia/Noite
    lados: [
      { units: timeA.map((k, i) => novaUnidade(k, i, 0, catalogo)), orbs: zeroOrbs(), converteu: false, estreou: false, invocacoes: [], ultHabilidade: null, dividaLivre: 0 },
      { units: timeB.map((k, i) => novaUnidade(k, i, 1, catalogo)), orbs: zeroOrbs(), converteu: false, estreou: false, invocacoes: [], ultHabilidade: null, dividaLivre: 0 },
    ],
  };
  log(st, `Turno 1 · Jogador ${comeca + 1} abre a partida.`);   // sem preposição contraída: a visão traduz "Jogador N" -> Você/CPU/Oponente
  iniciarTurno(st);
  return st;
}

function zeroOrbs() { const o = {}; ELEMS.forEach(e => o[e] = 0); return o; }
function log(st, msg) { st.log.push({ turno: st.turno, msg }); }
function rng(st) { const f = mulberry32(st.seed + st.rngN * 7919); st.rngN++; return f(); }

// ------------------------------------------------------------ EFEITOS
function ef(u, type) { return u.efeitos.find(e => e.type === type); }
function temControle(u) { return u.efeitos.some(e => CONTROLES.includes(e.type)); }

function aplicar(st, u, eff) {
  const e = { ...eff };
  // regra 7 — proteção vence controle
  if (CONTROLES.includes(e.type) && ef(u, 'controlImmune')) {
    log(st, `${u.nome} está imune a controle — ${e.type} falhou.`); return;
  }
  if (e.type === 'adormecido' && u.key === 'cuca') {
    log(st, `Cuca é imune a Adormecer.`); return;
  }
  const ja = ef(u, e.type);
  if (ja) {
    // regra 6 — acúmulo por categoria
    if (e.type === 'dmgUp' || e.type === 'dmgDown') { ja.v += e.v; ja.dur = Math.max(ja.dur, e.dur); }
    else if (e.type === 'dmgReduction' || e.type === 'regen') { ja.v = Math.max(ja.v, e.v); ja.dur = Math.max(ja.dur, e.dur); }
    else if (CONTROLES.includes(e.type)) { ja.dur = Math.max(ja.dur, e.dur); }
    else { ja.dur = Math.max(ja.dur, e.dur); }
  } else {
    u.efeitos.push(e);
  }
}

function aplicarDot(st, u, nome, v, dur) {
  if (u.key === 'nezha') { log(st, `Nezha é imune a ${nome}.`); return; }
  const ja = u.dots.find(d => d.nome === nome);
  if (ja) { ja.v = Math.max(ja.v, v); ja.dur = Math.max(ja.dur, dur); }   // regra 6
  else u.dots.push({ nome, v, dur });
}

// -------------------------------------------------- PRIMITIVAS: contadores
// Contadores acumuláveis nomeados (Disco Solar, Cauda, Atadura, Podridão, Combo…).
// Genéricos: somam, respeitam um teto opcional, podem ser lidos e consumidos.
// O que cada contador FAZ (limiares, escalas) é decisão do kit; aqui só se guarda.
function addContador(st, u, nome, v = 1, max = null) {
  const atual = u.contadores[nome] || 0;
  let novo = atual + v;
  if (max != null) novo = Math.min(novo, max);
  if (novo < 0) novo = 0;
  u.contadores[nome] = novo;
  if (novo !== atual) log(st, `${u.nome}: ${nome} ${novo > atual ? '+' : ''}${novo - atual} (=${novo}).`);
  return novo;
}
function getContador(u, nome) { return u.contadores[nome] || 0; }
function contadorNoCampo(st, nome, lado) {
  return st.lados[lado].units.filter(u => u.vivo).reduce((s, u) => s + getContador(u, nome), 0);
}

// ----------------------------------------------- PRIMITIVA: estado Dia/Noite
function definirFase(st, fase, dur) {
  if (fase === null) { if (st.fase) log(st, `${st.fase} terminou.`); st.fase = null; st.faseDur = 0; return; }
  st.fase = fase; st.faseDur = dur;
  log(st, `${fase} ativado por ${dur} turno(s).`);
}

// contagem de quedas de um lado (para escalas "por aliado caído")
function caidos(st, lado) { return st.lados[lado].units.filter(u => !u.vivo).length; }

// -------------------------------------------------------------- DANO
function bonusDano(st, atk) {
  let b = 0;
  const meu = st.lados[atk.lado];
  const up = ef(atk, 'dmgUp'), dn = ef(atk, 'dmgDown');
  if (up) b += up.v;
  if (dn) b -= dn.v;
  if (meu.units.some(x => x.vivo && x.key === 'brigid')) b += 5;   // passiva Brigid
  return b;
}

function calcDano(st, atk, alvo, base, kind, slot) {
  let v = base + bonusDano(st, atk);
  // passivas ofensivas
  if (atk.key === 'ogum' && (alvo.shield > 0 || ef(alvo, 'dmgReduction'))) v += 10;
  if (atk.key === 'sobek' && alvo.efeitos.some(e => DEBUFFS.includes(e.type))) v += 6;
  if (ef(alvo, 'adormecido')) v += 8;                               // Cuca — passiva de Orfeu/Cuca
  if (v < 0) v = 0;

  const ignoraReducao = kind === 'perfurante' || kind === 'puro' || atk.key === 'ogum' || atk.key === 'tyr';
  const ignoraEscudo = kind === 'puro' || atk.key === 'tyr';

  // regra 2 — redução ANTES do escudo
  if (!ignoraReducao) {
    let red = 0;
    const r = ef(alvo, 'dmgReduction');
    if (r) red = Math.max(red, r.v);                                // regra 6 — pega o maior
    if (alvo.key === 'sobek' && slot === 'basico') red = Math.max(red, 10);
    if (st.lados[alvo.lado].units.some(x => x.vivo && x.key === 'thor')) red = Math.max(red, 6);
    v = Math.max(0, v - red);
  }
  let absorvido = 0;
  if (!ignoraEscudo && alvo.shield > 0) {
    absorvido = Math.min(alvo.shield, v);
    alvo.shield -= absorvido; v -= absorvido;
  }
  return { v, absorvido };
}

function bater(st, atk, alvo, base, kind, slot, opts = {}) {
  const { semVinculo = false, unico = false, semContra = false, semIntercepta = false } = opts;
  if (!alvo.vivo) return 0;

  // PRIMITIVA interceptar — golpe de alvo único pode ser assumido por um protetor.
  // Vale para efeito 'intercepta' (Loki, Bastet, Hanuman) e para invocação-guarda (Shabti, isca).
  if (unico && !semIntercepta) {
    const redir = acharInterceptador(st, alvo, atk);
    if (redir) {
      const ie = ef(redir, 'intercepta');
      if (ie && ie.contra === 'unico') redir.efeitos = redir.efeitos.filter(e => e !== ie);
      log(st, `${redir.nome} intercepta o golpe dirigido a ${alvo.nome}.`);
      return bater(st, atk, redir, base, kind, slot, { ...opts, semIntercepta: true });
    }
    const guarda = acharGuarda(st, alvo);
    if (guarda) {
      const antes = guarda.hp;
      guarda.hp = Math.max(0, guarda.hp - base);
      log(st, `${guarda.nome} absorve o golpe dirigido a ${alvo.nome} (${antes}→${guarda.hp}).`);
      if (guarda.hp === 0) removerInvocacao(st, guarda);
      return base;
    }
  }
  if (ef(alvo, 'invulneravel')) { log(st, `${alvo.nome} está Invulnerável — sem dano.`); return 0; }
  if (ef(alvo, 'submerso')) { log(st, `${alvo.nome} está Submerso — não pode ser alvo.`); return 0; }
  // vínculo (Juramento Nupcial): o dano é dividido entre os dois vinculados
  const vin = !semVinculo && ef(alvo, 'vinculo');
  if (vin) {
    const par = st.lados[alvo.lado].units.find(x => x.uid === vin.par);
    if (par && par.vivo) {
      const metade = Math.ceil(base / 2);
      log(st, `Vínculo: o golpe em ${alvo.nome} é dividido com ${par.nome}.`);
      const a1 = bater(st, atk, alvo, metade, kind, slot, { ...opts, semVinculo: true });
      const a2 = bater(st, atk, par, metade, kind, slot, { ...opts, semVinculo: true });
      return a1 + a2;
    }
  }
  const { v, absorvido } = calcDano(st, atk, alvo, base, kind, slot);
  alvo.hp = Math.max(0, alvo.hp - v);
  let txt = `${atk.nome} → ${alvo.nome}: ${v} de dano`;
  if (absorvido) txt += ` (${absorvido} no escudo)`;
  if (kind && kind !== 'afetado') txt += ` [${kind}]`;
  log(st, txt);
  // PRIMITIVA dano armazenado — todo aliado do alvo com acumulador guarda o dano sofrido.
  for (const x of st.lados[alvo.lado].units) {
    const arm = ef(x, 'armazenaDano');
    if (arm && x.vivo) arm.acc = (arm.acc || 0) + v;
  }
  // acorda com dano de Habilidade/Milagre
  if (ef(alvo, 'adormecido') && (slot === 'habilidade' || slot === 'milagre')) {
    alvo.efeitos = alvo.efeitos.filter(e => e.type !== 'adormecido');
    log(st, `${alvo.nome} acordou.`);
  }
  if (alvo.hp === 0) { matar(st, atk, alvo); return v; }
  // PRIMITIVA contra-atacar — quem carrega 'contraAtaca' revida golpe de alvo único.
  const ca = ef(alvo, 'contraAtaca');
  if (ca && unico && !semContra && atk && atk.vivo && atk.lado !== alvo.lado) {
    log(st, `${alvo.nome} contra-ataca ${atk.nome}.`);
    bater(st, alvo, atk, ca.v, 'afetado', 'contra', { semContra: true });
    if (ca.contra === 'unico') alvo.efeitos = alvo.efeitos.filter(e => e !== ca);
  }
  return v;
}

function matar(st, atk, alvo) {
  // PRIMITIVA Vida Extra — revive no ato, antes de a morte se concretizar.
  if (alvo.vidaExtra) {
    const hp = alvo.vidaExtra.hp; alvo.vidaExtra = null;
    alvo.hp = hp; alvo.shield = 0;
    log(st, `Vida Extra: ${alvo.nome} revive na hora com ${hp} de HP.`);
    return;
  }
  alvo.vivo = false; alvo.efeitos = []; alvo.dots = []; alvo.shield = 0; alvo.contadores = {};
  log(st, `${alvo.nome} caiu.`);
  if (alvo.key === 'nezha' && !alvo.renasceu) {
    alvo.renasceu = true; alvo.pendenteRenascer = true;
    log(st, `Renascido do Lótus: Nezha volta no próximo turno com 40 de HP.`);
  }
  if (atk && atk.key === 'zeus' && atk.vivo) {                      // passiva Zeus
    st.lados[atk.lado].orbs['Tempestade']++;
    log(st, `Soberano: Zeus ganha 1 orbe de Tempestade.`);
  }
  checarFim(st);
}

// ----------------------------------- PRIMITIVA interceptar / invocação-guarda
// Um protetor vivo com efeito 'intercepta' cobrindo o alvo (ou qualquer aliado).
function acharInterceptador(st, alvo, atk) {
  if (atk && atk.lado === alvo.lado) return null;   // só golpe inimigo é interceptado
  return st.lados[alvo.lado].units.find(x => {
    if (!x.vivo || x.uid === alvo.uid) return false;
    const i = ef(x, 'intercepta');
    return i && (i.protege === alvo.uid || i.protege === 'time');
  });
}
function acharGuarda(st, alvo) {
  const inv = (st.lados[alvo.lado].invocacoes || []).find(g => g.tipo === 'guarda' && g.hp > 0);
  return inv || null;
}
function removerInvocacao(st, g) {
  for (const l of st.lados) { const i = l.invocacoes.indexOf(g); if (i >= 0) { l.invocacoes.splice(i, 1); log(st, `${g.nome} se desfez.`); } }
}

function curar(st, u, v) {
  if (!u.vivo) return;
  if (ef(u, 'noHeal')) { log(st, `${u.nome} não pode ser curado.`); return; }
  let bonus = 0;
  const alguemQueima = st.lados.flatMap(l => l.units).some(x => x.vivo && x.dots.some(d => d.nome === 'Queimadura'));
  if (alguemQueima && st.lados[u.lado].units.some(x => x.vivo && x.key === 'brigid')) bonus = 5;
  const antes = u.hp;
  u.hp = Math.min(u.maxHp, u.hp + v + bonus);
  if (u.hp > antes) log(st, `${u.nome} curou ${u.hp - antes}.`);
  // passiva Hera — Rainha Ciumenta
  if (st.lados[u.lado].units.some(x => x.vivo && x.key === 'hera')) {
    u.shield += 10; log(st, `Rainha Ciumenta: ${u.nome} ganhou 10 de escudo.`);
  }
}

// ------------------------------------------------------------- ORBES
function totalOrbs(l) { return ELEMS.reduce((s, e) => s + l.orbs[e], 0); }

function podePagar(l, cost) {
  const esp = { ...cost }; const livre = esp.livre || 0; delete esp.livre;
  for (const k in esp) if (l.orbs[k] < esp[k]) return false;
  let sobra = totalOrbs(l) - (l.dividaLivre || 0);   // orbes já reservados p/ a dívida livre não contam
  for (const k in esp) sobra -= esp[k];
  return sobra >= livre;
}

// A parte "livre" do custo NÃO é paga na hora: vira dívida do turno, e o jogador
// escolhe quais orbes pagam no FIM do turno (alocarLivre). O específico paga já.
function pagar(st, l, cost) {
  const esp = { ...cost }; const livre = esp.livre || 0; delete esp.livre;
  for (const k in esp) l.orbs[k] -= esp[k];
  l.dividaLivre = (l.dividaLivre || 0) + livre;
}
function pagarLivreGuloso(l, n) {   // rede de segurança: gasta do pool mais cheio
  while (n > 0) {
    const alvo = ELEMS.slice().sort((a, b) => l.orbs[b] - l.orbs[a])[0];
    if (l.orbs[alvo] <= 0) break;
    l.orbs[alvo]--; n--;
  }
}
// escolha do jogador de quais orbes pagam a dívida livre do turno
function alocarLivre(st, plano) {
  const l = st.lados[st.ativo], devido = l.dividaLivre || 0;
  let soma = 0; for (const k in plano) soma += plano[k];
  if (soma !== devido) return { ok: false, erro: `Aloque exatamente ${devido} energia(s) livre(s).` };
  for (const k in plano) if ((l.orbs[k] || 0) < plano[k]) return { ok: false, erro: 'Orbes insuficientes.' };
  for (const k in plano) l.orbs[k] -= plano[k];
  l.dividaLivre = 0;
  log(st, `Energia livre paga: ${Object.entries(plano).filter(([, n]) => n > 0).map(([e, n]) => `${n} ${e}`).join(', ') || '—'}.`);
  return { ok: true };
}

const CONV_CUSTO = 3;   // 3 quaisquer -> 1 do tipo escolhido. Saldo líquido: -2.

function planoConversao(l, para) {
  // devolve quantos orbes de cada tipo seriam gastos, ou null se não dá
  if (totalOrbs(l) < CONV_CUSTO) return null;
  const tmp = { ...l.orbs }, gasto = {};
  ELEMS.forEach(x => gasto[x] = 0);
  for (let i = 0; i < CONV_CUSTO; i++) {
    // gasta primeiro do que sobra mais; o tipo alvo é a ÚLTIMA escolha
    const de = ELEMS.slice()
      .sort((a, b) => (tmp[b] - tmp[a]) || (a === para ? 1 : b === para ? -1 : 0))
      .filter(x => tmp[x] > 0)
      .sort((a, b) => (a === para) - (b === para) || tmp[b] - tmp[a])[0];
    if (!de) return null;
    tmp[de]--; gasto[de]++;
  }
  return gasto;
}

function converter(st, para) {
  const l = st.lados[st.ativo];
  if (l.converteu) return { ok: false, erro: 'A conversão já foi usada neste turno.' };
  if (totalOrbs(l) - (l.dividaLivre || 0) < CONV_CUSTO) return { ok: false, erro: `São necessários ${CONV_CUSTO} orbes livres (fora a dívida de energia livre).` };
  const gasto = planoConversao(l, para);
  if (!gasto) return { ok: false, erro: `São necessários ${CONV_CUSTO} orbes.` };
  let pagos = 0;
  for (const k in gasto) { l.orbs[k] -= gasto[k]; pagos += gasto[k]; }
  if (pagos !== CONV_CUSTO) {   // trava de segurança: nunca converter pagando menos
    for (const k in gasto) l.orbs[k] += gasto[k];
    return { ok: false, erro: 'Conversão inválida.' };
  }
  l.orbs[para]++; l.converteu = true;
  log(st, `Conversão: ${CONV_CUSTO} orbes → 1 de ${para}.`);
  return { ok: true };
}

// -------------------------------------------------------- TURNO
// Sorteia UM elemento para uma energia gerada. A regra vem de st.energia
// (data/economia.json, bloco "energia"); o balanceamento vive LÁ, não aqui.
//
// FALLBACK DE COMPATIBILIDADE — NÃO AJUSTE: sem st.energia (ou modo "time"),
// consome EXATAMENTE 1 sorteio do RNG, entre os elementos do time — idêntico ao
// comportamento histórico. Isso mantém o fluxo do `rng` inalterado e é o que faz
// as suítes de motor passarem sem edição. Modos "uniforme"/"ponderado" mudam o
// fluxo DE PROPÓSITO (só quando configurados). O modo "ponderado" gasta 2
// sorteios por energia (decidir o conjunto + escolher dentro dele); quem mexer
// nessa contagem quebra 4 suítes com semente fixa — ver DECISOES.md.
function sortearElemento(st, tiposTime) {
  const cfg = st.energia;
  const modo = (cfg && cfg.modo) || 'time';
  if (modo === 'time') return tiposTime[Math.floor(rng(st) * tiposTime.length)];
  if (modo === 'uniforme') return ELEMS[Math.floor(rng(st) * ELEMS.length)];
  // ponderado: 1º sorteio escolhe o conjunto (time × os 6), 2º escolhe dentro
  const pesoTime = cfg.pesoTime != null ? cfg.pesoTime : 0.75;
  const pool = rng(st) < pesoTime ? tiposTime : ELEMS;
  return pool[Math.floor(rng(st) * pool.length)];
}

function iniciarTurno(st) {
  const l = st.lados[st.ativo];
  const primeiro = !l.estreou;     // "turno 1" é por LADO, não global
  l.estreou = true;
  l.converteu = false;
  l.dividaLivre = 0;               // a dívida do turno anterior já foi quitada no fimTurno

  for (const u of l.units) {
    if (u.pendenteRenascer) { u.pendenteRenascer = false; u.vivo = true; u.hp = 40; log(st, `Nezha renasceu com 40 de HP.`); }
    if (!u.vivo) continue;
    u.agiu = false;
    // regra 3 — DoT no início, ANTES de agir
    for (const d of u.dots) {
      u.hp = Math.max(0, u.hp - d.v);
      log(st, `${d.nome} em ${u.nome}: ${d.v} de dano puro.`);
      if (u.hp === 0) { matar(st, null, u); break; }
    }
    if (!u.vivo) continue;
    const rg = ef(u, 'regen');
    if (rg) curar(st, u, rg.v);
    // regra 4 — recargas descontam no início do turno do dono
    for (const k in u.cd) if (u.cd[k] > 0) u.cd[k]--;
  }
  // PRIMITIVA invocações — agem no início do turno do dono, depois expiram
  for (const g of l.invocacoes.slice()) {
    if (g.tipo === 'dano' && g.v > 0) {
      const alvo = st.lados[1 - st.ativo].units.find(x => x.vivo);
      if (alvo) { log(st, `${g.nome} ataca.`); bater(st, { nome: g.nome, key: '__inv', lado: st.ativo, vivo: true, efeitos: [], contadores: {} }, alvo, g.v, 'afetado', 'invocacao', {}); }
    }
    if (g.dur != null) { g.dur--; if (g.dur <= 0) removerInvocacao(st, g); }
  }
  // geração de orbes. Elemento sorteado entre os tipos do time (pode vir tipo
  // que não serve — estilo NA). Abertura da partida: quem abre recebe só 1
  // (desvantagem de iniciativa); todo turno seguinte rende = unidades vivas.
  const vivos = l.units.filter(u => u.vivo);
  const geram = vivos.filter(u => !ef(u, 'adormecido') && !ef(u, 'submerso') && !ef(u, 'dominado'));
  const tipos = [...new Set(vivos.map(u => u.elem))];
  const nOrbs = st.aberturaFeita ? geram.length : 1;
  for (let i = 0; i < nOrbs; i++) {
    const t = sortearElemento(st, tipos);
    l.orbs[t]++;
  }
  if (!st.aberturaFeita) { st.aberturaFeita = true; log(st, `Abertura: o Jogador que começa recebe 1 energia.`); }
  if (geram.length < vivos.length) log(st, `${vivos.length - geram.length} unidade(s) sob controle não geraram orbe.`);
  if (primeiro && l.units.some(u => u.key === 'ganesha')) { // passiva Ganesha
    for (let i = 0; i < 2; i++) { const t = sortearElemento(st, tipos); l.orbs[t]++; }
    log(st, `Senhor dos Começos: +2 orbes.`);
  }
  checarFim(st);
}

function fimTurno(st) {
  const l = st.lados[st.ativo];
  // dívida de energia livre não escolhida pelo jogador: aloca sozinha (rede de segurança)
  if (l.dividaLivre > 0) { pagarLivreGuloso(l, l.dividaLivre); log(st, `${l.dividaLivre} energia(s) livre(s) alocada(s) automaticamente.`); l.dividaLivre = 0; }
  // PRIMITIVA dano armazenado — libera ao expirar (Xangô devolve como dano puro)
  for (const u of l.units) {
    const arm = ef(u, 'armazenaDano');
    if (arm && arm.dur === 1 && u.vivo) {
      const total = Math.min(arm.max || 9999, arm.acc || 0);
      const alvo = st.lados[1 - u.lado].units.find(x => x.uid === arm.alvo && x.vivo)
                 || st.lados[1 - u.lado].units.find(x => x.vivo);
      if (total > 0 && alvo) { log(st, `${u.nome} devolve ${total} de dano armazenado a ${alvo.nome}.`); bater(st, u, alvo, total, 'puro', 'armazenado', {}); }
    }
  }
  // PRIMITIVA contagem de morte (Livro) — executa quem chegou ao fim da contagem
  for (const u of l.units) {
    const lv = ef(u, 'livro');
    if (lv && lv.dur === 1 && u.vivo) {
      log(st, `Livro da Vida e Morte: ${u.nome} é executado.`);
      u.naoRevive = true; matar(st, null, u);
    }
  }
  // regra 5 — durações descontam no FIM do turno de quem carrega o efeito
  for (const u of l.units) {
    u.efeitos = u.efeitos.map(e => ({ ...e, dur: e.dur - 1 })).filter(e => e.dur > 0);
    u.dots = u.dots.map(d => ({ ...d, dur: d.dur - 1 })).filter(d => d.dur > 0);
  }
  // PRIMITIVA estado global Dia/Noite — conta um por turno de jogador
  if (st.fase && st.faseDur > 0) { st.faseDur--; if (st.faseDur === 0) definirFase(st, null); }
  if (st.turno >= 40) {
    const hp = st.lados.map(x => x.units.reduce((s, u) => s + u.hp, 0));
    st.fim = hp[0] === hp[1] ? 'Empate' : `Jogador ${hp[0] > hp[1] ? 1 : 2} vence por HP (turno 40)`;
    return;
  }
  st.ativo = 1 - st.ativo;
  if (st.ativo === st.starter) st.turno++;   // conta rodadas a partir de quem abriu
  log(st, `Turno ${st.turno} · Jogador ${st.ativo + 1} joga`);   // idem: formato sem preposição p/ a tradução da visão
  iniciarTurno(st);
}

function checarFim(st) {
  for (let i = 0; i < 2; i++) {
    if (st.lados[i].units.every(u => !u.vivo && !u.pendenteRenascer)) st.fim = `Jogador ${2 - i} vence`;
  }
}

// ------------------------------------------------------ DISPONIBILIDADE
function acoesDe(st, u) {
  const l = st.lados[u.lado];
  const lista = [...kitDe(st, u).ab, DEFESA];   // ab vem do catálogo da partida (st.catId); DEFESA é regra universal, não deus
  return lista.map(a => {
    let cost = a.cost;
    if (u.key === 'cuca' && a.slot === 'basico' && st.turno % 3 === 0) cost = {};   // passiva Cuca
    let motivo = null;
    if (u.cd[a.slot] > 0) motivo = `recarga ${u.cd[a.slot]}`;
    else if (!podePagar(l, cost)) motivo = 'orbes insuficientes';
    else if (a.slot !== 'defesa') {
      const sil = ef(u, 'silenceClass');
      if (sil && sil.cls === classeDe(st, u, a) && a.slot !== 'basico') motivo = `habilidades ${sil.cls} travadas`;
      const lk = ef(u, 'lockSkill');
      if (lk && lk.slot === a.slot) motivo = 'habilidade travada';
    }
    return { ...a, cost, classe: a.slot === 'defesa' ? 'Universal' : classeDe(st, u, a),
             passos: passosDe(u, a), disponivel: !motivo, motivo };
  });
}

function podeAgir(u) {
  return u.vivo && !u.agiu && !ef(u, 'atordoado') && !ef(u, 'adormecido') && !ef(u, 'submerso');
}

// candidatos para o passo `i` de seleção, já excluindo quem foi escolhido antes
function alvosValidos(st, u, a, i = 0, jaEscolhidos = []) {
  const passos = a.passos || passosDe(u, a);
  const tipo = passos[i];
  if (!tipo) return [];
  let lista;
  if (tipo === 'aliado') {
    lista = st.lados[u.lado].units.filter(x => x.vivo);
  } else {
    lista = st.lados[1 - u.lado].units.filter(x => x.vivo && !ef(x, 'submerso'));
    const tt = ef(u, 'taunt');
    if (tt) {
      // regra 7 — Provocar suspenso se o provocador está intocável
      const prov = st.lados[1 - u.lado].units.find(x => x.uid === tt.origem);
      if (prov && prov.vivo && !ef(prov, 'invulneravel') && !ef(prov, 'submerso')) lista = [prov];
    }
  }
  return lista.filter(x => !jaEscolhidos.includes(x.uid));
}

// ------------------------------------------------------------ EXECUÇÃO
function agir(st, uid, slot, alvoUids = [], escolhas = null, modoEscolha = null) {
  if (st.fim) return { ok: false, erro: 'A partida terminou.' };
  const l = st.lados[st.ativo];
  const u = l.units.find(x => x.uid === uid);
  if (!u) return { ok: false, erro: 'Unidade inválida.' };
  if (!podeAgir(u)) return { ok: false, erro: `${u.nome} não pode agir.` };
  const a = acoesDe(st, u).find(x => x.slot === slot);
  if (!a) return { ok: false, erro: 'Ação inválida.' };
  if (!a.disponivel) return { ok: false, erro: a.motivo };

  pagar(st, l, a.cost);
  u.agiu = true;
  if (a.cd) u.cd[a.slot] = a.cd;

  const inimigos = st.lados[1 - u.lado].units;
  const alvos = alvoUids.map(id => [...inimigos, ...l.units].find(x => x.uid === id)).filter(Boolean);

  // monta a lista de efeitos: modo alternado (Nezha), escolha múltipla (Lugh/Nüwa) ou fx fixo
  let fx = a.fx;
  if (a.alterna) {
    const modo = modoEscolha !== null ? modoEscolha : u.modo;
    fx = modo === 0
      ? [{ t: 'apply', eff: { type: 'lockSkill', slot: 'habilidade', dur: 1 } }]
      : [{ t: 'dmg', v: 12, escopo: 'todosInimigos' }, { t: 'dot', nome: 'Queimadura', v: 8, dur: 2, escopo: 'todosInimigos' }];
    log(st, `Arsenal Celeste — ${modo === 0 ? 'ANEL' : 'MANTO'}.`);
    u.modo = 1 - modo;
  } else if (a.opcoes) {                                   // PRIMITIVA escolha múltipla
    const idxs = (escolhas && escolhas.length) ? escolhas : [0];
    fx = [];
    for (const i of idxs) if (a.opcoes[i]) fx.push(...a.opcoes[i].fx);
    log(st, `${u.nome} usa ${a.nome} (${idxs.map(i => a.opcoes[i] && a.opcoes[i].nome).filter(Boolean).join(' + ')}).`);
  } else {
    log(st, `${u.nome} usa ${a.nome}.`);
  }

  // PRIMITIVA copiar habilidade — registra a última Habilidade real usada no lado (Ísis lê isto).
  // Uma habilidade que É uma cópia não se registra: senão copiaria a si mesma em laço.
  const eCopia = Array.isArray(fx) && fx.some(e => e.t === 'copiar');
  if (slot === 'habilidade' && !a.alterna && !a.opcoes && !eCopia) l.ultHabilidade = { nome: a.nome, fx, alvoSpec: a.alvo, slot: 'habilidade' };

  aplicarFx(st, u, fx, a, alvos, escolhas);
  checarFim(st);
  return { ok: true };
}

// -------------------------------------------- executor de efeitos (reutilizável)
// Extraído de agir() para poder ser chamado também pela cópia de habilidade.
// `a` fornece o alvo padrão (a.alvo) e o slot. `alvos` são as unidades escolhidas.
function aplicarFx(st, u, fx, a, alvos = [], escolhas = null) {
  const l = st.lados[u.lado];
  const inimigos = st.lados[1 - u.lado].units;
  const unico = a.alvo === 'inimigo' || a.alvo === 'aliado';   // golpe de alvo único (interceptar/contra-atacar)

  for (const e of fx) {
    // RECUSA em runtime um efeito que o motor não sabe executar — typo não passa em silêncio
    // (o mesmo TIPOS_FX é a fonte do validador de build). Ver acréscimo 3 da F1.0a.
    if (!TIPOS_FX.includes(e.t)) throw new Error(`fx desconhecido: "${e.t}"${a && a.nome ? ` em "${a.nome}"` : ''}`);
    const escopo = e.escopo || a.alvo;
    let sel = [];
    if (e.escopo === 'self') sel = [u];
    else if (escopo === 'time') sel = l.units.filter(x => x.vivo);
    else if (escopo === 'todosInimigos') sel = inimigos.filter(x => x.vivo);
    else if (escopo === 'aliadoCaido') sel = alvos.filter(x => !x.vivo);
    else if (escopo === 'todosCaidos') sel = l.units.filter(x => !x.vivo);
    else if (e.idx !== undefined) sel = alvos[e.idx] ? [alvos[e.idx]] : [];
    else sel = alvos;

    for (const t of sel) {
      if (e.t === 'dmg') {
        const base = danoBase(st, u, t, e, l);
        const feito = bater(st, u, t, base, e.kind || 'afetado', a.slot, { unico });
        if (e.curaMetade) curar(st, u, Math.floor(feito / 2));
      }
      else if (e.t === 'heal') curar(st, t, e.v);
      else if (e.t === 'dot') aplicarDot(st, t, e.nome, e.v, e.dur);
      else if (e.t === 'apply') {
        if (ef(t, 'invulneravel') && t.lado !== u.lado) { log(st, `${t.nome} está Invulnerável — efeito falhou.`); continue; }
        aplicar(st, t, { ...e.eff, origem: u.uid });
      }
      else if (e.t === 'contador' && e.alvo !== 'self') addContador(st, t, e.nome, e.v, e.max);
      else if (e.t === 'vidaExtra') { t.vidaExtra = { hp: e.hp }; log(st, `${t.nome} recebeu Vida Extra (${e.hp}).`); }
      else if (e.t === 'revive') reviver(st, t, e);
      else if (e.t === 'destroyShield') { if (t.shield) { log(st, `Escudo de ${t.nome} destruído (${t.shield}).`); t.shield = 0; } }
      else if (e.t === 'stripDef') t.efeitos = t.efeitos.filter(x => !BUFFS_DEF.includes(x.type));
      else if (e.t === 'stripBuffs') t.efeitos = t.efeitos.filter(x => !BUFFS.includes(x.type));
      else if (e.t === 'stripOne') {
        const i = t.efeitos.findIndex(x => BUFFS.includes(x.type));
        if (i >= 0) { log(st, `${t.nome} perdeu ${t.efeitos[i].type}.`); t.efeitos.splice(i, 1); }
      }
      else if (e.t === 'cleanse') { t.efeitos = t.efeitos.filter(x => !DEBUFFS.includes(x.type)); t.dots = []; }
      else if (e.t === 'shield') { t.shield += e.v; log(st, `${t.nome} ganhou ${e.v} de Defesa Destrutível.`); }
    }

    // consumo de contador do próprio atacante: DEPOIS de escalar todos os alvos (Rá — Olho de Rá)
    if (e.t === 'dmg' && e.consomeContador && getContador(u, e.consomeContador) > 0) {
      log(st, `${u.nome} consome ${getContador(u, e.consomeContador)} de ${e.consomeContador}.`);
      u.contadores[e.consomeContador] = 0;
    }
    // efeitos "uma vez" — não iteram sobre a seleção (agem em self ou globalmente):
    if (e.t === 'selfHp') { u.hp = Math.max(1, u.hp + e.v); log(st, `${u.nome} perdeu ${-e.v} de HP.`); }
    if (e.t === 'contador' && e.alvo === 'self') addContador(st, u, e.nome, e.v, e.max);
    if (e.t === 'intercepta') {
      const protege = e.protege === 'time' ? 'time' : (alvos[0] ? alvos[0].uid : u.uid);
      aplicar(st, u, { type: 'intercepta', protege, dur: e.dur, contra: e.contra || 'todos', origem: u.uid });
      if (e.contraAtaca) aplicar(st, u, { type: 'contraAtaca', v: e.contraAtaca, dur: e.dur, contra: e.contra || 'todos', origem: u.uid });
      log(st, `${u.nome} passa a interceptar golpes${protege === 'time' ? ' do time' : ' dirigidos a um aliado'}.`);
    }
    if (e.t === 'armazenaDano') {
      aplicar(st, u, { type: 'armazenaDano', dur: e.dur, max: e.max, alvo: alvos[0] ? alvos[0].uid : null, acc: 0, origem: u.uid });
      log(st, `${u.nome} começa a armazenar o dano do time.`);
    }
    if (e.t === 'invocar') {
      l.invocacoes.push({ nome: e.nome, tipo: e.tipo, hp: e.hp || 0, v: e.v || 0, dur: e.dur, dono: u.uid });
      log(st, `${u.nome} invoca ${e.nome}${e.hp ? ` (${e.hp} de HP)` : ''}.`);
      if (e.provoca && alvos[0]) aplicar(st, alvos[0], { type: 'taunt', dur: e.dur, origem: u.uid });
    }
    if (e.t === 'copiar') copiar(st, u, e);
    if (e.t === 'fase') definirFase(st, e.v, e.dur);         // PRIMITIVA estado global Dia/Noite
    if (e.t === 'atordoaMenorHp') {
      const vivos = inimigos.filter(x => x.vivo);
      if (vivos.length) {
        const alvoM = vivos.slice().sort((a, b) => a.hp - b.hp)[0];
        if (ef(alvoM, 'invulneravel')) log(st, `${alvoM.nome} está Invulnerável — atordoamento falhou.`);
        else aplicar(st, alvoM, { type: 'atordoado', dur: e.dur, origem: u.uid });
      }
    }
    if (e.t === 'vinculo' && alvos.length >= 2) {
      aplicar(st, alvos[0], { type: 'vinculo', par: alvos[1].uid, dur: e.dur, origem: u.uid });
      aplicar(st, alvos[1], { type: 'vinculo', par: alvos[0].uid, dur: e.dur, origem: u.uid });
      log(st, `${alvos[0].nome} e ${alvos[1].nome} estão vinculados.`);
    }
    if (e.t === 'cdShift') {
      const tgt = e.lado === 'proprio' ? l : st.lados[1 - u.lado];
      for (const x of tgt.units) for (const k in x.cd) x.cd[k] = Math.max(0, x.cd[k] + e.v);
      log(st, `Recargas do ${e.lado === 'proprio' ? 'seu time' : 'time inimigo'} ${e.v > 0 ? '+' : ''}${e.v}.`);
    }
    if (e.t === 'orbGain') {
      const tipos = [...new Set(l.units.filter(x => x.vivo).map(x => x.elem))];
      for (let i = 0; i < e.n; i++) l.orbs[tipos[Math.floor(rng(st) * tipos.length)]]++;
      log(st, `+${e.n} orbes.`);
    }
  }
}

// -------- helpers de dano e das primitivas de execução --------
function danoBase(st, u, t, e, l) {
  let base = e.v;
  if (e.seEncharcado && ef(t, 'encharcado')) base = e.seEncharcado;
  if (e.seAdormecido && ef(t, 'adormecido')) base = e.seAdormecido;
  if (e.seDia && st.fase === 'Dia') base = e.seDia;
  if (e.seNoite && st.fase === 'Noite') base = e.seNoite;
  if (e.seAliadoJaAgiu && l.units.some(x => x.uid !== u.uid && x.agiu)) base += e.seAliadoJaAgiu;
  if (e.porContador) base += e.porContador.v * getContador(e.porContador.onde === 'alvo' ? t : u, e.porContador.nome);
  if (e.porContadorCampo) base += e.porContadorCampo.v * contadorNoCampo(st, e.porContadorCampo.nome, e.porContadorCampo.lado === 'aliados' ? u.lado : 1 - u.lado);
  if (e.porAliadoCaido) base += e.porAliadoCaido * caidos(st, u.lado);
  if (e.porInimigoCaido) base += e.porInimigoCaido * caidos(st, 1 - u.lado);
  return base;
}

// PRIMITIVA revive — traz um aliado caído de volta, salvo se ficou marcado como irrevivível
function reviver(st, alvo, e) {
  if (alvo.vivo) return;
  if (alvo.naoRevive) { log(st, `${alvo.nome} não pode ser revivido.`); return; }
  alvo.vivo = true; alvo.hp = Math.min(alvo.maxHp, e.hp); alvo.agiu = true;
  alvo.efeitos = []; alvo.dots = []; alvo.shield = 0;
  for (const k in alvo.cd) alvo.cd[k] = 0;
  log(st, `${alvo.nome} foi revivido com ${alvo.hp} de HP.`);
}

// PRIMITIVA copiar habilidade — executa uma habilidade de outra fonte sem pagar o custo
function copiar(st, u, e) {
  if (e.fonte === 'ultimaHabilidadeAliada') {
    const ref = st.lados[u.lado].ultHabilidade;
    if (!ref) { log(st, `${u.nome} não encontrou uma Habilidade para copiar.`); return; }
    log(st, `${u.nome} copia ${ref.nome}.`);
    // alvo automático: o primeiro inimigo vivo (a cópia herda o alvo padrão da habilidade)
    const alvo = st.lados[1 - u.lado].units.find(x => x.vivo);
    aplicarFx(st, u, ref.fx, { alvo: ref.alvoSpec, slot: 'habilidade' }, alvo ? [alvo] : []);
  }
}

if (typeof module !== 'undefined') {
  // GODS vem do catálogo (data/deuses via catalogo.js) — o motor não possui os dados.
  // É o MESMO objeto que catalogoAtivo() retorna (require em cache), então os testes que
  // mutam E.GODS.tnuwa e chamam novoEstado(['tnuwa']) continuam valendo sem edição.
  const { GODS } = require('./catalogo.js');
  module.exports = {
    GODS, DEFESA, ELEMS, VOCAB, novoEstado, agir, fimTurno, acoesDe, alvosValidos, podeAgir,
    converter, planoConversao, CONV_CUSTO, totalOrbs, ef, alocarLivre, sortearElemento, iniciarTurno,
    // primitivas (para os testes exercitarem em isolamento, antes dos kits)
    aplicarFx, bater, addContador, getContador, contadorNoCampo, definirFase, caidos, reviver,
  };
}

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
  'restauraMax', 'espalha',
];
// DoTs são efeitos NOMEADOS — viram CHAVE como todo o resto (ver docs/eventos.md A). O
// nome exibível ("Queimadura") mora no narrador (ui/base.js NOMES_DOT), não no motor.
const DOTS = ['queimadura'];   // cresce (veneno, sangramento…) ao provar os 73 kits
const CONTADORES = ['discoSolar'];   // CHAVES de contador (fx contador.nome); nome exibível em ui/base.js NOMES_CONTADOR. Cresce por kit.
// PASSIVAS DECLARATIVAS (F1.2, DECISOES §36) — a passiva ganha `fx` como a habilidade, para o
// motor não carregar um `if (u.key===...)` por deus. A SESSÃO 1 abre UM gatilho só: bonusDano.
// Migração é por DEUS INTEIRO (§37): um deus só migra quando TODOS os gatilhos da sua passiva
// existem — meio-migrado deixa hardcode invisível. Por isso a sessão 1 migra ZERO reais (os 12
// implementados têm passiva multi-parte) e prova o mecanismo num deus sintético (tests/passiva.test.js).
// Cada gatilho declara os CAMPOS que aceita e os OBRIGatórios — o validador dispara por gatilho, então
// um `v` num danoIrredutivel ou um `ignora` num bonusDano é recusado como "campo não pertence ao gatilho".
// Cresce um gatilho por sessão: bonusCura, reducao, onKill, onDeath, porTurno, reativa…
const GATILHOS_PASSIVA = {
  bonusDano:       { campos: ['v', 'escopo', 'quando'], obrig: ['v'] },        // soma v ao dano (sessão 1)
  danoIrredutivel: { campos: ['ignora'], obrig: ['ignora'] },                  // dano do DONO fura redução/escudo (sessão 2)
  reducao:         { campos: ['v', 'escopo', 'contra'], obrig: ['v'] },        // reduz o dano recebido (sessão 3)
};
const IGNORAVEIS = ['reducao', 'escudo'];  // o que danoIrredutivel pode furar (ogum: reducao; tyr: ambos)
const ESCOPOS_PASSIVA = ['self', 'time'];  // self = vale só quando o DONO ataca; time = qualquer aliado vivo
const MARCAS = [];                          // marcas ofensivas (Olho etc.) — VAZIO hoje; chega com a vulnerabilidade
const SLOTS_ATAQUE = ['basico', 'habilidade', 'milagre'];
// `contra` (condição DEFENSIVA do gatilho reducao) — EIXO SEPARADO do `quando`: `quando` lê o lado
// OFENSIVO (quem ataca, quem é atacado, estado do campo); `contra` lê o GOLPE QUE CHEGA. Os dois
// vocabulários NÃO se misturam (ver docs/passivas.md). Fechado; abre só `slot` na sessão 3 — as outras
// (classe do oni, elemNao do baldur, …) entram por deus. Uma chave por condição; ausência = todo ataque.
const CONTRA = {
  slot: { sub: SLOTS_ATAQUE },   // reduz só golpes deste slot (sobek: 'basico')
};
// `quando` (condição do bônus) — conjunto FECHADO. Cada chave declara COMO validar o valor:
//   sub  → valor ∈ lista   ·   bool → valor === true   ·   hp → {op, v}
// `pendente` = condição no vocabulário mas cujo ESTADO o motor ainda não rastreia; valida_kit
// RECUSA em voz alta (nunca vira falso silencioso). Ausência de `quando` = sempre. Ver docs/passivas.md.
const CONDICOES = {
  alvoDebuff:      { sub: [...DEBUFFS, 'qualquer', 'controle'] },   // alvo tem debuff (nome, 'qualquer' ou 'controle')
  alvoBuff:        { sub: [...BUFFS, 'qualquer'] },                 // alvo tem buff
  alvoDefesa:      { bool: true },                                 // alvo tem escudo OU redução de dano
  alvoElem:        { sub: ELEMS },                                 // alvo é do elemento
  alvoHp:          { hp: true },                                   // {op:'cheio'|'abaixo'|'acima', v?}
  atacanteElem:    { sub: ELEMS },                                 // quem ataca é do elemento (escopo aliados)
  fase:            { sub: ['Dia', 'Noite'] },                      // estado global Dia/Noite
  alvoMarca:       { sub: MARCAS, pendente: 'marca ofensiva (Olho) ainda não existe — vem com a vulnerabilidade' },
  alvoCuradoAntes: { bool: true, pendente: 'o motor ainda não rastreia cura-no-turno-anterior' },
};
const VOCAB = {
  classes: CLASSES,                              // classe de habilidade
  elementos: ELEMS,
  custo: [...ELEMS, 'livre'],                    // chaves válidas em cost{}
  alvos: [...Object.keys(PASSOS), 'auto'],       // valores válidos de ability.alvo
  fx: TIPOS_FX,                                  // valores válidos de fx.t
  efeitos: [...new Set([...DEBUFFS, ...BUFFS])], // valores válidos de eff.type (t:'apply')
  dots: DOTS,                                    // chaves de DoT (fx dot.nome)
  contadores: CONTADORES,                        // chaves de contador (fx contador.nome)
  gatilhosPassiva: Object.keys(GATILHOS_PASSIVA), // valores válidos de passiva.fx[].gatilho (F1.2)
  gatilhosPassivaDef: GATILHOS_PASSIVA,           // campos/obrigatórios por gatilho (valida_kit dispara por isto)
  ignoraveis: IGNORAVEIS,                          // valores válidos em danoIrredutivel.ignora
  contra: Object.keys(CONTRA),                     // chaves válidas em reducao.contra (eixo DEFENSIVO)
  contraDef: CONTRA,                               // como validar cada chave de contra
  escoposPassiva: ESCOPOS_PASSIVA,               // valores válidos de passiva.fx[].escopo
  condicoes: Object.keys(CONDICOES),             // chaves válidas em passiva.fx[].quando
  condicoesDef: CONDICOES,                        // como validar o valor de cada condição (valida_kit lê)
  // campos que o motor LÊ num fx (danoBase + aplicarFx). Um fx com campo fora disto é typo.
  fxKeys: [
    't', 'v', 'kind', 'eff', 'escopo', 'nome', 'dur', 'idx', 'n', 'lado', 'max', 'hp',
    'tipo', 'provoca', 'contra', 'contraAtaca', 'protege', 'fonte', 'alvo', 'consomeContador',
    'porContador', 'porContadorCampo', 'porAliadoCaido', 'porInimigoCaido', 'curaMetade',
    'seEncharcado', 'seAdormecido', 'seDia', 'seNoite', 'seAliadoJaAgiu', 'limiar',
    'pool', 'porContadorLado', 'consomeContadorLado',   // contador de campo por LADO (pool do time, F1.1)
    'reduzMaxHp',   // Podridão: reduz o HP máximo por acúmulo (F1.1 primitiva 3)
  ],
  // ---- gramática de EVENTOS (docs/eventos.md); a varredura (tests/eventos.test.js) valida ----
  eventos: [
    'abertura', 'turno', 'acao', 'dano', 'cura', 'dot', 'efeito', 'orbe', 'conversao',
    'cd', 'bloqueio', 'imune', 'queda', 'revive', 'passiva', 'fase', 'fim',
    'escudo', 'contador', 'acordar', 'controle',
  ],
  camposEvento: [   // nomes de campo CANÔNICOS permitidos num evento (nada de sinônimo)
    'tipo', 'turno', 'lado', 'origem', 'alvo', 'valor', 'kind', 'duracao', 'slot',
    'efeito', 'motivo', 'para', 'modo', 'opcoes', 'passiva', 'resultado', 'absorvido',
    // RESERVADOS p/ sub-tokens de 0-kit (nome canônico decidido agora, complete-by-construction):
    'habilidadeCopiada',   // efeito:copiar — qual Habilidade foi copiada (Ísis, F1.3)
    'invocacao',           // efeito:invocacao — qual invocação (kits de invocar, futuros)
  ],
  motivos: [        // conjunto FECHADO — motivo nunca é texto livre (docs/eventos.md)
    'invulneravel', 'submerso', 'controle_imune',       // bloqueio de efeito
    'sem_cura', 'nao_revive',                           // falha (noHeal / naoRevive)
    'em_recarga', 'sem_energia', 'silenciado', 'travada', // indisponibilidade de ação (acoesDe)
    'tempo',                                            // fim por esgotamento (turno 40)
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
    contadores: {},      // contadores acumuláveis por CHAVE: { discoSolar: 3, atadura: 2 } (nome exibível no narrador)
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
      { units: timeA.map((k, i) => novaUnidade(k, i, 0, catalogo)), orbs: zeroOrbs(), converteu: false, estreou: false, invocacoes: [], ultHabilidade: null, dividaLivre: 0, contadores: {} },
      { units: timeB.map((k, i) => novaUnidade(k, i, 1, catalogo)), orbs: zeroOrbs(), converteu: false, estreou: false, invocacoes: [], ultHabilidade: null, dividaLivre: 0, contadores: {} },
    ],
  };
  log(st, { tipo: 'turno', turno: 1, lado: comeca });   // a visão traduz lado -> Você/CPU/Jogador N por modo
  iniciarTurno(st);
  return st;
}

function zeroOrbs() { const o = {}; ELEMS.forEach(e => o[e] = 0); return o; }
// log() empurra um EVENTO ESTRUTURADO (docs/eventos.md), nunca texto. O narrador (ui/narrar.js)
// traduz para pt-BR na hora de exibir. `ev` é { tipo, ...campos canônicos }.
function log(st, ev) { st.log.push({ turno: st.turno, ...ev }); }
function rng(st) { const f = mulberry32(st.seed + st.rngN * 7919); st.rngN++; return f(); }

// ------------------------------------------------------------ EFEITOS
function ef(u, type) { return u.efeitos.find(e => e.type === type); }
function temControle(u) { return u.efeitos.some(e => CONTROLES.includes(e.type)); }

function aplicar(st, u, eff) {
  const e = { ...eff };
  // regra 7 — proteção vence controle
  if (CONTROLES.includes(e.type) && ef(u, 'controlImmune')) {
    log(st, { tipo: 'bloqueio', alvo: u.key, motivo: 'controle_imune', efeito: e.type }); return;
  }
  if (e.type === 'adormecido' && u.key === 'cuca') {
    log(st, { tipo: 'imune', alvo: u.key, efeito: 'adormecido' }); return;
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
  // passiva Nezha — "imune a Veneno e Queimadura". §39: a prosa VENCE; o hardcode antigo bloqueava TODO
  // DoT (imunidade que crescia sozinha a cada DoT novo). Lista fechada até a Nezha migrar (gatilho imunidade).
  if (u.key === 'nezha' && (nome === 'veneno' || nome === 'queimadura')) { log(st, { tipo: 'imune', alvo: u.key, efeito: nome }); return; }
  const ja = u.dots.find(d => d.nome === nome);
  if (ja) { ja.v = Math.max(ja.v, v); ja.dur = Math.max(ja.dur, dur); }   // regra 6
  else u.dots.push({ nome, v, dur });
}

// -------------------------------------------------- PRIMITIVAS: contadores
// Contadores acumuláveis por CHAVE (discoSolar, cauda, atadura, podridao, combo…; nome no narrador).
// Genéricos: somam, respeitam um teto opcional, podem ser lidos e consumidos.
// O que cada contador FAZ (limiares, escalas) é decisão do kit; aqui só se guarda.
function addContador(st, u, nome, v = 1, max = null) {
  const atual = u.contadores[nome] || 0;
  let novo = atual + v;
  if (max != null) novo = Math.min(novo, max);
  if (novo < 0) novo = 0;
  u.contadores[nome] = novo;
  if (novo !== atual) log(st, { tipo: 'contador', origem: u.key, valor: novo - atual, efeito: nome });
  return novo;
}
function getContador(u, nome) { return u.contadores[nome] || 0; }
// PRIMITIVA limiar-de-contador (F1.1, família "gatilho-no-acúmulo"): CRUZAR de baixo de `em` para
// em-ou-acima dispara UMA vez o efeito `aplica`. Regras travadas em teste: (1) dispara ao CRUZAR,
// uma vez — acúmulo já ≥ em NÃO redispara ("chegar a 4", não "estar em 4+"); (2) cruzar de uma vez
// (3→5 por +2) conta, não precisa parar no limiar; (3) `aplicar` respeita imunidade — o efeito
// falha, o contador fica, sem retroação. A config mora no DADO (fx.limiar), não no motor.
function cruzarLimiar(st, origem, alvo, e, antes) {
  const L = e.limiar; if (!L) return;
  if (antes < L.em && getContador(alvo, e.nome) >= L.em) aplicar(st, alvo, { ...L.aplica, origem: origem.uid });
}
// PRIMITIVA redução de HP MÁXIMO (F1.1, primitiva 3 — Podridão do Ah Puch): reduz `maxHp` com PISO 1
// (hp a 0 é MORTE, maxHp é CAPACIDADE — se a decomposição matasse sozinha seria execução disfarçada
// sem limiar; execução é sempre declarada, §32). GUARDA a perda real (`maxHpPerdido`) p/ o Itzamná
// restaurar. O clamp de hp NUNCA mata: como maxHp tem piso 1, hp é puxado no mínimo até 1, não a 0.
function reduzirMaxHp(u, amt) {
  const alvoMax = Math.max(1, u.maxHp - amt);
  u.maxHpPerdido = (u.maxHpPerdido || 0) + (u.maxHp - alvoMax);   // perda REAL (limitada pelo piso)
  u.maxHp = alvoMax;
  if (u.hp > u.maxHp) u.hp = u.maxHp;                             // clamp; maxHp≥1 => hp≥1, não mata
}
// pós-acúmulo de contador: o limiar (gatilho) e a redução de máximo reagem à MESMA mudança do número.
function aposAcumular(st, origem, alvo, e, antes) {
  cruzarLimiar(st, origem, alvo, e, antes);
  if (e.reduzMaxHp) { const d = getContador(alvo, e.nome) - antes; if (d > 0) reduzirMaxHp(alvo, e.reduzMaxHp * d); }
}
// PRIMITIVA contágio (F1.1, primitiva 4 — Maldição de Yomi): IGUALA todas as `unidades` ao MAIOR
// contador entre elas (teto `e.max`). A fonte RETÉM DE GRAÇA — está no máximo, então igualar não a
// move; NÃO precisa de `if` protegendo a fonte (quem adicionar um vira erro, não correção). Aditivo
// NÃO: igualar dá contágio sem laço multiplicativo (espalhar 2× sem novo acúmulo não muda nada, pois
// todas já estão no máximo). A subida passa por `aposAcumular`: chegar a N é chegar a N — contágio
// dispara limiar/redução igual a acúmulo direto, sem regra oculta (§33). Só SOBE, nunca abaixa.
function espalharContador(st, unidades, e, origem) {
  const vivas = unidades.filter(u => u.vivo);
  const teto = e.max != null ? e.max : Infinity;
  const m = Math.min(teto, vivas.reduce((mx, u) => Math.max(mx, getContador(u, e.nome)), 0));
  for (const u of vivas) {
    const antes = getContador(u, e.nome);
    if (m > antes) {
      u.contadores[e.nome] = m;
      log(st, { tipo: 'contador', origem: origem.key, valor: m - antes, efeito: e.nome });
      aposAcumular(st, origem, u, e, antes);
    }
  }
}
function contadorNoCampo(st, nome, lado) {
  return st.lados[lado].units.filter(u => u.vivo).reduce((s, u) => s + getContador(u, nome), 0);
}
// PRIMITIVA contador de CAMPO por LADO (F1.1, primitiva 2): pool do TIME, distinto dos contadores
// por-unidade. `contadorNoCampo` pergunta "quanto o time TEM, somando as unidades" (MUDA com a queda
// de uma unidade); o pool pergunta "quanto o time ACUMULOU" (NÃO muda com queda — o Combo é do lado).
// São perguntas diferentes que só coincidem por acidente hoje; stores separados de propósito. O pool
// permanece se o gerador cai (senão o finalizador que "consome TODO o Combo" viraria armadilha), e com
// dois geradores (Susanoo + Fujin/Raijin) "de quem é o Combo" não faz sentido — é do lado (DECISÕES §31).
function addContadorLado(st, lado, nome, v, max = null, origem = null) {
  const l = st.lados[lado]; l.contadores = l.contadores || {};
  const atual = l.contadores[nome] || 0;
  let novo = atual + v; if (max != null) novo = Math.min(novo, max); if (novo < 0) novo = 0;
  l.contadores[nome] = novo;
  if (novo !== atual && origem) log(st, { tipo: 'contador', origem: origem.key, valor: novo - atual, efeito: nome });
  return novo;
}
function getContadorLado(st, lado, nome) { return (st.lados[lado].contadores || {})[nome] || 0; }

// ----------------------------------------------- PRIMITIVA: estado Dia/Noite
function definirFase(st, fase, dur) {
  if (fase === null) { if (st.fase) log(st, { tipo: 'fase', efeito: st.fase, duracao: 0 }); st.fase = null; st.faseDur = 0; return; }
  st.fase = fase; st.faseDur = dur;
  log(st, { tipo: 'fase', efeito: fase, duracao: dur });
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
  if (atk.elem === 'Aurora' && meu.units.some(x => x.vivo && x.key === 'ra')) b += 5;   // passiva Rá (Barca do Sol): aliados Aurora +5
  return b;
}

// PASSIVA declarativa (F1.2) — avalia UMA condição `quando` (objeto de 1 chave). Ausente = sempre.
// Só lê estado; conjunto FECHADO (CONDICOES). alvoMarca/alvoCuradoAntes são `pendente` no schema
// (valida_kit os barra), então nunca chegam aqui com dado válido — caem no `return false`.
function condOK(q, atk, alvo, st) {
  if (!q) return true;
  if ('alvoDebuff' in q) {
    const val = q.alvoDebuff;
    if (val === 'qualquer') return alvo.efeitos.some(e => DEBUFFS.includes(e.type));
    if (val === 'controle') return alvo.efeitos.some(e => CONTROLES.includes(e.type));
    return alvo.efeitos.some(e => e.type === val) || (DOTS.includes(val) && alvo.dots.some(d => d.nome === val));
  }
  if ('alvoBuff' in q) {
    const val = q.alvoBuff;
    if (val === 'qualquer') return alvo.efeitos.some(e => BUFFS.includes(e.type)) || alvo.shield > 0;
    return alvo.efeitos.some(e => e.type === val);
  }
  if ('alvoDefesa' in q) return alvo.shield > 0 || !!ef(alvo, 'dmgReduction');
  if ('alvoElem' in q) return alvo.elem === q.alvoElem;
  if ('alvoHp' in q) {
    const h = q.alvoHp;
    if (h.op === 'cheio') return alvo.hp >= alvo.maxHp;
    if (h.op === 'abaixo') return alvo.hp < h.v;
    if (h.op === 'acima') return alvo.hp > h.v;
    return false;
  }
  if ('atacanteElem' in q) return atk.elem === q.atacanteElem;
  if ('fase' in q) return st.fase === q.fase;
  return false;
}

// Soma o +v das passivas declarativas (gatilho bonusDano) no lado do atacante. escopo self =
// só quando o dono é o atacante; time = qualquer aliado vivo (sujeito ao `quando`). Ver DECISOES §36.
function bonusDanoDeclarativo(st, atk, alvo) {
  let b = 0;
  for (const u of st.lados[atk.lado].units) {
    if (!u.vivo) continue;
    const g = kitDe(st, u);                     // guarda defensiva: unidade sem kit no catálogo
    const p = g && g.passiva;
    if (!p || !Array.isArray(p.fx)) continue;
    for (const f of p.fx) {
      if (f.gatilho !== 'bonusDano') continue;
      if ((f.escopo || 'self') === 'self' && u !== atk) continue;
      if (condOK(f.quando, atk, alvo, st)) b += f.v;
    }
  }
  return b;
}

// danoIrredutivel (F1.2 sessão 2) — o dano do PRÓPRIO atacante fura redução e/ou escudo. Lê a passiva
// declarativa do atacante (é propriedade do dono, então sempre self). ogum fura redução; tyr, ambos.
function danoImune(st, atk) {
  const out = { reducao: false, escudo: false };
  const g = kitDe(st, atk);                    // invocações (key '__inv') não têm kit — guarda
  const p = g && g.passiva;
  if (p && Array.isArray(p.fx)) for (const f of p.fx) {
    if (f.gatilho === 'danoIrredutivel') for (const x of f.ignora) out[x] = true;
  }
  return out;
}

// reducao (F1.2 sessão 3) — reduz o dano RECEBIDO por `alvo`. Lê a passiva de quem protege (self = só o
// dono; time = qualquer aliado vivo) e a condição DEFENSIVA `contra`, que lê o GOLPE que chega (slot).
// Regra 6: pega o MAIOR, não soma. `contra` é eixo separado do `quando` ofensivo (ver docs/passivas.md).
function contraCasou(c, slot) {
  if ('slot' in c) return c.slot === slot;
  return false;   // chaves futuras (classe, elemNao) ainda não abertas — valida_kit já as recusaria
}
function reducaoDeclarativa(st, alvo, slot) {
  let r = 0;
  for (const u of st.lados[alvo.lado].units) {
    if (!u.vivo) continue;
    const g = kitDe(st, u); const p = g && g.passiva;
    if (!p || !Array.isArray(p.fx)) continue;
    for (const f of p.fx) {
      if (f.gatilho !== 'reducao') continue;
      if ((f.escopo || 'self') === 'self' && u !== alvo) continue;   // self protege só o dono
      if (f.contra && !contraCasou(f.contra, slot)) continue;        // condição do golpe que chega
      r = Math.max(r, f.v);
    }
  }
  return r;
}

function calcDano(st, atk, alvo, base, kind, slot) {
  let v = base + bonusDano(st, atk);
  v += bonusDanoDeclarativo(st, atk, alvo);   // passivas declarativas (F1.2, gatilho bonusDano)
  if (ef(alvo, 'adormecido')) v += 8;                               // Cuca — passiva de Orfeu/Cuca (vulnerabilidade, não migrada)
  if (v < 0) v = 0;

  const irred = danoImune(st, atk);   // ogum/tyr migrados: danoIrredutivel declarativo (§37)
  const ignoraReducao = kind === 'perfurante' || kind === 'puro' || irred.reducao;
  const ignoraEscudo = kind === 'puro' || irred.escudo;

  // regra 2 — redução ANTES do escudo
  if (!ignoraReducao) {
    let red = 0;
    const r = ef(alvo, 'dmgReduction');
    if (r) red = Math.max(red, r.v);                                // regra 6 — pega o maior
    red = Math.max(red, reducaoDeclarativa(st, alvo, slot));        // sobek/thor migrados: reducao declarativo (§37)
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
      log(st, { tipo: 'efeito', origem: redir.key, alvo: alvo.key, efeito: 'intercepta' });
      return bater(st, atk, redir, base, kind, slot, { ...opts, semIntercepta: true });
    }
    const guarda = acharGuarda(st, alvo);
    if (guarda) {
      guarda.hp = Math.max(0, guarda.hp - base);
      // a guarda ASSUME o golpe dirigido a `alvo` (mesma forma do interceptador): um
      // evento diz que interceptou, o outro conta o dano que ela levou (Regra 6).
      log(st, { tipo: 'efeito', origem: guarda.key, alvo: alvo.key, efeito: 'intercepta' });
      log(st, { tipo: 'dano', origem: atk.key, alvo: guarda.key, valor: base });
      if (guarda.hp === 0) removerInvocacao(st, guarda);
      return base;
    }
  }
  if (ef(alvo, 'invulneravel')) { log(st, { tipo: 'bloqueio', alvo: alvo.key, motivo: 'invulneravel' }); return 0; }
  if (ef(alvo, 'submerso')) { log(st, { tipo: 'bloqueio', alvo: alvo.key, motivo: 'submerso' }); return 0; }
  // vínculo (Juramento Nupcial): o dano é dividido entre os dois vinculados
  const vin = !semVinculo && ef(alvo, 'vinculo');
  if (vin) {
    const par = st.lados[alvo.lado].units.find(x => x.uid === vin.par);
    if (par && par.vivo) {
      const metade = Math.ceil(base / 2);
      log(st, { tipo: 'efeito', alvo: alvo.key, efeito: 'vinculo' });
      const a1 = bater(st, atk, alvo, metade, kind, slot, { ...opts, semVinculo: true });
      const a2 = bater(st, atk, par, metade, kind, slot, { ...opts, semVinculo: true });
      return a1 + a2;
    }
  }
  const { v, absorvido } = calcDano(st, atk, alvo, base, kind, slot);
  alvo.hp = Math.max(0, alvo.hp - v);
  const evDano = { tipo: 'dano', origem: atk.key, alvo: alvo.key, valor: v, kind: kind || 'afetado' };
  if (absorvido) evDano.absorvido = absorvido;
  log(st, evDano);
  // PRIMITIVA dano armazenado — todo aliado do alvo com acumulador guarda o dano sofrido.
  for (const x of st.lados[alvo.lado].units) {
    const arm = ef(x, 'armazenaDano');
    if (arm && x.vivo) arm.acc = (arm.acc || 0) + v;
  }
  // acorda com dano de Habilidade/Milagre
  if (ef(alvo, 'adormecido') && (slot === 'habilidade' || slot === 'milagre')) {
    alvo.efeitos = alvo.efeitos.filter(e => e.type !== 'adormecido');
    log(st, { tipo: 'acordar', alvo: alvo.key });
  }
  if (alvo.hp === 0) { matar(st, atk, alvo); return v; }
  // PRIMITIVA contra-atacar — quem carrega 'contraAtaca' revida golpe de alvo único.
  const ca = ef(alvo, 'contraAtaca');
  if (ca && unico && !semContra && atk && atk.vivo && atk.lado !== alvo.lado) {
    log(st, { tipo: 'efeito', origem: alvo.key, alvo: atk.key, efeito: 'contraAtaca' });
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
    log(st, { tipo: 'revive', alvo: alvo.key, valor: hp });
    return;
  }
  alvo.vivo = false; alvo.efeitos = []; alvo.dots = []; alvo.shield = 0; alvo.contadores = {};
  log(st, { tipo: 'queda', alvo: alvo.key });
  if (alvo.key === 'nezha' && !alvo.renasceu) {
    alvo.renasceu = true; alvo.pendenteRenascer = true;
    log(st, { tipo: 'passiva', origem: alvo.key, valor: 48 });   // volta com 48 no próximo turno (iniciarTurno) — 40% de 120 (F1.0c)
  }
  if (atk && atk.key === 'zeus' && atk.vivo) {                      // passiva Zeus
    st.lados[atk.lado].orbs['Tempestade']++;
    log(st, { tipo: 'orbe', lado: atk.lado, valor: 1, para: 'Tempestade', passiva: atk.key });
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
  for (const l of st.lados) { const i = l.invocacoes.indexOf(g); if (i >= 0) { l.invocacoes.splice(i, 1); log(st, { tipo: 'efeito', efeito: 'invocacao', duracao: 0 }); } }
}

function curar(st, u, v) {
  if (!u.vivo) return;
  if (ef(u, 'noHeal')) { log(st, { tipo: 'bloqueio', alvo: u.key, motivo: 'sem_cura' }); return; }
  let bonus = 0;
  // passiva Brigid — "curas curam +5 se algum INIMIGO estiver com Queimadura". §39: a prosa VENCE; o
  // hardcode antigo varria os dois lados (qualquer aliado queimando ativava — sinergia que ninguém concedeu).
  const inimigoQueima = st.lados[1 - u.lado].units.some(x => x.vivo && x.dots.some(d => d.nome === 'queimadura'));
  if (inimigoQueima && st.lados[u.lado].units.some(x => x.vivo && x.key === 'brigid')) bonus = 5;
  const antes = u.hp;
  u.hp = Math.min(u.maxHp, u.hp + v + bonus);
  if (u.hp > antes) log(st, { tipo: 'cura', alvo: u.key, valor: u.hp - antes });
  // passiva Hera — Rainha Ciumenta
  if (st.lados[u.lado].units.some(x => x.vivo && x.key === 'hera')) {
    u.shield += 10; log(st, { tipo: 'escudo', alvo: u.key, valor: 10, passiva: 'hera' });
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
  const gasto = {};   // devolve a quebra {elemento: quantidade} para o registro (por elemento)
  while (n > 0) {
    const alvo = ELEMS.slice().sort((a, b) => l.orbs[b] - l.orbs[a])[0];
    if (l.orbs[alvo] <= 0) break;
    l.orbs[alvo]--; n--; gasto[alvo] = (gasto[alvo] || 0) + 1;
  }
  return gasto;
}
// energia livre paga vira UM evento orbe POR ELEMENTO (Regra 6 — cada elemento é um sujeito).
// A quebra por elemento é a informação que o jogador precisa ao ler o turno do oponente; um
// agregado (`valor:-3`) mentiria por omissão sobre QUAIS orbes saíram (docs/eventos.md).
function logGastoLivre(st, lado, gasto) {
  for (const k in gasto) if (gasto[k] > 0) log(st, { tipo: 'orbe', lado, valor: -gasto[k], para: k });
}
// escolha do jogador de quais orbes pagam a dívida livre do turno
function alocarLivre(st, plano) {
  const l = st.lados[st.ativo], devido = l.dividaLivre || 0;
  let soma = 0; for (const k in plano) soma += plano[k];
  if (soma !== devido) return { ok: false, erro: `Aloque exatamente ${devido} energia(s) livre(s).` };
  for (const k in plano) if ((l.orbs[k] || 0) < plano[k]) return { ok: false, erro: 'Orbes insuficientes.' };
  for (const k in plano) l.orbs[k] -= plano[k];
  l.dividaLivre = 0;
  logGastoLivre(st, st.ativo, plano);
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
  log(st, { tipo: 'conversao', lado: st.ativo, valor: CONV_CUSTO, para });
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
    if (u.pendenteRenascer) { u.pendenteRenascer = false; u.vivo = true; u.hp = 48; log(st, { tipo: 'revive', alvo: u.key, valor: 48, passiva: u.key }); }   // 40% de 120 (F1.0c)
    if (!u.vivo) continue;
    u.agiu = false;
    // regra 3 — DoT no início, ANTES de agir
    for (const d of u.dots) {
      u.hp = Math.max(0, u.hp - d.v);
      log(st, { tipo: 'dot', alvo: u.key, efeito: d.nome, valor: d.v });
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
      if (alvo) { log(st, { tipo: 'efeito', efeito: 'invocacao' }); bater(st, { nome: g.nome, key: '__inv', lado: st.ativo, vivo: true, efeitos: [], contadores: {} }, alvo, g.v, 'afetado', 'invocacao', {}); }
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
  if (!st.aberturaFeita) { st.aberturaFeita = true; log(st, { tipo: 'abertura', lado: st.ativo, valor: 1 }); }
  if (geram.length < vivos.length) log(st, { tipo: 'controle', lado: st.ativo, valor: vivos.length - geram.length });
  if (primeiro && l.units.some(u => u.key === 'ganesha')) { // passiva Ganesha
    for (let i = 0; i < 2; i++) { const t = sortearElemento(st, tipos); l.orbs[t]++; }
    log(st, { tipo: 'orbe', lado: st.ativo, valor: 2, passiva: 'ganesha' });
  }
  const ra = l.units.find(u => u.key === 'ra' && u.vivo);   // passiva Rá (Barca do Sol): +1 Disco Solar/turno, teto 6
  if (ra) addContador(st, ra, 'discoSolar', 1, 6);
  checarFim(st);
}

function fimTurno(st) {
  const l = st.lados[st.ativo];
  // dívida de energia livre não escolhida pelo jogador: aloca sozinha (rede de segurança)
  if (l.dividaLivre > 0) { logGastoLivre(st, st.ativo, pagarLivreGuloso(l, l.dividaLivre)); l.dividaLivre = 0; }
  // PRIMITIVA dano armazenado — libera ao expirar (Xangô devolve como dano puro)
  for (const u of l.units) {
    const arm = ef(u, 'armazenaDano');
    if (arm && arm.dur === 1 && u.vivo) {
      const total = Math.min(arm.max || 9999, arm.acc || 0);
      const alvo = st.lados[1 - u.lado].units.find(x => x.uid === arm.alvo && x.vivo)
                 || st.lados[1 - u.lado].units.find(x => x.vivo);
      if (total > 0 && alvo) { log(st, { tipo: 'efeito', origem: u.key, efeito: 'armazenaDano', duracao: 0 }); bater(st, u, alvo, total, 'puro', 'armazenado', {}); }
    }
  }
  // PRIMITIVA contagem de morte (Livro) — executa quem chegou ao fim da contagem
  for (const u of l.units) {
    const lv = ef(u, 'livro');
    if (lv && lv.dur === 1 && u.vivo) {
      log(st, { tipo: 'efeito', alvo: u.key, efeito: 'livro' });
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
    st.fim = hp[0] === hp[1]
      ? { tipo: 'fim', resultado: 'empate', motivo: 'tempo' }
      : { tipo: 'fim', resultado: 'vitoria', lado: hp[0] > hp[1] ? 0 : 1, motivo: 'tempo' };
    return;
  }
  st.ativo = 1 - st.ativo;
  if (st.ativo === st.starter) st.turno++;   // conta rodadas a partir de quem abriu
  log(st, { tipo: 'turno', turno: st.turno, lado: st.ativo });
  iniciarTurno(st);
}

function checarFim(st) {
  for (let i = 0; i < 2; i++) {
    if (st.lados[i].units.every(u => !u.vivo && !u.pendenteRenascer)) st.fim = { tipo: 'fim', resultado: 'vitoria', lado: 1 - i };
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
    if (u.cd[a.slot] > 0) motivo = 'em_recarga';
    else if (!podePagar(l, cost)) motivo = 'sem_energia';
    else if (a.slot !== 'defesa') {
      const sil = ef(u, 'silenceClass');
      if (sil && sil.cls === classeDe(st, u, a) && a.slot !== 'basico') motivo = 'silenciado';
      const lk = ef(u, 'lockSkill');
      if (lk && lk.slot === a.slot) motivo = 'travada';
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
      : [{ t: 'dmg', v: 12, escopo: 'todosInimigos' }, { t: 'dot', nome: 'queimadura', v: 8, dur: 2, escopo: 'todosInimigos' }];
    log(st, { tipo: 'acao', origem: u.key, slot: a.slot, modo });
    u.modo = 1 - modo;
  } else if (a.opcoes) {                                   // PRIMITIVA escolha múltipla
    const idxs = (escolhas && escolhas.length) ? escolhas : [0];
    fx = [];
    for (const i of idxs) if (a.opcoes[i]) fx.push(...a.opcoes[i].fx);
    log(st, { tipo: 'acao', origem: u.key, slot: a.slot, opcoes: idxs });
  } else {
    log(st, { tipo: 'acao', origem: u.key, slot: a.slot });
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

    // contágio (Maldição de Yomi): age no CONJUNTO de uma vez (precisa do maior entre eles), não alvo a alvo
    if (e.t === 'espalha') { espalharContador(st, sel, e, u); continue; }

    for (const t of sel) {
      if (e.t === 'dmg') {
        const base = danoBase(st, u, t, e, l);
        const feito = bater(st, u, t, base, e.kind || 'afetado', a.slot, { unico });
        if (e.curaMetade) curar(st, u, Math.floor(feito / 2));
      }
      else if (e.t === 'heal') curar(st, t, e.v);
      else if (e.t === 'dot') aplicarDot(st, t, e.nome, e.v, e.dur);
      else if (e.t === 'apply') {
        if (ef(t, 'invulneravel') && t.lado !== u.lado) { log(st, { tipo: 'bloqueio', alvo: t.key, motivo: 'invulneravel' }); continue; }
        aplicar(st, t, { ...e.eff, origem: u.uid });
      }
      else if (e.t === 'contador' && e.alvo !== 'self' && !e.pool) { const antes = getContador(t, e.nome); addContador(st, t, e.nome, e.v, e.max); aposAcumular(st, u, t, e, antes); }
      else if (e.t === 'vidaExtra') { t.vidaExtra = { hp: e.hp }; log(st, { tipo: 'efeito', alvo: t.key, efeito: 'vidaExtra' }); }
      else if (e.t === 'revive') reviver(st, t, e);
      else if (e.t === 'destroyShield') { if (t.shield) { log(st, { tipo: 'escudo', alvo: t.key, valor: -t.shield }); t.shield = 0; } }
      else if (e.t === 'stripDef') t.efeitos = t.efeitos.filter(x => !BUFFS_DEF.includes(x.type));
      else if (e.t === 'stripBuffs') t.efeitos = t.efeitos.filter(x => !BUFFS.includes(x.type));
      else if (e.t === 'stripOne') {
        const i = t.efeitos.findIndex(x => BUFFS.includes(x.type));
        if (i >= 0) { log(st, { tipo: 'efeito', alvo: t.key, efeito: t.efeitos[i].type, duracao: 0 }); t.efeitos.splice(i, 1); }
      }
      else if (e.t === 'cleanse') { t.efeitos = t.efeitos.filter(x => !DEBUFFS.includes(x.type)); t.dots = []; }
      else if (e.t === 'shield') { t.shield += e.v; log(st, { tipo: 'escudo', alvo: t.key, valor: e.v }); }
      else if (e.t === 'restauraMax') {   // Itzamná: devolve o HP máximo perdido (Podridão) — SEM curar (hp fica)
        if (t.maxHpPerdido) { log(st, { tipo: 'efeito', alvo: t.key, efeito: 'restauraMax', valor: t.maxHpPerdido }); t.maxHp += t.maxHpPerdido; t.maxHpPerdido = 0; }
      }
    }

    // consumo de contador do próprio atacante: DEPOIS de escalar todos os alvos (Rá — Olho de Rá)
    if (e.t === 'dmg' && e.consomeContador && getContador(u, e.consomeContador) > 0) {
      log(st, { tipo: 'contador', origem: u.key, valor: -getContador(u, e.consomeContador), efeito: e.consomeContador });
      u.contadores[e.consomeContador] = 0;
    }
    // consumo do POOL DO LADO (finalizador de Combo — Susanoo): zera SÓ o pool do lado próprio
    if (e.t === 'dmg' && e.consomeContadorLado && getContadorLado(st, u.lado, e.consomeContadorLado) > 0) {
      log(st, { tipo: 'contador', origem: u.key, valor: -getContadorLado(st, u.lado, e.consomeContadorLado), efeito: e.consomeContadorLado });
      st.lados[u.lado].contadores[e.consomeContadorLado] = 0;
    }
    // efeitos "uma vez" — não iteram sobre a seleção (agem em self ou globalmente):
    if (e.t === 'selfHp') { u.hp = Math.max(1, u.hp + e.v); log(st, { tipo: 'dano', origem: u.key, alvo: u.key, valor: -e.v, kind: 'puro' }); }
    if (e.t === 'contador' && e.alvo === 'self' && !e.pool) { const antes = getContador(u, e.nome); addContador(st, u, e.nome, e.v, e.max); aposAcumular(st, u, u, e, antes); }
    // contador de CAMPO por LADO (pool do time): gera no pool do lado próprio ou inimigo (F1.1 prim.2)
    if (e.t === 'contador' && e.pool === 'lado') addContadorLado(st, e.lado === 'inimigo' ? 1 - u.lado : u.lado, e.nome, e.v, e.max, u);
    if (e.t === 'intercepta') {
      const protege = e.protege === 'time' ? 'time' : (alvos[0] ? alvos[0].uid : u.uid);
      aplicar(st, u, { type: 'intercepta', protege, dur: e.dur, contra: e.contra || 'todos', origem: u.uid });
      if (e.contraAtaca) aplicar(st, u, { type: 'contraAtaca', v: e.contraAtaca, dur: e.dur, contra: e.contra || 'todos', origem: u.uid });
      log(st, { tipo: 'efeito', origem: u.key, efeito: 'intercepta' });
    }
    if (e.t === 'armazenaDano') {
      aplicar(st, u, { type: 'armazenaDano', dur: e.dur, max: e.max, alvo: alvos[0] ? alvos[0].uid : null, acc: 0, origem: u.uid });
      log(st, { tipo: 'efeito', origem: u.key, efeito: 'armazenaDano' });
    }
    if (e.t === 'invocar') {
      l.invocacoes.push({ nome: e.nome, tipo: e.tipo, hp: e.hp || 0, v: e.v || 0, dur: e.dur, dono: u.uid });
      log(st, { tipo: 'efeito', origem: u.key, efeito: 'invocacao' });
      if (e.provoca && alvos[0]) aplicar(st, alvos[0], { type: 'taunt', dur: e.dur, origem: u.uid });
    }
    if (e.t === 'copiar') copiar(st, u, e);
    if (e.t === 'fase') definirFase(st, e.v, e.dur);         // PRIMITIVA estado global Dia/Noite
    if (e.t === 'atordoaMenorHp') {
      const vivos = inimigos.filter(x => x.vivo);
      if (vivos.length) {
        const alvoM = vivos.slice().sort((a, b) => a.hp - b.hp)[0];
        if (ef(alvoM, 'invulneravel')) log(st, { tipo: 'bloqueio', alvo: alvoM.key, motivo: 'invulneravel' });
        else aplicar(st, alvoM, { type: 'atordoado', dur: e.dur, origem: u.uid });
      }
    }
    if (e.t === 'vinculo' && alvos.length >= 2) {
      aplicar(st, alvos[0], { type: 'vinculo', par: alvos[1].uid, dur: e.dur, origem: u.uid });
      aplicar(st, alvos[1], { type: 'vinculo', par: alvos[0].uid, dur: e.dur, origem: u.uid });
      log(st, { tipo: 'efeito', alvo: alvos[0].key, efeito: 'vinculo' });
    }
    if (e.t === 'cdShift') {
      const tgt = e.lado === 'proprio' ? l : st.lados[1 - u.lado];
      for (const x of tgt.units) for (const k in x.cd) x.cd[k] = Math.max(0, x.cd[k] + e.v);
      log(st, { tipo: 'cd', lado: e.lado === 'proprio' ? u.lado : 1 - u.lado, valor: e.v });
    }
    if (e.t === 'orbGain') {
      const tipos = [...new Set(l.units.filter(x => x.vivo).map(x => x.elem))];
      for (let i = 0; i < e.n; i++) l.orbs[tipos[Math.floor(rng(st) * tipos.length)]]++;
      log(st, { tipo: 'orbe', lado: u.lado, valor: e.n });
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
  if (e.porContadorLado) base += e.porContadorLado.v * getContadorLado(st, e.porContadorLado.lado === 'inimigo' ? 1 - u.lado : u.lado, e.porContadorLado.nome);
  if (e.porAliadoCaido) base += e.porAliadoCaido * caidos(st, u.lado);
  if (e.porInimigoCaido) base += e.porInimigoCaido * caidos(st, 1 - u.lado);
  return base;
}

// PRIMITIVA revive — traz um aliado caído de volta, salvo se ficou marcado como irrevivível
function reviver(st, alvo, e) {
  if (alvo.vivo) return;
  if (alvo.naoRevive) { log(st, { tipo: 'bloqueio', alvo: alvo.key, motivo: 'nao_revive' }); return; }
  alvo.vivo = true; alvo.hp = Math.min(alvo.maxHp, e.hp); alvo.agiu = true;
  alvo.efeitos = []; alvo.dots = []; alvo.shield = 0;
  for (const k in alvo.cd) alvo.cd[k] = 0;
  log(st, { tipo: 'revive', alvo: alvo.key, valor: alvo.hp });
}

// PRIMITIVA copiar habilidade — executa uma habilidade de outra fonte sem pagar o custo
function copiar(st, u, e) {
  if (e.fonte === 'ultimaHabilidadeAliada') {
    const ref = st.lados[u.lado].ultHabilidade;
    if (!ref) { log(st, { tipo: 'efeito', origem: u.key, efeito: 'copiar' }); return; }
    log(st, { tipo: 'acao', origem: u.key, slot: 'habilidade' });
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
    aplicarFx, bater, addContador, getContador, contadorNoCampo, addContadorLado, getContadorLado, espalharContador, definirFase, caidos, reviver,
    bonusDanoDeclarativo,   // passiva declarativa (F1.2) — testada em isolamento
  };
}

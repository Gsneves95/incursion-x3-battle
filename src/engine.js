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
const FUNCOES_VOCAB = ['Atacante', 'Guardião', 'Suporte', 'Controlador', 'Manipulador'];   // função do deus (vulnerabilidade.deFuncao, F1.8)

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
  distribui: ['inimigo'],   // F1.9 §92: multi-golpe distribuído — 1 passo p/ a GUARDA (sem_alvo/validade); a seleção múltipla (subconjunto) mora no fluxo (turno.js), não no comprimento fixo.
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

const CONTROLES = ['atordoado', 'adormecido', 'submerso', 'taunt', 'silenceClass', 'lockSkill', 'dominado', 'selado', 'agarrar', 'pacificado', 'medo'];
// pacificado (Oxalá): a unidade AGE mas causa 0 de dano (direto e DoT que aplicaria no turno). NÃO trava slot nem a
// ação (fora de SLOTS_TRAVADOS e de podeAgir); zera dano na fonte (bater v→0; dot pulado). Cura e DoT já ATIVO seguem
// (o tick não é a unidade agindo). Em CONTROLES → controlImmune o barra e existe 'imune a Pacificar' por etiqueta (§58).
// slot-lock NOMEADO (F1.4) — controles que travam um CONJUNTO fixo de slots. Cada NOME é um `type` próprio, e a
// ETIQUETA (o type) é o que a imunidade mira: imune a Selado ≠ imune a Agarrar, mesmo os dois travando slots (§53).
// Vocabulário FECHADO: {selado, agarrar, medo}. selado≡Silenciado≡Enraizado = {Hab,Mil} (um nome canônico; §53).
// medo = COMPÓSITO NOMEADO (F1.4 §60): UM efeito que trava {Milagre} E reduz o dano de saída do portador (`dmgDown`
// no próprio 'medo', lido em bonusDano). "Imune a Medo" barra o efeito INTEIRO (uma checagem de imuneA) — as duas
// metades caem juntas, com a MESMA duração. Prova de forma: a prosa dá as duas sob "Medo por 2 turnos" (mesma dur) e
// nenhum kit as trata em separado; se as durações divergissem, teriam de ser dois efeitos (não divergem). silenceClass
// fica FORA — trava por CLASSE, não por slot. 'basico'/'defesa' nunca entram num conjunto travado (Selado = "só Básico").
const SLOTS_TRAVADOS = { selado: ['habilidade', 'milagre'], agarrar: ['habilidade'], medo: ['milagre'] };
const DEBUFFS = [...CONTROLES, 'dmgDown', 'vulneravel', 'encharcado', 'noHeal', 'livro', 'antiRevive', 'olho', 'pressagio', 'marcado', 'torpor', 'retaliacao'];   // 'retaliacao' (§136, Khonshu, M3): marca no inimigo — se ELE derrubar um aliado do marcador, sofre v puro (lido DENTRO do matar). Carrega v; cleansável   // 'torpor' (§135, Shuten): MARCADOR (não trava ação — o portador AGE; lido por aoAgirSobEfeito: "quando ele agir, eu reajo"). Debuff p/ ser cleansável e p/ o apply aceitá-lo   // antiRevive (F1.6): marca proativa de irrevivível nos vivos (Iansã) — debuff puro, cleansável, não trava ação. vulneravel (F1.6, Durga): "recebe +N de dano" — modificador de dano de ENTRADA no alvo (simétrico ao dmgUp de SAÍDA), lido em calcDano. olho/pressagio/marcado (F1.9-pre): MARCAS ofensivas — RÓTULOS puros (nenhum carrega dano; o +dano é `vulneravel` irmão ou `bonusDano quando:alvoMarca`); são debuff p/ serem cleansáveis e p/ o apply aceitá-las (V.efeitos)
const BUFFS_DEF = ['dmgReduction', 'shield', 'invulneravel', 'controlImmune', 'vinculo', 'pisoVida'];   // pisoVida: 'não cai abaixo de 1 HP' (F1.3 morte)
const BUFFS = [...BUFFS_DEF, 'dmgUp', 'regen', 'intercepta', 'contraAtaca', 'armazenaDano', 'redirect', 'inalvejavel', 'refleteDano', 'acaoPerfeita', 'danoFimTurno', 'proximoGolpePuro', 'caldeirao'];   // 'caldeirao' (§138, Dagda): buff-marcador do "Caldeirão ativo" — enquanto presente, o portador curado NESTE turno (curadoAgora) não cai abaixo de 1 HP (piso condicional, lido no bater)   // 'proximoGolpePuro' (§136, Yamato): o PRÓXIMO ataque do portador é dano puro (fura redução E escudo). Buff no self, consumido no 1º ataque. Irmão do acaoPerfeita (§111), mas p/ QUALQUER slot e só o eixo "puro"   // 'danoFimTurno' (§135, Kali): buff no PRÓPRIO — no fim de cada turno do dono, ataca de graça por v um inimigo, por dur turnos. Lido no fimTurno. É buff (auto-aplicado, o dono age)   // acaoPerfeita (§111, Krishna): Ação Perfeita — a PRÓXIMA HABILIDADE do portador não pode ser evitada/reduzida/absorvida/contra-atacada. BUFF transferível (Krishna arma num aliado); consumido no próximo agir de habilidade do portador; lido na MIRA (não-evitável) e no bater (os outros três)   // refleteDano (§109, Mnevis): thorns TEMPORÁRIO — devolve v fixo ao atacante quando o portador sofre dano; lido no bater   // inalvejavel (F1.9): EVASÃO — sai da lista de mira inimiga de alvo único. É BUFF (auto-aplicado, a unidade AGE; strippable por dispel — §84 decisão b). Mora SÓ em alvosValidos (seleção), NUNCA no bater (impacto): §84 invariante

// VOCABULÁRIO DO MOTOR — fonte ÚNICA do que o motor sabe executar. O validador de kits
// (tools/valida_kit.js) LÊ isto, então o schema não pode divergir do que o motor faz.
// TIPOS_FX é também a lista que o motor usa para RECUSAR em runtime um fx.t desconhecido
// (ver aplicarFx): efeito com typo não passa em silêncio. Ao ensinar o motor um fx.t novo,
// some-o aqui (e um fxKey novo, se o efeito ler um campo novo) — mesma disciplina de "primitiva antes do deus".
const TIPOS_FX = [
  'dmg', 'heal', 'dot', 'apply', 'contador', 'vidaExtra', 'revive', 'destroyShield',
  'contraAtaca',   // §132 (Guan Yu, M7): aplica contraAtaca no dono, DELEGÁVEL — protege='alvo' arma o revide p/ quando um ALIADO escolhido for atingido (§106 3º caso: a mesma op do contraAtaca-self com sujeito trocado, como o intercepta.protege)
  'stripDef', 'stripOne', 'stripBuffs', 'suspendeBuffs', 'passeForcado', 'cleanse', 'shield', 'selfHp', 'intercepta', 'redirect',
  // 'passeForcado' (§138, Dagda M2/A2): o alvo (o time inimigo) perde a AÇÃO do próximo turno; o turno acontece (os nove tickam), só a ação é negada. Lido em podeAgir; NÃO toca o laço de turno (§137 Modelo A2)
  // 'suspendeBuffs' (§138, Dagda M6): SUSPENDE (desativa-e-devolve ≠ strip) os buffs do alvo por `dur` turnos dele.
  // REMOVE-E-GUARDA, não flag: estoca efeitos BUFFS + escudo em u.suspensos e os retira; restaura no fimTurno após dur
  // turnos. A varredura §138 provou que remover é junta-PROOF (todo leitor já trata AUSÊNCIA); um flag exigiria tocar os
  // 4 tipos de leitor (ef/shield/alvoBuff/statusCasou) = 4 juntas em potencial.
  // 'stripBuffs' (§136, Yamato): remove TODOS os buffs do alvo (sem realocar — ≠ realoca). O §113 o removeu por não ter
  // consumidor; volta com o Yamato, o consumidor real (§131 previu; o dono nomeou o Loki, era o Yamato — §132.1)
  'realoca',   // §131 (M5, Loki): MOVE todos os efeitos de uma categoria de um conjunto p/ outro. UM mecanismo parametrizado (categoria+de+para) que serve as DUAS metades: rouba buffs (buff, inimigos→self) E transfere debuffs (debuff, time→inimigos). §46: a direção/destino são PARÂMETROS, não dois códigos
  'armazenaDano', 'copiar', 'fase', 'vinculo', 'cdShift', 'orbGain',
  'restauraMax', 'espalha', 'reviveProximoTurno',   // reviveProximoTurno: faz-only (aoCair self), executado por rodarFaz. NÃO absorvido pelo agendador geral (§117): dispara em unidade MORTA + alimenta checarFim — folá-lo forçaria caso especial (§106 ao contrário)
  'agendar',   // §117 (M1, Kukulkán): AGENDA um payload de fx p/ o próximo turno do dono (lista pendente por-unidade, disparada no iniciarTurno). "ação telegrafada". Alvo/escopo fixados no lançamento; nenhuma escolha nova ao disparar
  'zeraCd',   // §118 (M3, Ares): zera as recargas do PRÓPRIO dono. faz-safe (self, sem escolha). aoCair{quem:'inimigo'} → "abati, minha recarga volta"
  'aceleraLivro',   // F1.9 (Yan Wong §89): acelera em 1 a contagem do Livro nos inscritos (dur -= 1, piso 1)
  'condicional',   // F1.6 (Freyja): ramo por estado — se(estado) ? entao[fx] : senao[fx]
  'roubaOrbe',   // F1.6 (Hades/Hermes/Shuten): remove n orbes do inimigo (rouba=vai p/ o próprio); bloqueado por protegeOrbe (Heimdall)
  'dominar',   // F1.9 (§99, Afrodite/Boto): a vítima usa o Básico DELA contra um aliado dela (o lançador escolhe os dois); tag 'dominado' fica dur turnos (nega orbe). Fecha a órfã mais antiga (§71)
];
// DoTs são efeitos NOMEADOS — viram CHAVE como todo o resto (ver docs/eventos.md A). O
// nome exibível ("Queimadura") mora no narrador (ui/base.js NOMES_DOT), não no motor.
const DOTS = ['queimadura', 'veneno', 'sangramento', 'tormento', 'maldicao', 'marcaMorte'];   // 'marcaMorte' (§127, Hel): DoT puro-por-natureza (o tique subtrai HP direto, sem redução/escudo) que carrega naoRevive — a Marca da Morte que o comentário da l.905 antecipava mas o alimentador (aplicarDot) não wireava.   // 'maldicao' (§114, Izanami): MESMO conceito do contador homônimo — o contador é o acúmulo, o DoT é o veículo do dano 6×acúmulo/turno (stores separados; o DoT lê o contador via porContador). cresce ao provar os 73 kits. 'veneno' entrou p/ a
// imunidade da Nezha ("imune a Veneno e Queimadura") — é DoT real (Medusa/Jörmungandr aplicam), ainda sem applier.
const CONTADORES = ['discoSolar', 'Coroa', 'Pedra', 'podridao', 'cauda', 'maldicao', 'atadura', 'combo', 'clava'];   // 'clava' (§138, Dagda): contador de USO do básico (a cada 3º uso, cura em vez de atacar — ciclo por-uso, ≠ aCadaN por-turno).   // CHAVES de contador (fx contador.nome); nome exibível em ui/base.js NOMES_CONTADOR. Cresce por kit. 'Coroa' = Xangô; 'Pedra' = Medusa; 'podridao' = Ah Puch (reduz maxHP + bloqueia revive, F1.8); 'cauda' = Kitsune (§126: aCadaN + reducao escalada); 'maldicao' = Izanami (§114); 'atadura' = Anúbis (§126: antiReviveContador + bonusDano porContador onde:alvo); 'combo' = pool POR LADO (Oni consome via porContadorLado; §126 Susanoo é o 1º a GERAR via contador pool:'lado', expondo o nome ao validador).
const STATUS_ESCOPOS = ['alvo', 'self', 'time', 'timeInimigo'];   // porStatus (F1.8): onde contar os efeitos
const STATUS_CATEGORIAS = [...new Set([...DEBUFFS, ...BUFFS, ...DOTS]), 'debuff', 'buff', 'dot', 'controle'];   // porStatus.categoria: nome específico OU coringa de família
// PASSIVAS DECLARATIVAS (F1.2, DECISOES §36) — a passiva ganha `fx` como a habilidade, para o
// motor não carregar um `if (u.key===...)` por deus. A SESSÃO 1 abre UM gatilho só: bonusDano.
// Migração é por DEUS INTEIRO (§37): um deus só migra quando TODOS os gatilhos da sua passiva
// existem — meio-migrado deixa hardcode invisível. Por isso a sessão 1 migra ZERO reais (os 12
// implementados têm passiva multi-parte) e prova o mecanismo num deus sintético (tests/passiva.test.js).
// Cada gatilho declara os CAMPOS que aceita e os OBRIGatórios — o validador dispara por gatilho, então
// um `v` num danoIrredutivel ou um `ignora` num bonusDano é recusado como "campo não pertence ao gatilho".
// Cresce um gatilho por sessão: bonusCura, reducao, onKill, onDeath, porTurno, reativa…
const GATILHOS_PASSIVA = {
  bonusDano:       { campos: ['v', 'escopo', 'quando', 'estado', 'porContador', 'porContadorCampo', 'porContadorLado', 'porAliadoCaido', 'porInimigoCaido', 'porHpFaltante', 'porStatus', 'porDeficitAliados', 'mesmoMorto'], obrig: ['v'] },   // soma v (FIXO) + escala por contagem (§73/§78). estado (§101): gateia por fase/campo — bonusDanoDeclarativo já lê f.estado (Chang'e: +8 com Hou Yi no time). mesmoMorto (§123, Mimir): o +v vale MESMO com o dono derrotado (bonusDanoDeclarativo relaxa o gate de vivo só p/ este fx)
  danoIrredutivel: { campos: ['ignora'], obrig: ['ignora'] },                  // dano do DONO fura redução/escudo (sessão 2)
  reducao:         { campos: ['v', 'escopo', 'contra', 'protegido', 'estado', 'porContador'], obrig: ['v'] },   // porContador (§126, Kitsune): reducao ESCALADA por contador do dono ("a cada 3 Caudas, +5"); v pode ser 0 (fixo) + a escala   // reduz o dano recebido (sessão 3). protegido (F1.6): filtra o beneficiário (Poseidon: só aliado Maré). estado (§96): condiciona à fase/campo (Amaterasu: só durante o Dia) — reducaoDeclarativa já gateia por estadoOK
  porTurno:        { campos: ['faz', 'estado'], obrig: ['faz'] },               // faz roda a cada início de turno do dono (sessão 4). estado (§109): gateia por campo (Mnevis: só com Rá no time)
  abertura:        { campos: ['faz'], obrig: ['faz'] },                        // faz roda UMA vez, no 1º turno do lado (sessão 4)
  imunidade:       { campos: ['a', 'escopo', 'estado'], obrig: ['a'] },        // imune a status nomeado(s) (sessão 5). §120: escopo 'self'/'time'. §132: estado gateia (Guan Yu: imune a Medo com 3 aliados vivos; Yamato: imune a controle com 15+ Combo) — imuneA lê estadoOK
  aoCair:          { campos: ['quem', 'faz'], obrig: ['quem', 'faz'] },        // quando alguém CAI, faz X (sessão 6)
  bonusCura:       { campos: ['v', 'quandoCura', 'estado'], obrig: ['v'] },     // soma v à MAGNITUDE das curas no lado do dono (sessão 8). estado (§127, Hel): gateia por campo/paridade — bonusCuraDeclarativo já lê f.estado; faltava só liberar o campo (comentário anti-envelhecido: o executor precedeu o schema)
  aCadaN:          { campos: ['n', 'faz', 'custoGratis'], obrig: ['n'] },      // cadência ABSOLUTA (turno % n): faz X OU zera custo (sessão 9)
  aoCurar:         { campos: ['faz'], obrig: ['faz'] },                        // quando um aliado é CURADO, faz X no curado (sessão 10)
  aoUsarHabilidade:{ campos: ['slot', 'faz'], obrig: ['slot', 'faz'] },        // quando um aliado usa habilidade do slot, faz X no dono (Passo 0)
  aoSerAtingido:   { campos: ['quem', 'contra', 'faz', 'noAtacante', 'estado'], obrig: ['quem'] },   // reage a SER atingido (F1.4): faz no reator (BUFF) / noAtacante no atacante (debuff — sujeito do evento)
  aoAgirSobEfeito: { campos: ['efeito', 'faz', 'noAtor', 'estado'], obrig: ['efeito'] },             // quando o ATOR age carregando `efeito` (aplicado por MIM — origem), reajo: faz (no dono) / noAtor (no ator)
  protegeOrbe:     { campos: [], obrig: [] },                                                        // F1.6 (Heimdall): enquanto vivo, o roubaOrbe inimigo contra o time é bloqueado (marcador declarativo)
  antiReviveContador:{ campos: ['contador'], obrig: ['contador'] },   // F1.8 (Ah Puch/Anubis): quem CAI carregando o contador X não revive (snapshot no ato da morte)
  antiReviveAura:  { campos: [], obrig: [] },                          // F1.8 (Cérberus): enquanto o DONO vive, inimigos não revivem (checado no ato do revive)
  refleteControle: { campos: ['a', 'dur'], obrig: ['a'] },             // F1.8 (Perseu): quem TENTA um controle de `a` no dono leva o mesmo controle (na TENTATIVA — antes da imunidade)
  vulnerabilidade: { campos: ['v', 'deFuncao'], obrig: ['v'] },        // F1.8 (Aquiles): o dono sofre +v de atacantes da função `deFuncao` (lê o atacante)
  amplificaDot:    { campos: ['nome', 'v'], obrig: ['nome', 'v'] },     // F1.8 (Kagutsuchi): +v em todo tick do DoT `nome` no campo, enquanto o dono vive
  sinergiaAliado:  { campos: ['aliado', 'contador', 'v'], obrig: ['aliado', 'contador', 'v'] },   // F1.8 (Inari): no início, se o aliado NOMEADO está no time, dá-lhe v do contador
  ignoraInalvejavel:{ campos: ['escopo'], obrig: [] },   // F1.9 (Hou Yi escopo:self; Boitatá escopo:time): o dono (ou o time) PODE mirar inimigos Inalvejáveis — override de MIRA, não de dano. §84 decisão c (ponto passivo; o pontual é a flag de habilidade)
  porExecucao:     { campos: ['faz'], obrig: ['faz'] },   // F1.9 (Yan Wong §89): quando um INIMIGO morre por EXECUÇÃO (qualquer — Livro, executaAbaixoDe), o dono faz X (1 orbe). Leitura LITERAL de "por execução": qualquer, não só a do dono
  abateNaoRevive:  { campos: [], obrig: [] },   // §118 (M3, Ammit): quem o DONO abate não revive de forma alguma — carimba naoRevive no MORTO (lido no matar, keyed pelo matador). §81 sujeito C. Sem payload: a consequência é o carimbo
  iniciativa:      { campos: [], obrig: [] },   // §121 (M2, Exu/Hermes): "age primeiro" = LIDERAR a rodada = SER O STARTER (no modelo 1-1, leitura-de-intenção §121). Regra de SETUP (novoEstado força comeca), NÃO toca o laço. Sem payload
  naoRevivivel:    { campos: [], obrig: [] },   // §123 (Mimir): o PRÓPRIO dono não pode ser revivido — self-direction do naoRevive (§119: a família de morte por eixo). Carimba naoRevive no MORTO ao cair, keyed pela própria passiva. Sem payload
  negaOrbe:        { campos: ['a'], obrig: ['a'] },   // §130 (Dionísio): enquanto o dono vive, INIMIGOS carregando os controles em `a` não geram orbe (estende a exclusão de renda, que já barra adormecido/submerso/dominado, p/ selado). Cross-side, lido no iniciarTurno do lado inimigo
  evadeContra:     { campos: ['v'], obrig: ['v'] },   // §130 (Saci): o PRIMEIRO golpe único por turno contra o dono FALHA (nulificado) e revida v ao atacante. Lido no bater (usa o flag primeiroPorTurno do §88). v = o contra-ataque
  evadeControle:   { campos: [], obrig: [] },   // §131 (Loki): a PRIMEIRA tentativa de controle por turno contra o dono FALHA. Irmão do evadeContra mas no eixo CONTROLE (lido em aplicar, flag controleNoTurno). Sem payload
  geraContadorPorGolpe: { campos: ['contador', 'v', 'max'], obrig: ['contador'] },   // §135 (Raijin): cada alvo ATINGIDO pelo dono gera v no pool do lado (por-GOLPE, gancho no bater). ≠ contador pool:'lado' num fx (que é por-ATAQUE)
  guardaControle:  { campos: ['a'], obrig: ['a'] },   // §136 (Khonshu, M9): 1× por partida, quando um aliado (ou o dono) SERIA afetado por um controle em `a`, o dono ANULA o efeito e gasta a carga. Lido em aplicar; carga no flag guardaControleUsado (bespoke, como o renasceu da Nezha)
};
// `quem` (o SUJEITO da morte, relativo ao reator) — UM gatilho `aoCair` com eixo de sujeito, não vários:
// a morte é UM momento (uma unidade chega a 0 em `matar`); só o sujeito varia. Igual à imunidade (declaração
// uniforme → um gatilho com sub-vocabulário), diferente do por-turno (3 MOMENTOS → 3 gatilhos). Abre só
// 'inimigo' (matador-bound: "ao derrotar um inimigo" — zeus) na sessão 6. Os outros sujeitos crescem por deus:
//   'self' (o dono morre — nezha/ymir), 'aliado' (um aliado cai), 'qualquerInimigo' (qualquer inimigo cai — hades).
// AMBIGUIDADE aberta (decisão do dono ao migrar morrigan/iansa/ahpuch): "quando um inimigo é derrotado, [eu] X"
// não diz se é matador-bound ou qualquer-morte. Zeus é inequívoco ("ao derrotar" = matador).
const AOCAIR_QUEM = ['inimigo', 'self', 'qualquerInimigo', 'aliado'];
const AOSERATINGIDO_QUEM = ['self', 'aliado'];   // sujeito do golpe que dispara: o próprio (medusa/boitata) ou um aliado (xango)
// `a` (o que a imunidade bloqueia) — sub-vocabulário FECHADO: tipos de controle, nomes de DoT, o CORINGA
// 'controle' (todo controle), ou uma MECÂNICA ('execucao', 'contagio'). Um só vocabulário, um só gatilho: a
// DECLARAÇÃO é uniforme ("imune a X"), só o enforcement varia (controle em aplicar; DoT em aplicarDot; execução
// no matar; contágio em espalharContador) — e enforcement é implementação, não contrato. §120: a imunidade a
// MECÂNICA já existia p/ execução (Sun Wukong, §84); contágio (izanagi) é o irmão — mesmo padrão, +1 valor +1 site.
// FALTA ainda a CONDICIONAL (yamato: imune a controle COM 15+ Combo — imuneA precisa ler `estado`; adiado com o yamato).
// CORINGA 'controle' cobre controle FUTURO por construção — a F1.4 (Pacificar, Torpor, Medo) amplia Jörmungandr e Ísis
// automaticamente (declarado, não surpresa).
const IMUNIZAVEIS = [...CONTROLES, ...DOTS, 'controle', 'execucao', 'contagio'];   // 'execucao'/'contagio' = imunidade à MECÂNICA (Sun Wukong / izanagi, §84/§120) — ampliam o §5
// `faz` (efeito de um gatilho de turno) é PROPRIEDADE da família por-turno: o gatilho EMBRULHA um efeito,
// não um escalar (como bonusDano/reducao). Reusa o vocabulário de fx, mas SÓ os que não exigem alvo escolhido
// pelo jogador nem seletor — o alvo de um `faz` é FIXO: self (o dono) ou o lado. Conjunto fechado; abre
// contador (ra) + orbGain (ganesha). heal/cdShift/apply entram por deus; seletores ("mais ferido" da Deméter,
// "maior HP" da Izanami) NÃO existem — entram como campo novo revisado quando o deus deles migrar.
const FX_TURNO = ['contador', 'orbGain', 'reviveProximoTurno', 'shield', 'heal', 'apply', 'vidaExtra', 'cdShift', 'selfHp', 'intercepta', 'zeraCd'];   // zeraCd (§118, Ares): zera a recarga do PRÓPRIO dono num faz-de-turno (aoCair inimigo) — self, sem escolha, turno-seguro   // intercepta (§109, Mnevis): a passiva re-aplica por turno protegendo um aliado NOMEADO (protege por key), sem alvo escolhido   // heal/apply (F1.2.5): alvo FIXO self|time (nunca escolhido); apply só BUFF (senão exigiria alvo inimigo). vidaExtra (F1.6): rede de sobrevivência no self (Hércules) — alvo é sempre o dono, turno-seguro. cdShift (F1.6, Huangdi): SÓ na forma soMaiorDoTime (próprio lado, sem alvo escolhido) — o validador barra as outras formas no faz
const IGNORAVEIS = ['reducao', 'escudo'];  // o que danoIrredutivel pode furar (ogum: reducao; tyr: ambos)
const ESCOPOS_PASSIVA = ['self', 'time'];  // self = vale só quando o DONO ataca; time = qualquer aliado vivo
const MARCAS = ['marcado', 'olho', 'livro', 'pressagio'];   // marcas ofensivas — RÓTULOS lidos por `alvoMarca`. Vocabulário FECHADO e COMPARTILHADO (não é propriedade privada de um deus): quem pune marca (`alvoMarca:'qualquer'`) pune QUALQUER marca. marcado=Odin, olho=Hórus, livro=Yan Wong (já tinha timer letal), pressagio=Morrigan. §54: são etiquetas distintas (o milagre do Hórus lê 'olho' específico; o do Yan Wong acelera só 'inscritos'), com o guarda-chuva 'qualquer'. Ver DECISOES §83
const SLOTS_ATAQUE = ['basico', 'habilidade', 'milagre'];
// `contra` (condição DEFENSIVA do gatilho reducao) — EIXO SEPARADO do `quando`: `quando` lê o lado
// OFENSIVO (quem ataca, quem é atacado, estado do campo); `contra` lê o GOLPE QUE CHEGA. Os dois
// vocabulários NÃO se misturam (ver docs/passivas.md). Fechado; abre só `slot` na sessão 3 — as outras
// (classe do oni, elemNao do baldur, …) entram por deus. Uma chave por condição; ausência = todo ataque.
const CONTRA = {
  slot:    { sub: SLOTS_ATAQUE },   // reduz só golpes deste slot (sobek: 'basico')
  classe:  { sub: CLASSES },        // reduz só golpes desta classe (oni: 'Mágico'; aoSerAtingido medusa: 'Físico')
  elem:    { sub: ELEMS },          // só golpes DESTE elemento (positivo — aoSerAtingido boitata: 'Chama')
  elemNao: { sub: ELEMS },          // reduz TODO golpe EXCETO os deste elemento (baldur: exceto 'Verdejante')
  alcance: { sub: ['unico', 'area'] },  // reduz só golpes deste alcance (afrodite: 'unico')
};
// `protegido` (F1.6, Poseidon) — eixo DEFENSIVO que lê o BENEFICIÁRIO (o aliado protegido), não o golpe.
// Contraparte de `contra`: `contra` filtra o ataque que chega, `protegido` filtra QUEM recebe a redução.
const PROTEGIDO = {
  elem: { sub: ELEMS },   // reduz só o aliado protegido DESTE elemento (Poseidon: 'aliados Maré')
};
// `quando` (condição do bônus) — conjunto FECHADO. Cada chave declara COMO validar o valor:
//   sub  → valor ∈ lista   ·   bool → valor === true   ·   hp → {op, v}
// `pendente` = condição no vocabulário mas cujo ESTADO o motor ainda não rastreia; valida_kit
// RECUSA em voz alta (nunca vira falso silencioso). Ausência de `quando` = sempre. Ver docs/passivas.md.
const CONDICOES = {
  alvoDebuff:      { sub: [...DEBUFFS, ...DOTS, 'qualquer', 'controle'] },   // alvo tem debuff/DoT (nome, 'qualquer' ou 'controle') — condOK checa efeitos E dots (Piranha: 'sangramento')
  alvoBuff:        { sub: [...BUFFS, 'qualquer'] },                 // alvo tem buff
  alvoDefesa:      { bool: true },                                 // alvo tem escudo OU redução de dano
  alvoElem:        { sub: ELEMS },                                 // alvo é do elemento
  alvoHp:          { hp: true },                                   // {op:'cheio'|'abaixo'|'acima', v?}
  atacanteElem:    { sub: ELEMS },                                 // quem ataca é do elemento (escopo aliados)
  alvoMarca:       { sub: [...MARCAS, 'qualquer'] },               // alvo tem a marca ofensiva nomeada, OU 'qualquer' (tem qualquer marca) — espelha alvoDebuff. §83
  alvoCuradoAntes: { bool: true },   // §97 (Tsukuyomi): alvo foi curado no turno ANTERIOR (rastreio de dois tempos — não mais pendente)
  atacanteMaiorDanoAntes: { bool: true },   // §111 (Krishna): o ATACANTE é o aliado que causou MAIS dano no turno anterior (gêmeo ofensivo do alvoCuradoAntes; escopo:'time'). Empate → menor índice; ninguém se ninguém causou dano
  alvoContador: { contadorCmp: true },   // §114 (Izanami): o ALVO tem {nome} cruzando {op:min|max|exato, n} — p/ execIf "elimina amaldiçoados" (maldicao ≥ 1)
  alvoMaisDebuffs: { bool: true },   // §126 (Anubis): o alvo tem MAIS debuffs que buffs (comparativo de contagem). true = d>b, false = d<=b
};
// `quandoCura` — condição do gatilho bonusCura. TERCEIRO eixo, separado de `quando` (ofensivo: lê atk/alvo do
// ATAQUE) e de `contra` (defensivo: lê o golpe que chega). A cura não tem ataque: a condição lê o CONTEXTO da
// cura (quem curou, que tipo, estado do campo). Reusar `quando` seria repetir o erro que a sessão 3 corrigiu.
// Fechado; abre só `inimigoTem` p/ a Brigid. As outras formas da família (paridade de turno=Hel, facção do
// curador=Nefertem, tipo=regeneração=Cernunnos/Chaac) entram por deus. Ausência = toda cura. Ver docs/passivas.md.
const FACCOES_VOCAB = ['Africana', 'Brasileira', 'Celta', 'Chinesa', 'Egípcia', 'Grega', 'Hindu', 'Japonesa', 'Maia', 'Nórdica'];   // (a UI tem sua própria FACCOES; nome distinto p/ não colidir no dist concatenado)
const CONDICOES_CURA = {
  inimigoTem: { sub: DOTS },   // existe inimigo VIVO (do lado curado) com a tag DoT (brigid: 'queimadura'); cresce p/ debuff/controle por deus
  curadorFaccao: { sub: FACCOES_VOCAB },   // F1.6 (Nefertem): a cura foi FEITA por um curador desta facção (lê quem curou)
  viaRegen: { bool: true },   // F1.6 (Chaac): a cura veio de um TICK de regeneração (não de habilidade/milagre) — "regenerações curam +N"
};
// `estado` (F1.2.5 s3) — CAMPO UNIVERSAL: qualquer gatilho compõe (AND) o seu eixo (quando/contra/quandoCura)
// com uma condição de ESTADO DO CAMPO, lida contra o DONO do fx. NÃO é 4º eixo (irmão dos três, um-por-fx) —
// é ORTOGONAL: um fx pode ter `contra:{alcance}` E `estado:{primeiroPorTurno}` (bastet). Decidido pelos dados
// (bastet/saci/mnevis precisam de golpe E estado juntos). Só LEITURA — nada de rastreio por-turno. Ver §45.
const ESTADO_COND = {
  paridade:     { sub: ['par', 'impar'] },   // turno % 2 (Hel)
  fase:         { sub: ['Dia', 'Noite'] },    // st.fase (Amaterasu/Boto/Lugh/Itzamná) — MIGROU do `quando`, é campo, não ataque
  aliadosVivos: { count: true },              // {op:'min'|'max'|'exato', n} — vivos no lado do dono (Guan Yu '3 vivos')
  contador:     { contadorCmp: true },        // {nome, op, n} — contador do dono cruza o limiar (Kitsune '3 Caudas')
  contadorLado: { contadorCmp: true },        // §136 (Yamato): {nome, op, n} — POOL do lado cruza o limiar (Combo '15+'); ≠ contador (por-unidade)
  hpProprio:    { hp: true },                 // {op:'cheio'|'abaixo'|'acima', v} — HP do DONO (Shuten 'abaixo de 50')
  aliadoPresente:{ godkey: true },            // <key> — um deus específico está no time do dono (sinergia: 'com Fulano no time') — Passo 0
  aliadoCaido:  { bool: true },               // há ao menos um aliado CAÍDO no lado do dono (Freyja: 'se ninguém caiu' = ramo senão)
  faccaoConta:  { faccaoCount: true },         // F1.9 (Odin §91): {faccao, op, n} — nº de aliados vivos DA FACÇÃO cruza o limiar ('2+ Nórdicos'). Pequeno-serve-um (só Odin, varrido)
  primeiroPorTurno: { bool: true },   // F1.9 (Bastet): RASTREIO por-turno — flag u.golpeUnicoNoTurno (escrito no bater p/ golpe ÚNICO, resetado no iniciarTurno do dono). true = este é o 1º golpe único contra o dono neste turno. §88
};
const VOCAB = {
  classes: CLASSES,                              // classe de habilidade
  funcoes: FUNCOES_VOCAB,                              // função do deus (vulnerabilidade.deFuncao, F1.8)
  faccoes: FACCOES_VOCAB,                              // facção do deus (faccaoConta.faccao, F1.9 §91)
  elementos: ELEMS,
  custo: [...ELEMS, 'livre'],                    // chaves válidas em cost{}
  alvos: [...Object.keys(PASSOS), 'auto'],       // valores válidos de ability.alvo
  fx: TIPOS_FX,                                  // valores válidos de fx.t
  efeitos: [...new Set([...DEBUFFS, ...BUFFS])], // valores válidos de eff.type (t:'apply')
  dots: DOTS,                                    // chaves de DoT (fx dot.nome)
  contadores: CONTADORES,                        // chaves de contador (fx contador.nome)
  statusCategorias: STATUS_CATEGORIAS,           // porStatus.categoria (F1.8): nome de efeito OU coringa de família
  statusEscopos: STATUS_ESCOPOS,                 // porStatus.onde (F1.8): alvo|self|time|timeInimigo
  gatilhosPassiva: Object.keys(GATILHOS_PASSIVA), // valores válidos de passiva.fx[].gatilho (F1.2)
  gatilhosPassivaDef: GATILHOS_PASSIVA,           // campos/obrigatórios por gatilho (valida_kit dispara por isto)
  ignoraveis: IGNORAVEIS,                          // valores válidos em danoIrredutivel.ignora
  contra: Object.keys(CONTRA),                     // chaves válidas em reducao.contra (eixo DEFENSIVO)
  contraDef: CONTRA,                               // como validar cada chave de contra
  protegido: Object.keys(PROTEGIDO),               // chaves válidas em reducao.protegido (eixo do BENEFICIÁRIO)
  protegidoDef: PROTEGIDO,                          // como validar cada chave de protegido
  fxTurno: FX_TURNO,                               // tipos de fx válidos num `faz` (gatilho de turno)
  buffs: BUFFS,                                    // efeitos BENÉFICOS — o único conjunto que `apply` pode aplicar dentro de um faz (F1.2.5)
  imunizaveis: IMUNIZAVEIS,                         // valores válidos em imunidade.a (controle/DoT/'controle')
  controles: CONTROLES,                             // só os CONTROLES (refleteControle.a, F1.8)
  aoCairQuem: AOCAIR_QUEM,                          // valores válidos em aoCair.quem (sujeito da morte)
  aoSerAtingidoQuem: AOSERATINGIDO_QUEM,            // valores válidos em aoSerAtingido.quem (sujeito do golpe)
  escoposPassiva: ESCOPOS_PASSIVA,               // valores válidos de passiva.fx[].escopo
  condicoes: Object.keys(CONDICOES),             // chaves válidas em passiva.fx[].quando
  condicoesDef: CONDICOES,                        // como validar o valor de cada condição (valida_kit lê)
  estadoCond: Object.keys(ESTADO_COND),          // chaves válidas em fx.estado (CAMPO universal — F1.2.5 s3)
  estadoCondDef: ESTADO_COND,                     // como validar cada condição de estado (valida_kit lê)
  condicoesCura: Object.keys(CONDICOES_CURA),    // chaves válidas em bonusCura.quandoCura (eixo da CURA, 3º eixo)
  condicoesCuraDef: CONDICOES_CURA,               // como validar cada chave de quandoCura (valida_kit lê)
  slotsAtaque: SLOTS_ATAQUE,                       // slots que atacam (basico/habilidade/milagre) — usado em aCadaN.custoGratis.slot
  // campos que o motor LÊ num fx (danoBase + aplicarFx). Um fx com campo fora disto é typo.
  fxKeys: [
    't', 'v', 'kind', 'eff', 'escopo', 'nome', 'dur', 'idx', 'n', 'lado', 'max', 'hp',
    'contra', 'contraAtaca', 'protege', 'fonte', 'alvo', 'consomeContador',
    'porContador', 'porContadorCampo', 'porAliadoCaido', 'porInimigoCaido', 'porHpFaltante', 'porStatus', 'porDeficitAliados', 'porAliadoVivo', 'curaMetade',   // porDeficitAliados (§126, Susanoo) e porAliadoVivo (§132, Guan Yu): scalers por contagem de unidades vivas
    'seEncharcado', 'seAdormecido', 'seDia', 'seNoite', 'seCond', 'seAliadoJaAgiu', 'limiar', 'execIf',
    'pool', 'porContadorLado', 'consomeContadorLado',   // contador de campo por LADO (pool do time, F1.1)
    'unidade', 'soMaior',   // cdShift MIRADO (F1.6): 1+ unidades escolhidas; soMaior = só a maior recarga (Bragi/Brahma)
    'soMaiorDoTime',   // cdShift (F1.6, Huangdi): a MAIOR recarga cruzando o time (faz-only, porTurno)
    'se', 'entao', 'senao',   // fx condicional (F1.6, Freyja): se(estado) ? entao : senao
    'rouba',   // roubaOrbe (F1.6): true = o orbe removido vai p/ o próprio lado (Hades); ausente = só remove
    'reduzMaxHp',   // Podridão: reduz o HP máximo por acúmulo (F1.1 primitiva 3)
    'para',   // orbGain com elemento FIXO (zeus: 1 orbe de Tempestade); ausente = elemento sorteado do time
    'executaAbaixoDe',   // dmg: após o dano, ELIMINA o alvo se hp <= N (execução — F1.3)
    'soSe',   // apply FILTRADO por status do alvo (F1.6, Chaac): aplica só nos alvos que casam a condição (atordoa só os Encharcados)
    'ignoraInvuln', 'ignoraPiso',   // F1.9 (Shiva/Odin §91): dmg fura Invulnerabilidade / o 'não cai abaixo de 1 HP' — flags de habilidade que fluem p/ o bater
    'golpes',   // F1.9 (§92): multi-golpe DISTRIBUÍDO — N golpes de v repartidos igual entre os alvos selecionados (alvo:'distribui')
    'remove',   // F1.9 (§94): fase.remove — REMOÇÃO SELETIVA de fase (Hou Yi "remove o Dia"): limpa st.fase só se == remove
    'durNoite', 'curaCausador',   // F1.9 (§99, dominar): durNoite = dur do 'dominado' quando Noite (Boto +1); curaCausador = o lançador dreba o dano do golpe-fantoche (Boto)
    'massa',   // §130 (Dionísio): dominar em MASSA — cada inimigo vira vítima (alvo do fogo-amigo determinístico)
    'categoria', 'de',   // §131 (realoca, M5): categoria ∈ buff|debuff, de ∈ time|inimigos (destino = `para`: self|time|inimigos)
    'alvoHp',   // F1.9 (§103): seletor AUTO por HP — {lado:'inimigo'|'aliado', ext:'max'|'min'}; empate = menor índice (Lugh/Deméter/Izanami)
    'semContra',   // F1.9 (§105, Lugh): dmg "não pode ser contra-atacado" — flui p/ o opts do bater (que já tem semContra)
    'alvoSenhor',   // F1.9 (§107, Hanuman): seletor AUTO do aliado designado (intercepta.protege), fallback mais ferido (alvoHp)
    'agenda',   // §117 (M1): payload de fx do `agendar` — array de fx disparado no próximo turno do dono
    'naoRevive',   // §127 (Hel): dot que carimba naoRevive no portador ao cair (Marca da Morte); flui p/ aplicarDot
    'curaPorAlvo',   // §127 (Hel): dmg que cura o lançador em N por alvo atingido (soma na área)
    'porInimigoHp',   // §135 (Kali): scaler "+N por inimigo abaixo de X HP" ({v, abaixo})
    'dreno',   // §135 (Shuten): dmg do noAtor que vira cura no dono (lifesteal — "rouba HP")
    'posicional',   // §135 (Raijin): dmg posicional — array [v0,v1,v2] por ordem de seleção do alvo
    'porAlvoComStatus',   // §135 (Shuten milagre): roubaOrbe cujo n = nº de inimigos com o status nomeado
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
    'matador',             // queda:matador — CHAVE de quem desferiu o golpe letal (F2.0; fogo amigo = matador e alvo no mesmo lado)
    'estados',             // queda:estados — status ativos no morto NO ATO da queda (F2.0; "morrer Encharcado/Envenenado")
    // RESERVADOS p/ sub-tokens de 0-kit (nome canônico decidido agora, complete-by-construction):
    'habilidadeCopiada',   // efeito:copiar — qual Habilidade foi copiada (Ísis, F1.3)
    'execucao',            // queda:execucao — a morte foi por execução (Yan Wong reage a isto)
  ],
  motivos: [        // conjunto FECHADO — motivo nunca é texto livre (docs/eventos.md)
    'invulneravel', 'submerso', 'controle_imune',       // bloqueio de efeito
    'sem_cura', 'nao_revive',                           // falha (noHeal / naoRevive)
    'em_recarga', 'sem_energia', 'silenciado', 'travada', 'ja_usou', 'orbe_protegido', 'sem_alvo', 'passe_forcado', // indisponibilidade de ação (acoesDe) / roubo de orbe barrado (Heimdall) / sem alvo válido (F1.9) / §138: passe forçado do Dagda (a unidade não age neste turno)
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
    hp: g.hp || 120, maxHp: g.hp || 120, vivo: true, agiu: false,   // F2.3: HP vem do kit (bestiário: tropa fora da faixa, chefe 200-300). Default 120 = os 100 deuses SEM `hp` nascem inalterados (§134: o campo atravessa toda unidade; o default é o que mantém o outro lado)
    golpeUnicoNoTurno: false,   // F1.9 (Bastet §88): RASTREIO — já sofreu golpe de alvo ÚNICO neste turno? Escrito no bater (unico), resetado no iniciarTurno do dono. Lido por estado:{primeiroPorTurno} (= !este flag)
    controleNoTurno: false,   // §131 (Loki): já sofreu TENTATIVA de controle neste turno? Escrito em aplicar (evadeControle), resetado no iniciarTurno do dono. Gêmeo do golpeUnicoNoTurno no eixo controle
    guardaControleUsado: false,   // §136 (Khonshu, M9): a carga 1×-por-partida do guardaControle já foi gasta? (bespoke, como o renasceu da Nezha)
    danoAgora: 0, danoAntes: 0,   // §111 (Krishna): RASTREIO de dois tempos do DANO CAUSADO — 'dano neste turno' (escrito em bater) e 'dano no turno ANTERIOR' (leitor, atacanteMaiorDanoAntes). Promovidos no iniciarTurno p/ os DOIS lados, gêmeo do curadoAntes (§97)
    curadoAgora: false, curadoAntes: false,   // F1.9 (Tsukuyomi §97): RASTREIO de dois tempos — 'curado neste turno' (escrito em curar) e 'curado no turno ANTERIOR' (leitor, alvoCuradoAntes). Promovidos (agora→antes) no iniciarTurno p/ TODAS as unidades dos DOIS lados: é leitura OFENSIVA cruzando o lado, não ancorada ao dono (≠ §88)
    cd: { habilidade: 0, milagre: 0, defesa: 0 },
    efeitos: [], dots: [], shield: 0,
    // --- primitivas ---
    contadores: {},      // contadores acumuláveis por CHAVE: { discoSolar: 3, atadura: 2 } (nome exibível no narrador)
    vidaExtra: null,     // Vida Extra pendente: { hp } — revive no ato ao cair
    suspensos: null,     // §138 (Dagda M6): buffs SUSPENSOS (remove-e-guarda): { efeitos:[...], shield:N, restauraEm } — restaurados no fimTurno
    naoRevive: false,    // marcado ao morrer sob Atadura/Podridão/Livro
    usos: {},            // habilidades "1× por partida" já gastas: { milagre: true }
    modo: 0, renasceu: false, lado,
    pendente: [],   // §117 (M1): payloads agendados (fx) p/ disparar no próximo iniciarTurno do dono. Lista (não campo único) — robusto se um dia dois caírem na mesma unidade; disparo em ordem de inserção, e a ordem ENTRE unidades cai da iteração por índice do iniciarTurno
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
      { units: timeA.map((k, i) => novaUnidade(k, i, 0, catalogo)), orbs: zeroOrbs(), converteu: false, estreou: false, ultHabilidade: null, dividaLivre: 0, contadores: {} },
      { units: timeB.map((k, i) => novaUnidade(k, i, 1, catalogo)), orbs: zeroOrbs(), converteu: false, estreou: false, ultHabilidade: null, dividaLivre: 0, contadores: {} },
    ],
  };
  // §121 (M2): iniciativa PERMANENTE (Exu/Hermes) força o starter no SETUP — "age primeiro" = liderar a rodada = ser o
  // starter (modelo 1-1). Um só lado com iniciativa → ele abre. AMBOS → CANCELAM, e o `comeca` sorteado (o param) vale
  // (empate determinístico, sem nova aleatoriedade). O custo de abertura (1 orbe, não 3) segue valendo p/ quem ganhar o starter.
  const iniA = temIniciativa(st, 0), iniB = temIniciativa(st, 1);
  if (iniA && !iniB) comeca = 0; else if (iniB && !iniA) comeca = 1;
  st.ativo = comeca; st.starter = comeca;
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

// imunidade declarativa (F1.2 sessão 5) — u é imune a `tag` (um tipo de CONTROLE ou nome de DoT). O coringa
// 'controle' cobre TODO controle. Lê a passiva do dono; enforcement em aplicar (controle) e aplicarDot (DoT).
function imuneA(st, u, tag) {
  const ehControle = CONTROLES.includes(tag);
  // §120 (izanagi): VARRE o lado do alvo — a imunidade pode ser do PRÓPRIO (escopo self, default) ou do TIME (escopo:'time',
  // um aliado protege o lado). Espelha temIgnoraInalvejavel/bonusDanoDeclarativo. Self-scope (Nezha/Cuca) só protege o dono.
  for (const dono of st.lados[u.lado].units) {
    if (!dono.vivo) continue;
    const g = kitDe(st, dono); const p = g && g.passiva;
    if (!p || !Array.isArray(p.fx)) continue;
    for (const f of p.fx) {
      if (f.gatilho !== 'imunidade') continue;
      if ((f.escopo || 'self') === 'self' && dono !== u) continue;   // escopo self: só o dono; time: qualquer aliado
      if (f.estado && !estadoOK(f.estado, dono, st)) continue;   // §132 (Guan Yu): imunidade CONDICIONAL — gateia por estado (3 aliados vivos → imune a Medo). Destrava tb o Yamato (imune a controle com 15+ Combo). §116 pendência fechada
      if (f.a.includes(tag) || (ehControle && f.a.includes('controle'))) return true;   // coringa 'controle' cobre todo controle
    }
  }
  return false;
}

function aplicar(st, u, eff) {
  const e = { ...eff };
  // reflete-controle (F1.8, Perseu): quem TENTA um controle de `a` no dono leva o MESMO controle. Dispara na
  // TENTATIVA — ANTES das imunidades abaixo (o dono é imune, mas o reflexo acontece igual; o dono: "a tentativa é o
  // gatilho"). `origem` (posto por aplicarFx desde o Provocar/§56) diz QUEM tentou; `refletido` corta o loop.
  if (CONTROLES.includes(e.type) && !e.refletido && e.origem != null) {
    const g = kitDe(st, u), p = g && g.passiva;
    const rf = p && Array.isArray(p.fx) && p.fx.find(f => f.gatilho === 'refleteControle' && f.a.includes(e.type));
    if (rf) { const atk = st.lados[1 - u.lado].units.find(x => x.uid === e.origem);
      if (atk && atk.vivo) { log(st, { tipo: 'efeito', origem: u.key, alvo: atk.key, efeito: e.type }); aplicar(st, atk, { type: e.type, dur: rf.dur || 1, origem: u.uid, refletido: true }); } }
  }
  // §131 (Loki, Metamorfo): a PRIMEIRA tentativa de controle por turno FALHA. ANTES das imunidades (a tentativa é
  // o gatilho, como o refleteControle), mas DEPOIS do reflexo. Consome a proteção do turno na 1ª tentativa; as
  // seguintes passam. `refletido` não conta (não é uma tentativa do inimigo).
  if (CONTROLES.includes(e.type) && !e.refletido) {
    const gv = kitDe(st, u), pv = gv && gv.passiva;
    if (pv && Array.isArray(pv.fx) && pv.fx.some(f => f.gatilho === 'evadeControle') && !u.controleNoTurno) {
      u.controleNoTurno = true;
      log(st, { tipo: 'efeito', alvo: u.key, efeito: 'evade' });
      return;
    }
  }
  // §136 (Khonshu, M9): 1× por partida, um GUARDA no lado de `u` anula um controle em `a` (protege aliado ou self).
  // ANTES das imunidades (é anulação por carga, não imunidade permanente); consome a carga (flag bespoke, ≠ imuneA).
  if (CONTROLES.includes(e.type) && !e.refletido) {
    for (const guarda of st.lados[u.lado].units) {
      if (!guarda.vivo || guarda.guardaControleUsado) continue;
      const gg = kitDe(st, guarda), pg = gg && gg.passiva;
      if (pg && Array.isArray(pg.fx) && pg.fx.some(f => f.gatilho === 'guardaControle' && f.a.includes(e.type))) {
        guarda.guardaControleUsado = true;
        log(st, { tipo: 'bloqueio', alvo: u.key, motivo: 'controle_imune', efeito: e.type });
        return;
      }
    }
  }
  // regra 7 — proteção vence controle
  if (CONTROLES.includes(e.type) && ef(u, 'controlImmune')) {
    log(st, { tipo: 'bloqueio', alvo: u.key, motivo: 'controle_imune', efeito: e.type }); return;
  }
  if (CONTROLES.includes(e.type) && imuneA(st, u, e.type)) {   // imunidade declarativa (controle) — Cuca: adormecido
    log(st, { tipo: 'imune', alvo: u.key, efeito: e.type }); return;
  }
  const ja = ef(u, e.type);
  if (ja) {
    // regra 6 — acúmulo por categoria
    if (e.type === 'dmgUp' || e.type === 'dmgDown' || e.type === 'vulneravel') { ja.v += e.v; ja.dur = Math.max(ja.dur, e.dur); }
    else if (e.type === 'dmgReduction' || e.type === 'regen') { ja.v = Math.max(ja.v, e.v); ja.dur = Math.max(ja.dur, e.dur); }
    else if (CONTROLES.includes(e.type)) { ja.dur = Math.max(ja.dur, e.dur); }
    else { ja.dur = Math.max(ja.dur, e.dur); }
  } else {
    u.efeitos.push(e);
  }
}

function aplicarDot(st, u, nome, v, dur, origem = null, escala = null, naoRevive = false) {   // escala (§114, Izanami): spec porContador lida NO TIQUE (dano dinâmico por acúmulo), reusa escalaContagem
  if (imuneA(st, u, nome)) { log(st, { tipo: 'imune', alvo: u.key, efeito: nome }); return; }   // imunidade declarativa (Nezha: veneno+queimadura)
  const ja = u.dots.find(d => d.nome === nome);
  if (ja) { ja.v = Math.max(ja.v, v); ja.dur = Math.max(ja.dur, dur); if (origem != null) ja.origem = origem; if (escala) ja.escala = escala; if (naoRevive) ja.naoRevive = true; }   // regra 6
  else { const d = { nome, v, dur }; if (origem != null) d.origem = origem; if (escala) d.escala = escala; if (naoRevive) d.naoRevive = true; u.dots.push(d); }   // origem = quem aplicou (aoAgirSobEfeito lê isto). §127 (Hel): naoRevive no DoT — o LEITOR (matar, l.905) já existia (comentário "Marca da Morte da Hel"), mas o ALIMENTADOR não; agora um DoT pode carregar o carimbo (a Marca da Morte)
}

// -------------------------------------------------- PRIMITIVAS: contadores
// Contadores acumuláveis por CHAVE (discoSolar, cauda, atadura, podridao, combo…; nome no narrador).
// Genéricos: somam, respeitam um teto opcional, podem ser lidos e consumidos.
// O que cada contador FAZ (limiares, escalas) é decisão do kit; aqui só se guarda.
function addContador(st, u, nome, v = 1, max = null) {
  if (v > 0 && imuneA(st, u, nome)) { log(st, { tipo: 'imune', alvo: u.key, efeito: nome }); return getContador(u, nome); }   // §120 (izanagi): "imune a Maldição" bloqueia GANHAR o contador (simétrico ao aplicarDot). Só ganho (v>0); consumo/decremento passa. Só afeta contador imunizável (maldicao) — no-op p/ discoSolar/Combo/etc.
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
  if (antes < L.em && getContador(alvo, e.nome) >= L.em) {
    aplicar(st, alvo, { ...L.aplica, origem: origem.uid });
    if (L.consome) { const tinha = getContador(alvo, e.nome); alvo.contadores[e.nome] = 0; log(st, { tipo: 'contador', origem: origem.key, valor: -tinha, efeito: e.nome }); }   // F1.6 (Medusa): 'perde as marcas' ao petrificar — zera o contador ao cruzar o limiar
  }
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
    if (imuneA(st, u, 'contagio')) { log(st, { tipo: 'imune', alvo: u.key, efeito: 'contagio' }); continue; }   // §120 (izanagi): imune à MECÂNICA de contágio ("qualquer efeito que se espalhe") — o spread não o alcança (irmão do Sun Wukong / execução, §84)
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
// PAYLOAD da fase (§96): o Dia/Noite não é só um flag — carrega um modificador GLOBAL de dano por ELEMENTO do
// ATACANTE (ambos os lados; a fase é um só `st.fase`, sem dono). Dia favorece a Aurora e pune a Umbra; a Noite
// espelha. É a DEFINIÇÃO da fase (por isso mora no motor, tabela fixa), lida em bonusDano — soma de saída, como o dmgUp.
const FASE_MOD = { Dia: { Aurora: 8, Umbra: -5 }, Noite: { Umbra: 8, Aurora: -5 } };
function bonusFase(st, atk) {
  if (!st.fase || !atk) return 0;
  return (FASE_MOD[st.fase] && FASE_MOD[st.fase][atk.elem]) || 0;
}
function bonusDano(st, atk) {
  let b = 0;
  const up = ef(atk, 'dmgUp'), dn = ef(atk, 'dmgDown');
  if (up) b += up.v;
  if (dn) b -= dn.v;
  const md = ef(atk, 'medo'); if (md) b -= (md.dmgDown || 0);   // Medo (§60): a metade dmgDown do compósito reduz o dano de saída
  b += bonusFase(st, atk);   // §96: modificador global Dia/Noite por elemento do atacante
  return b;
}

// PASSIVA declarativa (F1.2) — avalia UMA condição `quando` (objeto de 1 chave). Ausente = sempre.
// Só lê estado; conjunto FECHADO (CONDICOES). alvoMarca/alvoCuradoAntes são `pendente` no schema
// (valida_kit os barra), então nunca chegam aqui com dado válido — caem no `return false`.
function cmpLimiar(val, spec) { if (spec.op === 'min') return val >= spec.n; if (spec.op === 'max') return val <= spec.n; if (spec.op === 'exato') return val === spec.n; return false; }
// `estado` — condição de CAMPO, lida contra o DONO do fx (u). Universal: composto (AND) com o eixo de cada gatilho.
function estadoOK(e, u, st) {
  if (!e) return true;
  if ('paridade' in e) return (st.turno % 2 === 0 ? 'par' : 'impar') === e.paridade;
  if ('fase' in e) return st.fase === e.fase;
  if ('aliadosVivos' in e) return cmpLimiar(st.lados[u.lado].units.filter(x => x.vivo).length, e.aliadosVivos);
  if ('contador' in e) return cmpLimiar(getContador(u, e.contador.nome), e.contador);
  if ('contadorLado' in e) return cmpLimiar(getContadorLado(st, u.lado, e.contadorLado.nome), e.contadorLado);   // §136 (Yamato): limiar sobre o POOL do lado (Combo), não o contador por-unidade — "imune a controle com 15+ Combo"
  if ('hpProprio' in e) { const h = e.hpProprio; if (h.op === 'cheio') return u.hp >= u.maxHp; if (h.op === 'abaixo') return u.hp < h.v; if (h.op === 'acima') return u.hp > h.v; return false; }
  if ('aliadoPresente' in e) return st.lados[u.lado].units.some(x => x.key === e.aliadoPresente);   // deus X no time (roster)
  if ('aliadoCaido' in e) return caidos(st, u.lado) > 0;   // há aliado caído no lado do dono (Freyja)
  if ('faccaoConta' in e) { const q = e.faccaoConta; const n = st.lados[u.lado].units.filter(x => x.vivo && kitDe(st, x) && kitDe(st, x).faccao === q.faccao).length; return cmpLimiar(n, q); }   // F1.9 (Odin §91): aliados vivos da facção cruzam o limiar
  if ('primeiroPorTurno' in e) return !u.golpeUnicoNoTurno;   // F1.9 (Bastet §88): LEITOR — true enquanto o dono NÃO sofreu golpe único neste turno (o próprio golpe seta o flag DEPOIS de ler)
  return false;
}
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
  if ('alvoMarca' in q) {   // F1.9-pre: alvo tem a marca ofensiva nomeada, OU 'qualquer' (tem qualquer marca de MARCAS). Espelha alvoDebuff; a marca é rótulo puro (o +dano é vulneravel irmão ou o v deste bonusDano). §83
    const val = q.alvoMarca;
    if (val === 'qualquer') return alvo.efeitos.some(e => MARCAS.includes(e.type));
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
  if ('alvoCuradoAntes' in q) return !!alvo.curadoAntes;   // §97 (Tsukuyomi): o alvo foi curado no turno ANTERIOR (rastreio de dois tempos)
  if ('atacanteMaiorDanoAntes' in q) return atk === maiorDanoAntes(st, atk.lado);   // §111 (Krishna): o atacante é o TOP-dano do time no turno anterior
  if ('alvoContador' in q) { const c = getContador(alvo, q.alvoContador.nome), { op, n } = q.alvoContador; return op === 'min' ? c >= n : op === 'max' ? c <= n : c === n; }   // §114 (Izanami): o alvo carrega o contador cruzando o limiar
  if ('alvoMaisDebuffs' in q) {   // §126 (Anubis): o alvo tem MAIS debuffs que buffs — condição COMPARATIVA de contagem (não presença). debuff inclui DoT (como alvoDebuff); buff conta efeitos BUFFS + escudo
    const d = alvo.efeitos.filter(e => DEBUFFS.includes(e.type)).length + alvo.dots.length;
    const b = alvo.efeitos.filter(e => BUFFS.includes(e.type)).length + (alvo.shield > 0 ? 1 : 0);
    return q.alvoMaisDebuffs ? d > b : d <= b;
  }
  return false;
}

// §111 (Krishna) — o aliado que causou MAIS dano no turno anterior (lê danoAntes, promovido no iniciarTurno).
// Empate → MENOR ÍNDICE (o primeiro no strict >). Ninguém (null) se o time inteiro causou 0 no turno anterior:
// "quem causou mais" não existe sem dano. Gêmeo do maior/menor-HP (§103), mas sobre o rastreio de dano.
function maiorDanoAntes(st, lado) {
  let best = null;
  for (const u of st.lados[lado].units) {
    if (!u.vivo || !(u.danoAntes > 0)) continue;
    if (!best || u.danoAntes > best.danoAntes) best = u;
  }
  return best;
}

// Soma o +v das passivas declarativas (gatilho bonusDano) no lado do atacante. escopo self =
// só quando o dono é o atacante; time = qualquer aliado vivo (sujeito ao `quando`). Ver DECISOES §36.
function bonusDanoDeclarativo(st, atk, alvo) {
  let b = 0;
  for (const u of st.lados[atk.lado].units) {
    const g = kitDe(st, u);                     // guarda defensiva: unidade sem kit no catálogo
    const p = g && g.passiva;
    if (!p || !Array.isArray(p.fx)) continue;
    for (const f of p.fx) {
      if (f.gatilho !== 'bonusDano') continue;
      if (!u.vivo && !f.mesmoMorto) continue;   // §123 (Mimir): morto só contribui se o fx é mesmoMorto ("cabeça falante"); o gate de vivo vira por-fx
      if ((f.escopo || 'self') === 'self' && u !== atk) continue;
      if (f.estado && !estadoOK(f.estado, u, st)) continue;   // compõe (AND) com o `quando`
      if (condOK(f.quando, atk, alvo, st)) b += f.v + escalaContagem(st, atk, alvo, f);   // v FIXO + escala por contagem (MESMO helper do danoBase — Oni +1/4 Combo, Osíris +8/caído). §73
    }
  }
  return b;
}

// bonusCura (F1.2 sessão 8) — avalia a condição `quandoCura` (eixo próprio da cura). Lê o contexto da cura,
// NÃO um ataque: `u` é a unidade CURADA; a condição olha o campo/lado. Conjunto FECHADO (CONDICOES_CURA).
function condCuraOK(q, u, st, curador, via) {
  if (!q) return true;
  if ('inimigoTem' in q) {   // existe inimigo VIVO (do lado oposto ao curado) com a tag DoT
    return st.lados[1 - u.lado].units.some(x => x.vivo && x.dots.some(d => d.nome === q.inimigoTem));
  }
  if ('curadorFaccao' in q) {   // F1.6 (Nefertem): a CURA foi feita por um curador da facção X (lê quem curou, não o curado)
    const g = curador && kitDe(st, curador);
    return !!g && g.faccao === q.curadorFaccao;
  }
  if ('viaRegen' in q) return via === 'regen';   // F1.6 (Chaac): só o TICK de regeneração conta
  return false;
}
// Soma o +v das passivas bonusCura no lado do CURADO (u). O dono precisa estar VIVO (a passiva some com ele,
// igual ao bonusDano). Estrutura espelha bonusDanoDeclarativo. Brigid: +5 se algum inimigo com Queimadura.
function bonusCuraDeclarativo(st, u, curador, via) {
  let b = 0;
  for (const dono of st.lados[u.lado].units) {
    if (!dono.vivo) continue;
    const g = kitDe(st, dono);
    const p = g && g.passiva;
    if (!p || !Array.isArray(p.fx)) continue;
    for (const f of p.fx) {
      if (f.gatilho !== 'bonusCura') continue;
      if (f.estado && !estadoOK(f.estado, dono, st)) continue;   // compõe com o `quandoCura`
      if (condCuraOK(f.quandoCura, u, st, curador, via)) b += f.v;
    }
  }
  return b;
}

// danoIrredutivel (F1.2 sessão 2) — o dano do PRÓPRIO atacante fura redução e/ou escudo. Lê a passiva
// declarativa do atacante (é propriedade do dono, então sempre self). ogum fura redução; tyr, ambos.
function danoImune(st, atk) {
  const out = { reducao: false, escudo: false };
  const g = kitDe(st, atk);
  const p = g && g.passiva;
  if (p && Array.isArray(p.fx)) for (const f of p.fx) {
    if (f.gatilho === 'danoIrredutivel') for (const x of f.ignora) out[x] = true;
  }
  return out;
}

// reducao (F1.2 sessão 3) — reduz o dano RECEBIDO por `alvo`. Lê a passiva de quem protege (self = só o
// dono; time = qualquer aliado vivo) e a condição DEFENSIVA `contra`, que lê o GOLPE que chega (slot).
// Regra 6: pega o MAIOR, não soma. `contra` é eixo separado do `quando` ofensivo (ver docs/passivas.md).
function contraCasou(c, golpe) {
  if ('slot' in c) return c.slot === golpe.slot;
  if ('classe' in c) return c.classe === golpe.classe;                 // classe da habilidade que chega
  if ('elem' in c) return golpe.elem === c.elem;                       // só golpes deste elemento (positivo)
  if ('elemNao' in c) return golpe.elem !== c.elemNao;                 // aplica a TODO golpe menos os deste elemento
  if ('alcance' in c) return (golpe.unico ? 'unico' : 'area') === c.alcance;
  return false;
}
function protegidoCasou(pr, alvo) {   // `protegido` lê o BENEFICIÁRIO (o aliado que recebe a redução), não o golpe
  if ('elem' in pr) return alvo.elem === pr.elem;
  return false;
}
function reducaoDeclarativa(st, alvo, golpe) {
  let r = 0;
  for (const u of st.lados[alvo.lado].units) {
    if (!u.vivo) continue;
    const g = kitDe(st, u); const p = g && g.passiva;
    if (!p || !Array.isArray(p.fx)) continue;
    for (const f of p.fx) {
      if (f.gatilho !== 'reducao') continue;
      if ((f.escopo || 'self') === 'self' && u !== alvo) continue;   // self protege só o dono
      if (f.protegido && !protegidoCasou(f.protegido, alvo)) continue;   // condição do BENEFICIÁRIO (Poseidon: só aliado Maré)
      if (f.contra && !contraCasou(f.contra, golpe)) continue;        // condição do golpe que chega
      if (f.estado && !estadoOK(f.estado, u, st)) continue;           // compõe (AND) com o `contra` — a garantia do campo universal
      r = Math.max(r, f.v + escalaContagem(st, u, u, f));            // §126 (Kitsune): reducao ESCALADA por contador ("a cada 3 Caudas, +5") — mesmo helper do dano (§73); f.v fixo + escala. porContador onde:self (o dono), t=u é inócuo

    }
  }
  return r;
}
// amplificaDot (F1.8, Kagutsuchi): +v em todo tick do DoT `nome` NO CAMPO (ambos os lados), enquanto o dono vive.
function ampDot(st, nome) {
  let a = 0;
  for (const lado of st.lados) for (const x of lado.units) { if (!x.vivo) continue; const g = kitDe(st, x), p = g && g.passiva;
    if (p && Array.isArray(p.fx)) for (const f of p.fx) if (f.gatilho === 'amplificaDot' && f.nome === nome) a += f.v; }
  return a;
}
// vulnerabilidade PASSIVA (F1.8, Aquiles): o dono sofre +v de atacantes de uma FUNÇÃO (lê o atacante, não o golpe —
// eixo distinto do `contra` do reducao). Aditivo (soma todas as fontes ativas do próprio alvo). Sem `deFuncao` = todo golpe.
function vulnerabilidadeDeclarativa(st, alvo, atk) {
  const g = kitDe(st, alvo); const p = g && g.passiva;
  if (!p || !Array.isArray(p.fx)) return 0;
  const fn = atk && kitDe(st, atk) && kitDe(st, atk).funcao;
  let add = 0;
  for (const f of p.fx) { if (f.gatilho !== 'vulnerabilidade') continue;
    if (f.deFuncao && f.deFuncao !== fn) continue;
    add += f.v; }
  return add;
}

function calcDano(st, atk, alvo, base, kind, slot, golpe) {
  golpe = golpe || { slot, elem: atk && atk.elem };   // eixo `contra` lê o golpe (slot/classe/elem/alcance)
  let v = base + bonusDano(st, atk);
  v += bonusDanoDeclarativo(st, atk, alvo);   // passivas declarativas (F1.2, gatilho bonusDano)
  if (ef(alvo, 'adormecido')) v += 8;                               // Cuca — passiva de Orfeu/Cuca (vulnerabilidade, não migrada)
  const vul = ef(alvo, 'vulneravel'); if (vul) v += vul.v;          // vulneravel (Durga): debuff "recebe +N de dano" — soma no dano de ENTRADA, antes de redução/escudo
  v += vulnerabilidadeDeclarativa(st, alvo, atk);                   // vulnerabilidade PASSIVA por função do ATACANTE (Aquiles: +10 de Manipuladores)
  if (v < 0) v = 0;

  const irred = danoImune(st, atk);   // ogum/tyr migrados: danoIrredutivel declarativo (§37)
  const ap = slot === 'habilidade' && atk && !!ef(atk, 'acaoPerfeita');   // §111 (Krishna): Ação Perfeita fura redução E escudo — SÓ na habilidade do portador (não-reduzível + não-absorvível). Os dois nomes da prosa = o MESMO danoIrredutivel; aqui via BUFF transferido em vez de passiva do dono
  const puroAgora = atk && SLOTS_ATAQUE.includes(slot) && !!ef(atk, 'proximoGolpePuro');   // §136 (Yamato): "o próximo ataque é puro" — fura redução E escudo, em qualquer slot de ataque; consumido no 1º uso
  if (puroAgora) atk.efeitos = atk.efeitos.filter(e => e.type !== 'proximoGolpePuro');
  const ignoraReducao = kind === 'perfurante' || kind === 'puro' || irred.reducao || ap || puroAgora;
  const ignoraEscudo = kind === 'puro' || irred.escudo || ap || puroAgora;

  // regra 2 — redução ANTES do escudo
  if (!ignoraReducao) {
    let red = 0;
    const r = ef(alvo, 'dmgReduction');
    if (r) red = Math.max(red, r.v);                                // regra 6 — pega o maior
    red = Math.max(red, reducaoDeclarativa(st, alvo, golpe));        // sobek/thor migrados: reducao declarativo (§37)
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
  const { semVinculo = false, unico = false, semContra = false, semIntercepta = false, classe = null, ignoraPiso = false, semRedirect = false, ignoraInvuln = false, semEvade = false } = opts;   // ignoraInvuln (F1.9, Shiva/Odin §91): o golpe fura Invulnerabilidade — override de DANO, flag de habilidade (§84). semEvade (§130, Saci): o contra-ataque da evasão não re-dispara evasão
  if (!alvo.vivo) return 0;
  const semContraEf = semContra || (slot === 'habilidade' && atk && !!ef(atk, 'acaoPerfeita'));   // §111 (Krishna): não-contra-atacável via BUFF transferido — SÓ na habilidade do portador. O reflexo/contra recursam com slot próprio, então não reentram aqui
  // `contra` (redução) lê o GOLPE que chega: slot + classe (da habilidade) + elem (do atacante) + alcance (unico/area)
  const golpe = { slot, classe, elem: atk && atk.elem, unico };

  // PRIMITIVA redirecionar (Loki/Curupira) — o lado do ALVO carrega um efeito 'redirect' que manda o golpe de alvo
  // ÚNICO para um SINK escolhido no lado do ATACANTE (fogo amigo). PRECEDE o taunt: o taunt decide o alvo antes, mas
  // o redirect tem a última palavra sobre onde o golpe cai (§62 — mais específico e temporário). Lifetime: consumo-
  // único (Loki: 'proximo' → contra:'unico', reusa o padrão do intercepta) ou janela por dur (Curupira: 2 turnos).
  if (unico && !semRedirect && atk && atk.lado !== alvo.lado) {
    const dono = st.lados[alvo.lado].units.find(x => x.vivo && ef(x, 'redirect'));
    const rd = dono && ef(dono, 'redirect');
    const sink = rd && st.lados[atk.lado].units.find(x => x.vivo && x.uid === rd.destino);
    if (sink && sink !== atk) {   // não redireciona o golpe de volta ao próprio atacante ('aliado deles', não ele)
      if (rd.contra === 'unico') dono.efeitos = dono.efeitos.filter(e => e !== rd);
      log(st, { tipo: 'efeito', origem: dono.key, alvo: sink.key, efeito: 'redirect' });
      return bater(st, atk, sink, base, kind, slot, { ...opts, semRedirect: true });
    }
  }

  // PRIMITIVA interceptar — golpe de alvo único pode ser assumido por um protetor.
  // Vale para o efeito 'intercepta' (Loki, Bastet, Hanuman, Khnum).
  if (unico && !semIntercepta) {
    const redir = acharInterceptador(st, alvo, atk);
    if (redir) {
      const ie = ef(redir, 'intercepta');
      if (ie && ie.contra === 'unico') redir.efeitos = redir.efeitos.filter(e => e !== ie);
      log(st, { tipo: 'efeito', origem: redir.key, alvo: alvo.key, efeito: 'intercepta' });
      return bater(st, atk, redir, base, kind, slot, { ...opts, semIntercepta: true });
    }
  }
  // §130 (Saci, Gorro Vermelho): EVADE o 1º golpe ÚNICO por turno e revida. Lê o flag primeiroPorTurno (§88, ainda limpo
  // aqui — o escritor da l.838 só o seta depois); nulifica o golpe (falha) e contra-ataca v ao atacante (semContra/semEvade
  // p/ não recursar). Só golpe inimigo, só único (a AoE não consome a proteção — mesma regra do §88).
  if (unico && !semEvade && atk && atk.lado !== alvo.lado && !alvo.golpeUnicoNoTurno) {
    const ge = kitDe(st, alvo), pe = ge && ge.passiva;
    const ev = pe && Array.isArray(pe.fx) && pe.fx.find(f => f.gatilho === 'evadeContra');
    if (ev) {
      alvo.golpeUnicoNoTurno = true;
      log(st, { tipo: 'efeito', origem: alvo.key, alvo: atk.key, efeito: 'evade' });
      if (ev.v && atk.vivo) bater(st, alvo, atk, ev.v, 'afetado', 'contra', { semContra: true, semIntercepta: true, semRedirect: true, semEvade: true });
      return 0;
    }
  }
  if (ef(alvo, 'invulneravel') && !ignoraInvuln) { log(st, { tipo: 'bloqueio', alvo: alvo.key, motivo: 'invulneravel' }); return 0; }   // §91: o Shiva/Odin fura (ignoraInvuln)
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
  let { v, absorvido } = calcDano(st, atk, alvo, base, kind, slot, golpe);
  if (atk && ef(atk, 'pacificado')) { v = 0; absorvido = 0; }   // Pacificar (Oxalá): o pacificado AGE mas causa 0 de dano
  const pisoAtk = !ignoraPiso && (ef(alvo, 'pisoVida') || (ef(alvo, 'caldeirao') && alvo.curadoAgora));   // 'não cai abaixo de 1 HP' — a menos que o golpe fure (Shiva). §138 (Dagda): Caldeirão ativo + curado NESTE turno = mesmo piso
  alvo.hp = Math.max(pisoAtk ? 1 : 0, alvo.hp - v);
  if (unico) alvo.golpeUnicoNoTurno = true;   // F1.9 (Bastet §88): ESCRITOR do rastreio. SÓ golpe único (a AoE não consome a proteção); DEPOIS do calcDano (a reducao deste golpe já leu o flag ainda limpo). Quem intercepta/redireciona seta o flag do RECEPTOR (a recursão do bater), não do alvo original
  const evDano = { tipo: 'dano', origem: atk.key, alvo: alvo.key, valor: v, kind: kind || 'afetado' };
  if (absorvido) evDano.absorvido = absorvido;
  log(st, evDano);
  // §111 (Krishna) — ESCRITOR do rastreio de dano causado: credita ao ATACANTE o dano LÍQUIDO em inimigo (v>0).
  // Só dano cruzando o lado (dano em si/aliado não é "causar dano"). O reflexo/contra creditam quem revida —
  // é dano que ele de fato causou.
  if (v > 0 && atk && typeof atk.danoAgora === 'number' && atk.lado !== alvo.lado) atk.danoAgora += v;
  // PRIMITIVA dano armazenado — todo aliado do alvo com acumulador guarda o dano sofrido.
  for (const x of st.lados[alvo.lado].units) {
    const arm = ef(x, 'armazenaDano');
    if (arm && x.vivo) arm.acc = (arm.acc || 0) + v;
  }
  // PRIMITIVA thorns (§109, Mnevis): quem carrega refleteDano devolve v FIXO ao atacante. O golpe de reflexo usa slot
  // 'reflexo' e NÃO re-reflete (guarda contra loop entre dois portadores). Só se o dano de fato entrou (v > 0).
  const refl = ef(alvo, 'refleteDano');
  if (refl && v > 0 && slot !== 'reflexo' && atk && atk.vivo && atk.lado !== alvo.lado) {
    log(st, { tipo: 'efeito', origem: alvo.key, alvo: atk.key, efeito: 'refleteDano' });
    bater(st, alvo, atk, refl.v, 'afetado', 'reflexo', { semContra: true, semIntercepta: true, semRedirect: true });
  }
  // acorda com dano de Habilidade/Milagre
  if (ef(alvo, 'adormecido') && (slot === 'habilidade' || slot === 'milagre')) {
    alvo.efeitos = alvo.efeitos.filter(e => e.type !== 'adormecido');
    log(st, { tipo: 'acordar', alvo: alvo.key });
  }
  if (alvo.hp === 0) { matar(st, atk, alvo); return v; }
  // PRIMITIVA contra-atacar — quem carrega 'contraAtaca' revida golpe de alvo único.
  const ca = ef(alvo, 'contraAtaca');
  if (ca && unico && !semContraEf && atk && atk.vivo && atk.lado !== alvo.lado && (!ca.contraClasse || classe === ca.contraClasse) && (!ca.protege || ca.protege === alvo.uid || ca.protege === 'time')) {   // contraClasse (F1.6, Atena): revida SÓ golpe da classe X. §111: semContraEf barra pela Ação Perfeita. §132: um contraAtaca DELEGADO (protege=outro) NÃO self-dispara no portador — só o revide-por-aliado abaixo o usa
    log(st, { tipo: 'efeito', origem: alvo.key, alvo: atk.key, efeito: 'contraAtaca' });
    bater(st, alvo, atk, ca.v, 'afetado', 'contra', { semContra: true });
    if (ca.contra === 'unico') alvo.efeitos = alvo.efeitos.filter(e => e !== ca);
  }
  // §132 (Guan Yu, M7): contra-ataque DELEGADO — um ALIADO do alvo carrega contraAtaca com protege==alvo (ou 'time')
  // e revida por ele. Sujeito trocado do contraAtaca-self acima (§106): o protetor bate, não o atingido. semContra corta o loop.
  if (unico && !semContraEf && atk && atk.vivo && atk.lado !== alvo.lado) {
    for (const prot of st.lados[alvo.lado].units) {
      if (prot === alvo || !prot.vivo) continue;
      const cd = ef(prot, 'contraAtaca');
      if (cd && (cd.protege === alvo.uid || cd.protege === 'time') && (!cd.contraClasse || classe === cd.contraClasse)) {
        log(st, { tipo: 'efeito', origem: prot.key, alvo: atk.key, efeito: 'contraAtaca' });
        bater(st, prot, atk, cd.v, 'afetado', 'contra', { semContra: true });
      }
    }
  }
  // aoSerAtingido — reação passiva a SER ATINGIDO por golpe de habilidade inimiga. O SUJEITO do evento é o ATACANTE
  // (entregue pelo evento, não escolhido). quem:self = o alvo reage; quem:aliado = um aliado do alvo reage. `contra`
  // lê o golpe (classe/elem/…). `faz` roda no reator (self/lado, BUFF-only — a garantia da F1.2.5 fica INTACTA);
  // `noAtacante` roda no ATACANTE via a MESMA máquina (rodarFaz, sujeito trocado), com DoT/debuff permitido — o alvo
  // vem do evento, como a Hera (§54/§55). Só slot de ataque real (não contra-ataque/DoT) e só se o alvo sobreviveu.
  if (atk && atk.vivo && atk.lado !== alvo.lado && SLOTS_ATAQUE.includes(slot)) {
    for (const r of st.lados[alvo.lado].units) {
      if (!r.vivo) continue;
      const rel = r === alvo ? 'self' : 'aliado';
      const g = kitDe(st, r); const p = g && g.passiva;
      if (!p || !Array.isArray(p.fx)) continue;
      for (const f of p.fx) {
        if (f.gatilho !== 'aoSerAtingido' || f.quem !== rel) continue;
        if (f.contra && !contraCasou(f.contra, golpe)) continue;
        if (f.estado && !estadoOK(f.estado, r, st)) continue;
        if (f.faz) rodarFaz(st, r, f.faz);
        if (f.noAtacante && atk.vivo) rodarFaz(st, atk, f.noAtacante, r.key);   // sujeito = atacante; crédito = reator (padrão Hera)
      }
    }
  }
  // §135 (Raijin, Ritmo do Trovão): CADA alvo atingido pelo dono gera contador no pool do lado. Gancho no bater
  // (por-GOLPE, ≠ por-ATAQUE do Susanoo §126 — a fratura da preposição §126). Só golpe inimigo real.
  if (atk && atk.lado !== alvo.lado) {
    const ga = kitDe(st, atk), pa = ga && ga.passiva;
    if (pa && Array.isArray(pa.fx)) for (const fp of pa.fx) if (fp.gatilho === 'geraContadorPorGolpe') addContadorLado(st, atk.lado, fp.contador, fp.v || 1, fp.max != null ? fp.max : null, atk);
  }
  return v;
}

function matar(st, atk, alvo, opts = {}) {
  // PRIMITIVA Vida Extra — revive no ato, antes de a morte se concretizar. EXECUÇÃO fura vidaExtra
  // (execução ELIMINA, não é golpe letal; o Sun Wukong precisa de imunidade DEDICADA — §47).
  if (!opts.execucao && alvo.vidaExtra) {
    const hp = alvo.vidaExtra.hp; alvo.vidaExtra = null;
    alvo.hp = hp; alvo.shield = 0;
    log(st, { tipo: 'revive', alvo: alvo.key, valor: hp });
    return;
  }
  // PRIMITIVA antirevive (source geral) — snapshot NO ATO da morte: se a unidade cai carregando um
  // marcador `naoRevive` (efeito/dot com a propriedade — ex.: Marca da Morte da Hel, Livro do Yan Wong),
  // o flag persiste e o gate no revive-site a segura. Limpar o marcador ANTES de cair libera o revive
  // (contra-jogo). vidaExtra já retornou acima: quem sobrevive ao letal não morreu — nada a travar.
  if (alvo.efeitos.some(e => e.naoRevive || e.type === 'antiRevive') || alvo.dots.some(d => d.naoRevive)) alvo.naoRevive = true;   // 'antiRevive' (F1.6, Iansã): debuff PROATIVO nos vivos — quem cai carregando-o não revive (impede revive por N turnos)
  if (!alvo.naoRevive) {   // A (F1.8): quem cai carregando um contador declarado antiReviveContador (Ah Puch: Podridão) não revive. Snapshot ANTES de limpar os contadores; incondicional (não exige o declarante vivo — a prosa não o exige)
    for (const lado of st.lados) for (const x of lado.units) { const g = kitDe(st, x), p = g && g.passiva;
      if (p && Array.isArray(p.fx)) for (const f of p.fx) if (f.gatilho === 'antiReviveContador' && (alvo.contadores[f.contador] || 0) > 0) alvo.naoRevive = true; }
  }
  // §118 (M3, Ammit): quem o MATADOR abate não revive — keyed pela passiva do atk (não pelo que a vítima carrega, ≠ o snapshot acima). Alcance cross-side (carimba o MORTO), mas sem dano: é flag, na mesma zona do snapshot de naoRevive
  if (atk && atk.vivo) { const ga = kitDe(st, atk), pa = ga && ga.passiva; if (pa && Array.isArray(pa.fx) && pa.fx.some(f => f.gatilho === 'abateNaoRevive')) alvo.naoRevive = true; }
  // §123 (Mimir): o próprio dono declara-se irrevivível — self-direction do naoRevive (§119). Keyed pela passiva do MORTO (não do matador ≠ abateNaoRevive), na mesma zona do snapshot
  { const gm = kitDe(st, alvo), pm = gm && gm.passiva; if (pm && Array.isArray(pm.fx) && pm.fx.some(f => f.gatilho === 'naoRevivivel')) alvo.naoRevive = true; }
  // `estados` (F2.0): SNAPSHOT dos status do morto NO ATO da queda — capturado ANTES do clear abaixo. O §106 testado:
  // o `queda` NÃO carregava o estado-na-morte, então a condição "morrer Encharcado/Envenenado" não caía do log de
  // graça; levar o snapshot ao evento a torna um predicado sobre o log (sem o avaliador re-observar cada turno).
  const estadosNaQueda = [...alvo.efeitos.map(e => e.type), ...alvo.dots.map(d => d.nome)];
  alvo.vivo = false; alvo.hp = 0; alvo.efeitos = []; alvo.dots = []; alvo.shield = 0; alvo.contadores = {};   // hp=0 tb na execução (matava com hp>0): mantém o invariante morto⟹hp=0 (exposto pelo 1º kit de execução, Fenrir)
  // `matador` (F2.0): quem desferiu o golpe letal, quando há um. O motor já conhece o atk aqui (o §118
  // abateNaoRevive é keyed por ele); levá-lo ao evento faz a condição "abate pelo próprio lado" (fogo amigo:
  // matador e alvo no MESMO lado) cair como predicado sobre o log, sem rastreio novo (§106). Ausente em morte
  // sem golpe (DoT sem atk, tempo).
  { const ev = opts.execucao ? { tipo: 'queda', alvo: alvo.key, execucao: true } : { tipo: 'queda', alvo: alvo.key };
    if (atk && atk.key) ev.matador = atk.key;
    if (estadosNaQueda.length) ev.estados = estadosNaQueda;
    log(st, ev); }
  // gatilho porExecucao (F1.9, Yan Wong §89) — morte por EXECUÇÃO de um inimigo: o lado OPOSTO ao morto reage (1 orbe).
  // Uniforme: qualquer execução (Livro, executaAbaixoDe), não só a do dono — leitura literal de "por execução".
  if (opts.execucao) {
    for (const x of st.lados[1 - alvo.lado].units) {
      if (!x.vivo) continue;
      const g = kitDe(st, x); const p = g && g.passiva;
      if (p && Array.isArray(p.fx)) for (const f of p.fx) if (f.gatilho === 'porExecucao') rodarFaz(st, x, f.faz);
    }
  }
  // gatilho aoCair quem:'self' — o PRÓPRIO que caiu reage (Nezha: revive próximo turno). APÓS a limpeza dos
  // efeitos (a ordem é a rede: renasce sem os efeitos que tinha ao cair). A unidade nunca sai do array.
  { const g = kitDe(st, alvo); const p = g && g.passiva;
    if (p && Array.isArray(p.fx)) for (const f of p.fx) {
      if (f.gatilho === 'aoCair' && f.quem === 'self' && (!f.estado || estadoOK(f.estado, alvo, st))) rodarFaz(st, alvo, f.faz);
    } }
  // aoCair quem:'inimigo' — matador-bound: o MATADOR (atk vivo) reagiu à morte de um inimigo. Mesma posição do
  // hardcode antigo do zeus. Roda o `faz` no reator (o matador).
  if (atk && atk.vivo) {
    const g = kitDe(st, atk); const p = g && g.passiva;
    if (p && Array.isArray(p.fx)) for (const f of p.fx) {
      if (f.gatilho === 'aoCair' && f.quem === 'inimigo' && (!f.estado || estadoOK(f.estado, atk, st))) rodarFaz(st, atk, f.faz);
    }
  }
  // aoCair quem:'qualquerInimigo' — QUALQUER morte de um inimigo (NÃO matador-bound): todo reator vivo do lado
  // OPOSTO ao caído reage, tenha matado ou não. Voz passiva da planilha ("quando um inimigo é derrotado" —
  // hades/iansa/morrigan/ahpuch) vs "ao derrotar" (matador, quem:'inimigo' — zeus). Dispara mesmo SEM atk (morte
  // por DoT/execução/Livro). Coexiste com 'inimigo': um dono com os DOIS dispara os dois quando ELE mata (dois
  // faz distintos) — cada gatilho é uma declaração independente, o motor não deduplica (§49).
  for (const r of st.lados[1 - alvo.lado].units) {
    if (!r.vivo) continue;
    const g = kitDe(st, r); const p = g && g.passiva;
    if (p && Array.isArray(p.fx)) for (const f of p.fx) {
      if (f.gatilho === 'aoCair' && f.quem === 'qualquerInimigo' && (!f.estado || estadoOK(f.estado, r, st))) rodarFaz(st, r, f.faz);
    }
  }
  reagirAoCairAliado(st, alvo.lado);   // aoCair quem:'aliado' — reatores do MESMO lado do caído (Khnum cura ao perder aliado)
  // §136 (Khonshu, M3): marca-retaliação — se o MATADOR carrega 'retaliacao' e a vítima era do lado OPOSTO (um aliado
  // do marcador), o matador sofre v de dano PURO. Dano DENTRO do matar (o desenho do §118), keyed pela marca no atk.
  // Cross-side gate (alvo.lado !== atk.lado) exclui o fogo-amigo (dominar) — só "derrubar um aliado [do marcador]" conta.
  if (atk && atk.vivo && alvo.lado !== atk.lado) {
    const rt = ef(atk, 'retaliacao');
    if (rt) { log(st, { tipo: 'dano', origem: atk.key, alvo: atk.key, valor: -rt.v, kind: 'puro' }); atk.hp = Math.max(0, atk.hp - rt.v); if (atk.hp === 0) matar(st, null, atk); }
  }
  checarFim(st);
}

// aoCair quem:'aliado' — QUALQUER queda de unidade no MESMO lado: todo reator vivo do lado do caído reage.
// Simétrico ao 'qualquerInimigo' (lado oposto). O caído já está morto (vivo=false), então nunca reage à
// própria queda — isso é o 'self' (§76, Khnum).
function reagirAoCairAliado(st, lado) {
  for (const r of st.lados[lado].units) {
    if (!r.vivo) continue;
    const g = kitDe(st, r); const p = g && g.passiva;
    if (p && Array.isArray(p.fx)) for (const f of p.fx) {
      if (f.gatilho === 'aoCair' && f.quem === 'aliado' && (!f.estado || estadoOK(f.estado, r, st))) rodarFaz(st, r, f.faz);
    }
  }
}

// ----------------------------------- PRIMITIVA interceptar
// Um protetor vivo com efeito 'intercepta' cobrindo o alvo (ou qualquer aliado).
function acharInterceptador(st, alvo, atk) {
  if (atk && atk.lado === alvo.lado) return null;   // só golpe inimigo é interceptado
  return st.lados[alvo.lado].units.find(x => {
    if (!x.vivo || x.uid === alvo.uid) return false;
    const i = ef(x, 'intercepta');
    return i && (i.protege === alvo.uid || i.protege === 'time');
  });
}

function curar(st, u, v, curador = null, via = null) {
  if (!u.vivo) return;
  if (ef(u, 'noHeal')) { log(st, { tipo: 'bloqueio', alvo: u.key, motivo: 'sem_cura' }); return; }
  // passiva Brigid (declarativa, gatilho bonusCura): +v se a condição quandoCura vale. §39: só INIMIGO com
  // Queimadura conta (não aliado) — travado no eixo `inimigoTem` (lê o lado oposto ao curado).
  // `curador` = quem fez a cura (Nefertem lê a FACÇÃO dele); null quando a origem não é uma unidade (regen).
  // `via` = 'regen' quando a cura é um tick de regeneração (Chaac: "regenerações curam +N").
  const bonus = bonusCuraDeclarativo(st, u, curador, via);
  const antes = u.hp;
  u.hp = Math.min(u.maxHp, u.hp + v + bonus);
  if (u.hp > antes) { log(st, { tipo: 'cura', alvo: u.key, valor: u.hp - antes }); u.curadoAgora = true; }   // §97: ESCRITOR do rastreio — só cura REAL (hp subiu; bloqueada/no teto não conta)
  // gatilho aoCurar (F1.2 sessão 10) — quando um aliado é curado, o DONO reage com um faz NO CURADO (Hera:
  // +10 escudo). Difere do aoCair: o SUJEITO do evento (o curado `u`) NÃO é o dono; o efeito vai nele, o
  // crédito (passiva) vai no dono. Difere do bonusCura: dispara efeito DEPOIS, não modifica a magnitude.
  for (const dono of st.lados[u.lado].units) {
    if (!dono.vivo) continue;
    const g = kitDe(st, dono); const p = g && g.passiva;
    if (!p || !Array.isArray(p.fx)) continue;
    for (const f of p.fx) if (f.gatilho === 'aoCurar' && (!f.estado || estadoOK(f.estado, dono, st))) rodarFaz(st, u, f.faz, dono.key);
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

// executa o `faz` de um gatilho de turno para o dono `u`. Alvo FIXO (self = o dono; orbGain = o lado),
// sem escolha nem seletor. Atribui os eventos gerados ao dono (passiva:u.key) para o narrador saber a origem.
// cdShift "a recarga mais longa DO TIME" (F1.6, Huangdi): acha a MAIOR recarga cruzando o LADO inteiro (inclui o
// próprio dono — "do time" não o exclui) e a desloca por v; UMA só por chamada (a prosa é singular → auto-limitante).
// Desempate DETERMINÍSTICO (obrigatório: senão quebra replay/cadeia em silêncio): menor índice de unidade, depois
// ordem de slot (basico → habilidade → milagre). Iterar nessa ordem trocando só em `>` ESTRITO faz o 1º empatado vencer.
function cdShiftMaiorDoTime(st, lado, v) {
  const ORDEM = ['basico', 'habilidade', 'milagre'];
  let alvoU = null, alvoK = null, maior = 0;
  for (const x of st.lados[lado].units) {
    if (!x.vivo) continue;
    for (const k of ORDEM) if ((x.cd[k] || 0) > maior) { maior = x.cd[k]; alvoU = x; alvoK = k; }
  }
  if (alvoU) { alvoU.cd[alvoK] = Math.max(0, alvoU.cd[alvoK] + v); log(st, { tipo: 'cd', lado, alvo: alvoU.key, valor: v }); }
}

// Executor MÍNIMO (não o aplicarFx completo): gatilho de turno não tem ability nem alvo escolhido. Reproduz
// exatamente os hardcodes antigos de ra (addContador) e ganesha (orbGain via sortearElemento — mesmo rng).
// rodarFaz executa um `faz` na unidade `u` (o SUJEITO: o dono no porTurno, o reator no aoCair, o curado no
// aoCurar). `tagKey` = de quem é a passiva no evento (default = u; no aoCurar difere: efeito no curado, crédito
// à Hera). Executor FECHADO aos fx turno-seguros (V.fxTurno) — não é o aplicarFx geral.
function rodarFaz(st, u, faz, tagKey) {
  const antes = st.log.length;
  const l = st.lados[u.lado];
  for (const f of faz) {
    if (f.t === 'contador') { const alvos = f.alvoHp ? selByHp(st, u, f.alvoHp) : [u]; for (const t of alvos) addContador(st, t, f.nome, f.v, f.max != null ? f.max : null); }   // §114 (Izanami passiva): alvoHp AUTO-seleciona (o inimigo de maior HP) — turno-seguro = "o jogador não escolhe", não "só o próprio lado" (o 1º porTurno que toca inimigo; a Maldição é contador neutro, não debuff)
    else if (f.t === 'orbGain') {
      const tipos = [...new Set(l.units.filter(x => x.vivo).map(x => x.elem))];
      for (let i = 0; i < f.n; i++) l.orbs[f.para || sortearElemento(st, tipos)]++;   // para = elemento FIXO (sem rng)
      log(st, f.para ? { tipo: 'orbe', lado: u.lado, valor: f.n, para: f.para } : { tipo: 'orbe', lado: u.lado, valor: f.n });
    }
    else if (f.t === 'reviveProximoTurno') {   // Nezha: retorna no turno seguinte, 1× por partida. Só p/ quem caiu.
      if (!u.vivo && !u.renasceu) {
        if (u.naoRevive) log(st, { tipo: 'bloqueio', alvo: u.key, motivo: 'nao_revive' });   // antirevive fura o auto-renascimento tb, não só o revive-por-aliado
        else { u.renasceu = true; u.pendenteRenascer = true; u.reviveHp = f.hp; log(st, { tipo: 'passiva', origem: u.key, valor: f.hp }); }
      }
    }
    else if (f.t === 'dot') aplicarDot(st, u, f.nome, f.v, f.dur);   // só no `noAtacante` (aoSerAtingido): DoT no ATACANTE — nunca no `faz` (o validador barra dot no faz)
    else if (f.t === 'shield') {   // Hera (aoCurar): escudo no curado (self). escopo:'time' escuda o lado (Brahma 'Defesa Destrutível' na abertura)
      const alvos = f.escopo === 'time' ? l.units.filter(x => x.vivo) : [u];
      for (const t of alvos) { t.shield += f.v; log(st, { tipo: 'escudo', alvo: t.key, valor: f.v }); }
    }
    else if (f.t === 'heal') {   // F1.2.5: cura self OU own-lado (nunca alvo ESCOLHIDO). escopo 'time' = todo o lado vivo do sujeito.
      // §103: alvoHp AUTO-seleciona 1 alvo por HP (Deméter porTurno: o aliado mais ferido) — segue turno-seguro (o jogador não escolhe).
      const alvos = f.alvoHp ? selByHp(st, u, f.alvoHp) : (f.escopo === 'time' ? l.units.filter(x => x.vivo) : [u]);
      for (const t of alvos) curar(st, t, f.v, u);   // curador = o sujeito do faz
    }
    else if (f.t === 'apply') {   // F1.2.5: aplica um BUFF (⊆ V.buffs) em self OU own-lado. Nunca controle/debuff (exigiria alvo inimigo).
      const alvos = f.escopo === 'time' ? l.units.filter(x => x.vivo) : [u];
      for (const t of alvos) aplicar(st, t, { ...f.eff });
    }
    else if (f.t === 'vidaExtra') {   // F1.6: rede de sobrevivência no self (Hércules 'Coragem Mortal') — arma o vidaExtra 1× que o `matar` consome ao golpe letal. Alvo fixo self|time, como heal/apply.
      const alvos = f.escopo === 'time' ? l.units.filter(x => x.vivo) : [u];
      for (const t of alvos) { t.vidaExtra = { hp: f.hp }; log(st, { tipo: 'efeito', alvo: t.key, efeito: 'vidaExtra' }); }
    }
    else if (f.t === 'cdShift' && f.soMaiorDoTime) cdShiftMaiorDoTime(st, u.lado, f.v);   // F1.6 (Huangdi porTurno): "a recarga mais longa do time −1". VARRE p/ ESCOLHER onde agir, mas o alvo é o PRÓPRIO lado e o jogador não escolhe nada — a garantia do FX_TURNO (sem alvo escolhido pelo jogador) fica INTACTA. Distinção a lembrar: varrer-p/-escolher ≠ varrer-p/-alvejar.
    else if (f.t === 'selfHp') { u.hp = Math.max(1, u.hp + f.v); log(st, { tipo: 'dano', origem: u.key, alvo: u.key, valor: -f.v, kind: 'puro' }); }   // F1.8 (Kagutsuchi porTurno): "perde N de HP por turno" — dreno no próprio dono, piso 1 (nunca se auto-mata)
    else if (f.t === 'zeraCd') { for (const k in u.cd) u.cd[k] = 0; log(st, { tipo: 'cd', lado: u.lado, origem: u.key, valor: 0 }); }   // §118 (Ares aoCair inimigo): "abati → minha recarga volta". Só o PRÓPRIO dono (self); zera o cd que o agir acabou de setar (o Massacre volta p/ o próximo turno)
    else if (f.t === 'intercepta') {   // §109 (Mnevis): a passiva re-aplica a intercepta protegendo um aliado NOMEADO (protege por CHAVE de deus). contra:'unico' + porTurno = "primeiro golpe por turno" de graça.
      let protege = f.protege;
      if (protege && protege !== 'time') { const al = l.units.find(x => x.key === protege && x.vivo); protege = al ? al.uid : null; }
      if (protege) aplicar(st, u, { type: 'intercepta', protege, dur: f.dur, contra: f.contra || 'todos', origem: u.uid });   // sem aliado nomeado vivo, não arma nada
    }
  }
  const tag = tagKey || u.key;
  for (let i = antes; i < st.log.length; i++) if (st.log[i].passiva === undefined) st.log[i].passiva = tag;
}

// executa o payload `noAtor` do aoAgirSobEfeito NO ATOR (o inimigo que agiu — sujeito do evento), crédito ao `dono`
// (quem aplicou o efeito). dmg É permitido aqui, ao contrário do `noAtacante` do aoSerAtingido: o gatilho é por
// AÇÃO, não por golpe — dano no ator NÃO re-dispara aoAgirSobEfeito (que só corre em `agir`), então não há laço.
// O slot 'torpor' fica fora de SLOTS_ATAQUE, então o dano tampouco dispara o aoSerAtingido do ator (§56).
function rodarNoAtor(st, dono, ator, payload) {
  for (const f of payload) {
    if (f.t === 'dmg') { const feito = bater(st, dono, ator, f.v, 'puro', 'torpor', {}); if (f.dreno) curar(st, dono, feito, dono); }   // §135 (Shuten): dreno = "rouba HP" (lifesteal — o dano vira cura no dono). O contra do noAtor já não recursa (§F1.4)
    else if (f.t === 'dot') aplicarDot(st, ator, f.nome, f.v, f.dur, dono.uid);
    else if (f.t === 'apply') aplicar(st, ator, { ...f.eff, origem: dono.uid });
    else if (f.t === 'roubaOrbe') { const li = st.lados[ator.lado]; let n = 0; for (let i = 0; i < (f.n || 1); i++) { const el = ELEMS.filter(x => li.orbs[x] > 0).sort((a, b) => li.orbs[b] - li.orbs[a])[0]; if (!el) break; li.orbs[el]--; n++; if (f.rouba) st.lados[dono.lado].orbs[el]++; } if (n) { log(st, { tipo: 'orbe', lado: ator.lado, valor: -n }); if (f.rouba) log(st, { tipo: 'orbe', lado: dono.lado, valor: n }); } }   // §135 (Shuten): roubaOrbe REATIVO no noAtor — "rouba 1 orbe dele" quando o ator age
  }
}

// §130 (Dionísio): controles que uma passiva `negaOrbe` VIVA do lado OPOSTO a `lado` barra na renda de orbe de `lado`.
// Cross-side (a passiva do inimigo afeta a MINHA renda), lido no iniciarTurno. Vazio = nada além da exclusão base.
function controlesNegadosPorInimigo(st, lado) {
  const out = [];
  for (const u of st.lados[1 - lado].units) {
    if (!u.vivo) continue;
    const g = kitDe(st, u), p = g && g.passiva;
    if (p && Array.isArray(p.fx)) for (const f of p.fx) if (f.gatilho === 'negaOrbe' && Array.isArray(f.a)) out.push(...f.a);
  }
  return out;
}
function iniciarTurno(st) {
  const l = st.lados[st.ativo];
  // §138 (Dagda M2/A2): se o lado ativo começa o turno em passe forçado, registra o evento (visível — o jogador que
  // perde a ação vê por quê; F0.7). O turno segue normal (os nove tickam); só nenhuma unidade poderá agir.
  for (const u of l.units) if (u.vivo && ef(u, 'passeForcado')) log(st, { tipo: 'bloqueio', alvo: u.key, motivo: 'passe_forcado' });   // por-unidade (gramática de eventos exige alvo); visível — o jogador vê que aquela unidade não age
  // §97 (Tsukuyomi): PROMOTOR do rastreio de cura — 'agora' vira 'antes', 'agora' zera. Roda p/ TODAS as unidades
  // dos DOIS lados a cada início de turno (não só a ativa): a leitura é OFENSIVA e cruza o lado, então a janela
  // 'curado no turno anterior' tem de ser de um turno só, global. ANTES da regen deste turno (que reescreve 'agora').
  for (const lado of st.lados) for (const u of lado.units) { u.curadoAntes = u.curadoAgora; u.curadoAgora = false; }
  // §111 (Krishna): promove o rastreio de DANO CAUSADO — MESMA forma de dois tempos do §97, ANCORA DIFERENTE. O
  // curadoAntes é global (dois lados): o sujeito lido (o inimigo curado) age no turno IMEDIATAMENTE anterior, então a
  // janela de um turno cabe. O danoAntes lê um ALIADO, que age na cadência do PRÓPRIO time (o turno anterior DELE, não
  // o do inimigo no meio) — logo promove SÓ o lado ATIVO, ancorado ao dono (como o resetador §88). Gêmeo aparente, âncora oposta (§100/§110).
  for (const u of l.units) { u.danoAntes = u.danoAgora; u.danoAgora = 0; }
  const primeiro = !l.estreou;     // "turno 1" é por LADO, não global
  l.estreou = true;
  l.converteu = false;
  l.dividaLivre = 0;               // a dívida do turno anterior já foi quitada no fimTurno

  for (const u of l.units) {
    if (u.pendenteRenascer) { u.pendenteRenascer = false;   // Nezha 48 = 40% de 120 (F1.0c). Aura (B) é DINÂMICA: checa no ato do renascer (o Cérberus pode ter caído no intervalo)
      if (reviveBloqueadoPorAura(st, u)) log(st, { tipo: 'bloqueio', alvo: u.key, motivo: 'nao_revive' });
      else { u.vivo = true; u.hp = u.reviveHp || 48; log(st, { tipo: 'revive', alvo: u.key, valor: u.hp, passiva: u.key }); } }
    if (!u.vivo) continue;
    u.agiu = false;
    u.golpeUnicoNoTurno = false;   // F1.9 (Bastet §88): RESETADOR — no turno do DONO, deixando o flag armado para o turno INIMIGO seguinte (quando o golpe chega). Resetar no turno do atacante daria a proteção 2× por rodada num hot-seat
    u.controleNoTurno = false;   // §131 (Loki): mesmo resetador, eixo controle
    // regra 3 — DoT no início, ANTES de agir
    for (const d of u.dots) {
      const dano = d.v + ampDot(st, d.nome) + (d.escala ? escalaContagem(st, u, u, d.escala) : 0);   // amplificaDot (F1.8, Kagutsuchi): +v em todo tick de `nome` no campo. §114 (Izanami): escala lê o contador do PRÓPRIO portador (u) via o MESMO escalador do dano de habilidade — composição, não caminho próprio
      u.hp = Math.max(ef(u, 'pisoVida') ? 1 : 0, u.hp - dano);   // o piso também segura o DoT
      log(st, { tipo: 'dot', alvo: u.key, efeito: d.nome, valor: dano });
      if (u.hp === 0) { matar(st, null, u); break; }
    }
    if (!u.vivo) continue;
    const rg = ef(u, 'regen');
    if (rg) curar(st, u, rg.v, null, 'regen');   // tick de regeneração: via='regen' (Chaac lê isto no bonusCura)
    // regra 4 — recargas descontam no início do turno do dono
    for (const k in u.cd) if (u.cd[k] > 0) u.cd[k]--;
  }
  // §117 (M1) — dispara os payloads AGENDADOS: pass próprio, unidades VIVAS em ordem de índice (o desempate padrão cai
  // de graça daqui). Alvo/escopo já fixados no lançamento → sem escolha do jogador, turno-seguro. Só o lado ativo.
  for (const u of l.units) {
    if (!u.vivo || !u.pendente.length) continue;
    const fila = u.pendente; u.pendente = [];
    for (const p of fila) aplicarFx(st, u, p.agenda, { alvo: p.alvo, slot: 'habilidade' }, []);
  }
  // geração de orbes. Elemento sorteado entre os tipos do time (pode vir tipo
  // que não serve — estilo NA). Abertura da partida: quem abre recebe só 1
  // (desvantagem de iniciativa); todo turno seguinte rende = unidades vivas.
  const vivos = l.units.filter(u => u.vivo);
  const negadosPorInimigo = controlesNegadosPorInimigo(st, st.ativo);   // §130 (Dionísio): controles que uma passiva negaOrbe do LADO INIMIGO barra na renda deste lado
  const geram = vivos.filter(u => !ef(u, 'adormecido') && !ef(u, 'submerso') && !ef(u, 'dominado') && !negadosPorInimigo.some(c => ef(u, c)));
  const tipos = [...new Set(vivos.map(u => u.elem))];
  const nOrbs = st.aberturaFeita ? geram.length : 1;
  for (let i = 0; i < nOrbs; i++) {
    const t = sortearElemento(st, tipos);
    l.orbs[t]++;
  }
  if (!st.aberturaFeita) { st.aberturaFeita = true; log(st, { tipo: 'abertura', lado: st.ativo, valor: 1 }); }
  if (geram.length < vivos.length) log(st, { tipo: 'controle', lado: st.ativo, valor: vivos.length - geram.length });
  // gatilhos de turno declarativos (F1.2 sessão 4): porTurno roda todo turno; abertura só no 1º (primeiro)
  for (const u of l.units) {
    if (!u.vivo) continue;
    const g = kitDe(st, u); const p = g && g.passiva;
    if (!p || !Array.isArray(p.fx)) continue;
    for (const f of p.fx) {
      if (f.estado && !estadoOK(f.estado, u, st)) continue;   // estado compõe com o gatilho de turno
      if (f.gatilho === 'porTurno' && (!f.estado || estadoOK(f.estado, u, st))) rodarFaz(st, u, f.faz);   // §109: estado gateia (Mnevis: só com Rá no time)
      else if (f.gatilho === 'abertura' && primeiro) rodarFaz(st, u, f.faz);
      else if (f.gatilho === 'aCadaN' && f.faz && st.turno % f.n === 0) rodarFaz(st, u, f.faz);   // F1.8 (Inari): a cadência ABSOLUTA também dispara um `faz` (não só zera custo) — o outro ramo do aCadaN
      else if (f.gatilho === 'sinergiaAliado' && primeiro) {   // F1.8 (Inari): no início, se o aliado NOMEADO está no time, dá-lhe o contador (Kitsune começa com 1 Cauda)
        const amigo = l.units.find(x => x.key === f.aliado);
        if (amigo) { addContador(st, amigo, f.contador, f.v, null); }
      }
    }
  }
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
  // PRIMITIVA contagem de morte (Livro) — EXECUTA quem chegou ao fim da contagem. F1.9 (Yan Wong §89): a morte-por-Livro
  // É execução (opts.execucao) — só a execução entrega morte DEFINITIVA (fura vidaExtra, senão a cláusula "não revive sob o
  // Livro" nunca se aplicaria: a vítima sobreviveria com 1 HP). Respeita a imunidade-a-execução (o Sun Wukong é o counter).
  for (const u of l.units) {
    const lv = ef(u, 'livro');
    if (lv && lv.dur === 1 && u.vivo) {
      if (imuneA(st, u, 'execucao')) { log(st, { tipo: 'imune', alvo: u.key, efeito: 'execucao' }); continue; }   // §89: o Livro é execução → a imunidade do Sun Wukong o salva (registrado: parece bug, é design)
      log(st, { tipo: 'efeito', alvo: u.key, efeito: 'livro' });
      matar(st, null, u, { execucao: true });   // o próprio efeito 'livro' carrega naoRevive → o snapshot em matar sela o irrevivível
    }
  }
  // §127 (Morrigan): execução DIFERIDA por LIMIAR — quem termina o turno com 'pressagio' e hp <= execLimiar é eliminado.
  // SEGUNDO caso da família de execução diferida (o 1º é o Livro, timer-intrínseco). §83/§59: NÃO fundir os dois tempos
  // (timer vs limiar-em-janela) enquanto forem só dois — a varredura dos 15 restantes (§127) NÃO achou um terceiro, então
  // fica separado. CONSUMIDORA da marca (≠ carga do Livro): se o hp nunca cai, a marca expira inócua na regra 5 abaixo.
  for (const u of l.units) {
    const pg = ef(u, 'pressagio');
    if (u.vivo && pg && pg.execLimiar != null && u.hp <= pg.execLimiar) {
      if (imuneA(st, u, 'execucao')) { log(st, { tipo: 'imune', alvo: u.key, efeito: 'execucao' }); continue; }   // respeita a imunidade-a-execução (§89, Sun Wukong)
      log(st, { tipo: 'efeito', alvo: u.key, efeito: 'pressagio' });
      matar(st, null, u, { execucao: true });
    }
  }
  // §135 (Kali, Dança da Aniquilação): ATAQUE RECORRENTE no fim do turno — quem carrega 'danoFimTurno' bate de graça por v
  // num inimigo vivo (1º, determinístico). Roda ANTES do desconto de duração (regra 5), então o buff ainda está presente.
  for (const u of l.units) {
    const df = u.vivo && ef(u, 'danoFimTurno');
    if (df) { const alvo = st.lados[1 - st.ativo].units.find(x => x.vivo); if (alvo) bater(st, u, alvo, df.v, 'afetado', 'basico', {}); }
  }
  // regra 5 — durações descontam no FIM do turno de quem carrega o efeito
  for (const u of l.units) {
    u.efeitos = u.efeitos.map(e => ({ ...e, dur: e.dur - 1 })).filter(e => e.dur > 0);
    u.dots = u.dots.map(d => ({ ...d, dur: d.dur - 1 })).filter(d => d.dur > 0);
  }
  // §138 (Dagda M6): RESTAURA os buffs suspensos após `restauraEm` turnos do portador. DEPOIS da regra 5 (o buff
  // resume com o dur estocado, não descontado durante a suspensão — congelado, não corroído). Os buffs voltaram por
  // aplicar/soma de escudo; nenhum leitor precisou de flag (a ausência já era universal — §138 junta-proof).
  for (const u of l.units) {
    if (!u.suspensos) continue;
    if (--u.suspensos.restauraEm > 0) continue;
    for (const e of u.suspensos.efeitos) aplicar(st, u, e);
    if (u.suspensos.shield > 0) u.shield += u.suspensos.shield;
    log(st, { tipo: 'efeito', alvo: u.key, efeito: 'suspendeBuffs', duracao: 0 });
    u.suspensos = null;
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

// aCadaN quem zera custo (F1.2 sessão 9) — payload `custoGratis` do gatilho aCadaN. NÃO é `faz` (não dispara
// efeito): é modificação de CUSTO na cadência ABSOLUTA `turno % n`. O dono é o próprio `u` (passiva do agente).
// Cuca: a cada 3 turnos o Básico não custa orbe.
function custoGratisDe(st, u, slot) {
  const g = kitDe(st, u); const p = g && g.passiva;
  if (!p || !Array.isArray(p.fx)) return false;
  for (const f of p.fx) {
    if (f.gatilho === 'aCadaN' && f.custoGratis && f.custoGratis.slot === slot && st.turno % f.n === 0) return true;
  }
  return false;
}

// ------------------------------------------------------ DISPONIBILIDADE
function acoesDe(st, u) {
  const l = st.lados[u.lado];
  const lista = [...kitDe(st, u).ab, DEFESA];   // ab vem do catálogo da partida (st.catId); DEFESA é regra universal, não deus
  return lista.map(a => {
    let cost = a.cost;
    if (a.slot !== 'defesa' && custoGratisDe(st, u, a.slot)) cost = {};   // passiva Cuca (aCadaN custoGratis)
    // RECARGA CONDICIONAL (§101, Lugh/Chang'e): a base da recarga muda enquanto uma condição de campo vale, LIDA AQUI
    // (na disponibilidade). cdSe:{estado, cd}. cd 0 = "sem recarga na condição" → dispensa o em_recarga inteiro (Lugh no
    // Dia: usa toda rodada). Chang'e (aliadoPresente, constante) só troca a base de 3 p/ 2. Uma gaveta: ler ao vivo cobre
    // o caso "permanente" (aliadoPresente é constante na partida, então ler ao vivo = constante). Ver §101.
    const cdEf = (a.cdSe && estadoOK(a.cdSe.estado, u, st)) ? a.cdSe.cd : (a.cd || 0);
    let motivo = null;
    if (a.umaVez && u.usos[a.slot]) motivo = 'ja_usou';   // F1.6 (Ísis/Shiva): habilidade "1× por partida" já gasta — trava PERMANENTE (o campo `usos` existia sem fio; agora ligado)
    else if (u.cd[a.slot] > 0 && cdEf > 0) motivo = 'em_recarga';   // cdEf 0 (sem recarga na condição) dispensa o bloqueio
    else if (!podePagar(l, cost)) motivo = 'sem_energia';
    else if (a.slot !== 'defesa') {
      const sil = ef(u, 'silenceClass');
      if (sil && sil.cls === classeDe(st, u, a) && a.slot !== 'basico') motivo = 'silenciado';
      // slot-lock: NOMEADO (SLOTS_TRAVADOS, conjunto fixo por type) OU genérico (lockSkill.slot único, legado).
      // Varre TODOS os efeitos — a unidade pode carregar mais de uma trava (ex.: Selado {Hab,Mil} + um lockSkill).
      else if (u.efeitos.some(e => (SLOTS_TRAVADOS[e.type] && SLOTS_TRAVADOS[e.type].includes(a.slot)) || (e.type === 'lockSkill' && e.slot === a.slot))) motivo = 'travada';
    }
    const passos = passosDe(u, a);
    // sem alvo válido: a habilidade EXIGE alvo escolhido mas não há nenhum (todos Inalvejáveis/Submersos). AoE
    // (passos vazio, alvo:'auto'/'todosInimigos') NÃO é barrada — ela não seleciona (§84: a área ignora Inalvejável).
    if (!motivo && a.slot !== 'defesa' && passos.length > 0 && alvosValidos(st, u, a).length === 0) motivo = 'sem_alvo';
    return { ...a, cd: cdEf, cost, classe: a.slot === 'defesa' ? 'Universal' : classeDe(st, u, a),
             passos, disponivel: !motivo, motivo };
  });
}

function podeAgir(u) {
  return u.vivo && !u.agiu && !ef(u, 'atordoado') && !ef(u, 'adormecido') && !ef(u, 'submerso') && !ef(u, 'passeForcado');
}   // §138 (Dagda M2/A2): passeForcado = perde a AÇÃO (não o turno — os nove tickam normal). NÃO é CONTROLE (não passa por imuneA/controlImmune): é tempo, não debuff no inimigo

// candidatos para o passo `i` de seleção, já excluindo quem foi escolhido antes
// F1.9: o dono PODE mirar Inalvejáveis? passiva ignoraInalvejavel escopo self (só o dono) ou time (qualquer aliado
// vivo dá o override ao lado — Boitatá). Estrutura espelha bonusDanoDeclarativo (§36). A flag de habilidade é checada à parte.
function temIgnoraInalvejavel(st, u) {
  for (const x of st.lados[u.lado].units) {
    if (!x.vivo) continue;
    const g = kitDe(st, x), p = g && g.passiva;
    if (!p || !Array.isArray(p.fx)) continue;
    for (const f of p.fx) {
      if (f.gatilho !== 'ignoraInalvejavel') continue;
      if ((f.escopo || 'self') === 'self' && x !== u) continue;
      return true;
    }
  }
  return false;
}
// §121 (M2): um lado tem iniciativa PERMANENTE (Exu/Hermes: "age primeiro")? Lido só no SETUP (novoEstado) p/ escolher o
// starter — nunca no laço. Todas as unidades estão vivas na abertura, então sem checagem de vivo.
function temIniciativa(st, lado) {
  return st.lados[lado].units.some(u => {
    const g = kitDe(st, u), p = g && g.passiva;
    return p && Array.isArray(p.fx) && p.fx.some(f => f.gatilho === 'iniciativa');
  });
}
function alvosValidos(st, u, a, i = 0, jaEscolhidos = []) {
  const passos = a.passos || passosDe(u, a);
  const tipo = passos[i];
  if (!tipo) return [];
  let lista;
  if (tipo === 'aliado') {
    lista = st.lados[u.lado].units.filter(x => x.vivo);   // aliado NÃO filtra Inalvejável: evasão é contra o inimigo, cura aliada alcança (§84 decisão a)
  } else {
    const ignoraInalv = a.ignoraInalvejavel || temIgnoraInalvejavel(st, u) || (a.slot === 'habilidade' && !!ef(u, 'acaoPerfeita'));   // F1.9: flag de habilidade (Odin/Hórus) OU passiva (Hou Yi/Boitatá) miram o oculto. §111 (Krishna): a Ação Perfeita torna a habilidade NÃO-EVITÁVEL — é override de MIRA (§84: o não-evitável mora AQUI, não no bater)
    lista = st.lados[1 - u.lado].units.filter(x => x.vivo && !ef(x, 'submerso') && (ignoraInalv || !ef(x, 'inalvejavel')));   // Inalvejável mora AQUI (seleção), nunca no bater (§84 invariante)
    const tt = ef(u, 'taunt');
    if (tt) {
      // regra 7 — Provocar suspenso se o provocador está intocável (invulnerável/submerso/inalvejável, salvo ignore-mira)
      const prov = st.lados[1 - u.lado].units.find(x => x.uid === tt.origem);
      if (prov && prov.vivo && !ef(prov, 'invulneravel') && !ef(prov, 'submerso') && (ignoraInalv || !ef(prov, 'inalvejavel'))) lista = [prov];
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
  if (a.umaVez) u.usos[a.slot] = true;   // F1.6: marca a habilidade "1× por partida" como gasta (trava permanente em acoesDe)

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
    log(st, { tipo: 'acao', origem: u.key, slot: a.slot, opcoes: idxs });
    // §136 (Exu): MIRA-POR-OPÇÃO — se alguma opção escolhida tem `alvo` próprio (ABRIR=aliado, FECHAR=inimigo),
    // aplica CADA opção com o SEU alvo (o `opcoes` combinado só serve quando todas compartilham a mira — Lugh/Nüwa/Tanuki).
    if (idxs.some(i => a.opcoes[i] && a.opcoes[i].alvo)) {
      for (const i of idxs) if (a.opcoes[i]) aplicarFx(st, u, a.opcoes[i].fx, { ...a, alvo: a.opcoes[i].alvo || a.alvo }, alvos, escolhas);
      fx = [];   // já aplicado por-opção; o aplicarFx geral abaixo não repete
    } else {
      fx = [];
      for (const i of idxs) if (a.opcoes[i]) fx.push(...a.opcoes[i].fx);
    }
  } else {
    log(st, { tipo: 'acao', origem: u.key, slot: a.slot });
  }

  // PRIMITIVA copiar habilidade — registra a última Habilidade real usada no lado (Ísis lê isto).
  // Uma habilidade que É uma cópia não se registra: senão copiaria a si mesma em laço.
  const eCopia = Array.isArray(fx) && fx.some(e => e.t === 'copiar');
  if (slot === 'habilidade' && !a.alterna && !a.opcoes && !eCopia) l.ultHabilidade = { nome: a.nome, fx, alvoSpec: a.alvo, slot: 'habilidade' };

  aplicarFx(st, u, fx, a, alvos, escolhas);
  // gatilho aoUsarHabilidade (Passo 0) — um aliado (incl. o próprio) usou uma ação do slot; os donos do gatilho
  // no mesmo lado reagem com um faz. bragi/shiva/brahma: 'quando um aliado usa um Milagre'.
  for (const dono of l.units) {
    if (!dono.vivo) continue;
    const g = kitDe(st, dono); const p = g && g.passiva;
    if (!p || !Array.isArray(p.fx)) continue;
    for (const f of p.fx) if (f.gatilho === 'aoUsarHabilidade' && f.slot === slot && (!f.estado || estadoOK(f.estado, dono, st))) rodarFaz(st, dono, f.faz);
  }
  // gatilho aoAgirSobEfeito (F1.4) — o ATOR (u) agiu carregando um efeito/dot cujo DONO (origem = quem o aplicou)
  // tem o gatilho. O gatilho pertence a quem APLICOU (Shuten aplica Torpor e reage), NÃO a quem carrega — por isso
  // lê `origem` (uid do aplicador, já em todo apply e agora nos dots). Dispara UMA vez por AÇÃO (este `agir`): se
  // houver duas ações, dispara duas. `faz` corre no DONO (ganho self/lado); `noAtor` corre no ATOR (sujeito do evento).
  if (u.vivo) {
    for (const m of [...u.efeitos, ...u.dots]) {   // cópia: noAtor pode aplicar dot novo sem afetar a iteração
      if (m.origem == null) continue;
      const dono = st.lados[1 - u.lado].units.find(x => x.uid === m.origem && x.vivo);
      if (!dono) continue;
      const kit = kitDe(st, dono); const pp = kit && kit.passiva;
      if (!pp || !Array.isArray(pp.fx)) continue;
      const marca = m.type || m.nome;
      for (const f of pp.fx) {
        if (f.gatilho !== 'aoAgirSobEfeito' || f.efeito !== marca || (f.estado && !estadoOK(f.estado, dono, st))) continue;
        if (f.faz) rodarFaz(st, dono, f.faz);
        if (f.noAtor && u.vivo) rodarNoAtor(st, dono, u, f.noAtor);
      }
    }
  }
  // §111 (Krishna) — CONSOME a Ação Perfeita: ela vale para a PRÓXIMA HABILIDADE do portador; usada esta, some.
  // Depois do aplicarFx (os bater desta habilidade já a leram), só no slot habilidade (básico/milagre não gastam
  // nem herdam — "a próxima habilidade" da prosa). Krishna, que ARMA a Ação num aliado, não a carrega: não se auto-consome.
  if (slot === 'habilidade' && ef(u, 'acaoPerfeita')) { u.efeitos = u.efeitos.filter(e => e.type !== 'acaoPerfeita'); log(st, { tipo: 'efeito', alvo: u.key, efeito: 'acaoPerfeita', duracao: 0 }); }
  checarFim(st);
  return { ok: true };
}

// SELETOR POR HP (§103, Lugh/Chang'e/Deméter/Izanami): escolhe AUTO 1 unidade de um lado pelo HP absoluto — ext:'max'
// (de maior HP) ou 'min' (de menor HP / mais ferido). min e max são o MESMO mecanismo, comparador invertido. Empate →
// MENOR ÍNDICE de unidade (comparação ESTRITA: o primeiro da varredura vence), determinístico como o Huang Di — sem isso o
// replay e a arena divergem em silêncio. lado:'inimigo' = o lado oposto ao dono; 'aliado' = o do dono. É AUTO (alvo:'auto'
// no primário, ou rider num AoE/faz): o jogador não escolhe. 'mais ferido' = menor HP absoluto (≡ menor HP quando maxHp igual).
function selByHp(st, u, spec) {
  const lado = spec.lado === 'inimigo' ? 1 - u.lado : u.lado;
  const vivos = st.lados[lado].units.filter(x => x.vivo);
  if (!vivos.length) return [];
  let best = vivos[0];
  for (const x of vivos) if (spec.ext === 'max' ? x.hp > best.hp : x.hp < best.hp) best = x;
  return [best];
}

// SELETOR DO SENHOR (§107, Hanuman): o aliado DESIGNADO — o que a intercepta ativa do dono protege (protege != 'time').
// Não há segundo lugar guardando "o Senhor": ele JÁ mora no `intercepta.protege` (§102-A). Se não houver Senhor vivo (a
// intercepta expirou ou nunca existiu), cai no mais ferido — o `alvoHp` (§103) faz o fallback. Só leitura, determinístico.
function selSenhor(st, u) {
  const ic = ef(u, 'intercepta');
  if (ic && ic.protege && ic.protege !== 'time') {
    const s = st.lados[u.lado].units.find(x => x.uid === ic.protege && x.vivo);
    if (s) return [s];
  }
  return selByHp(st, u, { lado: 'aliado', ext: 'min' });   // fallback: o aliado mais ferido
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
    if (e.alvoHp) sel = selByHp(st, u, e.alvoHp);   // §103: seletor AUTO por HP (max/min de um lado) — precede escopo
    else if (e.alvoSenhor) sel = selSenhor(st, u);   // §107: o aliado designado (intercepta.protege), fallback mais ferido
    else if (e.escopo === 'self') sel = [u];
    else if (escopo === 'time') sel = l.units.filter(x => x.vivo);
    else if (escopo === 'todosInimigos') sel = inimigos.filter(x => x.vivo);
    else if (escopo === 'aliadoCaido') sel = alvos.filter(x => !x.vivo);
    else if (escopo === 'todosCaidos') sel = l.units.filter(x => !x.vivo);
    else if (escopo === 'umCaido') { const c = l.units.find(x => !x.vivo); sel = c ? [c] : []; }   // F1.6 (Freyja): 1 aliado caído (o primeiro) — 'revive 1 caído' sem alvo escolhido
    else if (e.idx !== undefined) sel = alvos[e.idx] ? [alvos[e.idx]] : [];
    else sel = alvos;

    // contágio (Maldição de Yomi): age no CONJUNTO de uma vez (precisa do maior entre eles), não alvo a alvo
    if (e.t === 'espalha') { espalharContador(st, sel, e, u); continue; }

    // DOMINAR (§99, Afrodite/Boto): a VÍTIMA (alvos[0]) usa o Básico DELA contra um ALIADO dela (alvos[1], escolhido pelo
    // lançador). Resolve IMEDIATO no lançamento (fogo amigo forçado, sem contra/intercepta/redirect); o tag 'dominado' fica
    // `dur` turnos como resíduo (só nega orbe — o que o motor já fazia). Boto: curaCausador dreba o dano no lançador.
    if (e.t === 'dominar') {
      if (e.massa) {   // §130 (Dionísio, Bacanal): dominação em MASSA — CADA inimigo vira vítima e ataca um aliado DELE. Alvo do fogo-amigo é DETERMINÍSTICO (1º vivo ≠ ele; "você escolhe" não é modelado, como as escolhas-de-UI §123.1). Disparada pelo agendador M1 ("no próximo turno")
        for (const v of inimigos.filter(x => x.vivo)) {
          const ali = st.lados[v.lado].units.find(x => x.vivo && x !== v);
          dominarUm(st, u, v, ali, e);
        }
      } else dominarUm(st, u, alvos[0], alvos[1], e);
      continue;
    }

    // §135 (Raijin, Raio em Cadeia): dano POSICIONAL — o i-ésimo alvo SELECIONADO leva posicional[i]. Ordem de SELEÇÃO
    // (§46: a prosa "1º alvo" não diz seleção-vs-slot; a decisão do dono é ORDEM DE SELEÇÃO — o jogador controla, determinístico
    // sem regra extra). Distinto do split-igual §92 (que reparte N golpes): aqui cada posição tem seu próprio v. Além do array = 0.
    if (e.t === 'dmg' && e.posicional) {
      for (let i = 0; i < alvos.length; i++) {
        const dv = e.posicional[i];
        if (dv == null || !alvos[i] || !alvos[i].vivo) continue;
        bater(st, u, alvos[i], danoBase(st, u, alvos[i], { ...e, v: dv }, l), e.kind || 'afetado', a.slot, { unico: true, classe: classeDe(st, u, a), semContra: e.semContra });
      }
      continue;
    }
    // MULTI-GOLPE DISTRIBUÍDO (F1.9 §92, Susanoo/Babi/Hou Yi): N golpes de v repartidos entre os alvos SELECIONADOS,
    // o mais igual possível; o EXTRA vai para os PRIMEIROS selecionados (previsível — o jogador controla a ordem).
    // Cada golpe passa por danoBase (seCond per-alvo: Hou Yi +3 vs Aurora) e bater. curaMetade = metade do TOTAL (Babi).
    if (e.t === 'dmg' && e.golpes) {
      const vivos = sel.filter(x => x.vivo); const nA = vivos.length;
      if (nA > 0) {
        let total = 0;
        for (let i = 0; i < nA; i++) {
          const g = Math.floor(e.golpes / nA) + (i < e.golpes % nA ? 1 : 0);
          for (let k = 0; k < g && vivos[i].vivo; k++)
            total += bater(st, u, vivos[i], danoBase(st, u, vivos[i], e, l), e.kind || 'afetado', a.slot, { classe: classeDe(st, u, a), ignoraInvuln: e.ignoraInvuln, ignoraPiso: e.ignoraPiso, semContra: e.semContra });   // §105: semContra flui no distribuído também (§104-B: todos os executores)
        }
        if (e.curaMetade) curar(st, u, Math.floor(total / 2), u);
      }
      continue;
    }

    // F1.6 (Freyja) — fx CONDICIONAL: roda `entao` OU `senao` (arrays de fx) conforme `se`, via o próprio executor.
    // F1.9 (Hórus §87): `se` desambigua ESTRUTURALMENTE pela chave — se ∈ CONDICOES (alvoMarca, alvoDebuff…) lê o
    // ALVO via condOK; senão lê o CAMPO/self via estadoOK. As duas famílias são DISJUNTAS (valida_kit falha se cruzarem),
    // então não há heurística.
    // §126 (Anubis): a pendência §87 (AoE-por-alvo) fechou. Se a condição lê o ALVO, ramifica POR-ALVO sobre o conjunto
    // (alvos escolhidos, ou o escopo AoE quando o milagre não pede alvo) — cada alvo avalia o próprio `se`. Alvo único
    // (alvos=[um]) cai no laço uma vez → comportamento idêntico ao de antes (Freyja/Osíris/Ammit intactos).
    if (e.t === 'condicional') {
      const chave = e.se && Object.keys(e.se)[0];
      if (chave && CONDICOES[chave]) {
        const escC = e.escopo || a.alvo;
        // cada ramo roda sobre UM alvo por vez — e o `a` do ramo precisa apontar alvo ÚNICO, senão um fx sem escopo
        // próprio herdaria o alvo AoE (a.alvo='todosInimigos') e re-expandiria p/ todos (bug pego no probe §126).
        let tgts, aUnico;
        if (alvos.length) { tgts = alvos; aUnico = a.alvo; }
        else if (escC === 'todosInimigos') { tgts = inimigos.filter(x => x.vivo); aUnico = 'inimigo'; }
        else if (escC === 'time') { tgts = l.units.filter(x => x.vivo); aUnico = 'aliado'; }
        else { tgts = []; aUnico = a.alvo; }
        const aT = { ...a, alvo: aUnico };
        for (const t of tgts) { const ramo = condOK(e.se, u, t, st) ? e.entao : e.senao; if (ramo) aplicarFx(st, u, ramo, aT, [t], escolhas); }
      } else {
        const ramo = estadoOK(e.se, u, st) ? e.entao : e.senao; if (ramo) aplicarFx(st, u, ramo, a, alvos, escolhas);
      }
      continue;
    }

    for (const t of sel) {
      if (e.t === 'dmg') {
        const base = danoBase(st, u, t, e, l);
        const feito = bater(st, u, t, base, e.kind || 'afetado', a.slot, { unico, classe: classeDe(st, u, a), ignoraInvuln: e.ignoraInvuln, ignoraPiso: e.ignoraPiso, semContra: e.semContra });   // §91 (Shiva): flags de "ignora" da habilidade fluem p/ o bater — ignoraInvuln (novo) e ignoraPiso (param existia). §105 (Lugh): semContra = "não pode ser contra-atacado"
        if (e.curaMetade) curar(st, u, Math.floor(feito / 2), u);   // dreno: o próprio atacante é o curador
        if (e.curaPorAlvo) curar(st, u, e.curaPorAlvo, u);   // §127 (Hel milagre): "cura N por alvo atingido" — cura fixa por golpe (soma 5×alvos na área); o curador é o lançador
        // EXECUÇÃO (F1.3): caminho PRÓPRIO, não é dano — após o golpe, se hp <= N, ELIMINA via matar (que dispara
        // aoCair, atribui o matador, dá orbe ao Zeus). Fura o piso e o vidaExtra; respeita imunidade-a-execução.
        if (e.executaAbaixoDe != null && t.vivo && t.hp <= e.executaAbaixoDe && !imuneA(st, t, 'execucao') && (!e.execIf || condOK(e.execIf, u, t, st))) matar(st, u, t, { execucao: true });   // execIf (F1.6, Iara): filtro de STATUS na execução — "elimina só os Encharcados" (reusa condOK)
      }
      else if (e.t === 'heal') curar(st, t, e.v, u);   // curador = quem lança a habilidade
      else if (e.t === 'dot') { if (!ef(u, 'pacificado')) aplicarDot(st, t, e.nome, e.v, e.dur, u.uid, e.porContador || e.porContadorCampo || e.porContadorLado || e.porHpFaltante || e.porStatus || e.porAliadoCaido || e.porInimigoCaido ? e : null, !!e.naoRevive); }   // origem = o lançador; §114: se o dot carrega escalador, passa o próprio fx como spec (escalaContagem o lê no tique). §127 (Hel): naoRevive flui p/ o dot (Marca da Morte). Pacificar zera o DoT do pacificado
      else if (e.t === 'apply') {
        if (e.soSe && !condOK(e.soSe, u, t, st)) continue;   // F1.6 (Chaac): apply FILTRADO por status do alvo — atordoa só os Encharcados de uma área
        if (ef(t, 'invulneravel') && t.lado !== u.lado) { log(st, { tipo: 'bloqueio', alvo: t.key, motivo: 'invulneravel' }); continue; }
        aplicar(st, t, { ...e.eff, origem: u.uid });
      }
      else if (e.t === 'contador' && e.alvo !== 'self' && !e.pool) { const antes = getContador(t, e.nome); addContador(st, t, e.nome, e.v, e.max); aposAcumular(st, u, t, e, antes); }
      else if (e.t === 'vidaExtra') { t.vidaExtra = { hp: e.hp }; log(st, { tipo: 'efeito', alvo: t.key, efeito: 'vidaExtra' }); }
      else if (e.t === 'revive') reviver(st, t, e);
      else if (e.t === 'destroyShield') { if (t.shield) { log(st, { tipo: 'escudo', alvo: t.key, valor: -t.shield }); t.shield = 0; } }
      else if (e.t === 'aceleraLivro') { const lv = ef(t, 'livro'); if (lv) { lv.dur = Math.max(1, lv.dur - 1); log(st, { tipo: 'efeito', alvo: t.key, efeito: 'livro' }); } }   // F1.9 (Yan Wong §89): acelera a contagem (piso 1 — não some sem matar)
      else if (e.t === 'stripDef') t.efeitos = t.efeitos.filter(x => !BUFFS_DEF.includes(x.type));
      else if (e.t === 'stripOne') {
        const i = t.efeitos.findIndex(x => BUFFS.includes(x.type));
        if (i >= 0) { const rem = t.efeitos[i]; log(st, { tipo: 'efeito', alvo: t.key, efeito: rem.type, duracao: 0 }); t.efeitos.splice(i, 1); if (e.rouba) aplicar(st, u, { ...rem, origem: u.uid }); }   // §131 (Saci migrado): rouba=true → o buff removido vai p/ o lançador (roubo de 1 buff, ≠ realoca que move TODOS)
      }
      else if (e.t === 'stripBuffs') { t.efeitos = t.efeitos.filter(x => !BUFFS.includes(x.type)); t.shield = 0; }   // §136 (Yamato): remove TODOS os buffs (efeitos BUFFS + escudo); ≠ stripOne (um) e ≠ realoca (move)
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
    if (e.t === 'contraAtaca') {   // §132 (Guan Yu): arma o contra-ataque no dono. protege='alvo' → DELEGADO ao aliado escolhido (alvos[0]); 'time' → o lado; ausente → self (o próprio dono)
      const protege = e.protege === 'time' ? 'time' : e.protege === 'alvo' ? (alvos[0] ? alvos[0].uid : u.uid) : u.uid;
      aplicar(st, u, { type: 'contraAtaca', v: e.v, dur: e.dur, contra: e.contra || 'unico', protege, origem: u.uid });
      log(st, { tipo: 'efeito', origem: u.key, efeito: 'contraAtaca' });
      continue;
    }
    if (e.t === 'realoca') {   // §131 (M5, Loki): MOVE efeitos de uma categoria da FONTE p/ o DESTINO. Coleta+remove da fonte, aplica ao destino (reusa aplicar/aplicarDot → respeita imunidades no destino). Um mecanismo, dois usos por parâmetro
      const ehBuff = e.categoria === 'buff';
      const membro = tipo => (ehBuff ? BUFFS : DEBUFFS).includes(tipo);
      const fonte = (e.de === 'time' ? l.units : inimigos).filter(x => x.vivo);
      const dest = e.para === 'self' ? [u] : (e.para === 'time' ? l.units.filter(x => x.vivo) : inimigos.filter(x => x.vivo));
      const coletados = [];
      for (const src of fonte) {
        const fica = []; let tirou = 0;
        for (const x of src.efeitos) { if (membro(x.type)) { coletados.push({ ...x }); tirou++; } else fica.push(x); }
        src.efeitos = fica;
        if (!ehBuff && src.dots.length) { for (const d of src.dots) coletados.push({ dot: true, ...d }); tirou += src.dots.length; src.dots = []; }   // "debuff" inclui DoT (como em statusCasou/alvoDebuff)
        if (tirou) log(st, { tipo: 'efeito', alvo: src.key, efeito: e.categoria, duracao: 0 });
      }
      for (const dst of dest) for (const c of coletados) {
        if (c.dot) aplicarDot(st, dst, c.nome, c.v, c.dur, u.uid, c.escala, !!c.naoRevive);
        else aplicar(st, dst, { ...c, origem: u.uid });
      }
      continue;
    }
    if (e.t === 'passeForcado') {   // §138 (Dagda M2/A2): o time inimigo PERDE a ação do próximo turno ("o time age primeiro"). O turno ACONTECE (os nove tickam); só a ação é negada. Modelo A2 (§137): não toca st.ativo
      const alvosP = e.escopo === 'todosInimigos' ? inimigos.filter(x => x.vivo) : (e.escopo === 'time' ? l.units.filter(x => x.vivo) : alvos);
      for (const t of alvosP) { t.efeitos.push({ type: 'passeForcado', dur: e.dur || 1, origem: u.uid }); log(st, { tipo: 'efeito', origem: u.key, alvo: t.key, efeito: 'passeForcado', duracao: e.dur || 1 }); }   // visível + nomeando a origem (o dono, ex.: Dagda), p/ o jogador que perde a ação entender por quê (§138 dir.1, F0.7)
      continue;
    }
    if (e.t === 'suspendeBuffs') {   // §138 (Dagda M6): SUSPENDE (remove-e-guarda) os buffs do alvo por `dur` turnos DELE
      const alvosS = e.escopo === 'todosInimigos' ? inimigos.filter(x => x.vivo) : (e.escopo === 'time' ? l.units.filter(x => x.vivo) : alvos);
      for (const t of alvosS) {
        const buffs = t.efeitos.filter(x => BUFFS.includes(x.type));
        if (!buffs.length && t.shield <= 0) continue;
        t.efeitos = t.efeitos.filter(x => !BUFFS.includes(x.type));
        const prev = t.suspensos;   // acúmulo raro: se já havia suspensão, mescla (soma o escudo, junta os efeitos, renova o prazo)
        t.suspensos = { efeitos: [...(prev ? prev.efeitos : []), ...buffs], shield: (prev ? prev.shield : 0) + t.shield, restauraEm: e.dur || 1 };
        t.shield = 0;
        log(st, { tipo: 'efeito', alvo: t.key, efeito: 'suspendeBuffs', duracao: e.dur || 1 });
      }
      continue;
    }
    if (e.t === 'agendar') {   // §117 (M1): guarda o payload no dono p/ disparar no próximo iniciarTurno dele. Alvo/escopo já fixados aqui (no lançamento) — o disparo não escolhe nada
      u.pendente.push({ agenda: e.agenda, alvo: e.alvo || 'nenhum' });
      log(st, { tipo: 'efeito', origem: u.key, efeito: 'agendar' });
    }
    // AUTORIA do redirect (F1.6) — o §62 construiu só o CONSUMO (bater); aqui o fx que APLICA. O portador é o CASTER
    // (Curupira, no lado DEFENSOR: golpe único inimigo mira o time dela → `bater` acha o portador nesse lado), e o
    // SINK é o inimigo ESCOLHIDO (alvos[0], no lado do atacante). Espelha o intercepta (destino vem de alvos[0]).
    if (e.t === 'redirect' && alvos[0]) {
      aplicar(st, u, { type: 'redirect', destino: alvos[0].uid, dur: e.dur, contra: e.contra || 'todos', origem: u.uid });
      log(st, { tipo: 'efeito', origem: u.key, alvo: alvos[0].key, efeito: 'redirect' });
    }
    if (e.t === 'copiar') copiar(st, u, e, alvos);
    if (e.t === 'fase') {
      // PRIMITIVA estado global Dia/Noite. `remove` (§94, Hou Yi "abater o Sol"): limpa a fase SELETIVAMENTE —
      // só se a fase atual for a nomeada (remove:'Dia' não toca a Noite). O modelo é UM `st.fase` global, sem dono,
      // mutuamente exclusivo, último-a-escrever-vence (§ da sessão 15); a remoção é só mais um escritor que zera.
      if (e.remove) { if (st.fase === e.remove) definirFase(st, null); }
      else definirFase(st, e.v, e.dur);
    }
    if (e.t === 'vinculo' && alvos.length >= 2) {
      aplicar(st, alvos[0], { type: 'vinculo', par: alvos[1].uid, dur: e.dur, origem: u.uid });
      aplicar(st, alvos[1], { type: 'vinculo', par: alvos[0].uid, dur: e.dur, origem: u.uid });
      log(st, { tipo: 'efeito', alvo: alvos[0].key, efeito: 'vinculo' });
    }
    if (e.t === 'cdShift') {
      if (e.unidade) {   // MIRADO (F1.6): CADA unidade escolhida — 1 (Bragi/Brahma/Oni/Itzamná) ou 2 (Huangdi milagre: "2 aliados")
        for (const x of alvos) {
          if (e.soMaior) {   // só a MAIOR recarga ativa muda (Bragi: "1 recarga reduzida em 1 turno")
            let maior = null; for (const k in x.cd) if (x.cd[k] > 0 && (maior === null || x.cd[k] > x.cd[maior])) maior = k;
            if (maior !== null) { x.cd[maior] = Math.max(0, x.cd[maior] + e.v); log(st, { tipo: 'cd', lado: x.lado, alvo: x.key, valor: e.v }); }
          } else { for (const k in x.cd) x.cd[k] = Math.max(0, x.cd[k] + e.v); log(st, { tipo: 'cd', lado: x.lado, alvo: x.key, valor: e.v }); }   // todas (Brahma: v:-99 zera)
        }
      } else {
        const tgt = e.lado === 'proprio' ? l : st.lados[1 - u.lado];   // LADO inteiro (legado)
        for (const x of tgt.units) for (const k in x.cd) x.cd[k] = Math.max(0, x.cd[k] + e.v);
        log(st, { tipo: 'cd', lado: e.lado === 'proprio' ? u.lado : 1 - u.lado, valor: e.v });
      }
    }
    if (e.t === 'orbGain') {
      const tipos = [...new Set(l.units.filter(x => x.vivo).map(x => x.elem))];
      for (let i = 0; i < e.n; i++) l.orbs[tipos[Math.floor(rng(st) * tipos.length)]]++;
      log(st, { tipo: 'orbe', lado: u.lado, valor: e.n });
    }
    if (e.t === 'roubaOrbe') {   // F1.6 — remove e.n orbes do MAIOR pool do inimigo (rouba: vai p/ o próprio); Heimdall (protegeOrbe) barra
      const li = st.lados[1 - u.lado];
      const nRoubo = e.porAlvoComStatus ? li.units.filter(x => x.vivo && ef(x, e.porAlvoComStatus)).length : e.n;   // §135 (Shuten milagre): "1 orbe por alvo com Torpor" — n = nº de inimigos vivos carregando o status
      const protetor = li.units.find(x => { if (!x.vivo) return false; const g = kitDe(st, x); const p = g && g.passiva; return p && Array.isArray(p.fx) && p.fx.some(f => f.gatilho === 'protegeOrbe'); });
      if (protetor) { log(st, { tipo: 'bloqueio', alvo: protetor.key, lado: 1 - u.lado, motivo: 'orbe_protegido' }); }   // §107: o bloqueio precisa de `alvo` (gramática de eventos) — nomeia o PROTETOR (Heimdall). Bug pré-existente da F1.6 exposto quando o roster cresceu e o seed 24 caiu num roubaOrbe-vs-Heimdall (§66: o método expõe furo antigo)
      else {
        let n = 0;
        for (let i = 0; i < nRoubo; i++) {
          const el = ELEMS.filter(x => li.orbs[x] > 0).sort((a, b) => li.orbs[b] - li.orbs[a])[0];
          if (!el) break;
          li.orbs[el]--; n++;
          if (e.rouba) l.orbs[el]++;
        }
        if (n) { log(st, { tipo: 'orbe', lado: 1 - u.lado, valor: -n }); if (e.rouba) log(st, { tipo: 'orbe', lado: u.lado, valor: n }); }
      }
    }
  }
}

// -------- helpers de dano e das primitivas de execução --------
// ESCALA POR CONTAGEM DINÂMICA (F1.6, §73) — o ADD escalado a partir de um `spec` (contador por-unidade/campo/lado;
// aliados/inimigos caídos). UM mecanismo, chamado por danoBase (por-ability) E bonusDanoDeclarativo (passivo) — sem
// caminho duplicado (a dívida que o dono apontou: dois jeitos de escalar o mesmo). `passo` (default 1): +v a cada
// `passo` de contagem — Oni "+1 de dano por 4 de Combo" = {porContadorLado:{nome:'combo', v:1, passo:4}}.
// porStatus (F1.8): "+N por [debuff/buff/DoT/status] em [escopo]". UM source parametrizado, não quatro (varredura §78):
// conta INSTÂNCIAS de efeito da categoria no escopo — como efeitos deduplicam por unidade, "por debuff nele" (escopo
// alvo) e "por inimigo Encharcado" (escopo timeInimigo, categoria encharcado) caem no MESMO contador. `categoria` aceita
// um coringa de família (debuff/buff/dot/controle) OU um nome específico (encharcado/veneno/regen/…).
function statusCasou(cat, tipo) {
  if (cat === 'debuff') return DEBUFFS.includes(tipo) || DOTS.includes(tipo);   // "debuff" inclui DoT, como o alvoDebuff
  if (cat === 'buff') return BUFFS.includes(tipo);
  if (cat === 'dot') return DOTS.includes(tipo);
  if (cat === 'controle') return CONTROLES.includes(tipo);
  return cat === tipo;   // nome específico
}
function contarStatus(st, u, t, spec) {
  const uni = spec.onde === 'alvo' ? [t] : spec.onde === 'self' ? [u]
    : spec.onde === 'time' ? st.lados[u.lado].units.filter(x => x.vivo)
    : st.lados[1 - u.lado].units.filter(x => x.vivo);   // timeInimigo
  let n = 0;
  for (const x of uni) {
    for (const e of x.efeitos) if (statusCasou(spec.categoria, e.type)) n++;
    for (const d of x.dots) if (statusCasou(spec.categoria, d.nome)) n++;
  }
  return n;
}
function escalaContagem(st, u, t, spec) {
  let add = 0;
  const porN = (v, count, passo) => v * Math.floor(count / (passo || 1));
  if (spec.porContador) add += porN(spec.porContador.v, getContador(spec.porContador.onde === 'alvo' ? t : u, spec.porContador.nome), spec.porContador.passo);
  if (spec.porContadorCampo) add += porN(spec.porContadorCampo.v, contadorNoCampo(st, spec.porContadorCampo.nome, spec.porContadorCampo.lado === 'aliados' ? u.lado : 1 - u.lado), spec.porContadorCampo.passo);
  if (spec.porContadorLado) add += porN(spec.porContadorLado.v, getContadorLado(st, spec.porContadorLado.lado === 'inimigo' ? 1 - u.lado : u.lado, spec.porContadorLado.nome), spec.porContadorLado.passo);
  if (spec.porAliadoCaido) add += spec.porAliadoCaido * caidos(st, u.lado);
  if (spec.porInimigoCaido) add += spec.porInimigoCaido * caidos(st, 1 - u.lado);
  if (spec.porHpFaltante) add += porN(spec.porHpFaltante.v, u.maxHp - u.hp, spec.porHpFaltante.passo);   // Mula sem Cabeça: "+1 por 5 de HP perdido" (HP do próprio u)
  if (spec.porStatus) add += porN(spec.porStatus.v, contarStatus(st, u, t, spec.porStatus), spec.porStatus.passo);   // F1.8: "+N por debuff/regen/… no escopo"
  if (spec.porDeficitAliados) add += spec.porDeficitAliados.v * Math.max(0, st.lados[1 - u.lado].units.filter(x => x.vivo).length - st.lados[u.lado].units.filter(x => x.vivo).length);   // §126 (Susanoo): "+N por aliado a MENOS que o inimigo" — déficit de unidades vivas (piso 0). Escala pelo mesmo helper (§73)
  if (spec.porAliadoVivo) add += spec.porAliadoVivo * st.lados[u.lado].units.filter(x => x.vivo).length;   // §132 (Guan Yu milagre): "+N por aliado vivo" — conta as unidades vivas do próprio lado (inclui o dono)
  if (spec.porInimigoHp) add += spec.porInimigoHp.v * st.lados[1 - u.lado].units.filter(x => x.vivo && x.hp < spec.porInimigoHp.abaixo).length;   // §135 (Kali hab): "+N por inimigo abaixo de X de HP" — conta inimigos vivos sob o limiar
  return add;
}
function danoBase(st, u, t, e, l) {
  let base = e.v;
  if (e.seEncharcado && ef(t, 'encharcado')) base = e.seEncharcado;
  if (e.seAdormecido && ef(t, 'adormecido')) base = e.seAdormecido;
  if (e.seDia && st.fase === 'Dia') base = e.seDia;
  if (e.seNoite && st.fase === 'Noite') base = e.seNoite;
  if (e.seCond && condOK(e.seCond.quando, u, t, st)) base = e.seCond.v;   // F1.6: bump condicional GERAL por estado do alvo (reusa condOK: alvoBuff/alvoDebuff/alvoHp/alvoElem) — Xangô "30 em quem tiver buff", Piranha "28 em quem Sangrando"
  if (e.seAliadoJaAgiu && l.units.some(x => x.uid !== u.uid && x.agiu)) base += e.seAliadoJaAgiu;
  base += escalaContagem(st, u, t, e);   // escala por contagem dinâmica (contador/caídos) — MESMO mecanismo do bonusDano passivo (§73: um caminho só)
  return base;
}

// B (F1.8, Cérberus): enquanto um inimigo VIVO carrega a passiva antiReviveAura, `u` não revive. Checado no ATO
// do revive (dinâmico: se o Cérberus morre, o revive volta a ser possível) — diferente do naoRevive, que é snapshot.
function reviveBloqueadoPorAura(st, u) {
  return st.lados[1 - u.lado].units.some(x => { if (!x.vivo) return false; const g = kitDe(st, x), p = g && g.passiva;
    return p && Array.isArray(p.fx) && p.fx.some(f => f.gatilho === 'antiReviveAura'); });
}
// PRIMITIVA revive — traz um aliado caído de volta, salvo se ficou marcado como irrevivível
function reviver(st, alvo, e) {
  if (alvo.vivo) return;
  if (alvo.naoRevive || reviveBloqueadoPorAura(st, alvo)) { log(st, { tipo: 'bloqueio', alvo: alvo.key, motivo: 'nao_revive' }); return; }
  alvo.vivo = true; alvo.hp = Math.min(alvo.maxHp, e.hp); alvo.agiu = true;
  alvo.efeitos = []; alvo.dots = []; alvo.shield = 0;
  for (const k in alvo.cd) alvo.cd[k] = 0;
  log(st, { tipo: 'revive', alvo: alvo.key, valor: alvo.hp });
}

// DOMINAR de uma vítima (§99, extraído p/ o massa §130): aplica 'dominado' + força o Básico dela contra um aliado dela.
// Resolve IMEDIATO (fogo amigo, sem contra/intercepta/redirect); imune a controle barra a dominação inteira.
function dominarUm(st, u, vitima, alvoAliado, e) {
  if (!vitima || !vitima.vivo) return;
  if (ef(vitima, 'controlImmune') || imuneA(st, vitima, 'dominado')) { log(st, { tipo: 'imune', alvo: vitima.key, efeito: 'dominado' }); return; }
  const dur = (st.fase === 'Noite' && e.durNoite) ? e.durNoite : (e.dur || 1);
  aplicar(st, vitima, { type: 'dominado', dur, origem: u.uid });
  log(st, { tipo: 'efeito', origem: u.key, alvo: vitima.key, efeito: 'dominado' });
  const kit = kitDe(st, vitima);
  const bas = kit && kit.ab && kit.ab.find(x => x.slot === 'basico');
  const dmgFx = bas && bas.fx && bas.fx.find(f => f.t === 'dmg');
  if (alvoAliado && alvoAliado.vivo && dmgFx) {
    const dano = bater(st, vitima, alvoAliado, danoBase(st, vitima, alvoAliado, dmgFx, st.lados[vitima.lado]), dmgFx.kind || 'afetado', 'basico', { classe: classeDe(st, vitima, bas), semContra: true, semIntercepta: true, semRedirect: true });
    if (e.curaCausador) curar(st, u, dano, u);
  }
}
// PRIMITIVA copiar habilidade — executa uma habilidade de outra fonte sem pagar o custo
function copiar(st, u, e, alvos = []) {
  if (e.fonte === 'ultimaHabilidadeAliada') {
    const ref = st.lados[u.lado].ultHabilidade;
    if (!ref) { log(st, { tipo: 'efeito', origem: u.key, efeito: 'copiar' }); return; }
    log(st, { tipo: 'acao', origem: u.key, slot: 'habilidade' });
    // alvo automático: o primeiro inimigo vivo (a cópia herda o alvo padrão da habilidade)
    const alvo = st.lados[1 - u.lado].units.find(x => x.vivo);
    aplicarFx(st, u, ref.fx, { alvo: ref.alvoSpec, slot: 'habilidade' }, alvo ? [alvo] : []);
  }
  else if (e.fonte === 'basicoAliado') {   // §127 (Tanuki): copia o BÁSICO de um aliado ESCOLHIDO (alvos[0]), pago pelo Tanuki. O executor (u) é o Tanuki; o alvo do golpe copiado é o 1º inimigo vivo (herda o alvo padrão do básico)
    const ali = alvos[0]; const g = ali && kitDe(st, ali);
    const bas = g && g.ab && g.ab.find(x => x.slot === 'basico');
    if (!bas) { log(st, { tipo: 'efeito', origem: u.key, efeito: 'copiar' }); return; }
    log(st, { tipo: 'acao', origem: u.key, slot: 'basico' });
    const alvo = st.lados[1 - u.lado].units.find(x => x.vivo);
    aplicarFx(st, u, bas.fx, { alvo: bas.alvo, slot: 'basico' }, alvo ? [alvo] : []);
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

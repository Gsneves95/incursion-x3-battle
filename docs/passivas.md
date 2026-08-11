# Passiva declarativa — schema (F1.2)

A passiva ganha `fx` como a habilidade, para o motor não carregar um `if (u.key===...)` por deus
(DECISOES §36). O vocabulário mora em `E.VOCAB` (fonte única); `tools/valida_kit.js` valida a FORMA
na build; `src/engine.js` executa. Cresce **um gatilho por sessão**.

## Forma

```json
"passiva": {
  "nome": "Pele de Couraça",
  "desc": "Sobek recebe 10 de redução de Básicos; +6 de dano contra alvos com debuff.",
  "fx": [
    { "gatilho": "bonusDano", "v": 6, "escopo": "self", "quando": { "alvoDebuff": "qualquer" } }
  ]
}
```

- `gatilho` — o que a passiva faz. Conjunto FECHADO `V.gatilhosPassiva`; cada gatilho declara em
  `V.gatilhosPassivaDef` os CAMPOS que aceita e os obrigatórios, e o validador dispara por gatilho (um
  campo de outro gatilho é recusado como "não pertence"). Cresce um por sessão.
  - `bonusDano` (sessão 1) — soma `v` ao dano de um ataque. Campos: `v` (obrig), `escopo`, `quando`.
  - `danoIrredutivel` (sessão 2) — o dano do DONO fura redução e/ou escudo. Campo: `ignora` (obrig),
    subconjunto de `['reducao','escudo']` (`V.ignoraveis`). Sempre self (é propriedade do próprio dano).
  - `reducao` (sessão 3) — reduz o dano RECEBIDO. Campos: `v` (obrig), `escopo`, `contra`. `escopo` self
    (só o dono, ex.: sobek) ou time (todos os aliados, ex.: thor). `red = Math.max(red, v)` (regra 6, não
    soma). `contra` = condição DEFENSIVA (abaixo); ausente = todo ataque.
  - `porTurno` / `abertura` (sessão 4) — gatilhos de TURNO. Campo `faz` (obrig): ver "família por-turno" abaixo.
  - `imunidade` (sessão 5) — imune a status nomeado(s). Campo `a` (obrig): array de tags ∈ `V.imunizaveis`
    (`CONTROLES ∪ DOTS ∪ 'controle'`). UM gatilho: a declaração é uniforme ("imune a X"); só o enforcement
    varia (controle em `aplicar`, DoT em `aplicarDot`) — enforcement é implementação, vocabulário é contrato.
    O **coringa `'controle'`** cobre TODO controle (Jörmungandr, Ísis dizem "imune a controle", não listam):
    cobre controle FUTURO por construção, então a **F1.4** (Pacificar, Torpor, Medo) amplia essas duas passivas
    automaticamente — declarado aqui para não ser surpresa. NÃO cobre imunidade a MECÂNICA (execução → F1.3;
    contágio) nem CONDICIONAL (yamato "com 15+ Combo", guanyu "com 3 vivos") — famílias próprias.
  - `aoCair` (sessão 6) — quando alguém CAI, faz X. Campos: `quem` (obrig, o SUJEITO da morte) + `faz` (obrig,
    o efeito no reator). UM gatilho, não dois (onKill/onDeath): a morte é UM momento (uma unidade a 0 em `matar`);
    só o sujeito varia — eixo de sujeito, igual à imunidade (declaração uniforme), diferente do por-turno (3
    momentos → 3 gatilhos). `quem` ∈ `V.aoCairQuem`, abre `'inimigo'` (matador-bound: "ao derrotar" — zeus) e
    `'self'` (o dono morre — nezha). Cresce por deus: `'aliado'` (khnum), `'qualquerInimigo'` (hades). `faz` reusa
    `V.fxTurno` (+ `orbGain.para` = elemento fixo). **AMBIGUIDADE aberta (DECISOES):** "quando um inimigo é
    derrotado, [eu] X" não diz se é matador-bound ou qualquer-morte — decisão do dono ao migrar morrigan/iansa/ahpuch.
  - `bonusCura` (sessão 7) — soma `v` à MAGNITUDE das curas no lado do dono (Brigid: +5). Campos: `v` (obrig),
    `quandoCura`. Gatilho PRÓPRIO, não campo do `bonusDano`: caminho de valor diferente (soma em `curar`, não em
    `bonusDano`), evento diferente (`cura`, não `dano`), e condição de eixo diferente (`quandoCura`, abaixo). A
    varredura achou **7** membros "curas curam +N" (não os 20 que MENCIONAM cura — o resto é cura-plana-por-gatilho
    ou bônus-de-dano-por-ter-sido-curado; ver DECISOES §41).
  - próximos: `reativa` (hera), `aCadaN` (cuca), os demais sujeitos de `aoCair`, e `heal` como fx de `faz`
    (destrava as 9 passivas de cura-plana-por-gatilho — Hades/Deméter/Ymir/… — maiores que o próprio bonusCura).

## "Imune" na prosa engana: três famílias diferentes, não uma

A palavra "imune" no texto do kit cobre coisas de semântica OPOSTA. A próxima varredura vai tropeçar aqui se
não estiver escrito:
- **imunidade** (o gatilho): AUTO-imunidade a um status (o dono não recebe controle/DoT). 12 kits.
- **anti-revive** (`naoRevive`, OUTRA família): marca no MORTO ou no INIMIGO ("quem Ammit derrota não revive",
  "inimigos com Atadura não revivem"). 6 kits (cerberus, mimir, anubis, ammit, yanwong, ahpuch). Se tivesse
  entrado no gatilho `imunidade`, ele carregaria duas semânticas opostas (proteger a si × punir o outro).
  Viaja com morte/execução, não com imunidade.
- **imunidade condicional** (OUTRA família): "imune enquanto/com N" (yamato 15+ Combo, guanyu 3 vivos) — não é
  estática, depende de estado, fecha com os deuses dela.

## Família por-turno: o gatilho EMBRULHA um efeito (`faz`), não um escalar

Propriedade da FAMÍLIA (não detalhe de um deus): diferente de `bonusDano`/`reducao` (efeito escalar `+v`),
um gatilho de turno dispara um EFEITO — "no gatilho, FAÇA X". A varredura achou **3 formas distintas** (7/7/4),
então são **3 gatilhos nomeados**, não um eixo temporal `quando:{turno:{op}}`:
- `porTurno` — `faz` roda a cada início de turno do dono (ra: +1 Disco).
- `abertura` — `faz` roda UMA vez, no 1º turno do lado (ganesha: +2 orbes).
- `aCadaN` (ainda NÃO existe) — periódico, com campo `n` (cuca, kitsune, boto).

**`faz` é uma lista de fx, mas fechada aos que NÃO exigem alvo escolhido nem seletor.** O alvo de um `faz` é
FIXO: `self` (o dono) ou o lado; um gatilho de turno não tem jogador escolhendo. `V.fxTurno` abre só
`contador` (ra) e `orbGain` (ganesha); `valida_kit` recusa fx fora disso (`{t:'dmg'}` não dispara por turno)
e recusa `alvo` que não seja `self`. `heal`/`cdShift`/`apply` entram por deus; os SELETORES ("aliado mais
ferido" da Deméter, "inimigo de maior HP" da Izanami) NÃO existem — entram como campo novo revisado quando
esses deuses migrarem. Os eventos gerados por um `faz` recebem `passiva: <key do dono>` (o narrador sabe a origem).

**Nota para quando o `aCadaN` chegar (NÃO resolver agora):** o `n` é contado desde quando? A Cuca é `turno % 3`
(ABSOLUTO, da partida). Kitsune ("a cada 2 turnos") e Boto ("a cada 3 turnos") podem ser RELATIVOS (desde o
último disparo). Se forem, são dois comportamentos e o `aCadaN` precisa dizer qual — decidir na sessão dele.

## TRÊS vocabulários que NUNCA se misturam: ofensivo (`quando`) × defensivo (`contra`) × de-cura (`quandoCura`)

`quando` (gatilho bonusDano) lê o lado **OFENSIVO** de um ataque do dono: quem ataca (`atacanteElem`), quem é
atacado (`alvoDebuff`/`alvoBuff`/`alvoElem`/`alvoHp`/`alvoDefesa`/`alvoMarca`), e o estado do campo (`fase`).
`contra` (gatilho reducao) lê o **GOLPE QUE CHEGA** ao dono. `quandoCura` (gatilho bonusCura, sessão 7) lê o
**CONTEXTO DE UMA CURA** — que não tem ataque nenhum: não há `atk` nem `alvo`-de-golpe, então nenhuma chave de
`quando` serve. São TRÊS eixos SEPARADOS — um bônus de dano nunca condiciona pelo golpe recebido, uma redução
nunca condiciona por quem o dono ataca, e um bônus de cura nunca lê participantes de um ataque que não houve.
Não reusar um pelo outro: se `quando` ganhasse "slot do ataque recebido", o eixo ofensivo passaria a ler defesa
e o significado de cada chave viraria ambíguo (foi o que o `de:'basico'` sobrecarregado teria feito — daí
`contra:{slot}`); reusar `quando` na cura repetiria o mesmo erro (a condição da Brigid é "existe INIMIGO com
Queimadura" — estado de lado, não `alvoDebuff` do alvo de um golpe).

**`quandoCura` — condição da cura (fechada; abre só `inimigoTem` na sessão 7):**

| chave | valor | lê |
|---|---|---|
| `quandoCura.inimigoTem` | ∈ `V.dots` (`queimadura`, `veneno`) | existe inimigo VIVO (do lado curado) com a tag DoT (brigid: `queimadura`) |

Objeto de UMA chave, ausente = toda cura. As outras formas da família (paridade de turno → Hel; facção do
curador → Nefertem; tipo=regeneração → Cernunnos/Chaac) entram POR DEUS quando migrarem — cada uma como chave
nova de `quandoCura`, revisada, nunca à força. `V.dots` cresce para debuff/controle se um deus condicionar cura
por eles.

**`contra` — condição defensiva (fechada; abre só `slot` na sessão 3):**

| chave | valor | lê |
|---|---|---|
| `contra.slot` | ∈ `{basico, habilidade, milagre}` | reduz só golpes deste slot (sobek: `basico`) |

Objeto de UMA chave, sub-vocabulário próprio (validado por `valida_kit`), ausente = todo ataque. As outras oito
formas de redução da família (classe → oni; elemento-negado → baldur; paridade → hel; contador → kitsune;
contagem de aliados → guanyu; elemento-do-receptor → poseidon) entram POR DEUS quando migrarem — cada uma
como chave nova de `contra` (ou refinamento de `escopo`), revisada, nunca à força.
- `v` — inteiro > 0 (só em `bonusDano`).
- `escopo` — `self` (vale só quando o DONO ataca) ou `time` (qualquer aliado vivo). Default `self`.
- `quando` — a condição (objeto de **uma** chave; ausente = sempre). Conjunto FECHADO abaixo.

## `quando` — vocabulário de condição (fechado)

Fechado lendo o CONJUNTO INTEIRO das passivas "+N condicional" (18 planas), não os deuses migrados —
ver a lição em DECISOES §37. Cada chave declara como validar o valor; `pendente` = o motor ainda não
rastreia o estado, então `valida_kit` recusa em voz alta (nunca vira falso silencioso).

| chave | valor | lê |
|---|---|---|
| `alvoDebuff` | nome ∈ DEBUFFS · `'qualquer'` · `'controle'` | o alvo tem o debuff (encharcado, dmgDown…), qualquer debuff, ou qualquer controle |
| `alvoBuff` | nome ∈ BUFFS · `'qualquer'` | o alvo tem buff |
| `alvoDefesa` | `true` | o alvo tem escudo OU redução de dano |
| `alvoElem` | ∈ ELEMS | o alvo é do elemento |
| `alvoHp` | `{op:'cheio'\|'abaixo'\|'acima', v?}` | HP do alvo (v obrigatório em abaixo/acima) |
| `atacanteElem` | ∈ ELEMS | quem ataca é do elemento (use com `escopo:'time'`) |
| `fase` | `'Dia'` \| `'Noite'` | estado global Dia/Noite |
| `alvoMarca` | (reservada) | marca ofensiva (Olho) — **pendente**: chega com a vulnerabilidade |
| `alvoCuradoAntes` | (reservada) | curado no turno anterior — **pendente**: o motor não rastreia ainda |

## Migração é por DEUS INTEIRO (§37)

Um deus só migra da prosa-hardcoded para `fx` quando **todos** os gatilhos da sua passiva existem.
Migrar só um gatilho de uma passiva multi-parte deixa um `if (u.key===...)` invisível no motor —
"deus meio-migrado é pior que não migrado". Por isso a **sessão 1 migrou ZERO** dos 12 implementados:
todos os que têm um clause `bonusDano` (ogum, ra, sobek, brigid) têm outra metade (dano irredutível /
Disco por turno / redução de Básico / cura condicional) cujo gatilho ainda não existe. O mecanismo foi
provado num deus sintético (`tests/passiva.test.js`).

## Cobertura hoje (das 18 "+N condicional" planas)

- **Estrutural: 18/18** — todas mapeiam para as 9 chaves, zero exceção. O vocabulário está fechado certo.
- **Escrevíveis e válidas hoje: 15/18.** As 3 restantes esperam uma TAG/ESTADO que a fase própria delas
  introduz, e o `valida_kit` já as recusa com o motivo dito em voz alta — **não é exceção aberta**:
  - **babi** (`alvoDebuff:'medo'`) → `medo` entra em DEBUFFS na F1.4.
  - **horus** (`alvoMarca`) → marca ofensiva (Olho) entra com a primitiva de vulnerabilidade.
  - **tsukuyomi** (`alvoCuradoAntes`) → o motor precisa rastrear cura-no-turno-anterior.

  Nenhuma das 3 pede chave NOVA de condição — só um valor/estado que sua fase adiciona. É a prova de
  que o vocabulário de condição está completo.

## Ordem das próximas sessões — por DESTRAVE, não por frequência

Ordenar por frequência deixa deuses pela metade esperando o último gatilho (hardcode convivendo com dado
no mesmo deus — onde alguém edita o lugar errado). Ordenar por DESTRAVE termina deuses: o checador confere,
a suíte cobre, e um `grep 'key===<deus>'` prova que não sobrou `if`. Decomposição das 12 passivas em gatilhos
(bonusDano já existe ✓):

| deus | gatilhos da passiva | faltam | # |
|---|---|---|---|
| fujin | (inerte — sem hardcode no motor) | — | **0** |
| ogum | bonusDano✓ + **danoIrredutivel** | danoIrredutivel | 1 |
| tyr | **danoIrredutivel** (+ inabsorvível) | danoIrredutivel | 1 |
| sobek | bonusDano✓ + **reducao** (só de Básicos) | reducao | 1 |
| thor | **reducao** (time, plana) | reducao | 1 |
| ra | bonusDano✓ + **porTurno** (contador/turno) | porTurno | 1 |
| ganesha | **porTurno** (orbe no turno 1) | porTurno | 1 |
| brigid | bonusDano✓ + **bonusCura** (condicional) | bonusCura | 1 |
| zeus | **onKill** (orbe) | onKill | 1 |
| hera | **reativa** (on-cura → escudo) | reativa | 1 |
| cuca | **imunidade** + **porTurno** (ação grátis/3 turnos) | imunidade, porTurno | 2 |
| nezha | **imunidade** + **onDeath** (revive 1×) | imunidade, onDeath | 2 |

**Quantos deuses cada gatilho TERMINA (dado que bonusDano já existe):**
- `danoIrredutivel` → **2** (ogum, tyr) — hardcodes adjacentes em `calcDano` (ignoraReducao/ignoraEscudo); migração cirúrgica.
- `reducao` → **2** (sobek, thor) — precisa de condição (por slot/fonte do dano recebido) + escopo.
- `porTurno` → **2** (ra, ganesha) — SE o gatilho cobrir tanto "todo turno" quanto "turno 1", e tanto contador quanto orbe; senão 1+1 (sub-formas diferentes).
- `bonusCura` → 1 (brigid) · `onKill` → 1 (zeus) · `reativa` → 1 (hera) · `imunidade`/`onDeath` → 0 sozinhos (cuca/nezha precisam de dois).

**Sequências que mais terminam:** `danoIrredutivel + reducao` = **4 deuses** (ogum, tyr, sobek, thor) em 2 gatilhos, os dois de destrave mais SÓLIDO (o "2" do porTurno é mole — depende de unir sub-formas). Somando `porTurno` = 6. Depois `imunidade` (destrava cuca+nezha junto com porTurno/onDeath), `bonusCura`, `onKill`, `reativa` fecham o resto.

### Placar de deuses TERMINADOS (passiva 100% declarativa, zero hardcode)

A métrica a acompanhar (não "quantos gatilhos existem"). Um deus é TERMINADO quando `grep "key === '<deus>'"`
no motor não retorna nada e a suíte que o cobre passa contra o dado.

- **10/12** — **fujin** (inerte), **ogum**/**tyr** (sessão 2, `danoIrredutivel`), **sobek**/**thor** (sessão 3,
  `reducao`), **ra**/**ganesha** (sessão 4, `porTurno`/`abertura`), **zeus** (sessão 6, `aoCair` quem:inimigo),
  **nezha** (sessão 7, `imunidade` + `aoCair` quem:'self'), **brigid** (sessão 8, `bonusDano` time + `bonusCura`).
- Faltam 2: hera → `reativa` [1] · cuca → `imunidade`(feito)+`aCadaN` [1].
- **Brigid fechada (sessão 8):** duas cláusulas migradas juntas (deus inteiro, §37): +5 de dano ao time =
  `{bonusDano, v:5, escopo:'time'}` (some com Brigid morta — comportamento atual preservado); cura +5 se inimigo
  com Queimadura = `{bonusCura, v:5, quandoCura:{inimigoTem:'queimadura'}}`. A caracterização Lote B (ambas as
  cláusulas, incl. o §39 "só inimigo, não aliado") seguiu verde SEM alteração. O `desc` do JSON dizia "alguém no
  campo" (o texto largo do §39); alinhei à planilha ("algum inimigo"), que é a prosa que VENCE.
- **Nezha fechada (sessão 7):** `aoCair` já existia; abrir o sujeito `'self'` fechou a passiva. Os 4 travas de
  ORDEM foram caracterizados VERDE contra o hardcode ANTES de migrar e continuaram verdes depois — não houve
  divergência (a prosa "retorna no turno seguinte, 48 HP, 1×" bate com o motor): (1) revive DEPOIS da limpeza de
  efeitos (renasce sem os efeitos que tinha ao cair); (2) queda-pendente NÃO conta p/ derrota (time todo caído
  com Nezha pendente não perde até renascer ou o revive esgotar); (3) 1× por partida (2ª queda não renasce);
  (4) revive no turno SEGUINTE, não no mesmo. O `reviveProximoTurno` é `faz`-only, guardado em `rodarFaz` a
  `!vivo && !renasceu`; o revive-HP virou parâmetro (`reviveHp`), reusável pelo Bennu (hp:60) na F1.x.

**Sessão 5 (`imunidade`) — infraestrutura, placar PARADO em 7/12 (0 migração real, como a sessão 1).** O que
justifica a sessão não é o placar e sim o destrave FUTURO: `imunidade` é o **2º mecanismo mais populoso** —
**12** kits o exigem. Depois desta sessão, **2** deles (jörmungandr, ísis) ficam com a PASSIVA inteira
declarável (imunidade + a única outra cláusula, que já existe); os outros 10 precisam de +1 gatilho/tag cada
(medo/agarrar → F1.4; veneno → DoT novo; on-kill/reflexo/scaled/sinergia → gatilhos futuros). Nenhum dos 12
implementados era finalizável por `imunidade` (cuca/nezha precisam de `aCadaN`/`onDeath`), daí o placar parado —
avisado antes de começar.
- **Nota do fujin:** conta como terminado porque a passiva é inerte e não tem hardcode — mas ela NÃO funciona
  (depende do Raijin, que não é inicial). Decisão aberta desde a Fase 0; volta à mesa quando o Raijin entrar (F1.8).

### Auditoria da rede de equivalência (cobertura de passiva dos 9 hardcoded)

Dois furos em duas sessões (Rá, Ogum) motivaram auditar TODOS os 9 antes de qualquer migração. Lendo os
BLOCOS (não grepando o nome — existência ≠ cobertura), a rede real:

| deus | passiva (cláusulas) | asserta a passiva? | o que cobre / falta |
|---|---|---|---|
| **thor** | −6 de dano ao time | **SIM** (já existia) | capacidades: 15−6=9 vivo, 15 caído (magnitude + escopo + condição-vivo) |
| **sobek** | +6 vs debuff · −10 de Básicos | **SIM** (Lote A) | passiva.test: +6 só do sobek vs debuff; −10 só de básico, não de habilidade |
| **hera** | curado → +10 escudo | **SIM** (Lote A) | passiva.test: escudo === 10 exato, só o curado, só com Hera viva |
| **nezha** | imune Veneno/Queimadura · revive 1× | **SIM** (Lote A + motor #10) | queimadura bloqueada 100% só na Nezha (+ revive 1× em motor #10) |
| **ra** | aliados Aurora +5 · +1 Disco/turno | **SIM** (Lote A) | passiva.test: +5 só a Aurora, não Tempestade, só com Rá vivo; Disco +1/turno teto 6 só no turno do Rá |
| **brigid** | +5 dano time (plano) · cura +5 se INIMIGO com Queimadura | **SIM** (Lote B) | +5 team qualquer elemento, some com Brigid morta; cura +5 só com INIMIGO queimando (aliado não — §39) |
| **cuca** | imune Dormir · Básico grátis a cada 3 turnos | **SIM** (Lote B) | adormecido bloqueado só na Cuca; Básico custo {} só em turno%3===0, só o Básico |
| **ganesha** | turno 1: +2 orbes | **SIM** (Lote B) | evento orbe valor 2 na abertura; não repete nos turnos seguintes |
| **zeus** | ao derrotar: +1 orbe Tempestade | **SIM** (Lote B) | +1 Tempestade quando o Zeus mata; não quando outro aliado mata |

**Auditoria inicial: 1 SIM, 2 PARCIAL, 6 NÃO** → rede partida em dois lotes, ambos FEITOS. Toda caracterização
trava o NÚMERO e os dois lados de cada condição — o erro da Hera (asseverar existência) não se repete.
**REDE COMPLETA: os 9 hardcoded têm asserção que cobre a passiva de fato.** No caminho, dois furos do 3º tipo
(hardcode > prosa) achados e CORRIGIDOS (prosa vence, §39): nezha imunizava todo DoT (→ lista veneno+queimadura);
brigid disparava a cura-bônus com queimadura em qualquer lado (→ só inimigo). Impacto no jogo hoje: nenhum
(nenhum kit dos 12 queima aliado). Sessão 3 FEITA: `reducao` migrou sobek+thor (placar 5/12).

**Rede de equivalência (a suíte que prova dado==hardcode):** existe para a maioria, mas **`ra` não tem suíte
que asserte sua passiva** e `thor`/`fujin` são finas. Antes de migrar um deus sem asserção da passiva, ADICIONO
uma caracterização primeiro (é acrescentar cobertura, não alterar suíte) — só então migro, com a suíte provando
que o dado reproduz o hardcode.

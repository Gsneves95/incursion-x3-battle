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
  - próximos: `reducao`, `bonusCura`, `onKill`, `onDeath`, `porTurno`, `reativa`, `imunidade`…
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

- **3/12** — **fujin** (inerte, sem hardcode; ver nota), **ogum** e **tyr** (F1.2 sessão 2, gatilho `danoIrredutivel`).
- Faltam 9: brigid, cuca, ganesha, hera, nezha, ra, sobek, thor, zeus (ainda com `if (u.key===...)` no motor).
- **Nota do fujin:** conta como terminado porque a passiva é inerte e não tem hardcode — mas ela NÃO funciona
  (depende do Raijin, que não é inicial). Decisão aberta desde a Fase 0; volta à mesa quando o Raijin entrar (F1.8).

### Auditoria da rede de equivalência (cobertura de passiva dos 9 hardcoded)

Dois furos em duas sessões (Rá, Ogum) motivaram auditar TODOS os 9 antes de qualquer migração. Lendo os
BLOCOS (não grepando o nome — existência ≠ cobertura), a rede real:

| deus | passiva (cláusulas) | asserta a passiva? | o que cobre / falta |
|---|---|---|---|
| **thor** | −6 de dano ao time | **SIM** | capacidades: 15−6=9 vivo, 15 caído (magnitude + escopo + condição-vivo) |
| **hera** | curado → +10 escudo | **PARCIAL** | capacidades: escudo APARECE nos 3 (`shield>0`); a magnitude **10** não é travada |
| **nezha** | imune Veneno/Queimadura · revive 1× | **PARCIAL** | motor #10: revive 1× exato; a **imunidade** a Veneno/Queimadura não é testada |
| **brigid** | +5 dano time (plano) · cura +5 se Queimadura | **NÃO** | só testam o DoT do básico e a IA; a passiva (dano/cura) não |
| **cuca** | imune Dormir · Básico grátis a cada 3 turnos | **NÃO** | nada |
| **ganesha** | turno 1: +2 orbes | **NÃO** | nada |
| **ra** | aliados Aurora +5 · +1 Disco/turno | **NÃO** | nada (o kit foi conferido por screenshot, não por suíte) |
| **sobek** | +6 vs debuff · −10 de Básicos | **NÃO** | nada (aparece só como roster/inimigo) |
| **zeus** | ao derrotar: +1 orbe Tempestade | **NÃO** | nada |

**Resultado: 1 SIM, 2 PARCIAL, 6 NÃO.** A maioria está descoberta — a rede é maior que uma sessão, então
a tarefa se PARTE (decisão do dono). Cláusulas a caracterizar: ~13 (6 deuses do zero + fechar 2 parciais).
Nenhuma migração até a rede existir. **`sobek` é o único pré-requisito direto da sessão 3** (reducao → sobek+thor).

**Rede de equivalência (a suíte que prova dado==hardcode):** existe para a maioria, mas **`ra` não tem suíte
que asserte sua passiva** e `thor`/`fujin` são finas. Antes de migrar um deus sem asserção da passiva, ADICIONO
uma caracterização primeiro (é acrescentar cobertura, não alterar suíte) — só então migro, com a suíte provando
que o dado reproduz o hardcode.

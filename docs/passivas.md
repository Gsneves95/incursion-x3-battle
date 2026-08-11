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

- `gatilho` — o que a passiva faz. Conjunto FECHADO `V.gatilhosPassiva`. **Sessão 1 abre só `bonusDano`**
  (soma `v` ao dano de um ataque). Próximos: `bonusCura`, `reducao`, `onKill`, `onDeath`, `porTurno`, `reativa`…
- `v` — inteiro > 0.
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

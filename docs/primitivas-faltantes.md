# Primitivas faltantes — varredura completa dos 100 kits

Leitura única da prosa INTEIRA (básico + habilidade + milagre + passiva) dos 100 kits em
`data/kits.json` (a fonte revisada), cruzada com o vocabulário real do motor
(`E.VOCAB`, `aplicarFx`, `danoBase`, os hooks de `matar`/`iniciarTurno`/`fimTurno`/`bonusDano`).
Substitui a descoberta de-kit-em-kit: o objetivo é que nenhum lote futuro trave no meio por
primitiva faltante.

**Como li a coluna `motor tem?`** — três valores, e o do meio é o perigoso:
- **sim** = há `fx`/handler E um kit escrito OU um teste exercita.
- **parcial** = o `fx` existe e roda, mas **nenhum kit escrito o exercita** — é o caso que
  enganou nos contadores (a primitiva existia, mas só ao escrever o Rá é que soube que casava).
  Quando marco parcial, digo **o que falta**.
- **não** = não há `fx` nenhum; a mecânica não é expressável hoje.

---

## Os dois achados que explicam por que "o número muda toda vez"

O número de "primitivas faltantes" mudou quatro vezes (12 → 11 → 4 → 7) não porque a lista
crescia, mas porque estávamos contando a coisa errada. A varredura completa mostra por quê:

**1. O motor JÁ cobre ~90% das habilidades no nível de `fx`.** Das 25 entradas de `TIPOS_FX`,
   todas têm handler em `aplicarFx`. As primitivas de habilidade genuinamente **sem `fx`** são
   um punhado (tabela A). O resto já existe — o risco não é "não dá pra expressar", é "o `fx`
   existe mas nunca foi exercitado por dado real" (tabela B). Cada primeiro uso pode revelar
   uma lacuna, como revelou nos contadores. **Isso** é o que fazia o número subir: não primitiva
   nova, e sim `fx` declarado-mas-verde estreando.

**2. As passivas são o custo dominante, e não são primitiva — são 100 hooks hardcoded.**
   As **100 passivas são prosa pura** (`0/100` têm campo `fx`). Cada passiva escrita hoje é um
   ramo `if (u.key === 'x')` no motor — só **11** existem (`brigid, cuca, ganesha, hera, nezha,
   ogum, ra, sobek, thor, tyr, zeus`). Escrever os outros 89 kits = escrever 89 hooks de passiva
   à mão, a menos que a passiva ganhe um schema declarativo como as habilidades têm.
   A forma mais comum, de longe, é **"+N de dano condicional" (38 das 100)** — um único
   `bonusDano condicional` data-driven colapsaria 38 hardcodes numa primitiva. É a maior alavanca
   da Fase 1, e é decisão sua (registrada na tabela D).

---

## Tabela A — primitivas SEM `fx` (motor **não** tem; precisam ser construídas)

| primitiva | nº | quais deuses | o que falta no motor | natureza¹ | decisão?² |
|---|---|---|---|---|---|
| **execução por limiar de HP** (elimina se HP ≤ N) | 7 | hades, fenrir, ammit, izanami, iara, lugh, morrigan³ | nenhum `fx` de execução; nenhum `fxKey` lê HP-do-alvo pra matar | motor | **sim** |
| **execução por status** (Atordoado/Selado → elimina) | 1 | ammit | idem acima + leitura de status no gatilho | motor | **sim** |
| **Selado / Silenciado = "só Básico"** (trava Hab.+Mil. juntas) | 5 | hades, dionisio, anubis, iara, tsukuyomi⁴ | `CONTROLES` tem `lockSkill` (tem `slot`) e `silenceClass`, mas não "só básico"; e a prosa usa *Selado* e *Silenciado* como sinônimos sem definir | motor | **sim** |
| **Pacificar** (o alvo age, mas causa 0 de dano) | 1 | oxala | tipo de controle inédito (age, mas dano→0) | motor | **sim** |
| **Torpor** (quando o alvo agir, o dono rouba HP/orbe) | 1 | shutendoji | gatilho reativo "ao agir sob efeito" | motor | **sim** |
| **multi-hit DISTRIBUÍDO** (N golpes repartidos entre alvos à escolha) | 3 | babi, susanoo, houyi | `dmg` é alvo-único ou área; não há golpes com alvo por-golpe | deus | **sim** |
| **marca de vulnerabilidade** (+N de dano recebido de todas as fontes) | 4 | odin, erinias, horus, yanwong | `DEBUFFS` tem `dmgDown` (causa menos), falta o espelho (recebe mais) | motor | não |
| **reflete dano** (devolve % de todo dano recebido) | 1 | mnevis | `contraAtaca` reage a golpe único; refletir todo dano é outro efeito | deus | **sim** |
| **"não cai abaixo de 1 de HP"** (piso de sobrevivência temporário) | 4 | change, vishnu, oxala, dagda⁵ | não há buff de piso; ≠ `vidaExtra` (que revive no ato) | motor | **sim** |
| **redirecionar single-target** (não-taunt, força o inimigo a acertar aliado dele) | 2 | loki, curupira | `dominado` cobre "usa Básico contra aliado"; retarget forçado do próximo ataque não | deus | **sim** |

## Tabela B — primitivas com `fx` mas **verdes** (motor **parcial**; 0 kit exercita — o risco do contador)

| primitiva | nº | quais deuses | o que EXISTE / o que FALTA confirmar | natureza¹ | decisão?² |
|---|---|---|---|---|---|
| **Dia/Noite — LER o estado** (efeito muda durante Dia/Noite) | 6 | amaterasu, tsukuyomi, change, boto, lugh, itzamna | existe `seDia`/`seNoite` **só para trocar o dano-base**; falta ler o estado para **cura, buff, duração de controle e ganho de orbe** (Chang'e cura 30, Boto +1 turno de Dominação, Itzamná +1 orbe) | motor | **sim** |
| **execução TEMPORIZADA por contagem** (marca que mata em N turnos) | 2 | yanwong (Livro), morrigan³ | `fimTurno` tem o ramo do `livro` e o debuff existe; 0 kit; falta regra de remoção/aceleração | motor | **sim** |
| **modo ALTERNA** (toggle a cada uso) | 2 | nezha, vishnu | o do Nezha está **hardcoded no motor** (resíduo F1.0a), não data-driven; o Vishnu precisa de `alterna` declarativo | motor | sim |
| **escolha de efeito** (jogador escolhe 1-de-N ou K-de-N) | 4 | tanuki, exu, lugh (1-de-N); nuwa (2-de-5) | `valida_kit` já aceita `opcoes`; falta a **resolução da escolha em `agir`** (é a F1.3) | motor | **sim** |
| **invocações** (unidade extra que age no turno do dono) | 3⁶ | khnum, sunwukong, cernunnos | `invocar`+`removerInvocacao`+ação em `iniciarTurno` existem e são testados; 0 kit; faltam regras: conta como alvo de área? gera orbe? revive? | motor | **sim** |
| **copiar habilidade** (usa a habilidade de outra fonte sem custo) | 2 | isis, tanuki | `copiar` (fx+função) existe e é testado; 0 kit; falta definir "última habilidade usada" (é a F1.3, e a Ísis tem bug de narração conhecido §eventos) | motor | **sim** |
| **contra-ataque / interceptação reativa** | 6 | heimdall, bastet, mnevis, guanyu, hanuman, saci | `intercepta`+`contraAtaca`+`acharGuarda`/`acharInterceptador` existem e são testados; 0 kit; a passiva reativa é hardcoded | motor | sim |
| **armazenar dano e devolver** | 1 | xango | `armazenaDano` (fx) + liberação em `fimTurno` existem e são testados; 0 kit | deus | não |
| **trava MILAGRE isolada** | 3 | babi, boto, exu | `lockSkill` tem `slot`; falta confirmar que `acoesDe` respeita `slot: 'milagre'` | motor | não |
| **Medo** (dmgDown + trava Milagre, nomeado) | 3⁷ | babi, mula, morrigan | composição de `dmgDown` + trava-Milagre; decidir se é tipo próprio ou composto (2 deuses são imunes: guanyu, durga) | motor | não |

## Tabela C — primitivas **provadas** (motor **sim**; listadas para você ver a cobertura)

`dmg`/área/`dano puro`·`perfurante` · `heal` · `dot` (nomeado) · `apply` (buff/debuff) · `dmgUp`/`dmgDown`
· `shield` (Defesa Destrutível) · `regen` · `cleanse`/`stripBuffs`/`stripOne`/`stripDef`/`destroyShield`
· `revive` + `vidaExtra` (sobrevive letal 1×: hercules, bastet, sunwukong) · `orbGain`/roubo de orbe
· `cdShift` (recarga ±) · `vinculo` (hera, guanyu) · `atordoaMenorHp` · `fase` (**ativar/remover** Dia/Noite:
amaterasu, tsukuyomi, houyi) · controle: `atordoado`/`adormecido`/`submerso`/`taunt`/`silenceClass`/`lockSkill`/`dominado`
· invulnerável/inalvejável · **contadores** (F1.1, provado no Rá): `contador`/`porContador`/`consomeContador`/`limiar`/`pool`/`porContadorLado`/`reduzMaxHp`/`restauraMax`/`espalha`.

## Tabela D — passivas: prosa pura, hardcoded (o custo dominante, e a maior decisão)

`0/100` passivas têm `fx`. Cada uma é um hook hardcoded (11 feitos). Categorias (há sobreposição):

| categoria de passiva | nº | motor hoje | decisão? |
|---|---|---|---|
| **+N de dano condicional** (contra elemento/status/HP) | **38** | hook hardcoded por deus (só brigid, ra) | **sim — a maior alavanca**: um `bonusDano condicional` data-driven colapsa 38 em 1 |
| imunidade / redução estática | 27 | hardcoded | sim (schema de imunidade declarativo?) |
| gatilho por-turno (início/fim/a cada N) | 15 | `iniciarTurno`/`fimTurno` hardcoded | sim |
| gatilho on-kill (inimigo derrotado) | 14 | `matar` hook hardcoded (zeus) | sim |
| reativa (ao ser atingido) | 10 | `intercepta`/`contraAtaca`, hardcoded | sim |
| gatilho on-death (o próprio cai) | 7 | `matar`/`pendenteRenascer` hardcoded (nezha) | sim |
| sinergia nomeada (com Fulano no time) | 7 | hardcoded (ganesha, tyr) | sim |

---

## Resumo para o planejamento: as DECISÕES, agrupáveis em blocos

Contei **~15 pontos que precisam de decisão sua** antes de implementar (marcados `sim` acima). Eles
caem em três blocos naturais — a sugestão é resolver por bloco, não por sessão:

- **BLOCO 1 — Morte & sobrevivência** (o que a F1.2 já ia tocar): execução por limiar de HP,
  execução por status, execução temporizada, "não cai abaixo de 1 de HP", e a interação entre eles
  (execução ignora o piso? e o `vidaExtra`? e a imunidade-a-revive do Ammit/Hel/Cérberus?).
- **BLOCO 2 — Controle & vocabulário**: unificar Selado≡Silenciado ("só Básico"), Pacificar, Torpor,
  Medo (tipo ou composto?), trava-Milagre, redirecionamento forçado.
- **BLOCO 3 — Modos, estado e passivas** (o mais pesado): escolha múltipla + alternância (F1.3),
  ler Dia/Noite além do dano, invocações, e **a decisão-mãe: passiva ganha schema declarativo
  (a partir do `+N condicional`, 38 kits) ou continua hardcoded?**

Natureza confirma o que a contagem esconde: Selado tinha só 5 kits mas é **motor** (controle é
vocabulário), então entra na F1.2 pela natureza, não pela contagem — exatamente o seu argumento.

---

¹ **natureza** (não-vinculante, a seu pedido): `motor` = vocabulário compartilhado (controle, estado,
morte); `deus` = mecânica que provavelmente viaja com 1 kit específico. Contagem baixa + natureza-motor
= ainda vale tarefa própria (o caso do Selado).
² **decisão?** = a prosa é ambígua o bastante para eu ter que **perguntar antes de implementar**, como
na Izanami (a fonte retém? aditivo ou igualado? teto?). Não resolvi nenhuma aqui — só marquei quais existem.
³ **morrigan** aparece em dois lugares: a execução dela é no *fim do turno* (≤24), então é meio limiar-de-HP,
meio temporizada. **sunwukong** é *imune* a execução (consome a primitiva, não a aplica).
⁴ **tsukuyomi** diz "Silencia todos"; **hades/anubis** dizem "Selado"; **dionisio/iara** dizem "Silenciado
(só Básico)". A prosa trata os três como o mesmo efeito — unificar a nomenclatura é parte da decisão. **ammit** *lê* Selado (execução), não aplica.
⁵ **shiva** *ignora* explicitamente "não cai abaixo de 1 de HP" no milagre — o que confirma que o piso
precisa existir como estado real para o Terceiro Olho ter o que furar.
⁶ **iansa** *destrói* invocações (milagre) — consome a primitiva, então ela precisa existir antes do lote dela.
⁷ **medo**: 3 aplicam (babi, mula, morrigan); 2 são imunes (guanyu, durga).

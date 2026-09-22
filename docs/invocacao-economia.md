# §302 item 2 — MEDIÇÃO do pity 60→100 (relatório; o pity NÃO foi mexido)

O dono acha 60 fácil. Ninguém invocou ainda, então isto é a conta contra a intuição. **Nada aqui foi aplicado** —
o pity segue 60 em `data/economia.json`. Números reproduzíveis a partir do dado do jogo (2026-09).

## a) Gema por semana jogando normalmente (com o conteúdo de hoje)

Varri todas as fontes que o dono listou. **`gema` só aparece em `data/economia.json`** — Domínios, Provações,
Missões e Desafios de composição **não pagam gema** (Domínios dá buff de corrida; composição dá Essência; Missões
é marcador de progresso). As torneiras de gema que existem hoje:

| fonte | valor | cadência | gema/semana |
|---|---|---|---|
| Desafio da Semana | 150 | 1ª vitória da semana | **150** (recorrente) |
| Sandbox (batalha CPU) | 20/vitória, teto 5/dia | diária | **até 700** (100/dia × 7, se bater o teto todo dia) |
| Campanha | 5×120 + 400 (chefe) = **1.000** | **1ª vez só** | 0 (não recorre) |
| Domínios / Provações / Missões / Desafios | — | — | 0 gema |

**Conta:** a única torneira recorrente **projetada** é a Semanal (150). O Sandbox é declarado "simbólico, longe de
sustentar" mas, batido no teto todo dia, é a maior fonte (700). Então:
- **Casual (só a Semanal):** **150 gema/semana.**
- **Ativo (Semanal + Sandbox no teto diário):** **850 gema/semana.**
- **Uma vez, no começo:** grant inicial 1.500 + campanha 1.000 = **2.500 gema** (≈ 18 invocações).

> A fina espessura vem de o conteúdo estar incompleto: a rotação gratuita (8 deuses/semana) e o aluguel ranqueado
> estão em `_pendencias` de `economia.json`, ainda não construídos. Isto é medição do que EXISTE, não do plano.

## b) Semanas para 60 e para 100 invocações

60 invocações = 6 × 1.350 = **8.100 gema**. 100 = 10 × 1.350 = **13.500 gema** (**+67%**, confere com o dono).

| ritmo | 60 (8.100) do zero | 60, após os 2.500 iniciais | 100 (13.500) do zero | 100, após os 2.500 |
|---|---|---|---|---|
| Casual (150/sem) | **54 semanas** | 37 | **90 semanas** | 73 |
| Ativo (850/sem) | **9,5 semanas** | 6,6 | **16 semanas** | 13 |

O casual leva **~1 ano** para 60 e **~1 ano e 8 meses** para 100. O ativo (grindando o Sandbox no teto todo dia)
leva **~9,5 → ~16 semanas**. O +67% do pity é sobre uma economia de gema já muito fina.

## c) A cauda sem pity, 3% de SS

Chance de passar **99 invocações sem NENHUM SS**, sem pity, taxa 3%: `0,97^99` = **4,90%**. **Confirmo os ~5% do dono.**
É ~1 em 20 jogadores — a diferença entre "demorei a pegar o Zeus" e "nunca vi um SS", e a segunda é a que faz o
jogador sair. Contexto que a mudança move:

- Esperado de invocações até 1 SS (sem pity): 1/0,03 = **33,3**.
- **Pity 60 (hoje):** `0,97^59` = **16,6%** chegam a bater na garantia dos 60 (o resto pega um SS natural antes).
- **Pity 100:** `0,97^99` = **4,90%** iriam até a garantia dos 100. Ou seja, subir o teto **triplica a cauda**
  (de 16,6% para 4,9% "protegidos cedo" vira "16,6%→ agora esperam até 100"): mais gente sente o azar por mais tempo.

## d) Pity de 100: só do DESTACADO ou de qualquer SS?

"Se não pegar o Zeus em 99, na 100 vem" tem duas leituras — mas **hoje elas coincidem**, por causa do §20: no banner
em destaque **todo SS é o deus destacado** (`pickUnit` SS → sempre o Zeus). Não existe SS não-destacado a distinguir.
As duas leituras só divergem se o design mudar para permitir **SS não-destacado no pool**:

- **Pity de QUALQUER SS:** o contador zera a cada SS (destacado ou não). Cauda de (c) como calculada (4,9% em 99).
- **Pity só do DESTACADO:** o contador zera só quando sai o destacado; um SS não-destacado **não** repõe a garantia.
  A cauda fica **mais longa** (a "taxa efetiva rumo à garantia" cai abaixo de 3%), e o jogador pode ver SS que "não
  contam". É mais generoso na promessa e mais cruel na sensação.

**Recomendação:** manter a regra de hoje — **um pity único de QUALQUER SS, e todo SS do destaque é o destacado**
(§20). É a leitura que não cria "contador que o jogador não vê". Se um dia o pool tiver SS não-destacado, aí sim a
escolha (d) reabre e muda a cauda de (c) — decidir então, com número.

## Recomendação sobre o 60→100

**Não subir agora.** Com a economia de gema atual (150–850/semana), 60 já custa 9,5–54 semanas; 100 empurra para
16–90. O pity de 60 já protege a cauda dos 5% cedo (16,6% chegam nele). Se o alvo é alongar a jornada, o lugar é a
**renda** (construir a rotação gratuita pendente), não o teto do pity — subir o teto pune o azarado sem tocar no
jogador mediano. Reavaliar quando houver dado de invocação real e a renda recorrente estiver completa.

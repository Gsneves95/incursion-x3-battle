# §323 P2 ETAPA B — separar os "só fundos" dos "fechados" (re-medida a 900k sob a v2)

Re-rodei o `solucionador --v2` a **900k nós** (4,5× a régua de 200k) nos 30 conteúdos que o manifesto 200k deixou
INDETERMINADOS (os 2 INVENCÍVEIS — hanuman, guanyu#20 — já estão provados fechados e não entram aqui).
Ferramenta: `tools/remedir_fundo.js`. A faixa de dificuldade é comprimento v2 ∈ **[0,8×, 1,5×] do v1**.

**Veredito geral:** a v2 fechou o catálogo de Ritos quase inteiro. Só **4 dos 30** indeterminados eram "só fundo"
(vencem com mais busca); os outros **26 seguem fechados mesmo a 900k** → vão para a régua de ajuste (ETAPA C).

## SÓ FUNDO — vencem a ≤ 900k e dentro da faixa → saem da fila, SEM ajuste

| conteúdo | veredito | nós até vencer | comp v2 | comp v1 | faixa [0,8×–1,5×] |
|---|---|---|---|---|---|
| rito/aquiles | VENCÍVEL | 468.081 | 32 | 29 | ✓ (23–43) |
| rito/curupira | VENCÍVEL | 200.202 | 34 | 29 | ✓ (23–43) |
| rito/demeter | VENCÍVEL | 403.044 | 42 | 39 | ✓ (31–58) |
| semanal/afrodite#23 | VENCÍVEL | 760.837 | 37 | 31 | ✓ (25–46) |

Observação: estes vencem **deep** (> 200k nós), então o manifesto a 200k ainda os marca INDETERMINADOS. Para o
modo ir a v2 (ETAPA E) sem lhes tocar o conteúdo, a verificação de winnability do modo precisa reconhecer a
vitória profunda (subir o orçamento da verificação, ou marcá-los vencíveis à parte) — decisão da ETAPA E.

## FECHADO a 900k — nem com 4,5× a busca vencem → entram na ETAPA C (alavancas 1→2→3)

Rito (24): `ahpuch`(v1 19) · `amaterasu`(28) · `ammit`(26) · `boitata`(28) · `change`(29) · `hades`(28) ·
`hel`(34) · `hera`(21) · `hercules`(31) · `iansa`(26) · `isis`(36) · `izanami`(23) · `khnum`(36) · `kitsune`(32) ·
`morrigan`(22) · `osiris`(39) · `piranha`(27) · `ra`(19) · `shiva`(30) · `sobek`(32) · `susanoo`(37) · `thor`(24) ·
`vishnu`(25) · `yanwong`(21).

Semanal: `mnevis#25`(v1 38) · `ammit#10`(v1 26 — não venceu dentro do teto de medição de ~9 min a 900k; fechado para a régua).

Já provados INVENCÍVEIS (espaço esgotado, os mais fechados — também vão à ETAPA C): `rito/hanuman`, `semanal/guanyu#20`.

> `isis`, que a 200k tinha a heurística "ainda progredindo" (candidato a fundo), NÃO venceu nem a 900k — era
> fundo mais raso do que parecia, mas ainda assim fechado para a régua. Entra na ETAPA C como os demais.

## Reproduzir

```
node tools/remedir_fundo.js --orc=900000 --only=rito                 # os 27 ritos indeterminados (use --slice=i/4 p/ paralelizar)
node tools/remedir_fundo.js --orc=900000 --only=sem --sem=10,23,25   # ammit#10, afrodite#23, mnevis#25
```

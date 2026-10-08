# §325 / §325b — DOMÍNIOS: time livre do jogador + inimigos da cultura (relatório)

Gerado por `node tools/gerar_dominios.js --todas --semanas=8 --seeds=8 --poolSeeds=6 --pisoN=8`
(na prática, em lotes por cultura <25 min). Dado em `data/dominios/<cultura>.json`.

## O modo (§325)

- O **jogador monta o time** (3 deuses, travado pela corrida). **Todos os inimigos** (comuns e chefes) são da
  **cultura** do Domínio. nv40 = trio **icônico**; chefes 10/20/30 = trios da cultura em dureza crescente.
- `dificuldade[n] = 1 − média de vitória` (vida cheia, IA v2, no danoMult da faixa) de um conjunto fixo de
  **times de referência**, média sobre os times × 8 seeds. `capComum` 0.45. Mesmo método nas 5 culturas.

## §325b — o conjunto de referência (consertado)

O §325 escolhia os refs por **menor raridade + alfabético** → caíam todos em ~7 deuses baratos e fracos, sem cobrir
funções; o `capComum` contra esse conjunto fraco bania quase todos os trios e a variedade dos comuns desabava
(Chinesa 7 comuns, um trio 44×). **§325b** escolhe por **FORÇA v2** (do §324, `docs/kits-forca-v2.txt`): 6 times em
**3 faixas**, **18 deuses distintos FORA das 5 culturas** (nenhum ref é também inimigo), cobrindo as 5 funções.

| faixa | força méd | time | funções |
|---|---|---|---|
| forte | 78.4 | brigid + mulasemcabeca + brahma | Suporte, Atacante |
| forte | 73.0 | oxum + piranha + curupira | Suporte, Atacante, Controlador |
| médio | 60.2 | dagda + kukulkan + saci | Suporte, Atacante, Manipulador |
| médio | 55.0 | exu + kali + itzamna | Manipulador, Atacante, Suporte |
| fraco | 43.6 | chaac + iara + ganesha | Atacante, Controlador, Suporte |
| fraco | 41.1 | durga + iansa + boitata | Atacante, Controlador, Guardião |

Regra determinística: pool = 31 deuses fora das culturas, por força desc; 3 terços (forte/médio/fraco); em cada
terço, 2 times de 3 preferindo funções distintas e completando por força. 18 distintos, cada time ≥2 funções, o
conjunto cobre as 5 funções. **Nenhum ref precisou ser de dentro das culturas.** Gravado em `regua.times`+`regua.faixas`.

**P3** (nv1 vencível pelo que o novato tem) usa o melhor trio formável SÓ com os INICIAIS: **brigid+ogum+nezha**
(`regua.p3Time`) — vence o nv1 das 5 culturas a **100%** sob v2 vida cheia.

## Portões (todos verdes)

- **P1** inimigo = cultura · **P2** monotonia · **P3** nv1 vencível pelo trio de iniciais (100% nas 5).
- **P4** servidor recusa deus nem possuído nem emprestável.
- **P5 (novo)** variedade dos comuns, 8 semanas: (a) ≥70% dos deuses, (b) trio ≤12×, (c) distância ≥5 por semana.

## Por cultura (8 semanas, seeds 8, pool 6)

| Cultura (deuses) | comuns distintos | cobertura | trio máx | dif nv1/10/20/30/40 | piso fraco/médio/forte | tempo |
|---|---|---|---|---|---|---|
| Grega (18)    | 142 | 18/18 (100%) | 5×  | 0.02/0.23/0.50/0.60/0.71 | 0.9 / 1.8 / 1.3 | 357 s |
| Nórdica (14)  | 144 | 14/14 (100%) | 6×  | 0.04/0.25/0.48/0.54/0.67 | 1.0 / 1.6 / 1.4 | 381 s |
| Egípcia (14)  | 128 | 14/14 (100%) | 7×  | 0.10/0.31/0.50/0.69/0.71 | 0.9 / 1.4 / 1.2 | 371 s |
| Japonesa (14) | 206 | 14/14 (100%) | 4×  | 0.04/0.19/0.44/0.48/0.67 | 0.9 / 1.5 / 1.1 | 379 s |
| Chinesa (9)   | 32  | 9/9 (100%)   | 11× | 0.21/0.29/0.50/0.67/0.96 | 0.7 / 1.2 / 1.1 | 169 s |

Antes (§325): comuns distintos usados — Grega ~20, Chinesa 7. **Agora 100% de cobertura em todas**, e o trio mais
repetido ≤ 12× (Chinesa, 9 deuses/84 trios, é o pior caso e ainda passa: 11×).

### Chefes escolhidos (semana 1) — 10 / 20 / 30 / 40

- **Grega:** aquiles/erinias/hercules · medusa/orfeu/zeus · ares/hera/zeus · **zeus/poseidon/atena**
- **Nórdica:** jormungandr/loki/ymir · freyja/heimdall/hel · baldur/bragi/ymir · **loki/odin/thor**
- **Egípcia:** ammit/babi/isis · ammit/khonshu/nefertem · bennu/horus/mnevis · **ra/isis/osiris**
- **Japonesa:** izanagi/raijin/yamatotakeru · izanagi/kagutsuchi/raijin · izanagi/kitsune/tanuki · **amaterasu/susanoo/tsukuyomi**
- **Chinesa:** aokuang/houyi/nezha · huangdi/nuwa/yanwong · guanyu/houyi/huangdi · **nezha/nuwa/sunwukong**

## Nível médio alcançado por FAIXA (piso, política gulosa)

Coluna = média do nível mais fundo alcançado, por faixa de time (fraco/médio/forte), nas 8 semanas. Ver tabela acima.
O piso segue raso (~1–2) porque a vida CARREGA entre níveis e os inimigos da cultura são de elite — o time de
referência cai cedo mesmo vencendo o nv1 a vida cheia. É propriedade honesta da corrida (não um gate); o jogador que
monta um time melhor desce mais fundo. Os times **médios** costumam ir mais fundo que os **fortes** aqui porque os
fortes são Suporte-pesados (curam muito, batem pouco) e a corrida gulosa premia dano sustentado.

## Reproduzir

```
node tools/gerar_dominios.js --todas --semanas=8 --seeds=8 --poolSeeds=6 --pisoN=8   # ou por cultura, em lotes
node tools/dominio_p5_guard.js        # confere o P5 (variedade) das 5 culturas
node tools/dominio_p3_guard.js        # confere o P3 (nv1 × melhor trio de INICIAIS)
node tools/build.js                   # P1/P2/P3/P5 falham o build se o dado quebrar
```

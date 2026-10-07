# §325 — DOMÍNIOS: time livre do jogador + inimigos da cultura (relatório)

Gerado por `node tools/gerar_dominios.js --todas --semanas=8 --seeds=8 --poolSeeds=6 --pisoN=8`.
Dado em `data/dominios/<cultura>.json`. Tempo total da varredura: **~16 min** (970 s de geração + medições).

## O que mudou (resumo)

- O **jogador monta o time** (3 deuses, travado pela corrida). **Todos os inimigos** (comuns e chefes) são da
  **cultura** do Domínio. O nv40 é o trio **icônico**; os chefes 10/20/30 são trios da cultura em dureza crescente.
- A **régua** é um conjunto fixo de **6 times de referência** (determinísticos, menor raridade somada + cobertura
  de funções) — os mesmos nas 5 culturas: `ahpuch+ammit+aquiles`, `ammit+aquiles+babi`, `ammit+baldur+bennu`,
  `ahpuch+ammit+bennu`, `ammit+baldur+boto`, `ahpuch+ammit+baldur`. `dificuldade[n] = 1 − média de vitória`
  (vida cheia, IA v2, no danoMult da faixa), média sobre os 6 times × 8 seeds. `capComum` 0.45.
- **Mesmo método e mesma régua nas 5 culturas** (nenhum parâmetro calibrado por cultura).

## Por cultura (semana × 8, seeds 8, pool 6)

| Cultura (deuses) | Domínio | comuns ≤0.45 | trios distintos / escada (8 sem) | distintos no total | tempo |
|---|---|---|---|---|---|
| Grega (18)    | Olimpo        | —¹        | 23/22/22/22/22/22/22/21 | 29 | 207 s |
| Nórdica (14)  | Asgard        | 40/220    | 33/32/33/32/32/33/32/31 | 48 | 236 s |
| Egípcia (14)  | Duat          | 59/221    | 36/35/34/36/37/34/36/38 | 63 | 237 s |
| Japonesa (14) | Takamagahara  | 59/220    | 36/37/37/35/38/38/36/35 | 59 | 206 s |
| Chinesa (9)   | Céus          | 7/84      | 11/11/11/11/11/11/11/11 | 17 | 84 s |

¹ Grega: o nº de comuns≤0.45 não foi capturado no log (o `tail` cortou o cabeçalho); usa 23 trios distintos/escada,
margem larga sobre a janela de variedade (6). A dureza real varia por cultura (é dado, não defeito): a Chinesa tem
9 deuses de elite → poucos trios "fáceis"; a Egípcia/Japonesa, 14 → dezenas.

### Chefes escolhidos (semana 1) — 10 / 20 / 30 / 40

- **Grega:** hermes/poseidon/zeus · hades/orfeu/poseidon · hades/medusa/perseu · **zeus/poseidon/atena** (icônico)
- **Nórdica:** bragi/jormungandr/mimir · fenrir/mimir/tyr · baldur/odin/tyr · **loki/odin/thor** (icônico)
- **Egípcia:** khnum/khonshu/sobek · anubis/isis/khonshu · isis/khnum/sobek · **ra/isis/osiris** (icônico)
- **Japonesa:** fujin/shutendoji/susanoo · raijin/shutendoji/susanoo · raijin/tsukuyomi/yamatotakeru · **amaterasu/susanoo/tsukuyomi** (icônico)
- **Chinesa:** aokuang/change/guanyu · change/huangdi/sunwukong · change/houyi/yanwong · **nezha/nuwa/sunwukong** (icônico)

## Portões (todos verdes)

- **P1** — todo inimigo é da cultura: 0 fora em nenhuma das 5 escadas (`domValidarLadder`).
- **P2** — escada monotônica em todas as 5 × 8 semanas (selada por construção).
- **P3** — nv1 vencível pelo time **mais barato** (`ahpuch+ammit+aquiles`), v2, vida cheia:
  **Grega 100% · Egípcia 92% · Nórdica 92% · Chinesa 96% · Japonesa 79%** (`tools/dominio_p3_guard.js`, simulado no build).
- **P4** — o servidor recusa replay de Domínio com deus nem possuído nem emprestável; credita com time válido
  (`_timeDominioValido`, empréstimo = starters `INICIAIS`).

## Nível médio alcançado por cada time de referência (piso, semana 1, política gulosa)

Ordem dos times: `ahpuch+ammit+aquiles`, `ammit+aquiles+babi`, `ammit+baldur+bennu`, `ahpuch+ammit+bennu`,
`ammit+baldur+boto`, `ahpuch+ammit+baldur`.

| Cultura | por time (s1) | méd/sem (8) |
|---|---|---|
| Grega    | 1, 1, 1, 1, 0.9, 0.9      | 1/0.9/1/0.8/0.8/0.8/1/0.9 |
| Nórdica  | 1, 1, 1, 0.9, 0.8, 0.9    | 0.9/1/0.9/0.9/0.8/1/0.9/0.8 |
| Egípcia  | 1, 0.9, 0.8, 0.6, 0.3, 0.9| 0.8/0.9/1/0.8/0.8/0.8/0.9/0.8 |
| Japonesa | 0.9, 0.6, 1.3, 0.5, 1.1, 1| 0.9/1/1.1/0.9/1/1/1/1 |
| Chinesa  | 0.8, 0.9, 1, 0.4, 0.4, 0.5| 0.7/0.7/0.8/0.7/0.8/0.8/0.7/0.8 |

**Leitura honesta:** o piso é raso (~1) de propósito. Os times de referência são os **mais fracos** (coleção de
início, cheios de raridade A); eles vencem o nv1 a vida cheia (P3, 79–100%), mas a vida carrega e eles caem cedo
contra deuses de elite da cultura. Isso é a consequência esperada de medir a régua contra uma coleção de início —
não um bug da escada. Um jogador que monta um time melhor (ou recebe empréstimos mais fortes) desce mais fundo.
O P3 separa "começo justo" (nv1 vencível pelo mais barato) de "corrida funda" (que depende do time montado).

## Reproduzir

```
node tools/gerar_dominios.js --todas --semanas=8 --seeds=8 --poolSeeds=6 --pisoN=8
node tools/dominio_p3_guard.js --seeds=24     # confere o P3 de todas as culturas
node tools/build.js                            # P1/P2/P3 falham o build se o dado quebrar
```

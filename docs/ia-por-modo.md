# §322 Parte 3 — ponte de segurança: versão da IA POR MODO

> **Conteúdo impossível no jogo é inaceitável.** A v2 (§322 P2) entrou global, mas sob ela o Rito `hanuman`
> ficou INVENCÍVEL e vários Ritos/semanais ficaram muito mais difíceis. Esta parte põe a versão da IA **por
> modo**, gated por winnability provada.

## A regra (decisão do dono)

Um MODO de PvE só usa a **v2** se **todo o seu conteúdo verificável for VENCÍVEL sob a v2** (pelo
`solucionador`). Enquanto não for, o modo fica na **v1** (a gulosa congelada, que sempre venceu). A **Fase 5**
(recalibragem) é que trará cada modo para a v2. Domínios e sandbox (corrida/time livre, sem solução fixa) usam a
v2, e a mudança de dificuldade é só reportada.

## Como funciona

- **Fonte única:** `data/ia_por_modo.json` (`modos: { … }`). Cliente e servidor leem dela.
  - Cliente: o lançador de cada batalha chama `definirIaVersao(iaVersaoDeModo(modo))` antes de abrir a batalha;
    a IA do turno roda nessa versão. Modo desconhecido/sem tabela → **v1** (falha segura).
  - Replay: carimba a versão que a batalha rodou (`iaVer`); o servidor **re-simula pela versão do envelope**
    (sem `iaVer` → v1; replays antigos e da fila offline seguem válidos).
  - Servidor ao vivo: lê a mesma tabela (`ia.iaVersaoDeModo(modo)`); a partida `pve` ao vivo não é um modo de
    conteúdo (→ v1), em lockstep com a previsão do cliente.
- **Prova:** `data/ia_winnability_v2.json` — gerada por `tools/verificar_pve_v2.js` (roda o `solucionador --v2`
  em todo conteúdo com solução fixa). O **build QUEBRA** se um modo marcado v2 tiver qualquer item não-vencível
  (guarda em `tools/ia_modo_guard.js`; prova que morde: `rito` em v2 → falha por `hanuman`).

## Tabela final por modo

| modo | versão | por quê |
|---|---|---|
| **campanha** | **v2** | 6/6 encontros de batalha VENCÍVEIS sob a v2 (inclui o ato de time livre, resolvido com trio canônico). |
| **dominio** | **v2** | sem solução fixa (corrida); dificuldade reportada abaixo. |
| **sandbox** | **v2** | sem solução fixa (time livre do jogador). |
| **rito** | v1 | `hanuman` INVENCÍVEL sob a v2 + ~27 INDETERMINADOS (muito mais fundos). |
| **desafioDeus** | v1 | usa a MESMA data dos Ritos (`provacaoDe`) — mesma falha. |
| **semanal** | v1 | `guanyu` INVENCÍVEL + `ammit`/`afrodite`/`mnevis` INDETERMINADOS sob a v2. |
| **composicao** | v1 | time do jogador é LIVRE — sem solução única a verificar; conservador até a Fase 5. |

## Itens não-vencíveis sob a v2 (o que segura cada modo na v1)

- **rito / desafioDeus** (100 pergaminhos): **INVENCÍVEL** — `hanuman` ("Devoção a Rama"); **INDETERMINADO a 200k**
  (muito mais fundo que na v1) — ahpuch, amaterasu, ammit, aquiles, boitata, change, demeter, hades, hel, hera,
  hercules, iansa, isis, izanami, khnum, kitsune, morrigan, osiris, piranha, ra, shiva, sobek, susanoo, thor,
  vishnu, yanwong (curupira resolveu a 900k). (Lista autoritativa: `data/ia_winnability_v2.json`.)
- **semanal** (52 puzzles): **INVENCÍVEL** — `guanyu`; **INDETERMINADO** — `ammit`, `afrodite`, `mnevis`.
- **composicao**: não verificável por solução única (time livre).

## Dificuldade de Domínios/sandbox (sem solução fixa) — antes × depois

`tools/medir_dominio_dif.js` (jogador = IA fixa; inimigo v1 × v2; o nível onde a corrida morre):

| cultura | inimigo v1 | inimigo v2 |
|---|---|---|
| Chinesa | nível 1/40 | 1/40 |
| Egípcia | 3/40 | 3/40 |
| Grega | 1/40 | 1/40 |
| Japonesa | 1/40 | 1/40 |
| Nórdica | 1/40 | 1/40 |

A profundidade **não muda** porque a dificuldade dos Domínios é dominada pela ESCALA de atributos, não pela
sofisticação da IA — um jogador-proxy sem níveis morre cedo em qualquer versão. Por fight, a v2 joga melhor
(≈ 59–63% vs v1 em espelho, §322 P2), mas como Domínios não tem solução fixa e já é corrida, a v2 é aceita e o
efeito prático é pequeno nesta medida. sandbox é simétrico (o próprio jogador escolhe o time) — sem conteúdo a
quebrar.

## O que muda para o jogador AGORA

- **Campanha**: enfrenta a IA v2 (usa o kit inteiro) — mais difícil, mas **todo ato continua vencível** (provado).
- **Ritos, Desafios por deus, Semanais, Desafios de composição**: seguem na **v1** (como antes do §322) — nada
  ficou impossível; `hanuman`/`guanyu` e os demais voltam à v2 quando a Fase 5 recalibrar cada modo.
- **Domínios/sandbox**: v2; diferença prática pequena (acima).
- **Replays já gravados** (qualquer modo) continuam creditando: o servidor re-simula pela versão do envelope.

## Reproduzir

```
node tools/verificar_pve_v2.js --modos=campanha,semanal,composicao,rito   # gera data/ia_winnability_v2.json
node tools/medir_dominio_dif.js                                            # dificuldade dos Domínios v1×v2
node tools/build.js                                                        # a guarda quebra se a tabela ↔ prova divergir
```

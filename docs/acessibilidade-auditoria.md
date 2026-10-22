# Auditoria de acessibilidade (§357)

> Gerada por `tools/auditoria_acessibilidade.js` no viewport de referência **780×360** (um S24 deitado; escala do
> desenho ≈ 0,4225). Mede em **px CSS reais** (descontando o transform do enquadramento). Padrão em `docs/guia-visual.md`
> (§357). **Esta tarefa NÃO conserta telas** — só mede e ordena o conserto.

**Mínimos:** corpo ≥ 12px · rótulo/legenda/número pequeno ≥ 11px · título de bloco ≥ 15px · toque ≥ 40×40px · sem rolagem fora das listas · sem corte em nome/custo/efeito.

Colunas: **a)** textos < 12px (corpo) — entre parênteses os < 11px (falham até como rótulo); **b)** toques < 40×40px; **c)** rolagens proibidas (fora da lista branca); **d)** cortes (reticências em info importante / estouro do viewport).

Lista branca de rolagem (permitida — são LISTAS): `.col2__grade`, `.dm-grade`, `.cgrid--pick`, `#provfix .pv2-grade`, `#provfix .pv2-off`, `.df-grade`, `#compfix .cmp-grade`, `.guia-grade`, `.loja`, `#loja`, `.loja-grade`.

Nota 0–10 (transparente): `10·(0,5·textoOK + 0,2·toqueOK + 0,3·rolagemOK) − penal.corte`, onde textoOK/toqueOK são a fração de itens dentro do mínimo, rolagemOK = `1/(1+nº rolagens)` e a penalidade de corte é `0,1·nº` (máx 2).

## Resumo (ordem de conserto — pior primeiro)

| # | Tela | a) texto<12 (<11) | b) toque<40 | c) rolagem | d) corte | nota | print |
|--:|------|--:|--:|--:|--:|:--:|------|
| 1 | Desafios (hub) | 90 (85) | 16 | 0 | 9 | **2.4** | `357-desafios-780x360.png` |
| 2 | Campanha — ato de batalha | 43 (41) | 6 | 1 | 1 | **3.1** | `357-campanha-batalha-780x360.png` |
| 3 | Composição (desafios) | 51 (45) | 7 | 0 | 0 | **3.1** | `357-composicao-780x360.png` |
| 4 | Guia (folha de componentes, dev) | 57 (57) | 8 | 0 | 0 | **3.1** | `357-guia-780x360.png` |
| 5 | Seleção de time (Batalha CPU/hot-seat) | 70 (64) | 30 | 0 | 0 | **3.5** | `357-montar-selecao-780x360.png` |
| 6 | Montar time — encontro da campanha | 56 (56) | 26 | 0 | 0 | **3.8** | `357-montar-campanha-780x360.png` |
| 7 | Montar time — Desafio de composição | 62 (62) | 25 | 0 | 0 | **3.8** | `357-montar-desafio-780x360.png` |
| 8 | PvP — lobby (time montado) | 61 (61) | 30 | 0 | 0 | **3.8** | `357-pvp-780x360.png` |
| 9 | Montar time — Domínio (corrida) | 59 (59) | 24 | 0 | 0 | **3.9** | `357-montar-dominio-780x360.png` |
| 10 | PvP — na fila | 61 (61) | 30 | 0 | 0 | **3.9** | `357-pvp-fila-780x360.png` |
| 11 | Domínios — seleção | 65 (59) | 5 | 0 | 2 | **3.9** | `357-dominios-780x360.png` |
| 12 | Domínio — hub | 32 (32) | 3 | 0 | 0 | **4.1** | `357-dominio-hub-780x360.png` |
| 13 | Batalha — menu | 50 (49) | 24 | 0 | 0 | **4.1** | `357-batalha-menu-780x360.png` |
| 14 | Batalha — meu turno | 39 (38) | 15 | 0 | 0 | **4.4** | `357-batalha-meu-turno-780x360.png` |
| 15 | Batalha — turno do oponente | 41 (40) | 15 | 0 | 0 | **4.4** | `357-batalha-oponente-780x360.png` |
| 16 | Batalha — inspeção da habilidade | 43 (42) | 15 | 0 | 0 | **4.4** | `357-batalha-inspecao-780x360.png` |
| 17 | Batalha — habilidade armada | 43 (42) | 12 | 0 | 0 | **4.5** | `357-batalha-armada-780x360.png` |
| 18 | Campanha — ato de escolha | 39 (39) | 7 | 0 | 0 | **4.5** | `357-campanha-escolha-780x360.png` |
| 19 | Invocação — revelação | 20 (20) | 8 | 0 | 0 | **4.5** | `357-invocacao-reveal-780x360.png` |
| 20 | Home | 22 (22) | 2 | 0 | 0 | **4.6** | `357-home-780x360.png` |
| 21 | Invocação — tela | 18 (18) | 6 | 0 | 0 | **4.6** | `357-invocacao-780x360.png` |
| 22 | Batalha — confirmação de sair | 41 (39) | 17 | 0 | 0 | **4.6** | `357-batalha-confirmar-sair-780x360.png` |
| 23 | Batalha — confirmação de desistir | 41 (38) | 17 | 0 | 0 | **4.6** | `357-batalha-confirmar-desistir-780x360.png` |
| 24 | Carregamento (splash) | 22 (22) | 2 | 0 | 0 | **4.8** | `357-carregamento-780x360.png` |
| 25 | Provações | 51 (51) | 1 | 0 | 3 | **4.8** | `357-provacoes-780x360.png` |
| 26 | Campanha — ato de história (sintético) | 23 (23) | 3 | 0 | 0 | **5.3** | `357-campanha-historia-780x360.png` |
| 27 | Em breve (marcador) | 2 (2) | 2 | 0 | 0 | **6.3** | `357-embreve-780x360.png` |
| 28 | Coleção — sem seleção | 0 (0) | 0 | 0 | 0 | **10** | `357-colecao-780x360.png` |
| 29 | Coleção — com filtro | 0 (0) | 0 | 0 | 0 | **10** | `357-colecao-filtro-780x360.png` |
| 30 | Ficha do deus — SINERGIA | 0 (0) | 0 | 0 | 0 | **10** | `357-ficha-sinergia-780x360.png` |
| 31 | Ficha do deus — não possuída | 0 (0) | 0 | 0 | 0 | **10** | `357-ficha-falta-780x360.png` |
| 32 | Ficha do deus | 0 (0) | 0 | 0 | 0 | **10** | `357-ficha-780x360.png` |
| 33 | Níveis de habilidade | 0 (0) | 0 | 0 | 0 | **10** | `357-niveis-780x360.png` |

## Detalhe por tela

### Desafios (hub) — nota 2.4

Print: `docs/telas/357-desafios-780x360.png`. Contagens: a=90, b=16, c=0, d=9. (textos visíveis: 94; tocáveis: 17.)

**a) 10 piores textos pequenos** (px real):

- `span.df-mestres__lab` — **8.44px** ⚠<11 — "★ Mestres"
- `button.df-chip` — **8.44px** ⚠<11 — "Disponíveis"
- `b` — **8.44px** ⚠<11 — "(9)"
- `span.df-sem__rot` — **8.45px** ⚠<11 — "DESAFIO DA SEMANA"
- `b` — **8.45px** ⚠<11 — "#43"
- `span.df-sem__obj` — **8.45px** ⚠<11 — "Mantenha Ogum de pé em 15 turnos."
- `span.df-sem__reclab` — **8.45px** ⚠<11 — "RECOMPENSA"
- `small` — **8.45px** ⚠<11 — "Complete formações específicas e ganhe r"
- `span.df-compos__n` — **8.45px** ⚠<11 — "0 de 6 cumpridos"
- `span` — **8.45px** ⚠<11 — "↻ Recarga de 8 h após comprar"

**b) 10 piores toques** (menor lado):

- `#bvoltar` — **54.1×30.4** — "‹ INÍCIO"
- `button.dfb.dfb--jogar` — **62.9×30.4** — "JOGAR"
- `button.df-regras__q` — **30.4×30.4** — "?"
- `button.df-chip.is-on` — **51×30.4** — "Todos (9)"
- `button.df-chip` — **69.6×30.4** — "Disponíveis (9)"
- `button.df-chip` — **83.4×30.4** — "Em andamento (0)"
- `button.df-chip` — **58.8×30.4** — "Recarga (0)"
- `button.df-chip` — **58.4×30.4** — "Mestres (0)"
- `button.df-ordenar` — **77.5×30.4** — "Ordenar: Padrão ▾"
- `button.dfb.dfb--ghost` — **98×30.4** — "⌂ Onde ganhar Essência?"

**d) cortes:**

- [estoura-viewport] `span` — "5"
- [estoura-viewport] `span` — "15"
- [estoura-viewport] `span` — "30"
- [estoura-viewport] `span` — "5"
- [estoura-viewport] `span` — "15"
- [estoura-viewport] `span` — "30"
- [estoura-viewport] `span` — "5"
- [estoura-viewport] `span` — "15"
- [estoura-viewport] `span` — "30"

### Campanha — ato de batalha — nota 3.1

Print: `docs/telas/357-campanha-batalha-780x360.png`. Contagens: a=43, b=6, c=1, d=1. (textos visíveis: 48; tocáveis: 14.)

**a) 10 piores textos pequenos** (px real):

- `span.crec__u` — **5.3px** ⚠<11 — "GEMAS"
- `span.cslot__nome` — **5.9px** ⚠<11 — "Zeus"
- `span.cslot__nome` — **5.9px** ⚠<11 — "Nezha"
- `span.cslot__nome` — **5.9px** ⚠<11 — "Hades"
- `span.camp__form` — **5.9px** ⚠<11 — "3 VS 3"
- `span.camp__capeye` — **6.73px** ⚠<11 — "CAPÍTULO I"
- `span.camp__lbl.camp__lbl--rec` — **6.73px** ⚠<11 — "Recompensas"
- `span.cnode__nome` — **6.73px** ⚠<11 — "Fragmentos fora de lugar"
- `span.cnode__nome` — **6.73px** ⚠<11 — "O Conselho Temporário"
- `span.cnode__nome` — **6.73px** ⚠<11 — "Alianças, conflitos e oportunidades"

**b) 10 piores toques** (menor lado):

- `#capprev` — **7.8×15.1** — "‹"
- `#build` — **131.5×8** — "build 2026-10-22 15:08 UTC"
- `#bvoltar` — **65.4×20.2** — "Início"
- `#campcta` — **351.5×27.8** — "Jogar"
- `button.camp__kitchip` — **351.5×28.6** — "Kit reveladoHel — ver as 4 hab"
- `button.camp__kitchip` — **351.5×28.6** — "Kit reveladoFenrir — ver as 4 "

**c) rolagens proibidas:**

- `div.camp__briefrol` — eixo Y, +80px — "“Você desconfiou do silêncio, "

**d) cortes:**

- [ellipsis] `span.camp__capep` — "“A dispersão não foi aleatória. Foi o in"

### Composição (desafios) — nota 3.1

Print: `docs/telas/357-composicao-780x360.png`. Contagens: a=51, b=7, c=0, d=0. (textos visíveis: 52; tocáveis: 7.)

**a) 10 piores textos pequenos** (px real):

- `span.cmp-foe__n` — **7.61px** ⚠<11 — "Saci"
- `span.cmp-foe__n` — **7.61px** ⚠<11 — "Loki"
- `span.cmp-foe__n` — **7.61px** ⚠<11 — "Cuca"
- `span.cmp-foe__n` — **7.61px** ⚠<11 — "Saci"
- `span.cmp-foe__n` — **7.61px** ⚠<11 — "Cuca"
- `span.cmp-foe__n` — **7.61px** ⚠<11 — "Boto"
- `span.cmp-foe__n` — **7.61px** ⚠<11 — "Loki"
- `span.cmp-foe__n` — **7.61px** ⚠<11 — "Cuca"
- `span.cmp-foe__n` — **7.61px** ⚠<11 — "Saci"
- `span.cmp-foe__n` — **7.61px** ⚠<11 — "Saci"

**b) 10 piores toques** (menor lado):

- `#bvoltar` — **68.8×30.4** — "‹ DESAFIOS"
- `button.cmpb.cmpb--primary` — **55×30.4** — "JOGAR"
- `button.cmpb.cmpb--primary` — **55×30.4** — "JOGAR"
- `button.cmpb.cmpb--primary` — **55×30.4** — "JOGAR"
- `button.cmpb.cmpb--primary` — **55×30.4** — "JOGAR"
- `button.cmpb.cmpb--primary` — **55×30.4** — "JOGAR"
- `button.cmpb.cmpb--primary` — **55×30.4** — "JOGAR"

### Guia (folha de componentes, dev) — nota 3.1

Print: `docs/telas/357-guia-780x360.png`. Contagens: a=57, b=8, c=0, d=0. (textos visíveis: 58; tocáveis: 8.)

**a) 10 piores textos pequenos** (px real):

- `span.nltop__ptn` — **5.48px** ⚠<11 — "Pontos de Zeus:"
- `b` — **5.48px** ⚠<11 — "0"
- `span.nltop__cop` — **5.48px** ⚠<11 — "cópias repetidas viram pontos"
- `span.dsk__nv` — **5.49px** ⚠<11 — "Nv 3"
- `span.dmaes__rot` — **5.49px** ⚠<11 — "MAESTRIA"
- `div.dmaes__nv` — **5.49px** ⚠<11 — "Noviço ·"
- `b` — **5.49px** ⚠<11 — "0/30"
- `span.nlp__confq` — **5.49px** ⚠<11 — "Subir para Nv 2 por 1 ponto?"
- `button.nlb.nlb--go` — **5.49px** ⚠<11 — "CONFIRMAR"
- `button.nlb.nlb--quiet` — **5.49px** ⚠<11 — "CANCELAR"

**b) 10 piores toques** (menor lado):

- `button.df-toast__x` — **12.2×11.4** — "✕"
- `button.nlb.nlb--go` — **32.3×16.9** — "CONFIRMAR"
- `button.nlb.nlb--quiet` — **29.3×16.9** — "CANCELAR"
- `#bvoltar` — **58.1×30.4** — "‹ VOLTAR"
- `button.cmpb.cmpb--primary` — **51.6×30.4** — "JOGAR"
- `button.cmpb.cmpb--quiet` — **86.3×30.4** — "JOGAR DE NOVO"
- `span.df-chip` — **45.9×30.4** — "Todas 6"
- `span.df-chip.is-on` — **72.5×30.4** — "Conquistadas 2"

### Seleção de time (Batalha CPU/hot-seat) — nota 3.5

Print: `docs/telas/357-montar-selecao-780x360.png`. Contagens: a=70, b=30, c=0, d=0. (textos visíveis: 71; tocáveis: 39.)

**a) 10 piores textos pequenos** (px real):

- `span.sel-time__who` — **6.34px** ⚠<11 — "CPU"
- `p.sel-info` — **6.76px** ⚠<11 — "A vitória rende 💎 · teto 5/dia · não av"
- `b` — **6.76px** ⚠<11 — "20"
- `#bcpu` — **7.18px** ⚠<11 — "OPONENTE: CPU"
- `button.sel-seg__b` — **7.18px** ⚠<11 — "2 JOGADORES"
- `span.sel-time__c` — **7.61px** ⚠<11 — "0/3"
- `span.sel-vaga__txt` — **7.61px** ⚠<11 — "Escolha um deus"
- `span.sel-vaga__txt` — **7.61px** ⚠<11 — "Escolha um deus"
- `span.sel-vaga__txt` — **7.61px** ⚠<11 — "Escolha um deus"
- `span.sel-time__c` — **7.61px** ⚠<11 — "0/3"

**b) 10 piores toques** (menor lado):

- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `#bcpu` — **105.2×22** — "OPONENTE: CPU"

### Montar time — encontro da campanha — nota 3.8

Print: `docs/telas/357-montar-campanha-780x360.png`. Contagens: a=56, b=26, c=0, d=0. (textos visíveis: 60; tocáveis: 35.)

**a) 10 piores textos pequenos** (px real):

- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-ini__n` — **8.03px** ⚠<11 — "Elemental"

**b) 10 piores toques** (menor lado):

- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `button.dm-vaga__x` — **18.6×18.6** — "✕"

### Montar time — Desafio de composição — nota 3.8

Print: `docs/telas/357-montar-desafio-780x360.png`. Contagens: a=62, b=25, c=0, d=0. (textos visíveis: 66; tocáveis: 34.)

**a) 10 piores textos pequenos** (px real):

- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__off` — **7.61px** ⚠<11 — "Outro elemento"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__off` — **7.61px** ⚠<11 — "Outro elemento"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__off` — **7.61px** ⚠<11 — "Outro elemento"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__off` — **7.61px** ⚠<11 — "Outro elemento"

**b) 10 piores toques** (menor lado):

- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `button.dm-vaga__x` — **18.6×18.6** — "✕"

### PvP — lobby (time montado) — nota 3.8

Print: `docs/telas/357-pvp-780x360.png`. Contagens: a=61, b=30, c=0, d=0. (textos visíveis: 65; tocáveis: 39.)

**a) 10 piores textos pequenos** (px real):

- `#pvpultimo` — **7.6px** ⚠<11 — "↺ Usar último time"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"

**b) 10 piores toques** (menor lado):

- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `button.dm-vaga__x` — **18.6×18.6** — "✕"

### Montar time — Domínio (corrida) — nota 3.9

Print: `docs/telas/357-montar-dominio-780x360.png`. Contagens: a=59, b=24, c=0, d=0. (textos visíveis: 63; tocáveis: 33.)

**a) 10 piores textos pequenos** (px real):

- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `div.dm-ctx__trava` — **8.45px** ⚠<11 — "O time fica travado durante a corrida."

**b) 10 piores toques** (menor lado):

- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `#bvoltar` — **76.1×30.4** — "‹ VOLTAR"

### PvP — na fila — nota 3.9

Print: `docs/telas/357-pvp-fila-780x360.png`. Contagens: a=61, b=30, c=0, d=0. (textos visíveis: 67; tocáveis: 39.)

**a) 10 piores textos pequenos** (px real):

- `#pvpultimo` — **7.6px** ⚠<11 — "↺ Usar último time"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"
- `span.dm-card__i` — **7.61px** ⚠<11 — "i"

**b) 10 piores toques** (menor lado):

- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `span.dm-card__i` — **14.4×14.4** — "i"
- `button.dm-vaga__x` — **18.6×18.6** — "✕"

### Domínios — seleção — nota 3.9

Print: `docs/telas/357-dominios-780x360.png`. Contagens: a=65, b=5, c=0, d=2. (textos visíveis: 66; tocáveis: 10.)

**a) 10 piores textos pequenos** (px real):

- `span.dcard__frase` — **6.73px** ⚠<11 — "A revolta, a lança e a mão que remendou "
- `i` — **6.73px** ⚠<11 — "Wukong"
- `i` — **6.73px** ⚠<11 — "Nezha"
- `i` — **6.73px** ⚠<11 — "Nüwa"
- `span.dcard__frase` — **6.73px** ⚠<11 — "A barca, a magia e o rei que volta."
- `i` — **6.73px** ⚠<11 — "Rá"
- `i` — **6.73px** ⚠<11 — "Ísis"
- `i` — **6.73px** ⚠<11 — "Osíris"
- `span.dcard__frase` — **6.73px** ⚠<11 — "O raio, o tridente e a lança que pensa."
- `i` — **6.73px** ⚠<11 — "Zeus"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 15:08 UTC"
- `#dajuda` — **21.9×21.9** — "?"
- `#dhistver` — **102.3×25.2** — "Ver histórico"
- `#binicio` — **28.6×28.6** — ""
- `#dhist` — **115.4×37.9** — "Seu históricoseus recordes por"

**d) cortes:**

- [ellipsis] `i` — "Amaterasu"
- [ellipsis] `i` — "Tsukuyomi"

### Domínio — hub — nota 4.1

Print: `docs/telas/357-dominio-hub-780x360.png`. Contagens: a=32, b=3, c=0, d=0. (textos visíveis: 41; tocáveis: 3.)

**a) 10 piores textos pequenos** (px real):

- `i.dh-no__n` — **8.45px** ⚠<11 — "1"
- `i.dh-no__n` — **8.45px** ⚠<11 — "10"
- `i.dh-no__n` — **8.45px** ⚠<11 — "20"
- `i.dh-no__n` — **8.45px** ⚠<11 — "30"
- `i.dh-no__n` — **8.45px** ⚠<11 — "40"
- `span.dh-un__hint` — **8.45px** ⚠<11 — "Você monta o time ao começar"
- `span.dh-un__hint` — **8.45px** ⚠<11 — "Você monta o time ao começar"
- `span.dh-un__hint` — **8.45px** ⚠<11 — "Você monta o time ao começar"
- `div.dh-cf__n` — **8.45px** ⚠<11 — "Zeus"
- `div.dh-cf__n` — **8.45px** ⚠<11 — "Poseidon"

**b) 10 piores toques** (menor lado):

- `#bvoltar` — **59.6×30.4** — "‹ VOLTAR"
- `#dajuda` — **30.4×30.4** — "?"
- `#dentrar` — **175.5×31.3** — "MONTAR TIME E COMEÇAR ›"

### Batalha — menu — nota 4.1

Print: `docs/telas/357-batalha-menu-780x360.png`. Contagens: a=50, b=24, c=0, d=0. (textos visíveis: 53; tocáveis: 42.)

**a) 10 piores textos pequenos** (px real):

- `#bmenubuild` — **5.49px** ⚠<11 — "build 2026-10-22 15:08 UTC"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `span` — **6.76px** ⚠<11 — "GRÁTIS"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"

**b) 10 piores toques** (menor lado):

- `input.b5-range` — **92.5×2.5** — ""
- `#bmenubuild` — **148.7×6.8** — "build 2026-10-22 15:08 UTC"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `#btrocar` — **57.9×14.4** — "⇄TROCAR"
- `#bmenu` — **19.4×19.4** — ""

### Batalha — meu turno — nota 4.4

Print: `docs/telas/357-batalha-meu-turno-780x360.png`. Contagens: a=39, b=15, c=0, d=0. (textos visíveis: 42; tocáveis: 33.)

**a) 10 piores textos pequenos** (px real):

- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `span` — **6.76px** ⚠<11 — "GRÁTIS"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"

**b) 10 piores toques** (menor lado):

- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `#btrocar` — **57.9×14.4** — "⇄TROCAR"
- `#bmenu` — **19.4×19.4** — ""
- `#bend2` — **129.7×22** — "ENCERRAR TURNO"
- `button.b5-hover` — **24.5×24.5** — ""

### Batalha — turno do oponente — nota 4.4

Print: `docs/telas/357-batalha-oponente-780x360.png`. Contagens: a=41, b=15, c=0, d=0. (textos visíveis: 44; tocáveis: 33.)

**a) 10 piores textos pequenos** (px real):

- `div.bt-hp__lab` — **6.76px** ⚠<11 — "99/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `span` — **6.76px** ⚠<11 — "GRÁTIS"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"

**b) 10 piores toques** (menor lado):

- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `#btrocar` — **57.9×14.4** — "⇄TROCAR"
- `#bmenu` — **19.4×19.4** — ""
- `#bend2` — **129.7×22** — "TURNO DO OPONENTE"
- `button.b5-hover` — **24.5×24.5** — ""

### Batalha — inspeção da habilidade — nota 4.4

Print: `docs/telas/357-batalha-inspecao-780x360.png`. Contagens: a=43, b=15, c=0, d=0. (textos visíveis: 46; tocáveis: 33.)

**a) 10 piores textos pequenos** (px real):

- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `span` — **6.76px** ⚠<11 — "GRÁTIS"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"

**b) 10 piores toques** (menor lado):

- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `#btrocar` — **57.9×14.4** — "⇄TROCAR"
- `#bmenu` — **19.4×19.4** — ""
- `#bend2` — **129.7×22** — "ENCERRAR TURNO"
- `button.b5-hover` — **24.5×24.5** — ""

### Batalha — habilidade armada — nota 4.5

Print: `docs/telas/357-batalha-armada-780x360.png`. Contagens: a=43, b=12, c=0, d=0. (textos visíveis: 46; tocáveis: 30.)

**a) 10 piores textos pequenos** (px real):

- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `span` — **6.76px** ⚠<11 — "GRÁTIS"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"

**b) 10 piores toques** (menor lado):

- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `#btrocar` — **57.9×14.4** — "⇄TROCAR"
- `#bmenu` — **19.4×19.4** — ""
- `#bend2` — **129.7×22** — "ENCERRAR TURNO"
- `button.b5-hover` — **24.5×24.5** — ""

### Campanha — ato de escolha — nota 4.5

Print: `docs/telas/357-campanha-escolha-780x360.png`. Contagens: a=39, b=7, c=0, d=0. (textos visíveis: 43; tocáveis: 14.)

**a) 10 piores textos pequenos** (px real):

- `span.cnode__nome` — **6.73px** ⚠<11 — "A Era dos Planos"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Incursão"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Criação do Eixo"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Profecia do Uno"
- `span.cnode__nome` — **6.73px** ⚠<11 — "O Início do Conflito"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Ruptura entre Céu e Terra"
- `span.cnode__nome` — **6.73px** ⚠<11 — "O Ciclo dos Expulsos"
- `span.camp__capeye` — **6.74px** ⚠<11 — "PRÓLOGO"
- `span.camp__num` — **7.31px** ⚠<11 — "TRECHO I"
- `span.camp__capep` — **7.32px** ⚠<11 — "“Antes da unidade, havia o multiverso da"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 15:08 UTC"
- `#bvoltar` — **65.4×20.2** — "Início"
- `#campcta` — **351.5×27.8** — "Confirmar escolha"
- `button.copc` — **351.5×35.3** — "OL OlimpoOs que governam do al"
- `button.copc` — **351.5×35.3** — "AS AsgardOs salões de guerra o"
- `button.copc` — **351.5×35.3** — "DU DuatO rio, a balança e a lo"
- `button.copc` — **351.5×35.3** — "XI XibalbaAs cavernas sagradas"

### Invocação — revelação — nota 4.5

Print: `docs/telas/357-invocacao-reveal-780x360.png`. Contagens: a=20, b=8, c=0, d=0. (textos visíveis: 25; tocáveis: 11.)

> Nota: A revelação é autoritativa do SERVIDOR; no modo arquivo (sem WS) as cartas não chegam. Aqui a sobreposição é aberta com o esqueleto REAL (`#iv-reveal`) para auditar a moldura (dica + "Invocar mais"); as cartas (`.iv-card`) precisam do servidor vivo.

**a) 10 piores textos pequenos** (px real):

- `span.iv-off` — **7.57px** ⚠<11 — "10% OFF"
- `#build` — **8px** ⚠<11 — "build 2026-10-22 15:08 UTC"
- `span.iv-hero__tag` — **8.4px** ⚠<11 — "RATE-UP"
- `button.iv-oferta` — **8.4px** ⚠<11 — "— 10× grátis, SS garantido"
- `b` — **8.4px** ⚠<11 — "Bênção do Iniciante"
- `button.iv-hero__det` — **9.24px** ⚠<11 — "Ver detalhes"
- `button.iv-plus` — **9.26px** ⚠<11 — "+"
- `span.iv-pity__lbl` — **9.26px** ⚠<11 — "SS garantido"
- `div.iv-tip` — **9.26px** ⚠<11 — "toque fora para voltar"
- `span.iv-c.iv-cess` — **10.1px** ⚠<11 — "✦"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 15:08 UTC"
- `button.iv-plus` — **15.1×15.1** — "+"
- `button.iv-pity__q` — **18.5×18.5** — "?"
- `button.iv-oferta` — **245.2×23.6** — "Bênção do Iniciante — 10× grát"
- `button.iv-hbtn` — **25.2×25.2** — "‹"
- `button.iv-hero__det` — **108.5×26.9** — "⌕ Ver detalhes"
- `div.iv-revfoot` — **121.1×28.6** — "Invocar mais ×1"
- `#iv-revagain` — **121.1×28.6** — "Invocar mais ×1"

### Home — nota 4.6

Print: `docs/telas/357-home-780x360.png`. Contagens: a=22, b=2, c=0, d=0. (textos visíveis: 22; tocáveis: 10.)

**a) 10 piores textos pequenos** (px real):

- `#build` — **8px** ⚠<11 — "build 2026-10-22 15:08 UTC"
- `span.ilha__camptxt` — **8.41px** ⚠<11 — "Capítulo I · Grécia"
- `span.ilha__campnum` — **8.41px** ⚠<11 — "0/6"
- `span.ilha__cont` — **8.41px** ⚠<11 — "91"
- `span.ilha__cont` — **8.41px** ⚠<11 — "100"
- `span.ilha__cont` — **8.41px** ⚠<11 — "0/60"
- `span.ilha__cont` — **8.41px** ⚠<11 — "9/100"
- `span.ilha__breveTag` — **8.41px** ⚠<11 — "· em breve"
- `span.mmoeda__ic.mmoeda__ic--gema` — **10.1px** ⚠<11 — "💎"
- `span.mmoeda__ic.mmoeda__ic--ess` — **10.1px** ⚠<11 — "◈"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 15:08 UTC"
- `button.mperfil` — **98.7×33.6** — "Jogador"

### Invocação — tela — nota 4.6

Print: `docs/telas/357-invocacao-780x360.png`. Contagens: a=18, b=6, c=0, d=0. (textos visíveis: 23; tocáveis: 8.)

**a) 10 piores textos pequenos** (px real):

- `span.iv-off` — **7.57px** ⚠<11 — "10% OFF"
- `#build` — **8px** ⚠<11 — "build 2026-10-22 15:08 UTC"
- `span.iv-hero__tag` — **8.4px** ⚠<11 — "RATE-UP"
- `button.iv-oferta` — **8.4px** ⚠<11 — "— 10× grátis, SS garantido"
- `b` — **8.4px** ⚠<11 — "Bênção do Iniciante"
- `button.iv-hero__det` — **9.24px** ⚠<11 — "Ver detalhes"
- `button.iv-plus` — **9.26px** ⚠<11 — "+"
- `span.iv-pity__lbl` — **9.26px** ⚠<11 — "SS garantido"
- `span.iv-c.iv-cess` — **10.1px** ⚠<11 — "✦"
- `#iv-essencia` — **10.1px** ⚠<11 — "—"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 15:08 UTC"
- `button.iv-plus` — **15.1×15.1** — "+"
- `button.iv-pity__q` — **18.5×18.5** — "?"
- `button.iv-oferta` — **245.2×23.6** — "Bênção do Iniciante — 10× grát"
- `button.iv-hbtn` — **25.2×25.2** — "‹"
- `button.iv-hero__det` — **108.5×26.9** — "⌕ Ver detalhes"

### Batalha — confirmação de sair — nota 4.6

Print: `docs/telas/357-batalha-confirmar-sair-780x360.png`. Contagens: a=41, b=17, c=0, d=0. (textos visíveis: 46; tocáveis: 35.)

**a) 10 piores textos pequenos** (px real):

- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `span` — **6.76px** ⚠<11 — "GRÁTIS"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"

**b) 10 piores toques** (menor lado):

- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `#btrocar` — **57.9×14.4** — "⇄TROCAR"
- `#bmenu` — **19.4×19.4** — ""
- `#bend2` — **129.7×22** — "ENCERRAR TURNO"
- `button.b5-hover` — **24.5×24.5** — ""

### Batalha — confirmação de desistir — nota 4.6

Print: `docs/telas/357-batalha-confirmar-desistir-780x360.png`. Contagens: a=41, b=17, c=0, d=0. (textos visíveis: 46; tocáveis: 35.)

**a) 10 piores textos pequenos** (px real):

- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `span` — **6.76px** ⚠<11 — "GRÁTIS"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"

**b) 10 piores toques** (menor lado):

- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `#btrocar` — **57.9×14.4** — "⇄TROCAR"
- `#bmenu` — **19.4×19.4** — ""
- `#bend2` — **129.7×22** — "ENCERRAR TURNO"
- `button.b5-hover` — **24.5×24.5** — ""

### Carregamento (splash) — nota 4.8

Print: `docs/telas/357-carregamento-780x360.png`. Contagens: a=22, b=2, c=0, d=0. (textos visíveis: 23; tocáveis: 10.)

**a) 10 piores textos pequenos** (px real):

- `#build` — **8px** ⚠<11 — "build 2026-10-22 15:08 UTC"
- `span.ilha__camptxt` — **8.41px** ⚠<11 — "Cap. I · Grécia"
- `span.ilha__campnum` — **8.41px** ⚠<11 — "0/6"
- `span.ilha__cont` — **8.41px** ⚠<11 — "91"
- `span.ilha__cont` — **8.41px** ⚠<11 — "100"
- `span.ilha__cont` — **8.41px** ⚠<11 — "0/60"
- `span.ilha__cont` — **8.41px** ⚠<11 — "9/100"
- `span.ilha__breveTag` — **8.41px** ⚠<11 — "· em breve"
- `span.mmoeda__ic.mmoeda__ic--gema` — **10.1px** ⚠<11 — "💎"
- `span.mmoeda__ic.mmoeda__ic--ess` — **10.1px** ⚠<11 — "◈"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 15:08 UTC"
- `button.mperfil` — **98.7×33.6** — "Jogador"

### Provações — nota 4.8

Print: `docs/telas/357-provacoes-780x360.png`. Contagens: a=51, b=1, c=0, d=3. (textos visíveis: 53; tocáveis: 16.)

**a) 10 piores textos pequenos** (px real):

- `span.mcat__f` — **7.59px** ⚠<11 — "2 objetivos · ranque Semideus"
- `span.mcat__m` — **7.59px** ⚠<11 — "A seca e a morte vêm quando a chuva falh"
- `span.mcat__f` — **7.59px** ⚠<11 — "3 objetivos · ranque Suplicante"
- `span.mcat__m` — **7.59px** ⚠<11 — "Os dois pesam o que o rio devolve."
- `span.mcat__f` — **7.59px** ⚠<11 — "3 objetivos · ranque Suplicante"
- `span.mcat__m` — **7.59px** ⚠<11 — "Filho de Zeus e Hera, o furor da guerra."
- `span.mcat__f` — **7.6px** ⚠<11 — "3 objetivos · ranque Adepto"
- `span.mcat__m` — **7.6px** ⚠<11 — "Amantes — a beleza e a guerra atadas."
- `span.mcat__f` — **7.6px** ⚠<11 — "2 objetivos · ranque Iniciado"
- `span.mcat__m` — **7.6px** ⚠<11 — "Devora o coração que Anúbis reprova na b"

**b) 10 piores toques** (menor lado):

- `#bvoltar` — **50.9×30.4** — "‹ INÍCIO"

**d) cortes:**

- [estoura-viewport] `span.mcat__m` — "A gata guarda a casa antes de o templo e"
- [estoura-viewport] `span.mcat__m` — "A garça que renasce no fogo do sol."
- [estoura-viewport] `span.mcat__m` — "A cobra de fogo e o guardião protegem o "

### Campanha — ato de história (sintético) — nota 5.3

Print: `docs/telas/357-campanha-historia-780x360.png`. Contagens: a=23, b=3, c=0, d=0. (textos visíveis: 28; tocáveis: 10.)

> Nota: A campanha atual só tem atos de batalha e escolha; este caso força `tipo='historia'` num ato real para auditar o caminho de render da história.

**a) 10 piores textos pequenos** (px real):

- `span.cnode__nome` — **6.73px** ⚠<11 — "A Era dos Planos"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Incursão"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Criação do Eixo"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Profecia do Uno"
- `span.cnode__nome` — **6.73px** ⚠<11 — "O Início do Conflito"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Ruptura entre Céu e Terra"
- `span.cnode__nome` — **6.73px** ⚠<11 — "O Ciclo dos Expulsos"
- `span.camp__capeye` — **6.74px** ⚠<11 — "PRÓLOGO"
- `span.camp__num` — **7.31px** ⚠<11 — "TRECHO I"
- `span.camp__capep` — **7.32px** ⚠<11 — "“Antes da unidade, havia o multiverso da"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 15:08 UTC"
- `#bvoltar` — **65.4×20.2** — "Início"
- `#campcta` — **246×27.8** — "Continuar"

### Em breve (marcador) — nota 6.3

Print: `docs/telas/357-embreve-780x360.png`. Contagens: a=2, b=2, c=0, d=0. (textos visíveis: 6; tocáveis: 2.)

**a) 10 piores textos pequenos** (px real):

- `#build` — **8px** ⚠<11 — "build 2026-10-22 15:08 UTC"
- `#bvoltar` — **9.26px** ⚠<11 — "‹ Início"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 15:08 UTC"
- `#bvoltar` — **73.6×28.6** — "‹ Início"

### Coleção — sem seleção — nota 10

Print: `docs/telas/357-colecao-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 71; tocáveis: 37.)

_Sem achados._

### Coleção — com filtro — nota 10

Print: `docs/telas/357-colecao-filtro-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 30; tocáveis: 23.)

_Sem achados._

### Ficha do deus — SINERGIA — nota 10

Print: `docs/telas/357-ficha-sinergia-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 28; tocáveis: 7.)

_Sem achados._

### Ficha do deus — não possuída — nota 10

Print: `docs/telas/357-ficha-falta-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 32; tocáveis: 12.)

_Sem achados._

### Ficha do deus — nota 10

Print: `docs/telas/357-ficha-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 29; tocáveis: 11.)

_Sem achados._

### Níveis de habilidade — nota 10

Print: `docs/telas/357-niveis-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 50; tocáveis: 4.)

_Sem achados._

## Prints gerados

- `docs/telas/357-carregamento-780x360.png` — Carregamento (splash)
- `docs/telas/357-home-780x360.png` — Home
- `docs/telas/357-batalha-meu-turno-780x360.png` — Batalha — meu turno
- `docs/telas/357-batalha-oponente-780x360.png` — Batalha — turno do oponente
- `docs/telas/357-batalha-armada-780x360.png` — Batalha — habilidade armada
- `docs/telas/357-batalha-inspecao-780x360.png` — Batalha — inspeção da habilidade
- `docs/telas/357-campanha-batalha-780x360.png` — Campanha — ato de batalha
- `docs/telas/357-campanha-escolha-780x360.png` — Campanha — ato de escolha
- `docs/telas/357-campanha-historia-780x360.png` — Campanha — ato de história (sintético)
- `docs/telas/357-montar-campanha-780x360.png` — Montar time — encontro da campanha
- `docs/telas/357-montar-dominio-780x360.png` — Montar time — Domínio (corrida)
- `docs/telas/357-montar-desafio-780x360.png` — Montar time — Desafio de composição
- `docs/telas/357-montar-selecao-780x360.png` — Seleção de time (Batalha CPU/hot-seat)
- `docs/telas/357-pvp-780x360.png` — PvP — lobby (time montado)
- `docs/telas/357-pvp-fila-780x360.png` — PvP — na fila
- `docs/telas/357-colecao-780x360.png` — Coleção — sem seleção
- `docs/telas/357-colecao-filtro-780x360.png` — Coleção — com filtro
- `docs/telas/357-ficha-sinergia-780x360.png` — Ficha do deus — SINERGIA
- `docs/telas/357-ficha-falta-780x360.png` — Ficha do deus — não possuída
- `docs/telas/357-ficha-780x360.png` — Ficha do deus
- `docs/telas/357-niveis-780x360.png` — Níveis de habilidade
- `docs/telas/357-desafios-780x360.png` — Desafios (hub)
- `docs/telas/357-composicao-780x360.png` — Composição (desafios)
- `docs/telas/357-provacoes-780x360.png` — Provações
- `docs/telas/357-dominios-780x360.png` — Domínios — seleção
- `docs/telas/357-dominio-hub-780x360.png` — Domínio — hub
- `docs/telas/357-invocacao-780x360.png` — Invocação — tela
- `docs/telas/357-invocacao-reveal-780x360.png` — Invocação — revelação
- `docs/telas/357-guia-780x360.png` — Guia (folha de componentes, dev)
- `docs/telas/357-embreve-780x360.png` — Em breve (marcador)
- `docs/telas/357-batalha-menu-780x360.png` — Batalha — menu
- `docs/telas/357-batalha-confirmar-sair-780x360.png` — Batalha — confirmação de sair
- `docs/telas/357-batalha-confirmar-desistir-780x360.png` — Batalha — confirmação de desistir


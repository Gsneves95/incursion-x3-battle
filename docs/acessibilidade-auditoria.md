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
| 1 | Desafios (hub) | 90 (81) | 16 | 0 | 9 | **2.4** | `357-desafios-780x360.png` |
| 2 | Coleção — sobreposição de níveis | 93 (92) | 27 | 1 | 3 | **2.8** | `357-colecao-niveis-780x360.png` |
| 3 | Campanha — ato de batalha | 43 (41) | 6 | 1 | 1 | **3.1** | `357-campanha-batalha-780x360.png` |
| 4 | Composição (desafios) | 51 (45) | 7 | 0 | 0 | **3.1** | `357-composicao-780x360.png` |
| 5 | Guia (folha de componentes, dev) | 58 (58) | 8 | 0 | 0 | **3.1** | `357-guia-780x360.png` |
| 6 | Níveis de habilidade | 48 (48) | 4 | 0 | 0 | **3.2** | `357-niveis-780x360.png` |
| 7 | Seleção de time (Batalha CPU/hot-seat) | 70 (64) | 30 | 0 | 0 | **3.5** | `357-montar-selecao-780x360.png` |
| 8 | Montar time — encontro da campanha | 56 (56) | 26 | 0 | 0 | **3.8** | `357-montar-campanha-780x360.png` |
| 9 | Montar time — Desafio de composição | 62 (62) | 25 | 0 | 0 | **3.8** | `357-montar-desafio-780x360.png` |
| 10 | PvP — lobby (time montado) | 61 (61) | 30 | 0 | 0 | **3.8** | `357-pvp-780x360.png` |
| 11 | Coleção — com seleção | 91 (90) | 26 | 0 | 0 | **3.8** | `357-colecao-selecao-780x360.png` |
| 12 | Montar time — Domínio (corrida) | 59 (59) | 24 | 0 | 0 | **3.9** | `357-montar-dominio-780x360.png` |
| 13 | PvP — na fila | 61 (61) | 30 | 0 | 0 | **3.9** | `357-pvp-fila-780x360.png` |
| 14 | Domínios — seleção | 65 (54) | 5 | 0 | 2 | **3.9** | `357-dominios-780x360.png` |
| 15 | Coleção — sem seleção | 87 (87) | 23 | 0 | 0 | **4** | `357-colecao-780x360.png` |
| 16 | Domínio — hub | 32 (32) | 3 | 0 | 0 | **4.1** | `357-dominio-hub-780x360.png` |
| 17 | Batalha — menu | 50 (49) | 24 | 0 | 0 | **4.1** | `357-batalha-menu-780x360.png` |
| 18 | Coleção — sobreposição de kit | 105 (103) | 29 | 0 | 0 | **4.2** | `357-colecao-kit-780x360.png` |
| 19 | Batalha — meu turno | 39 (38) | 15 | 0 | 0 | **4.4** | `357-batalha-meu-turno-780x360.png` |
| 20 | Batalha — turno do oponente | 41 (40) | 15 | 0 | 0 | **4.4** | `357-batalha-oponente-780x360.png` |
| 21 | Batalha — inspeção da habilidade | 43 (42) | 15 | 0 | 0 | **4.4** | `357-batalha-inspecao-780x360.png` |
| 22 | Batalha — habilidade armada | 43 (42) | 12 | 0 | 0 | **4.5** | `357-batalha-armada-780x360.png` |
| 23 | Campanha — ato de escolha | 39 (38) | 7 | 0 | 0 | **4.5** | `357-campanha-escolha-780x360.png` |
| 24 | Invocação — revelação | 20 (20) | 8 | 0 | 0 | **4.5** | `357-invocacao-reveal-780x360.png` |
| 25 | Home | 22 (20) | 2 | 0 | 0 | **4.6** | `357-home-780x360.png` |
| 26 | Invocação — tela | 18 (18) | 6 | 0 | 0 | **4.6** | `357-invocacao-780x360.png` |
| 27 | Batalha — confirmação de sair | 41 (39) | 17 | 0 | 0 | **4.6** | `357-batalha-confirmar-sair-780x360.png` |
| 28 | Batalha — confirmação de desistir | 41 (38) | 17 | 0 | 0 | **4.6** | `357-batalha-confirmar-desistir-780x360.png` |
| 29 | Carregamento (splash) | 22 (20) | 2 | 0 | 0 | **4.8** | `357-carregamento-780x360.png` |
| 30 | Ficha do deus | 27 (27) | 2 | 0 | 0 | **4.8** | `357-ficha-780x360.png` |
| 31 | Provações | 51 (51) | 1 | 0 | 3 | **4.8** | `357-provacoes-780x360.png` |
| 32 | Campanha — ato de história (sintético) | 23 (23) | 3 | 0 | 0 | **5.3** | `357-campanha-historia-780x360.png` |
| 33 | Em breve (marcador) | 2 (2) | 2 | 0 | 0 | **6.3** | `357-embreve-780x360.png` |

## Detalhe por tela

### Desafios (hub) — nota 2.4

Print: `docs/telas/357-desafios-780x360.png`. Contagens: a=90, b=16, c=0, d=9. (textos visíveis: 94; tocáveis: 17.)

**a) 10 piores textos pequenos** (px real):

- `span` — **8.31px** ⚠<11 — "30"
- `span` — **8.31px** ⚠<11 — "30"
- `span` — **8.31px** ⚠<11 — "30"
- `span` — **8.31px** ⚠<11 — "30"
- `span` — **8.31px** ⚠<11 — "30"
- `span` — **8.31px** ⚠<11 — "30"
- `b` — **8.36px** ⚠<11 — "(9)"
- `b` — **8.36px** ⚠<11 — "(9)"
- `span` — **8.41px** ⚠<11 — "5"
- `span` — **8.41px** ⚠<11 — "5"

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

### Coleção — sobreposição de níveis — nota 2.8

Print: `docs/telas/357-colecao-niveis-780x360.png`. Contagens: a=93, b=27, c=1, d=3. (textos visíveis: 113; tocáveis: 42.)

**a) 10 piores textos pequenos** (px real):

- `span.col2__selrot` — **4.91px** ⚠<11 — "Ordenar"
- `span.col2__sub` — **6.03px** ⚠<11 — "COLECIONE · LEIA O KIT · MONTE A LENDA"
- `span.col2r__leg` — **6.74px** ⚠<11 — "personagens na coleção"
- `span` — **7.15px** ⚠<11 — "/100"
- `i` — **7.49px** ⚠<11 — "⬡"
- `span.col2c__cult` — **7.63px** ⚠<11 — "NÓ"
- `span.col2c__rar.col2c__rar--SS` — **7.7px** ⚠<11 — "SS"
- `span.col2r__rlabel.col2p__rar--SS` — **7.8px** ⚠<11 — "SS"
- `span.col2r__rlabel.col2p__rar--S` — **7.8px** ⚠<11 — "S"
- `span.col2r__rlabel.col2p__rar--A` — **7.8px** ⚠<11 — "A"

**b) 10 piores toques** (menor lado):

- `#col2busca` — **110.5×12.8** — ""
- `button.col2pill.is-on` — **35.4×19.8** — "Todos"
- `button.col2pill` — **49.5×19.8** — "Possuídos"
- `button.col2pill` — **64.4×19.8** — "Não possuídos"
- `button.col2pill.is-on` — **35.4×19.8** — "Todas"
- `button.col2pill` — **24.4×19.8** — "SS"
- `button.col2pill` — **20×19.8** — "S"
- `button.col2pill` — **20.1×19.8** — "A"
- `#bvoltar` — **21.3×21.3** — ""
- `button.col2fchip.col2fchip--todos` — **35.4×21.3** — "Todos"

**c) rolagens proibidas:**

- `div.col2ov__nivscroll` — eixo Y, +1342px — "Pontos de Brigid: 0 cópias rep"

**d) cortes:**

- [estoura-viewport] `p.nlp__txt` — "6 de dano + (4/turno por 2 turnos)."
- [estoura-viewport] `span.kw.kw--dot` — "Queimadura"
- [estoura-viewport] `p.nlp__txt` — "de dano + Queimadura (4/turno por 2 turn"

### Campanha — ato de batalha — nota 3.1

Print: `docs/telas/357-campanha-batalha-780x360.png`. Contagens: a=43, b=6, c=1, d=1. (textos visíveis: 48; tocáveis: 14.)

**a) 10 piores textos pequenos** (px real):

- `span.crec__u` — **5.26px** ⚠<11 — "GEMAS"
- `span.cslot__nome` — **5.93px** ⚠<11 — "Zeus"
- `span.cslot__nome` — **5.93px** ⚠<11 — "Nezha"
- `span.cslot__nome` — **5.93px** ⚠<11 — "Hades"
- `span.camp__form` — **5.94px** ⚠<11 — "3 VS 3"
- `span.cnode__nome` — **6.72px** ⚠<11 — "O que Nezha viu"
- `span.cslot__badge.cslot__lock` — **6.73px** ⚠<11 — "⚿"
- `span.cslot__badge.cslot__swap` — **6.73px** ⚠<11 — "⇄"
- `span.cslot__badge.cslot__swap` — **6.73px** ⚠<11 — "⇄"
- `span.camp__lbl.camp__lbl--rec` — **6.73px** ⚠<11 — "Recompensas"

**b) 10 piores toques** (menor lado):

- `#capprev` — **7.8×15.1** — "‹"
- `#build` — **131.5×8** — "build 2026-10-22 13:54 UTC"
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

- `span.cmp-foe__n` — **7.5px** ⚠<11 — "Saci"
- `span.cmp-foe__n` — **7.5px** ⚠<11 — "Loki"
- `span.cmp-foe__n` — **7.5px** ⚠<11 — "Saci"
- `span.cmp-foe__n` — **7.5px** ⚠<11 — "Loki"
- `span.cmp-foe__n` — **7.5px** ⚠<11 — "Saci"
- `span.cmp-foe__n` — **7.5px** ⚠<11 — "Saci"
- `span.cmp-foe__n` — **7.5px** ⚠<11 — "Loki"
- `span.cmp-foe__n` — **7.5px** ⚠<11 — "Saci"
- `span.cmp-foe__n` — **7.5px** ⚠<11 — "Loki"
- `span.cmp-foe__n` — **7.5px** ⚠<11 — "Saci"

**b) 10 piores toques** (menor lado):

- `#bvoltar` — **68.8×30.4** — "‹ DESAFIOS"
- `button.cmpb.cmpb--primary` — **55×30.4** — "JOGAR"
- `button.cmpb.cmpb--primary` — **55×30.4** — "JOGAR"
- `button.cmpb.cmpb--primary` — **55×30.4** — "JOGAR"
- `button.cmpb.cmpb--primary` — **55×30.4** — "JOGAR"
- `button.cmpb.cmpb--primary` — **55×30.4** — "JOGAR"
- `button.cmpb.cmpb--primary` — **55×30.4** — "JOGAR"

### Guia (folha de componentes, dev) — nota 3.1

Print: `docs/telas/357-guia-780x360.png`. Contagens: a=58, b=8, c=0, d=0. (textos visíveis: 59; tocáveis: 8.)

**a) 10 piores textos pequenos** (px real):

- `div.hp__label` — **5.92px** ⚠<11 — "62/100"
- `div.hp__label` — **5.92px** ⚠<11 — "24/100"
- `code.guia-tile__sel` — **6.33px** ⚠<11 — ".cmpb--primary / .b--primary"
- `code.guia-tile__sel` — **6.33px** ⚠<11 — ".cmpb--quiet / .b--sec"
- `code.guia-tile__sel` — **6.33px** ⚠<11 — ".df-chip · .df-chip.is-on"
- `code.guia-tile__sel` — **6.33px** ⚠<11 — ".dsx-rar.rar--SS\|S\|A"
- `code.guia-tile__sel` — **6.33px** ⚠<11 — ".dsk__nv (só habilidade com escada)"
- `code.guia-tile__sel` — **6.33px** ⚠<11 — ".dmk-ab__gratis / .cost__gratis"
- `code.guia-tile__sel` — **6.33px** ⚠<11 — "orbe(elem, px)"
- `code.guia-tile__sel` — **6.33px** ⚠<11 — "_pontoIcSVG() · nltop__ic"

**b) 10 piores toques** (menor lado):

- `button.df-toast__x` — **12.2×11.4** — "✕"
- `button.nlb.nlb--go` — **46.2×27** — "CONFIRMAR"
- `button.nlb.nlb--quiet` — **41.8×27** — "CANCELAR"
- `#bvoltar` — **58.1×30.4** — "‹ VOLTAR"
- `button.cmpb.cmpb--primary` — **51.6×30.4** — "JOGAR"
- `button.cmpb.cmpb--quiet` — **86.3×30.4** — "JOGAR DE NOVO"
- `span.df-chip` — **45.9×30.4** — "Todas 6"
- `span.df-chip.is-on` — **72.5×30.4** — "Conquistadas 2"

### Níveis de habilidade — nota 3.2

Print: `docs/telas/357-niveis-780x360.png`. Contagens: a=48, b=4, c=0, d=0. (textos visíveis: 50; tocáveis: 4.)

**a) 10 piores textos pequenos** (px real):

- `span.nlp__coll` — **7.18px** ⚠<11 — "AGORA (Nv 3)"
- `span.nlp__coll.nlp__coll--px` — **7.18px** ⚠<11 — "PRÓXIMO (Nv 4)"
- `span.nlp__coll` — **7.18px** ⚠<11 — "AGORA (Nv 4)"
- `span.nlp__coll` — **7.18px** ⚠<11 — "AGORA (Nv 1)"
- `span.nlp__coll.nlp__coll--px` — **7.18px** ⚠<11 — "PRÓXIMO (Nv 2)"
- `span.nlp__coll` — **7.18px** ⚠<11 — "EFEITO"
- `p.nlpas__nota` — **7.61px** ⚠<11 — "A passiva não tem níveis."
- `span.nltop__cop` — **7.62px** ⚠<11 — "cópias repetidas viram pontos"
- `span.nlp__maxt` — **8.01px** ⚠<11 — "NÍVEL MÁXIMOALCANÇADO"
- `p.nlpas__txt` — **8.03px** ⚠<11 — "Ao derrotar um inimigo, ganha 1 orbe de "

**b) 10 piores toques** (menor lado):

- `#bvoltar` — **47.2×30.4** — "‹ Zeus"
- `button.nlb.nlb--off` — **259.4×30.4** — "FALTAM 2 PONTOS"
- `button.nlb.nlb--go` — **259.4×30.4** — "SUBIR PARA NV 2 · 1 PONTO"
- `button.nlb.nlb--off` — **259.4×30.4** — "Esta habilidade não tem níveis"

### Seleção de time (Batalha CPU/hot-seat) — nota 3.5

Print: `docs/telas/357-montar-selecao-780x360.png`. Contagens: a=70, b=30, c=0, d=0. (textos visíveis: 71; tocáveis: 39.)

**a) 10 piores textos pequenos** (px real):

- `span.sel-time__who` — **6.29px** ⚠<11 — "CPU"
- `p.sel-info` — **6.76px** ⚠<11 — "A vitória rende 💎 · teto 5/dia · não av"
- `b` — **6.96px** ⚠<11 — "20"
- `#bcpu` — **7.18px** ⚠<11 — "OPONENTE: CPU"
- `button.sel-seg__b` — **7.18px** ⚠<11 — "2 JOGADORES"
- `span.sel-vaga__txt` — **7.61px** ⚠<11 — "Escolha um deus"
- `span.sel-vaga__txt` — **7.61px** ⚠<11 — "Escolha um deus"
- `span.sel-vaga__txt` — **7.61px** ⚠<11 — "Escolha um deus"
- `span.sel-vaga__txt` — **7.61px** ⚠<11 — "Escolha um deus"
- `span.sel-vaga__txt` — **7.61px** ⚠<11 — "Escolha um deus"

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

### Coleção — com seleção — nota 3.8

Print: `docs/telas/357-colecao-selecao-780x360.png`. Contagens: a=91, b=26, c=0, d=0. (textos visíveis: 92; tocáveis: 41.)

**a) 10 piores textos pequenos** (px real):

- `span.col2__selrot` — **4.91px** ⚠<11 — "Ordenar"
- `span.col2__sub` — **6.03px** ⚠<11 — "COLECIONE · LEIA O KIT · MONTE A LENDA"
- `span.col2p__tag` — **6.67px** ⚠<11 — "Mágico"
- `span.col2s__rot` — **6.72px** ⚠<11 — "SINERGIA"
- `span.col2p__tag` — **6.73px** ⚠<11 — "Controlador"
- `span.col2s__mec` — **6.73px** ⚠<11 — "Dia: +8 aos seus Aurora"
- `button.col2s__mais` — **6.73px** ⚠<11 — "+1 mais ›"
- `span.col2s__mec` — **6.74px** ⚠<11 — "+5 aos seus Aurora"
- `span.col2p__tag` — **6.79px** ⚠<11 — "Aurora"
- `span.col2p__tag.col2p__tag--cult` — **6.81px** ⚠<11 — "Grega"

**b) 10 piores toques** (menor lado):

- `button.col2s__mais` — **146.7×12** — "+1 mais ›"
- `#col2busca` — **110.5×12.8** — ""
- `#col2fechar` — **15.6×15.6** — "×"
- `button.col2pill.is-on` — **35.4×19.8** — "Todos"
- `button.col2pill` — **49.5×19.8** — "Possuídos"
- `button.col2pill` — **64.4×19.8** — "Não possuídos"
- `button.col2pill.is-on` — **35.4×19.8** — "Todas"
- `button.col2pill` — **24.4×19.8** — "SS"
- `button.col2pill` — **20×19.8** — "S"
- `button.col2pill` — **20.1×19.8** — "A"

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
- `button.dm-chip.dm-chip--todos` — **8.4px** ⚠<11 — "Todos"

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

- `i` — **6.54px** ⚠<11 — "Rá"
- `i` — **6.58px** ⚠<11 — "Loki"
- `i` — **6.64px** ⚠<11 — "Atena"
- `i` — **6.66px** ⚠<11 — "Wukong"
- `i` — **6.68px** ⚠<11 — "Zeus"
- `i` — **6.71px** ⚠<11 — "Osíris"
- `i` — **6.71px** ⚠<11 — "Poseidon"
- `span.dcard__frase` — **6.71px** ⚠<11 — "O corvo, o martelo e a mentira."
- `i` — **6.71px** ⚠<11 — "Thor"
- `span.dcard__frase` — **6.73px** ⚠<11 — "A revolta, a lança e a mão que remendou "

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 13:54 UTC"
- `#dajuda` — **21.9×21.9** — "?"
- `#dhistver` — **102.3×25.2** — "Ver histórico"
- `#binicio` — **28.6×28.6** — ""
- `#dhist` — **115.4×37.9** — "Seu históricoseus recordes por"

**d) cortes:**

- [ellipsis] `i` — "Amaterasu"
- [ellipsis] `i` — "Tsukuyomi"

### Coleção — sem seleção — nota 4

Print: `docs/telas/357-colecao-780x360.png`. Contagens: a=87, b=23, c=0, d=0. (textos visíveis: 90; tocáveis: 38.)

**a) 10 piores textos pequenos** (px real):

- `span.col2__selrot` — **4.91px** ⚠<11 — "Ordenar"
- `span.col2__sub` — **6.03px** ⚠<11 — "COLECIONE · LEIA O KIT · MONTE A LENDA"
- `span.col2r__leg` — **6.74px** ⚠<11 — "personagens na coleção"
- `span` — **7.15px** ⚠<11 — "/100"
- `i` — **7.49px** ⚠<11 — "⬡"
- `span.col2c__cult` — **7.63px** ⚠<11 — "NÓ"
- `span.col2c__rar.col2c__rar--SS` — **7.7px** ⚠<11 — "SS"
- `span.col2r__rlabel.col2p__rar--SS` — **7.8px** ⚠<11 — "SS"
- `span.col2r__rlabel.col2p__rar--S` — **7.8px** ⚠<11 — "S"
- `span.col2r__rlabel.col2p__rar--A` — **7.8px** ⚠<11 — "A"

**b) 10 piores toques** (menor lado):

- `#col2busca` — **110.5×12.8** — ""
- `button.col2pill.is-on` — **35.4×19.8** — "Todos"
- `button.col2pill` — **49.5×19.8** — "Possuídos"
- `button.col2pill` — **64.4×19.8** — "Não possuídos"
- `button.col2pill.is-on` — **35.4×19.8** — "Todas"
- `button.col2pill` — **24.4×19.8** — "SS"
- `button.col2pill` — **20×19.8** — "S"
- `button.col2pill` — **20.1×19.8** — "A"
- `#bvoltar` — **21.3×21.3** — ""
- `button.col2fchip.col2fchip--todos` — **35.4×21.3** — "Todos"

### Domínio — hub — nota 4.1

Print: `docs/telas/357-dominio-hub-780x360.png`. Contagens: a=32, b=3, c=0, d=0. (textos visíveis: 41; tocáveis: 3.)

**a) 10 piores textos pequenos** (px real):

- `i.dh-no__n` — **8.07px** ⚠<11 — "1"
- `i.dh-no__n` — **8.28px** ⚠<11 — "40"
- `i.dh-no__n` — **8.29px** ⚠<11 — "20"
- `i.dh-no__n` — **8.41px** ⚠<11 — "30"
- `div.dh-cf__n` — **8.43px** ⚠<11 — "Zeus"
- `span.dh-un__hint` — **8.45px** ⚠<11 — "Você monta o time ao começar"
- `span.dh-un__hint` — **8.45px** ⚠<11 — "Você monta o time ao começar"
- `span.dh-un__hint` — **8.45px** ⚠<11 — "Você monta o time ao começar"
- `div.dh-cf__n` — **8.46px** ⚠<11 — "Atena"
- `div.dh-cf__n` — **8.47px** ⚠<11 — "Poseidon"

**b) 10 piores toques** (menor lado):

- `#bvoltar` — **59.6×30.4** — "‹ VOLTAR"
- `#dajuda` — **30.4×30.4** — "?"
- `#dentrar` — **175.5×31.3** — "MONTAR TIME E COMEÇAR ›"

### Batalha — menu — nota 4.1

Print: `docs/telas/357-batalha-menu-780x360.png`. Contagens: a=50, b=24, c=0, d=0. (textos visíveis: 53; tocáveis: 42.)

**a) 10 piores textos pequenos** (px real):

- `#bmenubuild` — **5.49px** ⚠<11 — "build 2026-10-22 13:54 UTC"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `span` — **6.77px** ⚠<11 — "GRÁTIS"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"
- `button.cin.bt-portrait__pas` — **7.18px** ⚠<11 — "P"

**b) 10 piores toques** (menor lado):

- `input.b5-range` — **92.5×2.5** — ""
- `#bmenubuild` — **148.7×6.8** — "build 2026-10-22 13:54 UTC"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `button.cin.bt-portrait__pas` — **11×11** — "P"
- `#btrocar` — **57.9×14.4** — "⇄TROCAR"
- `#bmenu` — **19.4×19.4** — ""

### Coleção — sobreposição de kit — nota 4.2

Print: `docs/telas/357-colecao-kit-780x360.png`. Contagens: a=105, b=29, c=0, d=0. (textos visíveis: 115; tocáveis: 48.)

**a) 10 piores textos pequenos** (px real):

- `span.col2__selrot` — **4.91px** ⚠<11 — "Ordenar"
- `span.col2__sub` — **6.03px** ⚠<11 — "COLECIONE · LEIA O KIT · MONTE A LENDA"
- `span.col2r__leg` — **6.74px** ⚠<11 — "personagens na coleção"
- `span` — **7.15px** ⚠<11 — "/100"
- `i` — **7.49px** ⚠<11 — "⬡"
- `span.col2c__cult` — **7.63px** ⚠<11 — "NÓ"
- `span.col2c__rar.col2c__rar--SS` — **7.7px** ⚠<11 — "SS"
- `span.col2r__rlabel.col2p__rar--SS` — **7.8px** ⚠<11 — "SS"
- `span.col2r__rlabel.col2p__rar--S` — **7.8px** ⚠<11 — "S"
- `span.col2r__rlabel.col2p__rar--A` — **7.8px** ⚠<11 — "A"

**b) 10 piores toques** (menor lado):

- `#col2busca` — **110.5×12.8** — ""
- `button.col2pill.is-on` — **35.4×19.8** — "Todos"
- `button.col2pill` — **49.5×19.8** — "Possuídos"
- `button.col2pill` — **64.4×19.8** — "Não possuídos"
- `button.col2pill.is-on` — **35.4×19.8** — "Todas"
- `button.col2pill` — **24.4×19.8** — "SS"
- `button.col2pill` — **20×19.8** — "S"
- `button.col2pill` — **20.1×19.8** — "A"
- `#bvoltar` — **21.3×21.3** — ""
- `button.col2fchip.col2fchip--todos` — **35.4×21.3** — "Todos"

### Batalha — meu turno — nota 4.4

Print: `docs/telas/357-batalha-meu-turno-780x360.png`. Contagens: a=39, b=15, c=0, d=0. (textos visíveis: 42; tocáveis: 33.)

**a) 10 piores textos pequenos** (px real):

- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `span` — **6.77px** ⚠<11 — "GRÁTIS"
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
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `span` — **6.77px** ⚠<11 — "GRÁTIS"
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
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `span` — **6.77px** ⚠<11 — "GRÁTIS"
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
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `span` — **6.77px** ⚠<11 — "GRÁTIS"
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

- `span.camp__capeye` — **6.69px** ⚠<11 — "PRÓLOGO"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Era dos Planos"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Profecia do Uno"
- `span.cnode__nome` — **6.73px** ⚠<11 — "O Início do Conflito"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Ruptura entre Céu e Terra"
- `span.cnode__nome` — **6.73px** ⚠<11 — "O Ciclo dos Expulsos"
- `span.cnode__nome` — **6.74px** ⚠<11 — "A Criação do Eixo"
- `span.cnode__nome` — **6.75px** ⚠<11 — "A Incursão"
- `span.camp__num` — **7.31px** ⚠<11 — "TRECHO I"
- `span.camp__capep` — **7.32px** ⚠<11 — "“Antes da unidade, havia o multiverso da"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 13:54 UTC"
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

- `span.iv-off` — **7.58px** ⚠<11 — "10% OFF"
- `#build` — **8.03px** ⚠<11 — "build 2026-10-22 13:54 UTC"
- `b` — **8.38px** ⚠<11 — "Bênção do Iniciante"
- `button.iv-oferta` — **8.4px** ⚠<11 — "— 10× grátis, SS garantido"
- `span.iv-hero__tag` — **8.47px** ⚠<11 — "RATE-UP"
- `button.iv-plus` — **9.25px** ⚠<11 — "+"
- `div.iv-tip` — **9.25px** ⚠<11 — "toque fora para voltar"
- `button.iv-hero__det` — **9.26px** ⚠<11 — "Ver detalhes"
- `span.iv-pity__lbl` — **9.29px** ⚠<11 — "SS garantido"
- `#iv-essencia` — **9.7px** ⚠<11 — "—"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 13:54 UTC"
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

- `#build` — **8.03px** ⚠<11 — "build 2026-10-22 13:54 UTC"
- `span.ilha__cont` — **8.24px** ⚠<11 — "0/60"
- `span.ilha__cont` — **8.25px** ⚠<11 — "91"
- `span.ilha__camptxt` — **8.39px** ⚠<11 — "Capítulo I · Grécia"
- `span.ilha__cont` — **8.42px** ⚠<11 — "9/100"
- `span.ilha__breveTag` — **8.46px** ⚠<11 — "· em breve"
- `span.ilha__campnum` — **8.59px** ⚠<11 — "0/6"
- `span.ilha__cont` — **8.67px** ⚠<11 — "100"
- `span.mmoeda__ic.mmoeda__ic--gema` — **10.08px** ⚠<11 — "💎"
- `span.mmoeda__ic.mmoeda__ic--ess` — **10.36px** ⚠<11 — "◈"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 13:54 UTC"
- `button.mperfil` — **98.7×33.6** — "Jogador"

### Invocação — tela — nota 4.6

Print: `docs/telas/357-invocacao-780x360.png`. Contagens: a=18, b=6, c=0, d=0. (textos visíveis: 23; tocáveis: 8.)

**a) 10 piores textos pequenos** (px real):

- `span.iv-off` — **7.58px** ⚠<11 — "10% OFF"
- `#build` — **8.03px** ⚠<11 — "build 2026-10-22 13:54 UTC"
- `b` — **8.38px** ⚠<11 — "Bênção do Iniciante"
- `button.iv-oferta` — **8.4px** ⚠<11 — "— 10× grátis, SS garantido"
- `span.iv-hero__tag` — **8.47px** ⚠<11 — "RATE-UP"
- `button.iv-plus` — **9.25px** ⚠<11 — "+"
- `button.iv-hero__det` — **9.26px** ⚠<11 — "Ver detalhes"
- `span.iv-pity__lbl` — **9.29px** ⚠<11 — "SS garantido"
- `#iv-essencia` — **9.7px** ⚠<11 — "—"
- `#iv-gemas` — **9.7px** ⚠<11 — "—"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 13:54 UTC"
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
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `span` — **6.77px** ⚠<11 — "GRÁTIS"
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
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `div.bt-hp__lab` — **6.76px** ⚠<11 — "120/120"
- `span` — **6.77px** ⚠<11 — "GRÁTIS"
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

- `#build` — **8.03px** ⚠<11 — "build 2026-10-22 13:54 UTC"
- `span.ilha__cont` — **8.24px** ⚠<11 — "0/60"
- `span.ilha__cont` — **8.25px** ⚠<11 — "91"
- `span.ilha__camptxt` — **8.36px** ⚠<11 — "Cap. I · Grécia"
- `span.ilha__cont` — **8.42px** ⚠<11 — "9/100"
- `span.ilha__breveTag` — **8.46px** ⚠<11 — "· em breve"
- `span.ilha__campnum` — **8.59px** ⚠<11 — "0/6"
- `span.ilha__cont` — **8.67px** ⚠<11 — "100"
- `span.mmoeda__ic.mmoeda__ic--gema` — **10.08px** ⚠<11 — "💎"
- `span.mmoeda__ic.mmoeda__ic--ess` — **10.36px** ⚠<11 — "◈"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 13:54 UTC"
- `button.mperfil` — **98.7×33.6** — "Jogador"

### Ficha do deus — nota 4.8

Print: `docs/telas/357-ficha-780x360.png`. Contagens: a=27, b=2, c=0, d=0. (textos visíveis: 29; tocáveis: 7.)

**a) 10 piores textos pequenos** (px real):

- `span.dsk__nv` — **6.72px** ⚠<11 — "Nv 1"
- `span.dsk__nv` — **6.77px** ⚠<11 — "Nv 4"
- `span.dsk__nv` — **6.8px** ⚠<11 — "Nv 2"
- `em` — **7.44px** ⚠<11 — "30"
- `em` — **7.53px** ⚠<11 — "15"
- `em` — **7.57px** ⚠<11 — "5"
- `span.ddet__pill` — **7.58px** ⚠<11 — "Mágico"
- `span.ddet__pill.ddet__pill--tipo` — **7.62px** ⚠<11 — "PASSIVA"
- `span.dmaes__hint` — **8.02px** ⚠<11 — "Mestre aos 30 = moldura dourada no retra"
- `span.dsk__nome` — **8.81px** ⚠<11 — "Milagre"

**b) 10 piores toques** (menor lado):

- `#bvoltar` — **58.1×30.4** — "‹ VOLTAR"
- `button.dsxb.dsxb--subir` — **130×30.4** — "SUBIR HABILIDADES ›"

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

- `span.camp__capeye` — **6.69px** ⚠<11 — "PRÓLOGO"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Era dos Planos"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Profecia do Uno"
- `span.cnode__nome` — **6.73px** ⚠<11 — "O Início do Conflito"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Ruptura entre Céu e Terra"
- `span.cnode__nome` — **6.73px** ⚠<11 — "O Ciclo dos Expulsos"
- `span.cnode__nome` — **6.74px** ⚠<11 — "A Criação do Eixo"
- `span.cnode__nome` — **6.75px** ⚠<11 — "A Incursão"
- `span.camp__num` — **7.31px** ⚠<11 — "TRECHO I"
- `span.camp__capep` — **7.32px** ⚠<11 — "“Antes da unidade, havia o multiverso da"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 13:54 UTC"
- `#bvoltar` — **65.4×20.2** — "Início"
- `#campcta` — **246×27.8** — "Continuar"

### Em breve (marcador) — nota 6.3

Print: `docs/telas/357-embreve-780x360.png`. Contagens: a=2, b=2, c=0, d=0. (textos visíveis: 6; tocáveis: 2.)

**a) 10 piores textos pequenos** (px real):

- `#build` — **8.03px** ⚠<11 — "build 2026-10-22 13:54 UTC"
- `#bvoltar` — **9.2px** ⚠<11 — "‹ Início"

**b) 10 piores toques** (menor lado):

- `#build` — **131.5×8** — "build 2026-10-22 13:54 UTC"
- `#bvoltar` — **73.6×28.6** — "‹ Início"

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
- `docs/telas/357-colecao-selecao-780x360.png` — Coleção — com seleção
- `docs/telas/357-colecao-kit-780x360.png` — Coleção — sobreposição de kit
- `docs/telas/357-colecao-niveis-780x360.png` — Coleção — sobreposição de níveis
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


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
| 1 | Invocação — revelação | 19 (19) | 7 | 0 | 24 | **2.6** | `357-invocacao-reveal-780x360.png` |
| 2 | Guia (folha de componentes, dev) | 57 (57) | 8 | 0 | 0 | **3.1** | `357-guia-780x360.png` |
| 3 | Invocação — tela | 17 (17) | 5 | 0 | 4 | **4.3** | `357-invocacao-780x360.png` |
| 4 | Home | 21 (21) | 1 | 0 | 1 | **4.7** | `357-home-780x360.png` |
| 5 | Em breve (marcador) | 1 (1) | 1 | 0 | 2 | **6.8** | `357-embreve-780x360.png` |
| 6 | Carregamento (splash) | 0 (0) | 0 | 0 | 0 | **10** | `357-carregamento-780x360.png` |
| 7 | Batalha — meu turno | 0 (0) | 0 | 0 | 0 | **10** | `357-batalha-meu-turno-780x360.png` |
| 8 | Batalha — turno do oponente | 0 (0) | 0 | 0 | 0 | **10** | `357-batalha-oponente-780x360.png` |
| 9 | Batalha — habilidade armada | 0 (0) | 0 | 0 | 0 | **10** | `357-batalha-armada-780x360.png` |
| 10 | Batalha — inspeção da habilidade | 0 (0) | 0 | 0 | 0 | **10** | `357-batalha-inspecao-780x360.png` |
| 11 | Campanha — ato de batalha (consequências + kit) | 0 (0) | 0 | 0 | 0 | **10** | `357-campanha-batalha-780x360.png` |
| 12 | Campanha — texto mais longo (Conselho, 819c, paginado) | 0 (0) | 0 | 0 | 0 | **10** | `357-campanha-texto-longo-780x360.png` |
| 13 | Campanha — ato de escolha (opções inteiras, pista 86c) | 0 (0) | 0 | 0 | 0 | **10** | `357-campanha-escolha-780x360.png` |
| 14 | Campanha — ato de história (sintético) | 0 (0) | 0 | 0 | 0 | **10** | `357-campanha-historia-780x360.png` |
| 15 | Montar time — encontro da campanha | 0 (0) | 0 | 0 | 0 | **10** | `357-montar-campanha-780x360.png` |
| 16 | Montar time — Domínio (corrida) | 0 (0) | 0 | 0 | 0 | **10** | `357-montar-dominio-780x360.png` |
| 17 | Montar time — Desafio de composição | 0 (0) | 0 | 0 | 0 | **10** | `357-montar-desafio-780x360.png` |
| 18 | Seleção de time (Batalha CPU/hot-seat) | 0 (0) | 0 | 0 | 0 | **10** | `357-montar-selecao-780x360.png` |
| 19 | PvP — lobby (time montado) | 0 (0) | 0 | 0 | 0 | **10** | `357-pvp-780x360.png` |
| 20 | PvP — na fila | 0 (0) | 0 | 0 | 0 | **10** | `357-pvp-fila-780x360.png` |
| 21 | Coleção — sem seleção | 0 (0) | 0 | 0 | 0 | **10** | `357-colecao-780x360.png` |
| 22 | Coleção — com filtro | 0 (0) | 0 | 0 | 0 | **10** | `357-colecao-filtro-780x360.png` |
| 23 | Ficha do deus — SINERGIA | 0 (0) | 0 | 0 | 0 | **10** | `357-ficha-sinergia-780x360.png` |
| 24 | Ficha do deus — não possuída | 0 (0) | 0 | 0 | 0 | **10** | `357-ficha-falta-780x360.png` |
| 25 | Ficha do deus | 0 (0) | 0 | 0 | 0 | **10** | `357-ficha-780x360.png` |
| 26 | Níveis de habilidade | 0 (0) | 0 | 0 | 0 | **10** | `357-niveis-780x360.png` |
| 27 | Desafios (hub) | 0 (0) | 0 | 0 | 0 | **10** | `357-desafios-780x360.png` |
| 28 | Composição (desafios) | 0 (0) | 0 | 0 | 0 | **10** | `357-composicao-780x360.png` |
| 29 | Provações | 0 (0) | 0 | 0 | 0 | **10** | `357-provacoes-780x360.png` |
| 30 | Domínios — seleção dos 5 | 0 (0) | 0 | 0 | 0 | **10** | `357-dominios-780x360.png` |
| 31 | Domínios — ajuda "?" | 0 (0) | 0 | 0 | 0 | **10** | `357-dominios-ajuda-780x360.png` |
| 32 | Domínio HUB — em andamento (1 caído) | 0 (0) | 0 | 0 | 0 | **10** | `357-dominio-hub-andamento-780x360.png` |
| 33 | Domínio HUB — chefe vencido (3 prêmios) | 0 (0) | 0 | 0 | 0 | **10** | `357-dominio-hub-premio-780x360.png` |
| 34 | Domínio HUB — nova corrida | 0 (0) | 0 | 0 | 0 | **10** | `357-dominio-hub-nova-780x360.png` |
| 35 | Batalha — menu | 0 (0) | 0 | 0 | 0 | **10** | `357-batalha-menu-780x360.png` |
| 36 | Batalha — confirmação de sair | 0 (0) | 0 | 0 | 0 | **10** | `357-batalha-confirmar-sair-780x360.png` |
| 37 | Batalha — confirmação de desistir | 0 (0) | 0 | 0 | 0 | **10** | `357-batalha-confirmar-desistir-780x360.png` |

## Detalhe por tela

### Invocação — revelação — nota 2.6

Print: `docs/telas/357-invocacao-reveal-780x360.png`. Contagens: a=19, b=7, c=0, d=24. (textos visíveis: 24; tocáveis: 10.)

> Nota: A revelação é autoritativa do SERVIDOR; no modo arquivo (sem WS) as cartas não chegam. Aqui a sobreposição é aberta com o esqueleto REAL (`#iv-reveal`) para auditar a moldura (dica + "Invocar mais"); as cartas (`.iv-card`) precisam do servidor vivo.

**a) 10 piores textos pequenos** (px real):

- `span.iv-off` — **7.57px** ⚠<11 — "10% OFF"
- `span.iv-hero__tag` — **8.4px** ⚠<11 — "RATE-UP"
- `button.iv-oferta` — **8.42px** ⚠<11 — "— 10× grátis, SS garantido"
- `b` — **8.42px** ⚠<11 — "Bênção do Iniciante"
- `button.iv-hero__det` — **9.24px** ⚠<11 — "Ver detalhes"
- `button.iv-plus` — **9.26px** ⚠<11 — "+"
- `span.iv-pity__lbl` — **9.26px** ⚠<11 — "SS garantido"
- `div.iv-tip` — **9.26px** ⚠<11 — "toque fora para voltar"
- `p.iv-hero__cite` — **10.08px** ⚠<11 — "“Declarou primeiro. Perguntou depois.”"
- `span.iv-c.iv-cess` — **10.1px** ⚠<11 — "✦"

**b) 10 piores toques** (menor lado):

- `button.iv-plus` — **15.1×15.1** — "+"
- `button.iv-pity__q` — **18.5×18.5** — "?"
- `button.iv-oferta` — **245.2×23.6** — "Bênção do Iniciante — 10× grát"
- `button.iv-hbtn` — **25.2×25.2** — "‹"
- `button.iv-hero__det` — **108.5×26.9** — "⌕ Ver detalhes"
- `div.iv-revfoot` — **121.1×28.6** — "Invocar mais ×1"
- `#iv-revagain` — **121.1×28.6** — "Invocar mais ×1"

**d) cortes:**

- [sobreposto] **importante** `button.iv-oferta × div.iv-tip` — "— 10× grátis, SS g / toque fora para vo"
- [sobreposto] **importante** `span.iv-off × span.iv-pb__t` — "10% OFF / Invocação ×10"
- [encoberto] **importante** `button.iv-hbtn` — "‹"
- [encoberto] **importante** `span.iv-title` — "Invocação"
- [encoberto] **importante** `span.iv-c.iv-cess` — "✦"
- [encoberto] **importante** `#iv-essencia` — "—"
- [encoberto] **importante** `span.iv-c` — "💎"
- [encoberto] **importante** `#iv-gemas` — "—"
- [encoberto] **importante** `button.iv-plus` — "+"
- [encoberto] **importante** `span.iv-hero__tag` — "RATE-UP"

### Guia (folha de componentes, dev) — nota 3.1

Print: `docs/telas/357-guia-780x360.png`. Contagens: a=57, b=8, c=0, d=0. (textos visíveis: 58; tocáveis: 8.)

**a) 10 piores textos pequenos** (px real):

- `span.df-toast__ic` — **5.06px** ⚠<11 — "!"
- `span.df-toast__msg` — **5.06px** ⚠<11 — "Sem conexão com o servidor."
- `p.df-vazio` — **5.06px** ⚠<11 — "Nenhum deus neste filtro."
- `span.df-chip` — **5.49px** ⚠<11 — "Todas"
- `b` — **5.49px** ⚠<11 — "6"
- `span.df-chip.is-on` — **5.49px** ⚠<11 — "Conquistadas"
- `b` — **5.49px** ⚠<11 — "2"
- `span.dsk__nv` — **5.49px** ⚠<11 — "Nv 3"
- `span.nltop__ptn` — **5.49px** ⚠<11 — "Pontos de Zeus:"
- `b` — **5.49px** ⚠<11 — "0"

**b) 10 piores toques** (menor lado):

- `button.df-toast__x` — **10×7.6** — "✕"
- `button.nlb.nlb--go` — **63.3×16.9** — "CONFIRMAR"
- `button.nlb.nlb--quiet` — **63.3×16.9** — "CANCELAR"
- `span.df-chip` — **26.2×16.9** — "Todas 6"
- `span.df-chip.is-on` — **43.5×16.9** — "Conquistadas 2"
- `#bvoltar` — **58.1×30.4** — "‹ VOLTAR"
- `button.cmpb.cmpb--primary` — **51.6×30.4** — "JOGAR"
- `button.cmpb.cmpb--quiet` — **86.3×30.4** — "JOGAR DE NOVO"

### Invocação — tela — nota 4.3

Print: `docs/telas/357-invocacao-780x360.png`. Contagens: a=17, b=5, c=0, d=4. (textos visíveis: 22; tocáveis: 7.)

**a) 10 piores textos pequenos** (px real):

- `span.iv-off` — **7.57px** ⚠<11 — "10% OFF"
- `span.iv-hero__tag` — **8.4px** ⚠<11 — "RATE-UP"
- `button.iv-oferta` — **8.42px** ⚠<11 — "— 10× grátis, SS garantido"
- `b` — **8.42px** ⚠<11 — "Bênção do Iniciante"
- `button.iv-hero__det` — **9.24px** ⚠<11 — "Ver detalhes"
- `button.iv-plus` — **9.26px** ⚠<11 — "+"
- `span.iv-pity__lbl` — **9.26px** ⚠<11 — "SS garantido"
- `p.iv-hero__cite` — **10.08px** ⚠<11 — "“Declarou primeiro. Perguntou depois.”"
- `span.iv-c.iv-cess` — **10.1px** ⚠<11 — "✦"
- `#iv-essencia` — **10.1px** ⚠<11 — "—"

**b) 10 piores toques** (menor lado):

- `button.iv-plus` — **15.1×15.1** — "+"
- `button.iv-pity__q` — **18.5×18.5** — "?"
- `button.iv-oferta` — **245.2×23.6** — "Bênção do Iniciante — 10× grát"
- `button.iv-hbtn` — **25.2×25.2** — "‹"
- `button.iv-hero__det` — **108.5×26.9** — "⌕ Ver detalhes"

**d) cortes:**

- [sobreposto] **importante** `span.iv-off × span.iv-pb__t` — "10% OFF / Invocação ×10"
- [encoberto] **importante** `p.iv-hero__cite` — "“Declarou primeiro. Perguntou depois.”"
- [encoberto] **importante** `button.iv-hero__det` — "Ver detalhes"
- [encoberto] **importante** `span.iv-hero__lupa` — "⌕"

### Home — nota 4.7

Print: `docs/telas/357-home-780x360.png`. Contagens: a=21, b=1, c=0, d=1. (textos visíveis: 21; tocáveis: 9.)

**a) 10 piores textos pequenos** (px real):

- `span.ilha__camptxt` — **8.41px** ⚠<11 — "Capítulo I · Grécia"
- `span.ilha__campnum` — **8.41px** ⚠<11 — "0/6"
- `span.ilha__cont` — **8.41px** ⚠<11 — "91"
- `span.ilha__cont` — **8.41px** ⚠<11 — "100"
- `span.ilha__cont` — **8.41px** ⚠<11 — "0/60"
- `span.ilha__cont` — **8.41px** ⚠<11 — "9/100"
- `span.ilha__breveTag` — **8.41px** ⚠<11 — "· em breve"
- `span.mmoeda__ic.mmoeda__ic--gema` — **10.1px** ⚠<11 — "💎"
- `span.mmoeda__ic.mmoeda__ic--ess` — **10.1px** ⚠<11 — "◈"
- `span.ilha__nome` — **10.93px** ⚠<11 — "Campanha"

**b) 10 piores toques** (menor lado):

- `button.mperfil` — **98.7×33.6** — "Jogador"

**d) cortes:**

- [fora-tela] **importante** `img.mapa__art` — "Mapa de INCURSION"

### Em breve (marcador) — nota 6.8

Print: `docs/telas/357-embreve-780x360.png`. Contagens: a=1, b=1, c=0, d=2. (textos visíveis: 5; tocáveis: 1.)

**a) 10 piores textos pequenos** (px real):

- `#bvoltar` — **10.1px** ⚠<11 — "‹ Início"

**b) 10 piores toques** (menor lado):

- `#bvoltar` — **78×33.6** — "‹ Início"

**d) cortes:**

- [sobreposto] **importante** `div.stagemark × #bvoltar` — "INCURSION / ‹ Início"
- [encoberto] **importante** `div.stagemark` — "INCURSION"

### Carregamento (splash) — nota 10

Print: `docs/telas/357-carregamento-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 1; tocáveis: 0.)

_Sem achados._

### Batalha — meu turno — nota 10

Print: `docs/telas/357-batalha-meu-turno-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 31; tocáveis: 28.)

_Sem achados._

### Batalha — turno do oponente — nota 10

Print: `docs/telas/357-batalha-oponente-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 33; tocáveis: 28.)

_Sem achados._

### Batalha — habilidade armada — nota 10

Print: `docs/telas/357-batalha-armada-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 36; tocáveis: 25.)

_Sem achados._

### Batalha — inspeção da habilidade — nota 10

Print: `docs/telas/357-batalha-inspecao-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 35; tocáveis: 28.)

_Sem achados._

### Campanha — ato de batalha (consequências + kit) — nota 10

Print: `docs/telas/357-campanha-batalha-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 43; tocáveis: 13.)

_Sem achados._

### Campanha — texto mais longo (Conselho, 819c, paginado) — nota 10

Print: `docs/telas/357-campanha-texto-longo-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 26; tocáveis: 9.)

_Sem achados._

### Campanha — ato de escolha (opções inteiras, pista 86c) — nota 10

Print: `docs/telas/357-campanha-escolha-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 34; tocáveis: 14.)

_Sem achados._

### Campanha — ato de história (sintético) — nota 10

Print: `docs/telas/357-campanha-historia-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 26; tocáveis: 9.)

> Nota: A campanha atual só tem atos de batalha e escolha; este caso força `tipo='historia'` num ato real para auditar o caminho de render da história.

_Sem achados._

### Montar time — encontro da campanha — nota 10

Print: `docs/telas/357-montar-campanha-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 55; tocáveis: 35.)

_Sem achados._

### Montar time — Domínio (corrida) — nota 10

Print: `docs/telas/357-montar-dominio-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 59; tocáveis: 33.)

_Sem achados._

### Montar time — Desafio de composição — nota 10

Print: `docs/telas/357-montar-desafio-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 55; tocáveis: 27.)

_Sem achados._

### Seleção de time (Batalha CPU/hot-seat) — nota 10

Print: `docs/telas/357-montar-selecao-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 58; tocáveis: 34.)

_Sem achados._

### PvP — lobby (time montado) — nota 10

Print: `docs/telas/357-pvp-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 60; tocáveis: 39.)

_Sem achados._

### PvP — na fila — nota 10

Print: `docs/telas/357-pvp-fila-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 5; tocáveis: 1.)

_Sem achados._

### Coleção — sem seleção — nota 10

Print: `docs/telas/357-colecao-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 99; tocáveis: 44.)

_Sem achados._

### Coleção — com filtro — nota 10

Print: `docs/telas/357-colecao-filtro-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 30; tocáveis: 23.)

_Sem achados._

### Ficha do deus — SINERGIA — nota 10

Print: `docs/telas/357-ficha-sinergia-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 27; tocáveis: 7.)

_Sem achados._

### Ficha do deus — não possuída — nota 10

Print: `docs/telas/357-ficha-falta-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 31; tocáveis: 12.)

_Sem achados._

### Ficha do deus — nota 10

Print: `docs/telas/357-ficha-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 28; tocáveis: 11.)

_Sem achados._

### Níveis de habilidade — nota 10

Print: `docs/telas/357-niveis-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 52; tocáveis: 4.)

_Sem achados._

### Desafios (hub) — nota 10

Print: `docs/telas/357-desafios-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 68; tocáveis: 15.)

_Sem achados._

### Composição (desafios) — nota 10

Print: `docs/telas/357-composicao-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 34; tocáveis: 5.)

_Sem achados._

### Provações — nota 10

Print: `docs/telas/357-provacoes-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 26; tocáveis: 7.)

_Sem achados._

### Domínios — seleção dos 5 — nota 10

Print: `docs/telas/357-dominios-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 45; tocáveis: 9.)

_Sem achados._

### Domínios — ajuda "?" — nota 10

Print: `docs/telas/357-dominios-ajuda-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 3; tocáveis: 1.)

_Sem achados._

### Domínio HUB — em andamento (1 caído) — nota 10

Print: `docs/telas/357-dominio-hub-andamento-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 57; tocáveis: 3.)

_Sem achados._

### Domínio HUB — chefe vencido (3 prêmios) — nota 10

Print: `docs/telas/357-dominio-hub-premio-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 55; tocáveis: 5.)

_Sem achados._

### Domínio HUB — nova corrida — nota 10

Print: `docs/telas/357-dominio-hub-nova-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 41; tocáveis: 3.)

_Sem achados._

### Batalha — menu — nota 10

Print: `docs/telas/357-batalha-menu-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 11; tocáveis: 9.)

_Sem achados._

### Batalha — confirmação de sair — nota 10

Print: `docs/telas/357-batalha-confirmar-sair-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 4; tocáveis: 2.)

_Sem achados._

### Batalha — confirmação de desistir — nota 10

Print: `docs/telas/357-batalha-confirmar-desistir-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 4; tocáveis: 2.)

_Sem achados._

## Prints gerados

- `docs/telas/357-carregamento-780x360.png` — Carregamento (splash)
- `docs/telas/357-home-780x360.png` — Home
- `docs/telas/357-batalha-meu-turno-780x360.png` — Batalha — meu turno
- `docs/telas/357-batalha-oponente-780x360.png` — Batalha — turno do oponente
- `docs/telas/357-batalha-armada-780x360.png` — Batalha — habilidade armada
- `docs/telas/357-batalha-inspecao-780x360.png` — Batalha — inspeção da habilidade
- `docs/telas/357-campanha-batalha-780x360.png` — Campanha — ato de batalha (consequências + kit)
- `docs/telas/357-campanha-texto-longo-780x360.png` — Campanha — texto mais longo (Conselho, 819c, paginado)
- `docs/telas/357-campanha-escolha-780x360.png` — Campanha — ato de escolha (opções inteiras, pista 86c)
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
- `docs/telas/357-dominios-780x360.png` — Domínios — seleção dos 5
- `docs/telas/357-dominios-ajuda-780x360.png` — Domínios — ajuda "?"
- `docs/telas/357-dominio-hub-andamento-780x360.png` — Domínio HUB — em andamento (1 caído)
- `docs/telas/357-dominio-hub-premio-780x360.png` — Domínio HUB — chefe vencido (3 prêmios)
- `docs/telas/357-dominio-hub-nova-780x360.png` — Domínio HUB — nova corrida
- `docs/telas/357-invocacao-780x360.png` — Invocação — tela
- `docs/telas/357-invocacao-reveal-780x360.png` — Invocação — revelação
- `docs/telas/357-guia-780x360.png` — Guia (folha de componentes, dev)
- `docs/telas/357-embreve-780x360.png` — Em breve (marcador)
- `docs/telas/357-batalha-menu-780x360.png` — Batalha — menu
- `docs/telas/357-batalha-confirmar-sair-780x360.png` — Batalha — confirmação de sair
- `docs/telas/357-batalha-confirmar-desistir-780x360.png` — Batalha — confirmação de desistir


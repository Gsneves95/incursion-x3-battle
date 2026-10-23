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
| 1 | Campanha — ato de batalha | 42 (40) | 5 | 1 | 8 | **2.5** | `357-campanha-batalha-780x360.png` |
| 2 | Invocação — revelação | 19 (19) | 7 | 0 | 24 | **2.6** | `357-invocacao-reveal-780x360.png` |
| 3 | Guia (folha de componentes, dev) | 57 (57) | 8 | 0 | 0 | **3.1** | `357-guia-780x360.png` |
| 4 | Domínios — seleção | 64 (58) | 4 | 0 | 4 | **3.8** | `357-dominios-780x360.png` |
| 5 | Domínio — hub | 32 (32) | 3 | 0 | 0 | **4.1** | `357-dominio-hub-780x360.png` |
| 6 | Invocação — tela | 17 (17) | 5 | 0 | 4 | **4.3** | `357-invocacao-780x360.png` |
| 7 | Campanha — ato de escolha | 38 (38) | 6 | 0 | 0 | **4.6** | `357-campanha-escolha-780x360.png` |
| 8 | Home | 21 (21) | 1 | 0 | 0 | **4.8** | `357-home-780x360.png` |
| 9 | Campanha — ato de história (sintético) | 22 (22) | 2 | 0 | 1 | **5.4** | `357-campanha-historia-780x360.png` |
| 10 | Em breve (marcador) | 1 (1) | 1 | 0 | 2 | **6.8** | `357-embreve-780x360.png` |
| 11 | Carregamento (splash) | 0 (0) | 0 | 0 | 0 | **10** | `357-carregamento-780x360.png` |
| 12 | Batalha — meu turno | 0 (0) | 0 | 0 | 0 | **10** | `357-batalha-meu-turno-780x360.png` |
| 13 | Batalha — turno do oponente | 0 (0) | 0 | 0 | 0 | **10** | `357-batalha-oponente-780x360.png` |
| 14 | Batalha — habilidade armada | 0 (0) | 0 | 0 | 0 | **10** | `357-batalha-armada-780x360.png` |
| 15 | Batalha — inspeção da habilidade | 0 (0) | 0 | 0 | 0 | **10** | `357-batalha-inspecao-780x360.png` |
| 16 | Montar time — encontro da campanha | 0 (0) | 0 | 0 | 0 | **10** | `357-montar-campanha-780x360.png` |
| 17 | Montar time — Domínio (corrida) | 0 (0) | 0 | 0 | 0 | **10** | `357-montar-dominio-780x360.png` |
| 18 | Montar time — Desafio de composição | 0 (0) | 0 | 0 | 0 | **10** | `357-montar-desafio-780x360.png` |
| 19 | Seleção de time (Batalha CPU/hot-seat) | 0 (0) | 0 | 0 | 0 | **10** | `357-montar-selecao-780x360.png` |
| 20 | PvP — lobby (time montado) | 0 (0) | 0 | 0 | 0 | **10** | `357-pvp-780x360.png` |
| 21 | PvP — na fila | 0 (0) | 0 | 0 | 0 | **10** | `357-pvp-fila-780x360.png` |
| 22 | Coleção — sem seleção | 0 (0) | 0 | 0 | 0 | **10** | `357-colecao-780x360.png` |
| 23 | Coleção — com filtro | 0 (0) | 0 | 0 | 0 | **10** | `357-colecao-filtro-780x360.png` |
| 24 | Ficha do deus — SINERGIA | 0 (0) | 0 | 0 | 0 | **10** | `357-ficha-sinergia-780x360.png` |
| 25 | Ficha do deus — não possuída | 0 (0) | 0 | 0 | 0 | **10** | `357-ficha-falta-780x360.png` |
| 26 | Ficha do deus | 0 (0) | 0 | 0 | 0 | **10** | `357-ficha-780x360.png` |
| 27 | Níveis de habilidade | 0 (0) | 0 | 0 | 0 | **10** | `357-niveis-780x360.png` |
| 28 | Desafios (hub) | 0 (0) | 0 | 0 | 0 | **10** | `357-desafios-780x360.png` |
| 29 | Composição (desafios) | 0 (0) | 0 | 0 | 0 | **10** | `357-composicao-780x360.png` |
| 30 | Provações | 0 (0) | 0 | 0 | 0 | **10** | `357-provacoes-780x360.png` |
| 31 | Batalha — menu | 0 (0) | 0 | 0 | 0 | **10** | `357-batalha-menu-780x360.png` |
| 32 | Batalha — confirmação de sair | 0 (0) | 0 | 0 | 0 | **10** | `357-batalha-confirmar-sair-780x360.png` |
| 33 | Batalha — confirmação de desistir | 0 (0) | 0 | 0 | 0 | **10** | `357-batalha-confirmar-desistir-780x360.png` |

## Detalhe por tela

### Campanha — ato de batalha — nota 2.5

Print: `docs/telas/357-campanha-batalha-780x360.png`. Contagens: a=42, b=5, c=1, d=8. (textos visíveis: 47; tocáveis: 13.)

**a) 10 piores textos pequenos** (px real):

- `span.crec__u` — **5.3px** ⚠<11 — "GEMAS"
- `span.cslot__nome` — **5.89px** ⚠<11 — "Zeus"
- `span.cslot__nome` — **5.89px** ⚠<11 — "Nezha"
- `span.cslot__nome` — **5.89px** ⚠<11 — "Hades"
- `span.camp__form` — **5.89px** ⚠<11 — "3 VS 3"
- `span.camp__capeye` — **6.72px** ⚠<11 — "CAPÍTULO I"
- `span.camp__lbl.camp__lbl--voce` — **6.73px** ⚠<11 — "Você jogará com"
- `span.cslot__badge.cslot__lock` — **6.73px** ⚠<11 — "⚿"
- `span.cslot__badge.cslot__swap` — **6.73px** ⚠<11 — "⇄"
- `span.cslot__badge.cslot__swap` — **6.73px** ⚠<11 — "⇄"

**b) 10 piores toques** (menor lado):

- `#capprev` — **7.8×15.1** — "‹"
- `#bvoltar` — **65.4×20.2** — "Início"
- `#campcta` — **351.5×27.8** — "Jogar"
- `button.camp__kitchip` — **351.5×28.6** — "Kit reveladoHel — ver as 4 hab"
- `button.camp__kitchip` — **351.5×28.6** — "Kit reveladoFenrir — ver as 4 "

**c) rolagens proibidas:**

- `div.camp__briefrol` — eixo Y, +80px — "“Você desconfiou do silêncio, "

**d) cortes:**

- [corte] **importante** `span.cnode__nome` — "Alianças, conflitos e oportunidades"
- [corte-ancestral] **importante** `b.crec__v` — "120"
- [corte-ancestral] **importante** `span.crec__u` — "GEMAS"
- [sobreposto] **importante** `span × #campcta` — "Fenrir — ver as 4  / Jogar"
- [sobreposto] **importante** `span.camp__lbl.camp__lbl--rec × #campcta` — "Recompensas / Jogar"
- [encoberto] **importante** `b.crec__v` — "120"
- [encoberto] **importante** `span.crec__u` — "GEMAS"
- [ellipsis] `span.camp__capep` — "“A dispersão não foi aleatória. Foi o in"

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

### Domínios — seleção — nota 3.8

Print: `docs/telas/357-dominios-780x360.png`. Contagens: a=64, b=4, c=0, d=4. (textos visíveis: 65; tocáveis: 9.)

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

- `#dajuda` — **21.9×21.9** — "?"
- `#dhistver` — **102.3×25.2** — "Ver histórico"
- `#binicio` — **28.6×28.6** — ""
- `#dhist` — **115.4×37.9** — "Seu históricoseus recordes por"

**d) cortes:**

- [corte-ancestral] **importante** `i` — "Amaterasu"
- [corte-ancestral] **importante** `i` — "Tsukuyomi"
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

### Campanha — ato de escolha — nota 4.6

Print: `docs/telas/357-campanha-escolha-780x360.png`. Contagens: a=38, b=6, c=0, d=0. (textos visíveis: 42; tocáveis: 13.)

**a) 10 piores textos pequenos** (px real):

- `span.camp__capeye` — **6.72px** ⚠<11 — "PRÓLOGO"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Era dos Planos"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Incursão"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Criação do Eixo"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Profecia do Uno"
- `span.cnode__nome` — **6.73px** ⚠<11 — "O Início do Conflito"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Ruptura entre Céu e Terra"
- `span.cnode__nome` — **6.73px** ⚠<11 — "O Ciclo dos Expulsos"
- `span.camp__num` — **7.31px** ⚠<11 — "TRECHO I"
- `span.camp__capep` — **7.31px** ⚠<11 — "“Antes da unidade, havia o multiverso da"

**b) 10 piores toques** (menor lado):

- `#bvoltar` — **65.4×20.2** — "Início"
- `#campcta` — **351.5×27.8** — "Confirmar escolha"
- `button.copc` — **351.5×35.3** — "OL OlimpoOs que governam do al"
- `button.copc` — **351.5×35.3** — "AS AsgardOs salões de guerra o"
- `button.copc` — **351.5×35.3** — "DU DuatO rio, a balança e a lo"
- `button.copc` — **351.5×35.3** — "XI XibalbaAs cavernas sagradas"

### Home — nota 4.8

Print: `docs/telas/357-home-780x360.png`. Contagens: a=21, b=1, c=0, d=0. (textos visíveis: 21; tocáveis: 9.)

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

### Campanha — ato de história (sintético) — nota 5.4

Print: `docs/telas/357-campanha-historia-780x360.png`. Contagens: a=22, b=2, c=0, d=1. (textos visíveis: 27; tocáveis: 9.)

> Nota: A campanha atual só tem atos de batalha e escolha; este caso força `tipo='historia'` num ato real para auditar o caminho de render da história.

**a) 10 piores textos pequenos** (px real):

- `span.camp__capeye` — **6.72px** ⚠<11 — "PRÓLOGO"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Era dos Planos"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Incursão"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Criação do Eixo"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Profecia do Uno"
- `span.cnode__nome` — **6.73px** ⚠<11 — "O Início do Conflito"
- `span.cnode__nome` — **6.73px** ⚠<11 — "A Ruptura entre Céu e Terra"
- `span.cnode__nome` — **6.73px** ⚠<11 — "O Ciclo dos Expulsos"
- `span.camp__num` — **7.31px** ⚠<11 — "TRECHO I"
- `span.camp__capep` — **7.31px** ⚠<11 — "“Antes da unidade, havia o multiverso da"

**b) 10 piores toques** (menor lado):

- `#bvoltar` — **65.4×20.2** — "Início"
- `#campcta` — **246×27.8** — "Continuar"

**d) cortes:**

- [encoberto] **importante** `span.cnode__nome` — "A Era dos Planos"

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

Print: `docs/telas/357-batalha-meu-turno-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 42; tocáveis: 36.)

_Sem achados._

### Batalha — turno do oponente — nota 10

Print: `docs/telas/357-batalha-oponente-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 44; tocáveis: 36.)

_Sem achados._

### Batalha — habilidade armada — nota 10

Print: `docs/telas/357-batalha-armada-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 46; tocáveis: 33.)

_Sem achados._

### Batalha — inspeção da habilidade — nota 10

Print: `docs/telas/357-batalha-inspecao-780x360.png`. Contagens: a=0, b=0, c=0, d=0. (textos visíveis: 46; tocáveis: 36.)

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


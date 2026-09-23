# §305 — TELA INICIAL vira MAPA estático (medição + proposta, antes de desenhar)

O carrossel da home dá lugar a um mapa com 9 destinos em lugares fixos. **Nada foi construído** — o dono pediu para
RESOLVER a geometria e reportar antes, e não escolher sozinho. Os assets (fundo + 9 ícones) ainda não estão no repo.

## 1) O problema técnico — geometria (a decisão que decide tudo)

**Régua real (`src/enquadramento.js`):** altura de design **FIXA 428**; largura de design **FLUIDA**, `clamp(larguraUtil/escala,
780, 1200)`; escala pela altura (teto 1,25). A proporção do palco vai de **780/428 = 1,82** (piso) a **1200/428 = 2,80** (folga) —
o "2,22" que o dono citou é uma largura física intermediária (≈951). O fundo do mapa é **1,78** — mais alto (mais quadrado) que
qualquer proporção do palco, então em toda largura sobra espaço horizontal.

**Se a arte preenche a ALTURA (428):** largura = 428 × 1,78 = **762px**. Confere com o dono (~760).
**Se a arte preenche a LARGURA:** a 1200 a altura viraria 1200/1,78 = 674 (>428) → **corta 37% da altura** → as ilhas de cima e
de baixo somem → os ícones sairiam das ilhas. **FATAL** num mapa de lugares fixos (a análise do dono está certa).

### Proposta: CAIXA DE PROPORÇÃO TRAVADA (a inclinação do dono)
O mapa mantém **762×428 (1,78), centrado**; o resto da largura fica com o fundo do jogo. Os ícones ancoram **NA ARTE, em % dela**
— nunca saem das ilhas, em nenhuma largura. Sobra de cada lado (gutter = (largura_design − 762)/2):

| largura de design | gutter cada lado | total nas bordas |
|---|---|---|
| 780 (piso) | **9px** | 18px (quase full-bleed) |
| 900 | 69px | 138px |
| 1000 | 119px | 238px |
| 1080 | 159px | 318px |
| 1200 (teto) | **219px** | 438px |

**Custo honesto:** no piso o mapa é quase inteiro (9px de folga); nas telas largas sobra até **219px de cada lado**. Tratamento
do gutter (a decidir): (a) o **fundo escuro do jogo** (radial do §214) — simples, lê como moldura; (b) **extensão borrada/escurecida
das bordas do mapa** — o mapa "vaza" para os lados sem ícone, some a sensação de tarja. Recomendo (a) para começar, (b) se o vazio
incomodar nas telas largas.

**Alternativas descartadas:** preencher largura (corta as ilhas — fatal); arte mais larga (1,78→2,22) ainda corta/tarja nos
extremos da faixa fluida (780..1200) e é retrabalho de arte. **A caixa travada é a única em que os ícones nunca saem das ilhas.**
**Decisão do dono:** confirmar a caixa travada + escolher o tratamento do gutter (a/b).

## 2) Os ícones — tamanho na composição

9 ícones (1254×1254, o dono recorta p/ alpha). Na caixa de 762×428, o tamanho depende de quão grandes são nas ilhas. Estimativa
por fração da largura da arte (762):

| fração da arte | design | físico SE (esc 0,855) | físico teto (1,25) |
|---|---|---|---|
| 6% | 46px | 39px | 57px |
| 8% | 61px | 52px | 76px |
| 10% | 76px | 65px | 95px |

Pela referência (ícones sizeáveis nas ilhas, com nome abaixo), a faixa realista é **8–10% → ~61–76px design (52–76px físicos)**,
**bem acima do piso de 35px**. Só cairia perto de 35 se ficarem <5% da arte, o que não é o caso da referência. **Confirmo o número
exato ao posicionar nas ilhas** (preciso da referência montada + os arquivos). Se algum ficar <35px, reporto antes de aplicar.

## 3) O que a referência MENTE — não reproduzir

1. **"Gustavo — Nv. 42" + barra de progresso:** **não existe nível de conta.** O que existe: **apelido** (`contaAtual.nick`) e
   **faixa de ranque** (`contaAtual.ranque.faixa` → uma das 8 faixas, `.nome`). Cabe um chip de perfil com **apelido + faixa**
   (ex.: "Gustavo · Bronze"), **sem barra de nível** (prometeria progressão que não há). Offline (sem conta) → só o apelido local.
2. **Envelope e sino (aviso):** não há correio nem notificação. **Saem.**
3. **"2.450K":** o jogo formata moeda com **`toLocaleString('pt-BR')`** — pontos de milhar, número inteiro (ex.: "2.450", "601.500").
   **Sem abreviação "K".** Se o mapa mostrar moeda no topo, segue esse formato (gema 💎 + essência ◈).

## 4) O que o carrossel faz hoje que o MAPA precisa manter

Auditoria de `bannerVivoHTML` — o **dado vivo por destino** (reporto antes, não descubro depois):

| destino | dado vivo hoje | precisa no mapa |
|---|---|---|
| Campanha | "Capítulo I · região" + `feitos/total` + **barra de progresso** | contador + barra |
| Provações | `liberados/total` (missões, quando online) | contador |
| Desafios | `63` (acervo de pergaminhos) | contador |
| Invocação | `pity/60` (desdeUltimoSS) | contador |
| Coleção | `donos/100` | contador |
| Domínios | cartão **placeholder "Em breve"** (arte definitiva pendente, §274) | estado "em breve" até a arte |
| Loja | rota `embreve` (tela "em breve") | estado "em breve" |
| Batalha CPU (Arena/Treino) | — | nada |
| PvP | — (o lobby explica) | nada |

**Conclusão:** o mapa precisa de **5 contadores** (Campanha com barra; Provações, Desafios, Invocação, Coleção como número) e
**2 estados "em breve"** (Domínios até a arte, Loja até a feature). **Não há badge "novo" nem cartão bloqueado ativos hoje** — o
mecanismo `bcard--off` existe mas nenhum destino o usa. **Cada ilha precisa reservar um lugar para um contador/badge pequeno**,
senão o dado vivo do carrossel se perde na troca.

## 5) Proposta de assets (nome derivado da chave, sem campo novo — padrão retratos/skills)

- **Fundo:** `web/banners/mapa.webp` (1,78). Manifesto de build `MAPA_ARTE` (0/1); ausente → o carrossel de hoje segue (sem 404).
- **9 ícones:** `web/mapa/<chave>.webp`, chave = a do destino (`campanha, provacoes, desafios, invocacao, colecao, dominios, loja,
  arena, pvp`). Manifesto `MAPA_ICONES` (mapa de presentes); ausente um → o destino cai no rótulo/placeholder, nunca 404, nunca base64.
- **Posições das ilhas:** campo de dado (percentuais x/y por chave), para o dono ajustar sem tocar código, como os fundos do §304.

## 6) §305b — MEDIÇÃO dos contadores nas ilhas (aprovada a caixa travada; gutter = fundo escuro (a))

Larguras REAIS com as fontes do jogo (Cinzel/Rajdhani locais, §260), em px de DESIGN, na caixa 762×428.

**Nomes das ilhas (Cinzel 700, 13px):** Invocação **80**, Provações 77, Campanha 75, Domínios 70, Coleção 64, Desafios 63,
Treino 51, Arena 45, Loja 32, PvP 26. Todos ≤ 80px. **Exceção: "Arena/Treino" = 102px** — o 9º modo deve ser UMA palavra
(**Arena** 45 ou **Treino** 51), nunca a forma com barra.

**Contadores (Rajdhani 600, 10px):** os quatro curtos são minúsculos — Provações `12/91` **21**, Desafios `100` **14**,
Invocação `2/60` **19**, Coleção `36/100` **28**. Cabem sob qualquer nome. **O único longo é a Campanha:**
`Capítulo I · Grécia` = **71px** (+ a barra de progresso). Isso ≈ o nome mais largo (Invocação 80), então **não estoura o
rodapé natural da ilha** — a barra fica na linha abaixo (~5px).

**Leitura (a decisão é do dono):** pelo TEXTO, **tudo cabe** — o bloco de rótulo de cada ilha é limitado por ~80px (nome ou
contador, o que for maior), e a Campanha (71) não passa disso. O que decide o encaixe real é o **espaçamento das ilhas** na
referência (que ainda não tenho): se duas ilhas ficarem a menos de ~85px uma da outra na horizontal, os rótulos colidem. **Confirmo
na montagem.**

**Campanha — caveat do dado:** os 71px valem para a região "Grécia" (6 letras). Uma região longa (ex.: "Escandinávia", 12) empurra
para ~100px. Formas curtas prontas, por ordem de corte: **`Cap. I · <reg>`** (55px) → **`Cap. I`** (23px) + barra → **só a barra +
`0/6`** (14px). Minha leitura: manter a forma cheia enquanto a região for curta (~≤7 letras); trocar por `Cap. I · <reg>` quando
uma região passar de ~85px. Os quatro contadores curtos nunca precisam de corte.

**Os dois "em breve" (Domínios, Loja) — indisponível sem parecer defeito:** ícone a **~50% de opacidade** + uma tag pequena
**"· em breve"** (38px @10px, dourado apagado) sob o nome — NUNCA vermelho/erro. Cabe sob Domínios (70) e Loja (32). É a mesma
linguagem do placeholder do carrossel (◈ "Em breve"), sem 404.

**Próximo passo:** o dono manda o fundo + os 9 ícones + a referência montada (para eu ler as posições das ilhas e confirmar o
espaçamento). Aí construo o mapa com os ícones em % da arte, os 5 contadores (Campanha na forma cheia enquanto couber) e os 2
"em breve", e capturo a 780 e 1200 para o veredito.

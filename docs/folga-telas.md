# §307 — O MAPA DE FOLGA DAS TELAS (onde a próxima tela vai doer)

Nasceu do §306: uma tela nova (o MAPA da home, com nomes em Cinzel) empurrou uma antiga que estava a **zero de
folga** — o `babi.milagre` na sobreposição da Coleção — e cortou em silêncio. O conserto foi devolver folga, não
recalibrar a guarda. Este documento responde a pergunta que aquilo levantou: **quantas outras telas estão no fio?**

## A distinção que decide tudo: TRANSBORDO ≠ FOLGA

- Uma guarda de **TRANSBORDO** (`scrollHeight > clientHeight`, `scrollWidth`, `clip`) só responde **"ESTOUROU?"**.
  `scrollHeight` **trava no `clientHeight` quando o texto cabe** (nunca fica menor que o box), então:
  - é **cega ao que sobra** — `clientHeight − scrollHeight` é **sempre ≤ 0**; não existe folga positiva por essa conta
    (o §304b tentou medir assim e imprimia "~0px"; era o método, não a folga);
  - é **cega ao que já foi cortado** — reticência (`text-overflow:ellipsis`) e `-webkit-line-clamp` têm
    `overflow:hidden`: o texto excedente **some sem transbordar**, então `scrollHeight`/`scrollWidth` **não acusam**.
- Só a medição do **TAMANHO NATURAL** — clonar o elemento solto (`height/width:auto`, sem `max-height`, sem
  `line-clamp`, `overflow:visible`) e ler o rect — responde **as duas** perguntas: `folga = disponível − natural`
  (positiva = sobra; negativa = quanto já foi cortado). É o método deste §307.

## A lista, ordenada pela folga (pior caso, piso de 780; px de design)

| # | Tela | Pior caso | Folga | Guarda hoje | §307 |
|---|------|-----------|-------|-------------|------|
| 1 | **Domínios** — nome (seleção) | "Amaterasu" | **−33px** (reticência corta) | ❌ nenhuma | **novo teto de corte 45px** (`folga.test.js`) |
| 2 | **Campanha** — nome do nó | "A Incursão" | **−10px** (clamp corta ~1 linha) | ❌ só contava nós | **novo teto de corte 18px** (`folga.test.js`) |
| 3 | **Batalha** — faixa de efeitos | 6 efeitos | **+1px** vertical (fixa nas bordas, design) · **+7px** horizontal | ⚠️ transbordo (`clip==0`) | **+ folga horizontal, piso 4px** (`batalha_faixa`) |
| 4 | **Invocação** — arte do destaque → barra de pity | pity 30 | **+1px** (a máscara §304c dissolve o encontro) | ✅ contraste (§304e) + posição (§304d) | mantida (a folga real é o contraste, positivo) |
| 5 | **Coleção — grade** — nome do card | "Mula sem Cabeça" | **+5px** | ❌ nenhuma | **novo teto de corte 12px** (`colecao_encaixe`) |
| 6 | **Coleção — sobreposição** — texto de efeito | babi.milagre | **+20px** (era −18 antes do §306) | ⚠️ transbordo (`scrollHeight`) | **→ folga positiva, piso 8px** (`colecao_encaixe`) |
| 7 | **Mapa** — espaçamento das ilhas | Campanha↔Provações | **+37px** | ✅ positiva (pior − piso 85) | mantida (§306) |
| — | **Coleção — painel** | — | sem corte (o nome **quebra em linha**, não trunca) | — | baixo risco, sem guarda |

## Os dois cortes que ninguém sabia (silenciosos por reticência/clamp)

- **Domínios: "Amaterasu" perde 33px** (a 780) — a reticência engole; nenhum teste via. Decisão de corte é do §277 e
  **fica**; o §307 só passa a MEDIR e quebra se piorar (> 45px). Se amanhã um nome cortar 60px, a suíte avisa.
- **Campanha: "A Incursão" perde ~1 linha (10px)** no nó — o `line-clamp:2` corta a 3ª linha em silêncio. Idem: o
  corte fica, a medição passa a existir (teto 18px ≈ perder 2 linhas).

## Os pisos e tetos — e por quê

Piso = folga mínima que exigimos (quebra **abaixo**). Teto de corte = corte máximo tolerado (quebra **acima**). Cada
um passa hoje com margem, fica acima do ruído de fonte (±1–2px) e quebra **antes** de virar defeito visível.

- **Coleção sobreposição — piso 8px** (folga positiva). Pior hoje +20 (babi/nuwa). 8 ≈ meia linha: avisa com ~+8 de
  margem, **antes** do corte, não em cima dele. O §306 comeu ~18px de uma vez; com piso 8, uma repetição derruba
  +20→+2 e quebra com o texto ainda inteiro. Piso maior arriscaria falso-positivo com conteúdo novo legítimo.
- **Batalha faixa — piso 4px** (folga HORIZONTAL). A faixa é **vertically edge-pinned** (banda cheia, 0 por design →
  o `clip` de transbordo continua sendo o certo lá). O que cresce com mais efeitos é a linha NOWRAP na horizontal, e
  isso **não era medido**. Pior hoje +7 (6 efeitos, o teto de stress; o real §266 é 4). Piso 4 dá folga e pega um 7º
  efeito ou chip mais largo.
- **Coleção grade — teto de corte 12px** (reticência). Hoje 0/100 cortam (o mais largo, "Mula sem Cabeça", tem +5 de
  folga). Teto 12 ≈ ~1 glifo: não proíbe a reticência, mas quebra se nomes começarem a ser picados de verdade.
- **Domínios — teto de corte 45px**. Hoje 33 (Amaterasu). Folga de 12 sobre o atual; pega o "60px" hipotético.
- **Campanha — teto de corte 18px**. Hoje 10 (1 linha). Pega a perda de uma 2ª linha (~20px).
- **Invocação** — a folga geométrica arte↔barra é ~0 **por design** (§304d: a figura entra na barra e a máscara
  §304c dissolve). A folga que importa ali é o **contraste** (§304e, ≥4.5) — já é guarda positiva. Nada a converter.
- **Mapa** — já positiva no §306 (espaçamento ≥ 85; âncoras em % dentro da arte). Mantida.

## Onde a próxima tela vai doer (leitura)

- Já cortando, agora medido: **Domínios (−33)** e **Campanha (−10)** — graciosos, mas eram invisíveis.
- Folga de TEXTO sensível a fonte (o risco tipo babi): **grade +5** é a mais exposta que ainda não corta;
  **sobreposição +20** ganhou fôlego no §306 e agora tem piso.
- Os **+1px** de Batalha (vertical) e Invocação são adjacências **posicionais** por design (px/%, não texto) — pouco
  sensíveis a fonte; a próxima tela dificilmente os empurra.

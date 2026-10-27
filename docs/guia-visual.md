# Guia visual do INCURSION

> Tirado do **CSS real** (`src/shell.html`) e das **funções reais** (`src/ui/*.js`). Cada valor cita o seletor/variável de
> onde vem. Serve para que toda tela nova nasça com o padrão aprovado pelo dono (batalha §335–§340, Desafios §339,
> montadores §342–§345, Coleção §346, hub do Domínio §348, Provações §349, ficha/níveis §350, Composição §351,
> carregamento §341). A **folha de componentes** viva está na rota interna `guia` (`renderGuia`, `src/ui/home.js`) e é
> capturada em `docs/telas/352-guia-*`. O teste `tests/guia_folha.test.js` garante que **este documento e a folha não
> divergem**.

## Cores (`:root`, `src/shell.html`)

**Fundo (camadas):** `--bg:#07060f` (app); as telas fixas usam o marinho em degradê
`radial-gradient(130% 90% at 50% 0%,#0e1424,#070a14 60%,#05070e)` (ex.: `#desafios`, `#compfix`, `#guiafix`); painéis em
`rgba(12,16,30,.7–.9)` com `box-shadow: inset 0 0 0 1px rgba(201,164,76,.3)` (borda dourada fina) ou
`rgba(154,164,184,.18)` (borda neutra). `--panel`/`--panel-2` são os painéis do app antigo.

**Dourado (destaque — uma só cor de ação):** `--gold:#d8b25a`, `--gold-soft:#8a6b2f`, `--gold-text:#ffd97a`; o botão/ação
principal é o gradiente `linear-gradient(180deg,#FBE29A,#E9C25A 45%,#C9962F)` sobre texto escuro `#2A1A04`. Títulos em
`#F0D79A`.

**Neutros (texto):** `--ink:#e3ddf7`, `--ink-dim:#a99cd0`, `--ink-mute:#7d78a0`; nas telas fixas o corpo é `#E8ECF4`/
`#C9CED8` e o secundário `#9AA4B8`.

**Elementos (`--e-*`):** Aurora `#ffc94a` · Tempestade `#9fd8ff` · Verdejante `#58d68d` · Chama `#ff5c8a` ·
Umbra `#a06bff` · Maré `#4ad3c7`; "livre" é a orbe neutra clara. A cor sai de `COR(elem)` → `var(--e-<elem>)`
(`src/ui/base.js`). Use SÓ para identificar elemento (orbe, moldura de time), nunca como destaque de ação.

**Vermelho** (`--danger:#ff3b3b`, `--enemy:#e0607f`): só **erro / inimigo / perigo** (toast de erro `.df-toast`, custo
faltando `.skill__cost i.miss`, moldura do oponente `.dm-card--sel2`, "Desistir" `.dfb--danger`). **Verde**
(`#58D68D`/`#9AD3A0`): só estado **positivo discreto** — "GRÁTIS" (`.dmk-ab__gratis`), "✓ Vencido"
(`.cmp-card__won`), vida cheia (`--hp-ok-1/2`). Nunca para decorar.

## Tipografia

- **Cinzel** (serif, `.cin`) → títulos e nomes próprios: título de tela (34–42px), nome de deus/habilidade, rótulo de
  bloco (`.df-titulo`, `.cmp-titulo`, `.dmaes__rot`, `.cmp-card__n`, `.ddet__tit`, `.nlp__tipo`).
- **Rajdhani** (`body`, sans) → todo o resto: corpo, rótulos, números.
- **Tamanhos em uso** (desenho 1846×852): título de tela 34–42px · título de bloco 22px · número grande 24–28px ·
  corpo 20–23px · rótulo 18–20px. Os **mínimos que valem** estão abaixo (§357) — medidos no aparelho, não no desenho.

## Padrão de acessibilidade (§357 — substitui os mínimos antigos)

Os mínimos antigos (corpo ≥ 20px, toque ≥ 72px) eram medidos **no DESENHO de 1846×852**. Mas o jogo roda escalado: num
**S24 deitado (~780×360 px CSS)** a escala é `min(780/1846, 360/852) ≈ 0,4225`, então 20px de desenho viram **~8,4px
reais** — ilegível. Por isso o padrão agora é medido em **px CSS REAIS no viewport de referência 780×360** (o
`tools/auditoria_acessibilidade.js` mede assim, descontando o transform do enquadramento).

**Mínimos (px reais a 780×360):**

| item | mínimo real (780×360) | equivalente no desenho (÷ 0,4225) |
|------|:--:|:--:|
| texto de **corpo** | **≥ 12px** | ≥ ~29px |
| **rótulo**, número pequeno, legenda | **≥ 11px** | ≥ ~26px |
| **título de bloco** | **≥ 15px** | ≥ ~36px |
| **área de toque** | **≥ 40×40px** | ≥ ~95×95px |

- A **área de toque** ≥ 40×40 pode ser maior que o VISUAL do botão: amplie o alvo com `padding` ou um pseudo-elemento
  (`::before` esticado) — o botão tem o tamanho do **conteúdo**, nada de blocos enormes sem motivo.
- **Nada de texto cortado com "…"** em informação importante: **nome, custo, efeito** aparecem inteiros.
- **SEM rolagem dentro de cartões, painéis, janelas e sobreposições.** Se faltar espaço, **compacte** o conteúdo — não
  role. Rolagem é permitida **SÓ em LISTAS**, e só nestas:
  1. a **grade de personagens** — Coleção e montadores (`.col2__grade`, `.dm-grade`, `.cgrid--pick`);
  2. a **grade de Provações** (`#provfix .pv2-grade`, `#provfix .pv2-off`);
  3. a **Loja** (`.loja`/`#loja`, quando existir);
  4. a **lista de Desafios/Composição** (`.df-grade`, `#compfix .cmp-grade`);
  5. o **resumo da CPU** (o fecho do turno do oponente).

  Qualquer outra rolagem (miolo de painel de batalha/campanha, corpo da sobreposição da Coleção, kit do montador, etc.)
  é **violação** — some como achado na auditoria e entra na fila de conserto.

> A medição que vale é a REAL (780×360). Para quem desenha na tela fixa, divida o mínimo real por **0,4225** (ou
> multiplique por ~2,37) para achar o tamanho no desenho de 1846×852.

### Eixo "corte/sobreposição" da auditoria (§358b)

O eixo **(d)** do `tools/auditoria_medida.js` (usado pela auditoria **e** pelo teste `acessibilidade_telas`) pega, além da
reticência (`text-overflow:ellipsis`):

- **texto cortado SEM reticência** — a própria caixa do texto (ou um **ancestral** com `overflow:hidden/clip`) recorta o
  conteúdo (`scrollWidth/Height` > `clientWidth/Height`). A tolerância vertical é ~meia linha (um `line-height < 1` faz o
  ink-box passar do line-box por alguns px sem cortar glifo); a horizontal é estrita (1px);
- **texto sobre texto** — duas folhas de texto visíveis se cruzam > 2px nos **dois** eixos, sem uma conter a outra;
- **texto que estoura o viewport** (780×360);
- **texto ENCOBERTO (§359, eixo d6)** — o ponto central de **cada palavra** do texto não é o próprio elemento (nem um
  ancestral/descendente) em `document.elementFromPoint`: outra caixa está desenhada **por cima** (mesmo sem os TEXTOS se
  cruzarem — pega, p.ex., um título coberto pela borda do quadro vizinho). Scrims com `pointer-events:none` NÃO entram (o
  `elementFromPoint` os ignora, de propósito). Quando há uma **camada modal** aberta (um scrim cobrindo a tela com fundo
  semiopaco — painel de kit, fila do PvP, "Mais filtros", troca da campanha), a medição é feita **só nessa camada**: o que
  está atrás está inerte/encoberto de propósito.

**Exceções (não contam como corte):**

- **`data-clamp="ok"`** — um `line-clamp` **de propósito** em texto **secundário** (resumo que pode ser cortado em N
  linhas sem perder informação essencial). Hoje marcam isso: `.dsx-art__arq` (arquétipo na arte da ficha),
  `.dsx-sin__mot` (motivo da sinergia) e `.dcomo__mtxt` (texto do "como conseguir"). Ao marcar um novo, **registre aqui**.
- **conteúdo de uma LISTA rolável da lista branca** (`SCROLL_OK`: `.col2__grade` etc.) — o que passa da dobra é **rolagem
  esperada**, não corte; os eixos (d3) "sai da caixa do ancestral" e (d5) "estoura viewport" não valem para ele (mas o
  corte do **próprio item** — nome/custo/efeito recortado — e a **sobreposição** continuam valendo).

### Eixo "(e) contraste" da auditoria (§367)

O eixo **(e)** do `tools/auditoria_medida.js` mede o **contraste WCAG de cada texto contra o fundo REAL** que fica atrás
dele (não a cor nominal do CSS — a arte de verdade). Como: tira 1 screenshot COM o texto, esconde o preenchimento do
glifo (mantendo a **sombra do texto**, que é correção legítima), tira outro SEM o texto; nos pixels onde o glifo pintava,
amostra a luminância do fundo e calcula a razão. Usa o **percentil 20% mais desfavorável** (robusto a antialias). Exige
**≥ 4,5:1** para corpo e **≥ 3:1** para título grande (≥18px, ou ≥14px negrito). Pega o caso real que originou o eixo: o
nome da cultura **"CHINESA" vermelho sobre arte vermelha** na seleção de Domínios. Correções aceitas (ordem de preferência):
**sombra de texto** (halo escuro), **plaquinha** (fundo sólido atrás do texto), ou **ajuste de cor**. Detalhes:

- **texto-gradiente** (ouro recortado via `background-clip:text`, inclusive quando o texto vive em `<span>` filhos e o
  recorte está num ancestral) → a cor usada é a **média das paradas do gradiente**; o fundo precisa ficar escuro o bastante
  (a `drop-shadow` do gradiente não é creditada, então reforça-se o **véu** atrás).
- **controle inativo** (`[disabled]`/`aria-disabled`) é **isento** (WCAG 1.4.3 — está apagado de propósito).
- **glifo decorativo puro** (⚿ ◈ ♛ …, sem letra/número) é ÍCONE, não entra.
- **texto SVG** (`<text>` dentro de um cartão vetorial, ex.: o nome do deus na revelação da invocação) **não entra no (e)**:
  é parte de uma ilustração autocontida com o próprio fundo desenhado (a "lavagem" clara atrás do nome); amostrar o glifo de
  um vetor escalado no raster é impreciso. O eixo **(a)** de tamanho continua valendo para ele.
- há a mesma regra de **modal** do (a–d): com uma camada cobrindo a tela (reveal da invocação, scrim), mede-se só dentro dela.

### Eixo "(d7) fora da tela" da auditoria (§366)

Além do corte/sobreposição, o eixo **(d)** pega **conteúdo cuja caixa cai fora do viewport** (ou da área de um ancestral que
o recorta): imagem COM `alt`, elemento tocável, ou texto direto. Um filho **decorativo** que só herdou `cursor:pointer` do
cartão clicável (glow/halo/poça) **não** conta — só o **topo** da região clicável, como no eixo (b).

## A tela fixa — canvas 780×360 (§367: px de design = px real)

Toda tela do jogo é uma **canvas fixa de 780×360** (o celular deitado) escalada por `min(w/780, h/360)`, centrada, com
`#03050B` nas sobras (`fit()` em `src/ui/base.js`). **O px de design É o px real** no viewport de referência — o mínimo
do §357 (≥12px, toque ≥40) vale direto, sem precisar dividir por fator de escala. Nas telas maiores o `fit()` só escala
a canvas inteira para cima (uniforme), sem reflow. Cada tela tem seu id (`#batalha`, `#desafios`, `#dommontar`,
`#domhub`, `#provfix`, `#deusfix`, `#nlfix`, `#compfix`, `#colfix`, `#campfix`, `#domselfix`, `#invfix`, `#homefix`,
`#embrevefix`, `#guiafix`) e o `#stage` vira a moldura. Convenções: margens laterais ~**14px**; cabeçalho no topo
(~40–50px) e conteúdo/grade abaixo; colunas em `position:absolute` com `left/right/top/bottom`. Nessas telas
**"conta"/"build" somem** (classes `body.em<rota>` escondem `#build`/`#conta-botao`; eles vivem na home/menu).

> **Histórico:** até o §366 a batalha e algumas telas usavam uma canvas de **1846×852**. O §367 unificou TUDO em 780×360
> (inclusive a batalha, a Coleção e a **folha do guia**), porque na canvas grande o texto de design encolhia ~0,42× no
> aparelho — o padrão §357 só é honesto quando o px de design é o px real. O `fit()` não usa mais 1846×852.

## Componentes

Cada item: **quando usar** + **seletor/função de referência**. A folha viva (`renderGuia`) os mostra em cada estado.

<!-- COMPONENTES (ids da folha §352 — o teste confere contra renderGuia) -->
- `botao-primario` — a ÚNICA ação principal da tela, em dourado cheio. Ref.: `.cmpb--primary` / `.b--primary` /
  `.dfb--jogar` / `.nlb--go` (todos o mesmo gradiente dourado).
- `botao-secundario` — ação alternativa/repetível, de contorno. Ref.: `.cmpb--quiet` / `.b--sec` / `.dfb--quiet`.
- `pilula` — filtro/aba; selecionada em dourado, normal em contorno. Ref.: `.df-chip` · `.df-chip.is-on`.
- `card-montador` — cartão de deus no montador; estados normal / selecionado (vaga dourada) / apagado (viola a regra) /
  oponente (vermelho). Ref.: `_montCardHTML(k, cfg)` → `.dm-card` (`--sel`/`--sel2`/`--off`/`--trav`).
- `painel` — bloco de conteúdo com rótulo, fundo escuro e borda dourada fina. Ref.: `.dmaes` / `.ddet` / `.pa`.
- `orbe` — símbolo do elemento; halo para ≥14px, `_min` para <14px. Ref.: `orbe(elem, px)` (`src/ui/base.js`).
- `selo-raridade` — SS/S/A num quadrado/pílula. Ref.: `.dsx-rar.rar--SS|S|A` / `RAR_ROT`.
- `selo-nivel` — "Nv N" no canto de uma habilidade; **só nas que têm escada** (não Passiva/Defesa). Ref.: `.dsk__nv`.
- `gratis` — custo zero; "GRÁTIS" verde em vez de orbes. Ref.: `.dmk-ab__gratis` / `.cost__gratis` (`_montCustoHTML`).
- `barra-progresso` — avanço dourado sobre trilho escuro. Ref.: `.cmp-prog__bar` / `.dmaes__rail`.
- `barra-vida` — HP em verde (ok) ou âmbar (baixo), com número centrado. Ref.: `.hp` / `.hp__fill` (`--hp-*`).
- `aviso-toast` — aviso breve (erro/estado), canto, some sozinho. Ref.: `toast()` → `.df-toast`.
- `confirmacao-inline` — pergunta [CONFIRMAR]/[CANCELAR] **dentro do próprio cartão** (sem modal). Ref.: `.nlp__conf`.
- `estado-vazio` — texto curto e discreto quando não há itens. Ref.: `.df-vazio` / `.dm-vazio`.
- `icone-pontos` — pontos de deus: **selo dourado com símbolo de cópia** (distinto da Essência azul/Gema roxa). Ref.:
  `_pontoIcSVG()` / `.nltop__ic` / `nlTopoPtsHTML`.
- `trilha-niveis` — cartão de habilidade dos Níveis: AGORA | PRÓXIMO (só o que muda em dourado) + ação por estado. Ref.:
  `nlPainelHTML(...)` → `.nlp` (`.nlb`, `.nl-hi`, `.nlpin`).
- `moldura-skill` — **acabamento da arte de habilidade** (§355): uma moldura fina de ~1,5px na **cor da energia** da
  habilidade (a mesma da orbe de custo; livre/neutra em cinza-claro), a ~55% de opacidade, com um **filete escuro** de 1px
  (`rgba(0,0,0,.6)`) por dentro (p/ a arte não encostar na moldura), nos cantos arredondados do botão. Desenhada SOBRE a
  arte (`::after`), **não muda o tamanho/posição** do botão. Os estados somam: usável → moldura a 100% + o brilho do
  elemento; marcada → moldura dourada + ✓; inusável → apaga junto. Ref.: `slot('skill-…', …, corEnergia(cost))` →
  `.slot--sk` (`--sk-en`); vale em TODO lugar que mostra arte de habilidade (batalha, miniaturas, kit "i", ficha, Níveis).

## Princípios (as lições das rodadas)

1. **Uma só cor de destaque** — dourado é a ação; nada mais compete.
2. **O estado aparece uma vez** — um selo/moldura por cartão, não repetido em texto + ícone + cor.
3. **Separar por espaço, não por moldura** — gap entre cartões, bordas finas; sem caixas dentro de caixas.
4. **Arte contida** — retrato em `cover`/`contain` com véu; nunca texto solto sobre arte crua (sempre um scrim).
5. **No máximo ~3 tamanhos de texto por tela** — título, corpo, rótulo.
6. **Nada cortado com "…" em nome** — nome de deus/habilidade sempre inteiro (medido no teste).
7. **Nunca quebrar palavra no meio** — nomes do bestiário em nome curto (`metaComb`), `white-space` controlado (§344b).
8. **Dados reais, nunca de demonstração** — custos/níveis/pontos/recompensas saem de `data/` e do servidor.
9. **Prova por medição dos filhos** — Chromium mede os filhos (≤830, sem sobrepor, sem corte), não só o contêiner.
10. **Capturas commitadas e listadas** — cada tela nova deixa `docs/telas/<§>-*` e o relatório lista os nomes exatos.

## O processo de uma tela nova

1. **Inventário de funções** — que dados/estados a tela mostra (funções que já existem; nada inventado).
2. **Referência** — imagem do dono (ChatGPT/Claude Design) OU, sem imagem, este guia + uma tela já aprovada.
3. **Prompt** — descrever o layout, os estados, os mínimos e o "não mudar".
4. **Provas** — jsdom (conteúdo/estados/handlers) + Chromium (encaixe: filhos ≤830, sem sobrepor, sem corte).
5. **Capturas** — 1846×852 e 780×360, com os estados principais; commitadas em `docs/telas/`.
6. **Conferência** — comparar com a referência, listar diferenças, suíte + build verdes, DECISOES/ESTADO atualizados.

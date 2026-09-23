# §301 — SELOS DE RARIDADE: medição dos lugares, do tamanho e da legibilidade

> **§303 SUPEROU o destino.** Esta medição continua válida e foi o que decidiu: como nenhum selo in-page passa de
> 40px, a arte foi para a REVELAÇÃO da invocação, NÃO para os selos pequenos (a <40px vira confete e a letra lê
> melhor). A composição nos selos pequenos foi removida. Ver DECISOES/ESTADO §303 e `docs/capturas-303/`.

Companheiro de `docs/selos-raridade.csv` (gerado por `tools/med_selos.js`, que roda o dist real num Chromium
headless e lê a caixa de cada selo). É a medição que decide **onde o ornamento do dono cabe** e **onde a letra
precisa de tratamento** — commitada para ninguém refazer. Reproduzir: `NODE_PATH=./node_modules node tools/med_selos.js`.

## O plano do dono (não é troca, é composição)

> "A arte vira MOLDURA, a letra fica POR CIMA." O ornamento entra como **fundo** do selo; a letra continua
> desenhada **em texto** por cima. Assim a letra lê em qualquer tamanho e o ornamento aparece inteiro só no grande.

## a) Todos os lugares que mostram o selo (busca no código + medição)

Sete lugares desenham SS/S/A, mais o reveal da invocação. Caixa em px de DESIGN (o palco é 780×428 fixo) e em px
FÍSICOS (design × `ultimaEscala`), nos dois viewports que ancoram a régua: 780 (piso, escala 1,0) e 951 (folga, ~1,22).

| lugar | onde | design (L×A) | físico @780 | físico @951 | menor lado | ornamento? |
|---|---|---|---|---|---|---|
| grade | `.col2c__rar` (100 cartões) | 20×22 | 20×22 | 24,4×26,8 | 20–24 | **sim** |
| resumo | `.col2r__rlabel` | 28×19 | 28×19 | 34,1×23,2 | 19–23 | **sim** |
| painel | `.col2p__rar` | 27,4×22 | 27,4×22 | 33,4×26,8 | 22–27 | **sim** |
| sobreposição | `.col2ov__rarart` | 34,7×27 | 34,7×27 | 42,3×32,9 | 27–33 | **sim** |
| rota-deus | `.dtop__rar` | **9,6**×21 | 9,6×21 | 11,7×25,6 | **9,6** | **não** |
| Missões | `.mtile__rar` | **3**×82 (barra) | 3×82 | 3,7×100 | **3** | **não** |
| seleção (kbox) | `.kbox__rar` | 20,4×16 | 20,4×16 | 24,9×19,5 | 16–20 | sim* |
| reveal | `.iv-raridade` (SVG) | 13,8×**29,1** | 13,8×29,1 | 16,8×35,3 | — | **já é SVG** |

\* o kbox tem caixa suficiente, mas **hoje não carrega classe de raridade** no HTML (`.kbox__rar` sem `--SS/--S/--A`),
então o terreno §301 ainda não pinta ornamento nele — precisa de uma classe de raridade antes. Anotado, fora do escopo.

## b) Onde o ornamento NÃO cabe (confirmado + o alcance real)

- **Missões:** é uma **barra de 3px** de largura (`flex:0 0 3px`), **sem letra**. Nenhum ornamento lê em 3px. Fora.
- **Rota-deus:** a letra tem **9,6px de largura**, **sem moldura** (texto solto no cabeçalho). Pôr um quadro aqui
  exigiria criar uma caixa e empurrar o layout do cabeçalho. Fora — fica a letra colorida de hoje.

E o achado maior, que corrige a régua: **nenhum selo pequeno alcança 40px no menor lado, em nenhuma escala medida.**
O maior deles (sobreposição) chega a 42,3px **de largura** na folga, mas 32,9 de altura; todos os outros ficam entre
16 e 34. Pela régua do próprio dono ("<20 borra, 40 lê, 64 ótimo"), **em todo selo pequeno o ornamento será um borrão
dourado — nunca um quadro nítido.** Isso não mata o plano; **confirma-o**: a letra é quem carrega a leitura, o
ornamento é textura. Só o reveal mostra o ornamento inteiro — e ele já é SVG.

## c) O reveal da invocação, medido de verdade

O dono estimou o selo em **27,5% da largura do card**. Medido: a letra do reveal tem **29,1px de altura (design)**,
**35,3px físicos na folga**, e a razão é **28,9% (piso) / 28,7% (folga)** da largura do card — **confirma os ~27,5%**.
Mas o número que decorre corrige a premissa "o reveal é o único ≥40": **ele também fica abaixo de 40** (35,3 na folga;
~36 no teto de escala 1,25). É o maior selo do jogo e ainda assim **arranha, nunca cruza, o "40 lê"**. O ornamento
ornado do reveal já existe em SVG (chapa + losango + letra, `src/invocacao.js`) — é a **referência**, não recebe o webp.

## A legibilidade da letra sobre o ornamento (o número, e o tratamento)

Contraste WCAG da letra sobre um ornamento **dourado** (realce / meio-tom / sombra representativos — a arte real
chega depois, mas a CLASSE do defeito já é certa):

| letra | vs realce | vs meio | vs sombra | veredicto |
|---|---|---|---|---|
| **hoje** SS dourada | 1,17 | 1,62 | 5,60 | **some** no dourado (só lê na sombra) |
| **hoje** S roxa | 2,37 | 1,25 | 2,77 | abaixo de 4,5 (AA) em tudo |
| **hoje** A azul | 1,85 | **1,03** | 3,55 | **pior caso 1,03:1 — invisível** |
| hoje escura (grade) | 12,75 | 6,71 | 1,94 | ótima no claro, **falha na sombra** |
| **§301** clara #f6edda | 1,19 | 2,25 | **7,77** | corpo lê no escuro |
| **§301** contorno #0a0812 | **14,41** | 7,58 | 2,20 | borda lê no claro |

**Diagnóstico:** a letra colorida de hoje sobre o ornamento dourado cai a **1,03–2,4:1** (o "gold-on-gold" some).
Uma letra só-escura resolve o claro mas morre na sombra (1,94). **Tratamento escolhido (o LEVE que o dono nomeou):
letra clara + contorno escuro** — o par cobre os dois regimes: no ornamento claro o **contorno** carrega (14,41), no
ornamento escuro o **corpo claro** carrega (7,77); em todo pixel do ornamento, um dos dois componentes passa de 4,5:1.

**Aplicação:** o tratamento vive **só no caminho de composição** (`.selo-arte`, aceso quando os 3 webp existem). O
**selo de hoje não muda** — sem ornamento, sem contorno, letra colorida como sempre. A alternativa que o dono também
nomeou (**placa escura por trás da letra**) é uma troca de uma linha; é só pedir.

## O terreno (padrão §289/§298)

- **Manifesto:** `tools/build.js` emite `SELOS_ARTE=1` só se os **três** `web/selos/seal-{ss,s,a}.webp` existem;
  ausente qualquer um → `0` → o boot não acende `.selo-arte` → **selo de hoje, sem 404**.
- **Externo, nunca base64:** o CSS aponta `url(selos/seal-*.webp)`; o navegador baixa **3 arquivos** e reusa nos 100
  cartões. O `incursion.html` **não cresce** (só ~1KB de CSS/JS, 0 de imagem). Peso previsto dos 3 webp: ~30–75KB no total.
- **Formato da arte (brief do dono):** brasão **512×512**, silhueta forte para 30px, **miolo liso e uniforme no centro**
  (a letra entra ali), borda mais clara que o miolo, **preto chapado ao redor recortado para transparência**. O CSS usa
  **`background-size:contain`** (não `cover`): as caixas do selo **não são quadradas** (20×22 a 35×27), então `contain`
  mostra o brasão **inteiro e centrado**, o miolo cai no centro da caixa (onde a letra é desenhada) e o recorte de fora do
  brasão fica transparente sobre o cartão. Como o **miolo é mais escuro que a borda**, a letra clara ganha contraste natural
  no centro — o contorno cobre o resto. Alternativa, se quiser o brasão colado à borda da caixa: caixas quadradas + `cover`.
- **Guarda:** `tests/selos.test.js` percorre o espaço de estados (§295): com/sem ornamento, letra sempre TEXTO (nunca
  trocada por `<img>`), classe-raiz só com `SELOS_ARTE=1`, nenhuma regra de selo em `data:`, os frameless fora.

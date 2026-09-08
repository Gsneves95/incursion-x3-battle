# Especificação visual — Tela de Campanha (§253)

Valores extraídos de um mockup do Claude Design **aprovado pelo dono** e portados para
a tela funcional do §252 (troca de pele, não de motor). O mockup dependia de runtime que
o jogo não tem (`support.js`, `image-slot.js`, `<x-dc>`, `<sc-for>`, `<sc-if>`, `{{ }}`,
`data-dc-script`, um `fit()` próprio) — nada disso foi trazido; só os **valores**.

## Escala
Mockup **1170×540** → palco **951×428**. Fator **428/540 = 0,7926**. Todos os números
abaixo já estão convertidos e arredondados. `1170×0,7926 = 927`; o palco tem 951 → sobram
**24px** de largura, distribuídos na arte e no painel (ambos ancorados), sem barra preta.
Como a largura do palco flui (780–1200), os valores de **altura/Y são fixos** (o palco tem
sempre 428) e os de **X/largura são ancorados/percentuais** que batem o mockup em 951 e
sobrevivem nos outros aparelhos.

## Fundo do palco
`radial-gradient(76% 96% at 80% 42%,#0D1836 0%,#080E22 48%,#04070F 100%)` sobre `#060B1A`.

## Coluna de arte — left 0, top 0, 450×355 (encosta na trilha), overflow hidden
Dois véus por cima, nesta ordem:
- `linear-gradient(180deg,rgba(4,6,15,.6) 0%,rgba(4,6,15,0) 20%,rgba(4,6,15,0) 34%,rgba(4,6,15,.78) 72%,rgba(4,6,15,.98) 100%)`
- `linear-gradient(90deg,rgba(4,6,15,0) 70%,rgba(6,11,26,.9) 100%)`

Texto sobre a arte — left 38, bottom 92, largura 317, coluna gap 10:
- "TRECHO I": Cinzel 600, 8.7px, letter-spacing .34em, text-indent .34em, cor #B9A574
- nome do ato: Cinzel 900, 30px, line-height 1.1, `linear-gradient(178deg,#FFF9E6 0%,#F2DFA2 32%,#D4AF37 66%,#A97C22 100%)` via background-clip:text, `filter:drop-shadow(0 3px 14px rgba(0,0,0,.9))`
- filete: 41×1, `linear-gradient(90deg,rgba(212,175,55,.9),rgba(212,175,55,.1))`
- texto da história: 12px, peso 400, line-height 1.55, cor #B9C7DE

## Cabeçalho — altura 51
- Véu à esquerda (475×51): `linear-gradient(180deg,rgba(4,7,17,.94) 0%,rgba(4,7,17,.5) 74%,rgba(4,7,17,0) 100%)`
- Botão INÍCIO: left 22, top 14, altura 24, padding 0 12 0 10, radius 3, fundo rgba(255,255,255,.05), `box-shadow:inset 0 0 0 1px rgba(212,175,55,.42)`; chevron 5×5 border-left/bottom 1.5px #E8C765 rotate(45deg); rótulo Cinzel 600, 9.5px, letter-spacing .22em, #E4D3A6
- Filete vertical: left 122, top 16, 1×21, `linear-gradient(180deg,rgba(212,175,55,0),rgba(212,175,55,.6),rgba(212,175,55,0))`
- Título "Campanha": left 143, top 10, Cinzel 900, 26px, line-height 1.24, letter-spacing .06em, `linear-gradient(178deg,#FFF9E6 0%,#F2DFA2 30%,#D4AF37 60%,#9A6F1E 86%,#F7E9B4 100%)`, `filter:drop-shadow(0 2px 0 rgba(60,38,4,.7)) drop-shadow(0 6px 22px rgba(0,0,0,.9))`
- Painel do capítulo: right 0, top 0, 475×51, `linear-gradient(180deg,#0C1732 0%,#0A1228 100%)`, `clip-path:polygon(41px 0,100% 0,100% 100%,0 100%)`, `box-shadow:inset 0 -1px 0 rgba(212,175,55,.42)`. Conteúdo em right 19, alinhado à direita, gap 21:
  - "CAPÍTULO I": Cinzel 600, 8px, letter-spacing .34em, #7E8FA8
  - nome do capítulo: Cinzel 700, 17px, letter-spacing .04em, #F0DC9A
  - epígrafe: 8.7px, itálico, #78899F
  - progresso: Cinzel 700, 19px, #FFF3C4 + "/ 07" Cinzel 400, 12px, #6D7C96 (o Prólogo tem 7 atos)

## Painel de briefing — left 472, top 63, 436×284, radius 4, padding 17
`linear-gradient(180deg,rgba(12,21,45,.9) 0%,rgba(7,12,28,.94) 100%)`, `box-shadow:inset 0 0 0 1px rgba(212,175,55,.34),0 17px 43px rgba(0,0,0,.55)`. Coluna gap 13.
- **Elencos** (2 colunas, gap 19):
  - "VOCÊ JOGARÁ COM": Cinzel 600, 8px, letter-spacing .24em, #B9A574; 3 retratos, nome na base Cinzel 600, 7px, letter-spacing .12em, #EFE3C6
  - "ENFRENTARÁ": Cinzel 600, 8px, letter-spacing .24em, #9C8DBE + rótulo de formação "N VS 3" ao lado, 7px, letter-spacing .16em, #6B6288 (comunica 3×1/3×2 do Prólogo; números reais)
  - cartões de inimigo: flex 1, altura 73, radius 3, fundo #120C28, `box-shadow:inset 0 0 0 1px rgba(150,110,220,.5)`; faixa do nome na base, altura 17, `linear-gradient(0deg,rgba(8,5,20,.96),rgba(8,5,20,.25))`, nome Cinzel 600, 8px, #E4DBF4, ellipsis. 1 a 3 inimigos conforme o dado.
- **Divisor** 1px: `linear-gradient(90deg,rgba(212,175,55,0),rgba(212,175,55,.26) 24%,rgba(212,175,55,.26) 76%,rgba(212,175,55,0))`
- **Mecânica** (linha gap 11): ícone 32×32 radius 4 fundo #151C46 `box-shadow:inset 0 0 0 1px rgba(150,190,255,.42)`; título Cinzel 700, 11px, #F2E6C4; selo "NOVA MECÂNICA" Cinzel 600, 7px, letter-spacing .2em, #6F9FC0; descrição 9.5px, line-height 1.3, #8FA0BC. De `ensina.titulo`/`ensina.dica`. **O bloco some quando o ato não ensina.** Pips de energia eram decorativos — não desenhar.
- **Recompensas**: rótulo Cinzel 600, 8px, letter-spacing .24em, #B9A574. Ladrilho: altura 36, radius 3, fundo rgba(255,255,255,.045), padding 0 8, gap 6; valor 11px peso 600 #F2F4F8; unidade 6.3px peso 500 letter-spacing .16em #7E8FA8. **Só gemas e essência** (economia.json). Com 1–2 ladrilhos, largura limitada (sem flex:1 esticado).
- **CTA** (margin-top auto, altura 33): `linear-gradient(180deg,#5C4213 0%,#33240A 100%)`, `clip-path:polygon(13px 0,calc(100% - 13px) 0,100% 50%,calc(100% - 13px) 100%,13px 100%,0 50%)`, `box-shadow:0 0 30px rgba(212,175,55,.2)`, pseudo por cima com o mesmo clip e `box-shadow:inset 0 0 0 1px rgba(240,220,154,.85)`; seta sólida (border-left 10px #FFF3C4, top/bottom 6px transparente); rótulo Cinzel 700, 13px, letter-spacing .14em, #FFF6DC. "CONTINUAR HISTÓRIA" na batalha, "CONTINUAR" na história.

## Trilha do rodapé — altura 73, left/right 0, bottom 0
`linear-gradient(180deg,rgba(8,13,30,.85) 0%,#070B1C 44%,#050813 100%)`, `box-shadow:inset 0 1px 0 rgba(212,175,55,.28)`. Conteúdo em left/right 38.
- Linha-guia: top 27, altura 1, trilho `rgba(150,170,200,.16)`; progresso `linear-gradient(90deg,#E8C765,rgba(212,175,55,.35))`, largura = `(atual-1)/(total-1) × 82%`.
- Nó por ato: largura 104, coluna centrada, gap 6, padding-top 13.
  - ATUAL: losango 25×25 rotate(45deg) `linear-gradient(160deg,#2E6FB0,#0F2E58)`, `box-shadow:0 0 0 1.5px #E8C765,0 0 18px rgba(212,175,55,.45)`; halo inset -6px `radial-gradient(50% 50% at 50% 50%,rgba(120,200,255,.34) 0%,rgba(120,200,255,0) 70%)`; número Cinzel 700, 12px, #FFF9E6; rótulo 2 linhas Cinzel 600, 8px, letter-spacing .12em, #F0DC9A, centrado
  - TRAVADO: losango 22×22, fundo rgba(14,22,46,.85), `box-shadow:inset 0 0 0 1px rgba(150,170,200,.3)`; número Cinzel 600, 10px, #8494AC; rótulo Cinzel 500, 8px, #6E7E96
  - VENCIDO: a marca do §252, no dourado do atual.
- Rótulo de 2 linhas vem do nome do ato. 7 nós × 104 = 728, cabe nos 927.

## Fontes
Cinzel igual ao jogo. **Jost → mapeado para Rajdhani** (a fonte de corpo do jogo); nenhuma fonte nova (o app aponta para o servidor; não vale pagar download).

## O que NÃO pode se perder (§252)
slot travado (cadeado, sem troca); slot emprestado (⇄, abre o seletor dos deuses que o
jogador tem; jogável com o emprestado se ele não tem nenhum, §210); mecânica que some sem
`ensina`; placeholder §213 para arte ausente (nunca `<img>` 404); trilha como navegação
com vencido/atual/travado distintos; troca de capítulo; ato de história sem painéis de
luta nem recompensa (CTA "CONTINUAR", sem moldura vazia); marca de recompensa coletada; as
5 guardas de `tests/campanha.test.js`.

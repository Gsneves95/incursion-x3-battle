# INCURSION x3 Battle

Combate tático por turnos 3v3 para celular (paisagem), com 100 deuses de 10
mitologias do mundo. Mecânicas inspiradas no **Naruto-Arena**: 120 de vida para
todos, energia elemental por turno, habilidades com recarga, zero progressão no
PvP.

> **Se você é uma IA lendo este repositório: comece por `CLAUDE.md`.**
> Ele tem os invariantes que não podem ser quebrados e uma lista de "não faça".
> `DECISOES.md` explica o porquê de cada um.

---

## Começar

```bash
npm install          # só jsdom, e só para os testes
npm run build        # gera dist/incursion.html
npm test             # 6 suítes (motor, capacidades, primitivas, auditoria, interface, invocação)
```

Abra `dist/incursion.html` no navegador. **Nenhum servidor é necessário** — é um
arquivo único com tudo embutido, inclusive os 100 retratos.

No celular, use na horizontal (há um aviso se estiver em retrato).

### Como jogar o protótipo

É hot-seat: os dois jogadores usam a mesma tela, e a informação é completa por
regra, então nada fica oculto.

1. Monte os dois times na grade de coleção. Só os **9 iniciais** estão liberados;
   o botão **Teste** libera os kits já implementados para experimentar.
2. Na batalha, cada unidade faz uma ação por turno: Básico, Habilidade, Milagre
   ou Defesa. **O primeiro toque só arma** — o gasto acontece ao tocar no alvo ou
   em Confirmar.
3. O botão **Como jogar** (menu `⋯`) explica as regras que não são adivinháveis.

---

## Mapa do repositório

```
CLAUDE.md          briefing e invariantes  <- LEIA PRIMEIRO
DECISOES.md        registro de decisões com o raciocínio
ROTEIRO.md         fases até o jogo completo, com dependências

src/engine.js      motor de regras: (estado, ação) -> estado. Puro, sem DOM.
src/view.js        camada de visão: desenha e captura toque. Não altera regras.
src/shell.html     casca + CSS. Canvas fixo 926x428 escalado por transform.
src/roster_data.js ROSTER (100 deuses) + IMG (retratos base64). GERADO.

data/kits.json       os 100 deuses com as 400 habilidades (fonte do design)
data/provacoes.json  as 91 Provações de desbloqueio
data/iniciais.json   os 9 iniciais, com o critério de escolha de cada um
data/bestiario.json  12 criaturas de PvE

tests/motor.test.js        as 7 regras de resolução, isoladas
tests/capacidades.test.js  seleção de 2 alvos, classe por habilidade, vínculo
tests/primitivas.test.js   as 12 primitivas de efeito, cada uma isolada
tests/auditoria.test.js    o motor conferido contra as regras da planilha
tests/interface.test.js    a interface clicada de verdade, via jsdom

tools/build.js         concatena tudo em dist/incursion.html
tools/gerar_thumbs.py  regenera src/roster_data.js a partir das ilustrações

docs/*.xlsx    planilha de design completa, 15 abas
docs/design-original-tela-batalha.html   referência visual do dono do projeto
```

## Arte

Os 100 retratos de deus estão embutidos como WebP de 168px. Para regenerar a
partir das ilustrações originais:

```bash
pip install Pillow
python3 tools/gerar_thumbs.py /caminho/para/imagens
```

**Faltam os 400 ícones de habilidade.** Todo lugar que recebe arte é um
`<div class="slot" data-slot="CHAVE">`. As chaves:

| Chave | O que é | Formato |
|---|---|---|
| `god-<key>` | retrato do deus | quadrado, enquadra no alto |
| `skill-<key>-<slot>` | ícone de habilidade | **redondo** |
| `effect-<tipo>` | ícone de estado | quadrado arredondado |
| `player-<n>-avatar` | avatar do jogador | quadrado |

`<slot>` é `basico`, `habilidade`, `milagre` ou `defesa`. Exemplo:
`skill-zeus-milagre`. Trocar o `<div>` por `<img class="slot">` quando a arte
existir.

## Estado

| | |
|---|---|
| Motor | **11 dos 100** deuses implementados; **as 12 primitivas de efeito prontas** |
| Cliente | seleção/coleção, batalha e invocação (gacha) |
| Servidor | não existe, e é de propósito (ver `ROTEIRO.md` fase 4) |
| Testes | 6 suítes verdes |

Próximo passo em `ROTEIRO.md` (item 7): a **arena de auto-jogo** — o motor contra
si mesmo por seed, para balancear os 100 deuses antes de escrever os 89 kits
restantes. **Implemente a primitiva antes do deus** — é o risco nº 1 do projeto.

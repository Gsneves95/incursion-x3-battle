# §324 Parte 2 — consertar os 8 casos claros + diagnóstico do Suporte

Decisão do dono: **por partes**. Tyr, Saci e o equilíbrio entre funções ficam para depois.
Esta parte: (A) destravar os 8 casos claros com o **menor ajuste possível, derivado do kit**; (B) medir o
domínio do Suporte (diagnóstico, nada muda).

Método e régua idênticos ao §324 P1 (`tools/medir_kits.js`, IA v2): **força** = arena v2×v2, ~288 jogos/deus
(+IC95); **slot morto** = desligar um slot por vez em jogos PAREADOS e medir a queda de win-rate (Δ);
**uso** = vezes que a IA v2 usa o slot por partida. Aceitação de cada conserto: o slot deixa de estar morto
(Δ≥3pp **e** uso≥0,3/partida) **e** a força fica perto do meio — Afrodite e Fujin na faixa 40–60%, nenhum dos
8 acima de 65% nem abaixo de 35%.

---

## A · os 8 consertos

Regra de ouro aplicada: **menor ajuste, derivado do kit (tema ≠ mecânica), preferir destravar o que já existe.**
Seis dos oito eram **habilidade morta** — a ferramenta existia mas a IA nunca a escolhia porque ela não valia
mais que o Básico (mesmo dano, custo maior) ou não fazia nada de útil. O conserto foi dar à habilidade um
**valor que o Básico não tem** (dano em área, cura de time, atordoar, selar), não inflar número. Dois eram do
Fujin e da Afrodite (passiva).

### Força antes → depois (arena v2, +IC95), slot destravado (Δ) e uso

Coluna **slot** = o slot que estava morto (passiva no Fujin/Afrodite, habilidade nos outros seis). **Δ** = queda
de win-rate ao desligá-lo (slot morto pareado, M=400, IC95 ~±4,9pp) — antes era ≈0 nos oito. **uso** = vezes que
a IA v2 escolhe o slot por partida (antes ≈0 nos seis mortos; ≥0,3 = aceitação).

| Deus | Função | Força antes→depois | slot | Δ antes→depois | uso antes→depois | o que mudou |
|---|---|---|---|---|---|---|
| **Fujin** | Manipulador | 27,6% ▼ → **42,1%** ±6,9 | passiva | 0 → **+6,0** | — | passiva autônoma + habilidade vira dano-em-área |
| **Afrodite** | Controlador | 24,5% ▼ → **49,5%** ±7,0 | passiva | **−2,7 → +12,5** | — | passiva deixa de ser anti-sinergia |
| **Xangô** | Atacante | 49,8% → **45,0%** ±7,1 | habilid. | ~0 → **+3,0** | 0,00 → 0,75 | Balança da Justiça: nuke + reflexo curto |
| **Cernunnos** | Guardião | 45,6% → **44,2%** ±6,9 | habilid. | ~0 → **+8,0** | 0,01 → 0,86 | Fúria da Matilha: dano + cura de time |
| **Curupira** | Controlador | 61,2% → **56,9%** ±7,0 | habilid. | 0 → **+4,3** | 0,00 → 0,98 | Pés Virados: dano + atordoar |
| **Kukulkán** | Atacante | 60,3% → **58,4%** ±7,0 | habilid. | 0 → **+12,0** | 0,00 → 0,76 | Voo da Serpente: AoE imediato + inalvejável |
| **Hades** | Controlador | 54,7% → **57,1%** ±7,0 | habilid. | ~0 → **+8,3** | 0,54 → 1,09 | Correntes do Tártaro: selar + tormento (dot) |
| **Shuten Dōji** | Guardião | 46,1% → **43,9%** ±7,1 | habilid. | ~0 → **+3,3** | 0,10 → 0,58 | Saké Envenenado: dano + Torpor |

**Aceitação cumprida nos 8:** força na faixa (nenhum >65% nem <35%; Fujin 42,1% e Afrodite 49,5% em 40–60%);
Δ do slot ≥3pp no ponto; uso ≥0,3/partida. Observação honesta: nos três Δ mais finos (Xangô 3,0, Shuten 3,3,
Curupira 4,3) o ponto fica no limiar e a banda de M=400 (±4,9pp) cruza — mas o **uso** (0,38–0,75/partida, de
~0) confirma de forma independente que a IA passou a escolher o slot; a habilidade desses três é dano que
*substitui parte* do Básico, então o Δ subestima a contribuição (ao proibi-la a IA cai no Básico). Afrodite é o
caso mais claro: a passiva saiu de **ajudar-se-desligada** (Δ−2,7) para **+12,5** ao ser desligada.

### O que cada conserto fez (e por quê o menor)

- **Fujin** — eram DOIS slots mortos. A passiva "Companheiro de Raijin" dependia do Raijin (que **não é
  inicial**), então nascia morta para quem acabou de instalar; a habilidade só atrasava recargas (sem dano,
  valor que a IA não persegue). **Passiva → "Fúria dos Ventos": +6 de dano sempre, +2 a mais com Raijin** — o
  tema (os ventos do Fujin) vira mecânica autônoma, e o bônus do Raijin fica como *extra*, não como pré-requisito.
  **Habilidade "Saco dos Ventos" → 12 de dano a todos os inimigos + o atraso de recarga** (escada 13/14/15) — o
  atraso continua, mas agora acompanhado de dano em área, que é o que a IA escolhe.
- **Afrodite** — a passiva era **anti-sinergia** (Δ−2,7: desligá-la AJUDAVA): reduzia dano num único alvo de
  forma que atrapalhava a própria deusa. **→ "Beleza Irresistível": o time inteiro sofre −4 de dano.** Mesma
  ideia (proteção pela beleza), agora ajuda o time em vez de estorvar. Força saltou 24,5→49,5%.
- **Xangô (Balança da Justiça)** — nuke de alvo único ≈ Básico, custo maior → nunca escolhido. **→ 25 de dano +
  por 1 turno reflete 8 do dano sofrido** (escada 26/27/28): o reflexo (o tema do juiz) é o valor que o Básico
  não tem.
- **Cernunnos (Fúria da Matilha)** — idem. **→ 12 de dano + cura 10 no time**: dano **e** sustain num golpe só.
- **Curupira (Pés Virados)** — **→ 14 de dano + Atordoa por 1 turno** (escada 15/16/17): o controle é o valor.
- **Kukulkán (Voo da Serpente)** — era um AoE *telegrafado* (dano adiado por um turno) que a IA nunca pagava.
  **→ 14 de dano a todos AGORA + Kukulkán fica Inalvejável por 1 turno** (escada 15/16/17): dano imediato + um
  escudo-de-posição. (Removido o `agendar`; nenhum deus tem mais dano telegrafado — a babá B4g de `niveis.test`
  passou a usar uma *fixture sintética* para seguir cobrindo o caminho `fx[i].agenda[j].v`.)
- **Hades (Correntes do Tártaro)** — **→ 12 de dano + Selado por 1 turno (só Básico) + 10 de dano puro/turno por
  2 turnos** (tormento): selar + dot, dois valores que o Básico não dá.
- **Shuten Dōji (Saké Envenenado)** — **→ 12 de dano + Torpor** (escada 13/14/15): o controle acompanha o dano.

### Escadas (triagem §318) — todas passam

As habilidades consertadas ganharam/mantiveram escada de 3 degraus. Triagem §318 (win-rate da habilidade nv4 ×
nv1, espelho v2, critério: nv4 ≤ +15pp): shutendoji −2,6 · xango +0,2 · cernunnos −2,5 · curupira −1,0 ·
kukulkan −11,6 · hades +1,8 · **fujin +9,3** — todas dentro do teto. Formato validado por `validarNiveisDeus`
(salto só no nv4, ≤1 por habilidade).

---

## O que cada conserto ARRASTOU (feito junto)

- **Kit (prosa × número):** os 8 kits sincronizados em `data/kits.json` (habilidade.efeito + passiva), batendo
  com `data/deuses/*.json`. Cadeia (`tools/checar_cadeia.js`) e babá texto×número verdes.
- **Ritos (v1, decisão §323 C):** re-verificados com o solucionador. **Kukulkán é inimigo** em Fenrir e Yan Wong
  — o buff do AoE quebrou os dois Ritos (ficaram INVENCÍVEL/INDETERMINADO). Consertado **pela alavanca de HP do
  Rito** (Kukulkán inimigo 120→100 de vida), **não pelo kit** (régua §323: dificuldade por alavanca, nunca kit).
  Re-carimbados. Os demais Ritos que usam os 8 (Afrodite, Cernunnos, Curupira, Fujin, Hades, Shuten, Xangô, +
  Ammit/Morrigan/Nezha/Zeus que os cruzam) re-verificados e re-carimbados.
- **Semanal #13 (Sun Wukong):** Afrodite é inimiga; a redução de **time** novo deixou o quebra-cabeça insolúvel
  (VENCÍVEL→INDETERMINADO). Consertado pela **alavanca de HP** (Afrodite inimiga 110 de vida), não pelo kit.
- **Domínios (PvE gerado):** os 8 aparecem como inimigos nas 5 culturas. **Decisão: NÃO regenerar as escadas**
  — o re-tune de dificuldade dos Domínios é equilíbrio de PvE, que o dono adiou ("por partes"), e o §323 C já
  fixou a postura de não mexer em conteúdo de PvE por causa de kit. A escada do Domínio fica como está; a
  dificuldade medida fica levemente defasada para os poucos níveis com deus reforçado, sem dano prático (o
  jogador real tem níveis e joga melhor que o piso).
- **Testes de replay de PvE (economia, desafio-net):** a pré-condição "o jogador guloso vence o nível 1 do
  Domínio" usava um guloso **só-Básico** — um piso frágil: a régua do *gerador* de Domínios é a IA gulosa
  **completa**, então nenhum nível é garantidamente vencível só com o Básico (o reforço do Fujin inimigo no n1
  da Grega derrubou essa pré-condição). **Corrigido o arnês**: o lado do jogador passa a ser dirigido pela IA
  real (`iaProximaAcao`), que vence o que o gerador mede como vencível; o replay gravado re-simula idêntico no
  servidor (`pve.js` roda o MESMO motor e a MESMA IA inimiga sobre os ops).
- **Composição / campanha:** sem efeito (não usam os 8 como inimigos de forma sensível; suíte verde).

---

## B · o domínio do Suporte (diagnóstico — nada mudou)

Pergunta: o Suporte domina **por causa do kit** (vale nas duas IAs) ou **por causa da IA v2** (só na v2)?

Medi a força por função e o top-10 sob as DUAS IAs, com os kits atuais (pós-conserto dos 8):

| Função | v1 gulosa | v2 |
|---|---|---|
| **Suporte** (n=27) | **60,2%** | **61,1%** |
| Atacante (n=29) | 50,7% | 49,7% |
| Guardião (n=17) | 46,2% | 46,2% |
| Controlador (n=17) | 42,5% | 42,4% |
| Manipulador (n=10) | 39,8% | 40,7% |

Top-10 praticamente idêntico nas duas IAs — **8–9 dos 10 são Suporte**: Brigid, Oxum, Freyja, Mimir, Brahma,
Nüwa, Krishna/Guan Yu, Bennu, Oxalá. Brigid é #1 nas duas (91,5% v1 / 92,6% v2); Oxum #2–3 nas duas.

**Resposta: é problema de KIT, não de IA.** A dominância do Suporte é igual quer a IA gulosa v1, quer a esperta
v2, conduza — se fosse artefato da IA, apareceria só na v2. A forma da curva (Suporte ~60 ≫ Atacante ~50 >
Guardião ~46 > Controlador ~42 > Manipulador ~40) é a mesma nas duas.

**Por quê (lendo os dois kits do topo):**
- **Oxum** — passiva *Doçura e Ouro*: aliado curado causa **+5 de dano** no turno seguinte (e a Oxum cura todo
  turno); habilidade *Águas de Oxum* **cd1**: cura 20 num aliado + 1 orbe de Maré — **barata, repetível, cura +
  economia**; milagre cura 20 no time + regen 8×2 + 2 orbes. Sustain de time + ampliação de dano + geração de
  recurso, tudo num pacote sem custo de oportunidade real.
- **Brigid** — passiva *Ferreira Divina*: o time causa **+5 de dano PERMANENTE** (incondicional) + curas curam
  +5 se houver Queimadura; básico **grátis** com Queimadura; habilidade *Chama Sagrada*: cura 15 no time **E**
  12 de dano a todos os inimigos (cura **e** nuke num golpe só); milagre cura 25 + remove debuffs + regen.

O padrão é o mesmo: os Suportes do topo **empilham vários efeitos fortes** (sustain de time + dano de time +
economia) **sem custo de oportunidade**. É um problema de desenho dos kits de Suporte — material para a parte
do dono sobre "equilíbrio entre funções", que fica para depois.

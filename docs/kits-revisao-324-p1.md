# §324 Parte 1 — revisão de kits sob a IA v2 (medir + propor; NADA mudou no kit)

Relatório de medição. Ferramenta: `tools/medir_kits.js` (`forca` e `slot`). Determinístico (mulberry32). Tabela
de força completa em `docs/kits-forca-v2.txt`.

## 1. A régua (como foi medido)

- **FORÇA**: arena v2 × v2 — os 100 deuses embaralhados em trios, pares adjacentes, **ambos os lados jogados pela
  IA v2**; cada deus joga ~288 partidas com companheiros/adversários variados → win-rate (o deus contra a média do
  campo). IC = ±1,96·√(p(1−p)/n), ~±5pts por deus.
- **SLOT MORTO**: para cada deus, desligo UM slot por vez em jogos **pareados** (mesma batalha, mesmas sementes:
  G + 2 aliados sorteados vs 3 sorteados). Ativo (básico/habilidade/milagre) = **a IA v2 é proibida de escolher
  aquele slot** do deus (ele joga como se não o tivesse). Passiva = **gatilhos zerados** (fx=[]). `Δ` = queda de
  win-rate ao desligar (pontos). **Δ ≈ 0 (dentro do ruído) = slot morto.** Triagem M=200 nos 100; confirmação
  **N=3000** nos candidatos (IC do Δ ~±1,8pts). Também reporto o **USO** de cada slot (vezes/partida sob a v2).
- Caveat honesto: "morto" é **sob a IA v2** — é o teste da babá aplicado ao kit (a mesma régua que o §322 usou).
  Um humano talvez use o slot; mas se a melhor IA do jogo nunca o usa e desligá-lo não muda nada, o slot não está
  pagando o espaço que ocupa.

## 2. FORÇA — o ranking (resumo; completo em `docs/kits-forca-v2.txt`)

Média 50,0% · desvio 13,6pts · ~288 jogos/deus.

**Topo (▲ fora da curva, > +1,5σ):** Oxum 91,0% · Brigid 89,8% · Mimir 83,8% · Brahma 80,6% · Freyja 76,4% ·
Krishna 76,1% · Bennu 72,9% · Thor 72,6% · Nüwa 70,4%. (8 dos 9 são **Suporte**.)

**Base (▼ fora da curva, < −1,5σ):** Afrodite 24,5% · Boto 27,5% · Fujin 27,6%.

**O eixo que domina é a FUNÇÃO, não o elemento:**

| função | n | wr médio | | elemento | n | wr médio |
|---|---|---|---|---|---|---|
| Suporte | 27 | **60,6%** | | Chama | 13 | 55,5% |
| Atacante | 29 | 50,3% | | Verdejante | 15 | 54,6% |
| Guardião | 17 | 47,2% | | Aurora | 21 | 51,0% |
| Manipulador | 10 | 41,0% | | Maré | 11 | 50,0% |
| Controlador | 17 | 40,9% | | Tempestade | 13 | 46,2% |
| | | | | Umbra | 27 | 45,9% |

Leitura: a v2 recompensa fortemente o **Suporte** (cura/buff/sustain somados ao longo da partida) e pune
**Controlador/Manipulador** (controle isolado não fecha a partida sozinho). O espalhamento por elemento é pequeno
(~9pts entre o melhor e o pior) e **não** acompanha "neutro × tocado pela fase" — ver §5.

## 3. SLOT MORTO — confirmado a N=3000 (IC do Δ ±1,8pts)

`Δ` em pontos de win-rate; uso em vezes/partida.

| deus | base% | Δpassiva | Δbásico | Δhabilidade | Δmilagre | uso b/h/m | veredito |
|---|---|---|---|---|---|---|---|
| **Fujin** | 31,8 | **0,0** | 6,3 | **0,0** (uso 0) | 13,9 | 1,78/0/1,57 | passiva E habilidade MORTAS |
| **Xangô** | 41,7 | 4,0 | 11,2 | **0,0** (uso 0) | 20,7 | 2,44/0/1,01 | habilidade MORTA (Balança) |
| **Cernunnos** | 43,9 | 7,0 | 11,8 | **0,0** (uso 0,006) | 19,8 | 2,79/0,01/1,14 | habilidade MORTA (reflexo) |
| **Shuten Dōji** | 52,8 | 13,9 | 15,9 | **0,2** (uso 0,05) | 25,3 | 3,85/0,05/1,44 | habilidade MORTA (roubo) |
| **Tyr** | 50,1 | 1,4 | 30,5 | **0,5** (uso 0,08) | 2,9 | 5,39/0,08/0,21 | habilidade MORTA; milagre fraco |
| **Hades** | 49,8 | 5,5 | 12,0 | **0,9** (uso 0,29) | 27,2 | 2,76/0,29/1,20 | habilidade ~morta |
| **Curupira** | 58,5 | 21,2 | 22,4 | **0,0** (uso 0) | 18,9 | 4,78/0/1,29 | habilidade MORTA |
| **Saci** | 59,0 | 17,3 | 54,4 | **0,0** (uso 0) | 3,0 | 13,0/0/0,52 | habilidade MORTA; básico é tudo |
| **Kukulkán** | 54,9 | 6,6 | 11,5 | **0,0** (uso 0) | 34,4 | 2,75/0/1,16 | habilidade MORTA |
| **Afrodite** | 32,5 | **−2,7** | 16,1 | 2,7 | 23,9 | 5,99/0,85/2,39 | **passiva ANTI-sinergia** (desligar AJUDA) |

**Padrão sistêmico (o achado maior):** a **habilidade** é o slot morto de vários deuses. Na triagem M=200, **~30
deuses** têm uso de habilidade < 0,12 e Δhabilidade ~0 (Ah Puch, Bastet, Cérberus, Chang'e, Cuca, Ganesha,
Heimdall, Hera, Hermes, Inari, Izanami, Khonshu, Kitsune, Krishna, Loki, Medusa, Morrigan, Nezha, Odin, Sobek,
Tsukuyomi, Yamato Takeru, … além dos confirmados acima). É o §318 F1b ("40% das habilidades < 0,1 de uso")
**persistindo sob a v2**: a v2 usa muito mais o kit que a v1, mas um naipe grande de habilidades segue mecanicamente
inerte — efeitos reativos/condicionais/de tempo que nem a IA de papel ativa.

**Suspeitas conferidas (sem pressupor):**
- **Hércules "pilha" (Os Doze Trabalhos)**: NÃO é morta — é o **melhor** slot dele (Δhab **36,9**). O slot fraco é o
  **milagre** (Δmil 8,5, uso 0,47). A suspeita estava invertida.
- **Shuten "roubo", Xangô "Balança", Cernunnos "reflexo"**: confirmadas MORTAS (Δhab ~0).

## 4. Casos conhecidos (com a régua nova)

- **Fujin** (força 27,6% ▼): a passiva "Companheiro de Raijin" exige Raijin no time; Fujin é inicial, Raijin não →
  em campo sorteado a passiva quase nunca dispara → **Δpassiva 0 (morta)**. Além disso a habilidade "Saco dos
  Ventos" (só empurra recarga inimiga, sem dano) é **morta (uso 0)**. Deus com DOIS slots inertes → o mais fraco do
  jogo junto de Afrodite/Boto. Confirmado.
- **Oni** (força 49,7%): sob a **v2** o kit **se sustenta** — todos os slots mordem (Δmil 30,0, Δbás 12,5, Δhab
  11,8). Era fraco sob a v1 gulosa; sob a v2 é **mediano**, não quebrado. A premissa "não se sustenta" não vale mais.
- **Xangô / Cernunnos / Hércules / Shuten**: ver §3 (3 habilidades mortas; a de Hércules é a forte).
- **Lista §318** sob a v2: Brigid (89,8% — top, kit inteiro vivo), Piranha (66,7% — saudável), **Tyr** (45,5%,
  habilidade morta), Fenrir (44,9% — kit vivo mas modesto), Kali (55,5% — milagre carrega), Dagda (61,0% — saudável),
  **Ogum** (49,1% — ok, habilidade fraquinha Δ6,5), **Hades** (54,7%/49,8% — habilidade ~morta), Freyja (76,4% — top).

## 5. Elementos neutros (pergunta de desenho — 2–3 opções, NÃO implementar)

Contagem de referências por elemento (scan dos 100 kits):

| elemento | deuses | refs em CUSTO | refs em EFEITO (sinergia) | tocado pela fase? |
|---|---|---|---|---|
| Umbra | 27 | 76 | 5 | sim (Noite) |
| Aurora | 21 | 53 | 5 | sim (Dia) |
| Verdejante | 15 | 37 | 4 | não |
| Chama | 13 | 37 | 2 | não |
| Tempestade | 13 | 39 | 2 | não |
| Maré | 11 | 32 | 3 | não |

**Dois fatos medidos:** (a) o eixo de sinergia é **fino em TODOS** os elementos (2–5 efeitos), não só nos neutros —
Aurora/Umbra levam leve vantagem só pela fase. (b) ser de elemento neutro **não custa força**: na média de win-rate,
Chama (55,5%) e Verdejante (54,6%) lideram; **Umbra** (tocada pela fase, a mais populosa) é a **mais fraca** (45,9%).
Ou seja, hoje o elemento é quase só "qual orbe o kit gasta" — a força vem da função e dos números do kit, não do
elemento.

**Opções (prós/contras) para o dono escolher:**

- **Opção A — não mexer (aceitar elemento = recurso).** O elemento é identidade temática + tipo de orbe; a sinergia
  real vive em função/kit. Prós: zero custo, zero risco, nada a re-verificar. Contras: Verdejante/Chama/Maré/
  Tempestade seguem sem "momento de brilhar" por elemento; a fase Dia/Noite continua um eixo meio solitário.
- **Opção B — um gancho leve por elemento neutro (regra global simples, no motor).** Ex.: Chama → alvo que sofreu
  dano de Chama fica "em brasa" (+X do próximo Chama); Maré/Tempestade já têm "Encharcado" — estender a 1 efeito a
  mais; Verdejante → regeneração rende +1 orbe. Prós: dá eixo a todos sem reescrever kits. Contras: mexe no MOTOR
  (regras novas) → re-verifica TODOS os Ritos v1 pelo solucionador, re-mede a arena inteira, e muda carimbos.
- **Opção C — um segundo eixo de fase (clima) para 2 elementos.** Espelhar Dia/Noite (Aurora/Umbra) com um par
  Seco/Úmido que toque Chama/Maré. Prós: simetria de desenho, enriquece 2 neutros. Contras: a mais pesada — estado
  global novo no motor, UI da fase, re-verificação total; alto risco de efeitos cruzados.

Recomendação de leitura (não decisão): a força NÃO está presa ao elemento, então "neutro" não é um problema de
balanço — é um espaço de DESENHO. Se o objetivo é variedade de build, a Opção B é o melhor custo/benefício; se é
manter o jogo estável, a Opção A é defensável.

## 6. Propostas por deus (lendo o KIT, não o rótulo) — e o que cada uma ARRASTA

> Toda proposta que toca um kit arrasta: (i) a **escada de níveis** daquele slot (os "de" dos degraus têm de
> acompanhar o novo valor e re-passar pela triagem de níveis); (ii) a **re-verificação pelo solucionador** de todo
> **Rito v1** que usa o deus (como aliado OU inimigo); (iii) os **carimbos** de solução desses Ritos mudam. Abaixo,
> o alcance medido de cada um.

| deus | diagnóstico (kit, não tema) | proposta mínima | arrasta |
|---|---|---|---|
| **Fujin** | passiva presa a um deus não-inicial (nunca dispara) + habilidade sem dano que a IA ignora. Tema "gêmeos do vento"; mecânica = combo condicional morto. | tornar a passiva **incondicional** (gerar Combo sozinho, bônus extra com Raijin), e dar à habilidade um corpo que a IA use (dano + o empurrão de recarga). | escada dos 3 slots; Rito **fujin**; re-arena. |
| **Afrodite** | passiva de −5 dano single-target **piora** o resultado (Δ−2,7); função Controlador (a pior) + básico 12 fraco. | trocar a passiva por algo neutro-ou-positivo (ex.: 1ª dominação por partida dura +1 turno) e subir o piso de dano do kit. | escada hab/milagre; Rito **afrodite**; re-arena. |
| **Xangô** | habilidade "Balança" (armazenar 2 turnos → devolver) morta: a IA não monta o set-up de 2 turnos. | encurtar para efeito **imediato** (reflexo no mesmo turno, menor) para a IA conseguir usar. | escada dos 3 slots; Rito **xango**; re-arena. |
| **Cernunnos** | habilidade "reflexo quando atingido" morta (reativa, a IA não valoriza). | trocar por efeito **ativo** (um dano/cura que a IA escolhe). | escada dos 3 slots; Rito **cernunnos**; re-arena. |
| **Shuten Dōji** | habilidade "Saké" (Torpor + roubo ao agir) morta (condicional demais). | simplificar para dano + roubo **imediato**. | escada dos 3 slots; Ritos **shutendoji** e **nezha** (inimigo); re-arena. |
| **Tyr** | habilidade "Duelo de Honra" morta (taunt+autoredução que a IA ignora); básico carrega tudo (Δbás 30,5); milagre fraco. | dar à habilidade um corpo ativo; **CUIDADO**: Tyr é inimigo em **10 Ritos**. | escada dos 3 slots; **11 Ritos** (tyr-A + ares, babi, baldur, bennu, iara, kagutsuchi, mimir, mulasemcabeca, shiva, yamatotakeru como inimigo); re-arena. **Alcance grande.** |
| **Hades** | habilidade ~morta (Δ0,9); milagre carrega (Δ27,2). | reforçar/trocar só a habilidade. | escada; Rito **hades**; re-arena. |
| **Curupira** | habilidade morta (uso 0). | corpo ativo na habilidade. | escada; Rito **curupira**; re-arena. |
| **Kukulkán** | habilidade morta (uso 0). | corpo ativo na habilidade. | escada; Ritos **kukulkan** + como inimigo em ammit, fenrir, morrigan, yanwong, zeus (6 no total); re-arena. |
| **Saci** | básico é 100% do deus (Δbás 54,4!); habilidade morta. É um deus de UM botão. | opcional: aliviar a dependência do básico dando corpo à habilidade. | **Alcance ENORME**: Saci é inimigo em **~40 Ritos** (+ saci-A + guanyu-A) — mexer no Saci re-verifica quase metade do catálogo de Ritos. Só tocar com muita cautela. |

**Não propor (suspeita descartada):** Hércules (habilidade é a força; se algo, o milagre é que é fraco — baixa
prioridade) e Oni (mediano saudável sob a v2).

**Sistêmico (maior que um deus):** o problema real é (1) o **desequilíbrio de função** (Suporte ≫ Controlador/
Manipulador sob a v2) e (2) o **naipe de ~30 habilidades mortas**. Uma revisão deus-a-deus das habilidades mortas é
a maior fatia da Parte 2 — e cada uma arrasta a sua escada + os Ritos que usam o deus. Vale decidir ANTES se a Parte
2 ataca (a) só os casos extremos (Fujin, Afrodite, os ~9 confirmados), (b) o naipe inteiro de habilidades mortas, ou
(c) o desequilíbrio de função por cima (ajuste de régua por função).

## Reproduzir

```
node tools/medir_kits.js forca --rounds=300 --slice=i/4 --out=f   # 4 fatias → merge
node tools/medir_kits.js slot  --M=3000 --alvos=fujin,xango,…      # confirmação de slot morto
```

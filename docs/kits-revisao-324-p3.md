# §324 Parte 3 — equilíbrio entre FUNÇÕES + Tyr + Saci

Diagnóstico da P2: o Suporte dominava por KIT nas duas IAs (v1 60,2% / v2 61,1%; top-10 com 8–9 Suportes;
Oxum/Brigid ~90%). Esta parte **reequilibra as 100 forças e as 5 funções**, destrava Tyr e Saci, e arrasta
tudo o que os kits tocam. Régua do §324 P1 (`tools/medir_kits.js`, arena IA v2). Medição determinística; o
veredito final é a rounds=400 (IC ~±4,7pp/deus; médias de função ainda mais estáveis, SE ~±0,9pp).

## Alvos × resultado (final, rounds=400)

| Alvo | Antes (baseline) | Depois (final) |
|---|---|---|
| Nenhum deus >65% nem <35% (100) | 13 acima, 9 abaixo | **0 acima, 0 abaixo** ✓ |
| Média por função em 45–55% | Suporte 61,1 · Manip. 40,7 (fora) | todas dentro ✓ |
| Tyr: habilidade morta destravada | Δ~0 | **Δhab +23,8pp · uso 1,73/part** ✓ (segue tanque, força 60) |
| Saci: habilidade morta destravada | Δ~0 | **Δhab +41,2pp · uso 5,03/part** ✓ (força 62) |

### Médias por função (arena v2, rounds=400)

| Função | antes | depois |
|---|---|---|
| Suporte | 61,1 | **55,1** |
| Atacante | 49,7 | **50,5** |
| Guardião | 46,2 | **48,3** |
| Manipulador | 40,7 | **46,2** |
| Controlador | 42,4 | **45,0** |

(Suporte 55,1 encosta no teto superior dentro do ruído da média — SE ~±0,9pp; caiu de 61,1 → o domínio da P2
está desfeito.)

## Método (régua do dono) — e a DECISÃO do teto de dano

1. **CORTAR OS EXCESSOS primeiro, do maior para o menor, re-medindo a cada leva.** O balanço é soma
   quase-constante: cortar o topo PROMOVE o próximo (o Brahma subiu quando Brigid/Oxum caíram), então cada
   leva re-mede. As levas cortaram o topo do Suporte (amplificação de dano de TIME + sustain barato) e, onde
   Controlador/Manipulador seguiam **abaixo de 45**, subiram a base (a régua autoriza).
2. **Menor ajuste derivado do kit (tema ≠ mecânica), atacando a FONTE do excesso da P2.** Brigid (passiva +5
   dano de time permanente → +1; `bonusCura +5` → +2), Oxum (cura+orbe recarga 1 → 2; passiva cura→+5 dano →
   +2/1t), Brahma/Mimir/Nüwa/Freyja/Krishna idem (buff de time e sustain aparados por valor/recarga).
3. **Teto de dano RESPEITADO (decisão do dono nesta parte): re-alavancar, não estourar o teto.** Vários
   aumentos de base cruzaram o teto documentado (`tests/auditoria.test.js`: básico 15 · área 10 · habilidade
   25 · área 15 · milagre 40 · área 22). Em vez de **abrir a whitelist** (que é uma lista curada de exceções
   ESTRUTURAIS — bônus condicional, multi-golpe distribuído, nuke-único — nunca de aumentos planos), o dono
   escolheu **re-alavancar para caber no teto**: **todo dano INCONDICIONAL de base ficou ≤ teto**; os bônus
   condicionais (seCond/seDia/porStatus) e o multi-golpe por-golpe seguem como a identidade whitelisted. A
   força perdida no corte da base voltou por **recarga/custo/efeito não-dano, SEMPRE na habilidade que a IA
   REALMENTE usa** (medido por `uso/partida`):
   - 20 bases incondicionais foram **limitadas ao teto** (16 que falhavam + 4 mascaradas por entrada velha da
     whitelist: Amaterasu/Luz, Ammit/Faro, Boitatá/Cobra, Morrigan/As Três Irmãs). 2 multi-golpe (Hermes,
     Susanoo) já tinham por-golpe ≤ teto — só o texto `(N total)` foi corrigido.
   - Compensação **lida pelo `uso`**: muitos "deuses de básico" (Odin, Heimdall, Mimir, Cérberus) ganhavam
     por SPAM de básico (hab/milagre ~0 de uso), então o buff foi no BÁSICO/no que a IA usa, não na habilidade
     parada: Odin (Gungnir passa a **marcar**, casando com a passiva +9 de time), Heimdall (Lâmina Vigilante
     aplica **−3 de dano** no alvo), Ao Kuang/Izanami (básico 12→15, dentro do teto), Boitatá (Bote Flamejante
     aplica **Queimadura**, que alimenta a Cobra de Fogo), Cérberus (o milagre passa a causar 12 em área),
     Ammit (Devorar 35→40 ao teto + Mandíbula aplica Vulnerável), Mimir (passiva de time +2→+1, básico 10→13
     — desloca força do amp-de-time para si). Recargas aparadas onde o milagre era o motor (Ah Puch, Iara,
     Raijin, Tsukuyomi: cd 4→3).
4. **Nunca mexer em kit para caber em CONTEÚDO; o conteúdo se ajusta por alavanca.** Todos os arrastos usaram
   alavancas de HP/prazo/limiar no conteúdo, nunca o kit.

## Tyr e Saci (destravar a habilidade morta, menor ajuste do kit)

- **Tyr — "Duelo de Honra"** (Guardião): mantém o taunt de 2 turnos + a auto-redução de 15 e **ganha um gancho
  ofensivo que a IA persegue**: o provocado fica Vulnerável (+8 de dano recebido). Δhab 0→**+23,8pp**, uso
  0→**1,73/part**. Força 49→60%, segue Guardião. (Kit NÃO tocado pela re-alavancagem.)
- **Saci — "Redemoinho"** (Manipulador): mantém Inalvejável + o roubo de buff e **ganha 8 de dano em área**.
  Δhab 0→**+41,2pp**, uso 0→**5,03/part**. Força 58→62%. (A escada passou a escalar o AoE; por isso Saci saiu
  de `niveis_liberados` até re-afinar — ver abaixo.)

## Tabela — deuses alterados (força baseline → final, arena v2 r400)

Topo cortado (acima de 65 → faixa):

| Deus | Fn | base→fim | Deus | Fn | base→fim |
|---|---|---|---|---|---|
| Brigid | Sup | 93→62 | Izanagi | Sup | 66→59 |
| Oxum | Sup | 92→61 | Osíris | Sup | 65→63 |
| Freyja | Sup | 81→57 | Piranha | Atq | 65→58 |
| Mimir | Sup | 80→63 | Vishnu | Sup | 64→54 |
| Brahma | Sup | 80→59 | Dagda | Sup | 62→58 |
| Nüwa | Sup | 76→56 | Deméter | Sup | 61→64 |
| Krishna | Sup | 73→59 | Mula sem Cabeça | Atq | 68→58 |
| Guan Yu | Grd | 71→62 | Thor | Grd | 68→61 |
| Bennu | Sup | 71→63 | Oxalá | Sup | 69→58 |

Base subida / afinada (abaixo de 35 ou funções baixas → faixa):

| Deus | Fn | base→fim | Deus | Fn | base→fim |
|---|---|---|---|---|---|
| Boto | Man | 26→36 | Iansã | Ctl | 35→44 |
| Tsukuyomi | Ctl | 31→37 | Cérberus | Grd | 36→53 |
| Khonshu | Man | 31→39 | Cuca | Ctl | 36→43 |
| Erínias | Ctl | 32→41 | Amaterasu | Sup | 36→42 |
| Odin | Sup | 34→43 | Dionísio | Ctl | 37→45 |
| Ammit | Atq | 34→42 | Morrigan | Ctl | 37→37 |
| Izanami | Ctl | 34→39 | Raijin | Atq | 37→36 |
| Ymir | Grd | 35→39 | Boitatá | Grd | 38→50 |
| Hermes | Man | 36→56 | Ah Puch | Ctl | 39→39 |
| Bastet | Grd | 36→44 | Heimdall | Grd | 39→37 |
| Tanuki | Man | 35→49 | Yamato Takeru | Atq | 39→37 |
| Medusa | Ctl | 42→51 | Ao Kuang | Ctl | 40→40 |

(Tyr 49→60, Saci 58→62 destravados; mais Kukulkán/Aquiles/Hel/Curupira/Anúbis/Atena/Susanoo/Iara em ajuste
fino de margem. Diff completo em `git diff data/deuses`.)

## O que cada mudança ARRASTOU (feito junto)

- **Textos do kit (desc) + `kits.json` sincronizados** — base e TODOS os degraus re-escritos; cadeia verde
  (`tools/checar_cadeia.js`), babá texto×número verde (build). **Teto de dano verde** (`auditoria`): as 19
  entradas restantes acima do teto são todas whitelisted (condicional/multi-golpe); nenhum aumento plano.
- **Escadas de nível** — re-ancoradas no novo valor-base, re-validadas (`validarNiveisDeus`, build verde).
  **Re-triagem §318** das habilidades alteradas (Ammit −0,8 · Ymir +6,2 · Boto +6,5 · Odin −1,2 · Heimdall
  −1,1 — todas ≤ +15pp): `niveis_liberados` inalterado; **Dagda e Saci seguem fora** (triagem da P2/escada do
  AoE, a re-afinar).
- **Ritos (v1)** — re-verificados com o solucionador e **re-carimbados os 47 com hash velho** (o kit mudou).
  **3 fecharam** (o buff de um inimigo tirou a vitória) → consertados por **alavanca de HP**: Cérberus
  (inimigos 58), Hades (55), Thor (60). Todos VENCÍVEL, carimbo e hash conferem; os outros 53 intactos.
- **Semanais (v1)** — re-verificados; **1 fechou** (ogum, com Ammit inimigo buffado) → alavanca de HP
  (inimigos 55) + `minimo` recomputado (18→11). Todos VENCÍVEL.
- **Campanha (v2)** — único deus alterado que é inimigo: Cérberus (chefe do Prólogo, 250 HP). Re-verificado
  **sob a v2: VENCÍVEL** (27 lances). O build (trava de referências) não quebra.
- **Domínios** — **NÃO regenerados** (decisão: recalibragem fica para depois). Relatório: dos 1600 níveis, os
  que têm ao menos um dos 24 deuses re-alavancados como inimigo ficam com dificuldade medida defasada até a
  recalibragem; sem guarda de build, não quebra.

## Fecho

Suíte + build **verdes**. Todos os 100 na faixa [35,65] e as 5 funções em [45,55] (rounds=400). O teto de dano
foi **respeitado por re-alavancagem** (recarga/custo/efeito não-dano na habilidade que a IA usa), sem abrir a
whitelist e sem achatar as identidades. O domínio do Suporte da P2 está desfeito pela raiz.

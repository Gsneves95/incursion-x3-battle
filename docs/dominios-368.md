# §368 — DOMÍNIOS mais justos: reservas + mais cura + recalibragem por metas

Relatório da **recalibragem por metas** (item 3 do §368). Simulação em `tools/sim_dominios_368.js`
(a corrida de PRODUÇÃO — `src/dominios.js` com reservas + cura — jogada com a **IA v2 dos dois lados**,
como o runtime). Semana 0 das 5 culturas; medianas sobre **N corridas por time/cultura** variando a semente
de batalha (a produção usa semente fixa por nível; a calibragem varia p/ robustez, à moda da régua).

## Times de referência (determinísticos)

- **INICIAL** = o melhor time de 5 formável **só com os INICIAIS**: titulares `regua.p3Time` = **brigid, ogum,
  nezha** (o melhor trio de iniciais do §325b) + os 2 iniciais mais fortes (força v2) como reservas = **sobek, tyr**.
- **FORTE** = o do §325b (titulares `regua.times[0]` = **oxum, piranha, curupira**) + os 2 mais fortes do pool
  da régua (18 deuses fora das 5 culturas) como reservas = **brigid, brahma**.

**Política de prêmio (fixa, na simulação):** BÔNUS de dano até o teto (snowball — a linha que vai mais fundo),
senão REVIVER o caído mais forte, senão CURA TOTAL.

## METAS (por cultura)

- INICIAL: mediana ≈ **10** (aceitável 8–12);
- FORTE: mediana ≈ **20** (aceitável 17–24), e **< 10% das corridas** chegam ao nível 40;
- mesmo método nas 5 culturas; nada de afinar por cultura.

## Passo (a) — curaPorNivel SÓ (15–35%), danoMult da escada INALTERADO (rampa 1.00/1.05/1.10/1.15)

Com a rampa de dano atual, reservas + cura **não** aproximam as metas — o time INICIAL cai no nível ~1–2
(é o piso ~1 do §325b: os iniciais perdem p/ os deuses de elite da cultura já no nível 2, por BURST, não por
desgaste — a cura quase não morde):

| cura | INICIAL medianas (G/N/E/J/C) | FORTE medianas (G/N/E/J/C) |
|---|---|---|
| 25% | 1 / 2 / 1 / 1 / 1 | 3 / 3 / 3.5 / 2 / 4 |

→ **(a) não basta.** Passo (b): mexer na rampa de dano (danoMult por faixa), mesmo método nas 5 culturas.

## Passo (b) — varredura danoMult × cura (mesma escala em todas as faixas e culturas)

`danoMult` aqui é um **fator uniforme** sobre a rampa da escada (preserva a monotonia e a forma da régua).
Medianas por cultura — **G**rega / **N**órdica / **E**gípcia / **J**aponesa / **C**hinesa — e, no FORTE, o
**% de corridas que chegam ao 40**:

| danoMult | cura | INICIAL (G/N/E/J/C) | FORTE (G/N/E/J/C) | FORTE %40 (G/N/E/J/C) |
|---|---|---|---|---|
| 0.35 | 15% | 5.5 / 7 / 6 / 6 / 4.5 | 40 / 40 / 40 / 34 / 9 | 67 / 100 / 83 / 50 / 0 |
| 0.35 | 25% | 7 / 8.5 / 7.5 / 7 / 4.5 | 40 / 40 / 40 / 40 / 5 | 100 / 100 / 75 / 83 / 0 |
| **0.35** | **35%** | **8 / 10.5 / 11.5 / 9 / 8** | 40 / 40 / 40 / 40 / 5 | 100 / 100 / 83 / 92 / 0 |
| 0.40 | 15% | 5 / 5 / 6 / 5 / 4 | 40 / 40 / 40 / 24 / 10 | 67 / 100 / 75 / 42 / 0 |
| 0.40 | 25% | 6 / 7 / 6.5 / 6 / 4 | 40 / 40 / 40 / 40 / 13 | 83 / 100 / 92 / 83 / 0 |
| 0.40 | 35% | 7 / 8.5 / 7 / 7.5 / 5 | 40 / 40 / 40 / 40 / 12.5 | 100 / 100 / 100 / 100 / 0 |
| 0.45 | 15% | 5 / 4.5 / 5.5 / 4 / 4 | 30 / 40 / 40 / 18 / 9.5 | 33 / 75 / 92 / 17 / 0 |
| 0.45 | 25% | 5 / 5 / 5 / 5 / 4 | 40 / 40 / 40 / 34.5 / 9.5 | 67 / 92 / 92 / 42 / 0 |
| 0.45 | 35% | 6 / 6 / 6 / 6 / 5 | 40 / 40 / 40 / 40 / 9.5 | 92 / 100 / 92 / 100 / 0 |
| 0.50 | 15% | 4 / 3 / 4 / 4 / 3 | 15.5 / 40 / 36.5 / 15.5 / 8.5 | 8 / 67 / 33 / 8 / 0 |
| 0.50 | 25% | 5 / 4.5 / 4 / 4 / 3.5 | 24.5 / 40 / 40 / 17 / 9 | 25 / 83 / 75 / 8 / 0 |
| 0.50 | 35% | 5.5 / 6 / 5 / 5 / 4.5 | 40 / 40 / 40 / 40 / 10 | 67 / 100 / 67 / 58 / 0 |
| 0.55 | 15% | 3 / 3 / 4 / 3 / 3 | 19 / 37 / 31 / 9 / 9.5 | 0 / 50 / 8 / 0 / 0 |
| 0.55 | 25% | 4 / 4 / 5 / 4 / 3.5 | 20 / 40 / 39.5 / 15.5 / 11.5 | 8 / 67 / 50 / 8 / 0 |
| 0.55 | 35% | 4.5 / 5 / 4 / 4 / 4 | 23 / 40 / 40 / 19.5 / 10.5 | 33 / 100 / 83 / 17 / 0 |
| 0.60 | 15% | 3 / 3 / 4 / 3 / 2.5 | 10 / 20.5 / 29.5 / 9 / 11.5 | 0 / 0 / 8 / 0 / 0 |
| 0.60 | 25% | 3 / 3 / 4 / 3 / 3 | 15 / 32 / 32 / 11 / 15 | 0 / 33 / 33 / 8 / 0 |
| 0.60 | 35% | 4 / 4.5 / 4.5 / 4 / 3.5 | 24.5 / 39 / 31.5 / 13 / 16 | 17 / 50 / 42 / 8 / 0 |

## Veredito: **nenhuma combinação bate as metas** — NÃO se forçou (item 3)

As duas metas pedem **danoMult OPOSTOS**, e as culturas têm dureza intrínseca MUITO diferente (uma propriedade
do dado, já registrada no §325 — "a dureza de cada cultura é uma propriedade do dado, reportada com honestidade,
não um defeito a mascarar"):

1. **A meta do INICIAL (8–12) só é alcançada em `danoMult 0.35 / cura 35%`** (medianas 8/10.5/11.5/9/8, todas
   em [8,12]). Mas aí o FORTE **estoura** (mediana 40, 83–100% das corridas chegam ao 40) — o oposto da meta
   FORTE (17–24, <10% no 40).
2. **A meta do FORTE (17–24 com <10% no 40) exige `danoMult ~0.5–0.55`** — e lá o INICIAL cai p/ ~4–5 (bem
   abaixo de 8). Além disso, mesmo no melhor danoMult, **nenhum** valor põe as 5 culturas do FORTE na faixa ao
   mesmo tempo: **Nórdica e Egípcia** quase sempre vão a ~40 (fáceis p/ oxum/piranha/curupira), enquanto
   **Chinesa** nunca passa de ~9–16 (um contra-counter do dado) e **Japonesa** oscila.

Ou seja: para o INICIAL subir à meta, o dano precisa cair tanto que o FORTE vira passeio; para o FORTE caber na
meta, o INICIAL afunda; e a Chinesa é um outlier dos **dois** lados. **Com os botões permitidos (cura 15–35% e um
fator uniforme de danoMult, sem afinar por cultura) as metas são MUTUAMENTE inalcançáveis.** Conforme o item 3,
**não se forçou** e **não se aplicou** a mudança de danoMult.

## O que §368 ENTREGA (itens 1, 2 e a parte aplicável do 3)

- **Reservas (item 1):** a corrida monta **5 deuses** (3 titulares + 2 reservas). O reserva assume a vaga do
  titular caído no nível seguinte (a ordem se mantém); o nível joga com até 3 vivos; a corrida só acaba com os 5
  caídos; a derrota com reserva vivo **refaz** o nível; o REVIVER escolhe qualquer dos 5. **Entregue e provado.**
- **Cura como FRAÇÃO (item 2):** `curaPorNivel` passou de 25 HP absolutos para **0.25 (25% da vida máxima)** —
  "mais cura" (≈ 30 HP num deus de 120, vs. 25 antes), agora proporcional ao máximo de cada deus. **Entregue.**
- **danoMult (item 3b): INALTERADO** (rampa 1.00/1.05/1.10/1.15). A recalibragem da dificuldade fica para a
  **decisão do dono** (como a calibragem final do §325b também ficou "à mão do dono"), com a tabela acima para
  escolher o ponto — ciente de que as metas por-cultura não são simultaneamente atingíveis sem afinar por cultura.

### Medianas no estado ENTREGUE (danoMult inalterado, cura 25%, com reservas)

| | G | N | E | J | C |
|---|---|---|---|---|---|
| INICIAL | 1 | 2 | 1 | 1 | 1 |
| FORTE | 3 | 3 | 3.5 | 2 | 4 |

(As reservas ~triplicam o número de corpos, mas a BURST da escada atual derruba os reservas tão cedo quanto os
titulares; sem a redução de danoMult — que não foi aplicada — a profundidade muda pouco frente ao §325b.)

### Recomendação ao dono

Se o objetivo é **afrouxar de fato** (a queixa original), o caminho de menor mudança pela tabela é **baixar o
danoMult uniforme para ~0.45–0.50 com cura 25–35%**: põe o FORTE de Grega/Japonesa na faixa (~17–24) e sobe o
INICIAL p/ ~5–7 — ainda abaixo da meta INICIAL e com Nórdica/Egípcia estourando, mas MUITO mais perto da
intenção do que o estado atual. Fechar as metas exatas exigiria ou **relaxá-las**, ou **aceitar a variância por
cultura** como propriedade do dado (§325), ou **afinar por cultura** (explicitamente proibido no §368).

## Economia (item 4)

`data/economia.json` **inalterado**: `dominios.recompensas.porNivel.essencia = 2`; `tetoRunEssencia = 30`
(= 15 níveis limpos); `tetoDiarioEssencia = 90`. Ganho médio de Essência por corrida = `min(2 × profundidade
mediana, 30)`:

- **Antes (§325b / §325):** piso ~1 → ~**2** de Essência por corrida típica.
- **Depois (§368 entregue, danoMult inalterado):** INICIAL ~1–2 → ~**2–4**; FORTE ~2–4 → ~**4–8**. Como o
  danoMult **não** mudou, corridas não ficaram sensivelmente mais longas, então o ganho sobe pouco.
- **Teto:** nenhuma corrida típica chega aos 15 níveis, então `tetoRunEssencia` (30) e `tetoDiarioEssencia`
  (90) **continuam segurando** com folga. (Se o dono aplicar uma redução de danoMult que alongue as corridas, o
  teto por corrida de 30 passa a morder a partir de ~15 níveis limpos — reportar antes de mudar valores.)

**Valores de economia não foram alterados** (o §368 pede consulta ao dono antes de mudá-los).

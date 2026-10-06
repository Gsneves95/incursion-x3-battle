# §323 P2 ETAPA E — tabela final da IA por modo (Fase 5)

Fonte única: `data/ia_por_modo.json` (cliente e servidor leem daqui; a guarda de build `tools/ia_modo_guard.js`
exige que todo modo em v2 não-isento tenha prova de winnability no manifesto). Após as decisões da Fase 5, a tabela
**não mudou** em relação ao §322 P3 — ela já estava no estado final correto.

| modo | versão IA | por quê |
|---|---|---|
| **campanha** | **v2** | 6/6 encontros de batalha vencíveis sob a v2 (manifesto). |
| **Domínios** | **v2** | corrida sem solução fixa — isento da regra; dificuldade medida à parte. |
| **sandbox** | **v2** | time livre sem solução fixa — isento. |
| Ritos | v1 | a v2 fecha 25/27 mesmo a 900k; o dono decidiu NÃO nerfar os puzzles autorais (ETAPA C). |
| Desafios por deus | v1 | usa os mesmos dados dos Ritos — mesma decisão. |
| Semanais | v1 | guanyu INVENCÍVEL + ammit/mnevis fechados; sem nerf (ETAPA C). |
| composição | v1 | 5/6 vencíveis por time de referência; cx_semmilagre bloqueia e não vale nerfar só ele (ETAPA D). |

## O que muda para o jogador (resumo da Fase 5 / §323 Parte 2)

- **Níveis de habilidade valem agora em TODO o PvE** (antes só no PvP). Campanha, Ritos, Desafios por deus,
  Semanais, composição, Domínios e sandbox montam o seu lado com o kit efetivo da sua conta; o crédito do servidor
  continua honesto (o replay carimba um snapshot dos níveis, conferido contra a conta). Isto é **ortogonal** à
  versão da IA — vale tanto nos modos v1 quanto nos v2.
- **A IA por modo não mudou:** campanha/Domínios/sandbox na v2 (oponente que usa o kit inteiro); Ritos, Desafios por
  deus, Semanais e composição seguem na v1 — eles foram desenhados para a v1 e o dono preferiu preservá-los a
  nerfá-los em massa.

## Por que a tabela não mudou

A Fase 5 investigou trazer os modos de time-fixo para a v2. A medida (ETAPAS B–D) mostrou que isso exigiria nerfar
~28 puzzles feitos à mão; o dono decidiu não fazê-lo. Logo nenhum modo novo entrou na v2 — a régua do §322 (um modo
só vai a v2 se TODO o conteúdo é vencível sob ela) manteve, por si, os modos de time-fixo na v1.

## Reproduzir / conferir

```
node tools/ia_modo_guard.js            # a guarda: todo modo v2 não-isento tem prova no manifesto (quebra o build se não)
node tests/ia_modo.test.js             # a tabela embarcada passa; pôr "rito" em v2 é REPROVADO (morde com hanuman)
```

# Prontidão dos 88 não implementados — triagem por deus inteiro (fim da F1.2)

A última varredura de planejamento da Fase 1. Pergunta: **quantos dos 88 são escrevíveis HOJE, sem gancho
novo de motor?** Cada deus lido por inteiro (passiva + 3 habilidades) contra o vocabulário atual (os 25 fx,
os controles/efeitos, os 10 gatilhos declarativos da F1.2, os alvos). VERDE = zero mecanismo novo; AMARELO =
falta 1; VERMELHO = falta 2+.

## Distribuição

| cor | nº | deuses |
|---|---|---|
| **VERDE** (0 ganchos) | **4** | apolo, atena, bennu, hércules |
| **AMARELO** (1 gancho) | **36** | um gancho cada — ver ranking |
| **VERMELHO** (2+ ganchos) | **48** | o grosso; morte+controle+marca acumulados |

**A resposta à bifurcação: ~4 verdes, NÃO 30.** O plano se mantém — o próximo passo é motor, não kits. NÃO há um
lote de deuses jogáveis esperando só serem escritos.

**Mas o número esconde o mais útil:** os 36 AMARELOS não se espalham — eles se AGRUPAM em poucos ganchos, e os
três de cima são EXTENSÕES de gatilhos que a F1.2 já construiu, não subsistemas novos. Isso abre um terceiro
caminho entre "escrever kits agora" e "F1.3–F1.5 como estava".

## Ganchos ordenados por deuses que travam (trava = quantos precisam; flip = quantos viram VERDE se só ele existir)

| gancho | trava | flip | natureza |
|---|---|---|---|
| **faz-vocab (heal/apply/cdShift)** | 11 | 3 | **extensão F1.2** — o `faz` aceita só contador/orbGain/shield/revive; abrir heal/apply/cdShift (é o achado §42/§44) |
| **reducao-cond/escopo-nova** | 9 | 5 | **extensão F1.2** — `contra` só filtra por slot; abrir classe/elemento/alvo-único/escopo-por-elemento |
| **execucao-hp** (elimina se HP≤N) | 8 | 1 | motor novo (F1.3, morte) |
| **bonusDano-escala-dinamica** | 8 | 4 | **extensão F1.2** — bonusDano é +N fixo; abrir escala por HP-faltante/contagem-de-status/aliados-caídos |
| **antirevive** (naoRevive) | 8 | 2 | motor novo (F1.3, morte) |
| **marca-vulnerabilidade** (+dano recebido de todas as fontes) | 7 | 2 | motor novo (espelho do dmgDown) |
| **selado-so-basico** (trava Hab+Mil juntas) | 6 | 0 | motor novo (F1.4, controle) |
| **seletor** (mais ferido / maior HP) | 6 | 0 | motor novo (mira contextual) |
| **dia-noite-ler** (efeito muda no Dia/Noite além do dano) | 6 | 1 | motor parcial (fase existe; ler p/ cura/buff/duração/orbe) |
| **ignora-invuln/inalvejável** | 5 | 0 | extensão — `danoIrredutivel.ignora` só fura reducao/escudo |
| **sinergia-nomeada** ("com Fulano no time, X") | 5 | 0 | gatilho novo de passiva (não há forma declarativa) |
| **piso-1hp** (não cai abaixo de 1) | 5 | 0 | motor novo (F1.3, sobrevivência) |
| **bonusCura-cond-nova** (regen-type / facção-do-curador) | 4 | 2 | **extensão F1.2** — quandoCura além de inimigoTem |
| **medo** (dmgDown+trava-Milagre nomeado) | 4 | 0 | motor novo (F1.4, controle) |
| **escolha-efeito** (1-de-N / K-de-N) | 4 | 1 | motor novo (F1.3, resolução em agir) |
| aoReceberControle·aoSerAtingido·aoUsarHabilidade·aoAtacar·aoCair-aliado·aCadaN-faz·torpor | 2–3 cada | — | família **reativa** (§44), um gancho por evento |
| orbe-proteção/negação · iniciativa · multi-hit-distribuído · redirecionar · pacificar · reflete-dano · copiar-última · modo-alterna · … | 1–3 | — | cauda longa (1 deus cada, em geral) |

## Leitura estratégica (o terceiro caminho)

**Os 3 ganchos de cima somam ~28 deuses travados e são todos EXTENSÃO de gatilho F1.2, não motor novo:**
`faz-vocab` (11), `reducao-cond` (9), `bonusDano-escala` (8). Pelo §44 (generalizar o existente antes de criar),
são baratos: mais valores no `faz`, mais chaves no `contra`, um termo de escala no `bonusDano`. **Construí-los
como um passo "F1.2.5" flipa ~12 deuses direto para VERDE (3+5+4) e reduz a cor de muitos VERMELHOS.** Depois
disso, re-rodar esta triagem: o VERDE salta de 4 para ~16, e AÍ "lotes por prontidão" (escrever kits na ordem em
que ficam verdes) passa a valer — que é a ideia certa do dono, só que destravada por 3 extensões baratas antes.

**O resto é o motor pesado já previsto**, e a triagem confirma o agrupamento dos blocos:
- **F1.3 morte/sobrevivência:** execucao-hp (8) + antirevive (8) + piso-1hp (5) + execução-status/temporizada + escolha-efeito.
- **F1.4 controle:** selado-so-basico (6) + medo (4) + pacificar (1) + agarrar (1) + torpor.
- **Transversais:** marca-vulnerabilidade (7), seletor (6), dia-noite-ler (6), ignora-invuln (5), sinergia-nomeada (5).

**Recomendação:** "lotes por prontidão" aplica-se ao MOTOR, não aos kits, e nesta ordem de ROI (deuses
destravados por custo): (1) as 3 extensões F1.2.5 (baratas, geram o primeiro lote jogável); (2) F1.3 morte;
(3) F1.4 controle; re-triando entre cada uma. O plano original vale no miolo (F1.3→F1.4), com um pré-passo de
alta alavancagem que os números tornaram visível.

## Método e limites (honestidade)

Triagem por 4 leitores em paralelo sobre a planilha ("Kits NA"), cada um com a mesma rubrica (superfície de
capacidade + nomes canônicos de gancho), depois agregação determinística (a cor vem da CONTAGEM de ganchos
distintos, não da opinião do leitor) e consolidação dos nomes fragmentados. **Tem ruído de ±poucos, nos dois
sentidos** — a verificação pontual achou erros dos dois lados: um leitor marcou AMARELO o Bennu (o
`reviveProximoTurno` já existe → é VERDE) e marcou VERDE o Ares/Kraken (escala-por-HP e imunidade-a-Agarrar SÃO
ganchos → AMARELO). Corrigidos os que a amostragem pegou. O VERDE exato pode oscilar 4–7 num audit deus-a-deus,
mas a DECISÃO (≈5, não 30) e o RANKING de ganchos (os clusters) são robustos ao ruído. Fonte por deus em
`scratch`/`final.json` da sessão; re-audit deus-a-deus disponível se a fronteira exata amarelo/verde importar.

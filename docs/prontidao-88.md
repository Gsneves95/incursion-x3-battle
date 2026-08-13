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

## Curva do VERDE — F1.2.5 sessão 1 (`faz-vocab`)

| marco | VERDE | AMARELO | VERMELHO |
|---|---|---|---|
| triagem inicial | 4 | 36 | 48 |
| após `faz-heal`/`faz-apply` | **5** | 39 | 44 |

**Subiu MENOS que o projetado (4→5, não 4→7) — e isso é o diagnóstico que o dono pediu.** O ranking projetava
`faz-vocab` flipando 3 sozinho (freyja, ymir, oxum). A varredura da família mostrou o porquê:
- **`faz-vocab` era BALDE** (alerta #3): 11 na contagem = heal (7) + apply (2) + cdShift (1, adiado) — e **freyja/oxum
  estavam MAL-CLASSIFICADOS**: "aliado curado causa +5 no turno seguinte" é `bonusDano` com `quando:alvoCuradoAntes`
  (reservado), NÃO `faz-apply`. Então `faz-heal/apply` flipou **só ymir**.
- **Mas fez trabalho de INFRA:** 4 deuses foram VERMELHO→AMARELO (ahpuch→antirevive, khnum→aoCair-aliado,
  shutendoji→torpor, demeter→seletor) — montados para flipar quando o 2º gancho vier. A extensão HABILITA verde
  mais do que FLIPA verde agora, como previsto.
- **Alerta #2 (`apply`) tratado:** `apply` em faz fechado a BUFF (`V.buffs`) + alvo self|time; controle/debuff
  recusado em voz alta. A garantia "faz tem alvo fixo" (sessão 4) preservada.
- **cdShift adiado:** 1 deus (Huang Di) e ainda precisa de seletor — baixo ROI, entra com o seletor.

**Lição para as próximas duas extensões:** a projeção "flip sozinho" da triagem é otimista quando o gancho é
balde — vale re-varrer a família antes e re-triar depois, exatamente como o dono pediu. `reducao-cond` (próxima,
projeta 5 flips) merece a mesma desconfiança: se as 9 redução-condicionais pedirem eixos diferentes (classe vs
elemento vs contagem), o flip real é menor.

## Métrica DUPLA e a distinção projeção-vs-execução (dono, registrar)

**Acompanhar DUAS séries, não uma:** VERDE (jogável hoje) e VERMELHO (travado em 2+). A curva do VERDE sozinha
SUBESTIMA o progresso — a F1.2.5 sessão 1 subiu o VERDE só 4→5, mas derrubou o VERMELHO 48→44 (4 deuses
VERMELHO→AMARELO, montados p/ flipar no 2º gancho). **Se o VERMELHO cai mais rápido que o VERDE sobe, a fase vai
bem mesmo com o placar de VERDE parado** — "habilita verde" precede "flipa verde".

**Projeção ≠ execução, e só a medição separa:** quando a curva sobe menos que o previsto, há duas causas OPOSTAS
e a correção de cada uma é oposta — (a) a EXTENSÃO rendeu menos que devia (corrige-se a extensão) ou (b) a
PROJEÇÃO estava errada (corrige-se a triagem, não a extensão). Na sessão 1 foi (b): freyja/oxum eram
alvoCuradoAntes, não faz-apply — a extensão fez o que devia, a previsão é que superestimou. Sem a re-triagem, isso
teria passado como "faz-vocab rendeu pouco" e alguém "consertaria" uma extensão que estava certa. Re-triar depois
de cada extensão é o que torna a distinção visível.

## `reducao-cond` — a DIVISÃO golpe-vs-estado (trazida ANTES de escrever, F1.2.5 sessão 2)

A família de redução tem ~15 passivas; ~9 condicionais. Classificadas por **o que a condição LÊ**:

| eixo | lê | exemplo | cabe no `contra`? |
|---|---|---|---|
| slot | o golpe | Sobek "de Básicos" | JÁ EXISTE |
| **classe** | o golpe | Oni "de Mágicas" | **sim — contra.classe** |
| **elemento(-negado)** | o golpe | Baldur "exceto Verdejante" | **sim — contra.elemNao** |
| **alcance** | o golpe | Afrodite "alvo único" | **sim — contra.alcance** |
| paridade de turno | o CAMPO | Hel "turnos pares" | NÃO (turno % 2) |
| contagem de aliados vivos | o CAMPO | Guan Yu "3 vivos" | NÃO |
| fase Dia/Noite | o CAMPO | Amaterasu "durante o Dia" | NÃO (= dia-noite-ler) |
| contador próprio | o CAMPO | Kitsune "a cada 3 Caudas" | NÃO |
| primeiro-por-turno | o CAMPO | Bastet "o primeiro ... por turno" | NÃO |
| por-elemento-do-receptor | quem RECEBE | Poseidon "aliados Maré" | não (é escopo) |

**Divisão: 3 golpe (novos) / 5 estado / 1 escopo — é o caso "3-6".** Os 3 de golpe são extensão barata do `contra`
(flipam oni, baldur, afrodite). Os 5 de estado NÃO cabem no `contra` — e o achado que muda a sessão: **eles não
são de redução, são de ESTADO, e OUTROS gatilhos querem os mesmos.** fase=dia-noite-ler (6 deuses), paridade=Hel
também no bonusCura, contagem-de-aliados=Osiris no bonusDano + Guan Yu na imunidade, contador-próprio=kitsune.
**"contra cresce E nasce um eixo de estado"** — exatamente o que o dono previu. O eixo de estado é um QUARTO eixo
de condição (ao lado de quando/contra/quandoCura), mas lê o CAMPO em vez do ataque, e é transversal aos gatilhos.
Decisão do dono: fazer os 3 de golpe agora (barato, on-plan) e o eixo de estado como sessão própria (maior,
transversal, decisão de design) — ou pivotar direto para o eixo de estado, que destrava mais.


## Curva DUPLA — F1.2.5 sessão 2 (`contra` golpe: classe/elemNao/alcance)

| marco | VERDE | AMARELO | VERMELHO |
|---|---|---|---|
| triagem inicial | 4 | 36 | 48 |
| após faz-heal/apply (s1) | 5 | 39 | 44 |
| após contra golpe (s2) | **8** | 36 | 44 |

**VERDE +3 (oni, baldur, afrodite), VERMELHO parado.** Perfil OPOSTO ao da s1: o faz-vocab STAGED vermelhos em
amarelos (VERDE +1, VERMELHO −4); o contra-golpe FLIPOU amarelos direto em verdes (VERDE +3, VERMELHO flat). Os
dois são progresso, formas diferentes — a métrica dupla mostra as duas.

**Projeção era 5 flips; foram 3 — de novo o balde.** `reducao-cond` (9) = golpe (3, construído) + estado (5) +
escopo (1). Só o subconjunto de GOLPE flipou. **bastet** não (precisa de `alcance` E "primeiro-por-turno", ESTADO);
**poseidon** não (escopo por elemento); **hel/kitsune/amaterasu** ficam no eixo de ESTADO. Terceira vez que a
projeção "flip sozinho" superestima porque o gancho era balde — a causa é sempre a mesma. **A sessão 3 (eixo de
estado) destrava bastet/poseidon-vizinhos e os 5 de estado — confirmando a promoção dela.**

`contra` permanece PURO (só golpe). O validador recusa `contra:{paridade}` em voz alta — a fronteira fica óbvia
para a s3 desenhar o 4º eixo.


## Duas leituras que a s1 e a s2 provaram (dono, registrar)

**A métrica única enganava — o par de medições é a evidência.** s1: VERDE +1 / VERMELHO −4 (staging). s2: VERDE
+3 / VERMELHO flat (flip). Formas OPOSTAS de progresso: pela curva do VERDE só, a s1 pareceria fraca e a s2
forte; as duas avançaram igual. Acompanhar VERDE e VERMELHO juntos é o que torna as duas formas visíveis.

**A projeção "flip sozinho" é TETO, não estimativa.** Errou 3 vezes na MESMA direção (faz-vocab 3→1, contra 5→3,
e a de bonusDano-escala há de errar também): o real é SEMPRE ≤ a projeção, e a diferença é o tamanho do BALDE.
Padrão, não coincidência — a contagem do gancho junta formas que pedem eixos diferentes, e só o subconjunto
homogêneo flipa. Ler a projeção como teto (não como número esperado) evita a leitura falsa de "a extensão rendeu
pouco" quando o que houve foi balde previsto errado.

## Eixo de ESTADO — varredura e forma (F1.2.5 sessão 3, DESENHO antes de código)

**A pergunta que decide a forma (dono): existe passiva que condicione no GOLPE E no ESTADO ao mesmo tempo?**
SIM — três, e todas o MESMO composto:
- **Bastet**: "o primeiro ataque de ALVO ÚNICO [golpe: alcance] em cada turno [estado: primeiro-por-turno] causa 8 menos" — reducao.
- **Saci**: "o primeiro ataque de alvo único por turno FALHA" — esquiva.
- **Mnevis**: "intercepta o primeiro ataque de alvo único por turno" — intercepta.

**Decisão TOMADA PELOS DADOS: `estado` é CAMPO UNIVERSAL, não quarto eixo.** Como ≥1 deus precisa de golpe E
estado juntos, `estado:{...}` tem de coexistir com o eixo do gatilho (`contra:{alcance}` E `estado:{primeiroPorTurno}`
no mesmo fx). Um quarto eixo irmão (só-um-por-fx) não expressaria bastet/saci/mnevis. Composição AND.

**Natureza (a distinção que o dono levantou):** `quando`/`contra`/`quandoCura` são eixos de UM gatilho cada
(ofensivo/defensivo/de-cura). `estado` é ORTOGONAL — transversal a vários gatilhos, e por isso é um CAMPO que
qualquer gatilho aceita ao lado do seu eixo, não um eixo a mais na mesma lista. A forma reflete a natureza.

**Membros do sub-vocabulário `estado` (13 deuses, ~7 formas):** paridade de turno (Hel) · fase Dia/Noite
(Amaterasu/Boto/Lugh/Itzamná) · aliados vivos (Guan Yu "3 vivos") · contador próprio (Kitsune "3 Caudas") · HP
próprio (Shuten "abaixo de 50") · primeiro-alvo-único-por-turno (Bastet/Saci/Mnevis) · flag nomeada ("Caldeirão
ativo" do Dagda).

**Duas sub-questões de desenho para o dono (antes de código):**
1. **`fase` já mora em `quando`** (é chave do bonusDano hoje). Se `estado` é o lar do estado-de-campo, `fase`
   deveria MIGRAR de `quando` para `estado` (estava mal-colocada no eixo ofensivo — fase é campo, não ataque).
   É cleanup de uma chave existente; confirmar.
2. **`primeiro-alvo-único-por-turno` não é leitura pura** — precisa de bookkeeping (flag por-unidade resetado a
   cada turno: "já sofri um golpe de alvo único neste turno?"). Compõe `contra:{alcance:unico}` + `estado:{primeiroPorTurno}`,
   mas o "primeiro" exige o motor RASTREAR, não só ler. Confirmar que o custo de rastreio é aceitável.

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


## Curva DUPLA — F1.2.5 sessão 3 (`estado`: campo universal, 5 condições de leitura)

| marco | VERDE | AMARELO | VERMELHO |
|---|---|---|---|
| após contra golpe (s2) | 8 | 36 | 44 |
| após estado leitura (s3) | **~10** | ~35 | ~43 |

Flips CLAROS: **Hel** (paridade resolvia as DUAS cláusulas — reducao par + bonusCura ímpar) e **Itzamná** (fase
resolvia o "+1 orbe/turno durante o Dia"). Os demais donos de estado NÃO flipam porque estado não era o único
gancho: kitsune (aCadaN-faz), boto (aCadaN-faz), guanyu (medo), shuten (torpor), lugh (cdShift-no-Dia + escolha),
bastet/saci/mnevis (primeiroPorTurno reservado). Vários vão VERMELHO→AMARELO (a cláusula de estado resolve,
sobra 1 gancho) — VERMELHO cede devagar. (Números ~ porque o per-deus da triagem é transitório no scratch; os
flips claros são derivados, não medidos — Hel/Itzamná certos.)

Fim da F1.2.5 (as 3 extensões F1.2-adjacentes): VERDE 4→~10, VERMELHO 48→~43. A curva dupla mostra o que a
única esconderia — muito do ganho foi staging (VERMELHO→AMARELO), não flip. O eixo de estado deixou os 5 de
leitura prontos; `primeiroPorTurno` e a sessão esquiva/intercepta (bastet/saci/mnevis) ficam para a fase de
mecanismos.

## RE-TRIAGEM COMPLETA — vocabulário atual (pós-F1.2.5). Per-deus em `docs/triagem-88.json`

**1. Distribuição EXATA** (a F1.2.5 projetou ~16 verdes; deu 16 — a projeção da fase inteira acertou):

- **VERDE (16):** afrodite, amaterasu, apolo, atena, baldur, bennu, freyja, hercules, itzamna, izanagi, jormungandr, kali, khnum, kitsune, oxum, ymir.
- **AMARELO (32):** aokuang, aquiles, bastet, boitata, bragi, brahma, cerberus, chaac, demeter, durga, guanyu, heimdall, hermes, huangdi, inari, isis, kagutsuchi, kraken, kukulkan, medusa, nefertem, oni, orfeu, osiris, perseu, piranha, poseidon, shutendoji, sunwukong, tanuki, xango, yamatotakeru.
- **VERMELHO (40):** ahpuch, ammit, anubis, ares, babi, boto, cernunnos, change, curupira, dagda, dionisio, erinias, exu, fenrir, hades, hanuman, hel, horus, houyi, iansa, iara, izanami, khonshu, krishna, loki, lugh, mimir, mnevis, morrigan, mulasemcabeca, nuwa, odin, oxala, raijin, saci, shiva, susanoo, tsukuyomi, vishnu, yanwong.

**2. Ranking de ganchos — trava (quantos precisam) | flip (destrava sozinho → vira VERDE) | stage (um de vários):**

| gancho | trava | flip | stage | bloco |
|---|---|---|---|---|
| bonusDano-escala-dinamica | 10 | 4 | 6 | escala |
| antirevive | 8 | 1 | 7 | morte (F1.3) |
| execucao-hp | 7 | 0 | 7 | morte (F1.3) |
| selado-so-basico | 6 | 0 | 6 | controle (F1.4) |
| seletor | 5 | 1 | 4 | mira |
| marca-vulnerabilidade | 5 | 2 | 3 | dano |
| ignora-invuln | 5 | 1 | 4 | extensão danoIrredutivel |
| sinergia-nomeada | 5 | 1 | 4 | passiva |
| aoCair-qualquerInimigo | 4 | 0 | 4 | reativo (§44) |
| multi-hit-distribuido | 4 | 0 | 4 | combate |
| escolha-efeito | 4 | 1 | 3 | modo (F1.3) |
| piso-1hp | 4 | 0 | 4 | morte (F1.3) |
| primeiroPorTurno | 4 | 1 | 3 | esquiva/intercepta |
| medo | 3 | 0 | 3 | controle (F1.4) |
| aoUsarHabilidade | 3 | 2 | 1 | reativo (§44) |
| bonusCura-cond-nova | 3 | 2 | 1 | extensão bonusCura |
| iniciativa | 3 | 1 | 2 | ordem |
| (aoSerAtingido 2·f2, aoReceberControle 2·f1, aoCair-aliado 2, redirecionar 2, dia-noite-ler-extra 2, agarrar 2, faz-cdShift 2, nega-orbe 2, + ~16 caudas de 1) | | | | |

**3. BUCKET-SUSPIC (a projeção erra pra cima por balde — quais suspeito que se partam):**
- **bonusDano-escala-dinamica (10) — ALTA suspeita.** "Escala por quê" varia: HP-faltante (ares/mula), contagem-de-status
  (erinias/hel/aokuang), aliados-caídos (osiris/susanoo), Combo (oni/yamato). Provável que colapse num ÚNICO mecanismo
  ("+v por N", N = quantidade contada) parametrizado pela FONTE da contagem — mas se cada fonte precisar de leitura
  diferente, o real destravado é < 10. É o topo do ranking E o mais provável balde: NÃO sequenciar por esse 10 cru.
- **seletor (5) — ALTA.** "mais ferido" (deméter/hanuman) ≠ "maior HP" (izanami/lugh) ≠ "mais dano turno anterior"
  (krishna, ainda precisa de rastreio de dano). Três seletores, o último com bookkeeping. Parte em ≥2, um deles pesado.
- **sinergia-nomeada (5) — ALTA.** Provável que NÃO seja mecanismo, e sim uma CONDIÇÃO ("aliado X no time") que compõe
  com efeitos existentes — dissolve num campo de condição + gatilhos que já existem. O "5" superestima um mecanismo real.
- **antirevive (8) — MÉDIA.** O EFEITO (naoRevive) é 1 mecanismo; os 8 incluem variedade de GATILHO (self=mimir,
  ao-matar=cerberus/hel/ahpuch/iansa, por-status=anubis/yanwong) que reusa aoCair/apply já existentes. O mecanismo novo
  é pequeno; o "8" é o efeito + disparadores já cobertos.
- **CONFIÁVEIS (não suspeito balde):** execucao-hp (7), selado-so-basico (6), piso-1hp (4), medo (3), ignora-invuln (5),
  marca-vulnerabilidade (5) — mecanismos uniformes, contagem firme.

**Insight de SEQUENCIAMENTO (a lição da F1.2.5 aplicada):** ao contrário da F1.2.5 (extensões baratas flipavam alguns),
a fase de mecanismos é STAGING-dominada — os topos do ranking têm **flip 0** (execucao-hp, selado, piso, aoCair-qualquerInimigo,
multi-hit): NENHUM deles vira um deus VERDE sozinho, porque os deuses de morte/controle são multi-gancho. Então NÃO se
sequencia por flip aqui; sequencia-se por BLOCO (F1.3 morte inteira, F1.4 controle inteiro), e os flips vêm no FIM do bloco
quando o último gancho de cada deus cai. Os poucos flips-sozinhos baratos que restam (aoUsarHabilidade f2, aoSerAtingido f2,
bonusCura-cond-nova f2, marca-vuln f2) são extensões pequenas que rendem 2 verdes cada — o análogo da F1.2.5, se quiser mais
um passo barato antes dos blocos pesados.

## Curva DUPLA — Passo 0 + F1.3 morte (piso-1hp)

| marco | VERDE | AMARELO | VERMELHO |
|---|---|---|---|
| re-triagem (base) | 17 | 31 | 40 |
| Passo 0 (aoUsarHabilidade + sinergia=aliadoPresente) + piso-1hp | **20** | 34 | **34** |

Flips: bragi/brahma (aoUsarHabilidade), inari (sinergia), change (piso+sinergia). **O VERMELHO caiu 40→34** — o
sinal que o dono pediu para acompanhar no bloco de morte: mesmo com o VERDE quase parado nas sessões seguintes do
bloco, o VERMELHO deve ceder a cada gancho; se ficar parado, o gancho não travava o que a triagem dizia. `piso-1hp`
sozinho não flipa (os deuses de piso são multi-gancho — vishnu/oxala foram só p/ AMARELO), confirmando o §46:
fase de mecanismo é staging, o placar do VERDE se move no FIM do bloco. Fonte por-deus em docs/triagem-88.json.

## Curva DUPLA — F1.3 morte, BLOCO FECHADO (as 4 sessões)

| marco | VERDE | AMARELO | VERMELHO |
|---|---|---|---|
| Passo 0 + piso-1hp | 20 | 34 | 34 |
| + execução-hp (§47) | 20 | 34 | 33 |
| + antirevive (§48) | 20 | 36 | 32 |
| + aoCair-qualquerInimigo (§49, FECHA) | **20** | 39 | **29** |

**VERMELHO 40→29 (−11) monotônico; VERDE parado em 20 as QUATRO sessões — inclusive no fecho.** O VERMELHO é o
sinal vivo: cada gancho cedeu 1-3 (fenrir por execução; mimir por antirevive; ahpuch/hades/iansa por qualquerInimigo).
Cede POUCO porque são ganchos de STAGING (flip ~0-1): os deuses que travam carregam outros ganchos, então limpar um
raramente flipa sozinho.

**A previsão do dono ("flips no fim do BLOCO") ficou HALF-CONFIRMADA (§50):** staging bateu (VERMELHO monotônico),
mas o flip-no-fecho NÃO — nenhuma das 4 mecânicas de morte zerou um deus. Um deus flipa quando cai seu ÚLTIMO
gancho, e os de morte carregam ganchos de outros blocos (selado, medo, execução-variante, antirevive-source que
falta). **O bloco fecha um MECANISMO, não um DEUS.** Correção do modelo: em plano dominado por mecanismo, o VERDE
é back-loaded para o fim da FASE (o último bloco de cada deus), não de cada bloco. Fonte por-deus em docs/triagem-88.json.

## PREVISÃO REGISTRADA ANTES do bloco CONTROLE (F1.4) — testa o §51/§52

**10 deuses têm CONTROLE como último bloco** (ganchos restantes todos de controle → flipam quando o bloco fechar):
curupira, fenrir, guanyu, hades, kraken, medusa, oxala, piranha, shutendoji, xango. **9 são AMARELO de gancho único**
(flipam INCREMENTALMENTE ao abrir o gancho, não no fecho); só curupira é 2-de-controle.

| | previsão ANTES | resultado (em andamento) |
|---|---|---|
| VERDE no fecho do CONTROLE | **~30** (20 + 10) | 23 após o 1º gancho (slot-lock) |
| forma | FRONT-loaded (flip por gancho, não massa no fim) | ✔ confirmado: +3 no 1º gancho |

Diferença-chave vs MORTE: os deuses de controle estão perto do FIM da fase, quase não têm ganchos depois → flipam
ao abrir o gancho. Se o VERDE NÃO chegar perto de 30, o §51 está errado. **Merges (§52):** os 9 nomes do dono
colapsam em ~6 mecanismos (slot-lock-nomeado generaliza o `lockSkill` e absorve selado+agarrar+medo-lock;
torpor≡aoAgirSobEfeito; aoCair-aliado é extensão trivial). O bloco é menor que a lista.

### Andamento do bloco CONTROLE

| gancho | VERDE | AMARELO | VERMELHO | flips |
|---|---|---|---|---|
| (base, pós-morte) | 20 | 39 | 29 | — |
| slot-lock nomeado (§53) | 23 | 41 | 24 | fenrir, kraken (agarrar), hades (selado) — INCREMENTAL |
| aoSerAtingido (§55) | 25 | 39 | 24 | medusa, xango — INCREMENTAL |
| aoAgirSobEfeito (§56) | **26** | 38 | 24 | piranha — INCREMENTAL (shuten → resíduo nega-orbe) |

Três ganchos, +6 VERDE (20→26), todos front-loaded — a previsão do §52 segue batendo, o §51 se sustenta (deus de
controle não tem bloco depois → flipa ao abrir o gancho). Restam para chegar aos ~30: pacificar (oxala), medo
(guanyu); curupira flipa quando redirecionar cair também. Nota: shuten NÃO flipou — o `torpor` era bundle
(trigger + roubo-de-orbe); o trigger caiu, o roubo-de-orbe resta (nega-orbe, com dionisio/mimir).
# §322 — IA que usa o kit inteiro · Parte 1 (medir e prototipar)

> **Nada mudou no jogo.** Este documento é a medição e o protótipo. A IA do jogo (`src/ia.js`) continua a
> gulosa de 1 lance. As candidatas vivem em `tools/ia_proto.js` e só são consumidas pelas ferramentas de
> medição. A troca (ligar a candidata no jogo) é a **Fase 5** — não feita aqui.

## O problema (confirmado)

A IA atual (`iaProximaAcao`, nível `normal`) é **gulosa de 1 lance**: clona o estado, aplica cada ação possível,
pontua a posição resultante (`iaPontuar`) e escolhe a de maior ganho. A pontuação valoriza quase só HP/abate; a
utilidade (buff, escudo, provocação, redução, controle, vulnerável) **baixa** a pontuação crua, então nunca é
escolhida. Medido (`tools/medir_ia.js uso --ai=atual`, arena-espelho do roster, 640 partidas):

- **43 de 100 habilidades** e **14 de 100 milagres** com uso **< 0,1 por partida** (confirma o §318 F1b: ~40 e 14).

Consequência: o PvE (campanha, Domínios, Ritos, Desafios) enfrenta um oponente que joga com metade do kit; e a
régua de nível não enxerga suporte/tanque (Brigid, Piranha, Tyr, Fenrir, Kali…).

## 1. Como a IA decide e onde roda (mapa)

| Onde | Arquivo | Chamada |
|---|---|---|
| Cliente — turno da CPU no PvE | `src/turno.js:98` | `iaProximaAcao(st)` (default `normal`) |
| Cliente — partida local vs CPU | `src/partida_cliente.js:217` | `iaProximaAcao(MP.st, 'normal')` |
| **Servidor — replay do PvE (§318 F2)** | `server/pve.js:91` | `ia.iaProximaAcao(st, 'normal')` |
| Servidor — partida servida | `server/partida.js:129` | `ia.iaProximaAcao(st, 'normal')` |
| Simulador/arena de medição | `tools/arena.js`, `tools/medir_niveis.js` | `iaProximaAcao` |

**Níveis de dificuldade** (`NIVEIS_IA`): `facil` (só o Básico), `normal` (a gulosa — o histórico), `dificil`
(gulosa + 2-ply dentro do turno). O PvE e a **Provação pinam no `normal`** (§150: o solucionador verifica contra o
MESMO oponente que o jogador enfrenta). A dificuldade da Provação vive no estado+condição, nunca na força da IA.

### O replay exige IA idêntica cliente↔servidor E versionada

`server/pve.js` **re-simula** a partida: consome as ações do JOGADOR nos turnos dele e **roda a própria IA** nos
turnos dela (`_reproduzir`). O replay guarda **só as ações do jogador** — as da IA são regeneradas. Logo:

- A IA tem de ser **byte-a-byte idêntica** no cliente e no servidor (hoje é: uma fonte, `src/ia.js`, que o build
  concatena e o servidor `require`). Se divergirem, a re-simulação produz lances de IA diferentes, as ações do
  jogador deixam de casar, e o replay é **recusado** (`op_jogador_ilegal` / `ops_incompletos` / `sem_fim`).
- Trocar a IA **quebra replays antigos**: uma partida jogada contra a IA v1 e re-simulada com a v2 diverge. O
  envelope de replay **não carrega versão de IA hoje** (`src/replay_cliente.js` — `desc` não tem `iaVer`).

**Plano de versionamento (para a Fase 5):**
1. Congelar a gulosa atual como **IA v1** (nunca removida).
2. A candidata entra como **IA v2**, selecionável: `iaProximaAcao(st, 'normal', { versao })`.
3. O cliente **carimba** no replay a versão que rodou (`desc.iaVer = 2`). `_reproduzir` passa `r.iaVer` à IA;
   replays da fila offline **sem** `iaVer` caem no **v1** (default) e continuam válidos.
4. Cliente e servidor sobem a v2 **juntos** (mesmo commit; o servidor roda o mesmo `src/ia.js`), então nunca há
   um lado em v1 e o outro em v2 para a mesma partida.
5. As Provações já resolvidas re-pinam na versão com que foram autoradas (o solucionador §150 grava a versão).

## 2. Candidatas prototipadas (todas determinísticas — sem `Math.random`, sem corte por tempo)

- **papel** — gulosa de 1 lance, mas com **pontuação por PAPEL** (`pontuarPapel`): dá valor a buff ofensivo
  (dano extra × turnos), a escudo/redução **só na medida do dano que está chegando**, a controle/vulnerável/
  debuff no inimigo, a regen/pisoVida/invulnerável quando há ameaça. Mesmo custo da atual.
- **ply2** — pontuação atual (`iaPontuar`), mas **2 lances**: o meu lance + a melhor resposta gulosa do inimigo
  (encerra meu turno + 1 `iaProximaAcao`), escolhendo o lance com melhor resultado depois da resposta.
- **combo** — (papel) + (ply2).

## 3. Critérios (medidos)

### USO — habilidades/milagres com uso < 0,1 por partida (arena-espelho do roster)

| IA | habilidades < 0,1 | milagres < 0,1 |
|---|---|---|
| **atual** | 43 | 14 |
| **papel** | **27** | **6** |
| ply2 | 35 | 17 |
| combo | 14 | 7 |

`papel` corta quase pela metade os dois números com custo zero. `combo` corta mais as habilidades (14) mas custa
caro (abaixo) e **perde força**. `ply2` quase não muda o uso.

### FORÇA — candidata × IA atual (espelho sorteado, alternando lado e quem começa)

| candidata | taxa de vitória | IC95 | N |
|---|---|---|---|
| **papel** | **53,2%** | [50,8%, 55,7%] (exclui 50 → **vence**) | 1600 |
| combo | 34,4% | [27,5%, 42,0%] | 160 |
| ply2 | 21,9% | [16,2%, 28,9%] | 160 |

**Achado central:** olhar 2 lances **enfraquece** a IA (ply2 21,9%, combo 34,4%) — a antevisão da resposta do
inimigo deixa a IA passiva/defensiva demais e ela gasta turnos com utilidade que não converte em vitória contra um
atacante guloso focado. Só `papel` (1 lance, pontuação melhor) **é mais forte** que a atual — e por margem modesta
(~+3 pp), não ≥ 60%. Ou seja: o caminho para a força é **uma pontuação de 1 lance melhor**, não profundidade.

### CUSTO — ms por decisão (Node; celular estimado ×5; replay ~45 decisões de IA/partida)

| IA | Node | celular (×5) | replay/partida |
|---|---|---|---|
| **papel** | 0,47 ms | **~2,4 ms** ✓ ≤50ms | ~21 ms |
| atual | 0,50 ms | ~2,5 ms | ~23 ms |
| ply2 | 13,6 ms | ~68 ms ⚠ >50ms | ~611 ms |
| combo | 12,8 ms | ~64 ms ⚠ >50ms | ~576 ms |

`papel` custa **o mesmo que a atual** (até um tico menos) e cabe folgado no piso de 50 ms. `ply2`/`combo`
**estouram** o piso do celular **e** encarecem o replay ~25× (o servidor re-simula toda partida de PvE creditada —
até 20 por lote da fila offline).

### Lista de revisão — MÁX do slot negativo sob a candidata `papel`

Deltas de nível (nv4 do slot que era negativo) re-medidos com `papel` como política da partida, contra o valor
embarcado (medido sob a política REATIVA do §318):

| deus | slot | embarcado (REATIVA) | sob `papel` | sai do negativo? |
|---|---|---|---|---|
| Fenrir | básico | −6,2 | **+5,3** (detectado) | ✓ |
| Piranha | básico | −9,1 | **+3,2** | ✓ |
| Kali | milagre | −5,4 | **+1,5** | ✓ |
| Brigid | milagre | −5,9 | **0,0** | ✓ (neutro) |
| Tyr | básico | −5,4 | −3,0 | parcial — melhora, mas ainda negativo |

4 dos 5 saem do negativo. O **Tyr** continua negativo porque mesmo a `papel` quase **não usa a provocação dele**
(uso da habilidade 0,01/partida): a provocação (taunt) é reativa e a pontuação por papel ainda não a valoriza o
bastante. É um alvo explícito da Fase 5.

### Determinismo (replay-safe)

`tools/medir_ia.js verif`: 28.108 pares de decisões (mesma posição, duas chamadas) por candidata — **0
divergências**. As três candidatas são determinísticas.

## 4. Recomendação e impacto

**Recomendada: `papel`** (pontuação por papel, 1 lance). É a única candidata que **ao mesmo tempo** usa muito mais
do kit (habilidades 43→27, milagres 14→6), é **mais forte** que a atual (53,2%, IC exclui 50) e **custa o mesmo**
(replay-safe, cabe no celular). As de 2 lances ficam descartadas: mais lentas **e** mais fracas.

Ressalva honesta: `papel` **não** atinge o alvo “vence com folga (≥60%)” — fica em +3 pp. O trabalho da Fase 5 é
**afinar os pesos da `pontuarPapel`** (sobretudo converter o uso de controle/provocação/vulnerável em vitória, e
resolver o Tyr) para subir a força sem adicionar profundidade (que mediu-se ser contraproducente).

**Impacto esperado no PvE (Fase 5, NÃO agora):** o oponente passa a usar o kit inteiro — o PvE **fica mais
difícil** (campanha, Domínios, Ritos, Desafios). Isso é desejado, mas é mudança de balanceamento e de dificuldade:
entra com versionamento de IA (acima), re-pin das Provações, e provavelmente re-calibração de alguns atos/ondas.

## Como reproduzir

```
node tools/medir_ia.js uso   --ai=atual|papel|ply2|combo [--rodadas=40] [--listar=1]
node tools/medir_ia.js forca --ai=papel|ply2|combo [--n=1600]
node tools/medir_ia.js custo [--rodadas=12]
node tools/medir_ia.js verif
node tools/medir_niveis.js --sorteado --proto=papel --x=fenrir --niv=basico:4 --n=600
```

---

# §322 Parte 2 — afinação da "papel" e entrada no jogo (IA v2)

> Os alvos foram **batidos** → a IA afinada entrou no jogo como **v2**. A recalibragem do PvE (Fase 5) **não**
> entra aqui.

## Afinação (determinística, medida, anti-sobreajuste)

Reescrevi a `pontuarPapel` com termos de **papel** parametrizados por pesos e afinei por **subida coordenada**
(`tools/afinar_ia.js`) com **sementes comuns** (CRN — o que muda entre avaliações é só o peso, não a sorte),
medindo a FORÇA contra a v1 num conjunto de **treino** e **confirmando** num conjunto **separado** que a busca
nunca viu. Termos novos de alta alavancagem: **execução/foco** (empurrar UM inimigo p/ a morte), **controle
creditado pelo dano negado** (controlar um bruto > controlar um fraco), **provocação** (taunt que salva um aliado
mais frágil que o provocador) e **vulnerável/dmgDown** no inimigo.

Duas rodadas: a 1ª (treino 40 comps) confirmou 57,6% [55,5; 59,8] — perto, mas abaixo do alvo e com folga de
sobreajuste ~7,6 pp. A 2ª (treino **64 comps**, grade alargada nas bordas, arranque a quente) quebrou o alvo: o
salto veio de `hpInimigo 1,1→1,0`, `execLimiar→48`, `provoca→1,6`, `controle→12`.

**Pesos finais (IA_V2_W, congelados em `src/ia.js`):**
`exec 0,6 · execLimiar 48 · controle 12 · provoca 1,6 · vulneravel 0,9 · dmgDownIni 0,6 · buffOff 0,4 ·
hpInimigo 1,0 · reducao 0,6 · escudoUtil 0,7 · regen 0,5 · (demais no DEFAULT).`

## Critérios (todos batidos)

| Critério | Alvo | v1 (atual) | **v2 (papel)** |
|---|---|---|---|
| **FORÇA** vs v1 | ≥58%, IC-inf >55% | — | **58,9%** [57,0; 60,9] (semente independente) · **63,1%** [61,1; 65,0] (confirmação) ✓ |
| **USO** < 0,1/partida | só nicho justificado | 43 hab / 14 mil | **23 hab / 7 mil** ✓ |
| **CUSTO** | ≤5 ms/decisão (celular) | ~2,4 ms | **~1,98 ms** · replay **17,8 ms/partida** (< v1) ✓ |
| **DETERMINISMO** | 0 divergências | 0 | **0** (28.108 pares) ✓ |

### Lista de revisão (MÁX do slot que era negativo, re-medido sob a v2)

| deus | slot | embarcado (REATIVA) | sob v2 | saiu do negativo? |
|---|---|---|---|---|
| Fenrir | básico | −6,2 | **+9,2** | ✓ |
| Piranha | básico | −9,1 | **+6,3** | ✓ |
| Tyr | básico | −5,4 | **+5,3** | ✓ (e a provocação do Tyr passa a ser usada — ver abaixo) |
| Kali | milagre | −5,4 | **+5,0** | ✓ |
| Brigid | milagre | −5,9 | **+0,5** | ✓ (neutro) |

**Provocação (caso obrigatório):** o Tyr **saiu da lista de raras** (uso da habilidade ≥ 0,1/partida na arena do
roster) — a v2 provoca quando há um aliado mais frágil que o provocador em risco do próximo golpe. (Na régua de
nível, que fixa um trio e nivela o básico, a oportunidade de provocar aparece menos — é esperado.)

## USO residual — cada < 0,1/partida, justificado

As que seguem < 0,1/partida sob a v2 **e por quê**. Dois grupos: **(N) nicho real** (reativa/condicional/
preventiva/preparação — só vale numa situação específica, que a arena-espelho quase não cria) e **(C) ponto cego
de 1 lance** (o ganho é em turno FUTURO — recurso/tempo/agendado — que uma pontuação da posição imediata não
enxerga; olhar 2 lances foi medido como mais fraco, então não é o caminho).

**Habilidades (23):**
- Ah Puch (noHeal no inimigo) — N: só morde se o inimigo for curar.
- Bastet (interceptar por aliado) — N: reativa, só quando um aliado levaria o golpe.
- Cernunnos (refleteDano no time) — N: só compensa apanhando muito.
- Chang'e (pisoVida no aliado) — N: salva-vidas, só quando alguém morreria.
- Curupira (redirect) — C: redirecionar mira é ganho situacional de posicionamento.
- Fujin (cdShift) — C: acelerar cooldown paga no turno seguinte.
- Ganesha (cleanse+stripOne) — N: só com debuff no aliado / buff no inimigo.
- Heimdall (contraAtaca no aliado) — N: buff reativo.
- Hermes (cdShift no aliado) — C: tempo (futuro).
- Inari (orbGain) — C: banca recurso p/ turnos futuros.
- Izanami (AoE espalha+dot) — N/parcial: dot de área rende aos poucos; pontua, mas abaixo do golpe direto.
- Khnum (interceptar+escudo) — N: defensiva reativa.
- Khonshu (cdShift no inimigo) — C: atrasa o inimigo (futuro).
- Kitsune (interceptar+contador) — N: defensiva reativa.
- Krishna (acaoPerfeita no aliado) — C: prepara a PRÓXIMA habilidade (futuro).
- Kukulkán (inalvejável+agendar) — C: evasão + efeito agendado (futuro).
- Loki (inalvejável+redirect) — N/C: evasão/redirecionamento situacional.
- Nezha (auto, sem fx direto) — N: transformação/estado condicional.
- Odin (marcado em todos) — C: marca de preparação (o dano vem depois, do irmão `vulneravel`/bônus).
- Saci (inalvejável+agendar) — C: igual Kukulkán.
- Tsukuyomi (fase+adormecido) — N: o adormecido tem gatilho de fase/condição; controle sim, mas condicionado.
- Xangô (armazenaDano) — C: acumula p/ liberar depois (futuro).
- Yamato Takeru (inalvejável+próximoGolpePuro, self) — C: prepara o próprio golpe seguinte (futuro).

**Milagres (7):**
- Anúbis (contador+condicional em todos) — N: dispara sob condição.
- Bastet (vidaExtra no aliado) — N: preventivo.
- Dionísio (agendar) — C: efeito agendado (futuro).
- Ganesha (cleanse+cdShift+orbGain) — C: utilitário de recurso/tempo (futuro).
- Hera (víForevínculo+controlImmune em 2 aliados) — N: preventivo, só vale com controle chegando.
- Hermes (roubaOrbe+stripOne) — C: recurso (futuro).
- Medusa (contador em todos) — N: acumula p/ o gatilho (condicional).

**Conclusão do USO:** das 30, ~18 são **nicho genuíno** (não são falha — a arena-espelho simétrica quase não
cria a situação que as justifica) e ~12 são o **ponto cego estrutural de 1 lance** (ganho em turno futuro:
cdShift, orbGain/roubaOrbe, agendar, armazenaDano, marcas de preparação). Corrigi-las de verdade exige avaliar o
FUTURO — e medimos que **olhar 2 lances enfraquece** a IA (Parte 1); dar valor cego a "recurso/tempo" sem busca
arrisca fazer a IA acumular recurso sem converter. Logo **não** mexi nos pesos já validados por isto; o ganho
restante é uma iteração de IA à parte (heurística dedicada de recurso/tempo, medida e validada como esta foi),
**não** um ajuste solto neste commit. Nenhuma dessas é bloqueio de jogo: o kit inteiro já é usado onde há motivo.

## Entrada no jogo (versionamento)

- `src/ia.js`: a gulosa histórica é a **v1** (congelada — nunca mudar); a afinada é a **v2** (`iaProximaAcaoPapel`
  + `IA_V2_W`). `iaProximaAcao(st, 'normal', versao)` despacha; **default `versao=1`** (preserva os chamadores de
  teste). `IA_VERSAO_JOGO = 2`.
- **Replay versionado:** `src/replay_cliente.js` carimba `iaVer = IA_VERSAO_JOGO` no envelope; `server/pve.js`
  re-simula com `r.iaVer` (sem `iaVer` → **v1**, então replays pré-§322 e os da fila offline continuam creditando).
- **Cliente e servidor na mesma versão:** o jogo roda a v2 no cliente (`src/turno.js`, `src/partida_cliente.js`)
  e no servidor (`server/partida.js`), no mesmo commit (uma fonte, `src/ia.js`); a partida ao vivo fica em
  lockstep. O PvE (campanha, Domínios, Ritos, Desafios, sandbox) passa a enfrentar a v2.
- **Régua de nível:** `tools/medir_niveis.js --v2` mede sob a v2; o **padrão continua a v1** até decidirmos trocar.
- **Guardas** (`tests/ia_v2.test.js`, provadas que mordem): v2 ≠ v1 (dispatch ligado); v2 determinística; replay
  novo (iaVer:2) só credita sob a v2; replay antigo vencedor sob a v1 **não vence** forçado à v2 (por isso o
  envelope manda); envelope **sem iaVer** cai na v1; o cliente carimba a versão certa.

## Ritos sob a v2 (winnability — recalcular e conferir, NÃO rebalancear)

`tools/solucionador.js --v2` re-verifica cada Rito contra o oponente v2 (sem re-carimbar — isso é Fase 5).
Resultado (orçamento 200k nós/Rito):

| veredito (v2) | nº de 100 | leitura |
|---|---|---|
| **VENCÍVEL** | **72** (+ curupira a 900k = 73) | continua vencível — alguns com linha mais longa |
| **INDETERMINADO** | 27→26 | o solucionador NÃO achou a vitória no orçamento; vs a v1 ele achava em dezenas–centenas de nós, então sob a v2 a linha vencedora ficou **muito mais funda** (um bump para 900k/90s não resolveu a maioria — curupira resolveu). Winnability **não refutada**; são os "ficaram mais difíceis". |
| **INVENCÍVEL** | **1** — `hanuman` ("Devoção a Rama") | v1 vencia em 23 lances; sob a v2 o espaço de estados **esgota sem vitória** (exaustão real, 530 nós). É um Rito que a v2 torna **invencível**. |

**Conclusão (reporte, SEM rebalancear — Fase 5):** nenhum re-carimbo foi gravado. A v2 torna o PvE
substancialmente mais difícil (resultado aceito): **72–73 Ritos seguem vencíveis**, **~26 ficaram muito mais
difíceis** (linha vencedora bem mais funda — candidatos a `dica`/ajuste na Fase 5) e **1 (`hanuman`) ficou
invencível** — este é um **bloqueio real** que a Fase 5 tem de destravar (ajustar inimigos/condição ou dar dica)
antes que valha a pena para o jogador. O `solucionador --v2` reproduz tudo isto.

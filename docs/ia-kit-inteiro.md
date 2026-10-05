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

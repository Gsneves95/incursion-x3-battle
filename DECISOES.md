# Registro de decisões

Cada entrada tem o que foi decidido, a alternativa recusada, e **por quê**.
`CLAUDE.md` lista os invariantes; este arquivo explica de onde vieram.
O valor daqui é evitar que uma decisão seja desfeita por parecer arbitrária.

---

## §154 — F2.4 (lote 2, NEGAÇÃO): khonshu fecha pelo RELÓGIO (não dica), o enemy-set-por-LEITURA como 1º passo, e o exu sai por FLAVOR≠RIDER.

**LOTE 2 = forma `negarAcaoInimigo` (§152: a forma é o RIDER). Varredura por conceito: 4 Provações, não as ~"N" do sintoma.** dionisio e boto já fecharam no lote 1 (mesma forma, control-pesado, sem dica — §152). khonshu é o único BUILD novo do lote. exu SAI (ver abaixo). Lote 2 fechado: 3 construídas + carimbadas (dionisio, boto, khonshu), 1 realocada (exu→lote 6).

**KHONSHU — o enemy-set vem antes do time, e é verificado por LEITURA (dono, §153 ponto 1).** Ordem aplicada limpa: **(1) enemy-set por leitura** — huangdi·itzamna·ganesha, li os kits ANTES de qualquer medição: os 3 têm slot `milagre`. Numa condição de negação, o inimigo precisa PODER fazer a coisa negada (o espelho do saci); aqui pode, e o set é coerente (3 negadores-alvo, denso de propósito). **(2) isolamento** — o composto (deadline 12 + negar) trava em melhorH 18 `dica` (250k E 500k — platô confirmado, §153 acionavel-não-estável). Mas o isolamento por-fonte desfaz a leitura ingênua: negar + deadline **20** = **VENCÍVEL, 31 lances** — o time control-pesado DENEGA e MATA; a denegação é alcançável. (só-deadline deu melhorH 124, MAIOR que o composto — artefato: sem o `negar` a árvore não é podada por "deixou passar milagre = derrota", ramifica larga e o best-first não desce; melhorH NÃO é comparável entre conjuntos-de-condição distintos, §153.) **Diagnóstico: não é time nem dica — é o RELÓGIO.** O time resolve em 31 lances, mas isso passa de 12 turnos contra este trio (mais tanque que o do dionisio/boto). **(3) tempo** — busca do relógio honesto mais apertado: deadline 13 = INDETERMINADO (melhorH 42, dica); **deadline 14 = VENCÍVEL, 29 lances, SEM dica** (16/18 idem, com folga). deadline 12→**14**.

**A correção é afrouxar o RECURSO (turnos), DECLARADA — é a lição do poseidon, não a do saci.** O poseidon fechou pelo TIME certo (§152: dica era muleta); aqui o time JÁ é certo (denega+mata) e o único recurso escasso é o turno. Afrouxar o relógio +2 é legítimo (§149: afrouxar o RECURSO que a condição consome ≠ afrouxar a CONDIÇÃO disfarçada de setup) porque a leitura+isolamento provam que o gargalo É o tempo, não uma condição incoerente. **Deadline por-puzzle, não por-lote: o dono já fixou que "o deadline é pressão universal, não a essência" (§152); dionisio/boto em 12 e khonshu em 14 é o clock tunado por dificuldade do set, coerente.** Carimbado: VENCÍVEL, 29 lances, `comDica:false`, hash 845c65c9. (Override do dono possível: manter 12 e trocar por um trio mais leve — mas isso PIORA a coerência, o set denso é o design; recomendo o 14.)

**EXU sai do lote 2: FLAVOR ≠ RIDER (dono).** O exu tem a negação TRIVIALMENTE satisfeita (o espelho do saci pegou na 1ª aplicação do enemy-set-primeiro): o set não é levado a usar a ação negada, então "negar" não define vitória — é FLAVOR (descreve o que acontece), não RIDER (define a vitória). O rider REAL do exu é uso-count (`usarSlotProprio` — quantas vezes o exu usa o próprio slot), forma da Camada C. **Distinção registrada: uma cláusula pode ser FLAVOR ou RIDER; só a segunda vira predicado.** exu → lote 6.

**Sinal mais confiável dos três (dono, §153 ponto 2): `orcamento` com melhorH BAIXO apareceu duas vezes (boto, e o saci a 250k) — mas o saci desmentiu que "baixo+orcamento" garanta fecho (virou dica a 500k).** Refinamento: `orcamento`+melhorH-baixo é o sinal mais PROMISSOR, não uma garantia; conclusivo só após esgotar o orçamento (§153). O khonshu reforça: melhorH 18 `dica` estável 250k→500k = platô real, e a saída foi medir o relógio, não subir orçamento.

---

## §153 — VARREDURA DO ROUBO (antes do saci): 2+2 consumidores, e o tag PRECISA distinguir roubo de remoção.

**Hipótese a acompanhar (dono), não conclusão: nas 2 Provações difíceis do lote 1, a correção certa foi TIME (2 de 2).** dionisio (control-pesado) e poseidon (atacante) fecharam por composição, nenhuma por dica. Se o padrão se repetir nos próximos lotes, "dica" é recurso quase-nunca-usado — e o SISTEMA DE DICAS do produto talvez não precise existir. Acompanhar; decidir quando houver mais casos.

**A varredura do CONCEITO (§143 — li a condição, não a palavra: "roube/drena/toma/tira", e separei obstáculo de objetivo).** Das 91, 17 tocam orbe/buff/roubo; a maioria é obstáculo ou outra fonte. As que o WIN exige como acúmulo de ROUBO:
- **`orbesRoubados` (roubo de orbe PARA si, cumulativo) — 2 consumidores:** shutendoji (≥8 via Torpor, 12 turnos) · saci (≥5). ≥2 → construir é justificado (§87).
- **`buffsRoubados` (roubo de buff PARA si) — 2 consumidores, MAS de leituras diferentes:** saci (≥3, CUMULATIVO) · loki (≥6 DE UMA SÓ VEZ — por-EVENTO, não soma). O tag conta; o predicado lê cumulativo (saci) ou pico-de-evento (loki). ≥2 → justificado, com dois leitores.

**PONTO 3 (dono) — SIM, o tag TEM de distinguir ROUBO de REMOÇÃO, nos dois eixos.** A varredura achou consumidores de REMOÇÃO (tirar do alvo, não levar para si) que um tag ingênuo contaria errado como roubo:
- **buffs REMOVIDOS (não roubados) — 2 consumidores:** yamatotakeru (Ceifa-Ervas remove ≥3 buffs do alvo) · iansã (remover TODO buff dos 3 antes da 1ª queda). `stripBuffs`/`stripOne` sem `rouba` — se `buffsRoubados` contasse toda remoção, essas inflariam o saci/loki. O tag precisa marcar `rouba:true` (foi para o lançador) ≠ remoção pura.
- **orbe PERDIDO para roubo inimigo — 1 consumidor:** heimdall ("sem perder um orbe PARA o inimigo") — precisa distinguir orbe perdido por ROUBO inimigo de orbe GASTO (custo). Sem o tag, gasto e roubo se confundem no log (§106: a info existe no ato do roubo, não no evento hoje).

**CONCLUSÃO (dois-ledgers §104): o tag nasce com a distinção COMPLETA, não um contador simples.** O evento de orbe/buff deve carregar (a) a AÇÃO — roubo-para-si × remoção-pura — e (b) a DIREÇÃO — quem roubou de quem. Assim UM design de tag serve os quatro: `orbesRoubados` (roubo-p/-si), `buffsRoubados` (roubo-p/-si, cumulativo E por-evento), buffs-removidos (remoção), orbe-perdido-a-roubo (direção inimigo→jogador). Construir o contador simples agora seria o erro do §104 (campo que nasce cego a metade dos consumidores). **Números na mão do dono para decidir "tag agora × saci espera": orbesRoubados 2 · buffsRoubados 2 (1 cumulativo + 1 por-evento) · +2 de remoção-de-buff · +1 de perda-de-orbe — todos servidos por um tag com ação+direção.** (Fontes vizinhas já cobertas, fora do escopo do tag: inari=`orbesGuardados` (feito), khnum=`danoAbsorvido` (feito), brahma=`danoBonus`.)

**TAG CONSTRUÍDO (dono autorizou) + o SACI expôs um MONTAGE ERROR no lado do INIMIGO.** O tag entrou no motor (`perdeuLado`/`ganhouLado`/`qtd` em roubaOrbe×2, stripOne, stripBuffs — que era junta-não-ligada, não logava — e realoca); `acumuladoDe` implementa `orbesRoubados` e `buffsRoubados`; verificado ao vivo (Travessura do Saci → orbe events `ganhouLado:0`, `orbesRoubados` conta). **Mas ao escrever o saci, o método isolamento-primeiro pegou o que a leitura de kit confirmou: os inimigos da prosa (horus·houyi·boitata) NÃO aplicam NENHUM buff — nem habilidade, nem passiva.** Logo `buffsRoubados:3` é IMPOSSÍVEL: não há o que roubar. (Irônico: a passiva do Hou Yi PREMIA bater em inimigo com buff — buff é o tema, mas o set não produz nenhum.) O composto sai INDETERMINADO (o orçamento mascara a impossibilidade: matar os 3 com a condição pendente = derrota, então não há linha vencedora). **É o mesmo padrão do dionisio (comeca:0), agora no eixo INIMIGO: um setup que torna a condição impossível antes da 1ª ação — montage error, não dificuldade.** O tag/predicado está CERTO; a Provação é que é incoerente (condição pede buffs, set não os produz). Correção = decisão do dono (§149, eixo inimigo): (a) o set precisa de um gerador de buff (mantém "3 buffs", torna a condição possível — coerência, não afrouxar) OU (b) mudar a condição. Secundário, a re-diagnosticar DEPOIS do set: o isolamento do saci deu 44 (o time saci·zeus·hermes também estanca — findability/time). **Regra registrada: um rider de roubo/remoção só é coerente se o alvo PRODUZ o recurso. Generalização (dono): TODA condição que CONSOME algo do inimigo exige que o set inimigo o GERE** — senão a condição não é difícil, é VAZIA (o isolamento-por-fonte a distingue de um puzzle duro: se o recurso nunca aparece, o composto nunca progride nessa fonte).

**RESOLUÇÃO DO SACI (dono: OPÇÃO 1 — BRAHMA no lugar do boitatá).** A "Quatro Faces" do Brahma é dmgUp permanente/acumulável — gera buff todo turno (há o que roubar, sustentado); e roubar o buff do Brahma TIRA o dmgUp dele → o roubo vira ofensivo E defensivo (bom design caindo do conserto de coerência), e mantém o Hou Yi coerente (a passiva dele premia bater em inimigo com buff — agora o set tem buffs). O método, na ordem: **enemy-set (Brahma)** → coerência (buffsRoubados atingível; delta caiu de impossível p/ ~7). **isolamento 68 (alto) → TIME** (troca hermes→susanoo, atacante Tempestade, mantém energia todo-Tempestade) → **isolamento VENCÍVEL**. Composto sobra em melhorH 8, `dica` — tensão ROUBO×ABATE (susanoo mata antes de saci roubar 5 orbes+3 buffs); é a economia-de-ação (§152 4ª cat.) entre dano e roubo. `["passar"]` não fecha (8→6). **deadline 9→12 (o RECURSO que roubar-enquanto-abate consome, §152, dono confirmou): melhorH 8→3.** MAS o 3 é PLATÔ, não orçamento: a 250k parecia `orcamento` (progredindo), a 500k travou em 3 (`dica`, estagnado 256k nós). **LIÇÃO: `orcamento` num orçamento pode virar `dica` num maior — o platô só se revela com mais nós; não prometer "fecha com orçamento" a partir de um único ponto.** Dicas tentadas ao platô-3 (todas param em 3): `["passar"]`, Redemoinho×2, Redemoinho×3. saci fica em melhorH 3 com TODAS as alavancas aplicadas (enemy-set, time, deadline, dica) — é o LIMITE DE FINDABILITY do solver, não coerência/time (esses fecharam). É jogável (3 de solved) mas sem caminho PROVADO. **DECISÃO DO DONO: (b) buffsRoubados 3→2. MAS não fechou — e a MEDIÇÃO desmentiu o meu diagnóstico (erro meu, registrado).** buffsRoubados 2 @800k: ainda melhorH 3. Eu havia dito "o gargalo é o 3º buff via Redemoinho atrasado" — por RACIOCÍNIO, não medição. **A ISOLAÇÃO POR FONTE (a que eu devia ter rodado primeiro) prova o contrário:** só-buffsRoubados(3) = **VENCÍVEL** (17k nós, buff é trivial); só-orbesRoubados(5) = melhorH 3 (dica) — **o gargalo é o ORBE, não o buff.** Revertido buffsRoubados a 3 (o 2 foi afrouxar sobre diagnóstico errado — a causa nomeada estava errada, então o afrouxamento não valia). **LIÇÃO (padrão novo): diante de um composto travado com ≥1 rider, ISOLAR CADA FONTE separadamente, não só o composto vs o deadline — o composto some as fontes e a leitura vai para a errada (§104 dois-ledgers no diagnóstico: mede cada uma).**

**O gargalo REAL do saci: orbesRoubados, e ele afrouxa LINEAR mas NÃO FECHA.** orbesRoubados 5→melhorH 3, 4→2, 3→1 (cada −1 orbe = −1 melhorH, sempre `dica`, nunca VENCÍVEL). Causa: a Travessura rouba 2 orbes (cd 4); a melhor linha do solver dispara UMA Travessura (2 orbes) antes de zeus/susanoo matarem os inimigos — roubar mais exige inimigos VIVOS por mais turnos, o que briga com abater no prazo. **É a tensão roubo×abate no fundo, não uma janela estreita.** Afrouxar o número ajuda proporcionalmente mas o platô de findability persiste (o solver não acha a linha de 2+ Travessuras). saci = WIP, sem carimbo, condição ORIGINAL (5 orbe + 3 buff). **Ao dono (§149), com o gargalo agora CERTO (orbe):** (a) orbesRoubados 5→2 (uma Travessura — afrouxar grande), (b) time com 2º ladrão de orbe (troca dano por roubo — a tensão), (c) dica pace-and-steal, ou (d) rework. Lote 1: 5/6 carimbadas; saci é o mais duro do jogo (roubo-enquanto-abate).

**LIÇÃO REGISTRADA (dono) — o sinal `acionavel` NÃO É ESTÁVEL: `orcamento` num orçamento pode virar `dica` num maior.** Ele descreve o que a busca vê no TETO ATUAL, não a natureza do problema. Consequência: **`orcamento` só é conclusivo DEPOIS de o orçamento ser esgotado; antes disso é hipótese.** Foi assim que o boto fechou (era mesmo orçamento) e o saci não (o "orcamento" a 250k era platô a 500k). Corrige o §152: ao ler `(acionavel, melhorH)`, `orcamento` é provisório até um orçamento maior confirmar.

---

## §152 — F2.4 (lote 1): a forma real é o RIDER, não o relógio (§46 no nível da FASE). Time é design. E o 1º INVENCÍVEL estrutural.

**A CORREÇÃO, com a consequência (a pedido do dono).** Eu organizara os 6 lotes pelo que APARECE na condição; o discriminador certo é o que a DEFINE. O **deadline é pressão universal** (o anti-estol de quase toda Provação), não a essência. Traduzindo as 15 "limite de turnos" (§124, antes de escrever): só **6** têm o relógio como espinha com rider já suportado; nas outras **9** o rider É a forma (perseu=controle, heimdall=roubo-de-orbe, huangdi=recarga, nefertem=debuff-uptime, kali=cura-negada, izanagi=morte-por-DoT, kraken=abate-por-slot, exu=uso-contado, kukulkan=condicional-por-ação). É o **§46 no nível da fase**: agrupar por sintoma (o turno que aparece) esconde a forma (o rider). **Consequência:** a forma real de uma Provação é o rider; isso REORDENA os 6 lotes — o dono refaz o sequenciamento. Escopo do lote 1 travado: as **6** (Camadas A+B); as 9 vão para o lote da forma-rider de cada uma (construir predicado fora da varredura da sua forma seria construir a forma no lote errado).

**Time aliado é DESIGN, não catálogo (decisão do dono, registrada).** A planilha nunca teve o time do jogador — só o deus-título e os inimigos. A partir de agora o time é **parte da especificação da Provação**. Regras: (a) o deus-título SEMPRE joga (é a Provação dele); (b) os 2 companheiros tornam a condição ALCANÇÁVEL, sem carregar o puzzle — o deus-título é o protagonista da solução; (c) a composição vai no relato, com o motivo em 1 linha (discordância é troca barata).

**As 3 ambiguidades, decididas pelo dono:**
- **perseu: "petrificado" não existe** no motor. A Medusa aplica `atordoado`, e o §54 já decidiu Petrificar ≡ atordoado. A condição é "nenhum aliado atordoado ou selado". **Sinônimo de prosa, não status novo.**
- **izanagi: "morrer de DoT"** → use "morreu CARREGANDO DoT" (o que a `queda.estados` já traz). §106: não inventar rastreio de causa-da-morte antes de provar que o existente não serve; se uma Provação futura exigir a causa de verdade, a informação nasce com consumidor.
- **kraken: "golpe final" precisa do SLOT do abate.** A `queda` tem `matador` (§145), não o slot. **É BARATO:** `bater` já tem o `slot` em escopo (engine.js:830); passá-lo a `matar` e gravar `queda.slotAbate` é o mesmo padrão do `matador`. Logo o Kraken NÃO espera por custo — espera só por ser Camada C (forma-rider). Quando o lote da forma "abate-por-slot" chegar, o campo entra barato.

**LOTE 1 — as 6, montadas com HP padrão (120, sem afrouxar, §149). Taxa e padrão do `acionavel`:**
| Provação | time (deus-título + 2) | veredito | nós/ms | acionavel |
|---|---|---|---|---|
| apolo | apolo·zeus·ares | **VENCÍVEL** | 22127 / 9,8s | — |
| bragi | bragi·zeus·houyi | **VENCÍVEL** | 83 / 75ms | — |
| poseidon | poseidon·iara·sobek | **INDETERMINADO** | 200k / 72s | **dica** (melhorH parou em 37) |
| boto | boto·tsukuyomi·iansa | **INDETERMINADO** | 200k / 126s | **dica** (melhorH parou em 136) |
| dionisio | dionisio·anubis·iansa | **INVENCÍVEL** | 38 / 55ms | (exaustão real) |
| saci | — | (pendente: `orbesRoubados`/`buffsRoubados` precisam de impl em `acumuladoDe` + tag de log §106) | | |

**Taxa (5 de 6 rodadas): 2 VENCÍVEL · 2 INDETERMINADO · 1 INVENCÍVEL.** Sinal de calibração p/ os outros 5 lotes: uma Provação em ~2,5 exige o dono. **Padrão do `acionavel`: os DOIS INDETERMINADO são `dica`, nenhum `orcamento`** — confirma a hipótese aberta na F2.1 (§148): algumas das 91 são puzzles que ninguém acha sem dica; não é o solucionador faltando nós.

**O 1º INVENCÍVEL estrutural — e ele não é budget (§148: INVENCÍVEL só por exaustão real, nunca por orçamento).** `dionisio` (deadline 12 + `negarAcaoInimigo` milagre) esgota em 38 nós: com `comeca:0` o INIMIGO recebe **3 de energia no turno 1** (abertura 1/3) e a IA gulosa lança `ra/milagre` no turno 1 — o jogador (1 de energia, joga antes) não tem como travar os 3. A condição "nenhum inimigo usa Milagre" é impossível quando o inimigo pode Milagrar no turno 1. **`comeca:1` (inimigo abre com 1 de energia, não 3) remove o Milagre-turno-1** — e `comeca` é ALAVANCA DE SETUP (iniciativa), NÃO afrouxar (§149 lista orbes/HP/turnos/inimigos, não quem abre). Decisão do dono pendente: `comeca:1` é o setup correto das Provações de negação, ou é afrouxar disfarçado? (Vale p/ dionisio E boto.)

**— RESOLUÇÃO (decisões do dono aplicadas) —**

**PRINCÍPIO travado (dono): setup que torna a condição impossível ANTES da 1ª ação do jogador é ERRO DE MONTAGEM, não dificuldade — corrigi-lo é OBRIGATÓRIO, não opcional.** A §149 fala de HP/orbes/turnos/inimigos porque essas mudam o QUANTO o puzzle exige; `comeca` muda se ele é sequer COERENTE. "Nenhum inimigo usa Milagre" com o inimigo abrindo com 3 de energia é auto-contraditória. `comeca:1` aplicado a **dionisio E boto**.

**DICA = semente de sequência (mecanismo novo no solucionador, §149).** `prov.dica` = prefixo de lances forçado a partir da raiz (por CHAVE de deus, legível/estável; `"passar"` encerra o turno), aplicado ANTES do best-first. É o "dar dica" (≠ afrouxar): não muda HP/orbes/inimigos, só ancora a abertura que o jogador teria de descobrir. O carimbo grava `comDica:true`. O caminho carimbado começa pela dica.

**Verdictos finais das 6 (HP padrão, sem afrouxar):**
| Provação | setup | veredito | como fechou |
|---|---|---|---|
| apolo | comeca:0 | **VENCÍVEL** carimbada | direto (22127 nós) |
| bragi | comeca:0 | **VENCÍVEL** carimbada | direto (83 nós) |
| **poseidon** | comeca:0 + **dica** | **VENCÍVEL** carimbada | dica (iara Canto Suave→kagutsuchi · passar · poseidon Tridente→mulasemcabeca+hercules) → 90k nós, comDica:true |
| **boto** | **comeca:1** | **VENCÍVEL** carimbada | só o fix de setup: distância 136→**2** (acionavel `dica`→`orcamento`), 400k nós, comDica:false |
| **dionisio** | **comeca:1** | **INDETERMINADO/`dica`** | fix removeu o INVENCÍVEL (agora coerente), mas estagna longe (melhorH=167) — decisão do dono pendente (dica/time/afrouxar) |
| saci | — | segurado (dono) | fontes `orbesRoubados`/`buffsRoubados` + tag de log §106 aguardam varredura própria |

**A lição do boto (registrada): `comeca:1` não só tornou coerente — quase resolveu.** A distância caiu de 136 p/ 2 e o `acionavel` VIROU de `dica` (estagnado) p/ `orcamento` (progredindo) — prova de que o 136 era o setup incoerente, não puzzle difícil. dionisio, mesmo fix, seguiu em `dica`/167: mesma condição, times diferentes — o time do dionisio controla mas não fecha o dano. (O `acionavel` distinguiu os dois casos sem eu adivinhar.)

**PRINCÍPIO DIAGNÓSTICO (dono) — o par `(acionavel, melhorH)` diz QUAL classe de problema é, ANTES de qualquer decisão.** O `acionavel` provou ser DIAGNÓSTICO, não rótulo. Três leituras, três correções DIFERENTES:
- **melhorH ALTO + estagnado (`dica`) → o TIME não fecha** (falta dano) → correção = **design de time** (troca um enabler por atacante). Dica não resolve falta de dano.
- **melhorH BAIXO + progredindo (`orcamento`) → só orçamento** → correção = **mais nós** (boto: melhorH 2, resolveu com 400k).
- **melhorH MÉDIO + estagnado (`dica`) → o caminho existe e é difícil de achar** → correção = **dica** (poseidon: melhorH 37, semente de sequência).

Antes disso a régua era só "afrouxar × dica" (§149), pobre demais — não separava "o time não fecha" de "difícil de achar". O par `(acionavel, melhorH)` faz essa triagem e vale nos outros cinco lotes: LER o par antes de escolher a correção.

**A QUARTA categoria (dono) — ECONOMIA DE AÇÃO — que a tríade não cobria.** Não é caminho (dica), nem time (design), nem orçamento (nós): é **a condição exigindo mais ações do que o turno oferece.** O MÉTODO que a revela (experimento controlado, não sintoma): **rodar a MESMA montagem SEM o rider e comparar o melhorH** — a diferença é o PREÇO do rider em dano-não-feito. No dionisio: só deadline → melhorH 20; deadline + negar-Milagre → 115; **o rider custa ~95** (negar 3 Milagres/turno prende 2 das 3 unidades em controle, sobra 1 atacante p/ 360 HP). Reusável, e provavelmente reaparece: **toda condição de NEGAÇÃO cobra economia de ação** (o jogador gasta ação em impedir, não em vencer). A correção NÃO é dica nem time — é dar mais do RECURSO que a condição consome (ver a distinção abaixo).

**DISTINÇÃO travada (dono) — afrouxar o RECURSO × afrouxar a CONDIÇÃO disfarçada de setup.** Afrouxar o recurso que a condição CONSOME é legítimo; afrouxar a condição vestida de setup é o que a §149 vigia. No dionisio (deadline 12→15): **turno é RECURSO** — a condição é de malabarismo, e malabarismo precisa de turnos; dar turno não torna o puzzle fácil, torna-o EXECUTÁVEL (o oposto de disfarçar). Recusei a alternativa "trocar 1 inimigo que Milagra por um que não Milagra": o **número de inimigos capazes de Milagrar É A CONDIÇÃO** — "nenhum inimigo usa Milagre" contra 2 que podem é uma condição MAIS FRACA disfarçada de mesma condição, exatamente o afrouxamento-invisível do §149. Régua: identificar, para cada rider, qual é o recurso que ele consome (turno, orbe, ação) — esse pode ser afrouxado; a definição da condição, não.

**A CORREÇÃO DO MÉTODO (dono nomeou o próprio erro): RODE O ISOLAMENTO PRIMEIRO, sempre.** Eu diagnostiquei o dionisio DUAS vezes do sinal errado — "o time não fecha" (167) e depois "economia de ação" (o imposto de 95) — e nas DUAS o experimento de isolamento já tinha a resposta. O melhorH do COMPOSTO mede duas coisas somadas (corrida de dano + imposto do rider); ler dele é ler a errada. **O isolamento é o único sinal que o rider não contamina.** A tríade fica reordenada, com o isolamento como PRIMEIRO passo diante de QUALQUER INDETERMINADO (não último recurso — custa 1 rodada e evita as correções erradas):
1. **RODE O ISOLAMENTO** (a mesma montagem SEM o rider) ANTES de qualquer diagnóstico.
2. **isolamento BAIXO + composto ALTO → findability (dica)**; o delta é o imposto do rider (dionisio: iso 20, comp 115 → imposto 95, mas o problema É achar).
3. **isolamento ALTO → o time não fecha (design de time).**
4. **progredindo (`orcamento`) → só orçamento (nós).**

**Insight do dionisio — numa condição de NEGAÇÃO, uma dica AGRESSIVA provoca a própria ação negada.** A 1ª dica (burst em ra: Pesagem 25 + Taça 10) deu INVENCÍVEL em 2 nós — mas o estado pós-dica é `andamento` (verificado à mão), não perdido. A causa: ferir ra faz a IA gulosa inimiga preferir o Milagre (cura/retaliação com aliado ferido) → `negarAcaoInimigo` falha. **A dica de um puzzle de negação tem de PRESERVAR o motor de negação (controle/orb-starve primeiro), não bater** — bater cedo provoca o Milagre que se quer impedir. dionisio segue aberto: o isolamento diz que o caminho existe (findability), mas a dica que o ancora tem de ser control-first, e o Êxtase (controlado não gera orbe) é o eixo. Autoria da dica pendente.

**GENERALIZAÇÃO (dono) — regra de DESIGN, não caso do dionisio: numa Provação de NEGAÇÃO, a agressão é ANTI-SINÉRGICA com a condição.** Bater cedo CONVIDA a ação negada (a Brahma cura quando um aliado está ferido → o burst provoca o Milagre que a condição proíbe). Vale para toda "nenhum inimigo usa X" — e para o boto (mesma condição). A dica de negação ancora o EIXO (control/orb-starve), não uma sequência: a robusta é a **abertura mínima** — `["passar"]` no turno 1 (não agredir) + o 1º controle que a energia pagar — em vez de lances fixos (que dependem do sorteio). §46 do próprio projeto: forçar o mínimo, não a sequência.

**PERGUNTA DE DESIGN (dono) — separada da técnica, a tratar mesmo se solucionável.** Se a agressão convida o Milagre e o motor de negação (Bacanal) é mid-game, a condição "nenhum inimigo usa Milagre em 12 turnos" pode exigir **passividade longa** — tecnicamente certa, ludicamente ERRADA (puzzle chato de jogar). Gatilho: se o dionisio só fechar jogando passivo ~6 turnos, o dono prefere **REESCREVER a condição** a carimbá-la. A solucionabilidade não basta; a jogabilidade da linha-solução conta. (Aplica-se a qualquer Provação de negação cuja única linha seja esperar.)

**DUAS TENTATIVAS DE DICA (cap do dono), esgotadas — dionisio PARA e volta ao dono.** (1) `["passar"]` (não agredir no T1): melhorH 115→**81** — a passividade AJUDA (confirma o control-first). (2) `["passar", dionisio Bacanal]` (ancorar o motor de negação no 1º turno pagável): **INVENCÍVEL por exaustão** (53k nós) — forçar o Bacanal no T2 FECHA o caminho de vitória. Leitura: a melhor âncora é a passiva pura (81), e qualquer compromisso de ação (agredir OU gastar o Bacanal cedo) piora ou mata. Isso é EVIDÊNCIA a favor da pergunta de design: a linha viável do dionisio (se existe) é passiva e provavelmente chata. Dica revertida; dionisio segue aberto e **é decisão do dono reescrever a condição** (a passividade-como-única-linha é o sintoma que ele nomeou). Não itero mais às cegas (regra do cap).

**O BOTO REFUTA A PERGUNTA DE DESIGN (dono retira a preocupação) — e nomeia o erro real.** O boto tem a MESMA condição e fechou VENCÍVEL com linha ATIVA (29 lances, sem dica), só com `comeca:1`. Logo negação NÃO é inerentemente passiva/chata. A causa do dionisio foi a INSTRUÇÃO: **trocar controlador por atacante numa condição que PEDE controle.** O erro nomeado (dono): diagnostiquei "o time não fecha por falta de DANO" quando o certo era "o time não NEGA por falta de CONTROLE" — li o melhorH alto como déficit de dano, e o déficit era de negação (o rider, não o objetivo). **LIÇÃO: numa condição de negação, o melhorH mede o HP RESTANTE, então SEMPRE parece déficit de dano — é o pior sinal possível para diagnosticar um problema de CONTROLE, e é exatamente por isso que o isolamento vem primeiro** (o isolamento sem o rider teria mostrado que o dano estava perto — 20 — e que o buraco era a negação). Correção: time control-pesado espelhando o boto (dionisio·tsukuyomi·iansã), UMA tentativa (cap do dono); se fechar, carimba; se não, a Provação tem problema próprio e o dono reescreve. **RESULTADO: VENCÍVEL, 26 lances, SEM dica** (28k nós) — o diagnóstico do dono estava certo: era o TIME, não a dica. A negação fecha ativamente com o time certo (o mesmo tipo do boto). dionisio carimbado. **Lote 1: 6/6** (menos o saci, segurado).

**PERGUNTA RESPONDIDA — "precisa de dica" ERA "o time está errado" (poseidon).** O dono mandou resolver a assimetria (dionisio corrigido pela raiz/time, poseidon pela fácil/dica) antes do próximo lote. Método isolamento-primeiro: **iso (só deadline) = 37; composto (deadline+Encharcado, sem dica) = 37 → delta ZERO.** O rider Encharcado é GRÁTIS (o time todo-Maré o aplica de qualquer jeito); o 37 é dano-findability puro, não imposto de rider. E sem dica não fecha (INDETERMINADO/37). Uma tentativa (cap): troquei o guardião sobek pelo atacante **piranha** (Maré, bônus em Encharcado — mantém a sinergia de energia todo-Maré) → **VENCÍVEL SEM dica, 19 lances, 677 nós** (vs 90k com dica). **A dica do poseidon era a correção fácil; a certa era o time.** Removida a dica, re-carimbado com poseidon·iara·piranha. **NENHUMA das 6 do lote 1 usa dica** — a dica volta a ser último recurso, não segundo, e o precedente do lote fica coerente.

**REGRA DO DELTA (refina o método): o delta `composto − isolamento` é o preço do rider.** delta≈0 → o número do composto é dificuldade-de-objetivo pura (dano/findability), e a correção é time/dica (NÃO afrouxar o rider — ele é grátis). delta grande → o rider é o gargalo (dionisio: 95). O delta distingue, sem adivinhar. **Ordem de correção validada 2× (dionisio E poseidon): isolamento → TIME → dica → afrouxar.** A dica NÃO é a 2ª tentativa; o time vem antes. (Débito quitado: o mecanismo de dica segue construído e testado, mas o lote 1 o usa zero vezes — ele existe para o caso em que o time certo ainda não fecha, não como atalho.)

**REVISÃO DA EXPECTATIVA (dono): 1 decisão a cada ~2,5 Provações ⇒ 91 são ~12 sessões, não 6.** Melhor saber no lote 1. E os dois INDETERMINADO iniciais serem `dica` confirmou a F2.1 no 1º lote — **consequência de produto (o dono trata depois deste lote): se Provações exigem dica p/ serem achadas, o jogo precisa de um SISTEMA DE DICAS que não está no plano.**

**Débito de motor registrado (saci, §106): o log NÃO distingue roubo de ganho de orbe.** Antes de construir o tag (`orbe`/`efeito` com marca de roubo), VARRER quantas das 91 precisam da distinção `orbesRoubados`/`buffsRoubados` — a informação nasce com TODOS os consumidores (§104/§146), não só o saci.

**Desacoplamento de teste (§149, consequência): `solucionador.test`/`provacao.test` liam o `poseidon.json` de PRODUÇÃO como fixture.** Agora que ele é a Provação DIFÍCIL (120 HP, dica, 90k nós), o fixture tunado (60 HP, Maré=9, ~4 nós) mudou-se para DENTRO das suítes — entrada controlada, estável ao catálogo. Uma suíte de regressão que lê dado de produção quebra a cada rebalanceamento; o fixture é do teste.

---

## §151 — F2.3: o bestiário (12 criaturas PvE). Régua PRÓPRIA de tropa (teste que morde), HP do kit nos dois sentidos, e 11/11 destravadas.

**As 12 se exprimem SEM mecanismo novo — varrido contra o motor de hoje, não contra a memória (§93).** Uma achou `curaPorAlvo` (fixo, por alvo atingido, curador = atacante) na via de dmg de qualquer slot; outra reusou `imunidade a:[controle]` (Ísis), `taunt`+`shield` (Cérberus), `alvoHp{aliado,min}` (Dagda), `reducao contra:{classe}` (Oni), `refleteDano`, `selado`, `lockSkill`, `seCond{alvoHp}` (Durga). Zero primitiva.

**As 3 decisões do dono, registradas:**
- **#1 Servo de Cinzas — SIMPLIFICADO a atacante puro de 12, sem a explosão-ao-cair** (§55/§87: o one-off não se justifica na tropa). **Divergência-COM-gatilho anotada:** se um DEUS futuro pedir morte→dano-no-aliado, a primitiva nasce com o consumidor certo e o Servo herda; até lá, não se inventa a primitiva para uma criatura.
- **#9 Quimera — imunidade TOTAL a controle**, não "só alvo único". Registrado como **aproximação-para-cima, na mesma família do cleanse total da Nüwa/Ísis**: a peça exata (imune só a controle de alvo único) não existe e não vale um mecanismo; a aproximação mais forte é a honesta. Resto do kit conferido — não ficou forte demais (130 HP, 3×6 no básico, 15 em área).
- **Tropa tem RÉGUA PRÓPRIA, não isenção.** "Tropa não é auditada" era o buraco; "básico de tropa até 20, habilidade até 25" é uma régua. Dano só (cura/escudo não auditados, espelha o auditor de deus). Milagre: tropa não tem.

**O teto: 20/25, e por que NÃO 18/24 (colado nos máximos).** Os máximos reais são básico 18 (Ghoul condicional / Quimera 3×6) e habilidade 24 (Ceifador). O dono recusou a régua colada: **"régua que quebra com um ponto de balanceamento não é régua, é fotografia do estado atual"** — 18/24 reprovaria o primeiro +1 num Ghoul/Quimera/Ceifador. 20/25 dá 2 de folga e iguala o teto de habilidade do deus (uma habilidade de tropa nunca supera a de um deus).

**A régua é TESTE QUE RODA, não comentário (exigência do dono).** Mora em `tests/bestiario.test.js`, no `npm test`, e **morde de verdade**: uma criatura inventada com 25 no básico é REPROVADA pelo mesmo auditor que aprova as 12 (prova negativa no teste). "Se não está na suíte, não existe" — régua declarada em comentário é o buraco de novo. (O schema do bestiário é validado na build, `build.js §3-bis`; a régua de balanceamento é da suíte.)

**§115 ESTENDIDO (a pedido do dono):** eu havia marcado o lifesteal do Ghoul como "micro-decisão em aberto" (achava que só existia `dreno` = lifesteal total, sem gatilho `aoAtacar`). Era falso: `curaPorAlvo` já existia. **Alegação de "isto está EM ABERTO" precisa de verificação tanto quanto a de "isto EXISTE".** O §115 dizia "não verifique estrutura relendo a mesma estrutura"; o corolário é que um "está aberto" herdado de resumo é uma alegação sobre o motor, e alegação sobre o motor se confere no motor.

**HP do kit atravessa TODA unidade — provado nos dois sentidos no mesmo commit (§134).** `novaUnidade` lê `g.hp || 120`. O default `|| 120` é o que segura o outro lado: os 100 deuses (nenhum declara `hp`) nascem 120, `fracoes.test` não se moveu; a criatura com `hp` nasce com o dela (65..180). Campo que atravessa exige os dois lados provados juntos, não o novo sozinho.

**Integração: `catalogoProvacao()` = deuses ∪ bestiário.** `montarProvacao` passa o merged a `novoEstado` (inimigo-criatura nasce com o hp dele) e aceita **override de `maxHp`** (CHEFE = deus do roster + 200-300; `maxHp` antes do `hp`, senão o hp nasceria acima do teto). `catalogoHash` e o carimbo do solucionador passam a usar o merged — **o hash tem de ver o que o jogo roda** (§150): um bestiário fora do hash deixaria criatura rebalanceada passar em silêncio.

**11 de 11 destravadas — nominalmente, e sem sobra (§46: varrer a família antes de concluir).** As 11 que dependiam do bestiário: **ares · bennu · boitata · bragi · durga · hercules · kraken · mulasemcabeca · perseu · tanuki · ymir**. Bennu (Ceifador·Ghoul·Servo) e Tanuki (Vidente·Silfo·Quimera) — as duas que o dono apontou — destravam com as decisões tomadas. **Cross-check rigoroso:** cada nome de inimigo dos 91 conferido contra os 100 deuses ∪ 12 criaturas → **0 nomes não reconhecidos** (nenhuma 13ª criatura escondida, nenhum vazamento). Os 12 são exatamente os citados; não sobra criatura nem sobra Provação. (A varredura por palavra pegava 14 — kagutsuchi/aokuang/chaac eram falso-positivo por "Chama" o ELEMENTO, não a criatura; §46-homonímia de novo.)

---

## §150 — F2.2: a IA por níveis. A Provação pina no 'normal'; a trava é IDENTIDADE (build FALHA na divergência).

**Correção de vocabulário (registrada a pedido do dono):** o dono disse "previsível"; a propriedade exata é **DETERMINÍSTICO**. Forte-e-determinístico preserva o carimbo; fraco-e-aleatório não. A palavra certa muda o invariante: não é "a IA tem de ser fácil de prever", é "a mesma posição decide o mesmo lance, sempre".

**Mas o argumento DECISIVO não é o determinismo — é a IDENTIDADE (o dono afiou):** o solucionador tem de verificar contra o MESMO oponente que o jogador enfrenta. Se divergirem, o carimbo não é garantia, é aposta. Determinismo é necessário; identidade é o que torna o carimbo uma prova.

**Invariante travado (mais forte do que eu propus):** não basta o nível ser determinístico — o nível VERIFICADO tem de ser IDENTICAMENTE o que o jogo roda naquela Provação. O `verificacao.nivelIA` é o contrato, e a **build FALHA** (não avisa) se uma Provação declarar `nivelIA` ≠ o carimbado. **Aviso serve para carimbo velho** (hash — kit mudou, re-solver); **identidade divergente é MENTIRA** (o carimbo garante contra um oponente que o jogo não roda), e mentira falha. (`build.js §3d`: hash divergente → ⚠ aviso; nivelIA divergente → `exit 1`.)

**Decisão 1 — a Provação pina no 'normal' (a gulosa); a dificuldade vive no estado+condição, nunca na força da IA.** A dificuldade já tem duas alavancas melhores (estado inicial e condição) e uma terceira que o dono acrescentou: **a Provação ENSINA a pilotar o deus** — um oponente que joga diferente a cada nível ensinaria coisas diferentes, contradizendo o propósito.

**Decisão 2 — os níveis são para o JOGO NORMAL e a ARENA; Ordália não escala IA.** `NIVEIS_IA = [facil, normal, dificil]` em `src/ia.js`, todos determinísticos: **nenhum `Math.random`, nenhum corte por tempo** (corte por tempo é não-determinismo disfarçado — a mesma posição decide diferente conforme a máquina). `facil` = só o Básico; `normal` = a gulosa de 1 lance (histórico); `dificil` = gulosa com 2-ply DENTRO do turno (soma o melhor lance seguinte do próprio lado, sem modelar o oponente).

**Custo medido (`ia.test` por nível, 30 partidas IA×IA):** facil 547ms · normal 781ms · **dificil 2545ms (~3,3× normal)**. O 2-ply é branching² por lance → afordável para um turno interativo de CPU (o humano espera entre lances), mais pesado para a arena em lote (medir se a Fase 3 depender). Sem `Math.random`, sem corte por tempo.

**Ressalva com GATILHO DE REVISÃO (a pedido do dono):** "jogável porque o oponente é cego" (a gulosa subvaloriza setup, §141) é aceitável HOJE só porque o jogo roda a MESMA gulosa nas Provações — o exploit está legitimamente disponível ao jogador. **Gatilho:** se algum dia o CPU do jogo mudar de nível nas Provações, os 91 carimbos viram inválidos de uma vez. A trava de IDENTIDADE (build falha) é o que impede isso de passar em silêncio — quem mudar o nível de uma Provação sem re-carimbar quebra a build.

---

## §149 — AFROUXAR × DAR DICA: as duas correções de um INDETERMINADO são diferentes, e uma é balanceamento disfarçado.

**O risco, com nome (a pedido do dono, porque volta 91 vezes).** Quando uma Provação sai INDETERMINADO, há DUAS correções, e elas não são intercambiáveis:
- **AFROUXAR o estado inicial** (mais orbes, menos HP inimigo, inimigos mais fracos, mais turnos) → torna o puzzle **mais fácil**. É **balanceamento disfarçado de correção técnica**: parece "fazer o solucionador achar", mas mudou o QUE o puzzle é.
- **DAR UMA DICA** (uma sequência-semente, uma poda específica) → torna o caminho **achável sem mudar o puzzle**.

**Por que afrouxar é perigoso:** ele SEMPRE funciona (basta enfraquecer o suficiente) e é **invisível no relatório** (o veredito vira VENCÍVEL, ninguém vê que o puzzle encolheu). Se ninguém vigiar, os 91 lotes convergem para **91 puzzles fáceis**, porque afrouxar é o caminho de menor resistência. É a versão-do-estado-inicial do §147 (sequência-como-prova-falsa): um caminho contra um estado afrouxado é uma garantia REAL, mas para um puzzle mais fácil do que o pretendido.

**E o `acionavel:'dica'` do §148 NÃO distingue os dois:** "heurística estagnou" pode significar "o caminho existe mas a heurística não acha" (→ dica) OU "o puzzle é quase-invencível como está" (→ afrouxar). O solucionador não sabe qual; só um humano decide.

**REGRA PARA OS LOTES (travada):** quando uma Provação der INDETERMINADO, o construtor **PARA e reporta** — o `acionavel`, o estado inicial ATUAL, e o que mudaria — e **o dono decide** entre afrouxar e dar dica. **Nunca corrigir sozinho, mesmo que a correção pareça óbvia** (a óbvia é quase sempre afrouxar).

**Nota sobre o exemplo de hoje:** o `data/provacoes/poseidon.json` é o Poseidon **TUNADO** (montar afrouxado — inimigos a 60 HP, Maré:9 — para servir de exemplo vencível), **não** a Provação do catálogo (`data/provacoes.json`, inimigos a 120 HP, que sai INDETERMINADO/dica). Quando o lote do Poseidon chegar, o estado inicial precisa ser revisto por esta regra — afrouxar vs dica é decisão do dono, não herança do exemplo.

---

## §148 — F2.1: o solucionador prova JOGABILIDADE, não solubilidade. Best-first (C); 3 vereditos reformulados.

**O número mudou o que o solucionador PROMETE (reformulação do dono).** "Sequência mais curta" e "INVENCÍVEL com razão" pressupunham EXAUSTÃO — e a exaustão não existe neste espaço. A busca exaustiva mais-curta (BFS) **diverge** já no Poseidon RASO (8 turnos): 20.000 nós → 23 s, fila 90.378 e **crescendo ~4,5× mais rápido que a expansão**. Não é lento-convergindo; é intratável. Nem o caso fácil resolve por exaustão. Então:

**O solucionador prova JOGABILIDADE — "existe um caminho de vitória contra o oponente declarado" — não SOLUBILIDADE.** É menos do que se queria e é o que a fase precisa: um puzzle sem caminho conhecido é o risco real; um cuja sequência mínima é 7 em vez de 6 não é.

**Os 3 vereditos, reformulados (travados em `tests/solucionador.test.js`):**
- **VENCÍVEL = "existe caminho, aqui está um"** — NÃO o melhor. O `verificacao.lancesNesteCaminho` é "lances até vencer neste caminho", um TETO SOLTO, não o mínimo. Sinal grosso de dificuldade (Rito que precisa de 12 lances segue suspeito), não medida.
- **INVENCÍVEL só por EXAUSTÃO REAL** — a fronteira esvaziou. **NUNCA por orçamento** (o pior erro possível: descartaria uma Provação boa). Se não dá para esgotar, é INDETERMINADO.
- **INDETERMINADO ACIONÁVEL** — o relatório diz o que faltou: `orcamento` (heurística ainda progredindo → aumentar o orçamento) ou `dica` (heurística ESTAGNOU → a Provação precisa de dica de sequência). O orçamento nunca vira veredito negativo.

**Estratégia C (best-first + exaustão-quando-cabe):** min-heap por `h = HP inimigo somado + o que falta em cada condição` (a heurística MAIS SIMPLES, como o dono pediu). Best-first acha um caminho rápido; a exaustão (INVENCÍVEL) cai de graça quando a fronteira esvazia dentro do orçamento (espaço pequeno). Poda: alvos equivalentes (chave canônica ordenada), ação-sem-efeito e estados repetidos (dedup por chave que INCLUI o progresso das condições → dedup são p/ cumulativos). Clone barato (log compartilhado, eventos imutáveis).

**Custo medido (o Poseidon, tunado p/ ser vencível — a montar faz parte do spec):** best-first resolve em **4 nós, 26 ms, heap máx 39**, caminho `Maremoto → Dilúvio → Afogamento` (3 lances, os 3 inimigos caem Encharcados). A heurística simples resolveu em 4 nós → **não sofistiquei** (o dono: "se resolver em poucos milhares, não sofistique"). No Poseidon DIFÍCIL (inimigos a 120 HP) o mesmo solucionador retorna, honestamente, INDETERMINADO com `acionavel:'dica'` (heurística estagnou em melhorH=46) — a máquina se auto-diagnostica.

**Carimbo de versão (pendente desde a F1.0a):** `verificacao:{hash, nivelIA, veredito, lancesNesteCaminho, nos, ms, caminho}` gravado no `data/provacoes/<deus>.json` via `--carimbar`. **Grava contra O QUE foi achado — hash do catálogo E nível da IA** (§: uma sequência achada contra a gulosa pode não valer contra a Difícil da F2.2). `build.js §3d` recomputa o hash e **AVISA** (⚠ banner + lista, não falha) quando diverge ou falta — a rede de regressão.

**`acumulo{fonte, limiar}` nasceu com as 9 fontes** da varredura (§146): danoAbsorvido, danoRefletido, danoArmazenado, danoBonus, contador, buffsRoubados, orbesRoubados, orbesGuardados, curaAcumulada. Modo log; fonte desconhecida recusada na build.

**A pergunta que o resultado levanta (a observar nos lotes, não responder agora):** se o espaço é grande demais para EXAUSTÃO, talvez seja grande demais para o JOGADOR achar por tentativa e erro. Se o solucionador precisar de heurística dirigida (ou de DICA) para achar o caminho, algumas das 91 podem ser puzzles que ninguém acha sem dica. O `acionavel:'dica'` já é o detector: as Provações que só resolvem com dica são as candidatas. Observar quando os lotes rodarem.

---

## §147 — A mira `distribui` na IA (§144 resolvido, antes da F2.1). A arena passa a medir 100/100.

**Feito ANTES do solucionador, e por um motivo que inverte a minha recomendação (a do dono):** eu propus construir o solucionador já e marcar os 8 times-inimigos-com-distribui como "veredito otimista". O dono recusou pelo argumento fino — **a marca protege o VEREDITO, mas não o ARTEFATO**: o carimbo de versão grava a SEQUÊNCIA no arquivo da Provação, e 8 sequências achadas contra um oponente cego viram referência guardada. **Sequência errada é pior que veredito errado — ela parece prova.** E o custo de inverter era baixo (4 kits, buraco já localizado). Registro a lição: quando a saída de uma tarefa é PERSISTIDA como referência, "marcar o resultado como suspeito" não basta — a fonte suspeita não pode ser gerada.

**A regra (o mínimo que funciona, §92 + Forma A da interface):** `iaAlvoSets` (`src/ia.js`) ganhou o caso `distribui` com os DOIS intents reais — **focar** tudo no mais fraco, ou **dividir** igual entre os vivos. Ordem = seleção (§92: o 1º leva o extra da divisão desigual; o posicional do Raijin segue a seleção) → ordeno por menor HP, o mais fraco em 1º. **No máx 2 conjuntos por ação** (1 se só há 1 inimigo) — o mínimo É a poda; não abri o espaço de subconjuntos todo.

**Custo medido:** `ia.test` ~1000ms antes → ~810–906ms depois (variância de máquina; sem regressão — distribui são 4 de 100 kits, ≤2 conjuntos a mais só neles). Confirmado ao vivo: com 3 inimigos a 8 HP, a IA escolhe Fios de Cabelo e divide 4×8 nos três (`["1-0","1-1","1-2"]`), matando os 3.

**Delta da arena (`docs/arena_pos_distribui.txt` vs `arena_pos_invocacao.txt`) — os 4 que eram invisíveis agora aparecem:** Babi 32,1→38,9 (+6,8) · Hou Yi 39,6→46,4 (+6,8) · Raijin 44,0→46,1 (+2,1) · Sun Wukong 56,3→59,4 (+3,1). **Nenhum saltou muito** (máx +6,8) — os slots `distribui` valiam ~2–7 pts que a §141 não media; nenhum kit se revela quebrado. As entradas "nunca usou" dos slots distribui limparam (Babi milagre, Hou Yi milagre, Raijin habilidade, Sun Wukong habilidade agora usados; o milagre-self do Wukong segue não-usado — é o viés-de-setup, não buraco de mira). Distribuição geral intacta: média 50,0%, desvio 14,0→13,9.

**A linha de base agora mede 100 de 100.** A ressalva do §141-A (96) está levantada — a arena da Fase 2 compara contra 100. O item da F2.2 (mira distribui antes da arena Difícil) foi cumprido aqui, adiantado porque também bloqueava as Provações.

---

## §146 — Reescritas as 4 condições de invocação (#42/56/91/96). Dois achados fora da tarefa: prosa DUPLICADA (§134) e prosa-sem-fx em campo não-varrido.

**As 4 condições que citavam invocação, reescritas** (a pedido do dono, para deixar as 91 uniformes antes da F2.1): Khnum (Couraça absorve ≥60), Kitsune (iscas→miragens), Iansã (remover todo buff dos 3 antes da 1ª queda; time trocado p/ Ogum·Susanoo·Thor), Cernunnos (Fúria reflete ≥50 e ativa no golpe final).

**Achado 1 — a prosa da condição está DUPLICADA em dois arquivos: §134 num lugar onde ninguém procurou.** A condição vive em `data/provacoes.json` (motor/catálogo) E em `src/roster_data.js` (`prov.cond`, a tela de desbloqueio). Editar só um faria a tela mostrar a condição velha e o motor a nova — **sem teste nenhum acusando**. Provei os dois lados no mesmo commit. **Campos duplicados entre os dois: 5** — `titulo↔nome`, `nivel`, `dificuldade↔dif`, `requisito↔req`, `condicao↔cond`. Só o `inimigos` é exclusivo do `provacoes.json`. Auditoria cross-file dos 91: **0 divergências** hoje (os 87 não-tocados já batiam). **Dívida com endereço:** o fix durável é um checador cross-file (como o `checar_cadeia` dos kits) que falhe a build se os 5 campos divergirem; candidato a construir quando a F2.1 gerar as 91 estruturadas (agora o risco é baixo — 0 divergências e a fonte é a mesma revisão).

**Achado 2 — o `inimigos` citava mecânica morta: prosa-sem-fx (3ª espécie, §113) num campo que a varredura de kits NUNCA olha.** A varredura de prosa-sem-fx varre os 4 slots do kit (basico/hab/milagre/passiva); **não olha descrições de Provação** (`inimigos`, `condicao`, `titulo`). Os parentéticos do `inimigos` das 4 ainda diziam "Iansã destrói invocações" / "isca" / "os três invocam". **Alcance ampliado (registrado):** a varredura de prosa-sem-fx precisa cobrir TODO campo de texto que descreve mecânica, não só os 4 slots do kit. (Varredura final pós-edição: LIMPO em todo campo dos 91, nos dois arquivos.)

**A classificação das 4 valida o fecho-por-modo ANTES do lote 1 (o teste que o dono queria com 4, não 15):** 4 condições novas → **0 modos novos**, ~6 predicados, todos DENTRO de final/log/contínuo. #42 Khnum (log: acúmulo-absorvido) · #56 Kitsune (log: usar-com-contador + contínuo: sobreviver-até) · #91 Iansã (log: estado-antes-da-queda) · #96 Cernunnos (log: acúmulo-refletido + final: buff-ativo-no-golpe-final). Nenhuma forçou um 4º modo — a aposta do §145 (forma nova cai em modo existente) confirmada.

**§46 na direção certa — #42 e #96 são o MESMO predicado (acúmulo até limiar, quantidades diferentes: absorvido × refletido).** Dois nomes, um mecanismo. Para a F2.1: um `acumulo` PARAMETRIZADO (fonte da quantidade), não dois predicados. E **varrer os 91 antes de fechá-lo** — se houver mais acúmulos (Combo, orbes roubados, cura, Podridão, Discos…), ele nasce com mais consumidores.

**Verdade mecânica do #96, confirmada no motor (a pedido do dono):** `refleteDano ∈ VOCAB.buffs`; a Ventania da Iansã (`stripOne`) o remove, e a Guardiã dos Eguns (`stripBuffs`) também. Logo "Iansã remove buffs — apaga a Fúria da Matilha" não é só explicação, é fato — e a Provação ficou MAIS coerente do que era com invocação (o antagonista tem uma interação real com a condição).

---

## §145 — F2.0: o FORMATO da Provação. Fecha por MODO (não por forma); `quando` derivado; matador/estados caem do log (§106).

**A varredura das 91 (excluídas as 4 de invocação, planilha #42/56/91/96) deu MAIS que 8 formas — ~17.** Mas elas colapsam em **3 MODOS de avaliação**, e é por MODO que o vocabulário fecha, não por forma: forma nova cai num modo existente sem tocar o avaliador. Fechar por forma seria fechar contra a superfície (o argumento do dono).
- **final** — predicado sobre o estado no fim (só julgável no fim): `hpNoFim`, sobreviventes, ≥N-orbes-no-fim.
- **log** — predicado sobre o stream de eventos (falha CEDO, quando impossível): `morteEmEstado`, `abatePeloProprioLado` (fogo amigo), `proibirSlotProprio`, `negarAcaoInimigo`, `semPerderAliado`, usar-X-vezes, acúmulo.
- **contínuo** — invariante checado a cada turno (falha CEDO, no turno em que quebra): `deadline`, uptime, evento-proibido, sobreviver-N.

**§46 na contagem de CONDIÇÕES (não de mecanismos) — registrado a pedido do dono.** O dono agrupou por SINTOMA quando o discriminador era o PREDICADO: "golpe final" ficou dentro de "acúmulo" (mas um lê *contagem corrente*, o outro lê *o último evento*); "evento proibido" ficou dentro de "sem perder aliado" (mas "sem perder aliado" é o subconjunto "nenhum aliado *morre*" de "um evento é proibido"). As duas destampadas são famílias próprias, do tamanho dos baldes médios (~9–11 cada). É o §46 num terceiro eixo: agrupar por sintoma esconde o predicado.

**`quando` (cedo|fim) é DERIVADO do modo, nunca declarado** (instr. 2): campo derivado não pode divergir do modo; declarado, poderia (mesmo princípio da faixa derivada dos pontos no ranqueado). log/contínuo → cedo; final → fim. O validador RECUSA um `quando` (ou `modo`) declarado no kit.

**§106 testado no fogo amigo e no morrer-em-estado — o log NÃO carregava, mas a informação existia (instr. 1).** O `queda` só tinha `alvo`/`execucao`. Verifiquei ANTES de inventar rastreio: (a) o **matador** já era conhecido dentro do `matar` (o §118 `abateNaoRevive` é keyed por ele) — levá-lo ao evento (`queda.matador`) faz fogo-amigo (matador e alvo no mesmo lado) cair como predicado sobre o log, zero rastreio novo; (b) o **estado-na-morte** não estava em lugar nenhum — capturei o snapshot dos status ANTES do clear (`queda.estados`), a única adição de fato nova. Os dois campos entraram no `VOCAB.camposEvento` e na gramática de eventos.

**Recusa na BUILD, não em runtime (instr. 3).** `validarProvacao` roda em `tools/build.js` (§3c): predicado desconhecido, campo obrigatório ausente, ou `quando`/`modo` declarado → `process.exit(1)`. Provado: um `data/provacoes/_bad.json` com predicado inventado quebra a build (exit 1). Uma condição que só falha quando alguém a joga é o pior caso (§71).

**`proibirSlotProprio` × `negarAcaoInimigo` são DOIS predicados, não um com escopo (instr. 4).** O primeiro lê `acao` do SEU lado; o segundo, do lado do OPONENTE. O segundo depende do que o inimigo faz — mantê-los separados no vocabulário preserva essa dependência.

**A 9ª forma é a mais interessante, e é FRÁGIL — anotado p/ re-verificação quando o solucionador rodar (a pedido do dono).** `abatePeloProprioLado` (fogo amigo, Afrodite/Curupira) é a ÚNICA condição definida por uma ação do OPONENTE — o jogador não pode garanti-la sozinho, depende de o inimigo ter alvo válido para o Encanto/Pés Virados. Consequência de desenho: se o solucionador da Fase 2 mostrar que ela é frágil, essas **duas Provações podem ser as mais difíceis das 91 sem que a dificuldade declarada (2/3) saiba disso**. Candidata a re-verificação.

**Formato:** `data/provacoes/<deus>.json` = `aliados` + `inimigos` + `montar` (estado à mão via `novoEstado` + overrides de hp/orbe/efeito/contador) + `condicoes:[{predicado,...}]`. Avaliador em `src/provacao.js` (puro sobre st + log, não toca o motor). Exemplo: **Poseidon** — `deadline` (contínuo) + `morteEmEstado` (log), dois modos num kit, resolvendo (vitória com os 3 Encharcados em ≤8; derrota-cedo com um seco; derrota no turno 9).

---

## §144 — A JUNTA-NÃO-LIGADA MORA NA IA (não só no motor): `iaAlvoSets` cega para `distribui`. A arena mede 96, não 100.

**O modo-de-errar da hipótese do Cernunnos vale registro (pedido do dono).** Apostei no reflexo; ele NUNCA disparou (a IA gulosa não lança setup). O ganho veio da passiva. **Direção certa, canal errado.** A distinção útil: **quando um kit muda em DUAS cláusulas e o número se move, atribuir a mudança à cláusula mais VISÍVEL é hipótese, não leitura.** A leitura é o **uso por slot** — o dado que a arena já coletava (`nunca usou habilidade`), que mostrou que a cláusula visível (o reflexo, na habilidade) nunca rodou. Regra: antes de atribuir um delta a uma cláusula, cheque se a cláusula foi EXERCITADA.

**A §129 (junta-não-ligada) não é só do motor — ela mora na IA também.** `iaAlvoSets` (`src/ia.js`) é o LEITOR; os tipos de alvo do kit são o ALIMENTADOR; a junta entre eles tem um vão: **`distribui` não tem caso**, cai no `default: [[]]` (alvo vazio). Cada peça, lida sozinha, está certa (a IA mira o que conhece; o kit declara alvo válido) — o defeito é a ligação. Confirmado ao vivo: `agir(...,alvos=[])` de um multi-golpe distribuído retorna `ok:true` e aplica **0 de dano** (MISFIRE) → a IA pontua delta zero → nunca escolhe. Apaga da medição os **4** kits `distribui`: **babi, houyi, raijin, sun wukong**.

**A varredura dos 9 tipos de alvo × `iaAlvoSets` (leitura, a pedido do dono — decide se a linha de base serve):**
| tipo | habs | iaAlvoSets | veredito |
|---|---|---|---|
| inimigo · aliado · 2inimigos · 2aliados · aliado+inimigo | 191 | caso explícito | MEDIDO |
| nenhum (48) · todosInimigos (55) · auto (2) | 105 | default `[[]]` | **OK — verificado ao vivo:** todosInimigos acerta 3/3 por escopo; `auto` (lugh/nezha) auto-seleciona (alvoHp); `nenhum` é self/time. `[[]]` é a entrada CERTA — nada a mirar. |
| **distribui (4)** | 4 | default `[[]]` | **BURACO** — precisa de subconjunto escolhido; `[[]]` → misfire |

**Resultado: UM buraco só — `distribui`. Nenhum outro.** A §141 mede **96 de 100**, não menos. Os cinco tipos explícitos e os três de-escopo (nenhum/todosInimigos/auto) são medidos de verdade. (Distinção importante: um kit `nenhum`/`todosInimigos` que a IA gulosa NÃO lança — Sun Wukong milagre, p.ex. — é o viés-de-setup já registrado na §141, NÃO um buraco de mira; a IA PODE lançá-lo e ele resolve. O `distribui` é diferente: a IA fisicamente não consegue mirá-lo.)

**Nota de escopo:** `alterna`/`opcoes` (modo/escolha) são OUTRO eixo, não de alvo — a IA enumera `opcoes` (iaCandidatos) mas lança `alterna` só no modo padrão. Fora desta varredura (que era de `alvo`); anotado para não se confundir com buraco de mira.

**ITEM EXPLÍCITO DA F2.2 (a pedido do dono):** a IA precisa de **regra de mira para `distribui`** ANTES de a arena ser re-rodada no nível Difícil. Sem isso, comparar níveis compararia a MESMA cegueira duas vezes (o Difícil também não miraria os 4 kits). O caso em `iaAlvoSets`: para `distribui`, gerar candidatos que repartem N golpes entre os inimigos vivos (o motor já distribui — só falta a IA propor o subconjunto).

---

## §143 — §46 num eixo novo (HOMONÍMIA) · a convenção-vs-checador (§106) · e o delta da arena pós-remoção

**§46 por HOMONÍMIA (eixo novo, registrado a pedido do dono).** A varredura da remoção teve de separar DOIS "invocação" de mesmo nome e domínios sem relação: a invocação de BATALHA (`invocar` fx, `l.invocacoes`, a Fera) e a invocação-GACHA (`perfil.invocacao`/pity, `registrarInvocacao`, a tela "Invocar", `economia.json`). Tratar como um só teria quebrado a rolagem de deuses. O §46 vinha dizendo "o nome não é evidência do MECANISMO" (o balde que engana por agrupamento). Este é um eixo DISTINTO: **o nome engana por HOMONÍMIA — dois domínios, um rótulo.** A regra operacional para a varredura-por-nome: perguntar **"é o mesmo DOMÍNIO?" ANTES de "é o mesmo mecanismo?"**. Homônimo cruza a fronteira do domínio; balde não.

**A convenção vence o checador (§106 na direção certa).** "Causa 10 de dano" na Fúria da Matilha fazia o `checar_cadeia` DIVERGIR (lê dano-flat que o `refleteDano` não carrega). Duas saídas: ensinar o checador (add `refleteDano.v` a `danosFx`) OU seguir a prosa do Mnevis ("reflete 10 de todo dano", que dodge o parser). **Ensinar quebraria o Mnevis** (ele passa HOJE justamente por dodge; ensinado, o `dP=[]≠dM=[10]` do Mnevis viraria DIVERGE). A convenção já existia e era barata — segui-la, não reescrever o checador + o Mnevis, é o §106 (o caminho menor que não desfaz o que já funciona).

**O DELTA da arena (re-rodada pós-remoção, `docs/arena_pos_invocacao.txt` vs `arena_fase1.txt`, 200 rodadas, mesmas sementes). Leitura, sem correção:**
- **Distribuição geral: não se moveu.** Média 50,0% (obrigatório, soma-zero) · desvio 14,1→14,0 pts · duração 13,8→13,9. Topo-10 idêntico; ▼FORA 4→3 só porque o Boto (28,9→29,4%) cruzou o limiar [média−1,5σ] por causa do micro-shift do desvio — o Boto não mudou, o corte mudou.
- **Os 5 kits:** Kitsune 35,4→35,4 (fx idêntico, só prosa — e a igualdade ao decimal CONFIRMA o determinismo). Iansã 37,7→37,7, **V/D byte-idêntico (72V 119D)** — `limparInvocacoes` já era inerte em time sorteado (nada a limpar) e o `stripBuffs` não virou UMA partida das 191. Khnum 40,7→41,2 e Sun Wukong 56,8→56,3: ruído (SE~3,6). Cernunnos **39,1→44,2 (+5,1)**, acima do ruído.
- **O +5 do Cernunnos é sobre a IA, não sobre o kit — e o canal NÃO é o que o dono supôs.** O dono apostou no reflexo (só rende se o inimigo ataca). Mas o Cernunnos segue **"nunca usou habilidade" ANTES e DEPOIS** — a IA gulosa nunca lança a habilidade (o reflexo é setup, delta≈0 em 1 ply; o invocar antigo, idem). Então o reflexo nunca disparou na arena. O +5 vem da **PASSIVA nova** (`aoSerAtingido{aliado}→cura 8`): a IA sempre ataca → sempre acerta um aliado do Cernunnos → sustain grátis todo turno inimigo. A intuição do dono (a IA que sempre ataca infla o kit reativo) estava certa na DIREÇÃO; o canal exato é a passiva, não o reflexo — e o reflexo nem foi medido.
- **Sun Wukong: a habilidade nova é INVISÍVEL à arena.** `iaAlvoSets` (`src/ia.js`) não tem caso para `alvo:'distribui'` → cai no `default:[[]]` (alvo vazio) → a IA nunca consegue mirar um multi-golpe distribuído. Vale para os 4 kits `distribui` (babi/houyi/raijin/sunwukong). O 56,3% do Sun Wukong é só básico+passiva (inalterados); o troco dos clones→Fios de Cabelo não foi medido. **Lacuna concreta para a IA da Fase 2: uma regra de mira para `distribui`.**

**Arquétipos (3ª espécie de órfão, prosa-sem-fx no rótulo): varridos os 100.** Os 4 obsoletos corrigidos na remoção (Khnum→Guardião/protetor, Cernunnos→Guardião da natureza, Sun Wukong→DPS multi-golpe, Iansã→Vento/anti-buff; Kitsune segue Ilusionista, correto). Nenhum outro dos 100 é obsoleto — o único que a varredura-por-palavra sinalizou, `curupira: Misdireção/guarda`, é FALSO-POSITIVO: "guarda" ali é o PAPEL (ela protege por redirect + reducao no time), não a invocação-guarda removida. (De novo o §46-homonímia: "guarda" o papel × "guarda" a invocação.)

---

## §142 — REMOÇÃO DO SUBSISTEMA DE INVOCAÇÃO: 3v3 é 3v3. M8 aposentado, 5 kits reescritos com primitivas existentes.

**Decisão do dono: nada entra no campo além dos seis deuses.** Removido TODO o subsistema de invocação de batalha — o M8 (Fera alvejável, §139/§140) e a família guarda/clone que o antecedeu. **−67 linhas líquidas no `engine.js` (2085→2018).**

**Ordem (a que o dono cravou): varrer → reescrever kits → remover motor → provar sem órfão.**

**A varredura primeiro (§115 respeitado): um ponto NÃO previsto.** O dono listou "KHNUM: 1 aliado ganha Provocar". Mas Provocar (taunt) como construído **fixa `origem: u.uid`** (engine.js apply-fx) — quem lança vira o ímã; não há como um ALIADO escolhido virar o ímã. O Shabti nunca usou taunt pra isso: drenava fogo pelo `acharGuarda` (deletado). Levado ao dono como fork. **Decisão dele: `intercepta {protege: aliado}`** (a primitiva do "Senhor" da Bastet/Hanuman) — Khnum intercepta os golpes de alvo único contra o aliado, que ganha o escudo. Fiel à intenção (o aliado escudado é protegido) sem código novo.

**Os 5 kits, só com primitivas que já existiam:**
- **Khnum** — hab "Couraça de Barro": `intercepta{contra:'todos',dur:2}` + `shield 25` (alvo=aliado). Passiva: só a prosa perdeu o "Shabti" (o fx `aoCair{quem:aliado}→heal 12` já era exatamente isso).
- **Cernunnos** — hab "Fúria da Matilha": `apply refleteDano{v:10,dur:2} escopo:time` (o thorns do Mnevis, no time). Passiva: `aoSerAtingido{quem:aliado}→heal 8` + o `bonusCura viaRegen +4` que já tinha.
- **Sun Wukong** — hab "Fios de Cabelo": `dmg v:8 golpes:4` (alvo=distribui) — multi-golpe §92, mesmo total 32 dos 2 clones. Entra na allowlist do auditor (32>25 hab), irmão do Yamata no Orochi.
- **Kitsune** — SÓ prosa ("isca"→"miragem intercepta"): o fx já era `intercepta{protege:'time'}`. Zero mudança de código.
- **Iansã** — milagre: `limparInvocacoes` → `stripBuffs escopo:todosInimigos`. O stripBuffs (§136, Yamato) ganha o 2º consumidor que a §131 previa.

**Uma torção de prosa forçada pelo checador (família §141-C):** "causa 10 de dano" na Fúria da Matilha fazia o `checar_cadeia` ler um dano-flat que o `refleteDano` não carrega (DIVERGE). Reescrito "reflete 10 ao atacante" — a MESMA convenção que o Mnevis já usava ("reflete 10 de todo dano") para dodge do parser de dano-flat. Não ensinei o checador (ensiná-lo quebraria o Mnevis, que dodge por prosa); segui a convenção existente.

**Removido do motor:** fx `invocar`/`limparInvocacoes`; funções `acharGuarda`/`removerInvocacao`/`matarInvocacao`; campo `l.invocacoes`; ramos de `bater` (`ehInvocacao` + guarda), o tique de invocação no `iniciarTurno`, a Fera em `alvosValidos`/`agir`; fxKeys `tipo`/`provoca`/`curaDono`/`respawn`; o campo-de-evento reservado `invocacao`; e o `case 'invocacao'` do narrador (UI). O `reagirAoCairAliado` FICOU (é o aoCair-de-aliado das unidades reais); só o call-site do guarda saiu.

**O caminho de dano do `bater` ficou mais simples, como o dono previu:** de TRÊS ramos de roteamento (corpo-direto `ehInvocacao` no topo, `acharGuarda` no meio, `acharInterceptador`) para UM (`acharInterceptador`). O desvio de guarda era um dos ramos mais densos — sumiu.

**Prova de que não sobrou nada — a varredura das 5 espécies (§113 + §129) contra o motor sem invocação, LIMPA:** (1) etiqueta-sem-enforce: nenhum token de invocação no VOCAB, todo fx verb ainda tem handler; (2) campo-sem-fio: nenhum `invocacoes`/`ehInvocacao`/`respawnEm`/`curaDono`/`__inv`/`__fera` no motor; (3) prosa-sem-fx: nenhum dos 100 kits (×4 campos + arquetipo) menciona invocação; (4) produtor-sem-consumidor: nenhum push/log de invocação; (5) junta-não-ligada: nenhum leitor de `tipo:'fera|guarda|dano'`/`ehInvocacao`/`respawn` sem produtor. **IMPL 100 / FUNCIONAL 100, 20 suítes verdes.** (O gacha — `perfil.invocacao`/`registrarInvocacao`/tela "Invocar" — é outro namespace, intocado.)

**Nota:** a leitura da arena (§141-A/B) precede esta mudança — os 5 kits mudaram de comportamento, então aquele snapshot está velho para eles. Re-rodar quando quiser.

---

## §141 — A ARENA COM OS 100 (1ª leitura de balanceamento com dado real). NENHUM número tocado — decisão do dono.

**A arena existe desde a F1.4 e nunca vira o roster completo.** `tools/arena.js` (novo): IA×IA gulosa sobre os 100, PRNG semeado (determinístico, sem `Math.random`), amostragem round-robin (cada rodada embaralha os 100, forma times de 3, emparelha adjacentes; `comeca` alterna). 200 rodadas = 3200 partidas, ~192 jogos/deus. Relatório salvo em `docs/arena_fase1.txt`.

**Sanidade primeiro (a arena está medindo certo):** win-rate MÉDIO **exatamente 50,0%** (jogo é soma-zero e simétrico — se desse ≠50 haveria viés no harness), duração 13,8 turnos (bate com os 13,5–14,8 do perf-test da `energia`), **0 sem desfecho**, 1 empate em 3200 (0,0%). Erro-padrão de um win-rate 50% a 192 jogos: ~3,6 pts.

**A DISTRIBUIÇÃO (desvio-padrão 14,1 pts):**
- **▲ FORA por cima (>71%):** Brigid 91% · Brahma 89% · Oxum 86% · Mimir 79% · Nüwa 77% · Guan Yu 75% · Freyja 74% · Bennu 73% · Thor 73% · Oxalá 72%.
- **▼ FORA por baixo (<29%):** Cérberus 29% · Boto 29% · Bastet 27% · Fujin 26%.
- O miolo (86 deuses) está em [29%, 71%], concentrado em 35–60%.

**O CAVEAT que governa a leitura inteira — a IA é o instrumento, e ela tem viés conhecido (`src/ia.js`: gulosa de 1 lance, não minimax).** Ela pontua a posição IMEDIATA. Logo:
1. **Superestima AoE+cura imediatos.** O topo (Brigid/Oxum/Brahma) são kits cujo valor é dano-em-área + cura no mesmo lance — delta grande em 1 ply, e a IA os spamma. Parte do 91% da Brigid é a IA jogando o brinquedo favorito dela, não só poder de kit.
2. **Subestima setup/buff/control/invocação** (delta≈0 em 1 ply). Daí a lista gigante de **"habilidade nunca usada" (41 deuses)**: não são habilidades mortas — são buffs/setup/summon/control que o guloso não sabe valorizar. 59 deuses USARAM habilidade (a IA CONSEGUE escolhê-la — a Brigid do `ia.test` prova), então não é bug; é cegueira de 1-ply.
3. **Penaliza sinergia de facção/nomeada em time ALEATÓRIO.** Odin (33%, `faccaoConta` precisa de 2+ Nórdicos), Kitsune (35%, sinergia com Inari), Nefertem (cura por curador Egípcio) raramente têm o parceiro no time sorteado. O piso deles é confundido pela amostragem, não é só kit fraco.

**O que a arena RESOLVEU de dívida aberta:** o **Nove Flechas = 72** do Hou Yi (§94, "candidato a revisão, medir na arena"). Hou Yi ficou em **40,1%** — o 72 exige as 9 flechas caírem TODAS em alvos-Aurora, condição rara; não é dominante na prática. O número tem dado agora; a decisão é do dono.

**Decisão:** **nada foi alterado.** O dono pediu a distribuição antes de tocar em qualquer coisa; o balanceamento é decisão dele. A arena fica como ferramenta (roda quando quiser: `node tools/arena.js [rodadas]`). Quando a Fase 2 trocar o guloso por lookahead, esta leitura muda — re-rodar é obrigatório antes de concluir qualquer coisa sobre poder de kit.

**§141-A — LINHA DE BASE p/ a arena da Fase 2 (registrado a pedido do dono, sem conclusão):** dispersão do win-rate = **desvio-padrão 14,1 pts, miolo de 86 deuses em [29%, 71%]**, média 50,0%, ~192 jogos/deus (SE ~3,6 pts). Descontado o viés do guloso, ainda sugere dispersão REAL — mas não se conclui nada agora. Número guardado para a arena da Fase 2 (com lookahead) comparar contra ele. **RESSALVA (§144): a linha de base mede 96 de 100 — a IA não sabe mirar `distribui`, então babi/houyi/raijin/sunwukong têm o win-rate viciado (nunca lançam a habilidade/milagre `distribui`). Comparar contra este número exige a mesma ressalva, ou a regra de mira `distribui` na IA ANTES de re-rodar.** — **LEVANTADA (§147):** a mira `distribui` foi construída; a arena agora mede 100/100 (baseline vivo em `docs/arena_pos_distribui.txt`).

**§141-B — PERGUNTA ABERTA p/ a arena da Fase 2 (o achado mais confiável da corrida):** Odin 33% e Kitsune 35% NÃO são fraqueza de kit — são **sinergia nomeada com parceiro que raramente cai no time SORTEADO** (Odin `faccaoConta` ≥2 Nórdicos; Kitsune sinergia com Inari). No jogo real o jogador ESCOLHE o time → são condicionais FORTES, não fracos. A arena atual não responde **quanto vale a sinergia quando ela existe**. Fase 2: rodar com times sorteados E com times sinérgicos, comparar — é isso que diz se a sinergia está bem precificada.

**§141-C — OS 26 NÃO-CONFERÍVEIS do `checar_cadeia` (2,3% de 1116): NÃO são 26 casos distintos.** Colapsam em UMA causa-raiz (o parser só confirma um `N de dano` FLAT; recusa — corretamente — tudo que não é número flat) em TRÊS formas legítimas de design:
- **Multi-golpe (14):** a contagem mora na prosa ("9 flechas de 5"), o valor-por-golpe no motor; o parser lê `de dano` e não multiplica. `ares.mil ammit(→cond) aquiles.mil babi.mil bastet.bas durga.bas hermes.bas houyi.mil mnevis.hab piranha.bas piranha.hab raijin.hab(posicional) sunwukong.bas susanoo.hab thor.hab`.
- **Condicional/escalado (8):** o BASE bate com a prosa; um ramo (§87) ou escalador (`porStatus/porContador/porAliadoVivo/porInimigoHp/COND`) torna o total condicional, e o parser não confirma número que depende de estado. `ahpuch.mil guanyu.mil horus.mil(dois ramos, ambos batem) jormungandr.mil kali.hab kitsune.mil ra.mil ammit.mil(exec aninhado)`.
- **fx dinâmico (4):** valor escolhido em runtime (`alterna`/`opcoes`) → mora no motor. `lugh.hab nezha.hab nuwa.hab(cura) tanuki.mil`.

**Não é lacuna que esconde bug — é o parser desenhando fronteira HONESTA.** Cada caso que ele recusa é coberto por OUTRA camada: `auditoria` (teto) pega os bumps condicionais; `primitivas` §92/§135 pega o multi-golpe; §87/§101/§118 pega o condicional; `capacidades` pega alterna/opcoes. É o custo normal de prosa livre + design rico, não 26 pontas soltas.

---

## §140 — CERNUNNOS, o 100º: M8 (Fera livre-alvejável) construído. **FASE 1 FECHADA: IMPL 100 / FUNCIONAL 100.**

**Modelo A (Fera livre-alvejável), como o dono cravou.** A alternativa (Modelo B — a Fera como um "papel" que o inimigo só sofre, sem corpo) foi recusada pela mesma razão que a Nezha, a Brigid e o Selado: **inventa papel em vez de dar corpo.** A Fera É um corpo (30 HP em `l.invocacoes`, `tipo:'fera'`, alvejável), não um efeito abstrato no inimigo. O achado do ponto 2 da §139 — o M8 serve UM kit, não a família — não mudou a decisão, só o custo: valeu a pena para o 100º.

**O subsistema, em cinco peças no motor:**
1. **`invocar` ramo `tipo:'fera'`** — cria corpo alvejável (`ehInvocacao`, `hp/maxHp`, `curaDono`, `respawn`), com **anti-duplicata**: filtra qualquer Fera do mesmo dono antes de empurrar (invocar de novo substitui, não acumula).
2. **`bater` caminho `alvo.ehInvocacao`** — dano direto no corpo (sem shield/redução/passiva de unidade), a 0 → `matarInvocacao`.
3. **`matarInvocacao`** — DELIBERADAMENTE seco: `vivo=false`, `hp=0`, log de queda, arma `respawnEm=respawn`. **Nenhuma máquina de `matar`** (sem `aoCair`, sem execução, sem `checarFim`, sem orbe). É a diferença entre derrubar um corpo invocado e abater um deus.
4. **tick `else if (g.tipo === 'fera')`** — dono morto → a Fera some com o dono (`removerInvocacao`); dono vivo + Fera viva → ataca 10 + cura o dono em 8; Fera caída + `respawnEm>0` + **`!st.fim`** → decrementa, a 0 revive com HP cheio.
5. **`alvosValidos` + `agir`** — a Fera entra na lista de alvos (respeitando `submerso`/`inalvejavel`), então IA e jogador miram nela.

**As 5 TRAVES que o dono pediu cravadas (§139 em `passiva.test.js`, todas verdes):**
- **T1 — aoCair mudo:** a Fera cai e o `aoCair` do Zeus NÃO ganha orbe. `matarInvocacao` não chama a máquina de queda de unidade. ✔
- **T2 — invisível ao `checarFim`:** um lado com só a Fera viva PERDE (a Fera não conta como unidade viva). ✔
- **T3 — IA sem regressão:** `ia.test` ~1.3s antes e depois (30 partidas, 0 sem desfecho). O corpo a mais na mira é um aumento modesto de candidatos 1-ply, não uma regressão. ✔
- **T4a — respawn morre com o dono:** dono abatido → a Fera não renasce (some). **T4b — sem duplicata:** invocar de novo antes do respawn não cria uma segunda. ✔
- **T5 — Inalvejável coerente:** `inalvejavel` na Fera a tira de `alvosValidos` como tira uma unidade; `ignoraInalv` (mira-forçada) a alcança igual. ✔

**Guard-rail que só o motor rodando expôs:** o `respawnEm` decrementa dentro do `!st.fim` — sem isso, uma Fera caída no turno que encerra a partida renasceria em partida encerrada (a 5ª espécie órfã da §113, JUNTA-NÃO-LIGADA: o timer lia certo, mas ninguém o desligava no fim). Travado em T2+T4.

**Auditoria:** Caçada Selvagem (milagre 18 + 5/regen no time = 33 em área, teto 22) entra na allowlist com a mesma justificativa da família Colheita Fúnebre/Veneno: escalador CONDICIONAL (`porStatus`), não dano-base estourado.

**O fecho.** São 100 deuses em `data/deuses/`, IMPL 100 / FUNCIONAL 100, 20 suítes verdes, cadeia sem DIVERGE. A Fase 1 está fechada.

---

## §139 — VARREDURA DA FAMÍLIA DE INVOCAÇÃO (antes do Cernunnos) + desenho do M8, PENDENTE: o subsistema serve UM kit, não a família

**A varredura combinada da §133, antes de qualquer linha do Cernunnos (o 100º). Os 5 pontos, verificados contra o motor:**

**1. Quantas formas e como cada uma morre.** DUAS formas de invocação hoje (em `l.invocacoes`, nunca em `units`):
- **`guarda`** (Khnum/Shabti): tem HP (30), Provoca + absorve; morre por DANO (o bloco acharGuarda no bater: `guarda.hp -= base`; a 0 → `removerInvocacao` + `reagirAoCairAliado`) OU por expiração de `dur`.
- **`dano`** (Sun Wukong/2 clones): SEM HP-morte (hp:0), ataca no tick, morre SÓ por `dur`. Não alvejável.
- **Divergência registrada:** a "isca" da Kitsune que o dono listou como invocação NÃO é invocação — eu a construí (§126) como `intercepta {protege:'time'}`, um BUFF, não uma entrada em `invocacoes`. Então só TRÊS invocam de verdade (Khnum, Wukong, Cernunnos); a isca é intercepta.

**2. Quais deveriam ser alvejáveis pela prosa.** SÓ a Fera ("30 de HP que cai" = corpo que o inimigo derruba). O Shabti tem HP mas é GUARDA (absorve o dano provocado, não é alvo livre). Os clones NÃO têm corpo (dano temporizado, sem HP). **Então o subsistema de invocação-alvejável (M8) serve UM kit — a Fera — não amortiza na família.** O dono esperava que os clones do Wukong tivessem corpo; não têm. É o achado que muda o custo/benefício: o M8 é para um deus, não para dois.

**3. O que muda na IA.** A IA mira de `alvosValidos(...).filter(inimigo)` (§84). Pôr invocações lá → a IA passa a considerá-las (mais alvos por ação → mais candidatos pontuados; 1-ply, aumento modesto) E muda o COMPORTAMENTO (a IA pode gastar ataques na Fera p/ estancar o 10/turno). A mira do JOGADOR (UI) também passa a mostrá-las. Custo real, não nulo.

**4. Condição de vitória — CONFIRMADO seguro.** `checarFim` lê `st.lados[i].units` SÓ; invocações (em `invocacoes`) são invisíveis à vitória. Enquanto a Fera ficar em `invocacoes` e NUNCA em `units`, a morte dela nunca conta para a regra das 3 unidades reais. **Restrição-chave do desenho: alvejável-mas-não-unidade.**

**5. Respawn — mora no LADO, não no M1.** A Fera não é unidade → `pendente`/M1 (por-unidade, 1 turno) não serve. O timer mora em `l.invocacoes` (uma entrada morta com contador `respawnEm`, ticada no tick de invocação que já roda no iniciarTurno). Confirma o §132: o timer é a parte fácil.

**O DESENHO do M8 (pendente de autorização) — duas opções, porque o achado do ponto 2 mudou o custo:**
- **Opção A — Fera livre-alvejável (fiel, o subsistema cheio):** nova `tipo:'fera'` alvejável; entra em `alvosValidos`; o `bater` detecta `ehInvocacao` cedo e usa um caminho SIMPLIFICADO (reduz hp; a 0 → `matarInvocacao`, NÃO o `matar` de unidade — senão rodaria aoCair/checarFim numa não-unidade); respawn no lado. Toca alvosValidos + bater + IA. Serve UM kit.
- **Opção B — Fera-guarda (barata, reúsa tudo):** a Fera é `tipo:'guarda'` que também dá dano; "cai" ABSORVENDO (o caminho de morte da guarda já existe), respawn é o único acréscimo. Reúsa o subsistema inteiro; adiciona um papel defensivo que a prosa não pede ("30 HP que cai" vira "cai ao proteger").

**Decisões em aberto para o dono (o desenho não crava, e o ponto 2 pesa):**
1. **A ou B?** A é fiel mas o subsistema serve um só kit (não amortiza); B é barata mas muda a Fera de atacante-alvejável para guarda-que-ataca. (Antes do achado do ponto 2, A parecia amortizar; agora não.)
2. Se A: **confirmar o custo na IA** (invocações em alvosValidos).
3. **Dois commits** (desenho agora; build depois), como o dono pediu — este é o desenho.

**Peço a escolha (A ou B) antes da primeira linha do Cernunnos.**

---

## §138.1 — VARREDURA PREVENTIVA não é a que ACHA o bug, é a que MUDA A DECISÃO antes de o bug existir

**O dono cristalizou (a partir do M6 §138).** A varredura de junta do M6 NÃO achou um furo — ela escolheu a FORMA sem furo. Quatro classes de leitor de buff = quatro juntas potenciais com um flag; o remove-e-guarda deu ZERO porque ausência é o que todo leitor já trata. **A distinção:** a varredura corretiva (§113, §134-dirigida) procura um bug que já existe; a varredura PREVENTIVA (§138 M6) roda ANTES de escrever e muda a decisão de projeto para uma onde o bug não pode nascer. As duas usam a mesma técnica (enumerar os leitores/juntas), mas uma corrige e a outra PREVINE — e a preventiva vale mais, porque o custo dela é uma leitura e o retorno é um mecanismo inteiro que não precisa de rede depois. **Regra: ao abrir um mecanismo que muitos leitores tocam, enumerar os leitores ANTES e escolher a forma que a ausência (ou o invariante existente) já cobre.**

---

## §138 — DAGDA CONSTRUÍDO (M2 via A2 + M6): "passar no turno ≠ pular o turno"; o laço nunca foi tocado (2/2 no M2)

**O dono autorizou o Modelo A2 (§137). Dagda construído — o 99º. IMPL 98 → 99, FUNCIONAL 99. Só o Cernunnos falta.**

**O INSIGHT (o dono mandou registrar a frase, porque é o insight e não o detalhe):**
> **Os nove pontos de alternância dependem do turno ACONTECER, não do ator AGIR.**
Por isso "passar no turno" (A2 — o turno roda, o inimigo não age) é seguro e "pular o turno" (A — o turno some) quebra tudo. A distinção não é de implementação; é a leitura do que o modelo garante. O `passeForcado` nega a AÇÃO (lido em `podeAgir`), e o `st.ativo = 1-st.ativo` fica intocado.

**2/2 no M2, e o laço nunca foi tocado.** Os dois pedidos de "reordenar o turno" saíram de RELER o que o modelo já garante, não de mudá-lo:
- **Hermes/Exu (§121):** "age primeiro" → SER O STARTER (regra de setup, novoEstado).
- **Dagda (§138):** "age primeiro no próximo turno" → PASSAR o turno do inimigo (a ação, não o turno).
Ambos evitaram o loop-reorder que o dono adiou duas vezes. **Regra: quando um efeito parece exigir mexer no laço, reler primeiro o que o laço já garante — duas vezes o "reorder" era um caso especial de algo que o modelo já fazia.**

**O inimigo em passe forçado GERA orbe (decisão do dono, com precedente):** negar a geração seria um SEGUNDO efeito que a prosa não escreve — "perde a ação" já é o efeito inteiro. Precedente direto: `agiu`/`podeAgir` já separam "não pode agir" de "não recebe nada", e **os treze controles operam assim** (atordoado não age e continua gerando orbe). A decisão fica consistente com treze controles, não isolada.

**O passe forçado é VISÍVEL (dir. do dono, F0.7):** o `apply` loga `passeForcado` nomeando a origem (o Dagda), e o `iniciarTurno` loga um `bloqueio motivo:passe_forcado` quando o lado ativo começa em passe — o jogador que perde a ação vê por quê, não parece bug.

**M6 (suspensão de buffs) — a varredura §134 ANTES de construir (dir. do dono):** listei os leitores de buff — `ef()` (~15 sítios), `u.shield` (absorção no bater + alvoBuff/alvoDefesa), `alvoBuff` (condOK), `statusCasou` (porStatus categoria buff), mais os removedores e o desconto de duração. **Um FLAG exigiria tocar 4 tipos de leitor (ef/shield/alvoBuff/statusCasou) = 4 juntas em potencial.** Escolhi **REMOVE-E-GUARDA** (estoca os buffs+escudo, remove, restaura após dur turnos): durante a suspensão os buffs estão AUSENTES, e todo leitor já trata ausência (provado pelas suítes). **Zero juntas** — é o "desativa-e-devolve ≠ strip" do §116, e a varredura VALIDOU a escolha em vez de descobrir o furo depois. A dur do buff congela (fora de efeitos, a regra 5 não a corrói) e resume ao restaurar.

**As peças fáceis, como previsto:** bonusCura +5 (existe), regen na habilidade (existe), Caldeirão-piso (buff `caldeirao` + piso condicional no bater: curado NESTE turno via `curadoAgora` §97), básico "a cada 3º uso" (contador `clava` de USO + condicional — ciclo por-uso, ≠ aCadaN por-turno; o 3º uso cura o mais-ferido via alvoHp, evitando a mira-por-condição).

**Rede §134 pagou 3ª vez:** os campos novos (`suspensos`, `passeForcado`, `caldeirao`+`curadoAgora`, `clava`) provados nos dois lados no mesmo commit.

**Falta só o Cernunnos** — e ele volta com a varredura da família de invocação (§133), não sozinho.

---

## §137 — DESENHO DO DAGDA (M2 loop-reorder + M6), AUTORIZADO (Modelo A2) — construído no §138

**O Dagda é o único que reordena o LAÇO; o dono adiou duas vezes por isso e pediu o desenho ANTES de qualquer linha, com os nove pontos que dependem de alternância analisados. NÃO construído — este é o desenho para autorizar.**

**As peças fáceis (compõem, sem risco de laço):**
- passiva "curas +5" = `bonusCura v:5` (existe). O "Caldeirão ativo → aliados não caem abaixo de 1 HP no turno em que forem curados" = um `pisoVida` CONDICIONAL (gated por um flag de campo "Caldeirão" + só no turno da cura). Hook pequeno: um flag de lado + leitura no curar/matar.
- básico "a cada 3º uso, cura 20 em vez de atacar" = contador de USO (≠ aCadaN, que é por-turno): um contador no dono que no 3º incremento troca o efeito. Hook pequeno.
- habilidade "regenera 12 por 3 turnos" = `apply regen escopo:time` (existe) + liga o flag Caldeirão.
- **M6 (milagre, "buffs inimigos suspensos por 1 turno")**: SUSPENDER ≠ strip. Desenho: marcar os buffs do inimigo como inativos por 1 turno (um flag `suspensoAte` no efeito, lido onde o buff age — bater/calcDano/mira), e reativá-los depois. É contido (não toca o laço); a única exigência é que TODO leitor de buff cheque o flag de suspensão — uma varredura §134 (junta) dedicada. Risco médio, mas LOCAL.

**M2 loop-reorder (milagre, "o time age primeiro no próximo turno") — o ponto perigoso. Três modelos:**

- **Modelo A — turno extra (pula o inimigo):** depois do Dagda, o time joga de novo no lugar do inimigo. QUEBRA os nove de forma ASSIMÉTRICA: o time dobra renda de orbe, tick de cd, e ganha alívio (os DoTs do inimigo não tickam), enquanto o contador de `turno` e a `fase` contam errado (o invariante "starter lidera a rodada" cai). **Recusado:** é o que fez o dono adiar; corrompe os nove.
- **Modelo B — troca de ordem verdadeira (sem turno extra):** inverter quem lidera a próxima rodada. No modelo de flip estrito (`st.ativo = 1-st.ativo`), "ir primeiro" só difere de "ir segundo" DESLOCANDO o turno do outro — então B, num 1-1 puro, colapsa em A (não há meio-termo sem deslocar). **Inviável sem reescrever o laço.**
- **Modelo A2 — PASSE FORÇADO do inimigo (recomendado):** o próximo turno do inimigo ACONTECE normalmente (iniciarTurno + fimTurno rodam: DoT/orbe/cd/duração/fase/rastreios todos tickam UMA vez, como sempre), mas o inimigo NÃO PODE AGIR (passe forçado, via um flag lido em podeAgir/acoesDe que auto-encerra o turno). Entrega o "age primeiro" (o time age, o inimigo tem um turno morto, o time age de novo — tempo sem resposta) SEM corromper os nove, porque cada turno ainda tick uma vez por lado.

**Os NOVE pontos sob o Modelo A2 (por que ele é seguro):**

| # | Ponto (assume alternância) | Sob A2 (passe forçado) |
|---|---|---|
| 1 | DoT tica no iniciarTurno do portador | tica normal (o turno do inimigo acontece) ✓ |
| 2 | Renda de orbe no iniciarTurno | inimigo ainda gera (ou nega-se? decisão do dono) — default: gera ✓ |
| 3 | cd decrementa no iniciarTurno | decrementa normal ✓ |
| 4 | durações no fimTurno | descontam normal ✓ |
| 5 | fase (faseDur por turno) | tica uma vez, normal ✓ |
| 6 | curadoAntes (promoção) | promove normal ✓ |
| 7 | danoAntes (promoção §111) | promove normal ✓ |
| 8 | golpeUnicoNoTurno / controleNoTurno (reset) | reseta normal ✓ |
| 9 | contador de `turno` (starter lidera) | **intacto** — o flip continua `1-ativo`, o inimigo só não age; o invariante do starter não quebra ✓ |

**A única mudança de A2:** o inimigo perde a AÇÃO de um turno. Os nove ficam INTACTOS porque o turno ainda ocorre — o passe força a inação, não a ausência do turno. É a diferença entre "pular o turno" (Modelo A, quebra tudo) e "passar no turno" (A2, o turno roda, o ator não age).

**Decisão em aberto para o dono (as que o desenho não crava):**
1. **Modelo A2 vs. algo mais simples?** (recomendo A2.)
2. **Ponto 2 — o inimigo em passe forçado GERA orbe?** A prosa não diz. Sugiro SIM (o turno acontece; negar orbe seria um segundo efeito não escrito) — mas é decisão de balanceamento do dono.
3. **A auto-inação:** via um efeito `passeForcado dur:1` no lado inimigo, lido em `podeAgir`/`acoesDe` (todas as ações indisponíveis → o turno auto-encerra). Custo em linhas: ~pequeno (o flag + a checagem + o auto-fimTurno na IA/fluxo). NÃO toca o `st.ativo = 1-st.ativo`.

**Peço autorização do Modelo A2 (com a decisão do ponto 2) antes de escrever a primeira linha do Dagda.**

---

## §136 — FASE B / B5 (3 de 4: Yamato, Khonshu, Exu): as três perguntas respondidas contra o motor; o stripBuffs voltou com o consumidor certo

**Os três primeiros do bloco final, traduzidos juntos. IMPL 95 → 98, FUNCIONAL 98. O Dagda vem SÓ como desenho (§137), por reordenar o laço.**

**Yamato (o mais leve — escrito 1º p/ validar o bloco):** a outra metade NÃO era só stripBuffs + próximo-golpe-puro — havia um terceiro: `estado.contadorLado` (a imunidade "15+ Combo" lê o POOL do lado, não o contador por-unidade; o §132 deu imuneA+estado, mas faltava o eixo lado). Os três hooks: `stripBuffs` re-adicionado (o §113 o removeu; VOLTOU com o Yamato, o consumidor real — §131/§132.1 previram que era o Yamato, não o Loki), `proximoGolpePuro` (buff que torna o próximo ataque puro, consumido no 1º uso — irmão do acaoPerfeita §111, mas p/ qualquer slot e só o eixo puro), `contadorLado` estado. Perfurante no básico + porContadorLado no milagre já existiam.

**Khonshu (o §118 confirmado):** re-li o `matar` (mudou muito desde §118 — naoRevivivel §123, retaliação agora) e o desenho da marca-retaliação AINDA vale: `retaliacao` é marca no inimigo, lida DENTRO do matar; se o marcado derruba um aliado do marcador (gate cross-side `alvo.lado !== atk.lado`, exclui fogo-amigo), sofre v puro. + M9 `guardaControle` (1×/partida anula um controle num aliado — carga no flag bespoke `guardaControleUsado`, como o `renasceu` da Nezha). Q3 respondida: o desenho sobreviveu às mudanças do matar.

**Exu (a mira-por-opção, o que o §121 adiou):** Q2 respondida — é CAMPO por opção, não mecanismo. O `opcoes` ganhou `alvo` por opção (ABRIR alvo:'aliado', FECHAR alvo:'inimigo'); quando alguma opção escolhida tem alvo próprio, cada uma aplica com o SEU alvo. O precedente do Tanuki NÃO cobria isto (as opções dele compartilham a mira 'aliado'/self); Exu é o 1º com miras OPOSTAS por opção. Ressalva de UI registrada: o motor aplica com o alvo-por-opção, mas o fluxo de seleção (turno.js/`passosDe`) ainda lê o `a.alvo` base — a UI precisa aprender a mirar por-opção (fora do escopo do kit; o motor e os testes já funcionam com uids explícitos). A passiva iniciativa reusa §121.

**A rede §134 pagou de novo:** campos cross-boundary novos (`retaliacao.v` lido no matar, `proximoGolpePuro`/`guardaControleUsado` consumidos, `opcao.alvo`) — cada um provado nos dois lados no mesmo commit. Nenhuma junta nova.

---

## §135 — FASE B / B4 (os 3 REBAIXADOS: Kali, Shuten, Raijin): os tells acertaram, cada um exigiu um mecanismo real

**Os três que o §125 rebaixou de HOOK para MECANISMO REAL (tell de arrasto conhecido). Traduzidos juntos e com precisão (a exigência do dono p/ tells conhecidos). IMPL 92 → 95, FUNCIONAL 95.** Cada tell acertou — cada um precisou de um mecanismo que NÃO era campo:

- **Kali** (tell "no fim do turno"): a `danoFimTurno` — buff no dono que ataca de graça por v no fim de cada turno dele, por dur turnos (leitor no fimTurno, ao lado do pressagio §127 e do Livro). AÇÃO-RECORRENTE-AGENDADA, como o §125 previu. + `porInimigoHp` (scaler "+N por inimigo abaixo de X HP", gêmeo dos scalers de contagem) + noHeal. Passiva porInimigoCaido + aoCair heal (existentes).
- **Shuten** (tell "quando ele agir"): LIFESTEAL + roubaOrbe REATIVOS no `noAtor` do aoAgirSobEfeito — o `dreno` (o dano do noAtor vira cura no dono) e o `roubaOrbe` reativo (rodarNoAtor ganhou os dois; o validador do noAtor abriu p/ roubaOrbe). `torpor` entrou como MARCADOR (debuff que não trava ação — o portador age, e É por agir que a reação dispara). Milagre: roubaOrbe com `porAlvoComStatus` (n = nº de inimigos com Torpor). Passiva porTurno-com-estado-hpProprio (composição existente).
- **Raijin** (tell "cada alvo atingido / por golpe"): `geraContadorPorGolpe` — gatilho lido no BATER (cada alvo que o dono atinge gera contador no pool do lado). Feed-de-pool POR-GOLPE, o gancho no bater que o §125 previu. + dano POSICIONAL (`posicional:[18,12,8]`, ver abaixo). Milagre: contador pool:'lado' +4 (existente) — que COMPÕE com a passiva por-golpe (a AoE de 3 gera 3 + 4 = 7 Combo).

**A PERGUNTA do Raijin, respondida (§46, o degrau da preposição de novo):** o "18 ao 1º alvo, 12 ao 2º, 8 ao 3º" é dano POSICIONAL, distinto do split-igual §92. A prosa "1º alvo" NÃO diz se é posição de SELEÇÃO (o 1º que o jogador escolheu) ou de SLOT (o de cima). **Decisão do dono, adotada: ORDEM DE SELEÇÃO** — o jogador controla, determinístico sem regra extra. Implementado indexando `alvos` (a ordem em que os uids chegam). Testado: seleção [e2,e0,e1] → 18/12/8 seguem a SELEÇÃO, não o slot.

**O tell "por-ataque × por-golpe" (§126) CONFIRMADO 3ª vez:** Susanoo (por-ataque, `contador pool:'lado'` num fx, escrevível) × Raijin (por-golpe, gancho `geraContadorPorGolpe` no bater). Mesma família de Combo, escrevibilidades opostas pela preposição. O par que a triagem uniu se partiu exatamente onde o tell dizia.

**A rede §134 pagou:** as 3 construções abriram campos cross-boundary novos (`dreno`, `posicional`, `porAlvoComStatus`, `geraContadorPorGolpe.contador`, `danoFimTurno`), e cada um foi provado NOS DOIS LADOS no mesmo commit (a regra §134: checar a junta na hora de abri-la, não depois). Nenhuma junta-não-ligada nova.

**Fase B restante:** B5 = bloco final (dagda, khonshu, yamato, exu — e o Yamato já tem metade destravada pelo imuneA+estado §132). Depois, a leva solo do Cernunnos (§133).

---

## §134 — VARREDURA DIRIGIDA da 5ª espécie (junta-não-ligada): LIMPA — e a lição é que juntas moram no SEAM do código novo

**Antecipada a pedido do dono (a 5ª espécie apareceu 2× em 3 levas — Hel §127, Guan Yu §132 — frequente demais p/ esperar o fim da Fase 1). Não a varredura completa (O(pares)), mas a DIRIGIDA: cada campo que atravessa aplicação-e-consumo, confirmando que os dois lados concordam. Bounded.**

**Campos verificados (escritor ↔ leitor, ambos concordam):** `protege` (intercepta/contraAtaca fx ↔ acharInterceptador + bater; fix §132), `naoRevive` (aplicarDot/apply ↔ matar; fix §127), `origem` (aplicar/aplicarDot ↔ aoAgirSobEfeito/refleteControle), `escala` (aplicarDot ↔ tique), `contra` (aplicações ↔ consumo/contraCasou), `contraClasse` (Atena via apply ↔ bater), `execLimiar` (apply ↔ fimTurno), `destino` (redirect ↔ bater), `acc/alvo/max` (armazenaDano+bater ↔ fimTurno), `vidaExtra` (fx ↔ matar), `danoAgora/danoAntes` (bater/iniciarTurno ↔ maiorDanoAntes), `ultHabilidade` (agir ↔ copiar), `curadoAgora/curadoAntes` (curar/iniciarTurno ↔ alvoCuradoAntes), `execLimiar`/`renasceu`/`pendente` (§117/§127). **NENHUMA junta nova.**

**Um achado ADJACENTE (não é junta, mas vale a nota):** o campo `contra` é SOBRECARREGADO por gatilho — nas reducao/aoSerAtingido é um OBJETO (`{classe|elem|alcance|slot}`, casado por contraCasou); nas intercepta/redirect/contraAtaca é uma STRING (`'unico'|'todos'`, lida no consumo). Duas formas no mesmo nome de campo. Nenhum kit as cruza hoje, mas um autor que puser `contra:{alcance:'unico'}` numa intercepta (esperando casamento) seria lido como `contra==='unico'` (string) → falso silencioso. Registrado como dívida-de-forma (não junta): o nome `contra` faz dois trabalhos.

**A LIÇÃO (mais afiada que "varra no fim da Fase 1"):** as duas juntas achadas estavam no SEAM de código NOVO — Hel (um LEITOR especulativo plantado sem alimentador) e Guan Yu (um campo `protege` novo cujo CONSUMO não o respeitava). O código assentado (F1.x, exercitado pelas suítes) não escondia juntas — uma junta ali já teria aparecido como kit que não funciona. **Juntas se concentram onde UMA metade é adicionada sem a outra; então o momento de checar os dois lados é NA HORA de adicionar um campo cross-boundary, não depois.** Corolário operacional adotado: ao abrir um campo que se escreve num lugar e se lê noutro, provar os DOIS lados no mesmo commit (foi o que o probe forçou no §132; agora é regra). A varredura completa O(pares) do fim da Fase 1 vira rede de segurança, não a defesa primária.

**Resultado p/ o B4:** a rede está limpa antes das três construções. Pode seguir.

---

## §133 — CERNUNNOS (M8) ADIADO para leva própria: o mecanismo mais pesado do balde não leva meia-medida

**Decisão do dono, após a §132 mostrar que a Fera precisa ser ABATÍVEL (não só um timer).** O M8 (invocação-alvejável + respawn) é o mecanismo mais pesado do balde MECANISMO REAL: exige que invocações virem corpos que o inimigo mira e derruba — um subsistema que toca `alvosValidos`, o `bater` (dano EM invocação, não só DE invocação), a morte de invocação e a IA. As opções na mesa eram (a) Fera alvejável (fiel, pesada), (b) Fera-guarda (reúso do mecanismo de guarda-isca, mas adiciona papel defensivo que a prosa não pede) e (c) adiar.

**O dono escolheu (c) — adiar para leva própria.** Motivo: o mecanismo mais pesado não deve sair como meia-medida encaixada no fim de uma leva; merece desenho dedicado (o subsistema de invocação-alvejável desenhado com calma, provavelmente destravando outras invocações futuras de uma vez). **Cernunnos sai da fila da Fase B e vira leva solo**, depois do B4/B5. Registrado para não reaparecer como "o que faltou" — é adiamento deliberado, com endereço (o subsistema alvejável), não esquecimento.

**Fase B revisada:** B3 fechou com o Guan Yu só (o M7 compôs); B4 (kali/shutendoji/raijin, os rebaixados) segue; B5 é o bloco final (dagda/khonshu/yamato/exu); e o **Cernunnos é a leva solo pós-B5**.

---

## §132 — FASE B / B3-a (Guan Yu, M7): o delegado COMPÔS (3º §106); imuneA lê estado e DESTRAVA o Yamato; e o padrão §122 do acoplamento

**Guan Yu, o M7. Traduzido antes de escrever. IMPL 91 → 92, FUNCIONAL 92.** As respostas às perguntas do dono, verificadas CONTRA o motor (não assumidas — a lição do stripBuffs):

**Q1 — o M7 é composição? SIM, 3º caso do §106.** O `contraAtaca` era self (quem é atingido revida). Delegar é a MESMA operação com o sujeito trocado — exatamente o `intercepta.protege` (§107) e o `evadeControle` gêmeo do `evadeContra` (§131). Testei: o `contraAtaca` NÃO lia `protege` no consumo (era só self). Adicionei (a) um fx `contraAtaca` standalone com `protege:'alvo'|'time'` e (b) um segundo laço no bater que varre os aliados do atingido por um protetor. **Bug pego no probe (§115 de novo):** o check self-contraAtaca disparava mesmo com `protege` de OUTRO — o portador se contra-atacava quando ELE era atingido, não só quando o aliado era. Corrigido gateando o self-check por `(!protege || protege===self || protege==='time')`. Leitura nenhuma pegaria: o campo `protege` existia na aplicação mas o CONSUMO não o respeitava — outra junta-não-ligada (§129), agora fechada.

**Q3 CONFIRMADO ANTES de assumir — imuneA lê estado, e isso DESTRAVA metade do Yamato.** O dono avisou "confirme antes de assumir, porque foi assim que errei o consumidor do stripBuffs". Confirmei: `imuneA` não lia `estado`; adicionei `if (f.estado && !estadoOK(...)) continue` (1 linha). Guan Yu ("imune a Medo com 3 aliados vivos") funciona, E a mesma linha atende o Yamato ("imune a controle com 15+ Combo", a pendência que o §116 marcou no comentário l.152). **Desta vez a hipótese de acoplamento se confirmou** — porque foi verificada, não assumida. O resto do Guan Yu compõe: reducao-com-estado (aliadosVivos, existente), `porAliadoVivo` (scaler novo, gêmeo do porDeficitAliados §126). Guan Yu é MECANISMO REAL LEVE (como o Saci §130): o eixo novo (delegar) compôs.

**A LACUNA do Cernunnos (B3-b) — confirmada contra o motor, hipótese do dono NÃO se sustenta.** O dono perguntou onde mora o timer de respawn e supôs "se for no dono, é a lista `pendente` que já existe → M8 menor". Verifiquei: **o timer é o problema fácil; o difícil é a Fera ser ABATÍVEL.** `alvosValidos` mira só `units` — invocações NÃO estão lá, então o inimigo não consegue atingir uma invocação 'dano'. A Fera "30 de HP que cai" precisa ser um CORPO alvejável, e o modelo atual só deixa a `guarda`-isca morrer (interceptando, l.834), não uma invocação de dano. Então o M8 NÃO é só um timer: é invocação-alvejável + morte + respawn. **A hipótese "menor do que o nome" não se sustenta** — e (de novo) só o motor rodando mostrou isso, não a leitura. O timer em si pode morar no lado (a `invocacoes` já tica no iniciarTurno), NÃO no `pendente` do dono (invocação não é unidade; o pendente dispara em 1 turno, não 2). Levado ao dono como fork ANTES de construir.

---

## §132.1 — DOIS PADRÕES do dono, registrados: hipótese-de-acoplamento (§122 nesta forma) e o §46 no LIMITE (a preposição ausente)

**(1) "X traz Y de volta" / "X trava por Z" é HIPÓTESE SOBRE O ACOPLAMENTO — e o acoplamento é o que só o build revela (2º caso do §122 nesta forma).** Duas vezes agora o dono nomeou o acoplamento errado:
- **Exu (§121):** nomeado "trava por M2/iniciativa"; travava por mira-por-opção (a habilidade), não pelo M2.
- **stripBuffs (§131):** nomeado "o Loki o traz de volta"; quem o traz é o Yamato (o realoca do Loki remove internamente).
O padrão: quando eu (ou o dono) digo "X acopla com Y", isso é uma hipótese sobre uma LIGAÇÃO entre duas peças — e a ligação, por definição (§129, §115-forma-do-dono), é o que a leitura de qualquer peça isolada NÃO contém. **Corolário: toda afirmação de acoplamento ("traz de volta", "trava por", "destrava", "depende de") é hipótese até o build; verificar antes de sequenciar por ela.** (Foi o que salvou o Q3 do Guan Yu: confirmado, não assumido.)

**(2) §46 no LIMITE: a prosa carrega informação na preposição que ela NÃO usa.** O destino do roubo do Loki (§131) foi decidido pela AUSÊNCIA de "para": "rouba dos inimigos" (só fonte) vs "transfere para eles" (destino explícito) → sem "para", o destino é o sujeito. **Regra para o catálogo de tells:** destino não-nomeado ⇒ destino = sujeito (o lançador). É a forma mais fina do §46 até agora — antes a fratura morava numa preposição PRESENTE (por-ataque × por-golpe, §126); agora mora numa preposição AUSENTE. A varredura por tell lê a frase inteira E o que ela deixa de dizer.

---

## §131 — FASE B / B2 (Loki, M5): UM mecanismo parametrizado (realoca), não dois; e o stripBuffs volta com o YAMATO, não com o Loki

**Loki, o M5. Traduzido antes de escrever. IMPL 90 → 91, FUNCIONAL 91.** As três perguntas do dono, respondidas contra o motor:

**Q2 — o M5 é UM mecanismo ou dois?** UM, parametrizado. "Rouba buffs" e "transfere debuffs" têm direção e destino DIFERENTES (§46: a fratura mora aí), mas a OPERAÇÃO é idêntica: *mover todos os efeitos de uma categoria de um conjunto A para um conjunto B*. Construí `realoca {categoria, de, para}` — um código, dois usos: `{buff, inimigos, self}` (rouba) e `{debuff, time, inimigos}` (transfere). A direção/destino são PARÂMETROS, não dois caminhos (a varredura §78 de novo: um source parametrizado, não N). A remoção-da-fonte é INTERNA ao realoca (coleta+aplica+remove atômico), parametrizada por categoria — serve as DUAS metades.

**Q3 — destino do roubo?** Para o LOKI (o lançador). A prosa dá só a FONTE ("rouba ... DOS inimigos", via "dos") e nenhum destino; "transfere ... PARA eles" dá o destino explícito (via "para"). Como "rouba" nomeia só a origem, o destino default é o sujeito (Loki). Logo: **cai de graça, sem mira nova** (para:'self'). §46-por-preposição de novo — a preposição decide a direção, e a AUSÊNCIA de "para" decide o destino.

**Q1 — migração do Saci: FEITA na mesma leva.** O `stripOne` do Saci (§130, aproximado como "remove") virou roubo real: adicionei o flag `rouba` ao stripOne (o buff removido vai p/ o lançador) — ~1 linha no executor. Saci agora "rouba 1 buff" fielmente (o buff sai do inimigo e entra no Saci). Fecha a aproximação da §130 retroativamente, como a Afrodite fechou com o dominado (§99). NOTA: é um mecanismo DISTINTO do realoca — stripOne-rouba move UM buff (escolha/seletor), realoca move TODOS de uma categoria. Não se fundem (§59: dois usos com cardinalidade diferente não justificam abstração).

**A CORREÇÃO do stripBuffs (o dono mandou distinguir política de argumento) — e uma inversão a mais:**
- **Política certa, argumento errado (§113):** o §113 removeu o stripBuffs dizendo (a) política: "remove, não guarde — volta com o consumidor" e (b) argumento: "nenhum deus do catálogo o pede". A política ACERTOU (o produtor-órfão saiu e a peça voltaria com quem a usasse). O argumento ERROU — o Yamato pede "remove todos os buffs dele". **Distinção registrada: a política pode estar certa APESAR de o argumento que a sustentou estar errado.** Não confundir "a decisão foi boa" com "a razão dada foi boa".
- **A INVERSÃO que o build revelou (correção à expectativa do dono):** o dono disse "o Loki traz de volta o stripBuffs". NÃO trouxe. O M5 do Loki é RELOCAÇÃO (realoca), e o realoca faz a própria remoção internamente — não precisa de um `stripBuffs` avulso. O `stripBuffs` PURO (remove-tudo SEM destino) é o que o **Yamato** pede (remover ≠ mover: Yamato só apaga os buffs do alvo, não os leva a lugar nenhum). Então **o stripBuffs volta com o YAMATO (B5), não com o Loki (B2)** — a §113 "volta com o consumidor" continua certa, mas o consumidor é outro. É o §122 de novo: nomear o consumidor é hipótese; o build achou o consumidor real num slot que ninguém tinha olhado.

**Loki, o resto:** passiva `evadeControle` (a 1ª tentativa de controle por turno falha — gêmeo do `evadeContra` do Saci §130, no eixo controle: flag `controleNoTurno` em aplicar, ao lado do `golpeUnicoNoTurno` no bater); habilidade Ilusão = Inalvejável + `redirect` (§62, existente). Loki bate o balde MECANISMO REAL: realoca (novo) + evadeControle (novo) + reuso.

---

## §130.1 — DUAS DISTINÇÕES que evitam conclusões erradas: "piso do balde" ≠ "balde errado"; e catálogo que CORRIGE ≠ catálogo que CONFIRMA

**Registradas a pedido do dono, porque cada uma bloqueia uma leitura errada tentadora.**

**(1) "Menor que o balde sugere" NÃO significa "no balde errado" (Saci, §130).** O Saci é o PISO do MECANISMO REAL — o membro mais leve — mas ainda É MECANISMO REAL (precisou de um gatilho, não de um campo). A intuição do dono acertou a POSIÇÃO dentro do balde; a §116 acertou o BALDE. As duas convivem. A conclusão errada a evitar: "o Saci saiu leve → a §116 errou o balde dele". Não errou — estimar a posição-dentro-do-balde é um eixo diferente de estimar o balde, e a §124 (o erro não inverte de balde) segue intacta: nada saiu ABAIXO do próprio balde.

**(2) Um catálogo que cresce pelo SILÊNCIO se CORRIGE; um que só cresce ao acertar se CONFIRMA (§130).** O tell do Saci foi achado porque o catálogo estava CEGO para ele (a varredura §128 não achou tell, e o Saci saiu leve mesmo assim → havia uma assinatura não-catalogada). Catalogar a partir do silêncio (a 14ª assinatura, evade-e-contra) é o catálogo detectando a PRÓPRIA lacuna — auto-correção. Se ele só ganhasse assinatura quando confirma um acerto, seria auto-confirmação (só validaria o que já sabe). **O que valida o catálogo como ferramenta é ele encontrar o que NÃO sabia, não repetir o que sabia.**

---

## §130 — FASE B / B1 (Dionísio + Saci): Dionísio pesado (bate o balde), Saci o MAIS LEVE do balde — mas nenhum caiu abaixo dele

**Primeira leva da Fase B, sequenciada por AFINIDADE de mecanismo: os dois que dependem do M1 (agendador, §117, já existe). Traduzi os dois juntos antes de escrever (§124). IMPL 88 → 90, FUNCIONAL 90.**

**Dionísio — PESADO, bate o balde MECANISMO REAL.** Dois mecanismos novos + o M1:
- **`negaOrbe`** (passiva Êxtase): cross-side — enquanto Dionísio vive, INIMIGOS com os controles listados não geram orbe. Estende a exclusão de renda (que já barrava adormecido/submerso/dominado) para `selado`. Lido no iniciarTurno do lado inimigo (a passiva de um lado mexe na RENDA do outro — precedente do Heimdall/protegeOrbe, invertido).
- **dominar em MASSA** (milagre Bacanal): cada inimigo vira vítima e bate num aliado dele; alvo do fogo-amigo DETERMINÍSTICO (1º vivo ≠ ele). Disparado pelo M1 ("no próximo turno") — telegrafado, resolve no próximo turno de Dionísio. Ressalva de timing registrada: o M1 dispara no turno do DONO, não no turno dos inimigos, então "no próximo turno, os inimigos usam o Básico" acontece na virada de Dionísio, não na deles — aproximação aceita do M1 (§117).
- silêncio "só Básico" = `selado` (que já trava Hab+Milagre — reuso, não mecanismo).

**Saci — o MAIS LEVE do balde, mas NÃO caiu abaixo dele.** Um único gatilho novo (`evadeContra`: o 1º golpe único por turno falha + revida v, lido no bater sobre o flag primeiroPorTurno §88); TODO o resto compõe de peças existentes: básico dmg+dot; habilidade Inalvejável + M1 (agenda o roubo-de-buff p/ "ao voltar"); milagre roubaOrbe + lockSkill. **Resposta direta à pergunta do dono ("algum é menor que o balde?"):** Saci é o membro mais LEVE do MECANISMO REAL — mas ainda precisou de UM mecanismo real (o `evadeContra` é gatilho, não campo). Então **não caiu de balde** — §124 intacto (nada saiu ABAIXO do próprio balde; a direção do erro não inverteu). O que a §116 acertou foi o balde; o que a intuição do dono acertou foi a POSIÇÃO dentro dele (o piso).

**O tell previu o tamanho? Sim para um, silêncio para o outro — e o silêncio virou uma assinatura nova.**
- **Dionísio:** o tell-de-mecanismo "usa o Básico contra aliados deles" (§128) previa dominação em massa → previa PESADO. Confirmado. O tell-de-mecanismo acertou o tamanho porque nomear o mecanismo já dimensiona.
- **Saci:** a varredura §128 não achou tell ("nenhum tell conhecido") — o catálogo estava CEGO para ele. Agora sei por quê: faltava a assinatura. Registro a **14ª**: **"o primeiro ataque ... falha; quando falha, contra-ataca"** → EVADE-E-CONTRA (esquiva-do-1º-por-turno + revida). É tell-de-mecanismo (classifica), e a lição é a mesma do §128: o catálogo cresce ao encontrar o silêncio, não só ao confirmar o acerto.

**Aproximação registrada (irmã da §123.1):** Saci "rouba 1 buff" virou "remove 1 buff" (`stripOne`). Roubar (mover o buff pro Saci) é M5 (Loki, B2); remover erra p/ menos (Saci não ganha o buff) mas mantém Saci leve. Anotado: se o M5 do Loki (B2) generalizar o roubo-de-buff-único, o Saci pode migrar de `stripOne` p/ o roubo real.

---

## §129 — 5ª ESPÉCIE DE ÓRFÃO: a JUNTA-NÃO-LIGADA (leitor certo + alimentador presente mas que não produz o que o leitor espera)

**A Hel (§127) expôs uma espécie que a varredura de órfãos do §113 não cobria.** As quatro espécies do §113 olham UMA peça de cada vez:
1. **etiqueta-sem-enforce** — um status/rótulo que nada faz cumprir.
2. **campo-sem-fio** — um campo escrito e nunca lido (ou vice-versa) DENTRO de uma estrutura.
3. **prosa-sem-fx** — a prosa promete o que o fx não faz.
4. **produtor-sem-consumidor** — um fx produz algo que ninguém lê (saída morta).

**A 5ª — JUNTA-NÃO-LIGADA:** o LEITOR existe e está certo (`matar` checa `dots.some(d => d.naoRevive)`), o ALIMENTADOR existe e está certo (`aplicarDot` aplica DoTs corretamente) — mas o alimentador **não produz a propriedade específica que o leitor espera** (`aplicarDot` nunca copiava `naoRevive`). As duas peças passam na inspeção individual; NENHUMA está errada. O defeito é a JUNTA entre elas — a ligação que faria a saída de uma casar com a entrada da outra.

**Por que nenhuma varredura ESTRUTURAL a acha:** as quatro espécies são detectáveis lendo uma peça (existe o enforce? o campo é lido? a prosa bate com o fx? a saída é lida?). A 5ª não mora em peça nenhuma — mora ENTRE duas, e cada uma, lida sozinha, está completa e correta. É a forma mais pura do §115 que o dono nomeou (§127): **a fonte não contém a informação porque a informação É a junta.** Só o motor RODANDO (aplicar o DoT e depois matar sob ele) expõe que a ligação não fecha.

**Distinção da 4ª (não confundir):** produtor-sem-consumidor = há saída, ninguém lê (desperdício). Junta-não-ligada = há leitor E há produtor, mas o produtor não emite o que aquele leitor consome (promessa meio-wireada). Uma é saída órfã; a outra é uma ponte com um vão no meio.

**Consequência e decisão (o dono):** se existe uma vez, provavelmente existe outras — um leitor especulativo escrito "para o futuro" cujo alimentador nunca veio (a l.905 era literalmente comentada "Marca da Morte da Hel", um leitor plantado à espera). **MAS não varrer agora:** a Fase B é curta e a varredura por-junta é cara (é O(pares de peças), não O(peças) — tem de cruzar cada leitor com cada produtor possível). **Anotado para o FIM da Fase 1**, quando os 100 kits estiverem escritos e a varredura puder cruzar tudo de uma vez — o mesmo critério de custo do §113 (varrer quando a cobertura compensa o preço).

---

## §128 — FECHO DA FASE A: o balde HOOK ZEROU; os 12 restantes são TODOS MECANISMO REAL; e o catálogo de tells cresceu de 5 p/ 13

**Fase A completa (6 HOOK: Susanoo/Kitsune/Anúbis §126 + Hel/Morrigan/Tanuki §127). IMPL 79 → 88, FUNCIONAL 88.** Os dois entregáveis combinados:

**(1) Lista atualizada do MECANISMO REAL — o balde HOOK está VAZIO.** Os 12 deuses não-escritos são AGORA, todos, MECANISMO REAL:
- **9 originais do §116:** dionisio, saci, exu, dagda, khonshu, yamatotakeru, loki, guanyu, cernunnos.
- **3 rebaixados de HOOK (§125/§127):** kali, shutendoji, raijin.
Não sobrou nem JÁ-DÁ nem HOOK. A cauda da Fase 1 é pura de mecanismo grande — o que valida a §116 mais uma vez: os baldes de baixo esvaziam primeiro, o erro-de-um-degrau já foi todo pago (nada mais pode vazar PARA CIMA, MECANISMO REAL é o teto). Ressalva honesta: o **saci** lê mais leve que o balde (evasão+contra-ataque + inalvejável-then-rouba + lockSkill parecem quase compor de primitivos) — mas §124 diz que o erro nunca inverte (nunca super-estima), então NÃO afirmo que ele é HOOK sem traduzir; anoto a suspeita p/ traduzir cedo.

**(2) Triagem TELL-DIRIGIDA dos 12 — o catálogo funcionou como discriminador limpo.** As 5 assinaturas de ARRASTO ("no fim do turno", "quando ele agir", "cada alvo/golpe", "mesmo derrotado", "por golpe/alvo") dispararam em EXATAMENTE os 3 rebaixados (kali=no-fim-do-turno; shutendoji=quando-ele-agir + por-alvo; raijin=cada-alvo-atingido) e em NENHUM dos outros 9. Zero falso-positivo, zero arrasto-surpresa. Como os 9 já são o balde-teto, não há para onde vazarem — o catálogo de arrasto não tinha o que achar neles, e corretamente não achou.

**Oito assinaturas NOVAS (de MECANISMO, não de arrasto) — o catálogo dobrou.** Os 9 sem tell-de-arrasto carregam, cada um, uma assinatura que NOMEIA o mecanismo (classe diferente: não prevê que arrasta, prevê O QUE é). Registradas p/ virar a ferramenta de triagem da Fase 2:
1. **"age primeiro"** → M2 iniciativa (exu, dagda) — já era o tell do Hermes (§121); agora catalogado formalmente.
2. **"rouba todos os buffs / transfere os debuffs ... para"** → M5 realocação de status (loki).
3. **"se ele derrubar/matar um aliado, [sofre/…]"** → M3 marca-retaliação-por-evento-futuro (khonshu).
4. **"o próximo ataque dele é [puro/…]"** → modificador de próximo-golpe (yamatotakeru; família da acaoPerfeita §111).
5. **"contra-ataca quem atingir o aliado"** → M7 contra-ataque delegado (guanyu).
6. **"buffs ... suspensos"** → M6 suspensão temporária de buff, ≠ strip (dagda).
7. **"invoca ... se cair, renasce em N turnos"** → M8 invocação-abatível-com-respawn (cernunnos).
8. **"usam/usa o Básico contra aliados deles"** → dominação em massa (dionisio; dominar §99 em AoE).

**Catálogo de tells agora com 13 assinaturas** (5 de arrasto + 8 de mecanismo). A distinção importa: **tell-de-arrasto** prevê SUB-estimação (JÁ-DÁ/HOOK que sobe de balde); **tell-de-mecanismo** classifica um MECANISMO REAL pela prosa (qual dos M1–M9 / singleton). Para a Fase 2, a triagem tell-dirigida pode bucketar por prosa antes de traduzir — o catálogo melhorou sozinho de novo, e agora tem as duas funções.

---

## §127 — FASE A / Leva 2 (Hel, Morrigan, Tanuki): as duas investigações do dono confirmadas; e §115 na forma "a fonte não CONTÉM a informação"

**Leva 2 dos HOOK, traduzida junto antes de escrever (§124). IMPL 85 → 88, FUNCIONAL 88.** As duas investigações que o dono pediu ANTES do build:

**Investigação 1 — MORRIGAN e a execução diferida (§83/§59).** Varri os 15 não-escritos por um TERCEIRO caso de execução-diferida-por-limiar (o gatilho de revisão do §59). Achados: Hel = DoT-com-naoRevive (não é limiar-em-janela), Kali = ataque-recorrente-no-fim-do-turno (não é execução), Cernunnos = respawn (não é execução). **Nenhum terceiro caso.** Morrigan segue sendo o SEGUNDO (ao lado do Livro do Yan Wong, timer-intrínseco). §59 mantido: NÃO fundir os dois tempos (timer vs limiar). Construí o `pressagio` como leitor separado no fimTurno (~8 linhas), consumidor da marca (se o hp nunca cai, a marca expira inócua).

**Investigação 2 — HEL e o comentário da l.905 ("Marca da Morte da Hel").** O dono suspeitou: comentário que ANTECIPA é da mesma classe do da l.148, que envelheceu errado. **Confirmado, com uma diferença.** O probe contra o motor rodando mostrou: o LEITOR (`matar` checa `dots.some(d => d.naoRevive)`) EXISTE e está certo; mas o ALIMENTADOR (`aplicarDot`) **nunca copiou `naoRevive`** — ele só guardava `{nome,v,dur,origem,escala}`. Então NENHUM DoT podia carregar o carimbo. O comentário não descrevia o motor: descrevia uma INTENÇÃO meio-wireada (a metade leitora feita, a metade escritora não). Diferente da l.148 (que envelheceu ERRADA — descrevia lacuna já preenchida); esta envelheceu INCOMPLETA-mas-coerente. Em ambos os casos a regra vale: **NÃO construir sobre o comentário; construir sobre o que o motor faz.** Fechei a metade que faltava (aplicarDot preserva naoRevive) e aí escrevi a Hel.

**Os acréscimos da Leva 2:** Hel foi a mais movimentada (3 pequenos: `estado` no bonusCura — o executor já lia, faltava o schema; `naoRevive` no DoT; `curaPorAlvo`). Morrigan 1 (execução diferida por limiar). Tanuki 1 (fonte `basicoAliado` no copiar) + a aproximação da abertura ("1 orbe de qualquer elemento" virou 1 orbe do próprio elemento — escolha-de-elemento não modelada, irmã da §123.1).

**§115 NA FORMA MAIS CONVINCENTE (o dono nomeou):** o probe pegou dois furos que LEITURA NENHUMA pegaria — o ramo herdando `a.alvo` (§126) e o alimentador ausente do naoRevive (§127). A lição não é "desconfie da fonte". É mais forte: **a fonte NÃO CONTÉM a informação.** Ler o `aplicarDot` dez vezes nunca revelaria que o `matar` espera um campo que ele não escreve — a relação entre os dois só aparece EXECUTANDO. Corolário: quando a pergunta é sobre a JUNTA entre duas peças (uma escreve, outra lê), a leitura de qualquer uma das peças é estruturalmente cega; só o motor rodando expõe a junta.

**E §46 NO NÍVEL MAIS FINO DO PROJETO (o dono mandou escrever assim):** a fratura Susanoo×Raijin (§126) enganou por uma PALAVRA FUNCIONAL — a preposição em "por *ataque*" vs "por *golpe*" — não por um substantivo. O rótulo que engana (§46) opera até no nível da preposição. **Consequência operacional para a triagem por tell: ler a FRASE INTEIRA, não os termos.** Uma varredura que casasse só substantivos ("Combo", "dano", "orbe") perderia a fratura; ela mora na função gramatical que liga os substantivos. O catálogo de tells (§128) é de FRASES/padrões, não de palavras-chave, por causa disto.

---

## §126 — FASE A / Leva 1 (Susanoo, Kitsune, Anúbis): os 3 seguraram como HOOK; o tell "por-ataque × por-golpe" CONFIRMADO

**Primeira das duas levas de 3 dos HOOK (§125). Traduzi as três juntas antes de escrever (§124). Todas seguraram — IMPL 82 → 85, FUNCIONAL 85.** Um acréscimo de motor por deus (Anúbis levou dois, ambos pequenos):

- **Susanoo** — 1 scaler novo `porDeficitAliados` (piso 0: "+6 por aliado a MENOS que o inimigo"; +0 quando se tem mais). O feed de Combo saiu SEM motor novo: `contador pool:'lado' v:2 max:20` nos slots de ataque (o teto 20 é o `max` do addContadorLado; o milagre NÃO re-gera, só consome — "consome todo o Combo" vence "cada ataque gera"). básico stripOne + habilidade multi-golpe §92 + milagre `consomeContadorLado` já prontos.
- **Kitsune** — 1 acréscimo: `reducao` ESCALADA por contador (reducaoDeclarativa passou a somar `escalaContagem`; "a cada 3 Caudas, +5"). A isca saiu SEM motor novo: `intercepta {protege:'time', contra:'unico'}` já existia (o motor até nomeava "isca" na l.791) e se consome no 1º golpe único. Domina-com-5-Caudas = `condicional {se:{contador}}` (estadoOK) + `dominar` (§99), tudo pronto.
- **Anúbis** — 2 acréscimos pequenos: a condição comparativa `alvoMaisDebuffs` (conta debuffs vs buffs, ≠ presença) e o FECHAMENTO da pendência §87 (condicional POR-ALVO em AoE). O resto pronto: `antiReviveContador:'atadura'` + `bonusDano porContador onde:'alvo'` (+2 por Atadura, escopo:time).

**§87 fechada (condicional AoE por-alvo).** Era pendência desde o Hórus. O Anúbis milagre forçou: "+2 Atadura em todos; quem chegar a 4 → Selado". Agora, quando o `se` lê o ALVO, a condicional ramifica sobre o CONJUNTO (alvos escolhidos, ou o escopo AoE) — cada alvo avalia o próprio `se`. Alvo único cai no laço uma vez → Freyja/Osíris/Ammit intactos (regressão verde). **Bug pego no probe (§115 ganhou o dia de novo):** o ramo herdava `a.alvo='todosInimigos'` e re-expandia o `apply` p/ TODOS os inimigos (selava os 3, não só os ≥4). Corrigido forçando `a.alvo` a alvo-único na recursão por-alvo. O probe contra o motor rodando pegou; a leitura da estrutura não teria.

**O tell "por-ataque × por-golpe" CONFIRMADO (o teste que o dono cravou).** A §125 previu: Susanoo é "cada *ataque* gera Combo" (escrevível hoje), Raijin é "cada *golpe/alvo atingido*" (gancho no bater). **Susanoo saiu limpo no feed de Combo — o tell se confirma como discriminador utilizável.** A mesma palavra ("gera Combo") separa dois destinos de escrevibilidade pela preposição que a acompanha: *por ataque* (por-ability, um fx fixo) vs *por golpe* (por-hit, gancho no executor de dano). **Registrado porque é sutil e reaparece:** sempre que a prosa disser "por/a cada [ataque|golpe|alvo|acerto]", desambigue ANTES — ataque=ability (fx fixo), golpe/alvo=hit (gancho). É o §93 no nível mais fino visto até aqui: dentro de um par que a triagem tinha unido (os "dois geradores de Combo"), a fratura mora numa preposição.

**Placar da Fase A:** Leva 1 fechada (Susanoo 80? não — IMPL 83, Kitsune 84, Anúbis 85). Falta a Leva 2 (hel, morrigan, tanuki). Ao fim da Fase A dou a lista atualizada do balde MECANISMO REAL (agora +3: kali, shutendoji, raijin) e a triagem TELL-DIRIGIDA dos que sobrarem, como o dono pediu.

---

## §125 — TRADUÇÃO DOS 9 DO HOOK (antes de sequenciar): 6 seguram, 3 vazaram — e os 3 tells estavam TODOS na prosa

**Traduzi os 9 do balde HOOK PEQUENO (§116) ANTES de qualquer sequenciamento (§124: bloco-antes-de-escrever é o instrumento de medida). Cada slot foi verificado contra o MOTOR RODANDO — as funções de dispatch inteiras (escalaContagem, condOK, estadoOK, reducaoDeclarativa, rodarNoAtor, fimTurno), não uma fatia (§115 evita o §113).**

**Seguram como HOOK (6):** susanoo, hel, anubis, morrigan, tanuki, kitsune. Cada um pede um campo/termo/condição sobre framework existente:
- **susanoo** — 1 scaler novo (`+6 por aliado a menos que o inimigo` = déficit-de-unidades). O feed de Combo NÃO vazou: "cada *ataque* gera 2" é escrevível hoje como fx `contador pool:'lado' v:2 max:20` nos 3 slots (por-ataque = por-ability). básico stripOne, habilidade multi-golpe §92, milagre consomeContadorLado — todos prontos.
- **hel** — paridade já existe em estadoOK (reducao gateia); falta só `estado` no bonusCura (curas +8 em ímpares) + heal-por-alvo-atingido. Marca da Morte (DoT puro + naoRevive) já é nomeada no motor (l.894).
- **anubis** — antiReviveContador(Atadura) + bonusDano porContador{onde:alvo} prontos; falta a condição comparativa `mais debuffs que buffs` + resolver a condicional-por-alvo em AoE (a lacuna §87 conhecida).
- **morrigan** — aoCair, noHeal, marca `pressagio` (já em MARCAS) e `alvoMarca:pressagio` prontos; falta 1 leitor no fimTurno (portador de pressagio com hp≤24 → executa).
- **tanuki** — milagre 100% pronto (opcoes dmg-puro/roubaOrbe/dmgUp); falta uma FONTE nova de `copiar` (o Básico de um aliado escolhido) + escolha-de-elemento no orbGain de abertura.
- **kitsune** — dominar-com-limiar-de-contador pronto (condicional estado.contador §114); falta reducao-escalada-por-contador (reducaoDeclarativa não tem escalaContagem) + a isca-intercepta-de-time (o motor já ANTECIPA "isca" na l.791).

**Vazaram para MECANISMO REAL (3):** kali, shutendoji, raijin. Não é campo — é comportamento novo:
- **kali** — o milagre "ataca de graça por 12 **no fim do turno** por 2 turnos" é uma ação-recorrente-agendada no fimTurno (não é DoT: DoT fere o portador; isto ataca o inimigo). O resto da Kali é limpo/hook (passiva porInimigoCaido+aoCair; hab 1 scaler `por inimigo abaixo de 60`).
- **shutendoji** — a habilidade quer, no `noAtor` reativo (aoAgirSobEfeito), lifesteal (`rouba 10 HP` = dmg+cura ao dono) E `roubaOrbe` reativo — rodarNoAtor só faz dmg/dot/apply. Era o risco pré-marcado pela §116 ("roubaOrbe reativo"); cruzou.
- **raijin** — a passiva "cada **alvo atingido** gera 1 de Combo" é feed-de-pool POR GOLPE (precisa de gancho no `bater`, gatilho novo), não escrevível como fx fixo; e a habilidade "18/12/8" é dano posicional-decrescente (≠ split-igual §92). Era o outro risco pré-marcado; cruzou por dois motivos.

**Os três tells estavam na prosa (§124 confirmado):** kali "ataca de graça **no fim do turno**", shutendoji "rouba HP e orbe **[quando ele agir]**", raijin "cada **alvo atingido** gera Combo" + "**18/12/8**". Assinaturas legíveis, todas.

**Leituras para o dono:**
1. **Taxa e direção iguais ao JÁ-DÁ:** ~1/3 vazou (3/9), SEMPRE um balde e SEMPRE para cima (nenhum HOOK acabou sendo JÁ-DÁ escrevível-limpo; o erro nunca inverteu). O teto-com-desconto-de-um-degrau (§124) segurou a terceira vez seguida.
2. **A §116 já tinha pré-marcado 2 dos 3** (raijin, shutendoji) como "perto de escorregar". Acertou os dois. **Errou só o kali** — mas o tell do kali estava na prosa, então uma triagem tell-dirigida (§124) o teria pego. Isto é a prova do §124: catalogar o tell > descontar o balde.
3. **O feed de Combo se PARTE:** a §116 nomeou "Susanoo + Raijin" como os dois geradores. Só o Raijin vaza — porque o tell separa por-*ataque* (Susanoo, escrevível hoje) de por-*golpe* (Raijin, gancho no bater). Mesma família de mecanismo, escrevibilidades opostas — §93 de novo, dentro de um par que a triagem tinha juntado.

**Sugestão de sequência (o dono crava):** os 6 HOOK são levas curtas de 1 acréscimo cada; os 3 que vazaram (kali/shuten/raijin) descem para o balde MECANISMO REAL e entram na fila dos singletons (ao lado de M5–M9), não na franja de acréscimos pequenos.

---

## §124 — A §116 é TETO COM DESCONTO DE UM DEGRAU (taxa + direção juntas); e o tell-na-prosa faz o teto MELHORAR, não só descontar

**Fecho operacional da leva JÁ DÁ (§123). Três coisas que só valem registradas juntas:**

**1. Taxa e direção são inúteis separadas, planejáveis juntas.** "~50% de erro" na triagem soa como ruído — jogaria fora a §116 inteira. Mas o erro observado é **sempre de exatamente um balde, sempre para baixo** (JÁ-DÁ vaza para HOOK, nunca para MECANISMO REAL; a peça é maior do que a prosa sugere, nunca menor). Então a §116 não é estimativa com barra de erro simétrica — é **teto com desconto conhecido de um degrau**: leia cada balde como "isto OU o balde imediatamente acima", nunca dois acima. Isso é sequenciável. Registrar a taxa sozinha teria enterrado o achado; registrar a direção junto o torna uma ferramenta.

**2. Traduzir TODOS antes de escrever QUALQUER UM é o que produz o número honesto.** Se eu tivesse escrito o Osíris primeiro e traduzido o resto depois, o Mimir apareceria como *surpresa no meio da leva* em vez de *fato antes dela* — e a taxa de vazamento viraria anedota, não medida. A tradução-em-bloco é o instrumento de medição; escrever-e-descobrir é o instrumento que a contamina. (Reforça §122: o degrau que não mente só não mente se for dado ANTES.)

**3. O tell-na-prosa faz o teto MELHORAR de verdade.** Todo vazamento até agora teve tell legível na prosa: Mimir "**mesmo derrotado**" (bonusDano sobrevive à morte), Hermes "**age primeiro**" (ordem de turno). Se os vazamentos têm assinatura textual, a PRÓXIMA triagem pode procurá-la ativamente — e aí o teto sobe (menos vazamento não-previsto) em vez de só carregar o desconto de um degrau. **Regra: para cada peça que vaza, registre se o tell estava na prosa e qual era.** O acúmulo desses tells vira o checklist de leitura da triagem seguinte. (É o oposto de descontar: descontar aceita o erro; catalogar o tell reduz o erro.)

---

## §123.1 — DÍVIDA COM ENDEREÇO: a contagem "escolha N" do `opcoes` não é validada no motor (Fase 5, servidor autoritativo)

**Uma das duas aproximações da Nüwa (§123). A do `cleanse`-remove-todos é decisão fechada (err-para-cima dentro do teto, sem primitiva remove-1). Esta é dívida, não decisão fechada — e leva endereço.**

O `opcoes` (idiom do Lugh) aplica os índices que o cliente escolhe (`agir(...,escolhas)`); a contagem "escolha 2" da Nüwa mora na UI e **não é validada no motor** — igual ao "escolha 1" do Lugh, nenhum kit encoda o número. Hoje o jogo é local e o cliente é confiável, então não importa: um cliente honesto manda 2 índices.

**O endereço:** na Fase 5, com **servidor autoritativo**, um cliente adulterado poderia mandar 5 índices e aplicar as 5 opções de um `opcoes` escolha-2. Vira **validação obrigatória** — um campo `escolher: N` no kit (ou por-slot) + checagem no executor (`agir`) e no `valida_kit`. Registrado agora para não reaparecer como bug de balanceamento "misterioso" quando o servidor entrar: o buraco é conhecido, tem dono (o executor de `opcoes` + o validador) e tem gatilho (a virada para servidor autoritativo).

---

## §123 — Leva JÁ DÁ como TESTE do teto §116: 2 de 3 limpos, Mimir arrastou 2 hooks; o balde JÁ-DÁ vazou ~erro-de-um-balde

**A leva não foi só três kits — foi o teste do teto da re-triagem §116 (que marcou 26 kits como JÁ DÁ · HOOK PEQUENO · MECANISMO REAL, tratados como ~80% com erro sempre para cima).** Traduzi os três ANTES de escrever qualquer um (o degrau que não mente, §122):

- **Osíris — LIMPO.** revive `escopo:umCaido` (idiom da Freyja/Deméter, o reviver já limpa os debuffs), heal + escudo-condicional `se{alvoHp abaixo 60}` (a condição lida ANTES da cura — err p/ cima: um aliado a 50 ganha escudo mesmo que a cura o passe de 60), passiva `bonusDano{porAliadoCaido:8, escopo:time}`. Zero engine novo.
- **Nüwa — LIMPO.** `opcoes` escolha-2 (idiom do Lugh: o motor aplica os índices escolhidos, a contagem "2" mora na UI, não é validada — igual ao "escolha 1" do Lugh, nenhum campo novo), milagre escudo+regen no time, passiva `aoCair{quem:aliado}` (idiom da Erínias, `escopo:time` em vez de `self`). Uma aproximação-de-teto anotada: "remove 1 debuff de cada aliado" virou `cleanse` (remove TODOS) — não há primitiva remove-1, e cleanse erra p/ cima (mais generoso), dentro do teto.
- **Mimir — ARRASTOU 2 hooks pequenos.** A cláusula "**mesmo derrotado**" era o sinal (previsível, §122: o bloqueio morava no slot que a prosa faz parecer trivial — a passiva):
  1. `bonusDano.mesmoMorto` — o gate de vivo em `bonusDanoDeclarativo` virou **por-fx**: `if (!u.vivo && !f.mesmoMorto) continue`. Antes pulava a unidade morta inteira; agora um fx marcado sobrevive à morte do dono. Prova do gate por-fx: um `bonusDano` SEM a flag (Osíris) morto contribui 0 mesmo virando um caído que faria o `porAliadoCaido` render.
  2. `naoRevivivel` (gatilho sem payload) — self-direction do naoRevive (§119: a família de morte por eixo; este é o eixo "eu mesmo não volto", ao lado do `abateNaoRevive` matador-bound do §118). Reader no `matar`, keyed pela passiva do MORTO. Nota de escrevibilidade: o zeraCd-de-aliado do milagre NÃO arrastou — `cdShift{unidade:true, v:-99}` já zera todas as recargas de um alvo (idiom do Brahma).

**Leitura do teto (o que o dono pediu no fecho):**
1. **Quantos JÁ DÁ saíram limpos:** 2 de 3 nesta leva (Osíris, Nüwa). Contando o Hermes (o 4º que a §116 marcou JÁ DÁ e que a §121 mostrou arrastando a regra de iniciativa): **~2 de 4 = metade do balde JÁ-DÁ vazou.**
2. **O que arrastou e se era previsível:** Mimir (cláusula "mesmo derrotado" = tell claro) e Hermes (iniciativa). Ambos vazaram **para HOOK-sized, nunca para MECANISMO REAL** — o teto segurou DIRECIONALMENTE (o erro é sempre de um balde, nunca dois).
3. **O balde HOOK PEQUENO (9) merece re-verificação antes de sequenciar?** SIM. Com ~50% de vazamento JÁ-DÁ→HOOK, a mesma taxa marginal provavelmente empurra alguns HOOK→MECANISMO REAL. O erro-de-um-balde é a lei observada; então traduzir os 9 do HOOK ANTES de sequenciar por eles, senão o plano herda o mesmo viés-para-baixo que a §116 já demonstrou ter.

**IMPL 82, FUNCIONAL 82.**

---

## §122 — NOMEAR O BLOQUEIO é hipótese sobre um SLOT, não sobre o deus: a peça nomeada pode estar pronta e OUTRA travar

**Segunda vez nesta forma exata (Krishna §111, Exu §121).** Quando o dono (ou eu) diz "esse deus trava no mecanismo X", isso
é uma hipótese sobre UM slot — e a varredura §93 repetidamente mostra que o slot nomeado está PRONTO enquanto um slot que
ninguém olhou é o que arrasta:
- **Krishna (§111):** nomeado "a cola da Ação Perfeita" (habilidade). A cola saiu; a PASSIVA arrastou um rastreio de dano
  que ninguém tinha olhado.
- **Exu (§121):** nomeado "M2 / iniciativa" (passiva). A passiva saiu de graça (regra de setup); a HABILIDADE arrastou
  mira-por-opção em lados opostos.

**A regra:** o rótulo de bloqueio ("trava no X") aponta um SLOT, não o deus. Antes de aceitar que um deus fecha (ou trava)
por causa de X, **traduza os QUATRO slots** — o slot nomeado é a hipótese mais visível, logo a menos informativa (§46: o
nome do bloqueio não é evidência do bloqueio). O bloqueio real mora com frequência no slot que a prosa faz parecer trivial.
Corolário operacional: a tradução-dos-quatro-antes-de-escrever (o degrau que não mente) é justamente o que expõe o slot
não-nomeado — por isso ela vem ANTES do veredito de escrevibilidade, não depois.

---

## §121 — M2: "age primeiro" = SER O STARTER (regra de setup, sem tocar o laço); Hermes fecha, Exu arrasta, Dagda ao fim

**Última das quatro de sistema (§116), a que o dono adiou por ser a mais cara de errar (mexe no laço). O desenho antes de
qualquer linha mostrou que NÃO precisa tocar o laço — para dois dos três.**

**LEITURA-DE-INTENÇÃO (§113), decidida pelo dono: "age primeiro" = LIDERAR a rodada, e no modelo 1-1 isso é SER O STARTER.**
O laço é alternância estrita (`st.ativo` flipa, `st.turno++` quando volta ao starter) → o starter lidera TODA rodada,
automaticamente. Então "age primeiro" (Hermes T1, Exu sempre) colapsa em "ser o starter" — uma regra de SETUP (`novoEstado`
força `comeca`), NÃO uma mudança no laço. Dois motivos do dono: (1) o jogo JÁ precifica abrir como vantagem (o starter recebe
1 orbe, não 3 — "desvantagem de iniciativa"), então liderar-sempre é a vantagem pretendida, com custo já pago; (2) golpe-extra
quebraria os NOVE pontos que assumem alternância (DoT/orbes/recarga/durações/fase/curadoAntes/danoAntes/golpeUnico/contador
de turno), o que prova que golpe-extra NUNCA esteve no modelo — se a prosa o quisesse, a estrutura de turno seria outra desde
o início. **Gatilho de revisão:** se um dia o laço permitir turno extra, os três (Hermes/Exu/Dagda) voltam à mesa.

**Simetria com o §113 (Nezha):** lá a letra era vacuamente VERDADEIRA (`u.agiu` sempre true no lançamento → "+10 sempre");
aqui a letra (golpe-extra) é estruturalmente IMPOSSÍVEL (quebraria o laço). Duas formas de "a letra não pode ser o que diz",
e nas duas a leitura correta é **a única que o modelo comporta** — não a mais literal.

**A regra (regra de setup, ~8 linhas, ZERO no laço):** `novoEstado` checa a passiva `iniciativa` nos dois lados. Um só lado
a tem → ele é o starter. **AMBOS têm → CANCELAM, e o `comeca` sorteado (o param) vale** (empate DETERMINÍSTICO — cancelar é
mais legível que sortear entre dois efeitos, e não injeta aleatoriedade nova). Nenhum → baseline intacto. O custo de abertura
(1 orbe) segue para quem ganhar o starter por passiva — se não seguisse, a passiva seria mais forte que a prosa.

**§93: a regra fecha o HERMES, mas o EXU ARRASTA (e não pelo M2).** Hermes fecha limpo (Golpe Alado 2×8; Passo Alado cdShift;
Roubo Divino roubaOrbe+stripOne; passiva iniciativa + reducao·único — tudo mecanismo-único). O EXU tem a passiva satisfeita
pela regra, MAS a habilidade "ABRIR (1 aliado zera recarga) OU FECHAR (trava Hab/Mil de 1 inimigo)" arrasta **mira-por-opção
em lados OPOSTOS** (ABRIR mira aliado, FECHAR mira inimigo — alvo único que muda de lado conforme a opção). O `opcoes` de hoje
é escopo-based (Lugh: todosInimigos/time, sem escolha de alvo único); `cdShift{unidade}` bate em TODOS os `alvos` (sem idx);
`'aliado+inimigo'` são DOIS alvos, não "um de cada lado". Não compõe sem um mecanismo novo de mira-por-opção. **Exu ADIADO**
(como Khonshu §118 / yamato §120 — passiva pronta, outro slot arrasta). Inverteu a expectativa "dois deuses por uma regra":
a regra rende UM (Hermes); o Exu espera a mira-por-opção.

**Dagda ao FIM (bloco final), com o loop-reorder e o M6.** "O time age primeiro no PRÓXIMO turno" é o único que MID-MATCH
reordena o laço (turno-duplo/pulo → quebra os nove pontos); + arrasta o M6 (buff-suspension). Adiado até os últimos kits, para
o bug-no-laço (se houver) vir isolado, não confundido com escrita de kit.

**Hermes (IMPL 79, FUNCIONAL 79).** Isolamento em `primitivas §30` (um lado abre; ambos cancelam; nenhum = baseline; custo de
abertura preservado); comportamento em `passiva §121`. **BLOCO FINAL pendente (para sequenciar quando os ~21 kits restantes
estiverem escritos): Dagda (M2-reorder + M6), Khonshu (M3-marca-retaliação + M9), yamato (M4-condicional + próximo-golpe-puro +
stripBuffs), Exu (mira-por-opção).**

---

## §120 — M4: a imunidade-a-MECÂNICA (contágio) é o irmão da execução (§84); izanagi fecha, yamato adia com a CONDICIONAL

**Terceira das quatro de sistema (§116). O comentário do motor (l.148) nomeava as duas lacunas — e ENVELHECEU: dizia
"não cobre execução/contágio", mas execução JÁ era coberta (Sun Wukong, §84, `'execucao'` em IMUNIZAVEIS).** Corrigido: a
imunidade-a-MECÂNICA existe (execução); contágio é o IRMÃO — mesmo padrão, +1 valor (`'contagio'`) +1 site de enforcement
(`espalharContador`). §115 na prática: o comentário era a fonte, e a fonte estava desatualizada; confirmei contra o código.

**As duas lacunas NÃO são a mesma família (§46):**
- **contágio (izanagi) = imunidade-a-MECÂNICA** — "imune a qualquer efeito que se espalhe". Cabe no lugar da execução (§84):
  `'contagio'` em IMUNIZAVEIS + um `if (imuneA(u,'contagio')) continue` no `espalharContador`. O M4-real.
- **condicional (yamato) = imunidade-a-controle-COM-condição** — família própria, ADIADA (ver abaixo).

**izanagi FECHA com o M4 (§93) — mas arrastou DUAS extensões pequenas de imunidade, ambas coerentes com a família:**
1. **team-scope:** "O TIME é imune" — o `imuneA` lia só o PRÓPRIO; agora VARRE o lado (escopo self default / 'time' protege
   todos), espelhando `temIgnoraInalvejavel`/`bonusDanoDeclarativo`. `escopo` entrou nos campos do gatilho imunidade.
2. **bloquear GANHAR o contador:** "imune a Maldição" — o `addContador` passou a respeitar `imuneA(nome)` (simétrico ao
   `aplicarDot`), só no ganho (v>0). No-op para contadores não-imunizáveis (discoSolar/Combo). Junto com o dot-immunity
   (maldicao ∈ DOTS) e o contágio, izanagi fica imune à Maldição por TODAS as vias (dot, contador direto, espalha).
   E o "se removeu uma Maldição" do Misogi cai de graça: `condicional{alvoContador:maldicao}` LIDO APÓS o cleanse (o cleanse
   tira o DOT, não o CONTADOR) → order-independent; as partes sempre-acontecem (cleanse+cura 20) HOISTED para fora do
   condicional (senão o checar_cadeia conta a cura comum 2×).

**yamato ADIADO (como o Khonshu no §118): a CONDICIONAL não é o único bloqueio.** "imune a controle com 15+ Combo" precisa
de (a) o `imuneA` LER `estado` (§96-shape: gate universal que o motor ainda não lê na imunidade) E (b) uma condição de
estado que leia o POOL de Combo (o `estadoOK.contador` lê o contador POR-UNIDADE, não o `contadorLado`). E o deus arrasta
ainda "próximo ataque vira puro" (buff inexistente) e **`stripBuffs`** ("remove todos os buffs dele"). Construir a
imuneA-lê-estado agora seria mecanismo sem consumidor shippável (§61) — sai com o yamato.

**Correção do §113 (§115 de novo):** removi o `stripBuffs` afirmando "nenhum deus do catálogo remove TODOS os buffs". O
yamato remove ("remove todos os buffs dele") — meu scan do catálogo no §113 não o viu. A AÇÃO segue certa (remover-até-o-
consumidor-chegar, como o §113 previu: "volta com o consumidor"); a AFIRMAÇÃO estava errada. O `stripBuffs` volta com o yamato.

**Izanagi (IMPL 78, FUNCIONAL 78):** Lança (12); Misogi (cleanse + cura 20; +10 no time se o aliado tinha Maldição);
Criação das Ilhas (time +20 escudo + regen 8 por 3); Fuga de Yomi (o TIME imune a Maldição e a contágio). Isolamento em
`primitivas §29` (team-scope varre o lado; self não vaza; contágio pula o imune; ganho de contador bloqueado); comportamento
em `passiva §120`.

---

## §119 — A FAMÍLIA DE MORTE se parte por DIREÇÃO — 4 vezes é padrão: varra por direção ANTES de contar

**Quarta vez que "algo relacionado a morte" se revelou não-um-mecanismo, mas vários por DIREÇÃO/sujeito.** As quatro:
§76 (Khnum: `aoCair` self vs aliado — o caído não reage à própria queda); §81 (os sujeitos do `aoCair`: inimigo/self/
qualquerInimigo/aliado); §89 (o `matar` e seus 5 leitores; `porExecucao` vs `aoCair`); §118 (M3: si [Ares] / o morto
[Ammit] / o matador [Khonshu] — três direções, nenhum mecanismo único).

**A regra:** toda vez que uma família nova toca a MORTE (cair, abater, executar, reviver, marcar-o-cadáver), a primeira
pergunta não é "quantos consumidores" — é "**em quantas DIREÇÕES a reação vai?**" (sobre quem morre / quem matou / quem
reage / o time de cada um). A morte tem 3+ participantes, e o rótulo da planilha quase sempre agrupa direções distintas
como se fossem uma. Contar antes de varrer por direção super-conta (parece 1 mecanismo, são 3) OU sub-conta (parece 3
consumidores de 1 mecanismo, são 3 mecanismos). Varra por direção primeiro; o número real cai depois.

---

## §118 — M3 se DISSOLVEU: a "consequência de abate" não é um mecanismo, são três pequenos por DIREÇÃO (Ares, Ammit; Khonshu → M9)

**A segunda das quatro de sistema (§116), e a varredura a desfez — §46 pela 4ª vez na família de morte.** Os três consumidores
"compartilham" um GATILHO (uma morte) mas se partem por DIREÇÃO e por payload; não há um mecanismo M3 único.

- **Ares — sobre SI:** "abati com o Massacre → a recarga volta." Cabe INTEIRO no `aoCair{quem:'inimigo'}` que já existe (o
  matador reage, faz roda em si) + um faz-safe novo `zeraCd` (zera a recarga do próprio). **Divergência conhecida:** dispara
  em QUALQUER abate de Ares, não só o do Massacre (o `quem:'inimigo'` não distingue slot) — mais forte que a letra, registrado
  como o recíproco da Chang'e (§101): divergência com gatilho, não silenciosa.
- **Ammit — sobre o MORTO:** "quem eu derroto não revive." Um LEITOR do `matar` (§89): carimba `naoRevive` na vítima, keyed
  pela passiva do MATADOR (≠ o snapshot que lê o que a VÍTIMA carrega). §81 sujeito C. Alcance cross-side (toca o cadáver),
  mas é FLAG, na mesma zona do snapshot — sem dano, sem re-entrância. + milagre "elimina se Atordoado/Selado/≤30, senão 35":
  o OR de três condições vira `condicional` ANINHADO (ramos senão), execução via `executaAbaixoDe` alto — composto do que existe.
- **Khonshu — sobre o MATADOR:** "marca 1 inimigo; se ele derrubar um aliado, sofre 30." É o único que precisaria de dano
  reativo alcançando o matador (o caso que o `noAtacante` PROÍBE por recursar). **Adiado para o M9**, porque a PASSIVA dele
  ("1× por partida, anula o atordoamento de um aliado") é o próprio M9 (guarda-de-controle-para-aliado) — §116 já o marcava
  M3+M9. Construir a marca-retaliação agora seria um mecanismo delicado para um deus não-shippável (§61). Ele sai no M9, com a
  marca-retaliação junto.

**O eixo `quem` do aoCair JÁ estava completo (§106 não se aplica):** o que faltava não era "de quem é a morte" (self/inimigo/
qualquerInimigo/aliado — todos construídos) e sim PARA ONDE a reação vai. E a resposta não foi estender o `faz` para
cross-side (que abriria dano reativo, a armadilha do `noAtacante`) — foi **leitores do `matar`** (Ammit) e um hook no aoCair
existente (Ares). Os 5 leitores do `matar` (§89) seguem intactos: o de Ammit é um carimbo de flag na zona do snapshot de
naoRevive; o dano-dentro-do-matar (Khonshu) — a parte que exigiria re-verificar re-entrância — foi adiado com ele.

**Veredito (a sua suspeita, confirmada): o M3 real é MENOR que três.** Não há mecanismo M3 único — são um hook (Ares) + um
leitor pequeno (Ammit) agora, e o único que era "mecanismo real" (Khonshu, dano cross-side) migrou para o M9 por arrastar o
M9 na passiva. **Ares + Ammit (IMPL 77, FUNCIONAL 77).** Isolamento em `primitivas §28` (zeraCd só ao abater/no próprio;
abateNaoRevive carimba o morto só se o matador tem a passiva); comportamento em `passiva §118`. O `checar_cadeia` agora
recursa FUNDO no `condicional` (o milagre do Ammit aninha 3 níveis).

---

## §117 — M1: o AGENDADOR de payload (Kukulkán) — lista por-unidade, sem fila global; o revive NÃO absorvido (§106 ao contrário)

**A primeira das quatro de sistema (§116), a menos invasiva.** Um agendador GERAL de "ação telegrafada": um payload de fx
que dispara no PRÓXIMO turno do dono. fx `agendar` (payload `agenda` + `alvo`), guardado numa lista `pendente` por-unidade,
disparado num pass próprio do `iniciarTurno` (unidades vivas, ordem de índice).

**§93 — só UM dos três consumidores fecha com M1 sozinho.** kukulkán agenda "25 a todos" = `dmg` AoE que JÁ existe → fecha.
saci agenda "rouba 1 buff" = buff-STEAL (aquisição, metade do M5) → espera. dionísio agenda "todos os inimigos usam o Básico
contra aliados deles" = dominar-em-massa-agendado → espera. A família (agendamento) coincide; a escrevibilidade não. **M1 é o
mecanismo; kukulkán é o consumidor que o prova.**

**A FORMA (a pergunta do dono): lista por-unidade, SEM fila global.** Os três agendam payloads presos a uma UNIDADE, que
disparam no `iniciarTurno` dela — kukulkán/saci em SI, dionísio em cada inimigo (lado oposto). **Dois payloads nunca caem na
mesma unidade**, então não há colisão a desempatar DENTRO de uma unidade. Quando dois disparam no mesmo turno (dois
agendadores no mesmo time), a ordem cai de graça da iteração por índice que o `iniciarTurno` já faz. Logo: uma lista
`pendente:[]` por unidade (disparo em ordem de inserção), sem fila global com ordenação própria — a forma menor e já
determinística. (Lista, não campo único como o `pendenteRenascer`, por robustez barata caso um dia dois caiam na mesma
unidade.)

**O revive NÃO foi absorvido — e isto é o §106 AO CONTRÁRIO.** O `reviveProximoTurno` é um agendador bespoke; a tentação era
folá-lo no geral (§106, que já se pagou no atordoaMenorHp e no Thor). Mas verifiquei: o revive dispara numa unidade MORTA
(linha 1174, ANTES do `!vivo continue`) e alimenta o `checarFim` (um revive pendente segura o lado vivo). O agendador geral
roda em unidades VIVAS, depois do `continue`. Absorver forçaria um ramo especial "dispara-se-morto" + uma varredura no
`checarFim` — **acrescenta** caso especial em vez de remover dívida. O §106 vale quando o geral JÁ cobre o especial; aqui o
geral não cobre "disparar morto". Então: separados de propósito, e o revive segue intacto (travado em teste).

**Kukulkán (IMPL 75, FUNCIONAL 75):** Presas do Vento (15); Voo da Serpente (Inalvejável 1 turno [dur 2 p/ cobrir o turno
inimigo] + agenda 25 a todos p/ o próximo turno); Estrela da Manhã (20 a todos + time +10 por 2 turnos); Deus-Rei (+8 vs
Encharcados + 1 orbe no turno 1). Isolamento em `primitivas §27` (agendar: guarda no lançamento, dispara no iniciarTurno do
dono, ordem de inserção, dono morto não dispara); comportamento em `passiva §117`; o `checar_cadeia` recursa no `agenda`
(o dano agendado é dano da habilidade).

---

## §116 — RE-TRIAGEM DOS 26 (pós-74 escritos): a cauda concentrou em 9 mecanismos, 4 destravam 10 — e a ordem por RISCO

**Gravado ANTES de sequenciar, como a previsão do §52 — para conferir contra a realidade depois.** Reconciliei os 26 kits
não-escritos contra o motor de hoje (milagre-primeiro §78, teto ~80% erro-para-cima). Cada ausência foi verificada CONTRA O
MOTOR RODANDO (§115), não contra a leitura dos subagentes — o M4 é o melhor caso: o próprio comentário do motor (l.145)
nomeia as duas lacunas de imunidade.

**Os três baldes:**
- **JÁ DÁ (4):** hermes, mimir, osiris, nuwa.
- **HOOK PEQUENO (9):** susanoo, kali, hel, anubis, morrigan, tanuki, shutendoji, kitsune, raijin. (Cada um pede um
  campo/termo/condição sobre framework existente: termo novo em `escalaContagem`, condição comparativa, execução no
  `fimTurno`, `roubaOrbe` em executor reativo, etc. Ressalva de teto: raijin [feed de pool por golpe] e shutendoji [roubaOrbe
  reativo] são os hooks mais perto de escorregar para mecanismo real.)
- **MECANISMO REAL (13):** dionisio, saci, kukulkan, exu, dagda, khonshu, ammit, ares, izanagi, yamatotakeru, loki, guanyu,
  cernunnos.

**Os 9 mecanismos distintos que travam a cauda (não 15 — CONCENTROU):**

| # | Mecanismo | Destrava | Ausência confirmada no motor |
|---|---|---|---|
| M1 | Agendador de payload p/ o próximo turno (ação telegrafada) | dionisio, saci, kukulkan | só `reviveProximoTurno`/`pendenteRenascer` (bespoke do revive) |
| M2 | Iniciativa / ordem de turno | exu, dagda | `st.ativo = 1-ativo` estrito, sem reorder |
| M3 | Consequência de abate com alcance cross-side (onKill/aoCair→abatedor ou cadáver inimigo) | khonshu, ammit, ares | `onKill`/`onDeath` "a crescer" (l.108); aoCair-faz é self/lado |
| M4 | Extensão da imunidade (a contágio + condicional-por-pool) | izanagi, yamatotakeru | l.145 marca os dois como não-cobertos |
| M5 | Realocação de status entre times (rouba buffs + transfere debuffs) | loki | grep vazio |
| M6 | Suspensão temporária de buffs (desativa-e-devolve ≠ strip) | dagda | só strip permanente |
| M7 | Contra-ataque delegado (dmg ao atacante quando o ALIADO é atingido) | guanyu | `noAtacante` proíbe dmg (l.198) |
| M8 | Invocação abatível + respawn após N turnos | cernunnos | invocações fora de `units`, sem timer |
| M9 | Guarda de controle p/ aliado, com carga (nega, não reflete) | khonshu | `refleteControle` é self, sem carga |

(dagda = M2+M6; khonshu = M3+M9.) **Quatro mecanismos de sistema (M1–M4) destravam 10 dos 13; os 5 restantes (M5–M9) são
singletons.** Com 74 escritos, a cauda consolidou como esperado — o custo restante da Fase 1 é ~4 mecanismos de peso + uma
franja de acréscimos pequenos, não 13 levas independentes.

**ORDEM DAS QUATRO DE SISTEMA (decisão do dono, por RISCO não por tamanho): M1 → M3 → M4 → M2.**
- **M1** tem precedente (o `reviveProximoTurno` é um agendador bespoke — generalizar é o padrão §106; talvez ele já quase faça).
- **M3** e **M4** são extensões de eixos que já existem (aoCair/onKill; imunidade).
- **M2** mexe no laço de turno — a coisa mais cara de errar no motor; adiado de propósito, e com 26 kits ainda por escrever o
  argumento de adiar continua valendo. Faz por último.

---

## §115 — VERIFICAR UMA ALEGAÇÃO SOBRE ESTRUTURA LENDO A MESMA ESTRUTURA É REPETIÇÃO, NÃO PROVA

**A generalização do falso-positivo do Lugh (§113).** A alegação era estrutural: "o básico não implementa 'não-evitável'".
A verificação leu o array `fx` — a MESMA estrutura da alegação — e não viu a flag, que morava um nível acima (no objeto da
ação, `ignoraInalvejavel: true`, lido em `alvosValidos`). O subagente leu só o `fx`; eu "confirmei" com um comando que
imprimia só o `fx`. Duas leituras da mesma vista parcial concordaram — e concordância não é prova, é **repetição do ponto
cego**.

**A regra:** a prova de uma alegação tem de vir de OUTRO NÍVEL que não aquele em que a alegação foi feita. Para "o básico
mira o Inalvejável?", a prova não é reler o dado — é **rodar o motor** (`alvosValidos` devolve o inimigo oculto? → true).
É o §85 na direção inversa: lá, um invariante ESTRUTURAL ("nenhum apply de debuff no faz") pede leitura de CÓDIGO, e um
invariante de COMPORTAMENTO pede EXECUÇÃO. Aqui a alegação era sobre estrutura mas a verdade dependia de COMO o motor CONSOME
essa estrutura — então só a execução decide. Quando não sei em que nível a verdade mora, o comportamento é o árbitro: ele
integra todos os níveis (o dado, quem o lê, onde). Reler o dado só confirma o dado.

**A ironia de segunda ordem, escrita porque dói:** o §111 estava CERTO (o básico do Lugh compõe os dois ignores), e a minha
"correção" dele (a Lição A do §113, ontem) era o ERRO. **Um registro corrigido pode ficar pior que o original.** Então
corrigir um registro exige a MESMA prova que criá-lo — não a impressão de que "agora sei melhor". A correção de ontem tinha a
forma de uma lição elegante (o exemplo-que-é-contraexemplo) e nenhuma execução por trás. Elegância não é evidência (§46 no
próprio registro).

**Adendo §120 — afirmação certa-por-coincidência ainda é afirmação errada.** No §113 removi o `stripBuffs` afirmando
"nenhum deus do catálogo remove TODOS os buffs". A AÇÃO era certa (remover primitiva sem consumidor shippável, §87/§61); a
AFIRMAÇÃO era falsa (o yamato remove — "remove todos os buffs dele"). A consequência COINCIDIU com a verdade (o stripBuffs
sai agora e volta com o yamato, exatamente como planejado), então o erro sobreviveu sem custo imediato. **Mas afirmação que
sobrevive porque a consequência coincidiu ainda é afirmação errada — e ela ENVENENA a próxima decisão:** o "não há consumidor
no catálogo" viraria premissa de um sequenciamento futuro, e aí o yamato apareceria como surpresa. Voltar para corrigir o
ARGUMENTO (não só a ação) é o que impede o veneno. Verificar a ação não basta; a afirmação que a justifica também entra no §82.

**Corolário do comentário (a linha 148 do §120):** comentário é FONTE que não se verifica sozinha (só o código roda). E
comentário que descreve uma LACUNA ("não cobre X") envelhece MAIS RÁPIDO que o que descreve COMPORTAMENTO — porque a lacuna
é justamente o que a gente FECHA. Todo comentário-de-lacuna é uma data de validade não-escrita; ao fechar a lacuna (execução,
§84), o comentário que a listava virou mentira e ninguém o revisou. Comentário-de-lacuna deve apontar para o § que o fecharia,
ou ser relido a cada vez que a família cresce.

---

## §114 — IZANAMI: o tique escalado é COMPOSIÇÃO (reusa o escalador do dano), e o 1º porTurno que toca inimigo

**A varredura da família DoT-por-contador, respondida:** o "cada Maldição causa 6 de dano puro por turno" tem **um só
consumidor** (Izanami — a "Marca da Morte" 10/turno é DoT FIXO, os clones são invocação, a Queimadura da Nezha é DoT fixo).
E a pergunta do dono — o tique lê o mesmo escalador do dano de habilidade, ou tem caminho próprio? — deu **composição**: o
laço do DoT no `iniciarTurno` passou a chamar `escalaContagem` (o MESMO helper que o `danoBase` usa para `porContador`),
lendo o contador do PRÓPRIO portador ao vivo. Um DoT ganhou um campo `escala` (spec `porContador`); o tique faz
`v + ampDot + escalaContagem(...)`. Zero caminho novo de dano — o escalador de habilidade e o de tique são o mesmo código.

**A Maldição é UM conceito em DOIS stores.** O contador `maldicao` (o acúmulo: básico +1, passiva +1, espalhado pela
habilidade) e o DoT `maldicao` (o veículo do dano 6×acúmulo/turno, aplicado pela Praga) têm o MESMO nome mas vivem em
`u.contadores` e `u.dots` — stores separados que o motor nunca confunde. O DoT lê o contador; o contador não sabe do DoT.
Registrar o nome duplo de propósito: "Maldição de Yomi" é uma coisa no jogo, duas no dado.

**O 1º porTurno que toca INIMIGO — e o invariante turno-seguro, reafinado.** A passiva "o inimigo de maior HP ganha 1
Maldição por turno" é o primeiro `porTurno` cujo `faz` mira o lado inimigo (até aqui: self/próprio-lado, F1.2.5). **Decisão
(dono): turno-seguro significa "o jogador não ESCOLHE o alvo", não "só o próprio lado".** O `rodarFaz` do `contador` ganhou
o seletor `alvoHp` (auto-seleciona o inimigo de maior HP, como a Deméter §103 auto-seleciona o aliado mais ferido) — a
garantia da F1.2.5 (nenhuma escolha do jogador num gatilho de turno) fica INTACTA; só o LADO do auto-alvo mudou. A Maldição
ser contador NEUTRO (marcador, não debuff) ajuda: não é "controle no inimigo sem escolha", é acúmulo.

**Peças menores:** `alvoContador` — condição nova ("o alvo carrega o contador cruzando {op,n}"), gêmea do `estadoCond.contador`
mas lendo o ALVO; usada no `execIf` do milagre ("elimina amaldiçoados" = maldicao ≥ 1). E o `espalha` (contágio que iguala
todos ao máximo) já existia desde a F1.1 SEM consumidor — Izanami é o consumidor que faltava (resolve 1 dos 4 reservados do
§113; o §61-espelho fecha).

**Izanami (IMPL 74, FUNCIONAL 74):** Toque de Yomi (12 + 1 Maldição); Praga de Yomi (espalha as Maldições ao máximo + DoT
que tica 6×acúmulo/turno); Portal de Yomotsu (20 a todos + executa amaldiçoados com ≤30 HP); Mil por Dia (o inimigo de maior
HP ganha 1 Maldição por turno). Isolamento em `primitivas §26` (DoT escalado reusa escalaContagem; alvoContador gateia a
execução); comportamento em `passiva §114`. **Limpeza dobrada nesta leva:** removido o `stripBuffs` (§113, produtor-sem-
consumidor especulativo — §87) e o comentário obsoleto do `atordoaMenorHp`.

---

## §113 — A VARREDURA DE ÓRFÃOS pós-F1.9: UM item real, e o §82 aplicado a um FALSO-POSITIVO que eu mesmo plantei

**Varri as quatro espécies de órfão nos 73 kits escritos + no motor (a última sistemática foi na F1.8; desde então ~15
mecanismos e ~20 kits novos). Resultado: UM item real (`stripBuffs`). O ritmo das levas não deixou pilha.**

- **etiqueta-sem-enforce: 0.** (selado/agarrar/medo travam slot via `SLOTS_TRAVADOS`; tormento é DoT no tique genérico.)
- **campo-sem-fio: 0.** (todo campo de `novaUnidade`/`novoEstado` lido E escrito; `usos` escreve por índice.)
- **prosa-sem-fx: 0.** (Ver a correção abaixo — o único candidato, o Lugh, era falso-positivo.)
- **produtor-sem-consumidor: 1 morto** (`stripBuffs`, removido nesta leva) **+ 4 reservados** (`espalha`→Izanami,
  `paridade`→Hel, `aliadosVivos`→Guan Yu, `hpProprio`→Shuten — capacidade à frente do consumidor, o espelho benigno do §95)
  **+ 1 comentário obsoleto** (`atordoaMenorHp`, handler já removido no §105; comentário removido nesta leva).
- **nezha (5ª forma, prose≠fx, achada pela varredura):** a prosa do milagre diz "+10 se Nezha já agiu"; o fx faz
  `seAliadoJaAgiu` ("outro aliado já agiu"). Sob o modelo de UMA ação por turno, `u.agiu` já é true quando ela lança o
  milagre → a leitura literal seria "+10 SEMPRE" (mais forte, não mais fiel). **Decisão: MANTER o impl como leitura-de-
  intenção** — "outro aliado já agiu" é o único sentido não-vacuo (combo de time); a `desc` do kit já documenta a versão
  do fx. A premissa de "a prosa é mais estrita" estava INVERTIDA aqui, e por isso a prosa NÃO venceu (≠ Brigid §39): quando
  a letra é degenerada, a intenção vence.

**CORREÇÃO — LIÇÃO A revista (o falso-positivo que eu plantei): verificar contra o MOTOR RODANDO, não contra uma vista
parcial do dado.** Reportei o básico do Lugh como `prosa-sem-fx` ("promete 'não pode ser evitado' mas o fx só tem
`semContra`"). ERRADO. O `ignoraInalvejavel` do Lugh é uma **flag de nível de HABILIDADE** (`"ignoraInalvejavel": true` no
objeto da ação, lido em `alvosValidos`), NÃO um campo dentro do array `fx`. O subagente que varreu leu só o array `fx` e não
viu; e eu "confirmei" com um `node -e` que imprimia só `.fx` — a MESMA vista parcial. Dois §82 compostos: um falso-positivo
que sobreviveu porque a verificação repetiu o erro da fonte. **A checagem certa era rodar o motor** (`alvosValidos` mira o
inimigo Inalvejável? → true). O §111 estava CERTO desde o começo: o básico do Lugh compõe os DOIS ignores. A "ironia" que
registrei ontem era ela mesma o erro — corrigida aqui.

**LIÇÃO B — relato de processo também precisa de §82 (verificar contra a fonte).** Reportei o `atordoaMenorHp` como handler
morto vivo no `aplicarFx`. Era verdade no que eu estava LENDO — mas o que eu lia era o container revertido a um commit
antigo; no origin/main o §105 já tinha removido o handler. O §82 (verificar contra o git, não contra a memória) vale para o
RELATO tanto quanto para o código. **As duas lições são a mesma:** um "eu vi X" só vale depois de confirmar que o X veio do
estado canônico, rodando — não de uma leitura parcial nem de um container fora de sincronia.

---

## §112 — REGRA DA ÂNCORA: um rastreio de dois tempos promove no lado do SUJEITO LIDO, não pela forma do mecanismo

**Terceira vez que a âncora decide um rastreio (§88 Bastet, §97 curadoAntes, §111 danoAntes) — vira regra utilizável.**

Todo rastreio de dois tempos ("no turno ANTERIOR") tem a MESMA estrutura — escritor no evento, promotor no `iniciarTurno`,
leitor na condição. O que MUDA entre eles, e o que erra se copiado por analogia, é **ONDE o promotor roda**. A resposta não
vem da forma do mecanismo (todos são iguais); vem de **QUEM é o sujeito lido**:

- **Rastreio de INIMIGO → promove nos DOIS lados (global).** O sujeito age no turno IMEDIATAMENTE anterior ao da leitura
  (o inimigo agiu; agora eu, do outro lado, leio). A janela de "um turno" é global e cabe. — `curadoAntes` (§97): a
  Tsukuyomi lê o inimigo curado no turno passado.
- **Rastreio de ALIADO → promove SÓ no lado do DONO (ancorado, como o resetador §88).** O sujeito age na cadência do
  PRÓPRIO time — o "turno anterior dele" tem o turno inimigo no MEIO. Promover global zeraria o dado no turno inimigo antes
  da leitura. — `danoAntes` (§111): o Krishna lê o aliado que mais causou dano no turno do time passado; `golpeUnicoNoTurno`
  (§88): a Bastet reseta no próprio turno para a proteção valer no turno inimigo seguinte.

**A regra em uma linha:** *dois mecanismos idênticos em estrutura têm âncoras OPOSTAS se os sujeitos lidos estão em lados
diferentes.* Ao escrever um rastreio novo, a primeira pergunta não é "como os outros fazem" — é "o sujeito que eu leio age
no meu turno ou no do inimigo?". Escrevi o `danoAntes` global por analogia com o `curadoAntes`; o teste da passiva ficou
vermelho (o dano do aliado sumia no turno inimigo do meio); a âncora-por-sujeito é o conserto e a lição.

---

## §111 — KRISHNA: os quatro ignores JÁ compõem (o Lugh prova); o novo é a TRANSFERÊNCIA; e a passiva arrasta um 2º mecanismo

**Krishna arrastou DOIS mecanismos — o dono nomeou um (a cola da Ação Perfeita) e não viu o outro (o rastreio de dano da
passiva). §93 de novo: quem aprova coincidência de família não vê a escrevibilidade.**

**As três checagens da Ação Perfeita, respondidas:**

1. **Os quatro ignores NÃO são homogêneos — moram em DUAS fases, e nenhum lê um buff em runtime.** "não-reduzível/
   não-absorvível" e "não-contra-atacável" agem no IMPACTO (bater); "não-evitável" age na MIRA (`alvosValidos`), e o §84 é
   invariante: Inalvejável NUNCA toca o bater. Além disso, as fontes de hoje são fx/kit, não efeito: `semContra` é flag do fx;
   `danoIrredutivel` lê a PASSIVA do atacante; `ignoraInalvejavel` lê a passiva do ator. **Nenhum olhava um BUFF temporário.**
   Então não era "um buff que liga quatro flags que o bater já lê" — faltava a cola.

2. **"Próxima ação" NÃO cabia em `contra:'unico'` nem em `usos`.** O `contra:'unico'` consome numa REAÇÃO defensiva
   (interceptar/revidar), não quando o portador AGE. O `usos` é teto por partida da PRÓPRIA habilidade do dono, marcado
   quando ele age — não um buff que OUTRO aplica e que a ação do portador gasta. "Ação Perfeita de outro" é um terceiro
   gatilho de consumo: **consome-no-próximo-agir-de-habilidade-do-portador** (§102-A: um caminho — o strip no fim do `agir`).

3. **Os quatro nomes da prosa mapeiam em TRÊS mecanismos, sem sobrar quinto.** `danoIrredutivel` já embrulha
   reducao+escudo, então "não-reduzível" e "não-absorvível" são o MESMO mecanismo. `ignoraInvuln` (furar Invulnerável) NÃO
   está na prosa da Ação Perfeita — não sobra um quinto conceito, ele simplesmente não faz parte. **E o Lugh (§105) prova que
   os quatro ignores JÁ COMPÕEM como flags do próprio fx** (o básico dele é "não pode ser evitado nem contra-atacado", zero
   mecanismo novo). Logo o inédito do Krishna não são os ignores — é **TRANSFERI-LOS para a próxima habilidade de outro**.

**O que a cola é:** um BUFF `acaoPerfeita` que o Krishna arma num aliado; três leitores passaram a consultá-lo — a MIRA
(`alvosValidos`, o não-evitável), e o bater em dois pontos (redução/escudo via `calcDano`; contra-ataque via `semContraEf`),
**todos gateados em `slot==='habilidade'`** (só a próxima habilidade herda; básico/milagre não). Consumido no fim do `agir`
de habilidade do portador. Pacote FIXO dos quatro (fiel ao catálogo; o Lugh usa subconjunto no próprio fx, mas ninguém
TRANSFERE subconjunto — se surgir, refatora). `dur:2` desconta só no fim do turno do dono (regra 5), então sobrevive à
alternância até o aliado usar a habilidade.

**O 2º mecanismo (o que o dono não viu): rastreio de DANO CAUSADO — gêmeo do §97, ÂNCORA OPOSTA.** A passiva "o aliado que
causou mais dano no turno anterior +5" precisa de rastreio de dois tempos igual ao `curadoAntes` (§97): escritor no `bater`
(dano líquido em inimigo), promotor no `iniciarTurno`, leitor `atacanteMaiorDanoAntes` + seletor top-do-time. MAS a âncora
DIFERE, e o teste pegou: o `curadoAntes` promove os DOIS lados (o sujeito lido — o inimigo curado — age no turno
IMEDIATAMENTE anterior, janela global de 1 turno cabe); o `danoAntes` lê um ALIADO, que age na cadência do PRÓPRIO time (o
turno anterior DELE, com o turno inimigo no meio) — então promove SÓ o lado ATIVO, ancorado ao dono (como o resetador §88).
**Gêmeo aparente, âncora oposta — exatamente a lição do §100/§110: a âncora segue a cadência do SUJEITO lido, não a forma do
rastreio.** Escrevi global primeiro; a asserção da passiva ficou vermelha (o dano do aliado era zerado pela promoção do turno
inimigo no meio); corrigi para lado-ativo.

**Krishna (IMPL 73, FUNCIONAL 73):** Flauta Divina (12 a 1); Conselho do Gita (arma a Ação Perfeita num aliado); Forma
Universal (+12 de dano ao time por 2 turnos + 2 orbes); Auriga de Arjuna (o top-dano do turno anterior do time +5).
Isolamento em `primitivas §25` (acaoPerfeita fura os 4 só na habilidade, básico não herda; rastreio: escritor líquido,
promotor ancorado ≠ §97 global); comportamento em `passiva §111`.

---

## §110 — "PRIMEIRO POR TURNO" tem DUAS naturezas: condição-que-se-rastreia (Bastet) vs efeito-que-se-consome (Mnevis)

**O mesmo conceito — "só vale para o primeiro golpe do turno" — foi construído de dois jeitos opostos, e a escolha não é
gosto: é a NATUREZA do que "o primeiro" governa.**

- **Bastet (§88) — condição DEFENSIVA PASSIVA → exige RASTREIO de quatro pontos.** "O primeiro golpe único contra a Bastet
  no turno é reduzido." O "primeiro" aqui é uma PROPRIEDADE que tem de ser lembrada, porque nada a consome: o flag
  `golpeUnicoNoTurno` existe INERTE (verdadeiro ou falso) tenha ou não chegado golpe. Precisa de quatro peças — o ESCRITOR
  (arma o flag), o LEITOR (a condição checa), o RESETADOR (limpa), e a ÂNCORA (reseta no turno de QUEM — no turno do DONO,
  deixando armado para o turno inimigo seguinte, senão a proteção valeria 2× por rodada num hot-seat). É rastreio porque a
  condição é passiva: ninguém "gasta" o primeiro golpe; o motor tem de contar.

- **Mnevis (§109) — efeito que SE CONSOME → arma-consome-rearma, ZERO rastreio.** "Intercepta o primeiro golpe único contra
  Rá no turno." O "primeiro" aqui cai de graça de `intercepta{contra:'unico'}` (consome ao interceptar) re-armada pelo
  `porTurno`. Não há flag nem contador: o PRÓPRIO efeito é o token. Ele existe só quando armado, some quando consumido, e o
  início do turno re-arma. O ciclo aplica/consome/re-arma É a memória de "já usei hoje".

**A distinção operacional:** o rastreio só é necessário quando NADA consome a coisa. Se o "primeiro" é uma condição que o
motor precisa checar sem que nenhuma ação a gaste (Bastet: reduzir dano não "gasta" nada), precisa de escritor+leitor+
resetador+âncora. Se o "primeiro" é um efeito que a própria ação de disparo CONSOME (Mnevis: interceptar remove a
`intercepta`), o consumo é o relógio — de graça. **Da próxima vez que "primeiro por turno" aparecer, a pergunta certa não é
"como rastreio", é "algo consome isto?": se sim, arma-consome-rearma; se não, rastreio de quatro pontos.**

---

## §109 — MNEVIS fecha a família guarda: intercepta-passiva-por-nome COMPÕE do que existe; só o THORNS é mecanismo novo

**As três checagens do dono, respondidas — duas dão "compõe do que existe", uma é singleto:**

1. **`intercepta` numa PASSIVA, não numa habilidade → COMPÕE, de graça.** A habilidade do Hanuman (§107) aplica `intercepta`
   UMA vez, ao agir. A passiva do Mnevis quer "o PRIMEIRO golpe único contra Rá EM CADA TURNO" — que é exatamente
   `intercepta{contra:'unico'}` (consome ao interceptar) **re-armada pelo `porTurno`**. O "1º por turno" não custou nada: cai
   de graça da composição `porTurno` × `contra:'unico'` (arma no início do turno, o 1º golpe consome, o resto do turno passa,
   o próximo `porTurno` re-arma). Nenhum contador, nenhum flag de "já interceptei hoje" — o próprio ciclo aplica/consome é o
   relógio. **§102-A na prática:** um só caminho para o "primeiro por turno", não um novo campo ao lado do que já existe.

2. **`protege` por NOME (chave de deus), não por uid → COMPÕE, mas o executor do faz precisou aprender a resolver.** O
   `intercepta.protege` guarda um **uid** (a Bastet, o Hanuman escolhem uma unidade viva no ato). O Mnevis designa "Rá" por
   NOME antes da partida existir. A resolução mora no `rodarFaz` (o executor do `porTurno`): quando `f.protege` é uma string
   de chave, procura a unidade viva com aquela `key` e converte para uid ali; sem o aliado nomeado vivo, **não arma nada**
   (o `estado:{aliadoPresente:'ra'}` já gateia no `iniciarTurno`, mas a checagem no ato do armar é a rede — Rá pode ter caído).
   Isso é o §104-B de novo (fx com campo novo → conferir o executor certo): a `intercepta` do `aplicarFx` recebe uid pronto;
   a do `rodarFaz` recebe chave e resolve. Um campo, dois executores, cada um com a forma que lhe chega.

3. **THORNS (`refleteDano`) É mecanismo novo — singleto, mas real.** "Reflete 10 de todo dano que recebe" não era nenhum dos
   que existiam: não é `contraAtaca` (esse revida só golpe ÚNICO, com o dano DO REVIDANTE, e é negável por `semContra`); não é
   `armazenaDano` (acumula para depois); não é `intercepta` (redireciona, não devolve). É **devolver um valor FIXO ao atacante
   sempre que o dano entra**, área inclusa. Construído como BUFF temporário (`refleteDano{v,dur}`) + um gancho no `bater` DEPOIS
   que o dano assenta (`v > 0`). Duas travas contra laço: o golpe de reflexo usa `slot:'reflexo'` e o gancho ignora esse slot
   (dois portadores frente a frente não ricocheteiam ao infinito), e vai com `semContra/semIntercepta/semRedirect` (o reflexo
   é dano puro de retorno, não re-entra nas primitivas defensivas). Duração **2 turnos, junto do Provocar** do milagre — o
   Mnevis vira ímã (taunt em todos) que pune quem morde (thorns), as duas metades do mesmo milagre.

**O que a família guarda tinha e agora tem:** interceptar dano dirigido a um aliado apareceu em três formas — **aplicada** e
escolhida no ato (Bastet, Hanuman via habilidade), e agora **designada por nome numa passiva** (Mnevis). As três são o MESMO
`intercepta`; o que muda é quem preenche o `protege` e quando. Fechá-la sem inventar um segundo mecanismo de "guardião nomeado"
é a mesma lição do Thor (§106): o geral já fazia; faltava um executor saber resolver a chave.

**Mnevis (IMPL 72, FUNCIONAL 72):** básico Chifrada (15 a 1); Investida Solar (15 a 2 inimigos + 15 de Defesa Destrutível em
si); Fúria do Touro de Rá (provoca todos 2 turnos + thorns de 10 por 2 turnos); passiva Montaria do Sol (com Rá no time,
intercepta o 1º golpe único contra Rá por turno). **IMPL = FUNCIONAL = 72.** Isolamento em `primitivas §24` (thorns: reflexo
fixo, sem loop, só com `v>0`; intercepta-passiva-nomeada: arma só com Rá, 1º por turno, re-arma no `porTurno`, gateada por
`aliadoPresente`); comportamento em `passiva §109`.

---

## §108 — O DESLOCAMENTO DE SEED é uma varredura INVOLUNTÁRIA: cada kit novo re-amostra o espaço de estados

**A quarta forma de expor bug antigo, e a mais interessante — não foi método, foi RNG.** As três anteriores foram
deliberadas (auditor-cego-formato §66, auditor-cego-empilhamento §93, absorção-deleta-morto §106). A do §107 foi diferente:
adicionar o Hanuman mudou o SORTEIO de todos os testes de seed fixo (o roster é a fonte do RNG dos times), e o seed 24 do
`eventos.test` caiu num `roubaOrbe`-vs-Heimdall que nunca tinha sorteado — expondo um evento malformado da F1.6, muitas
sessões depois. **Consequência prática:** um teste de seed fixo que passa HOJE pode expor bug antigo AMANHÃ só porque o roster
cresceu. Adicionar um kit é uma **varredura involuntária do espaço de estados** — a suíte re-amostra sozinha a cada deus. Isso
é BOM: explica por que a suíte fica mais valiosa a cada kit (cobertura que ninguém escreveu, o RNG escreve). E avisa: uma
falha de seed que aparece "do nada" depois de um kit novo provavelmente não é regressão do kit — é bug antigo recém-sorteado;
investigue o evento/estado, não só o diff.

**Nota de teste (o +5 do Hanuman):** a asserção original fixava o dano de área do milagre num número (28) que dependia de
BÔNUS DE COMPOSIÇÃO de time (o +5 de um aliado + o dmgUp de adotar o Senhor). Número de composição em asserção é FRÁGIL —
quebra quando o time muda. Troquei pelo que o teste realmente prova (o heal foi no Senhor, não no mais ferido; a área bateu em
todos), não pelo valor exato. Isolar o +5 e entender de onde vinha (§82) antes de relaxar a asserção foi o certo — relaxar sem
entender esconderia um bug real sob "é bônus de time".

---

## §107 — SENHOR designado (Hanuman): a habilidade sai de GRAÇA (intercepta.protege), só o milagre custa ~8 linhas

**As três checagens do dono, respondidas:**
1. **Quantos designam aliado? DOIS, de tipos diferentes.** Hanuman (Senhor, escolhido DINAMICAMENTE pela habilidade) e Mnevis
   (Rá, designado por NOME, numa PASSIVA, intercepta o 1º golpe único contra Rá por turno). Vizinhos, triggers opostos (ativo-
   escolhido vs passivo-por-nome-e-por-turno). Mnevis é build à parte.
2. **O `intercepta` já protege designado? SIM — a resposta do Thor de novo.** A fx `intercepta` já resolve `protege =
   alvos[0].uid` (o aliado escolhido) ou `'time'`, e a **Bastet já usa a forma designada**. Então a habilidade "Devoção a
   Rama" (intercepta o dano dirigido ao Senhor + Hanuman +10) é **ZERO mecanismo novo** — `intercepta{protege, contra:'todos',
   dur:2}` + `dmgUp`.
3. **O fallback é composição; o alvo-primário não.** "cura 30 no Senhor OU no mais ferido": o fallback (mais ferido) é o
   `alvoHp:{aliado,min}` (§103, pronto). Só o primário ("o Senhor") custou — um seletor `alvoSenhor` que LÊ o
   `intercepta.protege` ativo do dono (fallback `alvoHp` min se não houver Senhor vivo). ~8 linhas, e **sem 2º lugar guardando
   o Senhor** (ele já mora no `intercepta.protege` — §102-A respeitado).

**Hanuman (IMPL 71):** básico 15; Devoção adota o Senhor (intercepta designado + Hanuman +10); Montanha Dronagiri = 18 área +
cura 30 no Senhor (`alvoSenhor`, fallback mais ferido); passiva imune a Queimadura + "+8 com Sun Wukong" (`escopo:self`,
divergência-com-gatilho §102-C — o recíproco não mora no catálogo do Sun Wukong, mesmo caso da Chang'e).

**Bônus (§66 de novo): o roster crescer expôs um evento MALFORMADO antigo.** Ao adicionar o Hanuman, o seed 24 do
`eventos.test.js` caiu num `roubaOrbe`-vs-Heimdall e o `bloqueio:orbe_protegido` (F1.6) apareceu **sem `alvo`** (só `lado`),
violando a gramática. Não era meu código — o método (mexer no roster) expôs furo antigo. Corrigido: o bloqueio agora nomeia o
PROTETOR (Heimdall) como `alvo`. Terceira vez que o método expõe bug anterior (auditor-cego-formato §66, auditor-cego-
empilhamento §93, evento-sem-alvo §107).

---

## §106 — A EXISTÊNCIA DE UM ONE-OFF NÃO É PROVA DE QUE ELE É ESPECIAL (o erro nomeado do dono no Thor)

**O erro, nomeado pelo dono:** ao autorizar a migração do Thor, ele presumiu que o `atordoaMenorHp` existia porque fazia algo
DIFERENTE do caminho geral (daí pedir um campo "respeita Invulnerável" para preservar a "esquisitice"). Mas o one-off existia
porque **ninguém checou se o geral já fazia** — e fazia (o `apply` já barra controle em inimigo invulnerável). A esquisitice era
o DEFAULT, não uma exceção; o hardcode nunca precisou existir. **Regra:** a existência de um one-off NÃO é evidência de que ele
é especial — é evidência de que, quando foi escrito, ninguém checou o geral. Antes de construir o campo que ABSORVE uma exceção,
teste se a exceção já é o default do caminho geral. A resposta pode ser que o campo custa zero e o one-off era redundante. É o
§46 num eixo novo: lá o NOME engana; aqui a EXISTÊNCIA engana (um fx no motor parece necessário só por estar lá).

**Ledger "método expõe bug anterior" (+1):** absorver o `atordoaMenorHp` no seletor geral (§103) DELETOU código morto — um
segundo caminho que duplicava o `apply`+`alvoHp`. O método (§46/§102-A: um resultado, um caminho) não só evitou dívida nova;
removeu dívida ANTIGA que ninguém tinha visto. Junto com o auditor-cego-ao-empilhamento (§93) e o auditor-cego-ao-formato (§66):
três vezes o método de varrer/absorver expôs um furo que já estava no código, não um que eu ia criar.

---

## §105 — semContra (fecha o Lugh) + a absorção do Thor que custou ZERO linha (a esquisitice já era a regra)

**semContra — a varredura achou 2, mas UM é §46.** "não pode ser contra-atacado": Lugh (flag ESTÁTICA no próprio básico) e
Krishna ("Ação Perfeita" — um BUFF que faz a PRÓXIMA habilidade do aliado não-evitável/reduzível/absorvível/contra-atacável).
Mesma palavra, substância oposta: o Lugh é um flag pontual, a Krishna é um pacote-de-4-ignores num buff-para-a-próxima-ação —
mecanismo À PARTE (fica pra depois). Então o flag `semContra` nasce SINGLETO (Lugh). Vizinhos confirmados distintos: é a
NEGAÇÃO do `contraAtaca` (Atena/Heimdall/Bastet) — não é `intercepta` (protetor assume o golpe) nem `reflete` (devolve controle).
Forma: `semContra` no dmg, flui p/ o `opts` do `bater` (que já tinha o param), nos DOIS executores de dmg (§104-B).

**Lugh (IMPL 70) — FECHADO: três gavetas viraram deus.** cd-condicional (§101) + seletor-maior-HP (§103) + semContra (§105),
todas pagas em levas anteriores; faltava só o último flag. básico 15 fura Inalvejável (`ignoraInalvejavel` = "não evitado") e
não é contra-atacado (`semContra`); Samildánach = `opcoes` (GUERRA/CURA/FORJA) sem recarga no Dia (`cdSe`); Funda de Balor = 38
puro ao de maior HP (`alvoHp`) + executa ≤24; passiva +10 no Dia (`bonusDano estado`). É o payoff do §93 invertido: quando as
gavetas de um deus complexo são pagas uma a uma, a última leva o converte inteiro.

**A absorção do Thor (§46/§102-A) custou ZERO linha — a "esquisitice" já era a regra geral.** O dono mandou migrar o
`atordoaMenorHp` preservando a esquisitice (não atordoa invulnerável) via um campo "respeita Invulnerável", "se couber em duas
linhas". Não coube em duas: **coube em ZERO.** O caminho geral do `apply` JÁ barra controle em INIMIGO invulnerável
(`ef(t,'invulneravel') && t.lado!==u.lado`, uma linha que já existia). Então o Thor migrou p/ `apply atordoado
alvoHp:{inimigo,min}` e a esquisitice caiu fora como caso particular da regra que sempre esteve lá — o hardcoded `atordoaMenorHp`
saiu do motor (TIPOS_FX e branch). A lição: às vezes a "regra declarada nova" que absorveria a esquisitice **já está escrita**;
antes de adicionar o campo, cheque se o comportamento não é o default do caminho geral. O one-off era redundante, não especial.

---

## §104 — DOIS LEDGERS: a família cresce por invisibilidade OPOSTA; e "fx com campo novo → confira TODOS os executores"

**A. Uma família cresce por dois tipos de invisibilidade, e o segundo é PIOR.** O seletor-por-HP (§103) cresceu de 2→3→5. Os
dois que ninguém tinha contado eram invisíveis por motivos OPOSTOS:
- **Lugh** — membro que ninguém VIU (não estava construído, o gancho passou na triagem). Invisível por ausência.
- **Thor** — membro já IMPLEMENTADO sob outro nome (o `atordoaMenorHp`, um fx hardcoded que É o seletor de menor-HP). Invisível
  por disfarce.
O segundo é pior: **conta como "pronto" na contagem de KITS e como "não existe" na de MECANISMOS.** As duas contagens se
contradizem e nenhuma sozinha percebe — só a varredura de SUBSTÂNCIA (o que o fx FAZ, não como se chama) reconcilia. Regra: ao
varrer uma família, procure não só quem falta escrever, mas quem já faz a coisa sob um nome específico (o hardcode-one-off é o
mecanismo geral disfarçado — §46/§71). O `grep` do NOME nunca acha esse; só ler o que o motor executa.

**B. Fx com campo novo → confira TODOS os executores (o §102-A em runtime).** O `alvoHp` (§103) nasceu no `aplicarFx` e o
`rodarFaz` (dispatch PRÓPRIO, para faz turno-seguros) o ignorava — a passiva `porTurno` da Deméter curava o dono, não o mais
ferido. Duas máquinas de executar fx, o campo novo só numa. É o §102-A (um resultado, dois caminhos) em runtime: os caminhos
DIVERGEM no fx que só um conhece. **Item de checklist:** quando um fx ganha campo novo (ou um fx novo entra), varra TODOS os
executores — hoje `aplicarFx` E `rodarFaz` — não só o principal. O teste que exercita o campo pelo caminho secundário (o faz)
é o que pega isto; o que exercita só o `aplicarFx` passa cego.

---

## §103 — SELETOR POR HP (alvoHp): a família era MAIOR (5, com um consumidor escondido em hardcode); Deméter

**A varredura corrigiu o número — pela terceira vez o §93 mordeu.** O §54 dera 2 (Deméter, Izanami); a varredura das fases
somou o Lugh (3); a varredura dos 100 AGORA acha **5**: + **Thor** (que já seleciona o de MENOR HP via um fx HARDCODED,
`atordoaMenorHp` — o mecanismo geral existia disfarçado de one-off, §46/§71) + **Hanuman** (o "mais ferido" como FALLBACK do
Senhor designado). "Se aparecer um quarto, a família é maior do que qualquer varredura disse" — apareceu um quarto E um quinto.

**As duas suspeitas, resolvidas:**
1. **min e max são o MESMO mecanismo, comparador invertido** — confirmado. `alvoHp:{lado, ext}`, `ext:'max'` (de maior HP,
   Lugh/Izanami) ou `'min'` (de menor HP / mais ferido, Thor/Deméter/Hanuman). "mais ferido" = menor HP ABSOLUTO (≡ menor HP;
   diverge de hp-faltante só quando maxHp difere — raro; o modelo min/max do dono usa uma métrica só).
2. **Cabe no vocabulário SEM alvo novo.** Não é `alvo` de jogador — é AUTO. Mora como campo do FX (`alvoHp`), resolvido em
   `aplicarFx` (e em `rodarFaz`, p/ o `porTurno` da Deméter) antes do escopo. O `alvo` da habilidade é `'auto'` (primário,
   Lugh) ou o fx é rider num AoE/faz. `lado:'inimigo'` = oposto ao dono; `'aliado'` = o do dono.

**O DESEMPATE (o que mata determinismo):** empate de HP → **MENOR ÍNDICE de unidade**, comparação ESTRITA (o primeiro da
varredura vence), como o dono pediu e como o Huang Di. Travado em teste (empate no 90 → índice 0, não 1). Sem isso, replay e
arena divergem em silêncio — o risco que o próprio dono levantou lá.

**Deméter (IMPL 69) — a consumidora LIMPA:** básico 10; Dádiva (regen 12 time 2t); Estação Eterna (revive 48 OU cura 25 —
condicional aliadoCaido, padrão Freyja); passiva `porTurno` → o aliado mais ferido cura 6 (`heal alvoHp:{aliado,min}`). Só
o seletor era novo; o resto é construído.

**O que NÃO fiz, e por quê (§93 + §102-A):** os outros consumidores arrastam mais. **Izanami** puxa o DoT-por-Maldição-de-Yomi
(contador que tica dano). **Lugh** ainda trava no básico "não pode ser CONTRA-ATACADO" (flag de habilidade nova; o "não
evitado" é `ignoraInalvejavel`, que existe). **Thor** já usa o seletor via `atordoaMenorHp` — ABSORVÊ-LO no geral é a jogada
§46/§102-A (um resultado, um caminho), MAS muda o comportamento dele: o `atordoaMenorHp` tem uma esquisitice (não atordoa
inimigo INVULNERÁVEL) que a via geral (`apply`, que checa `controlImmune`, não invuln) não tem. Absorção é decisão à parte
(migrar com a mudança de comportamento vs preservar a esquisitice) — trago quando o dono quiser fechar o Thor/Lugh/Izanami.

---

## §102 — TRÊS PRINCÍPIOS do §101: leitura-ao-vivo subsume o estático; barra-antes-do-buraco; divergência-com-gatilho

**A. Leitura ao vivo subsume o estático — não construa o segundo caminho.** Quando uma leitura AO VIVO cobre o caso estático,
não construa também o caminho estático. No cdSe (§101): ler a base na disponibilidade cobre "recarga 2 com Hou Yi" porque
`aliadoPresente` é constante na partida — um efeito de `abertura` daria o MESMO resultado por um segundo caminho. **Dois
caminhos para um resultado é dívida que só aparece quando DIVERGEM** (um é corrigido, o outro não; ou o estado se dessincroniza).
O teste "os dois batem hoje" não protege — a dívida é latente. Regra: um resultado, um caminho; prefira o que já existe e é lido
ao vivo.

**B. Barra na fonte ANTES do buraco (§66 preventivo).** Ao adicionar um mecanismo cujo TETO o auditor não enxerga, ponha a
guarda no validador NA MESMA leva — não espere a violação aparecer. O `cdSe.cd 0` num milagre (nuke toda rodada, frequência
invisível ao teto) foi barrado no `valida_kit` junto com o mecanismo. O §66 nasceu corretivo (o 30-área do Xangô, 3 commits
depois); a forma madura é preventiva: quem constrói o formato novo constrói a guarda do formato novo.

**C. Divergência conhecida COM GATILHO (o recíproco da Chang'e).** A prosa da Chang'e diz "ambos +8" (ela E o Hou Yi), mas o
catálogo do Hou Yi (Olho de Águia) NÃO carrega a metade dele. Inventá-la seria escrever kit fora do catálogo — pior que a
divergência. Decisão do dono: **fica a metade da Chang'e (escopo:self); registrada como divergência conhecida COM GATILHO** —
se algum dia o catálogo do Hou Yi ganhar a cláusula, a metade dele entra LÁ, não na Chang'e. O gatilho é o que separa "bug
esquecido" de "decisão com data de revisão": a divergência tem um evento nomeado que a resolve.

---

## §101 — RECARGA CONDICIONAL (cdSe): uma gaveta, não duas; e o teto-invisível que o dono previu

**A varredura desmontou a suspeita das "duas gavetas": é UMA.** O dono viu duas formas possíveis para "recarga X quando
⟨estado⟩": (a) a base mudando enquanto a condição vale, lida na disponibilidade (Lugh, "sem recarga no Dia"); (b) uma alteração
permanente disparada ao formar o time (Chang'e, "recarga 2 com Hou Yi"), que seria `abertura` com efeito — outra gaveta. **A
resposta: ler a base AO VIVO na disponibilidade subsume as duas.** `aliadoPresente` (Hou Yi no time) é CONSTANTE na partida (o
array de unidades não muda; morto continua rosterado) — então ler ao vivo dá o mesmo que um efeito permanente, sem o segundo
caminho. Uma forma: `cdSe:{estado, cd}` na habilidade, avaliado em `acoesDe` via `estadoOK`. `cd 0` dispensa o `em_recarga`
inteiro (Lugh usa toda rodada no Dia); `cd 2` só troca a base (Chang'e). O `abertura`-permanente seria caminho a mais para
nada. **Varredura dos 100:** só Chang'e e Lugh; o Bragi ("recarga reduzida em 1") era MIRAGEM — é o `cdShift` MIRADO que já
existe (manipulação ativa), não base condicional. Família de 2, gaveta nasce ocupada.

**O TETO-INVISÍVEL (o dono pegou antes de mim, como no multi-golpe):** recarga 0 = usar a habilidade TODA RODADA, e o auditor
de teto não vê FREQUÊNCIA — só valor-por-uso. Num MILAGRE (nuke de valor alto), cd 0 seria o empilhamento do §92 de novo,
invisível. Confirmado que o Samildánach do Lugh é **HABILIDADE** (rec 1), não milagre — habilidade/básico recorrem por
natureza, e o teto-por-uso da habilidade (GUERRA 15 área ≤ 15) segura. Mas **barrei na fonte** (valida_kit): `cdSe.cd 0` num
`milagre` é erro em voz alta. Barrar onde o auditor é cego é a lição do §66 aplicada preventivamente.

**Chang'e (IMPL 68) — consumidora real do cdSe:** Elixir `pisoVida` 2t (base rec 3, `cdSe → 2` com Hou Yi); Luz do Jade cura
20/30 na Noite (`condicional se:{fase:Noite}`, e o `curasFx` do checar_cadeia passou a recursar no condicional, espelhando o
`danosFx`) + regen; passiva +8 com Hou Yi (`bonusDano estado:{aliadoPresente}` — o `estado` entrou nos campos do gatilho, o
motor já gateava, igual à `reducao` do §96). **Nota de fidelidade (ambos +8):** a prosa diz "ambos" (Chang'e E Hou Yi), mas o
recíproco teria de morar na passiva do Hou Yi, que o catálogo NÃO dá (Olho de Águia não cita a Chang'e). Realizei a metade que
mora na Chang'e — `escopo:self` (não `time`, que superdimensionaria o 3º aliado). O Lugh consome o cdSe também (Samildánach),
mas segue bloqueado pelo **seletor-maior-HP** do milagre — a próxima gaveta dele.

---

## §100 — DOIS LEDGERS: o §93 pega quem APROVOU (não quem executa); e guarda de imunidade à mão erra por omissão

**A. O §93 corrige a premissa de quem APROVA a frente, não a de quem executa.** Duas vezes no arco a varredura de
escrevibilidade derrubou o NÚMERO/ranking que o dono deu ao aprovar a frente:
- **Multi-golpe (§92/§93):** aprovado com "3 consumidores" (Susanoo/Babi/Hou Yi) — era **1** (só o Babi escrevível; os outros
  arrastavam combo/dispel/tamanho-de-lado e remoção-de-fase).
- **Leitores de fase (§99):** aprovado "o Lugh é o mais limpo" — era o **mais sujo** (duas cláusulas escondidas atrás do "+10
  no Dia": cd-condicional + seletor-maior-HP).
O erro não é de execução; mora na **camada de aprovação** — rotular uma frente pela COINCIDÊNCIA (mesmo gancho) ou pelo
pedaço que se olhou primeiro. É o §46 (nome não é evidência) subindo um nível: a rubrica de quem aprova carrega o mesmo viés
que a varredura de substância corrige. **Regra:** trate todo número/ranking dado na aprovação como HIPÓTESE, não spec; rode o
§93 contra a premissa da aprovação, sempre, antes de escrever. A varredura serve ao aprovador tanto quanto ao executor.

**B. Guarda de imunidade escrita à mão erra por OMISSÃO — reuse a checagem canônica.** No §99 meu primeiro guarda do `dominar`
só chamava `imuneA` (imunidade declarativa) e deixava o `controlImmune` (o BUFF, regra 7) VAZAR — o golpe-fantoche furava a
imunidade. **O teste pegou; a revisão (minha leitura) não.** Um guarda à mão DUPLICA uma checagem que o caminho canônico
(`aplicar`) já faz — e duplicata DERIVA em silêncio: só a checagem dupla do `aplicar` (`ef(controlImmune)` **E** `imuneA`) está
certa. A correção reusou exatamente as duas. **Regra:** ao barrar por uma condição que o motor já barra noutro lugar, CHAME o
mesmo predicado; nunca re-derive à mão. Re-derivação some do radar até um teste com o caso omitido bater — então o teste do
caso-omitido é obrigatório, não a leitura.

---

## §99 — DOMINAR (a órfã mais antiga, §71): fecha a Afrodite retroativamente + escreve o Boto; e a varredura que rachou os 3

**A varredura §93 dos três leitores dormentes — nenhum limpo, e a suspeita do dono virou ao contrário.** Os três coincidem
em ler a fase; a escrevibilidade divergiu: **Boto → `dominado`** (a habilidade dele É a dominação); **Chang'e → cd-condicional**
("Elixir passa a recarga 2 com Hou Yi"); **Lugh → cd-condicional + seletor-maior-HP** (o milagre mira "o de maior HP"). O Lugh,
que o dono chamou de "mais limpo", é o **mais sujo** — o "+10 no Dia" é trivial (`bonusDanoDeclarativo` já gateia por `estado`,
só o validador não lista — igual à `reducao` do §96), mas a passiva tem uma SEGUNDA cláusula ("Samildánach sem recarga") e o
milagre puxa um seletor. Achado lateral: Lugh e Chang'e arrastam o MESMO mecanismo (cd-condicional) — uma família de dois.
Nenhum deus escrito nesta leva por esse eixo; trouxe as gavetas.

**`dominado` estava pior que órfã tipo-1: INERTE.** Vivia só em `CONTROLES` e negava orbe por 1 turno; o `podeAgir` nem
bloqueava, e o "usa o Básico contra um aliado" NUNCA acontecia. A Afrodite estava no ar com um `Encanto` que só negava 1 orbe
(§71). Construir o comportamento fecha **Afrodite (retroativa) + Boto = +2 funcional** (66→68).

**As três decisões (formato marca/Inalvejável, trazidas antes do código):**
1. **Momento: IMEDIATO no lançamento** — o golpe-fantoche resolve quando Encanto/Baile é lançado (computo o Básico da vítima
   e aplico no aliado). NÃO sequestra o fluxo de turno nem a IA. "Por 1 turno" vira o resíduo (o tag). O menor que funciona.
2. **Alvo: o DOMINADOR escolhe os dois** (a vítima E o aliado que leva o golpe — Afrodite "você escolhe o alvo"). Reusa o
   `2inimigos` que já existe; zero interface nova.
3. **Resíduo: SÓ nega orbe** (o `dominado` fica `dur` turnos negando geração — o que o motor já fazia). Sem travar a ação.

**A forma:** fx `dominar` — `aplicar('dominado', dur)` na vítima (alvos[0]) + o Básico dela (via `danoBase`+`bater`, fogo amigo
com `semContra/semIntercepta/semRedirect`) no aliado (alvos[1]); `curaCausador` dreba o dano no lançador (Boto); `durNoite`
estende o tag na Noite (Boto, +1 — a cláusula de fase da passiva, realizada na habilidade). **Imunidade a controle barra a
dominação INTEIRA** (tag E golpe) — mesma dupla checagem do `aplicar` (`controlImmune` OU imunidade declarativa), senão o golpe
vazaria a imunidade. Degenerado (1 inimigo): aplica o tag, sem golpe (não há aliado).

**Boto (IMPL 67) + Afrodite (fechada):** Afrodite `Encanto` agora `2inimigos`+`dominar`; Boto = Baile (`dominar` curaCausador +
durNoite) + milagre (trava Milagre de todos via `lockSkill slot:milagre` + cura 15 time) + passiva (aCadaN Inalvejável; a
cláusula "+1 na Noite" mora no `durNoite` do Baile). Nenhuma entrada nova no auditor.

---

## §98 — QUEM CONTROLA AS DUAS PONTAS não precisa de rastreio; quem LÊ o histórico de outro precisa

**A distinção que o rótulo "curado antes" escondia** (o dono passou 3 no prompt, a varredura achou 1). Freyja/Oxum e
Tsukuyomi todos "reagem a uma cura", mas de lados opostos da causalidade:
- **Controla as duas pontas** (Freyja: EU curo → EU buffo meu aliado). O mesmo ator é dono do EVENTO e da REAÇÃO. Um
  **buff com duração** aplicado no instante do evento CARREGA o estado para frente — nada a rastrear. `aoCurar → dmgUp dur:2`.
- **Lê o histórico de quem NÃO controla** (Tsukuyomi: um INIMIGO foi curado por alguém → EU puno). O leitor não é dono do
  evento, e o momento da leitura (o ataque dela) é OUTRO, desacoplado da cura. Não há buff-portador que o leitor controle,
  então o estado tem de ser **RASTREADO** na vítima do evento (§97).

**A regra geral, porque vai reaparecer:** toda condição da forma "Y aconteceu com Z" racha por QUEM pergunta.
- Se quem pergunta CAUSOU o Y → aplique um efeito no instante do Y (buff/debuff com duração). Sem rastreio.
- Se quem pergunta só OBSERVA o Y (causado por outro) → rastreie o estado em Z, com os quatro pontos do §88.
O rótulo pela AÇÃO ("curado", "atingido", "morto") cobre os dois e apaga a diferença; a pergunta certa é **de quem é o
evento e de quem é a leitura**. Mesmo erro do §46 (nome não é evidência), agora no eixo da CAUSALIDADE, não do mecanismo.

---

## §97 — RASTREIO "curado no turno anterior" (Tsukuyomi): dois tempos, promoção global, e a família que era 1

**A família era 1 (§46 de novo).** A varredura da cura (F1.2 s8) rotulou Freyja/Oxum/Tsukuyomi como `alvoCuradoAntes`. Mas
Freyja e Oxum são `aoCurar` → aplicam `dmgUp` no curado: "EU curo, EU buffo meu aliado" — o curador controla as duas pontas,
então um BUFF-com-duração basta, **sem rastreio**. A Tsukuyomi lê o histórico de cura de um INIMIGO que ela não controla —
leitura OFENSIVA que precisa do estado rastreado. O rastreio nasce **singleto**. O rótulo enganou; a substância é que decide.

**A FORMA: dois booleanos rotativos (`curadoAgora` / `curadoAntes`).** O tempo é a diferença com o `primeiroPorTurno` da
Bastet (§88): lá era "neste turno", aqui é "no turno ANTERIOR". Um bit não basta — é preciso distinguir "curado agora" de
"curado no turno passado". Recusadas: (a) um MARCADOR-efeito aplicado na cura falha a borda cura-no-mesmo-turno (uma cura
reativa no turno da Tsukuyomi marcaria o alvo e daria +10 indevido); (b) um contador único (`==1`) funciona mas a magia do 1
e a sentinela de "nunca curado" são mais frágeis que dois bits nomeados. Dois booleanos leem como o que são.

**Os quatro pontos, nascendo juntos (a lição do §88):**
1. **Casa** — `curadoAgora/curadoAntes:false` em `novaUnidade`.
2. **Escritor** — em `curar`, no ponto exato de `hp > antes`: só cura REAL marca (bloqueada por `noHeal` ou no teto NÃO marca).
3. **Promotor** — em `iniciarTurno`, `antes = agora; agora = false` para **TODAS as unidades dos DOIS lados**, ANTES da regen.
4. **Leitor** — `condOK`: `alvoCuradoAntes → alvo.curadoAntes`; tirei o `pendente` do schema (o validador o recusava).

**A ANCORAGEM — e por que difere do §88 (o ponto que "vale duas rodadas ou nenhuma" se errar).** O resetador da Bastet mora
no turno do DONO (defensivo: o flag vive do golpe-que-chega ao próximo turno dela). O `curadoAntes` é OFENSIVO e cruza o lado:
a Tsukuyomi lê o estado do INIMIGO quando ELA ataca. Então a promoção roda em **todo início de turno, para os dois lados** —
não ancorada ao dono. A janela "curado no turno anterior" fica de **um turno só**: inimigo cura no turno-E → início do turno-T
promove (`antes=true`, Tsukuyomi +10) → próximo início-E promove de novo (`antes=false`, fecha). Ancorar à leitora (como a
Bastet) deixaria o flag do inimigo sem rotacionar direito. Travado em teste: a janela de 1 turno E a borda cura-no-mesmo-turno.

**Tsukuyomi (IMPL 66) — fase + rastreio, sem 3º mecanismo (§93 checado):** básico 12; Anoitecer = escritor da NOITE (§96,
que estava construída e ociosa — payload sem escritor) + `adormecido`; Julgamento da Lua 18 área + `condicional se:{fase:Noite}`
→ `selado` (Silenciar); passiva = o rastreio. **Ela acorda a metade NOITE** — o payload Umbra/Aurora da Noite, que existia sem
quem o ativasse (§95, o gêmeo do §61, resolvido pela ponta que faltava). Nenhuma entrada nova no auditor (18 área ≤ teto).

---

## §96 — O PAYLOAD DA FASE (a fase era um flag inerte) + Amaterasu; e a alavanca real medida (2, não 7)

**A varredura mudou a premissa, o dono escolheu "payload + Amaterasu".** A fase tinha SETE leitores no catálogo mas **UM
construído** (Itzamná) e — o achado maior — **ZERO payload**: ativar o Dia só ligava um booleano que a matemática de dano não
lia. "Acordar a fase" não era escrever dois kits sobre mecanismo pronto; era **construir o mecanismo** (o §93 mordendo: a
coincidência "as duas escrevem fase" escondia o payload + reducao-na-fase + alvoCuradoAntes).

**O PAYLOAD — modificador GLOBAL por elemento do atacante.** `FASE_MOD = { Dia:{Aurora:+8, Umbra:−5}, Noite:{Umbra:+8,
Aurora:−5} }`, somado em `bonusDano` (saída, como o dmgUp). É a DEFINIÇÃO da fase, então mora no motor como tabela fixa.
**Decisão de forma: GLOBAL por elemento, não relativo ao lado.** A prosa fraseia do ponto de vista de quem ativa ("aliados
Aurora +8"), mas um `st.fase` ÚNICO não pode ser relativo-ao-lado — os dois lados leem o mesmo campo. A leitura coerente e
simétrica (Dia favorece a luz e pune a treva, nos DOIS lados) é a única que cabe no modelo, e é a que o próprio dono
conceituou no cabo-de-guerra da varredura. **Consequência aceita:** o Dia da Amaterasu fortalece Aurora INIMIGA também — e
o SEU próprio milagre (Luz da Caverna 28 → 36 no Dia, porque ela é Aurora). Intencional: deusa do sol é mais forte de dia.

**reducao-na-fase saiu de graça (o §95 na prática):** a Amaterasu quer "durante o DIA, 6 de redução ao time". O motor
(`reducaoDeclarativa`) JÁ gateava por `estado` via `estadoOK` — só o VALIDADOR não listava `estado` nos campos do gatilho
`reducao`. Uma palavra. O consumidor estava pronto, esperando o produtor — exatamente a lição que acabei de registrar.

**Amaterasu (IMPL 65) — fiel ao catálogo:** básico 12; Amanhecer ativa o Dia por 3 + cura 12 no time; passiva `reducao v:6
escopo:time estado:{fase:Dia}`; Luz da Caverna 18 área, `seDia:28` + trava-Habilidade (`lockSkill slot:habilidade` via
`condicional se:{fase:Dia}`). Allowlist: **Luz da Caverna** (28 área no Dia — bump condicional de fase). A trava usa o
mesmo `lockSkill slot:habilidade` da Nezha; o `condicional` ramifica por `estado` (fase), não por alvo (§87).

**Q3 do dono — a duração:** `definirFase` faz `st.faseDur = dur` — **RESETA para os 3 turnos cheios do novo escritor, não
herda o restante**. Logo: virar a fase é instantâneo (último-a-escrever-vence) mas *custa um relógio novo* — segurar uma fase
contra um oponente é gastar a habilidade (recarga 2) a cada ~3 turnos. Jogável, não caótico — e hoje ainda mais ameno, porque
só o Itzamná oscila com ela.

**A ALAVANCA REAL (o número que o dono pediu): 2, não 7.** Escrever a Amaterasu acorda o DIA. Ganham comportamento AGORA:
**Itzamná** (+1 orbe no Dia) e **Hou Yi** (o remove-Dia do §94 sai da dormência) — 2 deuses já construídos — mais a própria
Amaterasu. Os outros leitores (change, boto, lugh) e a metade NOITE (Tsukuyomi/change/boto) seguem dormentes: **não existem**.
O payload da Noite foi construído e testado em isolamento, mas fica ocioso até um escritor da Noite (Tsukuyomi) cair —
que arrasta o `alvoCuradoAntes` (singleto `pendente`), trazido à parte como o dono mandou. A "maior alavanca" era 2, não 7:
o §95 medido em número.

---

## §95 — O GÊMEO DO §61: consumidor sem produtor é tão invisível quanto mecanismo sem consumidor

**A varredura da fase revelou o espelho.** O §61 mede uma direção: **mecanismo sem consumidor** (o motor suporta, nenhum kit
exerce — Sun Wukong/execução, Shiva/piso, Babi/dmgDown-do-Medo). A fase mostra a OUTRA direção: **consumidor sem produtor**. Há
**sete LEITORES de fase no catálogo e ZERO ESCRITORES construídos**. O Itzamná (único leitor escrito) lê `st.fase` — um campo que
nunca muda, porque ninguém o ativa. A remoção-de-Dia do Hou Yi (§94) remove um Dia que ninguém ergue. São consumidores lendo o
vazio.

**Por que é tão invisível quanto o §61.** As duas pontas passam por `validarDeus`, pelo smoke e pela suíte inteira sem uma
falha — porque cada lado é internamente coerente; o furo está na JUNÇÃO, que nenhum teste de um-kit-só exercita. O mecanismo
ocioso espera um kit que o chame; o consumidor órfão espera um kit que escreva o que ele lê. **Nenhum dos dois aparece até a
outra ponta chegar.** A varredura de ociosas (que roda hoje) mede mecanismo→consumidor; falta a espelhada, consumidor→produtor.

**A regra nova (prontidão em DUAS direções):** ao varrer prontidão, pergunte os dois lados —
1. **§61:** todo mecanismo do motor tem ao menos um kit que o exerce? (mecanismo→consumidor)
2. **§95:** todo campo/estado que um kit LÊ tem ao menos um kit que o ESCREVE? (consumidor→produtor)
Um `grep` dos leitores de `st.fase` cruzado com os escritores de `st.fase` teria previsto a dormência do Hou Yi antes de eu a
descobrir escrevendo. É o mesmo método do §37 (varrer o conjunto corrige o número), aplicado ao GRAFO produtor→consumidor, não a
um mecanismo isolado.

---

## §94 — REMOÇÃO SELETIVA DE FASE (Hou Yi): a varredura confirmou "sai em ~3 linhas", com uma dobra (seletivo) e uma dormência

**A VARREDURA DA FAMÍLIA (o dono exigiu, antes de escrever) — duas perguntas, duas respostas:**

1. **Quantos removem fase? Seletivo?** No catálogo inteiro, **só o Hou Yi** remove fase — nasce SINGLETON, não família (o dono
   já suspeitava: "um gancho contra os três do Susanoo"). E é **SELETIVO**: "remove o DIA" (não a Noite). Isso MUDA A FORMA — não
   é `fase = null` incondicional (que apagaria a Noite também), é **limpar SÓ se a fase atual for a nomeada**. A dobra que o dono
   mandou procurar existe, e é pequena: um `if (st.fase === e.remove) definirFase(st, null)`.

2. **Dono / disputa / duração?** O modelo (confirmado na implementação, como o dono decidiu na sessão 15): **UM `st.fase` global,
   sem dono, Dia/Noite mutuamente exclusivos** (campo único), duração global `st.faseDur`, **último-a-escrever-vence**;
   `definirFase(st, null)` já zera fase E duração, e a expiração natural (turno) usa o MESMO caminho. A remoção é só mais um
   escritor que zera — **não precisa de dono, disputa nem duração nova**: dois deuses de fase em lados opostos já resolvem pelo
   campo único (o último escreve), e o "abater o Sol" limpa o Dia global de quem quer que o tenha erguido. **Cabe no modelo. Nada
   a trazer antes.** Logo, escrevi o Hou Yi na mesma sessão (a condição do dono).

**FORMA:** `{t:'fase', remove:'Dia'}` — o mesmo fx que ATIVA (`v:'Dia', dur:N`) agora também REMOVE (`remove:'Dia'`), seletivo.
`remove` ∈ {Dia,Noite}, validado; `remove` fora do fx `fase` é erro em voz alta (typo não passa). ~3 linhas de motor + validação.

**Hou Yi (IMPL 64) — fiel ao catálogo:** básico `kind:'perfurante'` (15, como Horus/Ogum); habilidade 25 **/40 vs Aurora**
(`seCond alvoElem`) + `fase remove:Dia`; milagre **Nove Flechas** = 9×5 distribuído (§92) **/8 vs Aurora**; passiva
`ignoraInalvejavel` + `bonusDano +8 vs buff`. Duas entradas de allowlist (bumps condicionais por elemento): **Abater o Sol** (40)
e **Nove Flechas** (72 = 9×8 se TODAS em Aurora — o **72 segue candidato a revisão**, não aprovado).

**A DORMÊNCIA HONESTA (§61 ao contrário):** os ESCRITORES de fase (Amaterasu=Dia, Tsukuyomi=Noite) **ainda não estão
construídos** — só um LEITOR (Itzamná). Então a remoção do Hou Yi é correta e testada em isolamento, mas **em partida real fica
dormente até a Amaterasu existir** (sem Dia erguido, não há o que remover). É o inverso do §61 (lá o motor esperava o kit; aqui
o CONSUMIDOR chega antes do PRODUTOR) — e é bom: quando a Amaterasu cair, a interação já está pronta e travada em teste. O resto
do Hou Yi (perfurante, 9-flechas, ignora-inalvejável, +8 vs buff) é live já. Anotado, não escondido.

---

## §93 — COINCIDÊNCIA DE FAMÍLIA NÃO É ESCREVIBILIDADE: o §46 sobrevive ao §54 (são perguntas diferentes)

**A virada do §92 destilada.** Aprovei "multi-golpe distribuído" como FRENTE com três consumidores (Susanoo/Babi/Hou Yi). O §54
validou que os três COINCIDEM no mecanismo — e coincidem. Mas só o Babi era escrevível: Susanoo e Hou Yi **travam noutra coisa**
(dispel+combo+tamanho-de-lado; remoção-de-fase). **O §54 valida a COINCIDÊNCIA do mecanismo — não os OUTROS mecanismos que cada
consumidor ARRASTA.** São duas perguntas: (1) "esses kits coincidem no mecanismo X?" e (2) "esses kits são escrevíveis com o que
existe + X?". Eu tratei como uma. O rótulo de família enganou **mesmo DEPOIS do §54** — o §46 (nome não é evidência) tem um
alcance maior do que eu registrara: vale para a família inteira, e sobrevive ao teste que eu achava que o dissolvia.

**A regra nova:** ao aprovar uma frente por um mecanismo comum, rode o §54 para a coincidência E uma varredura de
ESCREVIBILIDADE por consumidor (quais OUTROS mecanismos cada kit puxa, e quais existem). A coincidência dá o mecanismo; a
escrevibilidade dá QUANTOS deuses saem na leva. Quase sempre são números diferentes — e o menor é o honesto (§90).

**Dois acréscimos aos ledgers:**
- **"Método expõe bug anterior" (o mais valioso do §92):** o auditor de teto era **cego ao total empilhado** de um distribuído
  (via `e.v`, não N×v). Sem a correção, a PRÓXIMA distribuída passaria em silêncio. Some à lista onde o método (somar o pior
  caso) revela o furo que a régua velha não via — como o 30-área do Xangô (§66).
- **§61 em 4/4:** o Babi fechando a metade OCIOSA do Medo (a Mula aplicava `medo` sem `dmgDown` desde a F1.4, esperando quem
  preenchesse) é o §60 se cumprindo como previsto. Quatro mecanismos que o motor tinha e nenhum kit exercia, agora provados: Sun
  Wukong (execução-imune), Yan Wong (naoRevive-em-apply), Shiva (ignoraPiso), Babi (dmgDown do Medo). Zero falha em quatro.

---

## §92 — MULTI-GOLPE DISTRIBUÍDO: mecanismo + Forma A + auditor N×v; e a varredura dos consumidores só deixou 1 (Babi)

**O ACHADO DE BALANCEAMENTO (maior que o de interface).** O auditor de teto olha CADA golpe (`e.v`) — mas o TOTAL empilhado
num alvo passa despercebido. Um distribuído de 9×5 faz **45 num alvo** (72 num rider); 8×4 faz **32** — a régua velha nunca
previu o formato DISTRIBUÍDO (cada golpe pequeno, o total enorme). **Consertado:** o auditor passa a somar o PIOR CASO de uma
habilidade distribuída — **N×v + riders condicionais** (`seCond` etc.), teto de ALVO ÚNICO (o stack É permitido, então o pior
caso é tudo num alvo — `distribui` ≠ área). E ao consertá-lo, **re-rodei contra tudo** (§66). Resultado da re-rodada: nenhum
deus construído HOJE tripa — o único distribuído que entrou (Babi, 4×10=40) senta EXATO no teto de milagre. A allowlist NÃO
ganhou entrada nova: a régua nova é que passou a enxergar o formato; ela só vai morder quando um distribuído over-teto for
escrito (então Hou Yi/Susanoo entram como exceção — ver abaixo).

**INTERFACE: Forma A — seleciona alvos, split automático igual.** O argumento decisivo NÃO é o teto de gestos — é que os
intents reais são FOCAR ou ESPALHAR; split fino tipo 5/3 é liberdade que existe no papel e não no uso (a Forma B pagaria 7
toques por uma opção que ninguém planeja). **Nota prosa-vs-mecânica:** "como você quiser" passa a significar **focar num, ou
dividir igual entre os escolhidos** — é honesto e é o que o jogador faria. `alvo:'distribui'` (multi-select por TOGGLE,
CONFIRMAR explícito, sem auto-confirmar); o motor reparte igual, EXTRA p/ os primeiros SELECIONADOS (a ordem de seleção manda).

**Três invariantes de construção (todas com TESTE, não só nota):**
1. **Degenerado:** 1 inimigo vivo → pula a distribuição, vira fluxo normal de alvo único (toque resolve); 2+ vivos → pede
   seleção. A TRANSIÇÃO é o que parece bug se falhar. (interface.test.js §11c + primitivas §15.)
2. **Divisão desigual:** 8 golpes entre 3 = 3/3/2; o EXTRA vai para o **primeiro selecionado** (previsível — a ordem de
   `alvos` É a ordem de seleção). Travado em teste, inclusive a prova de que a ORDEM manda (o 3º escolhido 1º leva o extra).
3. **Invariante 13 (o mais antigo):** armar → selecionar dois alvos → cancelar = ZERO orbe gasto, ZERO recarga acionada,
   ZERO HP. É o primeiro caso do projeto com estado parcial ACUMULADO; o gasto só ocorre no commit (`agir`/`confirmar`).

**A VARREDURA DOS CONSUMIDORES (§54/§87) — 3 candidatos viram 1.** A triagem marcou Susanoo/Babi/Hou Yi com o gancho
`multi-hit-distribuido`, mas cada kit do catálogo COMPÕE um SEGUNDO mecanismo. Varri os três contra o que o motor já tem:
- **Babi (IMPL 63) — ÚNICO construído.** Milagre = 4 golpes de 10 distribuídos + `curaMetade` (§92 puro); habilidade = Medo
  em todos (Medo §60 JÁ EXISTE); passiva = +10 vs Medo (`bonusDano quando:{alvoDebuff:'medo'}`, já existe). **Zero motor novo
  além do §92.** E fecha um §61: a habilidade da Babi carrega `dmgDown:8` no `medo` — a Mula aplicava `medo` SEM `dmgDown` (a
  metade "8 menos de dano" estava ociosa desde a F1.4); a Babi é a 1ª a exercê-la. O §60 previu isto ("babi aplica as duas
  metades sob um nome") — cumprido agora. **§61 4/4 verde.**
- **Susanoo — ADIADO.** Precisa de TRÊS mecanismos que não existem: `dispel`-1 (básico "remove 1 buff"), geração-de-Combo-
  por-ataque (passiva) e ESCALA-POR-TAMANHO-DE-LADO ("+6 por aliado a menos que o inimigo" — o "fora da família" já anotado
  na triagem: tamanho-de-lado, não status). Só o milagre-Combo (`consomeContadorLado`) já daria. Multi-mecanismo: leva própria.
- **Hou Yi — ADIADO por UM.** Milagre = 9 flechas de 5 +3 vs Aurora (`seCond alvoElem:'Aurora'`, §92 puro) e passiva
  (`ignoraInalvejavel` + `bonusDano quando:alvoBuff`) já são construíveis; o ÚNICO bloqueio é a habilidade "remove o DIA" =
  **remoção-de-fase** (novo). Fica a um mecanismo. QUANDO entrar: milagre = 45 num alvo, **72 se todas caírem em Aurora** →
  allowlist "Nove Flechas", com o **72 como CANDIDATO A REVISÃO, não aprovado** (medir na arena — o dono já sinalizou).

**A leitura honesta (§46/§90 outra vez):** "três consumidores" era rótulo da triagem (nome do gancho, não substância). O §92
nasceu COM consumidor real (Babi) — não vira ociosa. Os outros dois não são §92-blocked; são bloqueados por OUTROS mecanismos
(dispel/combo/tamanho-de-lado; remoção-de-fase), que são as próximas frentes.

---

## §91 — ignora-Invulnerabilidade (fecho mais barato) fecha o Shiva E o Odin na mesma leva; "cdReset" era miragem

**Shiva (IMPL 61) — ignora-Invulnerabilidade, forma corrigida (§84):** flag de HABILIDADE no `dmg` (`ignoraInvuln`) que flui
p/ o `opts` do `bater`, não passiva. ~3 linhas. E o `ignoraPiso` (param de `opts` que EXISTIA sem consumidor de kit) foi
exercitado junto — Shiva é o 1º a furar o piso. **§61 pela terceira vez** (Sun Wukong=execução-imune, Yan Wong=naoRevive-
em-apply, Shiva=ignora-piso): mecanismo que o motor tinha e nenhum kit provara. O `kind:puro` já cobre a Defesa Destrutível
(escudo); as duas flags cobrem o resto. Terceiro Olho (45, umaVez) entrou na allowlist do auditor (nuke-de-fim, não correção).

**Odin (IMPL 62) — FECHADO na MESMA leva: estava a UM gancho.** Depois do ignora-Invuln, varri o Odin e ele estava a UM só:
- básico: ignora-Invuln (esta leva) + ignora-Inalvej (§84) ✓
- habilidade: marca (§83) — e o "+6 contra marcados" mora na PASSIVA (`bonusDano escopo:time quando:{alvoMarca:qualquer}`),
  não na habilidade (que só APLICA a marca). Aplicador e leitor são fx separados, como toda marca ofensiva (§83) ✓
- milagre: `selfHp -15` + "zera todas as recargas de 1 aliado" = **`cdShift {unidade, v:-99}` — JÁ EXISTIA** (o "cdReset" da
  triagem era MIRAGEM; §46 de novo) + `apply dmgUp` ✓
- passiva: abertura+orbGain ✓ + o ÚNICO gancho novo → **`faccaoConta`** (nº de aliados de uma facção cruza um limiar,
  "2+ Nórdicos"). Pequeno, **serve SÓ o Odin** (varrido) — small-serve-um, regra 3.

**Duas coisas viraram JÁ-DÁ ao olhar o motor** (a triagem as chamara de mecanismo): "zera recargas" (é `cdShift v:-99`) e
o Odin inteiro além do `faccaoConta`. O `faccaoConta` nasceu COM o Odin — ociosa segue em 0.

**A TAXA DO §61 — 3/3, todos verdes (o dono mandou MEDIR, não assumir).** Três mecanismos que o motor suportava e nenhum
kit havia exercido, agora provados por kit real, TODOS passaram: imunidade-a-execução (Sun Wukong, §86), `naoRevive`-em-
apply (Yan Wong, §89), `ignoraPiso` (Shiva, §91). Zero falha em três tentativas. **A leitura:** o motor é mais confiável do
que o §61 temia — a construção-com-teste-primeiro (a fase-primitivas, `primitivas.test.js`) pagou; o "mecanismo existe mas
ninguém provou" tem dado verde. Vale MEDIR a taxa (3/3 até aqui) em vez de assumir o pior — mas seguir exercitando cada um
por kit, porque o custo de descobrir tarde é alto e o de confirmar é um teste.

---

## §90 — O §46 SUBIU DE NÍVEL: o rótulo engana sobre a FAMÍLIA, não só sobre o mecanismo; e o §54 valida se a família EXISTE

**A re-triagem dos 40 (pós-F1.8, com 15 mecanismos novos desde a última).** Três baldes-teto: JÁ-DÁ ~7, HOOK ~22,
MECANISMO ~11. A virada É real e inédita no projeto: a fila **converge** — a primeira metade era 50 ganchos com 31 de
deus-único; esta agrupa de verdade. MAS o número honesto sai DEPOIS do §54, não antes.

**A ARMADILHA (o dono a nomeou):** eu primeiro reportei "8 famílias cobrem 25 dos 33" — e o número estava INFLADO por
rótulo. Agrupei deuses por RÓTULO-DE-FAMÍLIA, não por mecanismo. **É o §46/§76 um nível acima:** antes o rótulo enganava
sobre o mecanismo de UM deus; agora engana sobre a FAMÍLIA de mecanismos. As duas primeiras famílias racharam no §54:
- **ação-adiada (5)** → NÃO é família. Cinco disparos distintos com um rótulo: one-shot-próximo-turno (Kukulkán),
  recorrente-fim-de-turno (Kali), limiar-fim-de-turno (Morrigan — o §83 PROIBIU fundir com timer), renascimento-de-invocação
  (Cernunnos), e Dionísio que nem agenda (é `dominado`-em-todos). Fundir violaria §59+§83.
- **cd-manipulação (5)** → 2 já-dão (`cdShift {unidade, v:-99}` já zera todas — Odin/Mimir), 1 hook (Ares), 2 reais
  (Chang'e/Lugh = recarga-base-condicional).

**A REGRA (o dono):** o §54 não é só "dois efeitos são um?" — é o **teste que valida se uma FAMÍLIA existe antes de se
sequenciar por ela**. Aplicá-lo DEPOIS de escolher a frente é tarde: aí já se escolheu por rótulo. Passa-se o §54 na
família ANTES de tratá-la como infra. A virada continua real, só menor — e o número honesto é o pós-§54.

**§54 nas três candidatas que sobraram** (resultado no chat): multi-golpe-distribuído = 3 reais (todos escolha-do-jogador,
coincidem; custam INTERFACE); iniciativa = 3 mas TODOS entre-turnos (mexem no laço de turno → MECANISMO pesado, não hook);
seletor-por-HP = 2 (mais-ferido/maior-HP = min/max, coincidem; Hanuman SAI, o "Senhor" dele é aliado-designado, não HP).

**DUAS RECLASSIFICAÇÕES, as duas por OLHAR O MOTOR em vez do rótulo:** (a) iniciativa saiu da família de gancho — dentro do
lado a ordem já é livre (`agir(uid)` de qualquer unidade), então "age primeiro" só pode ser ENTRE-turnos (`st.ativo`/
`starter`), que é o laço; (b) Hanuman saiu do seletor-por-HP — o "Senhor" é aliado DESIGNADO, o HP é só fallback.

**O NÚMERO HONESTO (pós-§54), a correção do "8 famílias/25":** **3 famílias reais** (distribuído 3, seletor 2, +as de-2 do
platô), um **platô de famílias-de-2** (recarga-base-condicional, buff-steal, ataque-inevitável, ignora-Invuln, pendente-
próximo-turno), **~14 singletons** (Kali, Morrigan, Cernunnos, Dionísio, Hanuman, Mnevis, Tsukuyomi, Boto, Izanagi,
Khonshu, Ares, Yamato, Guan Yu, Anúbis/Ammit) e **~7 traduções** (Osíris, Amaterasu, Shuten, Kitsune, Nüwa, Raijin,
Odin/Mimir-cdShift). A convergência é REAL mas modesta — o topo é 3, não 5. Saber isto agora vale mais que o número otimista.

**GATILHO DE REVISÃO — INICIATIVA POR ÚLTIMO:** ela mexe no laço de turno (o coração do motor); mexer nele com 40 kits pela
metade é onde um bug se esconde por levas. Entra QUANDO OS KITS ESTIVEREM ESCRITOS, não antes.

---

## §89 — YAN WONG zera as ociosas; o Livro É EXECUÇÃO (definido na estreia); e o Sun Wukong vira counter estrutural

**A LISTA DE OCIOSAS ZEROU.** Yan Wong (IMPL 60) drena o `livro` — o último resíduo da fase-primitivas. **Ociosa: 1 → 0.**
Daqui em diante todo mecanismo do motor tem consumidor: o padrão saudável (§87) deixou de ser meta e passou a ser o
único estado do projeto.

**DECISÃO: a morte-por-Livro É execução (`matar(..., {execucao:true})`).** Definida na ESTREIA — o `livro` não tinha
consumidor, então não há comportamento a mudar, só a definir (mais barato que definir depois). O argumento decisivo é de
COERÊNCIA INTERNA (o dono): a passiva diz "não pode ser revivido sob o Livro". Se o Livro NÃO fosse execução, o `vidaExtra`
salvaria a vítima — ela sobreviveria com 1 HP e a cláusula anti-revive NUNCA se aplicaria (não houve morte). A prosa
promete morte definitiva; só a execução entrega. E o `livro` já carregava `naoRevive` (o snapshot do `matar` o lê) — mas
`naoRevive` sem morte definitiva é letra morta.

**PARECERÁ BUG, É DESIGN (o dono mandou registrar): o Sun Wukong é o COUNTER ESTRUTURAL do Yan Wong.** Ele é o ÚNICO imune
a execução no jogo (§89 — a imunidade-a-`execucao`, provada no §86). Como o Livro é execução, o Sun Wukong SOBREVIVE ao
Livro. Quem vir o Livro "falhando" contra ele vai achar bug — é design caindo de graça (o Rei Macaco furta o livro-razão
do submundo). O bloco do Livro respeita `imuneA(execucao)`, como a execução-por-limiar já fazia.

**A VARREDURA DE CONSUMIDORES DE `execucao` (o dono exigiu antes de mudar o flag).** Marcar o Livro como execução aciona
TODO leitor de `execucao`; varridos e confirmados um a um: (1) `imuneA(execucao)` — Sun Wukong sobrevive ✓; (2) o furo no
`vidaExtra` (linha 811) — não salva do Livro ✓; (3) o snapshot `naoRevive` (821) — selado ✓; (4) o log `queda:execucao`
(827) — dispara o `porExecucao` ✓; (5) o `aoCair` NÃO filtra por execução, então não muda. Cada um se comportou certo: o
flag carrega exatamente "morte definitiva", nem mais nem menos.

**ESCOPO do "orbe por execução": UNIFORME (qualquer execução inimiga), não só a do Livro.** Leitura LITERAL — a prosa diz
"por execução", não "por execução dele". A literal ganha quando não há ambiguidade (o mesmo critério do "rouba vs ganha" e
do "OU" do Khnum). Um gatilho `porExecucao` (novo): quando um inimigo morre por QUALQUER execução (Livro, `executaAbaixoDe`
do Hades/Fenrir/Iara), o lado oposto ao morto ganha o `faz` (1 orbe). Testado com as duas fontes.

**§61 outra vez:** aplicar um efeito com `naoRevive` (a Hel/o Livro) o motor suportava e NENHUM kit exercia — Yan Wong é o
primeiro. Verde. **Dois mecanismos novos** (`porExecucao`, `aceleraLivro`), ambos nascidos COM o Yan Wong — não sobem em
lista nenhuma (a lista está vazia).

---

## §88 — primeiroPorTurno: o RASTREIO nasce com os quatro pontos juntos (antídoto do §73); e Bastet drena o intercepta

**A leva.** Bastet (IMPL 59) — o mínimo limpo: UM mecanismo novo (o flag), ZERO payload novo, e a habilidade dela
consome `intercepta`. A lista de infra-ociosa cai **2 → 1** (sobra só `livro`). Escolhida sobre o Mnevis porque troca
"1 mecanismo, 0 novo" por "2, 1 novo" — o §87 aplicado à frente: prefere-se a que drena ocioso.

**O que faltava era SÓ o flag.** A `reducao` já compunha `estado` E `contra:{alcance}` (o wiring do §45 já existia:
`reducaoDeclarativa` checa `estadoOK`, `contraCasou` resolve `alcance`). O único pendente era o `primeiroPorTurno` — e ele
é a ÚNICA condição de `estado` que exige RASTREIO (bookkeeping), não LEITURA: as outras leem estado que já existe
(paridade, fase, contador, hp, aliados); esta escreve um flag por unidade e o reseta por turno. A distinção da F1.2.5 s3
segue de pé.

**OS QUATRO PONTOS NASCEM JUNTOS (o antídoto do §73 — campo declarado sem leitor/escritor nasce órfão):**
1. **Casa** — `golpeUnicoNoTurno: false` em `novaUnidade`.
2. **Escritor** — no `bater`, DEPOIS do `calcDano` (a reducao deste golpe já leu o flag limpo), `if (unico) alvo.golpe
   UnicoNoTurno = true`.
3. **Resetador** — em `iniciarTurno`, ao lado do `u.agiu = false`.
4. **Leitor** — `estadoOK`: `primeiroPorTurno = !u.golpeUnicoNoTurno`.

**AS DUAS DECISÕES DE TIMING (o dono insistiu — cada uma travada em teste):**
- **RESET NO TURNO DO DONO, não do atacante.** "cada turno" para um efeito DEFENSIVO significa "cada RODADA em que eu
  possa ser atingido". Resetar no turno do dono deixa o flag ARMADO para o turno inimigo seguinte, que é quando o golpe
  chega. Resetar no turno do atacante daria a proteção 2× por rodada num hot-seat.
- **`unico` NO ESCRITOR, não só no leitor.** Se a AoE marcasse o flag, ela CONSUMIRIA a proteção sem acioná-la — o jogador
  levaria área e depois o primeiro golpe único passaria limpo. O escritor é escopado a `unico`; a AoE não marca.
- **Derivada:** dois dmg num MESMO fx contam como dois golpes (o `bater` roda por dmg) — o 2º já não é o primeiro. O básico
  2×7 da Bastet torna o caso alcançável numa ação; travado.

**INTERAÇÃO com intercepta/redirect:** o flag é setado no RECEPTOR (a recursão do `bater` seta o flag de quem de fato
leva), não no alvo original — quem tem o golpe desviado/interceptado não marca o próprio flag. Cai da forma do §84 (a
reatribuição da vítima acontece dentro do `bater`).

---

## §87 — HÓRUS + a decisão-(b): EXCLUSÃO POR CONSTRUÇÃO vence exclusão por disciplina; e minha instrução foi superada

**A leva.** Hórus (IMPL 58) — consome a MARCA, então a lista de infra-ociosa cai **3 → 2** (sobram `livro` e `intercepta`,
os resíduos antigos da fase-primitivas). O `kind` (puro/perfurante) já era campo de dmg — a troca de categoria de dano
(32 normal → 45 puro) custou ZERO. Só a EXCLUSÃO MÚTUA precisava de forma.

**A decisão-(b), resolvida: `condicional` lê a condição do ALVO (não só do campo).** O fx `condicional` (Freyja, `se/entao/
senao`) só lia `estadoOK` (campo/self). Agora o `se` desambigua pela CHAVE: se ∈ `CONDICOES` (`alvoMarca`, `alvoDebuff`…)
lê o ALVO via `condOK(alvos[0])`; senão lê o campo via `estadoOK`. O milagre do Hórus:
`{condicional, se:{alvoMarca:'olho'}, entao:[dmg 45 puro], senao:[dmg 32]}`.

**MINHA INSTRUÇÃO FOI SUPERADA PELA ANÁLISE (o dono mandou registrar).** O dono decidiu "DOIS FX COM CONDIÇÃO". A análise
achou melhor: **UM fx com DOIS RAMOS.** Ela atende o MOTIVO do dono (os dois alternativos VISÍVEIS, nada escondido num
modificador) SEM o risco que a forma dele carregava. A forma "dois fx com guardas complementares" (Opção B) depende de os
dois guardas permanecerem negações perfeitas — editar um produz `32+45` ou uma lacuna, em silêncio, e nenhum teste sente:
é a fragilidade que o §59 registra. **Estrutura que só funciona se ninguém errar não é estrutura.** O `condicional` dá
**EXCLUSÃO POR CONSTRUÇÃO**: só um ramo roda, `32+45` é impossível — não por disciplina, por forma. Registrado que a
instrução original era pior que a análise que a cumpriu.

**O caveat e o cadeado.** `condicional.se` ganhar dois sentidos é aceitável porque a desambiguação é ESTRUTURAL — a chave
pertence a um vocabulário OU ao outro, o validador decide sem heurística (o mesmo teste que o reuso de `efeito` para nome
de contador passou: nenhum consumidor lê um sem saber qual é). MAS isso só vale enquanto as famílias forem DISJUNTAS. O
cadeado: **`valida_kit` FALHA ALTO no load se `CONDICOES ∩ ESTADO_COND ≠ ∅`** — hoje é vazio, e o guarda impede que alguém
crie a colisão depois. Duas linhas que matam a única forma de o caveat virar bug. Teste em `primitivas.test.js` (13).

**PENDÊNCIA CONHECIDA + gatilho de revisão.** O `condicional` ramifica sobre `alvos[0]` — **alvo ÚNICO**. NÃO ramifica
por-alvo numa AoE (cada inimigo com/sem a marca). O milagre do Hórus é alvo único, então cabe. **Se aparecer um kit que
precise ramificar por alvo em área, reavaliar** (provavelmente um `condicional` que roda dentro do laço de `sel`, por
alvo). Registrado para não ser redescoberto como bug.

**checar_cadeia.** O `danosFx` agora recursa nos ramos `entao/senao` do `condicional` — os dmg deles SÃO o dano da
habilidade, só condicionais, e caem no balde "multi/condicional" (naoConf) com os dois valores à vista. Não afeta a
Freyja (ramos revive/apply, sem dmg).

**GENERALIZAÇÃO — o §87 aplicado à ESCOLHA DE FRENTE, não só de mecanismo (o dono):** assim como um mecanismo nasce com
consumidor para não virar ocioso, uma FRENTE se escolhe pela que **CONSOME ocioso**, não pela que só entrega largura. O
`primeiroPorTurno` ganhou não por servir 3 (largura), mas porque construir bastet/mnevis **drena o `intercepta`** da lista
de ociosas. Regra: **entre duas frentes de mérito parecido, prefira a que retira infra ociosa da lista à que só adiciona
kits.** É o mesmo princípio (não deixar motor sem consumo) subindo um nível — da peça para o roteiro.

---

## §86 — O QUARTO TIPO DE ÓRFÃO: PROSA-SEM-FX; e a leva de CONSUMO (Sun Wukong + Boitatá)

**A leva.** O número de calibração (§ anterior: 4 infra ociosas, 2 deste arco) mandou CONSUMIR, não construir. Esta leva
não tocou mecanismo: **Sun Wukong** (IMPL 57, kit limpo — consome Inalvejável, imunidade-a-execução e vidaExtra num só
kit) + **Boitatá** (fecha um órfão). Depois dela, a lista de ociosas cai de **4 → 3** (marca, livro, intercepta): a
Inalvejável saiu (2 consumidores). A marca ainda espera o Hórus (que custa 1 mecanismo — decisão à parte).

**§61 CONFIRMADO com kit real.** A imunidade-a-`execucao` estava construída há sessões e NUNCA fora exercitada por deus
real (só o motor a tinha). O Sun Wukong a provou: abaixo do limiar ele NÃO morre; um zeus sem imunidade morre (não era
falso-verde). Teste permanente. Zero bug latente — o §61 (mecanismo existe mas ninguém provou com kit) deu verde aqui.

**O QUARTO TIPO DE ÓRFÃO (o dono pediu para nomear) — PROSA-SEM-FX.** A taxonomia de órfão agora tem quatro:
1. **etiqueta-sem-enforce** (dominado): o token ESTÁ no fx, mas o motor não o faz cumprir.
2. **campo-sem-fio** (usos): o CAMPO existe no estado, mas nada o lê/escreve.
3. **cláusula-satisfeita-pela-arquitetura** (Sun Wukong "só alvo único", §84): a prosa promete e a arquitetura JÁ entrega
   sem código — o órfão BENIGNO (só precisa ser nomeado p/ ninguém "implementar" e quebrar).
4. **prosa-sem-fx** (Boitatá "o time ignora Inalvejável"): a prosa promete na DESCRIÇÃO e o fx **nunca declarou o
   gatilho**. O kit mente por omissão.

**Por que o (4) é o mais traiçoeiro:** os outros três têm um TOKEN no código (a etiqueta, o campo, a arquitetura) que uma
varredura de vocabulário pode achar. O prosa-sem-fx **não tem token no fx** — não há órfão a *encontrar* por varredura de
símbolo. Só a leitura PROSA-vs-FX o pega (a gêmea não-numérica do `checar_cadeia`, que hoje só confere números).

**Vale uma varredura desse tipo nos 56? Resposta calibrada: NÃO como leva dedicada agora.** Uma heurística prosa-vs-fx
(promessa na desc → gatilho esperado) varreu os 56 e achou **0 além do Boitatá** (1 falso-positivo, o Huang Di, cujo "no
início de cada turno" usa `porTurno` corretamente). Sinal fraco. E há uma razão estrutural: o Boitatá orfanou porque, quando
foi escrito, o gatilho `ignoraInalvejavel` **não existia** — o autor escreveu a prosa e deixou o fx incompleto, um pendente
esquecido. **Prosa-sem-fx agrupa-se em torno de mecânicas que estavam PENDENTES quando o kit foi escrito.** Isso dá o lugar
barato de olhar: **quando um gatilho novo nasce, varrer a prosa dos kits JÁ escritos por cláusulas que ele agora satisfaz**
(foi exatamente assim que o Boitatá caiu, na varredura da Inalvejável). Recomendação: virar PASSO do checklist de construir
mecanismo, não uma leva de auditoria. O elo-C (prosa-de-mecânica ↔ fx-gatilho) no `checar_cadeia` pode crescer
incrementalmente, um clause-check por gatilho, se algum dia o sinal subir.

---

## §85 — INVARIANTE DE ARQUITETURA TRAVADA POR TESTE QUE LÊ O CÓDIGO-FONTE (não por comentário)

**A técnica (o dono a nomeou como o item mais valioso da sessão da Inalvejável).** Quando uma decisão de arquitetura
depende de algo **NÃO estar** em certo lugar — a Inalvejável mora só em `alvosValidos`, NUNCA no `bater` — um comentário
não a protege: o conserto "defensivo" (`if (ef(alvo,'inalvejavel')) return 0` no `bater`, espelhando o `submerso`) parece
CERTO para quem chega depois e não sabe por que a camada existe. A defesa é um **teste que lê o CÓDIGO-FONTE** e apita se
o token proibido aparecer na região proibida:

```js
const src = fs.readFileSync('src/engine.js','utf8');
const corpo = src.slice(src.indexOf('function bater('), src.indexOf('\nfunction ', ...));
ok(!/inalvejavel/.test(corpo), 'o corpo de bater() NÃO menciona inalvejavel');
```

**A regra reusável:** **comportamento prova comportamento; AUSÊNCIA ESTRUTURAL precisa de LEITURA ESTRUTURAL.** Um teste
de comportamento (o redirect-para-sink-inalvejável ATINGE) prova a consequência HOJE; mas ele não impede que alguém
AMANHÃ adicione o filtro no `bater` e, para compensar, ajuste o próprio teste. O teste que lê o fonte trava a CAUSA, não
só o sintoma. É a gêmea estrutural do §80 (a captura é árbitro do pixel) e do §37 (varrer o conjunto, não a amostra):
três formas de checar o que o teste comportamental sozinho não pega. Usar quando a invariante for "X não aparece em Y",
"só a função Z toca W", "nenhum `require` cruzado entre A e B" (o `checarDirecaoUI` do build já é um exemplo vivo disto).

**IRMÃ (F1.9 Hórus §87, o dono mandou registrar junto): INVARIANTE DE VOCABULÁRIO travada por GUARDA NO LOAD.** Quando a
correção de um mecanismo depende de dois CONJUNTOS serem disjuntos — `CONDICOES ∩ ESTADO_COND = ∅`, para o `condicional.se`
desambiguar pela chave sem heurística — a disjunção NÃO pode ser convenção ("hoje não cruzam, é só não cruzar"). Uma
convenção quebra calada quando alguém adiciona uma chave. A defesa é um **guarda no LOAD** que FALHA ALTO se a interseção
existir (`valida_kit` lança no require). É a mesma família do teste-que-lê-o-fonte: a garantia estrutural (dois conjuntos
disjuntos, um token ausente, uma direção de dependência) precisa de uma checagem estrutural que roda sempre, não de
disciplina. Regra: **se a correção assume "X e Y não se cruzam", ponha o guarda que falha quando se cruzarem.**

---

## §84 — F1.9 INALVEJÁVEL: dois eixos (mira vs dano), a cláusula-satisfeita-pela-arquitetura, e as decisões (a/b/c)

**A varredura (antes do desenho, como sempre).** Inalvejável = 11 kits (7 aplicam, 4 ignoram); o número engana no sentido
INVERSO ao usual — o alcance é MAIOR que 11, porque o mecanismo mora no núcleo de mira (`alvosValidos`) que toda
habilidade de alvo único atravessa e a IA cruza milhares de vezes. Invulnerável = 4 kits, e o status JÁ existe (Aquiles/
Baldur aplicam; a linha 737 zera o dano).

**§54 DEFINITIVO — Inalvejável e Invulnerável são DOIS mecanismos, em CAMADAS diferentes:**
- **Inalvejável** = não-pode-ser-ALVO (camada de MIRA: sai da lista selecionável).
- **Invulnerável** = o DANO vai a ZERO (camada de DANO: pode ser mirado, o golpe é anulado).
- A prova é o **Odin**: "ignora Invulnerabilidade **e** Inalvejável" — nomeia os DOIS na mesma cláusula. Kits não carregam
  redundância assim; se fossem um, a segunda menção não existiria. **É o mesmo argumento que separou `vidaExtra` de
  `execução`** (§Bloco-1). Reforço: Shiva fura Invulnerabilidade e é SILENCIOSO sobre Inalvejável (perfura dano, não mira).
- E **"ignora X" é DOIS mecanismos**: ignora-Inalvejável = override de MIRA (poder selecionar o oculto); ignora-
  Invulnerabilidade = override de DANO (o golpe passa) = terceira entrada em `IGNORAVEIS`/`danoIrredutivel` (~3 linhas).

**A CLÁUSULA SATISFEITA PELA ARQUITETURA (o dono mandou nomear — o oposto da etiqueta órfã).** "Inalvejável **por
habilidades de alvo único**" (Sun Wukong) custa ZERO código: a AoE passa por outro caminho (linha 1346, filtra só `vivo`)
e a Inalvejável não tem zera-dano — então a área já a ignora sozinha. Dois casos de lacuna prosa↔código, sinais opostos,
ambos merecem nome:
- **Etiqueta órfã** (§71): a prosa promete, o código é silencioso → BURACO. (Ex.: cláusula vácua da afrodite.)
- **Cláusula satisfeita pela arquitetura** (§84): a prosa promete, a arquitetura JÁ entrega sem código → OK, mas tem de
  ser NOMEADA, senão alguém "implementa" o que já funciona e QUEBRA (ex.: um `if(inalvejavel) return 0` defensivo no
  `bater` mataria o "AoE ignora" e o "redirect atinge o sink"). Nomear é o que impede a regressão.

**As decisões do dono (F1.9, antes de qualquer linha de motor):**
- **(a) Inalvejável = evasão, SÓ mira INIMIGA. Cura aliada alcança.** O `submerso` bloqueia todos porque é PRISÃO (não
  distingue quem se aproxima); a Inalvejável é EVASÃO (contra quem te caça). Confirmação estrutural: ela é BUFF auto-
  aplicado — se bloqueasse cura aliada, puniria o próprio dono, e buff que atrapalha o dono não é buff.
- **(b) CORRIGIDA (a matriz revelou uma tensão).** "Dispel remove a evasão" continua verdade — é buff defensivo, simetria
  com `reducao`/`escudo`. MAS a matriz mostrou que um dispel de **alvo único** não consegue SELECIONAR o inalvejável para
  limpá-lo (a mesma trava de mira). **Regra (iii): dispel de alvo único NÃO alcança a Inalvejável;** consequência (i): ela
  só é removível por AoE-dispel ou por um atacante que ignora-Inalvejável. Recusada a (ii) (dar furo-de-mira ao dispel) —
  acoplaria as camadas que a tese inteira existe para separar; uma exceção ali e "Inalvejável só na seleção" morre no
  primeiro caso especial. Não é bug: é a mesma trava operando consistente — **quem evade a mira evade TODA mira, inclusive
  a benéfica-para-o-inimigo.** E a SIMETRIA com (a): cura ALIADA alcança porque o ramo aliado não filtra; dispel INIMIGO
  não alcança porque o ramo inimigo filtra. As duas caem do MESMO lugar (`alvosValidos`), sem regra especial — sinal de
  que a camada está no lugar certo.
- **(c) ignora-Inalvejável em DOIS pontos** (passiva PERMANENTE — Hou Yi, Boitatá-time; flag de habilidade PONTUAL —
  Odin, Hórus no básico). Espelha o `danoIrredutivel` (que é passiva). Forçar um só ponto faria uma das duas mentir.

**A LIÇÃO DE MÉTODO (o dono):** as duas descobertas que derrubaram o custo (o `submerso` já é metade da Inalvejável; o
"só vs alvo único" cai de graça) vieram de OLHAR O MOTOR, não o rótulo — a mesma rede do §83 (a auditoria, não a segunda
leitura da prosa).

**A INVARIANTE que sai da matriz (detalhada no desenho da matriz, aprovação pendente):** a Inalvejável mora SÓ na SELEÇÃO
(`alvosValidos`), NUNCA no IMPACTO (`bater`). Redirect e intercepta operam ABAIXO da seleção (reatribuem a vítima dentro
do `bater`, sem reconsultar a lista), então o golpe ATINGE um sink inalvejável e um interceptador inalvejável se oferece
e recebe. "Protege da seleção, não do impacto."

**CONSTRUÍDO (infra, testada em sintético — sem consumidor ainda, como a marca do §83).** Status `inalvejavel` em BUFFS;
exclusão em `alvosValidos` (só ramo inimigo, só alvo único); gatilho `ignoraInalvejavel` (passiva self/time) + flag de
habilidade homônima (os DOIS pontos da decisão c); helper `temIgnoraInalvejavel`. A matriz virou 4 blocos de teste em
`primitivas.test.js` (12/12a-d), incluindo o **teste da invariante** (redirect-para-sink-inalvejável ATINGE) e a **guarda
estrutural** (lê o corpo de `bater()` e falha se `inalvejavel` aparecer lá — o conserto "defensivo" que apodrece calado).

**OS DOIS RISCOS confirmados-falhando-e-corrigidos NA MESMA SESSÃO (o dono exigiu antes, não depois):**
- **(b) A IA não mirava de `alvosValidos`** — construía alvos de `units.filter(vivo)` cru. Para `submerso` a rede era o
  zera-dano (a IA descartava o lance de ganho-zero); a Inalvejável NÃO tem rede (invariante), então a IA a ignoraria por
  completo. Corrigido: `iaCandidatos` agora tira inimigos de `alvosValidos`.
- **(a) `acoesDe` não barrava habilidade sem alvo** — corrigido com o motivo `sem_alvo` (só quando `passos.length>0` e
  `alvosValidos` vazio; a AoE, `passos` vazio, não é barrada). Fecha o estado "time inteiro Inalvejável".

**ignora-Invulnerabilidade ADIADO (com correção de forma — §46 outra vez).** No desenho eu disse "estende o
`danoIrredutivel`" (passiva). ERRADO: os usuários reais são de HABILIDADE (Odin no básico, Shiva no milagre), não passiva.
A forma certa é uma flag/rider de habilidade na camada de dano (pular o `return 0` da linha do `invulneravel`), não o
gatilho passivo. Como não há consumidor agora (Odin travado por outras deps, Shiva não construído), ADIEI — construir a
forma sem o consumidor que a valida é como o buraco que o §83 pegou. Entra com o Odin/Shiva.

---

## §83 — MARCA OFENSIVA: rótulo puro, vocabulário COMPARTILHADO; e a fronteira limpa com a execução diferida

**O que se construiu (F1.9-pre, aprovado pelo dono após o desenho da fronteira).** A infra da MARCA OFENSIVA — os
rótulos `olho/livro/pressagio/marcado` no `MARCAS`, a condição `alvoMarca` (saiu de `pendente`), e o ramo em `condOK`
espelhando `alvoDebuff`. ~9 linhas de motor; o resto é composição no dado. IMPL não anda (nenhum deus novo ainda).

**As três decisões do desenho (o dono):**

- **(a) A marca é RÓTULO PURO — o +dano é IRMÃO, não intrínseco.** Uma marca não carrega `v`. Hórus aplica DOIS efeitos
  irmãos: `{type:'olho'}` (rótulo) + `{type:'vulneravel',v:8}` (o +dano all-source, que JÁ existia, §Durga). O motivo
  é o que o desenho provou: se a marca ganhar `v`, ela deixa de ser rótulo e a resposta à pergunta "rótulo ou efeito?"
  se inverte. Reusar `vulneravel` mantém a fronteira. (Os outros leitores — Odin `+6`, Morrigan `+25` — são
  `bonusDano quando:{alvoMarca}` com o `v` no LEITOR, não na marca.)

- **(b) Dano condicional de habilidade = DOIS FX COM CONDIÇÃO, não `quando` no `dmg`.** "45 puro se tem Olho, senão 32"
  são dois efeitos ALTERNATIVOS, não um efeito com modificador. O `dmg` já tem `seCond/execIf/soSe/porContador/
  porStatus/porHpFaltante`; somar `quando` faria dele o fx mais sobrecarregado do motor — é onde a próxima ambiguidade
  moraria. Dois fx expõem a alternância; um fx com modificador a esconde. (Máquina p/ o guard-por-alvo + negação nos dois
  fx ainda não existe — chega com o Hórus.)

- **(c) MARCA SOZINHA primeiro.** Serve os leitores de imediato; é a peça que NÃO sabe de execução. Uma peça por vez foi
  o que fez as últimas dez levas saírem sem surpresa.

**A DECISÃO QUE VAI PARECER BUG (o dono mandou registrar):** marca é **vocabulário COMPARTILHADO, não propriedade privada
de cada deus.** `alvoMarca:'qualquer'` casa TODAS as marcas — então o `+8` do Hórus atinge quem o Odin marcou. É coerente
com a prosa ("contra marcados OU com o Olho": o OR existe justamente porque são conjuntos diferentes e ele quer os dois).
**Quem pune marca pune QUALQUER marca.** Quem olhar `condOK` depois e achar que é vazamento: não é — é o guarda-chuva.
E §54: as marcas são etiquetas DISTINTAS (o milagre do Hórus lê `olho` específico; o do Yan Wong só acelera `inscritos`),
com o guarda-chuva por cima — igual ao `alvoDebuff:{sub:[...DEBUFFS,'qualquer','controle']}`.

**A FRONTEIRA com a execução diferida (o desenho aceito):** são DOIS mecanismos independentes com uma junta limpa
(status + `condOK`), e **metade da execução diferida já está feita.** O gatilho da morte difere:
- **Yan Wong (`livro`)**: a MARCA EXPIRANDO mata — `fimTurno` já mata quem tem `livro` com `dur===1`. A execução é
  CARGA da marca (timer intrínseco). **Já construído.**
- **Morrigan (`pressagio`)**: um gatilho SEPARADO de fim-de-turno lê a marca como PORTA — se `hp ≤ limiar` no fim do
  turno, executa; se o HP nunca cai, a marca expira inócua. A execução é CONSUMIDORA da marca. **Novo** (~7 linhas), e é
  um `executaAbaixoDe` deslocado no tempo (o primitivo instantâneo já existe, F1.3).

**§59 à espreita — GATILHO DE REVISÃO REGISTRADO:** NÃO fundir os dois tempos de execução (timer vs limiar-em-janela) num
"rider letal genérico". Dois casos com condicionais diferentes não justificam a abstração; o `livro` fica como está e o
`pressagio` entra como segundo leitor pequeno. **Se um TERCEIRO deus de execução diferida aparecer, aí sim se reavalia.**
(O §59 nasceu de duas ferramentas com escopo mal separado — a lição é não abstrair cedo demais.)

**A AUTO-CORREÇÃO DO DESENHO (§82 na prática).** Meu desenho vendeu Odin e Hórus como "quase de graça, composição de
primitivos". A auditoria do motor derrubou isso: os DOIS básicos dependem de **Inalvejável** — um status que NÃO existe
(é a F1.9, que o dono sequenciou para DEPOIS) e que 12 kits citam. Além disso Odin arrasta `ignora-Invulnerabilidade`,
`cdReset` e `abertura-por-contagem-de-facção`; o milagre do Hórus precisa da máquina da decisão (b). A marca (leitor) é
real e testada; os DEUS-CONSUMIDORES estão TODOS enredados (Odin/Hórus → F1.9; Yan Wong/Morrigan → execução diferida).
Registrado ANTES de escrever os kits, para o dono re-escolher o escopo — não depois.

**A LIÇÃO DE REVISÃO (o dono a fez explícita):** o desenho que vendeu "quase de graça" passou pela revisão do DONO e
NENHUM dos dois viu o buraco da Inalvejável. **O rótulo (§46) engana quem ESCREVE e quem APROVA** — a revisão humana não
é rede contra ele, porque o revisor lê o mesmo rótulo. A rede foi a AUDITORIA DO MOTOR (ir ver o que `MARCAS`, `condOK`,
`IGNORAVEIS` de fato têm), não uma segunda leitura da prosa. Corolário prático: antes de aprovar um desenho que diz
"reusa o que já existe", conferir contra o motor QUE existe — não contra a lembrança do que existe.

---

## §82 — RELATO DE PROCESSO TAMBÉM PRECISA DE VERIFICAÇÃO (não só o código)

**A lição (o dono, sobre a auto-correção do §38 corolário 2).** Eu ESCREVI no registro que tinha commitado Aquiles+Perseu
quebrados no origin. Fui conferir com `git show` — e era FALSO: o Perseu estava limpo, passou no CI, e nenhum commit do
Aquiles existia. Reescrevi o registro para MENOS grave. **Isso é mais difícil que reportar uma falha, porque não há
pressão externa para fazê-lo** — ninguém cobra a correção de um relato inflado; a falha já estava "admitida". Mas um
registro inflado envenena a decisão futura tanto quanto um omitido: o próximo que ler o §38 vai calibrar o medo do
`| head` por um estrago que não houve, ou desconfiar de um mecanismo (o build no `&&`) que na verdade salvou.

**A regra, gêmea do §80 (a captura é árbitro) mas aplicada ao TEXTO, não ao pixel:** o código passa por teste; a
CAPTURA passa pelo olho; **o RELATO DE PROCESSO precisa passar pela FONTE PRIMÁRIA — `git show`/`git log`, não a
memória.** Antes de registrar "commitei X", "quebrou no origin", "o container reverteu Y", conferir contra o git. A
memória do que eu fiz é tão teto quanto a reconciliação (§61): erra, e aqui erra tanto para "mais grave" quanto para
"menos grave". Faithful reporting vale para o diário de bordo, não só para o placar. **Verificar o próprio relato é
parte de escrevê-lo.**

---

## §81 — A heurística do milagre virou REGULARIDADE (3/3 levas); e a varredura antirevive achou 7, não 2

**A TAXA DO §78, MEDIDA em três levas (o dono: já é regularidade, não observação).** Em todas as três últimas levas o
MILAGRE previu o bloqueio e a passiva quase nunca previu nada:
- **§77 (F1.8 VERMELHO-pequenos):** 14 deuses — passivas/alvo-único destravados, o gancho no milagre.
- **§79 (porStatus):** 6 deuses — o milagre carregava o `porStatus` que faltava.
- **§80/F1.8 (esta leva):** 12 deuses — **10 de 12 com o milagre limpo**; o gancho mora na passiva (só morrigan foge,
  com marca no milagre).
Fica travado como **HEURÍSTICA con taxa 3/3**: ao reconciliar, olhar o MILAGRE primeiro não é preferência — prevê o
bloqueio em quase todo caso, e "passiva limpa" não é evidência de nada (§78). A causa é estrutural (§78): o milagre é a
habilidade cara, onde o designer põe o mecanismo que justifica custo+recarga.

**A VARREDURA ANTIREVIVE (o dono mandou desconfiar do balde) — achou 7, não 2, e NÃO cabem num só.** O balde-antirevive
parecia agrupar 2 (cerberus + ahpuch); a varredura da família no catálogo achou **7** sujeitos, em **5 condições-de-gatilho
distintas**:
| deus | condição | mecanismo |
|---|---|---|
| hel | Marca da Morte (debuff aplicado) | **já existe** (`antiRevive`, Iansã) |
| ahpuch | tem Podridão (contador) | **A: por-contador** |
| anubis | tem Atadura (contador) | **A: por-contador** |
| cerberus | enquanto o DONO vive | **B: aura (checada no revive)** |
| ammit | morto POR Ammit (matador) | C — fora |
| yanwong | morto sob o Livro (debuff carregado) | ~D (perto do `naoRevive`-em-debuff) — fora |
| mimir | ELE PRÓPRIO não revive | E (self) — fora |
**Não unificam** — a condição varia (contador-da-vítima ≠ dono-vivo ≠ matador ≠ debuff ≠ self). Mas **A agrupa DOIS**
(ahpuch + anubis) e **B serve cerberus**. Regra do dono aplicada: fiz A+B (o que os dois da leva pedem; A ainda destrava
a cláusula do anubis de brinde), e **ficam de fora ammit/yanwong/mimir** (condições próprias) e hel (já resolvido). O
balde que parecia 1 mecanismo era 5 — a desconfiança do dono estava certa.

---

## §80 — A CAPTURA É ÁRBITRO: a verificação visual acha o que teste e revisão não acham; a métrica sozinha superestima

**(A) O BUG DA DEFESA — só a TELA pegou.** Os discos DEF pediam `skill-<deus>-defesa.webp` (uma por deus), mas a arte é
COMPARTILHADA (`skill-defesa.webp`). O prompt foi escrito sem lembrar disso; `npm test` passou (a lógica não sabe de
arquivo); a revisão do código não pegou (a chave `skill-<deus>-<slot>` "bate o nome do arquivo" — verdade para 400, não
para a Defesa). **Só a captura de tela mostrou os discos DEF caídos no monograma.** Fica no registro dos casos em que a
verificação VISUAL acha o que teste e revisão não acham: quando o defeito é um asset ausente / um caminho que resolve em
404, nenhuma asserção lógica o sente — a tela é o único oráculo. Regra: **toda mudança que liga arte/asset se verifica
renderizando, não só com teste verde.**

**(B) MÉTRICA DE CONTRASTE SOZINHA SUPERESTIMA FALHA — a montagem é o árbitro.** Medi o contraste anel↔arte (WCAG,
luminância) e a métrica crua deu **79/400** "anéis sumindo". Renderizei a montagem e vi o erro: **anel roxo (Umbra) sobre
arte roxa-escura pontua baixo em luminância mas continua visível** — a diferença é de MATIZ, que a luminância não captura.
Refiltrei para o caso que o olho confirma E que o conserto (contorno escuro) resolve — **borda CLARA** — e caiu para
**45**. Distinguir "baixa luminância" de "invisível" exigiu OLHAR, não medir. Fica a regra, gêmea de (A): **a métrica
PROPÕE (rankeia, prioriza, dá o número bruto); a montagem DISPÕE (decide o que é falha real). Nunca reportar um número de
falha visual sem a montagem que o arbitra** — foi a métrica que quase me fez consertar 34 discos que não precisavam.

**O CONSERTO (contorno §5), pelas três regras do dono:** por FORA (não come 1px de arte × 401), UNIFORME (não detecta
arte clara — comportamento por-asset é imprevisível e intestável), e a montagem before/after dos 45 provou que resolve os
casos, não só muda o número. O halo dourado do Milagre (tier) sobrevive via `outline-offset` (contorno fora do halo).

---

## §79 — porStatus: UM source parametrizado (não quatro), e a heurística do milagre deu o número real (3, não 5)

**A VARREDURA DA FAMÍLIA (pedida pelo dono antes de construir) — é UM source, não quatro.** "Por contagem de status"
aparecia com quatro rótulos na fila (debuff, buff, regeneração, aliado-a-menos). Varrendo os 100: **três deles
(debuff/buff/regen) são o MESMO contador** — como efeito deduplica por unidade, "contar efeitos da categoria X no escopo
Y" cobre tanto "por debuff NELE" (onde:alvo) quanto "por inimigo Encharcado" (onde:timeInimigo, categoria:encharcado). É
um `porStatus: {v, categoria, onde, passo}` só. **O quarto (aliado-a-menos, susanoo + guanyu) NÃO é status — é
tamanho-de-lado**, vizinho do `porAliadoCaido` que já existe; ficou de fora. E entrou no `escalaContagem` como **uma
chave a mais** — o caminho único do §73 intacto, sem segundo jeito de escalar (a garantia que o dono pediu no wrapper).

**A HEURÍSTICA DO MILAGRE (§78) deu o número REAL antes de escrever: 3, não ~5.** Seis deuses referenciam o source.
Olhando o MILAGRE de cada um primeiro: limpo em **erinias** (por debuff, alvo), **aokuang** (por Encharcado, timeInimigo),
**jörmungandr** (por envenenado, timeInimigo) → escritos, IMPL 47→50. Nos outros três o milagre tem um SEGUNDO buraco além
do por-status: **hel** (cura-por-alvo), **ammit** (execIf-multi-condição + matador-veta-revive), **cernunnos**
(Fera-atacante que cura o dono / auto-renasce). O source é necessário mas não suficiente p/ eles — esperam o 2º gancho.
A heurística do milagre pagou: previu "3 cheios" e a escrita confirmou 3, sem retrabalho.

**AUDITOR — não fica cego à escala nova (§66 aplicado proativamente).** porStatus é bump condicional como o seCond, então
entra no teto do auditor (potencial ~`v×3`, time cheio). Julgamento das Fúrias (25+10/debuff = 55) e Veneno do Ragnarök
(16+8/envenenado = 40) passam a ser FLAGRADOS e catalogados no allowlist — não aprovados em silêncio. Foi de propósito
antes de o auditor ter chance de errar: widening retroativo (§66) é dívida, widening junto com o source é limpo.

---

## §78 — A HEURÍSTICA DO MILAGRE (o gancho mora no milagre) e a auto-correção medida contra mim mesmo

**A AUTO-CORREÇÃO, sem suavizar (o dono pediu assim).** Na varredura (§77) prometi erinias/nuwa/cernunnos/ammit como
"verdes de graça". Duas horas depois, traduzindo, **0 de 14 saíram limpos** — a minha própria promessa falhou na
medição. Não foi a triagem antiga que errou: fui EU, nesta sessão, com o motor de hoje na mão. É o §61 medido no menor
intervalo possível — reconciliação→tradução em 2h — e contra o próprio autor. Fica registrado como FALHA da promessa,
não como "a reconciliação é um teto" abstrato: **quem reconcilia herda o viés, inclusive quem já sabe do viés.**

**A HEURÍSTICA DO MILAGRE (do dono — vale mais que o número).** O padrão dos 14 foi limpo e único: **a leva destravou as
PASSIVAS e os alvos-únicos; os MILAGRES não.** O gancho que falta mora quase sempre no milagre. E isso é REGULARIDADE
ESTRUTURAL, não coincidência: **o milagre é onde os kits concentram a mecânica cara — é a habilidade de maior custo e
maior recarga, então é onde o designer põe o efeito que justifica os dois.** Vira heurística de triagem:
> **Ao reconciliar, olhe o MILAGRE primeiro. Se ele estiver limpo, o deus provavelmente está. Se só a passiva estiver
> limpa, isso não diz quase nada.**

**E ISSO EXPLICA POR QUE A RECONCILIAÇÃO ERRA SISTEMATICAMENTE PARA CIMA (o mecanismo do viés, não só a taxa).** A
reconciliação lê a lista de mecanismos do deus e procura casar cada um com o motor. Ela ACHA os das passivas — porque a
leva mais recente acabou de abri-los — e não sente o buraco do milagre, que é o mais caro e o menos coberto. O viés não
é aleatório: é a passiva (barata, recém-coberta) ofuscando o milagre (caro, descoberto). Ler o milagre primeiro ataca a
causa, não o sintoma.

---

## §77 — RÓTULO CRAVADO ENVELHECE MAL (nos DOIS sentidos); a F1.8 mediu o 80% na VERMELHO — 0 puro-motor-zero

**A LIÇÃO (do dono, generalizando o §76).** Um rótulo de triagem cravado ANTES de uma onda de ganchos envelhece mal —
e nos DOIS sentidos. O AMARELO cravado antes de aoCair-aliado/vulneravel/viaRegen escondeu verdes; o VERMELHO cravado
antes deles escondeu pequenos. **Consequência prática, que vira regra de processo: toda vez que a gente fecha um BLOCO
de ganchos, a fila INTEIRA precisa ser reconciliada de novo — não só a parte que parecia perto.** O rótulo não é um fato
sobre o deus; é uma foto do motor no dia em que foi tirada, e o motor anda.

**A F1.8 MEDIU ISSO NA HORA (o degrau de 80% do §61, agora na VERMELHO — e mordeu a MINHA reconciliação desta sessão).**
Na varredura (§76-report) chamei erinias/nuwa/cernunnos/ammit de "verdes-escondidos de graça". Traduzindo os 14
VERMELHO-reconciliados-pequeno cláusula a cláusula contra o motor real: **0 são puro-motor-zero.** O padrão é limpo e
repetido: **as PASSIVAS e os alvos-únicos foram destravados pela leva (aoCair-aliado, vulneravel, viaRegen, execIf); os
MILAGRES não.** O milagre é onde mora o gancho que falta, quase sempre. Minha reconciliação (2h atrás) prometeu verde e
a tradução (mesma sessão) entregou hook — o §61 medido no menor intervalo possível.

**MAS O ERRO É ESTRUTURADO, não ruído — os bloqueios se AGRUPAM (o achado que salva a F1.8).** Traduzir não só derrubou
o "zero-motor"; mostrou que os ganchos que faltam são POUCOS e COMPARTILHADOS:
- **por-contagem-de-status** (`+N por debuff/buff/regeneração ativa`) — o maior: trava erinias, hel, ammit, cernunnos
  (+ a variante "por aliado a menos" do susanoo). **UM source de escala novo (irmão dos do §73) destrava ~5 milagres.**
- **multi-golpe distribuído** (`N golpes de M, o jogador reparte`) — trava babi, susanoo, houyi (3).
- singletons: cura-por-alvo (hel), opcoes-contar-2 (nuwa), recarga-override (change/lugh), killer-zera-cd (ares),
  invocação-atacante-variante (cernunnos: cura-o-dono/auto-renasce), reflete (mnevis), aoUsarMilagre (shiva),
  anula-controle-1× (khonshu), condição-comparativa (anubis "mais debuffs que buffs"), execIf-multi-condição (ammit).

**Releitura da F1.8:** ela NÃO é "escrever verdes de graça" — isso era o teto da reconciliação. É **"abrir 2 ganchos
compartilhados (por-contagem-de-status + multi-golpe-distribuído) e ~7 milagres caem"**. Continua barato e de alta
alavanca (como o nega-orbe foi), só não é zero-motor. A escada do §61 de novo: a reconciliação disse "de graça", a
tradução disse "2 ganchos pequenos" — os dois certos sobre o TAMANHO, discordam só sobre o "motor zero".

**O SEQUENCIAMENTO DA FASE (do dono), registrado:**
- **F1.7 — ARTE DAS HABILIDADES (primeiro).** As 401 imagens existem, nomeadas no padrão, encaixes esperando. Estava na
  F4 porque no dia do roteiro era produção futura; hoje é pasta pronta — manter na F4 seria seguir um plano que descreve
  um mundo que mudou (o erro que a varredura corrige). Risco que quer ser descoberto cedo: a arte do Itzamná é creme+dourada
  e o anel do elemento quase some; se repetir em 10 das 401, melhor saber com 47 escritos que com 100 (corrige-se o anel
  1× ou as artes 10×). **NÃO começar ainda — as imagens entram pelo lado do dono (anexo não chega ao disco, foi o que
  travou o teste do Itzamná); o dono avisa quando estiverem no repo.**
- **F1.8** — os verdes-escondidos → RELIDA acima (2 ganchos compartilhados, não zero-motor).
- **F1.9 — INALVEJÁVEL** — o maior desbloqueio: trava 5 (loki, tanuki, sunwukong, saci, boto) e está INERTE.
- **F1.10** — os 4 pequenos + os 9 AMARELO-real.
- **F1.11** — os baldes menores (marca/Olho, seletor).
- **F1.12+** — os ~6 estruturais, um desenho por vez, no formato do dominado (mimir aura-pós-morte, yanwong
  morte-por-contagem, krishna rastreio-de-dano, exu+dagda iniciativa, loki transferência-em-massa).

---

## §76 — HUANG DI: o "cluster" médio já existia (o viés do rótulo corta TAMANHO, não só prontidão)

**A VARREDURA RESPONDEU MELHOR QUE A PERGUNTA.** A pergunta do dono antes de construir: *quantos deuses pedem
cdShift-cluster além do huangdi?* — se 2-3, é infra e vale; se só ele, é médio-single e espera. A varredura dos 100
achou: **o "cluster" (mexer no time inteiro de uma vez) JÁ EXISTE** — é o ramo escopo-de-lado do cdShift, *legado*,
**vivo em fujin (hab: +1 no time inimigo; milagre: −1 no próprio) e ganesha (−1 no próprio).** E **dois terços do Huang
Di eram escrevíveis desde sempre**: a habilidade ("todas as recargas do time") é o escopo-de-lado que já roda; o milagre
("2 aliados") é um fix de 2 linhas no mirado (varrer `alvos`, não só `alvos[0]`). **Só a passiva era nova** — "a recarga
mais longa DO TIME", o único agregado-de-recarga-do-time em todo o catálogo (0 outros deuses o pedem).

**O ACHADO — o viés do rótulo corta nas DUAS direções (o dono).** Até aqui a tradução desinflava o teto de PRONTIDÃO:
a triagem prometia VERDE e a obra entregava HOOK (o flip §46, os 5 verdes §70, a leva §75 — sempre "mais fácil do que
é"). Aqui a tradução desinflou o teto de TAMANHO na direção oposta: o §74 rotulou "MÉDIO" (por reconciliação, pelo nome
"cdShift-cluster") e a obra entregou **~10 linhas**. **Fica a regra: "grande demais para agora" merece a MESMA
desconfiança que "pronto para escrever". O rótulo mente para os dois lados — o de prontidão erra para o verde, o de
tamanho pode errar para o grande. Só a tradução mede.** (A régra "médio-single espera" continua válida — mas ela vale
para tamanho-dominado; um rótulo "médio" não é evidência de que É médio.)

**AS QUATRO DECISÕES (do dono), travadas:**
1. **Construir** — sim: não é médio, é pequeno, e 2/3 já eram de graça.
2. **Desempate DETERMINÍSTICO** (o mais sério — quebra replay/cadeia em silêncio se falhar): a maior recarga do time,
   empate resolvido por **menor índice de unidade, depois ordem de slot (basico→hab→milagre)**. Iterar nessa ordem
   trocando só em `>` estrito faz o 1º empatado vencer. **Provado em TESTE, não em comentário** (dois testes de empate:
   duas unidades mesma maior → menor índice cede; mesma unidade dois slots → habilidade antes de milagre).
3. **"do time" inclui o próprio Huang Di** — a prosa não o exclui; se quisesse, diria "de um aliado".
4. **Uma recarga por turno** (a prosa é singular) — e isso torna o efeito **auto-limitante**: com "a mais longa de cada
   unidade" a passiva viraria −3/turno no time. O singular é provavelmente de propósito.

**A DISTINÇÃO DO FX_TURNO — varrer-para-ESCOLHER ≠ varrer-para-ALVEJAR (registrar, o dono avisou).** O cdShift-team-longest
é o 1º fx de FX_TURNO que varre o time para decidir ONDE agir. Parece furar a garantia do FX_TURNO ("sem alvo escolhido
pelo jogador"), mas NÃO fura: ele varre para **escolher** o alvo internamente (determinístico), e o alvo continua sendo o
**próprio lado**; o jogador não escolhe nada. A garantia era sobre *escolha do jogador*, e essa fica intacta. **Fica a
distinção para o próximo caso, que vai parecer igual e pode não ser: um fx-turno pode LER o campo para se auto-direcionar,
desde que (a) a leitura seja determinística e (b) o alvo não venha do jogador. Se o alvo viesse de uma escolha, aí sim
furaria.** O validador reforça: cdShift no faz SÓ na forma soMaiorDoTime — `unidade`/`lado:inimigo` (que exigiriam
escolha/alvo inimigo) são barradas.

**DEUS-OU-NADA (corolário §73/§74).** Não escrevi as duas cláusulas fáceis (hab+milagre) deixando a passiva órfã — uma
passiva declarada-sem-fio é exatamente o órfão da família §73. Huang Di entrou inteiro (IMPL 46→47) ou não entraria.

---

## §75 — A LEVA DOS 8 CONSTRUÍDA (sozinho): a tradução do §74 valeu EXATO, 0 surpresa em obra (IMPL 37→46)

**O RESULTADO.** Os 8 da leva foram construídos, um commit por gancho, cada um `>>> TUDO OK` + `CADEIA OK` +
`AUDITORIA OK` + CI verde: **boitata** (0 gancho, 6º verde-escondido) → **hades+heimdall** (nega-orbe) → **iara**
(execIf) → **atena** (contraClasse) → **durga** (vulneravel) → **khnum** (aoCair-aliado) → **poseidon** (protegido) →
**chaac** (viaRegen + soSe). **IMPL 37→46. FUNCIONAL 45** (só afrodite/dominado segue órfã). huangdi ficou de fora.

**A LIÇÃO CENTRAL — a tradução-antes-de-construir (§73/§74) fechou com 0 erro.** A tabela do §74 previu o gancho de
cada um dos 8; em obra, **nenhum precisou de correção de rota, nenhum revelou um segundo buraco escondido, nenhum
travou.** É o contraste direto com a reconciliação (§61: ~80%, erra p/ cima): a reconciliação prometeu verde e entregou
hook 5 vezes (§70); a **tradução** prometeu 8 hooks-pequenos e entregou 8 hooks-pequenos.

**O EXPERIMENTO INVERTIDO — a EVIDÊNCIA POSITIVA do método (o achado da sessão, apontado pelo dono).** Até aqui o §61
só tinha provas NEGATIVAS: toda vez que se previa sobre a triagem, errava-se para cima (o flip §46, os 5 verdes §70, o
balde §72). Provar um método por ele falhar de novo é fraco. Esta sessão prova pelo AVESSO: **inverteu-se a ordem —
traduziu-se ANTES de prometer — e o erro sumiu (8 previstos, 8 entregues, 0 surpresa).** É a primeira vez que o §61 é
confirmado por ACERTO, não por erro repetido. Fica registrado como a evidência positiva: *a tradução não é só o degrau
que corrige os outros; quando ela vem primeiro, não há o que corrigir. Traduzir-antes é o método; reconciliar-antes é o
atalho que mente para cima.*

**OS 8 GANCHOS ABERTOS (todos pequenos, regra 3 do dono respeitada):**
- **roubaOrbe + protegeOrbe** (nega-orbe) — remove/rouba do maior pool inimigo; protegeOrbe barra. Serve hades+heimdall+fila.
- **execIf** (dmg) — filtro de status na execução (`executaAbaixoDe` + `execIf:{quando}`). Iara elimina só Encharcados.
- **contraClasse** (efeito contraAtaca) — revida SÓ a classe casada. Atena/Égide: só Físico. Prosa segue o idioma do
  corpo ("contra-ataca por N", NÃO "sofre N de dano" — que não dava exclude seguro: colide com a marca real da Iemanjá).
- **vulneravel** (debuff) — "recebe +N de dano", modificador de ENTRADA (simétrico ao dmgUp de SAÍDA; empilha, cleansável).
  O motor **já previa** a vulnerabilidade (MARCAS/alvoMarca pendentes; Cuca adormecido+8 hardcoded) — Durga é o 1º
  portador declarativo; migrar a Cuca é futuro.
- **aoCair quem:'aliado'** (gatilho) — reator do MESMO lado do caído reage. **DOIS caminhos de queda** (a prosa "o Shabti
  OU um aliado" nomeia os dois porque são mecanicamente distintos): unidade real via `matar`, invocação-guarda via `bater`
  (só morte por DANO — expiração e limparInvocacoes NÃO disparam). Khnum estreia a invocação-guarda em data/deuses.
- **reducao `protegido`** (eixo) — contraparte do `contra`: `contra` lê o GOLPE que chega, `protegido` lê o BENEFICIÁRIO.
  Poseidon protege o time mas só os aliados Maré recebem a redução.
- **bonusCura `viaRegen`** (condição quandoCura) — lê a ORIGEM da cura (tick de regen via `via` encadeado
  curar→bonusCuraDeclarativo→condCuraOK), não a magnitude. Chaac: "regenerações curam +4"; cura direta não recebe.
- **apply `soSe`** (fx apply) — filtrado por status do alvo (mesma gramática do condOK). Chaac atordoa só os Encharcados
  de uma área. **Serve aokuang** (fecha o 2º buraco dele — sobra a fonte contagem-status).

**chaac foi o único duplo-travado** (2 ganchos), como o §74 previu. O único refino que a tradução one-line não pegou (e
que só apareceu ao construir) foi o **2º caminho de queda do Khnum** (invocação-guarda ≠ unidade) — mas pequeno o
bastante para ficar na leva, não virar decisão.

**O PADRÃO DO KHNUM — o §46 na CONJUNÇÃO (ordem do dono: some ao §46).** O §46 diz que um NOME de prosa não é evidência
sobre a natureza — a armadilha morava no SUBSTANTIVO (um nome agregando mecânicas distintas). Khnum mostra a mesma
armadilha na CONJUNÇÃO: **"o Shabti OU um aliado" não era um sinônimo com dois rótulos — eram dois MECANISMOS de morte
distintos** (unidade real via `matar`; invocação-guarda via `bater`, que nem passa por `matar`). Fica a regra, mesma
família do §46: **um "OU" na prosa costuma nomear dois mecanismos, não duas palavras para um. Varra os dois lados da
conjunção como mecânicas separadas antes de traduzir — como se varre um substantivo-agregador.**

**Órfão? Não.** Todos os 8 passam validarDeus+smoke E têm o fio (enforce/leitor) do §74. FUNCIONAL subiu junto com IMPL
(37→46 vs 36→45), a distância órfã ficou constante em 1 (afrodite).

**PENDENTE — huangdi.** Fora da leva por ser o único **médio-single** (cdShift-cluster: cdShift em FX_TURNO +
"recarga mais longa DO TIME" = max-across-team + mirado-multi). Aguarda a decisão de DESENHO do dono, como o dominado e
a afrodite. **A leva acabou; trago o huangdi para desenho quando o dono quiser.**

---

## 1. O jogo é gacha, mas o PvP é normalizado

**Decidido:** invocação e Provações dão acesso a deuses. Nenhum sistema de
progressão entra no PvP. Vida 120 para todos, dano em número inteiro fixo.

**Recusado:** o modelo original — nível 1–70, estrela 3★–6★, relíquias com 6
slots, Link Divino com 40 slots, nível de habilidade 1→4.

**Por quê:** eram cinco eixos multiplicativos de poder. Um Zeus 6★ Lv70 com
relíquias contra um Zeus 4★ Lv40 não é partida, é execução. E o roster tinha
5★ com 1180 de vida contra 3★ com 850 — 40% de diferença bruta.

O que sustenta o gacha sem vender poder: **pick/ban gera pressão de coleção
real**. Com 6 deuses bons você fica sem plano B quando os seus são banidos.
Vende-se amplitude, não força. Mais cosméticos (10 mitologias) e o PvE, onde a
fantasia de poder é legítima porque o oponente é a CPU.

---

## 2. Cópias repetidas do gacha não sobem habilidade

**Decidido:** cópia vira moeda de loja (fragmento dirigido, pular Provação,
cosmético).

**Recusado:** cópias subindo o nível da habilidade, como no modelo original.

**Por quê:** dois motivos, e o segundo é o que importa. Primeiro, num jogo de 100
de vida, um Julgamento do Trovão de 25 contra um de 32 decide a partida. Segundo
e mais fundo: em Naruto-Arena **o valor exato de cada habilidade é conhecimento
público compartilhado**, e é isso que permite ler o oponente — "ele está com 22,
o Fenrir dele executa em 20, preciso curar 3". Se o número varia por conta, essa
camada inteira do jogo desaparece e sobra comparação de coleção.

---

## 3. Desbloqueio por Provação, nunca por ranking

**Decidido:** cada deus não-inicial tem uma Provação — um puzzle de estado fixo,
com o deus emprestado e time emprestado, sempre disponível a qualquer jogador.

**Recusado:** liberar missões conforme o rank do jogador (proposta inicial).

**Por quê:** rank mede vitória. Trancar ferramenta atrás de rank nega counters
justamente a quem está perdendo, e dá mais ferramentas a quem já ganha. O jogador
travado no Bronze não fica lá por falta de habilidade — fica por falta de
counters, e nunca sai, porque a porta de saída exige passar pela porta. É o mesmo
defeito do unlock original do Naruto-Arena com outra roupa.

A Provação resolve sem esse custo: não é farmável (puzzle resolvido é resolvido),
ensina o kit (quem desbloqueia Anúbis já sabe pilotar Anúbis), é difícil sem ser
competitivo (ninguém está te negando a vitória), e é barata de produzir (um puzzle
é um estado serializado). Portão de abertura é **capítulo de campanha**, que é
progresso de tempo, não de skill relativo.

Distribuição: 24 Ritos, 49 Provações, 18 Ordálias. 9 iniciais + 24 Ritos = 33
deuses (33%) alcançáveis só por habilidade. As Ordálias, com requisito de posse,
são o que mantém o gacha relevante — e ainda assim ninguém fica permanentemente
trancado fora de um counter.

---

## 4. Nove iniciais, um de cada panteão

**Decidido:** Zeus, Ogum, Tyr, Sobek, Brigid, Ganesha, Cuca, Fujin, Nezha.

**Por quê nove:** com 3 unidades por time, 9 dão 84 formações — o iniciante
experimenta de verdade. E são só 9% do roster, então invocar continua valendo.

**O critério que mais pesou não foi diversidade, foi ter toda resposta essencial:**

- **Ogum** — contra tanque (perfurante, destrói escudo, dano puro). Todo jogador
  novo trava na primeira parede de escudo; sem essa ferramenta ele conclui que o
  jogo é pay-to-win, e estaria certo.
- **Tyr e Ganesha** — contra prisão de controle. A experiência mais frustrante
  possível para quem tem menos opções.
- **Cuca e Fujin** — ensinam a lição central: privar recurso ganha mais que dano.
- **Nezha** — o único Híbrido. Sem ele o time inicial inteiro morre para controle
  e redução seletivos de classe.

Os 6 elementos estão cobertos, porque custo de habilidade é em energia do
elemento do deus — faltar um tipo tornaria parte do roster impagável.

---

## 5. Defesa universal com os números do Naruto-Arena

**Decidido:** toda unidade tem uma 5ª opção: 1 energia livre, recarga 4,
Invulnerável por 1 turno, gasta a ação.

**Por quê:** sem ela, unidade sem energia e com recarga travada só tem o Básico
fraco — não há decisão. Com ela, "não tenho jogada boa" vira "eu me protejo e
reconstruo economia". E cria o jogo mental sobre comprometer um Milagre num alvo
que pode ficar imune.

**Consequência que exigiu uma regra nova:** a rotação de Defesa (uma unidade
protegida por turno, sempre) anularia a ofensiva do jogo. Daí a decisão de que
**dano contínuo já aplicado atravessa Invulnerabilidade**. Isso dá duas respostas
em vez de uma — espalhar dano ou envenenar antes — e transforma Kagutsuchi,
Jörmungandr, Medusa, Piranha e Ah Puch de variações temáticas em nicho estrutural.

**Custo aceito:** os 8 especialistas em Inalvejável (Loki, Saci, Boto, Kitsune,
Yamato, Kukulkán, Tanuki, Wukong) perderam a exclusividade do eixo defensivo.
Aposta: o valor deles sempre foi o **rider** — Loki redireciona, Saci rouba buff,
Yamato converte o próximo golpe em dano puro. Se o playtest mostrar que ficaram
sem graça, a correção é dar duração 2 ao Inalvejável deles, não mexer na Defesa.

---

## 6. Conversão de energia a 3→1

**Decidido:** 3 quaisquer → 1 do tipo escolhido, uma vez por turno, sem gastar a
ação, pagando sempre exatamente 3.

**Recusado:** não ter conversão, e a taxa 2→1.

**Por quê:** sem conversão, o time mono-elemento é o mais forte do jogo (sorteio
previsível = combo confiável) e o time arco-íris vira armadilha. Isso mataria a
razão de colecionar deuses de elementos variados — o oposto do que um gacha
precisa. A 2→1 o custo é tão baixo que o elemento quase deixa de importar e a
identidade de composição desaparece. A 3→1 é caro o bastante para ser saída de
emergência, não engrenagem.

**Bug achado aqui:** se todos os seus orbes fossem do tipo escolhido, a rotina não
achava de onde tirar os 3 e creditava 1 de graça — energia infinita, todo turno.
A trava atual calcula o plano, confere que soma 3, e só então credita.

---

## 7. Seis elementos, mas um time gera no máximo três

**Decidido:** a interface mostra só os tipos alcançáveis pelo time.

**Por quê:** o sorteio só considera os elementos das unidades vivas, e as
habilidades custam o elemento do próprio deus ou energia livre — guardar tipo
alheio nunca serve. Três dos seis contadores ficariam em zero para sempre.
Isso não empobrece o jogo: **escolher quais 3 elementos levar É a decisão de
composição.**

---

## 8. Classe pertence à habilidade, não ao deus

**Decidido:** Físico, Mágico, Mental (controle), Aflição (DoT), por habilidade.

**Por quê:** era o modelo do Naruto-Arena e a diferença é grande. Com classe por
deus, o Julgamento do Trovão travava *tudo* que o alvo tinha de Mágico —
grosseiro. Com classe por habilidade, "trava as Mágicas dele" acerta parte do kit.

O resultado mais bonito: **Nezha tem Físico, Mental/Aflição e Mágico, então
nenhum silêncio de classe cala o kit dele** — que é exatamente a razão de ele ser
o Híbrido dos iniciais, e antes isso não funcionava de verdade. O Arsenal Celeste
dele troca de classe com o modo: Anel é Mental, Manto é Aflição.

---

## 9. Interface: três formas carregam três categorias

**Decidido:** retângulo = quem (retrato de deus) · círculo = o que faz
(habilidade) · quadrado arredondado = estado (efeito).

**Por quê:** uma linguagem de três formas é mais legível que tudo redondo. E
resolveu de tabela um problema real: o **anel do disco** virou o elemento
(identidade constante), o **brilho do disco** virou disponibilidade (muda a cada
turno), o **halo dourado** virou "armada" (momentâneo). Três canais que não
colidem, contra a bagunça anterior onde borda dourada dizia "disponível" e uma
barra na base dizia "elemento".

**Detalhe importante:** o botão de habilidade continua **quadrado** (76px); só o
disco interno é recortado. Um círculo inscrito perde 21% da área — se o botão
fosse recortado, o alvo de toque encolheria junto.

---

## 10. Redução de ruído: menos elementos, não elementos menores

**Decidido:** o inventário da tela caiu de ~80 objetos para ~34.

**Por quê:** a primeira tentativa foi criar hierarquia de três níveis, e não
resolveu — **hierarquia organiza o ruído, não o elimina**. O que funcionou foi
cortar:

- Nome da habilidade no ladrilho (24 blocos de texto em 8px) → monograma de 3
  letras. Reconhecimento em vez de leitura, e espaço reservado para a arte.
- Coluna de efeitos por banda (6 colunas) → faixa dentro do próprio retrato.
- "3 DE PÉ · N ENERGIA" no topo, o Σ do total, "/100" em cada barra de vida →
  removidos, todos duplicavam o que a tela já mostrava.
- Três sinais para "já agiu" (anel, barra, escurecimento) → um.
- Fileira de habilidades inimigas (412px por banda) → aba retrátil de 16px.

**A lição:** o ladrilho não precisa se explicar. Em Naruto-Arena ninguém lia os
ícones — aprendia por arte e posição. Quem explica é o painel de baixo.

---

## 11. Habilidades do inimigo em aba retrátil

**Decidido:** alça de 16px ao lado do retrato inimigo; abre uma por vez, em
posição absoluta (sem deslocar o layout), fecha ao virar o turno. Ponto verde na
alça avisa que a Defesa dele está em recarga.

**Recusado:** exibir a fileira sempre (ocupava 412px por banda), e remover de vez.

**Por quê manter:** o dado decide jogadas. Inimigo com 22 de vida, seu Fenrir
executa em 20, você tem uma ação: se a Defesa dele estiver pronta, gastar o
Milagre é jogar fora; se estiver em recarga, é abate garantido. **Mesma jogada,
dois resultados opostos.** Sem essa informação o jogador conta turnos de cabeça —
isso não é dificuldade, é contabilidade, e faz parecer que se perdeu por sorte.

**Por quê retrátil:** informação consultada ocasionalmente não deve ficar exposta
permanentemente. Progressive disclosure.

---

## 12. Botões: placa inscrita, não pílula com gradiente

**Decidido:** sistema de 4 níveis (primário, secundário, silencioso, perigo),
3 tamanhos, raio único de 3px, pressionado = a placa recua.

**Recusado:** o que existia — `linear-gradient` de dois tons em tudo, seis raios
diferentes na tela, e nenhuma hierarquia (RENDER-SE com o mesmo peso de ENCERRAR
TURNO).

**Por quê:** ouro preenchido existe **uma vez por tela**. Quando tudo é dourado,
dourado não significa nada. E render-se saiu para um menu `⋯` porque **ação
destrutiva e rara não deve ter rótulo competindo por atenção** — antes ela estava
numa caixa flutuante sobrepondo a barra de energia.

Abandonado também o CAIXA ALTA em todo botão: era o que fazia a tela gritar.

---

## 13. Correções de kit que só apareceram ao implementar

Seis contradições nos 400 efeitos escritos, achadas ao codar os primeiros 11:

| Kit | Problema | Correção |
|---|---|---|
| Nezha — Rodas de Vento e Fogo | "+10 se Nezha já agiu neste turno" — impossível, unidade age uma vez | "+10 se **outro aliado** já agiu" |
| Fujin — Companheiro de Raijin | passiva só funciona com Raijin, que não é inicial: um dos 9 tem passiva morta | mantida e marcada; **decisão pendente do dono** |
| Cuca — O Papão | 45 contra adormecido somava com o +8 do sono = 53, acima do teto de 40 | 38, fechando em 46 |
| Ganesha — Abrir Caminho | planilha dizia "todos os buffs de 1 inimigo", motor fazia "todos de todos" | "1 buff de cada inimigo" |
| Cuca — passiva | "Básico de graça a cada 3 turnos": substitui a ação ou é extra? | não custa energia; **não** é ação extra |
| Brigid — Ferreira Divina | "+5 se algum inimigo com Queimadura" — inimigo ou aliado? | qualquer unidade no campo |

Extrapolando, os 89 deuses restantes devem esconder umas 30 ambiguidades
parecidas. **É por isso que o motor vem antes do conteúdo.**

---

## 14. Bugs de motor achados pelos testes, não por inspeção

- **Exploit de energia infinita** na conversão (ver decisão 6).
- **Assimetria entre jogadores:** a passiva de estreia do Ganesha ("+2 energias no
  turno 1") disparava por turno *global*, não por lado. Como o turno só incrementa
  ao voltar ao Jogador 1, o **Jogador 2 nunca recebia**.
- **Cronômetro pausava** com qualquer sobreposição aberta — bastava abrir o
  registro para pensar sem limite.
- **`disabled` perdido** no botão de habilidade numa refatoração: habilidade
  impagável continuava com aparência de tocável.

Nenhum apareceria numa revisão visual. Todos apareceram em partida automatizada.

---

## 15. Vida base 120, não 100

**Decidido:** toda unidade tem 120 de vida. Nenhum número de dano dos 11 kits já
escritos mudou; só o denominador.

**Recusado:** manter 100.

**Por quê:** o jogo aleatório fecha em ~13–15 turnos, mas jogo com atenção
concentra dano e fecha mais rápido, e o valor inteiro do design está no meio-jogo
(ler o oponente, contar a recarga da Defesa dele, escolher entre curar e pressionar).
120 devolve um ou dois turnos desse espaço sem tocar num único valor de dano.
A assimetria decidiu: subir a vida é uma linha; cortar 400 números de dano depois
é uma semana — quando a opção barata e a que serve ao design coincidem, é ela.
A "leitura" de valores exatos continua intacta: 120 muda o denominador, não a
transparência. Custo aceito: o orçamento de dano dos 89 kits restantes é calibrado
para 120, então cada Milagre de execução mira ~1/3 da vida, não ~2/5.

---

## 16. Oponente CPU: busca gulosa de 1 lance

**Decidido:** o Jogador 2 pode ser controlado por uma IA (`src/ia.js`), ligada por
padrão na seleção (alterna em "Oponente"). A IA clona o estado, aplica cada ação
candidata **pelo próprio motor**, pontua a posição resultante (vida aliada − vida
inimiga, com bônus por abate, controle e veneno) e escolhe o melhor ganho positivo;
se nada melhora, encerra o turno.

**Recusado (por ora):** busca em profundidade real (2–3 turnos à frente), que é o
item 10 do ROTEIRO. A versão gulosa é o passo intermediário.

**Por quê:** o dono precisava testar "um cenário mais realista de batalha" sem um
segundo humano. A busca de 1 lance é barata, determinística (clona e usa `agir`, sem
tocar no motor) e já joga o suficiente para exercitar combos e economia de energia.
A profundidade e os níveis de dificuldade (item 11) ficam para quando os 100 deuses
existirem e o balanceamento pedir. **Isto NÃO cria RNG no combate** (invariante 2): o
único aleatório continua sendo o sorteio de energia, semeado por `st.seed`; a IA é
puramente determinística sobre o estado.

---

## 17. Batalha não entra na pilha de histórico

**Decidido:** ao entrar na batalha, o roteador **substitui** o topo da pilha em vez
de empilhar (`ir('batalha',{},{substituir:true})`). Assim a batalha fica sozinha na
pilha e `voltar()` devolve `false` — não há como voltar. A saída da batalha acontece
só por **rendição** ou **fim de partida** (o botão "Nova batalha" leva à seleção,
também por substituição).

**Recusado:** empilhar a batalha como uma tela qualquer.

**Por quê:** se a batalha fosse item de histórico, um `voltar()` (gesto de sistema,
botão de voltar do Android, etc.) **abandonaria a partida em andamento sem aviso** —
perda de progresso silenciosa, o pior tipo. A partida é um compromisso; sair dela é
uma decisão explícita (render-se), não um efeito colateral de navegação. O ciclo de
vida da tela cuida do resto: `aoEntrar` inicia o relógio, `aoSair` o para e limpa a
sobreposição, num lugar só (`src/rotas.js` + ganchos em `src/view.js`).

---

## 18. Persistência: uma chave por dono, escrita que fala, leitura que valida a forma

**Decidido (F0.4):** o perfil do jogador é função pura (recebe perfil, devolve perfil
novo), e a persistência é camada separada (`armazenamento.js`) com três escolhas:

- **Uma chave por DONO, não por aplicação.** Perfil em `incursion:perfil`, histórico
  em `incursion:historico`. **Recusado:** um blob só. O histórico cresce (200 entradas)
  e seria reescrito a cada `salvar()`, inclusive em ação frequente; e se corromper,
  levaria o perfil junto. Separados, o histórico pode sumir sem arranhar o estado.
- **`salvar()` devolve `{ok,erro}`, nunca silencioso.** **Recusado:** engolir o erro.
  `localStorage` estoura cota e a aba privada do iOS lança direto; perder progresso
  sem aviso é o pior desfecho. A falha vira aviso visível. (Já no boot, ausência de
  storage NÃO alarma — é começo normal; o alarme é na gravação, que é o que importa.)
- **`carregar()` valida a FORMA, não só `JSON.parse`.** **Recusado:** confiar no parse.
  Dado corrompido em geral é JSON válido com formato errado (deuses como array, moeda
  negativa, time com 4 deuses, chave fora do roster). `problemaDeForma()` derruba para
  `novoPerfil()` registrando o quê. E `migrar()` é chamada no caminho normal mesmo sem
  trabalho — migração só exercitada quando precisa é migração nunca testada.

A migração v0→v1 é andaime por ora (não há dado legado — nada persistia antes), mas a
estrutura existe para a v2 não nascer sem caminho.

---

## 19. Invocação: sorteio puro por semente, pity no perfil, commit antes de revelar

**Decidido (F0.4b):**

- **Sorteio é função pura com semente** (`INV.sortearLote(seed, banner, pity, n)`,
  RNG `mulberry32`). Não olha perfil, não grava, não desenha. O simulador de economia
  da Fase 3 chama só ela, milhares de vezes. Aplicar o resultado ao perfil é outra
  função, e mora em `perfil.js` (`registrarInvocacao`) — quem MUTA o perfil vive lá,
  onde os invariantes são impostos e testados; `invocacao.js` compõe.
- **Commit antes de revelar:** a ordem é sortear → aplicar → **salvar → revelar**.
  **Recusado:** salvar ao fim da animação. Se o app morrer durante a revelação dos 10,
  o jogador pagou e não recebeu. Recompensa se commita antes de aparecer, nunca depois.
  Regra geral, não só do gacha.
- **Histórico guarda a semente e o pity de entrada.** Qualquer invocação é reproduzível
  exatamente — vale quando alguém disser que "o jogo roubou", e vira obrigatório na
  Fase 5 (sorteio no servidor, auditável).

**Mudança de comportamento OBSERVÁVEL:** o pity de SS agora **sobrevive ao recarregar**
(antes vivia só em RAM). Um jogador com 59 invocações mantém as 59. É desejável, e está
registrado aqui por ser observável. **Interim:** o modelo guarda um contador único
(`desdeUltimoSS`); pity por-banner independente e a persistência do 50/50 (`gf`) ficam
para a reconciliação de economia (DECISOES pendente + `docs/inventario.md §10`).

---

## 20. Economia reconciliada: taxas/pity documentados, banner destaca DEUS, sem 50/50

**Decidido (reconciliação de economia; fonte única `data/economia.json`):**

- **Taxas e pity vêm do documentado**, não da planilha superada: SS **3%**, S **17%**,
  A **80%**; pity **60, DURO** (sem soft pity, sem escada). Custo avulso **150**,
  pacote de 10 por **1350** (desconto de 10%). O código estava com metade das taxas
  (valores pré-conversão), pity 74/80 (convenção de gênero) e pacote 1500 (sem
  desconto — terceira herança da fonte errada). Ordem **A/S/SS** em todo lugar; o
  vocabulário `5★/4★` e o tier `B` (vazio, sem função) saem do código e dos dados.

- **Grant inicial: 1500 Gema** (= um pacote de 10; o novato faz uma invocação completa
  no primeiro minuto). Os 30000 de protótipo viram **constante de teste que nunca toca
  o perfil**, mesmo padrão do botão "Teste".

- **Banners com rate-up: mantidos**, com uma **restrição dura**: o rate-up destaca um
  **DEUS específico**, nunca uma ordem inteira. Banner que aumenta a taxa de SS **como
  categoria** é aumento de poder por compra e **contradiz o invariante 3** (sem
  progressão/poder comprável). A taxa de SS continua 3% em todo banner; o que muda no
  destaque é *qual* SS sai (o destacado), não *quanto* SS sai.

- **50/50: REMOVIDO.** O 50/50 (garantir o destacado só na segunda vez, após "perder"
  a primeira) existe para esticar o pity sem parecer que estica — o jogador bate a
  garantia e ainda pode não receber o que queria. Num jogo cuja tese é "repetido vira
  acesso, e a loja vende o deus específico", essa fricção é **redundante e contradiz a
  promessa**. A garantia fica simples: pity 60 dá o SS; em destaque, dá o destacado.
  Sem moeda escondida, sem estado invisível. **Consequência boa:** a migração V2 do
  perfil encolhe — some `garantiaFeat`, e a forma vira só pity por banner.

**Pergaminhos (bilhete de invocação avulso): REMOVIDOS** — número/mecânica fora de
`data/` e sem decisão (regra do CLAUDE.md). **Nota para não voltar errado:** a economia
PREVÊ um item de invocação comprável com Essência, mas na forma **pacote de 10 por mês**,
não bilhete pingado. O pergaminho era a mesma ideia na forma descartada (bilhete avulso
confunde certeza com chance e é ruim de sentir). Volta na Fase 3 **na forma de pacote
mensal**, não como reversão desta remoção.

**Recusado:** manter os números do código (fonte superada) e o 50/50 (convenção de
gênero adotada sem decisão). Também recusado o **soft pity** e a **garantia de S a cada
10** (`p4`): garantia que o jogador não vê é moeda invisível — ele acha que teve sorte
quando acionou regra escondida. Pity 60 duro é a única garantia, e ela é anunciada. **Documentado mas ainda não implementado** (pendência,
não fazer agora): rotação gratuita 8 deuses/semana (Fase 3) e aluguel no ranqueado
(Fase 5, depende de pick/ban).

---

## 21. Geração de energia: sorte no sorteio, ponderada (não uniforme)

**Problema.** A energia vinha só dos elementos do time (`iniciarTurno`, geração antiga).
Isso garante ao time mono-elemento sempre ter o que precisa e o torna composição
dominante. Queríamos sorte: cor estrangeira precisa poder cair. Mas o uniforme puro
(entre os 6) é forte demais — corta pela metade também o time variado e deixa o jogo 2×
mais lento.

**O dado que decidiu o peso (item 6, derivado dos 100 kits em `data/kits.json`):**

| slot | kits com parte "livre" | recarga |
|---|---|---|
| básico | **0** / 100 | — |
| habilidade | **1** / 100 | — |
| milagre | **100** / 100 (74×1, 26×2 pips) | cd 4 |
| defesa (universal) | todos (1 pip) | cd 4 |

Ou seja: energia estrangeira **quase nunca é gasta direto** (só Milagre e Defesa aceitam
livre, ambos cd 4). Ela é, na prática, **matéria-prima de conversão 3→1** — e a conversão
é **1 por turno**. Esse teto muda a conta:

| pesoTime | variado (aproveitável/turno) | mono |
|---|---|---|
| 0,60 | 2,4 | 2,0 → mono −23%, variado −20% |
| **0,75** | **2,7** | **2,3 → mono −23%, variado −10%** |
| 0,85 | 2,8 | 2,5 |

**Decisão: `modo "ponderado"`, `pesoTime 0.75 / pesoLivre 0.25`** (em `data/economia.json`,
bloco `energia`). Corrige o mono na mesma medida que o 0,60, mas desacelera o time variado
pela metade. **`pesoTime` é PROVISÓRIO** — o dono ajusta jogando. Não uniforme porque o
uniforme cobra o preço do mono também do time variado, sem necessidade.

**Fórmula.** Por energia: com prob `pesoTime` sorteia entre os elementos do time; com
`pesoLivre`, entre os 6. P(elemento do time) = `pesoTime + pesoLivre·(k/6)`, k = elementos
distintos do time.

**Contrato de compatibilidade (NÃO é balanceamento).** Sem `st.energia` (ou `modo "time"`),
o motor usa time/1.0 — comportar-se como antes. Isso preserva as suítes existentes sem
edição. Quem ajusta o balanceamento é o `economia.json`, nunca esse fallback.

**Ponto fino do RNG — NÃO MEXER sem ler isto.** O modo `time` consome **exatamente 1
sorteio do `rng` por energia**; o `ponderado`, **2** (decidir o conjunto + escolher dentro).
É por isso que o modo `time` reproduz o fluxo histórico e as suítes de motor passam com
semente fixa. Mudar a contagem de sorteios do modo `time` quebra 4 suítes sem relação
aparente. Travado em `tests/energia.test.js` (teste 7).

**Medições (500 partidas IA×IA por célula, semente fixa — `tests/energia.test.js`):**
duração time/1.0 → ponderado sobe **+1,8%** (variado) e **+4,9%** (mono), muito abaixo do
teto de 20%. Energia estrangeira parada em média **1,25** (variado) / **1,78** (mono) —
abaixo de 4, então a conversão 1/turno dá vazão suficiente **por ora**. Se um ajuste futuro
de peso passar disso, reabrir a vazão da conversão (subir para 2/turno, ou 4→2 num gesto) —
decisão do dono. A fome por falta de energia até CAIU com a ponderação (12,7 → 9,39 no mono).

**Leitura ao contrário (importante para futuros ajustes).** A fome caiu porque a estrangeira
ACUMULA e vira conversão — isto é, a ponderação deu ao mono uma flexibilidade nova (converter
o excedente na cor que falta), não só cortou o excesso de cor nativa. Consequência: **o efeito
corretivo sobre o mono é MENOR do que a tabela de "aproveitável/turno" sugere** — a tabela
conta só a energia direta, não o resgate por conversão. Se, jogando, o mono ainda parecer
forte, o caminho é **ajustar `pesoTime` para ~0,65** (baixar de 0,75 → menos cor nativa
garantida ao mono) **ou reduzir a vazão da conversão** (ela é o que salva o mono), **não mexer
em kit**.

---

## 22. Piso de LEGIBILIDADE em pixels físicos, não piso de escala

O primeiro teste de enquadramento cravava um piso de **escala** (0,80) — a proporção do
palco em celular. Estava errado, e o erro era do dono: **legibilidade não é função da escala,
é do TAMANHO FINAL do texto em pixels FÍSICOS**. Escala 0,729 num aparelho DPR 3 rende texto
MAIOR que escala 0,90 num DPR 1. Especificar a proporção quando o que importa é o resultado
media a coisa errada — e o piso de 0,80 era **fisicamente impossível** em altura útil < 342px
(o aparelho do dono na janela, 726×312), forçando a exceção "reportado, não cravado".

**A regra agora:** `menorTextoDesign × escala × DPR ≥ 11px físicos`, com a matriz cobrindo
**DPR 2 e 3** (o real dos aparelhos de hoje, não só 1). O menor texto do jogo no palco era
**7,5px** de design (`.skill__cost.gratis span`, `.pk__wip`) — subido para **8px**, igualando
o `.foepanel__lbl` que já era o menor. A correção foi **subir o texto no design, não afrouxar
o teste**. Números reais (Chromium, escala medida no render):

| viewport | escala | DPR 2 | DPR 3 |
|---|---|---|---|
| 726×312 (janela do dono — PIOR caso) | 0,729 | **11,7px** | 17,5px |
| 667×375 (iPhone SE) | 0,855 | 13,7px | 20,5px |
| 926×428 | 1,000 | 16,0px | 24,0px |
| 1180×820 (tablet) | 1,250 | 20,0px | 30,0px |

O piso de 11 passa em toda a matriz, com folga de 0,7px no pior caso (726×312 @ DPR2). Antes
do ajuste, esse caso dava 10,9px — 0,1px abaixo; foi o número trazido em vez de relaxar.
Spec pura em `tests/enquadramento.test.js` (números à mão), verificação no render real em
`tests/moldura.test.js` (contexto por DPR, escala medida × DPR).

**Consequência útil (reforça a prioridade do PWA):** naquele mesmo aparelho, sair da janela
para TELA CHEIA leva a escala de **0,729 → 0,841** (altura útil 312 → 360). Ou seja, o modo
instalado não é preferência estética — é onde o jogo fica confortável. O PWA é requisito de
legibilidade, não enfeite.

---

## 23. Carteira real: grant é evento de criação, débito antes de revelar (F0.4c)

**BUG ENCONTRADO (estava no ar):** a carteira era FANTASMA. A tela de invocação rodava
sobre um `S.gemas` local semeado do `grantTeste` (30.000) no load, nunca do perfil. O
custo da invocação (`S.gemas -= cost`) mexia só nesse fantasma; o commit-antes-de-revelar
persistia deuses/pity/histórico mas **nunca debitava gema do perfil**. Ou seja: **invocar
era de graça** — o gasto era ficção. Corrigido nesta fase.

**Grant inicial (1500) é EVENTO DE CRIAÇÃO, não default de leitura.** Nasce em
`novoPerfil()` (o valor vem por PARÂMETRO, da borda que vê `data/economia.json →
grantInicial.gema`; a função pura não lê global) e vira **entrada de histórico** como
qualquer transação. A leitura NUNCA completa saldo faltante.

**"Zero é legítimo" resolvido por PRESENÇA DE VERSÃO, não `gema || 1500`.** Um jogador que
gastou tudo tem gema 0 e não pode ganhar 1500 a cada carregamento. A distinção é a versão:
`v<2` = perfil anterior ao grant (a carteira era fantasma, nunca recebeu) → a **migração**
credita 1500 UMA vez e sobe para v2; `v2` com gema 0 = gastou tudo → recebe nada. O getter
é `perfil.moedas.gema` puro, sem fallback. `migrar()` é idempotente pela versão (rodar de
novo num v2 não credita). É o primeiro trabalho REAL da migração, que nasceu andaime.

**Débito real na invocação:** saldo insuficiente **bloqueia ANTES de qualquer mudança de
estado** — sem sorteio, sem consumir pity, sem gravar (falha de pagamento não avança estado
nenhum, o invariante mais cravado). O débito acontece no **mesmo commit que persiste, ANTES
de revelar** (paga antes de ver, espelho da regra da recompensa). Custo entra no histórico
da invocação.

**Crédito de teste (grantTeste 30.000) — o botão "+ DEV".** A nota do dado ("nunca entra no
perfil real") existe pelo mesmo motivo do botão TESTE da seleção: afordância de protótipo
não pode contaminar dado persistido sem que se saiba. Como a carteira real tira a única
forma de exercitar invocação sem grindar, o crédito DEV **credita o perfil DE VERDADE mas o
MARCA como contaminado**: campo `perfil.dev = { creditosTeste, primeiroEm }`, entrada de
histórico com tipo próprio `dev-credito` (nunca confundível com transação de jogo), e um
indicador `⚠ DEV` visível na tela enquanto a marca existir. Assim nenhum perfil de jogador
de verdade recebe 30.000 sem que se saiba — a nota do dado é honrada no que importa. **O
botão e a marca saem antes do release** (dívida no ESTADO).

**Recriação por corrupção recebe 1500** (é `novoPerfil()`, grant é criação — quem perdeu
tudo por corrupção não pode ficar sem poder jogar), mas o histórico distingue: entrada
`tipo:'recriacao'` com a **causa** da corrupção junto, para responder depois "por que esse
jogador tem 1500 do nada".

Testes que travam tudo isso em `tests/perfil.test.js` (migração idempotente, zero-legítimo,
recriação com causa, dev marca+valida, `iniciar()` credita/persiste/loga uma vez) e
`tests/invocacao.test.js` (x10 debita o perfil de verdade; insuficiente bloqueia sem
consumir pity nem gravar; DEV credita+marca+indicador+loga). **13 suítes verdes.**

---

## 24. Motor: dados fora, regras dentro; catálogo CONGELADO por partida (F1.0a)

**Separação dados/regras.** Os kits dos deuses saíram de `engine.js` (literal `GODS` de ~180
linhas) para **um arquivo por deus** em `data/deuses/<key>.json` — facilita revisar,
versionar e ver diff de balanceamento, e o motor para de crescer quando os 73 kits entrarem
(eram dados, não lógica). `src/catalogo.js` monta o `GODS` a partir desses arquivos (Node lê
via `fs`; browser recebe o array injetado pelo build) e é o ÚNICO que declara `GODS` — a UI
lê esse global; o motor não possui dado de deus nenhum.

**Schema validado na BUILD, vocabulário derivado do MOTOR.** `tools/valida_kit.js` lê
`E.VOCAB` (classes, tipos de `fx.t`, tipos de `eff.type`, alvos, chaves de custo e de efeito)
do próprio `engine.js` — o schema não pode divergir do que o motor executa. A build falha
alto em campo desconhecido, custo mal formado, classe/alvo inválidos, `fx.t` ou `eff.type`
que o motor não sabe executar. Prova pelos dois lados: os 11 kits reais passam sem exceção; um
kit corrompido lista os 8 erros e sai com código 1. Reforço em runtime: `aplicarFx` **RECUSA**
(lança) um `fx.t` fora de `TIPOS_FX` — efeito com typo não passa em silêncio, que é como se
escreveria 73 kits com um erro sem descobrir. A **Defesa** (regra universal, fica no motor)
é validada pelo mesmo schema: tem formato de habilidade e não pode ficar para trás.

**Catálogo CONGELADO por partida (não assado no estado) — mudança da decisão de mecanismo,
não do objetivo.** A intenção era o estado carregar o kit para o **seed determinar a partida
inteira**: rebalancear um kit no meio da Fase 1 não pode alterar uma partida em andamento nem
tornar a **arena não-reproduzível**. Assar o kit em cada unidade entregava isso, MAS a IA
clona o estado por `JSON.stringify` a cada nó da busca e o kit assado **dobrava o clone**
(`ia.test` 600 → 1040 ms, +73%; pior ainda com a busca em profundidade da fase 2). Nuance que
decidiu o mecanismo: `JSON.stringify` **não tem referência** — pôr o kit "por referência" na
unidade não adianta, o clone copia o objeto do mesmo jeito; só **manter o kit FORA do estado**
resolve. Solução: **REGISTRO COM CHAVE.** `novoEstado` recebe o catálogo, congela um snapshot e
o indexa por `st.catId` (string curta = hash do conteúdo, que SOBREVIVE ao `JSON.stringify`); a
resolução lê o kit por `CATALOGOS[st.catId]` (`kitDe`), a unidade carrega só a chave, o clone da
IA volta a ser barato (~490 ms). **Por que registro com chave e não um `_CAT` de módulo:** um
`_CAT` global quebraria com duas partidas coexistindo — `novoEstado(B)` sobrescreveria o
catálogo de A e `agir(A)` leria o de B, em silêncio; a arena da F1.4 cria milhares de estados.
Não cabe pôr o catálogo dentro de `st` (volta a perf) nem num WeakMap (o clone por
`JSON.stringify` não o acompanharia). Id por **conteúdo** faz catálogos iguais reusarem o
snapshot — o registro não vaza com os milhares de estados da arena. Congelado no início,
rebalancear no meio não altera a partida — o objetivo (seed determina a partida) é preservado.
Travado em `tests/catalogo.test.js` (duas partidas, catálogos diferentes, em sequência, cada uma
respeitando o seu; clone só com o `catId` lê o mesmo snapshot).

**Limite e forma-alvo (Fase 2, NÃO implementar agora).** O estado serializado carrega só o
`catId`, não o kit — uma Provação/replay salvo lê o kit VIVO ao recarregar. Em vez de assar o
kit (caro), a forma-alvo é um **CARIMBO DE VERSÃO do catálogo** no estado salvo (hash do
conteúdo ou número incrementado). Ao carregar, compara-se: **Provação** usa o kit vivo de
propósito (o jogador precisa aprender o deus que existe HOJE), mas se o carimbo divergir,
marca-se para **RE-VERIFICAÇÃO** (a solução gravada é reexecutada para provar que o puzzle
continua vencível); **Replay**, se o carimbo divergir, **avisa que a reprodução pode não ser
exata**, em vez de reproduzir errado em silêncio. O `catId` por conteúdo já é meio caminho — é o
carimbo.

---

## 25. Motor emite EVENTOS, não texto; um narrador TOTAL traduz (F1.0b)

**O motor parou de escrever português.** `log()` empilha **eventos estruturados** em `st.log`
(`{tipo, ...}`), e `st.fim` virou `{tipo:'fim', resultado, lado?, motivo?}`. Um único lugar
traduz para pt-BR na hora de exibir: `src/ui/narrar.js`. Isto existe porque o mesmo motor roda
no servidor (Fase 4/5), onde string de português não deveria existir, e mata o remendo
`traduzirRotulos` (regex de "Jogador N" por cima de string pronta) — o narrador resolve `lado`
por `rotuloLado`, sem remendo. A GRAMÁTICA é contrato escrito ANTES em `docs/eventos.md`.

**As 5 regras (invioláveis, varridas por `tests/eventos.test.js`):** (1) todo evento tem `tipo`,
que é a ÚNICA coisa que decide o formato; (2) campos **canônicos** reutilizados, sem sinônimo
(dois eventos que falam de quantidade usam `valor`); (3) **sempre CHAVE, nunca nome exibível**
(`alvo:'zeus'`, `lado:0` — o narrador resolve chave→nome, e o nome da habilidade pelo catálogo
da partida via `origem`+`slot`); (4) **zero formatação** (`kind:'puro'`, não `'[puro]'`); (5) o
narrador é **TOTAL** — evento de `tipo` desconhecido NÃO some do registro, cai num despejo cru
dos campos. Log que engole evento é onde bug de motor se esconde, e nos 73 kits vai acontecer;
o teste crava que um tipo inventado aparece. A varredura roda 24 partidas IA×IA (2824 eventos)
e falha se qualquer campo, tipo ou `motivo` sair do vocabulário, ou se uma "chave" for na
verdade nome exibível (`'Zeus'`, `lado 'Jogador 1'`, `kind '[puro]'`). Vocabulário mora em
`E.VOCAB` (`eventos`/`camposEvento`/`motivos`) — mesma fonte única que já alimenta o schema.

**Decisões de contrato do dono:** (A) **DoT vira CHAVE** (`efeito:'queimadura'`), sem campo
isento — a exceção viraria o precedente que os 73 kits seguem, e "sempre chave" morreria por
mil concessões. Tocou `data/deuses/brigid.json` e o schema passou a validar `dot.nome ∈ V.dots`;
o mapa chave→nome (`NOMES_DOT`) mora em `ui/base.js` (compartilhado por `narrar.js` e `campo.js`).
(B) **O narrador lê o catálogo da partida** (`CATALOGOS[st.catId]`) para resolver `origem`+`slot`
→ nome de habilidade e `origem`→passiva. (C) **Um evento, um sujeito** (regra 6): um Milagre que
atinge 3 emite **um `dano` por alvo** — cada alvo pode ter resultado diferente (um absorve no
escudo, outro está Invulnerável, outro cai); um `valor` agregado mentiria. (D) **`motivo` é
conjunto FECHADO** — é a porta dos fundos por onde o português voltaria ao motor ("porque estava
Invulnerável"); é chave de um conjunto que a varredura valida.

**Arquitetura:** `narrar.js` é **FUNDAÇÃO como `base.js`** — os outros `ui/` podem chamá-lo (quem
renderiza registro/resumo/banner o invoca), mas ele só usa `base.js` e os globais do motor. A
checagem de direção da build isenta os dois (`UI_FUNDACAO`), e `narrar.js` como origem continua
checado (não pode chamar outro `ui/`).

**Rugas achadas ao implementar (reportadas, não escondidas):**
- **`motivo` reconciliado à realidade:** o motor emite `sem_cura`/`nao_revive` (falhas) e `tempo`
  (fim por esgotamento no turno 40) que a gramática rascunhada não listava; `imune_tipo` estava
  na lista mas o motor nunca o emite (imunidade sai como evento `imune` com `efeito`, não como
  `bloqueio` com `motivo`). O conjunto fechado passou a ser exatamente o que se emite.
- **BUG DE MOTOR achado PELO refactor (anterior à F1.0b) — argumento a favor de eventos:** a
  invocação-guarda que assumia um golpe de alvo único logava `absorvido` com o dano inteiro —
  mas ela **perde HP**, nada é absorvido por escudo. Era mentira desde sempre; a string
  `"absorve o golpe ({antes}→{hp})"` a **escondia** (parecia sabor, não campo errado). Ao virar
  evento, `absorvido` ganhou significado exato (quanto o ESCUDO comeu) e a mentira ficou visível.
  Corrigido para dois eventos (regra 6): `efeito:'intercepta'` (assumiu o golpe) + `dano` limpo
  (o que a guarda levou). **Lição:** string livre esconde erro de dado; evento estruturado, com
  cada campo significando uma coisa só, o expõe — é uma razão a mais para o motor emitir eventos.
- **`ANEL`/`MANTO` saíram do motor:** o rótulo do modo alternado da Nezha estava chumbado no
  `engine.js` (o pt-BR que a F1.0b existe para tirar). Foi para o kit (`ab.modos:["ANEL","MANTO"]`,
  igual a `opcoes[].nome`); o schema passou a aceitar `modos`; o narrador lê do catálogo.
- **`contador` e `fase` não disparam nos 11 kits** (0 kits usam esses `fx`). A chavagem dos seus
  sub-tokens (nomes de contador; `Dia`/`Noite`) fica para quando o primeiro kit os exercitar —
  mesma disciplina de "primitiva antes do deus"; o narrador já os trata de forma TOTAL.
- **Lacunas de narração** onde o evento carregava menos que a string antiga — VARRIDAS e fechadas
  na F1.0b-cont (abaixo). Dos 57 textos antigos, 47 não perderam nada; das 10 lacunas, só 4
  disparavam nos 11 kits.

**Migração de testes (método muda, verificação fica):** os testes que SETavam `st.fim` string
(`perspectiva`, `interface`, `rotas`) passaram a setar o evento estruturado; a asserção sobre o
BANNER renderizado ("CPU VENCE", "JOGADOR 2 VENCE") é a mesma — só o SET mudou, o VERIFY não. Os
que empilhavam DoT à mão (`motor`, `auditoria`, `interface`) passaram a usar a chave `queimadura`;
`interface` continua conferindo que a UI exibe "QUEIMADURA".

**F1.0b-cont — evento incompleto é dívida silenciosa (regra 6 da gramática).** Varredura das 57
strings antigas contra o evento que cada uma emite hoje. Corte útil: por "dispara nos 11 kits", não
por gravidade percebida.
- **Corrigido (dispara hoje):** (A) **energia livre** virou UM evento `orbe` por elemento
  (`{lado, valor:-n, para:<elem>}`) — a quebra por elemento é o que o jogador precisa ao ler o
  turno do oponente, e o registro é a ÚNICA fonte disso desde a F0.7 (o processo da CPU é escondido
  de propósito); (B) **passiva de renascer da Nezha** carrega `valor:40`; (C/D) **Vínculo** foi
  APARADO para um sujeito ("Vínculo em X") — o par carrega o ícone no retrato, o estado já mostra a
  ligação, então a narração descreve o sujeito e para (corolário registrado na gramática).
- **Diferido (0-kit) com TRIPWIRE:** invocação, dano armazenado, Vida Extra, interceptar e contador
  não disparam nos 11 kits; suas lacunas de sub-token ficam para quando o kit chegar. O que as torna
  seguras (em vez de um aviso que alguém esquece) é o mapa `OBRIGATORIOS` em `tests/eventos.test.js`:
  chave por tipo, e **chave composta `tipo:efeito`** para lacuna de sub-tipo (`efeito:copiar` exige
  `habilidadeCopiada`; `efeito:invocacao` exige `invocacao`), resolvida mais-específica-primeiro.
  Os nomes canônicos desses campos já estão RESERVADOS em `E.VOCAB.camposEvento` (complete-by-
  construction). Quando o kit disparar o evento cru, o teste falha.
- **BUG CONHECIDO (não é lacuna — narra ERRADO):** ao copiar (fx `copiar`, sucesso), o evento é
  `acao{origem, slot:'habilidade'}`, então o narrador resolve a Habilidade PRÓPRIA de quem copia, não
  a Habilidade COPIADA. É narração incorreta, não só incompleta. Só se manifesta quando **a Ísis
  entrar, na F1.3** (0 kits copiam hoje) — a implementar por mim então: emitir `efeito:copiar` com
  `habilidadeCopiada` (o tripwire `OBRIGATORIOS['efeito:copiar']` já força isso) em vez do `acao` que
  mente. Registrado aqui para não reaparecer como surpresa na F1.3.

---

## 26. Fração implícita da vida reescalada para 120 (F1.0c) — CONTINUAÇÃO do §15, não revisão

O §15 subiu a vida para 120 **sem tocar no dano bruto** (jogo ~20% mais lento, de propósito) e
até previu a consequência numa linha — "cada Milagre de execução mira ~1/3 da vida, não ~2/5" —
mas **glosou sem medir kit a kit**. O §26 fecha exatamente esse aberto. Não revê o §15: o dano
bruto continua congelado (opção (b), decidida lá); aqui só se corrige o que o §15 deixou derivar.

**O problema medido.** Números que são FRAÇÃO da vida não escalam sozinhos quando a vida sobe. A
100, um limiar de execução "≤25" era 25% da vida; a 120 virou ~21%. É degradação silenciosa: não
quebrava teste, ninguém revia. A varredura das 57 strings antigas (F1.0b) já tinha exposto a
categoria; aqui ela foi medida.

**Decisão: opção (c)** — reescalar ×1,2 SÓ o que é fração implícita da vida, mantendo o dano
bruto e as taxas (cura, escudo, redução plana — que escalam junto com o dano, preservando a razão,
então pertencem ao §15). (a) (escalar tudo) contradiz o §15; (b) puro deixa a degradação de pé.

**Dois achados que corrigiram a proposta do dono (a deriva de fração corta nos DOIS sentidos):**
- **"Não cai abaixo de 1 de HP" NÃO é fração — é binário.** 1 HP é 1 HP em qualquer vida máxima
  (Hércules, Sun Wukong, Chang'e, Vishnu, Oxalá, Dagda, contador da Shiva). Reescalar não faz
  sentido; ficam de fora. (O dono havia listado em (c); retirado.)
- **A Durga era um BUFF acidental, não degradação.** O portão "48 se **acima** de 70 de HP" abria
  o bônus para 70% da vida a 100; a 120, "acima de 70" pega tudo acima de 58% — faixa MAIOR. A
  procura só por enfraquecimento teria perdido isso. Lição: fração à deriva enfraquece uns e
  fortalece outros; auditar deriva é olhar os dois sentidos.

**Os 19 números reescalados** (7 execução + 1 portão-alto + 4 portão-baixo + 7 revive; Osíris
entra 2×, portão + revive; 18 kits, 19 linhas): execução 20→24 / 25→30; portão-alto (Durga)
70→84 (só o portão; o dano 48/32 fica); portão-baixo 50→60; revive 40→48 / 50→60 / 30→36 / 25→30.
Tudo na prosa do roster (`data/kits.json`), **só o dano bruto NÃO** foi tocado — a auditoria de
teto bruto (`auditoria.test.js`) segue verde, prova de que nenhum dos 19 era dano disfarçado.
**Só a Nezha está implementada no motor** (revive 40→48 em `engine.js`, prosa em `data/deuses`);
os outros 18 são prosa até virarem kit de máquina.

**Trava adiante (`tests/fracoes.test.js`).** Tabela FECHADA de frações pretendidas por categoria
(execução {20%,25%}, portão-alto {70%}, portão-baixo {50%}, revive {25%,30%,40%,50%}); a varredura
lê a vida DO MOTOR (não de um literal) e falha se um kit sentar fora de `round(fração × vida)`.
Tolerância = 0 por decisão: o alvo é o inteiro exato, e ±1 mesclaria as faixas 20%/25% da execução
(24 vs o velho 25). Se a vida mudar de novo, os alvos recomputam e o teste aponta o que reescalar
— os 73 futuros nascem certos por construção, não por memória.

**Lacuna aberta (schema não pega prosa↔motor).** O schema da F1.0a valida a forma dos kits de
máquina (`data/deuses`), mas NÃO compara com a prosa do roster (`data/kits.json`); prosa e código
podem divergir em silêncio. Hoje só a Nezha existe nos dois — mantidos em sincronia à mão. Com 73
kits vindo, isso vira bug. Tarefa aberta (ESTADO.md): um checador prosa↔motor na build.

---

## 27. Sinergia declarada: Podridão (Ah Puch) × execução — NÃO é bug (F1.1)

A Podridão do Ah Puch reduz o HP MÁXIMO do alvo (−10 por acúmulo). Depois da F1.0c, os limiares
de execução são frações do máximo de PROJETO (120): ≤24 = 20%. Contra um alvo decaído a 80 de
máximo, esse mesmo ≤24 vale 30% do máximo ATUAL dele — ou seja, a execução fica mais fácil quanto
mais podre o alvo. **Isto é sinergia INTENCIONAL, não deriva de calibração:** Ah Puch amolece o
alvo para o executor (Hades, Fenrir, Lugh…), que é o papel da dupla. O teste de fração (F1.0c)
valida AUTORIA de kit contra o máximo de projeto e NÃO persegue o estado de runtime — de propósito.
Registrado para que ninguém "conserte" isso depois achando que um limiar valendo 30% do máximo
reduzido é erro. Se algum dia se quiser um limite sobre o máximo ATUAL, é decisão nova, não conserto.

---

## 28. Cadeia de verdade: kits.json é a fonte; checador na build (F1.0e, elo B)

A verdade de um kit passa por **planilha → `data/kits.json` → `data/deuses`**. O `kits.json` (prosa
revisada, o que o dono lê) é a **FONTE**; `data/deuses` (máquina) é DERIVADO. Divergência entre eles
é **presunção de erro no motor**, e o checador só **APONTA** — nunca conserta sozinho.

**Elo B (`tools/checar_cadeia.js`, na build, falha alto):** confere número a número — nome, custo,
recarga, dano, cura — entre a prosa e o `fx`/`cost`/`cd` da máquina, nos kits implementados. Campo
que o parser não resolve com segurança vira **NÃO-CONFERÍVEL** (reportado, nunca engolido). **Teto:
se >20% não-conferível o checador não protege** — hoje 1,6% (2/124). O parser rejeita o que não é
dano causado (`+N de dano`/`N menos de dano` são buff/debuff, não dano).

**Achado que validou o checador** (o dono: "se não achar divergência, desconfie"): apontou
`nezha.habilidade [dano]` — a máquina não tem `dmg` no `ab.fx` porque o Arsenal Celeste é `alterna`
e o dano da forma MANTO está **chumbado no `engine.js`**, não no kit. O motor está correto (dá 12
em MANTO), mas o valor não mora no dado — **cegueira do checador para `alterna`/`opcoes`** (marcados
não-conferíveis) e **resíduo da F1.0a** (dado de kit no motor). Anotado no ESTADO, não vira tarefa
(o objetivo das próximas sessões é deus no jogo, não fundação). Prova de dentes em `tests/cadeia.test.js`.

**Elo A (planilha↔kits.json) — tarefa ABERTA, não agora.** Critério de infraestrutura que passa a
valer: **a tarefa CONTAMINA o conteúdo que vem, ou é diagnóstico de dívida que já existe?** Elo B
contamina (guarda os 6 kits da F1.1 e os 73 dos lotes — kit novo divergindo passaria em silêncio) →
faz agora. Elo A é diagnóstico (o Susanoo já divergia antes desta conversa; os kits novos nascem do
`kits.json`, não da planilha) → não protege kit futuro → ESTADO, com método já decidido (parse cru
de XML, sem dep — a planilha `docs/*.xlsx` é zip de XML), para quando a Fase 1 fechar. Entregável de
lá: quantos kits têm dado só na planilha (o "pool de time, teto 20" do Combo, os "100 de HP" parados).

---

## 29. Contador com limiar: duas FAMÍLIAS distintas (F1.1, primitiva 1)

Ao ler o número de um contador contra um alvo, há **duas famílias**, e modelá-las como uma só
produziria um mecanismo que faz as duas coisas mal:
- **Gatilho-no-acúmulo** — dispara SOZINHO quando o número muda e cruza um limiar. Ex.: Anúbis,
  "quem chegar a 4 Ataduras fica Selado". É um evento no momento do acúmulo.
- **Condição-na-ação** — o número é LIDO quando o jogador aperta o botão, para escalar/desbloquear.
  Ex.: Kitsune, "com 5+ Caudas, Domina"; Rá, "+4 por Disco Solar". É `porContador`, que já existe
  (primitivas.test §1) — condição sobre um mecanismo existente, não mecanismo novo.

**Primitiva 1 entrega só o gatilho-no-acúmulo** (`fx.limiar:{em, aplica}`, config no DADO;
`cruzarLimiar` no motor). Três bordas travadas em `primitivas.test §1b` — é onde esse padrão sempre
quebra: (1) **dispara ao CRUZAR, uma vez** — "chegar a 4", não "estar em 4+"; acúmulo já acima NÃO
redispara (a prosa do Anúbis pede isso); (2) **cruzar de uma vez** conta — +2 de 3→5 dispara o 4 sem
parar nele (o Milagre do Anúbis dá +2 em todos, então acontece de verdade); (3) **imunidade** —
`aplicar` recusa o controle no alvo imune, mas o contador acumula normalmente e **não há retroação**
(cair a imunidade depois não aplica o efeito perdido; só um novo CRUZAR aplicaria, e acima do limiar
não há novo cruzar). O efeito aplicado é do vocabulário existente — o gatilho é a primitiva, não o efeito.

---

## 30. Nome de contador é CHAVE no campo `efeito` do evento (F1.1, diferido da F1.0b pago)

O evento `contador` passou a carregar a **chave** do contador no campo canônico `efeito`
(`{tipo:'contador', origem, valor, efeito:'discoSolar'}`); o narrador resolve para o nome exibível
via `NOMES_CONTADOR` (em `ui/base.js`, ao lado do `NOMES_DOT`), e `OBRIGATORIOS['contador']` passa a
exigir `efeito`. As chaves são camelCase (`discoSolar`, `atadura`, `cauda`, `combo`, `podridao`,
`maldicao`) — mesma convenção dos tipos de efeito, sem underscore, então a varredura de gramática as
aceita sem afrouxar o regex.

**Reusar `efeito` é economia, não sobrecarga (decisão consciente, a pedido do dono).** O campo
`efeito` JÁ é polimórfico por `tipo`: `dot.efeito` é chave de DoT, `imune.efeito` é o efeito a que se
é imune, `fase.efeito` é a fase, `efeito.efeito` é o tipo de efeito. Seu significado sempre foi "a
coisa CHAVEADA que este evento trata", lida por `tipo`. Nenhum consumidor lê `.efeito` sem o `.tipo`
(o narrador despacha por `tipo`; o `OBRIGATORIOS` chaveia por `tipo`), e a resolução do contador é
SEPARADA (`nomeContador`, não o `rotuloEfeito` genérico) — então chave coincidente não cruza. A
gramática proíbe **sinônimo** (dois campos p/ a mesma coisa); um campo `contador` novo é que seria a
duplicata. Sem caso ambíguo → reuso. (`V.contadores` no schema, à la `V.dots`, fica para quando o
primeiro kit de contador entrar em `data/deuses` — hoje 0 kits usam `fx.contador`.)

---

## 31. Contador de CAMPO por LADO: pool do time, store separado, permanece na queda (F1.1, primitiva 2)

O Combo é um **pool do TIME por lado**, não um contador por-unidade. `st.lados[l].contadores` é um
store SEPARADO do `u.contadores`, e a separação não é estilística:
- `contadorNoCampo` responde **"quanto o time TEM, somando as unidades vivas?"** — MUDA quando uma
  unidade cai. O pool responde **"quanto o time ACUMULOU?"** — não deveria mudar por queda. São
  perguntas diferentes que só coincidem por acidente hoje; unificar faria uma responder errado.

**O pool PERMANECE quando o gerador cai** — e o argumento é do próprio kit, não "a planilha diz":
o Milagre do Susanoo consome TODO o Combo; se o pool zerasse na queda, ele viraria armadilha
(acumula 20 e perde tudo se o gerador morre antes de consumir), punindo a preparação que o kit pede.
E há um segundo gerador previsto (Fujin dá +1 com Raijin no time) — com dois geradores, "de quem é o
Combo" deixa de fazer sentido: é do LADO. Geração credita `origem` (quem gerou) no evento, mas o
armazém é do lado.

**Mecanismo (fx, dado):** `{t:'contador', pool:'lado', lado:'proprio'|'inimigo', nome, v, max}` gera
no pool; `porContadorLado:{nome, lado, v}` escala dano pelo pool; `consomeContadorLado:nome` zera o
pool do lado próprio após escalar. Quatro bordas em `primitivas.test §1c` — a 4ª é onde pool-por-lado
vaza: **os dois lados são independentes de verdade** (Susanoo dos dois lados: cada um gera no seu
pool, teto 20 é POR lado e não somado, consumo de um não toca o outro) — foi assim que o `_CAT` de
módulo quase passou (§24), então travado explicitamente.

---

## 32. Redução de HP máximo (Podridão): piso 1, não é execução, restaura sem curar (F1.1, primitiva 3)

A Podridão do Ah Puch reduz o HP MÁXIMO em 10 por acúmulo. Decisões:
- **Piso 1 no máximo.** `hp` chegando a 0 é MORTE; `maxHp` é CAPACIDADE. Se a Podridão levasse o
  máximo a 0 e matasse, seria **execução disfarçada sem limiar** — e os dois efeitos que matam sem
  dano no jogo (execução por limiar, e a contagem do Yan Wong) são DECLARADOS como tal. A decomposição
  deixa a unidade frágil (máximo 1), a morte fica por conta do dano. `reduzirMaxHp` para em 1.
- **O clamp NUNCA mata.** Unidade 5/10 que ganha Podridão: máximo vai a 1 (piso), o clamp puxa hp de
  5 para 1 — viva. É onde "piso 1" vazaria sem ninguém notar (a morte viria do clamp, não da redução);
  como `maxHp≥1`, `hp=min(hp,maxHp)≥1`. Travado em `primitivas.test §1d`.
- **Guarda a perda REAL** (`u.maxHpPerdido`, limitada pelo piso) para o Milagre do Itzamná restaurar.
- **Restaurar devolve o máximo SEM curar** (`t.maxHp += maxHpPerdido`, `hp` fica). O Milagre do Itzamná
  já cura 25 no time num efeito separado; se restaurar também curasse, seria cura dupla no mesmo botão.
  A prosa distingue os dois; o motor distingue. Fx `restauraMax` (per-alvo, escopo time).

**Aberto até o kit do Ah Puch:** `maxHpPerdido` some quando a unidade cai e volta por revive? Palpite:
a unidade revive com o máximo REDUZIDO (a decomposição não se desfaz com a morte). Não decidido — trago
junto do kit.

---

## 33. Contágio: iguala ao maior, fonte retém de graça, dispara limiar (F1.1, primitiva 4)

A Maldição de Yomi (Izanami) se espalha para os três inimigos. Semântica travada:
- **Iguala ao MAIOR, não aditivo.** `espalharContador` põe todos no maior contador entre eles (teto 5).
  Aditivo comporia consigo mesmo — usar a habilidade 2× dobraria o campo (3→6→12) e, com 6 de dano puro
  por acúmulo, furaria qualquer teto em três turnos. Igualar dá o contágio sem laço multiplicativo:
  espalhar 2× sem novo acúmulo NÃO muda nada (todos já no máximo).
- **A fonte RETÉM de graça.** Ela está no máximo, então igualar não a move — sem `if` especial
  protegendo-a. Comentário no código avisa: quem adicionar um `if` para "proteger a fonte" está
  consertando algo que o mecanismo já garante.
- **A subida passa por `aposAcumular`: chegar a N é chegar a N.** Contágio que leva uma unidade a
  cruzar um limiar DISPARA o limiar, igual a acúmulo direto. Um limiar que só dispara por certos
  caminhos vira regra OCULTA — e regra oculta é o que viemos matando desde o soft pity e o 50/50
  (§20/§21). Para a Maldição é indiferente (ela não tem limiar), mas o mecanismo vale para todo contador.
- **Consequência registrada de frente (para a arena da F1.4):** contágio + limiar é uma combinação
  FORTE — espalha e dispara em três alvos de uma vez. Não é acidente, é o que a mecânica promete; mas
  é candidata a aparecer como outlier quando a arena medir números, e aí NÃO deve ser tratada como
  surpresa nem "consertada" por reflexo — é design conhecido.

Com a primitiva 4, o motor tem tudo que os 6 kits de contador precisam; o próximo passo é ESCREVER os
kits, e é aí que o checador da cadeia (F1.0e, §28) entra em ação pela primeira vez com dado novo.

---

## 34. Contador não aparece no retrato: dívida de UI com endereço na F4 (não "algum dia")

O 1º kit de contador (Rá, §30) expôs que `campo.js` desenha `efeitos` e `dots` na faixa do retrato, mas
**não `contadores`** — o Disco Solar existe só no registro. É **informação escondida**, exatamente a classe
de problema que viemos matando desde o soft pity e o 50/50 (§20/§21): o jogador decide sobre um recurso que
não vê. Não bloqueia escrever kits (o motor conta certo; só a exibição falta), então **não vira tarefa
agora** — mas entra com **endereço fixo na F4 (acabamento visual)**, junto do resto da arte de faixa, não em
"algum dia". Forma-alvo: badge/contador no retrato via `NOMES_CONTADOR` (já existe em `ui/base.js`).

## 35. A varredura das primitivas é ÚNICA e substitui a descoberta de-kit-em-kit (planejamento)

`docs/primitivas-faltantes.md` lê a prosa inteira dos 100 kits de uma vez. O achado que fecha a conta: o
número de "primitivas faltantes" mudava (12→11→4→7) porque contávamos `fx` faltante, quando o custo real
é (a) `fx` declarado-mas-verde estreando (o trap do contador, §30) e (b) **passivas hardcoded** — as 100 são
prosa pura, 11 feitas, e 38 do tipo "+N dano condicional" (colapsáveis num `bonusDano condicional`
data-driven). A tabela é a base para o dono montar o resto da Fase 1; as decisões dela ficam ABERTAS abaixo
até serem batidas em bloco.

**LIÇÃO (a mais cara do planejamento):** o número mudou TRÊS vezes (12→11→4→7) não porque a lista crescia,
mas porque **eu media a dimensão errada** — contava `fx` faltante quando o custo real estava nas passivas.
Medir a dimensão certa de uma vez (a varredura completa) valeu mais que qualquer contagem incremental. Antes
de estimar "quanto falta", pergunte "estou contando a unidade certa?" — `fx` era o proxy fácil e errado.

## 36. Passiva ganha SCHEMA DECLARATIVO — a decisão-mãe, vira a F1.2 (antes de execução e Selado)

Decisão do dono a partir da varredura (§35): a passiva deixa de ser prosa-hardcoded e ganha `fx` declarado
no kit, igual à habilidade. **Contamina como nada mais no projeto:** sem ela, 89 passivas viram 89 blocos
`if (u.key===...)` no motor — o OPOSTO do que a F1.0a fez com os kits (tirar dado do motor), e o checador
da F1.0e (§28) não alcança `if` em código. O número fecha: ~94 das 100 passivas caem em 6-7 formas
declaráveis (+N condicional 38, imunidade estática 27, por-turno 15, on-kill 14, reativa 10, on-death 7,
sinergia nomeada 7) — a diferença entre **6 mecanismos e 89 casos especiais**. Não é refatoração
especulativa; é a mesma faxina da F1.0a aplicada às passivas.

**Plano da F1.2 (várias sessões, UMA categoria por sessão):**
1. Começar pelo **"+N condicional" (38 kits)** — a forma mais comum, valida o desenho. Declarar no kit, não
   no motor. Migrar as passivas dos 12 já implementados que caem nessa forma (sobek, ra, ogum, brigid…) e
   provar que o comportamento NÃO mudou (as suítes atuais são a rede).
2. Depois as outras categorias, uma por sessão, na ordem de frequência. Cada uma com teste + migração dos já
   implementados.
3. O schema da F1.0a (`valida_kit`) passa a validar a FORMA da passiva declarada, igual valida habilidade.
4. Ao fim: relatar quantas das 100 o schema já expressa e quantas ainda precisam de código. Se sobrarem 5-6
   casos genuinamente únicos, **hardcode é a resposta certa para o que é único de verdade** — não forçar.

**SESSÃO 1 FEITA (gatilho `bonusDano`).** Schema em `docs/passivas.md`; vocabulário fechado (9 chaves de
condição) em `E.VOCAB`; `valida_kit` valida a forma; motor lê em `calcDano` via `bonusDanoDeclarativo`;
`tests/passiva.test.js` prova as 7 condições avaliáveis + escopo + falhas do validador. **Migrou ZERO reais:**
os 12 implementados têm passiva multi-parte (ogum/ra/sobek/brigid têm um clause `bonusDano` + outra metade
de outro gatilho), e migração é por DEUS INTEIRO — provado no sintético. Cobertura das 18 "+N condicional"
planas: **18/18 estrutural, 15/18 escrevíveis hoje**; as 3 (babi=`medo`→F1.4, horus=`alvoMarca`→vulnerabilidade,
tsukuyomi=`alvoCuradoAntes`→rastreio) esperam uma TAG que a fase própria delas introduz — o validador as
recusa em voz alta, sem exceção aberta. Nenhuma das 3 pede chave NOVA de condição = vocabulário completo.

**ORDEM do resto da Fase 1 (renumerada com a tabela na mão; SUBSTITUI as numerações anteriores de F1.3+):**
- **F1.2** passiva declarativa (esta; a decisão-mãe, várias sessões)
- **F1.3** Bloco 1 — morte e sobrevivência. Dentro: **PISO DE 1 HP PRIMEIRO, execução depois** (o Shiva fura
  o piso explicitamente → o piso precisa existir como estado real antes de a execução decidir se respeita ou fura).
- **F1.4** Bloco 2 — controle e vocabulário (Selado≡Silenciado, Pacificar, Torpor, Medo, trava-Milagre,
  redirecionar). Tudo motor, tudo junto.
- **F1.5** Bloco 3 — modos, estado e escolha múltipla.
- **F1.6** arena de auto-jogo.
- **F1.7+** lotes de kit, por panteão.

## 37. Bloco de 16 decisões da Fase 1 — batidas pelo dono (para F1.3/F1.4/F1.5)

**LIÇÃO A (segunda vez o mesmo padrão em duas sessões — vira regra).** Ao fechar o vocabulário da F1.2
sessão 1, o "+N condicional (38)" se revelou NÃO uma forma, e sim nove: o rótulo agrupava por SINTOMA
(+N de dano) e não por MECANISMO (o que a condição LÊ). Fechar contra os 4 deuses migrados teria perdido
elemento, HP, buff, marca, controle e fase — o cenário do tier B. É a mesma classe de erro do §35 (medir
a dimensão errada). **Regra: antes de fechar um conjunto, verifique se o rótulo descreve um MECANISMO ou
uma APARÊNCIA.** O 18 verdadeiro vale mais que o 38 falso, porque é verdadeiro.

**LIÇÃO B (a regra contrariou quem a escreveu — é assim que se sabe que ela segura algo).** Na mesma
mensagem, o dono BATEU a regra "migração é por DEUS INTEIRO" (decisão 2) e ela CANCELOU o item que ele
tinha APROVADO uma frase antes ("migrar os 3": ogum/ra/sobek). Os três são multi-parte; migrar a metade
`bonusDano` deixaria um `if (u.key===...)` invisível num deus que a documentação diria migrado. Registrado
de propósito: **uma regra que nunca contraria o próprio autor não está segurando nada.** O valor de uma
invariante aparece justamente quando ela veta uma vontade — inclusive a de quem a escreveu.

**LIÇÃO C (padrão CONSOLIDADO, não caso isolado): varra a FAMÍLIA INTEIRA antes de fechar, não os poucos
que vai migrar.** CINCO vezes seguidas isso evitou o tier B ou corrigiu um número que eu ia usar para planejar:
(1) o "+N condicional" eram 9 formas, não 1 (fechar nos 4 migrados perderia elemento/HP/buff/marca/fase);
(2) a auditoria de cobertura achou 6 furos onde eu supunha rede; (3) o gatilho `reducao` — ao varrer as ~15
passivas de redução, o eixo se revelou MÚLTIPLO (slot/classe/elemento-negado/fase/paridade/contador/contagem/
elemento-do-receptor), abri só `slot`; (4) a família por-turno eram 3 formas distintas (todo-turno/abertura/
a-cada-N), 3 gatilhos nomeados, não um eixo temporal; (5) o gatilho `imunidade` — o balde "27 imunidades
estáticas" era **2,25× maior que a família real**: somava imunidade (12) + redução (já migrada, sessão 3) +
anti-revive (6, outra família) + condicionais (2, outra família). Eu ia planejar "maior que tudo que a F1.2
fez" a partir de 27; a família real é 12, uma sessão. Já não é sorte: **antes de fechar qualquer conjunto/
vocabulário, a varredura da família inteira é obrigatória** — o custo dela é sempre menor que o de uma exceção
(ou de um plano) descoberto errado num lote distante.

**O detalhe que faz a lição funcionar:** não foi prudência genérica. A varredura acertou nas cinco vezes
porque foi feita contra o **CONJUNTO INTEIRO**, não contra os casos em mãos. Varrer só os que eu ia migrar
teria falhado em todas (fecharia no debuff/defesa do sobek e perderia elemento/HP/marca; confirmaria "ogum/tyr
têm suíte" sem ver que era da habilidade; fecharia o `reducao` no slot do sobek; e contaria 2 imunidades — as
da cuca/nezha — em vez de ver que a família são 12 e o balde somava 27). **É a diferença entre varrer e varrer
o SUFICIENTE** — a família toda, não a amostra que a
tarefa colocou na frente.

Respondidas em bloco. Guardadas porque uma sessão sem memória vai implementá-las meses depois. Onde
minha recomendação foi mantida, registro curto; onde o dono a VIROU, registro o argumento dele.

**Bloco 1 — Morte & sobrevivência (F1.3):**
1. Piso "não cai abaixo de 1 HP" = estado temporário; DoT e dano normal RESPEITAM; execução e efeitos
   marcados `ignoraPiso` FURAM. (Shiva fura explicitamente → o piso tem de existir como estado real.)
2. Execução por limiar de HP FURA o piso.
3. Execução × imunidade-a-revive: ORTOGONAIS. Execução mata; "não revive" é marca separada aplicada no ato.
4. **Execução FURA `vidaExtra` (o dono VIROU minha recomendação).** `vidaExtra` interceptando execução
   esvaziaria a família: 7 kits pagam custo alto por um limiar de HP, e a Bastet com Sete Vidas anularia
   todos os 7, sete vezes. Execução furar é o que a torna resposta a tanque. E o próprio dado confirma:
   Sun Wukong tem imunidade DEDICADA a execução — se `vidaExtra` já protegesse, a imunidade dele seria
   redundante, e kits não carregam redundância assim.
5. Execução temporizada (Livro/Morrigan): a marca é debuff removível por `cleanse`; removida antes do fim,
   não executa; a checagem roda no `fimTurno`.

**Bloco 2 — Controle & vocabulário (F1.4):**
6. Selado ≡ Silenciado = "só Básico" → um único tipo `selado`; "Silenciado (só Básico)" na prosa é
   normalizado para ele. `silenceClass` (Zeus, trava por CLASSE) fica separado.
7. **Pacificar NÃO zera cura.** Zera só o dano das ações do alvo; travar cura junto seria dois controles no
   preço de um — travar cura é `noHeal`, que já existe e é outro efeito.
8. **Torpor dispara POR AÇÃO, não por turno.** Hoje coincidem (o alvo age 1×/turno), mas "por turno" viraria
   teto acidental se um kit conceder ação extra — e a Cuca já tem "Básico grátis a cada 3 turnos", o
   precedente existe. Declarar por ação fica correto sozinho quando o caso aparecer.
9. Medo = composto declarativo (`dmgDown` + trava-Milagre) com tag `medo` para imunidade (Guan Yu/Durga).
10. Trava-Milagre = `lockSkill` com `slot: 'milagre'`.
11. Redirecionar single-target tem PRECEDÊNCIA sobre `taunt`.

**Bloco 3 — Modos, estado & escolha (F1.5):**
12. A escolha chega ao motor via parâmetro `escolha` (array de índices, cobre o 2-de-5 da Nüwa), validado
    contra `ab.opcoes`.
13. Modo `alterna` NÃO reseta na morte; persiste a partida toda; a UI mostra o PRÓXIMO modo.
14. Dia/Noite são mutuamente exclusivos (um só `st.fase`; ativar um remove o outro); ler estendido a cura,
    buff, duração de controle e orbe.
15. Invocação = pseudo-unidade alvoável (área a atinge); NÃO gera orbe, NÃO conta para vitória, NÃO é
    revivível; some ao expirar. Iansã "destrói invocações" = remove todas.
16. **A escolha é feita AO ARMAR, com commit num 2º gesto (invariante 13 — tocar nunca gasta).** Fluxo:
    toca a habilidade → aparece a escolha → escolhe → CONFIRMAR resolve; cancelar em qualquer ponto não
    gasta nada. Igual a alvo e igual à troca de energia.

## 38. CARACTERIZAR ANTES DE MIGRAR — a rede tem de existir antes de se confiar nela (F1.2)

**CHECKLIST de migração (cresce com o que cada sessão ensina):**
1. A passiva tem asserção que cobre o comportamento ESPECÍFICO? Se não, caracterizar ANTES (não supor).
2. Magnitude E escopo EXATOS, os dois lados de cada condição (o erro da Hera: afirmar existência ≠ valor).
3. Hardcode diverge da prosa? Prosa vence (§39) — registrar e trazer ao dono; não perpetuar a folga.
4. **Quando o hardcode consome RNG, PROVE que o declarativo consome o MESMO fluxo** (sessão 4: `sortearElemento`
   == o `rng` inline do `orbGain`, mesmo nº de chamadas). Se divergirem, a suíte passa mas a ARENA começa a
   produzir resultado diferente do relatório anterior, e ninguém liga a causa. É migração fiel vs aproximada.
5. Ao fim: `grep "key === '<deus>'"` vazio no motor + placar TERMINADOS atualizado.
6. **SANIDADE DE AMBIENTE (antes de tocar em código):** se o código contradiz o que o ESTADO.md/§ diz que já
   foi feito — um hardcode "de volta", um marker ausente, um deus já migrado que aparece cru — NÃO corrija o
   sintoma. Verifique `git log --oneline -1` e `git log origin/<branch> -1`; se o HEAD local está atrás,
   `git fetch && git reset --hard origin/<branch>` e reconfira. Duas vezes nesta jornada o container
   reprovisionou num commit velho (clone fresco atrasado), e as duas vezes o sintoma foi "a Nezha/o deus X
   voltou a ter hardcode". "Corrigir" teria reescrito trabalho já pronto e criado divergência com o origin. O
   ESTADO.md é a fonte da verdade do que foi feito; o working tree pode estar mentindo.

**PROCEDIMENTO DE COMMIT (dono, F1.2.5 — o revert do container mudou de categoria):** o 5º revert reprovisionou
o repo ENTRE o teste verde e o commit, apagando edições NÃO-commitadas do disco; o commit seguinte capturou o
motor estale (lixo). O §38 recupera trabalho COMMITADO, não edição no disco. Então a ordem inverte — commitar
ANTES de testar o pesado:
1. Commite cada bloco na MENOR UNIDADE QUE MANTÉM A SUÍTE VERDE (não a menor que compila), sem esperar a suíte
   lenta. **Quando uma mudança de motor EXIGE uma migração de teste para a suíte passar (ex.: `fase`→`estado`
   quebrou o teste que usava `quando:{fase}`), as duas vão no MESMO commit** — separá-las produz vermelho
   garantido no histórico. O bloco continua pequeno o bastante para proteger do revert.
2. Verifique `git rev-parse --short HEAD` contra origin IMEDIATAMENTE antes de cada commit (se divergiu, `reset --hard origin` e reaplique).
3. A suíte completa roda DEPOIS, sobre o COMMIT; se apontar algo, corrige em commit novo (fix-forward).
4. NUNCA deixe edição no disco durante espera longa em background (é quando o revert bate).
A rede de testes continua sendo a garantia — só passa a rodar sobre commit em vez de sobre disco. Commits
ruidosos são baratos; refazer edição inteira não é, e commit pequeno é mais fácil de revisar/reverter. (Investigar
por que o container reprovisiona: decisão do dono — é ambiente, provável fora de alcance, custo alto p/ ganho incerto.)

**COROLÁRIO (F1.7, o dono — "mostrar antes de commitar" é instrução RUIM neste ambiente):** pediram para eu mostrar
a captura ANTES de commitar as partes 1-2 da arte; segurei o commit, o container reverteu na janela, e o trabalho
não-commitado sumiu (tive de refazer). A ordem correta é **COMMITE E DEPOIS MOSTRE**: o que está no origin não some, o
dono revisa igual, e se quiser algo diferente eu corrijo em commit novo (o fix-forward do item 3). "Mostrar antes de
commitar" cria exatamente a janela que o §38 fecha. **Não repetir a instrução — nem quando o dono a pedir; commitar
primeiro é o certo mesmo contra o pedido, porque o revert não respeita a intenção.**

**COROLÁRIO 2 (F1.8 — `| head` MASCARA o exit code do teste):** verifiquei o commit com
`npm test 2>&1 | grep ... | head -2 && git commit`. O `head` fecha o pipe cedo (SIGPIPE) e o STATUS do pipeline vira o
do `head` (0), NÃO o do `npm test` — então o `&& git commit` roda mesmo com a suíte VERMELHA. **Correção honesta do que
de fato ocorreu (o git log é a fonte, não a minha memória):** eu ESCREVI que tinha commitado Aquiles+Perseu quebrados
no origin; conferindo com `git show`, o Perseu (cadcde7) está LIMPO e passou no CI, e nenhum commit do Aquiles existe no
histórico. O que realmente aconteceu: a colisão `FUNCOES` (const do motor × const da ui no concat) + nomes inventados
viveram só no meu WORKING TREE; a tentativa de commit do Aquiles NÃO chegou ao origin porque o `node tools/build.js` no
início da MESMA linha de comando falhou no concat e cortou o `&&` antes do commit. **Ou seja: o `| head` teria deixado
passar, mas um OUTRO elo (o build no `&&`) segurou.** Não confiar nisso: **o gate de commit tem de ler o EXIT CODE do
teste, nunca texto grepado.** Rode `npm test; [ $? = 0 ] && git commit` (ou `set -o pipefail`); para inspeção use `grep`
SEM `head` (ou `tail`, que não fecha o pipe). Filtro de leitura ≠ gate de decisão — o gate é o código de saída. (E a
lição do §38 original de novo: relatar pelo git log, não pela memória — eu overstatei "quebrado no origin" sem conferir.)

**LIÇÃO (o furo veio de um adjetivo impreciso do dono, achado uma sessão depois):** a 1ª versão dizia "bloco
COERENTE", e "coerente" não é verificável — engine+validador sem o teste migrado É coerente como feature, mas
quebra a suíte. "Verde" é verificável; "coerente" é interpretação. **Critério de procedimento tem de ser TESTÁVEL,
senão vira interpretação e cada um decide um limite diferente.** (E: deixar o commit vermelho transitório no
histórico e AVISAR, em vez de reescrever para esconder — histórico honesto vale mais que histórico bonito.)

Quando a passiva de um deus vira dado, a suíte que o cobre deixa de provar "o hardcode funciona" e passa a
provar "o dado REPRODUZ o hardcode" — é a rede de equivalência. Mas a regra "não altere as suítes dos 12"
pressupõe que essa rede EXISTE, e a varredura mostrou que não existe em todo lugar: o **Rá não tinha
asserção da passiva**, e ao migrar o `danoIrredutivel` descobri que o **Ogum também não** (a única suíte
dele testava a habilidade destroyShield, não a passiva +10/irredutível). Migrar ali seria trocar hardcode
por dado sem nada provando equivalência.

**Regra:** antes de migrar um deus sem asserção da passiva, ESCREVER a caracterização primeiro (assertar o
comportamento atual do hardcode), rodá-la verde, e só então migrar — a mesma suíte então prova que o dado
reproduz o hardcode. **Distinção explícita, senão alguém lê "não toque nas suítes" e paralisa:**
ACRESCENTAR cobertura que faltava ≠ ALTERAR uma asserção existente. A primeira é construir a rede; a segunda
seria mudar o alvo. Só a segunda é proibida. (Antes da F1.2 sessão 3, escrever as caracterizações de ra,
thor e fujin — prefiro a rede completa antes de precisar dela a achar outro furo no meio de uma migração.)

**EXCEÇÃO DECLARADA (dono) — a única em que alterar uma asserção existente é permitido:** corrigir uma
divergência prosa-hardcode (§39). Quando a prosa vence e o hardcode largo é estreitado, a caracterização que
travava o comportamento largo TEM de mudar para travar o estreito — isso é corrigir o alvo, não mudá-lo por
conveniência. **"Corrigir divergência prosa-hardcode" é motivo válido; "fazer a suíte passar" NUNCA é.** Ao
fazer, mostrar o diff das asserções linha a linha. (Nesta sessão a exceção NÃO precisou ser usada: as
correções de nezha/brigid eram invisíveis à suíte — nenhuma asserção existente travava o comportamento largo,
então nada mudou; só a caracterização NOVA já nasceu no escopo estreito.)

**Métrica que passa a ser acompanhada:** deuses TERMINADOS (passiva 100% declarativa, zero hardcode),
não "quantos gatilhos existem". Verificável: `grep "key === '<deus>'"` vazio no motor + suíte verde.
Placar vivo em `docs/passivas.md`. Hoje: **3/12** — ogum, tyr (sessão 2) e fujin (inerte, sem hardcode; a
passiva não funciona pois depende do Raijin — decisão aberta desde a Fase 0, volta na F1.8).

**Auditoria dos 9 (antes de escrever a rede):** 1 SIM (thor), 2 PARCIAL (hera só afirmava que o escudo
APARECE, não que é 10; nezha só cobria o revive, não a imunidade), 6 NÃO. Maioria descoberta → a tarefa de
rede se partiu em dois lotes. **Lote A escrito** (sobek, hera, nezha, ra — 6 cláusulas, magnitude E escopo
exatos, verde contra o hardcode; nenhuma migração). Falta o **Lote B**: brigid, cuca, ganesha, zeus.

## 39. Terceiro tipo de furo: o HARDCODE faz MAIS do que a prosa promete (achado ao caracterizar o Lote A)

Além de (1) rótulo por sintoma e (2) teste que existe mas não cobre, um terceiro: o motor implementa MAIS
do que o kit descreve. Dois casos achados ao escrever a rede:
- **nezha — imunidade larga demais.** `aplicarDot` bloqueia TODO DoT para a Nezha (qualquer `nome`), mas a
  prosa diz "imune a Veneno e Queimadura". Hoje coincidem (só existe `queimadura`); quando um 3º DoT entrar
  (ex.: sangramento), a Nezha ficaria imune a ele DE GRAÇA, sem o kit prometer. Ao migrar, a passiva
  declarativa deve listar os DoTs imunizados (veneno, queimadura), não "todos" — senão herda a folga.
- **brigid — condição larga demais.** O +5 de cura dispara se ALGUÉM no campo (qualquer lado) tem
  queimadura (`alguemQueima` varre os dois lados), mas a prosa diz "se algum INIMIGO estiver com Queimadura".
  Uma queimadura num ALIADO hoje já ativa o bônus. Ao migrar a Brigid (Lote B), a caracterização tem de
  travar o escopo CORRETO (inimigo) — e aí é decisão do dono: a rede prova o hardcode atual (largo) ou a
  prosa (estreito)? Se divergem, é mudança de comportamento, não de forma — PARAR e perguntar.

**LIÇÃO do terceiro tipo:** caracterizar NÃO é só travar o que o código faz — é COMPARAR o que ele faz com o
que ele PROMETEU (a prosa). Onde divergem, o hardcode ganhou comportamento que ninguém decidiu. O da Nezha
não se acha lendo, testando ou jogando: aparece meses depois num lote distante (o 3º DoT) e ninguém liga a
causa. A caracterização o expôs porque forçou olhar o ESCOPO do hardcode em vez de confirmar que ele funciona.

**REGRA GERAL (dono):** quando hardcode e prosa divergem, **a PROSA VENCE** — ela foi revisada, está na
planilha, e é o que o jogador leu ao desbloquear o deus. Hardcode divergente é BUG, não recurso. Se um caso
futuro parecer exceção, PARAR e perguntar em vez de assumir.

**RESOLUÇÃO (dono decidiu as duas; corrigidas nesta sessão):**
- **Nezha → lista [veneno, queimadura]**, não "todos". Imunidade larga é vantagem que ninguém concedeu e que
  CRESCE SOZINHA a cada DoT novo (a pior dívida). Corrigido em `aplicarDot`; caracterização prova que um DoT
  fora da lista (sangramento) NÃO é bloqueado.
- **Brigid → "inimigo"**, não qualquer lado. Com o escopo largo, a própria Brigid queimando um aliado ativaria
  o bônus de cura dela — sinergia acidental na curandeira que mais jogador novo usa. Corrigido em `curar`.
- **Impacto no jogo hoje: nenhum.** Entre os 12, só Brigid e Nezha aplicam queimadura, e ambas em INIMIGOS
  (`alvo:inimigo`/`todosInimigos`) — nenhum kit consegue queimar um aliado, então o caso divergente é
  inalcançável e a suíte seguiu verde sem uma asserção mudar. A correção só passa a importar quando existir
  um kit que queime o próprio time. Registrado porque a folga estava LÁ, latente.

---

## 40. Caracterizar efeito que reage à PRÓPRIA morte trava ORDEM, não só magnitude/escopo (F1.2, sessão 7)

Todas as migrações até aqui caracterizaram *quanto* e *sobre quem* (magnitude + escopo). A Nezha é o primeiro
caso em que o efeito reage à **morte do próprio sujeito** (revive) — e aí magnitude/escopo não bastam, porque o
comportamento certo depende de QUANDO e EM QUE ORDEM, coisas que uma asserção de valor final não pega. O revive
"48 HP" está certo em magnitude e ainda assim pode estar errado se disparar no turno errado, antes da limpeza,
ou uma segunda vez. Quatro travas de ORDEM, verdes contra o hardcode ANTES de migrar:

1. **Pós-limpeza:** renasce DEPOIS de `alvo.efeitos = []` — 48 HP e SEM os efeitos que tinha ao cair. (Se
   revivesse antes, herdaria os DoTs que o mataram.)
2. **Vitória adiada:** a queda-pendente NÃO conta para derrota — `checarFim` trata `pendenteRenascer` como
   "ainda em jogo". Time todo caído com a Nezha pendente não perde até ela renascer ou o revive esgotar.
3. **Uma vez:** guarda `!renasceu` — cai, renasce, cai de novo → não renasce a 2ª. Travado dos DOIS lados
   (renasce na 1ª, NÃO renasce na 2ª).
4. **Turno seguinte:** o revive dispara em `iniciarTurno` do lado dela, não no `matar` — `pendenteRenascer`
   separa a marcação (no `aoCair`) da execução (no início do turno).

**Resultado nesta sessão: nenhuma das 4 divergiu da prosa** ("retorna no turno seguinte com 48 de HP, 1× por
partida"). Diferente do §39 (a imunidade larga da Nezha, que DIVERGIA): ali o hardcode fazia mais que a prosa;
aqui bate. Registro os dois juntos porque são a mesma disciplina em resultados opostos — caracterizar é comparar
com a prosa, e o resultado tanto pode ser "diverge, PARAR" (§39) quanto "confere, seguir" (§40). O que muda é o
que se OLHA: para um efeito auto-reativo, olhar só o número esconde os três erros de ordem que não aparecem no
valor final. Mecanismo migrado com `reviveProximoTurno` (faz-only, guarda `!vivo && !renasceu` em `rodarFaz`) +
`AOCAIR_QUEM` ganhando `'self'`; o revive-HP virou parâmetro (`reviveHp`) reusável pelo Bennu (60). **Placar
8→9/12.**

---

## 41. `bonusCura` é gatilho PRÓPRIO (não campo do bonusDano); a cura tem eixo de condição próprio (F1.2, sessão 8)

Migração da Brigid (deus inteiro, duas cláusulas). O dono pediu a varredura da família de cura ANTES da forma,
com três perguntas. As respostas:

**Q3 — quantas passivas de cura existem (o número decide a forma).** A varredura dos 100 (aba "Kits NA" da
planilha) acha **20 que MENCIONAM cura** — mas isso é balde, não família, exatamente como os "27" da imunidade
(§37, 5º caso). Categorizado por MECANISMO:
- **A. "curas curam +N" (bonusCura próprio, soma à MAGNITUDE): 7** — Hel, Nefertem, Dagda, Brigid, Cernunnos,
  Chaac, Itzamná.
- **B. cura PLANA disparada por gatilho (`faz` heal, NÃO bonusCura): 9** — Hades/Kali/Morrigan/Ah Puch (aoCair
  inimigo), Ymir (aoCair self), Khnum (aoCair aliado), Deméter/Shuten (porTurno), Boitatá (reativa/onHit).
- **C. "aliado curado causa +N dano" (bonusDano disparado por ter sido curado): 2** — Freyja, Oxum (é a condição
  `alvoCuradoAntes`, já RESERVADA em `quando`).
- **D. cura como gatilho de outra coisa / piso: 3** — Hera (aoCurar→escudo), Dagda-2ª (piso), Tsukuyomi
  (bonusDano vs curado).

Sexta vez que varrer o CONJUNTO INTEIRO corrige um número: **20 vira 7**. E o achado paralelo é maior que a
pergunta: a categoria **B (9) é maior que o próprio bonusCura (7)** e é a mesma lição do `faz:[fx]` do Rá — a
cura importa mais como EFEITO EMBRULHADO por outro gatilho do que como escalar. Destrava-se adicionando um `heal`
a `V.fxTurno`/`faz` (F1.x), não mexendo em bonusCura. Registrado como propriedade da família.

**Q1 — o `quando` do bonusDano serve, ou a cura pede eixo próprio?** Pede eixo próprio, como o `contra` da
sessão 3. As 9 chaves de `quando` são todas indexadas nos participantes de um ATAQUE (`atk`, `alvo`-de-golpe). A
cura não tem ataque: não há atacante nem alvo-de-golpe. Das 7 do grupo A, 5 têm condição e NENHUMA mapeia em
`quando`: paridade de turno (Hel), facção do CURADOR (Nefertem), tipo=regeneração (Cernunnos/Chaac), e a da
Brigid — "existe INIMIGO com Queimadura", que é estado de LADO, não `alvoDebuff` do alvo de um golpe. Terceiro
eixo: **`quandoCura`** (sessão 7 abre só `inimigoTem`; cresce por deus). Reusar `quando` repetiria o erro que a
sessão 3 corrigiu (misturar eixos de contexto diferentes num vocabulário só).

**Forma decidida: gatilho próprio `bonusCura`,** por três razões independentes — (1) caminho de valor diferente
(soma dentro de `curar`, não de `bonusDano`); (2) evento diferente (`cura`, não `dano`); (3) eixo de condição
disjunto (`quandoCura`). Um campo do bonusDano teria de carregar as três divergências — seria sobrecarga, não
economia. 7 membros é família povoada (mesmo porte de bonusDano/reducao), então não é over-engineering.

**Q2 — duas cláusulas, migração inteira.** +5 de dano ao time = `{bonusDano, v:5, escopo:'time'}` (o
`bonusDanoDeclarativo` já pulava unidade morta → some com a Brigid, idêntico ao hardcode). Cura condicional =
`{bonusCura, v:5, quandoCura:{inimigoTem:'queimadura'}}`. Caracterização Lote B (ambas, incl. o §39 "só inimigo")
verde SEM alteração; `grep key==='brigid'` vazio. Consumo de RNG: nenhuma das duas sorteia (§38, item RNG OK).

**Nota "permanente" (não-bloqueante).** A prosa da 1ª cláusula diz "+5 (permanente)". Li como "não expira por
turno" (contraste com buff temporário), NÃO "sobrevive à morte da Brigid" — o hardcode sempre exigiu Brigid viva
(igual a toda aura de time, ex.: thor −6), e a migração preserva isso. Se o dono quis dizer survives-death, é
mudança de comportamento (§39, prosa vence) — mas aí me avise, porque hoje diverge do implementado. **Placar
9→10/12.**

---

## 42. Propriedade TRANSVERSAL: um conceito que aparece mais como EFEITO de gatilho que como gatilho próprio tem família menor que o balde (F1.2)

Generalização do achado da sessão 8 (cura: balde 20, família 7, porque 9 eram cura-EMBRULHADA em outro gatilho).
Não é sobre cura — é sobre como contar famílias. **Quando um conceito aparece no texto dos kits mais como
PAYLOAD de um gatilho do que como o gatilho em si, a família própria dele é menor do que a varredura ingênua
sugere, e o resto pertence a `faz` (ou ao payload de outro gatilho).** Já aconteceu três vezes:
- **Cura:** 20 mencionam, 7 são `bonusCura`; 9 são `faz` heal (aoCair/porTurno/onHit). §41.
- **Contador (Cauda, Disco, Podridão…):** poucos são "o contador É a passiva"; a maioria é `faz:[{contador}]`
  disparado por turno/cadência (ra, kitsune). O contador é primitiva de payload, não gatilho.
- **Orbe:** ninguém tem "gatilho orbe"; orbe é sempre `faz:[{orbGain}]` de porTurno/abertura/aoCair (ganesha,
  zeus, inari).

**Consequência para a varredura:** ao fechar um eixo, separar SEMPRE "quantos têm isto como o gatilho" de
"quantos têm isto como efeito embrulhado". O segundo grupo não dimensiona o gatilho — dimensiona o vocabulário
de `faz`. Contar os dois juntos infla o gatilho e esconde que o trabalho real está no wrapper. É por que a
sessão 4 registrou "o gatilho de turno EMBRULHA um efeito": o wrapper é onde mora a alavanca, não o escalar.

---

## 43. `aCadaN` — cadência ABSOLUTA com payload POLIMÓRFICO (faz OU custoGratis); a Cuca não é `faz:[fx]` (F1.2, sessão 9)

Migração da Cuca (deus inteiro: imunidade + aCadaN). Varredura dos quatro da família (inari, kitsune, cuca,
boto), nos DOIS eixos que o dono pediu.

**Eixo A — n ABSOLUTO ou RELATIVO? Todos ABSOLUTOS. Fechado absoluto.** Os quatro dizem "a cada N turnos" sem
NENHUMA linguagem relativa ("desde que entrou", "após o último uso"). Três provas convergentes: (1) a Cuca é
`st.turno % 3` no motor (confirmado); (2) a prosa é uniforme, sem cláusula relativa; (3) num 3v3 todos entram no
turno 1 (não há entrada em campo no meio — invocações são unidades `__inv` à parte), então "desde a entrada" ≡
absoluto por construção. A dúvida que o docs tinha anotado (kitsune/boto poderiam ser relativos) NÃO se
materializa no texto. `turno % n === 0`, `n` absoluto sobre o contador global de rodadas (`st.turno`).

**A prova (3) é ESTRUTURAL e vale para QUALQUER dúvida futura de cadência (registrar).** As provas (1) e (2) são
leitura de código e de prosa — evidência, mas contestável (um kit futuro pode ter prosa relativa). A (3) fecha a
questão de um jeito que nenhuma leitura fecharia: **num 3v3 sem entrada em campo no meio da partida, "desde a
entrada" e "absoluto desde o turno 1" são o MESMO ponto de partida para todos — coincidem por construção, não por
coincidência.** Relativo-vs-absoluto só pode DIVERGIR se (a) unidades entrarem em turnos diferentes, ou (b) a
cadência puder ser pausada/pulada (morto/silenciado quando deveria disparar). Enquanto nenhuma das duas existir,
a distinção é vazia e absoluto é a única forma. Quando uma delas entrar (invocações que contam cadência própria;
uma cadência que pula turno morto), aí sim relativo passa a ser um comportamento distinto — e é o gatilho de
`n` que terá de dizer qual. Antes disso, não inventar o eixo.

**Eixo B — o que cada um FAZ? 3 são `faz:[fx]`, a Cuca é a EXCEÇÃO.** Inari (orbGain), Kitsune (contador Cauda),
Boto (apply Inalvejável self) são efeitos disparados — `faz`, o mesmo molde do porTurno. **A Cuca não:** "Básico
de graça" é MODIFICAÇÃO DE CUSTO que vale no turno, lida em `acoesDe` no momento da ação — não é um efeito que
dispara e altera estado. É exatamente o que o dono previu no ponto 3: forçar a Cuca no molde `faz:[fx]` seria
inventar um "fx que não faz nada mas muda custo". Não forcei.

**Forma: `aCadaN` é UM gatilho (cadência `n` absoluta) com payload POLIMÓRFICO** — `faz` (efeito, para os 3
futuros) XOR `custoGratis` (modificação de custo, para a Cuca). A cadência é genuinamente compartilhada pelos
quatro; só o payload varia. Um gatilho separado só para a Cuca DUPLICARIA a lógica de cadência. O validador
exige EXATAMENTE um payload (nunca os dois, nunca nenhum). `custoGratis: { slot }` zera o custo daquele slot; a
Cuca é `{ n:3, custoGratis:{ slot:'basico' } }`. Esta sessão implementa `n` + `custoGratis` (o que a Cuca usa);
o payload `faz` de aCadaN entra quando inari/kitsune/boto migrarem (reusa `rodarFaz` sob a guarda de cadência).
Nota: `aCadaN` com n=1 seria o porTurno; o validador recusa n<2 para não haver duas formas do mesmo gatilho.

**Migração inteira:** imunidade (`a:['adormecido']`, some o hardcode do `aplicar`) + aCadaN (some o hardcode do
`acoesDe`). Caracterização Lote B (imune a Dormir só a Cuca; Básico grátis no turno 3, custa no turno 4, só o
Básico, só a Cuca) verde SEM alteração; `grep key==='cuca'` vazio; suíte inteira verde. RNG: nenhuma sorteia
(§38). **Placar 10→11/12.** Falta 1: hera (`reativa`).

---

## 44. `reativa` é BALDE, não gatilho — família de 6 ganchos por EVENTO; só `aoCurar` (Hera) agora (F1.2, sessão 10)

Última migração da F1.2 (fecha 12/12). O dono suspeitava que "reativa" fosse balde por ser NOME DE CATEGORIA,
não de mecanismo — confirmado. As 10 "reativas" da varredura original classificadas por GATILHO REAL (reage a
QUÊ, e onde no motor):

| deus | reage a | gatilho real | onde |
|---|---|---|---|
| Zeus | morte de inimigo | **aoCair** quem:inimigo | `matar` — **JÁ FEITO (sessão 6)** |
| Erínias | morte de aliado | aoCair quem:aliado | `matar` (futuro) |
| Ymir | própria morte | aoCair quem:self | `matar` (futuro) |
| Nüwa | morte de aliado | aoCair quem:aliado | `matar` (futuro) |
| **Hera** | **cura de aliado** | **aoCurar** | `curar` — **esta sessão** |
| Bragi | uso de Milagre por aliado | aoUsarHabilidade | resolução de ação (futuro) |
| Khonshu | controle iminente em aliado | aoReceberControle (anula 1×) | `aplicar` (futuro) |
| Boitatá | ser atingida (Chama) | aoSerAtingido | `bater` recebido (futuro) |
| Xangô | aliado ser atingido | aoSerAtingido | `bater` recebido (futuro) |
| Cernunnos | próprio ataque | aoAtacar | `bater` desferido (futuro) |

**"reativa" = 6 ganchos distintos, cada um num lugar diferente do motor** (aoCair, aoCurar, aoUsarHabilidade,
aoReceberControle, aoSerAtingido, aoAtacar). NÃO é um gatilho — é uma FAMÍLIA de gatilhos, como o dono previu.
E **4 das 10 nem são novas**: são `aoCair` (morte), o gatilho da sessão 6 — só faltam sujeitos (`aliado`/`self`).
Como nos sujeitos do aoCair, abro só o da Hera agora e deixo cada gancho para o deus dele. Sexto balde que a
varredura do conjunto corrige (§37): "reativa" contava 10, mas o gatilho novo desta sessão cobre **1**.

**bonusCura vs aoCurar — dois mecanismos, confirmado.** `bonusCura` (sessão 8) MODIFICA a magnitude da cura
(soma `+v` dentro de `curar`, antes do clamp). `aoCurar` DISPARA um efeito DEPOIS da cura (Hera: escudo +10),
independente de quanto curou. Posição no código diferente, evento diferente (`escudo` ≠ `cura`), semântica de
valor diferente. Não são o mesmo eixo.

**A Hera CABE como `faz` de `aoCurar` — é o gêmeo do `aoCair`, com UMA generalização.** Estruturalmente idêntico:
um evento entrega um SUJEITO e roda um `faz` nele. Mas o `aoCair` teve sorte — lá o reator É o dono (zeus ganha
orbe: dono=reator=alvo do efeito). Na Hera o efeito cai no CURADO (o sujeito do evento), que NÃO é o dono (a
Hera). Duas consequências que forçaram generalizar o `rodarFaz`: (1) o `faz` roda numa unidade ≠ dono (o curado);
(2) o evento tem de ser creditado ao DONO (`passiva:'hera'`) mesmo aplicando no curado — então `rodarFaz` ganhou
um `tagKey` opcional (default = a própria unidade; só o aoCurar o usa). Com isso, a Hera é
`{gatilho:'aoCurar', faz:[{t:'shield', v:10}]}` — sem mecanismo especial, só `faz` rodando no sujeito do evento.
`shield` entrou em `V.fxTurno` (é turno-seguro; o alvo é o sujeito do evento, não escolha do jogador). O
seletor "sujeito do evento" é implícito ao gatilho (como o reator do aoCair), não um campo `alvo`.

**Migração:** hardcode da Hera sai do `curar`. Caracterização Lote A (curado ganha EXATAMENTE 10 de escudo; só
o curado, não os outros nem a Hera; nada com a Hera morta) + o teste de capacidades (escudo nos 3, Ogum zera)
verdes SEM alteração; `grep key==='hera'` vazio; suíte inteira verde. RNG: nenhuma sorteia (§38). **Placar
11→12/12. A F1.2 FECHA:** as 12 passivas dos deuses implementados são 100% declarativas, zero `if (u.key===...)`
no motor. Restam ganchos abertos para deuses ainda não implementados (os 5 reativos futuros, sujeitos do aoCair,
`heal`/`apply` em `faz`, `aCadaN.faz`), mas nenhum deus implementado carrega hardcode de passiva.

**DISCIPLINA (dono, registrar): antes de criar um gatilho novo, TESTE se um existente serve com generalização
MÍNIMA — e se servir, generalize em vez de duplicar.** A Hera parecia pedir mecanismo próprio ("reage a cura,
dá escudo"); a pergunta certa não foi "que gatilho novo?" e sim "o `aoCair` (evento→sujeito→faz) serve?". Serve,
com duas linhas: o `faz` roda num sujeito ≠ dono, e o crédito vai no dono (`tagKey`). Reconhecer que a máquina
existente cobre o caso com ajuste pequeno é MAIS DIFÍCIL que construir algo próprio — construir é a saída
confortável (código novo, nome novo, sensação de progresso), mas cada gatilho novo é vocabulário que alguém tem
de manter e que pode divergir. A ordem: (1) mapear o caso ao gatilho mais próximo; (2) medir a generalização que
faltaria; (3) se for pequena e não borrar o significado do gatilho, generalizar; (4) só criar gatilho novo quando
a generalização mínima já distorceria o existente (foi o caso do `bonusCura` vs `bonusDano`: eixo, evento e
caminho de valor todos diferentes — aí duplicar seria errado, e criar é o certo). O `tagKey` da Hera é o exemplo
de (3); o `bonusCura` é o exemplo de (4). A disciplina é saber em qual dos dois se está.

---

## 45. `estado` é CAMPO UNIVERSAL (composa com o eixo), não 4º eixo — decidido PELOS DADOS (F1.2.5 s3)

A pergunta de forma tinha resposta EMPÍRICA, e por pouco não foi decidida por elegância antes da varredura:
`quando`/`contra`/`quandoCura` são eixos de UM gatilho cada (só-um-por-fx). O eixo de estado é transversal a
vários gatilhos — dúvida: 4º eixo irmão, ou campo que qualquer gatilho aceita ALÉM do seu eixo?

**Decidido pelos dados: campo universal.** A varredura achou TRÊS passivas que condicionam no GOLPE E no ESTADO
ao mesmo tempo — Bastet, Saci, Mnevis, todas o composto "primeiro ataque de alvo único por turno" (`alcance`
[golpe] + `primeiroPorTurno` [estado]). Um 4º eixo (só-um-por-fx) não expressaria isso; um campo universal
composa `contra:{alcance}` E `estado:{primeiroPorTurno}` no mesmo fx. Regra do dono: se ≥1 deus precisa das duas
juntas, a resposta é campo universal e a decisão está tomada — não por gosto. **A forma reflete a NATUREZA:**
transversal → campo ortogonal, não item na lista dos três. `estado` é permitido em TODO gatilho (no validador,
entra no conjunto base junto com `gatilho`), e cada gatilho compõe (AND) o seu eixo com ele.

**5 condições de LEITURA PURA abertas** (o motor só LÊ contra o dono do fx): `paridade` (turno%2, Hel), `fase`
(Dia/Noite — Amaterasu/Boto/Lugh/Itzamná), `aliadosVivos` {op,n} (Guan Yu), `contador` {nome,op,n} (Kitsune),
`hpProprio` {op,v} (Shuten). Composição provada no sintético: `contra:{classe}` + `estado:{paridade}` dispara SÓ
com as duas, falha nos 3 outros casos — a garantia que justifica campo universal em vez de 4º eixo.

**`fase` MIGROU do `quando` para o `estado`.** Ela entrou no `quando` na sessão 1 por ser o único eixo que
existia, não porque pertencia lá — fase é estado-de-campo, não propriedade do ataque. Migração completa, sem
retrocompatibilidade (custo real zero: só o Lugh a usa, não implementado); o validador RECUSA `quando:{fase}`
apontando para `estado:{fase}`, p/ quem escrever kit não errar por memória. Duas casas para a mesma condição é
semente de confusão.

**`primeiroPorTurno` RESERVADO** (recusado em voz alta) — as outras condições o motor LÊ; essa exige RASTREIO
(flag por-unidade resetado por turno). Misturar leitura e bookkeeping seria como forçar o `custoGratis` da Cuca
no `faz` (§43). **E os três donos dela (bastet/saci/mnevis) não são uma condição faltante — são TRÊS mecanismos:**
Bastet REDUZ, Saci ESQUIVA (o golpe falha), Mnevis INTERCEPTA. A sessão deles não é "abrir primeiroPorTurno" — é
esquiva + intercepta, com o `primeiro` como condição COMPARTILHADA. Registrado assim para a próxima varredura não
contar "falta 1 condição" quando faltam 3 mecanismos.

---

## 46. Sequenciamento: fase de EXTENSÃO por flip, fase de MECANISMO por BLOCO (F1.2.5 → F1.3+)

A F1.2.5 sequenciou por DESTRAVE (flip): as 3 extensões flipavam deuses baratos, e a curva do VERDE subia. Na
fase de MECANISMOS o critério INVERTE, e a re-triagem prova por quê: os topos do ranking têm **flip ZERO** —
execucao-hp trava 7 e não deixa NENHUM deus jogável sozinho, porque os deuses de morte são multi-gancho. Sequenciar
por flip aqui não produziria deus jogável nenhum até o fim do bloco. **Regra: fase de EXTENSÃO (gancho é uma chave
a mais num gatilho existente) sequencia-se por flip; fase de MECANISMO (gancho é subsistema novo) sequencia-se por
BLOCO — F1.3 morte inteira, F1.4 controle inteira — e os flips chegam no FIM do bloco.** E o topo do ranking (bonusDano-
escala, trava 10) é o mais provável BALDE (4 fontes de N): sequenciar pelo 10 cru repetiria as 3 projeções erradas.

**Passo 0 (os flips baratos que sobraram antes dos blocos) — a varredura reduziu de 4 para 2 fecháveis sem dúvida:**
- **aoUsarHabilidade** — FECHÁVEL. bragi/brahma/shiva, todos "quando um aliado usa um Milagre", payload = faz existente. Feito.
- **sinergia-nomeada** — CONFIRMADO que NÃO é gatilho, é CONDIÇÃO: "com Fulano no time" é um read de roster (`estado.aliadoPresente`)
  que compõe com efeitos existentes. Dissolveu do ranking. Feito (odin "2+ Nórdicos" é variante faccao-count, futura).
- **aoSerAtingido — DÚVIDA (separado).** medusa "quem a atinge com Física recebe Veneno" aplica um DEBUFF no ATACANTE —
  fura a garantia faz-BUFF (§F1.2.5 s1). E é mini-balde: medusa (self-atingido, debuff no atacante) ≠ xango (aliado-atingido,
  contador em si). Dois eixos de variação. Não forçar; entra com a decisão sobre "hook reativo pode aplicar debuff no sujeito".
- **bonusCura-cond-nova — DÚVIDA (separado).** Precisa de RASTREIO novo, não de chave: nefertem (facção do CURADOR — `curar`
  não sabe quem curou) e cernunnos/chaac (tipo=regeneração — `curar` não sabe a FONTE do heal). Duas formas, ambas exigindo
  passar contexto novo ao `curar`. Não é "mais uma chave de quandoCura".
- **marca-vulnerabilidade — DÚVIDA (separado).** O "5" é EMARANHADO: mistura o EFEITO de-receber-mais (aquiles sofre +10,
  durga/erinias aplicam via habilidade) com bonusDano-OFENSIVO-vs-marcado (horus "+8 contra marcados" = precisa do `alvoMarca`
  reservado, coisa diferente). Não é um mecanismo só — varrer separando o efeito-vulnerável do alvoMarca antes de fechar.

**LIÇÃO (par, uma coisa só): o NOME do gancho não é evidência sobre TAMANHO nem sobre NATUREZA, em nenhuma direção.**
São a mesma armadilha em sentidos opostos: (a) balde — o nome sugere 1 mecanismo e são vários (reducao-cond 3-6,
faz-vocab, "escala 10"); (b) o reverso — o nome sugere extensão barata e é mecanismo (aoSerAtingido/bonusCura-cond/
marca-vuln do Passo 0). Nos dois casos, a contagem do gancho e a suposição de "é só mais uma chave" vêm do rótulo,
não da coisa. O antídoto é o mesmo: varrer a FAMÍLIA antes de fechar, e só flipar quando fecha sem dúvida — o critério
testável "família varrida + vocabulário fechável sem dúvida", nunca o nome.

**ENDEREÇO das três dúvidas (dono — vão para dentro dos blocos, não viram sessão própria):**
- **aoSerAtingido → F1.4 (controle).** A pergunta que levanta ("hook reativo pode aplicar debuff no atacante?") é de
  vocabulário de controle/aflição (Medusa aplica Veneno), e os reativos vizinhos (esquiva do Saci, intercepta do Mnevis)
  já estão marcados p/ lá. Uma decisão em vez de três.
- **bonusCura-cond-nova → DEPOIS dos dois blocos.** Precisa de contexto novo no `curar` (quem curou, qual a fonte);
  nenhum bloco depende dela; não trava deus de morte nem de controle.
- **marca-vulnerabilidade → varre junto do Horus.** Emaranhada com `alvoMarca` (condição ofensiva reservada desde a
  sessão 1); separar o efeito-vulnerável do alvoMarca só faz sentido com o dono na mão.

---

## 47. Execução é caminho PRÓPRIO à morte (não é dano): fura piso e vidaExtra, mas termina no `matar` comum (F1.3)

Varredura dos 7 kits de execução. **Limiares batem com o §26** (20→24 / 25→30, ×1.2 com a vida 100→120): hades/
fenrir/iara/lugh/morrigan = 24, ammit/izanami = 30. **Nenhum diverge — a F1.0c não passou por cima de nenhum.**

**Regra do dono: EXECUÇÃO FURA O PISO.** O vocabulário decide: o piso diz "não cai abaixo de 1 de HP" — é regra
sobre DANO; execução não causa dano, ELIMINA — operações diferentes. Prova: o Sun Wukong precisa de imunidade
DEDICADA a execução; se o piso já barrasse, seria redundante, e kits não carregam redundância (mesmo argumento
do `vidaExtra`). Logo execução **também fura o vidaExtra** — senão a imunidade dedicada seria redundante de novo.

**Forma (não é dano, é caminho próprio):** o `dmg` carrega `executaAbaixoDe:N`; APÓS o golpe, se `hp<=N`, chama
`matar` DIRETO — não reusa `bater`/`ignoraPiso` (isso seria "golpe que fura"; execução não é golpe). `matar`
ganhou `opts.execucao` (pula o vidaExtra, tagueia a queda com `execucao:true`).

**As 3 perguntas de borda (o dono usou p/ decidir se execução é tipo-de-dano ou mecanismo à parte) — respondidas
porque execução TERMINA no `matar` comum:**
1. **aoCair DISPARA** — a unidade caiu, seja por dano ou execução; o `matar` roda os aoCair.
2. **Matador ATRIBUÍDO** — `matar(st, atk, alvo)`, o executor é o matador.
3. **Zeus GANHA orbe por execução** — o aoCair-inimigo do Zeus roda no `matar`. Provado no sintético.
Ou seja: execução é mecanismo à parte na DECISÃO (elimina ignorando dano/piso/vidaExtra), mas compartilha a
CONSEQUÊNCIA (a morte comum). O melhor dos dois: não duplica a máquina de morte.

**imunidade-a-execução:** tag `'execucao'` em `IMUNIZAVEIS` (Sun Wukong: `imunidade a:['execucao']`). **Amplia o
§5** — é a PRIMEIRA imunidade-a-mecânica; cabe no gatilho imunidade como tag explícita (o coringa 'controle' não a
cobre, execução não é controle).

**A execução-hp é NÚCLEO uniforme + WRAPPERS por deus (o §46 de novo, até no "confiável"):** o núcleo (limiar →
elimina) é um só e está feito; mas cada deus o EMBRULHA diferente — condicional (izanami: amaldiçoados; iara:
Encharcados), por-status (ammit: Atordoado/Selado, sem limiar de HP), seletor (lugh: maior HP), timing (morrigan:
fim de turno). Plenamente coberto pelo `executaAbaixoDe` puro: **hades/fenrir** (fenrir → AMARELO). Os wrappers
viajam com os outros ganchos desses deuses. Registrado p/ a próxima varredura não achar "falta 1" quando falta o
wrapper de cada um.

---

## §48 — antirevive: o balde que o dono suspeitava, partido por SUJEITO (F1.3 morte 3/4)

O dono marcou antirevive como o mais suspeito de balde do bloco (trava 8, flip 1, stage 7). A varredura dos 8
(cerberus/ahpuch/ammit/anubis/hel/iansa/mimir/yanwong) confirmou: "não revive" é UM efeito aparente com **quatro
donos de SOURCE diferentes** — o mesmo lugar onde a varredura de morte já tinha partido baldes (o SUJEITO).

**As três perguntas do dono, respondidas pela prosa:**
1. **QUEM CARREGA A MARCA.** (a) **Prévia carregada pelo inimigo** (marcador que já existe e proíbe ao cair):
   hel (Marca da Morte=DoT), yanwong (Livro=efeito), ahpuch (Podridão=**contador**), anubis (Atadura=**contador**).
   (b) **No ato, pelo matador, sem prévia**: ammit ("quem Ammit derrota", "de forma alguma"). (c) **Aura enquanto
   o dono vive**: cerberus. (d) **Janela temporal global**: iansa ("por 2 turnos"). (e) **Auto-marca**: mimir.
2. **QUANDO É APLICADA.** A prosa DIZ, caso a caso — não precisei arbitrar. Os do grupo (a) são **prévios e
   cleansáveis** (o yanwong até diz "se o efeito não for removido") → **contra-jogo**: limpar antes de cair libera
   o revive. Os (b)-(d) são **no ato**, sem janela.
3. **CONTRA O QUÊ PROTEGE.** Nenhuma prosa bloqueia `vidaExtra`. "Não pode ser revivido" = revive **PÓS-morte**:
   `reviver` (por-aliado, Ísis/Osíris) + `reviveProximoTurno` (auto, Nezha). `vidaExtra` é sobrevivência PRÉ-morte
   — não é "revive". Mesmo o "de forma alguma" do ammit se aplica a quem ele DERROTA; vidaExtra impede a derrota.

**Fronteira execução × antirevive (a pergunta que o dono levantou por causa da sessão de hoje):** NÃO são
redundantes. execução/`vidaExtra` agem PRÉ-morte (sobreviver ao letal); antirevive age PÓS-morte (voltar após
cair). Janelas disjuntas, nenhum toca a do outro. A redundância que ele temia não existe — a prosa os mantém
distintos.

**Núcleo uniforme construído (o motor quase já tinha — §44):** o flag `naoRevive`, o log `nao_revive` e o gate em
`reviver` JÁ existiam. Faltava metade: (1) **gate completo** — `reviveProximoTurno` (auto-renascimento) passa a
respeitar `naoRevive`; antes um Nezha marcado renasceria (o flag travava só o revive-por-aliado). (2) **source
geral** — snapshot NO ATO da morte em `matar` (após vidaExtra, antes da limpeza): se a unidade cai carregando um
efeito/dot com a propriedade `naoRevive`, o flag persiste; limpar antes libera (contra-jogo). O caso Livro
deixou de ser set imperativo — o efeito carrega a propriedade e o snapshot o sela.

**Núcleo + WRAPPERS por SOURCE-OWNER (o §46/§47 de novo):** o núcleo cobre só o source **efeito/dot-carregado** —
hel/yanwong/mimir (mimir → AMARELO; hel/yanwong seguem VERMELHOS por outros ganchos). Ficam para os deuses:
matador-hook (ammit), aura-enquanto-vivo (cerberus), janela-temporal (iansa), contador-carregado (ahpuch/anubis —
Podridão/Atadura são contadores, não efeitos/dots; o snapshot não os lê). `antirevive` cai de trava 8 → **5**
(esses 5 são exatamente os 4 source-owners que faltam). **Ruído de triagem anotado:** o antirevive do yanwong já
estava coberto (linha do Livro) — foi contado a mais na 1ª triagem.

**Curva dupla:** VERDE **20** (parado — bloco de mecanismo, sequência por bloco não por flip) · VERMELHO **33→32**
(mimir flipou p/ AMARELO). O VERMELHO cai de novo, como o dono pediu para o bloco.

---

## §49 — aoCair `quem:'qualquerInimigo'`: qualquer-morte, e coexiste com o matador-bound (F1.3 morte 4/4, fecha o bloco)

**Decisão do dono (para não travar): QUALQUER MORTE, não matador-bound.** Dois motivos, e a varredura confirmou os dois:
- **Textual:** "quando um inimigo é derrotado" é **voz passiva sem agente**; se a prosa quisesse matador, diria "ao
  derrotar", como o Zeus diz. A distinção existe no vocabulário da planilha. Varredura global: os 4 (ahpuch, hades,
  iansa, morrigan) são voz passiva ("é derrotado"; hades é literal "**qualquer** inimigo"); só o **zeus** é voz de
  matador ("**ao derrotar**", = `quem:'inimigo'`). Bônus: **erinias** é "quando um **aliado** é derrotado" — mesma
  voz passiva, sujeito ALIADO (outra família, `qualquerAliado`). Nenhum dos 4 contradiz — decisão firme.
- **Design:** matador-bound já existe (`quem:'inimigo'`, zeus). Se os 4 fossem matador-bound seriam o MESMO gancho
  e a triagem não os teria separado. Que a varredura os isole é evidência de que são outra coisa.

**Forma:** o reator é todo vivo do lado OPOSTO ao caído; dispara mesmo SEM atacante (morte por DoT/execução/Livro)
— por isso itera o lado, não usa `atk`. É o 3º sujeito do eixo `aoCair` (self, inimigo, qualquerInimigo).

**Coexistência (pergunta 1 do dono) — os dois convivem SEM ambiguidade, e um dono com os DOIS dispara os DOIS
quando ELE mata.** `inimigo` (matador) e `qualquerInimigo` (qualquer) são superset/subset no gatilho, mas cada fx
é uma **declaração independente com seu próprio `faz`**; o motor não deduplica entre gatilhos. Logo uma morte que
o dono causa satisfaz os dois → dois disparos de efeitos DIFERENTES — correto, não bug. Se apontassem ao mesmo
efeito seria erro de autoria, não do motor. Provado em teste: TB com os dois dispara Umbra(matador)+Chama(qualquer)
quando mata; quando um ALIADO mata, só Chama(qualquer). Nenhum precisa excluir o outro.

**Fecho do bloco — a curva (pergunta 2 do dono), e o achado que CONTRARIA metade da previsão:** ver §50.

---

## §50 — Dois achados do bloco MORTE que o dono pediu para registrar

**(A) Achado-BUG pelo método (não falta de mecanismo) — contado, ao lado do da invocação-guarda (§25).** O
`naoRevive` gateava o revive-por-aliado (`reviver`) mas **não** o auto-renascimento (`reviveProximoTurno`): um
Nezha marcado pelo Ammit renasceria. O bug já estava no motor; só apareceu porque, ao generalizar o antirevive,
fui olhar os **dois** caminhos de revive em vez de assumir "o gate existe". **Casos contados de "refactor/varredura
expõe bug anterior" (argumento a favor do método):** (1) §25 — a invocação-guarda logava `absorvido` com o dano
inteiro; o refactor de eventos expôs. (2) §50 — o gate de `naoRevive` cobria metade das formas de revive; a
varredura dos dois caminhos expôs. **Padrão:** quando um refactor/varredura obriga a olhar TODOS os caminhos de
um mecanismo já existente, ele acha o caminho que ninguém testou. Vale contar — é evidência de que o método paga.

**(B) Regra nova (3ª ocorrência): em família de MORTE, varra por SUJEITO antes de contar.** Três vezes o sujeito
foi onde os baldes de morte se partiram: execução (matar-quem × por-status × seletor × timing), antirevive (5
sujeitos: prévia-carregada, no-ato-pelo-matador, aura, janela-temporal, auto-marca), e aoCair (self × inimigo ×
qualquerInimigo × aliado). Eu previa 3 sujeitos no antirevive; a varredura achou 5 (o dono previu prévia/auto/aura,
eu achei "no ato pelo matador" e "janela temporal"). **Já é regra: gancho de morte nomeado esconde N sujeitos;
varra por sujeito antes de contar trava/flip.**

**Curva do bloco MORTE inteiro (4 sessões) — e a previsão do dono half-confirmada:**

| sessão | VERDE | AMARELO | VERMELHO |
|---|---|---|---|
| base (re-triagem) | 17 | 31 | 40 |
| Passo 0 + piso-1hp | 20 | 34 | 34 |
| + execução-hp | 20 | 34 | 33 |
| + antirevive | 20 | 36 | 32 |
| + aoCair-qualquerInimigo (fecha) | **20** | 39 | **29** |

**O VERMELHO caiu 40→29 (−11); o VERDE NÃO subiu no fecho — ficou 20 as quatro sessões.** A previsão do dono
("bloco de mecanismo entrega os flips no FIM") está **half-confirmada**: a metade "mecanismo = staging" bateu (o
VERMELHO cedeu a cada sessão, monotônico); a metade "flips no fim do BLOCO" **não** — nenhuma das 4 mecânicas de
morte zerou um deus. **Diagnóstico:** um deus flipa quando cai seu ÚLTIMO gancho, e os deuses de morte carregam
ganchos de OUTROS blocos (hades/anubis: selado; morrigan: medo+execução-variante; iansa/ahpuch: antirevive-source
que falta). O bloco fecha um MECANISMO, não um DEUS. **Correção do modelo:** os flips não chegam no fim de cada
bloco — chegam no fim do ÚLTIMO bloco de que cada deus depende. Em plano dominado por mecanismo, o VERDE é
back-loaded para o fim da FASE inteira, não de cada bloco. (Os 3 flips que houve — bragi/brahma/inari/change — vieram
das EXTENSÕES do Passo 0, não das mecânicas de morte.) O dono pediu para saber se a previsão falhasse: falhou nessa
metade, e o motivo é estrutural, não de execução.

---

## §51 — Correção do modelo de blocos, com o erro do dono nomeado (ele pediu para registrar)

**Erro previsto pelo dono:** "um bloco de mecanismo entrega os flips no FIM do bloco." A métrica DUPLA mostrou que
só a metade "mecanismo = staging" bateu (VERMELHO cedeu monotônico); a metade "flip no fim do bloco" NÃO — o VERDE
ficou 20 as 4 sessões da morte, inclusive no fecho. **Por que vale registrar assim:** o dono pediu explicitamente
para eu contar SE falhasse; se eu tivesse reportado o fecho como "esperado", ele seguiria com o modelo errado por
mais um bloco. O valor da triagem durável + métrica dupla é justamente tornar a falha de previsão VISÍVEL antes de
custar um bloco.

**Modelo corrigido (o dono incorporou):** um deus flipa quando cai o ÚLTIMO gancho DELE. Logo o que decide
flip-vs-staging num bloco NÃO é "extensão vs mecanismo" — é **se os deuses daquele gancho ainda têm ganchos em
blocos POSTERIORES**. Morte staged porque seus deuses carregam ganchos de controle (hades/anubis: selado; morrigan:
medo). O VERDE é back-loaded para o fim da FASE — mais precisamente, para o ÚLTIMO bloco de cada deus. Corolário
testável: um bloco perto do FIM da fase (poucos ganchos depois) deve flipar muito; um no começo, pouco. O §52 usa
isso para prever o CONTROLE ANTES de começar.

---

## §52 — Varredura do bloco CONTROLE (F1.4) ANTES de abrir gancho: previsão testável + merges (§46 aplicado antes)

**PREVISÃO REGISTRADA ANTES (para comparar depois): 10 deuses têm CONTROLE como ÚLTIMO bloco** — ganchos restantes
todos de controle, flipam quando o bloco fechar: curupira, fenrir, guanyu, hades, kraken, medusa, oxala, piranha,
shutendoji, xango. **9 são AMARELO de gancho ÚNICO de controle** (flipam INCREMENTALMENTE, no instante em que o
gancho abre — não no fecho); só curupira é 2-de-controle (redirecionar+selado, flipa quando os dois caírem).
**Previsão numérica: VERDE 20 → ~30 ao longo do bloco, FRONT-loaded** — o oposto da morte. É a confirmação do §51:
a morte staged porque seus deuses tinham controle pela frente; o controle está perto do fim da fase, então seus
deuses não têm quase nada depois → flipam. Se o VERDE NÃO chegar perto de 30 no fecho do controle, o §51 está
errado e quero saber (mesmo contrato do §50).

**MERGES (§46 antes de começar — nome de prosa não é evidência sobre natureza). A lista do dono tinha 9 nomes;
a varredura da prosa colapsa para ~6 mecanismos, e 1 deles é generalização do que já existe:**
- **Família SLOT-LOCK — 1 mecanismo (generaliza o `lockSkill` existente), absorve 4 nomes.** O motor já tem
  `lockSkill{UM slot}` e `silenceClass{classe}`. Falta o **slot-lock NOMEADO com CONJUNTO de slots**:
  - *Selado ≡ Silenciado ≡ Enraizado* = trava `{Hab, Mil}` ("só Básico") — hades, iara, dionisio, anubis,
    tsukuyomi, curupira(milagre). ← precisa de multi-slot (o único novo de verdade).
  - *trava-Milagre* (metade do Medo) = trava `{Mil}` = `lockSkill{milagre}` — **já expressível**.
  - *Agarrar* (kraken) = trava `{Hab}` = `lockSkill{habilidade}` + **tag-nome** (p/ "imune a Agarrar" do fenrir/kraken).
  - *Petrificar* (medusa milagre) ≈ atordoado (já existe). *Medusa-hab* = `lockSkill{habilidade}` (já existe).
  Ou seja o gancho REAL = adicionar `slots:[…]` + `nome` ao `lockSkill`. **Medo** = `dmgDown`(existe) +
  slot-lock`{Mil}` + tag`medo` (p/ guanyu "imune a Medo" e babi "+10 vs Medo") — **nenhum mecanismo novo além do slot-lock**.
- **torpor ≡ aoAgirSobEfeito — 1 gatilho reativo, 2 nomes.** shuten: "quando o alvo agir sob Torpor, roubo HP+orbe";
  piranha: "o Sangramento causa +4 quando o alvo AGE". Mesmo gancho (dispara quando uma unidade AGE sob um debuff, o
  dono do debuff reage). Merge confirmado.
- **aoSerAtingido{quem} — reativo com eixo de SUJEITO** (self=medusa "quem me atinge recebe Veneno"; aliado=xango
  "quando um aliado é atingido, acumulo dano"). Um gatilho, dois sujeitos — igual ao eixo do `aoCair`.
- **aoCair quem:'aliado'/'qualquerAliado' — EXTENSÃO do gatilho que acabei de construir** (erinias/nuwa: "quando um
  aliado cai, +dano resto da partida"). Trivial: só o sujeito 'aliado' no eixo já pronto + faz apply-dmgUp-permanente.
- **pacificar** (oxala: age mas dano→0) e **redirecionar** (loki/curupira: força retarget do próximo alvo-único) —
  DISTINTOS, não merge com nada. redirecionar cobre 2 (loki+curupira) num mecanismo.

**Contagem real do bloco:** 9 nomes → **slot-lock-nomeado (generaliza lockSkill), pacificar, redirecionar,
aoSerAtingido, aoAgirSobEfeito(≡torpor), aoCair-aliado(extensão)** = 6 mecanismos, dos quais 1 é generalização e 1
é extensão trivial. **O bloco É menor que a lista sugere** — exatamente o que o dono mandou procurar.

**Ordem recomendada (o dono disse que importa menos que o número, mas trago):** começar pelo **slot-lock-nomeado** —
maior alavanca (absorve selado+agarrar+medo-lock; pode flipar fenrir, kraken, hades e guanyu de uma vez, ~+4 VERDE)
e é generalização do que já existe. Depois os que flipam AMARELOs de gancho único: aoSerAtingido (+2 medusa/xango),
aoAgirSobEfeito≡torpor (+2 shuten/piranha), pacificar (+1 oxala); redirecionar (staging: loki multi; curupira flipa
com selado). aoCair-aliado a qualquer hora (extensão barata).

---

## §53 — slot-lock NOMEADO (F1.4 controle 1/N): a etiqueta é vocabulário fechado, não a mecânica

Generalização do `lockSkill` (que travava UM slot) para um controle que trava um CONJUNTO de slots. Mas o achado do
dono é o que diferencia isto de "um lockSkill com dois slots": **a ETIQUETA**. Três coisas de desenho, explícitas:

**1. A etiqueta é o que habilita a IMUNIDADE, então é vocabulário FECHADO.** Fenrir e Kraken são imunes a Agarrar;
alguém pode ser imune a Selado sem ser imune a Agarrar, mesmo os dois travando slots. Implementação: cada NOME é um
`type` próprio em `CONTROLES` (`selado`, `agarrar`), e a imunidade mira o type — `imuneA(u,'agarrar')` casa por
type, o coringa `'controle'` cobre ambos. Sai de graça, sem tocar `aplicar`/`imuneA`. **Conjunto fechado de
slot-locks nomeados: `{selado, agarrar, medo}`.** Se um 7º nome aparecer na próxima varredura, é EXCEÇÃO num
conjunto fechado — e a gente sabe onde isso dá (uma imunidade nova ou uma trava de slot-set inédita).

**2. Selado ≡ Silenciado ≡ Enraizado — UM mecanismo, três nomes de prosa (não três etiquetas).** Li a prosa dos
donos: hades "Selado (só Básico)", dionisio/iara "Silenciado (só Básico)", curupira "Enraíza (não podem usar
Habilidade nem Milagre)", anubis/tsukuyomi "Selado/Silencia" — **todos = trava `{Hab, Mil}`**. E o decisivo para
imunidade: **NENHUMA imunidade da família inteira mira Selado/Silenciado/Enraizado por nome** (as imunidades
nomeadas são a Provocar, Agarrar, Medo, Atordoar, Dormir — varridas nos 100 kits). Como nada os distingue, a prosa
NÃO os separa → **um nome canônico `selado`**; Silenciado/Enraizado são sinônimos de prosa que aplicam `selado`.
"Imune a Selado" protege dos três. (Três etiquetas travando o mesmo seria vocabulário inflado sem ganho — posição do dono.)

**3. `silenceClass` (Zeus, "habilidades Mágicas") fica FORA da família — trava por CLASSE, não por slot.** É outro
mecanismo, já existe. Registrado AQUI de propósito: sem isto, a próxima varredura acha que são quatro nomes para o
mesmo e tenta mergear. São eixos diferentes (classe vs slot); não se tocam.

**Forma:** `SLOTS_TRAVADOS = { selado:['habilidade','milagre'], agarrar:['habilidade'] }`; `acoesDe` varre TODOS os
efeitos (uma unidade pode carregar mais de uma trava) e mantém o `lockSkill{slot}` legado. `basico`/`defesa` nunca
entram num conjunto ("só Básico"). **medo reservado** (= slot-lock`{Mil}` + `dmgDown` + a imunidade cobrindo os
dois — é BUNDLE, não slot-lock puro; próximo passo, não decidido em silêncio aqui).

**Curva (valida o §51/§52 de primeira):** VERDE **20 → 23** — fenrir, kraken (agarrar) e hades (selado) flipam
NA HORA em que o gancho abre, INCREMENTAL, porque não têm ganchos depois. É o oposto da morte (staging): a previsão
front-loaded do §52 bateu no primeiro gancho do controle. VERMELHO 29 → 24 (curupira/anubis/dionisio/iara cederam p/ AMARELO).

---

## §54 — Método: duas coisas são UMA se ninguém no jogo as distingue (do dono)

Ao decidir Selado ≡ Silenciado ≡ Enraizado (§53), meu argumento era economia de vocabulário; o do dono foi melhor
e virou método: **quando duas coisas parecem distintas, veja se ALGUÉM no jogo as distingue. Se ninguém distingue,
são uma.** A prova para o slot-lock foi objetiva — varri as imunidades dos 100 kits e nenhuma mira Selado/Silenciado/
Enraizado por nome; logo nada os separa, logo são um nome canônico. Isto é mais forte que "economia": economia é
gosto; "ninguém os distingue" é evidência. Aplica-se além de nomes — a qualquer par que se pense em fundir ou
separar: a pergunta é se existe uma REGRA no jogo (imunidade, condição, seletor, bônus) que trate um diferente do
outro. Se existe, são dois; se não, são um. (É o §46 — nome não é evidência — com um teste positivo em vez de só a advertência.)

---

## §55 — aoSerAtingido (F1.4 controle 2/N): efeito no SUJEITO do evento, com a garantia BUFF-only intacta

O gancho reativo "reajo a ser atingido". A família (varrida por SUJEITO, §46/§50): **medusa** (self → Veneno no
ATACANTE), **xango** (aliado → +dano em SI), **boitata** (self → cura em SI). Eixo `quem` FECHADO contra a família:
`{self, aliado}` — não há 'inimigo' (reagir a ATINGIR um inimigo é `aoAtacar`, outro gancho); contraAtaca/intercepta/
reflete já existem e não são isto.

**A pergunta do dono (a Medusa aplica DEBUFF no atacante, o que fura a garantia BUFF-only do `faz`).** Resposta,
com a avaliação do tripwire que ele pediu: **a garantia NÃO precisou ser reformulada.** Ela vive no VALIDADOR, sobre
o campo `faz` (valida_kit: apply em faz só BUFF). O `faz` continua sendo self/lado BUFF-only, intacto. O efeito no
atacante entra por um payload SEPARADO — `noAtacante` — com sua própria regra (DoT/apply-DEBUFF permitido; dmg
proibido p/ não recursar; buff proibido pois é inútil no inimigo). O tripwire ("se a garantia estiver amarrada de
um jeito que não separa buff-em-aliado de efeito-no-sujeito, PARE e me mostre") **não disparou** — a garantia era
bem-fatorada, separável por campo.

**Reuso da máquina (o que o dono pediu: generalizar em vez de criar).** `noAtacante` roda pela MESMA `rodarFaz`, com
o SUJEITO trocado para o atacante e o CRÉDITO no reator — exatamente o padrão `tagKey` da Hera (efeito num, crédito
noutro). A única adição à máquina foi o ramo `dot` em rodarFaz (o Veneno da Medusa), que só o `noAtacante` usa — o
`faz` segue sem dot (o validador o barra lá). Princípio que justifica o debuff: **o alvo vem do EVENTO, não é
ESCOLHIDO** — é a mesma situação da Hera. A garantia BUFF-only protegia contra "gatilho sem alvo aplica debuff em
quem eu quiser"; aqui o alvo é entregue pelo evento, então a proteção não é necessária e não foi afrouxada — só não
se aplica a um payload que não é `faz`.

**`contra` ganhou `elem` positivo** (só golpes deste elemento — boitata: Chama), ao lado do `elemNao` (negativo) que
já existia. Generalização mínima do eixo do golpe; a Medusa usa `classe: 'Físico'`, que já existia.

**Curva:** VERDE **23 → 25** (medusa e xango flipam — gancho único de controle, incremental, como o §52 previu).
Segue o front-load do bloco. boitata não flipa (carrega ignora-invuln).

**Proteção anti-recursão do `noAtacante` (o dono pediu para registrar aqui — só aparece com DOIS reativos no jogo).**
O `noAtacante` (efeito no atacante) RECUSA `dmg`. Se aplicasse dano no atacante, dispararia o `aoSerAtingido` DELE, e
potencialmente em laço (bate → reage → bate → reage). É o tipo de proteção que ninguém lembra de adicionar depois —
ela só fica visível quando existem dois reativos que podem se acionar. Contraste com o §56: o `noAtor` do
aoAgirSobEfeito PERMITE `dmg`, porque o gatilho é por AÇÃO (não por golpe) e dano não re-dispara uma ação. **A regra
não é "efeito no sujeito do evento nunca causa dano" — é "não cause dano por um caminho que possa se re-disparar".**
O risco de laço vem do GATILHO (on-hit recursa; on-act não), não do payload.

---

## §56 — aoAgirSobEfeito ≡ torpor (F1.4 controle 3/N): o dono do gatilho é quem APLICOU (origem)

O merge que o dono mandou (§52): torpor (shuten) e aoAgirSobEfeito (piranha) são UM gatilho — "o ator age sob um
efeito → alguém reage". Mas, ao contrário do aoSerAtingido (onde o reator é quem SOFRE), aqui **o reator é quem
APLICOU o efeito**, e o sujeito do efeito é o inimigo. As duas coisas que o dono mandou fechar:

**1. Quem é o DONO do gatilho.** É quem APLICOU o efeito, não quem o carrega (Shuten aplica Torpor e reage). O
efeito precisa lembrar o aplicador — e ele já lembra: **`origem`** está em todo `apply` (injetado no aplicarFx desde
o Provocar/regra 7). O que FALTAVA: os **DoTs não carregavam `origem`** — Piranha marca com Sangramento, que é DoT.
Adicionei `origem` ao `aplicarDot` e o `dmg`-fx a injeta (`u.uid`). Agora o marcador serve em efeito (Torpor) E em
DoT (Sangramento). Isso era o "o que falta" que o dono pediu para eu reportar — reusei `origem`, faltava só estendê-lo aos DoTs.

**2. Quantas vezes dispara.** Por AÇÃO, não por turno (decisão do dono na sessão das 15 — hoje coincidem, mas a Cuca
já tem Básico grátis, o precedente existe). A implementação segue por ação porque o gatilho corre dentro de `agir`,
que é UMA ação. Provado nos dois casos: uma ação → um disparo; segunda ação no mesmo turno → segundo disparo.

**Payload (espelha o aoSerAtingido).** `faz` no DONO (self/lado, BUFF-only, garantia intacta); `noAtor` no ATOR
(sujeito do evento). Diferença crucial vs `noAtacante`: **`noAtor` PERMITE `dmg`** (ver §55) — on-act não recursa.
Cobre **piranha** (Sangramento → +4 no ator, flipa). **shuten**: o roubo de HP cabe (dmg no ator + heal no dono),
mas o roubo de ORBE precisa da primitiva de remoção-de-orbe que ainda não existe — então re-triei o gancho dele de
`torpor` para `nega-orbe` (o resíduo, compartilhado com dionisio/mimir/orfeu). Achado de bundle: `torpor` eram DUAS
coisas (o trigger, agora construído, + o roubo de orbe).

**Curva:** VERDE **25 → 26** (piranha flipa; shuten fica AMARELO no resíduo nega-orbe). Front-load do bloco segue.

---

## §57 — Padrão: restrição herdada por analogia é restrição sem dono (do dono)

Quando um SEGUNDO caso chega, NÃO copie a restrição do primeiro sem testar se ela se aplica **pelo mesmo motivo**.
O caso: o `noAtacante` (aoSerAtingido) proíbe `dmg` porque on-hit **recursa** (bate→reage→bate). Ao chegar o
`noAtor` (aoAgirSobEfeito), o reflexo seria herdar a proibição — mas o motivo NÃO se aplica: on-act não recursa
(dano não re-dispara uma ação). Então `noAtor` PERMITE dmg. **A restrição pertence ao MOTIVO, não ao formato do
payload.** Uma proibição copiada por analogia é uma proibição sem dono — ninguém sabe por que existe, e vira lei
por inércia. Teste sempre: "a razão da restrição do 1º caso existe também no 2º?" Se não, a restrição não viaja.
(É o par do §54: lá, dois efeitos só são um se ninguém os distingue; aqui, duas restrições só são a mesma se têm o
mesmo motivo. Ambos: identidade por RAZÃO, não por aparência.)

---

## §58 — Pacificar (F1.4 controle 4/N): controle NOMEADO, decidido por PROVA de que não é dmgDown

**Forma (a pergunta do dono: controle nomeado ou dmgDown-100%?) — controle nomeado, e a prova é mecânica, não de
gosto.** `dmgDown` é FLAT (subtrai `v` do dano); não consegue zerar dano de tamanho ARBITRÁRIO — um golpe de 50 sob
dmgDown-40 ainda causa 10. "Causam 0 de dano" é zero DURO, de qualquer tamanho → precisa de flag dedicada, não de
dmgDown. Logo **NÃO é balde-de-um**; é mecanismo próprio. Entra em `CONTROLES` → `controlImmune` o barra e **"imune
a Pacificar" existe como etiqueta**. (Pelo §54: ninguém nos 100 kits menciona Pacificar além do Oxalá — mas isso
não o torna um dmgDown; o que decide é que o MECANISMO difere, não que alguém o nomeie.)

**Granularidade (os 3 casos que o dono mandou travar), da decisão da sessão das 15 (zera dano, não cura):**
1. **Dano DIRETO do pacificado → 0.** `bater` zera `v` quando o atacante está pacificado.
2. **DoT que ele APLICARIA no turno → não cola.** É dano que ele causaria; o `dot`-fx é pulado quando o ator está
   pacificado. (Zerar o DoT é parte de "zerar dano" — UM controle; zerar a CURA seria o segundo, e o dono vetou.)
3. **DoT já ATIVO → segue correndo.** O tick acontece no início do turno da vítima, não é a unidade pacificada
   agindo; e o DoT não foi aplicado sob Pacificar. Preservado naturalmente (só zero na AÇÃO, não no tick).
**Cura intacta.** Só o dano é 0 — Pacificar faz UMA coisa.

**"Podem agir":** pacificado NÃO trava a ação (fora de `podeAgir` e de `SLOTS_TRAVADOS`) — diferente de selado/
agarrar, que travam slots. Zera o dano na fonte, deixa a ação acontecer.

**Curva:** VERDE **26 → 27** (oxala flipa — gancho único, incremental). Front-load do bloco segue.

---

## §59 — O par §54 / §58: duas ferramentas com ESCOPO separado (do dono)

O §54 ("duas coisas são uma se ninguém as distingue") e o §58 (Pacificar) parecem se contradizer, mas não: têm
escopos diferentes, e ter os dois com escopo separado importa mais que ter os dois.
- **§54 responde "são A MESMA coisa?"** e só vale **quando os mecanismos coincidem**. Aí, se ninguém no jogo os
  distingue, são um (Selado ≡ Silenciado).
- **§58 é o outro caso: quando os mecanismos DIFEREM.** Pacificar (hard-0) ≠ dmgDown (flat), mecanicamente. Aí a
  ausência de menção **não é evidência de nada** — ninguém nomear Pacificar não o torna um dmgDown; o que decide é a
  impossibilidade mecânica. É o OPOSTO do §54: lá a ausência de distinção funde; aqui a diferença de mecanismo separa,
  independentemente de menção.
- **Regra de uso:** primeiro pergunte se os mecanismos coincidem. SE coincidem → §54 (ausência de distinção = são um).
  SE diferem → §58 (ausência de menção = irrelevante, são dois). Aplicar o §54 a mecanismos que diferem é o erro que
  transformaria Pacificar num dmgDown; aplicar o §58 a mecanismos iguais infla vocabulário. As duas ferramentas, com
  gatilho separado, evitam os dois erros.

---

## §60 — Medo (F1.4 controle 5/N): compósito de UM nome, e o flip do Guan Yu que NÃO vem

**Forma — a prosa confirmou a posição do dono (imune a Medo cobre AS DUAS metades).** As duas perguntas da varredura:
1. **Alguém trata as metades em separado?** NÃO — babi aplica "Medo por 2 turnos: causam 8 menos de dano E não podem
   usar Milagre" (as duas sob um nome); morrigan/mula aplicam "Medo por 2 turnos"; guanyu/durga são "imune a Medo" (o
   todo). Ninguém é "imune ao dmgDown do Medo".
2. **Mesma duração?** SIM — as duas metades sempre sob a mesma "por 2 turnos". (Se divergissem, teriam de ser dois
   efeitos, e a forma mudaria por necessidade, como o Pacificar mudou — não divergem.)
Logo Medo é **UM efeito composto**: `type:'medo'` em CONTROLES + SLOTS_TRAVADOS{milagre} (trava o Milagre) e carrega
`dmgDown` (lido em bonusDano, reduz o dano de saída). Uma checagem de `imuneA` barra o efeito INTEIRO — "imune a Medo"
tira lock E dmgDown juntos, o que a ficha promete. **É o oposto da imunidade larga da Nezha (§39): lá o hardcode dava
MAIS que a prosa; uma imunidade meia-boca aqui daria MENOS.**

**O flip do Guan Yu NÃO vem — avisado ANTES, como o dono pediu.** O "com 3 aliados vivos, imune a Medo" é imunidade
**CONDICIONAL** — a família não-estática da F1.2 s5. Hoje `imuneA` **ignora o campo `estado`** (só lê `f.a`), então
imunidade condicional NÃO existe. Construir Medo (o controle) não destrava o Guan Yu: o gancho dele é
`imunidade-condicional`, re-triado. **Correção da previsão do §52:** ela contava 10 flips no fecho do controle; 2
deles eram falsos — **shutendoji** (o `torpor` era bundle: trigger + roubo-de-orbe, §56) e **guanyu** (o `medo` era
imunidade-condicional). Os dois têm ganchos de NOME de controle mas SUBSTÂNCIA de outro mecanismo (§46 de novo). O
fecho real do bloco será ~**28** (não 30): 7 já fliparam + curupira quando redirecionar cair. Medo em si flipa 0
(babi segue VERMELHO; morrigan/mula cedem p/ AMARELO).

**Curva:** VERDE **27 → 27** (Medo não flipa ninguém — os apliadores são multi-gancho, o único "flip" previsto era o
Guan Yu, que é imunidade-condicional). VERMELHO **24 → 22**.

---

## §61 — A TRIAGEM herda o §46: toda previsão sobre ela é TETO (do dono)

Os dois falsos flips do fecho do controle (shuten, guanyu) tinham gancho com NOME de controle (`torpor`, `medo`) e
SUBSTÂNCIA de outro mecanismo (roubo-de-orbe, imunidade-condicional). Isso não é acidente: **a rubrica de triagem
classifica pelo NOME do gancho**, então ela carrega o MESMO viés que a varredura da prosa corrige (§46 — nome não é
evidência). Consequência prática: **toda previsão feita sobre a triagem é um TETO, igual à projeção de flip** (a
projeção "flip-sozinho" errou 3× alto lá atrás). É a lição do §37 (varrer o conjunto inteiro corrige um número) um
nível ACIMA: lá a varredura corrige a triagem; aqui, a previsão feita SOBRE a triagem herda o erro que só a varredura
seguinte corrige. Regra: ao prever sobre a triagem, trate o número como limite superior e espere que a varredura de
cada gancho revele bundles/mislabels que o reduzem. **Corolário provado:** a previsão §52 (VERDE ~30) era teto; a
varredura de cada gancho revelou 2 mislabels; o fecho real bateu 28 — o método certo, o teto corrigido pelos itens.

**Nota de honestidade (Medo):** a posição do dono (imune a Medo cobre as duas metades) estava certa, mas o argumento
DECISIVO foi a **duração idêntica** (evidência da prosa), não a coerência-com-a-ficha que ele deu. A posição estava
certa; a razão dada estava incompleta. Registrado porque "certo pela razão errada" e "certo pela razão certa" têm
valor diferente numa base que explica de onde vêm as decisões.

---

## §62 — Redirecionar (F1.4 controle 6/N): fecha o bloco, e a previsão corrigida BATE

**Forma (as duas perguntas do dono):**
1. **Próximo vs janela — mesmo núcleo, lifetime diferente.** Loki redireciona o PRÓXIMO golpe = consumo-único
   (`contra:'unico'`, que se apaga após um uso — REUSA o bookkeeping que o `intercepta` já tinha); Curupira redireciona
   por 2 turnos = janela (dur). A distinção consumo-vs-janela não é nova — o intercepta já a tinha. Não são dois
   mecanismos; é um com dois tempos de vida.
2. **Para quem — escolhido, e coincidem.** Loki manda "a um inimigo", Curupira "a um aliado deles (você escolhe)" —
   ambos para um alvo ESCOLHIDO no lado do ATACANTE (fogo amigo), carregado no efeito como `destino=uid`. NÃO é o dono
   (não é auto-redirect). Os dois coincidem no destino.

**Precedência sobre taunt (confirmada, da sessão das 15):** o taunt decide o alvo ANTES (na mira), mas o redirect roda
em `bater` e tem a ÚLTIMA palavra sobre onde o golpe cai. Um golpe forçado ao taunter é redirecionado ao sink. Provado.
Só alvo único (área não redireciona, como o intercepta).

**FECHO DO BLOCO CONTROLE (6 sessões) — contra a previsão corrigida:**

| sessão | VERDE | AMARELO | VERMELHO |
|---|---|---|---|
| base (pós-morte) | 20 | 39 | 29 |
| §53 slot-lock | 23 | 41 | 24 |
| §55 aoSerAtingido | 25 | 39 | 24 |
| §56 aoAgirSobEfeito | 26 | 38 | 24 |
| §58 Pacificar | 27 | 37 | 24 |
| §60 Medo | 27 | 39 | 22 |
| §62 redirecionar (FECHA) | **28** | 38 | **22** |

**VERDE 20→28 (+8), VERMELHO 29→22 (−7). A previsão §52 corrigida (28) BATEU exatamente.** Os 8 flips: fenrir,
kraken, hades, medusa, xango, piranha, oxala, curupira — todos FRONT-loaded (cada um flipou ao abrir seu gancho),
confirmando o §51 (deus de controle não tem bloco depois → flipa na hora, oposto da morte). Os 2 que a previsão bruta
(10) contava e não vieram — shuten (roubo-de-orbe) e guanyu (imunidade-condicional) — são o §61: nome de controle,
substância de outro mecanismo. **O método estava certo; o teto (10) caiu para 8 quando a varredura de cada gancho
identificou os 2 mislabels — exatamente o que o §61 prevê.**

---

## §63 — Re-triagem 2 (pós-F1.4) e a decisão parar-motor-ou-escrever (do dono — PENDENTE)

Re-varredura fresca dos 88 por 4 agentes contra o vocabulário atual. **VERDE 25 · AMARELO 34 · VERMELHO 29.** Três
achados:

**(A) O §61 é RECURSIVO — a própria re-triagem herdou o viés-do-nome.** Dois agentes marcaram `aoAliadoUsarMilagre`
como gancho do bragi/brahma; mas `aoUsarHabilidade` JÁ dispara para aliados (Passo 0). Falso-gancho, corrigido →
bragi/brahma são VERDE. Confirma o §61 num nível a mais: **mesmo uma varredura fresca é TETO até reconciliar contra
o que existe.** (Também explica a deriva da triagem incremental, que dizia 28: a manutenção-por-remoção drifta, por
isso o dono pede re-triagem completa entre fases — a lição do §37/§61 mais uma vez.)

**(B) A projeção que decide a estratégia: os 63 não-verdes ESPALHAM.** 50 ganchos distintos; **31 travam UM só deus**;
top-6 cobrem 35% das travas. O limiar do dono ("concentra em 5-6 → motor; espalha em 20 → kits") aponta decisivamente
para KITS: espalha em 50. Terminar o motor = ~50 mecanismos (31 por um deus) antes de um deus novo.

**(C) Custo de kit VERDE é baixo:** o catálogo já traz número/custo/recarga/prosa; escrever é TRADUZIR prosa→fx, não
desenhar. ~6-8 por sessão → os 25 verdes em ~4 sessões → IMPLEMENTADOS 12→~37.

**Recomendação (decisão do dono):** parar o motor e escrever os 25 verdes; o indicador de implementados (parado em 12
desde o Rá) anda de verdade. O AMARELO (34) vira 2ª onda: construir DEPOIS os poucos ganchos-balde do topo
(bonusDano-escala flip 5, seletor, nega-orbe) flipa outro lote. Detalhe e ranking em `docs/prontidao-88.md`
(RE-TRIAGEM 2) e per-deus em `docs/triagem-88.json`. **Aguarda o go do dono.**

---

## §74 — VARREDURA DE CAMPOS-ÓRFÃOS (limpa) + a TRADUÇÃO dos 10 hook-pequenos ANTES de construir (agrupamento por gancho)

**(A) A 2ª METADE DA VARREDURA DE ÓRFÃOS — campos, não etiquetas (o dono pediu). LIMPA.** Chequei TODO campo de
`novaUnidade` (unidade) e `novoEstado` (lado + estado) por um LEITOR (refs − writes ≥ 1 read). **Todos têm leitor.**
O `usos` era o único campo-órfão (declarado sem fio há muito) e foi ligado no §73. Não há mais campo preparado-sem-fio.
Fica a regra: **duas espécies de órfão — etiqueta aplicada-sem-enforce (dominado) e campo declarado-sem-fio (usos);
as duas passam por validarDeus+smoke; as duas se pegam por varredura cruzada (aplica-vs-enforce / declara-vs-lê), não
por teste de kit.** Re-rodar as duas a cada onda.

**(B) A TRADUÇÃO DOS 10 (antes de construir — a isis provou que a reconciliação erra ~20% p/ cima).** Confirmado: cada
um dos 10 é "hook-pequeno" de verdade (1 gancho), MENOS as exceções que só a tradução pega:

| deus | gancho (tradução) | tamanho | nota |
|---|---|---|---|
| **boitata** | **NENHUM — escreve JÁ** | — | "ignora Inalvejável" é clause INERTE (Inalvejável não existe); o resto (aoSerAtingido{Chama}→cura §55 + imune Queimadura + seCond) é limpo. **6º verde-escondido; reconciliação errou p/ cima de novo.** |
| hades | **nega-orbe** (milagre "rouba orbe") + DoT-nome (hab "10 puro/turno") | pequeno×2, MULTI | nega-orbe serve hades+heimdall+hermes/shutendoji |
| heimdall | **nega-orbe** (passiva anti-roubo, acoplada) | — | básico/hab/milagre limpos (contraAtaca é intrínseco a alvo-único); a passiva SÓ funciona quando nega-orbe existir |
| iara | execução-status-filter (milagre "elimina Encharcados ≤24") | pequeno, MULTI | serve iara + morrigan |
| atena | contraAtaca-classe-filter (hab "quem atinge com Física") | pequeno, single | contraAtaca hoje dispara em QUALQUER golpe único, sem filtro de classe |
| durga | vulnerabilidade-debuff (hab "recebe +8 de dano") | pequeno, single | efeito "toma +N" (genérico; hoje só o adormecido dá +8 hardcoded) |
| khnum | aoCair-quem:aliado (passiva) | pequeno, MULTI | serve khnum + erinias/nuwa (família F1.4) |
| poseidon | reducao-por-elem-do-aliado (passiva "aliados Maré") | pequeno, single | reducao hoje não condiciona pelo elem do PROTEGIDO |
| chaac | **DOIS**: bonusCura-por-tipo-de-cura (passiva "regen +4") + apply-filtrado-por-status (milagre "atordoa Encharcados") | pequeno×2 | apply-filtrado serve chaac + aokuang |
| **huangdi** | **cdShift-CLUSTER** (cdShift em FX_TURNO + "recarga mais longa DO TIME" = max-across-team + mirado-multi) | **MÉDIO, single** | **SAI DA LEVA — vira decisão própria, como o dominado (regra 3 do dono)** |

**(C) O AGRUPAMENTO POR GANCHO (regra 1 do dono):** só **nega-orbe** agrupa 2-nesta-leva (hades+heimdall); constrói
uma vez, escreve os dois. Os outros são 1-deus-1-gancho (como os nove), embora vários sirvam MAIS deuses na fila
(execução-status→iara+morrigan; aoCair-aliado→khnum+erinias/nuwa; bonusCura-tipo→chaac+cernunnos; apply-filtrado→
chaac+aokuang). **Nenhum gancho da leva é médio-single EXCETO huangdi** — que por isso sai. **chaac é o único
duplo-travado** (2 ganchos).

**O plano da leva (8 deuses, IMPL 37→45 + boitata de graça = ~45; huangdi à parte):** boitata (0 gancho) → nega-orbe
(hades+heimdall) → os 6 single/multi pequenos (iara, atena, durga, khnum, poseidon, chaac[×2]). huangdi fora, aguardando
a decisão do dono sobre o cdShift-cluster médio. **Aguarda o go do dono para o 1º; depois sigo sozinho pelos oito.**

---

## §73 — ISIS FECHA (taxa do §61 medida), o campo `usos` sem-fio (2º caso da família dominado), e o wrapper de escala DEDUP-clean (Oni + Mula)

**(A) A TAXA DO §61, MEDIDA (o dono: mais útil que a regra qualitativa).** O teste de teto (§71) deu **~80% (4/5)**, e o
erro é **sempre para CIMA** (a reconciliação promete VERDE e entrega HOOK — nunca o contrário, porque ler-a-lista vê
mecanismos presentes mas não restrições de nível-de-habilidade). Registrado como número: **bom o bastante para
SEQUENCIAR (ordena a fila com confiança), ruim o bastante para nunca PROMETER (a escrita é a única prova).** Em
`docs/triagem-88.json` (`reconciliacao_taxa`).

**(B) ISIS FECHADA — e um 2º caso "campo preparado sem fio".** O guard once-per-match não existia como MECANISMO, mas
o CAMPO `usos:{}` da unidade já estava lá (linha 295) — declarado e **nunca referenciado**, exatamente como o
`dominado` (tag aplicada, orb-denial só). Liguei: `acoesDe` trava a habilidade `umaVez` gasta (`ja_usou`, permanente —
cd:0 não reabre), `agir` marca. **Generaliza o padrão do §69/§71: além de etiquetas-órfãs (aplicadas sem enforce), há
CAMPOS-órfãos (preparados sem fio).** Ambos passam por `validarDeus+smoke`; só o uso real (escrever isis) os expõe.
Varredura de "uma vez por partida": 2 kits (isis + shiva-futuro) — o hook serve os dois. IMPL 34→35, FUNCIONAL 33→34.

**(C) O WRAPPER DE ESCALA — DEDUP-CLEAN (a garantia que o dono exigiu antes de construir).** O risco: o `danoBase` já
escala dano por contador (`porContador*`, `porAliadoCaido`…); um wrapper que escalasse o `bonusDano` passivo por
CAMINHO SEPARADO viraria "dois jeitos de fazer o mesmo" — dívida que só aparece quando alguém escreve o kit errado.
**Solução: extraí `escalaContagem(st,u,t,spec)` como o ÚNICO mecanismo — chamado por danoBase (por-ability, sem mudança
de comportamento, os testes de porContador seguem verdes) E por bonusDanoDeclarativo (passivo).** Um caminho só, mesma
forma de descritor dos dois lados. Adições: `passo` (default 1 — `+v a cada passo`; Oni "+1 por 4 Combo") e a fonte
`porHpFaltante` (Mula "+1 por 5 de HP perdido"). `v:0` liberado no bonusDano quando há descritor de escala (bônus
puramente escalado). **Flipou 2 limpos: Oni (Combo) e Mula (HP-faltante) — IMPL 35→37.**

**(D) O BALDE CONFIRMADO COMO NÃO-BLOCO.** Como o §72 previu: o wrapper + as 2 fontes que já existiam (porContadorLado,
porAliadoCaido) flipou só **2** (Oni, Mula). Os outros 3 (osiris, aokuang, kali) arrastam cada um um 2º buraco
(shield-condicional, apply-filtrado, auto-ataque) — ficam para depois, à la carte. **O "balde trava 5" era um nome
sobre cinco mecânicas distintas; construir o wrapper (o único pedaço comum) rendeu 2, e o resto não é dívida do
wrapper.** Placar: **IMPL 37 / FUNCIONAL 36** (a única órfã segue afrodite/dominado).

---

## §72 — VARREDURA DO BALDE ESCALA-DINÂMICA: partiu, e pior que "três pequenos" — é um wrapper + 3 fontes + 3 buracos-segundos

O dono mandou desconfiar dele especialmente. Desconfiança confirmada. Tracei a escala EXATA dos 5, contra as fontes de
escala que o `danoBase` JÁ tem (`porAliadoCaido`, `porContadorLado`, `porContador`, `porInimigoCaido`, `porContadorCampo`):

| deus | "+X por…" | fonte da contagem | existe? | 2º buraco (não-escala) |
|---|---|---|---|---|
| **oni** | +1 por 4 Combo | contador-de-lado (Combo) | **✓ porContadorLado** | — (limpo com o wrapper) |
| **osiris** | +8 por aliado caído | aliados caídos | **✓ porAliadoCaido** | habilidade: shield condicional ao HP do aliado |
| **mulasemcabeca** | +1 por 5 HP perdido | HP-próprio-faltante | ✗ NOVA | — (limpo com a fonte) |
| **aokuang** | +5 por inimigo Encharcado | contagem-de-inimigos-com-tag | ✗ NOVA | milagre: atordoar SÓ os Encharcados (apply filtrado) |
| **kali** | +10 por inimigo <60 HP | contagem-de-inimigos-abaixo-de-HP | ✗ NOVA | milagre: auto-ataque no fim do turno |

**O achado — o balde não é UM hook MID, é uma soma de peças à la carte:**
1. **UM wrapper** compartilhado: o `bonusDano` DECLARATIVO (passivo) hoje só soma `f.v` FIXO — não escala. Todos os 5
   precisam que o passivo bonusDano possa ESCALAR por uma fonte. É o único pedaço comum.
2. **2 fontes JÁ EXISTEM** (porAliadoCaido, porContadorLado): com só o wrapper, **oni fecha limpo** e **osiris-passivo**
   também (osiris ainda tem o 2º buraco na habilidade).
3. **3 fontes NOVAS**, uma por deus: HP-próprio-faltante (mula), contagem-de-status (aokuang), contagem-abaixo-de-HP
   (kali) — exatamente as quatro que o dono previu que partiriam (HP-faltante, status, caídos, Combo), com "caídos" e
   "Combo" já prontos.
4. **3 dos 5 têm um 2º buraco NÃO-relacionado** à escala (osiris shield-condicional, aokuang apply-filtrado, kali
   auto-ataque-fim-de-turno). Então mesmo com a fonte, eles NÃO fecham limpos.

**Veredito (a decisão que o dono pediu): NÃO vale como bloco único.** O "flip 5" é uma miragem — na prática o wrapper +
fontes existentes flipa **2 limpos (oni, mulasemcabeca)**; os outros 3 arrastam um 2º buraco cada. Recomendação: tratar
como peças pequenas independentes, não como balde. **A ordem de melhor rendimento por linha:** (a) o wrapper
bonusDano-escala + reusar porContadorLado → **oni** (1 peça, 1 deus limpo); (b) fonte HP-faltante → **mulasemcabeca**
(1 peça, 1 deus limpo). Os outros 3 (osiris/aokuang/kali) só depois, cada um com seu 2º buraco. **O rótulo "balde
escala-dinâmica trava 5" era o §46 mais uma vez: um NOME agregando cinco mecânicas distintas que só a varredura
separa.** O topo do ranking desde a triagem-1 não era um balde — eram cinco baldinhos que rimam no nome.

---

## §71 — O TETO DA RECONCILIAÇÃO TESTADO (4/5), a VARREDURA DE ETIQUETAS ÓRFÃS (1 órfã), e o número FUNCIONAL no placar

**(A) O teto da reconciliação, testado pela escrita (o dono pediu).** Dos 5 verdes-por-reconciliação, escritos: **4
saíram limpos, 1 travou.** baldur/orfeu/itzamna/vishnu fecharam (IMPL 30→34). **isis TRAVOU** — o milagre "Revive todos
os caídos… **uma vez por partida**" precisa de guarda once-per-match para HABILIDADE, que não existe (só `renasceu`
por-unidade; o cd:5 do catálogo não trava). **A reconciliação (ler a lista) viu `copiar`+`revive` e disse verde; só a
TRADUÇÃO pegou a restrição de nível-de-habilidade.** É o §61 no alvo exato que o dono mirou: **ler a lista real é TETO,
traduzir é a verdade.** Veredito: reconciliar-contra-o-motor é método CONFIÁVEL (80% acerto no teste), mas continua
sendo teto — a escrita é a única prova. isis vira HOOK-pequeno (once-per-match), não verde.

**(B) A VARREDURA DE ETIQUETAS ÓRFÃS (o dono pediu quando o dominado apareceu; agora feita).** Método: coletei TODO
`apply eff.type` / `dot` / fx aplicado pelos 34 kits escritos e cruzei com o que o motor ENFORCE (não só aceita).
Resultado: **de ~20 tipos de efeito aplicados, TODOS são enforced — MENOS UM.**

| efeito | kits que aplicam | enforce? |
|---|---|---|
| adormecido, atordoado, submerso, selado, agarrar, lockSkill, silenceClass, taunt, pacificado | vários | ✓ (podeAgir / SLOTS_TRAVADOS / acoesDe / bater) |
| dmgUp, dmgDown, dmgReduction, controlImmune, invulneravel, noHeal, pisoVida | vários | ✓ (bonusDano / calcDano / curar / bater) |
| regen, antiRevive, redirect, vidaExtra, encharcado, DoTs | vários | ✓ (curar-tick / snapshot / matar / marcador lido) |
| **dominado** | **afrodite** | **✗ SÓ nega-orbe (1009); o Básico-forçado é INERTE** |

**UMA órfã: `dominado`, em UM kit: afrodite.** Os outros 33 estão FUNCIONAIS (todo efeito que aplicam, o motor
executa — algumas com divergências-de-granularidade anotadas, mas essas AGEM, não são inertes). afrodite é o único
PARCIAL: a habilidade nega orbe (metade) mas não força o Básico (a metade que é a alma do efeito).

**(C) O NÚMERO FUNCIONAL NO PLACAR (o dono: "métrica que conta o que não funciona engana").** A partir daqui o placar
carrega DOIS números: **IMPL 34** (escritos) e **FUNCIONAL 33** (escritos cujos efeitos o motor todo executa). A
diferença é exatamente 1 — afrodite/dominado — e fecha sozinha quando o mecanismo do Básico-forçado for construído (a
tag já está lá, §69D). O IMPL sozinho enganava do mesmo jeito que a curva-única do VERDE (§64): contava a afrodite
como pronta. **De agora, FUNCIONAL é o número honesto; IMPL é o teto.** Registrado em `docs/triagem-88.json` (campo
`placar`). E a lição-de-processo: `validarDeus + smoke` não vê órfã (a tag aplica, não quebra) — só a varredura
cruzando aplica-vs-enforce vê. Vale re-rodar a varredura a cada onda, como o auditor (§66).

---

## §70 — RECONCILIAÇÃO DOS 41 AMARELO contra o motor de hoje: a triagem errava para cima (5 verdes escondidos), e o resto colapsa em 4 baldes

Feita a passada que o dono pediu: cada AMARELO confrontado NÃO pelo nome do gancho, mas pelo vocabulário REAL de hoje
(28 fx, 13 gatilhos, condOK com alvoBuff/alvoDebuff/alvoHp/alvoElem, estado com fase/contador/aliadoCaido, reducao com
elemNao, `condicional`, `copiar`, `opcoes`, `restauraMax`, `invocar-guarda`, `porContador*`…). Resultado dos 41:

| categoria | n | quem |
|---|---|---|
| **VERDE-agora** (writable JÁ, zero hook) | **5** | baldur, isis, itzamna, orfeu, vishnu |
| **HOOK-pequeno** (1 hook, como os 9 da onda) | **12** | hades, iara, atena, chaac, durga, khnum, huangdi, poseidon, boitata, heimdall, kukulkan, inari |
| **BALDE** (compartilha 1 hook MID) | **11** | escala-dinâmica(5), nega-orbe(2), seletor(2), imunidade-cond(2) |
| **AMARELO-real** (estrutural, fica) | **9** | ahpuch, aquiles, bastet, cerberus, izanagi, morrigan, perseu, raijin, tsukuyomi |
| F1.5 / pendente | **2** | amaterasu (Dia), kitsune (dominado) |

**(A) OS 5 VERDES ESCONDIDOS — o §46/§61 provado com nome e sobrenome.** Estavam escrevíveis O TEMPO TODO; a triagem
os chamou de travados por LER O NOME do gancho:
- **baldur** "15 reducao exceto de Verdejantes" = `reducao{contra:{elemNao:'Verdejante'}}` — elemNao existe desde a F1.2.
- **isis** "copia a última Habilidade de um aliado" = `copiar` — existe (era o rótulo "copiar-ultima" que assustou).
- **itzamna** "restaura HP máximo (Podridão)" = `restauraMax`; "+1 orbe no Dia" = `porTurno{estado:fase:Dia}` — tudo existe.
- **orfeu** "+8 contra Adormecidos, que não geram orbe" = `bonusDano{alvoDebuff:adormecido}` + a regra 1009 (já é global).
- **vishnu** "Alterna: NARASIMHA ou KURMA" = `opcoes` — existe (Lugh/Nüwa).
**Escrevê-los é IMPL 30→35 sem tocar uma linha de motor.** (Ceteris paribus: reconciliação é TETO — só a escrita
confirma, o §61 final. Mas a confiança aqui é alta: os mecanismos foram lidos na lista real, não inventados.)

**(B) O RESTO COLAPSA EM POUCOS HOOKS.** Os 12 "hook-pequeno" e os 11 "balde" não são 23 problemas — são ~7 hooks:
- **escala-dinâmica** (dano escala por CONTAGEM dinâmica): aokuang(inimigos Encharcados), kali(inimigos <60HP),
  osiris(aliados caídos), oni(Combo), mulasemcabeca(HP perdido) — **5 deuses, 1 balde**. O TOPO, como a triagem-1 já
  suspeitava. Hoje o `porContador` escala por contador FIXO; falta escalar por CONTAGEM-de-condição (inimigos-com-tag,
  hp-próprio). Um hook MID abre 5.
- **nega-orbe** (roubar/remover orbe): hades, hermes, shutendoji, heimdall(proteção) — ~4.
- **seletor** (mirar o "mais X"): demeter(mais ferido), izanami(maior HP) — 2 (e osiris/habilidade).
- **imunidade-condicional** (imune se estado): guanyu(3 vivos), yamatotakeru(15 Combo) — 2.
- **aoCair-quem:aliado**: khnum (+ erinias/nuwa da família F1.4) — pequeno.
- **execução-status-filter**: iara, morrigan(meio) — pequeno.
- **vulnerabilidade-debuff** (recebe +N): durga — pequeno.

**(C) SÓ 9 SÃO ESTRUTURAIS DE VERDADE** (AMARELO-real): Podridão-antirevive (ahpuch), vulnerabilidade-por-função
(aquiles), primeiroPorTurno-pendente (bastet), antirevive-aura (cerberus), imune-Maldição+condicional-pós-remoção
(izanagi), execução-fim-de-turno+profetizado (morrigan), reflete-controle (perseu), aoAtacar-gatilho (raijin),
alvoCuradoAntes-pendente+Noite-F1.5 (tsukuyomi). Esses pedem mecânica nova de verdade; ficam para depois.

**A LEITURA CONFIRMADA:** a re-triagem PAGOU exatamente como previsto (§69E). Reconciliada-contra-o-motor (não por
nome), ela achou 5 kitsunes-escondidos de graça e mapeou os outros 36 em ~7 hooks + 9 estruturais — em vez dos "41
travados" que o nome dizia. **A régua nova (o motor pós-2ª-onda) reclassifica sozinha um terço da lista.** Próximo
passo natural: escrever os 5 verdes (IMPL 35), depois atacar o balde-escala-dinâmica (abre +5). Detalhe per-deus em
`docs/triagem-88.json` (campo `reconc`).

---

## §69 — 2ª ONDA: nefertem fecha (IMPL 30 — meta do §64 batida); kitsune trava na "Domina"; DESENHO do dominado; afrodite pendente; e a leitura da re-triagem

**(A) NEFERTEM — feito.** Gancho pequeno: a condição `quandoCura` ganhou `curadorFaccao` — lê a FACÇÃO de QUEM curou
(não do curado). `curar/bonusCuraDeclarativo/condCuraOK` passam o `curador` (threaded nos 4 sítios de cura; regen fica
null). `FACCOES_VOCAB` distinta da `FACCOES` da UI (senão colide no dist concatenado — bug pego na hora). **IMPL 30 —
a meta honesta do §64 (12→~30) batida na conta.**

**(B) KITSUNE — 95% limpa, trava SÓ na "Domina" (a previsão do dono bateu: a triagem errou para cima de novo).** A
tradução inteira mapeou em vocabulário existente: passiva "1 Cauda a cada 2 turnos" = `aCadaN{n:2}`+contador; "a cada
3 Caudas 5 de redução" (ESCALA) = **3× `reducao` com `estado:{contador Cauda min 3/6/9}`** e a regra do MÁXIMO escolhe
o tier (escala sem hook!); "isca que absorve o próximo ataque único" = `invocar{tipo:'guarda', hp:1}` (a isca é
invocação-guarda, o motor absorve total e consome); "+3 por Cauda" = `porContador`; "com 5+ Caudas Domina" =
`condicional{se:{contador Cauda min 5}}` (a primitiva da Freyja!). Só a `Cauda` faltaria no vocabulário. **Não fosse a
Domina, IMPL 31 sem gancho.**

**(C) O DESENHO DO DOMINADO (o dono pediu SÓ desenhar, não construir):**

- **O que é, de verdade.** Pelo catálogo (afrodite, boto): "Domina 1 inimigo por 1 turno: **ele usa o próprio Básico
  contra um aliado dele**" — fogo amigo forçado. NÃO é a linha 1009 (negar orbe — isso é a regra que a *passiva do
  Dionísio* descreve; varri o `src/` e é a única leitura de `dominado`). O mecanismo do Básico-forçado NÃO existe.
- **Onde mora.** `agir(st, uid, slot, alvos)` é o CHOKE POINT único — tanto o humano quanto a CPU chamam por ali. O
  override entra na entrada do `agir`: se a unidade que age tem `dominado`, IGNORA o `slot`/`alvos` do chamador e força
  `slot='basico'` contra um ALIADO da própria unidade dominada. Um ponto só cobre humano e CPU.
- **Custo.** Motor: ~15-30 linhas no `agir` (detecta, força o slot, escolhe o aliado, resolve via `bater` que já
  existe). UI: superfície para MOSTRAR que a ação está forçada (o jogador não deve "escolher" e ver outra coisa
  acontecer) — a parte fuzzy. Testes: dominado → básico no aliado.
- **Decisões abertas (para quando construir).** (1) QUAL aliado — aleatório, o de menor HP, ou o primeiro? (2) PAGA
  custo? provavelmente forçado-de-graça (não é ação escolhida). (3) sem aliado vivo → fizzle. (4) mantém a linha 1009
  (nega orbe) OU dobra na nova regra? sugiro MANTER (é a regra do Dionísio, ortogonal).
- **Riscos.** O contrato do `agir` muda (a ação do chamador é sobrescrita) — a UI PRECISA refletir, senão o jogador
  fica confuso. O fogo-amigo reusa `bater`, então redirect/intercepta compõem (bom, mas testar). 
- **Veredito de tamanho: MÉDIO** — motor contido, UI fuzzy. Maior que os 9 hooks pequenos, menor que uma fase. Fica
  desenhado; aguarda o go do dono para construir.

**(D) AFRODITE — registrada como pendente-do-dominado (decisão do dono: consertar junto).** A afrodite (lote-1) já está
no ar aplicando `dominado` (habilidade "Domina 1 inimigo... usa o Básico contra um aliado"). Como só a metade
orbe-denial existe, ela está MEIO-IMPLEMENTADA. Quando o mecanismo do Básico-forçado for construído, **ela passa a
funcionar à risca SEM tocar no kit** (a tag já está lá). **5º caso "método expõe bug anterior" — e o primeiro em que
traduzir um kit NOVO (kitsune) revelou o buraco de um kit JÁ ENTREGUE (afrodite).** O `validarDeus+smoke` do lote-1 não
pega (a tag aplica, não quebra); só a tradução pega. Ledger: §25, §50, §64-matar, §66-auditor, **§69-dominado/afrodite**.

**(E) A LEITURA DA RE-TRIAGEM (a pergunta do dono — 30 escritos, ~58 restantes, vale re-triar antes da F1.5?).**

Minha leitura honesta: **sim, PAGA — mas só se for reconciliada contra o motor, não uma varredura por nome.** As três
últimas triagens erraram para cima TODA vez pela mesma causa (§46/§61): classificam pelo NOME do gancho e não
reconciliam contra o que o motor REALMENTE tem. E o motor cresceu MUITO nesta onda — 10 mecanismos novos que são
vocabulário agora: `condicional` (qualquer "se estado então X senão Y"), `seCond` (qualquer dano condicional),
`reducao`-tierada por contador (qualquer escala por acúmulo), `invocar-guarda` (qualquer isca), `curadorFaccao` (abre
a família facção-do-curador: Hel/paridade, Cernunnos/tipo-de-cura seguem o mesmo molde), `antiRevive`, `limparInvocacoes`,
`limiar-consome`, `cdShift-mirado`, `vidaExtra`-passivo. **Cada um desses rebaixa AMARELOS que a triagem atual ainda
conta como travados** — exatamente como os 12 viraram 9 e a kitsune quase virou 31.

**Mas o AVISO é o próprio §61:** uma re-triagem por NOME erraria para cima DE NOVO (varredura por varredura). O valor
só aparece se cada AMARELO for reconciliado contra a lista real de fx/gatilhos de hoje. Isso é ~80% do custo de
traduzir. **Recomendação: NÃO uma re-triagem completa nova; e sim uma passada de RECONCILIAÇÃO sobre os 41 AMARELO** —
para cada um, confrontar o gancho-nome que o trava contra o vocabulário atual (existe agora? virou barato?). É
bounded (41 deuses, uma pergunta cada), alto-rendimento (vai revelar os "kitsunes escondidos"), e honesta (não promete
o que só a tradução entrega). O VERMELHO (29) provavelmente fica — são mecânicas estruturais (iniciativa, esquiva,
escolha-múltipla-de-efeito) que nenhum hook desta onda tocou. **Se o dono topar, faço a reconciliação dos 41 antes da
F1.5; senão, sigo traduzindo-para-descobrir (a tradução é o único degrau que não mente, e cada kit escrito é uma
reconciliação real de graça).**

---

## §68 — CAUDA DURA FECHADA: medusa (IMPL 28→29); duas decisões do dono registradas

Fechado o último kit da cauda com as duas rulings do dono:

**(A) EXCLUDE DO DoT-TICK — aprovado (registrado no `checar_cadeia`).** Um `N de dano` seguido de `puro/turno`,
`/turno` ou `por turno` é TICK de DoT (dano do efeito ao longo do tempo), não o dano DESTA habilidade. Padrão
específico (não casa "N de dano a 1 inimigo") — mesma família do `causam 0 de dano` do Pacificar. Fecha o Veneno da
Medusa ("8 de dano puro/turno"), o Sangramento da Piranha, e qualquer DoT-em-prosa futuro. A regra do dono cumprida:
trouxe o padrão exato antes de mexer; com o OK, apliquei.

**(B) DIVERGÊNCIAS DA FREYJA — aceitas como §54 (sem hook).** `aoCurar` dispara em qualquer cura de aliado (não só
"por Freyja"); "no turno seguinte" aproximado por `dur:2`. O dono decidiu: §54 (Freyja é a curadora do time, ninguém
distingue na prática) — não vale um gancho `aoCurar-porMim`. Fica anotado como divergência-conhecida-aceita.

**Medusa (hook 8):** `cruzarLimiar` ganha `consome` (zera as marcas ao petrificar). `Pedra` no vocabulário; limiar
em:3 → `atordoado` (petrificado ≡ atordoado, §54); lock-hab = `lockSkill`. Passiva = aoSerAtingido{contra:classe
Físico} → Veneno no atacante (§55, o exemplo canônico já tinha teste).

**FECHO DO LOTE-DE-HOOKS: 8 hooks → 9 kits, IMPL 12→29 (global).** A cauda dura (iansa/medusa/freyja), que parecia
exigir "ganchos de verdade", rendeu com hooks contidos porque os §53–§62 já tinham a fundação. **Sobra a 2ª onda
real:** kitsune (mas `dominado` JÁ existe — reavaliar na tradução, o §61 de novo), nefertem (bonusCura-facção),
amaterasu (modo Dia, adiada p/ F1.5). A meta honesta do §64 (12→~30 em 4 lotes) praticamente batida: 29.

---

## §67 — CAUDA DURA (parcial): iansa + freyja (IMPL 26→28); medusa aguarda o OK do exclude

Fechados os dois kits da cauda que NÃO tocam no `checar_cadeia` (decisão do dono: "iansa+freyja; medusa depois do teu OK").

- **iansa (hook 6)** — dois hooks pequenos: `t:'limparInvocacoes'` (destrói invocações inimigas) e o controle
  **`antiRevive`** (debuff proativo nos vivos; o snapshot do `matar` passa a reconhecer o `type`, além da propriedade
  `naoRevive`). Resto já limpo (aoCair-qualquerInimigo §49 + stripOne). Kit 100% do catálogo.
- **freyja (hook 7)** — a primitiva **`t:'condicional'`** (`se(estado) ? entao[fx] : senao[fx]`, rodada pelo próprio
  executor por recursão) + estado `aliadoCaido` + escopo `umCaido`. É controle-de-fluxo novo, reutilizável.
  **DUAS DIVERGÊNCIAS anotadas (o dono decide se merecem hook):** (1) a passiva usa `aoCurar`, que dispara em QUALQUER
  cura de aliado — não só "por Freyja"; é o §54 (Freyja é a curadora do time, ninguém distingue na prática), mas um
  2º curador distinguiria. (2) "no turno seguinte" está aproximado por `dur:2` (o timing exato é caracterização,
  dispensada para kits). Nenhuma bloqueia; ambas ficam no relato.

**PENDENTE — medusa (o item GATED):** precisa do exclude do `checar_cadeia` para o Veneno em prosa. O padrão específico
proposto: um `N de dano` seguido de `puro/turno`, `/turno` ou `por turno` é TICK de DoT (dano do efeito ao longo do
tempo), não o dano DESTA habilidade — falso-positivo idêntico em espírito ao `causam 0 de dano` do Pacificar. Não
captura dano real (nenhuma habilidade se descreve "N de dano/turno"). Aguarda o "OK" do dono no padrão antes de eu
mexer no checador (a regra do dono: "me diga antes de largar" nos padrões de checker). Com o OK, medusa fecha com:
exclude + `Pedra` no vocabulário de contador + `consome` no `cruzarLimiar` (limiar aplica mas não zera as marcas) +
`lockSkill`(hab) + petrificado=`atordoado`.

**IMPL 12→28 (global): 8 do lote-1 + 8 do lote-de-hooks.** Sobram da cauda: medusa (pendente OK) e, na 2ª onda real,
kitsune (mas `dominado` já existe) e nefertem (bonusCura-facção). amaterasu adiada p/ F1.5 (modo Dia).

---

## §66 — LOTE-DE-HOOKS: 5 hooks pequenos → 6 kits (IMPL 20→26), e o motor era mais rico do que a triagem via

Executado o plano do §65 (2ª onda = hooks pequenos, não um balde-gancho), com as 3 decisões do dono resolvidas
(cd-mirado, Dia adiado p/ F1.5, freyja-fx-condicional). **IMPL 20→26 em 5 hooks + 6 kits, todos CI-verde:**

| # | hook (linhas de motor) | kit(s) | nota |
|---|---|---|---|
| 1 | `vidaExtra` no `rodarFaz` + FX_TURNO | hercules | passiva de abertura arma a rede de sobrevivência |
| 2 | `t:'redirect'` (autoria) em aplicarFx | curupira | **quita a dívida do §62** — só o consumo existia |
| 3 | `seCond` em `danoBase` (reusa condOK) | xango | maior alavanca — também abre piranha |
| 4 | `cdShift` MIRADO (`unidade`/`soMaior`) + shield escopo:time | bragi, brahma | decisão do dono: 1 recarga / 1 aliado |
| 5 | `sangramento` no vocabulário (DoT) | piranha | seCond já bastava; só faltava a palavra |

**O §46/§61 mordeu a MIM na varredura:** grep pelos meus nomes inventados (`zeraRecarga`, `removerBuff`, `setFase`)
deu ZERO; os mecanismos existiam sob os nomes reais (`cdShift`, `stripBuffs`, `fase`, `revive`, `armazenaDano`,
`intercepta`, `condOK.alvoHp/alvoBuff`, `danoBase.seDia/porContador`). **O motor era muito mais rico do que a triagem
creditava** — por isso 6 dos "12 AMARELO-por-tradução" fecharam com hooks minúsculos: os §53–§62 já tinham feito os
80% difíceis.

**A NUANCE (dono): a lição-do-nome vale contra quem a ESCREVEU.** O §46 nasceu apontando o viés de classificar o
mecanismo alheio pelo nome. Aqui ele se virou para o implementador: **inventar o nome de um mecanismo e concluir que
ele não existe é o MESMO erro, na direção do construtor.** `grep zeraRecarga → 0` não é "não há redução de recarga";
é "não há `zeraRecarga`". A varredura por nome mente para os dois lados — o triador que lê a prosa e o implementador
que lê o motor. O antídoto é o mesmo: reconciliar contra o que EXISTE (ler a lista real de fx/gatilhos), não contra
o nome que a cabeça já tinha.

**DIVERGÊNCIAS DE ORÇAMENTO (req. 2 do dono — número do catálogo, marcado, NÃO corrigido):** Xangô/Trovão e Fogo
(30 em área contra buff) e Piranha/Águas Vermelhas (28 em área contra Sangrando/Encharcado) passam o teto de área
(22). São bônus CONDICIONAIS previstos — entram na allowlist do auditor junto de Dilúvio (Sobek, 30) e O Papão (38).
Não mexi nos números; registrei a exceção onde ela mora (o próprio auditor).

**"MÉTODO EXPÕE BUG ANTERIOR" — 4º caso (o auditor cego ao seCond):** ao escrever a Piranha (com `seEncharcado:28`),
o auditor de orçamento disparou — e ao consertá-lo para checar TAMBÉM o `seCond`, ele revelou que o 30-área do Xangô
(hook 3, já commitado e CI-verde) tinha ESCAPADO, porque o auditor não olhava seCond. Some ao ledger (§25
invocação-guarda, §50 gate naoRevive, §64 matar-sem-hp, **§66 auditor cego ao seCond**). O padrão de novo: um método
(kit real com seCond) expõe um buraco que o método anterior (kit sem seCond) não exercia.

**A MORAL (dono) — o melhor caso da série, porque é bug que EU introduzi e uma correção adjacente achou:** o 30-área
do Xangô passou VERDE três commits antes; foi um conserto vizinho (ensinar o auditor a ver `seCond`) que o denunciou.
E o porquê é a lição: **um auditor cego não FALHA, ele APROVA.** Cobertura que falta não grita — assina embaixo. Por
isso **ampliar a cobertura de um auditor SEMPRE exige re-rodar contra tudo o que já passou** — a coisa que o novo olho
enxerga pode já estar no verde. Foi exatamente o que aconteceu: o novo `Math.max(..., seCond)` reprovou um commit
antigo. Regra prática: todo alargamento de auditor é retroativo até prova em contrário.

**A CAUDA DURA que sobra (3 kits, cada um cruza território maior ou GATED):**
- **iansa** — 2 hooks: `t:'limparInvocacoes'` (destrói invocações inimigas) + um controle `antiRevive` novo (marca
  naoRevive proativo por 2 turnos nos vivos). Passiva/básico/habilidade já limpos (aoCair-qualquerInimigo + stripOne).
- **medusa** — precisa do **exclude do checar_cadeia** para o DoT em prosa ("8 de dano puro/turno" do Veneno é tick,
  não dano da habilidade) — território que o dono GATED (exclude específico); + `Pedra` no vocabulário de contador +
  `consome` no `cruzarLimiar` (limiar aplica mas não zera "perde as marcas"). Petrificado = atordoado; lock-hab = lockSkill.
- **freyja** — a primitiva de **fx condicional-por-estado** ("revive; se ninguém caiu, buffa o time"): controle de
  fluxo novo (≠ alterna/opcoes), o maior dos três + aoCurar-turno-seguinte.

**Nota p/ a 2ª onda:** `dominado` JÁ existe em CONTROLES — kitsune ("Domina 1 inimigo") pode estar menos travado do
que a triagem disse; reavaliar na tradução (o §61 de novo).

---

## §65 — LOTE 2: o verde acabou no lote 1, e a escada (§64) provou-se na hora — mas o balde não é UM gancho

Tradução-verificação dos 12 "verdes-restantes" contra o vocabulário REAL (não o nome-do-gancho). **Resultado:
ZERO escrevem limpos.** Cada um carrega UM gancho oculto que a triagem, classificando por nome, não via — o §64(A)
ao pé da letra. Mas a varredura da tradução também revelou o oposto do desânimo: o motor é MUITO mais rico do que a
triagem creditava (`revive`, `stripOne/stripBuffs`, `armazenaDano`, `invocar`, `fase`, `cdShift`, `intercepta`,
`regen`, `alvoHp/alvoBuff/alvoDebuff` em `condOK`, `seDia/seNoite/porContador{onde:alvo}` em `danoBase` — TODOS já
existem). O viés-do-nome me mordeu a mim primeiro: grep pelos MEUS nomes inventados (`zeraRecarga`, `removerBuff`,
`setFase`) deu zero; os mecanismos existiam sob os nomes reais. **Por isso a maioria dos 12 está a UM gancho pequeno
de fechar — os §53–§62 já construíram os 80% difíceis.**

**A tabela de lacunas (o gancho que falta a cada um, e quanto do kit já está limpo):**

| deus | passiva | básico | habilidade | milagre | lacuna única |
|---|---|---|---|---|---|
| curupira | ✓ | ✓ | **redirect-APPLY** | ✓ | §62 só construiu o CONSUMO do redirect; falta o fx que APLICA (resolve `destino` do alvo escolhido) |
| iansa | ✓ (fenrir) | ✓ stripOne | ✓ | **destruir-invocação** | não há fx que limpa `l.invocacoes` inimigas |
| hercules | **vidaExtra-na-passiva** | ✓ | ✓ | ✓ perfurante | `rodarFaz` (faz da passiva) não trata `t:'vidaExtra'` |
| medusa | ✓ (§55) | ✓ | ✓ agarrar(§54) | **limiar-CONSOME** | `cruzarLimiar` APLICA no limiar mas não zera o contador ("perde as marcas") |
| xango | ✓ (Rá) | ✓ | ✓ armazenaDano | **dano-cond-por-buff** | `danoBase` não bumpa dano por estado do alvo (buff/dot) |
| piranha | ✓ (§56+alvoHp) | ✓ | **dano-cond-por-DoT** | **idem** | mesma lacuna do xango: bump condicional por DoT do alvo |
| bragi | ✓ | ✓ | cd-granular | ✓ | DECISÃO: `cdShift` é do LADO inteiro; prosa diz "1 recarga" |
| brahma | ✓ | ✓ | ✓ | cd-granular | DECISÃO: idem — "1 aliado zera recargas" vs `cdShift` do lado |
| amaterasu | ✓ (reducao+fase) | — | Dia-regra-global | apply-cond-fase | DECISÃO: "aliados Aurora +8 no Dia" é regra intrínseca do Dia ou autoral? |
| freyja | aoCurar | ✓ | ✓ | branch-condicional | DECISÃO: "revive OU buffa se ninguém caiu" — fx condicional-por-estado (≠ alterna/opcoes) |
| kitsune | reducao-escala | ✓ | ✓ intercepta(isca) | **dominar** | 2ª onda: controle mental novo + reducao escalada por contador |
| nefertem | **bonusCura-facção** | ✓ | ✓ | ✓ regen | 2ª onda: condicionar bonusCura pela FACÇÃO de quem cura |

**As três camadas do "balde" — e por que NÃO é um gancho-balde só (a resposta à pergunta do dono):**

1. **GANCHOS PEQUENOS (5 hooks → 6 kits, IMPL 20→26).** Cada um ~poucas linhas, cada um fecha um kit quase-pronto:
   `seCond` em `danoBase` reusando `condOK` (→ **xango** + **piranha**); `t:'redirect'` espelhando o `intercepta`
   (→ **curupira**, e QUITA a dívida de autoria do §62); fx destruir-invocação (→ **iansa**); `vidaExtra` no
   `rodarFaz` (→ **hercules**); `consome:true` no `cruzarLimiar` (→ **medusa**).
2. **DECISÕES DO DONO (~4 kits, 26→~30).** cd-granularidade (bragi+brahma, uma decisão); regra-global-do-Dia
   (amaterasu); branch-condicional (freyja). Não faltam mecanismos — falta a INTERPRETAÇÃO.
3. **2ª ONDA REAL (2 kits).** kitsune (dominar) e nefertem (bonusCura-facção) — gancho de verdade.

**A meta ~30 É alcançável em 4 lotes — mas por HOOKS PEQUENOS + decisões, não por tradução limpa.** O "verde" como
categoria de-escrever-sem-tocar-o-motor acabou no lote 1 (os 8). Isto NÃO contradiz o GO do §64: é o §64(A) fechando
o ciclo — a tradução é a reconciliação final, e ela disse que o próximo passo barato não é um balde-gancho do topo
(bonusDano-escala, que flipa AMARELOS não-traduzidos), e sim o LOTE de 5 hooks minúsculos que terminam kits já 80%
prontos. **Decisão do dono: autorizar o lote-de-hooks (retoma o motor, cirúrgico) ou ir ao balde-gancho.** Recomendo
o lote-de-hooks — maior alavanca por linha, e fecha a dívida do §62 de quebra.

---

## §64 — A escada de tetos, o "rouba" no vocabulário, e o alvo honesto (GO do dono — escrevendo kits)

O dono deu GO: parar o motor, escrever os verdes; a métrica passa a ser **IMPLEMENTADOS** (12 na hora do go). Três
registros desta virada.

**(A) A ESCADA — prosa → varredura → triagem → tradução, cada degrau um TETO corrigido pelo seguinte.** É o §61 no
seu nível final. A prosa promete; a varredura conta ganchos; a triagem classifica por NOME-de-gancho (e por isso herda
o viés-do-nome, §46) e projeta — mas projeção sobre triagem é TETO, como a projeção sobre flip era teto. **A tradução
(escrever o kit) é a reconciliação FINAL:** confronta a prosa com o vocabulário real de `fx`, e pega o que nenhuma
varredura pega. Foi assim que "verdes" caíram para AMARELO ao serem escritos — oni (bonusDano é `+f.v` fixo, não
escala), atena (contraAtaca não filtra classe), chaac (bonusCura não condiciona por tipo-de-cura), iara (execução não
filtra status): cada um tinha nome-de-verde e substância-de-gancho, e só a caneta no `fx` revelou. **Nenhum degrau é
mentira; cada um é um teto que só o próximo baixa.**

**(B) O bug do Fenrir prova a mesma coisa PELO OUTRO LADO — "método expõe bug anterior".** O 1º kit real de execução
(Fenrir, `executaAbaixoDe:24`) fez 8 testes quebrarem em "unidade morta com HP>0": `matar` nunca zerava `hp`, e nada
antes tinha matado por execução para expor. Some ao ledger dos casos onde um método novo revela um bug antigo dormente:

| § | método que expôs | bug dormente |
|---|---|---|
| §25 | invocação-guarda | log registrava `absorvido` errado |
| §50 | antirevive (naoRevive) | gate meio-ligado |
| §64 | execução real (Fenrir) | `matar` não zerava `hp` |

O padrão: **o motor guarda bugs invisíveis até o primeiro uso que os exercita.** Escrever kits reais é esse uso — a
tradução não só baixa o teto da triagem (A), como testa o motor de um jeito que a construção isolada não testava.

**(C) "GANHA vs ROUBA" existe no vocabulário — registrado para a próxima varredura não reabrir.** "ganha 1 orbe" é
ganho próprio (limpo, sem gancho). "**rouba** 1 orbe" TIRA do inimigo — é o gancho `nega-orbe`, não construído. Prova
estrutural: Shuten "rouba 10 HP e 1 orbe" — o roubo-de-HP remove da vítima, e o orbe está na mesma cláusula, mesmo
verbo. A distinção é do verbo, não do número. Isso derrubou ~7 supostos-verdes que diziam "rouba orbe" para AMARELO.

**O ALVO HONESTO, corrigido:** a projeção original (12→~37 em 4 lotes) assumia 25 verdes; a tradução (A) + o "rouba"
(C) revelaram que o verde real é ~menos. **Meta honesta: 12 → ~30 em 4 lotes.** O que sobra de AMARELO é a 2ª onda,
liberada por um gancho-balde do topo — `bonusDano-escala-dinamica` (trava 11, flip ~5) é o candidato nº1.

---

## Decisões ainda ABERTAS

| Assunto | Situação |
|---|---|
| **~15 decisões dos 3 blocos (da varredura, §35)** | Decisão-mãe BATIDA (§36: passiva declarativa = F1.2). Faltam ~15 pontos, para o dono responder EM BLOCO (uma mensagem), com recomendação minha em cada: Bloco 1 (F1.3) morte/sobrevivência — piso-1-HP, execução HP/status/tempo, interações com revive-imune/`vidaExtra`; Bloco 2 (F1.4) controle — Selado≡Silenciado, Pacificar, Torpor, Medo, trava-Milagre, redirecionar; Bloco 3 (F1.5) modos/estado — escolha múltipla, alterna, ler Dia/Noite, invocações. Ver `docs/primitivas-faltantes.md`. |
| **`aoCair` — matador-bound vs qualquer-morte** | **RESOLVIDO (§49): qualquer-morte.** `quem:'qualquerInimigo'` construído (F1.3 morte 4/4); coexiste com `quem:'inimigo'` (matador, zeus). Falta ainda `quem:'aliado'`/`qualquerAliado` (erinias/nuwa/khnum — família F1.4). |
| **Nome dos elementos** | O design visual do dono usa Solar/Lunar/Vital/Caos/Vazio/Tempestade; a planilha usa Tempestade/Umbra/Maré/Aurora/Chama/Verdejante. Renomear é trivial no dado mas quebra ganchos: Maré aplica Encharcado, Chama aplica Queimadura, Aurora e Umbra ativam Dia e Noite. ~60 habilidades a retraduzir. |
| **Pick/ban** | Recomendado com força, ainda não desenhado. Sem ele o meta converge para 8 deuses e o gacha perde razão de existir. |
| **Passiva do Fujin** | Ou Raijin entra nos iniciais, ou Fujin ganha passiva autônoma. |
| **Dilúvio do Sobek** | 30 em área contra Encharcados, contra teto de 22. Condicional e o próprio Sobek precisa aplicar antes — único número acima do orçamento. |

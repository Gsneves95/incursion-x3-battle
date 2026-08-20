# Registro de decisões

Cada entrada tem o que foi decidido, a alternativa recusada, e **por quê**.
`CLAUDE.md` lista os invariantes; este arquivo explica de onde vieram.
O valor daqui é evitar que uma decisão seja desfeita por parecer arbitrária.

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

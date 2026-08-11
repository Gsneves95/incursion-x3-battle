# ESTADO — onde o projeto está

> Atualizado ao fim de cada sessão. Quem lê é uma sessão sem memória.

## Última sessão
**Data:** 2026-08-11
**Tarefa:** Plano da F1.2 sessão 2 — ordem de migração por DESTRAVE (leitura de dado).
**Resultado:** decompus as 12 passivas em gatilhos (ver `docs/passivas.md` → "Ordem das próximas sessões").
Só `bonusDano` existe; o resto ainda é hardcode. Contagem de DESTRAVE (deuses TERMINADOS por gatilho):
`danoIrredutivel`→2 (ogum, tyr), `reducao`→2 (sobek, thor), `porTurno`→2 mole (ra, ganesha), demais→1 ou 0.
Sequência que mais termina: **danoIrredutivel + reducao = 4 deuses** (os dois destraves mais sólidos).
Recomendo abrir a sessão 2 por **danoIrredutivel** (hardcodes de ogum/tyr adjacentes em `calcDano`, migração
cirúrgica, 2 deuses terminados). Registrado no §37 a LIÇÃO B (a regra "migração por deus" cancelou o item que
o próprio dono aprovara — é assim que se sabe que a invariante segura algo). **Rede de equivalência:** `ra` não
tem suíte que asserte a passiva, `thor`/`fujin` finas — antes de migrar sem asserção, adiciono caracterização
primeiro. **AGUARDA:** o dono escolhe o gatilho (ou a sequência) da sessão 2 a partir da tabela.

## Sessão — F1.2 sessão 1 (anterior)
**Data:** 2026-08-11
**Tarefa:** F1.2 sessão 1 — passiva declarativa, gatilho `bonusDano` com condição fechada.
**Resultado:** schema da passiva declarativa (`docs/passivas.md`): `passiva.fx=[{gatilho,v,escopo,quando}]`.
Vocabulário FECHADO de 9 condições em `E.VOCAB` (`condicoes`/`condicoesDef`); `valida_kit` valida a forma e
falha em voz alta (gatilho/condição/valor/reservada — provado); motor lê em `calcDano` via
`bonusDanoDeclarativo`; `tests/passiva.test.js` cobre as 7 condições avaliáveis + escopo self/time + dono-morto
+ ponta-a-ponta. **Achado que virou a sessão:** o "+N condicional (38)" não era uma forma — eram nove; o rótulo
agrupava por SINTOMA, não por mecanismo (lição em DECISOES §37). Fechei contra as **18** planas reais (não os 4).
**Migrei ZERO reais:** os 12 implementados têm passiva multi-parte e migração é por DEUS INTEIRO (§37) — nenhum
é migrável com um gatilho só sem deixar hardcode invisível; mecanismo provado num deus sintético. Cobertura das
18: **18/18 estrutural, 15/18 escrevíveis hoje** (babi/horus/tsukuyomi esperam uma tag da fase própria; validador
recusa com motivo, sem exceção). Precisei liberar o campo `inerte` no schema da passiva (Fujin já usava — não é
mudança de comportamento). Suítes atuais passam SEM alteração (18 marcos verdes). **PRÓXIMO:** sessão 2 da F1.2
(próxima categoria de passiva por frequência — imunidade estática 27, ou o dono escolhe a ordem).

## Sessão — decisões pós-varredura (anterior)
**Data:** 2026-08-10
**Tarefa:** Decisões pós-varredura — o dono montou o resto da Fase 1 (sem código).
**Resultado (decisões do dono, registradas):** a decisão-mãe foi batida — **passiva ganha schema
declarativo** e isso VIRA A F1.2, antes de execução/Selado (contamina como nada mais: sem ela, 89
passivas viram 89 `if` no motor, o oposto da F1.0a; ver DECISOES §36). Nova ordem da Fase 1:
- **F1.2** passiva declarativa (várias sessões; começa pelo "+N condicional" 38 kits, migra os 12 já
  feitos, prova comportamento inalterado; depois uma categoria por sessão, na ordem de frequência).
- **F1.3** Bloco 1 morte/sobrevivência — **piso-1-HP PRIMEIRO, execução depois**.
- **F1.4** Bloco 2 controle/vocabulário (Selado≡Silenciado, Pacificar, Torpor, Medo, trava-Milagre, redirecionar).
- **F1.5** Bloco 3 modos/estado/escolha múltipla.  **F1.6** arena de auto-jogo.  **F1.7+** kits por panteão.
A lição do "número que mudou 3×" foi registrada em DECISOES §35 (eu media a dimensão errada: `fx` em vez
de passivas). **PRÓXIMO:** plano da F1.2 enviado ao dono aguardando confirmação antes de código; e as ~15
decisões dos 3 blocos foram mandadas em bloco (com recomendação em cada) para o dono responder numa mensagem.

## Sessão — Varredura completa (anterior)
**Data:** 2026-08-10
**Tarefa:** Varredura COMPLETA das primitivas faltantes (100 kits), última tarefa de planejamento antes dos kits.
**Resultado:** `docs/primitivas-faltantes.md` — leitura da prosa inteira dos 100 kits × vocabulário real do
motor. Achado que fecha a conta: o número "muda toda vez" (12→11→4→7) porque contávamos a coisa errada —
o motor **já cobre ~90% das habilidades no nível de `fx`** (25/25 tipos com handler); o custo real está em
(a) `fx` declarado-mas-verde estreando (o trap do contador) e (b) **as 100 passivas são prosa pura,
hardcoded uma a uma** (11 feitas; 38 são "+N dano condicional" — colapsáveis num `bonusDano condicional`).
Tabelas: A=sem-fx (10 primitivas: execução, Selado, Pacificar, Torpor, multi-hit distribuído, vulnerabilidade,
reflete, piso-de-1-HP, redirecionar); B=fx-verde/parcial (Dia-Noite-ler, alterna data-driven, escolha múltipla,
invocações, cópia, contra-ataque, etc.); C=provadas; D=passivas por categoria. **~15 pontos precisam de
decisão do dono**, agrupados em 3 blocos (Morte&sobrevivência / Controle&vocabulário / Modos-estado-passivas).
**AGUARDA:** o dono monta o resto da Fase 1 a partir da tabela (quais viram tarefa, quais viajam, ordem dos lotes)
e resolve os 3 blocos de decisão. [RESOLVIDO na sessão seguinte — ver bloco acima.]

## Sessão F1.1 Rá + varredura parcial (anterior)
**Data:** 2026-08-10
**Tarefa:** F1.1 — 1º kit de contador (Rá) + varredura das primitivas faltantes.
**Resultado:** re-auditei a prosa INTEIRA da "Leva A" (regra nova do CLAUDE.md) e descobri que só o
**Rá** é escrevível hoje com fx existente — Kitsune e Susanoo arrastam mecânica NÃO provada (ver
abaixo). Escrevi **`data/deuses/ra.json`** (11→12 deuses): basico dmg15+Disco, habilidade dmgUp time+2
Discos, milagre 16+4/Disco consome; passivas em `engine.js` (+1 Disco/turno teto 6 em `iniciarTurno`;
aliados Aurora +5 em `bonusDano`). `V.contadores=['discoSolar']` + `valida_kit` valida `contador.nome`
(gatilho "1º kit de contador"). **O checador da F1.0e rodou pela 1ª vez com dado novo:** 12 kits, 135
conferências, **0 divergência**, +10 conferíveis + 1 não-conferível (ra.milagre "+4 por Disco",
condicional). Examinou o Rá de fato (contagem subiu 124→135) — 0 divergência é real, não skip; e tem
dentes (cadeia.test). Rá conferido em Chromium: 0 pageerror, basico dá 25 (15 + Brigid +5 + Aurora +5),
Disco acumula, log narra "Rá: Disco Solar +1". 17 suítes verdes.

**VARREDURA das 4 primitivas faltantes (dado, aguarda DECISÃO do dono onde cada uma entra):**
- **execução genérica ≤N HP: 7 executores** (Hades, Fenrir, Ammit, Izanami, Iara, Lugh, Morrigan) +
  Sun Wukong (imune). ≥5 → INFRAESTRUTURA, merece tarefa própria (a mesma que a F1.0c reescalou).
- **Selado: 3** (Hades, Anúbis, Ammit). Entre "viaja com o kit" e "infra" — decisão do dono.
- **dano-por-turno-por-contador: 1** (Izanami "6/turno por Maldição"). Viaja com o kit da Izanami.
- **dano-tomado-por-contador: 1** (Anúbis "+2 dano por Atadura"). Viaja com o kit do Anúbis.

**Leva A re-escopada (honesto, pela regra do full-prose):** só Rá saiu. Kitsune bloqueado por
invocar-guarda (mecanismo existe, 0 kit prova) + "5+ Caudas→Domina" (apply-condicionado-por-contador,
NÃO existe) + "a cada 3 Caudas +5 redução" (buff escalado por contador, não existe). Susanoo bloqueado
por "8 golpes distribuídos" (multi-hit distribuído, NÃO existe) + hook por-ataque. Entram quando suas
primitivas forem provadas.
- **DÍVIDA DE UI (F1.1): contador não aparece no retrato.** `campo.js` mostra `efeitos` e `dots`, não
  `contadores` — o Disco Solar do Rá é invisível na faixa (só no registro). 1º kit de contador expôs.
  Forma-alvo: uma faixa/badge de contador no retrato (via `NOMES_CONTADOR`). Não bloqueia; anotado.

## Sessão F1.1 primitiva 4 (anterior)
**Data:** 2026-08-10
**Tarefa:** F1.1 primitiva 4 — espalhamento / contágio (Maldição de Yomi da Izanami). ÚLTIMA primitiva.
**Resultado:** `espalharContador` iguala as unidades ao MAIOR contador entre elas (teto), roteando a
subida por `aposAcumular` (limiar dispara: "chegar a N é chegar a N"). fx `{t:'espalha', nome, max,
escopo}`. `primitivas.test §1e` (bordas): iguala ao maior · **fonte retém de graça** (está no máximo,
sem `if`) · espalhar 2× sem novo acúmulo não muda · teto · **contágio DISPARA o limiar de quem recebe**
(via aposAcumular). Aditivo NÃO (evita laço multiplicativo). §33 registra, e marca contágio+limiar como
combinação FORTE candidata a outlier na arena F1.4 (não é surpresa nem bug). 17 suítes verdes.
**COM ISSO O MOTOR TEM TUDO QUE OS 6 KITS PRECISAM.** As 4 primitivas de contador estão provadas em
isolamento; próximo passo = **escrever os 6 kits** (Rá/Anúbis/Kitsune/Susanoo/Izanami/Ah Puch), e o
checador da cadeia (F1.0e) entra em ação pela 1ª vez com dado novo — é para isso que ele existe.

## Sessão F1.1 primitiva 3 (anterior)
**Data:** 2026-08-10
**Tarefa:** F1.1 primitiva 3 — redução de HP máximo + clamp (Podridão do Ah Puch).
**Resultado:** `reduzirMaxHp` (piso 1) + campo `maxHpPerdido` (perda real guardada) + fx `restauraMax`
(Itzamná devolve o máximo SEM curar). Gancho `aposAcumular` une limiar (prim.1) e redução à mesma
mudança do contador. `primitivas.test §1d` (4 bordas): 2 Podridão→máx 100 e guarda 20 · **piso 1** ·
**o clamp NÃO mata** (5/10 + Podridão → 1/1 viva) · **restaura 120 sem curar**. **Piso 1 porque hp=0 é
morte e maxHp=capacidade** — se a decomposição matasse seria execução disfarçada sem limiar, e execução
é sempre declarada (§32). `restauraMax`: fx novo (TIPOS_FX), narra "recupera N de HP máximo". 17 suítes
verdes. **Aberto até o kit do Ah Puch:** `maxHpPerdido` na queda/revive (palpite: revive com máximo
reduzido) — trago com o kit.

## Sessão F1.1 primitiva 2 (anterior)
**Data:** 2026-08-10
**Tarefa:** F1.1 primitiva 2 — contador de CAMPO por lado (pool do time / Combo).
**Resultado:** novo store `st.lados[l].contadores` (pool do time), SEPARADO dos contadores por-unidade —
`contadorNoCampo` pergunta "quanto o time TEM (soma vivos)", o pool pergunta "quanto ACUMULOU" (não
muda na queda). `addContadorLado`/`getContadorLado` + fx `{pool:'lado', lado, max}` (gera),
`porContadorLado` (escala), `consomeContadorLado` (zera o pool do lado). Provado em `primitivas.test
§1c` com 4 bordas: acumula+teto 20 · pool ≠ unidade · 18+2×20=58 e consome · **pool sobrevive à queda
do gerador** · **os dois lados independentes** (geração simultânea, teto por-lado não somado, consumo
não cruza — onde o `_CAT` de módulo quase passou, §24). Pool PERMANECE na queda (senão o finalizador
"consome todo o Combo" viraria armadilha; e com 2 geradores "de quem é o Combo" não faz sentido — §31).
17 suítes verdes. Sem kit ainda.

## Sessão F1.1 diferido F1.0b (anterior)
**Data:** 2026-08-10
**Tarefa:** F1.1 — pagar o diferido da F1.0b: chave do contador no evento + narração.
**Resultado:** o evento `contador` agora carrega a CHAVE do contador no campo canônico `efeito`
(`{tipo:'contador',origem,valor,efeito:'discoSolar'}`); `NOMES_CONTADOR` (`ui/base.js`) + `nomeContador`
resolvem para o nome exibível ("Rá: Disco Solar +1"); `OBRIGATORIOS['contador']` exige `efeito`. Chaves
camelCase (discoSolar/atadura/cauda/combo/podridao/maldicao) — passam na varredura sem afrouxar regex.
**Reuso de `efeito` é decisão consciente (§30):** o campo já é polimórfico por `tipo`; ninguém lê
`.efeito` sem `.tipo`; resolução do contador é separada (`nomeContador`, não `rotuloEfeito`) — sem
ambiguidade, e reusar o canônico é o oposto de sinônimo (que a gramática proíbe). Migrei as tabelas de
`primitivas.test §1` (`Disco Solar`→`discoSolar`, `Podridão`→`podridao`) e `eventos.test` narra um
contador (chave→nome). `V.contadores` no schema fica p/ o 1º kit de contador. 17 suítes verdes.

## Sessão F1.1 primitiva 1 (anterior)
**Data:** 2026-08-10
**Tarefa:** F1.1 primitiva 1 — contador cruza limiar → aplica efeito (gatilho-no-acúmulo).
**Resultado:** motor ganhou `fx.limiar:{em, aplica}` (config no DADO) + `cruzarLimiar` — quando um
contador CRUZA `em` (de baixo para em-ou-acima), aplica o efeito UMA vez. Provado ANTES de qualquer
kit ("primitiva antes do deus"). **Reusei `tests/primitivas.test.js` §1** (é a home da primitiva de
contador — "somam, teto, escalam, consomem") em vez de criar `contadores.test.js`: novo bloco **§1b**
com as 3 bordas do dono — (1) dispara ao CRUZAR, uma vez (6ª acima NÃO redispara); (2) cruzar de uma
vez (3→5 por +2) dispara; (3) imunidade: cruza mas o controle falha, contador acumula, SEM retroação.
Schema aceita `limiar` (`valida_kit` valida `em` e `aplica.type ∈ V.efeitos`). Descoberta ao ler o
código (rule 7): `porContador`/`consomeContador`/`contadorNoCampo` **já existem e são testados** — a
família "condição-na-ação" (Kitsune "5+ Caudas", Rá "+4 por Disco") é mecanismo existente, não novo
(§29 registra as duas famílias). 17 suítes verdes. NÃO escrevi kit ainda (primitiva isolada).

## Sessão F1.0e (elo B) (anterior)
**Data:** 2026-08-10
**Tarefa:** F1.0e (elo B) — checador da cadeia de verdade `kits.json` (fonte) ↔ `data/deuses` (derivado).
**Resultado:** `tools/checar_cadeia.js` confere número a número (nome, custo, recarga, dano, cura)
na build (falha alto); DIVERGÊNCIA = presunção de erro no motor (kits.json é a fonte, §26/§28); só
aponta, não conserta. Rodou nos 11: **122 match, 0 divergência, 2 não-conferível (1,6%)** — sob o
teto de 20% do dono. **O checador se provou** (o dono: "se não achar divergência, desconfie"):
apontou `nezha.habilidade` — a máquina não tem `dmg` no `ab.fx` porque o Arsenal Celeste é `alterna`
e o dano da forma MANTO está **chumbado no `engine.js`**, não no kit (motor correto, mas dado fora do
kit — cegueira do checador p/ `alterna`/`opcoes`, e resíduo da F1.0a; anotado abaixo, NÃO vira
tarefa). Dentes provados em `tests/cadeia.test.js` (divergência sintética apontada). 17 suítes verdes.
Só o **elo B**; elo A (planilha↔kits.json) ficou aberto por critério (ver abaixo). Ver decisão 28.

## Sessão F1.0c (anterior)
**Data:** 2026-08-10
**Tarefa:** F1.0c — reconciliar o orçamento de dano (calibrado p/ vida 100) com a vida 120.
**Resultado:** ANÁLISE + reescala cirúrgica (nenhum valor de dano tocado). A vida virou 120 no
§15 SEM mudar o dano bruto (jogo ~20% mais lento, de propósito), mas números que são FRAÇÃO da
vida — limiar de execução, portão "acima/abaixo de N de HP", HP fixo de revive — derivaram em
silêncio (execução ≤25 era 25%, virou ~21%). Varredura das 57 strings + prosa do roster achou
**exatamente 19** (7 execução, 1 portão-alto, 4 portão-baixo, 7 revive; Osíris 2×). Escolhida a
opção **(c)** (reescalar ×1,2 só as frações; dano bruto e taxas ficam — CONTINUAÇÃO do §15, não
revisão). Aplicado: execução 20→24 / 25→30, Durga 70→84 (só o portão; 48/32 ficam), portão-baixo
50→60, revive 40→48 / 50→60 / 30→36 / 25→30 — tudo em `data/kits.json`; **só a Nezha** no motor
(revive 40→48 em `engine.js` + `data/deuses/nezha.json`). **Dois achados corrigiram a proposta:**
"não cai abaixo de 1" é BINÁRIO (1 HP em qualquer vida), fora do (c); e a Durga era BUFF acidental
("acima de 70" alargou a faixa) — deriva de fração corta nos dois sentidos. Nova
`tests/fracoes.test.js` (tabela FECHADA de frações, lê a vida do motor, TOL=0 para não mesclar as
faixas 20%/25%) trava adiante — os 73 futuros nascem certos. **16 suítes verdes; auditoria de teto
BRUTO segue verde** (prova de que nenhum dos 19 era dano disfarçado). Ver decisão 26.

## Sessão F1.0b (anterior)
**Data:** 2026-08-10
**Tarefa:** F1.0b — motor emite EVENTOS estruturados; um narrador TOTAL traduz para pt-BR.
**Resultado:** o motor **parou de escrever português**. `log()` empilha eventos `{tipo, ...}` em
`st.log` (antes ~57 strings pt-BR chumbadas), e `st.fim` virou `{tipo:'fim', resultado, lado?,
motivo?}`. Novo `src/ui/narrar.js` é o ÚNICO tradutor evento→pt-BR (resolve chave→nome pelo
catálogo da partida, `CATALOGOS[st.catId]`); o remendo `traduzirRotulos` (regex de "Jogador N")
**morreu**. A GRAMÁTICA está escrita ANTES em `docs/eventos.md` (contrato: 5 regras — `tipo`
decide o formato; campos canônicos; sempre chave, nunca nome; zero formatação; narrador TOTAL).
Nova `tests/eventos.test.js` **varre 24 partidas IA×IA (2824 eventos)** e falha se algum evento,
campo ou `motivo` sair de `E.VOCAB`, ou se uma "chave" for nome exibível; parte jsdom crava que
**tipo inventado aparece no registro** (regra 5) e que chave vira nome. **15 suítes verdes.**
Registro/resumo/banner conferidos em Chromium contra o dist fresco (0 pageerror) — narração
limpa ("Zeus → Cuca: 30 de dano", "Queimadura em Sobek: 5 de dano puro", "JOGADOR 1 VENCE").
**Decisões do dono aplicadas:** (A) DoT vira CHAVE (`efeito:'queimadura'`, sem campo isento;
schema agora valida `dot.nome ∈ V.dots`; mapa `NOMES_DOT` em `ui/base.js`); (B) narrador lê o
catálogo; (C) um evento por alvo (regra 6); (D) `motivo` é conjunto FECHADO.
**Rugas achadas e resolvidas (reportadas):** `motivo` reconciliado (o motor emite `sem_cura`/
`nao_revive`/`tempo`; `imune_tipo` estava listado mas nunca é emitido — saiu). Bug de conversão:
a invocação-guarda logava `dano{absorvido}` mas ela PERDE HP — virou `efeito:intercepta` + `dano`
limpo (regra 6). `ANEL`/`MANTO` (pt-BR chumbado no motor) foi para o kit da Nezha
(`ab.modos:[...]`, igual a `opcoes[].nome`; schema aceita `modos`). `narrar.js` é FUNDAÇÃO como
`base.js` (a build isenta os dois da checagem de direção ui→ui). Ver decisão 25.
**AGENDADO PARA A F1.1 — chavagem de sub-tokens de `contador` e `fase` (decisão do dono):**
`contador` e `fase` **não disparam nos 11 kits** (0 usam esses fx), então seus sub-tokens de
exibição — o **nome do contador** (`{u}: {nome} +N`) e a **fase** (`Dia`/`Noite`) — ficaram como
estão (o narrador os trata TOTAL). A F1.1 vai exercitar os dois (contadores acumuláveis e
Dia/Noite): ao provar essas primitivas com kit real, **chavear os nomes de contador e `Dia`/`Noite`**
(igual ao DoT `queimadura` da F1.0b) e resolver o nome exibível no narrador. NÃO esquecer quando
os kits chegarem — é o mesmo "primitiva antes do deus".
**Migração de testes (método muda, verificação fica):** `perspectiva`/`interface`/`rotas`
passaram a setar `st.fim` estruturado (a asserção sobre o banner renderizado é a mesma);
`motor`/`auditoria`/`interface` empilham DoT com a chave `queimadura` (a UI ainda exibe
"QUEIMADURA"). Sem tocar na lógica de nenhuma suíte além do necessário para o novo formato.

## Sessão F1.0a (anterior)
**Data:** 2026-08-09
**Tarefa:** F1.0a — separar DADOS de REGRAS no motor (início da Fase 1).
**Resultado:** os 11 kits saíram de `engine.js` (literal `GODS`, ~180 linhas) para **um
arquivo por deus** em `data/deuses/<key>.json` (extraídos mecanicamente do motor, fidelidade
garantida). Novo `src/catalogo.js` monta o `GODS` (Node lê via `fs`; browser recebe o array
`DEUSES` injetado pelo build) — ÚNICO dono de `GODS`; a UI lê o global, o motor não possui
dado de deus (grep confirma: zero dado de deus em engine.js). O motor **recebe** o catálogo
via `novoEstado`, que congela um snapshot e o indexa num **REGISTRO POR CHAVE** (`CATALOGOS[st.catId]`,
`catId` = hash do conteúdo que sobrevive ao `JSON.stringify`); a resolução lê o kit por
`kitDe(st,u)`, fora do estado. Novo `tools/valida_kit.js`: schema validado na build,
**vocabulário derivado de `E.VOCAB`** (não pode divergir do motor); build falha alto em
campo/custo/classe/alvo/`fx.t`/`eff.type` inválidos — provado corrompendo um kit (8 erros,
exit 1) e confirmando os 11 reais passam limpos. `aplicarFx` **RECUSA** `fx.t` desconhecido em
runtime (lança). Defesa fica no motor (regra) e é validada pelo mesmo schema. **14 suítes
verdes** (nova `catalogo.test.js`) SEM alterar suíte existente (`git diff` nas 13 antigas vazio).
Batalha/seleção idênticas em Chromium (0 pageerror). Ver decisão 24.
**Registro por chave (correção do dono):** um `_CAT` de módulo quebraria com duas partidas
coexistindo (a arena da F1.4 cria milhares de estados) — `novoEstado(B)` sobrescreveria o
catálogo de A. Agora cada `st` leva o `catId` e lê o SEU snapshot; clones da IA carregam só o
`catId` (sem custo). `tests/catalogo.test.js` trava isso. `ia.test` ~490ms (assar dava 1040).
**Critério "< 500 linhas" RETIRADO pelo dono:** era estimativa (supunha mais dado nas 900
linhas) e o motivo dele (motor dobra com os 73 kits) morreu ao mover kits p/ dados. Aceito
motor-só-de-regras em 799 linhas. **NÃO partir as regras agora** (refatoração especulativa).
**GATILHO MEDIDO:** se `aplicarFx` passar de **150 linhas** durante F1.1–F1.3 (que a editam
pesado ao provar as primitivas), extrair para `src/execucao.js`. Hoje `aplicarFx` ≈ 97 linhas.
**Forma-alvo (Fase 2, não implementar):** carimbo de versão do catálogo no estado salvo →
Provação usa kit vivo mas marca RE-VERIFICAÇÃO se divergir; Replay avisa se divergir. Ver §24.

## Sessão F0.5b (anterior)
**Data:** 2026-08-09
**Tarefa:** F0.5b — sistema de botões / INV 16 (último item da Fase 0).
**Resultado:** o sistema de botões já existia (4 níveis, 4 tamanhos, estados repouso/
pressionado/desabilitado, raio 3px, expansão invisível de toque). O que faltava era a
violação de **INV 16**: com sobreposição aberta havia 2 `.b--primary` no DOM (base atrás do
scrim + o da sobreposição) e — pior — a base seguia no caminho de **tabulação e leitor de
tela** (acessibilidade, não sutileza). Correção: quando há sobreposição **com scrim**, a
camada de base (`#baselayer`, novo wrapper `position:absolute;inset:0`, neutro de layout)
fica **`inert`**, e a sobreposição é sua IRMÃ no DOM (segue interativa); o primário da base
rebaixa como consequência. O **menu ⋯ não tem scrim** → não inerta a base (fica interativa;
não tem primário → sem conflito). INV 16 reescrito: "no máximo um primário visível E
acessível". Verificado em Chromium (inert bloqueia foco de `#bgo`/`#bend` de verdade; layout
da base idêntico) e por 12 asserções em `interface.test.js §13` (≤1 primário em toda
sobreposição — menu/filtro/kit/registro/ajuda/rendição/troca/resultado; base inerte com
scrim; nenhum focável solto; fechar restaura). **13 suítes verdes. FASE 0 COMPLETA** — só
falta o dono escrever o material da Fase 1.

## Sessão F0.5a-restante (anterior)
**Data:** 2026-08-09
**Tarefa:** F0.5a-restante — os 2 critérios de material que faltavam (auditoria F0.1).
**Resultado:** **crit. 2 (régua do chanfro)** refeita pela técnica de DUAS CAMADAS: o
elemento vira a camada de trás (cor da régua, `clip-path` 7px) e um `::before` a da frente
(preenchimento, `inset:1px`, `clip-path` 6px, `z-index:-1`, `pointer-events:none`,
`isolation:isolate` no pai) — sobra 1px de régua em TODO o perímetro, incluindo as
diagonais, que o `inset box-shadow` deixava nuas. Preenchimento e cor da régua por
superfície via `--placa-fill`/`--placa-regua`. **crit. 7 (material na barra de energia):**
`.energy` entrou no material (régua+chanfro+bisel), SEM grão (superfície pequena; grão só
nas grandes → critério 8 segue em 1 textura permanente na batalha). **Provado por imagem**
(método do dono repetido: placa exagerada 30px/régua 3px a 4× — nova tem régua nas 8
arestas, velha tem as 4 diagonais nuas). Placas de material: batalha 2 em repouso
(`.detail`+`.energy`), ≤3–4 com menu/popup; seleção 0 / 1 com filtro. Hit-test confirmou
pílulas e Trocar clicáveis (o `::before` não intercepta). **13 suítes verdes.** Fica só
**F0.5b** (botões) para a Fase 0 fechar.

## Sessão F0.4c (anterior)
**Data:** 2026-08-09
**Tarefa:** F0.4c — ligar a carteira real (grant inicial 1500, débito na invocação).
**Resultado:** achado um BUG que estava no ar — a carteira era FANTASMA: a invocação
rodava sobre um `S.gemas` local semeado do grantTeste (30.000), nunca do perfil, e o
custo era ficção (invocar era de graça). Agora: (1) grant inicial de 1500 é EVENTO DE
CRIAÇÃO em `novoPerfil(agora, grantGema)` — valor entra por parâmetro da borda (lê
`ECONOMIA.grantInicial.gema`), a função pura não vê global; (2) "zero é legítimo" por
PRESENÇA DE VERSÃO: `migrar(p, grant)` sobe `v<2 → v2` creditando 1500 UMA vez
(idempotente), então v2 com gema 0 = gastou tudo, sem fallback `|| 1500` em lugar
nenhum; (3) `carregar()` continua READ-ONLY e descreve um `evento`; `iniciar()` (novo,
o boot chama) persiste+loga o grant uma vez; (4) invocação: saldo insuficiente BLOQUEIA
antes de qualquer estado (sem pity, sem gravar) e o débito entra no commit ANTES de
revelar; (5) botão "+ DEV": crédito de teste (30.000) credita o perfil MAS marca
`perfil.dev`, loga `tipo:'dev-credito'` e acende um indicador `⚠ DEV` na tela — a nota
do dado ("nunca no perfil real") honrada por rastreio, não por proibição. Ver decisão 23.
Verificado em Chromium: perfil novo mostra 1.500; após +DEV, 31.500 + indicador. **13
suítes verdes.** Fila: **F0.4b** (ligar o pity do gacha ao perfil de verdade — hoje é
restaurado mas o modelo é um contador único; ver INTERIM em invocacao.js).

## Sessão F0.6b (anterior)
**Data:** 2026-08-09
**Tarefa:** F0.6b — altura fixa (428), largura fluida.
**Resultado:** a escala parava de cair junto com a tarja em proporção diferente de
2,164:1 (iPhone SE 667×375 escalava 0,720 → texto de 9px virava ~6,5px). Regra nova:
escala pela ALTURA (`min(altÚtil/428, teto 1,25)`), largura de design = `clamp(largÚtil/
escala, 780, 1200)`; se `largÚtil/escala < 780`, a largura manda (`escala=largÚtil/780`).
Altura de design SEMPRE 428. A regra virou **função pura ÚNICA** `calcularEnquadramento`
em `src/enquadramento.js`; o `fit()` (ui/base) só APLICA (largura por JS em `stage.style.
width`, escala no transform). O teto 1,25 evita borrar a arte de 168px em tablet. SE agora
**0,855** (+19%), medido em Chromium — palco preenche a largura, ~9px de tarja vertical;
tablet 1180×820 trava no teto com tarja vertical intencional (borda sutil). **Testes sem
recópia da fórmula:** `enquadramento.test.js` (13ª suíte, SPEC — os 6 casos da tabela
cravados à mão, único lugar com número escrito); `moldura.test.js` e `interface.test.js`
teste 14 **CHAMAM** a função e comparam com o que o navegador aplicou (escala + largura);
`moldura` ganhou casos de RETRATO (360×740, 412×915 → aviso de girar). **13 suítes verdes.**
**RESOLVIDO — piso de LEGIBILIDADE (decisão 22).** O piso de escala 0,80 do teste 9 estava
mal formulado: legibilidade é o TAMANHO FÍSICO do texto (`menorTextoDesign × escala × DPR`),
não a escala. Substituído por piso de **11px físicos**, matriz agora com **DPR 2 e 3**. Menor
texto do palco subiu de 7,5 → **8px** de design (correção no design, não no teste). Pior caso
`726×312 @ DPR2 = 11,7px` (era 10,9 antes do ajuste). CRAVADO nas duas suítes. Consequência:
tela cheia leva 0,729 → 0,841 no aparelho do dono → **o PWA é requisito de legibilidade**.
Fila: **F0.4c** (carteira lendo o grant 1500).

## Sessão F0.7 (anterior)
**Data:** 2026-08-09
**Tarefa:** F0.7 — perspectiva fixa do jogador (o lado é PERSPECTIVA, não turno).
**Resultado:** meu time SEMPRE à esquerda (com os discos), o oponente à direita (aba de
consulta), independente de quem age. Introduzido `ladoExibido()`/`ehMeuTurno()`/`modoPartida()`
em `turno.js` (um lugar só, sem ifs espalhados): hot-seat acompanha `st.ativo` (a tela inverte,
como antes → **nunca entra em espectador**); vs CPU fixa no humano; online (F5) no lado da
conexão. **Modo espectador** no turno do oponente: meus discos apagados e sem toque, aba dele
fechada e não abre, nenhum alvo pulsando, botão primário vira indicador de espera, relógio
segue com o tempo DELE — mas o ESTADO (vida, escudo, efeitos, **energia dele em mini-pips na
placa do topo**) permanece visível. **Resumo do turno**: ao voltar, o que o oponente fez
(2–3 linhas no painel de detalhe, some ao 1º toque). **Rótulos por MODO** (`rotuloLado`): vs
CPU/online falam de "Você"/"CPU"/"Oponente"; hot-seat mantém "Jogador 1/2". O **motor
continua neutro** (emite "Jogador N"); a visão **traduz** por cima (log, banner, topo) — é
REMENDO documentado, ver a dívida abaixo. Barra de energia agora é sempre a minha. 12ª suíte
`perspectiva.test.js` (perspectiva nos dois turnos, espectador, hot-seat inverte, resumo,
rótulos por modo). As 11 anteriores passam sem edição (interface roda em hot-seat → no-op).
**12 suítes verdes.** Fila: **F0.6b** → **F0.4c**.

## Sessão de energia (anterior)
**Data:** 2026-08-09
**Tarefa:** Geração de energia com sorte (parâmetro, não valor fixo).
**Resultado:** bloco `energia` em `data/economia.json` (`modo "ponderado"`, `pesoTime 0.75`,
`pesoLivre 0.25` — PROVISÓRIO, o dono ajusta jogando). O motor lê de `st.energia` (o cliente
passa `ECONOMIA.energia` em `novoEstado`); **sem config → fallback `time`/1.0**, contrato de
compatibilidade que preserva as 9 suítes sem edição. Sorteio PURO com semente em
`sortearElemento` (usado em `iniciarTurno` e na passiva do Ganesha). **Ponto fino travado por
teste:** modo `time` = 1 sorteio/energia (fluxo do RNG idêntico); `ponderado` = 2 — mexer nisso
quebra 4 suítes. `data/kits.json`: **0 básicos e 1 habilidade de 100** usam "livre" (só
Milagre/Defesa, cd 4) → estrangeira é matéria de conversão 3→1, e o peso subiu de 0,6 p/ 0,75
por causa disso. Nova suíte `energia.test.js` (11ª): testes 7–10 + medições (500 partidas
IA×IA/célula): duração +1,8% variado / +4,9% mono (teto 20%), estrangeira parada 1,25/1,78 (< 4).
Barra de energia já mostra cor com saldo>0 (confirmado); conversão já drena estrangeira
(gasta o mais abundante). DECISOES §21 com a tabela, o dado do item 6 e o porquê de não ser
uniforme. **11 suítes verdes.** Fila: **F0.7** (perspectiva — levantamento pronto, esperando
2 decisões suas) → **F0.6b** → **F0.4c**.

## Sessão F0.6 (anterior)
**Tarefa:** F0.6 — enquadramento no celular (o jogo cortava à direita, injogável).
**Resultado (passos 1 e 2 de 4):** **Passo 1** — painel de diagnóstico temporário
(`#diag`, oculto; abre por `?diag` ou 3 toques no carimbo de build) que MEDE antes de
corrigir; a linha `rect` (`getBoundingClientRect` com aviso `⚠ EXTRAPOLA`) foi decisiva —
sem ela a medição diria "está tudo certo" com o jogo cortado. Medição do aparelho do dono
(inner 726×312, safe 0) provou que a causa era **posição, não escala**: o `transform:scale`
não encolhe a caixa de layout, então o palco de 926px transbordava à direita
(rect antigo L125 T58 **R801** B370 ⚠, com R801 > 726). **Passo 2** — corrigido SÓ isto:
`.stage` virou `position:absolute; left/top:50%; transform:translate(-50%,-50%) scale(S);
transform-origin:center`, e a escala passou a ler `visualViewport` (com `innerW/H` de
reserva) num lugar só, descontando safe areas (zero no aparelho, sem desconto duplo).
Refit em resize/orientationchange (+250ms atrasado)/visualViewport. Rect novo medido em
726×312: **L25 T0 R701 B312, sem ⚠**, sem rolagem — palco 675×312 centrado. `interface.test`
linha 609 passou a extrair a escala do `scale(...)` (método de medição, asserção intacta).
Dono confirmou no aparelho. **Passo 3 (modo app):** manifest + 2 ícones (192/512) como
**ARQUIVOS REAIS** em `web/`, servidos no Pages. Tentei primeiro embutir por Blob (arquivo
único), mas o CDP provou que o Chrome **recusa instalar** manifest `blob:`
(`start-url-not-valid`); com arquivos reais o `getInstallabilityErrors` fica **vazio**.
Dono decidiu: o invariante "arquivo único" vale para o dist de dev, não p/ o publicado
(registrado no CLAUDE.md). `display:fullscreen`, `orientation:landscape`, tema `#05040c`.
`requestFullscreen` oferecido no **1º gesto** (once, try/catch — oferece, não força), saída
no menu ⋯ ("Tela cheia"/"Sair da tela cheia"), refit em `fullscreenchange`. Guarda de
jsdom (`/jsdom/` no UA) evita o "Not implemented" do canvas no smoke. **UX:** painel de
diagnóstico ganhou ✕ (única parte clicável; `pointer-events:none` no resto) e texto em
`#diagtext`. Medido em Chromium — **tela cheia 800×360: escala 0,8411** (palco 779×360,
rect L11 T0 R789 B360); matriz de 9 tamanhos × (sem / com safe 48px) **toda dentro da
viewport, sem rolar**. 9 suítes verdes.
**Passo 4 (matriz):** decisão do dono — **playwright como devDep + CI**. `playwright`
entrou nas devDependencies (antes: só jsdom); `tests/moldura.test.js` (**10ª suíte**) roda
em **Chromium real** (o jsdom não faz layout → `getBoundingClientRect` é 0, não mediria o
rect — foi o rect que achou o bug do passo 2). A matriz cobre 9 tamanhos × (sem / com safe
48px lateral) e FALHA se o palco extrapolar a viewport, se a página rolar, se invadir a
safe-area ou se a escala não for a de caber. Entrou no `npm test` (roda sempre) + script
`test:frame`. Novo workflow `.github/workflows/ci.yml` (push/PR): `npm ci` →
`npx playwright install chromium` → `npm test`. O teste acha o Chromium pré-provisionado em
`/opt/pw-browsers` no dev e deixa o playwright resolver no CI. **10 suítes verdes.**
Oferta de tela cheia agora é **no máximo uma por sessão** (recusa não insiste a cada toque;
memória de sessão hoje, migra p/ perfil na F3). **F0.6 fechada — próxima é a F0.6b.**

## Sessão de economia (anterior)
**Tarefa:** Reconciliação de economia + invocação lendo `data/economia.json`.
**Resultado:** criado `data/economia.json` (fonte única, gerada da decisão do dono);
`invocacao.js` passou a **ler dele** — ZERO literal de taxa/pity/custo. Aplicadas as
decisões: SS 3% / S 17% / A 80%; **pity 60 DURO** (removidos soft pity, garantia de S
e **50/50**); custo 150 / **1350** (desconto); grant de teste 30000 (nunca toca o
perfil). Removidos do código/dados/interface: `5★/4★`, tier `B`, `gf`, `p4`/`p5`
(→`pity`), pergaminhos (`📜`), e o 2º argumento morto de `pull`. Comentários que
descreviam mecânica removida → apagados (o "porquê" está em DECISOES §20). O teste de
pity virou **determinístico por semente** (seed 5: garantia dispara no 60º; seed 1:
SS natural zera o contador) — antes passava ~84% por sorte sem exercitar o pity;
apertar 80→60 foi rigor, não cosmético. `build.js` embute `ECONOMIA` (sem fetch).
9 suítes verdes. **F0.4c (carteira lendo o grant 1500) é a próxima.**

## Sessão F0.4b (anterior)
**Tarefa:** F0.4b — Ligar o pity da invocação ao perfil.
**Resultado:** sorteio virou **função pura com semente** (`INV.sortearLote(seed,banner,
pity,n)`, RNG `mulberry32` do motor — o simulador da Fase 3 chama só ela). A mutação
do perfil mora em `perfil.js` (`registrarInvocacao`), e `invocacao.js` compõe. Ordem:
sortear → aplicar → **salvar → só então revelar** (recompensa commitada antes de
aparecer; zero janela de perda). O histórico guarda **semente + pity de entrada** (toda
invocação reproduzível). Pity de SS agora persiste no perfil e é restaurado no boot.
`invocacao.test.js` **passou sem mudança**. `perfil.test.js` +2 casos (valida contra
ROSTER não GODS; registrarInvocacao + pity persistido). 9 suítes verdes.
**INTERIM:** o modelo guarda **um** contador de pity (`desdeUltimoSS`); restaurado no
banner principal. Pity por-banner e persistência do 50/50 (`gf`) ficam para a
reconciliação de economia (ver Divergências). Carteira (gemas) NÃO migrou → **F0.4c**.

## Sessão F0.4 (anterior)
**Tarefa:** F0.4 — Perfil e persistência.
**Resultado:** `src/perfil.js` (modelo + funções PURAS: novoPerfil/adicionarDeus/
salvarTime/removerTime/creditar/debitar/marcarFavorito/concluirProvacao + migrar +
problemaDeForma) e `src/armazenamento.js` (carregar/salvar/apagar + histórico em chave
própria). **Chave única `incursion:perfil`** (histórico em `incursion:historico`,
dono separado). `salvar()` devolve {ok,erro} — falha vira aviso, não silêncio.
`carregar()` valida a FORMA (não só JSON) e sempre passa por `migrar()`. Boot carrega
o perfil; "Apagar dados" no menu ⋯ com confirmação NOMEADA. `tests/perfil.test.js`
(9ª suíte): novo perfil, pureza, creditar/debitar sem negativo, time acima do limite,
round-trip, migrar no caminho normal, salvar que reporta exceção, 4 formas inválidas
+ JSON quebrado, histórico separado. Verificado no navegador: 777 gemas persistem após
reload (uma chave só), apagar zera e regrava, 0 pageerror. 9 suítes verdes.
**F0.4b (invocação/pity) NÃO feita — separada de propósito.**

## Sessão F0.3 (anterior)
**Tarefa:** F0.3 — Quebrar o `view.js`.
**Resultado:** `view.js` **939→64 linhas** (só orquestrador). Extraídos: `src/turno.js`
(controlador de turno/relógio/ação, não-ui, com injeção `configurarTurno` para não
apontar para cima), e `src/ui/{base,topo,campo,painel,sobrepor,selecao}.js` — cada um
com HTML + seu próprio `ligar<X>()`; o `ligar()` do view virou despachante. Nenhum
módulo > 300 linhas (maior: selecao 276). Camadas engine→turno→rotas→ui/base→ui/*→view.
`build.js` ganhou **checagem de direção ui↛ui** (falha se um ui/ chamar função de
outro ui/) e **smoke de carga jsdom** (falha se símbolo faltar por ordem de
concatenação). O `#bnew` deixou de mexer no estado da seleção (era ui→ui); virou
`ir('selecao',{novo:true})` + `aoEntrarSelecao`. Guarda `st.fim` do relógio extraída
para `tique()` e travada por teste (V1). 8 suítes verdes; dist +0,25% (< 2%); sem
regressão visual. Editada só a 1 linha já autorizada do `interface.test.js`.

## Sessão F0.2 (anterior)
**Tarefa:** F0.2 — Rotas e navegação.
**Resultado:** criado `src/rotas.js` (navegação pura: `ir`/`voltar`/`rotaAtual`/
`paramsAtuais`/`registrar`/`hooksAtuais`/`resetRotas`, com pilha de histórico). O
`render()` virou despachante por rota; os ganchos `aoEntrar`/`aoSair` são donos do
ciclo de vida (relógio + limpeza de sobreposição, num lugar só). **Batalha entra por
substituição, não empilha** (DECISOES §17) — `voltar()` não abandona a partida. As 3
telas existentes foram roteadas (`selecao`/`batalha`/`invocacao`); `pick`→`selecao`
sem alias. `tests/rotas.test.js` novo (8ª suíte). Editada **1 linha** do
`interface.test.js` (`tela='pick'`→`ir('selecao')`), sem tocar em asserção. 8 suítes
verdes; navegação verificada no navegador (0 pageerror). **view.js 922→939 (+17):
não encolheu** — a lógica saiu para `rotas.js`, mas os 3 helpers de ciclo de vida
somam mais que os resets consolidados; a redução de `view.js` é a F0.3.

## Sessão F0.1 (anterior)
**Tarefa:** F0.1 — Inventário e reconciliação.
**Resultado:** criado `docs/inventario.md` (tudo derivado de código, com o comando
à mostra em cada número); `CLAUDE.md` e `DECISOES.md` reconciliados (correção do
"4 suítes" → 7; entrada §16 sobre a CPU); este `ESTADO.md` criado. Zero mudança de
comportamento. 7 suítes verdes. **Três achados que mudam planos:** (1) só **1 das 12
primitivas está provada por kit real** → a Fase 1 muda; (2) achada **1 violação de
invariante (INV 16)**, e só 5 dos 18 foram auditados; (3) a régua do chanfro por
`inset box-shadow` **não cobre as diagonais** (confirmado por teste) → F0.5a exige a
técnica de duas camadas.

## Situação atual
- **Deuses implementados: 11 de 100** — zeus, ogum, tyr, sobek, brigid, ganesha,
  cuca, fujin, nezha, thor, hera. (`Object.keys(GODS).length`)
- **Primitivas: 12 implementadas, mas só 1 PROVADA por kit real.** A única provada
  por deus dos 11 é **seleção de 2 alvos** (Thor/Hera/Nezha). As outras 11 têm código
  + teste em isolamento, mas **nenhum deus implementado as usa** (Dia/Noite, invocação,
  revive, contadores, copiar, dano armazenado, contagem de morte, Vida Extra,
  interceptar, contra-atacar, escolha múltipla). Ver `docs/inventario.md` §2b.
  → **Os 89 kits estão desbloqueados por primitiva IMPLEMENTADA, não provada.** A
  Fase 1 começa provando as 11 (1 deus por primitiva) antes dos lotes.
- **Telas existentes:** 3 — `selecao`, `batalha`, `invocacao`. **Com roteador**
  (`src/rotas.js`): `render()` despacha pela rota; ganchos `aoEntrar`/`aoSair` donos
  do ciclo de vida; batalha entra por substituição (não empilha).
- **Visão modular:** `src/turno.js` (controlador) + `src/ui/{base,topo,campo,painel,
  sobrepor,selecao}.js` + `src/view.js` (orquestrador, 64 linhas). Camadas
  engine→turno→rotas→ui/base→ui/*→view; `build.js` valida direção ui↛ui e faz smoke
  jsdom. Estado de UI ainda global (o doc da F0.3 proíbe estado novo).
- **Perfil/persistência:** `src/perfil.js` (puro) + `src/armazenamento.js`
  (localStorage, chave `incursion:perfil` + `incursion:historico`). Boot por `iniciar()`
  (carrega + aplica/persiste/loga o grant inicial ou a migração v2 uma vez); "Apagar dados"
  no menu ⋯ (recria com grant, loga recriação). **Carteira REAL (F0.4c):** grant inicial
  1500 em `novoPerfil`, invocação debita `perfil.moedas.gema` no commit antes de revelar,
  insuficiente bloqueia sem avançar estado, botão "+ DEV" credita marcando `perfil.dev`.
  Pity do gacha ainda NÃO ligado por banner (F0.4b / migração v3).
- **Suítes:** 14, todas verdes (motor, **catalogo**, capacidades, primitivas, auditoria, perfil,
  ia, rotas, **enquadramento**, interface, invocacao, **perspectiva**, **energia**, **moldura**).
  A `moldura` roda em Chromium real (`playwright` devDep); as outras 13 são node/jsdom.
  `enquadramento` é a SPEC pura da regra de enquadramento (F0.6b); `energia` simula 500
  partidas IA×IA (~16s).
- **Enquadramento (F0.6b):** `src/enquadramento.js` `calcularEnquadramento({larguraUtil,
  alturaUtil})→{escala,larguraDesign}` — regra ÚNICA (altura fixa 428, largura fluida,
  teto 1,25). `fit()` só aplica. Teste 9 = piso de LEGIBILIDADE 11px físicos (menor texto
  8px design × escala × DPR{2,3}), cravado — ver decisão 22.
- **Perspectiva/modo (F0.7):** `ladoExibido`/`ehMeuTurno`/`modoPartida` em `turno.js`; meu
  time fixo à esquerda; modo espectador no turno do oponente; `rotuloLado` (Você/CPU/Oponente
  ou Jogador N por modo); motor neutro + `traduzirRotulos` (remendo) na visão.
- **Geração de energia:** `data/economia.json` bloco `energia` (ponderado 0.75/0.25); motor
  lê de `st.energia`, fallback `time`/1.0 (compat). Sorteio puro em `sortearElemento`.
- **Enquadramento/modo app (F0.6):** palco fixo centralizado (`translate(-50%,-50%)
  scale`), escala por `visualViewport`; **manifest + ícones como ARQUIVOS REAIS** em
  `web/` (o blob: não instala — Chrome recusa por `start_url` inválido, provado por CDP;
  o `build.js` copia p/ `dist/` e o `pages.yml` p/ `site/`). `requestFullscreen` no 1º
  toque (uma vez por sessão), saída no menu ⋯, refit em `fullscreenchange`. Painel de
  diagnóstico atrás de `?diag`/3-toques, com ✕.
- **CPU:** IA gulosa de 1 lance (`src/ia.js`) controla o J2; ligada por padrão.
- **Material (F0.5a + restante FEITO):** aplicado a painéis/menu/popups + moldura do campo
  + **barra de energia do topo**. Régua pela **técnica de duas camadas** (elemento = cor da
  régua chanfro 7px; `::before` = preenchimento inset 1px chanfro 6px) — acompanha as
  diagonais, o que o `inset box-shadow` não fazia. Só **F0.5b** (botões) falta na Fase 0.

## Próxima tarefa
**ID e nome:** **F0.4b — ligar o pity do gacha ao perfil de verdade.** Hoje o pity é
restaurado do perfil no banner principal, mas o modelo é um contador único
(`invocacao.desdeUltimoSS`) — o alvo é pity POR BANNER (migração v2→v3, ver seção de
migração). Insumo: `invocacao.js` (INTERIM marcado), `perfil.js` `registrarInvocacao`.

**FEITO nesta sessão — F0.4c (carteira real):** `novoPerfil(agora, grantGema)` semeia o
grant LENDO de `data/economia.json` (grantInicial 1500, por parâmetro na borda, nunca
literal); a invocação debita `perfil.moedas.gema` via `debitar` no commit ANTES de revelar,
saldo insuficiente bloqueia sem avançar estado; grant de teste 30.000 credita mas MARCA o
perfil (`perfil.dev` + `dev-credito` + `⚠ DEV`), fora do "perfil real" por rastreio. A
migração v<2→v2 backfilla o grant. Ver decisão 23.

**Depois (F0.5, visuais, colar juntas no fim da fase):**

**Ainda na fila (visuais, para colar juntas no fim da fase, F0.5):**
- ~~**F0.5a-restante:**~~ **FEITO** — crit. 7 (material na barra de energia) e crit. 2
  (régua por duas camadas) fechados e provados por imagem. Ver inventário §7.
- ~~**F0.5b:**~~ **FEITO** — o sistema de botões já existia (4 níveis, tamanhos, estados,
  raio 3px); o que faltava era INV 16 sob sobreposição, resolvido por `inert` na camada de
  base (ver inventário §4c). **FASE 0 COMPLETA.** Próximo: o dono escreve o material da
  Fase 1 (quebrar engine.js → provar 11 primitivas com 1 deus real cada → arena → ~78 em
  lotes) no formato da Fase 0.

**O que a próxima sessão precisa saber antes de começar:**
- O `CLAUDE.md` é o contrato: **fato desatualizado** se corrige; **violação de
  invariante** se registra no inventário e se avisa o dono — não se reescreve o
  invariante.
- Estado de UI agora dividido: sessão em `src/view.js` (topo do arquivo), relógio/IA
  em `src/turno.js`, seleção em `src/ui/selecao.js`. Ainda globais no escopo
  concatenado (o doc da F0.3 proíbe estado novo) — a extração para um store é
  candidata a fase futura, não urgente.
- Screenshots usam `playwright-core` + Chromium em `/opt/pw-browsers/chromium-1194`,
  instalado com `--no-save` e desinstalado antes do commit (devDependency = só
  `jsdom`). Deploy no GitHub Pages: push na `main` + `workflow_dispatch` manual do
  `pages.yml` (o push sozinho não vem disparando o workflow).

## Lições
- **Refactor que move ciclo de vida tem que levar as guardas junto — e o teste na
  mesma tarefa.** A guarda `st.fim` do relógio NÃO sobreviveu à F0.2: ela reapareceu
  na F0.3 (em `src/turno.js`, arquivo novo). Ou seja, foi reintroduzida, não
  preservada — entre F0.2 e F0.3 provavelmente havia bug real (relógio contando com
  a partida encerrada). Não repetir: ao mover relógio/turno/ciclo de vida, mover as
  guardas no mesmo passo e travar com teste ali.

## Verificações pedidas pelo dono — status
> Verificação pedida NÃO é opcional nem vira bônus. Registrar aberta E resolvida.
- **A — relógio pós-vitória (F0.3): RESOLVIDA.** A guarda `st.fim` sobreviveu à
  mudança para os hooks; vive em `src/turno.js` `tique()` (e em `talvezIA`/`passoIA`).
  Trava de teste em `tests/rotas.test.js` (partida encerrada → tique não conta nem
  passa o turno). Não era bug.
- **B — os 3 helpers (F0.3): RESOLVIDA.** `limparSobreposicao()` (view.js, limpa
  sobreposição; chamado por aoSair de selecao/invocacao/batalha), `pararRelogio()`
  (turno.js, limpa o relógio; chamado por sairBatalha), `sairBatalha()` (view.js,
  composição; aoSair da batalha). Responsabilidades distintas.

## Auditoria de invariantes — só 5 dos 18 verificados (ABERTA)
Verificados contra o código na F0.1: **1** (motor puro), **10** (abertura 1/3),
**13** (tocar não gasta), **14** (relógio não pausa), **15** (inimigo só-leitura) —
todos OK, exceto que se achou **1 violação: INV 16** (2 primários no DOM sob
sobreposição) — **corrigida na F0.5b** (base `inert` sob scrim; invariante reescrito).
**Pendente auditar os 12 restantes:**
2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 17, 18. Fazer numa
sessão de reconciliação ou ao encostar em cada área.

## Descobertas que ainda não viraram tarefa
> Notado durante o trabalho; não corrigir aqui.

- **DÍVIDA: botão "+ DEV" e a marca `perfil.dev` SAEM ANTES DO RELEASE (F0.4c).** O crédito
  de teste (grantTeste 30.000) credita o perfil de verdade para exercitar invocação sem
  grindar, mas contamina: marca `perfil.dev`, loga `dev-credito`, acende `⚠ DEV`. É
  afordância de protótipo — o botão, o `topup()`, o campo `perfil.dev` e o indicador têm de
  sair (ou ficar atrás de um gate de build) antes de qualquer jogador real. O `grantTeste`
  em `data/economia.json` sai junto. Quando sair, remover também o ramo `if (p.dev)` de
  `problemaDeForma` — ou mantê-lo só para migrar perfis já contaminados para limpos.

- **~~DÍVIDA: o motor ESCREVE TEXTO DE INTERFACE~~ — PAGA na F1.0b (2026-08-10).** O motor
  emitia strings pt-BR no log e `st.fim` string. Agora emite EVENTOS estruturados (`docs/eventos.md`),
  `src/ui/narrar.js` traduz na hora de exibir, e o remendo `traduzirRotulos` foi removido. A
  varredura `tests/eventos.test.js` mantém o contrato. Ver decisão 25. (O motor roda no servidor
  da Fase 5 sem uma string de português; localização passa a ser trocar o narrador.)
- **~~F1.0e elo B~~ FEITO (checador kits.json↔data/deuses na build).** Ver "Última sessão". Fica a
  cegueira anotada: `alterna`/`opcoes` (Nezha Arsenal Celeste; Lugh/Nüwa) têm o `fx` **chumbado no
  `engine.js`**, não no kit — o checador não os confere (não-conferível) e é resíduo da F1.0a (dado
  de kit no motor). NÃO vira tarefa agora (objetivo é deus no jogo). Se um dia se mover esses fx para
  o dado, o checador passa a cobri-los.
- **F1.0e ELO A — tarefa ABERTA (planilha ↔ kits.json), quando a Fase 1 fechar.** Não vira F1.0f
  porque não contamina conteúdo futuro (kit novo nasce do kits.json, não da planilha) — é diagnóstico
  de dívida que já existe. Método já decidido: **parse cru do XML, sem dep** (a planilha
  `docs/INCURSION_Roster_e_Kits_ESTILO_NA.xlsx` é zip de XML: `xl/sharedStrings.xml` + `xl/worksheets/`).
  Divergências já conhecidas a quantificar: o Combo "pool do time, teto 20" (só na planilha) e os
  "100 de HP para todos" (planilha parada desde o §15). Entregável: **quantos kits têm dado só na
  planilha.** Ver decisão 28.
- **F1.1 (depois da F1.0e): SPEC TRAVADA — contadores acumuláveis, 6 deuses.** Rá (acumula no dono,
  teto 6, escala, consome), Anúbis (acumula no ALVO, limiar 4→Selado, +2 dano/Atadura), Kitsune (teto
  9, limiares 3→redução e 5→Domina, escala +3, consome), Susanoo (**Combo = contador de CAMPO por
  lado, teto 20**, gera 2/ataque, escala +2, consome), Izanami, Ah Puch (Podridão reduz HP MÁXIMO −10,
  clampa `hp=min(hp,maxHp)`, guarda o perdido p/ Itzamná restaurar; sinergia com execução é declarada,
  §27). **Izanami (semântica travada pelo dono):** a Maldição de Yomi ESPALHA por CONTÁGIO — a fonte
  RETÉM; os outros dois são IGUALADOS ao maior (NÃO aditivo — espalhar 2× sem novo acúmulo não muda
  nada, travar em teste); **teto 5**. Motor precisa de 4 comportamentos novos, cada um provado por
  teste antes do kit: limiar→aplica-efeito, contador-de-campo-por-lado, redução-de-HP-máximo+clamp,
  espalhamento/contágio. **PROGRESSO — 4 comportamentos de motor, cada um provado antes do kit:**
  [x] **1. limiar→aplica-efeito** (gatilho-no-acúmulo) — FEITO, `fx.limiar`, primitivas.test §1b, §29;
  [x] **2. contador-de-campo-por-lado** (Combo/Susanoo, teto 20) — FEITO, `st.lados[l].contadores` +
  `pool:'lado'`/`porContadorLado`/`consomeContadorLado`, primitivas.test §1c, §31; [ ] 3.
  [x] **3. redução-de-HP-máximo+clamp** (Ah Puch) — FEITO, `reduzirMaxHp` piso 1 + `maxHpPerdido` +
  `restauraMax`, primitivas.test §1d, §32; [x] **4. espalhamento/contágio** (Izanami) — FEITO,
  `espalharContador` (iguala ao maior, dispara limiar via aposAcumular), primitivas.test §1e, §33.
  **As 4 primitivas de contador estão provadas — motor completo para os 6 kits.** PRÓXIMO: escrever
  os 6 kits (`data/deuses/{ra,anubis,kitsune,susanoo,izanami,ahpuch}.json`), com o checador F1.0e
  ligado. Abertos a decidir COM os kits: `maxHpPerdido` na queda/revive do Ah Puch (§32); e as chaves
  de contador entram no `NOMES_CONTADOR`/`V.contadores` conforme os kits as usam. A família "condição-na-ação"
  (Kitsune "5+ Caudas", Rá "escala") já é mecanismo existente (`porContador`, §29). **[x] Diferido da
  F1.0b PAGO** (chave do contador no evento `efeito` + `NOMES_CONTADOR` + `OBRIGATORIOS` + migração de
  teste; reuso de `efeito` justificado no §30). **Ordem das 3 restantes (dono): campo → HP máximo →
  contágio** (do mais simples ao que mais mexe em invariante; contágio por último porque interage com o
  limiar recém-feito). No HP máximo: confirmar que `fracoes.test` lê `maxHp` de unidade NOVA (projeto),
  nunca reduzida — já é o caso. Depois das 3, os 6 kits.
- **DÍVIDA: arte sub-resolvida para telas de alta densidade (F0.6b).** Com escala ~0,84
  e DPR 3, um retrato de 100×66 design vira ~270px físicos, mas a arte-fonte tem só 168px
  de largura — está sub-resolvida. Não é urgente (o protótipo roda), mas quando a produção
  de arte começar, o alvo deve ser **320px** em vez de 168. Custo estimado: o `dist` sobe
  de ~1,1MB para ~2,3MB. O teto de escala 1,25 (`enquadramento.js`) existe justamente para
  não ESTICAR os 168px além do razoável em tablet — some quando a arte for 320px.
- **Texto do COMO JOGAR desatualizado pela energia ponderada.** O `help` (`ui/sobrepor.js`)
  diz "energia sorteada entre os elementos do seu próprio time" — desde a ponderação, cor
  estrangeira pode cair. Corrigir quando mexer no help; não é invariante.

- **Menu ⋯ vira GLOBAL na F3.1 (decisão do dono).** Hoje o ⋯ só existe na batalha
  (`ui/topo.js`). Nas próximas fases entram tela inicial, deuses, loja e campanha —
  todas precisam de acesso a configurações. O ⋯ deve migrar para a CASCA (disponível em
  qualquer rota), com itens variando por contexto: **render-se só na batalha**; **tela
  cheia, apagar dados e como jogar em todas**. Fazer **junto da tela inicial, na F3.1**.
  Por isso NÃO adicionei saída de tela cheia na seleção agora (o app instalado já nasce
  em tela cheia; no navegador o Android sai pelo gesto/botão-voltar — botão nosso
  duplicaria o sistema).
- **Oferta de tela cheia — persistir a recusa no perfil (F3).** Hoje a memória é de
  SESSÃO (`telaCheiaOfertada` em `ui/base.js`): recusou, não insiste; recarregou,
  oferece de novo. Quando a F3 ligar o perfil, guardar a preferência lá para lembrar
  entre sessões (não reoferecer a quem já recusou de propósito).

- ~~**INV 16 sob sobreposição:**~~ **RESOLVIDO (F0.5b)** — camada de base fica `inert`
  sob sobreposição com scrim (acessibilidade, não só contagem); primário rebaixa como
  consequência; menu sem scrim não inerta. Invariante reescrito para "no máximo um primário
  visível E acessível". Teste em interface.test.js §13. (inventário §4c)
- **`listaFiltrada`/`liberado`/`jogavel` são regra de COLEÇÃO, não apresentação.**
  Loja (F3), invocação e campanha vão querer as três. Ficam em `ui/selecao.js` por
  ora, mas **migram para `src/colecao.js`** na F0.4 ou na F3. Não fazer agora.
- **VOLTAR nativo do Android durante a partida (F4 — acabamento).** `voltar()`
  devolvendo `false` não abandona a partida, o que está certo. Mas se o gesto/botão
  nativo de voltar não fizer **nada**, o jogador de Android estranha (é expectativa
  forte na plataforma). O correto durante a batalha é **abrir o menu ou a confirmação
  de rendição**, não silêncio. Vira tarefa na F4.
- **DIVERGÊNCIA DE ECONOMIA — invocação contra a planilha ANTES da conversão NA.**
  Detalhada em `docs/inventario.md §10`, com os números dos dois lados. Em resumo:
  pity duro **80** (código) × **60** (doc); nomenclatura `p5`/`p4`/`5★`/`B` (original)
  × ordem **A/S/SS** (NA); taxas SS 1,5% / S 8,5%; custo 150 / 1500 (10× sem desconto);
  banners com taxa diferente (destaque rate-up + 50/50, padrao, iniciante).
  **`data/economia.json` NÃO existe → pendência BLOQUEANTE da Fase 3** (loja precifica
  por ordem; simulador lê o arquivo). Não corrigir agora; reconciliar antes da Fase 3.
  Classe de achado que a F0.1 não pegou (cobriu regras, não números de economia).
- **Invocação × perfil — parcialmente ligada (F0.4b).** Feito: sorteio puro com semente
  + pity/coleção/total gravados no perfil + seed no histórico. Pendente: **carteira**
  (gemas) → `perfil.moedas` (F0.4c); **coleção da seleção** ainda usa `inicial`/
  `tudoLiberado`, não `perfil.deuses` (rewire futuro); pity **por-banner** e `gf`
  (50/50) persistidos — hoje um contador único, interim (ver Divergência de economia).
- ~~**Quebrar o `engine.js`:**~~ **FEITO (F1.0a)** — kits → `data/deuses/*.json`, catálogo em
  `src/catalogo.js`, schema em `tools/valida_kit.js`, registro por chave. `DEFESA` fica no
  motor (regra). Motor sem dado de deus. Critério `<500 linhas` **retirado pelo dono** (era
  proxy ruim); gatilho medido no lugar: `aplicarFx` > 150 linhas → `src/execucao.js`.
- **Fontes externas:** `shell.html` puxa Cinzel/Rajdhani do Google Fonts; o `dist/`
  não é 100% offline na tipografia. Não é invariante.
- **Heurística de função longa** falha no `engine.js` por causa do bloco `const
  GODS` (marcou `mulberry32` como 203 linhas — é 1). Usar com cuidado na F0.3.

## Decisões pendentes do dono do projeto
- [ ] Nome dos elementos: Solar/Lunar/Vazio (design) ou os da planilha
      (Tempestade/Umbra/Maré/Aurora/Chama/Verdejante). ~60 habilidades a retraduzir.
- [ ] Ordem A/S/SS atribuída aos 100 deuses (loja da fase 3 precifica por ela).
- [ ] Passiva do Fujin (inerte sem Raijin no time).
- [ ] Pick/ban (bloqueia PvP inteiro).
- [x] INV 16 sob sobreposição: RESOLVIDO (F0.5b) — base `inert` sob scrim; primário
      rebaixa como consequência; invariante reescrito "no máximo um visível E acessível".
- [ ] Ordem da Fase 1: confirmar "quebrar engine.js → provar 11 primitivas → lotes".
- [ ] **50/50 da invocação (garantia de destaque) — MECÂNICA NÃO DESENHADA.** O `gf`
      (após perder o SS para fora do destaque, o próximo SS é garantido featured) foi
      **implementado sem estar em documento nenhum** — não foi decidido nem recusado.
      Não é número divergente; é decisão de design tomada por outra pessoa. Definir:
      (a) garantia **por banner ou global**? (b) **persiste** entre sessões? (c) é
      **visível** ao jogador (contador/aviso)? (d) o que acontece com ela **ao trocar
      de banner**? Só existe no destaque hoje. Decidir na reconciliação de economia.
- [ ] Economia (reconciliação antes da Fase 3): pity 60×80, taxas 3/17 × 1,5/8,5,
      pacote 1350×1500 (desconto), ordem A/S/SS × 5★, tier B vazio. Insumo:
      `docs/economia-divergencias.md` (a preparar). Decisão do dono → aí gero
      `data/economia.json`, nunca o contrário.

## Migração de perfil — V2 FEITA (grant); pity por banner vira V3
**V2 (F0.4c, FEITO):** `VERSAO_PERFIL = 2`. `migrar(p, grant)` backfilla o grant inicial
(1500) em todo perfil `v<2` — trabalho REAL, não mais andaime. Idempotente pela versão.
Foi a primeira carga de verdade da migração.

**V3 (PRÓXIMA carga da migração — antes era chamada de "V2"):** o modelo tem
`invocacao: {total, desdeUltimoSS}` — **um** pity. O jogo quer pity **por banner**
independente. Alvo:
```
invocacao: { total, banners: { destaque:{desdeUltimoSS}, padrao:{desdeUltimoSS} } }
```
A `migrar()` v2→v3 converte `desdeUltimoSS` no pity do banner principal. **Encolheu:**
com o 50/50 removido, some o `garantiaFeat` — só pity por banner. **Custo do interim
atual:** só o pity do **banner principal** sobrevive ao reload; secundários se perdem.
Fazer quando o gacha ganhar banners de verdade (ligado à fila F0.4b — ligar o pity de
verdade). Ao subir para v3, `migrar` ganha o ramo `v===2 → v3` (o gate atual `v>=2 return`
passa a `v>=VERSAO_PERFIL return`, que já é o que está escrito — só somar o passo).

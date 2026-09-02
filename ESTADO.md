# ESTADO — onde o projeto está

> Atualizado ao fim de cada sessão. Quem lê é uma sessão sem memória.

## ★ FASE 4 (em curso) — REPOSICIONAMENTO antes do PvP (§212). Formato: o que mudou · o que muda no "portão jogável" · o que a próxima fase precisa saber.

**O DESENHO virou PvP-FIRST (modelo Naruto-Arena: a ladder é o jogo).** As Provações deixam de ser puzzles de AQUISIÇÃO e viram, no futuro, MISSÕES contadas em PvP ("20 vitórias com Zeus libera X"). As missões chegam DEPOIS do PvP (Fase 5) — construí-las agora seria consumidor sem produtor (§95). Esta fase só REPOSICIONA o que já existe.

**0b. TOPO com os DOIS perfis + energia do oponente (§215):** a energia do OPONENTE voltou (saíra por acidente no §214) — fica no topo, **do lado dele**, em LEITURA (prever o Milagre dele é informação de jogo). E o topo passou a **reservar o perfil dos dois jogadores** (foto placeholder + nick + ranque "—"), porque no PvP (Fase 5) cada lado mostra FOTO+NICK+RANQUE como no Naruto-Arena; reservar agora evita a Fase 5 refazer a faixa inteira. Tocar a foto abre um **marcador honesto** (perfil = Fase 5). **Medido a 926×428, pior caso (6 orbes dos dois lados): CABE em 46px de altura, sem sobreposição nem rolagem — NÃO precisou tirar da área das fileiras.** As ~400 artes de habilidade **não** serão regeradas (ganho marginal): fechado como observação, não dívida.

**0. A TELA DE BATALHA REFEITA (§214) — Naruto-Arena adaptado à nossa proporção larga (2.16):** LEITURA à esquerda (painel), TOQUE à direita (tiles/alvo/encerrar), porque em paisagem o polegar direito domina. Tile de habilidade agora é RETÂNGULO 78×78 (mostra mais arte que o círculo); o retrato é MAIOR que o tile. PAINEL de detalhe de **4 estados** (nada→histórico · habilidade sua · habilidade inimiga em consulta · passiva), **recolhível** por uma aba fina (recolhido, os tiles crescem 78→100px — medido). **Consulta do kit inimigo por TOQUE LONGO** (420ms) no retrato, sinalizada por um "**?**" no canto de cada inimigo vivo. Watermark "INCURSION" fora; nomes inteiros; topo enxuto (turno/relógio, MINHAS orbes, ≡/⋯); marcação de time VOCÊ (ouro) × oponente (vermelho). **Medido a 926×428:** zonas batem, a última fileira fecha em 380 sem cruzar o rodapé, saturação ≥30 em todo estado. **A maior descrição de kit (Babi, 168 chars) CABE sem rolar** (233/233px) — a rolagem interna do painel é rede de segurança, sem "ver mais" hoje. **Distinção com o §207 registrada:** o HUD não fecha (estado crítico); o painel recolhe (é consulta, devolve espaço). **Pendências que o dono decide:** (a) a energia do OPONENTE saiu com as placas antigas — reversível se o dono a quiser de volta; (b) as artes dos discos são medalhões circulares — a moldura já é retângulo, mas preencher os cantos pede re-arte dos ~400 assets (não regerado). Guardas geométricas novas em `moldura` (fileira ≤ rodapé; tile recolhido não estoura); `interface`/`perspectiva`/`render_sweep`/`provacao_loop` migradas para a nova estrutura. **28 suítes verdes.**

**1. O QUE MUDOU (§212):**
- **As 90 Provações → acervo de PERGAMINHOS.** Dado preservado (data/provacoes/); conceito renomeado. FAIXA de dificuldade DERIVA dos nós medidos (Fácil <5k · Médio 5k–50k · Difícil 50k–200k · Épico >200k), injetada no slim pelo build. 63 no acervo · 27 genéricas fora (histórico no dado).
- **A tela de perícia é "Desafios":** Provação da Semana + Desafios de Composição + acervo de Pergaminhos (por faixa).
- **ROTAS SEPARADAS (§213):** o carrossel foi a **8 destinos** — "Desafios" entra entre Provações e Invocação (placeholder até a arte chegar). **"Provações" → marcador de MISSÕES** (chegam no PvP/Fase 5); **"Desafios" → o hub**. A arte "PROVAÇÕES · LIBERE NOVOS DEUSES" NÃO é bug — descreve as MISSÕES (F6), está adiantada; o dono NÃO vai regerar. Rotas internas: `provacoes`=missões, `desafios`=hub, `composicao`=composição. Colisão `economia.json _pendencias.pergaminhos`→`bilhetes`.
- **Vencer um Pergaminho NÃO libera deus:** credita maestria (cosmética) + placar. Removido o `adicionarDeus`.
- **Batalha CPU = SANDBOX declarado:** 20 Gema/vitória, teto 5/dia (reset por data no perfil; migração v2→v3). Texto na tela ("treine formações sem risco de ranque"). Não avança missão/ranque; pode avançar maestria. Valores em economia.json (`sandbox`).
- **As 28 saídas (xango/cernunnos/oni/raijin/nuwa…) deixam de ser problema:** missão não exige que o kit sustente rider, então não há mais requisito de puzzle viável por deus.

**2. O QUE MUDA NO "PORTÃO JOGÁVEL" (a consequência de cronograma):** **sem PvP, a COLEÇÃO só anda pelo GACHA.** Não é um buraco — é o desenho PvP-first. O jogo é jogável de ponta a ponta HOJE: campanha ensina · pergaminhos/semanal/composição desafiam · sandbox treina · gacha coleciona. A progressão de LONGO PRAZO (missões, ranque) é o que a Fase 5 (PvP) traz — e é lá que a coleção volta a ter uma segunda via.

**3. O QUE A PRÓXIMA FASE PRECISA SABER:**
- **PvP (Fase 5) é o PRODUTOR** das missões dos Pergaminhos e da segunda via da coleção. As Provações-como-missão (contador de vitórias por deus/condição) se constroem SOBRE o acervo de Pergaminhos que já existe.
- **A ARTE do banner "Provações"** precisa de regeneração (o dono): novo texto que não prometa "libere novos deuses".
- **Rebalanceamento de kit (a antiga Fase 4)** segue pendente e independente: oni primeiro. Não bloqueia o PvP; melhora o acervo.
- **CALIBRAÇÃO e TESTE DE USABILIDADE** (herdados da F3) continuam abertos.

## ★ FASE 3 — RESUMO DA FASE (encerramento). Formato: o que mudou de estrutura · ambiguidades · o que a próxima fase precisa saber.

**A FASE 3 transformou o MOTOR (Fase 1) + o CATÁLOGO DE PROVAÇÕES (Fase 2) num JOGO JOGÁVEL de ponta a ponta: aprender as regras → provar os deuses → invocar/colecionar → maestria/panteões → um puzzle novo por semana → desafios de composição. Aplicativo de celular em paisagem, um só HTML, sem servidor.** Falta só o PORTÃO (teste de usabilidade) e a Fase 4 (rebalanceamento de kit) / Fase 5 (PvP).

**1. O QUE MUDOU DE ESTRUTURA:**
- **A CASCA DO APP (§197, F3.0):** home (5 destinos) + roteador; 9 telas novas via `registrar()` (home, provacoes, colecao, deus, campanha, montartime, desafios, desafiomontar, embreve) somadas às 3 antigas (selecao, batalha, invocacao). A home é o boot (não mais `selecao`).
- **O MOTOR DE PROVAÇÃO PASSA A RODAR NO BROWSER (§198, F3.1):** até aqui `provacao.js`/`BESTIARIO` só rodavam na BUILD (validação); agora embutidos. O LAÇO fecha: lista→montar→batalha→`avaliarProvacao` a cada render→desbloqueio. HUD da condição AO VIVO, 3 derrotas distintas (HP/prazo/condição), PLACAR de lances contra o mínimo do solucionador.
- **AQUISIÇÃO (§199, F3.2):** Invocação (odds visíveis, pity, repetido→Essência 15/40/120) + Coleção dos 100 por panteão + detalhe do deus (kit+arte+Provação), com o elo Coleção↔Provação.
- **CAMPANHA (§201, F3.3):** capítulo 1, 6 encontros que ensinam as REGRAS (custo/recarga/Defesa/ordem/escolha-de-time/chefe). Reusa a máquina de Provação SEM condição. Recompensa de `economia.json`. Chefe = deus com HP inflado no `montar`.
- **GERADOR SEMANAL (§203, F3.4):** o motor de puzzles como gerador perpétuo. Pool de 52 PRÉ-GERADO (`tools/gerar_semanais.js`), provado VENCÍVEL pelo solver; runtime = lookup por `(semana+ano×7) % 52` (§204). **Taxa de sorteio 1.13 tentativas** (48/52 na 1ª) — viável.
- **MAESTRIA + PANTEÕES (§204, F3.5):** 4 níveis/deus (Iniciado=Provação vencida, Aprendiz/Adepto por vitórias, Mestre + condição de kit=vencer com o Milagre). Agregado "domina X/100". Panteão por PROPORÇÃO (§200), nunca contagem. **Só cosmético — nunca poder de combate (travado por teste).**
- **DESAFIOS DE COMPOSIÇÃO (§205, F3.6):** o inverso da Provação; validação de time AO MONTAR (o erro é reversível antes de custar). Recompensa LEVE (maestria + Essência 1×) de propósito.

**2. AMBIGUIDADES QUE APARECERAM (e viraram decisão medida):**
- **Estado de desbloqueio (§197):** Provação de deus que já se tem → fica CONCLUÍDA (não some) — some da fila, não da coleção.
- **O ROSTER NÃO É 10×10 (§199/§200):** medido Grega 19 … Maia 4. Decisão do dono: ACEITAR desigual, NÃO rebalancear (tocaria 100 kits + carimbos + os deuses que leem facção). A CORREÇÃO é no sistema: panteão vira PROPORÇÃO ("metade dos gregos" ~ "metade dos maias"). A Maia (4) é o 1º marco. **Padrão do "escrever por tema sem contar" reapareceu — agora sobre a estrutura do próprio roster.**
- **A CLASSE DO BUG DO BESTIÁRIO (§201/§202):** a build (schema + solver no motor PURO) validava, mas a TELA nunca renderizava; as 3 Provações de bestiário quebrariam ao jogar (`campo.js` lia `GODS`, criatura está em `BESTIARIO`). Consertado (lê o catálogo da partida) + **GUARDA PERMANENTE** (`render_sweep.test.js` renderiza toda Provação/encontro e move a IA). Lição: **schema-válido + solver-vencível ≠ jogável.**
- **"Perpétuo" do semanal (§203/§204):** o pool cicla 52; a semente virou (ano, semana) p/ não repetir a mesma semana no ano 2. Renovar de verdade = re-rodar o gerador (`npm run gerar:semanais`).

**3. O QUE A PRÓXIMA FASE PRECISA SABER:**
- **PORTÃO DA FASE 3 PENDENTE: o TESTE DE USABILIDADE** — dar o celular a alguém que nunca viu e ficar calado. Todas as decisões de interface foram por ARGUMENTO, coerentes, mas NENHUMA validada por alguém jogando sem explicação. É a maior incerteza aberta.
- **CALIBRAÇÃO PENDENTE (§205):** limiares de maestria (Aprendiz 5 · Adepto 15 · Mestre 30) e o prazo/recompensa dos desafios são chute educado — ajustar DEPOIS do teste de usabilidade, com jogador real.
- **FASE 4 (rebalanceamento de kit), em ordem (herdado da F2):** (1) **oni** — resiste até à genérica; (2) slots-mortos hercules/shutendoji/xangô/cernunnos; (3) re-escrever hercules/shutendoji com golpe-final. A F4 pode SUBSTITUIR as 27 genéricas (`generica:true`) por Provações-de-kit após rebalancear.
- **FASE 5: PvP** — cartão morto na home hoje, marcado "Indisponível · Fase 5".
- **O conteúdo é FUNDAÇÃO, não fim:** 90 Provações + gerador semanal (perpétuo) + campanha (extensível a mais capítulos) + 6 desafios. A máquina de Provação é o núcleo reusado por TUDO (Provação, semanal, campanha, desafio).
- **NÚMEROS DA FASE:** 12 rotas (9 novas) · 3 arquivos de conteúdo novos (campanha 6, semanais 52, composicao 6) · 7 suítes de teste novas · **28 suítes, `npm test` verde, exit 0** · dist ~1.8 MB, um HTML.

## ★ FASE 2 — RESUMO DA FASE (encerramento). Formato: o que mudou de estrutura · ambiguidades · o que a Fase 3 precisa saber.

**A FASE 2 traduziu e mediu o CATÁLOGO DE PROVAÇÕES dos 91 deuses não-iniciais. Encerra em 90/100 com Provação: 63 que ENSINAM KIT + 27 rota GENÉRICA; 10 sem (9 iniciais + oni).**

**1. O QUE MUDOU DE ESTRUTURA:**
- **O FORMATO da Provação amadureceu:** predicado {modo (final/log/continuo), aval (ok/pendente/falha), distancia (gradiente), chave}. `quando` DERIVADO do modo. Fecha POR MODO, não por forma (§144). ~30 predicados no motor, **26 com consumidor (84%)**.
- **~15 predicados NOVOS neste arco:** reviveAliado, naoReviveInimigo, tituloCaido, soloSobrevivente, stripBuffsInimigo, estadoTurnos, statusTurnos, estadoContinuo, estadoSimultaneo, semDebuffEmAliado, hpTetoSelf, protegeHpMax + extensões (buffNoAbate{v,quem}, semPerderAliado{quem/exceto}, protegeDe{escopo/filtro}, buffContinuo). Carimbos de motor: turno-event ganha `campo`(§178)/`statusInimigo`(§186); evDano ganha `unico`(§172); revive/dead-passive(`mesmoMorto`§123).
- **A TAXONOMIA DE SAÍDA (deus sem Provação viável) — 6 espécies:** rider-impossível · ferramenta-fraca · rider-mismatched · ativo-opcional · **simultaneidade-de-estado (nova §193)** · §87-1-consumidor. **O META-PADRÃO (§188):** rider fecha só se a ferramenta for PROTAGONISTA-ÚNICA E RÁPIDA; opcional o solver pula, lenta não espera — anti-solver.
- **A PROVAÇÃO GENÉRICA (§195):** `deadline + semPerderAliado{quem}`, rota-de-aquisição sem ensinar kit, `generica:true`. Separa "Provação de kit" de "rota de produto".

**2. AMBIGUIDADES QUE APARECERAM (e viraram decisão medida):**
- **Nível: 27/56 divergiram do catálogo (§183/§185)** → dificuldade declarada NÃO é sinal; o nível exibido vem do CARIMBO. **theme≠mechanic pega quem ESCREVE o catálogo E quem ESTIMA a cauda (§191)** — a única defesa é ler o kit.
- **Auditoria de riders-derivados (§185):** de 56, só 4 ensinavam OUTRA coisa; 3 dívida real (golpe-final virou acumulação), 1 aparente. **Dívida-de-conteúdo publicada: hercules, shutendoji** (funcionam, ensinam menos; endereço F4).
- **Varredura de órfãos (§196, fim do arco):** LIMPA — 5 predicados-sem-consumidor (2 documentação, 3 consumidor-saiu), 1 armadilha-sem-gradiente já endereçada (limparBuffs §177), 0 junta-não-ligada. A disciplina §87/§176 segurou.

**3. O QUE A FASE 3 PRECISA SABER:**
- **A tela de Provações lista 90** (63 kit + 27 rota), não 91. Os 10 sem-Provação (9 iniciais + oni) = "sem trial", não buraco. **Nível SEMPRE do carimbo, nunca do catálogo.**
- **O flag `generica:true`** marca as 27 substituíveis — o produto pode exibi-las diferente, e a Fase 4 troca por Provação-de-kit após rebalancear.
- **Endereço p/ a Fase 4 (revisão de kit), em ordem:** (1) **oni** — resiste até à genérica, kit sustenta rider NENHUM (o mais fundo); (2) slots-mortos hercules/shutendoji/xangô/cernunnos (ferramenta opcional/lenta); (3) re-escrever hercules/shutendoji com golpe-final (predicado pronto).
- **O motor de Provação é auditável e está auditado** (auditoria.test.js verde; 84% dos predicados com consumidor). Base sólida p/ a F3 construir maestria/panteões/composição/Provação-semanal por cima.

## Última sessão — **FASE 2 FECHADA: 90/100 com Provação (63 ensinam-kit + 27 rota genérica).** REVIVE + AUTO-MORTE + baratas + 3 dívidas + cauda + genéricas (§181–195).

**PROVAÇÃO GENÉRICA (§195) — resolve a rota-de-aquisição dos 28 sem-Provação.** Forma `deadline{N} + semPerderAliado{quem:<deus>}` ("vença sem perder [deus]"), zero motor, babá falha por construção (troca protagonismo por rota), marcadas `"generica": true` (F4 substitui após rebalancear kit). **27 de 28 carimbadas** (N/nível derivados; 19 com perseu·houyi dl12, anubis dl15, 7 com CURADOR oxum dl14 — o curador protege o título squishy, que É o rider). **oni RESISTE mesmo na genérica → kit sustenta rider NENHUM (candidato nº1 a rework F4).** **Números: 63 ensinam-kit · 27 dão-a-rota · 1 (oni) sem-rota · 9 iniciais. 90 com Provação, 10 sem.**

**O NÚMERO FINAL: 63 carimbadas = teto 63.** 100 deuses − 9 iniciais = 91 planejadas; **28 SAÍDAS** medidas → teto = 63. O honesto derrubou o otimista 3× (91→80→74→63): a cauda-da-cauda (23) rendeu 6 carimbos + 17 saídas (74% saída — onde os riders anti-solver se concentram).

**LOTES FECHADOS ESTA FASE (arco §181–194):**
- **REVIVE (§179–181):** demeter, freyja, osiris, isis (`reviveAliado`, núcleo) + hel (`naoReviveInimigo` — 2 auto-revivedores forçam a Marca) + bennu (self-revive = REVIVE-família, `reviveAliado`). odin SAI (rider-mismatched).
- **AUTO-MORTE (§182–184):** mimir carimbado (`tituloCaido` + dead-passive, babá H=86/129 nos 3 Guardiões). erinias/ymir SAEM (ferramenta-fraca/mismatched). Predicados `soloSobrevivente`/`tituloCaido` construídos.
- **BARATAS (§186):** orfeu carimbado (`statusTurnos`, uptime-de-status relaxado). tsukuyomi SAI (assimetria Dia×Noite estrutural).
- **3 DÍVIDAS REAIS (§187–188):** yamato PAGO (`stripBuffsInimigo` — golpe-final de strip, inimigo pré-buffado, babá limpo). hercules/shutendoji RESISTEM (rider fiel é ativo-opcional/lento) → dívida-de-conteúdo aceita até F4.
- **CAUDA C+E+D+B+A+singles (§190–194):** carimbadas 6 (shiva, babi, kagutsuchi, baldur, izanagi, perseu). Saídas 17. Predicados `semDebuffEmAliado` (perseu), `estadoSimultaneo` (família A — órfão, sem forma jogável).

**AS 28 SAÍDAS POR ESPÉCIE:** rider-impossível 3 (nuwa, tanuki, durga) · ferramenta-fraca 7 (oni, boitatá, curupira, cernunnos, xango, tsukuyomi, erinias) · rider-mismatched 2 (odin, ymir) · ativo-opcional 1 (raijin) · **simultaneidade-de-estado 5 (NOVA: aokuang, chaac, medusa, anubis, kukulkan)** · §87-1-consumidor 10 (nefertem, kali, sunwukong, houyi, huangdi, exu, horus, kraken, krishna, lugh).

**PREDICADOS: 31 no motor, 26 com consumidor (84%).** Órfãos (5): abatePorSlot, soloSobrevivente, buffContinuo (consumidor saiu); estadoContinuo, estadoSimultaneo (documentam o irrealizável). Construídos nesta fase (arco): reviveAliado, naoReviveInimigo, tituloCaido, soloSobrevivente, stripBuffsInimigo, statusTurnos, semDebuffEmAliado, estadoSimultaneo + extensões (buffNoAbate{v,quem}, semPerderAliado{quem/exceto}, protegeDe, hpTetoSelf, estadoTurnos) e o carimbo de motor `statusInimigo`/`campo` no turno-event.

**DÍVIDA COM ENDEREÇO (F4):** conteúdo — hercules (ensina acumular↔golpe-final), shutendoji (aplicar Torpor↔roubar-via-Torpor). Slots-mortos — hercules, shutendoji, xangô, cernunnos (ferramenta opcional/lenta; IA Difícil confirma em "nunca-usadas"). Órfãos-motor — estadoContinuo, estadoSimultaneo (+ abatePorSlot/soloSobrevivente/buffContinuo).

**PARA A FASE 3:** a tela lista **63**, não 91. Os 37 sem-Provação (9 iniciais + 28 saídas) = "sem trial", não buraco. **Nível exibido vem do CARIMBO, nunca do catálogo** (§185: 27/56 divergiam). **npm test VERDE (21 suites, exit 0).**

## (histórico) F2.4 lote 7 TRADUZIDO (MORTE_EXECUÇÃO vs revive): execução acoplada prevista; horus/durga = RIDER DE ORDEM (eixo novo) a vigiar (§166). Lote 6 = 7/8.
**cernunnos/xango do lote 5 SAÍRAM (kit não sustenta rider, §163; obs. de balanceamento c/ endereço p/ IA Difícil F2.2).** **Lote 6 — leitores contadorLado/danoBonus prontos+testados antes (§163, teste §14).** **FECHADAS 5 individuais, sem dica:** ra ✓ (`discoSolar` 6 — AUTOMÁTICO, +1/turno, rider quase free) · hercules ✓ (`danoBonus` 16 — ACOPLADO limpo, cavalga Os Doze Trabalhos) · kitsune ✓ (`cauda` 8 — semi-automático, dl18) · brahma ✓ (`danoBonus` 24 — buff BUFFA dano→ajuda abate, quase free) · itzamna (`danoBonus` ≤20 — FECHA apesar da flag; composto +protege-HPmax pendente, NÃO carimbado). **combo (susanoo/raijin/yamato): FALHA por-deus** — pool de 2/ataque, um gerador é lento demais (fight curto→pouco combo; longo→gerador ofuscado/não vence); só o COMBO-SQUAD (os 3, 6/turno) fecha (combo 20). **ACHADO 1 (o que o dono queria): a 4ª pergunta tem FALSO-POSITIVO** — flaguei brahma/itzamna, os dois fecham; refino: a pergunta é "a ação AJUDA A VENCER?" (buff-de-dano ajuda=acoplado), não "é separada do ataque?". **ACHADO 2: a régua acerta a família (5 baratos) mas erra a própria BANDEIRA (combo falha por-deus — pool fonte-única é lento, espelho invertido do §160).** **ACHADO 3: contador AUTOMÁTICO (ra/brahma) é o outro extremo do Xangô — rider fino; eixo: ativo-opcional↔acoplado↔automático, os extremos dão Provação fraca.** **PLACAR DA RÉGUA:** previu "combo=barato"; acertou a família mas errou o exemplo → serve p/ ORDENAR, não p/ o caso combo. **PENDENTE do dono:** (1) combo-squad vira 1 Provação-esquadrão ou riders distintos? (2) compostos yamato(+remove-3-buff)/itzamna(+protege-HPmax) 2ºs riders; (3) ra/brahma finos — aceitar ou endurecer? **npm test/build verdes.**

## (histórico) lote 5 (ACUMULO_RECURSO): 3/5 FECHADAS sem dica; cernunnos/xango SEM PONTO DOCE (§162)
**FECHADAS 3/5, sem dica:** inari ✓ (`orbesGuardados` 22 — não-extrativa, cavalga) · oxum ✓ (`curaAcumulada` 240 — montagem invertida: aliados frágeis + inimigos agressivos, a cura cavalga a sobrevivência; Oxum é a ÚNICA curadora, senão contamina) · khnum ✓ (`danoAbsorvido` 60 — absorção SEMI-AUTOMÁTICA: Couraça no ar → golpe alvo-único no protegido redireciona ao Khnum). **LEITORES construídos+testados (§134/§87, §12 do teste):** o motor passou a EMITIR o que `acumuladoDe` lia (junta-não-ligada que a tradução §162 pegou — 3 mecanismos AUSENTES: danoRefletido kind-mismatch, danoArmazenado sem case, danoAbsorvido interceptação não-roteada). **SEM CARIMBO (§162):** cernunnos (`danoRefletido`) e xango (`danoArmazenado`) — a extração é ATIVA e PURAMENTE OPCIONAL (refletir/armazenar não são precisos p/ vencer nem sobreviver) → o guloso pula, acumulado=0 em TODA montagem. **REGRA:** extração só vira Provação se CAVALGA algo que o vencedor já faz (matar/sobreviver/defesa-passiva); overhead puro é anti-vitória (§158 raiz). **REFRAME do dono (coletar→entregar) construído + medido:** infra `danoDevolvido` + `abatePorSlot{quem,slot,quantos}` (§46) + marca do slot letal na queda, testados (§13). **RESULTADO: cernunnos e xango NÃO sustentam rider próprio** (achado previsto): xango — Balança devolve min(50,armazenado) com atraso, num set batível o direto mata antes → devolvido 0; só forçada contra redução-tanque no talo, e aí a luta é invencível (sem banda). cernunnos — abate-por-reflexo depende do inimigo atacar a baixo HP, e o guloso abate direto (slot errado); nenhuma montagem forçou o reflexo letal. **É o KIT, não a Provação** (Balança-com-teto e reflexo-fixo-10 são fracos/opcionais demais). **PENDENTE do dono:** mudar o KIT (destravar teto da Balança; reflexo que escale/execute), tirar cernunnos/xango do lote estruturado, ou dica. **Custo do lote 5 (4 colunas):** **3/5 estruturadas, 0 dica** · direto: 1 (inari) · decisão: 3 (montagem invertida oxum, set khnum, +5 leitores/predicados construídos) · nº derivado: 3 (inari 22, oxum 240, khnum 60) · régua: N/A (só ordena). 2/5 são limite-de-kit (não de Provação). **npm test/build verdes.** **PRÓXIMO (dono):** decidir cernunnos/xango; depois sequenciar lote 6 — ACUMULO_CONTADOR (combo acumula atacando → a régua prevê barato; teste da régua).

## (histórico) lote 4 — F2.4 (MORTE_EM_ESTADO) FECHADO 5/5, TODAS SEM DICA; §161: o QUANTIFICADOR pesa mais que o número + 3º eixo (rider gateado por elemento)
**FECHAMENTO 5/5, sem dica:** poseidon ✓ (encharcado) · jormungandr ✓ (veneno; 2º aplicador medusa — 19) · iara ✓
(encharcado; 2º aplicador poseidon + execução→0 — 17) · **piranha ✓** (`morteEmEstado{sangramento, quantos:1}`, oni·aquiles·ogum — 27) ·
**ahpuch ✓** (`morteComContador{podridao, limiar:2, quantos:1}`, demeter·oni·ogum, **+ pool `montar.orbs Umbra:4`** — 19). **ACHADO §161:**
piranha e ahpuch eram FONTE-ÚNICA sem 2º aplicador no roster (a correção §160 não cabe); o gargalo não era o número, era o
QUANTIFICADOR "TODOS" (limiar 4/3/2/1 deram H idêntico; só "todos"×"≥1" mudou). **§158 num nível acima: a FORMA da condição pesa
mais que o VALOR.** Dono: (a) predicado ganha `quantos` opcional (ausente="todos" canônico; presente="≥N caem carregando"); (b)
dica RECUSADA; (c) 2º aplicador no roster RECUSADO (o conteúdo não se dobra à Provação — a lacuna de roster fica como OBSERVAÇÃO, não
dívida: sangramento/podridão são fonte única e isso limita o que Provações podem exigir). **3º EIXO (ahpuch):** rider gateado por UM
elemento (Umbra) + renda aleatória → não age cedo → precisa de bootstrap de pool (irmão do §158 hermes); Umbra:4 é o mínimo medido.
`(q1,lim2)` é o teto do ahpuch (lim3 não fecha nem com Umbra 5-6: cada podridão tira 10 de maxHp). **MECÂNICA:** `quantos` +
gradiente-contagem próprio (peso 1000 ≫ maxHp, sem cancelar HP-base — cancelar tirava o incentivo de matar/farmar Umbra e travava);
forma "todos" segue sem gradiente (experimento revertido, dono confirmou); teste §11; regressão poseidon/iara/jormungandr 19/17/19 intacta.
**Custo lote 4 (4 colunas):** **5/5 fecharam, 0 dicas** · fecharam direto: 1 (poseidon) · exigiram decisão: 4 · nº derivado: 4
(iara exec→0, piranha q1, ahpuch q1+lim2, bootstrap Umbra4) · **régua previu direto: 1/5** (a régua prevê o rider; o lote foi
dominado por fonte-única e recurso, que ela não vê). 1 rewrite de condição (a família ganhou `quantos`). **npm test + build verdes.**
**PRÓXIMO (dono):** sequencia o lote 5 — ACUMULO_RECURSO (a parede extrativa prevista), agora com o quantificador na mão.

## (histórico) lote 3 — F2.4 (ROUBO/REMOÇÃO) FECHADO 6/6, TODAS SEM DICA; régua §158 pronta p/ sequenciar
**FECHAMENTO FINAL (6/6):** heimdall ✓, saci ✓ (orbe4+dl14 derivados), iansã ✓ (limparBuffsAntesDeAbate), loki ✓
(maximoNumEvento 3 derivado), **shutendoji ✓** (rewrite: efeitoEmNInimigos torpor **limiar 1** derivado — 3→2→1 por medição,
enemy-set krishna·oxum·exu; 27 lances), **hermes ✓** (rewrite: tetoDeGasto **24** + RENDA CHEIA — meia-renda era injogável,
correção medida; enemy-set heimdall·mimir·tanuki, heimdall mantido; 29 lances). **NENHUMA usou dica.** Mecanismos no motor:
semPerderOrbe, limparBuffsAntesDeAbate(+marcos), maximoNumEvento, negarAcaoInimigo.max, efeitoEmNInimigos(+jaRecebeu),
semRenda, rendaFracao, tetoDeGasto(+orbeGasto). **Custo final 3 colunas: 0 direto · 6/6 exigiram decisão · 4 nº derivados
(saci orbe+dl, loki, shutendoji torpor, hermes teto) · 2 rewrites (shutendoji, hermes).** **Achados duráveis §157-158:**
critério de PARADA (nenhum eixo fecha → provar incompatibilidade → reescrever); riders EXTRATIVOS anti-vitória (prevê
ACUMULO_RECURSO como próxima parede); classes montagem-que-impede-agir + riders-competindo-pelo-recurso; contramedida
unidade-de-medida; **régua de sequenciamento (cavalga-abate barato × exige-recurso caro, ~14-16 sessões alternando);**
meta-regra rewrite-custa-dois (rider+set, re-tunar o enemy-set em TODA mudança de rider). **PRÓXIMO:** o dono sequencia
os lotes restantes com a régua §158 + a previsão de que ACUMULO_RECURSO (5) é a próxima parede extrativa (muda a ordem).
Dívida de motor do roubo/remoção ENTREGUE. **npm test verde; build verde; 6/6 carimbadas.**

## (histórico) lote 3 — 4/6 fechadas; shutendoji+hermes rewrites (superado pela NOTA acima)
**NOTA FINAL v2 (o dono REESCREVEU os dois riders; as mecânicas entraram, mas o ENEMY-SET virou o novo muro):**
shutendoji → rider `efeitoEmNInimigos` (torpor em N — CAVALGA o abate); hermes → `tetoDeGasto` + `rendaFracao` (meia-renda,
teto de gasto onde roubado não conta). **Mecânicas construídas + testadas (npm verde):** efeitoEmNInimigos+latch jaRecebeu;
rendaFracao[lado]; tetoDeGasto(final)+orbeGasto contado em pagar/logGastoLivre/converter; semRenda (do 1º rewrite, mantido).
**ESTADO das duas (rider agora certo, enemy-set é o problema):** shutendoji vs krishna·oxum·inari = melhorH **2-3** (dica-class
§157: linha existe, income Umbra-skew + torpor-antes-do-abate; DICA pendente — perto). hermes vs heimdall·exu·oxum = melhorH
**283** (meia-renda) / **121** (RENDA CHEIA) — os INIMIGOS são o muro (heimdall tank+bloqueia-roubo, exu·oxum roubam de volta),
não a economia; precisa de enemy-set batível (dono). **META-REGRA nova (§158): reescrever um rider DESBALANCEIA o enemy-set
(ele foi tunado p/ o rider antigo) → RE-VERIFICAR o set no rewrite.** **PRÓXIMO:** (1) shutendoji — cravar a dica (torpor-spread
+ Umbra timing) OU derivar limiar<3; (2) hermes — enemy-set batível mantendo heimdall (o roubo-blocker é essencial). Depois carimbar
os dois → lote 3 6/6. **Custo (parcial): 4/6 fechadas, 0 direto, 6/6 decisão, 3 nº derivado; 2 em rewrite (mecânica pronta, enemy-set pendente).**

**Data:** 2026-08-25
**Tarefa:** fechar o lote 3 (roubo/remoção), cada mecanismo COM seu consumidor; trazer o custo com 3 colunas. §156-158.
**Resultado:** **FECHADAS 4/6, todas SEM dica:** heimdall ✓ (dl10; rider livre por passiva-do-título, aceito §Dec.4);
**saci ✓** (orbe 4 + dl 14, ambos DERIVADOS de medição — a categoria "afrouxamento derivado"; o teto era cadência×sobrevivência,
não findability); **iansã ✓** (set trocado p/ brahma·hera·freyja; mecanismo `limparBuffsAntesDeAbate` com marco no motor +
gate `everBuff`; delta-0 livre pela mão dela); **loki ✓** (`maximoNumEvento` 3 DERIVADO — teto real de efeito-buffs roubáveis;
20 lances). **MECANISMOS CONSTRUÍDOS + TESTADOS:** `semPerderOrbe` (heimdall §8), `limparBuffsAntesDeAbate` (iansã §9, +latch
`marcos.semBuffLado`/`everBuffLado` no motor), `maximoNumEvento` (loki §10, pico-por-turno ≠ soma), `negarAcaoInimigo.max`
(backward-compat). **TRAVADAS EM DECISÃO DE DESIGN (2):** **shutendoji** — negar removido (dono §158, era cor); orbe→3 derivado;
MAS orbe3-só não fecha: PAREDE DE SOBREVIVÊNCIA (krishna·brahma·oxum out-damage o time que os deixa agir p/ roubar; solver
platô melhorH 117-165 em dl12-18). Decisão: trocar por bateria-de-orbe menos bursty. **hermes** — montagem "0 orbes+0 renda"
DEADLOCKA (toda ação custa ≥1; não mata Heimdall p/ desbloquear roubo). Decisão: bootstrap (rec. pool inicial fixo sem refil)
+ montagem `semRenda` (motor a construir). **CUSTO DO LOTE (3 colunas): 0 fecham direto; 6/6 exigiram decisão; 3 têm número
DERIVADO (saci orbe+dl, loki, shutendoji orbe).** **3 CORREÇÕES DE MEDIÇÃO minhas** (saci 3º-buff por-raciocínio, iansã
everBuff-t1, loki escudo≠efeito) → contramedida do dono: VERIFICAR A UNIDADE DE MEDIDA antes do número virar decisão (§157).
**RÉGUA DE SEQUENCIAMENTO (§158, o ganho durável — 1ª coisa que ESTIMA em vez de descobrir):** rider CAVALGA o abate (barato:
MORTE_ESTADO, CONTADOR ~13) × EXIGE preservar/produzir o recurso (caro: roubo/remoção, ACUMULO_RECURSO, MORTE_EXECUÇÃO-vs-revive
~19). **Estimativa revisada ~14-16 sessões, ALTERNANDO caro com barato.** Classe nova (§158): riders que COMPETEM pelo mesmo
recurso (shutendoji negar×roubo — contradição, ≠ economia-de-ação; sinal: composto pior que qualquer isolamento). Heurística:
número honesto dispensa dica (poseidon/khonshu/loki, 3x). **npm test verde; build verde** (só shutendoji sem carimbo, esperado).
**PRÓXIMO:** 2 decisões do dono (shutendoji enemy-set menos bursty; hermes bootstrap) → fechar os 2 → custo final → o dono
sequencia os lotes restantes com a régua §158. Dívida de motor do lote ENTREGUE (maximoNumEvento/orbe-perdido-a-roubo/buffs-removidos).

## Última sessão — F2.4 lote 2 (NEGAÇÃO): khonshu fecha pelo relógio; saci ainda travado; exu realocado
**Data:** 2026-08-24
**Tarefa:** construir o khonshu e fechar o lote 2 (forma `negarAcaoInimigo`); resolver o saci; §153/§154.
**Resultado:** **lote 2 = 4 Provações** (varredura por conceito, não sintoma): dionisio e boto já do lote 1
(mesma forma), **khonshu** novo, **exu** realocado. **KHONSHU ✓ carimbado** (VENCÍVEL, 29 lances, SEM dica,
hash 845c65c9): apliquei o método na ordem do dono — **(1) enemy-set por LEITURA** (huangdi·itzamna·ganesha, os 3
têm slot `milagre` → o inimigo PODE fazer a ação negada, set coerente e denso de propósito); **(2) isolamento**
(composto deadline12+negar travou em melhorH 18 `dica`, platô 250k→500k; mas negar+deadline **20** = VENCÍVEL 31
lances → o time control-pesado DENEGA e MATA, a denegação é alcançável); **(3) tempo** — o gargalo é o RELÓGIO,
não time/dica: deadline 13 INDETERMINADO, **deadline 14 VENCÍVEL sem dica**. Deadline 12→14 = afrouxar o RECURSO
(turnos), DECLARADO e legítimo (§149) — a lição do poseidon (time já certo, só o clock apertado), não a do saci.
Deadline é por-puzzle (§152): dionisio/boto em 12, khonshu em 14 (trio mais tanque). **SACI — ainda WIP sem
carimbo, condição original (5 orbe + 3 buff):** o dono escolheu (b) buffsRoubados 3→2, mas NÃO fechou e a
**isolação por-fonte desmentiu o meu diagnóstico** (erro meu, §153): só-buffsRoubados(3)=VENCÍVEL, só-orbesRoubados(5)=melhorH 3
— o gargalo é o ORBE, não o buff; revertido a 3. orbesRoubados afrouxa LINEAR (5→melhorH3, 4→2, 3→1) mas nunca
FECHA (tensão roubo×abate: susanoo/zeus matam antes do saci roubar 5). **Ao dono, gargalo agora CERTO (orbe):**
(a) orbesRoubados 5→2, (b) 2º ladrão no time, (c) dica pace-and-steal, (d) rework. **EXU → lote 6:** a negação é
FLAVOR (o set não é levado a usar a ação negada → trivialmente satisfeita), o rider real é uso-count
(`usarSlotProprio`, Camada C). **Distinção registrada: cláusula pode ser FLAVOR ou RIDER; só a 2ª vira predicado.**
**LIÇÃO (§153): `acionavel` NÃO é estável** — `orcamento` num orçamento pode virar `dica` num maior; conclusivo
só após esgotar o orçamento. **Padrão novo (§153): composto travado ⇒ ISOLAR CADA FONTE, não o composto vs
deadline.** Build verde (só saci sem carimbo, esperado). **PRÓXIMO (dono):** decidir o fix do saci; depois os
lotes 3-6 (tamanhos reais por varredura de conceito abaixo). Dívida de motor mapeada p/ lote 3: loki
(`maximoNumEvento`, pico-por-evento), heimdall (orbe-perdido-a-roubo), yamato/iansã (buffs-removidos); kraken
`slotAbate` (barato) no lote da forma abate-por-slot.

## Sessão — F2.4 lote 1: as 6 Provações limite-de-turnos (6/6 carimbadas; saci segurado) (anterior)
**Data:** 2026-08-23
**Tarefa:** F2.4 lote 1 — a forma "limite de turnos". Traduzir antes de escrever (§124), rodar o solucionador,
carimbar, medir a taxa. §152.
**Resultado:** a tradução (§124) desmontou a organização de lotes: **a forma real é o RIDER, não o relógio**
(§46 no nível da fase) — das 15 "limite de turnos", só **6** têm o deadline como espinha; as 9 restantes são
outras formas (cada uma precisa de predicado próprio → vão pro lote da forma delas). O dono aprovou o escopo (as
6) e registrou: **time aliado é DESIGN** (parte da spec, nunca esteve na planilha). **Verdictos (HP padrão, sem
afrouxar):** apolo ✓, bragi ✓ (usa 3 criaturas do bestiário) — VENCÍVEL direto; **poseidon ✓** — a princípio
com **DICA** (mecanismo novo `prov.dica`, criado aqui), mas DEPOIS reaberto (ver abaixo) e fechado por TIME
(troca sobek→piranha), SEM dica; **boto ✓** — só o fix de `comeca:1` (a distância caiu 136→2, `acionavel` virou
`dica`→`orcamento`, 400k nós);
**dionisio ✓** — VENCÍVEL, 26 lances, SEM dica: o caminho foi TIME, não dica. `comeca:1` removeu o INVENCÍVEL
estrutural; depois eu diagnostiquei errado 2× (li melhorH alto como déficit de dano; era déficit de CONTROLE — o
melhorH numa negação mede HP restante, sempre parece dano); o dono acertou — troquei p/ time control-pesado
(dionisio·tsukuyomi·iansã, espelhando o boto) e fechou ativamente. **saci** — segurado (fontes
`orbesRoubados`/`buffsRoubados` + tag de log §106 pedem varredura própria: quantas das 91 precisam da distinção
roubo≠ganho). **PRINCÍPIO travado (dono):** setup que torna a condição impossível antes da
1ª ação do jogador é ERRO DE MONTAGEM, não dificuldade — corrigir é obrigatório (`comeca` muda se o puzzle é
coerente; ≠ afrouxar). **MÉTODO DIAGNÓSTICO consolidado (§152, o ganho durável do lote):** rode o ISOLAMENTO
PRIMEIRO (a mesma montagem sem o rider) — é o único sinal que o rider não contamina; iso baixo + composto alto →
findability (dica), iso alto → time, progredindo → orçamento, e a 4ª categoria ECONOMIA DE AÇÃO (o rider exige
mais ação que o turno dá, revelada pelo delta do isolamento). Ordem de correção: isolamento → time → dica →
afrouxar. Anti-sinergia registrada: numa negação, agredir CONVIDA a ação negada. Distinção: afrouxar o RECURSO
que a condição consome (turno) é legítimo, a CONDIÇÃO disfarçada de setup não. **Taxa 6/6 fechadas ⇒ ~12 sessões
p/ as 91.** **PERGUNTA RESPONDIDA: "precisa de dica" ERA "time errado" — a dica do poseidon era a correção
fácil, a certa era o time.** Isolamento=composto=37 (delta 0 → rider Encharcado é grátis; o 37 é dano puro);
troquei sobek→piranha (atacante Maré, bônus em Encharcado) → VENCÍVEL SEM dica, 19 lances, 677 nós. Removida a
dica, re-carimbado. **NENHUMA das 6 usa dica** — dica é último recurso. **Regra do delta:** `composto−isolamento`
= preço do rider; delta≈0 → time/dica, delta grande → o rider é o gargalo. Ordem validada 2×: **isolamento →
TIME → dica → afrouxar.** **Consequência de produto (só se dicas voltarem a ser necessárias após o time):
sistema de dicas** — por ora, adiada (o lote 1 não precisou de nenhuma). Ambiguidades
decididas: perseu "petrificado"≡atordoado (§54, sinônimo de prosa); izanagi "morrer de DoT"→"cair CARREGANDO
DoT" (§106); kraken "golpe final" precisa de `queda.slotAbate` — **é barato** (o `slot` já está no `bater`),
entra quando o lote da forma "abate-por-slot" chegar. Desacoplamento: `solucionador.test`/`provacao.test` liam o
`poseidon.json` de produção (agora difícil) — o fixture tunado (60 HP) mudou-se p/ DENTRO das suítes. **21 suítes
verdes.** **PRÓXIMO (dono):** o saci (varredura do tag de roubo §106 — quantas das 91 precisam da distinção,
antes de construir o tag); depois os lotes das formas-rider (o dono re-sequencia); as 9 Camada-C ainda esperam
predicado próprio. Revisitar a pergunta "dica vs time" no poseidon quando houver mais casos.

## Sessão — F2.3: o bestiário (12 criaturas PvE; régua de tropa; 11/11 destravadas) (anterior)
**Data:** 2026-08-23
**Tarefa:** F2.3 — as 12 criaturas de PvE (vêm ANTES dos lotes: 11 das 91 dependem delas). §151.
**Resultado:** as 12 em `data/bestiario/*.json`, **forma de deus + campo `hp`**, **zero mecanismo novo**
(varrido contra o motor, §93). **3 decisões do dono:** #1 Servo = atacante puro de 12 sem explosão
(divergência-com-gatilho anotada: deus futuro morte→dano faz nascer a primitiva, o Servo herda); #9 Quimera =
imunidade TOTAL a controle (aproximação-para-cima, família do cleanse da Nüwa/Ísis); tropa tem **régua PRÓPRIA**.
**Teto confirmado: básico 20 / habilidade 25** (dano só; cura/escudo não auditados) — o dono recusou 18/24
colado nos máximos: "régua que quebra com um ponto de balanceamento é fotografia, não régua". A régua é
**TESTE QUE RODA** (`tests/bestiario.test.js`, no `npm test`) e **morde**: criatura de 25 no básico REPROVA
(prova negativa). Achado §115-estendido: o lifesteal do Ghoul NÃO estava em aberto — `curaPorAlvo:6` já existia;
alegação de "está em aberto" também exige verificação. **`novaUnidade` lê `g.hp || 120`** — dois sentidos
provados no mesmo commit (§134): 100 deuses seguem 120 (fracoes.test intacto), criatura nasce com o dela (65..180).
**Integração:** `catalogoProvacao()` = deuses ∪ bestiário; `montarProvacao` passa o merged + aceita override de
`maxHp` (CHEFE = deus + 200-300, maxHp antes do hp); `catalogoHash` e o carimbo usam o merged (o hash vê o que o
jogo roda). **11 de 11 destravadas, sem sobra:** ares · bennu · boitata · bragi · durga · hercules · kraken ·
mulasemcabeca · perseu · tanuki · ymir; cross-check dos 91 → **0 nomes de inimigo não reconhecidos** (nenhuma 13ª
criatura, nenhum vazamento). **21 suítes verdes.** **PRÓXIMO (dono):** construir as 91 estruturadas em lote
(regra §149 do INDETERMINADO: parar e reportar, afrouxar×dica é decisão do dono) — as 11 do bestiário já podem
entrar; **checador cross-file `provacoes.json`↔`roster_data.js` (§146)** quando as 91 forem geradas; **anotar com
endereço o custo do Difícil na arena** (§150: 3.200 partidas ~100s→~330s se a Fase 3 rodar no Difícil); e, quando
a UI de Ordália existir, **injetar `BESTIARIO` no bundle** (hoje `provacao.js` é Node-only, o bestiário não vai ao
`.html`).

## Sessão — F2.2: a IA por níveis (Provação pina no 'normal'; trava = IDENTIDADE) (anterior)
**Data:** 2026-08-21
**Tarefa:** F2.2 — IA por níveis; decisão embutida: qual nível a Provação usa. §150.
**Resultado:** correção de vocabulário — "previsível" → **DETERMINÍSTICO**; e o argumento decisivo é a
**IDENTIDADE** (o solucionador verifica contra o MESMO oponente que o jogador enfrenta; divergir = o carimbo
é aposta). `NIVEIS_IA=[facil,normal,dificil]` em `src/ia.js`, todos determinísticos (SEM Math.random, SEM
corte por tempo): facil=só-Básico, normal=gulosa, dificil=2-ply-dentro-do-turno. **A Provação pina no 'normal'**;
dificuldade vive no estado+condição, não na IA (níveis são p/ jogo normal+arena; Ordália não escala IA; e a
Provação ENSINA a pilotar → oponente uniforme). **Trava de IDENTIDADE:** `build.js §3d` FALHA (exit 1) se
`prov.nivelIA` ≠ `verificacao.nivelIA` (mentira); hash velho segue só AVISO. Custo `ia.test`/nível (30 partidas):
facil 547 · normal 781 · **dificil 2545ms (~3,3×)** — afordável interativo, medir p/ arena em lote. poseidon
re-carimbado (nivelIA 'normal'). Testes: ia.test +bloco de níveis; solucionador.test nivelIA→'normal'. **22
suítes verdes.** Gatilho de revisão: se o CPU do jogo mudar de nível nas Provações, os 91 carimbos invalidam —
a trava de identidade impede passar em silêncio. **PRÓXIMO (dono):** construir as 91 estruturadas em lote
(regra §149: INDETERMINADO → parar e reportar, dono decide afrouxar×dica; §5 usa lancesNesteCaminho como sinal
grosso); checador cross-file provacoes.json↔roster_data.js (§146) quando as 91 forem geradas.

## Sessão — F2.1: o solucionador (prova JOGABILIDADE, não solubilidade) (anterior)
**Data:** 2026-08-21
**Tarefa:** F2.1 — `tools/solucionador.js`, prova que cada Provação tem um caminho de vitória. §148.
**Resultado:** a busca exaustiva mais-curta (BFS) DIVERGE já no Poseidon raso (20k nós, fila 90k crescendo) —
exaustão é intratável. Reformulado (dono): o solucionador prova **JOGABILIDADE** (existe caminho), não
solubilidade. Estratégia **C** = best-first (min-heap, `h = HP inimigo + falta da condição`, a heurística mais
simples) + exaustão-quando-cabe. 3 vereditos: **VENCÍVEL** ("existe caminho, aqui está um" — NÃO o mínimo;
`lancesNesteCaminho` é teto solto) · **INVENCÍVEL** só por exaustão real (NUNCA por orçamento) · **INDETERMINADO
ACIONÁVEL** (orcamento vs dica). Poseidon (montar tunado p/ vencível): **VENCÍVEL em 4 nós, 26ms**, caminho
Maremoto→Dilúvio→Afogamento (3 inimigos caem Encharcados) — heurística simples bastou, não sofistiquei.
Carimbo de versão (pendente desde a F1.0a): `verificacao:{hash, nivelIA, veredito, caminho, ...}` gravado via
`--carimbar`; `build.js §3d` AVISA (não falha) quando o hash diverge/falta. `acumulo{fonte,limiar}` com as 9
fontes. `tests/solucionador.test.js` (6 blocos). **22 suítes verdes.** Ferramentas: `node tools/solucionador.js
[deus] [orç]` e `--carimbar`. **Observação p/ os lotes:** se o solucionador precisar de `dica` p/ achar o
caminho, essa Provação pode ser impossível p/ o jogador sem dica — o `acionavel:'dica'` é o detector.
**REGRA DOS LOTES (§149):** quando uma Provação der INDETERMINADO, PARAR e reportar (acionavel + estado inicial
+ o que mudaria); o dono decide **afrouxar × dar dica** (afrouxar = balanceamento disfarçado, invisível no
relatório). Nunca corrigir sozinho. O `poseidon.json` de hoje é o exemplo TUNADO, não a Provação do catálogo.
**PRÓXIMO (dono):** F2.2 — a IA por níveis (vem ANTES dos lotes: o carimbo grava o nível, re-carimbar 91 é
pior que definir os níveis antes). Decisão embutida em aberto: qual nível a Provação usa (minha leitura
trazida com argumento, aguardando o dono). Depois: construir as 91 em lote (§5 usa `lancesNesteCaminho` como
sinal grosso, não medida); checador cross-file provacoes.json↔roster_data.js (§146) quando as 91 forem geradas.

## Sessão — a mira `distribui` na IA (§144 resolvido) (anterior)
**Data:** 2026-08-21
**Tarefa:** dar à IA gulosa uma regra de mira para `alvo:'distribui'` (§144), ANTES do solucionador — porque
8 times inimigos das 91 têm kit distribui e o solucionador gravaria SEQUÊNCIAS contra um oponente cego
(sequência errada parece prova; §147). §147.
**Resultado:** `iaAlvoSets` (`src/ia.js`) ganhou o caso `distribui` com os 2 intents reais (focar no mais
fraco / dividir igual entre vivos), ordem por menor-HP (§92: 1º leva o extra), no máx 2 conjuntos/ação — o
mínimo é a poda. Custo: `ia.test` ~1000ms→~810–906ms (sem regressão). Ao vivo: a IA divide 4×8 e mata 3.
Arena re-rodada (`docs/arena_pos_distribui.txt`): os 4 invisíveis apareceram — Babi +6,8 · Hou Yi +6,8 ·
Raijin +2,1 · Sun Wukong +3,1; nenhum saltou muito; distribuição intacta (média 50%, dp 14,0→13,9). **A
linha de base agora mede 100/100** (ressalva do §141-A levantada). 21 suítes verdes. **PRÓXIMO:** F2.1 — o
solucionador (plano aprovado inteiro: 3 vereditos, carimbo de versão, custo medido, Poseidon resolvido;
`acumulo` nasce com as 9 fontes / 16 consumidores, §146/§147).

## Sessão — reescrita das 4 condições de invocação (anterior)
**Data:** 2026-08-21
**Tarefa:** reescrever as 4 condições de Provação que dependiam de invocação (#42/56/91/96), deixando as 91
uniformes antes do solucionador. §146.
**Resultado:** as 4 reescritas (Khnum Couraça≥60 · Kitsune iscas→miragens · Iansã remover-buff-antes-da-queda
+ time novo · Cernunnos Fúria-reflete≥50-e-ativa-no-final). **Classificação: 0 modos novos, ~6 predicados
dentro dos 3 modos** — valida o fecho-por-modo com 4 antes do lote 1. Dois achados fora da tarefa: (1) a prosa
está DUPLICADA em `data/provacoes.json` E `src/roster_data.js` (5 campos: titulo/nivel/dif/req/cond; inimigos
só no 1º) — §134; editei os dois lados; auditoria cross-file dos 91 = 0 divergências; dívida-com-endereço: um
checador cross-file na build (candidato p/ quando a F2.1 gerar as 91 estruturadas). (2) o `inimigos` citava
mecânica morta — prosa-sem-fx (3ª espécie) num campo que a varredura de kits não olha; alcance ampliado: varrer
TODO campo de texto que descreve mecânica. #96 confirmado no motor: refleteDano é buff, a Ventania/stripBuffs
da Iansã o apagam — a Provação ficou mais coerente que com invocação. `roster_data.js` (986K tokens, imagens
embutidas) editado por script de string-replace verificado (cada troca 1×). **21 suítes verdes.** **PRÓXIMO:**
F2.1 — o solucionador (prova de solubilidade das 91); e, ao fechar o `acumulo` parametrizado, varrer os 91
antes (§46/§146). Pendências herdadas: mira `distribui` na IA (§144) antes da arena Difícil.

## Sessão — F2.0: o FORMATO da Provação (anterior)
**Data:** 2026-08-21
**Tarefa:** F2.0 — definir o formato da Provação (estado + condição, sem conteúdo ainda). §145.
**Resultado:** varri as 91 condições (`data/provacoes.json`) ANTES de fechar — são ~17 formas, não 8, mas
colapsam em **3 MODOS** (final/log/contínuo). Fecha por MODO, não por forma (forma nova cai num modo sem
tocar o avaliador). Duas formas que o dono tinha dobrado saíram como próprias: "golpe final" (≠ acúmulo: lê o
último evento, não a contagem) e "evento proibido" (⊃ sem-perder-aliado) — §46 na contagem de CONDIÇÕES.
A 9ª mais interessante: **fogo amigo** (abate pelo próprio lado do inimigo, Afrodite/Curupira) — única condição
definida por ação do OPONENTE; FRÁGIL (depende de o inimigo ter alvo), candidata a re-verificação quando o
solucionador rodar (pode ser a mais difícil das 91 sem a dificuldade saber). Construído: `src/provacao.js`
(registry fechado por modo + `montarProvacao` + `avaliarProvacao`, puro sobre st+log, não toca o motor);
`quando` DERIVADO do modo (validador recusa se declarado); `queda.matador` + `queda.estados` levados ao evento
(§106: o matador já existia no `matar` via §118; o estado-na-morte foi a única adição real) → fogo-amigo e
morrer-em-estado caem do log. `tools/build.js` §3c recusa predicado desconhecido na BUILD (exit 1, provado).
`proibirSlotProprio` × `negarAcaoInimigo` mantidos como 2 predicados (SEU lado × lado do oponente). Exemplo
`data/provacoes/poseidon.json` (deadline+morteEmEstado, 2 modos) carrega e resolve. `tests/provacao.test.js`
(6 blocos). **21 suítes verdes.** **PENDENTE p/ a Fase 2:** as 4 condições de invocação (#42/56/91/96) esperam
o `REMOCAO-invocacao.md` do dono; a regra de mira `distribui` na IA (§144, F2.2) antes de re-rodar a arena no
Difícil. **PRÓXIMO (dono):** conteúdo das Provações / próxima tarefa da F2.

## FASE 1 — FECHAMENTO (resumo da fase)
**Data:** 2026-08-21
**Placar:** **IMPL 100 / FUNCIONAL 100.** Os 100 kits estão em `data/deuses/*.json`, todos com passiva + 3
habilidades declarativas. 20 suítes verdes, cadeia sem DIVERGE, 0 partidas sem desfecho em nenhum harness.

### O que MUDOU DE ESTRUTURA na fase
- **De hardcode a declarativo.** No começo (root `bc21d52`) o motor era ~870 linhas com kits embutidos em código.
  Hoje `src/engine.js` tem 2085 linhas e é um **interpretador puro** de kits-JSON: nenhum `if key==='fulano'`. Toda
  a variação de deus mora em `data/deuses/*.json`, validada por `tools/valida_kit.js` (que lê o `VOCAB` do motor,
  fonte única) e conferida contra a prosa por `tools/checar_cadeia.js` (o build falha em DIVERGE).
- **Modularização.** `src/` foi de 3 arquivos / 1627 linhas para **18 arquivos / 4384 linhas** (a `view.js`
  monolítica de 754 linhas virou `src/ui/*` + `turno.js`/`perfil.js`/`invocacao.js`/`ia.js`/`rotas.js`/…).
- **O motor cresceu por VOCABULÁRIO, não por casos.** Hoje: **30** gatilhos de passiva · **37** verbos de `fx`
  (72 chaves de `fx` no total) · **24** condições (11 de alvo + 10 de estado/campo + 3 de cura) · **5** eixos de
  `contra` (classe/elem/funcao/alcance/slot) · **40** efeitos (11 controles + 18 buffs + debuffs) · **6** DoTs ·
  **9** contadores · **50** categorias de status · **9** alvos · **21** tipos de evento no narrador.
- **Os 9 mecanismos de sistema (M1–M9)** foram desenhados ANTES de construídos: agendador (M1), iniciativa (M2),
  consequência-de-abate (M3, que se dissolveu em três pequenos), extensão-de-imunidade (M4), realoca (M5),
  buffs-suspensos (M6), contra-delegado (M7), **invocação-alvejável (M8, só o Cernunnos)**, retaliação (M9).
- **Disciplina de teste em camadas:** isolamento (`primitivas.test.js`), comportamento (`passiva.test.js`),
  gramática de eventos (`eventos.test.js`), teto de dano (`auditoria.test.js`), prosa↔motor (`cadeia.test.js`),
  frações da vida (`fracoes.test.js`), IA/perfil/rotas/UI/enquadramento/invocação/perspectiva/energia/moldura.

### Quantas AMBIGUIDADES DE KIT apareceram
A tradução foi o degrau que mais achou. Sinais medíveis, ao fim da fase:
- **26 pares prosa↔motor não-conferíveis (2,3% de 1116)** no `checar_cadeia` — prosa que enuncia intenção sem um
  número que o fx carregue (ex.: "remove 1 debuff de cada aliado" → `cleanse` remove todos; erra p/ CIMA, dentro
  do teto). São aproximações-de-teto anotadas, não bugs.
- **20 habilidades acima do teto-base de dano** (allowlist do auditor), **todas condicionais** — bumps por-status,
  multi-golpe concentrado, ou nukes-de-fim-de-jogo previstos do catálogo. Nenhuma é dano-base estourado.
- **3 divergências-conhecidas-COM-GATILHO** (prosa diz mais do que o motor faz, de propósito, com evento nomeado
  que as resolve): Chang'e (§102-C, "ambos +8" → só self), Ares/Massacre (§118, recíproco), Sun Wukong (§102-C).
- **As 5 "espécies órfãs"** (§113 + §129): etiqueta-sem-enforce, campo-sem-fio, prosa-sem-fx, produtor-sem-
  consumidor, e a 5ª — **junta-não-ligada** (leitor certo + alimentador presente mas não produzindo) — que SÓ o
  motor rodando expõe. A varredura dirigida da 5ª (§134) deu LIMPA.
- **Lição transversal (§46):** o NOME não é evidência. Repetidamente a família sugerida pela prosa era menor que o
  balde (cura 20→7, reativa 10→6, invocação 4→3). O tell da prosa CLASSIFICA o mecanismo; o motor rodando CONFIRMA.

### O que a FASE 2 precisa saber
- **A IA é gulosa de 1 lance (`src/ia.js`), não minimax.** Ela pontua a posição imediata → **subestima
  setup/buff/control/invocação** (delta≈0 em 1 ply) e **superestima AoE+cura imediatos**. Isso enviesa QUALQUER
  leitura de balanceamento pela arena (ver abaixo). Minimax/lookahead é trabalho da Fase 2 e mudaria o ranking.
- **Dívidas com endereço** (ainda abertas, todas com dono e gatilho):
  1. **`opcoes` sem validação de contagem** (§123.1): o "escolha N" mora na UI, o motor aplica os índices que o
     cliente manda. Gatilho: **servidor autoritativo (Fase 5)** → vira `escolher:N` no kit + checagem em `agir` e
     `valida_kit`. Dono: o executor de `opcoes` + o validador.
  2. **`contra` sobrecarregado** (§134): o campo é OBJETO (`{classe|elem|alcance|slot}`) em reducao/aoSerAtingido
     e STRING (`'unico'|'todos'`) em intercepta/redirect/contraAtaca. Nenhum kit cruza as formas hoje; um autor que
     puser `contra:{alcance:'unico'}` numa intercepta teria falso silencioso. Dívida-de-FORMA (não junta).
  3. **Nove Flechas = 72** (Hou Yi, §94): candidato a revisão desde a construção. **A arena mediu:** Hou Yi 40,1%
     de vitória — o 72 exige as 9 flechas em alvos-Aurora, condição rara; NÃO é dominante na prática. Decisão do
     dono.
  4. **M8 serve UM kit** (§139): a invocação-alvejável é do Cernunnos só; os clones do Wukong não têm corpo. Não
     amortiza na família — é aceito, não é dívida a pagar.
- **Ferramenta nova:** `tools/arena.js` (a arena de balanceamento) roda IA×IA sobre o roster e imprime win-rate por
  deus, duração, fora-da-curva e habilidades-nunca-usadas. Determinística (PRNG semeado). Relatório da 1ª corrida
  completa em `docs/arena_fase1.txt`. **Nenhum número foi tocado** — o balanceamento é decisão do dono.

## Sessão — F1.2 sessão 10 (anterior)
**Data:** 2026-08-12
**Tarefa:** F1.2 sessão 10 — gatilho `aoCurar`; migração de **hera**. **FECHA A F1.2 (12/12).**
**Resultado:** varredura das "reativas" (o dono suspeitava balde, por ser NOME DE CATEGORIA). Confirmado: as 10
classificadas por GATILHO REAL (reage a quê, onde no motor) dão **6 ganchos distintos** — `aoCair` (morte: zeus
feito, erínias/ymir/nüwa futuros), `aoCurar` (cura: HERA), `aoUsarHabilidade` (bragi), `aoReceberControle`
(khonshu), `aoSerAtingido` (boitatá/xangô), `aoAtacar` (cernunnos). "reativa" NÃO é gatilho, é FAMÍLIA; **4 das 10
nem são novas** (são aoCair, faltam sujeitos). Abri só o da Hera, como fiz com os sujeitos do aoCair. **bonusCura
≠ aoCurar** (um MODIFICA a magnitude; o outro DISPARA efeito depois — confirmado dois mecanismos). **A Hera CABE
como `faz` de aoCurar** (gêmeo do aoCair), com UMA generalização: o sujeito do evento (o curado) ≠ dono, então (1)
o `faz` roda no curado, (2) o crédito vai no dono — `rodarFaz` ganhou `tagKey` opcional. Hera =
`{aoCurar, faz:[{t:'shield', v:10}]}`; `shield` entrou em `V.fxTurno` (turno-seguro, alvo = sujeito do evento).
Hardcode saiu do `curar`; Lote A (curado ganha EXATAMENTE 10, só o curado, nada com Hera morta) + capacidades
(escudo nos 3, Ogum zera) verdes SEM alteração; `grep key==='hera'` vazio; suíte inteira verde. Registrei §44
(reativa=balde), a prova ESTRUTURAL do absoluto em §43 (num 3v3 entrada≡absoluto por construção — vale p/ qualquer
cadência futura), e o item de sanidade de ambiente no checklist do §38 (código contradiz ESTADO.md → conferir HEAD
vs origin ANTES de tocar; o container reprovisionou 2× num commit velho). **Placar 11→12/12. F1.2 COMPLETA:** zero
hardcode de passiva nos 12 implementados. **PRÓXIMO (dono):** a F1.2 acabou; próxima fase (F1.3 execução/morte, ou
o que o dono priorizar). Ganchos abertos ficam para os deuses que os exigirem.

## Sessão — F1.2 sessão 9 (anterior)
**Data:** 2026-08-12
**Tarefa:** F1.2 sessão 9 — gatilho `aCadaN`; migração de **cuca** (deus inteiro: imunidade + aCadaN).
**Resultado:** varredura dos quatro da família (inari/kitsune/cuca/boto) nos DOIS eixos. **Eixo A (absoluto vs
relativo): TODOS ABSOLUTOS** — nenhum tem linguagem relativa ("desde a entrada"/"após o último uso"); a Cuca é
`st.turno % 3` no motor; e num 3v3 todos entram no turno 1, então entrada-relativa ≡ absoluta por construção. A
dúvida que o docs anotara (kitsune/boto relativos) NÃO se materializou. Fechado absoluto (`turno % n`, n≥2; n=1 é
porTurno). **Eixo B (o que faz): 3 são `faz:[fx]`** (inari orbGain, kitsune contador, boto apply-self) **e a Cuca
é a EXCEÇÃO** — "Básico grátis" é modificação de CUSTO lida em `acoesDe`, não efeito disparado (o dono previu no
ponto 3; não forcei no molde faz). **Forma: `aCadaN` = cadência `n` + payload POLIMÓRFICO** `faz` XOR
`custoGratis:{slot}` (validador exige exatamente um). Cuca = `{n:3, custoGratis:{slot:'basico'}}`. Implementei
`n`+`custoGratis` (o que a Cuca usa); payload `faz` entra com inari/kitsune/boto. Migração inteira: imunidade
`a:['adormecido']` (some hardcode do `aplicar`) + aCadaN (some hardcode do `acoesDe`). Lote B (imune só a Cuca;
Básico grátis turno 3, custa turno 4, só o Básico, só a Cuca) verde SEM alteração; `grep key==='cuca'` vazio;
suíte inteira verde. Registrei §42 (LIÇÃO TRANSVERSAL, pedida pelo dono: conceito que aparece mais como EFEITO de
gatilho que como gatilho próprio → família menor que o balde; cura/contador/orbe) e §43 (aCadaN). **Placar
10→11/12.** **PRÓXIMO (dono):** falta 1 — `reativa`→hera (gatilho novo, família ainda não varrida).

## Sessão — F1.2 sessão 8 (anterior)
**Data:** 2026-08-11
**Tarefa:** F1.2 sessão 8 — gatilho `bonusCura`; migração de **brigid** (deus inteiro, 2 cláusulas).
**Resultado:** varredura da família de cura ANTES da forma (3 perguntas do dono). **Q3:** dos 100, **20 MENCIONAM
cura mas só 7 são `bonusCura` próprio** (soma à magnitude) — o resto é balde: 9 cura-plana-por-gatilho (`faz`
heal — MAIOR que bonusCura, mesma lição do `faz:[fx]` do Rá; destrava com um `heal` em fxTurno na F1.x), 2
bônus-de-dano-por-ter-sido-curado (`alvoCuradoAntes`, já reservado), 3 outros. **Sexta correção de número por
varredura do conjunto inteiro (20→7).** **Q1:** o `quando` do bonusDano NÃO serve — as 9 chaves leem participantes
de um ATAQUE; cura não tem ataque. 3º eixo **`quandoCura`** (como o `contra` da sessão 3), abre só `inimigoTem`
(existe inimigo vivo do lado curado com tag DoT). **Q2/forma:** gatilho PRÓPRIO (não campo do bonusDano) por 3
razões — caminho de valor (`curar` ≠ `bonusDano`), evento (`cura` ≠ `dano`), eixo de condição disjunto. Migradas
as 2 cláusulas: +5 dano ao time = `{bonusDano,v:5,escopo:'time'}` (some com Brigid morta); cura +5 se inimigo
queima = `{bonusCura,v:5,quandoCura:{inimigoTem:'queimadura'}}`. Caracterização Lote B (ambas, incl. §39 "só
inimigo") verde SEM alteração; `grep key==='brigid'` vazio; suíte inteira verde. Alinhei o `desc` do JSON
("alguém no campo" → "algum inimigo") à planilha (§39, prosa vence). **Nota não-bloqueante:** "permanente" da 1ª
cláusula lido como "não expira por turno", não "sobrevive à morte" (hardcode sempre exigiu Brigid viva, igual a
thor −6); se o dono quis survives-death, é §39 e me avisa. DECISOES §41. **Placar 9→10/12.** **PRÓXIMO (dono):**
faltam 2 — `reativa`→hera, `aCadaN`→cuca.

## Sessão — F1.2 sessão 7 (anterior)
**Data:** 2026-08-11
**Tarefa:** F1.2 sessão 7 — abrir o sujeito `aoCair` quem:'self'; migração de **nezha** (revive próprio).
**Resultado:** a Nezha é o único caso em que o efeito reage à morte DO PRÓPRIO SUJEITO → a caracterização travou
ORDEM, não só magnitude/escopo. Os **4 travas** ficaram VERDES contra o hardcode ANTES de migrar e continuaram
verdes depois — **nenhuma divergência** com a prosa ("retorna no turno seguinte, 48 HP, 1×"): (1) revive DEPOIS
da limpeza de efeitos (renasce sem os efeitos que tinha ao cair); (2) queda-pendente NÃO conta p/ derrota (time
todo caído com Nezha pendente não perde até renascer/esgotar — `checarFim` respeita `pendenteRenascer`); (3) 1×
por partida (guarda `!renasceu`); (4) turno SEGUINTE, não o mesmo. Novo fx `reviveProximoTurno` (faz-only, em
`FX_TURNO`, executado por `rodarFaz` sob `!vivo && !renasceu`); `AOCAIR_QUEM` ganhou `'self'`; o revive-HP virou
parâmetro (`reviveHp`, default 48) reusável pelo Bennu (hp:60) na F1.x. `DOTS` ganhou `'veneno'` (imunidade da
Nezha; DoT real sem aplicador ainda). Hardcodes saíram de `matar` (revive), `aplicarDot` (imunidade agora via
`imuneA` declarativo). Rede: **motor #10 (Nezha renasce 1×)** e a **Lote B (imunidade: veneno bloqueia,
sangramento não)** verdes SEM alteração; `grep key==='nezha'` vazio. **Placar 8→9/12.** Suíte inteira verde.
**AMBIGUIDADE ainda aberta (DECISOES):** `aoCair` quem `aliado`/`qualquerInimigo` + matador-bound vs qualquer-morte
(morrigan/iansa/ahpuch) — decisão do dono ao migrá-los. **PRÓXIMO (dono):** faltam 3 — `bonusCura`→brigid,
`reativa`→hera, `aCadaN`→cuca.

## Sessão — F1.2 sessão 6 (anterior)
**Data:** 2026-08-11
**Tarefa:** F1.2 sessão 6 — gatilho `aoCair` (onKill+onDeath varridos juntos); migração de zeus.
**Resultado:** varredura dos 21 (onKill+onDeath) por SUJEITO: a morte é UM momento (`matar`), só o sujeito varia
→ **UM gatilho `aoCair {quem, faz}`** (eixo de sujeito, igual à imunidade), NÃO dois. `quem` abre só `'inimigo'`
(matador-bound: zeus "ao derrotar"); cresce por deus (`self`/`aliado`/`qualquerInimigo`). `faz` reusa `V.fxTurno`
(+ `orbGain.para` = elemento fixo, p/ zeus: 1 Tempestade — sem rng, fluxo idêntico). Migrado: **zeus** (hardcode
saiu do `matar`). Rede: zeus (Lote B) verde SEM alteração; `grep key==='zeus'` vazio. **Placar 7→8/12.**
**Q2 (timing):** `aoCair` dispara em `matar` após a queda registrada (unidade nunca sai do array; `pendenteRenascer`
funciona pós-limpeza) — mesma posição do hardcode antigo, comportamento atual, não inventado. **Nezha destravável
antes do previsto:** `aoCair` já existe; abrir `quem:'self'` + caracterizar o timing do revive fecha a Nezha
(imunidade já feita). **AMBIGUIDADE aberta (DECISOES):** "quando um inimigo é derrotado, [eu] X" (morrigan/iansa/
ahpuch) não diz matador-bound vs qualquer-morte — decisão do dono ao migrá-los; zeus é inequívoco. 17 marcos verdes.
**PRÓXIMO (dono):** os de-1 restantes (`bonusCura`→brigid, `reativa`→hera) movem o placar; `aoCair`+self→nezha;
`aCadaN`→cuca.

## Sessão — F1.2 sessão 5 (anterior)
**Data:** 2026-08-11
**Tarefa:** F1.2 sessão 5 — gatilho `imunidade` (infraestrutura; migra 0 real, como a sessão 1).
**Resultado:** varredura das imunidades: o "27" era balde 2,25× maior que a família real — somava imunidade (12)
+ redução (já migrada) + anti-revive (6) + condicionais (2). Gatilho `imunidade` com `a:[tags]`, sub-vocab
FECHADO `CONTROLES ∪ DOTS ∪ 'controle'` (coringa = todo controle). UM gatilho (declaração uniforme; enforcement
varia: `aplicar` p/ controle, `aplicarDot` p/ DoT — provado no sintético controle+DoT+coringa). Migrei 0 real
(cuca/nezha precisam de `aCadaN`/`onDeath` também); enforcement é no-op nos reais (sem `imunidade` fx). **Placar
PARADO em 7/12** (avisado antes). Confirmei lendo a prosa: jörmungandr/ísis dizem "imune a controle" (coringa é
o contrato) → **F1.4 amplia essas duas por construção** (registrado). NÃO inclui imunidade-a-mecânica (execução
→F1.3) nem condicional. §37 ganhou o 5º caso (varredura corrige número: 27→12); §38 o item de checklist de RNG;
docs registram a separação "imune engana: imunidade × anti-revive × condicional". **Justificativa da sessão
(destrave futuro):** `imunidade` é o 2º mecanismo mais populoso (12 kits o exigem); 2 (jörmungandr, ísis) ficam
com passiva inteira declarável. 17 marcos verdes. **PRÓXIMO (dono escolhe):** os de-1 (`bonusCura`→brigid,
`onKill`→zeus, `reativa`→hera) fecham 1 deus cada e movem o placar; `aCadaN`/`onDeath` fecham cuca/nezha.

## Sessão — F1.2 sessão 4 (anterior)
**Data:** 2026-08-11
**Tarefa:** F1.2 sessão 4 — gatilhos de turno (`porTurno`+`abertura`); migração de ra + ganesha.
**Resultado:** a família por-turno tem 3 formas distintas (todo-turno 7 / abertura 7 / a-cada-N 4) → **3 gatilhos
nomeados**, não eixo temporal. Abri `porTurno` (todo turno) e `abertura` (1º turno); `aCadaN` fica para depois.
**Propriedade da família (não detalhe do ra): o gatilho de turno EMBRULHA um efeito (`faz`), não um escalar.**
`faz` reusa o vocabulário de fx mas FECHADO aos turno-seguros (`V.fxTurno`=`contador`,`orbGain`); alvo fixo
self/lado (valida_kit recusa fx fora do conjunto e alvo≠self); eventos recebem `passiva:<key>`. Migrados
INTEIROS: **ra** (`porTurno` Disco + `bonusDano` Aurora+5) e **ganesha** (`abertura` +2 orbes); 3 hardcodes
saíram; `sortearElemento`==orbGain garante RNG idêntico (nenhuma partida seeded mudou). Rede provou: Lote A (ra)
e Lote B (ganesha) verdes SEM alteração. `grep key==='ra'|'ganesha'` vazio. **Placar TERMINADOS 5→7/12.**
Nota registrada (docs): quando o `aCadaN` chegar, decidir se `n` é absoluto (cuca=turno%3) ou relativo (kitsune/boto).
17 marcos verdes. **A curva desce por gatilho novo — faltam 5, TODOS bloqueados:** brigid→`bonusCura`[1],
zeus→`onKill`[1], hera→`reativa`[1], cuca→`imunidade`+`aCadaN`[2], nezha→`imunidade`+`onDeath`[2].
**PRÓXIMO:** gatilho que destrava mais — `imunidade` avança cuca+nezha (2, mas cada um precisa de +1); ou os
de-1 (bonusCura/onKill/reativa). Dono escolhe.

## Sessão — F1.2 sessão 3 (anterior)
**Data:** 2026-08-11
**Tarefa:** F1.2 sessão 3 — gatilho `reducao`; migração de sobek + thor (por DEUS inteiro).
**Resultado:** gatilho `reducao` (`v`, `escopo` self|time, `contra` defensivo), `red = Math.max(red, v)` (regra
6). **Eixo defensivo `contra` SEPARADO do `quando` ofensivo** — `quando` lê quem ataca/é atacado/estado do
campo; `contra` lê o GOLPE QUE CHEGA; não se misturam (declarado em docs/passivas.md). Nome `contra:{slot}` em
vez de `de:'basico'` (que sobrecarregaria: slot/classe/elemento no mesmo campo sem desambiguar). Abri só `slot`;
as outras 8 formas da família de redução entram por deus. Migrados INTEIROS: **sobek** (`bonusDano`+6 +
`reducao`10 contra básico) e **thor** (`reducao`6 time); 3 hardcodes saíram. Rede provou equivalência: Lote A do
sobek e capacidades #93 do thor passaram SEM alteração. `grep key==='sobek'|'thor'` vazio no motor (só 2
comentários). **Placar TERMINADOS 3→5/12** (falta brigid, cuca, ganesha, hera, nezha, ra, zeus). §37 ganhou a
LIÇÃO C (varredura da família inteira antes de fechar = padrão consolidado, 3ª vez). 17 marcos verdes.
**PRÓXIMO:** próxima categoria de gatilho por frequência/destrave — candidatos: `porTurno` (destrava ra+ganesha,
2), `bonusCura` (brigid), `onKill` (zeus), `reativa` (hera), `imunidade`+`onDeath` (nezha), `porTurno` (cuca). Dono escolhe.

## Sessão — rede Lote B + correções §39 (anterior)
**Data:** 2026-08-11
**Tarefa:** Rede de equivalência — Lote B + correção das duas divergências prosa-hardcode (§39).
**Resultado:** **rede COMPLETA** — os 9 hardcoded têm caracterização que cobre a passiva de fato (magnitude E
escopo exatos, verde contra o hardcode). Lote B em `tests/passiva.test.js`: brigid (+5 team qualquer elemento;
cura +5 só com INIMIGO queimando), cuca (adormecido só na Cuca; Básico grátis só em turno%3===0), ganesha (+2
orbes na abertura, não repete), zeus (+1 Tempestade só quando o Zeus mata). **Corrigidas as duas divergências
(prosa VENCE, §39):** `aplicarDot` — nezha só imune a veneno+queimadura (era todo DoT, folga que crescia
sozinha); `curar` — brigid cura-bônus só com INIMIGO queimando (era qualquer lado). **Impacto no jogo hoje:
nenhum** (nenhum dos 12 queima aliado → caso divergente inalcançável; suíte verde sem uma asserção mudar, então
a exceção do §38 não precisou ser usada). §38 ganhou a exceção declarada (corrigir divergência prosa-hardcode);
§39 ganhou a lição do 3º tipo + a regra "prosa vence". 17 marcos verdes. **PRÓXIMO:** sessão 3 — gatilho
`reducao` migra sobek+thor (rede pronta para ambos), placar TERMINADOS 3→5/12.

## Sessão — rede Lote A + auditoria (anterior)
**Data:** 2026-08-11
**Tarefa:** Rede de equivalência — auditoria dos 9 + Lote A de caracterizações (sem migração).
**Resultado:** auditei a cobertura de passiva dos 9 hardcoded lendo os BLOCOS (não grepando o nome): **1 SIM
(thor), 2 PARCIAL (hera só afirmava escudo>0, não =10; nezha só cobria revive), 6 NÃO** — maioria descoberta,
tarefa partida em 2 lotes (dono bateu Lote A agora, tirando o Rá do B para ele não virar caminho crítico da
sessão 4). **Lote A escrito** em `tests/passiva.test.js` (6 cláusulas, magnitude E escopo EXATOS contra o
hardcode, zero migração): sobek (+6 vs debuff / −10 só de básico), hera (escudo ===10, só o curado, só Hera
viva), nezha (queimadura 100% bloqueada só na Nezha), ra (+5 só Aurora / Disco +1/turno teto 6 só no turno do
Rá). **Terceiro tipo de furo achado** (hardcode > prosa, §39): nezha é imune a TODO DoT (prosa: veneno+queimadura);
brigid dispara o +5 de cura com queimadura em QUALQUER lado (prosa: inimigo) — trazer ao dono ao migrar cada um.
CLAUDE.md: lição "teste que existe ≠ teste que cobre". 18 marcos verdes. **PRÓXIMO:** Lote B (brigid, cuca,
ganesha, zeus) — completa a rede; depois a sessão 3 (gatilho `reducao` → migra sobek+thor, placar 5/12).

## Sessão — F1.2 sessão 2 (anterior)
**Data:** 2026-08-11
**Tarefa:** F1.2 sessão 2 — gatilho `danoIrredutivel`; migração de ogum e tyr (por DEUS inteiro).
**Resultado:** `GATILHOS_PASSIVA` virou spec por gatilho (campos/obrigatórios); `danoIrredutivel` lê `ignora ⊆
[reducao,escudo]`, aplicado em `calcDano` via `danoImune`. Migrados INTEIROS: **ogum** (bonusDano +10 vs defesa
+ danoIrredutivel[reducao]) e **tyr** (danoIrredutivel[reducao,escudo]); os 4 hardcodes saíram do motor.
`valida_kit` dispara por gatilho (campo de outro gatilho → "não pertence"; `ignora` fora de IGNORAVEIS → recusa).
**Furo achado ao verificar (não supor):** ogum NÃO tinha asserção da passiva (só da habilidade) — era furo como
o Rá. Escrevi a caracterização do ogum ANTES de migrar (rede que faltava); tyr já tinha rede (motor.test #9).
Ambas passam contra o dado → prova de equivalência. Regra registrada (§38): CARACTERIZAR ANTES DE MIGRAR, com
a distinção acrescentar-cobertura ≠ alterar-suíte. Guarda contra invocação sem kit (`__inv`) em danoImune/
bonusDanoDeclarativo. **Placar: TERMINADOS 3/12** (ogum, tyr, fujin*). `grep key==='ogum'|'tyr'` vazio no motor.
18 marcos verdes. **PRÓXIMO:** antes da sessão 3 (gatilho `reducao` → sobek+thor), escrever as caracterizações
de ra, thor e fujin (rede completa antes de precisar).

## Sessão — plano F1.2 sessão 2 (anterior)
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

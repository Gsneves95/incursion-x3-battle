# Inventário e reconciliação — INCURSION

> **Tarefa F0.1.** Retrato do que existe *de fato* no repositório, para as fases
> seguintes partirem da realidade e não da documentação.
>
> **Método:** tudo aqui é **derivado de código**, não lido. Cada número mostra o
> comando que o produziu. Onde a contagem depende de heurística (tamanho de
> função), isso está dito. Data da coleta registrada em `ESTADO.md`.

---

## 1. Deuses

**Implementados no motor: 11 de 100.**

```
$ node -e "const E=require('./src/engine.js');console.log(Object.keys(E.GODS).length, Object.keys(E.GODS).join(', '))"
11  zeus, ogum, tyr, sobek, brigid, ganesha, cuca, fujin, nezha, thor, hera
```

Total do design (fonte da verdade `data/kits.json`):

```
$ node -e "console.log(require('./data/kits.json').length)"
100
```

`data/kits.json` é um **array de 100 objetos** (`num, key, nome, faccao, elemento,
tipo, funcao, arquetipo` + `basico/habilidade/milagre/defesa`). O motor implementa
o subconjunto em `GODS` (`src/engine.js:48`). Os 89 restantes existem como dado de
design mas ainda não têm efeito codificado — na seleção aparecem com a classe
`.semkit` (tracejado, dessaturado).

Os 9 primeiros são os iniciais (DECISOES §4); **Thor e Hera** entraram como
validação das primitivas novas (Thor exercita seleção de 2 alvos, Hera buff em 2
aliados).

---

## 2. Primitivas de efeito

**Todas as 12 primitivas do ROTEIRO (fase 1, item 6) existem no motor.** Nenhuma
da lista de verificação da F0.1 está pendente.

Tipos de efeito que o motor executa hoje (derivado dos ramos `t==='...'` / `t:'...'`
em `src/engine.js`):

```
$ grep -noE "(t\s*===?\s*'[a-zA-Z]+')|(t:\s*'[a-zA-Z]+')" src/engine.js | awk -F"'" '{print $2}' | sort | uniq -c | sort -rn
```

| Grupo | Tipos presentes |
|---|---|
| Dano / cura / recurso | `dmg`, `heal`, `selfHp`, `shield`, `orbGain`, `cdShift` |
| Estados | `apply`, `dot`, `cleanse`, `stripOne`, `stripBuffs`, `stripDef`, `destroyShield`, `atordoaMenorHp` |
| Estruturais | `vinculo`, `contador`, `fase`, `vidaExtra`, `revive`, `intercepta`, `contraAtaca`, `invocar`, `copiar`, `armazenaDano`, `livro` |
| Slots | `basico`, `habilidade`, `milagre`, `defesa` |

Verificação item a item da lista da F0.1 ("quais AINDA NÃO existem"):

```
$ for p in contador fase invocar revive vidaExtra intercepta contraAtaca copiar armazenaDano livro; do echo "$p -> $(grep -c "$p" src/engine.js)"; done
```

| Primitiva da lista | Existe? | Gancho no motor |
|---|---|---|
| Contadores acumuláveis (Combo, Disco Solar, Caudas, Atadura, Maldição, Podridão) | ✅ | `t:'contador'` + `porContador`/`consomeContador` |
| Estado global Dia/Noite | ✅ | `t:'fase'` + `seDia`/`seNoite` |
| Invocação | ✅ | `t:'invocar'` |
| Revive | ✅ | `t:'revive'` |
| Vida Extra | ✅ | `t:'vidaExtra'` |
| Interceptar | ✅ | `t:'intercepta'` |
| Contra-atacar | ✅ | `contraAtaca` |
| Copiar habilidade | ✅ | `t:'copiar'` |
| Dano armazenado | ✅ | `t:'armazenaDano'` |
| Contagem de morte | ✅ | `livro` + `porAliadoCaido`/`porInimigoCaido` |
| Escolha múltipla | ✅ | `opcoes:[…]` + `agir(...,escolhas)` (11 ocorrências) |
| Seleção de 2 alvos | ✅ | `alvo:'2inimigos'`/`'2aliados'` (4+4) |

### 2b. Implementada ≠ PROVADA

Uma primitiva **implementada** tem código no motor e teste em isolamento
(`primitivas.test.js`, com cenários sintéticos). Uma primitiva **provada** é
exercitada por um **deus real do roster que está entre os 11 implementados**.
São coisas diferentes, e a distinção muda o plano da Fase 1.

Derivação — quais tipos/campos de primitiva aparecem **dentro do bloco de dados
`GODS` (L48-227)**, isto é, no kit de um implementado:

```
$ sed -n '48,227p' src/engine.js | grep -oE "t:\s*'[a-zA-Z]+'|2inimigos|2aliados|contador|fase|revive|invocar|copiar|opcoes|intercepta|contraAtaca|armazenaDano|livro|vidaExtra"
# só aparecem: 2inimigos / 2aliados
```

| Primitiva | Deus que a exercita (roster) | Entre os 11? | **PROVADA por kit real?** |
|---|---|:--:|:--:|
| Seleção de 2 alvos | **Thor, Hera, Nezha** | **sim** | ✅ **SIM** |
| Contadores acumuláveis | Rá, Kitsune, Anúbis, Ah Puch, Ares | não | ❌ não |
| Estado Dia/Noite (`fase`) | Amaterasu, Tsukuyomi, Hou Yi, Lugh | não | ❌ não |
| Vida Extra | Bastet | não | ❌ não |
| Revive | Osíris, Ísis, Anúbis | não | ❌ não |
| Contagem de morte (`livro`) | Osíris, Nüwa, Yan Wong | não | ❌ não |
| Dano armazenado | Xangô | não | ❌ não |
| Interceptar | Loki, Bastet, Hanuman | não | ❌ não |
| Contra-atacar | Heimdall, Bastet, Guan Yu | não | ❌ não |
| Invocação | Khnum, Cernunnos, Sun Wukong, Kitsune | não | ❌ não |
| Copiar habilidade | Ísis, Tanuki | não | ❌ não |
| Escolha múltipla | Nüwa, Lugh, Tanuki, Exu | não | ❌ não |

**Placar: 1 provada, 11 implementadas-mas-não-provadas.**

**Consequência (corrigida):** o item 6 do ROTEIRO está implementado, mas os 89 kits
**não** estão "desbloqueados por primitiva" e ponto. O correto é: **desbloqueados
por primitiva implementada, com 11 das 12 ainda não provadas por kit real.** Uma
primitiva só testada em isolamento pode ter arestas que um kit de verdade revela
(foi assim que apareceram as 6 contradições de kit e os 4 bugs de motor).

**Isto muda o plano da Fase 1:** antes dos lotes de ~15 deuses, a Fase 1 deve
**implementar o primeiro deus de cada primitiva ainda não provada** (um Amaterasu
para Dia/Noite, um Xangô para dano armazenado, um Khnum para invocação, etc.),
provando as 11 primitivas contra kits reais. Só então os lotes.

---

## 3. Telas e navegação

**Três telas**, todas em `src/view.js`, despachadas por uma variável `tela`:

```
$ grep -nE "if\(tela===" src/view.js
334:  if(tela==='pick'){renderPick();return;}
335:  if(tela==='invocacao'){INV.montar();return;}
      (senão) -> tela de batalha
```

| Tela | Valor de `tela` | Função | O que é |
|---|---|---|---|
| Seleção / coleção | `'pick'` | `renderPick()` | grade dos 100 deuses, filtro combinável, montagem de time, prévia de kit |
| Batalha | `'batalha'` | `render()` (corpo) | combate 3v3, hot-seat ou vs CPU |
| Invocação (gacha) | `'invocacao'` | `INV.montar()` | banners, pity, revelação de cartas |

**Como se navega hoje:** não há roteador. Botões atribuem `tela = '...'` e chamam
`render()` (ex.: `src/view.js:708` `#binvocar`, `:718` `#bgo`). **Não há histórico
nem "voltar".** As **sobreposições** são estado solto na própria tela, não rotas:
`ov`, `menuAberto`, `abaFoe`, `convAlvo`, `painelFiltro`, `focoPk`, `detalhe`
(`src/view.js:31`, `:464-471`). **É exatamente o que a F0.2 vai extrair.**

---

## 4. Divergências entre código e documentação

Distinção obrigatória (ajuste do dono): **fato dentro de invariante** eu atualizo
no documento; **violação de invariante** eu registro aqui e deixo o `CLAUDE.md`
intacto — o documento é o contrato, quem se ajusta é o código.

### 4a. Fatos desatualizados na documentação → **corrigidos nesta sessão**

| Onde | Dizia | Realidade (derivada) | Ação |
|---|---|---|---|
| `CLAUDE.md` arquitetura + NÃO FAÇA | "as **4 suítes**" | **7 suítes** (ver §6) | corrigido para 7 |
| `CLAUDE.md` estado | não mencionava CPU | existe IA vs CPU (`src/ia.js`) | linha "CPU" adicionada + DECISOES §16 |
| `DECISOES.md` | sem entrada da CPU | IA gulosa de 1 lance controla o J2 | entrada §16 criada |

> A vida 100→120 **já estava** documentada (DECISOES §15) e não precisou de correção.

### 4b. Verificação dos invariantes contra o código — **1 violação encontrada (INV 16)**

**Verifiquei 5 dos 18 invariantes** (os de maior risco de regressão). Os outros
13 ainda **não** foram auditados contra o código — listados como pendência no
`ESTADO.md`.

Os 5 verificados:

| Inv | Verificação (comando) | Resultado |
|---|---|---|
| 1 — motor puro | `grep -nE "Math.random\|document\|fetch\|window\." src/engine.js` | só um **comentário** (L258); zero chamadas reais → **OK** |
| 10 — abertura 1/3 de energia | `st.aberturaFeita`, `st.starter` no motor | **OK** (coberto por teste) |
| 13 — tocar nunca gasta | `armar()` (`:865`) só arma; `confirmar()` (`:899`) comita | **OK** |
| 14 — cronômetro nunca pausa | `setInterval` (`:727`) roda; comentário L728; sem `clearInterval` em overlay | **OK** |
| 15 — inimigo só-leitura | `data-sk` só no botão **aliado** (`:217`); inimigo usa `data-look` (`:182`) | **OK** |

### 4c. Violação registrada (não corrigida): INV 16

**INV 16 — "um botão primário por tela".** Há 1 primário por tela-base (batalha
`#bend`, seleção `#bgo`). Mas as **sobreposições** trazem o próprio primário
(`#ffechar` no filtro, `#kitadd` no kit, `#bnew` no resultado). Com uma dessas
aberta **sobre** a seleção, existem **2 `b--primary` no DOM ao mesmo tempo** — a
base atrás do scrim. É uma **violação da letra do invariante**, registrada aqui e
**não corrigida** (o CLAUDE.md, que é o contrato, fica intacto).

```
$ grep -nE "b--primary" src/view.js   # 5 ocorrências, em telas/overlays distintos
```

**A F0.5b já prevê** "um teste que falha se aparecer um segundo primário" — é a hora
de decidir se a sobreposição deve *rebaixar* o primário da base, ou se "por tela" já
considera a sobreposição como a tela ativa. Decisão do dono.

---

## 5. Dívida técnica (apontada, **não corrigida**)

**Arquivos acima de 400 linhas:**

```
$ wc -l src/*.js | sort -n
     3 src/roster_data.js
    89 src/ia.js
   357 src/invocacao.js
   899 src/engine.js
   922 src/view.js
```

- `src/view.js` — **922 linhas**. Concentra topo, campo, painel, sobreposições e
  seleção. Alvo direto da **F0.3**.
- `src/engine.js` — **899 linhas** (inclui o bloco de dados `GODS`).

**Funções longas** (heurística `awk` de `function X` até a próxima; mostra o método):

```
$ awk '/^(function |async function )/{...}' src/*.js
```

| Arquivo | Função | ~linhas | Nota |
|---|---|---|---|
| `src/engine.js` | `aplicarFx` (`:762`) | ~94 | núcleo de resolução de efeitos |
| `src/engine.js` | `bater` (`:378`) | ~64 | cálculo de dano (redução→escudo→vida) |
| `src/view.js` | `ligar` (`:742`) | ~99 | liga todos os eventos de uma vez |
| `src/view.js` | `renderPick` (`:629`) | ~95 | monta a tela de seleção inteira |

> A heurística marcou `mulberry32` com ~203 linhas — **falso positivo**: é um RNG de
> 1 linha, e o `awk` contou o bloco `const GODS` que vem depois dela. Registrado para
> não induzir a refatoração errada.

**Estado global de UI espalhado** (`src/view.js:30-31`, `:464-471`): `st`, `tela`,
`pick`, `armado`, `alvos`, `escolhidos`, `vsCPU`, `IA_LADO`, `iaAtiva`, `ov`,
`detalhe`, `abaFoe`, `convAlvo`, `menuAberto`, `pagina`, `filtro`, `vez`,
`tudoLiberado`, `focoPk`, `F`, `painelFiltro`. Espalhamento que a **F0.2** (navegação)
e a **F0.3** (modularização) atacam.

**Fontes externas:** `src/shell.html:8-10` carrega Cinzel/Rajdhani do Google Fonts.
O arquivo abre offline (cai para fonte do sistema), mas a tipografia exata depende de
rede. Não é invariante; anotado como dependência a considerar se um dia se quiser um
`dist/` 100% autossuficiente.

---

## 6. Testes

**7 suítes, todas verdes.** (O `CLAUDE.md` dizia "4" — corrigido.)

```
$ npm test 2>&1 | grep ">>>"
>>> TODOS OS TESTES PASSARAM   (motor)
>>> NOVAS CAPACIDADES OK       (capacidades)
>>> PRIMITIVAS OK
>>> AUDITORIA OK
>>> IA OK
>>> TUDO OK                    (interface)
>>> INVOCAÇÃO OK
```

**Asserções por suíte** — contagem de *call-sites* `ok(` (o comando abaixo; alguns
ficam dentro de laços, então a execução em runtime é ≥ este número):

```
$ for f in tests/*.test.js; do echo "$f: $(grep -oE "\bok\(" "$f" | wc -l)"; done
```

| Suíte | `ok(` call-sites | Cobre | Origem |
|---|---:|---|---|
| `motor` | 31 | regras de resolução, dano, energia, vitória | original (documentada) |
| `capacidades` | 22 | capacidades novas do motor | original (documentada) |
| `auditoria` | 30 | motor × definições da planilha | original (documentada) |
| `interface` | 216¹ | DOM/toque via jsdom sobre o build | original (documentada) |
| `primitivas` | 32 | as 12 primitivas em isolamento | **adicionada** (fase 1, item 6) |
| `invocacao` | 18 | gacha via jsdom: 100 deuses, pity duro, taxas | **adicionada** |
| `ia` | 7 | CPU: prioridade de abate, cura, 30 jogos IA×IA terminam | **adicionada (esta sessão)** |

¹ `interface` tem muitos `ok(` dentro de laços (varre 5 tamanhos de tela, partida
completa por toques etc.), por isso o número destoa; é call-sites, não execuções.

**Reconciliação do "4 vs 7":** o pacote documentado tinha **4** (`motor`,
`capacidades`, `auditoria`, `interface`). As **3** adicionais são `primitivas`,
`invocacao` e `ia` — e o que cada uma cobre está na tabela.

**Não coberto (lacunas):** navegação/rotas (não existe módulo ainda → F0.2),
perfil/persistência (não existe → F0.4), e não há teste que trave "um só primário
por tela" (§4c → F0.5b).

---

## 7. Auditoria da F0.5a (material) — **item a item, sem marcar por adjacência**

O material foi implementado no commit anterior. Conferido contra os 8 critérios:

| # | Critério | Status | Evidência |
|---|---|---|---|
| 1 | Chanfro por `clip-path` (7px), não `border-radius` | ✅ | `shell.html:35` `--chanfro:7px`; `:525` polígono; `border-radius:0` nas placas |
| 2 | **Técnica de duas camadas** (clip-path remove a borda) | ✅ **corrigido (F0.5a-restante)** | régua agora é camada de trás (elemento, cor da régua, chanfro 7px) + preenchimento na frente (`::before`, inset 1px, chanfro 6px); prova por teste abaixo |
| 3 | Bisel: `inset` claro no topo, escuro na base | ✅ | `:531-532` |
| 4 | Textura por `feTurbulence` em data URI | ✅ | `:36` `--grao` |
| 5 | Moldura do campo com ornamento em L nos cantos | ✅ | `.field` + 4 `<i>` (`:543-548`); render em `view.js:340` |
| 6 | Texto gravado nos títulos | ✅ | `:552` `--grav` aplicado aos títulos |
| 7 | Aplicado a detalhe, **energia**, menu, popups; não aos discos/retratos | ✅ **corrigido (F0.5a-restante)** | barra de energia (`.energy`) agora tem material (régua+chanfro+bisel); discos/retratos seguem de fora |
| 8 | No máximo 5 elementos com textura na tela | ✅ **mantido** | a barra de energia recebeu material mas SEM grão (superfície pequena; grão só nas grandes, `:44`) → textura permanente na batalha segue **1** (`.detail`), ≤2 com menu/popup; ≤1 na seleção |

**Elementos com textura na tela (resposta à pergunta do critério):** na batalha,
**1** em repouso (painel de detalhe), no máximo **2** (com menu ou um popup aberto).
Na seleção, **0–1** (só quando abre filtro/kit). Bem abaixo de 5.

### Teste empírico do critério 2 (não por opinião)

Placa com chanfro exagerado (30px) e régua grossa (`inset 0 0 0 3px #ffcc33`),
ampliada 4×. **Observado:** as **4 arestas retas** (topo, base, esquerda, direita)
têm a régua amarela; as **4 diagonais do chanfro estão NUAS** — sem régua.

**Por quê:** o `inset box-shadow` é pintado como um anel de 1px ao longo das 4
arestas do **retângulo** (border-box); o `clip-path` então corta os cantos. As faixas
horizontais/verticais terminam onde o corte começa, e a nova hipotenusa não recebe
nenhuma faixa. **A hipótese do dono está confirmada:** régua por `inset box-shadow`
não cobre as diagonais.

### Prova da CORREÇÃO do critério 2 (mesmo método, régua grossa 3px, chanfro 30px, 4×)

Duas placas lado a lado, ampliadas: a NOVA (duas camadas) tem a régua dourada nas **8
arestas** — as 4 retas E as 4 diagonais. A VELHA (`inset box-shadow`, reproduzida) tem
régua nas 4 retas e as **4 diagonais NUAS**, como antes. Na barra de energia real (régua
de 1px) a régua acompanha os cantos chanfrados. A técnica de duas camadas resolve porque
as duas camadas são chanfradas e deslocadas 1px — o anel de 1px sobra em todo o perímetro,
não só nas arestas do retângulo.

### Conclusão: **F0.5a-restante FEITA.** Os 8 critérios estão atendidos.

- **(critério 2)** régua pela técnica de duas camadas (`shell.html` — elemento = régua,
  `::before` = preenchimento inset 1px, chanfros 7px/6px). Provado por imagem.
- **(critério 7)** material aplicado à barra de energia (`.energy`), sem grão (superfície
  pequena — critério 8 mantido em 1 textura permanente).

Placas de material por tela (contagem depois da mudança): **batalha** 2 em repouso
(`.detail` + `.energy`), ≤3–4 com menu/popup; **seleção** 0 em repouso, 1 com filtro/kit.
`::before` é `pointer-events:none` — nenhum alvo de toque quebrou (pílulas e Trocar
respondem no centro; hit-test confirmado). Falta só **F0.5b** (sistema de botões) para
fechar a Fase 0.

---

## 8. Decisões abertas do dono (herdadas de DECISOES §Abertas + ESTADO)

- Nome dos elementos: Solar/Lunar/Vazio (design) **vs** Tempestade/Umbra/Maré/
  Aurora/Chama/Verdejante (planilha). ~60 habilidades a retraduzir; custo sobe com a
  arte. **Fechar antes da produção de arte.**
- Ordem A/S/SS atribuída aos 100 deuses (a loja da fase 3 precifica por ela).
- Passiva do Fujin (inerte sem Raijin no time).
- Pick/ban (sem ele o meta converge para 8 deuses).
- §4c acima: comportamento do primário sob sobreposição (INV 16).

---

## 9. Recomendação: como quebrar o `engine.js` (só recomendação, não executar)

Hoje `engine.js` tem **899 linhas** e mistura **dados** (o bloco `GODS`, L48-227, e
`DEFESA`, L229-233) com **regras** (resolução, dano, energia, primitivas). Na Fase 1,
provar 11 primitivas + escrever 89 kits vai **inflar o bloco de dados** para muito
além do dobro — os kits são dados, não lógica. Se ficarem no mesmo arquivo, o motor
fica ilegível e o diff de cada kit novo polui a revisão da lógica.

**Recomendação (para uma tarefa futura, provavelmente início da Fase 1):**

1. **Extrair os kits dos 11 para `data/kits_motor.json`** (ou manter em
   `data/kits.json`, que já tem os 100 em forma de design, e fazer o motor ler dali
   uma forma normalizada). O `tools/build.js` já injeta JSON — o padrão existe.
2. `engine.js` fica **só com regras**: `agir`, `bater`, `aplicarFx`, resolução de
   turno, energia, as 12 primitivas. Passa a receber o kit por dado, como já recebe
   `st.seed`.
3. **Um único formato de kit** para os 100, validado por um teste de schema, para as
   6 contradições-por-ambiguidade aparecerem como falha de dado, não de código.
4. Ganho: cada kit novo é um objeto em JSON + um teste; a lógica do motor não muda e
   o arquivo de regras para de crescer.

**Não fazer agora** — é dependência da Fase 1 e deve ser a primeira tarefa dela,
antes de provar as primitivas, para os novos kits já nascerem no formato certo.

---

## 10. Divergência de ECONOMIA — a invocação foi construída contra a planilha ANTES da conversão NA (F0.4b)

A F0.1 comparou código × documentação de **regras**, não de **números de economia**.
Ao ligar o pity ao perfil (F0.4b), apareceu uma divergência de classe parecida: a
tela de invocação (`src/invocacao.js`) parece ter saído da planilha **original**
(5★/6★, pity 60), anterior à conversão para o estilo NA (ordem A/S/SS). **Não
corrigido** — registrado para a reconciliação de economia (que precisa de
`data/economia.json`, ver abaixo).

| Item | Implementado (código) | Documentado (design NA) |
|---|---|---|
| Pity duro (SS garantido) | **80** (`st.p5>=80`) | **60** |
| Pity suave | a partir do **74º** (`0.015+0.06*(p5-73)`) | não especificado aqui |
| Nomenclatura interna | `p5`/`p4` + `RANKN={SS:'5★',S:'4★',A:'3★',B:'2★'}` | ordem **A/S/SS**, sem estrelas |
| Tiers | SS, S, A **e um `B`** (`POOL.B`, vazio — "não temos B nos 100") | só **A/S/SS** (B não existe) |
| Taxa SS | **1,5%** base (`P.SS=0.015`) | — |
| Taxa S | **8,5%** (`P.S=0.085`); A = resto (~90%) | — |
| Garantia S | `p4>=10` → S garantido (garantia de 4★) | — |
| Custo avulso | **150** gemas | — |
| Custo pacote ×10 | **1500** gemas (exatamente 10×, **sem desconto**) | — |
| Banners com taxa diferente | **sim:** `destaque` (rate-up dobrado + **50/50** no SS via `gf`), `padrao` (pool cheio, sem rate-up/50-50), `iniciante` (grátis 1×, 10 com SS garantido) | — |
| Carteira inicial (protótipo) | gemas **30000**, pergaminhos **30** | — (afordância de teste) |

**`data/economia.json` NÃO existe.** É **pendência bloqueante da Fase 3**: a loja
precifica por ordem e o simulador de economia lê esse arquivo. Sem ele, os números
acima vivem espalhados em `invocacao.js` como literais — a fonte da verdade da
economia precisa existir antes de balancear a loja/gacha.

**Recomendação:** ampliar o inventário para cobrir **números de economia** (não só
regras), e criar `data/economia.json` como fonte única (pity, taxas, custos, banners),
na reconciliação que antecede a Fase 3.

### 10a. A fonte documentada EXISTE (no xlsx), o código divergiu dela

**Resposta ao "a planilha original (pré-conversão) está no repo?": NÃO.** O único
`.xlsx` é `docs/INCURSION_Roster_e_Kits_ESTILO_NA.xlsx` — a versão **convertida**
(estilo NA), com um `LEIA-ME` que a declara fonte da verdade. Não há arquivo
pré-conversão para renomear/remover. **Mas** esse xlsx tem a aba **"Aquisição — gacha
sem poder"**, e é ali que mora a economia **documentada** — que o código NÃO seguiu:

| Item | Implementado (`invocacao.js`) | **Documentado (xlsx "Aquisição")** | Delta |
|---|---|---|---|
| Taxa SS | 1,5% | **3%** | código é **metade** |
| Taxa S | 8,5% | **17%** | código é **metade** |
| Pity duro | 80 | **60 invocações** | +20 no código |
| Custo avulso | 150 gema | **150 gema** | igual |
| Custo pacote ×10 | 1500 gema | **1350 gema** | código **removeu o desconto** (~10%) |

Ou seja: as taxas do código (1,5%/8,5%) são exatamente **metade** das documentadas — o
padrão da planilha **original, pré-conversão**. O pity 74/80 **não vem de fonte
nenhuma** do projeto — é convenção do gênero, preenchida no vazio. A causa comum das
duas: **não existe `data/economia.json`** e o código foi escrito olhando fonte
superada ou convenção, não a aba "Aquisição". A reconciliação (insumo em
`docs/economia-divergencias.md`) precede a Fase 3.

### 10b. Varredura de constantes numéricas embutidas (o critério pedido pelo dono)

Procurei **constante de regra ou economia embutida em código**. Duas classes:

- **ECONOMIA, SEM fonte em `data/` (o problema):** `invocacao.js` — `P.SS=0.015`,
  `P.S=0.085`, soft pity `p5>=74`, hard pity `p5>=80`, garantia S `p4>=10`, custo
  `1500`/`150`, carteira inicial `gemas=30000`/`perg=30`. Todos literais, sem json de
  origem, e divergentes do xlsx (§10a). **É a lacuna a fechar com `data/economia.json`.**
- **REGRA, com spec no xlsx mas não em `data/` (menor risco, consistente):** `HP 120`
  e `maxHp` (engine `:245`), `CONV_CUSTO=3` (engine `:533`), `TURNO_SEG=60` (turno
  `:7`), empate no turno 40. Batem com as abas "Regras de Combate"/"Resolução" do
  xlsx; ficam em código como constantes. Candidatos a migrar para `data/` numa
  reconciliação de regras (não urgente — não divergem).

**Conclusão da ampliação:** a parte do jogo construída **sem arquivo de especificação**
é a **economia** (invocação/gacha e, quando existir, loja). As regras de combate têm
spec no xlsx e batem com o código. A economia é a única frente onde a lacuna virou
número inventado — e é exatamente onde o `data/economia.json` tem de nascer primeiro.

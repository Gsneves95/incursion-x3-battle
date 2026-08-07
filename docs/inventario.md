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

**Consequência:** o item 6 do ROTEIRO está fechado; o próximo trabalho de conteúdo
(os 89 kits) não é bloqueado por primitiva faltante — é acionado por dado.

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

### 4b. Verificação dos invariantes contra o código — **nenhuma violação encontrada**

| Inv | Verificação (comando) | Resultado |
|---|---|---|
| 1 — motor puro | `grep -nE "Math.random\|document\|fetch\|window\." src/engine.js` | só um **comentário** (L258); zero chamadas reais → **OK** |
| 13 — tocar nunca gasta | `armar()` (`:865`) só arma; `confirmar()` (`:899`) comita | **OK** |
| 14 — cronômetro nunca pausa | `setInterval` (`:727`) roda; comentário L728; sem `clearInterval` em overlay | **OK** |
| 15 — inimigo só-leitura | `data-sk` só no botão **aliado** (`:217`); inimigo usa `data-look` (`:182`) | **OK** |
| 10 — abertura 1/3 de energia | `st.aberturaFeita`, `st.starter` no motor | **OK** (coberto por teste) |

### 4c. Ponto a confirmar com o dono (não é violação clara, mas encoste em INV 16)

**INV 16 — "um botão primário por tela".** Há 1 primário por tela-base (batalha
`#bend`, seleção `#bgo`). Mas as **sobreposições** trazem o próprio primário
(`#ffechar` no filtro, `#kitadd` no kit, `#bnew` no resultado). Com uma dessas
aberta **sobre** a seleção, existem 2 `b--primary` no DOM ao mesmo tempo — a base
fica atrás do scrim.

```
$ grep -nE "b--primary" src/view.js   # 5 ocorrências, em telas/overlays distintos
```

Não reescrevi o invariante. **A F0.5b já prevê** "um teste que falha se aparecer um
segundo primário" — é a hora de decidir se a sobreposição deve *rebaixar* o primário
da base, ou se "por tela" já considera a sobreposição como a tela ativa. Deixo para
sua decisão.

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
| 2 | **Técnica de duas camadas** (clip-path remove a borda) | ⚠️ **desvio** | usei **camada única** + régua por `inset 0 0 0 1px` (`:530`), que acompanha o chanfro. A borda-régua existe, mas **não** pela técnica de duas camadas pedida |
| 3 | Bisel: `inset` claro no topo, escuro na base | ✅ | `:531-532` |
| 4 | Textura por `feTurbulence` em data URI | ✅ | `:36` `--grao` |
| 5 | Moldura do campo com ornamento em L nos cantos | ✅ | `.field` + 4 `<i>` (`:543-548`); render em `view.js:340` |
| 6 | Texto gravado nos títulos | ✅ | `:552` `--grav` aplicado aos títulos |
| 7 | Aplicado a detalhe, **energia**, menu, popups; não aos discos/retratos | ⚠️ **incompleto** | detalhe/menu/popups ✅; discos/retratos corretamente de fora ✅; **a barra de energia do topo ficou SEM material** |
| 8 | No máximo 5 elementos com textura na tela | ✅ | elementos com `--grao`: `.detail`(1) sempre + `.menu`/popup **um por vez** → **≤2 simultâneos** na batalha; ≤1 na seleção |

**Elementos com textura na tela (resposta à pergunta do critério):** na batalha,
**1** em repouso (painel de detalhe), no máximo **2** (com menu ou um popup aberto).
Na seleção, **0–1** (só quando abre filtro/kit). Bem abaixo de 5.

### Conclusão: **F0.5a NÃO está 100% pronta.** Fica **F0.5a-restante** na fila:

1. **(critério 2)** decidir: reimplementar a régua pela **técnica de duas camadas**
   (elemento externo cor-da-régua + interno `inset:1px`, ambos com clip-path), ou
   aceitar formalmente a régua por `inset box-shadow` como equivalente. *Visualmente
   o chanfro com borda já aparece; é uma questão de aderir à técnica pedida.*
2. **(critério 7)** aplicar o material à **barra de energia do topo**.

Fora esses dois, os outros 6 critérios estão atendidos.

---

## 8. Decisões abertas do dono (herdadas de DECISOES §Abertas + ESTADO)

- Nome dos elementos: Solar/Lunar/Vazio (design) **vs** Tempestade/Umbra/Maré/
  Aurora/Chama/Verdejante (planilha). ~60 habilidades a retraduzir; custo sobe com a
  arte. **Fechar antes da produção de arte.**
- Ordem A/S/SS atribuída aos 100 deuses (a loja da fase 3 precifica por ela).
- Passiva do Fujin (inerte sem Raijin no time).
- Pick/ban (sem ele o meta converge para 8 deuses).
- §4c acima: comportamento do primário sob sobreposição (INV 16).

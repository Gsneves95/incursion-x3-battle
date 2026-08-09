# ESTADO — onde o projeto está

> Atualizado ao fim de cada sessão. Quem lê é uma sessão sem memória.

## Última sessão
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
  (localStorage, chave `incursion:perfil` + `incursion:historico`). Boot carrega;
  "Apagar dados" no menu ⋯. Pity do gacha ainda NÃO ligado (F0.4b).
- **Suítes:** 12, todas verdes (motor, capacidades, primitivas, auditoria, perfil, ia,
  rotas, interface, invocacao, **perspectiva**, **energia**, **moldura**). A `moldura` roda em
  Chromium real (`playwright` devDep); as outras 11 são node/jsdom. `energia` simula 500
  partidas IA×IA (~16s) — regressão de balanceamento além de contrato de sorteio.
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
- **Material (F0.5a):** aplicado a painéis/menu/popups + moldura do campo; **falta**
  a barra de energia do topo e a técnica de duas camadas na régua (ver abaixo).

## Próxima tarefa
**ID e nome:** **F0.6b — altura fixa, largura fluida.** O dono vai detalhar. Objetivo:
não perder escala em aparelho de proporção diferente do canvas fixo (926×428 = 2,164; o
aparelho do dono é 800×360 = 2,222). Hoje o canvas é fixo e a escala é `min(w/926,h/428)`;
em telas mais largas que 2,164 sobra tarja lateral. A F0.6b mira travar a ALTURA (428) e
deixar a LARGURA fluir, para telas largas usarem o espaço em vez de tarjar. **Esperar o
detalhamento do dono antes de mexer.**

**Depois: F0.4c — carteira lê o grant 1500.** A F0.4c foi destravada quando a economia
ficou pronta em `data/economia.json`: `novoPerfil` semeia `gema:1500` LENDO do arquivo
(nunca literal); a invocação gasta/credita via `perfil.moedas.gema` (`debitar`/`creditar`)
e persiste por `salvar`; o grant de teste 30000 continua FORA do perfil (só a recarga de
protótipo). Insumo já existe (`data/economia.json`, DECISOES §20).

**Depois (F0.5, visuais, colar juntas no fim da fase):**

**Ainda na fila (visuais, para colar juntas no fim da fase, F0.5):**
- **F0.5a-restante:** (crit. 7) material na barra de energia do topo; (crit. 2)
  régua do chanfro pela técnica de duas camadas (o `inset box-shadow` deixa as 4
  diagonais nuas — confirmado por teste).
- **F0.5b:** sistema de botões (4 níveis, estados de verdade, teste "1 primário").

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
sobreposição), registrada e não corrigida. **Pendente auditar os 13 restantes:**
2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 17, 18 (e o próprio 16 a decidir). Fazer numa
sessão de reconciliação ou ao encostar em cada área.

## Descobertas que ainda não viraram tarefa
> Notado durante o trabalho; não corrigir aqui.

- **DÍVIDA: o motor ESCREVE TEXTO DE INTERFACE (candidata à Fase 1).** O `engine.js`
  emite strings prontas em português no log ("— Turno 3, vez do Jogador 1 —",
  "Zeus → Cuca: 15 de dano", `st.fim='Jogador 2 vence'`). Funciona hoje, mas: (1) a Fase 5
  quer o MESMO motor no servidor, onde essas strings não deveriam existir; (2) localização
  fica impossível; (3) a tradução de rótulos da F0.7 (`traduzirRotulos` em `ui/base.js`) é um
  **REMENDO por cima de texto já formatado**, não a solução — está marcado como tal no código,
  apontando para aqui. **Forma alvo:** o motor emite EVENTOS estruturados
  (`{tipo:'dano', origem, alvo, valor, kind}`, `{tipo:'vitoria', lado}`, `{tipo:'vezDe', lado}`)
  e a visão formata. Mexe no motor → **fazer junto de quebrar o `engine.js`** (§9 do inventário),
  as duas na mesma passada, no começo da Fase 1.
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

- **INV 16 sob sobreposição:** com filtro/kit/resultado aberto sobre a tela-base,
  há 2 `b--primary` no DOM (base atrás do scrim). A F0.5b já prevê o teste que trava
  isso — decidir se a sobreposição rebaixa o primário da base. (inventário §4c)
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
- **Quebrar o `engine.js`:** 899 linhas hoje, dobra na Fase 1 com os 89 kits. Tirar
  os dados (`GODS`/`DEFESA`) para `data/` e deixar o motor só com regras. Recomendação
  detalhada em `docs/inventario.md` §9. **Deve ser a 1ª tarefa da Fase 1**, antes de
  provar as primitivas, para os kits novos já nascerem no formato certo.
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
- [ ] INV 16 sob sobreposição: a sobreposição rebaixa o primário da base? (F0.5b)
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

## Migração de perfil V1→V2 — JÁ PREVISTA (deixa de ser andaime)
O modelo shipado tem `invocacao: {total, desdeUltimoSS}` — **um** pity. Mas o jogo tem
banners com pity **independente** + o estado de **50/50 (`gf`)**. A forma correta é
**por banner**. Alvo da V2:
```
invocacao: { total, banners: { destaque:{desdeUltimoSS, garantiaFeat}, padrao:{...} } }
```
A `migrar()` v1→v2 converte `desdeUltimoSS` no pity do banner principal. Isto dá
trabalho REAL à migração (não é mais exemplo). **Encolheu:** com o 50/50 removido, some
o `garantiaFeat` — a forma alvo é só pity por banner (`{desdeUltimoSS}` por banner).
**Custo do interim atual:** só o pity do **banner principal** sobrevive ao reload; pity
de banners secundários se perde. Fazer quando o gacha ganhar banners de verdade.

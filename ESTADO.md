# ESTADO — onde o projeto está

> Atualizado ao fim de cada sessão. Quem lê é uma sessão sem memória.

## Última sessão
**Data:** 2026-08-07
**Tarefa:** F0.4 — Perfil e persistência (Fase 0). *(F0.1–F0.3 fechadas antes.)*
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
- **Suítes:** 9, todas verdes (motor, capacidades, primitivas, auditoria, perfil, ia,
  rotas, interface, invocacao). Call-sites `ok(`: 31/22/32/30/~22/7/~19/216/18.
- **CPU:** IA gulosa de 1 lance (`src/ia.js`) controla o J2; ligada por padrão.
- **Material (F0.5a):** aplicado a painéis/menu/popups + moldura do campo; **falta**
  a barra de energia do topo e a técnica de duas camadas na régua (ver abaixo).

## Próxima tarefa
**ID e nome:** **F0.4b — Ligar o pity da invocação ao perfil.** Hoje o sorteio da
invocação usa aleatório do cliente e o pity vive só em RAM (some ao recarregar).
Fazer: (1) sorteio vira **função pura com seed**; (2) o pity passa a **ler/gravar
`perfil.invocacao`** (via `salvar`), e cada pull registra em `registrarHistorico`.
**MUDANÇA DE COMPORTAMENTO OBSERVÁVEL** (jogador com 59 pulls passa a mantê-los ao
recarregar) → **registrar em DECISOES.md** e, se `invocacao.test.js` precisar mudar,
**PARAR e pedir autorização linha a linha** (como na F0.2). É a primeira leitura/
escrita REAL pela camada nova — o teste de integração concreto da F0.4.

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
- **A tela de invocação foi ROTEADA — parece mais pronta do que é.** Rotear deu a
  ela um ar de acabada, mas o risco abaixo continua de pé: o sorteio precisa virar
  função pura com seed e o pity precisa morar no perfil. Não deixar a aparência de
  "pronta" esconder isso.
- **Invocação existe ANTES do perfil (F0.4) e da economia — RISCO DE RETRABALHO.**
  A tela de gacha já sorteia e conta pity, mas: (a) o sorteio precisa virar **função
  pura com seed** (hoje usa aleatório do cliente), e (b) o **pity precisa morar no
  perfil** (`invocacao: {total, desdeUltimoSS}` já está previsto no modelo da F0.4).
  Sem isso, o **simulador de economia da Fase 3 não reusa o mesmo código** e vai
  reimplementar as taxas — divergência garantida. Falta também `data/economia.json`.
  Encostar nisso na F0.4 (perfil) e antes da Fase 3.
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

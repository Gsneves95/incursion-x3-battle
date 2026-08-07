# ESTADO — onde o projeto está

> Atualizado ao fim de cada sessão. Quem lê é uma sessão sem memória.

## Última sessão
**Data:** 2026-08-07
**Tarefa:** F0.2 — Rotas e navegação (Fase 0). *(F0.1 fechada na sessão anterior.)*
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
  do ciclo de vida; batalha entra por substituição (não empilha). Sobreposições
  seguem sendo estado da tela, não rotas.
- **Suítes:** 8, todas verdes (motor, capacidades, primitivas, auditoria, ia, rotas,
  interface, invocacao). Call-sites `ok(`: 31/22/32/30/7/~17/216/18.
- **CPU:** IA gulosa de 1 lance (`src/ia.js`) controla o J2; ligada por padrão.
- **Material (F0.5a):** aplicado a painéis/menu/popups + moldura do campo; **falta**
  a barra de energia do topo e a técnica de duas camadas na régua (ver abaixo).

## Próxima tarefa
**ID e nome:** **F0.3 — Quebrar o `view.js`** (refatoração pura, ordem do doc).
Modularizar `src/view.js` (939 linhas) por responsabilidade em `src/ui/*` (base,
topo, campo, painel, sobrepor, selecao); cada módulo devolve HTML + uma função de
ligar eventos; nenhum acima de 300 linhas; `view.js` vira orquestrador; `build.js`
concatena na ordem de dependência (agora com `rotas.js` já no bloco de visão). **Não
tocar em `tests/`** — se precisar, PARAR e avisar. É aqui que o `view.js` finalmente
encolhe.

**Ainda na fila (visuais, para colar juntas no fim da fase, F0.5b):**
- **F0.5a-restante:** (crit. 7) material na barra de energia do topo; (crit. 2)
  régua do chanfro pela técnica de duas camadas (o `inset box-shadow` deixa as 4
  diagonais nuas — confirmado por teste).

**O que a próxima sessão precisa saber antes de começar:**
- O `CLAUDE.md` é o contrato: **fato desatualizado** se corrige; **violação de
  invariante** se registra no inventário e se avisa o dono — não se reescreve o
  invariante.
- Estado de UI hoje mora solto em `src/view.js:30-31` e `:464-471`. A F0.2/F0.3
  vão organizar isso; até lá, é o que há.
- Screenshots usam `playwright-core` + Chromium em `/opt/pw-browsers/chromium-1194`,
  instalado com `--no-save` e desinstalado antes do commit (devDependency = só
  `jsdom`). Deploy no GitHub Pages: push na `main` + `workflow_dispatch` manual do
  `pages.yml` (o push sozinho não vem disparando o workflow).

## Auditoria de invariantes — só 5 dos 18 verificados
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

# ESTADO — onde o projeto está

> Atualizado ao fim de cada sessão. Quem lê é uma sessão sem memória.

## Última sessão
**Data:** 2026-08-07
**Tarefa:** F0.1 — Inventário e reconciliação (Fase 0).
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
- **Telas existentes:** 3 — seleção (`'pick'`), batalha (`'batalha'`), invocação
  (`'invocacao'`). Sem roteador; navegação por `tela = '...'` + `render()`.
- **Suítes:** 7, todas verdes (motor, capacidades, primitivas, auditoria, ia,
  interface, invocacao). Call-sites `ok(`: 31/22/32/30/7/216/18.
- **CPU:** IA gulosa de 1 lance (`src/ia.js`) controla o J2; ligada por padrão.
- **Material (F0.5a):** aplicado a painéis/menu/popups + moldura do campo; **falta**
  a barra de energia do topo e a técnica de duas camadas na régua (ver abaixo).

## Próxima tarefa
**ID e nome:** decidir a ordem com o dono. Duas frentes prontas para começar:

1. **F0.5a-restante** (curto, visual) — fechar os 2 itens que faltaram no material:
   - **(critério 7)** aplicar o material `.placa` à **barra de energia do topo**.
   - **(critério 2 — falha confirmada por teste)** reimplementar a régua pela
     **técnica de duas camadas** (externo cor-da-régua clip 7px + interno inset:1px
     clip 6px). O `inset box-shadow` deixa as 4 diagonais sem régua.
2. **F0.2 — Rotas e navegação** (refatoração pura) — extrair `src/rotas.js` com
   histórico e `voltar()` em profundidade; render passa a despachar pela rota;
   sobreposições continuam sendo estado da tela, não rotas. **Não tocar em
   `tests/` — se algum teste precisar mudar, PARAR e avisar** (sinal de mudança de
   comportamento). Criar `tests/rotas.test.js`.

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

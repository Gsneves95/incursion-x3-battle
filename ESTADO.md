# ESTADO — onde o projeto está

> Atualizado ao fim de cada sessão. Quem lê é uma sessão sem memória.

## Última sessão
**Data:** 2026-08-07
**Tarefa:** F0.1 — Inventário e reconciliação (Fase 0).
**Resultado:** criado `docs/inventario.md` (tudo derivado de código, com o comando
à mostra em cada número); `CLAUDE.md` e `DECISOES.md` reconciliados (correção do
"4 suítes" → 7; entrada §16 sobre a CPU); este `ESTADO.md` criado. Zero mudança de
comportamento. 7 suítes verdes. **Achado importante:** a F0.5a (material) NÃO está
100% pronta — ver "Próxima tarefa".

## Situação atual
- **Deuses implementados: 11 de 100** — zeus, ogum, tyr, sobek, brigid, ganesha,
  cuca, fujin, nezha, thor, hera. (`Object.keys(GODS).length`)
- **Primitivas pendentes: nenhuma.** As 12 do ROTEIRO (fase 1, item 6) existem e
  são cobertas por `tests/primitivas.test.js`.
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
   - **(critério 2)** aderir à **técnica de duas camadas** para a régua do chanfro,
     OU o dono aceitar formalmente a régua atual por `inset box-shadow` como
     equivalente. Decisão do dono.
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

## Descobertas que ainda não viraram tarefa
> Notado durante o trabalho; não corrigir aqui.

- **INV 16 sob sobreposição:** com filtro/kit/resultado aberto sobre a tela-base,
  há 2 `b--primary` no DOM (base atrás do scrim). A F0.5b já prevê o teste que trava
  isso — decidir se a sobreposição rebaixa o primário da base. (inventário §4c)
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
- [ ] F0.5a critério 2: técnica de duas camadas vs. régua por `inset box-shadow`.
- [ ] INV 16 sob sobreposição (ver Descobertas).

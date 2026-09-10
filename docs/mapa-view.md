# Mapa do `src/view.js` — o ponto cego fora de `src/ui/` (§265)

**Por que este mapa existe.** Durante toda a sessão tratamos `src/ui/` como se fosse "a interface".
Não é. `src/view.js` (463 linhas, ~25 funções) é o ORQUESTRADOR: liga o jogo ao APARELHO
(voltar do Android, modo imersivo, splash), guarda o estado de sessão da UI, despacha o `render()`
pela rota, e — o que importa aqui — DESENHA telas próprias que **não passam pela rota**: o portão de
idade, o painel de conta, o banner de ranque. Como a varredura de encaixe do §261 andou pelas ROTAS
(`ir('...')`) e o `render()`, essas sobreposições de DOM próprio (fora do `#stage`, appendadas no
`document.body`) escaparam dela. Foi assim que o banner de ranque (§264) e o portão de idade (§262)
apareceram "por acaso": ninguém os tinha varrido. Este mapa mede o tamanho do ponto cego.

**Há DOIS arquivos que desenham tela fora de `src/ui/`, e são pontos cegos de tamanhos diferentes:**
- **`src/view.js`** — desenha 4 sobreposições de **DOM próprio fora do `#stage`** (portão de idade,
  botão/painel de conta, banner de ranque). Essas NÃO são rotas → a varredura do §261 não as alcança.
  É o ponto cego de verdade.
- **`src/invocacao.js`** (419 linhas) — desenha a tela de **INVOCAÇÃO no `#stage` como ROTA** (`montar()`
  faz `#stage.innerHTML = SKELETON`). Por ser rota, o §261 A ALCANÇOU ("home, Provações, Invocação —
  nada estourou"). Fica fora de `src/ui/` por história, mas foi varrida no estado base. As sub-camadas
  transientes dela (cartas do reveal, caixa de auditoria, toast) são desenhadas ad-hoc e podem não ter
  entrado na varredura — pendência menor, não o mesmo buraco do DOM-próprio.

---

## Tabela — todas as funções de `src/view.js`

Legenda de TELA: **sim** = o jogador vê DOM desenhado por ela; **não** = cola/estado/navegação/ponte.
As três perguntas só valem para as de TELA.

| Função | O que faz | TELA | (a) varrida no §261? | (b) em teste-usabilidade.md? | (c) saída + voltar do Android fecha? |
|---|---|---|---|---|---|
| `renderBatalha` | desenha a tela de BATALHA inteira (topo, fileiras, painel, rodapé, overlays) no `#stage` | **sim** | **SIM** — é a rota `batalha`; foi o foco do §261 (nome sob retrato, efeitos, Nüwa 142ch, apelido) | **SIM** — carrega as decisões 1,3,4,5,7,8 (tocar-não-gasta, energia, defesa, kit do inimigo, mensagem de derrota) | **sim** — ⋯→Sair / voltar abre o confirmar-sair (`ov='sair'`, `voltarNativo` trata `r==='batalha'`) |
| `montarPortaoIdade` | portão de IDADE (lei 15.211): texto + duas escolhas de faixa. DOM próprio fora do `#stage` | **sim** | **NÃO** — DOM próprio, não é rota; nunca varrido | **não** — é da Fase 5, posterior ao doc (portão da Fase 3) | **parcial** — a saída são as duas escolhas (é portão, não deve ser dispensável); MAS o voltar do Android NÃO o intercepta (`voltarNativo` não conhece `portao-idade`) → o back age na camada de baixo |
| `montarPainelConta` | painel da CONTA: id/faixa/ranque + fluxo de EXCLUSÃO (confirmação em 2 passos). DOM próprio | **sim** | **NÃO** — DOM próprio, não é rota; nunca varrido | **não** — Fase 5, posterior ao doc | **parcial** — tem "Fechar" e fecha ao tocar fora; MAS o voltar do Android NÃO o fecha primeiro (não tratado em `voltarNativo`) → §210/§240 não honrado |
| `montarBotaoConta` | botão discreto "conta" (canto inferior esquerdo); só logado; abre o painel | **sim** | **NÃO** — DOM próprio | **não** | **n/a** — é um lançador, não uma tela a fechar; texto "conta" trivial |
| `montarBannerRanque` | banner de fim de partida RANQUEADA (delta, faixa, mudança). DOM próprio (§264) | **sim** | **NÃO no §261** — mas MEDIDO no §264 (design 780, fontes reais, Suplicante não corta) | **não** — Fase 5 | **sim** — "Continuar" e, desde o §264, o voltar do Android fecha o banner ANTES de tudo |
| `render` | despacha o `render()` da rota atual (só cola) | não | — | — | — |
| `ligar` | despachante do wiring de eventos por módulo (`ligarCampo`/`ligarTopo`/…) | não | — | — | — |
| `voltarNativo` | tratador do VOLTAR do Android (§210/§240): fecha a camada mais alta, senão desempilha, senão sai | não | — | — | (é ele que responde a pergunta (c) das outras) |
| `ligarPlataformaNativa` | liga splash nativo, botão voltar, e o modo imersivo (Capacitor) | não | — | — | — |
| `imersivo` | esconde as barras de status/navegação (idempotente); no-op no navegador | não (chrome do sistema) | — | — | — |
| `montarPainelConta`→`excluirContaFluxo` | exclui a conta no servidor + apaga o local + reabre o portão de idade | não (orquestra; a tela é o portão) | — | — | — |
| `refrescarConta` | re-busca a conta do servidor (progresso ao vivo), com throttle | não | — | — | — |
| `iniciarPartidaServidor` | inicia partida contra a IA do servidor → entra na batalha | não (navega p/ batalha) | — | — | — |
| `entrarPvPBatalha` | entra na batalha de uma partida PvP pareada | não (navega) | — | — | — |
| `iniciarPvP` | define nick, entra na fila, ao parear entra na batalha | não (o lobby é `home.js`) | — | — | — |
| `iniciarRanqueado` | idem PvP, mas fila ciente de faixa; ao fim o servidor manda o resultado | não | — | — | — |
| `retomarPartidaServidor` | na reabertura, retoma a partida em curso do servidor → batalha | não (navega) | — | — | — |
| `aoPushGlobal` | despachante dos pushes do servidor (relógio, oponente, pareamento) | não | — | — | — |
| `apagarDados` | apaga todos os dados locais e recria o perfil | não | — | — | — |
| `voltarInvocacao` | navegação auxiliar (desempilha ou vai pra home) | não | — | — | — |
| `limparSobreposicao` / `sairBatalha` | zeram estado de sobreposição / param o relógio | não | — | — | — |
| `fecharPortaoIdade` / `removerBotaoConta` | removem o DOM das telas acima | não | — | — | — |
| `_plataformaApp` | detecta os plugins do Capacitor | não | — | — | — |
| `bootConta` (IIFE) | handshake da conta no boot; pode abrir o portão de idade | não (a tela é o portão) | — | — | — |

---

## O que a tabela diz (sem consertar nada)

1. **O ponto cego são as 4 sobreposições de DOM próprio do `view.js`** (portão de idade, botão/painel de
   conta, banner de ranque). Três desenham tela e **nenhuma foi varrida pelo §261** — porque vivem fora
   do `#stage` e não são rotas. O banner já foi medido no §264; o **portão de idade** e o **painel de
   conta** seguem SEM varredura de encaixe de texto.
2. **O voltar do Android só fecha 2 de 4** dessas camadas: a batalha (confirmar-sair) e o banner (§264).
   O **portão de idade** e o **painel de conta** NÃO são interceptados pelo `voltarNativo` — o back age na
   camada de baixo com a sobreposição ainda na tela. É uma lacuna §210/§240, do mesmo tipo que o §264
   fechou para o banner.
3. **`renderBatalha` é a tela mais carregada de decisões em risco** (6 das 13 de teste-usabilidade.md) e
   foi bem varrida pelo §261 — não é o ponto cego; é o oposto, a parte mais coberta.
4. **`src/invocacao.js` é rota** (desenha no `#stage`) e foi varrido; não é o mesmo buraco. Restam suas
   camadas transientes (reveal/auditoria/toast) como pendência menor.

**Resumo do tamanho do ponto cego:** 2 telas de fato não medidas (portão de idade, painel de conta) e
2 camadas sem o voltar do Android (as mesmas). Um arquivo é o ponto cego real (`view.js`); o outro
(`invocacao.js`) é rota varrida com resíduo transiente.

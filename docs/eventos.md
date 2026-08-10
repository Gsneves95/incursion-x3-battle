# Gramática de eventos do motor (F1.0b) — CONTRATO motor ↔ visão

O motor NÃO emite texto de UI. Ele emite **eventos estruturados**; o narrador
(`src/ui/narrar.js`) é o ÚNICO lugar que os traduz para pt-BR, no momento de exibir.
Isto existe porque o mesmo motor roda no servidor (Fase 4/5), onde string de português
não deveria existir, e porque `traduzirRotulos` (remendo sobre texto já formatado) some.

Este arquivo é o CONTRATO. Um teste (`tests/eventos.test.js`) varre todos os eventos de
uma partida completa e falha se algum violar a gramática — assim tipo novo nos 73 kits
entra certo por construção, não por convenção lembrada tarde.

## Regras da gramática (invioláveis)

1. **Todo evento tem `tipo`** (string). `tipo` é a ÚNICA coisa que decide o formato.
2. **Campos CANÔNICOS, reutilizados** — nada de sinônimo. Se dois eventos falam de
   quantidade, os dois usam `valor`. Vocabulário fechado:

   | campo | conteúdo | exemplo |
   |---|---|---|
   | `tipo` | o tipo do evento (chave) | `'dano'` |
   | `turno` | número do turno | `3` |
   | `lado` | lado, número | `0` (nunca `'Jogador 1'`) |
   | `origem` | quem age, CHAVE de deus | `'zeus'` (nunca `'Zeus'`) |
   | `alvo` | quem recebe, CHAVE de deus | `'cuca'` |
   | `valor` | quantidade (dano, cura, orbes, hp…) | `15` |
   | `kind` | qualificador de dano, CHAVE | `'puro'` (nunca `'[puro]'`) |
   | `duracao` | turnos | `2` |
   | `slot` | qual ação, CHAVE | `'milagre'` |
   | `efeito` | tipo de efeito, CHAVE | `'silenceClass'` |
   | `motivo` | por quê (bloqueio/imunidade/falha), CHAVE | `'invulneravel'` |

3. **Sempre CHAVE, nunca nome exibível.** `alvo:'zeus'`, não `alvo:'Zeus'`. `lado:0`,
   não `lado:'Jogador 1'`. O narrador resolve chave → nome (e o nome da habilidade via
   o catálogo da partida, por `origem`+`slot`).
4. **Zero formatação.** `kind:'puro'`, não `'[puro]'`. Sem maiúscula decorativa, sem
   símbolo, sem português, sem acento onde deveria ser chave.
5. **O narrador é TOTAL.** Evento de `tipo` desconhecido NÃO some do registro — aparece,
   nem que como despejo cru dos campos. Log que engole evento é onde bug de motor se
   esconde, e nos 73 kits isso vai acontecer. Teste crava: tipo inventado aparece.

## Tipos iniciais (derivados dos 11 kits — ~55 mensagens colapsadas)

Uma mensagem de sabor NÃO é um tipo. "Soberano: Zeus ganha 1 orbe" e "+2 orbes" são o
mesmo tipo `orbe` com `origem`/`motivo` diferentes; o narrador escolhe a frase.

| tipo | campos | narra (pt-BR, exemplo) |
|---|---|---|
| `abertura` | lado, valor | "Abertura: Jogador 1 recebe 1 energia." |
| `turno` | turno, lado | "Turno 3 · Jogador 1 joga" |
| `acao` | origem, slot, modo?, opcoes? | "Zeus usa Ira Celestial." |
| `dano` | origem, alvo, valor, kind | "Zeus → Cuca: 15 de dano." |
| `cura` | alvo, valor | "Brigid curou 15." |
| `dot` | alvo, efeito, valor, duracao | "Cuca sofre Queimadura (5/turno, 2t)." |
| `efeito` | origem, alvo, efeito, duracao | "Zeus aplica Silêncio Mágico em Cuca (1t)." |
| `orbe` | lado, valor, motivo? | "+2 orbes." / "Soberano: +1 Tempestade." |
| `conversao` | lado, valor, para | "Conversão: 3 orbes → 1 de Aurora." |
| `cd` | lado, valor | "Recargas do time inimigo +1." |
| `bloqueio` | alvo, motivo, efeito? | "Cuca está Invulnerável — efeito falhou." |
| `imune` | alvo, efeito | "Nezha é imune a Veneno." |
| `queda` | alvo | "Ogum caiu." |
| `revive` | alvo, valor | "Osíris revive Ogum com 40 de HP." |
| `passiva` | origem, alvo?, efeito?, valor? | "Renascido do Lótus: Nezha volta com 40." |
| `fase` | efeito('Dia'/'Noite'), duracao | "Dia ativado por 2 turnos." |
| `fim` | resultado('vitoria'/'empate'), lado?, motivo? | (também vira `st.fim` — ver abaixo) |

Novos tipos entram AQUI (uma linha) ao provar cada primitiva nos 73 kits; o campo tem de
sair do vocabulário canônico acima, ou o vocabulário ganha uma linha com decisão consciente.

## `st.fim` estruturado

Hoje é string (`'Jogador 2 vence'`). Passa a ser `{ tipo:'fim', resultado:'vitoria'|'empate',
lado? , motivo? }`. **Blast radius medido (sweep):** quase todo leitor de `st.fim` só testa
VERACIDADE (`if (st.fim)`) e não muda — `turno.js` (guardas), `engine.js:agir`, `view.js`
(scrim), e os `while (!st.fim)` das suítes. O ÚNICO que lê o VALOR para exibir é
`ui/sobrepor.js` (o `<h1>` do resultado, hoje via `traduzirRotulos`) → passa pelo narrador.
Escritores a converter: `engine.js` (vitória por queda; empate/HP no turno 40) e a rendição
em `ui/sobrepor.js`. Testes que SETam `st.fim` string sobem para a forma estruturada
(`rotas`, `perspectiva`, `interface §13`).

## Regra 6 — um evento, um sujeito (decisão do dono)

**Evento descreve UM acontecimento com UM sujeito.** Se três coisas aconteceram, são três
eventos. Um Milagre que atinge 3 emite **um `dano` por alvo** — nunca `alvos:[...]` com um
`valor` só. O motivo não é só gramática plana: cada alvo pode ter RESULTADO DIFERENTE (um
absorve no escudo, outro está Invulnerável e recebe 0, outro cai). Um `valor` agregado
mentiria sobre os três; um evento por alvo carrega a verdade de cada um.

## `motivo` é conjunto FECHADO (decisão do dono)

`motivo` é a porta dos fundos por onde o português volta ao motor ("porque estava
Invulnerável"). É CHAVE de um conjunto fechado, e a varredura de gramática valida contra ele.
Conjunto inicial (`E.VOCAB.motivos`) — cresce só por decisão consciente:

`invulneravel` · `submerso` · `controle_imune` · `imune_tipo` · `em_recarga` · `sem_energia`
· `silenciado` · `travada`

(Os quatro primeiros são bloqueio/imunidade de efeito; os quatro últimos são
indisponibilidade de ação em `acoesDe` — hoje strings pt-BR parseadas por regex na UI, que
passam a chave + a UI formata.)

## Decisões de contrato resolvidas

- **(A) DoT vira CHAVE** (`efeito:'queimadura'`), o narrador resolve para "Queimadura", igual
  a todo o resto — **sem campo isento** (exceção viraria o precedente que os 73 kits seguem, e
  a regra "sempre chave" morreria por mil concessões). Toca `data/deuses/*.json` para chavear;
  está no espírito da F1.0b e o schema da F1.0a já valida esses arquivos. Só há UM DoT hoje
  (`Queimadura`), então é barato; depois dos 73 seria migração. O mapa chave→nome dos DoTs
  mora em `ui/base.js` (compartilhado por `narrar.js` e `campo.js`; `ui→ui` é proibido).
- **(B) Narrador lê o catálogo** da partida (`st.catId`) para resolver `origem`+`slot` → nome
  da habilidade. Vive na visão, tem o `GODS` global. É o lugar certo.
- **(C) Um evento por alvo** — ver Regra 6.

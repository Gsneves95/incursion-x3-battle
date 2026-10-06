# §323 — Fase 5 Parte 1: mapear e propor (recalibrar o PvE para a IA v2)

> **Nada muda no conteúdo nesta parte.** É o mapa + o diagnóstico + a proposta. Nenhum Rito/Semanal/kit tocado.

## 1. Os níveis do jogador valem no PvE? — PROVA, modo a modo

O motor aplica níveis só quando a montagem passa `niveis` ao `novoEstado` (7º parâmetro → `catalogoEfetivo`).
`montarProvacao(prov)` repassa `prov.niveis || null`; `domMontarBatalha`/sandbox nem têm o parâmetro.

**Prova empírica** (deus com escada no básico = zeus): `montarProvacao` SEM `niveis` → `niveisEmBatalha` do
jogador = `{basico:1,habilidade:1,milagre:1}`; com `niveis:[{zeus:{basico:4}}]` → `{basico:4,…}`. Ou seja, hoje o
PvE roda no catálogo BASE (nv1) — confirma o §320.

| modo | monta por | passa `niveis` do jogador? (cliente) | replay re-monta com `niveis`? (servidor) | nível vale? |
|---|---|---|---|---|
| campanha | `montarProvacao` (iniciarAto/Encontro) | **não** | `_montarCampanha`→`montarProvacao` **sem niveis** | **não** |
| Ritos | `montarProvacao` (iniciarProva) | não | — (Rito não grava replay) | não |
| Desafios por deus | `montarProvacao` (iniciarDesafioDeus) | não | — (não grava replay) | não |
| Semanais | `montarProvacao` (iniciarSemanal) | não | `_montarSemanal`→`montarProvacao` **sem niveis** | não |
| composição | `montarProvacao` (iniciarDesafio) | não | `_montarDesafio`→`montarProvacao` **sem niveis** | não |
| Domínios | `domMontarBatalha`→`novoEstado(…,cat)` (sem 7º arg) | não (escala a corrida, não a conta) | `_montarDominio` idem | não |
| sandbox | `selecao.js`→`novoEstado(…,energia)` (sem 7º arg) | não | `_montarSandbox`→`novoEstado` **sem niveis** | não |

**Contraste (onde JÁ vale):** PvP — `server/partida.js` monta com `niveis: [niv0, niv1]` das contas
(autoritativo); o cliente prevê com `configurarNiveis` (os meus da conta + os do oponente do snapshot).

**Conclusão:** os níveis NÃO valem em NENHUM modo de PvE hoje — nem no cliente nem no replay. Para valerem em
todos, sem quebrar replay já gravado, é preciso (NÃO feito aqui):
1. **Montagem**: cada lançador de PvE passa `prov.niveis = [nivelMapDoJogador, {}]` (lado 0 = `contaAtual.niveis`
   filtrado pelo time; lado 1 = base — os inimigos de PvE não têm conta). Domínios/sandbox idem via o 7º arg do
   `novoEstado`.
2. **Envelope do replay**: passa a carregar um SNAPSHOT dos `niveis` do jogador daquela partida (hoje o envelope
   não os carrega). Sem isso, o servidor re-montaria no base → o kit leveled do jogador diverge → hash/ops não
   batem → crédito recusado.
3. **Servidor** (`server/pve.js`): re-monta com os `niveis` do envelope; **envelope sem `niveis` (replays
   pré-mudança / fila offline) → base** (back-compat, zero quebra).
4. Isto é mudança de MONTAGEM e de ENVELOPE — **ortogonal à versão da IA** (que já é por modo, §322 P3). Pode
   entrar junto com, ou separado da, migração de cada modo para a v2.

> Observação de dificuldade: ligar níveis do jogador FORTALECE o jogador — tende a tornar o conteúdo mais FÁCIL
> sob a v2 (ajuda a fechar os indeterminados). A régua de ajuste (abaixo) deve medir com os níveis que o modo
> realmente usará, para não recalibrar contra um jogador mais fraco do que o real.

## 2. O que impede cada conteúdo de ir para a v2

**Mecanismo geral (olhando a melhor linha da v1 contra a resposta da v2):** a v1 (gulosa) escolhia o maior dano
imediato e IGNORAVA a utilidade do inimigo; a v2 USA o kit inteiro do inimigo. O que fecha a vitória é a v2
gastando **controle** (atordoado/lockSkill), **debuff** (dmgDown/vulneravel/**noHeal**), **buff/sustain**
(dmgUp/cdShift/heal) e **foco/execução** — justamente o que derruba as CONDIÇÕES de sobrevivência/prazo dos Ritos.

Exemplos concretos (os dois INVENCÍVEIS):
- **hanuman** ("Devoção a Rama"): inimigos fenrir/durga/ammit; condição = proteger sunwukong + prazo 10 turnos.
  A v1 vencia em 23 lances. Sob a v2, **durga** usa `lockSkill`+`atordoado`+`vulneravel`+`dmgDown` e **fenrir**
  usa `noHeal` — a v1 nunca jogava isso. O controle + noHeal quebram a proteção de sunwukong dentro do prazo.
- **guanyu** (Semanal): inimigos mimir/inari/anubis; condição = não perder guanyu + prazo 12 turnos, mín. 16.
  Sob a v2, **mimir** se BUFA (`dmgUp`/`cdShift`) e rouba orbe, **inari** CURA o time (`heal`) — a v1 ignorava.
  O buff+sustain impede o burst a tempo e mata guanyu antes do prazo.

**"Só fundo" × "realmente fechado"** — o discriminador principal é o campo `acionavel` que o próprio
`solucionador` devolve ao bater o orçamento de 200k (gravado no `motivo` de `data/ia_winnability_v2.json` e
re-conferido item a item): `INVENCIVEL` = espaço de estados esgotado (prova de fechado); `orcamento` = heurística
AINDA progredindo no corte (mais fundo resolve); `dica` = heurística ESTAGNOU dentro de 200k (ambíguo — não prova
fechado). Os 32 conteúdos não-vencíveis caem em três baldes:

| balde | o que significa | n | itens |
|---|---|---|---|
| **① Fechado (INVENCÍVEL)** | espaço de estados ESGOTADO — vitória não existe sob a v2; **exige alavanca de conteúdo** | 2 | `rito/hanuman`, `semanal/guanyu` |
| **② Só fundo (`acionavel=orcamento`)** | heurística ainda melhorando no corte — **mais orçamento resolve**, conteúdo provavelmente intacto | 1 | `rito/isis` (melhorH=67, progredindo) |
| **③ Zona cinza (`acionavel=dica`)** | heurística parou dentro de 200k — **não prova fechado**; re-medir mais fundo antes de tocar no conteúdo | 29 | 26 rito + `semanal/ammit,afrodite,mnevis` |

Detalhe do balde ③ (melhorH no corte de 200k — quanto MENOR, mais perto a heurística chegou do alvo; candidatos
mais promissores para orçamento profundo primeiro):

| melhorH | rito | semanal |
|---|---|---|
| 0–2 (mais perto) | hel·0, shiva·0, iansa·0, ammit·1, hades·1, morrigan·1, yanwong·1, khnum·2 | — |
| 3–30 | thor·6, curupira·8, kitsune·8, susanoo·9, ra·10, hercules·16, aquiles·22, hera·30 | mnevis·10 |
| 31–100 | boitata·35, osiris·55, vishnu·66, demeter·67, sobek·74, izanami·89, change·92 | — |
| >100 (mais longe) | amaterasu·120, ahpuch·501, piranha·1001 | ammit·117, afrodite·153 |

**Leitura honesta (o que está provado e o que não está):**
- Balde ① está PROVADO fechado (exaustão real). São os únicos 2 que exigem, com certeza, uma alavanca de conteúdo.
- Balde ② (`isis`) quase certamente só precisa de orçamento — a heurística não tinha estagnado.
- Balde ③ é a armadilha: `acionavel=dica` **não** quer dizer "precisa de conteúdo". Contraexemplo medido: **curupira**
  está no balde ③ (estagnou com melhorH=8 a 200k) e **vence a 900k nós** — era só fundo mais profundo. Logo, antes
  de reclassificar qualquer item do ③ como "precisa de alavanca", o passo BARATO e correto é **re-rodar o
  solucionador com orçamento maior (ex. 700k–900k)** e só os que SEGUIREM indeterminados/INVENCÍVEIS entram na fila
  de ajuste (§3). Isso evita mexer em conteúdo que na verdade só estava fundo. (Esta re-medição profunda é trabalho
  da Parte 2 — aqui fica proposta, não executada.)

## 3. Regra de ajuste proposta (o Rito se ajusta ao deus, NUNCA o contrário)

**NUNCA mexer em kit de deus.** As alavancas vivem no DADO do Rito/Semanal (`prov`/`montar`), aplicadas **na ordem
da mais leve para a mais pesada**, até o conteúdo ficar VENCÍVEL sob a v2 num **orçamento fixo de 200k nós** (o
mesmo da verificação; o que não vence em 200k é "difícil de achar" = ainda não vencível pela régua):

1. **HP dos inimigos ↓** (`montar.unidades[].maxHp/hp`) — a mais leve, reversível, não muda identidade.
2. **Prazo da condição ↑** (`condicoes` deadline +turnos) — afrouxa o gargalo sem mudar o combate.
3. **Vazão de recurso do inimigo ↓** (`montar.semRenda`/`rendaFracao`) — reduz a FREQUÊNCIA da utilidade que a v2
   passou a usar (menos buffs/controles por partida) **sem tocar kit**. Ataca a causa (§2) diretamente.
4. **Trocar 1 inimigo** por um menos opressivo (`inimigos`) — muda a identidade do fight; mais pesada.
5. **Nº de inimigos 3→2** (`inimigos`) — pesada.
6. **Dica** (`dica`, abertura semeada) — **ÚLTIMA** alavanca. Lição do projeto: "derivado-sem-dica vence
   ambicioso-com-dica"; a dica só quando as leves não bastam.

**Alvo de dificuldade (não pode ficar trivial):** o `solucionador` acha a vitória MAIS CURTA; o v1-carimbo guarda
`lancesNesteCaminho` e `nos`. Proposta: após o ajuste, a vitória mais curta sob a v2 deve ficar numa **faixa em
torno do valor da v1** — comprimento v2 ∈ **[0,8×, 1,5×] do comprimento v1** (chão = não trivializou; teto = não
ficou mais punitivo que o original), e achável em ≤ 200k nós. Registrar o novo carimbo (v2) ao lado do v1.

Fluxo por item: aplica a alavanca 1 no menor passo; re-roda `solucionador --v2` (200k); se VENCÍVEL e dentro da
faixa → pronto; senão, próximo passo da mesma alavanca; esgotada a alavanca, sobe para a próxima. Tudo medido,
nada no olho.

## 4. Composição (time livre) — como verificar a vencibilidade sob a v2

A composição não tem solução única (o jogador monta qualquer time que cumpra a regra), então "winnable" = **existe
um time válido que vence**. Proposta: cada desafio de composição ganha, no dado, **times de referência**
(`timesRef`: 1–3 trios que CUMPREM a restrição do desafio, escolhidos como "o que um jogador razoável montaria").
`tools/verificar_pve_v2.js` resolve cada `timeRef` sob a v2; o desafio é VENCÍVEL se **≥ 1 time de referência**
vence em 200k. O modo `composicao` vai para a v2 quando TODOS os desafios têm ao menos um time de referência
vencedor. Os `timesRef` viram o contrato de verificação (como as escadas dos Ritos) — e a mesma régua de ajuste
(§3) vale se algum desafio não tiver nenhum time de referência vencedor (afrouxar o inimigo, nunca o kit).

## Reproduzir

```
node tools/verificar_pve_v2.js --modos=rito,semanal,campanha,composicao   # manifesto 200k
node tools/solucionador.js --v2 hanuman 700000                            # re-checar fundo×fechado
```

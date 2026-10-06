# §323 P2 ETAPA D — composição (time livre) por times de referência

A composição não tem solução única: o jogador monta QUALQUER time que cumpra a regra do desafio. Logo "winnable"
= **existe um time válido que vence**. `tools/ref_composicao.js` gera, por REGRA (não à mão), até 3 times de
referência por desafio — "o que um jogador razoável montaria": **menor raridade somada, ordem determinística**
(raridade A<S<SS, empate alfabético). Para os desafios de regra `livre` (que trazem uma CONDIÇÃO extra e por isso
exigem DANO), também gera os 3 **atacantes** mais baratos e um trio 2-atacantes-+-1-guardião. Cada time é
resolvido sob a v2 a 200k; o desafio é vencível se **≥ 1 time vence**.

## Resultado (v2, 200k)

| desafio | regra | vencível? | time de referência que vence (comp / nós) |
|---|---|---|---|
| cx_elemento | monoElemento | ✅ | aquiles,bennu,brigid (21 / 23) |
| cx_funcao | mesmaFuncao | ✅ | ahpuch,cuca,curupira (42 / 2.793) |
| cx_trio | funcoesDistintas | ✅ | ahpuch,ammit,bennu (32 / 45) |
| cx_panteao | monoPanteao | ✅ | ammit,babi,bennu (34 / 141) |
| cx_linha | livre (sem perder aliado) | ✅ | ahpuch,ammit,aquiles (32 / 17.310) |
| **cx_semmilagre** | livre (vencer SEM milagre) | ❌ | **nenhum** — nem os 3 mais baratos, nem os atacantes mais baratos (zeus/ogum/tyr, aquiles/ogum/perseu, houyi/perseu/ogum todos INDETERMINADOS a 200k) |

**5 de 6 vencíveis sob a v2.** O único bloqueio é `cx_semmilagre`: a restrição "vença sem lançar nenhum Milagre"
+ a defesa da v2 fecham a vitória a 200k, mesmo para times de atacantes. Não é dificuldade do inimigo isolada — é
a condição crafted do desafio contra a v2.

## Decisão

Pela regra do §322 (um modo só usa a v2 se TODO o conteúdo for vencível) e pela decisão do dono de **não nerfar
conteúdo autoral** (ETAPA C), **composição fica na v1** — não vale nerfar o inimigo de `cx_semmilagre` só para
virar o modo. Se no futuro o dono quiser composição na v2, o caminho é aplicar a régua de ajuste SÓ em
`cx_semmilagre` (os outros 5 já passam) — os times de referência acima são o contrato de verificação pronto.

## Reproduzir

```
node tools/ref_composicao.js            # gera + verifica (imprime a tabela acima)
node tests/composicao_ref.test.js       # guarda rápida: a geração cumpre a regra + é determinística
```

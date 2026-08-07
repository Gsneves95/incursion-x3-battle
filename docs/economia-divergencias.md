# Economia — divergências para decisão do dono

> **Insumo da reconciliação de economia** (antecede a Fase 3). Compara o que o código
> faz hoje com o que a planilha válida documenta, e recomenda. **Nada aqui foi
> alterado** — é material para o dono decidir. Depois da decisão, gera-se
> `data/economia.json` **a partir dela**, nunca o contrário.
>
> - **Implementado:** `src/invocacao.js` (constantes embutidas, ver `inventario.md §10b`).
> - **Documentado:** aba **"Aquisição — gacha sem poder"** de
>   `docs/INCURSION_Roster_e_Kits_ESTILO_NA.xlsx` (fonte válida pós-conversão NA).
> - **Não há** planilha pré-conversão no repo. Não há `data/economia.json`.

Princípio do documento (citado da aba): *"o gacha vende ACESSO e OPÇÕES, nunca
números. Nenhuma cópia, item ou moeda altera um único ponto de dano."*

---

## A. Números divergentes (existe nos dois lados, valores diferentes)

| Item | Implementado | Documentado | Recomendação | Quebra se MUDAR (p/ doc) | Quebra se FICAR (código) |
|---|---|---|---|---|---|
| Custo avulso | 150 gema | 150 gema | **manter** (igual) | — | — |
| Pacote ×10 | **1500** (10× cheio) | **1350** (desconto 10%) | seguir doc (1350) | nada técnico; testes não checam custo | jogador paga 150 a mais; contradiz o "desconto 10%" documentado |
| Taxa SS | **1,5%** | **3%** | seguir doc (3%) | dobra o SS observado; o pity 60 já pressupõe 3% | doc diz que taxa baixa "só gera frustração sem proteger balanceamento" (não há poder por raridade) |
| Taxa S | **8,5%** | **17%** | seguir doc (17%) | idem | idem |
| Taxa A | ~90% (resto) | **80%** | seguir doc (resto = 100−3−17) | — | fica inconsistente quando SS/S forem corrigidos |
| Pity duro (SS garantido) | **80** | **60** | seguir doc (60) | teto mais curto; f2p acessa counter antes | doc: "sem ele o f2p não acessa counters"; 80 é **convenção de gênero**, não decisão (o original era ~133) |

**Observação:** as taxas do código (1,5/8,5) são exatamente **metade** das documentadas —
padrão da planilha **original pré-conversão**. O pity 80 não vem de fonte nenhuma.

---

## B. Mecânicas IMPLEMENTADAS mas NÃO DOCUMENTADAS (decisão de design do dono)

Não são número errado — são **decisões tomadas por outra pessoa** no código, sem
constar de nenhum documento. Cada uma precisa ser **adotada, ajustada ou removida**.

| Mecânica | O que o código faz | Recomendação | Quebra se REMOVER | Quebra se FICAR sem decisão |
|---|---|---|---|---|
| **Pity suave** (a partir do 74º) | eleva a taxa de SS antes do teto | decidir; se o teto vira 60, o suave teria de começar antes (ex.: ~54) ou sair | curva de SS muda | mecânica invisível fora de spec, atrelada ao 74 (que assume pity 80) |
| **Garantia S em 10** (`p4>=10`) | força um S a cada 10 sem SS | decidir manter/remover | jogador perde piso de S | mecânica sem spec |
| **Banners: destaque / padrão / iniciante + rate-up** | 3 banners; destaque dobra chance dos "featured" | **decisão grande:** o sistema de banners/rate-up foi desenhado no código, não no doc (a aba não menciona banner nenhum) | perde a tela de invocação como está | uma feature inteira sem especificação |
| **50/50 (`gf`)** — garantia de destaque após perder o SP | próximo SS garantido featured | decidir: por banner ou global? persiste? visível? o que acontece entre banners? (ver `ESTADO.md`) | 50/50 some | mecânica não desenhada persiste como fato |
| **Nomenclatura `p5`/`p4`/`5★` + tier `B` (vazio)** | vocabulário da planilha original | **limpar no código:** renomear `p5`→pity de SS, remover `RANKN` de estrelas e o tier `B` | risco baixo (refactor puro) | vocabulário superado confunde manutenção e sugere raridade=força |

---

## C. DOCUMENTADO mas NÃO implementado (falta construir — Fase 3)

| Item | Documentado | Nota |
|---|---|---|
| Rotação gratuita | **8 deuses / semana**, para todos | reduz a barreira do novato e demonstra venda; não existe no código |
| Aluguel no ranqueado | **1 slot** por partida ranqueada | mata o argumento pay-to-win; não existe |
| Cópia repetida → **Essência de Louvor** (1 por cópia) | moeda de loja | modelo já previsto em `perfil.moedas.essencia`; loja é Fase 3 |
| **Fragmento dirigido** (40 = 1 deus à escolha) | pity dirigido | Fase 3 |
| Pular Provação | **3 Essências** | Fase 3 |

---

## D. Carteira inicial — bloqueia a F0.4c

| Item | Implementado | Documentado | Recomendação |
|---|---|---|---|
| Saldo inicial | **gemas 30000, pergaminhos 30** | **não documentado** (a aba lista custos, não grant inicial) | **decisão do dono:** qual o grant inicial real? (ex.: 0 + fontes, ou um grant de boas-vindas) |

**Por que bloqueia:** a F0.4c leva a carteira para `perfil.moedas`. Mas `novoPerfil()`
precisa de um saldo inicial. As duas saídas silenciosas são ruins: (a) **assar 30000
em `novoPerfil`** contamina o dado persistido com número de protótipo — exatamente o
que se evitou com o botão "Teste"; (b) **começar em 0** deixa o protótipo (e o
`invocacao.test`) sem gemas para invocar. É um **número de economia que não está em
`data/`** → pela regra nova do `CLAUDE.md`, PARO e peço. Some ao grant inicial: os
custos (150/1350) e a decisão de manter a carteira em gemas + pergaminhos ou só gemas.

---

## Ordem recomendada

1. **Você decide** as linhas de A, B e D (e o que de C entra quando).
2. Eu gero **`data/economia.json`** a partir da decisão (fonte única: custos, taxas,
   pity, banners, grant inicial).
3. **F0.4c** encana a carteira lendo `data/economia.json` — sem número inventado.
4. **F0.4b→V2**: pity por banner + `gf` conforme a decisão de B.

Isto inverte a ordem original (F0.4c antes da reconciliação): a F0.4c **depende** do
grant inicial (linha D), que é decisão de economia. Melhor decidir primeiro.

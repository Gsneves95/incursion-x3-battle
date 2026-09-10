# CAMPANHA — o ato de escolha

Terceiro tipo de ato, nascido de um achado de jogo: um amigo do dono jogou e
estranhou que atos de história não fossem jogáveis. São três em treze hoje, e
seriam uns trinta nos vinte e dois capítulos. O pior deles é o primeiro ato do
jogo, em que a única ação do jogador é ler e apertar continuar.

---

## O princípio

O ato de escolha não é minijogo enxertado. É **a competência central do jogo
aplicada fora do combate**: o INCURSION cobra ler o oponente, e as cenas de
conselho e de testemunha são exercícios de leitura que não estavam sendo
jogados.

**Tem resposta certa.** Se nada se perde, nada foi lido. A resposta certa vem
do livro, nunca de invenção da mecânica.

**A escolha muda a MECÂNICA, nunca a narrativa.** Ela decide quem você leva,
quantos orbes começa, o que você sabe do inimigo. A história segue linear. Se a
escolha ramificasse o texto, cada ato seguinte precisaria de duas versões, e
cento e trinta atos viraria trezentos.

**Errar custa, nunca bloqueia.** Nenhuma leitura errada pode tornar um ato
invencível. O custo é desvantagem medida, não parede.

**A consequência se revela quando acontece**, não na hora da escolha. O jogador
descobre que leu errado no ato em que o erro cobra — e é aí que a escolha vira
história em vez de virar nada.

---

## O esquema

`tipo: "escolha"`, e o ato carrega:

```
pergunta      a pergunta, curta
opcoes[]      { id, rotulo, deus, pista }   ← `pista` é a evidência que o
              texto do ato já deu; `deus` é a chave do retrato, quando houver
certa         o id da opção correta
efeito        { certa: {...}, errada: {...} }
alvo          o id do ato em que a consequência se aplica
revelacao     { certa, errada }  ← o texto mostrado no ato-alvo
```

**O vocabulário de consequência é fechado de propósito**, e usa só o que a
campanha já tem:

| efeito | o que muda | risco |
|---|---|---|
| `emprestado` | qual deus vem no slot emprestado do ato-alvo | nenhum |
| `orbes` | orbes iniciais no ato-alvo (`montar`) | medir |
| `kitRevelado` | o kit de um inimigo aparece antes da luta | nenhum |

**Fora do vocabulário, por decisão:** acrescentar ou remover inimigo. Isso muda
o balanço medido do ato-alvo, e balanço medido não se altera por escolha de
jogador sem remedição.

---

## Ato I do Prólogo — A Era dos Planos

Este não é leitura, é **identidade** — e é o único do tipo. Antes da fusão não há
quem ler: há planos separados, e o jogo pergunta de onde você vem. É o que
transforma a primeira ação do jogador de "apertar continuar" em "escolher".

**Pergunta:** *De qual plano a sua fé vem?*

Quatro opções, cada uma um dos mundos que o texto nomeia — Olimpo, Asgard, Duat,
Xibalba — com a arte do plano e uma linha do próprio ato.

**Não tem resposta certa**, porque não há nada a ler. Tem consequência:
`emprestado` no **ato VI do Prólogo**, A Encruzilhada — o único ato em que o time
é do jogador. O plano escolhido decide qual deus o jogo empresta ali.

**Revelação:** no ato VI, a linha diz de onde aquele deus veio. Seis atos depois
da escolha, e é a primeira vez que o jogador vê uma decisão sua voltar.

---

## Ato II do Capítulo 1 — O Conselho Temporário

O enigma central, e a cena já o continha.

**Pergunta:** *Quem, nesta mesa, não veio pelo que disse?*

| opção | pista, tirada do próprio texto |
|---|---|
| **Anúbis** | imóvel diante da balança, os olhos pousados nas ambições alheias |
| **Susanoo** | a espada zunindo de impaciência, ainda tonto com a fusão dos mundos |
| **Hécate** | ocupa três cadeiras ao mesmo tempo e sorri como quem já sabe o fim |
| **Ah Puch** | magro, silencioso, com intenções que nem Odin consegue ler |

**A certa é Ah Puch.** O livro cumpre: é ele quem escapa do mosteiro sem uma
palavra e vende o segredo do plano de restauração — não por servir a Zeus, mas
para lucrar.

E repare no desenho do engano: a **Hécate** é a suspeita óbvia porque é a
barulhenta. O **Anúbis** é o mais honesto da mesa — o próprio Odin diz que ele
toca o cerne. O silencioso é a resposta. É a mesma lição que o projeto aprendeu
doze vezes: ler o kit, não o rótulo.

**Consequência**, no ato VI do Capítulo 1 (O caminho do trovão, contra Hel e
Fenrir):

- **Certa** — você desconfiou, e o plano foi guardado. `kitRevelado`: você vê o
  kit de Hel antes de lutar.
- **Errada** — o segredo vazou. `orbes` menor no início do ato.

**Revelação**, no ato VI: *"Você desconfiou do silêncio, e o segredo ficou."* ou
*"Você olhou para quem ria. Ah Puch saiu do mosteiro sem uma palavra."*

---

## Ato V do Capítulo 1 — O que Nezha viu

A leitura mais limpa dos três, porque o jogador **acabou de viver a evidência**:
no ato IV ele mesmo foi o trovão que varreu o Duat.

**Pergunta:** *O que o trovão está caçando?*

| opção | |
|---|---|
| **Os Domínios** | a leitura óbvia — é o que a Profecia manda conquistar |
| **Rivais** | a certa |
| **Vingança** | a leitura emocional |

**A certa é rivais**, e o texto do próprio ato confirma logo depois: *"Zeus não
estava atrás dos Domínios. Estava caçando rivais."*

O acerto tem um valor especial aqui: o jogador chega à mesma conclusão que o
protagonista dos vinte e dois capítulos. A revelação diz isso — *"Nezha viu o
mesmo que você."*

**Consequência**, no ato VI do Capítulo 1:

- **Certa** — `emprestado`: o Nezha entra no seu time, porque ele partiu à
  procura de deuses mais racionais e encontrou você.
- **Errada** — o emprestado padrão. Sem penalidade extra: um ato já carrega a
  consequência do Conselho, e duas punições no mesmo ato empilham desvantagem
  sem medição.

---

## O que fica pendente de medição

O `orbes` menor do Conselho errado precisa ser medido: o ato VI tem 29,5% de
vitória com IA gulosa, e tirar orbe de um ato apertado pode cruzar a linha do
invencível. **Errar a leitura tem de custar, não bloquear** — se a medição
mostrar que cruza, a consequência errada troca por outra coisa.

E a trilha do rodapé passa a distinguir três tipos de nó, não dois: batalha,
história e escolha.

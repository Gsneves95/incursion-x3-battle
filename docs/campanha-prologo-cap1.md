# CAMPANHA — Prólogo e Capítulo 1

Primeiro entregável da campanha narrativa, tirado de **O Trono do Uno, Livro I**.
Treze atos: sete do Prólogo, seis do Capítulo 1.

---

## As regras que valem aqui

**O ato tem tipo.** `batalha` abre a luta; `historia` é arte, texto e Continuar,
sem luta. É isso que dá volume de conteúdo sem forçar briga em cena de conselho.

**3×3 do Capítulo 1 em diante.** O Prólogo mantém as formações que já tem — 3×1,
3×2 e 3×3 — porque estão medidas e algumas ensinam: o autômato solitário da
Sentinela de Bronze *é* a aula de recarga. A regra obrigatória de 3×3 vale do
Capítulo 1 em diante. A história se ajusta ao ensino, nunca o contrário.

**Slot travado e slot emprestado.** Os deuses que a cena nomeia vêm travados: são
a cena. Os slots que sobram vêm com um deus emprestado, e o jogador troca por
qualquer um que ele tenha. Nenhum ato pode ficar impossível de abrir com a
coleção vazia. O emprestado passa a constar na Coleção como conhecido e não
possuído.

**Recompensa só onde existe.** `batalha` paga a chave que já está em
`data/economia.json` (`encontro`: 120 gemas; `chefe`: 400 gemas + 40 essência),
e só na primeira vitória. `historia` não paga nada — se pagar, o jogador aprende
a pular o texto para coletar.

**Nenhuma batalha do Prólogo muda.** Mesmos aliados, mesmos inimigos, mesma seed,
mesmo balanço medido. Entra texto e arte, sai a lista.

---

## Esquema do dado (proposta)

Um arquivo por capítulo, para que capítulo novo seja arquivo novo e nunca código
novo:

```
data/campanha/00-prologo.json
data/campanha/01-queda-das-barreiras.json
data/campanha/indice.json      ← a ordem dos capítulos
```

Cada capítulo carrega `numero`, `nome`, `epigrafe`, `arte` (o fundo do capítulo,
usado pelos atos que não têm arte própria) e a lista de `atos`. Cada ato carrega
`id`, `numeral`, `nome`, `tipo`, `texto`, `arte`, e — quando `tipo: batalha` —
`aliados` (com `travado` e `emprestado`), `inimigos`, `montar`, `recompensa`, e o
`ensina` que já existe.

---

# PRÓLOGO — Antes da Unidade

> *"Antes da unidade, havia o multiverso da fé. Antes da fé, havia o Silêncio."*

## Ato I — A Era dos Planos · história

Antes da escrita, dos templos e dos cânticos, o multiverso da fé já existia:
cada povo que olhou o céu procurando sentido construiu um plano, tijolo por
tijolo, com reza e sacrifício. Olimpo, Asgard, Kailasa, Duat, Yomi, Xibalba —
incontáveis reinos coexistindo como estrelas, e nenhum deus cruzava o domínio do
outro. Era um mundo partido, e era estável.

**Arte:** um firmamento visto de fora, com seis ou sete mundos suspensos como
ilhas distantes, cada um com sua própria luz e clima. Nenhuma figura em primeiro
plano. Escala e distância.

## Ato II — A Incursão · batalha · **ensina: o custo da energia**

O Silêncio não veio de fora dos planos. Veio de dentro — de uma rachadura nas
orações, da dúvida sem resposta, da indiferença crescente dos mortais. Numa noite
sem lua as estrelas se apagaram, e o véu se rompeu como pano rasgado por dentro.
O trono de Odin chocou-se com o salão de Zeus, o Nilo transbordou sobre as
pirâmides de Xibalba. Não houve guerra nem diplomacia. Apenas a fusão.

**Batalha:** a de hoje, intacta (Zeus, Ogum, Tyr · Silfo Uivante, Ghoul Faminto).
**Arte:** o instante do rompimento — dois cenários incompatíveis colidindo no
mesmo quadro, o céu sem estrelas, arquitetura de dois mundos atravessando um ao
outro.

## Ato III — A Criação do Eixo · batalha · **ensina: a recarga**

No epicentro do colapso surgiu um plano que nenhum deus criou, forjado a partir
de todos: o Eixo Sagrado, ora templo, ora campo de batalha, feito de ruínas
flutuantes e altares sobrepostos. Ali a gravidade obedece à fé e a matéria
responde ao símbolo. No centro ergue-se o Trono do Uno, intacto e magnífico. E
quem se aproxima descobre, cedo ou tarde, que o Trono não se toma.

**Batalha:** a de hoje, intacta (Autômato de Bronze, sozinho).
**Arte:** o Eixo visto de dentro — ruínas de vários panteões flutuando em torno
de um assento vazio ao fundo, longe, pequeno e luminoso.

## Ato IV — A Profecia do Uno · batalha · **ensina: a Defesa**

Zeus foi o primeiro a avançar. Deu três passos e a realidade o quebrou: o chão
desapareceu e ele foi atirado ao limbo entre os planos. Odin tentou com rituais,
Rá com luz, Shiva permaneceu imóvel, Loki tentou pela dissimulação, e nenhum
avançou um único passo. Foi então que a mensagem se acendeu sobre o assento,
mudando de idioma conforme os olhos que a liam: *apenas um poderá sentar-se.
Aquele que chegar por conquista será rejeitado.*

**Batalha:** a de hoje, intacta (Quimera, Ghoul Faminto).
**Arte:** a profecia em luz flutuante sobre o Trono, e silhuetas de deuses ao
redor lendo — cada um de um panteão diferente, todos pequenos diante do texto.

## Ato V — O Início do Conflito · batalha · **ensina: a ordem de resolução**

A Profecia não uniu os deuses. Expôs. Cada um a leu com os próprios olhos, e
quase todos leram o mesmo desejo: tornar-se o único. Zeus declarou primeiro, e
raios caíram sobre o plano sagrado, rachando partes da realidade recém-formada.
Odin preferiu a estratégia — os corvos, as visões, os campeões. Rá recuou,
enfraquecido. Amaterasu ergueu uma cúpula de luz e se isolou. E Shiva apenas
observou, embora o chão tremesse a cada passo seu.

**Batalha:** a de hoje, intacta (Náiade da Correnteza, Servo de Cinzas, Ghoul).
**Arte:** o Eixo rachado por raios, alianças se formando e se rompendo ao fundo,
figuras de costas umas para as outras.

## Ato VI — A Ruptura entre Céu e Terra · batalha · **ensina: a escolha do time**

Com os deuses desequilibrados, as barreiras entre os mundos cederam. O Sinai
ardeu em fogo etéreo por sete dias; em Delfos, uma nova Pítia profetizou o fim
das fés e morreu com olhos de serpente. E nas rachaduras da realidade os ecos
adormecidos renasceram: Aquiles emergiu do Estige, Sun Wukong desceu das nuvens
do caos com um sorriso travesso, e Hércules recusou-se a servir cegamente,
lutando contra três campeões só para provar que os mortais também deveriam ter
voz. Os deuses já não podiam avançar sozinhos sem serem rejeitados. Passaram a
reunir quem lutasse por eles.

**Batalha:** a de hoje, intacta — e é o único ato em que o time é do jogador,
porque é isto que o trecho conta. Mantém `aliados: null`.
**Arte:** campeões mortais emergindo de rachaduras luminosas no chão do mundo
físico, com deuses observando de longe, no alto.

## Ato VII — O Ciclo dos Expulsos · batalha · **chefe**

Todos os que tentaram tocar o coração do Eixo foram lançados às bordas
fragmentadas do plano. O caminho de volta deixou de ser direto: tornou-se um
labirinto onde espaço, tempo e fé se entrelaçam, e atravessá-lo exige dominar os
Domínios do Uno — cada um alimentado pela fé de um povo, cada um uma chave viva.
Mas nenhuma borda se abre sem guardião. E o que espera neste portão não pesa
almas nem julga intenções. Apenas morde.

**Batalha:** a de hoje, intacta (Cérberus, chefe, com dois Servos de Cinzas).
**Arte:** um portão colossal na borda do Eixo, aberto para um labirinto de
fragmentos, e a silhueta de três cabeças contra a fenda.

---

# CAPÍTULO 1 — A Queda das Barreiras

> *"A dispersão não foi aleatória. Foi o início de uma nova prova: apenas quem
> soubesse se adaptar e influenciar seria digno de tentar alcançar o trono
> perdido."*

## Ato I — Fragmentos fora de lugar · batalha

No coração verde da Amazônia, dois deuses nórdicos abriram os olhos lado a lado:
Thor e Loki, ordem e caos, lançados juntos por um jogo que nenhum dos dois
entendia ainda. A floresta reconheceu a divindade deles sem saber a quem
pertencia, e os encantados vieram olhar de perto — o Curupira e a Iara entre
eles. Loki já enxergava a chance de remodelar seu papel. Thor empunhou o Mjölnir
como âncora da própria identidade. E o Curupira não pergunta o nome de quem pisa
no chão dele.

**Seu time:** Thor *(travado)* · Loki *(travado)* · um deus seu *(emprestado)*
**Inimigos:** Curupira · Iara · Guardião do Bosque

## Ato II — O Conselho Temporário · história

Odin despertou entre os escombros de um templo maia suspenso, distorcido pelas
forças do tempo, e sua visão entendeu depressa o que havia acontecido: onde a fé
é forte, o domínio floresce. Huginn e Muninn foram buscar quem restava, e num
mosteiro tibetano isolado entre nuvens vermelhas sentaram-se Anúbis, guiado por
presságios do Duat; Susanoo, ainda tentando entender a fusão do próprio mundo;
Hécate, que aparecia em vários pontos ao mesmo tempo e parecia gostar do caos; e
Ah Puch, silencioso, com intenções que ninguém ali conseguia ler. "O Trono não
desaparecerá por si só", disse Odin. "Será conquistado por quem dominar os
domínios." As palavras eram sábias. Em torno da mesa improvisada, mais de um par
de olhos brilhava com uma intenção diferente da que a boca declarava.

**Arte:** a mesa improvisada no mosteiro entre nuvens vermelhas, cinco figuras de
panteões incompatíveis sentadas à mesma luz de vela.

## Ato III — Alianças, conflitos e oportunidades · batalha

Amaterasu e Rá despertaram no mesmo céu, e nenhum dos dois sabia dividir a luz. O
embate rasgou parte do templo solar flutuante e deixou para trás uma zona
instável, onde o dia e a noite se alternam a cada minuto. Longe dali, Kukulkán
via a própria fé renascer entre os povos amazônicos, que o confundiram com um
espírito protetor da floresta — e disso nasceu um fluxo inesperado de adoração. A
fé, afinal, não exigia nomes exatos. Exigia apenas presença.

**Seu time:** Amaterasu *(travado)* · dois deuses seus *(emprestados)*
**Inimigos:** Rá · Bennu · Elemental de Chama

## Ato IV — O trovão sobre o Duat · batalha

Zeus despertou entre areias negras, pirâmides celestiais e barcas solares
cruzando o céu, e não procurou entender: para ele aquilo era ultraje. Khnum
tentou falar em nome da harmonia dos planos, e uma rajada de raios secou o leito
do Nilo por um instante. Bennu voou em círculos para barrar o avanço, e nem sua
renascença resistiu à negação do próprio ciclo. Bastet o enfrentou com agilidade
e luz solar, e mereceu um instante de respeito — apenas o suficiente para o
trovão rachar o chão e a fenda arrastá-la para longe, através do véu. Depois, no
Duat, caiu o silêncio. Nenhum deus egípcio ousou mais emergir.

**Seu time:** Zeus *(travado)* · Ares · Hades *(emprestados)*
**Inimigos:** Khnum · Bennu · Bastet

## Ato V — O que Nezha viu · história

Oculto entre as bordas das realidades que se entrelaçavam, um jovem deus assistiu
ao massacre inteiro sem ser visto. E, para sua vergonha, o que Nezha sentiu
primeiro não foi horror. Foi fascínio: havia algo terrível e magnífico na forma
como Zeus varria tudo à frente, sem hesitação, com a certeza absoluta de quem
nunca precisou pedir licença ao mundo. Por um instante o jovem imaginou-se assim.
Depois o instante passou, e a vergonha veio no lugar dele — junto com o
entendimento de que aquela fúria tinha um propósito frio. Zeus não estava atrás
dos Domínios. Estava caçando rivais. Nezha ergueu a lança flamejante e partiu em
silêncio, à procura de deuses mais racionais.

**Arte:** Nezha pequeno na borda do quadro, de perfil, vendo ao longe a
tempestade que devasta o Duat. A luz do desastre no rosto dele.

## Ato VI — O caminho do trovão · batalha

Zeus atravessou o véu com um rugido, esperando glória: templos dourados, o cantar
das musas, o respeito dos seus. Encontrou ruínas. Os pilares do Olimpo jaziam
partidos em chamas púrpuras, os jardins carbonizados, e entre os escombros dois
corpos conhecidos — Hermes com o cajado partido, Orfeu com as cordas da lira
cortadas como veias expostas. "Quem ousou?", bradou ele. Das sombras vieram Hel,
metade aurora e metade cadáver gélido, e Fenrir, com as presas ainda manchadas.
"Você chegou tarde, pai dos raios. Seu trono não está mais aqui."

**Seu time:** Zeus *(travado)* · Ares · Hades *(emprestados)*
**Inimigos:** Fenrir · Hel · Ceifador Errante

---

## O que este capítulo deixa pendente de propósito

O pacto entre Zeus, Hel e Fenrir se fecha no fim do ato VI e **não vira ato**: é o
gancho do Capítulo 2. A Hécate aparece no ato II e não está entre os 100 kits —
como o ato é de história, ela precisa de retrato, não de kit. E o Nezha, que é o
protagonista dos vinte e dois capítulos, aparece aqui só como testemunha. É o
desenho certo: o jogador conhece o vilão antes do herói.

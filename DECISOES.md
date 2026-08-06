# Registro de decisões

Cada entrada tem o que foi decidido, a alternativa recusada, e **por quê**.
`CLAUDE.md` lista os invariantes; este arquivo explica de onde vieram.
O valor daqui é evitar que uma decisão seja desfeita por parecer arbitrária.

---

## 1. O jogo é gacha, mas o PvP é normalizado

**Decidido:** invocação e Provações dão acesso a deuses. Nenhum sistema de
progressão entra no PvP. Vida 100 para todos, dano em número inteiro fixo.

**Recusado:** o modelo original — nível 1–70, estrela 3★–6★, relíquias com 6
slots, Link Divino com 40 slots, nível de habilidade 1→4.

**Por quê:** eram cinco eixos multiplicativos de poder. Um Zeus 6★ Lv70 com
relíquias contra um Zeus 4★ Lv40 não é partida, é execução. E o roster tinha
5★ com 1180 de vida contra 3★ com 850 — 40% de diferença bruta.

O que sustenta o gacha sem vender poder: **pick/ban gera pressão de coleção
real**. Com 6 deuses bons você fica sem plano B quando os seus são banidos.
Vende-se amplitude, não força. Mais cosméticos (10 mitologias) e o PvE, onde a
fantasia de poder é legítima porque o oponente é a CPU.

---

## 2. Cópias repetidas do gacha não sobem habilidade

**Decidido:** cópia vira moeda de loja (fragmento dirigido, pular Provação,
cosmético).

**Recusado:** cópias subindo o nível da habilidade, como no modelo original.

**Por quê:** dois motivos, e o segundo é o que importa. Primeiro, num jogo de 100
de vida, um Julgamento do Trovão de 25 contra um de 32 decide a partida. Segundo
e mais fundo: em Naruto-Arena **o valor exato de cada habilidade é conhecimento
público compartilhado**, e é isso que permite ler o oponente — "ele está com 22,
o Fenrir dele executa em 20, preciso curar 3". Se o número varia por conta, essa
camada inteira do jogo desaparece e sobra comparação de coleção.

---

## 3. Desbloqueio por Provação, nunca por ranking

**Decidido:** cada deus não-inicial tem uma Provação — um puzzle de estado fixo,
com o deus emprestado e time emprestado, sempre disponível a qualquer jogador.

**Recusado:** liberar missões conforme o rank do jogador (proposta inicial).

**Por quê:** rank mede vitória. Trancar ferramenta atrás de rank nega counters
justamente a quem está perdendo, e dá mais ferramentas a quem já ganha. O jogador
travado no Bronze não fica lá por falta de habilidade — fica por falta de
counters, e nunca sai, porque a porta de saída exige passar pela porta. É o mesmo
defeito do unlock original do Naruto-Arena com outra roupa.

A Provação resolve sem esse custo: não é farmável (puzzle resolvido é resolvido),
ensina o kit (quem desbloqueia Anúbis já sabe pilotar Anúbis), é difícil sem ser
competitivo (ninguém está te negando a vitória), e é barata de produzir (um puzzle
é um estado serializado). Portão de abertura é **capítulo de campanha**, que é
progresso de tempo, não de skill relativo.

Distribuição: 24 Ritos, 49 Provações, 18 Ordálias. 9 iniciais + 24 Ritos = 33
deuses (33%) alcançáveis só por habilidade. As Ordálias, com requisito de posse,
são o que mantém o gacha relevante — e ainda assim ninguém fica permanentemente
trancado fora de um counter.

---

## 4. Nove iniciais, um de cada panteão

**Decidido:** Zeus, Ogum, Tyr, Sobek, Brigid, Ganesha, Cuca, Fujin, Nezha.

**Por quê nove:** com 3 unidades por time, 9 dão 84 formações — o iniciante
experimenta de verdade. E são só 9% do roster, então invocar continua valendo.

**O critério que mais pesou não foi diversidade, foi ter toda resposta essencial:**

- **Ogum** — contra tanque (perfurante, destrói escudo, dano puro). Todo jogador
  novo trava na primeira parede de escudo; sem essa ferramenta ele conclui que o
  jogo é pay-to-win, e estaria certo.
- **Tyr e Ganesha** — contra prisão de controle. A experiência mais frustrante
  possível para quem tem menos opções.
- **Cuca e Fujin** — ensinam a lição central: privar recurso ganha mais que dano.
- **Nezha** — o único Híbrido. Sem ele o time inicial inteiro morre para controle
  e redução seletivos de classe.

Os 6 elementos estão cobertos, porque custo de habilidade é em energia do
elemento do deus — faltar um tipo tornaria parte do roster impagável.

---

## 5. Defesa universal com os números do Naruto-Arena

**Decidido:** toda unidade tem uma 5ª opção: 1 energia livre, recarga 4,
Invulnerável por 1 turno, gasta a ação.

**Por quê:** sem ela, unidade sem energia e com recarga travada só tem o Básico
fraco — não há decisão. Com ela, "não tenho jogada boa" vira "eu me protejo e
reconstruo economia". E cria o jogo mental sobre comprometer um Milagre num alvo
que pode ficar imune.

**Consequência que exigiu uma regra nova:** a rotação de Defesa (uma unidade
protegida por turno, sempre) anularia a ofensiva do jogo. Daí a decisão de que
**dano contínuo já aplicado atravessa Invulnerabilidade**. Isso dá duas respostas
em vez de uma — espalhar dano ou envenenar antes — e transforma Kagutsuchi,
Jörmungandr, Medusa, Piranha e Ah Puch de variações temáticas em nicho estrutural.

**Custo aceito:** os 8 especialistas em Inalvejável (Loki, Saci, Boto, Kitsune,
Yamato, Kukulkán, Tanuki, Wukong) perderam a exclusividade do eixo defensivo.
Aposta: o valor deles sempre foi o **rider** — Loki redireciona, Saci rouba buff,
Yamato converte o próximo golpe em dano puro. Se o playtest mostrar que ficaram
sem graça, a correção é dar duração 2 ao Inalvejável deles, não mexer na Defesa.

---

## 6. Conversão de energia a 3→1

**Decidido:** 3 quaisquer → 1 do tipo escolhido, uma vez por turno, sem gastar a
ação, pagando sempre exatamente 3.

**Recusado:** não ter conversão, e a taxa 2→1.

**Por quê:** sem conversão, o time mono-elemento é o mais forte do jogo (sorteio
previsível = combo confiável) e o time arco-íris vira armadilha. Isso mataria a
razão de colecionar deuses de elementos variados — o oposto do que um gacha
precisa. A 2→1 o custo é tão baixo que o elemento quase deixa de importar e a
identidade de composição desaparece. A 3→1 é caro o bastante para ser saída de
emergência, não engrenagem.

**Bug achado aqui:** se todos os seus orbes fossem do tipo escolhido, a rotina não
achava de onde tirar os 3 e creditava 1 de graça — energia infinita, todo turno.
A trava atual calcula o plano, confere que soma 3, e só então credita.

---

## 7. Seis elementos, mas um time gera no máximo três

**Decidido:** a interface mostra só os tipos alcançáveis pelo time.

**Por quê:** o sorteio só considera os elementos das unidades vivas, e as
habilidades custam o elemento do próprio deus ou energia livre — guardar tipo
alheio nunca serve. Três dos seis contadores ficariam em zero para sempre.
Isso não empobrece o jogo: **escolher quais 3 elementos levar É a decisão de
composição.**

---

## 8. Classe pertence à habilidade, não ao deus

**Decidido:** Físico, Mágico, Mental (controle), Aflição (DoT), por habilidade.

**Por quê:** era o modelo do Naruto-Arena e a diferença é grande. Com classe por
deus, o Julgamento do Trovão travava *tudo* que o alvo tinha de Mágico —
grosseiro. Com classe por habilidade, "trava as Mágicas dele" acerta parte do kit.

O resultado mais bonito: **Nezha tem Físico, Mental/Aflição e Mágico, então
nenhum silêncio de classe cala o kit dele** — que é exatamente a razão de ele ser
o Híbrido dos iniciais, e antes isso não funcionava de verdade. O Arsenal Celeste
dele troca de classe com o modo: Anel é Mental, Manto é Aflição.

---

## 9. Interface: três formas carregam três categorias

**Decidido:** retângulo = quem (retrato de deus) · círculo = o que faz
(habilidade) · quadrado arredondado = estado (efeito).

**Por quê:** uma linguagem de três formas é mais legível que tudo redondo. E
resolveu de tabela um problema real: o **anel do disco** virou o elemento
(identidade constante), o **brilho do disco** virou disponibilidade (muda a cada
turno), o **halo dourado** virou "armada" (momentâneo). Três canais que não
colidem, contra a bagunça anterior onde borda dourada dizia "disponível" e uma
barra na base dizia "elemento".

**Detalhe importante:** o botão de habilidade continua **quadrado** (76px); só o
disco interno é recortado. Um círculo inscrito perde 21% da área — se o botão
fosse recortado, o alvo de toque encolheria junto.

---

## 10. Redução de ruído: menos elementos, não elementos menores

**Decidido:** o inventário da tela caiu de ~80 objetos para ~34.

**Por quê:** a primeira tentativa foi criar hierarquia de três níveis, e não
resolveu — **hierarquia organiza o ruído, não o elimina**. O que funcionou foi
cortar:

- Nome da habilidade no ladrilho (24 blocos de texto em 8px) → monograma de 3
  letras. Reconhecimento em vez de leitura, e espaço reservado para a arte.
- Coluna de efeitos por banda (6 colunas) → faixa dentro do próprio retrato.
- "3 DE PÉ · N ENERGIA" no topo, o Σ do total, "/100" em cada barra de vida →
  removidos, todos duplicavam o que a tela já mostrava.
- Três sinais para "já agiu" (anel, barra, escurecimento) → um.
- Fileira de habilidades inimigas (412px por banda) → aba retrátil de 16px.

**A lição:** o ladrilho não precisa se explicar. Em Naruto-Arena ninguém lia os
ícones — aprendia por arte e posição. Quem explica é o painel de baixo.

---

## 11. Habilidades do inimigo em aba retrátil

**Decidido:** alça de 16px ao lado do retrato inimigo; abre uma por vez, em
posição absoluta (sem deslocar o layout), fecha ao virar o turno. Ponto verde na
alça avisa que a Defesa dele está em recarga.

**Recusado:** exibir a fileira sempre (ocupava 412px por banda), e remover de vez.

**Por quê manter:** o dado decide jogadas. Inimigo com 22 de vida, seu Fenrir
executa em 20, você tem uma ação: se a Defesa dele estiver pronta, gastar o
Milagre é jogar fora; se estiver em recarga, é abate garantido. **Mesma jogada,
dois resultados opostos.** Sem essa informação o jogador conta turnos de cabeça —
isso não é dificuldade, é contabilidade, e faz parecer que se perdeu por sorte.

**Por quê retrátil:** informação consultada ocasionalmente não deve ficar exposta
permanentemente. Progressive disclosure.

---

## 12. Botões: placa inscrita, não pílula com gradiente

**Decidido:** sistema de 4 níveis (primário, secundário, silencioso, perigo),
3 tamanhos, raio único de 3px, pressionado = a placa recua.

**Recusado:** o que existia — `linear-gradient` de dois tons em tudo, seis raios
diferentes na tela, e nenhuma hierarquia (RENDER-SE com o mesmo peso de ENCERRAR
TURNO).

**Por quê:** ouro preenchido existe **uma vez por tela**. Quando tudo é dourado,
dourado não significa nada. E render-se saiu para um menu `⋯` porque **ação
destrutiva e rara não deve ter rótulo competindo por atenção** — antes ela estava
numa caixa flutuante sobrepondo a barra de energia.

Abandonado também o CAIXA ALTA em todo botão: era o que fazia a tela gritar.

---

## 13. Correções de kit que só apareceram ao implementar

Seis contradições nos 400 efeitos escritos, achadas ao codar os primeiros 11:

| Kit | Problema | Correção |
|---|---|---|
| Nezha — Rodas de Vento e Fogo | "+10 se Nezha já agiu neste turno" — impossível, unidade age uma vez | "+10 se **outro aliado** já agiu" |
| Fujin — Companheiro de Raijin | passiva só funciona com Raijin, que não é inicial: um dos 9 tem passiva morta | mantida e marcada; **decisão pendente do dono** |
| Cuca — O Papão | 45 contra adormecido somava com o +8 do sono = 53, acima do teto de 40 | 38, fechando em 46 |
| Ganesha — Abrir Caminho | planilha dizia "todos os buffs de 1 inimigo", motor fazia "todos de todos" | "1 buff de cada inimigo" |
| Cuca — passiva | "Básico de graça a cada 3 turnos": substitui a ação ou é extra? | não custa energia; **não** é ação extra |
| Brigid — Ferreira Divina | "+5 se algum inimigo com Queimadura" — inimigo ou aliado? | qualquer unidade no campo |

Extrapolando, os 89 deuses restantes devem esconder umas 30 ambiguidades
parecidas. **É por isso que o motor vem antes do conteúdo.**

---

## 14. Bugs de motor achados pelos testes, não por inspeção

- **Exploit de energia infinita** na conversão (ver decisão 6).
- **Assimetria entre jogadores:** a passiva de estreia do Ganesha ("+2 energias no
  turno 1") disparava por turno *global*, não por lado. Como o turno só incrementa
  ao voltar ao Jogador 1, o **Jogador 2 nunca recebia**.
- **Cronômetro pausava** com qualquer sobreposição aberta — bastava abrir o
  registro para pensar sem limite.
- **`disabled` perdido** no botão de habilidade numa refatoração: habilidade
  impagável continuava com aparência de tocável.

Nenhum apareceria numa revisão visual. Todos apareceram em partida automatizada.

---

## Decisões ainda ABERTAS

| Assunto | Situação |
|---|---|
| **Vida 100 ou 120** | Jogo automatizado fecha em 8–18 turnos, o que sugere dano alto para o tamanho da vida. Precisa de 10 partidas com atenção humana. **Decidir antes de escrever os 89 kits restantes**, porque o orçamento de dano depende disso. |
| **Nome dos elementos** | O design visual do dono usa Solar/Lunar/Vital/Caos/Vazio/Tempestade; a planilha usa Tempestade/Umbra/Maré/Aurora/Chama/Verdejante. Renomear é trivial no dado mas quebra ganchos: Maré aplica Encharcado, Chama aplica Queimadura, Aurora e Umbra ativam Dia e Noite. ~60 habilidades a retraduzir. |
| **Pick/ban** | Recomendado com força, ainda não desenhado. Sem ele o meta converge para 8 deuses e o gacha perde razão de existir. |
| **Passiva do Fujin** | Ou Raijin entra nos iniciais, ou Fujin ganha passiva autônoma. |
| **Dilúvio do Sobek** | 30 em área contra Encharcados, contra teto de 22. Condicional e o próprio Sobek precisa aplicar antes — único número acima do orçamento. |

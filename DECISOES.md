# Registro de decisões

Cada entrada tem o que foi decidido, a alternativa recusada, e **por quê**.
`CLAUDE.md` lista os invariantes; este arquivo explica de onde vieram.
O valor daqui é evitar que uma decisão seja desfeita por parecer arbitrária.

---

## 1. O jogo é gacha, mas o PvP é normalizado

**Decidido:** invocação e Provações dão acesso a deuses. Nenhum sistema de
progressão entra no PvP. Vida 120 para todos, dano em número inteiro fixo.

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

## 15. Vida base 120, não 100

**Decidido:** toda unidade tem 120 de vida. Nenhum número de dano dos 11 kits já
escritos mudou; só o denominador.

**Recusado:** manter 100.

**Por quê:** o jogo aleatório fecha em ~13–15 turnos, mas jogo com atenção
concentra dano e fecha mais rápido, e o valor inteiro do design está no meio-jogo
(ler o oponente, contar a recarga da Defesa dele, escolher entre curar e pressionar).
120 devolve um ou dois turnos desse espaço sem tocar num único valor de dano.
A assimetria decidiu: subir a vida é uma linha; cortar 400 números de dano depois
é uma semana — quando a opção barata e a que serve ao design coincidem, é ela.
A "leitura" de valores exatos continua intacta: 120 muda o denominador, não a
transparência. Custo aceito: o orçamento de dano dos 89 kits restantes é calibrado
para 120, então cada Milagre de execução mira ~1/3 da vida, não ~2/5.

---

## 16. Oponente CPU: busca gulosa de 1 lance

**Decidido:** o Jogador 2 pode ser controlado por uma IA (`src/ia.js`), ligada por
padrão na seleção (alterna em "Oponente"). A IA clona o estado, aplica cada ação
candidata **pelo próprio motor**, pontua a posição resultante (vida aliada − vida
inimiga, com bônus por abate, controle e veneno) e escolhe o melhor ganho positivo;
se nada melhora, encerra o turno.

**Recusado (por ora):** busca em profundidade real (2–3 turnos à frente), que é o
item 10 do ROTEIRO. A versão gulosa é o passo intermediário.

**Por quê:** o dono precisava testar "um cenário mais realista de batalha" sem um
segundo humano. A busca de 1 lance é barata, determinística (clona e usa `agir`, sem
tocar no motor) e já joga o suficiente para exercitar combos e economia de energia.
A profundidade e os níveis de dificuldade (item 11) ficam para quando os 100 deuses
existirem e o balanceamento pedir. **Isto NÃO cria RNG no combate** (invariante 2): o
único aleatório continua sendo o sorteio de energia, semeado por `st.seed`; a IA é
puramente determinística sobre o estado.

---

## 17. Batalha não entra na pilha de histórico

**Decidido:** ao entrar na batalha, o roteador **substitui** o topo da pilha em vez
de empilhar (`ir('batalha',{},{substituir:true})`). Assim a batalha fica sozinha na
pilha e `voltar()` devolve `false` — não há como voltar. A saída da batalha acontece
só por **rendição** ou **fim de partida** (o botão "Nova batalha" leva à seleção,
também por substituição).

**Recusado:** empilhar a batalha como uma tela qualquer.

**Por quê:** se a batalha fosse item de histórico, um `voltar()` (gesto de sistema,
botão de voltar do Android, etc.) **abandonaria a partida em andamento sem aviso** —
perda de progresso silenciosa, o pior tipo. A partida é um compromisso; sair dela é
uma decisão explícita (render-se), não um efeito colateral de navegação. O ciclo de
vida da tela cuida do resto: `aoEntrar` inicia o relógio, `aoSair` o para e limpa a
sobreposição, num lugar só (`src/rotas.js` + ganchos em `src/view.js`).

---

## 18. Persistência: uma chave por dono, escrita que fala, leitura que valida a forma

**Decidido (F0.4):** o perfil do jogador é função pura (recebe perfil, devolve perfil
novo), e a persistência é camada separada (`armazenamento.js`) com três escolhas:

- **Uma chave por DONO, não por aplicação.** Perfil em `incursion:perfil`, histórico
  em `incursion:historico`. **Recusado:** um blob só. O histórico cresce (200 entradas)
  e seria reescrito a cada `salvar()`, inclusive em ação frequente; e se corromper,
  levaria o perfil junto. Separados, o histórico pode sumir sem arranhar o estado.
- **`salvar()` devolve `{ok,erro}`, nunca silencioso.** **Recusado:** engolir o erro.
  `localStorage` estoura cota e a aba privada do iOS lança direto; perder progresso
  sem aviso é o pior desfecho. A falha vira aviso visível. (Já no boot, ausência de
  storage NÃO alarma — é começo normal; o alarme é na gravação, que é o que importa.)
- **`carregar()` valida a FORMA, não só `JSON.parse`.** **Recusado:** confiar no parse.
  Dado corrompido em geral é JSON válido com formato errado (deuses como array, moeda
  negativa, time com 4 deuses, chave fora do roster). `problemaDeForma()` derruba para
  `novoPerfil()` registrando o quê. E `migrar()` é chamada no caminho normal mesmo sem
  trabalho — migração só exercitada quando precisa é migração nunca testada.

A migração v0→v1 é andaime por ora (não há dado legado — nada persistia antes), mas a
estrutura existe para a v2 não nascer sem caminho.

---

## 19. Invocação: sorteio puro por semente, pity no perfil, commit antes de revelar

**Decidido (F0.4b):**

- **Sorteio é função pura com semente** (`INV.sortearLote(seed, banner, pity, n)`,
  RNG `mulberry32`). Não olha perfil, não grava, não desenha. O simulador de economia
  da Fase 3 chama só ela, milhares de vezes. Aplicar o resultado ao perfil é outra
  função, e mora em `perfil.js` (`registrarInvocacao`) — quem MUTA o perfil vive lá,
  onde os invariantes são impostos e testados; `invocacao.js` compõe.
- **Commit antes de revelar:** a ordem é sortear → aplicar → **salvar → revelar**.
  **Recusado:** salvar ao fim da animação. Se o app morrer durante a revelação dos 10,
  o jogador pagou e não recebeu. Recompensa se commita antes de aparecer, nunca depois.
  Regra geral, não só do gacha.
- **Histórico guarda a semente e o pity de entrada.** Qualquer invocação é reproduzível
  exatamente — vale quando alguém disser que "o jogo roubou", e vira obrigatório na
  Fase 5 (sorteio no servidor, auditável).

**Mudança de comportamento OBSERVÁVEL:** o pity de SS agora **sobrevive ao recarregar**
(antes vivia só em RAM). Um jogador com 59 invocações mantém as 59. É desejável, e está
registrado aqui por ser observável. **Interim:** o modelo guarda um contador único
(`desdeUltimoSS`); pity por-banner independente e a persistência do 50/50 (`gf`) ficam
para a reconciliação de economia (DECISOES pendente + `docs/inventario.md §10`).

---

## 20. Economia reconciliada: taxas/pity documentados, banner destaca DEUS, sem 50/50

**Decidido (reconciliação de economia; fonte única `data/economia.json`):**

- **Taxas e pity vêm do documentado**, não da planilha superada: SS **3%**, S **17%**,
  A **80%**; pity **60, DURO** (sem soft pity, sem escada). Custo avulso **150**,
  pacote de 10 por **1350** (desconto de 10%). O código estava com metade das taxas
  (valores pré-conversão), pity 74/80 (convenção de gênero) e pacote 1500 (sem
  desconto — terceira herança da fonte errada). Ordem **A/S/SS** em todo lugar; o
  vocabulário `5★/4★` e o tier `B` (vazio, sem função) saem do código e dos dados.

- **Grant inicial: 1500 Gema** (= um pacote de 10; o novato faz uma invocação completa
  no primeiro minuto). Os 30000 de protótipo viram **constante de teste que nunca toca
  o perfil**, mesmo padrão do botão "Teste".

- **Banners com rate-up: mantidos**, com uma **restrição dura**: o rate-up destaca um
  **DEUS específico**, nunca uma ordem inteira. Banner que aumenta a taxa de SS **como
  categoria** é aumento de poder por compra e **contradiz o invariante 3** (sem
  progressão/poder comprável). A taxa de SS continua 3% em todo banner; o que muda no
  destaque é *qual* SS sai (o destacado), não *quanto* SS sai.

- **50/50: REMOVIDO.** O 50/50 (garantir o destacado só na segunda vez, após "perder"
  a primeira) existe para esticar o pity sem parecer que estica — o jogador bate a
  garantia e ainda pode não receber o que queria. Num jogo cuja tese é "repetido vira
  acesso, e a loja vende o deus específico", essa fricção é **redundante e contradiz a
  promessa**. A garantia fica simples: pity 60 dá o SS; em destaque, dá o destacado.
  Sem moeda escondida, sem estado invisível. **Consequência boa:** a migração V2 do
  perfil encolhe — some `garantiaFeat`, e a forma vira só pity por banner.

**Pergaminhos (bilhete de invocação avulso): REMOVIDOS** — número/mecânica fora de
`data/` e sem decisão (regra do CLAUDE.md). **Nota para não voltar errado:** a economia
PREVÊ um item de invocação comprável com Essência, mas na forma **pacote de 10 por mês**,
não bilhete pingado. O pergaminho era a mesma ideia na forma descartada (bilhete avulso
confunde certeza com chance e é ruim de sentir). Volta na Fase 3 **na forma de pacote
mensal**, não como reversão desta remoção.

**Recusado:** manter os números do código (fonte superada) e o 50/50 (convenção de
gênero adotada sem decisão). Também recusado o **soft pity** e a **garantia de S a cada
10** (`p4`): garantia que o jogador não vê é moeda invisível — ele acha que teve sorte
quando acionou regra escondida. Pity 60 duro é a única garantia, e ela é anunciada. **Documentado mas ainda não implementado** (pendência,
não fazer agora): rotação gratuita 8 deuses/semana (Fase 3) e aluguel no ranqueado
(Fase 5, depende de pick/ban).

---

## 21. Geração de energia: sorte no sorteio, ponderada (não uniforme)

**Problema.** A energia vinha só dos elementos do time (`iniciarTurno`, geração antiga).
Isso garante ao time mono-elemento sempre ter o que precisa e o torna composição
dominante. Queríamos sorte: cor estrangeira precisa poder cair. Mas o uniforme puro
(entre os 6) é forte demais — corta pela metade também o time variado e deixa o jogo 2×
mais lento.

**O dado que decidiu o peso (item 6, derivado dos 100 kits em `data/kits.json`):**

| slot | kits com parte "livre" | recarga |
|---|---|---|
| básico | **0** / 100 | — |
| habilidade | **1** / 100 | — |
| milagre | **100** / 100 (74×1, 26×2 pips) | cd 4 |
| defesa (universal) | todos (1 pip) | cd 4 |

Ou seja: energia estrangeira **quase nunca é gasta direto** (só Milagre e Defesa aceitam
livre, ambos cd 4). Ela é, na prática, **matéria-prima de conversão 3→1** — e a conversão
é **1 por turno**. Esse teto muda a conta:

| pesoTime | variado (aproveitável/turno) | mono |
|---|---|---|
| 0,60 | 2,4 | 2,0 → mono −23%, variado −20% |
| **0,75** | **2,7** | **2,3 → mono −23%, variado −10%** |
| 0,85 | 2,8 | 2,5 |

**Decisão: `modo "ponderado"`, `pesoTime 0.75 / pesoLivre 0.25`** (em `data/economia.json`,
bloco `energia`). Corrige o mono na mesma medida que o 0,60, mas desacelera o time variado
pela metade. **`pesoTime` é PROVISÓRIO** — o dono ajusta jogando. Não uniforme porque o
uniforme cobra o preço do mono também do time variado, sem necessidade.

**Fórmula.** Por energia: com prob `pesoTime` sorteia entre os elementos do time; com
`pesoLivre`, entre os 6. P(elemento do time) = `pesoTime + pesoLivre·(k/6)`, k = elementos
distintos do time.

**Contrato de compatibilidade (NÃO é balanceamento).** Sem `st.energia` (ou `modo "time"`),
o motor usa time/1.0 — comportar-se como antes. Isso preserva as suítes existentes sem
edição. Quem ajusta o balanceamento é o `economia.json`, nunca esse fallback.

**Ponto fino do RNG — NÃO MEXER sem ler isto.** O modo `time` consome **exatamente 1
sorteio do `rng` por energia**; o `ponderado`, **2** (decidir o conjunto + escolher dentro).
É por isso que o modo `time` reproduz o fluxo histórico e as suítes de motor passam com
semente fixa. Mudar a contagem de sorteios do modo `time` quebra 4 suítes sem relação
aparente. Travado em `tests/energia.test.js` (teste 7).

**Medições (500 partidas IA×IA por célula, semente fixa — `tests/energia.test.js`):**
duração time/1.0 → ponderado sobe **+1,8%** (variado) e **+4,9%** (mono), muito abaixo do
teto de 20%. Energia estrangeira parada em média **1,25** (variado) / **1,78** (mono) —
abaixo de 4, então a conversão 1/turno dá vazão suficiente **por ora**. Se um ajuste futuro
de peso passar disso, reabrir a vazão da conversão (subir para 2/turno, ou 4→2 num gesto) —
decisão do dono. A fome por falta de energia até CAIU com a ponderação (12,7 → 9,39 no mono).

**Leitura ao contrário (importante para futuros ajustes).** A fome caiu porque a estrangeira
ACUMULA e vira conversão — isto é, a ponderação deu ao mono uma flexibilidade nova (converter
o excedente na cor que falta), não só cortou o excesso de cor nativa. Consequência: **o efeito
corretivo sobre o mono é MENOR do que a tabela de "aproveitável/turno" sugere** — a tabela
conta só a energia direta, não o resgate por conversão. Se, jogando, o mono ainda parecer
forte, o caminho é **ajustar `pesoTime` para ~0,65** (baixar de 0,75 → menos cor nativa
garantida ao mono) **ou reduzir a vazão da conversão** (ela é o que salva o mono), **não mexer
em kit**.

---

## 22. Piso de LEGIBILIDADE em pixels físicos, não piso de escala

O primeiro teste de enquadramento cravava um piso de **escala** (0,80) — a proporção do
palco em celular. Estava errado, e o erro era do dono: **legibilidade não é função da escala,
é do TAMANHO FINAL do texto em pixels FÍSICOS**. Escala 0,729 num aparelho DPR 3 rende texto
MAIOR que escala 0,90 num DPR 1. Especificar a proporção quando o que importa é o resultado
media a coisa errada — e o piso de 0,80 era **fisicamente impossível** em altura útil < 342px
(o aparelho do dono na janela, 726×312), forçando a exceção "reportado, não cravado".

**A regra agora:** `menorTextoDesign × escala × DPR ≥ 11px físicos`, com a matriz cobrindo
**DPR 2 e 3** (o real dos aparelhos de hoje, não só 1). O menor texto do jogo no palco era
**7,5px** de design (`.skill__cost.gratis span`, `.pk__wip`) — subido para **8px**, igualando
o `.foepanel__lbl` que já era o menor. A correção foi **subir o texto no design, não afrouxar
o teste**. Números reais (Chromium, escala medida no render):

| viewport | escala | DPR 2 | DPR 3 |
|---|---|---|---|
| 726×312 (janela do dono — PIOR caso) | 0,729 | **11,7px** | 17,5px |
| 667×375 (iPhone SE) | 0,855 | 13,7px | 20,5px |
| 926×428 | 1,000 | 16,0px | 24,0px |
| 1180×820 (tablet) | 1,250 | 20,0px | 30,0px |

O piso de 11 passa em toda a matriz, com folga de 0,7px no pior caso (726×312 @ DPR2). Antes
do ajuste, esse caso dava 10,9px — 0,1px abaixo; foi o número trazido em vez de relaxar.
Spec pura em `tests/enquadramento.test.js` (números à mão), verificação no render real em
`tests/moldura.test.js` (contexto por DPR, escala medida × DPR).

**Consequência útil (reforça a prioridade do PWA):** naquele mesmo aparelho, sair da janela
para TELA CHEIA leva a escala de **0,729 → 0,841** (altura útil 312 → 360). Ou seja, o modo
instalado não é preferência estética — é onde o jogo fica confortável. O PWA é requisito de
legibilidade, não enfeite.

---

## 23. Carteira real: grant é evento de criação, débito antes de revelar (F0.4c)

**BUG ENCONTRADO (estava no ar):** a carteira era FANTASMA. A tela de invocação rodava
sobre um `S.gemas` local semeado do `grantTeste` (30.000) no load, nunca do perfil. O
custo da invocação (`S.gemas -= cost`) mexia só nesse fantasma; o commit-antes-de-revelar
persistia deuses/pity/histórico mas **nunca debitava gema do perfil**. Ou seja: **invocar
era de graça** — o gasto era ficção. Corrigido nesta fase.

**Grant inicial (1500) é EVENTO DE CRIAÇÃO, não default de leitura.** Nasce em
`novoPerfil()` (o valor vem por PARÂMETRO, da borda que vê `data/economia.json →
grantInicial.gema`; a função pura não lê global) e vira **entrada de histórico** como
qualquer transação. A leitura NUNCA completa saldo faltante.

**"Zero é legítimo" resolvido por PRESENÇA DE VERSÃO, não `gema || 1500`.** Um jogador que
gastou tudo tem gema 0 e não pode ganhar 1500 a cada carregamento. A distinção é a versão:
`v<2` = perfil anterior ao grant (a carteira era fantasma, nunca recebeu) → a **migração**
credita 1500 UMA vez e sobe para v2; `v2` com gema 0 = gastou tudo → recebe nada. O getter
é `perfil.moedas.gema` puro, sem fallback. `migrar()` é idempotente pela versão (rodar de
novo num v2 não credita). É o primeiro trabalho REAL da migração, que nasceu andaime.

**Débito real na invocação:** saldo insuficiente **bloqueia ANTES de qualquer mudança de
estado** — sem sorteio, sem consumir pity, sem gravar (falha de pagamento não avança estado
nenhum, o invariante mais cravado). O débito acontece no **mesmo commit que persiste, ANTES
de revelar** (paga antes de ver, espelho da regra da recompensa). Custo entra no histórico
da invocação.

**Crédito de teste (grantTeste 30.000) — o botão "+ DEV".** A nota do dado ("nunca entra no
perfil real") existe pelo mesmo motivo do botão TESTE da seleção: afordância de protótipo
não pode contaminar dado persistido sem que se saiba. Como a carteira real tira a única
forma de exercitar invocação sem grindar, o crédito DEV **credita o perfil DE VERDADE mas o
MARCA como contaminado**: campo `perfil.dev = { creditosTeste, primeiroEm }`, entrada de
histórico com tipo próprio `dev-credito` (nunca confundível com transação de jogo), e um
indicador `⚠ DEV` visível na tela enquanto a marca existir. Assim nenhum perfil de jogador
de verdade recebe 30.000 sem que se saiba — a nota do dado é honrada no que importa. **O
botão e a marca saem antes do release** (dívida no ESTADO).

**Recriação por corrupção recebe 1500** (é `novoPerfil()`, grant é criação — quem perdeu
tudo por corrupção não pode ficar sem poder jogar), mas o histórico distingue: entrada
`tipo:'recriacao'` com a **causa** da corrupção junto, para responder depois "por que esse
jogador tem 1500 do nada".

Testes que travam tudo isso em `tests/perfil.test.js` (migração idempotente, zero-legítimo,
recriação com causa, dev marca+valida, `iniciar()` credita/persiste/loga uma vez) e
`tests/invocacao.test.js` (x10 debita o perfil de verdade; insuficiente bloqueia sem
consumir pity nem gravar; DEV credita+marca+indicador+loga). **13 suítes verdes.**

---

## 24. Motor: dados fora, regras dentro; catálogo CONGELADO por partida (F1.0a)

**Separação dados/regras.** Os kits dos deuses saíram de `engine.js` (literal `GODS` de ~180
linhas) para **um arquivo por deus** em `data/deuses/<key>.json` — facilita revisar,
versionar e ver diff de balanceamento, e o motor para de crescer quando os 73 kits entrarem
(eram dados, não lógica). `src/catalogo.js` monta o `GODS` a partir desses arquivos (Node lê
via `fs`; browser recebe o array injetado pelo build) e é o ÚNICO que declara `GODS` — a UI
lê esse global; o motor não possui dado de deus nenhum.

**Schema validado na BUILD, vocabulário derivado do MOTOR.** `tools/valida_kit.js` lê
`E.VOCAB` (classes, tipos de `fx.t`, tipos de `eff.type`, alvos, chaves de custo e de efeito)
do próprio `engine.js` — o schema não pode divergir do que o motor executa. A build falha
alto em campo desconhecido, custo mal formado, classe/alvo inválidos, `fx.t` ou `eff.type`
que o motor não sabe executar. Prova pelos dois lados: os 11 kits reais passam sem exceção; um
kit corrompido lista os 8 erros e sai com código 1. Reforço em runtime: `aplicarFx` **RECUSA**
(lança) um `fx.t` fora de `TIPOS_FX` — efeito com typo não passa em silêncio, que é como se
escreveria 73 kits com um erro sem descobrir. A **Defesa** (regra universal, fica no motor)
é validada pelo mesmo schema: tem formato de habilidade e não pode ficar para trás.

**Catálogo CONGELADO por partida (não assado no estado) — mudança da decisão de mecanismo,
não do objetivo.** A intenção era o estado carregar o kit para o **seed determinar a partida
inteira**: rebalancear um kit no meio da Fase 1 não pode alterar uma partida em andamento nem
tornar a **arena não-reproduzível**. Assar o kit em cada unidade entregava isso, MAS a IA
clona o estado por `JSON.stringify` a cada nó da busca e o kit assado **dobrava o clone**
(`ia.test` 600 → 1040 ms, +73%; pior ainda com a busca em profundidade da fase 2). Nuance que
decidiu o mecanismo: `JSON.stringify` **não tem referência** — pôr o kit "por referência" na
unidade não adianta, o clone copia o objeto do mesmo jeito; só **manter o kit FORA do estado**
resolve. Solução: **REGISTRO COM CHAVE.** `novoEstado` recebe o catálogo, congela um snapshot e
o indexa por `st.catId` (string curta = hash do conteúdo, que SOBREVIVE ao `JSON.stringify`); a
resolução lê o kit por `CATALOGOS[st.catId]` (`kitDe`), a unidade carrega só a chave, o clone da
IA volta a ser barato (~490 ms). **Por que registro com chave e não um `_CAT` de módulo:** um
`_CAT` global quebraria com duas partidas coexistindo — `novoEstado(B)` sobrescreveria o
catálogo de A e `agir(A)` leria o de B, em silêncio; a arena da F1.4 cria milhares de estados.
Não cabe pôr o catálogo dentro de `st` (volta a perf) nem num WeakMap (o clone por
`JSON.stringify` não o acompanharia). Id por **conteúdo** faz catálogos iguais reusarem o
snapshot — o registro não vaza com os milhares de estados da arena. Congelado no início,
rebalancear no meio não altera a partida — o objetivo (seed determina a partida) é preservado.
Travado em `tests/catalogo.test.js` (duas partidas, catálogos diferentes, em sequência, cada uma
respeitando o seu; clone só com o `catId` lê o mesmo snapshot).

**Limite e forma-alvo (Fase 2, NÃO implementar agora).** O estado serializado carrega só o
`catId`, não o kit — uma Provação/replay salvo lê o kit VIVO ao recarregar. Em vez de assar o
kit (caro), a forma-alvo é um **CARIMBO DE VERSÃO do catálogo** no estado salvo (hash do
conteúdo ou número incrementado). Ao carregar, compara-se: **Provação** usa o kit vivo de
propósito (o jogador precisa aprender o deus que existe HOJE), mas se o carimbo divergir,
marca-se para **RE-VERIFICAÇÃO** (a solução gravada é reexecutada para provar que o puzzle
continua vencível); **Replay**, se o carimbo divergir, **avisa que a reprodução pode não ser
exata**, em vez de reproduzir errado em silêncio. O `catId` por conteúdo já é meio caminho — é o
carimbo.

---

## 25. Motor emite EVENTOS, não texto; um narrador TOTAL traduz (F1.0b)

**O motor parou de escrever português.** `log()` empilha **eventos estruturados** em `st.log`
(`{tipo, ...}`), e `st.fim` virou `{tipo:'fim', resultado, lado?, motivo?}`. Um único lugar
traduz para pt-BR na hora de exibir: `src/ui/narrar.js`. Isto existe porque o mesmo motor roda
no servidor (Fase 4/5), onde string de português não deveria existir, e mata o remendo
`traduzirRotulos` (regex de "Jogador N" por cima de string pronta) — o narrador resolve `lado`
por `rotuloLado`, sem remendo. A GRAMÁTICA é contrato escrito ANTES em `docs/eventos.md`.

**As 5 regras (invioláveis, varridas por `tests/eventos.test.js`):** (1) todo evento tem `tipo`,
que é a ÚNICA coisa que decide o formato; (2) campos **canônicos** reutilizados, sem sinônimo
(dois eventos que falam de quantidade usam `valor`); (3) **sempre CHAVE, nunca nome exibível**
(`alvo:'zeus'`, `lado:0` — o narrador resolve chave→nome, e o nome da habilidade pelo catálogo
da partida via `origem`+`slot`); (4) **zero formatação** (`kind:'puro'`, não `'[puro]'`); (5) o
narrador é **TOTAL** — evento de `tipo` desconhecido NÃO some do registro, cai num despejo cru
dos campos. Log que engole evento é onde bug de motor se esconde, e nos 73 kits vai acontecer;
o teste crava que um tipo inventado aparece. A varredura roda 24 partidas IA×IA (2824 eventos)
e falha se qualquer campo, tipo ou `motivo` sair do vocabulário, ou se uma "chave" for na
verdade nome exibível (`'Zeus'`, `lado 'Jogador 1'`, `kind '[puro]'`). Vocabulário mora em
`E.VOCAB` (`eventos`/`camposEvento`/`motivos`) — mesma fonte única que já alimenta o schema.

**Decisões de contrato do dono:** (A) **DoT vira CHAVE** (`efeito:'queimadura'`), sem campo
isento — a exceção viraria o precedente que os 73 kits seguem, e "sempre chave" morreria por
mil concessões. Tocou `data/deuses/brigid.json` e o schema passou a validar `dot.nome ∈ V.dots`;
o mapa chave→nome (`NOMES_DOT`) mora em `ui/base.js` (compartilhado por `narrar.js` e `campo.js`).
(B) **O narrador lê o catálogo da partida** (`CATALOGOS[st.catId]`) para resolver `origem`+`slot`
→ nome de habilidade e `origem`→passiva. (C) **Um evento, um sujeito** (regra 6): um Milagre que
atinge 3 emite **um `dano` por alvo** — cada alvo pode ter resultado diferente (um absorve no
escudo, outro está Invulnerável, outro cai); um `valor` agregado mentiria. (D) **`motivo` é
conjunto FECHADO** — é a porta dos fundos por onde o português voltaria ao motor ("porque estava
Invulnerável"); é chave de um conjunto que a varredura valida.

**Arquitetura:** `narrar.js` é **FUNDAÇÃO como `base.js`** — os outros `ui/` podem chamá-lo (quem
renderiza registro/resumo/banner o invoca), mas ele só usa `base.js` e os globais do motor. A
checagem de direção da build isenta os dois (`UI_FUNDACAO`), e `narrar.js` como origem continua
checado (não pode chamar outro `ui/`).

**Rugas achadas ao implementar (reportadas, não escondidas):**
- **`motivo` reconciliado à realidade:** o motor emite `sem_cura`/`nao_revive` (falhas) e `tempo`
  (fim por esgotamento no turno 40) que a gramática rascunhada não listava; `imune_tipo` estava
  na lista mas o motor nunca o emite (imunidade sai como evento `imune` com `efeito`, não como
  `bloqueio` com `motivo`). O conjunto fechado passou a ser exatamente o que se emite.
- **BUG DE MOTOR achado PELO refactor (anterior à F1.0b) — argumento a favor de eventos:** a
  invocação-guarda que assumia um golpe de alvo único logava `absorvido` com o dano inteiro —
  mas ela **perde HP**, nada é absorvido por escudo. Era mentira desde sempre; a string
  `"absorve o golpe ({antes}→{hp})"` a **escondia** (parecia sabor, não campo errado). Ao virar
  evento, `absorvido` ganhou significado exato (quanto o ESCUDO comeu) e a mentira ficou visível.
  Corrigido para dois eventos (regra 6): `efeito:'intercepta'` (assumiu o golpe) + `dano` limpo
  (o que a guarda levou). **Lição:** string livre esconde erro de dado; evento estruturado, com
  cada campo significando uma coisa só, o expõe — é uma razão a mais para o motor emitir eventos.
- **`ANEL`/`MANTO` saíram do motor:** o rótulo do modo alternado da Nezha estava chumbado no
  `engine.js` (o pt-BR que a F1.0b existe para tirar). Foi para o kit (`ab.modos:["ANEL","MANTO"]`,
  igual a `opcoes[].nome`); o schema passou a aceitar `modos`; o narrador lê do catálogo.
- **`contador` e `fase` não disparam nos 11 kits** (0 kits usam esses `fx`). A chavagem dos seus
  sub-tokens (nomes de contador; `Dia`/`Noite`) fica para quando o primeiro kit os exercitar —
  mesma disciplina de "primitiva antes do deus"; o narrador já os trata de forma TOTAL.
- **Lacunas de narração** onde o evento carregava menos que a string antiga — VARRIDAS e fechadas
  na F1.0b-cont (abaixo). Dos 57 textos antigos, 47 não perderam nada; das 10 lacunas, só 4
  disparavam nos 11 kits.

**Migração de testes (método muda, verificação fica):** os testes que SETavam `st.fim` string
(`perspectiva`, `interface`, `rotas`) passaram a setar o evento estruturado; a asserção sobre o
BANNER renderizado ("CPU VENCE", "JOGADOR 2 VENCE") é a mesma — só o SET mudou, o VERIFY não. Os
que empilhavam DoT à mão (`motor`, `auditoria`, `interface`) passaram a usar a chave `queimadura`;
`interface` continua conferindo que a UI exibe "QUEIMADURA".

**F1.0b-cont — evento incompleto é dívida silenciosa (regra 6 da gramática).** Varredura das 57
strings antigas contra o evento que cada uma emite hoje. Corte útil: por "dispara nos 11 kits", não
por gravidade percebida.
- **Corrigido (dispara hoje):** (A) **energia livre** virou UM evento `orbe` por elemento
  (`{lado, valor:-n, para:<elem>}`) — a quebra por elemento é o que o jogador precisa ao ler o
  turno do oponente, e o registro é a ÚNICA fonte disso desde a F0.7 (o processo da CPU é escondido
  de propósito); (B) **passiva de renascer da Nezha** carrega `valor:40`; (C/D) **Vínculo** foi
  APARADO para um sujeito ("Vínculo em X") — o par carrega o ícone no retrato, o estado já mostra a
  ligação, então a narração descreve o sujeito e para (corolário registrado na gramática).
- **Diferido (0-kit) com TRIPWIRE:** invocação, dano armazenado, Vida Extra, interceptar e contador
  não disparam nos 11 kits; suas lacunas de sub-token ficam para quando o kit chegar. O que as torna
  seguras (em vez de um aviso que alguém esquece) é o mapa `OBRIGATORIOS` em `tests/eventos.test.js`:
  chave por tipo, e **chave composta `tipo:efeito`** para lacuna de sub-tipo (`efeito:copiar` exige
  `habilidadeCopiada`; `efeito:invocacao` exige `invocacao`), resolvida mais-específica-primeiro.
  Os nomes canônicos desses campos já estão RESERVADOS em `E.VOCAB.camposEvento` (complete-by-
  construction). Quando o kit disparar o evento cru, o teste falha.
- **BUG CONHECIDO (não é lacuna — narra ERRADO):** ao copiar (fx `copiar`, sucesso), o evento é
  `acao{origem, slot:'habilidade'}`, então o narrador resolve a Habilidade PRÓPRIA de quem copia, não
  a Habilidade COPIADA. É narração incorreta, não só incompleta. Só se manifesta quando **a Ísis
  entrar, na F1.3** (0 kits copiam hoje) — a implementar por mim então: emitir `efeito:copiar` com
  `habilidadeCopiada` (o tripwire `OBRIGATORIOS['efeito:copiar']` já força isso) em vez do `acao` que
  mente. Registrado aqui para não reaparecer como surpresa na F1.3.

---

## 26. Fração implícita da vida reescalada para 120 (F1.0c) — CONTINUAÇÃO do §15, não revisão

O §15 subiu a vida para 120 **sem tocar no dano bruto** (jogo ~20% mais lento, de propósito) e
até previu a consequência numa linha — "cada Milagre de execução mira ~1/3 da vida, não ~2/5" —
mas **glosou sem medir kit a kit**. O §26 fecha exatamente esse aberto. Não revê o §15: o dano
bruto continua congelado (opção (b), decidida lá); aqui só se corrige o que o §15 deixou derivar.

**O problema medido.** Números que são FRAÇÃO da vida não escalam sozinhos quando a vida sobe. A
100, um limiar de execução "≤25" era 25% da vida; a 120 virou ~21%. É degradação silenciosa: não
quebrava teste, ninguém revia. A varredura das 57 strings antigas (F1.0b) já tinha exposto a
categoria; aqui ela foi medida.

**Decisão: opção (c)** — reescalar ×1,2 SÓ o que é fração implícita da vida, mantendo o dano
bruto e as taxas (cura, escudo, redução plana — que escalam junto com o dano, preservando a razão,
então pertencem ao §15). (a) (escalar tudo) contradiz o §15; (b) puro deixa a degradação de pé.

**Dois achados que corrigiram a proposta do dono (a deriva de fração corta nos DOIS sentidos):**
- **"Não cai abaixo de 1 de HP" NÃO é fração — é binário.** 1 HP é 1 HP em qualquer vida máxima
  (Hércules, Sun Wukong, Chang'e, Vishnu, Oxalá, Dagda, contador da Shiva). Reescalar não faz
  sentido; ficam de fora. (O dono havia listado em (c); retirado.)
- **A Durga era um BUFF acidental, não degradação.** O portão "48 se **acima** de 70 de HP" abria
  o bônus para 70% da vida a 100; a 120, "acima de 70" pega tudo acima de 58% — faixa MAIOR. A
  procura só por enfraquecimento teria perdido isso. Lição: fração à deriva enfraquece uns e
  fortalece outros; auditar deriva é olhar os dois sentidos.

**Os 19 números reescalados** (7 execução + 1 portão-alto + 4 portão-baixo + 7 revive; Osíris
entra 2×, portão + revive; 18 kits, 19 linhas): execução 20→24 / 25→30; portão-alto (Durga)
70→84 (só o portão; o dano 48/32 fica); portão-baixo 50→60; revive 40→48 / 50→60 / 30→36 / 25→30.
Tudo na prosa do roster (`data/kits.json`), **só o dano bruto NÃO** foi tocado — a auditoria de
teto bruto (`auditoria.test.js`) segue verde, prova de que nenhum dos 19 era dano disfarçado.
**Só a Nezha está implementada no motor** (revive 40→48 em `engine.js`, prosa em `data/deuses`);
os outros 18 são prosa até virarem kit de máquina.

**Trava adiante (`tests/fracoes.test.js`).** Tabela FECHADA de frações pretendidas por categoria
(execução {20%,25%}, portão-alto {70%}, portão-baixo {50%}, revive {25%,30%,40%,50%}); a varredura
lê a vida DO MOTOR (não de um literal) e falha se um kit sentar fora de `round(fração × vida)`.
Tolerância = 0 por decisão: o alvo é o inteiro exato, e ±1 mesclaria as faixas 20%/25% da execução
(24 vs o velho 25). Se a vida mudar de novo, os alvos recomputam e o teste aponta o que reescalar
— os 73 futuros nascem certos por construção, não por memória.

**Lacuna aberta (schema não pega prosa↔motor).** O schema da F1.0a valida a forma dos kits de
máquina (`data/deuses`), mas NÃO compara com a prosa do roster (`data/kits.json`); prosa e código
podem divergir em silêncio. Hoje só a Nezha existe nos dois — mantidos em sincronia à mão. Com 73
kits vindo, isso vira bug. Tarefa aberta (ESTADO.md): um checador prosa↔motor na build.

---

## 27. Sinergia declarada: Podridão (Ah Puch) × execução — NÃO é bug (F1.1)

A Podridão do Ah Puch reduz o HP MÁXIMO do alvo (−10 por acúmulo). Depois da F1.0c, os limiares
de execução são frações do máximo de PROJETO (120): ≤24 = 20%. Contra um alvo decaído a 80 de
máximo, esse mesmo ≤24 vale 30% do máximo ATUAL dele — ou seja, a execução fica mais fácil quanto
mais podre o alvo. **Isto é sinergia INTENCIONAL, não deriva de calibração:** Ah Puch amolece o
alvo para o executor (Hades, Fenrir, Lugh…), que é o papel da dupla. O teste de fração (F1.0c)
valida AUTORIA de kit contra o máximo de projeto e NÃO persegue o estado de runtime — de propósito.
Registrado para que ninguém "conserte" isso depois achando que um limiar valendo 30% do máximo
reduzido é erro. Se algum dia se quiser um limite sobre o máximo ATUAL, é decisão nova, não conserto.

---

## 28. Cadeia de verdade: kits.json é a fonte; checador na build (F1.0e, elo B)

A verdade de um kit passa por **planilha → `data/kits.json` → `data/deuses`**. O `kits.json` (prosa
revisada, o que o dono lê) é a **FONTE**; `data/deuses` (máquina) é DERIVADO. Divergência entre eles
é **presunção de erro no motor**, e o checador só **APONTA** — nunca conserta sozinho.

**Elo B (`tools/checar_cadeia.js`, na build, falha alto):** confere número a número — nome, custo,
recarga, dano, cura — entre a prosa e o `fx`/`cost`/`cd` da máquina, nos kits implementados. Campo
que o parser não resolve com segurança vira **NÃO-CONFERÍVEL** (reportado, nunca engolido). **Teto:
se >20% não-conferível o checador não protege** — hoje 1,6% (2/124). O parser rejeita o que não é
dano causado (`+N de dano`/`N menos de dano` são buff/debuff, não dano).

**Achado que validou o checador** (o dono: "se não achar divergência, desconfie"): apontou
`nezha.habilidade [dano]` — a máquina não tem `dmg` no `ab.fx` porque o Arsenal Celeste é `alterna`
e o dano da forma MANTO está **chumbado no `engine.js`**, não no kit. O motor está correto (dá 12
em MANTO), mas o valor não mora no dado — **cegueira do checador para `alterna`/`opcoes`** (marcados
não-conferíveis) e **resíduo da F1.0a** (dado de kit no motor). Anotado no ESTADO, não vira tarefa
(o objetivo das próximas sessões é deus no jogo, não fundação). Prova de dentes em `tests/cadeia.test.js`.

**Elo A (planilha↔kits.json) — tarefa ABERTA, não agora.** Critério de infraestrutura que passa a
valer: **a tarefa CONTAMINA o conteúdo que vem, ou é diagnóstico de dívida que já existe?** Elo B
contamina (guarda os 6 kits da F1.1 e os 73 dos lotes — kit novo divergindo passaria em silêncio) →
faz agora. Elo A é diagnóstico (o Susanoo já divergia antes desta conversa; os kits novos nascem do
`kits.json`, não da planilha) → não protege kit futuro → ESTADO, com método já decidido (parse cru
de XML, sem dep — a planilha `docs/*.xlsx` é zip de XML), para quando a Fase 1 fechar. Entregável de
lá: quantos kits têm dado só na planilha (o "pool de time, teto 20" do Combo, os "100 de HP" parados).

---

## 29. Contador com limiar: duas FAMÍLIAS distintas (F1.1, primitiva 1)

Ao ler o número de um contador contra um alvo, há **duas famílias**, e modelá-las como uma só
produziria um mecanismo que faz as duas coisas mal:
- **Gatilho-no-acúmulo** — dispara SOZINHO quando o número muda e cruza um limiar. Ex.: Anúbis,
  "quem chegar a 4 Ataduras fica Selado". É um evento no momento do acúmulo.
- **Condição-na-ação** — o número é LIDO quando o jogador aperta o botão, para escalar/desbloquear.
  Ex.: Kitsune, "com 5+ Caudas, Domina"; Rá, "+4 por Disco Solar". É `porContador`, que já existe
  (primitivas.test §1) — condição sobre um mecanismo existente, não mecanismo novo.

**Primitiva 1 entrega só o gatilho-no-acúmulo** (`fx.limiar:{em, aplica}`, config no DADO;
`cruzarLimiar` no motor). Três bordas travadas em `primitivas.test §1b` — é onde esse padrão sempre
quebra: (1) **dispara ao CRUZAR, uma vez** — "chegar a 4", não "estar em 4+"; acúmulo já acima NÃO
redispara (a prosa do Anúbis pede isso); (2) **cruzar de uma vez** conta — +2 de 3→5 dispara o 4 sem
parar nele (o Milagre do Anúbis dá +2 em todos, então acontece de verdade); (3) **imunidade** —
`aplicar` recusa o controle no alvo imune, mas o contador acumula normalmente e **não há retroação**
(cair a imunidade depois não aplica o efeito perdido; só um novo CRUZAR aplicaria, e acima do limiar
não há novo cruzar). O efeito aplicado é do vocabulário existente — o gatilho é a primitiva, não o efeito.

---

## 30. Nome de contador é CHAVE no campo `efeito` do evento (F1.1, diferido da F1.0b pago)

O evento `contador` passou a carregar a **chave** do contador no campo canônico `efeito`
(`{tipo:'contador', origem, valor, efeito:'discoSolar'}`); o narrador resolve para o nome exibível
via `NOMES_CONTADOR` (em `ui/base.js`, ao lado do `NOMES_DOT`), e `OBRIGATORIOS['contador']` passa a
exigir `efeito`. As chaves são camelCase (`discoSolar`, `atadura`, `cauda`, `combo`, `podridao`,
`maldicao`) — mesma convenção dos tipos de efeito, sem underscore, então a varredura de gramática as
aceita sem afrouxar o regex.

**Reusar `efeito` é economia, não sobrecarga (decisão consciente, a pedido do dono).** O campo
`efeito` JÁ é polimórfico por `tipo`: `dot.efeito` é chave de DoT, `imune.efeito` é o efeito a que se
é imune, `fase.efeito` é a fase, `efeito.efeito` é o tipo de efeito. Seu significado sempre foi "a
coisa CHAVEADA que este evento trata", lida por `tipo`. Nenhum consumidor lê `.efeito` sem o `.tipo`
(o narrador despacha por `tipo`; o `OBRIGATORIOS` chaveia por `tipo`), e a resolução do contador é
SEPARADA (`nomeContador`, não o `rotuloEfeito` genérico) — então chave coincidente não cruza. A
gramática proíbe **sinônimo** (dois campos p/ a mesma coisa); um campo `contador` novo é que seria a
duplicata. Sem caso ambíguo → reuso. (`V.contadores` no schema, à la `V.dots`, fica para quando o
primeiro kit de contador entrar em `data/deuses` — hoje 0 kits usam `fx.contador`.)

---

## 31. Contador de CAMPO por LADO: pool do time, store separado, permanece na queda (F1.1, primitiva 2)

O Combo é um **pool do TIME por lado**, não um contador por-unidade. `st.lados[l].contadores` é um
store SEPARADO do `u.contadores`, e a separação não é estilística:
- `contadorNoCampo` responde **"quanto o time TEM, somando as unidades vivas?"** — MUDA quando uma
  unidade cai. O pool responde **"quanto o time ACUMULOU?"** — não deveria mudar por queda. São
  perguntas diferentes que só coincidem por acidente hoje; unificar faria uma responder errado.

**O pool PERMANECE quando o gerador cai** — e o argumento é do próprio kit, não "a planilha diz":
o Milagre do Susanoo consome TODO o Combo; se o pool zerasse na queda, ele viraria armadilha
(acumula 20 e perde tudo se o gerador morre antes de consumir), punindo a preparação que o kit pede.
E há um segundo gerador previsto (Fujin dá +1 com Raijin no time) — com dois geradores, "de quem é o
Combo" deixa de fazer sentido: é do LADO. Geração credita `origem` (quem gerou) no evento, mas o
armazém é do lado.

**Mecanismo (fx, dado):** `{t:'contador', pool:'lado', lado:'proprio'|'inimigo', nome, v, max}` gera
no pool; `porContadorLado:{nome, lado, v}` escala dano pelo pool; `consomeContadorLado:nome` zera o
pool do lado próprio após escalar. Quatro bordas em `primitivas.test §1c` — a 4ª é onde pool-por-lado
vaza: **os dois lados são independentes de verdade** (Susanoo dos dois lados: cada um gera no seu
pool, teto 20 é POR lado e não somado, consumo de um não toca o outro) — foi assim que o `_CAT` de
módulo quase passou (§24), então travado explicitamente.

---

## 32. Redução de HP máximo (Podridão): piso 1, não é execução, restaura sem curar (F1.1, primitiva 3)

A Podridão do Ah Puch reduz o HP MÁXIMO em 10 por acúmulo. Decisões:
- **Piso 1 no máximo.** `hp` chegando a 0 é MORTE; `maxHp` é CAPACIDADE. Se a Podridão levasse o
  máximo a 0 e matasse, seria **execução disfarçada sem limiar** — e os dois efeitos que matam sem
  dano no jogo (execução por limiar, e a contagem do Yan Wong) são DECLARADOS como tal. A decomposição
  deixa a unidade frágil (máximo 1), a morte fica por conta do dano. `reduzirMaxHp` para em 1.
- **O clamp NUNCA mata.** Unidade 5/10 que ganha Podridão: máximo vai a 1 (piso), o clamp puxa hp de
  5 para 1 — viva. É onde "piso 1" vazaria sem ninguém notar (a morte viria do clamp, não da redução);
  como `maxHp≥1`, `hp=min(hp,maxHp)≥1`. Travado em `primitivas.test §1d`.
- **Guarda a perda REAL** (`u.maxHpPerdido`, limitada pelo piso) para o Milagre do Itzamná restaurar.
- **Restaurar devolve o máximo SEM curar** (`t.maxHp += maxHpPerdido`, `hp` fica). O Milagre do Itzamná
  já cura 25 no time num efeito separado; se restaurar também curasse, seria cura dupla no mesmo botão.
  A prosa distingue os dois; o motor distingue. Fx `restauraMax` (per-alvo, escopo time).

**Aberto até o kit do Ah Puch:** `maxHpPerdido` some quando a unidade cai e volta por revive? Palpite:
a unidade revive com o máximo REDUZIDO (a decomposição não se desfaz com a morte). Não decidido — trago
junto do kit.

---

## 33. Contágio: iguala ao maior, fonte retém de graça, dispara limiar (F1.1, primitiva 4)

A Maldição de Yomi (Izanami) se espalha para os três inimigos. Semântica travada:
- **Iguala ao MAIOR, não aditivo.** `espalharContador` põe todos no maior contador entre eles (teto 5).
  Aditivo comporia consigo mesmo — usar a habilidade 2× dobraria o campo (3→6→12) e, com 6 de dano puro
  por acúmulo, furaria qualquer teto em três turnos. Igualar dá o contágio sem laço multiplicativo:
  espalhar 2× sem novo acúmulo NÃO muda nada (todos já no máximo).
- **A fonte RETÉM de graça.** Ela está no máximo, então igualar não a move — sem `if` especial
  protegendo-a. Comentário no código avisa: quem adicionar um `if` para "proteger a fonte" está
  consertando algo que o mecanismo já garante.
- **A subida passa por `aposAcumular`: chegar a N é chegar a N.** Contágio que leva uma unidade a
  cruzar um limiar DISPARA o limiar, igual a acúmulo direto. Um limiar que só dispara por certos
  caminhos vira regra OCULTA — e regra oculta é o que viemos matando desde o soft pity e o 50/50
  (§20/§21). Para a Maldição é indiferente (ela não tem limiar), mas o mecanismo vale para todo contador.
- **Consequência registrada de frente (para a arena da F1.4):** contágio + limiar é uma combinação
  FORTE — espalha e dispara em três alvos de uma vez. Não é acidente, é o que a mecânica promete; mas
  é candidata a aparecer como outlier quando a arena medir números, e aí NÃO deve ser tratada como
  surpresa nem "consertada" por reflexo — é design conhecido.

Com a primitiva 4, o motor tem tudo que os 6 kits de contador precisam; o próximo passo é ESCREVER os
kits, e é aí que o checador da cadeia (F1.0e, §28) entra em ação pela primeira vez com dado novo.

---

## 34. Contador não aparece no retrato: dívida de UI com endereço na F4 (não "algum dia")

O 1º kit de contador (Rá, §30) expôs que `campo.js` desenha `efeitos` e `dots` na faixa do retrato, mas
**não `contadores`** — o Disco Solar existe só no registro. É **informação escondida**, exatamente a classe
de problema que viemos matando desde o soft pity e o 50/50 (§20/§21): o jogador decide sobre um recurso que
não vê. Não bloqueia escrever kits (o motor conta certo; só a exibição falta), então **não vira tarefa
agora** — mas entra com **endereço fixo na F4 (acabamento visual)**, junto do resto da arte de faixa, não em
"algum dia". Forma-alvo: badge/contador no retrato via `NOMES_CONTADOR` (já existe em `ui/base.js`).

## 35. A varredura das primitivas é ÚNICA e substitui a descoberta de-kit-em-kit (planejamento)

`docs/primitivas-faltantes.md` lê a prosa inteira dos 100 kits de uma vez. O achado que fecha a conta: o
número de "primitivas faltantes" mudava (12→11→4→7) porque contávamos `fx` faltante, quando o custo real
é (a) `fx` declarado-mas-verde estreando (o trap do contador, §30) e (b) **passivas hardcoded** — as 100 são
prosa pura, 11 feitas, e 38 do tipo "+N dano condicional" (colapsáveis num `bonusDano condicional`
data-driven). A tabela é a base para o dono montar o resto da Fase 1; as decisões dela ficam ABERTAS abaixo
até serem batidas em bloco.

**LIÇÃO (a mais cara do planejamento):** o número mudou TRÊS vezes (12→11→4→7) não porque a lista crescia,
mas porque **eu media a dimensão errada** — contava `fx` faltante quando o custo real estava nas passivas.
Medir a dimensão certa de uma vez (a varredura completa) valeu mais que qualquer contagem incremental. Antes
de estimar "quanto falta", pergunte "estou contando a unidade certa?" — `fx` era o proxy fácil e errado.

## 36. Passiva ganha SCHEMA DECLARATIVO — a decisão-mãe, vira a F1.2 (antes de execução e Selado)

Decisão do dono a partir da varredura (§35): a passiva deixa de ser prosa-hardcoded e ganha `fx` declarado
no kit, igual à habilidade. **Contamina como nada mais no projeto:** sem ela, 89 passivas viram 89 blocos
`if (u.key===...)` no motor — o OPOSTO do que a F1.0a fez com os kits (tirar dado do motor), e o checador
da F1.0e (§28) não alcança `if` em código. O número fecha: ~94 das 100 passivas caem em 6-7 formas
declaráveis (+N condicional 38, imunidade estática 27, por-turno 15, on-kill 14, reativa 10, on-death 7,
sinergia nomeada 7) — a diferença entre **6 mecanismos e 89 casos especiais**. Não é refatoração
especulativa; é a mesma faxina da F1.0a aplicada às passivas.

**Plano da F1.2 (várias sessões, UMA categoria por sessão):**
1. Começar pelo **"+N condicional" (38 kits)** — a forma mais comum, valida o desenho. Declarar no kit, não
   no motor. Migrar as passivas dos 12 já implementados que caem nessa forma (sobek, ra, ogum, brigid…) e
   provar que o comportamento NÃO mudou (as suítes atuais são a rede).
2. Depois as outras categorias, uma por sessão, na ordem de frequência. Cada uma com teste + migração dos já
   implementados.
3. O schema da F1.0a (`valida_kit`) passa a validar a FORMA da passiva declarada, igual valida habilidade.
4. Ao fim: relatar quantas das 100 o schema já expressa e quantas ainda precisam de código. Se sobrarem 5-6
   casos genuinamente únicos, **hardcode é a resposta certa para o que é único de verdade** — não forçar.

**SESSÃO 1 FEITA (gatilho `bonusDano`).** Schema em `docs/passivas.md`; vocabulário fechado (9 chaves de
condição) em `E.VOCAB`; `valida_kit` valida a forma; motor lê em `calcDano` via `bonusDanoDeclarativo`;
`tests/passiva.test.js` prova as 7 condições avaliáveis + escopo + falhas do validador. **Migrou ZERO reais:**
os 12 implementados têm passiva multi-parte (ogum/ra/sobek/brigid têm um clause `bonusDano` + outra metade
de outro gatilho), e migração é por DEUS INTEIRO — provado no sintético. Cobertura das 18 "+N condicional"
planas: **18/18 estrutural, 15/18 escrevíveis hoje**; as 3 (babi=`medo`→F1.4, horus=`alvoMarca`→vulnerabilidade,
tsukuyomi=`alvoCuradoAntes`→rastreio) esperam uma TAG que a fase própria delas introduz — o validador as
recusa em voz alta, sem exceção aberta. Nenhuma das 3 pede chave NOVA de condição = vocabulário completo.

**ORDEM do resto da Fase 1 (renumerada com a tabela na mão; SUBSTITUI as numerações anteriores de F1.3+):**
- **F1.2** passiva declarativa (esta; a decisão-mãe, várias sessões)
- **F1.3** Bloco 1 — morte e sobrevivência. Dentro: **PISO DE 1 HP PRIMEIRO, execução depois** (o Shiva fura
  o piso explicitamente → o piso precisa existir como estado real antes de a execução decidir se respeita ou fura).
- **F1.4** Bloco 2 — controle e vocabulário (Selado≡Silenciado, Pacificar, Torpor, Medo, trava-Milagre,
  redirecionar). Tudo motor, tudo junto.
- **F1.5** Bloco 3 — modos, estado e escolha múltipla.
- **F1.6** arena de auto-jogo.
- **F1.7+** lotes de kit, por panteão.

## 37. Bloco de 16 decisões da Fase 1 — batidas pelo dono (para F1.3/F1.4/F1.5)

**LIÇÃO A (segunda vez o mesmo padrão em duas sessões — vira regra).** Ao fechar o vocabulário da F1.2
sessão 1, o "+N condicional (38)" se revelou NÃO uma forma, e sim nove: o rótulo agrupava por SINTOMA
(+N de dano) e não por MECANISMO (o que a condição LÊ). Fechar contra os 4 deuses migrados teria perdido
elemento, HP, buff, marca, controle e fase — o cenário do tier B. É a mesma classe de erro do §35 (medir
a dimensão errada). **Regra: antes de fechar um conjunto, verifique se o rótulo descreve um MECANISMO ou
uma APARÊNCIA.** O 18 verdadeiro vale mais que o 38 falso, porque é verdadeiro.

**LIÇÃO B (a regra contrariou quem a escreveu — é assim que se sabe que ela segura algo).** Na mesma
mensagem, o dono BATEU a regra "migração é por DEUS INTEIRO" (decisão 2) e ela CANCELOU o item que ele
tinha APROVADO uma frase antes ("migrar os 3": ogum/ra/sobek). Os três são multi-parte; migrar a metade
`bonusDano` deixaria um `if (u.key===...)` invisível num deus que a documentação diria migrado. Registrado
de propósito: **uma regra que nunca contraria o próprio autor não está segurando nada.** O valor de uma
invariante aparece justamente quando ela veta uma vontade — inclusive a de quem a escreveu.

**LIÇÃO C (padrão CONSOLIDADO, não caso isolado): varra a FAMÍLIA INTEIRA antes de fechar, não os poucos
que vai migrar.** CINCO vezes seguidas isso evitou o tier B ou corrigiu um número que eu ia usar para planejar:
(1) o "+N condicional" eram 9 formas, não 1 (fechar nos 4 migrados perderia elemento/HP/buff/marca/fase);
(2) a auditoria de cobertura achou 6 furos onde eu supunha rede; (3) o gatilho `reducao` — ao varrer as ~15
passivas de redução, o eixo se revelou MÚLTIPLO (slot/classe/elemento-negado/fase/paridade/contador/contagem/
elemento-do-receptor), abri só `slot`; (4) a família por-turno eram 3 formas distintas (todo-turno/abertura/
a-cada-N), 3 gatilhos nomeados, não um eixo temporal; (5) o gatilho `imunidade` — o balde "27 imunidades
estáticas" era **2,25× maior que a família real**: somava imunidade (12) + redução (já migrada, sessão 3) +
anti-revive (6, outra família) + condicionais (2, outra família). Eu ia planejar "maior que tudo que a F1.2
fez" a partir de 27; a família real é 12, uma sessão. Já não é sorte: **antes de fechar qualquer conjunto/
vocabulário, a varredura da família inteira é obrigatória** — o custo dela é sempre menor que o de uma exceção
(ou de um plano) descoberto errado num lote distante.

**O detalhe que faz a lição funcionar:** não foi prudência genérica. A varredura acertou nas cinco vezes
porque foi feita contra o **CONJUNTO INTEIRO**, não contra os casos em mãos. Varrer só os que eu ia migrar
teria falhado em todas (fecharia no debuff/defesa do sobek e perderia elemento/HP/marca; confirmaria "ogum/tyr
têm suíte" sem ver que era da habilidade; fecharia o `reducao` no slot do sobek; e contaria 2 imunidades — as
da cuca/nezha — em vez de ver que a família são 12 e o balde somava 27). **É a diferença entre varrer e varrer
o SUFICIENTE** — a família toda, não a amostra que a
tarefa colocou na frente.

Respondidas em bloco. Guardadas porque uma sessão sem memória vai implementá-las meses depois. Onde
minha recomendação foi mantida, registro curto; onde o dono a VIROU, registro o argumento dele.

**Bloco 1 — Morte & sobrevivência (F1.3):**
1. Piso "não cai abaixo de 1 HP" = estado temporário; DoT e dano normal RESPEITAM; execução e efeitos
   marcados `ignoraPiso` FURAM. (Shiva fura explicitamente → o piso tem de existir como estado real.)
2. Execução por limiar de HP FURA o piso.
3. Execução × imunidade-a-revive: ORTOGONAIS. Execução mata; "não revive" é marca separada aplicada no ato.
4. **Execução FURA `vidaExtra` (o dono VIROU minha recomendação).** `vidaExtra` interceptando execução
   esvaziaria a família: 7 kits pagam custo alto por um limiar de HP, e a Bastet com Sete Vidas anularia
   todos os 7, sete vezes. Execução furar é o que a torna resposta a tanque. E o próprio dado confirma:
   Sun Wukong tem imunidade DEDICADA a execução — se `vidaExtra` já protegesse, a imunidade dele seria
   redundante, e kits não carregam redundância assim.
5. Execução temporizada (Livro/Morrigan): a marca é debuff removível por `cleanse`; removida antes do fim,
   não executa; a checagem roda no `fimTurno`.

**Bloco 2 — Controle & vocabulário (F1.4):**
6. Selado ≡ Silenciado = "só Básico" → um único tipo `selado`; "Silenciado (só Básico)" na prosa é
   normalizado para ele. `silenceClass` (Zeus, trava por CLASSE) fica separado.
7. **Pacificar NÃO zera cura.** Zera só o dano das ações do alvo; travar cura junto seria dois controles no
   preço de um — travar cura é `noHeal`, que já existe e é outro efeito.
8. **Torpor dispara POR AÇÃO, não por turno.** Hoje coincidem (o alvo age 1×/turno), mas "por turno" viraria
   teto acidental se um kit conceder ação extra — e a Cuca já tem "Básico grátis a cada 3 turnos", o
   precedente existe. Declarar por ação fica correto sozinho quando o caso aparecer.
9. Medo = composto declarativo (`dmgDown` + trava-Milagre) com tag `medo` para imunidade (Guan Yu/Durga).
10. Trava-Milagre = `lockSkill` com `slot: 'milagre'`.
11. Redirecionar single-target tem PRECEDÊNCIA sobre `taunt`.

**Bloco 3 — Modos, estado & escolha (F1.5):**
12. A escolha chega ao motor via parâmetro `escolha` (array de índices, cobre o 2-de-5 da Nüwa), validado
    contra `ab.opcoes`.
13. Modo `alterna` NÃO reseta na morte; persiste a partida toda; a UI mostra o PRÓXIMO modo.
14. Dia/Noite são mutuamente exclusivos (um só `st.fase`; ativar um remove o outro); ler estendido a cura,
    buff, duração de controle e orbe.
15. Invocação = pseudo-unidade alvoável (área a atinge); NÃO gera orbe, NÃO conta para vitória, NÃO é
    revivível; some ao expirar. Iansã "destrói invocações" = remove todas.
16. **A escolha é feita AO ARMAR, com commit num 2º gesto (invariante 13 — tocar nunca gasta).** Fluxo:
    toca a habilidade → aparece a escolha → escolhe → CONFIRMAR resolve; cancelar em qualquer ponto não
    gasta nada. Igual a alvo e igual à troca de energia.

## 38. CARACTERIZAR ANTES DE MIGRAR — a rede tem de existir antes de se confiar nela (F1.2)

**CHECKLIST de migração (cresce com o que cada sessão ensina):**
1. A passiva tem asserção que cobre o comportamento ESPECÍFICO? Se não, caracterizar ANTES (não supor).
2. Magnitude E escopo EXATOS, os dois lados de cada condição (o erro da Hera: afirmar existência ≠ valor).
3. Hardcode diverge da prosa? Prosa vence (§39) — registrar e trazer ao dono; não perpetuar a folga.
4. **Quando o hardcode consome RNG, PROVE que o declarativo consome o MESMO fluxo** (sessão 4: `sortearElemento`
   == o `rng` inline do `orbGain`, mesmo nº de chamadas). Se divergirem, a suíte passa mas a ARENA começa a
   produzir resultado diferente do relatório anterior, e ninguém liga a causa. É migração fiel vs aproximada.
5. Ao fim: `grep "key === '<deus>'"` vazio no motor + placar TERMINADOS atualizado.
6. **SANIDADE DE AMBIENTE (antes de tocar em código):** se o código contradiz o que o ESTADO.md/§ diz que já
   foi feito — um hardcode "de volta", um marker ausente, um deus já migrado que aparece cru — NÃO corrija o
   sintoma. Verifique `git log --oneline -1` e `git log origin/<branch> -1`; se o HEAD local está atrás,
   `git fetch && git reset --hard origin/<branch>` e reconfira. Duas vezes nesta jornada o container
   reprovisionou num commit velho (clone fresco atrasado), e as duas vezes o sintoma foi "a Nezha/o deus X
   voltou a ter hardcode". "Corrigir" teria reescrito trabalho já pronto e criado divergência com o origin. O
   ESTADO.md é a fonte da verdade do que foi feito; o working tree pode estar mentindo.

**PROCEDIMENTO DE COMMIT (dono, F1.2.5 — o revert do container mudou de categoria):** o 5º revert reprovisionou
o repo ENTRE o teste verde e o commit, apagando edições NÃO-commitadas do disco; o commit seguinte capturou o
motor estale (lixo). O §38 recupera trabalho COMMITADO, não edição no disco. Então a ordem inverte — commitar
ANTES de testar o pesado:
1. Commite cada bloco na MENOR UNIDADE QUE MANTÉM A SUÍTE VERDE (não a menor que compila), sem esperar a suíte
   lenta. **Quando uma mudança de motor EXIGE uma migração de teste para a suíte passar (ex.: `fase`→`estado`
   quebrou o teste que usava `quando:{fase}`), as duas vão no MESMO commit** — separá-las produz vermelho
   garantido no histórico. O bloco continua pequeno o bastante para proteger do revert.
2. Verifique `git rev-parse --short HEAD` contra origin IMEDIATAMENTE antes de cada commit (se divergiu, `reset --hard origin` e reaplique).
3. A suíte completa roda DEPOIS, sobre o COMMIT; se apontar algo, corrige em commit novo (fix-forward).
4. NUNCA deixe edição no disco durante espera longa em background (é quando o revert bate).
A rede de testes continua sendo a garantia — só passa a rodar sobre commit em vez de sobre disco. Commits
ruidosos são baratos; refazer edição inteira não é, e commit pequeno é mais fácil de revisar/reverter. (Investigar
por que o container reprovisiona: decisão do dono — é ambiente, provável fora de alcance, custo alto p/ ganho incerto.)

**LIÇÃO (o furo veio de um adjetivo impreciso do dono, achado uma sessão depois):** a 1ª versão dizia "bloco
COERENTE", e "coerente" não é verificável — engine+validador sem o teste migrado É coerente como feature, mas
quebra a suíte. "Verde" é verificável; "coerente" é interpretação. **Critério de procedimento tem de ser TESTÁVEL,
senão vira interpretação e cada um decide um limite diferente.** (E: deixar o commit vermelho transitório no
histórico e AVISAR, em vez de reescrever para esconder — histórico honesto vale mais que histórico bonito.)

Quando a passiva de um deus vira dado, a suíte que o cobre deixa de provar "o hardcode funciona" e passa a
provar "o dado REPRODUZ o hardcode" — é a rede de equivalência. Mas a regra "não altere as suítes dos 12"
pressupõe que essa rede EXISTE, e a varredura mostrou que não existe em todo lugar: o **Rá não tinha
asserção da passiva**, e ao migrar o `danoIrredutivel` descobri que o **Ogum também não** (a única suíte
dele testava a habilidade destroyShield, não a passiva +10/irredutível). Migrar ali seria trocar hardcode
por dado sem nada provando equivalência.

**Regra:** antes de migrar um deus sem asserção da passiva, ESCREVER a caracterização primeiro (assertar o
comportamento atual do hardcode), rodá-la verde, e só então migrar — a mesma suíte então prova que o dado
reproduz o hardcode. **Distinção explícita, senão alguém lê "não toque nas suítes" e paralisa:**
ACRESCENTAR cobertura que faltava ≠ ALTERAR uma asserção existente. A primeira é construir a rede; a segunda
seria mudar o alvo. Só a segunda é proibida. (Antes da F1.2 sessão 3, escrever as caracterizações de ra,
thor e fujin — prefiro a rede completa antes de precisar dela a achar outro furo no meio de uma migração.)

**EXCEÇÃO DECLARADA (dono) — a única em que alterar uma asserção existente é permitido:** corrigir uma
divergência prosa-hardcode (§39). Quando a prosa vence e o hardcode largo é estreitado, a caracterização que
travava o comportamento largo TEM de mudar para travar o estreito — isso é corrigir o alvo, não mudá-lo por
conveniência. **"Corrigir divergência prosa-hardcode" é motivo válido; "fazer a suíte passar" NUNCA é.** Ao
fazer, mostrar o diff das asserções linha a linha. (Nesta sessão a exceção NÃO precisou ser usada: as
correções de nezha/brigid eram invisíveis à suíte — nenhuma asserção existente travava o comportamento largo,
então nada mudou; só a caracterização NOVA já nasceu no escopo estreito.)

**Métrica que passa a ser acompanhada:** deuses TERMINADOS (passiva 100% declarativa, zero hardcode),
não "quantos gatilhos existem". Verificável: `grep "key === '<deus>'"` vazio no motor + suíte verde.
Placar vivo em `docs/passivas.md`. Hoje: **3/12** — ogum, tyr (sessão 2) e fujin (inerte, sem hardcode; a
passiva não funciona pois depende do Raijin — decisão aberta desde a Fase 0, volta na F1.8).

**Auditoria dos 9 (antes de escrever a rede):** 1 SIM (thor), 2 PARCIAL (hera só afirmava que o escudo
APARECE, não que é 10; nezha só cobria o revive, não a imunidade), 6 NÃO. Maioria descoberta → a tarefa de
rede se partiu em dois lotes. **Lote A escrito** (sobek, hera, nezha, ra — 6 cláusulas, magnitude E escopo
exatos, verde contra o hardcode; nenhuma migração). Falta o **Lote B**: brigid, cuca, ganesha, zeus.

## 39. Terceiro tipo de furo: o HARDCODE faz MAIS do que a prosa promete (achado ao caracterizar o Lote A)

Além de (1) rótulo por sintoma e (2) teste que existe mas não cobre, um terceiro: o motor implementa MAIS
do que o kit descreve. Dois casos achados ao escrever a rede:
- **nezha — imunidade larga demais.** `aplicarDot` bloqueia TODO DoT para a Nezha (qualquer `nome`), mas a
  prosa diz "imune a Veneno e Queimadura". Hoje coincidem (só existe `queimadura`); quando um 3º DoT entrar
  (ex.: sangramento), a Nezha ficaria imune a ele DE GRAÇA, sem o kit prometer. Ao migrar, a passiva
  declarativa deve listar os DoTs imunizados (veneno, queimadura), não "todos" — senão herda a folga.
- **brigid — condição larga demais.** O +5 de cura dispara se ALGUÉM no campo (qualquer lado) tem
  queimadura (`alguemQueima` varre os dois lados), mas a prosa diz "se algum INIMIGO estiver com Queimadura".
  Uma queimadura num ALIADO hoje já ativa o bônus. Ao migrar a Brigid (Lote B), a caracterização tem de
  travar o escopo CORRETO (inimigo) — e aí é decisão do dono: a rede prova o hardcode atual (largo) ou a
  prosa (estreito)? Se divergem, é mudança de comportamento, não de forma — PARAR e perguntar.

**LIÇÃO do terceiro tipo:** caracterizar NÃO é só travar o que o código faz — é COMPARAR o que ele faz com o
que ele PROMETEU (a prosa). Onde divergem, o hardcode ganhou comportamento que ninguém decidiu. O da Nezha
não se acha lendo, testando ou jogando: aparece meses depois num lote distante (o 3º DoT) e ninguém liga a
causa. A caracterização o expôs porque forçou olhar o ESCOPO do hardcode em vez de confirmar que ele funciona.

**REGRA GERAL (dono):** quando hardcode e prosa divergem, **a PROSA VENCE** — ela foi revisada, está na
planilha, e é o que o jogador leu ao desbloquear o deus. Hardcode divergente é BUG, não recurso. Se um caso
futuro parecer exceção, PARAR e perguntar em vez de assumir.

**RESOLUÇÃO (dono decidiu as duas; corrigidas nesta sessão):**
- **Nezha → lista [veneno, queimadura]**, não "todos". Imunidade larga é vantagem que ninguém concedeu e que
  CRESCE SOZINHA a cada DoT novo (a pior dívida). Corrigido em `aplicarDot`; caracterização prova que um DoT
  fora da lista (sangramento) NÃO é bloqueado.
- **Brigid → "inimigo"**, não qualquer lado. Com o escopo largo, a própria Brigid queimando um aliado ativaria
  o bônus de cura dela — sinergia acidental na curandeira que mais jogador novo usa. Corrigido em `curar`.
- **Impacto no jogo hoje: nenhum.** Entre os 12, só Brigid e Nezha aplicam queimadura, e ambas em INIMIGOS
  (`alvo:inimigo`/`todosInimigos`) — nenhum kit consegue queimar um aliado, então o caso divergente é
  inalcançável e a suíte seguiu verde sem uma asserção mudar. A correção só passa a importar quando existir
  um kit que queime o próprio time. Registrado porque a folga estava LÁ, latente.

---

## 40. Caracterizar efeito que reage à PRÓPRIA morte trava ORDEM, não só magnitude/escopo (F1.2, sessão 7)

Todas as migrações até aqui caracterizaram *quanto* e *sobre quem* (magnitude + escopo). A Nezha é o primeiro
caso em que o efeito reage à **morte do próprio sujeito** (revive) — e aí magnitude/escopo não bastam, porque o
comportamento certo depende de QUANDO e EM QUE ORDEM, coisas que uma asserção de valor final não pega. O revive
"48 HP" está certo em magnitude e ainda assim pode estar errado se disparar no turno errado, antes da limpeza,
ou uma segunda vez. Quatro travas de ORDEM, verdes contra o hardcode ANTES de migrar:

1. **Pós-limpeza:** renasce DEPOIS de `alvo.efeitos = []` — 48 HP e SEM os efeitos que tinha ao cair. (Se
   revivesse antes, herdaria os DoTs que o mataram.)
2. **Vitória adiada:** a queda-pendente NÃO conta para derrota — `checarFim` trata `pendenteRenascer` como
   "ainda em jogo". Time todo caído com a Nezha pendente não perde até ela renascer ou o revive esgotar.
3. **Uma vez:** guarda `!renasceu` — cai, renasce, cai de novo → não renasce a 2ª. Travado dos DOIS lados
   (renasce na 1ª, NÃO renasce na 2ª).
4. **Turno seguinte:** o revive dispara em `iniciarTurno` do lado dela, não no `matar` — `pendenteRenascer`
   separa a marcação (no `aoCair`) da execução (no início do turno).

**Resultado nesta sessão: nenhuma das 4 divergiu da prosa** ("retorna no turno seguinte com 48 de HP, 1× por
partida"). Diferente do §39 (a imunidade larga da Nezha, que DIVERGIA): ali o hardcode fazia mais que a prosa;
aqui bate. Registro os dois juntos porque são a mesma disciplina em resultados opostos — caracterizar é comparar
com a prosa, e o resultado tanto pode ser "diverge, PARAR" (§39) quanto "confere, seguir" (§40). O que muda é o
que se OLHA: para um efeito auto-reativo, olhar só o número esconde os três erros de ordem que não aparecem no
valor final. Mecanismo migrado com `reviveProximoTurno` (faz-only, guarda `!vivo && !renasceu` em `rodarFaz`) +
`AOCAIR_QUEM` ganhando `'self'`; o revive-HP virou parâmetro (`reviveHp`) reusável pelo Bennu (60). **Placar
8→9/12.**

---

## 41. `bonusCura` é gatilho PRÓPRIO (não campo do bonusDano); a cura tem eixo de condição próprio (F1.2, sessão 8)

Migração da Brigid (deus inteiro, duas cláusulas). O dono pediu a varredura da família de cura ANTES da forma,
com três perguntas. As respostas:

**Q3 — quantas passivas de cura existem (o número decide a forma).** A varredura dos 100 (aba "Kits NA" da
planilha) acha **20 que MENCIONAM cura** — mas isso é balde, não família, exatamente como os "27" da imunidade
(§37, 5º caso). Categorizado por MECANISMO:
- **A. "curas curam +N" (bonusCura próprio, soma à MAGNITUDE): 7** — Hel, Nefertem, Dagda, Brigid, Cernunnos,
  Chaac, Itzamná.
- **B. cura PLANA disparada por gatilho (`faz` heal, NÃO bonusCura): 9** — Hades/Kali/Morrigan/Ah Puch (aoCair
  inimigo), Ymir (aoCair self), Khnum (aoCair aliado), Deméter/Shuten (porTurno), Boitatá (reativa/onHit).
- **C. "aliado curado causa +N dano" (bonusDano disparado por ter sido curado): 2** — Freyja, Oxum (é a condição
  `alvoCuradoAntes`, já RESERVADA em `quando`).
- **D. cura como gatilho de outra coisa / piso: 3** — Hera (aoCurar→escudo), Dagda-2ª (piso), Tsukuyomi
  (bonusDano vs curado).

Sexta vez que varrer o CONJUNTO INTEIRO corrige um número: **20 vira 7**. E o achado paralelo é maior que a
pergunta: a categoria **B (9) é maior que o próprio bonusCura (7)** e é a mesma lição do `faz:[fx]` do Rá — a
cura importa mais como EFEITO EMBRULHADO por outro gatilho do que como escalar. Destrava-se adicionando um `heal`
a `V.fxTurno`/`faz` (F1.x), não mexendo em bonusCura. Registrado como propriedade da família.

**Q1 — o `quando` do bonusDano serve, ou a cura pede eixo próprio?** Pede eixo próprio, como o `contra` da
sessão 3. As 9 chaves de `quando` são todas indexadas nos participantes de um ATAQUE (`atk`, `alvo`-de-golpe). A
cura não tem ataque: não há atacante nem alvo-de-golpe. Das 7 do grupo A, 5 têm condição e NENHUMA mapeia em
`quando`: paridade de turno (Hel), facção do CURADOR (Nefertem), tipo=regeneração (Cernunnos/Chaac), e a da
Brigid — "existe INIMIGO com Queimadura", que é estado de LADO, não `alvoDebuff` do alvo de um golpe. Terceiro
eixo: **`quandoCura`** (sessão 7 abre só `inimigoTem`; cresce por deus). Reusar `quando` repetiria o erro que a
sessão 3 corrigiu (misturar eixos de contexto diferentes num vocabulário só).

**Forma decidida: gatilho próprio `bonusCura`,** por três razões independentes — (1) caminho de valor diferente
(soma dentro de `curar`, não de `bonusDano`); (2) evento diferente (`cura`, não `dano`); (3) eixo de condição
disjunto (`quandoCura`). Um campo do bonusDano teria de carregar as três divergências — seria sobrecarga, não
economia. 7 membros é família povoada (mesmo porte de bonusDano/reducao), então não é over-engineering.

**Q2 — duas cláusulas, migração inteira.** +5 de dano ao time = `{bonusDano, v:5, escopo:'time'}` (o
`bonusDanoDeclarativo` já pulava unidade morta → some com a Brigid, idêntico ao hardcode). Cura condicional =
`{bonusCura, v:5, quandoCura:{inimigoTem:'queimadura'}}`. Caracterização Lote B (ambas, incl. o §39 "só inimigo")
verde SEM alteração; `grep key==='brigid'` vazio. Consumo de RNG: nenhuma das duas sorteia (§38, item RNG OK).

**Nota "permanente" (não-bloqueante).** A prosa da 1ª cláusula diz "+5 (permanente)". Li como "não expira por
turno" (contraste com buff temporário), NÃO "sobrevive à morte da Brigid" — o hardcode sempre exigiu Brigid viva
(igual a toda aura de time, ex.: thor −6), e a migração preserva isso. Se o dono quis dizer survives-death, é
mudança de comportamento (§39, prosa vence) — mas aí me avise, porque hoje diverge do implementado. **Placar
9→10/12.**

---

## 42. Propriedade TRANSVERSAL: um conceito que aparece mais como EFEITO de gatilho que como gatilho próprio tem família menor que o balde (F1.2)

Generalização do achado da sessão 8 (cura: balde 20, família 7, porque 9 eram cura-EMBRULHADA em outro gatilho).
Não é sobre cura — é sobre como contar famílias. **Quando um conceito aparece no texto dos kits mais como
PAYLOAD de um gatilho do que como o gatilho em si, a família própria dele é menor do que a varredura ingênua
sugere, e o resto pertence a `faz` (ou ao payload de outro gatilho).** Já aconteceu três vezes:
- **Cura:** 20 mencionam, 7 são `bonusCura`; 9 são `faz` heal (aoCair/porTurno/onHit). §41.
- **Contador (Cauda, Disco, Podridão…):** poucos são "o contador É a passiva"; a maioria é `faz:[{contador}]`
  disparado por turno/cadência (ra, kitsune). O contador é primitiva de payload, não gatilho.
- **Orbe:** ninguém tem "gatilho orbe"; orbe é sempre `faz:[{orbGain}]` de porTurno/abertura/aoCair (ganesha,
  zeus, inari).

**Consequência para a varredura:** ao fechar um eixo, separar SEMPRE "quantos têm isto como o gatilho" de
"quantos têm isto como efeito embrulhado". O segundo grupo não dimensiona o gatilho — dimensiona o vocabulário
de `faz`. Contar os dois juntos infla o gatilho e esconde que o trabalho real está no wrapper. É por que a
sessão 4 registrou "o gatilho de turno EMBRULHA um efeito": o wrapper é onde mora a alavanca, não o escalar.

---

## 43. `aCadaN` — cadência ABSOLUTA com payload POLIMÓRFICO (faz OU custoGratis); a Cuca não é `faz:[fx]` (F1.2, sessão 9)

Migração da Cuca (deus inteiro: imunidade + aCadaN). Varredura dos quatro da família (inari, kitsune, cuca,
boto), nos DOIS eixos que o dono pediu.

**Eixo A — n ABSOLUTO ou RELATIVO? Todos ABSOLUTOS. Fechado absoluto.** Os quatro dizem "a cada N turnos" sem
NENHUMA linguagem relativa ("desde que entrou", "após o último uso"). Três provas convergentes: (1) a Cuca é
`st.turno % 3` no motor (confirmado); (2) a prosa é uniforme, sem cláusula relativa; (3) num 3v3 todos entram no
turno 1 (não há entrada em campo no meio — invocações são unidades `__inv` à parte), então "desde a entrada" ≡
absoluto por construção. A dúvida que o docs tinha anotado (kitsune/boto poderiam ser relativos) NÃO se
materializa no texto. `turno % n === 0`, `n` absoluto sobre o contador global de rodadas (`st.turno`).

**A prova (3) é ESTRUTURAL e vale para QUALQUER dúvida futura de cadência (registrar).** As provas (1) e (2) são
leitura de código e de prosa — evidência, mas contestável (um kit futuro pode ter prosa relativa). A (3) fecha a
questão de um jeito que nenhuma leitura fecharia: **num 3v3 sem entrada em campo no meio da partida, "desde a
entrada" e "absoluto desde o turno 1" são o MESMO ponto de partida para todos — coincidem por construção, não por
coincidência.** Relativo-vs-absoluto só pode DIVERGIR se (a) unidades entrarem em turnos diferentes, ou (b) a
cadência puder ser pausada/pulada (morto/silenciado quando deveria disparar). Enquanto nenhuma das duas existir,
a distinção é vazia e absoluto é a única forma. Quando uma delas entrar (invocações que contam cadência própria;
uma cadência que pula turno morto), aí sim relativo passa a ser um comportamento distinto — e é o gatilho de
`n` que terá de dizer qual. Antes disso, não inventar o eixo.

**Eixo B — o que cada um FAZ? 3 são `faz:[fx]`, a Cuca é a EXCEÇÃO.** Inari (orbGain), Kitsune (contador Cauda),
Boto (apply Inalvejável self) são efeitos disparados — `faz`, o mesmo molde do porTurno. **A Cuca não:** "Básico
de graça" é MODIFICAÇÃO DE CUSTO que vale no turno, lida em `acoesDe` no momento da ação — não é um efeito que
dispara e altera estado. É exatamente o que o dono previu no ponto 3: forçar a Cuca no molde `faz:[fx]` seria
inventar um "fx que não faz nada mas muda custo". Não forcei.

**Forma: `aCadaN` é UM gatilho (cadência `n` absoluta) com payload POLIMÓRFICO** — `faz` (efeito, para os 3
futuros) XOR `custoGratis` (modificação de custo, para a Cuca). A cadência é genuinamente compartilhada pelos
quatro; só o payload varia. Um gatilho separado só para a Cuca DUPLICARIA a lógica de cadência. O validador
exige EXATAMENTE um payload (nunca os dois, nunca nenhum). `custoGratis: { slot }` zera o custo daquele slot; a
Cuca é `{ n:3, custoGratis:{ slot:'basico' } }`. Esta sessão implementa `n` + `custoGratis` (o que a Cuca usa);
o payload `faz` de aCadaN entra quando inari/kitsune/boto migrarem (reusa `rodarFaz` sob a guarda de cadência).
Nota: `aCadaN` com n=1 seria o porTurno; o validador recusa n<2 para não haver duas formas do mesmo gatilho.

**Migração inteira:** imunidade (`a:['adormecido']`, some o hardcode do `aplicar`) + aCadaN (some o hardcode do
`acoesDe`). Caracterização Lote B (imune a Dormir só a Cuca; Básico grátis no turno 3, custa no turno 4, só o
Básico, só a Cuca) verde SEM alteração; `grep key==='cuca'` vazio; suíte inteira verde. RNG: nenhuma sorteia
(§38). **Placar 10→11/12.** Falta 1: hera (`reativa`).

---

## 44. `reativa` é BALDE, não gatilho — família de 6 ganchos por EVENTO; só `aoCurar` (Hera) agora (F1.2, sessão 10)

Última migração da F1.2 (fecha 12/12). O dono suspeitava que "reativa" fosse balde por ser NOME DE CATEGORIA,
não de mecanismo — confirmado. As 10 "reativas" da varredura original classificadas por GATILHO REAL (reage a
QUÊ, e onde no motor):

| deus | reage a | gatilho real | onde |
|---|---|---|---|
| Zeus | morte de inimigo | **aoCair** quem:inimigo | `matar` — **JÁ FEITO (sessão 6)** |
| Erínias | morte de aliado | aoCair quem:aliado | `matar` (futuro) |
| Ymir | própria morte | aoCair quem:self | `matar` (futuro) |
| Nüwa | morte de aliado | aoCair quem:aliado | `matar` (futuro) |
| **Hera** | **cura de aliado** | **aoCurar** | `curar` — **esta sessão** |
| Bragi | uso de Milagre por aliado | aoUsarHabilidade | resolução de ação (futuro) |
| Khonshu | controle iminente em aliado | aoReceberControle (anula 1×) | `aplicar` (futuro) |
| Boitatá | ser atingida (Chama) | aoSerAtingido | `bater` recebido (futuro) |
| Xangô | aliado ser atingido | aoSerAtingido | `bater` recebido (futuro) |
| Cernunnos | próprio ataque | aoAtacar | `bater` desferido (futuro) |

**"reativa" = 6 ganchos distintos, cada um num lugar diferente do motor** (aoCair, aoCurar, aoUsarHabilidade,
aoReceberControle, aoSerAtingido, aoAtacar). NÃO é um gatilho — é uma FAMÍLIA de gatilhos, como o dono previu.
E **4 das 10 nem são novas**: são `aoCair` (morte), o gatilho da sessão 6 — só faltam sujeitos (`aliado`/`self`).
Como nos sujeitos do aoCair, abro só o da Hera agora e deixo cada gancho para o deus dele. Sexto balde que a
varredura do conjunto corrige (§37): "reativa" contava 10, mas o gatilho novo desta sessão cobre **1**.

**bonusCura vs aoCurar — dois mecanismos, confirmado.** `bonusCura` (sessão 8) MODIFICA a magnitude da cura
(soma `+v` dentro de `curar`, antes do clamp). `aoCurar` DISPARA um efeito DEPOIS da cura (Hera: escudo +10),
independente de quanto curou. Posição no código diferente, evento diferente (`escudo` ≠ `cura`), semântica de
valor diferente. Não são o mesmo eixo.

**A Hera CABE como `faz` de `aoCurar` — é o gêmeo do `aoCair`, com UMA generalização.** Estruturalmente idêntico:
um evento entrega um SUJEITO e roda um `faz` nele. Mas o `aoCair` teve sorte — lá o reator É o dono (zeus ganha
orbe: dono=reator=alvo do efeito). Na Hera o efeito cai no CURADO (o sujeito do evento), que NÃO é o dono (a
Hera). Duas consequências que forçaram generalizar o `rodarFaz`: (1) o `faz` roda numa unidade ≠ dono (o curado);
(2) o evento tem de ser creditado ao DONO (`passiva:'hera'`) mesmo aplicando no curado — então `rodarFaz` ganhou
um `tagKey` opcional (default = a própria unidade; só o aoCurar o usa). Com isso, a Hera é
`{gatilho:'aoCurar', faz:[{t:'shield', v:10}]}` — sem mecanismo especial, só `faz` rodando no sujeito do evento.
`shield` entrou em `V.fxTurno` (é turno-seguro; o alvo é o sujeito do evento, não escolha do jogador). O
seletor "sujeito do evento" é implícito ao gatilho (como o reator do aoCair), não um campo `alvo`.

**Migração:** hardcode da Hera sai do `curar`. Caracterização Lote A (curado ganha EXATAMENTE 10 de escudo; só
o curado, não os outros nem a Hera; nada com a Hera morta) + o teste de capacidades (escudo nos 3, Ogum zera)
verdes SEM alteração; `grep key==='hera'` vazio; suíte inteira verde. RNG: nenhuma sorteia (§38). **Placar
11→12/12. A F1.2 FECHA:** as 12 passivas dos deuses implementados são 100% declarativas, zero `if (u.key===...)`
no motor. Restam ganchos abertos para deuses ainda não implementados (os 5 reativos futuros, sujeitos do aoCair,
`heal`/`apply` em `faz`, `aCadaN.faz`), mas nenhum deus implementado carrega hardcode de passiva.

**DISCIPLINA (dono, registrar): antes de criar um gatilho novo, TESTE se um existente serve com generalização
MÍNIMA — e se servir, generalize em vez de duplicar.** A Hera parecia pedir mecanismo próprio ("reage a cura,
dá escudo"); a pergunta certa não foi "que gatilho novo?" e sim "o `aoCair` (evento→sujeito→faz) serve?". Serve,
com duas linhas: o `faz` roda num sujeito ≠ dono, e o crédito vai no dono (`tagKey`). Reconhecer que a máquina
existente cobre o caso com ajuste pequeno é MAIS DIFÍCIL que construir algo próprio — construir é a saída
confortável (código novo, nome novo, sensação de progresso), mas cada gatilho novo é vocabulário que alguém tem
de manter e que pode divergir. A ordem: (1) mapear o caso ao gatilho mais próximo; (2) medir a generalização que
faltaria; (3) se for pequena e não borrar o significado do gatilho, generalizar; (4) só criar gatilho novo quando
a generalização mínima já distorceria o existente (foi o caso do `bonusCura` vs `bonusDano`: eixo, evento e
caminho de valor todos diferentes — aí duplicar seria errado, e criar é o certo). O `tagKey` da Hera é o exemplo
de (3); o `bonusCura` é o exemplo de (4). A disciplina é saber em qual dos dois se está.

---

## 45. `estado` é CAMPO UNIVERSAL (composa com o eixo), não 4º eixo — decidido PELOS DADOS (F1.2.5 s3)

A pergunta de forma tinha resposta EMPÍRICA, e por pouco não foi decidida por elegância antes da varredura:
`quando`/`contra`/`quandoCura` são eixos de UM gatilho cada (só-um-por-fx). O eixo de estado é transversal a
vários gatilhos — dúvida: 4º eixo irmão, ou campo que qualquer gatilho aceita ALÉM do seu eixo?

**Decidido pelos dados: campo universal.** A varredura achou TRÊS passivas que condicionam no GOLPE E no ESTADO
ao mesmo tempo — Bastet, Saci, Mnevis, todas o composto "primeiro ataque de alvo único por turno" (`alcance`
[golpe] + `primeiroPorTurno` [estado]). Um 4º eixo (só-um-por-fx) não expressaria isso; um campo universal
composa `contra:{alcance}` E `estado:{primeiroPorTurno}` no mesmo fx. Regra do dono: se ≥1 deus precisa das duas
juntas, a resposta é campo universal e a decisão está tomada — não por gosto. **A forma reflete a NATUREZA:**
transversal → campo ortogonal, não item na lista dos três. `estado` é permitido em TODO gatilho (no validador,
entra no conjunto base junto com `gatilho`), e cada gatilho compõe (AND) o seu eixo com ele.

**5 condições de LEITURA PURA abertas** (o motor só LÊ contra o dono do fx): `paridade` (turno%2, Hel), `fase`
(Dia/Noite — Amaterasu/Boto/Lugh/Itzamná), `aliadosVivos` {op,n} (Guan Yu), `contador` {nome,op,n} (Kitsune),
`hpProprio` {op,v} (Shuten). Composição provada no sintético: `contra:{classe}` + `estado:{paridade}` dispara SÓ
com as duas, falha nos 3 outros casos — a garantia que justifica campo universal em vez de 4º eixo.

**`fase` MIGROU do `quando` para o `estado`.** Ela entrou no `quando` na sessão 1 por ser o único eixo que
existia, não porque pertencia lá — fase é estado-de-campo, não propriedade do ataque. Migração completa, sem
retrocompatibilidade (custo real zero: só o Lugh a usa, não implementado); o validador RECUSA `quando:{fase}`
apontando para `estado:{fase}`, p/ quem escrever kit não errar por memória. Duas casas para a mesma condição é
semente de confusão.

**`primeiroPorTurno` RESERVADO** (recusado em voz alta) — as outras condições o motor LÊ; essa exige RASTREIO
(flag por-unidade resetado por turno). Misturar leitura e bookkeeping seria como forçar o `custoGratis` da Cuca
no `faz` (§43). **E os três donos dela (bastet/saci/mnevis) não são uma condição faltante — são TRÊS mecanismos:**
Bastet REDUZ, Saci ESQUIVA (o golpe falha), Mnevis INTERCEPTA. A sessão deles não é "abrir primeiroPorTurno" — é
esquiva + intercepta, com o `primeiro` como condição COMPARTILHADA. Registrado assim para a próxima varredura não
contar "falta 1 condição" quando faltam 3 mecanismos.

---

## 46. Sequenciamento: fase de EXTENSÃO por flip, fase de MECANISMO por BLOCO (F1.2.5 → F1.3+)

A F1.2.5 sequenciou por DESTRAVE (flip): as 3 extensões flipavam deuses baratos, e a curva do VERDE subia. Na
fase de MECANISMOS o critério INVERTE, e a re-triagem prova por quê: os topos do ranking têm **flip ZERO** —
execucao-hp trava 7 e não deixa NENHUM deus jogável sozinho, porque os deuses de morte são multi-gancho. Sequenciar
por flip aqui não produziria deus jogável nenhum até o fim do bloco. **Regra: fase de EXTENSÃO (gancho é uma chave
a mais num gatilho existente) sequencia-se por flip; fase de MECANISMO (gancho é subsistema novo) sequencia-se por
BLOCO — F1.3 morte inteira, F1.4 controle inteira — e os flips chegam no FIM do bloco.** E o topo do ranking (bonusDano-
escala, trava 10) é o mais provável BALDE (4 fontes de N): sequenciar pelo 10 cru repetiria as 3 projeções erradas.

**Passo 0 (os flips baratos que sobraram antes dos blocos) — a varredura reduziu de 4 para 2 fecháveis sem dúvida:**
- **aoUsarHabilidade** — FECHÁVEL. bragi/brahma/shiva, todos "quando um aliado usa um Milagre", payload = faz existente. Feito.
- **sinergia-nomeada** — CONFIRMADO que NÃO é gatilho, é CONDIÇÃO: "com Fulano no time" é um read de roster (`estado.aliadoPresente`)
  que compõe com efeitos existentes. Dissolveu do ranking. Feito (odin "2+ Nórdicos" é variante faccao-count, futura).
- **aoSerAtingido — DÚVIDA (separado).** medusa "quem a atinge com Física recebe Veneno" aplica um DEBUFF no ATACANTE —
  fura a garantia faz-BUFF (§F1.2.5 s1). E é mini-balde: medusa (self-atingido, debuff no atacante) ≠ xango (aliado-atingido,
  contador em si). Dois eixos de variação. Não forçar; entra com a decisão sobre "hook reativo pode aplicar debuff no sujeito".
- **bonusCura-cond-nova — DÚVIDA (separado).** Precisa de RASTREIO novo, não de chave: nefertem (facção do CURADOR — `curar`
  não sabe quem curou) e cernunnos/chaac (tipo=regeneração — `curar` não sabe a FONTE do heal). Duas formas, ambas exigindo
  passar contexto novo ao `curar`. Não é "mais uma chave de quandoCura".
- **marca-vulnerabilidade — DÚVIDA (separado).** O "5" é EMARANHADO: mistura o EFEITO de-receber-mais (aquiles sofre +10,
  durga/erinias aplicam via habilidade) com bonusDano-OFENSIVO-vs-marcado (horus "+8 contra marcados" = precisa do `alvoMarca`
  reservado, coisa diferente). Não é um mecanismo só — varrer separando o efeito-vulnerável do alvoMarca antes de fechar.

**LIÇÃO (par, uma coisa só): o NOME do gancho não é evidência sobre TAMANHO nem sobre NATUREZA, em nenhuma direção.**
São a mesma armadilha em sentidos opostos: (a) balde — o nome sugere 1 mecanismo e são vários (reducao-cond 3-6,
faz-vocab, "escala 10"); (b) o reverso — o nome sugere extensão barata e é mecanismo (aoSerAtingido/bonusCura-cond/
marca-vuln do Passo 0). Nos dois casos, a contagem do gancho e a suposição de "é só mais uma chave" vêm do rótulo,
não da coisa. O antídoto é o mesmo: varrer a FAMÍLIA antes de fechar, e só flipar quando fecha sem dúvida — o critério
testável "família varrida + vocabulário fechável sem dúvida", nunca o nome.

**ENDEREÇO das três dúvidas (dono — vão para dentro dos blocos, não viram sessão própria):**
- **aoSerAtingido → F1.4 (controle).** A pergunta que levanta ("hook reativo pode aplicar debuff no atacante?") é de
  vocabulário de controle/aflição (Medusa aplica Veneno), e os reativos vizinhos (esquiva do Saci, intercepta do Mnevis)
  já estão marcados p/ lá. Uma decisão em vez de três.
- **bonusCura-cond-nova → DEPOIS dos dois blocos.** Precisa de contexto novo no `curar` (quem curou, qual a fonte);
  nenhum bloco depende dela; não trava deus de morte nem de controle.
- **marca-vulnerabilidade → varre junto do Horus.** Emaranhada com `alvoMarca` (condição ofensiva reservada desde a
  sessão 1); separar o efeito-vulnerável do alvoMarca só faz sentido com o dono na mão.

---

## Decisões ainda ABERTAS

| Assunto | Situação |
|---|---|
| **~15 decisões dos 3 blocos (da varredura, §35)** | Decisão-mãe BATIDA (§36: passiva declarativa = F1.2). Faltam ~15 pontos, para o dono responder EM BLOCO (uma mensagem), com recomendação minha em cada: Bloco 1 (F1.3) morte/sobrevivência — piso-1-HP, execução HP/status/tempo, interações com revive-imune/`vidaExtra`; Bloco 2 (F1.4) controle — Selado≡Silenciado, Pacificar, Torpor, Medo, trava-Milagre, redirecionar; Bloco 3 (F1.5) modos/estado — escolha múltipla, alterna, ler Dia/Noite, invocações. Ver `docs/primitivas-faltantes.md`. |
| **`aoCair` — matador-bound vs qualquer-morte (F1.2)** | `quem:'inimigo'` (matador-bound: zeus, feito na sessão 6) e `quem:'self'` (auto-reativo: nezha, feito na sessão 7) estão abertos. Falta decidir ao migrar morrigan/iansa/ahpuch: 3 passivas dizem "quando um inimigo é derrotado, [eu] X" SEM dizer se o reator precisa ser o matador ou se vale QUALQUER morte de inimigo — e hades é explicitamente "qualquer". `quem:'inimigo'` (matador) vs um `quem:'qualquerInimigo'` (qualquer morte); `quem:'aliado'` também ainda não aberto. |
| **Nome dos elementos** | O design visual do dono usa Solar/Lunar/Vital/Caos/Vazio/Tempestade; a planilha usa Tempestade/Umbra/Maré/Aurora/Chama/Verdejante. Renomear é trivial no dado mas quebra ganchos: Maré aplica Encharcado, Chama aplica Queimadura, Aurora e Umbra ativam Dia e Noite. ~60 habilidades a retraduzir. |
| **Pick/ban** | Recomendado com força, ainda não desenhado. Sem ele o meta converge para 8 deuses e o gacha perde razão de existir. |
| **Passiva do Fujin** | Ou Raijin entra nos iniciais, ou Fujin ganha passiva autônoma. |
| **Dilúvio do Sobek** | 30 em área contra Encharcados, contra teto de 22. Condicional e o próprio Sobek precisa aplicar antes — único número acima do orçamento. |

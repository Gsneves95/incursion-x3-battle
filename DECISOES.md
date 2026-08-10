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

## Decisões ainda ABERTAS

| Assunto | Situação |
|---|---|
| **Nome dos elementos** | O design visual do dono usa Solar/Lunar/Vital/Caos/Vazio/Tempestade; a planilha usa Tempestade/Umbra/Maré/Aurora/Chama/Verdejante. Renomear é trivial no dado mas quebra ganchos: Maré aplica Encharcado, Chama aplica Queimadura, Aurora e Umbra ativam Dia e Noite. ~60 habilidades a retraduzir. |
| **Pick/ban** | Recomendado com força, ainda não desenhado. Sem ele o meta converge para 8 deuses e o gacha perde razão de existir. |
| **Passiva do Fujin** | Ou Raijin entra nos iniciais, ou Fujin ganha passiva autônoma. |
| **Dilúvio do Sobek** | 30 em área contra Encharcados, contra teto de 22. Condicional e o próprio Sobek precisa aplicar antes — único número acima do orçamento. |

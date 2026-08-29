# Teste de usabilidade — o portão da Fase 3

**Por que este teste existe.** Todas as decisões de interface deste projeto foram tomadas por ARGUMENTO. São coerentes entre si, mas NENHUMA foi validada por alguém tentando jogar sem explicação. Um argumento bom prova que a decisão é consistente — não que ela é DESCOBERTA por quem nunca viu o jogo. Este teste é o único instrumento que mede isso.

O jogo é a fonte da verdade sobre si mesmo. Você não. O objetivo não é confirmar que o design está certo — é achar onde ele está errado enquanto ainda é barato consertar.

---

## O método

1. **Uma pessoa que nunca viu o jogo.** Idealmente 3–5 pessoas, uma de cada vez. Não precisa ser jogador de jogos — o público-alvo inclui quem não é.
2. **O aparelho na horizontal, com o dist recém-buildado, perfil zerado** (o boot cai na home). Entregue o celular destravado na home e diga uma frase só: *"É um jogo. Joga."* Depois **fique calado.**
3. **Grave a tela e o áudio** se a pessoa deixar. Se não, anote à mão com horário (o QUANDO da confusão importa tanto quanto o QUÊ).
4. **~15–20 minutos por pessoa.** Deixe a pessoa parar quando quiser. Onde ela para por conta própria é dado.

### O que NÃO dizer — a regra mais difícil

O silêncio é o experimento. Cada frase sua contamina o resultado — vira um jogo com um tutor ao lado, que não é o produto.

- **Não explique nada.** Nem "toca aqui", nem "isso é a energia", nem "você tem uma Defesa".
- **Não corrija.** Se a pessoa faz "errado" e o jogo deixa, o errado é dado — pode ser o design que está errado, não ela.
- **Não responda "o que eu faço?".** Devolva: *"o que você acha que faz?"* e espere. A pergunta dela já é o achado.
- **Não aponte, não gesticule, não faça "hmm".** Um olhar para o canto certo da tela é uma dica.
- **Não resgate quem travou.** O tempo travado é a medida da falha. Só intervenha se a pessoa for DESISTIR de vez — e aí a intervenção é encerrar, não ensinar.
- **Depois, sim, pergunte** — mas só depois: "o que você achou que era isso?", "o que você esperava que acontecesse?", "em algum momento você ficou perdido?". Perguntas abertas, nunca "não ficou claro que X?".

### O que observar (comportamento, não opinião)

Opinião ("achei bonito") não vale; comportamento vale. Anote:

- **Onde toca PRIMEIRO** na home, e por quê você acha que ali.
- **Hesitações** (>3s parado olhando sem tocar) e ONDE.
- **Toques que não fazem o que a pessoa esperava** (a cara muda) — e o que ela esperava.
- **Toques repetidos no mesmo lugar** (sinal de "não respondeu como eu queria").
- **O que ela LÊ em voz alta vs o que ignora** (o texto que ninguém lê é texto morto).
- **Onde ela TRAVA** (não sabe o próximo passo) e por quanto tempo.
- **Se ela entende POR QUE perdeu** — a reação à tela de derrota é o teste mais direto de uma decisão nossa.
- **Onde ela SORRI ou relaxa** (a afordância que funcionou).

---

## As decisões de interface em risco (o que cada uma pode ter de errado)

Cada item abaixo é uma decisão tomada por argumento. A coluna "sinal de FALHA" é o que, se acontecer, prova que o argumento não bastou.

### 1. "Tocar nunca gasta" — o primeiro toque numa habilidade só MOSTRA; o gasto é no alvo/confirmar
- **A aposta:** o jogador explora as habilidades sem medo porque tocar é seguro.
- **Sinal de FALHA:** a pessoa NÃO toca em nada por medo de "gastar"; ou toca, acha que gastou, e fica confusa; ou nunca descobre o custo antes de agir. Se ninguém toca para ler, a segurança do toque é invisível — e invisível é como não existir.
- **Observe:** ela toca numa habilidade só para ver o que é? Ou só toca quando já "decidiu"?

### 2. Um toque lê o kit · dois toques adicionam (seleção de time / montador)
- **A aposta:** a distinção 1-toque/2-toques é aprendível.
- **Sinal de FALHA:** a pessoa toca uma vez esperando adicionar e nada "acontece" (o kit abre, mas ela queria selecionar); ou faz duplo-toque sem querer. Se ela não monta um time de 3 em <1min, a distinção falhou.

### 3. De onde vem a ENERGIA (1 por unidade viva/turno, só dos elementos do seu time)
- **A aposta:** o topo mostrando só os elementos que interessam é legível.
- **Sinal de FALHA:** a pessoa tenta usar uma habilidade e não entende por que não pode ("cadê minha energia?"); ou não relaciona perder uma unidade com perder economia. O custo em pílulas com contorno vermelho (não tenho) é lido? ou ignorado?

### 4. A DEFESA universal (toda unidade tem; 1 livre, recarga 4, Invulnerável 1 turno)
- **A aposta:** o jogador descobre a Defesa e a usa na hora do perigo.
- **Sinal de FALHA:** a pessoa nunca usa a Defesa a jogo inteiro (não descobriu que existe / não entendeu quando serve); ou usa e não entende que ficou Invulnerável. A campanha (encontro 3) EXISTE para ensinar isto — se mesmo lá a pessoa não usa, o ensino não pegou.

### 5. Consultar as habilidades do INIMIGO (a aba estreita ao lado do retrato) e ler RECARGA
- **A aposta:** o jogador abre a aba do inimigo e lê o que ele pode fazer.
- **Sinal de FALHA:** a pessoa nunca abre a aba (não viu a alça / não imaginou que dá para espiar); joga "às cegas" sem ler o oponente. Leitura do jogo é um pilar do design — se ninguém consulta, o pilar é decorativo.

### 6. A CONDIÇÃO da Provação visível DURANTE (o HUD: prazo + o que manter/fazer)
- **A aposta:** o jogador percebe que a Provação é mais que "mate os três" e acompanha a condição pelo HUD.
- **Sinal de FALHA:** a pessoa joga como partida normal, ignora o HUD, e é SURPREENDIDA pela derrota-por-condição ("por que eu perdi? matei geral"). Se a condição só aparece na tela de derrota, ela chegou tarde.

### 7. As TRÊS derrotas (HP · prazo · condição) — mensagens distintas
- **A aposta:** a pessoa entende POR QUE perdeu.
- **Sinal de FALHA:** depois de perder, a pessoa não sabe dizer o motivo, ou dá o motivo errado. Este é o teste mais limpo de uma decisão nossa: a mensagem ou ensina, ou não.

### 8. O PLACAR (lances contra o mínimo do solucionador)
- **A aposta:** "concluída em N · melhor conhecido M" motiva a refazer melhor.
- **Sinal de FALHA:** a pessoa não entende o que é "lance" nem "melhor conhecido", ou não liga. Risco menor (é reforço, não bloqueio), mas se confunde, tira do momento de vitória.

### 9. A HOME — 5 destinos, paisagem, não rola, sem hover, alvo de toque grande
- **A aposta:** os 5 cartões são autoexplicativos; disponível vs "em breve" vs PvP-indisponível se distingue.
- **Sinal de FALHA:** a pessoa toca no PvP (morto) e não entende por que nada acontece; ou tenta rolar a home; ou não sabe por onde começar (não há seta para a Campanha, que é onde deveria começar). **Risco alto:** a home é a primeira tela e a única sem um argumento de "onde ir primeiro" embutido.

### 10. Onde começar — a Campanha é o tutorial, mas nada diz isso
- **A aposta:** o jogador vai à Campanha primeiro e aprende as regras lá.
- **Sinal de FALHA:** a pessoa vai direto para Provações (o cartão em destaque) sem saber jogar, apanha, e desiste antes de descobrir a Campanha. **Este é o risco de produto mais sério da fase:** o destaque visual está na Provações, mas a porta de entrada CERTA é a Campanha. Observe qual cartão atrai o primeiro toque.

### 11. INVOCAÇÃO — odds visíveis, pity (X/60), repetido→Essência
- **A aposta:** as chances e o pity são compreendidos antes de gastar.
- **Sinal de FALHA:** a pessoa não entende o pity ("o que é esse 0/60?"), ou não entende por que um repetido virou "✦" em vez de um deus novo. A Essência aparece na carteira sem explicação — ela sabe o que é?

### 12. COLEÇÃO — panteões, maestria (pip por nível), "domina X/100"
- **A aposta:** o agregado e os níveis comunicam progressão de longo prazo.
- **Sinal de FALHA:** o pip de nível no ladrilho não é lido / não se entende; "domina 0/100" no começo desanima em vez de convidar; a trilha Iniciado→Mestre no detalhe não é compreendida (o que é a "condição de kit"?).

### 13. DESAFIOS — validação de time AO MONTAR ("know before you lose")
- **A aposta:** o jogador entende, enquanto monta, POR QUE o time não serve, e corrige.
- **Sinal de FALHA:** a pessoa vê "Começar" apagado e não relaciona com a mensagem "✕ precisam ser do mesmo elemento"; fica travada sem saber o que consertar. O texto da regra é lido ANTES de montar, ou ignorado?

---

## Como registrar e o que fazer com o resultado

- **Uma linha por travamento:** [pessoa] [minuto] [tela] "o que ela tentou" → "o que esperava" → "quanto tempo travou".
- **Marque cada decisão 1–13** como: **passou** (descoberta sozinha), **passou com custo** (descoberta após tentativa e erro visível), ou **falhou** (nunca descoberta / entendida errada).
- **Uma decisão que falha em 2+ pessoas não é azar — é a interface.** Volta para a mesa de design como mudança, não como "explicar melhor" (não há tutor no produto).
- **Priorize pelo custo de quem trava:** o que faz a pessoa DESISTIR (itens 4, 6, 10) vem antes do que só confunde por um instante (itens 8, 11).

**A pergunta que o teste responde:** dessas 13 decisões tomadas por argumento, quais sobrevivem ao contato com alguém que nunca ouviu o argumento? As que não sobreviverem eram coerentes e erradas — e este é o único jeito de saber quais.

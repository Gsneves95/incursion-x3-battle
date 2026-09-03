# Testar no celular, com gente de verdade (rede local)

Este guia é para testar o jogo **completo** — inclusive PvP, ranque e missões — em celulares de
verdade, na **sua rede Wi-Fi de casa**. Não precisa de provedor de hospedagem nem de nada na internet.
O seu computador vira o servidor; os celulares se conectam a ele pela Wi-Fi.

> **Por que isto é preciso:** o link do GitHub Pages serve só o **cliente** (as telas). O **servidor**
> (que roda o PvP, o ranque e as missões) roda na **sua máquina**, com `npm run serve`. O Pages não roda
> servidor. Então, para testar PvP de verdade, todo mundo abre o jogo **pela sua máquina**, não pelo Pages.

Você **não vai editar nenhum código**. O cliente acha o servidor sozinho.

---

## Antes de começar (uma vez)

1. Instale o **Node.js** (site oficial nodejs.org, versão LTS). É o que roda o servidor.
2. Baixe este projeto no computador (o repositório).
3. Abra o **Terminal** (Mac) ou o **Prompt de Comando / PowerShell** (Windows), entre na pasta do
   projeto e rode uma vez:
   ```
   npm install
   ```
4. **Todos os aparelhos — o seu computador e os celulares — têm de estar na MESMA Wi-Fi.** Não pode ser
   um no Wi-Fi e outro no 4G. Não pode ser a "rede de convidados" (ela costuma isolar os aparelhos).

---

## O roteiro de teste (siga na ordem)

### Passo 1 — Subir o servidor

Na pasta do projeto, rode:
```
npm run serve
```
Ele monta o jogo e sobe o servidor. Quando terminar, ele **imprime o endereço** — algo assim:

```
[incursion] servidor no ar · protocolo v1 · motor autoritativo (src/engine.js)
  neste computador:   http://localhost:8788

  NOS CELULARES (mesma rede Wi-Fi), abra o navegador e digite:
      http://192.168.0.15:8788
  (o WebSocket usa o mesmo endereço — o cliente acha o servidor sozinho.)
```

**Anote o endereço da linha "NOS CELULARES"** (no exemplo, `http://192.168.0.15:8788`). É esse que
todo mundo vai digitar. **Deixe essa janela do Terminal aberta** — se fechar, o servidor cai.

> Se aparecerem **vários endereços**, tente o primeiro; se não conectar, tente o próximo (o computador
> pode ter mais de uma placa de rede).

### Passo 2 — Descobrir o endereço por conta própria (se precisar)

O servidor já mostra o endereço no Passo 1. Se quiser confirmar à mão:

- **Windows** — no Prompt de Comando, digite:
  ```
  ipconfig
  ```
  Procure a linha **"Endereço IPv4"** (ou "IPv4 Address") na sua conexão Wi-Fi. É algo como
  `192.168.0.15`. O endereço do jogo é `http://` + esse número + `:8788`.

- **Mac** — no Terminal, digite:
  ```
  ipconfig getifaddr en0
  ```
  Ele responde o número (ex.: `192.168.0.15`). Se não responder nada, tente `en1` no lugar de `en0`
  (às vezes o Wi-Fi é a outra placa):
  ```
  ipconfig getifaddr en1
  ```
  O endereço do jogo é `http://` + esse número + `:8788`.

> Quase sempre começa com `192.168.` ou `10.` — é um endereço **da sua casa**, não da internet.

### Passo 3 — Abrir em cada celular

Em **cada** celular (o seu e os das três pessoas que você chamou):

1. Abra o **navegador** (Chrome, Safari…).
2. Digite o endereço **exatamente** como o Passo 1 mostrou: `http://192.168.0.15:8788` (com o seu
   número). **Sem `www`, sem `https`** — é `http` e tem `:8788` no fim.
3. Na primeira vez, o jogo pergunta a **faixa de idade** (menor / maior de 18). Isso cria a conta —
   **não há login, não há senha**.

Se aparecer o jogo, funcionou. Se der "não foi possível conectar", veja **"Quando dá errado"** abaixo.

### Passo 4 — Parear duas pessoas no PvP

O PvP junta **duas** pessoas de cada vez. Para uma partida entre a Pessoa A e a Pessoa B:

1. Nos dois celulares, toque no cartão **PvP** na tela inicial.
2. Cada um escreve um **apelido** (3 a 16 letras) — só na primeira vez.
3. Cada um monta um **time de 3 deuses** (toque nos deuses; toque de novo para tirar). Conta nova já
   vem com **9 deuses iniciais**, então dá para montar na hora.
4. A **Pessoa A** toca **"Entrar na fila"**. A tela dela mostra **"Na fila… aguardando um oponente"**.
5. A **Pessoa B** toca **"Entrar na fila"**. **Nesse instante os dois são pareados** e a batalha começa
   nos dois aparelhos ao mesmo tempo.
6. Joguem a partida normalmente. É **um por vez** — quando é a vez do outro, a sua tela diz "aguarde".

Para testar **ranque**, façam o mesmo tocando em **"Ranqueado"** em vez de "Entrar na fila". Ao fim,
cada um vê a **mudança de faixa** (subiu/desceu, pontos).

Com **três pessoas**, dois entram na fila e pareiam; o terceiro entra na fila e **espera** até um dos
dois terminar e entrar de novo — a fila junta quem estiver esperando. Rodízio: A×B jogam, C espera; quem
perder chama o C para a próxima.

### Passo 5 — Como saber que funcionou

Confira, na ordem:

- [ ] **Conectou:** o jogo abriu nos celulares pelo endereço (não a tela de "sem conexão").
- [ ] **PvP pareou:** os dois entraram na fila e a **batalha começou nos dois ao mesmo tempo**, cada um
      vendo o próprio time embaixo e o do oponente em cima.
- [ ] **A jogada de um aparece no outro:** quando A age, o B vê o resultado (é o servidor que manda).
- [ ] **O fim é do servidor:** quem venceu vê "VOCÊ VENCE", quem perdeu vê o contrário — ninguém declara
      isso sozinho.
- [ ] **Ranqueado mexe na faixa:** ao fim de uma partida ranqueada, aparece a mudança de pontos/faixa.
- [ ] **Missões contam:** depois de vencer no PvP, abra **Missões** — o contador do panteão que você
      jogou subiu (ex.: "1/40 vitórias gregas"). Sem servidor a tela de Missões diz "conecte para ver".
- [ ] **Reconexão:** no meio de uma partida, bloqueie e desbloqueie o celular (ou troque de aba e volte).
      A partida **volta no ponto** — o relógio correu enquanto você estava fora (não dá para "pausar"
      saindo).

Se todos os itens bateram, o teste passou.

---

## Quando dá errado (os casos chatos)

**O celular saiu da Wi-Fi (foi para o 4G).** Ele para de achar o servidor — o endereço `192.168.x.x` só
existe dentro da sua casa. O jogo cai no **modo offline** (dá para ver a coleção, mas não PvP/ranque/
missões). **Conserto:** volte para a Wi-Fi de casa e **recarregue a página**. Se estava no meio de uma
partida, ao voltar ela **retoma** (mas o relógio correu na ausência — pode ter perdido por abandono se
demorou).

**O endereço mudou depois de reiniciar o roteador.** O número `192.168.x.x` pode mudar quando o roteador
reinicia ou de um dia para o outro. Se os celulares pararem de conectar, **olhe de novo a janela do
Terminal** (ou rode `ipconfig`/`ipconfig getifaddr en0`) e **digite o novo endereço** nos celulares.
Nada de código muda — só o endereço.

**Um celular abre mas não conecta (fica offline mesmo na Wi-Fi).** Causas comuns:
- É a **rede de convidados** ou uma Wi-Fi com "isolamento de aparelhos" — troque para a rede normal.
- O **firewall do computador** bloqueou o Node na primeira vez. No Windows, aparece um aviso ao subir o
  servidor pela primeira vez — escolha **"Permitir acesso"** (em redes privadas). No Mac, o firewall
  costuma perguntar; permita.
- Digitou `https` em vez de `http`, ou esqueceu o `:8788`. Confira o endereço.

**Quero parar.** Feche a janela do Terminal, ou aperte `Ctrl + C` nela. O servidor cai; os celulares
voltam ao modo offline. As contas ficam salvas (voltam quando você subir de novo).

---

## O que NÃO dá para testar assim (o limite — leia antes de chamar as pessoas)

- **Só funciona dentro da sua casa.** Ninguém de fora da sua Wi-Fi entra. Testar "pela internet" é outro
  assunto (é o lançamento, com provedor de hospedagem — fora deste teste **de propósito**).
- **O computador tem de ficar ligado e acordado** o tempo todo. Se ele dormir, o servidor para e as
  partidas caem. Desligue a suspensão automática durante o teste.
- **É o jogo no NAVEGADOR do celular**, não o aplicativo instalado. O comportamento específico do app
  Android/iOS instalado (a WebView morrendo em segundo plano, ícone na tela) **não** é o que você testa
  aqui — isso é o spike de plataforma (Capacitor), separado. A **lógica** (PvP, ranque, missões,
  reconexão ao trocar de aba) testa-se bem assim.
- **Sem cadeado (sem `https`).** A conexão é `http` simples, o que é normal e seguro **na sua rede de
  casa**. Alguns navegadores mostram "não seguro" na barra — é esperado aqui.
- **É um servidor de teste, não de produção.** Sem limite de jogadores robusto, sem proteção contra
  abuso, sem otimização para muita gente. Serve para **um punhado de pessoas na sua sala**, não para
  público.
- **A base de contas fica no seu computador** (`server/dados/`). Some se você apagar a pasta; não é
  backup de nada.

---

## Segurança — o que fica aberto para o teste, e o que fechar antes de publicar

Para o teste, o servidor escuta em **todas as interfaces de rede** (`HOST=0.0.0.0`), para os celulares
da casa alcançarem. Isso deixa o servidor **visível para qualquer aparelho na sua rede local** enquanto
ele está no ar. Na sua Wi-Fi de casa, com gente que você chamou, tudo bem.

**Antes de publicar para o mundo (o lançamento, que é outra tarefa):**
- Este servidor de teste **não** deve ser exposto à internet como está — falta `https`, controle de
  carga e endurecimento. Publicar é escolher um provedor e uma configuração próprios (fora deste teste,
  **de propósito** — §221).
- Se quiser rodar o servidor **só no seu computador** (sem deixar na rede), suba assim:
  ```
  HOST=127.0.0.1 npm run serve
  ```
  Aí **nem os celulares** alcançam — serve para você mexer sozinho, não para o teste com gente.

Nada de segurança foi enfraquecido para este teste além de **abrir o servidor na sua rede local** — que
é exatamente o que o teste precisa, e que se fecha sozinho quando você para o servidor.

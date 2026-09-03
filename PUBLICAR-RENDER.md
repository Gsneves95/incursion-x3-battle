# Publicar o servidor num endereço público (Render, grátis)

Objetivo: pôr o **servidor** num endereço da internet (`https://...onrender.com`), para testar o jogo —
inclusive **PvP** — com amigos que **não estão na sua Wi-Fi**. Depois disso (outra etapa) a gente gera o
APK apontando para esse endereço.

> **Por que o servidor primeiro:** o APK precisa do endereço embutido. Sem o servidor de pé, o APK não
> teria para onde falar.

Você **não vai editar código**. Vai clicar em um site e esperar.

---

## O que já está pronto (não precisa fazer nada)

- **A porta vem do ambiente.** O Render escolhe a porta e avisa o servidor por uma "variável de
  ambiente" chamada `PORT`. *(Variável de ambiente = um valor que a plataforma entrega ao programa
  quando ele liga, em vez de estar escrito no código.)* O servidor já lê essa `PORT` — você não define
  nada.
- **O endereço é público e seguro (HTTPS).** O Render dá `https://`. O cliente **detecta isso sozinho** e
  usa a conexão segura (`wss://`) para o PvP. Isso foi **testado** (`tests/wss.test.js`) — não quebra por
  causa de http/https.
- **A configuração de publicação já está no projeto** (`render.yaml`). O Render lê esse arquivo e monta
  tudo: instala, constrói o jogo e liga o servidor.

---

## O roteiro (siga na ordem, do começo ao fim)

### Antes: o código tem de estar no GitHub

Este trabalho está no branch **`claude/naruto-arena-mobile-game-2sk7rg`** do seu repositório no GitHub.
O Render publica a partir do GitHub, então é de lá que ele vai puxar. Se você abриร o repositório no
GitHub e vê esse branch, está pronto. (Se preferir publicar do `main`, primeiro junte esse branch no
`main` pelo GitHub — mas dá para publicar direto do branch, é o que este guia faz.)

### Passo 1 — Criar a conta no Render

1. Abra **https://render.com** no computador.
2. Clique em **Get Started** (ou **Sign In**) e escolha **entrar com o GitHub** (**Sign in with
   GitHub**). É o jeito mais simples — não pede cartão.
3. O GitHub vai perguntar se autoriza o Render. Clique em **Authorize / Autorizar**.

### Passo 2 — Apontar o Render para o seu repositório

Há duas telas possíveis; use a que aparecer.

**Se aparecer "Blueprints" (o caminho mais fácil):**
1. No painel do Render, clique em **New +** (canto superior direito) → **Blueprint**.
2. Escolha o seu repositório na lista (`incursion...`). Se ele não aparecer, clique em **Configure
   account / Configurar** e dê ao Render acesso a esse repositório no GitHub.
3. Em **Branch**, escolha **`claude/naruto-arena-mobile-game-2sk7rg`** (ou `main`, se você juntou lá).
4. O Render lê o `render.yaml` e mostra um serviço chamado **incursion-servidor**, plano **Free**.
   Clique em **Apply / Aplicar**.

**Se NÃO aparecer Blueprint (caminho manual, também funciona):**
1. **New +** → **Web Service**.
2. Conecte/escolha o repositório (`incursion...`) e o branch
   **`claude/naruto-arena-mobile-game-2sk7rg`**.
3. Preencha os campos exatamente assim:
   - **Name:** `incursion-servidor` (ou o que quiser)
   - **Region:** a mais perto de vocês (ex.: **Oregon (US West)** ou a que oferecer)
   - **Branch:** `claude/naruto-arena-mobile-game-2sk7rg`
   - **Runtime / Language:** **Node**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type / Plan:** **Free**
4. Clique em **Create Web Service**.

> Você **não precisa** adicionar nenhuma variável de ambiente à mão. O Render define a `PORT` sozinho.

### Passo 3 — Esperar o primeiro deploy

O Render vai **instalar, construir e ligar**. Isso leva alguns minutos na primeira vez. Você vê um
**log** (texto rolando). Quando aparecer, perto do fim, algo como:

```
[incursion] servidor no ar · protocolo v1 · motor autoritativo (src/engine.js)
```

e o status do serviço virar **Live** (verde), está no ar.

No topo da página do serviço aparece o **endereço público**, algo como:
```
https://incursion-servidor.onrender.com
```
**Esse é o endereço do jogo.** Anote.

### Passo 4 — Testar você mesmo, antes de chamar os amigos

1. Abra esse endereço `https://...onrender.com` no navegador do **seu** computador. Deve carregar o jogo
   (portão de idade na primeira vez).
2. Abra o **mesmo endereço** no seu **celular** (pode ser no 4G, agora é internet de verdade — não
   precisa de Wi-Fi comum).
3. Faça um PvP de teste com você mesmo: abra em **duas abas** (ou computador + celular), vá em **PvP**,
   monte um time nas duas, e em uma toque **Entrar na fila**, na outra **Entrar na fila** — devem parear.

### Passo 5 — Como saber que funcionou

- [ ] O endereço `https://...onrender.com` **abre o jogo** (não uma página de erro).
- [ ] O cadeado de **https** aparece na barra do navegador.
- [ ] Dois aparelhos (mesmo em redes diferentes / 4G) **pareiam no PvP** e a batalha começa nos dois.
- [ ] Ao fim de uma partida **ranqueada**, aparece a mudança de faixa.
- [ ] Depois de vencer, **Missões** mostra o contador do panteão subindo.

Se isso tudo bateu, pode chamar os amigos e mandar o link.

### Se falhar

- **O deploy ficou "Failed" (vermelho).** Abra o log e veja a última linha em vermelho. Quase sempre é
  Build/Start Command errado no caminho manual — confira: Build `npm install`, Start `npm start`. Clique
  em **Manual Deploy → Deploy latest commit** para tentar de novo.
- **Abre "Not Found" ou erro ao carregar.** Espere terminar o deploy (status **Live**). Se persistir,
  confira que o **branch** escolhido é o certo.
- **O repositório não aparece na lista.** No GitHub, o Render precisa de permissão para vê-lo: no Render,
  **Configure account** → marque o repositório.
- **Demorou ~30s para abrir.** É normal no plano grátis (estava dormindo). Espere; depois fica rápido.

---

## O que se PERDE (avise os amigos)

No plano gratuito o disco é **temporário**. **A cada nova publicação (deploy)** — e possivelmente quando
o servidor dorme e acorda — **tudo o que o servidor guardou é apagado**. Some:

- as **contas** (cada um terá de responder a faixa de idade de novo, criando conta nova);
- o **apelido** (nick) escolhido;
- o **ranque** (pontos e faixa) e as **temporadas**;
- o **progresso de missões** (vitórias por panteão, sequências, e os **deuses conquistados por missão**);
- a **telemetria** acumulada.

O que **não** se perde: o **jogo em si** e os **9 deuses iniciais** — toda conta nova nasce com eles, e o
conteúdo (deuses, kits, missões) vem embutido no cliente. Ou seja: dá para jogar, parear, ranquear e ver
missões contando **dentro de uma mesma rodada de teste**; só não guarde expectativa de que o progresso
sobreviva a uma nova publicação.

**Aviso curto para o grupo:** *"É um teste. Cada vez que eu republicar, zera tudo — conta, apelido,
ranque, missões. Guardem só a diversão."*

### O que seria preciso para persistir DE VERDADE (quando for pra valer — não agora)

Hoje o servidor guarda as contas num **arquivo em disco** (`server/dados/contas.json`). Num serviço com
disco temporário, isso não sobrevive. Para valer seria preciso:

1. Um **banco de dados de verdade** (por exemplo o Postgres gerenciado do próprio Render, ou um disco
   persistente pago), que não some entre publicações.
2. **Reescrever a camada de contas** para ler/gravar nesse banco em vez do arquivo JSON.

Isso é trabalho de **lançamento**, com custo e configuração próprios — fora deste teste **de propósito**.

---

## O LIMITE deste teste (saiba antes de chamar os amigos)

- **Dorme e demora a acordar.** Sem uso por ~15 min, o servidor hiberna. A **próxima pessoa** que abrir
  espera ~30s enquanto ele acorda. Dica: **você** abra o link primeiro, espere carregar, e **só então**
  chame os amigos — assim eles pegam o servidor já acordado. Durante uma partida ele não dorme (a conexão
  o mantém ativo).
- **É um servidor pequeno e gratuito.** Serve para um punhado de amigos, não para muita gente ao mesmo
  tempo. Sem otimização para carga.
- **O progresso zera a cada publicação** (item acima).
- **É o jogo no NAVEGADOR do celular.** O aplicativo instalado (APK) é a **próxima etapa** — quando o
  servidor estiver de pé e o PvP funcionando pelo endereço público, a gente gera o APK apontando para ele.
- **Não escolhi provedor de lançamento nem mexi em segurança para "facilitar".** O Render foi **a sua
  escolha** para o teste; publicar de verdade (domínio próprio, banco, endurecimento) é outra tarefa.

Quando você confirmar que o PvP funciona pelo endereço `https://...onrender.com`, me avise — aí fazemos o
APK apontando para ele.

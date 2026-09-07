# Gerar o APK do INCURSION (Android) — modelo servidor-apontado

Objetivo: transformar o jogo num **app Android (.apk)** que você instala no celular. Este APK **aponta
para o servidor** (o Render que você já publicou): ele não carrega o jogo dentro dele, carrega do
servidor. A vantagem, decisão sua: **assim que você publica no Render, o app já mostra a versão nova —
sem reinstalar.** Instala uma vez, ajusta cem vezes.

> A versão que **embute** o jogo e roda **offline** é a que vai para a Play Store no fim. Não é agora.
> Este roteiro é o do teste — instalar no seu celular e nos dos amigos, fora da loja.

O identificador do app (é **permanente**, não muda depois de publicar na loja):

| | |
|---|---|
| **package (appId)** | `com.gsneves.incursionx3battle` |
| **nome (appName)** | `INCURSION` |

Você usa **Mac**, nunca gerou APK. Este roteiro é passo a passo, comando por comando.

---

## 0. O ENDEREÇO DO SERVIDOR — o único lugar que você talvez precise mexer

O app carrega o jogo do endereço que está em **UM lugar só**: o `capacitor.config.json`, no campo
`server.url`. Hoje está:

```json
"server": { "url": "https://incursion-servidor.onrender.com", ... }
```

**Confirme que é o SEU endereço** — o que o Render mostra como **Live** no seu serviço. Se você nomeou o
serviço diferente de `incursion-servidor`, troque a URL aqui. Amanhã, se mudar de hospedagem, muda **só
esta linha**, roda `npm run cap:sync`, gera o APK de novo. Nada de procurar endereço no meio do código.

---

## 1. Instalar UMA vez (no Mac)

1. **Android Studio** — https://developer.android.com/studio
   Ele traz tudo: o Java (JDK), o Android SDK, o emulador e as ferramentas de device. **Você não instala
   SDK à mão.** Ao abrir pela 1ª vez, aceite o assistente de setup (ele baixa o SDK padrão) e deixe
   terminar.
2. **Node** — você já tem (é o que roda o jogo). Confirme: `node -v` (precisa ser 18+).

Nada mais. O resto é copiar e colar.

---

## 2. Gerar o projeto Android — comandos em ordem (na pasta do projeto)

Abra o Terminal **na pasta `incursion-x3-battle`** e rode, em ordem:

```bash
# 1. instala as dependências (o jogo + o Capacitor + os plugins de app/splash/barra-de-status). Só na 1ª
#    vez, ou quando o package.json mudar.
npm install

# 2. monta a pasta web mínima que o app empacota (o JOGO vem do servidor; aqui vai só uma tela de
#    "conectando" de segurança).
npm run cap:www

# 3. cria o projeto Android nativo. SÓ NA PRIMEIRA VEZ (depois a pasta android/ já existe).
npx cap add android

# 4. gera os ÍCONES do app em todos os tamanhos do Android, a partir dos que já existem (não precisa de
#    arte nova — ver a seção 5). SÓ NA PRIMEIRA VEZ, ou quando trocar o ícone.
npm run cap:assets

# 5. copia a config (server.url, splash, barra de status), os plugins E o MainActivity IMERSIVO (§244)
#    para o projeto Android. USE `npm run cap:sync` (não `npx cap sync`) — é ele que reaplica o imersivo.
npm run cap:sync

# 6. abre o projeto no Android Studio.
npx cap open android
```

> **⚠️ SEMPRE `npm run cap:sync`, nunca só `npx cap sync`.** O `npm run cap:sync` roda o `cap:native`, que
> reaplica o MainActivity imersivo (§244). Se você rodar só `npx cap sync`, a barra de navegação volta.

**No Android Studio (que abriu no passo 6):**

- Ligue o celular no **cabo USB** e ative a **Depuração USB**:
  Configurações → Sobre o telefone → toque **7×** em "Número da versão"; depois Configurações → Sistema →
  Opções do desenvolvedor → **Depuração USB** (ligado). O aparelho aparece no topo do Android Studio.
- Aperte o **▶ (Run)** verde. Na 1ª vez ele compila (uns minutos), instala e abre. **Deite o aparelho na
  horizontal** — o jogo é paisagem.
- Você vai ver a **tela de carregando** (fundo escuro + rodinha) por alguns segundos enquanto ele fala com
  o servidor. Se o servidor estava dormindo (o Render grátis dorme após 15 min), a 1ª vez leva **~30s** —
  é esperado, não é travamento. **Dica:** abra o app você primeiro (para acordar o servidor), depois chame
  os amigos.

### Depois de mudar o código do jogo

O jogo vem do servidor, então **basta publicar no Render** e reabrir o app — ele já pega a versão nova, sem
reinstalar. Você só refaz o APK se mudar o **endereço do servidor, o ícone, o nome ou a config** — aí:

```bash
npm run cap:sync    # remonta o www mínimo + copia a config/plugins para o Android
```

E aperte **▶ Run** de novo.

---

## 3. Como o APK chega no seu celular (e no dos amigos)

Duas formas:

- **Cabo (a que você acabou de usar):** com o celular no USB e o ▶ Run, o Android Studio instala direto.
  É a mais fácil para o SEU aparelho.
- **Arquivo .apk (para mandar para os amigos):** no Android Studio, menu **Build → Build App Bundle(s) /
  APK(s) → Build APK(s)**. Quando terminar, aparece um aviso "locate" — clique e ele abre a pasta com o
  arquivo `app-debug.apk`. Esse arquivo você manda para os amigos por **WhatsApp, e-mail, Google Drive** —
  qualquer caminho. Cada um instala no próprio celular (seção 4).

---

## 4. Instalar um APK que NÃO veio da loja (o Android reclama — o que aceitar)

O Android bloqueia apps de fora da Play Store por padrão. É seguro liberar para um arquivo que **você**
mandou. No celular que vai receber:

1. Abra o arquivo `app-debug.apk` (no app de Arquivos, ou tocando no anexo).
2. O Android avisa: **"Por segurança, seu telefone não pode instalar apps desconhecidos desta fonte."**
   Toque em **Configurações** e ligue **"Permitir desta fonte"** (é permitido para o app de onde você
   abriu o arquivo — Arquivos, WhatsApp, etc.). Volte.
3. Toque **Instalar**. Pode aparecer **"Play Protect não reconhece"** → **Instalar mesmo assim** (é porque
   o app não é da loja, não porque tem problema).
4. Pronto. **Depois do teste**, você pode desligar a permissão de "fonte desconhecida" de volta.

---

## 5. O ícone — os que existem servem

O app já tem `web/icon-512.png` (512×512) e `web/icon-192.png` (192×192). **Servem** — não precisa de arte
nova. O Android precisa do ícone em **vários tamanhos** (mdpi 48 → xxxhdpi 192) e o de **loja** 512; o
`npm run cap:assets` (passo 4 acima) **gera todos a partir do 512** que já existe. O 512 cobre tudo (o
maior ícone de launcher do Android é 192, bem menor que 512; o da loja é exatamente 512).

- **Único porém honesto:** o ideal de origem seria **1024×1024** (a loja recomenda), e o adaptativo do
  Android recorta num círculo/losango — se o desenho tiver detalhe colado na borda, pode cortar. Para o
  **teste** o 512 basta. Para a **loja**, no fim, vale um 1024 com margem de respiro. **Não é bloqueio agora.**

---

## 6. O que este APK vai REVELAR (o valor de fazer isto) — teste no aparelho

O navegador de mesa esconde estas quatro coisas. Teste cada uma **no celular**, com o
`chrome://inspect` aberto no seu Mac (Chrome → `chrome://inspect` → o app aparece → **inspect** → você vê o
console do WebView, onde um erro que só acontece no celular aparece):

1. **A WebView morta em segundo plano (a reconexão da F5.4, nunca testada em app real).**
   Entre numa **partida no servidor**, jogue um turno, **troque de app** e deixe parado uns segundos (o
   Android costuma **matar** a WebView, não só pausar). **Volte.**
   → **Certo:** o app **reconecta sozinho** e volta à **mesma partida**, no mesmo turno, com o relógio que
   **correu na sua ausência** (não zerou). → **Errado:** volta para a home (perdeu a partida), ou o relógio
   reaparece cheio, ou fica "pensando" sem reconectar. Anote qual.
2. **O toque longo (§214, consulta do kit).** Numa batalha, **segure** o retrato de um inimigo ~meio
   segundo. → **Certo:** abre o kit dele no painel esquerdo, e **NÃO** aparece a lupa/menu "Copiar" do
   sistema. → **Errado:** aparece o menu do sistema, ou nada, ou trata como toque curto.
3. **O desempenho da IA no Difícil.** Batalha CPU → dificuldade **Difícil** → encerre o turno e conte os
   **segundos** até a CPU jogar e o controle voltar. (Na mesa deu ~2,5s.) → **Errado:** trava, passa de
   ~8–10s, ou aparece o "app não está respondendo" (ANR). Anote o tempo.
4. **O botão VOLTAR do Android — já resolvido no código (§240), confirme no aparelho.** O botão físico/gesto
   de voltar **faz o que o "‹ Início" faz** e **nunca fecha o app no meio de uma partida**:
   - numa sub-tela (Coleção, Campanha…) → volta para a home;
   - **na batalha** → abre o **"Sair da partida?"** (não abandona sozinho, não fecha o app);
   - com um menu/sobreposição aberto → fecha ele primeiro;
   - **só na home** (a raiz) o voltar **sai do app** — o padrão do Android.
   → **Confirme** que apertar voltar no meio de uma partida NÃO fecha o app.

---

## 7. O LIMITE — o que ainda não dá para testar assim, e o que falta para a loja

**Ainda não dá para testar assim:**
- **iPhone.** Este roteiro é Android. iOS precisa de Mac + Xcode + conta de desenvolvedor Apple (US$99/ano)
  e um caminho de instalação diferente. Fica para depois.
- **Offline.** Este app **precisa de internet** (carrega o jogo do servidor). Sem rede, ou com o servidor
  fora, ele fica na tela de "conectando". A versão offline é a de loja, no fim.
- **Servidor fora (não só dormindo).** Se o Render estiver realmente fora (não apenas dormindo), o app fica
  na tela de carregando; passando de ~40s parado, é sinal de que o servidor não respondeu — feche e reabra
  quando ele estiver de pé. (Dormindo é ~30s e resolve sozinho.)
- **Notificações, compras, login social:** não existem — o jogo não usa nada disso ainda.

**O que falta para ir à Play Store DE VERDADE** (não fiz nada disto — é só a lista):
- **Assinatura (signing):** a loja exige um APK/AAB **assinado** com uma chave sua (keystore), não o
  `app-debug`. É `Build → Generate Signed Bundle/APK` no Android Studio, gerando um **.aab**. Guarde a
  chave: perder o keystore = não poder mais atualizar o app.
- **Conta Google Play Developer:** taxa única de US$25.
- **Política de privacidade:** uma URL pública dizendo que dados o app coleta (hoje: apelido e progresso no
  servidor). A loja exige o link.
- **Classificação indicativa (rating):** um questionário na Play Console que gera a faixa etária.
- **Ficha da loja:** descrição, capturas de tela, ícone 512, gráfico de destaque.
- **A versão OFFLINE (embutida):** para a loja não depender do servidor grátis dormindo, o app de loja deve
  **embutir** o jogo (o modelo antigo do spike) e falar com o servidor só para o PvP. É uma troca de
  `capacitor.config.json` (tirar o `server.url`, voltar o `cap:www` a empacotar o jogo) — decisão de quando
  for para a loja.

---

## 8. Modo IMERSIVO — tela cheia de verdade (§243/§244)

O jogo é paisagem e apertado; as barras do Android roubavam altura. O app entra em **modo imersivo**: a
**barra de status** (topo) e a **barra de navegação** (que em paisagem migra para a **lateral** e comia uma
faixa) **somem**, e **voltam ao deslizar da borda** quando você precisar. Está **tudo no código** — nada a
configurar, nada de editar Java à mão:

- A **barra de status** some pelo plugin `@capacitor/status-bar` (o jogo a esconde ao abrir e **reafirma ao
  voltar do segundo plano**).
- A **barra de navegação** some pelo **MainActivity imersivo (§244)** — o modo imersivo oficial do Android
  (`hide(systemBars)` + `BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE`). A tela cheia sozinha **não bastava** em
  paisagem (a barra migrava para a lateral); o nativo resolve, com `setDecorFitsSystemWindows(false)` para a
  WebView desenhar de borda a borda (sem a faixa branca onde a barra estava). Ele **reafirma ao voltar o
  foco** (`onWindowFocusChanged`), então a barra não volta na 1ª troca de app.
- **Ganho de altura:** ~**24dp** (status) + ~**48dp** (navegação de 3 botões) = ~**72dp** — uns **+18% a
  +21%** de espaço em paisagem (navegação por GESTOS recupera ~24dp). Como o palco escala para caber, vira
  jogo **maior**, não tarja preta. **Medir o exato no SEU aparelho:** `chrome://inspect` → `innerHeight`
  antes/depois, ou 3 toques no carimbo de build para o painel de diagnóstico.

> ### ⚠️ LETRA GRANDE: o MainActivity imersivo SOBREVIVE ao `npx cap add android`
>
> Você rodou `cap add` duas vezes hoje e perdeu edições nativas — isso **não acontece mais**. O MainActivity
> imersivo é **versionado** em `native/MainActivity.java` (no repositório), e o **`npm run cap:sync` o
> reaplica** toda vez (o passo `cap:native`). Então:
> - o `npx cap add android` regenera um MainActivity vanilla, **mas** o `npm run cap:sync` seguinte
>   **restaura o imersivo** automaticamente;
> - você **nunca edita Java à mão** e **nunca perde** o ajuste;
> - a única regra: depois de qualquer `cap add`, rode **`npm run cap:sync`** (não `npx cap sync` sozinho).
>
> Para mudar o imersivo no futuro, edite `native/MainActivity.java` e rode `npm run cap:sync`.

**O botão VOLTAR continua funcionando com a barra escondida** — agora pelo **gesto** de deslizar da borda. O
evento de voltar do Android é do sistema e dispara pelo gesto (ou pelo botão, quando a barra reaparece),
independente de a barra estar visível. O tratamento do §240 segue igual: sobreposição fecha → batalha
confirma sair → sub-tela vai à home → só na home sai do app. **Confirme no aparelho:** no meio de uma
partida, o gesto de voltar **abre o "Sair da partida?"**, não fecha o app.

**O enquadramento (o notch) continua certo, sem faixa sobrando.** Com as barras escondidas, as margens
seguras (`env(safe-area-inset-*)`) encolhem; o jogo **relê e reenquadra** (no boot, na tela cheia, no resume
e no foco), então o palco **preenche** o espaço recuperado (inclusive a lateral onde estava a barra) sem
cortar nada. Num aparelho **com recorte/notch**, confira as quatro bordas: nada cortado, nada de tarja.

---

## 9. Quando REINSTALAR o APK e quando o app se atualiza SOZINHO (§243)

A regra de ouro que você entendeu está certa: **mudança no JOGO atualiza pelo Render; mudança no APP NATIVO
exige reinstalar.** As listas, para você não ter que perguntar:

**Atualiza SOZINHO (só publicar no Render e reabrir o app — SEM reinstalar):**
- Qualquer coisa do **jogo**: HTML, JavaScript, CSS, telas, layout, o modo imersivo em código, o botão voltar.
- **Dados** do jogo: kits dos deuses, missões/volumes/ranque, campanha, provações, textos, balanceamento.
- O **motor** e o **servidor** (regras de combate, pareamento, missões, ranqueado) — rodam no Render.
- Ou seja: **quase tudo.** É o motivo do modelo servidor-apontado.

**Exige GERAR O APK DE NOVO e reinstalar (mexe no app nativo):**
- O **endereço do servidor** (`server.url` no `capacitor.config.json`).
- O **nome** do app (`appName`) ou o **appId/package** (este NÃO se muda depois da loja).
- O **ícone** ou o **splash** (a tela de carregando).
- **Adicionar/remover/atualizar um plugin** nativo (splash, barra de status, app, etc.) ou uma **permissão**.
- O ajuste nativo do `MainActivity.java` (seção 8), se você o fizer.
- Subir a **versão do Android/SDK** ou do Capacitor.
- Trocar para o **modo embutido/offline** (o da loja, no fim).

Para reinstalar depois de uma dessas: `npm run cap:sync` (ou `cap:assets` se foi o ícone) → **▶ Run** no
Android Studio (ou gere o `.apk` de novo e reinstale pelo arquivo).

### O cache da WebView — publiquei e o app mostra a versão velha, e agora?

Raro no nosso caso (o WebView do Capacitor carrega o `server.url` a cada abertura e o servidor manda o HTML
na hora, sem cache agressivo do documento), mas se acontecer:

1. **Feche o app dos recentes** (deslize para fora) e reabra — resolve na quase totalidade dos casos, porque
   força o WebView a rebuscar a página do servidor.
2. Se ainda assim ficar velho, **force parar** o app (Configurações → Apps → INCURSION → Forçar parada) e
   reabra; ou **limpe o cache** do app ali mesmo (Armazenamento → Limpar cache — NÃO "Limpar dados", que
   apaga o login guardado).
3. **Não precisa de nada no código** para o caso normal. Só a versão da LOJA (embutida, no fim) precisaria de
   uma estratégia de cache — o modelo servidor-apontado de hoje não.

---

## O que muda em relação ao spike (§218 / `CAPACITOR-SPIKE.md`)

O spike foi escrito para o modelo **EMBUTIDO** (o app carrega o jogo de dentro dele). Agora é
**SERVIDOR-APONTADO**. O que mudou:

| | Spike (embutido) | Agora (servidor-apontado) |
|---|---|---|
| **De onde vem o jogo** | de dentro do APK (`www/` = jogo + ~6,6 MB de assets) | do servidor (`server.url`), nada embutido |
| **`www/`** | jogo completo + skills/banners/ícones | só um `index.html` de segurança (tela de "conectando") |
| **Atualizar** | **reinstalar** o APK a cada mudança | **publicar no Render** e reabrir — sem reinstalar |
| **Offline** | funciona sem rede | **precisa de internet** |
| **Tamanho do APK** | ~9–11 MB | **bem menor** (sem os assets) |
| **appId / appName** | `com.incursion.x3battle` / `INCURSION x3` | **`com.gsneves.incursionx3battle` / `INCURSION`** (permanente) |
| **Achar o servidor** | precisava do endereço embutido à parte | **de graça**: o jogo vem do servidor, então o WebSocket usa a mesma origem (`wss://` automático) |
| **Splash / servidor dormindo** | não tratado | **splash nativo** cobre os ~30s do Render acordar |
| **Botão VOLTAR do Android** | não tratado | **resolvido** (§240): faz o "‹ Início", nunca fecha no meio da partida |

O que **continua igual**: precisa do Android Studio; o `chrome://inspect` para ver erros; o checklist de
toque/notch/desempenho; `viewport-fit=cover`, `-webkit-touch-callout:none` e `localStorage` em try/catch já
estavam certos no código.

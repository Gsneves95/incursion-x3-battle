# Spike de plataforma — INCURSION x3 num celular de verdade (Capacitor)

**O que é isto:** o mínimo para rodar o jogo (que hoje só roda no navegador) **dentro do invólucro
nativo** que vai para a App Store / Play Store, num aparelho de verdade. O objetivo NÃO é entregar —
é **descobrir o que quebra** no WebView do celular, que não é o Chrome de mesa.

**Não tem plugin, compra, notificação nem conta.** É só o jogo dentro de uma casca nativa.

> Este spike foi montado num ambiente **sem como rodar Android** (sem `/dev/kvm`, sem SDK, contêiner
> sem tela). Por isso o projeto está pronto e **medido no que dá para medir sem aparelho**, mas o run
> num device é seu. Este README é para você rodar sem adivinhar nenhum passo.

---

## O que você precisa instalar UMA vez

1. **Android Studio** — https://developer.android.com/studio
   Ele já traz tudo: o Java (JDK), o Android SDK, o emulador e as ferramentas de device. **Você não
   instala SDK à mão.** Ao abrir o Android Studio pela primeira vez, aceite o assistente de setup
   (ele baixa o SDK padrão) e deixe terminar.
2. **Node** — você já tem (é o que roda o jogo). Confirme com `node -v` (precisa ser 18+).

Nada mais. O resto são comandos que você copia e cola.

---

## Rodar o jogo no aparelho — passo a passo (copie e cole, na raiz do projeto)

Abra um terminal **na pasta do projeto** (`incursion-x3-battle`) e rode, em ordem:

```bash
# 1. instala as dependências (o jogo + o Capacitor). Só precisa na 1ª vez, ou quando o package mudar.
npm install

# 2. gera o jogo (dist/incursion.html) e monta a pasta web (www/) que o app empacota.
npm run build
npm run cap:www

# 3. cria o projeto Android nativo. SÓ NA PRIMEIRA VEZ (depois a pasta android/ já existe).
npx cap add android

# 4. abre o projeto no Android Studio.
npx cap open android
```

**No Android Studio (que abriu no passo 4):**

- **Com um celular:** ligue o aparelho no cabo USB, ative **Opções do desenvolvedor → Depuração USB**
  (no Android: Configurações → Sobre o telefone → toque 7× em "Número da versão"; depois Configurações
  → Sistema → Opções do desenvolvedor → Depuração USB). O aparelho aparece no topo do Android Studio.
- **Sem celular:** no Android Studio, **Device Manager** (ícone de celular à direita) → **Create Device**
  → escolha um telefone (ex.: Pixel 6) → baixe uma imagem de sistema → Finish. Ele vira um emulador.
- Aperte o **▶ (Run)** verde no topo. Na 1ª vez ele compila (uns minutos) e instala. O jogo abre.

**Deite o aparelho / emulador na horizontal** — o jogo é paisagem (ele mostra "gire o aparelho" se
estiver de pé).

### Depois de mudar o código do jogo

Não precisa recriar nada. Só:

```bash
npm run cap:sync      # rebuild + remonta www/ + copia para o Android
```

E aperte **▶ Run** de novo no Android Studio.

### Para VER os erros de JavaScript no aparelho (importante no spike)

Com o celular ligado no USB e o app aberto, abra o **Chrome no seu computador** e vá em
`chrome://inspect`. O app aparece na lista → clique em **inspect**. Você vê o console do WebView do
aparelho — é onde um erro que só acontece no celular vai aparecer. **Deixe isso aberto enquanto roda
o checklist**; se algo quebrar, o motivo costuma estar ali.

---

## O CHECKLIST — o que medir, gesto por gesto (a parte que vale)

Rode cada item **no aparelho**, com o `chrome://inspect` aberto. Para cada um, anote o número ou a
observação pedida. O que a régua do projeto cobra: **medido, não no olho.**

### A) Toque de 76px — o alvo é grande o bastante para o dedo?
- **Onde tocar:** numa batalha, os 4 discos de habilidade de uma unidade (78×78px), o botão
  **ENCERRAR TURNO**, e na Coleção os cartões dos deuses (116×142px).
- **O gesto:** toque cada um dos 4 discos de um deus, rápido, um atrás do outro.
- **Sucesso:** todo toque registra de primeira, sem errar o disco vizinho, sem precisar mirar.
- **Falhar significa:** você toca e não acontece nada, ou arma a habilidade errada (acertou o vizinho),
  ou precisa tocar duas vezes. Anote QUAL alvo falhou e o tamanho dele.

### B) Toque longo de 420ms (§214) — a consulta do kit inimigo
- **O gesto:** numa batalha, **segure** (pressione e mantenha) o **retrato de um inimigo** por cerca
  de meio segundo, sem arrastar o dedo.
- **Sucesso:** o **kit do inimigo abre no painel da esquerda** (as 4 habilidades + a passiva). O "?"
  no canto do retrato é a dica de que dá para fazer isso.
- **Falhar significa, e é o item mais importante no iOS:**
  1. **A lupa / o menu "Copiar/Selecionar" do sistema aparece** em vez do kit — era o risco do iOS que
     eu fechei por código (`-webkit-touch-callout:none`). **Confirme que NÃO aparece.**
  2. Nada acontece (o toque longo não dispara).
  3. Ele trata como toque curto (marca o inimigo como alvo) em vez de abrir o kit.
- **Detalhe do gesto:** se você **mover o dedo mais de ~10px** enquanto segura, ele cancela de
  propósito (é para não abrir kit quando você quis rolar). Segure firme.

### C) Arrastar de 10px (§208) — rolar o carrossel sem abrir tela
- **O gesto:** na tela inicial (home), **arraste de lado** o carrossel de banners para rolá-lo.
- **Sucesso:** ele rola liso e **NÃO abre** nenhuma tela de destino.
- **Falhar significa:** um arrasto curto (só começando a rolar) **abre sem querer** a tela de um banner
  (Provações, Invocação, etc.). É o limiar de 10px errando no dedo real. Anote se ALGUM flick te jogou
  numa sub-tela que você não quis abrir.

### D) Escala / notch (F0.6b) — o enquadramento sobrevive às barras do sistema?
- **O que olhar:** numa batalha, na horizontal, as **quatro bordas** da tela.
- **Sucesso:** o palco inteiro cabe, **nada cortado** — nem o topo (barra de status), nem embaixo (a
  barra/pílula de navegação por gestos), nem no lado do **notch/recorte**. Se sobrar tarja preta, ela
  é uniforme.
- **Falhar significa:** a barra de cima (perfis + relógio) fica **por baixo** da barra de status; o
  **ENCERRAR TURNO** fica por baixo da pílula de gestos; ou o notch **come** a coluna de inimigos.
  Anote QUAL borda e o QUÊ ficou coberto. Teste num aparelho **com notch** se tiver.

### E) Desempenho — a IA e as artes grandes travam?
Duas medições:
1. **IA no Difícil:** entre em **Batalha CPU** (sandbox), ponha a dificuldade em **Difícil**, jogue
   alguns turnos. **Meça: depois que você encerra o turno, quantos SEGUNDOS até a CPU terminar a jogada
   dela e o controle voltar?** (Na mesa deu ~2,5s em 30 partidas.)
   - **Sucesso:** parecido (poucos segundos), sem congelar, **sem o aviso "o app não está respondendo"
     (ANR)**.
   - **Falhar:** a tela trava, aparece o ANR, ou passa de ~8–10s. Anote o tempo medido.
2. **Artes grandes (§214/§216):** role a **Coleção** (100 deuses, arte 114px) de cima a baixo. Depois
   entre numa batalha e observe os discos/retratos a cada turno.
   - **Sucesso:** rolagem lisa, sem engasgo, sem "flash branco" enquanto a arte carrega; na batalha a
     arte aparece na hora.
   - **Falhar:** engasga, rola devagar, ou a arte "pisca" atrasada. Anote onde.

### F) Armazenamento — o perfil sobrevive a fechar o app?
- **O gesto:** jogue o bastante para **mudar seu perfil** — ganhe uma Batalha CPU (ganha Gema) ou faça
  uma Invocação (ganha um deus). **Depois FECHE O APP DE VERDADE** (deslize ele para fora dos apps
  recentes — não é só mandar para segundo plano). **Reabra.**
- **Sucesso:** sua Gema / seus deuses / seu progresso estão **exatamente como você deixou**.
- **Falhar significa:** o perfil **voltou ao inicial** (o localStorage não sobreviveu ao restart do
  WebView). Anote o que resetou.
- **Bônus:** na 1ª vez que abriu, você recebeu o **grant inicial (9 deuses)**? Confirme que aconteceu
  **uma vez só** (reabrir não deve dar 9 de novo).

---

## Tamanho do app (já medido aqui, sem precisar de aparelho)

O número que vai na loja é o do **build real que você vai fazer** — mas o peso já está medido:

| Peça | Cru | No pacote (deflate) |
|---|---|---|
| `index.html` (jogo: HTML/JS + ~100 retratos em base64) | 1,75 MB | **0,99 MB** (comprime a 54%) |
| `skills/` — 401 webp | 4,78 MB | ~4,85 MB (já comprimido, **não encolhe**) |
| `banners/` — 7 webp | 0,55 MB | ~0,55 MB |
| ícones + manifest | ~0,28 MB | ~0,28 MB |
| **payload web (www/)** | **7,36 MB** | **6,63 MB** (medido, `zip -9`) |

Sobre esses ~6,6 MB entra a casca nativa do Capacitor/AndroidX (framework, não dá para medir aqui sem
o SDK): tipicamente **~2–4 MB em debug, ~1,5–2,5 MB em release**.
**Estimativa: APK debug ~9–11 MB; AAB release / download por aparelho ~8–9 MB.** Longe de qualquer
limite de loja. **O número exato sai do seu build** (`Build → Generate Signed Bundle/APK` no Android
Studio) — e é esse que vai na Play Store.

---

## O que já foi consertado por leitura de código (antes do spike)

- **iOS — lupa no toque longo (§218):** faltava `-webkit-touch-callout:none`; sem ele, o toque longo do
  §214 levantaria o menu de seleção do WebView iOS e quebraria a consulta de kit. **Fechado** (é o
  item B do checklist — confirme no aparelho).
- **Já estava certo no código:** viewport com `viewport-fit=cover` (notch) e `user-scalable=no`; o
  enquadramento lê `env(safe-area-inset-*)` de verdade; nada de `100vh` (evita o bug clássico de
  WebView com as barras); todo `localStorage` é try/catch com fallback. O checklist confirma isso no
  aparelho, mas o código já não tem as armadilhas óbvias.

---

## O que NÃO está no git (é gerado na sua máquina)

- `www/` — sai de `npm run cap:www` (são os 6,6 MB de assets; regeneráveis).
- `android/` — sai de `npx cap add android` (código nativo específico da versão do SEU SDK).

Versionado: `capacitor.config.json`, `tools/cap-www.js`, os scripts no `package.json`, e este README.

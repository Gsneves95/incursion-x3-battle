# APK — modo imersivo (barra do sistema escondida) · runbook (§244/§319b)

## O que esconde a barra

São DUAS peças, em dois lugares:

1. **Barra de STATUS (topo)** — escondida pelo lado **web** (`src/view.js` → `imersivo()`, plugin `StatusBar`).
   Isso vem do servidor: toda vez que o app carrega a web do Render, já está aplicado. Não precisa de APK novo.
2. **Barra de NAVEGAÇÃO (baixo)** — escondida pelo lado **nativo** (`native/MainActivity.java`, modo imersivo
   sticky + `hide(systemBars)`, reafirmado no `onWindowFocusChanged` e no `onResume`). Isso vive **dentro do APK
   instalado** — só muda com um **APK novo**.

> Por isso: se a barra de **navegação (baixo)** voltou, o conserto é **gerar e instalar um APK novo** — nenhuma
> mudança no servidor resolve essa barra (o Fullscreen do navegador sozinho deixa uma faixa lateral em paisagem;
> foi exatamente por isso que o §244 pôs a solução no nativo).

## Causa provável de "a barra voltou"

O `native/MainActivity.java` (fonte da verdade) está **correto e intacto** desde o §244. A barra volta quando o
**APK instalado** não tem esse MainActivity imersivo — ou porque é um APK **anterior ao §244**, ou porque a pasta
`android/` foi **regenerada** (`npx cap add android` cria um MainActivity "vanilla") e o APK foi montado **sem
rodar `npm run cap:sync`** (que reaplica o imersivo). O `tools/cap-native.js` reaplica o nosso MainActivity a cada
`cap:sync` — mas ele precisa rodar antes de montar o APK.

## Runbook — gerar e instalar o APK novo (passo a passo)

No computador, dentro da pasta do projeto:

1. **Garantir a plataforma Android** (só na 1ª vez, ou se `android/` não existe):
   ```
   npx cap add android
   ```
2. **Sincronizar + reaplicar o imersivo** (este passo copia a web e reaplica `native/MainActivity.java`):
   ```
   npm run cap:sync
   ```
   Deve imprimir uma linha tipo `MainActivity imersivo (§244) aplicado em android/app/src/main/java/.../MainActivity.java`.
3. **Apontar o SDK do Android** (passo que FALTOU na pasta nova — §319b). Quando a pasta `android/` é recém-criada
   pelo `npx cap add android`, ela não traz o `android/local.properties`, e o `./gradlew` não acha o SDK. Crie-o
   **uma vez** apontando para onde o Android SDK está instalado:
   ```
   echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
   ```
   (no macOS o Android Studio instala o SDK em `~/Library/Android/sdk`; no Linux costuma ser `~/Android/Sdk` e no
   Windows `C:\Users\<voce>\AppData\Local\Android\Sdk` — ajuste o caminho ao seu sistema.) O `local.properties` é
   local da máquina e **não vai para o git**.
4. **Montar o APK** (debug serve para instalar no próprio aparelho):
   ```
   cd android && ./gradlew assembleDebug
   ```
   O APK sai em `android/app/build/outputs/apk/debug/app-debug.apk`.
5. **Instalar no aparelho** (USB com depuração ligada):
   ```
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```
   (ou copiar o `.apk` para o telefone e tocar nele para instalar.)
6. **Conferir no S24:** abrir o app, trocar para outro app e voltar — a barra de navegação deve continuar
   escondida; deslizar da borda de baixo traz as barras de volta por alguns segundos (comportamento esperado).

## Conferência rápida (sem recompilar) — qual MainActivity está no projeto?

```
cat android/app/src/main/java/com/gsneves/incursionx3battle/MainActivity.java
```
Tem de conter `aplicarImersivo()` + `c.hide(WindowInsetsCompat.Type.systemBars())`. Se for um `MainActivity` curto
sem isso, é o "vanilla" — rode `npm run cap:sync` (passo 2) e monte de novo (passo 3).

## §319b — reforço aplicado

Além do `onWindowFocusChanged` (reafirma ao voltar do 2º plano), o MainActivity agora também reafirma no
`onResume()` — alguns OEMs readmitem a barra no resume antes do foco. Já está no `native/MainActivity.java`; entra
no APK no próximo `npm run cap:sync` + montagem.

**Correção de compilação (achada ao gerar o APK):** o `onResume()` tinha sido declarado `protected`, mas o
`BridgeActivity` o declara `public`; o Java recusa enfraquecer a visibilidade herdada
(`attempting to assign weaker access privileges`) e o `./gradlew` **não compila**. Agora é `public void onResume()`.
O teste `tests/cap_native.test.js` ganhou uma guarda que reprova qualquer `@Override` não-`public` no template
(ela deixava passar antes porque não roda `javac`) — provada que morde trocando o `onResume` de volta para
`protected`.

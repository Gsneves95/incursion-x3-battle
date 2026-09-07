'use strict';
// tools/cap-native.js (§244) — aplica o MainActivity IMERSIVO versionado (native/MainActivity.java) no
// projeto Android gerado. Roda dentro do `npm run cap:sync`, então o ajuste nativo SOBREVIVE ao
// `npx cap add android` (que regenera android/ com um MainActivity vanilla): o próximo cap:sync o reaplica.
//
// O destino deriva do appId do capacitor.config.json (com.gsneves.incursionx3battle →
// android/app/src/main/java/com/gsneves/incursionx3battle/MainActivity.java), e o `package` do arquivo é
// reescrito para casar com o appId (se o dono trocar o appId, o Java acompanha). Determinístico, só usa fs.
const fs = require('fs');
const path = require('path');

function aplicar(raiz) {
  const cfgPath = path.join(raiz, 'capacitor.config.json');
  const src = path.join(raiz, 'native', 'MainActivity.java');
  if (!fs.existsSync(src)) return { ok: false, msg: 'native/MainActivity.java não encontrado (nada a aplicar).' };
  let appId = 'com.gsneves.incursionx3battle';
  try { appId = JSON.parse(fs.readFileSync(cfgPath, 'utf8')).appId || appId; } catch (e) {}
  const androidDir = path.join(raiz, 'android');
  if (!fs.existsSync(androidDir)) {
    return { ok: true, skipped: true, appId,
      msg: 'android/ ainda não existe — rode `npx cap add android` primeiro; o MainActivity imersivo entra no próximo `npm run cap:sync`.' };
  }
  const pkgPath = appId.split('.').join(path.sep);
  const dest = path.join(androidDir, 'app', 'src', 'main', 'java', pkgPath, 'MainActivity.java');
  let java = fs.readFileSync(src, 'utf8').replace(/^package .*;/m, 'package ' + appId + ';');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, java);
  return { ok: true, dest, appId, msg: 'MainActivity imersivo (§244) aplicado em ' + path.relative(raiz, dest) };
}

module.exports = { aplicar };

if (require.main === module) {
  const r = aplicar(path.join(__dirname, '..'));
  console.log(r.msg);
  process.exit(0);   // nunca derruba o cap:sync — se android/ não existe, só avisa
}

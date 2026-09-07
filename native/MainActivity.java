// §244 — MainActivity IMERSIVO (VERSIONADO). Este arquivo é a fonte da verdade: tools/cap-native.js o
// copia para android/app/src/main/java/<appId>/MainActivity.java a cada `npm run cap:sync`, então ele
// SOBREVIVE ao `npx cap add android` (que regenera a pasta android/ com um MainActivity vanilla). Não
// se edita à mão o arquivo gerado — edita-se ESTE, e o cap:sync reaplica.
//
// O que faz: modo IMERSIVO do Android (esconde a barra de status E a de navegação, que em paisagem migra
// para a lateral e comia uma faixa). setDecorFitsSystemWindows(false) faz a WebView desenhar de borda a
// borda (sem a faixa branca onde a barra estava); BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE traz as barras de
// volta ao deslizar da borda; onWindowFocusChanged REAFIRMA ao voltar do segundo plano (senão a barra de
// navegação volta na 1ª troca de app). O gesto de VOLTAR do Android segue disparando o evento backButton
// (tratado no §240) mesmo com a barra escondida.
//
// O `package` é reescrito pelo cap-native a partir do appId do capacitor.config.json — não precisa mexer.
package com.gsneves.incursionx3battle;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    aplicarImersivo();
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) aplicarImersivo();   // reafirma ao voltar do 2º plano (as duas barras)
  }

  private void aplicarImersivo() {
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);   // WebView de borda a borda (sem faixa)
    WindowInsetsControllerCompat c =
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
    c.hide(WindowInsetsCompat.Type.systemBars());                 // status + navegação
    c.setSystemBarsBehavior(
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);   // voltam ao deslizar
  }
}

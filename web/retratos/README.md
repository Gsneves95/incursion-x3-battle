# web/retratos/ — retratos GRANDES da sobreposição de detalhe (§289)

Um arquivo por deus, buscado **sob demanda** (só a sobreposição de detalhe da Coleção o usa).
Mesmo padrão do bestiário (§254), da campanha (§259) e dos Domínios (§280): arquivo `.webp`
externo, `<img loading="lazy" onerror="this.remove()">`, **nunca base64** (embutir os 100 inflaria
o pacote em ~7,8 MB).

## Especificação
- **Nome:** `<chave>.webp` — a `chave` do deus (a mesma de `data/deuses/<chave>.json`, de
  `web/skills/skill-<chave>-*.webp` e do `IMG[<chave>]`). Ex.: `brigid.webp`, `zeus.webp`.
- **Dimensão:** **512×590** (proporção ~0,868, a mesma da caixa do retrato: 340×392 de design).
  A caixa recorta com `object-fit: cover` a partir do TOPO — enquadre o rosto na metade de cima.
- **Peso alvo:** ~80 KB por arquivo (~7,8 MB nos 100). WebP.

## Como acendem
A build (`tools/build.js`) varre esta pasta e anota em `RETRATO_ARTE` quais chaves têm arquivo.
A sobreposição só pede `retratos/<chave>.webp` quando a chave está no manifesto → **sem `<img>` 404**.
Enquanto o grande carrega — e para todo deus SEM arquivo aqui — aparece o retrato pequeno de 168px
já embutido (`IMG`), sem buraco e sem tremida de layout.

Basta commitar os `.webp` aqui: no próximo build eles entram no manifesto e acendem sozinhos.
As outras cinco telas (grade, painel lateral, batalha, seleção de time) seguem no retrato pequeno
embutido — lá a caixa é ≤140px e a arte de 168 já sobra.

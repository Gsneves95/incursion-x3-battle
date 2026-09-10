# Fontes locais (§260)

Cinzel e Rajdhani servidas do próprio jogo — **o jogo publicado não faz requisição a domínio
externo** (invariante do §260; ver `CLAUDE.md`). Não re-adicione o `<link>` do Google Fonts.

São os woff2 **exatos** que o `fonts.googleapis.com/css2` serve (Cinzel v26, Rajdhani v16),
subset **latin + latin-ext** (o português vive no latin; latin-ext é rede de segurança). Usar
os bytes do Google garante métrica idêntica — zero diferença de layout.

Pesos = só os que o jogo usa: **Cinzel 500/700/900** e **Rajdhani 500/600/700**. O CSS declara
pesos fora disso (Cinzel 400/600/800; Rajdhani 400/800), mas eles ENCAIXAM no vizinho mais
próximo — embarcar exatamente estes 6 preserva o visual. Cinzel é variável (mesmo arquivo p/
os 3 pesos), PINADA a cada peso no `@font-face` p/ manter o encaixe.

Arquivos (8, ~122 KB):
- `cinzel-latin.woff2`, `cinzel-latinext.woff2` (variável, reusado p/ 500/700/900)
- `rajdhani-{500,600,700}-latin.woff2`, `rajdhani-{500,600,700}-latinext.woff2`

O `@font-face` (local, `font-display:block`) está em `src/shell.html`. A build copia
`web/fonts/` → `dist/fonts/`. Guardas em `tests/moldura.test.js` (§260).

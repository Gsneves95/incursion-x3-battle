# Medição das 401 artes de habilidade (§300b)

Informação para o trabalho de arte — as artes de `web/skills/`. Reproduza com `node tools/medir_artes.js`
(o critério e o porquê estão no cabeçalho dele). Duas perguntas, dois arquivos.

## M1 — quais precisam ser refeitas (`artes-medalhao.csv`)

O §300 trocou o disco circular por quadrado arredondado. Arte que só preenchia o círculo agora mostra os
cantos. **Critério de dois fatores:** medalhão = os 4 cantos **escuros** (maior canto < 0,06 de luminância
relativa) **E chapados** (maior desvio-padrão de canto < 0,05).

**Por que o segundo fator (chapado) existe** — e não é enfeite: só medir escuridão dá falso-positivo. O
milagre novo do Zeus é raio em nuvem escura — cantos ~0,08 (céu) mas textura ~0,14 (nuvem/faísca): ele
**preenche** o quadrado. Um medalhão de verdade tem fundo **chapado** (std ~0,012). Sem o fator de textura,
o Zeus e toda arte boa de fundo escuro seriam marcados como medalhão e **refeitos à toa**.

**Resultado: 203 medalhões (50,7%) · 197 preenchem (49,3%)** de 400 (as 100×4; a Defesa é compartilhada e
fica de fora). 29 deuses já têm as 4 preenchendo; 31 têm as 4 medalhão; 40 estão no meio. Lista por deus+slot
no CSV, com `cornerMax`, `cornerStdMax`, `contraste` e o subtipo (`classico` = miolo claro sobre preto ·
`escuro-cheio` = miolo também escuro).

**Erro esperado ≈ 3% (~10–15 artes).** Os limiares são estáveis (184–218 medalhões variando-os no razoável).
A zona cinza são ~57 artes na fronteira "cena escura que preenche" × "medalhão sobre preto" — onde o **olho
decide, não o número**. O critério mede o SINTOMA (canto escuro e chapado aparecendo); se a correção é
redesenho ou só estender os cantos é chamada de arte.

## M2 — distinção entre as 4 artes do mesmo deus (`artes-distincao.csv`)

Num disco de 90px, com o relógio correndo, o jogador precisa distinguir básico/habilidade/milagre de relance.
Métrica: assinatura 12×12 RGB (object-fit cover, como o jogo), **ΔRGB** = média de |Δ| por canal (0..255,
menor = mais parecidas) + correlação estrutural. 15 deuses têm um par com ΔRGB < 10 (a maioria corr 0,9+ =
quase a mesma imagem: ammit, osiris, cerberus, ymir, babi, bastet…), 83 pares < 15.

### ⚠️ O LIMITE DA MÉTRICA — leia antes de tratar o CSV como veredito

**ΔRGB mede IMAGEM repetida, não ASSUNTO repetido.** O Zeus habilidade×milagre dá **ΔRGB 44** ("distintas")
e **mesmo assim confunde**, porque as duas são "raio em nuvem escura" — mesmo motivo, execução diferente. O
CSV é **PISO, não teto**: pega quase-duplicatas (mesma imagem), **não pega** mesmo-assunto-execução-diferente.
A distinção de relance depende de um **objeto/silhueta próprio por habilidade** — isso o pixel não enxerga; o
brief sim. Conclusão para o brief das ~200: exigir um objeto reconhecível diferente por habilidade, porque
cor/pixel distinto **não basta** (o Zeus prova).

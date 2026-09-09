# Artes da campanha (§252)

Coloque aqui as artes dos atos, em `.webp` **PAISAGEM**. Gere em **1200×900 (4:3)**.

O slot da arte é a COLUNA ESQUERDA da tela do ato — medido no dist em **460×353 de design**
(proporção **1,304**), que dá **~1162×891 físicos** no aparelho do dono (800×360 em tela cheia,
escala 0,841 × DPR 3). É PAISAGEM, não retrato. (Correção do §254: o número antigo aqui — 648×1008,
"como os banners da home" — estava errado; aquilo é retrato 0,64 e o slot do ato é paisagem 1,30.
Arte em pé perderia topo e base no `cover`, justo onde as composições largas vivem.)

O recorte é por **`cover` a partir do CENTRO**: a 4:3 (1,333) numa moldura de 1,304, sobra uma
frestinha nas laterais — então **não ponha o assunto principal nas bordas**. A HISTÓRIA usa o MESMO
slot da BATALHA (medido idêntico, 460×353) — um só formato para os dois.

O nome do arquivo = o campo `arte` do ato em `data/campanha/*.json`. Enquanto o arquivo não existe,
a tela mostra o placeholder do §213 (nunca um `<img>` que dá 404). A build (`tools/build.js`) detecta
os arquivos presentes e liga a arte automaticamente — nenhum código a mudar.

Os 13 arquivos esperados:
- prologo-01-era-dos-planos.webp
- prologo-02-incursao.webp
- prologo-03-criacao-do-eixo.webp
- prologo-04-profecia-do-uno.webp
- prologo-05-inicio-do-conflito.webp
- prologo-06-ruptura-ceu-e-terra.webp
- prologo-07-ciclo-dos-expulsos.webp
- cap1-01-fragmentos-fora-de-lugar.webp
- cap1-02-conselho-temporario.webp
- cap1-03-aliancas-conflitos-oportunidades.webp
- cap1-04-trovao-sobre-o-duat.webp
- cap1-05-o-que-nezha-viu.webp
- cap1-06-caminho-do-trovao.webp

Opcional (fundo do capítulo, usado por atos sem arte própria): prologo-fundo.webp, cap1-fundo.webp

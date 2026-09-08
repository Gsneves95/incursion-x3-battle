# Artes da campanha (§252)

Coloque aqui as artes dos atos, em `.webp` 648×1008 (proporção 1,556, como os banners da home).
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

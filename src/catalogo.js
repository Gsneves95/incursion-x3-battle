// src/catalogo.js — CATÁLOGO de deuses. Monta o objeto GODS a partir dos DADOS
// (um arquivo por deus em data/deuses/<key>.json). NÃO tem regra de combate — isso é o
// engine.js. É o ÚNICO lugar que produz GODS: no browser o build injeta o array `DEUSES`
// e emite `const GODS = montarCatalogo(DEUSES)`; a UI lê esse global. No Node (testes),
// este módulo lê os arquivos e EXPORTA GODS — o mesmo objeto que o engine reexporta como
// E.GODS. O motor RECEBE o catálogo (via novoEstado) e assa o kit nas unidades.

function montarCatalogo(lista) {
  const cat = {};
  for (const g of lista) cat[g.key] = g;
  return cat;
}

if (typeof module !== 'undefined') {
  // Node: lê os arquivos de dados. O `fs` vive AQUI, nunca no motor (que é função pura).
  // No browser esta parte é removida pelo semGuard do build (corta a partir deste if).
  const fs = require('fs'), path = require('path');
  const dir = path.join(__dirname, '..', 'data', 'deuses');
  const lista = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  module.exports = { GODS: montarCatalogo(lista), montarCatalogo };
}

// src/bestiario.js — CATÁLOGO do BESTIÁRIO PvE (as 12 criaturas das Ordálias). Mesma
// FORMA de deus (key/nome/elem/classe/funcao/passiva?/ab) + campo `hp` (tropa fora da
// faixa de 120; chefe = deus do roster + HP inflado no `montar` da Provação, não aqui).
// Um arquivo por criatura em data/bestiario/<key>.json.
//
// Espelha catalogo.js: no browser (quando a UI de Ordália existir) o build injeta o array
// BESTIARIO_DADOS e emite `const BESTIARIO = montarCatalogo(BESTIARIO_DADOS)`; no Node
// (provacao.js, solucionador, testes) este módulo lê os arquivos e EXPORTA BESTIARIO.
// Reusa o montarCatalogo do catalogo.js (um caminho só — chave→kit, sem regra de combate).

if (typeof module !== 'undefined') {
  const fs = require('fs'), path = require('path');
  const { montarCatalogo } = require('./catalogo.js');
  const dir = path.join(__dirname, '..', 'data', 'bestiario');
  const lista = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
    : [];
  module.exports = { BESTIARIO: montarCatalogo(lista) };
}

// §263 — MIGRAÇÃO de carimbo: REFRESCA só o campo `verificacao.hash` com a nova função
// (projeção de combate), mantendo nivelIA/veredito/lancesNesteCaminho/comDica/nos/ms/caminho
// INTACTOS. NÃO re-resolve — o dado de combate não mudou (só o ESCOPO do hash), então o
// veredito medido continua válido. Por isso a migração é incapaz de alterar um balanço em
// silêncio (o medo do §262): ela não roda o solucionador, só recalcula o hash.
//   uso: node tools/recarimbar_hash.js          (só mostra o que mudaria — dry-run)
//        node tools/recarimbar_hash.js --aplicar (grava)
const fs = require('fs'), path = require('path');
const PROV = require('../src/provacao.js');
const dir = path.join(__dirname, '..', 'data', 'provacoes');
const aplicar = process.argv.includes('--aplicar');
let mud = 0, ig = 0;
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json') && x !== 'indice.json').sort()) {
  const p = path.join(dir, f);
  const raw = fs.readFileSync(p, 'utf8'); const prov = JSON.parse(raw);
  if (!prov.verificacao) { console.log('  sem carimbo:', prov.key); ig++; continue; }
  const antigo = prov.verificacao.hash, novo = PROV.catalogoHash(prov);
  if (antigo === novo) { ig++; continue; }
  mud++;
  if (aplicar) {
    // substituição CIRÚRGICA da linha do hash — preserva formatação/ordem do arquivo
    const re = new RegExp('("hash"\\s*:\\s*")' + antigo + '(")');
    const novoRaw = raw.replace(re, '$1' + novo + '$2');
    if (novoRaw === raw) { console.error('  !! não achei o hash p/ trocar em', prov.key); process.exit(1); }
    fs.writeFileSync(p, novoRaw);
  }
  console.log('  ' + prov.key.padEnd(16) + ' ' + antigo + ' → ' + novo + (aplicar ? '  (gravado)' : ''));
}
console.log('\n' + (aplicar ? 'REFRESCADOS' : 'mudariam') + ': ' + mud + '   inalterados: ' + ig);
if (!aplicar) console.log('(dry-run — rode com --aplicar para gravar)');

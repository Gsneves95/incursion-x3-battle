// §324 P3b / R2 — AUDITORIA DE CORTES: compara o kit atual (data/deuses) com um COMMIT DE
// REFERÊNCIA e aponta todo slot cujo DANO PRINCIPAL ou CURA foi cortado em mais de LIMITE
// (padrão 40%) numa mesma revisão. Regra de rebalanceamento (DECISOES/CLAUDE.md): se um deus
// precisa descer tanto, o resto vem por OUTRO caminho (custo, recarga, efeito secundário) —
// não por esmagar o número principal do slot.
//
//   node tools/auditar_cortes.js [ref] [--limite=0.4]
//      ref     commit/tag de referência (padrão: a tag/█ do início da revisão em curso)
//      --limite fração máxima de corte tolerada (0.4 = 40%)
//
// Saída: uma linha por violação; código de saída 1 se houver alguma (serve em CI/para conferência).
'use strict';
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');

const arg = (n, d) => { const p = process.argv.find(a => a.startsWith('--' + n + '=')); return p ? p.split('=')[1] : d; };
const REF = process.argv.slice(2).find(a => !a.startsWith('--')) || '21951d8';   // baseline do §324 por padrão
const LIM = parseFloat(arg('limite', '0.4'));

const nome = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(raiz, 'data/kits.json'), 'utf8')).map(g => [g.key, g.nome]));
const keys = fs.readdirSync(path.join(raiz, 'data/deuses')).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
const cur = k => JSON.parse(fs.readFileSync(path.join(raiz, 'data/deuses', k + '.json'), 'utf8'));
const old = k => { try { return JSON.parse(cp.execSync(`git show ${REF}:data/deuses/${k}.json`, { cwd: raiz }).toString()); } catch (e) { return null; } };
const mainDmg = a => { const e = (a.fx || []).find(x => x.t === 'dmg'); return e ? e.v : null; };   // dano principal = 1º fx de dano (incondicional)
const heal = a => { const e = (a.fx || []).find(x => x.t === 'heal'); return e ? e.v : null; };

const slots = ['basico', 'habilidade', 'milagre'];
const viol = [];
for (const k of keys) {
  const O = old(k); if (!O) continue; const N = cur(k);
  slots.forEach((s, i) => {
    const oa = (O.ab || [])[i], na = (N.ab || [])[i]; if (!oa || !na) return;
    for (const [lbl, fn] of [['dano principal', mainDmg], ['cura', heal]]) {
      const ov = fn(oa), nv = fn(na);
      if (ov != null && nv != null && ov > 0 && nv < ov * (1 - LIM)) {
        const pct = (100 * (ov - nv) / ov).toFixed(0);
        viol.push(`${(nome[k] || k)} / ${na.nome} [${s}] ${lbl}: ${ov} → ${nv}  (−${pct}%)`);
      }
    }
  });
}
console.log(`== R2 cortes > ${(LIM * 100).toFixed(0)}% vs ${REF} ==`);
if (!viol.length) console.log('  nenhum — OK');
else viol.forEach(v => console.log('  ' + v));
process.exit(viol.length ? 1 : 0);

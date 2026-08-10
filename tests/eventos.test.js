// tests/eventos.test.js — a VARREDURA de gramática (docs/eventos.md) e a prova do narrador TOTAL.
//
// Parte A (Node puro): joga partidas IA vs IA completas, colhe TODOS os eventos de st.log
// (mais st.fim) e falha se qualquer um violar o contrato: tipo fora de E.VOCAB.eventos, campo
// fora de E.VOCAB.camposEvento, motivo fora de E.VOCAB.motivos, ou uma CHAVE que na verdade é
// nome exibível ('Zeus' em vez de 'zeus', lado 'Jogador 1' em vez de 0, kind '[puro]'). Assim
// tipo novo nos 73 kits entra certo por construção — a build reprova antes de virar convenção.
//
// Parte B (jsdom): carrega o bundle e prova que `narrar` é TOTAL (regra 5) — evento de tipo
// inventado NÃO some do registro — e que resolve chave->nome pelo catálogo da partida.

const fs = require('fs');
const path = require('path');
const E = require('../src/engine.js');
Object.assign(global, E);                       // agir/acoesDe/podeAgir... como globais p/ ia.js
const { iaProximaAcao } = require('../src/ia.js');

let f = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };

const V = E.VOCAB;
const CHAVE = /^[a-z0-9_]+$/;                    // deus é chave minúscula (zeus, __inv) — nunca "Zeus"
const EFEITO_OK = /^[A-Za-z]+$/;                 // chave de efeito: só letras, sem espaço/colchete/pt-BR
const KIND_OK = new Set(['puro', 'afetado', 'perfurante']);
const SLOT_OK = new Set(['basico', 'habilidade', 'milagre', 'defesa']);
const ELEM_OK = new Set(E.ELEMS);

// valida UM campo de um evento. Devolve mensagem de erro ou null.
function erroCampo(k, val, ev) {
  if (!V.camposEvento.includes(k)) return `campo fora do vocabulário: "${k}"`;
  switch (k) {
    case 'tipo': return V.eventos.includes(val) ? null : `tipo fora do vocabulário: "${val}"`;
    case 'turno': case 'valor': case 'duracao': case 'absorvido': case 'modo':
      return typeof val === 'number' ? null : `${k} deveria ser número, veio ${JSON.stringify(val)}`;
    case 'lado':
      return val === 0 || val === 1 ? null : `lado deveria ser 0/1 (não rótulo), veio ${JSON.stringify(val)}`;
    case 'origem': case 'alvo': case 'passiva':
      return typeof val === 'string' && CHAVE.test(val) ? null : `${k} deveria ser CHAVE minúscula, veio ${JSON.stringify(val)}`;
    case 'kind':
      return KIND_OK.has(val) ? null : `kind fora do conjunto / formatado, veio ${JSON.stringify(val)}`;
    case 'slot':
      return SLOT_OK.has(val) ? null : `slot desconhecido, veio ${JSON.stringify(val)}`;
    case 'para':
      return ELEM_OK.has(val) ? null : `para deveria ser elemento, veio ${JSON.stringify(val)}`;
    case 'motivo':
      return V.motivos.includes(val) ? null : `motivo fora do conjunto FECHADO, veio ${JSON.stringify(val)}`;
    case 'efeito':
      return typeof val === 'string' && EFEITO_OK.test(val) ? null : `efeito deveria ser CHAVE (sem formatação), veio ${JSON.stringify(val)}`;
    case 'resultado':
      return val === 'vitoria' || val === 'empate' ? null : `resultado inválido, veio ${JSON.stringify(val)}`;
    case 'opcoes':
      return Array.isArray(val) && val.every(x => typeof x === 'number') ? null : `opcoes deveria ser array de índices, veio ${JSON.stringify(val)}`;
    default: return null;
  }
}

function validarEvento(ev, ctx) {
  if (!ev || typeof ev !== 'object') { ok(false, `${ctx}: evento não é objeto`); return; }
  if (typeof ev.tipo !== 'string') { ok(false, `${ctx}: evento sem tipo`); return; }
  for (const k of Object.keys(ev)) {
    const err = erroCampo(k, ev[k], ev);
    if (err) ok(false, `${ctx} [${ev.tipo}]: ${err}`);
  }
}

console.log('== A. varredura de gramática: toda partida só emite eventos do contrato ==');
{
  const keys = Object.keys(E.GODS);
  const pick = n => { const t = []; let i = n; while (t.length < 3) { const k = keys[i % keys.length]; if (!t.includes(k)) t.push(k); i += 2; } return t; };
  const vistos = new Set();
  let totalEventos = 0;
  for (let s = 1; s <= 24; s++) {
    const st = E.novoEstado(pick(s), pick(s + 4), s, s % 2);
    let guard = 0;
    while (!st.fim && guard++ < 300) {
      let passos = 0, a;
      while (!st.fim && (a = iaProximaAcao(st)) && passos++ < 6) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
      if (st.fim) break;
      E.fimTurno(st);
    }
    st.log.forEach((ev, i) => { validarEvento(ev, `seed ${s} log[${i}]`); vistos.add(ev.tipo); totalEventos++; });
    // st.fim também é estruturado e segue a mesma gramática
    if (st.fim) { validarEvento(st.fim, `seed ${s} st.fim`); ok(st.fim.tipo === 'fim', `seed ${s}: st.fim.tipo deveria ser 'fim'`); }
  }
  console.log(`  ${totalEventos} eventos varridos em 24 partidas · tipos vistos: ${[...vistos].sort().join(', ')}`);
  // cobertura mínima: os tipos estruturais têm de aparecer (senão a varredura não prova nada)
  for (const t of ['turno', 'acao', 'dano', 'queda']) ok(vistos.has(t), `esperava ver o tipo "${t}" em 24 partidas`);
}

console.log('== A2. cenários determinísticos: DoT (chave) e modo alternado (rótulo no kit) ==');
{
  // Brigid Fagulha da Forja aplica queimadura; o evento `dot` sai quando ela CONTA (início do
  // turno de quem sofre, regra 3) -> avança um turno para o DoT do lado 1 tiquetaquear.
  const st = E.novoEstado(['brigid', 'zeus', 'zeus'], ['cuca', 'cuca', 'cuca'], 3, 0);
  const brigid = st.lados[0].units[0], alvo = st.lados[1].units[0];
  E.agir(st, brigid.uid, 'basico', [alvo.uid]);
  E.fimTurno(st);                                  // passa ao lado 1; a Queimadura conta no início
  const dotDado = st.log.find(e => e.tipo === 'dot');
  ok(dotDado && dotDado.efeito === 'queimadura', `dot com efeito CHAVE 'queimadura' (veio ${dotDado && dotDado.efeito})`);
  validarEvento(dotDado, 'dot determinístico');

  // Nezha Arsenal Celeste: acao com modo 0/1; o rótulo (ANEL/MANTO) mora no kit, não no motor
  const st2 = E.novoEstado(['nezha', 'zeus', 'zeus'], ['cuca', 'cuca', 'cuca'], 3, 0);
  const nezha = st2.lados[0].units[0];
  st2.lados[0].orbs['Chama'] = 9;
  E.agir(st2, nezha.uid, 'habilidade', [st2.lados[1].units[0].uid]);
  const acaoModo = st2.log.find(e => e.tipo === 'acao' && 'modo' in e);
  ok(acaoModo && typeof acaoModo.modo === 'number', `acao alternada carrega modo numérico (veio ${acaoModo && acaoModo.modo})`);
  const nezhaKit = E.GODS['nezha'].ab.find(a => a.slot === 'habilidade');
  ok(Array.isArray(nezhaKit.modos) && nezhaKit.modos.length === 2, 'o kit da Nezha carrega os rótulos de modo (ANEL/MANTO)');
}

console.log('== B. narrador TOTAL: tipo desconhecido não some, chave vira nome ==');
{
  let jsdom; try { jsdom = require('jsdom'); } catch (e) { console.log('  (jsdom ausente — pulei a parte B)'); }
  if (jsdom) {
    const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
    const dom = new jsdom.JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
    const w = dom.window, d = w.document;
    const $ = s => d.querySelector(s);
    // entra numa batalha real (mesmo caminho da interface.test): st ganha catId p/ resolver nomes
    w.eval("ir('selecao');pick=[['zeus','ogum','brigid'],['cuca','sobek','ganesha']];vez=0;render();document.getElementById('bgo').click();st.ativo=0;st.starter=0;st.aberturaFeita=true;vsCPU=false;ov=null;st.fim=null;menuAberto=false;render()");

    // 1) tipo INVENTADO tem de aparecer no registro (regra 5) — nem que como despejo cru
    w.eval("st.log.push({turno:st.turno,tipo:'__inventado__',foo:'bar',valor:7}); ov='log'; render()");
    const txt = $('#logscroll').textContent;
    ok(/__inventado__/.test(txt), 'evento de tipo desconhecido aparece no registro (narrador TOTAL)');
    ok(/foo=bar/.test(txt) && /valor=7/.test(txt), 'o despejo cru mostra os campos do evento desconhecido');

    // 2) evento conhecido: chave -> nome (pelo catálogo), valor e kind formatados na exibição
    w.eval("st.log.push({turno:st.turno,tipo:'dano',origem:'zeus',alvo:'cuca',valor:15,kind:'puro'}); render()");
    const t2 = $('#logscroll').textContent;
    ok(/Zeus/.test(t2) && /Cuca/.test(t2) && /15/.test(t2) && /\[puro\]/.test(t2), 'dano narrado: chaves viram nomes, valor e kind aparecem');

    // 3) DoT: efeito CHAVE 'queimadura' vira "Queimadura" no registro
    w.eval("st.log.push({turno:st.turno,tipo:'dot',alvo:'cuca',efeito:'queimadura',valor:5}); render()");
    ok(/Queimadura/.test($('#logscroll').textContent), 'DoT chave "queimadura" é exibido como "Queimadura"');

    // 4) linha autorada pela view (msg) passa direto pelo narrador
    ok(w.eval("narrar({tipo:'x', msg:'linha crua da view'})") === 'linha crua da view', 'linha com msg passa direto (autoria da view)');

    // 5) st.fim estruturado vira banner
    ok(w.eval("narrar({tipo:'fim',resultado:'empate'})") === 'EMPATE', 'fim empate -> "EMPATE"');
    dom.window.close();
  }
}

console.log('');
console.log(f === 0 ? '>>> EVENTOS OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);

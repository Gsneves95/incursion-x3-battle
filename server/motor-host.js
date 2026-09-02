// server/motor-host.js — F5.0: o MOTOR AUTORITATIVO do servidor.
// O servidor É a fonte da verdade; o cliente só desenha. Aqui o motor da Fase 1 é IMPORTADO
// (não copiado) — o MESMO src/engine.js que o build embute no cliente. Uma fonte de verdade.
//
// Não há sincronização em tempo real: o motor é DETERMINÍSTICO e todo valor é público, então o
// estado é reproduzível a partir da montagem + a sequência de ações. Isto sustenta a prova da
// F5.0 (estado idêntico por hash em cada passo) e a reconexão da F5.4 (reenviar o estado inteiro).
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
// ACOPLAMENTO RESIDUAL (dívida da Fase 1, reportada): o ENGINE importa limpo (self-contained), MAS
// provacao.js e ia.js leem as funções do motor do ESCOPO GLOBAL (hábito de concatenação do navegador,
// onde tudo é global). Para importá-los no Node é preciso pôr o motor no global ANTES — é o mesmo
// contorno que a suíte já usa (tests: `Object.assign(global, E)`). Não reescrevo o motor; exponho-o.
Object.assign(globalThis, E);
const PROV = require(path.join(__dirname, '..', 'src', 'provacao.js'));
const ia = require(path.join(__dirname, '..', 'src', 'ia.js'));

// ---- serialização canônica + hash (PURO JS, sem crypto: roda igual no Node e no navegador) ----
// canônico = chaves ordenadas, para o hash não depender da ordem de inserção. O hash é FNV-1a 32 bits;
// a prova compara TAMBÉM a string canônica inteira (mais forte que o hash), e mostra o hash ao humano.
function canon(x) {
  if (x === null || typeof x !== 'object') return JSON.stringify(x);
  if (Array.isArray(x)) return '[' + x.map(canon).join(',') + ']';
  return '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + canon(x[k])).join(',') + '}';
}
function hashStr(s) {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return ('00000000' + h.toString(16)).slice(-8);
}
function hashEstado(st) { return hashStr(canon(st)); }
function serializar(st) { return JSON.stringify(st); }
function tamanhoBytes(st) { return Buffer.byteLength(serializar(st), 'utf8'); }

// ---- montagem de uma partida a partir de um Pergaminho (determinística: seed) ----
function montar(pergaminho) { return PROV.montarProvacao(pergaminho); }

// ---- aplicar UMA ação ao estado autoritativo. Retorna o resultado do motor (ok/erro). ----
// op: {tipo:'agir', uid, slot, alvos, escolhas, modo} | {tipo:'fim'}
function aplicar(st, op) {
  if (op.tipo === 'fim') { E.fimTurno(st); return { ok: true }; }
  if (op.tipo === 'agir') return E.agir(st, op.uid, op.slot, op.alvos || [], op.escolhas || null, op.modo || null);
  return { ok: false, erro: 'op desconhecida' };
}

// ---- DRIVER determinístico: gera uma sequência de ações jogando uma política FIXA (cada unidade
// age com a 1ª ação disponível no 1º alvo válido; depois encerra e roda a IA da Provação até voltar).
// Serve SÓ para produzir um roteiro reproduzível — a prova depois REPRODUZ o mesmo roteiro nos dois
// motores. Registra cada CHAMADA ao motor (as da IA inclusas), para o cliente reproduzir sem re-rodar a IA.
function gerarRoteiro(st, { maxTurnos = 40 } = {}) {
  const ops = [];
  let guarda = 0;
  while (!st.fim && st.turno <= maxTurnos && guarda++ < 500) {
    for (const u of st.lados[st.ativo].units) {
      if (st.fim) break;
      if (!E.podeAgir(u)) continue;
      const acoes = E.acoesDe(st, u).filter(a => a.disponivel);
      if (!acoes.length) continue;
      const a = acoes[0];
      let alvos = [];
      if (a.alvo === 'distribui') { const vs = E.alvosValidos(st, u, a, 0, []); if (vs.length) alvos = [vs[0].uid]; }
      else {
        const passos = (a.passos || []).length;
        let bom = true;
        for (let p = 0; p < passos; p++) { const vs = E.alvosValidos(st, u, a, p, alvos); if (!vs.length) { bom = false; break; } alvos.push(vs[0].uid); }
        if (!bom) continue;
      }
      const op = { tipo: 'agir', uid: u.uid, slot: a.slot, alvos, escolhas: null, modo: null };
      const r = aplicar(st, op);
      if (r && r.ok) ops.push(op);
    }
    if (st.fim) break;
    ops.push({ tipo: 'fim' }); E.fimTurno(st);
    let p = 0, mv;
    while (!st.fim && (mv = ia.iaProximaAcao(st, 'normal')) && p++ < 8) {
      const op = { tipo: 'agir', uid: mv.uid, slot: mv.slot, alvos: mv.alvos || [], escolhas: mv.escolhas || null, modo: mv.modo || null };
      const r = aplicar(st, op); if (r && r.ok) ops.push(op);
    }
    if (!st.fim) { ops.push({ tipo: 'fim' }); E.fimTurno(st); }
  }
  return ops;
}

// ---- REPRODUZIR um roteiro num motor `motor` (E do servidor OU o motor embutido no cliente),
// coletando o estado serializado após CADA passo (passo 0 = a montagem). É o coração da prova. ----
function reproduzir(montarFn, ops) {
  const st = montarFn();
  const passos = [serializar(st)];
  for (const op of ops) { aplicar(st, op); passos.push(serializar(st)); }
  return passos;
}

module.exports = {
  E, ia, PROV, canon, hashStr, hashEstado, serializar, tamanhoBytes,
  montar, aplicar, gerarRoteiro, reproduzir,
};

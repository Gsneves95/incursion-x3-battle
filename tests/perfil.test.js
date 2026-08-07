// Perfil + persistência (F0.4). Funções puras + a camada de armazenamento com um
// localStorage falso em memória (Node não tem um).
const P = require('../src/perfil.js');
Object.assign(global, P);   // expõe novoPerfil/migrar/problemaDeForma... p/ armazenamento.js

function fakeLS() {
  const s = {};
  return {
    getItem: k => (k in s ? s[k] : null),
    setItem: (k, v) => { s[k] = String(v); },
    removeItem: k => { delete s[k]; },
    _dump: () => s,
  };
}
global.localStorage = fakeLS();
const A = require('../src/armazenamento.js');

let f = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };
const RK = new Set(['zeus', 'ogum', 'tyr', 'sobek', 'brigid', 'ganesha', 'cuca', 'fujin', 'nezha', 'thor', 'hera']);

console.log('== novo perfil ==');
{
  const p = P.novoPerfil(100);
  ok(Object.keys(p.deuses).length === 9, 'novo perfil tem os 9 iniciais');
  ok(p.deuses.zeus.copias === 1 && p.deuses.zeus.obtidoEm === 100, 'inicial com 1 cópia e obtidoEm');
  ok(p.moedas.gema === 0 && p.moedas.essencia === 0, 'moedas zeradas');
  ok(p.versao === P.VERSAO_PERFIL, 'versão marcada');
  ok(!('historico' in p), 'histórico NÃO mora no perfil');
  console.log('  9 iniciais, moedas 0, sem histórico no objeto');
}

console.log('== pureza: nunca muta o argumento ==');
{
  const p = P.novoPerfil();
  const q = P.adicionarDeus(p, 'thor', 5);
  ok(p.deuses.thor === undefined, 'o perfil original não foi mutado');
  ok(q.deuses.thor.copias === 1, 'a cópia nova tem thor');
  const q2 = P.adicionarDeus(q, 'thor');
  ok(q2.deuses.thor.copias === 2, 'repetido incrementa cópias');
  console.log('  adicionarDeus é puro; repetido soma cópia');
}

console.log('== creditar / debitar sem saldo negativo ==');
{
  let p = P.novoPerfil();
  p = P.creditar(p, 'gema', 300);
  ok(p.moedas.gema === 300, 'creditou 300 gemas');
  p = P.debitar(p, 'gema', 150);
  ok(p.moedas.gema === 150, 'debitou 150');
  let lancou = false;
  try { P.debitar(p, 'gema', 1000); } catch (e) { lancou = true; }
  ok(lancou, 'debitar acima do saldo deve lançar (nunca fica negativo)');
  ok(p.moedas.gema === 150, 'a tentativa que lançou não mexeu no saldo');
  console.log('  creditar/debitar ok; sem saldo negativo');
}

console.log('== salvar time acima do limite ==');
{
  let p = P.novoPerfil();
  for (let i = 0; i < P.MAX_TIMES; i++) p = P.salvarTime(p, { nome: 'T' + i, deuses: ['zeus', 'ogum', 'tyr'] });
  ok(p.times.length === P.MAX_TIMES, `guardou ${P.MAX_TIMES} times`);
  ok(p.times.every(t => t.id != null), 'todo time ganhou id');
  let lancou = false;
  try { P.salvarTime(p, { nome: 'demais', deuses: ['zeus', 'ogum', 'tyr'] }); } catch (e) { lancou = true; }
  ok(lancou, `o ${P.MAX_TIMES + 1}º time deve lançar`);
  const edit = P.salvarTime(p, { id: p.times[0].id, nome: 'renomeado', deuses: ['thor', 'hera', 'zeus'] });
  ok(edit.times.length === P.MAX_TIMES && edit.times[0].nome === 'renomeado', 'editar time existente não cria novo');
  console.log('  limite respeitado; edição por id não estoura');
}

console.log('== round-trip: salvar -> carregar preserva ==');
{
  global.localStorage = fakeLS();
  let p = P.novoPerfil(7); p = P.creditar(p, 'gema', 42); p = P.adicionarDeus(p, 'thor', 9);
  const r = A.salvar(p); ok(r.ok, 'salvar deu ok');
  const c = A.carregar({ rosterKeys: RK });
  ok(c.motivo === null, 'carregar sem motivo de erro');
  ok(JSON.stringify(c.perfil) === JSON.stringify(p), 'perfil carregado é igual ao salvo');
  console.log('  ida e volta idêntica');
}

console.log('== migrar é chamada no caminho normal (mesmo sem trabalho) ==');
{
  global.localStorage = fakeLS();
  // perfil de forma válida, mas versao 0 -> migrar tem de elevar para 1 no carregar
  const antigo = P.novoPerfil(); antigo.versao = 0;
  localStorage.setItem(A.CHAVE_PERFIL, JSON.stringify(antigo));
  const c = A.carregar({ rosterKeys: RK });
  ok(c.motivo === null, 'carregou o perfil migrado');
  ok(c.perfil.versao === 1, 'migrar elevou versao 0 -> 1 no caminho normal');
  console.log('  v0 -> v1 no carregar, sem cair para novoPerfil');
}

console.log('== salvar reporta falha (não é silencioso) ==');
{
  const ls = fakeLS();
  ls.setItem = () => { throw new Error('QuotaExceededError'); };   // cota estourada / aba privada iOS
  global.localStorage = ls;
  const r = A.salvar(P.novoPerfil());
  ok(r.ok === false && /Quota/.test(r.erro), 'salvar devolve {ok:false, erro} em vez de engolir');
  console.log('  falha de escrita vira erro observável');
}

console.log('== validação de FORMA: >=3 formas inválidas caem para novoPerfil ==');
{
  const casos = [
    ['deuses como array', p => { p.deuses = ['zeus']; }],
    ['moeda negativa', p => { p.moedas.gema = -5; }],
    ['time com 4 deuses', p => { p.times = [{ id: 1, nome: 'x', deuses: ['zeus', 'ogum', 'tyr', 'hera'] }]; }],
    ['chave fora do roster', p => { p.deuses.naoexiste = { copias: 1, favorito: false, obtidoEm: 0 }; }],
  ];
  for (const [nome, corromper] of casos) {
    global.localStorage = fakeLS();
    const p = P.novoPerfil(); corromper(p);
    localStorage.setItem(A.CHAVE_PERFIL, JSON.stringify(p));
    const c = A.carregar({ rosterKeys: RK });
    ok(c.motivo && /forma inválida/.test(c.motivo), `[${nome}] motivo registrado: ${c.motivo}`);
    ok(Object.keys(c.perfil.deuses).length === 9 && c.perfil.moedas.gema === 0, `[${nome}] caiu para novoPerfil`);
  }
  // JSON quebrado (o caso "fácil"), para não regredir
  global.localStorage = fakeLS();
  localStorage.setItem(A.CHAVE_PERFIL, '{isto não é json');
  const cj = A.carregar({ rosterKeys: RK });
  ok(cj.motivo === 'JSON inválido', 'JSON quebrado também cai para novoPerfil');
  console.log('  4 formas inválidas + JSON quebrado, cada uma com motivo');
}

console.log('== histórico: chave separada, teto 200, independente do perfil ==');
{
  global.localStorage = fakeLS();
  for (let i = 0; i < 205; i++) A.registrarHistorico({ data: i, tipo: 'teste', detalhe: i });
  const h = A.carregarHistorico();
  ok(h.length === 200, `histórico limitado a 200 (tem ${h.length})`);
  ok(h[0].data === 5 && h[199].data === 204, 'mantém as 200 últimas');
  // histórico corrompido não derruba o perfil
  A.salvar(P.novoPerfil());
  localStorage.setItem(A.CHAVE_HIST, 'lixo{');
  ok(A.carregarHistorico().length === 0, 'histórico corrompido lê como vazio');
  ok(A.carregar({ rosterKeys: RK }).motivo === null, 'e o perfil continua carregando normalmente');
  // apagar limpa as duas chaves
  A.registrarHistorico({ data: 1 }); A.apagar();
  ok(localStorage.getItem(A.CHAVE_PERFIL) === null && localStorage.getItem(A.CHAVE_HIST) === null, 'apagar limpa perfil E histórico');
  console.log('  chave separada; corrupção isolada; apagar limpa as duas');
}

console.log('== validação usa o ROSTER (100), não os implementados (11) ==');
{
  const rosterComHades = new Set([...RK, 'hades']);   // hades existe no roster, mas sem kit no motor
  global.localStorage = fakeLS();
  let p = P.novoPerfil(); p = P.adicionarDeus(p, 'hades', 1);
  localStorage.setItem(A.CHAVE_PERFIL, JSON.stringify(p));
  const c = A.carregar({ rosterKeys: rosterComHades });
  ok(c.motivo === null && !!c.perfil.deuses.hades, 'deus do roster SEM kit no motor carrega normal (valida contra os 100, não os 11)');
  global.localStorage = fakeLS();
  let q = P.novoPerfil(); q.deuses.zzznaoexiste = { copias: 1, favorito: false, obtidoEm: 0 };
  localStorage.setItem(A.CHAVE_PERFIL, JSON.stringify(q));
  ok(/roster/.test(A.carregar({ rosterKeys: rosterComHades }).motivo || ''), 'deus fora do roster é rejeitado');
  console.log('  hades (roster, sem kit) carrega; chave fora do roster cai para novo');
}

console.log('== registrarInvocacao: coleção + total + pity, e sobrevive ao reload ==');
{
  let p = P.novoPerfil();
  const res = { resultados: [{ key: 'hades', raridade: 'SS' }, { key: 'zeus', raridade: 'A' }], pity: 0 };
  p = P.registrarInvocacao(p, res, 42);
  ok(p.invocacao.total === 2, 'total += 2');
  ok(p.invocacao.desdeUltimoSS === 0, 'pity de saída gravado no perfil');
  ok(p.deuses.hades && p.deuses.hades.copias === 1 && p.deuses.hades.obtidoEm === 42, 'deus novo entra na coleção com data');
  ok(p.deuses.zeus.copias === 2, 'deus repetido soma cópia');
  global.localStorage = fakeLS();
  A.salvar(p);
  const c = A.carregar({ rosterKeys: new Set([...RK, 'hades']) });
  ok(c.perfil.invocacao.total === 2 && c.perfil.invocacao.desdeUltimoSS === 0, 'total e pity sobrevivem ao reload');
  console.log('  invocação escreve coleção/total/pity via perfil.js e persiste');
}

console.log('');
console.log(f === 0 ? '>>> PERFIL OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);

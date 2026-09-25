'use strict';
// FASE 6 / §313-§314 — PROVAÇÕES: as 91 com os REQUISITOS DO DONO (vínculo temático), cada uma uma LISTA
// DE OBJETIVOS (§313), UMA ATIVA por vez (§314). A árvore revalidada por varredura + as 7 babás (§313); a
// REGRA DE CONTAGEM (vitória avança todos os cumpridos; derrota zera só as sequências; pausada congela; só
// a ativa conta); a disponibilidade (ranque + nomes); cumprir concede+esvazia; e a GUARDA (o cliente não
// forja progresso; abandono = derrota; idempotência).

const assert = require('assert');
const contas = require('../server/contas.js');
const salas = require('../server/salas.js');
const missoes = require('../server/missoes.js');
const gerador = require('../tools/gerar_missoes.js');
const reqDoc = require('../data/missoes_requisitos.json');
const req = Array.isArray(reqDoc) ? reqDoc : reqDoc.missoes;   // §313: arquivo é {missoes, objetivos}
const E = require('../src/engine.js');
const { iaProximaAcao } = require('../src/ia.js');

let passes = 0;
function ok(c, m) { assert.ok(c, m); console.log('  ✓ ' + m); passes++; }
function eq(a, b, m) { assert.strictEqual(a, b, m + ` (esperado ${b}, veio ${a})`); console.log('  ✓ ' + m); passes++; }

function novaConta(deuses, pontos) { const r = contas.criar({ faixaIdade: 'maior' }); const c = r.conta; for (const k of deuses) contas._darDeus(c.token, k); if (pontos) contas._contaPorId(c.id).ranque.pontos = pontos; return c; }
function setRank(id, p) { contas._contaPorId(id).ranque.pontos = p; }
function salaFake(idA, idB, time0, time1, st, modo = 'pvp') {
  return { P: { st }, modo, ranqueado: false, registrado: false, pontuado: false, resultado: null,
    time0: time0.slice(), time1: time1.slice(), participantes: [{ contaId: idA }, { contaId: idB }] };
}
function vitoria(idA, idB, t0, t1, ladoVenc) { missoes.registrarPvP(salaFake(idA, idB, t0, t1, { turno: 3, fim: { lado: ladoVenc }, log: [] })); }

console.log('== FASE 6 / MISSÕES (§230 volume+tema · §241 ranque+sequência+desde-desbloqueio) ==');

// ---------------------------------------------------------------------------
// 1. A ÁRVORE revalidada por VARREDURA contra os DADOS (§202) + a distribuição/rampa do §241.
// ---------------------------------------------------------------------------
console.log('\n== 1. a árvore: sem ciclo · alcançáveis · rampa em ordem · caso Maia · distribuição por faixa ==');
{
  const doc = gerador.gerar();
  const v = gerador.validar(doc);
  ok(v.ok, 'VALIDA por varredura: ' + (v.ok ? 'sem ciclo, 91 alcançáveis, rampa em ordem, Maia fecha' : v.erros.join('; ')));
  eq(Object.keys(doc.missoes).length, 91, '91 missões');
  eq(v.alcancados, 91, 'os 91 alcançáveis a partir dos 9 iniciais');
  ok(v.maiaCross, 'caso MAIA confirmado (itzamná exige Egípcia+ra; os outros 3 Maias descem dele)');

  const cnt = { A: 0, S: 0, SS: 0 }; let comComp = 0;
  for (const k in doc.missoes) { cnt[doc.missoes[k].raridade]++; if (doc.missoes[k].companheiro) comComp++; }
  ok(cnt.A === 46 && cnt.S === 30 && cnt.SS === 15, `raridade real: A ${cnt.A} · S ${cnt.S} · SS ${cnt.SS}`);
  eq(comComp, 83, '83 têm companheiro; 8 são só volume (portões de entrada)');

  // §241: DISTRIBUIÇÃO por faixa, mais generosa embaixo, soma 91.
  const dist = doc.distribuicao.map(f => f.quantas);
  assert.deepStrictEqual(dist, [18, 15, 13, 12, 11, 9, 7, 6], 'distribuição por faixa 18·15·13·12·11·9·7·6');
  console.log('  ✓ distribuição por faixa 18·15·13·12·11·9·7·6 (soma 91)'); passes++;
  eq(dist[0] + dist[1] + dist[2], 46, 'as 3 primeiras faixas abrem 46/91 (51%)');

  // §313/§314: a RAMPA agora vive no K das sequências dos OBJETIVOS (s/sp/c) — correlacionada à faixa
  // (2 embaixo → 4 no topo), TETO 4. Toda Provação com sequência usa o K da sua faixa (SEGUIDAS_POR_TIER).
  let kForaDaRampa = 0, kAcimaTeto = 0;
  for (const k in doc.missoes) { const m = doc.missoes[k]; const K = doc.seguidasPorTier[m.faixaIndice];
    for (const o of m.objetivos) if (o.tipo === 's' || o.tipo === 'sp' || o.tipo === 'c') { if (o.k !== K) kForaDaRampa++; if (o.k > 4) kAcimaTeto++; } }
  eq(kForaDaRampa, 0, 'toda sequência (s/sp/c) usa o K da FAIXA (a rampa vive no objetivo)');
  eq(kAcimaTeto, 0, 'TETO 4: nenhum K de sequência acima de 4');

  // §241: a cadeia correlaciona com a faixa — o companheiro destrava em faixa <= a do deus (rampa em ordem)
  let foraDeOrdem = 0;
  for (const k in doc.missoes) { const m = doc.missoes[k], c = m.companheiro; if (c && doc.missoes[c] && doc.missoes[c].faixaIndice > m.faixaIndice) foraDeOrdem++; }
  eq(foraDeOrdem, 0, 'a rampa está em ordem: o companheiro nunca destrava DEPOIS do deus');

  // os requisitos vêm do ARQUIVO DO DONO (tema), não da mecânica.
  let semMotivo = 0, foraArquivo = 0;
  const noArquivo = new Map(req.map(r => [r.deus, r]));
  for (const k in doc.missoes) {
    const m = doc.missoes[k], r = noArquivo.get(k);
    if (!r) { foraArquivo++; continue; }
    if (m.panteao !== r.panteao || (m.companheiro || null) !== (r.companheiro || null)) foraArquivo++;
    if (!m.motivo) semMotivo++;
  }
  eq(foraArquivo, 0, 'as 91 batem com o arquivo do dono (panteão + companheiro)');
  eq(semMotivo, 0, 'cada missão carrega o motivo mitológico (do dono)');

  // §313/§314 — o VOLUME/SEQUÊNCIA por Provação do §241/§242 SAIU: não há mais vitoriasPanteao/seguidas no dado.
  const semLegado = Object.values(doc.missoes).every(m => m.vitoriasPanteao === undefined && m.seguidas === undefined && m.seguidasAlvo === undefined);
  ok(semLegado && doc.volumes === undefined, 'os campos legados (vitoriasPanteao/seguidas/seguidasAlvo/volumes) saíram do dado (§95/§303)');
  const it = doc.missoes.itzamna;
  ok(it.raridade === 'SS' && it.faixa === 'semideus' && it.objetivos.length === 4, 'itzamná: SS, Semideus, 4 objetivos');
  const cerb = doc.missoes.cerberus;
  ok(!cerb.companheiro && cerb.objetivos.length === 2 && cerb.objetivos.some(o => o.tipo === 'sp' && o.panteao === 'Grega'), 'cerberus: A só-panteão (porta Grega), objetivo "sp" com o panteão');
  const hades = doc.missoes.hades;
  ok(hades.companheiro === 'cerberus' && hades.faixaMin > 0 && hades.objetivos.some(o => (o.alvo === 'cerberus') || (o.lista && o.lista.includes('cerberus'))), 'Hades exige cerberus (nos objetivos) e tem portão de ranque (>0)');

  // os 3 cruzamentos temáticos seguem.
  ok(doc.panteaoDe.itzamna === 'Maia' && it.panteao === 'Egípcia', 'itzamná: facção real Maia, exige Egípcia (o cruzamento estrutural)');
  ok(doc.panteaoDe.kraken === 'Nórdica' && doc.missoes.kraken.panteao === 'Grega', 'kraken: facção Nórdica, exige Grega (companheiro poseidon)');
}

// ---------------------------------------------------------------------------
// 1b. §313 — OBJETIVOS: cada Provação é uma LISTA (A2·S3·SS4) com os números fixos; as 7 babás MORDEM.
// ---------------------------------------------------------------------------
console.log('\n== 1b. §313 objetivos: contagem por raridade · números fixos · profundidade 11 · as 7 babás mordem ==');
{
  const doc = gerador.gerar();
  const M = doc.missoes;
  const obj = (k) => M[k].objetivos;
  const de = (k, tipo) => obj(k).filter(o => o.tipo === tipo);

  // (i) CONTAGEM por raridade — A 2 · S 3 · SS 4
  let contagemErr = 0;
  for (const k in M) if (obj(k).length !== doc.objetivosPorRaridade[M[k].raridade]) contagemErr++;
  eq(contagemErr, 0, 'toda Provação tem o nº de objetivos da sua raridade (A 2 · S 3 · SS 4)');

  // (ii) NÚMEROS FIXOS (regra do gerador): K pela faixa; "v" 1º/2º; "j"; "p"; "sp"/"c" usam K; "a" carrega N.
  eq(de('poseidon', 'v')[0].n, doc.numerosObjetivos.v1.SS, 'poseidon (SS): 1º "v" vale 14 (v1.SS)');
  eq(de('poseidon', 'v')[1].n, doc.numerosObjetivos.v2.SS, 'poseidon (SS): 2º "v" vale 8 (v2.SS)');
  eq(de('poseidon', 'p')[0].n, doc.numerosObjetivos.p.SS, 'poseidon (SS): "p" vale 12 (p.SS)');
  eq(de('ares', 'v')[0].n, doc.numerosObjetivos.v1.S, 'ares (S): 1º "v" vale 8 (v1.S)');
  eq(de('ares', 'v')[1].n, doc.numerosObjetivos.v2.S, 'ares (S): 2º "v" vale 5 (v2.S)');
  eq(de('hera', 'j')[0].n, doc.numerosObjetivos.j.S, 'hera (S): "j" vale 5 (j.S)');
  eq(de('saci', 'p')[0].n, doc.numerosObjetivos.p.A, 'saci (A): "p" vale 8 (p.A)');
  eq(de('cerberus', 'sp')[0].k, doc.seguidasPorTier[M.cerberus.faixaIndice], 'cerberus: "sp" usa o K da faixa (Suplicante 2)');
  eq(de('cerberus', 'p')[0].panteao, 'Grega', 'cerberus: "p" mira o panteão EXIGIDO (Grega)');
  eq(de('itzamna', 's')[0].k, doc.seguidasPorTier[M.itzamna.faixaIndice], 'itzamná: "s" usa o K da faixa (Semideus 4)');
  eq(de('itzamna', 'a')[0].n, 4, 'itzamná: "a" carrega o seu N do dono (4)');
  eq(de('odin', 'c')[0].k, doc.seguidasPorTier[M.odin.faixaIndice], 'odin: "c" usa o K da faixa (Oráculo 3)');

  // (iii) MEDIÇÃO — a profundidade da cadeia de OBJETIVOS é 11 (a caçada ficou mais funda que a do companheiro, 8)
  eq(doc.profundidadeObjetivosMax, 11, 'profundidade da cadeia de objetivos = 11 (kukulkan/ahpuch); a de companheiro segue 8');

  // (iv) AS 7 BABÁS MORDEM — cada uma pega um dado quebrado (prova que a guarda não é decorativa).
  const b = (mut) => { const d = gerador.gerar(); mut(d.missoes); return gerador.validarObjetivos(d).erros; };
  ok(b(m => { m.itzamna.objetivos.pop(); }).some(e => /b1/.test(e)), 'babá 1 MORDE: nº de objetivos errado p/ a raridade');
  ok(b(m => { m.medusa.objetivos[0].alvo = 'medusa'; }).some(e => /b2/.test(e)), 'babá 2 MORDE: a Provação nomeia o próprio deus');
  ok(b(m => { m.medusa.objetivos[0].alvo = 'inexistente_xyz'; }).some(e => /b3/.test(e)), 'babá 3 MORDE: nome que não existe');
  ok(b(m => { m.cerberus.objetivos[0] = { tipo: 's', alvo: 'itzamna', k: 2 }; }).some(e => /b4/.test(e)), 'babá 4 MORDE: nomeia deus de faixa MAIOR que a do alvo');
  ok(b(m => { m.aquiles.objetivos[0] = { tipo: 's', alvo: 'kraken', k: 2 }; m.kraken.objetivos[0] = { tipo: 's', alvo: 'aquiles', k: 2 }; }).some(e => /b5/.test(e)), 'babá 5 MORDE: dependência em ciclo torna inalcançável');
  ok(b(m => { m.cerberus.objetivos[0] = { tipo: 'v', lista: ['ganesha'], n: 8 }; }).some(e => /b6/.test(e)), 'babá 6 MORDE: "v" só com deus de outro panteão (ponte obrigatória)');
  ok(b(m => { m.apolo.objetivos = JSON.parse(JSON.stringify(m.atena.objetivos)); }).some(e => /b7/.test(e)), 'babá 7 MORDE: duas Provações com a MESMA lista de objetivos');
}

// ---------------------------------------------------------------------------
// 2. §314 — REGRA DE CONTAGEM: uma vitória com a ATIVA avança TODOS os objetivos que a partida cumpre.
// ---------------------------------------------------------------------------
console.log('\n== 2. §314 uma vitória avança TODOS os objetivos cumpridos da ATIVA (sobreposição dentro) ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['zeus', 'tyr', 'sobek'], 5000);   // rank alto: nenhuma trava de ranque
  const B = novaConta(['nezha', 'cuca', 'ganesha']);
  const atena = missoes.DOC.missoes.atena;   // [s zeus, v[zeus,ganesha], p Grega]
  ok(atena.objetivos.length === 3 && atena.objetivos[0].tipo === 's' && atena.objetivos[2].tipo === 'p', 'atena: s zeus · v[zeus,ganesha] · p Grega');
  const r = missoes.ativarProvacao(contas._contaPorId(A.id), 'atena');
  ok(r.ok && contas._garantirMissoes(contas._contaPorId(A.id)).ativa === 'atena', 'atena ATIVADA (zeus é inicial → disponível)');
  vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 0);   // vitória com zeus (Grega)
  const p = contas._garantirMissoes(contas._contaPorId(A.id)).progresso['atena'].obj;
  eq(p[0].seq, 1, 'a MESMA vitória: "s zeus" +1 (zeus no time)');
  eq(p[1].vol, 1, '…e "v[zeus,ganesha]" +1 (zeus na lista)');
  eq(p[2].vol, 1, '…e "p Grega" +1 (zeus é Grega) — sobreposição DENTRO da Provação é intencional');
}

// ---------------------------------------------------------------------------
// 3. §314 — SEQUÊNCIAS: derrota zera só as sequências (não o volume); vitória que não cumpre não zera.
// ---------------------------------------------------------------------------
console.log('\n== 3. §314 sequência: derrota zera só as sequências · vitória-sem-cumprir não soma nem zera ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['zeus', 'tyr', 'sobek', 'medusa'], 5000);   // medusa: Grega possuída, NÃO-inicial
  const B = novaConta(['nezha', 'cuca', 'ganesha']);
  missoes.ativarProvacao(contas._contaPorId(A.id), 'atena');
  vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 0);   // com zeus: seq=1, p=1
  let p = () => contas._garantirMissoes(contas._contaPorId(A.id)).progresso['atena'].obj;
  eq(p()[0].seq, 1, 'após 1 vitória com zeus: seq "s zeus" = 1');
  vitoria(A.id, B.id, ['medusa', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 0);   // vitória SEM zeus (medusa Grega)
  eq(p()[0].seq, 1, 'vitória SEM zeus: a sequência "s zeus" NÃO soma nem zera (fica 1)');
  eq(p()[2].vol, 2, '…mas "p Grega" +1 (medusa é Grega) → 2');
  vitoria(A.id, B.id, ['medusa', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 1);   // A PERDE
  eq(p()[0].seq, 0, 'DERROTA zera a sequência "s zeus"');
  eq(p()[2].vol, 2, '…mas o VOLUME "p Grega" NÃO é tocado pela derrota (fica 2)');
}

// ---------------------------------------------------------------------------
// 4. §314 — SÓ A ATIVA CONTA; a PAUSADA congela (progresso + sequência), e retomar continua de onde parou.
// ---------------------------------------------------------------------------
console.log('\n== 4. §314 só a ativa conta · pausada congela · retomar continua ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['zeus', 'tyr', 'sobek'], 5000);
  const B = novaConta(['nezha', 'cuca', 'ganesha']);
  const cA = contas._contaPorId(A.id);
  missoes.ativarProvacao(cA, 'atena');
  vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 0);   // atena: seq=1
  const antesAtena = JSON.stringify(contas._garantirMissoes(cA).progresso['atena'].obj);
  // TROCA: ativa 'dionisio' ([s zeus, p Grega] — precisa só de zeus, inicial) → atena vira PAUSADA
  missoes.ativarProvacao(cA, 'dionisio');
  eq(contas._garantirMissoes(cA).ativa, 'dionisio', 'dionisio agora é a ATIVA (atena pausada)');
  vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 0);   // conta p/ dionisio
  eq(contas._garantirMissoes(cA).progresso['dionisio'].obj[0].seq, 1, 'a vitória contou para DIONISIO (a ativa)');
  eq(JSON.stringify(contas._garantirMissoes(cA).progresso['atena'].obj), antesAtena, 'ATENA (pausada) CONGELOU — nada somou nem zerou');
  vitoria(A.id, B.id, ['medusa', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 1);   // derrota
  eq(JSON.stringify(contas._garantirMissoes(cA).progresso['atena'].obj), antesAtena, 'a derrota também NÃO tocou a pausada (a sequência congela)');
  // RETOMA atena: continua de onde parou (seq ainda 1)
  missoes.ativarProvacao(cA, 'atena');
  eq(contas._garantirMissoes(cA).progresso['atena'].obj[0].seq, 1, 'retomar atena: continua de onde parou (seq 1)');
}

// ---------------------------------------------------------------------------
// 5. §314 — DISPONIBILIDADE: ranque atingido + nomes possuídos. Ativar recusa o que não está disponível.
// ---------------------------------------------------------------------------
console.log('\n== 5. §314 disponível = ranque + nomes; ativar recusa fora disso ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const hera = missoes.DOC.missoes.hera;   // Devoto (min 100): [s zeus, v[hercules], j[zeus,ares]]
  const A = novaConta(['zeus', 'tyr', 'sobek'], 0);   // rank 0, só iniciais
  const cA = contas._contaPorId(A.id);
  let d = missoes.disponivelParaAtivar(cA, 'hera');
  ok(!d.ok && d.codigo === 'ranque', `rank 0 < ${hera.faixaMin}: trava por RANQUE`);
  ok(!missoes.ativarProvacao(cA, 'hera').ok, 'ativar hera RECUSA (ranque)');
  setRank(A.id, hera.faixaMin);
  d = missoes.disponivelParaAtivar(cA, 'hera');
  ok(!d.ok && d.codigo === 'nomes' && d.faltamNomes.includes('hercules') && d.faltamNomes.includes('ares'), 'com ranque mas sem hercules/ares: trava por NOMES (o que falta é dito)');
  contas._darDeus(A.token, 'hercules'); contas._darDeus(A.token, 'ares');
  d = missoes.disponivelParaAtivar(cA, 'hera');
  ok(d.ok, 'com ranque + hercules + ares (zeus é inicial): DISPONÍVEL');
  ok(missoes.ativarProvacao(cA, 'hera').ok && contas._garantirMissoes(cA).ativa === 'hera', 'ativar hera OK');
}

// ---------------------------------------------------------------------------
// 6. §314 — CUMPRIR: concede o deus e ESVAZIA o slot; conquistar libera o próximo (cascata por nome).
// ---------------------------------------------------------------------------
console.log('\n== 6. §314 cumprir concede + esvazia o slot; conquistar destrava o próximo ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['zeus', 'tyr', 'sobek'], 5000);
  const B = novaConta(['nezha', 'cuca', 'ganesha']);
  const cA = contas._contaPorId(A.id);
  const cerb = missoes.DOC.missoes.cerberus;   // [p Grega (n), sp Grega (k)] — sem nomes, sempre disponível
  ok(cerb.objetivos[0].tipo === 'p' && cerb.objetivos[1].tipo === 'sp', 'cerberus: p Grega · sp Grega (sem nomes)');
  ok(missoes.disponivelParaAtivar(cA, 'erinias').faltamNomes.includes('cerberus'), 'erinias exige cerberus (ainda não possuído) → travada por nome');
  missoes.ativarProvacao(cA, 'cerberus');
  const nP = cerb.objetivos[0].n;   // vitórias no panteão exigidas
  for (let i = 0; i < nP; i++) vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 0);   // vitórias Gregas (zeus)
  ok(cA.perfil.deuses['cerberus'] && cA.perfil.deuses['cerberus'].viaMissao, `cerberus CONCEDIDO após ${nP} vitórias Gregas (p) + a sequência (sp)`);
  eq(contas._garantirMissoes(cA).ativa, null, 'o slot ficou VAZIO (não ativa outra sozinho, §314)');
  ok(!contas._garantirMissoes(cA).progresso['cerberus'], 'e o progresso da conquistada saiu');
  ok(missoes.disponivelParaAtivar(cA, 'erinias').ok, 'conquistar cerberus DESTRAVOU erinias (cascata por nome)');
}

// ---------------------------------------------------------------------------
// 7. SÓ PvP: uma partida PvE NÃO toca o progresso da Provação (§228).
// ---------------------------------------------------------------------------
console.log('\n== 7. conta SÓ PvP (PvE não avança a Provação) ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['zeus', 'tyr', 'sobek'], 5000);
  const B = novaConta(['nezha', 'cuca', 'ganesha']);
  missoes.ativarProvacao(contas._contaPorId(A.id), 'atena');
  const salaPvE = salaFake(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], { turno: 3, fim: { lado: 0 }, log: [] }, 'pve');
  salas.finalizarPartida(salaPvE);
  eq(contas._garantirMissoes(contas._contaPorId(A.id)).progresso['atena'].obj[0].seq, 0, 'PvE: ZERO progresso na Provação ativa');
}

// ---------------------------------------------------------------------------
// 8. A GUARDA — o cliente não forja progresso (§226/§230); abandono = derrota; idempotência.
// ---------------------------------------------------------------------------
console.log('\n== 8. a GUARDA: perfil forjado · inacabada · abandono=derrota · idempotência ==');
{
  contas._resetParaTeste(); salas._limparTudo();
  const A = novaConta(['zeus', 'tyr', 'sobek'], 5000);
  const B = novaConta(['nezha', 'cuca', 'ganesha']);
  // forjar o PERFIL (que o cliente controla) não mexe no ledger de missões (top-level da conta, do servidor).
  contas.salvarPerfil(A.token, Object.assign({}, contas.porToken(A.token).perfil, { missoes: { ativa: 'hades', liberados: { hades: true } } }));
  const pub = contas.missoesPublicas(contas._contaPorId(A.id));
  ok(pub.ativa === null && pub.liberados.length === 0, 'perfil forjado IGNORADO — sem ativa nem liberados no ledger real');
  // inacabada (sem st.fim) não entra
  missoes.ativarProvacao(contas._contaPorId(A.id), 'atena');
  eq(missoes.registrarPvP(salaFake(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], { turno: 2, fim: null, log: [] })), null, 'inacabada não entra (retorna null)');
  eq(contas._garantirMissoes(contas._contaPorId(A.id)).progresso['atena'].obj[0].seq, 0, 'inacabada: ZERO progresso');
  // abandono = derrota: zera as sequências da ativa do abandonador
  vitoria(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], 0);   // seq "s zeus" = 1
  eq(contas._garantirMissoes(contas._contaPorId(A.id)).progresso['atena'].obj[0].seq, 1, 'A tinha sequência 1');
  missoes.registrarPvP(salaFake(A.id, B.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], { turno: 3, fim: { lado: 1, motivo: 'abandono' }, log: [] }));   // A abandona (lado 1 vence)
  eq(contas._garantirMissoes(contas._contaPorId(A.id)).progresso['atena'].obj[0].seq, 0, 'abandono = derrota: a sequência do abandonador RESETA');

  contas._resetParaTeste(); salas._limparTudo();
  const C = novaConta(['zeus', 'tyr', 'sobek'], 5000);
  const D = novaConta(['nezha', 'cuca', 'ganesha']);
  missoes.ativarProvacao(contas._contaPorId(C.id), 'atena');
  const sala = salaFake(C.id, D.id, ['zeus', 'tyr', 'sobek'], ['nezha', 'cuca', 'ganesha'], { turno: 3, fim: { lado: 0 }, log: [] });
  salas.finalizarPartida(sala); salas.finalizarPartida(sala); salas.finalizarPartida(sala);
  eq(contas._garantirMissoes(contas._contaPorId(C.id)).progresso['atena'].obj[0].seq, 1, 'idempotente: 3× finalizar = 1 avanço (flag registrado)');
}

// ---------------------------------------------------------------------------
// 9. O leitor de FEITOS segue vivo (maestria, §230) — mede do log real de uma partida de motor.
// ---------------------------------------------------------------------------
console.log('\n== 9. o leitor de feitos segue para maestria (fora do gate) — mede do log real ==');
{
  const A = ['apolo', 'poseidon', 'ares'], B = ['hades', 'fenrir', 'zeus'];
  const st = E.novoEstado(A, B, 42, 0);
  let guard = 0;
  while (!st.fim && guard++ < 400) { let p = 0, a; while (!st.fim && (a = iaProximaAcao(st)) && p++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas); if (st.fim) break; E.fimTurno(st); }
  ok(st.fim, 'a partida de motor terminou');
  const med = missoes.medir(st, A, B);
  ok(((med[0].danoDireto || 0) + (med[1].danoDireto || 0)) > 0, 'o leitor de feitos ainda mede do log real (maestria)');
}

console.log(`\n== MISSÕES OK — ${passes} asserções ==`);

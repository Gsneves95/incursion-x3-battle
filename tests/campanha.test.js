// §252 — CAMPANHA NARRATIVA (O Trono do Uno): a tela do ATO substitui a lista. O ato tem TIPO
// (batalha|historia); capítulo = arquivo (data/campanha/ → CAMPANHAS). Bundle real em jsdom.
// As 5 GUARDAS da Fase 4 têm babá: tire a asserção e o teste quebra.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const abertos = [];
function sessao() {
  const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  abertos.push(dom);
  const w = dom.window, d = w.document;
  w.eval("perfil=novoPerfil(0,999); ['zeus','ogum','tyr','sobek','brigid','ganesha','cuca','fujin','nezha'].forEach(k=>{perfil.deuses[k]={copias:1,favorito:false,obtidoEm:0};});");
  return { w, d, $: s => d.querySelector(s), $$: s => [...d.querySelectorAll(s)] };
}
// lista plana dos atos, em ordem (cap, ato, id, tipo)
function flat(w) { return JSON.parse(w.eval(`JSON.stringify(CAMPS().flatMap((c,ci)=>c.atos.map((a,ai)=>({ci,ai,id:a.id,tipo:a.tipo,cap:c.numero}))))`)); }
function abrir(w, capIdx, atoIdx, concluidas) {
  w.eval(`perfil.campanha={capitulo:0,fase:0,concluidas:${JSON.stringify(concluidas || [])}}; campCapIdx=${capIdx}; campAtoIdx=${atoIdx}; campSwap={}; campVistaAto=null; ir('campanha',{},{substituir:true}); render();`);
}

console.log('== 1. os dados: 2 capítulos, 7 atos no Prólogo, 6 no Cap 1; tipos declarados ==');
{
  const { w } = sessao();
  const caps = JSON.parse(w.eval('JSON.stringify(CAMPS().map(c=>({num:c.numero,n:c.atos.length})))'));
  ok(caps.length === 2, `2 capítulos (tem ${caps.length})`);
  ok(caps[0].num === 0 && caps[0].n === 7, `Prólogo com 7 atos (veio ${caps[0] && caps[0].n})`);
  ok(caps[1].num === 1 && caps[1].n === 6, `Cap 1 com 6 atos (veio ${caps[1] && caps[1].n})`);
  const tipos = flat(w).map(a => a.tipo);
  ok(tipos.every(t => t === 'batalha' || t === 'historia'), 'todo ato tem tipo batalha|historia');
}

console.log('== GUARDA 1 (§210): todo ato é alcançável pela linha do tempo ==');
{
  const { w, $$ } = sessao();
  const atos = flat(w);
  // caminho linear: para cada ato, com TODOS os anteriores feitos, ele fica ABERTO (jogável) — nunca preso.
  let inalcancavel = [];
  for (let p = 0; p < atos.length; p++) {
    const anteriores = atos.slice(0, p).map(a => a.id);
    abrir(w, atos[p].ci, atos[p].ai, anteriores);
    const est = w.eval(`atoEstado(${atos[p].ci},${atos[p].ai})`);
    if (est !== 'aberto') inalcancavel.push(atos[p].id + ':' + est);
  }
  ok(inalcancavel.length === 0, `todo ato abre quando os anteriores estão feitos (presos: ${inalcancavel.join(',')})`);   // BABÁ
  // e cada ato do capítulo aparece como um nó na linha do tempo (a navegação existe p/ todos)
  abrir(w, 0, 0, []);
  ok($$('.cnode').length === 7, `a linha do tempo do Prólogo mostra os 7 nós (tem ${$$('.cnode').length})`);   // BABÁ
}

console.log('== GUARDA 2: ato `historia` não tem recompensa e não abre batalha ==');
{
  const { w } = sessao();
  const hist = flat(w).filter(a => a.tipo === 'historia');
  ok(hist.length >= 2, `há atos de história (${hist.length})`);
  const comRec = JSON.parse(w.eval(`JSON.stringify(CAMPS().flatMap(c=>c.atos).filter(a=>a.tipo==='historia'&&a.recompensa!=null).map(a=>a.id))`));
  ok(comRec.length === 0, `nenhum ato historia tem recompensa (violam: ${comRec.join(',')})`);   // BABÁ
  // CONTINUAR de um ato de história NÃO abre batalha e NÃO paga
  const h = hist[0];
  abrir(w, h.ci, h.ai, flat(w).slice(0, flat(w).findIndex(a => a.id === h.id)).map(a => a.id));
  const gemaAntes = w.eval('perfil.moedas.gema');
  w.eval("document.querySelector('#campcta').click();");
  ok(w.eval("rotaAtual()") === 'campanha', 'CONTINUAR de história NÃO vai para a batalha');   // BABÁ
  ok(w.eval('perfil.moedas.gema') === gemaAntes, 'CONTINUAR de história NÃO paga');   // BABÁ
  ok(w.eval(`perfil.campanha.concluidas.includes(${JSON.stringify(h.id)})`), 'a história fica marcada como vista');
}

console.log('== GUARDA 3: batalha do Cap 1+ tem 3 aliados e 3 inimigos; o Prólogo é ISENTO ==');
{
  const { w } = sessao();
  // Cap 1: toda batalha é 3×3
  const cap1bad = JSON.parse(w.eval(`JSON.stringify(CAMPS().filter(c=>c.numero>=1).flatMap(c=>c.atos).filter(a=>a.tipo==='batalha').filter(a=>(a.aliados||[]).length!==3||(a.inimigos||[]).length!==3).map(a=>a.id))`));
  ok(cap1bad.length === 0, `toda batalha do Cap 1 é 3×3 (fora do padrão: ${cap1bad.join(',')})`);   // BABÁ
  // Prólogo ISENTO: existe batalha do Prólogo que NÃO é 3×3 (senão a isenção seria vazia)
  const proNao3 = w.eval(`CAMPS()[0].atos.filter(a=>a.tipo==='batalha').some(a=>(a.inimigos||[]).length!==3)`);
  ok(proNao3 === true, 'o Prólogo tem batalha que não é 3×3 (3×1/3×2) — a isenção é real');   // BABÁ
}

console.log('== GUARDA 4: os 6 atos de batalha do Prólogo == data/campanha.json de hoje (balanço medido) ==');
{
  const { w } = sessao();
  const antigo = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/campanha.json'), 'utf8')).encontros;
  const proBatalhas = JSON.parse(w.eval(`JSON.stringify(CAMPS()[0].atos.filter(a=>a.tipo==='batalha').map(a=>({aliados:a.aliados,inimigos:a.inimigos,seed:a.montar.seed,comeca:a.montar.comeca})))`));
  ok(proBatalhas.length === 6 && antigo.length === 6, 'seis batalhas no Prólogo, seis encontros no antigo');
  let dif = [];
  for (let i = 0; i < 6; i++) {
    const a = antigo[i], b = proBatalhas[i];
    if (JSON.stringify(a.aliados) !== JSON.stringify(b.aliados)) dif.push(`${a.id}:aliados`);
    if (JSON.stringify(a.inimigos) !== JSON.stringify(b.inimigos)) dif.push(`${a.id}:inimigos`);
    if ((a.montar.seed || 0) !== (b.seed || 0)) dif.push(`${a.id}:seed`);
    if ((a.montar.comeca || 0) !== (b.comeca || 0)) dif.push(`${a.id}:comeca`);
  }
  ok(dif.length === 0, `Prólogo idêntico ao balanço medido de hoje (divergências: ${dif.join(', ')})`);   // BABÁ
}

console.log('== GUARDA 5: nenhuma arte de ato pede arquivo inexistente (§213: placeholder, nunca <img> 404) ==');
{
  const { w, $ } = sessao();
  const dirArte = path.join(__dirname, '../web/banners/campanha');
  const atos = flat(w);
  let vazamento = [];
  for (const a of atos) {
    abrir(w, a.ci, a.ai, atos.slice(0, atos.findIndex(x => x.id === a.id)).map(x => x.id));
    const arte = w.eval(`(CAMPS()[${a.ci}].atos[${a.ai}].arte||'')`);
    const existe = arte && fs.existsSync(path.join(dirArte, arte + '.webp'));
    const temImg = !!$('.camp__arteimg');
    if (!existe && temImg) vazamento.push(a.id + ' (img p/ arquivo ausente)');
    if (!existe && !$('.camp__artefallback')) vazamento.push(a.id + ' (sem placeholder)');
  }
  ok(vazamento.length === 0, `arte ausente sempre vira placeholder, nunca <img> (vazam: ${vazamento.join(', ')})`);   // BABÁ
}

console.log('== 6. BATALHA: a CTA monta o time (travado + emprestado) e entra na luta ==');
{
  const { w } = sessao();
  const prologoTudo = ['pro-i', 'pro-ii', 'pro-iii', 'pro-iv', 'pro-v', 'pro-vi', 'pro-vii'];
  abrir(w, 1, 0, prologoTudo);   // Cap 1, ato I (Thor travado, Loki travado, Ogum emprestado)
  ok(w.eval(`JSON.stringify(timeDoAto(CAMPS()[1].atos[0]))`) === '["thor","loki","ogum"]', 'o time default é travados + emprestado');
  // troca o emprestado por um deus do jogador
  w.eval("campSwap={2:'nezha'}; render();");
  ok(w.eval(`JSON.stringify(timeDoAto(CAMPS()[1].atos[0]))`) === '["thor","loki","nezha"]', 'trocar o emprestado muda o time; travados ficam');
  w.eval("campSwap={}; document.querySelector('#campcta').click(); vsCPU=false; pararRelogio();");
  ok(w.eval("rotaAtual()") === 'batalha' && w.eval('campanha.id==="cap1-i"'), 'a CTA entra na batalha do ato');
  ok(w.eval('st.lados[0].units.map(u=>u.key).join(",")') === 'thor,loki,ogum', 'o time montou no motor');
  ok(w.eval('st.lados[1].units.length===3'), 'os 3 inimigos montaram (3×3)');
}

console.log('== 7. VITÓRIA paga UMA vez (chave de economia); DERROTA não paga nem conclui ==');
{
  const { w, $ } = sessao();
  const prologoTudo = ['pro-i', 'pro-ii', 'pro-iii', 'pro-iv', 'pro-v', 'pro-vi', 'pro-vii'];
  abrir(w, 1, 0, prologoTudo);
  w.eval("document.querySelector('#campcta').click(); vsCPU=false; pararRelogio();");
  const gema0 = w.eval('perfil.moedas.gema');
  const rec = w.eval('ECONOMIA.campanha.recompensas.encontro.gema');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:0}; render();");
  ok(w.eval('perfil.moedas.gema') === gema0 + rec, `vitória paga a chave de economia (${rec})`);
  ok(w.eval('perfil.campanha.concluidas.includes("cap1-i")'), 'o ato entra em concluidas');
  ok(/ATO CONCLUÍDO/.test($('.result--prova').textContent), 'overlay anuncia o ato concluído');
  // re-jogar não paga
  w.eval("sairCampanha(); campCapIdx=1; campAtoIdx=0; ir('campanha'); render(); document.querySelector('#campcta').click(); vsCPU=false; pararRelogio();");
  const gema1 = w.eval('perfil.moedas.gema');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:0}; render();");
  ok(w.eval('perfil.moedas.gema') === gema1, 're-jogar um ato vencido não paga de novo');
  // derrota
  abrir(w, 1, 2, prologoTudo.concat(['cap1-i', 'cap1-ii']));   // Cap 1 ato III (batalha)
  w.eval("document.querySelector('#campcta').click(); vsCPU=false; pararRelogio();");
  const gemaD = w.eval('perfil.moedas.gema');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render();");
  ok(w.eval('perfil.moedas.gema') === gemaD, 'derrota não paga');
  ok(w.eval('!perfil.campanha.concluidas.includes("cap1-iii")'), 'derrota não conclui');
  ok(!!$('#cftentar'), 'derrota oferece tentar de novo');
}

console.log('== 8. TROCA de capítulo no cabeçalho quando o anterior está completo ==');
{
  const { w, $ } = sessao();
  const prologoTudo = ['pro-i', 'pro-ii', 'pro-iii', 'pro-iv', 'pro-v', 'pro-vi', 'pro-vii'];
  abrir(w, 0, 6, prologoTudo);   // Prólogo completo, olhando o último ato
  ok(!!$('#capnext'), 'com o Prólogo completo, dá para avançar ao Cap 1 no cabeçalho');
  $('#capnext').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('campCapIdx') === 1, 'a seta troca para o Cap 1');
}

console.log('== 9. os aliados null (Prólogo VI): 3 slots vazios, CTA travada até 3 escolhidos ==');
{
  const { w, $, $$ } = sessao();
  abrir(w, 0, 5, ['pro-i', 'pro-ii', 'pro-iii', 'pro-iv', 'pro-v']);   // Prólogo VI (aliados:null)
  ok(w.eval('CAMPS()[0].atos[5].aliados===null'), 'o Prólogo VI mantém aliados:null (o time é do jogador)');
  ok($$('.cslot--vazio').length === 3, '3 slots vazios para o jogador montar');
  ok($('#campcta').disabled, 'a CTA fica travada sem os 3');
}

console.log('== GUARDAS §255 (o caminho da derrota): volta ao ato · troca sobrevive · Tentar de novo remonta a MESMA semente ==');
{
  const { w, $ } = sessao();
  const pro = ['pro-i', 'pro-ii', 'pro-iii', 'pro-iv', 'pro-v', 'pro-vi', 'pro-vii'];
  const concl = pro.concat(['cap1-i', 'cap1-ii', 'cap1-iii', 'cap1-iv', 'cap1-v']);
  // abre o Cap 1 VI (batalha, emprestados Ares/Hades), troca o slot 1 por um deus do jogador, entra e PERDE
  w.eval(`perfil.campanha={capitulo:0,fase:0,concluidas:${JSON.stringify(concl)}}; campCapIdx=1; campAtoIdx=5; campSwap={}; campVistaAto=null; campPicker=null; ir('campanha',{},{substituir:true}); render();`);
  w.eval("campSwap={1:'nezha'}; render();");
  const seedAto = w.eval('CAMPS()[1].atos[5].montar.seed');
  w.eval("document.querySelector('#campcta').click(); vsCPU=false; pararRelogio();");
  ok(w.eval("campanha.aliados.join(',')") === 'zeus,nezha,hades', 'o time montado leva a troca do jogador (zeus,nezha,hades)');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render();");   // DERROTA (inimigo vence)
  // GUARDA A (§210): existe SEMPRE caminho de volta à tela do ato
  ok(!!$('#cfvoltarato'), 'a derrota oferece "Voltar ao ato" (caminho de volta, §210)');   // BABÁ
  ok(!!$('#cftentar'), 'a derrota oferece "Tentar de novo"');
  $('#cfvoltarato').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'campanha', '"Voltar ao ato" leva à tela do ato');
  ok(w.eval('CAMPS()[campCapIdx].atos[campAtoIdx].id') === 'cap1-vi', 'o ato ATUAL é o ato perdido (não a home nem o começo do capítulo)');
  // GUARDA B: o time montado sobrevive à volta
  ok(w.eval("campSwap[1]") === 'nezha', 'a troca do jogador sobrevive à volta (campSwap intacto)');   // BABÁ
  ok(w.eval("timeDoAto(CAMPS()[1].atos[5]).join(',')") === 'zeus,nezha,hades', 'a tela do ato mostra o time montado, não o emprestado padrão');   // BABÁ
  ok(/Nezha/i.test($('.camp__brief').textContent), 'o retrato do slot emprestado mostra o deus trocado');
  // GUARDA C: "Tentar de novo" remonta com a MESMA semente
  w.eval("document.querySelector('#campcta').click(); vsCPU=false; pararRelogio();");
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render();");
  w.eval("document.querySelector('#cftentar').click(); vsCPU=false; pararRelogio();");
  ok(w.eval("rotaAtual()") === 'batalha', '"Tentar de novo" reentra na batalha');
  ok(w.eval('st.seed') === seedAto, `"Tentar de novo" remonta com a MESMA semente (${seedAto}) — se alguém aleatorizar, quebra`);   // BABÁ
  ok(w.eval("campanha.aliados.join(',')") === 'zeus,nezha,hades', 'e com o MESMO time (a troca segue valendo)');
  // a VITÓRIA não mudou: derrota não concluiu nem pagou (o ato segue não-feito)
  ok(w.eval('!perfil.campanha.concluidas.includes("cap1-vi")'), 'a derrota não conclui o ato (vitória intacta)');
}

console.log('== GUARDA 6 (§254): arte de bestiário — arquivo presente vira <img>, ausente fica no monograma (nunca 404) ==');
{
  const { w } = sessao();
  // bicho COM arquivo (guardiao_bosque) → <img class="slot__art" src="bestiario/<chave>.webp">, sem 404
  const comArte = w.eval("slot('god-guardiao_bosque','GU','#fff',20)");
  ok(/<img[^>]*class="slot__art"[^>]*src="bestiario\/guardiao_bosque\.webp"/.test(comArte), 'bicho com arquivo emite <img> de bestiario/<chave>.webp');   // BABÁ
  ok(w.eval("!!BESTIARIO_ARTE.guardiao_bosque"), 'a build anotou guardiao_bosque como presente');
  // bicho SEM arquivo (chave que a build NÃO anotou) → monograma, NUNCA <img> (§213)
  const semArte = w.eval("slot('god-inexistente_zzz','ZZ','#fff',20)");
  ok(!/<img/.test(semArte), 'bicho sem arquivo NÃO emite <img> (nada de 404, §213)');   // BABÁ
  ok(/slot__glyph/.test(semArte) && /ZZ/.test(semArte), 'e mostra o monograma-reserva');   // BABÁ
  // o caminho dos DEUSES não muda (retrato embutido, não vira arquivo de bestiário)
  const deus = w.eval("slot('god-zeus','ZE','#fff',20)");
  ok(/<img/.test(deus) && !/bestiario\//.test(deus), 'o retrato de DEUS segue embutido (não pega o caminho do bestiário)');
}

for (const dom of abertos) try { dom.window.close(); } catch (e) {}
if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) na campanha`); process.exit(1); }
console.log('>>> CAMPANHA OK');
process.exit(0);

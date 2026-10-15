// batalha_painel.test.js (§333b) — o PAINEL DE BAIXO segue os MODELOS do dono: [IMAGEM][CONTEÚDO] | [CUSTO/RECARGA] |
// [DIREITA] (4 minis na situação PERSONAGEM; o botão CANCELAR quando há habilidade ARMADA). Prova, no Chromium (rect
// real), as 5 situações (deus / habilidade lida / armada / efeito / resumo) + a descrição MAIS LONGA do jogo (babi ·
// Frenesi Sanguinário), em 780×360 e 1280×720: nenhum filho sai do painel; as colunas não se intersectam; nenhum texto
// transborda da sua coluna; o título não corta. E os PISOS de legibilidade em 780×360: hab/retrato ≥64px, efeito ≥22px,
// título ≥12px, descrição ≥9px, pílula ≥7px.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
let sharp; try { sharp = require('sharp'); } catch (e) { sharp = null; }
function acharChromium(){ if(process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try{ const base='/opt/pw-browsers'; const d=fs.readdirSync(base).filter(x=>/^chromium-\d+$/.test(x)).sort().pop();
    if(d){ const b=path.join(base,d,'chrome-linux','chrome'); if(fs.existsSync(b)) return b; } }catch(e){} return undefined; }
let falhas=0; const ok=(c,m)=>{ if(!c){ falhas++; console.log('  XX '+m); } };
const distAbs=path.resolve(__dirname,'..','dist','incursion.html');

const BOOT=`
  st=montarProvacao({aliados:['hades','babi','zeus'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});
  prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){} try{ELEMS.forEach(e=>st.lados[0].orbs[e]=9);}catch(e){}
  st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null;resumoTurno=null; ir('batalha',{},{substituir:true});render();`;
const SIT={
  'deus':`detalhe=null;armado=null; infoUnidade(st.lados[1].units[0].uid);`,
  'habilidade lida':`armado=null; lerHabilidade(st.lados[0].units[2].uid,'habilidade');`,
  'armada':`armado=null;detalhe=null; armar(st.lados[0].units[0].uid,'milagre');`,
  'efeito':`armado=null;detalhe=null; st.lados[0].units[1].efeitos=[{type:'vulneravel',v:6,dur:2,origem:st.lados[1].units[0].uid}]; infoEfeito(st.lados[0].units[1].uid,0);`,
  'resumo':`armado=null;detalhe=null;foco=null; resumoTurno=[{turno:st.turno,tipo:'acao',origem:'poseidon',slot:'milagre'},{turno:st.turno,tipo:'dano',origem:'poseidon',alvo:'hades',valor:14}]; render();`,
  'armada (desc mais longa)':`armado=null;detalhe=null; armar(st.lados[0].units[1].uid,'milagre');`,
};

(async()=>{
  const browser=await chromium.launch({executablePath:acharChromium(),headless:true,args:['--no-sandbox']});
  for(const E of [{nome:'780',w:780,h:360},{nome:'1280',w:1280,h:720}]){
    const ctx=await browser.newContext({viewport:{width:E.w,height:E.h},deviceScaleFactor:2});
    const page=await ctx.newPage(); await page.goto('file://'+distAbs,{waitUntil:'load'});
    console.log(`== §333b painel ${E.nome}×${E.h} ==`);
    for(const [nome,extra] of Object.entries(SIT)){
      await page.evaluate(BOOT); await page.evaluate(extra); await page.waitForTimeout(80);
      const m=await page.evaluate(()=>{
        const esc=(typeof ultimaEscala!=='undefined'&&ultimaEscala)||1;
        const R=el=>el.getBoundingClientRect(); const pan=document.querySelector('.bt-panel'); if(!pan) return {err:1};
        const rp=R(pan); const cols=[...pan.children].map(c=>({cls:c.className.split(' ')[0],r:R(c)}));
        const fora=cols.filter(c=>c.r.left<rp.left-0.5||c.r.right>rp.right+0.5||c.r.top<rp.top-0.5||c.r.bottom>rp.bottom+0.5).map(c=>c.cls);
        let inter=null; for(let i=0;i<cols.length&&!inter;i++)for(let j=i+1;j<cols.length;j++){const a=cols[i].r,b=cols[j].r;
          const ix=Math.min(a.right,b.right)-Math.max(a.left,b.left), iy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
          if(ix>1&&iy>1){inter=cols[i].cls+'×'+cols[j].cls;break;}}
        const tit=pan.querySelector('.bt-panel__titulo'), desc=pan.querySelector('.bt-panel__desc'), col2=pan.querySelector('.bt-panel__conteudo');
        const pill=pan.querySelector('.bt-pill');
        const fpx=el=> el?parseFloat(getComputedStyle(el).fontSize)*esc:null;
        return { err:0, fora, inter,
          titCorta: tit?(tit.scrollWidth>tit.clientWidth+1):false,
          descFora: (desc&&col2)?(R(desc).right>R(col2).right+0.5||R(desc).left<R(col2).left-0.5):false,
          titPx:fpx(tit), descPx:fpx(desc), pillPx:fpx(pill) };
      },extra);
      ok(!m.err, `${E.nome} [${nome}]: o painel existe`);
      ok(m.err||m.fora.length===0, `${E.nome} [${nome}]: nenhum filho sai da caixa do painel` + (m.fora&&m.fora.length?` (${m.fora.join(', ')})`:''));
      ok(m.err||!m.inter, `${E.nome} [${nome}]: as colunas não se intersectam` + (m.inter?` (${m.inter})`:''));
      ok(m.err||!m.titCorta, `${E.nome} [${nome}]: o título não corta com "…"`);
      ok(m.err||!m.descFora, `${E.nome} [${nome}]: a descrição fica dentro da coluna de conteúdo (rola, não vaza)`);
      if(E.nome==='780' && !m.err){
        ok(m.titPx>=12, `780 [${nome}]: título ≥ 12px (${m.titPx&&m.titPx.toFixed(1)})`);
        ok(m.descPx>=9, `780 [${nome}]: descrição ≥ 9px (${m.descPx&&m.descPx.toFixed(1)})`);
        if(m.pillPx!=null) ok(m.pillPx>=7, `780 [${nome}]: pílula ≥ 7px (${m.pillPx.toFixed(1)})`);
      }
    }
    // PISOS de campo (780): hab e retrato ≥64px; ícone de efeito ≥22px (na situação com efeito).
    if(E.nome==='780'){
      await page.evaluate(BOOT); await page.evaluate(SIT['efeito']); await page.waitForTimeout(60);
      const f=await page.evaluate(()=>{ const R=el=>el&&el.getBoundingClientRect();
        const re=R(document.querySelector('.bt-portrait')), sk=R(document.querySelector('.bt-skill')), ef=R(document.querySelector('.bt-eff'));
        return { re:re&&re.width, sk:sk&&sk.width, ef:ef&&ef.width }; });
      ok(f.re>=64, `780: o RETRATO é ≥ 64px (${f.re&&f.re.toFixed(1)})`);
      ok(f.sk>=64, `780: a HABILIDADE é ≥ 64px (${f.sk&&f.sk.toFixed(1)})`);
      ok(f.ef>=22, `780: o ícone de EFEITO é ≥ 22px (${f.ef&&f.ef.toFixed(1)})`);
      // §334: nenhum botão em DISCO mostra pixel CLARO nos cantos (a arte foi recortada em círculo — inclusive os
      // discos de FUNDO CLARO/brilho, antes classificados como CHEIA). Mede o pixel real do canto (screenshot).
      if(sharp){
        await page.evaluate(BOOT); await page.waitForTimeout(80);
        const discos=await page.evaluate(()=>[...document.querySelectorAll('.bt-skill')].filter(b=>b.querySelector('.slot__art--disco'))
          .map(b=>{const r=b.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};}).filter(b=>b.w>8&&b.h>8));
        ok(discos.length>0, '780: há botões em DISCO para checar os cantos');
        for(const b of discos.slice(0,10)){
          const buf=await page.screenshot({clip:{x:b.x,y:b.y,width:b.w,height:b.h}});
          const {data,info}=await sharp(buf).raw().toBuffer({resolveWithObject:true});
          const W=info.width,H=info.height,chn=info.channels, L=(x,y)=>{const o=(y*W+x)*chn;return 0.299*data[o]+0.587*data[o+1]+0.114*data[o+2];};
          const m=3, cantos=[L(m,m),L(W-1-m,m),L(m,H-1-m),L(W-1-m,H-1-m)].map(v=>Math.round(v));
          ok(!cantos.some(v=>v>150), `780: botão DISCO sem pixel claro nos cantos (lumas ${cantos.join(',')})`);
        }
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log(falhas===0?'\n>>> BATALHA_PAINEL OK':`\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas?1:0);
})().catch(e=>{console.error(e);process.exit(1);});

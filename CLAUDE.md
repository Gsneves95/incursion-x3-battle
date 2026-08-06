# INCURSION — briefing do projeto

Jogo de combate tático por turnos para celular (paisagem), com 100 deuses de
10 mitologias do mundo. As mecânicas são inspiradas no **Naruto-Arena**: 3v3,
120 de vida para todos, energia elemental por turno, habilidades com recarga.
Nada aqui deriva de propriedade intelectual do Naruto — só o gênero.

Este arquivo é o contrato do projeto. **Leia até o fim antes de escrever código.**
Muita coisa aqui parece arbitrária e não é: cada invariante abaixo existe porque
uma alternativa foi testada e falhou, ou porque quebrá-la destrói o gênero.
O raciocínio completo está em `DECISOES.md`.

---

## Estado atual

| | |
|---|---|
| Motor de regras | funcional, função pura, **11 dos 100 deuses** implementados; **as 12 primitivas de efeito prontas** (destravam os 89 restantes) |
| Cliente | 3 telas: seleção/coleção, batalha (hot-seat) e **invocação (gacha)** |
| Testes | 6 suítes, todas verdes (motor, capacidades, primitivas, auditoria, interface, invocação) |
| Arte | 100 retratos de deus embutidos; **faltam os 400 ícones de habilidade** |
| Servidor | não existe ainda, e é de propósito (ver `ROTEIRO.md`, fase 4) |

Rodar: `npm test` roda as 4 suítes. `npm run build` gera `dist/incursion.html`,
um arquivo único que abre no navegador sem servidor.

---

## Arquitetura, e por que ela é assim

```
src/engine.js     motor de regras — função pura, sem DOM, sem rede
src/view.js       camada de visão — só desenha e captura toque
src/shell.html    casca + CSS (canvas fixo 926x428 escalado por transform)
src/roster_data.js  ROSTER (100 deuses, metadados) + IMG (retratos em base64)
data/*.json       fonte da verdade do design: kits, provações, iniciais, bestiário
tools/build.js    concatena os quatro acima em dist/incursion.html
tests/*.test.js   motor, interface (jsdom), auditoria contra as regras, capacidades
docs/*.xlsx       planilha de design completa (15 abas)
```

O motor ser **função pura e determinística** não é preciosismo. Ele paga em
quatro lugares: o servidor autoritativo da fase 4 roda o mesmo código (anti-cheat
de graça), replays são só estado inicial + lista de ações, as Provações são
estados serializados, e a arena de auto-jogo consegue rodar milhares de partidas
para achar combo quebrado antes de qualquer jogador. Se você acoplar regra a DOM,
perde os quatro de uma vez.

---

## INVARIANTES — não quebre sem uma decisão explícita do dono do projeto

### Motor

1. **`agir(estado, ação) → estado`.** Nada de `document`, `fetch` ou
   `Math.random()` dentro de `engine.js`. O único aleatório é `mulberry32`
   semeado por `st.seed`.
2. **Combate não tem sorte além do sorteio de energia.** Não existe crítico,
   esquiva percentual, bloqueio percentual nem "X% de chance". A versão original
   do roster tinha tudo isso e foi convertida em efeito determinístico.
3. **Sem progressão de personagem.** Não existe nível, estrela, equipamento,
   relíquia nem nível de habilidade. Todo deus tem 120 de vida. A diferença entre
   um Guardião e um Atacante está no KIT.
4. **Os números vêm de `data/kits.json`.** O motor não inventa valor de dano.
   Se um kit parece fraco, a discussão é de design, não de código.

### As 7 regras de resolução (definem *quando* as coisas acontecem)

1. **Ordem no turno:** as unidades resolvem uma por vez, na ordem que o jogador
   escolher, e o estado atualiza entre elas. É o que faz combo no mesmo turno
   funcionar (Ogum destrói o escudo, depois Zeus explode).
2. **Redução antes do escudo.** Golpe de 25 contra 10 de redução e 20 de escudo:
   `25−10=15` no escudo, sobram 5 de escudo, 0 de vida perdida. Na ordem inversa
   redução e escudo se anulariam e Guardião perderia a razão de existir.
3. **Dano contínuo conta no início do turno de quem sofre, ANTES de ele agir.**
   Unidade com 8 de vida e 10 de veneno morre sem jogar. É informação completa —
   o jogador viu chegando. É também o que faz DoT ser a resposta à Defesa.
4. **Recarga N pula N−1 turnos.** Posta em N ao usar, desconta 1 no início de
   cada turno do dono, libera em 0. Todos os 400 números assumem isso.
5. **Duração conta em turnos de quem RECEBE.** Descontada no FIM do turno de quem
   carrega o efeito. "Atordoar 1 turno" = perde exatamente 1 ação.
6. **Acúmulo, por categoria:** buff/debuff de dano SOMAM · redução pega o MAIOR ·
   escudo SOMA · DoT de mesmo nome renova duração e mantém a maior magnitude ·
   DoT de nomes diferentes coexistem · **controle NÃO empilha** (vence a maior
   duração restante) · regeneração pega a maior. Controle empilhar é stunlock, a
   reclamação nº 1 do gênero.
7. **Proteção vence controle.** Exceções apenas as escritas nos kits (Odin e
   Shiva ignoram Invulnerabilidade; Hórus, Hou Yi e Boitatá ignoram Inalvejável;
   Perseu devolve atordoamento). Regra extra: se o provocador fica intocável, o
   Provocar dele é **suspenso** — sem isso, duas habilidades justas combinadas
   trancam uma unidade sem nenhuma ação possível.

### Combate

8. **Defesa é universal:** toda unidade tem, custa 1 energia livre, recarga 4,
   gasta a ação, dá Invulnerável por 1 turno. Silenciar não a alcança; Atordoar sim.
9. **Dano contínuo já aplicado atravessa Invulnerabilidade.** É a brecha
   desenhada. Sem ela, a rotação de Defesa anularia a ofensiva do jogo.
10. **Energia:** 1 por unidade viva por turno, sorteada entre os elementos das
    unidades vivas do time (pode vir tipo que não serve — estilo NA). Unidade sob
    controle não gera. **Abertura 1/3:** quem começa a partida é sorteado, e no
    seu primeiro turno recebe só **1** energia (desvantagem de iniciativa); o
    segundo jogador recebe 3; todo turno seguinte rende = unidades vivas. O sorteio
    de quem abre é do CLIENTE (`comeca` em `novoEstado`); o motor segue determinístico.
    Conversão: 3 quaisquer → 1 escolhido, uma vez por turno, **paga sempre exatamente 3**.
11. **Classe pertence à HABILIDADE, não ao deus.** Físico, Mágico, Mental
    (controle) ou Aflição (DoT). É o que faz "trava as Mágicas dele" acertar
    parte do kit e não tudo. A Defesa é `Universal` e nenhum silêncio a pega.
12. **Vitória:** 3 quedas. Empate técnico no turno 40 por vida somada.

### Interface

13. **Tocar nunca gasta.** O primeiro toque numa habilidade só lê e arma; o
    commit é sempre um segundo gesto (tocar no alvo, ou CONFIRMAR). Vale também
    para a troca de energia. Nada no jogo muda de estado com um toque só.
14. **O cronômetro nunca pausa durante a batalha.** Nem com popup, registro ou
    ajuda abertos. Pausar é explorável.
15. **Habilidade inimiga é somente leitura.** Nunca recebe `data-sk`, só
    `data-look`. Existe um teste que falha se isso mudar.
16. **Um botão primário por tela.** Ouro preenchido = a ação principal, e só ela.
    Raio único de 3px em toda placa. Círculo é reservado a habilidade.
17. **Alvo de toque não encolhe com o desenho.** O botão de habilidade é um
    quadrado de 76px; só o disco interno é recortado. Placas pequenas ampliam a
    área com `::before{inset:-9px}` — o canvas é escalado, então 30px de desenho
    viram ~22pt reais no celular.
18. **O canvas é fixo em 926x428 e escalado por `transform`.** Não troque por
    layout fluido sem discutir: o dimensionamento fixo é o que garante que a
    composição não quebre entre aparelhos.

---

## NÃO FAÇA

Estas são tentações que já foram avaliadas e recusadas. Se você acha que uma
delas é boa ideia, leia `DECISOES.md` antes de propor.

- **Não reintroduza progressão, nem "pequena".** "Cópias repetidas dão +5% de
  dano" parece inofensivo e não é: com 120 de vida, 5% decide partida, e pior,
  destrói a **leitura** — em Naruto-Arena o valor exato de cada habilidade é
  conhecimento público, e é isso que permite pensar "ele está com 22, o Fenrir
  dele executa em 20, preciso curar 3". Progressão vive no PvE e em nenhum outro
  lugar.
- **Não adicione RNG ao combate.** Nem "60% de atordoar". Num jogo de turnos com
  3 unidades, um stun que falha decide a partida e o jogador sente que perdeu
  para a moeda.
- **Não faça o toque numa habilidade executar direto.** Um Milagre custa 3
  energias e tem recarga 4; disparo acidental é punição desproporcional.
- **Não pause o cronômetro** por nenhuma sobreposição.
- **Não mude nomes de habilidade.** Os 400 nomes são canônicos e batem com a
  planilha original do dono do projeto. Efeitos foram reescritos; nomes não.
- **Não normalize a interface para "tudo redondo" ou "tudo quadrado".** As três
  formas carregam categoria: retângulo = quem (deus), círculo = o que faz
  (habilidade), quadrado arredondado = estado (efeito).
- **Não exponha ação destrutiva.** Render-se mora no menu `⋯`, com confirmação.
- **Não comite com suíte vermelha.** As 4 suítes existem porque 6 contradições
  reais nos kits e 4 bugs de motor (incluindo um exploit de energia infinita)
  foram achados por elas, não por inspeção visual.

---

## Convenções

- **Idioma:** todo código, comentário, commit e interface em **português do
  Brasil**. Nomes de variável em português (`alvo`, `armado`, `escolhidos`).
- **Sem dependências de runtime.** O cliente é HTML+CSS+JS puro. `jsdom` é
  devDependency só para os testes.
- **Chaves de arte:** todo encaixe é `<div class="slot" data-slot="CHAVE">`.
  Chaves: `god-<key>`, `skill-<key>-<slot>`, `effect-<tipo>`, `player-<n>-avatar`.
  Trocar por `<img class="slot">` quando a arte existir.
- **Arte de habilidade é redonda** (`object-position:center`); retrato de deus é
  enquadrado no alto (`center 18%`) porque as ilustrações são de corpo inteiro.

## Primitivas de efeito — PRONTAS

As 12 primitivas do `ROTEIRO.md` fase 1 item 6 estão no motor e cobertas por
`tests/primitivas.test.js`. Cada kit novo as aciona por dados, sem tocar no motor:

| Primitiva | Como o kit aciona | Deuses que destrava |
|---|---|---|
| Contadores acumuláveis | `{t:'contador', nome, v, alvo:'self'?, max}`; dano com `porContador`/`porContadorCampo`/`consomeContador` | Rá, Kitsune, Anúbis, Ah Puch, Ares… |
| Estado Dia/Noite | `{t:'fase', v:'Dia'\|'Noite'\|null, dur}`; dano com `seDia`/`seNoite` | Amaterasu, Tsukuyomi, Hou Yi, Lugh… |
| Vida Extra | `{t:'vidaExtra', hp}` — revive no ato ao cair | Bastet |
| Revive | `{t:'revive', hp, escopo:'aliadoCaido'\|'todosCaidos'}`; respeita `naoRevive` | Osíris, Ísis, Anúbis… |
| Contagem de morte | dano com `porAliadoCaido`/`porInimigoCaido`; efeito `livro` executa ao expirar | Osíris, Nüwa, Yan Wong |
| Dano armazenado | `{t:'armazenaDano', dur, max}` — acumula o sofrido, devolve como puro | Xangô |
| Interceptar | `{t:'intercepta', dur, contra:'unico'\|'todos', contraAtaca?}` | Loki, Bastet, Hanuman |
| Contra-atacar | efeito `contraAtaca {v, contra}` — revida golpe de alvo único | Heimdall, Bastet, Guan Yu |
| Escolha múltipla | ability com `opcoes:[{nome, fx}]`; `agir(...,escolhas:[i,…])` | Nüwa, Lugh, Tanuki, Exu… |
| Copiar habilidade | `{t:'copiar', fonte:'ultimaHabilidadeAliada'}` | Ísis, Tanuki |
| Invocações | `{t:'invocar', tipo:'guarda'\|'dano', hp, v, dur, provoca?}` | Khnum, Sun Wukong, Kitsune |
| Seleção de 2 alvos | (já pronta) `alvo:'2inimigos'/'2aliados'`, efeitos com `idx` | Thor, Hera |

**Regra que continua valendo: implemente a primitiva antes do deus.** Se um kit
novo pedir uma mecânica que não existe, pare e adicione a primitiva + o teste
antes de escrever o kit.

## Próximo passo

`ROTEIRO.md`, fase 1, item 7 — **arena de auto-jogo**. O motor roda contra si
mesmo por seed, milhares de partidas, e reporta taxa de vitória por deus, duração
média e combos que fecham cedo demais. É o que torna possível balancear 100
deuses e o pré-requisito para escrever os 89 kits restantes (item 8) em lotes
testados.

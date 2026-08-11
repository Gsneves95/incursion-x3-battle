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
| Motor de regras | funcional, função pura, **11 dos 100 deuses** implementados; **as 12 primitivas implementadas**, mas só **1 provada por kit real** (2 alvos); as outras 11 aguardam um deus que as use (ver `docs/inventario.md` §2b) |
| Cliente | 3 telas: seleção/coleção, batalha (hot-seat **ou vs CPU**) e **invocação (gacha)** |
| CPU | **IA gulosa de 1 lance** controla o Jogador 2 (ligada por padrão; alterna em "Oponente" na seleção). Início da Fase 2 |
| Testes | 10 suítes, todas verdes (motor, capacidades, primitivas, auditoria, perfil, ia, rotas, interface, invocação, **moldura**). A `moldura` roda em Chromium real (`playwright`); as outras 9 são jsdom |
| Arte | 100 retratos de deus embutidos; **faltam os 400 ícones de habilidade** |
| Servidor | não existe ainda, e é de propósito (ver `ROTEIRO.md`, fase 4) |

Rodar: `npm test` roda as 10 suítes (a `moldura` precisa de Chromium — `npx playwright
install chromium`). `npm run build` gera `dist/incursion.html`.

### Invariante do "arquivo único" — escopo (decisão do dono, F0.6)
O **`incursion.html` de desenvolvimento** é um arquivo único, auto-contido, que abre no
navegador sem servidor: dados embutidos (`KITS`/`RARIDADE`/`ECONOMIA`), zero `fetch`. Isso
vale para o **`.html`** — é o que dá o ciclo rápido e o "abre e roda".

Isso **NÃO** vale para o **artefato publicado**. O site do Pages é pequeno mas com mais de
um arquivo: `index.html` + `manifest.webmanifest` + `icon-192.png` + `icon-512.png`. O
manifest e os ícones **têm** de ser arquivos reais servidos por HTTP — um `manifest` por
`blob:`/`data:` o Chrome **recusa para instalação** (`start_url` não resolve; provado por
CDP `getInstallabilityErrors`). Os assets moram em `web/`; o `build.js` os copia para o
`dist/` e o `pages.yml` para o `site/`. Forçar o manifest para dentro do `.html` custava
mais (PWA que não instala) do que o invariante valia.

---

## Arquitetura, e por que ela é assim

```
src/engine.js     motor de regras — função pura, sem DOM, sem rede
src/perfil.js     estado do jogador — funções puras (recebem perfil, devolvem perfil)
src/armazenamento.js  persistência (localStorage): chave do perfil + chave do histórico
src/turno.js      fluxo de turno + relógio + ação (controlador; não é ui)
src/rotas.js      navegação: rota + pilha de histórico (puro, sem DOM)
src/ui/base.js    helpers e constantes compartilhados (único ui que os outros usam)
src/ui/topo.js    barra superior: jogadores, relógio, energia, menu
src/ui/campo.js   as 3 bandas: retrato, vida, efeitos, discos, aba do inimigo
src/ui/painel.js  painel de detalhe do rodapé e a ação primária
src/ui/sobrepor.js  sobreposições: troca, energia livre, registro, ajuda, resultado
src/ui/selecao.js  grade de coleção, filtro, montagem de time, kit
src/view.js       orquestrador: estado de sessão, render por rota, cola dos módulos
src/shell.html    casca + CSS (canvas fixo 926x428 escalado por transform)
src/roster_data.js  ROSTER (100 deuses, metadados) + IMG (retratos em base64)
data/*.json       fonte da verdade do design: kits, provações, iniciais, bestiário
src/ia.js         IA do oponente (CPU) — busca gulosa de 1 lance
src/invocacao.js  tela de invocação (gacha)
tools/build.js    concatena na ordem de camadas; valida direção ui->ui e smoke jsdom
tests/*.test.js   9 suítes: motor, capacidades, primitivas, auditoria, perfil, ia, rotas,
                  interface (jsdom), invocacao (jsdom)
docs/*.xlsx       planilha de design completa (15 abas)
docs/inventario.md  retrato derivado do que existe de fato (F0.1)

Camadas (setas para baixo, cada uma só usa as anteriores):
engine → perfil → armazenamento → turno → rotas → ui/base → ui/* → view (orquestrador). `build.js`
falha se um módulo de ui/ chamar função de OUTRO ui/ (só base.js é livre).
```

**Quando um DADO passar a ser lido no BOOT, revise a ordem de concatenação — não presuma
que a ordem atual serve.** O bundle é escopo único concatenado: `const`/`let` têm TDZ, então
código de topo que roda no load (ex.: o boot em `view.js`) só pode ler dados declarados
ANTES dele na concatenação. Na F0.4c o boot passou a ler `ECONOMIA` para o grant, mas o
`build.js` concatenava `ECONOMIA` DEPOIS do bloco da view → `ReferenceError` de TDZ só em
runtime (nomeie a causa: dependência circular boot→dado, não "símbolo faltando"). Foi o
**smoke jsdom do `build.js`** que pegou — erro de ordem em bundle concatenado não aparece
em teste de unidade, só carregando o bundle. Regra: dado consumido no boot vem antes do
bloco que o consome; e todo consumo novo no load é gatilho para reabrir a ordem do build.

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
    **Custo "livre" é escolhido no FIM do turno:** o custo específico paga na hora,
    mas a parte livre vira dívida do turno (`l.dividaLivre`) e o jogador escolhe
    quais orbes a pagam ao ENCERRAR (`alocarLivre`); se não escolher, o motor aloca
    do pool mais cheio (rede de segurança). `podePagar`/conversão já descontam a dívida.
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
16. **No máximo um primário VISÍVEL E ACESSÍVEL a qualquer momento.** Ouro
    preenchido = a ação principal, e só ela. Não é contagem no DOM: é onde o olho
    (e o foco/leitor de tela) vai. Quando há sobreposição com scrim, a camada de
    base fica `inert` (fora da tabulação e do leitor de tela) e seu primário
    rebaixa — consequência do `inert`, não regra à parte. Sobreposição sem scrim
    (o menu ⋯) NÃO inerta a base: ela segue interativa, só não pode ter conflito de
    foco nem um segundo primário. "No máximo" e não "exatamente": menu sem CTA fica
    com zero primário, e forçar um inventaria hierarquia falsa. Raio único 3px em
    toda placa; círculo é reservado a habilidade. Teste em interface.test.js §13.
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
- **Não comite com suíte vermelha.** As 7 suítes existem porque 6 contradições
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
- **Instante e aleatório entram por PARÂMETRO, nunca de dentro.** Funções de estado
  (motor, `perfil.js`, sorteio) recebem tempo (`agora`) e semente (`seed`) como
  argumento; jamais chamam `Date.now()` ou `Math.random()` internamente. É o que as
  faz puras e determinísticas — testáveis e reusáveis pelo servidor/simulador. O
  aleatório do cliente (quem começa, seed de invocação) é sorteado na borda e passado
  para dentro.
- **Número de versão de migração é RECURSO ESCASSO: quem consome, avisa e atualiza o que
  estava reservado.** `VERSAO_PERFIL` é um contador de uma via — cada valor é um degrau de
  migração que roda uma vez por perfil. Se você gastar um número que estava reservado para
  outra migração (na F0.4c o `v2` estava planejado no ESTADO para o pity-por-banner e foi
  usado para o grant), você DEVE: (1) avisar no relatório, (2) reescrever o plano que
  reservava aquele número para o próximo livre (o pity virou `v3`), (3) confirmar que o gate
  de `migrar()` comporta o passo futuro. Contabilidade de migração frouxa é onde nasce
  corrupção silenciosa meses depois — dois "v2" com significados diferentes destroem dados.
- **Avisar na GRAVAÇÃO, não na leitura.** Boot sem dado salvo (localStorage vazio ou
  indisponível) é começo normal — silencioso. O alarme visível ao jogador é quando a
  **escrita** falha (cota, aba privada): é aí que há perda real. Vale para toda
  persistência que vier.
- **Número que não está em `data/`: PARE e peça — não invente nem busque em doc
  antigo.** Quando o arquivo de especificação não existe, a lacuna é preenchida em
  silêncio (por convenção do gênero ou por uma planilha superada) e ninguém percebe.
  Foi o que aconteceu com a economia da invocação (taxas pela metade da planilha
  original, pity 74/80 por convenção; ver `docs/inventario.md §10`). A fonte da
  verdade da economia é o `data/economia.json` — e ele **é gerado a partir de uma
  decisão do dono, nunca o contrário**. Regras de combate têm spec no xlsx e podem
  virar `data/` numa reconciliação; até lá, constante de regra em código só bate com
  o xlsx, nunca inventada.
- **Material e textura são decisões SEPARADAS.** O "material" é a linguagem de placa
  votiva: régua (duas camadas), chanfro (`clip-path`) e bisel. A **textura** (`--grao`,
  ruído SVG) é outra coisa, e é reservada às **superfícies grandes** (`shell.html:44`) —
  entra no critério 8 (≤5 texturadas na tela). Dar material a um elemento NÃO obriga a
  texturá-lo: a barra de energia (F0.5a-restante) recebeu régua+chanfro+bisel SEM grão,
  por ser faixa estreita. Ao aplicar material, decida a textura à parte, ou o critério 8
  incha sem querer.
- **Número que o dono deu de memória: VERIFIQUE no código/arte antes de usar.** Quando o
  dono estima ("acho que é 8 ou 8,5", "o campo tem 426×121", "o motor cabe em <500 linhas"),
  trate como hipótese a conferir, não como fato. Numa sessão a estimativa errou TRÊS vezes: o
  menor texto era 7,5px (não 8/8,5); o campo media 438×123 (não 426/121); e o "< 500 linhas"
  do motor supunha que boa parte das 900 era dado — era ~185 de dado e ~715 de regra, então o
  alvo era inatingível só extraindo dado. No caso do texto, 0,1px separava o piso de
  legibilidade passar de falhar — aceitar a estimativa teria escondido o bug. Varra o
  CSS/arte/dado, meça, e traga o número real; se ele contradisser a memória do dono, é isso
  que se reporta, não o palpite.
- **Verificar que o teste EXISTE não é verificar que ele COBRE o que você precisa.** Nova nuance
  do padrão acima (5ª vez que uma afirmação de memória do dono não sobreviveu à verificação). Na F1.2
  o dono disse "ogum e tyr têm suíte" olhando a EXISTÊNCIA de suíte, não a COBERTURA dela: as suítes
  do Ogum testavam a HABILIDADE destroyShield, não a PASSIVA (+10/irredutível). Migrar confiando nisso
  teria trocado hardcode por dado sem nada provando equivalência — e o teste seguiria verde, provando
  OUTRA coisa. Antes de confiar numa rede de teste, LEIA o bloco e confirme que ele asserta o
  comportamento específico que você vai mexer; `grep <nome-do-deus>` acha o deus no roster, não a
  asserção da mecânica. Rede escrita/suposta com pressa prova a coisa errada.
- **Antes de declarar um kit ESCREVÍVEL, verifique o alcance da prosa INTEIRA, não só a coluna
  que a tarefa foca.** Na F1.1 o dono e eu dissemos "o motor tem tudo que os 6 kits de contador
  precisam" olhando só a parte de contador — mas a prosa completa dos mesmos 6 deuses arrastava
  mecânicas NÃO-contador não provadas (Selado, execução genérica ≤N HP, dano-por-turno-por-contador,
  dano-tomado-por-contador, hooks de passiva novos). "Provado para a faceta X" ≠ "kit escrevível".
  Leia basico+habilidade+milagre+passiva inteiros, liste TODA mecânica que cada um exige, e só então
  diga se o deus cabe no motor de hoje; senão descobre-se primitiva faltante no meio da escrita.
- **Critério de LINHA é um proxy ruim quando o que importa é SEPARAÇÃO DE RESPONSABILIDADE.**
  "engine.js < 500 linhas" mirava a coisa errada — o alvo real era "nenhum dado de deus no
  motor", e o motivo do número ("o engine vai dobrar com os 73 kits") desapareceu quando a
  tarefa moveu os kits para `data/`. Um contador de linhas não sabe distinguir 200 linhas de
  dado de 200 de regra. Prefira o critério que nomeia a responsabilidade; se quiser um limite
  numérico, ponha-o como **gatilho medido sobre a coisa certa** (ex.: "se `aplicarFx` passar de
  150 linhas, extrair para `src/execucao.js`"), não como teto de arquivo inteiro.
- **Mudança que altera o que APARECE na tela exige captura ANTES do commit — contra o
  dist recém-construído.** As suítes (mesmo 12) provam comportamento, não aparência:
  nesta fase a verificação visual pegou DUAS vezes o que os testes não pegaram (o palco
  cortado à direita; a barra mostrando a energia da CPU). Fluxo: `node tools/build.js`
  (ou `npm test`, que reconstrói) → screenshot via `playwright` contra
  `dist/incursion.html` → olhar → só então commitar. Screenshot contra dist velho é
  pior que nenhum: parece certo e mente (já tropecei nisso e refiz).
- **O motor emite log SEM preposição contraída** (`Turno N · Jogador N joga`, não "vez
  do Jogador N"). A visão traduz "Jogador N" → Você/CPU/Oponente (`traduzirRotulos`); com
  a contração o resultado fica "vez do Você". É remendo até o motor emitir eventos
  estruturados (dívida no ESTADO). Com o processo do oponente oculto (F0.7), o log é a
  ÚNICA fonte do que a CPU fez — leitura obrigatória, não histórico opcional.

## Primitivas de efeito — IMPLEMENTADAS (1 de 12 provada por kit real)

As 12 primitivas do `ROTEIRO.md` fase 1 item 6 estão no motor e cobertas por
`tests/primitivas.test.js` **em isolamento**. Mas só **1 (seleção de 2 alvos)** é
exercitada por um deus dos 11 implementados; as outras 11 ainda não têm kit real que
as prove (ver `docs/inventario.md` §2b). Cada kit novo as aciona por dados, sem tocar
no motor:

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

O ponteiro vivo é o **`ESTADO.md`** — atualizado ao fim de cada sessão, é onde a
próxima sessão descobre o que fazer. O projeto está executando a **Fase 0
(Fundação)**: inventário (F0.1, feito), rotas (F0.2), quebra do `view.js` (F0.3),
perfil e persistência (F0.4), material e botões (F0.5). O `docs/inventario.md`
tem o retrato derivado do repositório.

Pendente do roteiro original de conteúdo: `ROTEIRO.md` fase 1 item 7 (**arena de
auto-jogo**) e item 8 (os 89 kits restantes) — não bloqueados por primitiva, já
que as 12 estão prontas.

# Roteiro — do protótipo ao jogo completo

Ordenado por **dependência**, não por empolgação. A tentação em projeto assim é
começar pelo conteúdo (os outros 89 deuses, as telas, a arte) — e é o caminho mais
caro, porque cada ambiguidade que o motor revelar obriga a refazer conteúdo já
produzido. A coluna *Depende de* não é sugestão.

Fonte canônica: aba **Roteiro** em `docs/INCURSION_Roster_e_Kits_ESTILO_NA.xlsx`.


## Fase 0 — VALIDAR

### 1. Jogar 10 partidas no protótipo

Você contra você mesmo, atenção real. A única pergunta: um turno parece uma DECISÃO ou uma sequência óbvia?

**Depende de:** nada — pode começar agora

**Por que nesta ordem:** Se a resposta for 'sequência óbvia', nada mais na lista importa. Todo o resto é multiplicador do núcleo: se o núcleo não é bom, 100 deuses são 100× de trabalho perdido. É a fase mais barata e a que mais economiza.

### 2. Decidir 100 ou 120 de vida

Jogo automatizado fecha em 8–18 turnos. Se com atenção você também fechar em ~10, o dano está alto para o tamanho da vida.

**Depende de:** jogar 10 partidas

**Por que nesta ordem:** Subir a vida para 120 é uma linha de código. Cortar 400 números de dano é uma semana. Decida antes de escrever os 91 deuses restantes, porque o orçamento de dano depende disso.

### 3. Fechar o nome dos elementos

Solar/Lunar/Vital/Caos/Vazio/Tempestade (seu design) ou Tempestade/Umbra/Maré/Aurora/Chama/Verdejante (planilha).

**Depende de:** nada

**Por que nesta ordem:** Renomear é trivial no dado, mas quebra ganchos temáticos: Maré aplica Encharcado, Chama aplica Queimadura, Aurora e Umbra ativam Dia e Noite. São ~60 habilidades a retraduzir. Decidir agora custa nada; decidir depois de 400 ícones de arte custa caro.


## Fase 1 — MOTOR

### 4. Seleção de dois alvos ✓

PRONTO. Especificação de passos: 'inimigo', '2inimigos', 'aliado', '2aliados', 'aliado+inimigo'. Efeitos com idx apontam para o 1º ou 2º alvo. Interface pede um passo por vez, mostra ALVO 1/2 e marca o já escolhido.

**Depende de:** —

**Por que nesta ordem:** Validado com Thor (22 no primeiro alvo, 12 no segundo) e Hera (buff em 2 aliados escolhidos). Junto vieram 2 primitivas que esses kits exigiam: escudo (Defesa Destrutível) e vínculo (dano dividido entre dois aliados).

### 5. Classe por habilidade ✓

PRONTO. Cada habilidade tem classe própria: Físico, Mágico, Mental (controle) ou Aflição (dano contínuo). A Defesa é Universal e nenhum silêncio a alcança.

**Depende de:** —

**Por que nesta ordem:** O silêncio agora lê a classe da HABILIDADE. Nezha tem Físico + Mental/Aflição + Mágico, então nenhum silêncio de classe cala o kit dele — é exatamente por isso que ele é o Híbrido inicial. Kits que alternam de modo trocam de classe com o modo.

### 6. Primitivas de efeito que faltam

Invocações (Shabti, Fera, clones), revives, contadores acumuláveis (Combo, Disco Solar, Caudas, Ataduras, Maldição, Podridão), estado global Dia/Noite, copiar habilidade (Ísis), dano armazenado (Xangô), contagem de morte (Yan Wong), escolha múltipla (Nüwa, Lugh, Tanuki), interceptar, contra-atacar, Vida Extra.

**Depende de:** seleção de 2 alvos

**Por que nesta ordem:** São ~14 primitivas. Cada uma destrava um grupo de deuses. Implementar a primitiva ANTES do deus evita descobrir na metade que o modelo de dados não cabe.

### 7. Arena de auto-jogo

O motor roda contra si mesmo por seed, milhares de partidas, e reporta: taxa de vitória por deus, duração média, combos que fecham antes do turno 6.

**Depende de:** primitivas

**Por que nesta ordem:** Isto é o que torna possível balancear 100 deuses. Intuição não escala nesse número. E como o motor é função pura com seed, o custo é baixo e o retorno é enorme: acha combo quebrado antes de qualquer humano.

### 8. Os 91 deuses restantes

Thor e Hera já entraram (2 de 91), como validação das novas capacidades. Restam 89, em lotes de ~15, rodando a arena de auto-jogo após cada lote.

**Depende de:** primitivas + arena

**Por que nesta ordem:** Trabalho mecânico depois das primitivas. Estimo ~30 ambiguidades a resolver no caminho (apareceram 6 nos primeiros 9). Cada lote testado é um lote que não volta.

### 9. Replays

Guardar estado inicial + lista de ações. Reproduz qualquer partida.

**Depende de:** nada

**Por que nesta ordem:** Quase de graça com motor puro e determinístico. Serve para depurar, para o jogador rever, e para investigar reclamação de balanceamento com evidência em vez de opinião.


## Fase 2 — CPU

### 10. IA de busca em árvore

Simula 2–3 turnos à frente, avalia vida, energia, recargas e ameaça de abate.

**Depende de:** os 91 deuses

**Por que nesta ordem:** Informação perfeita, turnos discretos e poucas ações por turno: território ideal. Uma IA assim joga melhor que a maioria dos humanos no ranking baixo — 'offline é mais fácil' é escolha sua, não lei.

### 11. Níveis de dificuldade

Profundidade de busca + ruído controlado na avaliação.

**Depende de:** IA

**Por que nesta ordem:** Ruído é melhor que 'burrice codificada': a IA fácil erra como um humano erra, não de formas absurdas que ensinam o jogador errado.


## Fase 3 — JOGO DE UM JOGADOR (primeiro produto vendável)

### 12. Telas de coleção e montagem de time

Ver os deuses que você tem, ler kits, montar e salvar times.

**Depende de:** os 91 deuses

**Por que nesta ordem:** Primeira tela além da batalha. O padrão visual da tela de batalha já define a linguagem.

### 13. Carregador de Provações

Uma Provação é um estado serializado + condição de vitória. A tela lê o arquivo e monta a partida.

**Depende de:** IA + coleção

**Por que nesta ordem:** O formato do estado já existe no motor. As 91 Provações estão escritas na planilha, faltando só o estado inicial de cada uma.

### 14. Campanha

21 capítulos, bestiário como tropa, chefes com kit do roster e mais vida.

**Depende de:** IA

**Por que nesta ordem:** Aqui a fantasia de poder é legítima porque o oponente é a CPU. É também onde a progressão pode voltar a existir, se você quiser.

### 15. Persistência local

Coleção, moedas, Provações completadas, progresso de campanha.

**Depende de:** coleção

**Por que nesta ordem:** Sem servidor ainda. Local resolve tudo até o PvP existir.

### 16. PORTÃO: dá para lançar

Um jogo de um jogador, com combate testado, campanha e Provações, sem gacha e sem servidor.

**Depende de:** tudo acima

**Por que nesta ordem:** Este é o menor produto realmente lançável. Ele valida combate, retenção e curva de dificuldade com dinheiro e risco baixos — antes de você pagar por infraestrutura.


## Fase 4 — SERVIDOR E PVP

### 17. Contas e autenticação

Login, recuperação, vínculo de dispositivo.

**Depende de:** portão da fase 3


### 18. Servidor autoritativo

O MESMO motor roda no servidor; o cliente não decide nada, só desenha e envia ações.

**Depende de:** contas

**Por que nesta ordem:** É o retorno do investimento em motor puro: reaproveitamento direto, e anti-cheat praticamente resolvido de brinde.

### 19. Reconexão

Retomar partida caída.

**Depende de:** servidor autoritativo

**Por que nesta ordem:** Jogo por turnos torna isso simples: reenviar o estado. Em jogo de ação seria um projeto inteiro.

### 20. Pick/ban

Draft com banimento alternado antes da partida ranqueada.

**Depende de:** servidor autoritativo

**Por que nesta ordem:** Última linha DECISÃO da aba Vigilância. Resolve balanceamento (o quebrado é banido), dá valor a deus de nicho como counter-pick, e é a pressão de coleção que vende amplitude sem vender poder. Sem ela o meta converge para 8 deuses e o gacha perde razão de existir.

### 21. Pareamento e ranqueado

Fila, elo, temporadas, recompensas de fim de temporada.

**Depende de:** pick/ban


### 22. Telemetria

Registro de toda partida: composições, banimentos, vitórias, duração, uso por habilidade.

**Depende de:** servidor autoritativo

**Por que nesta ordem:** Faça ANTES de lançar, não depois. Sem isso você balanceia 100 deuses por opinião de fórum. Com isso, por evidência.


## Fase 5 — MONETIZAÇÃO

### 23. Invocação no servidor

Sorteio e teto (pity) do lado do servidor, auditável.

**Depende de:** servidor autoritativo

**Por que nesta ordem:** Sorteio no cliente é fraude esperando acontecer.

### 24. Loja, moedas, pagamentos

Gema, Essência de Louvor, fragmentos dirigidos, cosméticos.

**Depende de:** invocação


### 25. Conformidade

Divulgação obrigatória das taxas de sorteio, regras de loot box, faixa etária.

**Depende de:** loja

**Por que nesta ordem:** Exigência legal em vários mercados e requisito das lojas de aplicativo. Barato se planejado, caro se descoberto na submissão.

### 26. Rotação gratuita

8 deuses liberados por semana para todos.

**Depende de:** invocação

**Por que nesta ordem:** Reduz a barreira do novato e funciona como demonstração de venda.


## Fase 6 — OPERAÇÃO CONTÍNUA

### 27. Balanceamento por temporada

Ajustes guiados pela telemetria e pela arena de auto-jogo.

**Depende de:** telemetria


### 28. Novos deuses

O roster de 100 é o começo, não o fim. Cada novo deus entra pelo mesmo pipeline: kit → primitivas → arena → Provação.

**Depende de:** balanceamento


### 29. Eventos e passe

Calendário de conteúdo.

**Depende de:** loja


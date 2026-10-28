# Monetização — plano (§343) + desenho final aprovado (§369)

> **Documento de PLANO.** Nada de código nem de dado (`data/`) muda por este arquivo. O §343 registrou o desenho
> com partes em aberto; o **§369** fecha essas partes com os números aprovados pelo dono. Os valores só entram em
> `data/economia.json` (fonte única) **quando a Loja for implementada** — e, como os tetos de hoje, toda recompensa é
> **creditada pelo SERVIDOR**. Até lá, isto é só o acordo de desenho.

---

## 1. Base de cálculo (economia atual, para referência)

A régua de preço parte do que um jogador **ganha de graça** hoje (as fontes já no `data/economia.json`):

- **F2P dedicado ≈ 1.900 gemas/semana** = PvP 15×10/dia (150) + treino/sandbox 20×5/dia (100) + Desafio da Semana 150;
  `(150+100)×7 + 150 = 1.900`. A **≈ 13 invocações/semana** (avulso 150).
- **Casual ≈ 1.000 gemas/semana** ≈ **7 invocações**.
- **SS:** 1% por invocação, garantido na **60ª** (pity duro) → média de **~45 invocações por SS** ≈ **~6.800 gemas**.

Esses números são o chão: nenhum pacote pago pode fazer o F2P se sentir enganado, e nenhum anúncio/compra dá vantagem
no PvP (ver §8).

---

## 2. Pacotes de gemas

Base ≈ **R$ 1,60 por invocação** (150 gemas). **A PRIMEIRA compra de cada pacote vem em DOBRO.** Os valores em reais
serão **ajustados às faixas de preço da Play Store** no cadastro (a Play tem faixas fixas por país); a tabela abaixo é a
intenção de desenho.

| Preço (R$) | Gemas | 1ª compra (dobro) | Gemas por R$ |
|---|---|---|---|
| 4,90 | 450 | 900 | ~92 |
| 9,90 | 950 | 1.900 | ~96 |
| 24,90 | 2.500 | 5.000 | ~100 |
| 49,90 | 5.200 | 10.400 | ~104 |
| 99,90 | 10.800 | 21.600 | ~108 |
| 249,90 | 28.000 | 56.000 | ~112 |

(O "gemas por R$" sobe com o tamanho do pacote — desconto por volume, padrão do gênero; a 1ª-compra-em-dobro é o
gancho de conversão.)

---

## 3. Passe mensal — R$ 29,90

- **30 dias corridos a partir da compra** (não "dias logados"): o passe conta dias de **calendário**.
- **Recompensa diária por login**, **um item por dia de calendário**. O **dia não resgatado é PERDIDO** (é preciso logar
  no dia; o relógio é o do servidor, em UTC — ver §8).
- **Calendário dos 30 dias:**

  | Dias | Recompensa |
  |---|---|
  | comuns (1–6, 8–13, 15–20, 22–27, 29) — 23 dias | 150 gemas |
  | 7, 14, 21 | 150 gemas + 3 bilhetes de invocação |
  | 28 | 150 gemas + 2 bilhetes |
  | **30** | **1 deus SS ALEATÓRIO** |

  **Total:** 4.350 gemas + 11 bilhetes = **40 invocações** (29×150 gemas ÷ 150 = 29; + 11 bilhetes = 40) **+ o SS do dia 30**.
- **O SS do dia 30 segue a MESMA regra da Invocação:** sorteado entre os SS da **faixa de ranque do jogador e abaixo**,
  de preferência **um que ele ainda não tem**; se já tiver todos, vira os **pontos de duplicata** daquele deus (a mesma
  conversão da Invocação).
- O passe **também dá:** as recompensas dos anúncios **sem precisar assistir** (ver §5) e **2 marcas por dia** no Deus da
  Semana (ver §6).

**Valor para o jogador vs. preço:** 40 invocações + 1 SS garantido por R$ 29,90 — bem acima dos ~13/semana do F2P, sem
tocar no PvP. O SS garantido mensal é o grande atrativo do passe.

---

## 4. Bilhete de invocação (item novo — resolve a pendência "bilhetes")

- **Um bilhete vale 1 invocação grátis** (uma retirada do mesmo sorteio da Invocação, sem gastar gemas).
- **Conta para a garantia de SS (pity 60):** uma invocação por bilhete incrementa o mesmo contador
  (`invocacao.desdeUltimoSS`) e pode disparar o pity, igual a uma invocação paga.
- Fontes de bilhete: o passe (§3) e, no futuro, eventos. **Fecha a pendência `_pendencias.bilhetes`** do
  `data/economia.json` (o código já tinha "bilhetes" sem decisão): **sim, existem**, e são isto.

---

## 5. Anúncios (todos opcionais e recompensados; **teto total de 8 por dia**)

Todos *rewarded* (nunca forçados/intersticiais; ver §8). O **teto total é 8 anúncios por dia** no relógio do servidor
(UTC). Os limites por cenário abaixo somam a esse teto.

| # | Cenário | Recompensa | Limite |
|---|---|---|---|
| 1 | Invocação diária grátis | 1 invocação (**conta para o pity 60**) | 1/dia |
| 2 | Deus da Semana | 1 marca | 1/dia (5 de 7 ganha o deus — ver §6) |
| 3 | Dobrar a recompensa do **Desafio da Semana** | 2× | 1/dia |
| 4 | Dobrar a recompensa do **fim de corrida do Domínio** | 2× | 1/dia |
| 5 | **Reviver extra** no Domínio | +1 reviver | 1/corrida |
| 6 | **Acelerar a recarga** do Desafio por deus | −4 h | 2/dia |
| 7 | **Oferta do dia** | 50 gemas **ou** 10 de Essência | até 3/dia |

Decisões do §343 que o §369 fecha: a invocação grátis **conta** para o pity; o **teto total** é **8/dia**; os valores são
os da tabela.

---

## 6. Deus da Semana

- **Sempre de raridade S** (nunca SS — o SS vem só da Invocação e do dia 30 do passe, para não desvalorizar o gacha).
- Um deus **só volta a ser Deus da Semana depois de no mínimo 12 semanas** (lista rotativa com janela de repetição).
- **1 marca/dia** por anúncio (§5 #2); **5 marcas em 7 dias ganham o deus** (perdoa 2 faltas). O **passe dá 2 marcas/dia**.
- Se o jogador **já tem** o deus, as marcas viram **pontos de duplicata** daquele deus (como a Invocação).
- **Compra direta por 1.800 gemas** (≈ 12 invocações — um pouco abaixo da média de ~45 invocações/SS, coerente com ser S,
  não SS).
- O progresso ("Deus · 3/5") aparece na Loja e na home.

---

## 7. Outras compras

- **+1 vaga de Provação permanente por 500 gemas** (até **2 vagas extras**).
- **Cosméticos** (molduras e artes alternativas) de **R$ 9,90 a R$ 24,90** — **sem nenhuma vantagem** de jogo (só visual).

---

## 8. Princípios (mantidos do §343)

- **Anúncio é sempre OPCIONAL e sempre RECOMPENSADO.** Nada de anúncio forçado, de tela cheia entre partidas, dentro da
  batalha ou ao abrir o app.
- **Nenhum anúncio nem compra dá vantagem no PvP.**
- **A recompensa de anúncio só é creditada pelo SERVIDOR**, após a confirmação da rede (*server-side verification* — ex.:
  SSV do AdMob). Limites diários e progresso vivem no servidor, como os tetos de hoje.
- **Itens de sorteio pago mostram as chances** de cada raridade (exigência das lojas).
- **O "dia" e a "semana" viram em UTC** (a mesma regra do Desafio da Semana).
- **Os valores ficam em `data/economia.json`** (fonte única) quando entrarem em código.

---

## 9. Ordem de implementação (para a fila)

Pré-requisito já atendido: **persistência das contas (§274)** — sem ela não se vende nem se recompensa nada.

1. **Loja + bilhete + passe (com o calendário) + compra SIMULADA no modo de desenvolvimento** — para testar tudo (passe,
   bilhetes, calendário, SS do dia 30, ofertas) **antes** da loja de verdade.
2. **A nova Invocação:** invocação grátis diária e o Deus da Semana.
3. **Integração real (junto da fase de publicação):** Google Play Billing / App Store, o AdMob com **verificação no
   servidor**, e a **tela de consentimento** (LGPD/GDPR) + o formulário de dados da loja.

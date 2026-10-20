# §343 · Plano de monetização

> **Documento de PLANO.** Não há código nem dado (`data/`) mudado por este arquivo. Ele registra o desenho da
> monetização para quando o dono decidir implementar; os pré-requisitos e a ordem estão no fim (seção 5).
> Quando entrar em código, os valores vivem em `data/economia.json` (fonte única) e as recompensas são creditadas
> **pelo servidor**, como os tetos de hoje.

---

## 1. Princípios

- **Anúncio é sempre OPCIONAL e sempre RECOMPENSADO (rewarded).** Nada de anúncio forçado ou de tela cheia entre
  partidas, nada dentro da batalha, nada ao abrir o app.
- **Nenhum anúncio nem compra dá vantagem no PvP.**
- **A recompensa de anúncio só é creditada pelo SERVIDOR**, depois da confirmação da rede de anúncios (verificação do
  lado do servidor — *server-side verification*, ex.: SSV do AdMob). Os limites diários e o progresso ficam no servidor,
  como os tetos de hoje.
- **Os valores ficam em `data/economia.json`** (fonte única), decididos pelo ganho semanal de um jogador que não paga.
- **O "dia" e a "semana" viram em UTC**, a mesma regra do Desafio da Semana.

---

## 2. Deus da Semana por anúncio (cenário principal — prioridade ALTA)

- Na Loja, um **deus de raridade alta** fica disponível por **7 dias**.
- Cada dia, o jogador pode assistir **1 anúncio** e ganha **1 marca** (no máximo 1 por dia → 7 possíveis na semana).
- Com **5 marcas** na semana, **ganha o deus** (perdoa 2 faltas).
- Se **já tem** o deus, as marcas convertem em **cópias**, que viram **pontos/níveis de habilidade**.
- O deus da semana sai de uma **lista ROTATIVA** que **exclui os lançamentos recentes** e só **repete cada deus depois de
  um intervalo longo**, para não desvalorizar a Invocação. Os parâmetros ficam em `data/`.
- **Atalhos pagos:** comprar o deus direto com **gemas**; o **passe** dá **2 marcas por dia**.
- O **progresso** (ex.: "Odin · 3/5") aparece na **Loja** e na **home**.

---

## 3. Outros anúncios (todos com recompensa)

| # | Cenário | Recompensa | Limite | Prioridade |
|---|---------|------------|--------|------------|
| 1 | Invocação diária grátis | 1 invocação | 1/dia | alta |
| 2 | Dobrar a recompensa do Desafio da Semana e do fim de corrida do Domínio | 2× | 1/dia cada | média |
| 3 | Reviver extra no Domínio | +1 reviver na corrida | 1/corrida | média |
| 4 | Acelerar a recarga do Desafio por deus | −4 h | 2/dia | média |
| 5 | Oferta do dia na Loja | pacote pequeno de gemas/Essência | 1–3/dia | média |
| 6 | Recompensa diária em dobro (se existir prêmio de entrada) | 2× | 1/dia | baixa |

**Decisões em aberto, para o dono:**
- se a invocação grátis **conta para a garantia de raridade** (pity 60);
- os **valores exatos**;
- o **teto total de anúncios por dia**;
- a **raridade** e o **intervalo de repetição** do Deus da Semana.

---

## 4. Compras (Loja)

- **Pacotes de gemas.**
- Um **PASSE** (mensal ou permanente) que entrega as recompensas dos anúncios **sem assistir**, e **2 marcas/dia** no
  Deus da Semana.
- **Vagas extras de Provação.**
- **Cosméticos** (molduras, artes alternativas).
- O **Deus da Semana direto com gemas.**

> Itens de **sorteio pago** precisam **mostrar as chances de cada raridade** (exigência das lojas; confirmar as regras
> atuais na implementação).

---

## 5. Pré-requisitos e ordem

1. **Persistência das contas (§274)** — sem isso não se vende nem se recompensa nada.
2. **Desenho da monetização** — o que vender, preços, passe, valores dos anúncios, a lista rotativa.
3. **A tela da Loja.**
4. **O app com o jogo guardado no celular** +
   - **pagamento pela loja** (Google Play Billing / App Store),
   - **SDK de anúncios** (ex.: AdMob via plugin do Capacitor),
   - **tela de consentimento** (LGPD/GDPR),
   - **formulário de dados da loja**.

# Persistência das contas (§354)

O servidor guarda o estado dos jogadores num **PostgreSQL** (em produção) ou num **arquivo** (desenvolvimento). A escolha
é automática:

- **Tem `DATABASE_URL`** (variável de ambiente) → usa o **PostgreSQL**. É o caso do Render em produção.
- **Não tem `DATABASE_URL`** → usa o **arquivo** `server/dados/contas.json` (dev e testes; some a cada deploy no Render,
  por isso o banco é necessário em produção).

Tudo passa por uma camada única — `server/armazenamento.js` — e o resto do servidor só fala com ela.

## O que é guardado

Um **documento JSONB por conta** (tabela `contas`), que contém: perfil (deuses possuídos e cópias), saldos (gema,
Essência), apelido, ranque e pontos do PvP, Provações ativas/progresso/liberadas, níveis de habilidade, pontos por deus,
pity da invocação, e o *ledger* da economia (tetos diários, 1ª-vez, dedupe de replay). Além disso:

- `contas.id` e `contas.nick` têm **unicidade** garantida pelo banco (apelido duplicado é recusado).
- `recibos` — chave única por prêmio pago (um recibo nunca paga duas vezes).
- `migracoes` — versões de migração já aplicadas (o esquema é criado no boot, de forma idempotente).

## Portável de propósito

- Driver **`pg`** padrão (node-postgres) e **SQL comum** de PostgreSQL. **Nada específico do Neon**: sem SDK, sem driver
  serverless/HTTP, sem *branching* na aplicação. A conexão vem só de `process.env.DATABASE_URL`, com **SSL ligado**.
- Trocar de provedor = **trocar a variável** `DATABASE_URL` + **copiar os dados** com `pg_dump`/`pg_restore`.

## Como fazer backup

**Backup completo (recomendado)** — com o `pg_dump` do PostgreSQL, usando o endereço que está no painel do Render:

```bash
pg_dump "$DATABASE_URL" -Fc -f incursion.dump      # arquivo comprimido (custom format)
# ou um .sql legível:
pg_dump "$DATABASE_URL" --no-owner --no-privileges -f incursion.sql
```

**Export legível (rápido)** — um JSON com as contas (bom para inspeção ou migração simples):

```bash
DATABASE_URL="…" node tools/exportar_banco.js backup.json
```

(O script nunca imprime o `DATABASE_URL`; mostra só o tipo de armazenamento e a contagem.)

## Como mudar de provedor

1. Crie o banco novo no outro provedor e pegue o endereço de conexão dele.
2. Restaure os dados:
   ```bash
   pg_restore -d "$NOVO_DATABASE_URL" incursion.dump        # do custom format
   # ou, se exportou .sql:  psql "$NOVO_DATABASE_URL" -f incursion.sql
   ```
3. No Render, troque o valor de `DATABASE_URL` no painel (Environment). Como no `render.yaml` ela está com `sync: false`,
   o Blueprint não sobrescreve esse valor.
4. Reinicie o serviço e confira em `/saude` que `armazenamento` é `postgres`, `banco` é `ok` e `contas` bate.

O esquema é criado sozinho no boot (idempotente), então um banco vazio funciona; se houver um `server/dados/contas.json`
local e o banco estiver vazio, o servidor **importa esses dados uma única vez** no primeiro boot (e registra que importou).

## Limites do plano gratuito do Neon

- O banco **suspende após ~5 minutos** sem uso e **acorda na primeira consulta** (a primeira ação depois de ocioso
  espera ~1s). O `/ping` do lançador dispara esse "acordar" em segundo plano, então a primeira ação do jogador já
  encontra o banco acordado. O servidor usa um pool pequeno (máx. 5), uma nova tentativa curta no acordar e tempo limite
  por consulta; se o banco estiver fora, responde com erro claro e **não cai** nem perde dados.
- Há limites de armazenamento e de horas de computação no plano gratuito (suficientes para testes com amigos). Para
  produção de verdade, subir de plano ou trocar de provedor é só trocar a variável (ver acima).

## Verificar em produção

`GET /saude` responde, **sem nenhum segredo**:

```json
{"armazenamento":"postgres","banco":"ok","contas":3}
```

- `armazenamento`: `postgres` (com `DATABASE_URL`) ou `arquivo`.
- `banco`: `ok` ou `fora`.
- `contas`: quantas contas há.

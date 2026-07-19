# Premiersoft Serasa Scale API

Backend para ingestao, estabilizacao e armazenamento de leituras de peso de balancas usadas no transporte de graos.

## Stack

- Node.js com TypeScript
- Fastify para API HTTP
- Prisma ORM
- SQLite para execucao local
- Zod para validacao
- Vitest para testes automatizados
- Swagger UI em `/docs`
- Docker Compose para execucao reproduzivel

## Arquitetura

```text
src/
  domain/      regras puras de estabilizacao, precificacao e erros
  services/    casos de uso, como recepcao de leituras
  http/        app Fastify, rotas e validacao de payload
  infra/       cliente Prisma
prisma/        schema do banco SQLite
tests/         testes unitarios e de integracao
```

O endpoint `POST /scale-readings` responde com `202 Accepted` depois de validar a balanca e processar a leitura em memoria. A pesagem final so e gravada quando o estabilizador detecta uma janela confiavel.

## Setup com Docker

Este e o fluxo recomendado para avaliacao, porque isola Node.js, Prisma e SQLite em um ambiente reproduzivel.

```bash
docker compose up -d --build
```

A API fica em `http://localhost:3333`.

Comandos uteis:

```bash
docker compose ps
docker compose logs -f api
docker compose down
```

O banco SQLite fica em um volume Docker chamado `premiersoft-serasa_scale-data`. O container executa `prisma migrate deploy` antes de iniciar a API, entao o schema e aplicado automaticamente.

Para reiniciar com banco limpo:

```bash
docker compose down -v
docker compose up -d --build
```

## Setup local sem Docker

```bash
pnpm install
cp .env.example .env
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run dev
```

A API sobe por padrao em `http://localhost:3333`.

## Testes

Com Docker rodando, valide a saude da API:

```bash
curl http://localhost:3333/health
```

Para rodar testes automatizados localmente:

```bash
pnpm test
```

Para validar o fluxo HTTP completo contra a API rodando no Docker:

```bash
pnpm run smoke:api
```

Esse smoke test cria dados unicos, envia 31 leituras com delay de 100ms e valida pesagem estabilizada e relatorios.

## Documentacao da API

- Swagger UI dinamico: `http://localhost:3333/docs`
- Arquivo OpenAPI versionado: [docs/openapi.yaml](/Users/jonathasrochadesouza/Developer/repositories/premiersoft-serasa/docs/openapi.yaml)
- Collection Postman: [docs/postman_collection.json](/Users/jonathasrochadesouza/Developer/repositories/premiersoft-serasa/docs/postman_collection.json)

## Como testar no Postman

1. Importe `docs/postman_collection.json`.
2. Confirme que a variavel `baseUrl` esta como `http://localhost:3333`.
3. Execute em ordem as requests `00` ate `05`.
4. Na request `06 Enviar leitura da balanca`, use o Collection Runner com `31` iteracoes e `100ms` de delay.
5. Depois execute as requests `07` ate `15` para consultar pesagens, relatorios e finalizar a transacao.

A request `06` usa scripts do Postman para variar o peso, preencher `Idempotency-Key` e salvar `weighingId` quando a pesagem estabiliza.

## Endpoints

- `POST /trucks`
- `GET /trucks`
- `POST /grain-types`
- `GET /grain-types`
- `POST /branches`
- `GET /branches`
- `POST /scales`
- `GET /scales`
- `POST /transport-transactions`
- `PATCH /transport-transactions/{id}/finish`
- `POST /scale-readings`
- `GET /weighings`
- `GET /weighings/{id}`
- `GET /reports/weighings-by-branch`
- `GET /reports/grain-profitability`
- `GET /reports/truck-productivity`
- `GET /reports/dock-stock`
- `GET /reports/scale-throughput`

## Exemplos

Criar caminhao:

```bash
curl -X POST http://localhost:3333/trucks \
  -H 'Content-Type: application/json' \
  -d '{ "plate": "ABC1D23", "tareKg": 10000 }'
```

Criar tipo de grao:

```bash
curl -X POST http://localhost:3333/grain-types \
  -H 'Content-Type: application/json' \
  -d '{ "name": "Soja", "purchasePricePerTon": 1500, "dockStockKg": 10000 }'
```

Criar filial:

```bash
curl -X POST http://localhost:3333/branches \
  -H 'Content-Type: application/json' \
  -d '{ "name": "Filial Sul", "city": "Londrina", "state": "PR" }'
```

Criar balanca:

```bash
curl -X POST http://localhost:3333/scales \
  -H 'Content-Type: application/json' \
  -d '{ "id": "scale-1", "name": "Balanca 1", "branchId": "<branchId>", "token": "token-seguro-123" }'
```

Criar transacao ativa:

```bash
curl -X POST http://localhost:3333/transport-transactions \
  -H 'Content-Type: application/json' \
  -d '{ "truckId": "<truckId>", "grainTypeId": "<grainTypeId>", "branchId": "<branchId>" }'
```

Enviar leitura da balanca:

```bash
curl -X POST http://localhost:3333/scale-readings \
  -H 'Content-Type: application/json' \
  -H 'X-Scale-Token: token-seguro-123' \
  -H 'Idempotency-Key: leitura-abc-001' \
  -d '{ "id": "scale-1", "plate": "ABC1D23", "weight": 30000 }'
```

Resposta antes da estabilizacao:

```json
{
  "status": "accepted",
  "stabilization": "collecting",
  "readingCount": 12
}
```

Resposta quando estabiliza:

```json
{
  "status": "stabilized",
  "weighingId": "clx...",
  "grossWeightKg": 30001.5
}
```

## Estrategia de estabilizacao

A estrategia completa esta em [docs/stabilization.md](/Users/jonathasrochadesouza/Developer/repositories/premiersoft-serasa/docs/stabilization.md).

Resumo:

- Leituras sao agrupadas por `scaleId + plate`.
- Cada grupo mantem uma janela movel em memoria.
- A janela precisa ter pelo menos 20 leituras.
- A janela precisa cobrir aproximadamente 3 segundos, configurado por `STABILIZATION_WINDOW_MS`.
- A diferenca entre maior e menor peso precisa estar dentro de `STABILIZATION_TOLERANCE_KG`.
- O peso bruto estabilizado e calculado por media aparada.
- A mesma presenca de caminhao na balanca e marcada como processada ate expirar por ausencia de leituras.

## Autenticacao e idempotencia

Cada balanca tem um token cadastrado. O endpoint de leituras exige `X-Scale-Token` igual ao token da balanca.

Quando `Idempotency-Key` e enviado, o backend retorna a resposta ja processada para a mesma chave e escopo, evitando duplicidade em retentativas do ESP32.

## Evolucao sugerida

Para alto volume em producao, o endpoint pode publicar leituras em uma fila e responder imediatamente. Workers consumiriam a fila, mantendo janelas em Redis ou outro cache distribuido para suportar multiplas instancias. Observabilidade pode incluir metricas de leituras por segundo, tempo ate estabilizacao, rejeicoes por token, duplicidades por idempotencia e taxa de erro por balanca.

## Uso de IA

Veja [USO_DE_IA.md](/Users/jonathasrochadesouza/Developer/repositories/premiersoft-serasa/USO_DE_IA.md).

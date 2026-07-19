# Arquitetura

## Estado atual

O repositório contém uma aplicação backend TypeScript em `src/`, com API HTTP Fastify, domínio de estabilização, serviço de ingestão, persistência Prisma e testes automatizados.

## Stack

- Node.js com TypeScript.
- Fastify para HTTP.
- Prisma ORM.
- SQLite para execução local.
- Zod para validação de payload.
- Vitest para testes.
- Swagger UI exposto em `/docs`.
- Docker Compose para execução reproduzível da API com SQLite em volume.

## Decisões

- A persistência local usa SQLite via Prisma para simplificar setup do desafio técnico.
- O endpoint `POST /scale-readings` processa a janela em memória e responde com `202 Accepted`.
- Leituras brutas não são persistidas como pesagens finais; apenas pesagens estabilizadas são salvas.
- A autenticação de balanças usa token por balança no header `X-Scale-Token`.
- A idempotência usa header opcional `Idempotency-Key`, registrado em tabela própria.
- O Docker é o caminho recomendado de execução para avaliação; o container aplica migrações com `prisma migrate deploy` antes de iniciar.

## Componentes ou módulos

- `src/domain`: regras puras de estabilização, precificação e erros.
- `src/services`: caso de uso de recepção de leituras e persistência de pesagem consolidada.
- `src/http`: app Fastify, rotas e schemas Zod.
- `src/infra`: cliente Prisma.
- `prisma/schema.prisma`: modelo relacional.
- `tests`: testes unitários e de integração.
- `Dockerfile` e `docker-compose.yml`: build e execução containerizada.
- `docs/openapi.yaml`: contrato OpenAPI versionado.
- `docs/postman_collection.json`: collection Postman sequenciada para validação manual.
- `scripts/k6-scale-readings.js`: teste de carga HTTP com k6 para simular balanças concorrentes enviando leituras a cada 100ms.

## Dados

Dados de domínio citados no desafio:
- Caminhão, incluindo tara no cadastro.
- Tipo de grão, incluindo preço de compra por tonelada.
- Filial.
- Balança, identificada por id.
- Transação de transporte, com tipo de grão, caminhão, início e fim.
- Pesagem estabilizada, contendo placa, peso bruto estabilizado, tara, peso líquido, data e hora, id da balança, tipo de grão e custo da carga.

## Integrações

Integração conhecida:
- Requisições HTTP enviadas por ESP32, simuláveis por chamadas HTTP ao endpoint de recepção.
- Swagger/OpenAPI exposto pela própria aplicação em `/docs`.

Integrações pendentes:
- Câmera LPR não tem protocolo detalhado no desafio.

## Pendências

- Avaliar evolução para fila, workers, cache distribuído e observabilidade se houver requisito de produção multi-instância.

## Validação

Build TypeScript e testes automatizados foram executados com sucesso usando pnpm e o Node.js empacotado do Codex. Docker Compose também foi validado com build da imagem, aplicação da migração Prisma, container saudável, `/health` e Swagger UI em `/docs`.

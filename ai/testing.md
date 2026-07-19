# Testes

## Estado atual

Há implementação de aplicação TypeScript/Fastify com testes unitários e de integração em `tests/`.

## Pré-requisitos

- Node.js e pnpm.
- Dependências instaladas com `pnpm install`.
- Cliente Prisma gerado com `pnpm run prisma:generate`.

## Decisões

- Testes unitários cobrem a regra de estabilização.
- Testes de integração cobrem o endpoint `POST /scale-readings`, autenticação da balança e persistência de pesagem estabilizada.
- A validação manual recomendada usa Docker Compose e a collection Postman em `docs/postman_collection.json`.

## Comandos validados

- `CI=true PATH=/Users/jonathasrochadesouza/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/jonathasrochadesouza/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH /Users/jonathasrochadesouza/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm run build`
- `CI=true PATH=/Users/jonathasrochadesouza/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/jonathasrochadesouza/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH /Users/jonathasrochadesouza/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm test`
- `docker compose up -d --build --force-recreate`
- `curl http://127.0.0.1:3333/health`
- `curl -I http://127.0.0.1:3333/docs`
- `CI=true PATH=/Users/jonathasrochadesouza/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/jonathasrochadesouza/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH /Users/jonathasrochadesouza/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm run smoke:api`
- `docker run --rm -i -e BASE_URL=http://host.docker.internal:3333 -e SCALE_COUNT=3 -e LOAD_DURATION=8s -v "$PWD/scripts:/scripts" grafana/k6 run /scripts/k6-scale-readings.js`
- `CI=true PATH=/Users/jonathasrochadesouza/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/jonathasrochadesouza/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH /Users/jonathasrochadesouza/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm run load:100ms:docker`

Observação: os comandos foram executados com o Node.js empacotado do Codex porque o Node.js instalado via Homebrew neste ambiente falhou ao carregar `libsimdjson.29.dylib`.
O k6 foi validado via Docker porque a instalação local via Homebrew falhou: `/opt/homebrew` pertence a outro usuário e não está gravável pelo usuário atual.

## Baseline antes de concluir

- Revise o diff.
- Se houver implementação, execute os comandos oficiais já registrados neste arquivo.
- Se não houver comandos oficiais, informe claramente a limitação ao usuário.

## Como registrar novos comandos oficiais

- Só registre um comando como oficial depois de executá-lo com sucesso neste repositório.
- Inclua o comando exato e o contexto em que ele deve ser usado.
- Atualize este arquivo quando a stack ou o fluxo de validação mudar.

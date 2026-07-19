# Decisões

Nenhuma decisão durável foi fornecida pelo usuário além do escopo do desafio técnico. Não transforme hipóteses em decisões.

Quando houver decisões, registre no formato:

## Título da decisão

**Decisão**: 

**Motivo**: 

**Consequências**: 

## Stack backend local

**Decisão**: Implementar a solução com Node.js, TypeScript, Fastify, Prisma, SQLite, Zod e Vitest.

**Motivo**: A stack permite entregar API REST completa, validação, documentação Swagger, persistência local simples e testes automatizados com baixo atrito para avaliação técnica.

**Consequências**: O projeto exige `pnpm install`, geração do Prisma Client e migração SQLite antes da execução local.

## Estabilização em memória

**Decisão**: Agrupar leituras por balança e placa em uma janela móvel em memória, consolidando a pesagem quando a janela atende quantidade mínima, duração aproximada e tolerância de variação.

**Motivo**: O endpoint precisa responder rápido para balanças fire-and-forget e não deve persistir leituras brutas como pesagens finais.

**Consequências**: A implementação atual é adequada para instância única; para múltiplas instâncias, a janela deve evoluir para cache distribuído ou processamento por fila com particionamento por balança e placa.

## Docker como setup recomendado

**Decisão**: Usar Docker Compose como fluxo recomendado de execução da aplicação.

**Motivo**: O Docker reduz variação de ambiente local, especialmente para Node.js, Prisma e SQLite, e permite deixar a API pronta para teste com um único comando.

**Consequências**: A API roda no serviço `api`, exposta em `localhost:3333`, com banco SQLite persistido em volume Docker e migrações aplicadas no startup do container.

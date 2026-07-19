# Uso de IA

## Prompt utilizado

O prompt principal foi o texto do desafio anexado, iniciando com:

```text
Voce e um desenvolvedor backend senior. Crie uma solucao backend completa para um desafio tecnico de ingestao, estabilizacao e armazenamento de leituras de peso de balancas usadas no transporte de graos.
```

O prompt tambem especificou entidades, endpoints esperados, estrategia obrigatoria de estabilizacao, autenticacao de balancas por `X-Scale-Token`, idempotencia por `Idempotency-Key`, retentativas, relatorios e documentacao.

## Partes geradas com auxilio de IA

- Estrutura do projeto TypeScript/Fastify.
- Modelo Prisma para cadastros, transacoes, pesagens e idempotencia.
- Implementacao do estabilizador por janela movel.
- Servico de recepcao de leituras e persistencia de pesagem consolidada.
- Rotas HTTP, validacoes e tratamento padronizado de erros.
- Relatorios administrativos.
- Testes unitarios e de integracao.
- README e documentacao da estrategia de estabilizacao.

## Decisoes revisadas ou adaptadas manualmente

- Escolha de Fastify, Prisma e SQLite para reduzir friccao de setup local no desafio tecnico.
- Uso de janela em memoria para manter resposta rapida no `POST /scale-readings`.
- Uso de media aparada para reduzir impacto de outliers sem complicar a solucao.
- Persistencia apenas da pesagem estabilizada, nao de cada leitura bruta.
- Token por balanca em `X-Scale-Token`.
- Idempotencia opcional por header, preservando compatibilidade com ESP32 simples.
- Separacao entre dominio, servico, HTTP e infraestrutura.

# Arquitetura

## Estado atual

O repositório ainda não contém implementação de aplicação. O único artefato observado antes da criação deste harness foi o diretório `.git`.

## Stack

Nenhuma stack foi definida ainda.

## Decisões

Nenhuma decisão de arquitetura foi registrada.

## Componentes ou módulos

Componentes esperados pelo desafio técnico:
- Cadastros de caminhão, tipo de grão, filial, balança e transação de transporte.
- Endpoint HTTP para receber leituras de balanças no formato `{ "id": "<id da balança>", "plate": "<placa do caminhão>", "weight": <peso total> }`.
- Mecanismo de estabilização para decidir quando uma sequência de leituras representa peso confiável.
- Persistência de pesagens estabilizadas.
- Relatórios ou estatísticas administrativas.

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

Integrações pendentes:
- Câmera LPR não tem protocolo detalhado no desafio.
- Autenticação de balanças é diferencial, ainda sem decisão de mecanismo.

## Pendências

- Definir stack, arquitetura de execução e persistência.
- Definir estratégia exata de estabilização.
- Definir modelo de dados e relacionamentos.
- Definir autenticação, idempotência e retentativas, caso sejam implementadas.
- Definir formato e escopo dos relatórios.

## Validação

Nenhuma validação técnica foi executada, pois ainda não há implementação de aplicação.

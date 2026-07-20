# Prompts utilizados

## Primeiro prompt, para a criação do harness que será utilizado no projeto

```text
Analise o teste técnico em anexo e me retorne o seguinte prompt preenchido: """[descreva em 3 a 8 frases o que o projeto pretende ser, para quem é, quais
problemas resolve e qualquer restrição importante já decidida.]

Contexto inicial conhecido:

- Nome do projeto: [nome]
- Stack já decidida, se houver: [ex.: nenhuma ainda / Node + React / etc.]
- Plataformas ou integrações desejadas: [liste ou diga "pendente"]
- Comandos conhecidos de desenvolvimento/teste: [liste ou diga "nenhum"]
- Regras de produto, negócio, marca ou segurança já decididas: [liste ou diga
    "pendente"]

Crie:

1. Um `AGENTS.md` na raiz, em português, que seja o ponto de entrada para
    agentes.
2. Uma pasta `ai/` com estes arquivos iniciais:
    - `ai/architecture.md`
    - `ai/product.md`
    - `ai/brand-identity.md`
    - `ai/editing.md`
    - `ai/testing.md`
    - `ai/decisions.md`
    - `ai/skills.md`
3. Uma skill local inicial em `ai/harness-maintenance/SKILL.md` explicando como
    manter o harness e quando criar novas skills locais.

Regras para o harness:

- Antes de escrever, inspecione o repositório e registre somente fatos
    observados ou decisões que eu forneci.
- Não invente stack, arquitetura, comandos, regras de negócio, convenções,
    identidade visual ou ferramentas ainda não decididas.
- Diferencie claramente "Estado atual", "Decisões", "Pendências" e
    "Validação".
- Mantenha cada informação em uma fonte principal. Evite repetir o mesmo
    conteúdo em vários arquivos.
- O `AGENTS.md` deve mandar ler primeiro ele mesmo e depois somente os contextos
    relevantes em `ai/`.
- O `AGENTS.md` deve instruir agentes a atualizar o arquivo relevante em `ai/`
    quando surgir conhecimento durável.
- O `AGENTS.md` deve instruir agentes a preservar mudanças preexistentes do
    usuário e revisar o diff antes de concluir.
- O `ai/testing.md` deve dizer que não há comandos validados quando esse for o
    caso. Só registre comandos como oficiais depois de uma execução bem-sucedida.
- O `ai/decisions.md` deve registrar decisões no formato:
    **Decisão**, **Motivo**, **Consequências**.
- O `ai/skills.md` deve explicar que novas skills ficam em
    `ai/<nome-do-workflow>/SKILL.md`, e que só devem ser criadas para processos
    repetitivos ou de automação.

Criação automática de skills:

- Sempre que você identificar um processo repetitivo, automatizável ou sensível
    a erro, avalie criar uma skill local em `ai/<nome-do-workflow>/SKILL.md`.
- Exemplos de processos que podem virar skill:
    - padrão de mensagens ou comentários de commit;
    - fluxo correto de implementação e validação;
    - checklist de release/deploy;
    - criação e revisão de automações;
    - rotinas de migração de dados;
    - triagem de bugs;
    - validação visual ou acessibilidade;
    - integração com serviços externos.
- Não crie skill para tarefa simples, isolada ou temporária.
- Toda skill local deve conter:
    - frontmatter YAML com `name` e `description`;
    - visão geral;
    - quando usar;
    - arquivos que devem ser lidos primeiro;
    - regras e proibições;
    - passo a passo;
    - validações;
    - checklist de conclusão.
- Depois de criar uma skill, registre seu caminho e quando usá-la em
    `ai/skills.md`.

Conteúdo mínimo esperado:

`AGENTS.md` deve conter seções:

- Projeto
- Leia conforme o cenário
- Regras essenciais
- Antes de concluir
- Manutenção deste harness

`ai/architecture.md` deve conter:

- Estado atual
- Stack
- Componentes ou módulos
- Dados
- Integrações
- Pendências

`ai/product.md` deve conter:

- Visão
- Público
- Problemas que resolve
- Requisitos conhecidos
- Não objetivos
- Pendências

`ai/brand-identity.md` deve conter:

- Estado atual
- Nome e linguagem
- Visual
- Assets canônicos
- Regras antes de mudar marca, cores, logo, tipografia, metadados, favicon,
    landing pages ou telas públicas

`ai/editing.md` deve conter:

- Estado atual
- Convenções de edição
- Como lidar com mudanças preexistentes
- Quando atualizar documentação interna

`ai/testing.md` deve conter:

- Estado atual
- Pré-requisitos
- Comandos validados
- Baseline antes de concluir
- Como registrar novos comandos oficiais

`ai/decisions.md` deve começar vazio ou somente com decisões fornecidas por mim.
Não transforme hipóteses em decisões.

`ai/skills.md` deve conter:

- O índice das skills locais existentes
- Critérios para criar novas skills
- Aviso para manter skills curtas, operacionais e ligadas a workflows reais

Depois de criar os arquivos:

- Revise o diff.
- Informe quais arquivos foram criados.
- Informe claramente qualquer limitação, principalmente se não houver comandos
    de validação ainda.
- Não faça commit a menos que eu peça."""
```

## Segundo prompt usando superpowers

```text
Você é um desenvolvedor backend sênior. Crie uma solução backend completa para um desafio técnico de ingestão, estabilização e armazenamento de leituras de peso de balanças usadas no transporte de grãos.

Contexto do desafio:
Uma empresa de transporte de grãos possui várias filiais pelo Brasil. Caminhões saem da filial para buscar um tipo de grão em uma fazenda e, ao retornar, passam por uma balança automatizada com ESP32 e câmera LPR. Enquanto houver caminhão sobre a balança, o ESP32 envia leituras HTTP a cada 100ms para o servidor. As leituras são instáveis, então o sistema deve identificar automaticamente quando o peso estabilizou e persistir apenas a pesagem consolidada.

Payload recebido da balança:
{
  "id": "<id da balança>",
  "plate": "<placa do caminhão>",
  "weight": <peso total>
}

Requisitos obrigatórios:
1. Implementar cadastros de:
   - Caminhão
   - Tipo de grão
   - Filial
   - Balança
   - Transação de transporte

2. A transação de transporte deve representar a compra e pesagem de grãos de um tipo para um caminhão, com início e fim.

3. Implementar endpoint HTTP para receber leituras das balanças:
   - POST /scale-readings
   - Deve aceitar leituras simultâneas de várias balanças.
   - A balança envia em modo fire-and-forget, então o backend deve responder rápido.

4. Persistir pesagens apenas quando o peso estiver estabilizado.

5. Ao salvar uma pesagem estabilizada, armazenar:
   - Placa
   - Peso bruto estabilizado
   - Tara do caminhão
   - Peso líquido
   - Data e hora da pesagem
   - Id da balança
   - Tipo de grão
   - Custo da carga

6. O peso líquido deve ser:
   peso_liquido = peso_bruto_estabilizado - tara

7. O custo da carga deve ser:
   custo = (peso_liquido_kg / 1000) * preco_compra_por_tonelada

8. Cada tipo de grão possui preço de compra por tonelada.

9. O preço de venda deve aplicar margem entre 5% e 20% sobre o preço de compra.

10. A margem deve ser inversamente proporcional à quantidade disponível do tipo de grão na doca:
   - quanto mais escasso o grão, maior a margem;
   - quanto mais abundante, menor a margem.

Endpoints esperados:
- POST /trucks
- GET /trucks
- POST /grain-types
- GET /grain-types
- POST /branches
- GET /branches
- POST /scales
- GET /scales
- POST /transport-transactions
- PATCH /transport-transactions/{id}/finish
- POST /scale-readings
- GET /weighings
- GET /weighings/{id}
- GET /reports/weighings-by-branch
- GET /reports/grain-profitability
- GET /reports/truck-productivity
- GET /reports/dock-stock
- GET /reports/scale-throughput

Estratégia de estabilização obrigatória:
Agrupe as leituras por balança e placa. Use uma janela móvel de tempo para identificar estabilidade. Uma pesagem deve ser considerada estabilizada quando:
- houver pelo menos 20 leituras recentes para a mesma balança e placa;
- a janela analisada representar aproximadamente 3 segundos de leituras;
- a variação entre os pesos da janela estiver dentro de um limite configurável, por exemplo 30kg;
- o peso bruto estabilizado for calculado usando mediana ou média aparada para reduzir impacto de outliers.

Evite criar múltiplas pesagens para o mesmo caminhão parado na mesma balança. Depois que uma pesagem for consolidada, marque aquela presença como processada até que o caminhão saia ou a janela expire.

Requisitos de qualidade:
- Criar uma arquitetura simples, clara e robusta.
- Separar responsabilidades entre controller, service, domínio/regras de negócio e persistência.
- Validar payloads de entrada.
- Tratar erros de forma consistente.
- Criar testes unitários para a regra de estabilização.
- Criar testes de integração para o endpoint POST /scale-readings.
- Documentar como rodar a aplicação.
- Documentar a estratégia de estabilização.
- Documentar exemplos de payload e resposta.
- Criar documentação OpenAPI/Swagger, se a stack permitir.

Diferenciais que devem ser incluídos:
1. Autenticação de balanças:
   - Validar se a requisição veio de uma balança autorizada.
   - Usar um token por balança, preferencialmente via header X-Scale-Token.

2. Idempotência:
   - Suportar header Idempotency-Key quando enviado.
   - Evitar duplicidade de pesagens estabilizadas.

3. Retentativa:
   - Considerar que o ESP32 pode reenviar leituras.
   - O sistema deve lidar com duplicidade sem gerar pesagens incorretas.

4. Arquitetura evolutiva:
   - Explicar como a solução poderia evoluir para uso de fila, workers, cache distribuído e observabilidade.

Relatórios desejados:
- Volume total transportado por tipo de grão.
- Custo total por filial.
- Lucro ou margem estimada por tipo de grão.
- Produtividade por caminhão.
- Quantidade de pesagens por balança.
- Estoque disponível por doca.
- Grãos mais escassos e margem aplicada.

Restrições importantes:
- Não implementar fisicamente a balança nem o ESP32.
- Não implementar integração real com câmera LPR, apenas usar a placa recebida no payload.
- Não salvar toda leitura como pesagem final.
- Não considerar uma única leitura como peso estabilizado.
- Não ignorar concorrência entre múltiplas balanças.
- Não inventar regra de negócio que contradiga o desafio.
- Manter o código simples, legível e adequado para avaliação técnica.

Entrega esperada:
- Código completo da aplicação.
- README explicando arquitetura, setup, execução, testes e endpoints.
- Documentação da estratégia de estabilização.
- Exemplos de requisições HTTP.
- Testes automatizados.
- Um arquivo ou seção chamada "Uso de IA", contendo:
  - o prompt utilizado;
  - quais partes foram geradas com auxílio de IA;
  - quais decisões foram revisadas ou adaptadas manualmente.

Antes de gerar código, proponha rapidamente a arquitetura, modelo de dados e stack escolhida. Depois implemente a solução completa.
```

## Terceiro prompt, iniciando o Docker no projeto

```text
Quero o setup com docker de forma conciente e bem estruturada, como se você fosse um arquiteto de software experiente. Depois também quero uma collection completa das chamadas por sequencia para importar no postman, quero com o 'header', 'body', 'endpoints' e afins corretos. Valide para mim toda a implementação, deixe o docker rodando, me instrua por aqui como realizar os testes e se prepare para derrubar quando eu pedir (após eu realizar todos os testes). Atualize o README e documentos, ja que agora estamos usando o docker! também será importante termos um arquivo de openapi do 'Swagger'para termos os endpoints mapeados e documentados de forma fácil e visivel.
```

## Quarto prompt, aplicação do K6

```text
Vamos usar o k6 no projeto, instale o grafana/k6 no docker. Com isso podemos validar a regra: """`06` requests com `31` iterações e `100ms` de delay""", valide com scripts antes de finalizar!
```

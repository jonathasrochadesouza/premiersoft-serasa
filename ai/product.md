# Produto

## Visão

Criar uma solução backend robusta para receber, estabilizar e armazenar leituras de peso de balanças em uma operação de transporte de grãos. A solução deve transformar medições instáveis e frequentes em registros confiáveis de pesagem, permitindo calcular peso líquido, custo da carga e informações administrativas.

## Público

O público conhecido é uma empresa de transporte de grãos com diversas filiais pelo Brasil. Usuários administrativos precisam analisar pesagens, custos e oportunidades de lucro.

## Problemas que resolve

- Receber leituras de balanças que enviam medições a cada 100ms enquanto há caminhão presente.
- Lidar com comunicação fire-and-forget, sem a balança aguardar resposta do servidor.
- Identificar automaticamente quando o peso está estabilizado.
- Persistir apenas pesagens estabilizadas e associadas aos dados de negócio.
- Apoiar cálculo de custos e análise administrativa.

## Requisitos conhecidos

- Cadastrar caminhão, tipo de grão, filial, balança e transação de transporte.
- Representar transação de transporte como transação de compra e pesagem de grãos de um tipo para um caminhão, com início e fim.
- Receber payload HTTP com id da balança, placa do caminhão e peso total.
- Considerar envio simultâneo por todas as balanças.
- Armazenar placa, peso bruto estabilizado, tara, peso líquido, data e hora da pesagem, id da balança, tipo de grão e custo da carga.
- Cada caminhão parte da filial com o tipo de grão que buscará em uma fazenda.
- Depois de descarregar, o caminhão pode receber nova demanda de transporte.
- Cada tipo de grão possui preço de compra por tonelada.
- O preço de venda aplica margem entre 5% e 20% sobre o preço de compra.
- A margem é inversamente proporcional à quantidade disponível de cada tipo de grão na doca.
- Criar ou desenhar relatórios com informações importantes para análise administrativa.
- É obrigatório usar IA na construção da solução e compartilhar o prompt utilizado e o código gerado.

## Decisões

- Relatórios entregues: pesagens por filial, rentabilidade por grão, produtividade por caminhão, estoque de doca e throughput por balança.
- A margem de venda varia entre 5% e 20%, calculada de forma inversamente proporcional ao estoque do tipo de grão na doca.
- A pesagem usa a transação de transporte ativa mais recente do caminhão.

## Não objetivos

- Implementar fisicamente a balança ou o ESP32.
- Implementar protocolo específico de câmera LPR, pois o desafio não detalha essa integração.

## Pendências

- Definir nome público do produto, caso seja diferente do nome do repositório.
- Definir regras operacionais adicionais para múltiplas transações simultâneas do mesmo caminhão, caso isso seja possível no negócio real.

## Validação

Os requisitos foram extraídos do PDF `desafio-tecnico-backend_ia.pdf` e do pedido anexado na conversa. Build TypeScript e testes automatizados foram executados com sucesso.

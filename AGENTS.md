# Projeto

Este repositório pretende abrigar uma solução backend para um desafio técnico de ingestão, estabilização e armazenamento de leituras de peso de balanças usadas no transporte de grãos. O sistema é voltado a uma empresa com filiais, docas, caminhões, balanças com ESP32 e câmeras LPR, que precisa receber medições frequentes via HTTP, identificar automaticamente quando o peso estabilizou e persistir dados confiáveis para cálculo de carga, custo e análises administrativas. O problema central é transformar leituras instáveis enviadas a cada 100ms em pesagens estabilizadas, associadas a caminhão, balança, filial, tipo de grão e transação de transporte. O desafio também prevê relatórios, autenticação de balanças, idempotência, retentativas e documentação do uso de IA, mas a stack e os comandos de desenvolvimento ainda não foram definidos.

Contexto inicial conhecido:
- Nome do projeto: premiersoft-serasa
- Stack já decidida, se houver: nenhuma ainda
- Plataformas ou integrações desejadas: endpoint HTTP para simular/receber leituras de ESP32; demais integrações pendentes
- Comandos conhecidos de desenvolvimento/teste: nenhum
- Regras de produto, negócio, marca ou segurança já decididas: regras do desafio técnico registradas em `ai/product.md`; autenticação de balanças é diferencial pendente

# Leia conforme o cenário

Leia primeiro este arquivo. Depois leia somente os contextos relevantes em `ai/`:
- Arquitetura, stack, dados e integrações: `ai/architecture.md`
- Regras de produto e negócio: `ai/product.md`
- Marca, linguagem pública e identidade visual: `ai/brand-identity.md`
- Convenções de edição e documentação interna: `ai/editing.md`
- Testes, comandos validados e baseline: `ai/testing.md`
- Decisões duráveis já tomadas: `ai/decisions.md`
- Skills locais e criação de novos workflows: `ai/skills.md`

# Regras essenciais

- Antes de escrever, inspecione o repositório e registre somente fatos observados ou decisões fornecidas pelo usuário.
- Não invente stack, arquitetura, comandos, regras de negócio, convenções, identidade visual ou ferramentas ainda não decididas.
- Diferencie claramente Estado atual, Decisões, Pendências e Validação nos documentos em `ai/`.
- Mantenha cada informação em uma fonte principal e evite repetir o mesmo conteúdo em vários arquivos.
- Quando surgir conhecimento durável, atualize o arquivo relevante em `ai/` no mesmo trabalho.
- Preserve mudanças preexistentes do usuário. Não reverta alterações que não foram feitas por você sem pedido explícito.

# Antes de concluir

- Revise o diff.
- Confirme quais arquivos foram alterados ou criados.
- Informe limitações, especialmente comandos de teste ainda não validados.
- Só registre comandos em `ai/testing.md` depois de uma execução bem-sucedida.
- Não faça commit a menos que o usuário peça.

# Manutenção deste harness

Use `ai/harness-maintenance/SKILL.md` ao alterar a estrutura do harness ou criar novas skills locais. Skills locais devem ficar em `ai/<nome-do-workflow>/SKILL.md` e só devem ser criadas para processos repetitivos, automatizáveis ou sensíveis a erro.

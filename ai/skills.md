# Skills locais

## Índice das skills locais existentes

- `ai/harness-maintenance/SKILL.md`: use ao manter este harness, ajustar a documentação em `ai/` ou avaliar a criação de novas skills locais.

## Critérios para criar novas skills

Crie novas skills locais em `ai/<nome-do-workflow>/SKILL.md` somente para processos repetitivos, automatizáveis ou sensíveis a erro.

Exemplos de workflows que podem justificar uma skill:
- Padrão de mensagens ou comentários de commit.
- Fluxo correto de implementação e validação.
- Checklist de release ou deploy.
- Criação e revisão de automações.
- Rotinas de migração de dados.
- Triagem de bugs.
- Validação visual ou acessibilidade.
- Integração com serviços externos.

Não crie skill para tarefa simples, isolada ou temporária.

Toda skill local deve conter:
- Frontmatter YAML com `name` e `description`.
- Visão geral.
- Quando usar.
- Arquivos que devem ser lidos primeiro.
- Regras e proibições.
- Passo a passo.
- Validações.
- Checklist de conclusão.

## Manutenção

Mantenha skills curtas, operacionais e ligadas a workflows reais. Depois de criar uma skill, registre seu caminho e quando usá-la neste arquivo.

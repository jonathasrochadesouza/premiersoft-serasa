---
name: harness-maintenance
description: Mantém o harness de contexto em AGENTS.md e ai/, e orienta quando criar novas skills locais.
---

# Visão geral

Use esta skill para manter o ponto de entrada de agentes e os arquivos de contexto durável do projeto. O objetivo é registrar fatos observados e decisões fornecidas, sem transformar hipóteses em documentação oficial.

# Quando usar

- Ao criar ou alterar `AGENTS.md`.
- Ao criar ou alterar arquivos em `ai/`.
- Ao avaliar se um workflow repetitivo deve virar skill local.
- Ao registrar uma nova skill local em `ai/skills.md`.

# Arquivos que devem ser lidos primeiro

- `AGENTS.md`
- `ai/architecture.md`
- `ai/product.md`
- `ai/editing.md`
- `ai/testing.md`
- `ai/decisions.md`
- `ai/skills.md`

Leia apenas os arquivos adicionais relevantes para o cenário em andamento.

# Regras e proibições

- Não invente stack, comandos, arquitetura, identidade visual, regras de negócio ou ferramentas.
- Separe fatos observados, decisões, pendências e validação.
- Mantenha cada informação em uma fonte principal.
- Não duplique detalhes extensos entre arquivos.
- Não sobrescreva mudanças preexistentes do usuário.
- Não crie skill para tarefa simples, isolada ou temporária.

# Passo a passo

1. Inspecione o estado do repositório.
2. Leia `AGENTS.md` e os arquivos relevantes em `ai/`.
3. Identifique se a informação nova é fato observado, decisão fornecida ou pendência.
4. Atualize o arquivo principal adequado.
5. Se houver processo repetitivo, automatizável ou sensível a erro, avalie criar `ai/<nome-do-workflow>/SKILL.md`.
6. Ao criar uma skill, inclua frontmatter YAML com `name` e `description` e as seções operacionais exigidas em `ai/skills.md`.
7. Registre a skill nova em `ai/skills.md`.
8. Revise o diff antes de concluir.

# Validações

- `AGENTS.md` continua sendo o ponto de entrada.
- Arquivos em `ai/` continuam sem hipóteses tratadas como decisões.
- `ai/testing.md` registra comandos oficiais somente quando já foram executados com sucesso.
- `ai/decisions.md` usa o formato **Decisão**, **Motivo**, **Consequências** para decisões novas.
- Toda skill local criada está listada em `ai/skills.md`.

# Checklist de conclusão

- Estado do repositório inspecionado.
- Arquivo correto em `ai/` atualizado.
- Mudanças preexistentes preservadas.
- Diff revisado.
- Limitações comunicadas ao usuário.

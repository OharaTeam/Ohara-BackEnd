# STATE.md - Estado Atual do Projeto

## 📍 Posição no Projeto

- **Milestone Ativo**: Milestone 1 - Fundação e Padronização Colaborativa
- **Fase Concluída e Revisada**: [Fase 2: Padronização Colaborativa, Onboarding & Automação no GitHub](file:///home/caetano/OharaBack-End--NestJS-/.planning/ROADMAP.md#fase-2-padroniza%C3%A7%C3%A3o-colaborativa-onboarding--automa%C3%A7%C3%A3o-no-github-conclu%C3%ADda-e-revisada-) ✅
- **Fase Atual**: [Fase 3: Implementação dos Módulos do Schema (Comentários & Eventos)](file:///home/caetano/OharaBack-End--NestJS-/.planning/ROADMAP.md#fase-3-implementa%C3%A7%C3%A3o-dos-m%C3%B3dulos-do-schema-foco-atual-) 🚀
- **Branch Git**: `feat--organizando-documentacao`
- **Quadro Kanban**: [GitHub Projects #1 (Ohara Back-End - Roadmap & Sprint)](https://github.com/orgs/OharaTeam/projects/1)
- **Última Atualização**: 2026-10-05

---

## ⚡ Contexto Operacional

- **Fase 2 Concluída e Reorganizada**:
  - [`.env.example`](file:///home/caetano/OharaBack-End--NestJS-/.env.example): Criado e documentado cobrindo todos os serviços (PostgreSQL, Docker, JWT, Discord, Steam, Evolution API/WhatsApp).
  - [`README.md`](file:///home/caetano/OharaBack-End--NestJS-/README.md): Atualizado com guia rápido de onboarding (Docker Compose, Bun, Prisma) e link para o GitHub Projects.
  - [`CONTRIBUTING.md`](file:///home/caetano/OharaBack-End--NestJS-/CONTRIBUTING.md): Guia de início rápido para desenvolvedores novatos, fluxo do card ao PR, sanitização obrigatória de branches (sem caracteres especiais/acentos para evitar bugs no Git/GitHub) e regra estrita de aprovação manual para a `main`.
  - [`.github/pull_request_template.md`](file:///home/caetano/OharaBack-End--NestJS-/.github/pull_request_template.md): Template padronizado de PR com checklist de verificação.
  - Templates de Issue em [`.github/ISSUE_TEMPLATE/`](file:///home/caetano/OharaBack-End--NestJS-/.github/ISSUE_TEMPLATE/) (`task.yml`, `feature.yml`, `bug_report.yml`).
  - **Reorganização das Issues do Roadmap**:
    - Decomposição das grandes tarefas em **16 micro-tarefas atômicas** com escopos claros em [`.planning/github-issues/`](file:///home/caetano/OharaBack-End--NestJS-/.planning/github-issues/).
    - Limpeza dos corpos das issues (sem títulos redundantes nem blocos soltos de frontmatter).
    - Metadados e versionamento centralizados em [`.planning/github-issues/manifest.json`](file:///home/caetano/OharaBack-End--NestJS-/.planning/github-issues/manifest.json).
    - Ordem de prioridade padronizada via labels (`priority: p1-alta`, `priority: p2-media`, `priority: p3-baixa`).
    - Script seguro [`scripts/sync-roadmap-issues.sh`](file:///home/caetano/OharaBack-End--NestJS-/scripts/sync-roadmap-issues.sh) com `--dry-run` por padrão, confirmação explícita (`--execute`) e sincronização direta no GitHub Projects.
    - Minecraft & Cobblemon movido para backlog futuro para planejamento dedicado.

---

## 🚀 Próximas Ações Imediatas (Fase 3)

1. Sincronizar o backlog no GitHub Projects via `bash scripts/sync-roadmap-issues.sh --execute`.
2. Desenvolvedores novatos escolhem e se atribuem às tarefas da Fase 3:
   - **TASK-01**: `feat(comentarios): modelar DTOs e criar endpoint POST /postagens/:id/comentarios` (🔴 `priority: p1-alta`)
   - **TASK-02**: `feat(comentarios): implementar listagem paginada GET /postagens/:id/comentarios` (🔴 `priority: p1-alta`)
   - **TASK-04**: `feat(eventos): criar módulo, DTOs e endpoints de criação e listagem de eventos` (🔴 `priority: p1-alta`)

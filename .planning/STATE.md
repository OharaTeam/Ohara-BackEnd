# STATE.md - Estado Atual do Projeto

## 📍 Posição no Projeto

- **Milestone Ativo**: Milestone 1 - Fundação e Padronização Colaborativa
- **Fases Concluídas e Revisadas**:
  - [Fase 1: Swagger & Estabilização da API](file:///home/caetano/OharaBack-End--NestJS-/.planning/ROADMAP.md#phase-1-documenta%C3%A7%C3%A3o-swagger--estabiliza%C3%A7%C3%A3o-da-api-conclu%C3%ADda-) ✅
  - [Fase 2: Padronização Colaborativa, Onboarding & Automação no GitHub](file:///home/caetano/OharaBack-End--NestJS-/.planning/ROADMAP.md#fase-2-padroniza%C3%A7%C3%A3o-colaborativa-onboarding--automa%C3%A7%C3%A3o-no-github-conclu%C3%ADda-e-revisada-) ✅
  - [Fase 3: Módulos do Schema - Comentários e Eventos](file:///home/caetano/OharaBack-End--NestJS-/.planning/ROADMAP.md#phase-3-modulos-do-schema---comentarios-e-eventos-conclu%C3%ADda-e-revisada-) ✅
- **Progresso da Fase 3**: [██████████] 100% (6 de 6 tarefas concluídas e mergeadas na `main`)
- **Próxima Fase**: [Fase 4: Testes Automatizados & Blindagem de Segurança](file:///home/caetano/OharaBack-End--NestJS-/.planning/ROADMAP.md#phase-4-qualidade-testes-automatizados--blindagem-de-seguran%C3%A7a) 🛡️
- **Branch Git**: `main`
- **Quadro Kanban**: [GitHub Projects #1 (Ohara Back-End - Roadmap & Sprint)](https://github.com/orgs/OharaTeam/projects/1)
- **Última Atualização**: 2026-10-25

---

## ⚡ Contexto Operacional

- **Decisão Crítica de Permissões (RBAC)**: O **único** cargo com permissões de administrador no sistema é o cargo **`Dev`**. Usuários que não sejam o autor original de um recurso só poderão atualizá-lo ou excluí-lo caso possuam explicitamente a role `'Dev'`.
- **Pull Requests Recentes Mergeados na `main`**:
  - **PR #27**: `feat(comentario): Criação do delete pelo usuario/dev` / `fix(comentarios): corrigir RBAC Dev, runtime do prisma e adicionar testes unitários` (TASK-03 / Issue #12 fechada). ✅
  - **PR #26**: `feat(eventos): implementar endpoints de detalhes, atualização e exclusão de eventos` (TASK-05 / Issue #13 fechada). ✅
  - **PR #25**: `feat(comentarios): implementar listagem paginada GET /postagens/:id/comentarios e alinhar getPost` (TASK-02 / Issue #11 fechada). ✅
  - **PR #23**: `feat(eventos): enriquecer exibição e filtros de eventos no getFeed de postagens` (TASK-06 / Issue #14 fechada). ✅
  - **PR #22**: `feat(eventos): criar módulo, DTOs e endpoint POST /eventos integrado ao feed com agenda GET /eventos` (TASK-04 / Issue #2 fechada). ✅
  - **PR #20**: `feat(comentarios): modelar DTOs e criar endpoint POST /postagens/:id/comentarios` (TASK-01 / Issue #1 fechada). ✅
- **Ambiente & Testes**:
  - Runtime: Bun v1.4.2 / Node.js
  - Banco de Dados: PostgreSQL (Docker Compose)
  - Prisma Client: v7.9.1 sincronizado
  - Build NestJS: 100% aprovado (`bun run build`)
  - Testes das Fases 1-3: 35/35 testes em `src/postagens` e 38/38 testes em `src/eventos` passando com 100% de sucesso.
- **Relatório do Milestone**: Gerado em `.planning/reports/MILESTONE_SUMMARY-v1.0.md`.

---

## 🚀 Próximas Ações Imediatas (Transição Fase 3 → Fase 4 & Blindagem de Segurança)

1. **Revisão de Segurança e Reorganização de Regras**:
   - Ajustar `createPost` para não permitir spoofing de `discordId` (extrair autor diretamente do token JWT `req.user.discordId`).
   - Corrigir TTL do `@nestjs/throttler` de 60ms para 60.000ms (60s).
   - Aplicar validação estrita de MIME type e tamanho máximo nos uploads do Multer.
   - Higienizar logs removendo PII (emails e tokens) em `AuthService` e `JwtStrategy`.
2. **Fase 4: Qualidade, Testes Automatizados & Blindagem de Segurança**:
   - TASK-07: Testes unitários para `AuthService` e Guards (`JwtAuthGuard`, `BotKeyGuard`).
   - TASK-08: Testes unitários para `MembrosService` e `CargosService` (corrigindo resolução do Prisma nos specs legados).
   - TASK-09: Testes unitários para `PostagensService` e `UsersService`.
   - TASK-10 / TASK-11: Testes E2E para Auth e Feed.
   - TASK-12 / TASK-13: `TokenBlacklistService` e revogação no logout.

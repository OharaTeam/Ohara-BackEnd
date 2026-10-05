# ROADMAP.md - Planejamento de Fases e Marcos

## 🗺️ Visão dos Marcos (Milestones)

```
[Fase 1: Swagger & Estabilização] 
       │
       ▼
[Fase 2: Colaboração, Onboarding & Automação de Roadmap no GitHub]
       │
       ▼
[Fase 3: Implementação dos Módulos do Schema (Comentários & Eventos)]
       │
       ▼
[Fase 4: Testes Automatizados & Blindagem de Segurança]
       │
       ▼
[Fase 5: Observabilidade, CI/CD & Infraestrutura]
       │
       ▼
[Backlog Futuro: Integração Minecraft & Cobblemon]
```

* 📌 **Quadro Kanban Oficial**: [**GitHub Projects - Ohara Back-End**](https://github.com/orgs/OharaTeam/projects/1)

---

### 📍 Fase 1: Documentação Swagger & Estabilização da API (Concluída ✅)
**Objetivo**: Completar os contratos da API no Swagger/OpenAPI e garantir consistência nos DTOs, schemas de resposta e tratamento de rotas existentes.

- [x] Configuração central do Swagger no `main.ts` com autenticação Bearer e API Keys.
- [x] Documentar integralmente os controladores com `@ApiOperation`, `@ApiResponse`, `@ApiBody` e DTOs tipados:
  - [x] `AuthController` (fluxo OAuth2, exchange e logout)
  - [x] `MembrosController` (respostas tipadas, paginação, busca e remoção de `@ApiBody` incorreto de GETs)
  - [x] `CargosController` (documentação de sincronização de cargos, segurança BOT_KEY e status codes)
  - [x] `UsersController` (schemas de retorno de perfil, Steam summary, games e vitrine)
  - [x] `PostagensController` (schemas de criação de post, upload multipart de imagens e feed paginado)
  - [x] `AppController` (healthcheck operacional taggeado)
- [x] Validação dos DTOs de entrada e responses sem vazamento de dados confidenciais.

---

### 📍 Fase 2: Padronização Colaborativa, Onboarding & Automação no GitHub (Concluída e Revisada ✅)
**Objetivo**: Alinhar o repositório para colaboração em equipe, documentar ambiente de setup, padronizar contribuição e quebrar o roadmap em micro-tasks automatizáveis no GitHub Issues e GitHub Projects.

- [x] **Onboarding & Setup de Desenvolvimento**:
  - [x] Criação de `.env.example` exaustivo com descrição de cada variável (Discord, JWT, DB, Steam, Evolution API, Ports).
  - [x] Documentação de setup local no `README.md` (rodar com Docker, migrações Prisma, Bun).
- [x] **Governança do Repositório & Guias de Contribuição**:
  - [x] `CONTRIBUTING.md` com guia para iniciantes, fluxo do card ao PR, sanitização obrigatória de branches (sem caracteres especiais/acentos) e regra estrita de aprovação manual para a `main`.
  - [x] `.github/pull_request_template.md` com checklist de qualidade (testes, docs, breaking changes).
  - [x] `.github/ISSUE_TEMPLATE/` (templates estruturados para Bug Report, Feature Request e Task).
- [x] **Decomposição do Roadmap em Micro-Tarefas & Versionamento Seguro**:
  - [x] Reestruturação em 16 micro-tarefas atômicas e focadas em `.planning/github-issues/`.
  - [x] Remoção de títulos redundantes do corpo das issues e separação limpa de metadados em `manifest.json`.
  - [x] Taxonomia de prioridades com labels categorizadas (`priority: p1-alta`, `priority: p2-media`, `priority: p3-baixa`).
  - [x] Criação e vinculação do quadro [GitHub Projects #1 (Ohara Back-End - Roadmap & Sprint)](https://github.com/orgs/OharaTeam/projects/1).
  - [x] Prevenção de execuções acidentais: scripts de aplicação de issues não são versionados no repositório (protegidos via `.gitignore`) para evitar disparos indevidos ou duplicados.

---

### 📍 Fase 3: Implementação dos Módulos do Schema (Foco Atual 🚀)
**Objetivo**: Desenvolver os domínios mapeados no `prisma/schema.prisma` que ainda não possuem endpoints REST implementados.

- [ ] **Módulo de Comentários** (Submódulo em `src/postagens` ou `src/comentarios`):
  - [ ] **TASK-01**: Modelagem de DTOs e endpoint de criação `POST /postagens/:id/comentarios` [🔴 `priority: p1-alta`]
  - [ ] **TASK-02**: Implementar listagem paginada `GET /postagens/:id/comentarios` com dados do autor [🔴 `priority: p1-alta`]
  - [ ] **TASK-03**: Implementar exclusão com controle de autor/admin `DELETE /postagens/:id/comentarios/:commentId` [🟡 `priority: p2-media`]
- [ ] **Módulo de Eventos Ohara** (`src/eventos`):
  - [ ] **TASK-04**: Estruturar módulo, DTOs e endpoints de criação e listagem `POST /eventos` e `GET /eventos` [🔴 `priority: p1-alta`]
  - [ ] **TASK-05**: Implementar endpoints de detalhes, atualização e cancelamento `GET/PATCH/DELETE /eventos/:id` [🟡 `priority: p2-media`]
  - [ ] **TASK-06**: Vincular eventos às postagens do feed da comunidade Ohara [🟢 `priority: p3-baixa`]

> [!NOTE]
> **Item Movido para Backlog Futuro**: A integração do **Módulo Minecraft & Cobblemon** (`ContaMinecraft`, `PokemonsCapturados`) possui complexidade de autenticação entre servidores (M2M) e sincronização de eventos de jogo, portanto seu planejamento detalhado e implementação serão realizados em uma etapa posterior dedicada.

---

### 📍 Fase 4: Qualidade, Testes Automatizados & Blindagem de Segurança
**Objetivo**: Blindar a integridade da API com suíte de testes unitários e E2E, além de implementar revogação ativa de tokens JWT.

- [ ] **Testes Unitários com Jest**:
  - [ ] **TASK-07**: Testes unitários para `AuthService` e Guards (`JwtAuthGuard`, `BotKeyGuard`, `SiteKeyGuard`) [🔴 `priority: p1-alta`]
  - [ ] **TASK-08**: Testes unitários para `MembrosService` e `CargosService` (lógica de sync e BigInt) [🟡 `priority: p2-media`]
  - [ ] **TASK-09**: Testes unitários para `PostagensService` e `UsersService` (feed e Steam API) [🟡 `priority: p2-media`]
- [ ] **Testes End-to-End (E2E)**:
  - [ ] **TASK-10**: Configuração de ambiente e testes E2E para fluxo de Auth e Users [🟡 `priority: p2-media`]
  - [ ] **TASK-11**: Testes E2E para feed de postagens e comentários [🟡 `priority: p2-media`]
- [ ] **Segurança JWT**:
  - [ ] **TASK-12**: Implementar serviço `TokenBlacklistService` para revogação no logout [🔴 `priority: p1-alta`]
  - [ ] **TASK-13**: Integrar checagem de blacklist no `JwtAuthGuard` e no endpoint de logout [🔴 `priority: p1-alta`]

---

### 📍 Fase 5: Observabilidade, CI/CD e Infraestrutura de Produção
**Objetivo**: Automação contínua e prontidão operacional com monitoramento de saúde da API.

- [ ] **TASK-14**: Pipeline de CI no GitHub Actions (`.github/workflows/ci.yml`) para rodar lint, build e testes como status check obrigatório em Pull Requests (sem auto-merge nem auto-deploy na `main`) [🔴 `priority: p1-alta`]
- [ ] **TASK-15**: Interceptor global de logging estruturado e Global Exception Filter padronizado [🟡 `priority: p2-media`]
- [ ] **TASK-16**: Endpoint robusto de monitoramento e healthcheck com `@nestjs/terminus` (`GET /health`) [🟡 `priority: p2-media`]

---

### 📦 Backlog Futuro (Pós-Fase 5)
- [ ] **Módulo Minecraft & Cobblemon**:
  - Arquitetura de webhook / M2M entre o servidor Cobblemon e o backend Ohara.
  - Vínculo seguro de contas Minecraft com verificação in-game.
  - Registro e vitrine de Pokémons capturados.

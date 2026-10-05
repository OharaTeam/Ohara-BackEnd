# ROADMAP.md - Planejamento de Fases e Marcos

## 🗺️ Visão dos Marcos (Milestones)

```
[Fase 1: Swagger & Estabilização] 
       │
       ▼
[Fase 2: Colaboração, Onboarding & Automação de Roadmap no GitHub]
       │
       ▼
[Fase 3: Implementação dos Módulos do Schema (Comentários, Eventos, Minecraft)]
       │
       ▼
[Fase 4: Testes Automatizados & Blindagem de Segurança]
       │
       ▼
[Fase 5: Observabilidade, CI/CD & Infraestrutura]
```

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

### 📍 Fase 2: Padronização Colaborativa, Onboarding & Automação no GitHub (Concluída ✅)
**Objetivo**: Alinhar o repositório para colaboração em equipe, documentar ambiente de setup, padronizar contribuição e quebrar o roadmap em micro-tasks automatizáveis como GitHub Issues e GitHub Projects.

- [x] **Onboarding & Setup de Desenvolvimento**:
  - [x] Criação de `.env.example` exaustivo com descrição de cada variável (Discord, JWT, DB, Steam, Evolution API, Ports).
  - [x] Documentação de setup local no `README.md` (rodar com Docker, migrações Prisma, Bun).
- [x] **Governança do Repositório & Guias de Contribuição**:
  - [x] `CONTRIBUTING.md` com fluxo de trabalho (Git Flow / branches `feat/`, `fix/`), Conventional Commits e checklist de PR.
  - [x] `.github/pull_request_template.md` com checklist de qualidade (testes, docs, breaking changes).
  - [x] `.github/ISSUE_TEMPLATE/` (templates estruturados para Bug Report, Feature Request e Task).
- [x] **Decomposição do Roadmap em Issues do GitHub**:
  - [x] Especificação detalhada de 9 micro-tasks das Fases 3, 4 e 5 em `.planning/github-issues/`.
  - [x] Formato padronizado de issues (Título, Contexto, Arquivos Afetados, DoD, Labels, Milestone).
  - [x] Script de automação `scripts/create-github-issues.sh` para sincronizar e criar as issues no GitHub via GitHub CLI (`gh`).

---

### 📍 Fase 3: Implementação dos Módulos Faltantes do Schema (Foco Atual 🚀)
**Objetivo**: Desenvolver os domínios mapeados no `prisma/schema.prisma` que ainda não possuem endpoints REST implementados.

- [ ] **Módulo de Comentários** (`src/comentarios` ou sub-módulo de `postagens`):
  - Modelagem de DTOs (`CreateCommentDto`, `CommentResponseDto`).
  - Criação de comentário vinculado a post e autor (`POST /postagens/:id/comentarios`).
  - Listagem paginada de comentários com autor (`GET /postagens/:id/comentarios`).
  - Exclusão de comentário com guard de permissão (autor ou admin).
- [ ] **Módulo de Eventos Ohara** (`src/eventos`):
  - Modelagem de DTOs (`CreateEventoDto`, `UpdateEventoDto`).
  - CRUD completo de `OharaEventos`.
  - Associação de eventos a postagens no feed.
- [ ] **Módulo Minecraft & Cobblemon** (`src/minecraft`):
  - Vínculo de conta Minecraft (`ContaMinecraft`) ao perfil do Membro Ohara.
  - Registro de capturas e consulta de histórico (`PokemonsCapturados`).

---

### 📍 Fase 4: Qualidade, Testes Automatizados & Blindagem de Segurança
**Objetivo**: Blindar a integridade da API com suíte de testes e mitigar riscos de segurança.

- [ ] Testes Unitários com Jest:
  - `AuthService` e estratégias de Guard (`BotKeyGuard`, `SiteKeyGuard`, `JwtAuthGuard`).
  - `MembrosService` (regras de sincronização e transações Prisma).
  - `CargosService` (lógica de ordenação e permissões Discord).
  - `UsersService` (fallback de perfil e chamadas Steam).
  - `PostagensService` (regras de autor, upload e paginação).
- [ ] Testes End-to-End (E2E) com Supertest para os fluxos principais de API.
- [ ] Estratégia de revogação/invalidação de tokens JWT (Blacklist em memória ou Redis).

---

### 📍 Fase 5: Observabilidade, CI/CD e Infraestrutura de Produção
**Objetivo**: Automação contínua e prontidão para operação em alta disponibilidade.

- [ ] Pipeline CI no GitHub Actions (`.github/workflows/ci.yml`) rodando `lint`, `format:check`, `build` e `test` em todo Pull Request.
- [ ] Interceptor global de tratamento de erros e logging padronizado.
- [ ] Healthcheck endpoint com `@nestjs/terminus` (`GET /health`).
- [ ] Otimização do `Dockerfile` multi-stage e integração com o workflow de deploy VPS já existente.

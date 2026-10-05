# REQUIREMENTS.md - Requisitos do Projeto OharaBack-End

## 📋 Matriz de Requisitos

| ID | Módulo / Domínio | Descrição | Status | Fase |
|---|---|---|---|---|
| **REQ-AUTH-01** | Auth | Autenticação via Discord OAuth2 com validação de `state` | ✅ Concluído | Fase 1 |
| **REQ-AUTH-02** | Auth | Troca atômica de código temporário por JWT permanente (`/auth/exchange`) | ✅ Concluído | Fase 1 |
| **REQ-AUTH-03** | Auth | Proteção de endpoints de máquina (M2M) via `BotKeyGuard` (`X-API-KEY`) e `SiteKeyGuard` (`X-SITE-KEY`) | ✅ Concluído | Fase 1 |
| **REQ-MEMB-01** | Membros | Sincronização em lote de membros e seus cargos recebidos do bot | ✅ Concluído | Fase 1 |
| **REQ-MEMB-02** | Membros | Consulta paginada e busca por nome/apelido de membros | ✅ Concluído | Fase 1 |
| **REQ-CARG-01** | Cargos | Sincronização de cargos do Discord e permissões no PostgreSQL | ✅ Concluído | Fase 1 |
| **REQ-USER-01** | Usuários | Consulta e atualização do perfil próprio (`/users/me`) | ✅ Concluído | Fase 1 |
| **REQ-USER-02** | Usuários | Consulta de perfil público por Discord ID com cargos e vínculos | ✅ Concluído | Fase 1 |
| **REQ-USER-03** | Integração Steam | Vínculo de conta Steam, busca de resumo, lista de jogos e vitrine personalizada | ✅ Concluído | Fase 1 |
| **REQ-POST-01** | Postagens | Criação de posts autenticados com rich-text e mídias | ✅ Concluído | Fase 1 |
| **REQ-POST-02** | Postagens | Feed paginado e busca de post por ID | ✅ Concluído | Fase 1 |
| **REQ-POST-03** | Uploads | Upload de até 5 imagens locais por requisição com URL pública gerada | ✅ Concluído | Fase 1 |
| **REQ-DOCS-01** | Documentação | Swagger / OpenAPI completo com DTOs, schemas de resposta e autenticação documentada | ✅ Concluído | Fase 1 |
| **REQ-TEAM-01** | Colaboração | Criação de `.env.example` documentado e guia de setup local no `README.md` | ✅ Concluído | Fase 2 |
| **REQ-TEAM-02** | Governança | Criação de `CONTRIBUTING.md` e convenções de Git Flow / Conventional Commits | ✅ Concluído | Fase 2 |
| **REQ-TEAM-03** | GitHub Templates | Templates de PR e Issues estruturados em `.github/` para bugs, features e tasks | ✅ Concluído | Fase 2 |
| **REQ-TEAM-04** | Automação Roadmap | Decomposição das fases seguintes em micro-tasks e script/templates prontos para GitHub Issues | ✅ Concluído | Fase 2 |
| **REQ-POST-04** | Comentários | Criação, listagem e remoção de comentários em posts (`Comment` model) | 🟡 Parcial (Schema pronto) | Fase 3 |
| **REQ-EVNT-01** | Eventos | CRUD de Eventos Ohara (`OharaEventos` no schema) e vinculação a posts | 🟡 Parcial (Schema pronto) | Fase 3 |
| **REQ-MC-01** | Minecraft / Cobblemon | Endpoints para vincular `ContaMinecraft` ao Membro e consultar `PokemonsCapturados` | 🟡 Parcial (Schema pronto) | Fase 3 |
| **REQ-TEST-01** | Testes | Cobertura de testes unitários dos Services e Guards | ⏳ Pendente | Fase 4 |
| **REQ-TEST-02** | Testes | Testes E2E dos fluxos de Auth, Sync de Membros/Cargos e Postagens | ⏳ Pendente | Fase 4 |
| **REQ-AUTH-04** | Segurança | Invalidação/Revogação de token no logout (Blacklist de tokens JWT) | ⏳ Pendente | Fase 4 |
| **REQ-OPS-01** | CI/CD | Pipeline do GitHub Actions para validação de PRs (`lint`, `test`, `build`) | ⏳ Pendente | Fase 5 |
| **REQ-OPS-02** | Observabilidade | Interceptor global de erros e endpoint de healthcheck | ⏳ Pendente | Fase 5 |

---

## 🎯 Requisitos Não Funcionais (NFRs)

1. **Facilidade de Onboarding**: Qualquer novo desenvolvedor deve ser capaz de clonar o repositório, configurar o ambiente via `.env.example`, subir o banco e rodar a API em menos de 10 minutos.
2. **Rastreabilidade de Tasks**: Todo PR no repositório deve estar vinculado a uma issue do GitHub correspondente a um item do roadmap.
3. **Consistência de API**: Todos os endpoints devem possuir documentação OpenAPI com contratos de requisição e resposta precisos.

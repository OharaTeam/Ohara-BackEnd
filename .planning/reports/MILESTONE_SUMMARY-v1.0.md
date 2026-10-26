# Milestone v1.0 — Resumo do Projeto e Consolidação

**Gerado em:** 25 de Outubro de 2026  
**Finalidade:** Onboarding de equipe, alinhamento técnico e revisão de governança / segurança  
**Status do Marco:** Milestone 1 — Fases 1, 2 e 3 Concluídas (Pronto para Fase 4: Blindagem e Testes)

---

## 1. Visão Geral do Projeto (Project Overview)

O **OharaBack-End** é a API REST central do ecossistema da comunidade **Ohara**, atuando como núcleo transacional de dados e regras de negócio. O backend unifica a comunicação entre três pontas fundamentais:
1. **Bot do Discord**: Sincronização automatizada de membros, hierarquia de cargos, permissões e status.
2. **Dashboard / Web Frontend (Next.js / React)**: Interface web para membros explorarem perfis públicos, personalizarem biografia e vitrine da Steam, interagirem com o feed da comunidade e acompanharem eventos.
3. **Servidor Minecraft (Cobblemon)**: Ecossistema de jogos com captura de Pokémons e contas vinculadas (planejado em detalhe no backlog futuro).

### Proposta de Valor e Atores
- **Membro / Usuário Comum**: Autentica-se de forma segura via Discord OAuth2, mantém seu perfil no site e consome/cria postagens e comentários no feed comunitário.
- **Bot do Discord (M2M)**: Consome rotas protegidas por chave de API (`BOT_KEY` via `X-API-KEY`) para sincronização em lote.
- **Administrador (`Dev`)**: Usuários com o cargo estrito **`Dev`** possuem poderes administrativos globais para moderar, editar ou excluir quaisquer eventos, postagens e comentários, independentemente da autoria original.

### Estado Atual das Fases
- ✅ **Fase 1: Swagger & Estabilização da API** — Concluída
- ✅ **Fase 2: Padronização Colaborativa, Onboarding & Automação no GitHub** — Concluída
- ✅ **Fase 3: Módulos do Schema (Comentários e Eventos)** — Concluída e mergeada via PRs #20, #22, #23, #25, #26 e #27
- ⏳ **Fase 4: Testes Automatizados & Blindagem de Segurança** — Próxima fase
- ⏳ **Fase 5: Observabilidade, CI/CD e Infraestrutura de Produção** — Planejada

---

## 2. Decisões de Arquitetura e Engenharia (Architecture & Technical Decisions)

Durante o desenvolvimento das Fases 1, 2 e 3, foram estabelecidas as seguintes decisões e padrões fundamentais:

- **Decisão: Permissões Administrativas Estritas (RBAC Dev-Only)**
  - **O que foi escolhido:** O **único** cargo com privilégios administrativos no sistema é o cargo **`Dev`**. Cargos como Moderador ou Staff do Discord não herdam privilégios destrutivos na API a menos que possuam explicitamente a role `'Dev'`.
  - **Por quê:** Simplificação de governança e mitigação de escalada indevida de privilégios.
  - **Fase:** Fase 3 (Plano 03-02 e Revisão da Issue #12).

- **Decisão: Paginação Estrita e Contagem Agregada em Comentários**
  - **O que foi escolhido:** No endpoint `GET /postagens/:id/comentarios`, o limite máximo é travado em 5 comentários (`Math.min(limit, 5)`). No detalhe do post (`getPost`), a lista de comentários foi substituída por `_count: { select: { comentarios: true } }`.
  - **Por quê:** Prevenção de gargalos de rede (N+1 queries) e payloads desmedidos que degradavam a renderização inicial no frontend.
  - **Fase:** Fase 3 (Plano 03-01 / Issue #11).

- **Decisão: Sincronização Atômica entre Eventos e Feed de Postagens**
  - **O que foi escolhido:** Todo evento criado via `POST /eventos` gera automaticamente um registro na tabela `OharaEventos` e um `Post` correspondente na tabela `Posts` via `$transaction` do Prisma. Atualizações em `PATCH /eventos/:id` sincronizam título, descrição e mídias no post correspondente.
  - **Por quê:** Garantir integridade referencial e visibilidade imediata de anúncios de eventos no feed social sem necessidade de workers assíncronos extras.
  - **Fase:** Fase 3 (Plano 03-02 / Issue #13).

- **Decisão: Autenticação Híbrida (OAuth2 State + JWT + Chaves M2M)**
  - **O que foi escolhido:** Login via Discord OAuth2 com cookie HTTP-Only para verificação de CSRF `state`. Troca de código de curta duração (1m) por token JWT permanente via `POST /auth/exchange`. Proteção M2M via `BotKeyGuard` (`X-API-KEY`).
  - **Por quê:** Desacoplar o callback do navegador do armazenamento final de credenciais no frontend e resguardar rotas de sincronização de bots.
  - **Fase:** Fase 1 e Fase 2.

---

## 3. Fases Entregues (Phases Delivered)

| Fase | Nome | Status | Resumo de Entrega |
|---|---|---|---|
| **01** | Swagger & Estabilização | Concluída ✅ | OpenAPI/Swagger padronizado em `/api-docs`, decorators em todos os controllers, validação com `ValidationPipe` global. |
| **02** | Padronização Colaborativa & GitHub | Concluída ✅ | `.env.example`, `CONTRIBUTING.md`, templates de PR e Issues, quebra do roadmap em 16 micro-tasks no GitHub Projects #1. |
| **03** | Módulos do Schema (Comentários e Eventos) | Concluída ✅ | Implementação completa de Comentários (`POST`, `GET` paginado, `DELETE`) e Eventos (`POST`, `GET` agenda, `GET/:id`, `PATCH/:id`, `DELETE/:id`), enriquecimento de filtros no feed e RBAC Dev. |
| **04** | Testes Automatizados & Blindagem de Segurança | Pendente ⏳ | Suíte de testes unitários para Services/Guards, testes E2E, blacklist de JWTs e saneamento de vulnerabilidades. |
| **05** | Observabilidade & CI/CD | Pendente ⏳ | Pipeline GitHub Actions sem auto-deploy na `main`, interceptor de logs e `@nestjs/terminus`. |

---

## 4. Cobertura de Requisitos (Requirements Coverage)

Conforme mapeado em `.planning/REQUIREMENTS.md`:

- ✅ **REQ-AUTH-01**: Autenticação via Discord OAuth2 com validação de `state` (Concluído)
- ✅ **REQ-AUTH-02**: Troca atômica de código temporário por JWT permanente (`/auth/exchange`) (Concluído)
- ✅ **REQ-AUTH-03**: Proteção de endpoints de máquina (M2M) via `BotKeyGuard` (`X-API-KEY`) (Concluído)
- ✅ **REQ-MEMB-01**: Sincronização em lote de membros e seus cargos recebidos do bot (Concluído)
- ✅ **REQ-MEMB-02**: Consulta paginada e busca por nome/apelido de membros (Concluído)
- ✅ **REQ-CARG-01**: Sincronização de cargos do Discord e permissões no PostgreSQL (Concluído)
- ✅ **REQ-USER-01**: Consulta e atualização do perfil próprio (`/users/me`) (Concluído)
- ✅ **REQ-USER-02**: Consulta de perfil público por Discord ID com cargos e vínculos (Concluído)
- ✅ **REQ-USER-03**: Vínculo de conta Steam, busca de resumo, lista de jogos e vitrine personalizada (Concluído)
- ✅ **REQ-POST-01**: Criação de posts autenticados com rich-text e mídias (Concluído)
- ✅ **REQ-POST-02**: Feed paginado e busca de post por ID com filtros de evento (Concluído)
- ✅ **REQ-POST-03**: Upload de até 5 imagens locais por requisição com URL pública gerada (Concluído)
- ✅ **REQ-DOCS-01**: Swagger / OpenAPI completo com DTOs e esquemas tipados (Concluído)
- ✅ **REQ-TEAM-01**: `.env.example` documentado e guia de setup no `README.md` (Concluído)
- ✅ **REQ-TEAM-02**: `CONTRIBUTING.md` e convenções de Git Flow / Conventional Commits (Concluído)
- ✅ **REQ-TEAM-03**: Templates de PR e Issues estruturados em `.github/` (Concluído)
- ✅ **REQ-TEAM-04**: Decomposição das fases em micro-tarefas no GitHub Issues e Projects (Concluído)
- ✅ **REQ-POST-04**: Criação, listagem e remoção de comentários em posts (`Comment` model) (Concluído na Fase 3 via PRs #20, #25, #27)
- ✅ **REQ-EVNT-01**: CRUD de Eventos Ohara (`OharaEventos`) e sincronização no feed (Concluído na Fase 3 via PRs #22, #23, #26)
- ⚠️ **REQ-MC-01**: Integração Minecraft & Cobblemon (`ContaMinecraft` e `PokemonsCapturados`) — *Movido para Backlog Futuro devido a dependências M2M in-game.*
- ⏳ **REQ-TEST-01**: Cobertura de testes unitários dos Services e Guards (Fase 4)
- ⏳ **REQ-TEST-02**: Testes E2E dos fluxos de Auth, Sync de Membros/Cargos e Postagens (Fase 4)
- ⏳ **REQ-AUTH-04**: Invalidação/Revogação de token no logout com blacklist (Fase 4)
- ⏳ **REQ-OPS-01**: Pipeline do GitHub Actions para validação de PRs (Fase 5)
- ⏳ **REQ-OPS-02**: Interceptor global de erros e endpoint de healthcheck (Fase 5)

---

## 5. Registro de Decisões Chave (Key Decisions Log)

- **DEC-01 (Fase 1)**: Uso de Swagger centralizado com autenticação mista (Bearer + API Keys) para que o time de frontend consuma a documentação diretamente no navegador.
- **DEC-02 (Fase 2)**: Proibição estrita de auto-merge na branch `main`. Todo código precisa vir de uma branch limpa (sem acentos/caracteres especiais) via Pull Request com revisão manual.
- **DEC-03 (Fase 3 - TASK-01 / PR #20)**: Comentários são vinculados a postagens com validação de tamanho de conteúdo (mínimo 1, máximo 1000 caracteres) e limite de até 10 mídias opcionais.
- **DEC-04 (Fase 3 - TASK-02 / PR #25)**: Endpoints de listagem pública de comentários não exigem autenticação para permitir visualização por visitantes no site.
- **DEC-05 (Fase 3 - TASK-05 / PR #26)**: Operações destrutivas ou de edição em eventos exigem verificação `authorId === user.discordId || isDevUser(user)`.
- **DEC-06 (Fase 3 - TASK-03 / PR #27 / Code Review)**: Correção da checagem de case-sensitivity no RBAC de exclusão de comentários e rejeição imediata de IDs malformados via `ParseUUIDPipe`.

---

## 6. Dívidas Técnicas & Oportunidades de Melhoria (Tech Debt & Security Findings)

Durante a conclusão da Fase 3 e a inspeção completa do código, foram detectadas dívidas técnicas e lacunas de segurança prioritárias para a Fase 4:

1. **Insegurança no `POST /postagens/create` (Impersonação / IDOR)**:
   - O controlador aceita `discordId` diretamente no body (`CreatePostDto`). Qualquer usuário autenticado com um token JWT válido pode publicar em nome de outro membro enviando o `discordId` da vítima.
   - *Correção necessária:* Obter o autor diretamente do token autenticado (`req.user.discordId`).
2. **Configuração de Rate Limiting (`@nestjs/throttler`)**:
   - No `AppModule`, está configurado `{ ttl: 60, limit: 12 }`. No `@nestjs/throttler` v6, `ttl` é interpretado em milissegundos (60ms), tornando o rate limit inoperante na prática.
   - *Correção necessária:* Atualizar para `{ ttl: 60000, limit: 12 }` (ou usar helper de segundos).
3. **Upload de Arquivos Sem Validação de Tipo e Tamanho (Multer)**:
   - Em `POST /postagens/upload`, não há filtro de extensão/MIME type (`fileFilter`) nem limite de bytes (`limits.fileSize`). O diretório é servido estaticamente pelo NestJS (`/uploads`), abrindo brecha para upload de arquivos arbitrários (XSS armazenado via SVG/HTML ou esgotamento de disco).
   - *Correção necessária:* Validar MIME types permitidos (`image/png`, `image/jpeg`, `image/webp`), limitar tamanho (ex: 5MB) e planejar migração para Object Storage (S3 / R2).
4. **Ausência de Blacklist de JWT no Logout (`POST /auth/logout`)**:
   - Os tokens JWT têm expiração de 7 dias e o logout não invalida o token no servidor, deixando-o utilizável se for capturado.
   - *Correção necessária:* Implementação da `TokenBlacklistService` (TASK-12 / TASK-13 da Fase 4).
5. **Vazamento de Dados em Logs**:
   - Em `AuthService.login` e `JwtStrategy.validate`, payloads completos de usuários e tokens são impressos no console via `this.logger.log()`, podendo expor emails e dados sensíveis em logs de produção.
   - *Correção necessária:* Sanitizar logs removendo PII e dados de credenciais.
6. **Inconsistência de Chaves Estrangeiras no Schema Prisma**:
   - Algumas tabelas referenciam `User.discordId` (snowflake do Discord: `Post`, `Comment`, `OharaEventos`), enquanto outras referenciam `User.id` (UUID interno: `Profile`, `Connection`, `ContaMinecraft`). Isso exige constantes conversões e consultas intermediárias nos controllers e services.

---

## 7. Como Começar (Getting Started)

### Pré-requisitos
- **Runtime**: Bun (v1.2+) ou Node.js (v22+)
- **Banco de Dados**: Docker e Docker Compose (PostgreSQL)

### Execução Local
```bash
# 1. Clonar e instalar dependências
git clone https://github.com/OharaTeam/Ohara-BackEnd.git
cd OharaBack-End--NestJS-
bun install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Preencher DISCORD_*, JWT_SECRET, DATABASE_URL e BOT_KEY

# 3. Subir o PostgreSQL via Docker
docker compose up -d

# 4. Executar migrações do banco e gerar Prisma Client
bunx prisma migrate dev
bunx prisma generate

# 5. Iniciar em modo de desenvolvimento
bun run start:dev
```

### Documentação Swagger
- URL local: `http://localhost:3000/api-docs`

### Execução de Testes
```bash
# Executar testes unitários com Jest
bun run test

# Executar testes de um módulo específico
bun test src/postagens/
bun test src/eventos/
```

---

## Estatísticas do Projeto (Stats)

- **Linha do Tempo do Marco**: 13/12/2025 → 25/10/2026
- **Fases Concluídas**: 3 de 5 fases (60% do roadmap original)
- **Total de Commits**: 100 commits
- **Arquivos Alterados**: 141 arquivos (+11.495 inserções / -16.119 deleções)
- **Contribuidores**: Jean Caetano, pedrohenriquemoraes
- **Taxa de Sucesso dos Testes das Novas Funcionalidades**: 100% (35 testes em postagens/comentários e 38 testes em eventos passando).

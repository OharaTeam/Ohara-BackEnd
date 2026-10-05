# PROJECT.md - OharaBack-End (NestJS)

## 📌 Visão Geral do Projeto

O **OharaBack-End** é a API REST central do ecossistema **Ohara**, atuando como o núcleo de processamento e persistência de dados. O backend conecta e orquestra a comunicação entre três principais interfaces e serviços:
1. **Bot do Discord**: Sincronização em tempo real de membros, cargos, permissões e eventos da comunidade.
2. **Dashboard / Web Frontend** (Next.js / React): Interface web onde os membros visualizam perfis, customizam suas contas, interagem com o feed de postagens e conectam serviços externos (Steam, etc.).
3. **Servidor Minecraft (Cobblemon)**: Registro de contas de jogadores, captura de pokémons e eventos dentro do jogo.

---

## 🛠️ Stack Tecnológica

| Componente | Tecnologia | Versão / Detalhes |
|---|---|---|
| **Framework** | NestJS | ^11.0.1 |
| **Linguagem** | TypeScript | ^5.7.3 |
| **ORM** | Prisma | ^7.1.0 |
| **Banco de Dados** | PostgreSQL | Gerenciado via Docker / pg adapter |
| **Runtime & Scripts** | Bun / Node.js | v22 / Bun |
| **Autenticação** | Passport.js | Discord OAuth2, JWT, API Keys (`X-API-KEY`, `X-SITE-KEY`) |
| **Validação** | Class-Validator & Class-Transformer | ValidationPipe global com whitelist |
| **Segurança** | Helmet & Throttler | `@nestjs/throttler` (rate limit) e `helmet` |
| **Documentação** | Swagger / OpenAPI | `@nestjs/swagger` em `/api-docs` |
| **Uploads** | Multer & ServeStatic | Upload local em `/uploads/images` servido estaticamente |

---

## 🏛️ Arquitetura e Módulos Existentes

- [`src/auth`](file:///home/caetano/OharaBack-End--NestJS-/src/auth):
  - Autenticação OAuth2 via Discord (`/auth/discord`, `/auth/discord/callback`).
  - Geração de código temporário e troca segura por token JWT (`/auth/exchange`).
  - Proteção de rotas internas via `BotKeyGuard` (`X-API-KEY`) e `SiteKeyGuard` (`X-SITE-KEY`).
  - Estratégias JWT para usuários autenticados (`JwtAuthGuard`).

- [`src/membros`](file:///home/caetano/OharaBack-End--NestJS-/src/membros):
  - Sincronização em lote de membros vindos do Discord Bot (`POST /membros`).
  - Consulta paginada de membros (`GET /membros?page=1&limit=10`).
  - Busca de membro por username, apelido ou globalName (`GET /membros/search?name=`).

- [`src/cargos`](file:///home/caetano/OharaBack-End--NestJS-/src/cargos):
  - Sincronização de cargos do Discord (`POST /cargos`) com tratamento de BigInt/permissões e posições.

- [`src/users`](file:///home/caetano/OharaBack-End--NestJS-/src/users):
  - Perfil do usuário autenticado (`GET /users/me`, `PATCH /users/me`).
  - Perfil público via Discord ID (`GET /users/:discordId`).
  - Integração com Steam: vínculo de URL, resumo (`/steam/summary`), lista de jogos (`/steam/games`) e vitrine (`PATCH /me/steam/showcase`).

- [`src/postagens`](file:///home/caetano/OharaBack-End--NestJS-/src/postagens):
  - Criação de posts da comunidade (`POST /postagens/create`).
  - Feed paginado e consulta por ID (`GET /postagens`, `GET /postagens/:id`).
  - Upload de imagens para posts (`POST /postagens/upload`).

- [`prisma/schema.prisma`](file:///home/caetano/OharaBack-End--NestJS-/prisma/schema.prisma):
  - Modelos estruturados: `User` (Membros), `Role` (Cargos), `Profile` (Perfis), `Connection` (Conexoes), `OharaEventos`, `PokemonsCapturados`, `ContaMinecraft`, `Post`, `Comment`.

---

## 🎯 Atores do Sistema

1. **Discord Bot (M2M)**: Consome rotas autenticadas por `X-API-KEY` para sincronizar membros e cargos periodicamente.
2. **Frontend Web (Client / Dashboard)**: Consome rotas protegidas por JWT ou `X-SITE-KEY`, permitindo que os membros gerenciem seus perfis e visualizem o feed.
3. **Usuário Comum**: Autentica via Discord OAuth2, personaliza bio/links/vitrine Steam e publica no feed.
4. **Administrador**: Gerencia eventos e configurações globais.

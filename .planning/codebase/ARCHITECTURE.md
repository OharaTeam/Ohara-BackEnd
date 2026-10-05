# Arquitetura & Design do Sistema

## Estilo Arquitetural
O OharaBack-End foi projetado como um **Modular Monolith** utilizando NestJS. Ele segue padrões limpos orientados a serviços (service-oriented patterns), onde cada módulo de domínio encapsula seus próprios controllers, services, tarefas agendadas (scheduled tasks) e DTOs (Data Transfer Objects), enquanto compartilha o acesso ao banco de dados por meio de um módulo global (`PrismaModule`).

---

## Diagrama de Arquitetura de Alto Nível

```
                             +------------------------+
                             |   Discord Bot Engine   |
                             +------------------------+
                                        | (x-api-key)
                                        v
+----------------+          +-------------------------+          +--------------------+
|  Web Frontend  | <----->  |     NestJS REST API     | <----->  |     PostgreSQL     |
+----------------+          +-------------------------+          |   (via Prisma 7)   |
        |                               |                        +--------------------+
        | OAuth2 Flow                   | External APIs
        v                               v
+----------------+          +-------------------------+
|  Discord Auth  |          | Steam API / Evolution   |
+----------------+          +-------------------------+
```

---

## Limites de Módulos & Responsabilidades

### 1. `AppModule` (Root Module)
- Orquestrador central da aplicação.
- Configura provedores globais e imports:
  - **Rate Limiting:** `ThrottlerModule` (TTL: 60s, Limite: 12) registrado globalmente via `APP_GUARD`.
  - **Serviço de Arquivos Estáticos:** `ServeStaticModule` mapeando `/` para `./public` e `/uploads` para `./uploads`.
  - **Agendamento de Jobs:** `ScheduleModule` para tarefas em background baseadas em cron.
  - **Feature Modules:** `PrismaModule`, `AuthModule`, `MembrosModule`, `CargosModule`, `UsersModule`, `PostagensModule`.

### 2. `PrismaModule` (`@Global()`)
- Fornece a instância singleton de `PrismaService` durante todo o ciclo de vida da aplicação.
- Inicializa a conexão com o PostgreSQL usando pool de `@prisma/adapter-pg` no `onModuleInit` e encerra a conexão no `onModuleDestroy`.

### 3. `AuthModule`
- Implementa autenticação Discord OAuth2 e JWT.
- **Componentes:**
  - `AuthController`: Gerencia `/auth/discord`, `/auth/discord/callback`, `/auth/exchange` e `/auth/logout`.
  - `AuthService`: Valida o usuário do Discord no banco de dados, emite exchange tokens de curta duração e JWTs de longa duração.
  - `DiscordStrategy`: Passport strategy para Discord OAuth2.
  - `JwtStrategy`: Passport strategy que extrai o JWT do cookie `jwt` ou do header `Authorization: Bearer`.
  - `DiscordAuthGuard` & `JwtAuthGuard`: Proteção de rotas.

### 4. `MembrosModule`
- Gerencia a sincronização de membros do servidor Discord e listagens no diretório público.
- **Componentes:**
  - `MembrosController`: Endpoints para sincronização de membros (`POST /membros`), listagem paginada (`GET /membros`) e busca de membros (`GET /membros/search`).
  - `MembrosService`: Executa transações em batch de upsert no Prisma. Implementa ordenação customizada em dois níveis (membros com cargo 'Dev' primeiro, seguidos pela ordenação alfabética dos outros cargos).
  - `MembrosCronService`: Tarefa agendada (`0 2 * * 0` em produção, `*/15 * * * *` em dev) que chama a API do bot do Discord para sincronizar dados e notificar via WhatsApp.

### 5. `CargosModule`
- Gerencia os cargos (roles) do servidor Discord.
- **Componentes:**
  - `CargosController`: Endpoint de sincronização (`POST /cargos`) protegido por `BotKeyGuard`.
  - `CargosService`: Realiza transação em batch de upsert de cargos com permissões e posições.

### 6. `UsersModule`
- Gerencia perfis de usuários, bio customizada, conexões de redes sociais e integração de jogos da Steam.
- **Componentes:**
  - `UsersController`: Endpoints de perfil de usuário (`GET /users/me`, `PATCH /users/me`, `GET /users/:discordId`, endpoints de integração Steam).
  - `UsersService`: Atualiza detalhes de perfil, resolve Steam Vanity URLs para Steam IDs de 64 bits, consulta a Steam Web API para obter sumários e jogos possuídos, e salva o showcase de jogos favoritos.

### 7. `PostagensModule`
- Gerencia o feed da comunidade, postagens, upload de imagens e manutenção de assets órfãos.
- **Componentes:**
  - `PostagensController`: Endpoints para feed (`GET /postagens`), detalhes da postagem (`GET /postagens/:id`), criação de postagem (`POST /postagens/create`) e upload de imagens multipart (`POST /postagens/upload`).
  - `PostagensService`: Valida unicidade de título e restrições de mídia, formata feed com imagens de capa.
  - `CleanupService`: Cron diário agendado (`@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`) que inspeciona `/uploads/images` e remove arquivos não referenciados mais antigos que 24 horas usando pattern matching em SQL raw.

---

## Pipeline de Requisições & Camadas de Segurança

```
Requisição de Entrada (Incoming Request)
       │
       ▼
   [Helmet] ─── define headers seguros (crossOriginResourcePolicy: cross-origin)
       │
       ▼
 [CookieParser] ─── realiza parsing dos cookies (oauth_state, jwt)
       │
       ▼
     [CORS] ─── valida a origem (localhost, domínios vercel)
       │
       ▼
[ThrottlerGuard] ─── avalia rate limits (12 req / 60s, pode usar @SkipThrottle)
       │
       ▼
  [Route Guards]
  ├── BotKeyGuard ─── valida x-api-key contra BOT_KEY
  ├── DiscordAuthGuard ─── valida oauth_state e processa o callback do Discord
  └── JwtAuthGuard ─── valida Bearer token / cookie jwt via JwtStrategy
       │
       ▼
[ValidationPipe] ─── whitelist, transform, forbidNonWhitelisted
       │
       ▼
 [Controller] -> [Service] -> [PrismaService] -> [PostgreSQL]
```

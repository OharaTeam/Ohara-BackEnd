# Stack Tecnológico

## Visão Geral
O OharaBack-End é uma API REST construída com NestJS, TypeScript e Prisma ORM, atuando como o núcleo backend para o ecossistema Ohara (conectando bots do Discord, dashboard web da comunidade, dados de jogo do Minecraft e PostgreSQL).

## Linguagens & Runtimes
- **Linguagem:** TypeScript (`^5.7.3`)
- **Target ECMAScript:** ES2023 (`tsconfig.json`)
- **Module Resolution:** NodeNext (`module: "nodenext"`, `moduleResolution: "nodenext"`)
- **Runtimes:**
  - Node.js (v20+ / v22+)
  - Bun (utilizado em scripts para execução rápida via CLI, debugging de inspeção e runtime de produção: `bun dist/src/main.js`, `bunx prisma generate`)

## Framework & Bibliotecas Principais
- **Application Framework:** NestJS v11 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` `^11.0.1`)
- **Reactive Extensions:** RxJS (`^7.8.1`)
- **Metadata Reflection:** `reflect-metadata` (`^0.2.2`)

## Dados & Persistência
- **ORM:** Prisma v7 (`prisma`, `@prisma/client` `^7.1.0`)
- **Database Engine:** PostgreSQL
- **Database Driver / Adapter:** `@prisma/adapter-pg` (`^7.1.0`) combinado com `pg` (`Pool`)
- **Gerenciamento de Schema & Migrations:** Prisma CLI (`prisma/schema.prisma`, `prisma/migrations`)

## Autenticação & Segurança
- **Motor de Autenticação:** Passport.js (`passport` `^0.7.0`, `@nestjs/passport` `^11.0.5`)
- **Estratégia OAuth2:** `passport-discord` (`^0.1.4`, `@types/passport-discord` `^0.1.15`)
- **Manipulação de JWT:** `@nestjs/jwt` (`^11.0.2`), `passport-jwt` (`^4.0.1`, `@types/passport-jwt` `^4.0.1`)
- **HTTP Security Headers:** Helmet (`^8.1.0`)
- **Parsing de Cookies:** `cookie-parser` (`^1.4.7`, `@types/cookie-parser` `^1.4.10`)
- **Rate Limiting:** `@nestjs/throttler` (`^6.5.0`)
- **Guards de API Key:** Guard customizado baseado em header (`X-API-KEY` / `BOT_KEY`)

## Validação & Serialização
- **Validação de DTOs:** `class-validator` (`^0.14.3`)
- **Transformação de Objetos:** `class-transformer` (`^0.5.1`)
- **Mapped Types:** `@nestjs/mapped-types` (`*`)

## Upload de Arquivos & Assets Estáticos
- **Motor de Upload de Arquivos:** Multer via `@nestjs/platform-express` (`FilesInterceptor`, `diskStorage`)
- **Serviço de Assets Estáticos:** `@nestjs/serve-static` (`^5.0.4`) servindo `./public` e `./uploads`

## Agendamento de Tarefas & Cron
- **Task Scheduling:** `@nestjs/schedule` (`^6.1.3`)

## Documentação da API
- **OpenAPI / Swagger:** `@nestjs/swagger` (`^11.2.6`), `swagger-ui-express` (`^5.0.1`), `swagger-ui-dist` (`^5.31.0`)
- **Endpoint do Swagger:** `/api-docs`

## Tooling & Linting
- **Build Tool:** Nest CLI (`@nestjs/cli` `^11.0.0`)
- **Linter:** ESLint (`^9.18.0`) utilizando formato flat config (`eslint.config.mjs`) com `typescript-eslint` (`^8.20.0`)
- **Formatter:** Prettier (`^3.4.2`) com `eslint-plugin-prettier` (`^5.2.2`) e `eslint-config-prettier` (`^10.0.1`)
- **Test Runner:** Jest (`^30.0.0`) com `ts-jest` (`^29.2.5`) e `supertest` (`^7.0.0`)

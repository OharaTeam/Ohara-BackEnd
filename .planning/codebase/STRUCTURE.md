# Estrutura do Repositório

## Visão Geral
Este documento descreve a organização de arquivos e pastas da base de código do OharaBack-End NestJS.

---

## Árvore de Diretórios

```
OharaBack-End--NestJS-/
├── .planning/                  # Planejamento do GSD e mapeamento da codebase
│   └── codebase/               # Arquivos de documentação como fonte de verdade (ground truth)
├── prisma/                     # Definições do ORM e banco de dados
│   ├── migrations/             # Histórico de migrations do banco de dados
│   │   └── migration_lock.toml
│   └── schema.prisma           # Modelos de dados e schema relacional do Prisma
├── public/                     # Assets estáticos servidos a partir da raiz '/'
│   └── swagger/                # Assets customizados do Swagger UI (CSS, JS, favicon)
├── src/                        # Código-fonte principal da aplicação
│   ├── auth/                   # Módulo de autenticação (Discord OAuth2 & JWT)
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── bot-key.guard.ts
│   │   ├── discord-auth.guard.ts
│   │   ├── discord.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── jwt.strategy.ts
│   ├── cargos/                 # Módulo de gerenciamento de cargos do servidor
│   │   ├── dto/
│   │   │   └── create-cargo.dto.ts
│   │   ├── cargos.controller.ts
│   │   ├── cargos.module.ts
│   │   └── cargos.service.ts
│   ├── membros/                # Módulo de membros do Discord & diretório
│   │   ├── dto/
│   │   │   └── create-membro.dto.ts
│   │   ├── membro-cron.service.ts
│   │   ├── membros.controller.ts
│   │   ├── membros.module.ts
│   │   └── membros.service.ts
│   ├── postagens/              # Módulo do feed da comunidade & upload de arquivos
│   │   ├── dto/
│   │   │   └── create-post.dto.ts
│   │   ├── cleanup.service.ts
│   │   ├── postagens.controller.ts
│   │   ├── postagens.module.ts
│   │   └── postagens.service.ts
│   ├── prisma/                 # Módulo global de banco de dados
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── users/                  # Módulo de perfis de usuário e integração com Steam
│   │   ├── dto/
│   │   │   ├── add-steam-link.dto.ts
│   │   │   ├── update-profile.dto.ts
│   │   │   └── update-steam-showcase.dto.ts
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── app.controller.spec.ts  # Teste unitário do controller raiz
│   ├── app.controller.ts       # Controller raiz / healthcheck básico
│   ├── app.module.ts           # Configuração do módulo raiz
│   ├── app.service.ts          # Service raiz
│   └── main.ts                 # Ponto de entrada e bootstrap da aplicação
├── test/                       # Suíte de testes E2E
│   ├── app.e2e-spec.ts         # Teste E2E da raiz da aplicação
│   └── jest-e2e.json           # Configuração Jest para E2E
├── uploads/                    # Diretório local de armazenamento para uploads de usuários
│   └── images/                 # Imagens de postagens enviadas
├── .gitignore                  # Padrões de arquivos ignorados pelo Git
├── .prettierrc                 # Regras de formatação de código do Prettier
├── eslint.config.mjs           # Configuração flat do ESLint 9
├── nest-cli.json               # Configuração da CLI do NestJS
├── package.json                # Dependências do projeto e scripts npm/bun
├── README.md                   # Visão geral do projeto e link da documentação
└── tsconfig.json               # Configurações do compilador TypeScript
```

---

## Principais Pontos de Entrada e Arquivos Críticos

| Arquivo | Finalidade |
| :--- | :--- |
| `src/main.ts` | Inicializa (bootstrap) a aplicação NestJS; registra Swagger, Helmet, CookieParser, ValidationPipe, CORS e inicia o listener HTTP. |
| `src/app.module.ts` | Configura a injeção de dependência raiz, rate limiting (throttling), assets estáticos e tarefas agendadas (cron). |
| `src/prisma/prisma.service.ts` | Gerencia o ciclo de vida da conexão com o banco de dados PostgreSQL via `@prisma/adapter-pg`. |
| `prisma/schema.prisma` | Fonte única de verdade para todas as tabelas, colunas, índices e relacionamentos do banco de dados. |
| `eslint.config.mjs` | Configuração com verificação de tipos do ESLint, aplicando regras de qualidade de código. |
| `tsconfig.json` | Opções do compilador TypeScript (resolução NodeNext, strict null checks, suporte a decorators). |

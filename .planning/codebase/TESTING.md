# Padrões & Práticas de Testes

## Visão Geral
O OharaBack-End utiliza o **Jest** como seu principal test runner e framework de asserções, combinado com o **ts-jest** para compilação TypeScript e **Supertest** para testes end-to-end (E2E) via HTTP.

---

## Frameworks de Teste & Tooling
- **Test Runner:** Jest (`^30.0.0`)
- **TypeScript Preprocessor:** `ts-jest` (`^29.2.5`)
- **HTTP Assertions:** `supertest` (`^7.0.0`, `@types/supertest` `^6.0.2`)
- **Utilitários de Teste do Nest:** `@nestjs/testing` (`^11.0.1`)

---

## Organização & Configuração dos Testes

### Testes Unitários
- **Localização:** Co-localizados com os arquivos de código-fonte em `src/`, correspondendo ao padrão `*.spec.ts`.
- **Configuração (`package.json`):**
  - Diretório Raiz: `src`
  - Padrão (Pattern): `.*\\.spec\\.ts$`
  - Ambiente de Teste (Test Environment): `node`
  - Diretório de Cobertura (Coverage Directory): `../coverage`

### Testes End-to-End (E2E)
- **Localização:** Localizados no diretório `test/`, correspondendo ao padrão `*.e2e-spec.ts`.
- **Configuração (`test/jest-e2e.json`):**
  - Diretório Raiz: `.`
  - Padrão (Pattern): `.e2e-spec.ts$`
  - Ambiente de Teste (Test Environment): `node`

---

## Scripts de Execução de Testes

| Comando | Ação |
| :--- | :--- |
| `npm run test` (ou `bun run test`) | Executa todas as suítes de testes unitários uma vez |
| `npm run test:watch` | Inicia o Jest em modo interativo de monitoramento de arquivos (watch mode) |
| `npm run test:cov` | Gera relatório completo de cobertura de código em `coverage/` |
| `npm run test:e2e` | Executa testes end-to-end contra uma instância simulada do servidor |
| `npm run test:debug` | Executa testes com o inspetor aberto para debugging |

---

## Status Atual da Suíte de Testes

A base de código contém atualmente testes básicos iniciais (starter tests):
- `src/app.controller.spec.ts`: Valida que `AppController.getHello()` retorna `"Hello World!"`.
- `test/app.e2e-spec.ts`: Valida que `GET /` retorna status 200 com `"Hello World!"`.

### Lacunas de Cobertura de Testes (Coverage Gaps)
Os seguintes módulos de domínio não possuem atualmente testes unitários e de integração automatizados:
1. **`AuthModule`**: Verificação do cookie de state do OAuth2, validação de perfil do Discord, ciclo de vida do exchange code e extração de JWT.
2. **`MembrosModule`**: Transação de upsert do `syncMembers`, lógica de paginação em dois níveis para Devs no `findAll` e busca case-insensitive no `findOne`.
3. **`CargosModule`**: Lógica de upsert do `syncRoles`.
4. **`UsersModule`**: Resolução de URLs da Steam, tratamento de erros da Steam API, upsert de perfil e validação do showcase.
5. **`PostagensModule`**: Checagem de colisão de títulos na criação de posts, limites de quantidade de mídia, cálculos de skip/take na paginação e exclusão de arquivos órfãos no `CleanupService`.

---

## Diretrizes para Adição de Testes

1. **Testes Unitários de Services:**
   - Sempre utilize mocks para o `PrismaService` através de um objeto mock ou `jest.fn()` para evitar chamadas ao banco PostgreSQL real.
   - Faça mock das chamadas globais de `fetch` ao testar services que interagem com APIs externas (Steam, Discord, Evolution API).
2. **Testes de Integração / Controllers:**
   - Utilize o `TestingModule` do `@nestjs/testing` com `.overrideGuard()` para isolar guards de autenticação (`JwtAuthGuard`, `BotKeyGuard`).
   - Utilize o `ValidationPipe` nas instâncias de aplicação de teste para garantir que as restrições de DTO sejam verificadas.

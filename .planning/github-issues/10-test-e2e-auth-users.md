### 📌 Contexto e Justificativa
Testes End-to-End (E2E) com Supertest garantem que o ciclo de requisição completo (Middleware, Guards, Interceptors, Pipes, Controllers e Database) funcione harmonicamente para autenticação e perfis de usuário.

### 🎯 O que deve ser feito
1. Configurar setup base para testes E2E (`test/jest-e2e.json` e fixture com banco de dados).
2. Criar suíte de testes E2E para fluxo de Auth (`test/auth.e2e-spec.ts`):
   - `POST /auth/exchange` sem código (esperado 400).
   - `POST /auth/logout` com e sem token.
3. Criar suíte de testes E2E para fluxo de Usuários (`test/users.e2e-spec.ts`):
   - `GET /users/me` protegido por token.
   - `GET /users/:discordId` público.

### 📂 Arquivos Afetados
- `test/auth.e2e-spec.ts`
- `test/users.e2e-spec.ts`
- `test/jest-e2e.json`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Execução com sucesso via `npm run test:e2e` ou `bun run test:e2e`
- [ ] Validação de status codes 200, 400, 401 e 404
- [ ] Build do projeto passando (`bun run build`)

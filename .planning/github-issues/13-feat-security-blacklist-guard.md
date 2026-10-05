### 📌 Contexto e Justificativa
Com o `TokenBlacklistService` implementado, precisamos conectar a revogação ao endpoint `POST /auth/logout` e verificar a blacklist em todas as requisições protegidas pelo `JwtAuthGuard`.

### 🎯 O que deve ser feito
1. Atualizar `AuthController`:
   - No endpoint `POST /auth/logout`, extrair o Bearer token do header `Authorization`.
   - Calcular o tempo restante de vida do token (através da claim `exp` do JWT) e registrá-lo na blacklist via `TokenBlacklistService`.
   - Retornar status `204 No Content`.
2. Atualizar `JwtAuthGuard` (ou `JwtStrategy`):
   - Ao receber uma requisição autenticada, verificar se o token está registrado na blacklist.
   - Caso o token esteja na blacklist, rejeitar imediatamente com `401 Unauthorized` ('Token revogado/sessão finalizada').
3. Documentar os novos comportamentos no Swagger.

### 📂 Arquivos Afetados
- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/guards/jwt-auth.guard.ts` (ou `src/auth/jwt.strategy.ts`)

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Endpoint `POST /auth/logout` revoga o token com sucesso
- [ ] Requisições subsequentes com o mesmo token recebem 401 Unauthorized
- [ ] Documentação Swagger atualizada
- [ ] Build do projeto passando (`bun run build`)

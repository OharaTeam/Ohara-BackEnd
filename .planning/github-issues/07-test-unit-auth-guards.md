### 📌 Contexto e Justificativa
A camada de autenticação e proteção por Guards é crítica para a segurança da API. Precisamos de testes unitários isolados para garantir que tokens e chaves de bot/site sejam validados com precisão.

### 🎯 O que deve ser feito
1. Implementar testes unitários para `AuthService` (`src/auth/auth.service.spec.ts`):
   - Troca de código OAuth2 Discord por JWT (`exchangeCodeForToken`).
   - Geração de payload JWT correto (`sub`, `username`, `roles`).
   - Tratamento de falhas na API do Discord (rejeição com `UnauthorizedException`).
2. Implementar testes unitários para os Guards:
   - `JwtAuthGuard`: aceitação com token válido e rejeição com token inválido/ausente.
   - `BotKeyGuard`: validação de `X-API-KEY` contra a variável `BOT_KEY`.
   - `SiteKeyGuard`: validação do header correspondente para rotas de front-end.
3. Utilizar mocks para `JwtService`, `ConfigService` e `PrismaService`.

### 📂 Arquivos Afetados
- `src/auth/auth.service.spec.ts`
- `src/auth/guards/jwt-auth.guard.spec.ts`
- `src/auth/guards/bot-key.guard.spec.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] 100% dos testes unitários de Auth e Guards passando via `bun test` ou `npm test`
- [ ] Mocks devidamente isolados sem chamadas de rede externas
- [ ] Cenários de sucesso e falha cobertos
- [ ] Build do projeto passando (`bun run build`)

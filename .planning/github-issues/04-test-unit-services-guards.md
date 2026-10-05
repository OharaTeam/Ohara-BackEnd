---
title: "test(unit): implementar suíte de testes unitários para Services e Guards"
labels: ["task", "backend", "testing"]
milestone: "Fase 4: Testes & Segurança"
---

### 📌 Contexto e Justificativa
Garantir a confiabilidade das regras de negócio e mecanismos de proteção do sistema através de testes unitários automatizados com Jest.

### 🎯 O que deve ser feito
1. Configurar mocks padronizados para o `PrismaService`.
2. Implementar testes unitários para os serviços essenciais:
   * `AuthService`: Geração de códigos temporários, troca de código por JWT e validação de tokens.
   * `MembrosService`: Lógica de sincronização em lote (`upsert` com transação Prisma) e ordenação de membros (Devs no topo).
   * `CargosService`: Tratamento de BigInt em permissões e sincronização em lote.
   * `UsersService`: Resolução de vanity URLs da Steam e atualização de vitrine.
   * `PostagensService`: Validação de autor e paginação do feed.
3. Implementar testes unitários para os Guards:
   * `BotKeyGuard` (verificação correta de `process.env.BOT_KEY` no header `x-api-key`).
   * `JwtAuthGuard` (permissão para tokens válidos e rejeição de tokens expirados).

### 📂 Arquivos Afetados
* `src/auth/auth.service.spec.ts`
* `src/auth/bot-key.guard.spec.ts`
* `src/membros/membros.service.spec.ts`
* `src/cargos/cargos.service.spec.ts`
* `src/users/users.service.spec.ts`
* `src/postagens/postagens.service.spec.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Mínimo de 80% de cobertura nos serviços testados
- [ ] Todos os testes passando com `bun test` ou `npm run test`
- [ ] Testes isolados sem dependência de banco de dados real (100% mocked)

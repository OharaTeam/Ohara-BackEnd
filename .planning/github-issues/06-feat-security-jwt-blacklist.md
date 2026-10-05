---
title: "feat(security): implementar revogação e blacklist de tokens JWT no logout"
labels: ["task", "backend", "security"]
milestone: "Fase 4: Testes & Segurança"
---

### 📌 Contexto e Justificativa
Atualmente, a rota `POST /auth/logout` apenas responde com 204 No Content, deixando a responsabilidade de exclusão do token exclusivamente para o cliente. É necessário invalidar o token no lado do servidor para garantir segurança em caso de logout voluntário.

### 🎯 O que deve ser feito
1. Implementar um serviço de blacklist para tokens revogados com expiração correspondente ao TTL restante do JWT.
2. Atualizar a rota `POST /auth/logout` para extrair o token do cabeçalho de autorização e inseri-lo na blacklist.
3. Atualizar a validação em `JwtStrategy` para consultar a blacklist antes de autorizar requisições.

### 📂 Arquivos Afetados
* `src/auth/auth.service.ts`
* `src/auth/auth.controller.ts`
* `src/auth/jwt.strategy.ts`
* `src/auth/token-blacklist.service.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Token adicionado à blacklist no momento do logout
- [ ] Requisições com token revogado retornam 401 Unauthorized
- [ ] Limpeza automática de tokens expirados para economizar memória

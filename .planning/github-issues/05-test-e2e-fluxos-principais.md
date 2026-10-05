---
title: "test(e2e): criar testes de integração ponta a ponta para fluxos principais"
labels: ["task", "backend", "testing"]
milestone: "Fase 4: Testes & Segurança"
---

### 📌 Contexto e Justificativa
Testes End-to-End (E2E) validam a integração completa da aplicação NestJS, incluindo pipes globais, filtros, guards e respostas HTTP reais via Supertest.

### 🎯 O que deve ser feito
1. Configurar o ambiente de testes E2E (`test/jest-e2e.json`).
2. Criar suíte de testes E2E para os seguintes cenários:
   * **Fluxo de Auth**: Troca de código `/auth/exchange`, rejeição sem código e logout.
   * **Fluxo do Bot**: Chamada a `POST /membros` e `POST /cargos` com e sem `X-API-KEY`.
   * **Fluxo de Usuários**: `GET /users/me` autenticado e `GET /users/:discordId` público.
   * **Fluxo de Postagens**: Criação de post com payload válido, rejeição com dados inválidos (ValidationPipe) e consulta do feed.

### 📂 Arquivos Afetados
* `test/auth.e2e-spec.ts`
* `test/membros.e2e-spec.ts`
* `test/postagens.e2e-spec.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Execução com sucesso via `npm run test:e2e` ou `bun run test:e2e`
- [ ] Validação dos status HTTP 200, 201, 400, 401 e 404

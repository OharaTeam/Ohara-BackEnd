---
title: "feat(health): implementar endpoint robusto de monitoramento com @nestjs/terminus"
labels: ["task", "backend", "observability"]
milestone: "Fase 5: Observabilidade & CI/CD"
---

### 📌 Contexto e Justificativa
O endpoint atual em `AppController` apenas retorna uma string de texto. Para integração com monitoramento de containers e balanceadores de carga, é necessário checar o status real do PostgreSQL e uso de memória.

### 🎯 O que deve ser feito
1. Instalar `@nestjs/terminus`.
2. Criar `HealthModule` e `HealthController`.
3. Implementar verificadores de integridade:
   * Conexão ativa com o banco PostgreSQL via Prisma (`PrismaHealthIndicator`).
   * Limite de memória heap do processo (`MemoryHealthIndicator`).
4. Expor o endpoint `GET /health` devidamente documentado no Swagger.

### 📂 Arquivos Afetados
* `package.json`
* `src/health/health.module.ts`
* `src/health/health.controller.ts`
* `src/app.module.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Retorna status 200 quando o banco e serviços estão operacionais
- [ ] Retorna status 503 Service Unavailable se o banco falhar
- [ ] Documentado no Swagger com schema de resposta

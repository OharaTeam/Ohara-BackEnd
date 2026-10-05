### 📌 Contexto e Justificativa
O endpoint atual em `AppController` apenas retorna uma string de texto estática. Para monitoramento de containers e métricas operacionais, é necessário checar a conectividade com o PostgreSQL e uso de memória.

### 🎯 O que deve ser feito
1. Instalar `@nestjs/terminus`.
2. Criar `HealthModule` e `HealthController`.
3. Implementar verificadores de integridade:
   - Conexão ativa com o banco PostgreSQL via Prisma (`PrismaHealthIndicator`).
   - Limite de memória heap do processo (`MemoryHealthIndicator`).
4. Expor o endpoint `GET /health` devidamente documentado no Swagger.

### 📂 Arquivos Afetados
- `package.json`
- `src/health/health.module.ts`
- `src/health/health.controller.ts`
- `src/app.module.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Retorna status 200 com JSON descritivo quando o banco e serviços estão operacionais
- [ ] Documentação OpenAPI Swagger disponível em `/api-docs`
- [ ] Build do projeto passando (`bun run build`)

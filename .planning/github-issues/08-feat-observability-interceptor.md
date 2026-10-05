---
title: "feat(observability): implementar interceptor global de erros e logging estruturado"
labels: ["task", "backend", "observability"]
milestone: "Fase 5: Observabilidade & CI/CD"
---

### 📌 Contexto e Justificativa
Padronizar as respostas de erro de toda a API no formato amigável (seguindo padrões RFC 7807) e fornecer logs estruturados com tempo de execução das rotas para facilitar diagnósticos em produção.

### 🎯 O que deve ser feito
1. Criar um `AllExceptionsFilter` global para capturar exceções HTTP e exceções não tratadas do Prisma, retornando um payload consistente:
   ```json
   {
     "statusCode": 404,
     "timestamp": "2026-10-04T23:00:00.000Z",
     "path": "/users/123",
     "message": "Usuário não encontrado."
   }
   ```
2. Criar um `LoggingInterceptor` global que registre o método, URL, IP e tempo de resposta em milissegundos.
3. Registrar o filtro e o interceptor no `app.module.ts` via `APP_FILTER` e `APP_INTERCEPTOR`.

### 📂 Arquivos Afetados
* `src/common/filters/http-exception.filter.ts`
* `src/common/interceptors/logging.interceptor.ts`
* `src/app.module.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Erros inesperados não vazam stack traces internos para o cliente em ambiente de produção
- [ ] Logs informam tempo de execução de cada rota no console

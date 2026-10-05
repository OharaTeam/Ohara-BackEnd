### 📌 Contexto e Justificativa
Padronizar as respostas de erro de toda a API no formato amigável (seguindo padrões RFC 7807) e fornecer logs estruturados com tempo de execução das rotas para facilitar diagnósticos e auditoria.

### 🎯 O que deve ser feito
1. Criar um `AllExceptionsFilter` global para capturar exceções HTTP e exceções não tratadas do Prisma, retornando um payload consistente:
   ```json
   {
     "statusCode": 404,
     "timestamp": "2026-10-05T00:00:00.000Z",
     "path": "/users/123",
     "message": "Usuário não encontrado."
   }
   ```
2. Criar um `LoggingInterceptor` global que registre o método HTTP, rota (`url`), IP do requisitante e o tempo de resposta em milissegundos (`ms`).
3. Registrar o filtro e o interceptor no `app.module.ts` via `APP_FILTER` e `APP_INTERCEPTOR`.

### 📂 Arquivos Afetados
- `src/common/filters/http-exception.filter.ts`
- `src/common/interceptors/logging.interceptor.ts`
- `src/app.module.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Erros retornam JSON padronizado com `statusCode`, `timestamp`, `path` e `message`
- [ ] Logs no console registram tempo de resposta em ms
- [ ] Build do projeto passando (`bun run build`)

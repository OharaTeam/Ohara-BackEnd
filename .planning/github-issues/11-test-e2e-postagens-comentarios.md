### 📌 Contexto e Justificativa
O feed de postagens e comentários é a funcionalidade social central da comunidade. Um teste E2E garante que a jornada do usuário de publicar, listar e comentar funcione de ponta a ponta.

### 🎯 O que deve ser feito
1. Implementar suíte de testes E2E (`test/postagens.e2e-spec.ts`):
   - Criar postagem autenticada (`POST /postagens`).
   - Consultar feed paginado (`GET /postagens`).
   - Adicionar comentário na postagem (`POST /postagens/:id/comentarios`).
   - Listar comentários da postagem (`GET /postagens/:id/comentarios`).
   - Deletar o comentário com o autor (`DELETE /postagens/:id/comentarios/:commentId`).
2. Validar rejeição de criação com payload inválido via `ValidationPipe`.

### 📂 Arquivos Afetados
- `test/postagens.e2e-spec.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Fluxo completo de postagem e comentários testado e aprovado
- [ ] Validações de status HTTP 201, 200, 400, 401 e 404
- [ ] Execução com sucesso via `npm run test:e2e` ou `bun run test:e2e`

### 📌 Contexto e Justificativa
Com a criação de comentários em postagens, precisamos de uma rota para que o aplicativo web e mobile possa listar os comentários de uma postagem de forma paginada e performática.

### 🎯 O que deve ser feito
1. Criar `QueryCommentDto` com suporte a paginação:
   - `page`: número opcional (padrão: 1, mín: 1).
   - `limit`: número opcional (padrão: 10, máx: 50).
2. Criar `CommentResponseDto` com dados públicos do autor:
   - `id`, `content`, `media`, `createdAt`, `author`: `{ id, username, globalName, avatarUrl, roles }`.
3. Implementar endpoint `GET /postagens/:id/comentarios`:
   - Endpoint público (não exige autenticação obrigatória, mas pode ser acessado por qualquer visitante).
   - Retornar objeto paginado: `{ data: CommentResponseDto[], total: number, page: number, totalPages: number }`.
   - Ordenar comentários do mais antigo para o mais recente (ou mais recente primeiro com parâmetro de ordenação).
4. Adicionar documentação OpenAPI/Swagger completa:
   - `@ApiOperation({ summary: 'Listar comentários de uma postagem de forma paginada' })`
   - `@ApiResponse({ status: 200, description: 'Lista de comentários retornada com sucesso' })`
   - `@ApiResponse({ status: 404, description: 'Postagem não encontrada' })`

### 📂 Arquivos Afetados
- `src/postagens/postagens.controller.ts`
- `src/postagens/postagens.service.ts`
- `src/postagens/dto/query-comment.dto.ts`
- `src/postagens/dto/comment-response.dto.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Listagem paginada funcionando com query params `page` e `limit`
- [ ] Retorno com contagem total (`total`) e cálculo de páginas (`totalPages`)
- [ ] Dados públicos do autor populados sem vazamento de campos sensíveis
- [ ] Documentação Swagger visível em `/api-docs`
- [ ] Build do projeto passando (`bun run build`)

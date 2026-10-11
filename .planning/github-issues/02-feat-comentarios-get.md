### 📌 Contexto e Justificativa
Atualmente, `getPost` no `PostagensService` busca todos os comentários de uma só vez (`comentarios: true`) sem paginação e sem popular os dados públicos do autor (`globalName`, `avatarUrl`).
Para garantir escalabilidade e performance, precisamos:
1. Alinhar `getPost` para fornecer a contagem total de comentários (`_count.comentarios`) e evitar payloads desnecessários.
2. Implementar um endpoint dedicado e paginado `GET /postagens/:id/comentarios` para consumo sob demanda (ex: rolagem da seção de comentários).

### 🎯 O que deve ser feito
1. Atualizar `getPost` em `src/postagens/postagens.service.ts`:
   - Expor contagem total de comentários (`_count: { select: { comentarios: true } }`).
   - Não serializar lista ilimitada de comentários no retorno padrão do post.
2. Criar `QueryCommentDto`:
   - `page`: número opcional (padrão: 1, mín: 1).
   - `limit`: número opcional (padrão: 10, máx: 50).
   - `order`: string opcional (`asc` ou `desc`, padrão: `asc`).
3. Criar `CommentResponseDto`:
   - `id`, `content`, `media`, `createdAt`, `author`: `{ id, username, globalName, avatarUrl, roles }`.
4. Implementar endpoint `GET /postagens/:id/comentarios`:
   - Endpoint público (não exige autenticação obrigatória).
   - Retornar objeto paginado: `{ data: CommentResponseDto[], total: number, page: number, totalPages: number }`.
   - Incluir dados do autor do comentário sem vazar dados sensíveis.
5. Adicionar documentação OpenAPI/Swagger completa em `/postagens`.

### 📂 Arquivos Afetados
- `src/postagens/postagens.controller.ts`
- `src/postagens/postagens.service.ts`
- `src/postagens/dto/query-comment.dto.ts`
- `src/postagens/dto/comment-response.dto.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] `getPost` refatorado para expor contagem de comentários e evitar payload infinito
- [ ] Listagem paginada `GET /postagens/:id/comentarios` funcionando com `page`, `limit` e `order`
- [ ] Retorno com contagem total (`total`) e cálculo de páginas (`totalPages`)
- [ ] Dados públicos do autor populados em cada comentário (`avatarUrl`, `globalName`, `username`)
- [ ] Documentação Swagger visível em `/api-docs`
- [ ] Testes unitários para DTOs, Controller e Service
- [ ] Build do projeto passando (`bun run build`)

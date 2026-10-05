---
title: "feat(comentarios): implementar DTOs e endpoints de comentários em postagens"
labels: ["task", "backend", "enhancement"]
milestone: "Fase 3: Módulos do Schema"
---

### 📌 Contexto e Justificativa
O modelo `Comment` já existe em `prisma/schema.prisma` com relacionamentos para `Post` e `User` (Membros), mas ainda não possui rotas na API para que os usuários possam comentar nas postagens do feed.

### 🎯 O que deve ser feito
1. Criar os DTOs de comentários:
   * `CreateCommentDto` (`content`: string, max 1000 caracteres, `media`: string[] opcional).
   * `CommentResponseDto` com dados do autor (`username`, `avatarUrl`, `roles`).
2. Implementar os endpoints em `src/postagens` (ou submódulo `comentarios`):
   * `POST /postagens/:id/comentarios`: Cria comentário vinculado ao usuário autenticado (requer `JwtAuthGuard`).
   * `GET /postagens/:id/comentarios`: Retorna lista paginada de comentários de um post.
   * `DELETE /postagens/:id/comentarios/:commentId`: Permite que o autor do comentário ou administradores excluam o comentário.
3. Adicionar decorators completos do OpenAPI/Swagger (`@ApiOperation`, `@ApiResponse`, `@ApiParam`, `@ApiBody`).

### 📂 Arquivos Afetados
* `src/postagens/postagens.controller.ts` (ou novo `comentarios.controller.ts`)
* `src/postagens/postagens.service.ts` (ou novo `comentarios.service.ts`)
* `src/postagens/dto/create-comment.dto.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] DTO validado com `class-validator` e `class-transformer`
- [ ] Endpoint `POST` protegido por `JwtAuthGuard`
- [ ] Endpoint `DELETE` com validação de autoria
- [ ] Swagger documentado em `/api-docs` com códigos de resposta (201, 200, 400, 401, 403, 404)
- [ ] Testado localmente
- [ ] Build do projeto passando (`bun run build`)

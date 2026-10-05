### 📌 Contexto e Justificativa
O modelo `Comment` já existe no schema do Prisma (`prisma/schema.prisma`), mas atualmente não há endpoint para que usuários autenticados possam comentar nas postagens da comunidade.

### 🎯 O que deve ser feito
1. Criar o DTO `CreateCommentDto` em `src/postagens/dto/create-comment.dto.ts`:
   - `content`: string obrigatória, mínimo 1 caractere, máximo 1000 caracteres.
   - `media`: string[] opcional contendo URLs de anexos/mídias.
2. Implementar endpoint `POST /postagens/:id/comentarios`:
   - Proteger com `@UseGuards(JwtAuthGuard)` e `@ApiBearerAuth()`.
   - Obter o usuário autenticado da requisição (`req.user.id`).
   - Validar se a postagem com o `:id` fornecido existe no banco; se não existir, lançar `NotFoundException('Postagem não encontrada')`.
   - Criar o registro na tabela `Comment` associando ao autor e ao post.
3. Adicionar documentação OpenAPI/Swagger completa:
   - `@ApiOperation({ summary: 'Adicionar um comentário a uma postagem' })`
   - `@ApiResponse({ status: 201, description: 'Comentário criado com sucesso' })`
   - `@ApiResponse({ status: 400, description: 'Payload inválido' })`
   - `@ApiResponse({ status: 401, description: 'Não autorizado' })`
   - `@ApiResponse({ status: 404, description: 'Postagem não encontrada' })`

### 📂 Arquivos Afetados
- `src/postagens/postagens.controller.ts`
- `src/postagens/postagens.service.ts`
- `src/postagens/dto/create-comment.dto.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] DTO validado com `class-validator` e `class-transformer`
- [ ] Endpoint `POST /postagens/:id/comentarios` protegido por JWT
- [ ] Resposta com status `201 Created` e dados do comentário inserido
- [ ] Documentação Swagger atualizada em `/api-docs`
- [ ] Build do projeto passando (`bun run build`)

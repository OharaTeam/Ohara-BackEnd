### 📌 Contexto e Justificativa
Usuários devem poder remover seus próprios comentários caso se arrependam ou queiram deletar seu conteúdo. Administradores e moderadores também devem poder remover comentários para manter a moderação da comunidade.

### 🎯 O que deve ser feito
1. Implementar endpoint `DELETE /postagens/:id/comentarios/:commentId`:
   - Proteger com `@UseGuards(JwtAuthGuard)` e `@ApiBearerAuth()`.
   - Obter usuário autenticado da requisição.
   - Buscar o comentário pelo `commentId` e verificar se pertence ao `postId`.
   - Se o comentário não existir, retornar `404 Not Found`.
   - Verificar permissão:
     - O usuário autenticado é o autor do comentário? Se sim, permitir a exclusão.
     - Caso não seja o autor, verificar se possui cargo administrativo ou moderador.
     - Caso não tenha permissão, lançar `ForbiddenException('Você não tem permissão para excluir este comentário')`.
   - Excluir o comentário no banco de dados e retornar `204 No Content` ou `{ message: 'Comentário removido com sucesso' }`.
2. Adicionar documentação OpenAPI/Swagger completa:
   - `@ApiOperation({ summary: 'Excluir um comentário de uma postagem' })`
   - `@ApiResponse({ status: 200, description: 'Comentário excluído' })`
   - `@ApiResponse({ status: 401, description: 'Não autenticado' })`
   - `@ApiResponse({ status: 403, description: 'Sem permissão para excluir' })`
   - `@ApiResponse({ status: 404, description: 'Comentário não encontrado' })`

### 📂 Arquivos Afetados
- `src/postagens/postagens.controller.ts`
- `src/postagens/postagens.service.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Autor do comentário consegue excluí-lo
- [ ] Usuário não-autor sem cargo admin recebe status 403 Forbidden
- [ ] Retorna 404 caso o comentário não exista
- [ ] Swagger documentado em `/api-docs`
- [ ] Build do projeto passando (`bun run build`)

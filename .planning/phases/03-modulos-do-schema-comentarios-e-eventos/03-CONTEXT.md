# Phase 3: Modulos do Schema - Comentarios e Eventos - Context

**Gathered:** 2026-10-25
**Status:** Ready for planning
**Source:** PRD Express Path (.planning/github-issues/02-feat-comentarios-get.md)

<domain>
## Phase Boundary

Implementação da paginação de comentários e alinhamento do `getPost` (Issue #11 / TASK-02):
- Atualização do `getPost` no `PostagensService` para expor `_count: { select: { comentarios: true } }` e não serializar a lista ilimitada de comentários no retorno padrão do post.
- Criação dos DTOs `QueryCommentDto` e `CommentResponseDto`.
- Criação do endpoint público `GET /postagens/:id/comentarios` com suporte a paginação (`page`, `limit`, `order`), contagem total e metadados públicos do autor (`id`, `username`, `globalName`, `avatarUrl`, `roles`).
- Documentação OpenAPI/Swagger completa para o endpoint.
- Testes unitários para DTOs, Controller e Service.

</domain>

<decisions>
## Implementation Decisions

### Refatoração do `getPost`
- `getPost` deve remover `comentarios: true` e passar a selecionar `_count: { select: { comentarios: true } }`.
- O retorno do post deve incluir a contagem total de comentários em `_count.comentarios`, prevenindo o carregamento ilimitado de dados em postagens com muitos comentários.

### Modelagem de DTOs (`QueryCommentDto` & `CommentResponseDto`)
- `QueryCommentDto` com `page` (opcional, padrão 1, mín 1, Transform para número), `limit` (opcional, padrão 10, máx 50, Transform para número), e `order` (opcional, `asc` ou `desc`, padrão `asc`).
- `CommentResponseDto` tipando a saída: `id`, `content`, `media`, `createdAt`, `author: { id, username, globalName, avatarUrl, roles }`.
- Resposta paginada padrão: `{ data: CommentResponseDto[], total: number, page: number, totalPages: number }`.

### Endpoint `GET /postagens/:id/comentarios`
- Rota: `GET /postagens/:id/comentarios`.
- Autenticação: Endpoint público (sem `JwtAuthGuard`), permitindo que visitantes visualizem comentários sem autenticação prévia.
- Validação: Se o post com `:id` não existir, lançar `NotFoundException('Postagem não encontrada.')`.
- Carregamento de Autor: Trazer dados do autor associado (`author: { select: { id, username, globalName, avatarUrl, roles: { select: { name } } } }`) sem vazar dados sensíveis como senhas, tokens ou dados internos.

### OpenAPI & Documentação
- `@ApiTags('postagens')`
- `@ApiOperation`, `@ApiParam`, `@ApiQuery`, `@ApiResponse` (200 sucesso com lista paginada, 404 post não encontrado, 400 parâmetros inválidos).

### the agent's Discretion
- Estratégia de testes unitários: mock do `PrismaService` no `postagens.service.spec.ts` e mock do `PostagensService` no `postagens.controller.spec.ts`.
- Validação estrita de parâmetros de paginação via `class-validator` e `class-transformer`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e Roadmap
- `.planning/github-issues/02-feat-comentarios-get.md` — Especificação da Issue #11 (TASK-02)
- `.planning/ROADMAP.md` — Roadmap do projeto e marco da Fase 3
- `src/postagens/postagens.controller.ts` — Controller atual de postagens e comentários
- `src/postagens/postagens.service.ts` — Service atual de postagens e comentários
- `src/postagens/dto/create-comment.dto.ts` — DTO de criação de comentários existente
- `src/postagens/dto/query-feed.dto.ts` — Referência de DTO de paginação existente

</canonical_refs>

<specifics>
## Specific Ideas

- Espelhar o formato e padrão de paginação já adotados em `src/postagens/dto/query-feed.dto.ts` e `src/eventos/eventos.service.ts`.
- Garantir que a ordem padrão seja cronológica ascendente (`asc`), permitindo leitura linear da conversa, mas suportando `desc` para ver os mais recentes primeiro.

</specifics>

<deferred>
## Deferred Ideas

- Exclusão com controle de autor/admin (`DELETE /postagens/:id/comentarios/:commentId`) pertence à TASK-03 (Issue #12).
- Curtidas/reações em comentários pertencem a épicos futuros.

</deferred>

---

*Phase: 03-modulos-do-schema-comentarios-e-eventos*
*Context gathered: 2026-10-25 via PRD Express Path*

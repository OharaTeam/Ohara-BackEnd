### 📌 Contexto e Justificativa
O modelo `OharaEventos` está declarado em `prisma/schema.prisma` com campos para título, descrição, datas, banner e participantes, mas o módulo NestJS correspondente ainda não foi criado.

### 🎯 O que deve ser feito
1. Gerar o módulo `src/eventos`:
   - `EventosModule`, `EventosController`, `EventosService`.
   - Registrar `EventosModule` no `AppModule`.
2. Criar `CreateEventoDto` com validações via `class-validator`:
   - `titulo`: string obrigatória, mín. 3, máx. 100 caracteres.
   - `descricao`: string obrigatória.
   - `dataInicio`: ISO Date string.
   - `dataFim`: ISO Date string opcional.
   - `bannerUrl`: URL opcional.
   - `local`: string opcional (ex: Discord, Minecraft, etc.).
3. Implementar endpoint `POST /eventos`:
   - Proteger com `JwtAuthGuard` (apenas administradores/organizadores podem criar eventos).
   - Salvar o evento no banco associado ao autor/criador.
4. Implementar endpoint `GET /eventos`:
   - Listagem pública com paginação e filtro opcional de eventos futuros (`status=upcoming`).
5. Documentar todos os endpoints com Swagger (`@ApiTags('eventos')`).

### 📂 Arquivos Afetados
- `src/eventos/eventos.module.ts`
- `src/eventos/eventos.controller.ts`
- `src/eventos/eventos.service.ts`
- `src/eventos/dto/create-evento.dto.ts`
- `src/app.module.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Módulo `Eventos` modularizado e injetável
- [ ] Endpoint `POST /eventos` autenticado e validado
- [ ] Endpoint `GET /eventos` retornando lista formatada
- [ ] Swagger documentado em `/api-docs` sob a tag `eventos`
- [ ] Build do projeto passando (`bun run build`)

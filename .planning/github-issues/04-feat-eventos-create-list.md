### 📌 Contexto e Justificativa
O modelo `OharaEventos` está declarado em `prisma/schema.prisma` com vínculo direto à tabela `Posts` (`eventoId`).
Na experiência da comunidade Ohara, todo evento deve ser publicado automaticamente no feed principal de postagens para que os usuários possam visualizar, curtir e comentar. O módulo `eventos` é responsável pela criação da entidade de evento sincronizada com o feed e pela consulta de agenda/calendário.

### 🎯 O que deve ser feito
1. Gerar o módulo `src/eventos`:
   - `EventosModule`, `EventosController`, `EventosService`.
   - Registrar `EventosModule` no `AppModule`.
2. Criar `CreateEventoDto` com validações via `class-validator` alinhado ao `prisma/schema.prisma`:
   - `nomeEvento`: string obrigatória, mín. 3, máx. 100 caracteres.
   - `tipoEvento`: enum `COBBLEMON` | `OUTRO`.
   - `descricao`: string obrigatória.
   - `dataInicio`: ISO Date string.
   - `dataEncerramento`: ISO Date string.
   - `media`: array de strings (URLs) opcional (até 10 itens).
3. Implementar endpoint `POST /eventos`:
   - Proteger com `JwtAuthGuard` (administradores/organizadores).
   - Executar transação atômica (`prisma.$transaction`):
     a) Criar registro em `OharaEventos` com autor (`discordId`).
     b) Criar automaticamente a postagem em `Posts` (`tittle: nomeEvento`, `content: descricao`, `media: media`, `authorId: discordId`, `eventoId: evento.id`).
4. Implementar endpoint `GET /eventos`:
   - Listagem pública de agenda/calendário (sem duplicar a paginação do feed principal).
   - Suporte a filtro por eventos futuros (`upcoming=true` / `dataInicio >= now()`).
5. Documentar endpoints no Swagger sob a tag `eventos`.

### 📂 Arquivos Afetados
- `src/eventos/eventos.module.ts`
- `src/eventos/eventos.controller.ts`
- `src/eventos/eventos.service.ts`
- `src/eventos/dto/create-evento.dto.ts`
- `src/app.module.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Módulo `Eventos` modularizado e registrado no `AppModule`
- [ ] DTO `CreateEventoDto` validando campos conforme o schema do Prisma
- [ ] `POST /eventos` autenticado criando o evento e o post no feed via `prisma.$transaction`
- [ ] `GET /eventos` retornando agenda de eventos (com filtro por próximos eventos)
- [ ] Documentação Swagger visível em `/api-docs` sob a tag `eventos`
- [ ] Testes unitários para DTO, Controller e Service
- [ ] Build do projeto passando (`bun run build`)

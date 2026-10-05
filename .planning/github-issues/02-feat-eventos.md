---
title: "feat(eventos): criar módulo de gestão de eventos da comunidade Ohara"
labels: ["task", "backend", "enhancement"]
milestone: "Fase 3: Módulos do Schema"
---

### 📌 Contexto e Justificativa
O modelo `OharaEventos` está modelado no banco de dados (`prisma/schema.prisma`) com enum `tipoEvento` (COBBLEMON, OUTRO), suporte a datas de início/encerramento e autoria, mas necessita de um módulo dedicado no NestJS para gerenciamento via API.

### 🎯 O que deve ser feito
1. Gerar o módulo NestJS `src/eventos` (`EventosModule`, `EventosController`, `EventosService`).
2. Criar os DTOs:
   * `CreateEventoDto` (`nomeEvento`, `tipoEvento`, `descricao`, `media`, `dataInicio`, `dataEncerramento`).
   * `UpdateEventoDto` (parcial via `@nestjs/mapped-types`).
3. Implementar os endpoints:
   * `POST /eventos`: Criação de novo evento (requer autenticação de moderador/admin).
   * `GET /eventos`: Listagem paginada de eventos com filtro opcional por `tipoEvento` e status (em andamento, encerrado).
   * `GET /eventos/:id`: Detalhes completos do evento e posts/anúncios vinculados.
   * `PATCH /eventos/:id`: Atualização de informações do evento.
   * `DELETE /eventos/:id`: Encerramento ou remoção do evento.
4. Adicionar decorators OpenAPI/Swagger com `@ApiTags('eventos')`.

### 📂 Arquivos Afetados
* `src/eventos/eventos.module.ts`
* `src/eventos/eventos.controller.ts`
* `src/eventos/eventos.service.ts`
* `src/eventos/dto/create-evento.dto.ts`
* `src/eventos/dto/update-evento.dto.ts`
* `src/app.module.ts` (importação do `EventosModule`)

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Validações estritas de datas (`dataEncerramento` posterior a `dataInicio`)
- [ ] Enum `tipoEvento` validado com `class-validator`
- [ ] Endpoints de escrita protegidos com `JwtAuthGuard`
- [ ] Swagger documentado com exemplos em `/api-docs`
- [ ] Build e Lint passando (`bun run build`)

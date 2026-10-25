---
phase: "03"
plan: "02"
subsystem: api
tags: [nestjs, prisma, eventos, crud, rbac, swagger, tests]

requires: []
provides:
  - DTO UpdateEventoDto herdando de PartialType(CreateEventoDto) para atualizações parciais
  - Enriquecimento de EventoResponseDto com contagem opcional de entidades (_count.pokemonsCapturados)
  - Endpoint público GET /eventos/:id retornando detalhes completos com autor sanitizado e postId
  - Endpoint protegido PATCH /eventos/:id com validação estrita de autor ou cargo Dev
  - Endpoint protegido DELETE /eventos/:id com exclusão segura e permissão restrita a autor ou Dev
  - Decorators Swagger OpenAPI completos cobrindo códigos 200, 400, 401, 403 e 404
  - Cobertura completa de testes unitários para DTO, EventosService e EventosController (38/38 testes passando)
affects: [eventos, feed, postagens]

actuals:
  tokens: 3200
  tasks: 3
  commits: 4

tech-stack:
  added: []
  patterns:
    - Autorização RBAC restrita onde o cargo 'Dev' é o único com privilégios administrativos
    - Atualização transacional atômica refletindo alterações de título, descrição e mídia na postagem correspondente no feed
    - Validação de integridade temporal impedindo que dataEncerramento seja anterior a dataInicio

key-files:
  created:
    - src/eventos/dto/update-evento.dto.ts
    - src/eventos/dto/update-evento.dto.spec.ts
  modified:
    - src/eventos/dto/evento-response.dto.ts
    - src/eventos/eventos.service.ts
    - src/eventos/eventos.controller.ts
    - src/eventos/eventos.service.spec.ts
    - src/eventos/eventos.controller.spec.ts

key-decisions:
  - "O único cargo com privilégios administrativos no sistema é o cargo Dev (usuários sem esse cargo e que não sejam o autor recebem 403 ForbiddenException)"
  - "Endpoint GET /eventos/:id é público, permitindo visualização de eventos da comunidade por visitantes"
  - "Sincronização atômica via $transaction no PATCH /eventos/:id atualizando OharaEventos e Post vinculado"
  - "Validação de consistência temporal: se as datas forem fornecidas ou mescladas com as atuais, dataEncerramento deve ser >= dataInicio"

patterns-established:
  - "Helper privado isDevUser para inspeção robusta de roles tanto em formato string quanto objeto { name: string }"
  - "Decorators Swagger padronizados com ApiParam, ApiBearerAuth, ApiBody e tipos de retorno detalhados"

requirements-completed:
  - TASK-05

coverage:
  - id: D1
    description: "Criação do UpdateEventoDto e validações unitárias de campos parciais e datas"
    requirement: "TASK-05"
    verification:
      - kind: unit
        ref: "src/eventos/dto/update-evento.dto.spec.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: "Implementação de getEventoById, updateEvento e deleteEvento no EventosService com regra RBAC Dev"
    requirement: "TASK-05"
    verification:
      - kind: unit
        ref: "src/eventos/eventos.service.spec.ts"
        status: pass
    human_judgment: false
  - id: D3
    description: "Exposição dos endpoints GET, PATCH e DELETE :id no EventosController com OpenAPI e guards"
    requirement: "TASK-05"
    verification:
      - kind: unit
        ref: "src/eventos/eventos.controller.spec.ts"
        status: pass
    human_judgment: false

status: complete
---

# Phase 03 Plan 02 Summary: Endpoints de Detalhes, Atualização e Exclusão de Eventos

**Implementação dos endpoints de consulta detalhada (`GET /eventos/:id`), atualização parcial (`PATCH /eventos/:id`) e exclusão (`DELETE /eventos/:id`) com controle estrito de permissão onde o único cargo com permissão de administrador é o cargo `Dev` (Issue #13 / TASK-05).**

## Accomplishments

1. **DTOs e Tipagem OpenAPI (`TASK-05`)**:
   - `UpdateEventoDto`: criado estendendo `PartialType(CreateEventoDto)`, permitindo atualizações parciais seguras de dados do evento.
   - `EventoResponseDto`: atualizado com a propriedade opcional `_count` (`EventoCountDto`), permitindo expor contagem de pokémons capturados no Swagger.
   - `update-evento.dto.spec.ts`: suíte de testes unitários cobrindo payload vazio, campos parciais válidos, validações de tamanho mínimo, enums e formato ISO 8601.

2. **Lógica de Negócio e Permissões no `EventosService`**:
   - `getEventoById`: busca evento por UUID com dados sanitizados do autor (`id`, `username`, `globalName`, `avatarUrl`), `postId` do post vinculado e contagem de pokemons, retornando `404 Not Found` caso inexistente.
   - `updateEvento`:
     - Regra estrita de RBAC: apenas o autor original do evento (`authorId === user.discordId`) ou membros com a role `'Dev'` podem atualizar o evento. Qualquer outro usuário recebe `403 Forbidden`.
     - Validação de consistência temporal: impede que `dataEncerramento` seja anterior a `dataInicio`.
     - Verificação de duplicidade de nome em outros eventos e postagens.
     - Atualização atômica via `$transaction` Prisma, sincronizando automaticamente o título, descrição e mídias do `Post` associado.
   - `deleteEvento`:
     - Exclusão restrita ao autor original ou ao cargo de administrador `'Dev'`.
     - Remoção segura com integridade referencial mantida.
   - `eventos.service.spec.ts`: 20 testes unitários cobrindo todos os fluxos de sucesso, erros 400, 403 e 404.

3. **Endpoints no `EventosController`**:
   - `GET /eventos/:id`: endpoint público documentado no Swagger com validação de UUID v4 (`ParseUUIDPipe`).
   - `PATCH /eventos/:id`: protegido com `JwtAuthGuard` e `ApiBearerAuth`, documentado com todos os status HTTP possíveis.
   - `DELETE /eventos/:id`: protegido com `JwtAuthGuard` e `ApiBearerAuth`, retornando confirmação de sucesso.
   - `eventos.controller.spec.ts`: 6 testes unitários cobrindo a delegação dos parâmetros para o service.

## Verification Results

- Testes Unitários de Eventos: `bun test src/eventos/` — 38/38 testes passando (100%).
- Compilação do Projeto: `bun run build` — compilação NestJS e geração do Prisma Client executados com sucesso (código 0).
- Linter e Tipagem: `bunx eslint "src/eventos/**/*.ts"` — 0 erros e 0 warnings.

## Self-Check: PASSED

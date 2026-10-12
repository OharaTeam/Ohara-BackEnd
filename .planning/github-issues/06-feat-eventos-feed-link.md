### 📌 Contexto e Justificativa
Com a criação de eventos gerando automaticamente postagens vinculadas no feed (TASK-04), a listagem principal do feed (`GET /postagens`) precisa exibir adequadamente os dados dos eventos associados, permitindo que o frontend identifique posts do tipo evento e renderize badges, datas e informações de participação.

### 🎯 O que deve ser feito
1. Atualizar `getFeed` em `src/postagens/postagens.service.ts`:
   - Enriquecer o `select` de `evento`: incluir `id`, `nomeEvento`, `tipoEvento`, `dataInicio`, `dataEncerramento`, `media`.
2. Adicionar suporte a filtro opcional no feed (`GET /postagens`):
   - Query param opcional `tipo?: 'todos' | 'posts' | 'eventos'` (ou filtro por `tipoEvento`).
3. Documentar os novos campos e filtros no Swagger OpenAPI.

### 📂 Arquivos Afetados
- `src/postagens/postagens.service.ts`
- `src/postagens/postagens.controller.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [x] `getFeed` retorna metadados completos de evento quando a postagem for associada a um evento
- [x] Frontend consegue diferenciar visualmente postagens comuns de eventos no feed
- [x] Suporte a filtro por tipo no feed documentado no Swagger
- [x] Build do projeto passando (`bun run build`)

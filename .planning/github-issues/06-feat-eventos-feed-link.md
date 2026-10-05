### 📌 Contexto e Justificativa
Eventos da comunidade Ohara devem poder ser destacados no feed principal por meio de postagens associadas, permitindo que a comunidade comente e interaja diretamente sobre o evento.

### 🎯 O que deve ser feito
1. Atualizar o DTO de criação de postagens (`CreatePostDto`):
   - Adicionar campo opcional `eventoId?: string` validando se o evento informado existe.
2. Atualizar `PostagensService`:
   - Ao criar uma postagem com `eventoId`, vincular a relação no Prisma.
   - Ao consultar o feed (`GET /postagens`), incluir os dados resumidos do evento associado (`id`, `titulo`, `dataInicio`, `bannerUrl`).
3. Adicionar documentação OpenAPI/Swagger no DTO e no controlador de postagens.

### 📂 Arquivos Afetados
- `src/postagens/dto/create-post.dto.ts`
- `src/postagens/postagens.service.ts`
- `src/postagens/postagens.controller.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Postagem pode ser associada a um evento existente
- [ ] Retorno `404 Not Found` caso o `eventoId` passado não exista
- [ ] Feed retorna resumo do evento nas postagens vinculadas
- [ ] Documentação Swagger atualizada
- [ ] Build do projeto passando (`bun run build`)

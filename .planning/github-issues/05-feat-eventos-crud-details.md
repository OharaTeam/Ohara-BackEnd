### 📌 Contexto e Justificativa
Após a criação do módulo básico de eventos, a plataforma necessita de rotas para exibir os detalhes completos de um evento específico, atualizar suas informações (data, local, descrição) e cancelar/excluir eventos.

### 🎯 O que deve ser feito
1. Criar `UpdateEventoDto` em `src/eventos/dto/update-evento.dto.ts` estendendo `PartialType(CreateEventoDto)`.
2. Implementar endpoint `GET /eventos/:id`:
   - Retornar o evento completo com contagem de participantes ou postagens associadas.
   - Retornar `404 Not Found` caso o ID não exista.
3. Implementar endpoint `PATCH /eventos/:id`:
   - Proteger com `JwtAuthGuard`.
   - Permitir apenas ao organizador original (autor) ou administrador (cargo exclusivo `Dev`) atualizar os dados. Caso o usuário não tenha permissão, retornar `403 Forbidden`.
   - Atualizar apenas os campos fornecidos.
4. Implementar endpoint `DELETE /eventos/:id`:
   - Proteger com `JwtAuthGuard`.
   - Excluir o evento do banco caso o usuário seja o autor ou possua o cargo de administrador (`Dev`). Caso não tenha permissão, retornar `403 Forbidden`.
5. Documentar todos os status HTTP e parâmetros com decorators OpenAPI.

### 📂 Arquivos Afetados
- `src/eventos/eventos.controller.ts`
- `src/eventos/eventos.service.ts`
- `src/eventos/dto/update-evento.dto.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Endpoint `GET /eventos/:id` funcional com retorno tipado
- [ ] Endpoint `PATCH /eventos/:id` com validação de permissão e DTO parcial
- [ ] Endpoint `DELETE /eventos/:id` com tratamento de integridade referencial
- [ ] Swagger documentado em `/api-docs`
- [ ] Build do projeto passando (`bun run build`)

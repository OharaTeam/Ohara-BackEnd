### 📌 Contexto e Justificativa
Os módulos de Postagens e Usuários gerenciam o feed principal e a integração com perfis públicos e Steam API. Testes unitários evitam regressões nas regras de post e vitrines.

### 🎯 O que deve ser feito
1. Implementar testes unitários para `PostagensService` (`src/postagens/postagens.service.spec.ts`):
   - Criação de postagem associada ao autor autenticado.
   - Validação de mídia e sanitização de texto.
   - Listagem paginada do feed com inclusão de autor e contagem de comentários.
2. Implementar testes unitários para `UsersService` (`src/users/users.service.spec.ts`):
   - Obtenção do perfil completo e fallback quando Steam ID não está cadastrado.
   - Atualização de vitrine e customização de perfil.
3. Utilizar mocks para chamadas HTTP externas da Steam.

### 📂 Arquivos Afetados
- `src/postagens/postagens.service.spec.ts`
- `src/users/users.service.spec.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Testes unitários para criação e paginação de postagens passando
- [ ] Testes de resolução de perfil e vitrine passando com mocks da Steam
- [ ] Build do projeto passando (`bun run build`)

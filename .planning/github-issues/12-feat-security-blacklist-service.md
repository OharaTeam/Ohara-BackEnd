### 📌 Contexto e Justificativa
Tokens JWT são stateless por natureza. Quando um usuário faz logout, o token permanece criptograficamente válido até sua expiração natural. Precisamos de um serviço de blacklist em servidor para armazenar tokens revogados até que seu TTL expire.

### 🎯 O que deve ser feito
1. Criar o serviço `TokenBlacklistService` em `src/auth/token-blacklist.service.ts`:
   - Estrutura de armazenamento eficiente (Map em memória com timestamps ou integração Redis/Prisma).
   - Método `adicionar(token: string, expiraEm: number): Promise<void>`.
   - Método `estaRevogado(token: string): Promise<boolean>`.
   - Rotina periódica de expurgo para liberar memória de tokens que já ultrapassaram o TTL natural.
2. Adicionar testes unitários para o serviço cobrindo inserção, consulta e expiração.

### 📂 Arquivos Afetados
- `src/auth/token-blacklist.service.ts`
- `src/auth/token-blacklist.service.spec.ts`
- `src/auth/auth.module.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Serviço de blacklist capaz de registrar e consultar tokens
- [ ] Limpeza automática de tokens expirados para prevenir vazamento de memória
- [ ] Testes unitários com 100% de aprovação
- [ ] Build do projeto passando (`bun run build`)

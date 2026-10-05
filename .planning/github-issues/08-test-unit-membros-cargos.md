### 📌 Contexto e Justificativa
Os módulos de Membros e Cargos contêm regras essenciais de sincronização com o Discord, ordenação hierárquica (Devs no topo) e tratamento de permissões (`BigInt`).

### 🎯 O que deve ser feito
1. Implementar testes unitários para `MembrosService` (`src/membros/membros.service.spec.ts`):
   - Sincronização em lote (`sincronizarMembrosBatch`) via transações Prisma.
   - Listagem paginada com ordenação e busca por nome/tag.
   - Consulta individual por ID do Discord.
2. Implementar testes unitários para `CargosService` (`src/cargos/cargos.service.spec.ts`):
   - Conversão e serialização de `BigInt` para JSON nas permissões.
   - Sincronização em lote de cargos vindos do bot.
3. Configurar mocks padronizados do `PrismaService`.

### 📂 Arquivos Afetados
- `src/membros/membros.service.spec.ts`
- `src/cargos/cargos.service.spec.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Testes cobrindo sincronização, paginação e ordenação de membros
- [ ] Teste cobrindo serialização de BigInt dos cargos
- [ ] Todos os testes passando sem erros
- [ ] Build do projeto passando (`bun run build`)

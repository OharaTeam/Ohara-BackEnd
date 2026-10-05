---
title: "feat(minecraft): implementar vinculação de contas Minecraft e histórico de pokémons"
labels: ["task", "backend", "enhancement"]
milestone: "Fase 3: Módulos do Schema"
---

### 📌 Contexto e Justificativa
Os modelos `ContaMinecraft` e `PokemonsCapturados` em `prisma/schema.prisma` mapeiam a integração do servidor Cobblemon com o ecossistema Ohara, permitindo que os membros vinculem seu UUID e visualizem seus Pokémons no perfil da web.

### 🎯 O que deve ser feito
1. Criar o módulo NestJS `src/minecraft` (`MinecraftModule`, `MinecraftController`, `MinecraftService`).
2. Criar os DTOs:
   * `LinkMinecraftAccountDto` (`uuid`: string, `nickAtual`: string).
   * `SyncPokemonDto` (para sincronização automática vinda do servidor Cobblemon).
3. Implementar os endpoints:
   * `POST /minecraft/link`: Vincula uma conta Minecraft ao usuário autenticado (`JwtAuthGuard`).
   * `GET /minecraft/profile/:userId`: Retorna a conta de Minecraft vinculada a um usuário do Discord.
   * `POST /minecraft/pokemons/sync`: Endpoint M2M protegido por `BotKeyGuard` (`X-API-KEY`) para o servidor registrar capturas.
   * `GET /minecraft/pokemons/:uuid`: Lista paginada de pokémons capturados pelo UUID do jogador.
4. Adicionar decorators OpenAPI/Swagger com `@ApiTags('minecraft')`.

### 📂 Arquivos Afetados
* `src/minecraft/minecraft.module.ts`
* `src/minecraft/minecraft.controller.ts`
* `src/minecraft/minecraft.service.ts`
* `src/minecraft/dto/link-minecraft.dto.ts`
* `src/minecraft/dto/sync-pokemon.dto.ts`
* `src/app.module.ts`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Validação de formato de UUID para contas Minecraft
- [ ] Endpoint de sincronização de pokémons protegido por `X-API-KEY`
- [ ] Relação entre Membro e ContaMinecraft garantindo unicidade por usuário
- [ ] Swagger documentado em `/api-docs`
- [ ] Build e Lint passando (`bun run build`)

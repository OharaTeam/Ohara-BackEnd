# Convenções de Código & Padrões

## Estilo de Código & Formatação
- **Formatter:** Prettier configurado com:
  - Aspas simples (`singleQuote: true`)
  - Vírgulas finais em tudo (`trailingComma: "all"`)
- **Linter:** ESLint 9 utilizando Flat Config (`eslint.config.mjs`) com regras recomendadas pelo `typescript-eslint`.
- **Ajustes de Regras:**
  - `@typescript-eslint/no-explicit-any`: Desabilitado (`off`) para permitir representações dinâmicas flexíveis de APIs e payloads.
  - `@typescript-eslint/no-floating-promises`: Configurado para `warn`.
  - `@typescript-eslint/no-unsafe-argument`: Configurado para `warn`.

---

## Convenções de Nomenclatura

### Nomenclatura de Arquivos
Todos os arquivos seguem o padrão NestJS em kebab-case:
- Controllers: `*.controller.ts` (ex: `membros.controller.ts`)
- Services: `*.service.ts` (ex: `users.service.ts`, `cleanup.service.ts`)
- Modules: `*.module.ts` (ex: `auth.module.ts`)
- DTOs: `*.dto.ts` dentro de subdiretórios `dto/` (ex: `create-post.dto.ts`)
- Guards: `*.guard.ts` (ex: `bot-key.guard.ts`, `jwt-auth.guard.ts`)
- Strategies: `*.strategy.ts` (ex: `discord.strategy.ts`, `jwt.strategy.ts`)
- Testes: `*.spec.ts` para testes unitários, `*.e2e-spec.ts` para testes end-to-end

### Nomenclatura de Classes & Membros
- Classes: PascalCase com sufixo descritivo de função (ex: `UsersController`, `PostagensService`, `CreateMembroDto`).
- Métodos: camelCase descrevendo a ação (ex: `findAll`, `findOne`, `createPost`, `updateProfile`).
- Variáveis & Propriedades: camelCase (ex: `discordId`, `serverAvatarUrl`).

### Nomenclatura no Banco de Dados & Prisma
- Prisma Models: PascalCase singular ou plural (ex: `User`, `Role`, `Profile`, `OharaEventos`, `Post`).
- Mapeamento de Tabelas: Mapeadas para nomes de tabelas em português através da diretiva `@@map` (ex: `@@map("Membros")`, `@@map("Cargos")`, `@@map("Perfis")`, `@@map("Posts")`).
- Chaves Estrangeiras & Relações: camelCase (ex: `authorId`, `userId`, `eventoId`).

---

## Padrões de DTO & Validação

- Todas as entradas recebidas via `@Body()`, `@Query()` ou `@Param()` que exigem validação devem usar classes DTO.
- Decorators padrão do `class-validator`:
  - Verificações de obrigatoriedade: `@IsNotEmpty()`
  - Validações de tipo: `@IsString()`, `@IsNumber()`, `@IsBoolean()`, `@IsArray()`, `@IsDateString()`, `@IsUrl()`
  - Intervalos e restrições: `@Min()`, `@MinLength()`, `@MaxLength()`
  - Campos opcionais: `@IsOptional()` juntamente com `@ApiPropertyOptional()`
- Transformações via `class-transformer`:
  - Objetos aninhados: `@ValidateNested()` combinado com `@Type(() => ChildDto)`
  - Sanitização de strings vazias: `@Transform(({ value }) => value === "" ? null : value)`
- O `ValidationPipe` global garante:
  - `transform: true` (transforma automaticamente payloads em instâncias de DTO)
  - `whitelist: true` (remove propriedades não reconhecidas)
  - `forbidNonWhitelisted: true` (lança erro de bad request se propriedades em excesso forem fornecidas)

---

## Padrões de Documentação da API

Todos os controllers e rotas são decorados com anotações do `@nestjs/swagger`:
- Nível de Módulo: `@ApiTags('tag-name')`
- Rotas Protegidas: `@ApiBearerAuth()`
- Endpoints: `@ApiOperation({ summary: '...', description: '...' })`
- Respostas: `@ApiResponse({ status: 200, description: '...' })`
- Schemas de Entrada: `@ApiBody({ type: ... })`, `@ApiQuery({ name: '...' })`, `@ApiParam({ name: '...' })`

---

## Tratamento de Erros & Logging

- **Exceptions:** Sempre lançar exceções HTTP nativas do NestJS:
  - `BadRequestException`: Entrada inválida ou registros duplicados com restrição de unicidade
  - `NotFoundException`: Recurso não encontrado
  - `UnauthorizedException`: Credenciais, tokens ou API keys ausentes ou inválidos
  - `InternalServerErrorException`: Falhas operacionais não tratadas
- **Logging:** Todo controller e service instancia um Logger dedicado do NestJS:
  ```typescript
  private readonly logger = new Logger(ServiceName.name);
  ```
  - Utilize `this.logger.log(...)` para marcos operacionais e requisições
  - Utilize `this.logger.warn(...)` para erros do cliente ou estados inesperados
  - Utilize `this.logger.error(...)` para falhas do sistema e erros de API

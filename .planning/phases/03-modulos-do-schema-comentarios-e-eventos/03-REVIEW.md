---
phase: 03-modulos-do-schema-comentarios-e-eventos
reviewed: 2026-10-25T17:35:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - src/postagens/postagens.controller.ts
  - src/postagens/postagens.service.ts
findings:
  critical: 3
  warning: 3
  info: 2
  total: 8
status: issues_found
---

# Phase 03: Code Review Report - Issue #12 / PR #27

**Reviewed:** 2026-10-25T17:35:00Z
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Revisão técnica adversarial do Pull Request #27 (branch `12-featcomentarios-implementar-exclusao-com-permissao-delete-postagensidcomentarioscommentid`), referente à Issue #12: `DELETE /postagens/:id/comentarios/:commentId`.

A análise identificou **3 falhas críticas (BLOCKER)** que impedem o merge do PR:
1. **Quebra de RBAC para a role `Dev`**: Devido a uma checagem de case-sensitivity com bug (`['Dev'].includes(role.name.toLowerCase())`), nenhum usuário desenvolvedor/administrador consegue excluir comentários de outros usuários.
2. **Erro em tempo de execução no Prisma**: O controller repassa o objeto `req.user` para o parâmetro `userId: string` do service. O Prisma recebe `{ where: { id: [object Object] } }`, gerando erro de validação do client e resultando em HTTP 500 para qualquer requisição autenticada.
3. **Ausência completa de testes unitários**: Não há nenhum teste unitário para `deleteComment` nem no controller (`postagens.controller.spec.ts`) nem no service (`postagens.service.spec.ts`), violando os critérios de aceite e o Definition of Done.

Adicionalmente, foram identificados 3 alertas de qualidade/robustez (Warnings) e 2 apontamentos informativos (Info).

---

## Critical Issues

### CR-01: Quebra de permissão RBAC para cargo 'Dev' (Case Sensitivity Bug)

**File:** `src/postagens/postagens.service.ts:385-388`
**Issue:**
A regra de permissão compara a lista em TitleCase `['Dev']` contra a role convertida para minúsculo (`role.name.toLowerCase()`, que resulta em `'dev'`). Como `['Dev'].includes('dev')` é sempre `false`, administradores com o cargo `Dev` **nunca** conseguem excluir comentários de terceiros, violando a regra fundamental do sistema definida no ROADMAP, STATE e Issue #12.

```typescript
// Código atual com bug:
const cargosComPermissao = ['Dev'];
const ehAdminOuModerador = user.roles.some((role) =>
  cargosComPermissao.includes(role.name.toLowerCase()),
);
```

**Fix:**
Normalizar ambos para minúsculo ou comparar diretamente com `'Dev'`, alinhando com o padrão já adotado em `eventos.service.ts`:
```typescript
const ehAdminOuModerador = user.roles.some(
  (role) => role.name.toLowerCase() === 'dev' || role.name === 'Dev',
);
```

---

### CR-02: Erro em tempo de execução no Prisma devido a repasse de Objeto `req.user` para parâmetro `userId: string`

**File:** `src/postagens/postagens.controller.ts:262` e `src/postagens/postagens.service.ts:354,371`
**Issue:**
No `PostagensController`, o método `deleteComment` invoca o serviço passando o objeto inteiro `req.user`:
```typescript
return this.postagensService.deleteComment(id, commentId, req.user);
```
No `PostagensService`, o terceiro argumento é tipado como `userId: string`:
```typescript
async deleteComment(postId: string, commentId: string, userId: string) {
  // ...
  const user = await this.prisma.user.findUnique({
    where: { id: userId }, // userId é na verdade { id: '...', discordId: '...', ... }
  });
}
```
Em runtime, o Prisma falha ao validar o campo `where.id` (esperado `String`, recebido `Object`), lançando exceção que cai no bloco `catch` e retorna HTTP 500 (`InternalServerErrorException: Erro ao excluir comentário`) para todos os chamadores. Além disso, causa erro de linter `@typescript-eslint/no-unsafe-argument`.

**Fix:**
No controller, extrair e enviar `req.user.id` (ou passar uma interface tipada `UserAuthContext`, conforme adotado no módulo de eventos):
```typescript
// No Controller:
return this.postagensService.deleteComment(id, commentId, req.user.id);
```
Ou, se preferir receber o usuário autenticado completo:
```typescript
// No Service:
async deleteComment(postId: string, commentId: string, userAuth: AuthenticatedUser)
```

---

### CR-03: Ausência total de testes unitários para `deleteComment` no Controller e no Service

**File:** `src/postagens/postagens.controller.spec.ts` e `src/postagens/postagens.service.spec.ts`
**Issue:**
O PR foi submetido sem nenhum teste unitário para a nova funcionalidade de exclusão. O projeto mantém cobertura estrita de 100% nas rotas anteriores (35/35 testes em postagens e 38/38 em eventos). A ausência de testes permitiu que os bugs CR-01 e CR-02 passassem despercebidos pelo autor.

**Fix:**
Implementar suíte de testes completa cobrindo:
1. `postagens.controller.spec.ts`:
   - Deve delegar para `service.deleteComment` com parâmetros corretos e retornar a mensagem de sucesso.
2. `postagens.service.spec.ts`:
   - Deve permitir exclusão quando o usuário for o autor do comentário.
   - Deve permitir exclusão quando o usuário não for o autor, mas possuir o cargo `Dev`.
   - Deve lançar `NotFoundException` quando o comentário não for encontrado ou não pertencer ao `postId`.
   - Deve lançar `ForbiddenException` quando o usuário não for o autor e não for `Dev`.
   - Deve propagar exceções e lançar `InternalServerErrorException` em erros inesperados do banco.

---

## Warnings

### WR-01: Tipagem insegura `any` no `@Req()` gerando violações de lint

**File:** `src/postagens/postagens.controller.ts:257`
**Issue:**
O uso de `@Req() req: any` desativa a checagem de tipos do TypeScript e dispara avisos/erros do ESLint (`@typescript-eslint/no-unsafe-member-access`).

**Fix:**
Criar ou importar uma interface tipada como `AuthenticatedRequest`:
```typescript
interface AuthenticatedRequest {
  user: {
    id: string;
    discordId: string;
    username: string;
    roles?: (string | { name: string })[];
  };
}

@Delete(':id/comentarios/:commentId')
deleteComment(
  @Param('id') id: string,
  @Param('commentId') commentId: string,
  @Req() req: AuthenticatedRequest,
)
```

---

### WR-02: Ausência de validação de formato UUID nos parâmetros `:id` e `:commentId`

**File:** `src/postagens/postagens.controller.ts:255-256`
**Issue:**
Os parâmetros da rota não utilizam `ParseUUIDPipe`. Requisições com IDs em formato inválido atingem diretamente as consultas ao PostgreSQL/Prisma em vez de serem rejeitadas precocemente com HTTP 400 Bad Request.

**Fix:**
Aplicar `new ParseUUIDPipe({ version: '4' })`:
```typescript
@Delete(':id/comentarios/:commentId')
deleteComment(
  @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  @Param('commentId', new ParseUUIDPipe({ version: '4' })) commentId: string,
  @Req() req: AuthenticatedRequest,
)
```

---

### WR-03: Nível de log inadequado e stringificação de objeto no Logger

**File:** `src/postagens/postagens.service.ts:355-357,409`
**Issue:**
1. O log de entrada concatena `${userId}`, imprimindo `[object Object]` no terminal devido ao bug CR-02.
2. No bloco `catch`, falhas inesperadas de infraestrutura/banco são registradas como `this.logger.warn(...)` em vez de `this.logger.error(...)`, contrariando as boas práticas e o padrão do projeto em `eventos.service.ts`.

**Fix:**
```typescript
this.logger.log(
  `Solicitação de exclusão do comentário ${commentId} no post ${postId} pelo usuário ${userId}`,
);
// no catch:
this.logger.error(`Erro ao excluir comentário: ${error}`);
```

---

## Info

### IN-01: Consulta redundante ao banco de dados para checagem de roles

**File:** `src/postagens/postagens.service.ts:370-380`
**Issue:**
O payload JWT já contém `discordId` e `roles` decodificados pelo `JwtStrategy`. Consultar o banco via `prisma.user.findUnique` adiciona uma viagem desnecessária de I/O de banco para cada exclusão, a menos que o objetivo explícito seja validação em tempo real de revogação de cargos.

**Fix:**
Avaliar reutilizar as informações do token em `req.user` para checar `user.discordId === comment.authorId` e `isDevUser(user)`, seguindo o padrão consolidado em `eventos.service.ts`.

---

### IN-02: Documentação OpenAPI/Swagger sem especificação do erro 400 Bad Request

**File:** `src/postagens/postagens.controller.ts:249-253`
**Issue:**
Caso o `ParseUUIDPipe` seja adicionado aos parâmetros da rota, o Swagger deve documentar a resposta de erro 400 correspondente.

**Fix:**
```typescript
@ApiResponse({
  status: 400,
  description: 'Identificador inválido (esperado UUID válido para id ou commentId).',
})
```

---

_Reviewed: 2026-10-25T17:35:00Z_
_Reviewer: Antigravity (gsd-code-reviewer)_
_Depth: standard_

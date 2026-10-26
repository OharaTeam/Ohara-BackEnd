# Diretrizes de Desenvolvimento de API - OharaBack-End

**Objetivo:** Este documento define as regras mandatórias de arquitetura, segurança de dados e convenções de código para desenvolvedores humanos e agentes de IA que atuam no repositório **OharaBack-End**.

---

## 1. Identificadores Públicos & URLs (Padrão NanoID)

- **Regra Geral:** Todas as rotas públicas que expõem e localizam recursos por identificador na URL (`Postagens`, `OharaEventos`, `Comentários`) DEVEM utilizar **NanoID** (10 caracteres alfanuméricos URL-safe, sem caracteres ambíguos ou símbolos complexos).
- **Proibição de UUID em URLs:** É proibido expor UUID v4 em novas URLs públicas para evitar poluição visual, facilitar o compartilhamento em redes/Discord e melhorar a experiência do usuário.
- **Formato Padrão:** Utilizar o utilitário centralizado `generateNanoId()` (alfabeto `0-9A-Za-z`, tamanho 10).
- **Validação de Entrada:** Utilizar o pipe padronizado `ParseNanoIdPipe` em todos os parâmetros `@Param('id')` públicos para rejeitar precocemente valores fora do padrão (HTTP 400 Bad Request).
- **Exceção de Usuários:** Rotas de membros/usuários utilizam exclusivamente o `discordId` nativo da comunidade (ex: `/users/:discordId`), preservando a identidade primária da integração com o Discord.

---

## 2. Blindagem contra IDOR (Insecure Direct Object Reference)

- **Queries Compostas Obrigatórias:** Em operações destrutivas ou de atualização parcial (`PATCH`, `DELETE`), NUNCA confie apenas no `id` fornecido no parâmetro da rota.
- **Validação de Autoria em Nível de Banco:** A consulta do Prisma DEVE ser composta, validando se o registro pertence ao usuário autenticado:
  ```typescript
  // Exemplo seguro para Comentários / Postagens / Eventos
  const registro = await this.prisma.comment.findFirst({
    where: {
      id: commentId,
      postId: postId,
      authorId: user.discordId,
    },
  });
  ```
- **Bypass Exclusivo para Cargo 'Dev':** O **único** cargo com permissão de moderação e privilégios administrativos no sistema é o cargo **`Dev`**. A verificação de bypass deve ser explícita via helper padronizado `isDevUser(user)`:
  ```typescript
  const isAuthor = registro.authorId === user.discordId;
  const isDev = (user.roles || []).some(
    (role) => (typeof role === 'string' ? role : role?.name)?.toLowerCase() === 'dev' ||
              (typeof role === 'string' ? role : role?.name) === 'Dev'
  );

  if (!isAuthor && !isDev) {
    throw new ForbiddenException('Apenas o autor original ou desenvolvedores (Dev) possuem permissão para esta ação.');
  }
  ```

---

## 3. Projeção Estrita de Dados (Data Leak Prevention)

- **Proibição de `include` Aberto em Entidades Sensíveis:** NUNCA utilize `include: { ... }` sem filtro em entidades que possuam dados privados (como `User`, `Account`, `Connection`).
- **Uso Obrigatório de `select` Cirúrgico:** Toda consulta que retorne dados de autores ou perfis para o cliente HTTP DEVE especificar exatamente as colunas públicas necessárias:
  ```typescript
  author: {
    select: {
      id: true,
      username: true,
      globalName: true,
      avatarUrl: true,
      roles: {
        select: {
          name: true,
        },
      },
    },
  }
  ```
- **Campos Confidenciais Bloqueados:** E-mails, tokens de terceiros (Steam API Key, tokens OAuth2, refresh tokens do Discord), senhas ou segredos internos NUNCA devem ser projetados em payloads públicos.

---

## 4. Controle Estrito de Autoria e Autenticação

- **Proibição de Spoofing via Body:** É expressamente proibido aceitar `authorId`, `userId` ou `discordId` no `@Body()` de requisições autenticadas para definir autoria de posts, comentários ou eventos.
- **Extração do Contexto JWT:** A identidade do autor DEVE ser extraída diretamente do objeto do Passport injetado na requisição:
  ```typescript
  // No Controller:
  @Post('create')
  @UseGuards(JwtAuthGuard)
  createPost(@Body() dto: CreatePostDto, @Req() req: AuthenticatedRequest) {
    return this.postagensService.createPost(req.user.discordId, dto);
  }
  ```

---

## 5. Práticas de Upload e Servimento Estático

- **Validação no Multer:** Todo upload de arquivo DEVE conter `fileFilter` com whitelist estrita de MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) e extensões seguras.
- **Teto de Tamanho:** Limite rígido de no máximo 5MB por arquivo (`fileSize: 5 * 1024 * 1024`).
- **Nomes em Disco:** Arquivos salvos em disco devem possuir nomes gerados aleatoriamente (`timestamp + random suffix + safe extension`) para prevenir path traversal e substituição de arquivos.

---

## 6. Padronização de Logs e Tratamento de Erros

- **Proibição de PII em Logs:** NUNCA logar payloads contendo e-mails, tokens JWT completos ou credenciais no terminal ou em agregadores de logs.
- **Tratamento de Exceções:** Erros de banco ou bibliotecas devem ser registrados com `this.logger.error('Contexto do erro', error)` (passando o erro como objeto, nunca como string concatenada ou `console.error` dentro de template literals).
- **Status Codes Precisos:**
  - `400 Bad Request`: Parâmetros inválidos, validações de DTO ou regras de consistência temporal.
  - `401 Unauthorized`: Ausência de token JWT válido ou chave de API ausente.
  - `403 Forbidden`: Usuário autenticado tentando acessar/modificar recurso de outro membro sem a role `Dev`.
  - `404 Not Found`: Recurso não localizado no banco de dados.
  - `500 Internal Server Error`: Falhas inesperadas de infraestrutura ou conexão com o PostgreSQL.

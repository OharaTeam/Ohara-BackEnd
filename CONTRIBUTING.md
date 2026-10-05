# Guia de Contribuição - OharaBack-End

Obrigado por contribuir com o ecossistema **Ohara**! Este documento orienta o processo de desenvolvimento colaborativo, padrões de código, fluxo de trabalho no Git e submissão de Pull Requests.

---

## 🚀 1. Configuração do Ambiente Local

### Pré-requisitos
* **Node.js** >= 22 ou **Bun** >= 1.1 (recomendado para maior velocidade)
* **Docker** e **Docker Compose**
* **Git**

### Passo a Passo de Inicialização

1. **Clone o repositório e acerte a branch**:
   ```bash
   git clone https://github.com/OharaTeam/Ohara-BackEnd.git
   cd Ohara-BackEnd
   ```

2. **Instale as dependências**:
   ```bash
   bun install
   # ou: npm install
   ```

3. **Configure as variáveis de ambiente**:
   ```bash
   cp .env.example .env
   ```
   *Edite o arquivo `.env` preenchendo as credenciais necessárias.*

4. **Inicie o Banco de Dados (PostgreSQL via Docker)**:
   ```bash
   docker compose up -d postgres
   ```

5. **Execute as Migrações e Gere o Prisma Client**:
   ```bash
   bunx prisma migrate dev
   bunx prisma generate
   ```

6. **Inicie o Servidor em Modo Desenvolvimento**:
   ```bash
   bun run start:dev
   ```
   *A API estará acessível em `http://localhost:3000` e o Swagger em `http://localhost:3000/api-docs`.*

---

## 🌿 2. Estratégia de Branches

Adotamos uma abordagem baseada em branches de tópicos curtos:

* `main`: Código de produção estável.
* Branches de desenvolvimento devem seguir o padrão:
  * `feat/<nome-da-tarefa>`: Novas funcionalidades (ex: `feat/comentarios-feed`)
  * `fix/<nome-do-bug>`: Correções de bugs (ex: `fix/tratamento-token-expirado`)
  * `docs/<nome-da-doc>`: Documentação e contratos OpenAPI (ex: `docs/swagger-rotas-users`)
  * `refactor/<nome-do-modulo>`: Refatorações sem alteração de comportamento externo
  * `test/<nome-do-teste>`: Adição ou melhoria de suítes de testes

---

## 📝 3. Padrão de Commits (Conventional Commits)

Todas as mensagens de commit devem seguir a convenção [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/):

```
<tipo>(<escopo>): <descrição curta no imperativo>

[corpo opcional detalhando o motivo da alteração]

[rodapé opcional com referências a issues: Closes #123]
```

### Tipos Permitidos
* `feat`: Nova funcionalidade para o usuário ou API
* `fix`: Correção de bug
* `docs`: Alterações apenas em documentação ou Swagger
* `refactor`: Refatoração de código que não altera funcionalidade
* `test`: Adição ou ajuste de testes
* `chore`: Mudanças em build, ferramentas auxiliares ou dependências
* `perf`: Melhoria de desempenho

### Exemplos Válidos
* `feat(postagens): implementar endpoint para criar comentarios`
* `fix(auth): tratar erro quando token discord expira durante exchange`
* `docs(swagger): documentar novos esquemas de retorno do modulo users`

---

## 🏛️ 4. Padrões de Código e Boas Práticas

1. **Arquitetura NestJS**:
   * **Controllers**: Mantêm-se enxutos. Devem apenas receber a requisição, aplicar decorators (`@UseGuards`, `@ApiOperation`, etc.) e delegar para o Service.
   * **Services**: Contêm as regras de negócio e orquestração de transações do banco.
   * **DTOs**: Todo endpoint com corpo (`@Body`), query (`@Query`) ou rota (`@Param`) deve possuir DTO com validações do `class-validator` e documentação `@ApiProperty` / `@ApiPropertyOptional`.
2. **Documentação Swagger Obrigatória**:
   * Qualquer nova rota precisa conter `@ApiOperation`, `@ApiResponse` e a tag do módulo correspondente (`@ApiTags`).
3. **Segurança**:
   * Endpoints de bot devem obrigatoriamente usar `@UseGuards(BotKeyGuard)` e `@ApiSecurity('BOT_KEY')`.
   * Endpoints autenticados de usuário devem usar `@UseGuards(JwtAuthGuard)` e `@ApiBearerAuth()`.
   * Nunca faça commit de tokens, senhas ou arquivos `.env` preenchidos.
4. **Logs e Observabilidade**:
   * Utilize `private readonly logger = new Logger(NomeDaClasse.name)` ao invés de `console.log`.

---

## 🔄 5. Processo de Submissão de Pull Request (PR)

Antes de abrir um Pull Request:

1. **Atualize sua branch**:
   ```bash
   git checkout main
   git pull origin main
   git checkout sua-branch
   git rebase main
   ```

2. **Verifique se o build e os linters passam**:
   ```bash
   bun run lint
   bun run build
   ```

3. **Abra o Pull Request**:
   * Preencha o template de PR detalhando o que foi feito.
   * Vincule a Issue do Roadmap correspondente usando palavras-chave (`Closes #12` ou `Resolves #15`).
   * Solicite a revisão de ao menos um mantenedor do projeto.

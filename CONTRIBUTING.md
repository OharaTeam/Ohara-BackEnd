# Guia de Contribuição - OharaBack-End

Obrigado por contribuir com o ecossistema **Ohara**! Este documento orienta o processo de desenvolvimento colaborativo, padrões de código, fluxo de trabalho no Git, ciclo de vida das tarefas no GitHub Projects e submissão de Pull Requests.

---

## 🚀 1. Configuração do Ambiente Local

### Pré-requisitos
* **Node.js** >= 22 ou **Bun** >= 1.1 (recomendado para maior velocidade)
* **Docker** e **Docker Compose**
* **Git** e **GitHub CLI (`gh`)**

### Passo a Passo de Inicialização

1. **Clone o repositório**:
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

## 🧭 2. Guia de Início Rápido para Iniciantes (Do Card ao PR)

Se você é novo no projeto ou está pegando sua primeira tarefa, siga este fluxo passo a passo:

```
[GitHub Projects: Escolher Card] 
              │
              ▼
[Atribuir-se à Issue (Assignee)] ──► Mover card para "In Progress"
              │
              ▼
[Criar Branch Higienizada (sem caracteres especiais)]
              │
              ▼
[Codificar & Testar Localmente] ──► Conventional Commits
              │
              ▼
[Abrir Pull Request] ──► Mover card para "In Review"
              │
              ▼
[Revisão & Aprovação Manual por Mantenedor] ──► Merge na main ──► Card "Done"
```

### Passo 1: Acessar o GitHub Projects e Escolher uma Tarefa
1. Acesse o quadro oficial: [**Ohara Back-End - Roadmap & Sprint**](https://github.com/orgs/OharaTeam/projects/1).
2. Verifique a coluna **Todo**.
3. As tarefas possuem labels com ordem de prioridade. Dê preferência às tarefas mais urgentes:
   * 🔴 `priority: p1-alta`: Prioridade máxima para o marco atual.
   * 🟡 `priority: p2-media`: Prioridade padrão de continuidade.
   * 🟢 `priority: p3-baixa`: Melhorias incrementais e complementares.

### Passo 2: Atribuir-se à Issue (Assignee)
* **Regra Obrigatória**: Antes de começar qualquer linha de código, abra a issue e clique em **Assign yourself** (ou solicite a atribuição a um mantenedor).
* **Nunca** inicie o desenvolvimento de uma issue que já tenha outro desenvolvedor atribuído sem antes combinar com ele.
* No board do Projects, arraste o card correspondente da coluna **Todo** para **In Progress**.

### Passo 3: Criar a Branch a partir da Issue
Você pode clicar em **"Create a branch"** dentro da própria issue no GitHub ou criá-la diretamente pelo terminal:

```bash
git checkout main
git pull origin main
git checkout -b feat/1-comentarios-postagens
```

> [!CAUTION]
> ### ⚠️ ALERTA CRÍTICO: Sanitização de Nomes de Branch (Evite Bugs no Git e GitHub)
> Ao criar uma branch a partir de uma issue, o GitHub costuma sugerir o título completo da issue, incluindo acentos, parênteses, dois-pontos ou cedilhas.
> 
> **Você DEVE obrigatoriamente remover qualquer caractere especial, acentuação, parênteses ou espaço do nome da branch!**
> 
> **Por que isso é perigoso?**
> * Acentuações (`ã`, `ç`, `é`, `ó`) causam inconsistências de codificação de caracteres entre Windows, macOS e Linux.
> * Parênteses `()` e dois-pontos `:` quebram scripts de shell, comandos do Git CLI e geram URLs corrompidas no GitHub.
> * Nomes com caracteres especiais causam falhas graves em montagens de volumes no Docker e em pipelines de CI.
> 
> **Padrão Obrigatório**: Use **APENAS** letras minúsculas (`a-z`), números (`0-9`) e hífens (`-`).
> 
> * ❌ **ERRADO**: `feat/1-feat(comentários):-implementar-dtos`
> * ❌ **ERRADO**: `1-criação-de-ações-para-eventos`
> * ❌ **ERRADO**: `feat/joão-silva/módulo-eventos`
> * ❌ **ERRADO**: `fix/bug-autenticação-usuário()`
> * ✅ **CORRETO**: `feat/1-comentarios-postagens`
> * ✅ **CORRETO**: `feat/4-modulo-eventos`
> * ✅ **CORRETO**: `test/7-unit-auth-guards`
> * ✅ **CORRETO**: `fix/12-jwt-token-expirado`

### Passo 4: Desenvolver e Commitar
* Siga o padrão de [Conventional Commits](#-4-padrão-de-commits-conventional-commits).
* Rode `bun run lint` e `bun run build` para garantir que o código compila perfeitamente antes de subir.

### Passo 5: Abrir o Pull Request e Atualizar o Projects
1. Envie sua branch para o GitHub:
   ```bash
   git push -u origin feat/1-comentarios-postagens
   ```
2. Abra um Pull Request apontando para a branch `main`.
3. No corpo do PR, vincule a issue para fechamento automático:
   ```markdown
   Closes #1
   ```
4. No quadro do GitHub Projects, mova o card da tarefa para a coluna **In Review**.

---

## 🔒 3. Governança e Regra de Aprovação Manual da `main`

> [!IMPORTANT]
> **Tudo o que vai para a branch `main` DEVE ser autorizado e revisado manualmente.**
> * Nenhum workflow de automação (GitHub Actions, bots ou scripts de CI) está autorizado a realizar auto-merge ou deploy automático na branch `main`.
> * Os workflows de CI funcionam unicamente como **verificadores de qualidade (status checks)** para rodar linter, compilação e suíte de testes.
> * O merge na branch `main` só poderá ser executado após a revisão e **aprovação manual explícita de um mantenedor do projeto**.

---

## 🌿 4. Estratégia de Branches

Adotamos branches curtas baseadas em tarefas:

* `main`: Código de produção estável e protegido.
* Branches de tarefas devem seguir o prefixo semântico e o nome higienizado:
  * `feat/<numero>-<nome-da-tarefa>`: Novas funcionalidades (ex: `feat/1-comentarios-postagens`)
  * `fix/<numero>-<nome-do-bug>`: Correções de bugs (ex: `fix/12-jwt-token-expirado`)
  * `docs/<numero>-<nome-da-doc>`: Documentação e OpenAPI (ex: `docs/swagger-rotas-users`)
  * `refactor/<numero>-<nome>`: Refatorações de código sem alteração funcional
  * `test/<numero>-<nome-do-teste>`: Adição ou melhoria de suítes de testes

---

## 📝 5. Padrão de Commits (Conventional Commits)

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
* `feat(comentarios): implementar endpoint para criar comentarios`
* `fix(auth): tratar erro quando token discord expira durante exchange`
* `docs(swagger): documentar novos esquemas de retorno do modulo users`

---

## 🏛️ 6. Padrões de Código e Boas Práticas

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

## 🔄 7. Processo de Submissão e Revisão de Pull Request (PR)

Antes de abrir um Pull Request:

1. **Atualize sua branch com a `main`**:
   ```bash
   git checkout main
   git pull origin main
   git checkout sua-branch
   git merge main
   ```

2. **Verifique se o build e os linters passam**:
   ```bash
   bun run lint
   bun run build
   ```

3. **Abra o Pull Request**:
   * Preencha todos os campos do template de PR (`.github/pull_request_template.md`).
   * Vincule a Issue do Roadmap correspondente usando palavras-chave (`Closes #1` ou `Resolves #4`).
   * Solicite a revisão de ao menos um mantenedor do projeto.
   * O mantenedor revisará o código, validará os testes e fará o merge manual para a branch `main`.

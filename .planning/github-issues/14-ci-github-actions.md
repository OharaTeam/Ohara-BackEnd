### 📌 Contexto e Justificativa
Para que a equipe trabalhe com segurança em branches simultâneas, precisamos de um pipeline automatizado de Integração Contínua (CI) que valide formatação, linter, testes e compilação a cada Pull Request aberto contra a branch `main`.

> [!IMPORTANT]
> **Regra de Governança**: Este workflow tem papel estritamente consultivo e de validação de qualidade (Status Check). Ele **NÃO** deve realizar auto-merge nem auto-deploy para a branch `main`. Qualquer merge para a `main` exige revisão de código e aprovação manual de um mantenedor do projeto.

### 🎯 O que deve ser feito
1. Criar o workflow `.github/workflows/ci.yml`.
2. O workflow deve rodar como trigger de verificação nos eventos:
   * `pull_request` contra a branch `main`.
3. Etapas do pipeline:
   * Setup do Bun / Node.js
   * Cache de dependências
   * `bun install --frozen-lockfile`
   * `bunx prisma generate`
   * `bun run lint`
   * `bun run build`
   * `bun run test`

### 📂 Arquivos Afetados
* `.github/workflows/ci.yml`

### ✅ Critérios de Aceite (Definition of Done)
- [ ] Pipeline executa com sucesso em Pull Requests abertos contra a `main`
- [ ] PRs com erro de compilação ou linter têm status "Check failed"
- [ ] O pipeline não realiza nenhum deploy ou merge automático; o merge permanece 100% manual

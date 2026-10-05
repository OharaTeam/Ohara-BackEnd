---
title: "ci(actions): configurar pipeline de integração contínua (CI) no GitHub Actions"
labels: ["task", "devops", "ci/cd"]
milestone: "Fase 5: Observabilidade & CI/CD"
---

### 📌 Contexto e Justificativa
Para que a equipe trabalhe com segurança em branches simultâneas, precisamos de um pipeline automatizado que valide formatação, linter, testes e build a cada Pull Request aberto contra a branch `main`.

### 🎯 O que deve ser feito
1. Criar o workflow `.github/workflows/ci.yml`.
2. O workflow deve rodar nos eventos:
   * `pull_request` contra a branch `main`
   * `push` na branch `main`
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
- [ ] Pipeline executa com sucesso em PRs
- [ ] PRs com erro de compilação ou linter têm status "Check failed" impedindo o merge

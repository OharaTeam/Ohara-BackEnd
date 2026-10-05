#!/usr/bin/env bash

# ==============================================================================
# Script de Automação: Criação de Issues no GitHub a partir do Roadmap
# ==============================================================================
# Pré-requisito: GitHub CLI instalado e autenticado (`gh auth login`).
# Uso: bash scripts/create-github-issues.sh
# ==============================================================================

set -e

echo "🔍 Verificando GitHub CLI (gh)..."
if ! command -v gh &> /dev/null; then
    echo "❌ Erro: O utilitário 'gh' (GitHub CLI) não foi encontrado no PATH."
    echo "Instale via: https://cli.github.com/ ou 'sudo apt install gh'"
    exit 1
fi

echo "🔐 Verificando autenticação no GitHub..."
if ! gh auth status &> /dev/null; then
    echo "❌ Erro: Você precisa autenticar no GitHub CLI primeiro."
    echo "Execute: gh auth login"
    exit 1
fi

ISSUES_DIR=".planning/github-issues"

if [ ! -d "$ISSUES_DIR" ]; then
    echo "❌ Diretório $ISSUES_DIR não encontrado!"
    exit 1
fi

echo "🚀 Iniciando criação das issues do Roadmap no repositório..."

# 1. Comentários
gh issue create \
  --title "feat(comentarios): implementar DTOs e endpoints de comentários em postagens" \
  --label "task,backend,enhancement" \
  --body-file "$ISSUES_DIR/01-feat-comentarios.md"

# 2. Eventos
gh issue create \
  --title "feat(eventos): criar módulo de gestão de eventos da comunidade Ohara" \
  --label "task,backend,enhancement" \
  --body-file "$ISSUES_DIR/02-feat-eventos.md"

# 3. Minecraft & Cobblemon
gh issue create \
  --title "feat(minecraft): implementar vinculação de contas Minecraft e histórico de pokémons" \
  --label "task,backend,enhancement" \
  --body-file "$ISSUES_DIR/03-feat-minecraft-cobblemon.md"

# 4. Testes Unitários
gh issue create \
  --title "test(unit): implementar suíte de testes unitários para Services e Guards" \
  --label "task,backend,testing" \
  --body-file "$ISSUES_DIR/04-test-unit-services-guards.md"

# 5. Testes E2E
gh issue create \
  --title "test(e2e): criar testes de integração ponta a ponta para fluxos principais" \
  --label "task,backend,testing" \
  --body-file "$ISSUES_DIR/05-test-e2e-fluxos-principais.md"

# 6. Revogação de JWT (Blacklist)
gh issue create \
  --title "feat(security): implementar revogação e blacklist de tokens JWT no logout" \
  --label "task,backend,security" \
  --body-file "$ISSUES_DIR/06-feat-security-jwt-blacklist.md"

# 7. GitHub Actions CI
gh issue create \
  --title "ci(actions): configurar pipeline de integração contínua (CI) no GitHub Actions" \
  --label "task,devops,ci/cd" \
  --body-file "$ISSUES_DIR/07-ci-github-actions.md"

# 8. Interceptor de Erros e Logs
gh issue create \
  --title "feat(observability): implementar interceptor global de erros e logging estruturado" \
  --label "task,backend,observability" \
  --body-file "$ISSUES_DIR/08-feat-observability-interceptor.md"

# 9. Healthcheck com Terminus
gh issue create \
  --title "feat(health): implementar endpoint robusto de monitoramento com @nestjs/terminus" \
  --label "task,backend,observability" \
  --body-file "$ISSUES_DIR/09-feat-healthcheck-terminus.md"

echo "✨ Todas as 9 issues do Roadmap foram cadastradas com sucesso no GitHub!"

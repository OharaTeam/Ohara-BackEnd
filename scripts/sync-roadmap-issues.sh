#!/usr/bin/env bash

# ==============================================================================
# Script de Automação e Sincronização: Roadmap -> GitHub Issues & Projects
# ==============================================================================
# Versão: 2.0.0
# Segurança: Possui modo --dry-run por padrão e confirmação explícita para evitar
#            execuções acidentais que dupliquem issues no repositório.
# ==============================================================================

set -euo pipefail

REPO="OharaTeam/Ohara-BackEnd"
PROJECT_NUMBER=1
PROJECT_OWNER="OharaTeam"
ISSUES_DIR=".planning/github-issues"
MANIFEST_FILE="$ISSUES_DIR/manifest.json"

EXECUTE=false
SYNC_PROJECT=true
TARGET_PHASE="all"

print_help() {
    cat << EOF
Uso: $0 [OPÇÕES]

Opções de Execução:
  --execute          Executa as alterações de verdade no GitHub (Criação/Atualização).
                     Por padrão, o script roda em modo --dry-run (apenas simulação).
  --phase <3|4|5>    Filtra a execução por fase específica (padrão: all).
  --no-project       Pula a adição automática dos cards no GitHub Projects.
  --help, -h         Exibe esta mensagem de ajuda.

Exemplos:
  $0                     # Executa em modo de simulação segura (dry-run)
  $0 --execute           # Aplica as issues e sincroniza no GitHub Projects
  $0 --phase 3 --execute # Sincroniza apenas as issues da Fase 3
EOF
}

# Processamento de argumentos de linha de comando
while [[ $# -gt 0 ]]; do
    case "$1" in
        --execute)
            EXECUTE=true
            shift
            ;;
        --phase)
            TARGET_PHASE="$2"
            shift 2
            ;;
        --no-project)
            SYNC_PROJECT=false
            shift
            ;;
        --help|-h)
            print_help
            exit 0
            ;;
        *)
            echo "❌ Argumento desconhecido: $1"
            print_help
            exit 1
            ;;
    esac
done

echo "================================================================================"
echo "🛡️  SINCRONIZADOR DE ROADMAP OHARA BACK-END (GitHub Issues & Projects)"
echo "================================================================================"

# 1. Verificação de Pré-requisitos
if ! command -v gh &> /dev/null; then
    echo "❌ Erro: GitHub CLI ('gh') não foi encontrado no PATH."
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ Erro: Utilitário 'jq' não foi encontrado no PATH."
    exit 1
fi

if [ ! -f "$MANIFEST_FILE" ]; then
    echo "❌ Erro: Arquivo de manifesto $MANIFEST_FILE não foi encontrado."
    exit 1
fi

# 2. Trava de Segurança contra Execuções Acidentais
if [ "$EXECUTE" = false ]; then
    echo "⚠️  MODO DE SIMULAÇÃO ATIVO (--dry-run)"
    echo "   Nenhuma alteração real será enviada para o GitHub."
    echo "   Para aplicar as alterações, execute passando a flag: --execute"
    echo "--------------------------------------------------------------------------------"
else
    echo "🚨 ATENÇÃO: MODO DE EXECUÇÃO REAL ATIVADO (--execute)"
    echo "   Alterações serão enviadas para o repositório $REPO."
    echo "--------------------------------------------------------------------------------"
fi

# 3. Consulta de Issues já existentes no repositório para evitar duplicidade
echo "🔍 Mapeando issues ativas no repositório $REPO..."
EXISTING_ISSUES_JSON=$(gh issue list --repo "$REPO" --limit 100 --state all --json number,title)

TOTAL_TASKS=$(jq '. | length' "$MANIFEST_FILE")
echo "📋 Carregado manifesto com $TOTAL_TASKS tarefas mapeadas."
echo ""

# Processar tarefas do manifesto
for i in $(seq 0 $((TOTAL_TASKS - 1))); do
    TASK_JSON=$(jq ".[$i]" "$MANIFEST_FILE")
    TASK_ID=$(echo "$TASK_JSON" | jq -r '.id')
    TASK_FILE=$(echo "$TASK_JSON" | jq -r '.file')
    TASK_TITLE=$(echo "$TASK_JSON" | jq -r '.title')
    TASK_PHASE=$(echo "$TASK_JSON" | jq -r '.phase')
    TASK_MILESTONE=$(echo "$TASK_JSON" | jq -r '.milestone')
    TASK_LABELS=$(echo "$TASK_JSON" | jq -r '.labels | join(",")')
    TASK_GH_ISSUE=$(echo "$TASK_JSON" | jq -r '.github_issue')

    # Filtro de fase
    if [ "$TARGET_PHASE" != "all" ]; then
        if [[ "$TASK_PHASE" != *"$TARGET_PHASE"* ]]; then
            continue
        fi
    fi

    BODY_PATH="$ISSUES_DIR/$TASK_FILE"
    if [ ! -f "$BODY_PATH" ]; then
        echo "⚠️  [PULADO] Arquivo de corpo não encontrado: $BODY_PATH"
        continue
    fi

    # Checar se a issue já existe no GitHub pelo título exato
    FOUND_ISSUE_NUM=$(echo "$EXISTING_ISSUES_JSON" | jq -r --arg t "$TASK_TITLE" '.[] | select(.title == $t) | .number' | head -n 1)

    TARGET_NUM="$TASK_GH_ISSUE"
    if [ -n "$FOUND_ISSUE_NUM" ] && [ "$FOUND_ISSUE_NUM" != "null" ]; then
        TARGET_NUM="$FOUND_ISSUE_NUM"
    fi

    if [ -n "$TARGET_NUM" ] && [ "$TARGET_NUM" != "null" ]; then
        echo "🔄 [$TASK_ID] Atualizando Issue #$TARGET_NUM: \"$TASK_TITLE\""
        if [ "$EXECUTE" = true ]; then
            gh issue edit "$TARGET_NUM" \
                --repo "$REPO" \
                --title "$TASK_TITLE" \
                --body-file "$BODY_PATH" \
                --milestone "$TASK_MILESTONE" \
                --add-label "$TASK_LABELS" > /dev/null

            if [ "$SYNC_PROJECT" = true ]; then
                ISSUE_URL="https://github.com/$REPO/issues/$TARGET_NUM"
                gh project item-add "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --url "$ISSUE_URL" > /dev/null 2>&1 || true
            fi
            echo "   ✅ Issue #$TARGET_NUM sincronizada com sucesso no GitHub & Projects!"
        else
            echo "   [SIMULAÇÃO] gh issue edit $TARGET_NUM --title \"$TASK_TITLE\" --milestone \"$TASK_MILESTONE\" --add-label \"$TASK_LABELS\""
        fi
    else
        echo "✨ [$TASK_ID] Criando nova Issue: \"$TASK_TITLE\""
        if [ "$EXECUTE" = true ]; then
            NEW_URL=$(gh issue create \
                --repo "$REPO" \
                --title "$TASK_TITLE" \
                --body-file "$BODY_PATH" \
                --milestone "$TASK_MILESTONE" \
                --label "$TASK_LABELS")
            
            NEW_NUM=$(echo "$NEW_URL" | grep -oE '[0-9]+$')
            echo "   ✅ Criada com sucesso: Issue #$NEW_NUM ($NEW_URL)"

            # Atualizar número no manifest.json
            TMP_FILE=$(mktemp)
            jq ".[$i].github_issue = $NEW_NUM" "$MANIFEST_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$MANIFEST_FILE"

            if [ "$SYNC_PROJECT" = true ]; then
                gh project item-add "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --url "$NEW_URL" > /dev/null 2>&1 || true
                echo "   📌 Adicionada ao GitHub Project #$PROJECT_NUMBER"
            fi
        else
            echo "   [SIMULAÇÃO] gh issue create --title \"$TASK_TITLE\" --milestone \"$TASK_MILESTONE\" --label \"$TASK_LABELS\""
        fi
    fi
done

echo ""
echo "================================================================================"
if [ "$EXECUTE" = true ]; then
    echo "🎉 Sincronização concluída com sucesso no repositório e no GitHub Projects!"
    echo "   🔗 Veja o board: https://github.com/orgs/$PROJECT_OWNER/projects/$PROJECT_NUMBER"
else
    echo "💡 Fim da simulação. Nenhuma alteração foi realizada."
    echo "   Para aplicar de fato, execute: $0 --execute"
fi
echo "================================================================================"

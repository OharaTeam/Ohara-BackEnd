## 📋 Descrição das Mudanças
<!-- Descreva de forma clara e concisa o que este Pull Request introduz ou corrige. -->

## 🔗 Issue Relacionada
<!-- Vincule a issue do Roadmap correspondente. Ex: Closes #12 ou Resolves #45 -->
Closes #

## 🏷️ Tipo de Mudança
- [ ] 🚀 `feat`: Nova funcionalidade
- [ ] 🐛 `fix`: Correção de bug
- [ ] 📝 `docs`: Alteração em documentação ou Swagger
- [ ] ♻️ `refactor`: Refatoração sem mudança funcional
- [ ] 🧪 `test`: Adição ou ajuste de testes
- [ ] 🔧 `chore`: Atualização de dependências ou build

## 🧪 Como foi Testado?
<!-- Descreva os passos para testar localmente ou anexe evidências (logs, Swagger, Postman) -->

## ✅ Checklist de Qualidade
- [ ] O código compila sem erros (`bun run build` ou `npm run build`)
- [ ] O linter e formatação passam sem erros (`bun run lint`)
- [ ] Todos os novos endpoints possuem decorators do Swagger (`@ApiOperation`, `@ApiResponse`, etc.)
- [ ] DTOs incluem validações com `class-validator` e `@ApiProperty`
- [ ] Se novas variáveis de ambiente foram adicionadas, o arquivo `.env.example` foi atualizado
- [ ] Não há secrets, senhas ou tokens comitados no código

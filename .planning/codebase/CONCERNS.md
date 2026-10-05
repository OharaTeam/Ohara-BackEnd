# Preocupações Técnicas & Áreas de Melhoria

## 1. Bugs & Problemas de Qualidade de Código

### `console.error` Dentro de Interpolação de String do Logger
- **Localizações:**
  - `src/membros/membros.service.ts` (Linha 57)
  - `src/cargos/cargos.service.ts` (Linha 41)
- **Problema:**
  ```typescript
  this.logger.warn(`Erro ao sincronizar membros: ${console.error(error)}`);
  ```
  `console.error()` retorna `undefined`, o que produz `"Erro ao sincronizar membros: undefined"` em agregadores de logs, enquanto imprime diretamente no stderr bruto sem formatação estruturada.
- **Correção:** Passar `error` como segundo parâmetro:
  ```typescript
  this.logger.error('Erro ao sincronizar membros:', error);
  ```

### Erro de Digitação no Schema & DTO (`tittle`)
- **Localizações:**
  - `prisma/schema.prisma` (Linha 169: `tittle String @unique`)
  - `src/postagens/dto/create-post.dto.ts` (Linha 10)
  - `src/postagens/postagens.service.ts` (Múltiplas ocorrências)
- **Problema:** A propriedade e coluna está grafada como `tittle` em vez de `title`.
- **Correção:** Planejar uma migration do Prisma para renomear a coluna no PostgreSQL para `title`, mantendo compatibilidade mapeada com versões anteriores ou coordenando com o frontend.

---

## 2. Implementações de Schema Incompletas

Os seguintes models estão declarados em `prisma/schema.prisma`, mas **não possuem controllers, services ou modules correspondentes** em `src/`:
- `OharaEventos`: Definições de eventos (COBBLEMON / OUTRO).
- `PokemonsCapturados`: Log de capturas Cobblemon.
- `ContaMinecraft`: Vínculo de UUID e username de jogadores de Minecraft.
- `Comment`: Comentários nas postagens da comunidade.

*Impacto:* Quaisquer dados armazenados ou planejados para essas tabelas não podem ser gerenciados atualmente através da API REST.

---

## 3. Armadilhas de Escalabilidade & Performance

### Paginação e Ordenação de Membros em Memória
- **Localização:** `src/membros/membros.service.ts` (`findAll`)
- **Problema:** O método consulta todos os usuários não-Dev de todo o banco de dados, ordena-os na memória do processo Node.js utilizando `sort()` e `localeCompare()` do JavaScript, cria um array de IDs em memória, aplica o slice para paginação e consulta o banco uma segunda vez com `WHERE id IN (...)`.
- **Risco:** Conforme o servidor do Discord crescer além de milhares de membros, isso resultará em alta latência, consumo severo de memória e potencial bloqueio do event loop.
- **Correção:** Implementar a ordenação a nível de banco de dados utilizando expressões SQL, ordenação por relacionamentos do Prisma ou uma database view.

### Full-Table Scan Não-Indexado na Limpeza de Arquivos Órfãos
- **Localização:** `src/postagens/cleanup.service.ts` (`handleCron`)
- **Problema:**
  ```sql
  SELECT 1 FROM "Posts" WHERE content LIKE '%file%' OR media::text LIKE '%file%' LIMIT 1
  ```
  Executa uma busca `LIKE` com wildcard em texto e JSON serializado como string para cada arquivo em disco com mais de 24 horas.
- **Risco:** Realiza scan sequencial em toda a tabela `Posts`. Além disso, se o nome de um arquivo for uma string curta ou um número comum, pode coincidir com textos não relacionados no conteúdo da postagem.

---

## 4. Riscos de Infraestrutura & Armazenamento Efêmero

### Armazenamento Local em Disco para Uploads
- **Localização:** `src/postagens/postagens.controller.ts` (Multer `diskStorage` em `./uploads/images`)
- **Problema:** Arquivos enviados são gravados diretamente no disco local.
- **Risco:**
  - Em hospedagens serverless (ex: Vercel, mencionada no `README.md` e na configuração de CORS), o filesystem é somente leitura ou efêmero (arquivos são excluídos quando instâncias lambda são desligadas).
  - Em deploys multi-instância ou containerizados, arquivos salvos em um container não podem ser servidos por outro.
- **Correção:** Implementar um serviço de cloud object storage compatível com S3 (ex: AWS S3, Cloudflare R2, Supabase Storage).

---

## 5. Preocupações de Segurança & Autenticação

### Tokens JWT de Longa Duração Sem Revogação
- **Localização:** `src/auth/auth.module.ts` (`expiresIn: '7d'`) & `src/auth/auth.controller.ts` (`logout`)
- **Problema:** Tokens JWT permanecem válidos por 7 dias. Como o `logout` não mantém uma blacklist server-side ou um store de revogação de tokens, um token comprometido não pode ser invalidado antes da sua expiração.
- **Correção:** Implementar rotação de refresh tokens com access tokens de duração mais curta (ex: 15m) e armazenamento de refresh tokens em Redis ou banco de dados.

### Configurações Hardcoded no Código-Fonte
- **Localização:** `src/main.ts`: array de origens do CORS contém URLs específicas hardcoded.
- **Correção:** Ler as origens permitidas dinamicamente a partir de uma variável de ambiente (ex: `CORS_ORIGINS`).

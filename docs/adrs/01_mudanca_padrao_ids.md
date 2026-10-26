# ADR 01: Migração de Identificadores Públicos de UUIDv4 para NanoID

- **Status:** Aceito e Implementado
- **Data:** 2026-10-25
- **Decisores:** Jean Caetano ([@Jeancaetano12](https://github.com/Jeancaetano12))
- **Branch:** `fix/ajustes-imediatos-seguranca`

---

## 1. Contexto e Problema

Anteriormente, o sistema utilizava **UUIDv4** (36 caracteres hexadecimais com hífens) como identificador primário para entidades públicas da plataforma, tais como postagens (`Posts`), comentários (`Comentarios`) e eventos da comunidade (`OharaEventos`).

Embora o UUIDv4 garanta unicidade global e previna ataques de enumeração sequencial, ele introduziu problemas práticos para a experiência do usuário e arquitetura:
1. **URLs Excessivamente Extensas:** Rotas como `/pages/blog/123e4567-e89b-12d3-a456-426614174000` tornavam os links de divulgação no Discord e na web visualmente poluídos e difíceis de memorizar ou compartilhar.
2. **Desperdício de Espaço e Performance:** Em tabelas indexadas e referências cruzadas, strings de 36 caracteres consomem largura de banda desnecessária em requisições móveis e tráfego de rede.
3. **Inconsistência de Formato:** Perfis de usuário utilizam o snowflake nativo do Discord (`discordId`, ex: `123456789012345678`), enquanto o restante das rotas utilizava UUIDs.

Surgiu a necessidade de encurtar drasticamente esses identificadores públicos sem comprometer a entropia contra ataques de enumeração ou abrir brechas de IDOR (Insecure Direct Object References).

---

## 2. Opções Consideradas

1. **Hashids baseados em inteiros auto-incrementais (`id` SERIAL):**
   - *Prós:* Gera URLs curtas.
   - *Contras:* Depende de IDs sequenciais ocultos no banco; se o salt vazar, os IDs reais podem ser decodificados e enumerados; exigiria alteração estrutural no tipo de coluna no PostgreSQL (`text` para `bigint`).
2. **NanoID com Coexistência Híbrida (UUID + NanoID via fallback no código):**
   - *Prós:* Links antigos com UUID continuariam funcionando via cláusula condicional (`if isUuid`).
   - *Contras:* Gera dívida técnica e bifurcação de lógica em controllers, services e queries Prisma; complexidade desnecessária para um sistema com apenas um post publicado.
3. **NanoID com Corte Limpo (Opção A - Escolhida):**
   - *Prós:* Substituição completa e definitiva de UUIDv4 por NanoID de 10 caracteres alfanuméricos URL-safe; código limpo, pipes de validação rígidos e zero código legado; preservação do post existente via atualização pontual de banco.
   - *Contras:* Requer a migração pontual do post existente em produção.

---

## 3. Decisão de Arquitetura

Optou-se pela **Adoção de NanoID (10 caracteres URL-safe) com Corte Limpo (Opção A)** para todas as rotas e entidades públicas, com exceção deliberada do perfil de usuário:

### 3.1. Especificação do NanoID Adotado
- **Comprimento:** Exatamente 10 caracteres.
- **Alfabeto:** `A-Za-z0-9_-` (64 caracteres seguros para URL).
- **Entropia:** ~60 bits ($64^{10} \approx 1{,}15 \times 10^{18}$ combinações possíveis). Para a taxa de geração da aplicação, a probabilidade de colisão é negligenciável e impede completamente ataques de varredura ou adivinhação aleatória.
- **Expressão Regular de Validação:** `^[A-Za-z0-9_-]{10}$`.

### 3.2. Exceção do Perfil de Usuário
- As rotas de usuários (ex: `/users/:discordId`) **mantêm** o snowflake numérico do Discord como identificador único. Não há geração de NanoID para usuários, preservando a interoperabilidade direta com o ecossistema do Discord.

### 3.3. Implementação Técnica
1. **Biblioteca Oficial:** Instalação e uso da dependência `nanoid` (v6.x).
2. **Utilitário Centralizado:** Criado em `src/common/utils/nanoid.util.ts` exportando `generateNanoId()` e a constante `NANOID_REGEX`.
3. **Validação Estrita via Pipe:** Criado `ParseNanoIdPipe` em `src/common/pipes/parse-nanoid.pipe.ts`. O pipe valida os parâmetros de rota `:id` e `:commentId`, retornando `400 Bad Request` imediatamente caso o valor fornecido não atenda exatamente à regex de 10 caracteres (rejeitando automaticamente UUIDs legados).
4. **Schema Prisma:** Removida a diretiva `@default(uuid())` dos modelos `Post`, `Comment` e `OharaEventos` em `prisma/schema.prisma`. As colunas no banco permanecem como tipo nativo `text`.
5. **Geração na Camada de Serviço:** A geração do identificador passou a ser explícita no momento da criação dos registros em `postagens.service.ts` e `eventos.service.ts`:
   ```typescript
   id: generateNanoId()
   ```

---

## 4. Estratégia de Migração do Post Existente em Produção

O banco de dados em produção continha apenas **um post publicado** ("Teste", ID original: `62ba49d4-003a-45b5-98e3-b548e853e8b2`).

Para evitar scripts de migração redundantes a cada deploy ou hooks desnecessários no CI/CD, a normalização desse registro é realizada via **execução transacional única** diretamente no banco de dados de produção:

```sql
BEGIN;
UPDATE "Posts" 
SET id = 'xhFrIREl9K' 
WHERE tittle = 'Teste';
COMMIT;
```

### Garantia de Integridade Relacional
A tabela `Comentarios` já possui a constraint `Comentarios_postId_fkey` com `ON UPDATE CASCADE`. Portanto, ao atualizar a chave primária `Posts.id`, qualquer comentário associado tem sua chave estrangeira `postId` atualizada automaticamente pelo PostgreSQL na mesma transação.

---

## 5. Consequências

### Positivas
- **URLs Concisas e Limpas:** Acesso direto a postagens via links como `/pages/blog/xhFrIREl9K`.
- **Zero Dívida Técnica:** Sem verificações condicionais (`if isUuid`) nos serviços ou queries do Prisma.
- **Segurança Reforçada:** O `ParseNanoIdPipe` bloqueia requisições malformadas ou tentativas de injeção no parâmetro de rota antes de atingirem as camadas de serviço ou banco.
- **Padronização:** As diretrizes foram formalizadas no guia `.agents/api-dev.md` para garantir consistência em endpoints futuros.

### Negativas / Limitações Mitigadas
- **Invalidação de Links Legados:** Qualquer link externo apontando para o UUID antigo deixará de funcionar (retornando `400 Bad Request` pelo pipe). Como o único post existente foi mapeado de forma determinística para `xhFrIREl9K`, a equipe pôde atualizar os links pontuais sem impacto relevante.

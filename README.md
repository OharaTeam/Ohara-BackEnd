# OharaBack-End (NestJS)

O **OharaBack-End** é a API REST central desenvolvida em [NestJS](https://nestjs.com/) para o ecossistema **Ohara**. Este projeto atua como o núcleo de processamento e persistência de dados, orquestrando a comunicação entre o **Bot do Discord**, o **Frontend Web (Dashboard)** e o banco de dados relacional **PostgreSQL**.

📖 **Documentação Swagger (Local)**: http://localhost:3000/api-docs

---

## 🚀 Tecnologias Utilizadas

* **Framework**: [NestJS 11](https://nestjs.com/)
* **Runtime & Package Manager**: [Bun](https://bun.sh/) e Node.js
* **ORM**: [Prisma 7](https://www.prisma.io/) com PostgreSQL
* **Banco de Dados**: PostgreSQL (gerenciado via Docker Compose)
* **Autenticação**: Passport.js (Discord OAuth2, JWT e API Keys M2M)
* **Segurança**: Helmet e NestJS Throttler (rate limiting)
* **Validação**: Class-Validator e Class-Transformer
* **Integrações**: Steam Web API e Evolution API (WhatsApp)

---

## ⚡ Começando Rápido (Guia do Desenvolvedor)

### Pré-requisitos
* [Bun](https://bun.sh/) (recomendado) ou [Node.js](https://nodejs.org/) (versão >= 22)
* [Docker](https://www.docker.com/) e Docker Compose
* Git

### Passo a Passo

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/OharaTeam/Ohara-BackEnd.git
   cd Ohara-BackEnd
   ```

2. **Instale as dependências**:
   ```bash
   bun install
   ```

3. **Configure as variáveis de ambiente**:
   ```bash
   cp .env.example .env
   ```
   *Edite o arquivo `.env` preenchendo as chaves do Discord, banco e segurança.*

4. **Inicie o banco PostgreSQL via Docker**:
   ```bash
   docker compose up -d postgres
   ```

5. **Rode as migrações do Prisma**:
   ```bash
   bunx prisma migrate dev
   bunx prisma generate
   ```

6. **Inicie o servidor de desenvolvimento**:
   ```bash
   bun run start:dev
   ```
   Acesse a documentação interativa em http://localhost:3000/api-docs.

---

## 🏗️ Estrutura de Módulos

```
src/
├── auth/          # Autenticação Discord OAuth2, JWT exchange e Guards (BotKeyGuard, SiteKeyGuard)
├── membros/       # Sincronização em lote, busca e listagem paginada de membros
├── cargos/        # Sincronização de cargos e hierarquia de permissões do Discord
├── users/         # Gestão de perfis públicos/privados, vitrine e integração com a Steam
├── postagens/     # Feed da comunidade, criação de posts e upload de mídias
├── prisma/        # Serviço de conexão do Prisma ORM
└── main.ts        # Bootstrap, Swagger, Helmet, CORS e pipes globais
```

---

## 🤝 Como Contribuir e Gestão de Tarefas

* 📌 **Quadro de Tarefas & Roadmap**: [**GitHub Projects - Ohara Back-End**](https://github.com/orgs/OharaTeam/projects/1)
* 📖 Para manter a qualidade e rastreabilidade do projeto, consulte o nosso [**Guia de Contribuição (CONTRIBUTING.md)**](CONTRIBUTING.md) antes de enviar alterações. Ele contém:
  * Guia passo a passo para iniciantes (do card ao Pull Request)
  * Regras obrigatórias de sanitização de branches (evitando acentos e caracteres especiais)
  * Convenções de branches (`feat/*`, `fix/*`, `docs/*`)
  * Padrão de [Conventional Commits](https://www.conventionalcommits.org/)
  * Regra de governança de aprovação manual para a branch `main`


---

## 📄 Licença
Este projeto está sob a licença MIT.
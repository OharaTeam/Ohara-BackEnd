# Integrações Externas

## Visão Geral
O OharaBack-End serve como hub de comunicação conectando o Discord, a Steam, notificações via WhatsApp, um bot interno do Discord, um dashboard client web e um banco de dados PostgreSQL.

---

## 1. Ecossistema Discord

### Autenticação Discord OAuth2
- **Serviço:** Discord Developer Portal OAuth2 API
- **Credenciais & Configurações:**
  - `DISCORD_CLIENT_ID`
  - `DISCORD_CLIENT_SECRET`
  - `DISCORD_CALLBACK_URL`
- **Scopes Solicitados:** `identify`, `email`, `guilds`
- **Fluxo de Autenticação:**
  1. `GET /auth/discord`: Gera um `oauth_state` criptográfico aleatório armazenado em um cookie HTTP-only (expiração de 5 minutos) e redireciona o navegador para `https://discord.com/api/oauth2/authorize`.
  2. `GET /auth/discord/callback`: Processado por `DiscordAuthGuard` & `DiscordStrategy`. Valida o state da query contra o cookie. Valida ou atualiza dados do usuário (`validateDiscordUser` em `AuthService`).
  3. Gera um exchange JWT de curta duração (1 minuto) (`exchange_code`).
  4. Redireciona para `${FRONTEND_URL}/auth/discord/success?code=<temporaryCode>`.
  5. `POST /auth/exchange`: O frontend envia o código temporário para obter o access token JWT definitivo com validade de 7 dias.

### Comunicação com Bot do Discord
- **Endpoint do Bot:** `${process.env.BOT_URL}/sincronizar-dados`
  - Acionado pelo `MembrosCronService` via requisição HTTP POST agendada.
- **Endpoints de Entrada do Bot (Inbound - Protegidos por `BotKeyGuard`):**
  - `POST /membros`: Recebe payload com a lista de membros contendo Discord IDs, perfis de usuário e role IDs.
  - `POST /cargos`: Recebe a hierarquia de cargos, cores em hex, permissões e flags.
  - **Header de Autenticação:** `x-api-key` validado contra `BOT_KEY`.

---

## 2. Steam Web API

- **Serviço:** Valve Steamworks Web API (`https://api.steampowered.com`)
- **Credenciais & Configurações:** `STEAM_API_KEY`
- **Endpoints Utilizados:**
  - **Resolução de Vanity URL:**
    - `GET https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key={key}&vanityurl={vanity}`
    - Resolve URLs de perfis customizados (ex: `steamcommunity.com/id/username`) para Steam IDs de 64 bits.
  - **Sumário do Jogador (Player Summary):**
    - `GET https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key={key}&steamids={steamId64}`
    - Obtém o persona name, URL de avatar e link do perfil.
  - **Biblioteca de Jogos Possuídos (Owned Games):**
    - `GET https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key={key}&steamid={steamId64}&include_appinfo=true`
    - Obtém a contagem de jogos e o tempo de jogo (playtime), ordenados pelos mais jogados, buscando imagens de capa em `steamcdn-a.akamaihd.net`.

---

## 3. Serviço de Notificações WhatsApp (Evolution API)

- **Serviço:** Evolution API para alertas operacionais automatizados no WhatsApp.
- **Credenciais & Configurações:**
  - `EVOLUTION_API_URL`
  - `EVOLUTION_API_KEY`
  - `EVOLUTION_API_INSTANCE`
  - `WHATSAPP_NUMBER_ALERT`
- **Endpoint:** `POST ${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_API_INSTANCE}`
- **Gatilho (Trigger):** Utilizado no `MembrosCronService` para enviar mensagens de alerta sempre que a sincronização cron de membros é concluída ou encontra erros críticos.

---

## 4. Banco de Dados PostgreSQL & Persistência

- **Provedor:** PostgreSQL
- **Configuração de Conexão:** `DATABASE_URL`
- **Integração do Client:** Prisma V7 com `@prisma/adapter-pg` usando `Pool` do node-postgres.
- **Modelos do Schema do Banco de Dados:**
  - `User` (tabela `Membros`)
  - `Role` (tabela `Cargos`)
  - `Profile` (tabela `Perfis`)
  - `Connection` (tabela `Conexoes`)
  - `OharaEventos` (tabela `OharaEventos`)
  - `PokemonsCapturados` (tabela `PokemonsCapturados`)
  - `ContaMinecraft` (tabela `ContasMinecraft`)
  - `Post` (tabela `Posts`)
  - `Comment` (tabela `Comentarios`)

---

## 5. Aplicações Clientes & Variáveis de Ambiente

| Variável | Utilização |
| :--- | :--- |
| `PORT` | Porta do servidor HTTP (padrão: 3000) |
| `NODE_ENV` | Identificador de ambiente (`production`, `development`) |
| `FRONTEND_URL` | URL do frontend para redirecionamentos de OAuth |
| `APP_URL` | URL base da aplicação para servir URLs de imagens enviadas em produção |
| `JWT_SECRET` | Chave secreta usada para assinar e verificar tokens JWT |
| `BOT_KEY` | API key secreta exigida no header `x-api-key` para endpoints do bot |
| `BOT_URL` | URL base do bot externo do Discord |
| `STEAM_API_KEY` | API key para os endpoints da Steam Web API |
| `EVOLUTION_API_URL` | URL base da Evolution API para alertas de WhatsApp |
| `EVOLUTION_API_KEY` | Chave de autenticação para a Evolution API |
| `EVOLUTION_API_INSTANCE` | Nome da instância configurada na Evolution API |
| `WHATSAPP_NUMBER_ALERT` | Número de telefone para receber alertas operacionais |

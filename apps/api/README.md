# The Post Pilot API

API backend em Go/Fiber para gerenciamento e automação de posts em redes sociais com inteligência artificial.

## Tech Stack

- **Go 1.21+** - Linguagem de programação
- **Fiber v2** - Framework HTTP
- **MongoDB** - Banco de dados
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **Zap** - Logging estruturado

## Estrutura do Projeto

```
apps/api/
├── main.go              # Ponto de entrada da aplicação
├── Dockerfile           # Configuração Docker
├── paasdeploy.json      # Configuração de deploy
├── docs/                # Documentação Swagger
├── internal/
│   ├── app/             # Handlers HTTP e rotas
│   ├── config/          # Configurações da aplicação
│   ├── db/              # Conexão MongoDB
│   ├── di/              # Injeção de dependências (Wire)
│   ├── httpclient/      # Cliente HTTP reutilizável
│   ├── log/             # Logger estruturado
│   ├── middleware/      # Middlewares (auth, rate limit)
│   ├── models/          # Modelos de dados
│   ├── repositories/    # Camada de acesso a dados
│   └── services/        # Lógica de negócio
└── pkg/
    └── logger/          # Utilitários de logging
```

## Endpoints

### Auth

| Método | Endpoint                  | Descrição                      |
| ------ | ------------------------- | ------------------------------ |
| POST   | `/auth/register`          | Registrar novo usuário         |
| POST   | `/auth/login`             | Login com email/senha          |
| POST   | `/auth/social`            | Login social (Google/LinkedIn) |
| POST   | `/auth/refresh`           | Renovar token JWT              |
| GET    | `/auth/linkedin/url`      | URL de autenticação LinkedIn   |
| GET    | `/auth/linkedin/callback` | Callback OAuth LinkedIn        |
| GET    | `/auth/google/url`        | URL de autenticação Google     |
| GET    | `/auth/google/callback`   | Callback OAuth Google          |

### User (Autenticado)

| Método | Endpoint                     | Descrição                        |
| ------ | ---------------------------- | -------------------------------- |
| GET    | `/me`                        | Obter perfil do usuário          |
| PUT    | `/me`                        | Atualizar perfil                 |
| GET    | `/auth/linkedin/publish-url` | URL para permissão de publicação |
| DELETE | `/auth/linkedin/disconnect`  | Desconectar LinkedIn             |

### Posts (Autenticado)

| Método | Endpoint                    | Descrição                |
| ------ | --------------------------- | ------------------------ |
| GET    | `/posts`                    | Listar posts gerados     |
| POST   | `/posts/generate`           | Gerar post com IA        |
| POST   | `/linkedin/publish`         | Publicar no LinkedIn     |
| DELETE | `/linkedin/post/:postLogId` | Deletar post do LinkedIn |

### Articles (Autenticado)

| Método | Endpoint                              | Descrição             |
| ------ | ------------------------------------- | --------------------- |
| GET    | `/articles/suggestions`               | Sugestões de artigos  |
| GET    | `/articles/suggestions/by/duckduckgo` | Buscar via DuckDuckGo |

### System

| Método | Endpoint                    | Descrição            |
| ------ | --------------------------- | -------------------- |
| GET    | `/`                         | Info da API          |
| GET    | `/the-post-pilot/v1/health` | Health check         |
| GET    | `/the-post-pilot/swagger/*` | Documentação Swagger |

## Variáveis de Ambiente

```env
# Server
PORT=8081
ENV=development

# MongoDB
MONGO_DB=the-post-pilot
MONGO_URL=mongodb://localhost:27017

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REDIRECT_URI=http://localhost:8081/the-post-pilot/v1/auth/linkedin/callback
LINKEDIN_PUBLISH_REDIRECT_URI=http://localhost:8081/the-post-pilot/v1/auth/linkedin/publish-callback

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8081/the-post-pilot/v1/auth/google/callback

# Frontend
FRONT_END_URL=http://localhost:3000/login
```

## Como Executar

### Desenvolvimento Local

```bash
# Instalar dependências
go mod download

# Copiar variáveis de ambiente
cp .env.example .env

# Executar
go run main.go
```

### Com Docker Compose (raiz do projeto)

```bash
# Subir API + MongoDB
docker compose up -d

# Ver logs
docker compose logs -f api
```

### Build

```bash
# Build local
go build -o bin/api main.go

# Build Docker
docker build -t the-post-pilot-api .
```

## Documentação da API

Acesse a documentação Swagger em:

- Local: http://localhost:8081/the-post-pilot/swagger/

### Gerar/Atualizar Swagger

```bash
# Instalar swag
go install github.com/swaggo/swag/cmd/swag@latest

# Gerar docs
swag init -g main.go -o docs
```

## Testes

```bash
# Executar todos os testes
go test ./...

# Com coverage
go test -cover ./...

# Verbose
go test -v ./...
```

## Deploy

O arquivo `paasdeploy.json` contém a configuração para deploy:

```json
{
  "name": "the-post-pilot-api",
  "port": 8081,
  "healthcheck": {
    "path": "/the-post-pilot/v1/health"
  }
}
```

## Arquitetura

### Injeção de Dependências

O projeto utiliza [Wire](https://github.com/google/wire) para injeção de dependências:

```go
// internal/di/wire.go
func InitializeApp() (*app.Application, error) {
    wire.Build(
        db.GetDatabase,
        repositories.NewUserRepositoryWithDB,
        services.NewAuthServiceWithDeps,
        // ...
    )
    return nil, nil
}
```

### Fluxo de Publicação

```
[Gerar Post] → PostGenerationLog
      ↓
[Publicar] → SocialPostStories
      ↓
[LinkedIn API] → status: published
```

### Modelos Principais

- **User** - Dados do usuário e tokens OAuth
- **PostGenerationLog** - Histórico de posts gerados pela IA
- **SocialPostStories** - Posts publicados nas redes sociais

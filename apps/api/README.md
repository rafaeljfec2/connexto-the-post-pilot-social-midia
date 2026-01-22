# The Post Pilot API

API para gerenciamento e automação de posts e interações em redes sociais com inteligência artificial.

## Estrutura do Projeto

```
apps/api/
├── cmd/           # Ponto de entrada da aplicação
├── internal/      # Código interno da aplicação
│   ├── app/       # Handlers HTTP
│   ├── config/    # Configurações
│   ├── db/        # Configuração do banco de dados
│   ├── log/       # Sistema de logging
│   ├── middleware/# Middlewares HTTP
│   ├── models/    # Definições de entidades
│   ├── repositories/# Acesso a dados
│   └── services/  # Lógica de negócio
├── pkg/           # Código reutilizável
└── docs/          # Documentação
```

## Evolução da Arquitetura

### Injeção de Dependências

A arquitetura atual utiliza uma abordagem simples de injeção de dependências através de construtores. Para projetos maiores, as seguintes melhorias podem ser consideradas:

#### 1. Container de DI

- Implementar um container de DI mais robusto como `wire` (Google) ou `dig` (Uber)
- Exemplo de implementação com `wire`:

```go
// wire.go
func InitializeAPI() (*fiber.App, error) {
    wire.Build(
        repositories.NewUserRepository,
        services.NewAuthService,
        services.NewArticleService,
        services.NewPostService,
        appPkg.NewAuthHandler,
        appPkg.NewArticleHandler,
        appPkg.NewPostHandler,
        appPkg.RegisterRoutes,
    )
    return nil, nil
}
```

#### 2. Interface Segregation

- Refinar interfaces para melhor separação de responsabilidades

```go
type ArticleFetcher interface {
    FetchArticles(ctx context.Context, params FetchParams) ([]Article, error)
}

type ArticleFilter interface {
    FilterArticles(articles []Article, criteria FilterCriteria) []Article
}
```

#### 3. Context Injection

- Adicionar injeção de contexto para melhor controle de ciclo de vida

```go
type ServiceContext interface {
    Context() context.Context
    WithTimeout(timeout time.Duration) context.Context
}
```

#### 4. Configuration Injection

- Melhorar injeção de configurações

```go
type ServiceConfig interface {
    GetTimeout() time.Duration
    GetMaxRetries() int
    GetCacheConfig() CacheConfig
}
```

### Melhorias de Arquitetura

#### 1. Testabilidade

- Adicionar interfaces para facilitar mocking

```go
type Clock interface {
    Now() time.Time
}

type realClock struct{}

func (c *realClock) Now() time.Time {
    return time.Now()
}
```

#### 2. Lifecycle Management

- Implementar gerenciamento de ciclo de vida dos serviços

```go
type Service interface {
    Start(ctx context.Context) error
    Stop(ctx context.Context) error
}
```

#### 3. Health Checks

- Adicionar verificações de saúde dos serviços

```go
type HealthChecker interface {
    CheckHealth() error
}

func (s *articleService) CheckHealth() error {
    // Implementar verificação de saúde do serviço
}
```

#### 4. Observabilidade

- Implementar métricas e tracing
- Melhorar logging estruturado
- Adicionar APM (Application Performance Monitoring)

#### 5. Resiliência

- Implementar circuit breakers
- Adicionar retry policies
- Melhorar tratamento de falhas

#### 6. Cache

- Implementar cache em múltiplas camadas
- Adicionar cache distribuído
- Implementar estratégias de invalidação

### Prioridades de Evolução

1. **Curto Prazo**

   - Implementar health checks
   - Melhorar logging estruturado
   - Adicionar métricas básicas

2. **Médio Prazo**

   - Implementar container de DI
   - Refinar interfaces
   - Adicionar cache

3. **Longo Prazo**
   - Implementar APM
   - Adicionar circuit breakers
   - Implementar cache distribuído

## Como Executar

```bash
# Instalar dependências
go mod download

# Executar em desenvolvimento
go run cmd/api/main.go

# Executar testes
go test ./...

# Build
go build -o bin/api cmd/api/main.go
```

## Documentação da API

A documentação da API está disponível via Swagger em `/swagger` quando o servidor está rodando.

## Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

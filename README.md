# Post Pilot

[![Go](<https://img.shields.io/badge/Backend-Go%20(Fiber)-00ADD8?logo=go&logoColor=white>)](https://go.dev/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Estilo-Tailwind%20CSS-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/DB-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/IA-OpenAI-412991?logo=openai&logoColor=white)](https://openai.com/)

> **O Post Pilot é uma plataforma inteligente para automação, geração e publicação de conteúdos em redes sociais, focada em profissionais e empresas de tecnologia.**
>
> O objetivo é simplificar o fluxo de criação de posts técnicos, integrando fontes de referência (RSS, dev.to, Medium, etc.), geração de texto com IA (OpenAI), curadoria e publicação automatizada no LinkedIn, com histórico e gestão centralizada.

Aplicativo de gerenciamento e automação de posts e interações em redes sociais com inteligência artificial.

---

## 🏗️ Arquitetura Monorepo

Este projeto utiliza uma arquitetura **monorepo** moderna, baseada em [pnpm workspaces](https://pnpm.io/workspaces), para facilitar a manutenção, o versionamento e a colaboração entre múltiplos apps e pacotes.

- **apps/web**: Frontend em React + Vite + TypeScript
- **apps/api**: Backend em Go (Fiber)
- **packages/**: (futuro) Pacotes compartilhados entre frontend e backend (ex: tipos, utilitários)
- **Gerenciamento de dependências** centralizado no `package.json` raiz
- **Scripts unificados** para build, lint, testes e geração de documentação
- **Isolamento de ambientes**: cada app pode ser desenvolvido, testado e deployado de forma independente
- **Facilidade para CI/CD**: pipelines podem rodar scripts em todos os workspaces ou apenas nos afetados por mudanças

**Vantagens do monorepo:**

- Redução de duplicidade de código
- Compartilhamento fácil de tipos e utilitários
- Padronização de ferramentas e processos
- Melhor experiência para times de produto e engenharia

---

## 🚀 MVP — Funcionalidades e Progresso

### Funcionalidades do MVP

#### Backend

- Autenticação via LinkedIn (OpenID Connect)
- Autenticação via Google (OpenID Connect)
- Salvamento de tokens e dados do usuário (incluindo OpenAI)
- Estrutura para fontes técnicas (RSS, dev.to, Medium, Hacker News)
- Geração de texto com OpenAI
- Publicação no LinkedIn
- Histórico genérico de posts (SocialPostStories)
- Logging e auditoria de geração/publicação
- API RESTful documentada (Swagger)
- Tratamento de token expirado/inválido

#### Frontend

- Dashboard com sugestões de temas/artigos
- Editor de posts
- Aprovação de sugestões (botão "Aprovar")
- Publicação no LinkedIn com 1 click
- Visualização do histórico de posts
- Configuração de fontes técnicas
- Login social (Google/LinkedIn)
- Exibição de mensagens de erro e feedback ao usuário

### Estágio Atual

| Funcionalidade (Backend)                      | Status    |
| --------------------------------------------- | --------- |
| 1 - Autenticação via LinkedIn                 | ✅ Pronto |
| 2 - Autenticação via Google                   | ✅ Pronto |
| 3 - Salvar tokens e dados do usuário          | ✅ Pronto |
| 4 - Buscar tema de fontes técnicas (RSS/APIs) | ✅ Pronto |
| 5 - Gerar texto com OpenAI                    | ✅ Pronto |
| 6 - Publicação no LinkedIn                    | ✅ Pronto |
| 7 - Histórico de posts                        | ✅ Pronto |
| 8 - Logging/auditoria                         | ✅ Pronto |
| 9 - Tratamento de token expirado/inválido     | ✅ Pronto |

| Funcionalidade (Frontend)              | Status    |
| -------------------------------------- | --------- |
| 1 - Dashboard com sugestões            | ✅ Pronto |
| 2 - Editor de posts                    | ✅ Pronto |
| 3 - Aprovação de sugestões             | ✅ Pronto |
| 4 - Publicação no LinkedIn com 1 click | ✅ Pronto |
| 5 - Visualização do histórico de posts | ✅ Pronto |
| 6 - Configuração de fontes técnicas    | ✅ Pronto |
| 7 - Login social (Google/LinkedIn)     | ✅ Pronto |
| 8 - Mensagens de erro e feedback       | ✅ Pronto |

### Detalhes Técnicos Implementados

1. **Autenticação Social**

   - OpenID Connect com LinkedIn e Google
   - JWT para autenticação de API
   - Middleware de autenticação e rate limiting
   - Salvamento seguro de tokens e dados do usuário

2. **Fontes Técnicas**

   - Integração com RSS feeds (parsing via gofeed)
   - API do dev.to com suporte a tags
   - Hacker News API para top stories (busca paralela otimizada)
   - Busca alternativa via DuckDuckGo (scraping HTML)
   - Normalização de artigos em formato comum
   - Busca paralela de múltiplas fontes simultaneamente
   - Diversificação de resultados (round-robin entre fontes)
   - Filtros avançados por palavra-chave, data e tags
   - Limite configurável de resultados (padrão: 6, máximo: 100)

3. **API RESTful**

   - Documentação Swagger completa
   - Endpoints protegidos com JWT
   - Respostas padronizadas
   - Tratamento de erros centralizado

4. **Segurança**
   - Rate limiting por IP
   - Sanitização de inputs
   - Validação de tokens
   - Proteção contra CSRF
   - Headers de segurança

5. **Gestão de Posts**
   - Listagem de posts gerados pelo usuário via API RESTful
   - Endpoint `GET /the-post-pilot/v1/posts` com autenticação JWT
   - Retorno de posts com informações completas (input, output, modelo, uso de tokens, status)
   - Tratamento de estados no frontend (loading, error, empty)
   - Integração com React Query para cache e retry automático
   - Hook customizado `usePosts` para gerenciamento de estado
   - Serviço `postsService` com tratamento robusto de erros
   - Componentes reutilizáveis para exibição e edição de posts
   - Filtros e paginação (preparado para implementação futura)

## 🎯 Evoluções Recentes

### Integração Completa com OpenAI

✅ **Implementado:**

- Cliente dedicado para API da OpenAI (`OpenAIClient`)
- Suporte a múltiplos modelos (gpt-3.5-turbo, gpt-4, etc.)
- Configuração individual de API key e modelo por usuário
- Geração de posts a partir de temas/artigos
- Monitoramento de uso de tokens (prompt, completion, total)
- Logging completo de cada geração (input, output, modelo, usage, status)
- Tratamento robusto de erros da API
- Histórico auditável de todas as gerações

**Desafios Superados:**

- Gerenciamento seguro de credenciais por usuário
- Tratamento de erros e timeouts da API
- Monitoramento de custos via tracking de tokens
- Validação de respostas e fallbacks

### Sistema de Pesquisa de Artigos Paralelo

✅ **Implementado:**

- Busca simultânea em múltiplas fontes (goroutines)
- Intercalação round-robin para diversificar resultados
- Otimização de performance no Hacker News (até 8 requisições simultâneas)
- Timeouts configuráveis (8s para Hacker News)
- Filtros combinados (palavra-chave, datas, tags)
- Busca alternativa via DuckDuckGo para casos sem fontes configuradas

### Frontend Robusto e Resiliente

✅ **Implementado:**

- Página de Sugestões com filtros dinâmicos
- Geração de posts com um clique a partir de artigos
- Página de Posts Pendentes com KPIs e filtros
- Tratamento robusto de erros e estados vazios
- Proteção contra `null/undefined` em todos os componentes
- Mensagens de feedback claras para o usuário
- Interface responsiva e moderna com Tailwind CSS

**Melhorias de Robustez:**

- Validação de arrays antes de usar `.map()`
- Tratamento de campos opcionais (`usage`, `output`)
- Fallbacks para estados de erro e loading
- Retry automático em caso de falhas de rede

**Integração Frontend-Backend:**

- Hook customizado `usePosts` utilizando React Query para gerenciamento de estado e cache
- Serviço `postsService` com tratamento robusto de erros e validação de respostas
- Componente `PendingPostCard` com ações completas (Editar, Agendar, Publicar, Excluir)
- Componente `PendingPostsFilters` para filtros avançados (Status, Rede Social, Período)
- Modal `EditPostModal` para edição de posts
- Integração com endpoint `GET /the-post-pilot/v1/posts` para listagem de posts do usuário
- Tratamento de estados de loading, error e empty state em todos os componentes

### Sistema de Gestão de Posts Pendentes

✅ **Implementado:**

- Página dedicada para gerenciamento de posts pendentes (`/app/pending`)
- KPIs em tempo real com métricas de posts (Pendentes, Agendados, Prontos, Editando)
- Filtros avançados por status, rede social e período
- Cards de posts com informações completas:
  - Input (tema/artigo original)
  - Output (texto gerado pela IA)
  - Modelo utilizado (gpt-3.5-turbo, gpt-4, etc.)
  - Uso detalhado de tokens (prompt, completion, total)
  - Status do post
  - Data de criação
- Ações disponíveis por post:
  - Editar conteúdo
  - Agendar publicação
  - Publicar no LinkedIn (1 click)
  - Excluir post
- Modal de edição de posts
- Integração completa com backend via API RESTful
- Tratamento robusto de estados (loading, error, empty)
- Cache e retry automático via React Query

**Arquitetura Frontend:**

- Hook customizado `usePosts` para gerenciamento de estado
- Serviço `postsService` com tratamento de erros
- Componentes reutilizáveis e responsivos (mobile-first)
- Proteção contra valores null/undefined em todos os componentes

### Próximos Passos

1. **Melhorias na Geração com IA**

   - Personalização avançada de prompts
   - Cache de resultados para reduzir custos
   - Suporte a múltiplos formatos de post
   - Ajuste fino de parâmetros (temperature, max_tokens)

2. **LinkedIn Integration**
   - OAuth 2.0 para publicação
   - Agendamento de posts
   - Métricas de engajamento
   - Repostagem automática

3. **Melhorias de Performance**
   - Cache de artigos pesquisados
   - Paginação de resultados
   - Lazy loading de imagens
   - Otimização de bundle size

### Histórico Genérico de Publicações

- Todos os posts publicados (sucesso ou erro) em qualquer rede social são registrados na coleção `social_post_stories`.
- Campos: usuário, rede, conteúdo, payload, resposta, status, erro, ID externo, timestamps.
- Permite auditoria, reprocessamento e análise de falhas.

### Tratamento de Token Expirado/Inválido

- Se o token do LinkedIn expirar ou for revogado, o backend retorna:
  `{"error": "LinkedIn token expired or invalid. Please reconnect your LinkedIn account."}`
- O frontend pode instruir o usuário a refazer o OAuth.

### Exemplo de uso: Publicação no LinkedIn

**Endpoint:**

```
POST /the-post-pilot/v1/linkedin/publish
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "text": "Conteúdo do post para o LinkedIn"
}
```

**Resposta de sucesso:**

```
{
  "status": "published",
  "linkedinPostId": "urn:li:share:..."
}
```

**Resposta de erro (token expirado):**

```
{
  "error": "LinkedIn token expired or invalid. Please reconnect your LinkedIn account."
}
```

---

## 📁 Estrutura do Projeto

```text
.
├── apps/
│   ├── web/                    # Frontend React + Vite
│   │   └── src/
│   │       ├── components/     # Componentes reutilizáveis
│   │       │   ├── dashboard/   # Componentes do dashboard
│   │       │   │   ├── PendingPostCard.tsx
│   │       │   │   ├── PendingPostsFilters.tsx
│   │       │   │   └── EditPostModal.tsx
│   │       │   └── ui/         # Componentes UI (shadcn/ui)
│   │       ├── hooks/           # Hooks customizados
│   │       │   ├── usePosts.ts
│   │       │   └── useSuggestions.ts
│   │       ├── pages/           # Páginas da aplicação
│   │       │   ├── PendingPosts.tsx
│   │       │   └── Suggestions.tsx
│   │       └── services/        # Serviços de API
│   │           └── posts.service.ts
│   └── api/                     # Backend Go
│       └── internal/
│           ├── app/             # Handlers HTTP
│           ├── services/        # Lógica de negócio
│           └── repositories/    # Acesso a dados
├── packages/                    # Pacotes compartilhados (futuro)
├── package.json                 # Configuração raiz do monorepo
└── pnpm-workspace.yaml
```

## ⚙️ Pré-requisitos

- Node.js >= 18
- pnpm >= 8
- Go >= 1.21
- MongoDB (local ou Atlas)

## 🛠️ Instalação

```bash
# Instalar dependências
pnpm install

# Instalar dependências Go
cd apps/api
go mod download
```

## 👨‍💻 Desenvolvimento

### Frontend (Web)

```bash
pnpm dev:web        # Iniciar servidor de desenvolvimento
pnpm build:web      # Build do frontend
pnpm test:web       # Testes
pnpm lint:web       # Lint
```

### Backend (API)

```bash
pnpm dev:api        # Iniciar servidor de desenvolvimento
pnpm build:api      # Build do backend
pnpm test:api       # Testes
pnpm lint:api       # Lint
```

## 📜 Scripts Disponíveis

- `pnpm dev:web` — Inicia o frontend em modo de desenvolvimento
- `pnpm dev:api` — Inicia o backend em modo de desenvolvimento
- `pnpm build:web` — Build do frontend
- `pnpm build:api` — Build do backend
- `pnpm test:web` — Roda testes do frontend
- `pnpm test:api` — Roda testes do backend
- `pnpm lint:web` — Roda lint no frontend
- `pnpm lint:api` — Roda lint no backend
- `pnpm update-swagger` — Atualiza a documentação Swagger da API

## 🧰 Tecnologias

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
- **Backend:** Go (Fiber), MongoDB, OpenAI API
- **Infra:** pnpm, monorepo, scripts automatizados

## 📄 Licença

MIT

## 📚 Exemplos de Uso da API

### Sugestão de Artigos Técnicos

**Endpoint:**

GET /the-post-pilot/v1/articles/suggestions

**Exemplo de resposta:**

```json
[
  {
    "title": "Go 1.22 Released",
    "url": "https://dev.to/golang/go-1-22-released-1234",
    "source": "DEV Community",
    "publishedAt": "2024-05-01T12:00:00Z",
    "summary": "Resumo do artigo em português...",
    "tags": ["go", "release"]
  }
]
```

### Geração de Post com OpenAI

**Endpoint:**

POST /the-post-pilot/v1/posts/generate

**Payload:**

```json
{
  "topic": "Como usar IA para automação de posts"
}
```

**Resposta:**

```json
{
  "generatedText": "Descubra como a inteligência artificial pode revolucionar sua estratégia de conteúdo...",
  "model": "gpt-3.5-turbo",
  "usage": {
    "prompt_tokens": 30,
    "completion_tokens": 100,
    "total_tokens": 130
  },
  "createdAt": "2025-05-19T22:09:39Z",
  "logId": "682bac2309c40fa708839ee2"
}
```

### Listagem de Posts do Usuário

**Endpoint:**

GET /the-post-pilot/v1/posts

**Headers:**

```
Authorization: Bearer <jwt>
```

**Exemplo de resposta:**

```json
[
  {
    "id": "682bac2309c40fa708839ee2",
    "userId": "507f1f77bcf86cd799439011",
    "input": "Como usar IA para automação de posts",
    "output": "Descubra como a inteligência artificial pode revolucionar sua estratégia de conteúdo...",
    "model": "gpt-3.5-turbo",
    "usage": {
      "prompt_tokens": 30,
      "completion_tokens": 100,
      "total_tokens": 130,
      "prompt_tokens_details": {
        "cached_tokens": 0
      },
      "completion_tokens_details": {
        "accepted_prediction_tokens": 0,
        "rejected_prediction_tokens": 0
      }
    },
    "status": "success",
    "createdAt": "2025-05-19T22:09:39Z"
  }
]
```

**Integração Frontend (React Query):**

```typescript
import { useQuery } from '@tanstack/react-query'
import { postsService } from '@/services/posts.service'

export function usePosts() {
  return useQuery({
    queryKey: ['posts', 'pending'],
    queryFn: async () => {
      const result = await postsService.list()
      return Array.isArray(result) ? result : []
    },
    retry: 1,
    initialData: [],
  })
}
```

### Logging e Auditoria

- Cada geração de post é registrada no MongoDB com:
  - ID do usuário
  - Input enviado
  - Output gerado
  - Modelo utilizado
  - Uso de tokens (prompt, completion, total)
  - Status (started, success, error)
  - Mensagens de erro (se houver)
  - Timestamp completo
- Permite rastreabilidade e análise de uso da IA
- Histórico completo para auditoria e análise de custos

### Arquitetura de Pesquisa de Artigos

O sistema implementa uma arquitetura de busca paralela e diversificada:

1. **Busca Paralela**: Todas as fontes configuradas são consultadas simultaneamente usando goroutines
2. **Diversificação**: Resultados são intercalados (round-robin) para garantir variedade
3. **Otimização**: Hacker News usa semáforo para limitar concorrência (máx. 8 requisições simultâneas)
4. **Resiliência**: Timeouts e tratamento de erros por fonte, sem afetar outras
5. **Filtros Inteligentes**: Aplicados após a busca para maximizar resultados relevantes

### Tratamento de Erros e Robustez

**Backend:**
- Validação de entrada em todos os endpoints
- Tratamento específico de erros da OpenAI (rate limits, timeouts)
- Logging estruturado com contexto completo
- Respostas padronizadas de erro

**Frontend:**
- Proteção contra `null/undefined` em todos os componentes
- Estados de loading, error e empty state
- Retry automático via React Query
- Mensagens de erro amigáveis ao usuário
- Validação de tipos TypeScript rigorosa

---

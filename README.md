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

| Funcionalidade (Frontend)              | Status      |
| -------------------------------------- | ----------- |
| 1 - Dashboard com sugestões            | ⬜ Pendente |
| 2 - Editor de posts                    | ⬜ Pendente |
| 3 - Aprovação de sugestões             | ⬜ Pendente |
| 4 - Publicação no LinkedIn com 1 click | ⬜ Pendente |
| 5 - Visualização do histórico de posts | ⬜ Pendente |
| 6 - Configuração de fontes técnicas    | ⬜ Pendente |
| 7 - Login social (Google/LinkedIn)     | ⬜ Pendente |
| 8 - Mensagens de erro e feedback       | ⬜ Pendente |

### Detalhes Técnicos Implementados

1. **Autenticação Social**

   - OpenID Connect com LinkedIn e Google
   - JWT para autenticação de API
   - Middleware de autenticação e rate limiting
   - Salvamento seguro de tokens e dados do usuário

2. **Fontes Técnicas**

   - Integração com RSS feeds
   - API do dev.to com suporte a tags
   - Hacker News API para top stories
   - Normalização de artigos em formato comum
   - Filtros por palavra-chave, data e tags
   - Limite configurável de resultados

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

### Próximos Passos

1. **Integração com OpenAI**

   - Configuração de chave API do usuário
   - Geração de texto baseada em artigos
   - Personalização de prompts
   - Cache de resultados

2. **Frontend**

   - Dashboard com sugestões
   - Editor de posts
   - Configuração de fontes
   - Histórico de publicações

3. **LinkedIn Integration**
   - OAuth 2.0 para publicação
   - Escrita de posts
   - Agendamento
   - Métricas de engajamento

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
│   ├── web/          # Frontend React + Vite
│   └── api/          # Backend Go
├── packages/         # Pacotes compartilhados (futuro)
├── package.json      # Configuração raiz do monorepo
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

### Logging e Auditoria

- Cada geração de post é registrada no MongoDB com:
  - ID do usuário
  - Input enviado
  - Output gerado
  - Modelo e usage
  - Status e erros (se houver)
  - Timestamp
- Permite rastreabilidade e análise de uso da IA.

---

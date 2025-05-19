# Post Pilot

Aplicativo de gerenciamento e automação de posts e interações em redes sociais com inteligência artificial.

## MVP — Funcionalidades e Progresso

### Funcionalidades do MVP

- Autenticação via LinkedIn (OpenID Connect)
- Autenticação via Google (OpenID Connect)
- Salvamento de tokens e dados do usuário (incluindo OpenAI)
- Estrutura para fontes técnicas (RSS, dev.to, Medium, Hacker News)
- Geração de texto com OpenAI (em breve)
- Exibição de sugestões no painel com botão "Aprovar" (em breve)
- Publicação no LinkedIn com 1 click (em breve)
- Histórico de posts (em breve)

### Estágio Atual

| Funcionalidade                            | Status      |
| ----------------------------------------- | ----------- |
| Autenticação via LinkedIn                 | ✅ Pronto   |
| Autenticação via Google                   | ✅ Pronto   |
| Salvar tokens e dados do usuário          | ✅ Pronto   |
| Buscar tema de fontes técnicas (RSS/APIs) | ⬜ Pendente |
| Gerar texto com OpenAI                    | ⬜ Pendente |
| Exibir no painel (botão "Aprovar")        | ⬜ Pendente |
| Publicar no LinkedIn com click            | ⬜ Pendente |
| Histórico de posts                        | ⬜ Pendente |

---

## Estrutura do Projeto

```
.
├── apps/
│   ├── web/          # Frontend React + Vite
│   └── api/          # Backend Go
├── packages/         # Pacotes compartilhados (futuro)
├── package.json      # Configuração raiz do monorepo
└── pnpm-workspace.yaml
```

## Pré-requisitos

- Node.js >= 18
- pnpm >= 8
- Go >= 1.21

## Instalação

```bash
# Instalar dependências
pnpm install

# Instalar dependências Go
cd apps/api
go mod download
```

## Desenvolvimento

### Frontend (Web)

```bash
# Iniciar servidor de desenvolvimento
pnpm dev:web

# Build
pnpm build:web

# Testes
pnpm test:web

# Lint
pnpm lint:web
```

### Backend (API)

```bash
# Iniciar servidor de desenvolvimento
pnpm dev:api

# Build
pnpm build:api

# Testes
pnpm test:api

# Lint
pnpm lint:api
```

## Scripts Disponíveis

- `pnpm dev:web` - Inicia o frontend em modo de desenvolvimento
- `pnpm dev:api` - Inicia o backend em modo de desenvolvimento
- `pnpm build:web` - Build do frontend
- `pnpm build:api` - Build do backend
- `pnpm test:web` - Roda testes do frontend
- `pnpm test:api` - Roda testes do backend
- `pnpm lint:web` - Roda lint no frontend
- `pnpm lint:api` - Roda lint no backend

## Tecnologias

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS

### Backend

- Go
- Echo/Fiber
- TypeScript (para definições de tipos compartilhados)

## Licença

MIT

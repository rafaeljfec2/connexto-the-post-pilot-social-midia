# Post Pilot

Aplicativo de gerenciamento e automação de posts e interações em redes sociais com inteligência artificial.

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

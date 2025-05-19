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

- **Autenticação via LinkedIn (OpenID Connect)**
- **Autenticação via Google (OpenID Connect)**
- **Salvamento de tokens e dados do usuário** (incluindo OpenAI)
- **Estrutura para fontes técnicas** (RSS, dev.to, Medium, Hacker News)
- **Geração de texto com OpenAI** _(em breve)_
- **Exibição de sugestões no painel com botão "Aprovar"** _(em breve)_
- **Publicação no LinkedIn com 1 click** _(em breve)_
- **Histórico de posts** _(em breve)_

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

# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## AI App Builder

A web app where users describe an app idea in plain language and AI generates a full project blueprint (name, tagline, features, pages, data models, user stories, tech stack, file structure, milestones).

### Artifacts
- `artifacts/ai-app-builder` — React + Vite frontend at `/`. Pages: Generator (`/`), Library (`/blueprints`), Detail (`/blueprints/:id`), Dashboard (`/dashboard`).
- `artifacts/api-server` — Express 5 backend at `/api`.

### Backend
- Routes in `artifacts/api-server/src/routes/blueprints.ts`:
  - `GET /api/blueprints` — list all
  - `POST /api/blueprints/generate` — generate via OpenAI (gpt-5.4) and save
  - `GET /api/blueprints/:id`, `DELETE /api/blueprints/:id`, `PATCH /api/blueprints/:id/favorite`
  - `GET /api/blueprints/stats/{overview,recent,popular-tech,categories}`
  - `GET /api/blueprints/inspiration/prompts` — static suggestion list
- Generation prompt + JSON parsing in `artifacts/api-server/src/lib/blueprintGenerator.ts`.

### Data
- DB schema: `lib/db/src/schema/blueprints.ts` — single `blueprints` table with jsonb columns for nested structures.

### Codegen
- OpenAPI spec: `lib/api-spec/openapi.yaml`. Run `pnpm --filter @workspace/api-spec run codegen`.
- Codegen script overwrites `lib/api-zod/src/index.ts` with `export * from "./generated/api"` to avoid duplicate-export conflicts.

### Integrations
- OpenAI via `@workspace/integrations-openai-ai-server` (Replit AI proxy, env: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`).

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is a **customized fork of LibreChat for HPE**, not vanilla upstream.

- `origin` → `bellanda/LibreChat` (the fork) · `upstream` → `danny-avila/LibreChat`.
- Working integration branch is **`stage`**; open PRs against `main`.
- Version pinned at `v0.8.2-rc3` (`package.json`).

**Core fork principle (from `sandbox.md`): ADD, don't modify.** When implementing features, prefer new modules/structures over editing LibreChat core, to keep upstream merges clean. The custom Python services and `packages/sandbox` exist precisely so the base chat code stays close to upstream.

## Architecture

### Node monorepo (npm/bun workspaces)
Workspaces are `api`, `client`, `packages/*` (`package.json`).

- `api/` — Express backend. Entry `api/server/index.js`. Agent/tool execution lives in `api/server/controllers/agents/`. Routes in `api/server/routes/`, middleware in `api/server/middleware/`, business services in `api/server/services/`.
- `client/` — React + Vite frontend.
- `packages/data-provider`, `packages/data-schemas`, `packages/api`, `packages/client` — shared libraries. **These build first; `client`/`api` import their compiled output.** Build order is enforced by `build:packages`.
- `packages/mcp` — MCP transport/client code.
- `packages/sandbox` — **custom self-hosted code interpreter** (replaces LibreChat's paid Code Interpreter). Node server (`SANDBOX_PORT`, default 3082) that runs user Python/JS in isolated Docker containers per `{userId}/{sessionId}`, with path-traversal/symlink-escape prevention, timeouts, mem limits, and a Mongo audit trail. Executor image is built separately (see commands).

### HPE custom services (Python, run as containers)
- `python-tools-api/` — FastAPI service backing the **Reports** dashboard (usage/cost KPIs → MongoDB). Proxied by the Node API at `/api/python-tools/*` via `api/server/routes/pythonTools.js`. Reports UI is admin-only (`client/src/routes/Layouts/ReportLayout.tsx`).
- `rag_api/` — customized RAG service (document retrieval, pgvector).
- `cron/` — scheduled jobs (conversation retention) and notebooks that generate runtime config such as `groups-config.json` and model descriptions.

### Groups & access control (HPE-specific)
`user.group` drives what each user sees. `api/server/services/Config/GroupsService.js` + `api/server/middleware/groupsMiddleware.js` filter **endpoints, models, and MCP servers** per group. Config comes from MongoDB (`groupsconfigs`) plus a mounted, gitignored `groups-config.json` (default `mcpServers: ['*']` when absent).

### Configuration
- `librechat.yaml` — the **active** LibreChat config (interface, endpoints, agent capabilities, balance, memory, web search, OCR). `librechat.example.yaml` / `librechat.old.yaml` / `*_bellanda.yaml` are references, not active.
- `.env` is active; many variants exist (`.env.dev`, `.env.prod`, `.env.dev-bosch`, …) for different deploys. Auth is LDAP (corporate AD); public registration is off (`ALLOW_REGISTRATION=false`).

### Notable custom frontend areas
`client/src/components/Reports/`, `.../Documentation/`, `.../HPEAgents/`, `.../Dev/` (debug overlay), `.../ui/AnnouncementModal.tsx`.

## Commands

Development runs through Docker Compose, not bare `npm`:

```bash
# Dev stack (build + run: api, mongodb, vectordb, meilisearch, rag_api, python-tools-api, cron, sandbox)
docker compose -f docker-compose.yml -f docker-compose.dev.override.yml up --build
docker compose -f docker-compose.yml -f docker-compose.dev.override.yml up -d --build sandbox api   # rebuild specific services

# Build the sandbox executor image (the container that runs user Python/JS)
docker build -f packages/sandbox/docker/Dockerfile.executor -t librechat/sandbox-executor:latest packages/sandbox

# Create a user (inside the running api container)
docker exec -it api npm run create-user
```

Build / lint / test (host, npm workspaces):

```bash
npm run build:packages      # build shared packages — REQUIRED before build:client / build:api
npm run frontend            # build packages + client (full)
npm run frontend:dev        # vite dev server for client only
npm run backend:dev         # nodemon api/server/index.js

npm run lint                # eslint (repo-wide)
npm run lint:fix
npm run format              # prettier

npm run test:client         # client unit tests
npm run test:api            # api unit tests
npm run test:packages:api   # (also :data-provider, :data-schemas)
npm run test:sandbox        # packages/sandbox tests
npm run test:all            # everything

npm run e2e                  # Playwright (local config); :ci, :headed, :debug variants exist
```

Run a **single** test (Jest, per workspace — run from the workspace dir):

```bash
cd api && npx jest path/to/file.spec.js -t "test name"
cd client && npx jest src/path/to/Component.spec.tsx
```

`bun` equivalents exist for most scripts (prefixed `b:`, e.g. `b:client`, `b:api:dev`). Operational scripts live in `config/` and are exposed as npm scripts (`add-balance`, `create-user`, `migrate:agent-permissions`, `flush-cache`, etc.).

## Working with upstream merges

This fork tracks a fast-moving upstream; merges have repeatedly introduced breaking changes. Before merging an upstream sync, verify the agent/streaming path still works: the agent controller returns a `streamId` and generates in the background (SSE via `EventSource`), UI resources are stored as **arrays** (not keyed objects), token fields are normalized (`prompt_tokens`→`input_tokens`), and `initializeAgent`/`getProviderConfig` are still exported from `@librechat/api`. See `LIBRECHAT_STATE_REPORT.md` for a fuller inventory of fork-vs-upstream divergence.

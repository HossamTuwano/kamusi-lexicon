# Kamusi API — Phase 1

Monolingual Swahili → Swahili lexical API.

JSON wire format is **camelCase** (aligned with `@kamusi/core`).

## Setup

1. From monorepo root: `npm run install:all`
2. In `apps/api`: `docker compose up -d postgres redis`
3. Ensure `.env` has `DB_SYNC=true` for local throwaway DBs (or run migrations)
4. From root: `npm run api:dev`
5. Docs: `http://localhost:3001/docs`

## Env

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `REDIS_HOST`, `REDIS_PORT`
- `DB_SYNC` — `true` only for local/e2e; `false` for shared environments
- `CORS_ORIGINS` — comma-separated (default includes `http://localhost:5173`)

## Database

PostgreSQL with `pg_trgm`.

- Local/e2e: `DB_SYNC=true`
- Shared/prod: `DB_SYNC=false` and apply either:
  - `packages/database/sql/001_phase1_bootstrap.sql`, or
  - TypeORM migration `src/db/migrations/1754490000000-phase1-init.ts` via CLI against a built/dist DataSource

Do not glob `.ts` migrations into Nest at runtime (breaks Vitest/Node ESM interop).

## Phase rule

Do not add translation-first features. Read `CONSTITUTION.md` and `../../HANDOVER.md`.

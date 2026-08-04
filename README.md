# Kamusi - Crowdsourced Dictionary API

## Setup

1. Clone repo
2. Run `docker-compose up -d` to start Postgres, Redis, and the API.
3. API Docs are available at `http://localhost:3001/docs`.

## Env Variables

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `REDIS_HOST`, `REDIS_PORT`

## Database Setup

The API uses PostgreSQL with `pg_trgm`.
Ensure the extension is enabled: `CREATE EXTENSION IF NOT EXISTS pg_trgm;`

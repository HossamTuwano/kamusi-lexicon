# apps/web — Phase 1 Kamusi UI

Public monolingual Swahili dictionary UI (Vite + React).

## Run

```bash
# API (from repo root)
cd apps/api && docker compose up -d postgres redis
cd ../.. && npm run api:dev

# Web
npm run web:dev
# http://localhost:5173
```

Optional: `apps/web/.env` with `VITE_API_URL=http://localhost:3001/api`.

## Scope

- Search lemmas
- Read entry (senses, examples, synonyms)
- Register / login
- Contribute a new Swahili lemma
- Cast community votes

Admin moderation UI remains in `apps/admin` (planned).

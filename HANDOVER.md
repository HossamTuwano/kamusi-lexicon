# HANDOVER — For the next model (or human)

Read this before changing code. Then read `CONSTITUTION.md` and `VISION.md`.
If a feature conflicts with the Constitution, the Constitution wins.

---

## Was the previous pickup material enough?

**Mostly yes for direction, no for execution speed.**

What worked:

- `PROJECT_MAP.md` named the mission and pointed at Constitution / Vision
- Constitution made Phase 1 non-negotiable (monolingual Swahili Kamusi)
- Entities already showed Lemma → Sense → Example intent

What slowed the first real audit:

1. **No single “current truth” checklist** — had to reverse-engineer Phase 1 compliance from scattered files
2. **`packages/core` claimed to be source of truth but was unused** — docs and code disagreed
3. **No Journal of decisions** — unclear what was intentional vs leftover (e.g. “Dict.cc Clone”)
4. **No API surface map** — endpoints, auth roles, and invariants were only discoverable by reading controllers
5. **No “do not do” list for Phase 1** beyond the Constitution prose
6. **Tests/seeds mixed English content** — undermined the Swahili-first rule as an example

This file exists so the next pickup does not repeat that.

---

## Mandatory reading order (≈10 minutes)

1. `apps/api/CONSTITUTION.md` — permanent laws
2. `apps/api/VISION.md` — north star
3. `PROJECT_MAP.md` — architecture map
4. **This file** — operational truth
5. `JOURNAL.md` — latest decisions
6. `packages/core/src/index.ts` — canonical types

Do **not** invent a bilingual/translation feature in Phase 1.

---

## Phase 1 definition of done (checklist)

Use this as the compliance gate:

- [x] Monolingual Swahili → Swahili (no translation tables)
- [x] Structured Lemma → Sense(s) → Example(s)
- [x] `@kamusi/core` is imported by the API (not duplicated enums)
- [x] Lemma stores synonyms, antonyms, derived words, dialect, source
- [x] `language` locked to `sw`
- [x] At least one sense with a definition required on create
- [x] Unique key is `(word, part_of_speech)`
- [x] Creator-only delete (moderators exempt); verified needs moderator
- [x] Contributor history + revision snapshots
- [x] Moderator role + moderate endpoint
- [x] Public docs do not describe a bilingual / Dict.cc product
- [x] Journal exists and is append-only
- [x] CORS enabled for `apps/web` (configurable via `CORS_ORIGINS`)
- [x] API JSON wire format is camelCase (matches `@kamusi/core`)
- [x] Vote routes covered by Phase 1 e2e
- [x] TypeORM migration exists; `synchronize` gated by `DB_SYNC` (not blind prod sync)
- [x] `apps/web` Phase 1 consumer (search / read / auth / contribute / vote)
- [x] `apps/admin` implemented (login, pending dashboard, entry detail, search, verify/hide/restore)
- [x] Entities fully relocated into `@kamusi/database` (API imports from shared package)
- [x] Community reporting / flagging state (`lemma_reports`, Reported tab, reports resolved on moderator action)

---

## Architecture at a glance

```
kamusi-lexicon/
  packages/core      ← CANONICAL TYPES (import everywhere)
  packages/database  ← SQL bootstrap + schema constants (entities still in API)
  apps/api           ← NestJS engine (primary logic today)
  apps/web           ← Phase 1 public Kamusi UI (Vite + React)
  apps/admin         ← planned moderation UI
  JOURNAL.md         ← decision log
  HANDOVER.md        ← this file
  PROJECT_MAP.md     ← high-level map
  PHASE2-PLAN.md     ← translation-ready schema plan (draft, planning only)
  MVP-RELEASE-PLAN.md ← Phase 1 MVP testing + production plan (plan only)
```

### API surface (Phase 1)

Wire format: **camelCase** (`partOfSpeech`, `isVerified`, `accessToken`, …).

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/entries/search?q=` | no | Verified Swahili lemmas only (`is_verified=true`, `is_hidden=false`) |
| GET | `/api/entries/moderation/search?q=` | JWT (moderator/admin) | Includes hidden entries; used by admin dashboard |
| GET | `/api/entries/:id` | no | Lemma + senses + examples + contributions + revisions |
| POST | `/api/entries` | JWT | Create Swahili lemma (≥1 sense) |
| PATCH | `/api/entries/:id` | JWT | Owner or moderator; bumps version + revision |
| DELETE | `/api/entries/:id` | JWT | Owner (unverified) or moderator |
| POST | `/api/entries/:id/moderate` | JWT | Moderator/admin: `verify` \| `hide` \| `restore` |
| POST | `/api/entries/moderate/bulk` | JWT | Moderator/admin: bulk `verify` \| `hide` \| `restore` on `{ ids: number[], action }`; returns per-id results |
| POST | `/api/entries/:id/vote` | JWT | Community verification votes |
| DELETE | `/api/entries/:id/vote` | JWT | Retract vote |
| POST | `/api/entries/:id/report` | JWT | Flag entry: `{ reason: 'spam'\|'offensive'\|'wrong'\|'duplicate'\|'other', note? }`; creator + duplicate (per user) forbidden |
| GET | `/api/entries/:id/reports` | JWT (moderator/admin) | Reports for an entry (open first, newest first) |
| POST | `/api/entries/contribute` | JWT | Propose additions/corrections to an existing lemma (`add_sense`, `add_example`, `correct_info`) |
| PATCH | `/api/entries/contributions/:id/approve` | JWT (moderator/admin) | Approve and merge proposed contribution into lemma |
| PATCH | `/api/entries/contributions/:id/reject` | JWT (moderator/admin) | Reject proposed contribution with reason |
| POST | `/api/auth/register` | no | Creates `contributor` |
| POST | `/api/auth/login` | no | JWT includes `role` |
| GET | `/api/users` | JWT (admin) | List all users (password hashes stripped) |
| PATCH | `/api/users/:id/role` | JWT (admin) | Promote/demote: `{ role: 'contributor'\|'moderator'\|'admin' }`; self-change and demoting the last admin are forbidden |
| GET | `/api/users/me/contributions` | JWT | Get user's own contribution history, filterable by `?status=pending\|approved\|rejected` |

Roles: `contributor` | `moderator` | `admin`.

---

## Invariants (break these = Phase 1 regression)

1. **Never** add translation columns as the primary key of meaning.
2. **Never** redefine `PartOfSpeech` / Lemma shape outside `@kamusi/core`.
3. **Always** set `language = 'sw'` on write paths.
4. **Always** require ≥1 sense with a non-empty definition.
5. **Always** append `JOURNAL.md` for architectural decisions.
6. Prefer clarity over marketing language (see Constitution writing style).
7. **Always** expose camelCase JSON to clients (DB columns may remain snake_case).

---

## How to run

```bash
cd ~/DEV/kamusi-lexicon
npm run install:all          # install + build packages
cd apps/api && docker compose up -d postgres redis
# Local: DB_SYNC=true in apps/api/.env
npm run api:dev              # from repo root → http://localhost:3001/docs
npm run web:dev              # from repo root → http://localhost:5173
```

### Migrations (shared / prod)

```bash
# In apps/api/.env:
# DB_SYNC=false
# Apply packages/database/sql/001_phase1_bootstrap.sql then 002_report_flagging.sql
# (or run TypeORM CLI against src/db/migrations/1754490000000-phase1-init.ts
#  followed by 1754500000000-report-flagging.ts)
```

### Tests (Vitest)

```bash
# Unit tests — no Docker required
npm run test                 # from repo root, or apps/api

# E2E — requires Postgres + Redis (docker compose up -d)
cd apps/api && npm run test:e2e
# Uses .env.test (localhost, DB_SYNC=true). RUN_E2E=1 set by script.
```

Phase 1 test coverage lives in `apps/api/test/unit/` and `apps/api/test/e2e/phase1-dictionary.e2e.spec.ts`.

Promote a moderator (local):

```sql
UPDATE users SET role = 'moderator' WHERE username = 'you';
```

---

## If you only fix one thing next

Phase 2 is paused. The current milestone is the Phase 1 MVP release. Review `MVP-RELEASE-PLAN.md` and start executing the P0/P1 hardening backlog (rate limiting, secrets, `DB_SYNC=false` + migrations in prod, backups, health endpoint, helmet, CI). The e2e promote/demote coverage previously flagged here is already in place (`apps/api/test/e2e/phase1-dictionary.e2e.spec.ts`, "user role management" block).

## Session note (2026-09-02)

Resolved Render build and TypeScript configuration issues:
1. Removed `tsconfig.base.json` completely. Each package (`@kamusi/core`, `@kamusi/database`, `apps/api`) now maintains self-contained `compilerOptions` with no relative `extends` paths.
2. Untracked accidentally committed `node_modules` and `dist` artifacts from git index.
3. Updated root `package.json` scripts (`build`, `build:all`, `build:api`, `build:web`, `build:admin`) to ensure dependent packages are built before applications.
4. Cleaned up redundant `prebuild` call in `apps/api/package.json`.
5. Added `@nestjs/cli` and `typescript` to root devDependencies and `apps/api` dependencies so `nest` binary is installed and linked in `node_modules/.bin/nest` even in production build environments.
6. Added support for `DATABASE_URL` (with automatic SSL handling) in TypeORM and `REDIS_URL` in CacheModule. Made Redis optional: if `REDIS_URL` and `REDIS_HOST` are omitted or unreachable, CacheModule falls back gracefully to in-memory caching instead of crashing on startup.
7. Verified `npm run build:all` and `npm test` passing cleanly.

## Session note (2026-08-21, later)

Fixed two boot blockers; see JOURNAL for detail:
1. `UsersModule` was missing `LemmaContribution` in its `forFeature(...)` registration (DI failure in `UsersService`).
2. POS enum drift: init migration + SQL bootstrap still used full-word enum labels after core moved to Swahili codes. Both files now create `'N','W','V','T','E','U','I','H'` with default `'N'`; local DB converted in place without data loss.
Gotcha: if the `api-api-1` Docker container is running it owns port 3001 and local `api:dev` cannot bind.

Same session, later still (see JOURNAL for detail):
3. All user-facing API validation/error messages localized to Kiswahili; the stale English POS error QA saw came from an outdated Docker image — container was rebuilt.
4. F6 web UI: contribution panel on `EntryPage`, moderator "Proposals" tab in admin dashboard backed by new `GET /api/entries/contributions?status=...`. Gotcha: `lemma_contributions` is dual-purpose (audit log + proposals); `findContributions` filters to proposal actions (`add_sense|add_example|correct_info`) so audit rows do not pollute the queue.
5. F7 web UI: `Michango yangu` page (`/my-contributions`) listing a contributor's own history with Kiswahili status badges.
6. Hero heading descender fix: `.hero h1` uses `line-height: 1.15` + `padding-bottom: 0.12em` so `g`/`y`/`j` tails can never be painted over by adjacent content, regardless of renderer. Do not remove the padding — it is the actual fix, not the line-height alone.


## Moderation state machine (Phase 1)

```
new entry ─────────────────────────────► pending (is_verified=false, is_hidden=false)
pending ──verify──► verified ──hide──► hidden ──restore──► verified
pending ──hide────► hidden
any ──report by contributor──► reported (report_count>0; still public until a moderator acts)
reported ──verify/hide/restore──► reports resolved (report_count=0)
```

Any moderator action (`verify | hide | restore`) on an entry with open reports resolves all of them. Reports never auto-hide content — human moderation decides.

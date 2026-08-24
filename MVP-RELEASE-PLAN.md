# MVP RELEASE PLAN — Phase 1 (Swahili → Swahili)

Phase 2 is paused. The objective now: make Phase 1 the MVP, release it, and have friends test and stress-test it.

This is a plan, not implementation. Sections marked **[do]** are steps to execute; nothing here changes code until approved.

---

## 1. Goal and scope

- **Goal:** a stable, deployable, publicly reachable Phase 1 Kamusi that a small group of friends can use daily: search, read entries, register, contribute, vote, report; moderators moderate; admins manage users.
- **Success criteria for the pilot:** friends can self-serve the full contributor loop without hand-holding; the platform survives a week of their use plus at least one synthetic load test without data loss or unrecoverable downtime.
- **Out of scope:** translations (Phase 2), AI, mobile apps, email/phone verification, password reset UX.

---

## 2. Current-state readiness

What exists today vs. what production requires.

| Area | Current state | Needed before release |
|---|---|---|
| API | NestJS, Dockerized, runs from monorepo build | — |
| Web (public) | Vite SPA, production build verified green | static hosting + build-time `VITE_API_URL` |
| Admin | Vite SPA, production build verified green | same as web; access control beyond login |
| Postgres | 15, Docker; `DB_SYNC=true` locally | `DB_SYNC=false` + migrations in prod |
| Redis | 7, used for API cache | managed or containerized; no persistence needed (cache only) |
| Schema | Migrations exist (phase1-init, report-flagging) + SQL copies | run explicitly in prod, never auto |
| Auth | JWT (HS256), bcrypt(10), roles contributor/moderator/admin | real `JWT_SECRET`; check token TTL config |
| Tests | 47 unit, 34 e2e, `tsc` clean, both SPAs build | CI gate on PR |
| Rate limiting | none | P0 — at least on `/auth/login` + write endpoints |
| Security headers | none (no helmet) | P1 |
| Health endpoint | none | P1 — needed by load balancer + alerts |
| Logging | console only | P1 — structured JSON logs + request id |
| HTTPS | none | provided by host edge (managed) or Caddy (VPS) |
| Backups | none | P0 — nightly `pg_dump` or provider-managed |
| Monitoring | none | P1 — uptime check + error/CPU/mem visibility |
| CI/CD | none | P1 — GitHub Actions: test → build → deploy |

---

## 3. Hosting recommendation

Two viable paths. Recommendation: **managed platform first, VPS as the scale path.**

### 3.1 Managed (recommended for the MVP)

One platform hosts Postgres, Redis, and the API; static sites for web/admin.

- **Render** or **Railway**. Both: `git push` deploys, auto HTTPS on a free `*.onrender.com` / `*.railway.app` subdomain, managed Postgres with automatic backups, managed Redis (Railway native; Render Redis add-on).
- Cost: roughly $0–10/mo at this scale (Render free tier ends Postgres after 30 days — start on a paid $7 Postgres to avoid a forced migration).
- Custom domain (you plan to buy one): both support it; TLS auto-provisioned. Cut over by pointing a DNS `A`/`CNAME`, no code change.

Why not a VPS first: friends-testing needs an always-on box with TLS, backups, and restarts handled. A $5–7/mo VPS (Hetzner CX22) is fine but bundles DNS, Caddy, certbot, cron backups, and OS patching into the MVP scope. Move there only if costs or data-residency requirements force it.

### 3.2 VPS alternative (when needed)

```
Caddy (TLS, reverse proxy)  →  api:3001  (Docker)
                            →  web static (Caddy file_server)
                            →  admin static (Caddy file_server)
Postgres 15 + Redis 7 as containers, nightly pg_dump to object storage
```

Caddy auto-issues certs; `docker compose` (already the repo pattern) runs the stack. Web/admin are built once (`vite build`) and served as static dirs — they are not long-running servers.

---

## 4. Pre-release testing plan

### 4.1 Functional QA matrix

Run manually against a staging deploy before launch. E2e already covers API logic; this matrix covers cross-stack flows and UI.

| # | Role | Flow | Steps | Expected |
|---|---|---|---|---|
| F1 | visitor | search + read | search verified word; open entry; follow synonyms/antonyms/derived | entry renders; related links resolve |
| F2 | visitor | empty/no-result | gibberish query | clean empty state, no error |
| F3 | visitor | access control | attempt contribute/vote/report URLs unauthenticated | redirected to auth; no data leak |
| F4 | contributor | register → contribute | create account; submit `dira` entry with sense + example | pending; not in public search |
| F5 | contributor | vote | vote +1 then retract | count updates; retract works |
| F6 | contributor | report | report an entry with reason + note | success message; no duplicate 409 on retry |
| F7 | moderator | verify | verify the contributed entry from admin pending queue | appears in public search |
| F8 | moderator | hide/restore + bulk | hide, restore, bulk verify | states flip; public visibility matches |
| F9 | moderator | reports | resolve a report via verify/hide | report resolves; reportCount 0 |
| F10 | admin | user roles | promote to moderator, demote | role takes effect on next request |
| F11 | admin | self-guard | try demoting own role; last admin | 403 |
| F12 | all | auth | wrong password, unknown user, malformed token | 401; no username enumeration in message |
| F13 | all | race | double-submit a contribution form | only one entry created |

### 4.2 Edge cases to add to the suite before launch

- Pagination on search and user lists (if unbounded today, cap page size).
- Long inputs: 10k-char definitions, 256-char words, many synonyms — ensure validation rejects gracefully.
- Unicode: Swahili digraphs `ch`, `ng`, `ny` sort/lowercase; Arabic-script test strings rejected or handled.
- Concurrency: two users verifying/reporting the same entry (unique constraints hold, no deadlock).
- Vote/report on a hidden entry (must not be reachable publicly).

### 4.3 Security checklist

- [ ] **P0** Rate limit `/api/auth/login` (e.g. 5/min/IP) and register (10/min/IP); basic throttler on writes.
- [ ] **P0** Real, generated `JWT_SECRET` (≥32 bytes, `openssl rand -hex 32`) in prod only; never the compose default.
- [ ] **P0** `DB_SYNC=false` in prod; schema via migrations only.
- [ ] **P1** `helmet` middleware (security headers).
- [ ] **P1** Swagger `/docs` off or gated in prod (exposes the full API schema).
- [ ] **P1** Admin app reachable only to the team: either not published, or basic auth/IP allowlist in front of it.
- [ ] **P1** CORS origins = exact prod origin(s), not `*`, not localhost.
- [ ] **P1** Verify JWT TTL is set (short-lived token + no refresh path is acceptable for MVP; document it).
- [ ] **P1** No secrets in the client bundle (VITE_* is public by design; keep only `VITE_API_URL`).
- [ ] Confirm error responses don't echo stack traces or SQL.

### 4.4 Data-integrity checks

- Entry update increments `version`; a revision row is written (exists today — spot check).
- Deleting a user leaves contributions/reports intact (foreign keys don't cascade away history).
- `report_count` returns to 0 when reports resolve (regression covered by unit test).

---

## 5. Stress / load testing

Two distinct things: **friends as real users** (section 12) and **synthetic load** (this section).

### 5.1 Tooling

- **k6** (recommended, scriptable, runs in CI or laptop). Alternatives: Vegeta, autocannon, Locust for a Python-oriented crowd.
- A load script is a new small file (`load-test/k6/*.js`) — add it as part of execution, not now.

### 5.2 Scenarios (mix = realistic read-heavy)

| Scenario | Endpoint mix | Weight | Notes |
|---|---|---|---|
| read (90%) | `GET /api/entries` search + `GET /api/entries/:id` | 90 | anonymous; hit Redis+PG cache paths |
| auth | `POST /api/auth/login`, register | 3 | also exercises bcrypt (CPU-heavy) |
| write | `POST /api/entries` contribute | 3 | slow path: validation + inserts |
| social | vote + report | 3 | unique-constraint contention |
| moderate | admin verify/bulk (2 concurrent) | 1 | run separately, not against public |

### 5.3 Targets (MVP scale)

- Ramp to **50 concurrent** users, hold 5 min, then **100 concurrent**, hold 5 min.
- Pass criteria: error rate < 0.5%, p95 latency ≤ 300 ms for reads, p95 ≤ 800 ms for writes, zero 5xx, zero deadlocks.
- Expected bottlenecks to watch: Postgres connection pool exhaustion (TypeORM default pool), bcrypt login latency, cache misses on cold Redis, N+1 on entry detail (senses → examples → translations later).

### 5.4 Running it safely

- Load-test **staging**, never the shared dev DB (e2e + smoke data live there), never prod before go-live.
- After each run: capture p95/p99, error rate, PG `pg_stat_activity`, Redis hit rate, API memory. Record numbers in the journal for comparison across runs.

---

## 6. Production hardening backlog (P0 → P1)

Planned items to implement before launch (not now — this doc is plan-only).

- P0: throttler (login + writes), secrets via env only, `DB_SYNC=false` + migration runner, backup job.
- P1: helmet, health endpoint (`GET /api/health` → DB + Redis ping), structured JSON logging with request ids, `/docs` gate, admin access control, CORS to real origins, CI (test/tsc/build on every PR; e2e against ephemeral Postgres+Redis), deploy pipeline.
- P2 (post-launch if pilot shows need): rate-limit tuning, read replicas, connection pool tuning, WAL archiving.

---

## 7. Deployment architecture

### 7.1 Managed platform layout

| Component | Type | Build | Notes |
|---|---|---|---|
| Postgres | managed DB | — | enable automated backups; version 15 |
| Redis | managed cache | — | small instance; no persistence needed |
| API | web service | root `Dockerfile` (`apps/api/Dockerfile`) | env from section 8; health check path `/api/health` |
| Web | static site | `npm run build --workspace=web` | set `VITE_API_URL=https://api-….onrender.com/api` at build time |
| Admin | static site | `npm run build --workspace=admin` | private to team (see 4.3) |

Env for API (all overridable): `DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, REDIS_HOST, REDIS_PORT, JWT_SECRET, DB_SYNC=false, DB_MIGRATIONS_RUN=true, NODE_ENV=production, CORS_ORIGINS=<prod origins>, PORT=3001`.

### 7.2 Domain plan

- Launch on the provider subdomain (`app.onrender.com` etc.). Friends only need a URL.
- When you buy the domain: add `www` + apex as a custom domain on the platform (TLS auto), update `CORS_ORIGINS`, rebuild SPAs with the new `VITE_API_URL`, then DNS cutover. No code change.

### 7.3 CI/CD

- GitHub Actions on PR: install → build packages → unit tests → `tsc` on api/web/admin → `vite build` both SPAs. E2e: spin Postgres+Redis via `docker compose` in the runner, run suite, tear down (never against a shared DB).
- Deploy: on merge to `main`, trigger platform deploy. Migrations run as an explicit release step before the new API container starts.

---

## 8. Secrets and environments

- `.env` files stay gitignored (already true). Provider env vars are the source of truth in prod.
- Rotate the committed compose defaults before any public exposure: the fallback DB password and `JWT_SECRET` in `docker-compose.yml` are dev-only. Generate fresh values for prod.
- Three environments: **dev** (local, `DB_SYNC=true`), **staging** (provider, mirrors prod, used for QA + load), **prod** (friends use this).

---

## 9. Monitoring, logging, alerting

- Uptime: free external check (UptimeRobot) on `/api/health` + the web URL; alert on 5xx or timeout.
- Logs: structured JSON to stdout (captured by platform); grep for `ERROR`/`exception`. Request ids to correlate.
- Metrics at MVP scale: provider dashboard for API CPU/mem, PG connections, Redis evictions. Enough for a friends pilot; skip full APM until Phase 3.
- Alert rule: page the owner on repeated 5xx (> 1% over 10 min) or health-check failure > 2 min.

---

## 10. Backups and restore

- **Managed:** enable Postgres automated backups (daily + PITR if available). Verify a restore once before launch (restore to a throwaway instance, count rows).
- **Self-managed:** cron `pg_dump -Fc` nightly, keep 7 daily + 4 weekly, push to object storage (Hetzner Object Storage, Backblaze B2). Test restore monthly.
- Restore drill (do once pre-launch): boot a fresh DB, apply migrations, restore dump, spot-check the count of lemmas/users, start API against it.

---

## 11. Launch checklist (go/no-go)

- [ ] Staging deploy green; QA matrix F1–F13 passed there.
- [ ] Load test at 50→100 concurrent passes targets (5.3).
- [ ] `DB_SYNC=false`, migrations applied from a fresh DB.
- [ ] Prod secrets generated; dev defaults rotated.
- [ ] HTTPS verified on all three URLs (web, api, admin).
- [ ] Health endpoint up; uptime monitor configured.
- [ ] Backups enabled + one restore drill passed.
- [ ] Admin not publicly reachable.
- [ ] `/docs` disabled or gated in prod.
- [ ] CORS lists only prod origins.
- [ ] Rollback path written down (section 13).

---

## 12. Friends testing program

Purpose: real usage and abuse, not just QA. Treat friends as the first user cohort.

- **Onboarding:** 5–10 friends. Give: one short message (URL, how to register, "search a word, add an entry, vote on something"), plus the role of 1–2 moderators via admin.
- **Test pack** (optional, one-page): ask each friend to do the visitor flow, then the contributor flow (add one real word), then try to break it: duplicate entries, gibberish input, spam reports, slow network.
- **Feedback capture:** a shared doc/board with three columns: *what worked, what broke, what was confusing*. Ask for repro steps + device/browser. Log everything; do not fix silently — keep the journal updated.
- **Support:** a single channel (WhatsApp/Telegram/Discord) for the pilot. Owner is on-call; weekly triage.
- **Success metrics to watch:** entries contributed vs entries verified; report volume; votes per entry; 5xx rate; support questions per day. These decide whether Phase 1 is "done" (section 14).
- **Boundaries to communicate:** data may be wiped between pilot iterations; no email verification; accounts are first-come.

---

## 13. Rollback and recovery

- **Code:** every API image tagged with commit hash. On regressions: redeploy the last-good tag; data migrations are forward-only, so never roll back a migration — ship a fix-forward migration instead.
- **Data:** restore from the latest verified backup (section 10) if a bad migration or manual error corrupts data.
- **Cache:** clear Redis on deploy (`cache-manager` may hold stale shapes) — cheap and avoids confusing states.
- **Suspected abuse:** block the user's account/role via admin, not by editing prod data by hand.

---

## 14. Post-launch criteria — when Phase 1 is "done"

Close the pilot when all hold, then revisit Phase 2:

1. Friends used the platform ≥ 1 week with no data loss.
2. ≥ 25 verified Swahili entries contributed through the UI by the cohort (proves the contributor loop works for real people).
3. ≥ 90% of pilot support questions answered from docs/known behavior (no new root-cause bug class in the final week).
4. Load test at 100 concurrent passes within 1.5× of targets.
5. Backups verified restorable twice.

---

## 15. Open decisions for the owner

1. Managed platform choice: Render vs Railway (both fine; pick on cost/subdomain preference).
2. Admin exposure: hidden from public vs basic-auth-gated.
3. Whether the pilot should wipe and restart data after load testing.
4. Domain: buy now or after pilot proves out (recommended: after).

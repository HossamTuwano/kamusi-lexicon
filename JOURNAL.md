# JOURNAL

Decision log for continuity across sessions and models.
Append newest entries at the top. Prefer evidence over persuasion.

---

## 2026-08-13 — Report button in public web + web production build fix

**Context:** The flagging feature was API + admin-only; contributors could only report via raw API calls. Also discovered `apps/web`'s production build (`vite build`) was broken — pre-existing, not introduced by recent work.

**Changes:**
1. **`apps/web` Report button** — `EntryPage.tsx` shows "Ripoti tatizo" for logged-in users: inline form with reason dropdown (`spam|offensive|wrong|duplicate|other`, Swahili labels) + optional note, "Tuma ripoti"/"Ghairi". Posts to `POST /entries/:id/report`; success hides the form ("Asante! Ripoti imepokelewa kwa wasimamizi."), errors (e.g. 409 already-reported) surface the API message. `api.report()` added in `apps/web/src/lib/api.ts`.
2. **Web build fix** — `vite build` failed with `"PartOfSpeech" is not exported by @kamusi/core`. Root cause: `@kamusi/core` is a symlinked workspace package resolving to a path outside real `node_modules`, so rollup's CJS handling (default include `/node_modules/`) skipped it and parsed the CJS `dist/index.js` as ESM. Fix: `apps/web/vite.config.ts` `build.commonjsOptions.include` adds `/packages\/(core|database)\//`. The admin app was unaffected because it never imports `@kamusi/core`.

**Verification:** API 47/47 unit, `tsc` clean; admin `tsc` clean + `vite build` ok; web `tsc` clean + `vite build` ok (first time the web production build has been verified green).

**Next:** rebuild the Docker API image so the running stack includes the flagging feature; then Phase 2 planning only (no Phase 1 work).

---

## 2026-08-13 — Community reporting / flagging state

**Context:** HANDOVER's next item was a `reported`/flagging state for spam or low-quality entries. Moderation was reactive only (moderators had to stumble across bad entries); there was no way for contributors to surface problems.

**Decisions / changes:**

1. **Report model** — new `lemma_reports` table (`@kamusi/database` entity `LemmaReport`): `(lemma_id, user_id)` unique, `reason` ∈ `spam|offensive|wrong|duplicate|other`, optional `note`, `status` ∈ `open|resolved`. Denormalized `lemmas.report_count` (matches the existing `vote_count` pattern). `POST /entries/:id/report` (JWT): any authenticated contributor except the entry's creator; duplicate report from the same user → 409. Records a `reported` contribution action (new `ContributionAction`).
2. **Reports do not auto-hide.** A reported entry stays public until a moderator acts — prevents report-abuse from knocking verified content off the dictionary. Human moderation decides.
3. **Resolution is a moderator decision** — `verify | hide | restore` in `applyModeration()` now also resolves all open reports for the entry and resets `report_count` to 0. Reuses the existing single + bulk moderation paths, so `POST /entries/moderate/bulk` clears reports too.
4. **Moderator-only reports view** — `GET /entries/:id/reports` (moderator/admin, newest first). Public `GET /entries/:id` does **not** leak reports; `reportCount` is exposed on moderation search so the admin Reported tab can list flagged entries.
5. **Admin UI** — new "Reported" tab on the dashboard (amber count badge on cards, select-all + bulk Verify/Hide which resolve reports); entry detail page shows a Reports section (reason/note/reporter/status) for moderators.
6. **Cache** — report creation and any moderation action now `cacheManager.clear()`, so the Reported tab and public search never serve stale report/visibility state (previously moderation caches could go stale for up to 1h).

**Migration:** `apps/api/src/db/migrations/1754500000000-report-flagging.ts` + `packages/database/sql/002_report_flagging.sql` for shared envs; local/e2e rely on `DB_SYNC=true`.

**Test coverage:** +6 unit (report create/self-report/duplicate/not-found, moderation resolves reports on verify + hide), +6 e2e (flag + queue surface, self-report 403, duplicate 409, unauthenticated 401, moderator-only reports list, verify resolves reports). 47/47 unit, 34/34 e2e; API `tsc` clean; admin `tsc --noEmit` clean + `vite build` succeeds.

**Next:** e2e coverage for the moderator promote/demote UI flow (API + guards covered); then Phase 2 planning only (no Phase 1 work).


## 2026-08-13 — Bulk moderation + user/role management (admin dashboard + API)

**Context:** HANDOVER's next items were bulk moderation actions and user/role management. Moderation was per-entry only (`POST /entries/:id/moderate`), so moderators had to click through cards for large queues. User roles could only be changed via direct DB updates (`UPDATE users SET role=...`).

**Decisions / changes:**

1. **Bulk moderation endpoint** — `POST /entries/moderate/bulk` with `{ ids: number[], action: 'verify'|'hide'|'restore' }` (JWT, moderator/admin). Service loop reuses the same `applyModeration()` path as single `moderate` so contribution history is recorded per entry (`verified`/`hidden`/`restored`). Returns `{ action, total, applied, results: [{ id, status: 'ok'|'not_found'|'error', error? }] }` — a missing id does not fail the batch.
2. **User management API** — `GET /users` (admin only, password hashes stripped) and `PATCH /users/:id/role` with `{ role }`. Guards: actors cannot change their own role, and the last admin cannot be demoted (both enforced in `UsersService.updateRole`). Controller asserts `role === 'admin'`.
3. **Admin dashboard** — checkboxes on entry cards, "Select all" in the grid header, and a context-aware bulk action bar (Pending → Verify/Hide selected; Hidden → Restore selected) that clears after success. Selection resets on tab switch.
4. **Users page** (`/users`) — table of users with role badges and promote/demote actions; read-only for non-admins. Login now stores `userId` so the UI can mark the current account and prevent self-role changes client-side.

**Test coverage:** +11 unit tests (bulkModerate: role guard, multi-verify + contributions, not-found partial success, empty ids; UsersService: password hashing, role update, self-change forbid, not-found, last-admin guard, admin-collision). +8 e2e (bulk verify, partial not-found, contributor 403, admin list without password, promote to moderator, contributor 403 on list/patch, self-change 403). 41/41 unit, 28/28 e2e; API `tsc` clean; admin `tsc --noEmit` clean + `vite build` succeeds.

**Next:** `reported`/flagging state if moderation volume grows; then Phase 2 planning only (no Phase 1 work).

## 2026-08-12 — Public visibility gate: only verified entries are public

**Context:** New entries were created `is_verified=false, is_hidden=false`, and public search filtered only `is_hidden`. That meant every contribution was public before any moderation — contradicting the "Pending Review" workflow and the Constitution's human-verification principle. `hide` was the only reactive tool; `verify` had no publication effect.

**Decision:** Public search (`GET /entries/search`) now requires `is_verified = true` **and** `is_hidden = false`. The moderator search (`GET /entries/moderation/search`) returns pending, hidden, and verified entries for moderators/admins only. This makes:
- `verify` → the publication gate (pending entries are private until a moderator verifies)
- `hide` → removal of previously verified/public content (spam, errors), with `restore` to bring it back
- the admin Pending/Hidden tabs the only surface for unverified/hidden content

`GET /entries/:id` intentionally stays open (shared by public detail, admin detail, and internal service logic).

**Test coverage added (e2e):** unverified lemma excluded from public search; hidden-but-verified lemma excluded; moderation search includes pending + hidden; contributors get 403 on moderation search. 20/20 e2e pass; 30/30 unit tests pass. Verified against the containerized API (create → hidden from public → verify → public).

---

## 2026-08-12 — Dockerized API fixed (monorepo install + module resolution)

**Context:** `docker compose up` failed at runtime with `PackageLoader: The "class-validator" package is missing`. Root cause was three layered issues in the API image:

1. **Stale/incomplete Dockerfile** — copied host `node_modules`, re-ran `npm install` in the production stage, and only built `apps/api` (never `@kamusi/core`/`@kamusi/database`). Rewrote it: layered manifest copy + `npm ci --legacy-peer-deps`, builds packages in dependency order, production stage copies only the runtime tree. Added repo-root `.dockerignore` (excludes `**/node_modules`, `**/dist`, `.env*`).
2. **Hoisting bug (the real one)** — npm nested `class-validator` under `apps/api/node_modules`, but `@nestjs/common` is hoisted to root. Nest `require`s `class-validator` from inside `@nestjs/common`, so root resolution failed. Local dev only worked because of a stray `/home/hossam/node_modules/class-validator`. Fix: declare `class-transformer` + `class-validator` as root `dependencies` so npm must install them at root `node_modules`.
3. **`@kamusi/database` had undeclared deps** — it imports `typeorm`/`class-transformer`/`@kamusi/core` but declared only `typescript`; the Docker build failed `tsc` on them. Added them to `packages/database/package.json`; `typeorm` is now hoisted to root.
4. **`Lemma.creator_id: number | null`** — union type reflects as `design:type: Object` (`emitDecoratorMetadata`), so TypeORM sync failed with `DataTypeNotSupportedError`. Added explicit `type: 'integer'`.
5. **`NODE_ENV=production` was hardcoded in the image** — that disables the admin seed. Moved control to compose: `NODE_ENV: ${NODE_ENV:-development}` (matches `DB_SYNC: ${DB_SYNC:-true}`). Compose stack is self-bootstrapping: schema sync + admin seed (`admin`/`admin123`).

**Verification:** image builds; container boots; login → create → hide → public search excludes → moderation search includes → restore all pass against the containerized API. Unit tests 30/30, admin `tsc` clean.

**Lesson:** do not rely on hoisting for Nest's dynamically-required packages (`class-validator`/`class-transformer`); the root workspace must own them. Docker build (`docker compose build api`) is the authoritative check, not local dev.

---

## 2026-08-12 — Moderator search wired into admin dashboard (hidden entries)

**Context:** The API already exposed `GET /entries/moderation/search` (includes hidden entries, moderator-only), but the admin UI was not using it. `getHidden()` in `lemmas.ts` was a stub that called the public search (which filters `is_hidden=false`) and therefore always returned `[]`. Hidden entries could not be listed or restored from the dashboard.

**Changes:**
1. `apps/admin/src/lib/lemmas.ts` — `getHidden()` now calls `GET /entries/moderation/search` (JWT attached via `authenticatedFetch`) and filters to `isHidden` only.
2. `apps/admin/src/pages/DashboardPage.tsx` — added Pending/Hidden tabs. Hidden tab uses `useHiddenLemmas`; hidden entries render with a red badge and a **Restore** action. Refactored the entry card into a shared `EntryCard`/`LemmaGrid` so both tabs reuse the same markup. Mutation invalidation (`lemmaKeys.lists()`) refreshes both tabs after verify/hide/restore.

**Verification:**
- Admin `tsc --noEmit` passes; `vite build` succeeds
- API `tsc --noEmit` passes; all 30 unit tests pass

**Next:** bulk moderation actions; user/role management in admin UI; e2e coverage for the moderation search endpoint.

---

## 2026-08-12 — Entity consolidation + Admin UI expansion

**Context:** Two remaining Phase 1 checklist items: entities duplicated between `apps/api` and `packages/database`, and admin UI was minimal (single dashboard page).

**Entity consolidation (`@kamusi/database`):**
1. Fixed `packages/database/src/entities/vote.entity.ts` — broken relative imports pointed at non-existent API paths; corrected to sibling entity imports.
2. Fixed `packages/database/src/entities/index.ts` — exported `Vote` (non-existent class) instead of `VerificationVote`.
3. Updated `packages/database/tsconfig.json` — added `experimentalDecorators`, `emitDecoratorMetadata`, `strictPropertyInitialization: false` so TypeORM entity decorators compile.
4. Rebuilt `@kamusi/database` — now exports all 7 entity classes (`User`, `Lemma`, `Sense`, `Example`, `LemmaContribution`, `LemmaRevision`, `VerificationVote`).
5. Refactored `apps/api` — all modules, services, seeds, test helpers, and factories now import entities from `@kamusi/database` instead of local duplicates.
6. Deleted 7 duplicated entity files from `apps/api/src/**/entities/`.

**Admin UI expansion:**
1. **Entry detail page** (`/entries/:id`) — shows full lemma metadata, all senses with examples, contribution history table, expandable revision snapshots, and moderator actions (verify/hide/restore).
2. **Dashboard search** — debounced search input filters pending entries by word.
3. **Entry cards link to detail** — clicking a card navigates to the full detail view.
4. **Restore action** — available on the entry detail page for hidden entries (moderator-only).
5. **Removed duplicate `QueryClientProvider`** — `App.tsx` no longer creates its own; `main.tsx` already provides one.

**Verification:**
- All 29 unit tests pass
- API builds cleanly (`tsc` + `nest build`)
- Admin app: `tsc --noEmit` passes, `vite build` succeeds
- Pre-existing vite type version mismatch in `tsc -b` (not introduced by these changes)

**Known limitation:** The search API (`GET /entries/search`) filters `is_hidden=false`, so the admin dashboard currently cannot list hidden entries for restore. A moderator-only search flag or separate endpoint is needed to surface hidden entries in the dashboard.

---

## 2026-08-12 — Admin UI moderation dashboard implemented

**Context:** Phase 1 API was fully functional (all 17 e2e tests passing), but Admin UI dashboard wasn't wired to the moderation endpoints. Task: complete the dashboard to enable moderators to review and verify/hide entries.

**Changes:**
1. **apps/admin/src/lib/lemmas.ts**:
   - Fixed `getPending()` to filter entries for unverified only (isVerified=false) — was returning all entries
   - Fixed `moderate()` to send action in request body instead of query param (API spec requires body)

2. **apps/admin/src/pages/DashboardPage.tsx**:
   - Added role-based button disabling (only moderators/admins can moderate)
   - Added better card display: word, definition, example sentence, contributor info
   - Added visual feedback during moderation (opacity change)
   - Improved empty state message
   - Added helpful warnings for non-moderator accounts

**Features now working:**
- ✅ List unverified lemmas in grid view
- ✅ Verify button (calls POST /entries/:id/moderate with action=verify)
- ✅ Hide button (calls POST /entries/:id/moderate with action=hide)
- ✅ Role-based access control (visibly disabled for non-moderators)
- ✅ Auto-refresh on successful moderation (React Query invalidation)
- ✅ Loading/error states with user-friendly messages

**Test result:**
- ✅ All 17 e2e tests still passing (no regressions)
- ✅ Moderation endpoint tested end-to-end in e2e suite

**Scope for future:**
- Restore button for explicitly viewing/restoring hidden entries (low priority — hidden entries can be restored via API if needed)
- Search/filter by word or contributor (future enhancement)
- Bulk actions (future enhancement)

---

## 2026-08-12 — ValidationPipe forbidNonWhitelisted + nested DTO fix

**Context:** Phase 1 e2e tests were failing (10/17) with 400 Bad Request on POST /entries. Root cause: `forbidNonWhitelisted: true` was rejecting nested Sense/Example DTO properties before `class-transformer` could instantiate them.

**Error symptom:**
```json
{
  "message": [
    "senses.0.property definition should not exist",
    "senses.0.property usageNote should not exist",
    "senses.0.property examples should not exist"
  ],
  "statusCode": 400
}
```

**Fix applied:**
- Modified `apps/api/src/configure-app.ts` ValidationPipe configuration
- Added `transformOptions: { enableImplicitConversion: true, excludeExtraneousValues: false, exposeDefaultValues: true }`
- This allows `class-transformer` to transform nested DTOs before validation rejects them
- No code logic changed; only validation/transform pipeline order

**Outcome:**
- ✅ All 17 e2e tests now pass (was 7/17)
- ✅ All 29 unit tests still pass
- ✅ Phase 1 compliance verified end-to-end (search, create, update, delete, moderate, vote)

---

**Context:** Phase 1 e2e tests were failing (10/17) with 400 Bad Request on POST /entries. Root cause: `forbidNonWhitelisted: true` was rejecting nested Sense/Example DTO properties before `class-transformer` could instantiate them.

**Error symptom:**
```json
{
  "message": [
    "senses.0.property definition should not exist",
    "senses.0.property usageNote should not exist",
    "senses.0.property examples should not exist"
  ],
  "statusCode": 400
}
```

**Fix applied:**
- Modified `apps/api/src/configure-app.ts` ValidationPipe configuration
- Added `transformOptions: { enableImplicitConversion: true, excludeExtraneousValues: false, exposeDefaultValues: true }`
- This allows `class-transformer` to transform nested DTOs before validation rejects them
- No code logic changed; only validation/transform pipeline order

**Outcome:**
- ✅ All 17 e2e tests now pass (was 7/17)
- ✅ All 29 unit tests still pass
- ✅ Phase 1 compliance verified end-to-end (search, create, update, delete, moderate, vote)

---

## 2026-08-11 — Admin UI CORS & Docker monorepo build fixes

**Context:** Docker build failed on `@kamusi/core` npm 404 when building `api` image in `apps/api/docker-compose.yml`, and Admin UI login encountered CORS preflight issues.

**Decisions / changes:**

1. **Docker monorepo build context**: Removed obsolete `version: '3.8'` attribute from `docker-compose.yml`. Configured `api` service build context to monorepo root (`context: ../..`, `dockerfile: apps/api/Dockerfile`) so Docker inherits `packages/core` and workspace manifests instead of querying the public NPM registry.
2. **Explicit CORS configuration**: Configured explicit `app.enableCors` inside `configureApp(app)` targeting `CORS_ORIGINS` (including `http://localhost:5174` for `apps/admin` and `5173` for `apps/web`) with credentials and headers allowed (`Authorization`, `Content-Type`, etc.).
3. **Admin login token compatibility**: Updated `LoginPage.tsx` to handle `accessToken` (camelCase wire format) alongside `access_token`.

---

**Context:** Docker build failed on `@kamusi/core` npm 404 when building `api` image in `apps/api/docker-compose.yml`, and Admin UI login encountered CORS preflight issues.

**Decisions / changes:**

1. **Docker monorepo build context**: Removed obsolete `version: '3.8'` attribute from `docker-compose.yml`. Configured `api` service build context to monorepo root (`context: ../..`, `dockerfile: apps/api/Dockerfile`) so Docker inherits `packages/core` and workspace manifests instead of querying the public NPM registry.
2. **Explicit CORS configuration**: Configured explicit `app.enableCors` inside `configureApp(app)` targeting `CORS_ORIGINS` (including `http://localhost:5174` for `apps/admin` and `5173` for `apps/web`) with credentials and headers allowed (`Authorization`, `Content-Type`, etc.).
3. **Admin login token compatibility**: Updated `LoginPage.tsx` to handle `accessToken` (camelCase wire format) alongside `access_token`.

---

## 2026-08-06 — Frontend readiness gaps 1–5

**Context:** Unit/e2e green, but five gaps blocked a real Phase 1 browser consumer.

**Decisions / changes:**

1. **CORS** — `configureApp()` enables CORS from `CORS_ORIGINS` (default Vite `5173`).
2. **camelCase wire format** — request DTOs + `CamelCaseInterceptor` align JSON with `@kamusi/core` (`partOfSpeech`, `accessToken`, …). DB columns stay snake_case.
3. **Votes e2e** — cast, retract, self-vote forbid, duplicate conflict covered in Phase 1 e2e.
4. **Migrations** — `Phase1Init1754490000000` + expanded SQL bootstrap; `synchronize` only when `DB_SYNC=true`. Apply SQL/CLI for shared envs (no Nest runtime `.ts` migration glob — breaks Vitest/ESM).
5. **`apps/web`** — Vite + React Phase 1 UI: search, entry, auth, contribute, vote. `npm run web:dev`.
6. **`PartOfSpeech`** — const object (not TS enum) for clean Nest + Vite interop.

**Still open:** `apps/admin`; move TypeORM entities into `@kamusi/database`.

---

## 2026-08-05 — Phase 1 gap closure (gaps 1–8)

**Context:** Audit found Phase 1 direction correct but incomplete vs Constitution.

**Decisions / changes:**

1. **`@kamusi/core` is now wired into the API.** `PartOfSpeech`, language constant, roles, and create-input types live in core. API entities import the enum; they do not redefine it.
2. **Lemma fields expanded:** synonyms, antonyms, derived_words, dialect, source, version. Language forced to `sw` on create/update/search.
3. **Contributor history:** `lemma_contributions` records created/updated/verified/hidden/restored/deleted.
4. **Versioning:** `lemma_revisions` stores JSON snapshots; `PATCH /entries/:id` bumps version and writes a revision.
5. **Moderation roles:** User.role = contributor | moderator | admin. JWT carries role. `POST /entries/:id/moderate` with verify|hide|restore.
6. **Delete ownership fixed:** only creator or moderator; verified entries require moderator.
7. **Uniqueness:** unique on `(word, part_of_speech)`, not word alone.
8. **Framing:** removed Dict.cc / “bidirectional” copy from Swagger and search summary.
9. **Scaffolding:** `@kamusi/database` package + SQL bootstrap note; `apps/web` and `apps/admin` placeholders; `HANDOVER.md` + this Journal.

**Still soft / not NLP-complete:** Swahili definition enforcement is structural (required non-empty sense) plus a light incomplete-gloss guard — not a full language detector. Deletes are soft (`is_hidden`) so history survives.

**Next sensible work:** migrate TypeORM entities into `@kamusi/database`; add real migrations; promote a first moderator via DB/seed; start `apps/web` only after API contract feels stable.

---

## 2026-08-05 — Monorepo conversion (prior)

Converted single API repo → npm workspaces monorepo (`apps/*`, `packages/*`) to support longevity. Canonical model introduced under `packages/core`.

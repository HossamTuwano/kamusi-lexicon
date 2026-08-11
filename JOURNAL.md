# JOURNAL

Decision log for continuity across sessions and models.
Append newest entries at the top. Prefer evidence over persuasion.

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

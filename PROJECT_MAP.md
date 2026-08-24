# 🧠 PROJECT MAP: kamusi-lexicon

## 🚩 THE DIRECTIVE

Lifelong mission: professional, open-source lexical infrastructure for Swahili.
**Primary goal: monolingual Swahili → Swahili Kamusi (Phase 1).**

**CRITICAL DOCUMENTS (read in order):**

1. `apps/api/CONSTITUTION.md` — unchanging laws
2. `apps/api/VISION.md` — north star
3. `HANDOVER.md` — operational truth for the next session/model
4. `JOURNAL.md` — decision history (append-only)
5. `packages/core/src/index.ts` — canonical data model

---

## 🏗️ ARCHITECTURE (Monorepo)

NPM Workspaces.

### `/apps`

- `apps/api` — NestJS engine (primary logic today)
- `apps/web` — Phase 1 public Kamusi (Vite + React)
- `apps/admin` — planned moderation UI

### `/packages`

- `packages/core` — **canonical types**. Import; do not duplicate.
- `packages/database` — schema constants + SQL bootstrap notes

---

## 📍 CURRENT STATUS (August 12, 2026)

- **Phase:** 1 (Swahili → Swahili)
- **Data model:** Lemma → Senses → Examples, plus synonyms/antonyms/derived words/dialect/source
- **API wire format:** camelCase
- **Governance:** contributor history, revisions, moderator roles
- **Entities:** consolidated in `@kamusi/database` (single source of truth)
- **Recent work:** entity consolidation, admin UI (detail view, search, restore)

---

## 📝 HANDOVER

Start at `HANDOVER.md`. Maintain `JOURNAL.md` after every major decision.

_This project is a mission of service. Build it with precision, dignity, and respect for the Swahili language._

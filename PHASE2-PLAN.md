# PHASE 2 PLAN — Translation-Ready Schema

Planning only. No Phase 1 code changes.

- Status: draft for review
- Phase 2 scope per `apps/api/CONSTITUTION.md`: add translations (Sw ↔ En, Sw ↔ De, Sw ↔ Es) while keeping the database centered on Swahili.
- Invariant 1 applies: **never add translation columns as the primary key of meaning.**

---

## 1. The constraint that shapes everything

The constitution is explicit and it narrows the design space:

1. The database is centered on Swahili. Every lexical entry exists in Swahili first.
2. Translations are optional metadata attached to a Swahili lexical entry — never the foundation.
3. Translations must never become the primary key of meaning.

"Meaning" today is the Swahili **sense** (`lemmas` → `senses` → `examples`). The Phase 1 sense already carries the disambiguated definition (`gari` = "car" and `gari` = "railway carriage" are two senses). That sense is the natural anchor for translations, and using it means translations are genuinely metadata of a Swahili entry, exactly as the constitution describes.

---

## 2. Recommended shape: sense-anchored translations

Add one relation table. Nothing in the Phase 1 schema changes.

```
lemmas (sw) 1—* senses (sw definition) 1—* examples (sw)
                              |
                              | 1—* translations (language, word, …)
```

Each translation row is a target-language word (or lemma form) for one Swahili sense.

```sql
CREATE TABLE translations (
  id              BIGSERIAL PRIMARY KEY,
  sense_id        BIGINT NOT NULL REFERENCES senses(id) ON DELETE CASCADE,
  language        VARCHAR(8)  NOT NULL DEFAULT 'en',   -- ISO 639-1: en, de, es
  word            TEXT        NOT NULL,                 -- target-language word
  part_of_speech  VARCHAR(16),                          -- nullable: inherits sense POS
  gloss           TEXT,                                 -- short target-language gloss, optional
  notes           TEXT,                                 -- contributor notes, optional
  creator_id      BIGINT REFERENCES users(id),
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  is_hidden       BOOLEAN NOT NULL DEFAULT FALSE,
  version         INT     NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX translations_sense_lang_word_uniq
  ON translations (sense_id, language, lower(word));

CREATE INDEX translations_lang_word_idx
  ON translations (language, lower(word));
```

Why this shape:

- **Constitution-compliant.** The translation points *to* a Swahili sense; the sense remains the unit of meaning. The unique key is (sense, language, word) — never a translation column on the sense.
- **Zero Phase 1 churn.** `lemmas`, `senses`, `examples` are untouched. Phase 1 API, UI, and tests keep working. The migration is purely additive.
- **Disambiguation for free.** Because senses already separate meanings, "gari (car)" and "gari (railway carriage)" get independent translation rows — no extra machinery.
- **Reverse lookup is an index scan.** Finding the Swahili entry for English "car" is `WHERE language='en' AND lower(word)='car'` → sense_id → Swahili lemma. `translations_lang_word_idx` covers it.
- **Parity of governance.** Same ownership, verification, hiding, versioning, and reporting model as lemmas, applied to translations.

---

## 3. Rejected alternative: concept-anchored (WordNet-style)

```
concepts (language-neutral meaning)
   ├── senses (sw)
   └── translations (other languages)
```

- Pros: symmetric N-language model; better fit for future NLP/synset clustering (Phase 5).
- Cons: introduces a new "meaning" entity that competes with the Swahili sense; translation becomes a peer of the Swahili definition rather than metadata of it; concept identity is expensive to establish well; heavy migration for no Phase 2 requirement. The constitution's "Sw ↔ En/De/Es" goal does not need a concept layer.

Decision: sense-anchored now. If a future phase needs symmetric language pairs (e.g. En ↔ De without passing through Swahili), promote `senses` to concept anchors then. The `translations` table is a strict subset of that model, so the later migration stays additive.

---

## 4. Canonical types (`@kamusi/core`, Phase 2)

Additions only; existing types unchanged (invariant 2).

```ts
export interface Translation {
  id?: string | number;
  senseId: string | number;
  language: string;              // ISO 639-1
  word: string;
  partOfSpeech?: PartOfSpeech;   // defaults to the sense's POS
  gloss?: string;
  notes?: string;
  isVerified: boolean;
  isHidden?: boolean;
  version: number;
  createdAt?: Date;
}

export interface CreateTranslationInput {
  senseId: string | number;
  language: string;
  word: string;
  partOfSpeech?: PartOfSpeech;
  gloss?: string;
  notes?: string;
}
```

- `Sense` gains `translations?: Translation[]` (embedded in entry responses).
- `ContributionAction` union gains `'translated' | 'translation_verified' | 'translation_hidden' | 'translation_restored'` so the existing contributions log records translation work without a new table.
- `language` on lemmas remains `'sw'` (invariant 3). Translation rows carry their own language.

---

## 5. API surface (Phase 2, planned)

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/entries/:id/senses/:senseId/translations` | JWT contributor | create translation |
| PATCH | `/translations/:id` | owner or moderator | bump version |
| DELETE | `/translations/:id` | owner (unverified) or moderator | soft/hard per policy |
| POST | `/translations/:id/moderate` | moderator/admin | `verify` \| `hide` \| `restore` |
| GET | `/entries/:id` | public | senses embed `translations` (verified only) |
| GET | `/translations?language=en&word=car` | public | reverse lookup → Swahili lemma |

Wire format camelCase, mirroring Phase 1.

---

## 6. Web UI (planned)

- **Entry page.** Each sense shows a Translations block (En/De/Es). Logged-in contributors add translations inline, mirroring the report/contribute forms. Moderators get verify/hide controls.
- **Reverse search.** A language dropdown on the search box (default Swahili). When a non-Swahili language is selected, the query hits `/translations?language=…&word=…` and the results link to the Swahili entry. Search remains Swahili-first by default.
- **Admin.** A Translations tab/queue alongside Pending, reusing the moderation UI patterns (report badges, verify/hide/restore, bulk actions).

---

## 7. Governance and data quality

Match Phase 1 rigor:

- Creator ownership + moderator override on translations.
- Versioning: `translation_revisions` snapshot table mirroring `lemma_revisions`, or fold into the existing revision model. Recommend a dedicated table for parity.
- Reporting: extend the flag model to translations (`translation_reports` or generalize `lemma_reports`). Flagged translations feed the same moderation queue.
- Migration: additive `003_translations.sql` (shared envs) + TypeORM migration; `DB_SYNC=true` local dev unaffected. `@kamusi/database` entity added; packages rebuilt.

---

## 8. Decisions to confirm before implementation

1. Anchor: sense_id (recommended here) vs concept table. Confirmed by this plan unless counter-arguments surface.
2. First languages: `en` first; `de`, `es` next per constitution.
3. Translations go through the same moderation/reporting pipeline as lemmas. Recommended yes.
4. `part_of_speech` on translations: explicit column, nullable, inherits the sense POS.
5. Versioning: dedicated `translation_revisions` table. Recommended yes.

---

## 9. Non-goals for Phase 2

- Machine translation or AI-generated glosses.
- English (or other) lemmas as first-class entries.
- Symmetric bilingual browsing (En → De) without passing through Swahili.
- Changing the anchor of meaning away from the Swahili sense.

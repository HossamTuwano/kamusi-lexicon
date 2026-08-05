# 🧠 PROJECT MAP: kamusi-lexicon

## 🚩 THE DIRECTIVE
This project is a lifelong mission to build a professional, open-source lexical infrastructure for the Swahili language. 
**The primary goal is a monolingual Swahili-to-Swahili Kamusi.**

**CRITICAL DOCUMENTS:**
- `apps/api/CONSTITUTION.md`: The unchanging laws of the project.
- `apps/api/VISION.md`: The long-term goal and "North Star."

---

## 🏗️ ARCHITECTURE (Monorepo)
This is an NPM Workspaces monorepo designed for extreme longevity and scalability.

### `/apps` (Deployable Applications)
- `apps/api`: The core NestJS engine. Currently the primary source of logic.
- `apps/web`: (Planned) Public-facing dictionary.
- `apps/admin`: (Planned) Expert moderation and curation tool.

### `/packages` (The Shared Truth)
- `packages/core`: **The Canonical Data Model.** This is the most important package. It defines what a Lemma, Sense, and Entry are. It ensures that the API, Web, and Admin apps all speak the same linguistic language.
- `packages/database`: Shared database schemas and migration logic.

---

## 📍 CURRENT STATUS (August 5, 2026)
- **Phase:** 1 (Swahili $\rightarrow$ Swahili).
- **Current Objective:** Evolving the data model from a "flat" structure (one word = one definition) to a "structured" model (Lemma $\rightarrow$ Multiple Senses $\rightarrow$ Multiple Examples).
- **Recent Milestone:** Successfully converted the project from a single API repo to a Monorepo structure to support future growth.

---

## 📝 HANDOVER INSTRUCTIONS FOR FUTURE MODELS
If you are a new model taking over this session:
1. **Do not assume this is a simple dictionary app.** It is linguistic infrastructure.
2. **Read `apps/api/CONSTITUTION.md` immediately.** If a feature request conflicts with the Constitution, the Constitution wins.
3. **Prioritize `packages/core`.** The "truth" of the language must live in the shared core, not buried in the API controllers.
4. **Maintain the Journal.** Every major decision must be documented in the project's history to ensure continuity across sessions.

*This project is a mission of service. Build it with precision, dignity, and respect for the Swahili language.*

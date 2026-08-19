# Kamusi Lexicon

A professional, open-source lexical infrastructure for the Swahili language.

## 🎯 The Mission

The goal of this project is to build a high-quality, digital *Kamusi* (dictionary) for Swahili. Unlike many existing resources, this project is **monolingual first**. We believe that the foundation of a strong language infrastructure is a system where Swahili explains Swahili.

Our primary objective is to create a structured, machine-readable lexical database that serves as a source of truth for meanings, grammatical usage, and examples, entirely in Swahili.

## 🛠️ Project Architecture

This is a monorepo designed for scalability and integration.

- **`apps/api`**: A NestJS-powered engine providing the core lexical logic and data management.
- **`apps/web`**: The public-facing Swahili Kamusi interface.
- **`packages/core`**: The canonical data models and types used across the entire ecosystem.
- **`packages/database`**: Schema definitions and SQL bootstrap scripts.

## 📜 The Constitution

This project is guided by a strict **Project Constitution** located at `apps/api/CONSTITUTION.md`. 

The Constitution ensures that the project does not drift into becoming a simple translation tool or an AI experiment. It mandates that:
1. **Swahili is the foundation**: Every entry must exist in Swahili before any translation is added.
2. **Phase-based Growth**: We focus on the monolingual Swahili $\rightarrow$ Swahili experience (Phase 1) before expanding into translations or NLP tools.
3. **Precision over Hype**: We prioritize engineering clarity and lexical accuracy over marketing language.

## 🤝 Contributing

We welcome contributions from linguists, software engineers, and Swahili speakers. This is a community-maintained effort.

### How to get started
1. **Explore the Data Model**: Read `packages/core/src/index.ts` to understand how lemmas, senses, and examples are structured.
2. **Local Setup**:
   - Clone the repository.
   - Run `npm run install:all` to set up dependencies and build shared packages.
   - Use `docker compose up -d` in `apps/api` to start the database and cache.
   - Run `npm run api:dev` to start the backend.
3. **Submit a Proposal**: We prefer thoughtful contributions. If you have a feature request or a correction, please open an issue or a PR that aligns with the Project Constitution.

### Contribution Guidelines
- **Monolingual First**: When adding new words or definitions, ensure the Swahili definition is the priority.
- **Evidence-Based**: Provide sources or usage examples for new lexical entries.
- **Technical Quality**: All code must be typed, tested, and follow the project's architectural patterns.

## 🗺️ Roadmap

- [x] **Phase 1**: Monolingual Swahili $\rightarrow$ Swahili (Core search, contribution, and moderation).
- [ ] **Phase 2**: Adding optional translations (Sw $\leftrightarrow$ En, Sw $\leftrightarrow$ De, etc.).
- [ ] **Phase 3**: Public Developer APIs for third-party integration.
- [ ] **Phase 4**: Advanced language tools (Spell checking, NLP).

---

*This project is a mission of service to the Swahili language. We build with precision, dignity, and respect for the linguistic heritage of the Swahili-speaking world.*

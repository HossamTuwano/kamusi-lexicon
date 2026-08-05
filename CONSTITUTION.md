# PROJECT CONSTITUTION
## Open Swahili Lexical Platform

This document defines the permanent direction of this project. It is intended to prevent future design decisions from drifting away from the original objective.

Whenever future discussions introduce new features, architecture, APIs, or integrations, they must be evaluated against this document.

If a suggestion conflicts with these principles, prefer these principles.

---

# Origin

The project originated from a long-standing observation.

When searching for words in languages such as English, German or Spanish, Google often displays rich dictionary entries containing:

- definitions
- multiple meanings
- pronunciation
- grammatical information
- synonyms
- etymology
- usage examples

Searching equivalent Swahili words often does not provide the same level of structured lexical information.

This is understood as a language infrastructure problem rather than simply a search engine problem.

The project therefore exists to help build better lexical infrastructure for Swahili.

Google is not the project.

Google was the observation that motivated the project.

---

# Primary Objective

The first objective is NOT translation.

The first objective is NOT multilingual support.

The first objective is NOT AI.

The first objective is NOT machine translation.

The first objective is to build a digital Kamusi for Swahili where Swahili explains Swahili.

Every design decision should reinforce this objective.

---

# Core Principle

The platform is monolingual first.

Every lexical entry must exist in Swahili before it exists in any other language.

Translations are optional metadata attached to a Swahili lexical entry.

Translations are never the foundation of the database.

The database is centered on Swahili.

---

# Canonical Data Model

Every lexical entry begins with Swahili information.

Example:

Lemma:
gari

Language:
sw

Definition (Swahili):
Chombo cha usafiri kinachotumika kubeba watu au mizigo.

Part of speech:
Nomino

Plural:
magari

Example sentence:
Nimenunua gari jipya.

Synonyms

Antonyms

Derived words

Related words

Pronunciation

Usage notes

Dialect information

Contributor history

Only after this foundation exists may translations be added.

Example:

English:
car

German:
Auto

Spanish:
coche

French:
voiture

Arabic:
سيارة

These are attributes of the Swahili word—not the other way around.

---

# Development Philosophy

The project grows outward from the Swahili language.

The progression should look like this:

Phase 1

Swahili → Swahili

Community-maintained Kamusi

↓

Phase 2

Add translations

Sw ↔ En

Sw ↔ De

Sw ↔ Es

↓

Phase 3

Developer APIs

↓

Phase 4

Search

Spell checking

Language learning

↓

Phase 5

Language technology

Machine translation

NLP

AI

Speech

Other integrations

Every future capability depends on the quality of Phase 1.

---

# What This Project Is

This project is:

- a digital Kamusi
- a structured lexical database
- an API for lexical data
- community maintained
- moderated
- version controlled
- machine readable
- designed for software integration

---

# What This Project Is Not

It is not:

- Google Translate
- an AI chatbot
- a translation website
- a bilingual dictionary first
- an LLM
- a language model

Those systems may eventually consume this data.

They are not the product.

---

# Long-Term Vision

The long-term objective is to create a high-quality lexical resource for Swahili that can support:

- education
- software development
- researchers
- universities
- language institutions
- BAKITA
- future collaborations with international organizations such as the European Union

These are future possibilities.

They are not assumptions.

The proposal and project documentation should never imply partnerships or endorsements that do not exist.

---

# Writing Style

Avoid AI-generated writing patterns.

Avoid exaggerated marketing language.

Avoid startup buzzwords.

Avoid phrases such as:

"not just..."

"more than..."

"game changing"

"revolutionary"

"unlocking"

"transforming"

"leveraging"

Write like an experienced software engineer explaining an architecture to other engineers and decision makers.

Prefer evidence over persuasion.

Prefer clarity over excitement.

---

# Permanent Rule

Whenever there is uncertainty about a feature, ask:

"Does this strengthen the Swahili Kamusi itself?"

If the answer is yes, it belongs in the current phase.

If the answer is no, it probably belongs in a later phase.

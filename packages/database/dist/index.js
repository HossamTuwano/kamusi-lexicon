"use strict";
/**
 * Shared database package for Kamusi.
 *
 * Holds SQL bootstrap scripts and schema constants.
 * TypeORM migration source of truth for Phase 1:
 *   apps/api/src/db/migrations/1754490000000-phase1-init.ts
 * Mirror SQL: sql/001_phase1_bootstrap.sql
 *
 * Local/dev: DB_SYNC=true is OK for throwaway DBs.
 * Shared/staging/prod: DB_SYNC=false and DB_MIGRATIONS_RUN=true.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNIQUE_LEMMA_KEY = exports.PHASE1_TABLES = exports.REQUIRED_EXTENSIONS = void 0;
exports.REQUIRED_EXTENSIONS = ['pg_trgm'];
exports.PHASE1_TABLES = [
    'users',
    'lemmas',
    'senses',
    'examples',
    'verification_votes',
    'lemma_contributions',
    'lemma_revisions',
];
exports.UNIQUE_LEMMA_KEY = ['word', 'part_of_speech'];

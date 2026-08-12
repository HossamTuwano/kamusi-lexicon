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
export * from './entities';
export declare const REQUIRED_EXTENSIONS: readonly ["pg_trgm"];
export declare const PHASE1_TABLES: readonly ["users", "lemmas", "senses", "examples", "verification_votes", "lemma_contributions", "lemma_revisions"];
export declare const UNIQUE_LEMMA_KEY: readonly ["word", "part_of_speech"];

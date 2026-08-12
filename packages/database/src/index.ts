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

// Entity exports for shared use across packages
export * from './entities';

export const REQUIRED_EXTENSIONS = ['pg_trgm'] as const;

export const PHASE1_TABLES = [
  'users',
  'lemmas',
  'senses',
  'examples',
  'verification_votes',
  'lemma_contributions',
  'lemma_revisions',
] as const;

export const UNIQUE_LEMMA_KEY = ['word', 'part_of_speech'] as const;

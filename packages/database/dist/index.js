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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNIQUE_LEMMA_KEY = exports.PHASE1_TABLES = exports.REQUIRED_EXTENSIONS = void 0;
// Entity exports for shared use across packages
__exportStar(require("./entities"), exports);
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

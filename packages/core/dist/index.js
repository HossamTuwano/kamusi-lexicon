"use strict";
/**
 * THE CANONICAL DATA MODEL: Swahili Lexical Infrastructure
 *
 * Absolute source of truth for how Swahili words are represented
 * across the Kamusi ecosystem (API, Web, Admin).
 *
 * Rule: Everything here prioritizes Swahili explaining Swahili (Phase 1).
 * Translations are Phase 2 metadata — never the foundation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartOfSpeech = exports.CANONICAL_LANGUAGE = void 0;
/** Phase 1 language is always Swahili. */
exports.CANONICAL_LANGUAGE = 'sw';
/**
 * Part of speech — technical codes (stable for software).
 * Surface labels in UI/admin may be Swahili (e.g. Nomino) later.
 * Const object (not TS enum) so CJS + ESM consumers (Nest + Vite) interop cleanly.
 */
exports.PartOfSpeech = {
    NOUN: 'noun',
    VERB: 'verb',
    ADJECTIVE: 'adjective',
    ADVERB: 'adverb',
    PRONOUN: 'pronoun',
    PREPOSITION: 'preposition',
    CONJUNCTION: 'conjunction',
    INTERJECTION: 'interjection',
    IDIOM: 'idiom',
    PHRASE: 'phrase',
};

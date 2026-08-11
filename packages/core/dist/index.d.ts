/**
 * THE CANONICAL DATA MODEL: Swahili Lexical Infrastructure
 *
 * Absolute source of truth for how Swahili words are represented
 * across the Kamusi ecosystem (API, Web, Admin).
 *
 * Rule: Everything here prioritizes Swahili explaining Swahili (Phase 1).
 * Translations are Phase 2 metadata — never the foundation.
 */
/** Phase 1 language is always Swahili. */
export declare const CANONICAL_LANGUAGE: "sw";
export type CanonicalLanguage = typeof CANONICAL_LANGUAGE;
/**
 * Part of speech — technical codes (stable for software).
 * Surface labels in UI/admin may be Swahili (e.g. Nomino) later.
 * Const object (not TS enum) so CJS + ESM consumers (Nest + Vite) interop cleanly.
 */
export declare const PartOfSpeech: {
    readonly NOUN: "noun";
    readonly VERB: "verb";
    readonly ADJECTIVE: "adjective";
    readonly ADVERB: "adverb";
    readonly PRONOUN: "pronoun";
    readonly PREPOSITION: "preposition";
    readonly CONJUNCTION: "conjunction";
    readonly INTERJECTION: "interjection";
    readonly IDIOM: "idiom";
    readonly PHRASE: "phrase";
};
export type PartOfSpeech = (typeof PartOfSpeech)[keyof typeof PartOfSpeech];
export type UserRole = 'contributor' | 'moderator' | 'admin';
export type ContributionAction = 'created' | 'updated' | 'verified' | 'hidden' | 'restored' | 'deleted';
export interface Example {
    id?: string | number;
    sentence: string;
    note?: string;
}
export interface Sense {
    id?: string | number;
    definition: string;
    examples: Example[];
    usageNote?: string;
}
export interface Lemma {
    id?: string | number;
    word: string;
    language: CanonicalLanguage;
    partOfSpeech: PartOfSpeech;
    senses: Sense[];
    pronunciation?: string;
    plural?: string;
    derivedWords?: string[];
    synonyms?: string[];
    antonyms?: string[];
    dialect?: string;
    source?: string;
    isVerified: boolean;
    version: number;
    createdAt?: Date;
}
export interface ContributorEvent {
    id?: string | number;
    lemmaId: string | number;
    userId: string | number;
    action: ContributionAction;
    note?: string;
    createdAt?: Date;
}
export interface LemmaRevision {
    id?: string | number;
    lemmaId: string | number;
    version: number;
    snapshot: Lemma;
    changedBy: string | number;
    createdAt?: Date;
}
/** Minimum Phase 1 create payload. */
export interface CreateLemmaInput {
    word: string;
    partOfSpeech: PartOfSpeech;
    senses: Array<{
        definition: string;
        usageNote?: string;
        examples?: Array<{
            sentence: string;
            note?: string;
        }>;
    }>;
    pronunciation?: string;
    plural?: string;
    derivedWords?: string[];
    synonyms?: string[];
    antonyms?: string[];
    dialect?: string;
    source?: string;
}

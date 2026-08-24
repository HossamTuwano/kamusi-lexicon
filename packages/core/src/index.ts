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
export const CANONICAL_LANGUAGE = 'sw' as const;
export type CanonicalLanguage = typeof CANONICAL_LANGUAGE;

/**
 * Part of speech — technical codes (stable for software).
 * Based on the official Swahili grammatical categories.
 */
export const PartOfSpeech = {
  NOUN: 'N',        // Nomino
  PRONOUN: 'W',     // Viwakilishi
  ADJECTIVE: 'V',   // Vivumishi
  VERB: 'T',        // Vitenzi
  ADVERB: 'E',      // Vielezi
  CONJUNCTION: 'U', // Viunganishi
  INTERJECTION: 'I',// Vihisishi / Viingizi
  PREPOSITION: 'H', // Vihusishi
} as const;

export type PartOfSpeech = (typeof PartOfSpeech)[keyof typeof PartOfSpeech];


export type UserRole = 'contributor' | 'moderator' | 'admin';

export const ContributionAction = {
  CREATED: 'created',
  UPDATED: 'updated',
  VERIFIED: 'verified',
  HIDDEN: 'hidden',
  RESTORED: 'restored',
  DELETED: 'deleted',
  REPORTED: 'reported',
  ADD_SENSE: 'add_sense',
  ADD_EXAMPLE: 'add_example',
  CORRECT_INFO: 'correct_info',
} as const;

export type ContributionAction = (typeof ContributionAction)[keyof typeof ContributionAction];

/**
 * Why a user flagged an entry. Stable codes for software; UI may localize.
 */
export const ReportReason = {
  SPAM: 'spam',
  OFFENSIVE: 'offensive',
  WRONG: 'wrong',
  DUPLICATE: 'duplicate',
  OTHER: 'other',
} as const;

export type ReportReason = (typeof ReportReason)[keyof typeof ReportReason];

export type ReportStatus = 'open' | 'resolved';

/** A user-reported problem on a lemma. Open reports feed the moderation queue. */
export interface LemmaReport {
  id?: string | number;
  lemmaId: string | number;
  userId: string | number;
  reason: ReportReason;
  note?: string;
  status: ReportStatus;
  createdAt?: Date;
}

export interface Example {
  id?: string | number;
  sentence: string; // Swahili sentence
  note?: string;
}

export interface Sense {
  id?: string | number;
  definition: string; // Swahili definition — required
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
  isHidden?: boolean;
  reportCount?: number;
  isReported?: boolean;
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

export const PartOfSpeechLabels: Record<PartOfSpeech, string> = {
  N: 'Nomino',
  W: 'Kiwakilishi',
  V: 'Kivumishi',
  T: 'Kitenzi',
  E: 'Kielezi',
  U: 'Kiunganishi',
  I: 'Kihisishi',
  H: 'Kihusishi',
};

/** Minimum Phase 1 create payload. */
export interface CreateLemmaInput {
  word: string;
  partOfSpeech: PartOfSpeech;
  senses: Array<{
    definition: string;
    usageNote?: string;
    examples?: Array<{ sentence: string; note?: string }>;
  }>;
  pronunciation?: string;
  plural?: string;
  derivedWords?: string[];
  synonyms?: string[];
  antonyms?: string[];
  dialect?: string;
  source?: string;
}

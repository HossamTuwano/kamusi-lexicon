import { PartOfSpeech } from '@kamusi/core';
import { Sense } from './sense.entity';
import { LemmaContribution } from './lemma-contribution.entity';
import { LemmaRevision } from './lemma-revision.entity';
export { PartOfSpeech };
export declare class Lemma {
    id: number;
    word: string;
    /** Phase 1: always Swahili. */
    language: string;
    part_of_speech: PartOfSpeech;
    pronunciation: string | null;
    plural: string | null;
    synonyms: string[];
    antonyms: string[];
    derived_words: string[];
    dialect: string | null;
    source: string | null;
    is_verified: boolean;
    vote_count: number;
    is_hidden: boolean;
    creator_id: number | null;
    /** Starts at 1; increments on each content update. */
    version: number;
    created_at: Date;
    senses: Sense[];
    contributions: LemmaContribution[];
    revisions: LemmaRevision[];
}

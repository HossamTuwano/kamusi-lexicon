import { Lemma } from './lemma.entity';
export declare class LemmaRevision {
    id: number;
    lemma_id: number;
    version: number;
    /** Full lexical snapshot at this version (JSON). */
    snapshot: Record<string, unknown>;
    changed_by: number;
    created_at: Date;
    lemma: Lemma;
}

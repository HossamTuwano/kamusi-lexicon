import { Lemma } from './lemma.entity';
import { Example } from './example.entity';
export declare class Sense {
    id: number;
    /** Must be a Swahili definition (Phase 1). */
    definition: string;
    usage_note: string | null;
    lemma: Lemma;
    lemma_id: number;
    examples: Example[];
}

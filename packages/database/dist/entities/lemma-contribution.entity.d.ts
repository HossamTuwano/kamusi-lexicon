import { ContributionAction } from '@kamusi/core';
import { Lemma } from './lemma.entity';
export declare class LemmaContribution {
    id: number;
    lemma_id: number;
    user_id: number;
    action: ContributionAction;
    note: string | null;
    created_at: Date;
    lemma: Lemma;
}

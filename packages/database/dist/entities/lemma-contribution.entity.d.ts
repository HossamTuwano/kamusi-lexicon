import { ContributionAction } from '@kamusi/core';
import { Lemma } from './lemma.entity';
export declare enum ContributionStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class LemmaContribution {
    id: number;
    lemma_id: number;
    user_id: number;
    action: ContributionAction;
    status: ContributionStatus;
    proposed_content: any;
    note: string | null;
    created_at: Date;
    lemma: Lemma;
}

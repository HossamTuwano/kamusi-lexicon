import { ReportReason, ReportStatus } from '@kamusi/core';
import { Lemma } from './lemma.entity';
export declare class LemmaReport {
    id: number;
    lemma_id: number;
    user_id: number;
    reason: ReportReason;
    note: string | null;
    status: ReportStatus;
    created_at: Date;
    lemma: Lemma;
}

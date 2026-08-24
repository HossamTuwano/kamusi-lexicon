import { User } from './user.entity';
import { Lemma } from './lemma.entity';
export declare class VerificationVote {
    id: number;
    entry_id: number;
    user_id: number;
    vote_type: number;
    created_at: Date;
    entry: Lemma;
    user: User;
}

import { UserRole } from '@kamusi/core';
export declare class User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    reputation_score: number;
    /** contributor | moderator | admin */
    role: UserRole;
    created_at: Date;
}

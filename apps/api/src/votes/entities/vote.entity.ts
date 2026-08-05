import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { DictionaryEntry } from '../../dictionary-entries/entities/dictionary-entry.entity';

@Entity('verification_votes')
@Unique(['entry_id', 'user_id'])
export class VerificationVote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entry_id: number;

  @Column()
  user_id: number;

  @Column({ type: 'int' })
  vote_type: number; // 1 or -1

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => DictionaryEntry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entry_id' })
  entry: DictionaryEntry;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EntryType {
  NOUN = 'noun',
  VERB = 'verb',
  ADJECTIVE = 'adjective',
  ADVERB = 'adverb',
  IDIOM = 'idiom',
  PHRASE = 'phrase',
}

@Entity('dictionary_entries')
export class DictionaryEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'sw' })
  language: string;

  @Column({ type: 'varchar' })
  lemma: string;

  @Column({
    type: 'enum',
    enum: EntryType,
    default: EntryType.NOUN,
  })
  word_type: EntryType;

  @Column({ type: 'text' })
  definition: string;

  @Column({ type: 'text', nullable: true })
  example_sentence: string;

  @Column({ type: 'varchar', nullable: true })
  source: string;

  @Column({ nullable: true })
  context_note: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ name: 'creator_id', nullable: true })
  creatorId: number;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: 0 })
  vote_count: number;

  @Column({ default: false })
  is_hidden: boolean;

  @CreateDateColumn()
  created_at: Date;
}

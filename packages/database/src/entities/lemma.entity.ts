import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { PartOfSpeech, CANONICAL_LANGUAGE } from '@kamusi/core';
import { Sense } from './sense.entity';
import { LemmaContribution } from './lemma-contribution.entity';
import { LemmaRevision } from './lemma-revision.entity';

export { PartOfSpeech };

@Entity('lemmas')
@Index(['word', 'part_of_speech'], { unique: true })
export class Lemma {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar' })
  word: string;

  /** Phase 1: always Swahili. */
  @Column({ type: 'varchar', default: CANONICAL_LANGUAGE })
  language: string;

  @Column({
    type: 'enum',
    enum: PartOfSpeech,
    enumName: 'lemmas_part_of_speech_enum',
    default: PartOfSpeech.NOUN,
  })
  part_of_speech: PartOfSpeech;

  @Column({ type: 'varchar', nullable: true })
  pronunciation: string | null;

  @Column({ type: 'varchar', nullable: true })
  plural: string | null;

  @Column({ type: 'text', array: true, default: '{}' })
  synonyms: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  antonyms: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  derived_words: string[];

  @Column({ type: 'varchar', nullable: true })
  dialect: string | null;

  @Column({ type: 'varchar', nullable: true })
  source: string | null;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: 0 })
  vote_count: number;

  @Column({ default: false })
  is_hidden: boolean;

  @Column({ type: 'integer', nullable: true })
  creator_id: number | null;

  /** Starts at 1; increments on each content update. */
  @Column({ default: 1 })
  version: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Sense, (sense) => sense.lemma, { cascade: true })
  senses: Sense[];

  @OneToMany(() => LemmaContribution, (c) => c.lemma)
  contributions: LemmaContribution[];

  @OneToMany(() => LemmaRevision, (r) => r.lemma)
  revisions: LemmaRevision[];
}

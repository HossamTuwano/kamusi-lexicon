import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Lemma } from './lemma.entity';

@Entity('lemma_revisions')
export class LemmaRevision {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lemma_id: number;

  @Column({ type: 'int' })
  version: number;

  /** Full lexical snapshot at this version (JSON). */
  @Column({ type: 'jsonb' })
  snapshot: Record<string, unknown>;

  @Column()
  changed_by: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Lemma, (lemma) => lemma.revisions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lemma_id' })
  lemma: Lemma;
}

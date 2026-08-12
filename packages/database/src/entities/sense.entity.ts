import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Lemma } from './lemma.entity';
import { Example } from './example.entity';

@Entity('senses')
export class Sense {
  @PrimaryGeneratedColumn()
  id: number;

  /** Must be a Swahili definition (Phase 1). */
  @Column({ type: 'text' })
  definition: string;

  @Column({ type: 'text', nullable: true })
  usage_note: string | null;

  @ManyToOne(() => Lemma, (lemma) => lemma.senses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lemma_id' })
  lemma: Lemma;

  @Column()
  lemma_id: number;

  @OneToMany(() => Example, (example) => example.sense, { cascade: true })
  examples: Example[];
}

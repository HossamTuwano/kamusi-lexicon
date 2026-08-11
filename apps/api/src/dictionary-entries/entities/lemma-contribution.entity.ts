import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ContributionAction } from '@kamusi/core';
import { Lemma } from './lemma.entity';

@Entity('lemma_contributions')
export class LemmaContribution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lemma_id: number;

  @Column()
  user_id: number;

  @Column({ type: 'varchar' })
  action: ContributionAction;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Lemma, (lemma) => lemma.contributions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lemma_id' })
  lemma: Lemma;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ReportReason, ReportStatus } from '@kamusi/core';
import { Lemma } from './lemma.entity';

@Entity('lemma_reports')
@Index(['lemma_id', 'user_id'], { unique: true })
export class LemmaReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lemma_id: number;

  @Column()
  user_id: number;

  @Column({ type: 'varchar' })
  reason: ReportReason;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'varchar', default: 'open' })
  status: ReportStatus;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Lemma, (lemma) => lemma.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lemma_id' })
  lemma: Lemma;
}

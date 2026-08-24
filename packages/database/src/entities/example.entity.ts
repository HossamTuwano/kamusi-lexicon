import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sense } from './sense.entity';

@Entity('examples')
export class Example {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  sentence: string;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @ManyToOne(() => Sense, (sense) => sense.examples, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sense_id' })
  sense: Sense;

  @Column()
  sense_id: number;
}

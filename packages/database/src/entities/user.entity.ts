import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '@kamusi/core';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password_hash: string;

  @Column({ default: 0 })
  reputation_score: number;

  /** contributor | moderator | admin */
  @Column({ type: 'varchar', default: 'contributor' })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;
}

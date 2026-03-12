import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { HourPack } from './hour-pack.entity.js';

@Entity('ticket_hour_pack_months')
@Unique(['hourPackId', 'year', 'month'])
export class HourPackMonth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'hour_pack_id' })
  @Index()
  hourPackId: string;

  @ManyToOne(() => HourPack, (hp) => hp.months, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hour_pack_id' })
  hourPack: HourPack;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ name: 'base_minutes', type: 'int' })
  baseMinutes: number;

  @Column({ name: 'carry_over_minutes', type: 'int', default: 0 })
  carryOverMinutes: number;

  @Column({ name: 'consumed_minutes', type: 'int', default: 0 })
  consumedMinutes: number;

  @Column({ name: 'available_minutes', type: 'int' })
  availableMinutes: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

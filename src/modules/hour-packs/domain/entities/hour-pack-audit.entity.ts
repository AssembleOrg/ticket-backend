import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HourPack } from './hour-pack.entity.js';

@Entity('ticket_hour_pack_audit')
export class HourPackAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'hour_pack_id' })
  hourPackId: string;

  @ManyToOne(() => HourPack, (hp) => hp.audits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hour_pack_id' })
  hourPack: HourPack;

  @Column()
  action: string; // 'CREATED' | 'UPDATED' | 'CARRY_OVER' | 'MANUAL_ADJUSTMENT'

  @Column({ name: 'changed_by' })
  changedBy: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ name: 'previous_value', type: 'jsonb', nullable: true })
  previousValue: Record<string, any>;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

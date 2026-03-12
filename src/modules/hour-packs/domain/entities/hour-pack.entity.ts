import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '../../../clients/domain/entities/client.entity.js';
import { HourPackMonth } from './hour-pack-month.entity.js';
import { HourPackAudit } from './hour-pack-audit.entity.js';

@Entity('ticket_hour_packs')
export class HourPack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'weekly_hours', type: 'decimal', precision: 6, scale: 2 })
  weeklyHours: number;

  @Column({ name: 'monthly_hours', type: 'decimal', precision: 8, scale: 2 })
  monthlyHours: number;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => HourPackMonth, (m) => m.hourPack)
  months: HourPackMonth[];

  @OneToMany(() => HourPackAudit, (a) => a.hourPack)
  audits: HourPackAudit[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

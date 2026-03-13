import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ticket } from '../../../tickets/domain/entities/ticket.entity.js';

@Entity('ticket_time_entries')
export class TimeEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'minutes', type: 'int' })
  minutes: number;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'logged_by' })
  loggedBy: string;

  @Column({ name: 'logged_at', type: 'timestamptz' })
  loggedAt: Date;

  @Column({ name: 'ticket_id' })
  @Index()
  ticketId: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.timeEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

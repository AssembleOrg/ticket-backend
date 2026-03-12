import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity.js';
import { TicketStatus } from '../enums/ticket-status.enum.js';

@Entity('ticket_history')
export class TicketHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ticket_id' })
  ticketId: string;

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column({ name: 'previous_status', type: 'enum', enum: TicketStatus, nullable: true })
  previousStatus: TicketStatus;

  @Column({ name: 'new_status', type: 'enum', enum: TicketStatus })
  newStatus: TicketStatus;

  @Column({ name: 'changed_by' })
  changedBy: string;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

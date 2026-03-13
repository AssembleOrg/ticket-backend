import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '../../../clients/domain/entities/client.entity.js';
import { Project } from '../../../projects/domain/entities/project.entity.js';
import { Responsible } from '../../../responsibles/domain/entities/responsible.entity.js';
import { TicketComment } from '../../../comments/domain/entities/comment.entity.js';
import { Attachment } from '../../../attachments/domain/entities/attachment.entity.js';
import { TimeEntry } from '../../../time-entries/domain/entities/time-entry.entity.js';
import { Task } from '../../../tasks/domain/entities/task.entity.js';
import { TicketStatus } from '../enums/ticket-status.enum.js';
import { TicketPriority } from '../enums/ticket-priority.enum.js';

@Entity('ticket_tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  code: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  @Index()
  status: TicketStatus;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  @Index()
  priority: TicketPriority;

  @Column({ name: 'client_id' })
  @Index()
  clientId: string;

  @ManyToOne(() => Client, (client) => client.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'project_id' })
  @Index()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'responsible_id', nullable: true })
  responsibleId: string | null;

  @ManyToOne(() => Responsible, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'responsible_id' })
  responsible: Responsible;

  @OneToMany(() => TicketComment, (comment) => comment.ticket)
  comments: TicketComment[];

  @OneToMany(() => Attachment, (attachment) => attachment.ticket)
  attachments: Attachment[];

  @OneToMany(() => TimeEntry, (entry) => entry.ticket)
  timeEntries: TimeEntry[];

  @OneToMany(() => Task, (task) => task.ticket)
  tasks: Task[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @BeforeInsert()
  generateCode() {
    // Will be overridden by the service with sequential code
  }
}

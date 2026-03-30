import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  TICKET_CREATED = 'TICKET_CREATED',
  TICKET_STATUS_CHANGED = 'TICKET_STATUS_CHANGED',
  TICKET_CLOSED = 'TICKET_CLOSED',
  RECEIPT_CREATED = 'RECEIPT_CREATED',
  RECEIPT_VOIDED = 'RECEIPT_VOIDED',
  HOUR_PACK_WARNING = 'HOUR_PACK_WARNING',
  COMMENT_ADDED = 'COMMENT_ADDED',
}

@Entity('ticket_notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationType })
  @Index()
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'resource_id', nullable: true })
  resourceId: string;

  @Column({ name: 'resource_type', nullable: true })
  resourceType: string;

  @Column({ default: false })
  @Index()
  read: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from '../../../tasks/domain/entities/task.entity.js';

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

  @Column({ name: 'task_id' })
  @Index()
  taskId: string;

  @ManyToOne(() => Task, (task) => task.timeEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

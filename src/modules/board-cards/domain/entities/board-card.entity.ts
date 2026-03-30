import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BoardColumn } from '../enums/board-column.enum.js';
import { Responsible } from '../../../responsibles/domain/entities/responsible.entity.js';

@Entity('ticket_board_cards')
export class BoardCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: BoardColumn, default: BoardColumn.TODO })
  @Index()
  column: BoardColumn;

  @Column({ nullable: true })
  color: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: string;

  @Column({ type: 'int', default: 0 })
  position: number;

  @Column({ name: 'responsible_id' })
  @Index()
  responsibleId: string;

  @ManyToOne(() => Responsible, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'responsible_id' })
  responsible: Responsible;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

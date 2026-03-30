import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ticket_vault_entries')
export class VaultEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string;

  @Column({ nullable: true })
  username: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ nullable: true })
  url: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'client_id', nullable: true })
  @Index()
  clientId: string;

  @Column({ name: 'project_id', nullable: true })
  @Index()
  projectId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

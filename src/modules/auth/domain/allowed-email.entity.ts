import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  RESPONSIBLE = 'RESPONSIBLE',
}

@Entity('ticket_allowed_emails')
export class AllowedEmail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.RESPONSIBLE })
  role: UserRole;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

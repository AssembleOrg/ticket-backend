import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface ReceiptItem {
  quantity: number;
  code: string;
  description: string;
  unitPrice: number;
  taxPercent: number;
  discountPercent: number;
}

@Entity('ticket_receipts')
export class Receipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'receipt_number', type: 'int', unique: true })
  receiptNumber: number;

  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ name: 'company_address', nullable: true })
  companyAddress: string;

  @Column({ name: 'company_phone', nullable: true })
  companyPhone: string;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: string;

  @Column({ name: 'payment_method' })
  paymentMethod: string;

  @Column({ name: 'client_name' })
  clientName: string;

  @Column({ type: 'jsonb', default: '[]' })
  items: ReceiptItem[];

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discounts: number;

  @Column({ name: 'tax_total', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxTotal: number;

  @Column({ name: 'total_paid', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPaid: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

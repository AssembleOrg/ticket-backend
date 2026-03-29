import { Injectable, NotFoundException } from '@nestjs/common';
import { ReceiptsRepository } from '../infrastructure/receipts.repository.js';
import { CreateReceiptDto } from './dto/create-receipt.dto.js';
import { UpdateReceiptDto } from './dto/update-receipt.dto.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import type { ReceiptItem } from '../domain/entities/receipt.entity.js';

function calculateTotals(items: ReceiptItem[]) {
  let subtotal = 0;
  let discounts = 0;
  let taxTotal = 0;

  for (const item of items) {
    const lineTotal = item.quantity * item.unitPrice;
    const lineDiscount = lineTotal * (item.discountPercent / 100);
    const lineTax = (lineTotal - lineDiscount) * (item.taxPercent / 100);

    subtotal += lineTotal;
    discounts += lineDiscount;
    taxTotal += lineTax;
  }

  const totalPaid = subtotal - discounts + taxTotal;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discounts: Math.round(discounts * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
  };
}

@Injectable()
export class ReceiptsService {
  constructor(private readonly receiptsRepository: ReceiptsRepository) {}

  async findAll(query: PaginationQueryDto) {
    return this.receiptsRepository.findAllPaginated(query);
  }

  async findById(id: string) {
    const receipt = await this.receiptsRepository.findById(id);
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  async create(dto: CreateReceiptDto) {
    const receiptNumber = await this.receiptsRepository.getNextReceiptNumber();
    const totals = calculateTotals(dto.items);

    return this.receiptsRepository.create({
      ...dto,
      receiptNumber,
      ...totals,
    });
  }

  async update(id: string, dto: UpdateReceiptDto) {
    await this.findById(id);

    const updateData: any = { ...dto };
    if (dto.items) {
      const totals = calculateTotals(dto.items);
      Object.assign(updateData, totals);
    }

    return this.receiptsRepository.update(id, updateData);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.receiptsRepository.softDelete(id);
  }

  async getNextNumber() {
    return this.receiptsRepository.getNextReceiptNumber();
  }
}

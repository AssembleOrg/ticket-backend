import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReceiptsRepository } from '../infrastructure/receipts.repository.js';
import { NotificationsService } from '../../notifications/application/notifications.service.js';
import { NotificationType } from '../../notifications/domain/entities/notification.entity.js';
import { CreateReceiptDto } from './dto/create-receipt.dto.js';
import { UpdateReceiptDto } from './dto/update-receipt.dto.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { ReceiptStatus } from '../domain/enums/receipt-status.enum.js';
import type { ReceiptItem } from '../domain/entities/receipt.entity.js';

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

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

function isWithinEditWindow(createdAt: Date): boolean {
  return Date.now() - new Date(createdAt).getTime() < EDIT_WINDOW_MS;
}

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly receiptsRepository: ReceiptsRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

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

    const receipt = await this.receiptsRepository.create({
      ...dto,
      receiptNumber,
      status: ReceiptStatus.ACTIVE,
      ...totals,
    });

    this.notificationsService.create({
      type: NotificationType.RECEIPT_CREATED,
      title: 'Nuevo comprobante creado',
      message: `CP-${String(receiptNumber).padStart(8, '0')} - ${dto.clientName}`,
      resourceId: receipt.id,
      resourceType: 'receipt',
    }).catch(() => {});

    return receipt;
  }

  async update(id: string, dto: UpdateReceiptDto) {
    const receipt = await this.findById(id);

    if (receipt.status === ReceiptStatus.VOIDED) {
      throw new BadRequestException('No se puede editar un comprobante anulado');
    }

    if (!isWithinEditWindow(receipt.createdAt)) {
      throw new BadRequestException(
        'No se puede editar un comprobante con más de 24 horas desde su creación',
      );
    }

    const updateData: any = { ...dto };
    if (dto.items) {
      const totals = calculateTotals(dto.items);
      Object.assign(updateData, totals);
    }

    return this.receiptsRepository.update(id, updateData);
  }

  async void(id: string) {
    const receipt = await this.findById(id);

    if (receipt.status === ReceiptStatus.VOIDED) {
      throw new BadRequestException('El comprobante ya está anulado');
    }

    const updated = await this.receiptsRepository.update(id, { status: ReceiptStatus.VOIDED });

    this.notificationsService.create({
      type: NotificationType.RECEIPT_VOIDED,
      title: 'Comprobante anulado',
      message: `CP-${String(receipt.receiptNumber).padStart(8, '0')} - ${receipt.clientName}`,
      resourceId: id,
      resourceType: 'receipt',
    }).catch(() => {});

    return updated;
  }

  async remove(id: string) {
    const receipt = await this.findById(id);

    if (!isWithinEditWindow(receipt.createdAt)) {
      throw new BadRequestException(
        'No se puede eliminar un comprobante con más de 24 horas desde su creación',
      );
    }

    await this.receiptsRepository.softDelete(id);
  }

  async getNextNumber() {
    return this.receiptsRepository.getNextReceiptNumber();
  }
}

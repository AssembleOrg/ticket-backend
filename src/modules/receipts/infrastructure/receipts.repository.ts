import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receipt } from '../domain/entities/receipt.entity.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface.js';

@Injectable()
export class ReceiptsRepository {
  constructor(
    @InjectRepository(Receipt)
    private readonly repo: Repository<Receipt>,
  ) {}

  async findAllPaginated(query: PaginationQueryDto): Promise<PaginatedResult<Receipt>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      skip,
      take: limit,
      order: { receiptNumber: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string): Promise<Receipt | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByReceiptNumber(receiptNumber: number): Promise<Receipt | null> {
    return this.repo.findOne({ where: { receiptNumber } });
  }

  async getNextReceiptNumber(): Promise<number> {
    const last = await this.repo
      .createQueryBuilder('r')
      .select('MAX(r.receipt_number)', 'max')
      .withDeleted()
      .getRawOne();
    const lastNumber = last?.max ?? 499;
    return lastNumber + 1;
  }

  async create(data: Partial<Receipt>): Promise<Receipt> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Receipt>): Promise<Receipt> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<Receipt>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}

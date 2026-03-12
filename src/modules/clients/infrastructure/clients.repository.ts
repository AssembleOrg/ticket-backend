import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../domain/entities/client.entity.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface.js';

@Injectable()
export class ClientsRepository {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  async findAllPaginated(query: PaginationQueryDto): Promise<PaginatedResult<Client>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
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

  async findById(id: string): Promise<Client | null> {
    return this.repo.findOne({ where: { id }, relations: ['projects'] });
  }

  async findByPhone(phone: string): Promise<Client | null> {
    return this.repo.findOne({ where: { phone }, relations: ['projects'] });
  }

  async create(data: Partial<Client>): Promise<Client> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Client>): Promise<Client> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<Client>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}

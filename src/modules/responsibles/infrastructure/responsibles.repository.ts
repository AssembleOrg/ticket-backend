import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Responsible } from '../domain/entities/responsible.entity.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface.js';

@Injectable()
export class ResponsiblesRepository {
  constructor(
    @InjectRepository(Responsible)
    private readonly repo: Repository<Responsible>,
  ) {}

  async findAllPaginated(query: PaginationQueryDto): Promise<PaginatedResult<Responsible>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      skip,
      take: limit,
      order: { name: 'ASC' },
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

  async findById(id: string): Promise<Responsible | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<Responsible>): Promise<Responsible> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Responsible>): Promise<Responsible> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<Responsible>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../domain/entities/task.entity.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface.js';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>,
  ) {}

  async findByTicketPaginated(ticketId: string, query: PaginationQueryDto): Promise<PaginatedResult<Task>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      where: { ticketId },
      relations: ['timeEntries'],
      skip,
      take: limit,
      order: { createdAt: 'ASC' },
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

  async findById(id: string): Promise<Task | null> {
    return this.repo.findOne({ where: { id }, relations: ['timeEntries'] });
  }

  async create(data: Partial<Task>): Promise<Task> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<Task>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketComment } from '../domain/entities/comment.entity.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface.js';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(TicketComment)
    private readonly repo: Repository<TicketComment>,
  ) {}

  async findByTicketPaginated(
    ticketId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<TicketComment>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      where: { ticketId },
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

  async create(data: Partial<TicketComment>): Promise<TicketComment> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findById(id: string): Promise<TicketComment | null> {
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}

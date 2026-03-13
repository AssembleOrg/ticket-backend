import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry } from '../domain/entities/time-entry.entity.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface.js';

@Injectable()
export class TimeEntriesRepository {
  constructor(
    @InjectRepository(TimeEntry)
    private readonly repo: Repository<TimeEntry>,
  ) {}

  async findByTicketPaginated(ticketId: string, query: PaginationQueryDto): Promise<PaginatedResult<TimeEntry>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      where: { ticketId },
      skip,
      take: limit,
      order: { loggedAt: 'DESC' },
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

  async create(data: Partial<TimeEntry>): Promise<TimeEntry> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findById(id: string): Promise<TimeEntry | null> {
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async getTotalMinutesByTicket(ticketId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('te')
      .select('COALESCE(SUM(te.minutes), 0)', 'total')
      .where('te.ticket_id = :ticketId', { ticketId })
      .getRawOne();

    return parseInt(result?.total ?? '0', 10);
  }

  async getTotalMinutesByClientAndMonth(clientId: string, year: number, month: number): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('te')
      .innerJoin('te.ticket', 'ticket')
      .select('COALESCE(SUM(te.minutes), 0)', 'total')
      .where('ticket.clientId = :clientId', { clientId })
      .andWhere('EXTRACT(YEAR FROM te.logged_at) = :year', { year })
      .andWhere('EXTRACT(MONTH FROM te.logged_at) = :month', { month })
      .getRawOne();

    return parseInt(result?.total ?? '0', 10);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../domain/entities/ticket.entity.js';
import { TicketHistory } from '../domain/entities/ticket-history.entity.js';
import { FilterTicketsDto } from '../application/dto/filter-tickets.dto.js';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface.js';

@Injectable()
export class TicketsRepository {
  constructor(
    @InjectRepository(Ticket)
    private readonly repo: Repository<Ticket>,
    @InjectRepository(TicketHistory)
    private readonly historyRepo: Repository<TicketHistory>,
  ) {}

  async findAllPaginated(filters: FilterTicketsDto): Promise<PaginatedResult<Ticket>> {
    const { page, limit, status, priority, clientId, projectId, createdFrom, createdTo } = filters;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.client', 'client')
      .leftJoinAndSelect('ticket.project', 'project')
      .orderBy('ticket.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) qb.andWhere('ticket.status = :status', { status });
    if (priority) qb.andWhere('ticket.priority = :priority', { priority });
    if (clientId) qb.andWhere('ticket.clientId = :clientId', { clientId });
    if (projectId) qb.andWhere('ticket.projectId = :projectId', { projectId });
    if (createdFrom) qb.andWhere('ticket.createdAt >= :createdFrom', { createdFrom });
    if (createdTo) qb.andWhere('ticket.createdAt <= :createdTo', { createdTo });

    const [data, total] = await qb.getManyAndCount();
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

  async findById(id: string): Promise<Ticket | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['client', 'project', 'comments'],
    });
  }

  async findByCode(code: string): Promise<Ticket | null> {
    return this.repo.findOne({
      where: { code },
      relations: ['client', 'project', 'comments'],
    });
  }

  async getNextCode(): Promise<string> {
    const last = await this.repo
      .createQueryBuilder('ticket')
      .withDeleted()
      .orderBy('ticket.createdAt', 'DESC')
      .getOne();

    if (!last?.code) return 'TK-000001';

    const num = parseInt(last.code.replace('TK-', ''), 10) + 1;
    return `TK-${num.toString().padStart(6, '0')}`;
  }

  async create(data: Partial<Ticket>): Promise<Ticket> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Ticket>): Promise<Ticket> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<Ticket>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async addHistory(data: Partial<TicketHistory>): Promise<TicketHistory> {
    const entity = this.historyRepo.create(data);
    return this.historyRepo.save(entity);
  }

  async getHistory(ticketId: string): Promise<TicketHistory[]> {
    return this.historyRepo.find({
      where: { ticketId },
      order: { createdAt: 'DESC' },
    });
  }

  async countByClientId(clientId: string): Promise<number> {
    return this.repo.count({ where: { clientId } });
  }
}

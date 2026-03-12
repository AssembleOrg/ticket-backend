import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketsRepository } from '../infrastructure/tickets.repository.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
import { FilterTicketsDto } from './dto/filter-tickets.dto.js';
import { TicketStatus } from '../domain/enums/ticket-status.enum.js';
import { TicketPriority } from '../domain/enums/ticket-priority.enum.js';

@Injectable()
export class TicketsService {
  constructor(private readonly ticketsRepository: TicketsRepository) {}

  async findAll(filters: FilterTicketsDto) {
    return this.ticketsRepository.findAllPaginated(filters);
  }

  async findById(id: string) {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async findByCode(code: string) {
    const ticket = await this.ticketsRepository.findByCode(code);
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async create(dto: CreateTicketDto) {
    const code = await this.ticketsRepository.getNextCode();
    return this.ticketsRepository.create({
      ...dto,
      code,
      status: TicketStatus.OPEN,
      priority: dto.priority ?? TicketPriority.MEDIUM,
    });
  }

  async update(id: string, dto: UpdateTicketDto, changedBy: string = 'system') {
    const ticket = await this.findById(id);

    if (dto.status && dto.status !== ticket.status) {
      await this.ticketsRepository.addHistory({
        ticketId: id,
        previousStatus: ticket.status,
        newStatus: dto.status,
        changedBy,
      });
    }

    return this.ticketsRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.ticketsRepository.softDelete(id);
  }

  async getHistory(id: string) {
    await this.findById(id);
    return this.ticketsRepository.getHistory(id);
  }
}

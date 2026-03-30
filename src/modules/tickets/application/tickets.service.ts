import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketsRepository } from '../infrastructure/tickets.repository.js';
import { SupabaseService } from '../../auth/supabase.service.js';
import { NotificationsService } from '../../notifications/application/notifications.service.js';
import { NotificationType } from '../../notifications/domain/entities/notification.entity.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
import { FilterTicketsDto } from './dto/filter-tickets.dto.js';
import { TicketStatus } from '../domain/enums/ticket-status.enum.js';
import { TicketPriority } from '../domain/enums/ticket-priority.enum.js';

const BUCKET_NAME = 'ticket-attachments';

@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly supabaseService: SupabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(filters: FilterTicketsDto) {
    return this.ticketsRepository.findAllPaginated(filters);
  }

  async findById(id: string) {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    // Generate signed URLs for attachments
    const supabase = this.supabaseService.getClient();
    const attachmentsWithUrls = await Promise.all(
      (ticket.attachments ?? []).map(async (attachment) => {
        const { data } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(attachment.storagePath, 3600);
        return { ...attachment, url: data?.signedUrl ?? null };
      }),
    );

    // Compute total minutes from time entries
    const totalMinutes = (ticket.timeEntries ?? []).reduce((sum, e) => sum + e.minutes, 0);

    return {
      ...ticket,
      attachments: attachmentsWithUrls,
      totalMinutes,
    };
  }

  async findByCode(code: string) {
    const ticket = await this.ticketsRepository.findByCode(code);
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async create(dto: CreateTicketDto) {
    const code = await this.ticketsRepository.getNextCode();
    const ticket = await this.ticketsRepository.create({
      ...dto,
      code,
      status: TicketStatus.OPEN,
      priority: dto.priority ?? TicketPriority.MEDIUM,
    });

    this.notificationsService.create({
      type: NotificationType.TICKET_CREATED,
      title: 'Nuevo ticket creado',
      message: `Ticket #${code}: ${dto.title}`,
      resourceId: ticket.id,
      resourceType: 'ticket',
    }).catch(() => {});

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, changedBy: string = 'system') {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (dto.status && dto.status !== ticket.status) {
      await this.ticketsRepository.addHistory({
        ticketId: id,
        previousStatus: ticket.status,
        newStatus: dto.status,
        changedBy,
      });

      const type = dto.status === TicketStatus.CLOSED
        ? NotificationType.TICKET_CLOSED
        : NotificationType.TICKET_STATUS_CHANGED;
      const statusLabel = dto.status === TicketStatus.CLOSED ? 'cerrado'
        : dto.status === TicketStatus.IN_PROGRESS ? 'en progreso'
        : dto.status === TicketStatus.RESOLVED ? 'en revisión'
        : dto.status;

      this.notificationsService.create({
        type,
        title: `Ticket #${ticket.code} ${statusLabel}`,
        message: `${ticket.title}`,
        resourceId: id,
        resourceType: 'ticket',
      }).catch(() => {});
    }

    return this.ticketsRepository.update(id, dto);
  }

  async remove(id: string) {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    await this.ticketsRepository.softDelete(id);
  }

  async getHistory(id: string) {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    return this.ticketsRepository.getHistory(id);
  }
}

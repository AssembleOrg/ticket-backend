import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './domain/entities/ticket.entity.js';
import { TicketHistory } from './domain/entities/ticket-history.entity.js';
import { TicketsController } from './tickets.controller.js';
import { TicketsService } from './application/tickets.service.js';
import { TicketsRepository } from './infrastructure/tickets.repository.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketHistory]), NotificationsModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsRepository],
  exports: [TicketsService],
})
export class TicketsModule {}

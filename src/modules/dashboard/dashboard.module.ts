import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { Ticket } from '../tickets/domain/entities/ticket.entity.js';
import { Client } from '../clients/domain/entities/client.entity.js';
import { TimeEntry } from '../time-entries/domain/entities/time-entry.entity.js';
import { HourPack } from '../hour-packs/domain/entities/hour-pack.entity.js';
import { HourPackMonth } from '../hour-packs/domain/entities/hour-pack-month.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Client, TimeEntry, HourPack, HourPackMonth]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

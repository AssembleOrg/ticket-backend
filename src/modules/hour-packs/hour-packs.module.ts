import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HourPack } from './domain/entities/hour-pack.entity.js';
import { HourPackMonth } from './domain/entities/hour-pack-month.entity.js';
import { HourPackAudit } from './domain/entities/hour-pack-audit.entity.js';
import { HourPacksController } from './hour-packs.controller.js';
import { HourPacksService } from './application/hour-packs.service.js';
import { HourPacksRepository } from './infrastructure/hour-packs.repository.js';
import { TimeEntriesModule } from '../time-entries/time-entries.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([HourPack, HourPackMonth, HourPackAudit]),
    TimeEntriesModule,
  ],
  controllers: [HourPacksController],
  providers: [HourPacksService, HourPacksRepository],
  exports: [HourPacksService],
})
export class HourPacksModule {}

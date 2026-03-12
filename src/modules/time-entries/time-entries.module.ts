import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeEntry } from './domain/entities/time-entry.entity.js';
import { TimeEntriesController } from './time-entries.controller.js';
import { TimeEntriesService } from './application/time-entries.service.js';
import { TimeEntriesRepository } from './infrastructure/time-entries.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([TimeEntry])],
  controllers: [TimeEntriesController],
  providers: [TimeEntriesService, TimeEntriesRepository],
  exports: [TimeEntriesService],
})
export class TimeEntriesModule {}

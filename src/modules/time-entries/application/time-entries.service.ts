import { Injectable, NotFoundException } from '@nestjs/common';
import { TimeEntriesRepository } from '../infrastructure/time-entries.repository.js';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { DateTime } from 'luxon';

const TIMEZONE = 'America/Argentina/Buenos_Aires';

@Injectable()
export class TimeEntriesService {
  constructor(private readonly timeEntriesRepository: TimeEntriesRepository) {}

  async findByTask(taskId: string, query: PaginationQueryDto) {
    return this.timeEntriesRepository.findByTaskPaginated(taskId, query);
  }

  async create(dto: CreateTimeEntryDto) {
    const now = DateTime.now().setZone(TIMEZONE);
    return this.timeEntriesRepository.create({
      ...dto,
      loggedAt: now.toJSDate(),
    });
  }

  async remove(id: string) {
    const entry = await this.timeEntriesRepository.findById(id);
    if (!entry) throw new NotFoundException('Time entry not found');
    await this.timeEntriesRepository.delete(id);
  }

  async getTotalMinutesByClientAndMonth(clientId: string, year: number, month: number) {
    return this.timeEntriesRepository.getTotalMinutesByClientAndMonth(clientId, year, month);
  }
}

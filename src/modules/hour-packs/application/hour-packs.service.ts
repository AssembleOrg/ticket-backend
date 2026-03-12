import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HourPacksRepository } from '../infrastructure/hour-packs.repository.js';
import { CreateHourPackDto } from './dto/create-hour-pack.dto.js';
import { UpdateHourPackDto } from './dto/update-hour-pack.dto.js';
import { TimeEntriesService } from '../../time-entries/application/time-entries.service.js';
import { DateTime } from 'luxon';

const TIMEZONE = 'America/Argentina/Buenos_Aires';

@Injectable()
export class HourPacksService {
  private readonly logger = new Logger(HourPacksService.name);

  constructor(
    private readonly hourPacksRepository: HourPacksRepository,
    private readonly timeEntriesService: TimeEntriesService,
  ) {}

  async findByClientId(clientId: string) {
    const pack = await this.hourPacksRepository.findByClientId(clientId);
    if (!pack) throw new NotFoundException('Hour pack not found for this client');
    return pack;
  }

  async findById(id: string) {
    const pack = await this.hourPacksRepository.findById(id);
    if (!pack) throw new NotFoundException('Hour pack not found');
    return pack;
  }

  async create(dto: CreateHourPackDto) {
    const existing = await this.hourPacksRepository.findByClientId(dto.clientId);
    if (existing) throw new ConflictException('Client already has an active hour pack');

    const monthlyHours = dto.weeklyHours * 4;

    const pack = await this.hourPacksRepository.create({
      clientId: dto.clientId,
      weeklyHours: dto.weeklyHours,
      monthlyHours,
    });

    await this.hourPacksRepository.addAudit({
      hourPackId: pack.id,
      action: 'CREATED',
      changedBy: 'system',
      reason: 'Pack created',
      newValue: { weeklyHours: dto.weeklyHours, monthlyHours },
    });

    // Create current month record
    const now = DateTime.now().setZone(TIMEZONE);
    await this.hourPacksRepository.createMonth({
      hourPackId: pack.id,
      year: now.year,
      month: now.month,
      baseMinutes: monthlyHours * 60,
      carryOverMinutes: 0,
      consumedMinutes: 0,
      availableMinutes: monthlyHours * 60,
    });

    return pack;
  }

  async update(id: string, dto: UpdateHourPackDto) {
    const pack = await this.findById(id);

    const previousValue: Record<string, any> = {};
    const newValue: Record<string, any> = {};

    if (dto.weeklyHours !== undefined) {
      previousValue.weeklyHours = pack.weeklyHours;
      previousValue.monthlyHours = pack.monthlyHours;
      newValue.weeklyHours = dto.weeklyHours;
      newValue.monthlyHours = dto.weeklyHours * 4;
    }

    if (dto.active !== undefined) {
      previousValue.active = pack.active;
      newValue.active = dto.active;
    }

    await this.hourPacksRepository.addAudit({
      hourPackId: id,
      action: 'UPDATED',
      changedBy: dto.changedBy ?? 'system',
      reason: dto.reason ?? 'Manual update',
      previousValue,
      newValue,
    });

    const updateData: Record<string, any> = {};
    if (dto.weeklyHours !== undefined) {
      updateData.weeklyHours = dto.weeklyHours;
      updateData.monthlyHours = dto.weeklyHours * 4;
    }
    if (dto.active !== undefined) {
      updateData.active = dto.active;
    }

    return this.hourPacksRepository.update(id, updateData);
  }

  async getMonths(id: string) {
    await this.findById(id);
    return this.hourPacksRepository.findMonthsByPackId(id);
  }

  async getAudits(id: string) {
    await this.findById(id);
    return this.hourPacksRepository.getAuditsByPackId(id);
  }

  async getCurrentMonthStatus(clientId: string) {
    const pack = await this.findByClientId(clientId);
    const now = DateTime.now().setZone(TIMEZONE);

    let monthRecord = await this.hourPacksRepository.findMonth(pack.id, now.year, now.month);

    if (!monthRecord) {
      monthRecord = await this.hourPacksRepository.createMonth({
        hourPackId: pack.id,
        year: now.year,
        month: now.month,
        baseMinutes: pack.monthlyHours * 60,
        carryOverMinutes: 0,
        consumedMinutes: 0,
        availableMinutes: pack.monthlyHours * 60,
      });
    }

    // Get real consumed minutes from time entries
    const consumedMinutes = await this.timeEntriesService.getTotalMinutesByClientAndMonth(
      clientId,
      now.year,
      now.month,
    );

    const totalAvailable = monthRecord.baseMinutes + monthRecord.carryOverMinutes;
    const remaining = totalAvailable - consumedMinutes;

    return {
      pack: {
        weeklyHours: pack.weeklyHours,
        monthlyHours: pack.monthlyHours,
      },
      currentMonth: {
        year: now.year,
        month: now.month,
        baseMinutes: monthRecord.baseMinutes,
        carryOverMinutes: monthRecord.carryOverMinutes,
        totalAvailableMinutes: totalAvailable,
        consumedMinutes,
        remainingMinutes: remaining,
        isOverLimit: remaining < 0,
        baseHours: monthRecord.baseMinutes / 60,
        carryOverHours: monthRecord.carryOverMinutes / 60,
        totalAvailableHours: totalAvailable / 60,
        consumedHours: +(consumedMinutes / 60).toFixed(2),
        remainingHours: +(remaining / 60).toFixed(2),
      },
    };
  }

  // Cron: 1st of every month at 00:05 GMT-3
  @Cron('5 0 1 * *', { timeZone: TIMEZONE })
  async handleMonthlyCarryOver() {
    this.logger.log('Starting monthly carry-over calculation...');

    const now = DateTime.now().setZone(TIMEZONE);
    const prevMonth = now.minus({ months: 1 });

    const activePacks = await this.hourPacksRepository.findAllActivePacks();

    for (const pack of activePacks) {
      try {
        const prevMonthRecord = await this.hourPacksRepository.findMonth(
          pack.id,
          prevMonth.year,
          prevMonth.month,
        );

        let carryOverMinutes = 0;

        if (prevMonthRecord) {
          const consumed = await this.timeEntriesService.getTotalMinutesByClientAndMonth(
            pack.clientId,
            prevMonth.year,
            prevMonth.month,
          );

          const totalAvailable = prevMonthRecord.baseMinutes + prevMonthRecord.carryOverMinutes;
          const leftover = totalAvailable - consumed;

          // Only carry over if positive (surplus). Deficit does NOT carry.
          carryOverMinutes = leftover > 0 ? leftover : 0;

          // Update previous month consumed
          await this.hourPacksRepository.updateMonth(prevMonthRecord.id, {
            consumedMinutes: consumed,
            availableMinutes: totalAvailable - consumed,
          });
        }

        // Create new month record
        const baseMinutes = pack.monthlyHours * 60;
        await this.hourPacksRepository.createMonth({
          hourPackId: pack.id,
          year: now.year,
          month: now.month,
          baseMinutes,
          carryOverMinutes,
          consumedMinutes: 0,
          availableMinutes: baseMinutes + carryOverMinutes,
        });

        // Audit
        await this.hourPacksRepository.addAudit({
          hourPackId: pack.id,
          action: 'CARRY_OVER',
          changedBy: 'cron',
          reason: `Monthly carry-over from ${prevMonth.year}-${prevMonth.month}`,
          previousValue: { month: `${prevMonth.year}-${prevMonth.month}` },
          newValue: {
            month: `${now.year}-${now.month}`,
            baseMinutes,
            carryOverMinutes,
            totalAvailable: baseMinutes + carryOverMinutes,
          },
        });

        this.logger.log(
          `✓ ${pack.client?.name}: carry-over ${carryOverMinutes}min (${(carryOverMinutes / 60).toFixed(1)}hs)`,
        );
      } catch (err) {
        this.logger.error(`✗ Pack ${pack.id}: ${(err as Error).message}`);
      }
    }

    this.logger.log('Monthly carry-over completed.');
  }
}

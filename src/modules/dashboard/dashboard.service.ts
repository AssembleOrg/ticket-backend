import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../tickets/domain/entities/ticket.entity.js';
import { Client } from '../clients/domain/entities/client.entity.js';
import { TimeEntry } from '../time-entries/domain/entities/time-entry.entity.js';
import { HourPack } from '../hour-packs/domain/entities/hour-pack.entity.js';
import { HourPackMonth } from '../hour-packs/domain/entities/hour-pack-month.entity.js';
import { DateTime } from 'luxon';

const TIMEZONE = 'America/Argentina/Buenos_Aires';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    @InjectRepository(TimeEntry) private readonly timeEntryRepo: Repository<TimeEntry>,
    @InjectRepository(HourPack) private readonly hourPackRepo: Repository<HourPack>,
    @InjectRepository(HourPackMonth) private readonly hourPackMonthRepo: Repository<HourPackMonth>,
  ) {}

  async getStats() {
    const now = DateTime.now().setZone(TIMEZONE);

    // Counts
    const [openTickets, closedTickets, totalClients] = await Promise.all([
      this.ticketRepo.count({ where: [{ status: 'OPEN' as any }, { status: 'IN_PROGRESS' as any }, { status: 'RESOLVED' as any }] }),
      this.ticketRepo.count({ where: { status: 'CLOSED' as any } }),
      this.clientRepo.count(),
    ]);

    // Total consumed minutes this month (across all clients)
    const consumedResult = await this.timeEntryRepo
      .createQueryBuilder('te')
      .select('COALESCE(SUM(te.minutes), 0)', 'total')
      .where('EXTRACT(YEAR FROM te.logged_at) = :year', { year: now.year })
      .andWhere('EXTRACT(MONTH FROM te.logged_at) = :month', { month: now.month })
      .getRawOne();
    const consumedMinutesThisMonth = parseInt(consumedResult?.total ?? '0', 10);

    // Recent tickets (last 5)
    const recentTickets = await this.ticketRepo.find({
      relations: ['client', 'project'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Hour packs with current month status per client
    const activePacks = await this.hourPackRepo.find({
      where: { active: true },
      relations: ['client'],
    });

    const hourPacks = await Promise.all(
      activePacks.map(async (pack) => {
        let monthRecord = await this.hourPackMonthRepo.findOne({
          where: { hourPackId: pack.id, year: now.year, month: now.month },
        });

        if (!monthRecord) {
          monthRecord = this.hourPackMonthRepo.create({
            hourPackId: pack.id,
            year: now.year,
            month: now.month,
            baseMinutes: Number(pack.monthlyHours) * 60,
            carryOverMinutes: 0,
            consumedMinutes: 0,
            availableMinutes: Number(pack.monthlyHours) * 60,
          });
          monthRecord = await this.hourPackMonthRepo.save(monthRecord);
        }

        // Real consumed from time entries
        const consumed = await this.timeEntryRepo
          .createQueryBuilder('te')
          .innerJoin('te.ticket', 'ticket')
          .select('COALESCE(SUM(te.minutes), 0)', 'total')
          .where('ticket.clientId = :clientId', { clientId: pack.clientId })
          .andWhere('EXTRACT(YEAR FROM te.logged_at) = :year', { year: now.year })
          .andWhere('EXTRACT(MONTH FROM te.logged_at) = :month', { month: now.month })
          .getRawOne();
        const consumedMinutes = parseInt(consumed?.total ?? '0', 10);
        const totalAvailable = monthRecord.baseMinutes + monthRecord.carryOverMinutes;

        return {
          clientId: pack.clientId,
          clientName: pack.client?.name ?? '—',
          weeklyHours: Number(pack.weeklyHours),
          monthlyHours: Number(pack.monthlyHours),
          consumedMinutes,
          totalAvailableMinutes: totalAvailable,
          remainingMinutes: totalAvailable - consumedMinutes,
          percentage: totalAvailable > 0 ? Math.round((consumedMinutes / totalAvailable) * 100) : 0,
        };
      }),
    );

    return {
      openTickets,
      closedTickets,
      totalClients,
      consumedHoursThisMonth: +(consumedMinutesThisMonth / 60).toFixed(1),
      recentTickets,
      hourPacks,
    };
  }
}

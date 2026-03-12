import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HourPack } from '../domain/entities/hour-pack.entity.js';
import { HourPackMonth } from '../domain/entities/hour-pack-month.entity.js';
import { HourPackAudit } from '../domain/entities/hour-pack-audit.entity.js';

@Injectable()
export class HourPacksRepository {
  constructor(
    @InjectRepository(HourPack)
    private readonly packRepo: Repository<HourPack>,
    @InjectRepository(HourPackMonth)
    private readonly monthRepo: Repository<HourPackMonth>,
    @InjectRepository(HourPackAudit)
    private readonly auditRepo: Repository<HourPackAudit>,
  ) {}

  async findByClientId(clientId: string): Promise<HourPack | null> {
    return this.packRepo.findOne({
      where: { clientId, active: true },
      relations: ['client'],
    });
  }

  async findById(id: string): Promise<HourPack | null> {
    return this.packRepo.findOne({
      where: { id },
      relations: ['client'],
    });
  }

  async create(data: Partial<HourPack>): Promise<HourPack> {
    const entity = this.packRepo.create(data);
    return this.packRepo.save(entity);
  }

  async update(id: string, data: Partial<HourPack>): Promise<HourPack> {
    await this.packRepo.update(id, data);
    return this.findById(id) as Promise<HourPack>;
  }

  async findAllActivePacks(): Promise<HourPack[]> {
    return this.packRepo.find({ where: { active: true }, relations: ['client'] });
  }

  // Month records
  async findMonth(hourPackId: string, year: number, month: number): Promise<HourPackMonth | null> {
    return this.monthRepo.findOne({ where: { hourPackId, year, month } });
  }

  async findMonthsByPackId(hourPackId: string): Promise<HourPackMonth[]> {
    return this.monthRepo.find({
      where: { hourPackId },
      order: { year: 'DESC', month: 'DESC' },
    });
  }

  async createMonth(data: Partial<HourPackMonth>): Promise<HourPackMonth> {
    const entity = this.monthRepo.create(data);
    return this.monthRepo.save(entity);
  }

  async updateMonth(id: string, data: Partial<HourPackMonth>): Promise<void> {
    await this.monthRepo.update(id, data);
  }

  // Audit
  async addAudit(data: Partial<HourPackAudit>): Promise<HourPackAudit> {
    const entity = this.auditRepo.create(data);
    return this.auditRepo.save(entity);
  }

  async getAuditsByPackId(hourPackId: string): Promise<HourPackAudit[]> {
    return this.auditRepo.find({
      where: { hourPackId },
      order: { createdAt: 'DESC' },
    });
  }
}

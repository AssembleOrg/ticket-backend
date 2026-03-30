import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaultEntry } from '../domain/entities/vault-entry.entity.js';

@Injectable()
export class VaultRepository {
  constructor(
    @InjectRepository(VaultEntry)
    private readonly repo: Repository<VaultEntry>,
  ) {}

  async findAll(): Promise<VaultEntry[]> {
    return this.repo.find({ order: { label: 'ASC' } });
  }

  async findByClient(clientId: string): Promise<VaultEntry[]> {
    return this.repo.find({ where: { clientId }, order: { label: 'ASC' } });
  }

  async findByProject(projectId: string): Promise<VaultEntry[]> {
    return this.repo.find({ where: { projectId }, order: { label: 'ASC' } });
  }

  async findById(id: string): Promise<VaultEntry | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<VaultEntry>): Promise<VaultEntry> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<VaultEntry>): Promise<VaultEntry> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<VaultEntry>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}

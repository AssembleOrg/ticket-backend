import { Injectable, NotFoundException } from '@nestjs/common';
import { VaultRepository } from '../infrastructure/vault.repository.js';
import { CreateVaultEntryDto } from './dto/create-vault-entry.dto.js';
import { UpdateVaultEntryDto } from './dto/update-vault-entry.dto.js';

@Injectable()
export class VaultService {
  constructor(private readonly vaultRepository: VaultRepository) {}

  async findAll() {
    return this.vaultRepository.findAll();
  }

  async findByClient(clientId: string) {
    return this.vaultRepository.findByClient(clientId);
  }

  async findByProject(projectId: string) {
    return this.vaultRepository.findByProject(projectId);
  }

  async findById(id: string) {
    const entry = await this.vaultRepository.findById(id);
    if (!entry) throw new NotFoundException('Vault entry not found');
    return entry;
  }

  async create(dto: CreateVaultEntryDto) {
    return this.vaultRepository.create(dto);
  }

  async update(id: string, dto: UpdateVaultEntryDto) {
    await this.findById(id);
    return this.vaultRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.vaultRepository.softDelete(id);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaultEntry } from './domain/entities/vault-entry.entity.js';
import { VaultController } from './vault.controller.js';
import { VaultService } from './application/vault.service.js';
import { VaultRepository } from './infrastructure/vault.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([VaultEntry])],
  controllers: [VaultController],
  providers: [VaultService, VaultRepository],
  exports: [VaultService],
})
export class VaultModule {}

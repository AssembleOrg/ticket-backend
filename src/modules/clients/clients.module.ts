import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './domain/entities/client.entity.js';
import { ClientsController } from './clients.controller.js';
import { ClientsService } from './application/clients.service.js';
import { ClientsRepository } from './infrastructure/clients.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  controllers: [ClientsController],
  providers: [ClientsService, ClientsRepository],
  exports: [ClientsService],
})
export class ClientsModule {}

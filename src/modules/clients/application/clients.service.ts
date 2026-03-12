import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ClientsRepository } from '../infrastructure/clients.repository.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}

  async findAll(query: PaginationQueryDto) {
    return this.clientsRepository.findAllPaginated(query);
  }

  async findById(id: string) {
    const client = await this.clientsRepository.findById(id);
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async findByPhone(phone: string) {
    return this.clientsRepository.findByPhone(phone);
  }

  async create(dto: CreateClientDto) {
    const existing = await this.clientsRepository.findByPhone(dto.phone);
    if (existing) throw new ConflictException('Phone already registered');
    return this.clientsRepository.create(dto);
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findById(id);
    return this.clientsRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.clientsRepository.softDelete(id);
  }
}

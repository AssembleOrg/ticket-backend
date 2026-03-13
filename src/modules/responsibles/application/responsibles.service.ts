import { Injectable, NotFoundException } from '@nestjs/common';
import { ResponsiblesRepository } from '../infrastructure/responsibles.repository.js';
import { CreateResponsibleDto } from './dto/create-responsible.dto.js';
import { UpdateResponsibleDto } from './dto/update-responsible.dto.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

@Injectable()
export class ResponsiblesService {
  constructor(private readonly responsiblesRepository: ResponsiblesRepository) {}

  async findAll(query: PaginationQueryDto) {
    return this.responsiblesRepository.findAllPaginated(query);
  }

  async findById(id: string) {
    const responsible = await this.responsiblesRepository.findById(id);
    if (!responsible) throw new NotFoundException('Responsible not found');
    return responsible;
  }

  async create(dto: CreateResponsibleDto) {
    return this.responsiblesRepository.create(dto);
  }

  async update(id: string, dto: UpdateResponsibleDto) {
    await this.findById(id);
    return this.responsiblesRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.responsiblesRepository.softDelete(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../domain/entities/project.entity.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface.js';

@Injectable()
export class ProjectsRepository {
  constructor(
    @InjectRepository(Project)
    private readonly repo: Repository<Project>,
  ) {}

  async findAllPaginated(query: PaginationQueryDto): Promise<PaginatedResult<Project>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      skip,
      take: limit,
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findByClientId(clientId: string): Promise<Project[]> {
    return this.repo.find({ where: { clientId }, order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<Project | null> {
    return this.repo.findOne({ where: { id }, relations: ['client'] });
  }

  async create(data: Partial<Project>): Promise<Project> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Project>): Promise<Project> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<Project>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}

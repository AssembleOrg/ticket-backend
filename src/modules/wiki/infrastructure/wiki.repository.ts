import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WikiPage } from '../domain/entities/wiki-page.entity.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface.js';

@Injectable()
export class WikiRepository {
  constructor(
    @InjectRepository(WikiPage)
    private readonly repo: Repository<WikiPage>,
  ) {}

  async findAllPaginated(query: PaginationQueryDto): Promise<PaginatedResult<WikiPage>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      skip,
      take: limit,
      order: { updatedAt: 'DESC' },
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

  async findAllMetadata(): Promise<Pick<WikiPage, 'id' | 'title' | 'tags' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'>[]> {
    return this.repo.find({
      select: ['id', 'title', 'tags', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<WikiPage | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<WikiPage>): Promise<WikiPage> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<WikiPage>): Promise<WikiPage> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<WikiPage>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}

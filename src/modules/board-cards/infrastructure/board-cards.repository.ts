import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardCard } from '../domain/entities/board-card.entity.js';

@Injectable()
export class BoardCardsRepository {
  constructor(
    @InjectRepository(BoardCard)
    private readonly repo: Repository<BoardCard>,
  ) {}

  async findByResponsible(responsibleId: string): Promise<BoardCard[]> {
    return this.repo.find({
      where: { responsibleId },
      order: { column: 'ASC', position: 'ASC', createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<BoardCard | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<BoardCard>): Promise<BoardCard> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<BoardCard>): Promise<BoardCard> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<BoardCard>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}

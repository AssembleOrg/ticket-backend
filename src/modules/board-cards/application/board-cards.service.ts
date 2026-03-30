import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardCardsRepository } from '../infrastructure/board-cards.repository.js';
import { CreateBoardCardDto } from './dto/create-board-card.dto.js';
import { UpdateBoardCardDto } from './dto/update-board-card.dto.js';

@Injectable()
export class BoardCardsService {
  constructor(private readonly boardCardsRepository: BoardCardsRepository) {}

  async findByResponsible(responsibleId: string) {
    return this.boardCardsRepository.findByResponsible(responsibleId);
  }

  async findById(id: string) {
    const card = await this.boardCardsRepository.findById(id);
    if (!card) throw new NotFoundException('Card not found');
    return card;
  }

  async create(dto: CreateBoardCardDto) {
    return this.boardCardsRepository.create(dto);
  }

  async update(id: string, dto: UpdateBoardCardDto) {
    await this.findById(id);
    return this.boardCardsRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.boardCardsRepository.softDelete(id);
  }
}

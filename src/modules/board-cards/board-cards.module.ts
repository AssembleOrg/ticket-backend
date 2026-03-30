import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardCard } from './domain/entities/board-card.entity.js';
import { BoardCardsController } from './board-cards.controller.js';
import { BoardCardsService } from './application/board-cards.service.js';
import { BoardCardsRepository } from './infrastructure/board-cards.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([BoardCard])],
  controllers: [BoardCardsController],
  providers: [BoardCardsService, BoardCardsRepository],
  exports: [BoardCardsService],
})
export class BoardCardsModule {}

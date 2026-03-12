import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketComment } from './domain/entities/comment.entity.js';
import { CommentsController } from './comments.controller.js';
import { CommentsService } from './application/comments.service.js';
import { CommentsRepository } from './infrastructure/comments.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([TicketComment])],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository],
  exports: [CommentsService],
})
export class CommentsModule {}

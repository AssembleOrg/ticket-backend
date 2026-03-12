import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async findByTicket(ticketId: string, query: PaginationQueryDto) {
    return this.commentsRepository.findByTicketPaginated(ticketId, query);
  }

  async create(dto: CreateCommentDto) {
    return this.commentsRepository.create({
      ...dto,
      authorType: dto.authorType ?? 'internal',
    });
  }

  async remove(id: string) {
    const comment = await this.commentsRepository.findById(id);
    if (!comment) throw new NotFoundException('Comment not found');
    await this.commentsRepository.delete(id);
  }
}

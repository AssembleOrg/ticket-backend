import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './application/comments.service.js';
import { CreateCommentDto } from './application/dto/create-comment.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('by-ticket/:ticketId')
  @ApiOperation({ summary: 'Get comments for a ticket (paginated)' })
  findByTicket(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.commentsService.findByTicket(ticketId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Add a comment to a ticket' })
  create(@Body() dto: CreateCommentDto) {
    return this.commentsService.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.remove(id);
  }
}

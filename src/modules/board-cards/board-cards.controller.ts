import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BoardCardsService } from './application/board-cards.service.js';
import { CreateBoardCardDto } from './application/dto/create-board-card.dto.js';
import { UpdateBoardCardDto } from './application/dto/update-board-card.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';

@ApiTags('Board Cards')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('board-cards')
export class BoardCardsController {
  constructor(private readonly boardCardsService: BoardCardsService) {}

  @Get('by-responsible/:responsibleId')
  @ApiOperation({ summary: 'Get cards for a responsible' })
  findByResponsible(@Param('responsibleId', ParseUUIDPipe) responsibleId: string) {
    return this.boardCardsService.findByResponsible(responsibleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get card by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.boardCardsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a board card' })
  create(@Body() dto: CreateBoardCardDto) {
    return this.boardCardsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a board card' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBoardCardDto,
  ) {
    return this.boardCardsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a board card (soft)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.boardCardsService.remove(id);
  }
}

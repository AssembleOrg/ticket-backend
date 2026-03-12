import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './application/tickets.service.js';
import { CreateTicketDto } from './application/dto/create-ticket.dto.js';
import { UpdateTicketDto } from './application/dto/update-ticket.dto.js';
import { FilterTicketsDto } from './application/dto/filter-tickets.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tickets (paginated with filters)' })
  findAll(@Query() filters: FilterTicketsDto) {
    return this.ticketsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.findById(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get ticket by code (e.g. TK-000001)' })
  findByCode(@Param('code') code: string) {
    return this.ticketsService.findByCode(code);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a ticket' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ticket (soft)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.remove(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get ticket status change history' })
  getHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.getHistory(id);
  }
}

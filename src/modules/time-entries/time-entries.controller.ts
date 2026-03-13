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
import { TimeEntriesService } from './application/time-entries.service.js';
import { CreateTimeEntryDto } from './application/dto/create-time-entry.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';

@ApiTags('Time Entries')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('time-entries')
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Get('by-ticket/:ticketId')
  @ApiOperation({ summary: 'Get time entries for a ticket (paginated)' })
  findByTicket(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.timeEntriesService.findByTicket(ticketId, query);
  }

  @Get('by-ticket/:ticketId/total')
  @ApiOperation({ summary: 'Get total minutes logged for a ticket' })
  getTotalByTicket(@Param('ticketId', ParseUUIDPipe) ticketId: string) {
    return this.timeEntriesService.getTotalMinutesByTicket(ticketId);
  }

  @Post()
  @ApiOperation({ summary: 'Log time manually' })
  create(@Body() dto: CreateTimeEntryDto) {
    return this.timeEntriesService.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a time entry' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.timeEntriesService.remove(id);
  }
}

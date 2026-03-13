import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HourPacksService } from './application/hour-packs.service.js';
import { CreateHourPackDto } from './application/dto/create-hour-pack.dto.js';
import { UpdateHourPackDto } from './application/dto/update-hour-pack.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';

@ApiTags('Hour Packs')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('hour-packs')
export class HourPacksController {
  constructor(private readonly hourPacksService: HourPacksService) {}

  @Get('audits')
  @ApiOperation({ summary: 'Get all audit logs (paginated)' })
  getAllAudits(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.hourPacksService.getAllAudits(
      parseInt(page ?? '1', 10) || 1,
      parseInt(limit ?? '20', 10) || 20,
    );
  }

  @Get('by-client/:clientId')
  @ApiOperation({ summary: 'Get hour pack for a client' })
  findByClient(@Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.hourPacksService.findByClientId(clientId);
  }

  @Get('by-client/:clientId/status')
  @ApiOperation({ summary: 'Get current month hour status for a client' })
  getStatus(@Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.hourPacksService.getCurrentMonthStatus(clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hour pack by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hourPacksService.findById(id);
  }

  @Get(':id/months')
  @ApiOperation({ summary: 'Get monthly history for a pack' })
  getMonths(@Param('id', ParseUUIDPipe) id: string) {
    return this.hourPacksService.getMonths(id);
  }

  @Get(':id/audits')
  @ApiOperation({ summary: 'Get audit log for a pack' })
  getAudits(@Param('id', ParseUUIDPipe) id: string) {
    return this.hourPacksService.getAudits(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create hour pack for a client' })
  create(@Body() dto: CreateHourPackDto) {
    return this.hourPacksService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update hour pack (with audit)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHourPackDto,
  ) {
    return this.hourPacksService.update(id, dto);
  }
}

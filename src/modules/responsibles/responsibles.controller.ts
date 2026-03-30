import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResponsiblesService } from './application/responsibles.service.js';
import { CreateResponsibleDto } from './application/dto/create-responsible.dto.js';
import { UpdateResponsibleDto } from './application/dto/update-responsible.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/guards/roles.guard.js';
import { UserRole } from '../auth/domain/allowed-email.entity.js';

@ApiTags('Responsibles')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Controller('responsibles')
export class ResponsiblesController {
  constructor(private readonly responsiblesService: ResponsiblesService) {}

  @Get()
  @ApiOperation({ summary: 'List all responsibles (paginated)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.responsiblesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get responsible by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.responsiblesService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new responsible (admin only)' })
  create(@Body() dto: CreateResponsibleDto) {
    return this.responsiblesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a responsible (admin only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateResponsibleDto,
  ) {
    return this.responsiblesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a responsible (admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.responsiblesService.remove(id);
  }
}

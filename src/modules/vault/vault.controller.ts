import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VaultService } from './application/vault.service.js';
import { CreateVaultEntryDto } from './application/dto/create-vault-entry.dto.js';
import { UpdateVaultEntryDto } from './application/dto/update-vault-entry.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';

@ApiTags('Vault')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get()
  @ApiOperation({ summary: 'List all vault entries' })
  findAll() {
    return this.vaultService.findAll();
  }

  @Get('by-client/:clientId')
  @ApiOperation({ summary: 'Get vault entries for a client' })
  findByClient(@Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.vaultService.findByClient(clientId);
  }

  @Get('by-project/:projectId')
  @ApiOperation({ summary: 'Get vault entries for a project' })
  findByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.vaultService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vault entry by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vaultService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a vault entry' })
  create(@Body() dto: CreateVaultEntryDto) {
    return this.vaultService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vault entry' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateVaultEntryDto) {
    return this.vaultService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vault entry (soft)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vaultService.remove(id);
  }
}

import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WikiService } from './application/wiki.service.js';
import { CreateWikiPageDto } from './application/dto/create-wiki-page.dto.js';
import { UpdateWikiPageDto } from './application/dto/update-wiki-page.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';

@ApiTags('Wiki')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @Get()
  @ApiOperation({ summary: 'List all wiki pages (paginated)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.wikiService.findAll(query);
  }

  @Get('nodes')
  @ApiOperation({ summary: 'Get all wiki nodes (metadata only, no content)' })
  findAllNodes() {
    return this.wikiService.findAllNodes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wiki page by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.wikiService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a wiki page' })
  create(@Body() dto: CreateWikiPageDto) {
    return this.wikiService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a wiki page' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWikiPageDto) {
    return this.wikiService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a wiki page (soft)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.wikiService.remove(id);
  }
}

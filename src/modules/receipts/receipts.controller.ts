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
import { ReceiptsService } from './application/receipts.service.js';
import { CreateReceiptDto } from './application/dto/create-receipt.dto.js';
import { UpdateReceiptDto } from './application/dto/update-receipt.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/guards/roles.guard.js';
import { UserRole } from '../auth/domain/allowed-email.entity.js';

@ApiTags('Receipts')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  @ApiOperation({ summary: 'List all receipts (paginated)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.receiptsService.findAll(query);
  }

  @Get('next-number')
  @ApiOperation({ summary: 'Get next receipt number' })
  async getNextNumber() {
    const nextNumber = await this.receiptsService.getNextNumber();
    return { nextNumber };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get receipt by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.receiptsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new receipt' })
  create(@Body() dto: CreateReceiptDto) {
    return this.receiptsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a receipt (within 24h of creation)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReceiptDto,
  ) {
    return this.receiptsService.update(id, dto);
  }

  @Patch(':id/void')
  @ApiOperation({ summary: 'Void a receipt (mark as annulled)' })
  void(@Param('id', ParseUUIDPipe) id: string) {
    return this.receiptsService.void(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a receipt (soft, within 24h)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.receiptsService.remove(id);
  }
}

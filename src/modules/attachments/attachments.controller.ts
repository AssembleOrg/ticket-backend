import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { AttachmentsService } from './application/attachments.service.js';
import { UploadAttachmentDto } from './application/dto/upload-attachment.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';

@ApiTags('Attachments')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get('by-ticket/:ticketId')
  @ApiOperation({ summary: 'Get attachments for a ticket (paginated)' })
  findByTicket(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.attachmentsService.findByTicket(ticketId, query);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file attachment to a ticket' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAttachmentDto,
  ) {
    return this.attachmentsService.upload(file, dto.ticketId, dto.uploadedBy);
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Get a signed URL for an attachment' })
  getSignedUrl(@Param('id', ParseUUIDPipe) id: string) {
    return this.attachmentsService.getSignedUrl(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attachment' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.attachmentsService.remove(id);
  }
}

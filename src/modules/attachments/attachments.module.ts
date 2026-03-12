import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './domain/entities/attachment.entity.js';
import { AttachmentsController } from './attachments.controller.js';
import { AttachmentsService } from './application/attachments.service.js';
import { AttachmentsRepository } from './infrastructure/attachments.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment])],
  controllers: [AttachmentsController],
  providers: [AttachmentsService, AttachmentsRepository],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}

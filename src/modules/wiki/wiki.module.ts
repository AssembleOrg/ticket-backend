import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WikiPage } from './domain/entities/wiki-page.entity.js';
import { WikiController } from './wiki.controller.js';
import { WikiService } from './application/wiki.service.js';
import { WikiRepository } from './infrastructure/wiki.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([WikiPage])],
  controllers: [WikiController],
  providers: [WikiService, WikiRepository],
  exports: [WikiService],
})
export class WikiModule {}

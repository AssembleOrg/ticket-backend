import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Responsible } from './domain/entities/responsible.entity.js';
import { ResponsiblesController } from './responsibles.controller.js';
import { ResponsiblesService } from './application/responsibles.service.js';
import { ResponsiblesRepository } from './infrastructure/responsibles.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([Responsible])],
  controllers: [ResponsiblesController],
  providers: [ResponsiblesService, ResponsiblesRepository],
  exports: [ResponsiblesService],
})
export class ResponsiblesModule {}

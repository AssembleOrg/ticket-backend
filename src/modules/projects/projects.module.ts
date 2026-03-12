import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './domain/entities/project.entity.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './application/projects.service.js';
import { ProjectsRepository } from './infrastructure/projects.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository],
  exports: [ProjectsService],
})
export class ProjectsModule {}

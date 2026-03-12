import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './domain/entities/task.entity.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './application/tasks.service.js';
import { TasksRepository } from './infrastructure/tasks.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
  exports: [TasksService],
})
export class TasksModule {}

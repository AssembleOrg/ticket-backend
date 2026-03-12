import { Injectable, NotFoundException } from '@nestjs/common';
import { TasksRepository } from '../infrastructure/tasks.repository.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async findByTicket(ticketId: string, query: PaginationQueryDto) {
    return this.tasksRepository.findByTicketPaginated(ticketId, query);
  }

  async findById(id: string) {
    const task = await this.tasksRepository.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(dto: CreateTaskDto) {
    return this.tasksRepository.create(dto);
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findById(id);
    return this.tasksRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.tasksRepository.softDelete(id);
  }
}

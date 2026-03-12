import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectsRepository } from '../infrastructure/projects.repository.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async findAll(query: PaginationQueryDto) {
    return this.projectsRepository.findAllPaginated(query);
  }

  async findByClientId(clientId: string) {
    return this.projectsRepository.findByClientId(clientId);
  }

  async findById(id: string) {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(dto: CreateProjectDto) {
    return this.projectsRepository.create(dto);
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findById(id);
    return this.projectsRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.projectsRepository.softDelete(id);
  }
}

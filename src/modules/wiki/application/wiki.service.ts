import { Injectable, NotFoundException } from '@nestjs/common';
import { WikiRepository } from '../infrastructure/wiki.repository.js';
import { CreateWikiPageDto } from './dto/create-wiki-page.dto.js';
import { UpdateWikiPageDto } from './dto/update-wiki-page.dto.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

@Injectable()
export class WikiService {
  constructor(private readonly wikiRepository: WikiRepository) {}

  async findAll(query: PaginationQueryDto) {
    return this.wikiRepository.findAllPaginated(query);
  }

  async findAllNodes() {
    return this.wikiRepository.findAllMetadata();
  }

  async findById(id: string) {
    const page = await this.wikiRepository.findById(id);
    if (!page) throw new NotFoundException('Wiki page not found');
    return page;
  }

  async create(dto: CreateWikiPageDto) {
    return this.wikiRepository.create({
      ...dto,
      tags: dto.tags ?? [],
    });
  }

  async update(id: string, dto: UpdateWikiPageDto) {
    await this.findById(id);
    return this.wikiRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.wikiRepository.softDelete(id);
  }
}

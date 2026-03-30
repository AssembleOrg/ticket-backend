import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../domain/entities/notification.entity.js';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async findRecent(limit = 20): Promise<Notification[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async countUnread(): Promise<number> {
    return this.repo.count({ where: { read: false } });
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async markAsRead(id: string): Promise<void> {
    await this.repo.update(id, { read: true });
  }

  async markAllAsRead(): Promise<void> {
    await this.repo.update({ read: false }, { read: true });
  }
}

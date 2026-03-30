import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../infrastructure/notifications.repository.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async findRecent(limit = 20) {
    return this.notificationsRepository.findRecent(limit);
  }

  async countUnread() {
    return this.notificationsRepository.countUnread();
  }

  async create(dto: CreateNotificationDto) {
    return this.notificationsRepository.create(dto);
  }

  async markAsRead(id: string) {
    return this.notificationsRepository.markAsRead(id);
  }

  async markAllAsRead() {
    return this.notificationsRepository.markAllAsRead();
  }
}

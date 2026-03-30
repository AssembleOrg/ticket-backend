import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './domain/entities/notification.entity.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './application/notifications.service.js';
import { NotificationsRepository } from './infrastructure/notifications.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}

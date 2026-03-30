import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../../domain/entities/notification.entity.js';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsString()
  @IsOptional()
  resourceType?: string;
}

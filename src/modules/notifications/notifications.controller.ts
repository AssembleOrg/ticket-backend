import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './application/notifications.service.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get recent notifications' })
  async findRecent(@Query('limit') limit?: string) {
    const data = await this.notificationsService.findRecent(
      limit ? parseInt(limit, 10) : 20,
    );
    const unreadCount = await this.notificationsService.countUnread();
    return { data, unreadCount };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead() {
    return this.notificationsService.markAllAsRead();
  }
}

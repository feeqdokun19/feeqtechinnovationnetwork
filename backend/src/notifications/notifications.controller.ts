import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  getNotifications(@Req() request: any) {
    return this.notificationsService.getUserNotifications(
      request.user.id,
    );
  }

  @Get('unread-count')
  getUnreadCount(@Req() request: any) {
    return this.notificationsService.getUnreadCount(
      request.user.id,
    );
  }

  @Patch('read-all')
  markAllAsRead(@Req() request: any) {
    return this.notificationsService.markAllAsRead(
      request.user.id,
    );
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') notificationId: string,
    @Req() request: any,
  ) {
    return this.notificationsService.markAsRead(
      notificationId,
      request.user.id,
    );
  }
}

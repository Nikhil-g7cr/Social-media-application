import { Controller, Get, Put, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@nestjs/passport'; // Using passport auth guard, common in nest

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Req() req: any) {
    // Assuming req.user has sub (userId) from JWT strategy
    const userId = req.user.sub || req.user.id; 
    return await this.notificationService.getUserNotifications(userId);
  }

  @Put('read-all')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return await this.notificationService.markAllAsRead(userId);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return await this.notificationService.markAsRead(id);
  }
}

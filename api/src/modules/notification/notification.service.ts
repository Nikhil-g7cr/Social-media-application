import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { NotificationAbsSQLDAO } from 'src/databse/mssql/abstract/notification.abstract.mssql';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationDao: NotificationAbsSQLDAO,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  async createNotification(payload: {
    userId: string;
    actorUserId: string;
    type: string;
    postId?: string;
  }) {
    if (payload.userId === payload.actorUserId) return null; // don't notify self

    const notification = await this.notificationDao.create(payload);
    
    // Emit via WebSocket
    this.chatGateway.server.to(`user_${payload.userId}`).emit('newNotification', notification);
    
    return notification;
  }

  async getUserNotifications(userId: string) {
    return await this.notificationDao.getNotifications(userId);
  }

  async markAsRead(notificationId: string) {
    await this.notificationDao.markAsRead(notificationId);
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.notificationDao.markAllAsRead(userId);
    return { success: true };
  }
}

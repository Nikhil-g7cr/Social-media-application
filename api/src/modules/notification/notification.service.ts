import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationAbsSQLDAO } from '../../databse/mssql/abstract/notification.abstract.mssql';
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

  @OnEvent('like.added')
  async handleLikeAdded(payload: { userId: string; actorUserId: string; postId: string }) {
    await this.createNotification({
      userId: payload.userId,
      actorUserId: payload.actorUserId,
      type: 'LIKE',
      postId: payload.postId,
    });
  }

  @OnEvent('comment.added')
  async handleCommentAdded(payload: { userId: string; actorUserId: string; postId: string }) {
    await this.createNotification({
      userId: payload.userId,
      actorUserId: payload.actorUserId,
      type: 'COMMENT',
      postId: payload.postId,
    });
  }

  @OnEvent('follow.requested')
  async handleFollowRequested(payload: { userId: string; actorUserId: string }) {
    await this.createNotification({
      userId: payload.userId,
      actorUserId: payload.actorUserId,
      type: 'FOLLOW_REQUEST',
    });
  }

  @OnEvent('follow.accepted')
  async handleFollowAccepted(payload: { userId: string; actorUserId: string }) {
    await this.createNotification({
      userId: payload.userId,
      actorUserId: payload.actorUserId,
      type: 'FOLLOW_ACCEPTED',
    });
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

  async deleteNotification(notificationId: string) {
    await this.notificationDao.delete(notificationId);
    return { success: true };
  }

  async deleteAllNotifications(userId: string) {
    await this.notificationDao.deleteAll(userId);
    return { success: true };
  }
}

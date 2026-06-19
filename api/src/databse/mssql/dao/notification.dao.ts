import { Injectable, Inject } from '@nestjs/common';
import { NotificationAbsSQLDAO } from '../abstract/notification.abstract.mssql';
import { MsSqlConstants } from '../connection/constant.mssql';
import { Notification } from '../models/notification.model';
import { Users } from '../models/user.model';
import { Posts } from '../models/post.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationSQLDao implements NotificationAbsSQLDAO {
  constructor(
    @Inject(MsSqlConstants.NOTIFICATION)
    private readonly notificationModel: typeof Notification,
  ) {}

  async create(payload: {
    userId: string;
    actorUserId: string;
    type: string;
    postId?: string;
  }): Promise<any> {
    const id = uuidv4();
    const notification = await this.notificationModel.create({
      ID: id,
      UserID: payload.userId,
      ActorUserID: payload.actorUserId,
      NotificationType: payload.type,
      PostID: payload.postId || null,
      IsRead: false,
      CreatedAt: new Date(),
    } as any);
    
    // Fetch with relations for returning to client
    return await this.notificationModel.findOne({
      where: { ID: id },
      include: [
        { model: Users, as: 'Actor', attributes: ['ID', 'UserName', 'ProfilePictureUrl'] },
        { model: Posts, as: 'Post', attributes: ['ID', 'Content'] },
      ],
    });
  }

  async getNotifications(userId: string, limit: number = 20): Promise<any[]> {
    return await this.notificationModel.findAll({
      where: { UserID: userId },
      include: [
        { model: Users, as: 'Actor', attributes: ['ID', 'UserName', 'ProfilePictureUrl'] },
        { model: Posts, as: 'Post', attributes: ['ID', 'Content'] },
      ],
      order: [['CreatedAt', 'DESC']],
      limit,
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationModel.update(
      { IsRead: true },
      { where: { ID: notificationId } }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.update(
      { IsRead: true },
      { where: { UserID: userId, IsRead: false } }
    );
  }
}

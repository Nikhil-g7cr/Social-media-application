import { Injectable, Inject } from '@nestjs/common';
import { NotificationAbsSQLDAO } from '../abstract/notification.abstract.mssql';
import { MsSqlConstants } from '../connection/constant.mssql';
import { Notification } from '../models/notification.model';
import {  Users } from '../models/user.model';
import { Posts } from '../models/post.model';
import { v4 as uuidv4 } from 'uuid';
import { PostsColumns } from 'src/core/enums/post.enum';
import { UserColumns } from 'src/core/enums/user.enums';
import { NotificationColumns } from 'src/core/enums/notificatio.enum';

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
      [NotificationColumns.ID]: id,
      [NotificationColumns.UserID]: payload.userId,
      [NotificationColumns.ActorUserID]: payload.actorUserId,
      [NotificationColumns.NotificationType]: payload.type,
      [NotificationColumns.PostID]: payload.postId || null,
      [NotificationColumns.IsRead]: false,
      [NotificationColumns.CreatedAt]: new Date(),
    } as any);
    
    // Fetch with relations for returning to client
    return await this.notificationModel.findOne({
      where: { [NotificationColumns.ID]: id },
      include: [
        { model: Users, as: 'Actor', attributes: [UserColumns.ID, UserColumns.UserName, UserColumns.ProfilePictureUrl], required: false },
        { model: Posts, as: 'Post', attributes: [PostsColumns.ID, PostsColumns.Content], required: false },
      ],
    });
  }

  async getNotifications(userId: string, limit: number = 20): Promise<any[]> {
    return await this.notificationModel.findAll({
      where: { [NotificationColumns.UserID]: userId },
      include: [
        { model: Users, as: 'Actor', attributes: [UserColumns.ID, UserColumns.UserName, UserColumns.ProfilePictureUrl], required: false },
        { model: Posts, as: 'Post', attributes: [PostsColumns.ID, PostsColumns.Content], required: false },
      ],
      order: [[NotificationColumns.CreatedAt, 'DESC']],
      limit,
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationModel.update(
      { [NotificationColumns.IsRead]: true },
      { where: { [NotificationColumns.ID]: notificationId } }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.update(
      { [NotificationColumns.IsRead]: true },
      { where: { [NotificationColumns.UserID]: userId, [NotificationColumns.IsRead]: false } }
    );
  }

  async delete(notificationId: string): Promise<void> {
    await this.notificationModel.destroy({ where: { [NotificationColumns.ID]: notificationId } });
  }

  async deleteAll(userId: string): Promise<void> {
    await this.notificationModel.destroy({ where: { [NotificationColumns.UserID]: userId } });
  }
}

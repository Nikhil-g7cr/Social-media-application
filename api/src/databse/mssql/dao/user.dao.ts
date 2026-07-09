import { Inject, Injectable } from '@nestjs/common';
import { MsSqlConstants } from '../connection/constant.mssql';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import {
  Users,
  Posts,
  Comments,
  Likes,
  Follow,
  Message,
  Notification,
  Reports,
  CP,
  PostView,
  MessageAttachment,
  PostHashtags,
  RefreshToken,
  Conversation,
  Session,
  Roles,
} from '../models';
import { PostMedia } from '../models/postMedia.model';
import AppLogger from '../../../core/logger/app-logger';
import { UsersDTO } from '../../../modules/user/dto/users.dto';
import {
  AppResponse,
  createResponse,
} from '../../../shared/appresponse.shared';
import { UserAbsSQLDAO } from '../abstract/user.abstract.mssql';
import { messageFactory, messages } from '../../../shared/message.shared';
import { randomUUID } from 'crypto';
import { UpdateUserDto } from '../../../modules/user/dto/UpdateUser.dto';
import { UserMessage } from '../../../core/enums/user.enums';

@Injectable()
export class UserSQLDao implements UserAbsSQLDAO {
  constructor(
    @Inject(MsSqlConstants.SEQUELIZE_PROVIDER) private sequelize: Sequelize,
    @Inject(MsSqlConstants.USER) private _user: typeof Users,
    @Inject(MsSqlConstants.POST) private _post: typeof Posts,
    @Inject(MsSqlConstants.COMMENT) private _comment: typeof Comments,
    @Inject(MsSqlConstants.LIKE) private _like: typeof Likes,
    @Inject(MsSqlConstants.FOLLOW) private _follow: typeof Follow,
    @Inject(MsSqlConstants.MESSAGE) private _message: typeof Message,
    @Inject(MsSqlConstants.NOTIFICATION)
    private _notification: typeof Notification,
    @Inject(MsSqlConstants.REPORT) private _report: typeof Reports,
    @Inject(MsSqlConstants.CONVERSATION_PARTICIPANTS) private _cp: typeof CP,
    @Inject(MsSqlConstants.POST_VIEW) private _postView: typeof PostView,
    @Inject(MsSqlConstants.MESSAGE_ATTACHMENT)
    private _messageAttachment: typeof MessageAttachment,
    @Inject(MsSqlConstants.POST_MEDIA) private _postMedia: typeof PostMedia,
    @Inject('POST_HASHTAG_MODEL') private _postHashtag: typeof PostHashtags,
    @Inject(MsSqlConstants.REFRESH_TOKEN)
    private _refreshToken: typeof RefreshToken,
    @Inject(MsSqlConstants.SESSION) private _session: typeof Session,
    @Inject(MsSqlConstants.CONVERSATION)
    private _conversation: typeof Conversation,
    @Inject(MsSqlConstants.ROLES) private _role: typeof Roles,
    readonly logger: AppLogger,
  ) {}

  // ==========================================
  // READ OPERATIONS (No Transactions Needed)
  // ==========================================

  async findByUsername(username: string): Promise<AppResponse> {
    try {
      const user = await this._user.findOne({
        where: {
          UserName: username.toLowerCase(),
          IsDeleted: false,
        },
        attributes: ['ID'], // Only fetch what's needed
      });

      return createResponse(200, UserMessage.S1, {
        available: !user,
      });
    } catch (error: any) {
      this.logger.error(error.stack || error.message, 500);

      return createResponse(
        500,
        'Failed to check username availability.',
        null,
      );
    }
  }

  async getUsers(userInfo?: any, showDeleted = false): Promise<AppResponse> {
    try {
      const whereClause: any = showDeleted ? {} : { IsDeleted: false };
      const users = await this._user.findAll({ where: whereClause });
      return createResponse(200, UserMessage.S2, users);
    } catch (error: any) {
      this.logger.error(error.stack, 500);
      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  async searchUsers(query: string): Promise<AppResponse> {
    try {
      const users = await this._user.findAll({
        where: {
          IsDeleted: false,
          [Op.or]: [
            { UserName: { [Op.like]: `%${query}%` } },
            { FullName: { [Op.like]: `%${query}%` } },
          ],
        },
        attributes: ['ID', 'UserName', 'FullName', 'ProfilePictureUrl', 'Bio'],
        limit: 20,
      });
      return createResponse(200, UserMessage.S3, users);
    } catch (error: any) {
      this.logger.error(error.stack, 500);
      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  async getUserByID(UserId: string): Promise<AppResponse> {
    try {
      const user = await this._user.findOne({ where: { ID: UserId } });
      if (!user) {
        return createResponse(
          404,
          messageFactory(messages.W12, ['User']),
          null,
        );
      }
      return createResponse(200, UserMessage.S4, user);
    } catch (error: any) {
      this.logger.error(error.stack, 500);
      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  async getUserRoleByID(UserID: string): Promise<AppResponse> {
    try {
      const user = await this._user.findOne({
        attributes: ['RoleID'],
        include: [{ model: this._role, as: 'Role' }],
        where: { ID: UserID },
      });

      if (!user) {
        return createResponse(
          404,
          messageFactory(messages.W12, ['User']),
          null,
        );
      }
      return createResponse(200, UserMessage.S5, {
        Role: (user as any).Role?.Name || 'USER',
      });
    } catch (error: any) {
      this.logger.error(error.stack, 500);
      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  // ==========================================
  // WRITE OPERATIONS (Transactions Applied)
  // ==========================================

  async addUser(UserInfo: UsersDTO): Promise<AppResponse> {
    const transaction = await this.sequelize.transaction();
    try {
      const defaultRole = await this._role.findOne({
        where: { Name: 'USER' },
        transaction,
      });

      const newUser = await this._user.create(
        {
          ID: randomUUID(),
          UserName: UserInfo.UserName,
          FullName: UserInfo.FullName,
          EmailAddress: UserInfo.EmailAddress,
          PasswordHash: UserInfo.Password, // <-- Mapped Password to PasswordHash
          ProfilePictureUrl: UserInfo.ProfilePictureUrl,
          Bio: UserInfo.Bio,
          Gender: UserInfo.Gender,
          RoleID: defaultRole?.ID,
          // CreatedBy: UserInfo.CreatedBy,
          //   CreatedAt: new Date(),
        } as any,
        { transaction },
      ); // <-- Added "as any" to bypass generic type errors

      await transaction.commit();
      const successMsg = UserMessage.S6;
      return createResponse(201, successMsg, newUser);
    } catch (error: any) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.log('Rollback failed:', rollbackError);
      }

      console.error(
        '🔥 DATABASE ERROR:',
        error.original?.message || error.message,
      );

      this.logger.error(error.stack, 500);

      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.original?.message || error.message,
      };
    }
  }

  async updateUser(
    UserInfo: UpdateUserDto,
    UserId: string,
  ): Promise<AppResponse> {
    const transaction = await this.sequelize.transaction();
    try {
      // First, check if user exists to prevent false 404s when submitting unchanged data
      const userExists = await this._user.findOne({
        where: { ID: UserId },
        transaction,
        attributes: ['ID'],
      });
      if (!userExists) {
        await transaction.rollback();
        return createResponse(
          404,
          messageFactory(messages.W12, ['User']),
          null,
        );
      }

      console.log('UpdateUserDto Payload received by DAO:', UserInfo);

      const [updatedRowsCount] = await this._user.update(
        {
          ...(UserInfo as any),
        },
        {
          where: { ID: UserId },
          transaction,
        },
      );

      await transaction.commit();
      return createResponse(200, UserMessage.S7, {
        updatedRowsCount,
      });
    } catch (error: any) {
      await transaction.rollback();
      this.logger.error(error.stack, 500);
      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  async softDeleteUser(UserId: string): Promise<AppResponse> {
    const transaction = await this.sequelize.transaction();
    try {
      const user = await this._user.findOne({
        where: { ID: UserId },
        transaction,
      });
      if (!user) {
        await transaction.rollback();
        return createResponse(
          404,
          messageFactory(messages.W12, ['User']),
          null,
        );
      }
      if ((user as any).IsDeleted) {
        await transaction.rollback();
        return createResponse(400, UserMessage.E1, null);
      }

      // Invalidate sessions
      await this._session.destroy({ where: { UserID: UserId }, transaction });

      const [updatedCount] = await this._user.update(
        { IsDeleted: true, DeletedAt: Sequelize.literal('GETDATE()') } as any,
        { where: { ID: UserId }, transaction },
      );

      if (updatedCount === 0) {
        await transaction.rollback();
        return createResponse(
          404,
          messageFactory(messages.W12, ['User']),
          null,
        );
      }

      await transaction.commit();
      this.logger.log(`User ${UserId} soft-deleted.`, 200);
      return createResponse(200, UserMessage.S8, null);
    } catch (error: any) {
      console.log('SOFT DELETE ERROR:', error);
      try {
        await transaction.rollback();
      } catch (e) {
        console.log('Rollback failed:', e);
      }
      this.logger.error(error.stack, 500);
      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  async restoreUser(UserId: string): Promise<AppResponse> {
    const transaction = await this.sequelize.transaction();
    try {
      const user = await this._user.findOne({
        where: { ID: UserId },
        transaction,
      });
      if (!user) {
        await transaction.rollback();
        return createResponse(
          404,
          messageFactory(messages.W12, ['User']),
          null,
        );
      }
      if (!(user as any).IsDeleted) {
        await transaction.rollback();
        return createResponse(400, UserMessage.E2, null);
      }

      const [updatedCount] = await this._user.update(
        { IsDeleted: false, DeletedAt: null } as any,
        { where: { ID: UserId }, transaction },
      );

      if (updatedCount === 0) {
        await transaction.rollback();
        return createResponse(
          404,
          messageFactory(messages.W12, ['User']),
          null,
        );
      }

      await transaction.commit();
      this.logger.log(`User ${UserId} restored.`, 200);
      return createResponse(200, UserMessage.S9, null);
    } catch (error: any) {
      await transaction.rollback();
      this.logger.error(error.stack, 500);
      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  async hardDeleteUser(UserId: string): Promise<AppResponse> {
    const transaction = await this.sequelize.transaction();
    try {
      await this._session.destroy({ where: { UserID: UserId }, transaction });
      await this._refreshToken.destroy({
        where: { UserID: UserId },
        transaction,
      });

      await this._notification.destroy({
        where: { [Op.or]: [{ UserID: UserId }, { ActorUserID: UserId }] },
        transaction,
      });

      // 2. Handle Reports — three separate FK references to Users:
      //    a NULL out ResolvedBy for reports this user resolved (SET NULL to satisfy FK constraint)
      await this._report.update({ ResolvedBy: null } as any, {
        where: { ResolvedBy: UserId },
        transaction,
      });
      //    b Delete reports submitted by this user
      await this._report.destroy({
        where: { ReporterID: UserId },
        transaction,
      });
      //    c Delete reports where this user IS the target (TargetType = 'USER')
      await this._report.destroy({ where: { TargetID: UserId }, transaction });

      // 3. Delete Follows
      await this._follow.destroy({
        where: { [Op.or]: [{ FollowerID: UserId }, { FollowingID: UserId }] },
        transaction,
      });

      // 4. Delete standalone interactions by this user
      await this._like.destroy({ where: { UserID: UserId }, transaction });
      await this._postView.destroy({ where: { User_id: UserId }, transaction });

      // Comments: Prevent FK error from replies (ParentComment)
      const userComments = await this._comment.findAll({
        where: { UserID: UserId },
        attributes: ['ID'],
        transaction,
      });
      const userCommentIds = userComments.map((c) => c.ID);
      if (userCommentIds.length > 0) {
        await this._comment.update({ ParentCommentID: null } as any, {
          where: { ParentCommentID: { [Op.in]: userCommentIds } },
          transaction,
        });
        await this._comment.destroy({
          where: { ID: { [Op.in]: userCommentIds } },
          transaction,
        });
      }

      // 5. Delete Chat Data
      const userMessages = await this._message.findAll({
        where: { SenderID: UserId },
        attributes: ['ID'],
        transaction,
      });
      const userMessageIds = userMessages.map((m) => m.ID);
      if (userMessageIds.length > 0) {
        await this._messageAttachment.destroy({
          where: { Message_id: { [Op.in]: userMessageIds } },
          transaction,
        });
      }
      await this._message.destroy({ where: { SenderID: UserId }, transaction });
      await this._cp.destroy({ where: { UserID: UserId }, transaction });

      // Update conversations created by this user to avoid FK error
      await this._conversation.update({ CreatedBy: null } as any, {
        where: { CreatedBy: UserId },
        transaction,
      });

      // 6. Handle Posts created by the user
      const userPosts = await this._post.findAll({
        where: { UserID: UserId },
        attributes: ['ID'],
        transaction,
      });
      const postIds = userPosts.map((p) => p.ID);
      if (postIds.length > 0) {
        // Delete notifications referencing these posts
        await this._notification.destroy({
          where: { PostID: { [Op.in]: postIds } },
          transaction,
        });

        await this._like.destroy({
          where: { PostID: { [Op.in]: postIds } },
          transaction,
        });

        // Handle comments on these posts (null parent references first)
        const postComments = await this._comment.findAll({
          where: { PostID: { [Op.in]: postIds } },
          attributes: ['ID'],
          transaction,
        });
        const postCommentIds = postComments.map((c) => c.ID);
        if (postCommentIds.length > 0) {
          await this._comment.update({ ParentCommentID: null } as any, {
            where: { ParentCommentID: { [Op.in]: postCommentIds } },
            transaction,
          });
          await this._comment.destroy({
            where: { ID: { [Op.in]: postCommentIds } },
            transaction,
          });
        }

        await this._postView.destroy({
          where: { Post_id: { [Op.in]: postIds } },
          transaction,
        });
        await this._postHashtag.destroy({
          where: { PostID: { [Op.in]: postIds } },
          transaction,
        });
        await this._postMedia.destroy({
          where: { PostID: { [Op.in]: postIds } },
          transaction,
        });
        await this._post.destroy({ where: { UserID: UserId }, transaction });
      }

      // 7. Finally, delete the user record
      const deletedRowsCount = await this._user.destroy({
        where: { ID: UserId },
        transaction,
      });
      if (deletedRowsCount === 0) {
        await transaction.rollback();
        return createResponse(
          404,
          messageFactory(messages.W12, ['User']),
          null,
        );
      }

      await transaction.commit();
      this.logger.log(`User ${UserId} permanently deleted.`, 200);
      return createResponse(200, UserMessage.S10, null);
    } catch (error: any) {
      await transaction.rollback();
      this.logger.error(error.stack, 500);
      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  /** @deprecated Use hardDeleteUser for explicit intent */
  async deleteUser(UserId: string): Promise<AppResponse> {
    return this.hardDeleteUser(UserId);
  }
}

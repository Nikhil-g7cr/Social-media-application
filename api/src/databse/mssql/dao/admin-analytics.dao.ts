import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { MsSqlConstants } from '../connection/constant.mssql';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import {
  Users,
  Posts,
  Comments,
  Likes,
  Message,
  Reports,
  Conversation,
} from '../models';
import { PostMedia } from '../models/postMedia.model';
import AppLogger from 'src/core/logger/app-logger';
import { AppResponse, createResponse } from 'src/shared/appresponse.shared';
import { AdminAnalyticsAbsSQLDAO } from '../abstract/admin-analytics.abstract.mssql';
import { UserColumns } from 'src/core/enums/user.enum';

@Injectable()
export class AdminAnalyticsSQLDAO implements AdminAnalyticsAbsSQLDAO {
  constructor(
    @Inject(MsSqlConstants.SEQUELIZE_PROVIDER) private sequelize: Sequelize,
    @Inject(MsSqlConstants.USER) private _user: typeof Users,
    @Inject(MsSqlConstants.POST) private _post: typeof Posts,
    @Inject(MsSqlConstants.COMMENT) private _comment: typeof Comments,
    @Inject(MsSqlConstants.LIKE) private _like: typeof Likes,
    @Inject(MsSqlConstants.MESSAGE) private _message: typeof Message,
    @Inject(MsSqlConstants.REPORT) private _report: typeof Reports,
    @Inject(MsSqlConstants.CONVERSATION)
    private _conversation: typeof Conversation,
    @Inject(MsSqlConstants.POST_MEDIA) private _postMedia: typeof PostMedia,
    readonly logger: AppLogger,
  ) {}

  async getDashboardSummary(): Promise<AppResponse> {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      let totalUsers = 0,
        activeUsers = 0,
        deletedUsers = 0,
        newUsersToday = 0;
      let totalPosts = 0,
        newPostsToday = 0,
        totalComments = 0,
        totalLikes = 0;
      let totalConversations = 0,
        totalMessages = 0,
        totalReports = 0,
        pendingReports = 0,
        resolvedReports = 0,
        totalMediaUploaded = 0;

      try {
        totalUsers = await this._user.count();
      } catch (e:any) {
        this.logger.error('totalUsers error', e);
      }
      try {
        activeUsers = await this._user.count({
          where: { IsDeleted: false, IsActive: true },
        });
      } catch (e:any) {
        this.logger.error('activeUsers error', e);
      }
      try {
        deletedUsers = await this._user.count({ where: { IsDeleted: true } });
      } catch (e:any) {
        this.logger.error('deletedUsers error', e);
      }
      try {
        newUsersToday = await this._user.count({
          where: { IsDeleted: false, CreatedAt: { [Op.gte]: startOfToday } },
        });
      } catch (e:any) {
        this.logger.error('newUsersToday error', e);
      }

      try {
        totalPosts = await this._post.count();
      } catch (e:any) {
        this.logger.error('totalPosts error', e);
      }
      try {
        newPostsToday = await this._post.count({
          where: { CreatedAt: { [Op.gte]: startOfToday } },
        });
      } catch (e:any) {
        this.logger.error('newPostsToday error', e);
      }

      try {
        totalComments = await this._comment.count();
      } catch (e:any) {
        this.logger.error('totalComments error', e);
      }
      try {
        totalLikes = await this._like.count();
      } catch (e:any) {
        this.logger.error('totalLikes error', e);
      }
      try {
        totalConversations = await this._conversation.count();
      } catch (e:any) {
        this.logger.error('totalConversations error', e);
      }
      try {
        totalMessages = await this._message.count();
      } catch (e:any) {
        this.logger.error('totalMessages error', e);
      }

      try {
        totalReports = await this._report.count();
      } catch (e:any) {
        this.logger.error('totalReports error', e);
      }
      try {
        pendingReports = await this._report.count({
          where: { Status: 'PENDING' },
        });
      } catch (e:any) {
        this.logger.error('pendingReports error', e);
      }
      try {
        resolvedReports = await this._report.count({
          where: { Status: 'RESOLVED' },
        });
      } catch (e:any) {
        this.logger.error('resolvedReports error', e);
      }
      try {
        totalMediaUploaded = await this._postMedia.count();
      } catch (e:any) {
        this.logger.error('totalMediaUploaded error', e);
      }

      const summary = {
        totalUsers,
        activeUsers,
        deletedUsers,
        newUsersToday,
        totalPosts,
        newPostsToday,
        totalComments,
        totalLikes,
        totalConversations,
        totalMessages,
        totalReports,
        pendingReports,
        resolvedReports,
        totalMediaUploaded,
      };

      return createResponse(HttpStatus.OK, 'Summary retrieved', summary);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error retrieving summary',
        error.message,
      );
    }
  }

  async getGrowthAnalytics(): Promise<AppResponse> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      let userGrowth: any[] = [];
      let postGrowth: any[] = [];

      try {
        userGrowth = await this.sequelize.query(
          `
          SELECT CAST(CreatedAt AS DATE) as Date, COUNT(ID) as count
          FROM Users
          WHERE CreatedAt >= :date AND IsDeleted = 0
          GROUP BY CAST(CreatedAt AS DATE)
          ORDER BY CAST(CreatedAt AS DATE) ASC
        `,
          { replacements: { date: thirtyDaysAgo }, type: 'SELECT' },
        );
      } catch (e:any) {
        this.logger.error('userGrowth error', e);
      }

      try {
        postGrowth = await this.sequelize.query(
          `
          SELECT CAST(P.CreatedAt AS DATE) as Date, COUNT(P.ID) as count
          FROM [Post] P
          INNER JOIN [Users] U ON P.UserID = U.ID
          WHERE P.CreatedAt >= :date AND U.IsDeleted = 0
          GROUP BY CAST(P.CreatedAt AS DATE)
          ORDER BY CAST(P.CreatedAt AS DATE) ASC
        `,
          { replacements: { date: thirtyDaysAgo }, type: 'SELECT' },
        );
      } catch (e:any) {
        this.logger.error('postGrowth error', e);
      }

      return createResponse(HttpStatus.OK, 'Growth analytics retrieved', {
        userGrowth,
        postGrowth,
      });
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error retrieving growth analytics',
        error.message,
      );
    }
  }

  async getContentDistribution(): Promise<AppResponse> {
    try {
      const mediaCounts = await this.sequelize.query(
        `
        SELECT PM.MediaType, COUNT(PM.ID) as count
        FROM [tbl_PostMedia] PM
        INNER JOIN [Post] P ON PM.PostID = P.ID
        INNER JOIN [Users] U ON P.UserID = U.ID
        WHERE U.IsDeleted = 0
        GROUP BY PM.MediaType
      `,
        { type: 'SELECT' },
      );

      const textPostsCountResult = await this.sequelize.query(
        `
        SELECT COUNT(P.ID) as count
        FROM [Post] P
        INNER JOIN [Users] U ON P.UserID = U.ID
        WHERE P.Type = 'TEXT' AND U.IsDeleted = 0
      `,
        { type: 'SELECT' },
      );

      const textPostsCount =
        Number((textPostsCountResult[0] as any)?.count) || 0;

      return createResponse(HttpStatus.OK, 'Content distribution retrieved', {
        mediaCounts,
        textPostsCount,
      });
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error retrieving content distribution',
        error.message,
      );
    }
  }

  async getTopUsers(): Promise<AppResponse> {
    try {
      const topUsersByPosts = await this.sequelize.query(
        `
          SELECT TOP 10 U.ID, U.UserName, U.FullName, U.ProfilePictureUrl, COUNT(P.ID) as PostCount
          FROM [Users] U
          LEFT JOIN [Post] P ON U.ID = P.UserID
          WHERE U.IsDeleted = 0
          GROUP BY U.ID, U.UserName, U.FullName, U.ProfilePictureUrl
          ORDER BY PostCount DESC
       `,
        { type: 'SELECT' },
      );

      return createResponse(
        HttpStatus.OK,
        'Top users retrieved',
        topUsersByPosts,
      );
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error retrieving top users',
        error.message,
      );
    }
  }

  async getRecentActivity(): Promise<AppResponse> {
    try {
      const recentUsers = await this._user.findAll({
        where: { IsDeleted: false },
        order: [['CreatedAt', 'DESC']],
        limit: 5,
        attributes: [
          UserColumns.ID,
          UserColumns.UserName,
          UserColumns.FullName,
          UserColumns.ProfilePictureUrl,
          UserColumns.CreatedAt,
        ],
      });

      let recentPosts: any[] = [];
      try {
        recentPosts = await this.sequelize.query(
          `
          SELECT TOP 5
            P.ID,
            P.UserID,
            P.Type,
            P.CreatedAt,
            U.UserName AS AuthorUserName,
            U.FullName AS AuthorFullName,
            U.ProfilePictureUrl AS AuthorProfilePictureUrl
          FROM [Post] P
          INNER JOIN [Users] U ON P.UserID = U.ID
          WHERE U.IsDeleted = 0
          ORDER BY P.CreatedAt DESC
        `,
          { type: 'SELECT' },
        );
      } catch (e:any) {
        this.logger.error('recentPosts join error', e);
      }

      return createResponse(HttpStatus.OK, 'Recent activity retrieved', {
        recentUsers,
        recentPosts,
      });
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error retrieving recent activity',
        error.message,
      );
    }
  }
}

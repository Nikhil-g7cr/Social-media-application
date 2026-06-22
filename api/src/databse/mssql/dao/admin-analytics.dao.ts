import { Inject, Injectable } from '@nestjs/common';
import { MsSqlConstants } from '../connection/constant.mssql';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Users, Posts, Comments, Likes, Follow, Message, Notification, Reports, CP, PostView, MessageAttachment, PostHashtags, RefreshToken, Conversation } from '../models';
import { PostMedia } from '../models/postMedia.model';
import AppLogger from 'src/core/logger/app-logger';
import { AppResponse, createResponse } from 'src/shared/appresponse.shared';
import { AdminAnalyticsAbsSQLDAO } from '../abstract/admin-analytics.abstract.mssql';

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
    @Inject(MsSqlConstants.CONVERSATION) private _conversation: typeof Conversation,
    @Inject(MsSqlConstants.POST_MEDIA) private _postMedia: typeof PostMedia,
    readonly logger: AppLogger,
  ) {}

  async getDashboardSummary(): Promise<AppResponse> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalUsers, activeUsers, deletedUsers, newUsersToday,
        totalPosts, newPostsToday, totalComments, totalLikes,
        totalConversations, totalMessages,
        totalReports, pendingReports, resolvedReports,
        totalMediaUploaded
      ] = await Promise.all([
        this._user.count(),
        this._user.count({ where: { IsDeleted: false } }),
        this._user.count({ where: { IsDeleted: true } }),
        this._user.count({ where: { CreatedAt: { [Op.gte]: today } } }),
        this._post.count(),
        this._post.count({ where: { CreatedAt: { [Op.gte]: today } } }),
        this._comment.count(),
        this._like.count(),
        this._conversation.count(),
        this._message.count(),
        this._report.count(),
        this._report.count({ where: { Status: 'PENDING' } }),
        this._report.count({ where: { Status: 'RESOLVED' } }),
        this._postMedia.count()
      ]);

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

      return createResponse(200, 'Summary retrieved', summary);
    } catch (error: any) {
      this.logger.error(error.stack, 500);
      return createResponse(500, 'Error retrieving summary', error.message);
    }
  }

  async getGrowthAnalytics(): Promise<AppResponse> {
    try {
      // For MSSQL, grouping by date can be tricky with Sequelize.
      // We will do a basic last 30 days query.
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const userGrowth = await this.sequelize.query(`
        SELECT CAST(CreatedAt AS DATE) as Date, COUNT(ID) as count
        FROM Users
        WHERE CreatedAt >= :date
        GROUP BY CAST(CreatedAt AS DATE)
        ORDER BY CAST(CreatedAt AS DATE) ASC
      `, { replacements: { date: thirtyDaysAgo }, type: 'SELECT' });

      const postGrowth = await this.sequelize.query(`
        SELECT CAST(CreatedAt AS DATE) as Date, COUNT(ID) as count
        FROM [Post]
        WHERE CreatedAt >= :date
        GROUP BY CAST(CreatedAt AS DATE)
        ORDER BY CAST(CreatedAt AS DATE) ASC
      `, { replacements: { date: thirtyDaysAgo }, type: 'SELECT' });

      return createResponse(200, 'Growth analytics retrieved', { userGrowth, postGrowth });
    } catch (error: any) {
      this.logger.error(error.stack, 500);
      return createResponse(500, 'Error retrieving growth analytics', error.message);
    }
  }

  async getContentDistribution(): Promise<AppResponse> {
    try {
      const mediaCounts = await this._postMedia.findAll({
        attributes: ['MediaType', [this.sequelize.fn('COUNT', this.sequelize.col('ID')), 'count']],
        group: ['MediaType']
      });

      const totalPosts = await this._post.count();
      const textPostsCount = await this._post.count({
        where: { Type: 'TEXT' }
      });

      return createResponse(200, 'Content distribution retrieved', {
        mediaCounts,
        textPostsCount
      });
    } catch (error: any) {
      this.logger.error(error.stack, 500);
      return createResponse(500, 'Error retrieving content distribution', error.message);
    }
  }

  async getTopUsers(): Promise<AppResponse> {
    try {
       // Simple top users based on posts count
        const topUsersByPosts = await this.sequelize.query(`
          SELECT TOP 10 U.ID, U.UserName, U.FullName, U.ProfilePictureUrl, COUNT(P.ID) as PostCount
          FROM [Users] U
          LEFT JOIN [Post] P ON U.ID = P.UserID
          GROUP BY U.ID, U.UserName, U.FullName, U.ProfilePictureUrl
          ORDER BY PostCount DESC
       `, { type: 'SELECT' });

       return createResponse(200, 'Top users retrieved', topUsersByPosts);
    } catch (error: any) {
      this.logger.error(error.stack, 500);
      return createResponse(500, 'Error retrieving top users', error.message);
    }
  }

  async getRecentActivity(): Promise<AppResponse> {
    try {
      const recentUsers = await this._user.findAll({
        order: [['CreatedAt', 'DESC']],
        limit: 5,
        attributes: ['ID', 'UserName', 'CreatedAt']
      });

      const recentPosts = await this._post.findAll({
        order: [['CreatedAt', 'DESC']],
        limit: 5,
        attributes: ['ID', 'UserID', 'CreatedAt']
      });

      return createResponse(200, 'Recent activity retrieved', { recentUsers, recentPosts });
    } catch (error: any) {
      this.logger.error(error.stack, 500);
      return createResponse(500, 'Error retrieving recent activity', error.message);
    }
  }
}

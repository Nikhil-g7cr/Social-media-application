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
      const todayStr = today.toISOString().split('T')[0];

      let totalUsers = 0, activeUsers = 0, deletedUsers = 0, newUsersToday = 0;
      let totalPosts = 0, newPostsToday = 0, totalComments = 0, totalLikes = 0;
      let totalConversations = 0, totalMessages = 0, totalReports = 0, pendingReports = 0, resolvedReports = 0, totalMediaUploaded = 0;

      try { totalUsers = await this._user.count(); } catch (e) { console.error('totalUsers error', e); }
      try { activeUsers = await this._user.count({ where: { IsDeleted: false } }); } catch (e) { console.error('activeUsers error', e); }
      try { deletedUsers = await this._user.count({ where: { IsDeleted: true } }); } catch (e) { console.error('deletedUsers error', e); }
      try { newUsersToday = await this._user.count({ where: { CreatedAt: { [Op.gte]: todayStr } } }); } catch (e) { console.error('newUsersToday error', e); }
      
      try { totalPosts = await this._post.count(); } catch (e) { console.error('totalPosts error', e); }
      try { newPostsToday = await this._post.count({ where: { CreatedAt: { [Op.gte]: todayStr } } }); } catch (e) { console.error('newPostsToday error', e); }
      
      try { totalComments = await this._comment.count(); } catch (e) { console.error('totalComments error', e); }
      try { totalLikes = await this._like.count(); } catch (e) { console.error('totalLikes error', e); }
      try { totalConversations = await this._conversation.count(); } catch (e) { console.error('totalConversations error', e); }
      try { totalMessages = await this._message.count(); } catch (e) { console.error('totalMessages error', e); }
      
      try { totalReports = await this._report.count(); } catch (e) { console.error('totalReports error', e); }
      try { pendingReports = await this._report.count({ where: { Status: 'PENDING' } }); } catch (e) { console.error('pendingReports error', e); }
      try { resolvedReports = await this._report.count({ where: { Status: 'RESOLVED' } }); } catch (e) { console.error('resolvedReports error', e); }
      try { totalMediaUploaded = await this._postMedia.count(); } catch (e) { console.error('totalMediaUploaded error', e); }


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
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      let userGrowth: any[] = [];
      let postGrowth: any[] = [];

      try {
        userGrowth = await this.sequelize.query(`
          SELECT CAST(CreatedAt AS DATE) as Date, COUNT(ID) as count
          FROM Users
          WHERE CreatedAt >= :date
          GROUP BY CAST(CreatedAt AS DATE)
          ORDER BY CAST(CreatedAt AS DATE) ASC
        `, { replacements: { date: thirtyDaysAgoStr }, type: 'SELECT' });
      } catch (e) { console.error('userGrowth error', e); }

      try {
        postGrowth = await this.sequelize.query(`
          SELECT CAST(CreatedAt AS DATE) as Date, COUNT(ID) as count
          FROM [Post]
          WHERE CreatedAt >= :date
          GROUP BY CAST(CreatedAt AS DATE)
          ORDER BY CAST(CreatedAt AS DATE) ASC
        `, { replacements: { date: thirtyDaysAgoStr }, type: 'SELECT' });
      } catch (e) { console.error('postGrowth error', e); }

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

import { HttpStatus, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import AppLogger from 'src/core/logger/app-logger';
import { PostAbstractSQLDao } from 'src/databse/mssql/abstract/posts.abstract.mssql';
import { AppResponse, createResponse } from 'src/shared/appresponse.shared';
import { PaginationDto } from 'src/core/dto/pagination.dto';
import { FollowSQLDao } from 'src/databse/mssql/dao/follow.dao';
import { FileService } from '../azure/azure.service';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class FeedService {
  constructor(
    private readonly logger: AppLogger,
    private readonly postDao: PostAbstractSQLDao,
    private readonly followDao: FollowSQLDao,
    private readonly fileService: FileService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async getFeed(
    userId: string,
    pagination: PaginationDto,
  ): Promise<AppResponse> {
    try {
      this.logger.log(`[FeedService] Fetching feed for user ${userId}`, 200);

      const followingIds = await this.followDao.getFollowingIds(userId);
      followingIds.push(userId); // Include current user's posts

      const response = await this.postDao.getFeedPosts(
        followingIds,
        pagination.page,
        pagination.limit,
      );

      // Sign Azure URLs if any media exists
      if (response.data && Array.isArray(response.data)) {
        response.data = await Promise.all(
          response.data.map(async (post: any) => {
            if (post.MediaURL) {
              post.MediaURL = await this.fileService.generateReadUrl(
                post.MediaURL,
              );
            }
            return post;
          }),
        );
      }

      return response;

    } catch (error: any) {
      this.logger.error(
        `[FeedService] Error fetching feed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to retrieve feed',
        ),
        description: error.message,
      };
    }
  }

  @OnEvent('post.created')
  async handlePostCreated(payload: { postData: any; userId: string }) {
    const { postData, userId } = payload;
    try {
      const followers = await this.followDao.getFollowers(userId);
      
      // Emit to the author's own room so they see it instantly
      this.chatGateway.server.to(`user_${userId}`).emit('newPostInFeed', postData);
      
      // Emit to all followers
      followers.forEach((f: any) => {
        if (f.FollowerID) {
          this.chatGateway.server.to(`user_${f.FollowerID}`).emit('newPostInFeed', postData);
        }
      });
    } catch (err) {
      this.logger.error(`[FeedService] Failed to broadcast post: ${err}`, 500);
    }
  }
}

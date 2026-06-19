import { HttpStatus, Injectable } from '@nestjs/common';
import AppLogger from 'src/core/logger/app-logger';
import { PostAbstractSQLDao } from 'src/databse/mssql/abstract/posts.abstract.mssql';
import { AppResponse, createResponse } from 'src/shared/appresponse.shared';
import { PaginationDto } from 'src/core/dto/pagination.dto';
import { FollowSQLDao } from 'src/databse/mssql/dao/follow.dao';
import { FileService } from '../azure/azure.service';

@Injectable()
export class FeedService {
  constructor(
    private readonly logger: AppLogger,
    private readonly postDao: PostAbstractSQLDao,
    private readonly followDao: FollowSQLDao,
    private readonly fileService: FileService,
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
}

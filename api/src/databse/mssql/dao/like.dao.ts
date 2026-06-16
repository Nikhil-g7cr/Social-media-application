import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import AppLogger from 'src/core/logger/app-logger';
import { AppResponse, createResponse } from 'src/shared/appresponse.shared';
import { messageFactory, messages } from 'src/shared/message.shared';
import { Likes } from '../models';
import { LikeAbstractSQLDAO } from '../abstract/like.abstract.mssql';
import { MsSqlConstants } from '../connection/constant.mssql';
// Import your Like model...

@Injectable()
export class LikeSQLDAO implements LikeAbstractSQLDAO {
  constructor(
    @Inject(MsSqlConstants.LIKE) private readonly likeModel: typeof Likes,
    private readonly logger: AppLogger,
  ) {}

  async toggleLike(postId: string, userId: string): Promise<AppResponse> {
    try {
      // 1. Check if the user already liked this post
      const existingLike = await this.likeModel.findOne({
        where: {
          PostID: postId, // Note: Your like.model.ts spells it 'PostsID'
          UserID: userId,
        },
      });

      // 2. If it exists, the user is trying to UNLIKE the post
      if (existingLike) {
        await this.likeModel.destroy({
          where: { ID: existingLike.ID },
        });

        return createResponse(HttpStatus.OK, 'Post unliked successfully', null);
      }

      // 3. If it doesn't exist, the user is trying to LIKE the post
      // 3. If it doesn't exist, the user is trying to LIKE the post
      const newLikePayload = {
        ID: randomUUID(),
        PostID: postId,
        UserID: userId,
        // No dates needed! Sequelize sees defaultValue: GETDATE() and lets SQL handle it
      };

      const newLike = await this.likeModel.create(newLikePayload as any);
      return createResponse(
        HttpStatus.CREATED,
        'Post liked successfully',
        newLike,
      );
    } catch (error: any) {
      // THIS IS THE IMPORTANT PART: Look at your terminal (where you ran 'npm run start')
      // after making the request to see what prints here:
      console.error('=== RAW DATABASE ERROR ===');
      console.error(error);
      console.error('==========================');

      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to toggle like',
        ),
        description:
          error?.original?.message || error?.message || 'Unknown Error',
      };
    }
  }
}

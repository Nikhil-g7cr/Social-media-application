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
export class LikeSQLDAO implements LikeAbstractSQLDAO{
  constructor(
    @Inject(MsSqlConstants.LIKE) private readonly likeModel: typeof Likes,    
    private readonly logger: AppLogger
  ) {}

  async toggleLike(postId: string, userId: string): Promise<AppResponse> {
    try {
      // 1. Check if the user already liked this post
      const existingLike = await this.likeModel.findOne({
        where: { 
          PostsID: postId, // Note: Your like.model.ts spells it 'PostsID' 
          UserID: userId 
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
      const newLikePayload = {
        ID: randomUUID(), // Generate a UUID since your model doesn't have a @Default decorator
        PostsID: postId,
        UserID: userId,
        // We leave out the date fields to let MS SQL Server handle them automatically!
      };

      const newLike = await this.likeModel.create(newLikePayload as any);

      return createResponse(HttpStatus.CREATED, 'Post liked successfully', newLike);

    } catch (error: any) {
      this.logger.error(`[LikeSQLDAO] toggleLike Error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      return { 
        ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to toggle like"), 
        description: error.message 
      };
    }
  }
}
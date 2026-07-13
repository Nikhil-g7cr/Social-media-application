import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import AppLogger from 'src/core/logger/app-logger';
import { AppResponse, createResponse } from 'src/shared/appresponse.shared';
import { Likes, Posts, Users } from '../models';
import { LikeAbstractSQLDAO } from '../abstract/like.abstract.mssql';
import { MsSqlConstants } from '../connection/constant.mssql';
import { LikeMessage, LikesColumns } from 'src/core/enums/like.enum';
import { UserColumns } from 'src/core/enums/user.enum';

@Injectable()
export class LikeSQLDAO implements LikeAbstractSQLDAO {
  constructor(
    @Inject(MsSqlConstants.LIKE) private readonly likeModel: typeof Likes,
    private readonly logger: AppLogger,
  ) {}

  async getUserLikes(userId: string): Promise<AppResponse> {
    try {
      const likes = await this.likeModel.findAll({
        where: { UserID: userId },
        include: [
          {
            model: Posts,
            as: 'Post',
            include: [
              {
                model: Users,
                as: 'User',
                attributes: [UserColumns.ID, UserColumns.FullName, UserColumns.UserName, UserColumns.ProfilePictureUrl],
              }
            ]
          },
        ],
        order: [[LikesColumns.CreatedAt, 'DESC']],
      });
      return createResponse(HttpStatus.OK, LikeMessage.S1, likes);
    } catch (error: any) {
      this.logger.error(`[LikeSQLDAO] getUserLikes Error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      return {
        ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, LikeMessage.E1),
        description: error.message,
      };
    }
  }

  async toggleLike(postId: string, userId: string): Promise<AppResponse> {
    try {
      // 1. Check if the user already liked this post
      const existingLike = await this.likeModel.findOne({
        where: {
          PostID: postId, 
          UserID: userId,
        },
      });

      // 2. If it exists, the user is trying to UNLIKE the post
      if (existingLike) {
        await this.likeModel.destroy({
          where: { ID: existingLike.ID },
        });

        return createResponse(HttpStatus.OK, LikeMessage.S2, null);
      }

      // 3. If it doesn't exist, the user is trying to LIKE the post
      const newLikePayload = {
        ID: randomUUID(),
        PostID: postId,
        UserID: userId,
      };

      const newLike = await this.likeModel.create(newLikePayload as any);
      return createResponse(
        HttpStatus.CREATED,
        LikeMessage.S1,
        newLike,
      );
    } catch (error: any) {
      this.logger.error(`[LikeSQLDAO] toggleLike Error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);

      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          LikeMessage.E3,
        ),
        description:
          error?.original?.message || error?.message || 'Unknown Error',
      };
    }
  }
}

import { Injectable } from '@nestjs/common';
import { AppResponse } from 'src/shared/appresponse.shared';
import { LikeAbstractSQLDAO } from 'src/databse/mssql/abstract/like.abstract.mssql';
import { PostAbstractSQLDao } from 'src/databse/mssql/abstract/posts.abstract.mssql';
import { NotificationService } from '../notification/notification.service';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class LikeService {
  constructor(
    private readonly likeDao: LikeAbstractSQLDAO,
    private readonly postDao: PostAbstractSQLDao,
    private readonly notificationService: NotificationService,
  ) {}

  async toggleLike(postId: string, userId: string): Promise<AppResponse> {
    const res = await this.likeDao.toggleLike(postId, userId);
    
    // If it was a LIKE (not UNLIKE)
    if (res.code === HttpStatus.CREATED) {
      // Find the post owner
      const postRes = await this.postDao.getPostById(postId);
      if (postRes.code === HttpStatus.OK && postRes.data) {
        const postOwnerId = postRes.data.UserID;
        if (postOwnerId && postOwnerId !== userId) {
          await this.notificationService.createNotification({
            userId: postOwnerId,
            actorUserId: userId,
            type: 'LIKE',
            postId: postId
          });
        }
      }
    }
    return res;
  }
}
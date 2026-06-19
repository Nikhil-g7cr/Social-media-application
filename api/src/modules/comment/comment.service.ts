import { Injectable, HttpStatus } from '@nestjs/common';
import { AppResponse } from 'src/shared/appresponse.shared';
import { CommentSQLDAO } from 'src/databse/mssql/dao/comment.dao'; // Adjust path if needed
import { CommentAbstractSvc } from './comment.abstract';
import { CommentsAbstractSQLDAO } from 'src/databse/mssql/abstract/comment.abstract.mssql';
import { PostAbstractSQLDao } from 'src/databse/mssql/abstract/posts.abstract.mssql';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CommentService implements CommentAbstractSvc{
  constructor(
    private readonly commentDao: CommentsAbstractSQLDAO,
    private readonly postDao: PostAbstractSQLDao,
    private readonly notificationService: NotificationService,
  ) {}

  async createComment(postId: string, userId: string, commentText: string): Promise<AppResponse> {
    const commentRes = await this.commentDao.createComment(postId, userId, commentText);

    if (commentRes.code === HttpStatus.CREATED) {
        const postRes = await this.postDao.getPostById(postId);
        if (postRes.code === HttpStatus.OK && postRes.data) {
            const postAuthorId = postRes.data.UserID;
            if (postAuthorId !== userId) {
                await this.notificationService.createNotification({
                    userId: postAuthorId,
                    actorUserId: userId,
                    type: 'COMMENT',
                    postId: postId,
                });
            }
        }
    }

    return commentRes;
  }

  async getCommentsByPostId(postId: string): Promise<AppResponse> {
    return await this.commentDao.getCommentsByPostId(postId);
  }
}
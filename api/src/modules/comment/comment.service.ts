import { Injectable, HttpStatus } from '@nestjs/common';
import { AppResponse } from 'src/shared/appresponse.shared';
import { CommentSQLDAO } from 'src/databse/mssql/dao/comment.dao'; // Adjust path if needed
import { CommentAbstractSvc } from './comment.abstract';
import { CommentsAbstractSQLDAO } from 'src/databse/mssql/abstract/comment.abstract.mssql';
import { PostAbstractSQLDao } from 'src/databse/mssql/abstract/posts.abstract.mssql';
import { ServiceBusService } from '../azure/service-bus.service';

@Injectable()
export class CommentService implements CommentAbstractSvc{
  constructor(
    private readonly commentDao: CommentsAbstractSQLDAO,
    private readonly postDao: PostAbstractSQLDao,
    private readonly serviceBus: ServiceBusService,
  ) {}

  async getUserComments(userId: string): Promise<AppResponse> {
    return await this.commentDao.getUserComments(userId);
  }

  async deleteComment(commentId: string, userId: string): Promise<AppResponse> {
    return await this.commentDao.deleteComment(commentId, userId);
  }

  async createComment(postId: string, userId: string, commentText: string): Promise<AppResponse> {
    const commentRes = await this.commentDao.createComment(postId, userId, commentText);

    if (commentRes.code === HttpStatus.CREATED) {
        const postRes = await this.postDao.getPostById(postId);
        if (postRes.code === HttpStatus.OK && postRes.data) {
            const postAuthorId = postRes.data.UserID;
            if (postAuthorId !== userId) {
                await this.serviceBus.publishEvent('ContentEvents', 'comment.added', {
                    userId: postAuthorId,
                    actorUserId: userId,
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
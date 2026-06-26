import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import AppLogger from 'src/core/logger/app-logger';
import { AppResponse, createResponse } from 'src/shared/appresponse.shared';
import { messageFactory, messages } from 'src/shared/message.shared';
import { Comments, Users, Posts } from '../models';
import { MsSqlConstants } from '../connection/constant.mssql';
import { CommentsAbstractSQLDAO } from '../abstract/comment.abstract.mssql';

@Injectable()
export class CommentSQLDAO implements CommentsAbstractSQLDAO {
  constructor(
    @Inject(MsSqlConstants.COMMENT)
    private readonly commentModel: typeof Comments,
    private readonly logger: AppLogger,
  ) {}

  async getUserComments(userId: string): Promise<AppResponse> {
    try {
      const comments = await this.commentModel.findAll({
        where: { UserID: userId },
        include: [
          {
            model: Posts,
            as: 'Post',
            include: [
              {
                model: Users,
                as: 'User',
                attributes: ['ID', 'FullName', 'UserName', 'ProfilePictureUrl'],
              },
            ],
          },
        ],
        order: [['CreatedAt', 'DESC']],
      });

      return createResponse(
        HttpStatus.OK,
        'User comments retrieved successfully',
        comments,
      );
    } catch (error: any) {
      this.logger.error(
        `[CommentSQLDAO] getUserComments Error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to retrieve user comments',
        ),
        description: error.message,
      };
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<AppResponse> {
    try {
      const comment = await this.commentModel.findOne({
        where: { ID: commentId, UserID: userId },
      });

      if (!comment) {
        return createResponse(
          HttpStatus.NOT_FOUND,
          'Comment not found or unauthorized',
          null,
        );
      }

      await this.commentModel.destroy({ where: { ID: commentId } });
      return createResponse(
        HttpStatus.OK,
        'Comment deleted successfully',
        null,
      );
    } catch (error: any) {
      this.logger.error(
        `[CommentSQLDAO] deleteComment Error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to delete comment',
        ),
        description: error.message,
      };
    }
  }

  async createComment(
    postId: string,
    userId: string,
    commentText: string,
  ): Promise<AppResponse> {
    try {
      const payload = {
        ID: randomUUID(),
        PostID: postId,
        UserID: userId,
        ParentCommentID: null,
        Content: commentText,
      };

      const newComment = await this.commentModel.create(payload as any);
      return createResponse(
        HttpStatus.CREATED,
        'Comment added successfully',
        newComment,
      );
    } catch (error: any) {
      this.logger.error(
        `[CommentSQLDAO] createComment Error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to add comment',
        ),
        description: error.message,
      };
    }
  }

  async getCommentsByPostId(postId: string): Promise<AppResponse> {
    try {
      const comments = await this.commentModel.findAll({
        where: { PostID: postId },
        include: [
          {
            model: Users,
            as: 'User',
            attributes: ['ID', 'FullName', 'UserName', 'ProfilePictureURL'],
          },
        ],
        order: [['CreatedAt', 'DESC']],
      });

      return createResponse(
        HttpStatus.OK,
        'Comments retrieved successfully',
        comments,
      );
    } catch (error: any) {
      this.logger.error(
        `[CommentSQLDAO] getCommentsByPostId Error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to retrieve comments',
        ),
        description: error.message,
      };
    }
  }
}

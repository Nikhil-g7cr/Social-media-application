import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import AppLogger from 'src/core/logger/app-logger';
import { AppResponse, createResponse } from 'src/shared/appresponse.shared';
import { messageFactory, messages } from 'src/shared/message.shared';
import { Comments, Users, Posts, UserColumns } from '../models';
import { MsSqlConstants } from '../connection/constant.mssql';
import { CommentsAbstractSQLDAO } from '../abstract/comment.abstract.mssql';
import { CommentMessage } from 'src/core/enums/comment.enum';

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
                attributes: [UserColumns.ID, UserColumns.FullName, UserColumns.UserName, UserColumns.ProfilePictureUrl],
              },
            ],
          },
        ],
        order: [['CreatedAt', 'DESC']],
      });

      return createResponse(
        HttpStatus.OK,
        CommentMessage.S4,
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
          CommentMessage.E5,
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
          CommentMessage.E1,
          null,
        );
      }

      await this.commentModel.destroy({ where: { ID: commentId } });
      return createResponse(
        HttpStatus.OK,
        CommentMessage.S3,
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
          CommentMessage.E4,
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
        CommentMessage.S1,
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
          CommentMessage.E6,
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
            attributes: [UserColumns.ID, UserColumns.FullName, UserColumns.UserName, UserColumns.ProfilePictureUrl],
          },
        ],
        order: [['CreatedAt', 'DESC']],
      });

      return createResponse(
        HttpStatus.OK,
        CommentMessage.S4,
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
          CommentMessage.E5,
        ),
        description: error.message,
      };
    }
  }
}

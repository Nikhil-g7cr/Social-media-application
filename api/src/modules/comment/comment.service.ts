import { Injectable } from '@nestjs/common';
import { AppResponse } from 'src/shared/appresponse.shared';
import { CommentSQLDAO } from 'src/databse/mssql/dao/comment.dao'; // Adjust path if needed
import { CommentAbstractSvc } from './comment.abstract';

@Injectable()
export class CommentService implements CommentAbstractSvc{
  constructor(private readonly commentDao: CommentSQLDAO) {}

  async createComment(postId: string, userId: string, commentText: string): Promise<AppResponse> {
    return await this.commentDao.createComment(postId, userId, commentText);
  }
}
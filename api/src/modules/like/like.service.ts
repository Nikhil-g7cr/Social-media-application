import { Injectable } from '@nestjs/common';
import { AppResponse } from 'src/shared/appresponse.shared';
// import { LikeSQLDAO } from 'src/databse/mssql/dao/like.dao'; // Adjust path if needed
import { LikeAbstractSQLDAO } from 'src/databse/mssql/abstract/like.abstract.mssql';

@Injectable()
export class LikeService {
  constructor(private readonly likeDao: LikeAbstractSQLDAO) {}

  async toggleLike(postId: string, userId: string): Promise<AppResponse> {
    return await this.likeDao.toggleLike(postId, userId);
  }
}
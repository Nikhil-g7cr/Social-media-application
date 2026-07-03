import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { LikeSQLDAO } from '../../databse/mssql/dao/like.dao';
import { DatabaseModule } from '../../databse/database.module';
import { LikeAbstractSvc } from './like.abstract';
import { LikeAbstractSQLDAO } from '../../databse/mssql/abstract/like.abstract.mssql';
import { PostModule } from '../post/post.module';

@Module({
  imports: [DatabaseModule, PostModule],
  controllers: [LikeController],
  providers: [
    { provide: LikeAbstractSvc, useClass: LikeService },
    { provide: LikeAbstractSQLDAO, useClass: LikeSQLDAO },
  ],
})
export class LikeModule {}


import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { LikeSQLDAO } from 'src/databse/mssql/dao/like.dao';
import { DatabaseModule } from 'src/databse/database.module';
import { LikeAbstractSvc } from './like.abstract';
import { LikeAbstractSQLDAO } from 'src/databse/mssql/abstract/like.abstract.mssql';
import { PostModule } from '../post/post.module';
import { FileModule } from '../azure/azure.module';

@Module({
  imports: [DatabaseModule, PostModule, FileModule],
  controllers: [LikeController],
  providers: [
    { provide: LikeAbstractSvc, useClass: LikeService },
    { provide: LikeAbstractSQLDAO, useClass: LikeSQLDAO },
  ],
})
export class LikeModule {}

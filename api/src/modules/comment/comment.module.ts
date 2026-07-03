import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentsAbstractSQLDAO } from '../../databse/mssql/abstract/comment.abstract.mssql';
import { CommentSQLDAO } from '../../databse/mssql/dao/comment.dao';
import { CommentAbstractSvc } from './comment.abstract';
import { DatabaseModule } from '../../databse/database.module';
import { PostModule } from '../post/post.module';

@Module({
  imports: [DatabaseModule, PostModule],
  controllers: [CommentController],
  providers: [
    {
      provide: CommentAbstractSvc,
      useClass: CommentService,
    },
    {
      provide: CommentsAbstractSQLDAO,
      useClass: CommentSQLDAO,
    }
    ,
  ],
})
export class CommentModule {}


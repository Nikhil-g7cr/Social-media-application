import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentsAbstractSQLDAO } from 'src/databse/mssql/abstract/comment.abstract.mssql';
import { CommentSQLDAO } from 'src/databse/mssql/dao/comment.dao';
import { CommentAbstractSvc } from './comment.abstract';
import { DatabaseModule } from 'src/databse/database.module';

@Module({
  imports: [DatabaseModule],
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

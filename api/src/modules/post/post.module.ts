import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostAbstractSvc } from './post.abstract';
import { PostAbstractSQLDao } from 'src/databse/mssql/abstract/posts.abstract.mssql';
import { PostSQLDAO } from 'src/databse/mssql/dao/post.dao';
import { DatabaseModule } from 'src/databse/database.module';

@Module({
  imports:[DatabaseModule],
  controllers: [PostController],
  providers: [{
      provide: PostAbstractSvc,
      useClass: PostService,
    },
    {
      provide: PostAbstractSQLDao,
      useClass: PostSQLDAO,
    },],
})
export class PostModule {}

import { Module } from '@nestjs/common';
import { sequelizeProvider } from './mssql/connection/connection.mssql';
import { msSqlDBModelsProvider } from './mssql/connection/models.connection.mssql';
import { DatabaseService } from './database.service';
import { UserAbsSQLDAO } from './mssql/abstract/user.abstract.mssql';
import { UserSQLDao } from './mssql/dao/user.dao';
import { AuthSQLDao } from './mssql/dao/auth.dao';
import { AuthAbstractSQLDao } from './mssql/abstract/auth.abstract.mssql';
import { PostAbstractSQLDao } from './mssql/abstract/posts.abstract.mssql';
import { PostSQLDAO } from './mssql/dao/post.dao';
import { LikeAbstractSQLDAO } from './mssql/abstract/like.abstract.mssql';
import { LikeSQLDAO } from './mssql/dao/like.dao';
import { CommentsAbstractSQLDAO } from './mssql/abstract/comment.abstract.mssql';
import { CommentSQLDAO } from './mssql/dao/comment.dao';
import { FollowAbstractSQLDao } from './mssql/abstract/follow.abstract.mssql';
import { FollowSQLDao } from './mssql/dao/follow.dao';
import { ConversationAbstractSQLDAO } from './mssql/abstract/conversation.abstract.mssql';
import { ConversationSQLDAO } from './mssql/dao/conversation.dao';
import { AdminAnalyticsAbsSQLDAO } from './mssql/abstract/admin-analytics.abstract.mssql';
import { AdminAnalyticsSQLDAO } from './mssql/dao/admin-analytics.dao';

@Module({
  providers: [
    ...sequelizeProvider,
    ...msSqlDBModelsProvider,
    DatabaseService,
    {
      provide: UserAbsSQLDAO,
      useClass: UserSQLDao,
    },
    {
      provide: AuthAbstractSQLDao,
      useClass: AuthSQLDao,
    },
    {
      provide: PostAbstractSQLDao,
      useClass: PostSQLDAO,
    },
    {
      provide: LikeAbstractSQLDAO,
      useClass: LikeSQLDAO,
    },
    {
      provide: CommentsAbstractSQLDAO,
      useClass: CommentSQLDAO,
    },
    {
      provide: FollowAbstractSQLDao,
      useClass: FollowSQLDao,
    },
    {
      provide: ConversationAbstractSQLDAO,
      useClass: ConversationSQLDAO,
    },
    {
      provide: AdminAnalyticsAbsSQLDAO,
      useClass: AdminAnalyticsSQLDAO,
    },
  ],
  exports: [
    ...sequelizeProvider,
    DatabaseService,
    ...msSqlDBModelsProvider,
    {
      provide: UserAbsSQLDAO,
      useClass: UserSQLDao,
    },
    {
      provide: AuthAbstractSQLDao,
      useClass: AuthSQLDao,
    },
    {
      provide: PostAbstractSQLDao,
      useClass: PostSQLDAO,
    },
    {
      provide: LikeAbstractSQLDAO,
      useClass: LikeSQLDAO,
    },
    {
      provide: CommentsAbstractSQLDAO,
      useClass: CommentSQLDAO,
    },
    {
      provide: FollowAbstractSQLDao,
      useClass: FollowSQLDao,
    },
    {
      provide: ConversationAbstractSQLDAO,
      useClass: ConversationSQLDAO,
    },
    {
      provide: AdminAnalyticsAbsSQLDAO,
      useClass: AdminAnalyticsSQLDAO,
    },
  ],
})
export class DatabaseModule {}

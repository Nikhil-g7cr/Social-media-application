import { Module } from "@nestjs/common";
import { sequelizeProvider } from "./mssql/connection/connection.mssql";
import { msSqlDBModelsProvider } from "./mssql/connection/models.connection.mssql";
import { DatabaseService } from "./database.service";
import { UserAbsSQLDAO } from "./mssql/abstract/user.abstract.mssql";
import { UserSQLDao } from "./mssql/dao/user.dao";
import { AbstractAuthSvc } from "src/modules/auth/auth.abstract";
import { AuthSQLDao } from "./mssql/dao/auth.dao";
import { AuthAbstractSQLDao } from "./mssql/abstract/auth.abstract.mssql";
import { PostAbstractSQLDao } from "./mssql/abstract/posts.abstract.mssql";
import { PostSQLDAO } from "./mssql/dao/post.dao";
import { LikeAbstractSQLDAO } from "./mssql/abstract/like.abstract.mssql";
import { LikeSQLDAO } from "./mssql/dao/like.dao";
import { CommentsAbstractSQLDAO } from "./mssql/abstract/comment.abstract.mssql";
import { CommentSQLDAO } from "./mssql/dao/comment.dao";

@Module({
    providers:[
        ...sequelizeProvider,
        ...msSqlDBModelsProvider,
        DatabaseService,
        {
            provide:UserAbsSQLDAO,
            useClass:UserSQLDao
        },
        {
            provide:AuthAbstractSQLDao,
            useClass:AuthSQLDao
        },
        {
            provide:PostAbstractSQLDao,
            useClass:PostSQLDAO
        },
        {
            provide:LikeAbstractSQLDAO,
            useClass:LikeSQLDAO
        },
        {
            provide: CommentsAbstractSQLDAO,
            useClass:CommentSQLDAO
        }
    ],
    exports:[
        ...sequelizeProvider,
        DatabaseService,
        ...msSqlDBModelsProvider,
        {
            provide:UserAbsSQLDAO,
            useClass:UserSQLDao
        },
        {
            provide:AuthAbstractSQLDao,
            useClass:AuthSQLDao
        },
        {
            provide:PostAbstractSQLDao,
            useClass:PostSQLDAO
        },
        {
            provide:LikeAbstractSQLDAO,
            useClass:LikeSQLDAO
        },
         {
            provide: CommentsAbstractSQLDAO,
            useClass:CommentSQLDAO
        }
    ]
})

export class DatabaseModule {}
import { Module } from "@nestjs/common";
import { sequelizeProvider } from "./mssql/connection/connection.mssql";
import { msSqlDBModelsProvider } from "./mssql/connection/models.connection.mssql";
import { DatabaseService } from "./database.service";
import { UserAbsSQLDAO } from "./mssql/abstract/user.abstract.mssql";
import { UserSQLDao } from "./mssql/dao/user.dao";
import { AbstractAuthSvc } from "src/modules/auth/auth.abstract";
import { AuthSQLDao } from "./mssql/dao/auth.dao";
import { AuthAbstractSQLDao } from "./mssql/abstract/auth.abstract.mssql";

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
        }
    ],
    exports:[
        DatabaseService,
        ...msSqlDBModelsProvider,
        {
            provide:UserAbsSQLDAO,
            useClass:UserSQLDao
        },
        {
            provide:AuthAbstractSQLDao,
            useClass:AuthSQLDao
        }
    ]
})

export class DatabaseModule {}
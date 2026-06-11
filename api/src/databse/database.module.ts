import { Module } from "@nestjs/common";
import { sequelizeProvider } from "./mssql/connection/connection.mssql";
import { msSqlDBModelsProvider } from "./mssql/connection/models.connection.mssql";
import { DatabaseService } from "./database.service";
import { UserAbsSQLDAO } from "./mssql/abstract/user.abstract.mssql";
import { UserSQLDao } from "./mssql/dao/user.dao";

@Module({
    providers:[
        ...sequelizeProvider,
        ...msSqlDBModelsProvider,
        DatabaseService,
        {
            provide:UserAbsSQLDAO,
            useValue:UserSQLDao
        }
    ],
    exports:[
        DatabaseService,
        ...msSqlDBModelsProvider,
        {
            provide:UserAbsSQLDAO,
            useValue:UserSQLDao
        }
    ]
})

export class DatabaseModule {}
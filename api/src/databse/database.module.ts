import { Module } from "@nestjs/common";
import { sequelizeProvider } from "./mssql/connection/connection.mssql";
import { msSqlDBModelsProvider } from "./mssql/connection/models.connection.mssql";
import { DatabaseService } from "./database.service";
import { UserAbsSQLDAO } from "./mssql/abstract/user.abstract.mssql";
import { UserSQLDao } from "./mssql/dao/user.dao";
import { CoreModule } from "src/core/core.module";

@Module({
    providers:[
        ...sequelizeProvider,
        ...msSqlDBModelsProvider,
        DatabaseService,
        {
            provide:UserAbsSQLDAO,
            useClass:UserSQLDao
        }
    ],
    exports:[
        DatabaseService,
        ...msSqlDBModelsProvider,
        {
            provide:UserAbsSQLDAO,
            useClass:UserSQLDao
        }
    ]
})

export class DatabaseModule {}
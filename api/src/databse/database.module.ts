import { Module } from "@nestjs/common";
import { sequelizeProvider } from "./mssql/connection/connection.mssql";
import { msSqlDBModelsProvider } from "./mssql/connection/models.connection.mssql";
import { DatabaseService } from "./database.service";

@Module({
    providers:[
        ...sequelizeProvider,
        ...msSqlDBModelsProvider,
        DatabaseService,
        
    ],
    exports:[
        DatabaseService,
        ...msSqlDBModelsProvider
    ]
})

export class DatabaseModule {}
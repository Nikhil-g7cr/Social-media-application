import { Module } from "@nestjs/common";
import { FollowController } from "./follow.controller";
import { FollowService } from "./follow.service";
import { FollowSQLDao } from "src/databse/mssql/dao/follow.dao";
import { DatabaseModule } from "src/databse/database.module";
import { UserModule } from "../user/user.module";
import { FileModule } from "../azure/azure.module";

@Module({
  imports:[DatabaseModule, FileModule],
    controllers: [
        FollowController,
    ],
    providers: [
        FollowSQLDao,
        FollowService
    ],
    exports: [
        FollowService,
        FollowSQLDao,
    ],
})
export class FollowModule {}
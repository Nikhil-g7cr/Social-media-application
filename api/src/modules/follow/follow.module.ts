import { Module } from "@nestjs/common";
import { FollowController } from "./follow.controller";
import { FollowService } from "./follow.service";
import { FollowSQLDao } from "../../databse/mssql/dao/follow.dao";
import { DatabaseModule } from "../../databse/database.module";
import { UserModule } from "../user/user.module";

@Module({
  imports:[DatabaseModule],
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
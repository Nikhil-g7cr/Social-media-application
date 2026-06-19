import { Module } from "@nestjs/common";
import { FollowController } from "./follow.controller";
import { FollowService } from "./follow.service";
import { FollowSQLDao } from "src/databse/mssql/dao/follow.dao";
import { DatabaseModule } from "src/databse/database.module";
import { UserModule } from "../user/user.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports:[DatabaseModule, NotificationModule],
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
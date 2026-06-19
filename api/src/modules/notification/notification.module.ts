import { Module, forwardRef } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { DatabaseModule } from 'src/databse/database.module';
import { NotificationAbsSQLDAO } from 'src/databse/mssql/abstract/notification.abstract.mssql';
import { NotificationSQLDao } from 'src/databse/mssql/dao/notification.dao';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => ChatModule)],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: NotificationAbsSQLDAO,
      useClass: NotificationSQLDao,
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}

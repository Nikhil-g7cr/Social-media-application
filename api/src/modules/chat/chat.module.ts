import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { DatabaseModule } from 'src/databse/database.module';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from 'src/config/AppConfig';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [DatabaseModule, JwtModule.register({}), forwardRef(() => NotificationModule)],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, AppConfig],
  exports: [ChatGateway],
})
export class ChatModule {}
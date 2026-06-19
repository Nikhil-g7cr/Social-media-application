import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { DatabaseModule } from 'src/databse/database.module';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from 'src/config/AppConfig';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, AppConfig],
})
export class ChatModule {}
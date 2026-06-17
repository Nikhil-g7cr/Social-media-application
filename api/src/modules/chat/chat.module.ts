import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { DatabaseModule } from 'src/databse/database.module';

@Module({
  // Import the Sequelize models here
  imports: [DatabaseModule], 
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
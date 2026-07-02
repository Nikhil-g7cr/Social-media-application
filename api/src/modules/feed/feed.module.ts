import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { DatabaseModule } from '../../databse/database.module';
import { FileModule } from '../azure/azure.module';
import { CoreModule } from '../../core/core.module';
import { FollowModule } from '../follow/follow.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [DatabaseModule, FileModule, CoreModule, FollowModule, ChatModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule { }

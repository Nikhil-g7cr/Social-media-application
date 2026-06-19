import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { DatabaseModule } from 'src/databse/database.module';
import { FileModule } from '../azure/azure.module';
import { CoreModule } from 'src/core/core.module';
import { FollowModule } from '../follow/follow.module';

@Module({
  imports: [DatabaseModule, FileModule, CoreModule, FollowModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule { }

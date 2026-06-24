import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../user/user.module';
import { CoreModule } from 'src/core/core.module';
import { AuthModule } from '../auth/auth.module';
import { PostModule } from '../post/post.module';
import { LikeModule } from '../like/like.module';
import { CommentModule } from '../comment/comment.module';
import { ChatModule } from '../chat/chat.module';
import { FollowModule } from '../follow/follow.module';
import { FileModule } from '../azure/azure.module';
import { ConversationModule } from '../conversation/conversation.module';
import { MessageModule } from '../message/message.module';
import { FeedModule } from '../feed/feed.module';
import { NotificationModule } from '../notification/notification.module';
import { ReportModule } from '../report/report.module';
import { AdminAnalyticsModule } from '../admin-analytics/admin-analytics.module';
import { GalleryModule } from '../gallery/gallery.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    UserModule,
    CoreModule,
    AuthModule,
    PostModule,
    LikeModule,
    CommentModule,
    ChatModule,
    FollowModule,
    FileModule,
    ConversationModule,
    MessageModule,
    FeedModule,
    NotificationModule,
    ReportModule,
    AdminAnalyticsModule,
    GalleryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

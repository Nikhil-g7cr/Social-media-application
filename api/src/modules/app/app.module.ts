import { Module } from '@nestjs/common';
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

@Module({
  imports: [UserModule,CoreModule,AuthModule,PostModule, LikeModule, CommentModule,ChatModule,FollowModule, FileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

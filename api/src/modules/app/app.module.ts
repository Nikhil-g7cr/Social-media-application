import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../user/user.module';
import { CoreModule } from 'src/core/core.module';

@Module({
  imports: [UserModule,CoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

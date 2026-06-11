import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfig } from 'src/config/AppConfig';
import AppLogger from 'src/core/logger/app-logger';
import {ConfigModule} from "@nestjs/config"

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // since your .env is outside the api folder
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppConfig,AppLogger],
})
export class AppModule {}

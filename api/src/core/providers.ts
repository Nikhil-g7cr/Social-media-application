import { AppConfig } from '../config/AppConfig';
import AppLogger from './logger/app-logger';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../databse/database.module';
import { AbstractAuthSvc } from '../modules/auth/auth.abstract';
import { AuthService } from '../modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

const getProviders = (): any[] => {
    return [
      AppConfig,
      AppLogger,
      { provide: AbstractAuthSvc, useClass: AuthService },
      JwtService,
	   {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    ];
  },
  importProviders = (): any[] => {
    return [
      ConfigModule.forRoot({ envFilePath: '.env' }),
      DatabaseModule,
      ThrottlerModule.forRoot([
        {
          ttl: 60000,
          limit: 100,
        },
      ]),
    ];
  },
  exportProviders = (): any[] => {
    return [AppConfig, AppLogger, DatabaseModule];
  };

export { exportProviders, getProviders, importProviders };

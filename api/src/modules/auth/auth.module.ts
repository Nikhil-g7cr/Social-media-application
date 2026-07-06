import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthController, TestErrorsController } from './auth.controller';
import { AuthService } from './auth.service';
import { AbstractAuthSvc } from './auth.abstract';
import { SessionCleanupService } from './session-cleanup.service';

import { AuthAbstractSQLDao } from '../../databse/mssql/abstract/auth.abstract.mssql';
import { AuthSQLDao } from '../../databse/mssql/dao/auth.dao';

import { DatabaseModule } from '../../databse/database.module';

import AppLogger from '../../core/logger/app-logger';
import { AppConfig } from '../../config/AppConfig';

import { JwtStrategy } from './models/jwt.strategy';

@Module({
  imports: [
    DatabaseModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.register({}),

    // Required for @Cron decorators inside SessionCleanupService
    ScheduleModule.forRoot(),
  ],

  controllers: [AuthController, TestErrorsController],

  providers: [
    AppConfig,
    AppLogger,

    // JWT
    JwtStrategy,

    // Service
    {
      provide: AbstractAuthSvc,
      useClass: AuthService,
    },

    // DAO
    {
      provide: AuthAbstractSQLDao,
      useClass: AuthSQLDao,
    },

    // Cron — hourly expired session cleanup
    SessionCleanupService,
  ],

  exports: [AbstractAuthSvc, PassportModule, JwtModule],
})
export class AuthModule {}

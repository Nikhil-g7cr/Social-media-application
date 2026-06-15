import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { AuthController, TestErrorsController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AbstractAuthSvc } from "./auth.abstract";

import { AuthAbstractSQLDao } from "src/databse/mssql/abstract/auth.abstract.mssql";
import { AuthSQLDao } from "src/databse/mssql/dao/auth.dao";

import { DatabaseModule } from "src/databse/database.module";

import AppLogger from "src/core/logger/app-logger";
import { AppConfig } from "src/config/AppConfig";

import { JwtStrategy } from "./models/jwt.strategy";

@Module({
  imports: [
    DatabaseModule,

    PassportModule.register({
      defaultStrategy: "jwt",
    }),

    JwtModule.register({}),
  ],

  controllers: [AuthController,TestErrorsController],

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
  ],

  exports: [
    AbstractAuthSvc,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
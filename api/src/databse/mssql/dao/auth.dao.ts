import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import AppLogger from 'src/core/logger/app-logger';
import { AppConfig } from 'src/config/AppConfig';
import { AuthAbstractSQLDao } from '../abstract/auth.abstract.mssql';
import { MsSqlConstants } from '../connection/constant.mssql';
import { Users, UserColumns } from '../models';
import { UsersDTO } from 'src/modules/user/dto/users.dto';
import { AppResponse, createResponse } from 'src/shared/appresponse.shared';
import { messageFactory, messages } from 'src/shared/message.shared';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthSQLDao implements AuthAbstractSQLDao {
  constructor(
    @Inject(MsSqlConstants.USER)
    private readonly userModel: typeof Users,
    readonly logger: AppLogger,
    private readonly appConfig: AppConfig,
  ) {}

  async fetchUserById(userID: string): Promise<AppResponse> {
    try {
      const user = await this.userModel.findOne({
        where: {
          [UserColumns.ID]: userID,
        },
      });

      if (!user) {
        return createResponse(
          HttpStatus.NOT_FOUND,
          messageFactory(messages.W12, ['User']),
        );
      }

      return createResponse(
        HttpStatus.OK,
        'User fetched successfully',
        user,
      );
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }

  async fetchUserByEmail(email: string): Promise<AppResponse> {
    try {
      const user = await this.userModel.findOne({
        where: {
          [UserColumns.EmailAddress]: email,
        },
      });

      if (!user) {
        return createResponse(
          HttpStatus.NOT_FOUND,
          messageFactory(messages.W12, ['User']),
        );
      }

      return createResponse(
        HttpStatus.OK,
        'User fetched successfully',
        user,
      );
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }

  async createUser(userData: UsersDTO): Promise<AppResponse> {
    try {
      const user = await this.userModel.create({
        ID: randomUUID(),
        UserName: userData.UserName,
        FullName: userData.FullName,
        EmailAddress: userData.EmailAddress,
        PasswordHash: userData.Password, // Service will send hashed password
        ProfilePictureUrl: userData.ProfilePictureUrl,
        Bio: userData.Bio,
        Gender: userData.Gender,
      } as any);

      return createResponse(
        HttpStatus.CREATED,
        'User created successfully',
        user,
      );
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }
}
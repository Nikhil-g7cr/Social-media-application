import { HttpStatus, Injectable } from '@nestjs/common';
import { UsersAbstractSvc } from './user.abstract';
import { AppResponse, createResponse } from '../../shared/appresponse.shared';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { UsersDTO } from './dto/users.dto';
import { AtPayload } from './interface/users.interface';

import { AppConfig } from '../../config/AppConfig';
import AppLogger from '../../core/logger/app-logger';
import { messageFactory, messages } from '../../shared/message.shared';
import { UserRoles } from '../../core/enums/user.enum';
import { DatabaseService } from '../../databse/database.service';
import { UserAbsSQLDAO } from '../../databse/mssql/abstract/user.abstract.mssql';
import { AuthMessage } from 'src/core/enums/auth.enum';

@Injectable()
export class UserService implements UsersAbstractSvc {
  constructor(
    readonly dbService: DatabaseService,
    private readonly userSQLAbsDAO: UserAbsSQLDAO,
    readonly logger: AppLogger,
    private readonly appConfig: AppConfig,
  ) {}

  async getAllUser(showDeleted = false): Promise<AppResponse> {
    try {
      const users = await this.userSQLAbsDAO.getUsers(
        {} as UsersDTO,
        showDeleted,
      );
      return users;
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }

  async searchUsers(query: string): Promise<AppResponse> {
    try {
      if (!query) {
        return createResponse(HttpStatus.OK, 'Empty query', []);
      }
      return await this.userSQLAbsDAO.searchUsers(query);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }

  async getUserByID(userID: string): Promise<AppResponse> {
    try {
      return await this.userSQLAbsDAO.getUserByID(userID);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }

  async addUser(userInfo: UsersDTO, payload?: AtPayload): Promise<AppResponse> {
    try {
      if (payload && !payload.roles.includes(UserRoles.ADMIN)) {
        return createResponse(
          HttpStatus.FORBIDDEN,
          AuthMessage.E9,
        );
      }
      return await this.userSQLAbsDAO.addUser(userInfo);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }

  async updateUser(
    userInfo: UpdateUserDto,
    targetUserID: string,
  ): Promise<AppResponse> {
    try {
      return await this.userSQLAbsDAO.updateUser(userInfo, targetUserID);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }

  async softDeleteUser(
    userID: string,
    payload: AtPayload,
  ): Promise<AppResponse> {
    try {
      if (!payload.roles.includes(UserRoles.ADMIN)) {
        return createResponse(
          HttpStatus.FORBIDDEN,
          AuthMessage.E10,
        );
      }
      if (payload.sub === userID) {
        return createResponse(
          HttpStatus.FORBIDDEN,
          AuthMessage.E12,
        );
      }
      return await this.userSQLAbsDAO.softDeleteUser(userID);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }

  async restoreUser(userID: string, payload: AtPayload): Promise<AppResponse> {
    try {
      if (!payload.roles.includes(UserRoles.ADMIN)) {
        return createResponse(
          HttpStatus.FORBIDDEN,
          AuthMessage.E11,
        );
      }
      return await this.userSQLAbsDAO.restoreUser(userID);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }

  async hardDeleteUser(
    userID: string,
    payload: AtPayload,
  ): Promise<AppResponse> {
    try {
      if (!payload.roles.includes(UserRoles.ADMIN)) {
        return createResponse(
          HttpStatus.FORBIDDEN,
          AuthMessage.E14,
        );
      }
      if (payload.sub === userID) {
        return createResponse(
          HttpStatus.FORBIDDEN,
          AuthMessage.E15,
        );
      }
      return await this.userSQLAbsDAO.hardDeleteUser(userID);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }

  /** @deprecated Use hardDeleteUser. Kept for backward compatibility. */
  async deleteUser(userID: string, payload: AtPayload): Promise<AppResponse> {
    return this.hardDeleteUser(userID, payload);
  }

  async findByUsername(userName: string): Promise<AppResponse> {
    try {
      return await this.userSQLAbsDAO.findByUsername(userName);
    } catch (error: any) {
      this.logger.error(error.stack || error.message);
      throw error;
    }
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { MsSqlConstants } from '../connection/constant.mssql';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Users } from '../models';
import AppLogger from 'src/core/logger/app-logger';
import { UsersDTO } from 'src/modules/user/dto/users.dto';
import { AppResponse, createResponse } from 'src/shared/appresponse.shared';
import { UserAbsSQLDAO } from '../abstract/user.abstract.mssql';
import { messageFactory, messages } from 'src/shared/message.shared';
import { randomUUID } from 'crypto';
import { UpdateUserDto } from 'src/modules/user/dto/UpdateUser.dto';

@Injectable()
export class UserSQLDao implements UserAbsSQLDAO {
  constructor(
    @Inject(MsSqlConstants.SEQUELIZE_PROVIDER) private sequelize: Sequelize,
    @Inject(MsSqlConstants.USER) private _user: typeof Users,
    readonly logger: AppLogger,
  ) {}

  // ==========================================
  // READ OPERATIONS (No Transactions Needed)
  // ==========================================

  async getUsers(): Promise<AppResponse> {
    try {
      const users = await this._user.findAll();
      return createResponse(200, 'Users retrieved successfully', users);
    } catch (error: any) {
      this.logger.error(error.stack, 500);
      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  async searchUsers(query: string): Promise<AppResponse> {
    try {
      const users = await this._user.findAll({
        where: {
          [Op.or]: [
            { UserName: { [Op.like]: `%${query}%` } },
            { FullName: { [Op.like]: `%${query}%` } }
          ]
        },
        attributes: ['ID', 'UserName', 'FullName', 'ProfilePictureUrl', 'Bio'], // Don't return password hashes!
        limit: 20
      });
      return createResponse(200, 'Users found', users);
    } catch (error: any) {
      this.logger.error(error.stack, 500);
      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  async getUserByID(UserId: string): Promise<AppResponse> {
    try {
      const user = await this._user.findOne({ where: { ID: UserId } });
      if (!user) {
        return createResponse(
          404,
          messageFactory(messages.W12, ['User']),
          null,
        );
      }
      return createResponse(200, 'User found', user);
    } catch (error: any) {
      this.logger.error(error.stack, 500);
      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  async getUserRoleByID(UserID: string): Promise<AppResponse> {
    try {
      const user = await this._user.findOne({
        attributes: ['Role'],
        where: { ID: UserID },
      });

      if (!user) {
        return createResponse(
          404,
          messageFactory(messages.W12, ['User']),
          null,
        );
      }
      return createResponse(200, 'Role retrieved successfully', {
        Role: user.Role,
      });
    } catch (error: any) {
      this.logger.error(error.stack, 500);
      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  // ==========================================
  // WRITE OPERATIONS (Transactions Applied)
  // ==========================================

  async addUser(UserInfo: UsersDTO): Promise<AppResponse> {
    const transaction = await this.sequelize.transaction();
    try {
      const newUser = await this._user.create(
        {
          ID: randomUUID(),
          UserName: UserInfo.UserName,
          FullName: UserInfo.FullName,
          EmailAddress: UserInfo.EmailAddress,
          PasswordHash: UserInfo.Password, // <-- Mapped Password to PasswordHash
          ProfilePictureUrl: UserInfo.ProfilePictureUrl,
          Bio: UserInfo.Bio,
          Gender: UserInfo.Gender,
        //   CreatedAt: new Date(),
        } as any,
        { transaction },
      ); // <-- Added "as any" to bypass generic type errors

      await transaction.commit();
      const successMsg = messageFactory(messages.S6);
      return createResponse(201, successMsg, newUser);
    } catch (error: any) {
      console.log('========== ORIGINAL ERROR ==========');
      console.log(error);
      console.log('====================================');

      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.log('Rollback failed:', rollbackError);
      }

      console.error(
        '🔥 DATABASE ERROR:',
        error.original?.message || error.message,
      );

      this.logger.error(error.stack, 500);

      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.original?.message || error.message,
      };
    }
    // } catch (error: any) {
    //     await transaction.rollback();
    //     console.error("🔥 DATABASE ERROR:", error.original ? error.original.message : error.message);
    //     this.logger.error(error.stack, 500);
    //     const errorMsg = messageFactory(messages.E2);
    //     return { ...createResponse(500, errorMsg), description: error.message };
    // }
  }

  async updateUser(
    UserInfo: UpdateUserDto,
    UserId: string,
  ): Promise<AppResponse> {
    const transaction = await this.sequelize.transaction();
    try {
      const [updatedRowsCount] = await this._user.update(
        {
          ...UserInfo,
        },
        {
          where: { ID: UserId },
          transaction, // <-- Attach transaction here
        },
      );

      // If no rows were updated, it means the user ID doesn't exist
      if (updatedRowsCount === 0) {
        await transaction.rollback(); // Rollback since nothing was updated
        return createResponse(
          404,
          messageFactory(messages.W12, ['User']),
          null,
        );
      }

      await transaction.commit();
      return createResponse(200, messageFactory(messages.S5), {
        updatedRowsCount,
      });
    } catch (error: any) {
      await transaction.rollback();
      this.logger.error(error.stack, 500);
      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  async deleteUser(UserId: string): Promise<AppResponse> {
    const transaction = await this.sequelize.transaction();
    try {
      const deletedRowsCount = await this._user.destroy({
        where: { ID: UserId },
        transaction, // <-- Attach transaction here
      });

      if (deletedRowsCount === 0) {
        await transaction.rollback();
        return createResponse(
          404,
          messageFactory(messages.W12, ['User']),
          null,
        );
      }

      await transaction.commit();
      return createResponse(200, 'User deleted successfully', null);
    } catch (error: any) {
      await transaction.rollback();
      this.logger.error(error.stack, 500);
      return {
        ...createResponse(500, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }
}

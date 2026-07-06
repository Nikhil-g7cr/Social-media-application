import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Op } from 'sequelize';

import AppLogger from 'src/core/logger/app-logger';
import { AppConfig } from 'src/config/AppConfig';
import { AuthAbstractSQLDao } from '../abstract/auth.abstract.mssql';
import { MsSqlConstants } from '../connection/constant.mssql';
import { Users, UserColumns, Session } from '../models';
import { SessionColumns } from 'src/core/enums/session.enum';
import { UsersDTO } from 'src/modules/user/dto/users.dto';
import { AppResponse, createResponse } from 'src/shared/appresponse.shared';
import { messageFactory, messages } from 'src/shared/message.shared';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthSQLDao implements AuthAbstractSQLDao {
  constructor(
    @Inject(MsSqlConstants.USER)
    private readonly userModel: typeof Users,
    @Inject(MsSqlConstants.SESSION)
    private readonly sessionModel: typeof Session,
    readonly logger: AppLogger,
    private readonly appConfig: AppConfig,
  ) {}

  // ============================================================
  // USER QUERIES — reused as-is from original implementation
  // ============================================================

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

      // Block soft-deleted users from logging in
      if ((user as any).IsDeleted) {
        return createResponse(
          HttpStatus.UNAUTHORIZED,
          'This account has been deactivated. Please contact an administrator.',
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
        PasswordHash: userData.Password, // Service sends hashed password
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

  // ============================================================
  // SESSION — CREATE / UPDATE
  // ============================================================

  /**
   * Create a new active session row.
   * sessionData must conform to the new Session schema.
   * Never pass raw tokens — always pass the bcrypt hash.
   */
  async createSession(sessionData: {
    ID: string;
    UserID: string;
    RefreshTokenHash: string;
    DeviceInfo?: string;
    UserAgent?: string;
    IpAddress?: string;
    CreatedAt?: Date;
    LastSeenAt?: Date;
    ExpiresAt: Date;
  }): Promise<void> {
    try {
      await this.sessionModel.create(sessionData as any);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update specific fields of an existing session.
   * Used by login (device re-use) and refresh token rotation.
   */
  async updateSession(
    sessionId: string,
    updates: Partial<{
      RefreshTokenHash: string;
      LastSeenAt: Date;
      ExpiresAt: Date;
      IpAddress: string;
      UserAgent: string;
      DeviceInfo: string;
    }>,
  ): Promise<void> {
    try {
      await this.sessionModel.update(updates as any, {
        where: { [SessionColumns.ID]: sessionId },
      });
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ============================================================
  // SESSION — LOOKUP
  // ============================================================

  /**
   * Find a single active session by its primary key.
   * Returns HTTP 404 if not found — used by the refresh flow
   * to ensure the session still exists before rotating the token.
   */
  async findSessionById(sessionId: string): Promise<AppResponse> {
    try {
      const session = await this.sessionModel.findOne({
        where: { [SessionColumns.ID]: sessionId },
      });

      if (!session) {
        return createResponse(
          HttpStatus.NOT_FOUND,
          'Session not found or already expired.',
        );
      }

      return createResponse(HttpStatus.OK, 'Session found.', session);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }

  /**
   * Find an active session for the given user that was created
   * from the same device fingerprint (DeviceInfo string).
   * Used during login to decide whether to upsert or create a new session.
   */
  async findSessionByUserAndDevice(
    userId: string,
    deviceInfo: string,
  ): Promise<AppResponse> {
    try {
      const session = await this.sessionModel.findOne({
        where: {
          [SessionColumns.UserID]: userId,
          [SessionColumns.DeviceInfo]: deviceInfo,
        },
      });

      if (!session) {
        return createResponse(HttpStatus.NOT_FOUND, 'No session for this device.');
      }

      return createResponse(HttpStatus.OK, 'Session found.', session);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }

  /**
   * Count active (non-expired) sessions for a user.
   * Used to enforce the 5-session limit during login.
   */
  async getSessionCount(userId: string): Promise<number> {
    try {
      return await this.sessionModel.count({
        where: {
          [SessionColumns.UserID]: userId,
          [SessionColumns.ExpiresAt]: { [Op.gt]: new Date() },
        },
      });
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return 0;
    }
  }

  /**
   * Return all active (non-expired) sessions for a user.
   * Exposes device info, IP, and timestamps — never the token hash.
   */
  async getAllSessions(userId: string): Promise<AppResponse> {
    try {
      const sessions = await this.sessionModel.findAll({
        where: {
          [SessionColumns.UserID]: userId,
          [SessionColumns.ExpiresAt]: { [Op.gt]: new Date() },
        },
        attributes: [
          SessionColumns.ID,
          SessionColumns.DeviceInfo,
          SessionColumns.IpAddress,
          SessionColumns.CreatedAt,
          SessionColumns.LastSeenAt,
          SessionColumns.ExpiresAt,
        ],
        order: [[SessionColumns.LastSeenAt, 'DESC']],
      });

      return createResponse(HttpStatus.OK, 'Sessions fetched successfully.', sessions);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }

  // ============================================================
  // SESSION — DELETE
  // ============================================================

  /**
   * Delete a single session by primary key.
   * Called by logout (current device) and DELETE /sessions/:id.
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.sessionModel.destroy({
        where: { [SessionColumns.ID]: sessionId },
      });
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Delete all sessions belonging to a user.
   * Called by logout-from-all-devices.
   */
  async deleteAllSessions(userId: string): Promise<void> {
    try {
      await this.sessionModel.destroy({
        where: { [SessionColumns.UserID]: userId },
      });
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Delete all sessions whose ExpiresAt is in the past.
   * Called by the hourly cron job.
   * Returns the number of rows deleted.
   */
  async deleteExpiredSessions(): Promise<number> {
    try {
      const deleted = await this.sessionModel.destroy({
        where: {
          [SessionColumns.ExpiresAt]: { [Op.lt]: new Date() },
        },
      });
      return deleted;
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return 0;
    }
  }
}
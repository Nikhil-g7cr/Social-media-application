import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import AppLogger from '../../core/logger/app-logger';
import { AuthAbstractSQLDao } from '../../databse/mssql/abstract/auth.abstract.mssql';

/**
 * SessionCleanupService
 *
 * Runs a background cron job every hour to purge expired sessions from the
 * tbl_Session table.  Because the session table only ever holds ACTIVE sessions,
 * a row is considered garbage once its ExpiresAt timestamp is in the past.
 *
 * This covers edge cases where a user's refresh token expires without an
 * explicit logout (e.g. the user just closes the browser and never logs out).
 *
 * SQL equivalent:
 *   DELETE FROM tbl_Session WHERE ExpiresAt < GETDATE();
 */
@Injectable()
export class SessionCleanupService {
  constructor(
    private readonly authDao: AuthAbstractSQLDao,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Fires every hour on the hour.
   * Uses the DAO's deleteExpiredSessions() which issues:
   *   DELETE FROM tbl_Session WHERE ExpiresAt < NOW()
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const deleted = await this.authDao.deleteExpiredSessions();

      if (deleted > 0) {
        this.logger.log(
          `[SessionCleanup] Purged ${deleted} expired session(s).`,
          200,
        );
      }
    } catch (error: any) {
      this.logger.error(
        `[SessionCleanup] Failed to purge expired sessions: ${error.message}`,
        500,
      );
    }
  }
}

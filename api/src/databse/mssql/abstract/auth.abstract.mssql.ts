import { UsersDTO } from 'src/modules/user/dto/users.dto';
import { AppResponse } from 'src/shared/appresponse.shared';

export abstract class AuthAbstractSQLDao {
  // ── User queries ─────────────────────────────────────────────────────────
  abstract fetchUserById(userID: string): Promise<AppResponse>;
  abstract fetchUserByEmail(email: string): Promise<AppResponse>;
  abstract createUser(userData: UsersDTO): Promise<AppResponse>;

  // ── Session — create / update ─────────────────────────────────────────────
  abstract createSession(sessionData: any): Promise<void>;
  abstract updateSession(sessionId: string, updates: Partial<{
    RefreshTokenHash: string;
    LastSeenAt: Date;
    ExpiresAt: Date;
    IpAddress: string;
    UserAgent: string;
    DeviceInfo: string;
  }>): Promise<void>;

  // ── Session — lookup ──────────────────────────────────────────────────────
  /**
   * Find an active session by its ID.
   */
  abstract findSessionById(sessionId: string): Promise<AppResponse>;

  /**
   * Find an active session that matches the given user and device fingerprint.
   * Used by login to detect whether the same device is re-logging in.
   */
  abstract findSessionByUserAndDevice(userId: string, deviceInfo: string): Promise<AppResponse>;

  /**
   * Count the number of active sessions for a user.
   */
  abstract getSessionCount(userId: string): Promise<number>;

  /**
   * Return all active sessions for a user (for the "active devices" list).
   */
  abstract getAllSessions(userId: string): Promise<AppResponse>;

  // ── Session — delete ──────────────────────────────────────────────────────
  /**
   * Delete a single session by its primary key.
   */
  abstract deleteSession(sessionId: string): Promise<void>;

  /**
   * Delete ALL sessions belonging to a user (logout from all devices).
   */
  abstract deleteAllSessions(userId: string): Promise<void>;

  /**
   * Delete all sessions where ExpiresAt < NOW().
   * Called by the hourly cron cleanup job.
   */
  abstract deleteExpiredSessions(): Promise<number>;
}
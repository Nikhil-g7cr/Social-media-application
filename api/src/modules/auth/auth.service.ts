import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

import AppLogger from '../../core/logger/app-logger';
import { AppConfig } from '../../config/AppConfig';

import { AbstractAuthSvc } from './auth.abstract';
import { AuthAbstractSQLDao } from '../../databse/mssql/abstract/auth.abstract.mssql';

import { AppResponse, createResponse } from '../../shared/appresponse.shared';
import { messageFactory, messages } from '../../shared/message.shared';

import { UsersDTO } from '../user/dto/users.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './models/jwt-payload.model';
import { AuthMessage, TokenMessage } from 'src/core/enums/Auth.message.enum';

/** Maximum number of concurrent active sessions per user. */
const MAX_SESSIONS = 1;

/** Refresh token TTL in days (must match JWT_WEB_RFT_EXPIRES_IN=7d). */
const REFRESH_TOKEN_TTL_DAYS = 7;

@Injectable()
export class AuthService implements AbstractAuthSvc {
  constructor(
    private readonly authDao: AuthAbstractSQLDao,
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfig,
    private readonly logger: AppLogger,
  ) { }

  // =====================================================
  // PRIVATE HELPERS
  // =====================================================

  /**
   * Build a human-readable device string from a raw User-Agent header.
   *
   * We avoid pulling in a heavy UA parser library and instead do a
   * lightweight string detection that covers the overwhelming majority
   * of real-world clients.  The result looks like:
   *   "Windows 11 • Chrome • Desktop"
   *   "iOS • Safari • Mobile"
   *   "Android • Chrome • Mobile"
   *
   * If ua-parser-js is added to the project in the future, this helper
   * is the only place that needs to change.
   */
  private parseDeviceInfo(userAgent?: string, clientBrowser?: string): string {
    if (!userAgent) return 'Unknown Device';
    const ua = userAgent;

    // OS detection (unchanged)
    let os = 'Unknown OS';
    if (/Windows NT 10\.0/i.test(ua)) os = 'Windows 10/11';
    else if (/Windows NT 6\.1/i.test(ua)) os = 'Windows 7';
    else if (/Windows/i.test(ua)) os = 'Windows';
    else if (/iPhone|iPad/i.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Macintosh/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';

    // Browser detection — client hint overrides UA sniffing
    let browser: string;
    if (clientBrowser) {
      // Trust the client-provided value (Brave, etc.)
      browser = clientBrowser;
    } else {
      browser = 'Unknown Browser';
      if (/Edg\//i.test(ua)) browser = 'Edge';
      else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = 'Opera';
      else if (/Firefox\//i.test(ua)) browser = 'Firefox';
      else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Browser';
      else if (/Chrome\//i.test(ua)) browser = 'Chrome';
      else if (/Safari\//i.test(ua)) browser = 'Safari';
    }

    // Device type (unchanged)
    let type = 'Desktop';
    if (/Mobile/i.test(ua)) type = 'Mobile';
    else if (/Tablet|iPad/i.test(ua)) type = 'Tablet';

    return `${os} • ${browser} • ${type}`;
  }

  /**
   * Calculate the session ExpiresAt date based on the configured TTL.
   */
  private buildExpiresAt(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);
    return expiresAt;
  }

  /**
   * Build the JWT payload from user data.
   * sessionId is embedded so that logout and refresh can target
   * the exact session row without an extra lookup.
   */
  private buildJwtPayload(user: any, sessionId: string): JwtPayload {
    return {
      sub: user.ID,
      email: user.EmailAddress,
      roles: [user.Role || 'USER'],
      name: user.FullName,
      sessionId,
    };
  }

  /**
   * Sign and return both access and refresh tokens.
   */
  private async generateTokenPair(
    payload: JwtPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.appConfig.get('jwt').appAXTSecret,
        expiresIn: this.appConfig.get('jwt').web.axt.expiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.appConfig.get('jwt').appRFTSecret,
        expiresIn: this.appConfig.get('jwt').web.rft.expiresIn,
      }),
    ]);
    return { accessToken, refreshToken };
  }

  // =====================================================
  // SIGNUP
  // =====================================================

  async signup(
    userData: UsersDTO,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AppResponse> {
    try {
      // Reuse existing DAO: check for duplicate email
      const existingUser = await this.authDao.fetchUserByEmail(userData.EmailAddress);
      if (existingUser.code === HttpStatus.OK) {
        return createResponse(HttpStatus.CONFLICT, AuthMessage.E3);
      }

      // Reuse existing DAO: create user (service sends the hashed password)
      const hashedPassword = await bcrypt.hash(userData.Password, 10);
      const response = await this.authDao.createUser({
        ...userData,
        Password: hashedPassword,
      });

      if (response.code !== HttpStatus.CREATED || !response.data) {
        return response;
      }

      const user: any = response.data;
      const sessionId = randomUUID();

      // Build JWT payload — sessionId embedded from the start
      const payload = this.buildJwtPayload(user, sessionId);
      const { accessToken, refreshToken } = await this.generateTokenPair(payload);

      // Hash refresh token — never store the raw value
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
      const deviceInfo = this.parseDeviceInfo(userAgent);

      // Reuse existing DAO createSession (now with correct schema)
      await this.authDao.createSession({
        ID: sessionId,
        UserID: user.ID,
        RefreshTokenHash: refreshTokenHash,
        DeviceInfo: deviceInfo,
        UserAgent: userAgent,
        IpAddress: ipAddress,
        CreatedAt: new Date(),
        LastSeenAt: new Date(),
        ExpiresAt: this.buildExpiresAt(),
      });

      return createResponse(HttpStatus.CREATED, AuthMessage.S2, {
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return {
        ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  // =====================================================
  // LOGIN
  // =====================================================

  async login(
    loginData: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AppResponse> {
    try {
      // Reuse existing DAO: look up user by email
      const userRes = await this.authDao.fetchUserByEmail(loginData.EmailAddress);
      if (userRes.code !== HttpStatus.OK) {
        return createResponse(HttpStatus.UNAUTHORIZED, AuthMessage.E2);
      }

      const user: any = userRes.data;

      // Compare password hash
      const isPasswordValid = await bcrypt.compare(loginData.Password, user.PasswordHash);
      if (!isPasswordValid) {
        return createResponse(HttpStatus.UNAUTHORIZED, AuthMessage.E2);
      }

      // Parse device info from user-agent
      const deviceInfo = this.parseDeviceInfo(userAgent);

      // Generate tokens first so we can hash the refresh token
      // (sessionId will be determined below — either existing or new UUID)
      const existingSessionRes = await this.authDao.findSessionByUserAndDevice(
        user.ID,
        deviceInfo,
      );

      let sessionId: string;

      if (existingSessionRes.code === HttpStatus.OK) {
        // ── Same device is re-logging in — UPSERT the existing session ──
        const existingSession: any = existingSessionRes.data;
        sessionId = existingSession.ID;

        const payload = this.buildJwtPayload(user, sessionId);
        const { accessToken, refreshToken } = await this.generateTokenPair(payload);
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        await this.authDao.updateSession(sessionId, {
          RefreshTokenHash: refreshTokenHash,
          LastSeenAt: new Date(),
          ExpiresAt: this.buildExpiresAt(),
          IpAddress: ipAddress,
          UserAgent: userAgent,
        });

        delete user.PasswordHash;
        return createResponse(HttpStatus.OK, AuthMessage.S3, { accessToken, refreshToken });
      }

      // ── New device — enforce session limit ───────────────────────────────
      const sessionCount = await this.authDao.getSessionCount(user.ID);
      if (sessionCount >= MAX_SESSIONS) {
        return createResponse(HttpStatus.CONFLICT, AuthMessage.E6);
      }

      // Create a fresh session
      sessionId = randomUUID();
      const payload = this.buildJwtPayload(user, sessionId);
      const { accessToken, refreshToken } = await this.generateTokenPair(payload);
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

      await this.authDao.createSession({
        ID: sessionId,
        UserID: user.ID,
        RefreshTokenHash: refreshTokenHash,
        DeviceInfo: deviceInfo,
        UserAgent: userAgent,
        IpAddress: ipAddress,
        CreatedAt: new Date(),
        LastSeenAt: new Date(),
        ExpiresAt: this.buildExpiresAt(),
      });

      delete user.PasswordHash;
      return createResponse(HttpStatus.OK, AuthMessage.S3, { accessToken, refreshToken });
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return {
        ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  // =====================================================
  // VALIDATE TOKEN (reused as-is)
  // =====================================================

  async validateToken(token: string): Promise<AppResponse> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.appConfig.get('jwt').appAXTSecret,
      });

      return createResponse(HttpStatus.OK, TokenMessage.VALID, payload);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.UNAUTHORIZED);
      return createResponse(HttpStatus.UNAUTHORIZED, TokenMessage.INVALID);
    }
  }

  // =====================================================
  // PARSE TOKEN (reused as-is)
  // =====================================================

  async parseToken(token: string): Promise<AppResponse> {
    try {
      const payload = this.jwtService.decode(token);

      if (!payload) {
        return createResponse(HttpStatus.BAD_REQUEST, TokenMessage.INVALID);
      }

      return createResponse(HttpStatus.OK, TokenMessage.TP, payload);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2));
    }
  }

  // =====================================================
  // REFRESH ACCESS TOKEN
  // =====================================================

  async refreshToken(refreshToken: string): Promise<AppResponse> {
    try {
      // Step 1: Verify JWT signature and expiry
      let verify: any;
      try {
        verify = await this.jwtService.verifyAsync(refreshToken, {
          secret: this.appConfig.get('jwt').appRFTSecret,
        });
      } catch {
        return createResponse(HttpStatus.UNAUTHORIZED, TokenMessage.IRT);
      }

      // Step 2: Find the session this token belongs to
      const sessionId: string = verify.sessionId;
      if (!sessionId) {
        return createResponse(HttpStatus.UNAUTHORIZED, TokenMessage.IRS);
      }

      const sessionRes = await this.authDao.findSessionById(sessionId);
      if (sessionRes.code !== HttpStatus.OK) {
        return createResponse(HttpStatus.UNAUTHORIZED, TokenMessage.IRS);
      }

      const session: any = sessionRes.data;

      // Step 3: Compare the presented refresh token against the stored hash
      const isHashValid = await bcrypt.compare(refreshToken, session.RefreshTokenHash);
      if (!isHashValid) {
        // Possible token reuse attack — delete the session immediately
        await this.authDao.deleteSession(sessionId);
        return createResponse(HttpStatus.UNAUTHORIZED, TokenMessage.IRS);
      }

      // Step 4: Rotate — generate a fresh token pair (same sessionId)
      const payload: JwtPayload = {
        sub: verify.sub,
        email: verify.email,
        roles: verify.roles,
        name: verify.name,
        sessionId,
      };

      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokenPair(payload);

      // Step 5: Hash the new refresh token and update the session
      const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
      await this.authDao.updateSession(sessionId, {
        RefreshTokenHash: newRefreshTokenHash,
        LastSeenAt: new Date(),
        ExpiresAt: this.buildExpiresAt(),
      });

      return createResponse(HttpStatus.OK, TokenMessage.TR, {
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return {
        ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  // =====================================================
  // GET CURRENT USER PROFILE (reused as-is)
  // =====================================================

  async getProfile(payload: JwtPayload): Promise<AppResponse> {
    try {
      return await this.authDao.fetchUserById(payload.sub);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return {
        ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  // =====================================================
  // LOGOUT (current device only)
  // =====================================================

  async logout(sessionId: string): Promise<AppResponse> {
    try {
      if (!sessionId) {
        return createResponse(HttpStatus.BAD_REQUEST, AuthMessage.E7);
      }

      await this.authDao.deleteSession(sessionId);
      return createResponse(HttpStatus.OK, AuthMessage.S4);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return {
        ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  // =====================================================
  // LOGOUT FROM ALL DEVICES
  // =====================================================

  async logoutAll(userId: string): Promise<AppResponse> {
    try {
      await this.authDao.deleteAllSessions(userId);
      return createResponse(HttpStatus.OK, AuthMessage.S7);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return {
        ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  // =====================================================
  // REMOVE ONE SPECIFIC SESSION (ownership-checked)
  // =====================================================

  async removeSession(userId: string, sessionId: string): Promise<AppResponse> {
    try {
      // Verify the session belongs to the requesting user
      const sessionRes = await this.authDao.findSessionById(sessionId);
      if (sessionRes.code !== HttpStatus.OK) {
        return createResponse(HttpStatus.NOT_FOUND, AuthMessage.E7);
      }

      const session: any = sessionRes.data;
      if (session.UserID !== userId) {
        return createResponse(HttpStatus.FORBIDDEN, AuthMessage.E8);
      }

      await this.authDao.deleteSession(sessionId);
      return createResponse(HttpStatus.OK, AuthMessage.S8);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return {
        ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  // =====================================================
  // GET ALL ACTIVE SESSIONS
  // =====================================================

  async getSessions(userId: string): Promise<AppResponse> {
    try {
      return await this.authDao.getAllSessions(userId);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return {
        ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }
}

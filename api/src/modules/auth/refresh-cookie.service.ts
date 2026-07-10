import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppConfig } from '../../config/AppConfig';
import { RefreshCookieStrategy } from './models/refresh-cookie-strategy.enum';
import { AppResponse } from '../../shared/appresponse.shared';

const REFRESH_COOKIE_PATH = '/api/auth';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class RefreshCookieService {
  constructor(private readonly appConfig: AppConfig) {}

  /**
   * Determine the active cookie strategy from configuration or environment.
   */
  getStrategy(): RefreshCookieStrategy {
    const configured =
      this.appConfig.get('jwt')?.web?.rft?.strategy ||
      process.env.REFRESH_COOKIE_STRATEGY;

    if (
      configured &&
      String(configured).toLowerCase() === RefreshCookieStrategy.SINGLE
    ) {
      return RefreshCookieStrategy.SINGLE;
    }
    return RefreshCookieStrategy.PER_USER;
  }

  /**
   * Build consistent cookie options across set and clear operations.
   */
  getCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: REFRESH_COOKIE_PATH,
    };
  }

  /**
   * Build the refresh token cookie name based on active strategy.
   * - Strategy 1 (SINGLE): always returns 'refreshToken'
   * - Strategy 2 (PER_USER): returns 'refreshToken_<sanitized_email>'
   */
  getCookieName(email?: string): string {
    const strategy = this.getStrategy();

    if (strategy === RefreshCookieStrategy.SINGLE) {
      return 'refreshToken';
    }

    if (!email) {
      return 'refreshToken';
    }

    // Replace '@' with '_at_' to strictly comply with RFC 6265 cookie naming
    return `refreshToken_${email.replace('@', '_at_')}`;
  }

  /**
   * Set the refresh token cookie using the active strategy.
   */
  setRefreshCookie(res: Response, refreshToken: string, email?: string): void {
    const cookieName = this.getCookieName(email);
    res.cookie(cookieName, refreshToken, {
      ...this.getCookieOptions(),
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });
  }

  /**
   * Helper to set refresh token from AppResponse and remove it from response body
   */
  setRefreshCookieFromResult(
    res: Response,
    result: AppResponse,
    email?: string,
  ): void {
    if (result?.data?.refreshToken) {
      this.setRefreshCookie(res, result.data.refreshToken, email);
      delete result.data.refreshToken; // Never expose refresh token to JavaScript
    }
  }

  /**
   * Clear the refresh token cookie using the active strategy.
   */
  clearRefreshCookie(res: Response, email?: string): void {
    const cookieName = this.getCookieName(email);
    res.clearCookie(cookieName, this.getCookieOptions());
  }

  /**
   * Read the refresh token from request cookies based on active strategy.
   */
  getRefreshToken(req: Request, email?: string): string | undefined {
    const cookieName = this.getCookieName(email);
    return req.cookies?.[cookieName];
  }
}

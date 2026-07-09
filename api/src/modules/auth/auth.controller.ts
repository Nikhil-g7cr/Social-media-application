import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Ip,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { AbstractAuthSvc } from './auth.abstract';
import { LoginDto } from './dto/login.dto';
import { UsersDTO } from '../user/dto/users.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { JwtPayload } from './models/jwt-payload.model';
import { AppResponse } from '../../shared/appresponse.shared';

const REFRESH_COOKIE_PATH = '/api/auth';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Build a per-user cookie name keyed on email so different users in different tabs never overwrite each other.
 * '@' is an RFC 6265 separator and is forbidden in cookie names, so we replace it with '_at_'.
 * e.g.  nikhil@gmail.com  →  refreshToken_nikhil_at_gmail.com
 */
const refreshCookieName = (email: string) =>
  `refreshToken_${email.replace('@', '_at_')}`;

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AbstractAuthSvc) {}

  // ======= cookie helpers =====

  /** The shared cookie options — must be identical for set AND clear to work correctly. */
  private get cookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: REFRESH_COOKIE_PATH,
    };
  }

  private setRefreshCookie(res: Response, result: AppResponse, email: string) {
    if (result?.data?.refreshToken) {
      res.cookie(refreshCookieName(email), result.data.refreshToken, {
        ...this.cookieOptions,
        maxAge: REFRESH_COOKIE_MAX_AGE_MS,
      });
      delete result.data.refreshToken; // never expose to JS
    }
  }

  private clearRefreshCookie(res: Response, email: string) {
    // Must use the same options as setCookie — browsers ignore clears with mismatched attributes
    res.clearCookie(refreshCookieName(email), this.cookieOptions);
  }

  /** One-time migration: remove the old shared 'refreshToken' cookie left over before the user-scoped fix. */
  private clearLegacyCookie(res: Response) {
    res.clearCookie('refreshToken', this.cookieOptions);
  }
  // ======= end of cookie helpers =====

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: UsersDTO })
  async signup(
    @Body() userData: UsersDTO,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(userData, ip, userAgent);
    // Decode the access token to get the email for the scoped cookie name
    const email = result?.data?.accessToken
      ? (JSON.parse(Buffer.from((result.data.accessToken as string).split('.')[1], 'base64url').toString()))?.email
      : undefined;
    // Always clear the old legacy 'refreshToken' cookie (pre-user-scoped-fix cleanup)
    this.clearLegacyCookie(res);
    if (email) this.setRefreshCookie(res, result, email);
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and receive tokens' })
  @ApiBody({ type: LoginDto })
  async login(
    @Body() loginData: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginData, ip, userAgent);
    // Decode the access token to get the email for the scoped cookie name
    const email = result?.data?.accessToken
      ? (JSON.parse(Buffer.from((result.data.accessToken as string).split('.')[1], 'base64url').toString()))?.email
      : undefined;
    // Always clear the old legacy 'refreshToken' cookie (pre-user-scoped-fix cleanup)
    this.clearLegacyCookie(res);
    if (email) this.setRefreshCookie(res, result, email);
    return result;
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Rotate tokens using a valid refresh token',
    description:
      'Reads the httpOnly per-user refresh cookie (`refreshToken_<email>`), verifies it ' +
      'against the stored bcrypt hash, and issues a new access + refresh token pair. ' +
      'The old refresh token is invalidated. The caller must pass `email` in the request body ' +
      'so the server knows which cookie to read (access token may be expired at this point).',
  })
  async refreshToken(
    @Body() body: { email?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email } = body;
    if (!email) {
      return { code: 401, message: 'email is required to identify the refresh token cookie' };
    }
    const refreshToken = req.cookies?.[refreshCookieName(email)];
    if (!refreshToken) {
      return { code: 401, message: 'No refresh token provided' };
    }
    const result = await this.authService.refreshToken(refreshToken);
    this.setRefreshCookie(res, result, email);
    return result;
  }

  @Post('validate-token')
  @ApiOperation({
    summary: 'Verify that an access token is valid and not expired',
  })
  async validateToken(@Headers('authorization') authorization: string) {
    if (!authorization) {
      return { code: 401, message: 'Authorization header missing' };
    }
    const token = authorization.split(' ')[1];
    return await this.authService.validateToken(token);
  }

  @Post('parse-token')
  @ApiOperation({
    summary: 'Decode a token and return its payload (no verification)',
  })
  async parseToken(@Headers('authorization') authorization: string) {
    if (!authorization) {
      return { code: 401, message: 'Authorization header missing' };
    }
    const token = authorization.split(' ')[1];
    return await this.authService.parseToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({
    summary: 'Get the profile of the currently authenticated user',
  })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return await this.authService.getProfile(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('sessions')
  @ApiOperation({ summary: 'List all active sessions for the current user' })
  async getSessions(@CurrentUser() user: JwtPayload) {
    return await this.authService.getSessions(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Log out from the current device' })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Clear the per-user scoped cookie (keyed on email) and any legacy leftover
    this.clearRefreshCookie(res, user.email);
    this.clearLegacyCookie(res);
    console.log("User is loged out")
    return await this.authService.logout(user.sessionId!, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout/all')
  @ApiOperation({ summary: 'Log out from all devices' })
  async logoutAll(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Clear the per-user scoped cookie (keyed on email) and any legacy leftover
    this.clearRefreshCookie(res, user.email);
    this.clearLegacyCookie(res);
    return await this.authService.logoutAll(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Remove a specific session by ID' })
  @ApiParam({
    name: 'sessionId',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  async removeSession(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId') sessionId: string,
  ) {
    return await this.authService.removeSession(user.sub, sessionId);
  }
}

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
import { RefreshCookieService } from './refresh-cookie.service';
import { RefreshCookieStrategy } from './models/refresh-cookie-strategy.enum';
import { Throttle } from '@nestjs/throttler/dist/throttler.decorator';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly authService: AbstractAuthSvc,
    private readonly cookieService: RefreshCookieService,
  ) {}

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
    // Decode access token or use user DTO email for per-user cookie strategy
    const email = result?.data?.accessToken
      ? JSON.parse(
          Buffer.from(
            (result.data.accessToken as string).split('.')[1],
            'base64url',
          ).toString(),
        )?.email
      : userData.EmailAddress;

    this.cookieService.setRefreshCookieFromResult(res, result, email);
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and receive tokens' })
  @ApiBody({ type: LoginDto })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() loginData: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginData, ip, userAgent);
    const email = result?.data?.accessToken
      ? JSON.parse(
          Buffer.from(
            (result.data.accessToken as string).split('.')[1],
            'base64url',
          ).toString(),
        )?.email
      : loginData.EmailAddress;

    this.cookieService.setRefreshCookieFromResult(res, result, email);
    return result;
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Rotate tokens using a valid refresh token',
    description:
      'Reads the httpOnly refresh cookie according to active strategy (`single` or `per_user`), verifies it ' +
      'against stored bcrypt hash, and issues a new access + refresh token pair. ' +
      'In `per_user` mode, caller must pass `email` in request body.',
  })
  async refreshToken(
    @Body() body: { email?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email } = body || {};
    if (
      this.cookieService.getStrategy() === RefreshCookieStrategy.PER_USER &&
      !email
    ) {
      return {
        code: 401,
        message:
          'email is required to identify the refresh token cookie in per_user strategy',
      };
    }

    const refreshToken = this.cookieService.getRefreshToken(req, email);
    if (!refreshToken) {
      return { code: 401, message: 'No refresh token provided' };
    }

    const result = await this.authService.refreshToken(refreshToken);
    this.cookieService.setRefreshCookieFromResult(res, result, email);
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
    @Body() body: { email?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const email = user?.email || body?.email;
    this.cookieService.clearRefreshCookie(res, email);
    console.log('User is loged out');
    return await this.authService.logout(user.sessionId!, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout/all')
  @ApiOperation({ summary: 'Log out from all devices' })
  async logoutAll(
    @CurrentUser() user: JwtPayload,
    @Body() body: { email?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const email = user?.email || body?.email;
    this.cookieService.clearRefreshCookie(res, email);
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

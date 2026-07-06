import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Ip,
  UseGuards,
} from '@nestjs/common';
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

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AbstractAuthSvc) {}

  // =====================================================
  // SIGNUP
  // =====================================================

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: UsersDTO })
  async signup(
    @Body() userData: UsersDTO,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return await this.authService.signup(userData, ip, userAgent);
  }

  // =====================================================
  // LOGIN
  // =====================================================

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and receive tokens' })
  @ApiBody({ type: LoginDto })
  async login(
    @Body() loginData: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return await this.authService.login(loginData, ip, userAgent);
  }

  // =====================================================
  // REFRESH ACCESS TOKEN
  // =====================================================

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Rotate tokens using a valid refresh token',
    description:
      'Verifies the refresh token, compares it against the stored bcrypt hash, ' +
      'and issues a new access + refresh token pair. The old refresh token is invalidated.',
  })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return await this.authService.refreshToken(refreshToken);
  }

  // =====================================================
  // VALIDATE TOKEN
  // =====================================================

  @Post('validate-token')
  @ApiOperation({ summary: 'Verify that an access token is valid and not expired' })
  async validateToken(@Headers('authorization') authorization: string) {
    if (!authorization) {
      return { code: 401, message: 'Authorization header missing' };
    }
    const token = authorization.split(' ')[1];
    return await this.authService.validateToken(token);
  }

  // =====================================================
  // PARSE TOKEN
  // =====================================================

  // REMOVED: @UseGuards(JwtAuthGuard) — parsing works even if token is expired
  @Post('parse-token')
  @ApiOperation({ summary: 'Decode a token and return its payload (no verification)' })
  async parseToken(@Headers('authorization') authorization: string) {
    if (!authorization) {
      return { code: 401, message: 'Authorization header missing' };
    }
    const token = authorization.split(' ')[1];
    return await this.authService.parseToken(token);
  }

  // =====================================================
  // CURRENT USER PROFILE
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get the profile of the currently authenticated user' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return await this.authService.getProfile(user);
  }

  // =====================================================
  // GET ACTIVE SESSIONS
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('sessions')
  @ApiOperation({
    summary: 'List all active sessions for the current user',
    description: 'Returns device info, IP address, and timestamps. Refresh token hashes are never returned.',
  })
  async getSessions(@CurrentUser() user: JwtPayload) {
    return await this.authService.getSessions(user.sub);
  }

  // =====================================================
  // LOGOUT (current device only)
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({
    summary: 'Log out from the current device',
    description: 'Deletes the session associated with the access token used for this request.',
  })
  async logout(@CurrentUser() user: JwtPayload) {
    return await this.authService.logout(user.sessionId!);
  }

  // =====================================================
  // LOGOUT FROM ALL DEVICES
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout/all')
  @ApiOperation({
    summary: 'Log out from all devices',
    description: 'Deletes every active session belonging to the current user.',
  })
  async logoutAll(@CurrentUser() user: JwtPayload) {
    return await this.authService.logoutAll(user.sub);
  }

  // =====================================================
  // REMOVE ONE SPECIFIC SESSION (device management)
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('sessions/:sessionId')
  @ApiOperation({
    summary: 'Remove a specific session by ID',
    description:
      'Allows a user to remotely log out a specific device. ' +
      'The session must belong to the authenticated user.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'UUID of the session to remove',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  async removeSession(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId') sessionId: string,
  ) {
    return await this.authService.removeSession(user.sub, sessionId);
  }
}

// =====================================================
// TEST / DEBUG CONTROLLER (kept from original)
// =====================================================

@Controller('test')
export class TestErrorsController {
  // 1. Test standard NestJS HttpException
  @Get('http-error')
  throwHttpError() {
    throw new BadRequestException('This is a simulated bad request');
  }

  // 2. Test Sequelize Unique Constraint
  @Get('unique-error')
  throwUniqueConstraint() {
    const error = new Error('Validation error');
    error.name = 'SequelizeUniqueConstraintError';
    (error as any).errors = [{ message: 'email must be unique' }];
    throw error;
  }

  // 3. Test JWT Token Error
  @Get('jwt-error')
  throwJwtError() {
    const error = new Error('jwt expired');
    error.name = 'TokenExpiredError';
    throw error;
  }

  // 4. Test Unhandled Generic Error
  @Get('server-error')
  throwServerError() {
    throw new Error('Something completely unexpected broke!');
  }
}
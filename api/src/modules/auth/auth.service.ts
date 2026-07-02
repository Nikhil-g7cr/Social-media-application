import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import AppLogger from '../../core/logger/app-logger';
import { AppConfig } from '../../config/AppConfig';

import { AbstractAuthSvc } from './auth.abstract';
import { AuthAbstractSQLDao } from '../../databse/mssql/abstract/auth.abstract.mssql';

import { AppResponse, createResponse } from '../../shared/appresponse.shared';
import { messageFactory, messages } from '../../shared/message.shared';

import { UsersDTO } from '../user/dto/users.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './models/jwt-payload.model';

@Injectable()
export class AuthService implements AbstractAuthSvc {
  constructor(
    private readonly authDao: AuthAbstractSQLDao,
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfig,
    private readonly logger: AppLogger,
  ) {}

  // =====================================================
  // SIGNUP
  // =====================================================

  async signup(
    userData: UsersDTO,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AppResponse> {
    try {
      // Check if email already exists
      const existingUser = await this.authDao.fetchUserByEmail(
        userData.EmailAddress,
      );

      if (existingUser.code === HttpStatus.OK) {
        return createResponse(
          HttpStatus.CONFLICT,
          'User with this email already exists.',
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.Password, 10);

      // Save user
      const response = await this.authDao.createUser({
        ...userData,
        Password: hashedPassword,
      });

      if (response.code === HttpStatus.CREATED && response.data) {
        const user: any = response.data;
        const payload: JwtPayload = {
          sub: user.ID,
          email: user.EmailAddress,
          roles: [user.Role || 'USER'],
          name: user.FullName,
          // image_url: user.ProfilePictureUrl,
        };

        const accessToken = await this.jwtService.signAsync(payload, {
          secret: this.appConfig.get('jwt').appAXTSecret,
          expiresIn: this.appConfig.get('jwt').web.axt.expiresIn,
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
          secret: this.appConfig.get('jwt').appRFTSecret,
          expiresIn: this.appConfig.get('jwt').web.rft.expiresIn,
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.authDao.createSession({
          ID: require('crypto').randomUUID(),
          UserID: user.ID,
          SessionToken: accessToken,
          RefreshToken: refreshToken,
          IpAddress: ipAddress,
          UserAgent: userAgent,
          ExpiresAt: expiresAt,
          IsRevoked: false,
        });

        return createResponse(
          HttpStatus.CREATED,
          'User created and logged in successfully.',
          {
            accessToken,
            refreshToken,
          },
        );
      }

      return response;
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);

      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          messageFactory(messages.E2),
        ),
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
      // Find user
      const userRes = await this.authDao.fetchUserByEmail(
        loginData.EmailAddress,
      );

      if (userRes.code !== HttpStatus.OK) {
        return createResponse(
          HttpStatus.UNAUTHORIZED,
          'Invalid email or password.',
        );
      }

      const user: any = userRes.data;

      // Compare password
      const isPasswordValid = await bcrypt.compare(
        loginData.Password,
        user.PasswordHash,
      );

      if (!isPasswordValid) {
        return createResponse(
          HttpStatus.UNAUTHORIZED,
          'Invalid email or password.',
        );
      }

      // JWT Payload
      const payload: JwtPayload = {
        sub: user.ID,
        email: user.EmailAddress,
        roles: [user.Role],
        name: user.FullName,
        // image_url: user.ProfilePictureUrl,
      };

      // Generate Tokens
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: this.appConfig.get('jwt').appAXTSecret,
        expiresIn: this.appConfig.get('jwt').web.axt.expiresIn,
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: this.appConfig.get('jwt').appRFTSecret,
        expiresIn: this.appConfig.get('jwt').web.rft.expiresIn,
      });

      // Remove password before returning
      delete user.PasswordHash;

      // Create Session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.authDao.createSession({
        ID: require('crypto').randomUUID(),
        UserID: user.ID,
        SessionToken: accessToken,
        RefreshToken: refreshToken,
        IpAddress: ipAddress,
        UserAgent: userAgent,
        ExpiresAt: expiresAt,
        IsRevoked: false,
      });

      return createResponse(HttpStatus.OK, 'Login successful.', {
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);

      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          messageFactory(messages.E2),
        ),
        description: error.message,
      };
    }
  }

  // =====================================================
  // VALIDATE TOKEN
  // =====================================================

  async validateToken(token: string): Promise<AppResponse> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.appConfig.get('jwt').appAXTSecret,
      });

      return createResponse(HttpStatus.OK, 'Token is valid.', payload);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.UNAUTHORIZED);

      return createResponse(
        HttpStatus.UNAUTHORIZED,
        'Invalid or expired token.',
      );
    }
  }

  // =====================================================
  // PARSE TOKEN
  // =====================================================

  async parseToken(token: string): Promise<AppResponse> {
    try {
      const payload = this.jwtService.decode(token);

      if (!payload) {
        return createResponse(HttpStatus.BAD_REQUEST, 'Invalid token.');
      }

      return createResponse(
        HttpStatus.OK,
        'Token parsed successfully.',
        payload,
      );
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);

      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageFactory(messages.E2),
      );
    }
  }

  // =====================================================
  // REFRESH ACCESS TOKEN
  // =====================================================

  async refreshToken(refreshToken: string): Promise<AppResponse> {
    try {
      const verify = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.appConfig.get('jwt').appRFTSecret,
      });

      const payload: JwtPayload = {
        sub: verify.sub,
        email: verify.email,
        roles: verify.roles,
        name: verify.name,
        // image_url: verify.image_url,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: this.appConfig.get('jwt').appAXTSecret,
        expiresIn: this.appConfig.get('jwt').web.axt.expiresIn,
      });

      return createResponse(
        HttpStatus.OK,
        'Access token refreshed successfully.',
        {
          accessToken,
        },
      );
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.UNAUTHORIZED);

      return createResponse(HttpStatus.UNAUTHORIZED, 'Invalid refresh token.');
    }
  }

  // =====================================================
  // GET CURRENT USER PROFILE
  // =====================================================

  async getProfile(payload: JwtPayload): Promise<AppResponse> {
    try {
      return await this.authDao.fetchUserById(payload.sub);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);

      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          messageFactory(messages.E2),
        ),
        description: error.message,
      };
    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async logout(userId: string): Promise<AppResponse> {
    // Later you can revoke refresh token here.
    return createResponse(HttpStatus.OK, 'User logged out successfully.');
  }
}

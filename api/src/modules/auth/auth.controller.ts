import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";

import { AbstractAuthSvc } from "./auth.abstract";
import { LoginDto } from "./dto/login.dto";
import { UsersDTO } from "../user/dto/users.dto";
import { JwtAuthGuard } from "src/core/guards/jwt-auth.guard";

@Controller("auth")
@ApiTags("Authentication")
export class AuthController {
  constructor(
    private readonly authService: AbstractAuthSvc,
  ) {}

  // =====================================================
  // SIGNUP
  // =====================================================

  @Post("signup")
  @ApiBody({
    type: UsersDTO,
  })
  async signup(
    @Body() userData: UsersDTO,
  ) {
    return await this.authService.signup(userData);
  }

  // =====================================================
  // LOGIN
  // =====================================================

  @Post("login")
  @ApiBody({
    type: LoginDto,
  })
  async login(
    @Body() loginData: LoginDto,
  ) {
    return await this.authService.login(loginData);
  }

  // =====================================================
  // REFRESH ACCESS TOKEN
  // =====================================================

  @Post("refresh-token")
  async refreshToken(
    @Body("refreshToken") refreshToken: string,
  ) {
    return await this.authService.refreshToken(
      refreshToken,
    );
  }

  // =====================================================
  // VALIDATE TOKEN
  // =====================================================

  @Post("validate-token")
  async validateToken(
    @Headers("authorization") authorization: string,
  ) {
    if (!authorization) {
      return { code: 401, message: "Authorization header missing" };
    }
    const token = authorization.split(" ")[1]; // Safely extracts token
    return await this.authService.validateToken(token);
  }

  // =====================================================
  // PARSE TOKEN (Optional)
  // =====================================================

  // REMOVED: @UseGuards(JwtAuthGuard) - Parsing should work even if token is expired!
  @Post("parse-token")
  async parseToken(
    @Headers("authorization") authorization: string,
  ) {
    if (!authorization) {
      return { code: 401, message: "Authorization header missing" };
    }
    const token = authorization.split(" ")[1];
    return await this.authService.parseToken(token);
  }

  // =====================================================
  // CURRENT USER PROFILE
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  // @Authorize()   <-- Enable after JwtAuthGuard is ready
  @Get("profile")
  async getProfile(
    @Req() req: any,
  ) {
    return await this.authService.getProfile(
      req.user,
    );
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  // @Authorize()   <-- Enable after JwtAuthGuard is ready
  @Post("logout")
  async logout(
    @Req() req: any,
  ) {
    return await this.authService.logout(
      req.user?.sub,
    );
  }

  
}

@Controller('test')
export class TestErrorsController {

  // 1. Test standard NestJS HttpException
  @Get('http-error')
  throwHttpError() {
    // Should return 400 Bad Request
    throw new BadRequestException('This is a simulated bad request');
  }

  // 2. Test Sequelize Unique Constraint
  @Get('unique-error')
  throwUniqueConstraint() {
    // Should return 409 Conflict
    const error = new Error('Validation error');
    error.name = 'SequelizeUniqueConstraintError';
    (error as any).errors = [{ message: 'email must be unique' }];
    throw error;
  }

  // 3. Test JWT Token Error
  @Get('jwt-error')
  throwJwtError() {
    // Should return 401 Unauthorized
    const error = new Error('jwt expired');
    error.name = 'TokenExpiredError';
    throw error;
  }

  // 4. Test Unhandled Generic Error
  @Get('server-error')
  throwServerError() {
    // Should return 500 Internal Server Error
    throw new Error('Something completely unexpected broke!');
  }
}
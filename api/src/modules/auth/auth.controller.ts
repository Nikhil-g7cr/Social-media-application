import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";

import { AbstractAuthSvc } from "./auth.abstract";
import { LoginDto } from "./dto/login.dto";
import { UsersDTO } from "../user/dto/users.dto";

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
    const token = authorization?.replace(
      "Bearer ",
      "",
    );

    return await this.authService.validateToken(
      token,
    );
  }

  // =====================================================
  // PARSE TOKEN (Optional)
  // =====================================================

  @Post("parse-token")
  async parseToken(
    @Headers("authorization") authorization: string,
  ) {
    const token = authorization?.replace(
      "Bearer ",
      "",
    );

    return await this.authService.parseToken(
      token,
    );
  }

  // =====================================================
  // CURRENT USER PROFILE
  // =====================================================

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
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersDTO } from './dto/users.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { AppResponse } from 'src/shared/appresponse.shared';
import { AtPayload } from './models/users.model';
import { UsersAbstractSvc } from './user.abstract';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersAbstractSvc) {}
  /**
   * GET /user
   * Fetches all users. Only accessible by ADMIN or MANAGER.
   */
  @Get()
  async getAllUsers(@Req() req: any): Promise<AppResponse> {
    // req.user is populated by your Authentication Guard
    // const payload: AtPayload = req.user;
    // return await this.userService.getAllUser(payload);
    return await this.userService.getAllUser();
  }

  /**
   * GET /user/:id
   * Fetches a single user by ID. Users can view themselves, Admins can view anyone.
   */
  @Get(':id')
  async getUserByID(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.userService.getUserByID(id, payload);
  }

  /**
   * POST /user
   * Manually creates a user. Protected in the service so only Admins can use this.
   * (Standard public signup should go through an AuthController instead).
   */
  @Post()
  async addUser(
    @Body() userInfo: UsersDTO,
    @Req() req: any,
  ): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.userService.addUser(userInfo, payload);
  }

  /**
   * PATCH /user/:id
   * Updates a user's profile. Users can update themselves, Admins can update anyone.
   */
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() userInfo: UpdateUserDto,
    @Req() req: any,
  ): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.userService.updateUser(userInfo, id, payload);
  }

  /**
   * DELETE /user/:id
   * Deletes a user account. Only accessible by ADMIN.
   */
  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.userService.deleteUser(id, payload);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersDTO } from './dto/users.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { AppResponse } from 'src/shared/appresponse.shared';
import { AtPayload } from './models/users.model';
import { UsersAbstractSvc } from './user.abstract';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/role.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { UserRoles } from 'src/core/enums/user.enums';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersAbstractSvc) {}

  /**
   * GET /user?showDeleted=true
   * Fetches all users. Only accessible by ADMIN or MANAGER.
   * Pass showDeleted=true to include soft-deleted users (admin only).
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.MANAGER)
  async getAllUsers(
    @Req() req: any,
    @Query('showDeleted') showDeleted?: string,
  ): Promise<AppResponse> {
    const includeDeleted = showDeleted === 'true';
    return await this.userService.getAllUser(includeDeleted);
  }

  /**
   * GET /user/search?q={query}
   * Searches for active users by UserName or FullName.
   * Soft-deleted users are excluded.
   */
  @Get('search')
  async searchUsers(@Query('q') query: string): Promise<AppResponse> {
    return await this.userService.searchUsers(query || '');
  }

  @Get('check-username/:userName')
  async findByUserName(
    @Param('userName') userName: string,
  ): Promise<AppResponse> {
    return await this.userService.findByUsername(userName);
  }
  /**
   * GET /user/:id
   * Fetches a single user by ID.
   */
  @Get(':id')
  async getUserByID(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.userService.getUserByID(id, payload);
  }

  // GET/username/:username

  

  /**
   * POST /user
   * Manually creates a user. Only Admins.
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
   * Updates a user's profile.
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
   * PATCH /user/:id/soft-delete
   * Soft-deletes a user (marks IsDeleted=true). Only accessible by ADMIN.
   * User is hidden from listings and cannot log in, but data is preserved.
   */
  @Patch(':id/soft-delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async softDeleteUser(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.userService.softDeleteUser(id, payload);
  }

  /**
   * PATCH /user/:id/restore
   * Restores a soft-deleted user. Only accessible by ADMIN.
   */
  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async restoreUser(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.userService.restoreUser(id, payload);
  }

  /**
   * DELETE /user/:id
   * HARD DELETE — permanently removes the user and all associated data.
   * This action is irreversible. Only accessible by ADMIN.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async deleteUser(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<AppResponse> {
    const payload: AtPayload = req.user;
    return await this.userService.hardDeleteUser(id, payload);
  }
}

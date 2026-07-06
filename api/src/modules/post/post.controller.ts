import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AppResponse } from '../../shared/appresponse.shared';
import { PostAbstractSvc } from './post.abstract';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { PaginationDto } from '../../core/dto/pagination.dto';

@Controller('posts')
@ApiBearerAuth()
export class PostController {
  constructor(private readonly postService: PostAbstractSvc) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPost(
    @CurrentUser('sub') userId: string,
    // @Req() req: any,
    @Body() createPostDto: CreatePostDto,
  ): Promise<AppResponse> {
    return await this.postService.createPost(createPostDto, userId);
  }

  @Get()
  async getAllPosts(@Query() pagination: PaginationDto): Promise<AppResponse> {
    return await this.postService.getAllPosts(pagination);
  }



  @Get('user/:userId')
  async getPostsByUserId(
    @Param('userId') userId: string,
    @Query() pagination: PaginationDto,
  ): Promise<AppResponse> {
    return await this.postService.getPostsByUserId(userId, pagination);
  }

  @Get('trending')
  async getTrendingPosts(@Query() pagination: PaginationDto): Promise<AppResponse> {
    return await this.postService.getTrendingPosts(pagination);
  }

  @Get('hashtags/trending')
  async getTrendingHashtags(): Promise<AppResponse> {
    return await this.postService.getTrendingHashtags();
  }

  @Get(':id')
  async getPostById(@Param('id') id: string): Promise<AppResponse> {
    return await this.postService.getPostById(id);
  }

  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<AppResponse> {
    return await this.postService.updatePost(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('roles') roles: string[],
  ): Promise<AppResponse> {
    return await this.postService.deletePost(id, userId, roles);
  }

  @Get('liked/user/:userId')
  async getLikedPosts(
    @Param('userId') userId: string,
    @Query() pagination: PaginationDto,
  ): Promise<AppResponse> {
    return await this.postService.getLikedPostsByUserId(userId, pagination);
  }
}

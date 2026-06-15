import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AppResponse } from 'src/shared/appresponse.shared';
import { PostAbstractSvc } from './post.abstract';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostAbstractSvc,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
    async createPost(
      @Req() req: any,
      @Body() createPostDto: CreatePostDto,
    ): Promise<AppResponse> {
      return await this.postService.createPost(
        createPostDto,
        req.user.sub,
      );
  }

  @Get()
  async getAllPosts(): Promise<AppResponse> {
    return await this.postService.getAllPosts();
  }

  @Get(':id')
  async getPostById(
    @Param('id') id: string,
  ): Promise<AppResponse> {
    return await this.postService.getPostById(id);
  }

  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<AppResponse> {
    return await this.postService.updatePost(
      id,
      updatePostDto
    );
  }

  @Delete(':id')
  async deletePost(
    @Param('id') id: string,
  ): Promise<AppResponse> {
    return await this.postService.deletePost(id);
  }
}
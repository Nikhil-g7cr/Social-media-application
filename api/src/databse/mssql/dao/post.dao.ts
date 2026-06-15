import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpStatus,
  Inject,
} from '@nestjs/common';

import { AppResponse, createResponse } from 'src/shared/appresponse.shared';
import { PostAbstractSQLDao } from '../abstract/posts.abstract.mssql';
import { Posts, PostsColumns } from '../models';
import AppLogger from 'src/core/logger/app-logger';
import { MsSqlConstants } from '../connection/constant.mssql';

import { CreatePostDto } from 'src/modules/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/modules/post/dto/update-post.dto';

@Injectable()
export class PostSQLDAO implements PostAbstractSQLDao {
  constructor(
    @Inject(MsSqlConstants.POST)
    private readonly postModel: typeof Posts,

    private readonly logger: AppLogger,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
  ): Promise<AppResponse> {
    try {
      const newPost = await this.postModel.create(
        createPostDto as any,
      );

      return createResponse(
        HttpStatus.CREATED,
        'Post created successfully',
        newPost,
      );
    } catch (error: any) {
      this.logger.error(
        `[PostSQLDAO] createPost: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      throw new InternalServerErrorException(
        error.message || 'Failed to create post',
      );
    }
  }

  async getAllPosts(): Promise<AppResponse> {
    try {
      const posts = await this.postModel.findAll({
        order: [[PostsColumns.CreatedAt, 'DESC']],
      });

      return createResponse(
        HttpStatus.OK,
        'Posts retrieved successfully',
        posts,
      );
    } catch (error: any) {
      this.logger.error(
        `[PostSQLDAO] getAllPosts: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      throw new InternalServerErrorException(
        error.message || 'Failed to retrieve posts',
      );
    }
  }

  async getPostById(
    postId: string,
  ): Promise<AppResponse> {
    try {
      const post = await this.postModel.findByPk(postId);

      if (!post) {
        throw new NotFoundException(
          `Post with ID ${postId} not found`,
        );
      }

      return createResponse(
        HttpStatus.OK,
        'Post retrieved successfully',
        post,
      );
    } catch (error: any) {
      this.logger.error(
        `[PostSQLDAO] getPostById: ${error.message}`,
        error instanceof NotFoundException
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );

      // Let custom HTTP exceptions bubble up
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error.message || 'Failed to retrieve post',
      );
    }
  }

  async updatePost(
    updatePostDto: UpdatePostDto,
    postId: string,
  ): Promise<AppResponse> {
    try {
      const post = await this.postModel.findByPk(postId);

      if (!post) {
        throw new NotFoundException(
          `Post with ID ${postId} not found`,
        );
      }

      const updatedPost = await post.update(
        updatePostDto as any,
      );

      return createResponse(
        HttpStatus.OK,
        'Post updated successfully',
        updatedPost,
      );
    } catch (error: any) {
      this.logger.error(
        `[PostSQLDAO] updatePost: ${error.message}`,
        error instanceof NotFoundException
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error.message || 'Failed to update post',
      );
    }
  }

  async deletePost(
    postId: string,
  ): Promise<AppResponse> {
    try {
      const post = await this.postModel.findByPk(postId);

      if (!post) {
        throw new NotFoundException(
          `Post with ID ${postId} not found`,
        );
      }

      await post.destroy();

      return createResponse(
        HttpStatus.OK,
        'Post deleted successfully',
        null,
      );
    } catch (error: any) {
      this.logger.error(
        `[PostSQLDAO] deletePost: ${error.message}`,
        error instanceof NotFoundException
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error.message || 'Failed to delete post',
      );
    }
  }
}
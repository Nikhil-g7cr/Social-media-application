import { Injectable } from '@nestjs/common';

import { AppConfig } from 'src/config/AppConfig';
import AppLogger from 'src/core/logger/app-logger';
import { PostAbstractSQLDao } from 'src/databse/mssql/abstract/posts.abstract.mssql';
import { AppResponse } from 'src/shared/appresponse.shared';

import { PostAbstractSvc } from './post.abstract';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService implements PostAbstractSvc {
  constructor(
    private readonly logger: AppLogger,
    private readonly appConfig: AppConfig,
    private readonly postDao: PostAbstractSQLDao,
  ) {}

  

  async createPost(
  createPostDto: CreatePostDto,
  userId: string,
): Promise<AppResponse> {
  this.logger.log(
    '[PostService] Initiating createPost',
    200,
  );

  return await this.postDao.createPost(
    createPostDto,
    userId,
  );
}

  async getAllPosts(): Promise<AppResponse> {
    try {
      this.logger.log(
        '[PostService] Fetching all posts',
        200,
      );

      return await this.postDao.getAllPosts();
    } catch (error: any) {
      this.logger.error(
        `[PostService] Error in getAllPosts: ${error.message}`,
        500,
      );
      throw error;
    }
  }

  async getPostById(
    postId: string,
  ): Promise<AppResponse> {
    try {
      this.logger.log(
        `[PostService] Fetching post with ID: ${postId}`,
        200,
      );

      return await this.postDao.getPostById(
        postId,
      );
    } catch (error: any) {
      this.logger.error(
        `[PostService] Error in getPostById (${postId}): ${error.message}`,
        500,
      );
      throw error;
    }
  }

  async updatePost(
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<AppResponse> {
    try {
      this.logger.log(
        `[PostService] Updating post with ID: ${postId}`,
        200,
      );

      return await this.postDao.updatePost(
        updatePostDto,
        postId,
      );
    } catch (error: any) {
      this.logger.error(
        `[PostService] Error in updatePost (${postId}): ${error.message}`,
        500,
      );
      throw error;
    }
  }

  async deletePost(
    postId: string,
  ): Promise<AppResponse> {
    try {
      this.logger.log(
        `[PostService] Deleting post with ID: ${postId}`,
        200,
      );

      return await this.postDao.deletePost(
        postId,
      );
    } catch (error: any) {
      this.logger.error(
        `[PostService] Error in deletePost (${postId}): ${error.message}`,
        500,
      );
      throw error;
    }
  }
}
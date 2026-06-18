import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { AppConfig } from 'src/config/AppConfig';
import AppLogger from 'src/core/logger/app-logger';
import { PostAbstractSQLDao } from 'src/databse/mssql/abstract/posts.abstract.mssql';
import { AppResponse, createResponse } from 'src/shared/appresponse.shared';

import { PostAbstractSvc } from './post.abstract';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileService } from '../azure/azure.service';
import { PaginationDto } from 'src/core/dto/pagination.dto';
import { FollowSQLDao } from 'src/databse/mssql/dao/follow.dao';

@Injectable()
export class PostService implements PostAbstractSvc {
  constructor(
    private readonly logger: AppLogger,
    private readonly appConfig: AppConfig,
    private readonly postDao: PostAbstractSQLDao,
    private readonly fileService: FileService,
    private readonly followDao: FollowSQLDao
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<AppResponse> {
    this.logger.log('[PostService] Initiating createPost', 200);

    return await this.postDao.createPost(createPostDto, userId);
  }

  async getAllPosts(pagination:PaginationDto): Promise<AppResponse> {
    try {
      this.logger.log('[PostService] Fetching all posts', 200);

      // pagination
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;

      // return await this.postDao.getAllPosts();
      const response = await this.postDao.getAllPosts(page,limit);

      if (response.data && Array.isArray(response.data)) {
        response.data = await Promise.all(
          response.data.map(async (post: any) => {
            if (post.MediaURL) {
              post.MediaURL = await this.fileService.generateReadUrl(
                post.MediaURL,
              );
            }

            return post;
          }),
        );
      }

      return response;
    } catch (error: any) {
      this.logger.error(
        `[PostService] Error in getAllPosts: ${error.message}`,
        500,
      );
      throw error;
    }
  }

  async getPostById(postId: string): Promise<AppResponse> {
    try {
      this.logger.log(`[PostService] Fetching post with ID: ${postId}`, 200);

      // return await this.postDao.getPostById(postId);
      const response = await this.postDao.getPostById(postId);

      if (response.data?.MediaURL) {
        response.data.MediaURL = await this.fileService.generateReadUrl(
          response.data.MediaURL,
        );
      }

      return response;
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
      this.logger.log(`[PostService] Updating post with ID: ${postId}`, 200);

      return await this.postDao.updatePost(updatePostDto, postId);
    } catch (error: any) {
      this.logger.error(
        `[PostService] Error in updatePost (${postId}): ${error.message}`,
        500,
      );
      throw error;
    }
  }

  async deletePost(postId: string): Promise<AppResponse> {
    try {
      this.logger.log(`[PostService] Deleting post with ID: ${postId}`, 200);

      return await this.postDao.deletePost(postId);
    } catch (error: any) {
      this.logger.error(
        `[PostService] Error in deletePost (${postId}): ${error.message}`,
        500,
      );
      throw error;
    }
  }


  async getFeed(
  userId: string,
  pagination: PaginationDto,
): Promise<AppResponse> {

  try {

    const followingIds =
      await this.followDao.getFollowingIds(
        userId,
      );

    // Include current user's posts
    followingIds.push(userId);

    return await this.postDao.getFeedPosts(
      followingIds,
      pagination.page,
      pagination.limit,
    );

  } catch (error: any) {

    this.logger.error(
      error.stack,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    return {
      ...createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve feed',
      ),
      description: error.message,
    };
  }
}

}



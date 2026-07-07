import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { AppConfig } from '../../config/AppConfig';
import AppLogger from '../../core/logger/app-logger';
import { PostAbstractSQLDao } from '../../databse/mssql/abstract/posts.abstract.mssql';
import { AppResponse, createResponse } from '../../shared/appresponse.shared';

import { PostAbstractSvc } from './post.abstract';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileService } from '../azure/azure.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaginationDto } from '../../core/dto/pagination.dto';

@Injectable()
export class PostService implements PostAbstractSvc {
  constructor(
    private readonly logger: AppLogger,
    private readonly appConfig: AppConfig,
    private readonly postDao: PostAbstractSQLDao,
    private readonly fileService: FileService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<AppResponse> {
    this.logger.log('[PostService] Initiating createPost', HttpStatus.OK);

    const response = await this.postDao.createPost(createPostDto, userId);
    
    if ((response.code === HttpStatus.CREATED || response.code === HttpStatus.OK) && response.data) {
      try {
        const postData = response.data;
        
        // Sign the media URL before emitting so it's ready
        if (postData.MediaURL) {
          postData.MediaURL = await this.fileService.generateReadUrl(postData.MediaURL);
        }
        if (postData.Media && Array.isArray(postData.Media)) {
          for (const m of postData.Media) {
            if (m.MediaURL) {
              m.MediaURL = await this.fileService.generateReadUrl(m.MediaURL);
            }
          }
        }
        
        // Emit domain event
        this.eventEmitter.emit('post.created', {
          postData,
          userId
        });
      } catch (err) {
        this.logger.error(`[PostService] Failed to emit post.created event: ${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    return response;
  }

  async getAllPosts(pagination:PaginationDto): Promise<AppResponse> {
    try {
      this.logger.log('[PostService] Fetching all posts', HttpStatus.OK);

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
            if (post.Media && Array.isArray(post.Media)) {
              for (const m of post.Media) {
                if (m.MediaURL) {
                  m.MediaURL = await this.fileService.generateReadUrl(m.MediaURL);
                }
              }
            }

            return post;
          }),
        );
      }

      return response;
    } catch (error: any) {
      this.logger.error(
        `[PostService] Error in getAllPosts: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      throw error;
    }
  }

  async getPostsByUserId(userId: string, pagination:PaginationDto): Promise<AppResponse> {
    try {
      this.logger.log(`[PostService] Fetching posts for user: ${userId}`, HttpStatus.OK);

      const page = pagination.page || 1;
      const limit = pagination.limit || 10;

      const response = await this.postDao.getPostsByUserId(userId, page, limit);

      if (response.data && Array.isArray(response.data.posts)) {
        response.data.posts = await Promise.all(
          response.data.posts.map(async (post: any) => {
            if (post.MediaURL) {
              post.MediaURL = await this.fileService.generateReadUrl(
                post.MediaURL,
              );
            }
            if (post.Media && Array.isArray(post.Media)) {
              for (const m of post.Media) {
                if (m.MediaURL) {
                  m.MediaURL = await this.fileService.generateReadUrl(m.MediaURL);
                }
              }
            }
            return post;
          }),
        );
      }

      return response;
    } catch (error: any) {
      this.logger.error(
        `[PostService] Error in getPostsByUserId: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      throw error;
    }
  }

  async getPostById(postId: string): Promise<AppResponse> {
    try {
      this.logger.log(`[PostService] Fetching post with ID: ${postId}`, HttpStatus.OK);

      // return await this.postDao.getPostById(postId);
      const response = await this.postDao.getPostById(postId);

      if (response.data?.MediaURL) {
        response.data.MediaURL = await this.fileService.generateReadUrl(
          response.data.MediaURL,
        );
      }
      if (response.data?.Media && Array.isArray(response.data.Media)) {
        for (const m of response.data.Media) {
          if (m.MediaURL) {
            m.MediaURL = await this.fileService.generateReadUrl(m.MediaURL);
          }
        }
      }

      return response;
    } catch (error: any) {
      this.logger.error(
        `[PostService] Error in getPostById (${postId}): ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      throw error;
    }
  }

  async updatePost(
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<AppResponse> {
    try {
      this.logger.log(`[PostService] Updating post with ID: ${postId}`, HttpStatus.OK);

      return await this.postDao.updatePost(updatePostDto, postId);
    } catch (error: any) {
      this.logger.error(
        `[PostService] Error in updatePost (${postId}): ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      throw error;
    }
  }

  async deletePost(postId: string, userId?: string, roles?: string[]): Promise<AppResponse> {
    try {
      this.logger.log(`[PostService] Deleting post with ID: ${postId}`, HttpStatus.OK);

      if (userId) {
        const postRes = await this.postDao.getPostById(postId);
        if (postRes.code === HttpStatus.NOT_FOUND || !postRes.data) {
          return createResponse(HttpStatus.NOT_FOUND, 'Post not found', null);
        }
        const postAuthorId = postRes.data.User?.ID || postRes.data.UserID || postRes.data.User?.Id;
        const isAdmin = roles && (roles.includes('ADMIN') || roles.includes('admin') || roles.includes('Admin'));
        if (postAuthorId !== userId && !isAdmin) {
          return createResponse(HttpStatus.FORBIDDEN, 'You can only delete your own posts', null);
        }

        if (postRes.data.MediaURL) {
          try { await this.fileService.deleteFile(postRes.data.MediaURL); } catch (e) {}
        }
        if (postRes.data.Media && Array.isArray(postRes.data.Media)) {
          for (const m of postRes.data.Media) {
            if (m.MediaURL) {
              try { await this.fileService.deleteFile(m.MediaURL); } catch (e) {}
            }
          }
        }
      }

      return await this.postDao.deletePost(postId);
    } catch (error: any) {
      this.logger.error(
        `[PostService] Error in deletePost (${postId}): ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      throw error;
    }
  }


  async getLikedPostsByUserId(userId: string, pagination: PaginationDto): Promise<AppResponse> {
    try {
      this.logger.log(`[PostService] Fetching liked posts for user: ${userId}`, HttpStatus.OK);

      const page = pagination.page || 1;
      const limit = pagination.limit || 10;

      const response = await this.postDao.getLikedPostsByUserId(userId, page, limit);

      if (response.data && Array.isArray(response.data.posts)) {
        response.data.posts = await Promise.all(
          response.data.posts.map(async (post: any) => {
            if (post.MediaURL) {
              post.MediaURL = await this.fileService.generateReadUrl(
                post.MediaURL,
              );
            }
            if (post.Media && Array.isArray(post.Media)) {
              for (const m of post.Media) {
                if (m.MediaURL) {
                  m.MediaURL = await this.fileService.generateReadUrl(m.MediaURL);
                }
              }
            }
            return post;
          }),
        );
      }

      return response;
    } catch (error: any) {
      this.logger.error(
        `[PostService] Error in getLikedPostsByUserId: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      throw error;
    }
  }

  async getTrendingPosts(pagination: PaginationDto): Promise<AppResponse> {
    try {
      this.logger.log(`[PostService] Fetching trending posts`, HttpStatus.OK);

      const page = pagination.page || 1;
      const limit = pagination.limit || 10;

      const response = await this.postDao.getTrendingPosts(page, limit);

      if (response.data && Array.isArray(response.data.posts)) {
        response.data.posts = await Promise.all(
          response.data.posts.map(async (post: any) => {
            if (post.MediaURL) {
              post.MediaURL = await this.fileService.generateReadUrl(
                post.MediaURL,
              );
            }
            if (post.Media && Array.isArray(post.Media)) {
              for (const m of post.Media) {
                if (m.MediaURL) {
                  m.MediaURL = await this.fileService.generateReadUrl(m.MediaURL);
                }
              }
            }
            return post;
          }),
        );
      }

      return response;
    } catch (error: any) {
      this.logger.error(
        `[PostService] Error in getTrendingPosts: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      throw error;
    }
  }

  async getTrendingHashtags(): Promise<AppResponse> {
    try {
      this.logger.log(`[PostService] Fetching trending hashtags`, HttpStatus.OK);
      return await this.postDao.getTrendingHashtags();
    } catch (error: any) {
      this.logger.error(`[PostService] Error in getTrendingHashtags: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      throw error;
    }
  }
}



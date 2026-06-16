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
import { Sequelize } from 'sequelize-typescript';
import { messageFactory, messages } from 'src/shared/message.shared';

@Injectable()
export class PostSQLDAO implements PostAbstractSQLDao {
  constructor(
    @Inject(MsSqlConstants.SEQUELIZE_PROVIDER) private sequelize: Sequelize,
    @Inject(MsSqlConstants.POST) private readonly postModel: typeof Posts,

    private readonly logger: AppLogger,
  ) {}

  // async createPost(
  //   createPostDto: CreatePostDto,
  //   userId: string,
  // ): Promise<AppResponse> {
  //   const transaction = await this.sequelize.transaction();
  //   try {
  //     const payload = {
  //       UserID: userId,
  //       Type: createPostDto.type,
  //       Content: createPostDto.content,
  //       MediaURL: createPostDto.mediaURL,
  //     };

  //     this.logger.log(JSON.stringify(payload, null, 2), HttpStatus.OK);

  //     // const newPost = await this.postModel.create(payload as any,{ transaction});

  //     const newPost = await this.postModel.create(
  //       payload as any,
  //       {
  //         transaction,
  //       }
  //     );

  //     await transaction.commit();

  //     return createResponse(
  //       HttpStatus.CREATED,
  //       'Post created successfully',
  //       newPost,
  //     );
  //   } catch (error: any) {
  //       await transaction.rollback();
  //       this.logger.error(`[PostSQLDAO] createPost: ${error.message}`,HttpStatus.INTERNAL_SERVER_ERROR);
  //       return { ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2)), description:error.message}
  //   }
  // }

  async createPost(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<AppResponse> {
    try {
      const payload = {
        UserID: userId,
        Type: createPostDto.type,
        Content: createPostDto.content,
        MediaURL: createPostDto.mediaURL,
        // CreatedAt: new Date(), // <--- ADD THIS LINE
      };

      this.logger.log(JSON.stringify(payload, null, 2), HttpStatus.OK);

      const newPost = await this.postModel.create(payload as any);

      return createResponse(
        HttpStatus.CREATED,
        'Post created successfully',
        newPost,
      );
    } catch (error: any) {
        this.logger.error(`[PostSQLDAO] REAL ERROR: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        
        return { 
          ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create post"), 
          description: error.message 
        };
    }
  }

  async getAllPosts(): Promise<AppResponse> {
    try {
      const posts = await this.postModel.findAll({
        order: [['CreatedAt', 'DESC']], // Fetch newest posts first
      });
      return createResponse(HttpStatus.OK, 'Posts retrieved successfully', posts);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return {
        ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  async getPostById(postId: string): Promise<AppResponse> {
    try {
      const post = await this.postModel.findOne({
        where: { ID: postId },
      });


      if (!post) {
        return createResponse(HttpStatus.NOT_FOUND, 'Post not found', null);
      }

      return createResponse(HttpStatus.OK, 'Post retrieved successfully', post);
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return {
        ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  async updatePost(updatePostDto: UpdatePostDto, postId: string): Promise<AppResponse> {
    const transaction = await this.sequelize.transaction();
    try {
      
      // 1. Map camelCase DTO fields to PascalCase Model fields
      const updatePayload: any = {};
      
      if (updatePostDto.type !== undefined) {
        updatePayload.Type = updatePostDto.type;
      }
      if (updatePostDto.content !== undefined) {
        updatePayload.Content = updatePostDto.content;
      }
      if (updatePostDto.mediaURL !== undefined) {
        updatePayload.MediaURL = updatePostDto.mediaURL;
      }

      // 2. Pass the mapped payload to the update function
      const [updatedRowsCount] = await this.postModel.update(
        updatePayload, 
        {
          where: { ID: postId },
          transaction,
        },
      );

      if (updatedRowsCount === 0) {
        await transaction.rollback();
        return createResponse(HttpStatus.NOT_FOUND, 'Post not found', null);
      }

      await transaction.commit();
      return createResponse(HttpStatus.OK, 'Post updated successfully', null);
    } catch (error: any) {
      await transaction.rollback();
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return {
        ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }

  async deletePost(postId: string): Promise<AppResponse> {
    const transaction = await this.sequelize.transaction();
    try {
      const deletedRowsCount = await this.postModel.destroy({
        where: { ID: postId },
        transaction,
      });

      if (deletedRowsCount === 0) {
        await transaction.rollback();
        return createResponse(HttpStatus.NOT_FOUND, 'Post not found', null);
      }

      await transaction.commit();
      return createResponse(HttpStatus.OK, 'Post deleted successfully', null);
    } catch (error: any) {
      await transaction.rollback();
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
      return {
        ...createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2)),
        description: error.message,
      };
    }
  }
}

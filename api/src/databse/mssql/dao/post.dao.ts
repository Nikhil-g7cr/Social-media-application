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
import { Op } from 'sequelize';

@Injectable()
export class PostSQLDAO implements PostAbstractSQLDao {
  constructor(
    @Inject(MsSqlConstants.SEQUELIZE_PROVIDER) private sequelize: Sequelize,
    @Inject(MsSqlConstants.POST) private readonly postModel: typeof Posts,

    private readonly logger: AppLogger,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<AppResponse> {
    const transaction = await this.sequelize.transaction();
    try {
      const payload = {
        UserID: userId,
        Type: createPostDto.type,
        Content: createPostDto.content,
        MediaURL: createPostDto.mediaURL,
      };

      this.logger.log(JSON.stringify(payload, null, 2), HttpStatus.OK);

      // const newPost = await this.postModel.create(payload as any,{ transaction});

      const newPost = await this.postModel.create(payload as any, {
        transaction,
      });

      await transaction.commit();

      return createResponse(
        HttpStatus.CREATED,
        'Post created successfully',
        newPost,
      );
    } catch (error: any) {
      await transaction.rollback();
      this.logger.error(
        `[PostSQLDAO] createPost: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          messageFactory(messages.E2),
        ),
        description: error.message,
      };
    }
  }

  async getAllPosts(page: number, limit: number): Promise<AppResponse> {
    try {
      const offset = (page - 1) * limit;

      const { rows, count } = await this.postModel.findAndCountAll({
        limit,
        offset,
        order: [['CreatedAt', 'DESC']],
        distinct: true,
        include: [
          {
            model: this.sequelize.models.Users,
            as: 'User',
            attributes: ['ID', 'FullName', 'UserName', 'ProfilePictureURL']
          },
          {
            model: this.sequelize.models.Likes,
            as: 'Likes',
            attributes: ['UserID']
          },
          {
            model: this.sequelize.models.Comments,
            as: 'Comments',
            attributes: ['ID']
          }
        ]
      });

      return createResponse(HttpStatus.OK, 'Posts retrieved successfully', {
        posts: rows,
        pagination: {
          page,
          limit,
          totalRecords: count,
          totalPages: Math.ceil(count / limit),
          hasNextPage: page < Math.ceil(count / limit),
          hasPreviousPage: page > 1,
        },
      });
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);

      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          messageFactory(messages.E2),
        ),
        description: error.message,
      };
    }
  }
  async getPostsByUserId(userId: string, page: number, limit: number): Promise<AppResponse> {
    try {
      const offset = (page - 1) * limit;

      const { rows, count } = await this.postModel.findAndCountAll({
        where: { UserID: userId },
        limit,
        offset,
        order: [['CreatedAt', 'DESC']],
        distinct: true,
        include: [
          {
            model: this.sequelize.models.Users,
            as: 'User',
            attributes: ['ID', 'FullName', 'UserName', 'ProfilePictureURL']
          },
          {
            model: this.sequelize.models.Likes,
            as: 'Likes',
            attributes: ['UserID']
          },
          {
            model: this.sequelize.models.Comments,
            as: 'Comments',
            attributes: ['ID']
          }
        ]
      });

      return createResponse(HttpStatus.OK, 'User posts retrieved successfully', {
        posts: rows,
        pagination: {
          page,
          limit,
          totalRecords: count,
          totalPages: Math.ceil(count / limit),
          hasNextPage: page < Math.ceil(count / limit),
          hasPreviousPage: page > 1,
        },
      });
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);

      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          messageFactory(messages.E2),
        ),
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
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          messageFactory(messages.E2),
        ),
        description: error.message,
      };
    }
  }

  async updatePost(
    updatePostDto: UpdatePostDto,
    postId: string,
  ): Promise<AppResponse> {
    const transaction = await this.sequelize.transaction();
    try {
      const updatePayload: any = {
        ModifiedAt: this.sequelize.literal('GETDATE()'),
      };

      if (updatePostDto.type !== undefined) {
        updatePayload.Type = updatePostDto.type;
      }
      if (updatePostDto.content !== undefined) {
        updatePayload.Content = updatePostDto.content;
      }
      if (updatePostDto.mediaURL !== undefined) {
        updatePayload.MediaURL = updatePostDto.mediaURL;
      }

      const [updatedRowsCount] = await this.postModel.update(updatePayload, {
        where: { ID: postId },
        transaction,
      });

      if (updatedRowsCount === 0) {
        await transaction.rollback();
        return createResponse(HttpStatus.NOT_FOUND, 'Post not found', null);
      }

      await transaction.commit();
      return createResponse(HttpStatus.OK, 'Post updated successfully', null);
    } catch (error: any) {
      // 1. Try to rollback, but catch and ignore the "double rollback" error
      // if MS SQL Server already killed the transaction.
      try {
        await transaction.rollback();
      } catch (rollbackError: any) {
        // We intentionally do nothing here except optionally log it.
        // If rollback fails, the transaction is already dead.
        this.logger.error(
          `[PostSQLDAO] Rollback skipped: ${rollbackError.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // 2. Log the REAL database error that caused the update to fail
      this.logger.error(
        `[PostSQLDAO] updatePost DB Error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          messageFactory(messages.E2),
        ),
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
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          messageFactory(messages.E2),
        ),
        description: error.message,
      };
    }
  }

  async getFeedPosts(
  followingIds: string[],
  page: number,
  limit: number,
): Promise<AppResponse> {

  try {

    const offset =
      (page - 1) * limit;

    const {
      rows,
      count,
    } =
      await this.postModel.findAndCountAll({
        where: {
          UserID: {
            [Op.in]:
              followingIds,
          },
        },
        limit,
        offset,
        order: [
          ['CreatedAt', 'DESC'],
        ],
        distinct: true,
        include: [
          {
            model: this.sequelize.models.Users,
            as: 'User',
            attributes: ['ID', 'FullName', 'UserName', 'ProfilePictureURL']
          },
          {
            model: this.sequelize.models.Likes,
            as: 'Likes',
            attributes: ['UserID']
          },
          {
            model: this.sequelize.models.Comments,
            as: 'Comments',
            attributes: ['ID']
          }
        ]
      });

    return createResponse(
      HttpStatus.OK,
      'Feed retrieved successfully',
      {
        posts: rows,
        pagination: {
          page,
          limit,
          totalRecords: count,
          totalPages: Math.ceil(
            count / limit,
          ),
          hasNextPage:
            page <
            Math.ceil(
              count / limit,
            ),
          hasPreviousPage:
            page > 1,
        },
      },
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

  async getLikedPostsByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<AppResponse> {
    try {
      const offset = (page - 1) * limit;

      // Find all posts that this user liked
      const { rows, count } = await this.postModel.findAndCountAll({
        include: [
          {
            model: this.sequelize.models.Users,
            as: 'User',
            attributes: ['ID', 'FullName', 'UserName', 'ProfilePictureURL'],
          },
          {
            model: this.sequelize.models.Likes,
            as: 'Likes',
            where: { UserID: userId }, // INNER JOIN basically, only fetch posts liked by the user
            attributes: ['UserID'],
          },
        ],
        limit,
        offset,
        order: [['CreatedAt', 'DESC']],
        distinct: true,
      });

      const postIds = rows.map((post) => post.ID);

      const fullPosts = await this.postModel.findAll({
        where: { ID: { [Op.in]: postIds } },
        include: [
          {
            model: this.sequelize.models.Users,
            as: 'User',
            attributes: ['ID', 'FullName', 'UserName', 'ProfilePictureURL'],
          },
          {
            model: this.sequelize.models.Likes,
            as: 'Likes',
            attributes: ['UserID'],
          },
          {
            model: this.sequelize.models.Comments,
            as: 'Comments',
            attributes: ['ID'],
          }
        ],
        order: [['CreatedAt', 'DESC']],
      });

      return createResponse(
        HttpStatus.OK,
        'Liked posts retrieved successfully',
        {
          posts: fullPosts,
          pagination: {
            page,
            limit,
            totalRecords: count,
            totalPages: Math.ceil(count / limit),
            hasNextPage: page < Math.ceil(count / limit),
            hasPreviousPage: page > 1,
          },
        },
      );
    } catch (error: any) {
      this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);

      return {
        ...createResponse(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to retrieve liked posts',
        ),
        description: error.message,
      };
    }
  }
}

import { AppResponse } from 'src/shared/appresponse.shared';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from 'src/core/dto/pagination.dto';

export abstract class PostAbstractSvc {
  abstract createPost(createPostDto: CreatePostDto,userId:string): Promise<AppResponse>;

  abstract getAllPosts(pagination:PaginationDto): Promise<AppResponse>;

  abstract getPostsByUserId(userId: string, pagination:PaginationDto): Promise<AppResponse>;

  abstract getPostById(postId: string): Promise<AppResponse>;

  abstract updatePost(
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<AppResponse>;

  abstract deletePost(postId: string): Promise<AppResponse>;

  abstract getLikedPostsByUserId(userId: string, pagination: PaginationDto): Promise<AppResponse>;

}

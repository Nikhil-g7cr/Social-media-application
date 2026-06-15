import { AppResponse } from 'src/shared/appresponse.shared';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

export abstract class PostAbstractSvc {
  abstract createPost(createPostDto: CreatePostDto): Promise<AppResponse>;

  abstract getAllPosts(): Promise<AppResponse>;

  abstract getPostById(postId: string): Promise<AppResponse>;

  abstract updatePost(
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<AppResponse>;

  abstract deletePost(postId: string): Promise<AppResponse>;
}

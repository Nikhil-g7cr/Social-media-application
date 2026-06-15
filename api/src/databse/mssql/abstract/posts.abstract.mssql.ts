import { AppResponse } from 'src/shared/appresponse.shared';
import { CreatePostDto } from 'src/modules/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/modules/post/dto/update-post.dto';

export abstract class PostAbstractSQLDao {
  abstract createPost(createPostDto: CreatePostDto): Promise<AppResponse>;

  abstract getAllPosts(): Promise<AppResponse>;

  abstract getPostById(postId: string): Promise<AppResponse>;

  abstract updatePost(
    updatePostDto:UpdatePostDto,
    postId: string,
  ): Promise<AppResponse>;

  abstract deletePost(postId: string): Promise<AppResponse>;
}

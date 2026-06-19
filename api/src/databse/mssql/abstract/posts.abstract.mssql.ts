import { AppResponse } from 'src/shared/appresponse.shared';
import { CreatePostDto } from 'src/modules/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/modules/post/dto/update-post.dto';

export abstract class PostAbstractSQLDao {
  abstract createPost(createPostDto: CreatePostDto,userID:string): Promise<AppResponse>;

  abstract getAllPosts(page:number,limit:number): Promise<AppResponse>;

  abstract getPostsByUserId(userId: string, page:number, limit:number): Promise<AppResponse>;

  abstract getPostById(postId: string): Promise<AppResponse>;

  abstract updatePost(
    updatePostDto:UpdatePostDto,
    postId: string,
  ): Promise<AppResponse>;

  abstract deletePost(postId: string): Promise<AppResponse>;

  abstract getFeedPosts(followingIds: string[],page: number,limit: number,): Promise<AppResponse>;

  abstract getLikedPostsByUserId(userId: string, page: number, limit: number): Promise<AppResponse>;
}

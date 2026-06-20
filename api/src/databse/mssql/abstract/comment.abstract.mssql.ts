import { AppResponse } from "src/shared/appresponse.shared";

export abstract class CommentsAbstractSQLDAO{
    abstract createComment(postId: string, userId: string, commentText: string): Promise<AppResponse>;
    abstract getCommentsByPostId(postId: string): Promise<AppResponse>;
    abstract getUserComments(userId: string): Promise<AppResponse>;
    abstract deleteComment(commentId: string, userId: string): Promise<AppResponse>;
}
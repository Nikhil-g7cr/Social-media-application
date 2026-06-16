import { AppResponse } from "src/shared/appresponse.shared";

export abstract class CommentsAbstractSQLDAO{
    abstract createComment(postId: string, userId: string, commentText: string): Promise<AppResponse>
}
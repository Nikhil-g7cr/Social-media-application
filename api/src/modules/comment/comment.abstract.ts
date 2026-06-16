import { AppResponse } from "src/shared/appresponse.shared";

export abstract class CommentAbstractSvc{
    abstract createComment(postId: string, userId: string, commentText: string): Promise<AppResponse>
}
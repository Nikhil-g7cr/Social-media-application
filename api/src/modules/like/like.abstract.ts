import { AppResponse } from "src/shared/appresponse.shared";

export abstract class LikeAbstractSvc{
    abstract toggleLike(postId: string, userId: string): Promise<AppResponse>
}
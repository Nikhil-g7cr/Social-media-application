import { AppResponse } from "src/shared/appresponse.shared";

export abstract class LikeAbstractSQLDAO{
    abstract toggleLike(postId: string, userId: string): Promise<AppResponse> 
}
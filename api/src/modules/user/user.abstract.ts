import { AppResponse } from "src/shared/appresponse.shared";
import { UpdateUserDto } from "./dto/UpdateUser.dto";
import { UsersDTO } from "./dto/users.dto";
import { AtPayload, Tokens } from "./models/users.model";

export abstract class UsersAbstractSvc{
    // abstract getAllUser(payload: AtPayload):Promise<AppResponse> -->trying to remove the payload
    abstract getAllUser():Promise<AppResponse>
    abstract searchUsers(query: string):Promise<AppResponse>
    abstract getUserByID(userID: string, payload: AtPayload):Promise<AppResponse>
    abstract addUser(userInfo:UsersDTO,payload:AtPayload):Promise<AppResponse>
    abstract updateUser(userInfo: UpdateUserDto, targetUserID: string, payload: AtPayload):Promise<AppResponse>
    abstract deleteUser(userID: string, payload: AtPayload):Promise<AppResponse>
    // abstract fetchRoles():Promise<AppResponse>
}
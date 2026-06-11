import { AppResponse } from "src/shared/appresponse.shared";
import { UpdateUserDto } from "./dto/UpdateUser.dto";
import { UsersDTO } from "./dto/users.dto";
import { Tokens } from "./models/users.model";

export abstract class UsersAbstractSvc{
    abstract getAllUser():Promise<AppResponse>
    abstract getUserByID(userID:string):Promise<AppResponse>
    abstract addUser(userInfo:UsersDTO,tokens:Tokens):Promise<AppResponse>
    abstract updateUser(userInfo: UpdateUserDto):Promise<AppResponse>
    abstract deleteUser(userID:string):Promise<AppResponse>
    abstract fetchRoles():Promise<AppResponse>
}
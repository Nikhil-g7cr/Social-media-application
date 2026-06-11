import { UpdateUserDto } from "src/modules/user/dto/UpdateUser.dto";
import { UsersDTO } from "src/modules/user/dto/users.dto";
import { AppResponse } from "src/shared/appresponse.shared";

export abstract class UserAbsSQLDAO{
    abstract getUsers(userInfo:UsersDTO):Promise<AppResponse>
    abstract getUserByID(UserId:string):Promise<AppResponse>
    abstract addUser(UserInfo:UsersDTO):Promise<AppResponse>
    abstract updateUser(UserInfo:UpdateUserDto, UserId:string):Promise<AppResponse>
    abstract deleteUser(UserId:string):Promise<AppResponse>
    abstract getUserRoleByID(UserID:string):Promise<AppResponse>
}
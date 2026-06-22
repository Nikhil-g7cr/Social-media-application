import { UpdateUserDto } from "src/modules/user/dto/UpdateUser.dto";
import { UsersDTO } from "src/modules/user/dto/users.dto";
import { AppResponse } from "src/shared/appresponse.shared";

export abstract class UserAbsSQLDAO {
    abstract getUsers(userInfo: UsersDTO, showDeleted?: boolean): Promise<AppResponse>
    abstract searchUsers(query: string): Promise<AppResponse>
    abstract getUserByID(UserId: string): Promise<AppResponse>
    abstract addUser(UserInfo: UsersDTO): Promise<AppResponse>
    abstract updateUser(UserInfo: UpdateUserDto, UserId: string): Promise<AppResponse>
    abstract softDeleteUser(UserId: string): Promise<AppResponse>
    abstract restoreUser(UserId: string): Promise<AppResponse>
    abstract hardDeleteUser(UserId: string): Promise<AppResponse>
    /** @deprecated Use hardDeleteUser instead */
    abstract deleteUser(UserId: string): Promise<AppResponse>
    abstract getUserRoleByID(UserID: string): Promise<AppResponse>
}
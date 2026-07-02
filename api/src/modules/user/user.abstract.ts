import { AppResponse } from '../../shared/appresponse.shared';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { UsersDTO } from './dto/users.dto';
import { AtPayload, Tokens } from './interface/users.interface';

export abstract class UsersAbstractSvc {
  abstract getAllUser(showDeleted?: boolean): Promise<AppResponse>;
  abstract searchUsers(query: string): Promise<AppResponse>;
  abstract getUserByID(
    userID: string,
    payload: AtPayload,
  ): Promise<AppResponse>;
  abstract addUser(
    userInfo: UsersDTO,
    payload: AtPayload,
  ): Promise<AppResponse>;
  abstract updateUser(
    userInfo: UpdateUserDto,
    targetUserID: string,
    payload: AtPayload,
  ): Promise<AppResponse>;
  abstract softDeleteUser(
    userID: string,
    payload: AtPayload,
  ): Promise<AppResponse>;
  abstract restoreUser(
    userID: string,
    payload: AtPayload,
  ): Promise<AppResponse>;
  abstract hardDeleteUser(
    userID: string,
    payload: AtPayload,
  ): Promise<AppResponse>;
  abstract deleteUser(userID: string, payload: AtPayload): Promise<AppResponse>;
  abstract findByUsername(userName: string): Promise<AppResponse>;
}

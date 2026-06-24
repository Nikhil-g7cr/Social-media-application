import { UsersDTO } from "src/modules/user/dto/users.dto";
import { AppResponse } from "src/shared/appresponse.shared";

export abstract class AuthAbstractSQLDao {
  abstract fetchUserById(userID: string): Promise<AppResponse>;
  abstract fetchUserByEmail(email: string): Promise<AppResponse>;
  abstract createUser(userData: UsersDTO): Promise<AppResponse>;
  abstract createSession(sessionData: any): Promise<void>;
}
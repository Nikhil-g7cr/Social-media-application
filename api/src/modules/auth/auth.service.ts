import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthAbstractSQLDao } from 'src/databse/mssql/abstract/auth.abstract.mssql';
import { AppResponse } from 'src/shared/appresponse.shared';
import { UsersDTO } from '../user/dto/users.dto';

@Injectable()
export class AuthService implements AuthAbstractSQLDao {
  fetchUserById(userID: string): Promise<AppResponse> {
    throw new Error('Method not implemented.');
  }
  fetchUserByEmail(email: string): Promise<AppResponse> {
    throw new Error('Method not implemented.');
  }
  createUser(userData: UsersDTO): Promise<AppResponse> {
    throw new Error('Method not implemented.');
  }
  
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { UsersAbstractSvc } from './user.abstract';
import { AppResponse } from 'src/shared/appresponse.shared';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { UsersDTO } from './dto/users.dto';
import { Tokens } from './models/users.model';
import { UserAbsSQLDAO } from 'src/databse/mssql/abstract/user.abstract.mssql';
import { DatabaseService } from 'src/databse/database.service';
import { AppConfig } from 'src/config/AppConfig';
import AppLogger from 'src/core/logger/app-logger';

@Injectable()
export class UserService implements UsersAbstractSvc{
    private readonly userSQLAbstractDAO:UserAbsSQLDAO;

    constructor(
        readonly dbService:DatabaseService,
        readonly logger:AppLogger,
        private readonly appConfig:AppConfig
    ){}

    getAllUser(): Promise<AppResponse> {
        
        throw new Error('Method not implemented.');
    }
    getUserByID(userID: string): Promise<AppResponse> {
        throw new Error('Method not implemented.');
    }
    addUser(userInfo: UsersDTO, tokens: Tokens): Promise<AppResponse> {
        throw new Error('Method not implemented.');
    }
    updateUser(userInfo: UpdateUserDto): Promise<AppResponse> {
        throw new Error('Method not implemented.');
    }
    deleteUser(userID: string): Promise<AppResponse> {
        throw new Error('Method not implemented.');
    }
    fetchRoles(): Promise<AppResponse> {
        throw new Error('Method not implemented.');
    }

}

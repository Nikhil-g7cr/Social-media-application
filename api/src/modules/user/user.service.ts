import { HttpStatus, Injectable } from '@nestjs/common';
import { UsersAbstractSvc } from './user.abstract';
import { AppResponse, createResponse } from 'src/shared/appresponse.shared';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { UsersDTO } from './dto/users.dto';
// Import AtPayload instead of Tokens
import { AtPayload } from './models/users.model'; 
import { UserAbsSQLDAO } from 'src/databse/mssql/abstract/user.abstract.mssql';
import { DatabaseService } from 'src/databse/database.service';
import { AppConfig } from 'src/config/AppConfig';
import AppLogger from 'src/core/logger/app-logger';
import { messageFactory, messages } from 'src/shared/message.shared';
import { UserRoles } from 'src/core/enums/user.enums';

@Injectable()
export class UserService implements UsersAbstractSvc {
    
    constructor(
        readonly dbService: DatabaseService,
        private readonly userSQLAbsDAO: UserAbsSQLDAO,
        readonly logger: AppLogger,
        private readonly appConfig: AppConfig
    ) {
    }

    // async getAllUser(payload: AtPayload): Promise<AppResponse> {
    async getAllUser(): Promise<AppResponse> {
        try {
            // ROLE CHECK: Since roles is an array, we check if it includes ADMIN or MANAGER
            // const isAdminOrManager = payload.roles.includes(UserRoles.ADMIN) || payload.roles.includes(UserRoles.MANAGER);
            
            // if (!isAdminOrManager) {
            //     return createResponse(HttpStatus.FORBIDDEN, 'Access Denied: Insufficient permissions.');
            // }

            const users = await this.userSQLAbsDAO.getUsers({} as UsersDTO);
            return users;
        } catch (error: any) {
            this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
            return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2));
        }
    }

    async searchUsers(query: string): Promise<AppResponse> {
        try {
            if (!query) {
                return createResponse(HttpStatus.OK, 'Empty query', []);
            }
            return await this.userSQLAbsDAO.searchUsers(query);
        } catch (error: any) {
            this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
            return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2));
        }
    }
    
    async getUserByID(userID: string): Promise<AppResponse> {
        try {
            // ROLE CHECK: 'payload.sub' is the logged-in User's ID
           
            // if (!isSelf && !isAdmin) {
            //     return createResponse(HttpStatus.FORBIDDEN, 'Access Denied: You can only view your own profile.');
            // }

            return await this.userSQLAbsDAO.getUserByID(userID);
        } catch (error: any) {
            this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
            return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2));
        }
    }
    // async getUserByID(userID: string, payload: AtPayload): Promise<AppResponse> {
    //     try {
    //         // ROLE CHECK: 'payload.sub' is the logged-in User's ID
    //         const isSelf = payload.sub === userID;
    //         const isAdmin = payload.roles.includes(UserRoles.ADMIN);

    //         if (!isSelf && !isAdmin) {
    //             return createResponse(HttpStatus.FORBIDDEN, 'Access Denied: You can only view your own profile.');
    //         }

    //         return await this.userSQLAbsDAO.getUserByID(userID);
    //     } catch (error: any) {
    //         this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
    //         return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2));
    //     }
    // }

    async addUser(userInfo: UsersDTO, payload?: AtPayload): Promise<AppResponse> {
        try {
            if (payload && !payload.roles.includes(UserRoles.ADMIN)) {
                return createResponse(HttpStatus.FORBIDDEN, 'Access Denied: Only Admins can manually create users.');
            }

            return await this.userSQLAbsDAO.addUser(userInfo);
        } catch (error: any) {
            this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
            return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2));
        }
    }

    async updateUser(userInfo: UpdateUserDto, targetUserID: string): Promise<AppResponse> {
        try {
            // const isSelf = payload.sub === targetUserID;
            // const isAdmin = payload.roles.includes(UserRoles.ADMIN);

            // // 1. Check if the user is allowed to edit this profile
            // if (!isSelf && !isAdmin) {
            //     return createResponse(HttpStatus.FORBIDDEN, 'Access Denied: You can only update your own profile.');
            // }

            // 2. Perform the update
            return await this.userSQLAbsDAO.updateUser(userInfo, targetUserID);
        } catch (error: any) {
            this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
            return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2));
        }
    }
    // async updateUser(userInfo: UpdateUserDto, targetUserID: string, payload: AtPayload): Promise<AppResponse> {
    //     try {
    //         const isSelf = payload.sub === targetUserID;
    //         const isAdmin = payload.roles.includes(UserRoles.ADMIN);

    //         // 1. Check if the user is allowed to edit this profile
    //         if (!isSelf && !isAdmin) {
    //             return createResponse(HttpStatus.FORBIDDEN, 'Access Denied: You can only update your own profile.');
    //         }

    //         // 2. Perform the update
    //         return await this.userSQLAbsDAO.updateUser(userInfo, targetUserID);
    //     } catch (error: any) {
    //         this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
    //         return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2));
    //     }
    // }

    async deleteUser(userID: string): Promise<AppResponse> {
        try {
            // if (!payload.roles.includes(UserRoles.ADMIN)) {
            //     return createResponse(HttpStatus.FORBIDDEN, 'Access Denied: Only Admins can delete users.');
            // }

            return await this.userSQLAbsDAO.deleteUser(userID);
        } catch (error: any) {
            this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
            return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2));
        }
    }
    // async deleteUser(userID: string, payload: AtPayload): Promise<AppResponse> {
    //     try {
    //         if (!payload.roles.includes(UserRoles.ADMIN)) {
    //             return createResponse(HttpStatus.FORBIDDEN, 'Access Denied: Only Admins can delete users.');
    //         }

    //         return await this.userSQLAbsDAO.deleteUser(userID);
    //     } catch (error: any) {
    //         this.logger.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
    //         return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messageFactory(messages.E2));
    //     }
    // }
}
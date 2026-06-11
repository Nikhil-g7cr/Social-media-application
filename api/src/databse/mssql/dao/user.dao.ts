import { Inject } from "@nestjs/common";
import { MsSqlConstants } from "../connection/constant.mssql";
import { Sequelize } from "sequelize-typescript";
import { Users } from "../models";
import AppLogger from "src/core/logger/app-logger";
import { UsersDTO } from "src/modules/user/dto/users.dto";
import { AppResponse } from "src/shared/appresponse.shared";

export class UserSQLDao{
    constructor(
        @Inject(MsSqlConstants.SEQUELIZE_PROVIDER) private sequelize: Sequelize,
        @Inject(MsSqlConstants.USER) private _user: typeof Users,
        readonly logger:AppLogger
    ){}

    async getUsers(userInfo:UsersDTO):Promise<AppResponse>{
        try{
        }catch(error:any){
        }
    } 
    async getUsersByID(userID:string):Promise<AppResponse>{
        try{
        }catch(error:any){
        }
    } 
    async addUser(userInfo:UsersDTO):Promise<AppResponse>{
        try{
        }catch(error:any){
        }
    } 
    async updateUser(userInfo:UsersDTO, UserId:string):Promise<AppResponse>{
        try{
        }catch(error:any){
        }
    } 
    async deleteUser(userID:string):Promise<AppResponse>{
        try{
        }catch(error:any){
        }
    } 
    async getUserRoleById(userID:string):Promise<AppResponse>{
        try{
        }catch(error:any){
        }
    } 
}
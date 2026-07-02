import { AppResponse } from "../../shared/appresponse.shared";
import { UsersDTO } from "../user/dto/users.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtPayload } from "./models/jwt-payload.model";

export abstract class AbstractAuthSvc {

    // User registration
    abstract signup(userData: UsersDTO, ipAddress?: string, userAgent?: string): Promise<AppResponse>;

    // User login
    abstract login(loginData: LoginDto, ipAddress?: string, userAgent?: string): Promise<AppResponse>;

    // Generate new access token using refresh token
    abstract refreshToken(refreshToken: string): Promise<AppResponse>;

    // Validate access token
    abstract validateToken(token: string): Promise<AppResponse>;

    // Decode token and return payload
    abstract parseToken(token: string): Promise<AppResponse>;

    // Logout user
    abstract logout(userId: string): Promise<AppResponse>;

    // Current logged in user
    abstract getProfile(payload: JwtPayload): Promise<AppResponse>;
}
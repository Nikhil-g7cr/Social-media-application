import { AppResponse } from '../../shared/appresponse.shared';
import { UsersDTO } from '../user/dto/users.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './models/jwt-payload.model';

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

  // Current logged-in user profile
  abstract getProfile(payload: JwtPayload): Promise<AppResponse>;

  // Logout current device (delete current session)
  abstract logout(sessionId: string, userId?: string): Promise<AppResponse>;

  // Logout from all devices (delete all sessions)
  abstract logoutAll(userId: string): Promise<AppResponse>;

  // Delete a specific session (must be owned by the requesting user)
  abstract removeSession(userId: string, sessionId: string): Promise<AppResponse>;

  // List all active sessions for the authenticated user
  abstract getSessions(userId: string): Promise<AppResponse>;
}
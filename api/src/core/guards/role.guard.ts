import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoles } from '../enums/user.enums';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AtPayload } from '../../modules/user/interface/users.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user as AtPayload;

    if (!user || !user.roles) {
      return false;
    }

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}

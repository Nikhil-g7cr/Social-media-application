import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new UnauthorizedException('No user found in request');
    }
    
    // If you pass a specific property (e.g., @CurrentUser('sub')), it returns just that property
    return data ? user[data] : user;
  },
);
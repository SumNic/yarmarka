import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/auth/guards/roles-auth.decorator';
import { JwtPayload } from 'src/auth/guards/jwt.strategy';

type RequestWithUser = Request & { user?: JwtPayload };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const role = req.user?.role;

    return role ? requiredRoles.includes(role) : false;
  }
}

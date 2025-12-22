import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/guards/jwt.strategy';

export type JwtRefreshPayload = JwtPayload & {
  refreshToken?: string;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = req.refreshToken;
          return typeof token === 'string' ? token : null;
        },
        (req: Request) => {
          const token: unknown = req.cookies?.refreshToken;
          return typeof token === 'string' ? token : null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtRefreshPayload {
    const token: string | undefined =
      typeof req.refreshToken === 'string'
        ? req.refreshToken
        : typeof req.cookies?.refreshToken === 'string'
          ? req.cookies.refreshToken
          : undefined;

    return {
      ...payload,
      refreshToken: typeof token === 'string' ? token : undefined,
    };
  }
}

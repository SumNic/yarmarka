import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const headerToken = req.headers['x-refresh-token'];

    const refreshToken =
      typeof req.cookies?.refreshToken === 'string'
        ? req.cookies.refreshToken
        : typeof headerToken === 'string'
          ? headerToken
          : undefined;

    if (refreshToken) {
      req.refreshToken = refreshToken;
    }

    next();
  }
}

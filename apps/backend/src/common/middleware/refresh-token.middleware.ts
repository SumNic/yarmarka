import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Пробуем сначала cookie
    const refreshToken =
      req.cookies?.refreshToken || req.headers['x-refresh-token']; // или кастомный заголовок

    if (refreshToken) {
      req['refreshToken'] = refreshToken; // прокидываем в req
    }

    next();
  }
}

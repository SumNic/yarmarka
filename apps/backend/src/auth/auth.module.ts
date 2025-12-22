import { MiddlewareConsumer, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from 'src/auth/guards/jwt.strategy';
import { JwtRefreshStrategy } from 'src/auth/guards/jwt-refresh.strategy';
import { MailService } from 'src/common/services/mail.service';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

@Module({
  exports: [AuthService],
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION')}s`,
        },
        configure(consumer: MiddlewareConsumer) {
          consumer.apply(cookieParser()).forRoutes('*');
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, MailService],
  controllers: [AuthController],
})
export class AuthModule {}

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { RefreshTokenMiddleware } from 'src/common/middleware/refresh-token.middleware';
import { User } from 'src/common/models/User.model';
import { Product } from 'src/common/models/Product.model';
import { Service } from 'src/common/models/Service.model';
import { Job } from 'src/common/models/Job.model';
import { Resume } from 'src/common/models/Resume.model';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from 'src/products/products.module';
import { ServicesModule } from 'src/services/services.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { ResumesModule } from 'src/resumes/resumes.module';
import { RolesModule } from './roles/roles.module';
import cookieParser from 'cookie-parser';
import { UserRoles } from 'src/common/models/User-roles.model';
import { Role } from 'src/common/models/Role.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        CLIENT_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),
        JWT_REFRESH_EXPIRATION: Joi.string().required(),
        POSTGRES_URI: Joi.string().required(),
        DOMEN: Joi.string().required(),
        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().required(),
        SMTP_USER: Joi.string().required(),
        SMTP_PASS: Joi.string().required(),
        SMTP_FROM: Joi.string().required(),
        EMAIL_CONFIRM_TOKEN_EXPIRATION: Joi.string().required(),
        COOKIE_SECURE: Joi.string().required(),

        S3_ENDPOINT: Joi.string().required(),
        S3_REGION: Joi.string().required(),
        S3_ACCESS_KEY_ID: Joi.string().required(),
        S3_SECRET_ACCESS_KEY: Joi.string().required(),
        S3_BUCKET: Joi.string().required(),
        S3_PUBLIC_BASE_URL: Joi.string().required(),
      }),
      envFilePath: '.env',
    }),
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
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('POSTGRES_URI'),
        dialect: 'postgres',
        models: [User, Product, Service, Job, Resume, Role, UserRoles],
        autoLoadModels: true,
        synchronize: true,
        sync: {
          alter: true,
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    ServicesModule,
    JobsModule,
    ResumesModule,
    RolesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser(), RefreshTokenMiddleware).forRoutes('*');
  }
}

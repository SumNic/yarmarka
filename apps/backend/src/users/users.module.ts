import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/common/models/User.model';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import { S3Service } from 'src/common/services/s3.service';
import { Role } from 'src/common/models/Role.model';
import { UserRoles } from 'src/common/models/User-roles.model';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  providers: [UsersService, S3Service],
  imports: [SequelizeModule.forFeature([User, Role, UserRoles]), RolesModule],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

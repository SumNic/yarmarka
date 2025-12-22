import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/common/models/User.model';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  providers: [UsersService],
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

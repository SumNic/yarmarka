import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { RolesController } from 'src/roles/roles.controller';
import { AuthModule } from 'src/auth/auth.module';
import { Role } from 'src/common/models/Role.model';
import { User } from 'src/common/models/User.model';
import { UserRoles } from 'src/common/models/User-roles.model';

@Module({
    providers: [RolesService],
    imports: [SequelizeModule.forFeature([Role, User, UserRoles]), AuthModule],
    controllers: [RolesController],
    exports: [RolesService],
})
export class RolesModule {}

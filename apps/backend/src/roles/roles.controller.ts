import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/guards/roles-auth.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ROLES } from 'src/common/constants/roles';
import { Role } from 'src/common/models/Role.model';
import { CreateRoleDto } from 'src/roles/dto/create-role.dto';
import { RolesService } from 'src/roles/roles.service';

@ApiTags('Роли')
@Controller('roles')
export class RolesController {
    constructor(private readonly roleService: RolesService) {}

    @ApiOperation({
        summary: 'Получить список ролей',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Операция прошла успешно.',
    })
    @Get('/get-all-roles')
    async getAllRoles(): Promise<Role[]> {
        return await this.roleService.getAllRoles();
    }

    @ApiOperation({
        summary: 'Создать новую роль',
    })
    @ApiBody({
        type: CreateRoleDto,
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Операция прошла успешно.',
    })
    @Roles(ROLES.ADMIN)
    @UseGuards(RolesGuard)
    @Post('/create-new-role')
    async create(@Body() dto: CreateRoleDto): Promise<Role> {
        return await this.roleService.create(dto);
    }
}

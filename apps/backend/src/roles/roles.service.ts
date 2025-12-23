import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from 'src/common/models/Role.model';
import { CreateRoleDto } from 'src/roles/dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role) private roleRepository: typeof Role) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const candidate = await this.roleRepository.findOne({
      where: { value: dto.value },
    });

    if (candidate) {
      throw new HttpException(
        'Такая роль уже существует',
        HttpStatus.FORBIDDEN,
      );
    }

    const role = await this.roleRepository.create(dto);
    return role;
  }

  async getAllRoles(): Promise<Role[]> {
    const roles = await this.roleRepository.findAll();
    return roles;
  }

  async getRoleByValue(value: string): Promise<Role | null> {
    const role = await this.roleRepository.findOne({ where: { value } });
    return role;
  }
}

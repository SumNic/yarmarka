import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserCreationAttrs } from 'src/common/models/User.model';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import type { Actor } from 'src/common/auth/permissions';
import {
  assertCanManageOwnedResource,
} from 'src/common/auth/permissions';
import { RolesService } from 'src/roles/roles.service';
import { ROLES } from 'src/common/constants/roles';
import { AddRoleDto } from 'src/users/dto/add-role.dto';
import { Role } from 'src/common/models/Role.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userRepo: typeof User,
    private roleService: RolesService,
  ) {}

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email }, include: [{ model: Role }] });
  }

  findById(id: number) {
    return this.userRepo.findByPk(id);
  }

  findByEmailVerificationTokenHash(emailVerificationTokenHash: string) {
    return this.userRepo.findOne({ where: { emailVerificationTokenHash } });
  }

  async create(data: UserCreationAttrs) {
    return this.userRepo.create({
      ...data,
      isEmailVerified: false,
    });
  }

  async findAll() {
    return this.userRepo.findAll();
  }

  async findOne(id: number) {
    const entity = await this.userRepo.findByPk(id);
    if (!entity) throw new NotFoundException('User not found');
    return entity;
  }

  async createCrud(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const data: UserCreationAttrs = {
      email: dto.email,
      password: passwordHash,
      name: dto.name,
      isEmailVerified: dto.isEmailVerified ?? false,
      photoUrl: dto.photoUrl,
      country: dto.country,
      region: dto.region,
      district: dto.district,
      isEstate: dto.isEstate,
      estateType: dto.estateType,
      settlement: dto.settlement,
    };

    const user = await this.userRepo.create(data);

    let role = await this.roleService.getRoleByValue(ROLES.USER);

    if (!role) {
      role = await this.roleService.create({ value: ROLES.USER });
    }

    await user.$set('roles', [role.id]);
    user.roles = [role];

    return user;
  }

  async updateCrud(actor: Actor, id: number, dto: UpdateUserDto) {
    const entity = await this.findOne(id);

    assertCanManageOwnedResource({
      actor,
      ownerId: entity.id,
      errorMessage: 'Недостаточно прав',
    });

    const patch: Partial<UserCreationAttrs> = {
      email: dto.email,
      name: dto.name,
      isEmailVerified: dto.isEmailVerified,
      photoUrl: dto.photoUrl,
      country: dto.country,
      region: dto.region,
      district: dto.district,
      isEstate: dto.isEstate,
      estateType: dto.estateType,
      settlement: dto.settlement,
    };

    if (dto.password) {
      patch.password = await bcrypt.hash(dto.password, 10);
    }

    await entity.update(patch as any);
    return entity;
  }

  async removeCrud(actor: Actor, id: number) {
    const entity = await this.findOne(id);

    assertCanManageOwnedResource({
      actor,
      ownerId: entity.id,
      errorMessage: 'Недостаточно прав',
    });

    await entity.destroy();
    return { deleted: true };
  }

  async setEmailVerificationToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
  ) {
    await this.userRepo.update(
      {
        emailVerificationTokenHash: tokenHash,
        emailVerificationTokenExpiresAt: expiresAt,
      },
      { where: { id: userId } },
    );
  }

  async markEmailVerified(userId: number) {
    await this.userRepo.update(
      {
        isEmailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationTokenExpiresAt: null,
      },
      { where: { id: userId } },
    );
  }

  async setRefreshToken(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(
      { refreshTokenHash: hash },
      { where: { id: userId } },
    );
  }

  async clearRefreshToken(userId: number) {
    await this.userRepo.update(
      { refreshTokenHash: null },
      { where: { id: userId } },
    );
  }

  async addRole(dto: AddRoleDto): Promise<AddRoleDto> {
    const user = await this.findOne(dto.userId);
    const role = await this.roleService.getRoleByValue(dto.value);

    if (role && user) {
      await user.$add('role', role.id);
      return dto;
    }

    throw new HttpException(
      'Пользователь или роль не найдены',
      HttpStatus.BAD_REQUEST,
    );
  }

  async removeRole(dto: AddRoleDto): Promise<AddRoleDto> {
    const user = await this.findOne(dto.userId);
    const role = await this.roleService.getRoleByValue(dto.value);

    if (role && user) {
      await user.$remove('role', role.id);
      return dto;
    }

    throw new HttpException(
      'Пользователь или роль не найдены',
      HttpStatus.BAD_REQUEST,
    );
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserCreationAttrs } from 'src/common/models/User.model';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userRepo: typeof User) {}

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
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
      role: dto.role,
      isEmailVerified: dto.isEmailVerified ?? false,
      country: dto.country,
      region: dto.region,
      district: dto.district,
      isEstate: dto.isEstate,
      estateType: dto.estateType,
      settlement: dto.settlement,
    };

    return this.userRepo.create(data);
  }

  async updateCrud(id: number, dto: UpdateUserDto) {
    const entity = await this.findOne(id);

    const patch: Partial<UserCreationAttrs> = {
      email: dto.email,
      name: dto.name,
      role: dto.role,
      isEmailVerified: dto.isEmailVerified,
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

  async removeCrud(id: number) {
    const entity = await this.findOne(id);
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
}

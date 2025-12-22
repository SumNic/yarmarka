import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserCreationAttrs } from 'src/common/models/User.model';
import * as bcrypt from 'bcrypt';

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

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from 'src/common/dto/login.dto';
import { RegisterDto } from 'src/common/dto/register.dto';
import { ChangePasswordDto } from 'src/common/dto/change-password.dto';
import { RequestPasswordResetDto } from 'src/common/dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from 'src/common/dto/confirm-password-reset.dto';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/common/services/mail.service';
import { Role } from 'src/common/models/Role.model';
import { ResendConfirmationStatus } from 'src/common/types/types';
import { ResendConfirmationResponseDto } from 'src/common/dto/resend-confirmation-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const candidate = await this.usersService.findByEmail(dto.email);

    if (candidate && !candidate.isEmailVerified) {
      throw new ConflictException('EMAIL_EXISTS_NOT_VERIFIED');
    }

    if (candidate && candidate.isEmailVerified) {
      throw new ConflictException(
        'Этот адрес электронной почты уже зарегистрирован',
      );
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      password: hash,
      name: dto.name,
    });

    await this.issueEmailConfirmation(user.id, user.email);

    return { status: 'ok' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException(
        'Неверный адрес электронной почты или пароль',
      );
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException('Адрес электронной почты не подтвержден');
    }

    const passwordEquals = await bcrypt.compare(dto.password, user.password);
    if (!passwordEquals) {
      throw new UnauthorizedException(
        'Неверный адрес электронной почты или пароль',
      );
    }

    const { accessToken, refreshToken } = this.generateTokens(user);
    await this.usersService.setRefreshToken(user.id, refreshToken);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refresh(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Недействительный токен');
    }

    const refreshEquals = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!refreshEquals) {
      throw new UnauthorizedException('Недействительный токен');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      this.generateTokens(user);
    await this.usersService.setRefreshToken(user.id, newRefreshToken);

    return { access_token: accessToken, refresh_token: newRefreshToken };
  }

  async logout(userId: number) {
    await this.usersService.clearRefreshToken(userId);
    return { status: 'ok' };
  }

  async confirmEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Требуется токен');
    }

    const tokenHash = this.sha256(token);
    const user =
      await this.usersService.findByEmailVerificationTokenHash(tokenHash);

    if (!user) {
      throw new BadRequestException('Недействительный токен');
    }

    if (
      !user.emailVerificationTokenExpiresAt ||
      user.emailVerificationTokenExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Срок действия токена истек');
    }

    await this.usersService.markEmailVerified(user.id);

    return { status: 'ok' };
  }

  async me(userId: number) {
    return await this.usersService.findById(userId);
  }

  async resendConfirmation(email: string) {
    console.log(email, 'email');

    const user = await this.usersService.findByEmail(email);
    if (!user || user.isEmailVerified) {
      // не палим существование email
      return { status: ResendConfirmationStatus.OK };
    }

    const expiresAt = user.emailVerificationTokenExpiresAt;

    if (expiresAt && expiresAt.getTime() > Date.now()) {
      const secondsLeft = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);

      return {
        status: ResendConfirmationStatus.COOLDOWN,
        secondsLeft,
      };
    }

    await this.issueEmailConfirmation(user.id, user.email);

    return { status: ResendConfirmationStatus.SENT };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const passwordEquals = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!passwordEquals) {
      throw new BadRequestException('Текущий пароль указан неверно');
    }

    const hash = await bcrypt.hash(dto.newPassword, 10);
    await user.update({ password: hash } as any);

    // На всякий случай инвалидируем refresh-token при смене пароля
    await this.usersService.clearRefreshToken(user.id);

    return { status: 'ok' };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      // не палим существование email
      return { status: 'ok' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.sha256(rawToken);

    const ttlSeconds = Number(
      this.configService.get<string>('PASSWORD_RESET_TOKEN_EXPIRATION'),
    );
    if (!ttlSeconds || Number.isNaN(ttlSeconds)) {
      throw new Error(
        `Срок действия токена восстановления пароля (PASSWORD_RESET_TOKEN_EXPIRATION) должен быть числом (в секундах)`,
      );
    }

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.usersService.setPasswordResetToken(
      user.id,
      tokenHash,
      expiresAt,
    );

    const domen = this.configService.get<string>('DOMEN');
    const resetUrl = `${domen}/auth/reset-password?token=${rawToken}`;

    await this.mailService.sendPasswordReset(user.email, resetUrl);

    return { status: 'ok' };
  }

  async confirmPasswordReset(dto: ConfirmPasswordResetDto) {
    if (!dto.token) {
      throw new BadRequestException('Требуется токен');
    }

    const tokenHash = this.sha256(dto.token);
    const user =
      await this.usersService.findByPasswordResetTokenHash(tokenHash);

    if (!user) {
      throw new BadRequestException('Недействительный токен');
    }

    if (
      !user.passwordResetTokenExpiresAt ||
      user.passwordResetTokenExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Срок действия токена истек');
    }

    const hash = await bcrypt.hash(dto.newPassword, 10);
    await user.update({ password: hash } as any);

    await this.usersService.clearPasswordResetToken(user.id);
    await this.usersService.clearRefreshToken(user.id);

    return { status: 'ok' };
  }

  private async issueEmailConfirmation(userId: number, email: string) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.sha256(rawToken);

    const ttlSeconds = Number(
      this.configService.get<string>('EMAIL_CONFIRM_TOKEN_EXPIRATION'),
    );
    if (!ttlSeconds || Number.isNaN(ttlSeconds)) {
      throw new Error(
        `Срок действия токена подтверждения электронной почты (EMAIL_CONFIRM_TOKEN_EXPIRATION) должен составлять ${ttlSeconds} секунд`,
      );
    }

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.usersService.setEmailVerificationToken(
      userId,
      tokenHash,
      expiresAt,
    );

    const domen = this.configService.get<string>('DOMEN');
    const confirmUrl = `${domen}/api/auth/confirm-email?token=${rawToken}`;

    await this.mailService.sendEmailConfirmation(email, confirmUrl);
  }

  private generateTokens(user: { id: number; email: string; roles: Role[] }) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.roles,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const refreshTtlSeconds = Number(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
    );
    if (!refreshSecret) {
      throw new Error('Переменная JWT_REFRESH_SECRET не установлена');
    }
    if (!refreshTtlSeconds || Number.isNaN(refreshTtlSeconds)) {
      throw new Error(
        'Параметр JWT_REFRESH_EXPIRATION должен быть числом (в секундах)',
      );
    }

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: `${refreshTtlSeconds}s`,
    });

    return { accessToken, refreshToken };
  }

  getClientUrl() {
    return this.configService.get<string>('CLIENT_URL');
  }

  isCookieSecure() {
    return this.configService.get<string>('COOKIE_SECURE') === 'true';
  }

  private sha256(value: string) {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  async getEmailConfirmationStatus(email: string) {
    const user = await this.usersService.findByEmail(email);

    // Не палим существование email
    if (!user) {
      return { canResend: true };
    }

    if (user.isEmailVerified) {
      return { canResend: false, reason: 'already_verified' };
    }

    if (!user.emailVerificationTokenExpiresAt) {
      return { canResend: true };
    }

    const now = Date.now();
    const expiresAt = user.emailVerificationTokenExpiresAt.getTime();

    if (expiresAt > now) {
      const secondsLeft = Math.ceil((expiresAt - now) / 1000);

      return {
        canResend: false,
        reason: 'cooldown',
        secondsLeft,
      };
    }

    return { canResend: true };
  }
}

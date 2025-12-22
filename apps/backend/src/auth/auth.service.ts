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
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/common/services/mail.service';

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
    if (candidate) {
      await this.issueEmailConfirmation(candidate.id, candidate.email);
      throw new ConflictException('Email already registered');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      password: hash,
      name: dto.name,
    });
    console.log(user.id, user.email, 'user.id, user.email');

    await this.issueEmailConfirmation(user.id, user.email);

    return { status: 'ok' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException('Email not verified');
    }

    const passwordEquals = await bcrypt.compare(dto.password, user.password);
    if (!passwordEquals) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { accessToken, refreshToken } = this.generateTokens(user);
    await this.usersService.setRefreshToken(user.id, refreshToken);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refresh(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshEquals = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!refreshEquals) {
      throw new UnauthorizedException('Invalid refresh token');
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
      throw new BadRequestException('Token is required');
    }

    const tokenHash = this.sha256(token);
    const user =
      await this.usersService.findByEmailVerificationTokenHash(tokenHash);

    if (!user) {
      throw new BadRequestException('Invalid token');
    }
    console.log(
      user?.emailVerificationTokenExpiresAt?.getTime(),
      Date.now(),
      'user.emailVerificationTokenExpiresAt.getTime(), Date.now()',
    );

    if (
      !user.emailVerificationTokenExpiresAt ||
      user.emailVerificationTokenExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Token expired');
    }

    await this.usersService.markEmailVerified(user.id);

    return { status: 'ok' };
  }

  async resendConfirmation(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // не палим существование email
      return { status: 'ok' };
    }

    if (user.isEmailVerified) {
      return { status: 'ok' };
    }

    await this.issueEmailConfirmation(user.id, user.email);

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
        `EMAIL_CONFIRM_TOKEN_EXPIRATION must be a ${ttlSeconds} (seconds)`,
      );
    }

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.usersService.setEmailVerificationToken(
      userId,
      tokenHash,
      expiresAt,
    );

    const domen = this.configService.get<string>('DOMEN');
    const confirmUrl = `${domen}/auth/confirm-email?token=${rawToken}`;

    await this.mailService.sendEmailConfirmation(email, confirmUrl);
  }

  private generateTokens(user: { id: number; email: string; role: string }) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const refreshTtlSeconds = Number(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
    );
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not set');
    }
    if (!refreshTtlSeconds || Number.isNaN(refreshTtlSeconds)) {
      throw new Error('JWT_REFRESH_EXPIRATION must be a number (seconds)');
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
}

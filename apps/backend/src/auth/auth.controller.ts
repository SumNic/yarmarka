import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from 'src/common/dto/register.dto';
import { LoginDto } from 'src/common/dto/login.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { JwtRefreshGuard } from 'src/auth/guards/jwt-refresh.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ResendConfirmationDto } from 'src/common/dto/resend-confirmation.dto';
import { JwtPayload } from 'src/auth/guards/jwt.strategy';
import { JwtRefreshPayload } from 'src/auth/guards/jwt-refresh.strategy';

type RequestWithUser = Request & { user?: JwtPayload };
type RequestWithRefreshUser = Request & { user?: JwtRefreshPayload };

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Успешная регистрация',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Неккоректные данные',
  })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Успешная авторизация',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Неккоректные данные',
  })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    console.log(result, 'result');

    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.authService.isCookieSecure(),
      path: '/auth',
    });

    return { access_token: result.access_token };
  }

  @ApiOperation({
    summary: 'Обновление access_token по refreshToken cookie (rotation)',
  })
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @Req() req: RequestWithRefreshUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;
    const refreshToken = user?.refreshToken;

    const result = await this.authService.refresh(user!.id, refreshToken!);

    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.authService.isCookieSecure(),
      path: '/auth',
    });

    return { access_token: result.access_token };
  }

  @ApiOperation({ summary: 'Logout (удаляет refresh token)' })
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logout(
    @Req() req: RequestWithRefreshUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;

    await this.authService.logout(user!.id);

    res.clearCookie('refreshToken', { path: '/auth' });

    return { status: 'ok' };
  }

  @ApiOperation({ summary: 'Подтверждение email' })
  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string, @Res() res: Response) {
    await this.authService.confirmEmail(token);

    const redirectUrl = `${this.authService.getClientUrl()}/auth/email-confirmed`;
    return res.redirect(302, redirectUrl);
  }

  @ApiOperation({ summary: 'Текущий пользователь (по access token)' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: RequestWithUser) {
    return req.user;
  }

  @ApiOperation({ summary: 'Повторная отправка письма подтверждения' })
  @Post('resend-confirmation')
  resendConfirmation(@Body() dto: ResendConfirmationDto) {
    return this.authService.resendConfirmation(dto.email);
  }
}

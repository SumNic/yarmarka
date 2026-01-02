// support.controller.ts
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportMessageDto } from 'src/support/dto/support.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/auth/guards/jwt.strategy';

type RequestWithUser = Request & { user?: JwtPayload };

@ApiTags('Поддержка')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendMessage(@Req() req: RequestWithUser, @Body() dto: SupportMessageDto) {
    await this.supportService.sendSupportMessage(req.user!.email, dto);
    return { ok: true };
  }
}

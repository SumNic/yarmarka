// support.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/common/services/mail.service';
import { SupportMessageDto } from 'src/support/dto/support.dto';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    private readonly mailService: MailService,
    private configService: ConfigService,
  ) {}

  async sendSupportMessage(userEmail: string, dto: SupportMessageDto) {
    await this.mailService.sendSupportEmail({
      fromEmail: userEmail,
      message: dto.message,
      to: this.configService.get<string>('SMTP_USER') || '',
    });

    this.logger.log(`Support message from ${userEmail}`);
  }
}

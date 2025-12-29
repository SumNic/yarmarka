import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.from = this.configService.get<string>('SMTP_FROM') || user || '';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendEmailConfirmation(to: string, confirmUrl: string) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Подтверждение email',
      text: `Подтвердите email, перейдя по ссылке: ${confirmUrl}`,
      html: `Подтвердите email, перейдя по ссылке: <a href="${confirmUrl}">${confirmUrl}</a>`,
    });

    this.logger.log(`Email confirmation sent to ${to}`);
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Восстановление пароля',
      text: `Для сброса пароля перейдите по ссылке: ${resetUrl}`,
      html: `Для сброса пароля перейдите по ссылке: <a href="${resetUrl}">${resetUrl}</a>`,
    });

    this.logger.log(`Password reset email sent to ${to}`);
  }
}

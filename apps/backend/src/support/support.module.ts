import { Module } from '@nestjs/common';
import { MailService } from 'src/common/services/mail.service';
import { SupportController } from 'src/support/support.controller';
import { SupportService } from 'src/support/support.service';

@Module({
  imports: [],
  controllers: [SupportController],
  providers: [SupportService, MailService],
  exports: [SupportService],
})
export class SupportModule {}

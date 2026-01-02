import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResendConfirmationStatus } from 'src/common/types/types';

export class ResendConfirmationResponseDto {
  @ApiProperty({
    enum: ResendConfirmationStatus,
    example: ResendConfirmationStatus.SENT,
  })
  status: ResendConfirmationStatus;

  @ApiPropertyOptional({
    description: 'Оставшееся время ожидания в секундах (только для cooldown)',
    example: 42,
  })
  secondsLeft?: number;
}

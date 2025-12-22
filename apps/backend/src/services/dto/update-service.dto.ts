import { PartialType } from '@nestjs/swagger';
import { CreateServiceDto } from 'src/services/dto/create-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}

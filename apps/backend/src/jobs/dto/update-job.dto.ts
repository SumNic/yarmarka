import { PartialType } from '@nestjs/swagger';
import { CreateJobDto } from 'src/jobs/dto/create-job.dto';

export class UpdateJobDto extends PartialType(CreateJobDto) {}

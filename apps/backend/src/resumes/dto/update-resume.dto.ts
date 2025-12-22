import { PartialType } from '@nestjs/swagger';
import { CreateResumeDto } from 'src/resumes/dto/create-resume.dto';

export class UpdateResumeDto extends PartialType(CreateResumeDto) {}

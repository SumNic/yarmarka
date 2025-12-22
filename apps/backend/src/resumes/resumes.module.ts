import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Resume } from 'src/common/models/Resume.model';
import { ResumesController } from 'src/resumes/resumes.controller';
import { ResumesService } from 'src/resumes/resumes.service';

@Module({
  imports: [SequelizeModule.forFeature([Resume])],
  controllers: [ResumesController],
  providers: [ResumesService],
  exports: [ResumesService],
})
export class ResumesModule {}

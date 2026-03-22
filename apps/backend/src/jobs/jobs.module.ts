import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Job } from 'src/common/models/Job.model';
import { S3Service } from 'src/common/services/s3.service';
import { JobsController } from 'src/jobs/jobs.controller';
import { JobsService } from 'src/jobs/jobs.service';

@Module({
  imports: [SequelizeModule.forFeature([Job])],
  controllers: [JobsController],
  providers: [JobsService, S3Service],
  exports: [JobsService],
})
export class JobsModule {}

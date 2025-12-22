import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Job } from 'src/common/models/Job.model';
import { JobsController } from 'src/jobs/jobs.controller';
import { JobsService } from 'src/jobs/jobs.service';

@Module({
  imports: [SequelizeModule.forFeature([Job])],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}

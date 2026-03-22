import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Service } from 'src/common/models/Service.model';
import { S3Service } from 'src/common/services/s3.service';
import { ServicesController } from 'src/services/services.controller';
import { ServicesService } from 'src/services/services.service';

@Module({
  imports: [SequelizeModule.forFeature([Service])],
  controllers: [ServicesController],
  providers: [ServicesService, S3Service],
  exports: [ServicesService],
})
export class ServicesModule {}

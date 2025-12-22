import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Service } from 'src/common/models/Service.model';
import { ServicesController } from 'src/services/services.controller';
import { ServicesService } from 'src/services/services.service';

@Module({
  imports: [SequelizeModule.forFeature([Service])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}

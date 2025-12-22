import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServicesService } from 'src/services/services.service';
import { CreateServiceDto } from 'src/services/dto/create-service.dto';
import { UpdateServiceDto } from 'src/services/dto/update-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @ApiTags('Услуги')
  @ApiOperation({ summary: 'Создание услуги' })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Услуга создана' })
  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @ApiTags('Услуги')
  @ApiOperation({ summary: 'Список услуг' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список услуг' })
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @ApiTags('Услуги')
  @ApiOperation({ summary: 'Получить услугу по id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Услуга' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Услуга не найдена',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findOne(id);
  }

  @ApiTags('Услуги')
  @ApiOperation({ summary: 'Обновить услугу' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateServiceDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Услуга обновлена' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @ApiTags('Услуги')
  @ApiOperation({ summary: 'Удалить услугу' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Услуга удалена' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.remove(id);
  }
}

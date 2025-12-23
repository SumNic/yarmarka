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
  Req,
  UseGuards,
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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { JwtPayload } from 'src/auth/guards/jwt.strategy';

type RequestWithUser = Request & { user?: JwtPayload };

@ApiTags('Услуги')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @ApiOperation({ summary: 'Создание услуги' })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Услуга создана' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateServiceDto) {
    return this.servicesService.create(req.user!.id, dto);
  }

  @ApiOperation({ summary: 'Список услуг' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список услуг' })
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

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

  @ApiOperation({ summary: 'Обновить услугу' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateServiceDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Услуга обновлена' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(req.user!, id, dto);
  }

  @ApiOperation({ summary: 'Удалить услугу' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Услуга удалена' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.servicesService.remove(req.user!, id);
  }
}

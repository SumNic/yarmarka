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
import { JobsService } from 'src/jobs/jobs.service';
import { CreateJobDto } from 'src/jobs/dto/create-job.dto';
import { UpdateJobDto } from 'src/jobs/dto/update-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiTags('Вакансии')
  @ApiOperation({ summary: 'Создание вакансии' })
  @ApiBody({ type: CreateJobDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Вакансия создана' })
  @Post()
  create(@Body() dto: CreateJobDto) {
    return this.jobsService.create(dto);
  }

  @ApiTags('Вакансии')
  @ApiOperation({ summary: 'Список вакансий' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список вакансий' })
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @ApiTags('Вакансии')
  @ApiOperation({ summary: 'Получить вакансию по id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Вакансия' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Вакансия не найдена',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findOne(id);
  }

  @ApiTags('Вакансии')
  @ApiOperation({ summary: 'Обновить вакансию' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateJobDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Вакансия обновлена' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateJobDto) {
    return this.jobsService.update(id, dto);
  }

  @ApiTags('Вакансии')
  @ApiOperation({ summary: 'Удалить вакансию' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Вакансия удалена' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.remove(id);
  }
}

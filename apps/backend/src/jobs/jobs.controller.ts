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
import { JobsService } from 'src/jobs/jobs.service';
import { CreateJobDto } from 'src/jobs/dto/create-job.dto';
import { UpdateJobDto } from 'src/jobs/dto/update-job.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { JwtPayload } from 'src/auth/guards/jwt.strategy';

type RequestWithUser = Request & { user?: JwtPayload };

@ApiTags('Вакансии')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiOperation({ summary: 'Создание вакансии' })
  @ApiBody({ type: CreateJobDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Вакансия создана' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateJobDto) {
    return this.jobsService.create(req.user!.id, dto);
  }

  @ApiOperation({ summary: 'Список вакансий' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список вакансий' })
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

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

  @ApiOperation({ summary: 'Обновить вакансию' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateJobDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Вакансия обновлена' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.update(req.user!, id, dto);
  }

  @ApiOperation({ summary: 'Удалить вакансию' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Вакансия удалена' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.jobsService.remove(req.user!, id);
  }
}

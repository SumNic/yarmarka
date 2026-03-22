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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JobsService } from 'src/jobs/jobs.service';
import { CreateJobDto } from 'src/jobs/dto/create-job.dto';
import { UpdateJobDto } from 'src/jobs/dto/update-job.dto';
import { S3Service } from 'src/common/services/s3.service';
import { UploadResultDto } from 'src/common/dto/upload.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { JwtPayload } from 'src/auth/guards/jwt.strategy';

type RequestWithUser = Request & { user?: JwtPayload };

@ApiTags('Вакансии')
@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly s3Service: S3Service,
  ) {}

  @ApiOperation({ summary: 'Создание вакансии' })
  @ApiBody({ type: CreateJobDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Вакансия создана' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateJobDto) {
    return this.jobsService.create(req.user!.id, dto);
  }

  @ApiOperation({ summary: 'Загрузить фото вакансии (до 10 шт.)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({ status: HttpStatus.OK, type: [UploadResultDto] })
  @UseGuards(JwtAuthGuard)
  @Post(':id/photos')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadJobPhotos(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const job = await this.jobsService.findOneForActor(req.user!, id);

    const uploads = await Promise.all(
      (files ?? []).slice(0, 10).map((file) =>
        this.s3Service.uploadPublicImage({
          folder: `jobs/${id}`,
          file,
        }),
      ),
    );

    const photoUrls = job.photoUrls;
    const existing = Array.isArray(photoUrls) ? photoUrls : [];

    const merged = [...existing, ...uploads.map((u) => u.url)].slice(0, 10);

    await this.jobsService.update(req.user!, id, {
      photoUrls: merged,
    } as any);

    return uploads.map((u) => ({ key: u.key, url: u.url }));
  }

  @ApiOperation({ summary: 'Список вакансий' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список вакансий' })
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @ApiOperation({ summary: 'Мои вакансии' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список вакансий пользователя' })
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMy(@Req() req: RequestWithUser) {
    return this.jobsService.findByUserId(req.user!.id);
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

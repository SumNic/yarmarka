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
import { ResumesService } from 'src/resumes/resumes.service';
import { CreateResumeDto } from 'src/resumes/dto/create-resume.dto';
import { UpdateResumeDto } from 'src/resumes/dto/update-resume.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { JwtPayload } from 'src/auth/guards/jwt.strategy';

type RequestWithUser = Request & { user?: JwtPayload };

@ApiTags('Резюме')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @ApiOperation({ summary: 'Создание резюме' })
  @ApiBody({ type: CreateResumeDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Резюме создано' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateResumeDto) {
    return this.resumesService.create(req.user!.id, dto);
  }

  @ApiOperation({ summary: 'Список резюме' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список резюме' })
  @Get()
  findAll() {
    return this.resumesService.findAll();
  }

  @ApiOperation({ summary: 'Получить резюме по id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Резюме' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Резюме не найдено',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.resumesService.findOne(id);
  }

  @ApiOperation({ summary: 'Обновить резюме' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateResumeDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Резюме обновлено' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResumeDto,
  ) {
    return this.resumesService.update(req.user!, id, dto);
  }

  @ApiOperation({ summary: 'Удалить резюме' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Резюме удалено' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.resumesService.remove(req.user!, id);
  }
}

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
import { ResumesService } from 'src/resumes/resumes.service';
import { CreateResumeDto } from 'src/resumes/dto/create-resume.dto';
import { UpdateResumeDto } from 'src/resumes/dto/update-resume.dto';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @ApiTags('Резюме')
  @ApiOperation({ summary: 'Создание резюме' })
  @ApiBody({ type: CreateResumeDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Резюме создано' })
  @Post()
  create(@Body() dto: CreateResumeDto) {
    return this.resumesService.create(dto);
  }

  @ApiTags('Резюме')
  @ApiOperation({ summary: 'Список резюме' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список резюме' })
  @Get()
  findAll() {
    return this.resumesService.findAll();
  }

  @ApiTags('Резюме')
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

  @ApiTags('Резюме')
  @ApiOperation({ summary: 'Обновить резюме' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateResumeDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Резюме обновлено' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateResumeDto) {
    return this.resumesService.update(id, dto);
  }

  @ApiTags('Резюме')
  @ApiOperation({ summary: 'Удалить резюме' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Резюме удалено' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.resumesService.remove(id);
  }
}

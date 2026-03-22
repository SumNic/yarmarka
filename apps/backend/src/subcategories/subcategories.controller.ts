import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubcategoriesService } from './subcategories.service';
import { CreateSubcategoriesDto, GetSubcategoriesDto } from './dto/create-subcategories.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles-auth.decorator';
import { ROLES } from 'src/common/constants/roles';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CategoryType } from 'src/common/models/Subcategory.model';

@ApiTags('Subcategories')
@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Добавить подкатегории (только для админа)' })
  async create(@Body() dto: CreateSubcategoriesDto) {
    return this.subcategoriesService.create(dto.subcategories);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все подкатегории' })
  async findAll(@Query() query: GetSubcategoriesDto) {
    return this.subcategoriesService.findAll(query.type);
  }

  @Get('products')
  @ApiOperation({ summary: 'Получить подкатегории для товаров' })
  async getProducts() {
    return this.subcategoriesService.findByType(CategoryType.PRODUCT);
  }

  @Get('services')
  @ApiOperation({ summary: 'Получить подкатегории для услуг' })
  async getServices() {
    return this.subcategoriesService.findByType(CategoryType.SERVICE);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Получить подкатегории для вакансий' })
  async getJobs() {
    return this.subcategoriesService.findByType(CategoryType.JOB);
  }

  @Get('custom')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить пользовательские подкатегории' })
  async getCustom(@Query('type') type: CategoryType) {
    return this.subcategoriesService.getCustomByType(type);
  }
}

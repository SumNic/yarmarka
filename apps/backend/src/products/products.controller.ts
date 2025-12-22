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
import { ProductsService } from 'src/products/products.service';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiTags('Товары')
  @ApiOperation({ summary: 'Создание товара' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Товар создан' })
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @ApiTags('Товары')
  @ApiOperation({ summary: 'Список товаров' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список товаров' })
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @ApiTags('Товары')
  @ApiOperation({ summary: 'Получить товар по id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Товар' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Товар не найден' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @ApiTags('Товары')
  @ApiOperation({ summary: 'Обновить товар' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Товар обновлён' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @ApiTags('Товары')
  @ApiOperation({ summary: 'Удалить товар' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Товар удалён' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}

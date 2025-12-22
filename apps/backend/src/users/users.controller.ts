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
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiTags('Пользователи')
  @ApiOperation({ summary: 'Создание пользователя' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Пользователь создан',
  })
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createCrud(dto);
  }

  @ApiTags('Пользователи')
  @ApiOperation({ summary: 'Список пользователей' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список пользователей',
  })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiTags('Пользователи')
  @ApiOperation({ summary: 'Получить пользователя по id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Пользователь',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Пользователь не найден',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @ApiTags('Пользователи')
  @ApiOperation({ summary: 'Обновить пользователя' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Пользователь обновлён',
  })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.updateCrud(id, dto);
  }

  @ApiTags('Пользователи')
  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Пользователь удалён',
  })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.removeCrud(id);
  }
}

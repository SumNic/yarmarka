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
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { S3Service } from 'src/common/services/s3.service';
import { UploadResultDto } from 'src/common/dto/upload.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { JwtPayload } from 'src/auth/guards/jwt.strategy';
import { AddRoleDto } from 'src/users/dto/add-role.dto';
import { Roles } from 'src/auth/guards/roles-auth.decorator';
import { ROLES } from 'src/common/constants/roles';
import { RolesGuard } from 'src/auth/guards/roles.guard';

type RequestWithUser = Request & { user?: JwtPayload };

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
  ) {}

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

  @ApiOperation({ summary: 'Загрузить фото/аватар пользователя' })
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: HttpStatus.OK, type: UploadResultDto })
  @UseGuards(JwtAuthGuard)
  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserPhoto(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const upload = await this.s3Service.uploadPublicImage({
      folder: `users/${id}`,
      file,
    });

    await this.usersService.updateCrud(req.user!, id, {
      photoUrl: upload.url,
    } as any);

    return { key: upload.key, url: upload.url };
  }

  @ApiOperation({ summary: 'Список пользователей' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список пользователей',
  })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

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

  @ApiOperation({ summary: 'Обновить пользователя' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Пользователь обновлён',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateCrud(req.user!, id, dto);
  }

  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Пользователь удалён',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.removeCrud(req.user!, id);
  }

  @ApiOperation({
    summary: 'Добавить роль пользователю',
  })
  @ApiBody({
    type: AddRoleDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Операция прошла успешно.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'JWT токен не указан в заголовках',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Некоректный JWT токен или роль пользователя',
  })
  @Roles(ROLES.ADMIN)
  @UseGuards(RolesGuard)
  @Post('/add-role')
  async userAddRole(@Body() dto: AddRoleDto): Promise<AddRoleDto> {
    return await this.usersService.addRole(dto);
  }

  @ApiOperation({
    summary: 'Удалить роль у пользователя',
  })
  @ApiBody({
    type: AddRoleDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Операция прошла успешно.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'JWT токен не указан в заголовках',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Некоректный JWT токен или роль пользователя',
  })
  @Roles(ROLES.ADMIN)
  @UseGuards(RolesGuard)
  @Delete('/remove-role')
  async userRemoveRole(@Body() dto: AddRoleDto): Promise<AddRoleDto> {
    return await this.usersService.removeRole(dto);
  }
}

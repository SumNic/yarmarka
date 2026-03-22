import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { CreateLocationsDto } from './dto/create-locations.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles-auth.decorator';
import { ROLES } from 'src/common/constants/roles';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Добавить локации (только для админа)' })
  async create(@Body() dto: CreateLocationsDto) {
    return this.locationsService.create(dto.locations);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все локации' })
  async findAll() {
    return this.locationsService.findAll();
  }

  @Get('countries')
  @ApiOperation({ summary: 'Получить список стран' })
  async getCountries() {
    return this.locationsService.getCountries();
  }

  @Get('countries/:country/regions')
  @ApiOperation({ summary: 'Получить список регионов по стране' })
  async getRegionsByCountry(@Param('country') country: string) {
    return this.locationsService.getRegionsByCountry(decodeURIComponent(country));
  }

  @Get('countries/:country/regions/:region/localities')
  @ApiOperation({ summary: 'Получить список районов по региону' })
  async getLocalitiesByRegion(
    @Param('country') country: string,
    @Param('region') region: string,
  ) {
    return this.locationsService.getLocalitiesByRegion(
      decodeURIComponent(country),
      decodeURIComponent(region),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить локацию по ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.locationsService.findOne(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Удалить локацию (только для админа)' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.locationsService.delete(id);
    return { deleted: true };
  }
}

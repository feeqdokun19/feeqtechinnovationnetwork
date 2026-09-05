import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';


@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROVIDER')
  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto,
    @Req() request: any,
  ) {
    return this.servicesService.create(
      createServiceDto,
      request.user.id,
      request.user.role,
    );
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  // IMPORTANT: Keep this route before :id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROVIDER')
  @Get('provider/my-services')
  findMyServices(@Req() request: any) {
    return this.servicesService.findProviderServices(
      request.user.id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROVIDER')
  @Patch(':id')
  updateService(
    @Param('id') serviceId: string,
    @Req() request: any,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.updateService(
      serviceId,
      request.user.id,
      updateServiceDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROVIDER')
  @Patch(':id/status')
  updateServiceStatus(
    @Param('id') serviceId: string,
    @Req() request: any,
    @Body()
    body: {
      status: 'ACTIVE' | 'INACTIVE';
    },
  ) {
    return this.servicesService.updateServiceStatus(
      serviceId,
      request.user.id,
      body.status,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }
}
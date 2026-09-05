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
import { OrdersService } from './orders.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('CUSTOMER')
  createOrder(
    @Req() request: any,
    @Body()
    body: {
      serviceId: string;
      notes?: string;
    },
  ) {
    return this.ordersService.createOrder(
      request.user.id,
      body.serviceId,
      body.notes,
    );
  }

  @Get()
  @Roles('CUSTOMER')
  getMyOrders(@Req() request: any) {
    return this.ordersService.getCustomerOrders(
      request.user.id,
    );
  }

  @Get('provider')
  @Roles('PROVIDER')
  getProviderOrders(@Req() request: any) {
    return this.ordersService.getProviderOrders(
      request.user.id,
    );
  }

  @Get(':id')
  getOrder(
    @Param('id') orderId: string,
    @Req() request: any,
  ) {
    return this.ordersService.getOrderById(
      orderId,
      request.user.id,
    );
  }

  @Patch(':id/status')
  @Roles('PROVIDER')
  updateStatus(
    @Param('id') orderId: string,
    @Req() request: any,
    @Body()
    body: {
      status: 'IN_PROGRESS' | 'COMPLETED';
    },
  ) {
    return this.ordersService.updateStatus(
      orderId,
      request.user.id,
      body.status,
    );
  }
}
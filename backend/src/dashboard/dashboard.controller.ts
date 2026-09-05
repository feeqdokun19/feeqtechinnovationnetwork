import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('customer')
  @Roles('CUSTOMER')
  getCustomerDashboard(@Req() request: any) {
    return this.dashboardService.getCustomerDashboard(
      request.user.id,
    );
  }

  @Get('provider')
  @Roles('PROVIDER')
  getProviderDashboard(@Req() request: any) {
    return this.dashboardService.getProviderDashboard(
      request.user.id,
    );
  }
}

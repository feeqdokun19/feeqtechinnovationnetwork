import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  @Post()
  create(
    @Body() createReviewDto: CreateReviewDto,
    @Req() request: any,
  ) {
    return this.reviewsService.create(
      request.user.id,
      createReviewDto,
    );
  }

  @Get('service/:serviceId')
  findServiceReviews(@Param('serviceId') serviceId: string) {
    return this.reviewsService.findServiceReviews(serviceId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  @Get('my-reviews')
  findMyReviews(@Req() request: any) {
    return this.reviewsService.findMyReviews(
      request.user.id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROVIDER')
  @Get('provider')
  findProviderReviews(@Req() request: any) {
    return this.reviewsService.findProviderReviews(
      request.user.id,
    );
  }
}

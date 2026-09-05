import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(customerId: string, createReviewDto: CreateReviewDto) {
    const { serviceId, rating, comment } = createReviewDto;

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const completedOrder = await this.prisma.order.findFirst({
      where: {
        customerId,
        serviceId,
        status: 'COMPLETED',
      },
    });

    if (!completedOrder) {
      throw new ForbiddenException(
        'You can only review a service after completing an order',
      );
    }

    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId: customerId,
        serviceId,
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this service',
      );
    }

    return this.prisma.review.create({
      data: {
        rating,
        comment,
        userId: customerId,
        serviceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findServiceReviews(serviceId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const reviews = await this.prisma.review.findMany({
      where: {
        serviceId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews;

    return {
      service: {
        id: service.id,
        title: service.title,
      },
      summary: {
        totalReviews,
        averageRating: Number(averageRating.toFixed(1)),
      },
      reviews,
    };
  }

  async findMyReviews(customerId: string) {
    return this.prisma.review.findMany({
      where: {
        userId: customerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });
  }

  async findProviderReviews(providerId: string) {
    return this.prisma.review.findMany({
      where: {
        service: {
          providerId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
}
